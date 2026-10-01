export const MYCOSIM_SCHEMA_VERSION = "1.0.0";

export const AnatomyObjectSchema = Object.freeze({
  required: ["id","label","category","selectable"],
  optional: ["description","parentId","children","tags","defaultVisible","materialRole","focusPadding"]
});

export const MorphologyProfileSchema = Object.freeze({
  required: ["id","label","group","factory","anatomy"],
  optional: ["description","keywords","supportedModes","defaultCamera","version"]
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

export const VISUALIZATION_MODES = Object.freeze([
  "macro",
  "internal",
  "micro",
  "spore"
]);
