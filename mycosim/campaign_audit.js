import {PUFFBALL_SUBTYPE_LIBRARY} from "./variants.js";
import {ATLAS_PROBE_KNOWLEDGE_AUDIT} from "./knowledge.js";
import {FINAL_SCIENTIFIC_AUDIT,REFERENCE_SHEET_AUDIT,VISUAL_CHARACTER_AUDIT} from "./validation_protocol.js";
import {PROFILE_REALISM_BUDGETS} from "./realism_pipeline.js";

export const REALISM_CAMPAIGN_ORDER=Object.freeze([
  "step_5","step_6","step_3","step_2","step_7","step_8","step_9","step_10"
]);

export const REALISM_CAMPAIGN_STEPS=Object.freeze({
  step_1:Object.freeze({label:"Continuous puffball geometry system",required:true}),
  step_2:Object.freeze({label:"Developmental morphology engine",required:true}),
  step_3:Object.freeze({label:"Biologically plausible exoperidium",required:true}),
  step_4:Object.freeze({label:"Peridial layers and rupture mechanics",required:true}),
  step_5:Object.freeze({label:"Volumetric gleba and spore mass",required:true}),
  step_6:Object.freeze({label:"PBR tissue materials",required:true}),
  step_7:Object.freeze({label:"Taxon-informed subtype library",required:true}),
  step_8:Object.freeze({label:"Atlas-standard anatomical probes",required:true}),
  step_9:Object.freeze({label:"Scientific validation and reference protocol",required:true}),
  step_10:Object.freeze({label:"Production realism/performance pipeline",required:true})
});

const requiredDevelopmentalParameters=[
  "peridial_thickness","exoperidial_retention","ostiole_formation","gleba_maturity",
  "water_loss","collapse","wall_rupture","discoloration","spore_depletion"
];

export function auditCampaignSnapshot(snapshot={}){
  const objectIds=new Set(snapshot.objectIds||[]);
  const params=snapshot.developmentalParameters||{};
  const pbr=new Set(snapshot.puffPbrMaterials||[]);
  const stepChecks={
    step_1:
      snapshot.puffGeometryModel?.model==="continuous-biological-puffball-v2" &&
      ["young","mature","old"].includes(snapshot.puffGeometryModel?.stageId),
    step_2:
      requiredDevelopmentalParameters.every(k=>Number.isFinite(params[k])) &&
      !!snapshot.developmentalIdentity,
    step_3:
      !!snapshot.puffOrnament?.generator &&
      Number.isFinite(snapshot.puffOrnament?.target) &&
      snapshot.puffOrnament?.sampling!=null,
    step_4:
      ["peridium","endoperidium","senescent_shell","rupture_margin","rupture_channel"].every(id=>objectIds.has(id)),
    step_5:
      snapshot.glebaRenderingModel?.volume?.model==="porous-gleba-volume-v2" &&
      snapshot.glebaRenderingModel?.microstructure==="porous-fibrous-volumetric-v2" &&
      snapshot.glebaRenderingModel?.sporeMass==="instanced-powder-volume-v2",
    step_6:
      ["youngPeridium","wornExoperidium","endoperidium","immatureGleba","maturingGleba","matureGleba","driedSporeMass","soil","organicDebris"].every(k=>pbr.has(k)),
    step_7:
      Object.keys(PUFFBALL_SUBTYPE_LIBRARY).length>=7 &&
      !!snapshot.gasteroidSubtype &&
      !!snapshot.gasteroidSubtypeDefinition,
    step_8:
      ATLAS_PROBE_KNOWLEDGE_AUDIT.pass===true &&
      Array.isArray(snapshot.probeKnowledgeIds) &&
      snapshot.probeKnowledgeIds.length>0,
    step_9:
      FINAL_SCIENTIFIC_AUDIT.pass===true &&
      REFERENCE_SHEET_AUDIT.pass===true &&
      VISUAL_CHARACTER_AUDIT.pass===true &&
      snapshot.scientificValidation?.pass===true,
    step_10:
      !!PROFILE_REALISM_BUDGETS.puffball &&
      !!snapshot.realismTier &&
      !!snapshot.realismPerformance?.checks &&
      Number.isFinite(snapshot.complexity?.triangles)
  };
  const failures=Object.entries(stepChecks).filter(([,pass])=>!pass).map(([id])=>id);
  return Object.freeze({
    pass:failures.length===0,
    failures:Object.freeze(failures),
    checks:Object.freeze(stepChecks),
    completed:Object.freeze(Object.entries(stepChecks).filter(([,v])=>v).map(([k])=>k)),
    requiredOrder:REALISM_CAMPAIGN_ORDER
  });
}

export function aggregateCampaignStates(rows=[]){
  const failures=rows.filter(r=>!r.audit?.pass);
  const byStage=Object.fromEntries(["young","mature","old"].map(stage=>[
    stage,
    rows.filter(r=>r.stageId===stage).every(r=>r.audit?.pass===true)
  ]));
  const bySubtype=Object.fromEntries(Object.keys(PUFFBALL_SUBTYPE_LIBRARY).map(subtype=>[
    subtype,
    rows.filter(r=>r.subtypeId===subtype).length===3 &&
    rows.filter(r=>r.subtypeId===subtype).every(r=>r.audit?.pass===true)
  ]));
  return Object.freeze({
    pass:rows.length===Object.keys(PUFFBALL_SUBTYPE_LIBRARY).length*3 && failures.length===0 &&
      Object.values(byStage).every(Boolean) && Object.values(bySubtype).every(Boolean),
    stateCount:rows.length,
    expectedStateCount:Object.keys(PUFFBALL_SUBTYPE_LIBRARY).length*3,
    failures:Object.freeze(failures.map(r=>({subtypeId:r.subtypeId,stageId:r.stageId,failures:r.audit.failures}))),
    byStage:Object.freeze(byStage),
    bySubtype:Object.freeze(bySubtype),
    scientificAudit:FINAL_SCIENTIFIC_AUDIT,
    probeAudit:ATLAS_PROBE_KNOWLEDGE_AUDIT
  });
}
