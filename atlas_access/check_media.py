"""Build the viewer list, excluding files containing GPS EXIF or XMP."""
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image, ExifTags

ROOT = Path(__file__).resolve().parent.parent
paths = json.load(sys.stdin)
safe_paths = []
blocked = 0
for name in paths:
    file = ROOT / name
    if not file.is_file() or not file.resolve().is_relative_to(ROOT):
        raise ValueError("Missing or invalid viewer file")
    if file.suffix.lower() in {".jpeg", ".jpg", ".png", ".webp", ".gif", ".avif"}:
        with Image.open(file) as image:
            exif = image.getexif()
            metadata = str(image.info).lower()
            if ExifTags.IFD.GPSInfo in exif or any(
                field in metadata for field in ("gpslatitude", "gpslongitude", "gpsposition")
            ):
                blocked += 1
                continue
    safe_paths.append(name)

# Include delivery bytes in the review digest so a change at an existing path requires a new review.
hashes = {}
for name in safe_paths:
    with (ROOT / name).open("rb") as file:
        hashes[name] = hashlib.file_digest(file, "sha256").hexdigest()
payload = json.dumps(hashes, separators=(",", ":"), ensure_ascii=True).encode() + b"\n"
(ROOT / "atlas_access" / "viewer-files.json").write_bytes(payload)
print(json.dumps({"viewerPaths": len(safe_paths), "gpsMetadataPathsExcluded": blocked,
                  "manifestSha256": hashlib.sha256(payload).hexdigest()}))
