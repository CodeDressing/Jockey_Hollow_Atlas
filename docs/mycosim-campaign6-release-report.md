# MycoSim Campaign 6 — Human Biology Laboratory Release Report

Date: 2026-10-19
Repository: CodeDressing/Jockey_Hollow_Atlas
Branch: mycosim-campaign6-human-biology
Base: ux01-run1-visitor-orientation at 73090486

## Campaign execution

- Run 6.1: Added a visible organ-to-barrier-to-cell schematic with Start 3D exploration action in the original viewport.
- Run 6.2: Added a modest diffuse front fill light to the existing 3D scene. Existing geometry remains schematic and NOT TO SCALE. This is *not* an anatomically accurate mesh replacement.
- Run 6.3: Moved original organ modes, magnification, and selected-structure tools behind an expandable Advanced 3D controls disclosure. Existing five-chapter guided progression remains the primary course navigation.
- Run 6.4: Preserved chapter teaching questions and speech playback; added stop narration and learner-visible science-status metadata.
- Run 6.5: Reviewed changes against the base module; used ECMAScript parse check and static invariants. All corrected checks passed.

## Verified invariants

- JavaScript compiles with the two module import declarations removed only for parsing in a standalone V8 Function check.
- Exactly one existing WebGLRenderer constructor remains.
- Exactly one original anatomy canvas ID remains.
- Original anatomical mode definitions are unchanged, compared byte-for-byte between base and branch.
- Existing lesson chapters, selection UI, QA tools, and science warnings remain in source.
- Start guided lesson reaches the new start path.
- No existing live site or main branch changed by Campaign 6.
- Compare reports only mycosim/anatomy3d.js modified for this campaign at this checkpoint.

## Outstanding release blockers (not verified)

1. Run a real browser against an isolated staged branch to verify WebGL, canvas dimensions, selection, organ/cell/tissue/micro mode switching and error handling.
2. Run existing on-page QA (Phase 10/25/26/27/28 and additional applicable campaigns), record pass/fail counts.
3. Test keyboard, focus, screen reader, speech stop, reduced-motion, touch and 360/390/768/1280/1920-pixel widths.
4. Review colors, zoom, anatomy realism and readable classroom projector layout; do not claim clinical-scale precision.
5. Inspect console for errors, long-session GPU leaks, loading speed and regression across Turkey Tail / classified / agaricoid modules.
6. Verify that demonstration of Dectin-1 and neural receptors is not presented as verified oral Turkey Tail efficacy.
7. Obtain explicit production deployment approval after all gates pass.

## Release decision

SOURCE GATE: PASS.
RUNTIME / VISUAL / SCIENCE REVIEW: NOT COMPLETE.
PRODUCTION RELEASE: HOLD. No merge or deployment performed.
