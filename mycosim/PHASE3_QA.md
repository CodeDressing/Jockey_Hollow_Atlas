# MycoSim Phase 3 — Medical-atlas-grade Anatomy Navigation QA

## Scope
Phase 3 adds multiscale anatomical navigation modeled after the Neural Atlas interaction philosophy while preserving the hard boundary between MycoSim simulation and MycoScope specimen truth.

## Navigation depth
Supported generalized teaching path examples:

### Agaricoid
whole basidiome
→ pileus
→ hymenophore / lamella
→ trama
→ subhymenium
→ hymenium
→ basidium
→ sterigmata
→ basidiospore

### Boletoid / polyporoid
whole basidiome
→ pileus
→ tube layer
→ tube
→ pore surface
→ hymenium
→ basidium
→ basidiospore

### Ascomycete examples
whole fruiting body
→ fertile head / apothecium
→ hymenium
→ ascus
→ ascospore

## Implemented
- anatomy knowledge-object graph
- explicit macro → tissue → micro → spore navigation paths
- clickable anatomical breadcrumbs
- camera fly-to
- contextual transparency
- exploded-view mode
- section/dissection clipping plane
- generalized micro teaching proxies for tissue layers, basidium, sterigmata, spores, asci, tubes and pore surfaces
- hover definitions
- linked educational panels
- beginner and expert views
- browser pronunciation hook
- browser read-aloud hook
- structure relationship links
- "travel deeper" child links
- whole-view orientation reset
- current location/orientation label
- stable knowledge-object IDs

## Enterprise acceptance criteria
- Users never lose spatial orientation:
  - whole-view reset
  - current morphology + structure label
  - breadcrumbs
- Outer geometry does not block internal selection:
  - contextual transparency
  - dissection clipping
  - exploded view
  - micro proxies
- Macro and micro levels are explicitly connected:
  - per-profile navigation paths
  - child links
  - camera/teaching transition into micro proxy scene
- Every navigable structure points to a knowledge object:
  - knowledge graph with beginner/expert definitions, pronunciation token and relationships

## Scientific boundary
These are generalized educational models. They do not assert specimen identity or specimen-specific anatomy unless a future, explicitly labeled specimen-derived reconstruction is added. No specimen accession, measurement, microscopy, provenance, or identification record is mutated.

## Render QA checklist
1. Verify exploded mode for each family.
2. Verify section clipping on desktop and mobile.
3. Verify breadcrumbs from macro through spore level.
4. Verify read-aloud/pronunciation controls in supported browsers.
5. Verify camera fly-to never strands the user.
6. Verify whole-view reset always restores spatial orientation.
7. Verify mobile panel remains scrollable while canvas controls remain usable.
8. Verify FPS remains acceptable during micro-proxy mode.
