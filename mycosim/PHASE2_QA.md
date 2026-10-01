# MycoSim Phase 2 — Fungal Morphology Library QA

## Scope
This phase expands MycoSim from a single generic mushroom into a parameterized fungal morphology simulator. MycoSim remains isolated from specimen truth and does not modify specimen records.

## Parameter libraries

### Pileus
- convex
- plane
- umbonate
- depressed
- funnel-shaped
- campanulate
- conical
- hemispherical

### Stipe
- equal
- tapering upward
- tapering downward
- clavate
- bulbous
- marginate bulb
- rooting
- lateral
- eccentric
- absent

### Hymenophore
- free gills
- adnexed
- adnate
- sinuate
- decurrent
- pores
- tubes
- teeth
- folds
- smooth fertile surface

### Veil / base
- annulus
- cortina
- volva
- universal-veil remnants
- no veil structures

## Independent morphology architectures
- agaricoid
- boletoid
- bracket polypore
- hoof / conk
- stipitate hydnoid
- hydnoid bracket
- morel / morchelloid
- coral / clavarioid
- puffball / gasteroid
- cup fungus / discomycete
- jelly fungus
- resupinate crust

## Acceptance criteria status
- Parameter-driven morphology: implemented
- Agaricoid assumptions isolated to agaricoid/selected stipitate profiles: implemented
- Standardized anatomy IDs: implemented
- Character changes without rewriting model factory: implemented for pileus, stipe, hymenophore, veil/base controls
- Deterministic model cleanup: geometry and cloned materials disposed on model switch
- Specimen dataset writes: none
- Mobile/desktop controls: shared OrbitControls implementation
- Runtime telemetry: FPS, object count, draw calls visible in MycoSim

## Remaining visual QA
Each morphology family should be visually reviewed in Render after deploy for:
1. no geometry clipping or inversion,
2. camera framing,
3. hover target correctness,
4. expected anatomy IDs,
5. mobile usability,
6. acceptable frame rate.

## Data boundary
MycoSim is a simulation layer only. It must not infer, merge, mutate, or overwrite specimen accession data, measurements, microscopy, identifications, or provenance.
