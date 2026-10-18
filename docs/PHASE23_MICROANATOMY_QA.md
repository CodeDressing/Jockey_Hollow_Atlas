# Phase 23 — Microscopic Anatomy and Cellular Signaling

Implemented: 2026-10-18

## Architecture
- Extends `mycosim/anatomy3d.js`, using its existing Three.js renderer, orbit controls, raycaster, camera, canvas, geometry/material disposal, scene modes, isolation, transparency, focus, reset, and speech-readback controls.
- Adds a fourth mode, `micro`, with nine selectable educational structures: membrane bilayer, nuclear compartment, mitochondrion and cristae, endoplasmic reticulum, tight-junction proxy, Dectin-1 receptor, SYK/CARD9 signaling proxies, neuron/axon, and synaptic terminals.
- Adds three conceptual focus settings. **These are camera distances, not optical magnification ratios and not absolute physical scales.**
- Does not create a second WebGL renderer, independent animation loop, or remote data service.

## Scientific limitations
The microscopic scene is a deliberately composited educational illustration. The individual structures do not share a validated spatial or nanometer scale. This is neither electron microscopy nor anatomist-reviewed reconstruction. Dectin-1 activation requires suitable cell context and ligand exposure, and does not follow automatically from eating mushroom powders. Neural or clinical effects are not implied.

## QA
- Source contracts check the micro scene categories, dispatcher, existing renderer count, original canvas, controls and glossary-compatible structure descriptions.
- Playwright regression covers entry into micro mode, keyboard structure selection, conceptual focus controls, Phase 23 WebGL smoke checks, and return to gut/cell/tissue modes.
- Dedicated `Run Phase 23 renderer QA` checks mesh construction, selection isolation, context transparency, bounded rebuild allocation, and preserved earlier modes.
- Source-level contract validation passed 16/16 in an independent JavaScript harness; Chromium/production CI outcome not verified.

## Remaining acceptance
Direct Chromium execution, Render deployment, qualified histological review, screen-reader usability, actual GPU benchmarks, high-resolution microscope reference models and source citations tied to individual geometries.
