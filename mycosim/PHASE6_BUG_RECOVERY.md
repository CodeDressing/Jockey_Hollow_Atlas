# Rutgers Extension 7 — Phase 6 Bug Recovery

Status: OPEN RECOVERY CAMPAIGN

This phase is explicitly not a completion declaration. Its purpose is to recover regressions, restore family body plans, and harden validation before any campaign-complete claim.

## Confirmed defects repaired

### P6-001 — Agaricoid pileus upper surface not visible from normal viewing angle
Cause: custom indexed pileus shell used reversed top-face winding, so the upper pileus surface was back-face culled.
Repair: corrected upper/lower shell triangle winding in `mycosim/engine.js`.
Regression guard: `agaricoidPileusShellPass()` now checks upper-shell orientation.

### P6-002 — Cup/discomycete stage transform can throw
Cause: cup developmental transform referenced `subtypeCollapse`, a puffball-local variable not defined in the cup path.
Repair: cup depth now uses the cup's own `collapse` developmental parameter.

### P6-003 — Coral profile declared branch tips and basal trunk but did not build them as independent structures
Repair: coral factory now constructs:
- `base` basal trunk
- `branch_tips` terminal-tip group
while preserving `branch_system` and hymenophore mapping.

## Validation hardening

### Core-family anatomy contract
Regression now validates indispensable structures by family rather than requiring every optional/variant anatomy item in every state.

Required core structures:
- Agaricoid: pileus, hymenophore, stipe
- Boletoid: pileus, tube layer, hymenophore, stipe
- Bracket polypore: pileus, context, tube layer, hymenophore, substrate
- Hoof/conk: pileus, context, tube layer, hymenophore, substrate
- Stipitate hydnoid: pileus, hymenophore, stipe
- Hydnoid bracket: pileus, context, hymenophore, substrate
- Morel: fertile head, hymenophore, stipe, internal cavity
- Coral: branch system, branch tips, basal trunk, hymenophore
- Puffball: peridium, endoperidium, gleba, sterile base
- Cup: apothecium, hymenophore, excipulum, stipe
- Jelly: lobes, hymenophore, attachment
- Crust: margin, context, hymenophore, substrate

## Historical finding
Comparison with the last pre-agaricoid profile baseline shows that the non-agaricoid profile declarations themselves were not deleted by Phase 5. The broader defects are therefore being treated as runtime construction/development regressions rather than a reason to roll back the Phase 5 terminology/archetype work.

## Still required before campaign completion
- live family-by-family visual QA on deployed MycoSim
- run the family x developmental-stage regression suite after deployment
- inspect every non-agaricoid family for silhouette, orientation, framing, anatomy presence, interaction, and stage continuity
- inspect all agaricoid pileus forms and margin states from upper, lateral, and underside views
- confirm no new regression in gill, stipe, veil, surface, or archetype controls
- performance and memory regression after restoration
- deployment verification

No specimen records, measurements, provenance, or specimen-media layers are modified by this recovery phase.
