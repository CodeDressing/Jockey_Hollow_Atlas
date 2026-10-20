# MycoSim Sprint 5 — Restoration Release Audit
Date (UTC): 2026-10-20
Status: **AUTOMATED GATE GREEN; PRODUCTION NO-GO pending independent visual review and release authorization.**
Repository: CodeDressing/Jockey_Hollow_Atlas
Production baseline at audit: f169be3fb8e8171cb59adb81020a94d5dc8f2a95
Last pre-Visual-Studio baseline: 32a2f4e364a49657b662bd5eee347c5ee5fdef96
Sprint 5 validated code commit: 3eeabb58440d8f16cc91f2c15fa8acb35025f1b6
Sprint 5 stacked PR: #8, base Sprint 4 branch; Sprint 4 PR #7 → Sprint 3 PR #6 → Sprint 2 PR #5 → Sprint 1 PR #4 → main.

## Verified facts
- PR #8 remains draft and unmerged; main and Render production not modified by Sprints 1–5.
- Main-to-Sprint-5 changes: 26 commits ahead, 0 behind, 16 changed paths (source, tests, CI, docs). Existing original engine.js and variants.js are not among changed paths.
- Full Chromium workflow: https://github.com/CodeDressing/Jockey_Hollow_Atlas/actions/runs/39368741117
- Browser job 118451491515: **14/14 passed**, 2.5 minutes, including real WebGL specimen controls.
- Screenshot and test-results artifact: mycosim-sprint5-release-evidence, id 12240259615; saved by Actions, 4,856,400 bytes, not expired as of audit.
- Verified dimensions: 390px mobile and 1280px desktop; no horizontal overflow after correction.
- Original macro #stage canvas remains in place; tests cover 13 family profile controls, individual stipe apex/middle/base, pileus and gill attachment updates, lesson navigation, educational explanations, supported form-to-3D interaction, evidence and provenance remaining not_examined/blank, Turkey Tail and classified links, source-owned scientific knowledge and narration controls.
- Explicit no-scroll/lesson-jump test passes.

## Regression discovered and resolved during this sprint
Initial full gate run 39368168627: 12 passed and 2 failed, both due to a shared 1280px horizontal overflow (scrollWidth 1399 vs viewport 1280). Follow-up diagnostic run 39368467469 located the optional Visual Studio .mb-preview / .mb-layout forced 2 columns of minimum 220px inside a narrower sidebar. Fix in mycosim/visual_builder.js: container-responsive CSS with one default minmax(0,1fr) column, two columns only when builder container width >=620px; add min-width:0 on the layout children. The next complete full gate run 39368741117 passed all 14/14.

## Release gates
- [x] Preservation-only work in separate GitHub branches.
- [x] Original engine and morphology data sources preserved.
- [x] 13 body-plan profiles remain available in Chromium.
- [x] Macro anatomy live updates + evidence isolation validated.
- [x] Laboratory navigation reachable in mobile Chromium.
- [x] Desktop/mobile no horizontal overflow after correction.
- [x] Existing education and creative studio tests pass.
- [x] Screenshot artifacts retained for review.
- [ ] Human/independent inspection of 390px and 1280px screenshots and original specimen fidelity, visual priorities, control discoverability, mobile usability. Evidence saved; automated pass does not substitute for visual acceptance.
- [ ] Longer performance profiling: first-frame latency, GPU load, memory and 3D responsiveness on representative devices.
- [ ] Explicit owner authorization to promote stacked changes into production.
- [ ] Post-deployment live website smoke tests and ready rollback plan verification.

## Release order (do NOT execute without approval)
1. Confirm PR #4 and #5 review and acceptance. Their tests were isolated; final #8 cumulative gate covers all code.
2. Merge stacked PRs carefully from bottom to top (#4 → #5 → #6 → #7 → #8), updating each child PR base to main after its parent merges and re-checking compare/checks. Never merge a child into an unmerged parent as a shortcut. Alternatively rebase/prepare ONE reviewed consolidated PR on main when appropriate, preserving history.
3. Confirm CI checks for the actual production merge candidate SHA. Require successful release gate on that exact SHA, not only the earlier draft SHA.
4. Deploy through the existing free Render service; do not create paid staging services.
5. Confirm the new exact main SHA is live; smoke-test original 3D, at least one family variant, the 6-lab navigation, scientific evidence non-promotion, Turkey Tail and classified entry points; compare user experience against 32a2f4e.
6. If a critical regression occurs: revert the isolated merge commit(s) through a normal reviewed revert commit to restore the previous known-good production state. Never force-push main or delete PR branches. Render redeploys prior tested code after revert.

## Guardrails
One authoritative original 3D morphology engine. No deleted scientific records. Unrenderable microscopic anatomy is labelled schematic/unavailable. Preserve specimen photographs, private classified material and teaching modules. Audio only starts from user gesture. Preserve learning modes and user location on trait changes. Do not assert that automated Chromium geometry-state tests establish scientific image fidelity or performance quality.

## Go/No-Go
**NO-GO for production at audit closure**. Automated correctness is green and the responsive layout defect has been fixed, but visual acceptance and explicit release authorization remain outstanding. No actual production write has occurred.
