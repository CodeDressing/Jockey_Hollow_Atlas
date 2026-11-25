// Historical AN2-F6 gallery views and the existing master spore-print preview.
(() => {
  const master = window.ATLAS_DATA.find(({ code }) => code === "AN2-F6");
  const sporePrint = master?.images.find(({ filename }) => filename === "AN2-F6SP.JPG");
  if (sporePrint?.thumb) sporePrint.preferThumbnail = true;

  const restoredPhotos = [
    {
      "category": "Wild / field context",
      "filename": "AN2-F6V1.HEIC",
      "caption": "Two gilled fruit bodies in leaf litter, photographed from above at an oblique angle. Larger cap is brown with a depressed-looking center and darker edge; smaller cap is paler.",
      "original": "assets/an2-f6/field/an2-f6-field-01.webp",
      "thumb": "assets/an2-f6/field/an2-f6-field-01-thumb.webp",
      "preferThumbnail": true
    },
    {
      "category": "Wild / field context",
      "filename": "AN2-F6V2.HEIC",
      "caption": "Low-angle view of two fruit bodies among leaves and twigs. The larger brown cap has a downcurved edge and a slender yellow-brown stipe.",
      "original": "assets/an2-f6/field/an2-f6-field-02.webp",
      "thumb": "assets/an2-f6/field/an2-f6-field-02-thumb.webp",
      "preferThumbnail": true
    },
    {
      "category": "Wild / field context",
      "filename": "AN2-F6V3.HEIC",
      "caption": "A closely comparable low-angle view showing both fruit bodies and their stipes among leaves and twigs.",
      "original": "assets/an2-f6/field/an2-f6-field-03.webp",
      "thumb": "assets/an2-f6/field/an2-f6-field-03-thumb.webp",
      "preferThumbnail": true
    },
    {
      "category": "Wild / field context",
      "filename": "AN2-F6V4.HEIC",
      "caption": "Both fruit bodies above foil labeled AN2 F6. Woodland litter is visible; exact attachment substrate is unverified.",
      "original": "assets/an2-f6/field/an2-f6-field-04.webp",
      "thumb": "assets/an2-f6/field/an2-f6-field-04-thumb.webp",
      "preferThumbnail": true
    },
    {
      "category": "Wild / field context",
      "filename": "AN2-F6V5.HEIC",
      "caption": "Accession-marked foil with the larger collected fruit body. The bent yellow-brown stipe and dark gilled underside are visible.",
      "original": "assets/an2-f6/field/an2-f6-field-05.webp",
      "thumb": "assets/an2-f6/field/an2-f6-field-05-thumb.webp",
      "preferThumbnail": true
    },
    {
      "category": "Wild / field context",
      "filename": "AN2-F6V6.HEIC",
      "caption": "Accession-marked foil with two handled fruit bodies; the undersides show gills. Exact gill attachment is unresolved.",
      "original": "assets/an2-f6/field/an2-f6-field-06.webp",
      "thumb": "assets/an2-f6/field/an2-f6-field-06-thumb.webp",
      "preferThumbnail": true
    },
    {
      "category": "Source macro / specimen",
      "filename": "AN2-F6.JPG",
      "caption": "Cropped historical laboratory overview showing both fruit bodies, yellow-brown stipes and the AN2 F6 label.",
      "original": "assets/an2-f6/specimen/an2-f6-lab-01.jpg",
      "thumb": "assets/an2-f6/specimen/an2-f6-lab-01-thumb.webp",
      "preferThumbnail": true
    },
    {
      "category": "Source macro / specimen",
      "filename": "AN2-F6V2.JPG",
      "caption": "Cropped second historical laboratory view showing both fruit bodies, debris at the stipe base and the AN2 F6 label.",
      "original": "assets/an2-f6/specimen/an2-f6-lab-02.jpg",
      "thumb": "assets/an2-f6/specimen/an2-f6-lab-02-thumb.webp",
      "preferThumbnail": true
    }
  ];
  const specimen = window.SPECIMEN_ENRICHMENTS["AN2-F6"];
  specimen.images.unshift(...restoredPhotos);
  specimen.completeness.push(
    ["Wild / field imagery", "Yes — six historical views"],
    ["Laboratory specimen imagery", "Yes — two historical views"]
  );
})();
