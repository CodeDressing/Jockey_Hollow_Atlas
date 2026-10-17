import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
// Phase 10: procedural, explicitly schematic anatomical reconstruction.
// Independent opt-in renderer. No direct coupling to species renderer or specimen records.
const host=document.getElementById("trametes-simulator");
if(host&&!document.getElementById("tv-anatomy3d")){
const section=document.createElement("section");
section.id="tv-anatomy3d";
section.setAttribute("aria-label","Phase 10 interactive 3D gastrointestinal and immune cell reconstruction");
section.style.cssText="margin-top:18px;padding:16px;border:1px solid #49615e;border-radius:12px;background:#0b1518;color:#eaf1ed";
section.innerHTML='<style>#tv-anatomy3d h3{color:#f0dca9;margin:5px 0;font-size:19px}#tv-anatomy3d p{font-size:12px;line-height:1.55;color:#c8d6d1}#tv-anatomy3d canvas{display:block;width:100%;height:440px;touch-action:none;background:#0a1417;border-radius:9px}#tv-anatomy3d .anatomy-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(220px,1fr);gap:12px}#tv-anatomy3d .anatomy-controls{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}#tv-anatomy3d button{padding:8px 11px;color:#edf3ec;background:#1b2c2f;border:1px solid #536e69;border-radius:7px;cursor:pointer}#tv-anatomy3d button[aria-pressed=true]{background:#634f29;border-color:#f1d18c}#tv-anatomy3d button:focus-visible{outline:2px solid #f6d689}#tv-anatomy3d .anatomy-info{border:1px solid #3b5355;background:#101f22;padding:12px;border-radius:9px}#tv-anatomy3d .anatomy-info h4{margin:0 0 8px;color:#f0dca9;font-size:15px}#tv-anatomy3d .anatomy-status{font-size:11px;color:#c1d0ca}#tv-anatomy3d .anatomy-warning{border-left:3px solid #ddb978;padding:9px;background:#242018;color:#f1dcb1}#tv-anatomy3d .anatomy-picker{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}@media(max-width:800px){#tv-anatomy3d .anatomy-grid{grid-template-columns:1fr}#tv-anatomy3d canvas{height:350px}}</style>'+
'<div class="kicker">MYCOSIM · PHASE 10 · 3D ANATOMICAL RECONSTRUCTION</div><h3>Human digestion and immune-cell anatomy</h3><p>Interactive procedural 3D schematic: drag to orbit, scroll to zoom, click a structure, then isolate or reveal surrounding layers. Switch between digestive organs and a magnified intestinal immune interface. Relative positions and shapes are simplified for teaching.</p>'+
'<p class="anatomy-warning">Illustrative anatomy, not a patient-specific scan. The immune-cell view does not establish that orally consumed Turkey Tail material reaches the shown receptor.</p>'+
'<div class="anatomy-controls" role="group" aria-label="3D scene mode"><button type="button" data-mode="gut" aria-pressed="true">Digestive organs</button><button type="button" data-mode="cell" aria-pressed="false">Intestinal barrier + immune cell</button><button type="button" data-action="start">Start 3D</button></div>'+
'<div class="anatomy-grid"><div><canvas id="tv-anatomy-canvas" aria-label="Procedural 3D anatomical reconstruction of digestive organs or epithelial barrier and immune cell"></canvas><p class="anatomy-status" id="tv-anatomy-status" role="status">Scene not started. Choose Start 3D.</p></div>'+
'<aside class="anatomy-info"><h4 id="tv-anatomy-name">Digestive organs</h4><p id="tv-anatomy-detail">Select Start 3D, then click any anatomical part.</p><div class="anatomy-picker" role="group" aria-label="Select anatomical structures"></div><div class="anatomy-controls"><button type="button" data-action="isolate" aria-pressed="false">Isolate selected</button><button type="button" data-action="context" aria-pressed="false">Transparent context</button><button type="button" data-action="focus">Focus selection</button><button type="button" data-action="reset">Reset view</button><button type="button" data-action="read">🔊 Read</button></div></aside></div>';
host.append(section);
const canvas=section.querySelector("canvas"),info=section.querySelector("#tv-anatomy-detail"),name=section.querySelector("#tv-anatomy-name"),status=section.querySelector("#tv-anatomy-status");
const modes={gut:[
["stomach","Stomach","Receives swallowed material and mixes it with acidic gastric fluid. This model represents a simplified organ contour."],
["small","Small intestine","Site of much chemical digestion and nutrient absorption. Fungal polysaccharide bioaccessibility depends on preparation and structure."],
["colon","Large intestine","Hosts diverse microbial communities that may process residual dietary polysaccharides. The shape is schematic."],
["lumen","Intestinal lumen","The interior passage through which ingested material moves. Shown as a colored proxy, not a realistic wall cross-section."]
],cell:[
["epithelium","Intestinal epithelium","Polarized epithelial barrier separates luminal content from underlying tissues. This simplified slab does not represent transport rates."],
["mucus","Mucus layer","Protective luminal mucus that helps spatially separate microbes and particulate material from the epithelial surface."],
["membrane","Immune-cell membrane","Lipid bilayer delimiting an illustrative myeloid immune cell. The example cell is not a measured local cellular response to eating mushrooms."],
["receptor","Dectin-1 receptor","Schematic surface receptor recognizing appropriately accessible fungal β-glucan in laboratory systems. Oral access is not established here."],
["cytoplasm","Cytoplasm","Intracellular compartment hosting signaling proteins including SYK and CARD9-associated networks in appropriate experimental contexts."],
["nucleus","Nucleus","DNA-containing compartment; NF-κB may regulate transcription following appropriate cell stimulation."]
]};
let mode="gut",selected="stomach",isolated=false,transparent=false,started=false,renderer=null,scene=null,camera=null,controls=null,root=null,ray=null,resizeObserver=null,raf=0;
let parts=new Map(),meshes=[],geometrySet=new Set(),materialSet=new Set();
const picker=section.querySelector(".anatomy-picker");
function updatePicker(){
 picker.replaceChildren();
 for(const [id,label] of modes[mode]){
  const b=document.createElement("button");b.type="button";b.textContent=label;b.dataset.part=id;b.setAttribute("aria-pressed",String(id===selected));b.onclick=()=>select(id);picker.append(b);
 }
}
function describe(){const entry=modes[mode].find(p=>p[0]===selected)||modes[mode][0];name.textContent=entry[1];info.textContent=entry[2];section.querySelectorAll("[data-part]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.part===selected)));}
function material(color,opacity=1){const m=new THREE.MeshStandardMaterial({color,roughness:.7,metalness:0,transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:opacity===1});materialSet.add(m);return m;}
function add(id,geo,mat,pos,scale,parent=root){geometrySet.add(geo);const obj=new THREE.Mesh(geo,mat);obj.position.set(...pos);if(scale)obj.scale.set(...scale);obj.userData.part=id;parent.add(obj);meshes.push(obj);if(!parts.has(id))parts.set(id,[]);parts.get(id).push(obj);return obj;}
function sphere(id,pos,scale,color){return add(id,new THREE.SphereGeometry(1,24,16),material(color),pos,scale);}
function tube(id,pts,radius,color){const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));return add(id,new THREE.TubeGeometry(curve,Math.max(24,pts.length*10),radius,8,false),material(color),[0,0,0],null);}
function buildGut(){
 sphere("stomach",[-.9,1.1,0],[.65,.92,.43],0xc87975);
 tube("small",[[-.4,.4,0],[.5,.3,0],[.55,-.1,.25],[-.45,-.1,.3],[-.5,-.5,.35],[.55,-.5,.2],[.6,-1.0,0],[-.35,-1.0,.2],[.15,-1.3,0]],.17,0xd7978a);
 tube("colon",[[-1.15,.5,-.1],[-1.25,-.8,-.1],[-.9,-1.55,-.1],[.8,-1.55,-.1],[1.25,-.65,-.1],[1.25,.65,-.1],[.6,.9,-.1]],.24,0x8f9f79);
 tube("lumen",[[-.4,.4,.1],[.5,.3,.1],[.55,-.1,.35],[-.45,-.1,.4],[-.5,-.5,.45],[.55,-.5,.3],[.6,-1, .1]],.055,0xe7c66c);
}
function buildCell(){
 // Four simplified epithelial cells lined horizontally; one selectable barrier layer.
 for(let i=0;i<5;i++){sphere("epithelium",[-2.25+i*1.12,1.05,0],[.48,.67,.38],0xb2c8bf);}
 add("mucus",new THREE.BoxGeometry(5.7,.23,.95),material(0x7eb8b1,.55),[0,1.92,0],null);
 sphere("membrane",[0,-.85,0],[1.6,1.03,.7],0x6aada8);
 sphere("cytoplasm",[0,-.85,.1],[1.47,.91,.64],0x32716e);
 sphere("nucleus",[.4,-1,.62],[.47,.38,.28],0xc8a6ce);
 const body=sphere("receptor",[-.7,.03,.18],[.16,.29,.16],0xf0cf8a);
 body.rotation.z=-.28;
 sphere("receptor",[-.78,.4,.19],[.22,.17,.18],0xf0cf8a);
}
function releaseGeometry(){
 if(root)scene.remove(root);
 for(const geo of geometrySet)geo.dispose();
 for(const mat of materialSet)mat.dispose();
 geometrySet.clear();materialSet.clear();parts.clear();meshes=[];
}
function rebuild(){
 if(!started)return;
 releaseGeometry();root=new THREE.Group();scene.add(root);
 if(mode==="gut")buildGut();else buildCell();
 controls.target.set(0,0,0);camera.position.set(4,2.5,7);controls.update();
 applyVisibility();describe();
}
function applyVisibility(){
 for(const [id,objects] of parts)for(const obj of objects){
  const on=!isolated||id===selected;obj.visible=on;
  if(obj.material){const fade=transparent&&id!==selected;obj.material.transparent=fade||id==="mucus";obj.material.opacity=fade?.14:(id==="mucus"?.55:1);obj.material.depthWrite=!obj.material.transparent;obj.material.needsUpdate=true;}
 }
 section.querySelector('[data-action="isolate"]').setAttribute("aria-pressed",String(isolated));
 section.querySelector('[data-action="context"]').setAttribute("aria-pressed",String(transparent));
}
function select(id){if(!modes[mode].some(p=>p[0]===id))return;selected=id;describe();if(started)applyVisibility();}
function changeMode(next){mode=next;selected=modes[mode][0][0];isolated=false;transparent=false;section.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mode===mode)));updatePicker();if(started)rebuild();else describe();}
function resize(){if(!renderer)return;const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
function init(){
 if(started)return;
 try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x0b171a);
  camera=new THREE.PerspectiveCamera(47,1,.1,100);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minDistance=1.5;controls.maxDistance=17;
  scene.add(new THREE.HemisphereLight(0xd9edeb,0x625048,2));
  const light=new THREE.DirectionalLight(0xffe9cf,2);light.position.set(3,7,6);scene.add(light);
  ray=new THREE.Raycaster();started=true;resize();rebuild();
  resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
  canvas.addEventListener("click",pick);
  const loop=()=>{if(!started)return;if(!document.hidden&&!section.hidden){controls.update();renderer.render(scene,camera);}raf=requestAnimationFrame(loop);};loop();
  status.textContent="3D ready · "+mode+" model. Click a structure or use the selection controls.";
  section.querySelector('[data-action="start"]').disabled=true;
 }catch(e){status.textContent="3D initialization failed: "+String(e?.message||e);console.error(e);dispose();}
}
function pick(event){
 if(!started)return;
 const box=canvas.getBoundingClientRect(),pointer=new THREE.Vector2((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);
 ray.setFromCamera(pointer,camera);
 const hits=ray.intersectObjects(meshes.filter(m=>m.visible),false);if(hits.length)select(hits[0].object.userData.part);
}
function focus(){if(!started)return;const objects=parts.get(selected)||[];if(!objects.length)return;const box=new THREE.Box3();objects.forEach(o=>box.expandByObject(o));const point=box.getCenter(new THREE.Vector3());const dist=Math.max(2.1,box.getSize(new THREE.Vector3()).length()*1.7);controls.target.copy(point);camera.position.copy(point).add(new THREE.Vector3(dist*.65,dist*.5,dist));controls.update();}
function reset(){isolated=false;transparent=false;if(started){rebuild();}else{describe();section.querySelector('[data-action="isolate"]').setAttribute("aria-pressed","false");section.querySelector('[data-action="context"]').setAttribute("aria-pressed","false");}}
function dispose(){started=false;cancelAnimationFrame(raf);resizeObserver?.disconnect();canvas.removeEventListener("click",pick);if(scene)releaseGeometry();controls?.dispose();renderer?.dispose();renderer=null;scene=null;}
section.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>changeMode(b.dataset.mode));
section.querySelector('[data-action="start"]').onclick=init;
section.querySelector('[data-action="isolate"]').onclick=()=>{isolated=!isolated;if(started)applyVisibility();};
section.querySelector('[data-action="context"]').onclick=()=>{transparent=!transparent;if(started)applyVisibility();};
section.querySelector('[data-action="focus"]').onclick=focus;
section.querySelector('[data-action="reset"]').onclick=reset;
section.querySelector('[data-action="read"]').onclick=()=>{if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(name.textContent+". "+info.textContent);u.rate=.86;window.speechSynthesis.speak(u);};
window.addEventListener("pagehide",dispose,{once:true});
// Opt-in browser diagnostics; these manipulate only this independent 3D scene.
const qaButton=document.createElement("button");qaButton.type="button";qaButton.textContent="Run Phase 10 3D QA";
const qaOutput=document.createElement("pre");qaOutput.setAttribute("role","status");
qaOutput.style.cssText="white-space:pre-wrap;font:11px/1.5 monospace;background:#0d1d20;border:1px solid #47605d;padding:10px;border-radius:8px;overflow:auto";
qaOutput.textContent="3D QA not yet run.";
const qaBox=document.createElement("div");qaBox.style.marginTop="12px";qaBox.append(qaButton,qaOutput);section.append(qaBox);
qaButton.onclick=()=>{
 const oldMode=mode,oldSelected=selected,oldIsolated=isolated,oldTransparent=transparent;
 const results=[],check=(label,pass)=>results.push({label,pass:Boolean(pass)});
 qaButton.disabled=true;
 try{
  init();
  check("WebGL initialized",started&&Boolean(renderer&&scene&&camera&&controls));
  if(started){renderer.render(scene,camera);}
  check("Canvas dimensions valid",Boolean(renderer&&canvas.width>0&&canvas.height>0));
  check("GPU draw calls occurred",Boolean(renderer&&renderer.info.render.calls>0));
  check("Digestive and immune modes registered",modes.gut.length===4&&modes.cell.length===6);
  for(const sceneMode of ["gut","cell"]){
   changeMode(sceneMode);
   check(sceneMode+" expected mesh categories",modes[sceneMode].every(p=>parts.has(p[0])&&parts.get(p[0]).length>0));
   check(sceneMode+" geometry built",meshes.length>0&&geometrySet.size>0);
   const target=modes[sceneMode][0][0];
   select(target);isolated=true;transparent=false;applyVisibility();
   check(sceneMode+" isolate selected",meshes.every(o=>o.visible===(o.userData.part===target)));
   isolated=false;transparent=true;applyVisibility();
   check(sceneMode+" context transparency",meshes.some(o=>o.userData.part!==target&&o.material.opacity<1));
   focus();
   check(sceneMode+" focus camera valid",camera.position.toArray().every(Number.isFinite));
  }
  reset();check("Reset restores visible meshes",meshes.every(o=>o.visible));
  check("Reset clears isolation and transparency",!isolated&&!transparent);
  check("Mode buttons expose state",section.querySelectorAll("[data-mode][aria-pressed=true]").length===1);
  check("Accessible structure selections",Array.from(picker.querySelectorAll("button")).every(b=>b.getAttribute("aria-pressed")!==null));
  check("Original fungal canvas preserved",Boolean(document.getElementById("tv-canvas")));
  check("Phase 9 biology retained",Boolean(document.getElementById("tv-biology")));
 }catch(e){results.push({label:"Unexpected exception: "+String(e),pass:false});}
 finally{
  changeMode(oldMode);select(oldSelected);isolated=oldIsolated;transparent=oldTransparent;if(started)applyVisibility();
  qaButton.disabled=false;
 }
 const count=results.filter(r=>r.pass).length;
 qaOutput.textContent="Phase 10 browser checks: "+count+"/"+results.length+" passed\n"+
 results.map(r=>(r.pass?"PASS ":"FAIL ")+r.label).join("\n")+
 "\nScope: WebGL creation, DOM controls, geometry, selection and visibility. Does not confirm medical anatomical fidelity, FPS endurance or production deployment.";
 qaOutput.style.borderColor=count===results.length?"#4e815d":"#b8655a";
};
changeMode("gut");
}
