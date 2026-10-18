// Phase 16: microbiome, intestinal barrier and enteric neural education.
// Extends the existing Phase 15 ingestion subview; no new independent renderer.
const MICROBIOME_STAGES=[{"key":"substrate","name":"Substrate reaches colon","structure":"Undigested or incompletely digested carbohydrates may enter the colon; fate depends on linkage, processing, solubility and particle size.","organism":"A microbial community, not an individual bacterial species, encounters the substrate.","metabolite":"No fixed metabolite yield can be inferred from mushroom-powder mass.","barrier":"The intestinal lumen remains separated from host tissue by mucus and epithelium.","axis":"No direct brain effect is implied.","evidence":"General human GI physiology established; mushroom-substrate fate depends on characterization","term":"Substrate","pron":"SUB-strayt","definition":"A substance used or transformed during an enzymatic or microbial reaction."},{"key":"fermentation","name":"Microbial fermentation","structure":"Some microbial taxa possess carbohydrate-active enzymes able to break down particular complex carbohydrates.","organism":"Community composition, cross-feeding and transit change which transformations occur.","metabolite":"Depending on substrate and community, acetate, propionate, butyrate and gases may be formed.","barrier":"Fermentation occurs primarily within the lumen, not inside neurons.","axis":"A gut-microbe pathway is not evidence that eating Turkey Tail improves cognition.","evidence":"Fermentation mechanisms well established; specific oral Turkey Tail effects vary and require controlled human studies","term":"Cross-feeding","pron":"KROSS FEE-ding","definition":"When metabolites produced by one microbial population are consumed by another."},{"key":"scfa","name":"Short-chain fatty acids","structure":"Acetate, propionate and butyrate are small microbial fermentation products; their production is substrate-dependent.","organism":"No single microbe or mushroom dose guarantees a specified SCFA profile.","metabolite":"Butyrate can fuel colonocytes; acetate and propionate have varied host metabolic roles.","barrier":"Absorption depends on epithelial transport and local metabolism; amounts are not assumed.","axis":"Physiological gut–brain signaling may involve downstream neural, endocrine and immune routes, not automatic brain entry by every metabolite.","evidence":"Human SCFA physiology established; product-specific human neural outcomes NOT established","term":"Butyrate","pron":"BYOO-tuh-rayt","definition":"A four-carbon short-chain fatty acid produced by certain intestinal microbial fermentations."},{"key":"barrier","name":"Mucus and epithelial barrier","structure":"A mucus layer, intestinal epithelial cells and tight junctions regulate contact between luminal contents and host tissues.","organism":"Microbes normally remain largely compartmentalized from internal tissues.","metabolite":"Metabolite presence in the lumen does not establish systemic concentration.","barrier":"Barrier permeability is a regulated biological process, not simply an open door to the bloodstream.","axis":"Barrier state may influence immune and neural communication, but a supplement-specific change is not presumed.","evidence":"Anatomy established; product-induced barrier changes HYPOTHETICAL without human evidence","term":"Colonocyte","pron":"koh-LON-oh-site","definition":"A cell lining the colon, including absorptive epithelial cells that can metabolize butyrate."},{"key":"immune","name":"Mucosal immune dialogue","structure":"Epithelial and immune cells sample and respond to defined microbial or molecular patterns in context.","organism":"Microbial products can influence mucosal immune signaling without implying systemic infection.","metabolite":"Immune mediators can affect physiological communication; the direction and magnitude vary.","barrier":"Receptor binding requires ligand accessibility and cellular localization.","axis":"Cytokine-related effects are one possible gut–brain communication route, not a demonstrated Turkey Tail outcome.","evidence":"Mechanistic immunology established; mushroom ingestion-to-human pathway effect unverified","term":"Cytokine","pron":"SY-toh-kine","definition":"A protein signal through which cells coordinate immune and other physiological responses."},{"key":"enteric","name":"Enteric nervous system","structure":"Intrinsic networks of enteric neurons and glia coordinate motility, secretion and local reflexes in the gastrointestinal tract.","organism":"Microbial metabolites may modulate some host pathways; specific interactions require measurement.","metabolite":"Any metabolite-to-neuron link must specify receptor, exposure and supporting experiment.","barrier":"Enteric neurons are not simply exposed to every luminal molecule.","axis":"Local gut reflexes, vagal afferents and endocrine mediators contribute to bidirectional gut–brain communication.","evidence":"Human enteric and vagal anatomy established; product-specific neural efficacy NOT inferred","term":"Enteric nervous system","pron":"en-TAIR-ik NER-vus SIS-tum","definition":"Networks of neurons and glial cells embedded in the digestive tract that regulate gut function."},{"key":"brain","name":"Neural systems interface","structure":"The gut–brain axis includes neural, hormonal, immune and metabolic communication.","organism":"Association studies alone cannot demonstrate causal microbial effects on the brain.","metabolite":"Circulating mediators, neuronal firing and blood–brain barrier transport require distinct evidence.","barrier":"Blood–brain barrier access is compound-specific; none is assumed for intact fungal polysaccharides.","axis":"The Neural Systems Atlas link is a conceptual research cross-reference, not a live synchronized pharmacodynamic pathway.","evidence":"General gut–brain signaling supported; brain benefit from ordinary Turkey Tail powder NOT established","term":"Vagus nerve","pron":"VAY-gus NERV","definition":"Cranial nerve X, containing sensory and motor fibers that support communication between internal organs and the brainstem."}];

const ingestion=document.getElementById("myco-ingestion-lab");
if(ingestion&&!document.getElementById("myco-microbiome")){
 const lab=document.createElement("section");lab.id="myco-microbiome";lab.setAttribute("aria-label","Phase 16 microbiome and gut brain learning sequence");
 lab.style.cssText="margin-top:16px;padding:14px;border:1px solid #6c8a83;border-radius:10px;background:#0c1b20;color:#eaf3ee";
 lab.innerHTML='<style>#myco-microbiome h3{font-size:18px;color:#f1dcac;margin:6px 0}#myco-microbiome p{font-size:12px;line-height:1.55}#myco-microbiome button,#myco-microbiome select{padding:8px 10px;border-radius:7px;border:1px solid #67837b;background:#183137;color:#eff4ef}#myco-microbiome button{cursor:pointer}#myco-microbiome button:focus-visible{outline:2px solid #ffda9a}#myco-microbiome button[aria-current="step"]{background:#755629;border-color:#ffda9a}#myco-microbiome .micro-nodes{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}#myco-microbiome .micro-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#myco-microbiome .micro-detail{background:#142a2b;border:1px solid #3f5c56;border-radius:8px;padding:10px}#myco-microbiome .micro-controls{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}#myco-microbiome .micro-warning{border-left:3px solid #e5b66e;background:#292217;padding:10px}@media(max-width:680px){#myco-microbiome .micro-details{grid-template-columns:1fr}}</style>'+
 '<div class="kicker">PHASE 16 · HUMAN MICROBIOME AND GUT–BRAIN INTERFACE</div><h3>Microbial fermentation → barrier → enteric signaling</h3>'+
 '<p class="micro-warning">Educational mechanism map, not a validated pharmacokinetic model. Fermentation depends on the substrate and microbiome. Oral Turkey Tail powder has not been established to improve human neurological outcomes.</p>'+
 '<label for="micro-substrate">Compare dietary substrate </label><select id="micro-substrate"><option value="fungal">Fungal polysaccharide (unspecified structure)</option><option value="fiber">Characterized fermentable dietary fiber</option><option value="unknown">Unknown mushroom preparation</option></select>'+
 '<div id="micro-stage-buttons" class="micro-nodes" role="group" aria-label="Seven selectable microbiome stages"></div>'+
 '<div class="micro-details"><div class="micro-detail"><strong id="micro-title"></strong><p id="micro-structure"></p><p id="micro-community"></p><p id="micro-barrier"></p></div><div class="micro-detail"><strong>Metabolites and neural pathway</strong><p id="micro-metabolites"></p><p id="micro-axis"></p><p id="micro-evidence"></p><p id="micro-constraint"></p></div></div>'+
 '<div class="micro-detail" aria-live="polite"><strong id="micro-term"></strong><p id="micro-pron"></p><p id="micro-definition"></p></div>'+
 '<div class="micro-controls"><button type="button" id="micro-previous">← Previous</button><button type="button" id="micro-next">Next →</button><button type="button" id="micro-speak">🔊 Read stage and term</button><button type="button" id="micro-3d">View existing 3D anatomy</button><button type="button" id="micro-qa">Run Phase 16 QA</button></div>'+
 '<pre id="micro-report" role="status" style="white-space:pre-wrap;overflow-wrap:anywhere;background:#091417;border:1px solid #4b6962;border-radius:7px;padding:10px;font:11px/1.5 monospace">Phase 16 QA not yet executed.</pre>';
 ingestion.append(lab);
 const buttons=lab.querySelector("#micro-stage-buttons");
 let index=0,substrate="fungal";
 MICROBIOME_STAGES.forEach((stage,i)=>{
  const button=document.createElement("button");button.type="button";button.textContent=(i+1)+". "+stage.name;
  button.onclick=()=>setStage(i);buttons.append(button);
 });
 const nodes=[...buttons.querySelectorAll("button")];
 function constraint(){
  if(substrate==="fiber")return "Even characterized fermentable fiber does not produce a fixed metabolite yield or guaranteed neurological benefit.";
  if(substrate==="unknown")return "Unknown preparation: no inference about degree of fermentation, absorption, metabolite yield or brain exposure is justified.";
  return "Fungal polysaccharides vary by linkage, branching, size and processing; effects cannot be predicted solely from a mushroom species name.";
 }
 function render(){
  const x=MICROBIOME_STAGES[index];
  const fields={
   "micro-title":(index+1)+"/"+MICROBIOME_STAGES.length+" · "+x.name,
   "micro-structure":"Substrate and mechanism: "+x.structure,
   "micro-community":"Microbial community: "+x.organism,
   "micro-barrier":"Tissue barrier: "+x.barrier,
   "micro-metabolites":"Metabolite fate: "+x.metabolite,
   "micro-axis":"Enteric and neural connection: "+x.axis,
   "micro-evidence":"Evidence: "+x.evidence,
   "micro-constraint":"Preparation constraint: "+constraint(),
   "micro-term":"Definition: "+x.term,
   "micro-pron":"Pronunciation: "+x.pron,
   "micro-definition":x.definition
  };
  for(const [id,value] of Object.entries(fields))lab.querySelector("#"+id).textContent=value;
  nodes.forEach((b,i)=>{if(i===index)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current");});
 }
 function setStage(next){index=Math.max(0,Math.min(MICROBIOME_STAGES.length-1,next));if("speechSynthesis" in window)window.speechSynthesis.cancel();render();}
 lab.querySelector("#micro-substrate").onchange=e=>{substrate=e.target.value;render();};
 lab.querySelector("#micro-previous").onclick=()=>setStage(index-1);
 lab.querySelector("#micro-next").onclick=()=>setStage(index+1);
 lab.querySelector("#micro-speak").onclick=()=>{
  if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();
  const x=MICROBIOME_STAGES[index];
  const utterance=new SpeechSynthesisUtterance(x.name+". "+x.structure+". "+x.organism+". "+x.metabolite+". "+x.barrier+". "+x.axis+". Evidence: "+x.evidence+". "+x.term+": "+x.definition);
  utterance.lang="en-US";utterance.rate=.82;window.speechSynthesis.speak(utterance);
 };
 lab.querySelector("#micro-3d").onclick=()=>{if(window.MycoSimWorkspace?.activate("anatomy"))document.getElementById("tv-anatomy3d")?.scrollIntoView({behavior:"smooth",block:"start"});};
 lab.querySelector("#micro-qa").onclick=()=>{
  const oldIndex=index,oldSubstrate=substrate,checks=[];
  const check=(name,pass)=>checks.push({name,pass:Boolean(pass)});
  try{
   check("Reuses Phase 15 ingestion parent",lab.parentElement.id==="myco-ingestion-lab");
   check("Reuses Phase 9 digestion parent",lab.closest("#tv-biology")!==null);
   check("Original Phase 10 anatomy retained",!!document.getElementById("tv-anatomy3d"));
   check("Seven microbial and neural steps",MICROBIOME_STAGES.length===7&&nodes.length===7);
   check("Three controlled substrate categories",lab.querySelectorAll("#micro-substrate option").length===3);
   check("Oral-to-brain clinical warning",lab.querySelector(".micro-warning").textContent.includes("not been established"));
   MICROBIOME_STAGES.forEach((step,i)=>{setStage(i);check("Step "+(i+1)+" complete and annotated",nodes[i].getAttribute("aria-current")==="step"&&step.evidence.length>5&&!!step.definition&&!!step.pron&&!!lab.querySelector("#micro-axis").textContent);});
   setStage(2);lab.querySelector("#micro-next").click();check("Next advances",index===3);
   lab.querySelector("#micro-previous").click();check("Previous returns",index===2);
   setStage(0);lab.querySelector("#micro-previous").click();check("Beginning boundary",index===0);
   setStage(6);lab.querySelector("#micro-next").click();check("End boundary",index===6);
   check("Conditional scientific evidence",MICROBIOME_STAGES[3].evidence.includes("HYPOTHETICAL")&&MICROBIOME_STAGES[6].evidence.includes("NOT established"));
   check("Accessible readback",!!lab.querySelector("#micro-speak"));
  }catch(err){check("Unexpected error: "+String(err),false);}
  finally{index=oldIndex;substrate=oldSubstrate;lab.querySelector("#micro-substrate").value=substrate;render();}
  const passed=checks.filter(c=>c.pass).length;
  lab.querySelector("#micro-report").textContent="Phase 16 browser checks: "+passed+"/"+checks.length+" passed\n"+checks.map(c=>(c.pass?"PASS ":"FAIL ")+c.name).join("\n")+"\nEducational DOM smoke checks only; no in-vivo microbiome change, cognitive benefit or production deployment validated.";
 };
 window.addEventListener("pagehide",()=>{if("speechSynthesis" in window)window.speechSynthesis.cancel();},{once:true});
 render();
}
