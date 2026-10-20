(function(){
  "use strict";
  const source=window.LivingAtlasSource;
  if(!source)return;
  const records=source.snapshot();
  const normalize=v=>String(v??"").normalize("NFKC").toLocaleLowerCase("en").replace(/[^a-z0-9]+/g,"");
  const names=r=>Object.values(r.summary||{}).filter(v=>typeof v==="string"&&!/^(https?:\/\/|data:)/i.test(v)).slice(0,35);
  const indexed=new Map(),collisions=new Set();
  for(const r of records){
    const key=normalize(r.code);
    if(!key)continue;
    if(indexed.has(key))collisions.add(key);
    else indexed.set(key,r);
  }
  const search=query=>{
    const term=normalize(query);
    if(!term)return[];
    return records.filter(r=>normalize(r.code).includes(term)||normalize(r.status).includes(term)||names(r).some(n=>normalize(n).includes(term))).slice(0,40);
  };
  // Atlas IDs and archived measurements are evidence for accession existence,
  // not proof of a species. No unreviewed record receives species-level 3D status.
  window.LivingAtlasRegistry=Object.freeze({
    count:records.length,collisions:[...collisions],
    search,lookup:id=>indexed.get(normalize(id))||null,
    modelStatus:()=> "not_modelled",
    source:"merged-atlas-records"
  });
  const host=document.createElement("section");
  host.id="living-atlas-registry";
  host.setAttribute("aria-label","Living Atlas specimen finder");
  host.style.cssText="margin:12px;padding:12px;border:1px solid #5e736a;border-radius:10px;background:#111e1b;color:#e8ece7";
  const heading=document.createElement("strong");
  heading.textContent="Living Atlas — Specimen Finder";
  const label=document.createElement("label");
  label.textContent="Specimen ID, common name, or scientific name";
  label.style.cssText="display:block;margin:8px 0";
  const input=document.createElement("input");
  input.type="search";input.id="living-atlas-query";input.placeholder="AN2-F3, Old Man of the Woods…";
  input.setAttribute("aria-label","Search specimen ID or documented name");
  input.style.cssText="width:100%;padding:10px;background:#09100f;color:#fff;border:1px solid #718b7c;border-radius:6px";
  const status=document.createElement("p");
  status.setAttribute("role","status");
  status.setAttribute("aria-live","polite");
  status.style.cssText="font-size:12px;color:#bed1c5";
  const list=document.createElement("div");
  list.id="living-atlas-results";
  const detail=document.createElement("div");
  detail.id="living-atlas-detail";
  detail.style.cssText="margin-top:10px;font-size:13px;line-height:1.5";
  host.append(heading,label,input,status,list,detail);
  const sidebar=document.querySelector(".sidebar")||document.querySelector("aside");
  if(sidebar)sidebar.insertBefore(host,sidebar.querySelector(".filters")||sidebar.firstChild);
  else document.querySelector(".app")?.prepend(host);
  function show(r){
    detail.replaceChildren();
    const title=document.createElement("h3");title.textContent=r.code;detail.append(title);
    const p=document.createElement("p");
    p.textContent="Archive: "+(r.collection||"unclassified")+" · Model: Not modeled / identification review required.";
    detail.append(p);
    const note=document.createElement("p");
    note.textContent=r.sourceLine||r.status||"Source record retained. Scientific identification pending review.";
    detail.append(note);
    const measurement=document.createElement("p");
    measurement.textContent="Measurement records: "+r.measurements.length+" · Source photos: "+r.images.length+". These do not independently establish taxonomy.";
    detail.append(measurement);
    const open=document.createElement("button");
    open.type="button";open.textContent="Open original atlas dossier";
    open.style.cssText="padding:9px;background:#29483c;color:white;border:1px solid #688;border-radius:6px;cursor:pointer";
    open.addEventListener("click",()=>source.open(r.code));
    detail.append(open);
    const pending=document.createElement("p");
    pending.textContent="3D specimen modeling awaits verified identification and scientifically reviewed morphology; existing MycoSim teaching archetypes are not presented as this exact specimen.";
    detail.append(pending);
    const teaching=document.createElement("a");
    teaching.href="sandbox.html?atlas_reference="+encodeURIComponent(r.code);
    teaching.textContent="Explore generic 3D morphology (not this specimen)";
    teaching.setAttribute("aria-label","Open the original MycoSim teaching simulator; this is not a verified model of "+r.code);
    teaching.style.cssText="display:inline-block;margin-top:9px;padding:10px;color:#f1deb0;border:1px solid #6a8a7d;border-radius:7px";
    detail.append(teaching);
  }
  function render(){
    list.replaceChildren();detail.replaceChildren();
    const q=input.value.trim(),found=search(q);
    status.textContent=q?(found.length+" matching accession(s)"):(records.length+" records indexed; "+collisions.size+" ID collisions.");
    for(const r of found){
      const btn=document.createElement("button");
      btn.type="button";btn.textContent=r.code+" — "+(r.collection||"archive");
      btn.style.cssText="display:block;width:100%;margin:3px 0;padding:8px;text-align:left;background:#1d312c;color:#eef;border:1px solid #42665d;border-radius:5px;cursor:pointer";
      btn.addEventListener("click",()=>show(r));
      list.append(btn);
    }
    if(q&&!found.length){const p=document.createElement("p");p.textContent="No documented match. No species identity or model has been inferred.";list.append(p);}
  }
  input.addEventListener("input",render);
  const requested=new URLSearchParams(location.search).get("specimen");
  if(requested){input.value=requested;render();const r=window.LivingAtlasRegistry.lookup(requested);if(r)show(r);}else render();
})();