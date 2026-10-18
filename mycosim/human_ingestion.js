// Phase 15 extension to existing Phase 9 digestion and Phase 10 anatomy; conceptual, non-clinical.
const INGESTION_STAGES=[{"id":"oral","organ":"Mouth and esophagus","enzyme":"Salivary amylase acts primarily on accessible starch; mastication changes particle size.","barrier":"Oral mucosa and esophageal epithelium; swallowing transports material toward the stomach.","fate":"Fungal cell walls and β-glucan are not assumed to be digested by salivary amylase.","evidence":"Established human physiology; specific mushroom release uncertain","term":"Amylase","pron":"AM-ih-lays","definition":"An enzyme that hydrolyzes certain glycosidic bonds, especially those in starch."},{"id":"gastric","organ":"Stomach","enzyme":"Gastric acid denatures some proteins; pepsin hydrolyzes susceptible protein chains.","barrier":"Gastric mucus and epithelial lining protect tissue; gastric processing is not proof of systemic uptake.","fate":"Release of constituents depends on particle size, cooking, extraction and molecular properties.","evidence":"Established gastric physiology; compound-specific survival unknown","term":"Pepsin","pron":"PEP-sin","definition":"A stomach protease that cleaves certain peptide bonds in proteins."},{"id":"duodenum","organ":"Duodenum and proximal small intestine","enzyme":"Pancreatic proteases, lipase and amylase act on accessible substrates; bile aids lipid emulsification.","barrier":"Luminal mucus, epithelial cells, tight junctions and specialized transporters regulate uptake.","fate":"Lipid-soluble and small molecules may behave differently from large polysaccharides; no generic absorption percentage is claimed.","evidence":"Established digestion and intestinal barrier; compound-specific availability requires measurement","term":"Bioaccessibility","pron":"BY-oh-ak-sess-ih-BIL-ih-tee","definition":"The fraction of a constituent released from a food matrix into a potentially available form within the gastrointestinal tract."},{"id":"ileum","organ":"Distal small intestine","enzyme":"Brush-border hydrolases act on appropriate dietary substrates; transport and transit remain selective.","barrier":"The epithelial barrier and local immune interface separate gut contents from underlying tissues.","fate":"An accessible dietary component is not necessarily bioavailable or taken up by a human cell.","evidence":"Established epithelial physiology; mushroom-specific uptake unresolved","term":"Bioavailability","pron":"BY-oh-uh-vay-luh-BIL-ih-tee","definition":"The extent to which a substance becomes available at its relevant site of action or systemic circulation; definition varies by context."},{"id":"colon","organ":"Colon and intestinal microbiome","enzyme":"Microbial carbohydrate-active enzymes can transform certain fibers and resistant polysaccharides.","barrier":"Mucus, epithelial cells and immune surveillance separate lumen from host tissues.","fate":"Fermentation and short-chain fatty acid formation may occur for suitable substrates, but outcomes depend on structure and microbial community.","evidence":"General fermentation established; Turkey Tail-specific effects depend on preparation and human evidence","term":"Fermentation","pron":"fer-men-TAY-shun","definition":"Enzyme-mediated microbial transformation of substrates, potentially generating metabolites such as short-chain fatty acids."},{"id":"immune","organ":"Intestinal immune interface","enzyme":"Receptor signaling is not a digestive enzyme reaction. Dectin-1 can detect accessible β-glucan in relevant experimental settings.","barrier":"Mucus, tight junctions, antigen sampling and immune-cell localization matter. Whole oral powder is not assumed to reach Dectin-1.","fate":"Dectin-1 → hemITAM → SYK → CARD9 signaling is a conditional cell mechanism, not a demonstrated consequence of ingestion.","evidence":"Experimental receptor mechanism; oral powder-to-receptor bridge HYPOTHETICAL","term":"Dectin-1","pron":"DEK-tin one","definition":"A pattern-recognition receptor (CLEC7A) on some immune cells that can recognize accessible fungal β-glucans."},{"id":"liver","organ":"Portal circulation and liver","enzyme":"Host metabolic enzymes can transform substances that actually enter portal circulation.","barrier":"Crossing intestinal epithelium must precede portal exposure; hepatic metabolism differs by compound.","fate":"No claim that intact dietary fungal β-glucan, PSK or PSP reaches the liver or brain after ordinary oral powder consumption.","evidence":"Human portal and hepatic physiology established; mushroom-specific systemic exposure unverified","term":"First-pass metabolism","pron":"FIRST pass muh-TAB-uh-liz-um","definition":"Metabolic conversion in intestinal tissue or liver before a substance reaches systemic circulation."}];

const digestion=document.getElementById("tv-biology"),workspace=window.MycoSimWorkspace;
if(digestion&&!document.getElementById("myco-ingestion-lab")){
 const lab=document.createElement("section");lab.id="myco-ingestion-lab";lab.setAttribute("aria-label","Phase 15 compound fate learning laboratory");
 lab.style.cssText="margin-top:16px;padding:15px;border:1px solid #64847d;border-radius:10px;background:#0c1b20;color:#e9f4ef";
 lab.innerHTML='<style>#myco-ingestion-lab h3{font-size:18px;color:#f1d99e;margin:5px 0}#myco-ingestion-lab p{font-size:12px;line-height:1.55}#myco-ingestion-lab .ingestion-controls{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}#myco-ingestion-lab button{padding:9px 11px;border:1px solid #67867a;background:#183239;color:#fff;border-radius:7px;cursor:pointer}#myco-ingestion-lab button[aria-current=step]{background:#6b542b;border-color:#e8c987}#myco-ingestion-lab button:focus-visible{outline:2px solid #ffe3a0}#myco-ingestion-lab .ingestion-field{background:#14272d;padding:9px;border-radius:7px;margin-top:8px}#myco-ingestion-lab .ingestion-warning{border-left:3px solid #e8bb72;background:#29251c;padding:10px}#myco-ingestion-lab .ingestion-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}@media(max-width:620px){#myco-ingestion-lab .ingestion-grid{grid-template-columns:1fr}}</style>'+
 '<div class="kicker">PHASE 15 · HUMAN INGESTION LABORATORY · SHARED DIGESTION WORKSPACE</div><h3>Enzymes, barriers and compound fate</h3>'+
 '<p class="ingestion-warning">Conceptual route only: digestion, bioaccessibility, epithelial passage, bioavailability and neural effects are different claims. Ordinary Turkey Tail powder is not equivalent to PSK or PSP; no human clinical benefit is inferred.</p>'+
 '<label for="ingestion-material">Preparation to study </label><select id="ingestion-material"><option value="powder">Whole Turkey Tail mushroom powder</option><option value="extract">Characterized mushroom extract (unspecified)</option><option value="glucan">Isolated or purified beta-glucan (structure unspecified)</option></select>'+
 '<div class="ingestion-controls" id="ingestion-steps" role="group" aria-label="Select ingestion stage"></div>'+
 '<div class="ingestion-grid"><div class="ingestion-field"><strong id="ingestion-title"></strong><p id="ingestion-enzymes"></p><p id="ingestion-barrier"></p></div><div class="ingestion-field"><strong>Compound fate and evidence</strong><p id="ingestion-fate"></p><p id="ingestion-evidence"></p><p id="ingestion-preparation"></p></div></div>'+
 '<div class="ingestion-field" aria-live="polite"><strong id="ingestion-term"></strong><p id="ingestion-pron"></p><p id="ingestion-definition"></p></div>'+
 '<div class="ingestion-controls"><button id="ingestion-prev" type="button">Previous</button><button id="ingestion-next" type="button">Next</button><button id="ingestion-read" type="button">🔊 Read stage and definition</button><button id="ingestion-3d" type="button">View existing 3D human anatomy</button><button id="ingestion-qa" type="button">Run Phase 15 QA</button></div>'+
 '<pre id="ingestion-qa-result" role="status" style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;background:#071417;padding:10px;border:1px solid #51645f;border-radius:7px">Phase 15 QA not yet executed.</pre>';
 digestion.append(lab);
 let index=0,material="powder";
 const controls=lab.querySelector("#ingestion-steps");
 INGESTION_STAGES.forEach((s,i)=>{const btn=document.createElement("button");btn.type="button";btn.textContent=(i+1)+". "+s.organ;btn.onclick=()=>select(i);controls.append(btn);});
 const stageButtons=[...controls.querySelectorAll("button")];
 function preparation(){
  return material==="powder"?"Whole powder contains multiple physical fractions; total glucan content does not establish release, absorption or immune activity.":
   material==="extract"?"The extraction method, molecular-size profile, chemical characterization and dose must be supplied before fate can be predicted.":
   "Purified beta-glucan behavior depends strongly on linkage, branching, size, solubility and particulate presentation.";
 }
 function render(){
  const s=INGESTION_STAGES[index];
  lab.querySelector("#ingestion-title").textContent=(index+1)+"/"+INGESTION_STAGES.length+" · "+s.organ;
  lab.querySelector("#ingestion-enzymes").textContent="Enzymes and chemistry: "+s.enzyme;
  lab.querySelector("#ingestion-barrier").textContent="Human barrier: "+s.barrier;
  lab.querySelector("#ingestion-fate").textContent="Potential fate: "+s.fate;
  lab.querySelector("#ingestion-evidence").textContent="Evidence classification: "+s.evidence;
  lab.querySelector("#ingestion-preparation").textContent="Preparation constraint: "+preparation();
  lab.querySelector("#ingestion-term").textContent="Definition: "+s.term;
  lab.querySelector("#ingestion-pron").textContent="Pronunciation: "+s.pron;
  lab.querySelector("#ingestion-definition").textContent=s.definition;
  stageButtons.forEach((button,i)=>{if(index===i)button.setAttribute("aria-current","step");else button.removeAttribute("aria-current");});
 }
 function select(next){index=Math.max(0,Math.min(INGESTION_STAGES.length-1,next));if("speechSynthesis" in window)window.speechSynthesis.cancel();render();}
 lab.querySelector("#ingestion-material").addEventListener("change",event=>{material=event.target.value;render();});
 lab.querySelector("#ingestion-prev").onclick=()=>select(index-1);
 lab.querySelector("#ingestion-next").onclick=()=>select(index+1);
 lab.querySelector("#ingestion-read").onclick=()=>{if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const s=INGESTION_STAGES[index];const speech=new SpeechSynthesisUtterance(s.organ+". "+s.enzyme+" "+s.barrier+" "+s.fate+" "+s.evidence+". "+s.term+". "+s.definition);speech.rate=.84;speech.lang="en-US";window.speechSynthesis.speak(speech);};
 lab.querySelector("#ingestion-3d").onclick=()=>{const active=window.MycoSimWorkspace?.activate("anatomy");if(active)document.getElementById("tv-anatomy3d")?.scrollIntoView({block:"start",behavior:"smooth"});};
 lab.querySelector("#ingestion-qa").onclick=()=>{
  const previous=index,priorMaterial=material,checks=[],check=(n,x)=>checks.push({n,pass:!!x});
  try{
   check("Seven human ingestion checkpoints",INGESTION_STAGES.length===7&&stageButtons.length===7);
   check("Reuses original Phase 9 module",lab.parentElement.id==="tv-biology");
   check("Original Phase 10 anatomical view retained",!!document.getElementById("tv-anatomy3d"));
   check("Three preparation options",lab.querySelectorAll("#ingestion-material option").length===3);
   for(let n=0;n<INGESTION_STAGES.length;n++){select(n);check("Stage "+(n+1)+" information and pronunciation",stageButtons[n].getAttribute("aria-current")==="step"&&!!lab.querySelector("#ingestion-pron").textContent&&!!lab.querySelector("#ingestion-definition").textContent);}
   select(2);lab.querySelector("#ingestion-next").click();check("Next works",index===3);
   lab.querySelector("#ingestion-prev").click();check("Previous works",index===2);
   select(6);lab.querySelector("#ingestion-next").click();check("Stage boundary",index===6);
   check("Oral exposure caveat",INGESTION_STAGES[5].evidence.includes("HYPOTHETICAL"));
   check("Preparation disclaimer visible",lab.querySelector(".ingestion-warning").textContent.includes("PSK or PSP"));
   check("Readback control present",!!lab.querySelector("#ingestion-read"));
  }catch(err){check("Unexpected exception "+String(err),false);}
  finally{index=previous;material=priorMaterial;lab.querySelector("#ingestion-material").value=material;render();}
  const passed=checks.filter(c=>c.pass).length;
  lab.querySelector("#ingestion-qa-result").textContent="Phase 15 browser checks: "+passed+"/"+checks.length+" passed\n"+checks.map(c=>(c.pass?"PASS ":"FAIL ")+c.n).join("\n")+"\nScope: educational DOM state; not in-vivo compound absorption, medical outcomes or clinical validation.";
 };
 window.addEventListener("pagehide",()=>{if("speechSynthesis" in window)window.speechSynthesis.cancel();},{once:true});
 render();
}
