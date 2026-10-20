# MYCOSIM — Restoration & Excellence Campaign
Date: 2026-10-19
Status: Sprint 1 begun; audit / documentation only. NO PRODUCTION CHANGES.
Repository: CodeDressing/Jockey_Hollow_Atlas
Baseline production commit: f169be3fb8e8171cb59adb81020a94d5dc8f2a95
Earlier pre-Visual-Studio production: 32a2f4e364a49657b662bd5eee347c5ee5fdef96
Work branch: campaign/mycosim-restoration-sprint1-organization-20261019

## North star
One authoritative scientific 3D specimen renderer (mycosim/engine.js); one understandable specimen-first workspace; separate laboratories for morphology construction, comparison/identification, microscopy, life cycle and ecology, biochemistry, and instructor/research workflows. A learner sees a supported morphological change on the intended 3D specimen immediately. A simulation never auto-asserts verified identification, edibility, microscopic observations, or provenance.

## Campaign; each sprint requires review before production
1. Organization & Preservation: inventory all modules, ownership, dependencies, navigation conflicts; establish immutable baselines and functional QA checklist.
2. Aesthetics & Scientific UX: responsive specimen-first composition, consistent control systems, visual hierarchy, documented patterns.
3. Functional Integration: authoritative renderer for supported morphology; explicit unsupported-state feedback; preserve age-stage, learning, evidence and microscopy.
4. Educational Experience: instructor mode, guided learning, vocabulary/pronunciation, challenges, references and evidence boundaries.
5. Verification & Release: Chromium tests + screenshot diffs at 390/1280 px, performance, module invariants, classified access, merge/deployment/rollback checks.

## Sprint 1 — Runs
1.1 Read-only main inventory, compare baseline SHA and pre-Studio SHA; no rollback and no deletion.
1.2 Laboratory ownership map and user journey map; note current URLs/selectors and their current owner.
1.3 Identify duplicate controls, hidden teaching/navigation, unexpected scroll, and interface complexity. Categorize as preserve/move/optional/reconcile.
1.4 Propose minimal additive navigation implementation on this isolated branch only after 1.1–1.3 reviewed. No feature replacement.
1.5 Desktop/mobile behavioral baseline using established free Chromium actions; capture 3D interaction, stage, classification, spore lab, Turkey Tail, classified, instructor.
1.6 Release review. Do not merge/deploy until visual and behavioral acceptance.

## Laboratory ownership map (target, not yet implemented)
| Laboratory | Primary task | Existing assets to preserve | Scientific boundary |
| --- | --- | --- | --- |
| 1 Build a Mushroom | Select family, age, cap, stipe apex/middle/base, margin, hymenophore and substrate; see 3D changes | #stage, #modelGrid, #stageControls, #variantControls, MycoSimEngine, MORPHOLOGY_VARIANTS, optional #myco-visual-builder | Creative/custom specimen is not an identified specimen |
| 2 Identify & Compare | Inspect and compare evidence-backed observed characters and look-alikes | #observationForm, #compareCandidates, #candidateResults, identification.js, classified viewer | Unknown/not_examined remains unknown; comparison is not species confirmation |
| 3 Microscopy | Move macro to micro; spore shapes and measurements, tissues and reproduction | #sporeRows, #sporeSummary, sporelab.js, mode buttons, microscopy bridge | Diagrammatic spores explicitly distinguished from observed measurements |
| 4 Life Cycle & Ecology | Follow stages, substrates, habitat and fungal development | stage controls, development.js, ecological profiles, Trametes curriculum | Ecological relationship is not inferred solely from appearance |
| 5 Biochemistry | Mechanisms and pathways; link relevant dedicated modules | Turkey Tail curricula and pathway/external Neural Systems Atlas links | Clearly label hypothesis vs experiment vs clinical evidence |
| 6 Classroom & Research | Guided lessons, discovery challenges, read-aloud, instructor mode, notes and provenance | learning steps, discovery, presenter, knowledge.js, classified research, evidence audit | Preserve privacy and source/provenance controls |

Cross-cutting specimen state: a single authoritative MycoSimEngine instance for macro morphology. A micro teaching diagram may remain a separate renderer clearly labelled as schematic, not a second competing anatomical model. The Visual Studio currently has its own WebGL scene and extra SVG; treat these as OPTIONAL until unified and validated. Do not delete them.

## Observed organization risks (source inspected)
- sandbox.html: #stage main 3D canvas; lesson navigation has five progressive steps and guided-mode locking. Detailed morphology controls are lesson 3 (#variantControls); they can appear hidden to users in guided mode.
- The Visual Studio module mounts itself before #observationForm, creating another builder with trait controls and independent #mb-live-canvas, #mb-drawing and another advanced anatomy control surface.
- Scientific observation values (select[data-obs-value]) have event handling that may update 3D and call focus(), scrolling the viewport away from the form. Provenance and examination state must never silently change.
- A primary page includes Turkey Tail dedicated and classified species modules, presenter, learner mode, comparison, spore and QA. Location/ownership hierarchy is unclear.
- Current main vs 32a2f4e: engine.js and variants.js file SHA unchanged; Visual Studio added modules and incremental main.js/sandbox.html hooks. Source preservation is not proof of visual/behavioral equivalence.

## Preservation register / non-negotiable invariants
- All 13 MORPHOLOGY_PROFILES retained (agaricoid, boletoid, trametes_versicolor, polyporoid, hoof_conk, hydnoid, hydnoid_bracket, morel, coral, puffball, cup, jelly, crust).
- Independent stipe apex/mid/base controls and texture transitions.
- Cap disc, pileus margins, primary/secondary textures, hymenophore types and attachments, family-dependent anatomy, and developmental ages.
- Spore evidence/provenance, microscopy, taxonomic comparison interpretation boundaries.
- Classified species research assets, photographs, access protections, educational records and separated species-specific modules.
- Guided lessons, full Explore mode, read-aloud, classroom presenter, interactive discovery challenges, anatomy mode navigation.
- The on-page Turkey Tail 3D curriculum; no species misidentification or unsubstantiated health claims.
- No secrets or private photos in public route or CI; no paid services.
- Existing browser QA and free GitHub Actions remain enabled and serve as minimum safeguards.

## Experience goals / measurable gates
- On entry: meaningful single primary canvas, a clear selected family, one prominent next action; no two equal competing 3D specimen viewers.
- On change: controlled morphological choices visually affect the authoritative renderer, without scrolling the learner away unexpectedly; no Apply button needed for educational exploration.
- On Identify: record fields, evidence states and provenance separately; no automatic promotion to observed; unsupported geometry honestly identified.
- On teach: explanation and pronunciation immediately associated with selected anatomy; instructor can traverse a coherent path.
- Mobile 390px/desktop 1280px: navigation not lost, canvas touch rotation/zoom work, keyboard focus visible, no clipped actions.
- Performance: baseline initial load, interaction responsiveness and memory/draw calls compared to main before approving design changes.
- QA: existing regression suites plus screen captures and sampled anatomical selection scenarios. CI success alone is not visual acceptance.

## Immediate go/no-go rules
- Sprint 1 documentation commits to isolated branch are allowed. No UI refactor or production merge in Run 1.1–1.3.
- Never reset main, force-push, delete or re-create recent Visual Studio work.
- Any UI change requires small diff, independently reviewable PR, render screenshots/behavior, and explicit release acceptance.
- If visual outcome diverges from original teaching experience: stop, compare with 32a2f4e, repair branch or revert only the controlled feature commit after review.
- Recheck source against latest main before any implementation; other branches may have changed it.

## Sprint 1 result ledger
- Run 1.1: IN PROGRESS as of creation of this document. Verified 13 morphology profiles and existing engine plus additional studio modules.
- Run 1.2: DRAFT target taxonomy recorded above; stakeholder/visual acceptance pending.
- Run 1.3: DRAFT conflict register above; screenshots and full interactive audits outstanding.
- Runs 1.4–1.6: NOT STARTED.
