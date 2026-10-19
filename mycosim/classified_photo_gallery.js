// Private research photo archive: files stay in this browser using IndexedDB.
// This is a convenience gallery, not a substitute for authenticated server storage.
const DB_NAME="mycosim-classified-photos",STORE="images";
const expected=Array.from({length:60},(_,i)=>"IMG_"+(1576+i)+".JPG").concat(Array.from({length:11},(_,i)=>"Gymnopilus Junonius Spore Micro  ("+(i+1)+").png"));
const labelFor=n=>{
 if(/Gymnopilus Junonius Spore Micro\s*\(\d+\)\.png$/i.test(n))return "Microscopy / spore studies";
 const i=Number((n.match(/IMG_(\d+)/i)||[])[1]||0);
 if(i>=1576&&i<=1610)return "Field colony / habitat";
 if(i>=1611&&i<=1624)return "Cap / gill comparison";
 if(i>=1625&&i<=1635)return "Gills / veil / stipe";
 return "Unassigned";
};
function db(){return new Promise((resolve,reject)=>{const open=indexedDB.open(DB_NAME,1);open.onupgradeneeded=()=>{if(!open.result.objectStoreNames.contains(STORE))open.result.createObjectStore(STORE,{keyPath:"name"})};open.onsuccess=()=>resolve(open.result);open.onerror=()=>reject(open.error)})}
export async function getClassifiedLocalPhotoRecords(){return await listFiles()}
async function listFiles(){const d=await db();try{return await new Promise((resolve,reject)=>{const tx=d.transaction(STORE,"readonly");const rq=tx.objectStore(STORE).getAll();rq.onsuccess=()=>resolve(rq.result);rq.onerror=()=>reject(rq.error)})}finally{d.close()}}
async function saveFiles(files){const d=await db();try{await new Promise((resolve,reject)=>{const tx=d.transaction(STORE,"readwrite");const os=tx.objectStore(STORE);for(const f of files)os.put(f);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}finally{d.close()}}
async function expandStoredZip(file){
 const buffer=await file.arrayBuffer(),view=new DataView(buffer),bytes=new Uint8Array(buffer);
 const decoder=new TextDecoder(),limit=buffer.byteLength,files=[];
 // Parse the central directory instead of local headers: compressed ZIPs may use
 // data descriptors, leaving local-header sizes at zero.
 let eocd=-1;
 for(let p=limit-22;p>=Math.max(0,limit-65557);p--){
   if(view.getUint32(p,true)===0x06054b50){eocd=p;break}
 }
 if(eocd<0)throw Error("Invalid ZIP: central directory not found");
 const total=view.getUint16(eocd+10,true);
 const directory=view.getUint32(eocd+16,true);
 if(total>1000)throw Error("Archive contains too many entries");
 if(directory>=limit)throw Error("Invalid ZIP directory offset");
 let offset=directory;
 for(let i=0;i<total;i++){
   if(offset+46>limit||view.getUint32(offset,true)!==0x02014b50)throw Error("Invalid ZIP directory entry");
   const flags=view.getUint16(offset+8,true),compression=view.getUint16(offset+10,true);
   const compressed=view.getUint32(offset+20,true),uncompressed=view.getUint32(offset+24,true);
   const nameLen=view.getUint16(offset+28,true),extraLen=view.getUint16(offset+30,true),commentLen=view.getUint16(offset+32,true);
   const local=view.getUint32(offset+42,true);
   const name=decoder.decode(bytes.subarray(offset+46,offset+46+nameLen));
   offset+=46+nameLen+extraLen+commentLen;
   if(!/\\.(jpe?g|png|webp)$/i.test(name)||name.includes("..")||name.startsWith("/")||name.endsWith("/"))continue;
   if(flags&1)throw Error("Encrypted ZIP entries are not supported");
   if(uncompressed>20*1024*1024)throw Error("Single image exceeds 20 MB: "+name);
   if(local+30>limit||view.getUint32(local,true)!==0x04034b50)throw Error("Invalid local ZIP entry");
   const localNameLen=view.getUint16(local+26,true),localExtraLen=view.getUint16(local+28,true);
   const begin=local+30+localNameLen+localExtraLen,finish=begin+compressed;
   if(finish>limit)throw Error("Truncated ZIP image: "+name);
   let payload=bytes.slice(begin,finish);
   if(compression===8){
     if(typeof DecompressionStream==="undefined")throw Error("This browser does not support compressed ZIP import");
     const stream=new Blob([payload]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
     payload=new Uint8Array(await new Response(stream).arrayBuffer());
   }else if(compression!==0)throw Error("Unsupported compression method for "+name);
   if(payload.length!==uncompressed)throw Error("Unexpected decompressed size for "+name);
   const basename=name.split("/").pop();
   files.push(new File([payload],basename,{type:/\\.png$/i.test(name)?"image/png":/\\.webp$/i.test(name)?"image/webp":"image/jpeg"}));
 }
 if(!files.length)throw Error("No compatible photos found in ZIP");
 return files;
}
export async function setupClassifiedPhotoGallery(container){
 if(container.dataset.initialized==="yes")return;
 container.dataset.initialized="yes";
 const input=container.querySelector("[data-photo-input]"),grid=container.querySelector("[data-photo-grid]"),status=container.querySelector("[data-photo-status]"),search=container.querySelector("[data-photo-search]"),filter=container.querySelector("[data-photo-filter]"),viewer=container.querySelector("[data-photo-viewer]"),clear=container.querySelector("[data-photo-clear]");
 let all=[],previews=[];
 function cleanup(){for(const url of previews)URL.revokeObjectURL(url);previews=[]}

 let activeIndex=-1;
 function showLarge(record){
  let index=all.findIndex(x=>x.name===record.name);if(index<0)return;
  activeIndex=index;
  viewer.replaceChildren();viewer.classList.add("specimen-lightbox");
  const top=document.createElement("div");top.className="specimen-lightbox-top";
  const badge=document.createElement("span");badge.textContent="GYM JUNO • ORIGINAL PHOTOGRAPH";
  const close=document.createElement("button");close.type="button";close.className="specimen-lightbox-close";close.setAttribute("aria-label","Close specimen photograph");close.textContent="×";
  close.addEventListener("click",()=>{viewer.hidden=true;activeIndex=-1});
  top.append(badge,close);
  const img=document.createElement("img");const url=URL.createObjectURL(record.blob);previews.push(url);img.src=url;img.alt=record.name+" original photographic record";img.className="specimen-lightbox-image";
  const footer=document.createElement("div");footer.className="specimen-lightbox-footer";
  const meta=document.createElement("div");const heading=document.createElement("strong");heading.textContent=record.name;const caption=document.createElement("p");caption.textContent=record.category+" · Image "+(index+1)+" of "+all.length+" · Provisional specimen identification";meta.append(heading,caption);
  const actions=document.createElement("div");actions.className="specimen-lightbox-controls";
  for(const [label,step] of [["← Previous",-1],["Next →",1]]){
   const b=document.createElement("button");b.type="button";b.textContent=label;b.addEventListener("click",()=>showLarge(all[(activeIndex+step+all.length)%all.length]));actions.append(b)
  }
  footer.append(meta,actions);viewer.append(top,img,footer);viewer.hidden=false;
  viewer.scrollIntoView({behavior:"smooth",block:"center"});
 }
 viewer.setAttribute("tabindex","-1");
 viewer.addEventListener("keydown",event=>{
  if(viewer.hidden||activeIndex<0)return;
  if(event.key==="Escape"){viewer.hidden=true;activeIndex=-1}
  else if(event.key==="ArrowLeft"){showLarge(all[(activeIndex-1+all.length)%all.length]);event.preventDefault()}
  else if(event.key==="ArrowRight"){showLarge(all[(activeIndex+1)%all.length]);event.preventDefault()}
 });

 function render(){
  cleanup();grid.replaceChildren();
  const term=search.value.trim().toLowerCase(),cat=filter.value;
  const selected=all.filter(r=>(!term||r.name.toLowerCase().includes(term)||r.category.toLowerCase().includes(term))&&(!cat||r.category===cat));
  status.textContent=all.length+" original photograph(s) available on this computer · "+selected.length+" currently displayed";
  if(!all.length){
    const empty=document.createElement("div");empty.className="specimen-gallery-empty";
    const kicker=document.createElement("span");kicker.textContent="PHOTO ARCHIVE · AWAITING ORIGINALS";
    const h=document.createElement("h4");h.textContent="Your Gym Juno photographs are not on this website yet.";
    const p=document.createElement("p");p.textContent="The research dossier and gallery are deployed, but the 71 original image files are not hosted remotely. You can load the original-photo ZIP here once to view a full specimen collection on this computer.";
    const button=document.createElement("button");button.type="button";button.textContent="Load original specimen photographs";button.addEventListener("click",()=>input.click());
    empty.append(kicker,h,p,button);grid.append(empty);return
  }
  if(!selected.length){const p=document.createElement("p");p.textContent="No photographs match this filter. Try All photographs.";grid.append(p);return}
  for(const item of selected){
    const button=document.createElement("button");button.type="button";button.className="photo-tile specimen-gallery-tile";
    const figure=document.createElement("figure");figure.className="specimen-gallery-figure";
    const image=document.createElement("img");const url=URL.createObjectURL(item.blob);previews.push(url);image.src=url;image.loading="lazy";image.alt=item.name+" original specimen photograph";
    const meta=document.createElement("figcaption");const title=document.createElement("strong");title.textContent=item.name;const sub=document.createElement("span");sub.textContent=item.category;meta.append(title,sub);
    figure.append(image,meta);button.append(figure);button.addEventListener("click",()=>showLarge(item));grid.append(button);
  }
 }
 async function refresh(){all=(await listFiles()).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));render()}
 input.addEventListener("change",async()=>{
  const chosen=Array.from(input.files||[]);let files=chosen.filter(f=>/\.(jpe?g|png|webp)$/i.test(f.name));
  try{for(const file of chosen.filter(f=>/\.zip$/i.test(f.name)))files.push(...await expandStoredZip(file))}catch(error){status.textContent="ZIP import failed: "+error.message;return}
  if(!files.length){status.textContent="Choose the specimen photographs (IMG_1576.JPG through IMG_1635.JPG) or the supplied original-photo ZIP.";return}
  input.disabled=true;status.textContent="Storing "+files.length+" photos on this device...";
  try{const records=files.map(f=>({name:f.name,category:labelFor(f.name),blob:f,modified:Date.now()}));await saveFiles(records);await refresh()}catch(e){status.textContent="Local archive error: "+e.message}finally{input.disabled=false;input.value=""}
 });
 search.addEventListener("input",render);filter.addEventListener("change",render);
 clear.addEventListener("click",async()=>{if(!confirm("Delete photos saved by this MycoSim gallery on this device?"))return;const d=await db();await new Promise((resolve,reject)=>{const tx=d.transaction(STORE,"readwrite");tx.objectStore(STORE).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});d.close();viewer.hidden=true;viewer.replaceChildren();await refresh()});
 await refresh();
}
