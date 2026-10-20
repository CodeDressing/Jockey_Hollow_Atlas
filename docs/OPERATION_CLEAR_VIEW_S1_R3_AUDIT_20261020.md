# Operation Clear View — Sprint 1 Run 1.3
Root cause verification | 2026-10-20 UTC
Status: diagnostic complete, application unchanged, production unchanged.
CI https://github.com/CodeDressing/Jockey_Hollow_Atlas/actions/runs/39371942501
Artifacts: mycosim-clear-view-run3-root-cause-evidence, artifact id 12242191648, contains root-causes.json and prior full suite evidence.
17/17 Chromium browser tests passed in 3.8 minutes.

## Findings
- The anonymous horizontal scroll container inside #sciencePanel is the intentional wrapper `<div style="overflow:auto">` enclosing `table.spore-table` with spore length, width, evidence state, provenance, source image, notes and remove button. Width 320: 297px table content versus 264px wrapper, overflow 33px. Width 960: 297px versus 273px, overflow 24px. Widths 390/768 did not exhibit the same wrapper overflow in this Chromium run. DO NOT delete scientific data fields; consider labelled and keyboard-accessible scroll area or compact form layout.
- The original Visual Studio #mb-region-editor is constrained by `max-height:380px;overflow:auto;overscroll-behavior:contain`. Tested inner scroll ranges: 988px at 320/960, 374px at 390/768. At both top and bottom, additional simulated wheel gestures left outer window.scrollY unchanged. Keyboard focus moved from Conical to Campanulate with visible solid outline on all tested widths.
- Primary original #stage remains offscreen while editing on <=768px from prior runs; this is the dominant accessibility and UX context-loss issue. This run does not modify the renderer or layout.
- `overscroll-behavior:contain` is an identified CSS contributor to not chaining wheel scroll to the document once the nested editor reaches an edge. Do not change it without regression checks and thought for touch behavior.

## Remediation specification (later implementation, NOT applied)
1. Keep the source-of-truth #stage in view (or one-tap reachable without long page travel) during compact editing. Prefer interactive compact workspace rather than a duplicate second authoritative canvas.
2. Preserve advanced stipe, pileus, hymenophore and surface controls; replace trapped 380px scroll with understandable disclosure or an accessible expanded region, especially at <=900px.
3. Retain all spore evidence/provenance input columns; when horizontal overflow is unavoidable, add a visible scroll affordance, descriptive accessible label, and keyboard navigation or use compact vertical row cards in narrow widths.
4. Verify at 320/390/768/960/1280/1920 widths and ordinary pointer/keyboard interactions; additional Safari/Firefox/real-device verification is still outstanding.
5. Maintain no production changes or source edits during diagnosis. No release authorization implied by passing diagnostics.

## Limitations
Chromium simulated wheel/keyboard interactions, not verified Safari macOS behavior or physical trackpad/touchscreen. The 17/17 green suite verifies measured diagnostic execution and existing functional regression, not full UX acceptance.

## Exit decision
Run 1.3 COMPLETE. Operation Clear View Sprint 1 diagnosis complete. Next: Sprint 2 responsive repair in a separate additive, reversible feature branch, subject to actual visual screenshots and release checks.
