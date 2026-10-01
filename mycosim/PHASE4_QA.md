# MycoSim Phase 4 — Scientific Identification & Spore Lab QA

## Scientific boundary
MycoSim Phase 4 compares observations against generalized morphology profiles. It does not assign species, genus, family, edibility, toxicity, or specimen identity.

Observation != interpretation != identification.

No Phase 4 workflow writes into MycoScope specimen accession data, measurements, microscopy records, provenance records, or identifications.

## Structured observation fields
- cap morphology
- stipe morphology
- hymenophore type
- substrate
- host
- habitat
- bruising / staining
- spore shape
- ornamentation
- germ pore
- guttules
- cystidia
- basidia / asci
- clamp connections
- hyphal system
- chemical reactions

Every observation field carries:
- value
- evidence state
- provenance / source

Evidence states:
- observed
- failed
- inconclusive
- not examined

## Spore Lab
Each spore measurement is stored as an independent row with:
- length in micrometers
- width in micrometers
- evidence state
- provenance
- source image / record
- notes

Derived statistics are calculated only from rows with evidence_state=observed and valid positive dimensions.

Statistics:
- n
- minimum
- maximum
- mean
- median
- sample standard deviation
- Q ratio = length / width
- failed count
- inconclusive count
- provenance completeness

Failed and inconclusive attempts remain present and are excluded from numeric summaries rather than deleted.

## Morphology-profile comparison
For each generalized morphology candidate MycoSim reports:
- matching observed characters
- conflicting observed characters
- missing / unexamined evidence
- diagnostic-character matches
- evidence coverage
- compatibility fraction
- explicit confidence state

Confidence states:
- insufficient
- low
- moderate
- high

Confidence is morphology-profile compatibility confidence only. It is not taxonomic identification confidence.

## Enterprise acceptance criteria
- Explicit confidence states: implemented
- No forced species identification: implemented
- Multiple-spore statistics: implemented
- Measurement provenance: implemented
- Failed/inconclusive observations retained: implemented
- Diagnostic character highlighting: implemented
- Match/conflict/missing evidence visualization: implemented
- Specimen data mutation: none

## Render QA
1. Enter observations with mixed evidence states and verify comparison output.
2. Verify failed/inconclusive fields are shown as missing evidence rather than conflicts.
3. Verify contradictory characters create explicit conflict chips.
4. Verify diagnostic matches are marked.
5. Add at least 10 spore measurements and verify min/max/mean/median/SD/Q.
6. Add failed and inconclusive spore attempts and verify they remain listed but do not enter numeric statistics.
7. Remove measurement provenance from one observed row and verify provenance completeness becomes No.
8. Confirm no control claims a species-level identification.
9. Confirm mobile input controls remain usable.
