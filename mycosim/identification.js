export const OBSERVATION_FIELDS = Object.freeze([
  {id:"cap_morphology",label:"Cap morphology",type:"select",options:["unknown","convex","plane","umbonate","depressed","funnel","campanulate","conical","hemispherical","bracket","hoof","cup","lobed","branched","enclosed","resupinate"]},
  {id:"stipe_morphology",label:"Stipe morphology",type:"select",options:["unknown","equal","taper_up","taper_down","clavate","bulbous","marginate_bulb","rooting","lateral","eccentric","absent","hollow"]},
  {id:"hymenophore_type",label:"Hymenophore type",type:"select",options:["unknown","free_gills","adnexed","adnate","sinuate","decurrent","pores","tubes","teeth","folds","smooth","pitted_hymenium","enclosed_gleba"]},
  {id:"substrate",label:"Substrate",type:"select",options:["unknown","soil","leaf_litter","wood","living_tree","dead_wood","moss","dung","other"]},
  {id:"host",label:"Host",type:"text"},
  {id:"habitat",label:"Habitat",type:"text"},
  {id:"bruising_staining",label:"Bruising / staining",type:"text"},
  {id:"spore_shape",label:"Spore shape",type:"select",options:["unknown","globose","subglobose","ellipsoid","broadly_ellipsoid","amygdaliform","fusiform","cylindrical","allantoid","angular","ornamented_irregular"]},
  {id:"ornamentation",label:"Ornamentation",type:"select",options:["unknown","smooth","warted","spiny","reticulate","ridged","other"]},
  {id:"germ_pore",label:"Germ pore",type:"select",options:["unknown","present","absent","inconclusive"]},
  {id:"guttules",label:"Guttules",type:"select",options:["unknown","present","absent","variable","inconclusive"]},
  {id:"cystidia",label:"Cystidia",type:"text"},
  {id:"basidia_asci",label:"Basidia / asci",type:"select",options:["unknown","basidia_present","asci_present","not_seen","inconclusive"]},
  {id:"clamp_connections",label:"Clamp connections",type:"select",options:["unknown","present","absent","not_examined","inconclusive"]},
  {id:"hyphal_system",label:"Hyphal system",type:"select",options:["unknown","monomitic","dimitic","trimitic","not_examined","inconclusive"]},
  {id:"chemical_reactions",label:"Chemical reactions",type:"text"}
]);

export const EVIDENCE_STATES = Object.freeze(["observed","failed","inconclusive","not_examined"]);
export const CONFIDENCE_STATES = Object.freeze(["insufficient","low","moderate","high"]);

const CANDIDATES = Object.freeze([
  {id:"agaricoid",label:"Agaricoid morphology",diagnostic:["hymenophore_type"],rules:{hymenophore_type:["free_gills","adnexed","adnate","sinuate","decurrent"],cap_morphology:["convex","plane","umbonate","depressed","funnel","campanulate","conical","hemispherical"],stipe_morphology:["equal","taper_up","taper_down","clavate","bulbous","marginate_bulb","rooting","lateral","eccentric","absent"]}},
  {id:"boletoid",label:"Boletoid morphology",diagnostic:["hymenophore_type"],rules:{hymenophore_type:["pores","tubes"],cap_morphology:["convex","plane","hemispherical"],stipe_morphology:["equal","taper_up","taper_down","clavate","bulbous","rooting","eccentric"]}},
  {id:"polyporoid",label:"Bracket polypore morphology",diagnostic:["hymenophore_type","stipe_morphology"],rules:{hymenophore_type:["pores","tubes"],cap_morphology:["bracket","hoof","resupinate"],stipe_morphology:["absent","lateral"],substrate:["wood","living_tree","dead_wood"]}},
  {id:"hydnoid",label:"Hydnoid morphology",diagnostic:["hymenophore_type"],rules:{hymenophore_type:["teeth"],cap_morphology:["convex","plane","bracket","resupinate"],stipe_morphology:["equal","eccentric","lateral","absent"]}},
  {id:"morel",label:"Morchelloid morphology",diagnostic:["cap_morphology","hymenophore_type"],rules:{cap_morphology:["conical","ovoid","pitted_hymenium"],hymenophore_type:["pitted_hymenium"],stipe_morphology:["hollow","equal","taper_up"]}},
  {id:"coral",label:"Clavarioid / coral morphology",diagnostic:["cap_morphology"],rules:{cap_morphology:["branched"],hymenophore_type:["smooth"],stipe_morphology:["absent"]}},
  {id:"puffball",label:"Gasteroid / puffball morphology",diagnostic:["cap_morphology","hymenophore_type"],rules:{cap_morphology:["enclosed"],hymenophore_type:["enclosed_gleba"],stipe_morphology:["absent"]}},
  {id:"cup",label:"Cup fungus morphology",diagnostic:["cap_morphology","hymenophore_type"],rules:{cap_morphology:["cup"],hymenophore_type:["smooth"],stipe_morphology:["absent","equal"]}},
  {id:"jelly",label:"Jelly fungus morphology",diagnostic:["cap_morphology"],rules:{cap_morphology:["lobed"],hymenophore_type:["smooth"],stipe_morphology:["absent"]}},
  {id:"crust",label:"Resupinate crust morphology",diagnostic:["cap_morphology","stipe_morphology"],rules:{cap_morphology:["resupinate"],stipe_morphology:["absent"],substrate:["wood","living_tree","dead_wood"]}}
]);

export function emptyObservationRecord(){
  return {
    state:"observation",
    fields:Object.fromEntries(OBSERVATION_FIELDS.map(f=>[f.id,{value:"",evidence_state:"not_examined",provenance:""}])),
    notes:"",
    created_at:new Date().toISOString()
  };
}

function normalizedValue(field){
  const v=field?.value;
  return typeof v==="string"?v.trim():"";
}

export function compareObservedToCandidates(record){
  const results=[];
  for(const candidate of CANDIDATES){
    const matches=[],conflicts=[],missing=[],diagnostic=[];
    for(const [fieldId,allowed] of Object.entries(candidate.rules)){
      const f=record.fields?.[fieldId];
      const v=normalizedValue(f);
      if(!f || f.evidence_state==="not_examined" || f.evidence_state==="failed" || !v || v==="unknown"){
        missing.push(fieldId);
        continue;
      }
      if(f.evidence_state==="inconclusive"){
        missing.push(fieldId);
        continue;
      }
      if(allowed.includes(v)){
        matches.push(fieldId);
        if(candidate.diagnostic.includes(fieldId)) diagnostic.push(fieldId);
      }else{
        conflicts.push(fieldId);
      }
    }
    const examined=matches.length+conflicts.length;
    const coverage=examined/Object.keys(candidate.rules).length;
    const score=examined?matches.length/examined:0;
    let confidence="insufficient";
    if(examined>=2 && conflicts.length===0 && coverage>=.66) confidence="high";
    else if(examined>=2 && score>=.67) confidence="moderate";
    else if(examined>=1) confidence="low";
    results.push({
      candidate_id:candidate.id,candidate_label:candidate.label,
      matches,conflicts,missing,diagnostic,
      evidence_coverage:Number(coverage.toFixed(3)),
      compatibility:Number(score.toFixed(3)),
      confidence,
      interpretation:"Morphology-profile compatibility only; not a taxonomic identification."
    });
  }
  return results.sort((a,b)=>{
    const rank={high:3,moderate:2,low:1,insufficient:0};
    return rank[b.confidence]-rank[a.confidence] || b.compatibility-a.compatibility || b.evidence_coverage-a.evidence_coverage;
  });
}

export function fieldLabel(id){
  return OBSERVATION_FIELDS.find(f=>f.id===id)?.label||id;
}

export const CANDIDATE_PROFILES=CANDIDATES;
