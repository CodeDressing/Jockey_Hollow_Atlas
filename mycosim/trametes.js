import * as THREE from "three";

// MycoSim educational procedural reconstruction, not a photographed or confirmed specimen.
// Public anatomical baseline only. No private research records are embedded.
export const TRAMETES_MODEL_ID="trametes_versicolor";
export const TRAMETES_REFERENCES=Object.freeze([
  {title:"Trametes versicolor taxon",url:"https://www.mycobank.org/"},
  {title:"Fungal trait and nomenclature reference",url:"https://www.indexfungorum.org/"},
  {title:"Dectin-1 and fungal beta-glucan biology (literature lookup)",url:"https://pubmed.ncbi.nlm.nih.gov/?term=Dectin-1+fungal+beta-glucan+SYK+CARD9"}
]);
function material(hex,roughness=0.91){return new THREE.MeshStandardMaterial({color:hex,roughness,side:THREE.DoubleSide});}
function addSelectable(engine,mesh,id,label,category,parent=null){
  return engine.register(mesh,id,label,category,parent);
}
// Educational upright hardwood section; individual shelves are separately selectable. The linked dedicated Turkey Tail scene uses a horizontal decaying log.
export function buildTrametesVersicolor(engine){
  const stage=engine.developmentalStageId||"mature";
  const age=stage==="young"?.58:stage==="old"?.87:1;
  const wood=material(0x76523a),bark=material(0x3a322b),pale=material(0xe9dfc5);
  const log=addSelectable(engine,new THREE.Mesh(new THREE.CylinderGeometry(.67,.76,3.9,24,9),wood),"substrate","Decaying hardwood","ecology");
  log.position.set(-.55,.12,0);log.rotation.z=-.16;
  const outer=addSelectable(engine,new THREE.Mesh(new THREE.CylinderGeometry(.704,.796,3.72,32,10, true),bark),"bark","Cracked bark","ecology","substrate");
  outer.position.copy(log.position);outer.rotation.copy(log.rotation);
  const crackMat=new THREE.LineBasicMaterial({color:0x171714,transparent:true,opacity:.68});
  const cracks=new THREE.Group();
  for(let j=0;j<22;j++){
    const angle=j*2.39996;
    const points=[];
    for(let k=0;k<7;k++){
      const y=-1.74+k*.55;
      const radius=.75+.043*Math.sin(j*4+y*3);
      points.push(new THREE.Vector3(Math.cos(angle+.035*Math.sin(y*3+j))*radius,y,Math.sin(angle+.035*Math.sin(y*3+j))*radius));
    }
    cracks.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),crackMat));
  }
  outer.add(cracks);
  const hyphae=new THREE.Group();
  const threadMaterial=new THREE.LineBasicMaterial({color:0xd9d3a9,transparent:true,opacity:.52});
  for(let i=0;i<38;i++){
    const a=i*2.39996,rad=.18+(i%5)*.09,points=[];
    for(let j=0;j<9;j++){const y=-1.65+j*.41;points.push(new THREE.Vector3(Math.cos(a+y*.54)*rad,y,Math.sin(a+y*.54)*rad));}
    hyphae.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),threadMaterial));
  }
  hyphae.position.copy(log.position);hyphae.rotation.copy(log.rotation);
  hyphae.userData={id:"mycelium",label:"Inferred vegetative mycelium",category:"internal",selectable:true,knowledgeId:"mycelium"};
  engine.root.add(hyphae);engine.objects.set("mycelium",hyphae);
  // Thin fan-shaped upper brackets with concentric bands. This is not a pore-count measurement.
  const bands=[0xe2d5b7,0x594437,0x98795c,0x3a4140,0xc2aa84,0x64483b,0xe9ddc5];
  const count=stage==="young"?5:8;
  for(let i=0;i<count;i++){
    const theta=-.53+(i%4)*.30, y=-1.05+Math.floor(i/4)*1.35+(i%4)*.12;
    const radius=(.68+(i%3)*.15)*age;
    const width=Math.PI*(.66+(i%3)*.07);
    const group=new THREE.Group();
    const phi=theta+Math.PI/2;
    group.position.set(-.55+Math.cos(phi)*.64,y,Math.sin(phi)*.64);
    group.rotation.y=phi-Math.PI/2;
    const segment=30;
    for(let band=0;band<7;band++){
      const inner=band/7*radius,outerR=(band+1)/7*radius;
      const verts=[],indices=[];
      for(let k=0;k<=1;k++){
        const r=k?outerR:inner;
        for(let q=0;q<=segment;q++){
          const a=-width/2+q/segment*width;
          const x=r*Math.cos(a),z=r*Math.sin(a);
          const rise=-.075*r+.022*Math.cos(a*4+i);
          verts.push(x,rise,z);
        }
      }
      for(let q=0;q<segment;q++){
        const n=segment+1;
        indices.push(q,q+1,n+q,q+1,n+q+1,n+q);
      }
      const geo=new THREE.BufferGeometry();
      geo.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();
      const mesh=new THREE.Mesh(geo,material(bands[(band+i)%bands.length]));
      group.add(mesh);
    }
    const underside=new THREE.Mesh(new THREE.CircleGeometry(radius*.97,48,-width/2,width),pale);
    underside.rotation.x=Math.PI/2;
    underside.position.y=-.055;
    group.add(underside);
    group.rotation.x=-.05+(i%2)*.08;
    group.userData={id:"basidiome_"+(i+1),label:"Turkey Tail bracket "+(i+1),category:"macro",selectable:true,knowledgeId:"pileus"};
    for(const child of group.children){child.userData=group.userData;engine.pickables.push(child);}
    engine.root.add(group);engine.objects.set(group.userData.id,group);
  }
  // Shared anatomy proxies remain selectable through established controls.
  const capGroup=new THREE.Group();
  capGroup.userData={id:"pileus",label:"Zoned upper pileus",category:"macro",selectable:true,knowledgeId:"pileus"};
  engine.root.add(capGroup);engine.objects.set("pileus",capGroup);
  const ctx=addSelectable(engine,new THREE.Mesh(new THREE.BoxGeometry(.65,.055,.36),material(0xd6bb9e)),"context","Thin context (trama)","internal");
  ctx.position.set(.27,.22,.15);
  const tubes=addSelectable(engine,new THREE.Mesh(new THREE.BoxGeometry(.70,.07,.42),material(0xe0d9c4)),"tube_layer","Tube layer (schematic)","fertile");
  tubes.position.set(.27,.15,.15);
  const pores=addSelectable(engine,new THREE.Mesh(new THREE.PlaneGeometry(.68,.4),material(0xf5ead6)),"hymenophore","Pore-bearing underside (schematic)","fertile");
  pores.rotation.x=-Math.PI/2;pores.position.set(.27,.105,.15);
  engine.onStatus?.("Trametes versicolor · procedural educational reconstruction · not a verified specimen");
}
