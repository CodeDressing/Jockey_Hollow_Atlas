// MycoSim Phase 21 — local evidence register and versioned cross-atlas handoff.
const EVIDENCE21_SOURCES=[{"id":"koh2016","title":"From Dietary Fiber to Host Physiology: Short-Chain Fatty Acids as Key Bacterial Metabolites","doi":"10.1016/j.cell.2016.05.041","pmid":"27259147","type":"peer-reviewed-review","url":"https://pubmed.ncbi.nlm.nih.gov/27259147/"},{"id":"hardison2011","title":"The role of Syk/CARD9 coupled C-type lectins in antifungal immunity","doi":null,"pmid":"21267996","type":"peer-reviewed-review","url":"https://pubmed.ncbi.nlm.nih.gov/21267996/"},{"id":"cryan2019","title":"The Microbiota-Gut-Brain Axis","doi":"10.1152/physrev.00018.2018","pmid":"31460832","type":"peer-reviewed-review","url":"https://pubmed.ncbi.nlm.nih.gov/31460832/"},{"id":"mori2009","title":"Improving effects of the mushroom Yamabushitake (Hericium erinaceus) on mild cognitive impairment: a double-blind placebo-controlled clinical trial","doi":"10.1002/ptr.2634","pmid":"18844328","type":"small-randomized-trial","url":"https://pubmed.ncbi.nlm.nih.gov/18844328/"}];
const EVIDENCE21_CLAIMS=[{"phase":15,"id":"digestion","claim":"Human digestion and epithelial exposure are distinct from absorption of intact fungal polysaccharides.","grade":"established-general-physiology","limit":"General physiology only; no preparation-specific absorption fraction or clinical effect is established.","source_ids":[]},{"phase":16,"id":"scfa","claim":"Some gut microbial fermentations yield short-chain fatty acids with host physiological functions.","grade":"peer-reviewed-mechanism-review","limit":"The review does not establish that a particular mushroom powder produces a specified human SCFA profile.","source_ids":["koh2016"]},{"phase":17,"id":"dectin","claim":"Dectin-1/SYK/CARD9 participates in fungal recognition in defined immune contexts.","grade":"peer-reviewed-mechanism-review","limit":"Antifungal infection and cell signaling cannot be generalized to oral dietary powder or health outcomes.","source_ids":["hardison2011"]},{"phase":18,"id":"portal","claim":"Oral bioaccessibility, intestinal uptake, first-pass metabolism and systemic availability are separate steps.","grade":"established-general-physiology","limit":"No fungal-compound-specific blood concentration, half-life or brain exposure measured by MycoSim.","source_ids":[]},{"phase":19,"id":"gutbrain","claim":"The gut and brain communicate through neural, endocrine, immune and microbial-metabolite routes.","grade":"peer-reviewed-mechanism-review","limit":"No causal efficacy for ordinary Lion's Mane or Turkey Tail ingestion is established by this review.","source_ids":["cryan2019"]},{"phase":20,"id":"lionsmane","claim":"A small randomized trial tested a particular Hericium erinaceus preparation in mild cognitive impairment.","grade":"limited-human-trial","limit":"N=30, preparation/duration/participants specific; insufficient for general clinical or receptor-level claims.","source_ids":["mori2009"]},{"phase":20,"id":"direct-nmda","claim":"Ordinary Lion's Mane powder directly modulates human NMDA/AMPA/GABA receptors.","grade":"unverified-hypothesis","limit":"No verified human direct receptor-engagement evidence supplied; do not assert this effect.","source_ids":[]}];

const quality=document.getElementById("myco-campaign");
if(quality&&!document.getElementById("myco-evidence21")){
 const section=document.createElement("section");section.id="myco-evidence21";section.setAttribute("aria-label","Phase 21 research evidence and export");
 section.style.cssText="margin-top:15px;padding:14px;border:1px solid #63887c;border-radius:10px;background:#102126;color:#edf5ef";
 section.innerHTML='<style>#myco-evidence21 h3{font-size:18px;color:#f0daa5}#myco-evidence21 p,#myco-evidence21 li{font-size:12px;line-height:1.55}#myco-evidence21 button,#myco-evidence21 select{padding:9px;border:1px solid #63867c;background:#17333a;color:#f6f7f3;border-radius:7px}#myco-evidence21 button{cursor:pointer}#myco-evidence21 button:focus-visible,#myco-evidence21 select:focus-visible,#myco-evidence21 textarea:focus-visible{outline:2px solid #f2db97}#myco-evidence21 .evidence21-record{padding:11px;border:1px solid #4d6f68;border-radius:8px;background:#172d31;margin:9px 0}#myco-evidence21 textarea{box-sizing:border-box;width:100%;min-height:165px;resize:vertical;background:#081819;color:#f0f2ee;border:1px solid #5c7971;border-radius:8px;font:11px/1.5 monospace;padding:10px;overflow-wrap:anywhere}#myco-evidence21 .evidence21-warning{background:#2e261b;border-left:3px solid #e4bb74;padding:10px}</style>'+
 '<div class="kicker">PHASE 21 · CITED SCIENTIFIC EVIDENCE / LOCAL HANDOFF</div><h3>Claim ledger, provenance and reproducible export</h3>'+
 '<p class="evidence21-warning">Citations support specified research claims, not every animation or a product-specific health outcome. Uncited general physiology and hypotheses are explicitly labeled. No remote sync, user data upload, or scientific certification.</p>'+
 '<label for="evidence21-filter">Claim group </label><select id="evidence21-filter"><option value="all">All phases 15–20</option><option value="15">15 · Ingestion</option><option value="16">16 · Microbiome</option><option value="17">17 · Immunity</option><option value="18">18 · Circulation</option><option value="19">19 · Gut–brain</option><option value="20">20 · Neuroscience</option></select>'+
 '<div id="evidence21-records" aria-live="polite"></div>'+
 '<p><strong>Research exchange:</strong> versioned JSON with explicit source IDs, evidence grades, warnings, and a SHA-256 digest. This is a manual, offline export; target schema compatibility has not been verified.</p>'+
 '<button id="evidence21-build" type="button">Build local research package</button> <button id="evidence21-copy" type="button">Copy package</button>'+
 '<label for="evidence21-output" style="display:block;margin:10px 0 5px">Read-only package preview</label><textarea id="evidence21-output" readonly spellcheck="false" aria-label="Versioned Neural Systems Atlas research package"></textarea>'+
 '<p id="evidence21-status" role="status">Not built. Remote sync NOT TESTED.</p>';
 quality.append(section);
 const filter=section.querySelector("#evidence21-filter"),recordsBox=section.querySelector("#evidence21-records"),status=section.querySelector("#evidence21-status"),preview=section.querySelector("#evidence21-output");
 function draw(){
  recordsBox.replaceChildren();
  const selected=EVIDENCE21_CLAIMS.filter(x=>filter.value==="all"||String(x.phase)===filter.value);
  for(const claim of selected){
   const card=document.createElement("div");card.className="evidence21-record";
   const heading=document.createElement("strong");heading.textContent="Phase "+claim.phase+" · "+claim.id+" · "+claim.grade;card.append(heading);
   const description=document.createElement("p");description.textContent=claim.claim;card.append(description);
   const limit=document.createElement("p");limit.textContent="Evidence boundary: "+claim.limit;card.append(limit);
   const list=document.createElement("ul");list.setAttribute("aria-label","Peer-reviewed sources");
   if(!claim.source_ids.length){
    const li=document.createElement("li");li.textContent="No claim-specific DOI/PMID assigned — review pending";list.append(li);
   }
   for(const id of claim.source_ids){
    const item=EVIDENCE21_SOURCES.find(s=>s.id===id);if(!item)continue;
    const li=document.createElement("li"),a=document.createElement("a");a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=item.title+" · PMID "+item.pmid+(item.doi?" · DOI "+item.doi:"");
    li.append(a);list.append(li);
   }card.append(list);recordsBox.append(card);
  }
 }
 filter.onchange=draw;
 const stable=(obj)=>JSON.stringify(obj);
 async function build(){
  const body={
   schema:"jha.mycosim.research.v2",schema_version:2,
   source:"Jockey Hollow Atlas MycoSim",target:"Neural Systems Atlas",
   transport:"manual-local-JSON-only",remote_sync:false,
   evidence_review:"curated-partial-review",human_signoff:false,
   scope:"Educational claims; NOT clinical recommendations",
   sources:EVIDENCE21_SOURCES,claims:EVIDENCE21_CLAIMS,
   constraints:["No oral-to-Dectin-1 exposure inference","No brain bioavailability assumed","No generalized efficacy from small product-specific trials","No verified remote schema compatibility"]
  };
  const json=stable(body);let digest=null,algorithm="none";
  if(globalThis.crypto?.subtle&&globalThis.TextEncoder){
   const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(json));
   digest=[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,"0")).join("");algorithm="SHA-256";
  }
  const envelope={...body,integrity:{algorithm,digest,canonicalization:"JSON.stringify payload in authored key order; digest excludes integrity field"}};
  preview.value=JSON.stringify(envelope,null,2);
  status.textContent="Local package ready: "+EVIDENCE21_CLAIMS.length+" claims, "+EVIDENCE21_SOURCES.length+" references. Hash: "+algorithm+". No remote transmission.";
  return envelope;
 }
 section.querySelector("#evidence21-build").onclick=()=>build().catch(err=>status.textContent="Export failed: "+String(err));
 section.querySelector("#evidence21-copy").onclick=async()=>{
  try{if(!preview.value)await build();if(!navigator.clipboard?.writeText)throw Error("Clipboard unavailable");await navigator.clipboard.writeText(preview.value);status.textContent="Local package copied; NO remote transfer.";}
  catch(err){status.textContent="Copy unavailable: "+String(err)+" — select preview text to copy manually.";}
 };
 window.MycoSimEvidence21=Object.freeze({sources:EVIDENCE21_SOURCES,claims:EVIDENCE21_CLAIMS,build,version:2});
 draw();
}
