import * as THREE from "three";

// MYCOSIM-TV-001: deterministic procedural teaching reconstruction, not a verified specimen.
// Substrate and internal network are illustrative. Macro geometry is not a taxonomic identification.
export const TRAMETES_SIM_ID = "mycosim:species:trametes_versicolor:v1";
const palettes=[
  [0x534634,0xb9b29a,0x534b40,0x82745e,0x352e28,0xc7bf9c],
  [0x4d493d,0x96978a,0x45382d,0xb3a78b,0x393d35,0xd8d0b6],
  [0x625043,0xc3b6a0,0x696350,0x928778,0x42372c,0xe0d5bd]
];
function bracketGeometry(size,flip=false){
  const segments=48,rings=12,positions=[],colors=[],indices=[];
  const palette=palettes[Math.round(size*10)%palettes.length].map(v=>new THREE.Color(v));
  for(let j=0;j<=rings;j++){
    const t=j/rings;
    for(let i=0;i<=segments;i++){
      const a=-Math.PI*.52+(i/segments)*Math.PI*1.04;
      const ragged=1+0.018*Math.sin(9*a+size*11)+.012*Math.cos(17*a-size*3);
      const radius=(.09+t*.97)*size*ragged;
      const x=Math.sin(a)*radius;
      const z=Math.cos(a)*radius;
      const arch=.10*Math.sin(Math.PI*t)+.038*Math.cos(3*a+size*4)*t;
      const y=(flip?-.032:0)+arch +(.045*(1-t));
      positions.push(x,y,z);
      const band=Math.min(palette.length-1,Math.floor(t*palette.length));
      const c=flip?new THREE.Color(0xe8e3ce):palette[band];
      colors.push(c.r,c.g,c.b);
    }
  }
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){
    const k=j*(segments+1)+i;
    indices.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  return geometry;
}
function mesh(geometry,color,opacity=1){
  return new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({
    color,vertexColors:geometry.getAttribute("color")!==undefined,
    roughness:.94,side:THREE.DoubleSide,transparent:opacity<1,opacity
  }));
}
export function buildTrametesVersicolor(engine){
  const stage=engine.developmentalStageId||"mature";
  const ageFactor=stage==="young"?.66:stage==="old"?1.04:1;
  const woody=new THREE.MeshStandardMaterial({color:0x594536,roughness:1});
  const bark=new THREE.MeshStandardMaterial({color:0x332b24,roughness:1,flatShading:true});
  const core=engine.register(new THREE.Mesh(new THREE.CylinderGeometry(.67,.70,5.0,28,12),woody),"substrate","Decaying hardwood log","ecology");
  core.rotation.z=Math.PI/2;core.position.y=-.3;
  // Loose bark facets: positional irregularities are illustrative rather than a scan.
  const barkGroup=new THREE.Group();
  for(let i=0;i<30;i++){
    const x=-2.35+(i%10)*.52,theta=Math.floor(i/10)*Math.PI*2/3+.28*Math.sin(i*2.3);
    const strip=new THREE.Mesh(new THREE.BoxGeometry(.40,.055,.30),bark.clone());
    strip.position.set(x,-.3+Math.sin(theta)*.705,Math.cos(theta)*.705);
    strip.rotation.x=theta;strip.rotation.z=.08*Math.sin(i*4.1);
    barkGroup.add(strip);
  }
  barkGroup.userData={id:"bark",label:"Cracked hardwood bark",category:"ecology",parentId:"substrate",selectable:true};
  engine.root.add(barkGroup);engine.objects.set("bark",barkGroup);
  // Sparse internal strands; selectively visible with existing hide/isolate controls.
  const mycelium=new THREE.Group(),threadMaterial=new THREE.MeshStandardMaterial({color:0xc7c6aa,roughness:1});
  for(let i=0;i<36;i++){
    const x=-2.2+(i%12)*.38,theta=i*2.399,r=.16+(i%4)*.09;
    const start=new THREE.Vector3(x,-.3+Math.sin(theta)*r,Math.cos(theta)*r);
    const end=start.clone().add(new THREE.Vector3(.22,.04*Math.cos(i),.06*Math.sin(i*1.6)));
    const dir=end.clone().sub(start);
    const filament=new THREE.Mesh(new THREE.CylinderGeometry(.006,.009,dir.length(),4),threadMaterial);
    filament.position.copy(start).add(end).multiplyScalar(.5);
    filament.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());
    mycelium.add(filament);
  }
  mycelium.userData={id:"mycelium",label:"Illustrative internal vegetative mycelium",category:"internal",selectable:true};
  engine.root.add(mycelium);engine.objects.set("mycelium",mycelium);mycelium.visible=false;
  const upperMat=()=>new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.94});
  const lowerMat=()=>new THREE.MeshStandardMaterial({color:0xe5dfcd,side:THREE.DoubleSide,roughness:.96});
  const positions=[[-1.65,.21,1],[-1.0,-.02,-1],[-.30,.28,1],[.39,.05,-1],[1.10,.25,1],[1.71,.02,-1],[-.72,.12,1],[.91,.12,-1]];
  positions.forEach(([x,y,side],i)=>{
    const width=(.72+(i%3)*.13)*ageFactor;
    const group=new THREE.Group();
    const top=new THREE.Mesh(bracketGeometry(width,false),upperMat());
    const under=new THREE.Mesh(bracketGeometry(width,true),lowerMat());
    group.add(top,under);
    group.position.set(x,.42+y,side*.60);
    group.rotation.y=side>0?0:Math.PI;
    group.rotation.z=(i%2?-.07:.06);
    group.userData={id:"basidiome_"+(i+1),label:"Turkey Tail basidioma "+(i+1),category:"macro",parentId:"pileus",selectable:true,knowledgeId:"pileus"};
    engine.root.add(group);engine.objects.set(group.userData.id,group);
    engine.pickables.push(top,under);
  });
  // Representative registered structure IDs preserve existing anatomy controls.
  const first=engine.objects.get("basidiome_1");
  if(first){
    const pileus=new THREE.Group();
    pileus.userData={id:"pileus",label:"Zoned upper bracket surface",category:"macro",selectable:true};
    engine.root.add(pileus);engine.objects.set("pileus",pileus);
  }
  const context=engine.register(mesh(new THREE.BoxGeometry(.55,.045,.30),0xcdbfa4),"context","Representative bracket trama (exaggerated)","internal");
  context.position.set(-1.6,.09,.89);
  const tubes=engine.register(mesh(new THREE.BoxGeometry(.54,.025,.28),0xe2dac7),"tube_layer","Representative tube layer (exaggerated)","fertile");
  tubes.position.set(-1.6,.052,.89);
  const pore=engine.register(mesh(new THREE.PlaneGeometry(.54,.28),0xefe9dd),"hymenophore","Pore-bearing undersurface (schematic)","fertile");
  pore.rotation.x=Math.PI/2;pore.position.set(-1.6,.035,.89);
  engine.trametesReconstruction={id:TRAMETES_SIM_ID,scope:"educational procedural reconstruction",stage};
}
