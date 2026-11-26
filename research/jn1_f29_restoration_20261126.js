// Extend the existing JN1-F29 field dossier and retain its original observation sources.
(() => {
  const record = window.SPECIMEN_ENRICHMENTS["JN1-F29"];
  record.status = "Identification HOLD · photographic and measurement evidence available";
  record.sourceLine = "Existing Atlas field and microscopy images and measurement entry, with three researcher-supplied Spore Print (SP) views added November 26, 2026.";
  Object.assign(record.summary, {
    "Record type": "Accession-linked researcher photographs and Rutgers measurement record.",
    "Researcher’s field observations": "Yellowish-cream pileus with a thin, wavy margin and a depressed or concave center. Gills crowded. Stipe cream-white to pale, smooth to fibrillose. The field set also shows pinkish-cream tones toward the cap margin.",
    "Historical measurement and specimen views": "The existing Atlas measurement entry records a 3.8 cm cap and “No stipe found.” The field series shows a stipe. The relationship between the photographed and measured material remains unresolved.",
    "Spore Print (SP)": "Three researcher-supplied views document one foil-and-glass-slide preparation. Sparse particles and reflections prevent a reliable reading of deposit color.",
    "Microscopy": "The November 17 series contains 17 frames, including alternate and annotated views. Rounded outlines and granular material are visible. The intake leaves slide preparation, objective, stain, calibration and identity of the measured structures unverified. Image labels give instrument readings in µm. The number of independent spores measured is unknown."
  });

  const sporePrintViews = [
    {
      "category": "Spore print / preparation",
      "filename": "JN1-F29 SP.JPG",
      "caption": "Spore Print (SP) · Oblique view of the glass slide on marked foil. Small particles are visible above the handwritten accession.",
      "original": "assets/jn1-f29/preparation/jn1-f29-sp-01.webp",
      "thumb": "assets/jn1-f29/preparation/jn1-f29-sp-01-thumb.webp",
      "preferThumbnail": true
    },
    {
      "category": "Spore print / preparation",
      "filename": "JN1-F29 SP2.JPG",
      "caption": "Spore Print (SP) · Close view of the slide edge and scattered specks on reflective foil beside the JN1-F29 marking.",
      "original": "assets/jn1-f29/preparation/jn1-f29-sp-02.webp",
      "thumb": "assets/jn1-f29/preparation/jn1-f29-sp-02-thumb.webp",
      "preferThumbnail": true
    },
    {
      "category": "Spore print / preparation",
      "filename": "JN1-F29 SP 3.JPG",
      "caption": "Spore Print (SP) · Wider view showing the full slide, folded foil and accession label together.",
      "original": "assets/jn1-f29/preparation/jn1-f29-sp-03.webp",
      "thumb": "assets/jn1-f29/preparation/jn1-f29-sp-03-thumb.webp",
      "preferThumbnail": true
    }
  ];
  record.images = [...(record.images || []), ...sporePrintViews];
})();
