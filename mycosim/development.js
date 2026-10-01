import {PROFILE_BY_ID} from "./profiles.js";
import {DEVELOPMENTAL_STAGE_ORDER,getDevelopmentalStage,getDevelopmentalStages} from "./stages.js";

export const DEFAULT_DEVELOPMENTAL_STAGE = "mature";

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
  return Object.freeze({
    profileId,
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
    variants:Object.freeze({...variants})
  });
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
