import json
import mimetypes
import os
import re
from functools import lru_cache
from hashlib import sha256
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404

SAFE_TYPES = {
    ".html", ".js", ".css", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg",
}


@lru_cache(maxsize=1)
def inventory():
    raw = (settings.BASE_DIR / "viewer-files.json").read_bytes()
    if not settings.LOCAL and sha256(raw).hexdigest() != os.environ["ATLAS_VIEWER_MANIFEST_SHA256"]:
        raise RuntimeError("The reviewed Atlas viewer inventory does not match this build")
    return frozenset(json.loads(raw))


def serve(path):
    if path not in inventory() or Path(path).suffix.lower() not in SAFE_TYPES:
        raise Http404
    root = settings.REPO_ROOT
    target = (root / path).resolve()
    if not target.is_relative_to(root) or not target.is_file():
        raise Http404
    mime = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
    return FileResponse(target.open("rb"), content_type=mime)


ACCESSION = re.compile(r"[A-Z0-9]+(?:-[A-Z0-9]+)*\Z")


@lru_cache(maxsize=1)
def showcase():
    approved = json.loads((settings.BASE_DIR / "showcase.json").read_text())
    for code, record in approved.items():
        if not ACCESSION.fullmatch(code) or set(record) != {"title", "description", "images"}:
            raise ValueError("Invalid Atlas showcase record")
        if not isinstance(record["title"], str) or not isinstance(record["description"], str):
            raise ValueError("Invalid Atlas showcase text")
        if not isinstance(record["images"], list) or any(
            not path.startswith("assets/") or path not in inventory() for path in record["images"]
        ):
            raise ValueError("Invalid Atlas showcase image")
    return approved
