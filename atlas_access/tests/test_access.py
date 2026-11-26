"""Request and state-management regression coverage with isolated fixture data."""
from functools import partial
import json
import re
import secrets

import pytest

from app import SESSION_TTL, create_app
from storage import digest


SITE = "https://atlas.example.test"
PUBLIC_PATHS = ("/index.html", "/data.js", "/assets/gallery.jpg", "/research/enrichment.js")


@pytest.fixture()
def preview(tmp_path):
    content = tmp_path / "collection"
    files = {
        "index.html": "<h1>Fixture collection</h1>",
        "data.js": "const specimen = 'fixture specimen';",
        "assets/gallery.jpg": "fixture image",
        "research/enrichment.js": "const fixtureDetails = 'fixture accession';",
        "research/unlisted.pdf": "excluded from the publication release",
    }
    for path, payload in files.items():
        target = content / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(payload)
    (content / ".atlas-release.json").write_text(json.dumps({
        "files": [path for path in files if not path.endswith(".pdf")],
        "summary": {"accessions": 1, "imagePaths": 1, "archivalEntries": 0},
    }))
    key = secrets.token_urlsafe(32)
    clock = [1_700_000_000]
    config = {
        "origin": SITE, "state_db": tmp_path / "state.db", "collection": content,
        "owner_hash": digest(key), "reopen_token": secrets.token_urlsafe(32),
    }
    app = create_app(config, now=lambda: clock[0])
    return app, config, key, clock


def csrf(response):
    return re.search(rb'name="csrf" value="([^"]+)"', response.data)[1].decode()


def sign_in(client, key):
    form = client.get("/manage")
    return client.post("/manage", data={"csrf": csrf(form), "key": key})


def change(client, target, *, phrase=None, **kwargs):
    token = csrf(client.get("/manage"))
    return client.post("/manage/mode", data={
        "csrf": token, "mode": target, "confirmation": target if phrase is None else phrase,
    }, **kwargs)


@pytest.fixture()
def clients(preview):
    def new():
        client = preview[0].test_client()
        client.get = partial(client.get, base_url=SITE)
        client.post = partial(client.post, base_url=SITE)
        client.head = partial(client.head, base_url=SITE)
        return client

    return new


def test_restricted_denies_reads_and_does_not_expose_admin(clients):
    client = clients()
    page = client.get("/")
    assert page.status_code == 503
    assert b"Access Temporarily Restricted" in page.data
    assert b"/manage" not in page.data
    for path in (*PUBLIC_PATHS[1:], "/research/unlisted.pdf", "/.atlas-release.json", "/Dockerfile"):
        for method in (client.get, client.head):
            response = method(path)
            assert response.status_code == 404 and not response.data
            assert "no-store" in response.headers["Cache-Control"]
    assert client.get("/healthz").status_code == 204


def test_authenticated_switch_roundtrip_and_cache_policy(preview, clients):
    app, _, key, _ = preview
    owner, visitor = clients(), clients()
    response = sign_in(owner, key)
    assert response.status_code == 303
    cookie = response.headers.getlist("Set-Cookie")[0]
    assert all(flag in cookie for flag in ("__Host-atlas-session", "HttpOnly", "Secure", "SameSite=Strict", "Max-Age=1800"))
    assert change(owner, "PUBLIC", phrase="Public").status_code == 400
    assert visitor.get("/").status_code == 503
    assert change(owner, "PUBLIC").status_code == 303
    assert b"Fixture collection" in visitor.get("/").data
    for path in PUBLIC_PATHS:
        result = visitor.get(path)
        assert result.status_code == 200
        assert result.headers["CDN-Cache-Control"] == "no-store"
        assert "no-store" in result.headers["Cache-Control"]
    assert visitor.get("/research/unlisted.pdf").status_code == 404
    assert visitor.get("/.atlas-release.json").status_code == 404
    previous = visitor.get("/assets/gallery.jpg")
    assert change(owner, "RESTRICTED").status_code == 303
    assert visitor.get("/assets/gallery.jpg", headers={
        "If-Modified-Since": previous.headers["Last-Modified"], "Range": "bytes=0-2",
    }).status_code == 404
    audit = str(app.extensions["atlas_access_store"].audit())
    assert "Owner enabled public access" in audit and "Owner enabled restricted access" in audit
    assert key not in audit


def test_unauthenticated_or_cross_origin_changes_are_denied(preview, clients):
    _, _, key, _ = preview
    owner, visitor = clients(), clients()
    assert b"Owner sign-in" in visitor.get("/manage").data
    assert visitor.post("/manage/mode", data={"mode": "PUBLIC", "confirmation": "PUBLIC"}).status_code == 403
    assert sign_in(owner, key).status_code == 303
    assert change(owner, "PUBLIC", headers={"Origin": "https://not-atlas.example.test"}).status_code == 403
    assert owner.post("/manage/mode", data={"csrf": "invalid", "mode": "PUBLIC"}).status_code == 403
    assert change(owner, "UNKNOWN").status_code == 400
    assert visitor.get("/").status_code == 503


def test_public_arm_absent_by_default_and_rotated_tokens_cannot_restore_mode(preview, clients):
    _, config, key, clock = preview
    owner = clients()
    assert sign_in(owner, key).status_code == 303
    assert change(owner, "PUBLIC").status_code == 303
    locked = create_app({**config, "reopen_token": ""}, now=lambda: clock[0]).test_client()
    assert locked.get("/", base_url=SITE).status_code == 503
    locked.get = partial(locked.get, base_url=SITE)
    locked.post = partial(locked.post, base_url=SITE)
    assert sign_in(locked, key).status_code == 303
    assert change(locked, "PUBLIC").status_code == 409
    rotated = create_app({**config, "reopen_token": secrets.token_urlsafe(32)}, now=lambda: clock[0])
    assert rotated.test_client().get("/", base_url=SITE).status_code == 503


def test_sessions_expire_revoke_and_are_bound_to_owner_key(preview, clients):
    _, config, key, clock = preview
    owner = clients()
    assert sign_in(owner, key).status_code == 303
    token = owner.get_cookie("__Host-atlas-session", domain="atlas.example.test").value
    rotated = create_app({**config, "owner_hash": digest(secrets.token_urlsafe(32))},
                         now=lambda: clock[0]).test_client()
    rotated.set_cookie("__Host-atlas-session", token, domain="atlas.example.test")
    assert b"Owner sign-in" in rotated.get("/manage", base_url=SITE).data
    clock[0] += SESSION_TTL
    assert b"Owner sign-in" in owner.get("/manage").data
    assert change(owner, "PUBLIC").status_code == 403
    assert sign_in(owner, key).status_code == 303
    session_before = owner.get_cookie("__Host-atlas-session", domain="atlas.example.test").value
    response = owner.post("/manage/sign-out", data={"csrf": csrf(owner.get("/manage"))})
    assert response.status_code == 303
    owner.set_cookie("__Host-atlas-session", session_before, domain="atlas.example.test")
    assert b"Owner sign-in" in owner.get("/manage").data


def test_login_rate_limit_and_malformed_requests(preview, clients):
    _, _, key, clock = preview
    client = clients()
    for _ in range(12):
        assert sign_in(client, "wrong").status_code == 401
    rejected = sign_in(client, key)
    assert rejected.status_code == 429 and int(rejected.headers["Retry-After"]) > 0
    clock[0] += 901
    assert sign_in(client, key).status_code == 303
    assert client.post("/manage", data="x" * 5000, content_type="application/x-www-form-urlencoded").status_code == 413
    assert client.get("/", base_url="https://unexpected.example.test").status_code == 400


def test_mode_persists_across_workers_and_fails_closed_on_database_error(preview, clients):
    _, config, key, clock = preview
    owner = clients()
    assert sign_in(owner, key).status_code == 303
    assert change(owner, "PUBLIC").status_code == 303
    second = create_app(config, now=lambda: clock[0]).test_client()
    assert second.get("/data.js", base_url=SITE).status_code == 200
    config["state_db"].unlink()
    denied = second.get("/data.js", base_url=SITE)
    assert denied.status_code == 503 and b"fixture specimen" not in denied.data
    assert second.get("/healthz", base_url=SITE).status_code == 503
