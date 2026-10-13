# Phase 8 — Trametes versicolor reconstruction and integration contract

Date: 2026-10-13
Status: first incremental implementation committed; browser/runtime, mobile, visual fidelity, and Render deployment not yet verified.

## Architecture
- Existing `mycosim/main.js`, `engine.js`, `knowledge.js`, `profiles.js`, `variants.js`, `stages.js`, `regression.js`, and all specimen records are unchanged.
- New opt-in module: `mycosim/trametes_sim.js`, dynamically imported by `sandbox.html` on user request.
- Independent WebGL canvas, renderer, camera, OrbitControls, scene graph and pickable meshes; existing generalized mushroom engine is unaffected by startup.
- Stable namespace: `jha:tv:1`; no private neuroscience data or Drive URLs embedded.
- Selection, orbit/zoom, isolate, hide, transparent-context, reset, voice narration, life cycle and forest-to-consumption teaching sequence are included.
- Model is procedurally reconstructed. Bark, mycelium, pore undersides, and tubes are schematic proxies, not scans or measured specimens.
- No species identification claim, no consumption safety certification, and no health-treatment claim.

## Not yet implemented
- Reuse of the main engine's rendering loop and presentation API (future convergence, only after regression-safe integration).
- Realistic exposed wood, displacement textures, individualized anatomical submeshes, real pore microgeometry and hyphal networks.
- Ten fully distinct anatomy layers, basidia/spores cell-wall molecular closeups, isolate individual bracket instances, animated temporal morphogenesis, quiz scoring, source-registry integration and full object-level evidence records.
- Browser-measured mobile FPS, accessibility audit, rendering screenshots, cross-browser tests, and verified Render deploy.

## Verification checklist (do not claim PASS until executed)
1. Open `sandbox.html`: legacy agaricoid scene renders prior to clicking new module.
2. Start Turkey Tail module: separate canvas displays decayed hardwood and multiple zoned shelf brackets; rotate/zoom/tap works.
3. Select each anatomy control; isolate, hide, transparent and reset; inspect console for exceptions.
4. Run on mobile widths 375/390/768 px; verify buttons wrap, canvas remains responsive, no input collision.
5. Switch between guided life cycle and farm-to-human flows; read-aloud and reset behavior.
6. Run existing regression matrix; compare startup timing and FPS with prior deployment.
7. Inspect network tab: no private repo or Neural Systems Atlas information is exposed.
8. Confirm Render deploy commit SHA and final live endpoint behavior.

## Evidence boundaries and source anchors
- A small RCT (24 randomized; 22 completed) examined PSP and gut microbial composition in healthy volunteers: Pallav K et al., *Gut Microbes* (2014); DOI 10.4161/gmic.29558; PMID 25006989. Preparation-specific and limited to measured endpoints. https://pubmed.ncbi.nlm.nih.gov/25006989/
- Dectin-1 recognition of appropriately presented fungal beta-glucans and SYK/CARD9 signaling are established experimentally; see `Pattern recognition receptors in antifungal immunity`: https://pmc.ncbi.nlm.nih.gov/articles/PMC4326652/
- NCI PDQ Medicinal Mushrooms discusses PSK/PSP clinical literature and limitations: https://www.cancer.gov/about-cancer/treatment/cam/hp/mushrooms-pdq
- Whole harvested Trametes versicolor powder is NOT PSK or PSP and does not inherit clinical claims from standardized preparation studies.
- White-rot digestion includes enzymatic lignin modification and carbohydrate depolymerization; timing and structure visualizations in the module are qualitative.

## Planned stages
1. Phase 8 Part 1–3: opt-in 3D reconstruction and sandbox connection (committed).
2. Phase 8 Part 4: add procedural anatomy mesh fidelity, pores and realistic timber.
3. Phase 8 Part 5: integrate selectable microlayer views and objective evidentiary citations.
4. Phase 8 Part 6: staged animation, farm-to-human evidence map and quiz.
5. Phase 8 Part 7: performance, regression and live deployment verification.

## Additive integration update — 2026-10-13

The original statement that core files were unchanged reflects the first opt-in implementation only. A second, additive integration now also exists:
- `mycosim/trametes_versicolor.js` exports a species-specific builder for the existing `MycoSimEngine`.
- `mycosim/profiles.js`, `stages.js`, `engine.js`, and `knowledge.js` gained Turkey Tail profile/stage/factory/knowledge entries; the generic polyporoid and other factories remain in place.
- Species profile ID: `trametes_versicolor`; linked anatomical and molecular knowledge includes Dectin-1, hemITAM, SYK and CARD9. Object IDs `basidiome_1` through `basidiome_8` match the species anatomy registry.
- The standalone opt-in scene and integrated model selection currently coexist. This is transitional architecture, not a finalized renderer unification.
- Static connector checks confirmed unique species profile, existence of stage, factory method, module export, knowledge map and associated navigation. These are not equivalent to browser/runtime tests.
- Render workspace remains unconfirmed for deployment management; live site not verified.
- Additional reference: https://pmc.ncbi.nlm.nih.gov/articles/PMC5453709/ (experimental antifungal innate receptor signaling). Neither pathway demonstrates ingestion efficacy of whole Turkey Tail powder.

Before claiming release: run syntax checks, WebGL browser checks, existing regression QA, mobile/touch QA and deploy SHA comparison. 
