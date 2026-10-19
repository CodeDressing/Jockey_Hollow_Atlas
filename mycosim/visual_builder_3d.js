// MycoSim Visual Studio 3D: isolated creative mesh workshop; no taxonomic records modified.
import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
const host=document.getElementById("myco-visual-builder");
if(host&&!host.querySelector("#mb-real3d")){
 const preview=host.querySelector(".mb-preview");
 const frame=document.createElement("section");frame.id="mb-real3d";
 frame.setAttribute("aria-label","Live interactive three-dimensional mushroom creator");
 frame.innerHTML='<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:space-between"><strong style="color:#f1daa6;font-size:15px">Live 3D mushroom creation</strong><button type="button" id="mb-3d-resetview">Reset camera</button></div><canvas id="mb-live-canvas" role="img" aria-label="Interactive rotatable three dimensional creative mushroom model"></canvas><p id="mb-3d-feedback" role="status" style="font-size:12px;color:#ccddce">Rotate: drag. Zoom: scroll or pinch. Geometry updates immediately with selections.</p><div id="mb-microscopy" aria-label="Separate microscopic spore visualization"></div><p style="font-size:11px;color:#e4c78b">Creative geometry only — not a species diagnosis, edibility assessment, or evidence record. Diagrammatic scale.</p>';
 preview.prepend(frame);
 const css=document.createElement("style");css.textContent=`
 #mb-real3d{border:1px solid #658780;border-radius:12px;padding:12px;margin-bottom:12px;background:#0a191c;min-width:0}
 #mb-live-canvas{display:block;width:100%;height:340px;touch-action:none;border-radius:9px;background:radial-gradient(ellipse at 45% 38%,#213c42,#071217)}
 #mb-microscopy{display:flex;align-items:center;gap:12px;border-top:1px solid #4e6866;padding-top:9px;font-size:12px;color:#d5e8df}
 #mb-microscopy svg{height:68px;width:112px;max-width:112px;flex:none}
 @media(max-width:700px){#mb-live-canvas{height:290px}}
 @media(prefers-reduced-motion:reduce){#mb-real3d *{scroll-behavior:auto!important}}
 `;document.head.append(css);
 const canvas=frame.querySelector("canvas"),status=frame.querySelector("#mb-3d-feedback");
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x0d2023);
 const camera=new THREE.PerspectiveCamera(42,1,.1,75);camera.position.set(4.8,3.2,5.5);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"low-power",alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 scene.add(new THREE.HemisphereLight(0xf5ead3,0x385663,2.1));
 const light=new THREE.DirectionalLight(0xffe1b0,2.7);light.position.set(-3,7,5);scene.add(light);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minDistance=2;controls.maxDistance=12;controls.target.set(0,1.2,0);
 const root=new THREE.Group();scene.add(root);let disposed=false;
 const mat=(color,side=THREE.FrontSide)=>new THREE.MeshStandardMaterial({color,roughness:.82,metalness:0,side});
 function mesh(geometry,material,parent=root){const object=new THREE.Mesh(geometry,material);parent.add(object);return object;}
 function clear(){
   for(const child of [...root.children]){root.remove(child);child.traverse(o=>{o.geometry?.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m?.dispose()});}
 }
 function traits(){return Object.fromEntries([...host.querySelectorAll("[data-mb-trait]")].map(el=>[el.dataset.mbTrait,el.value]));}
 function capGeometry(type,radius=1.36){
  const positions=[],uv=[],indices=[],radial=56,rings=20;
  for(let j=0;j<=rings;j++){const t=j/rings;const r=radius*t;
   let y= type==="flat"?.11*(1-t*t):type==="conical"?1.24*(1-t):type==="depressed"?.26+ .54*Math.sin(t*Math.PI)-.52*(1-t)**3:.20+ .82*Math.sqrt(Math.max(0,1-t*t));
   for(let i=0;i<=radial;i++){const a=i/radial*Math.PI*2;positions.push(r*Math.cos(a),2.03+y,r*Math.sin(a));uv.push(i/radial,t);}
  }
  for(let j=0;j<rings;j++)for(let i=0;i<radial;i++){const p=j*(radial+1)+i;indices.push(p,p+radial+1,p+1,p+1,p+radial+1,p+radial+2);}
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
 }
 function fertile(surface,attachment){
  const tan=mat(0xbba078,THREE.DoubleSide);
  if(surface==="gills"){
    for(let i=0;i<38;i++){const a=i/38*Math.PI*2,r0=attachment==="free"?.38:attachment==="decurrent"?.10:.18,r1=1.31;const pts=new Float32Array([r0*Math.cos(a),2.015,r0*Math.sin(a),r1*Math.cos(a),2.015,r1*Math.sin(a),r1*Math.cos(a),1.76,r1*Math.sin(a),r0*Math.cos(a),1.85,r0*Math.sin(a)]);const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pts,3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();mesh(g,tan.clone());}
  }else if(surface==="pores"){
    const poreMat=mat(0x5b4130);for(let ring=1;ring<=5;ring++){const count=ring*13;for(let i=0;i<count;i++){const a=i/count*Math.PI*2,r=.20+ring*.21;const p=mesh(new THREE.CylinderGeometry(.042,.042,.025,8),poreMat.clone());p.position.set(r*Math.cos(a),1.99,r*Math.sin(a));}}
  }else if(surface==="teeth"){
    for(let ring=1;ring<=4;ring++){for(let i=0;i<ring*16;i++){const a=i/(ring*16)*Math.PI*2,r=.16+ring*.28;const tooth=mesh(new THREE.ConeGeometry(.034,.19,5),tan.clone());tooth.rotation.z=Math.PI;tooth.position.set(r*Math.cos(a),1.86,r*Math.sin(a));}}
  }else{const disk=mesh(new THREE.CylinderGeometry(1.33,1.33,.025,64),mat(0xbfa475));disk.position.y=2.015;}
 }
 function model(state){
  clear();const capMat=mat(0xb58a4f,THREE.DoubleSide),stipeMat=mat(0xe1cda2);
  const disk=mesh(new THREE.CylinderGeometry(2.05,2.05,.17,56),mat(state.substrate==="soil"?0x51483a:0x674934));disk.position.y=-.15;
  if(state.substrate!=="soil"){const log=mesh(new THREE.CylinderGeometry(.38,.43,3.5,20),mat(0x785538));log.rotation.z=Math.PI/2;log.position.set(0,.06,-.1);}
  if(state.substrate==="living_tree"){const tree=mesh(new THREE.CylinderGeometry(.32,.38,3.7,20),mat(0x77543b));tree.position.set(-1.65,1.35,-.55);}
  if(state.form==="agaric"){
   const topRadius=state.stipe==="tapered"?.11:.16,baseRadius=state.stipe==="bulbous"?.36:state.stipe==="tapered"?.30:.18;
   const stem=mesh(new THREE.CylinderGeometry(topRadius,baseRadius,1.92,28,12),stipeMat);stem.position.y=1.07;
   if(state.attachment==="decurrent"&&state.surface==="gills"){const skirt=mesh(new THREE.CylinderGeometry(.18,.13,.36,32),mat(0xbba078,THREE.DoubleSide));skirt.position.y=1.80;}
   const cap=mesh(capGeometry(state.cap),capMat);cap.userData.part="pileus";
   fertile(state.surface,state.attachment);
  }else if(state.form==="bracket"){
   const bracket=mesh(capGeometry(state.cap,1.18),capMat);bracket.scale.set(1,.52,.72);bracket.position.set(-.25,-.75,0);
   const edge=mesh(new THREE.CylinderGeometry(.96,.96,.07,42),mat(state.surface==="smooth"?0xc6b690:0x866545));edge.scale.z=.74;edge.position.set(-.25,1.27,0);
  }else{
   const cup=mesh(new THREE.LatheGeometry(Array.from({length:18},(_,i)=>{const t=i/17;return new THREE.Vector2(.15+1.15*t, .85+.87*t*t)}),48),mat(0xc69d5a,THREE.DoubleSide));cup.position.y=.1;
   const inner=mesh(new THREE.CircleGeometry(1.2,48),mat(0x916e4d,THREE.DoubleSide));inner.rotation.x=-Math.PI/2;inner.position.y=1.82;
  }
  status.textContent="3D updated: "+state.form+" · "+state.cap+" · "+state.stipe+" · "+state.attachment+" · "+state.surface+" · "+state.substrate+". "+(state.form==="agaric"?"Geometry displays the selected fertile surface.":"Non-agaric fertile structures remain schematic.")+" No taxonomic identification implied.";
  const shape=state.spore==="globose"?'<circle cx="49" cy="33" r="19"/>':state.spore==="fusiform"?'<path d="M13 33 Q49 -1 86 33 Q49 67 13 33Z"/>':'<ellipse cx="49" cy="33" rx="32" ry="18"/>';
  frame.querySelector("#mb-microscopy").innerHTML='<svg viewBox="0 0 100 68" role="img" aria-label="'+state.spore+' diagrammatic spore"><g fill="#a48cba" stroke="#edcffe" stroke-width="3">'+shape+'</g></svg><span><strong>Microscopy:</strong> '+state.spore+' spore (diagram, not to scale)</span>';
 }
 const onChange=e=>{if(e.target.closest("#myco-visual-builder")&&e.target.matches("[data-mb-trait]"))model(traits());};
 host.addEventListener("change",onChange);
 const reset=()=>{model(traits())};host.querySelector("#mb-reset")?.addEventListener("click",()=>requestAnimationFrame(reset));
 frame.querySelector("#mb-3d-resetview").addEventListener("click",()=>{camera.position.set(4.8,3.2,5.5);controls.target.set(0,1.2,0);controls.update()});
 const observer=new ResizeObserver(()=>{const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();});observer.observe(canvas);
 let visible=true;const visibility=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;});visibility.observe(frame);
 function animate(){if(disposed)return;if(visible&&!document.hidden){controls.update();renderer.render(scene,camera);}requestAnimationFrame(animate);}
 window.addEventListener("pagehide",()=>{disposed=true;observer.disconnect();visibility.disconnect();clear();controls.dispose();renderer.dispose()},{once:true});
 model(traits());animate();
 window.MycoSimCreative3D=Object.freeze({getState:()=>({...traits(),meshCount:root.children.length}),resetView:()=>frame.querySelector("#mb-3d-resetview").click()});
}
