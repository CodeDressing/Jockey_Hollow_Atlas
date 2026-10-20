# OPERATION CLEAR VIEW — SPRINT 1 RUN 1.2
Read-only nested scroll, trackpad-style wheel and keyboard focus audit
Date 2026-10-20 UTC
PR #10 — https://github.com/CodeDressing/Jockey_Hollow_Atlas/pull/10
CI: https://github.com/CodeDressing/Jockey_Hollow_Atlas/actions/runs/39371180911
Artifact: mycosim-clear-view-run2-scroll-focus-evidence (id 12241587471, 8,584,068 bytes).
16/16 full Chromium tests passed in 3.4 minutes.
All changes limited to CI/test/doc files; NO application source modifications and NO production deployment.

## Verified widths and interaction results

| Width px | horizontal internal scroll | Nested vertical scroll owners | #stage visible at Visual Studio? | Anatomy editor wheel response | Keyboard region focus |
|---|---|---|---|---|---|
| 320 | anonymous div in #sciencePanel: scrollWidth274 vs clientWidth264 (10px) | #mb-region-editor 1368/380px; #myco-term-list 327/120px | No | inner +450, page +0 | Visible solid 2px; Tab reaches next region |
| 390 | None | #mb-region-editor 754/380; #myco-term-list 253/120 | No | inner +374, page +0 | Visible solid 2px; Tab reaches next region |
| 768 | None | #mb-region-editor 754/380 | No | inner +374, page +0 | Visible solid 2px; Tab reaches next region |
| 960 | None | #mb-region-editor 1368/380 | Yes | inner +450, page +0 | Visible solid 2px; Tab reaches next region |
| 1280 | None | #mb-region-editor 754/380 | Yes | inner +374, page +0 | Visible solid 2px; Tab reaches next region |
| 1920 | None | #mb-region-editor 754/380 | Yes | inner +374, page +0 | Visible solid 2px; Tab reaches next region |

## Diagnostic root causes and disposition
1. **Critical: context loss** — original canvas #stage is not visible during Visual Studio work on 320px,390px,768px. Canvas is in a non-sticky single-column section while lower controls are thousands of pixels down. Do not duplicate or replace MycoSimEngine; use constrained single-source-of-truth viewport architecture in Sprint 2.
2. **High: nested scroll capture** — #mb-region-editor has max-height:380px and overflow:auto defined by mycosim/visual_builder.js. Wheel input is consumed locally as long as editor can scroll. Proposed minimal fix for separate remediation phase: accessible expandable details or height:auto at narrow component widths; preserve all region buttons and data.
3. **Medium: science glossary second nested scroll** — #myco-term-list is 120px tall with additional scroll only at 320/390. Preserve search functionality; consider expanding with progressive disclosure and visible control to show more. Do not remove terms.
4. **Medium: horizontal overflow limited to an anonymous DIV child of #sciencePanel** — scrollWidth 274px and clientWidth 264px at 320px, overflowX:auto. Determine exact subcomponent contents from full diagnostic JSON before changing: may be a scientific table whose horizontal scrolling is legitimate, so don't globally suppress overflow.
5. **Passed: keyboard focus and focus advancement** — Stipe apex/middle/base has solid 2px focus outline and next Tab moves to Gills+attachment, both within viewport at all six sizes. Further full accessibility requires screenreader and nonvisual focus audits beyond this experiment.
6. **Page-level fit remains clear** — no document horizontal overflow at six widths in prior Run 1.1. Internal overflow does not contradict that passing criterion.

## Recommended implementation sequence (not executed)
- Run 1.3: audit exact 320px anonymous scroll element, keyboard navigation at scroll boundaries, Safari/Firefox differences and touchscreen gesture interactions where supported by free browser QA.
- Sprint 2: fix compact specimen/editor separation and clarify single primary renderer; component-based breakpoint and anatomy editor expanding scroll mechanics.
- Gate in new tests: after selecting anatomy variant on 320/390/768 the **original** main specimen is readily visible/accessible; no forced scroll jumps; 0 page horizontal overflow; no clipped interactive controls; original educational/medical evidence boundaries preserved.
- Verify real screenshots and interaction flow before any merge/deploy.

## Confidence limits
Read-only headless Chromium, browser wheel simulation and keyboard Tab; not live macOS Safari, Apple trackpad, real phone touch, physical Windows trackball, or screenreader. The 16/16 passing tests establish measurement completion and regression health, not UX approval.

## Run 1.2 exit status
**DONE — audit and evidence captured.** Application files untouched. Production NO-GO pending later remediation and visual acceptance.
