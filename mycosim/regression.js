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
          result.modePreserved,result.fpsAcceptable,result.performancePass
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
      pass:failed.length===0&&memory.pass&&mobile.pass&&specimenIsolation.pass&&campaign.pass,
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
  return `${status} · ${report.passedCombinations}/${report.totalCombinations} family×stage combinations · campaign ${report.campaign?.stateCount||0}/${report.campaign?.expectedStateCount||0} states · perf failures ${report.performanceFailures?.length||0} · memory Δ geom ${report.memory.delta.geometries} · writes ${report.specimenIsolation.networkWrites.length}`;
}
