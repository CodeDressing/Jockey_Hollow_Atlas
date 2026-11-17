"""QC-001 ledger: 01 inputs; 02 local integrity; 03 HTTP identity; 04 report.

Read-only audit. Never rewrites photographs or infers publication permission.
Usage: python3 tests/qc-001-media-audit.py OUTPUT.json [BASE_URL]
"""
# SECTION 01 — INPUTS
import concurrent.futures
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path(sys.argv[1]).resolve()
BASE = sys.argv[2] if len(sys.argv) > 2 else 'https://jockey-hollow-atlas.onrender.com/'
BASELINE = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()

# SECTION 02 — LOCAL INTEGRITY
def inspect(file):
    raw = file.read_bytes()
    row = {'path': file.relative_to(ROOT).as_posix(), 'bytes': len(raw),
           'sha256': hashlib.sha256(raw).hexdigest()}
    try:
        with Image.open(file) as image:
            row.update(width=image.width, height=image.height, format=image.format)
            image.load()
        row['decode'] = 'PASS'
    except Exception as error:
        row.update(decode='FAIL', decode_error=str(error))
    return row

files = sorted(p for p in (ROOT / 'assets').rglob('*')
               if p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.gif', '.webp'})
rows = [inspect(p) for p in files]

# SECTION 03 — HTTP IDENTITY
def request(row):
    start = time.monotonic()
    try:
        url = BASE.rstrip('/') + '/' + urllib.parse.quote(row['path'], safe='/')
        with urllib.request.urlopen(url, timeout=35) as response:
            body = response.read()
            mime = response.headers.get_content_type()
            row.update(http_status=response.status, mime=mime, http_bytes=len(body),
                       cache_control=response.headers.get('Cache-Control'),
                       http_sha256=hashlib.sha256(body).hexdigest())
            row['http_identity'] = 'PASS' if (response.status == 200
                and mime.startswith('image/') and row['http_sha256'] == row['sha256']) else 'FAIL'
    except Exception as error:
        row.update(http_identity='BLOCKED', http_error=str(error))
    row['http_seconds'] = round(time.monotonic() - start, 3)
    return row

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    rows = list(pool.map(request, rows))

# SECTION 04 — REPORT
groups = {}
for row in rows:
    groups.setdefault(row['sha256'], []).append(row['path'])
summary = {'baseline_sha': BASELINE, 'base_url': BASE, 'image_files': len(rows),
           'bytes': sum(r['bytes'] for r in rows),
           'decode_pass': sum(r['decode'] == 'PASS' for r in rows),
           'http_identity_pass': sum(r['http_identity'] == 'PASS' for r in rows),
           'http_identity_fail': sum(r['http_identity'] == 'FAIL' for r in rows),
           'http_identity_blocked': sum(r['http_identity'] == 'BLOCKED' for r in rows),
           'publication_authority': 'NOT ESTABLISHED by integrity or HTTP success',
           'duplicate_byte_groups': [v for v in groups.values() if len(v) > 1]}
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps({'summary': summary, 'images': rows}, indent=2) + '\n')
print(json.dumps({k: v for k, v in summary.items() if k != 'duplicate_byte_groups'}, indent=2))
