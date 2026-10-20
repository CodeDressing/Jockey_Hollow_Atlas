# Operation Living Atlas — specimen-to-3D campaign

Status: architectural kickoff, no production deployment. Source: isolated campaign branch, derived from the current Clear View prototype. Do not merge this campaign into the existing PR #12 by accident.

## Mission
Permit a visitor to search by a specimen number (e.g. AN2-F3), scientific name, or common name (e.g. Old Man of the Woods), open the authoritative specimen record and view an explicitly provenance-labelled 3D representation within the **existing** MycoSim canvas and camera system.

## Known lead / validation gate
The field identifier `AN2-F3` and name "Old Man of the Woods" were supplied by the atlas owner and have NOT yet been independently matched to a machine-readable specimen record. Verify spelling, exact archive key, photo provenance, scientific identification and taxonomy before representing an organism at species resolution. Old Man of the Woods may be applied to members of a Strobilomyces species complex; do not silently hardcode an accepted binomial from a common name.

## Data contract (additive, future implementation)
Each imported record must have:
- `specimen_id`: durable canonical ID and non-destructive aliases (retain hyphens / archive prefixes)
- `display_name`, `common_names[]`, `scientific_name`, `identification_status` and `identification_evidence[]`
- `photo_refs[]` with attribution/permission, view labels, camera scale where known
- `morphology_profile_id` resolving only to an existing supported family
- `variant_selections` accepted by current `validateVariantSelection` and developmental stage options
- `model_status`: `reference_illustration`, `specimen_informed`, `photogrammetric` or `not_modelled`
- `model_version`, `evidence_sources[]`, `uncertainties[]`, `review_status`
- no coordinates, precise collection sites or private collector information in the public record without explicit permission.

## Execution strategy
1. **Read-only inventory**: locate the atlas's 389-record canonical source, scan exact IDs, assess photos and metadata; produce completeness and taxonomy reports without altering it.
2. **Specimen registry**: normalize IDs and aliases, build deterministic case/spacing insensitive search, detect collisions and missing photos, keep source material immutable.
3. **Authoritative model bridge**: when selected, reuse the single existing `#stage`, the `MycoSimEngine`, existing profile/variant/development APIs. Never mount nested simulators. UI should distinguish generic morphology archetypes from reviewed specimen-informed models.
4. **AN2-F3 pilot**: verify identity first, map supported boletoid/Strobilomyces morphology with photo-linked citations, test searchable name and ID routes, inspect the 3D model at 6 widths.
5. **Batch campaign**: intake 10 specimens with QC and reviewer signoff, then 25, then 100, then entire inventory. Unsupported morphologies receive an honest `not_modelled` state rather than invented geometry.
6. **Acceptance and rollout**: snapshot exact search results, no ID collisions, zero broken refs, one renderer, no observations/provenance mutation, keyboard access, 320/390/768/960/1280/1920 screenshots, progressive loading and performance budgets. Stage-only review; no production merge/deploy without authorization.

## Definition of done
Every specimen can be searched and opened as a record. Every *verified, modeled* specimen has a 3D view and provenance label; unmodeled specimens have a transparent pending state. Each scientific label is reviewed, uncertainty is explicit, and public specimen photos are used only when permission/provenance are confirmed.

## LOD
Privacy, safety, respect, honor, integrity; scientific accuracy and benefit to learners take precedence over claims of completeness.
