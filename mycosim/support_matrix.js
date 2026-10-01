import {MORPHOLOGY_PROFILES} from "./profiles.js";
import {DEVELOPMENTAL_STAGE_ORDER} from "./stages.js";
import {CANONICAL_REFERENCE_STAGE} from "./development.js";

export const DEVELOPMENTAL_SUPPORT_MATRIX = Object.freeze(
  MORPHOLOGY_PROFILES.map(profile=>Object.freeze({
    profileId:profile.id,
    family:profile.label,
    canonicalStage:CANONICAL_REFERENCE_STAGE,
    stages:Object.freeze(DEVELOPMENTAL_STAGE_ORDER.map(stageId=>Object.freeze({
      stageId,
      role:stageId===CANONICAL_REFERENCE_STAGE?"canonical_reference":"derived_transformation",
      supported:true
    })))
  }))
);

export function emptyQaMatrix(){
  return DEVELOPMENTAL_SUPPORT_MATRIX.map(row=>({
    profileId:row.profileId,
    family:row.family,
    canonicalStage:row.canonicalStage,
    stages:Object.fromEntries(row.stages.map(s=>[s.stageId,{
      supported:s.supported,
      role:s.role,
      qaStatus:"not_run"
    }]))
  }));
}

export function matrixFromRegression(report){
  const matrix=emptyQaMatrix();
  const byKey=new Map((report?.rows||[]).map(r=>[`${r.profileId}::${r.stageId}`,r]));
  for(const row of matrix){
    for(const stageId of DEVELOPMENTAL_STAGE_ORDER){
      const result=byKey.get(`${row.profileId}::${stageId}`);
      if(!result) continue;
      row.stages[stageId].qaStatus=result.pass?"pass":"fail";
      row.stages[stageId].checks={
        render:result.render,
        framing:result.framing,
        hover:result.hover,
        focus:result.focus,
        isolateHide:result.isolateHide,
        exploded:result.exploded,
        section:result.section,
        transparency:result.transparency,
        anatomyNavigation:result.anatomyNavigation,
        modePreserved:result.modePreserved,
        fpsAcceptable:result.fpsAcceptable
      };
    }
  }
  return matrix;
}
