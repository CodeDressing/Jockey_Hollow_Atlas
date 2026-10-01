# MycoSim Phase 5 QA — Architecture-specific developmental aging

## Objective
Developmental aging must be driven by fungal body-plan biology, not a generic darkening/wrinkling effect.

## Architecture-specific checks

### Agaricoid
Young → Mature → Old must visibly alter:
- pileus expansion and flattening
- hymenophore/gill exposure
- veil persistence
- stipe elongation
- margin behavior and senescent asymmetry

### Boletoid
Must visibly alter:
- cap convexity/flattening
- tube depth
- pore openness
- stipe robustness
- surface cracking/weathering

### Bracket polypore
Must visibly alter:
- shelf expansion
- context thickness
- tube depth
- active margin prominence
- edge erosion and weathering

### Hoof / conk
Must visibly alter:
- hoof depth
- context thickness
- tube stratification
- crust weathering/cracking

### Stipitate hydnoid
Must visibly alter:
- pileus expansion
- tooth length/density
- stipe elongation
- tooth wear and margin irregularity

### Hydnoid bracket
Must visibly alter:
- shelf expansion
- context thickness
- tooth length/density
- tooth wear and edge erosion

### Morel
Must visibly alter:
- head elongation
- ridge/pit expression
- stipe elongation
- drying and partial collapse

### Coral
Must visibly alter:
- branch height and spread
- branch density
- tip wear
- branch collapse

### Puffball
Must visibly alter:
- peridium tautness
- gleba maturity
- ostiole/apical-pore opening
- collapse and spore-release state

### Cup fungus
Must visibly alter:
- cup openness
- depth
- rim thickness
- rim irregularity and collapse

### Jelly fungus
Must visibly alter:
- lobe fullness
- hydration
- translucency
- wrinkling/collapse

### Resupinate crust
Must visibly alter:
- patch spread
- margin definition
- context thickness
- surface roughness
- cracking/erosion

## Invariants
- Stable anatomy IDs must not change between stages.
- Stage switching must preserve current visualization mode.
- Hover and selection must remain functional.
- No specimen records may be written or mutated.
- Mature remains the canonical reference stage.
