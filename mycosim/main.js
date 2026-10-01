import {MORPHOLOGY_PROFILES} from "./profiles.js";
import {MycoSimEngine} from "./engine.js";

const $=s=>document.querySelector(s);
const canvas=$("#stage"), status=$("#modelStatus"), info=$("#structureInfo"), stats=$("#engineStats");
const actions=$("#structureActions");
let selected=null;

function showError(err){
  status.textContent="3D engine error";
  status.style.color="#ff9b9b";
  info.textContent=err?.message||String(err);
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
  grid.addEventListener("click",e=>{
    const b=e.target.closest("[data-model]"); if(!b)return;
    grid.querySelectorAll(".model-pick").forEach(x=>x.classList.remove("active")); b.classList.add("active");
    selected=null; actions.hidden=true; info.textContent="Loading morphology model…";
    engine.loadProfile(b.dataset.model);
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

  engine.loadProfile(MORPHOLOGY_PROFILES[0].id);
  window.addEventListener("pagehide",()=>engine.dispose(),{once:true});
}catch(err){console.error(err);showError(err);}
