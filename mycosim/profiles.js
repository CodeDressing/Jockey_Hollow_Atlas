import {validateMorphologyProfile} from "./schemas.js";

const A=(id,label,category,description,parentId=null)=>({
  id,label,category,description,parentId,selectable:true,defaultVisible:true
});

export const MORPHOLOGY_PROFILES = [
  {
    id:"agaricoid",label:"Agaricoid",group:"gilled",factory:"agaricoid",version:"4.0.0",
    description:"Organic cap-and-stipe teaching model with independent pileus, stipe, gill spacing, attachment, lamellulae and gill-edge morphology.",
    variantGroups:["agaric_pileus_profile","agaric_pileus_center","agaric_margin","agaric_stipe_taper","agaric_gill_spacing","agaric_gill_thickness","agaric_gill_depth","agaric_lamellulae","agaric_gill_edge","hymenophore","veil","texture_realism"],developmentalStages:["young","mature","old"],
    anatomy:[
      A("pileus","Pileus / cap","macro","Upper fruiting-body structure."),
      A("pileus_context","Pileus context","internal","Fleshy tissue beneath the pileipellis.","pileus"),
      A("hymenophore","Hymenophore","fertile","Fertile surface beneath the pileus.","pileus"),
      A("lamella","Lamella / gill","fertile","A full plate-like gill extending from the pileus margin toward the stipe.","hymenophore"),
      A("lamellula","Lamellula / short gill","fertile","A shorter gill terminating before the stipe and interspersed among full lamellae.","hymenophore"),
      A("gill_edge","Gill edge","fertile","Free lower edge of a lamella; may be even, serrulate, fimbriate, or crisped.","lamella"),
      A("stipe","Stipe","macro","Supporting axis where present."),
      A("veil_structure","Veil / basal structure","veil","Configured veil or universal-veil structure."),
      A("stipe_base","Stipe base","macro","Basal stipe morphology.","stipe")
    ]
  },
  {
    id:"boletoid",label:"Boletoid",group:"poroid",factory:"boletoid",version:"2.0.0",
    description:"Parameterized pileus, tube layer, pore surface and stipe.",
    variantGroups:["pileus","stipe","veil"],developmentalStages:["young","mature","old"],
    anatomy:[
      A("pileus","Pileus / cap","macro","Upper fruiting-body structure."),
      A("tube_layer","Tube layer","fertile","Vertically oriented tubes bearing hymenium."),
      A("hymenophore","Pore surface","fertile","Open ends of the tube layer."),
      A("stipe","Stipe","macro","Central supporting axis."),
      A("veil_structure","Veil / basal structure","veil","Configured veil structure where selected."),
      A("stipe_base","Stipe base","macro","Basal stipe morphology.")
    ]
  },
  {
    id:"polyporoid",label:"Bracket polypore",group:"bracket",factory:"polyporoid",version:"2.0.0",
    description:"Shelf or bracket body with context, tube layer and pore surface.",
    variantGroups:[],developmentalStages:["young","mature","old"],
    anatomy:[
      A("pileus","Upper surface / bracket","macro","Sterile upper bracket surface."),
      A("context","Context","internal","Internal bracket tissue."),
      A("tube_layer","Tube layer","fertile","Poroid tube tissue."),
      A("hymenophore","Pore surface","fertile","Fertile poroid undersurface."),
      A("substrate","Woody substrate","ecology","Supporting woody substrate.")
    ]
  },
  {
    id:"hoof_conk",label:"Hoof / conk",group:"bracket",factory:"hoof_conk",version:"1.0.0",
    description:"Thick perennial hoof-shaped polypore architecture.",
    variantGroups:[],developmentalStages:["young","mature","old"],
    anatomy:[
      A("pileus","Hoof-shaped upper surface","macro","Thick sterile upper surface."),
      A("context","Context","internal","Dense perennial context."),
      A("tube_layer","Layered tube tissue","fertile","Successive poroid tube layers."),
      A("hymenophore","Pore surface","fertile","Ventral fertile surface."),
      A("substrate","Woody substrate","ecology","Tree or log attachment.")
    ]
  },
  {
    id:"hydnoid",label:"Stipitate hydnoid",group:"toothed",factory:"hydnoid",version:"2.0.0",
    description:"Cap-and-stipe form with pendent teeth or spines.",
    variantGroups:["pileus","stipe"],developmentalStages:["young","mature","old"],
    anatomy:[
      A("pileus","Pileus / cap","macro","Upper fruiting-body surface."),
      A("hymenophore","Teeth / spines","fertile","Pendent hymenial teeth."),
      A("stipe","Stipe","macro","Supporting axis where present.")
    ]
  },
  {
    id:"hydnoid_bracket",label:"Hydnoid bracket",group:"toothed",factory:"hydnoid_bracket",version:"1.0.0",
    description:"Sessile bracket with pendent tooth-like hymenophore.",
    variantGroups:[],developmentalStages:["young","mature","old"],
    anatomy:[
      A("pileus","Upper bracket surface","macro","Sterile upper surface."),
      A("context","Context","internal","Internal bracket tissue."),
      A("hymenophore","Teeth / spines","fertile","Pendent fertile teeth."),
      A("substrate","Woody substrate","ecology","Supporting woody substrate.")
    ]
  },
  {
    id:"morel",label:"Morel / morchelloid",group:"morchelloid",factory:"morel",version:"2.0.0",
    description:"Hollow stipitate ascoma with ridges, pits and exposed hymenium.",
    variantGroups:[],developmentalStages:["young","mature","old"],
    anatomy:[
      A("fertile_head","Fertile head","macro","Pitted ascocarp head."),
      A("hymenophore","Ridges and pits","fertile","Hymenium-bearing surface."),
      A("stipe","Hollow stipe","macro","Sterile supporting stipe."),
      A("internal_cavity","Internal cavity","internal","Continuous hollow interior.")
    ]
  },
  {
    id:"coral",label:"Coral / clavarioid",group:"branched",factory:"coral",version:"2.0.0",
    description:"Repeatedly branched clavarioid fruiting body.",
    variantGroups:[],developmentalStages:["young","mature","old"],
    anatomy:[
      A("branch_system","Branch system","macro","Repeatedly branched fertile structure."),
      A("branch_tips","Branch tips","macro","Distal tips of the branches."),
      A("hymenophore","Fertile branch surface","fertile","Hymenium distributed over branch surfaces."),
      A("base","Basal trunk","macro","Common basal attachment.")
    ]
  },
  {
    id:"puffball",label:"Puffball / gasteroid",group:"gasteroid",factory:"puffball",version:"5.0.0",
    description:"Enclosed spore-bearing glebal body plan with stage-dependent surface ornamentation, peridial state, ostiole development, and cutaway anatomy.",
    variantGroups:["puff_subtype","puff_surface","puff_shape","puff_base","peridial_condition","ostiole_state","rupture_pattern","rupture_margin","collapse_state","gleba_state","section_view","texture_realism"],developmentalStages:["young","mature","old"],
    anatomy:[
      A("peridium","Peridium","macro","Outer enclosing wall."),
      A("exoperidium","Exoperidium","macro","Outermost peridial layer; may be smooth, granular, warted, spiny, or scurfy.","peridium"),
      A("endoperidium","Endoperidium","internal","Inner peridial wall retained beneath the exoperidium.","peridium"),
      A("gleba","Gleba","internal","Internal spore-bearing tissue."),
      A("spore_mass","Spore mass","internal","Mature powdery internal spore mass derived from the gleba.","gleba"),
      A("apical_region","Apical region","macro","Upper region where an ostiole or other dehiscence may develop.","peridium"),
      A("apical_pore","Ostiole / apical pore","macro","Spore-release opening that develops at maturity.","peridium"),
      A("sterile_base","Sterile base / subgleba","macro","Basal non-spore-bearing tissue."),
      A("basal_attachment","Basal attachment","macro","Point where the puffball connects to substrate.","sterile_base"),
      A("rupture_margin","Rupture margin","macro","Edge of a peridial opening; may be clean, torn, ragged, curled, or frayed.","peridium"),
      A("worn_exoperidium","Worn exoperidium","macro","Abraded outer peridial surface exposing more persistent inner wall.","exoperidium"),
      A("collapsed_wall","Collapsed wall","macro","Senescent peridial tissue deformed by drying, spore release, and weathering.","peridium"),
      A("rupture_channel","Rupture / ostiolar channel","internal","Path through the peridial wall connecting the glebal cavity to the exterior.","apical_pore"),
      A("earthstar_rays","Earthstar rays","macro","Outer peridial tissue split into radiating rays in earthstar-type development.","peridium"),
      A("gasteroid_stalk","Gasteroid stalk","macro","Sterile stalk elevating a spore sac in stalked-puffball-type architecture.","sterile_base")
    ]
  },
  {
    id:"cup",label:"Cup fungus / discomycete",group:"cup",factory:"cup",version:"2.0.0",
    description:"Cup-shaped apothecium with exposed inner hymenium.",
    variantGroups:[],developmentalStages:["young","mature","old"],
    anatomy:[
      A("apothecium","Apothecium","macro","Cup-shaped fruiting body."),
      A("hymenophore","Inner hymenial surface","fertile","Exposed ascus-bearing inner surface."),
      A("excipulum","Excipulum","internal","Supporting cup tissue."),
      A("stipe","Short stipe / base","macro","Basal attachment where present.")
    ]
  },
  {
    id:"jelly",label:"Jelly fungus",group:"gelatinous",factory:"jelly",version:"2.0.0",
    description:"Gelatinous lobed fruiting body.",
    variantGroups:[],developmentalStages:["young","mature","old"],
    anatomy:[
      A("lobes","Gelatinous lobes","macro","Lobed translucent fruiting tissue."),
      A("hymenophore","Fertile surface","fertile","Hymenial surface across exposed lobes."),
      A("attachment","Attachment base","macro","Point of substrate attachment.")
    ]
  },
  {
    id:"crust",label:"Resupinate crust",group:"resupinate",factory:"crust",version:"2.0.0",
    description:"Thin substrate-bound resupinate fruiting body.",
    variantGroups:[],developmentalStages:["young","mature","old"],
    anatomy:[
      A("margin","Growing margin","macro","Peripheral advancing edge."),
      A("context","Subicular context","internal","Tissue between substrate and fertile surface."),
      A("hymenophore","Exposed fertile surface","fertile","Outward-facing hymenium."),
      A("substrate","Woody substrate","ecology","Underlying substrate.")
    ]
  }
];

for(const p of MORPHOLOGY_PROFILES){
  const v=validateMorphologyProfile(p);
  if(!v.valid) throw new Error("Invalid MycoSim profile "+p.id+": "+v.errors.join("; "));
}

export const PROFILE_BY_ID = Object.fromEntries(MORPHOLOGY_PROFILES.map(p=>[p.id,p]));
