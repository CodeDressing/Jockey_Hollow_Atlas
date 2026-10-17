// MycoSim protected specimen: photo-informed morphology, not a verified identification.
// Every lamella is built in local cap coordinates and meets the stipe at its inner edge.
// No private image files or authentication credentials are embedded here.
export const AGE_STAGES=[
  {id:"juvenile",label:"Juvenile / button",maturity:.08,radius:.34,height:.58},
  {id:"young",label:"Young convex",maturity:.30,radius:.49,height:.85},
  {id:"mature",label:"Mature",maturity:.65,radius:.72,height:1.15},
  {id:"expanded",label:"Expanded / aging",maturity:.95,radius:.96,height:1.08}
];
export function buildGymnopilusFieldColony(THREE){
  const root=new THREE.Group();root.name="Photo-informed specimen reconstruction";
  const mat=(color,roughness=.88)=>new THREE.MeshStandardMaterial({color,roughness,side:THREE.DoubleSide});
  const capMats=[0xd48a24,0xe3a137,0xc77b24,0xe5a83d,0xcc8626].map(x=>mat(x));
  const stipeMat=mat(0xcda365),gillYoung=mat(0xc6a16a),gillOld=mat(0x936b3d),veilMat=mat(0x977143);
  const groundMat=mat(0x283627),leafMat=[mat(0x967b38),mat(0x6c4b2d),mat(0xb69a54)];
  const terrain=new THREE.Group();root.add(terrain);
  let seed=1635;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const ground=new THREE.Mesh(new THREE.CylinderGeometry(5,5,.17,64),groundMat);ground.position.y=-.10;terrain.add(ground);
  for(let i=0;i<125;i++){
    const a=rand()*Math.PI*2,d=Math.sqrt(rand())*4.75,r=.08+rand()*.17;
    const leaf=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*1.2),leafMat[i%3]);
    leaf.rotation.set(-Math.PI/2+(rand()-.5)*.35,(rand()-.5)*.6,rand()*Math.PI*2);
    leaf.position.set(Math.cos(a)*d,.006+rand()*.04,Math.sin(a)*d);
    terrain.add(leaf);
  }
  function capProfile(t,maturity,angle){
    const dome=(.23+.26*(1-maturity))*(1-t*t);
    const waves=maturity*.085*Math.pow(t,5)*(Math.sin(5*angle+1.2)+.32*Math.sin(9*angle));
    return dome+waves;
  }
  function capOutline(radius,t,maturity,angle){
    const wrinkle=1+(.015+.055*maturity)*Math.sin(5*angle+1.1)*Math.pow(t,5);
    return radius*t*wrinkle;
  }
  function capSurface(radius,maturity){
    const positions=[],indices=[],rows=18,steps=96;
    for(let j=0;j<=rows;j++)for(let k=0;k<=steps;k++){
      const t=j/rows,a=k/steps*Math.PI*2,r=capOutline(radius,t,maturity,a);
      positions.push(Math.cos(a)*r,capProfile(t,maturity,a),Math.sin(a)*r);
      if(j<rows&&k<steps){const n=j*(steps+1)+k;indices.push(n,n+steps+1,n+1,n+1,n+steps+1,n+steps+2)}
    }
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
  }
  // Gills: individual radial, vertical curved lamellae; inner edges originate at stipe radius,
  // while upper edges touch cap's underside from the attachment point to the margin.
  function addGills(head,radius,maturity,gillGroups){
    const g=new THREE.Group();g.name="Attached lamellae";g.userData.isFieldGills=true;head.add(g);gillGroups.push(g);
    const count=maturity<.2?56:96;
    const inner=.132,outer=radius*.975;
    for(let i=0;i<count;i++){
      const a=i*Math.PI*2/count;
      const vertices=[],faces=[],divisions=12;
      for(let j=0;j<=divisions;j++){
        const t=j/divisions,r=inner+(outer-inner)*t;
        const normalized=r/radius,top=capProfile(normalized,maturity,a)-.035;
        const depth=(.105+.075*maturity)*Math.sin(Math.PI*(.08+.83*t));
        const rad=capOutline(radius,normalized,maturity,a);
        const x=Math.cos(a)*rad,z=Math.sin(a)*rad;
        vertices.push(x,top,z,x,top-depth,z);
        if(j<divisions){const p=j*2;faces.push(p,p+1,p+2,p+1,p+3,p+2)}
      }
      const geometry=new THREE.BufferGeometry();
      geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(faces);geometry.computeVertexNormals();
      g.add(new THREE.Mesh(geometry,maturity>.78?gillOld:gillYoung));
    }
  }
  const allGills=[],mushrooms=[];
  function makeMushroom({x=0,z=0,radius=.6,height=1,maturity=.55,tilt=0,materialIndex=0}){
    const mushroom=new THREE.Group();mushroom.position.set(x,.05,z);mushroom.rotation.z=tilt;root.add(mushroom);
    const stipe=new THREE.Mesh(new THREE.CylinderGeometry(.135,.19,height,20),stipeMat);stipe.position.y=height/2;mushroom.add(stipe);
    const head=new THREE.Group();head.position.y=height;mushroom.add(head);
    const cap=new THREE.Mesh(capSurface(radius,maturity),capMats[materialIndex%capMats.length]);head.add(cap);
    addGills(head,radius,maturity,allGills);
    if(maturity>.18){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.155,.026,8,28),veilMat);
      ring.rotation.x=Math.PI/2;ring.position.y=-.17;mushroom.add(ring);ring.position.y=height-.19;
      if(maturity>.4)for(let j=0;j<4;j++){
        const fragment=new THREE.Mesh(new THREE.ConeGeometry(.05,.12,7),veilMat);
        const a=j*Math.PI/2;fragment.position.set(Math.cos(a)*.155,height-.25,Math.sin(a)*.155);fragment.rotation.z=.6*Math.cos(a);mushroom.add(fragment);
      }
    }
    mushrooms.push({group:mushroom,maturity});
    return mushroom;
  }
  const specimens=new THREE.Group();root.add(specimens);
  // Isolated presets use the same shared mesh construction, ensuring anatomy consistency.
  for(const [index,stage] of AGE_STAGES.entries()){
    const m=makeMushroom({radius:stage.radius,height:stage.height,maturity:stage.maturity,materialIndex:index});
    m.visible=false;m.name="Age "+stage.id;
  }
  const isolate=mushrooms.slice(0,AGE_STAGES.length);
  for(let i=0;i<24;i++){
    const a=i/24*Math.PI*2+rand()*.24,d=.42+Math.sqrt(rand())*2.15;
    makeMushroom({x:Math.cos(a)*d,z:Math.sin(a)*d,radius:.37+rand()*.42,height:.50+rand()*.60,maturity:.24+rand()*.73,tilt:(rand()-.5)*.28,materialIndex:i});
  }
  const colony=mushrooms.slice(AGE_STAGES.length);
  function select(mode){
    const field=mode==="colony";
    terrain.visible=field;
    colony.forEach(x=>x.group.visible=field);
    isolate.forEach((x,i)=>x.group.visible=!field&&AGE_STAGES[i].id===mode);
    root.userData.selectedMode=mode;
  }
  root.userData={gills:allGills,select,selectedMode:"colony",reference:"40 user-supplied images in prior photo register; source images not bundled"};
  select("colony");return root;
}
