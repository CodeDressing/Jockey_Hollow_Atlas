import * as THREE from "three";

export const REALISM_TIERS=Object.freeze({
  interactive:Object.freeze({
    id:"interactive",pixelRatio:1.0,shadowMap:768,shadowType:"pcfsoft",
    segmentScale:.68,farLodDistance:8.0,post:Object.freeze({toneMapping:"aces",exposure:.96,fog:true}),
    targets:Object.freeze({startupMs:3000,hardStartupMs:5000,minFps:45,maxDrawCalls:180,maxTriangles:280000})
  }),
  atlas:Object.freeze({
    id:"atlas",pixelRatio:1.35,shadowMap:1024,shadowType:"pcfsoft",
    segmentScale:1.0,farLodDistance:9.5,post:Object.freeze({toneMapping:"aces",exposure:1.0,fog:true}),
    targets:Object.freeze({startupMs:3000,hardStartupMs:5000,minFps:35,maxDrawCalls:240,maxTriangles:480000})
  }),
  high:Object.freeze({
    id:"high",pixelRatio:1.5,shadowMap:1536,shadowType:"pcfsoft",
    segmentScale:1.24,farLodDistance:11.0,post:Object.freeze({toneMapping:"aces",exposure:1.03,fog:true}),
    targets:Object.freeze({startupMs:5000,hardStartupMs:7000,minFps:30,maxDrawCalls:320,maxTriangles:760000})
  })
});

export const PROFILE_REALISM_BUDGETS=Object.freeze({
  agaricoid:Object.freeze({importance:"high",lod:true,highDetail:["pileus","hymenophore","stipe"],instancing:["lamellae","teeth"],proxy:"cap_stipe"}),
  boletoid:Object.freeze({importance:"high",lod:true,highDetail:["pileus","tube_layer","hymenophore","stipe"],instancing:["pores"],proxy:"cap_stipe"}),
  polyporoid:Object.freeze({importance:"high",lod:true,highDetail:["pileus","context","tube_layer","hymenophore"],instancing:["pores"],proxy:"bracket"}),
  hydnoid:Object.freeze({importance:"high",lod:true,highDetail:["pileus","hymenophore","stipe"],instancing:["teeth"],proxy:"cap_stipe"}),
  hoof_conk:Object.freeze({importance:"medium",lod:true,highDetail:["pileus","tube_layer","hymenophore"],instancing:[],proxy:"bracket"}),
  hydnoid_bracket:Object.freeze({importance:"high",lod:true,highDetail:["pileus","hymenophore"],instancing:["teeth"],proxy:"bracket"}),
  morel:Object.freeze({importance:"high",lod:true,highDetail:["fertile_head","hymenophore","stipe"],instancing:[],proxy:"morel"}),
  coral:Object.freeze({importance:"high",lod:true,highDetail:["branch_system"],instancing:["repeated_branch_segments"],proxy:"coral"}),
  puffball:Object.freeze({importance:"high",lod:true,highDetail:["peridium","exoperidium","gleba"],instancing:["ornament","abrasion"],proxy:"gasteroid"}),
  cup:Object.freeze({importance:"medium",lod:true,highDetail:["apothecium","hymenophore","excipulum"],instancing:[],proxy:"cup"}),
  jelly:Object.freeze({importance:"medium",lod:true,highDetail:["lobes"],instancing:["lobes_when_compatible"],proxy:"jelly"}),
  crust:Object.freeze({importance:"medium",lod:true,highDetail:["hymenophore","margin","context"],instancing:[],proxy:"crust"})
});

export function selectRealismTier({requested="atlas",deviceMemory=8,dpr=1,viewportWidth=1200}={}){
  let tier=requested==="high"?"high":requested==="simplified"?"interactive":"atlas";
  if(deviceMemory&&deviceMemory<=4)tier="interactive";
  if(viewportWidth<760)tier="interactive";
  if(dpr>2.2&&tier==="high")tier="atlas";
  return REALISM_TIERS[tier];
}

export function configureRendererForRealism(renderer,tier){
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=tier.post.exposure;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,tier.pixelRatio));
  renderer.shadowMap.enabled=false;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate=true;
  renderer.localClippingEnabled=true;
}

export function configureRealisticLights(scene,tier){
  const rig=new THREE.Group();
  rig.name="realism_light_rig";

  const hemi=new THREE.HemisphereLight(0xf0eadc,0x101815,tier.id==="interactive"?1.35:1.55);
  rig.add(hemi);

  const key=new THREE.DirectionalLight(0xffe7c8,tier.id==="high"?3.35:3.0);
  key.position.set(4.4,7.2,4.1);
  key.castShadow=true;
  key.shadow.mapSize.set(tier.shadowMap,tier.shadowMap);
  key.shadow.camera.near=.5;
  key.shadow.camera.far=24;
  key.shadow.camera.left=-5;
  key.shadow.camera.right=5;
  key.shadow.camera.top=5;
  key.shadow.camera.bottom=-5;
  key.shadow.bias=-0.00018;
  key.shadow.normalBias=.018;
  rig.add(key);

  const fill=new THREE.DirectionalLight(0xb9d1d7,tier.id==="interactive"?.72:.92);
  fill.position.set(-5.4,3.2,-4.4);
  rig.add(fill);

  const rim=new THREE.DirectionalLight(0xf4c890,tier.id==="high"?1.2:.92);
  rim.position.set(1.4,4.7,-6.2);
  rig.add(rim);

  const bounce=new THREE.PointLight(0xd8c7a6,tier.id==="interactive"?.18:.28,8,2);
  bounce.position.set(0,-.15,1.2);
  rig.add(bounce);

  scene.add(rig);
  return {rig,key,fill,rim,hemi,bounce};
}

export function scaledSegments(base,tier,{min=6,max=160}={}){
  return Math.max(min,Math.min(max,Math.round(base*tier.segmentScale)));
}

function proxyMaterial(){
  return new THREE.MeshStandardMaterial({color:0x8f806b,roughness:.92,metalness:0});
}

function add(group,mesh){group.add(mesh);return mesh;}

export function createFarLodProxy(profileId,box,tier){
  const group=new THREE.Group();
  group.name="far_lod_proxy";
  group.userData={lodProxy:true,selectable:false};
  const size=box.getSize(new THREE.Vector3());
  const center=box.getCenter(new THREE.Vector3());
  const sx=Math.max(.2,size.x),sy=Math.max(.2,size.y),sz=Math.max(.2,size.z);
  const m=proxyMaterial();

  if(["agaricoid","boletoid","hydnoid"].includes(profileId)){
    const cap=add(group,new THREE.Mesh(new THREE.SphereGeometry(Math.max(sx,sz)*.30,16,9,0,Math.PI*2,0,Math.PI/2),m.clone()));
    cap.scale.set(1,.48,1);cap.position.set(center.x,center.y+sy*.27,center.z);cap.rotation.x=Math.PI;
    const st=add(group,new THREE.Mesh(new THREE.CylinderGeometry(sx*.07,sx*.09,sy*.58,10),m.clone()));
    st.position.set(center.x,center.y-sy*.10,center.z);
  }else if(["polyporoid","hoof_conk","hydnoid_bracket"].includes(profileId)){
    const shelf=add(group,new THREE.Mesh(new THREE.SphereGeometry(Math.max(sx,sz)*.28,14,8),m.clone()));
    shelf.scale.set(1.3,.38,.85);shelf.position.copy(center);
  }else if(profileId==="morel"){
    const head=add(group,new THREE.Mesh(new THREE.ConeGeometry(sx*.22,sy*.48,14),m.clone()));
    head.position.set(center.x,center.y+sy*.20,center.z);
    const st=add(group,new THREE.Mesh(new THREE.CylinderGeometry(sx*.07,sx*.10,sy*.48,9),m.clone()));
    st.position.set(center.x,center.y-sy*.22,center.z);
  }else if(profileId==="coral"){
    for(let i=0;i<7;i++){
      const a=i/7*Math.PI*2;
      const b=add(group,new THREE.Mesh(new THREE.CylinderGeometry(sx*.025,sx*.045,sy*(.40+.04*(i%3)),7),m.clone()));
      b.position.set(center.x+Math.cos(a)*sx*.16,center.y,center.z+Math.sin(a)*sz*.16);
      b.rotation.z=(i%2?-.11:.11);
    }
  }else if(profileId==="puffball"){
    const body=add(group,new THREE.Mesh(new THREE.SphereGeometry(Math.max(sx,sz)*.31,14,10),m.clone()));
    body.scale.y=Math.max(.65,sy/Math.max(sx,sz));body.position.copy(center);
  }else if(profileId==="cup"){
    const cup=add(group,new THREE.Mesh(new THREE.SphereGeometry(Math.max(sx,sz)*.28,14,8,0,Math.PI*2,Math.PI/2.15,Math.PI/2.2),m.clone()));
    cup.scale.y=.6;cup.position.copy(center);
  }else if(profileId==="jelly"){
    for(let i=0;i<4;i++){
      const l=add(group,new THREE.Mesh(new THREE.SphereGeometry(sx*.17,12,8),m.clone()));
      l.scale.set(1,.55,.8);l.position.set(center.x+Math.cos(i*1.6)*sx*.14,center.y,center.z+Math.sin(i*1.6)*sz*.14);
    }
  }else if(profileId==="crust"){
    const c=add(group,new THREE.Mesh(new THREE.BoxGeometry(sx*.92,Math.max(.05,sy*.14),sz*.90),m.clone()));
    c.position.copy(center);
  }else{
    const q=add(group,new THREE.Mesh(new THREE.BoxGeometry(sx*.8,sy*.8,sz*.8),m.clone()));
    q.position.copy(center);
  }

  group.traverse(n=>{if(n.isMesh){n.castShadow=false;n.receiveShadow=true;}});
  group.visible=false;
  return group;
}

export function installDistanceLod(engine,profileId,tier){
  engine.scene.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(engine.root);
  if(box.isEmpty())return null;
  const proxy=createFarLodProxy(profileId,box,tier);
  engine.scene.add(proxy);
  return {proxy,distance:tier.farLodDistance,profileId};
}

export function disposeLodRecord(record,scene){
  if(!record?.proxy)return;
  scene.remove(record.proxy);
  record.proxy.traverse(n=>{
    n.geometry?.dispose?.();
    const mats=n.material?(Array.isArray(n.material)?n.material:[n.material]):[];
    mats.forEach(m=>m?.dispose?.());
  });
}

export function updateDistanceLod(engine,record){
  if(!record?.proxy)return;
  const box=new THREE.Box3().setFromObject(engine.root);
  const center=box.getCenter(new THREE.Vector3());
  const distance=engine.camera.position.distanceTo(center);
  const far=distance>=record.distance;
  engine.root.visible=!far;
  record.proxy.visible=far;
}

export function rendererComplexity(renderer,scene){
  let triangles=0,meshes=0,instanced=0;
  scene.traverse(o=>{
    if(!o.visible)return;
    if(o.isMesh){
      meshes++;
      if(o.isInstancedMesh)instanced++;
      const g=o.geometry;
      if(g?.index)triangles+=Math.floor(g.index.count/3)*(o.count||1);
      else if(g?.attributes?.position)triangles+=Math.floor(g.attributes.position.count/3)*(o.count||1);
    }
  });
  return {triangles,meshes,instanced,drawCalls:renderer.info.render.calls};
}

export function performanceVerdict({fps=0,buildMs=0,complexity},tier){
  const t=tier.targets;
  const checks={
    startup:buildMs<=t.hardStartupMs,
    fps:fps===0||fps>=t.minFps,
    drawCalls:complexity.drawCalls<=t.maxDrawCalls,
    triangles:complexity.triangles<=t.maxTriangles
  };
  return {pass:Object.values(checks).every(Boolean),checks,targets:t};
}

export function chooseAdaptiveTier(currentTier,{fps=60,drawCalls=0,triangles=0}={}){
  if(currentTier.id==="interactive")return currentTier;
  const t=currentTier.targets;
  if((fps>0&&fps<t.minFps-4)||drawCalls>t.maxDrawCalls*1.15||triangles>t.maxTriangles*1.15){
    return REALISM_TIERS.interactive;
  }
  return currentTier;
}
