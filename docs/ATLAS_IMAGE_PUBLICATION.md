# Atlas image publication

## 01 — Prepare the reviewed copies

- Keep master files, permissions and the original Drive inventory in private storage. Stage only files explicitly cleared for the public Atlas. Record the release basis and accession for each batch. If the accession or permission is unresolved, retain the catalog description and leave its binary out of the public tree.
- Use `assets/<lowercase-accession>/<category>/<original-filename>` with categories such as `field`, `preparation` and `microscopy`. Inspect image content and metadata before release. For exact-byte publications, record the byte count and SHA-256 of the named capture. If a public copy needs conversion or redaction, retain the original privately and record the derivative and its separate SHA-256.
- For microscopy, use the [existing intake script](../scripts/ingest_microscopy.py) with a reviewed ZIP in the documented accession manifest format. Run it without `--apply` first. Preserve provenance, original overlays and capture-specific captions. Annotated micrometer values enter the formal measurements dataset only when their calibration and measurement basis have been verified.
- For other image categories, add an accession gallery script under `research/` and load it before `app.js` in [index.html](../index.html). Follow the checked-in JN1-F29 field gallery pattern. Both `original` and `thumb` must resolve to Atlas-hosted assets. Copies of archive photos can replace their `archive-only` catalog records when the file-to-record association is verified. Retain the captions and metadata. The old bulk Rutgers importer overwrites the catalog and is retired for this publication workflow.

## 02 — Verify and deploy

1. Run `node scripts/verify_atlas_images.cjs` from the repository root. It checks all image paths wired to the public gallery, blocks Drive links in loaded media catalogs, and checks the microscopy manifests against asset bytes and the correct accessions.
2. Serve the root on port 8765 and run `node scripts/verify_atlas_images.cjs http://127.0.0.1:8765/`. Run `node tests/public-atlas-no-drive-links-20261117.cjs` with Playwright Chromium and WebKit installed to check image decoding, the viewer and Drive-free gallery navigation.
3. For this Atlas, CPND means commit, push to GitHub, deploy to Cloudflare Pages, and verify live production. For reconciliation, fetch, pull, audit, reconcile, validate, commit, push, merge through the existing GitHub controls, deploy to Cloudflare Pages, and verify. Keep scientific and release holds attached to their accessions.
4. The production project is `jockey-hollow-atlas`, connected to `CodeDressing/Jockey_Hollow_Atlas`. Verify the production branch, build command, and output directory in Cloudflare before integration. Record the last known-good deployment, then confirm the deployment succeeded for the intended commit and record its deployment ID. Render configuration and past Render deployment entries are historical.
5. Verify the production release at [jockey-hollow-atlas.pages.dev](https://jockey-hollow-atlas.pages.dev/). Run `node scripts/verify_atlas_images.cjs --decode --access-only https://jockey-hollow-atlas.pages.dev/` and set `ATLAS_ORIGIN` to the production URL for the browser suite. For strict hash verification, omit `--access-only`. Inspect any differing responses before certifying exact-byte delivery.

## 03 — November 20, 2026 legacy baseline

The source catalogs contained 329 legacy rows in `drive_data.js`, 100 in `bn1_drive_data.js` and 129 in `supplemental_media.js`. These 558 rows represented 458 unique Drive image IDs and 1,674 URL occurrences across original, thumbnail and source-view fields. Anonymous thumbnail GETs for all 458 unique IDs landed on a Google Accounts sign-in page. The old video catalog also linked a Drive poster and two video URLs. The public catalog retains the descriptions and accessions for these records as text.

The [JN1-F32 dossier](../research/jn1-f32/RESEARCH_NOTES.md) and [capture manifest](../research/jn1-f32/microscopy-intake.json) document the 12 authorized PNGs and the limits of the evidence.

## 04 — RUT19WORKEX Priority restoration

The inherited checkpoint was GitHub `da27dd5698d34edad3e146ef2cd2731e34ae8839` and Render `dep-dc07c0vlk1mc73etib6g`. It had 852 gallery cards, 1,454 anonymously accessible image paths and 437 archive rows. The review inventory accounted for 458 unique original captures, 327 accession-linked review records, 100 shared-source references and 10 inherited holds.

The Priority release adds 19 AN2-F9 display images and 12 AN2-F34 display images. It matches one AN2-F34 archive entry to an existing gallery card. The [display manifest](../research/atlas_priority_display_manifest_20261120.json) ties the 32 gallery associations to published paths, dimensions and checksums. All 32 source captures matched the private inventory. The 12 microscopy copies preserve decoded pixels and visible annotations. The reviewed captions preserve calibration uncertainty.

The expected result is 883 gallery cards, 1,485 image paths and 405 archive rows, including the two held AN2-F12 originals. The 10 inherited holds and 22 subsequent assignment or evidence holds remain in force. Shared-source references retain their archive records. The private handoff register lists 273 Follow-on associations, of which 259 require new derivatives and 14 reuse public assets. File-specific clearance must be confirmed before any of those associations are released.

## 05 — RUT20WORKEX Follow-on reconciliation

The verified media checkpoint was GitHub `745ee9d4feee2f0bf9a6c2c601ab7e0375f750a7` and Render `dep-dc09c0h42hec73f6hro0`, with production acceptance recorded in [PR #80](https://github.com/CodeDressing/Jockey_Hollow_Atlas/pull/80). The gallery inventory at that commit has 883 cards, 1,485 image paths and 405 archive rows. This reconciliation updates the ledger only. The deployed commit and current acceptance results are recorded on its pull request.

| Archive records | Count | Disposition |
| --- | ---: | --- |
| Follow-on candidates requiring new display copies | 259 | The file-level register specifies derivative hashes and destinations. Publication requires an affirmative rights record for each approved file or an explicitly authorized batch listing its files. |
| Follow-on candidates mapped to existing public images | 14 | The proposed destinations are already in the indicated galleries. AN2-F13 and one AN2-F21 preparation row have a category conflict with their proposed specimen-macro cards. Retain the archive rows pending clearance and evidence for those conflicting associations. |
| Shared-source records | 100 | The private crosswalk maps 81 to Follow-on candidates and 19 to held records. Retain the source rows and avoid duplicate image binaries. |
| Active release holds | 32 | Ten inherited holds and 22 assignment or other evidence holds remain active, including the two AN2-F12 originals. |

The 273 Follow-on rows span 72 accessions. The register and private inventory provide attribution leads and checksums. Neither records an affirmative rights grant for these candidates. The next executable batch is the set explicitly cleared by the photographer or rights holder, identified by original filename and accession or by the exact manifest rows. Check the approved files against the staged derivative hashes before integration and preserve all existing scientific holds.

The AN2-F7 gallery contains all eleven expected microscopy views. The AN2-F9 gallery contains seven. Three additional accession-labelled AN2-F9 microscopy PNGs were recovered from connected research files and had no pixel-identical matches among the seven public copies. Check accession provenance, overlapping fields and file-level rights before queueing them for release. The AN2-F10 private archive contains 14 decodable PNGs matching its embedded manifest hashes. The current public research notes describe the intake. The microscopy files remain under the existing voucher, scientific and publication holds. No direct USB inspection was performed.

### Physical-device acceptance

1. Open the live Atlas in a private browser window and search for AN2-F7, AN2-F9 and AN2-F34.
2. Filter to microscopy, then restore the all-image filter. Check that thumbnails load, captions stay readable, and a full-size view opens and closes correctly.
3. On Android and iPhone, rotate the screen and test pinch zoom and drag. On Windows Edge, test wheel zoom and drag. Record the device, browser version, accession and any image that fails.
