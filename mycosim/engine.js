import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {PROFILE_BY_ID} from "./profiles.js";
import {DEFAULT_VARIANTS,validateVariantSelection} from "./variants.js";

const mat=(color,roughness=.85)=>new THREE.MeshStandardMaterial({color,roughness,metalness:0});
const MATERIALS={
  cap:mat(0x9a4a2d,.78),cap2:mat(0x754227,.84),flesh:mat(0xe6dcc3,.92),
  gill:new THREE.MeshStandardMaterial({color:0xd0c1a1,roughness:.95,side:THREE.DoubleSide}),
  stipe:mat(0xdfd2b6,.9),pore:mat(0xc6a34a,.92),coral:mat(0xd8893a,.86),
  morel:mat(0x85572f,.98),puff:mat(0xb6a37c,.98),jelly:new THREE.MeshPhysicalMaterial({color:0x9d5b40,roughness:.35,transmission:.18,transparent:true,opacity:.9}),
  crust:mat(0xb78650,.95),wood:mat(0x493326,1)
};

export class MycoSimEngine{
  constructor({canvas,onHover,onSelect,onStatus,onStats}){
    this.canvas=canvas; this.onHover=onHover; this.onSelect=onSelect; this.onStatus=onStatus; this.onStats=onStats;
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled=true; this.renderer.localClippingEnabled=true;
    this.scene=new THREE.Scene();
    this.scene.fog=new THREE.FogExp2(0x091011,.035);
    this.camera=new THREE.PerspectiveCamera(34,1,.1,100);
    this.controls=new OrbitControls(this.camera,this.canvas);
    this.controls.enableDamping=true; this.controls.minDistance=3; this.controls.maxDistance=14;
    this.root=new THREE.Group(); this.scene.add(this.root);
    this.objects=new Map(); this.pickables=[]; this.hidden=new Set(); this.isolated=null; this.mode="macro"; this.variants={...DEFAULT_VARIANTS};
    this.raycaster=new THREE.Raycaster(); this.pointer=new THREE.Vector2();
    this.lastHover=null; this.frames=0; this.fpsStart=performance.now(); this.fly=null; this.exploded=false; this.sectioned=false; this.originalTransforms=new Map();
    this._setupScene(); this._bind(); this.resize();
    this.resizeObserver=new ResizeObserver(()=>this.resize()); this.resizeObserver.observe(this.canvas);
    this.running=true; this._animate();
  }

  _setupScene(){
    this.scene.add(new THREE.HemisphereLight(0xf5ecd2,0x102018,2.7));
    const key=new THREE.DirectionalLight(0xffe6b0,3.2); key.position.set(5,8,5); key.castShadow=true; this.scene.add(key);
    const fill=new THREE.DirectionalLight(0x9cb9ff,1.15); fill.position.set(-4,3,-5); this.scene.add(fill);
    const ground=new THREE.Mesh(new THREE.CylinderGeometry(2.7,3,.28,72),MATERIALS.wood.clone());
    ground.position.y=-.72; ground.receiveShadow=true; this.scene.add(ground);
    const grid=new THREE.GridHelper(14,28,0x31403a,0x1b2824); grid.position.y=-.55; this.scene.add(grid);
  }

  _bind(){
    this._pointerMove=e=>this._pick(e,false);
    this._pointerClick=e=>this._pick(e,true);
    this.canvas.addEventListener("pointermove",this._pointerMove,{passive:true});
    this.canvas.addEventListener("click",this._pointerClick);
  }

  addObject(mesh,meta){
    mesh.userData={...mesh.userData,...meta};
    mesh.castShadow=true; mesh.receiveShadow=true;
    this.root.add(mesh); this.pickables.push(mesh); this.objects.set(meta.id,mesh); this._rememberTransform(mesh);
    return mesh;
  }

  _rememberTransform(obj){
    if(!obj||this.originalTransforms.has(obj)) return;
    this.originalTransforms.set(obj,{
      position:obj.position.clone(),rotation:obj.rotation.clone(),scale:obj.scale.clone()
    });
  }

  _restoreTransforms(){
    for(const [obj,t] of this.originalTransforms){
      if(!obj?.parent) continue;
      obj.position.copy(t.position); obj.rotation.copy(t.rotation); obj.scale.copy(t.scale);
    }
  }

  register(mesh,id,label,category,parentId=null){
    return this.addObject(mesh,{id,label,category,parentId,selectable:true});
  }

  cleanupModel(){
    this.clearKnowledgeProxy?.(); this.objects.clear(); this.pickables.length=0; this.hidden.clear(); this.isolated=null; this.lastHover=null; this.exploded=false; this.sectioned=false; this.originalTransforms.clear();
    for(const child of [...this.root.children]){
      this.root.remove(child);
      child.traverse?.(n=>{
        if(n.geometry) n.geometry.dispose();
        if(n.material){
          const mats=Array.isArray(n.material)?n.material:[n.material];
          for(const m of mats) m?.dispose?.();
        }
      });
    }
    for(const m of Object.values(MATERIALS)){m.transparent=false;m.opacity=1;m.depthWrite=true;}
  }

  loadProfile(id){
    const p=PROFILE_BY_ID[id]; if(!p) throw new Error("Unknown morphology profile: "+id);
    this.onStatus?.("Loading "+p.label+"…");
    this.cleanupModel();
    const fn=this["build_"+p.factory];
    if(typeof fn!=="function") throw new Error("Missing model factory: "+p.factory);
    fn.call(this);
    this.currentProfile=p;
    this.mode="macro"; this.applyMode();
    this.camera.position.set(5.2,3.3,7.4); this.controls.target.set(0,1.45,0); this.controls.update();
    this.onStatus?.("3D engine online · "+p.label);
    return p;
  }

  applyMode(){
    for(const o of this.objects.values()){
      o.traverse?.(n=>{
        if(!n.material)return;
        for(const x of (Array.isArray(n.material)?n.material:[n.material])){
          x.transparent=false;x.opacity=1;x.depthWrite=true;
        }
      });
    }
    const alpha=this.mode==="internal"?.34:this.mode==="micro"?.16:this.mode==="spore"?.1:1;
    if(alpha<1){
      for(const [id,o] of this.objects){
        if(["hymenophore","tube_layer","fertile_head","gleba"].includes(id)) continue;
        o.traverse?.(n=>{
          if(!n.material)return;
          for(const m of (Array.isArray(n.material)?n.material:[n.material])){
            m.transparent=true;m.opacity=alpha;m.depthWrite=alpha>.3;
          }
        });
      }
    }
    this._applyVisibility();
  }

  setMode(mode){this.mode=mode;this.applyMode();}

  setVariant(group,value){
    const next={...this.variants,[group]:value};
    const v=validateVariantSelection(next);
    if(!v.valid) throw new Error(v.errors.join("; "));
    this.variants=next;
    if(this.currentProfile) this.loadProfile(this.currentProfile.id);
  }

  getVariantState(){return {...this.variants};}

  _applyVisibility(){
    for(const [id,o] of this.objects){
      o.visible=!this.hidden.has(id) && (!this.isolated || this.isolated===id || o.userData.parentId===this.isolated);
    }
  }
  isolate(id){this.isolated=id;this._applyVisibility();}
  clearIsolation(){this.isolated=null;this._applyVisibility();}
  hide(id){this.hidden.add(id);this._applyVisibility();}
  show(id){this.hidden.delete(id);this._applyVisibility();}
  setTransparent(id,opacity=.2){
    const o=this.objects.get(id); if(!o)return;
    for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.transparent=true;m.opacity=opacity;m.depthWrite=false;}
  }
  setExploded(enabled=true){
    this._restoreTransforms();
    this.exploded=!!enabled;
    if(!enabled){this.applyMode();return;}
    const offsets={
      pileus:[0,1.15,0],pileus_context:[0,.65,0],hymenophore:[0,.22,0],
      tube_layer:[0,.18,0],context:[0,.48,0],stipe:[0,-.35,0],
      stipe_base:[0,-.75,0],veil_structure:[.85,0,0],peridium:[0,.55,0],
      gleba:[0,0,0],apical_pore:[0,1.0,0],sterile_base:[0,-.55,0],
      fertile_head:[0,.85,0],internal_cavity:[.8,0,0],excipulum:[.65,0,0],
      substrate:[-1.0,0,0],margin:[0,.35,0],lobes:[0,.45,0],attachment:[0,-.5,0],
      branch_system:[0,.35,0],base:[0,-.45,0]
    };
    for(const [id,o] of this.objects){
      const d=offsets[id]||[0,.25,0];
      o.position.add(new THREE.Vector3(...d));
    }
    this._applyVisibility();
  }

  setSection(enabled=true){
    this.sectioned=!!enabled;
    const plane=new THREE.Plane(new THREE.Vector3(1,0,0),0);
    for(const o of this.objects.values()){
      o.traverse?.(n=>{
        if(!n.material)return;
        const mats=Array.isArray(n.material)?n.material:[n.material];
        for(const m of mats){m.clippingPlanes=enabled?[plane]:[];m.clipShadows=enabled;m.needsUpdate=true;}
      });
    }
  }

  contextualTransparency(id,opacity=.12){
    const focus=this.objects.get(id);
    if(!focus)return;
    const keep=new Set([id,focus.userData.parentId].filter(Boolean));
    for(const [oid,o] of this.objects){
      o.traverse?.(n=>{
        if(!n.material)return;
        const mats=Array.isArray(n.material)?n.material:[n.material];
        for(const m of mats){
          if(keep.has(oid)){m.transparent=false;m.opacity=1;m.depthWrite=true;}
          else{m.transparent=true;m.opacity=opacity;m.depthWrite=false;}
        }
      });
    }
  }

  resetPresentation(){
    this.isolated=null;this.hidden.clear();this._restoreTransforms();this.exploded=false;this.setSection(false);this.applyMode();
  }

  flyTo(id,duration=650){
    const o=this.objects.get(id); if(!o)return false;
    const box=new THREE.Box3().setFromObject(o),center=box.getCenter(new THREE.Vector3()),size=Math.max(.4,box.getSize(new THREE.Vector3()).length());
    const dir=this.camera.position.clone().sub(this.controls.target).normalize();
    const endPos=center.clone().add(dir.multiplyScalar(Math.max(2.2,size*2.15)));
    this.fly={
      start:performance.now(),duration,
      fromPos:this.camera.position.clone(),toPos:endPos,
      fromTarget:this.controls.target.clone(),toTarget:center
    };
    return true;
  }

  focus(id){return this.flyTo(id);}

  _pick(e,select){
    const r=this.canvas.getBoundingClientRect();
    this.pointer.x=((e.clientX-r.left)/r.width)*2-1; this.pointer.y=-((e.clientY-r.top)/r.height)*2+1;
    this.raycaster.setFromCamera(this.pointer,this.camera);
    const hit=this.raycaster.intersectObjects(this.pickables.filter(x=>x.visible),false)[0];
    const meta=hit?.object?.userData||null;
    this.canvas.style.cursor=meta?"pointer":"grab";
    if(!select && meta?.id!==this.lastHover){this.lastHover=meta?.id||null;this.onHover?.(meta);}
    if(select && meta){this.onSelect?.(meta);this.focus(meta.id);}
  }

  showKnowledgeProxy(id){
    const microIds=new Set(["trama","subhymenium","hymenium","basidium","sterigmata","basidiospore","ascus","ascospore","tube","pore_surface"]);
    if(!microIds.has(id)) return false;
    let micro=this.scene.getObjectByName("knowledge_proxy");
    if(micro){this.scene.remove(micro);micro.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material){for(const m of (Array.isArray(n.material)?n.material:[n.material]))m.dispose?.();}});}
    micro=new THREE.Group();micro.name="knowledge_proxy";
    const membrane=new THREE.MeshStandardMaterial({color:0xe5d7c2,roughness:.7,transparent:true,opacity:.9});
    const fertile=new THREE.MeshStandardMaterial({color:0xc88a62,roughness:.72});
    const sporeMat=new THREE.MeshStandardMaterial({color:0x8e5b35,roughness:.82});
    if(id==="trama"||id==="subhymenium"||id==="hymenium"){
      const layers=[
        ["trama",0,.34,0xd8c9ae],
        ["subhymenium",.42,.18,0xd7ad89],
        ["hymenium",.66,.16,0xb96d53]
      ];
      for(const [name,y,h,c] of layers){
        const m=new THREE.Mesh(new THREE.BoxGeometry(2.8,h,1.35),new THREE.MeshStandardMaterial({color:c,roughness:.85}));
        m.position.y=y;m.userData={id:name,label:name,category:"micro"};micro.add(m);
      }
    }else if(id==="basidium"||id==="sterigmata"){
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(.32,.48,1.65,24),fertile);stem.position.y=.2;micro.add(stem);
      for(let i=0;i<4;i++){
        const a=(i/4)*Math.PI*2;
        const sg=new THREE.Mesh(new THREE.CylinderGeometry(.04,.06,.55,12),membrane);sg.position.set(Math.cos(a)*.24,1.12,Math.sin(a)*.24);sg.rotation.z=Math.cos(a)*.18;sg.rotation.x=Math.sin(a)*.18;micro.add(sg);
        const sp=new THREE.Mesh(new THREE.SphereGeometry(.18,22,14),sporeMat);sp.scale.set(1.35,.82,.8);sp.position.set(Math.cos(a)*.38,1.55,Math.sin(a)*.38);micro.add(sp);
      }
    }else if(id==="ascus"){
      const ascus=new THREE.Mesh(new THREE.CapsuleGeometry(.36,1.5,8,20),membrane);ascus.position.y=.3;micro.add(ascus);
      for(let i=0;i<8;i++){const sp=new THREE.Mesh(new THREE.SphereGeometry(.11,18,12),sporeMat);sp.scale.set(1.5,.65,.65);sp.position.set(0,-.3+i*.18,0);micro.add(sp);}
    }else if(id==="basidiospore"||id==="ascospore"){
      const sp=new THREE.Mesh(new THREE.SphereGeometry(.72,40,24),sporeMat);sp.scale.set(1.5,.75,.72);micro.add(sp);
    }else if(id==="tube"||id==="pore_surface"){
      const tube=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,2.2,32,1,true),membrane);tube.rotation.x=Math.PI/2;micro.add(tube);
      const pore=new THREE.Mesh(new THREE.TorusGeometry(.72,.08,14,40),fertile);pore.rotation.x=Math.PI/2;pore.position.z=1.1;micro.add(pore);
    }
    micro.position.set(0,1.15,0);micro.scale.setScalar(1.2);this.scene.add(micro);
    this.fly={start:performance.now(),duration:650,fromPos:this.camera.position.clone(),toPos:new THREE.Vector3(3.8,2.6,5.4),fromTarget:this.controls.target.clone(),toTarget:new THREE.Vector3(0,1.3,0)};
    return true;
  }

  clearKnowledgeProxy(){
    const micro=this.scene.getObjectByName("knowledge_proxy");
    if(!micro)return;
    this.scene.remove(micro);
    micro.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material){for(const m of (Array.isArray(n.material)?n.material:[n.material]))m.dispose?.();}});
  }

  resize(){
    const r=this.canvas.getBoundingClientRect();
    this.renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);
    this.camera.aspect=Math.max(.1,r.width/Math.max(1,r.height)); this.camera.updateProjectionMatrix();
  }

  _animate(){
    if(!this.running)return;
    if(this.fly){
      const t=Math.min(1,(performance.now()-this.fly.start)/this.fly.duration);
      const u=1-Math.pow(1-t,3);
      this.camera.position.lerpVectors(this.fly.fromPos,this.fly.toPos,u);
      this.controls.target.lerpVectors(this.fly.fromTarget,this.fly.toTarget,u);
      if(t>=1)this.fly=null;
    }
    this.controls.update(); this.renderer.render(this.scene,this.camera);
    this.frames++; const now=performance.now();
    if(now-this.fpsStart>=1000){
      const fps=Math.round(this.frames*1000/(now-this.fpsStart)); this.onStats?.({fps,objects:this.objects.size,drawCalls:this.renderer.info.render.calls});
      this.frames=0; this.fpsStart=now;
    }
    requestAnimationFrame(()=>this._animate());
  }

  dispose(){
    this.running=false; this.cleanupModel(); this.resizeObserver?.disconnect();
    this.canvas.removeEventListener("pointermove",this._pointerMove); this.canvas.removeEventListener("click",this._pointerClick);
    this.controls.dispose(); this.renderer.dispose();
  }

  _pileusGeometry(form,radius=1.6,segments=72){
    const g=new THREE.CircleGeometry(radius,segments);
    const p=g.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),r=Math.min(1,Math.hypot(x,y)/radius);
      let z=.35*(1-r*r);
      if(form==="plane") z=.08*(1-r*r);
      else if(form==="umbonate") z=.18*(1-r*r)+.38*Math.exp(-Math.pow(r/.22,2));
      else if(form==="depressed") z=.24*(1-r*r)-.28*Math.exp(-Math.pow(r/.34,2));
      else if(form==="funnel") z=.08+.38*r-.48*Math.pow(1-r,2);
      else if(form==="campanulate") z=.78*Math.pow(1-r,1.7);
      else if(form==="conical") z=.72*(1-r);
      else if(form==="hemispherical") z=.76*Math.sqrt(Math.max(0,1-r*r));
      p.setZ(i,z);
    }
    p.needsUpdate=true; g.computeVertexNormals(); return g;
  }

  _addPileus(form="convex",radius=1.6,y=2.55,material=MATERIALS.cap){
    const mesh=this.register(new THREE.Mesh(this._pileusGeometry(form,radius),material.clone()),"pileus","Pileus / cap","macro");
    mesh.rotation.x=-Math.PI/2; mesh.position.y=y; return mesh;
  }

  _addStipe(form="equal",{height=2.5,y=.8,top=.28,bottom=.34,x=0,z=0}={}){
    if(form==="absent") return null;
    let topR=top,bottomR=bottom,h=height,offsetX=x;
    if(form==="taper_up"){topR=.20;bottomR=.42}
    if(form==="taper_down"){topR=.40;bottomR=.22}
    if(form==="clavate"){topR=.25;bottomR=.55}
    if(form==="bulbous"||form==="marginate_bulb"){topR=.27;bottomR=.33}
    if(form==="rooting"){topR=.27;bottomR=.30;h=height+1}
    if(form==="lateral") offsetX=-.72;
    if(form==="eccentric") offsetX=-.36;
    const st=this.register(new THREE.Mesh(new THREE.CylinderGeometry(topR,bottomR,h,40),MATERIALS.stipe.clone()),"stipe","Stipe","macro");
    st.position.set(offsetX,y,z);
    if(form==="bulbous"){
      const b=this.register(new THREE.Mesh(new THREE.SphereGeometry(.58,32,20),MATERIALS.stipe.clone()),"stipe_base","Bulbous base","macro","stipe");
      b.scale.y=.6;b.position.set(offsetX,y-h/2-.12,z);
    }else if(form==="marginate_bulb"){
      const b=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.62,.48,.34,36),MATERIALS.stipe.clone()),"stipe_base","Marginate bulb","macro","stipe");
      b.position.set(offsetX,y-h/2-.12,z);
    }else if(form==="rooting"){
      const root=this.register(new THREE.Mesh(new THREE.ConeGeometry(.22,.9,28),MATERIALS.stipe.clone()),"stipe_base","Rooting base","macro","stipe");
      root.position.set(offsetX,y-h/2-.55,z);root.rotation.x=Math.PI;
    }else{
      const b=this.register(new THREE.Mesh(new THREE.SphereGeometry(.38,28,18),MATERIALS.stipe.clone()),"stipe_base","Stipe base","macro","stipe");
      b.scale.y=.45;b.position.set(offsetX,y-h/2-.05,z);
    }
    return st;
  }

  _addGillHymenophore(type="adnate",pileusY=2.45,stipeX=0){
    if(["pores","tubes"].includes(type)){
      const tubes=this.register(new THREE.Mesh(new THREE.CylinderGeometry(1.28,1.15,type==="tubes"?.38:.18,56),MATERIALS.pore.clone()),type==="tubes"?"tube_layer":"hymenophore",type==="tubes"?"Tube layer":"Pores","fertile");
      tubes.position.set(0,pileusY-.35,0);
      if(type==="tubes"){
        const pores=this.register(new THREE.Mesh(new THREE.CylinderGeometry(1.17,1.17,.025,56),MATERIALS.pore.clone()),"hymenophore","Pore surface","fertile");
        pores.position.set(0,pileusY-.56,0);
      }
      return;
    }
    if(type==="teeth"){
      const group=new THREE.Group(); group.userData={id:"hymenophore",label:"Teeth / spines",category:"fertile",selectable:true};
      for(let r=.28;r<1.24;r+=.22){const n=Math.max(12,Math.round(r*34));for(let i=0;i<n;i++){const a=i/n*Math.PI*2,t=new THREE.Mesh(new THREE.ConeGeometry(.03,.28,7),MATERIALS.gill.clone());t.position.set(Math.cos(a)*r,pileusY-.27,Math.sin(a)*r);t.rotation.x=Math.PI;t.userData=group.userData;group.add(t);this.pickables.push(t);}}
      this.root.add(group);this.objects.set("hymenophore",group);return;
    }
    if(type==="folds"){
      const group=new THREE.Group(); group.userData={id:"hymenophore",label:"Folds / ridges",category:"fertile",selectable:true};
      for(let i=0;i<24;i++){const a=i/24*Math.PI*2,g=new THREE.Mesh(new THREE.TorusGeometry(.72+.18*Math.sin(i),.035,8,36,Math.PI*.85),MATERIALS.gill.clone());g.scale.set(1,.25,1);g.rotation.set(Math.PI/2,a,0);g.position.y=pileusY-.26;g.userData=group.userData;group.add(g);this.pickables.push(g);}
      this.root.add(group);this.objects.set("hymenophore",group);return;
    }
    if(type==="smooth"){
      const h=this.register(new THREE.Mesh(new THREE.CircleGeometry(1.25,56),MATERIALS.gill.clone()),"hymenophore","Smooth fertile surface","fertile");h.rotation.x=Math.PI/2;h.position.y=pileusY-.24;return;
    }
    const innerMap={free_gills:.42,adnexed:.28,adnate:.16,sinuate:.22,decurrent:.06};
    const inner=innerMap[type]??.16,outer=1.28,len=outer-inner;
    const group=new THREE.Group();group.userData={id:"hymenophore",label:"Lamellae / gills",category:"fertile",selectable:true};
    for(let i=0;i<52;i++){
      const a=i/52*Math.PI*2,g=new THREE.Mesh(new THREE.BoxGeometry(len,.035,.016),MATERIALS.gill.clone());
      const mid=(inner+outer)/2;
      g.position.set(stipeX+Math.cos(a)*mid,pileusY-.25-(type==="decurrent"?.08:0),Math.sin(a)*mid);
      g.rotation.y=-a; if(type==="sinuate")g.rotation.z=.035*Math.sin(a*2); if(type==="decurrent")g.rotation.z=.06;
      g.userData=group.userData;group.add(g);this.pickables.push(g);
    }
    this.root.add(group);this.objects.set("hymenophore",group);
  }

  _addVeil(type="annulus",stipeX=0,capY=2.45){
    if(type==="none") return;
    if(type==="annulus"){
      const ring=this.register(new THREE.Mesh(new THREE.TorusGeometry(.43,.075,12,48),MATERIALS.flesh.clone()),"veil_structure","Annulus","veil","stipe");ring.rotation.x=Math.PI/2;ring.position.set(stipeX,1.62,0);
    }else if(type==="cortina"){
      const g=new THREE.Group();g.userData={id:"veil_structure",label:"Cortina","category":"veil",selectable:true};
      for(let i=0;i<18;i++){const a=i/18*Math.PI*2;const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(stipeX+Math.cos(a)*.3,1.55,Math.sin(a)*.3),new THREE.Vector3(Math.cos(a)*1.05,capY-.18,Math.sin(a)*1.05)]);const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xb8ab93,transparent:true,opacity:.45}));l.userData=g.userData;g.add(l);this.pickables.push(l);}
      this.root.add(g);this.objects.set("veil_structure",g);
    }else if(type==="volva"){
      const cup=this.register(new THREE.Mesh(new THREE.SphereGeometry(.62,32,18,0,Math.PI*2,Math.PI/2,Math.PI/2),MATERIALS.flesh.clone()),"veil_structure","Volva","veil","stipe");cup.scale.y=.55;cup.position.set(stipeX,-.46,0);
    }else if(type==="universal_remnants"){
      const g=new THREE.Group();g.userData={id:"veil_structure",label:"Universal veil remnants",category:"veil",selectable:true};
      for(let i=0;i<13;i++){const a=i/13*Math.PI*2,r=.35+.65*((i%5)/5),w=new THREE.Mesh(new THREE.SphereGeometry(.09+(i%3)*.015,12,8),MATERIALS.flesh.clone());w.position.set(Math.cos(a)*r,capY+.12+.18*(1-r),Math.sin(a)*r);w.scale.y=.5;w.userData=g.userData;g.add(w);this.pickables.push(w);}
      this.root.add(g);this.objects.set("veil_structure",g);
    }
  }

  build_agaricoid(){
    const v=this.variants, capY=2.48;
    this._addPileus(v.pileus,1.62,capY,MATERIALS.cap);
    const ctx=this.register(new THREE.Mesh(new THREE.CylinderGeometry(1.32,1.08,.15,56),MATERIALS.flesh.clone()),"pileus_context","Pileus context","internal","pileus");ctx.position.y=capY-.18;
    const stipe=this._addStipe(v.stipe,{height:2.45,y:.78,top:.27,bottom:.34});
    const stipeX=stipe?.position.x||0;
    this._addGillHymenophore(v.hymenophore,capY,stipeX);
    this._addVeil(v.veil,stipeX,capY);
  }

  build_boletoid(){
    const v=this.variants,capY=2.55;
    this._addPileus(v.pileus,1.68,capY,MATERIALS.cap2);
    const tubes=this.register(new THREE.Mesh(new THREE.CylinderGeometry(1.32,1.15,.40,56),MATERIALS.pore.clone()),"tube_layer","Tube layer","fertile");tubes.position.y=capY-.46;
    const pores=this.register(new THREE.Mesh(new THREE.CylinderGeometry(1.17,1.17,.025,56),MATERIALS.pore.clone()),"hymenophore","Pore surface","fertile");pores.position.y=capY-.68;
    const st=this._addStipe(v.stipe,{height:2.5,y:.72,top:.34,bottom:.48});
    this._addVeil(v.veil,st?.position.x||0,capY);
  }

  build_polyporoid(){
    const shelf=this.register(new THREE.Mesh(new THREE.SphereGeometry(1.9,56,28,0,Math.PI*2,0,Math.PI/2.3),MATERIALS.cap.clone()),"pileus","Upper surface / bracket","macro");shelf.scale.set(1.15,.38,.72);shelf.rotation.set(Math.PI,.15,0);shelf.position.set(.35,1.55,0);
    const ctx=this.register(new THREE.Mesh(new THREE.BoxGeometry(2.6,.28,1.65),MATERIALS.flesh.clone()),"context","Context","internal");ctx.position.set(.25,1.25,0);
    const tubes=this.register(new THREE.Mesh(new THREE.BoxGeometry(2.55,.28,1.58),MATERIALS.pore.clone()),"tube_layer","Tube layer","fertile");tubes.position.set(.25,1.02,0);
    const pore=this.register(new THREE.Mesh(new THREE.BoxGeometry(2.55,.035,1.58),MATERIALS.pore.clone()),"hymenophore","Pore surface","fertile");pore.position.set(.25,.86,0);
    const trunk=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.9,1.1,3.4,28),MATERIALS.wood.clone()),"substrate","Woody substrate","ecology");trunk.position.set(-1.55,.5,0);trunk.rotation.z=.08;
  }

  build_hydnoid(){
    const cap=this.register(new THREE.Mesh(new THREE.SphereGeometry(1.55,48,24,0,Math.PI*2,0,Math.PI/2.2),MATERIALS.cap.clone()),"pileus","Pileus / cap","macro");cap.scale.set(1,.5,1);cap.rotation.x=Math.PI;cap.position.y=2.65;
    const st=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.26,.36,2.3,36),MATERIALS.stipe.clone()),"stipe","Stipe","macro");st.position.y=.85;
    const teeth=new THREE.Group();teeth.userData={id:"hymenophore",label:"Teeth / spines",category:"fertile",selectable:true};
    for(let r=.3;r<1.25;r+=.24){for(let i=0;i<Math.max(10,Math.round(r*28));i++){const a=i/Math.max(10,Math.round(r*28))*Math.PI*2;const t=new THREE.Mesh(new THREE.ConeGeometry(.035,.28,7),MATERIALS.gill.clone());t.position.set(Math.cos(a)*r,2.05,Math.sin(a)*r);t.rotation.x=Math.PI;t.userData=teeth.userData;teeth.add(t);this.pickables.push(t);}}
    this.root.add(teeth);this.objects.set("hymenophore",teeth);
  }

  build_hoof_conk(){
    const trunk=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.95,1.12,3.5,28),MATERIALS.wood.clone()),"substrate","Woody substrate","ecology");trunk.position.set(-1.55,.45,0);
    const hoof=this.register(new THREE.Mesh(new THREE.SphereGeometry(1.45,48,30),MATERIALS.cap2.clone()),"pileus","Hoof-shaped upper surface","macro");hoof.scale.set(1.1,.8,.9);hoof.position.set(.05,1.55,0);
    const ctx=this.register(new THREE.Mesh(new THREE.BoxGeometry(2.1,.38,1.45),MATERIALS.flesh.clone()),"context","Context","internal");ctx.position.set(.1,.95,0);
    const tubes=this.register(new THREE.Mesh(new THREE.BoxGeometry(2.0,.38,1.38),MATERIALS.pore.clone()),"tube_layer","Layered tube tissue","fertile");tubes.position.set(.1,.62,0);
    const pore=this.register(new THREE.Mesh(new THREE.BoxGeometry(2.0,.035,1.38),MATERIALS.pore.clone()),"hymenophore","Pore surface","fertile");pore.position.set(.1,.41,0);
  }

  build_hydnoid_bracket(){
    const trunk=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.9,1.08,3.4,28),MATERIALS.wood.clone()),"substrate","Woody substrate","ecology");trunk.position.set(-1.55,.45,0);
    const shelf=this.register(new THREE.Mesh(new THREE.SphereGeometry(1.7,48,28,0,Math.PI*2,0,Math.PI/2.25),MATERIALS.cap.clone()),"pileus","Upper bracket surface","macro");shelf.scale.set(1.12,.34,.7);shelf.rotation.x=Math.PI;shelf.position.set(.25,1.55,0);
    const ctx=this.register(new THREE.Mesh(new THREE.BoxGeometry(2.3,.25,1.5),MATERIALS.flesh.clone()),"context","Context","internal");ctx.position.set(.2,1.25,0);
    const teeth=new THREE.Group();teeth.userData={id:"hymenophore",label:"Teeth / spines",category:"fertile",selectable:true};
    for(let x=-.85;x<=1.15;x+=.18){for(let z=-.55;z<=.55;z+=.18){const t=new THREE.Mesh(new THREE.ConeGeometry(.03,.3,7),MATERIALS.gill.clone());t.position.set(x,1.02,z);t.rotation.x=Math.PI;t.userData=teeth.userData;teeth.add(t);this.pickables.push(t);}}
    this.root.add(teeth);this.objects.set("hymenophore",teeth);
  }

  build_morel(){
    const st=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.28,.42,2.4,32),MATERIALS.stipe.clone()),"stipe","Hollow stipe","macro");st.position.y=.55;
    const head=this.register(new THREE.Mesh(new THREE.SphereGeometry(.88,40,28),MATERIALS.morel.clone()),"fertile_head","Fertile head","macro");head.scale.set(.78,1.5,.78);head.position.y=2.55;
    const wire=new THREE.LineSegments(new THREE.WireframeGeometry(head.geometry),new THREE.LineBasicMaterial({color:0xc69a65,transparent:true,opacity:.55}));wire.scale.copy(head.scale);wire.position.copy(head.position);wire.userData={id:"hymenophore",label:"Ridges and pits",category:"fertile",selectable:true};this.root.add(wire);this.pickables.push(wire);this.objects.set("hymenophore",wire);
    const cavity=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,3.4,20),new THREE.MeshStandardMaterial({color:0x2b1d17,roughness:1})),"internal_cavity","Internal cavity","internal");cavity.position.y=1.25;
  }

  build_coral(){
    const group=new THREE.Group();group.userData={id:"branch_system",label:"Branch system",category:"macro",selectable:true};
    const addBranch=(x,y,z,len,rad,depth)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rad*.72,rad,len,10),MATERIALS.coral.clone());m.position.set(x,y+len/2,z);m.userData=group.userData;group.add(m);this.pickables.push(m);if(depth>0){[[-.35,.15],[.35,.1],[0,.36]].forEach(d=>addBranch(x+d[0],y+len*.92,z+d[1],len*.62,rad*.72,depth-1));}};
    for(let i=-2;i<=2;i++)addBranch(i*.22,-.45,Math.abs(i%2)*.12,1.5-Math.abs(i)*.08,.13,2);
    this.root.add(group);this.objects.set("branch_system",group);this.objects.set("hymenophore",group);
  }

  build_puffball(){
    const per=this.register(new THREE.Mesh(new THREE.SphereGeometry(1.15,44,28),MATERIALS.puff.clone()),"peridium","Peridium","macro");per.scale.y=.95;per.position.y=1.05;
    const gleba=this.register(new THREE.Mesh(new THREE.SphereGeometry(.82,32,20),new THREE.MeshStandardMaterial({color:0x635442,roughness:1,transparent:true,opacity:.5})),"gleba","Gleba","internal");gleba.position.y=1.05;
    const neck=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.42,.58,.75,30),MATERIALS.puff.clone()),"sterile_base","Sterile base","macro");neck.position.y=-.05;
    const pore=this.register(new THREE.Mesh(new THREE.TorusGeometry(.11,.035,10,28),MATERIALS.wood.clone()),"apical_pore","Apical pore","macro");pore.rotation.x=Math.PI/2;pore.position.y=2.12;
  }

  build_cup(){
    const cup=this.register(new THREE.Mesh(new THREE.SphereGeometry(1.25,48,24,0,Math.PI*2,Math.PI/2.2,Math.PI/2.2),MATERIALS.cap.clone()),"apothecium","Apothecium","macro");cup.scale.y=.65;cup.position.y=1.15;
    const hym=this.register(new THREE.Mesh(new THREE.CircleGeometry(.92,48),MATERIALS.gill.clone()),"hymenophore","Inner hymenial surface","fertile");hym.rotation.x=-Math.PI/2;hym.position.y=1.37;
    const base=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.18,.3,.7,28),MATERIALS.stipe.clone()),"stipe","Short stipe / base","macro");base.position.y=.15;
    const exc=this.register(new THREE.Mesh(new THREE.TorusGeometry(1.02,.12,12,48),MATERIALS.flesh.clone()),"excipulum","Excipulum","internal");exc.rotation.x=Math.PI/2;exc.position.y=1.37;
  }

  build_jelly(){
    const group=new THREE.Group();group.userData={id:"lobes",label:"Gelatinous lobes",category:"macro",selectable:true};
    for(let i=0;i<6;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.65,28,18),MATERIALS.jelly.clone());l.scale.set(1,.55,.75);l.position.set(Math.cos(i)*.55,.45+Math.sin(i*.8)*.18,Math.sin(i)*.45);l.rotation.set(i*.17,i*.31,0);l.userData=group.userData;group.add(l);this.pickables.push(l);}
    this.root.add(group);this.objects.set("lobes",group);this.objects.set("hymenophore",group);
    const att=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.26,.4,.45,24),MATERIALS.jelly.clone()),"attachment","Attachment base","macro");att.position.y=-.35;
  }

  build_crust(){
    const wood=this.register(new THREE.Mesh(new THREE.BoxGeometry(4,.7,2.4),MATERIALS.wood.clone()),"substrate","Woody substrate","ecology");wood.position.y=-.25;
    const crust=this.register(new THREE.Mesh(new THREE.BoxGeometry(3.6,.08,2.05),MATERIALS.crust.clone()),"hymenophore","Exposed fertile surface","fertile");crust.position.y=.14;
    const ctx=this.register(new THREE.Mesh(new THREE.BoxGeometry(3.65,.12,2.1),MATERIALS.flesh.clone()),"context","Subicular context","internal");ctx.position.y=.04;
    const margin=this.register(new THREE.Mesh(new THREE.TorusGeometry(1.45,.06,10,64),MATERIALS.flesh.clone()),"margin","Growing margin","macro");margin.rotation.x=Math.PI/2;margin.scale.z=.65;margin.position.y=.2;
  }
}
