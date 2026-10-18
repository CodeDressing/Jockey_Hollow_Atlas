// Supabase private photo bridge. Separate real authentication is required.
// Never embed a service_role key or site passcode. Supabase publishable/anon key is public by design.
const CONFIG_URL="./mycosim/gym_juno_cloud_config.json";
const BUCKET="gym-juno-private";
let sb=null;
async function connect(){
  const res=await fetch(CONFIG_URL,{cache:"no-store"});
  if(!res.ok)throw Error("Storage configuration file unavailable");
  const cfg=await res.json();
  if(!cfg.enabled||!cfg.supabaseUrl||!cfg.supabasePublishableKey)return null;
  const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.76.1/+esm");
  return createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
}
function el(parent,tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;parent.append(node);return node}
function normalized(name){return name.replace(/[^a-zA-Z0-9._() -]/g,"_").slice(0,145)}
function hasImageExt(name){return /\.(png|jpe?g|webp)$/i.test(name)}
export async function mountGymJunoCloudArchive(container){
  if(container.dataset.cloudMounted==="true")return;
  container.dataset.cloudMounted="true";
  const status=container.querySelector("[data-cloud-status]"),login=container.querySelector("[data-cloud-login]"),
   email=container.querySelector("[data-cloud-email]"),loginButton=container.querySelector("[data-cloud-request]"),
   logOut=container.querySelector("[data-cloud-logout]"),sync=container.querySelector("[data-cloud-sync]"),
   refresh=container.querySelector("[data-cloud-refresh]"),grid=container.querySelector("[data-cloud-grid]");
  let urls=[];
  function dropUrls(){urls.forEach(url=>URL.revokeObjectURL(url));urls=[]}
  async function session(){return (await sb.auth.getSession()).data.session}
  async function requireSession(){const s=await session();if(!s?.user?.id)throw Error("Sign in with your invited research account first");return s}
  async function render(){
    if(!sb)return;
    const s=await session();
    login.hidden=!!s;logOut.hidden=!s;sync.hidden=!s;refresh.hidden=!s;
    grid.replaceChildren();dropUrls();
    if(!s){status.textContent="Private cloud: not signed in. Research account invitation is required.";return}
    status.textContent="Authenticated; requesting privately stored photographs...";
    const prefix=s.user.id+"/";
    const all=[];
    for(let offset=0;;offset+=100){
      const {data,error}=await sb.storage.from(BUCKET).list(s.user.id,{limit:100,offset,sortBy:{column:"name",order:"asc"}});
      if(error)throw error;
      all.push(...(data||[]).filter(x=>hasImageExt(x.name)));
      if(!data||data.length<100)break;
    }
    status.textContent=all.length+" remotely stored original image(s), available to your authenticated research account.";
    for(const entry of all){
      const path=prefix+entry.name;
      const {data,error}=await sb.storage.from(BUCKET).download(path);
      if(error){el(grid,"p","Image temporarily unavailable: "+entry.name);continue}
      const blob=data;const url=URL.createObjectURL(blob);urls.push(url);
      const button=el(grid,"button");button.className="photo-tile";button.type="button";
      const img=el(button,"img");img.src=url;img.loading="lazy";img.alt="Gym Juno original photograph: "+entry.name;
      el(button,"span",entry.name);
      button.addEventListener("click",()=>{
        const popup=container.querySelector("[data-cloud-preview]");
        popup.replaceChildren();const picture=el(popup,"img");
        picture.src=url;picture.alt=entry.name;picture.style.cssText="width:100%;max-height:70vh;object-fit:contain";
        el(popup,"p",entry.name);popup.hidden=false;popup.scrollIntoView({block:"nearest",behavior:"smooth"});
      });
    }
  }
  try{sb=await connect()}catch(error){status.textContent="Secure storage unavailable: "+error.message;return}
  if(!sb){status.textContent="Secure storage connection awaiting free Supabase project configuration. No photographs are exposed or uploaded.";return}
  loginButton.addEventListener("click",async()=>{
    const address=email.value.trim();
    if(!address){status.textContent="Enter your invited research email address.";return}
    loginButton.disabled=true;
    try{const {error}=await sb.auth.signInWithOtp({email:address,options:{shouldCreateUser:false,emailRedirectTo:location.origin+location.pathname}});if(error)throw error;
      status.textContent="If that account was invited, check its email for the secure sign-in link."}
    catch(error){status.textContent="Sign-in request failed: "+error.message}
    finally{loginButton.disabled=false}
  });
  logOut.addEventListener("click",async()=>{await sb.auth.signOut();await render()});
  refresh.addEventListener("click",()=>render().catch(error=>status.textContent="Gallery refresh failed: "+error.message));
  sync.addEventListener("click",async()=>{
    sync.disabled=true;
    try{
      const s=await requireSession();
      const {getClassifiedLocalPhotoRecords}=await import("./classified_photo_gallery.js");
      const records=await getClassifiedLocalPhotoRecords();
      if(!records.length){status.textContent="No browser-local originals found. Import your specimen ZIP into the local archive first.";return}
      let done=0;
      for(const record of records){
        if(!hasImageExt(record.name))continue;
        const file=record.blob,name=normalized(record.name);
        if(file.size>15*1024*1024)throw Error(name+" exceeds the allowed 15 MB/image");
        const {error}=await sb.storage.from(BUCKET).upload(s.user.id+"/"+name,file,{contentType:file.type||(/\.png$/i.test(name)?"image/png":"image/jpeg"),upsert:true,cacheControl:"3600"});
        if(error)throw error;done++;status.textContent="Secure upload "+done+" / "+records.length;
      }
      status.textContent="Uploaded "+done+" image(s). Sync completed; verifying the remote gallery...";
      await render();
    }catch(error){status.textContent="Upload failed: "+error.message}
    finally{sync.disabled=false}
  });
  sb.auth.onAuthStateChange(()=>{setTimeout(()=>render().catch(error=>status.textContent=error.message),0)});
  await render();
}
