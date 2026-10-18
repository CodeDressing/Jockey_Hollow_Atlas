# MycoSim Upgrade Campaign - 2026-10-18

## Architecture: one consolidated laboratory
Retain the tabbed MycoSim workspace, one shared glossary, and distinct scientific models only when anatomy or scale warrants them. Do not duplicate renderers without resource profiling. Preserve Phase 9-12 and original specimen records.

## Sprint 1 - Automatic reliability: COMMITTED, CI outcome unverified
- Dependency-free Node contract tests protect modules, scientific caveats, glossary, and release HOLD rules.
- GitHub Actions runs contract checks before the Chromium/Playwright suite.
- Browser regression covers Phase 9-12, Phase 13, mobile layout, keyboard navigation and module deduplication.
- Traces and screenshots are configured for failing browser tests.

## Sprint 2 - Unified 3D orchestration: PLANNED
- Add shared lifecycle, camera and cleanup interfaces while keeping distinct scientifically meaningful meshes.
- Profile scene-switch latency, geometry allocations, and GPU memory before renderer consolidation.
- Gate on no lost controls and passing prior regressions.

## Sprint 3 - Evidence-aware scientific learning: PLANNED
- Link terminology, pronunciation, definitions, readback, and evidence metadata to one registry.
- Record DOI/PMID, preparation, model type, and evidence grade in source reviews.
- Treat oral exposure and Dectin-1 binding as an unresolved bridge; do not equate whole powder with PSK/PSP.

## Sprint 4 - Specimen realism and microscopy: PLANNED
- Age-resolved morphology, underside and substrate views, magnified cell/anatomy layers.
- Flag observed vs inferred vs schematic features.
- Require anatomical review and performance thresholds, no edible identification certification.

## Sprint 5 - Research integrity and cross-atlas exchange: PLANNED
- Versioned export/import schema with provenance, evidence levels and checksums.
- User-controlled transfers; no automatic personal-data uploads or implied remote sync.
- Contract compatibility, data integrity and privacy acceptance tests.

## Release decision
Prior user-run browser smoke results: Phase 9 21/21, Phase 10 20/20, Phase 11 17/17; Phase 12 local schema verified (no remote sync). This is historical baseline, NOT a new CI result. Phase 13 scientific, visual, screen reader, endurance and production acceptance remain conditional.