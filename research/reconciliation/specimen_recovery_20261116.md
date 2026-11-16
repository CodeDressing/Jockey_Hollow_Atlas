# Jockey Hollow Atlas — Verified Specimen Recovery Sprint (2026-11-16)

## Protected baseline

- Production GitHub `main`: `258d44dec18566a0d1f98deb750ef3120b2f0e90` at sprint start.
- Render static-site deployment was live on the exact same SHA.
- All work isolated on `recovery/specimen-evidence-intake-20261116`; no historical branch rewritten, no existing original image replaced.

## AN2-F12, draft PR #21 — fully retained, do NOT replay old PR

- Original files `IMG_6021.jpg`, `IMG_6022.jpg`, `IMG_6023.jpg`, `IMG_6024.jpg` already exist on `main`. Each original Git blob SHA exactly equals the file on draft PR #21 head `0bda3a25a69a4492df2359b5c58989f7720dfee2`.
- Current `research/an2_f12_enrichment.js` references all four, plus **five** laboratory preparation JPGs and **fourteen** microscopy PNGs present in `assets/an2-f12/microscopy/`. The current enrichment has more later evidence than the PR #21 original enrichment; never overwrite it with the older file.
- `measurements_data.js` records source cap diameter 7 cm, stipe top/middle/base 1.5/1.1/1 cm, height 8 cm, and the extra 9.5 cm value **unassigned** to a field. All retained unchanged.
- The researcher reports beige spore print and smooth stipe; microscopy objects and taxonomic determination remain unconfirmed. Voucher, photographer and publication-rights verification stays unresolved. No scientific holds were lifted.

## AN2-F10, draft PR #30 — provisional microscopy note recovered, images withheld

- Draft head `f8066f284276bf0f4d89c5ae9689b8401341d33c` contains image descriptions and references to fourteen `AN2-F10 SPORE MICROSPORE PICS` PNGs, but repository `main` contains **none** of their anticipated `assets/an2-f10/microscopy/` binaries.
- Recover only carefully attributed *historical intake notes*, not broken paths. New script `research/an2_f10_recovered_intake_20261116.js` documents source-reported ambiguous refractile structures, preliminary line-tool annotations approximately 2.34–12.57 µm, absence of validated spore size distribution, and undetermined species.
- Keep the gallery unmodified and public binary publication **on hold** pending exact original-image transfer, checksum confirmation, review of rights, and gallery decode/navigation QA.
- Do **not** auto-promote AN2-F10 to curated scientific completion solely because a historic draft includes that proposed UI change.

## AN2-F18, draft PR #33 — original unsuccessful-isolation record retained

- Current `research/an2_f18_enrichment.js` already records the unsuccessful spore isolation, probable tissue/debris as provisional interpretation, uncertain ovoid objects, and no validated basidiospore dimensions.
- The six `AN2-F18 SPM` original PNGs are **not** under `assets/an2-f18/microscopy/` on `main`. Draft #33 only adds links that would be broken. Hold the draft and its images; do not add those links to the live gallery.

## BN5-F22 / BN5-F25 / BN5-F8(B), draft PR #59 — seven-photo manifest safely recovered

- The full original, JSON source manifest from draft head `922100bf00e935401b4f16117ffc612d6800f8f7` is copied **byte-for-byte**, Git blob `24f47437ceaf1b4b069e237d0afdd9054ba4891c`, into `research/recovered/bn5_sporeprint_photograph_intake_20261115.json`.
- Seven filenames, accession association, sizes and SHA-256 *expected* checksums are preserved. Their proposed original JPG bytes are not in the expected `assets/intake-20261115/` paths. Similarly named older files in `assets/originals/` are not considered replacements and were not overwritten.
- No images published and no source claim converted to a verified observation.

## Release acceptance

- Free Chromium/MycoSim regression must pass in both 390px and 1280px, including JN2-F3 and Chet record regressions inherited from main.
- New `tests/specimen-recovery-20261116.cjs` checks AN2-F10 source-attributed notes and absence of broken gallery assets; AN2-F12 current four source JPGs and all 14 microscopy images remain; AN2-F18 unsuccessful-isolation warning persists; BN5 manifest retains 7 distinct SHA-256 entries and no implied publication of missing binaries.
- The absence of source binaries and outstanding publication rights are **blocking conditions**, not minor optional tasks.
- Upon any approved merge, verify Render production's exact merge SHA. No broad merge of draft #21, #30, #33 or #59; all older scientific holds preserved.

**Outcome:** One safe research record supplementation (AN2-F10) and one immutable historical manifest recovery (BN5), while AN2-F12 and AN2-F18 are left unchanged because their appropriate existing work is already on main. Image publication is still incomplete for three held intakes.
