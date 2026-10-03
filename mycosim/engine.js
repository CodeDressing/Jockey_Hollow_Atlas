import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {PROFILE_BY_ID} from "./profiles.js";
import {DEFAULT_VARIANTS,validateVariantSelection,puffballSubtype,puffballSubtypeStageDefaults,applyPuffballSubtypeDefaults,enforcePuffballSubtype} from "./variants.js";
import {DEFAULT_DEVELOPMENTAL_STAGE,composeMorphologyState} from "./development.js";
import {referenceSheet,validateRenderedGasteroidState,VISUAL_CHARACTER_RATIONALE,REFERENCE_SHEET_AUDIT,VISUAL_CHARACTER_AUDIT} from "./validation_protocol.js";
import {REALISM_TIERS,PROFILE_REALISM_BUDGETS,selectRealismTier,configureRendererForRealism,configureRealisticLights,scaledSegments,installDistanceLod,disposeLodRecord,updateDistanceLod,rendererComplexity,performanceVerdict,chooseAdaptiveTier} from "./realism_pipeline.js";

const tissue=(color,roughness=.82,opts={})=>new THREE.MeshPhysicalMaterial({
  color,roughness,metalness:0,
  clearcoat:opts.clearcoat??0.05,
  clearcoatRoughness:opts.clearcoatRoughness??0.72,
  sheen:opts.sheen??0.08,
  sheenRoughness:opts.sheenRoughness??0.8,
  sheenColor:new THREE.Color(opts.sheenColor??color),
  side:opts.side??THREE.FrontSide
});
const mat=(color,roughness=.85)=>tissue(color,roughness);

// Lightweight procedural PBR maps for puffball tissues.
// These are tiny in-memory textures: no network fetches and negligible boot cost.
const makePbrNoiseTexture=(baseHex,seed=1,variance=.12,{size=32,color=true,repeat=5}={})=>{
  const base=new THREE.Color(baseHex);
  const data=new Uint8Array(size*size*4);
  let x=seed>>>0;
  for(let i=0;i<size*size;i++){
    x=(1664525*x+1013904223)>>>0;
    const n=((x/4294967295)*2-1)*variance;
    const j=i*4;
    if(color){
      data[j]=Math.round(THREE.MathUtils.clamp(base.r+n,0,1)*255);
      data[j+1]=Math.round(THREE.MathUtils.clamp(base.g+n*.88,0,1)*255);
      data[j+2]=Math.round(THREE.MathUtils.clamp(base.b+n*.72,0,1)*255);
    }else{
      const g=Math.round(THREE.MathUtils.clamp(.5+n*2.2,0,1)*255);
      data[j]=g;data[j+1]=g;data[j+2]=g;
    }
    data[j+3]=255;
  }
  const tex=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.repeat.set(repeat,repeat);
  if(color)tex.colorSpace=THREE.SRGBColorSpace;
  tex.needsUpdate=true;
  return tex;
};

const pbrFungalMaterial=(baseHex,{
  seed=1,variance=.10,roughness=.9,bumpScale=.025,opacity=1,
  side=THREE.FrontSide,sheen=.04,clearcoat=.01,repeat=5
}={})=>{
  const colorMap=makePbrNoiseTexture(baseHex,seed,variance,{color:true,repeat});
  const microMap=makePbrNoiseTexture(0x808080,seed+101,variance*.72,{color:false,repeat:repeat*1.6});
  return new THREE.MeshPhysicalMaterial({
    color:0xffffff,map:colorMap,roughness,roughnessMap:microMap,
    bumpMap:microMap,bumpScale,metalness:0,
    clearcoat,clearcoatRoughness:.95,
    sheen,sheenRoughness:.96,sheenColor:new THREE.Color(baseHex),
    transparent:opacity<1,opacity,side
  });
};

const PUFF_PBR=Object.freeze({
  youngPeridium:pbrFungalMaterial(0xcdbf9b,{seed:11,variance:.075,roughness:.88,bumpScale:.018,sheen:.08,clearcoat:.018,repeat:6}),
  wornExoperidium:pbrFungalMaterial(0x8c7658,{seed:23,variance:.16,roughness:.98,bumpScale:.052,side:THREE.DoubleSide,repeat:7}),
  endoperidium:pbrFungalMaterial(0xb6a27f,{seed:37,variance:.075,roughness:.94,bumpScale:.016,opacity:.72,side:THREE.DoubleSide,sheen:.025,repeat:5}),
  immatureGleba:pbrFungalMaterial(0xe9e2cf,{seed:43,variance:.055,roughness:.91,bumpScale:.020,opacity:.82,sheen:.025,repeat:5}),
  maturingGleba:pbrFungalMaterial(0xa69a69,{seed:47,variance:.10,roughness:.95,bumpScale:.035,opacity:.84,repeat:6}),
  matureGleba:pbrFungalMaterial(0x786444,{seed:53,variance:.14,roughness:.98,bumpScale:.055,opacity:.88,repeat:7}),
  driedSporeMass:pbrFungalMaterial(0x493728,{seed:61,variance:.18,roughness:1,bumpScale:.075,repeat:9}),
  soil:pbrFungalMaterial(0x3a3026,{seed:71,variance:.20,roughness:1,bumpScale:.09,repeat:8}),
  organicDebris:pbrFungalMaterial(0x4b3b2b,{seed:83,variance:.18,roughness:1,bumpScale:.065,repeat:8})
});



const puffStageDeformation=(stageId,yNorm,theta,phase,params={})=>{
  const waterLoss=params.water_loss??0;
  const collapse=params.collapse??0;
  const rupture=params.wall_rupture??params.rupture_extent??0;
  if(stageId==="young"){
    return {
      radial:1+.010*Math.sin(theta*3.1+phase)*(1-yNorm*yNorm)+.006*Math.cos(theta*5.2-phase*.7),
      yOffset:.006*Math.sin(theta*2.0+phase)*(1-Math.abs(yNorm)),
      xSlump:0,zSlump:0
    };
  }
  if(stageId==="mature"){
    const shoulder=Math.exp(-Math.pow((yNorm-.10)/.55,2));
    const apex=Math.max(0,(yNorm-.58)/.42);
    return {
      radial:1+.022*Math.sin(theta*2.7+phase)*(1-.45*Math.abs(yNorm))+.018*shoulder-.012*apex,
      yOffset:-.018*apex*apex+.010*Math.sin(theta*1.7+phase)*(1-Math.abs(yNorm)),
      xSlump:.010*Math.sin(phase),zSlump:.008*Math.cos(phase*.8)
    };
  }
  const upper=THREE.MathUtils.smoothstep(yNorm,.05,.92);
  const flank=1-Math.abs(yNorm);
  const furrow=(.018+.030*waterLoss)*Math.sin(theta*5.0+phase)*flank;
  return {
    radial:1-.055*waterLoss-.045*collapse*upper+furrow+.025*Math.sin(theta*2.2-phase)*flank,
    yOffset:-upper*(.10*collapse+.055*waterLoss)-.030*rupture*Math.sin(theta*1.3+phase)*upper,
    xSlump:(.025+.055*collapse)*Math.sin(phase)*upper,
    zSlump:(.020+.045*collapse)*Math.cos(phase*.77)*upper
  };
};

const puffShapeFactors=(shape,yNorm,theta)=>{
  let radial=1,vertical=1;
  if(shape==="subglobose"){radial=1.035;vertical=.94;}
  else if(shape==="pyriform"){radial=.74+.34*((yNorm+1)/2);vertical=1.08;}
  else if(shape==="turbiniform"){radial=.63+.45*((yNorm+1)/2);vertical=1.02;}
  else if(shape==="irregular"){radial=.98+.055*Math.sin(theta*2.4+yNorm*4.8);vertical=.90;}
  return {radial,vertical};
};

const createBiologicalPuffballGeometry=({
  radius=1.15,shape="globose",stageId="mature",subtypeId="true_puffball",seed=1,
  segments=64,rings=40,opening=0,params={},radialOffset=0
}={})=>{
  const verts=[],indices=[],uvs=[];
  const phase=((seed%10007)/10007)*Math.PI*2;
  const phiStart=THREE.MathUtils.clamp(opening,0,.92)*.68;
  const rr=Math.max(.08,radius-radialOffset);
  for(let iy=0;iy<=rings;iy++){
    const v=iy/rings;
    const phi=phiStart+(Math.PI-phiStart)*v;
    const yNorm=Math.cos(phi);
    const sinPhi=Math.sin(phi);
    for(let ix=0;ix<=segments;ix++){
      const u=ix/segments;
      const theta=u*Math.PI*2;
      const shapeFactors=puffShapeFactors(shape,yNorm,theta);
      const dev=puffStageDeformation(stageId,yNorm,theta,phase,params);
      const subtypeRadial=subtypeId==="giant_puffball_type"?1.025:subtypeId==="earthball_type"?1.01:1;
      const radial=rr*shapeFactors.radial*subtypeRadial*dev.radial;
      let x=Math.cos(theta)*sinPhi*radial+dev.xSlump;
      let z=Math.sin(theta)*sinPhi*radial+dev.zSlump;
      let y=yNorm*rr*shapeFactors.vertical+dev.yOffset*rr;

      // Low-amplitude, identity-stable organic asymmetry without changing the body plan.
      const field=(Math.sin(theta*3.0+phi*2.2+phase)+.55*Math.sin(theta*7.0-phi*4.1+phase*.63));
      const amp=stageId==="young"?.006:stageId==="mature"?.012:.017;
      const mod=1+field*amp*(.30+.70*sinPhi);
      x*=mod;z*=mod;
      if(stageId==="old"&&yNorm>.58){
        const crown=(yNorm-.58)/.42;
        y-=rr*crown*crown*(.020+.080*(params.collapse??0));
      }

      verts.push(x,y,z);
      uvs.push(u,1-v);
    }
  }
  const row=segments+1;
  for(let iy=0;iy<rings;iy++){
    for(let ix=0;ix<segments;ix++){
      const a=iy*row+ix,b=a+1,c=(iy+1)*row+ix,d=c+1;
      indices.push(a,c,b,b,c,d);
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));
  g.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
  g.setIndex(indices);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  g.userData={
    model:"continuous-biological-puffball-v2",stageId,shape,subtypeId,opening,
    deformation:stageId==="young"?"taut juvenile growth":stageId==="mature"?"expanded mature asymmetry":"senescent water-loss collapse"
  };
  return g;
};

const createGlebaVolumeGeometry=({
  radius=.82,stageId="mature",seed=1,segments=48,rings=30,
  maturity=.7,waterLoss=.2,depletion=0,shape="globose"
}={})=>{
  const verts=[],indices=[],uvs=[];
  const phase=((seed%7919)/7919)*Math.PI*2;
  const rough=stageId==="young"?.010:stageId==="mature"?.032:.060;
  for(let iy=0;iy<=rings;iy++){
    const v=iy/rings,phi=Math.PI*v,yNorm=Math.cos(phi),sinPhi=Math.sin(phi);
    for(let ix=0;ix<=segments;ix++){
      const u=ix/segments,theta=u*Math.PI*2;
      const sf=puffShapeFactors(shape,yNorm,theta);
      const cellular=Math.sin(theta*5.7+phi*4.1+phase)+.55*Math.sin(theta*11.1-phi*7.4+phase*.4);
      const porous=1+cellular*rough*(.45+.55*sinPhi)-waterLoss*.055-depletion*.035;
      const radial=radius*(.93+.07*sf.radial)*porous;
      const x=Math.cos(theta)*sinPhi*radial;
      const z=Math.sin(theta)*sinPhi*radial;
      const y=yNorm*radius*(.94+.06*sf.vertical)*(1-waterLoss*.045);
      verts.push(x,y,z);uvs.push(u,1-v);
    }
  }
  const row=segments+1;
  for(let iy=0;iy<rings;iy++){
    for(let ix=0;ix<segments;ix++){
      const a=iy*row+ix,b=a+1,c=(iy+1)*row+ix,d=c+1;
      indices.push(a,c,b,b,c,d);
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));
  g.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
  g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();
  g.userData={model:"porous-gleba-volume-v2",stageId,maturity,waterLoss,depletion};
  return g;
};

const sampleEllipsoidVolume=(count,seed,rx,ry,rz)=>{
  const rng=seededRng(seed),pts=[];
  let attempts=0;
  while(pts.length<count&&attempts++<count*20){
    const x=(rng()*2-1)*rx,y=(rng()*2-1)*ry,z=(rng()*2-1)*rz;
    const q=(x*x)/(rx*rx)+(y*y)/(ry*ry)+(z*z)/(rz*rz);
    if(q<=1)pts.push(new THREE.Vector3(x,y,z));
  }
  return {pts,rng};
};

const makeGlebaMicrostructure=({
  radius=.8,stageId="mature",realism="atlas",seed=1,maturity=.7,waterLoss=.2,depletion=0
}={})=>{
  const group=new THREE.Group();
  group.name="gleba_microstructure";
  group.userData={renderingModel:"porous-fibrous-volumetric-v2"};

  const powderBase={simplified:260,atlas:620,high:1200}[realism]||620;
  const powderFactor=stageId==="young"?.18:stageId==="mature"?.72:1;
  const powderCount=Math.max(0,Math.round(powderBase*powderFactor*(1-depletion*.42)));
  const powderSample=sampleEllipsoidVolume(powderCount,seed+307,radius*.84,radius*.77,radius*.84);
  const powderGeo=new THREE.IcosahedronGeometry(stageId==="young"?.011:stageId==="mature"?.015:.018,0);
  const powderMat=(stageId==="young"?PUFF_PBR.immatureGleba:stageId==="mature"?PUFF_PBR.matureGleba:PUFF_PBR.driedSporeMass).clone();
  const powder=new THREE.InstancedMesh(powderGeo,powderMat,powderSample.pts.length);
  powder.userData={id:"spore_mass",label:"Porous glebal / spore microstructure",category:"internal",selectable:true,knowledgeId:stageId==="young"?"immature_gleba":"spore_mass"};
  const dummy=new THREE.Object3D();
  powderSample.pts.forEach((p,i)=>{
    dummy.position.copy(p);
    const g=(.55+powderSample.rng()*.95)*(stageId==="old"?.85:1);
    dummy.scale.set(g,g*(.65+powderSample.rng()*.55),g*(.72+powderSample.rng()*.45));
    dummy.rotation.set(powderSample.rng()*Math.PI,powderSample.rng()*Math.PI,powderSample.rng()*Math.PI);
    dummy.updateMatrix();powder.setMatrixAt(i,dummy.matrix);
  });
  powder.instanceMatrix.needsUpdate=true;powder.castShadow=false;powder.receiveShadow=true;
  group.add(powder);

  const fiberBase={simplified:42,atlas:96,high:170}[realism]||96;
  const fiberFactor=stageId==="young"?1:stageId==="mature"?.62:.18;
  const fiberCount=Math.round(fiberBase*fiberFactor*(1-waterLoss*.35));
  if(fiberCount>0){
    const fiberGeo=new THREE.CylinderGeometry(.006,.009,1,5);
    const fiberMat=(stageId==="young"?PUFF_PBR.immatureGleba:PUFF_PBR.maturingGleba).clone();
    fiberMat.transparent=true;fiberMat.opacity=stageId==="young"?.48:.30;
    const fibers=new THREE.InstancedMesh(fiberGeo,fiberMat,fiberCount);
    fibers.userData={id:"gleba",label:"Fibrous glebal matrix",category:"internal",selectable:true,knowledgeId:"gleba"};
    const rng=seededRng(seed+811);
    const axis=new THREE.Vector3(0,1,0);
    const d=new THREE.Object3D();
    for(let i=0;i<fiberCount;i++){
      const a=sampleEllipsoidVolume(1,Math.floor(rng()*4294967295),radius*.66,radius*.60,radius*.66).pts[0]||new THREE.Vector3();
      const dir=new THREE.Vector3(rng()-.5,rng()-.5,rng()-.5).normalize();
      const len=.06+rng()*.16;
      d.position.copy(a);
      d.quaternion.setFromUnitVectors(axis,dir);
      d.scale.set(1,len,1);
      d.updateMatrix();fibers.setMatrixAt(i,d.matrix);
    }
    fibers.instanceMatrix.needsUpdate=true;fibers.castShadow=false;fibers.receiveShadow=true;
    group.add(fibers);
  }
  return group;
};

const PUFF_ORNAMENT_PROFILE=Object.freeze({
  echinate:Object.freeze({
    counts:Object.freeze({simplified:220,atlas:720,high:1450}),
    retention:Object.freeze({young:1,mature:.34,old:0}),
    scale:Object.freeze({young:1,mature:.42,old:0}),
    broken:Object.freeze({young:.07,mature:.58,old:1}),
    cluster:.34,barePatch:.12
  }),
  verrucose:Object.freeze({
    counts:Object.freeze({simplified:110,atlas:300,high:620}),
    retention:Object.freeze({young:1,mature:.62,old:.18}),
    scale:Object.freeze({young:1,mature:.72,old:.34}),
    cluster:.28,barePatch:.10
  }),
  granular:Object.freeze({
    counts:Object.freeze({simplified:300,atlas:920,high:1800}),
    retention:Object.freeze({young:1,mature:.48,old:.10}),
    scale:Object.freeze({young:1,mature:.60,old:.28}),
    cluster:.20,barePatch:.08
  }),
  furfuraceous:Object.freeze({
    counts:Object.freeze({simplified:150,atlas:420,high:820}),
    retention:Object.freeze({young:1,mature:.38,old:.06}),
    scale:Object.freeze({young:1,mature:.62,old:.32}),
    cluster:.42,barePatch:.18
  }),
  glabrous:Object.freeze({
    counts:Object.freeze({simplified:0,atlas:0,high:0}),
    retention:Object.freeze({young:0,mature:0,old:0}),
    scale:Object.freeze({young:0,mature:0,old:0}),
    cluster:0,barePatch:1
  })
});

const seededRng=seed=>{
  let x=(seed>>>0)||1;
  return ()=>{
    x=(1664525*x+1013904223)>>>0;
    return x/4294967296;
  };
};

const puffSurfacePoint=(shape,nx,ny,nz,bodyY,radius=1.165,{
  stageId="mature",subtypeId="true_puffball",seed=1,params={}
}={})=>{
  const theta=Math.atan2(nz,nx);
  const sf=puffShapeFactors(shape,ny,theta);
  const phase=((seed%10007)/10007)*Math.PI*2;
  const dev=puffStageDeformation(stageId,ny,theta,phase,params);
  const subtypeRadial=subtypeId==="giant_puffball_type"?1.025:subtypeId==="earthball_type"?1.01:1;
  const field=(Math.sin(theta*3.0+Math.acos(THREE.MathUtils.clamp(ny,-1,1))*2.2+phase)+.55*Math.sin(theta*7.0-Math.acos(THREE.MathUtils.clamp(ny,-1,1))*4.1+phase*.63));
  const amp=stageId==="young"?.006:stageId==="mature"?.012:.017;
  const sinPhi=Math.sqrt(Math.max(0,1-ny*ny));
  const mod=1+field*amp*(.30+.70*sinPhi);
  const radial=radius*sf.radial*subtypeRadial*dev.radial*mod;
  return new THREE.Vector3(
    nx*radial+dev.xSlump,
    bodyY+ny*radius*sf.vertical+dev.yOffset*radius,
    nz*radial+dev.zSlump
  );
};

const sampledPuffSurface=(target,seed,{cluster=.25,barePatch=.10,clusterCount=3,bareCount=2}={})=>{
  const rng=seededRng(seed);
  const out=[];
  const clusterCenters=[];
  const bareCenters=[];
  const clusterWeights=[];
  const bareWeights=[];
  const randomDir=()=>{
    const y=rng()*2-1;
    const a=rng()*Math.PI*2;
    const rr=Math.sqrt(Math.max(0,1-y*y));
    return new THREE.Vector3(Math.cos(a)*rr,y,Math.sin(a)*rr);
  };
  for(let i=0;i<clusterCount;i++)clusterCenters.push(randomDir());
  for(let i=0;i<bareCount;i++)bareCenters.push(randomDir());

  let attempts=0,rejectedCrowding=0,rejectedMask=0;
  const maxAttempts=Math.max(target*14,180);
  while(out.length<target&&attempts++<maxAttempts){
    const d=randomDir();
    let nearestCluster=-1;
    for(const c of clusterCenters)nearestCluster=Math.max(nearestCluster,d.dot(c));
    let nearestBare=-1;
    for(const b of bareCenters)nearestBare=Math.max(nearestBare,d.dot(b));
    const clustered=THREE.MathUtils.smoothstep(nearestCluster,.20,.94);
    const missing=THREE.MathUtils.smoothstep(nearestBare,.68,.985);

    // Broad local density fields avoid the artificial "evenly sprinkled" look.
    // Bare fields remain genuinely sparse; clustered fields can become visibly dense.
    const accept=THREE.MathUtils.clamp(.70+cluster*clustered-barePatch*missing*2.65,.025,1);
    if(rng()>accept){rejectedMask++;continue;}

    // Reject only very close neighbors: enough to prevent mesh collisions while
    // preserving biologically plausible clumping.
    let crowded=false;
    const checkFrom=Math.max(0,out.length-42);
    for(let i=checkFrom;i<out.length;i++){
      if(d.distanceToSquared(out[i])<.00034){crowded=true;break;}
    }
    if(crowded){rejectedCrowding++;continue;}

    out.push(d);
    clusterWeights.push(clustered);
    bareWeights.push(missing);
  }
  return {
    points:out,clusterWeights,bareWeights,rng,
    diagnostics:{
      requested:target,accepted:out.length,attempts,rejectedMask,rejectedCrowding,
      clusterCenters:clusterCenters.length,bareCenters:bareCenters.length
    }
  };
};

const makeEchinateGeometry=(broken=false)=>{
  const h=broken?.072:.132;
  const points=broken
    ? [
        new THREE.Vector2(.000,0),
        new THREE.Vector2(.050,.006), // basal skirt integrated with exoperidium
        new THREE.Vector2(.043,.016),
        new THREE.Vector2(.031,.032),
        new THREE.Vector2(.022,h*.72),
        new THREE.Vector2(.020,h)     // irregular blunt/broken apex
      ]
    : [
        new THREE.Vector2(.000,0),
        new THREE.Vector2(.052,.006), // broad tissue base, not a cone point
        new THREE.Vector2(.044,.017),
        new THREE.Vector2(.032,.034),
        new THREE.Vector2(.021,h*.66),
        new THREE.Vector2(.010,h*.88),
        new THREE.Vector2(.004,h*.97),
        new THREE.Vector2(.000,h)
      ];
  const g=new THREE.LatheGeometry(points,8);
  // Mild asymmetric bend makes the silhouette less mechanically conical.
  const pos=g.attributes.position;
  for(let i=0;i<pos.count;i++){
    const y=pos.getY(i);
    const t=THREE.MathUtils.clamp(y/h,0,1);
    pos.setX(i,pos.getX(i)+t*t*(broken?.004:.007));
  }
  pos.needsUpdate=true;g.computeVertexNormals();
  return g;
};

const makeVerrucoseGeometry=(flattened=false)=>{
  // Broad, low exoperidial mound; the base is wider than the summit so the
  // structure reads as continuous wall tissue rather than a pasted sphere.
  const h=flattened?.050:.082;
  const pts=[
    new THREE.Vector2(.000,0),
    new THREE.Vector2(.082,.004),
    new THREE.Vector2(.076,.016),
    new THREE.Vector2(.060,h*.50),
    new THREE.Vector2(.036,h*.82),
    new THREE.Vector2(.012,h),
    new THREE.Vector2(.000,h*.98)
  ];
  const g=new THREE.LatheGeometry(pts,9);
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const y=p.getY(i);
    const t=THREE.MathUtils.clamp(y/h,0,1);
    p.setX(i,p.getX(i)*(1+.08*Math.sin(i*1.73)*(1-t)));
  }
  p.needsUpdate=true;g.computeVertexNormals();
  return g;
};

const makeGranularGeometry=(coarse=false)=>{
  // Fine low-relief exoperidial grain; deliberately far smaller and denser
  // than verrucose ornament.
  const radius=coarse?.030:.020;
  const g=new THREE.IcosahedronGeometry(radius,0);
  g.scale(1,coarse?.46:.34,.88);
  return g;
};

const makeFurfuraceousGeometry=(curled=false)=>{
  // Thin bran-like flake with an uneven outline and one lifted edge.
  const g=new THREE.PlaneGeometry(curled?.090:.070,curled?.052:.040,2,1);
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i);
    const edge=Math.abs(x)/(curled?.045:.035);
    const lift=(curled?.018:.010)*edge*edge;
    const ripple=Math.sin((x+y)*95+i*.7)*(curled?.004:.0025);
    p.setZ(i,lift+ripple+(y>0?.002:0));
    p.setX(i,x*(.92+.10*Math.sin(i*2.1)));
  }
  p.needsUpdate=true;g.computeVertexNormals();
  return g;
};

const PUFF_ABRASION_PROFILE=Object.freeze({
  developmental:Object.freeze({young:.03,mature:.31,old:.82}),
  peridial:Object.freeze({intact:0,cracking:.12,areal_splitting:.24,flaking:.48,collapsed:.72}),
  sensitivity:Object.freeze({echinate:1.00,verrucose:.72,granular:.88,furfuraceous:1.08,glabrous:.22})
});

const abrasionState=(surface,stageId,peridial)=>{
  const developmental=PUFF_ABRASION_PROFILE.developmental[stageId]??.31;
  const condition=PUFF_ABRASION_PROFILE.peridial[peridial]??0;
  const sensitivity=PUFF_ABRASION_PROFILE.sensitivity[surface]??.8;
  const severity=THREE.MathUtils.clamp((developmental+condition*(1-developmental))*sensitivity,0,1);
  const retentionMultiplier=THREE.MathUtils.clamp(1-severity*.62,.08,1);
  return {developmental,condition,sensitivity,severity,retentionMultiplier};
};

const makeAbrasionScarGeometry=()=>{
  const g=new THREE.CircleGeometry(.090,14);
  // Slight asymmetry avoids a stamped circular decal appearance.
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i);
    p.setX(i,x*(.82+.12*Math.sin(i*2.13)));
    p.setY(i,y*(.72+.18*Math.cos(i*1.47)));
  }
  p.needsUpdate=true;g.computeVertexNormals();
  return g;
};

const ORNAMENT_GEOMETRY=Object.freeze({
  echinate:makeEchinateGeometry(false),
  echinateBroken:makeEchinateGeometry(true),
  verrucose:makeVerrucoseGeometry(false),
  verrucoseFlattened:makeVerrucoseGeometry(true),
  granular:makeGranularGeometry(false),
  granularCoarse:makeGranularGeometry(true),
  furfuraceous:makeFurfuraceousGeometry(false),
  furfuraceousCurled:makeFurfuraceousGeometry(true),
  abrasionScar:makeAbrasionScarGeometry()
});

const MATERIALS={
  cap:tissue(0x9a4a2d,.72,{clearcoat:.12,clearcoatRoughness:.68,sheen:.16,sheenColor:0xc88662}),
  cap2:tissue(0x754227,.79,{clearcoat:.07,sheen:.11,sheenColor:0xa16b4c}),
  flesh:tissue(0xe6dcc3,.91,{sheen:.06,sheenColor:0xfff3d8}),
  gill:tissue(0xd8c8a6,.94,{side:THREE.DoubleSide,sheen:.04,sheenColor:0xf4e4c7}),
  stipe:tissue(0xdfd2b6,.88,{sheen:.09,sheenColor:0xf5e5c6}),
  pore:tissue(0xc6a34a,.91,{sheen:.03}),
  poreDark:tissue(0x5d4a28,.98),
  coral:tissue(0xd8893a,.86,{sheen:.08}),
  morel:tissue(0x85572f,.98),puff:tissue(0xb6a37c,.98),
  jelly:new THREE.MeshPhysicalMaterial({color:0x9d5b40,roughness:.32,transmission:.2,thickness:.25,transparent:true,opacity:.9}),
  crust:tissue(0xb78650,.95),wood:tissue(0x493326,1)
};

export class MycoSimEngine{
  constructor({canvas,onHover,onSelect,onStatus,onStats}){
    this.canvas=canvas; this.onHover=onHover; this.onSelect=onSelect; this.onStatus=onStatus; this.onStats=onStats;
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});
    const requestedRealism=DEFAULT_VARIANTS.texture_realism||"atlas";
    this._bootRequestedRealism=requestedRealism;
    this._bootFastPath=true;
    this.realismTier=selectRealismTier({
      requested:"simplified",
      deviceMemory:navigator.deviceMemory||8,
      dpr:window.devicePixelRatio||1,
      viewportWidth:window.innerWidth||1200
    });
    configureRendererForRealism(this.renderer,this.realismTier);
    this.scene=new THREE.Scene();
    this.scene.fog=new THREE.FogExp2(0x091011,.035);
    this.camera=new THREE.PerspectiveCamera(34,1,.1,100);
    this.controls=new OrbitControls(this.camera,this.canvas);
    this.controls.enableDamping=true; this.controls.minDistance=3; this.controls.maxDistance=14;
    this.root=new THREE.Group(); this.scene.add(this.root);
    this.objects=new Map(); this.pickables=[]; this.hidden=new Set(); this.isolated=null; this.mode="macro"; this.variants={...DEFAULT_VARIANTS}; this.developmentalStageId=DEFAULT_DEVELOPMENTAL_STAGE; this.morphologyState=null;
    this.raycaster=new THREE.Raycaster(); this.pointer=new THREE.Vector2();
    this.lastHover=null; this.hoveredObject=null; this.hoveredMaterials=[]; this.frames=0; this.fpsStart=performance.now(); this.lastFps=0; this.fly=null; this.exploded=false; this.sectioned=false; this.originalTransforms=new Map();
    this.lodRecord=null;this._adaptiveTierApplied=false;this._lastComplexity={triangles:0,meshes:0,instanced:0,drawCalls:0};
    this._setupScene(); this._bind(); this.resize();
    this.resizeObserver=new ResizeObserver(()=>this.resize()); this.resizeObserver.observe(this.canvas);
    this.running=true; this._shadowsDeferred=true; this._animate();
    const enableShadows=()=>{
      if(!this.running||!this._shadowsDeferred)return;
      this._shadowsDeferred=false;
      this.renderer.shadowMap.enabled=true;
      this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.needsUpdate=true;
    };
    if("requestIdleCallback" in window) requestIdleCallback(enableShadows,{timeout:1500});
    else setTimeout(enableShadows,1200);
  }

  _setupScene(){
    this.scene.fog=this.realismTier.post.fog?new THREE.FogExp2(0x091011,.035):null;
    this.realismLights=configureRealisticLights(this.scene,this.realismTier);
    const ground=new THREE.Mesh(new THREE.CylinderGeometry(2.7,3,.28,scaledSegments(72,this.realismTier,{min:36,max:96})),MATERIALS.wood.clone());
    ground.position.y=-.72; ground.receiveShadow=true; ground.castShadow=false; this.scene.add(ground);
    const grid=new THREE.GridHelper(14,28,0x31403a,0x1b2824); grid.position.y=-.55; this.scene.add(grid);
  }

  _bind(){
    this._pointerMove=e=>this._pick(e,false);
    this._pointerClick=e=>this._pick(e,true);
    this._pointerLeave=()=>{this.lastHover=null;this._clearHoverHighlight();this.onHover?.(null);this.canvas.style.cursor="grab";};
    this.canvas.addEventListener("pointermove",this._pointerMove,{passive:true});
    this.canvas.addEventListener("pointerleave",this._pointerLeave,{passive:true});
    this.canvas.addEventListener("click",this._pointerClick);
  }

  addObject(mesh,meta){
    mesh.userData={...mesh.userData,...meta};
    mesh.castShadow=true; mesh.receiveShadow=true;
    this.root.add(mesh); this.pickables.push(mesh); this.objects.set(meta.id,mesh);
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

  _captureCurrentTransforms(){
    this.originalTransforms.clear();
    for(const obj of this.objects.values()){
      if(!obj?.parent) continue;
      this.originalTransforms.set(obj,{
        position:obj.position.clone(),
        rotation:obj.rotation.clone(),
        scale:obj.scale.clone()
      });
    }
  }
  register(mesh,id,label,category,parentId=null){
    return this.addObject(mesh,{id,label,category,parentId,selectable:true});
  }

  cleanupModel(){
    this._clearHoverHighlight(); this.clearKnowledgeProxy?.();
    if(this.lodRecord){disposeLodRecord(this.lodRecord,this.scene);this.lodRecord=null;}
    this.root.visible=true;
    this.objects.clear(); this.pickables.length=0; this.hidden.clear(); this.isolated=null; this.lastHover=null; this.exploded=false; this.sectioned=false; this.originalTransforms.clear();
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
    const profileBuildStart=performance.now();
    this._adaptiveTierApplied=false;
    const p=PROFILE_BY_ID[id]; if(!p) throw new Error("Unknown morphology profile: "+id);
    this.onStatus?.("Loading "+p.label+"…");
    const enteringPuffball=id==="puffball" && this.currentProfile?.id!=="puffball";
    if(enteringPuffball){
      const stageDefaults={
        young:{peridial_condition:"intact",ostiole_state:"absent",rupture_pattern:"intact",rupture_margin:"clean",collapse_state:"none",gleba_state:"immature"},
        mature:{peridial_condition:"flaking",ostiole_state:"developing",rupture_pattern:"apical_ostiole",rupture_margin:"slightly_torn",collapse_state:"slight",gleba_state:"maturing"},
        old:{peridial_condition:"collapsed",ostiole_state:"open",rupture_pattern:"irregular_rupture",rupture_margin:"ragged",collapse_state:"weathered",gleba_state:"old"}
      }[this.developmentalStageId];
      if(stageDefaults){
        const subtypeId=this.variants.puff_subtype||"true_puffball";
        const subtypeStage=puffballSubtypeStageDefaults(subtypeId,this.developmentalStageId);
        this.variants=enforcePuffballSubtype({...applyPuffballSubtypeDefaults(this.variants,subtypeId),...stageDefaults,...subtypeStage});
      }
    }
    this.cleanupModel();
    this.realismTier=selectRealismTier({
      requested:this._bootFastPath?"simplified":(this.variants.texture_realism||"atlas"),
      deviceMemory:navigator.deviceMemory||8,
      dpr:window.devicePixelRatio||1,
      viewportWidth:window.innerWidth||1200
    });
    configureRendererForRealism(this.renderer,this.realismTier);
    this.morphologyState=composeMorphologyState(id,{stageId:this.developmentalStageId,variants:this.variants});
    const fn=this["build_"+p.factory];
    if(typeof fn!=="function") throw new Error("Missing model factory: "+p.factory);
    fn.call(this);
    this.applyArchitectureDevelopmentalGeometry(id);
    // Capture the completed biological state only after builders have assigned
    // their real positions and developmental transforms. Presentation reset /
    // exploded-view restoration must never use register-time (0,0,0) positions.
    this._captureCurrentTransforms();
    this.currentProfile=p;
    if(PROFILE_REALISM_BUDGETS[id]?.lod){
      this.lodRecord=installDistanceLod(this,id,this.realismTier);
    }
    this.mode="macro";
    if(id==="puffball"){
      const sectionMode=this.variants.section_view||"external";
      if(sectionMode==="half_section") this.setSection(true,"x");
      else if(sectionMode==="longitudinal") this.setSection(true,"z");
      else this.setSection(false);
      if(sectionMode==="hover_anatomy") this.mode="internal";
    }else{
      this.setSection(false);
    }
    this.applyMode();
    this.frameModel({animate:false});
    this._lastProfileBuildMs=performance.now()-profileBuildStart;
    this.onStatus?.("3D engine online · "+p.label+" · "+this.morphologyState.stage.label+" · "+Math.round(this._lastProfileBuildMs)+" ms");
    if(this._bootFastPath){
      this._bootFastPath=false;
      const promote=()=>{
        // Do not rebuild immediately; subsequent morphology interaction or
        // explicit quality selection uses the requested Atlas/High tier.
        this.realismTier=selectRealismTier({
          requested:this.variants.texture_realism||this._bootRequestedRealism||"atlas",
          deviceMemory:navigator.deviceMemory||8,
          dpr:window.devicePixelRatio||1,
          viewportWidth:window.innerWidth||1200
        });
        configureRendererForRealism(this.renderer,this.realismTier);
      };
      if("requestIdleCallback" in window)requestIdleCallback(promote,{timeout:1600});
      else setTimeout(promote,250);
    }
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
        if(["hymenophore","tube_layer","fertile_head","gleba","stipe_context"].includes(id)) continue;
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
    let next={...this.variants,[group]:value};
    if(this.currentProfile?.id==="puffball" || group==="puff_subtype"){
      if(group==="puff_subtype") next=applyPuffballSubtypeDefaults(next,value);
      next=enforcePuffballSubtype(next);
    }
    const v=validateVariantSelection(next);
    if(!v.valid) throw new Error(v.errors.join("; "));
    this.variants=next;
    if(this.currentProfile) this.loadProfile(this.currentProfile.id);
  }

  getVariantState(){return {...this.variants};}

  setRealismMode(mode){
    const requested=mode==="high"?"high":"atlas";
    this.variants={...this.variants,texture_realism:requested};
    this.realismTier=selectRealismTier({
      requested,
      deviceMemory:navigator.deviceMemory||8,
      dpr:window.devicePixelRatio||1,
      viewportWidth:window.innerWidth||1200
    });
    configureRendererForRealism(this.renderer,this.realismTier);
    if(this.currentProfile)this.loadProfile(this.currentProfile.id);
    return this.realismTier.id;
  }

  setDevelopmentalStage(stageId){
    if(!this.currentProfile){
      this.developmentalStageId=stageId;
      return;
    }
    const profileId=this.currentProfile.id;
    const previousMode=this.mode;
    if(profileId==="puffball"){
      const stageDefaults={
        young:{peridial_condition:"intact",ostiole_state:"absent",rupture_pattern:"intact",rupture_margin:"clean",collapse_state:"none",gleba_state:"immature"},
        mature:{peridial_condition:"flaking",ostiole_state:"developing",rupture_pattern:"apical_ostiole",rupture_margin:"slightly_torn",collapse_state:"slight",gleba_state:"maturing"},
        old:{peridial_condition:"collapsed",ostiole_state:"open",rupture_pattern:"irregular_rupture",rupture_margin:"ragged",collapse_state:"weathered",gleba_state:"old"}
      }[stageId];
      if(stageDefaults){
        const subtypeId=this.variants.puff_subtype||"true_puffball";
        const subtypeStage=puffballSubtypeStageDefaults(subtypeId,stageId);
        this.variants=enforcePuffballSubtype({...this.variants,...stageDefaults,...subtypeStage});
      }
    }
    const next=composeMorphologyState(profileId,{stageId,variants:this.variants});
    this.developmentalStageId=stageId;
    this.morphologyState=next;
    this.loadProfile(profileId);
    this.mode=previousMode;
    this.applyMode();
    this.onStatus?.("3D engine online · "+this.currentProfile.label+" · "+this.morphologyState.stage.label+" · "+previousMode);
  }

  getDevelopmentalStage(){
    return this.morphologyState?.stage||null;
  }

  getMorphologyState(){
    return this.morphologyState;
  }

  stageParam(name,fallback=1){
    const v=this.morphologyState?.stage?.parameters?.[name];
    return Number.isFinite(v)?v:fallback;
  }

  applyArchitectureDevelopmentalGeometry(profileId){
    const stage=this.morphologyState?.stage;
    if(!stage) return;
    const p=stage.parameters||{};
    const sid=stage.id;

    const setScale=(id,x=1,y=1,z=1)=>{
      const o=this.objects.get(id);
      if(o)o.scale.multiply(new THREE.Vector3(x,y,z));
    };
    const move=(id,x=0,y=0,z=0)=>{
      const o=this.objects.get(id);
      if(o)o.position.add(new THREE.Vector3(x,y,z));
    };
    const weather=(id,amount=0)=>{
      const o=this.objects.get(id); if(!o)return;
      o.traverse?.(n=>{
        if(!n.material)return;
        for(const m of (Array.isArray(n.material)?n.material:[n.material])){
          if("roughness" in m)m.roughness=Math.min(1,(m.roughness??.8)+amount*.16);
          if(m.color){
            const hsl={h:0,s:0,l:0};m.color.getHSL(hsl);
            m.color.setHSL(hsl.h,Math.max(0,hsl.s*(1-amount*.18)),Math.max(.08,hsl.l*(1-amount*.28)));
          }
        }
      });
    };

    if(profileId==="agaricoid"){
      const expansion=p.pileus_expansion??1;
      const elong=p.stipe_elongation??1;
      const flatten=p.cap_flattening??0;
      const wear=p.surface_weathering??p.surface_wear??0;
      const waterLoss=p.water_loss??0;
      const collapse=p.collapse??0;
      const deform=p.deformation??0;
      const gillDark=p.gill_darkening??0;
      const marginRelease=p.margin_release??(1-(p.margin_inroll??0));

      const capYScale=Math.max(.82,1+(sid==="young"?.24:0)-flatten*.16-collapse*.05);
      setScale("pileus",Math.max(.88,expansion),capYScale,Math.max(.88,expansion));
      setScale("pileus_underside",Math.max(.88,expansion),capYScale,Math.max(.88,expansion));
      setScale("pileipellis",Math.max(.88,expansion),capYScale,Math.max(.88,expansion));
      setScale("pileus_context",expansion,1-collapse*.06,expansion);
      setScale("hymenophore",expansion,Math.max(.20,p.lamella_exposure??1),expansion);
      setScale("stipe",1-waterLoss*.055,elong*(1-collapse*.08),1-waterLoss*.055);
      setScale("stipe_base",sid==="young"?.88:sid==="old"?1.04:1,1-collapse*.05,sid==="young"?.88:sid==="old"?1.04:1);

      const hym=this.objects.get("hymenophore");
      hym?.traverse?.(node=>{
        if(!node.material)return;
        for(const mat of (Array.isArray(node.material)?node.material:[node.material])){
          if(mat.color){
            const hsl={h:0,s:0,l:0};mat.color.getHSL(hsl);
            mat.color.setHSL(hsl.h,Math.max(0,hsl.s*(1-gillDark*.14)),Math.max(.12,hsl.l*(1-gillDark*.34)));
          }
          if("roughness" in mat)mat.roughness=Math.min(1,(mat.roughness??.82)+waterLoss*.10);
        }
      });

      if(this.objects.get("veil_structure")){
        const veil=Math.max(.18,p.veil_persistence??1);
        setScale("veil_structure",veil,veil,veil);
      }
      if(sid==="young"){
        move("pileus",0,-.12*(1-marginRelease),0);
        move("pileus_underside",0,-.12*(1-marginRelease),0);
        move("pileipellis",0,-.12*(1-marginRelease),0);
        move("hymenophore",0,.03,0);
      }else if(sid==="old"){
        const pileus=this.objects.get("pileus");
        const undersideObj=this.objects.get("pileus_underside");
        const surface=this.objects.get("pileipellis");
        const tilt=.025+.055*deform;
        if(pileus){pileus.rotation.z+=tilt;pileus.rotation.x+=.012+.025*deform;}
        if(undersideObj){undersideObj.rotation.z+=tilt;undersideObj.rotation.x+=.012+.025*deform;}
        if(surface){surface.rotation.z+=tilt;surface.rotation.x+=.012+.025*deform;}
        const stipe=this.objects.get("stipe");
        if(stipe)stipe.rotation.z+=.015+.025*deform;
      }
      weather("pileus",wear+waterLoss*.18);
      weather("pileipellis",wear+waterLoss*.15);
      weather("hymenophore",wear*.65+gillDark*.20);
      weather("stipe",wear*.45+(p.stipe_aging??0)*.18);
    }

    if(profileId==="boletoid"){
      const expansion=p.pileus_expansion??1;
      const convex=p.cap_convexity??.62;
      const tubeDepth=p.tube_depth??1;
      const poreOpen=p.pore_openness??1;
      const robust=p.stipe_robustness??1;
      const wear=p.surface_wear??0;
      setScale("pileus",expansion,.72+convex*.55,expansion);
      setScale("tube_layer",expansion,tubeDepth,expansion);
      setScale("hymenophore",expansion*poreOpen,1,expansion*poreOpen);
      setScale("stipe",robust,1,robust);
      setScale("stipe_base",robust,1,robust);
      if(sid==="young"){
        move("pileus",0,-.10,0);
        move("tube_layer",0,.08,0);
        move("hymenophore",0,.10,0);
      }else if(sid==="old"){
        const pileus=this.objects.get("pileus");
        if(pileus){pileus.rotation.z+=.025;}
      }
      weather("pileus",wear+(p.surface_cracking??0)*.22);
      weather("tube_layer",wear*.75);
      weather("hymenophore",wear*.9);
    }

    if(profileId==="polyporoid"){
      const shelf=p.shelf_expansion??1;
      const context=p.context_thickness??1;
      const tube=p.tube_depth??1;
      const margin=p.margin_activity??.6;
      const wear=p.surface_weathering??p.surface_wear??0;
      setScale("pileus",shelf, .72+context*.28, shelf);
      setScale("context",shelf,context,shelf);
      setScale("tube_layer",shelf,tube,shelf);
      setScale("hymenophore",shelf,1,shelf);
      if(sid==="young"){
        move("pileus",-.12,-.08,0);
        move("context",-.10,-.04,0);
        move("tube_layer",-.10,.02,0);
        move("hymenophore",-.10,.03,0);
      }else if(sid==="old"){
        const shelfObj=this.objects.get("pileus");
        if(shelfObj){shelfObj.rotation.z-=.035;}
      }
      weather("pileus",wear);
      weather("context",wear*.55);
      weather("hymenophore",wear*.85);
      const pore=this.objects.get("hymenophore");
      if(pore&&pore.material&&"roughness" in pore.material)pore.material.roughness=Math.min(1,.75+(1-margin)*.2);
    }

    if(profileId==="hoof_conk"){
      const depth=p.hoof_depth??1;
      const context=p.context_thickness??1;
      const layers=p.tube_stratification??1;
      const crust=p.crust_weathering??0;
      setScale("pileus",.82+depth*.18,.68+depth*.32,.88+depth*.12);
      setScale("context",.82+depth*.18,context,.90+depth*.10);
      setScale("tube_layer",.82+depth*.18,.72+layers*.28,.90+depth*.10);
      setScale("hymenophore",.84+depth*.16,1,.90+depth*.10);
      if(sid==="young"){
        move("pileus",-.18,-.14,0);
        move("context",-.14,-.10,0);
        move("tube_layer",-.12,-.04,0);
      }else if(sid==="old"){
        const pileus=this.objects.get("pileus");
        if(pileus){pileus.rotation.z-=.028;pileus.rotation.y+=.022;}
      }
      weather("pileus",crust);
      weather("tube_layer",crust*.55);
      weather("hymenophore",crust*.65);
    }

    if(profileId==="hydnoid"){
      const expansion=p.pileus_expansion??1;
      const toothLength=p.tooth_length??1;
      const toothDensity=p.tooth_density??1;
      const elong=p.stipe_elongation??1;
      setScale("pileus",expansion,sid==="young"?1.22:sid==="old"?.88:1,expansion);
      setScale("stipe",1,elong,1);
      const teeth=this.objects.get("hymenophore");
      if(teeth){
        teeth.scale.set(expansion,toothLength,expansion);
        teeth.children.forEach((t,i)=>{
          const keep=Math.max(.45,toothDensity);
          t.visible=(i%100)/100<keep;
          if(sid==="old") t.rotation.z+=(i%5-2)*.012*(p.tooth_wear??0);
        });
      }
      if(sid==="old"){
        const pileus=this.objects.get("pileus");
        if(pileus)pileus.rotation.z+=.03*(p.margin_irregularity??0);
      }
    }

    if(profileId==="hydnoid_bracket"){
      const shelf=p.shelf_expansion??1;
      const toothLength=p.tooth_length??1;
      const toothDensity=p.tooth_density??1;
      const context=p.context_thickness??1;
      setScale("pileus",shelf,.78+context*.22,shelf);
      setScale("context",shelf,context,shelf);
      const teeth=this.objects.get("hymenophore");
      if(teeth){
        teeth.scale.set(shelf,toothLength,shelf);
        teeth.children.forEach((t,i)=>{
          t.visible=(i%100)/100<Math.max(.42,toothDensity);
          if(sid==="old") t.rotation.x+=((i%7)-3)*.006*(p.tooth_wear??0);
        });
      }
      if(sid==="old"){
        const pileus=this.objects.get("pileus");
        if(pileus)pileus.rotation.z-=.028*(p.edge_erosion??0);
      }
    }

    if(profileId==="morel"){
      const headElong=p.head_elongation??1;
      const pitDepth=p.pit_depth??1;
      const ridge=p.ridge_prominence??1;
      const stipeElong=p.stipe_elongation??1;
      const drying=p.drying??0;
      const collapse=p.collapse??0;
      const head=this.objects.get("fertile_head");
      const hym=this.objects.get("hymenophore");
      if(head){
        head.scale.multiply(new THREE.Vector3(
          1-drying*.16,
          headElong*(1-collapse*.28),
          1-drying*.16
        ));
        if(sid==="old"){head.rotation.z+=.025;head.rotation.x-=.018;}
      }
      if(hym){
        hym.scale.multiply(new THREE.Vector3(
          ridge*(1-drying*.08),
          headElong*(1-collapse*.22),
          ridge*(1-drying*.08)
        ));
        if(hym.material){
          hym.material.opacity=Math.max(.28,.55-drying*.18);
          if("linewidth" in hym.material)hym.material.linewidth=1+pitDepth*.3;
        }
      }
      setScale("stipe",1-drying*.10,stipeElong*(1-collapse*.14),1-drying*.10);
      setScale("internal_cavity",1-drying*.08,headElong*.92,1-drying*.08);
      weather("fertile_head",drying*.75);
      weather("stipe",drying*.4);
    }

    if(profileId==="coral"){
      const height=p.branch_height??1;
      const spread=p.branch_spread??1;
      const density=p.branch_density??1;
      const tipWear=p.tip_wear??0;
      const collapse=p.branch_collapse??0;
      const group=this.objects.get("branch_system");
      if(group){
        group.scale.set(spread,height*(1-collapse*.22),spread);
        group.children.forEach((branch,i)=>{
          branch.visible=(i%100)/100<Math.max(.52,density);
          if(sid==="young"){
            branch.rotation.z*=.45;
            branch.scale.x*=.92;branch.scale.z*=.92;
          }else if(sid==="old"){
            branch.rotation.z+=((i%7)-3)*.018*collapse;
            branch.rotation.x+=((i%5)-2)*.012*tipWear;
            if(i%4===0)branch.scale.y*=Math.max(.68,1-tipWear*.24);
          }
        });
      }
      weather("branch_system",tipWear*.55);
    }

    if(profileId==="puffball"){
      const taut=p.peridium_tautness??1;
      const glebaMaturity=p.gleba_maturity??0;
      const stagePore=p.apical_pore_opening??0;
      const collapse=p.collapse??0;
      const release=p.spore_release??0;
      const peridialThickness=(p.peridial_thickness??p.wall_thickness??1)*(subtypeArch.wallFactor||1)*(subtypeDev.wallPersistence||1);
      const exoperidialRetention=THREE.MathUtils.clamp((p.exoperidial_retention??p.ornament_retention??1)*(subtypeDev.ornamentPersistence||1),0,1);
      const ostioleFormation=THREE.MathUtils.clamp((p.ostiole_formation??stagePore)*(subtypeArch.ostioleBias||1),0,1);
      const waterLoss=p.water_loss??0;
      const wallRupture=THREE.MathUtils.clamp((p.wall_rupture??p.rupture_extent??0)*(subtypeDev.ruptureBias||1),0,1);
      const discoloration=p.discoloration??0;
      const sporeDepletion=p.spore_depletion??release;
      const retention=p.ornament_retention??1;
      const shape=this.variants.puff_shape||"globose";
      const base=this.variants.puff_base||"short";
      const peridial=this.variants.peridial_condition||"intact";
      const ostiole=this.variants.ostiole_state||"absent";
      const glebaState=this.variants.gleba_state||"immature";
      const rupturePattern=this.variants.rupture_pattern||"intact";
      const ruptureMarginState=this.variants.rupture_margin||"clean";
      const collapseState=this.variants.collapse_state||"none";
      const surfaceState=this.variants.puff_surface||"echinate";
      const subtypeId=this.variants.puff_subtype||"true_puffball";
      const subtype=puffballSubtype(subtypeId);
      const subtypeArch=subtype.architecture||{};
      const subtypeDev=subtype.development||{};
      const integratedAbrasion=abrasionState(surfaceState,sid,peridial);

      const subtypeCollapse=THREE.MathUtils.clamp(collapse*(subtypeDev.collapseBias||1),0,1);
      // Selected body-plan shape is baked into the continuous biological mesh.
      // Stage transforms below alter hydration/thickness/collapse only; they do not
      // re-apply an unrelated geometric shape distortion.
      const shapeScale=[1,1,1];

      const wallRadial=THREE.MathUtils.lerp(.96,1.01,peridialThickness);
      setScale("peridium",shapeScale[0]*wallRadial*(1-subtypeCollapse*.20),shapeScale[1]*taut*(1-subtypeCollapse*.18),shapeScale[2]*wallRadial*(1-subtypeCollapse*.20));
      setScale("endoperidium",shapeScale[0]*(.97+peridialThickness*.03)*(1-subtypeCollapse*.18),shapeScale[1]*taut*(1-subtypeCollapse*.16),shapeScale[2]*(.97+peridialThickness*.03)*(1-subtypeCollapse*.18));
      setScale("gleba",shapeScale[0]*(.78+glebaMaturity*.22),shapeScale[1]*(.82+glebaMaturity*.18),shapeScale[2]*(.78+glebaMaturity*.22));

      const baseScale={none:[.08,.08,.08],short:[1,.65,1],distinct:[1.08,1.18,1.08],rooting:[.72,1.55,.72]}[base]||[1,.65,1];
      setScale("sterile_base",baseScale[0]*(1-subtypeCollapse*.08),baseScale[1]*(1-subtypeCollapse*.20),baseScale[2]*(1-subtypeCollapse*.08));
      const baseObj=this.objects.get("sterile_base");
      if(baseObj)baseObj.visible=base!=="none";

      const ostioleMap={absent:0,developing:.34,open:.82,ragged:1.18};
      const poreOpen=Math.max(stagePore*ostioleFormation,ostioleMap[ostiole]??0);
      const pore=this.objects.get("apical_pore");
      if(pore){
        const ps=Math.max(.03,poreOpen);
        pore.scale.set(ps,ps,ps);
        pore.visible=poreOpen>.04;
        if(ostiole==="ragged")pore.scale.z*=.72;
      }

      const glebaColors={
        immature:0xf0ead8,
        maturing:0xa79a66,
        mature:0x756143,
        old:0x403428
      };
      const ageTint=THREE.MathUtils.clamp(discoloration*.55+waterLoss*.18,0,.68);
      const peridiumObj=this.objects.get("peridium");
      if(peridiumObj?.material?.color){
        const c=new THREE.Color(0xcbbd99).lerp(new THREE.Color(0x79624a),ageTint);
        peridiumObj.material.color.copy(c);
      }
      const gleba=this.objects.get("gleba");
      if(gleba?.material?.color){
        gleba.material.color.setHex(glebaColors[glebaState]??0xf0ead8);
        gleba.material.opacity=Math.max(.28,.72-waterLoss*.18-sporeDepletion*.26);
      }
      const sporeMass=this.objects.get("spore_mass");
      if(sporeMass){
        const matureEnough=glebaState==="mature"||glebaState==="old";
        sporeMass.visible=matureEnough;
        sporeMass.scale.setScalar(Math.max(.38,(glebaState==="old"?.92:.78)*(1-sporeDepletion*.42)));
        sporeMass.traverse?.(node=>{
          if(!node.material)return;
          const mats=Array.isArray(node.material)?node.material:[node.material];
          for(const mat of mats){
            mat.transparent=true;
            mat.opacity=Math.max(.18,(glebaState==="old"?.58:.40)*(1-sporeDepletion*.48));
            if(mat.color)mat.color.setHex(glebaState==="old"?0x3e3025:0x625037);
            if("roughness" in mat)mat.roughness=Math.min(1,.94+waterLoss*.06);
          }
        });
      }
      const apical=this.objects.get("apical_region");
      if(apical)apical.visible=true;
      const basal=this.objects.get("basal_attachment");
      if(basal)basal.visible=base!=="none";
      const earthstar=this.objects.get("earthstar_rays");
      if(earthstar){
        earthstar.visible=subtypeId==="earthstar_type";
        const raySpread=sid==="young"?.18:sid==="mature"?.72:1.00;
        earthstar.children.forEach((ray,i)=>{
          ray.scale.y*=raySpread;
          ray.rotation.x=(Math.PI/2)*(1-raySpread*.72)+((i%3)-1)*.035;
        });
      }
      const gasteroidStalk=this.objects.get("gasteroid_stalk");
      if(gasteroidStalk){
        gasteroidStalk.visible=subtypeId==="stalked_puffball_type";
        gasteroidStalk.scale.y*=sid==="young"?.62:sid==="mature"?1:.96;
        if(sid==="old")gasteroidStalk.rotation.z+=.025;
      }
      const oldDebris=this.objects.get("old_basal_debris");
      const layeredShell=this.objects.get("senescent_shell");
      const ruptureMarginObj=this.objects.get("rupture_margin");
      const ruptureChannel=this.objects.get("rupture_channel");
      const wornExo=this.objects.get("worn_exoperidium");
      const collapsedWall=this.objects.get("collapsed_wall");
      if(oldDebris)oldDebris.visible=sid==="old" && base!=="none";
      if(layeredShell)layeredShell.visible=sid==="old";
      if(ruptureMarginObj)ruptureMarginObj.visible=sid!=="young" && rupturePattern!=="intact";
      if(ruptureChannel)ruptureChannel.visible=sid!=="young" && rupturePattern!=="intact";
      if(wornExo){
        wornExo.visible=integratedAbrasion.severity>.08;
        wornExo.children.forEach((patch,i)=>{
          const threshold=THREE.MathUtils.clamp(integratedAbrasion.severity+(1-exoperidialRetention)*.35,0,1);
          patch.visible=((i*31)%100)/100<threshold;
          if(patch.material){
            patch.material.opacity=.42+threshold*.45;
            patch.material.transparent=patch.material.opacity<1;
          }
        });
      }
      if(collapsedWall)collapsedWall.visible=collapseState!=="none";

      const collapseScale={none:1,slight:.94,moderate:.82,severe:.66,weathered:.72}[collapseState]??1;
      const collapseTilt={none:0,slight:.018,moderate:.045,severe:.075,weathered:.095}[collapseState]??0;
      if(layeredShell){
        layeredShell.scale.set(shapeScale[0]*(1-collapse*.10),shapeScale[1]*collapseScale,shapeScale[2]*(1-collapse*.10));
        layeredShell.rotation.z+=collapseTilt*(.45+wallRupture*.75);
        if(collapseState==="weathered")layeredShell.rotation.x-=.035+waterLoss*.025;
        layeredShell.traverse?.(node=>{
          if(!node.material)return;
          const mats=Array.isArray(node.material)?node.material:[node.material];
          for(const mat of mats){
            if("roughness" in mat)mat.roughness=Math.min(1,(mat.roughness??.9)+waterLoss*.06);
          }
        });
      }
      if(ruptureMarginObj){
        ruptureMarginObj.scale.y*=collapseScale;
        ruptureMarginObj.rotation.z+=collapseTilt;
      }
      if(ruptureChannel)ruptureChannel.rotation.z+=collapseTilt*.35;

      if(sid==="old"){
        // Replace the clean mathematical sphere with a continuous layered ruptured shell.
        const perObj=this.objects.get("peridium");
        if(perObj)perObj.visible=false;
        const endoObj=this.objects.get("endoperidium");
        if(endoObj)endoObj.visible=false;
        if(gleba){
          gleba.visible=true;
          gleba.scale.y*=Math.max(.52,1-waterLoss*.30);
        }
        if(sporeMass)sporeMass.visible=true;
        if(pore)pore.visible=false;
        if(apical)apical.visible=false;

        // Age the sterile base rather than preserving a pristine cylinder.
        if(baseObj){
          baseObj.scale.x*=.90;
          baseObj.scale.z*=1.05;
          baseObj.rotation.z+=.055;
          if(baseObj.material?.color)baseObj.material.color.setHex(0x8d795f);
          if("roughness" in baseObj.material)baseObj.material.roughness=1;
        }
      }

      const ornament=this.objects.get("exoperidium");
      if(ornament){
        ornament.visible=exoperidialRetention>.015 || surfaceState==="glabrous";
        ornament.scale.setScalar(.94+.06*exoperidialRetention);
        ornament.userData.integratedAbrasion={
          severity:integratedAbrasion.severity,
          peridialCondition:peridial,
          stage:sid,
          surface:surfaceState,
          peridialThickness,exoperidialRetention,ostioleFormation,glebaMaturity,
          waterLoss,collapse,wallRupture,discoloration,sporeDepletion
        };
        ornament.traverse?.(node=>{
          if(!node.material)return;
          const mats=Array.isArray(node.material)?node.material:[node.material];
          for(const mat of mats){
            if("roughness" in mat)mat.roughness=Math.min(1,(mat.roughness??.92)+integratedAbrasion.severity*.06);
          }
        });
      }

      const wall=this.objects.get("peridium");
      if(wall){
        if(peridial==="cracking") wall.rotation.z+=.012;
        if(peridial==="areal_splitting"){wall.scale.x*=.99;wall.scale.z*=1.01;}
        if(peridial==="flaking") weather("peridium",.28);
        if(peridial==="collapsed"){
          wall.scale.y*=.66;
          wall.rotation.z+=.07;
          setScale("gleba",1,.72,1);
        }
      }
      const cracks=this.objects.get("peridial_marks");
      if(cracks){
        cracks.visible=peridial!=="intact";
        const severity={intact:0,cracking:.45,areal_splitting:.70,flaking:.82,collapsed:1}[peridial]??0;
        cracks.children.forEach((c,i)=>c.visible=((i*29)%100)/100<severity);
      }

      weather("peridium",(1-taut)*.45+collapse*.25+(peridial==="flaking"?.18:0));
      if(sid==="old"){
        weather("senescent_shell",.88);
        weather("sterile_base",.52);
      }
    }

    if(profileId==="cup"){
      const openness=p.cup_openness??1;
      const depth=p.cup_depth??1;
      const rim=p.rim_thickness??1;
      const irregular=p.rim_irregularity??0;
      const collapse=p.collapse??0;
      setScale("apothecium",openness,depth*(1-collapse*.18),openness);
      setScale("hymenophore",openness,1,openness);
      setScale("excipulum",openness,rim,openness);
      if(sid==="old"){
        const cup=this.objects.get("apothecium");
        if(cup){cup.rotation.z+=.035*irregular;cup.rotation.x-=.018*collapse;}
      }
    }

    if(profileId==="jelly"){
      const fullness=p.lobe_fullness??1;
      const hydration=p.hydration??1;
      const wrinkling=p.wrinkling??0;
      const translucency=p.translucency??.7;
      const collapse=p.collapse??0;
      const lobes=this.objects.get("lobes");
      if(lobes){
        lobes.scale.set(fullness,hydration*(1-collapse*.28),fullness);
        lobes.children.forEach((l,i)=>{
          if(sid==="old"){
            l.scale.y*=Math.max(.42,1-wrinkling*.45);
            l.rotation.z+=((i%5)-2)*.05*wrinkling;
          }
          if(l.material){
            l.material.opacity=Math.max(.38,.55+translucency*.35);
            if("transmission" in l.material)l.material.transmission=Math.min(.48,.12+translucency*.34);
          }
        });
      }
      setScale("attachment",fullness,.85+hydration*.15,fullness);
    }

    if(profileId==="crust"){
      const spread=p.patch_spread??1;
      const marginDef=p.margin_definition??1;
      const context=p.context_thickness??1;
      const rough=p.surface_roughness??0;
      const cracking=p.cracking??0;
      const erosion=p.edge_erosion??0;
      setScale("hymenophore",spread,1,spread);
      setScale("context",spread,context,spread);
      const margin=this.objects.get("margin");
      if(margin){
        margin.scale.x*=spread;
        margin.scale.z*=spread;
        margin.scale.y*=Math.max(.35,marginDef);
        if(sid==="old")margin.rotation.z+=.025*erosion;
      }
      const hym=this.objects.get("hymenophore");
      if(hym?.material){
        if("roughness" in hym.material)hym.material.roughness=Math.min(1,.55+rough*.38);
        if(hym.material.color){
          const hsl={h:0,s:0,l:0};hym.material.color.getHSL(hsl);
          hym.material.color.setHSL(hsl.h,Math.max(.12,hsl.s*(1-cracking*.18)),Math.max(.18,hsl.l*(1-cracking*.22)));
        }
      }
    }

  }

  qaRaycastAnatomy(id){
    const target=this.objects.get(id);
    if(!target) return {pass:false,reason:"missing_object",expected:id,actual:null};

    const previousIsolation=this.isolated;
    this.isolated=id;
    this._applyVisibility();
    this.scene.updateMatrixWorld(true);
    this.camera.updateMatrixWorld(true);

    const box=new THREE.Box3().setFromObject(target);
    if(box.isEmpty()){
      this.isolated=previousIsolation;this._applyVisibility();
      return {pass:false,reason:"empty_bounds",expected:id,actual:null};
    }

    const center=box.getCenter(new THREE.Vector3());
    const ndc=center.clone().project(this.camera);
    this.raycaster.setFromCamera(new THREE.Vector2(ndc.x,ndc.y),this.camera);
    const hits=this.raycaster.intersectObject(this.root,true);
    let actual=null;
    for(const hit of hits){
      let cur=hit.object,visible=true;
      while(cur){if(cur.visible===false){visible=false;break;}cur=cur.parent;}
      if(!visible)continue;
      const meta=this._metaForObject(hit.object);
      if(meta?.id){actual=meta.id;break;}
    }

    this.isolated=previousIsolation;
    this._applyVisibility();
    return {pass:actual===id,reason:actual===id?"ok":"metadata_mismatch",expected:id,actual};
  }

  scientificValidationSnapshot(){
    if(this.currentProfile?.id!=="puffball")return null;
    const subtype=this.variants.puff_subtype||"true_puffball";
    const stage=this.morphologyState?.stage?.id||this.developmentalStageId||"mature";
    const objects=[...this.objects.keys()];
    const state=validateRenderedGasteroidState({subtype,stage,variants:this.variants,objects});
    const activeRationales={};
    const mappings={
      peridium:"peridium",exoperidium:"exoperidium",endoperidium:"endoperidium",gleba:"gleba",
      spore_mass:"spore_mass",sterile_base:"sterile_base",basal_attachment:"basal_attachment",
      apical_region:"apical_region",apical_pore:"apical_pore",rupture_margin:"rupture_margin",
      rupture_channel:"rupture_channel",worn_exoperidium:"worn_exoperidium",collapsed_wall:"collapsed_wall",
      earthstar_rays:"earthstar_rays",gasteroid_stalk:"gasteroid_stalk"
    };
    for(const [objectId,rationaleId] of Object.entries(mappings)){
      if(this.objects.has(objectId))activeRationales[objectId]=VISUAL_CHARACTER_RATIONALE[rationaleId]||null;
    }
    const surface=this.variants.puff_surface||"glabrous";
    activeRationales.surface=VISUAL_CHARACTER_RATIONALE[surface]||null;
    return {
      pass:state.pass,
      failures:state.failures,
      warnings:state.warnings,
      sheet:referenceSheet(subtype,stage),
      activeRationales,
      audits:{referenceSheets:REFERENCE_SHEET_AUDIT,visualCharacters:VISUAL_CHARACTER_AUDIT}
    };
  }

  qaSnapshot(){
    const box=new THREE.Box3().setFromObject(this.root);
    const frustum=new THREE.Frustum();
    const matrix=new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(matrix);
    let materialCount=0,geometryCount=0;
    this.root.traverse(n=>{
      if(n.geometry)geometryCount++;
      if(n.material)materialCount+=Array.isArray(n.material)?n.material.length:1;
    });
    return {
      profileId:this.currentProfile?.id||null,
      stageId:this.morphologyState?.stage?.id||null,
      mode:this.mode,
      objects:this.objects.size,
      rootChildren:this.root.children.length,
      geometryCount,
      materialCount,
      rendererGeometries:this.renderer.info.memory.geometries,
      rendererTextures:this.renderer.info.memory.textures,
      drawCalls:this.renderer.info.render.calls,
      profileBuildMs:Math.round(this._lastProfileBuildMs||0),
      startupTargetMs:this.realismTier?.targets?.startupMs||3000,
      startupMaximumMs:this.realismTier?.targets?.hardStartupMs||5000,
      realismTier:this.realismTier?.id||"atlas",
      realismBudget:PROFILE_REALISM_BUDGETS[this.currentProfile?.id]||null,
      complexity:this._lastComplexity,
      realismPerformance:performanceVerdict({
        fps:this.lastFps||0,
        buildMs:this._lastProfileBuildMs||0,
        complexity:this._lastComplexity
      },this.realismTier||REALISM_TIERS.atlas),
      puffOrnament:this.objects.get("exoperidium")?.userData?.ornamentStats||null,
      puffGeometryModel:this.currentProfile?.id==="puffball"?this.objects.get("peridium")?.geometry?.userData||null:null,
      objectIds:[...this.objects.keys()],
      puffPbrMaterials:this.currentProfile?.id==="puffball"?Object.keys(PUFF_PBR):[],
      glebaRenderingModel:this.currentProfile?.id==="puffball"?{
        volume:this.objects.get("gleba")?.geometry?.userData||null,
        microstructure:this.objects.get("gleba")?.userData?.renderingModel||null,
        sporeMass:this.objects.get("spore_mass")?.userData?.renderingModel||null
      }:null,
      developmentalIdentity:this.morphologyState?.developmental?.identityKey||null,
      agaricoidPhaseFour:this.currentProfile?.id==="agaricoid"?{
        stage:this.morphologyState?.stage?.id||null,
        stipePosition:this.variants.agaric_stipe_position||null,
        stipeForm:this.variants.agaric_stipe_form||null,
        stipeContext:this.variants.agaric_stipe_context||null,
        stipeSurfaceApex:this.variants.agaric_stipe_surface_apex||null,
        stipeSurfaceMid:this.variants.agaric_stipe_surface_mid||null,
        stipeSurfaceBase:this.variants.agaric_stipe_surface_base||null,
        stipeModel:this.objects.get("stipe")?.geometry?.userData?.model||null,
        developmentalParameters:this.morphologyState?.stage?.parameters||null,
        developmentalContinuity:true,
        ageTransformsInsteadOfSwaps:true
      }:null,
      agaricoidPhaseThree:this.currentProfile?.id==="agaricoid"?{
        generator:this.objects.get("pileipellis")?.userData?.generator||null,
        primary:this.variants.agaric_surface_primary||null,
        secondary:this.variants.agaric_surface_secondary||null,
        distribution:this.variants.agaric_surface_distribution||null,
        age:this.variants.agaric_surface_age||null,
        moisture:this.variants.agaric_surface_moisture||null,
        counts:this.objects.get("pileipellis")?.userData?.counts||null,
        mixedState:!!this.objects.get("pileipellis")?.userData?.mixedState,
        morphologicalDistribution:!!this.objects.get("pileipellis")?.userData?.morphologicalDistribution,
        transferableSurfaceEngine:!!this.objects.get("pileipellis")?.userData?.transferableSurfaceEngine,
        material:{
          roughness:this.objects.get("pileus")?.material?.roughness??null,
          clearcoat:this.objects.get("pileus")?.material?.clearcoat??null,
          clearcoatRoughness:this.objects.get("pileus")?.material?.clearcoatRoughness??null,
          sheen:this.objects.get("pileus")?.material?.sheen??null
        }
      }:null,
      agaricoidPhaseTwo:this.currentProfile?.id==="agaricoid"?{
        plateModel:this.objects.get("hymenophore")?.userData?.plateModel||null,
        attachment:this.variants.agaric_gill_attachment||null,
        spacing:this.variants.agaric_gill_spacing||null,
        fullGillCount:this.objects.get("hymenophore")?.userData?.fullGillCount||0,
        spacingDegrees:this.objects.get("hymenophore")?.userData?.spacingDegrees||null,
        thickness:this.variants.agaric_gill_thickness||null,
        depth:this.variants.agaric_gill_depth||null,
        lamellulae:this.variants.agaric_lamellulae||null,
        lamellulaCount:this.objects.get("hymenophore")?.userData?.lamellulaCount||0,
        edge:this.variants.agaric_gill_edge||null,
        attachmentGeometry:this.objects.get("hymenophore")?.userData?.attachmentGeometry||null
      }:null,
      agaricoidPhaseOne:this.currentProfile?.id==="agaricoid"?{
        pileusModel:this.objects.get("pileus")?.geometry?.userData?.model||null,
        pileusProfile:this.variants.agaric_pileus_profile||null,
        pileusCenter:this.variants.agaric_pileus_center||null,
        pileusMargin:this.variants.agaric_margin||null,
        capThickness:this.objects.get("pileus")?.geometry?.userData?.thickness||null,
        supportsGillInsertion:!!this.objects.get("pileus")?.geometry?.userData?.supportsGillInsertion,
        stipeModel:this.objects.get("stipe")?.geometry?.userData?.model||null,
        stipeTaper:this.variants.agaric_stipe_taper||null
      }:null,
      gasteroidSubtype:this.currentProfile?.id==="puffball"?(this.variants.puff_subtype||"true_puffball"):null,
      gasteroidSubtypeDefinition:this.currentProfile?.id==="puffball"?puffballSubtype(this.variants.puff_subtype||"true_puffball"):null,
      gasteroidArchitecture:this.currentProfile?.id==="puffball"?{
        earthstarRays:this.objects.get("earthstar_rays")?.children?.length||0,
        stalkVisible:!!this.objects.get("gasteroid_stalk")?.visible,
        sterileBaseVisible:!!this.objects.get("sterile_base")?.visible
      }:null,
      probeKnowledgeIds:[...new Set(this.pickables.map(o=>this._metaForObject(o)).filter(Boolean).map(meta=>meta.knowledgeId||meta.id).filter(Boolean))],
      developmentalParameters:this.currentProfile?.id==="puffball"?this.morphologyState?.stage?.parameters||null:null,
      scientificValidation:this.scientificValidationSnapshot(),
      fps:this.lastFps,
      frameIntersects:!box.isEmpty()&&frustum.intersectsBox(box),
      boxEmpty:box.isEmpty()
    };
  }

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
    if(this.originalTransforms.size===0)this._captureCurrentTransforms();
    this._restoreTransforms();
    this.exploded=!!enabled;
    if(!enabled){this.applyMode();return;}
    const offsets={
      pileus:[0,1.15,0],pileus_underside:[0,.95,0],pileus_context:[0,.65,0],hymenophore:[0,.22,0],
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

  setSection(enabled=true,axis="x"){
    this.sectioned=!!enabled;
    const normal=axis==="z"?new THREE.Vector3(0,0,1):axis==="y"?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0);
    const plane=new THREE.Plane(normal,0);
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
    this.isolated=null;this.hidden.clear();
    if(this.originalTransforms.size===0)this._captureCurrentTransforms();
    this._restoreTransforms();
    this.exploded=false;this.setSection(false);this.clearKnowledgeProxy?.();this.applyMode();this.frameModel({animate:true});
  }

  frameModel({animate=false}={}){
    const box=new THREE.Box3().setFromObject(this.root);
    if(box.isEmpty()) return false;
    const center=box.getCenter(new THREE.Vector3());
    const size=box.getSize(new THREE.Vector3());
    const radius=Math.max(size.x,size.y,size.z,1);
    const aspect=Math.max(.6,this.camera.aspect||1);
    const distance=(radius*2.4)/Math.tan(THREE.MathUtils.degToRad(this.camera.fov*.5));
    const adjusted=distance/Math.max(1,Math.sqrt(aspect));
    const endPos=center.clone().add(new THREE.Vector3(adjusted*.62,adjusted*.38,adjusted));
    if(animate){
      this.fly={start:performance.now(),duration:600,fromPos:this.camera.position.clone(),toPos:endPos,fromTarget:this.controls.target.clone(),toTarget:center};
    }else{
      this.camera.position.copy(endPos);
      this.controls.target.copy(center);
      this.camera.near=Math.max(.01,adjusted/100);
      this.camera.far=Math.max(100,adjusted*20);
      this.camera.updateProjectionMatrix();
      this.controls.update();
    }
    return true;
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

  flashStructure(id,duration=1200,{focus=true}={}){
    const obj=this.objects.get(id);
    if(!obj) return false;
    if(this._teachingFlashTimer){
      clearTimeout(this._teachingFlashTimer);
      this._teachingFlashTimer=null;
    }
    this._applyHoverHighlight(obj);
    if(focus) this.flyTo(id,480);
    this._teachingFlashTimer=setTimeout(()=>{
      this._clearHoverHighlight();
      this._teachingFlashTimer=null;
    },duration);
    return true;
  }

  _metaForObject(obj){
    let cur=obj;
    while(cur){
      if(cur.userData?.id || cur.userData?.label || cur.userData?.selectable) return cur.userData;
      cur=cur.parent;
    }
    return {};
  }

  _clearHoverHighlight(){
    for(const rec of this.hoveredMaterials){
      if(!rec.material) continue;
      if("emissive" in rec.material && rec.emissive!==null) rec.material.emissive.setHex(rec.emissive);
      if("emissiveIntensity" in rec.material && rec.emissiveIntensity!==null) rec.material.emissiveIntensity=rec.emissiveIntensity;
    }
    this.hoveredMaterials=[];
    this.hoveredObject=null;
  }

  _applyHoverHighlight(obj){
    if(this.hoveredObject===obj) return;
    this._clearHoverHighlight();
    if(!obj) return;
    this.hoveredObject=obj;
    const targets=[];
    obj.traverse?.(n=>{if(n.material)targets.push(n);});
    if(obj.material&&!targets.includes(obj))targets.push(obj);
    for(const n of targets){
      const mats=Array.isArray(n.material)?n.material:[n.material];
      for(const m of mats){
        if(!m)continue;
        const rec={
          material:m,
          emissive:("emissive" in m && m.emissive)?m.emissive.getHex():null,
          emissiveIntensity:("emissiveIntensity" in m)?m.emissiveIntensity:null
        };
        this.hoveredMaterials.push(rec);
        if("emissive" in m && m.emissive){
          m.emissive.setHex(0x66521f);
          if("emissiveIntensity" in m)m.emissiveIntensity=0.55;
        }
      }
    }
  }

  _describeHit(hit,e){
    if(!hit?.object) return null;
    const obj=hit.object;
    const meta={...this._metaForObject(obj)};
    const local=obj.worldToLocal(hit.point.clone());
    const box=obj.geometry ? new THREE.Box3().setFromBufferAttribute(obj.geometry.attributes.position) : null;
    const size=box ? box.getSize(new THREE.Vector3()) : new THREE.Vector3(1,1,1);
    const center=box ? box.getCenter(new THREE.Vector3()) : new THREE.Vector3();
    const nx=size.x?Math.abs((local.x-center.x)/(size.x*.5)):0;
    const ny=size.y?((local.y-box.min.y)/size.y):.5;
    const nz=size.z?Math.abs((local.z-center.z)/(size.z*.5)):0;
    const id=meta.id||"structure";
    let region="surface";
    let surface="visible surface";

    if(id==="pileus"){
      const radial=Math.min(1,Math.sqrt(nx*nx+nz*nz));
      region=radial>.78?"pileus margin":radial>.38?"mid-pileus":"central pileus / disc";
      if(hit.face?.normal){
        const n=hit.face.normal.clone().transformDirection(obj.matrixWorld);
        surface=n.y>.28?"upper pileus surface":n.y<-.28?"lower pileus surface":"pileus margin / side";
      }
    }else if(id==="stipe"){
      region=ny>.72?"upper stipe":ny<.28?"lower stipe":"mid-stipe";
      surface="stipe surface";
    }else if(id==="stipe_base"){
      region=ny>.58?"upper basal transition":ny<.25?"lowest basal region":"basal expansion";
      surface="stipe-base surface";
    }else if(meta.knowledgeId==="lamella"){
      const world=hit.point.clone();
      const r=Math.sqrt(world.x*world.x+world.z*world.z);
      const type=this.variants?.hymenophore||"";
      region=r<.48?"proximal lamella near stipe":r>1.03?"distal lamellar edge / cap margin":"mid-lamella";
      surface=meta.structureType==="lamellula"?"short-gill hymenial face":"lamellar hymenial face";
      if(type==="decurrent"&&r<.58)region="decurrent lamella running onto stipe";
      else if(type==="sinuate"&&r<.52)region="sinuate / notched gill attachment";
      else if(type==="free_gills"&&r<.55)region="free inner gill edge";
      else if(type==="adnexed"&&r<.52)region="adnexed narrow gill attachment";
      else if(type==="adnate"&&r<.52)region="adnate broad gill attachment";
    }else if(id==="hymenophore"){
      const profile=this.currentProfile?.id||"";
      const h=this.variants?.hymenophore||"";
      const world=hit.point.clone();
      const r=Math.sqrt(world.x*world.x+world.z*world.z);
      if(h.includes("gill")||["adnexed","adnate","sinuate","decurrent"].includes(h)||profile==="agaricoid"){
        region=r<.48?"proximal lamella near stipe":r>1.03?"distal lamellar edge / cap margin":"mid-lamella";
        surface="hymenial gill face";
      }else if(h==="teeth"||profile.includes("hydnoid")){
        region=ny<.25?"tooth / spine tip":ny>.72?"tooth / spine base":"mid-tooth / spine";
        surface="hydnoid hymenial surface";
      }else if(["boletoid","polyporoid","hoof_conk"].includes(profile)||h==="pores"){
        region="pore-bearing fertile surface";
        surface="poroid hymenophore";
      }else if(profile==="morel"){
        region="ridge / pit fertile region";
        surface="exposed hymenium";
      }else{
        region="fertile surface";
        surface="hymenophore";
      }
    }else if(id==="tube_layer"){
      region=ny<.28?"tube mouths / lower tube layer":ny>.72?"tube-context junction":"mid tube layer";
      surface="poroid tube tissue";
    }else if(id==="pileus_context"||id==="context"){
      region=ny>.65?"upper context":ny<.35?"lower context":"mid-context";
      surface="internal sterile tissue";
    }else if(id==="veil_structure"){
      region=this.variants?.veil?String(this.variants.veil).replaceAll("_"," "):"veil structure";
      surface="veil remnant";
    }else if(id==="fertile_head"){
      region=ny>.72?"upper fertile head":ny<.28?"lower fertile head":"mid fertile head";
      surface="morchelloid fertile surface";
    }else if(id==="peridium"){
      region=ny>.72?"upper peridium":ny<.28?"lower peridium":"lateral peridium";
      surface="outer peridial wall";
    }else if(id==="exoperidium"){
      if(meta.knowledgeId==="echinate")region="echinate exoperidial projection";
      else if(meta.knowledgeId==="verrucose")region="verrucose exoperidial wart";
      else if(meta.knowledgeId==="granular")region="granular exoperidial ornament";
      else if(meta.knowledgeId==="furfuraceous")region="furfuraceous exoperidial flake";
      else region="exoperidial surface";
      surface="outer exoperidial ornamentation";
    }else if(id==="worn_exoperidium"){
      region="abraded exoperidial patch";
      surface="weathered outer peridial surface";
    }else if(id==="rupture_margin"){
      region="peridial rupture margin";
      surface="edge of dehisced peridium";
    }else if(id==="rupture_channel"){
      region="ostiolar / rupture channel";
      surface="internal release pathway";
    }else if(id==="apical_pore"){
      region="ostiole / apical pore";
      surface="spore-release opening";
    }else if(id==="apical_region"){
      region="apical region";
      surface="upper peridial surface";
    }else if(id==="sterile_base"){
      region="sterile basal region / subgleba";
      surface="sterile supporting tissue";
    }else if(id==="basal_attachment"){
      region="basal attachment";
      surface="substrate-attachment zone";
    }else if(id==="spore_mass"){
      region="mature internal spore mass";
      surface="powdery glebal derivative";
    }else if(id==="earthstar_rays"){
      region="earthstar ray";
      surface="reflexed outer peridial tissue";
    }else if(id==="gasteroid_stalk"){
      region="gasteroid stalk";
      surface="sterile supporting stalk";
    }else if(id==="gleba"){
      region="internal glebal tissue";
      surface="spore-bearing internal tissue";
    }else if(id==="apothecium"){
      region=ny>.60?"cup rim / upper apothecium":"cup wall";
      surface="apothecial tissue";
    }else if(id==="branch_system"){
      region=ny>.72?"distal branch / tip region":ny<.3?"basal branch region":"mid-branch region";
      surface="clavarioid fertile surface";
    }else if(id==="lobes"){
      region="gelatinous lobe";
      surface="exposed fertile lobe surface";
    }else if(id==="substrate"){
      region="supporting substrate";
      surface="substrate surface";
    }else if(id==="margin"){
      region="advancing margin";
      surface="resupinate growing edge";
    }

    let normal=null;
    if(hit.face?.normal){
      normal=hit.face.normal.clone().transformDirection(obj.matrixWorld);
    }
    return {
      ...meta,
      region,surface,
      profileId:this.currentProfile?.id||null,
      profileLabel:this.currentProfile?.label||null,
      point:{x:hit.point.x,y:hit.point.y,z:hit.point.z},
      localPoint:{x:local.x,y:local.y,z:local.z},
      faceIndex:hit.faceIndex ?? null,
      distance:hit.distance,
      normal:normal?{x:normal.x,y:normal.y,z:normal.z}:null,
      screen:{clientX:e.clientX,clientY:e.clientY}
    };
  }
  _pick(e,select){
    const r=this.canvas.getBoundingClientRect();
    this.pointer.x=((e.clientX-r.left)/r.width)*2-1;
    this.pointer.y=-((e.clientY-r.top)/r.height)*2+1;
    this.raycaster.setFromCamera(this.pointer,this.camera);

    const hits=this.raycaster.intersectObject(this.root,true);
    const validHits=hits.filter(h=>{
      if(!h.object?.visible) return false;
      let cur=h.object;
      while(cur){
        if(cur.visible===false)return false;
        cur=cur.parent;
      }
      const meta=this._metaForObject(h.object);
      return !!(meta?.id || meta?.label || meta?.selectable);
    });

    let hit=validHits[0]||null;

    // From an underside view, the pileus shell can geometrically sit just in
    // front of the lamellae. Prefer the anatomically more specific fertile
    // structure when it lies immediately behind the lower pileus surface.
    if(hit){
      const firstMeta=this._metaForObject(hit.object);
      if(firstMeta?.id==="pileus"){
        let lowerSurface=false;
        if(hit.face?.normal){
          const n=hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
          lowerSurface=n.y<0.22;
        }
        if(lowerSurface){
          const maxDistance=hit.distance+0.32;
          const fertileHit=validHits.find(h=>{
            if(h.distance>maxDistance)return false;
            const meta=this._metaForObject(h.object);
            return meta?.knowledgeId==="lamella" || meta?.id==="hymenophore" || meta?.id==="tube_layer";
          });
          if(fertileHit)hit=fertileHit;
        }
      }
    }

    const detail=hit?this._describeHit(hit,e):null;
    this.canvas.style.cursor=detail?"crosshair":"grab";
    this._applyHoverHighlight(hit?.object||null);

    if(!select){
      this.lastHover=detail?.id||null;
      this.onHover?.(detail);
    }
    if(select && detail){
      this.onSelect?.(detail);
      this.focus(detail.id);
    }
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
    this.controls.update();
    updateDistanceLod(this,this.lodRecord);
    this.renderer.render(this.scene,this.camera);
    this.frames++; const now=performance.now();
    if(now-this.fpsStart>=1000){
      const fps=Math.round(this.frames*1000/(now-this.fpsStart)); this.lastFps=fps;
      this._lastComplexity=rendererComplexity(this.renderer,this.scene);
      const adaptive=chooseAdaptiveTier(this.realismTier,{fps,drawCalls:this._lastComplexity.drawCalls,triangles:this._lastComplexity.triangles});
      if(adaptive.id!==this.realismTier.id&&!this._adaptiveTierApplied){
        this.realismTier=adaptive;this._adaptiveTierApplied=true;
        configureRendererForRealism(this.renderer,this.realismTier);
        if(this.lodRecord)this.lodRecord.distance=this.realismTier.farLodDistance;
      }
      this.onStats?.({fps,objects:this.objects.size,drawCalls:this.renderer.info.render.calls,triangles:this._lastComplexity.triangles,quality:this.realismTier.id});
      this.frames=0; this.fpsStart=now;
    }
    requestAnimationFrame(()=>this._animate());
  }

  dispose(){
    this.running=false; if(this._teachingFlashTimer)clearTimeout(this._teachingFlashTimer); this.cleanupModel(); this.resizeObserver?.disconnect();
    this.canvas.removeEventListener("pointermove",this._pointerMove); this.canvas.removeEventListener("pointerleave",this._pointerLeave); this.canvas.removeEventListener("click",this._pointerClick);
    this.controls.dispose(); this.renderer.dispose();
  }

  _agaricProfileHeight(profile,r){
    const x=THREE.MathUtils.clamp(r,0,1);
    switch(profile){
      case "conical": return .88*(1-x);
      case "campanulate": return .92*Math.pow(1-x,1.62)+.06*(1-x*x);
      case "convex": return .50*(1-x*x);
      case "plano_convex": return .28*(1-x*x)+.035*(1-x);
      case "flat": return .075*(1-x*x);
      case "depressed": return .22*(1-x*x)-.28*Math.exp(-Math.pow(x/.36,2));
      case "infundibuliform": return .03+.34*x-.48*Math.pow(1-x,2);
      case "umbilicate": return .20*(1-x*x)-.22*Math.exp(-Math.pow(x/.17,2));
      case "umbonate": return .24*(1-x*x)+.31*Math.exp(-Math.pow(x/.24,2));
      case "ovate": return .78*Math.pow(Math.max(0,1-x*x),.66);
      default:return .50*(1-x*x);
    }
  }

  _agaricCenterOffset(center,r){
    const x=THREE.MathUtils.clamp(r,0,1);
    if(center==="depressed") return -.18*Math.exp(-Math.pow(x/.24,2));
    if(center==="papillate") return .30*Math.exp(-Math.pow(x/.095,2));
    if(center==="umbonate") return .27*Math.exp(-Math.pow(x/.23,2));
    return 0;
  }

  _agaricMarginState(margin,r,theta){
    const x=THREE.MathUtils.clamp(r,0,1);
    const edge=THREE.MathUtils.smoothstep(x,.72,1);
    let y=0,radial=1,thicknessBoost=0;

    if(margin==="incurved"){y-=.060*edge;radial-=.018*edge;thicknessBoost+=.014*edge;}
    else if(margin==="decurved") y-=.050*edge;
    else if(margin==="uplifted"){y+=.070*edge;radial+=.010*edge;}
    else if(margin==="inrolled"){y-=.105*edge;radial-=.040*edge;thicknessBoost+=.030*edge;}
    else if(margin==="undulate") y+=.040*Math.sin(theta*6+.45)*edge;
    else if(margin==="lobed") radial+=.030*Math.sin(theta*5+.30)*edge;
    else if(margin==="split_cracked"){
      const crackWave=Math.pow(Math.max(0,Math.cos(theta*6.0)),18);
      radial-=.030*crackWave*edge;
      y-=.024*crackWave*edge;
    }else if(margin==="striate"){
      radial+=.006*Math.sin(theta*28)*edge;
      y+=.006*Math.sin(theta*28)*edge;
    }else if(margin==="appendiculate"){
      y-=.018*edge;
      thicknessBoost+=.008*edge;
    }

    return {
      y:THREE.MathUtils.clamp(y,-.13,.10),
      radial:THREE.MathUtils.clamp(radial,.90,1.08),
      thicknessBoost:THREE.MathUtils.clamp(thicknessBoost,0,.045)
    };
  }

  _agaricoidPileusGeometry({
    profile="convex",center="even",margin="decurved",radius=1.62,
    segments=96,rings=42,seed=421
  }={}){
    segments=scaledSegments(segments,this.realismTier,{min:56,max:132});
    rings=scaledSegments(rings,this.realismTier,{min:30,max:58});
    const phase=((seed%7919)/7919)*Math.PI*2;

    const marginY=(t,theta)=>{
      const edge=THREE.MathUtils.smoothstep(t,.72,1);
      if(margin==="incurved")return -.055*edge;
      if(margin==="decurved")return -.050*edge;
      if(margin==="uplifted")return .065*edge;
      if(margin==="inrolled")return -.100*edge;
      if(margin==="undulate")return .035*Math.sin(theta*6+.45)*edge;
      if(margin==="split_cracked"){
        const crack=Math.pow(Math.max(0,Math.cos(theta*6)),18);
        return -.020*crack*edge;
      }
      if(margin==="striate")return .005*Math.sin(theta*28)*edge;
      if(margin==="appendiculate")return -.016*edge;
      return 0;
    };

    const radialFactor=(t,theta)=>{
      const edge=THREE.MathUtils.smoothstep(t,.72,1);
      let factor=1;
      if(margin==="incurved")factor-=.012*edge;
      else if(margin==="inrolled")factor-=.030*edge;
      else if(margin==="uplifted")factor+=.008*edge;
      else if(margin==="lobed")factor+=.026*Math.sin(theta*5+.30)*edge;
      else if(margin==="split_cracked"){
        const crack=Math.pow(Math.max(0,Math.cos(theta*6)),18);
        factor-=.024*crack*edge;
      }else if(margin==="striate")factor+=.004*Math.sin(theta*28)*edge;
      return THREE.MathUtils.clamp(factor,.91,1.07);
    };

    const topHeightAt=(t,theta=0)=>{
      const x=THREE.MathUtils.clamp(t,0,1);
      return this._agaricProfileHeight(profile,x)+
        this._agaricCenterOffset(center,x)+
        marginY(x,theta)+
        (.004*Math.sin(theta*3.11+phase)+.003*Math.cos(theta*7.4-phase))*Math.pow(x,1.22);
    };

    const thicknessAt=(t)=>{
      const x=THREE.MathUtils.clamp(t,0,1);
      const edge=THREE.MathUtils.smoothstep(x,.72,1);
      let thickness=THREE.MathUtils.lerp(.245,.082,Math.pow(x,.88));
      if(margin==="inrolled")thickness+=.028*edge;
      if(margin==="incurved")thickness+=.012*edge;
      if(margin==="appendiculate")thickness+=.008*edge;
      return THREE.MathUtils.clamp(thickness,.070,.300);
    };

    const profilePts=[];
    for(let i=0;i<=rings;i++){
      const t=i/rings;
      profilePts.push(new THREE.Vector2(radius*t,topHeightAt(t,0)));
    }
    for(let i=rings;i>=0;i--){
      const t=i/rings;
      profilePts.push(new THREE.Vector2(radius*t,topHeightAt(t,0)-thicknessAt(t)));
    }

    const g=new THREE.LatheGeometry(profilePts,segments);
    const pos=g.attributes.position;

    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
      const planar=Math.hypot(x,z);
      if(planar<1e-6)continue;
      const theta=Math.atan2(z,x);
      const t=THREE.MathUtils.clamp(planar/radius,0,1);
      const f=radialFactor(t,theta);
      const baseMargin=marginY(t,0);
      const localMargin=marginY(t,theta);
      pos.setXYZ(i,x*f,y+(localMargin-baseMargin),z*f);
    }
    pos.needsUpdate=true;
    g.computeVertexNormals();
    g.computeBoundingBox();
    g.computeBoundingSphere();

    g.userData={
      model:"agaricoid-recovery-pileus-v3",profile,center,margin,radius,
      thickness:{disc:.245,margin:.082},
      supportsGillInsertion:true,
      recoveryContract:"closed LatheGeometry cap with bounded margin deformation"
    };

    const effectiveRadius=(r,theta=0)=>{
      const rr=THREE.MathUtils.clamp(r,0,radius);
      const t=rr/radius;
      return rr*radialFactor(t,theta);
    };
    g.userData.topPoint=(r,theta=0)=>{
      const rr=THREE.MathUtils.clamp(r,0,radius);
      const er=effectiveRadius(rr,theta);
      return new THREE.Vector3(Math.cos(theta)*er,topHeightAt(rr/radius,theta),Math.sin(theta)*er);
    };
    g.userData.topHeight=(r,theta=0)=>g.userData.topPoint(r,theta).y;
    g.userData.undersidePoint=(r,theta=0)=>{
      const rr=THREE.MathUtils.clamp(r,0,radius);
      const er=effectiveRadius(rr,theta);
      const t=rr/radius;
      return new THREE.Vector3(Math.cos(theta)*er,topHeightAt(t,theta)-thicknessAt(t),Math.sin(theta)*er);
    };
    g.userData.undersideHeight=(r,theta=0)=>g.userData.undersidePoint(r,theta).y;
    return g;
  }

  _agaricoidPileusTopGeometry({
    profile="convex",center="even",margin="decurved",radius=1.62,
    segments=96,rings=42,seed=421
  }={}){
    segments=scaledSegments(segments,this.realismTier,{min:56,max:132});
    rings=scaledSegments(rings,this.realismTier,{min:30,max:58});
    const verts=[],uvs=[],indices=[],row=segments+1;
    const phase=((seed%7919)/7919)*Math.PI*2;
    const sample=(rr,theta)=>{
      const x=THREE.MathUtils.clamp(rr,0,1);
      const m=this._agaricMarginState(margin,x,theta);
      const radial=radius*x*m.radial*(1+.007*Math.sin(theta*2.17+phase)*(.25+.75*x));
      const y=this._agaricProfileHeight(profile,x)+this._agaricCenterOffset(center,x)+m.y+
        .003*Math.sin(theta*3.11+phase)*Math.pow(x,1.2);
      return new THREE.Vector3(Math.cos(theta)*radial,y,Math.sin(theta)*radial);
    };
    for(let ir=0;ir<=rings;ir++){
      const rr=ir/rings;
      for(let it=0;it<=segments;it++){
        const u=it/segments,p=sample(rr,u*Math.PI*2);
        verts.push(p.x,p.y,p.z);uvs.push(u,rr);
      }
    }
    for(let ir=0;ir<rings;ir++){
      for(let it=0;it<segments;it++){
        const a=ir*row+it,b=a+1,c=(ir+1)*row+it,d=c+1;
        indices.push(a,b,c,b,d,c);
      }
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));
    g.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
    g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
    g.userData={model:"agaricoid-visible-top-v4",profile,center,margin,radius};
    g.userData.topPoint=(r,theta=0)=>sample(THREE.MathUtils.clamp(r/radius,0,1),theta);
    g.userData.topHeight=(r,theta=0)=>g.userData.topPoint(r,theta).y;
    return g;
  }

  _agaricoidPileusUnderGeometry({
    profile="convex",center="even",margin="decurved",radius=1.62,
    segments=96,rings=42,seed=421
  }={}){
    segments=scaledSegments(segments,this.realismTier,{min:56,max:132});
    rings=scaledSegments(rings,this.realismTier,{min:30,max:58});
    const verts=[],uvs=[],indices=[],row=segments+1;
    const phase=((seed%7919)/7919)*Math.PI*2;
    const sample=(rr,theta)=>{
      const x=THREE.MathUtils.clamp(rr,0,1);
      const m=this._agaricMarginState(margin,x,theta);
      const radial=radius*x*m.radial*(1+.007*Math.sin(theta*2.17+phase)*(.25+.75*x));
      const top=this._agaricProfileHeight(profile,x)+this._agaricCenterOffset(center,x)+m.y;
      const thickness=THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(.245,.080,Math.pow(x,.88))+m.thicknessBoost,.068,.300
      );
      return new THREE.Vector3(Math.cos(theta)*radial,top-thickness,Math.sin(theta)*radial);
    };
    for(let ir=0;ir<=rings;ir++){
      const rr=ir/rings;
      for(let it=0;it<=segments;it++){
        const u=it/segments,p=sample(rr,u*Math.PI*2);
        verts.push(p.x,p.y,p.z);uvs.push(u,rr);
      }
    }
    for(let ir=0;ir<rings;ir++){
      for(let it=0;it<segments;it++){
        const a=ir*row+it,b=a+1,c=(ir+1)*row+it,d=c+1;
        indices.push(a,c,b,b,c,d);
      }
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));
    g.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
    g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
    g.userData={model:"agaricoid-visible-under-v4",profile,center,margin,radius};
    g.userData.undersidePoint=(r,theta=0)=>sample(THREE.MathUtils.clamp(r/radius,0,1),theta);
    g.userData.undersideHeight=(r,theta=0)=>g.userData.undersidePoint(r,theta).y;
    return g;
  }

  _agaricoidStipeGeometry(form="equal",{height=2.55,top=.285,bottom=.34,seed=727,development={}}={}){
    const segments=scaledSegments(56,this.realismTier,{min:34,max:76});
    const rings=scaledSegments(34,this.realismTier,{min:22,max:48});
    const verts=[],uvs=[],indices=[];
    const phase=((seed%6151)/6151)*Math.PI*2;
    const row=segments+1;
    const waterLoss=development.water_loss??0;
    const aging=development.stipe_aging??0;
    const collapse=development.collapse??0;
    const deformation=development.deformation??0;
    const radiusAt=t=>{
      let r=THREE.MathUtils.lerp(bottom,top,t);
      if(form==="tapering")r*=1.14-.28*t;
      else if(form==="clavate")r*=.84+.48*Math.pow(1-t,2.15);
      else if(form==="ventricose")r*=.88+.34*Math.exp(-Math.pow((t-.50)/.22,2));
      else if(form==="bulbous_base")r*=.88+.66*Math.exp(-Math.pow((t-.07)/.13,2));
      else if(form==="rooting"){
        r*=.76+.28*THREE.MathUtils.smoothstep(t,.05,.34);
        if(t<.17)r*=.48+.52*(t/.17);
      }
      r*=1-waterLoss*(.045+.035*t);
      return Math.max(.06,r);
    };

    for(let iy=0;iy<=rings;iy++){
      const t=iy/rings;
      const y=-height/2+t*height;
      const ageLean=(.030+.055*collapse+.040*deformation)*Math.sin(t*Math.PI);
      const leanX=(.030+ageLean)*Math.sin(phase)*Math.sin(t*Math.PI);
      const leanZ=(.024+ageLean*.75)*Math.cos(phase*.83)*Math.sin(t*Math.PI);
      const r0=radiusAt(t);
      for(let ix=0;ix<=segments;ix++){
        const u=ix/segments,theta=u*Math.PI*2;
        const asymmetric=1+
          .020*Math.sin(theta*3+phase+t*4.3)+
          .010*Math.cos(theta*7-phase*.6)+
          aging*.009*Math.sin(theta*2.2+t*9.0);
        const r=r0*asymmetric;
        const wrinkle=aging*.010*Math.sin(t*18+theta*2.4);
        verts.push(
          Math.cos(theta)*(r+wrinkle)+leanX,
          y-.045*collapse*Math.pow(Math.max(0,t-.55)/.45,2)+.008*Math.sin(theta*2.2+phase)*Math.sin(t*Math.PI),
          Math.sin(theta)*(r+wrinkle)+leanZ
        );
        uvs.push(u,t);
      }
    }
    for(let iy=0;iy<rings;iy++){
      for(let ix=0;ix<segments;ix++){
        const a=iy*row+ix,b=a+1,c=(iy+1)*row+ix,d=c+1;
        indices.push(a,c,b,b,c,d);
      }
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));
    g.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));
    g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();
    g.userData={model:"agaricoid-organic-stipe-v2",form,height,top,bottom,waterLoss,aging,collapse};
    return g;
  }

  _agaricStipeSurfaceRegion(stipe,region,state,{height,top,bottom,development={}}={}){
    if(!stipe||state==="smooth")return null;
    const group=new THREE.Group();
    const id=region==="apex"?"stipe_apex":region==="mid"?"stipe_mid":"stipe_base_surface";
    group.userData={id,label:region==="apex"?"Stipe apex surface":region==="mid"?"Mid-stipe surface":"Stipe base surface",category:"macro",selectable:true,knowledgeId:region==="apex"?"stipe_apex":region==="mid"?"stipe_mid":"stipe_base",surfaceState:state};
    const bounds=region==="apex"?[.72,.98]:region==="mid"?[.30,.72]:[.04,.30];
    const seedBase=region==="apex"?8301:region==="mid"?8419:8537;
    const rng=seededRng(seedBase+state.length*37);
    const aging=development.stipe_aging??0;
    const waterLoss=development.water_loss??0;
    const retain=Math.max(.18,1-aging*(state==="pruinose"?.82:.48));

    const radiusAt=t=>{
      let r=THREE.MathUtils.lerp(bottom,top,t);
      const form=this.variants.agaric_stipe_form||this.variants.agaric_stipe_taper||"equal";
      if(form==="tapering")r*=1.14-.28*t;
      else if(form==="clavate")r*=.84+.48*Math.pow(1-t,2.15);
      else if(form==="ventricose")r*=.88+.34*Math.exp(-Math.pow((t-.50)/.22,2));
      else if(form==="bulbous_base")r*=.88+.66*Math.exp(-Math.pow((t-.07)/.13,2));
      else if(form==="rooting")r*=.76+.28*THREE.MathUtils.smoothstep(t,.05,.34);
      return r*(1-waterLoss*(.045+.035*t));
    };

    if(state==="longitudinal_striate"||state==="reticulate"){
      const mat=new THREE.LineBasicMaterial({color:0x8d7964,transparent:true,opacity:state==="reticulate"?.62:.42});
      const longitudinal=state==="reticulate"?14:22;
      for(let i=0;i<longitudinal;i++){
        const a=i/longitudinal*Math.PI*2,pts=[];
        for(let j=0;j<=10;j++){
          const t=THREE.MathUtils.lerp(bounds[0],bounds[1],j/10);
          const r=radiusAt(t)*1.018;
          pts.push(new THREE.Vector3(Math.cos(a)*r,-height/2+t*height,Math.sin(a)*r));
        }
        const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat.clone());
        line.userData=group.userData;group.add(line);this.pickables.push(line);
      }
      if(state==="reticulate"){
        for(let j=1;j<6;j++){
          const t=THREE.MathUtils.lerp(bounds[0],bounds[1],j/6);
          const r=radiusAt(t)*1.020,pts=[];
          for(let i=0;i<=28;i++){
            const a=i/28*Math.PI*2;
            pts.push(new THREE.Vector3(Math.cos(a)*r,-height/2+t*height,Math.sin(a)*r));
          }
          const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat.clone());
          line.userData={...group.userData,knowledgeId:"reticulation"};group.add(line);this.pickables.push(line);
        }
      }
    }else{
      const baseCount={fibrillose:120,floccose:74,scaly:62,pruinose:210}[state]||90;
      const count=Math.max(8,Math.round(baseCount*retain*(this.realismTier.id==="interactive"?.72:this.realismTier.id==="high"?1.30:1)));
      const geo=state==="scaly"
        ? new THREE.ConeGeometry(.020,.055,6)
        : state==="floccose"
          ? new THREE.IcosahedronGeometry(.018,0)
          : state==="pruinose"
            ? new THREE.IcosahedronGeometry(.006,0)
            : new THREE.BoxGeometry(.045,.008,.006);
      const mat=MATERIALS.flesh.clone();
      mat.color.setHex(state==="pruinose"?0xd8d0bf:state==="scaly"?0x9a8068:0xb6a58f);
      mat.roughness=state==="pruinose"?1:.92;
      const inst=new THREE.InstancedMesh(geo,mat,count);
      inst.userData={...group.userData,knowledgeId:state==="pruinose"?"pruina":group.userData.knowledgeId};
      const dummy=new THREE.Object3D();
      for(let i=0;i<count;i++){
        const t=THREE.MathUtils.lerp(bounds[0],bounds[1],rng());
        const a=rng()*Math.PI*2;
        const r=radiusAt(t)*1.025;
        dummy.position.set(Math.cos(a)*r,-height/2+t*height,Math.sin(a)*r);
        dummy.rotation.set(0,-a,state==="fibrillose"?(rng()-.5)*.22:0);
        const g=.55+rng()*.9;
        if(state==="fibrillose")dummy.scale.set(g,1.1+rng()*.8,g);
        else if(state==="pruinose")dummy.scale.setScalar(.65+rng()*.8);
        else dummy.scale.set(g,g*(.65+rng()*.55),g);
        dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate=true;inst.castShadow=false;inst.receiveShadow=true;
      group.add(inst);this.pickables.push(inst);
    }
    stipe.add(group);this.objects.set(id,group);
    return group;
  }

  _agaricStipeContextVisual(stipe,context,{height,top,bottom}={}){
    if(!stipe)return null;
    const group=new THREE.Group();
    group.userData={id:"stipe_context",label:"Stipe context",category:"internal",selectable:true,knowledgeId:"stipe_context",contextState:context};
    if(context==="hollow"){
      const inner=new THREE.Mesh(
        new THREE.CylinderGeometry(top*.52,bottom*.52,height*.92,scaledSegments(28,this.realismTier,{min:18,max:38}),8,true),
        new THREE.MeshStandardMaterial({color:0x4e4135,roughness:.96,side:THREE.DoubleSide})
      );
      inner.userData=group.userData;group.add(inner);this.pickables.push(inner);
    }else if(context==="stuffed"){
      const count=this.realismTier.id==="high"?150:this.realismTier.id==="interactive"?60:100;
      const geo=new THREE.IcosahedronGeometry(.018,0);
      const mat=MATERIALS.flesh.clone();mat.roughness=.98;
      const inst=new THREE.InstancedMesh(geo,mat,count);
      inst.userData=group.userData;
      const rng=seededRng(9001),dummy=new THREE.Object3D();
      for(let i=0;i<count;i++){
        const t=.05+rng()*.90,a=rng()*Math.PI*2,r=Math.sqrt(rng())*THREE.MathUtils.lerp(bottom*.35,top*.35,t);
        dummy.position.set(Math.cos(a)*r,-height/2+t*height,Math.sin(a)*r);
        dummy.scale.setScalar(.6+rng()*.8);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate=true;group.add(inst);this.pickables.push(inst);
    }
    group.visible=context!=="solid";
    stipe.add(group);this.objects.set("stipe_context",group);
    return group;
  }


  _addAgaricoidStipe(form,{baseY=-.47,topY=2.28,top=.285,bottom=.34,position="central"}={}){
    const development=this.morphologyState?.stage?.parameters||{};
    const rootingExtra=form==="rooting"?.58:0;
    const height=Math.max(.8,topY-baseY+rootingExtra);
    const centerY=baseY-rootingExtra+height/2;
    const geo=this._agaricoidStipeGeometry(form,{height,top,bottom,seed:this.morphologyState?.developmental?.identitySeed||727,development});
    const st=this.register(new THREE.Mesh(geo,MATERIALS.stipe.clone()),"stipe","Stipe","macro");
    const offsetX=position==="eccentric"?.22:0;
    st.position.set(offsetX,centerY,0);
    st.userData.apexY=topY;
    st.userData.baseY=baseY-rootingExtra;
    st.userData.form=form;
    st.userData.positionType=position;

    const baseRadius=form==="bulbous_base"?.54:form==="clavate"?.43:form==="rooting"?.18:bottom;
    const baseGeo=form==="rooting"
      ? new THREE.ConeGeometry(baseRadius,.70,scaledSegments(36,this.realismTier,{min:24,max:48}))
      : new THREE.SphereGeometry(baseRadius,scaledSegments(40,this.realismTier,{min:26,max:56}),scaledSegments(22,this.realismTier,{min:16,max:30}));
    const base=this.register(new THREE.Mesh(baseGeo,MATERIALS.stipe.clone()),"stipe_base",
      form==="rooting"?"Rooting base":form==="bulbous_base"?"Bulbous base":"Stipe base","macro","stipe");
    if(form==="rooting"){
      base.position.set(offsetX,baseY-rootingExtra-.23,0);base.rotation.x=Math.PI;base.scale.set(.72,1,.72);
    }else{
      base.position.set(offsetX,baseY+.02,0);
      base.scale.set(1,form==="bulbous_base"?.66:form==="clavate"?.48:.34,1);
    }

    const context=this.variants.agaric_stipe_context||"solid";
    this._agaricStipeContextVisual(st,context,{height,top,bottom});
    this._agaricStipeSurfaceRegion(st,"apex",this.variants.agaric_stipe_surface_apex||"smooth",{height,top,bottom,development});
    this._agaricStipeSurfaceRegion(st,"mid",this.variants.agaric_stipe_surface_mid||"smooth",{height,top,bottom,development});
    this._agaricStipeSurfaceRegion(st,"base",this.variants.agaric_stipe_surface_base||"smooth",{height,top,bottom,development});
    return st;
  }


  _agaricSurfaceState(){
    const p=this.morphologyState?.stage?.parameters||{};
    return {
      primary:this.variants.agaric_surface_primary||"smooth",
      secondary:this.variants.agaric_surface_secondary||"none",
      distribution:this.variants.agaric_surface_distribution||"uniform",
      age:this.variants.agaric_surface_age||"fresh",
      moisture:this.variants.agaric_surface_moisture||"dry",
      realism:this.variants.texture_realism||"atlas",
      developmentalWeathering:p.surface_weathering??p.surface_wear??0,
      developmentalScaleLoss:p.scale_loss??0,
      developmentalCracking:p.surface_cracking??0,
      developmentalWaterLoss:p.water_loss??0
    };
  }

  _agaricSurfaceMask(rn,theta,state){
    let distribution=1;
    if(state.distribution==="disc_emphasized")distribution=Math.pow(1-rn,.72);
    else if(state.distribution==="margin_emphasized")distribution=Math.pow(rn,1.35);
    else if(state.distribution==="radial")distribution=.56+.44*Math.abs(Math.sin(theta*7.0+.35));
    else if(state.distribution==="concentric")distribution=.54+.46*Math.abs(Math.sin(rn*Math.PI*7.5));
    else if(state.distribution==="irregular_patches")distribution=.45+.55*(.5+.5*Math.sin(theta*3.1+rn*11.3)*Math.cos(theta*1.7-rn*7.1));
    else if(state.distribution==="aging_from_disc")distribution=.32+.68*(1-rn);
    else if(state.distribution==="aging_from_margin")distribution=.32+.68*rn;
    const ageBase={fresh:0,slightly_weathered:.18,weathered:.46,old_broken:.76}[state.age]??0;
    let weather=THREE.MathUtils.clamp(ageBase+(state.developmentalWeathering||0)*.72,0,1);
    if(state.distribution==="aging_from_disc")weather*=1.18-rn*.72;
    else if(state.distribution==="aging_from_margin")weather*=.45+rn*.85;
    else weather*=.82+.18*Math.sin(theta*2.4+rn*8.2)**2;

    return {
      distribution:THREE.MathUtils.clamp(distribution,0,1),
      weather:THREE.MathUtils.clamp(weather,0,1),
      retain:THREE.MathUtils.clamp(1-weather*.72-(state.developmentalScaleLoss||0)*.38,0.08,1),
      disc:THREE.MathUtils.clamp(1-rn/.48,0,1),
      margin:THREE.MathUtils.smoothstep(rn,.62,1)
    };
  }

  _agaricSurfacePoint(capState,r,theta,offset=.010){
    const p=capState?.topPoint?capState.topPoint(r,theta):new THREE.Vector3(Math.cos(theta)*r,2.5,Math.sin(theta)*r);
    const dr=.012;
    const pa=capState?.topPoint?capState.topPoint(Math.max(0,r-dr),theta):p.clone();
    const pb=capState?.topPoint?capState.topPoint(Math.min(capState.radius,r+dr),theta):p.clone();
    const pc=capState?.topPoint?capState.topPoint(r,theta+.012):p.clone();
    const radial=pb.clone().sub(pa);
    const circum=pc.clone().sub(p);
    const normal=circum.clone().cross(radial).normalize();
    if(normal.y<0)normal.multiplyScalar(-1);
    return {point:p.clone().addScaledVector(normal,offset),normal};
  }

  _agaricApplySurfaceFinish(cap,state){
    const mat=cap?.material;
    if(!mat)return;
    mat.side=THREE.DoubleSide;
    mat.transparent=false;mat.opacity=1;mat.depthWrite=true;
    mat.color?.setHex?.(0x9a5d36);
    const f={
      dry:[.94,.015,.92],subviscid:[.66,.22,.42],viscid:[.38,.48,.23],
      glutinous:[.24,.70,.14],waxy:[.50,.30,.34]
    }[state.moisture]||[.86,.04,.75];
    if("roughness" in mat)mat.roughness=f[0];
    if("clearcoat" in mat)mat.clearcoat=f[1];
    if("clearcoatRoughness" in mat)mat.clearcoatRoughness=f[2];
    if(state.primary==="waxy"){mat.roughness=.46;if("clearcoat" in mat)mat.clearcoat=.32;}
    if(state.primary==="viscid"){mat.roughness=.34;if("clearcoat" in mat)mat.clearcoat=.52;}
    if(state.primary==="glutinous"){mat.roughness=.22;if("clearcoat" in mat)mat.clearcoat=.72;}
    if(["velvety","tomentose"].includes(state.primary)){mat.roughness=.98;if("clearcoat" in mat)mat.clearcoat=0;}
    mat.needsUpdate=true;
  }

  _agaricAddFibrils(group,capState,state,{appressed=false,silky=false,secondary=false}={}){
    const base={simplified:90,atlas:220,high:430}[state.realism]||220;
    const count=Math.round(base*(silky?1.25:1)*(secondary?.62:1));
    const geo=new THREE.BoxGeometry(silky?.075:.095,appressed?.004:.008,silky?.006:.010);
    const mat=MATERIALS.flesh.clone();
    mat.color.setHex(silky?0xcaa98b:0x76513d);
    mat.roughness=silky?.62:.90;mat.transparent=true;mat.opacity=silky?.42:.58;
    const inst=new THREE.InstancedMesh(geo,mat,count);
    inst.userData={id:"surface_fibrils",label:silky?"Silky surface fibrils":"Pileus surface fibrils",category:"macro",selectable:true,knowledgeId:"surface_fibrils"};
    const rng=seededRng(2217+count+(secondary?137:0));
    const dummy=new THREE.Object3D();
    let written=0;
    for(let i=0;i<count*5&&written<count;i++){
      const rn=.08+rng()*.88,theta=rng()*Math.PI*2;
      const mask=this._agaricSurfaceMask(rn,theta,state);
      if(rng()>mask.distribution*mask.retain)continue;
      const r=capState.radius*rn;
      const surf=this._agaricSurfacePoint(capState,r,theta,appressed?.006:.010);
      dummy.position.copy(surf.point);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),surf.normal);
      dummy.rotateY(-theta+(rng()-.5)*(silky?.18:.34));
      const len=(silky?.65:1)*(.65+rng()*.8)*(1-mask.weather*.28);
      dummy.scale.set(len,1,.75+rng()*.5);
      dummy.updateMatrix();inst.setMatrixAt(written++,dummy.matrix);
    }
    inst.count=written;inst.instanceMatrix.needsUpdate=true;inst.castShadow=false;inst.receiveShadow=true;
    group.add(inst);this.pickables.push(inst);return written;
  }

  _agaricAddScales(group,capState,state,{shaggy=false,discOnly=false,secondary=false}={}){
    const base={simplified:55,atlas:135,high:270}[state.realism]||135;
    const count=Math.round(base*(shaggy?.72:1)*(secondary?.72:1));
    const geo=shaggy?new THREE.ConeGeometry(.055,.10,6):new THREE.ConeGeometry(.060,.025,7);
    const mat=MATERIALS.cap2.clone();mat.roughness=.96;
    const inst=new THREE.InstancedMesh(geo,mat,count);
    inst.userData={id:"pileus_scales",label:shaggy?"Shaggy pileus scales":"Pileus squamules",category:"macro",selectable:true,knowledgeId:"pileus_scales"};
    const rng=seededRng(3181+count+(discOnly?71:0));
    const dummy=new THREE.Object3D();
    let written=0;
    for(let i=0;i<count*6&&written<count;i++){
      const rn=.04+rng()*.93,theta=rng()*Math.PI*2;
      const mask=this._agaricSurfaceMask(rn,theta,state);
      let probability=mask.distribution*mask.retain;
      if(discOnly)probability*=Math.pow(mask.disc,1.2);
      if(rng()>probability)continue;
      const surf=this._agaricSurfacePoint(capState,capState.radius*rn,theta,shaggy?.022:.010);
      dummy.position.copy(surf.point);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),surf.normal);
      dummy.rotateY(rng()*Math.PI*2);
      if(shaggy)dummy.rotateX((.18+rng()*.38)*(1-mask.weather*.30));
      const g=(.58+rng()*.92)*(1-mask.weather*.25);
      dummy.scale.set(g,g*(shaggy?.85:.48),g*(.78+rng()*.35));
      dummy.updateMatrix();inst.setMatrixAt(written++,dummy.matrix);
    }
    inst.count=written;inst.instanceMatrix.needsUpdate=true;inst.castShadow=this.realismTier.id==="high";inst.receiveShadow=true;
    group.add(inst);this.pickables.push(inst);return written;
  }

  _agaricAddWarts(group,capState,state){
    const count={simplified:50,atlas:120,high:230}[state.realism]||120;
    const geo=new THREE.IcosahedronGeometry(.045,1);
    const mat=MATERIALS.cap2.clone();mat.roughness=.94;
    const inst=new THREE.InstancedMesh(geo,mat,count);
    inst.userData={id:"pileus_warts",label:"Pileus verrucae",category:"macro",selectable:true,knowledgeId:"pileus_warts"};
    const rng=seededRng(4099+count),dummy=new THREE.Object3D();let written=0;
    for(let i=0;i<count*5&&written<count;i++){
      const rn=.05+rng()*.92,theta=rng()*Math.PI*2,mask=this._agaricSurfaceMask(rn,theta,state);
      if(rng()>mask.distribution*mask.retain)continue;
      const surf=this._agaricSurfacePoint(capState,capState.radius*rn,theta,.026);
      dummy.position.copy(surf.point);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),surf.normal);
      const g=.55+rng()*.90;dummy.scale.set(g,g*(.42+rng()*.30),g);dummy.updateMatrix();inst.setMatrixAt(written++,dummy.matrix);
    }
    inst.count=written;inst.instanceMatrix.needsUpdate=true;group.add(inst);this.pickables.push(inst);return written;
  }

  _agaricAddCracks(group,capState,state,{secondary=false}={}){
    const lines={simplified:18,atlas:38,high:64}[state.realism]||38;
    const mat=new THREE.LineBasicMaterial({color:0x3f2c24,transparent:true,opacity:secondary?.55:.72});
    const rng=seededRng(5101+(secondary?97:0));
    let rendered=0;
    for(let i=0;i<lines;i++){
      const theta=(i/lines)*Math.PI*2+(rng()-.5)*.12;
      const rn0=.16+rng()*.30;
      const rn1=.62+rng()*.34;
      const pts=[];
      const steps=5+Math.floor(rng()*4);
      for(let j=0;j<=steps;j++){
        const t=j/steps,rn=THREE.MathUtils.lerp(rn0,rn1,t);
        const mask=this._agaricSurfaceMask(rn,theta,state);
        if(mask.weather<.08&&state.primary!=="areolate"&&state.secondary!=="cracked")continue;
        const a=theta+(rng()-.5)*.09;
        const surf=this._agaricSurfacePoint(capState,capState.radius*rn,a,.013);
        pts.push(surf.point);
      }
      if(pts.length<2)continue;
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat.clone());
      line.userData={id:"pileus_cracks",label:"Areolate surface crack",category:"macro",selectable:true,knowledgeId:"pileus_cracks"};
      group.add(line);this.pickables.push(line);rendered++;
    }
    return rendered;
  }

  _agaricAddTomentum(group,capState,state,{velvety=false,secondary=false}={}){
    const base={simplified:130,atlas:360,high:720}[state.realism]||360;
    const count=Math.round(base*(velvety?1.15:1)*(secondary?.58:1));
    const geo=new THREE.CylinderGeometry(velvety?.0025:.004,velvety?.0035:.006,1,4);
    const mat=MATERIALS.flesh.clone();mat.color.setHex(velvety?0x9a795f:0xb08d70);mat.roughness=1;
    const inst=new THREE.InstancedMesh(geo,mat,count);
    inst.userData={id:"pileus_tomentum",label:velvety?"Velvety pileus nap":"Pileus tomentum",category:"macro",selectable:true,knowledgeId:"pileus_tomentum"};
    const rng=seededRng(6221+count+(secondary?41:0)),dummy=new THREE.Object3D();let written=0;
    for(let i=0;i<count*5&&written<count;i++){
      const rn=.03+rng()*.95,theta=rng()*Math.PI*2,mask=this._agaricSurfaceMask(rn,theta,state);
      if(rng()>mask.distribution*mask.retain)continue;
      const surf=this._agaricSurfacePoint(capState,capState.radius*rn,theta,.009);
      dummy.position.copy(surf.point);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),surf.normal);
      const len=(velvety?.018:.038)*(.55+rng()*.90)*(1-mask.weather*.38);
      dummy.scale.set(1,len,1);dummy.updateMatrix();inst.setMatrixAt(written++,dummy.matrix);
    }
    inst.count=written;inst.instanceMatrix.needsUpdate=true;inst.castShadow=false;inst.receiveShadow=true;
    group.add(inst);this.pickables.push(inst);return written;
  }

  _applyAgaricoidSurfaceSystem(cap,capState){
    if(!cap?.geometry?.attributes?.position||!capState?.topPoint)return null;
    const selected=this._agaricSurfaceState();
    const state={
      ...selected,
      age:selected.secondary==="weathered"&&selected.age==="fresh"?"weathered":selected.age,
      moisture:selected.secondary==="waxy"&&selected.moisture==="dry"?"waxy":selected.moisture
    };
    this._agaricApplySurfaceFinish(cap,state);
    const group=new THREE.Group();
    group.userData={
      id:"pileipellis",label:"Pileipellis / cap surface",category:"tissue",selectable:true,knowledgeId:"pileipellis",
      state:{...state},selectedState:{...selected},generator:"agaricoid-cap-surface-v1"
    };
    const counts={fibrils:0,scales:0,warts:0,cracks:0,tomentum:0};

    const primary=state.primary;
    if(primary==="innately_fibrillose")counts.fibrils+=this._agaricAddFibrils(group,capState,state,{});
    else if(primary==="appressed_fibrillose")counts.fibrils+=this._agaricAddFibrils(group,capState,state,{appressed:true});
    else if(primary==="silky")counts.fibrils+=this._agaricAddFibrils(group,capState,state,{appressed:true,silky:true});
    else if(primary==="squamulose")counts.scales+=this._agaricAddScales(group,capState,state,{});
    else if(primary==="shaggy_scaly")counts.scales+=this._agaricAddScales(group,capState,state,{shaggy:true});
    else if(primary==="verrucose")counts.warts+=this._agaricAddWarts(group,capState,state);
    else if(primary==="areolate")counts.cracks+=this._agaricAddCracks(group,capState,state,{});
    else if(primary==="velvety")counts.tomentum+=this._agaricAddTomentum(group,capState,state,{velvety:true});
    else if(primary==="tomentose")counts.tomentum+=this._agaricAddTomentum(group,capState,state,{});

    const secondary=state.secondary;
    if(secondary==="fibrillose")counts.fibrils+=this._agaricAddFibrils(group,capState,state,{secondary:true});
    else if(secondary==="squamulose_disc")counts.scales+=this._agaricAddScales(group,capState,state,{discOnly:true,secondary:true});
    else if(secondary==="scaly")counts.scales+=this._agaricAddScales(group,capState,state,{secondary:true});
    else if(secondary==="silky")counts.fibrils+=this._agaricAddFibrils(group,capState,state,{appressed:true,silky:true,secondary:true});
    else if(secondary==="cracked")counts.cracks+=this._agaricAddCracks(group,capState,state,{secondary:true});
    else if(secondary==="tomentose")counts.tomentum+=this._agaricAddTomentum(group,capState,state,{secondary:true});

    if(state.age==="weathered"||state.age==="old_broken"||(state.developmentalCracking||0)>.12){
      counts.cracks+=this._agaricAddCracks(group,capState,{...state,secondary:"cracked"},{secondary:true});
    }

    group.userData.counts=counts;
    group.userData.mixedState=secondary!=="none";
    group.userData.morphologicalDistribution=true;
    group.userData.transferableSurfaceEngine=true;
    this.root.add(group);this.objects.set("pileipellis",group);this._rememberTransform(group);
    return group;
  }

  _pileusHeight(form,r){
    const x=Math.min(1,Math.max(0,r));
    if(form==="plane") return .10*(1-x*x);
    if(form==="umbonate") return .22*(1-x*x)+.46*Math.exp(-Math.pow(x/.2,2));
    if(form==="depressed") return .28*(1-x*x)-.34*Math.exp(-Math.pow(x/.34,2));
    if(form==="funnel") return .04+.44*x-.56*Math.pow(1-x,2);
    if(form==="campanulate") return .92*Math.pow(1-x,1.72);
    if(form==="conical") return .92*(1-x);
    if(form==="hemispherical") return .88*Math.sqrt(Math.max(0,1-x*x));
    return .46*(1-x*x);
  }

  _pileusGeometry(form,radius=1.6,segments=96){
    const profile=[];
    segments=scaledSegments(segments,this.realismTier,{min:48,max:128});
    const rings=scaledSegments(34,this.realismTier,{min:22,max:46});
    const thickness=.14;
    for(let i=0;i<=rings;i++){
      const r=radius*(i/rings);
      const n=r/radius;
      profile.push(new THREE.Vector2(r,this._pileusHeight(form,n)));
    }
    for(let i=rings;i>=0;i--){
      const r=radius*(i/rings);
      const n=r/radius;
      const lower=-thickness*(.72+.28*(1-n*n))-.035*Math.cos(n*Math.PI);
      profile.push(new THREE.Vector2(r,lower));
    }
    const g=new THREE.LatheGeometry(profile,segments);
    const pos=g.attributes.position;
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
      const a=Math.atan2(z,x);
      const rr=Math.hypot(x,z)/radius;
      const asym=(.018*Math.sin(a*3.1)+.012*Math.cos(a*5.2))*(.25+.75*rr);
      const edge=.018*Math.sin(a*7.0)*Math.pow(rr,3);
      pos.setY(i,y+asym+edge);
    }
    pos.needsUpdate=true;g.computeVertexNormals();return g;
  }

  _addPileus(form="convex",radius=1.6,y=2.55,material=MATERIALS.cap){
    const mesh=this.register(new THREE.Mesh(this._pileusGeometry(form,radius),material.clone()),"pileus","Pileus / cap","macro");
    mesh.position.y=y;
    this._addCapSurfaceDetail(mesh,radius,form);
    return mesh;
  }

  _addCapSurfaceDetail(mesh,radius,form){
    if(!mesh)return;
    const group=new THREE.Group();
    group.userData=mesh.userData;
    const lineMat=new THREE.LineBasicMaterial({color:0x6f3525,transparent:true,opacity:.24});
    const n=this.realismTier.id==="interactive"?22:this.realismTier.id==="high"?42:34;
    const radialSteps=this.realismTier.id==="interactive"?12:this.realismTier.id==="high"?22:18;
    for(let i=0;i<n;i++){
      const a=i/n*Math.PI*2;
      const pts=[];
      for(let j=2;j<=radialSteps;j++){
        const r=radius*(j/radialSteps);
        const rn=r/radius;
        const wobble=.018*Math.sin(a*5+r*7);
        const x=Math.cos(a+wobble)*r;
        const z=Math.sin(a+wobble)*r;
        const y=this._pileusHeight(form,rn)+.012;
        pts.push(new THREE.Vector3(x,y,z));
      }
      const g=new THREE.BufferGeometry().setFromPoints(pts);
      const line=new THREE.Line(g,lineMat.clone());
      line.userData=mesh.userData;
      group.add(line);
    }
    group.position.copy(mesh.position);
    this.root.add(group);
    this.pickables.push(...group.children);
  }

  _addStipeSurfaceDetail(stipe,height,top,bottom){
    if(!stipe)return;
    const group=new THREE.Group();
    group.userData=stipe.userData;
    const mat=new THREE.LineBasicMaterial({color:0xb9a98f,transparent:true,opacity:.32});
    const n=24;
    for(let i=0;i<n;i++){
      const a=i/n*Math.PI*2;
      const pts=[];
      for(let j=0;j<=12;j++){
        const t=j/12;
        const y=-height/2+t*height;
        const r=THREE.MathUtils.lerp(bottom,top,t)*1.015;
        const wav=.015*Math.sin(t*12+i*.9);
        pts.push(new THREE.Vector3(Math.cos(a+wawSafe(wav))*r,y,Math.sin(a+wawSafe(wav))*r));
      }
      const geo=new THREE.BufferGeometry().setFromPoints(pts);
      const line=new THREE.Line(geo,mat.clone());
      line.userData=stipe.userData;
      group.add(line);
    }
    group.position.copy(stipe.position);
    this.root.add(group);
    this.pickables.push(...group.children);

    function wawSafe(v){return Number.isFinite(v)?v:0;}
  }

  _addBoleteReticulation(stipe,height,top,bottom){
    if(!stipe)return;
    const group=new THREE.Group();
    group.userData=stipe.userData;
    const mat=new THREE.LineBasicMaterial({color:0x8e765d,transparent:true,opacity:.38});
    for(let band=2;band<=11;band++){
      const t=band/13;
      const y=-height/2+t*height;
      const r=THREE.MathUtils.lerp(bottom,top,t)*1.02;
      const pts=[];
      for(let i=0;i<=28;i++){
        const a=i/28*Math.PI*2;
        const rr=r*(1+.018*Math.sin(a*5+band));
        pts.push(new THREE.Vector3(Math.cos(a)*rr,y+.018*Math.sin(a*3+band),Math.sin(a)*rr));
      }
      const geo=new THREE.BufferGeometry().setFromPoints(pts);
      const line=new THREE.Line(geo,mat.clone());
      line.userData=stipe.userData;
      group.add(line);
    }
    group.position.copy(stipe.position);
    this.root.add(group);
    this.pickables.push(...group.children);
  }

  _stipeGeometry(form,height,top,bottom){
    let topR=top,bottomR=bottom;
    if(form==="taper_up"){topR*=.72;bottomR*=1.18;}
    if(form==="taper_down"){topR*=1.18;bottomR*=.72;}
    if(form==="clavate"){topR*=.82;bottomR*=1.42;}
    if(form==="bulbous"||form==="marginate_bulb"){bottomR*=1.08;}
    const profile=[new THREE.Vector2(0,-height/2)];
    const steps=scaledSegments(20,this.realismTier,{min:14,max:28});
    for(let i=0;i<=steps;i++){
      const t=i/steps;
      let r=THREE.MathUtils.lerp(bottomR,topR,t);
      r*=1+.025*Math.sin(t*Math.PI*4)+.012*Math.sin(t*Math.PI*9);
      if(form==="clavate")r*=1+.22*Math.pow(1-t,2.4);
      profile.push(new THREE.Vector2(r,-height/2+t*height));
    }
    profile.push(new THREE.Vector2(0,height/2));
    const g=new THREE.LatheGeometry(profile,scaledSegments(48,this.realismTier,{min:30,max:64}));
    const p=g.attributes.position;
    for(let i=0;i<p.count;i++){
      const y=p.getY(i),t=(y+height/2)/height;
      const lean=.035*Math.sin(t*Math.PI);
      p.setX(i,p.getX(i)+lean);
    }
    p.needsUpdate=true;g.computeVertexNormals();return g;
  }

  _addStipe(form="equal",{height=2.5,y=.8,top=.28,bottom=.34,x=0,z=0}={}){
    if(form==="absent") return null;
    let h=form==="rooting"?height+.55:height;
    let offsetX=x;
    if(form==="lateral") offsetX=-.72;
    if(form==="eccentric") offsetX=-.36;
    const st=this.register(new THREE.Mesh(this._stipeGeometry(form,h,top,bottom),MATERIALS.stipe.clone()),"stipe","Stipe","macro");
    st.position.set(offsetX,y,z);

    if(form==="bulbous"){
      const b=this.register(new THREE.Mesh(new THREE.SphereGeometry(.62,44,28),MATERIALS.stipe.clone()),"stipe_base","Bulbous base","macro","stipe");
      b.scale.set(1,.62,1);b.position.set(offsetX,y-h/2-.14,z);
    }else if(form==="marginate_bulb"){
      const bulb=this.register(new THREE.Mesh(new THREE.SphereGeometry(.58,44,24),MATERIALS.stipe.clone()),"stipe_base","Marginate bulb","macro","stipe");
      bulb.scale.set(1,.55,1);bulb.position.set(offsetX,y-h/2-.13,z);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.54,.055,12,56),MATERIALS.flesh.clone());
      rim.rotation.x=Math.PI/2;rim.position.set(offsetX,y-h/2+.04,z);rim.userData=bulb.userData;
      this.root.add(rim);this.pickables.push(rim);
    }else if(form==="rooting"){
      const root=this.register(new THREE.Mesh(new THREE.ConeGeometry(.20,.95,36),MATERIALS.stipe.clone()),"stipe_base","Rooting base","macro","stipe");
      root.position.set(offsetX,y-h/2-.48,z);root.rotation.x=Math.PI;
    }else{
      const b=this.register(new THREE.Mesh(new THREE.SphereGeometry(.38,36,22),MATERIALS.stipe.clone()),"stipe_base","Stipe base","macro","stipe");
      b.scale.set(1,.38,1);b.position.set(offsetX,y-h/2-.035,z);
    }
    this._addStipeSurfaceDetail(st,h,top,bottom);
    return st;
  }

  _addPoreField(radius,y,{tubeDepth=.22,label="Pore surface"}={}){
    const layer=this.register(new THREE.Mesh(new THREE.CylinderGeometry(radius*.96,radius,.12,72),MATERIALS.pore.clone()),"hymenophore",label,"fertile");
    layer.position.y=y;
    const poreGeo=new THREE.CylinderGeometry(.038,.045,.026,10);
    const poreMat=MATERIALS.poreDark.clone();
    const points=[];
    for(let x=-radius*.88;x<=radius*.88;x+=.115){
      for(let z=-radius*.88;z<=radius*.88;z+=.105){
        const jitter=((Math.round((x+z)*1000)%3)-1)*.012;
        const px=x+jitter,pz=z-jitter*.5;
        if(Math.hypot(px,pz)<radius*.88)points.push([px,pz]);
      }
    }
    const inst=new THREE.InstancedMesh(poreGeo,poreMat,points.length);
    inst.userData={id:"hymenophore",label,category:"fertile",selectable:true};
    const dummy=new THREE.Object3D();
    points.forEach(([px,pz],i)=>{dummy.position.set(px,y-.071,pz);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});
    inst.castShadow=false;inst.receiveShadow=true;this.root.add(inst);this.pickables.push(inst);
    const variationGroup=new THREE.Group();
    variationGroup.userData={id:"hymenophore",label,category:"fertile",selectable:true};
    this._addPoreSurfaceVariation(variationGroup,radius,y);
    this.root.add(variationGroup);
    return layer;
  }

  _agaricoidGillPlateGeometry({
    start=.22,end=1.30,theta=0,capState=null,depth=.24,thickness=.018,
    attachment="adnate",edge="even",shortTier=0
  }={}){
    const len=Math.max(.08,end-start);
    const mid=(start+end)/2;
    const underside=(r)=>capState?.undersideHeight?capState.undersideHeight(r,theta):2.30;
    const midY=underside(mid);
    const samples=20;
    const top=[];
    for(let i=0;i<=samples;i++){
      const t=i/samples,r=THREE.MathUtils.lerp(start,end,t);
      let y=underside(r)-midY;
      if(attachment==="sinuate"&&t<.20)y+=.065*Math.sin((t/.20)*Math.PI);
      if(attachment==="emarginate"&&t<.17)y+=.095*Math.sin((t/.17)*Math.PI);
      if(attachment==="seceding"&&t<.14)y-=.018*(1-t/.14);
      top.push(new THREE.Vector2((t-.5)*len,y));
    }

    const lower=[];
    for(let i=samples;i>=0;i--){
      const t=i/samples,r=THREE.MathUtils.lerp(start,end,t);
      const upper=underside(r)-midY;
      const centerWeight=Math.sin(Math.PI*t);
      let localDepth=depth*(.50+.50*centerWeight);
      if(shortTier>0)localDepth*=.82+.06*shortTier;
      if((attachment==="decurrent"||attachment==="subdecurrent")&&t<.16){
        const run=(1-t/.16);
        localDepth+=run*(attachment==="decurrent"?.22:.10);
      }
      let edgeOffset=0;
      if(edge==="serrulate")edgeOffset=.018*Math.abs(Math.sin(t*Math.PI*16));
      else if(edge==="fimbriate")edgeOffset=.026*Math.abs(Math.sin(t*Math.PI*23+.4))*(.55+.45*Math.sin(t*Math.PI));
      else if(edge==="crisped")edgeOffset=.022*Math.sin(t*Math.PI*11+.7);
      lower.push(new THREE.Vector2((t-.5)*len,upper-localDepth-edgeOffset));
    }

    const shape=new THREE.Shape();
    shape.moveTo(top[0].x,top[0].y);
    for(let i=1;i<top.length;i++)shape.lineTo(top[i].x,top[i].y);
    for(const p of lower)shape.lineTo(p.x,p.y);
    shape.closePath();

    const geo=new THREE.ExtrudeGeometry(shape,{
      depth:thickness,
      bevelEnabled:false,
      steps:1,
      curveSegments:1
    });
    geo.translate(0,0,-thickness/2);
    geo.computeVertexNormals();
    geo.userData={
      model:"agaricoid-gill-plate-v1",attachment,edge,depth,thickness,start,end,shortTier
    };
    return {geo,mid,midY};
  }

  _agaricoidLamellulaPlan(presence,fullCount){
    if(presence==="absent")return [];
    const tiers=presence==="sparse"?[.48]:presence==="moderate"?[.36,.60]:[.25,.43,.62];
    const frequency=presence==="sparse"?4:presence==="moderate"?2:1;
    const plan=[];
    for(let i=0;i<fullCount;i++){
      if(i%frequency!==0)continue;
      const tier=tiers[i%tiers.length];
      plan.push({slot:i+.5,tier,index:i%tiers.length+1});
      if(presence==="abundant"&&i%2===0){
        const tier2=tiers[(i+1)%tiers.length];
        plan.push({slot:i+.25,tier:tier2,index:(i+1)%tiers.length+1});
      }
    }
    return plan;
  }

  _addGillSecondaryDetail(group,type,pileusY,stipeX,inner,outer,capState=null){
    const secondaryMat=MATERIALS.gill.clone();
    secondaryMat.color.offsetHSL(0,0,-.045);
    secondaryMat.opacity=.86;secondaryMat.transparent=true;
    const total=this.realismTier.id==="interactive"?48:this.realismTier.id==="high"?72:64;
    const start=THREE.MathUtils.lerp(inner,outer,.56);
    const end=outer*.99;
    const len=end-start;
    const h=.10+.08*(1-start/outer);
    const shape=new THREE.Shape();
    shape.moveTo(-len/2,0);shape.lineTo(len/2,0);shape.lineTo(len/2,-h*.35);
    shape.quadraticCurveTo(0,-h*.92,-len/2,-h*.62);shape.closePath();
    const geo=new THREE.ShapeGeometry(shape,4);
    const count=Math.floor(total/2);
    const inst=new THREE.InstancedMesh(geo,secondaryMat,count);
    inst.userData={...group.userData,knowledgeId:"lamella",hoverLabel:"Lamellula / short gill",structureType:"lamellula"};
    const dummy=new THREE.Object3D();
    let j=0;
    for(let i=1;i<total;i+=2){
      const a=i/total*Math.PI*2;
      const mid=(start+end)/2;
      const undersideY=capState?.undersideHeight?capState.undersideHeight(mid,a):pileusY-.15;
      dummy.position.set(stipeX+Math.cos(a)*mid,undersideY-((type==="decurrent")?.06:(type==="subdecurrent"?.03:0)),Math.sin(a)*mid);
      dummy.rotation.set(0,-a,0);dummy.scale.set(1,1,1);dummy.updateMatrix();inst.setMatrixAt(j++,dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate=true;inst.castShadow=false;inst.receiveShadow=true;
    group.add(inst);this.pickables.push(inst);
  }


  _addPoreSurfaceVariation(group,radius,y,spacing=.115){
    const mat=MATERIALS.pore.clone();
    mat.color.offsetHSL(0,-.05,.05);
    const ringGeo=new THREE.TorusGeometry(.035,.007,scaledSegments(6,this.realismTier,{min:5,max:8}),scaledSegments(10,this.realismTier,{min:8,max:14}));
    const pts=[];
    const tierSpacing=this.realismTier.id==="interactive"?spacing*1.35:this.realismTier.id==="high"?spacing*.88:spacing;
    for(let x=-radius*.82;x<=radius*.82;x+=tierSpacing*2.1){
      for(let z=-radius*.82;z<=radius*.82;z+=tierSpacing*2.0){
        if(Math.hypot(x,z)>radius*.8)continue;pts.push([x,z]);
      }
    }
    const inst=new THREE.InstancedMesh(ringGeo,mat,pts.length);inst.userData=group.userData;
    const dummy=new THREE.Object3D();
    pts.forEach(([x,z],i)=>{dummy.position.set(x,y-.084,z);dummy.rotation.set(Math.PI/2,0,0);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);});
    inst.instanceMatrix.needsUpdate=true;inst.castShadow=false;inst.receiveShadow=true;group.add(inst);this.pickables.push(inst);
  }


  _addGillHymenophore(type="adnate",pileusY=2.45,stipeX=0,capState=null){
    if(["pores","tubes"].includes(type)){
      const depth=type==="tubes"?.34:.18;
      if(type==="tubes"){
        const tubes=this.register(new THREE.Mesh(new THREE.CylinderGeometry(1.28,1.17,depth,72),MATERIALS.pore.clone()),"tube_layer","Tube layer","fertile");
        tubes.position.set(0,pileusY-.37,0);
      }
      this._addPoreField(1.22,pileusY-(type==="tubes"?.57:.31),{tubeDepth:depth,label:type==="tubes"?"Pore surface":"Pores"});
      return;
    }
    if(type==="teeth"){
      const group=new THREE.Group();group.userData={id:"hymenophore",label:"Teeth / spines",category:"fertile",selectable:true,knowledgeId:"hymenophore"};
      const points=[];
      for(let r=.22;r<1.25;r+=.14){
        const n=Math.max(14,Math.round(r*46));
        for(let i=0;i<n;i++){
          const a=i/n*Math.PI*2;
          const len=.20+.13*(.5+.5*Math.sin(i*2.17+r*9));
          points.push({r,a,len});
        }
      }
      const geo=new THREE.ConeGeometry(.025,1,scaledSegments(8,this.realismTier,{min:6,max:12}));
      const inst=new THREE.InstancedMesh(geo,MATERIALS.gill.clone(),points.length);
      inst.userData=group.userData;inst.castShadow=this.realismTier.id==="high";inst.receiveShadow=true;
      const dummy=new THREE.Object3D();
      points.forEach(({r,a,len},i)=>{
        dummy.position.set(Math.cos(a)*r,pileusY-.22-len/2,Math.sin(a)*r);
        dummy.rotation.set(Math.PI,0,0);dummy.scale.set(1,len,1);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);
      });
      inst.instanceMatrix.needsUpdate=true;group.add(inst);this.pickables.push(inst);
      this.root.add(group);this.objects.set("hymenophore",group);return;
    }
    if(type==="folds"){
      const group=new THREE.Group();group.userData={id:"hymenophore",label:"Folds / ridges",category:"fertile",selectable:true};
      for(let i=0;i<30;i++){
        const a=i/30*Math.PI*2;
        const curve=new THREE.CatmullRomCurve3([
          new THREE.Vector3(Math.cos(a)*.18,pileusY-.21,Math.sin(a)*.18),
          new THREE.Vector3(Math.cos(a)*.62,pileusY-.29,Math.sin(a)*.62),
          new THREE.Vector3(Math.cos(a)*1.22,pileusY-.23,Math.sin(a)*1.22)
        ]);
        const fold=new THREE.Mesh(new THREE.TubeGeometry(curve,18,.025,7,false),MATERIALS.gill.clone());
        fold.userData=group.userData;group.add(fold);this.pickables.push(fold);
      }
      this.root.add(group);this.objects.set("hymenophore",group);return;
    }
    if(type==="smooth"){
      const h=this.register(new THREE.Mesh(new THREE.CylinderGeometry(1.22,1.22,.045,72),MATERIALS.gill.clone()),"hymenophore","Smooth fertile surface","fertile");
      h.position.y=pileusY-.24;return;
    }

    const spacing=this.variants.agaric_gill_spacing||"close";
    const thicknessState=this.variants.agaric_gill_thickness||"thin";
    const depthState=this.variants.agaric_gill_depth||"moderate";
    const lamellulaeState=this.variants.agaric_lamellulae||"moderate";
    const edgeState=this.variants.agaric_gill_edge||"even";

    const spacingCount={distant:28,subdistant:42,close:66,crowded:104}[spacing]||66;
    const tierFactor=this.realismTier.id==="interactive"?.86:this.realismTier.id==="high"?1.08:1;
    const fullCount=Math.max(20,Math.round(spacingCount*tierFactor));
    const plateThickness={thin:.012,moderate:.022,broad:.034}[thicknessState]||.012;
    const plateDepth={shallow:.15,moderate:.25,deep:.37}[depthState]||.25;

    const stipeRadius=.285;
    const innerMap={
      free_gills:stipeRadius+.16,
      seceding:stipeRadius+.105,
      adnexed:stipeRadius+.055,
      adnate:stipeRadius+.018,
      sinuate:stipeRadius+.018,
      emarginate:stipeRadius+.020,
      subdecurrent:Math.max(.11,stipeRadius-.025),
      decurrent:Math.max(.08,stipeRadius-.055)
    };
    const requestedInner=innerMap[type]??stipeRadius+.018;
    const safeInner=capState?.safeInnerRadius??.16;
    const safeOuter=capState?.safeOuterRadius??(capState?.radius?capState.radius*.94:1.48);
    const inner=THREE.MathUtils.clamp(requestedInner,safeInner,Math.max(safeInner+.05,safeOuter-.18));
    const outer=THREE.MathUtils.clamp(capState?.radius?capState.radius*.90:1.32,inner+.18,safeOuter);
    const attachmentLabels={
      free_gills:"Free gills",seceding:"Seceding gills",adnexed:"Adnexed gills",adnate:"Adnate gills",
      sinuate:"Sinuate gills",emarginate:"Emarginate gills",subdecurrent:"Subdecurrent gills",decurrent:"Decurrent gills"
    };
    const attachmentKnowledge={
      free_gills:"free_gills",seceding:"seceding",adnexed:"adnexed",adnate:"adnate",
      sinuate:"sinuate",emarginate:"emarginate",subdecurrent:"subdecurrent",decurrent:"decurrent"
    };

    const group=new THREE.Group();
    group.userData={
      id:"hymenophore",label:attachmentLabels[type]||"Lamellae / gills",category:"fertile",selectable:true,
      knowledgeId:attachmentKnowledge[type]||"gill_attachment",attachmentType:type,
      spacing,thickness:thicknessState,depth:depthState,lamellulae:lamellulaeState,edge:edgeState,
      fullGillCount:fullCount
    };

    const fullSpecs=[];
    for(let i=0;i<fullCount;i++){
      const theta=i/fullCount*Math.PI*2;
      const spec=this._agaricoidGillPlateGeometry({
        start:inner,end:outer,theta,capState,depth:plateDepth,thickness:plateThickness,
        attachment:type,edge:edgeState,shortTier:0
      });
      fullSpecs.push({theta,spec});
    }
    // Plates use one shared reference geometry per attachment state; per-angle vertical
    // placement follows the generated pileus underside.
    const referenceFull=this._agaricoidGillPlateGeometry({
      start:inner,end:outer,theta:0,capState,depth:plateDepth,thickness:plateThickness,
      attachment:type,edge:edgeState,shortTier:0
    });
    const fullGillMaterial=MATERIALS.gill.clone();
    fullGillMaterial.side=THREE.DoubleSide;
    const fullMesh=new THREE.InstancedMesh(referenceFull.geo,fullGillMaterial,fullCount);
    fullMesh.userData={
      ...group.userData,knowledgeId:attachmentKnowledge[type]||"lamella",
      hoverLabel:attachmentLabels[type]||"Lamella / gill",structureType:"lamella",
      edgeKnowledgeId:"gill_edge"
    };
    fullMesh.castShadow=this.realismTier.id==="high";fullMesh.receiveShadow=true;
    const dummy=new THREE.Object3D();
    for(let i=0;i<fullCount;i++){
      const theta=i/fullCount*Math.PI*2;
      const mid=(inner+outer)/2;
      const localY=capState?.undersideHeight?capState.undersideHeight(mid,theta):pileusY-.18;
      const referenceY=capState?.undersideHeight?capState.undersideHeight(mid,0):pileusY-.18;
      dummy.position.set(stipeX+Math.cos(theta)*mid,localY-referenceY,Math.sin(theta)*mid);
      dummy.rotation.set(0,-theta,0);
      dummy.scale.set(1,1,1);dummy.updateMatrix();fullMesh.setMatrixAt(i,dummy.matrix);
    }
    fullMesh.instanceMatrix.needsUpdate=true;
    group.add(fullMesh);this.pickables.push(fullMesh);

    const lamPlan=this._agaricoidLamellulaPlan(lamellulaeState,fullCount);
    const tiers=[...new Set(lamPlan.map(x=>x.tier))];
    let lamellulaCount=0;
    for(const tier of tiers){
      const entries=lamPlan.filter(x=>x.tier===tier);
      const start=THREE.MathUtils.lerp(inner,outer,tier);
      const tierIndex=Math.max(1,Math.round(tier*4));
      const spec=this._agaricoidGillPlateGeometry({
        start,end:outer,theta:0,capState,
        depth:plateDepth*(.82+.10*tier),thickness:plateThickness*.92,
        attachment:"free_gills",edge:edgeState,shortTier:tierIndex
      });
      const inst=new THREE.InstancedMesh(spec.geo,MATERIALS.gill.clone(),entries.length);
      inst.userData={
        ...group.userData,id:"lamellula",knowledgeId:"lamellula",hoverLabel:"Lamellula / short gill",
        structureType:"lamellula",lengthTier:tierIndex,edgeKnowledgeId:"gill_edge"
      };
      inst.castShadow=false;inst.receiveShadow=true;
      entries.forEach((entry,j)=>{
        const theta=(entry.slot/fullCount)*Math.PI*2;
        const mid=(start+outer)/2;
        const localY=capState?.undersideHeight?capState.undersideHeight(mid,theta):pileusY-.18;
        const referenceY=capState?.undersideHeight?capState.undersideHeight(mid,0):pileusY-.18;
        dummy.position.set(stipeX+Math.cos(theta)*mid,localY-referenceY,Math.sin(theta)*mid);
        dummy.rotation.set(0,-theta,0);dummy.scale.set(1,1,1);dummy.updateMatrix();inst.setMatrixAt(j,dummy.matrix);
      });
      inst.instanceMatrix.needsUpdate=true;
      group.add(inst);this.pickables.push(inst);lamellulaCount+=entries.length;
      if(!this.objects.has("lamellula"))this.objects.set("lamellula",inst);
    }

    group.userData.lamellulaCount=lamellulaCount;
    group.userData.plateModel="agaricoid-gill-plate-v1";
    const edgeProbe=new THREE.Group();
    edgeProbe.userData={
      id:"gill_edge",label:"Gill edge",category:"fertile",selectable:true,knowledgeId:"gill_edge",
      edgeCondition:edgeState
    };
    this.root.add(edgeProbe);this.objects.set("gill_edge",edgeProbe);
    group.userData.spacingDegrees=360/fullCount;
    group.userData.attachmentGeometry={
      innerRadius:inner,
      descendsStipe:type==="decurrent"||type==="subdecurrent",
      notched:type==="sinuate"||type==="emarginate",
      detached:type==="free_gills"||type==="seceding"
    };

    this.root.add(group);this.objects.set("hymenophore",group);
  }

  _addVeil(type="annulus",stipeX=0,capY=2.45){
    if(type==="none") return;
    if(type==="annulus"){
      const group=new THREE.Group();group.userData={id:"veil_structure",label:"Annulus",category:"veil",selectable:true,parentId:"stipe"};
      const skirt=new THREE.Mesh(new THREE.CylinderGeometry(.48,.34,.16,64,1,true),MATERIALS.flesh.clone());
      skirt.position.set(stipeX,1.58,0);skirt.userData=group.userData;group.add(skirt);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.47,.035,10,64),MATERIALS.flesh.clone());
      rim.rotation.x=Math.PI/2;rim.position.set(stipeX,1.50,0);rim.userData=group.userData;group.add(rim);
      this.root.add(group);this.objects.set("veil_structure",group);this.pickables.push(skirt,rim);
    }else if(type==="cortina"){
      const g=new THREE.Group();g.userData={id:"veil_structure",label:"Cortina","category":"veil",selectable:true};
      for(let i=0;i<18;i++){const a=i/18*Math.PI*2;const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(stipeX+Math.cos(a)*.3,1.55,Math.sin(a)*.3),new THREE.Vector3(Math.cos(a)*1.05,capY-.18,Math.sin(a)*1.05)]);const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xb8ab93,transparent:true,opacity:.45}));l.userData=g.userData;g.add(l);this.pickables.push(l);}
      this.root.add(g);this.objects.set("veil_structure",g);
    }else if(type==="volva"){
      const cup=this.register(new THREE.Mesh(new THREE.SphereGeometry(.62,32,18,0,Math.PI*2,Math.PI/2,Math.PI/2),MATERIALS.flesh.clone()),"veil_structure","Volva","veil","stipe");cup.scale.y=.55;cup.position.set(stipeX,-.46,0);
    }else if(type==="universal_remnants"){
      const g=new THREE.Group();g.userData={id:"veil_structure",label:"Universal veil remnants",category:"veil",selectable:true};
      for(let i=0;i<21;i++){const a=i/21*Math.PI*2,r=.28+.82*((i%7)/7),w=new THREE.Mesh(new THREE.IcosahedronGeometry(.07+(i%4)*.014,1),MATERIALS.flesh.clone());w.position.set(Math.cos(a)*r,capY+.10+.22*(1-r)+.025*Math.sin(i*1.7),Math.sin(a)*r);w.scale.set(1,.42+.18*((i%3)/2),.9);w.rotation.set(i*.13,i*.31,i*.19);w.userData=g.userData;g.add(w);this.pickables.push(w);}
      this.root.add(g);this.objects.set("veil_structure",g);
    }
  }

  build_agaricoid(){
    const v=this.variants,capY=2.48,radius=1.62;
    const profile=v.agaric_pileus_profile||"convex";
    const center=v.agaric_pileus_center||"even";
    const margin=v.agaric_margin||"decurved";
    const form=v.agaric_stipe_form||v.agaric_stipe_taper||"equal";
    const stipePosition=v.agaric_stipe_position||"central";

    const identitySeed=this.morphologyState?.developmental?.identitySeed||421;
    const capGeo=this._agaricoidPileusTopGeometry({profile,center,margin,radius,seed:identitySeed});
    const underGeo=this._agaricoidPileusUnderGeometry({profile,center,margin,radius,seed:identitySeed});

    const capMaterial=MATERIALS.cap.clone();
    capMaterial.side=THREE.DoubleSide;
    capMaterial.roughness=.82;
    const cap=this.register(new THREE.Mesh(capGeo,capMaterial),"pileus","Pileus / cap","macro");
    cap.position.y=capY;
    cap.userData.profile=profile;cap.userData.center=center;cap.userData.margin=margin;
    cap.userData.recoveryBuild="phase6-pileus-v4";
    cap.userData.expectedVisiblePileus=true;

    const underMat=MATERIALS.flesh.clone();
    underMat.side=THREE.DoubleSide;
    const undersideMesh=new THREE.Mesh(underGeo,underMat);
    undersideMesh.position.y=capY;
    undersideMesh.userData={id:"pileus_underside",label:"Pileus underside",category:"macro",parentId:"pileus",selectable:true,knowledgeId:"pileus"};
    this.root.add(undersideMesh);this.pickables.push(undersideMesh);this.objects.set("pileus_underside",undersideMesh);

    const ctx=undersideMesh.clone();
    ctx.geometry=underGeo.clone();
    ctx.material=MATERIALS.flesh.clone();
    ctx.material.side=THREE.DoubleSide;
    ctx.scale.set(.965,.94,.965);
    ctx.position.set(0,capY-.018,0);
    ctx.userData={id:"pileus_context",label:"Pileus context",category:"internal",parentId:"pileus",selectable:true,knowledgeId:"pileus_context"};
    ctx.visible=false;
    this.root.add(ctx);this.objects.set("pileus_context",ctx);

    const topPoint=capGeo.userData.topPoint;
    const undersidePointLocal=underGeo.userData.undersidePoint;
    const underside=underGeo.userData.undersideHeight;
    const apexLocal=typeof underside==="function"?underside(0,0):-.22;
    const stipeTopY=capY+apexLocal+.025;
    const stipe=this._addAgaricoidStipe(form,{baseY:-.46,topY:stipeTopY,top:.285,bottom:.34,position:stipePosition});
    const stipeX=stipe?.position.x||0;

    const capState={
      radius,
      profile,center,margin,
      topPoint:(r,theta=0)=>{
        const p=typeof topPoint==="function"?topPoint(r,theta):new THREE.Vector3(Math.cos(theta)*r,0,Math.sin(theta)*r);
        return p.clone().add(new THREE.Vector3(0,capY,0));
      },
      topHeight:(r,theta=0)=>capY+(typeof capGeo.userData.topHeight==="function"?capGeo.userData.topHeight(r,theta):0),
      undersidePoint:(r,theta=0)=>{
        const p=typeof undersidePointLocal==="function"
          ? undersidePointLocal(THREE.MathUtils.clamp(r,0,radius),theta)
          : new THREE.Vector3(Math.cos(theta)*r,-.18,Math.sin(theta)*r);
        return p.clone().add(new THREE.Vector3(0,capY,0));
      },
      undersideHeight:(r,theta=0)=>capY+(typeof underside==="function"?underside(THREE.MathUtils.clamp(r,0,radius),theta):-.18),
      safeInnerRadius:radius*.10,
      safeOuterRadius:radius*.94
    };
    this._agaricoidCapState=capState;
    this._applyAgaricoidSurfaceSystem(cap,capState);
    this._addGillHymenophore(v.agaric_gill_attachment||"adnate",capY,stipeX,capState);
    this._addVeil(v.veil,stipeX,capY);

    if(margin==="appendiculate"){
      const remnants=new THREE.Group();
      remnants.userData={id:"pileus_margin",label:"Appendiculate margin remnants",category:"macro",selectable:true,knowledgeId:"pileus_margin"};
      const mat=MATERIALS.flesh.clone();
      for(let i=0;i<22;i++){
        if(i%3===0)continue;
        const a=i/22*Math.PI*2;
        const frag=new THREE.Mesh(new THREE.ConeGeometry(.026,.13+(i%4)*.018,6),mat.clone());
        frag.position.set(Math.cos(a)*radius*.98,capState.undersideHeight(radius*.98,a)-.055,Math.sin(a)*radius*.98);
        frag.rotation.set(Math.PI,0,-a);
        frag.scale.set(.8,1,.65);
        frag.userData=remnants.userData;
        remnants.add(frag);this.pickables.push(frag);
      }
      this.root.add(remnants);this.objects.set("pileus_margin",remnants);
    }
  }
  build_boletoid(){
    const v=this.variants,capY=2.55;
    this._addPileus(v.pileus,1.72,capY,MATERIALS.cap2);
    const tubes=this.register(new THREE.Mesh(new THREE.CylinderGeometry(1.34,1.18,.42,scaledSegments(72,this.realismTier,{min:40,max:96})),MATERIALS.pore.clone()),"tube_layer","Tube layer","fertile");
    tubes.position.y=capY-.45;
    this._addPoreField(1.20,capY-.68,{tubeDepth:.42,label:"Pore surface"});
    const st=this._addStipe(v.stipe,{height:2.55,y:.70,top:.38,bottom:.52});
    if(st)this._addBoleteReticulation(st,2.55,.38,.52);
    this._addVeil(v.veil,st?.position.x||0,capY);
  }

  build_polyporoid(){
    const trunk=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.94,1.10,3.5,scaledSegments(40,this.realismTier,{min:24,max:56})),MATERIALS.wood.clone()),"substrate","Woody substrate","ecology");
    trunk.position.set(-1.58,.48,0);trunk.rotation.z=.06;

    const shape=new THREE.Shape();
    shape.moveTo(-.95,-.66);
    shape.bezierCurveTo(-.35,-.98,.72,-1.02,1.72,-.56);
    shape.bezierCurveTo(2.08,-.36,2.12,.12,1.78,.40);
    shape.bezierCurveTo(.86,.92,-.12,.90,-.98,.56);
    shape.bezierCurveTo(-1.18,.38,-1.17,-.38,-.95,-.66);
    const ext=new THREE.ExtrudeGeometry(shape,{depth:1.55,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.10,bevelThickness:.10});
    ext.translate(0,0,-.775);
    const shelf=this.register(new THREE.Mesh(ext,MATERIALS.cap.clone()),"pileus","Upper surface / bracket","macro");
    shelf.rotation.x=-Math.PI/2;
    shelf.rotation.z=.02;
    shelf.position.set(.10,1.56,0);

    const ctxShape=shape.clone();
    const ctxGeo=new THREE.ExtrudeGeometry(ctxShape,{depth:1.40,bevelEnabled:true,bevelSegments:3,bevelSize:.04,bevelThickness:.04});
    ctxGeo.translate(0,0,-.70);
    const ctx=this.register(new THREE.Mesh(ctxGeo,MATERIALS.flesh.clone()),"context","Context","internal");
    ctx.rotation.x=-Math.PI/2;ctx.scale.set(.93,.72,.93);ctx.position.set(.12,1.24,0);

    const tubes=this.register(new THREE.Mesh(new THREE.BoxGeometry(2.45,.34,1.38),MATERIALS.pore.clone()),"tube_layer","Tube layer","fertile");
    tubes.position.set(.42,.93,0);

    const poreGroup=new THREE.Group();
    poreGroup.userData={id:"hymenophore",label:"Pore surface",category:"fertile",selectable:true,knowledgeId:"pore_surface"};
    const pGeo=new THREE.CylinderGeometry(.032,.040,.024,scaledSegments(9,this.realismTier,{min:6,max:12}));
    const pMat=MATERIALS.poreDark.clone();
    const pp=[];for(let x=-.62;x<=1.58;x+=.11){for(let z=-.58;z<=.58;z+=.105){if(x<-.35&&Math.abs(z)>.38)continue;pp.push([x,z]);}}
    const pInst=new THREE.InstancedMesh(pGeo,pMat,pp.length);pInst.userData=poreGroup.userData;
    const pDummy=new THREE.Object3D();pp.forEach(([x,z],i)=>{pDummy.position.set(x,.75,z);pDummy.updateMatrix();pInst.setMatrixAt(i,pDummy.matrix);});
    pInst.instanceMatrix.needsUpdate=true;pInst.castShadow=false;pInst.receiveShadow=true;poreGroup.add(pInst);this.pickables.push(pInst);
    this.root.add(poreGroup);this.objects.set("hymenophore",poreGroup);
  }

  build_hydnoid(){
    const cap=this.register(new THREE.Mesh(new THREE.SphereGeometry(1.55,scaledSegments(48,this.realismTier,{min:28,max:64}),scaledSegments(24,this.realismTier,{min:16,max:34}),0,Math.PI*2,0,Math.PI/2.2),MATERIALS.cap.clone()),"pileus","Pileus / cap","macro");cap.scale.set(1,.5,1);cap.rotation.x=Math.PI;cap.position.y=2.65;
    const st=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.26,.36,2.3,scaledSegments(36,this.realismTier,{min:24,max:48})),MATERIALS.stipe.clone()),"stipe","Stipe","macro");st.position.y=.85;
    const teeth=new THREE.Group();teeth.userData={id:"hymenophore",label:"Teeth / spines",category:"fertile",selectable:true,knowledgeId:"hymenophore"};
    const toothPts=[];
    for(let r=.3;r<1.25;r+=.24){const n=Math.max(10,Math.round(r*28));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;toothPts.push({r,a});}}
    const toothGeo=new THREE.ConeGeometry(.035,.28,scaledSegments(7,this.realismTier,{min:6,max:10}));
    const toothInst=new THREE.InstancedMesh(toothGeo,MATERIALS.gill.clone(),toothPts.length);toothInst.userData=teeth.userData;
    const toothDummy=new THREE.Object3D();
    toothPts.forEach(({r,a},i)=>{toothDummy.position.set(Math.cos(a)*r,2.05,Math.sin(a)*r);toothDummy.rotation.set(Math.PI,0,0);toothDummy.updateMatrix();toothInst.setMatrixAt(i,toothDummy.matrix);});
    toothInst.instanceMatrix.needsUpdate=true;toothInst.castShadow=this.realismTier.id==="high";toothInst.receiveShadow=true;teeth.add(toothInst);this.pickables.push(toothInst);
    this.root.add(teeth);this.objects.set("hymenophore",teeth);
  }

  build_hoof_conk(){
    const trunk=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.95,1.12,3.5,28),MATERIALS.wood.clone()),"substrate","Woody substrate","ecology");trunk.position.set(-1.55,.45,0);
    const hoof=this.register(new THREE.Mesh(new THREE.SphereGeometry(1.45,scaledSegments(48,this.realismTier,{min:28,max:64}),scaledSegments(30,this.realismTier,{min:18,max:40})),MATERIALS.cap2.clone()),"pileus","Hoof-shaped upper surface","macro");hoof.scale.set(1.1,.8,.9);hoof.position.set(.05,1.55,0);
    const ctx=this.register(new THREE.Mesh(new THREE.BoxGeometry(2.1,.38,1.45),MATERIALS.flesh.clone()),"context","Context","internal");ctx.position.set(.1,.95,0);
    const tubes=this.register(new THREE.Mesh(new THREE.BoxGeometry(2.0,.38,1.38),MATERIALS.pore.clone()),"tube_layer","Layered tube tissue","fertile");tubes.position.set(.1,.62,0);
    const pore=this.register(new THREE.Mesh(new THREE.BoxGeometry(2.0,.035,1.38),MATERIALS.pore.clone()),"hymenophore","Pore surface","fertile");pore.position.set(.1,.41,0);
  }

  build_hydnoid_bracket(){
    const trunk=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.9,1.08,3.4,28),MATERIALS.wood.clone()),"substrate","Woody substrate","ecology");trunk.position.set(-1.55,.45,0);
    const shelf=this.register(new THREE.Mesh(new THREE.SphereGeometry(1.7,scaledSegments(48,this.realismTier,{min:28,max:64}),scaledSegments(28,this.realismTier,{min:18,max:38}),0,Math.PI*2,0,Math.PI/2.25),MATERIALS.cap.clone()),"pileus","Upper bracket surface","macro");shelf.scale.set(1.12,.34,.7);shelf.rotation.x=Math.PI;shelf.position.set(.25,1.55,0);
    const ctx=this.register(new THREE.Mesh(new THREE.BoxGeometry(2.3,.25,1.5),MATERIALS.flesh.clone()),"context","Context","internal");ctx.position.set(.2,1.25,0);
    const teeth=new THREE.Group();teeth.userData={id:"hymenophore",label:"Teeth / spines",category:"fertile",selectable:true,knowledgeId:"hymenophore"};
    const hbPts=[];for(let x=-.85;x<=1.15;x+=.18){for(let z=-.55;z<=.55;z+=.18)hbPts.push([x,z]);}
    const hbGeo=new THREE.ConeGeometry(.03,.3,scaledSegments(7,this.realismTier,{min:6,max:10}));
    const hbInst=new THREE.InstancedMesh(hbGeo,MATERIALS.gill.clone(),hbPts.length);hbInst.userData=teeth.userData;
    const hbDummy=new THREE.Object3D();hbPts.forEach(([x,z],i)=>{hbDummy.position.set(x,1.02,z);hbDummy.rotation.set(Math.PI,0,0);hbDummy.updateMatrix();hbInst.setMatrixAt(i,hbDummy.matrix);});
    hbInst.instanceMatrix.needsUpdate=true;hbInst.castShadow=this.realismTier.id==="high";hbInst.receiveShadow=true;teeth.add(hbInst);this.pickables.push(hbInst);
    this.root.add(teeth);this.objects.set("hymenophore",teeth);
  }

  build_morel(){
    const st=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.28,.42,2.4,scaledSegments(32,this.realismTier,{min:20,max:44})),MATERIALS.stipe.clone()),"stipe","Hollow stipe","macro");st.position.y=.55;
    const head=this.register(new THREE.Mesh(new THREE.SphereGeometry(.88,scaledSegments(40,this.realismTier,{min:24,max:56}),scaledSegments(28,this.realismTier,{min:18,max:38})),MATERIALS.morel.clone()),"fertile_head","Fertile head","macro");head.scale.set(.78,1.5,.78);head.position.y=2.55;
    const wire=new THREE.LineSegments(new THREE.WireframeGeometry(head.geometry),new THREE.LineBasicMaterial({color:0xc69a65,transparent:true,opacity:.55}));wire.scale.copy(head.scale);wire.position.copy(head.position);wire.userData={id:"hymenophore",label:"Ridges and pits",category:"fertile",selectable:true};this.root.add(wire);this.pickables.push(wire);this.objects.set("hymenophore",wire);
    const cavity=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.16,.22,3.4,20),new THREE.MeshStandardMaterial({color:0x2b1d17,roughness:1})),"internal_cavity","Internal cavity","internal");cavity.position.y=1.25;
  }

  build_coral(){
    const base=this.register(
      new THREE.Mesh(new THREE.CylinderGeometry(.34,.46,.58,scaledSegments(22,this.realismTier,{min:16,max:30})),MATERIALS.coral.clone()),
      "base","Basal trunk","macro"
    );
    base.position.y=-.48;

    const group=new THREE.Group();
    group.userData={id:"branch_system",label:"Branch system",category:"macro",selectable:true,knowledgeId:"branch_system"};

    const tips=new THREE.Group();
    tips.userData={id:"branch_tips",label:"Branch tips",category:"macro",selectable:true,knowledgeId:"branch_tips"};

    const addBranch=(x,y,z,len,rad,depth)=>{
      const m=new THREE.Mesh(new THREE.CylinderGeometry(rad*.72,rad,len,10),MATERIALS.coral.clone());
      m.position.set(x,y+len/2,z);
      m.userData=group.userData;
      group.add(m);
      this.pickables.push(m);
      if(depth>0){
        [[-.35,.15],[.35,.1],[0,.36]].forEach(d=>addBranch(x+d[0],y+len*.92,z+d[1],len*.62,rad*.72,depth-1));
      }else{
        const tip=new THREE.Mesh(new THREE.SphereGeometry(rad*.82,10,8),MATERIALS.coral.clone());
        tip.scale.set(.88,1.15,.88);
        tip.position.set(x,y+len,z);
        tip.userData=tips.userData;
        tips.add(tip);
        this.pickables.push(tip);
      }
    };
    for(let i=-2;i<=2;i++)addBranch(i*.22,-.38,Math.abs(i%2)*.12,1.5-Math.abs(i)*.08,.13,2);

    this.root.add(group,tips);
    this.objects.set("branch_system",group);
    this.objects.set("branch_tips",tips);
    this.objects.set("hymenophore",group);
  }

  build_puffball(){
    const realism=this.variants.texture_realism||"atlas";
    const subtypeId=this.variants.puff_subtype||"true_puffball";
    const subtype=puffballSubtype(subtypeId);
    const subtypeArch=subtype.architecture||{};
    const subtypeDev=subtype.development||{};
    const surface=this.variants.puff_surface||"echinate";
    const shape=this.variants.puff_shape||"globose";
    const baseDetail={simplified:42,atlas:76,high:124}[realism]||76;
    const detail=surface==="echinate"
      ? {simplified:96,atlas:180,high:300}[realism]
      : surface==="granular"
        ? Math.round(baseDetail*1.45)
        : baseDetail;
    const bodyY=subtypeId==="stalked_puffball_type"?1.55:subtypeId==="earthstar_type"?1.12:1.05;
    const stageId=this.morphologyState?.stage?.id||this.developmentalStageId||"mature";
    const irregularityScale=surface==="glabrous"?(stageId==="young"?.008:stageId==="mature"?.012:.018):(stageId==="young"?.032:stageId==="mature"?.022:.014);

    const innerMat=(stageId==="young"?PUFF_PBR.youngPeridium:PUFF_PBR.wornExoperidium).clone();
    if(subtypeId==="earthball_type")innerMat.color.setHex(stageId==="young"?0xa9835b:0x6f543a);
    else if(subtypeId==="giant_puffball_type")innerMat.color.setHex(stageId==="young"?0xe0d9bd:0xb9aa87);
    else if(subtypeId==="earthstar_type")innerMat.color.setHex(stageId==="young"?0xb8a47f:0x8b7559);
    else if(subtypeId==="stalked_puffball_type")innerMat.color.setHex(stageId==="young"?0xc6b48e:0x9a8465);
    const surfaceBump={glabrous:.010,granular:.034,verrucose:.030,echinate:.022,furfuraceous:.027}[surface]??.018;
    innerMat.bumpScale=stageId==="old"?surfaceBump*.55:stageId==="mature"?surfaceBump*.78:surfaceBump;
    const bodyRadius=subtypeId==="giant_puffball_type"?1.34:subtypeId==="earthball_type"?1.18:subtypeId==="earthstar_type"?.88:subtypeId==="stalked_puffball_type"?.72:1.15;
    const identitySeed=this.morphologyState?.developmental?.identitySeed||137;
    const devParams=this.morphologyState?.stage?.parameters||{};
    const bodySegments=scaledSegments(64,this.realismTier,{min:42,max:88});
    const bodyRings=scaledSegments(40,this.realismTier,{min:28,max:54});
    const bodyGeo=createBiologicalPuffballGeometry({
      radius:bodyRadius,shape,stageId,subtypeId,seed:identitySeed,
      segments:bodySegments,rings:bodyRings,params:devParams
    });
    const per=this.register(new THREE.Mesh(bodyGeo,innerMat),"peridium","Peridium","macro");
    per.scale.set(1,subtypeId==="earthball_type"?.92:subtypeId==="giant_puffball_type"?.90:.95,1);per.position.y=bodyY;

    const endoMat=PUFF_PBR.endoperidium.clone();
    const endoRadius=bodyRadius*(subtypeId==="earthball_type"?.86:.94);
    const endoGeo=createBiologicalPuffballGeometry({
      radius:endoRadius,shape,stageId,subtypeId,seed:identitySeed,
      segments:scaledSegments(56,this.realismTier,{min:36,max:76}),
      rings:scaledSegments(34,this.realismTier,{min:24,max:46}),
      params:devParams
    });
    const endo=this.register(new THREE.Mesh(endoGeo,endoMat),"endoperidium","Endoperidium","internal","peridium");
    endo.position.y=bodyY;

    const glebaRadius=bodyRadius*.75*(subtypeArch.glebaFactor||1);
    const glebaMat=(stageId==="young"?PUFF_PBR.immatureGleba:stageId==="mature"?PUFF_PBR.maturingGleba:PUFF_PBR.matureGleba).clone();
    const glebaGeo=createGlebaVolumeGeometry({
      radius:glebaRadius,stageId,seed:identitySeed+211,
      segments:scaledSegments(48,this.realismTier,{min:30,max:68}),
      rings:scaledSegments(30,this.realismTier,{min:20,max:42}),
      maturity:devParams.gleba_maturity??.5,
      waterLoss:devParams.water_loss??0,
      depletion:devParams.spore_depletion??0,
      shape
    });
    const gleba=this.register(new THREE.Mesh(glebaGeo,glebaMat),"gleba","Gleba","internal");
    gleba.position.y=bodyY;
    gleba.userData.renderingModel="porous-fibrous-volumetric-v2";
    if(gleba.material?.color){
      if(subtypeId==="earthball_type")gleba.material.color.setHex(stageId==="young"?0xe7dfc8:stageId==="mature"?0x6a5a3d:0x34291f);
      else if(subtypeId==="giant_puffball_type")gleba.material.color.setHex(stageId==="young"?0xf2edde:stageId==="mature"?0xb1a475:0x68583d);
      else if(subtypeId==="earthstar_type")gleba.material.color.setHex(stageId==="young"?0xe8e1cb:stageId==="mature"?0x887555:0x4c3c2d);
      else if(subtypeId==="stalked_puffball_type")gleba.material.color.setHex(stageId==="young"?0xe9e2cf:stageId==="mature"?0x8b7756:0x49392b);
    }
    const glebaMicro=makeGlebaMicrostructure({
      radius:glebaRadius,stageId,realism,seed:identitySeed+433,
      maturity:devParams.gleba_maturity??.5,
      waterLoss:devParams.water_loss??0,
      depletion:devParams.spore_depletion??0
    });
    const interfaceMat=glebaMat.clone();
    interfaceMat.transparent=true;interfaceMat.opacity=stageId==="young"?.16:stageId==="mature"?.12:.08;
    interfaceMat.side=THREE.DoubleSide;
    const interfaceGeo=createGlebaVolumeGeometry({
      radius:glebaRadius*1.035,stageId,seed:identitySeed+277,
      segments:scaledSegments(44,this.realismTier,{min:28,max:60}),
      rings:scaledSegments(28,this.realismTier,{min:18,max:38}),
      maturity:devParams.gleba_maturity??.5,
      waterLoss:devParams.water_loss??0,
      depletion:devParams.spore_depletion??0,
      shape
    });
    const glebaInterface=new THREE.Mesh(interfaceGeo,interfaceMat);
    glebaInterface.userData={id:"gleba",label:"Peridium–gleba transition zone",category:"internal",parentId:"gleba",selectable:true,knowledgeId:"gleba"};
    glebaInterface.castShadow=false;glebaInterface.receiveShadow=true;
    gleba.add(glebaInterface);this.pickables.push(glebaInterface);
    glebaMicro.children.forEach(child=>{
      child.userData.parentId="gleba";
      this.pickables.push(child);
    });
    gleba.add(glebaMicro);


    const subglebaFactor=subtypeArch.subglebaFactor??.7;
    const neckHeight=.75*subglebaFactor;
    const neck=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.42*Math.max(.35,subglebaFactor),.58*Math.max(.35,subglebaFactor),Math.max(.08,neckHeight),34),(stageId==="young"?PUFF_PBR.youngPeridium:PUFF_PBR.wornExoperidium).clone()),"sterile_base","Sterile base / subgleba","macro");
    neck.position.y=bodyY-bodyRadius*.98-neckHeight*.45;

    const pore=this.register(new THREE.Mesh(new THREE.TorusGeometry(.11,.035,10,32),MATERIALS.wood.clone()),"apical_pore","Ostiole / apical pore","macro","peridium");
    pore.rotation.x=Math.PI/2;pore.position.y=bodyY+bodyRadius*.93;

    const apicalMat=PUFF_PBR.youngPeridium.clone();apicalMat.transparent=true;apicalMat.opacity=.08;
    const apical=this.register(new THREE.Mesh(new THREE.SphereGeometry(.34,18,12),apicalMat),"apical_region","Apical region","macro","peridium");
    apical.position.y=bodyY+bodyRadius*.82;apical.scale.set(bodyRadius/1.15,.45,bodyRadius/1.15);

    const basalMat=PUFF_PBR.soil.clone();basalMat.transparent=true;basalMat.opacity=.14;
    const basal=this.register(new THREE.Mesh(new THREE.SphereGeometry(.34,16,10),basalMat),"basal_attachment","Basal attachment","macro","sterile_base");
    basal.position.y=neck.position.y-neckHeight*.55;basal.scale.set(.9,.38,.9);

    const earthstarRays=new THREE.Group();
    earthstarRays.userData={id:"earthstar_rays",label:"Earthstar rays",category:"macro",selectable:true,knowledgeId:"earthstar_rays"};
    if(subtypeArch.rayCountRange||subtypeArch.rayCount){
      const rayMat=PUFF_PBR.wornExoperidium.clone();
      const range=subtypeArch.rayCountRange||[subtypeArch.rayCount,subtypeArch.rayCount];
      const low=range[0];
      const high=range[1]??low;
      const identitySeed=this.morphologyState?.developmental?.identitySeed||7;
      const rayCount=low+(identitySeed%(high-low+1));
      for(let i=0;i<rayCount;i++){
        const a=i/rayCount*Math.PI*2;
        const ray=new THREE.Mesh(new THREE.ConeGeometry(.28,.95,5,1,false),rayMat.clone());
        ray.rotation.z=Math.PI/2;
        ray.rotation.y=-a;
        ray.position.set(Math.cos(a)*.72,bodyY-bodyRadius*.88,Math.sin(a)*.72);
        ray.scale.set(1,.84+((i*7)%5)*.06,1);
        ray.userData=earthstarRays.userData;
        earthstarRays.add(ray);this.pickables.push(ray);
      }
    }
    this.root.add(earthstarRays);this.objects.set("earthstar_rays",earthstarRays);
    const stalkHeight=subtypeArch.stipeFactor||0;
    const stalk=this.register(new THREE.Mesh(
      new THREE.CylinderGeometry(.16,.20,Math.max(.08,stalkHeight),18),
      PUFF_PBR.wornExoperidium.clone()
    ),"gasteroid_stalk","Gasteroid stalk","macro","sterile_base");
    stalk.position.y=bodyY-bodyRadius-.04-stalkHeight*.5;
    stalk.visible=stalkHeight>0;


    const sporeMass=new THREE.Group();
    sporeMass.userData={id:"spore_mass",label:"Spore mass",category:"internal",parentId:"gleba",selectable:true,knowledgeId:"spore_mass",renderingModel:"instanced-powder-volume-v2"};
    const sporeCount={simplified:180,atlas:460,high:900}[realism]||460;
    const maturePowderFactor=stageId==="young"?.03:stageId==="mature"?.62:1;
    const depletion=devParams.spore_depletion??0;
    const powderSample=sampleEllipsoidVolume(
      Math.round(sporeCount*maturePowderFactor*(1-depletion*.48)),
      identitySeed+997,
      glebaRadius*.68,glebaRadius*.62,glebaRadius*.68
    );
    if(powderSample.pts.length){
      const pg=new THREE.IcosahedronGeometry(stageId==="old"?.017:.013,0);
      const pm=PUFF_PBR.driedSporeMass.clone();
      const inst=new THREE.InstancedMesh(pg,pm,powderSample.pts.length);
      inst.userData=sporeMass.userData;
      const d=new THREE.Object3D();
      powderSample.pts.forEach((p,i)=>{
        d.position.copy(p);
        const g=.48+powderSample.rng()*.92;
        d.scale.set(g,g*(.72+powderSample.rng()*.42),g*(.78+powderSample.rng()*.36));
        d.rotation.set(powderSample.rng()*Math.PI,powderSample.rng()*Math.PI,powderSample.rng()*Math.PI);
        d.updateMatrix();inst.setMatrixAt(i,d.matrix);
      });
      inst.instanceMatrix.needsUpdate=true;inst.castShadow=false;inst.receiveShadow=true;
      sporeMass.add(inst);this.pickables.push(inst);
    }
    sporeMass.position.y=bodyY;
    this.root.add(sporeMass);this.objects.set("spore_mass",sporeMass);this._rememberTransform(sporeMass);


    // Layered senescent peridium: continuous outer/inner shell with real wall thickness.
    const rupturePattern=this.variants.rupture_pattern||"intact";
    const ruptureMarginState=this.variants.rupture_margin||"clean";
    const collapseState=this.variants.collapse_state||"none";
    const openingByPattern={
      intact:.02,apical_ostiole:.18,small_apical_tear:.28,radial_cracking:.38,
      irregular_rupture:.52,collapsed_crown:.66,lateral_break:.48,fragmented_opening:.72
    };
    const opening=openingByPattern[rupturePattern]??.02;
    const shellGroup=new THREE.Group();
    shellGroup.userData={id:"senescent_shell",label:"Layered peridial shell",category:"macro",selectable:true,knowledgeId:"peridium"};

    const shellOuterMat=PUFF_PBR.wornExoperidium.clone();
    const shellInnerMat=PUFF_PBR.endoperidium.clone();
    const shellOuterRadius=bodyRadius*1.015;
    const wallFactor=subtypeArch.wallFactor||1;
    const shellInnerRadius=Math.max(bodyRadius*.72,shellOuterRadius-(.085*wallFactor));
    const outerGeo=createBiologicalPuffballGeometry({
      radius:shellOuterRadius,shape,stageId:"old",subtypeId,seed:identitySeed,
      segments:scaledSegments(68,this.realismTier,{min:44,max:92}),
      rings:scaledSegments(42,this.realismTier,{min:30,max:58}),
      opening,params:devParams
    });
    const innerGeo=createBiologicalPuffballGeometry({
      radius:shellInnerRadius,shape,stageId:"old",subtypeId,seed:identitySeed,
      segments:scaledSegments(64,this.realismTier,{min:40,max:86}),
      rings:scaledSegments(38,this.realismTier,{min:28,max:52}),
      opening:Math.min(.94,opening+.035),params:devParams
    });
    const outerShell=new THREE.Mesh(outerGeo,shellOuterMat);
    const innerShell=new THREE.Mesh(innerGeo,shellInnerMat);
    outerShell.position.y=bodyY;innerShell.position.y=bodyY;
    outerShell.scale.y=.95;innerShell.scale.y=.95;
    outerShell.userData=shellGroup.userData;innerShell.userData={...shellGroup.userData,id:"endoperidium",label:"Endoperidium",knowledgeId:"endoperidium"};
    shellGroup.add(outerShell,innerShell);this.pickables.push(outerShell,innerShell);
    this.root.add(shellGroup);this.objects.set("senescent_shell",shellGroup);

    const rimGroup=new THREE.Group();
    rimGroup.userData={id:"rupture_margin",label:"Rupture margin",category:"macro",selectable:true,knowledgeId:"rupture_margin"};
    const rimMat=PUFF_PBR.wornExoperidium.clone();
    const rimCount=rupturePattern==="intact"?0:rupturePattern==="apical_ostiole"?8:14;
    const curlMap={clean:0,slightly_torn:.06,ragged:.13,curled_out:.22,curled_in:-.18,frayed:.16};
    const curl=curlMap[ruptureMarginState]??0;
    for(let i=0;i<rimCount;i++){
      const a=i/rimCount*Math.PI*2;
      const rr=.22+opening*.72*(.86+.11*Math.sin(i*2.3));
      const seg=new THREE.Mesh(new THREE.BoxGeometry(.16+.05*((i%4)/3),.035,.075),rimMat.clone());
      seg.position.set(Math.cos(a)*rr,bodyY+1.03-opening*.38+((i%3)-1)*.025,Math.sin(a)*rr);
      seg.rotation.set(curl*Math.cos(a),-a,curl*Math.sin(a)+((i%2)?-.08:.06));
      seg.scale.y=1+.35*((i%5)/4);
      seg.userData=rimGroup.userData;
      rimGroup.add(seg);this.pickables.push(seg);
    }
    this.root.add(rimGroup);this.objects.set("rupture_margin",rimGroup);

    const channelMat=PUFF_PBR.driedSporeMass.clone();channelMat.side=THREE.DoubleSide;
    const channel=this.register(new THREE.Mesh(
      new THREE.CylinderGeometry(.12+opening*.16,.08+opening*.08,.22+opening*.24,20,1,true),
      channelMat
    ),"rupture_channel","Rupture / ostiolar channel","internal","apical_pore");
    channel.position.y=bodyY+1.00-opening*.20;

    const wornGroup=new THREE.Group();
    wornGroup.userData={id:"worn_exoperidium",label:"Worn exoperidium",category:"macro",selectable:true,knowledgeId:"worn_exoperidium"};
    const wornMat=PUFF_PBR.wornExoperidium.clone();
    for(let i=0;i<12;i++){
      const a=i*2.399963229728653;
      const patch=new THREE.Mesh(new THREE.CircleGeometry(.10+.04*(i%4),10),wornMat.clone());
      patch.position.set(Math.cos(a)*.92,bodyY+.18+((i%5)-2)*.28,Math.sin(a)*.92);
      patch.lookAt(new THREE.Vector3(0,bodyY,0));
      patch.rotateY(Math.PI);
      patch.userData=wornGroup.userData;
      wornGroup.add(patch);this.pickables.push(patch);
    }
    this.root.add(wornGroup);this.objects.set("worn_exoperidium",wornGroup);

    const collapsedProxy=new THREE.Group();
    collapsedProxy.userData={id:"collapsed_wall",label:"Collapsed peridial wall",category:"macro",selectable:true,knowledgeId:"collapsed_wall"};
    this.root.add(collapsedProxy);this.objects.set("collapsed_wall",collapsedProxy);

    // Old-stage interior realism continues below. The obsolete disconnected
    // panel shell has been removed; the continuous layered senescent shell above
    // is now the sole old-stage peridial architecture.

    const debris=new THREE.Group();
    debris.userData={id:"old_basal_debris",label:"Basal soil and organic debris",category:"ecology",selectable:true,knowledgeId:"basal_attachment"};
    const debrisMat=PUFF_PBR.organicDebris.clone();
    for(let i=0;i<18;i++){
      const a=i*2.15;
      const rr=.28+.30*((i%7)/6);
      const bit=new THREE.Mesh(
        i%3===0?new THREE.CylinderGeometry(.012,.018,.22+.09*(i%4),6):new THREE.IcosahedronGeometry(.035+.018*(i%4),0),
        debrisMat.clone()
      );
      bit.position.set(Math.cos(a)*rr,-.43+.06*(i%4),Math.sin(a)*rr);
      bit.rotation.set(i*.34,a,i*.19);
      bit.userData=debris.userData;
      debris.add(bit);this.pickables.push(bit);
    }
    this.root.add(debris);this.objects.set("old_basal_debris",debris);

    const exo=new THREE.Group();
    exo.userData={
      id:"exoperidium",label:"Exoperidium / surface ornamentation",category:"macro",selectable:true,
      knowledgeId:surface==="echinate"?"echinate":surface==="verrucose"?"verrucose":surface==="granular"?"granular":surface==="furfuraceous"?"furfuraceous":"glabrous",
      surfaceType:surface
    };

    const profile=PUFF_ORNAMENT_PROFILE[surface]||PUFF_ORNAMENT_PROFILE.glabrous;
    const requested=profile.counts[realism]||0;
    const peridialForAbrasion=this.variants.peridial_condition||"intact";
    const abrasion=abrasionState(surface,stageId,peridialForAbrasion);
    const retention=(profile.retention[stageId]??1)*abrasion.retentionMultiplier;
    const scaleByAge=(profile.scale[stageId]??1)*(1-abrasion.severity*.16);
    const target=Math.max(0,Math.round(requested*retention));
    const {
      points:ornamentPoints,clusterWeights:ornamentClusterWeights,bareWeights:ornamentBareWeights,
      rng:ornamentRng,diagnostics:ornamentSampling
    }=sampledPuffSurface(target,identitySeed+requested,{
      cluster:profile.cluster,barePatch:profile.barePatch,
      clusterCount:surface==="echinate"?4:surface==="verrucose"?4:surface==="granular"?3:surface==="furfuraceous"?5:2,
      bareCount:surface==="echinate"?3:surface==="verrucose"?2:surface==="granular"?2:surface==="furfuraceous"?4:1
    });

    const baseOrnamentMaterial=PUFF_PBR.youngPeridium.clone();
    baseOrnamentMaterial.roughness=surface==="glabrous"?.90:.96;
    if(surface==="furfuraceous")baseOrnamentMaterial.side=THREE.DoubleSide;

    const addInstancedOrnament=(id,label,geometry,count,filterFn,transformFn,material=baseOrnamentMaterial)=>{
      if(!count)return null;
      const inst=new THREE.InstancedMesh(geometry.clone(),material.clone(),count);
      inst.userData={...exo.userData,id:"exoperidium",label,knowledgeId:surface};
      inst.castShadow=realism==="high"&&stageId==="young";
      inst.receiveShadow=true;
      const dummy=new THREE.Object3D();
      const tint=new THREE.Color();
      let write=0;
      for(let i=0;i<ornamentPoints.length&&write<count;i++){
        if(filterFn&&!filterFn(i))continue;
        const n=ornamentPoints[i];
        const p=puffSurfacePoint(shape,n.x,n.y,n.z,bodyY,bodyRadius*1.01,{stageId,subtypeId,seed:identitySeed,params:devParams});
        dummy.position.copy(p);
        const localNormalAxis=surface==="furfuraceous"?new THREE.Vector3(0,0,1):new THREE.Vector3(0,1,0);
        dummy.quaternion.setFromUnitVectors(localNormalAxis,n.clone().normalize());
        dummy.rotation.z+=(ornamentRng()-.5)*.26;
        dummy.rotation.x+=(ornamentRng()-.5)*.12;
        dummy.scale.set(1,1,1);
        transformFn(dummy,i,n,ornamentRng);
        dummy.updateMatrix();
        inst.setMatrixAt(write,dummy.matrix);
        const value=.88+ornamentRng()*.18;
        tint.setRGB(value,value*.96,value*.84);
        inst.setColorAt(write,tint);
        write++;
      }
      inst.count=write;
      inst.instanceMatrix.needsUpdate=true;
      if(inst.instanceColor)inst.instanceColor.needsUpdate=true;
      exo.add(inst);this.pickables.push(inst);
      return inst;
    };

    if(surface==="echinate"&&target){
      const brokenFraction=profile.broken?.[stageId]??0;
      const breakRng=seededRng(identitySeed+911);
      const brokenMask=ornamentPoints.map((n,i)=>{
        const bare=ornamentBareWeights[i]||0;
        const clusterWeight=ornamentClusterWeights[i]||0;
        // Exposed sparse/bare-zone edges weather first; dense clusters preserve a little longer.
        const localRisk=THREE.MathUtils.clamp(brokenFraction+abrasion.severity*.34+bare*.22-clusterWeight*.07,0,1);
        return breakRng()<localRisk;
      });
      const brokenCount=brokenMask.filter(Boolean).length;
      const intactCount=Math.max(0,target-brokenCount);

      addInstancedOrnament("echinate_intact","Echinate exoperidial spines",ORNAMENT_GEOMETRY.echinate,intactCount,
        i=>!brokenMask[i],
        (o,i,n,rng)=>{
          const clusterWeight=ornamentClusterWeights[i]||0;
          const bare=ornamentBareWeights[i]||0;
          const height=(.62+rng()*.66)*(1+clusterWeight*.13-bare*.08)*scaleByAge;
          const width=(.70+rng()*.58)*(1+clusterWeight*.06);
          o.scale.set(width,height,width*(.92+rng()*.16));
          // Slight biologically plausible lean rather than perfectly radial needles.
          o.rotation.x+=(rng()-.5)*(.16+bare*.12);
          o.rotation.z+=(rng()-.5)*(.22+bare*.15);
          // Seat the flared basal skirt into the exoperidial wall.
          o.position.addScaledVector(n,-.016);
        });

      addInstancedOrnament("echinate_broken","Broken echinate spine remnants",ORNAMENT_GEOMETRY.echinateBroken,brokenCount,
        i=>brokenMask[i],
        (o,i,n,rng)=>{
          const bare=ornamentBareWeights[i]||0;
          const height=(.40+rng()*.46)*Math.max(.30,scaleByAge)*(1-bare*.16);
          const width=.80+rng()*.52;
          o.scale.set(width,height,width*(.90+rng()*.20));
          o.rotation.x+=(rng()-.5)*.32;o.rotation.z+=(rng()-.5)*.36;
          o.position.addScaledVector(n,-.018);
        });

      exo.userData.echinateStats={
        intact:intactCount,broken:brokenCount,brokenFraction:target?brokenCount/target:0,
        densityClass:requested>=1200?"very high":requested>=600?"high":"moderate",
        distribution:"stochastic clustered field with sparse abrasion zones",
        baseIntegration:"flared basal skirt embedded into exoperidium"
      };
    }else if(surface==="verrucose"&&target){
      const flattenFraction=THREE.MathUtils.clamp((stageId==="young"?.12:stageId==="mature"?.42:.72)+abrasion.severity*.28,0,.94);
      const flattenedMask=ornamentPoints.map((n,i)=>{
        const bare=ornamentBareWeights[i]||0;
        const clusterWeight=ornamentClusterWeights[i]||0;
        const local=THREE.MathUtils.clamp(flattenFraction+bare*.24-clusterWeight*.08,0,1);
        return ornamentRng()<local;
      });
      const flattenedCount=flattenedMask.filter(Boolean).length;
      const raisedCount=target-flattenedCount;

      addInstancedOrnament("verrucose_raised","Raised verrucose exoperidial warts",ORNAMENT_GEOMETRY.verrucose,raisedCount,
        i=>!flattenedMask[i],
        (o,i,n,rng)=>{
          const clusterWeight=ornamentClusterWeights[i]||0;
          const broad=(.70+rng()*.74)*(1+clusterWeight*.10);
          const relief=(.44+rng()*.54)*scaleByAge;
          o.scale.set(broad,relief,broad*(.78+rng()*.34));
          o.rotation.y+=rng()*Math.PI*2;
          o.position.addScaledVector(n,-.050);
        });

      addInstancedOrnament("verrucose_flattened","Flattened / abraded verrucose remnants",ORNAMENT_GEOMETRY.verrucoseFlattened,flattenedCount,
        i=>flattenedMask[i],
        (o,i,n,rng)=>{
          const broad=(.78+rng()*.70);
          const relief=(.28+rng()*.34)*Math.max(.32,scaleByAge);
          o.scale.set(broad,relief,broad*(.82+rng()*.26));
          o.rotation.y+=rng()*Math.PI*2;
          o.position.addScaledVector(n,-.055);
        });

      exo.userData.verrucoseStats={
        raised:raisedCount,flattened:flattenedCount,
        flattenedFraction:target?flattenedCount/target:0,
        distribution:"broad-base clustered wart field with local coalescence and abrasion",
        baseIntegration:"deep broad-base embedding into exoperidium"
      };

    }else if(surface==="granular"&&target){
      const coarseFraction=Math.max(.015,(stageId==="young"?.13:stageId==="mature"?.08:.04)*(1-abrasion.severity*.72));
      const coarseMask=ornamentPoints.map((n,i)=>{
        const clusterWeight=ornamentClusterWeights[i]||0;
        return ornamentRng()<THREE.MathUtils.clamp(coarseFraction+clusterWeight*.05,0,.24);
      });
      const coarseCount=coarseMask.filter(Boolean).length;
      const fineCount=target-coarseCount;

      addInstancedOrnament("granular_fine","Fine granular exoperidial grains",ORNAMENT_GEOMETRY.granular,fineCount,
        i=>!coarseMask[i],
        (o,i,n,rng)=>{
          const clusterWeight=ornamentClusterWeights[i]||0;
          const g=(.50+rng()*.62)*(1+clusterWeight*.06)*scaleByAge;
          o.scale.set(g,g*(.32+rng()*.26),g*(.82+rng()*.22));
          o.rotation.y+=rng()*Math.PI*2;
          o.position.addScaledVector(n,-.016);
        });

      addInstancedOrnament("granular_coarse","Occasional coarse granular exoperidial grains",ORNAMENT_GEOMETRY.granularCoarse,coarseCount,
        i=>coarseMask[i],
        (o,i,n,rng)=>{
          const g=(.55+rng()*.58)*scaleByAge;
          o.scale.set(g,g*(.34+rng()*.24),g*(.82+rng()*.22));
          o.rotation.y+=rng()*Math.PI*2;
          o.position.addScaledVector(n,-.019);
        });

      exo.userData.granularStats={
        fine:fineCount,coarse:coarseCount,
        grainScale:"fine low-relief field distinct from verrucose warts",
        distribution:"dense micro-granular coverage with subtle local density variation",
        baseIntegration:"shallow embedding into exoperidial micro-relief"
      };

    }else if(surface==="furfuraceous"&&target){
      const curledFraction=THREE.MathUtils.clamp((stageId==="young"?.22:stageId==="mature"?.46:.70)+abrasion.severity*.22,0,.94);
      const curledMask=ornamentPoints.map((n,i)=>{
        const bare=ornamentBareWeights[i]||0;
        const local=THREE.MathUtils.clamp(curledFraction+bare*.18,0,.90);
        return ornamentRng()<local;
      });
      const curledCount=curledMask.filter(Boolean).length;
      const flatCount=target-curledCount;

      addInstancedOrnament("furfuraceous_flat","Adherent furfuraceous flakes",ORNAMENT_GEOMETRY.furfuraceous,flatCount,
        i=>!curledMask[i],
        (o,i,n,rng)=>{
          const g=(.58+rng()*.72)*scaleByAge;
          o.scale.set(g*(.76+rng()*.42),g,g);
          o.rotation.y+=rng()*Math.PI*2;
          o.rotation.x+=(rng()-.5)*.24;
          o.rotation.z+=(rng()-.5)*.48;
          o.position.addScaledVector(n,.004+rng()*.008);
        });

      addInstancedOrnament("furfuraceous_curled","Lifted / weathered furfuraceous flakes",ORNAMENT_GEOMETRY.furfuraceousCurled,curledCount,
        i=>curledMask[i],
        (o,i,n,rng)=>{
          const g=(.52+rng()*.70)*Math.max(.34,scaleByAge);
          o.scale.set(g*(.78+rng()*.50),g,g);
          o.rotation.y+=rng()*Math.PI*2;
          o.rotation.x+=(rng()-.5)*.46;
          o.rotation.z+=(rng()-.5)*.72;
          o.position.addScaledVector(n,.010+rng()*.018);
        });

      exo.userData.furfuraceousStats={
        adherent:flatCount,curled:curledCount,
        curledFraction:target?curledCount/target:0,
        distribution:"patchy bran-like flake field with multiple sparse loss zones",
        orientation:"tangential flakes with progressively lifted edges"
      };

    }else if(surface==="glabrous"){
      // Glabrous is intentionally geometry-free at the macroscopic level.
      // PBR micro-bump and body irregularity carry the biological surface realism.
      exo.userData.label="Glabrous exoperidium";
    }

    // Final integration layer: expose irregular worn exoperidial patches where
    // ornament has been lost. This is intentionally separate from ornament meshes
    // so abrasion reads as tissue loss rather than merely fewer instances.
    const scarBase={simplified:7,atlas:18,high:34}[realism]||18;
    const scarCount=Math.round(scarBase*abrasion.severity*(surface==="glabrous"?.45:1));
    let abrasionScars=null;
    if(scarCount>0){
      const scarSample=sampledPuffSurface(scarCount,1709+requested+(stageId==="old"?97:stageId==="mature"?53:19),{
        cluster:.48,barePatch:.06,clusterCount:3,bareCount:1
      });
      abrasionScars=new THREE.InstancedMesh(
        ORNAMENT_GEOMETRY.abrasionScar.clone(),
        PUFF_PBR.wornExoperidium.clone(),
        scarSample.points.length
      );
      abrasionScars.userData={
        id:"worn_exoperidium",label:"Abraded exoperidial patches",category:"macro",
        selectable:true,knowledgeId:"worn_exoperidium"
      };
      const dummy=new THREE.Object3D();
      for(let i=0;i<scarSample.points.length;i++){
        const n=scarSample.points[i];
        const p=puffSurfacePoint(shape,n.x,n.y,n.z,bodyY,bodyRadius*1.008,{stageId,subtypeId,seed:identitySeed,params:devParams});
        dummy.position.copy(p).addScaledVector(n,.003);
        dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n.clone().normalize());
        dummy.rotation.z=scarSample.rng()*Math.PI*2;
        const g=.62+scarSample.rng()*.95;
        dummy.scale.set(g*(.80+scarSample.rng()*.42),g*(.62+scarSample.rng()*.38),1);
        dummy.updateMatrix();
        abrasionScars.setMatrixAt(i,dummy.matrix);
      }
      abrasionScars.instanceMatrix.needsUpdate=true;
      exo.add(abrasionScars);this.pickables.push(abrasionScars);
    }

    exo.userData.ornamentStats={
      requested,target,
      rendered:exo.children.reduce((n,c)=>n+(c.count||0),0),
      ornamentRendered:exo.children.filter(c=>c!==abrasionScars).reduce((n,c)=>n+(c.count||0),0),
      abrasionScars:abrasionScars?.count||0,
      abrasionSeverity:abrasion.severity,
      retentionMultiplier:abrasion.retentionMultiplier,
      peridialCondition:peridialForAbrasion,
      drawMeshes:exo.children.length,stageId,surface,subtypeId,subtypeLabel:subtype.label,
      sampling:ornamentSampling,
      echinate:exo.userData.echinateStats||null,
      verrucose:exo.userData.verrucoseStats||null,
      granular:exo.userData.granularStats||null,
      furfuraceous:exo.userData.furfuraceousStats||null,
      generator:surface==="echinate"?"irregular spine field":surface==="verrucose"?"embedded broad-base wart field":surface==="granular"?"dense low-relief grain field":surface==="furfuraceous"?"tangential scurfy flake field":"PBR micro-relief only"
    };
    this.root.add(exo);this.objects.set("exoperidium",exo);

    const marks=new THREE.Group();
    marks.userData={id:"peridial_marks",label:"Peridial cracks / abrasion",category:"macro",selectable:true,knowledgeId:"peridium"};
    const markMat=PUFF_PBR.wornExoperidium.clone();
    for(let i=0;i<18;i++){
      const a=i/18*Math.PI*2;
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.20+.03*(i%4),.009,5,18,Math.PI*.58),markMat.clone());
      ring.position.set(Math.cos(a)*.72,bodyY+.10+((i%5)-2)*.25,Math.sin(a)*.72);
      ring.rotation.set(Math.PI/2,(i%4)*.42,a);
      ring.visible=false;ring.userData=marks.userData;
      marks.add(ring);this.pickables.push(ring);
    }
    this.root.add(marks);this.objects.set("peridial_marks",marks);
  }

  build_cup(){
    const cup=this.register(new THREE.Mesh(new THREE.SphereGeometry(1.25,scaledSegments(48,this.realismTier,{min:28,max:64}),scaledSegments(24,this.realismTier,{min:16,max:34}),0,Math.PI*2,Math.PI/2.2,Math.PI/2.2),MATERIALS.cap.clone()),"apothecium","Apothecium","macro");cup.scale.y=.65;cup.position.y=1.15;
    const hym=this.register(new THREE.Mesh(new THREE.CircleGeometry(.92,scaledSegments(48,this.realismTier,{min:28,max:64})),MATERIALS.gill.clone()),"hymenophore","Inner hymenial surface","fertile");hym.rotation.x=-Math.PI/2;hym.position.y=1.37;
    const base=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.18,.3,.7,28),MATERIALS.stipe.clone()),"stipe","Short stipe / base","macro");base.position.y=.15;
    const exc=this.register(new THREE.Mesh(new THREE.TorusGeometry(1.02,.12,12,48),MATERIALS.flesh.clone()),"excipulum","Excipulum","internal");exc.rotation.x=Math.PI/2;exc.position.y=1.37;
  }

  build_jelly(){
    const group=new THREE.Group();group.userData={id:"lobes",label:"Gelatinous lobes",category:"macro",selectable:true};
    for(let i=0;i<6;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.65,scaledSegments(28,this.realismTier,{min:18,max:40}),scaledSegments(18,this.realismTier,{min:12,max:26})),MATERIALS.jelly.clone());l.scale.set(1,.55,.75);l.position.set(Math.cos(i)*.55,.45+Math.sin(i*.8)*.18,Math.sin(i)*.45);l.rotation.set(i*.17,i*.31,0);l.userData=group.userData;group.add(l);this.pickables.push(l);}
    this.root.add(group);this.objects.set("lobes",group);this.objects.set("hymenophore",group);
    const att=this.register(new THREE.Mesh(new THREE.CylinderGeometry(.26,.4,.45,24),MATERIALS.jelly.clone()),"attachment","Attachment base","macro");att.position.y=-.35;
  }

  build_crust(){
    const wood=this.register(new THREE.Mesh(new THREE.BoxGeometry(4,.7,2.4),MATERIALS.wood.clone()),"substrate","Woody substrate","ecology");wood.position.y=-.25;
    const crust=this.register(new THREE.Mesh(new THREE.BoxGeometry(3.6,.08,2.05),MATERIALS.crust.clone()),"hymenophore","Exposed fertile surface","fertile");crust.position.y=.14;
    const ctx=this.register(new THREE.Mesh(new THREE.BoxGeometry(3.65,.12,2.1),MATERIALS.flesh.clone()),"context","Subicular context","internal");ctx.position.y=.04;
    const margin=this.register(new THREE.Mesh(new THREE.TorusGeometry(1.45,.06,scaledSegments(10,this.realismTier,{min:8,max:14}),scaledSegments(64,this.realismTier,{min:36,max:84})),MATERIALS.flesh.clone()),"margin","Growing margin","macro");margin.rotation.x=Math.PI/2;margin.scale.z=.65;margin.position.y=.2;
  }
}