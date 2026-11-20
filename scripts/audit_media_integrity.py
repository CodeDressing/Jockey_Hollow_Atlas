#!/usr/bin/env python3
"""Read-only Atlas media audit. No files or remote records are modified."""
import argparse
import csv
import json
import pathlib
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
FIELDS = re.compile(r'["\\\'](?:original|thumb)["\\\']\\s*:\\s*["\\\']([^"\\\']+)["\\\']')
SPECIMEN = re.compile(r'["\\\']specimen["\\\']\\s*:\\s*["\\\']([^"\\\']+)["\\\']')
TARGETS = {"JN1-F15", "AN2-F1", "AN2-F3", "AN2-F7"}
HEADERS = {"User-Agent": "JockeyHollowAtlas-MediaAudit/1.0", "Accept": "image/*"}

def check(url, timeout):
    req = urllib.request.Request(url, headers=HEADERS, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            status = response.status
            mime = response.headers.get("Content-Type", "").split(";")[0].lower()
            sample = response.read(32)
            magic = (sample.startswith(b"\\x89PNG\\r\\n\\x1a\\n")
                     or sample.startswith(b"\\xff\\xd8\\xff")
                     or sample.startswith((b"GIF87a", b"GIF89a"))
                     or sample.startswith(b"RIFF") and b"WEBP" in sample[:16])
            return ("PASS" if status == 200 and mime.startswith("image/") and magic else "FAIL",
                    str(status), mime, "")
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return ("FAIL", "", "", str(e)[:180])

def records():
    # Parse source galleries conservatively: retain source file as provenance.
    for file in ROOT.rglob("*.js"):
        if ".git" in file.parts or "node_modules" in file.parts:
            continue
        text = file.read_text(encoding="utf-8", errors="replace")
        # Explicitly labeled object records; skip unrelated JavaScript code.
        for obj in re.finditer(r'\\{[^{}]{0,5000}\\}', text):
            block = obj.group()
            specimen = SPECIMEN.search(block)
            if not specimen or specimen.group(1).upper() not in TARGETS:
                continue
            urls = FIELDS.findall(block)
            for value in set(urls):
                yield specimen.group(1).upper(), str(file.relative_to(ROOT)), value

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--base", default="https://jockey-hollow-atlas.onrender.com")
    p.add_argument("--live", action="store_true", help="Issue public GET requests; failures may be transient")
    p.add_argument("--timeout", type=int, default=12)
    p.add_argument("--output", default="media_integrity_report.csv")
    args = p.parse_args()
    seen = set()
    rows = []
    for specimen, source, image in records():
        key = (specimen, image)
        if key in seen:
            continue
        seen.add(key)
        remote = image.startswith(("http://", "https://"))
        url = image if remote else urllib.parse.urljoin(args.base.rstrip("/") + "/", image)
        path = ROOT / urllib.parse.unquote(image)
        local_state = "EXTERNAL_DEPENDENCY" if remote else ("PRESENT" if path.is_file() else "MISSING")
        result, status, mime, error = ("NOT_TESTED", "", "", "")
        if args.live:
            result, status, mime, error = check(url, args.timeout)
        rows.append(dict(specimen=specimen, source=source, reference=image,
                         local_state=local_state, url=url, public_test=result,
                         http_status=status, content_type=mime, error=error))
    with open(args.output, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["specimen","source","reference","local_state",
                                              "url","public_test","http_status","content_type","error"])
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps({"report":args.output, "records":len(rows),
                      "external":sum(r["local_state"]=="EXTERNAL_DEPENDENCY" for r in rows),
                      "missing_local":sum(r["local_state"]=="MISSING" for r in rows),
                      "public_failures":sum(r["public_test"]=="FAIL" for r in rows)}, indent=2))
    return 1 if any(r["local_state"]=="MISSING" or r["public_test"]=="FAIL" for r in rows) else 0

if __name__ == "__main__":
    sys.exit(main())
