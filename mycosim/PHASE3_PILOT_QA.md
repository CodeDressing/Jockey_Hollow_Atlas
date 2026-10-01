# MycoSim Phase 3 Pilot QA — Agaricoid, Boletoid, Bracket Polypore

## Scope
This phase intentionally limits developmental-stage rendering to three pilot morphology families:
- Agaricoid
- Boletoid
- Bracket polypore

Each pilot family must render:
- Young
- Mature
- Old

The goal is to establish the engineering standard before extending stage rendering to the remaining morphology families.

## Acceptance criteria

### Visual differentiation
Each developmental stage must show meaningful, family-specific geometric differences rather than a generic scale change.

#### Agaricoid
- Young: reduced pileus expansion, stronger apparent cap height/inroll, shorter stipe, less exposed hymenophore, more persistent veil
- Mature: canonical reference morphology
- Old: flatter/expanded pileus, increased wear, reduced veil prominence, slight asymmetry/irregularity

#### Boletoid
- Young: compact strongly convex cap, shallower tube layer, less open pore surface, robust stipe
- Mature: canonical reference morphology
- Old: flatter cap, more open/irregular pore surface, greater weathering

#### Bracket polypore
- Young: smaller thinner shelf, active margin, shallow tubes
- Mature: canonical context and tube depth
- Old: thicker/weathered shelf, reduced active margin, edge wear

### Stability
- Anatomy IDs remain unchanged across Young/Mature/Old.
- Hover identification remains functional.
- Focus/isolate/hide/transparency remain functional.
- Exploded and section modes remain functional.
- Repeated stage switching does not leak model geometry or materials.
- No specimen records are modified.

### Desktop QA
For each pilot family:
1. Select Young, Mature, Old repeatedly.
2. Confirm framing remains centered.
3. Confirm hover labels identify pileus/stipe/hymenophore or context/tube layer.
4. Confirm 3D controls remain responsive.
5. Record FPS from engine telemetry.

### Mobile QA
For each pilot family:
1. Confirm stage selector is readable and tappable.
2. Confirm canvas remains visible without vertical distortion.
3. Confirm orbit/pinch controls remain usable.
4. Confirm anatomy hover/tap workflows remain usable.
5. Confirm science panel does not alter 3D viewport height.

## Stop condition
Do not extend developmental-stage geometry to the remaining morphology families until all three pilot families pass desktop and mobile QA.
