from django.conf import settings
from django.db import models


class AccessPolicy(models.Model):
    private = "private"
    beta = "limited_beta"
    mode = models.CharField(max_length=16, choices=[(private, "Private"), (beta, "Limited Beta")], default=private)
    guests_enabled = models.BooleanField(default=False)
    guest_generation = models.PositiveBigIntegerField(default=0)


class Membership(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="atlas_membership")
    role = models.CharField(max_length=10, choices=[("owner", "Owner"), ("viewer", "Viewer")])
    active = models.BooleanField(default=False)
    invited_at = models.DateTimeField(null=True)
    activated_at = models.DateTimeField(null=True)


class GuestCode(models.Model):
    digest = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    redeemed_at = models.DateTimeField(null=True)
    revoked_at = models.DateTimeField(null=True)
    generation = models.PositiveBigIntegerField()


class GuestSession(models.Model):
    code = models.OneToOneField(GuestCode, on_delete=models.CASCADE)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True)


class RedemptionAttempt(models.Model):
    source = models.CharField(max_length=64)
    window = models.DateTimeField()
    attempts = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["source", "window"], name="guest_rate_limit_window")]


class AccessEvent(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    action = models.CharField(max_length=40)
    detail = models.CharField(max_length=160)
    happened_at = models.DateTimeField(auto_now_add=True)
