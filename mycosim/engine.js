import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {PROFILE_BY_ID} from "./profiles.js";

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
    this.renderer.shadowMap.enabled=true;
    this.scene=new THREE.Scene();
    this.scene.fog=new THREE.FogExp2(0x091011,.035);
    this.camera=new THREE.PerspectiveCamera(34,1,.1,100);
    this.controls=new OrbitControls(this.camera,this.canvas);
    this.controls.enableDamping=true; this.controls.minDistance=3; this.controls.maxDistance=14;
    this.root=new THREE.Group(); this.scene.add(this.root);
    this.objects=new Map(); this.pickables=[]; this.hidden=new Set(); this.isolated=null; this.mode="macro";
    this.raycaster=new THREE.Raycaster(); this.pointer=new THREE.Vector2();
    this.lastHover=null; this.frames=0; this.fpsStart=performance.now();
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
    this.root.add(mesh); this.pickables.push(mesh); this.objects.set(meta.id,mesh);
    return mesh;
  }

  register(mesh,id,label,category,parentId=null){
    return this.addObject(mesh,{id,label,category,parentId,selectable:true});
  }

  cleanupModel(){
    this.objects.clear(); this.pickables.length=0; this.hidden.clear(); this.isolated=null; this.lastHover=null;
    for(const child of [...this.root.children]){
      this.root.remove(child);
      child.traverse?.(n=>{if(n.geometry)n.geometry.dispose();});
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
      const m=o.material;
      if(!m) continue;
      const mats=Array.isArray(m)?m:[m];
      for(const x of mats){x.transparent=false;x.opacity=1;x.depthWrite=true;}
    }
    const alpha=this.mode==="internal"?.34:this.mode==="micro"?.16:this.mode==="spore"?.1:1;
    if(alpha<1){
      for(const o of this.objects.values()){
        if(["hymenophore","tube_layer","teeth","fertile_head","gleba"].includes(o.userData.id)) continue;
        const ms=Array.isArray(o.material)?o.material:[o.material];
        for(const m of ms){if(!m)continue;m.transparent=true;m.opacity=alpha;m.depthWrite=alpha>.3;}
      }
    }
    this._applyVisibility();
  }

  setMode(mode){this.mode=mode;this.applyMode();}

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
  focus(id){
    const o=this.objects.get(id); if(!o)return;
    const box=new THREE.Box3().setFromObject(o), center=box.getCenter(new THREE.Vector3()), size=box.getSize(new THREE.Vector3()).length();
    this.controls.target.copy(center);
    const dir=this.camera.position.clone().sub(center).normalize();
    this.camera.position.copy(center.clone().add(dir.multiplyScalar(Math.max(2.5,size*2.2))));
    this.controls.update();
  }

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

  resize(){
    const r=this.canvas.getBoundingClientRect();
    this.renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);
    this.camera.aspect=Math.max(.1,r.width/Math.max(1,r.height)); this.camera.updateProjectionMatrix();
  }

  _animate(){
    if(!this.running)return;
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

  build_agaricoid(){
    const cap=this.register(new THREE.Mesh(new THREE.SphereGeometry(1.6,56,28,0,Math.PI*2,0,Math.PI/2.05),MATERIALS.cap.clone()),"pileus","Pileus / cap","macro");
    cap.scale.set(1,.62,1);cap.rotation.x=Math.PI;cap.position.y=2.95;
    const ctx=this.register(new THREE.Mesh(new THREE.CylinderGeometry(1.34,1.08,.18,56),MATERIALS.flesh.clone()),"pileus_context","Pileus context","internal","pileus");ctx.position.y=2.2;
    const gGroup=new THREE.Group();gGroup.userData={id:"hymenophore",label:"Lamellae / gills",category:"fertile",selectable:true};
    for(let i=0;i<48;i++){const a=i/48*Math.PI*2,g=new THREE.Mesh(new THREE.BoxGeometry(1.12,.035,.016),MATERIALS.gill.clone());g.position.set(Math.cos(a)*.56,2.1,Math.sin(a)*.56);g.rotation.y=-a;g.userData=gGroup.userData;gGroup.add(g);this.pickables.push(g);}
    this.root.add(gGroup);this.objects.set("hymenophore",gGroup);
    const st=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.26,.42,2.7,40),MATERIALS.stipe.clone()),"stipe","Stipe","macro");st.position.y=.95;
    const ring=this.register(new THREE.Mesh(new THREE.TorusGeometry(.44,.075,12,48),MATERIALS.flesh.clone()),"annulus","Annulus","veil","stipe");ring.rotation.x=Math.PI/2;ring.position.y=1.67;
    const bulb=this.register(new THREE.Mesh(new THREE.SphereGeometry(.52,32,20),MATERIALS.stipe.clone()),"stipe_base","Bulb / base","macro","stipe");bulb.scale.y=.62;bulb.position.y=-.34;
  }

  build_boletoid(){
    const cap=this.register(new THREE.Mesh(new THREE.SphereGeometry(1.65,56,28,0,Math.PI*2,0,Math.PI/2.15),MATERIALS.cap2.clone()),"pileus","Pileus / cap","macro");cap.scale.set(1,.58,1);cap.rotation.x=Math.PI;cap.position.y=2.95;
    const tubes=this.register(new THREE.Mesh(new THREE.CylinderGeometry(1.32,1.15,.42,56),MATERIALS.pore.clone()),"tube_layer","Tube layer","fertile");tubes.position.y=2.07;
    const pores=this.register(new THREE.Mesh(new THREE.CylinderGeometry(1.17,1.17,.025,56),MATERIALS.pore.clone()),"hymenophore","Pore surface","fertile");pores.position.y=1.85;
    const st=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.34,.5,2.65,40),MATERIALS.stipe.clone()),"stipe","Stipe","macro");st.position.y=.8;
    const base=this.register(new THREE.Mesh(new THREE.SphereGeometry(.56,32,20),MATERIALS.stipe.clone()),"stipe_base","Stipe base","macro","stipe");base.scale.y=.58;base.position.y=-.45;
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
