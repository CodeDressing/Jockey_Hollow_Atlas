# Rutgers Extension 7 — Phase 5 QA

## Scope
Phase 5 implements Step 7 (atlas terminology/probes), Step 9 (taxon-informed teaching archetypes), and Step 10 (validation/performance).

Scientific boundary: **Observation != interpretation != identification != hypothesis.**

## Step 7 — Atlas terminology layer
Status: SOURCE INTEGRATED

The standardized terminology layer lives in `mycosim/phase5_atlas.js` and is wired into the existing clickable knowledge panel in `mycosim/main.js`.

Each standardized term supplies:
1. term
2. pronunciation
3. definition
4. why it matters
5. developmental significance
6. related structures
7. explicit identification boundary

High-priority coverage:
- pileus
- disc
- pileus margin
- lamella / lamellae
- lamellula / lamellulae
- hymenophore
- stipe
- stipe apex
- stipe base
- annulus
- volva
- umbo
- umbilicate
- infundibuliform
- adnate
- adnexed
- decurrent
- emarginate
- crowded
- close
- fibrillose
- squamulose
- verrucose
- glabrous
- viscid
- waxy

Existing cursor probes remain observational and continue to expose structure, observation text, terminology, pronunciation, definition, significance, relationships, and identification boundary. Clicking a structure routes into the standardized teaching panel.

## Step 9 — Agaricoid teaching archetypes
Status: SOURCE INTEGRATED

Implemented teaching archetypes:
- Generic agaric
- Waxcap-type
- Tricholomoid-type
- Clitocyboid / funnel-type
- Mycenoid-type
- Omphalinoid-type
- Amanitoid-type
- Lepiotoid-type
- Marasmioid-type
- Pleurotoid agaricoid form

Each archetype contains:
- allowed cap forms
- allowed gill-attachment logic
- allowed stipe tendencies
- generalized defaults
- documented variability
- explicit exclusions
- a boundary stating that the archetype is not a genus/species identification

The MycoSim interface now exposes these as morphology teaching presets only when the agaricoid profile is active.

## Step 10 — Validation and performance
Status: SOURCE INTEGRATED; LIVE VISUAL QA PENDING EXTERNAL RUNTIME ACCESS

Existing performance architecture retained:
- adaptive realism tiers
- distance LOD installation where configured
- instanced geometry for repeated safe structures
- startup/build timing
- FPS, draw-call, triangle, and object statistics
- regression support matrix
- memory/mobile/specimen-isolation regression checks

Added explicit learner-facing performance modes:
- Atlas Standard
- High Detail

The engine exposes `setRealismMode()`, while adaptive downgrade remains available to protect interaction.

Scientific reference-sheet policy for the new agaricoid archetypes records:
- what is generalized
- what varies
- what is excluded
- why the feature is present

## Source verification performed
- `mycosim/phase5_atlas.js` created on `main`
- `mycosim/main.js` read back after update and verified to import/use the Phase 5 layer
- `sandbox.html` updated with archetype controls, quality controls, and Phase 5 status
- `mycosim/engine.js` read back after update and verified to expose the quality-mode setter
- Existing specimen data files were not modified

## Runtime verification boundary
The current execution environment could not resolve the public Render/raw-GitHub hosts for an independent browser/runtime pass. Therefore:
- source integration is verified
- live Render visual behavior is **not** claimed as verified in this QA sheet
- the simulator's existing in-page regression runner remains the authoritative runtime test when the deployed page is reachable

## Acceptance assessment
- Clicking a structure teaches rather than merely labels: integrated through the existing knowledge panel plus standardized Phase 5 term data.
- Pronunciation/definition schema is consistent across standardized terms.
- Each teaching archetype constrains cap, gill, and stipe morphology.
- Archetypes explicitly do not assert species identity.
- Atlas Standard and High Detail modes are exposed.
- LOD/instancing/adaptive performance architecture is preserved.
- No Phase 5 feature is permitted to serve as specimen evidence or species identification.
