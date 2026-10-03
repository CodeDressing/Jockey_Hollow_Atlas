import * as THREE from "three";
import {MORPHOLOGY_PROFILES} from "./profiles.js";
import {DEVELOPMENTAL_STAGE_ORDER} from "./stages.js";
import {KNOWLEDGE_OBJECTS} from "./knowledge.js";
import {PUFFBALL_SUBTYPE_LIBRARY,applyPuffballSubtypeDefaults,enforcePuffballSubtype,puffballSubtypeStageDefaults} from "./variants.js";
import {auditCampaignSnapshot,aggregateCampaignStates} from "./campaign_audit.js";

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const nextFrame=()=>new Promise(r=>requestAnimationFrame(()=>r()));

const KNOWLEDGE_ALIAS={
  veil_structure:"veil_structure",
  tube_layer:"tube_layer",
  context:"context",
  base:"base",
  attachment:"attachment",
  sterile_base:"sterile_base",
  apical_pore:"apical_pore",
  fertile_head:"fertile_head",
  internal_cavity:"internal_cavity",
  branch_system:"branch_system",
  branch_tips:"branch_tips",
  apothecium:"apothecium",
  excipulum:"excipulum",
  margin:"margin",
  lobes:"lobes",
  peridium:"peridium",
  gleba:"gleba",
  substrate:"substrate",
  stipe_base:"stipe_base",
  pileus_context:"pileus_context",
  hymenophore:"hymenophore",
  pileus:"pileus",
  stipe:"stipe"
};

function renderedObjectIds(engine){
  return [...engine.objects.entries()]
    .filter(([,o])=>o&&o.visible!==false)
    .map(([id])=>id);
}

function materialList(obj){
  const out=[];
  obj?.traverse?.(n=>{
    if(!n.material)return;
    out.push(...(Array.isArray(n.material)?n.material:[n.material]));
  });
  return out;
}

function hasClipping(engine){
  let seen=false;
  for(const o of engine.objects.values()){
    for(const m of materialList(o)){
      if((m.clippingPlanes||[]).length){seen=true;break;}
    }
    if(seen)break;
  }
  return seen;
}

function hasTransparency(engine,excludeId){
  for(const [id,o] of engine.objects){
    if(id===excludeId)continue;
    for(const m of materialList(o)){
      if(m.transparent&&m.opacity<.99)return true;
    }
  }
  return false;
}

function anatomyKnowledgePass(profile){
  const failures=[];
  for(const a of profile.anatomy||[]){
    const id=KNOWLEDGE_ALIAS[a.id]||a.id;
    if(!KNOWLEDGE_OBJECTS[id]) failures.push(a.id);
  }
  return {pass:failures.length===0,failures};
}

const CORE_ANATOMY_REQUIRED=Object.freeze({
  agaricoid:["pileus","hymenophore","stipe"],
  boletoid:["pileus","tube_layer","hymenophore","stipe"],
  polyporoid:["pileus","context","tube_layer","hymenophore","substrate"],
  hoof_conk:["pileus","context","tube_layer","hymenophore","substrate"],
  hydnoid:["pileus","hymenophore","stipe"],
  hydnoid_bracket:["pileus","context","hymenophore","substrate"],
  morel:["fertile_head","hymenophore","stipe","internal_cavity"],
  coral:["branch_system","branch_tips","base","hymenophore"],
  puffball:["peridium","endoperidium","gleba","sterile_base"],
  cup:["apothecium","hymenophore","excipulum","stipe"],
  jelly:["lobes","hymenophore","attachment"],
  crust:["margin","context","hymenophore","substrate"]
});

function requiredAnatomyPass(engine,profile){
  const failures=[];
  const required=CORE_ANATOMY_REQUIRED[profile.id]||[];
  for(const id of required){
    const obj=engine.objects.get(id);
    if(!obj){
      failures.push({id,reason:"missing_core_object"});
      continue;
    }
    let hasGeometry=!!obj.geometry;
    obj.traverse?.(n=>{if(n.geometry)hasGeometry=true;});
    if(!hasGeometry)failures.push({id,reason:"core_object_has_no_geometry"});
  }
  return {pass:failures.length===0,failures,required};
}

function hoverPass(engine){
  const failures=[];
  let checked=0;
  for(const id of renderedObjectIds(engine)){
    const obj=engine.objects.get(id);
    const hasGeometry=(()=>{
      let found=false;
      if(obj?.geometry)found=true;
      obj?.traverse?.(n=>{if(n.geometry)found=true;});
      return found;
    })();
    if(!hasGeometry)continue;
    checked++;
    const r=engine.qaRaycastAnatomy(id);
    if(!r.pass)failures.push(r);
  }
  return {pass:checked>0&&failures.length===0,checked,failures};
}

function framingPass(engine){
  engine.frameModel({animate:false});
  engine.scene.updateMatrixWorld(true);
  engine.camera.updateMatrixWorld(true);
  engine.camera.updateProjectionMatrix();
  return engine.qaSnapshot().frameIntersects;
}

function focusPass(engine){
  const id=renderedObjectIds(engine)[0];
  if(!id)return false;
  const ok=engine.focus(id,1);
  const fly=!!engine.fly;
  engine.fly=null;
  return ok&&fly;
}

function isolateHidePass(engine){
  const ids=renderedObjectIds(engine);
  const id=ids[0];
  if(!id)return false;
  engine.isolate(id);
  const isolated=[...engine.objects.entries()].every(([oid,o])=>oid===id||o.userData?.parentId===id||o.visible===false);
  engine.clearIsolation();
  engine.hide(id);
  const hidden=engine.objects.get(id)?.visible===false;
  engine.show(id);
  return isolated&&hidden&&engine.objects.get(id)?.visible!==false;
}

function explodedPass(engine){
  const id=renderedObjectIds(engine)[0];
  if(!id)return false;
  const o=engine.objects.get(id);
  const before=o.position.clone();
  engine.setExploded(true);
  const changed=!o.position.equals(before);
  engine.setExploded(false);
  return changed;
}

function sectionPass(engine){
  engine.setSection(true);
  const pass=hasClipping(engine);
  engine.setSection(false);
  return pass;
}

function transparencyPass(engine){
  const ids=renderedObjectIds(engine);
  const id=ids[0];
  if(!id||ids.length<2)return true;
  engine.contextualTransparency(id,.12);
  const pass=hasTransparency(engine,id);
  engine.applyMode();
  return pass;
}

function renderPass(engine){
  engine.renderer.render(engine.scene,engine.camera);
  const snap=engine.qaSnapshot();
  return !snap.boxEmpty&&snap.rootChildren>0&&snap.geometryCount>0&&snap.drawCalls>0;
}

function agaricoidPileusShellPass(engine,profile){
  if(profile.id!=="agaricoid")return {pass:true,reason:"not_agaricoid"};
  const pileus=engine.objects.get("pileus");
  const geo=pileus?.geometry;
  if(!geo?.index||!geo?.attributes?.position)return {pass:false,reason:"missing_indexed_pileus_geometry"};
  const idx=geo.index.array,pos=geo.attributes.position;
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  let upward=0,downward=0;
  const sample=Math.min(idx.length,900);
  for(let i=0;i+2<sample;i+=3){
    a.fromBufferAttribute(pos,idx[i]);
    b.fromBufferAttribute(pos,idx[i+1]);
    c.fromBufferAttribute(pos,idx[i+2]);
    const n=b.clone().sub(a).cross(c.clone().sub(a));
    const cy=(a.y+b.y+c.y)/3;
    if(cy>-.05){
      if(n.y>0)upward++;
      else if(n.y<0)downward++;
    }
  }
  return {pass:upward>downward&&upward>0,reason:"top_shell_winding",upward,downward};
}

function agaricoidGeometryContractPass(engine,profile){
  if(profile.id!=="agaricoid")return {pass:true,reason:"not_agaricoid"};
  const pileus=engine.objects.get("pileus");
  const hym=engine.objects.get("hymenophore");
  const geo=pileus?.geometry;
  const box=geo?.boundingBox||null;
  const size=box?box.getSize(new THREE.Vector3()):new THREE.Vector3();
  const model=geo?.userData?.model||null;
  const shellOk=!!geo&&size.x>1.8&&size.z>1.8&&size.y>.10;
  const materialOk=!!pileus?.material&&pileus.material.visible!==false;
  const hymOk=!!hym;
  const state=engine._agaricoidCapState||{};
  const anchorOk=Number.isFinite(state.safeInnerRadius)&&Number.isFinite(state.safeOuterRadius)&&state.safeOuterRadius>state.safeInnerRadius;
  return {pass:shellOk&&materialOk&&hymOk&&anchorOk,model,size:{x:size.x,y:size.y,z:size.z},shellOk,materialOk,hymOk,anchorOk};
}

function agaricoidHymenophoreSyncPass(engine,profile){
  if(profile.id!=="agaricoid")return {pass:true,reason:"not_agaricoid"};
  const pileus=engine.objects.get("pileus");
  const hym=engine.objects.get("hymenophore");
  const state=engine._agaricoidCapState||{};
  const attach=hym?.userData?.attachmentGeometry||{};
  if(!pileus||!hym||typeof state.undersideHeight!=="function"){
    return {pass:false,reason:"missing_sync_inputs"};
  }

  const pileusBox=new THREE.Box3().setFromObject(pileus);
  const hymBox=new THREE.Box3().setFromObject(hym);
  const pileusSize=pileusBox.getSize(new THREE.Vector3());
  const hymSize=hymBox.getSize(new THREE.Vector3());

  const verticalGap=Math.max(0,pileusBox.min.y-hymBox.max.y);
  const radialOk=hymSize.x<=pileusSize.x*1.02 && hymSize.z<=pileusSize.z*1.02;
  const verticalOk=verticalGap<.12;
  const marginOk=Number.isFinite(attach.marginClearance)&&attach.marginClearance>=0;
  const undersideOk=attach.followsPileusUnderside===true;

  return {
    pass:radialOk&&verticalOk&&marginOk&&undersideOk,
    radialOk,verticalOk,marginOk,undersideOk,
    verticalGap,
    marginState:attach.marginState||null,
    marginClearance:attach.marginClearance??null,
    innerRadius:attach.innerRadius??null,
    outerRadius:attach.outerRadius??null
  };
}


function agaricoidStipePhase7APass(engine,profile){
  if(profile.id!=="agaricoid")return {pass:true,reason:"not_agaricoid"};
  const stipe=engine.objects.get("stipe");
  const geo=stipe?.geometry;
  const meta=geo?.userData||{};
  const anchors=meta.profileAnchors||[];
  const radii=meta.profileRadii||{};
  const blend=meta.blendCorridors||{};
  const form=engine.variants?.agaric_stipe_form||engine.variants?.agaric_stipe_taper||"equal";
  const profileOk=meta.model==="agaricoid-profile-stipe-v3"&&meta.profileDriven===true;
  const anchorsOk=anchors.length>=5&&anchors.every(a=>Number.isFinite(a.t)&&Number.isFinite(a.r)&&a.r>0);
  const radiiOk=["apex","upperMid","lowerMid","base","rootTip"].every(k=>Number.isFinite(radii[k])&&radii[k]>0);
  const blendOk=meta.regionBlending===true&&Array.isArray(blend.apexMid)&&Array.isArray(blend.midBase);
  const organicOk=meta.nonPerfectRoundness===true;
  const eccentricOk=(engine.variants?.agaric_stipe_position||"central")!=="eccentric"||meta.eccentricCenterline===true;
  const silhouetteOk=(()=>{
    if(!radiiOk)return false;
    if(form==="tapering")return radii.base>radii.upperMid&&radii.upperMid>radii.apex;
    if(form==="clavate")return radii.upperMid>radii.lowerMid&&radii.upperMid>radii.base;
    if(form==="ventricose")return radii.lowerMid>radii.apex&&radii.lowerMid>radii.base;
    if(form==="bulbous_base")return radii.base>radii.lowerMid*1.15;
    if(form==="rooting")return radii.rootTip<radii.base*.55;
    return Math.max(radii.apex,radii.upperMid,radii.lowerMid,radii.base)/Math.min(radii.apex,radii.upperMid,radii.lowerMid,radii.base)<1.16;
  })();
  return {
    pass:profileOk&&anchorsOk&&radiiOk&&blendOk&&organicOk&&eccentricOk&&silhouetteOk,
    form,profileOk,anchorsOk,radiiOk,blendOk,organicOk,eccentricOk,silhouetteOk,
    model:meta.model||null,anchors,radii,blend
  };
}


function agaricoidStipePhase7BPass(engine,profile){
  if(profile.id!=="agaricoid")return {pass:true,reason:"not_agaricoid"};
  const stipe=engine.objects.get("stipe");
  const model=stipe?.userData?.surfaceBlendModel||null;
  const controls=stipe?.userData?.surfaceBlendControls||{};
  const states=stipe?.userData?.surfaceStates||{};
  const generators=["stipe_apex","stipe_mid","stipe_base_surface"].map(id=>engine.objects.get(id)).filter(Boolean);
  const controlsOk=["apexMidLength","midBaseLength","falloff","inheritance","carryover"].every(k=>Number.isFinite(controls[k]));
  const stateOk=["apex","mid","base"].every(k=>typeof states[k]==="string");
  const generatorOk=generators.every(g=>g.userData?.generator==="phase7b-surface-state-v1"&&g.userData?.regionalBlend===true&&Array.isArray(g.userData?.blendBounds));
  const continuousOk=generators.every(g=>g.userData.blendBounds[1]>g.userData.blendBounds[0]);
  return {
    pass:model==="phase7b-regional-morphology-v1"&&controlsOk&&stateOk&&generatorOk&&continuousOk,
    model,controls,states,generatorCount:generators.length,generatorOk,continuousOk
  };
}


function mobileContract(){
  const mq=matchMedia("(max-width: 900px)");
  const stage=document.querySelector(".stage-wrap");
  const canvas=document.querySelector("#stage");
  const rect=canvas?.getBoundingClientRect();
  const usable=!!rect&&rect.width>250&&rect.height>300;
  const touch=getComputedStyle(canvas).touchAction;
  return {
    pass:usable,
    viewport:window.innerWidth<=900?"mobile":"desktop",
    mediaQuery:mq.matches,
    canvas:{width:Math.round(rect?.width||0),height:Math.round(rect?.height||0)},
    stagePosition:stage?getComputedStyle(stage).position:null,
    touchAction:touch
  };
}

export async function runMycoSimRegression(engine,{onProgress=()=>{}}={}){
  const original={
    profileId:engine.currentProfile?.id||MORPHOLOGY_PROFILES[0].id,
    stageId:engine.getDevelopmentalStage()?.id||"mature",
    mode:engine.mode,
    variants:{...engine.variants}
  };

  const writes=[];
  const originalFetch=window.fetch;
  window.fetch=async (...args)=>{
    const init=args[1]||{};
    const method=String(init.method||"GET").toUpperCase();
    if(!["GET","HEAD"].includes(method))writes.push({type:"fetch",method,url:String(args[0])});
    return originalFetch(...args);
  };

  const originalXHRSend=XMLHttpRequest.prototype.send;
  const originalXHROpen=XMLHttpRequest.prototype.open;
  let xhrMethod="GET",xhrUrl="";
  XMLHttpRequest.prototype.open=function(method,url,...rest){
    xhrMethod=String(method||"GET").toUpperCase();xhrUrl=String(url||"");
    return originalXHROpen.call(this,method,url,...rest);
  };
  XMLHttpRequest.prototype.send=function(...args){
    if(!["GET","HEAD"].includes(xhrMethod))writes.push({type:"xhr",method:xhrMethod,url:xhrUrl});
    return originalXHRSend.apply(this,args);
  };

  const rows=[];
  const memorySamples=[];

  try{
    let index=0;
    const total=MORPHOLOGY_PROFILES.length*DEVELOPMENTAL_STAGE_ORDER.length;
    for(const profile of MORPHOLOGY_PROFILES){
      for(const stageId of DEVELOPMENTAL_STAGE_ORDER){
        index++;
        onProgress({index,total,profile:profile.label,stageId});
        engine.developmentalStageId=stageId;
        engine.loadProfile(profile.id);
        engine.mode=original.mode;
        engine.applyMode();
        await nextFrame();
        await nextFrame();

        const hover=hoverPass(engine);
        const knowledge=anatomyKnowledgePass(profile);
        const anatomy=requiredAnatomyPass(engine,profile);
        const pileusShell=agaricoidPileusShellPass(engine,profile);
        const agaricoidContract=agaricoidGeometryContractPass(engine,profile);
        const hymenophoreSync=agaricoidHymenophoreSyncPass(engine,profile);
        const stipePhase7A=agaricoidStipePhase7APass(engine,profile);
        const stipePhase7B=agaricoidStipePhase7BPass(engine,profile);
        const result={
          profileId:profile.id,
          family:profile.label,
          stageId,
          render:renderPass(engine),
          framing:framingPass(engine),
          hover:hover.pass,
          hoverFailures:hover.failures,
          focus:focusPass(engine),
          isolateHide:isolateHidePass(engine),
          exploded:explodedPass(engine),
          section:sectionPass(engine),
          transparency:transparencyPass(engine),
          anatomyNavigation:knowledge.pass,
          anatomyFailures:knowledge.failures,
          requiredAnatomy:anatomy.pass,
          requiredAnatomyFailures:anatomy.failures,
          agaricoidPileusShell:pileusShell.pass,
          agaricoidPileusShellDetail:pileusShell,
          agaricoidGeometryContract:agaricoidContract.pass,
          agaricoidGeometryContractDetail:agaricoidContract,
          agaricoidHymenophoreSync:hymenophoreSync.pass,
          agaricoidHymenophoreSyncDetail:hymenophoreSync,
          agaricoidStipePhase7A:stipePhase7A.pass,
          agaricoidStipePhase7ADetail:stipePhase7A,
          agaricoidStipePhase7B:stipePhase7B.pass,
          agaricoidStipePhase7BDetail:stipePhase7B,
          modePreserved:engine.mode===original.mode
        };
        engine.resetPresentation();
        engine.renderer.render(engine.scene,engine.camera);
        const snap=engine.qaSnapshot();
        result.fps=snap.fps;
        result.fpsAcceptable=snap.realismPerformance?.checks?.fps ?? (snap.fps===0||snap.fps>=30);
        result.objects=snap.objects;
        result.drawCalls=snap.drawCalls;
        result.triangles=snap.complexity?.triangles||0;
        result.realismTier=snap.realismTier||"atlas";
        result.profileBuildMs=snap.profileBuildMs||0;
        result.performanceTargets=snap.realismPerformance?.targets||null;
        result.performanceChecks=snap.realismPerformance?.checks||null;
        result.performancePass=snap.realismPerformance?.pass??true;
        result.pass=[
          result.render,result.framing,result.hover,result.focus,result.isolateHide,
          result.exploded,result.section,result.transparency,result.anatomyNavigation,
          result.requiredAnatomy,result.agaricoidPileusShell,result.agaricoidGeometryContract,result.agaricoidHymenophoreSync,result.agaricoidStipePhase7A,result.agaricoidStipePhase7B,result.modePreserved,result.fpsAcceptable,result.performancePass
        ].every(Boolean);
        rows.push(result);
        memorySamples.push({
          profileId:profile.id,stageId,
          geometries:snap.rendererGeometries,
          textures:snap.rendererTextures,
          rootChildren:snap.rootChildren,
          geometryCount:snap.geometryCount,
          materialCount:snap.materialCount
        });
      }
    }

    // Sprint 2 stipe surface-state audit: verify every rebuilt generator actually
    // produces geometry and crosses its nominal regional boundary rather than
    // reverting to hard apex/mid/base bands.
    const stipeSurfaceCases=[
      {state:"longitudinal_striate",region:"mid",objectId:"stipe_mid",expectedRelief:"axial-ridges"},
      {state:"pruinose",region:"apex",objectId:"stipe_apex",expectedRelief:"microgranular-bloom"},
      {state:"fibrillose",region:"mid",objectId:"stipe_mid",expectedRelief:"longitudinal-fibres"},
      {state:"floccose",region:"mid",objectId:"stipe_mid",expectedRelief:"soft-tufts"},
      {state:"scaly",region:"mid",objectId:"stipe_mid",expectedRelief:"raised-squamules"},
      {state:"reticulate",region:"mid",objectId:"stipe_mid",expectedRelief:"networked-ridges"}
    ];
    const stipeSurfaceAudit=[];
    for(const test of stipeSurfaceCases){
      engine.variants={
        ...engine.variants,
        agaric_stipe_surface_apex:test.region==="apex"?test.state:"smooth",
        agaric_stipe_surface_mid:test.region==="mid"?test.state:"smooth",
        agaric_stipe_surface_base:test.region==="base"?test.state:"smooth"
      };
      engine.developmentalStageId="mature";
      engine.loadProfile("agaricoid");
      engine.renderer.render(engine.scene,engine.camera);
      await nextFrame();
      const group=engine.objects.get(test.objectId);
      let relief=null,geometryCount=0;
      group?.traverse?.(n=>{
        if(n.geometry)geometryCount++;
        if(!relief&&n.userData?.relief)relief=n.userData.relief;
      });
      const bounds=group?.userData?.blendBounds||null;
      const boundaryCrossing=Array.isArray(bounds)&&(
        test.region==="apex"?bounds[0]<.72:
        test.region==="base"?bounds[1]>.30:
        bounds[0]<.30&&bounds[1]>.72
      );
      const elementCount=group?.userData?.elementCount||0;
      stipeSurfaceAudit.push({
        state:test.state,region:test.region,
        pass:!!group&&group.userData?.generator==="phase7b-surface-state-v1"&&
          group.userData?.regionalBlend===true&&geometryCount>0&&elementCount>0&&
          relief===test.expectedRelief&&boundaryCrossing,
        generator:group?.userData?.generator||null,
        regionalBlend:group?.userData?.regionalBlend===true,
        geometryCount,elementCount,relief,bounds,boundaryCrossing
      });
    }
    const stipeSprint2={
      pass:stipeSurfaceAudit.every(x=>x.pass),
      stateCount:stipeSurfaceAudit.length,
      passedStates:stipeSurfaceAudit.filter(x=>x.pass).length,
      states:stipeSurfaceAudit
    };

    // Final campaign audit: every gasteroid teaching archetype × developmental stage.
    const campaignRows=[];
    const subtypeIds=Object.keys(PUFFBALL_SUBTYPE_LIBRARY);
    for(const subtypeId of subtypeIds){
      for(const stageId of DEVELOPMENTAL_STAGE_ORDER){
        const stageDefaults={
          young:{peridial_condition:"intact",ostiole_state:"absent",rupture_pattern:"intact",rupture_margin:"clean",collapse_state:"none",gleba_state:"immature"},
          mature:{peridial_condition:"flaking",ostiole_state:"developing",rupture_pattern:"apical_ostiole",rupture_margin:"slightly_torn",collapse_state:"slight",gleba_state:"maturing"},
          old:{peridial_condition:"collapsed",ostiole_state:"open",rupture_pattern:"irregular_rupture",rupture_margin:"ragged",collapse_state:"weathered",gleba_state:"old"}
        }[stageId]||{};
        const subtypeStage=puffballSubtypeStageDefaults(subtypeId,stageId);
        engine.variants=enforcePuffballSubtype({
          ...applyPuffballSubtypeDefaults(engine.variants,subtypeId),
          ...stageDefaults,
          ...subtypeStage
        });
        engine.developmentalStageId=stageId;
        engine.loadProfile("puffball");
        engine.renderer.render(engine.scene,engine.camera);
        await nextFrame();
        const snapshot=engine.qaSnapshot();
        campaignRows.push({
          subtypeId,stageId,
          audit:auditCampaignSnapshot(snapshot),
          buildMs:snapshot.profileBuildMs,
          realismTier:snapshot.realismTier,
          performance:snapshot.realismPerformance,
          triangles:snapshot.complexity?.triangles||0,
          drawCalls:snapshot.drawCalls||0
        });
      }
    }
    const campaign=aggregateCampaignStates(campaignRows);

    // Repeated-switch memory regression on a representative loop.
    const before=engine.qaSnapshot();
    for(let cycle=0;cycle<5;cycle++){
      for(const profile of MORPHOLOGY_PROFILES){
        for(const stageId of DEVELOPMENTAL_STAGE_ORDER){
          engine.developmentalStageId=stageId;
          engine.loadProfile(profile.id);
          engine.renderer.render(engine.scene,engine.camera);
          await nextFrame();
        }
      }
    }
    engine.renderer.render(engine.scene,engine.camera);
    await nextFrame();
    const after=engine.qaSnapshot();
    const memory={
      pass:(after.rendererGeometries-before.rendererGeometries)<=6 &&
           (after.rendererTextures-before.rendererTextures)<=1,
      before:{geometries:before.rendererGeometries,textures:before.rendererTextures},
      after:{geometries:after.rendererGeometries,textures:after.rendererTextures},
      delta:{
        geometries:after.rendererGeometries-before.rendererGeometries,
        textures:after.rendererTextures-before.rendererTextures
      },
      cycles:5
    };

    const mobile=mobileContract();
    const specimenIsolation={
      pass:writes.length===0,
      networkWrites:writes,
      note:"Regression run observed no non-GET network writes during family/stage switching."
    };

    const failed=rows.filter(r=>!r.pass);
    return {
      pass:failed.length===0&&memory.pass&&mobile.pass&&specimenIsolation.pass&&campaign.pass&&stipeSprint2.pass,
      generatedAt:new Date().toISOString(),
      totalCombinations:rows.length,
      passedCombinations:rows.length-failed.length,
      failedCombinations:failed.length,
      performanceFailures:rows.filter(r=>!r.performancePass).map(r=>({
        profileId:r.profileId,stageId:r.stageId,tier:r.realismTier,
        fps:r.fps,drawCalls:r.drawCalls,triangles:r.triangles,buildMs:r.profileBuildMs,
        checks:r.performanceChecks,targets:r.performanceTargets
      })),
      rows,
      campaign,
      campaignRows,
      stipeSprint2,
      memory,
      mobile,
      specimenIsolation
    };
  } finally {
    window.fetch=originalFetch;
    XMLHttpRequest.prototype.send=originalXHRSend;
    XMLHttpRequest.prototype.open=originalXHROpen;
    engine.variants={...original.variants};
    engine.developmentalStageId=original.stageId;
    engine.loadProfile(original.profileId);
    engine.mode=original.mode;
    engine.applyMode();
  }
}

export function formatRegressionSummary(report){
  const status=report.pass?"PASS":"FAIL";
  return `${status} · ${report.passedCombinations}/${report.totalCombinations} family×stage combinations · campaign ${report.campaign?.stateCount||0}/${report.campaign?.expectedStateCount||0} states · stipe Sprint 2 ${report.stipeSprint2?.passedStates||0}/${report.stipeSprint2?.stateCount||0} · perf failures ${report.performanceFailures?.length||0} · memory Δ geom ${report.memory.delta.geometries} · writes ${report.specimenIsolation.networkWrites.length}`;
}