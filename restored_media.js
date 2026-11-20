// Ledger: 01 Public restoration register, 02 Gallery registration.
//
// SECTION 01 — Public restoration register
// These entries contain public image paths, display captions, and catalog keys.
const atlasRestoredImages = {
  "AN2-F1": {
    "AN2-F1V6.HEIC": {
      "path": "assets/an2-f1/field/an2-f1v6.webp",
      "caption": "Field view of a green-gray cap with a leaf resting on it, surrounded by leaf litter."
    },
    "AN2-F1V5.HEIC": {
      "path": "assets/an2-f1/field/an2-f1v5.webp",
      "caption": "Field detail of the upper cap surface beside the handwritten AN2-F1 label."
    },
    "AN2-F1V3.HEIC": {
      "path": "assets/an2-f1/field/an2-f1v3.webp",
      "caption": "Oblique field view of the pale gills and upper stipe beside the handwritten AN2-F1 label."
    },
    "AN2-F1V2.HEIC": {
      "path": "assets/an2-f1/field/an2-f1v2.webp",
      "caption": "Field view of the pale, radially arranged gills and stipe beside the handwritten AN2-F1 label."
    },
    "AN2-F1.HEIC": {
      "path": "assets/an2-f1/field/an2-f1.webp",
      "caption": "Profile view showing a pale stipe and a narrow cap edge beside the handwritten AN2-F1 label."
    },
    "AN2-F1.JPG": {
      "path": "assets/an2-f1/specimen/an2-f1.webp",
      "caption": "Laboratory side view showing the stipe, pale gills and handwritten AN2-F1 foil label."
    },
    "AN2-F1V2.JPG": {
      "path": "assets/an2-f1/specimen/an2-f1v2.webp",
      "caption": "Laboratory view of the green-gray cap surface next to the handwritten AN2-F1 foil label."
    }
  }
};

// SECTION 02 — Gallery registration
for (const photo of window.DRIVE_PHOTOS || []) {
  const entry = atlasRestoredImages[photo.specimen]?.[photo.filename];
  if (!entry || photo.publication_status !== 'archive-only') continue;
  photo.original = entry.path;
  photo.thumb = entry.thumb || entry.path;
  photo.caption = entry.caption;
  photo.publication_status = 'published';
  delete photo.source_relpath;
}
