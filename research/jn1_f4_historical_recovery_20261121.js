// Historical JN1-F4 recovery, source-bounded; does not supersede later observations.
// Source: Rutgers Mycology Visual Specimen Atlas - ACTIVE MASTER - 422 Records.
// https://docs.google.com/document/d/11rV-I3DClTs3L6_YjVqAZOXzpEVJkGNdyq31oFOpW5o/edit
// This historical source did not include a microscopy file; later microscopy may exist.
window.SPECIMEN_ENRICHMENTS = window.SPECIMEN_ENRICHMENTS || {};
var historicalF4 = window.SPECIMEN_ENRICHMENTS["JN1-F4"] || {};
window.SPECIMEN_ENRICHMENTS["JN1-F4"] = {
  ...historicalF4,
  summary: {
    ...(historicalF4.summary || {}),
    "Historical spore-print observation (422-record master)": "A faint pale circular and radial deposit was documented on print paper. The deposit appeared pale whitish to light gray in the source photograph. This is a macroscopic observation, not a microscopically established spore identification.",
    "Historical source image provenance (422-record master)": "The source record identifies one spore-print-attempt photograph, JN1-F4SP.JPG. This entry documents a source reference only; the original file's availability and public delivery have not been independently verified.",
    "Historical size and scale limitations (422-record master)": "No calibrated measurement scale was visible in the source print photograph. The 422-record source did not document basidiome dimensions.",
    "Historical morphology evidence limitations (422-record master)": "The source contained no intact fruit-body or in-nature field image. Cap, hymenophore, stipe, veil, basal characteristics, and field substrate could not be evaluated from the spore-print-attempt photograph; these are not confirmed negative findings.",
    "Historical microscopy evidence limitations (422-record master)": "The source explicitly reported no supplied microscope image, objective/magnification, mount/stain, or measured spore record. This statement describes that historical document, not the status of later laboratory work. A separate report of 21 microscopy photos remains unreconciled.",
    "Historical source reconciliation": "Recovery from Rutgers Mycology Visual Specimen Atlas, ACTIVE MASTER, 422 Records (JN1-F4 passage). Source observations are retained separately from newer research; species determination and edible status are not established by this source."
  }
};
