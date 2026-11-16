# Atlas specimen-evidence completeness and recovery gate — 2026-11-16

## Verified production baseline
- GitHub `main` and Render live were both exactly `807063567d9b6bd32067b85ff66d271f6a6ada4b` at the start of the audit.
- Render service `srv-dankm6ajnfac738v4k1g` is a GitHub-backed static site, published from `main` with automatic deployments enabled. The previous successful deployment `e7e91707c1126c17c28171d7b6f78d3fc930788f` was shown deactivated but available in deployment history.
- A recursive GitHub tree query returned 1,390 tracked entries, including 1,252 image files; the tree was not truncated. Counts are of repository entries, not proof of all images rendering or independent publication rights.
- Static checks found all matching literal `assets/` and `research/` image/script references in the inspected source paths present in the tracked tree. This does not test Google Drive thumbnail accessibility or every URL at runtime.

## Classification findings
- Current 'curated full' classification is based on 11 explicit accession IDs. Retain that historical editorial designation rather than silently adding/removing entries.
- 'Partial' previously relied on >=2 image categories / images or >=3 photos in one category, not validated species identity, spore recovery, measurements, or rights. **A partial record may still have extensive media** and should not imply scientific regression.
- This change adds a read-only field/lab/print/microscopy/measurement coverage matrix and an 'extensive documentation' description for multi-category specimens with >=6 linked photos and >=3 of four major photo categories. It does **not** auto-promote any record to curated full status.
- Photographed microscope fields are not proof of isolated basidiospores. Scientific identification, original voucher chain, legal authorization and publishing rights remain separate from media presence.
- For AN2-F10, AN2-F12, AN2-F22, retain the existing research/publication hold warning, with no inferred custody or authorization. Rutgers release gates G6–G10 and additional holds remain unchanged.
- Original field and microscopy photos of JN1-F11: 8 field + 7 microscopy files linked on main. CI now asserts their 15 paths exist, are distinct, accession-tagged, and nonempty; the three older spore/preparation images remain separate.

## Test and protection plan
1. Run the free Chromium/MycoSim browser release gate for both 390px and 1280px, and check the Atlas UI evidence classifications, JN1-F11 extensive documentation, AN2-F12 hold, and no JavaScript runtime exceptions.
2. Run the new read-only media reference integrity check in the same GitHub Action. It must not generate or modify binary originals.
3. Reject PR merge if tests fail or `main` advances unexpectedly. Confirm exact merge SHA and matching Render live deploy afterward.
4. No mass merge of open Rutgers, FIELDMASTER, image-intake, or MycoSim drafts; no scientific release-hold overrides.

## Recovery audit
Git history and Render deployment history provide a **candidate application-code rollback path**, but are not proof of independently verified backups. This audit found no standalone, externally verified and restore-tested repository-plus-original-media backup. The existing `mycosim/PHASE6_BUG_RECOVERY.md` is a targeted engineering note, not an archive of original specimen media. Do not advertise disaster recovery as completed.

Before changing production, record `main` and Render SHA; if a deploy fails, revert the specific merge using a fresh reviewed PR from the correct baseline, re-run free browser tests, and confirm Render's exact live SHA. Never rewrite public Git history or delete original images to attempt recovery. Verify separate backups and restoration of primary microscope/field assets in a future campaign.

## Release disposition
Evidence display and test-only correction. Does not imply 'complete scientific dataset' or legal release.
