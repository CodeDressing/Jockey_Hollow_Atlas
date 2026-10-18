// Phase 19: integrated gut-brain route; no new 3D renderer, no clinical predictions.
const NEURAL19_STEPS=[{"key":"ens","title":"Enteric neural circuits","mechanism":"Intrinsic primary afferent neurons, interneurons and enteric motor neurons coordinate gastrointestinal reflexes.","barrier":"ENS networks operate locally; brain control is not required for every gut reflex.","evidence":"Established enteric neuroanatomy; mushroom-specific modulation unverified","term":"Enteric plexus","pron":"en-TAIR-ik PLEK-sus","definition":"Interconnected neuronal networks within the gut wall."},{"key":"vagal","title":"Vagal afferent signaling","mechanism":"Vagal sensory neurons convey physiological information from visceral targets toward the brainstem, including nodose ganglion and nucleus tractus solitarius pathways.","barrier":"Many luminal contents do not contact vagal endings directly; epithelial and endocrine intermediates can matter.","evidence":"Established vagal anatomy; direct oral fungal compound signal NOT established","term":"Nucleus tractus solitarius","pron":"NOO-klee-us TRAK-tus soh-lih-TAIR-ee-us","definition":"A brainstem nucleus receiving substantial visceral sensory input, including from the vagus nerve."},{"key":"immune","title":"Mucosal immune mediators","mechanism":"Immune cells and epithelia communicate through cytokines and other signaling mediators that can participate in neuroimmune pathways.","barrier":"Cytokine release does not imply a beneficial or harmful brain outcome without quantitative, contextual evidence.","evidence":"Established neuroimmune pathways; oral Turkey Tail-specific neural effects HYPOTHETICAL","term":"Neuroimmune signaling","pron":"NOOR-oh ih-MYOON SIG-nuh-ling","definition":"Bidirectional communication among neural and immune systems."},{"key":"endocrine","title":"Enteroendocrine communication","mechanism":"Enteroendocrine cells release signals such as GLP-1 and PYY in response to nutrient and other luminal cues.","barrier":"These cells are not a generic sensor of all fungal constituents; effects are receptor- and context-dependent.","evidence":"Established gastrointestinal endocrinology; product-specific hormonal change NOT inferred","term":"Enteroendocrine cell","pron":"EN-ter-oh EN-doh-krin sell","definition":"A specialized gut epithelial cell that produces hormone signals."},{"key":"metabolites","title":"Microbial metabolites and exposure","mechanism":"Microbially derived metabolites, including some SCFAs, can affect host cells; systemic distribution depends on absorption and metabolism.","barrier":"Microbial production does not guarantee brain penetration or a specific receptor response.","evidence":"General metabolite physiology established; mushroom-specific human brain mechanisms uncertain","term":"Short-chain fatty acid","pron":"SHORT CHAYN FAT-ee ASS-id","definition":"A small fatty acid with a short carbon chain, including acetate, propionate and butyrate."},{"key":"bbb","title":"Blood–brain barrier","mechanism":"Brain endothelial tight junctions, transport systems and associated cells restrict or regulate circulating molecule access.","barrier":"Plasma exposure is not proof of brain exposure. Intact oral fungal β-glucan delivery to brain is NOT established.","evidence":"Established barrier biology; direct fungal compound neural delivery unverified","term":"Neurovascular unit","pron":"NOOR-oh VAS-kyoo-ler YOO-nit","definition":"Endothelial, mural, glial and neuronal components supporting brain microvascular function."},{"key":"circuits","title":"Brainstem and higher neural circuits","mechanism":"Visceral afferents reach brainstem nuclei that participate in autonomic regulation; information can influence hypothalamic, limbic and cortical systems.","barrier":"This is a pathway map, not a predicted mood, memory, cognition, or psychiatric treatment outcome.","evidence":"Human circuit anatomy supported; fungal preparation clinical efficacy NOT established","term":"Hypothalamus","pron":"HY-poh-THAL-uh-mus","definition":"A forebrain region coordinating autonomic, endocrine and homeostatic functions."},{"key":"atlas","title":"Neural Systems Atlas research handoff","mechanism":"The atlas cross-reference describes candidate anatomical and molecular nodes for future research, rather than live synchronized data.","barrier":"Evidence provenance, molecule identity, quantified exposure and clinical relevance must be verified before extending to pharmacodynamics.","evidence":"Local educational handoff only; Neural Systems Atlas remote sync NOT TESTED","term":"Pharmacodynamics","pron":"FAR-muh-koh-dye-NAM-iks","definition":"Study of how substances affect biological systems, including concentration–effect relationships."}];

const microbiome=document.getElementById("myco-microbiome");
if(microbiome&&!document.getElementById("myco-neural19")){
const lab=document.createElement("section");lab.id="myco-neural19";lab.setAttribute("aria-label","Phase 19 integrated gut brain and neural systems");
lab.style.cssText="margin-top:16px;padding:14px;border:1px solid #63857d;border-radius:10px;background:#0c2026;color:#ecf3ed";
lab.innerHTML='<style>#myco-neural19 h3{color:#f2dca9;font-size:18px}#myco-neural19 p{font-size:12px;line-height:1.6}#myco-neural19 button,#myco-neural19 select{border:1px solid #64887c;border-radius:7px;background:#193339;color:#f0f4ec;padding:9px;cursor:pointer}#myco-neural19 button:focus-visible{outline:2px solid #ffdfa5}#myco-neural19 button[aria-current=step]{border-color:#edcf8c;background:#6b552b}#myco-neural19 .neural19-steps,#myco-neural19 .neural19-controls{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}#myco-neural19 .neural19-card{background:#142e34;border:1px solid #486b65;border-radius:8px;padding:11px;margin:9px 0}#myco-neural19 .neural19-warning{border-left:3px solid #e0b66d;background:#2b241b;padding:10px}</style>'+
'<div class="kicker">PHASE 19 · GUT–BRAIN / NEURAL SYSTEMS INTEGRATION</div><h3>Enteric → vagal → immune and endocrine → brain circuits</h3>'+
'<p class="neural19-warning">This is an evidence-aware educational sequence. Gut–brain physiology does not demonstrate that eating mushroom powder activates any particular neural circuit, delivers polysaccharides across the blood–brain barrier, or provides clinical benefit. Remote Atlas synchronization is NOT implemented.</p>'+
'<label for="neural19-route">Compare communication route </label><select id="neural19-route"><option value="neural">Neural / enteric / vagal</option><option value="immune">Immune / inflammatory mediators</option><option value="endocrine">Endocrine and metabolic mediators</option></select>'+
'<div class="neural19-steps" role="group" id="neural19-steps" aria-label="Eight selectable gut brain signaling stages"></div>'+
'<div class="neural19-card" aria-live="polite"><strong id="neural19-title"></strong><p id="neural19-mechanism"></p><p id="neural19-barrier"></p><p id="neural19-evidence"></p><p id="neural19-route-note"></p><strong id="neural19-term"></strong><p id="neural19-pron"></p><p id="neural19-definition"></p></div>'+
'<div class="neural19-controls"><button type="button" id="neural19-prev">Previous</button><button type="button" id="neural19-next">Next</button><button type="button" id="neural19-read">🔊 Read explanation</button><button type="button" id="neural19-3d">Existing 3D human anatomy</button><button type="button" id="neural19-immune">Existing molecular immune signaling</button><button type="button" id="neural19-qa">Run Phase 19 QA</button></div>'+
'<pre id="neural19-report" role="status" style="white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.5 monospace;background:#091619;border:1px solid #52756b;padding:10px;border-radius:8px">Phase 19 not yet tested.</pre>';
microbiome.append(lab);
let index=0,route="neural";
const nodes=lab.querySelector("#neural19-steps");NEURAL19_STEPS.forEach((s,i)=>{const b=document.createElement("button");b.type="button";b.textContent=(i+1)+". "+s.title;b.onclick=()=>select(i);nodes.append(b);});
const buttons=[...nodes.querySelectorAll("button")];
const routeNotes={
neural:"Neural route: ENS reflexes and vagal afferents are anatomically established; a specific diet-to-brain outcome is not presumed.",
immune:"Immune route: cytokine and epithelial communication is context-dependent; no cytokine increase or health benefit is predicted.",
endocrine:"Endocrine/metabolic route: enteroendocrine hormones and circulating metabolites require substrate- and receptor-specific evidence."
};
function render(){
 const s=NEURAL19_STEPS[index],fields={
 "neural19-title":(index+1)+"/"+NEURAL19_STEPS.length+" · "+s.title,
 "neural19-mechanism":"Mechanism: "+s.mechanism,
 "neural19-barrier":"Exposure and causality boundary: "+s.barrier,
 "neural19-evidence":"Evidence: "+s.evidence,
 "neural19-route-note":routeNotes[route],
 "neural19-term":"Definition: "+s.term,
 "neural19-pron":"Pronunciation: "+s.pron,
 "neural19-definition":s.definition
 };
 for(const [id,value] of Object.entries(fields))lab.querySelector("#"+id).textContent=value;
 buttons.forEach((b,i)=>{if(i===index)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current");});
}
function select(next){index=Math.max(0,Math.min(NEURAL19_STEPS.length-1,next));window.speechSynthesis?.cancel?.();render();}
lab.querySelector("#neural19-route").onchange=e=>{route=e.target.value;render();};
lab.querySelector("#neural19-prev").onclick=()=>select(index-1);
lab.querySelector("#neural19-next").onclick=()=>select(index+1);
lab.querySelector("#neural19-read").onclick=()=>{
 if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const s=NEURAL19_STEPS[index];
 const u=new SpeechSynthesisUtterance(s.title+". "+s.mechanism+". "+s.barrier+". Evidence: "+s.evidence+". "+s.term+": "+s.definition);u.lang="en-US";u.rate=.82;window.speechSynthesis.speak(u);
};
lab.querySelector("#neural19-3d").onclick=()=>{if(window.MycoSimWorkspace?.activate("anatomy"))document.getElementById("tv-anatomy3d")?.scrollIntoView({block:"start",behavior:"smooth"});};
lab.querySelector("#neural19-immune").onclick=()=>{if(window.MycoSimWorkspace?.activate("pathways"))document.getElementById("myco-immune17")?.scrollIntoView({block:"start",behavior:"smooth"});};
lab.querySelector("#neural19-qa").onclick=()=>{
 const old=index,oldRoute=route,checks=[],check=(name,value)=>checks.push({name,pass:!!value});
 try{
  check("Extends Phase 16 microbiome",lab.parentElement.id==="myco-microbiome");
  check("Preserves Phase 15 ingestion",!!lab.closest("#myco-ingestion-lab"));
  check("Preserves Phase 17 molecular module",!!document.getElementById("myco-immune17"));
  check("Preserves Phase 18 circulation",!!document.getElementById("myco-circulation18"));
  check("Preserves original 3D anatomy",!!document.getElementById("tv-anatomy3d"));
  check("Eight neural interface stages",NEURAL19_STEPS.length===8&&buttons.length===8);
  check("Three distinct communication routes",lab.querySelectorAll("#neural19-route option").length===3);
  for(let i=0;i<NEURAL19_STEPS.length;i++){select(i);check("Stage "+(i+1)+" complete",buttons[i].getAttribute("aria-current")==="step"&&!!lab.querySelector("#neural19-pron").textContent&&!!lab.querySelector("#neural19-definition").textContent&&!!lab.querySelector("#neural19-evidence").textContent);}
  route="immune";render();check("Immune pathway context",lab.querySelector("#neural19-route-note").textContent.includes("cytokine"));
  select(2);lab.querySelector("#neural19-next").click();check("Next",index===3);
  lab.querySelector("#neural19-prev").click();check("Previous",index===2);
  select(0);lab.querySelector("#neural19-prev").click();check("Start boundary",index===0);
  select(7);lab.querySelector("#neural19-next").click();check("End boundary",index===7);
  check("Causality warning",lab.querySelector(".neural19-warning").textContent.includes("does not demonstrate"));
  check("No remote sync claim",NEURAL19_STEPS[7].evidence.includes("NOT TESTED"));
  check("Readback control",!!lab.querySelector("#neural19-read"));
 }catch(e){check("Unexpected exception "+String(e),false);}
 finally{index=old;route=oldRoute;lab.querySelector("#neural19-route").value=route;render();}
 const n=checks.filter(x=>x.pass).length;
 lab.querySelector("#neural19-report").textContent="Phase 19 browser checks: "+n+"/"+checks.length+" passed\n"+checks.map(x=>(x.pass?"PASS ":"FAIL ")+x.name).join("\n")+"\nConceptual DOM test only; scientific peer review, physiological exposure and remote Atlas sync unverified.";
};
render();
}
