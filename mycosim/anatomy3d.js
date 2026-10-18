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
'<div class="anatomy-controls" role="group" aria-label="3D scene mode"><button type="button" data-mode="gut" aria-pressed="true">Digestive organs</button><button type="button" data-mode="cell" aria-pressed="false">Intestinal barrier + immune cell</button><button type="button" data-mode="tissue" aria-pressed="false">Multi-system tissue layers</button><button type="button" data-mode="micro" aria-pressed="false">Cellular microanatomy</button><button type="button" data-action="start">Start 3D</button></div>'+
'<div id="anatomy23-zoom" class="anatomy-controls" role="group" aria-label="Conceptual magnification"><button type="button" data-mag="overview" aria-pressed="true">Overview</button><button type="button" data-mag="cell" aria-pressed="false">Cell focus</button><button type="button" data-mag="molecular" aria-pressed="false">Molecular focus</button><span id="anatomy23-scale" role="status">NOT TO SCALE</span></div><div class="anatomy-grid"><div><canvas id="tv-anatomy-canvas" aria-label="Procedural 3D anatomical reconstruction of digestive organs or epithelial barrier and immune cell"></canvas><p class="anatomy-status" id="tv-anatomy-status" role="status">Scene not started. Choose Start 3D.</p></div>'+
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
],tissue:[
["villus","Epithelial villus and mucus","Schematic intestinal villus lined by enterocytes with a semitransparent mucus cap; dimensions are illustrative, not an anatomical reference model."],
["junction","Tight junction barrier","Simplified junction rings between enterocytes. Real tight junctions are nanoscale molecular complexes not represented to scale."],
["vessel","Portal microvasculature","A stylized vessel and circulating blood-cell markers; portal supply, flow and hepatocyte access are not quantitative simulations."],
["hepatocyte","Hepatocytes","Cluster of liver parenchymal cells with approximate nuclei; metabolism and extraction fractions are not modeled."],
["macrophage","Macrophage","A simplified innate immune cell near a tissue interface, not proof of oral fungal-glucan receptor engagement."],
["neuron","Enteric neuron and axon","Stylized neuron soma, neurites and axon representing enteric signaling; not a complete ENS anatomical map."],
["synapse","Synaptic terminals","Two illustrative pre- and postsynaptic terminals with vesicles. Synaptic transport, receptor occupancy and brain effects are not simulated."]
],micro:[["bilayer","Cell membrane bilayer","An illustrative phospholipid bilayer with no physical molecular scaling."],["nucleus23","Nucleus and envelope","Nuclear compartment with chromatin proxy and double-membrane envelope; not an electron micrograph."],["mitochondrion","Mitochondrion and cristae","Cristae support oxidative phosphorylation but fold positions are schematic."],["er","Endoplasmic reticulum","Membrane networks contribute to protein and lipid production; chemistry is not simulated."],["tight23","Epithelial tight junction","Apical claudin-associated barrier, not a measured permeability model."],["dectin23","Dectin-1 receptor","Fungal ligand recognition is conditional on cellular access and does not demonstrate effects from consuming mushrooms."],["syk23","SYK and CARD9","Conditional immune signaling downstream from receptor stimulation; not measured receptor occupancy."],["axon23","Enteric neuron and axon","Schematic neuronal projection, not to scale with nearby protein structures."],["synapse23","Synaptic terminal and vesicles","Stylized synaptic terminals and vesicles without NMDA/AMPA conductance modeling."]]};
const DYNAMICS24=[{"id":"dectin","label":"Dectin-1 / accessible β-glucan","target":"dectin23","color":15320437,"from":[-1.5,2.1,0.75],"to":[-0.54,2.03,0.78],"steps":[["Ligand proximity","A β-glucan ligand must be structurally accessible to a Dectin-1-expressing cell.","Accessible ligand","AK-SESS-ih-bul LIG-and","A ligand whose molecular presentation permits binding to a receptor."],["Conditional receptor engagement","Appropriate receptor clustering can initiate a cellular response under experimental conditions; this does not establish oral exposure.","Dectin-1","DEK-tin one","A C-type lectin receptor recognizing suitably exposed fungal β-glucans."],["Downstream signaling opportunity","Productive receptor engagement can permit hemITAM signaling, but exposure, dose and human outcomes are not inferred.","Receptor engagement","ree-SEP-ter en-GAYJ-ment","Ligand-dependent receptor interaction that may precede intracellular signaling."]],"evidence":"Experimental receptor mechanism; intact orally consumed mushroom β-glucan reaching this receptor UNVERIFIED."},{"id":"syk","label":"hemITAM → SYK → CARD9","target":"syk23","color":10479269,"from":[-0.65,1.28,0.9],"to":[-0.2,0.5,0.92],"steps":[["hemITAM phosphorylation","Following appropriate receptor activation, Src-family kinases can phosphorylate the hemITAM tyrosine motif.","Phosphorylation","foss-for-ih-LAY-shun","Covalent addition of a phosphate group to a molecular substrate."],["SYK recruitment","SYK kinase can associate with phosphorylated signaling motifs and participate in a signaling cascade.","SYK","sick","Spleen tyrosine kinase, involved in immunoreceptor signal transduction."],["CARD9–BCL10–MALT1 relay","Adaptor complexes can transmit a context-dependent signal toward NF-κB transcriptional responses.","CARD9","card nine","An innate immune signaling adaptor, not a measure of clinical immune benefit."]],"evidence":"Well-characterized cell signaling; no proof of in-vivo receptor engagement after mushroom consumption."},{"id":"barrier","label":"Epithelial transport barrier","target":"tight23","color":15981193,"from":[1.78,1.7,0.85],"to":[1.78,0.05,0.85],"steps":[["Luminal bioaccessibility","Material must first leave the food matrix before any uptake can be considered.","Bioaccessibility","bye-oh-ak-sess-ih-BIL-ih-tee","Release of a constituent into a potentially available digestive form."],["Selective epithelial barrier","Transcellular and paracellular processes are regulated; large fungal polymers cannot simply be assumed to pass intact.","Tight junction","TYTE JUNK-shun","Apical epithelial barrier complex restricting unregulated paracellular exchange."],["Uptake requires evidence","Any transit depicted is hypothetical unless a specified material and transport mechanism have been experimentally demonstrated.","Bioavailability","bye-oh-uh-vay-luh-BIL-ih-tee","Extent of systemic or target-site availability, depending on context."]],"evidence":"Human intestinal physiology established; transport of any unspecified fungal polysaccharide remains HYPOTHETICAL."},{"id":"nmda","label":"NMDA receptor gating","target":"synapse23","color":8508415,"from":[2.16,-1.32,0.99],"to":[2.53,-1.37,0.99],"steps":[["Co-agonist and glutamate binding","NMDA channels generally require glutamate plus glycine or D-serine binding for activation.","NMDA","en em dee ay","N-methyl-D-aspartate-type ionotropic glutamate receptor."],["Voltage-dependent Mg²⁺ block","At negative membrane potential, extracellular magnesium blocks many NMDA channel pores; sufficient depolarization can relieve block.","Magnesium block","mag-NEE-zee-um BLOK","Voltage-dependent pore occupancy by Mg²⁺ in many NMDA receptors."],["Conditional ion conduction","When gating and electrochemical conditions permit, NMDA receptors conduct ions including calcium; no quantitative current is modeled.","Ionotropic","eye-on-oh-TROP-ik","A receptor that directly gates an ion channel."]],"evidence":"Established receptor physiology; no demonstration that ingested mushrooms act as NMDA drugs."},{"id":"ampa","label":"AMPA receptor transmission","target":"synapse23","color":14721791,"from":[2.12,-1.39,0.99],"to":[2.56,-1.39,0.99],"steps":[["Glutamate released","Presynaptic release introduces glutamate into a synaptic cleft in an excitatory synapse.","Glutamate","GLOO-tuh-mayt","Principal excitatory neurotransmitter in many central synapses."],["AMPA receptor gating","Glutamate binding can open an AMPA-type cation channel; permeability depends on receptor subunit composition.","AMPA","AM-puh","Ionotropic glutamate receptor mediating much rapid excitatory transmission."],["Postsynaptic response","AMPA channel activity changes postsynaptic conductance; the magnitude depends on conditions and is not predicted here.","Depolarization","dee-poh-ler-ih-ZAY-shun","A membrane potential shift toward less negative values."]],"evidence":"Established synaptic physiology; no mushroom-derived AMPA agonist effect asserted."},{"id":"gaba","label":"GABA-A inhibitory signaling","target":"synapse23","color":10213067,"from":[2.12,-1.49,0.92],"to":[2.55,-1.49,0.92],"steps":[["GABA neurotransmitter release","Presynaptic GABA can be released into a synaptic cleft in inhibitory networks.","GABA","GAB-uh","Gamma-aminobutyric acid, a major inhibitory neurotransmitter."],["GABA-A receptor activation","GABA-A is a ligand-gated anion channel; GABA-B is a separate G-protein-coupled receptor class.","GABA-A","GAB-uh AY","Ionotropic receptor for GABA with chloride and bicarbonate permeability."],["Gradient-dependent response","The effect of anion conductance depends on ionic gradients and membrane potential; inhibition is not universal hyperpolarization.","Chloride gradient","KLOR-ide GRAY-dee-ent","Difference in chloride electrochemical potential across a membrane."]],"evidence":"Established receptor mechanism; no clinical sedative effect from a fungal product inferred."},{"id":"vesicle","label":"Synaptic vesicle release","target":"synapse23","color":15908737,"from":[1.89,-1.43,0.95],"to":[2.59,-1.43,0.95],"steps":[["Action potential arrives","A presynaptic action potential depolarizes the nerve terminal.","Action potential","AK-shun poh-TEN-shul","Rapid regenerative electrical signal of an excitable membrane."],["Ca²⁺ channel opening and fusion","Voltage-gated calcium channels can allow calcium entry, promoting regulated SNARE-dependent vesicle fusion.","SNARE","snair","Protein machinery contributing to intracellular membrane fusion."],["Transmitter crosses cleft","Released neurotransmitters diffuse and may bind suitable postsynaptic receptors; no millisecond kinetics are calculated.","Exocytosis","ek-soh-sye-TOH-sis","Fusion-mediated release of vesicle contents to the extracellular space."]],"evidence":"Established synaptic mechanism; this animation does not model measured vesicle speed or drug effects."}];
let dynamics24Index=0,dynamics24Step=0,dynamics24Progress=0,dynamics24Playing=false,dynamics24Particles=[],dynamics24LastFrame=0;
let magnification="overview";
let mode="gut",selected="stomach",isolated=false,transparent=false,started=false,renderer=null,scene=null,camera=null,controls=null,root=null,ray=null,resizeObserver=null,raf=0;
let parts=new Map(),meshes=[],geometrySet=new Set(),materialSet=new Set();
// Phase 26: opt-in frame measurements. No additional rendering loop.
const perf26={active:false,samples:[],calls:[],triangles:[],previous:null,result:null,renderedFrames:0};
const picker=section.querySelector(".anatomy-picker");
function updatePicker(){
 picker.replaceChildren();
 for(const [id,label] of modes[mode]){
  const b=document.createElement("button");b.type="button";b.textContent=label;b.dataset.part=id;b.setAttribute("aria-pressed",String(id===selected));b.onclick=()=>select(id);picker.append(b);
 }
}
function describe(){const entry=modes[mode].find(p=>p[0]===selected)||modes[mode][0];name.textContent=entry[1];info.textContent=entry[2];section.querySelectorAll("[data-part]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.part===selected)));if(typeof updateFidelity25==="function")updateFidelity25();}
function material(color,opacity=1){const m=new THREE.MeshStandardMaterial({color,roughness:.56,metalness:.04,transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:opacity===1,emissive:color,emissiveIntensity:.055});materialSet.add(m);return m;}
function add(id,geo,mat,pos,scale,parent=root){geometrySet.add(geo);const obj=new THREE.Mesh(geo,mat);obj.position.set(...pos);if(scale)obj.scale.set(...scale);obj.userData.part=id;parent.add(obj);meshes.push(obj);if(!parts.has(id))parts.set(id,[]);parts.get(id).push(obj);return obj;}
function sphere(id,pos,scale,color){return add(id,new THREE.SphereGeometry(1,28,20),material(color),pos,scale);}
function tube(id,pts,radius,color){const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));return add(id,new THREE.TubeGeometry(curve,Math.max(24,pts.length*12),radius,10,false),material(color),[0,0,0],null);}
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
function buildTissue(){
 // Shared renderer, schematic teaching layers; no external 3D scene or remote assets.
 for(let i=0;i<5;i++){
  const x=-2.0+i*1.0;
  sphere("villus",[x,1.37,-.35],[.39,.63,.36],0xabc7bf);
  sphere("junction",[x+.46,1.28,-.05],[.095,.45,.07],0xe6ca87);
 }
 sphere("villus",[0,2.01,-.35],[2.75,.17,.63],0x78b8b4);
 tube("vessel",[[-2.25,.25,-.55],[-1.2,.05,-.6],[0,-.02,-.6],[1.2,.05,-.6],[2.2,.25,-.55]],.18,0xae6268);
 for(let j=0;j<5;j++)sphere("vessel",[-1.8+j*.9,.08,-.38],[.12,.09,.06],0xdd8585);
 for(let j=0;j<4;j++){
  const x=-1.52+j*1.02;
  sphere("hepatocyte",[x,-.82,-.16],[.4,.37,.34],0xc6a575);
  sphere("hepatocyte",[x+.1,-.84,.16],[.14,.13,.12],0x805d77);
 }
 sphere("macrophage",[-1.6,-1.64,.42],[.4,.37,.34],0x55a6a0);
 for(let a=0;a<6;a++){const theta=a*Math.PI/3;tube("macrophage",[[-1.6,-1.64,.42],[-1.6+Math.cos(theta)*.59,-1.64+Math.sin(theta)*.45,.42]],.047,0x78c3b3);}
 sphere("neuron",[.5,-1.55,.43],[.27,.27,.25],0x9581c5);
 tube("neuron",[[.7,-1.56,.43],[1.3,-1.52,.4],[1.8,-1.43,.42]],.08,0x9f95db);
 for(let a=0;a<4;a++){const q=a*Math.PI/2;tube("neuron",[[.35,-1.55,.43],[.10+Math.cos(q)*.40,-1.55+Math.sin(q)*.39,.43]],.042,0xb8a4d9);}
 sphere("synapse",[1.97,-1.40,.43],[.22,.18,.18],0xe6bc77);
 sphere("synapse",[2.52,-1.40,.43],[.22,.18,.18],0x82b6cd);
 for(let i=0;i<4;i++)sphere("synapse",[2.13+(i%2)*.12,-1.48+Math.floor(i/2)*.12,.57],[.035,.035,.03],0xffdb94);
}

function buildMicro(){
 add("bilayer",new THREE.BoxGeometry(5.5,.12,.95),material(0x578fa9,.66),[0,1.4,-.2],null);
 add("bilayer",new THREE.BoxGeometry(5.5,.12,.95),material(0x89c0c5,.66),[0,1.12,-.2],null);
 for(let i=0;i<8;i++){const x=-2.3+i*.62;sphere("bilayer",[x,1.53,.24],[.11,.09,.09],0xb1dfe2);sphere("bilayer",[x,1.0,.24],[.11,.09,.09],0xb1dfe2);}
 sphere("nucleus23",[-1.5,-.27,-.1],[.66,.57,.5],0xa38bc5);
 sphere("nucleus23",[-1.5,-.27,.37],[.33,.27,.16],0x715393);
 sphere("mitochondrion",[.05,-.3,-.14],[.73,.37,.42],0xc78d7b);
 for(let i=0;i<3;i++)tube("mitochondrion",[[-.45+i*.3,-.45,.2],[-.33+i*.3,-.12,.24],[-.16+i*.3,-.28,.24]],.048,0xf4c39a);
 for(let i=0;i<3;i++)tube("er",[[-2.18+i*.26,-1.33,.0],[-1.5+i*.26,-1.08,.12],[-.73+i*.26,-1.33,.0]],.068,0x7da6cd);
 sphere("tight23",[1.35,.4,0],[.42,.43,.35],0x9fc3a9);
 sphere("tight23",[2.25,.4,0],[.42,.43,.35],0x9fc3a9);
 tube("tight23",[[1.8,.83,.25],[1.8,.5,.25],[1.8,.32,.28]],.065,0xe7cb87);
 tube("dectin23",[[-.72,1.4,.3],[-.72,1.77,.36],[-.55,1.95,.36]],.075,0xe9c77b);
 sphere("dectin23",[-.54,2.02,.36],[.16,.14,.14],0xf7d992);
 sphere("syk23",[-.54,.7,.43],[.21,.16,.15],0x9ccd9f);
 sphere("syk23",[-.14,.48,.43],[.17,.15,.14],0xc3ac85);
 sphere("axon23",[.45,-1.6,.3],[.31,.27,.28],0x9c8fcd);
 tube("axon23",[[.67,-1.6,.3],[1.25,-1.58,.3],[1.74,-1.45,.32]],.085,0xada0dd);
 sphere("synapse23",[1.99,-1.4,.34],[.27,.23,.25],0xe8ba79);
 sphere("synapse23",[2.62,-1.4,.34],[.26,.25,.25],0x87b7ca);
 for(let i=0;i<4;i++)sphere("synapse23",[2.19+(i%2)*.11,-1.5+Math.floor(i/2)*.11,.61],[.041,.037,.035],0xffdc91);
}

function makeDynamics24Particles(){
 dynamics24Particles=[];
 for(let i=0;i<3;i++){
  const bead=sphere("motion24",[0,0,0],[.075,.075,.075],0xf0d59b);
  bead.userData.motion24=true;
  dynamics24Particles.push(bead);
 }
 updateDynamics24Particles();
}
function updateDynamics24Particles(){
 if(mode!=="micro"||!dynamics24Particles.length)return;
 const process=DYNAMICS24[dynamics24Index],smooth=dynamics24Progress*dynamics24Progress*(3-2*dynamics24Progress);
 const fraction=Math.min(1,(dynamics24Step+smooth)/3);
 for(let i=0;i<dynamics24Particles.length;i++){
  const bead=dynamics24Particles[i],offset=i*.16;
  bead.position.set(
   THREE.MathUtils.lerp(process.from[0],process.to[0],fraction)+offset,
   THREE.MathUtils.lerp(process.from[1],process.to[1],fraction)+Math.sin(Math.PI*fraction)*offset,
   THREE.MathUtils.lerp(process.from[2],process.to[2],fraction)+i*.07
  );
  bead.material.color.setHex(process.color);
  bead.visible=!isolated||(selected==="motion24");
 }
}
function releaseGeometry(){
 if(root)scene.remove(root);
 for(const geo of geometrySet)geo.dispose();
 for(const mat of materialSet)mat.dispose();
 geometrySet.clear();materialSet.clear();parts.clear();meshes=[];dynamics24Particles=[];
}
function rebuild(){
 if(!started)return;
 releaseGeometry();root=new THREE.Group();scene.add(root);
 if(mode==="gut")buildGut();else if(mode==="cell")buildCell();else if(mode==="tissue")buildTissue();else {buildMicro();makeDynamics24Particles();}
 controls.target.set(0,0,0);camera.position.set(4,2.5,7);controls.update();
 applyVisibility();describe();applyMagnification();updateDynamics24Particles();
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
function changeMode(next){dynamics24Playing=false;dynamics24LastFrame=0;mode=next;selected=modes[mode][0][0];isolated=false;transparent=false;section.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mode===mode)));updatePicker();if(started)rebuild();else describe();}
function applyMagnification(){
 const dist={overview:7,cell:4.5,molecular:2.7}[magnification]||7;
 section.querySelectorAll("[data-mag]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mag===magnification)));
 const label=section.querySelector("#anatomy23-scale");
 if(label)label.textContent="Conceptual "+magnification+" focus · NOT TO SCALE";
 if(started){const target=controls.target.clone(),direction=camera.position.clone().sub(target).normalize();if(direction.lengthSq()<.5)direction.set(0,.3,1).normalize();camera.position.copy(target).addScaledVector(direction,dist);controls.update();}
}
function resize(){if(!renderer)return;const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
function init(){
 if(started)return;
 try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x0b171a);scene.fog=new THREE.FogExp2(0x0b171a,.018);
  camera=new THREE.PerspectiveCamera(47,1,.1,100);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minDistance=1.5;controls.maxDistance=17;
  scene.add(new THREE.HemisphereLight(0xd9edeb,0x625048,1.65));
  const light=new THREE.DirectionalLight(0xffe9cf,2.15);light.position.set(3,7,6);scene.add(light);
  const rim=new THREE.DirectionalLight(0x85bdde,1.3);rim.position.set(-4,2,-5);scene.add(rim);
  const lowerFill=new THREE.PointLight(0xf2aa8a,13,13,2);lowerFill.position.set(1,-3,4);scene.add(lowerFill);
  ray=new THREE.Raycaster();started=true;resize();rebuild();
  resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
  canvas.addEventListener("click",pick);
  const loop=(time)=>{
   if(!started)return;
   if(!document.hidden&&section.isConnected&&section.getClientRects().length>0){
    const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
    if(dynamics24Playing&&mode==="micro"&&!reduced){
     const delta=dynamics24LastFrame?Math.min(80,time-dynamics24LastFrame):0;
     dynamics24Progress=Math.min(1,dynamics24Progress+delta/1300);
     if(dynamics24Progress>=1){dynamics24Progress=0;if(dynamics24Step<2)dynamics24Step++;else dynamics24Playing=false;renderDynamics24();}
     updateDynamics24Particles();
     const scrub=section.querySelector("#dynamics24-progress");if(scrub)scrub.value=String(Math.round(dynamics24Progress*100));
    }else if(reduced&&dynamics24Playing){dynamics24Playing=false;renderDynamics24();}
    dynamics24LastFrame=time;
    controls.update();renderer.render(scene,camera);perf26.renderedFrames++;
    if(perf26.active){
     if(perf26.previous!==null){
      const gap=time-perf26.previous;
      if(Number.isFinite(gap)&&gap>0&&gap<250){
       perf26.samples.push(gap);
       perf26.calls.push(renderer.info.render.calls);
       perf26.triangles.push(renderer.info.render.triangles);
      }
     }
     perf26.previous=time;
     if(perf26.samples.length>=90)finishPerf26();
    }
   }else{dynamics24LastFrame=0;if(perf26.active)perf26.previous=null;}
   raf=requestAnimationFrame(loop);
  };loop();
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
function dispose(){perf26.active=false;started=false;cancelAnimationFrame(raf);resizeObserver?.disconnect();canvas.removeEventListener("click",pick);if(scene)releaseGeometry();controls?.dispose();renderer?.dispose();renderer=null;scene=null;}
section.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>changeMode(b.dataset.mode));
section.querySelectorAll("[data-mag]").forEach(b=>b.onclick=()=>{magnification=b.dataset.mag;applyMagnification();});
section.querySelector('[data-action="start"]').onclick=init;
section.querySelector('[data-action="isolate"]').onclick=()=>{isolated=!isolated;if(started)applyVisibility();};
section.querySelector('[data-action="context"]').onclick=()=>{transparent=!transparent;if(started)applyVisibility();};
section.querySelector('[data-action="focus"]').onclick=focus;
section.querySelector('[data-action="reset"]').onclick=reset;
section.querySelector('[data-action="read"]').onclick=()=>{if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(name.textContent+". "+info.textContent);u.rate=.86;window.speechSynthesis.speak(u);};
window.addEventListener("pagehide",dispose,{once:true});
// Opt-in browser diagnostics; these manipulate only this independent 3D scene.

// Phase 25 rendering instrumentation; observation only, not GPU throughput certification.
const fidelity25=document.createElement("section");
fidelity25.id="anatomy25-fidelity";fidelity25.setAttribute("aria-label","Phase 25 anatomy display quality and render diagnostic");
fidelity25.style.cssText="margin-top:12px;padding:12px;background:#10252a;border:1px solid #5c7d75;border-radius:9px";
fidelity25.innerHTML='<strong>Phase 25 · Anatomy visibility and material guide</strong><p id="anatomy25-guide" style="font-size:12px;line-height:1.6"></p><div id="anatomy26-references" aria-label="Relevant scientific references" style="font-size:12px"></div><p class="anatomy-warning">Scientific geometry remains PROCEDURAL and NOT TO SCALE. Color identifies a structure category; it does not represent staining, measured molecular shape, or verified patient anatomy.</p><button type="button" id="anatomy25-qa">Run Phase 25 visual-regression checks</button><pre id="anatomy25-report" role="status" style="white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.5 monospace">Not run.</pre>';
section.append(fidelity25);
function updateFidelity25(){
 const p=fidelity25.querySelector("#anatomy25-guide");
 if(p)p.textContent="Selected: "+name.textContent+" · "+mode+" view · "+magnification+" focus. Materials use rough non-metallic surfaces, warm key light, cool edge light, tone mapping and depth shading. Camera and light colors are illustrative.";updateReferences26();
}

const SCIENCE26_REFERENCES=Object.freeze({
 barrier:{label:"Turner (2009), intestinal epithelial barrier · DOI 10.1038/nri2653 · PMID 19855405",url:"https://pubmed.ncbi.nlm.nih.gov/19855405/"},
 immune:{label:"Drummond et al. (2011), SYK/CARD9 fungal immune recognition · DOI 10.1002/eji.201041252 · PMID 21267996",url:"https://pubmed.ncbi.nlm.nih.gov/21267996/"},
 synapse:{label:"Südhof (2013), synaptic vesicle release · DOI 10.1016/j.neuron.2013.10.022 · PMID 24183019",url:"https://pubmed.ncbi.nlm.nih.gov/24183019/"}
});
const sourceByPart=Object.freeze({
 junction:"barrier",tight23:"barrier",epithelium:"barrier",villus:"barrier",
 receptor:"immune",dectin23:"immune",syk23:"immune",membrane:"immune",
 synapse:"synapse",synapse23:"synapse",axon23:"synapse",neuron:"synapse"
});
function updateReferences26(){
 const area=fidelity25.querySelector("#anatomy26-references");if(!area)return;
 area.replaceChildren();
 const tag=sourceByPart[selected];
 const p=document.createElement("p");
 p.textContent="Research context, NOT validation of the drawn geometry, scale, timing or dietary efficacy.";
 area.append(p);
 if(tag){
  const a=document.createElement("a"),source=SCIENCE26_REFERENCES[tag];
  a.href=source.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=source.label;a.style.color="#d3dfad";area.append(a);
 }else{
  const p2=document.createElement("p");p2.textContent="No claim-specific research citation assigned to this visual structure; expert review pending.";area.append(p2);
 }
}
const perf26Panel=document.createElement("section");perf26Panel.id="anatomy26-performance";
perf26Panel.setAttribute("aria-label","Phase 26 opt in frame timing profile");
perf26Panel.style.cssText="margin-top:12px;padding:12px;background:#10262b;border:1px solid #51736e;border-radius:9px";
perf26Panel.innerHTML='<strong>Phase 26 · Visible-frame performance sample</strong><p style="font-size:12px">Capture 90 consecutive rendered frame intervals using the EXISTING animation loop. Figures describe browser scheduling plus CPU-side rendering; they are NOT GPU timings or FPS certification.</p><button type="button" id="anatomy26-profile">Profile 90 visible frames</button><p id="anatomy26-profile-status" role="status">Idle. Start the 3D scene and keep the anatomy panel visible.</p>';
section.append(perf26Panel);
function finishPerf26(){
 perf26.active=false;perf26.previous=null;
 const gaps=[...perf26.samples].sort((a,b)=>a-b),mean=perf26.samples.reduce((a,b)=>a+b,0)/Math.max(1,perf26.samples.length);
 const p95=gaps[Math.min(gaps.length-1,Math.floor(gaps.length*.95))]||0;
 const peakCalls=Math.max(...perf26.calls),peakTriangles=Math.max(...perf26.triangles);
 perf26.result={sampleCount:perf26.samples.length,meanFrameIntervalMs:Math.round(mean*100)/100,p95IntervalMs:Math.round(p95*100)/100,maximumDrawCalls:peakCalls,maximumTriangles:peakTriangles,mode,clock:"requestAnimationFrame",gpuTimingMeasured:false};
 perf26Panel.querySelector("#anatomy26-profile-status").textContent="Profile complete: "+perf26.result.sampleCount+" frames · mean "+perf26.result.meanFrameIntervalMs+" ms · p95 "+perf26.result.p95IntervalMs+" ms · max draw calls "+peakCalls+" · max triangles "+peakTriangles+". Not GPU timing.";
 perf26Panel.querySelector("#anatomy26-profile").disabled=false;
}
perf26Panel.querySelector("#anatomy26-profile").onclick=()=>{
 init();
 if(!started){perf26Panel.querySelector("#anatomy26-profile-status").textContent="Cannot profile: renderer failed to initialize.";return;}
 perf26.active=true;perf26.samples=[];perf26.calls=[];perf26.triangles=[];perf26.previous=null;perf26.result=null;
 perf26Panel.querySelector("#anatomy26-profile").disabled=true;
 perf26Panel.querySelector("#anatomy26-profile-status").textContent="Collecting 90 visible rendered frame intervals…";
};
window.MycoSimPerf26=Object.freeze({getSnapshot:()=>({...perf26.result}),isProfiling:()=>perf26.active,getRenderCount:()=>perf26.renderedFrames});

const qaButton=document.createElement("button");qaButton.type="button";qaButton.textContent="Run Phase 10 3D QA";
const qaOutput=document.createElement("pre");qaOutput.id="anatomy10-report";qaOutput.setAttribute("role","status");
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

const tissueQA=document.createElement("div");
tissueQA.style.cssText="margin-top:12px;padding:12px;background:#122328;border:1px solid #55746e;border-radius:9px";
tissueQA.innerHTML='<strong>Phase 22 · Tissue anatomy validation</strong><p class="anatomy-warning">SCHEMATIC / NOT TO SCALE: tissue structures are educational, not imaging-derived, histologically validated, or measured human exposure models.</p><button type="button" id="anatomy22-run">Run Phase 22 renderer QA</button><pre id="anatomy22-report" role="status" style="font:11px/1.5 monospace;white-space:pre-wrap;overflow-wrap:anywhere">Not run.</pre>';
section.append(tissueQA);
tissueQA.querySelector("#anatomy22-run").onclick=()=>{
 const before={mode,selected,isolated,transparent};const checks=[],check=(label,valid)=>checks.push({label,pass:!!valid});
 try{
  init();changeMode("tissue");
  check("Reuse original WebGL canvas and renderer",started&&canvas.id==="tv-anatomy-canvas"&&!!renderer);
  check("Seven tissue structure categories",modes.tissue.length===7);
  for(const [id] of modes.tissue)check(id+" meshes and selection",parts.has(id)&&parts.get(id).length>0);
  check("All selectable structures have descriptions",modes.tissue.every(item=>item[2].length>40));
  check("No new canvas required",section.querySelectorAll("canvas").length===1);
  check("Low power pixel ratio capped",renderer.getPixelRatio()<=1.5);
  const total=meshes.length,geo=geometrySet.size,mat=materialSet.size;
  rebuild();
  check("Rebuild disposes and replaces geometry without growth",meshes.length===total&&geometrySet.size===geo&&materialSet.size===mat);
  select("synapse");isolated=true;applyVisibility();
  check("Synapse isolation",meshes.every(o=>o.visible===(o.userData.part==="synapse")));
  isolated=false;transparent=true;applyVisibility();
  check("Context overlay transparency",meshes.some(o=>o.userData.part!=="synapse"&&o.material.opacity<1));
  check("Original legacy scene types preserved",modes.gut.length===4&&modes.cell.length===6);
  check("Schematic / no clinical promise",tissueQA.textContent.includes("NOT TO SCALE"));
 }catch(e){check("Unexpected 3D exception "+String(e),false);}
 finally{
  changeMode(before.mode);select(before.selected);isolated=before.isolated;transparent=before.transparent;
  if(started)applyVisibility();
 }
 const passed=checks.filter(x=>x.pass).length;
 tissueQA.querySelector("#anatomy22-report").textContent="Phase 22 browser checks: "+passed+"/"+checks.length+" passed\n"+checks.map(x=>(x.pass?"PASS ":"FAIL ")+x.label).join("\n")+"\nNot a scientific anatomy, screen-reader, or GPU endurance certification.";
};


const microscopeQA=document.createElement("div");microscopeQA.style.cssText="margin-top:12px;padding:12px;background:#12272b;border:1px solid #587d72;border-radius:8px";
microscopeQA.innerHTML='<strong>Phase 23 · Microscopic anatomy diagnostics</strong><p class="anatomy-warning">Cell structures are SCHEMATIC and NOT TO SCALE; no measured receptor activity or clinical outcome.</p><button id="anatomy23-run" type="button">Run Phase 23 renderer QA</button><pre id="anatomy23-report" role="status" style="white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.5 monospace">Not run.</pre>';
section.append(microscopeQA);
microscopeQA.querySelector("#anatomy23-run").onclick=()=>{
 const before={mode,selected,isolated,transparent,magnification},checks=[],check=(label,pass)=>checks.push({label,pass:!!pass});
 try{
  init();changeMode("micro");
  check("Existing renderer and canvas",started&&!!renderer&&canvas.id==="tv-anatomy-canvas");
  check("No duplicate canvas",section.querySelectorAll("canvas").length===1);
  check("Nine cellular selections",modes.micro.length===9&&picker.querySelectorAll("button").length===9);
  for(const [id] of modes.micro)check(id+" geometry",parts.has(id)&&parts.get(id).length>0);
  check("Detailed structure definitions",modes.micro.every(s=>s[2].length>40));
  check("Three conceptual magnifications",section.querySelectorAll("[data-mag]").length===3);
  for(const key of ["overview","cell","molecular"]){magnification=key;applyMagnification();check(key+" state",section.querySelector('[data-mag="'+key+'"]').getAttribute("aria-pressed")==="true");}
  select("dectin23");isolated=true;transparent=false;applyVisibility();
  check("Receptor isolation",meshes.every(m=>m.visible===(m.userData.part==="dectin23")));
  isolated=false;transparent=true;applyVisibility();
  check("Transparent context",meshes.some(m=>m.userData.part!=="dectin23"&&m.material.opacity<1));
  const geos=geometrySet.size,mats=materialSet.size,count=meshes.length;rebuild();
  check("Rebuild and dispose bounded",geometrySet.size===geos&&materialSet.size===mats&&meshes.length===count);
  check("All legacy modes retained",modes.gut.length===4&&modes.cell.length===6&&modes.tissue.length===7);
  check("Schematic disclaimer",microscopeQA.textContent.includes("NOT TO SCALE"));
 }catch(e){check("Unexpected exception "+String(e),false);}
 finally{magnification=before.magnification;changeMode(before.mode);select(before.selected);isolated=before.isolated;transparent=before.transparent;applyMagnification();if(started)applyVisibility();}
 const passed=checks.filter(x=>x.pass).length;
 microscopeQA.querySelector("#anatomy23-report").textContent="Phase 23 browser checks: "+passed+"/"+checks.length+" passed\n"+checks.map(x=>(x.pass?"PASS ":"FAIL ")+x.label).join("\n")+"\nEducational DOM and WebGL checks only; not clinical or histological certification.";
};


const dynamics24Panel=document.createElement("section");
dynamics24Panel.id="myco-dynamics24";dynamics24Panel.setAttribute("aria-label","Phase 24 interactive conditional molecular mechanisms");
dynamics24Panel.style.cssText="margin-top:14px;padding:15px;border-radius:10px;border:1px solid #64867e;background:#14252b";
dynamics24Panel.innerHTML="\n<style>#myco-dynamics24 h3{font-size:18px;color:#f1dba4}#myco-dynamics24 p{font-size:12px;line-height:1.6}#myco-dynamics24 .d24controls{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}#myco-dynamics24 button,#myco-dynamics24 select{border:1px solid #658a80;border-radius:7px;padding:9px;background:#18343a;color:#f1f6f1;cursor:pointer}#myco-dynamics24 button:focus-visible,#myco-dynamics24 select:focus-visible,#myco-dynamics24 input:focus-visible{outline:2px solid #f9dba2}#myco-dynamics24 button[aria-pressed=true]{background:#765829;border-color:#e8d196}#myco-dynamics24 .d24card{border:1px solid #4f7069;padding:12px;background:#0e2025;border-radius:9px}#myco-dynamics24 .d24warning{border-left:3px solid #e1b97a;padding:9px;background:#31271b}#myco-dynamics24 input[type=range]{width:100%;accent-color:#e3c485}</style>\n<div class=\"kicker\">PHASE 24 · CONTROLLED CELLULAR BIOCHEMISTRY</div><h3>Conceptual signaling and membrane processes</h3>\n<p class=\"d24warning\">SCHEMATIC motion only — NOT molecular dynamics, molecular docking, measured transport, ion flux, receptor occupancy, or clinical efficacy. Motion paths and timing are illustrative. Ordinary mushroom consumption has not been shown to trigger the depicted neural pathways.</p>\n<label for=\"dynamics24-process\">Biochemical process </label><select id=\"dynamics24-process\"></select>\n<div class=\"d24controls\"><button id=\"dynamics24-prev\" type=\"button\">← Previous stage</button><button id=\"dynamics24-next\" type=\"button\">Next stage →</button><button id=\"dynamics24-play\" type=\"button\" aria-pressed=\"false\">Play motion</button><button id=\"dynamics24-reset\" type=\"button\">Reset</button><button id=\"dynamics24-read\" type=\"button\">🔊 Read explanation</button></div>\n<label for=\"dynamics24-progress\">Manual progress within current stage</label><input id=\"dynamics24-progress\" type=\"range\" min=\"0\" max=\"100\" step=\"1\" value=\"0\" aria-label=\"Scrub biochemical animation within current stage\">\n<div class=\"d24card\" aria-live=\"polite\"><strong id=\"dynamics24-title\"></strong><p id=\"dynamics24-mechanism\"></p><p id=\"dynamics24-evidence\"></p><p id=\"dynamics24-term\"></p><p id=\"dynamics24-pron\"></p><p id=\"dynamics24-definition\"></p></div>\n<p id=\"dynamics24-state\" role=\"status\">Paused · Stage 1 of 3</p><button id=\"dynamics24-qa\" type=\"button\">Run Phase 24 QA</button>\n<pre id=\"dynamics24-report\" role=\"status\" style=\"font:11px/1.5 monospace;white-space:pre-wrap;overflow-wrap:anywhere\">Not run.</pre>";
section.append(dynamics24Panel);
const d24=id=>dynamics24Panel.querySelector("#"+id);
for(let i=0;i<DYNAMICS24.length;i++){const option=document.createElement("option");option.value=String(i);option.textContent=DYNAMICS24[i].label;d24("dynamics24-process").append(option);}
function renderDynamics24(){
 const p=DYNAMICS24[dynamics24Index],st=p.steps[dynamics24Step];
 d24("dynamics24-process").value=String(dynamics24Index);
 d24("dynamics24-title").textContent="Stage "+(dynamics24Step+1)+"/3 · "+st[0];
 d24("dynamics24-mechanism").textContent="Scientific mechanism: "+st[1];
 d24("dynamics24-evidence").textContent="Evidence classification: "+p.evidence;
 d24("dynamics24-term").textContent="Definition: "+st[2];
 d24("dynamics24-pron").textContent="Pronunciation: "+st[3];
 d24("dynamics24-definition").textContent=st[4];
 d24("dynamics24-progress").value=String(Math.round(dynamics24Progress*100));
 d24("dynamics24-play").setAttribute("aria-pressed",String(dynamics24Playing));
 d24("dynamics24-play").textContent=dynamics24Playing?"Pause motion":"Play motion";
 d24("dynamics24-state").textContent=(dynamics24Playing?"Playing":"Paused")+" · Stage "+(dynamics24Step+1)+" of 3 · "+Math.round(dynamics24Progress*100)+"% · illustrative timing";
 if(mode==="micro"&&started)updateDynamics24Particles();
}
function setDynamics24Process(next){
 dynamics24Index=Math.max(0,Math.min(DYNAMICS24.length-1,next));dynamics24Step=0;dynamics24Progress=0;dynamics24Playing=false;dynamics24LastFrame=0;
 if(mode!=="micro")changeMode("micro");
 select(DYNAMICS24[dynamics24Index].target);renderDynamics24();
}
function dynamics24Stage(next){
 dynamics24Playing=false;dynamics24Step=Math.max(0,Math.min(2,next));dynamics24Progress=0;dynamics24LastFrame=0;renderDynamics24();
}
d24("dynamics24-process").onchange=e=>setDynamics24Process(Number(e.target.value));
d24("dynamics24-prev").onclick=()=>dynamics24Stage(dynamics24Step-1);
d24("dynamics24-next").onclick=()=>dynamics24Stage(dynamics24Step+1);
d24("dynamics24-play").onclick=()=>{
 if(mode!=="micro")changeMode("micro");
 if(!started)init();
 if(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches){dynamics24Playing=false;d24("dynamics24-state").textContent="Reduced motion is enabled. Advance or scrub manually.";return;}
 if(dynamics24Step===2&&dynamics24Progress>=1){dynamics24Step=0;dynamics24Progress=0;}
 dynamics24Playing=!dynamics24Playing;dynamics24LastFrame=0;renderDynamics24();
};
d24("dynamics24-reset").onclick=()=>{dynamics24Playing=false;dynamics24Step=0;dynamics24Progress=0;dynamics24LastFrame=0;renderDynamics24();};
d24("dynamics24-progress").oninput=e=>{dynamics24Playing=false;dynamics24Progress=Math.max(0,Math.min(1,Number(e.target.value)/100));renderDynamics24();};
d24("dynamics24-read").onclick=()=>{
 if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const p=DYNAMICS24[dynamics24Index],st=p.steps[dynamics24Step];
 const u=new SpeechSynthesisUtterance(p.label+". "+st[0]+". "+st[1]+". "+p.evidence+". "+st[2]+": "+st[4]);u.rate=.83;u.lang="en-US";window.speechSynthesis.speak(u);
};
d24("dynamics24-qa").onclick=()=>{
 const old={mode,selected,isolated,transparent,index:dynamics24Index,step:dynamics24Step,progress:dynamics24Progress};
 const checks=[],check=(n,v)=>checks.push({n,pass:!!v});
 try{
  dynamics24Playing=false;init();changeMode("micro");
  check("Existing single WebGL canvas",section.querySelectorAll("canvas").length===1&&!!renderer);
  check("Seven mechanism choices",DYNAMICS24.length===7&&d24("dynamics24-process").options.length===7);
  check("Three complete stages per process",DYNAMICS24.every(p=>p.steps.length===3&&p.steps.every(st=>st.length===5&&st.every(Boolean))));
  for(let i=0;i<DYNAMICS24.length;i++){setDynamics24Process(i);check("Mechanism "+(i+1)+" uses existing anatomy",parts.has(DYNAMICS24[i].target));}
  check("Three mesh motion markers",dynamics24Particles.length===3&&meshes.filter(m=>m.userData.motion24).length===3);
  setDynamics24Process(3);dynamics24Stage(1);check("Stage advance",dynamics24Step===1&&d24("dynamics24-title").textContent.includes("Stage 2/3"));
  dynamics24Stage(99);check("Final stage boundary",dynamics24Step===2);
  dynamics24Stage(-1);check("First stage boundary",dynamics24Step===0);
  d24("dynamics24-progress").value="50";d24("dynamics24-progress").dispatchEvent(new Event("input"));
  check("Manual scrub pauses",dynamics24Progress===.5&&!dynamics24Playing);
  check("Accessible playback",d24("dynamics24-play").getAttribute("aria-pressed")==="false");
  check("Unvalidated dynamics explicitly disclosed",dynamics24Panel.textContent.includes("NOT molecular dynamics"));
  check("Legacy anatomy retained",modes.gut.length===4&&modes.cell.length===6&&modes.tissue.length===7&&modes.micro.length===9);
  const n=meshes.length,g=geometrySet.size;rebuild();check("Rebuild bounded",meshes.length===n&&geometrySet.size===g);
 }catch(e){check("Unexpected error "+String(e),false);}
 finally{
  dynamics24Index=old.index;dynamics24Step=old.step;dynamics24Progress=old.progress;dynamics24Playing=false;dynamics24LastFrame=0;
  changeMode(old.mode);select(old.selected);isolated=old.isolated;transparent=old.transparent;if(started)applyVisibility();renderDynamics24();
 }
 const count=checks.filter(x=>x.pass).length;
 d24("dynamics24-report").textContent="Phase 24 browser checks: "+count+"/"+checks.length+" passed\n"+checks.map(c=>(c.pass?"PASS ":"FAIL ")+c.n).join("\n")+"\nEducational UI/scene checks only; not molecular-dynamics simulation, in-vivo measurements or clinical validation.";
};
window.MycoSimMotion24=Object.freeze({getState:()=>({process:DYNAMICS24[dynamics24Index].id,stage:dynamics24Step,progress:dynamics24Progress,playing:dynamics24Playing,mode,particles:dynamics24Particles.map(b=>b.position.toArray())})});
renderDynamics24();


fidelity25.querySelector("#anatomy25-qa").onclick=()=>{
 const old={mode,selected,isolated,transparent,magnification},checks=[],check=(n,v)=>checks.push({n,pass:!!v});
 try{
  init();changeMode("micro");
  check("Original canvas and renderer",section.querySelectorAll("canvas").length===1&&!!renderer);
  check("PBR material support",meshes.every(m=>m.material.isMeshStandardMaterial));
  check("Tone mapping applied",renderer.toneMapping===THREE.ACESFilmicToneMapping);
  check("High-DPI cap preserved",renderer.getPixelRatio()<=1.5);
  check("Scene includes fog and depth",scene.fog instanceof THREE.FogExp2);
  check("Anatomical explanations visible",!!fidelity25.querySelector("#anatomy25-guide").textContent.includes("Selected:"));
  check("Scientific accuracy warning",fidelity25.textContent.includes("NOT TO SCALE"));
  const labels=["gut","cell","tissue","micro"];
  for(const label of labels){changeMode(label);check("Preserved "+label+" selection",meshes.length>0&&picker.querySelectorAll("button").length===modes[label].length);}
  const meshesBefore=meshes.length,geometriesBefore=geometrySet.size,materialsBefore=materialSet.size;
  rebuild();
  check("Resource accounting stable",meshes.length===meshesBefore&&geometrySet.size===geometriesBefore&&materialSet.size===materialsBefore);
  check("Single animation engine",typeof window.MycoSimMotion24?.getState==="function");
 }catch(e){check("Unexpected error: "+String(e),false);}
 finally{magnification=old.magnification;changeMode(old.mode);select(old.selected);isolated=old.isolated;transparent=old.transparent;applyMagnification();if(started)applyVisibility();}
 const passed=checks.filter(x=>x.pass).length;
 fidelity25.querySelector("#anatomy25-report").textContent="Phase 25 browser checks: "+passed+"/"+checks.length+" passed\n"+checks.map(c=>(c.pass?"PASS ":"FAIL ")+c.n).join("\n")+"\nRenderer smoke checks do not establish measured FPS, visual fidelity against microscopy, real-world exposure, or production acceptance.";
};

changeMode("gut");
}
