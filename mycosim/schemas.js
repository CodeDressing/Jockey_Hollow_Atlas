export const MYCOSIM_SCHEMA_VERSION = "1.1.0";

export const AnatomyObjectSchema = Object.freeze({
  required: ["id","label","category","selectable"],
  optional: ["description","parentId","children","tags","defaultVisible","materialRole","focusPadding"]
});

export const MorphologyProfileSchema = Object.freeze({
  required: ["id","label","group","factory","anatomy"],
  optional: ["description","keywords","supportedModes","defaultCamera","version","developmentalStages"]
});

export const DevelopmentalStageProfileSchema = Object.freeze({
  required: ["id","label","maturity_index","parameters","notes"],
  optional: ["diagnostic_cautions","visual_intent","version"]
});

export function validateAnatomyObject(obj){
  const errors=[];
  for(const key of AnatomyObjectSchema.required){
    if(obj?.[key]===undefined || obj?.[key]===null || obj?.[key]==="") errors.push("missing "+key);
  }
  if(obj?.id && !/^[a-z0-9_]+$/.test(obj.id)) errors.push("id must be stable snake_case");
  return {valid:errors.length===0,errors};
}

export function validateMorphologyProfile(profile){
  const errors=[];
  for(const key of MorphologyProfileSchema.required){
    if(profile?.[key]===undefined || profile?.[key]===null) errors.push("missing "+key);
  }
  const seen=new Set();
  for(const obj of profile?.anatomy||[]){
    const v=validateAnatomyObject(obj);
    if(!v.valid) errors.push(obj?.id+": "+v.errors.join(", "));
    if(seen.has(obj.id)) errors.push("duplicate anatomy id "+obj.id);
    seen.add(obj.id);
  }
  return {valid:errors.length===0,errors};
}

export function validateDevelopmentalStageProfile(stage){
  const errors=[];
  for(const key of DevelopmentalStageProfileSchema.required){
    if(stage?.[key]===undefined || stage?.[key]===null) errors.push("missing "+key);
  }
  if(stage?.id && !["young","mature","old"].includes(stage.id)) errors.push("stage id must be young, mature, or old");
  if(stage?.maturity_index!==undefined && (stage.maturity_index<0 || stage.maturity_index>1)) errors.push("maturity_index must be 0..1");
  if(stage?.parameters && typeof stage.parameters!=="object") errors.push("parameters must be an object");
  return {valid:errors.length===0,errors};
}

export const VISUALIZATION_MODES = Object.freeze([
  "macro",
  "internal",
  "micro",
  "spore"
]);
