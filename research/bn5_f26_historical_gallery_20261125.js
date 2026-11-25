// BN5-F26 curated scientific record. Source chart and measurements remain in the master data.
(() => {
  const specimen = window.ATLAS_DATA.find(({ code }) => code === "BN5-F26");
  if (!specimen) return;

  // File names and view descriptions follow the MycoLens BN5-F26 plates.
  const captions = {
    "bn5-f26.jpg": "Historical specimen chart showing the disassembled cap and stipe with the BN5-F26 label.",
    "bn5-f26wv1.jpg": "Whole-specimen view in post-collection field context.",
    "BN5-F26WV2.jpg": "Pileus and lateral profile.",
    "BN5-F26WV4.jpg": "Hymenophore detail.",
    "BN5-F26WV5.jpg": "Hymenophore and stipe detail.",
    "BN5-F26WV6.jpg": "Whole-specimen macro view.",
    "BN5-F26WV7.jpg": "Additional pileus and profile view.",
    "BN5-F26WV8.jpg": "Additional whole-specimen view.",
    "BN5-F26WV9.jpg": "Additional field-context view.",
    "BN5-F26SPV2.JPG": "Accession-labeled spore-print slide and foil preparation.",
    "BN5-F26SPV3.JPG": "Second view documenting the labeled preparation.",
    "BN5-F26SPMV1.png": "Microscopy field 1 with single-axis software annotations.",
    "BN5-F26SPMV2.png": "Microscopy field 2 with single-axis software annotations.",
    "BN5-F26SPMV3.png": "Microscopy field 3 with single-axis software annotations.",
    "BN5-F26SPMV4.png": "Microscopy field 4 with single-axis software annotations."
  };
  for (const photo of specimen.images) {
    if (photo.thumb) photo.preferThumbnail = true;
    if (captions[photo.filename]) photo.caption = captions[photo.filename];
  }
  const chart = specimen.images.find(({ filename }) => filename === "bn5-f26.jpg");
  if (chart) chart.original = "assets/bn5-f26/specimen/bn5-f26-chart.jpg";

  specimen.status = "Evidence ready for formal taxonomic review — species identification unresolved.";
  specimen.sourceLine = "Rutgers Mycology Visual Specimen Atlas Active Master, BN5-F26 chart and field/microscopy addenda. The earlier BN5 master supplies the full-size chart, also reproduced in Field Matched Revision 3, page 223. The MycoLens Comparative Diagnostic Workshop Atlas identifies the field, preparation and microscopy plates by filename.";
  specimen.summary = {
    "Collection documentation": "Accession BN5-F26, collection BN5. Collection date, precise locality, collector and voucher are not documented in the consulted accession records.",
    "Habitat and substrate": "Post-collection photographs show the specimen above deciduous forest-floor litter, decomposing wood fragments and humic debris. The intact attachment and exact substrate were not observed. Weather and other site conditions were not recorded.",
    "Macroscopic description": "Small gilled agaricoid. The earlier chart shows a disassembled brown cap and pale stipe with the hymenium exposed. Later field-context photographs show the pileus, gills and stipe in additional views.",
    "Pileus and margin": "Chart diameter 1.8 cm, with measurement method unverified. The chart shows a deeper brown central depression. Later views describe a tan to cinnamon-brown, broadly convex to nearly plane cap, smooth to very finely fibrillose and moist or glossy-looking, with a thin, slightly irregular margin and localized reddish-brown discoloration.",
    "Hymenophore": "Lamellae pale cream to buff and radiating. The detached chart view was described as moderately crowded and attachment was uncertain. Later views were described as moderately spaced, with lamellulae and occasional branching, and attachment appeared broadly adnate to short-decurrent.",
    "Stipe, base and veil": "The chart records 0.3 cm at the top, middle and base and 2.2 cm in height, with method unverified. Later views show a slender, slightly curved, pale cream to tan stipe with longitudinal fibers and local ochre-brown staining. The base carries debris and was not intact. No persistent annulus, volva or conspicuous bulb is visible.",
    "Context, bruising and odor": "Flesh characteristics, bruising response, odor and taste were not recorded. The observed staining does not establish a bruising reaction.",
    "Spore-print documentation": "Two labeled photographs document the glass-slide and foil preparation used for microscopy. The historical chart notes a visible deposit. A controlled print color was not established because the foil is reflective and lighting was not standardized.",
    "Microscopic documentation": "Four transmitted-light fields show spore-like structures described as predominantly globose to subglobose, with some broadly ellipsoid profiles. They appear hyaline to weakly refractile and apparently smooth at the available resolution. Mature basidiospore identity, fine ornamentation, germ pore and hilar appendage are unconfirmed.",
    "Microscopic measurements and method": "The Active Master records 45 legible single-axis software annotations, ranging from 3.97 to 7.74 µm, with mean 5.92 µm, median 5.98 µm and sample SD 0.93 µm. These are not validated paired spore dimensions. Objective, magnification, calibration, mount, stain and reagent conditions were not documented.",
    "Basidia, cystidia and hyphae": "Basidia, cystidia, hyphal features including clamp connections, and reagent reactions were not documented. Paired spore length and width and Q/Qm are unavailable.",
    "Scientific interpretation": "The combination of a moist-looking tan-brown pileus, pale lamellae with lamellulae, an apparent short-decurrent tendency, a fibrillose pale stipe and rounded microscopic profiles provides characters for comparison. The documented evidence supports a gilled agaricoid description. Genus and species remain unresolved.",
    "Taxonomic review requirements": "Confirm gill attachment and substrate on intact material, document voucher and collection details, assess print color under controlled lighting, and obtain calibrated paired measurements from mature spores. Examine basidia, cystidia, hyphae and reagent reactions, then compare the verified character set with relevant keys and reference descriptions. Molecular data are not recorded."
  };
})();
