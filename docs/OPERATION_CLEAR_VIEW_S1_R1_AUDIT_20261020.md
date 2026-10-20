# OPERATION CLEAR VIEW — Sprint 1 Run 1.1
Read-only responsiveness and 3D usability diagnostic.
Date: 2026-10-20
Target branch: campaign/mycosim-restoration-sprint5-release-gate-20261020 (baseline SHA 17484db62243abc5b5d36ba6a2b573659d257948).
Audit branch: audit/operation-clear-view-s1-r1-20261020.
Scope: diagnostic test/workflow only, no app source modifications.
CI: https://github.com/CodeDressing/Jockey_Hollow_Atlas/actions/runs/39370366263
CI artifact: mycosim-clear-view-six-viewport-evidence (id 12240913725, 8,430,600 bytes), containing test-results/clear-view/diagnostic.json and 12 viewport screenshots (entry + Studio for each width).

## Measured desktop/mobile matrix
All 15 tests in the complete Chromium suite passed (2.9 min), no JS page errors in the six-width diagnostic, and no page-level horizontal overflow measured in this branch.

| Width (CSS px) | Page horizontal overflow | Main 3D canvas visible while Visual Studio is editing | ScrollY while editing (px) | Main layout columns | Studio columns |
|---|---:|---|---:|---|---|
| 320 | 0 | NO | 7696 | 320 | 230 |
| 390 | 0 | NO | 6392 | 390 | 300 |
| 768 | 0 | NO | 4668 | 768 | 329 + 329 |
| 960 | 0 | YES | 7055 | 620 + 340 | 239 |
| 1280 | 0 | YES | 6024 | 883 + 397 | 296 |
| 1920 | 0 | YES | 5802 | 1480 + 440 | 331 |

**Interpretation:** page-fit tests are insufficient. At <=900px the primary 3D canvas is an earlier nonsticky document section and not available at edit time. On 960+ desktop the 3D model remains sticky on screen, but the optional Studio sits thousands of pixels down a long stacked control column.

## Defect inventory
### CV-001 Critical: model/controls separation in narrow viewports
At 320/390/768px the original #stage is not in view when #myco-visual-builder is in view; users cannot visually assess 3D trait changes without traveling far backwards. 390px primary #stage y~-6332 while editing. Prioritize a unified model-plus-control interaction pattern, not another independent renderer.

### CV-002 High: extreme navigation distance and mixed modules
On widths from 320 to 1920, initial editing access involved 4,668–7,696px of document scroll; although sticky canvas makes >=960px partly usable, learners must still traverse repeated lessons and long forms. Need laboratory-specific content staging/disclosure and discoverable route to original specimen, while retaining all content and learning modes.

### CV-003 High: competing model context
The original #stage and the optional #mb-live-canvas are separate canvases. On mobile, the original is offscreen while Visual Studio is active; on desktop both can exist simultaneously, weakening the single-source-of-truth user mental model. Preserve both source modules but establish a clear primary editing target and secondary schematic mode.

### CV-004 Medium: nested advanced anatomical editor scrolling
The advanced #mb-region-editor has scrollHeight 754 or 1368px with clientHeight 380px, depending on viewport and rendered layout. This creates a scroll-inside-scroll experience. It requires an explicit, accessible expansion strategy or contextual navigation, not a global overflow:hidden fix.

### CV-005 Medium: internal horizontal scrollable elements
A nested horizontally scrollable element was detected at 320 and 960px; no page-wide overflow occurred. Full diagnostic.json contains element detail; diagnose whether the scroll is intentional (e.g. scientific table) or an accessibility defect in Run 1.2. Do not hide legitimate tabular overflow.

### CV-006 Medium: viewport-breakpoint transition
At 768px the workspace is single-column (primary 3D displaced); at 960px it is side-by-side (primary sticky). The hard 900px breakpoint plus internal container CSS influences behavior. Need behavior based on available **component** width and a realistic half-window workflow rather than nominal desktop/mobile device labels.

## Evidence / confidence
- Six entry screenshots and six scrolled-to-Studio screenshots, JSON per-viewport reports, logged grid-template columns and horizontal scroll details.
- Browser: Chromium in free GitHub Actions; audit executed against restoration branch code, not live Render production.
- The tests did not certify macOS Safari, Firefox, real touch gesture feel, accessibility with screen readers, instructor usability, full scientific/visual fidelity, or GPU/memory performance.
- No page-level overflow in this branch does not disprove the user's screenshots from earlier production states or OS/browser variations.
- User-provided screenshots separately corroborate secondary preview crowding, excessive vertical scrolling, and confusing 3D/editor separation.

## Run 1.1 exit criteria
[x] Six target viewport widths examined.
[x] Main & secondary 3D canvas visibility during editing recorded.
[x] Nested vertical scroll surfaces identified.
[x] Page-level horizontal overflow and local scroll areas measured.
[x] Visual evidence and machine-readable metrics captured.
[x] All existing application source files left unchanged.
[x] No production changes, merges, deploys, paid services or external accounts created.

## Next authorized step
Operation Clear View Sprint 1 Run 1.2: target scrollable/clipped-element provenance (especially the unnamed 320/960 horizontal surfaces), check focus trapping and browser scroll behavior, isolate visual hierarchy changes on separate feature branch. Proceed only after controlled acceptance. No deploy.
