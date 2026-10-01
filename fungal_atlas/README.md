# MycoScope Fungal Systems Atlas — Sandbox

This branch is an isolated development sandbox for the medical-/research-grade 3D fungal mapping system.

It does NOT deploy to the live Jockey Hollow atlas unless changes are deliberately merged back to main.

## Objective

Build a reusable 3D fungal systems engine capable of mapping many fungal morphologies at the same conceptual depth as the Neural Systems Atlas.

The experience must support:

FOREST
→ SPECIMEN
→ MACRO MORPHOLOGY
→ INTERNAL / DISSECTION
→ FERTILE SURFACE
→ HYMENIUM
→ TISSUE
→ HYPHAE
→ BASIDIA / ASCI / CYSTIDIA
→ SPORES
→ SPORE MEASUREMENTS
→ TAXONOMY
→ ECOLOGY
→ BIOCHEMISTRY
→ IDENTIFICATION
→ EVIDENCE

## Scientific rules

1. Observation, interpretation, identification, and hypothesis are distinct states.
2. No species certainty is inferred from appearance alone when microscopy, chemistry, or sequencing are required.
3. Missing, failed, partial, and inconclusive procedures remain part of the record.
4. Generalized teaching models must be labeled separately from specimen-derived 3D reconstructions.
5. A gilled mushroom is not the universal fungal template.

## Initial morphology profiles

- Agaricoid
- Boletoid
- Polyporoid
- Hydnoid
- Chanterelloid
- Clavarioid / coral
- Puffball / gasteroid
- Morel / morchelloid
- Cup / discomycete
- Jelly
- Crust / resupinate
- Bracket / conk

## Rendering architecture

INDEXED != RENDERED.

Use mode-specific rendering, lazy loading, cached selection indexes, picking proxies, event-driven updates, LOD, compressed assets, and separate macro/micro scenes where appropriate.

## Sandbox development order

### Phase I — Architecture
Schemas, morphology profiles, anatomy IDs, specimen/evidence contracts, 3D scene architecture.

### Phase II — Interactive macro test model
A generalized agaricoid test specimen with rotate, pan, zoom, hover identification, select, isolate, hide, transparency, and camera focus.

### Phase III — Morphology profile expansion
Boletoid, polyporoid, hydnoid, coral, gasteroid, morchelloid, cup, jelly, and crust models.

### Phase IV — Dissection and microscopy bridge
Whole specimen → fertile surface → hymenium → basidia/asci → spores.

Nothing in this branch should alter the live atlas until intentionally reviewed and merged.
