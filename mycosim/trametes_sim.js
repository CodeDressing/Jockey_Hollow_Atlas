import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
// MycoSim species-extension prototype: stand-alone opt-in scene; does not change existing engine state.
// Stable namespace: jha:tv:1. Educational procedural reconstruction, NOT a field-identification record.
const host=document.getElementById("trametes-simulator");
if(host){
const canvas=host.querySelector("canvas"),info=host.querySelector("#tv-info"),steps=host.querySelector("#tv-steps"),stage=host.querySelector("#tv-stage");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:"low-power"});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));renderer.setClearColor(0x0b1417);
renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0b1417);
const camera=new THREE.PerspectiveCamera(45,1,.1,80);camera.position.set(5.6,4.2,7.6);
const control=new OrbitControls(camera,canvas);control.enableDamping=true;control.minDistance=3;control.maxDistance=16;control.target.set(0,.3,0);
scene.add(new THREE.HemisphereLight(0xc5e4ed,0x60422b,2.1));
const light=new THREE.DirectionalLight(0xffeed1,2.0);light.position.set(5,8,6);scene.add(light);
const root=new THREE.Group();scene.add(root);
const materials=[],parts=new Map(),pickables=[],ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
let selected="pileus",translucent=false,isolated=false,stageIndex=1,hidden=new Set(),running=true;
const MAT=(color,opacity=1)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.9,side:THREE.DoubleSide,transparent:opacity<1,opacity});materials.push(m);return m;};
const dark=MAT(0x493627),wood=MAT(0x987553),pale=MAT(0xe4ddc9),fibers=MAT(0xdcc59c),mycelium=MAT(0xd0c9a9),spore=MAT(0xefe5d2);
const bands=[0x624534,0xb1a076,0x454b46,0x987a55,0x392f2c,0xc2b99a,0x6e5441].map(c=>MAT(c));
function add(id,obj){obj.userData.part=id;root.add(obj);pickables.push(obj);if(!parts.has(id))parts.set(id,[]);parts.get(id).push(obj);return obj;}
function rng(i){const n=Math.sin(i*133.37+31)*43758.545;return n-Math.floor(n);}
function branch(a,b,r,material,id){const d=new THREE.Vector3().subVectors(b,a),m=new THREE.Mesh(new THREE.CylinderGeometry(r*.8,r,d.length(),6),material);m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return add(id,m);}
function makeLog(){
const bark=new THREE.Mesh(new THREE.CylinderGeometry(.82,.9,6,18,9),dark);bark.rotation.z=Math.PI/2;bark.position.y=-.48;add("bark",bark);
const core=new THREE.Mesh(new THREE.CylinderGeometry(.74,.79,6.04,28),wood);core.rotation.z=Math.PI/2;core.position.y=-.48;add("wood",core);
for(let i=0;i<52;i++){const x=-2.85+rng(i)*5.7,t=rng(i+70)*Math.PI*2;const a=new THREE.Vector3(x,-.48+Math.cos(t)*.88,Math.sin(t)*.88),b=a.clone().add(new THREE.Vector3(.12+rng(i+12)*.48,.015,.015));branch(a,b,.012,dark,"bark");}
for(let i=0;i<25;i++){const x=-2.5+rng(i+19)*5,y=-.48+.2*(rng(i+45)-.5),z=.2*(rng(i+47)-.5);const a=new THREE.Vector3(x,y,z),b=new THREE.Vector3(x+.38*rng(i+8),y+.15*(rng(i+42)-.5),z+.3*(rng(i+32)-.5));branch(a,b,.009,mycelium,"mycelium");}
}
function bracketGeometry(width,depth,thickness=.085,underside=false){
const vertices=[],indices=[],cols=42,rows=20;
for(let k=0;k<=rows;k++){const u=k/rows;for(let j=0;j<=cols;j++){const v=j/cols,angle=(v-.5)*Math.PI*.96;
const radial=depth*(.06+.94*u)*(1+.055*Math.sin(7*angle+3*u));
const x=Math.sin(angle)*width*(.14+.86*u);
const z=radial*Math.cos(angle);
const y=.12+.20*(1-u*u)-.055*u*u+.018*Math.sin(10*u+angle*3);
vertices.push(x,y-(underside?thickness*(.55+.45*u):0),z);
if(k<rows&&j<cols){const q=k*(cols+1)+j;indices.push(q,q+cols+1,q+1,q+1,q+cols+1,q+cols+2);}
}}
const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
function makeBracket(i){
const x=-2.45+i*.55+(.14*rng(i+8)),a=(i%3-1)*.18,scale=.64+.55*rng(i+6);
const group=new THREE.Group();group.position.set(x,.24+.2*(i%2),.38);group.rotation.y=a;group.rotation.x=(rng(i+11)-.5)*.18;root.add(group);
for(let j=0;j<7;j++){const geo=bracketGeometry(1.12*scale*(.93+.01*j),1.27*scale*(.93+.01*j));const attr=geo.attributes.position, colors=[],col=new THREE.Color(bands[j].color);
for(let v=0;v<attr.count;v++){const pos=attr.getZ(v)/Math.max(.2,1.27*scale);let c=bands[Math.min(6,Math.floor(Math.max(0,pos)*7))].color.clone();c.lerp(col,.16);colors.push(c.r,c.g,c.b);}
geo.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
const mat=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.97});materials.push(mat);
const m=new THREE.Mesh(geo,mat);m.position.y=j*.003;m.userData.part="pileus";group.add(m);pickables.push(m);if(!parts.has("pileus"))parts.set("pileus",[]);parts.get("pileus").push(m);if(j!==0)break;
}
const underside=new THREE.Mesh(bracketGeometry(1.08*scale,1.23*scale,.095,true),pale);underside.userData.part="hymenophore";group.add(underside);pickables.push(underside);parts.get("hymenophore")?.push(underside)||parts.set("hymenophore",[underside]);
for(let h=0;h<8;h++){const u=.25+h*.09,ang=(h%2?1:-1)*(.12+h*.05);const a=new THREE.Vector3(Math.sin(ang)*u,.13-.095,Math.cos(ang)*u),b=a.clone().add(new THREE.Vector3(.02,0,.11));const line=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.12,5),fibers);line.position.copy(a).add(b).multiplyScalar(.5);line.rotation.x=Math.PI/2;line.userData.part="tubes";group.add(line);pickables.push(line);parts.get("tubes")?.push(line)||parts.set("tubes",[line]);}
}
makeLog();for(let i=0;i<9;i++)makeBracket(i);
const content={
bark:["Bark and decaying hardwood","Cracked outer protection of dead hardwood. The underlying wood is decomposed by fungal extracellular enzymes. Bark placement and cracks are procedural approximations.","macroscopic reconstruction"],
wood:["Hardwood substrate","White-rot fungi modify lignin and depolymerize cellulose and hemicellulose using extracellular oxidoreductases and hydrolases. This diagram does not identify tree species.","macroscopic reconstruction"],
mycelium:["Vegetative mycelium","Threadlike hyphae colonize the wood internally. The displayed strands are inferred, oversized proxies rather than imaged internal networks.","inferred internal structure"],
pileus:["Zoned upper pileus","Thin overlapping fanlike brackets bear concentric pigmentation and surface texture. Color alone cannot confirm Trametes versicolor.","macroscopic reconstruction"],
hymenophore:["Poroid hymenophore","The usually pale underside contains many minute pores that open into short tubes lined with fertile hymenium. Pores are represented here by a smooth proxy at this scale.","macroscopic reconstruction"],
tubes:["Hymenial tubes","Magnified proxy representing tubes, basidia and basidiospore-bearing structures. Actual basidia and spores require microscopy.","magnified schematic proxy"]
};
function show(id){selected=id;const c=content[id]||content.pileus;info.textContent=c[0]+". "+c[1]+" Evidence / scale: "+c[2]+".";host.querySelectorAll("[data-tv-part]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tvPart===id)));}
function visibility(){for(const [id,list] of parts){for(const o of list){o.visible=!hidden.has(id)&&(!isolated||id===selected);if(o.material){o.material.transparent=translucent&&id!=="pileus";o.material.opacity=translucent&&id!=="pileus"?.24:1;o.material.needsUpdate=true;}}}}
const life=["Spore dispersal","Germination","Compatible hyphal interaction","Dikaryotic mycelium","Wood colonization","Primordia","Bracket development","Mature pore production","Spore release","Aging and decomposition"];
const farm=["Forest","Verified identification","Harvest","Processing","Drying","Milling","Packaging","Consumption","Digestion","Microbiome","Immune recognition hypotheses","Evidence interpretation"];
let flow="life",step=0;
// Each stop has a narrated lesson; these are conceptual sequences, not quantitative predictions.
const lifeLessons=[
"Basidiospores are produced on fertile basidia lining the pores beneath mature brackets. Air movement disperses spores; release is not represented at real scale.",
"A viable basidiospore can germinate under suitable moisture, temperature and substrate conditions, producing an initial hyphal network.",
"Compatible mating-type interactions may establish a fertile dikaryotic mycelium. Pairing depends on fungal mating systems, not merely proximity.",
"Dikaryotic hyphae grow through suitable substrate. This hidden network is distinct from the visible bracket fruiting body.",
"Extracellular enzymes depolymerize wood components. As a white-rot fungus, T. versicolor can modify lignin and other cell-wall polymers.",
"Environmental and developmental cues can initiate small fruiting-body primordia; exact triggers and timing vary.",
"Thin, overlapping bracket-shaped fruiting bodies expand and develop concentric surface zones. Pigment bands alone are not diagnostic.",
"The underside develops a poroid hymenophore. Microscopic basidia line fertile surfaces inside pores and tubes.",
"Mature basidia form basidiospores through meiosis and release them for dispersal. The 3D scene is not a calibrated spore model.",
"Older brackets can weather, dry or be colonized by other organisms while the wood-decay community continues to change."
];
const farmLessons=[
"Observe the fungus on its original wood substrate. Document host tree, locality, context and multiple views before removing any material.",
"Identification requires multiple characters, including the fine-pored underside, thin zoned brackets and exclusion of look-alikes. This simulator cannot verify an actual specimen.",
"Record collection date, site, collector, condition and a traceable lot identifier. Avoid unsafe or contaminated collection sites.",
"Separate and inspect material; track any cleaning, trimming and processing operations by lot. Never treat appearance alone as a contamination test.",
"Drying reduces water activity when validated and performed correctly. Actual shelf stability requires process controls; the scene cannot certify a batch.",
"Milling changes particle size but does not automatically make every fungal polymer bioavailable. Processing and extraction methods influence composition.",
"Record species identification, ingredients, processing method, net weight, lot and appropriate safety information; distinguish a raw powder from a standardized extract.",
"Ingestion introduces complex fungal material into the gastrointestinal tract. Oral exposure is not equivalent to applying purified β-glucan directly to immune cells.",
"Digestive conditions and the food matrix affect release and transit. Not all mushroom polysaccharides are absorbed intact across the intestinal barrier.",
"Microbes may transform some dietary polysaccharides. Species, molecular structure and individual microbiomes affect these interactions.",
"Some accessible fungal β-glucans are recognized by receptors such as Dectin-1, which can signal through SYK and CARD9 pathways in experimental settings. Oral Turkey Tail powder is not proven to trigger the same response in humans.",
"Distinguish cell studies, animal experiments and clinical trials. PSK and PSP preparations cannot be assumed equivalent to ordinary Turkey Tail powders; no cancer treatment claim is implied."
];
function updateStep(){
const a=flow==="life"?life:farm;
const detail=(flow==="life"?lifeLessons:farmLessons)[step];
steps.textContent=(step+1)+"/"+a.length+" · "+a[step];
stage.textContent=detail+" Educational reconstruction; not a specimen ID, processing validation or clinical recommendation.";
}
host.querySelector("#tv-next").onclick=()=>{step=(step+1)%(flow==="life"?life.length:farm.length);updateStep()};
host.querySelector("#tv-prev").onclick=()=>{step=(step-1+(flow==="life"?life.length:farm.length))%(flow==="life"?life.length:farm.length);updateStep()};
host.querySelector("#tv-flow").onchange=e=>{flow=e.target.value;step=0;updateStep()};
host.querySelectorAll("[data-tv-part]").forEach(b=>b.onclick=()=>show(b.dataset.tvPart));
host.querySelector("#tv-isolate").onclick=()=>{isolated=!isolated;visibility()};
host.querySelector("#tv-hide").onclick=()=>{hidden.add(selected);visibility()};
host.querySelector("#tv-transparent").onclick=()=>{translucent=!translucent;visibility()};
host.querySelector("#tv-reset").onclick=()=>{hidden.clear();isolated=false;translucent=false;control.reset();visibility()};
host.querySelector("#tv-speak").onclick=()=>{if("speechSynthesis" in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(info.textContent);u.rate=.86;speechSynthesis.speak(u)}};
host.querySelector("#tv-immune").onclick=()=>{info.textContent="Mechanistic teaching link: accessible fungal β-glucan → Dectin-1/CLEC7A → hemITAM phosphorylation → SYK → CARD9–BCL10–MALT1 → IKK → NF-κB → context-dependent transcription. This is not proof the same cascade is activated by oral Turkey Tail powder."};
const ro=new ResizeObserver(()=>{const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()});ro.observe(canvas);
canvas.addEventListener("pointerup",e=>{const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(pickables.filter(o=>o.visible),false);if(hits.length)show(hits[0].object.userData.part);});
function tick(){if(!running)return;const visible=!document.hidden&&host.dataset.activeLab==="specimen"&&host.dataset.specimenFamily==="trametes_versicolor"&&canvas.getClientRects().length>0;if(visible){control.update();renderer.render(scene,camera);}requestAnimationFrame(tick)}tick();show("pileus");updateStep();
window.addEventListener("pagehide",()=>{running=false;ro.disconnect();control.dispose();renderer.dispose();for(const m of materials)m.dispose();scene.traverse(o=>o.geometry?.dispose?.());},{once:true});
}
