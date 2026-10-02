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
      ["free_gills","Free"],["adnexed","Adnexed"],["adnate","Adnate"],["sinuate","Sinuate"],
      ["emarginate","Emarginate"],["subdecurrent","Subdecurrent"],["decurrent","Decurrent"],["seceding","Seceding"],
      ["pores","Pores"],["tubes","Tubes"],["teeth","Teeth"],
      ["folds","Folds"],["smooth","Smooth fertile surface"]
    ]
  },
  puff_surface: {
    label:"Puffball surface ornamentation",
    options:[
      ["glabrous","Smooth / glabrous"],["granular","Granular"],["verrucose","Warted / verrucose"],
      ["echinate","Spiny / echinate"],["furfuraceous","Scurfy / furfuraceous"]
    ]
  },
  puff_shape: {
    label:"Puffball body shape",
    options:[
      ["globose","Globose"],["subglobose","Subglobose"],["pyriform","Pear-shaped / pyriform"],
      ["turbiniform","Turbiniform"],["irregular","Compressed / irregular"]
    ]
  },
  puff_base: {
    label:"Sterile base",
    options:[
      ["none","No obvious sterile base"],["short","Short sterile base"],["distinct","Distinct sterile base"],["rooting","Rooting / narrowed base"]
    ]
  },
  peridial_condition: {
    label:"Peridial condition",
    options:[
      ["intact","Intact"],["cracking","Cracking"],["areal_splitting","Areal splitting"],
      ["flaking","Flaking / abrading"],["collapsed","Collapsed"]
    ]
  },
  ostiole_state: {
    label:"Ostiole state",
    options:[
      ["absent","Absent / not yet developed"],["developing","Developing"],["open","Open apical ostiole"],["ragged","Widened / ragged ostiole"]
    ]
  },
  gleba_state: {
    label:"Gleba state",
    options:[
      ["immature","Immature gleba (white, firm)"],["maturing","Maturing gleba (yellowing / olive-buff)"],
      ["mature","Mature gleba (olive-brown to brown, powdering)"],["old","Old gleba (dark brown, depleted, collapsing)"]
    ]
  },
  section_view: {
    label:"Section / cutaway mode",
    options:[
      ["external","External view"],["half_section","Half-section"],["longitudinal","Longitudinal section"],["hover_anatomy","Hover anatomy view"]
    ]
  },
  texture_realism: {
    label:"Texture realism",
    options:[
      ["simplified","Simplified"],["atlas","Atlas standard"],["high","High detail"]
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
  veil:"annulus",
  puff_surface:"echinate",
  puff_shape:"globose",
  puff_base:"short",
  peridial_condition:"intact",
  ostiole_state:"absent",
  gleba_state:"immature",
  section_view:"external",
  texture_realism:"atlas"
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
  puff_surface:Object.freeze({
    glabrous:{anatomyId:"exoperidium",short:"Outer surface is smooth and lacks obvious ornament.",detail:"Glabrous describes an exoperidium without conspicuous spines, warts, granules, or scurfy coating."},
    granular:{anatomyId:"exoperidium",short:"Outer surface bears fine grain-like ornament.",detail:"Granular puffball surfaces are covered by many small low projections or particles rather than discrete large warts or spines."},
    verrucose:{anatomyId:"exoperidium",short:"Outer surface bears blunt wart-like projections.",detail:"Verrucose ornamentation consists of raised rounded or irregular warts on the exoperidium."},
    echinate:{anatomyId:"exoperidium",short:"Outer surface bears conspicuous pointed spines.",detail:"Echinate ornamentation consists of pointed exoperidial spines or prickles. This can be especially conspicuous in young puffballs and may abrade with age."},
    furfuraceous:{anatomyId:"exoperidium",short:"Outer surface carries a fine scurfy or bran-like coating.",detail:"Furfuraceous describes a flaky, bran-like surface covering that may wear away as the fruit body ages."}
  }),
  puff_shape:Object.freeze({
    globose:{anatomyId:"peridium",short:"Fruit body is nearly spherical.",detail:"Globose describes a nearly spherical gasteroid fruit body."},
    subglobose:{anatomyId:"peridium",short:"Fruit body is almost spherical but slightly uneven or compressed.",detail:"Subglobose forms depart modestly from a perfect sphere while retaining an overall rounded body plan."},
    pyriform:{anatomyId:"sterile_base",short:"Fruit body is pear-shaped with a narrowed basal region.",detail:"Pyriform forms broaden above and narrow toward a sterile or attachment base."},
    turbiniform:{anatomyId:"peridium",short:"Fruit body is top-heavy and spinning-top-like.",detail:"Turbiniform forms are broader above and taper markedly toward the base, producing a top-shaped profile."},
    irregular:{anatomyId:"peridium",short:"Fruit body is compressed or asymmetrically distorted.",detail:"Irregular gasteroid forms may be flattened, lobed, or asymmetrical rather than globose."}
  }),
  puff_base:Object.freeze({
    none:{anatomyId:"sterile_base",short:"No distinct sterile base is expressed.",detail:"The glebal body transitions directly to its substrate attachment without a conspicuous sterile basal compartment."},
    short:{anatomyId:"sterile_base",short:"A short sterile basal region supports the glebal body.",detail:"The sterile base is present but low and not strongly elongated."},
    distinct:{anatomyId:"sterile_base",short:"A clearly differentiated sterile base supports the gleba.",detail:"A distinct subglebal region is visibly separated from the fertile glebal body."},
    rooting:{anatomyId:"sterile_base",short:"The base narrows into a rooting or pseudorhiza-like attachment.",detail:"The basal region tapers downward and may suggest a rooting or cord-like attachment."}
  }),
  peridial_condition:Object.freeze({
    intact:{anatomyId:"peridium",short:"Peridium remains continuous and unbroken.",detail:"An intact peridium encloses the gleba without major fissures or loss of wall tissue."},
    cracking:{anatomyId:"peridium",short:"Peridium shows developing fissures.",detail:"Cracking reflects mechanical or developmental splitting of the outer wall during maturation or weathering."},
    areal_splitting:{anatomyId:"peridium",short:"Wall separates into polygonal or areolate patches.",detail:"Areal splitting produces discrete cracked fields or plates across the peridial surface."},
    flaking:{anatomyId:"exoperidium",short:"Outer wall is abrading or flaking away.",detail:"Flaking represents loss of superficial exoperidial material, often reducing young-stage ornamentation."},
    collapsed:{anatomyId:"peridium",short:"Fruit body wall has lost turgor and partly collapsed.",detail:"Collapse is typical of senescent or depleted fruit bodies after substantial glebal maturation and spore release."}
  }),
  ostiole_state:Object.freeze({
    absent:{anatomyId:"apical_pore",short:"No functional spore-release opening is present.",detail:"Immature puffballs often lack a functional ostiole."},
    developing:{anatomyId:"apical_pore",short:"A small apical opening is beginning to form.",detail:"The ostiole begins as a restricted apical aperture during maturation."},
    open:{anatomyId:"apical_pore",short:"A functional apical ostiole is open.",detail:"The mature ostiole permits dry spores to escape from the gleba."},
    ragged:{anatomyId:"apical_pore",short:"The spore-release opening is widened and irregular.",detail:"An aged ostiole may become enlarged, torn, or ragged through repeated spore discharge and weathering."}
  }),
  gleba_state:Object.freeze({
    immature:{anatomyId:"gleba",short:"Gleba is white and firm.",detail:"Immature glebal tissue has not yet converted into a dry spore mass."},
    maturing:{anatomyId:"gleba",short:"Gleba is yellowing to olive-buff.",detail:"Maturing gleba darkens as spores and associated internal structures develop."},
    mature:{anatomyId:"gleba",short:"Gleba is olive-brown to brown and becoming powdery.",detail:"Mature gleba contains a developed spore mass and increasingly dry internal tissue."},
    old:{anatomyId:"gleba",short:"Gleba is dark, depleted, and collapsing.",detail:"Old gleba reflects extensive spore release, drying, and loss of internal volume."}
  }),
  section_view:Object.freeze({
    external:{anatomyId:"peridium",short:"External morphology is shown intact.",detail:"External view emphasizes body shape, exoperidial ornamentation, peridial condition, and ostiole development."},
    half_section:{anatomyId:"gleba",short:"Half of the fruit body is cut away to expose internal anatomy.",detail:"Half-section reveals the peridial wall, gleba, sterile base, and ostiole relationship."},
    longitudinal:{anatomyId:"gleba",short:"A longitudinal cut exposes the vertical organization of the fruit body.",detail:"Longitudinal section is optimized for comparing gleba, subgleba, wall layers, and apical opening."},
    hover_anatomy:{anatomyId:"peridium",short:"External form remains intact while hover probes identify internal and external structures.",detail:"Hover anatomy preserves the whole model while emphasizing educational identification of named structures."}
  }),
  texture_realism:Object.freeze({
    simplified:{anatomyId:"peridium",short:"Reduced-detail educational geometry.",detail:"Simplified mode lowers surface detail and ornament density for rapid orientation."},
    atlas:{anatomyId:"peridium",short:"Balanced atlas-standard surface detail.",detail:"Atlas standard preserves diagnostic ornamentation and aging cues without excessive geometric density."},
    high:{anatomyId:"exoperidium",short:"High-detail surface rendering.",detail:"High detail increases ornament density and surface irregularity for close visual study."}
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
