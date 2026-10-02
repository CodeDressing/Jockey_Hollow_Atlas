import {PROFILE_BY_ID} from "./profiles.js";
import {DEVELOPMENTAL_STAGE_ORDER,getDevelopmentalStage,getDevelopmentalStages} from "./stages.js";

export const DEFAULT_DEVELOPMENTAL_STAGE = "mature";
export const CANONICAL_REFERENCE_STAGE = "mature";

function hashIdentityString(value){
  let h=2166136261>>>0;
  for(const ch of String(value)){
    h^=ch.charCodeAt(0);
    h=Math.imul(h,16777619)>>>0;
  }
  return h>>>0;
}

export function morphologyIdentity(profileId,variants={}){
  if(profileId!=="puffball"){
    const key=[profileId,variants.pileus||"",variants.stipe||"",variants.hymenophore||"",variants.veil||""].join("|");
    return Object.freeze({key,seed:hashIdentityString(key),profileId});
  }
  const subtype=variants.puff_subtype||null;
  const phenotype=Object.freeze({
    subtype,
    shape:variants.puff_shape||"globose",
    surface:variants.puff_surface||"echinate",
    base:variants.puff_base||"short"
  });
  const key=["puffball",subtype||"generalized",phenotype.shape,phenotype.surface,phenotype.base].join("|");
  return Object.freeze({key,seed:hashIdentityString(key),profileId,phenotype});
}

export function resolveDevelopmentalStage(profileId,stageId=DEFAULT_DEVELOPMENTAL_STAGE){
  const profile=PROFILE_BY_ID[profileId];
  if(!profile) throw new Error("Unknown morphology profile: "+profileId);

  const stages=getDevelopmentalStages(profileId);
  if(!stages) throw new Error("No developmental-stage library for profile: "+profileId);

  const selected=getDevelopmentalStage(profileId,stageId);
  if(!selected) throw new Error("Unknown developmental stage "+stageId+" for "+profileId);

  return {
    profileId,
    stageId:selected.id,
    stageLabel:selected.label,
    maturityIndex:selected.maturity_index,
    parameters:Object.freeze({...selected.parameters}),
    notes:selected.notes,
    diagnosticCautions:Object.freeze([...(selected.diagnostic_cautions||[])]),
    anatomy:profile.anatomy,
    factory:profile.factory,
    profile
  };
}

export function composeMorphologyState(profileId,{
  stageId=DEFAULT_DEVELOPMENTAL_STAGE,
  variants={}
}={}){
  const stage=resolveDevelopmentalStage(profileId,stageId);
  const identity=morphologyIdentity(profileId,variants);
  return Object.freeze({
    profileId,
    identity,
    profile:stage.profile,
    factory:stage.factory,
    anatomy:stage.anatomy,
    stage:Object.freeze({
      id:stage.stageId,
      label:stage.stageLabel,
      maturityIndex:stage.maturityIndex,
      parameters:stage.parameters,
      notes:stage.notes,
      diagnosticCautions:stage.diagnosticCautions
    }),
    variants:Object.freeze({...variants}),
    developmental:Object.freeze({
      continuityModel:"single-organism transformation",
      identityKey:identity.key,
      identitySeed:identity.seed,
      phenotype:identity.phenotype||null,
      parameters:stage.parameters
    })
  });
}

export function assertPuffballDevelopmentalContinuity(){
  const stages=getDevelopmentalStages("puffball");
  const y=stages?.young?.parameters||{};
  const m=stages?.mature?.parameters||{};
  const o=stages?.old?.parameters||{};
  const rising=["gleba_maturity","water_loss","collapse","wall_rupture","discoloration","spore_depletion","ostiole_formation"];
  const falling=["peridial_thickness","exoperidial_retention","peridial_integrity"];
  const failures=[];
  for(const k of rising){
    if(!(y[k]<=m[k]&&m[k]<=o[k]))failures.push(k+" must increase young→mature→old");
  }
  for(const k of falling){
    if(!(y[k]>=m[k]&&m[k]>=o[k]))failures.push(k+" must decrease young→mature→old");
  }
  if(failures.length)throw new Error("Puffball developmental continuity invalid: "+failures.join("; "));
  return Object.freeze({pass:true,rising:Object.freeze(rising),falling:Object.freeze(falling)});
}

export function developmentalStageOptions(profileId){
  const stages=getDevelopmentalStages(profileId);
  if(!stages) return [];
  return DEVELOPMENTAL_STAGE_ORDER.map(id=>({
    id,
    label:stages[id].label,
    maturityIndex:stages[id].maturity_index,
    notes:stages[id].notes
  }));
}


export function assertCanonicalDevelopmentalContract(profileId){
  const profile=PROFILE_BY_ID[profileId];
  const stages=getDevelopmentalStages(profileId);
  if(!profile) throw new Error("Unknown morphology profile: "+profileId);
  if(!stages?.[CANONICAL_REFERENCE_STAGE]) throw new Error("Missing canonical Mature stage for "+profileId);
  const mature=stages[CANONICAL_REFERENCE_STAGE];
  const young=stages.young;
  const old=stages.old;
  if(!young||!old) throw new Error("Young/Mature/Old contract incomplete for "+profileId);
  if(!(young.maturity_index<mature.maturity_index && mature.maturity_index<old.maturity_index)){
    throw new Error("Developmental maturity order invalid for "+profileId);
  }
  return Object.freeze({
    profileId,
    canonicalStage:CANONICAL_REFERENCE_STAGE,
    anatomyReference:profile.anatomy,
    transformationStages:Object.freeze(["young","old"])
  });
}

for(const profileId of Object.keys(PROFILE_BY_ID)){
  assertCanonicalDevelopmentalContract(profileId);
}
assertPuffballDevelopmentalContinuity();
