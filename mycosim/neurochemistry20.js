// Phase 20: consolidated receptor and mushroom neurochemistry teaching; NOT medical prediction.
const NEURO20_STEPS=[{"title":"NMDA receptor","mechanism":"Ionotropic glutamate receptor permeable to cations, including calcium in many contexts. Voltage-dependent Mg²⁺ block and co-agonist binding regulate activation.","role":"Excitatory neurotransmission and synaptic plasticity","evidence":"Established human/animal neurobiology; no Lion’s Mane NMDA agonism established","term":"NMDA","pron":"en em dee ay","definition":"N-methyl-D-aspartate receptor, a glutamate-gated ion channel."},{"title":"AMPA receptor","mechanism":"Fast glutamate-gated cation channel mediating much excitatory synaptic transmission; subunit composition influences permeability.","role":"Excitatory synaptic signaling","evidence":"Established basic neuroscience; dietary fungal modulation not demonstrated","term":"AMPA","pron":"AM-puh","definition":"Alpha-amino-3-hydroxy-5-methyl-4-isoxazolepropionic acid receptor."},{"title":"GABA signaling","mechanism":"GABA-A receptors are ligand-gated chloride/bicarbonate channels; GABA-B receptors signal through G proteins.","role":"Context-dependent inhibitory network regulation","evidence":"Established receptor mechanisms; avoid equating inhibition with sedation or clinical effects","term":"GABA","pron":"GAB-uh","definition":"Gamma-aminobutyric acid, a major inhibitory neurotransmitter in the adult brain."},{"title":"Serotonin receptors","mechanism":"5-HT receptor families include several G-protein-coupled subtypes and the ionotropic 5-HT3 receptor.","role":"Modulation of neural circuits and peripheral physiology","evidence":"Established receptor diversity; no generic 'serotonin increase' claim","term":"Serotonin","pron":"sair-oh-TOH-nin","definition":"5-hydroxytryptamine, a signaling molecule with central and peripheral functions."},{"title":"Dopamine pathways","mechanism":"D1-like and D2-like GPCR families modify neuronal signaling in context; effects differ across brain circuits.","role":"Motor control, reinforcement learning, cognition and neuroendocrine signaling","evidence":"Established dopamine anatomy; no fungal dopamine effect assumed","term":"Dopamine","pron":"DOH-puh-meen","definition":"Catecholamine neurotransmitter with several distinct neural pathways."},{"title":"BDNF / TrkB","mechanism":"Activity-dependent BDNF signaling through TrkB can engage intracellular pathways relevant to neuron survival and synaptic function.","role":"Neurotrophic signaling; cell-, time- and region-specific effects","evidence":"Established experimental neurobiology; supplement-driven human BDNF effect unproven","term":"BDNF","pron":"bee dee en eff","definition":"Brain-derived neurotrophic factor, a neurotrophin involved in neural function."},{"title":"Synaptic plasticity","mechanism":"LTP and LTD describe durable activity-dependent shifts in synaptic efficacy; receptor trafficking and gene regulation may contribute.","role":"Learning-related mechanisms, not guaranteed cognitive improvement","evidence":"Established neuroscience; cannot infer clinical improvement from an isolated marker","term":"Neuroplasticity","pron":"NOOR-oh-plas-TISS-ih-tee","definition":"Capacity of neural systems to change their structure or function."},{"title":"Lion’s Mane research","mechanism":"Hericenones are associated with fruiting-body chemistry; certain erinacines are associated with mycelial preparations. Biological assays vary by compound and preparation.","role":"Laboratory studies of neurotrophic-related signaling; limited heterogeneous human clinical studies of particular preparations","evidence":"IN VITRO and ANIMAL signals are not clinical proof. Human trials are small, preparation-specific and insufficient for broad health claims","term":"Hericium erinaceus","pron":"heh-RISS-ee-um air-in-AY-see-us","definition":"Scientific name for Lion’s Mane mushroom."}];
const LION20_EVIDENCE=[{"name":"Hericenones","preparation":"Mostly discussed in fruiting-body chemistry; not a uniform composition guarantee","mechanism":"Cell experiments investigating NGF-related mechanisms have been reported for selected molecules or extracts","evidence":"Preclinical; clinical relevance of isolated hericenones unresolved"},{"name":"Erinacines","preparation":"Certain diterpenoid metabolites, often investigated in cultured mycelium; identities A–S are not interchangeable","mechanism":"Some isolated erinacines or enriched preparations have preclinical neurobiological findings","evidence":"Preclinical evidence; human exposure and effects cannot be generalized"},{"name":"Whole Lion’s Mane fruiting body","preparation":"Variable mixture of fungal material; not equivalent to characterized mycelium or isolated erinacines","mechanism":"Small human studies have evaluated specific supplements and neuropsychological outcomes","evidence":"Limited, heterogeneous human trials; efficacy not established for arbitrary products"},{"name":"Mycelial extract","preparation":"Composition depends on species authentication, cultivation, extraction, standardization and assay","mechanism":"Some clinical/preclinical reports use mycelium-derived preparations","evidence":"Preparation-specific findings; cannot generalize to fruiting-body powders"}];

const host=document.getElementById("tv-molecular");
if(host&&!document.getElementById("myco-neuro20")){
const section=document.createElement("section");section.id="myco-neuro20";section.setAttribute("aria-label","Phase 20 neurochemistry and mushroom evidence education");
section.style.cssText="margin-top:15px;padding:15px;border:1px solid #63877e;border-radius:10px;background:#0e2026;color:#edf4f0";
section.innerHTML='<style>#myco-neuro20 h3{color:#f2dba5;font-size:19px}#myco-neuro20 p{font-size:12px;line-height:1.6}#myco-neuro20 button,#myco-neuro20 select{border:1px solid #67887f;background:#18353b;color:#f3f6f2;border-radius:7px;padding:9px;cursor:pointer}#myco-neuro20 button[aria-current=step]{background:#755728;border-color:#eed49b}#myco-neuro20 button:focus-visible{outline:2px solid #ffe2a3}#myco-neuro20 .neuro20-nav,#myco-neuro20 .neuro20-actions{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}#myco-neuro20 .neuro20-panel{border:1px solid #476d66;background:#162c32;border-radius:9px;padding:12px;margin-top:10px}#myco-neuro20 .neuro20-warning{border-left:3px solid #e9ba71;background:#2b241c;padding:10px}</style>'+
'<div class="kicker">PHASE 20 · NEUROCHEMISTRY / EVIDENCE LAB</div><h3>Receptors, synaptic plasticity and Lion’s Mane research</h3>'+
'<p class="neuro20-warning">Receptor diagrams show general neuroscience. They do not establish that Lion’s Mane or Turkey Tail reaches a human synapse, directly modulates these receptors or treats any neurological disease. Human supplement studies are small and preparation-specific.</p>'+
'<div id="neuro20-steps" class="neuro20-nav" role="group" aria-label="Eight selectable neurochemical concepts"></div>'+
'<div class="neuro20-panel" aria-live="polite"><strong id="neuro20-title"></strong><p id="neuro20-mechanism"></p><p id="neuro20-role"></p><p id="neuro20-evidence"></p><p id="neuro20-term"></p><p id="neuro20-pron"></p><p id="neuro20-definition"></p></div>'+
'<div class="neuro20-panel"><label for="neuro20-compound">Lion’s Mane preparation / compound evidence </label><select id="neuro20-compound"><option value="0">Hericenones</option><option value="1">Erinacines</option><option value="2">Whole fruiting-body preparation</option><option value="3">Mycelial extract</option></select><p id="neuro20-chemistry"></p><p id="neuro20-study"></p><p id="neuro20-grade"></p></div>'+
'<div class="neuro20-actions"><button id="neuro20-prev" type="button">Previous</button><button id="neuro20-next" type="button">Next</button><button id="neuro20-read" type="button">🔊 Narrate science and definition</button><button id="neuro20-gut" type="button">View gut–brain interface</button><button id="neuro20-3d" type="button">View existing 3D anatomy</button><button id="neuro20-qa" type="button">Run Phase 20 QA</button></div>'+
'<pre id="neuro20-report" role="status" style="white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.5 monospace;background:#091719;border:1px solid #4a6d63;padding:10px;border-radius:8px">Phase 20 QA not run.</pre>';
host.append(section);
let index=0,compound=0;
const nav=section.querySelector("#neuro20-steps");NEURO20_STEPS.forEach((s,i)=>{const b=document.createElement("button");b.type="button";b.textContent=(i+1)+". "+s.title;b.onclick=()=>select(i);nav.append(b);});
const buttons=[...nav.querySelectorAll("button")];
function render(){
 const s=NEURO20_STEPS[index],c=LION20_EVIDENCE[compound];
 const values={
 "neuro20-title":(index+1)+"/"+NEURO20_STEPS.length+" · "+s.title,
 "neuro20-mechanism":"Molecular mechanism: "+s.mechanism,
 "neuro20-role":"Neural function: "+s.role,
 "neuro20-evidence":"Mechanism evidence: "+s.evidence,
 "neuro20-term":"Definition: "+s.term,
 "neuro20-pron":"Pronunciation: "+s.pron,
 "neuro20-definition":s.definition,
 "neuro20-chemistry":"Preparation / identity: "+c.preparation,
 "neuro20-study":"Research setting: "+c.mechanism,
 "neuro20-grade":"Evidence classification: "+c.evidence
 };
 for(const [id,value] of Object.entries(values))section.querySelector("#"+id).textContent=value;
 buttons.forEach((b,i)=>{if(i===index)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current");});
}
function select(next){index=Math.max(0,Math.min(NEURO20_STEPS.length-1,next));window.speechSynthesis?.cancel?.();render();}
section.querySelector("#neuro20-compound").onchange=e=>{compound=Number(e.target.value);render();};
section.querySelector("#neuro20-prev").onclick=()=>select(index-1);
section.querySelector("#neuro20-next").onclick=()=>select(index+1);
section.querySelector("#neuro20-read").onclick=()=>{
 if(!("speechSynthesis" in window))return;
 window.speechSynthesis.cancel();const s=NEURO20_STEPS[index],c=LION20_EVIDENCE[compound];
 const u=new SpeechSynthesisUtterance(s.title+". "+s.mechanism+". "+s.role+". "+s.evidence+". "+s.term+". "+s.definition+". Lion's Mane evidence: "+c.name+". "+c.evidence);
 u.lang="en-US";u.rate=.83;window.speechSynthesis.speak(u);
};
section.querySelector("#neuro20-gut").onclick=()=>{if(window.MycoSimWorkspace?.activate("digestion"))document.getElementById("myco-neural19")?.scrollIntoView({block:"start",behavior:"smooth"});};
section.querySelector("#neuro20-3d").onclick=()=>{if(window.MycoSimWorkspace?.activate("anatomy"))document.getElementById("tv-anatomy3d")?.scrollIntoView({block:"start",behavior:"smooth"});};
section.querySelector("#neuro20-qa").onclick=()=>{
 const old=index,oldCompound=compound,checks=[],check=(name,ok)=>checks.push({name,ok:!!ok});
 try{
  check("Reuses molecular pathway",section.parentElement.id==="tv-molecular");
  check("Reuses existing gut-brain interface",!!document.getElementById("myco-neural19"));
  check("Preserves immune signaling",!!document.getElementById("myco-immune17"));
  check("Preserves 3D anatomy",!!document.getElementById("tv-anatomy3d"));
  check("Eight receptor and plasticity stages",NEURO20_STEPS.length===8&&buttons.length===8);
  check("Four evidence-specific preparations",LION20_EVIDENCE.length===4&&section.querySelectorAll("#neuro20-compound option").length===4);
  for(let i=0;i<NEURO20_STEPS.length;i++){select(i);check("Concept "+(i+1)+" definitions and evidence",buttons[i].getAttribute("aria-current")==="step"&&!!section.querySelector("#neuro20-pron").textContent&&!!section.querySelector("#neuro20-evidence").textContent&&!!section.querySelector("#neuro20-definition").textContent);}
  for(let i=0;i<LION20_EVIDENCE.length;i++){compound=i;render();check("Evidence class "+(i+1),!!section.querySelector("#neuro20-grade").textContent&&!!section.querySelector("#neuro20-chemistry").textContent);}
  select(2);section.querySelector("#neuro20-next").click();check("Next",index===3);
  section.querySelector("#neuro20-prev").click();check("Previous",index===2);
  select(0);section.querySelector("#neuro20-prev").click();check("Start boundary",index===0);
  select(7);section.querySelector("#neuro20-next").click();check("End boundary",index===7);
  check("Clinical uncertainty",section.querySelector(".neuro20-warning").textContent.includes("do not establish"));
  check("Readback control",!!section.querySelector("#neuro20-read"));
 }catch(e){check("Unexpected error "+String(e),false);}
 finally{index=old;compound=oldCompound;section.querySelector("#neuro20-compound").value=String(compound);render();}
 const passed=checks.filter(x=>x.ok).length;
 section.querySelector("#neuro20-report").textContent="Phase 20 browser checks: "+passed+"/"+checks.length+" passed\n"+checks.map(x=>(x.ok?"PASS ":"FAIL ")+x.name).join("\n")+"\nEducational DOM QA only; not pharmacodynamic validation, human efficacy proof or completed remote integration.";
};
render();
}
