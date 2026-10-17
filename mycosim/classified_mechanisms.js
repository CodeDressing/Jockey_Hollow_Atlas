import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

// MycoSim educational model. Geometry is schematic; not measured molecular structure.
// Each pathway is independently selectable, with evidence provenance shown at every step.
const PATHWAYS={
 serotonin:{
  title:"Conditional serotonergic signaling",
  subtitle:"General psilocin pathway — not proof the photographed specimen contains psilocybin",
  evidence:"Mechanism established for psilocin generally; compound occurrence in this particular specimen untested.",
  steps:[
   ["Psilocybin","If analytically present, the phosphorylated tryptamine enters this conceptual pathway."],
   ["Dephosphorylation","Phosphatases produce psilocin, the pharmacologically active metabolite."],
   ["5-HT2A binding","Psilocin engages serotonin 5-HT2A receptors. Receptor effects are not exclusively 5-HT2A."],
   ["Gq/11 activation","Illustrated canonical receptor coupling; signaling depends on cell context."],
   ["PLC-beta","Phospholipase C-beta hydrolyzes membrane PIP2."],
   ["IP3 + DAG","Second messengers initiate intracellular signaling."],
   ["Ca2+ / PKC","IP3 can mobilize intracellular calcium; DAG helps activate PKC."],
   ["Network effects","Cortical network changes are complex, not reducible to one linear signaling chain."]
  ],
  glow:0x78b9ff,
  publications:[
   ["Hatfield, Valdes & Smith (1978)","https://pubmed.ncbi.nlm.nih.gov/565861/"],
   ["Kusano et al. (1986)","https://doi.org/10.1248/cpb.34.3465"]
  ]
 },
 gymnopilin:{
  title:"Gymnopilin experimental pharmacology",
  subtitle:"Nicotinic acetylcholine receptor assays — PC12 cultured cells",
  evidence:"Experimental cell-model inhibition. Molecular interaction, whole-organism pharmacokinetics and clinical effect size remain unresolved.",
  steps:[
   ["Gymnopilin fraction","Experimental extract/compounds studied in a cell preparation; not a known safe dose."],
   ["Nicotinic receptor","nAChR agonist-evoked responses were inhibited under the reported conditions."],
   ["Membrane current","DMPP-triggered responses were reduced in the cell experiments."],
   ["Calcium transient","Acetylcholine-evoked intracellular Ca2+ response fell about 50% in one assay."],
   ["Selectivity observation","Voltage-gated calcium-channel currents were not inhibited in the tested experiments."],
   ["Human relevance unknown","A cell assay percentage cannot be used to predict human incidence, potency or safe exposure."]
  ],
  glow:0xefad52,
  publications:[
   ["Toxicon study (2014)","https://doi.org/10.1016/j.toxicon.2014.01.014"]
  ]
 }
};
const mat=(color,transparent=false,opacity=1)=>new THREE.MeshStandardMaterial({color,roughness:.43,metalness:.12,transparent,opacity,side:THREE.DoubleSide});
function sphere(radius,color){return new THREE.Mesh(new THREE.SphereGeometry(radius,20,14),mat(color))}
function capsule(radius,length,color){return new THREE.Mesh(new THREE.CapsuleGeometry(radius,length,5,12),mat(color))}
export function mountMechanismSimulator(target){
 if(target.dataset.mounted==="true")return;
 target.dataset.mounted="true";
 const canvas=target.querySelector("canvas");
 const title=target.querySelector("[data-title]");
 const note=target.querySelector("[data-note]");
 const explanation=target.querySelector("[data-explanation]");
 const progress=target.querySelector("[data-progress]");
 const strip=target.querySelector("[data-steps]");
 const evidence=target.querySelector("[data-evidence]");
 const reader=target.querySelector("[data-reader]");
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x081519);
 const camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(1.6,2.5,8.6);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;
 scene.add(new THREE.HemisphereLight(0xcadcec,0x1a3c3b,2));
 const key=new THREE.DirectionalLight(0xfbe3af,3);key.position.set(-3,7,6);scene.add(key);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.target.set(0,0,0);controls.minDistance=4;controls.maxDistance=18;
 // Membrane is a translucent slab. The embedded receptor is intentionally symbolic.
 const membrane=new THREE.Mesh(new THREE.BoxGeometry(7.6,.18,3.2),mat(0x254b51,true,.18));membrane.position.y=-.3;scene.add(membrane);
// A dense paired phospholipid headgroup lattice conveys the bilayer instead of a flat slab.
const lipidHeads=new THREE.InstancedMesh(new THREE.SphereGeometry(.075,10,8),mat(0x5cb8b0),2*35*13);
const dummy=new THREE.Object3D();let li=0;
for(let side of [-1,1])for(let x=0;x<35;x++)for(let z=0;z<13;z++){
 dummy.position.set(-3.65+x*.215,side===1?-.16:-.45,-1.43+z*.23);
 dummy.scale.set(1,.62,1);dummy.updateMatrix();lipidHeads.setMatrixAt(li++,dummy.matrix);
}
lipidHeads.instanceMatrix.needsUpdate=true;scene.add(lipidHeads);
// Visual direction cues are metaphorical, not atomistic receptor structure.
const bilayerCore=new THREE.Mesh(new THREE.BoxGeometry(7.4,.17,3.0),mat(0x21464e,true,.32));bilayerCore.position.y=-.305;scene.add(bilayerCore);
 const protein=new THREE.Group();scene.add(protein);
 const receptorCore=new THREE.Mesh(new THREE.TorusGeometry(.86,.31,16,46),mat(0x9b8bf2));receptorCore.rotation.x=Math.PI/2;receptorCore.position.y=-.19;protein.add(receptorCore);
 for(let i=0;i<5;i++){let angle=i*Math.PI*2/5;let column=capsule(.25,1.1,0x83a7a9);column.position.set(Math.cos(angle)*.77,.08,Math.sin(angle)*.77);protein.add(column)}
 const ligand=sphere(.28,0x93d6ed);ligand.position.set(-2.5,1.4,.3);scene.add(ligand);
 const effector=new THREE.Group();effector.position.set(2,-1.5,0);scene.add(effector);
 const cell=sphere(.62,0x429d97);cell.material.transparent=true;cell.material.opacity=.75;effector.add(cell);
const halo=new THREE.Mesh(new THREE.TorusGeometry(.79,.025,8,64),mat(0x4ccfc8,true,.83));halo.rotation.x=.75;effector.add(halo);
for(let j=0;j<10;j++){const vesicle=sphere(.09,j%2?0xdeb277:0x4bcaec);const a=j*Math.PI*2/10;vesicle.position.set(Math.cos(a)*1.0,.3*Math.sin(j*2),Math.sin(a)*.7);effector.add(vesicle)}

 const particles=[];for(let i=0;i<28;i++){let m=sphere(.048,i%2===0?0xf7cd81:0x8ad1ee);m.position.set((i%7-3)*.45,-1.15-(Math.floor(i/7))*.38,Math.sin(i)*.25);scene.add(m);particles.push(m)}
 const pathwayLines=new THREE.Group();scene.add(pathwayLines);
const signalRail=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-3,2.05,0),new THREE.Vector3(-1.5,2.22,0),new THREE.Vector3(0,2.05,0),new THREE.Vector3(1.5,2.22,0),new THREE.Vector3(3,2.05,0)]),70,.023,7,false),mat(0x508e9c));pathwayLines.add(signalRail);

 const nodes=[];
 for(let i=0;i<7;i++){const marker=sphere(.11,0x4c8a99);marker.position.set(-3+i,2.05,0);pathwayLines.add(marker);nodes.push(marker)}
 let mode="serotonin",step=0,running=false,elapsed=0,raf=0,alive=true,visible=true;
 function renderUI(){
  const p=PATHWAYS[mode],s=p.steps[step];
  title.textContent=p.title;note.textContent=p.subtitle;
  explanation.textContent=s[0]+": "+s[1];
  progress.textContent="Stage "+(step+1)+" of "+p.steps.length;
  strip.replaceChildren();
  p.steps.forEach(([name],i)=>{const button=document.createElement("button");button.type="button";button.textContent=(i+1)+". "+name;button.setAttribute("aria-pressed",String(i===step));button.className=i===step?"active":"";button.addEventListener("click",()=>{step=i;renderUI()});strip.append(button)});
  evidence.replaceChildren();
  const line=document.createElement("p");line.textContent=p.evidence;evidence.append(line);
  for(const [label,url] of p.publications){const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=label;evidence.append(a)}
  target.querySelectorAll("[data-mode]").forEach(btn=>btn.setAttribute("aria-pressed",String(btn.dataset.mode===mode)));
  ligand.material.color.setHex(p.glow);nodes.forEach((n,i)=>n.material.color.setHex(i<=step?p.glow:0x4c8a99));
  protein.rotation.set(0,mode==="gymnopilin"?.24:0,0);
  reader.textContent="Mechanism "+(mode==="serotonin"?"A":"B")+". "+p.title+". Step "+(step+1)+" of "+p.steps.length+". "+s[0]+". "+s[1]+". "+p.evidence;
 }
 target.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{mode=btn.dataset.mode;step=0;renderUI()}));
 target.querySelector("[data-prev]").addEventListener("click",()=>{step=Math.max(0,step-1);renderUI()});
 target.querySelector("[data-next]").addEventListener("click",()=>{step=Math.min(PATHWAYS[mode].steps.length-1,step+1);renderUI()});
 target.querySelector("[data-reset]").addEventListener("click",()=>{step=0;running=false;camera.position.set(1.6,2.5,8.6);controls.target.set(0,0,0);renderUI()});
 target.querySelector("[data-play]").addEventListener("click",e=>{running=!running;e.currentTarget.textContent=running?"Pause animation":"Play animation"});
 target.querySelector("[data-read]").addEventListener("click",()=>{if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(reader.textContent);speech.rate=.9;window.speechSynthesis.speak(speech)});
 const onResize=()=>{const width=Math.max(320,canvas.clientWidth),height=Math.max(260,canvas.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix()};
 const observer=new ResizeObserver(onResize);observer.observe(canvas);onResize();
 const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true});intersection.observe(canvas);
 function animate(t){if(!alive)return;raf=requestAnimationFrame(animate);if(!visible)return;
  const seconds=t*.001;
  ligand.position.x=-2.5+Math.sin(seconds*.6)*.5;
  ligand.position.y=1.25+Math.sin(seconds*.9)*.18;
  for(let i=0;i<particles.length;i++){const m=particles[i];m.position.y=-1.14-Math.floor(i/7)*.35+Math.sin(seconds*2+i*.8)*.07;m.material.opacity=1}
  if(running){elapsed+=.016;if(elapsed>5){elapsed=0;step=(step+1)%PATHWAYS[mode].steps.length;renderUI()}}
  protein.rotation.y+=.0006;controls.update();renderer.render(scene,camera)
 }
 const cleanup=()=>{alive=false;cancelAnimationFrame(raf);observer.disconnect();intersection.disconnect();controls.dispose();renderer.dispose();window.speechSynthesis?.cancel()};
 window.addEventListener("pagehide",cleanup,{once:true});
 renderUI();animate(0);
}
