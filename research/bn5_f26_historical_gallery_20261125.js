// BN5-F26 observations reconciled against the chart and the Active Master addendum.
(() => {
  const accession = "BN5-F26";
  const specimen = window.ATLAS_DATA.find(({ code }) => code === accession);
  if (!specimen) return;

  for (const photo of specimen.images) {
    if (photo.thumb) photo.preferThumbnail = true;
  }
  const chart = specimen.images.find(({ filename }) => filename === "bn5-f26.jpg");
  if (chart) chart.original = "assets/bn5-f26/specimen/bn5-f26-chart.jpg";

  window.SPECIMEN_ENRICHMENTS = window.SPECIMEN_ENRICHMENTS || {};
  window.SPECIMEN_ENRICHMENTS[accession] = {
    status: "Identification HOLD — historical chart, field-context, preparation and microscopy evidence documented.",
    sourceLine: "Rutgers Mycology Visual Specimen Atlas Active Master, BN5-F26 chart and field/microscopy addenda. The full-size chart view comes from the earlier BN5 master. The Field Matched Revision 3 PDF reproduces the chart on page 223.",
    summary: {
      "Field context and substrate": "Post-collection views show the specimen over deciduous woodland leaf litter, decomposing wood fragments and humic debris. The intact point of attachment and exact substrate are unconfirmed.",
      "Gill attachment reconciliation": "The disassembled chart specimen left attachment uncertain. Later field-context views were described as broadly adnate to short-decurrent. The descriptions refer to different views.",
      "Stipe and base in field context": "The Active Master describes a slender, slightly curved pale cream to tan stipe with longitudinal fibers and ochre-brown staining. The basal attachment is incomplete.",
      "Historical measurement limits": "The chart dimensions are transcribed measurements of unverified method. The 45 microscopy readings are single-axis software overlays. Objective, calibration, mount, reagent conditions, paired spore dimensions and diagnostic anatomy remain unverified.",
      "Collection metadata": "The archival accession and BN5 collection are established. Collection date, collector, voucher and exact habitat attachment remain unverified in the sources reviewed."
    }
  };
})();
