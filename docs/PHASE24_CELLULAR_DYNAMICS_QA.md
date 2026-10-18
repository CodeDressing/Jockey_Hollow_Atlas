# MycoSim Phase 24 — Controlled cellular biochemistry

Status: **engineering committed**, pending independent browser/production and scientific QA.
Date: 2026-10-18.

## Architecture
Changes are contained in the existing `mycosim/anatomy3d.js` Three.js scene and UI. Seven selectable biochemical processes animate three shared, lightweight marker meshes in the existing frame loop; no additional renderer, canvas, RAF loop, independent simulation or third-party library is added.

Processes, each with three manually navigable annotated stages:
1. Conditional Dectin-1 binding to accessible fungal β-glucan
2. hemITAM phosphorylation, SYK recruitment, CARD9–BCL10–MALT1 signaling
3. Intestinal matrix release, epithelial barrier, and uptake uncertainty
4. NMDA glutamate/co-agonist gating, magnesium block, ion conduction
5. AMPA glutamate binding and postsynaptic excitatory response
6. GABA-A anion channel gating and electrochemical gradients
7. Presynaptic action potential, voltage-gated calcium entry and vesicle fusion

Each stage has a learner pronunciation, scientific definition, plain-language mechanism, and process-specific evidence classification. Controls include process selection, previous/next, Play/Pause, Reset, manual progress slider and spoken readback.

## Crucial scientific limitations
**This is NOT a molecular-dynamics calculation.** Mesh paths, distances, particle motion, timing and transition ease are illustrative only. They are not molecular trajectories, experimental channel currents, molecule-specific intestinal permeability, membrane potentials, PK/PD parameters, dose responses, or clinical predictions.

The Dectin-1 and SYK mechanisms are conditional **cell-culture/immunology contexts**. Ordinary dietary mushroom powder has not been shown here to contact or activate Dectin-1 on an intestinal immune cell. NMDA, AMPA and GABA are established receptor concepts, not verified targets of ingested mushroom preparations. The model does not claim a neurological benefit.

No quantitative validation, calibrated molecular or microscopic geometry, pharmaceutical efficacy or clinical safety inference.

## Accessibility and lifecycle
- Uses the existing single WebGL canvas and existing renderer requestAnimationFrame loop. Structural geometry is freed by the existing releaseGeometry lifecycle on a scene switch/rebuild.
- Motion suspends in hidden tabs/documents, and respects `prefers-reduced-motion: reduce`: users can step and scrub manually without forced playback.
- Native buttons, labeled select and range controls, aria-pressed, aria-live scientific explanations, and optional SpeechSynthesis readback.
- Read-only `window.MycoSimMotion24.getState()` exposes process, stage, progress, playing, mode and copied particle position arrays solely for browser testing.

## Verification status
- The source-contract suite checks every Phase 9–24 module, old branch behavior and exactly one anatomy renderer/RAF loop. The 17 source contracts passed in a local JavaScript evaluation harness against repository sources; **this is not a GitHub Actions pass**.
- Two new Playwright cases cover actual progress and marker displacement, stage navigation, reduced motion, keyboard scrub and return to all legacy modes.
- Render environment requires user-confirmed workspace selection. The production deploy was not verified.
- A source-level passing test is not proof that the Chromium, GPU, long-duration memory, scientific or production acceptance gates passed.

## Release gates
Run the configured GitHub Actions browser suite, review captured failures, check Chromium WebGL/Render network dependencies, validate keyboard and screen-reader behavior, perform 20-minute+ real GPU endurance tests, and obtain qualified scientific review before setting production signoff.
