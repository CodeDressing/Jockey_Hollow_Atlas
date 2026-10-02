// Phase 7 scientific validation and reference-sheet protocol.
// Teaching archetypes are morphology models, never species identifications.

export const VALIDATION_SOURCES=Object.freeze({
  usfs_gasteroid_field_form:Object.freeze({
    authority:"USDA Forest Service",
    title:"Field guide / collection form for sequestrate and gasteroid fungi",
    url:"https://www.fs.usda.gov/pnw/pubs/gtr572/gtr572.pdf",
    supports:["peridium","gleba","sterile tissue","stem or basal pad","longitudinal section"],
    evidenceType:"authoritative descriptive protocol"
  }),
  usfs_calvatia:Object.freeze({
    authority:"USDA Forest Service",
    title:"Other Fleshy Fungi — Calvatia / giant puffball",
    url:"https://www.srs.fs.usda.gov/pubs/rp/rp_so049.pdf",
    supports:["enclosed spores until maturity","white immature interior","progressive darkening","wall breakup at maturity","persistent sterile base","giant smooth body"],
    evidenceType:"authoritative field description with specimen imagery"
  }),
  geastrum_integrative:Object.freeze({
    authority:"Peer-reviewed mycological literature",
    title:"Integrative taxonomy reveals an unexpected diversity in Geastrum section Geastrum",
    url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC4510276/",
    supports:["unexpanded subglobose body","exoperidium splitting into rays","endoperidial spore sac","peristome","variable stalk","variable ray number"],
    evidenceType:"peer-reviewed descriptions and verified specimen figures"
  }),
  tulostoma_neotropical:Object.freeze({
    authority:"Peer-reviewed mycological literature",
    title:"Diversity of Neotropical stalked-puffball: Two new species of Tulostoma with reticulated spores",
    url:"https://pmc.ncbi.nlm.nih.gov/articles/PMC10718411/",
    supports:["discrete spore sac","stipe","mouth","exoperidium","endoperidium","powdery mature gleba","ornament loss with maturity"],
    evidenceType:"peer-reviewed descriptions and verified specimen figures"
  }),
  tulostoma_europe:Object.freeze({
    authority:"Peer-reviewed mycological literature",
    title:"Unexpected high species diversity among European stalked puffballs",
    url:"https://www.sciencedirect.com/org/science/article/pii/S1314405717000283",
    supports:["subglobose spore sac","granulose or membranous exoperidium","smooth endoperidium","fimbriate mouth","slender stipe","mature brown gleba"],
    evidenceType:"peer-reviewed descriptions and verified specimen figures"
  })
});

const COMMON_EXCLUSIONS=Object.freeze([
  "No species-level diagnostic claim from body shape alone.",
  "No invented universal color, scale, or ornament character when published descriptions show taxon-level variation.",
  "No gills, pores, teeth, exposed hymenium, pileus, or agaricoid stipe on a gasteroid archetype unless the selected architecture explicitly requires a sterile stalk.",
  "No ornament merely for visual complexity; ornament must be allowed by the selected archetype.",
  "No exact microscopic spore morphology unless a taxon-specific evidence layer supports it.",
  "No debris, cracking, collapse, or discoloration without a developmental or substrate rationale."
]);

export const GASTEROID_REFERENCE_PROTOCOL=Object.freeze({
  true_puffball:Object.freeze({
    label:"Generalized true puffball",
    morphologyTarget:"Enclosed glebal body with differentiated peridium, optional sterile basal region, stage-dependent surface ornament, and mature spore-release opening.",
    generalized:["Body proportions","ornament density","degree of sterile-base differentiation","exact ostiole geometry"],
    variesByTaxon:["Globose/subglobose/pyriform form","surface ornament","wall persistence","ostiole morphology"],
    deliberatelyExcluded:[...COMMON_EXCLUSIONS,"No claim that all true puffballs are echinate or release through an identical pore."],
    authoritativeEvidence:["usfs_gasteroid_field_form"],
    imageryEvidence:"No matching internally verified atlas specimen imagery found by repository search; authoritative descriptive evidence only until a verified internal reference is attached."
  }),
  pyriform_puffball:Object.freeze({
    label:"Pyriform puffball archetype",
    morphologyTarget:"Pear-shaped enclosed glebal body with a conspicuous sterile basal region and stage-dependent outer ornament.",
    generalized:["Head-to-base ratio","degree of basal narrowing","ornament density"],
    variesByTaxon:["Surface ornament","substrate association","sterile-base prominence","ostiole morphology"],
    deliberatelyExcluded:[...COMMON_EXCLUSIONS,"Pyriform shape alone must not imply a genus or species."],
    authoritativeEvidence:["usfs_gasteroid_field_form"],
    imageryEvidence:"No matching internally verified atlas specimen imagery found by repository search."
  }),
  gem_studded_type:Object.freeze({
    label:"Gem-studded / Lycoperdon-type archetype",
    morphologyTarget:"Compact true-puffball architecture with conspicuous youthful exoperidial spines or warts that abrade progressively with age.",
    generalized:["Spine number","spine dimensions","cluster distribution","amount of abrasion"],
    variesByTaxon:["Spine grouping","wart versus spine expression","scar pattern","body proportions","basal differentiation"],
    deliberatelyExcluded:[...COMMON_EXCLUSIONS,"No exact Lycoperdon species diagnosis; youthful spines are not assumed to persist unchanged into old age."],
    authoritativeEvidence:["usfs_gasteroid_field_form"],
    imageryEvidence:"No matching internally verified atlas specimen imagery found by repository search; ornamental behavior is kept explicitly generalized."
  }),
  giant_puffball_type:Object.freeze({
    label:"Giant puffball-type archetype",
    morphologyTarget:"Large broad smooth-to-finely textured puffball with extensive white immature gleba, progressive maturation, and broad wall breakdown exposing the spore mass.",
    generalized:["Absolute size","rupture location","surface color progression","degree of basal taper"],
    variesByTaxon:["Surface smoothness","base morphology","wall breakup pattern","mature gleba color"],
    deliberatelyExcluded:[...COMMON_EXCLUSIONS,"A permanent small apical ostiole is not forced onto the giant-puffball-type model."],
    authoritativeEvidence:["usfs_calvatia","usfs_gasteroid_field_form"],
    imageryEvidence:"USDA material includes immature and mature giant-puffball imagery; no internal project image is assumed."
  }),
  earthball_type:Object.freeze({
    label:"Earthball / Scleroderma-type archetype",
    morphologyTarget:"Firm relatively thick-walled earthball-like body with coarse verrucose/granular exterior, darkening internal gleba, and irregular cracking or rupture.",
    generalized:["Wall thickness","wart geometry","rupture path","gleba darkening rate"],
    variesByTaxon:["Peridial ornament","rooting/basal characters","gleba color","dehiscence pattern"],
    deliberatelyExcluded:[...COMMON_EXCLUSIONS,"No thin true-puffball wall treatment and no assumed neat persistent apical ostiole."],
    authoritativeEvidence:["usfs_gasteroid_field_form"],
    imageryEvidence:"No matching internally verified atlas specimen imagery found by repository search; model remains conservative."
  }),
  earthstar_type:Object.freeze({
    label:"Earthstar archetype",
    morphologyTarget:"Initially enclosed subglobose body whose outer peridium splits into radiating rays around a persistent endoperidial spore sac with a differentiated release region.",
    generalized:["Ray count within a teaching range","ray curvature","spore-sac stalk height","peristome detail"],
    variesByTaxon:["Ray number","hygrometric behavior","fornicate versus saccate posture","stalk development","peristome form","mesoperidial coating"],
    deliberatelyExcluded:[...COMMON_EXCLUSIONS,"No universal fixed ray count; no claim that all earthstars are hygrometric or share one peristome form."],
    authoritativeEvidence:["geastrum_integrative"],
    imageryEvidence:"Peer-reviewed Geastrum study supplies verified specimen figures for ray architecture and endoperidial sacs."
  }),
  stalked_puffball_type:Object.freeze({
    label:"Stalked puffball / Tulostoma-type archetype",
    morphologyTarget:"Discrete subglobose spore sac elevated on a sterile stalk, with differentiated exoperidium/endoperidium, apical mouth, and powdery mature gleba.",
    generalized:["Stalk length","socket detail","mouth geometry","surface-scale density"],
    variesByTaxon:["Stipe ornament","mouth form","exoperidium persistence","spore-sac size","gleba color","socket morphology"],
    deliberatelyExcluded:[...COMMON_EXCLUSIONS,"An ordinary puffball subgleba must not substitute for the differentiated Tulostoma-like stalk."],
    authoritativeEvidence:["tulostoma_neotropical","tulostoma_europe"],
    imageryEvidence:"Peer-reviewed Tulostoma studies supply verified specimen imagery and descriptions of spore sac, stalk, mouth, exoperidium, and mature gleba."
  })
});

const STAGE_RULES=Object.freeze({
  young:Object.freeze({
    target:"Immature, structurally intact state.",
    expected:["High tissue hydration","High peridial integrity","Low gleba maturity","No advanced spore depletion"],
    excluded:["Advanced collapse","Severe spore depletion","Old-stage rupture morphology"]
  }),
  mature:Object.freeze({
    target:"Fully expressed reference morphology with reproductive maturation.",
    expected:["Archetype identity readable","Gleba substantially mature","Appropriate dehiscence beginning or established","Partial exoperidial wear allowed"],
    excluded:["Reversion to unrelated young geometry","Senescent collapse as the default condition"]
  }),
  old:Object.freeze({
    target:"Senescent, drying, spore-releasing or depleted state preserving archetype identity.",
    expected:["Increased water loss","Greater wall weathering or rupture","Reduced youthful ornament where appropriate","Spore release/depletion","Possible collapse"],
    excluded:["Pristine youthful exoperidium","Fresh white immature gleba","Features contradicting the archetype's dispersal architecture"]
  })
});

export const GASTEROID_REFERENCE_SHEETS=Object.freeze(Object.fromEntries(
  Object.entries(GASTEROID_REFERENCE_PROTOCOL).flatMap(([subtype,base])=>
    Object.entries(STAGE_RULES).map(([stage,stageRule])=>[
      subtype+"::"+stage,
      Object.freeze({
        id:subtype+"::"+stage,
        subtype,stage,label:base.label+" — "+stage,
        morphologyTarget:base.morphologyTarget,
        stageTarget:stageRule.target,
        expected:Object.freeze([...stageRule.expected]),
        generalized:Object.freeze([...base.generalized]),
        variesByTaxon:Object.freeze([...base.variesByTaxon]),
        deliberatelyExcluded:Object.freeze([...base.deliberatelyExcluded,...stageRule.excluded]),
        authoritativeEvidence:Object.freeze([...base.authoritativeEvidence]),
        imageryEvidence:base.imageryEvidence,
        validationRule:"Every rendered feature must map to an expected developmental feature, an allowed subtype character, or an explicitly documented generalized approximation."
      })
    ])
  )
));

export function referenceSheet(subtype,stage){
  return GASTEROID_REFERENCE_SHEETS[subtype+"::"+stage]||null;
}

export function validateReferenceSheets(){
  const failures=[];
  const subtypes=Object.keys(GASTEROID_REFERENCE_PROTOCOL);
  for(const subtype of subtypes){
    for(const stage of Object.keys(STAGE_RULES)){
      const sheet=referenceSheet(subtype,stage);
      if(!sheet)failures.push(subtype+"::"+stage+" missing");
      else{
        for(const f of ["morphologyTarget","stageTarget","imageryEvidence","validationRule"]){
          if(!sheet[f])failures.push(sheet.id+"."+f);
        }
        if(!sheet.authoritativeEvidence.length)failures.push(sheet.id+".authoritativeEvidence");
        for(const sourceId of sheet.authoritativeEvidence){
          if(!VALIDATION_SOURCES[sourceId])failures.push(sheet.id+" unknown source "+sourceId);
        }
      }
    }
  }
  if(failures.length)throw new Error("Reference-sheet validation failed: "+failures.join("; "));
  return Object.freeze({pass:true,stateCount:Object.keys(GASTEROID_REFERENCE_SHEETS).length,subtypeCount:subtypes.length});
}

export const REFERENCE_SHEET_AUDIT=validateReferenceSheets();

export function validateRenderedGasteroidState({subtype,stage,variants={},objects=[]}={}){
  const sheet=referenceSheet(subtype,stage);
  if(!sheet)return {pass:false,failures:["No reference sheet for "+subtype+"::"+stage],warnings:[]};
  const failures=[],warnings=[];
  const objectSet=new Set(objects);
  if(subtype==="earthstar_type"&&!objectSet.has("earthstar_rays"))failures.push("Earthstar archetype missing earthstar rays.");
  if(subtype!=="earthstar_type"&&objectSet.has("earthstar_rays"))warnings.push("Earthstar-ray object must remain hidden outside the earthstar archetype.");
  if(subtype==="stalked_puffball_type"&&!objectSet.has("gasteroid_stalk"))failures.push("Stalked-puffball archetype missing differentiated gasteroid stalk.");
  if(subtype==="giant_puffball_type"&&variants.rupture_pattern==="apical_ostiole")warnings.push("Giant-puffball teaching state should favor broad or irregular wall breakdown rather than a fixed small ostiole.");
  if(subtype==="earthball_type"&&variants.puff_surface==="echinate")failures.push("Earthball archetype does not allow echinate surface in the current teaching library.");
  return {pass:failures.length===0,failures,warnings,sheet};
}
