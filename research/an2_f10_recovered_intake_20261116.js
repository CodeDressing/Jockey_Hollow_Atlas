// AN2-F10: preserve research-only observations from historical draft PR #30.
// The 14 original PNG binaries are NOT present on main. Never inject gallery links
// or imply validated basidiospores, spore print, measurement statistics, or species ID.
window.SPECIMEN_ENRICHMENTS=window.SPECIMEN_ENRICHMENTS||{};
window.SPECIMEN_ENRICHMENTS["AN2-F10"]={
  summary:{
    "Microscopy evidence intake — recovery audit":"Fourteen accession-labelled microscope PNGs were documented in historical research draft PR #30. Original image binaries have not been integrated into GitHub main; therefore this entry does not display those photographs. The research intake reports possible overlapping annotated/unannotated image fields.",
    "Microscopic structures — provisional report":"Research draft describes brownish to golden-brown refractile objects with ellipsoid, elongated, curved or irregular profiles and clusters. Identity as mature basidiospores remains unverified; these are recorded source interpretations, not independent identification.",
    "Instrument annotations — preliminary":"The original draft reports screenshot line-tool readings approximately 2.34–12.57 µm on mixed structures and axes. Calibration, object identity, independent-spore count, paired length and width, and validated basidiospore size distribution are not established.",
    "Spore print and taxonomy":"Macroscopic spore-print color not established by this intake; microscopic appearance does not determine print color. Species identification and edibility remain unconfirmed.",
    "Original image transfer status":"HOLD — 14 microscope PNG binaries missing from repository. Source filenames and associated images remain in research draft PR #30; do not render broken image paths. Verify originals and publication authorization separately before gallery release."
  },
  completeness:[
    ["Historical microscopy documentation","Yes — accession-labelled source intake recorded in draft PR #30; source images unavailable on current website"],
    ["Original AN2-F10 microscope PNGs on live site","No — 14 original binaries pending verified transfer"],
    ["Verified mature basidiospores","No — not independently established"],
    ["Validated spore statistics","No — calibration, identification and independent sample missing"],
    ["Taxonomic identification","Unconfirmed"],
    ["Scientific/publication release","HOLD — retain original voucher and rights requirements"]
  ]
};
