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
  const capMats=[0xd48a24,0xe3a137,0xc77b24,0xe5a83d,0xcc8626].map(x=>new THREE.MeshStandardMaterial({color:x,roughness:.94,vertexColors:true,side:THREE.DoubleSide}));
  const palette=[new THREE.Color("#eac479"),new THREE.Color("#a96c2e"),new THREE.Color("#f1c875")];
  const capShade=(t,a,m)=>{const n=Math.sin(a*23+t*37)*Math.sin(a*37-t*43)*.045+Math.sin(a*8+t*11)*.065;const edge=Math.pow(t,2.6);return THREE.MathUtils.clamp(.77+n+.18*(1-edge)-.10*m*edge,.48,1.08)};
  const stipeMat=new THREE.MeshStandardMaterial({color:0xe3bd7d,roughness:.97,vertexColors:true,side:THREE.DoubleSide}),gillYoung=mat(0xc6a16a),gillOld=mat(0x936b3d),veilMat=mat(0x977143);
  const groundMat=mat(0x283627),leafMat=[mat(0x967b38),mat(0x6c4b2d),mat(0xb69a54)];
  const terrain=new THREE.Group();root.add(terrain);
  const bladeMaterial=new THREE.MeshStandardMaterial({color:0x4c6943,roughness:1,side:THREE.DoubleSide});
  const grassGeometry=new THREE.ConeGeometry(.022,.35,3);

  let seed=1635;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const ground=new THREE.Mesh(new THREE.CylinderGeometry(5,5,.17,64),groundMat);ground.position.y=-.10;terrain.add(ground);ground.userData.anatomy="substrate";
  for(let i=0;i<125;i++){
    const a=rand()*Math.PI*2,d=Math.sqrt(rand())*4.75,r=.08+rand()*.17;
    const leaf=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*1.2),leafMat[i%3]);
    leaf.rotation.set(-Math.PI/2+(rand()-.5)*.35,(rand()-.5)*.6,rand()*Math.PI*2);
    leaf.position.set(Math.cos(a)*d,.006+rand()*.04,Math.sin(a)*d);
    terrain.add(leaf);leaf.userData.anatomy="substrate";
    if(i<95){const grass=new THREE.Mesh(grassGeometry,bladeMaterial);grass.position.set(Math.cos(a)*d,.17,Math.sin(a)*d);grass.rotation.z=(rand()-.5)*.32;terrain.add(grass)}
  }
  function capProfile(t,maturity,angle){
    const dome=(.15+.33*(1-maturity))*Math.pow(Math.max(0,1-t*t),.78);
    const waves=maturity*.085*Math.pow(t,5)*(Math.sin(5*angle+1.2)+.32*Math.sin(9*angle));
    const fine=.009*Math.sin(angle*27+t*43)*Math.sin(angle*17-t*31)*t;
    return dome+waves+fine;
  }
  function capOutline(radius,t,maturity,angle){
    const wrinkle=1+(.015+.055*maturity)*Math.sin(5*angle+1.1)*Math.pow(t,5);
    return radius*t*wrinkle;
  }
  function capSurface(radius,maturity){
    const positions=[],colors=[],indices=[],rows=44,steps=144;
    for(let j=0;j<=rows;j++)for(let k=0;k<=steps;k++){
      const t=j/rows,a=k/steps*Math.PI*2,r=capOutline(radius,t,maturity,a);
      positions.push(Math.cos(a)*r,capProfile(t,maturity,a),Math.sin(a)*r);
      const shade=capShade(t,a,maturity), speckle=Math.sin(a*87+t*113)*Math.sin(a*53-t*83);
      const color=new THREE.Color().setRGB(shade*(.95+speckle*.035),shade*(.85+speckle*.025),shade*(.65+speckle*.013));
      colors.push(color.r,color.g,color.b);
      if(j<rows&&k<steps){const n=j*(steps+1)+k;indices.push(n,n+steps+1,n+1,n+1,n+steps+1,n+steps+2)}
    }
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));g.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
  }
  // Gills: individual radial, vertical curved lamellae; inner edges originate at stipe radius,
  // while upper edges touch cap's underside from the attachment point to the margin.
  function addGills(head,radius,maturity,gillGroups){
    const g=new THREE.Group();g.name="Attached lamellae";g.userData.isFieldGills=true;head.add(g);gillGroups.push(g);
    const count=maturity<.2?76:138;
    const inner=.132,outer=radius*.975;
    for(let i=0;i<count;i++){
      const a=i*Math.PI*2/count;
      const vertices=[],faces=[],divisions=22;
      for(let j=0;j<=divisions;j++){
        const t=j/divisions,r=inner+(outer-inner)*t;
        const normalized=r/radius,top=capProfile(normalized,maturity,a)-.035;
        const depth=(.14+.055*maturity)*Math.sin(Math.PI*(.06+.86*t))*(1+.045*Math.sin(a*19+t*17));
        const rad=capOutline(radius,normalized,maturity,a);
        const x=Math.cos(a)*rad,z=Math.sin(a)*rad;
        vertices.push(x,top,z,x,top-depth,z);
        if(j<divisions){const p=j*2;faces.push(p,p+1,p+2,p+1,p+3,p+2)}
      }
      const geometry=new THREE.BufferGeometry();
      geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(faces);geometry.computeVertexNormals();
      const blade=new THREE.Mesh(geometry,maturity>.78?gillOld:gillYoung);blade.userData.anatomy="lamellae";blade.userData.innerRadius=inner;blade.userData.outerRadius=outer;g.add(blade);
    }
  }
  const allGills=[],mushrooms=[];
  function makeMushroom({x=0,z=0,radius=.6,height=1,maturity=.55,tilt=0,materialIndex=0}){
    const mushroom=new THREE.Group();mushroom.position.set(x,.05,z);mushroom.rotation.z=tilt;root.add(mushroom);
    const stemShape=new THREE.CylinderGeometry(.138,.19,height,36,36);
    const stemPositions=stemShape.attributes.position,stemColors=[];
    const seedColor=new THREE.Color("#c79d60");
    for(let i=0;i<stemPositions.count;i++){
      const px=stemPositions.getX(i),py=stemPositions.getY(i),pz=stemPositions.getZ(i);
      const angle=Math.atan2(pz,px),level=(py/height+.5),fiber=Math.sin(angle*39+level*14)*Math.sin(angle*23-level*24);
      const radial=1+.023*fiber+.013*Math.sin(angle*7+level*17);
      stemPositions.setX(i,px*radial);stemPositions.setZ(i,pz*radial);
      const c=seedColor.clone().multiplyScalar(.86+.12*level+.11*fiber);
      stemColors.push(c.r,c.g,c.b);
    }
    stemShape.setAttribute("color",new THREE.Float32BufferAttribute(stemColors,3));stemShape.computeVertexNormals();
    const stipe=new THREE.Mesh(stemShape,stipeMat);stipe.position.y=height/2;mushroom.add(stipe);stipe.userData.anatomy="stipe";stipe.userData.stipeHeight=height;
    // Fine vertical mycelial surface fibers produce stipe relief under grazing light.
    const fiberMaterial=mat(0xdfbf89);const fiberCount=26;
    for(let k=0;k<fiberCount;k++){
      const angle=k*Math.PI*2/fiberCount,rr=.146+.016*Math.sin(k*5);
      const strand=new THREE.Mesh(new THREE.CylinderGeometry(.0025,.004,height*.74,4),fiberMaterial);
      strand.position.set(Math.cos(angle)*rr,height*.49,Math.sin(angle)*rr);
      mushroom.add(strand);strand.userData.anatomy="stipe";strand.userData.stipeHeight=height;
    }
    const head=new THREE.Group();head.position.y=height;mushroom.add(head);
    const cap=new THREE.Mesh(capSurface(radius,maturity),capMats[materialIndex%capMats.length]);head.add(cap);cap.userData.anatomy="pileus";cap.userData.capRadius=radius;
    addGills(head,radius,maturity,allGills);
    if(maturity>.18){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.16,.016,9,64),veilMat);
      ring.rotation.x=Math.PI/2;ring.position.y=-.17;mushroom.add(ring);ring.position.y=height-.19;ring.userData.anatomy="annulus";
      if(maturity>.4)for(let j=0;j<4;j++){
        const fragment=new THREE.Mesh(new THREE.ConeGeometry(.042,.11,9),veilMat);
        const a=j*Math.PI/2;fragment.position.set(Math.cos(a)*.155,height-.25,Math.sin(a)*.155);fragment.rotation.z=.6*Math.cos(a);mushroom.add(fragment);fragment.userData.anatomy="partialVeil";
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
