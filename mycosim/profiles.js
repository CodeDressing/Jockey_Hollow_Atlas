import {validateMorphologyProfile} from "./schemas.js";

const A=(id,label,category,description,parentId=null)=>({
  id,label,category,description,parentId,selectable:true,defaultVisible:true
});

export const MORPHOLOGY_PROFILES = [
  {
    id:"agaricoid",label:"Agaricoid",group:"gilled",factory:"agaricoid",version:"1.0.0",
    description:"Pileus, lamellae and central stipe body plan.",
    anatomy:[
      A("pileus","Pileus / cap","macro","Upper fruiting-body structure."),
      A("pileus_context","Pileus context","internal","Fleshy tissue beneath the pileipellis.","pileus"),
      A("hymenophore","Lamellae / gills","fertile","Lamellate fertile surface beneath the pileus.","pileus"),
      A("stipe","Stipe","macro","Central supporting axis."),
      A("annulus","Annulus","veil","Persistent partial-veil remnant.","stipe"),
      A("stipe_base","Bulb / base","macro","Basal expansion of the stipe.","stipe")
    ]
  },
  {
    id:"boletoid",label:"Boletoid",group:"poroid",factory:"boletoid",version:"1.0.0",
    description:"Pileus, tube layer, pore surface and stipe body plan.",
    anatomy:[
      A("pileus","Pileus / cap","macro","Upper fruiting-body structure."),
      A("tube_layer","Tube layer","fertile","Vertically oriented tubes bearing hymenium."),
      A("hymenophore","Pore surface","fertile","Open ends of the tube layer."),
      A("stipe","Stipe","macro","Central supporting axis."),
      A("stipe_base","Stipe base","macro","Basal stipe morphology.")
    ]
  },
  {
    id:"polyporoid",label:"Polyporoid",group:"bracket",factory:"polyporoid",version:"1.0.0",
    description:"Bracket or resupinate-reflexed poroid body plan.",
    anatomy:[
      A("pileus","Upper surface / bracket","macro","Sterile upper bracket surface."),
      A("context","Context","internal","Internal bracket tissue."),
      A("tube_layer","Tube layer","fertile","Poroid tube tissue."),
      A("hymenophore","Pore surface","fertile","Fertile poroid undersurface."),
      A("substrate","Woody substrate","ecology","Supporting woody substrate.")
    ]
  },
  {
    id:"hydnoid",label:"Hydnoid",group:"toothed",factory:"hydnoid",version:"1.0.0",
    description:"Toothed or spined hymenophore.",
    anatomy:[
      A("pileus","Pileus / bracket","macro","Upper fruiting-body surface."),
      A("hymenophore","Teeth / spines","fertile","Pendent hymenial teeth."),
      A("stipe","Stipe","macro","Supporting axis where present.")
    ]
  },
  {
    id:"morel",label:"Morel",group:"morchelloid",factory:"morel",version:"1.0.0",
    description:"Hollow stipitate ascoma with ridges and pits.",
    anatomy:[
      A("fertile_head","Fertile head","macro","Pitted ascocarp head."),
      A("hymenophore","Ridges and pits","fertile","Hymenium-bearing surface."),
      A("stipe","Hollow stipe","macro","Sterile supporting stipe."),
      A("internal_cavity","Internal cavity","internal","Continuous hollow interior.")
    ]
  },
  {
    id:"coral",label:"Clavarioid / coral",group:"branched",factory:"coral",version:"1.0.0",
    description:"Branched clavarioid fruiting body.",
    anatomy:[
      A("branch_system","Branch system","macro","Repeatedly branched fertile structure."),
      A("branch_tips","Branch tips","macro","Distal tips of the branches."),
      A("hymenophore","Fertile branch surface","fertile","Hymenium distributed over branch surfaces."),
      A("base","Basal trunk","macro","Common basal attachment.")
    ]
  },
  {
    id:"puffball",label:"Puffball / gasteroid",group:"gasteroid",factory:"puffball",version:"1.0.0",
    description:"Enclosed spore-bearing glebal body plan.",
    anatomy:[
      A("peridium","Peridium","macro","Outer enclosing wall."),
      A("gleba","Gleba","internal","Internal spore-bearing tissue."),
      A("apical_pore","Apical pore","macro","Mature spore-release opening."),
      A("sterile_base","Sterile base","macro","Basal sterile tissue.")
    ]
  },
  {
    id:"cup",label:"Cup / discomycete",group:"cup",factory:"cup",version:"1.0.0",
    description:"Cup-shaped apothecium with exposed hymenium.",
    anatomy:[
      A("apothecium","Apothecium","macro","Cup-shaped fruiting body."),
      A("hymenophore","Inner hymenial surface","fertile","Exposed ascus-bearing inner surface."),
      A("excipulum","Excipulum","internal","Supporting cup tissue."),
      A("stipe","Short stipe / base","macro","Basal attachment where present.")
    ]
  },
  {
    id:"jelly",label:"Jelly fungus",group:"gelatinous",factory:"jelly",version:"1.0.0",
    description:"Gelatinous lobed fruiting body.",
    anatomy:[
      A("lobes","Gelatinous lobes","macro","Lobed translucent fruiting tissue."),
      A("hymenophore","Fertile surface","fertile","Hymenial surface across exposed lobes."),
      A("attachment","Attachment base","macro","Point of substrate attachment.")
    ]
  },
  {
    id:"crust",label:"Crust / resupinate",group:"resupinate",factory:"crust",version:"1.0.0",
    description:"Thin substrate-bound resupinate fruiting body.",
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
