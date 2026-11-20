# Atlas image publication

## 01 — Prepare the reviewed copies

- Keep master files, permissions and the original Drive inventory in private storage. Stage only files explicitly cleared for the public Atlas. Record the release basis and accession for each batch. If the accession or permission is unresolved, retain the catalog description and leave its binary out of the public tree.
- Use `assets/<lowercase-accession>/<category>/<original-filename>` with categories such as `field`, `preparation` and `microscopy`. Inspect image content and metadata before release. For exact-byte publications, record the byte count and SHA-256 of the named capture. If a public copy needs conversion or redaction, retain the original privately and record the derivative and its separate SHA-256.
- For microscopy, use the [existing intake script](../scripts/ingest_microscopy.py) with a reviewed ZIP in the documented accession manifest format. Run it without `--apply` first. Preserve provenance, original overlays and capture-specific captions. Annotated micrometer values enter the formal measurements dataset only when their calibration and measurement basis have been verified.
- For other image categories, add an accession gallery script under `research/` and load it before `app.js` in [index.html](../index.html). Follow the checked-in JN1-F29 field gallery pattern. Both `original` and `thumb` must resolve to Atlas-hosted assets. Copies of archive photos can replace their `archive-only` catalog records when the file-to-record association is verified. Retain the captions and metadata. The old bulk Rutgers importer overwrites the catalog and is retired for this publication workflow.

## 02 — Verify and deploy

1. Run `node scripts/verify_atlas_images.cjs` from the repository root. It checks all image paths wired to the public gallery, blocks Drive links in loaded media catalogs, and checks the microscopy manifests against asset bytes and the correct accessions.
2. Serve the root on port 8765 and run `node scripts/verify_atlas_images.cjs http://127.0.0.1:8765/`. Run `node tests/public-atlas-no-drive-links-20261117.cjs` with Playwright Chromium and WebKit installed to check image decoding, the viewer and Drive-free gallery navigation.
3. Commit and push verified changes to `main`. Confirm that Render made the exact commit live. Run `node scripts/verify_atlas_images.cjs --access-only https://jockey-hollow-atlas.onrender.com/` to check HTTP 200, image MIME, binary signatures and the absence of redirects or authentication for every gallery URL. Set `ATLAS_ORIGIN` to the same URL to repeat the browser check on production.
4. For exact-byte verification, run the same HTTP command without `--access-only`. Render's CDN can apply Cloudflare Polish to image responses. The audit reports these byte differences independently of image access. Use a pinned GitHub commit and the accession's SHA-256 manifest to retrieve and verify the exact published original files. A display response with different bytes should be treated as a derivative.

## 03 — November 20, 2026 legacy baseline

The source catalogs contained 329 legacy rows in `drive_data.js`, 100 in `bn1_drive_data.js` and 129 in `supplemental_media.js`. These 558 rows represented 458 unique Drive image IDs and 1,674 URL occurrences across original, thumbnail and source-view fields. Anonymous thumbnail GETs for all 458 unique IDs landed on a Google Accounts sign-in page. The old video catalog also linked a Drive poster and two video URLs. The public catalog retains the descriptions and accessions for these records as text.

The [JN1-F32 dossier](../research/jn1-f32/RESEARCH_NOTES.md) and [capture manifest](../research/jn1-f32/microscopy-intake.json) document the 12 authorized PNGs and the limits of the evidence.

## 04 — RUT19WORKEX Priority restoration

The inherited checkpoint was GitHub `da27dd5698d34edad3e146ef2cd2731e34ae8839` and Render `dep-dc07c0vlk1mc73etib6g`. It had 852 gallery cards, 1,454 anonymously accessible image paths and 437 archive rows. The review inventory accounted for 458 unique original captures, 327 accession-linked review records, 100 shared-source references and 10 inherited holds.

The Priority release adds 19 AN2-F9 display images and 12 AN2-F34 display images. It matches one AN2-F34 archive entry to an existing gallery card. The [display manifest](../research/atlas_priority_display_manifest_20261120.json) ties the 32 gallery associations to published paths, dimensions and checksums. All 32 source captures matched the private inventory. The 12 microscopy copies preserve decoded pixels and visible annotations. The reviewed captions preserve calibration uncertainty.

The expected result is 883 gallery cards, 1,485 image paths and 405 archive rows, including the two held AN2-F12 originals. The 10 inherited holds and 22 subsequent assignment or evidence holds remain in force. Shared-source references retain their archive records. The private handoff register lists 273 Follow-on associations, of which 259 require new derivatives and 14 reuse public assets. File-specific clearance must be confirmed before any of those associations are released.
