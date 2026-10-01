# MycoSim Phase 7 — Complete Developmental Library Contract

## Objective
Complete the developmental library only after establishing the Phase 6 regression standard.

The target is one anatomically consistent morphology system expressed across three developmental states:
- Young
- Mature
- Old

Mature is the non-negotiable canonical reference model. Young and Old are transformations of the same anatomy and stable anatomy IDs.

## Supported families
- Agaricoid
- Boletoid
- Bracket polypore
- Hoof / conk
- Stipitate hydnoid
- Hydnoid bracket
- Morel / morchelloid
- Coral / clavarioid
- Puffball / gasteroid
- Cup fungus / discomycete
- Jelly fungus
- Resupinate crust

## Canonical-model invariant
For every family:
1. Mature is the canonical reference stage.
2. Young and Old reuse the same anatomy schema and stable IDs.
3. Developmental transforms may change geometry, proportions, wear, exposure, maturity, and tissue state.
4. Developmental transforms may not silently create a different anatomical vocabulary.
5. Hover, focus, isolation, dissection, transparency, and educational navigation must continue to address the same anatomy IDs across stages.

## QA matrix
The live Regression QA panel renders every supported family × stage combination.

Status values:
- PASS — all Phase 6 runtime checks passed
- FAIL — at least one Phase 6 runtime check failed
- NOT RUN — the current browser/session has not executed the regression suite

No NOT RUN or FAIL cell may be represented as PASS.

## Release sign-off
A full developmental-library release is signed off only when:
- all 36 family × stage cells are PASS
- repeated-switch memory QA passes
- specimen-write isolation reports zero writes
- desktop regression passes
- an actual mobile viewport regression passes

The support matrix is generated from the same profile and stage registries used by MycoSim; it is not a manually maintained marketing list.
