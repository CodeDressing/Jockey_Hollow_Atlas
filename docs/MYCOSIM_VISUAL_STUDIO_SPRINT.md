# MycoSim Visual Mushroom Studio — Implementation Sprint

## Purpose and acceptance
Make morphology choices visually meaningful rather than requiring novices to enter observed traits without feedback. Support three clearly distinct modes: **Learn** (term, definition, pronunciation, responsive drawing), **Build** (fictional custom combinations), and **Identify** (observation practice with no identification authority). This upgrade must preserve the observation/evidence/provenance record, spore lab, families, stage, anatomical controls, atlas modules, and established QA.

**Scientific boundary:** the custom model is a teaching visualization, not a field observation, authenticated species, proof of edibility, or a valid identification result. Unsupported 3D morphologies must be labeled diagram-only; do not silently claim they are rendered by the Three.js engine. Preserve source image provenance and observation statuses in the separate scientific record.

## Block-by-block UI
1. **Studio title and mode tabs:** Learn / Build / Identify.
2. **Trait controls:** growth form, cap shape, fertile surface, spore shape, substrate.
3. **Responsive illustration:** updating SVG fruitbody and schematic spore; meaningful accessible title.
4. **Teaching panel:** plain-language morphology definitions, pronunciation button, and what the chosen structures signify.
5. **Optional existing 3D bridge:** explicit button for supported family/variant controls, with status indicating partial support; never fake changes to the mesh.
6. **Creative specimen export:** downloadable JSON with schema and creative/not-identified classification.
7. **Advanced evidence layer:** retain original scientific observation fields, evidence states, provenance, and candidate morphology comparison with no automatic promotion of creative choices.

## Sprint runs
**Run 1 — Baseline (complete):** inspect sandbox.html, main.js, identification.js, profiles.js and variant system. Preserve originals.

**Run 2 — Visual Studio (implemented in branch):** add visual_builder.js and mount from sandbox.html; no changes to existing scientific data models.

**Run 3 — Verification (pending full browser acceptance):** verify module loads, keyboard/tab accessibility, live trait illustration updates, both Learn/Build/Identify explanatory modes, JSON export, read-aloud, valid 3D family switch, invalid/unsupported mappings, existing evidence form and candidate comparator, mobile scaling, console errors.

**Run 4 — Expanded 3D (future after tests):** add parameterized, physically distinct mesh morphing for fertile surfaces, growth attachments, colors/materials, micro-geometry and ecological stages. Cover realistic invalid-combination constraints and reset. This is **not** implemented by the illustrative bridge.

**Run 5 — Release decision:** run unattended browser test suite; compare against baseline; independent QA; merge only if no regressions. Render production remains unchanged until independently verified.

## Coding-agent handoff prompt
> In CodeDressing/Jockey_Hollow_Atlas, continue from feature/mycosim-visual-mushroom-builder-20261019. Inspect visual_builder.js, sandbox.html, main.js, profiles.js, variants.js, identification.js and tests. Preserve all current modules, observation records and evidence provenance. Replace remaining diagram-only traits with genuinely parameterized, scientifically coherent 3D meshes only where supported. Keep Learn, Build and Identify distinct: creative construction is not species identification and may contain biologically implausible combinations; label them appropriately. Add Chromium browser tests for every trait/mode transition, visual regression across viewport widths, export validation, accessibility, 3D synchronization, and scientific-record nonmutation. Commit changes on the feature branch; do not merge or deploy until tests and release acceptance pass. Never request credentials or publish protected specimen data.
