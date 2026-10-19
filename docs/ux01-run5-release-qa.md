# MycoSim UX-01 — Run 5 Release Gate
Date: 2026-10-19
Repository: CodeDressing/Jockey_Hollow_Atlas
Development branch: ux01-run1-visitor-orientation
Baseline main: 5a60eb0ebe9da605e3b46065b220c38387c1c385

## Decision
CONDITIONAL PASS — DO NOT MERGE OR DEPLOY YET.

## Source inspection completed
14/14 source-level assertions passed using freshly fetched GitHub branch and main files.
- Run 1 entrance section exists.
- Run 2 Previous/Next/Return lesson controls, progression guard and synchronized state exist.
- Run 3 discovery controls and both anatomy index / 3D selection hooks exist.
- Run 3 explanatory scientific-boundary text uses existing atlas knowledge.
- Run 4 presentation, prompt reading, stop, keyboard navigation and reduced-motion styling exist.
- 16 pre-existing mycosim script references remain in sandbox.html.
- No duplicate HTML IDs found in inspected sandbox.html.
- Existing stage, model list and anatomy list IDs remain present.
- Compared with baseline main: only sandbox.html and mycosim/main.js changed.
- Production main is still separate from the branch.

## Limitations
Source checks are not real browser execution, syntax compilation, visual inspection, screen reader verification, mobile device testing, or end-to-end 3D performance QA.
The unpublished development branch was not served through a browser test environment; GitHub network access was unavailable in the local execution container.
No claim is made that the existing 3D modules or protected specimen workflows passed runtime regression.

## Mandatory release gates
1. Serve the development branch in an isolated staging instance with production writes disabled.
2. Check JavaScript console for syntax/import/runtime errors on initial load and after all interactions.
3. Verify Guided/Explore transitions, gated Next/Previous, selection and scrolling.
4. Test an accurate and inaccurate discovery selection via both canvas and anatomy index, then change specimen family and confirm reset.
5. Test projector layout and keyboard navigation; verify button accessibility, contrast, speech cancellation, reduced motion and mobile widths 360/390/768/1280/1920.
6. Exercise existing Turkey Tail, classified specimen and agaricoid modules; validate scientific evidence and privacy separation.
7. Run the existing on-page browser QA campaign; record pass totals, performance, rendering and any failures.
8. Confirm no persistent state or dataset changes; approve release only after zero blocking defects.

## Release outcome
Run 5 static review complete. Runtime release acceptance pending. Main untouched. No merge, deployment, or customer actions authorized by this document.
