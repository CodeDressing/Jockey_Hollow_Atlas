// Correct four associations where the specimen label and identical file bytes establish the accession.
(() => {
  const misplaced = [
    ["EN1-F6", "assets/originals/EN1-F6_IMG2.jpg"],
    ["EN1-F7", "assets/originals/EN1-F7_IMG2.jpg"],
    ["EN1-F11", "assets/originals/en1-f11.JPG"],
    ["EN1-F22", "assets/originals/EN1-F22_IMG2.jpg"],
  ];
  for (const [code, path] of misplaced) {
    const specimen = window.ATLAS_DATA.find(record => record.code === code);
    if (specimen) specimen.images = specimen.images.filter(image => image.original !== path);
  }
})();
