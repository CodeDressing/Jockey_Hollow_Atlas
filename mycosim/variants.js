export const MORPHOLOGY_VARIANTS = Object.freeze({
  agaric_pileus_profile: {
    label:"Pileus profile",
    options:[
      ["conical","Conical"],["campanulate","Campanulate"],["convex","Convex"],
      ["plano_convex","Plano-convex"],["flat","Flat"],["depressed","Depressed"],
      ["infundibuliform","Infundibuliform"],["umbilicate","Umbilicate"],
      ["umbonate","Umbonate"],["ovate","Ovate"]
    ]
  },
  agaric_pileus_center: {
    label:"Pileus center / disc condition",
    options:[
      ["even","Even"],["depressed","Depressed"],["papillate","Papillate"],["umbonate","Umbonate"]
    ]
  },
  agaric_margin: {
    label:"Pileus margin",
    options:[
      ["incurved","Incurved"],["decurved","Decurved"],["straight","Straight"],["uplifted","Uplifted"],
      ["inrolled","Inrolled"],["undulate","Wavy / undulate"],["lobed","Lobed"],["split_cracked","Split / cracked"],
      ["striate","Striate"],["appendiculate","Appendiculate"]
    ]
  },
  agaric_stipe_position: {
    label:"Stipe position",
    options:[["central","Central"],["eccentric","Eccentric"]]
  },
  agaric_stipe_form: {
    label:"Stipe form",
    options:[
      ["equal","Equal"],["tapering","Tapering"],["clavate","Clavate"],
      ["ventricose","Ventricose"],["bulbous_base","Bulbous base"],["rooting","Rooting"]
    ]
  },
  agaric_stipe_context: {
    label:"Stipe context",
    options:[["solid","Solid"],["stuffed","Stuffed"],["hollow","Hollow"]]
  },
  agaric_stipe_surface_apex: {
    label:"Stipe apex surface",
    options:[
      ["smooth","Smooth"],["fibrillose","Fibrillose"],["floccose","Floccose"],["scaly","Scaly"],
      ["reticulate","Reticulate"],["pruinose","Pruinose apex"],["longitudinal_striate","Longitudinally striate"]
    ]
  },
  agaric_stipe_surface_mid: {
    label:"Mid-stipe surface",
    options:[
      ["smooth","Smooth"],["fibrillose","Fibrillose"],["floccose","Floccose"],["scaly","Scaly"],
      ["reticulate","Reticulate"],["longitudinal_striate","Longitudinally striate"]
    ]
  },
  agaric_stipe_surface_base: {
    label:"Stipe base surface",
    options:[
      ["smooth","Smooth"],["fibrillose","Fibrillose"],["floccose","Floccose"],["scaly","Scaly"],
      ["reticulate","Reticulate"],["longitudinal_striate","Longitudinally striate"]
    ]
  },
  agaric_stipe_taper: {
    label:"Stipe taper",
    options:[
      ["equal","Equal"],["clavate","Clavate"],["bulbous_base","Bulbous base"],
      ["rooting","Rooting"],["attenuate_upward","Attenuate upward"]
    ]
  },
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
  agaric_surface_primary: {
    label:"Pileus surface expression",
    options:[
      ["glabrous","Glabrous"],["smooth","Smooth"],["innately_fibrillose","Innately fibrillose"],
      ["appressed_fibrillose","Appressed fibrillose"],["silky","Silky"],["squamulose","Scaly / squamulose"],
      ["shaggy_scaly","Shaggy-scaly"],["verrucose","Verrucose"],["areolate","Areolate / cracked"],
      ["viscid","Viscid"],["glutinous","Glutinous"],["dry","Dry"],["waxy","Waxy"],
      ["velvety","Velvety"],["tomentose","Tomentose"]
    ]
  },
  agaric_surface_secondary: {
    label:"Secondary surface state",
    options:[
      ["none","None"],["fibrillose","Fibrillose"],["squamulose_disc","Squamulose disc"],
      ["scaly","Scaly"],["silky","Silky"],["weathered","Weathered"],["cracked","Cracked"],
      ["waxy","Waxy"],["tomentose","Tomentose"]
    ]
  },
  agaric_surface_distribution: {
    label:"Surface distribution",
    options:[
      ["uniform","Uniform"],["disc_emphasized","Disc emphasized"],["margin_emphasized","Margin emphasized"],
      ["radial","Radial"],["concentric","Concentric"],["irregular_patches","Irregular patches"],
      ["aging_from_disc","Aging from disc"],["aging_from_margin","Aging from margin"]
    ]
  },
  agaric_surface_age: {
    label:"Surface age / weathering",
    options:[
      ["fresh","Fresh"],["slightly_weathered","Slightly weathered"],["weathered","Weathered"],["old_broken","Old / broken-up"]
    ]
  },
  agaric_surface_moisture: {
    label:"Surface moisture / finish",
    options:[
      ["dry","Dry"],["subviscid","Subviscid"],["viscid","Viscid"],["glutinous","Glutinous"],["waxy","Waxy"]
    ]
  },
  agaric_gill_attachment: {
    label:"Gill attachment",
    options:[
      ["free_gills","Free"],["adnexed","Adnexed"],["adnate","Adnate"],["sinuate","Sinuate"],
      ["emarginate","Emarginate"],["subdecurrent","Subdecurrent"],["decurrent","Decurrent"],["seceding","Seceding"]
    ]
  },
  agaric_gill_spacing: {
    label:"Gill spacing",
    options:[
      ["distant","Distant"],["subdistant","Subdistant"],["close","Close"],["crowded","Crowded"]
    ]
  },
  agaric_gill_thickness: {
    label:"Gill thickness",
    options:[
      ["thin","Thin"],["moderate","Moderately broad"],["broad","Broad"]
    ]
  },
  agaric_gill_depth: {
    label:"Gill depth",
    options:[
      ["shallow","Shallow"],["moderate","Moderate"],["deep","Deep"]
    ]
  },
  agaric_lamellulae: {
    label:"Lamellulae presence",
    options:[
      ["absent","Absent"],["sparse","Sparse"],["moderate","Moderate"],["abundant","Abundant"]
    ]
  },
  agaric_gill_edge: {
    label:"Gill edge condition",
    options:[
      ["even","Even"],["serrulate","Serrulate"],["fimbriate","Fimbriate"],["crisped","Crisped"]
    ]
  },
  hymenophore: {
    label:"Gill attachment / hymenophore",
    options:[
      ["free_gills","Free"],["adnexed","Adnexed"],["adnate","Adnate"],["sinuate","Sinuate"],
      ["emarginate","Emarginate"],["subdecurrent","Subdecurrent"],["decurrent","Decurrent"],["seceding","Seceding"],
      ["pores","Pores"],["tubes","Tubes"],["teeth","Teeth"],
      ["folds","Folds"],["smooth","Smooth fertile surface"]
    ]
  },
  puff_subtype: {
    label:"Gasteroid teaching archetype",
    options:[
      ["true_puffball","Generalized true puffball"],
      ["pyriform_puffball","Pyriform puffball archetype"],
      ["gem_studded_type","Gem-studded / Lycoperdon-type archetype"],
      ["giant_puffball_type","Giant puffball-type archetype"],
      ["earthball_type","Earthball / Scleroderma-type archetype"],
      ["earthstar_type","Earthstar archetype"],
      ["stalked_puffball_type","Stalked puffball / Tulostoma-type archetype"]
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
  rupture_pattern: {
    label:"Peridial rupture pattern",
    options:[
      ["intact","None / intact"],["apical_ostiole","Apical ostiole"],["small_apical_tear","Small apical tear"],
      ["radial_cracking","Radial cracking"],["irregular_rupture","Irregular rupture"],
      ["collapsed_crown","Collapsed broken crown"],["lateral_break","Lateral break"],["fragmented_opening","Fragmented opening"]
    ]
  },
  rupture_margin: {
    label:"Rupture margin",
    options:[
      ["clean","Clean"],["slightly_torn","Slightly torn"],["ragged","Ragged"],
      ["curled_out","Curled outward"],["curled_in","Curled inward"],["frayed","Frayed / weathered"]
    ]
  },
  collapse_state: {
    label:"Wall collapse / deformation",
    options:[
      ["none","None"],["slight","Slight settling"],["moderate","Moderate collapse"],
      ["severe","Severe collapse"],["weathered","Weathered distortion"]
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
  agaric_pileus_profile:"convex",
  agaric_pileus_center:"even",
  agaric_margin:"decurved",
  agaric_stipe_position:"central",
  agaric_stipe_form:"equal",
  agaric_stipe_context:"solid",
  agaric_stipe_surface_apex:"smooth",
  agaric_stipe_surface_mid:"smooth",
  agaric_stipe_surface_base:"smooth",
  // Phase 7B regional blending defaults. These remain internal morphology
  // controls so the visible apex/mid/base selectors stay simple while the
  // tissue transition itself is continuous.
  agaric_stipe_apex_mid_transition:.18,
  agaric_stipe_mid_base_transition:.18,
  agaric_stipe_transition_falloff:1.25,
  agaric_stipe_texture_inheritance:.42,
  agaric_stipe_surface_carryover:.30,
  agaric_stipe_taper:"equal",
  agaric_surface_primary:"smooth",
  agaric_surface_secondary:"none",
  agaric_surface_distribution:"uniform",
  agaric_surface_age:"fresh",
  agaric_surface_moisture:"dry",
  agaric_gill_attachment:"adnate",
  agaric_gill_spacing:"close",
  agaric_gill_thickness:"thin",
  agaric_gill_depth:"moderate",
  agaric_lamellulae:"moderate",
  agaric_gill_edge:"even",
  pileus:"convex",
  stipe:"equal",
  hymenophore:"adnate",
  veil:"annulus",
  puff_subtype:"true_puffball",
  puff_surface:"echinate",
  puff_shape:"globose",
  puff_base:"short",
  peridial_condition:"intact",
  ostiole_state:"absent",
  gleba_state:"immature",
  rupture_pattern:"intact",
  rupture_margin:"clean",
  collapse_state:"none",
  section_view:"external",
  texture_realism:"atlas"
});

export const PUFFBALL_SUBTYPE_LIBRARY=Object.freeze({
  true_puffball:Object.freeze({
    label:"Generalized true puffball",
    taxonomicScope:"Lycoperdaceae-like teaching archetype; not a species identification.",
    allowed:Object.freeze({
      puff_shape:Object.freeze(["globose","subglobose","pyriform"]),
      puff_surface:Object.freeze(["glabrous","granular","verrucose","echinate","furfuraceous"]),
      puff_base:Object.freeze(["none","short","distinct"])
    }),
    defaults:Object.freeze({puff_shape:"subglobose",puff_surface:"granular",puff_base:"short",rupture_pattern:"apical_ostiole"}),
    architecture:Object.freeze({wallFactor:1.00,subglebaFactor:.70,stipeFactor:0,rayCount:0,glebaFactor:1.00,ostioleBias:1.00}),
    development:Object.freeze({wallPersistence:1.00,ornamentPersistence:1.00,ruptureBias:1.00,collapseBias:1.00}),stageBehavior:Object.freeze({young:{ostiole_state:"absent",rupture_pattern:"intact"},mature:{ostiole_state:"developing",rupture_pattern:"apical_ostiole"},old:{ostiole_state:"open",rupture_pattern:"irregular_rupture"}})
  }),
  pyriform_puffball:Object.freeze({
    label:"Pyriform puffball archetype",
    taxonomicScope:"Pear-shaped puffball teaching archetype; not a species identification.",
    allowed:Object.freeze({
      puff_shape:Object.freeze(["pyriform","turbiniform"]),
      puff_surface:Object.freeze(["granular","verrucose","furfuraceous"]),
      puff_base:Object.freeze(["distinct","rooting"])
    }),
    defaults:Object.freeze({puff_shape:"pyriform",puff_surface:"granular",puff_base:"distinct",rupture_pattern:"apical_ostiole"}),
    architecture:Object.freeze({wallFactor:.95,subglebaFactor:1.22,stipeFactor:0,rayCount:0,glebaFactor:.92,ostioleBias:1.05}),
    development:Object.freeze({wallPersistence:.92,ornamentPersistence:.88,ruptureBias:1.05,collapseBias:1.05}),stageBehavior:Object.freeze({young:{ostiole_state:"absent",rupture_pattern:"intact"},mature:{ostiole_state:"developing",rupture_pattern:"apical_ostiole"},old:{ostiole_state:"open",rupture_pattern:"irregular_rupture"}})
  }),
  gem_studded_type:Object.freeze({
    label:"Gem-studded / Lycoperdon-type archetype",
    taxonomicScope:"Lycoperdon-like ornamented teaching archetype; not a species identification.",
    allowed:Object.freeze({
      puff_shape:Object.freeze(["subglobose","pyriform"]),
      puff_surface:Object.freeze(["echinate","verrucose"]),
      puff_base:Object.freeze(["short","distinct"])
    }),
    defaults:Object.freeze({puff_shape:"pyriform",puff_surface:"echinate",puff_base:"short",rupture_pattern:"apical_ostiole"}),
    architecture:Object.freeze({wallFactor:.92,subglebaFactor:.95,stipeFactor:0,rayCount:0,glebaFactor:.94,ostioleBias:1.10}),
    development:Object.freeze({wallPersistence:.88,ornamentPersistence:1.12,ruptureBias:1.08,collapseBias:1.02}),stageBehavior:Object.freeze({young:{ostiole_state:"absent",rupture_pattern:"intact"},mature:{ostiole_state:"developing",rupture_pattern:"apical_ostiole"},old:{ostiole_state:"open",rupture_pattern:"irregular_rupture"}})
  }),
  giant_puffball_type:Object.freeze({
    label:"Giant puffball-type archetype",
    taxonomicScope:"Large smooth calvatioid teaching archetype; not a species identification.",
    allowed:Object.freeze({
      puff_shape:Object.freeze(["globose","subglobose","irregular"]),
      puff_surface:Object.freeze(["glabrous","granular"]),
      puff_base:Object.freeze(["none","short"])
    }),
    defaults:Object.freeze({puff_shape:"globose",puff_surface:"glabrous",puff_base:"none",rupture_pattern:"irregular_rupture"}),
    architecture:Object.freeze({wallFactor:.82,subglebaFactor:.18,stipeFactor:0,rayCount:0,glebaFactor:1.18,ostioleBias:.28}),
    development:Object.freeze({wallPersistence:.76,ornamentPersistence:.55,ruptureBias:1.35,collapseBias:1.18}),stageBehavior:Object.freeze({young:{ostiole_state:"absent",rupture_pattern:"intact"},mature:{ostiole_state:"absent",rupture_pattern:"small_apical_tear"},old:{ostiole_state:"ragged",rupture_pattern:"fragmented_opening"}})
  }),
  earthball_type:Object.freeze({
    label:"Earthball / Scleroderma-type archetype",
    taxonomicScope:"Scleroderma-like thick-walled gasteroid teaching archetype; not a species identification.",
    allowed:Object.freeze({
      puff_shape:Object.freeze(["globose","subglobose","irregular"]),
      puff_surface:Object.freeze(["verrucose","granular"]),
      puff_base:Object.freeze(["short","rooting"])
    }),
    defaults:Object.freeze({puff_shape:"subglobose",puff_surface:"verrucose",puff_base:"rooting",rupture_pattern:"irregular_rupture"}),
    architecture:Object.freeze({wallFactor:1.42,subglebaFactor:.32,stipeFactor:0,rayCount:0,glebaFactor:.92,ostioleBias:.18}),
    development:Object.freeze({wallPersistence:1.28,ornamentPersistence:1.12,ruptureBias:.72,collapseBias:.72}),stageBehavior:Object.freeze({young:{ostiole_state:"absent",rupture_pattern:"intact"},mature:{ostiole_state:"absent",rupture_pattern:"radial_cracking"},old:{ostiole_state:"ragged",rupture_pattern:"irregular_rupture"}})
  }),
  earthstar_type:Object.freeze({
    label:"Earthstar archetype",
    taxonomicScope:"Geastrum-like earthstar teaching archetype; not a species identification.",
    allowed:Object.freeze({
      puff_shape:Object.freeze(["globose","subglobose"]),
      puff_surface:Object.freeze(["granular","furfuraceous","glabrous"]),
      puff_base:Object.freeze(["none","short"])
    }),
    defaults:Object.freeze({puff_shape:"subglobose",puff_surface:"granular",puff_base:"none",rupture_pattern:"apical_ostiole"}),
    architecture:Object.freeze({wallFactor:.82,subglebaFactor:.10,stipeFactor:0,rayCountRange:Object.freeze([5,11]),glebaFactor:.78,ostioleBias:1.15}),
    development:Object.freeze({wallPersistence:.92,ornamentPersistence:.66,ruptureBias:.92,collapseBias:.54}),stageBehavior:Object.freeze({young:{ostiole_state:"absent",rupture_pattern:"intact"},mature:{ostiole_state:"developing",rupture_pattern:"apical_ostiole"},old:{ostiole_state:"open",rupture_pattern:"apical_ostiole"}})
  }),
  stalked_puffball_type:Object.freeze({
    label:"Stalked puffball / Tulostoma-type archetype",
    taxonomicScope:"Tulostoma-like stalked gasteroid teaching archetype; not a species identification.",
    allowed:Object.freeze({
      puff_shape:Object.freeze(["globose","subglobose"]),
      puff_surface:Object.freeze(["glabrous","granular","furfuraceous"]),
      puff_base:Object.freeze(["distinct","rooting"])
    }),
    defaults:Object.freeze({puff_shape:"globose",puff_surface:"granular",puff_base:"distinct",rupture_pattern:"apical_ostiole"}),
    architecture:Object.freeze({wallFactor:.76,subglebaFactor:.06,stipeFactor:1.58,rayCount:0,glebaFactor:.72,ostioleBias:1.22}),
    development:Object.freeze({wallPersistence:1.04,ornamentPersistence:.72,ruptureBias:.88,collapseBias:.48}),stageBehavior:Object.freeze({young:{ostiole_state:"absent",rupture_pattern:"intact"},mature:{ostiole_state:"developing",rupture_pattern:"apical_ostiole"},old:{ostiole_state:"open",rupture_pattern:"apical_ostiole"}})
  })
});

export function puffballSubtype(id){
  return PUFFBALL_SUBTYPE_LIBRARY[id]||PUFFBALL_SUBTYPE_LIBRARY.true_puffball;
}

export function puffballSubtypeStageDefaults(id,stageId){
  const def=puffballSubtype(id);
  return def.stageBehavior?.[stageId]||{};
}

export function applyPuffballSubtypeDefaults(selection={},id=selection.puff_subtype||"true_puffball"){
  const def=puffballSubtype(id);
  return {...selection,...def.defaults,puff_subtype:id};
}

export function enforcePuffballSubtype(selection={}){
  const id=selection.puff_subtype||"true_puffball";
  const def=puffballSubtype(id);
  const next={...selection,puff_subtype:id};
  for(const [group,allowed] of Object.entries(def.allowed)){
    if(!allowed.includes(next[group])) next[group]=def.defaults[group]||allowed[0];
  }
  return next;
}

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
  agaric_pileus_profile:Object.freeze({
    conical:{anatomyId:"pileus",short:"Pileus rises toward a pointed apex.",detail:"Conical pilei have relatively straight radial slopes converging toward the center."},
    campanulate:{anatomyId:"pileus",short:"Pileus is bell-shaped.",detail:"Campanulate pilei retain a relatively tall center and steeply descending sides."},
    convex:{anatomyId:"pileus",short:"Pileus forms a broad rounded dome.",detail:"Convex caps have a smoothly arched profile without a localized central boss."},
    plano_convex:{anatomyId:"pileus",short:"Pileus is low-domed and approaching flat.",detail:"Plano-convex describes a shallow convex profile intermediate between convex and plane."},
    flat:{anatomyId:"pileus",short:"Pileus is broadly plane.",detail:"A flat pileus has little global vertical curvature, although the center and margin may still carry independent morphology."},
    depressed:{anatomyId:"pileus",short:"Pileus center lies below the surrounding disc.",detail:"A depressed profile has a broad central concavity without necessarily becoming a deep funnel."},
    infundibuliform:{anatomyId:"pileus",short:"Pileus is distinctly funnel-shaped.",detail:"Infundibuliform pilei descend strongly from the margin toward a deep central depression."},
    umbilicate:{anatomyId:"pileus",short:"Pileus has a small navel-like central depression.",detail:"Umbilicate describes a localized, relatively narrow central depression resembling a navel."},
    umbonate:{anatomyId:"pileus",short:"Pileus bears a broad central boss.",detail:"Umbonate pilei have a localized raised center above the surrounding disc."},
    ovate:{anatomyId:"pileus",short:"Pileus is egg-shaped in profile.",detail:"Ovate pilei are strongly arched and vertically deep, typical of compact unexpanded forms."}
  }),
  agaric_pileus_center:Object.freeze({
    even:{anatomyId:"pileus",short:"Disc lacks a distinct boss or depression.",detail:"An even disc preserves the underlying profile without a superimposed central structure."},
    depressed:{anatomyId:"pileus",short:"Disc carries a visible central depression.",detail:"The depression is localized to the pileus center and remains distinct from the overall cap profile."},
    papillate:{anatomyId:"pileus",short:"Disc bears a small nipple-like papilla.",detail:"Papillate describes a narrow, pointed central projection rather than a broad umbo."},
    umbonate:{anatomyId:"pileus",short:"Disc bears a broad raised umbo.",detail:"The umbo is a rounded central boss superimposed on the overall pileus profile."}
  }),
  agaric_margin:Object.freeze({
    incurved:{anatomyId:"pileus_margin",short:"Margin curves inward toward the hymenophore.",detail:"An incurved margin turns inward below the general cap plane."},
    decurved:{anatomyId:"pileus_margin",short:"Margin curves downward.",detail:"A decurved margin descends below the general pileus plane without strongly rolling inward."},
    straight:{anatomyId:"pileus_margin",short:"Margin continues the cap profile without marked curvature.",detail:"A straight margin lacks a strong upward or inward terminal turn."},
    uplifted:{anatomyId:"pileus_margin",short:"Margin turns upward.",detail:"An uplifted margin rises above the adjacent pileus surface and alters the silhouette clearly."},
    inrolled:{anatomyId:"pileus_margin",short:"Margin rolls strongly inward.",detail:"An inrolled margin curls under toward the hymenophore, especially conspicuous in profile."},
    undulate:{anatomyId:"pileus_margin",short:"Margin forms broad waves.",detail:"An undulate margin alternates gently upward and downward around the pileus circumference."},
    lobed:{anatomyId:"pileus_margin",short:"Margin forms broad projecting lobes.",detail:"A lobed margin has repeated broad radial expansions and recessions rather than fine waviness."},
    split_cracked:{anatomyId:"pileus_margin",short:"Margin contains discrete radial splits or notches.",detail:"A split margin shows interruptions produced by tissue separation or cracking."},
    striate:{anatomyId:"pileus_margin",short:"Margin shows radial striation.",detail:"A striate margin exhibits radial lines, commonly reflecting underlying lamellae or thin marginal tissue."},
    appendiculate:{anatomyId:"pileus_margin",short:"Margin bears hanging veil remnants.",detail:"Appendiculate margins retain fragments of partial or universal veil tissue along the cap edge."}
  }),
  agaric_stipe_position:Object.freeze({
    central:{anatomyId:"stipe",short:"Stipe is centrally inserted beneath the pileus.",detail:"A central stipe intersects the pileus near its geometric center."},
    eccentric:{anatomyId:"stipe",short:"Stipe is offset from the pileus center.",detail:"An eccentric stipe is displaced laterally while remaining integrated with the hymenophore and cap body plan."}
  }),
  agaric_stipe_form:Object.freeze({
    equal:{anatomyId:"stipe",short:"Stipe diameter remains approximately uniform.",detail:"An equal stipe changes little in diameter from apex to base."},
    tapering:{anatomyId:"stipe",short:"Stipe narrows progressively.",detail:"A tapering stipe changes gradually in diameter without a discrete club or bulb."},
    clavate:{anatomyId:"stipe",short:"Stipe broadens toward a club-like base.",detail:"Clavate form expands gradually below, producing a club-shaped lower stipe."},
    ventricose:{anatomyId:"stipe",short:"Stipe is swollen around the middle.",detail:"Ventricose describes a conspicuous mid-stipe swelling with narrower apex and base."},
    bulbous_base:{anatomyId:"stipe_base",short:"Stipe terminates in a localized rounded basal swelling.",detail:"A bulbous base is more discrete than the gradual widening of a clavate stipe."},
    rooting:{anatomyId:"stipe_base",short:"Stipe extends downward into a rooting process.",detail:"A rooting form narrows below the apparent substrate line into an elongated basal extension."}
  }),
  agaric_stipe_context:Object.freeze({
    solid:{anatomyId:"stipe_context",short:"Stipe appears internally solid.",detail:"Context fills the stipe cross-section without a distinct axial cavity."},
    stuffed:{anatomyId:"stipe_context",short:"Stipe contains loose or pithy internal tissue.",detail:"Stuffed context represents a partially filled axis rather than a dense solid core."},
    hollow:{anatomyId:"stipe_context",short:"Stipe contains a continuous axial cavity.",detail:"Hollow stipes retain a tissue wall around a visible central lumen."}
  }),
  agaric_stipe_surface_apex:Object.freeze({
    smooth:{anatomyId:"stipe_apex",short:"Apex lacks conspicuous ornament.",detail:"The upper stipe is macroscopically smooth."},
    fibrillose:{anatomyId:"stipe_apex",short:"Apex bears fine fibrils.",detail:"Fine fibrous elements run on the upper stipe surface."},
    floccose:{anatomyId:"stipe_apex",short:"Apex bears loose cottony tufts.",detail:"Floccose texture consists of soft irregular superficial tufts rather than scales."},
    scaly:{anatomyId:"stipe_apex",short:"Apex bears small scale-like elements.",detail:"Discrete surface scales project from the upper stipe."},
    reticulate:{anatomyId:"reticulation",short:"Apex bears a net-like ridge pattern.",detail:"Raised intersecting ridges form a reticulum."},
    pruinose:{anatomyId:"pruina",short:"Apex carries a fine frosted bloom.",detail:"Pruinose texture is a delicate powdery or crystalline-looking superficial coating."},
    longitudinal_striate:{anatomyId:"stipe_apex",short:"Apex shows longitudinal grooves or ridges.",detail:"Axial striation follows the long axis of the stipe."}
  }),
  agaric_stipe_surface_mid:Object.freeze({
    smooth:{anatomyId:"stipe_mid",short:"Mid-stipe is smooth.",detail:"No conspicuous projecting ornament is present."},
    fibrillose:{anatomyId:"stipe_mid",short:"Mid-stipe is fibrillose.",detail:"Fine fibers are distributed over the middle stipe."},
    floccose:{anatomyId:"stipe_mid",short:"Mid-stipe is floccose.",detail:"Loose cottony surface tufts occur over the middle region."},
    scaly:{anatomyId:"stipe_mid",short:"Mid-stipe is scaly.",detail:"Discrete scale-like elements occur over the middle region."},
    reticulate:{anatomyId:"reticulation",short:"Mid-stipe is reticulate.",detail:"Raised net-like ridges occur over the middle region."},
    longitudinal_striate:{anatomyId:"stipe_mid",short:"Mid-stipe is longitudinally striate.",detail:"Axial grooves or ridges run along the middle region."}
  }),
  agaric_stipe_surface_base:Object.freeze({
    smooth:{anatomyId:"stipe_base",short:"Base is smooth.",detail:"No conspicuous surface ornament is present at the base."},
    fibrillose:{anatomyId:"stipe_base",short:"Base is fibrillose.",detail:"Fine fibers occur over the basal region."},
    floccose:{anatomyId:"stipe_base",short:"Base is floccose.",detail:"Loose cottony surface tufts occur at the base."},
    scaly:{anatomyId:"stipe_base",short:"Base is scaly.",detail:"Discrete scale-like elements occur at the base."},
    reticulate:{anatomyId:"reticulation",short:"Base is reticulate.",detail:"Raised net-like ridges occur over the basal region."},
    longitudinal_striate:{anatomyId:"stipe_base",short:"Base is longitudinally striate.",detail:"Axial grooves or ridges run into the basal region."}
  }),
  agaric_stipe_taper:Object.freeze({
    equal:{anatomyId:"stipe",short:"Stipe diameter remains approximately uniform.",detail:"An equal stipe changes little in diameter between apex and base."},
    clavate:{anatomyId:"stipe",short:"Stipe broadens gradually toward a club-like base.",detail:"Clavate stipes enlarge progressively downward without forming a sharply discrete bulb."},
    bulbous_base:{anatomyId:"stipe_base",short:"Stipe terminates in a rounded basal swelling.",detail:"A bulbous base is a conspicuous localized enlargement at the stipe base."},
    rooting:{anatomyId:"stipe_base",short:"Stipe continues downward into a rooting process.",detail:"A rooting stipe narrows below the apparent substrate level into an elongated pseudorhiza-like extension."},
    attenuate_upward:{anatomyId:"stipe",short:"Stipe narrows progressively toward the apex.",detail:"Attenuate upward describes a stipe that is broader below and gradually narrows toward the pileus."}
  }),
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
  agaric_surface_primary:Object.freeze({
    glabrous:{anatomyId:"pileipellis",short:"Surface lacks conspicuous hairs, scales, or warts.",detail:"Glabrous denotes a macroscopically smooth pileus without evident projecting ornament."},
    smooth:{anatomyId:"pileipellis",short:"Surface is macroscopically even.",detail:"Smooth pileus surfaces retain only low-relief natural micro-undulation without discrete ornament."},
    innately_fibrillose:{anatomyId:"surface_fibrils",short:"Fine innate fibrils traverse the pileus.",detail:"Innately fibrillose surfaces show directional fibrils arising from the pileipellis rather than merely from weathering."},
    appressed_fibrillose:{anatomyId:"surface_fibrils",short:"Fibrils lie flattened against the pileus.",detail:"Appressed fibrils remain directional but have low relief and lie close to the pileipellis."},
    silky:{anatomyId:"surface_fibrils",short:"Very fine fibers create a silky luster.",detail:"Silky surfaces combine fine aligned fibrils with directional sheen rather than coarse projecting ornament."},
    squamulose:{anatomyId:"pileus_scales",short:"Pileus bears small scale-like squamules.",detail:"Squamulose surfaces carry discrete flattened or slightly raised scales, commonly varying between disc and margin."},
    shaggy_scaly:{anatomyId:"pileus_scales",short:"Pileus bears coarse uplifted shaggy scales.",detail:"Shaggy-scaly surfaces carry larger, more erect and irregular scale elements with strong three-dimensional relief."},
    verrucose:{anatomyId:"pileus_warts",short:"Pileus bears blunt wart-like elevations.",detail:"Verrucose ornament consists of mound-like elevations rather than fibrous or plate-like scales."},
    areolate:{anatomyId:"pileus_cracks",short:"Surface breaks into polygonal cracked areas.",detail:"Areolate surfaces develop a network of fissures separating surface plates and exposing underlying tissue."},
    viscid:{anatomyId:"pileipellis",short:"Surface is distinctly sticky or slimy when moist.",detail:"Viscid pilei show a coherent wet-film response with strong specular reflection but limited bulk mucus."},
    glutinous:{anatomyId:"pileipellis",short:"Surface carries a thicker gelatinous/slimy coating.",detail:"Glutinous pilei exhibit a thicker mucilaginous surface layer than merely viscid forms."},
    dry:{anatomyId:"pileipellis",short:"Surface lacks wet sheen.",detail:"Dry pilei emphasize roughness and microtexture with little or no moisture-film reflectance."},
    waxy:{anatomyId:"pileipellis",short:"Surface appears smooth with a soft wax-like luster.",detail:"Waxy surfaces show subdued broad highlights and a sealed appearance without the wet-film behavior of viscid or glutinous states."},
    velvety:{anatomyId:"pileus_tomentum",short:"Surface has a dense short nap.",detail:"Velvety pilei bear very fine short erect surface elements producing a matte soft appearance."},
    tomentose:{anatomyId:"pileus_tomentum",short:"Surface is visibly woolly or felted.",detail:"Tomentose pilei bear a denser, longer, often irregularly tufted covering than velvety surfaces."}
  }),
  agaric_surface_secondary:Object.freeze({
    none:{anatomyId:"pileipellis",short:"No secondary surface layer.",detail:"Only the primary cap-surface expression is rendered."},
    fibrillose:{anatomyId:"surface_fibrils",short:"Adds a secondary fibrillose field.",detail:"Fine fibrils overlay the primary surface without replacing it."},
    squamulose_disc:{anatomyId:"pileus_scales",short:"Adds squamules concentrated on the disc.",detail:"Discrete scales are restricted primarily to the central disc over the underlying primary surface."},
    scaly:{anatomyId:"pileus_scales",short:"Adds a secondary scale field.",detail:"A secondary scale layer is combined with the selected ground surface."},
    silky:{anatomyId:"surface_fibrils",short:"Adds fine silky directional luster.",detail:"A fine aligned fibril/sheens layer overlays the primary surface."},
    weathered:{anatomyId:"pileipellis",short:"Adds wear and partial surface loss.",detail:"Weathering selectively reduces or fragments the primary ornament."},
    cracked:{anatomyId:"pileus_cracks",short:"Adds an areolate crack network.",detail:"Cracking overlays the primary ground and exposes darker or lighter tissue in fissures."},
    waxy:{anatomyId:"pileipellis",short:"Adds a wax-like finish.",detail:"A soft sealed luster overlays the primary surface."},
    tomentose:{anatomyId:"pileus_tomentum",short:"Adds woolly surface tufts.",detail:"Tomentum overlays the primary surface in a secondary patchy layer."}
  }),
  agaric_surface_distribution:Object.freeze({
    uniform:{anatomyId:"pileipellis",short:"Surface state is distributed broadly.",detail:"Texture probability remains relatively even across disc, mid-zone and margin."},
    disc_emphasized:{anatomyId:"pileipellis",short:"Surface ornament is strongest on the disc.",detail:"Density or relief is biased toward the pileus center and declines toward the margin."},
    margin_emphasized:{anatomyId:"pileus_margin",short:"Surface expression increases toward the margin.",detail:"Density or relief is biased toward the pileus edge."},
    radial:{anatomyId:"pileipellis",short:"Texture follows radial organization.",detail:"Surface structures align or recur along radial trajectories from disc toward margin."},
    concentric:{anatomyId:"pileipellis",short:"Texture occurs in concentric zones.",detail:"Surface intensity varies in annular bands around the pileus center."},
    irregular_patches:{anatomyId:"pileipellis",short:"Texture occurs in irregular patches.",detail:"A deterministic patch field creates localized high- and low-density regions."},
    aging_from_disc:{anatomyId:"pileipellis",short:"Weathering begins or concentrates on the disc.",detail:"Age-related breakdown is weighted toward the center and propagates outward."},
    aging_from_margin:{anatomyId:"pileus_margin",short:"Weathering begins or concentrates at the margin.",detail:"Age-related breakdown is weighted toward the pileus edge and propagates inward."}
  }),
  agaric_surface_age:Object.freeze({
    fresh:{anatomyId:"pileipellis",short:"Surface is freshly expressed.",detail:"Primary ornament and finish are retained with minimal abrasion."},
    slightly_weathered:{anatomyId:"pileipellis",short:"Minor wear is present.",detail:"A small proportion of ornament is reduced, flattened, or interrupted."},
    weathered:{anatomyId:"pileipellis",short:"Surface shows substantial age-related wear.",detail:"Ornament becomes patchy, fractured, abraded, or locally absent."},
    old_broken:{anatomyId:"pileipellis",short:"Surface is strongly weathered and broken.",detail:"Advanced senescence produces extensive ornament loss, cracking, fragmentation and roughened ground."}
  }),
  agaric_surface_moisture:Object.freeze({
    dry:{anatomyId:"pileipellis",short:"High-roughness dry finish.",detail:"No coherent wet film is represented."},
    subviscid:{anatomyId:"pileipellis",short:"Slightly tacky low-level sheen.",detail:"Subviscid surfaces show modest specular enhancement without a conspicuous slime layer."},
    viscid:{anatomyId:"pileipellis",short:"Distinct wet-film sheen.",detail:"Viscid surfaces show reduced roughness and stronger coherent highlights."},
    glutinous:{anatomyId:"pileipellis",short:"Thicker mucilaginous surface effect.",detail:"Glutinous finishes combine strong gloss, subtle translucent film, and localized pooling/streaking."},
    waxy:{anatomyId:"pileipellis",short:"Soft broad wax-like luster.",detail:"Waxy surfaces are smoother and lustrous without appearing wet or slimy."}
  }),
  agaric_gill_attachment:Object.freeze({
    free_gills:{anatomyId:"hymenophore",short:"Gills stop short of the stipe.",detail:"Free lamellae leave a visible annular gap around the stipe apex."},
    adnexed:{anatomyId:"hymenophore",short:"Gills attach narrowly to the stipe.",detail:"Adnexed lamellae contact the stipe through only a small portion of their proximal edge."},
    adnate:{anatomyId:"hymenophore",short:"Gills attach broadly and directly.",detail:"Adnate lamellae meet the stipe broadly without descending along it."},
    sinuate:{anatomyId:"hymenophore",short:"Gills form a smooth notch near the stipe.",detail:"Sinuate lamellae curve upward in a sinus immediately before stipe insertion."},
    emarginate:{anatomyId:"hymenophore",short:"Gills form a sharper notch near the stipe.",detail:"Emarginate lamellae show a distinct proximal notch before attaching to the stipe."},
    subdecurrent:{anatomyId:"hymenophore",short:"Gills descend slightly onto the stipe.",detail:"Subdecurrent lamellae extend a short distance below the pileus-stipe junction."},
    decurrent:{anatomyId:"hymenophore",short:"Gills run conspicuously down the stipe.",detail:"Decurrent lamellae continue below the pileus-stipe junction for a clearly visible distance."},
    seceding:{anatomyId:"hymenophore",short:"Originally attached gills separate with development.",detail:"Seceding lamellae are developmentally attached and later pull away, leaving a secondary gap."}
  }),
  agaric_gill_spacing:Object.freeze({
    distant:{anatomyId:"lamella",short:"Gill spacing is visibly broad.",detail:"Distant lamellae are relatively few around the pileus circumference, leaving conspicuous interlamellar gaps."},
    subdistant:{anatomyId:"lamella",short:"Gill spacing is moderately open.",detail:"Subdistant lamellae are more numerous than distant gills but retain obvious spaces between neighboring plates."},
    close:{anatomyId:"lamella",short:"Gills are closely spaced.",detail:"Close lamellae occupy most of the circumference with narrow but clearly visible interlamellar gaps."},
    crowded:{anatomyId:"lamella",short:"Gills are densely crowded.",detail:"Crowded lamellae are very numerous, with minimal space between adjacent gill plates."}
  }),
  agaric_gill_thickness:Object.freeze({
    thin:{anatomyId:"lamella",short:"Gill plates are thin.",detail:"Thin lamellae have narrow plate thickness and a delicate edge profile."},
    moderate:{anatomyId:"lamella",short:"Gill plates are moderately thick.",detail:"Moderately broad lamellae have visibly more substantial plate thickness while retaining a plate-like form."},
    broad:{anatomyId:"lamella",short:"Gill plates are broad and substantial.",detail:"Broad lamellae have a conspicuous plate thickness and robust edge in close view."}
  }),
  agaric_gill_depth:Object.freeze({
    shallow:{anatomyId:"lamella",short:"Gill plates descend only slightly below the pileus.",detail:"Shallow lamellae have limited vertical depth between pileus context and the free gill edge."},
    moderate:{anatomyId:"lamella",short:"Gill plates have moderate vertical depth.",detail:"Moderate lamellae show a clear plate beneath the pileus without an unusually deep edge."},
    deep:{anatomyId:"lamella",short:"Gill plates descend deeply below the pileus.",detail:"Deep lamellae have a conspicuous vertical profile and remain evident in lateral close-up."}
  }),
  agaric_lamellulae:Object.freeze({
    absent:{anatomyId:"lamellula",short:"No short gills are represented.",detail:"All visible lamellae extend to the inner attachment zone; no lamellulae terminate short of the stipe."},
    sparse:{anatomyId:"lamellula",short:"A small number of lamellulae occur between full gills.",detail:"Sparse lamellulae add occasional short plates that terminate before reaching the stipe."},
    moderate:{anatomyId:"lamellula",short:"Lamellulae are regularly interspersed.",detail:"Moderate lamellulae produce multiple length tiers between full lamellae."},
    abundant:{anatomyId:"lamellula",short:"Numerous lamellulae fill interlamellar spaces.",detail:"Abundant lamellulae occur in several length tiers and make the hymenophore visibly denser near the margin."}
  }),
  agaric_gill_edge:Object.freeze({
    even:{anatomyId:"lamella",short:"Gill edge is smooth and even.",detail:"The free edge forms a continuous, relatively regular line."},
    serrulate:{anatomyId:"lamella",short:"Gill edge is finely saw-toothed.",detail:"Serrulate edges bear repeated small tooth-like projections along the free margin."},
    fimbriate:{anatomyId:"lamella",short:"Gill edge is fringed.",detail:"Fimbriate edges carry fine irregular fringe-like projections rather than simple teeth."},
    crisped:{anatomyId:"lamella",short:"Gill edge is finely crimped or wrinkled.",detail:"Crisped edges show small repeated folds and undulations along the free margin."}
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
  puff_subtype:Object.freeze({
    true_puffball:{anatomyId:"puffball",short:"Generalized true puffball teaching archetype.",detail:"Represents an enclosed glebal body with layered peridium and variable surface ornamentation. It is a morphological teaching model, not a species determination."},
    pyriform_puffball:{anatomyId:"sterile_base",short:"Pear-shaped puffball teaching archetype.",detail:"Emphasizes a broadened fertile head and differentiated sterile basal region while preserving enclosed glebal development."},
    gem_studded_type:{anatomyId:"exoperidium",short:"Gem-studded Lycoperdon-like teaching archetype.",detail:"Emphasizes youthful echinate or warted exoperidial ornament and strong age-dependent abrasion without asserting a species identification."},
    giant_puffball_type:{anatomyId:"peridium",short:"Large smooth calvatioid teaching archetype.",detail:"Emphasizes a broad smooth body, extensive gleba, reduced subgleba, and irregular wall rupture rather than a small persistent pore."},
    earthball_type:{anatomyId:"peridium",short:"Thick-walled Scleroderma-like teaching archetype.",detail:"Emphasizes a firm thick peridium, verrucose surface, darkening gleba, and irregular rupture. It remains conceptually separate from true puffballs."},
    earthstar_type:{anatomyId:"peridium",short:"Earthstar teaching archetype.",detail:"Emphasizes an inner spore sac associated with an outer peridial layer that splits into star-like rays during maturation; not a species identification."},
    stalked_puffball_type:{anatomyId:"sterile_base",short:"Tulostoma-like stalked gasteroid teaching archetype.",detail:"Emphasizes a discrete spore sac elevated on a sterile stalk with an apical release opening; not a species identification."}
  }),
  puff_surface:Object.freeze({
    glabrous:{anatomyId:"exoperidium",short:"Outer surface lacks macroscopic spines, warts, grains, or flakes.",detail:"Glabrous means macroscopically smooth, not artificially featureless. Fine biological micro-relief, color variation, and weathering may remain, and an old abraded surface should not automatically be interpreted as originally glabrous."},
    granular:{anatomyId:"exoperidium",short:"Outer surface bears dense fine grain-like ornament.",detail:"Granular exoperidium is expressed as numerous very small low-relief grains rather than miniature warts. Grain density and prominence generally diminish through abrasion with age."},
    verrucose:{anatomyId:"exoperidium",short:"Outer surface bears broad-based wart-like elevations.",detail:"Verrucose ornamentation consists of blunt, broad-based, variably sized tissue elevations integrated into the exoperidium. Warts may flatten, round, merge locally, and become reduced with maturation."},
    echinate:{anatomyId:"exoperidium",short:"Outer surface bears pointed spines or prickles with integrated bases.",detail:"Echinate ornamentation consists of exoperidial spines that vary in height, width, lean, clustering, and preservation. Young spines may be intact; maturation can produce broken tips, shortened remnants, bare abrasion patches, and eventual loss."},
    furfuraceous:{anatomyId:"exoperidium",short:"Outer surface carries a fine scurfy or bran-like flaky coating.",detail:"Furfuraceous ornamentation is a thin, irregular, partly lifted flaky covering rather than a field of spines or warts. The coating becomes patchier and may be largely lost with age."}
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
  rupture_pattern:Object.freeze({
    intact:{anatomyId:"peridium",short:"Peridium remains closed without a rupture.",detail:"No dehiscence is represented; appropriate for immature or intact fruit bodies."},
    apical_ostiole:{anatomyId:"apical_pore",short:"A discrete apical spore-release opening is present.",detail:"An apical ostiole forms a localized opening through mature peridial tissue."},
    small_apical_tear:{anatomyId:"rupture_margin",short:"A small irregular tear opens near the apex.",detail:"A limited apical tear represents early or irregular dehiscence beyond a simple round ostiole."},
    radial_cracking:{anatomyId:"rupture_margin",short:"Cracks radiate from the apical region.",detail:"Radial fissures divide the upper peridium into connected sectors while preserving most wall continuity."},
    irregular_rupture:{anatomyId:"rupture_margin",short:"An asymmetric opening exposes the gleba.",detail:"Irregular rupture creates a non-circular, biologically weathered opening rather than a geometric hole."},
    collapsed_crown:{anatomyId:"collapsed_wall",short:"The upper wall is broken and partly collapsed.",detail:"Senescent drying and wall failure produce a depressed, broken crown with exposed gleba."},
    lateral_break:{anatomyId:"rupture_margin",short:"The wall opens primarily along one side.",detail:"A lateral break exposes the interior asymmetrically and may result from weathering or mechanical damage."},
    fragmented_opening:{anatomyId:"rupture_margin",short:"The opening is bordered by multiple retained wall fragments.",detail:"Advanced dehiscence leaves an irregular opening with connected and partly detached peridial remnants."}
  }),
  rupture_margin:Object.freeze({
    clean:{anatomyId:"rupture_margin",short:"Opening edge is relatively even.",detail:"A comparatively clean margin has little tearing or curling."},
    slightly_torn:{anatomyId:"rupture_margin",short:"Opening edge has limited tearing.",detail:"Small discontinuities and slight irregularity mark the rupture edge."},
    ragged:{anatomyId:"rupture_margin",short:"Opening edge is strongly irregular.",detail:"Ragged margins show multiple uneven lobes and tears caused by drying or rupture."},
    curled_out:{anatomyId:"rupture_margin",short:"Dry wall tissue curls outward.",detail:"Outward curling exposes the inner peridial surface along the rupture margin."},
    curled_in:{anatomyId:"rupture_margin",short:"Dry wall tissue curls inward.",detail:"Inward curling turns the rupture edge toward the glebal cavity."},
    frayed:{anatomyId:"rupture_margin",short:"Margin is weathered and frayed.",detail:"A frayed edge represents advanced abrasion and thinning of senescent peridial tissue."}
  }),
  collapse_state:Object.freeze({
    none:{anatomyId:"peridium",short:"Fruit-body wall remains fully supported.",detail:"No additional deformation beyond the selected developmental stage is applied."},
    slight:{anatomyId:"collapsed_wall",short:"Wall shows subtle settling and asymmetry.",detail:"Slight collapse introduces modest flattening and denting without major wall failure."},
    moderate:{anatomyId:"collapsed_wall",short:"Wall is visibly dented and partly caved.",detail:"Moderate collapse produces asymmetric settling as dry tissue loses structural support."},
    severe:{anatomyId:"collapsed_wall",short:"Fruit body is strongly collapsed.",detail:"Severe collapse greatly reduces height and creates major wall deformation."},
    weathered:{anatomyId:"collapsed_wall",short:"Wall is irregularly distorted by senescence and weathering.",detail:"Weathered distortion combines asymmetric flattening, dents, rotation, and uneven shell failure."}
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
