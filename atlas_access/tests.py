import re
import secrets
from datetime import timedelta
from unittest.mock import patch
from urllib.parse import urlsplit

from allauth.mfa.models import Authenticator
from allauth.mfa.recovery_codes.internal.auth import RecoveryCodes
from allauth.mfa.totp.internal.auth import format_hotp_value, hotp_value
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core import mail
from django.test import Client, TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from .accounts import create_invitation
from .models import AccessEvent, AccessPolicy, GuestCode, GuestSession, Membership
from .viewer import inventory
from .views import digest


class AccessTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        AccessPolicy.objects.filter(pk=1).update(lockdown_enabled=True)
        cls.password = secrets.token_urlsafe(24)
        cls.owner, cls.viewer, cls.pending = [
            get_user_model().objects.create_user(email=email, username=email, password=cls.password)
            for email in ("owner@example.test", "viewer@example.test", "pending@example.test")
        ]
        Membership.objects.create(user=cls.owner, role="owner", active=True)
        Membership.objects.create(user=cls.viewer, role="viewer", active=True)
        Membership.objects.create(user=cls.pending, role="viewer")
        cls.media = "/" + next(iter(sorted(path for path in inventory() if path.endswith(".jpg"))))

    def full(self, client, expected):
        for path in ("/data.js", "/measurements_data.js", "/restored_media.js", self.media):
            with self.subTest(path=path):
                response = client.get(path)
                self.assertEqual(response.status_code, 200 if expected else 404)
                self.assertIn("no-store", response["Cache-Control"])
                response.close()
        for path in ("/classified.html", "/research/historical/an2_evidence_audit_20261022.json", "/.git/config"):
            self.assertEqual(client.get(path).status_code, 404)

    def sign_in_owner(self):
        owner = Client()
        owner.post(reverse("account_login"), {"login": self.owner.email, "password": self.password})
        enroll = owner.get(reverse("mfa_activate_totp"))
        if enroll.status_code == 302:
            enroll = owner.post(enroll["Location"], {"password": self.password}, follow=True)
        self.assertEqual(enroll.status_code, 200)
        self.assertIn("form", enroll.context)
        value = format_hotp_value(hotp_value(enroll.context["form"].secret, int(timezone.now().timestamp()) // 30))
        response = owner.post(reverse("mfa_activate_totp"), {"code": value})
        self.assertRedirects(response, reverse("mfa_view_recovery_codes"), fetch_redirect_response=False)
        owner.post(reverse("atlas-sign-out"))
        start = owner.post(reverse("account_login"), {"login": self.owner.email, "password": self.password})
        self.assertRedirects(start, reverse("mfa_authenticate"), fetch_redirect_response=False)
        codes = RecoveryCodes(Authenticator.objects.get(user=self.owner, type=Authenticator.Type.RECOVERY_CODES))
        finish = owner.post(reverse("mfa_authenticate"), {"code": codes.get_unused_codes()[0]})
        self.assertRedirects(finish, "/", fetch_redirect_response=False)
        self.assertEqual(owner.get("/owner/").status_code, 200)
        return owner

    def test_private_viewer_pending_and_file_scope(self):
        anonymous = Client()
        self.assertContains(anonymous.get("/"), "Sign in")
        self.full(anonymous, False)
        viewer = Client()
        viewer.post(reverse("account_login"), {"login": self.viewer.email, "password": self.password})
        self.assertContains(viewer.get("/"), "Complete Master Collection")
        self.assertEqual(viewer.get("/owner/").status_code, 403)
        self.full(viewer, True)
        pending = Client()
        pending.force_login(self.pending)
        self.assertContains(pending.get("/"), "does not currently have Atlas viewing access")
        self.full(pending, False)
        viewer.post(reverse("atlas-sign-out"))
        self.full(viewer, False)

    def test_owner_mfa_recovery_and_mode_changes(self):
        password_only = Client()
        password_only.force_login(self.owner)
        self.assertRedirects(password_only.get("/owner/"), reverse("mfa_activate_totp"), fetch_redirect_response=False)
        self.assertEqual(password_only.post("/owner/", {"action": "mode", "mode": "limited_beta"}).status_code, 403)
        self.full(password_only, False)
        owner = self.sign_in_owner()
        anon = Client()
        fixture = {"AN2-F36": {"title": "Test specimen", "description": "Allowed description", "images": [self.media[1:]]}}
        with patch("atlas_access.views.showcase", return_value=fixture):
            beta = reverse("atlas-beta-image", args=("AN2-F36", 0))
            self.assertEqual(anon.get(beta).status_code, 404)
            owner.post("/owner/", {"action": "mode", "mode": "limited_beta"})
            self.assertContains(anon.get("/"), "Allowed description")
            self.assertEqual(anon.get(beta).status_code, 200)
            self.full(anon, False)
            owner.post("/owner/", {"action": "mode", "mode": "private"})
            self.assertNotContains(anon.get("/"), "Allowed description")
            self.assertEqual(anon.get(beta).status_code, 404)
        self.assertEqual(list(AccessEvent.objects.filter(actor=self.owner).values_list("detail", flat=True)),
                         ["Limited Beta", "Private"])

    def test_guest_lifecycle(self):
        owner = self.sign_in_owner()
        owner.post("/owner/", {"action": "enable-guests"})

        def generate():
            response = owner.post("/owner/", {"action": "new-code"})
            return re.search(r'id="new-code">([A-Za-z0-9_-]+)', response.content.decode())[1]

        code = generate()
        guest = Client()
        guest.post("/guest/redeem/", {"code": code})
        self.full(guest, True)
        self.assertEqual(guest.post("/owner/", {"action": "mode"}).status_code, 302)
        replay = Client()
        replay.post("/guest/redeem/", {"code": code})
        self.full(replay, False)
        row = GuestCode.objects.get(digest=digest("atlas-code", code))
        owner.post("/owner/", {"action": "revoke-session", "id": row.pk})
        self.full(guest, False)
        next_code = generate()
        guest.post("/guest/redeem/", {"code": next_code})
        self.full(guest, True)
        owner.post("/owner/", {"action": "disable-guests"})
        owner.post("/owner/", {"action": "enable-guests"})
        self.full(guest, False)
        unused = generate()
        GuestCode.objects.filter(digest=digest("atlas-code", unused)).update(expires_at=timezone.now() - timedelta(seconds=1))
        guest.post("/guest/redeem/", {"code": unused})
        self.full(guest, False)

        revoked = generate()
        revoked_row = GuestCode.objects.get(digest=digest("atlas-code", revoked))
        owner.post("/owner/", {"action": "revoke-code", "id": revoked_row.pk})
        guest.post("/guest/redeem/", {"code": revoked})
        self.full(guest, False)

        expiring = generate()
        guest.post("/guest/redeem/", {"code": expiring})
        self.full(guest, True)
        GuestSession.objects.filter(pk=guest.session["atlas_guest"]).update(expires_at=timezone.now())
        self.full(guest, False)
        self.assertEqual(guest.post("/guest/redeem/", {"code": "invalid"}).status_code, 302)
        self.assertEqual(guest.post("/guest/redeem/", {"code": "invalid"}).status_code, 302)
        self.assertEqual(guest.post("/guest/redeem/", {"code": "invalid"}).status_code, 429)

    def reset_password(self, client, email):
        response = client.post(reverse("account_reset_password"), {"email": email})
        self.assertEqual(response.status_code, 302)
        reset_path = urlsplit(next(line for line in mail.outbox[-1].body.splitlines() if line.startswith("http"))).path
        step = client.get(reset_path)
        replacement = secrets.token_urlsafe(24)
        finish = client.post(step["Location"], {"password1": replacement, "password2": replacement})
        self.assertEqual(finish.status_code, 302)
        return replacement

    def test_owner_password_reset_retains_mfa(self):
        self.sign_in_owner()
        recovered = Client()
        replacement = self.reset_password(recovered, self.owner.email)
        response = recovered.post(reverse("account_login"), {"login": self.owner.email, "password": replacement})
        self.assertRedirects(response, reverse("mfa_authenticate"), fetch_redirect_response=False)
        self.full(recovered, False)
        codes = RecoveryCodes(Authenticator.objects.get(user=self.owner, type=Authenticator.Type.RECOVERY_CODES))
        recovered.post(reverse("mfa_authenticate"), {"code": codes.get_unused_codes()[0]})
        self.assertEqual(recovered.get("/owner/").status_code, 200)

    def test_invitation_activation_recovery_and_revocation(self):
        email = "invited@example.test"
        member = create_invitation(email, "viewer")
        invited = Client()
        self.assertFalse(member.active)
        reset = invited.post(reverse("account_reset_password"), {"email": email})
        self.assertEqual(reset.status_code, 302)
        self.assertEqual(len(mail.outbox), 1)
        url = urlsplit(mail.outbox[0].body.splitlines()[-1]).path
        step = invited.get(url)
        confirmed = invited.post(step["Location"], {"new_password1": self.password, "new_password2": self.password})
        self.assertRedirects(confirmed, reverse("account_login"), fetch_redirect_response=False)
        member.refresh_from_db()
        self.assertTrue(member.active)
        self.assertFalse(invited.get(url).context["validlink"])
        invited.post(reverse("account_login"), {"login": email, "password": self.password})
        self.full(invited, True)
        invited.post(reverse("atlas-sign-out"))
        replacement = self.reset_password(invited, email)
        self.assertEqual(len(mail.outbox), 2)
        invited.post(reverse("account_login"), {"login": email, "password": replacement})
        self.full(invited, True)
        owner = self.sign_in_owner()
        owner.post("/owner/", {"action": "revoke-viewer", "id": member.pk})
        self.full(invited, False)

    def test_csrf_and_private_empty_showcase(self):
        anon = Client(enforce_csrf_checks=True)
        self.assertEqual(anon.post("/guest/redeem/", {"code": "invalid"}).status_code, 403)
        self.assertEqual(anon.get("/sign-out/").status_code, 405)
        owner = self.sign_in_owner()
        owner.post("/owner/", {"action": "mode", "mode": "limited_beta"})
        self.assertContains(anon.get("/"), "No specimens have been approved")


    def test_lockdown_switch_preserves_the_public_landing_and_revokes_entry(self):
        owner = self.sign_in_owner()
        visitor = Client(enforce_csrf_checks=True)
        direct = Client()
        passphrase = secrets.token_hex(8)
        with override_settings(ATLAS_ENTRY_PASSPHRASE=passphrase):
            owner.post("/owner/", {"action": "disable-lockdown"})
            response = visitor.get("/")
            try:
                self.assertEqual(b"".join(response.streaming_content), (settings.REPO_ROOT / "index.html").read_bytes())
            finally:
                response.close()
            self.full(visitor, True)
            self.assertContains(owner.get("/owner/"), "Turn lockdown on")

            owner.post("/owner/", {"action": "enable-lockdown"})
            locked = visitor.get("/")
            self.assertContains(locked, 'type="password"')
            self.assertNotContains(locked, passphrase)
            self.assertNotContains(locked, 'src="data.js"')
            self.full(visitor, False)
            self.assertEqual(visitor.get("/styles.css").status_code, 200)
            self.assertEqual(visitor.post("/unlock/", {"passphrase": passphrase}).status_code, 403)
            token = visitor.cookies["csrftoken"].value
            payload = {"csrfmiddlewaretoken": token}
            for wrong in ("", "X" + passphrase, passphrase + " "):
                with self.subTest(wrong=bool(wrong)):
                    denied = visitor.post("/unlock/", {**payload, "passphrase": wrong})
                    self.assertContains(denied, "Incorrect passphrase", status_code=400)
                    self.assertNotContains(denied, passphrase, status_code=400)
                    self.full(visitor, False)
            accepted = visitor.post("/unlock/", {**payload, "passphrase": passphrase})
            self.assertRedirects(accepted, "/", fetch_redirect_response=False)
            self.assertContains(visitor.get("/"), "DOMContentLoaded")
            self.full(visitor, True)
            self.full(direct, False)
            self.assertEqual(visitor.get("/owner/").status_code, 302)

            with override_settings(ATLAS_ENTRY_PASSPHRASE=secrets.token_hex(8)):
                self.full(visitor, False)
            session = visitor.session
            proof = session["atlas_entry"]
            proof["expires"] = timezone.now().timestamp() - 1
            session["atlas_entry"] = proof
            session.save()
            self.full(visitor, False)

            visitor.post("/unlock/", {**payload, "passphrase": passphrase})
            self.full(visitor, True)
            owner.post("/owner/", {"action": "disable-lockdown"})
            self.full(direct, True)
            owner.post("/owner/", {"action": "enable-lockdown"})
            self.full(visitor, False)
            self.assertContains(owner.get("/owner/"), "Turn lockdown off")
            self.assertEqual(AccessEvent.objects.filter(actor=self.owner, action="enable-lockdown").count(), 2)

    def test_lockdown_requires_server_configuration_and_limits_retries(self):
        owner = self.sign_in_owner()
        visitor = Client()
        with override_settings(ATLAS_ENTRY_PASSPHRASE=""):
            owner.post("/owner/", {"action": "disable-lockdown"})
            owner.post("/owner/", {"action": "enable-lockdown"})
            self.assertFalse(AccessPolicy.objects.get(pk=1).lockdown_enabled)
        secret = secrets.token_urlsafe(18)
        with override_settings(ATLAS_ENTRY_PASSPHRASE=secret):
            owner.post("/owner/", {"action": "enable-lockdown"})
            for _ in range(8):
                self.assertEqual(visitor.post("/unlock/", {"passphrase": "incorrect"}).status_code, 400)
            self.assertEqual(visitor.post("/unlock/", {"passphrase": secret}).status_code, 429)
            self.full(visitor, False)
