// Cursor anatomy inspector for photo-informed, non-diagnostic fungal morphology.
// Raycaster uses per-mesh tags plus intersection location for anatomical subregions.
const DATA={
 pileus:["Pileus","PY-lee-us","The cap of the basidioma. It protects the developing hymenophore.","Inspect cap color, shape, ornamentation, and expansion with age."],
 pileusMargin:["Pileus margin","PY-lee-us MAR-jin","The outer cap edge where cap tissue transitions toward the gill-bearing surface.","Margin curvature, tears, veil remnants and inrolling are informative."],
 pileusDisc:["Pileus disc","PY-lee-us disk","Central region of the cap, frequently retaining a raised profile.","Compare central pigmentation and flattening across age stages."],
 hymenophore:["Hymenophore","HY-men-oh-for","The complete spore-producing surface; here it is formed by gills beneath the pileus.","Gill type, density, attachment and color development can assist identification."],
 lamellae:["Lamellae","luh-MEL-ee","Individual blade-shaped gills radiating beneath the cap; the hymenium lines their faces.","Their spacing and change from yellowish to rusty-brown matter; never infer potency."],
 attachment:["Gill attachment zone","gil uh-TACH-ment","The inner junction where the lamellae approach and meet the stipe.","Examine the modeled attachment in underside view; confirmation requires direct examination."],
 stipe:["Stipe","STYPE","The stem that supports the pileus and hymenophore.","Observe color, surface fibers, length, thickness and veil remnants."],
 stipeBase:["Stipe base","STYPE bays","The basal portion of the stem near the substrate, sometimes broadened.","Check basal form and attachment to decayed buried wood or soil; the actual substrate is unverified."],
 upperStipe:["Upper stipe","UP-er STYPE","The stipe region directly below the cap and ring zone.","Check gill junction, partial veil and surface fibrils."],
 annulus:["Annulus","AN-yoo-lus","A ring or annular zone left by the partial veil as the cap expands.","Position, persistence, damage and rusty spore deposits may change with maturity."],
 partialVeil:["Partial veil remnant","PAR-shul vayl","Torn tissue that originally sheltered the immature hymenophore.","Look for attached fragments or a developing annular zone."],
 substrate:["Substrate / habitat","SUB-strayt","Ground or organic matter surrounding the fruiting bodies in this reconstruction.","Appearance of leaf litter does not establish the nutritional substrate or host tree."]
};
export function attachAnatomyInspector({THREE,canvas,camera,controls,scene,models,ui}){
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 let hovered=null,locked=null,highlighted=null,originalMaterial=null,enhancedMaterial=null,showLabels=true;
 const label=ui.label,inspector=ui.inspector,title=ui.title,pronunciation=ui.pronunciation,description=ui.description,notes=ui.notes,status=ui.status;
 function tag(hit){
  if(!hit||!hit.object?.userData?.anatomy)return null;
  const obj=hit.object,kind=obj.userData.anatomy;
  let key=kind;
  if(kind==="pileus"){
   const pos=obj.worldToLocal(hit.point.clone()),radius=obj.userData.capRadius||1,ratio=Math.hypot(pos.x,pos.z)/radius;
   key=ratio>.87?"pileusMargin":ratio<.30?"pileusDisc":"pileus";
  }else if(kind==="stipe"){
   const pos=obj.worldToLocal(hit.point.clone()),height=obj.userData.stipeHeight||1;
   const normalized=(pos.y+height*.5)/height;
   key=normalized<.22?"stipeBase":normalized>.77?"upperStipe":"stipe";
  }else if(kind==="lamellae"){
   const local=obj.parent.worldToLocal(hit.point.clone()),radius=Math.hypot(local.x,local.z);
   key=radius<(obj.userData.innerRadius||.13)*1.65?"attachment":"lamellae";
  }
  return {key,object:obj};
 }
 function find(event){
  const rect=canvas.getBoundingClientRect();
  if(!rect.width||!rect.height)return null;
  pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
  raycaster.setFromCamera(pointer,camera);
  for(const hit of raycaster.intersectObjects(models,true)){
   if(!hit.object.visible||!hit.object.parent?.visible)continue;
   let obj=hit.object;let hidden=false;
   while(obj){if(!obj.visible){hidden=true;break}obj=obj.parent}
   if(hidden)continue;
   const found=tag(hit);if(found)return found;
  }
  return null;
 }
 function resetHighlight(){
  if(highlighted&&originalMaterial){highlighted.material=originalMaterial;enhancedMaterial?.dispose()}
  highlighted=null;originalMaterial=null;enhancedMaterial=null;
 }
 function highlight(item){
  if(item?.object===highlighted)return;
  resetHighlight();
  if(!item?.object?.isMesh)return;
  highlighted=item.object;originalMaterial=highlighted.material;
  enhancedMaterial=originalMaterial.clone();
  if("emissive" in enhancedMaterial){enhancedMaterial.emissive.set("#d29e3e");enhancedMaterial.emissiveIntensity=.45}
  highlighted.material=enhancedMaterial;
 }
 function display(item){
  const selected=locked||item;
  if(!selected){title.textContent="Move your cursor over a specimen structure";pronunciation.textContent="";description.textContent="Hover to identify pileus, margin, gills, attachment, stipe, base and veil.";notes.textContent="Click to lock a structure; click empty space or Reset selection to clear.";status.textContent="No anatomical selection";highlight(null);return}
  const data=DATA[selected.key]||DATA.pileus;
  title.textContent=data[0];pronunciation.textContent="Pronunciation: "+data[1];
  description.textContent=data[2];notes.textContent=data[3];
  status.textContent=locked?"Selection locked":"Hover identification";
  highlight(selected);
 }
 function move(e){
  if(locked)return;
  hovered=find(e);display(hovered);
  if(!showLabels||!hovered){label.hidden=true;return}
  label.textContent=DATA[hovered.key][0];
  const rect=canvas.getBoundingClientRect();
  label.style.left=Math.min(e.clientX-rect.left+14,rect.width-170)+"px";
  label.style.top=Math.max(8,e.clientY-rect.top-36)+"px";label.hidden=false;
 }
 function click(e){
  const item=find(e);
  locked=item;hovered=item;label.hidden=true;display(item);
 }
 function clear(){locked=null;hovered=null;label.hidden=true;display(null)}
 function leave(){if(!locked){hovered=null;display(null)}label.hidden=true}
 function toggleLabels(){showLabels=!showLabels;ui.labelsButton.setAttribute("aria-pressed",String(showLabels));label.hidden=true}
 function speak(){if(!("speechSynthesis" in window))return;const key=(locked||hovered)?.key;if(!key)return;const data=DATA[key];window.speechSynthesis.cancel();const msg=new SpeechSynthesisUtterance(data[0]+". "+data[2]+". "+data[3]);msg.rate=.86;window.speechSynthesis.speak(msg)}
 canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerleave",leave);canvas.addEventListener("click",click);
 ui.clearButton.addEventListener("click",clear);ui.labelsButton.addEventListener("click",toggleLabels);ui.speakButton.addEventListener("click",speak);
 display(null);
 return {clear,dispose(){canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerleave",leave);canvas.removeEventListener("click",click);resetHighlight();window.speechSynthesis?.cancel()}};
}
