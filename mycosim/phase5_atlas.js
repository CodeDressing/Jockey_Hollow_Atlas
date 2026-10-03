// Rutgers Extension 7 - Phase 5: terminology, teaching archetypes, validation/performance.
// Teaching archetypes constrain generalized morphology. They are not taxonomic identifications.

const T=(id,term,pronunciation,definition,whyItMatters,developmentalSignificance,relatedStructures=[])=>Object.freeze({
  id,term,pronunciation,definition,whyItMatters,developmentalSignificance,
  relatedStructures:Object.freeze(relatedStructures),
  identificationBoundary:"Descriptive morphology only; this character does not establish species identity."
});

export const ATLAS_TERMS=Object.freeze({
  pileus:T("pileus","Pileus","PY-lee-us","The cap or expanded upper portion of many mushroom fruiting bodies.","Pileus form, surface, color, and margin characters are major macromorphological observations.","The pileus commonly expands, flattens, deforms, dries, or weathers as the basidiome matures.",["disc","pileus_margin","hymenophore"]),
  disc:T("disc","Disc","disk","The central region of the pileus.","The disc may differ from the margin in elevation, color, ornament, moisture, or persistence of surface features.","Central ornament or an umbo may remain conspicuous after the margin expands or weathers.",["pileus","umbo","pileus_margin"]),
  pileus_margin:T("pileus_margin","Pileus margin","PY-lee-us MAR-jin","The peripheral edge of the pileus.","Margin posture and surface characters help describe cap development and hymenophore exposure.","Margins may begin inrolled or incurved, then straighten, uplift, split, or become eroded with age.",["pileus","disc","lamella"]),
  lamella:T("lamella","Lamella / gill","luh-MEL-uh","A plate-like fertile structure radiating beneath an agaricoid pileus.","Gill attachment, spacing, depth, edge condition, and color are high-value observational characters.","Gill exposure and spacing change as the cap expands; color or edge condition may change with maturation or injury.",["lamellula","hymenophore","stipe"]),
  lamellula:T("lamellula","Lamellula / short gill","luh-MEL-yuh-luh","A gill that begins at the pileus margin but does not extend fully to the stipe.","Presence, abundance, and tiering help characterize lamellar architecture.","Lamellulae become more exposed as the pileus expands but remain developmentally shorter than full lamellae.",["lamella","hymenophore"]),
  hymenophore:T("hymenophore","Hymenophore","hy-MEE-no-for","The structure that bears the hymenium, such as gills, pores, teeth, folds, or a smooth fertile surface.","Hymenophore architecture is a fundamental macromorphological distinction among fungal body plans.","Exposure, expansion, discoloration, and physical wear may change through development while the underlying architecture remains the same.",["lamella","pileus","stipe"]),
  stipe:T("stipe","Stipe","stipe","The stem-like supporting structure beneath or beside the fertile portion.","Position, shape, context, surface, and basal morphology are important descriptive characters.","The stipe may elongate, hollow, wrinkle, discolor, collapse, or lose delicate surface ornament with age.",["stipe_apex","stipe_base","pileus"]),
  stipe_apex:T("stipe_apex","Stipe apex","stipe AY-peks","The upper stipe region directly below the hymenophore.","The apex can carry ornament distinct from the mid-stipe or base.","Pruina and fine fibrils may abrade or stretch as the stipe elongates.",["stipe","hymenophore","stipe_base"]),
  stipe_base:T("stipe_base","Stipe base","stipe bays","The basal region of the stipe at or near substrate attachment.","Bulbs, rooting extensions, volvas, and regional surface characters may be concentrated here.","Basal structures may become obscured by substrate, handling, decay, or collapse.",["stipe","volva","stipe_apex"]),
  annulus:T("annulus","Annulus","AN-yuh-lus","A ring-like partial-veil remnant on the stipe.","Its presence, position, persistence, and texture can be diagnostically useful.","An annulus may be membranous when young and later collapse, fragment, or disappear.",["stipe","pileus","hymenophore"]),
  volva:T("volva","Volva","VOL-vuh","A cup, sheath, or patches at the stipe base derived from universal-veil tissue.","Volval form and persistence are important in some agaricoid groups.","Universal-veil tissue can rupture during expansion and leave a basal cup, zones, patches, or other remnants.",["stipe_base","pileus"]),
  umbo:T("umbo","Umbo","UM-boh","A raised central boss on the pileus.","Central elevation is a standard pileus-profile character.","An umbo may become relatively more or less conspicuous as the surrounding cap expands.",["disc","pileus"]),
  umbilicate:T("umbilicate","Umbilicate","um-BIL-ih-kate","Having a small, navel-like central depression.","It distinguishes a localized central depression from a broadly depressed or funnel-shaped cap.","The depression may become more apparent as the pileus expands.",["disc","infundibuliform","pileus"]),
  infundibuliform:T("infundibuliform","Infundibuliform","in-fun-DIB-yuh-li-form","Funnel-shaped, with a broadly depressed center and elevated surrounding profile.","It describes an important mature pileus architecture without implying a species.","Funnel form often becomes more expressed as the pileus expands.",["pileus","umbilicate","decurrent"]),
  adnate:T("adnate","Adnate","AD-nate","Gill attachment broadly meeting the stipe.","Attachment geometry is a key descriptive character.","The apparent junction can change slightly as tissues expand, but broad attachment remains the defining observation.",["lamella","stipe","adnexed"]),
  adnexed:T("adnexed","Adnexed","ad-NEKST","Gill attachment narrowly meeting the stipe.","It separates narrow attachment from broadly adnate or free conditions.","Cap expansion can alter the apparent angle of attachment but not justify reclassifying an unclear junction without observation.",["lamella","stipe","adnate"]),
  decurrent:T("decurrent","Decurrent","dee-KUR-ent","Gill tissue extending downward along the stipe.","Degree of descent is an important lamellar character.","Descent becomes easier to observe as the hymenophore is fully exposed.",["lamella","stipe","subdecurrent"]),
  emarginate:T("emarginate","Emarginate","ee-MAR-jih-nate","Gill attachment with a distinct notch near the stipe.","The notch helps distinguish attachment geometries that otherwise look broadly attached.","The notch should be recorded from the actual junction rather than inferred from cap shape.",["lamella","stipe","adnate"]),
  crowded:T("crowded","Crowded","KROW-did","Gills positioned very close together with narrow intervening spaces.","Gill density is a useful comparative character when judged at a consistent cap region.","Spacing may appear denser after expansion changes cap diameter, so developmental stage should be recorded.",["lamella","close"]),
  close:T("close","Close","klohs","Gills separated by small but readily visible spaces; less dense than crowded.","It standardizes qualitative spacing language across records.","Spacing should be interpreted in the context of cap expansion and lamellulae.",["lamella","crowded"]),
  fibrillose:T("fibrillose","Fibrillose","FY-bril-ohs","Bearing fine fibrous threads or streaks.","Fiber direction, density, and regional distribution can be taxonomically informative.","Fibrils may stretch, flatten, abrade, or weather away during expansion and aging.",["pileus","stipe"]),
  squamulose:T("squamulose","Squamulose","SKWAY-myuh-lohs","Covered with small scales or squamules.","Scale size, attachment, contrast, and distribution are useful surface characters.","Squamules may separate during expansion and become worn or lost with age.",["pileus","fibrillose"]),
  verrucose:T("verrucose","Verrucose","ver-ROO-kohs","Covered with wart-like elevations.","Wart morphology distinguishes a raised surface state from scales or fibers.","Warts may flatten, fragment, or abrade as the surface ages.",["pileus","squamulose"]),
  glabrous:T("glabrous","Glabrous","GLAY-brus","Smooth and lacking hairs, scales, or other conspicuous ornament.","It records absence of macroscopic ornament rather than absence of microscopic surface structure.","A surface may become more nearly glabrous if delicate ornament is lost with weathering.",["pileus","fibrillose"]),
  viscid:T("viscid","Viscid","VIS-id","Noticeably sticky or slimy when moist.","Moisture response is an important surface character and should be separated from structural ornament.","A viscid surface may become dry-looking as water is lost, so moisture condition must accompany the observation.",["pileus","waxy"]),
  waxy:T("waxy","Waxy","WAK-see","Having a wax-like texture, sheen, or consistency.","Waxy appearance can reflect tissue and surface properties distinct from simple wetness.","Perceived waxiness may change with hydration and age but should not be substituted for measured texture.",["pileus","viscid"])
});

const A=(id,label,summary,allowed,defaults,tendencies,excluded=[])=>Object.freeze({
  id,label,summary,
  teachingOnly:true,
  allowed:Object.freeze(allowed),
  defaults:Object.freeze(defaults),
  tendencies:Object.freeze(tendencies),
  excluded:Object.freeze(excluded),
  boundary:"Archetype is a teaching model for compatible character combinations, not a genus or species identification."
});

export const AGARICOID_ARCHETYPES=Object.freeze({
  generic_agaric:A("generic_agaric","Generic agaric","Neutral agaricoid teaching baseline.",
    {caps:["convex","plano_convex","flat"],gills:["adnexed","adnate","free_gills"],stipes:["equal","tapering","clavate"]},
    {agaric_pileus_profile:"convex",agaric_pileus_center:"even",agaric_margin:"straight",agaric_gill_attachment:"adnate",agaric_gill_spacing:"close",agaric_stipe_position:"central",agaric_stipe_form:"equal",agaric_surface_primary:"smooth",agaric_surface_moisture:"dry",veil:"none"},
    ["central stipe common in the teaching baseline","attachment remains observable rather than taxonomically inferred"]),
  waxcap_type:A("waxcap_type","Waxcap-type","Waxy, often relatively thick-gilled agaricoid teaching form.",
    {caps:["convex","plano_convex","umbilicate"],gills:["adnexed","adnate","subdecurrent","decurrent"],stipes:["equal","tapering"]},
    {agaric_pileus_profile:"convex",agaric_gill_attachment:"adnate",agaric_gill_spacing:"distant",agaric_gill_thickness:"broad",agaric_stipe_form:"equal",agaric_surface_primary:"waxy",agaric_surface_moisture:"waxy",veil:"none"},
    ["waxy surface/tissue expression","gills may be relatively broad and spaced"],["Not a Hygrocybe identification."]),
  tricholomoid_type:A("tricholomoid_type","Tricholomoid-type","Robust centrally stipitate agaricoid form with commonly notched attachment.",
    {caps:["convex","plano_convex","flat"],gills:["sinuate","emarginate","adnexed"],stipes:["equal","clavate","bulbous_base"]},
    {agaric_pileus_profile:"plano_convex",agaric_gill_attachment:"sinuate",agaric_gill_spacing:"close",agaric_stipe_form:"clavate",agaric_stipe_position:"central",agaric_surface_primary:"dry",veil:"none"},
    ["robust stipe tendency","sinuate/emarginate teaching geometry"],["Not a Tricholoma identification."]),
  clitocyboid_type:A("clitocyboid_type","Clitocyboid / funnel-type","Funnel-form teaching archetype with descending gills.",
    {caps:["depressed","infundibuliform"],gills:["subdecurrent","decurrent"],stipes:["equal","tapering"]},
    {agaric_pileus_profile:"infundibuliform",agaric_pileus_center:"depressed",agaric_margin:"decurved",agaric_gill_attachment:"decurrent",agaric_gill_spacing:"close",agaric_stipe_form:"tapering",agaric_stipe_position:"central",veil:"none"},
    ["funnel expansion","gill descent onto stipe"],["Not a Clitocybe identification."]),
  mycenoid_type:A("mycenoid_type","Mycenoid-type","Slender small agaricoid form with conical to campanulate cap tendencies.",
    {caps:["conical","campanulate"],gills:["adnexed","adnate"],stipes:["equal","tapering"]},
    {agaric_pileus_profile:"campanulate",agaric_margin:"striate",agaric_gill_attachment:"adnexed",agaric_gill_spacing:"close",agaric_stipe_form:"equal",agaric_stipe_position:"central",agaric_surface_primary:"glabrous",veil:"none"},
    ["slender stipe tendency","thin cap with striate-margin teaching state"],["Not a Mycena identification."]),
  omphalinoid_type:A("omphalinoid_type","Omphalinoid-type","Small depressed to umbilicate agaricoid form with descending lamellae.",
    {caps:["umbilicate","depressed","infundibuliform"],gills:["subdecurrent","decurrent"],stipes:["equal","tapering"]},
    {agaric_pileus_profile:"umbilicate",agaric_pileus_center:"depressed",agaric_gill_attachment:"decurrent",agaric_gill_spacing:"distant",agaric_stipe_form:"equal",veil:"none"},
    ["central depression","decurrent gill tendency"],["Not an Omphalina identification."]),
  amanitoid_type:A("amanitoid_type","Amanitoid-type","Veiled agaricoid teaching architecture with free gills and basal universal-veil structures.",
    {caps:["ovate","convex","plano_convex"],gills:["free_gills"],stipes:["equal","clavate","bulbous_base"]},
    {agaric_pileus_profile:"convex",agaric_gill_attachment:"free_gills",agaric_gill_spacing:"close",agaric_stipe_form:"bulbous_base",agaric_stipe_position:"central",agaric_surface_primary:"smooth",veil:"volva"},
    ["free-gill geometry","basal universal-veil teaching structure"],["Not an Amanita identification.","Annulus presence is not forced because amanitoid forms vary."]),
  lepiotoid_type:A("lepiotoid_type","Lepiotoid-type","Scaly-cap agaricoid teaching form with free gills and a central stipe.",
    {caps:["convex","plano_convex","umbonate"],gills:["free_gills"],stipes:["equal","clavate","bulbous_base"]},
    {agaric_pileus_profile:"umbonate",agaric_gill_attachment:"free_gills",agaric_gill_spacing:"close",agaric_stipe_form:"equal",agaric_surface_primary:"squamulose",agaric_surface_distribution:"disc_emphasized",veil:"annulus"},
    ["free gills","disc-emphasized squamules/scales","annular veil teaching state"],["Not a Lepiota identification."]),
  marasmioid_type:A("marasmioid_type","Marasmioid-type","Slender, often tough-stiped small agaricoid teaching form.",
    {caps:["convex","flat","umbilicate"],gills:["adnexed","adnate","free_gills"],stipes:["equal","tapering","rooting"]},
    {agaric_pileus_profile:"convex",agaric_gill_attachment:"adnexed",agaric_gill_spacing:"distant",agaric_stipe_form:"equal",agaric_stipe_surface_mid:"fibrillose",agaric_surface_primary:"dry",veil:"none"},
    ["slender stipe","often more distant lamellae in the teaching model"],["Not a Marasmius identification."]),
  pleurotoid_type:A("pleurotoid_type","Pleurotoid agaricoid form","Laterally attached or strongly eccentric agaricoid teaching form.",
    {caps:["convex","plano_convex","depressed"],gills:["adnate","subdecurrent","decurrent"],stipes:["equal","tapering"]},
    {agaric_pileus_profile:"plano_convex",agaric_gill_attachment:"decurrent",agaric_gill_spacing:"close",agaric_stipe_position:"eccentric",agaric_stipe_form:"tapering",agaric_surface_primary:"glabrous",veil:"none"},
    ["eccentric attachment tendency","decurrent gill geometry"],["Not a Pleurotus identification.","Sessile forms are outside the current agaricoid stipe engine."])
});

export function atlasTerm(id){
  const alias={margin:"pileus_margin",lamellae:"lamella",lamellulae:"lamellula",apex:"stipe_apex",base:"stipe_base",umbo:"umbo"};
  return ATLAS_TERMS[id]||ATLAS_TERMS[alias[id]]||null;
}

export function archetypeList(){return Object.values(AGARICOID_ARCHETYPES);}

export function validateArchetypes(variantDefinitions={}){
  const failures=[];
  for(const a of archetypeList()){
    for(const [group,value] of Object.entries(a.defaults)){
      const def=variantDefinitions[group];
      if(!def){failures.push(a.id+": unknown variant group "+group);continue;}
      const allowed=new Set(def.options.map(x=>x[0]));
      if(!allowed.has(value))failures.push(a.id+": invalid "+group+"="+value);
    }
    if(!a.allowed.caps?.length||!a.allowed.gills?.length||!a.allowed.stipes?.length)failures.push(a.id+": incomplete allowed-character constraints");
  }
  return Object.freeze({pass:failures.length===0,archetypeCount:archetypeList().length,failures:Object.freeze(failures)});
}

export function archetypeReferenceSheet(id){
  const a=AGARICOID_ARCHETYPES[id];
  if(!a)return null;
  return Object.freeze({
    id:a.id,
    generalized:Object.freeze(["Cap proportions within allowed forms","Exact gill count and spacing within the selected qualitative class","Stipe proportions","Surface-expression intensity"]),
    varies:Object.freeze(["Color","absolute dimensions","microscopic characters","ecology","veil persistence","developmental timing",...a.tendencies]),
    excluded:Object.freeze(["Species-level identification","Genus-level identification","Unobserved microscopic characters","Invented measurements",...a.excluded]),
    rationale:"Every default is present because it demonstrates a documented agaricoid morphological relationship while preserving observation/identification separation."
  });
}

export const PERFORMANCE_MODES=Object.freeze({
  atlas:Object.freeze({id:"atlas",label:"Atlas standard",purpose:"Default educational fidelity with adaptive LOD and instancing where safe.",target:"Fast startup and stable interaction on ordinary hardware."}),
  high:Object.freeze({id:"high",label:"High detail",purpose:"Higher geometry and surface detail for close teaching inspection.",target:"Preserve interaction; adaptive downgrade remains permitted if performance falls below the engine budget."})
});

export function phase5Validation({variantDefinitions={}}={}){
  const terms=Object.values(ATLAS_TERMS);
  const termFailures=terms.flatMap(t=>["term","pronunciation","definition","whyItMatters","developmentalSignificance","relatedStructures"].filter(k=>!t[k]).map(k=>t.id+": missing "+k));
  const archetypes=validateArchetypes(variantDefinitions);
  return Object.freeze({
    pass:termFailures.length===0&&archetypes.pass,
    terminology:{count:terms.length,failures:Object.freeze(termFailures)},
    archetypes,
    performance:{modes:Object.keys(PERFORMANCE_MODES),lodRequired:true,instancingSafeOnly:true,startupInstrumentation:true},
    scientificBoundary:"Observation != interpretation != identification != hypothesis."
  });
}
