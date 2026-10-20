(function(){
  "use strict";
  const source=window.LivingAtlasSource;
  if(!source)return;
  const records=source.snapshot();
  const normalize=v=>String(v??"").normalize("NFKC").toLocaleLowerCase("en").replace(/[^a-z0-9]+/g,"");
  // Only explicit taxonomic/name fields qualify as name search; free-form
  // notes and descriptions are not species determinations.
  const nameFields=r=>Object.entries(r.summary||{}).filter(([key,value])=>
    /^(?:scientific(?: name)?|taxon|taxonomic name|common(?: name)?|vernacular name|genus|species|identification|determination)$/i.test(key.trim()) &&
    typeof value==="string" && !value.toLowerCase().startsWith("http:") && !value.toLowerCase().startsWith("https:") && !value.toLowerCase().startsWith("data:")
  ).map(([,value])=>value);
  const names=r=>nameFields(r);
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
  // Review states describe documentary evidence, not a numerical probability.
  const identificationState=r=>{
    const ident=Object.entries(r.summary||{}).filter(([k])=>/^(identification status|determination status|taxonomic review)$/i.test(k.trim())).map(([,v])=>String(v).toLowerCase());
    const explicit=ident.join(" ");
    if(/conflict|disagree|disputed/.test(explicit))return "conflicting";
    if(/confirmed|verified|reviewed/.test(explicit))return "confirmed";
    if(/provisional|tentative|cf\\.|aff\\.|pending/.test(explicit))return "provisional";
    return "unidentified";
  };
  const MODEL_LIFECYCLE=Object.freeze(["unmodeled","provisional_reconstruction","scientifically_reviewed","validated"]);
  // Run 6: direct visual review of two accession-labelled source images.
  // This is NOT a taxonomic determination, morphology profile, or model license.
  const reviewedAN2F3=Object.freeze([
    {character:"pileus_surface",observation:"Dark cap with dense raised coarse scales visible",evidence:"AN2-F3.JPG",basis:"direct photograph",confidence:"observed"},
    {character:"stipe",observation:"Distinct short-looking curved stalk visible in photographic perspective",evidence:"AN2-F3.JPG",basis:"direct photograph",confidence:"observed"},
    {character:"spore_print",observation:"Dark patterned deposit visible on white collection sheet",evidence:"AN2-F3SP.JPG",basis:"direct photograph",confidence:"observed"},
    {character:"hymenophore",observation:"Attachment and pore/gill structure not established from reviewed images",evidence:null,basis:"unknown",confidence:"unresolved"},
    {character:"measurements",observation:"Distinct archived measurement repetitions disagree and contain incomplete fields",evidence:"Rutgers_Mycology_Measurements_Master.xlsx",basis:"source record review",confidence:"conflicting"},
    {character:"species",observation:"No independently reviewed scientific species determination established",evidence:null,basis:"unknown",confidence:"unresolved"}
  ]);
  const evidenceFor=r=>{
    const photographs=(r.images||[]).filter(i=>i.original||i.thumb).map(i=>Object.freeze({
      type:"photograph",label:i.caption||"Archived accession media",url:i.original||i.thumb
    }));
    const measurements=(r.measurements||[]).map(m=>Object.freeze({
      type:"measurement",source:m.source||"Unspecified archive",source_id:m.source_id||"Unspecified record",
      fields:{...m.fields}
    }));
    return Object.freeze({specimen_id:r.code,photos:photographs,measurements,
      taxonomic_determination:nameFields(r),identification_state:identificationState(r),
      model_lifecycle:"unmodeled",model_profile:null,
      reviewed_character_matrix:r.code==="AN2-F3"?reviewedAN2F3:[],
      uncertainty:"Images and source measurements are accession-linked; diagnostic traits and accepted taxon require independent review."
    });
  };
  // Atlas IDs and archived measurements are evidence for accession existence,
  // not proof of a species. No unreviewed record receives species-level 3D status.
  window.LivingAtlasRegistry=Object.freeze({
    count:records.length,collisions:[...collisions],
    search,lookup:id=>indexed.get(normalize(id))||null,
    modelStatus:()=> "not_modelled",
    modelLifecycle:id=>MODEL_LIFECYCLE[0],
    modelLifecycleOptions:MODEL_LIFECYCLE,
    evidenceMatrix:id=>{const record=indexed.get(normalize(id));return record?evidenceFor(record):null;},
    identificationState:id=>identificationState(indexed.get(normalize(id))||{}),
    verifiedNames:id=>nameFields(indexed.get(normalize(id))||{summary:{}}),
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
    const labels=document.createElement("p");
    const documented=nameFields(r);
    labels.textContent=documented.length?"Documented identification labels: "+documented.join("; "):"Scientific and common names: unverified / not documented in the accessible registry.";
    detail.append(labels);
    const confidence=document.createElement("p");
    confidence.textContent="Identification evidence state: "+identificationState(r)+" (documentary status, not probability).";
    detail.append(confidence);
    const evidence=evidenceFor(r);
    const evidenceNote=document.createElement("p");
    evidenceNote.textContent="Evidence matrix: "+evidence.photos.length+" archived media references; "+evidence.measurements.length+" measurement records. 3D lifecycle: "+evidence.model_lifecycle+". Anatomical reconstruction not authorized by evidence yet.";
    detail.append(evidenceNote);
    if(evidence.reviewed_character_matrix.length){
      const review=document.createElement("details");
      const sum=document.createElement("summary");sum.textContent="Visual character evidence and unresolved anatomy";review.append(sum);
      for(const entry of evidence.reviewed_character_matrix){const line=document.createElement("p");line.textContent=entry.character+": "+entry.observation+" — "+entry.basis+(entry.evidence?" ("+entry.evidence+")":"");review.append(line);}
      detail.append(review);
    }
    const gallery=document.createElement("details");
    const galleryTitle=document.createElement("summary");galleryTitle.textContent="Original accession photo references ("+evidence.photos.length+")";
    gallery.append(galleryTitle);
    for(const photo of evidence.photos){
      const link=document.createElement("a");
      if(!/^https:\/\/drive\.google\.com\//.test(photo.url))continue;
      link.href=photo.url;link.target="_blank";link.rel="noopener noreferrer";
      link.textContent=photo.label;link.style.cssText="display:block;margin:7px 0;color:#f1deb0;overflow-wrap:anywhere";gallery.append(link);
    }
    detail.append(gallery);
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