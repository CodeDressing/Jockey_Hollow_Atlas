#!/usr/bin/env python3
"""Atlas lossless microscopy ZIP intake. Default is read-only validation."""
# LEDGER: 01 inputs; 02 verification; 03 gallery preparation; 04 atomic integration.
# SECTION 01 — INPUTS
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import shutil
import sys
import tempfile
from urllib.parse import quote
from zipfile import ZipFile

def fail(message):
    raise ValueError(message)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path, help="original authenticated intake ZIP")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--apply", action="store_true", help="write only after all validations")
    args = parser.parse_args()
    root = args.root.resolve()
    html_path = root / "index.html"
    data_path = root / "data.js"
    if not html_path.is_file() or not data_path.is_file():
        fail("Expected existing Atlas index.html and data.js")
    # SECTION 02 — EXACT-BYTE VERIFICATION
    with ZipFile(args.archive) as bundle:
        names = bundle.namelist()
        manifests = [n for n in names if n.startswith("research/") and n.endswith("/microscopy-intake.json")]
        if len(manifests) != 1:
            fail("Exactly one accession microscopy intake manifest is required")
        manifest = json.loads(bundle.read(manifests[0]))
        accession = str(manifest.get("accession", "")).upper()
        if not accession or not all(c.isalnum() or c == "-" for c in accession):
            fail("Invalid accession")
        if accession not in data_path.read_text(encoding="utf-8"):
            fail("Accession is absent from existing master data; refuse to invent a specimen")
        images = manifest.get("images")
        if not isinstance(images, list) or not images:
            fail("Nonempty images inventory required")
        expected_prefix = "assets/" + accession.lower() + "/microscopy/"
        records = []
        seen = set()
        for index, entry in enumerate(images, 1):
            filename = entry["filename"]
            if PurePosixPath(filename).name != filename or not filename.lower().endswith(".png"):
                fail("Unsafe or unexpected image filename")
            archive_path = expected_prefix + filename
            if archive_path in seen or archive_path not in names:
                fail("Missing or repeated original: " + archive_path)
            seen.add(archive_path)
            payload = bundle.read(archive_path)
            if len(payload) != entry["bytes"]:
                fail("Original length mismatch: " + filename)
            if hashlib.sha256(payload).hexdigest() != entry["sha256"]:
                fail("Original SHA-256 mismatch: " + filename)
            if not payload.startswith(bytes.fromhex("89504e470d0a1a0a")):
                fail("PNG signature mismatch: " + filename)
            records.append((archive_path, entry, payload, index))
        if len(seen) != len(images):
            fail("Manifest duplication")
        # SECTION 03 — GALLERY WIRING
        script_name = "research/" + accession.lower().replace("-", "_") + "_microscopy_gallery.js"
        html = html_path.read_text(encoding="utf-8")
        anchor = '<script src="app.js"></script>'
        if anchor not in html:
            fail("Current Atlas script loader did not match expected anchor")
        if script_name in html:
            fail("Gallery already wired; inspect existing integration before retrying")
        gallery = [
            "// Original-byte microscopy intake for " + accession + ".",
            "// Source images retain instrument annotations; structure ID and calibration are unverified.",
            "window.DRIVE_PHOTOS = window.DRIVE_PHOTOS || [];",
            "window.DRIVE_PHOTOS.push("
        ]
        for pos, (path, entry, payload, number) in enumerate(records):
            encoded_path = "/".join(quote(part, safe="()-_.") for part in path.split("/"))
            item = {
                "folder": accession + " researcher-provided microscopy originals",
                "collection": accession.split("-")[0],
                "family": accession[:2],
                "specimen": accession,
                "category": "Microscopy",
                "filename": entry["filename"],
                "caption": accession + " — original microscopy image " + str(number) + " of " + str(len(records)) + "; displayed annotations retained; structure identification and calibration unverified",
                "original": encoded_path,
                "thumb": encoded_path,
                "source_relpath": path,
            }
            gallery.append("  " + json.dumps(item, ensure_ascii=False) + ("," if pos + 1 < len(records) else ""))
        gallery.append(");")
        gallery_text = "\n".join(gallery) + "\n"
        updated_html = html.replace(anchor, '<script src="' + script_name + '"></script>' + anchor, 1)
        # SECTION 04 — CONTROLLED WRITES
        print(json.dumps({"accession": accession, "verified_originals": len(records),
                          "total_bytes": sum(len(r[2]) for r in records),
                          "gallery": script_name, "mode": "APPLY" if args.apply else "DRY_RUN"}))
        if not args.apply:
            return
        if (root / script_name).exists():
            fail("Existing gallery script would be overwritten")
        for path, entry, payload, _ in records:
            target = root / path
            if target.exists() and target.read_bytes() != payload:
                fail("Existing research original differs: " + path)
        # All validation completed before writing anything.
        for path, entry, payload, _ in records:
            target = root / path
            target.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists():
                target.write_bytes(payload)
            if hashlib.sha256(target.read_bytes()).hexdigest() != entry["sha256"]:
                fail("Post-write hash verification failed: " + path)
        script = root / script_name
        script.parent.mkdir(parents=True, exist_ok=True)
        script.write_text(gallery_text, encoding="utf-8")
        html_path.write_text(updated_html, encoding="utf-8")
        print("INTEGRATED; run CI and validate release rights before merging")

if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError) as exc:
        print("BLOCKED:", exc, file=sys.stderr)
        sys.exit(1)
