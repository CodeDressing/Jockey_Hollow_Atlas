import os
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent
LOCAL = os.environ.get("ATLAS_LOCAL_TEST") == "1"
SECRET_KEY = "local-test-key-never-used-in-deployment" if LOCAL else os.environ["ATLAS_SECRET_KEY"]
PUBLIC_ORIGIN = "http://localhost:8000" if LOCAL else os.environ["ATLAS_PUBLIC_ORIGIN"].rstrip("/")
if not LOCAL and not PUBLIC_ORIGIN.startswith("https://"):
    raise ValueError("ATLAS_PUBLIC_ORIGIN must use HTTPS")
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "testserver"] if LOCAL else [PUBLIC_ORIGIN.removeprefix("https://")]
ROOT_URLCONF = "atlas_access.urls"
WSGI_APPLICATION = "atlas_access.wsgi.application"
INSTALLED_APPS = [
    "django.contrib.auth", "django.contrib.contenttypes", "django.contrib.sessions",
    "django.contrib.messages", "allauth", "allauth.account", "allauth.mfa", "atlas_access",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "atlas_access.views.no_cache",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [BASE_DIR / "templates"],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]
DATABASES = {"default": (
    {"ENGINE": "django.db.backends.sqlite3", "NAME": os.environ.get("ATLAS_TEST_DATABASE") or BASE_DIR / "local.sqlite3"}
    if LOCAL else dj_database_url.parse(os.environ["DATABASE_URL"], ssl_require=True)
)}
CACHES = {"default": {"BACKEND": "django.core.cache.backends.db.DatabaseCache", "LOCATION": "atlas_auth_cache"}}
AUTHENTICATION_BACKENDS = ["django.contrib.auth.backends.ModelBackend", "allauth.account.auth_backends.AuthenticationBackend"]
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]
ACCOUNT_ADAPTER = "atlas_access.accounts.InviteOnly"
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_EMAIL_UNKNOWN_ACCOUNTS = False
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
ACCOUNT_LOGIN_ON_PASSWORD_RESET = False
ACCOUNT_DEFAULT_HTTP_PROTOCOL = "http" if LOCAL else "https"
LOGIN_REDIRECT_URL = "/"
ACCOUNT_LOGOUT_REDIRECT_URL = "/"
PASSWORD_RESET_TIMEOUT = 3600
MFA_SUPPORTED_TYPES = ["totp", "recovery_codes"]
MFA_TOTP_ISSUER = "Jockey Hollow Atlas"
MFA_ADAPTER = "atlas_access.accounts.EncryptedMFA"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
DATA_UPLOAD_MAX_MEMORY_SIZE = 16384
SECURE_PROXY_SSL_HEADER = None if LOCAL else ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = not LOCAL
SESSION_COOKIE_AGE = 8 * 60 * 60
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_HSTS_SECONDS = 0 if LOCAL else 3600
SECURE_REFERRER_POLICY = "same-origin"
EMAIL_BACKEND = (
    "django.core.mail.backends.locmem.EmailBackend" if LOCAL else "atlas_access.accounts.BrevoEmailBackend"
)
DEFAULT_FROM_EMAIL = "atlas@example.test" if LOCAL else os.environ["ATLAS_FROM_EMAIL"]

ATLAS_ENTRY_PASSPHRASE = os.environ.get("ATLAS_ENTRY_PASSPHRASE", "")
