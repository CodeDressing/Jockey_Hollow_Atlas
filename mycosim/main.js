import {MORPHOLOGY_PROFILES,PROFILE_BY_ID} from "./profiles.js";
import {MORPHOLOGY_VARIANTS,DEFAULT_VARIANTS,variantLabel} from "./variants.js";
import {MycoSimEngine} from "./engine.js";

const $=s=>document.querySelector(s);
const canvas=$("#stage"), status=$("#modelStatus"), info=$("#structureInfo"), stats=$("#engineStats");
const actions=$("#structureActions"), variantControls=$("#variantControls"), anatomyList=$("#anatomyList");
let selected=null,currentProfile=MORPHOLOGY_PROFILES[0];

function showError(err){
  status.textContent="3D engine error";
  status.style.color="#ff9b9b";
  info.textContent=err?.message||String(err);
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

try{
  const engine=new MycoSimEngine({
    canvas,
    onHover:meta=>{ if(meta&&!selected) info.textContent="Hover: "+meta.label+" · "+meta.id; },
    onSelect:meta=>{ selected=meta; info.textContent="Selected: "+meta.label+" · "+meta.id; actions.hidden=false; },
    onStatus:t=>status.textContent=t,
    onStats:s=>{if(stats)stats.textContent=`${s.fps} FPS · ${s.objects} objects · ${s.drawCalls} draw calls`;}
  });

  const grid=$("#modelGrid");
  grid.innerHTML=MORPHOLOGY_PROFILES.map((p,i)=>`<button class="model-pick ${i===0?"active":""}" data-model="${p.id}"><strong>${p.label}</strong><span>${p.description}</span></button>`).join("");

  function activateProfile(id){
    const p=PROFILE_BY_ID[id]; if(!p)return;
    currentProfile=p; selected=null; actions.hidden=true; info.textContent="Loading morphology model…";
    engine.loadProfile(id);
    renderVariantControls(p,engine);
    renderAnatomy(p);
    $("#profileName").textContent=p.label.toUpperCase();
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
  });

  anatomyList.addEventListener("click",e=>{
    const row=e.target.closest("[data-anatomy]"); if(!row)return;
    const a=currentProfile.anatomy.find(x=>x.id===row.dataset.anatomy);
    if(!a)return;
    selected=a; actions.hidden=false; info.textContent="Selected from anatomy index: "+a.label+" · "+a.id;
    engine.focus(a.id);
  });

  document.querySelectorAll(".mode").forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
    engine.setMode(btn.dataset.mode);
  });

  $("#focusStructure").onclick=()=>selected&&engine.focus(selected.id);
  $("#isolateStructure").onclick=()=>selected&&engine.isolate(selected.id);
  $("#hideStructure").onclick=()=>selected&&engine.hide(selected.id);
  $("#transparentStructure").onclick=()=>selected&&engine.setTransparent(selected.id,.22);
  $("#resetStructure").onclick=()=>{engine.clearIsolation(); if(selected)engine.show(selected.id); engine.applyMode();};

  activateProfile(MORPHOLOGY_PROFILES[0].id);
  window.addEventListener("pagehide",()=>engine.dispose(),{once:true});
}catch(err){console.error(err);showError(err);}
