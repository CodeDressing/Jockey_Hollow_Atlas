// Gym Juno encrypted original-photograph viewer.
// Public server holds AES-256-GCM ciphertext only. 256-bit recovery key never leaves device.
// Separate from weak historic specimen passcode; key is NOT sent to the server.
const PATH="./mycosim/classified-encrypted/gym-juno-manifest.json";
function fromB64url(s){if(!/^[A-Za-z0-9_-]{43}$/.test(s))throw Error("Recovery key must be 43 base64url characters");const t=s.replace(/-/g,"+").replace(/_/g,"/");return Uint8Array.from(atob(t+"="),c=>c.charCodeAt(0))}
function nonce(s){const t=s.replace(/-/g,"+").replace(/_/g,"/");return Uint8Array.from(atob(t+"=="),c=>c.charCodeAt(0))}
async function verifyDigest(buf,expected){const digest=new Uint8Array(await crypto.subtle.digest("SHA-256",buf));const actual=Array.from(digest,b=>b.toString(16).padStart(2,"0")).join("");if(actual!==expected)throw Error("Ciphertext integrity check failed")}
export async function mountEncryptedGymJuno(container){
 if(container.dataset.mounted==="yes")return;container.dataset.mounted="yes";
 const status=container.querySelector("[data-encrypted-status]"),input=container.querySelector("[data-encrypted-key]"),open=container.querySelector("[data-encrypted-open]"),lock=container.querySelector("[data-encrypted-lock]"),grid=container.querySelector("[data-encrypted-grid]"),viewer=container.querySelector("[data-encrypted-viewer]");
 const urls=new Set();let secretKey=null,manifest=null,session=0;
 const urlFor=id=>new URL("./mycosim/classified-encrypted/"+id,location.href).href;
 const clear=()=>{session++;grid.replaceChildren();viewer.replaceChildren();viewer.hidden=true;for(const u of urls)URL.revokeObjectURL(u);urls.clear();secretKey=null;lock.hidden=true;open.hidden=false;input.value="";status.textContent="Gallery locked. The recovery key is never stored by this page."};
 async function loadManifest(){
  const response=await fetch(PATH,{cache:"no-store"});if(!response.ok)throw Error("Encrypted image manifest is not deployed (HTTP "+response.status+")");
  const data=await response.json();if(data.format!=="mycosim-encrypted-photo-v1"||!Array.isArray(data.photos)||data.photos.length!==71)throw Error("Unexpected or incomplete manifest");
  for(const img of data.photos){if(!/^GJ-\\d{3}\\.enc$/.test(img.asset)||!/^GJ-\\d{3}$/.test(img.id)||!/^([a-f0-9]{64})$/.test(img.sha256))throw Error("Invalid image manifest")}
  return data;
 }
 async function decryptImage(entry,key){const response=await fetch(urlFor(entry.asset),{cache:"force-cache"});if(!response.ok)throw Error("Missing encrypted image: "+entry.id+" (HTTP "+response.status+")");
  const encrypted=await response.arrayBuffer();await verifyDigest(encrypted,entry.sha256);
  const decrypted=await crypto.subtle.decrypt({name:"AES-GCM",iv:nonce(entry.iv),additionalData:new TextEncoder().encode(entry.id)},key,encrypted);
  return URL.createObjectURL(new Blob([decrypted],{type:entry.mime}));}
 async function render(){
  const ticket=++session;grid.replaceChildren();viewer.replaceChildren();viewer.hidden=true;
  const localKey=secretKey;let success=0,fail=0;
  const load=async(entry,elem)=>{
   if(ticket!==session||!localKey)return;
   try{const url=await decryptImage(entry,localKey);if(ticket!==session){URL.revokeObjectURL(url);return}
    urls.add(url);const img=document.createElement("img");img.src=url;img.loading="lazy";img.alt="Research specimen image "+entry.id;elem.prepend(img);
    elem.addEventListener("click",()=>{viewer.replaceChildren();const large=document.createElement("img");large.src=url;large.alt=img.alt;large.style.cssText="max-width:100%;max-height:70vh;object-fit:contain";viewer.append(large,document.createTextNode(entry.id+" — "+entry.group));viewer.hidden=false;viewer.scrollIntoView({block:"nearest",behavior:"smooth"})});
    success++;
   }catch(error){fail++;elem.append(document.createTextNode("Unavailable: "+error.message))}finally{if(ticket===session)status.textContent=success+" / "+manifest.photos.length+" authenticated originals decrypted"+(fail?"; "+fail+" error(s)":"")}}
  };
  const observer=new IntersectionObserver(events=>{for(const event of events){if(!event.isIntersecting)continue;observer.unobserve(event.target);const entry=event.target.__entry;void load(entry,event.target)}},{rootMargin:"300px"});
  for(const entry of manifest.photos){const tile=document.createElement("button");tile.type="button";tile.className="photo-tile";tile.__entry=entry;tile.append(document.createTextNode(entry.id+" — "+entry.group));grid.append(tile);observer.observe(tile)}
  status.textContent="Manifest verified: 71 encrypted photographs indexed. Loading images as they enter view.";
 }
 open.addEventListener("click",async()=>{open.disabled=true;try{manifest=await loadManifest();const bytes=fromB64url(input.value.trim());secretKey=await crypto.subtle.importKey("raw",bytes,{name:"AES-GCM"},false,["decrypt"]);input.value="";lock.hidden=false;open.hidden=true;await render()}catch(error){secretKey=null;status.textContent=error.message}finally{open.disabled=false}});
 lock.addEventListener("click",clear);
 try{manifest=await loadManifest();status.textContent="Encrypted archive discovered ("+manifest.photos.length+" images). Enter your separate private recovery key."}
 catch(error){status.textContent="Encrypted archive release HOLD: "+error.message}
}
