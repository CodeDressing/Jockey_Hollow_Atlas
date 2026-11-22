import base64
import json
import urllib.request
from hashlib import sha256
from uuid import uuid4

from allauth.account.adapter import DefaultAccountAdapter
from allauth.mfa.adapter import DefaultMFAAdapter
from cryptography.fernet import Fernet
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.core.mail.backends.base import BaseEmailBackend
from django.db import transaction
from django.urls import reverse
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .models import AccessPolicy, Membership


class InviteOnly(DefaultAccountAdapter):
    def is_open_for_signup(self, request):
        return False

    def send_mail(self, template_prefix, email, context):
        if template_prefix.startswith("account/email/password_reset_key"):
            user = context.get("user")
            if user is None or not Membership.objects.filter(user=user, active=True).exists():
                return
        super().send_mail(template_prefix, email, context)


class EncryptedMFA(DefaultMFAAdapter):
    @staticmethod
    def cipher():
        return Fernet(base64.urlsafe_b64encode(sha256(("atlas-mfa:" + settings.SECRET_KEY).encode()).digest()))

    def encrypt(self, text):
        return self.cipher().encrypt(text.encode()).decode()

    def decrypt(self, encrypted_text):
        return self.cipher().decrypt(encrypted_text.encode()).decode()


class BrevoEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        import os

        count = 0
        for message in email_messages:
            payload = {
                "sender": {"email": message.from_email},
                "to": [{"email": email} for email in message.to],
                "subject": message.subject,
                "textContent": message.body,
            }
            request = urllib.request.Request(
                "https://api.brevo.com/v3/smtp/email",
                data=json.dumps(payload).encode(),
                headers={"api-key": os.environ["ATLAS_BREVO_API_KEY"], "Content-Type": "application/json"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(request, timeout=10):
                    count += 1
            except OSError:
                if not self.fail_silently:
                    raise RuntimeError("Atlas mail delivery was not accepted") from None
        return count


def create_invitation(email, role):
    email = email.strip().lower()
    users = get_user_model().objects
    # Serialize invitations and invalidate earlier links on resend.
    with transaction.atomic():
        AccessPolicy.objects.select_for_update().get(pk=1)
        user = users.filter(email__iexact=email).first()
        member = Membership.objects.select_for_update().filter(user=user).first() if user else None
        if user and (not member or member.active or member.role != role):
            raise ValueError("An active account or a different invitation already exists.")
        if not user and role == "owner" and Membership.objects.filter(role="owner").exists():
            raise ValueError("An owner account or invitation already exists.")
        if not user:
            user = users.create_user(username=uuid4().hex, email=email, password=uuid4().hex)
            member = Membership.objects.create(user=user, role=role)
        else:
            user.set_password(uuid4().hex)
            user.save(update_fields=["password"])
        member.invited_at = timezone.now()
        member.activated_at = None
        member.save(update_fields=["invited_at", "activated_at"])
        path = reverse("atlas-activate", kwargs={
            "uidb64": urlsafe_base64_encode(force_bytes(user.pk)),
            "token": default_token_generator.make_token(user),
        })
        sent = send_mail(
            "Your Jockey Hollow Atlas invitation",
            "Set your password to activate your Atlas account. This link expires in one hour.\n\n"
            + settings.PUBLIC_ORIGIN + path,
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )
        if sent != 1:
            raise RuntimeError("Atlas mail delivery was not accepted")
    return member
