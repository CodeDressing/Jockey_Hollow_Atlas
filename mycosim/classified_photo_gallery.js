// Private research photo archive: files stay in this browser using IndexedDB.
// This is a convenience gallery, not a substitute for authenticated server storage.
const DB_NAME="mycosim-classified-photos",STORE="images";
const expected=Array.from({length:60},(_,i)=>"IMG_"+(1576+i)+".JPG");
const labelFor=n=>{
 const i=Number((n.match(/IMG_(\d+)/i)||[])[1]||0);
 if(i>=1576&&i<=1610)return "Field colony / habitat";
 if(i>=1611&&i<=1624)return "Cap / gill comparison";
 if(i>=1625&&i<=1635)return "Gills / veil / stipe";
 return "Unassigned";
};
function db(){return new Promise((resolve,reject)=>{const open=indexedDB.open(DB_NAME,1);open.onupgradeneeded=()=>{if(!open.result.objectStoreNames.contains(STORE))open.result.createObjectStore(STORE,{keyPath:"name"})};open.onsuccess=()=>resolve(open.result);open.onerror=()=>reject(open.error)})}
async function listFiles(){const d=await db();try{return await new Promise((resolve,reject)=>{const tx=d.transaction(STORE,"readonly");const rq=tx.objectStore(STORE).getAll();rq.onsuccess=()=>resolve(rq.result);rq.onerror=()=>reject(rq.error)})}finally{d.close()}}
async function saveFiles(files){const d=await db();try{await new Promise((resolve,reject)=>{const tx=d.transaction(STORE,"readwrite");const os=tx.objectStore(STORE);for(const f of files)os.put(f);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}finally{d.close()}}
async function expandStoredZip(file){
 const buffer=await file.arrayBuffer(),view=new DataView(buffer),bytes=new Uint8Array(buffer),files=[];
 const decoder=new TextDecoder(),limit=buffer.byteLength;let offset=0;
 while(offset+30<=limit&&view.getUint32(offset,true)===0x04034b50){
  const flags=view.getUint16(offset+6,true),compression=view.getUint16(offset+8,true);
  const size=view.getUint32(offset+18,true),nameLen=view.getUint16(offset+26,true),extraLen=view.getUint16(offset+28,true);
  if(flags&8||compression!==0)throw Error("This archive must contain uncompressed ZIP entries. Use the MycoSim photo ZIP provided in chat.");
  const name=decoder.decode(bytes.subarray(offset+30,offset+30+nameLen));
  const begin=offset+30+nameLen+extraLen,end=begin+size;
  if(end>limit)throw Error("Invalid ZIP entry length");
  if(/\.(jpe?g|png|webp)$/i.test(name)&&!name.includes("..")){
   files.push(new File([bytes.slice(begin,end)],name.split("/").pop(),{type:/\.png$/i.test(name)?"image/png":"image/jpeg"}));
  }
  offset=end;
 }
 if(!files.length)throw Error("No compatible images found in archive");
 return files;
}
export async function setupClassifiedPhotoGallery(container){
 if(container.dataset.initialized==="yes")return;
 container.dataset.initialized="yes";
 const input=container.querySelector("[data-photo-input]"),grid=container.querySelector("[data-photo-grid]"),status=container.querySelector("[data-photo-status]"),search=container.querySelector("[data-photo-search]"),filter=container.querySelector("[data-photo-filter]"),viewer=container.querySelector("[data-photo-viewer]"),clear=container.querySelector("[data-photo-clear]");
 let all=[],previews=[];
 function cleanup(){for(const url of previews)URL.revokeObjectURL(url);previews=[]}
 function showLarge(record){viewer.replaceChildren();const figure=document.createElement("figure");const img=document.createElement("img");const url=URL.createObjectURL(record.blob);previews.push(url);img.src=url;img.alt=record.name+" full photograph";img.style.cssText="max-width:100%;max-height:65vh;object-fit:contain";const cap=document.createElement("figcaption");cap.textContent=record.name+" — "+record.category+" (photograph supplied by the specimen researcher; species ID unverified)";figure.append(img,cap);viewer.append(figure);viewer.hidden=false;viewer.scrollIntoView({behavior:"smooth",block:"nearest"})}
 function render(){
  cleanup();grid.replaceChildren();
  const term=search.value.trim().toLowerCase(),cat=filter.value;
  const selected=all.filter(r=>(!term||r.name.toLowerCase().includes(term)||r.category.toLowerCase().includes(term))&&(!cat||r.category===cat));
  status.textContent=all.length+" of "+expected.length+" photographs available in this browser · "+selected.length+" shown. Photos are stored on this device only; no upload to the public website.";
  for(const item of selected){const button=document.createElement("button");button.type="button";button.className="photo-tile";
    const image=document.createElement("img");const url=URL.createObjectURL(item.blob);previews.push(url);image.src=url;image.loading="lazy";image.alt=item.name+" specimen reference";
    const text=document.createElement("span");text.textContent=item.name+" · "+item.category;button.append(image,text);button.addEventListener("click",()=>showLarge(item));grid.append(button)}
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
