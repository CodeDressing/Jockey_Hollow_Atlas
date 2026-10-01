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


export const VARIANT_TEACHING = Object.freeze({
  pileus:Object.freeze({
    convex:{anatomyId:"pileus",short:"Cap surface curves outward in a broad dome.",detail:"A convex pileus is rounded above and commonly becomes flatter as expansion proceeds."},
    plane:{anatomyId:"pileus",short:"Cap is broadly flat across the disc.",detail:"A plane pileus has little central elevation or depression and emphasizes margin shape and surface characters."},
    umbonate:{anatomyId:"pileus",short:"Cap carries a distinct central raised boss.",detail:"An umbo is a localized central elevation that remains above the surrounding pileus surface."},
    depressed:{anatomyId:"pileus",short:"Cap center is lower than the surrounding disc.",detail:"A depressed pileus has a shallow to distinct central depression without necessarily forming a deep funnel."},
    funnel:{anatomyId:"pileus",short:"Cap slopes inward toward a pronounced central depression.",detail:"A funnel-shaped pileus is strongly infundibuliform, with the disc descending toward the center."},
    campanulate:{anatomyId:"pileus",short:"Cap is bell-shaped with steep sides.",detail:"Campanulate pilei are taller and bell-like, especially when young or incompletely expanded."},
    conical:{anatomyId:"pileus",short:"Cap rises to a distinctly conical apex.",detail:"A conical pileus has relatively straight sloping sides meeting near a central apex."},
    hemispherical:{anatomyId:"pileus",short:"Cap approximates half of a sphere.",detail:"A hemispherical pileus is strongly rounded and often represents a compact developmental form."}
  }),
  stipe:Object.freeze({
    equal:{anatomyId:"stipe",short:"Stipe diameter remains relatively uniform.",detail:"An equal stipe maintains approximately the same width from apex to base."},
    taper_up:{anatomyId:"stipe",short:"Stipe becomes narrower toward the apex.",detail:"Tapering upward means the basal portion is broader and the stipe narrows toward the pileus."},
    taper_down:{anatomyId:"stipe",short:"Stipe becomes narrower toward the base.",detail:"Tapering downward means the upper stipe is broader and the base narrows."},
    clavate:{anatomyId:"stipe",short:"Stipe broadens gradually toward a club-shaped base.",detail:"A clavate stipe has a distinctly enlarged lower portion without a sharply delimited bulb."},
    bulbous:{anatomyId:"stipe_base",short:"Stipe terminates in a rounded basal bulb.",detail:"A bulbous base forms a conspicuous rounded enlargement at the stipe base."},
    marginate_bulb:{anatomyId:"stipe_base",short:"Basal bulb has a distinct rim or margin.",detail:"A marginate bulb is sharply delimited and shows a rim-like edge around the upper bulb."},
    rooting:{anatomyId:"stipe_base",short:"Stipe extends downward in a root-like process.",detail:"A rooting stipe continues below the apparent substrate surface as an elongated pseudorhiza-like base."},
    lateral:{anatomyId:"stipe",short:"Stipe attaches at the side rather than centrally.",detail:"A lateral stipe is positioned near the pileus edge and produces an asymmetric fruit-body architecture."},
    eccentric:{anatomyId:"stipe",short:"Stipe is offset from the pileus center.",detail:"An eccentric stipe is displaced from the center but is not fully lateral."},
    absent:{anatomyId:"pileus",short:"No differentiated stipe is present.",detail:"A sessile form attaches directly by the pileus, bracket, or basal tissue rather than through a distinct stipe."}
  }),
  hymenophore:Object.freeze({
    free_gills:{anatomyId:"hymenophore",short:"Gills stop short of the stipe.",detail:"Free lamellae do not contact the stipe, leaving a visible gap around the stipe apex."},
    adnexed:{anatomyId:"hymenophore",short:"Gills attach narrowly to the stipe.",detail:"Adnexed lamellae contact the stipe through only a small portion of their inner edge."},
    adnate:{anatomyId:"hymenophore",short:"Gills meet the stipe broadly and directly.",detail:"Adnate lamellae attach to the stipe across most of their full depth without running down it."},
    sinuate:{anatomyId:"hymenophore",short:"Gills notch upward just before reaching the stipe.",detail:"Sinuate lamellae show a distinct notch or concavity near their stipe attachment."},
    decurrent:{anatomyId:"hymenophore",short:"Gills run downward along the stipe.",detail:"Decurrent lamellae extend for a measurable distance down the stipe surface."},
    pores:{anatomyId:"hymenophore",short:"Fertile surface is expressed as visible pore openings.",detail:"Poroid hymenophores expose the openings of many tubes or cavities rather than plate-like gills."},
    tubes:{anatomyId:"hymenophore",short:"Fertile tissue is organized into a tube layer.",detail:"A tubular hymenophore consists of closely packed tubes whose inner walls bear hymenium and whose ends form pores."},
    teeth:{anatomyId:"hymenophore",short:"Fertile surface hangs as teeth or spines.",detail:"Hydnoid hymenophores bear the hymenium on pendent tooth-like or spine-like projections."},
    folds:{anatomyId:"hymenophore",short:"Fertile surface forms blunt folds or ridges.",detail:"Folded hymenophores have wrinkled or ridge-like fertile structures rather than true lamellae."},
    smooth:{anatomyId:"hymenophore",short:"Fertile surface is macroscopically smooth.",detail:"A smooth hymenophore lacks conspicuous gills, pores, teeth, or folds at macroscopic scale."}
  }),
  veil:Object.freeze({
    annulus:{anatomyId:"veil_structure",short:"A partial veil remains as a ring on the stipe.",detail:"An annulus forms when the partial veil ruptures and leaves a persistent or transient ring-like remnant."},
    cortina:{anatomyId:"veil_structure",short:"A cobweb-like veil spans pileus margin and stipe.",detail:"A cortina is composed of fine fibrillose threads and may leave fibers or a ring zone after rupture."},
    volva:{anatomyId:"stipe_base",short:"Universal veil tissue forms a cup or sheath at the base.",detail:"A volva is a basal remnant of the universal veil surrounding or sheathing the stipe base."},
    universal_remnants:{anatomyId:"veil_structure",short:"Universal veil remnants remain on cap or base.",detail:"Fragments of the universal veil may persist as patches, warts, scales, or basal tissue after expansion."},
    none:{anatomyId:"pileus",short:"No veil structure is represented.",detail:"The model displays no annulus, cortina, volva, or universal-veil remnant in this character state."}
  })
});

export function variantTeaching(group,id){
  return VARIANT_TEACHING[group]?.[id]||null;
}
