import {validateDevelopmentalStageProfile} from "./schemas.js";

export const DEVELOPMENTAL_STAGE_ORDER = Object.freeze(["young","mature","old"]);

const stage=(id,label,maturity_index,parameters,notes,diagnostic_cautions=[])=>({
  id,label,maturity_index,parameters,notes,diagnostic_cautions,version:"1.0.0"
});

const common={
  young:{
    scale:0.78,
    expansion:0.55,
    tissue_firmness:0.95,
    surface_wear:0.05,
    senescence_factor:0.00
  },
  mature:{
    scale:1.00,
    expansion:1.00,
    tissue_firmness:0.78,
    surface_wear:0.15,
    senescence_factor:0.08
  },
  old:{
    scale:1.04,
    expansion:1.08,
    tissue_firmness:0.42,
    surface_wear:0.62,
    senescence_factor:0.72
  }
};

export const DEVELOPMENTAL_STAGE_LIBRARY = Object.freeze({
  agaricoid:{
    young:stage("young","Young",0.25,{
      ...common.young,
      pileus_expansion:0.48,margin_inroll:0.85,stipe_elongation:0.72,
      hymenophore_exposure:0.38,veil_persistence:0.88,lamella_exposure:0.35
    },"Compact fruit body with incompletely expanded pileus, relatively protected lamellae, and veil structures often still evident.",
    ["Young margins and veil remnants can obscure mature attachment characters."]),
    mature:stage("mature","Mature",0.60,{
      ...common.mature,
      pileus_expansion:1.00,margin_inroll:0.18,stipe_elongation:1.00,
      hymenophore_exposure:1.00,veil_persistence:0.55,lamella_exposure:1.00
    },"Canonical reference stage with expanded pileus and fully readable hymenophore and stipe characters."),
    old:stage("old","Old",0.92,{
      ...common.old,
      pileus_expansion:1.12,margin_inroll:0.00,stipe_elongation:0.98,
      hymenophore_exposure:1.00,veil_persistence:0.20,lamella_exposure:1.00,
      margin_irregularity:0.72,cap_flattening:0.68
    },"Senescent fruit body with flattened or distorted pileus, irregular margins, increased wear, and degraded veil features.",
    ["Advanced age can distort color, texture, margin form, and veil characters."])
  },

  boletoid:{
    young:stage("young","Young",0.25,{
      ...common.young,pileus_expansion:0.58,tube_depth:0.45,pore_openness:0.35,
      stipe_robustness:0.92,cap_convexity:0.95,surface_cracking:0.02
    },"Compact bolete with strongly convex pileus, shallow tube layer, and relatively closed pore surface."),
    mature:stage("mature","Mature",0.60,{
      ...common.mature,pileus_expansion:1.00,tube_depth:1.00,pore_openness:1.00,
      stipe_robustness:1.00,cap_convexity:0.62,surface_cracking:0.08
    },"Reference bolete stage with developed tubes and pores and fully readable pileus and stipe morphology."),
    old:stage("old","Old",0.92,{
      ...common.old,pileus_expansion:1.10,tube_depth:1.05,pore_openness:1.12,
      stipe_robustness:0.85,cap_convexity:0.28,surface_cracking:0.55,
      pore_irregularity:0.62
    },"Aged bolete with flatter pileus, more open or irregular pores, softer tissues, and increased surface weathering.",
    ["Pore color and bruising may intensify or degrade with age."])
  },

  polyporoid:{
    young:stage("young","Young",0.25,{
      ...common.young,shelf_expansion:0.58,margin_thickness:0.42,tube_depth:0.40,
      zonation_visibility:0.35,context_thickness:0.56,margin_activity:1.00
    },"Thin actively expanding bracket with a conspicuous growing margin and shallow tube layer."),
    mature:stage("mature","Mature",0.60,{
      ...common.mature,shelf_expansion:1.00,margin_thickness:1.00,tube_depth:1.00,
      zonation_visibility:1.00,context_thickness:1.00,margin_activity:0.60
    },"Fully developed bracket with established context, tube layer, pore surface, and zonation."),
    old:stage("old","Old",0.92,{
      ...common.old,shelf_expansion:1.08,margin_thickness:1.12,tube_depth:1.05,
      zonation_visibility:0.72,context_thickness:1.05,margin_activity:0.18,
      edge_erosion:0.72,surface_weathering:0.82
    },"Weathered bracket with reduced active margin, worn pore surface, and increasing edge erosion.")
  },

  hoof_conk:{
    young:stage("young","Young",0.25,{
      ...common.young,hoof_depth:0.52,context_thickness:0.55,tube_stratification:0.30,
      crust_weathering:0.10
    },"Early conk with limited vertical depth and developing context and tube tissue."),
    mature:stage("mature","Mature",0.60,{
      ...common.mature,hoof_depth:1.00,context_thickness:1.00,tube_stratification:1.00,
      crust_weathering:0.28
    },"Reference perennial conk with established hoof form and layered tube tissue."),
    old:stage("old","Old",0.92,{
      ...common.old,hoof_depth:1.18,context_thickness:1.12,tube_stratification:1.28,
      crust_weathering:0.90,surface_cracking:0.72
    },"Aged perennial conk with heavier weathering, cracking, and more pronounced layered tube history.")
  },

  hydnoid:{
    young:stage("young","Young",0.25,{
      ...common.young,pileus_expansion:0.58,tooth_length:0.42,tooth_density:0.78,
      stipe_elongation:0.72
    },"Compact stipitate hydnoid with short developing teeth."),
    mature:stage("mature","Mature",0.60,{
      ...common.mature,pileus_expansion:1.00,tooth_length:1.00,tooth_density:1.00,
      stipe_elongation:1.00
    },"Reference stage with fully developed pendent teeth and readable cap-and-stipe form."),
    old:stage("old","Old",0.92,{
      ...common.old,pileus_expansion:1.08,tooth_length:1.05,tooth_density:0.82,
      stipe_elongation:0.98,tooth_wear:0.72,margin_irregularity:0.62
    },"Aged hydnoid with worn or broken teeth and irregular margin.")
  },

  hydnoid_bracket:{
    young:stage("young","Young",0.25,{
      ...common.young,shelf_expansion:0.56,tooth_length:0.38,tooth_density:0.76,
      context_thickness:0.52
    },"Small developing hydnoid bracket with short teeth."),
    mature:stage("mature","Mature",0.60,{
      ...common.mature,shelf_expansion:1.00,tooth_length:1.00,tooth_density:1.00,
      context_thickness:1.00
    },"Fully developed toothed bracket."),
    old:stage("old","Old",0.92,{
      ...common.old,shelf_expansion:1.08,tooth_length:1.02,tooth_density:0.76,
      context_thickness:1.02,tooth_wear:0.80,edge_erosion:0.68
    },"Weathered bracket with degraded tooth layer and worn margins.")
  },

  morel:{
    young:stage("young","Young",0.25,{
      ...common.young,head_elongation:0.72,pit_depth:0.52,ridge_prominence:0.72,
      stipe_elongation:0.66,drying:0.02
    },"Young morchelloid form with less expanded head and shallower pits."),
    mature:stage("mature","Mature",0.60,{
      ...common.mature,head_elongation:1.00,pit_depth:1.00,ridge_prominence:1.00,
      stipe_elongation:1.00,drying:0.10
    },"Reference morchelloid stage with fully expressed ridge-and-pit architecture."),
    old:stage("old","Old",0.92,{
      ...common.old,head_elongation:1.02,pit_depth:1.05,ridge_prominence:0.82,
      stipe_elongation:1.00,drying:0.82,collapse:0.55
    },"Aged morel with drying, ridge wear, and partial collapse.",
    ["Desiccation can exaggerate pit depth and alter color."])
  },

  coral:{
    young:stage("young","Young",0.25,{
      ...common.young,branch_height:0.58,branch_spread:0.45,branch_density:0.72,
      tip_rounding:0.92
    },"Compact coral fungus with short densely grouped branches and rounded tips."),
    mature:stage("mature","Mature",0.60,{
      ...common.mature,branch_height:1.00,branch_spread:1.00,branch_density:1.00,
      tip_rounding:0.58
    },"Reference stage with fully expanded branch hierarchy."),
    old:stage("old","Old",0.92,{
      ...common.old,branch_height:1.02,branch_spread:1.08,branch_density:0.82,
      tip_rounding:0.25,tip_wear:0.74,branch_collapse:0.48
    },"Senescent coral form with worn tips and partial branch collapse.")
  },

  puffball:{
    young:stage("young","Young",0.25,{
      ...common.young,peridium_tautness:1.00,gleba_maturity:0.08,apical_pore_opening:0.00,
      collapse:0.00,ornament_retention:1.00,peridial_integrity:1.00
    },"Firm enclosed puffball with white immature gleba, intact peridium, no functional ostiole, and taxon-dependent exoperidial ornamentation that may be smooth, granular, warted, spiny/echinate, or scurfy/furfuraceous.",
    ["Young puffballs are not universally spiny; ornament type is taxon-dependent and should be recorded separately."]),
    mature:stage("mature","Mature",0.60,{
      ...common.mature,peridium_tautness:0.82,gleba_maturity:0.72,apical_pore_opening:0.38,
      collapse:0.08,ornament_retention:0.68,peridial_integrity:0.82
    },"Reference stage with yellowing to olive-buff maturing gleba, developing ostiole, and partial abrasion or loss of exoperidial ornamentation."),
    old:stage("old","Old",0.92,{
      ...common.old,peridium_tautness:0.35,gleba_maturity:1.00,apical_pore_opening:1.00,
      collapse:0.72,spore_release:0.90,ornament_retention:0.24,peridial_integrity:0.38
    },"Senescent puffball with open or enlarged ostiole, dark dry gleba, substantial spore release, worn exoperidium, and progressive collapse.")
  },

  cup:{
    young:stage("young","Young",0.25,{
      ...common.young,cup_openness:0.42,cup_depth:1.10,rim_thickness:0.82,
      rim_irregularity:0.05
    },"Deep relatively closed young apothecium with thick even rim."),
    mature:stage("mature","Mature",0.60,{
      ...common.mature,cup_openness:1.00,cup_depth:1.00,rim_thickness:1.00,
      rim_irregularity:0.15
    },"Reference open apothecium with exposed hymenial surface."),
    old:stage("old","Old",0.92,{
      ...common.old,cup_openness:1.12,cup_depth:0.82,rim_thickness:0.82,
      rim_irregularity:0.75,collapse:0.42
    },"Aged cup fungus with flattened or distorted cup and irregular rim.")
  },

  jelly:{
    young:stage("young","Young",0.25,{
      ...common.young,lobe_fullness:0.72,hydration:0.95,wrinkling:0.05,
      translucency:0.68
    },"Small hydrated gelatinous lobes with minimal wrinkling."),
    mature:stage("mature","Mature",0.60,{
      ...common.mature,lobe_fullness:1.00,hydration:0.88,wrinkling:0.18,
      translucency:0.72
    },"Reference hydrated lobe architecture."),
    old:stage("old","Old",0.92,{
      ...common.old,lobe_fullness:0.62,hydration:0.42,wrinkling:0.82,
      translucency:0.48,collapse:0.68
    },"Senescent or drying jelly fungus with wrinkled partially collapsed lobes.",
    ["Hydration state can mimic developmental age and must be recorded separately in real specimens."])
  },

  crust:{
    young:stage("young","Young",0.25,{
      ...common.young,patch_spread:0.42,margin_definition:1.00,context_thickness:0.42,
      surface_roughness:0.25,cracking:0.02
    },"Small actively expanding resupinate patch with strongly defined advancing margin."),
    mature:stage("mature","Mature",0.60,{
      ...common.mature,patch_spread:1.00,margin_definition:0.72,context_thickness:1.00,
      surface_roughness:0.58,cracking:0.08
    },"Reference resupinate stage with established fertile surface."),
    old:stage("old","Old",0.92,{
      ...common.old,patch_spread:1.12,margin_definition:0.28,context_thickness:1.05,
      surface_roughness:0.85,cracking:0.75,edge_erosion:0.55
    },"Aged crust with reduced active margin, cracking, roughening, and partial erosion.")
  }
});

export function getDevelopmentalStages(profileId){
  return DEVELOPMENTAL_STAGE_LIBRARY[profileId]||null;
}

export function getDevelopmentalStage(profileId,stageId){
  return DEVELOPMENTAL_STAGE_LIBRARY[profileId]?.[stageId]||null;
}

for(const [profileId,stages] of Object.entries(DEVELOPMENTAL_STAGE_LIBRARY)){
  for(const stageId of DEVELOPMENTAL_STAGE_ORDER){
    const item=stages[stageId];
    if(!item) throw new Error("Missing developmental stage "+stageId+" for "+profileId);
    const result=validateDevelopmentalStageProfile(item);
    if(!result.valid) throw new Error("Invalid developmental stage "+profileId+"/"+stageId+": "+result.errors.join("; "));
  }
}
