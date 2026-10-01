import {MORPHOLOGY_PROFILES,PROFILE_BY_ID} from "./profiles.js";
import {MORPHOLOGY_VARIANTS,variantLabel} from "./variants.js";
import {KNOWLEDGE_OBJECTS,getKnowledge,getPathFor,childKnowledge} from "./knowledge.js";
import {MycoSimEngine} from "./engine.js";

const $=s=>document.querySelector(s);
const canvas=$("#stage"), status=$("#modelStatus"), info=$("#structureInfo"), stats=$("#engineStats");
const actions=$("#structureActions"), variantControls=$("#variantControls"), anatomyList=$("#anatomyList");
const breadcrumbs=$("#breadcrumbs"), eduTitle=$("#eduTitle"), eduLevel=$("#eduLevel"), eduBody=$("#eduBody");
const eduRelations=$("#eduRelations"), eduChildren=$("#eduChildren"), eduPronounce=$("#eduPronounce");
const eduRead=$("#eduRead"), orientation=$("#orientationLabel");
let selected=null,currentProfile=MORPHOLOGY_PROFILES[0],knowledgeMode="beginner",currentKnowledge=getKnowledge("basidiome");

function showError(err){
  status.textContent="3D engine error";
  status.style.color="#ff9b9b";
  info.textContent=err?.message||String(err);
}

function speak(text){
  if(!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.rate=.92;u.pitch=1;u.lang="en-US";
  speechSynthesis.speak(u);
}

function renderAnatomy(profile){
  anatomyList.innerHTML=(profile.anatomy||[]).map(a=>`<button class="structure anatomy-row" data-anatomy="${a.id}"><strong>${a.label}</strong><span>${a.description}</span><code>${a.id}</code></button>`).join("");
}

function renderVariantControls(profile,engine){
  const supported=new Set(profile.variantGroups||[]);
  variantControls.innerHTML="";
  if(!supported.size){
    variantControls.innerHTML='<p class="copy compact">This architecture has its own body plan and does not use agaricoid character assumptions.</p>';
    return;
  }
  const state=engine.getVariantState();
  for(const [group,def] of Object.entries(MORPHOLOGY_VARIANTS)){
    if(!supported.has(group)) continue;
    const wrap=document.createElement("label");
    wrap.className="variant-field";
    wrap.innerHTML=`<span>${def.label}</span><select data-variant="${group}">${def.options.map(([id,label])=>`<option value="${id}" ${state[group]===id?"selected":""}>${label}</option>`).join("")}</select>`;
    variantControls.appendChild(wrap);
  }
}

function knowledgeForAnatomy(id){
  if(KNOWLEDGE_OBJECTS[id]) return id;
  if(id==="veil_structure")return "veil_structure";
  if(id==="tube_layer")return "tube_layer";
  if(id==="context")return "context";
  return id;
}

function renderKnowledge(id,engine,{moveCamera=true}={}){
  currentKnowledge=getKnowledge(id);
  const path=getPathFor(currentProfile.id,id);
  breadcrumbs.innerHTML=path.map((pid,i)=>{
    const k=getKnowledge(pid);
    return `<button data-crumb="${pid}" class="crumb">${k.label}</button>${i<path.length-1?'<span>›</span>':''}`;
  }).join("");
  eduTitle.textContent=currentKnowledge.label;
  eduLevel.textContent=currentKnowledge.level.toUpperCase();
  eduBody.textContent=knowledgeMode==="expert"?currentKnowledge.expert:currentKnowledge.beginner;
  eduPronounce.textContent="Pronounce "+currentKnowledge.label;
  eduRelations.innerHTML=(currentKnowledge.relationships||[]).length
    ? currentKnowledge.relationships.map(r=>`<button class="relation-chip" data-knowledge="${r}">${getKnowledge(r).label}</button>`).join("")
    : '<span class="muted-mini">No relationship links authored yet.</span>';
  const kids=childKnowledge(currentProfile.id,id);
  eduChildren.innerHTML=kids.length
    ? kids.map(k=>`<button class="knowledge-child" data-knowledge="${k.id}"><strong>${k.label}</strong><span>${k.level}</span></button>`).join("")
    : '<span class="muted-mini">End of this navigation branch.</span>';
  orientation.textContent=`${currentProfile.label} · ${currentKnowledge.label}`;

  if(moveCamera){
    const macroId=id==="lamella"?"hymenophore":id==="pore_surface"?"hymenophore":id;
    if(engine.objects.has(macroId)){
      engine.clearKnowledgeProxy();
      engine.contextualTransparency(macroId,.12);
      engine.flyTo(macroId);
    }else{
      engine.setMode("micro");
      const parentPath=path.slice().reverse().find(x=>engine.objects.has(x));
      if(parentPath)engine.contextualTransparency(parentPath,.1);
      engine.showKnowledgeProxy(id);
    }
  }
}

try{
  const engine=new MycoSimEngine({
    canvas,
    onHover:meta=>{
      if(meta&&!selected){
        const k=getKnowledge(knowledgeForAnatomy(meta.id));
        info.textContent="Hover: "+k.label+" — "+k.beginner;
      }
    },
    onSelect:meta=>{
      selected=meta; actions.hidden=false;
      info.textContent="Selected: "+meta.label+" · "+meta.id;
      renderKnowledge(knowledgeForAnatomy(meta.id),engine);
    },
    onStatus:t=>status.textContent=t,
    onStats:s=>{if(stats)stats.textContent=`${s.fps} FPS · ${s.objects} objects · ${s.drawCalls} draw calls`;}
  });

  const grid=$("#modelGrid");
  grid.innerHTML=MORPHOLOGY_PROFILES.map((p,i)=>`<button class="model-pick ${i===0?"active":""}" data-model="${p.id}"><strong>${p.label}</strong><span>${p.description}</span></button>`).join("");

  function activateProfile(id){
    const p=PROFILE_BY_ID[id]; if(!p)return;
    currentProfile=p; selected=null; actions.hidden=true;
    info.textContent="Loading morphology model…";
    engine.loadProfile(id);
    renderVariantControls(p,engine);
    renderAnatomy(p);
    $("#profileName").textContent=p.label.toUpperCase();
    renderKnowledge("basidiome",engine,{moveCamera:false});
    orientation.textContent=p.label+" · Whole basidiome";
  }

  grid.addEventListener("click",e=>{
    const b=e.target.closest("[data-model]"); if(!b)return;
    grid.querySelectorAll(".model-pick").forEach(x=>x.classList.remove("active")); b.classList.add("active");
    activateProfile(b.dataset.model);
  });

  variantControls.addEventListener("change",e=>{
    const select=e.target.closest("[data-variant]"); if(!select)return;
    selected=null; actions.hidden=true;
    engine.setVariant(select.dataset.variant,select.value);
    info.textContent=`${MORPHOLOGY_VARIANTS[select.dataset.variant].label}: ${variantLabel(select.dataset.variant,select.value)}`;
    renderAnatomy(currentProfile);
    renderKnowledge("basidiome",engine,{moveCamera:false});
  });

  anatomyList.addEventListener("click",e=>{
    const row=e.target.closest("[data-anatomy]"); if(!row)return;
    const a=currentProfile.anatomy.find(x=>x.id===row.dataset.anatomy);
    if(!a)return;
    selected=a; actions.hidden=false; info.textContent="Selected from anatomy index: "+a.label+" · "+a.id;
    renderKnowledge(knowledgeForAnatomy(a.id),engine);
  });

  document.querySelectorAll(".mode").forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
    engine.setMode(btn.dataset.mode);
  });

  $("#explodedToggle").onclick=()=>{
    const active=$("#explodedToggle").classList.toggle("active");
    engine.setExploded(active);
  };
  $("#sectionToggle").onclick=()=>{
    const active=$("#sectionToggle").classList.toggle("active");
    engine.setSection(active);
  };
  $("#contextToggle").onclick=()=>{
    const active=$("#contextToggle").classList.toggle("active");
    if(active&&currentKnowledge)engine.contextualTransparency(currentKnowledge.id,.12); else engine.applyMode();
  };
  $("#wholeView").onclick=()=>{
    selected=null;actions.hidden=true;engine.resetPresentation();engine.clearKnowledgeProxy();
    renderKnowledge("basidiome",engine,{moveCamera:false});
    engine.camera.position.set(5.2,3.3,7.4);engine.controls.target.set(0,1.45,0);engine.controls.update();
  };

  $("#focusStructure").onclick=()=>selected&&engine.focus(selected.id);
  $("#isolateStructure").onclick=()=>selected&&engine.isolate(selected.id);
  $("#hideStructure").onclick=()=>selected&&engine.hide(selected.id);
  $("#transparentStructure").onclick=()=>selected&&engine.setTransparent(selected.id,.22);
  $("#resetStructure").onclick=()=>{engine.resetPresentation();if(selected)engine.show(selected.id);};

  breadcrumbs.addEventListener("click",e=>{
    const b=e.target.closest("[data-crumb]");if(b)renderKnowledge(b.dataset.crumb,engine);
  });
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-knowledge]");if(b)renderKnowledge(b.dataset.knowledge,engine);
  });

  document.querySelectorAll("[data-knowledge-mode]").forEach(btn=>btn.onclick=()=>{
    knowledgeMode=btn.dataset.knowledgeMode;
    document.querySelectorAll("[data-knowledge-mode]").forEach(x=>x.classList.toggle("active",x===btn));
    renderKnowledge(currentKnowledge.id,engine,{moveCamera:false});
  });

  eduPronounce.onclick=()=>speak(currentKnowledge.pronunciation||currentKnowledge.label);
  eduRead.onclick=()=>speak(`${currentKnowledge.label}. ${knowledgeMode==="expert"?currentKnowledge.expert:currentKnowledge.beginner}`);

  activateProfile(MORPHOLOGY_PROFILES[0].id);
  window.addEventListener("pagehide",()=>engine.dispose(),{once:true});
}catch(err){console.error(err);showError(err);}
