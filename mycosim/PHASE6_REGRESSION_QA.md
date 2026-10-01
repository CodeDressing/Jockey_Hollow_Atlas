# MycoSim Phase 6 Regression QA

## Scope
Run all 12 morphology families across Young, Mature, and Old developmental stages: 36 family × stage combinations.

## Automated runtime checks per combination
- Model geometry exists and produces draw calls.
- Camera framing intersects current model bounds.
- Anatomy hover raycast resolves rendered anatomy IDs.
- Click/focus target can create a camera fly-to.
- Isolate and hide/show preserve visibility semantics.
- Exploded view changes and restores transforms.
- Section mode applies clipping planes and restores them.
- Contextual transparency changes non-focused materials and restores mode rendering.
- Anatomy IDs resolve to authored knowledge objects.
- Visualization mode is preserved through stage rebuilds.
- FPS telemetry is recorded; >=30 FPS is the runtime acceptance threshold when a settled FPS sample exists.

## Repeated-switch memory test
The runner cycles all families and stages five additional times after the 36-combination matrix.
Acceptance threshold:
- renderer geometry growth <= 6 objects
- renderer texture growth <= 1 texture

The engine cleanup path disposes generated geometry and cloned materials before each rebuild.

## Responsive/mobile contract
The runner records:
- active viewport class (desktop/mobile)
- media-query state
- canvas width and height
- stage positioning
- canvas touch-action contract

A real mobile-browser pass remains required for final device-level sign-off; the in-app runner records the current viewport rather than pretending a desktop viewport is a phone.

## MycoScope specimen-data isolation
Phase 6 includes two independent guards.

1. Static repository audit: MycoSim modules contain no reference to the atlas specimen data layer (including drive_data).
2. Runtime network-write guard: during the entire regression matrix and repeated-switch loop, fetch and XMLHttpRequest are instrumented. Any non-GET/HEAD request is recorded as a failure.

Developmental stage switching is an in-memory MycoSim operation and has no persistence call.

## How to run
Open:
sandbox.html?qa=1

The QA runner executes automatically and writes the report into the Regression QA panel. It also exposes the last report at:
window.__MYCOSIM_LAST_REGRESSION__

The same test can be run manually using the Run full regression button.

## Required final sign-off
A release passes Phase 6 only when:
- all 36 family × stage rows pass
- repeated-switch memory test passes
- specimen-write count is zero
- desktop viewport passes
- an actual <=900px mobile viewport run passes

No failed row may be silently omitted.
