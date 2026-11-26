"""Jockey Hollow Atlas access controller."""
from hmac import compare_digest
import json
import os
from pathlib import Path
import re
import secrets
import sqlite3
from urllib.parse import urlsplit

from flask import Flask, Response, abort, redirect, render_template, request, send_from_directory, url_for

from storage import AccessStore, digest

HERE = Path(__file__).resolve().parent
TOKEN = re.compile(r"[A-Za-z0-9_-]{43}")
SHA256 = re.compile(r"[0-9a-f]{64}")
COMMIT = re.compile(r"[0-9a-f]{40}")
DEPLOYMENT = re.compile(r"dep-[a-z0-9]+")
SESSION_TTL = 30 * 60


def create_app(config, now=None):
    app = Flask(__name__, static_folder=None)
    app.url_map.redirect_defaults = False
    origin = urlsplit(config["origin"])
    if (
        not origin.hostname or origin.username or origin.password or origin.path or origin.query or origin.fragment
        or not (origin.scheme == "https" or (
            origin.scheme == "http" and origin.hostname in ("localhost", "127.0.0.1")
        ))
    ):
        raise ValueError("ATLAS_ORIGIN must be the HTTPS origin (HTTP is available for loopback previews).")
    secure = origin.scheme == "https"
    cookie_prefix = "__Host-" if secure else ""
    session_cookie = cookie_prefix + "atlas-session"
    login_cookie = cookie_prefix + "atlas-login"
    app.config.update(
        TRUSTED_HOSTS=[origin.hostname], MAX_CONTENT_LENGTH=4096, MAX_FORM_MEMORY_SIZE=4096,
        USE_X_SENDFILE=False,
    )

    owner_hash = config["owner_hash"]
    if not SHA256.fullmatch(owner_hash):
        raise ValueError("ATLAS_OWNER_TOKEN_SHA256 must be a SHA-256 digest of a generated owner key.")
    reopen_token = config.get("reopen_token", "")
    if reopen_token and not TOKEN.fullmatch(reopen_token):
        raise ValueError("ATLAS_REOPEN_TOKEN must be generated from 32 random bytes.")
    release = digest(reopen_token) if reopen_token else None
    collection = Path(config["collection"]).resolve()
    manifest = json.loads((collection / ".atlas-release.json").read_bytes())
    files = frozenset(manifest["files"])
    if "index.html" not in files:
        raise ValueError("Atlas release is missing the entry page.")
    for item in files:
        candidate = collection / item
        if not candidate.resolve().is_relative_to(collection) or not candidate.is_file():
            raise ValueError("Atlas release contains an invalid file reference.")
    store = AccessStore(config["state_db"], owner_hash, **({"now": now} if now else {}))
    app.extensions["atlas_access_store"] = store

    def render(page, status=200, **context):
        return app.make_response((render_template(page + ".html", **context), status))

    def current_token():
        token = request.cookies.get(session_cookie, "")
        return token if TOKEN.fullmatch(token) else ""

    def csrf_matches(expected):
        supplied = request.form.getlist("csrf")
        return (
            expected and TOKEN.fullmatch(expected) and len(supplied) == 1 and TOKEN.fullmatch(supplied[0])
            and compare_digest(expected, supplied[0])
        )

    def set_cookie(response, name, value, max_age):
        response.set_cookie(name, value, secure=secure, httponly=True, samesite="Strict",
                            path="/", max_age=max_age)

    def sign_in_page(message=None, status=200, retry_after=None):
        csrf = secrets.token_urlsafe(32)
        response = render("sign_in", status, csrf=csrf, error=message)
        set_cookie(response, login_cookie, csrf, 600)
        if retry_after:
            response.headers["Retry-After"] = retry_after
        return response

    def management(csrf, message=None, status=200):
        commit = config.get("commit", "")
        rollback = config.get("rollback", "")
        deployment = config.get("deployment", "")
        return render(
            "manage", status, csrf=csrf, mode=store.mode(release), release_enabled=bool(release),
            summary=manifest["summary"], audit=store.audit(), error=message,
            commit=commit if COMMIT.fullmatch(commit) else None,
            rollback=rollback if COMMIT.fullmatch(rollback) else None,
            deployment=deployment if DEPLOYMENT.fullmatch(deployment) else None,
        )

    @app.before_request
    def validate_origin():
        if request.method == "POST":
            supplied = request.headers.get("Origin")
            if supplied is not None and supplied != config["origin"]:
                abort(403)

    @app.after_request
    def headers(response):
        response.headers["Cache-Control"] = "private, no-store, max-age=0"
        response.headers["CDN-Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "same-origin"
        response.headers["X-Frame-Options"] = "DENY"
        if request.endpoint != "atlas" or response.status_code >= 400:
            response.headers["X-Robots-Tag"] = "noindex, nofollow"
            response.headers["Content-Security-Policy"] = (
                "default-src 'none'; style-src 'self'; img-src 'self'; "
                "form-action 'self'; frame-ancestors 'none'; base-uri 'none'"
            )
        else:
            response.headers["Content-Security-Policy"] = "object-src 'none'; frame-ancestors 'none'; base-uri 'self'"
        if secure:
            response.headers["Strict-Transport-Security"] = "max-age=31536000"
        return response

    @app.errorhandler(403)
    def forbidden(_):
        return render("error", 403, title="Request denied", detail="Return to the management page and try again.")

    @app.errorhandler(413)
    def too_large(_):
        return render("error", 413, title="Request too large", detail="Return to the management page and try again.")

    @app.errorhandler(sqlite3.Error)
    def state_unavailable(error):
        app.logger.error("Atlas access database unavailable (%s)", type(error).__name__)
        return render("error", 503, title="Atlas temporarily unavailable",
                      detail="The access controller cannot verify the current state. Collection access is disabled.")

    @app.get("/healthz")
    def health():
        with store.connect() as db:
            db.execute("SELECT public_release FROM access_state WHERE id=1").fetchone()
        return Response(status=204)

    @app.get("/access-style.css")
    def stylesheet():
        return send_from_directory(HERE / "static", "access.css")

    @app.route("/manage", methods=["GET", "POST"])
    def manage():
        if request.method != "POST":
            csrf = store.session(current_token())
            return management(csrf) if csrf else sign_in_page()

        if not csrf_matches(request.cookies.get(login_cookie, "")):
            return sign_in_page("The form expired. Please try again.", 403)
        keys = request.form.getlist("key")
        valid = len(keys) == 1 and TOKEN.fullmatch(keys[0]) and compare_digest(digest(keys[0]), owner_hash)
        token, retry = store.sign_in(bool(valid), current_token(), SESSION_TTL)
        if retry:
            return sign_in_page("Too many failed attempts. Try again in a few minutes.", 429, retry)
        if not token:
            return sign_in_page("Sign-in was unsuccessful. Check the owner access key.", 401)
        response = redirect(url_for("manage"), code=303)
        set_cookie(response, session_cookie, token, SESSION_TTL)
        set_cookie(response, login_cookie, "", 0)
        return response

    @app.post("/manage/mode")
    def mode():
        token = current_token()
        csrf = store.session(token)
        if not csrf_matches(csrf):
            abort(403)
        values = request.form.getlist("mode")
        confirmations = request.form.getlist("confirmation")
        if values not in (["PUBLIC"], ["RESTRICTED"]) or confirmations != values:
            store.audit_denial()
            return management(csrf, "Type the target mode exactly to confirm the change.", 400)
        target = values[0]
        if target == "PUBLIC" and not release:
            store.audit_denial()
            return management(csrf, "Public reopening is locked by deployment configuration.", 409)
        if not store.change_mode(token, release if target == "PUBLIC" else None):
            abort(403)
        return redirect(url_for("manage"), code=303)

    @app.post("/manage/sign-out")
    def sign_out():
        token = current_token()
        if not csrf_matches(store.session(token)):
            abort(403)
        store.revoke(token)
        response = redirect(url_for("manage"), code=303)
        set_cookie(response, session_cookie, "", 0)
        return response

    @app.get("/", defaults={"name": "index.html"})
    @app.get("/<path:name>")
    def atlas(name):
        if store.mode(release) != "PUBLIC":
            if name == "index.html":
                return render("restricted", 503)
            return Response(status=404)
        if name not in files:
            return Response(status=404)
        return send_from_directory(collection, name, conditional=True, etag=False)

    return app


def from_env():
    return create_app({
        "origin": os.environ["ATLAS_ORIGIN"],
        "owner_hash": os.environ["ATLAS_OWNER_TOKEN_SHA256"],
        "state_db": os.environ["ATLAS_STATE_DB"],
        "collection": os.environ.get("ATLAS_COLLECTION", str(HERE / "collection")),
        "reopen_token": os.environ.get("ATLAS_REOPEN_TOKEN", ""),
        "commit": os.environ.get("RENDER_GIT_COMMIT", os.environ.get("ATLAS_COMMIT", "")),
        "rollback": os.environ.get("ATLAS_ROLLBACK_COMMIT", ""),
        "deployment": os.environ.get("ATLAS_DEPLOYMENT_ID", ""),
    })
