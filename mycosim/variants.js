export const MORPHOLOGY_VARIANTS = Object.freeze({
  pileus: {
    label:"Pileus form",
    options:[
      ["convex","Convex"],["plane","Plane"],["umbonate","Umbonate"],["depressed","Depressed"],
      ["funnel","Funnel-shaped"],["campanulate","Campanulate"],["conical","Conical"],["hemispherical","Hemispherical"]
    ]
  },
  stipe: {
    label:"Stipe form",
    options:[
      ["equal","Equal"],["taper_up","Tapering upward"],["taper_down","Tapering downward"],["clavate","Clavate"],
      ["bulbous","Bulbous"],["marginate_bulb","Marginate bulb"],["rooting","Rooting"],["lateral","Lateral"],
      ["eccentric","Eccentric"],["absent","Absent"]
    ]
  },
  hymenophore: {
    label:"Hymenophore",
    options:[
      ["free_gills","Free gills"],["adnexed","Adnexed"],["adnate","Adnate"],["sinuate","Sinuate"],
      ["decurrent","Decurrent"],["pores","Pores"],["tubes","Tubes"],["teeth","Teeth"],
      ["folds","Folds"],["smooth","Smooth fertile surface"]
    ]
  },
  veil: {
    label:"Veil / base",
    options:[
      ["annulus","Annulus"],["cortina","Cortina"],["volva","Volva"],["universal_remnants","Universal veil remnants"],["none","No veil structures"]
    ]
  }
});

export const DEFAULT_VARIANTS = Object.freeze({
  pileus:"convex",
  stipe:"equal",
  hymenophore:"adnate",
  veil:"annulus"
});

export function validateVariantSelection(selection={}){
  const errors=[];
  for(const [group,def] of Object.entries(MORPHOLOGY_VARIANTS)){
    const value=selection[group];
    if(value===undefined) continue;
    if(!def.options.some(([id])=>id===value)) errors.push(`Unknown ${group} variant: ${value}`);
  }
  return {valid:errors.length===0,errors};
}

export function variantLabel(group,id){
  return MORPHOLOGY_VARIANTS[group]?.options.find(([x])=>x===id)?.[1]||id;
}
