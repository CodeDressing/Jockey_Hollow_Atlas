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
  gasteroid_archetype:{
    id:"gasteroid_archetype",label:"Gasteroid teaching archetype",level:"architecture",pronunciation:"gas-TER-oyd teaching archetype",
    beginner:"A generalized body-plan model used to teach a recognizable gasteroid form without claiming a species identification.",
    expert:"A constrained morphology model derived from taxon-associated body-plan characters while deliberately stopping short of species identification. Each archetype limits allowable shape, ornamentation, basal structure, developmental trajectory, and internal architecture.",
    whyItMatters:"Taxon-informed archetypes improve realism while preserving the distinction between morphological teaching and specimen identification.",
    relationships:["gasteroid","puffball","peridium","gleba"]
  },
  puffball:{
    id:"puffball",label:"Puffball",level:"organism",pronunciation:"PUHF-bawl",
    beginner:"A gasteroid fungus in which spores mature internally and are released later, usually through an opening or by rupture of the outer wall.",
    expert:"A gasteroid fungus in which spores mature internally and are released later, usually through an opening or by rupture of the outer wall.",
    whyItMatters:"Recognizing an enclosed spore-bearing body plan separates puffball-type development from exposed gills, pores, teeth, or other hymenophores.",
    relationships:["gasteroid","peridium","gleba","apical_pore"]
  },
  gasteroid:{
    id:"gasteroid",label:"Gasteroid",level:"architecture",pronunciation:"gas-TER-oyd",
    beginner:"Describing fungi that produce spores internally rather than on an exposed hymenial surface like gills or pores.",
    expert:"Describing fungi that produce spores internally rather than on an exposed hymenial surface like gills or pores.",
    whyItMatters:"Gasteroid architecture describes where spores mature and how the fruit body releases them; it is a body-plan concept, not a single taxonomic group.",
    relationships:["puffball","peridium","gleba"]
  },
  peridium:{
    id:"peridium",label:"Peridium",level:"macro",pronunciation:"puh-RID-ee-um",
    beginner:"The outer wall surrounding the spore-bearing interior of a puffball or related gasteroid fungus.",
    expert:"The outer wall surrounding the spore-bearing interior of a puffball or related gasteroid fungus.",
    whyItMatters:"Peridial thickness, integrity, layering, cracking, and persistence are useful developmental and identification characters.",
    relationships:["exoperidium","endoperidium","gleba","apical_pore","rupture_margin","collapsed_wall"]
  },
  exoperidium:{
    id:"exoperidium",label:"Exoperidium",level:"macro",pronunciation:"ek-soh-puh-RID-ee-um",
    beginner:"The outermost layer of the peridium. It may be smooth, spiny, warted, granular, or scurfy.",
    expert:"The outermost layer of the peridium. It may be smooth, spiny, warted, granular, or scurfy.",
    whyItMatters:"Surface ornamentation such as spines, warts, granules, or scurfy material commonly occurs here and can help distinguish taxa and developmental stage.",
    relationships:["peridium","endoperidium"]
  },
  endoperidium:{
    id:"endoperidium",label:"Endoperidium",level:"internal",pronunciation:"en-doh-puh-RID-ee-um",
    beginner:"The inner layer of the peridium, often remaining after the outer layer wears away.",
    expert:"The inner layer of the peridium, often remaining after the outer layer wears away.",
    whyItMatters:"The persistent inner wall often becomes more evident after the exoperidium abrades and helps define the mature spore sac.",
    relationships:["peridium","exoperidium","gleba","apical_pore","rupture_margin","rupture_channel"]
  },
  rupture_margin:{
    id:"rupture_margin",label:"Rupture margin",level:"macro",pronunciation:"RUP-chur MAR-jin",
    beginner:"The edge of a break or opening in the puffball wall.",
    expert:"The exposed peridial edge surrounding an ostiole, tear, fissure, or larger dehiscent opening; it may be clean, ragged, curled, frayed, thinned, or weathered.",
    whyItMatters:"Margin form helps document how the fruit body opened and whether the peridial tissue is intact, drying, weathered, or mechanically damaged.",
    relationships:["peridium","endoperidium","apical_pore","dehiscent"]
  },
  worn_exoperidium:{
    id:"worn_exoperidium",label:"Worn exoperidium",level:"macro",pronunciation:"worn ek-soh-puh-RID-ee-um",
    beginner:"Outer puffball wall that has been partly rubbed or weathered away.",
    expert:"Abraded exoperidial tissue in which superficial ornament or outer wall material has been reduced, exposing more persistent underlying peridial tissue.",
    whyItMatters:"Loss of the exoperidium can change apparent texture with age and must not be mistaken for a naturally glabrous young surface.",
    relationships:["exoperidium","endoperidium","surface_ornamentation"]
  },
  collapsed_wall:{
    id:"collapsed_wall",label:"Collapsed peridial wall",level:"macro",pronunciation:"collapsed puh-RID-ee-ul wall",
    beginner:"A puffball wall that has caved inward or lost its original shape.",
    expert:"Senescent or weathered peridial tissue deformed by desiccation, loss of internal support, spore release, and/or external mechanical forces.",
    whyItMatters:"Collapse is a developmental and taphonomic character that can strongly distort original body shape in older fruit bodies.",
    relationships:["peridium","endoperidium","spore_mass"]
  },
  rupture_channel:{
    id:"rupture_channel",label:"Rupture / ostiolar channel",level:"internal",pronunciation:"RUP-chur / OSS-tee-oh-lar channel",
    beginner:"The passage through the puffball wall that connects the inside to the outside.",
    expert:"A dehiscent passage traversing the peridial layers and linking the glebal cavity or spore mass to an external opening.",
    whyItMatters:"The channel demonstrates that spore release requires a real path through layered peridial tissue rather than a decorative surface mark.",
    relationships:["apical_pore","peridium","endoperidium","gleba","spore_mass"]
  },
  earthstar_rays:{
    id:"earthstar_rays",label:"Earthstar rays",level:"macro",pronunciation:"EARTH-star rays",
    beginner:"Star-like outer wall segments that spread around the central spore sac.",
    expert:"Radiating segments derived from the outer peridial layers in earthstar-type gasteroid development; they separate and reflex outward around a persistent inner spore sac.",
    whyItMatters:"Earthstar rays distinguish a specialized gasteroid architecture from ordinary puffballs and help explain how outer-wall development changes the mature body plan.",
    relationships:["peridium","exoperidium","endoperidium","apical_pore"]
  },
  gasteroid_stalk:{
    id:"gasteroid_stalk",label:"Gasteroid stalk",level:"macro",pronunciation:"gas-TER-oyd stalk",
    beginner:"A sterile stalk that raises a puffball-like spore sac above the substrate.",
    expert:"A differentiated sterile stipe-like support bearing a discrete gasteroid spore sac, characteristic of stalked-puffball teaching forms such as Tulostoma-like archetypes.",
    whyItMatters:"A true stalked gasteroid body plan differs fundamentally from an ordinary sterile subgleba and should remain distinct in morphology-based teaching.",
    relationships:["puffball","sterile_base","peridium","apical_pore"]
  },
  surface_ornamentation:{
    id:"surface_ornamentation",label:"Surface ornamentation",level:"macro",pronunciation:"surface ornamentation",
    beginner:"The visible texture or projections on the outer surface of the fruit body.",
    expert:"External exoperidial expression including smooth, granular, verrucose, echinate, or furfuraceous states; persistence and abrasion vary with taxon and age.",
    whyItMatters:"Young puffballs often express their strongest surface characters here, and those characters may later wear away.",
    relationships:["exoperidium","echinate","verrucose","granular","furfuraceous","glabrous"]
  },
  apical_region:{
    id:"apical_region",label:"Apical region",level:"macro",pronunciation:"AY-pih-kul region",
    beginner:"The uppermost region of the puffball.",
    expert:"Distal apical region of the gasteroid fruit body where an ostiole or other dehiscence may develop.",
    whyItMatters:"Its condition helps document whether a spore-release opening is absent, developing, open, or weathered.",
    relationships:["apical","apical_pore","dehiscent"]
  },
  basal_attachment:{
    id:"basal_attachment",label:"Basal attachment",level:"macro",pronunciation:"BAY-sul attachment",
    beginner:"The point where the puffball connects to the substrate.",
    expert:"Basal zone connecting the fruit body or subgleba to soil, litter, wood, or other substrate.",
    whyItMatters:"Attachment form and substrate association are useful ecological and macromorphological observations.",
    relationships:["sterile_base","subgleba","substrate"]
  },
  spore_mass:{
    id:"spore_mass",label:"Spore mass",level:"internal",pronunciation:"spore mass",
    beginner:"The mature powdery mass of spores inside an old or mature puffball.",
    expert:"Dry mature glebal spore mass produced after fertile tissues disintegrate or reorganize during gasteroid maturation.",
    whyItMatters:"A developed powdery spore mass distinguishes mature or senescent internal condition from firm immature gleba.",
    relationships:["gleba","basidiospore","apical_pore"]
  },
  immature_gleba:{
    id:"immature_gleba",label:"Immature gleba",level:"internal",pronunciation:"immature GLEE-buh",
    beginner:"Young gleba that is still white and firm.",
    expert:"Immature internal glebal tissue prior to full spore maturation; typically firm and pale in the generalized puffball model.",
    whyItMatters:"White firm gleba is a key maturity character and should not be interpreted as a mature powdery spore mass.",
    relationships:["gleba","spore_mass"]
  },
  mature_gleba:{
    id:"mature_gleba",label:"Mature gleba",level:"internal",pronunciation:"mature GLEE-buh",
    beginner:"Darkening gleba in which spores are mature or approaching maturity.",
    expert:"Mature glebal tissue transitioning to olive-brown or brown, increasingly dry and powdery as the spore mass develops.",
    whyItMatters:"Color and texture document developmental state and readiness for spore release.",
    relationships:["gleba","spore_mass","apical_pore"]
  },
  echinate:{
    id:"echinate",label:"Echinate",level:"macro",pronunciation:"EK-in-ate",
    beginner:"Bearing sharp spines or prickles.",
    expert:"Bearing pointed exoperidial spines or prickles whose height, basal width, clustering, breakage, persistence, and abrasion may vary across the fruit body and through development.",
    whyItMatters:"Spine form, density, persistence, and abrasion can be diagnostically informative, especially in young fruit bodies.",
    relationships:["exoperidium"]
  },
  verrucose:{
    id:"verrucose",label:"Verrucose",level:"macro",pronunciation:"veh-ROO-kose",
    beginner:"Covered with wart-like projections.",
    expert:"Bearing blunt, broad-based, wart-like exoperidial elevations that may vary in size, merge locally, flatten, round, or become abraded with age.",
    whyItMatters:"Wart shape and persistence are useful surface characters and should not be confused with true spines.",
    relationships:["exoperidium"]
  },
  granular:{
    id:"granular",label:"Granular",level:"macro",pronunciation:"GRAN-yuh-ler",
    beginner:"Covered with small grain-like particles or a rough granular texture.",
    expert:"Bearing numerous fine, low-relief grain-like exoperidial elements that are substantially smaller and denser than verrucose warts and may diminish with abrasion.",
    whyItMatters:"Fine granular ornamentation represents a distinct surface state from warts, spines, or a smooth exoperidium.",
    relationships:["exoperidium"]
  },
  furfuraceous:{
    id:"furfuraceous",label:"Furfuraceous",level:"macro",pronunciation:"fer-fer-AY-shus",
    beginner:"Scaly or bran-like, with a fine scurfy coating.",
    expert:"Bearing a fine scurfy or bran-like exoperidial covering composed of delicate irregular flakes or scales that may lift, fragment, and be lost with age.",
    whyItMatters:"A scurfy coating may wear away with age, so developmental stage matters when recording this character.",
    relationships:["exoperidium"]
  },
  glabrous:{
    id:"glabrous",label:"Glabrous",level:"macro",pronunciation:"GLAY-brus",
    beginner:"Smooth; lacking hairs, spines, or ornamentation.",
    expert:"Macroscopically smooth and lacking conspicuous spines, warts, grains, or flakes; fine micro-relief and natural surface irregularity may still be present.",
    whyItMatters:"A genuinely smooth surface is an informative state and should not be assumed simply because ornament has weathered away.",
    relationships:["exoperidium"]
  },
  subglobose:{
    id:"subglobose",label:"Subglobose",level:"macro",pronunciation:"sub-GLOH-bohs",
    beginner:"Almost spherical, but not perfectly round.",
    expert:"Almost spherical, but not perfectly round.",
    whyItMatters:"Slight departures from a sphere can be taxonomically useful and should be recorded rather than normalized to globose.",
    relationships:["peridium"]
  },
  globose:{
    id:"globose",label:"Globose",level:"macro",pronunciation:"GLOH-bohs",
    beginner:"Nearly spherical in shape.",
    expert:"Nearly spherical in shape.",
    whyItMatters:"Overall body shape is a macromorphological character that helps distinguish puffball forms.",
    relationships:["peridium"]
  },
  pyriform:{
    id:"pyriform",label:"Pyriform",level:"macro",pronunciation:"PEER-ih-form",
    beginner:"Pear-shaped; broader above and narrower below.",
    expert:"Pear-shaped; broader above and narrower below.",
    whyItMatters:"A pear-shaped body often reflects a differentiated basal region and is an important field character.",
    relationships:["peridium","sterile_base"]
  },
  turbiniform:{
    id:"turbiniform",label:"Turbiniform",level:"macro",pronunciation:"turbiniform",
    beginner:"Spinning-top shaped.",
    expert:"Broad above and strongly tapered below, producing a top-shaped profile.",
    whyItMatters:"A top-shaped body is a distinct macromorphological state and should not be collapsed into generic globose form.",
    relationships:["peridium","sterile_base"]
  },
  gleba:{
    id:"gleba",label:"Gleba",level:"tissue",pronunciation:"GLEE-buh",
    beginner:"The internal spore-bearing tissue of gasteroid fungi. It is usually white when immature and darkens as spores mature.",
    expert:"The internal spore-bearing tissue of gasteroid fungi. It is usually white when immature and darkens as spores mature.",
    whyItMatters:"Gleba color and consistency change strongly with maturity, so white firm tissue versus olive-brown powdery tissue is important developmental evidence.",
    relationships:["peridium","basidiospore"]
  },
  apical:{
    id:"apical",label:"Apical",level:"macro",pronunciation:"AY-pih-kul",
    beginner:"Located at the top or apex.",
    expert:"Located at the top or apex.",
    whyItMatters:"The apical region is where an ostiole often develops, so its condition should be examined during maturation.",
    relationships:["apical_pore","peridium"]
  },
  dehiscent:{
    id:"dehiscent",label:"Dehiscent",level:"development",pronunciation:"dih-HISS-ent",
    beginner:"Opening at maturity to release contents, such as spores.",
    expert:"Opening at maturity to release contents, such as spores.",
    whyItMatters:"How the peridium opens at maturity affects spore release and is an important developmental character.",
    relationships:["apical_pore","peridium"]
  },
  apical_pore:{
    id:"apical_pore",label:"Ostiole",level:"macro",pronunciation:"OSS-tee-ohl",
    beginner:"A small opening, often at the top of the mature puffball, through which spores are released.",
    expert:"A small opening, often at the top of the mature puffball, through which spores are released.",
    whyItMatters:"Ostiole development indicates maturation and the mechanism by which dry spores are released.",
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
  subgleba:{
    id:"subgleba",label:"Subgleba / sterile base",level:"macro",pronunciation:"sub-GLEE-buh / STAIR-ile base",
    beginner:"A non-spore-bearing basal region present in some puffballs, often supporting the fertile gleba above.",
    expert:"A non-spore-bearing basal region present in some puffballs, often supporting the fertile gleba above.",
    whyItMatters:"Presence, size, and form of a sterile base can distinguish different puffball body plans.",
    relationships:["gleba","peridium"]
  },
  sterile_base:{
    id:"sterile_base",label:"Subgleba / sterile base",level:"macro",pronunciation:"sub-GLEE-buh / STAIR-ile base",
    beginner:"A non-spore-bearing basal region present in some puffballs, often supporting the fertile gleba above.",
    expert:"A non-spore-bearing basal region present in some puffballs, often supporting the fertile gleba above.",
    whyItMatters:"Presence, size, and form of a sterile base can distinguish different puffball body plans.",
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
    ["basidiome","puffball","gasteroid","peridium","exoperidium","surface_ornamentation"],
    ["basidiome","puffball","gasteroid","peridium","endoperidium","gleba","immature_gleba"],
    ["basidiome","puffball","gasteroid","peridium","endoperidium","gleba","mature_gleba","spore_mass","basidiospore"],
    ["basidiome","puffball","subgleba","basal_attachment"],["basidiome","puffball","apical_region","apical_pore","rupture_channel"],
    ["basidiome","puffball","peridium","rupture_margin"],["basidiome","puffball","peridium","collapsed_wall"],["basidiome","puffball","peridium","exoperidium","worn_exoperidium"],
    ["basidiome","puffball","exoperidium","echinate"],
    ["basidiome","puffball","exoperidium","verrucose"],
    ["basidiome","puffball","exoperidium","granular"],
    ["basidiome","puffball","exoperidium","furfuraceous"],
    ["basidiome","puffball","exoperidium","glabrous"],
    ["basidiome","puffball","globose"],["basidiome","puffball","subglobose"],["basidiome","puffball","pyriform"],
    ["basidiome","puffball","apical"],["basidiome","puffball","dehiscent"]
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

const DEVELOPMENTAL_SIGNIFICANCE=Object.freeze({
  basidiome:"The whole fruit body changes in size, tissue condition, exposure of fertile structures, pigmentation, and senescence; developmental stage must be recorded before comparing morphology.",
  pileus:"Pileus shape and margin position commonly change during expansion and senescence, so cap form should be interpreted in developmental context.",
  pileus_margin:"The margin may begin enrolled or protected, expand outward, then split, erode, or distort with age.",
  hymenophore:"Fertile surfaces may be incompletely exposed when young and become fully exposed, worn, discolored, or distorted with maturity and senescence.",
  lamella:"Gill spacing and attachment are best assessed on mature intact basidiomata; young or collapsing tissues can obscure the mature relationship.",
  stipe:"Stipe proportions may change through elongation, expansion, water loss, and collapse; mature dimensions should not be inferred from a young state.",
  stipe_base:"Basal form may become more exposed or distorted as surrounding tissue expands, dries, or is damaged.",
  veil_structure:"Veil tissues are developmentally transient and can rupture, remain as remnants, or disappear, making age central to interpretation.",
  gasteroid_archetype:"The archetype preserves body-plan identity while wall thickness, ornament retention, glebal state, dehiscence, and collapse transform through development.",
  puffball:"A puffball changes continuously from firm enclosed immature gleba to mature spore-bearing tissue and then to a dry, ruptured or collapsed spore-dispersal structure.",
  peridium:"The enclosing wall is generally firmer and more intact when young, becomes developmentally modified at maturity, and may thin, crack, rupture, abrade, or collapse in old age.",
  exoperidium:"Outer-wall ornamentation is often strongest when young and may abrade, flatten, fragment, or disappear progressively with maturity.",
  endoperidium:"The inner peridial wall becomes increasingly important as outer layers abrade and is often the persistent wall surrounding mature gleba.",
  surface_ornamentation:"Surface ornament is stage-dependent: young fruit bodies usually preserve it best, while mature and old fruit bodies can show breakage, flattening, abrasion, and patch loss.",
  echinate:"Echinate spines are typically best preserved when young; with maturity they may shorten, break, abrade in patches, and become sparse or absent in old generalized models.",
  verrucose:"Verrucose warts can begin raised and distinct, then round, flatten, merge visually, and become abraded as the exoperidium ages.",
  granular:"Fine granular ornament is usually most conspicuous when fresh and young, then thins and smooths as grains abrade away.",
  furfuraceous:"Scurfy flakes may be adherent when fresh, become lifted or curled during drying, and be lost progressively with age.",
  glabrous:"A genuinely glabrous surface lacks conspicuous macro-ornament throughout development; weathering may change texture without implying that ornament was originally present.",
  gleba:"Gleba progresses from pale firm immature tissue to darker spore-bearing tissue and finally to a dry, powdery, partly depleted spore mass.",
  immature_gleba:"Immature gleba is an early developmental state and should not be interpreted as a mature spore mass.",
  mature_gleba:"Mature gleba represents advanced spore development and increasing dryness before or during active spore release.",
  spore_mass:"Spore mass develops as glebal tissue matures, then becomes progressively depleted as spores are released.",
  apical_region:"The apical region may remain closed when young, differentiate an ostiole or rupture zone at maturity, and become enlarged or ragged with age.",
  apical_pore:"An ostiole is absent or nonfunctional early, develops with maturity, and may widen, tear, or become irregular during prolonged spore release and weathering.",
  rupture_channel:"The release pathway develops only after wall differentiation and dehiscence; its size and continuity reflect maturity and rupture state.",
  rupture_margin:"A fresh opening may have relatively coherent margins that become torn, curled, frayed, or weathered during senescence.",
  worn_exoperidium:"Abraded exoperidium is a developmental/weathering product and therefore records loss of youthful surface characters rather than a primary smooth state.",
  collapsed_wall:"Collapse reflects water loss, loss of internal support, spore depletion, and weathering, and is principally a mature-to-old developmental feature.",
  sterile_base:"The sterile basal region may remain structurally distinct while the fertile gleba matures; drying can shrink or distort it in old specimens.",
  subgleba:"Subglebal tissue is established as a sterile basal compartment and becomes relatively more conspicuous as the fertile gleba differentiates and dries.",
  basal_attachment:"The attachment remains the substrate connection throughout development, though surrounding tissue can dry, contract, or become obscured by debris.",
  earthstar_rays:"Earthstar-type outer peridial tissue remains closed early, then splits and reflexes into rays during maturation while the inner spore sac persists.",
  gasteroid_stalk:"In stalked-gasteroid forms, the sterile stalk elongates or becomes fully expressed while the spore sac matures, then may dry and weather without losing architectural identity.",
  fertile_head:"The fertile head expands and exposes or differentiates its reproductive surface as the fruit body matures, then can dry and deform with age.",
  internal_cavity:"The cavity becomes fully expressed with expansion and may enlarge visually as surrounding tissues dry or collapse.",
  branch_system:"Branches elongate and spread during growth, then may lose tips, bend, or collapse during senescence.",
  branch_tips:"Young tips are active growth zones; mature tips are fully expressed and old tips may become worn, discolored, or broken.",
  apothecium:"Cup-shaped ascomata typically open and expose the hymenium as they mature, then flatten, split, or distort with age.",
  excipulum:"Supporting cup tissue expands with the apothecium and can thin, dry, or distort as the fruit body ages.",
  context:"Context thickness and firmness change through expansion, hydration change, and senescence and should be interpreted with stage and substrate condition.",
  margin:"Growing margins are most active and distinct earlier in development and become less defined, eroded, or cracked with age.",
  lobes:"Gelatinous lobes enlarge and remain full when hydrated, then wrinkle and collapse as hydration and tissue integrity decline.",
  attachment:"Attachment persists throughout development but surrounding tissue can change substantially in size, hydration, and orientation."
});

const atlasFallback=(k)=>{
  if(k.level==="micro") return "Microscopic expression can vary with maturity and tissue condition; interpret it together with specimen age, preparation quality, and the parent structure.";
  if(k.level==="internal"||k.level==="tissue") return "Internal tissue appearance changes with maturation, hydration, pigmentation, and senescence; developmental state should be recorded with the observation.";
  if(k.level==="macro") return "Macromorphology can change with expansion, maturation, drying, and senescence; compare this character only among developmentally comparable specimens.";
  return "Interpret this structure in the context of the fruit body's developmental stage and the condition of related tissues.";
};

for(const k of Object.values(KNOWLEDGE_OBJECTS)){
  if(!k.whyItMatters){
    k.whyItMatters="This structure contributes to anatomical description and can support later morphological interpretation when documented with provenance.";
  }
  if(!k.developmentalSignificance){
    k.developmentalSignificance=DEVELOPMENTAL_SIGNIFICANCE[k.id]||atlasFallback(k);
  }
  if(!k.observation){
    k.observation="Observation: a visible or selected structure is present at this location in the model. Record what is directly seen before assigning a taxonomic interpretation.";
  }
  if(!k.identificationBoundary){
    k.identificationBoundary="Identification boundary: this anatomical label or morphology term describes an observed structure; by itself it does not establish a species identification.";
  }
  if(!Array.isArray(k.relationships))k.relationships=[];
}

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
