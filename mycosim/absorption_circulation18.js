// Phase 18 extends the existing ingestion laboratory; educational, not pharmacokinetic prediction.
const CIRCULATION_STAGES=[{"key":"lumen","title":"Release within intestinal lumen","where":"Small intestinal lumen","mechanism":"Preparation, cooking, particle size, solubility and digestive conditions affect whether a constituent is released from its matrix.","barrier":"Luminal release is bioaccessibility, not absorption.","fate":"Unreleased or nonabsorbed material may continue to the colon or be eliminated in stool.","evidence":"Established food digestion; mushroom-specific release values require measurement","term":"Bioaccessibility","pron":"BY-oh-ak-sess-ih-BIL-ih-tee","definition":"Fraction of a food constituent liberated from the matrix into a potentially absorbable form."},{"key":"epithelium","title":"Crossing intestinal epithelium","where":"Enterocyte and tight-junction barrier","mechanism":"Transcellular transport, passive diffusion, transporter-mediated uptake and limited paracellular processes vary by molecular size and chemistry.","barrier":"Large heterogeneous polysaccharides are not presumed to cross intact epithelium as intact molecules.","fate":"Material not taken up can proceed to distal gut; possible immune sampling must be separately evidenced.","evidence":"Transport physiology established; intact dietary β-glucan systemic entry UNVERIFIED","term":"Enterocyte","pron":"EN-ter-oh-site","definition":"A specialized absorptive epithelial cell lining much of the small intestine."},{"key":"portal","title":"Portal venous transport","where":"Mesenteric veins → hepatic portal vein","mechanism":"Substances absorbed into intestinal blood capillaries commonly travel through portal blood to the liver before systemic circulation.","barrier":"Lymphatic uptake of some dietary lipids is a distinct route; not all absorbed substances follow the same path.","fate":"Portal delivery requires demonstrated uptake; no assumed blood concentration for mushroom polysaccharides.","evidence":"Established human circulatory anatomy; preparation-specific portal exposure unknown","term":"Portal circulation","pron":"POR-tul ser-kyoo-LAY-shun","definition":"Venous drainage from much of the gastrointestinal tract into the liver."},{"key":"liver","title":"Hepatic metabolism and first pass","where":"Hepatocyte and sinusoidal circulation","mechanism":"If a compound reaches the liver, enzyme families such as cytochrome P450s and conjugating enzymes may metabolize susceptible substrates.","barrier":"Metabolism is structure-dependent; a compound is not automatically a CYP450 substrate.","fate":"Parent molecules and metabolites may enter systemic blood or be eliminated in bile, depending on evidence.","evidence":"Established general hepatic physiology; specific fungal constituent pathways NOT characterized here","term":"First-pass metabolism","pron":"FIRST pass muh-TAB-uh-liz-um","definition":"Biotransformation during intestinal and hepatic passage before systemic circulation."},{"key":"systemic","title":"Systemic circulation and distribution","where":"Heart, plasma and peripheral tissues","mechanism":"Only material entering systemic circulation can be distributed by blood; protein binding, tissue barriers and clearance influence concentrations.","barrier":"Presence in the gut is not equivalent to measurable plasma exposure or distribution to a tissue.","fate":"No numerical concentration or brain tissue exposure can be assigned without compound-specific human pharmacokinetic data.","evidence":"Established circulation and distribution principles; oral mushroom systemic exposures UNCERTAIN","term":"Bioavailability","pron":"BY-oh-uh-vay-luh-BIL-ih-tee","definition":"Extent and sometimes rate of a substance reaching systemic circulation after administration, depending on context."},{"key":"neural","title":"Neural tissue and blood–brain barrier","where":"Brain microvascular endothelium","mechanism":"Specialized cerebral vessels regulate molecular access through transporters, tight junctions and metabolic processes.","barrier":"Detection in plasma does not prove entry into brain tissue, receptor engagement or behavioral effect.","fate":"A Turkey Tail powder → systemic β-glucan → neural benefit mechanism remains HYPOTHETICAL without direct evidence.","evidence":"Blood–brain barrier physiology established; mushroom-derived clinical neural effects NOT established","term":"Blood–brain barrier","pron":"BLUD BRAYN BAIR-ee-er","definition":"Specialized vascular and cellular interfaces that regulate exchange between blood and the central nervous system."},{"key":"elimination","title":"Elimination and excretion","where":"Kidneys, bile, intestine and stool","mechanism":"Water-soluble metabolites may be cleared via kidneys; some compounds enter bile; unabsorbed material exits through stool.","barrier":"Route and time course depend on compound structure, dose and measured kinetics.","fate":"Neither a specific half-life nor urinary recovery can be inferred for unspecified mushroom preparations.","evidence":"Human elimination physiology established; fungal component-specific clearance values UNKNOWN","term":"Clearance","pron":"KLEER-uns","definition":"Pharmacokinetic measure of the volume of fluid effectively cleared of a substance per unit time."}];

const ingestion=document.getElementById("myco-ingestion-lab");
if(ingestion&&!document.getElementById("myco-circulation18")){
const lab=document.createElement("section");lab.id="myco-circulation18";lab.setAttribute("aria-label","Phase 18 absorption liver circulation and elimination education");
lab.style.cssText="margin-top:16px;padding:14px;border:1px solid #63867e;border-radius:10px;background:#0e2024;color:#eef4ee";
lab.innerHTML='<style>#myco-circulation18 h3{font-size:18px;color:#f0dda8}#myco-circulation18 p{font-size:12px;line-height:1.55}#myco-circulation18 button,#myco-circulation18 select{background:#183238;border:1px solid #67877e;color:#f3f4f0;border-radius:7px;padding:9px;cursor:pointer}#myco-circulation18 button[aria-current=step]{background:#6e5428;border-color:#ead19a}#myco-circulation18 button:focus-visible{outline:2px solid #fff0b0}#myco-circulation18 .circulation-nodes,#myco-circulation18 .circulation-controls{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}#myco-circulation18 .circulation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}#myco-circulation18 .circulation-card{background:#162e31;border:1px solid #4d6d65;border-radius:9px;padding:11px}#myco-circulation18 .circulation-warning{border-left:3px solid #e6ba72;padding:10px;background:#2d241a}@media(max-width:680px){#myco-circulation18 .circulation-grid{grid-template-columns:1fr}}</style>'+
'<div class="kicker">PHASE 18 · ABSORPTION, LIVER AND CIRCULATION</div><h3>Human compound fate: gut → portal blood → liver → body → elimination</h3>'+
'<p class="circulation-warning">Educational physiology only. Bioaccessibility is not bioavailability; plasma detection is not brain delivery; ordinary mushroom powder is not interchangeable with standardized PSK/PSP extracts. No numerical absorption, clearance, clinical or neural outcome is predicted.</p>'+
'<label for="circulation-preparation">Preparation </label><select id="circulation-preparation"><option value="powder">Whole mushroom powder (heterogeneous)</option><option value="extract">Characterized extract (properties unspecified)</option><option value="small">Defined small molecule (identity unspecified)</option></select>'+
'<div id="circulation-steps" class="circulation-nodes" role="group" aria-label="Seven selectable absorption and circulation steps"></div>'+
'<div class="circulation-grid"><div class="circulation-card"><strong id="circulation-title"></strong><p id="circulation-location"></p><p id="circulation-mechanism"></p><p id="circulation-barrier"></p></div><div class="circulation-card"><strong>Disposition and evidence</strong><p id="circulation-fate"></p><p id="circulation-evidence"></p><p id="circulation-prep-note"></p></div></div>'+
'<div class="circulation-card" aria-live="polite"><strong id="circulation-term"></strong><p id="circulation-pron"></p><p id="circulation-definition"></p></div>'+
'<div class="circulation-controls"><button id="circulation-previous" type="button">Previous</button><button id="circulation-next" type="button">Next</button><button id="circulation-speak" type="button">🔊 Read stage and definition</button><button id="circulation-anatomy" type="button">View existing human 3D anatomy</button><button id="circulation-qa" type="button">Run Phase 18 QA</button></div>'+
'<pre id="circulation-report" role="status" style="white-space:pre-wrap;overflow-wrap:anywhere;background:#071619;border:1px solid #4f6b64;padding:10px;border-radius:8px;font:11px/1.5 monospace">Phase 18 not tested.</pre>';
ingestion.append(lab);
let index=0,preparation="powder";
const steps=lab.querySelector("#circulation-steps");
CIRCULATION_STAGES.forEach((stage,i)=>{const button=document.createElement("button");button.type="button";button.textContent=(i+1)+". "+stage.title;button.onclick=()=>select(i);steps.append(button);});
const buttons=[...steps.querySelectorAll("button")];
function prepNote(){
if(preparation==="extract")return "An extract requires measured composition, dose and molecular properties before an absorption route or metabolic fate can be estimated.";
if(preparation==="small")return "A specified small molecule may have a distinct transport and metabolic profile; identity, dose and empirical data are prerequisites.";
return "Whole powder contains variable particle sizes and mixtures of compounds; its total beta-glucan content cannot establish intact systemic uptake.";
}
function render(){
const stage=CIRCULATION_STAGES[index],fields={
"circulation-title":(index+1)+"/"+CIRCULATION_STAGES.length+" · "+stage.title,
"circulation-location":"Anatomy: "+stage.where,
"circulation-mechanism":"Mechanism: "+stage.mechanism,
"circulation-barrier":"Barrier: "+stage.barrier,
"circulation-fate":"Potential fate: "+stage.fate,
"circulation-evidence":"Evidence: "+stage.evidence,
"circulation-prep-note":"Preparation constraint: "+prepNote(),
"circulation-term":"Definition: "+stage.term,
"circulation-pron":"Pronunciation: "+stage.pron,
"circulation-definition":stage.definition
};
for(const [id,value] of Object.entries(fields))lab.querySelector("#"+id).textContent=value;
buttons.forEach((button,i)=>{if(i===index)button.setAttribute("aria-current","step");else button.removeAttribute("aria-current");});
}
function select(next){index=Math.max(0,Math.min(CIRCULATION_STAGES.length-1,next));window.speechSynthesis?.cancel?.();render();}
lab.querySelector("#circulation-preparation").onchange=e=>{preparation=e.target.value;render();};
lab.querySelector("#circulation-previous").onclick=()=>select(index-1);
lab.querySelector("#circulation-next").onclick=()=>select(index+1);
lab.querySelector("#circulation-speak").onclick=()=>{if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const stage=CIRCULATION_STAGES[index],utterance=new SpeechSynthesisUtterance(stage.title+". "+stage.mechanism+". "+stage.barrier+". "+stage.fate+". Evidence: "+stage.evidence+". "+stage.term+". "+stage.definition);utterance.lang="en-US";utterance.rate=.83;window.speechSynthesis.speak(utterance);};
lab.querySelector("#circulation-anatomy").onclick=()=>{if(window.MycoSimWorkspace?.activate("anatomy"))document.getElementById("tv-anatomy3d")?.scrollIntoView({behavior:"smooth",block:"start"});};
lab.querySelector("#circulation-qa").onclick=()=>{
const previous=index,previousPreparation=preparation,checks=[],check=(name,ok)=>checks.push({name,ok:!!ok});
try{
 check("Reuses Phase 15 digestion laboratory",lab.parentElement.id==="myco-ingestion-lab");
 check("Reuses Phase 9 parent",!!lab.closest("#tv-biology"));
 check("Preserves Phase 16 microbiome",!!document.getElementById("myco-microbiome"));
 check("Preserves Phase 17 immune signaling",!!document.getElementById("myco-immune17"));
 check("Preserves Phase 10 3D anatomy",!!document.getElementById("tv-anatomy3d"));
 check("Seven absorption and clearance steps",CIRCULATION_STAGES.length===7&&buttons.length===7);
 check("Three preparation categories",lab.querySelectorAll("#circulation-preparation option").length===3);
 for(let i=0;i<CIRCULATION_STAGES.length;i++){select(i);check("Stage "+(i+1)+" scientific annotation",buttons[i].getAttribute("aria-current")==="step"&&!!lab.querySelector("#circulation-evidence").textContent&&!!lab.querySelector("#circulation-pron").textContent&&!!lab.querySelector("#circulation-definition").textContent);}
 select(2);lab.querySelector("#circulation-next").click();check("Next step",index===3);
 lab.querySelector("#circulation-previous").click();check("Previous step",index===2);
 select(0);lab.querySelector("#circulation-previous").click();check("First boundary",index===0);
 select(6);lab.querySelector("#circulation-next").click();check("Last boundary",index===6);
 check("Neural uncertainty preserved",CIRCULATION_STAGES[5].fate.includes("HYPOTHETICAL"));
 check("No unverified dose modeling",lab.querySelector(".circulation-warning").textContent.includes("No numerical absorption"));
 check("Readback control",!!lab.querySelector("#circulation-speak"));
}catch(e){check("Unexpected test exception "+String(e),false);}
finally{index=previous;preparation=previousPreparation;lab.querySelector("#circulation-preparation").value=preparation;render();}
const passed=checks.filter(c=>c.ok).length;
lab.querySelector("#circulation-report").textContent="Phase 18 browser checks: "+passed+"/"+checks.length+" passed\n"+checks.map(c=>(c.ok?"PASS ":"FAIL ")+c.name).join("\n")+"\nEducational DOM smoke tests only; no measured bioavailability, pharmacokinetic parameters, clinical outcome or remote deployment validation.";
};
render();
}
