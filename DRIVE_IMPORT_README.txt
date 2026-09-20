MycoScope — Rutgers Google Drive Photo Import

PURPOSE
Import every photograph from the Rutgers Google Drive folder into the deployed MycoScope application without guessing specimen assignments.

WHAT THE IMPORTER DOES
- Recursively scans every photo under the local Rutgers folder.
- Converts HEIC/HEIF/JPEG/PNG/TIFF/WebP to web-safe JPEG.
- Creates full-resolution diagnostic images plus thumbnails.
- Perceptually checks the new photos against existing MycoScope originals so obvious duplicates are not added twice.
- Attaches photos only when an existing accession code is explicit in the source path/filename.
- Preserves uncoded photos in collection-level DRIVE ARCHIVE records instead of guessing by visual similarity.
- Generates DRIVE_IMPORT_QA.json and refuses to report success if any source image could not be represented.

ONE-TIME SETUP
1. Download/sync the Google Drive Rutgers folder to Windows.
2. In this repository:
   py -m pip install Pillow pillow-heif

RUN
   py import_rutgers_drive_photos.py "D:\path\to\Rutgers"

VERIFY
Open DRIVE_IMPORT_QA.json. "all_source_images_represented" must be true.

DEPLOY
   git add -A
   git commit -m "Import complete Rutgers Google Drive photo archive"
   git push origin main

Render Auto-Deploy will publish the commit.
