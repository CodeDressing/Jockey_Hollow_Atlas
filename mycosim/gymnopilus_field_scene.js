// Gymnopilus field-colony educational geometry, reference batch IMG_1596-1635.
// This is an artistically reconstructed morphology study, not photogrammetry and not an ID.
export function buildGymnopilusFieldColony(THREE){
  const group=new THREE.Group();
  group.name="Field-colony reconstruction, specimen taxon unresolved";
  const material=(hex,roughness=.92)=>new THREE.MeshStandardMaterial({color:hex,roughness,side:THREE.DoubleSide});
  const ground=new THREE.Mesh(new THREE.CylinderGeometry(5.0,5.1,.22,64),material(0x283222));
  ground.position.y=-1.52;group.add(ground);
  let seed=1635;
  const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
  // Fallen leaves form photographic context. Substrate is unverified; do not imply wood identification.
  const leafGeometry=new THREE.BufferGeometry();
  const v=[],inds=[];
  for(let i=0;i<95;i++){
    const angle=random()*Math.PI*2,dist=Math.sqrt(random())*4.6;
    const x=Math.cos(angle)*dist,z=Math.sin(angle)*dist,y=-1.394+random()*.035;
    const r=.10+random()*.24,rot=random()*Math.PI*2;
    const verts=[];
    for(let k=0;k<6;k++){
      const a=k*Math.PI/3+rot,scale=k%2===0?1:.54;
      verts.push([x+Math.cos(a)*r*scale,y+(random()-.5)*.065,z+Math.sin(a)*r*scale]);
    }
    const base=v.length/3;
    v.push(x,y,z);for(const p of verts)v.push(...p);
    for(let k=0;k<6;k++)inds.push(base,base+k+1,base+(k+1)%6+1);
  }
  leafGeometry.setAttribute("position",new THREE.Float32BufferAttribute(v,3));
  leafGeometry.setIndex(inds);leafGeometry.computeVertexNormals();
  const leaves=new THREE.Mesh(leafGeometry,material(0x927b3a));group.add(leaves);
  const caps=[0xdf9a2d,0xe9ad3c,0xc98325,0xe5a832,0xd38c24].map(x=>material(x,.87));
  const stems=[material(0xd5a45d),material(0xdfb465)];
  const gillMat=material(0xb58a55),olderGills=material(0x866341),veilMat=material(0xb98950);
  const points=[];
  for(let i=0;i<24;i++){
    const a=(i/24)*Math.PI*2+random()*.37,rad=.45+Math.sqrt(random())*2.25;
    points.push({x:Math.cos(a)*rad,z:Math.sin(a)*rad,r:.35+random()*.48,h:.38+random()*.67,tilt:(random()-.5)*.45,maturity:random()});
  }
  const modelCap=(radius,maturity,capMat)=>{
    const rings=12,segments=48,positions=[],indices=[];
    const dome=.2+.33*(1-maturity);
    for(let row=0;row<=rings;row++){
      const t=row/rings,rad=radius*t;
      for(let s=0;s<=segments;s++){
        const ang=s/segments*Math.PI*2;
        // Broad, often irregular and overlapping with asymmetric mature margins.
        const wave=1+(.035+.085*maturity)*Math.sin(5*ang+1.4)+(.02*maturity)*Math.sin(9*ang);
        const edgeDip=maturity*.20*Math.pow(t,7)*Math.sin(4*ang+1.3);
        positions.push(Math.cos(ang)*rad*wave,dome*(1-t*t)+edgeDip,Math.sin(ang)*rad*wave);
        if(row<rings&&s<segments){const n=row*(segments+1)+s;indices.push(n,n+segments+1,n+1,n+1,n+segments+1,n+segments+2)}
      }
    }
    const geom=new THREE.BufferGeometry();geom.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geom.setIndex(indices);geom.computeVertexNormals();
    return new THREE.Mesh(geom,capMat);
  };
  const gills=[];
  points.forEach((p,i)=>{
    const stem=new THREE.Group();stem.position.set(p.x,-1.37,p.z);stem.rotation.z=p.tilt;group.add(stem);
    const stalk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.19,p.h,14),stems[i%2]);stalk.position.y=p.h/2;stem.add(stalk);
    const head=new THREE.Group();head.position.set(0,p.h,0);stem.add(head);
    head.add(modelCap(p.r,p.maturity,caps[i%caps.length]));
    const underside=new THREE.Group();head.add(underside);underside.userData.isFieldGills=true;gills.push(underside);
    for(let j=0;j<84;j++){
      const a=j*Math.PI*2/84;
      const length=p.r*(.80-(j%4===0?0:.09));
      const blade=new THREE.Mesh(new THREE.BoxGeometry(length,.105,.010),p.maturity>.76?olderGills:gillMat);
      blade.position.set(Math.cos(a)*length*.53,-.09,Math.sin(a)*length*.53);
      blade.rotation.y=-a;underside.add(blade);
    }
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.135,.028,6,20),veilMat);
    ring.rotation.x=Math.PI/2;ring.position.y=-.13;head.add(ring);
    // Torn partial veil fragments; visible in lower field images and IMG_1625-1628.
    if(i%3===0){for(let k=0;k<4;k++){const a=k*Math.PI/2+.2;const frag=new THREE.Mesh(new THREE.ConeGeometry(.07,.20,5),veilMat);frag.position.set(Math.cos(a)*.16,-.17,Math.sin(a)*.16);frag.rotation.z=Math.cos(a)*.7;head.add(frag)}}
  });
  group.userData.gills=gills;
  group.userData.reference="IMG_1596-1635 (40 photographs, user-supplied; image assets are not bundled in this source)";
  return group;
}
