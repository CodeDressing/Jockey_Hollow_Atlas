export const KNOWLEDGE_OBJECTS = Object.freeze({
  basidiome:{
    id:"basidiome",label:"Whole basidiome",level:"organism",pronunciation:"basidiome",
    beginner:"The visible fungal fruiting body.",
    expert:"Macroscopic sporocarp produced by a basidiomycete; architecture varies among agaricoid, boletoid, polyporoid, hydnoid, clavarioid, gasteroid and other forms.",
    relationships:["pileus","hymenophore","stipe"]
  },
  pileus:{
    id:"pileus",label:"Pileus",level:"macro",pronunciation:"pileus",
    beginner:"The cap or upper part of many mushrooms.",
    expert:"Expanded sterile-to-fertile upper region of a sporocarp; its shape, surface, margin, context and pigmentation are major diagnostic characters.",
    relationships:["pileus_context","hymenophore","pileus_margin","umbo","infundibuliform","umbonate","umbilicate","campanulate","conical","convex","plane","depressed"]
  },
  pileus_margin:{
    id:"pileus_margin",label:"Pileus margin",level:"macro",pronunciation:"pileus margin",
    beginner:"The outer edge of the mushroom cap.",
    expert:"Peripheral edge of the pileus; orientation, striation, appendiculation, thickness, splitting and pigmentation are diagnostically informative.",
    relationships:["pileus"]
  },
  umbo:{
    id:"umbo",label:"Umbo",level:"macro",pronunciation:"umbo",
    beginner:"A raised bump or boss at the center of a mushroom cap.",
    expert:"A central pileal prominence or boss; degree of elevation and breadth distinguish umbonate from more sharply papillate conditions.",
    relationships:["pileus","umbonate","papillate"]
  },
  umbonate:{
    id:"umbonate",label:"Umbonate pileus",level:"macro",pronunciation:"umbonate",
    beginner:"A cap with a raised central bump.",
    expert:"Pileus bearing a distinct central umbo; the prominence may be broad or sharply delimited depending on the taxon and developmental state.",
    relationships:["pileus","umbo"]
  },
  papillate:{
    id:"papillate",label:"Papillate pileus",level:"macro",pronunciation:"papillate",
    beginner:"A cap with a small nipple-like central point.",
    expert:"Pileus bearing a small, sharply localized papilla; distinguished from the broader central elevation termed an umbo.",
    relationships:["pileus","umbo"]
  },
  infundibuliform:{
    id:"infundibuliform",label:"Infundibuliform pileus",level:"macro",pronunciation:"infundibuliform",
    beginner:"A funnel-shaped mushroom cap.",
    expert:"Pileus deeply centrally depressed and funnel-shaped, with the surface descending toward the disc and rising toward the margin.",
    relationships:["pileus","depressed"]
  },
  conical:{
    id:"conical",label:"Conical pileus",level:"macro",pronunciation:"conical",
    beginner:"A cone-shaped cap.",
    expert:"Pileus with sides converging toward a distinct apical region, producing a conical profile.",
    relationships:["pileus"]
  },
  campanulate:{
    id:"campanulate",label:"Campanulate pileus",level:"macro",pronunciation:"campanulate",
    beginner:"A bell-shaped cap.",
    expert:"Pileus bell-shaped in profile, typically with a rounded apex and downward-curving sides.",
    relationships:["pileus"]
  },
  ovate:{
    id:"ovate",label:"Ovate pileus",level:"macro",pronunciation:"ovate",
    beginner:"An egg-shaped cap.",
    expert:"Pileus ovoid or egg-shaped in profile, often encountered in relatively young basidiomata.",
    relationships:["pileus"]
  },
  convex:{
    id:"convex",label:"Convex pileus",level:"macro",pronunciation:"convex",
    beginner:"A rounded, outward-curving cap.",
    expert:"Pileus arched upward from the margin toward the disc without a distinct central boss.",
    relationships:["pileus"]
  },
  plane:{
    id:"plane",label:"Plane pileus",level:"macro",pronunciation:"plane",
    beginner:"A flat or nearly flat cap.",
    expert:"Pileus essentially flat in profile, commonly representing a mature expansion state.",
    relationships:["pileus"]
  },
  depressed:{
    id:"depressed",label:"Depressed pileus",level:"macro",pronunciation:"depressed",
    beginner:"A cap whose center sits lower than the surrounding surface.",
    expert:"Pileus with a central depression; shallower than a strongly infundibuliform configuration.",
    relationships:["pileus","infundibuliform","umbilicate"]
  },
  umbilicate:{
    id:"umbilicate",label:"Umbilicate pileus",level:"macro",pronunciation:"umbilicate",
    beginner:"A cap with a small navel-like depression in the center.",
    expert:"Pileus with a small, abrupt, umbilicus-like central depression rather than a broad funnel-shaped disc.",
    relationships:["pileus","depressed"]
  },
  pileus_context:{
    id:"pileus_context",label:"Pileus context",level:"tissue",pronunciation:"pileus context",
    beginner:"The flesh inside the cap.",
    expert:"Internal trama/context between pileipellis and hymenophore; thickness, consistency, color reactions and hyphal construction may be diagnostic.",
    relationships:["pileus","hymenophore","trama"]
  },
  hymenophore:{
    id:"hymenophore",label:"Hymenophore",level:"macro",pronunciation:"hymenophore",
    beginner:"The spore-bearing surface structure: gills, pores, teeth, folds, or a smooth surface.",
    expert:"Macromorphological structure supporting the hymenium. Configuration includes lamellae, tubes/pores, hydnoid teeth, folds, smooth surfaces and other forms.",
    relationships:["trama","subhymenium","hymenium"]
  },
  lamella:{
    id:"lamella",label:"Lamella / gill",level:"macro",pronunciation:"lamella",
    beginner:"A plate-like gill under a mushroom cap.",
    expert:"Radial lamellate hymenophore element whose faces bear hymenium; attachment, spacing, thickness, branching and lamellulae are diagnostic.",
    relationships:["gill_attachment","trama","subhymenium","hymenium"]
  },
  gill_attachment:{
    id:"gill_attachment",label:"Gill attachment",level:"macro",pronunciation:"gill attachment",
    beginner:"The way a gill meets, avoids, or runs down the mushroom stalk.",
    expert:"Relationship of the proximal lamellar edge to the stipe. Attachment state is a major macromorphological character and should be evaluated at the stipe-lamella junction in a mature, intact basidiome.",
    relationships:["lamella","free_gills","adnexed","adnate","sinuate","emarginate","decurrent","subdecurrent","seceding"]
  },
  free_gills:{
    id:"free_gills",label:"Free gills",level:"macro",pronunciation:"free gills",
    beginner:"The gills stop before they touch the stalk.",
    expert:"Lamellae terminate proximal to the stipe and are completely unattached, leaving a visible annular gap around the stipe.",
    relationships:["gill_attachment","lamella","stipe"]
  },
  adnexed:{
    id:"adnexed",label:"Adnexed gills",level:"macro",pronunciation:"adnexed",
    beginner:"The gills touch the stalk only narrowly.",
    expert:"Lamellae attach to the stipe by a small portion of their proximal depth, producing a narrow point of insertion.",
    relationships:["gill_attachment","lamella","stipe"]
  },
  adnate:{
    id:"adnate",label:"Adnate gills",level:"macro",pronunciation:"adnate",
    beginner:"The gills attach broadly to the stalk.",
    expert:"Lamellae meet the stipe broadly, with most or essentially all of the proximal gill depth attached directly to the stipe.",
    relationships:["gill_attachment","lamella","stipe"]
  },
  sinuate:{
    id:"sinuate",label:"Sinuate gills",level:"macro",pronunciation:"sinuate",
    beginner:"The gills curve inward in a smooth notch just before meeting the stalk.",
    expert:"Lamellae develop a smooth sinus or concave indentation immediately before insertion on the stipe.",
    relationships:["gill_attachment","lamella","stipe","emarginate"]
  },
  emarginate:{
    id:"emarginate",label:"Emarginate gills",level:"macro",pronunciation:"emarginate",
    beginner:"The gills have a distinct notch immediately before they meet the stalk.",
    expert:"Lamellae are distinctly notched at the proximal edge before stipe insertion. Terminology overlaps with sinuate in some descriptive traditions; the atlas preserves both terms while distinguishing a sharper emarginate notch from a smoother sinus.",
    relationships:["gill_attachment","lamella","stipe","sinuate"]
  },
  decurrent:{
    id:"decurrent",label:"Decurrent gills",level:"macro",pronunciation:"decurrent",
    beginner:"The gills run clearly down the stalk.",
    expert:"Lamellae continue below the pileus-stipe junction and descend conspicuously along the stipe.",
    relationships:["gill_attachment","lamella","stipe","subdecurrent"]
  },
  subdecurrent:{
    id:"subdecurrent",label:"Subdecurrent gills",level:"macro",pronunciation:"subdecurrent",
    beginner:"The gills run only a short way down the stalk.",
    expert:"Lamellae descend slightly below the pileus-stipe junction but less extensively than fully decurrent lamellae.",
    relationships:["gill_attachment","lamella","stipe","decurrent"]
  },
  seceding:{
    id:"seceding",label:"Seceding gills",level:"macro",pronunciation:"seceding",
    beginner:"The gills were attached but pull away from the stalk as the mushroom matures.",
    expert:"Developmentally attached lamellae that become detached from the stipe during expansion or maturation, producing a secondary gap. This is a developmental state rather than simply a fixed primary insertion geometry.",
    relationships:["gill_attachment","lamella","stipe"]
  },
  trama:{
    id:"trama",label:"Trama",level:"tissue",pronunciation:"trama",
    beginner:"Supporting tissue inside a gill or other fertile structure.",
    expert:"Sterile internal tissue of a lamella, tube wall or other hymenophoral element; arrangement may be regular, subregular, divergent, convergent or bilateral.",
    relationships:["subhymenium"]
  },
  subhymenium:{
    id:"subhymenium",label:"Subhymenium",level:"tissue",pronunciation:"subhymenium",
    beginner:"A thin supporting layer just below the spore-producing layer.",
    expert:"Differentiated hyphal zone immediately beneath the hymenium from which basidia, asci, cystidia and associated elements arise.",
    relationships:["trama","hymenium"]
  },
  hymenium:{
    id:"hymenium",label:"Hymenium",level:"micro",pronunciation:"hymenium",
    beginner:"The microscopic layer where spores are produced.",
    expert:"Fertile tissue layer containing basidia or asci plus sterile elements such as cystidia, paraphyses or basidioles depending on the fungal group.",
    relationships:["basidium","ascus","cystidium"]
  },
  basidium:{
    id:"basidium",label:"Basidium",level:"micro",pronunciation:"basidium",
    beginner:"A microscopic cell that produces basidiospores.",
    expert:"Terminal or intercalary meiotic cell of Basidiomycota, commonly bearing external sterigmata on which basidiospores develop.",
    relationships:["sterigmata","basidiospore"]
  },
  sterigmata:{
    id:"sterigmata",label:"Sterigmata",level:"micro",pronunciation:"sterigmata",
    beginner:"Tiny projections that hold developing basidiospores.",
    expert:"Slender apical projections of a basidium supporting basidiospores; number and morphology may have taxonomic value.",
    relationships:["basidium","basidiospore"]
  },
  basidiospore:{
    id:"basidiospore",label:"Basidiospore",level:"spore",pronunciation:"basidiospore",
    beginner:"A sexual spore produced by a basidium.",
    expert:"Meiospore of Basidiomycota, evaluated by dimensions, Q ratio, symmetry, wall thickness, ornamentation, germ pore, hilar appendix, color and chemical reactions.",
    relationships:["basidium","sterigmata"]
  },
  tube_layer:{
    id:"tube_layer",label:"Tube layer",level:"macro",pronunciation:"tube layer",
    beginner:"A layer of tiny tubes under a bolete or polypore.",
    expert:"Vertically to obliquely oriented hymenophoral tubes whose inner walls bear hymenium and whose openings form the pore surface.",
    relationships:["tube","pore_surface","hymenium"]
  },
  tube:{
    id:"tube",label:"Hymenophoral tube",level:"macro",pronunciation:"hymenophoral tube",
    beginner:"One microscopic-to-small tube in a poroid fertile layer.",
    expert:"Individual poroid hymenophoral unit lined internally by hymenium; tube length, stratification and attachment may aid identification.",
    relationships:["tube_layer","pore_surface","hymenium"]
  },
  pore_surface:{
    id:"pore_surface",label:"Pore surface",level:"macro",pronunciation:"pore surface",
    beginner:"The visible openings of the tubes.",
    expert:"External face of a poroid hymenophore; pore density, shape, angularity, sinuosity, color and bruising reactions are diagnostic characters.",
    relationships:["tube","tube_layer","hymenium"]
  },
  ascus:{
    id:"ascus",label:"Ascus",level:"micro",pronunciation:"ascus",
    beginner:"A microscopic sac that produces ascospores.",
    expert:"Sac-like meiotic cell of Ascomycota, typically containing endogenous ascospores; apical apparatus, wall structure and ascospore arrangement can be diagnostic.",
    relationships:["ascospore","hymenium"]
  },
  ascospore:{
    id:"ascospore",label:"Ascospore",level:"spore",pronunciation:"ascospore",
    beginner:"A sexual spore formed inside an ascus.",
    expert:"Meiospore of Ascomycota formed endogenously within an ascus; size, septation, ornamentation, pigmentation and guttulation are important characters.",
    relationships:["ascus"]
  },
  cystidium:{
    id:"cystidium",label:"Cystidium",level:"micro",pronunciation:"cystidium",
    beginner:"A sterile microscopic cell among the fertile cells.",
    expert:"Sterile differentiated hymenial or surface element; position, shape, wall thickness, contents and chemical reactions may be highly diagnostic.",
    relationships:["hymenium"]
  },
  stipe:{
    id:"stipe",label:"Stipe",level:"macro",pronunciation:"stipe",
    beginner:"The stalk supporting the cap.",
    expert:"Sterile or partly fertile supporting axis; form, surface, context, insertion, base, reticulation, scabers, veil remnants and rooting behavior are diagnostic.",
    relationships:["stipe_base","veil_structure"]
  },
  stipe_base:{
    id:"stipe_base",label:"Stipe base",level:"macro",pronunciation:"stipe base",
    beginner:"The bottom of the mushroom stalk.",
    expert:"Basal stipe architecture, potentially equal, clavate, bulbous, marginate, rooting or enclosed by universal-veil tissue.",
    relationships:["stipe","veil_structure"]
  },
  veil_structure:{
    id:"veil_structure",label:"Veil structure",level:"macro",pronunciation:"veil",
    beginner:"Remnants of tissue that protected developing parts of the mushroom.",
    expert:"Partial- or universal-veil derivatives including annulus, cortina, volva and pileal remnants; developmental state must be considered.",
    relationships:["stipe","stipe_base","pileus"]
  },
  peridium:{
    id:"peridium",label:"Peridium",level:"macro",pronunciation:"peridium",
    beginner:"The outer wall of a puffball or other enclosed fruiting body.",
    expert:"Outer protective tissue enclosing a gasteroid sporocarp; commonly differentiated into exoperidium and endoperidium.",
    relationships:["exoperidium","endoperidium","gleba","apical_pore"]
  },
  exoperidium:{
    id:"exoperidium",label:"Exoperidium",level:"macro",pronunciation:"exoperidium",
    beginner:"The outermost layer of the puffball wall.",
    expert:"Outermost peridial layer. It may be glabrous, granular, verrucose, echinate, furfuraceous, or otherwise ornamented, and may abrade or slough with age.",
    relationships:["peridium","endoperidium"]
  },
  endoperidium:{
    id:"endoperidium",label:"Endoperidium",level:"internal",pronunciation:"endoperidium",
    beginner:"The inner wall beneath the puffball's outer surface.",
    expert:"Inner peridial layer retained beneath the exoperidium; often becomes the principal persistent wall surrounding the mature gleba.",
    relationships:["peridium","exoperidium","gleba","apical_pore"]
  },
  echinate:{
    id:"echinate",label:"Echinate",level:"macro",pronunciation:"echinate",
    beginner:"Covered with obvious pointed spines or prickles.",
    expert:"Bearing conspicuous pointed surface ornamentation, commonly expressed by exoperidial spines in some young puffballs.",
    relationships:["exoperidium"]
  },
  verrucose:{
    id:"verrucose",label:"Verrucose",level:"macro",pronunciation:"verrucose",
    beginner:"Covered with wart-like bumps.",
    expert:"Bearing blunt raised wart-like ornamentation on the surface.",
    relationships:["exoperidium"]
  },
  furfuraceous:{
    id:"furfuraceous",label:"Furfuraceous",level:"macro",pronunciation:"furfuraceous",
    beginner:"Covered with a fine bran-like or scurfy coating.",
    expert:"Bearing a fine scurfy, bran-like superficial covering that may abrade with age.",
    relationships:["exoperidium"]
  },
  glabrous:{
    id:"glabrous",label:"Glabrous",level:"macro",pronunciation:"glabrous",
    beginner:"Smooth and lacking obvious surface ornament.",
    expert:"Lacking hairs, spines, warts, scales, or other conspicuous superficial ornamentation.",
    relationships:["exoperidium"]
  },
  globose:{
    id:"globose",label:"Globose",level:"macro",pronunciation:"globose",
    beginner:"Nearly spherical.",
    expert:"Approximately spherical in overall three-dimensional form.",
    relationships:["peridium"]
  },
  pyriform:{
    id:"pyriform",label:"Pyriform",level:"macro",pronunciation:"pyriform",
    beginner:"Pear-shaped.",
    expert:"Broad above and narrowing toward the base, producing a pear-shaped fruit body.",
    relationships:["peridium","sterile_base"]
  },
  turbiniform:{
    id:"turbiniform",label:"Turbiniform",level:"macro",pronunciation:"turbiniform",
    beginner:"Spinning-top shaped.",
    expert:"Broad above and strongly tapered below, producing a top-shaped profile.",
    relationships:["peridium","sterile_base"]
  },
  gleba:{
    id:"gleba",label:"Gleba",level:"tissue",pronunciation:"gleba",
    beginner:"The internal spore-producing tissue of a puffball.",
    expert:"Internal fertile tissue of gasteroid fungi, maturing from cellular tissue into a spore mass with or without capillitium.",
    relationships:["peridium","basidiospore"]
  },
  apical_pore:{
    id:"apical_pore",label:"Apical pore",level:"macro",pronunciation:"apical pore",
    beginner:"An opening that releases mature spores.",
    expert:"Ostiole-like opening through mature peridial tissue permitting passive or pressure-driven spore discharge.",
    relationships:["peridium","endoperidium","gleba"]
  },
  fertile_head:{
    id:"fertile_head",label:"Fertile head",level:"macro",pronunciation:"fertile head",
    beginner:"The pitted spore-producing head of a morel.",
    expert:"Morchelloid apothecial head composed of ridges and pits with hymenium exposed over the fertile surface.",
    relationships:["hymenophore","hymenium","ascus"]
  },
  internal_cavity:{
    id:"internal_cavity",label:"Internal cavity",level:"internal",pronunciation:"internal cavity",
    beginner:"The hollow space inside a morel.",
    expert:"Continuous hollow lumen extending through stipe and head in typical morchelloid architecture.",
    relationships:["fertile_head","stipe"]
  },
  branch_system:{
    id:"branch_system",label:"Branch system",level:"macro",pronunciation:"branch system",
    beginner:"The branching coral-like fruiting body.",
    expert:"Repeatedly ramified clavarioid architecture whose external surfaces may be broadly fertile.",
    relationships:["hymenophore","branch_tips"]
  },
  branch_tips:{
    id:"branch_tips",label:"Branch tips",level:"macro",pronunciation:"branch tips",
    beginner:"The ends of coral-fungus branches.",
    expert:"Distal branch termini; shape, cresting, color and bruising may have diagnostic value.",
    relationships:["branch_system"]
  },
  apothecium:{
    id:"apothecium",label:"Apothecium",level:"macro",pronunciation:"apothecium",
    beginner:"An open cup-like fruiting body.",
    expert:"Open ascoma exposing the hymenium on its inner or upper surface.",
    relationships:["hymenophore","excipulum","ascus"]
  },
  excipulum:{
    id:"excipulum",label:"Excipulum",level:"tissue",pronunciation:"excipulum",
    beginner:"Supporting tissue forming the wall of a cup fungus.",
    expert:"Sterile structural tissues surrounding and supporting the hymenium of an apothecium.",
    relationships:["apothecium","hymenium"]
  },
  context:{
    id:"context",label:"Context",level:"tissue",pronunciation:"context",
    beginner:"The internal flesh of a bracket or crust fungus.",
    expert:"Sterile internal tissue between external surface and hymenophore; texture, zonation, duplex structure and hyphal system can be diagnostic.",
    relationships:["hymenophore","tube_layer"]
  },
  substrate:{
    id:"substrate",label:"Substrate",level:"ecology",pronunciation:"substrate",
    beginner:"The material the fungus is growing on.",
    expert:"Physical growth substrate such as wood, soil, litter or another organism; substrate identity and decay state are ecological evidence.",
    relationships:["basidiome"]
  },
  margin:{
    id:"margin",label:"Growing margin",level:"macro",pronunciation:"margin",
    beginner:"The actively expanding edge of a crust fungus.",
    expert:"Peripheral advancing zone of a resupinate sporocarp; color, fibrillosity, rhizomorphs and differentiation from the hymenial surface may be diagnostic.",
    relationships:["context","hymenophore"]
  },
  lobes:{
    id:"lobes",label:"Gelatinous lobes",level:"macro",pronunciation:"lobes",
    beginner:"Soft jelly-like lobes forming the fruiting body.",
    expert:"Gelatinous macroscopic lobes containing specialized hyphal matrices and exposed fertile surfaces.",
    relationships:["hymenophore","attachment"]
  },
  attachment:{
    id:"attachment",label:"Attachment base",level:"macro",pronunciation:"attachment",
    beginner:"The point where the fungus connects to its substrate.",
    expert:"Basal or lateral zone attaching the fruiting body to substrate.",
    relationships:["substrate"]
  },
  sterile_base:{
    id:"sterile_base",label:"Sterile base",level:"macro",pronunciation:"sterile base",
    beginner:"Non-spore-producing tissue at the bottom of a puffball.",
    expert:"Basal sterile tissue below the gleba, variably chambered or compact.",
    relationships:["gleba","peridium"]
  },
  base:{
    id:"base",label:"Basal trunk",level:"macro",pronunciation:"basal trunk",
    beginner:"The common base supporting coral-fungus branches.",
    expert:"Shared basal tissue from which clavarioid branches arise.",
    relationships:["branch_system","substrate"]
  }
});

export const NAVIGATION_PATHS = Object.freeze({
  agaricoid:[
    ["basidiome","pileus","hymenophore","lamella","gill_attachment","trama","subhymenium","hymenium","basidium","sterigmata","basidiospore"],
    ["basidiome","stipe","stipe_base"],
    ["basidiome","veil_structure"]
  ],
  boletoid:[
    ["basidiome","pileus","tube_layer","tube","pore_surface","hymenium","basidium","basidiospore"],
    ["basidiome","stipe","stipe_base"]
  ],
  polyporoid:[
    ["basidiome","pileus","context","tube_layer","tube","pore_surface","hymenium","basidium","basidiospore"],
    ["basidiome","substrate"]
  ],
  hoof_conk:[
    ["basidiome","pileus","context","tube_layer","tube","pore_surface","hymenium","basidium","basidiospore"],
    ["basidiome","substrate"]
  ],
  hydnoid:[
    ["basidiome","pileus","hymenophore","trama","subhymenium","hymenium","basidium","basidiospore"],
    ["basidiome","stipe"]
  ],
  hydnoid_bracket:[
    ["basidiome","pileus","context","hymenophore","subhymenium","hymenium","basidium","basidiospore"],
    ["basidiome","substrate"]
  ],
  morel:[
    ["basidiome","fertile_head","hymenophore","hymenium","ascus","ascospore"],
    ["basidiome","stipe","internal_cavity"]
  ],
  coral:[
    ["basidiome","branch_system","hymenophore","hymenium","basidium","basidiospore"],
    ["basidiome","base"]
  ],
  puffball:[
    ["basidiome","peridium","gleba","basidiospore"],
    ["basidiome","sterile_base"],["basidiome","apical_pore"]
  ],
  cup:[
    ["basidiome","apothecium","hymenophore","hymenium","ascus","ascospore"],
    ["basidiome","excipulum"]
  ],
  jelly:[
    ["basidiome","lobes","hymenophore","hymenium","basidium","basidiospore"],
    ["basidiome","attachment"]
  ],
  crust:[
    ["basidiome","margin","context","hymenophore","subhymenium","hymenium","basidium","basidiospore"],
    ["basidiome","substrate"]
  ]
});

export function getKnowledge(id){
  return KNOWLEDGE_OBJECTS[id]||{
    id,label:id.replaceAll("_"," "),level:"unknown",pronunciation:id.replaceAll("_"," "),
    beginner:"Educational definition not yet authored.",
    expert:"Expert knowledge object pending editorial review.",
    relationships:[]
  };
}

export function getPathFor(profileId,targetId){
  const paths=NAVIGATION_PATHS[profileId]||[];
  for(const path of paths){
    const i=path.indexOf(targetId);
    if(i>=0)return path.slice(0,i+1);
  }
  return ["basidiome",targetId].filter((x,i,a)=>a.indexOf(x)===i);
}

export function childKnowledge(profileId,id){
  const paths=NAVIGATION_PATHS[profileId]||[];
  const children=new Set();
  for(const p of paths){
    const i=p.indexOf(id);
    if(i>=0&&i<p.length-1)children.add(p[i+1]);
  }
  return [...children].map(getKnowledge);
}
