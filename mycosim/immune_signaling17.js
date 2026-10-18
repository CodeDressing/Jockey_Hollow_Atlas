// Phase 17 shared immune-signaling learning view. Does not create another renderer.
const IMMUNE_STEPS=[{"id":"cells","title":"Immune cell context","location":"Macrophage, dendritic cell, and intestinal epithelial cell","mechanism":"Macrophages and some dendritic cells can express Dectin-1/CLEC7A; receptor expression varies by cell state and tissue. Epithelial immune communication is related but not identical.","evidence":"Cell-type expression supported experimentally; not proof of a response to dietary powder","term":"Macrophage","pron":"MAK-roh-fayj","definition":"An innate immune cell capable of phagocytosis, antigen presentation, and cytokine production."},{"id":"ligand","title":"Ligand accessibility","location":"β-glucan, cell wall, physical form","mechanism":"Receptor activity depends on accessible ligand structure, particle presentation, and where cell and ligand meet; oral ingestion alone does not establish contact.","evidence":"Mechanistic receptor studies; oral bioavailability and access UNVERIFIED","term":"Ligand","pron":"LIG-and","definition":"A molecule that can bind to a specified receptor or other molecular binding site."},{"id":"dectin","title":"Receptor engagement","location":"Dectin-1 / CLEC7A","mechanism":"Fungal β-glucans can engage Dectin-1 under suitable conditions. Co-receptors and organism context can alter response.","evidence":"Established cell and biochemical mechanism; conditional receptor engagement","term":"Dectin-1","pron":"DEK-tin one","definition":"An innate immune C-type lectin receptor that recognizes accessible fungal β-glucans."},{"id":"hemitam","title":"hemITAM phosphorylation","location":"Receptor cytoplasmic tyrosine motif","mechanism":"A hemITAM tyrosine can be phosphorylated following productive receptor engagement; phosphorylation helps recruit signaling machinery.","evidence":"Mechanistic phosphorylation pathway in experimental cells","term":"hemITAM","pron":"HEM EYE-tam","definition":"A single YxxL-based immunoreceptor tyrosine activation motif with context-dependent signaling."},{"id":"syk","title":"SYK recruitment and activation","location":"SYK tyrosine kinase","mechanism":"SYK binds phosphorylated receptor-associated motifs and participates in downstream signaling, with contextual regulation.","evidence":"Well-characterized intracellular signaling; cell context matters","term":"SYK","pron":"sick","definition":"Spleen tyrosine kinase, an enzyme involved in immunoreceptor signaling."},{"id":"card9","title":"CARD9–BCL10–MALT1 signaling","location":"Adaptor signaling complex","mechanism":"CARD9, BCL10 and MALT1 support signal propagation toward downstream inflammatory transcriptional pathways in relevant cell types.","evidence":"Mechanistic signaling supported by genetic and cellular experiments","term":"CARD9","pron":"card nine","definition":"Caspase recruitment domain-containing protein 9, an innate immune signaling adaptor."},{"id":"nfkb","title":"NF-κB and cytokines","location":"Transcription and mediator secretion","mechanism":"Downstream IKK/NF-κB activation can change transcription of context-dependent inflammatory mediators, including selected cytokines. Direction, magnitude and clinical meaning are not predetermined.","evidence":"Conditional cell mechanism; no individual health outcome predicted","term":"NF-κB","pron":"EN EFF KAP-uh BEE","definition":"Nuclear factor kappa B, a family of transcription factors involved in immune and other cellular responses."},{"id":"neural","title":"Mucosal to neural interface","location":"Local cytokines, ENS, vagal afferents","mechanism":"Neural, immune, endocrine and metabolic gut–brain communication occurs in humans, but a specific mushroom powder → Dectin-1 → neural benefit chain has NOT been established.","evidence":"General physiology established; oral fungal compound to neural outcome HYPOTHETICAL","term":"Cytokine","pron":"SY-toh-kine","definition":"A signaling protein that helps coordinate immune and other cellular responses."}];

const molecular=document.getElementById("tv-molecular");
if(molecular&&!document.getElementById("myco-immune17")){
 const lab=document.createElement("section");lab.id="myco-immune17";lab.setAttribute("aria-label","Human immune system and molecular signaling pathway");
 lab.style.cssText="margin-top:15px;border:1px solid #5b827a;border-radius:12px;padding:14px;background:#101e23;color:#eaf2ed";
 lab.innerHTML='<style>#myco-immune17 h3{font-size:18px;color:#eddaa8}#myco-immune17 button,#myco-immune17 select{background:#173236;border:1px solid #638b82;color:#f1f5ef;border-radius:7px;padding:9px;cursor:pointer}#myco-immune17 button[aria-current="step"]{background:#705829;border-color:#eacb8b}#myco-immune17 button:focus-visible{outline:2px solid #ffe1a6}#myco-immune17 .immune17-controls{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}#myco-immune17 .immune17-card{border:1px solid #44655e;border-radius:9px;padding:12px;margin:9px 0;background:#14292d}#myco-immune17 .immune17-warning{border-left:3px solid #ddb36d;background:#29241a;padding:10px}#myco-immune17 p{font-size:12px;line-height:1.6}</style>'+
 '<div class="kicker">PHASE 17 · CONSOLIDATED MOLECULAR SIGNALING</div><h3>Innate immune cells → Dectin-1 → transcription → neural context</h3>'+
 '<p class="immune17-warning">This is a conceptual human-cell signaling model. Mushroom ingestion is NOT evidence that intact fungal glucans contact a human Dectin-1 receptor, alter cytokines, or improve neurological health. No clinical outcome is predicted.</p>'+
 '<label for="immune17-cell">Cellular context </label><select id="immune17-cell"><option value="macrophage">Macrophage</option><option value="dendritic">Dendritic cell</option><option value="epithelial">Intestinal epithelial cell (indirect/context-dependent signaling)</option></select>'+
 '<div id="immune17-steps" class="immune17-controls" role="group" aria-label="Molecular signaling sequence"></div>'+
 '<div class="immune17-card" aria-live="polite"><strong id="immune17-title"></strong><p id="immune17-cell-note"></p><p id="immune17-location"></p><p id="immune17-mechanism"></p><p id="immune17-evidence"></p><p id="immune17-term"></p><p id="immune17-pron"></p><p id="immune17-definition"></p></div>'+
 '<div class="immune17-controls"><button type="button" id="immune17-prev">Previous</button><button type="button" id="immune17-next">Next</button><button type="button" id="immune17-read">🔊 Read pathway and definition</button><button type="button" id="immune17-anatomy">View existing 3D immune anatomy</button><button type="button" id="immune17-qa">Run Phase 17 QA</button></div>'+
 '<pre id="immune17-report" role="status" style="white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.5 monospace;background:#091416;padding:10px;border:1px solid #55746a;border-radius:8px">Phase 17 not tested.</pre>';
 molecular.append(lab);
 const buttons=lab.querySelector("#immune17-steps");let index=0,cell="macrophage";
 IMMUNE_STEPS.forEach((step,i)=>{const btn=document.createElement("button");btn.type="button";btn.textContent=(i+1)+". "+step.title;btn.onclick=()=>select(i);buttons.append(btn);});
 const nodes=[...buttons.querySelectorAll("button")];
 const notes={
  macrophage:"Macrophages are phagocytic innate immune cells. Dectin-1 expression and responses depend on activation state and tissue context.",
  dendritic:"Dendritic cell subsets vary in expression of Dectin-1 and antigen-presentation functions. Do not generalize every dendritic cell.",
  epithelial:"Intestinal epithelial cells form a barrier and can signal to immune cells; do not assume they express functional Dectin-1 equivalently to macrophages."
 };
 function render(){
  const s=IMMUNE_STEPS[index],fields={
   "immune17-title":(index+1)+"/"+IMMUNE_STEPS.length+" · "+s.title,
   "immune17-cell-note":"Selected cell: "+notes[cell],
   "immune17-location":"Structure: "+s.location,
   "immune17-mechanism":"Mechanism: "+s.mechanism,
   "immune17-evidence":"Evidence classification: "+s.evidence,
   "immune17-term":"Definition: "+s.term,
   "immune17-pron":"Pronunciation: "+s.pron,
   "immune17-definition":s.definition
  };
  for(const [id,value] of Object.entries(fields))lab.querySelector("#"+id).textContent=value;
  nodes.forEach((b,i)=>{if(i===index)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current");});
 }
 function select(next){index=Math.max(0,Math.min(IMMUNE_STEPS.length-1,next));window.speechSynthesis?.cancel?.();render();}
 lab.querySelector("#immune17-cell").onchange=e=>{cell=e.target.value;render();};
 lab.querySelector("#immune17-prev").onclick=()=>select(index-1);
 lab.querySelector("#immune17-next").onclick=()=>select(index+1);
 lab.querySelector("#immune17-read").onclick=()=>{
  if(!("speechSynthesis" in window))return;
  window.speechSynthesis.cancel();
  const s=IMMUNE_STEPS[index],u=new SpeechSynthesisUtterance(s.title+". "+notes[cell]+". "+s.mechanism+". Evidence: "+s.evidence+". "+s.term+": "+s.definition);
  u.rate=.83;u.lang="en-US";window.speechSynthesis.speak(u);
 };
 lab.querySelector("#immune17-anatomy").onclick=()=>{if(window.MycoSimWorkspace?.activate("anatomy"))document.getElementById("tv-anatomy3d")?.scrollIntoView({block:"start",behavior:"smooth"});};
 lab.querySelector("#immune17-qa").onclick=()=>{
  const old=index,oldCell=cell,results=[];const check=(name,ok)=>results.push({name,ok:!!ok});
  try{
   check("Consolidated within Phase 11 pathway",lab.parentElement.id==="tv-molecular");
   check("Original Phase 9 digestion retained",!!document.getElementById("tv-biology"));
   check("Original Phase 10 immune anatomy retained",!!document.getElementById("tv-anatomy3d"));
   check("Eight mechanistic stages",IMMUNE_STEPS.length===8&&nodes.length===8);
   check("Three cellular contexts",lab.querySelectorAll("#immune17-cell option").length===3);
   for(let i=0;i<IMMUNE_STEPS.length;i++){select(i);check("Stage "+(i+1)+" annotated",nodes[i].getAttribute("aria-current")==="step"&&!!lab.querySelector("#immune17-definition").textContent&&!!lab.querySelector("#immune17-evidence").textContent);}
   lab.querySelector("#immune17-cell").value="epithelial";lab.querySelector("#immune17-cell").dispatchEvent(new Event("change"));check("Epithelial context differentiated",lab.querySelector("#immune17-cell-note").textContent.includes("barrier"));
   select(2);lab.querySelector("#immune17-next").click();check("Next advances",index===3);
   lab.querySelector("#immune17-prev").click();check("Previous returns",index===2);
   select(0);lab.querySelector("#immune17-prev").click();check("Start boundary",index===0);
   select(7);lab.querySelector("#immune17-next").click();check("End boundary",index===7);
   check("Human outcome uncertainty",IMMUNE_STEPS[7].evidence.includes("HYPOTHETICAL")&&lab.querySelector(".immune17-warning").textContent.includes("NOT evidence"));
   check("Readback is available",!!lab.querySelector("#immune17-read"));
  }catch(e){check("Unexpected error "+String(e),false);}
  finally{index=old;cell=oldCell;lab.querySelector("#immune17-cell").value=cell;render();}
  const passed=results.filter(x=>x.ok).length;
  lab.querySelector("#immune17-report").textContent="Phase 17 browser checks: "+passed+"/"+results.length+" passed\n"+results.map(x=>(x.ok?"PASS ":"FAIL ")+x.name).join("\n")+"\nScientific cell-model and in-vivo clinical validation not performed.";
 };
 render();
}
