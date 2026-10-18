# Phase 21 - Scientific evidence and local research handoff

Date: 2026-10-18
Status: code committed; human scientific review, automated Chromium run, long-duration performance, and Render deployment are not yet independently confirmed.

## Scope and audit method
Representative claim ledger in `mycosim/evidence21.js` maps Phases 15-20 to research context, evidence grades, source IDs, and a boundary explaining what cannot be inferred. This is a **partial evidence audit**, NOT complete citation review of every prior sentence, animation, species-specific assumption, or clinical mechanism.

Grades:
- `established-general-physiology`: broad teaching consensus; this claim record lacks a specific assigned peer-reviewed citation and still requires editorial signoff.
- `peer-reviewed-mechanism-review`: a published review covering a defined biological process, without validating a particular ingested fungal material.
- `limited-human-trial`: a small human trial with precise preparation/population/conditions; no universal benefit inference.
- `unverified-hypothesis`: explicit unsupported compound-specific hypothesis. Source IDs intentionally empty.

## Verified reference identifiers
- Koh et al. (2016), SCFAs: DOI 10.1016/j.cell.2016.05.041, PMID 27259147.
- Hardison and Brown review (2011), SYK/CARD9-coupled lectins: PMID 21267996. Avoid inferring oral-extract efficacy from infection immunology.
- Cryan et al. (2019), gut-brain axis review: DOI 10.1152/physrev.00018.2018, PMID 31460832.
- Mori et al. (2009), small randomized Hericium mild cognitive impairment trial: DOI 10.1002/ptr.2634, PMID 18844328. N=30; preparation and population specific.

## Handoff
`jha.mycosim.research.v2` is a local, manual, read-only preview and clipboard export containing source and claim arrays. `remote_sync=false`, `human_signoff=false`. A SHA-256 digest is computed on the plain payload (before the `integrity` field) in JavaScript insertion order, then attached to the exported envelope. The consumer must reconstruct the same payload without `integrity` and verify the digest before use. This is integrity checking only, NOT an authentication signature.

No Neural Systems Atlas import endpoint, transport, or schema compatibility has been tested. **Do not describe this as remote synchronization.**

## QA
- Source contract suite checks every referenced PMID URL, DOI shape, source IDs, claim evidence grades, scientific warnings, and single-mounted scripts.
- Playwright checks the evidence register, filter, export digest, read-only output, keyboard interactions, reduced-motion setting, and earlier module preservation.
- CI provides a failure artifact when Chromium fails. Previous browser smoke-test numbers are historical until an independently observed current run is available.

## Remaining release blockers
Qualified scientific claim-by-claim review; real screen reader navigation; comparison of procedural 3D models to accepted anatomy; end-to-end Chromium report; production deployment and network asset loading; prolonged real GPU/memory profiling; Neural Systems Atlas importer contract and signed compatibility validation.
