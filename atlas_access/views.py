from datetime import timedelta
import re
import secrets

from allauth.account.authentication import get_authentication_records
from allauth.account.models import EmailAddress
from allauth.mfa.models import Authenticator
from django.contrib import messages
from django.contrib.auth import get_user_model, logout
from django.middleware.csrf import get_token
from django.utils.html import format_html
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.views import INTERNAL_RESET_SESSION_TOKEN, PasswordResetConfirmView
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.db.models import F
from django.http import Http404, HttpResponse, HttpResponseForbidden
from django.shortcuts import redirect, render
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.utils.crypto import salted_hmac
from django.utils.http import urlencode
from django.views.decorators.http import require_http_methods, require_POST, require_safe

from .accounts import create_invitation
from .models import AccessEvent, AccessPolicy, GuestCode, GuestSession, Membership, RedemptionAttempt
from .viewer import serve, showcase

CODE_PATTERN = re.compile(r"[A-Za-z0-9_-]{32}")


def no_cache(get_response):
    def wrapped(request):
        response = get_response(request)
        response["Cache-Control"] = "private, no-store, max-age=0"
        response["X-Robots-Tag"] = "noindex, noarchive"
        return response
    return wrapped


def digest(scope, value):
    return salted_hmac(scope, value, algorithm="sha256").hexdigest()


def member_for(request):
    if request.user.is_authenticated:
        return Membership.objects.filter(user=request.user, active=True).first()
    return None


def owner_mfa(request):
    ids = [entry.get("id") for entry in get_authentication_records(request, request.user)
           if entry.get("method") == "mfa" and entry.get("id")]
    return bool(ids and Authenticator.objects.filter(user=request.user, pk__in=ids).exists())


def can_view(request, policy):
    membership = member_for(request)
    if membership:
        return membership.role == "viewer" or owner_mfa(request)
    session_id = request.session.get("atlas_guest")
    now = timezone.now()
    return bool(
        not request.user.is_authenticated and policy.guests_enabled and session_id
        and GuestSession.objects.filter(
            pk=session_id, expires_at__gt=now, revoked_at__isnull=True,
            code__revoked_at__isnull=True, code__generation=policy.guest_generation,
        ).exists()
    )


@require_safe
def atlas(request):
    policy = AccessPolicy.objects.get(pk=1)
    member = member_for(request)
    if member and member.role == "owner" and not owner_mfa(request):
        return redirect("atlas-owner")
    if can_view(request, policy):
        links = format_html(
            '<form method="post" action="/sign-out/">'
            '<input type="hidden" name="csrfmiddlewaretoken" value="{}">'
            '<button class="toolbtn">Sign out</button>{}</form>',
            get_token(request),
            format_html(' <a href="{}">Owner dashboard</a>', reverse("atlas-owner")) if member and member.role == "owner" else "",
        )
        restore = """<script>
          try {
            const accession = sessionStorage.getItem("atlas-return-accession");
            sessionStorage.removeItem("atlas-return-accession");
            if (!location.hash && /^#[A-Za-z0-9-]+$/.test(accession || "")) {
              history.replaceState(null, "", accession);
            }
          } catch {}
        </script>"""
        source = serve("index.html")
        try:
            html = b"".join(source.streaming_content).decode("utf-8")
        finally:
            source.close()
        return HttpResponse(html.replace("</head>", restore + "</head>", 1).replace(
            '<div class="topbar">', '<div class="topbar">' + str(links), 1,
        ))
    return render(request, "atlas_landing.html", {
        "guests_enabled": policy.guests_enabled,
        "limited_beta": policy.mode == AccessPolicy.beta,
        "records": showcase() if policy.mode == AccessPolicy.beta else {},
    })


@require_safe
def file(request, path):
    if not can_view(request, AccessPolicy.objects.get(pk=1)):
        raise Http404
    return serve(path)


@require_safe
def beta_image(request, accession, index):
    if AccessPolicy.objects.get(pk=1).mode != AccessPolicy.beta:
        raise Http404
    try:
        path = showcase()[accession]["images"][index]
    except (KeyError, IndexError):
        raise Http404 from None
    return serve(path)


@require_POST
def redeem(request):
    if request.user.is_authenticated:
        return HttpResponseForbidden()
    now = timezone.now()
    window = now.replace(minute=(now.minute // 10) * 10, second=0, microsecond=0)
    source = request.META.get("REMOTE_ADDR", "")
    attempt, _ = RedemptionAttempt.objects.get_or_create(source=digest("atlas-rate", source), window=window)
    allowed = RedemptionAttempt.objects.filter(pk=attempt.pk, attempts__lt=8).update(attempts=F("attempts") + 1)
    if not allowed:
        response = HttpResponse("Too many attempts. Try again in a few minutes.", status=429)
        response["Retry-After"] = "600"
        return response
    supplied = request.POST.get("code", "").strip()
    if CODE_PATTERN.fullmatch(supplied):
        with transaction.atomic():
            policy = AccessPolicy.objects.select_for_update().get(pk=1)
            if policy.guests_enabled:
                code = GuestCode.objects.select_for_update().filter(
                    digest=digest("atlas-code", supplied), expires_at__gt=now,
                    redeemed_at__isnull=True, revoked_at__isnull=True, generation=policy.guest_generation,
                ).first()
                if code:
                    code.redeemed_at = now
                    code.save(update_fields=["redeemed_at"])
                    session = GuestSession.objects.create(code=code, expires_at=now + timedelta(hours=2))
                    request.session.cycle_key()
                    request.session["atlas_guest"] = session.pk
                    request.session.set_expiry(7200)
                    return redirect("atlas")
    messages.error(request, "This access code could not be redeemed.")
    return redirect("atlas")


@require_POST
def sign_out(request):
    logout(request)
    return redirect("atlas")


class ActivateInvitation(PasswordResetConfirmView):
    template_name = "atlas_activate.html"
    success_url = reverse_lazy("account_login")

    def form_valid(self, form):
        with transaction.atomic():
            member = Membership.objects.select_for_update().filter(
                user=self.user, invited_at__isnull=False, activated_at__isnull=True, active=False,
            ).first()
            user = get_user_model().objects.select_for_update().get(pk=self.user.pk)
            if not member or not default_token_generator.check_token(
                user, self.request.session.get(INTERNAL_RESET_SESSION_TOKEN),
            ):
                raise Http404
            response = super().form_valid(form)
            EmailAddress.objects.get_or_create(
                user=self.user, email=self.user.email, defaults={"verified": True, "primary": True},
            )
            member.active = True
            member.activated_at = timezone.now()
            member.save(update_fields=["active", "activated_at"])
        return response


def dashboard(request, code=None):
    return render(request, "atlas_owner.html", {
        "policy": AccessPolicy.objects.get(pk=1),
        "events": AccessEvent.objects.select_related("actor").order_by("-happened_at", "-pk")[:25],
        "viewers": Membership.objects.filter(role="viewer").select_related("user").order_by("user__email"),
        "codes": GuestCode.objects.select_related("guestsession").filter(revoked_at__isnull=True).order_by("-pk")[:100],
        "new_code": code,
    })


@require_http_methods(["GET", "POST"])
def owner(request):
    if not request.user.is_authenticated:
        return redirect(reverse("account_login") + "?" + urlencode({"next": reverse("atlas-owner")}))
    member = member_for(request)
    if not member or member.role != "owner":
        return HttpResponseForbidden()
    if not owner_mfa(request):
        if request.method == "POST":
            return HttpResponseForbidden()
        if Authenticator.objects.filter(user=request.user, type=Authenticator.Type.TOTP).exists():
            return redirect(reverse("mfa_reauthenticate") + "?" + urlencode({"next": reverse("atlas-owner")}))
        return redirect("mfa_activate_totp")
    if request.method == "GET":
        return dashboard(request)

    action = request.POST.get("action")
    if action == "invite":
        email = request.POST.get("email", "")
        try:
            validate_email(email)
            invite = create_invitation(email, "viewer")
        except (ValidationError, ValueError, RuntimeError) as error:
            messages.error(request, str(error))
            return redirect("atlas-owner")
        AccessEvent.objects.create(actor=request.user, action=action, detail=str(invite.pk))
        messages.success(request, "Viewer invitation accepted by the mail provider.")
        return redirect("atlas-owner")

    with transaction.atomic():
        policy = AccessPolicy.objects.select_for_update().get(pk=1)
        code = None
        if action == "mode" and request.POST.get("mode") in (AccessPolicy.private, AccessPolicy.beta):
            policy.mode = request.POST["mode"]
            policy.save(update_fields=["mode"])
            detail = policy.get_mode_display()
        elif action in ("enable-guests", "disable-guests"):
            policy.guests_enabled = action == "enable-guests"
            if not policy.guests_enabled:
                policy.guest_generation += 1
            policy.save(update_fields=["guests_enabled", "guest_generation"])
            detail = "Enabled" if policy.guests_enabled else "Disabled and revoked all existing guest access"
        elif action == "new-code" and policy.guests_enabled:
            code = secrets.token_urlsafe(24)
            guest_code = GuestCode.objects.create(
                digest=digest("atlas-code", code), expires_at=timezone.now() + timedelta(hours=1),
                generation=policy.guest_generation,
            )
            detail = str(guest_code.pk)
        elif action == "revoke-code":
            updated = GuestCode.objects.filter(
                pk=identifier(request), revoked_at__isnull=True,
            ).update(revoked_at=timezone.now())
            if not updated:
                raise Http404
            detail = str(identifier(request))
        elif action == "revoke-session":
            updated = GuestSession.objects.filter(
                code_id=identifier(request), revoked_at__isnull=True,
            ).update(revoked_at=timezone.now())
            if not updated:
                raise Http404
            detail = str(identifier(request))
        elif action == "revoke-viewer":
            updated = Membership.objects.filter(pk=identifier(request), role="viewer").update(
                active=False, invited_at=None,
            )
            if not updated:
                raise Http404
            detail = str(identifier(request))
        else:
            return HttpResponse("Invalid action.", status=400)
        AccessEvent.objects.create(actor=request.user, action=action, detail=detail)
    return dashboard(request, code) if code else redirect("atlas-owner")


def identifier(request):
    value = request.POST.get("id", "")
    if not re.fullmatch(r"[0-9]{1,18}", value):
        raise Http404
    return int(value)
