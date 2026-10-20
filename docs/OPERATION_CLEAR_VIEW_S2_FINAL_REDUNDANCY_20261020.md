# Operation Clear View — Sprint 2 Final Report and Redundancy Audit
Date: 2026-10-20
Branch: feature/clear-view-sprint2-unified-specimen-20261020
Validated source SHA: dfb324e89cc254de5ffb1282e2481cc0bf923bbf
Draft PR #12: https://github.com/CodeDressing/Jockey_Hollow_Atlas/pull/12
Chromium run: https://github.com/CodeDressing/Jockey_Hollow_Atlas/actions/runs/39374050324
Artifact: mycosim-clear-view-sprint2-final-and-redundancy (id 12243005813; 7,609,312 bytes)
Result: 22/22 Chromium tests passed (2.3 min).
Production: **NOT changed, merged, or deployed.**

## Source changes
- Original macro MycoSim 3D renderer #stage and detailed engine unchanged.
- Original morphology #variantControls and model family controls retained.
- Removed eager execution of optional legacy creative Studio from sandbox.html; creator and visual_builder_3d.js preserved and dynamically imported on click of disclosed optional workshop.
- Preserved biology-related process simulations including #myco-family-biology, #trametes-simulator, digestion/immune, microscopy, classified links and scientific provenance.
- At width <=900px the primary 3D stage is sticky and visible while editing anatomy; responsive breakpoints at 320/390/768/960/1280/1920 tested.
- Reused existing six-laboratory navigation as a condensed edge toolbar. No seventh lab or new duplicate controls created. Desktop uses compact three-column laboratory tiles; narrow width uses two or one column.
- Optional creative module remains distinguishable from authoritative scientific specimen, never writes evidence.

## Dedicated redundancy tests
1. Exactly one default primary 3D canvas and one authoritative original morphology editor.
2. No `#myco-visual-builder`, `#mb-live-canvas` or duplicate apply workflow loaded by default.
3. Six distinct lab destinations preserved, with no duplicate target URLs.
4. Scientific observation editor, spore table, biology family module, Turkey Tail, presenter retained.
5. Morphology selection changes engine state; observation `not_examined` and provenance unchanged.
6. The legacy creative studio loads only on explicit opt-in; its additional canvas is still available; source renderer remains present.
7. At six widths, primary canvas remains visible during live morphology selection, no page-level horizontal overflow, and navigation remains touch/keyboard-sized.

## Verification
- Previous first attempt: 21/22 passed. An old Sprint 2 assertion expected >140px nav card widths at 1280px, inconsistent with explicitly requested compact edge-navigation. Updated that test to assert >=90px minimum width, >=42px height, and no card clipping; this preserves meaningful usability checks without prohibiting the new design.
- Latest complete rerun: all 22/22 passed.
- Screenshots retained as Actions artifact for independent visual inspection.
- Browser coverage in CI: Chromium. Real Safari, Firefox, macOS trackpad, physical phone touch, projector, GPU metrics and visual scientific fidelity not independently certified.

## Remaining campaign items / release gate
- Independent screenshot visual acceptance before production.
- Verify mouse/trackpad/touch behavior on real devices or additional browsers where available.
- Later sprints: clarify advanced nested editor scrolling and scientific spore table affordance without dropping provenance/measurement columns.
- Keep draft PR stack and exact head SHA under review. No merge, no paid staging/deploy without explicit user approval.
