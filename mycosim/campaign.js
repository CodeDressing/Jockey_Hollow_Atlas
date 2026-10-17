// Phase 11-12 education and single-click, fail-closed MycoSim browser QA campaign.
// These local tests DO NOT imply production, clinical, or scientific validation.
const host=document.getElementById("trametes-simulator");
if(host&&!document.getElementById("myco-campaign")){
 const panel=document.createElement("section");
 panel.id="myco-campaign";
 panel.style.cssText="margin-top:18px;padding:18px;border:1px solid #6a795c;border-radius:12px;background:#101b1e;color:#eaf2ec";
 panel.innerHTML='<div class="kicker">MYCOSIM · PHASES 9–12</div><h2>One-button Campaign Command</h2><p class="copy">Execute sequential browser checks with stop-on-failure gates. The molecular lesson and Neural Atlas cross-reference are educational—not validated human pharmacology or automatic data synchronization.</p><button id="myco-execute" type="button" style="padding:12px;background:#705827;border:1px solid #ead393;color:#fff;font-weight:bold;border-radius:8px;cursor:pointer">▶ EXECUTE PHASES 9 → 12</button> <button id="myco-report-copy" type="button">Copy report</button><div id="myco-gates" role="status" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:12px 0"></div><pre id="myco-log" style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;line-height:1.6;max-height:380px;overflow:auto;background:#091315;border:1px solid #405653;padding:12px;border-radius:8px" aria-live="polite">Ready. No tests have run.</pre><div style="border:1px solid #465e59;border-radius:9px;padding:12px"><h3>Phase 11: molecular signaling lesson</h3><p class="copy">Select each conceptual step. The transition between gut exposure and receptor binding remains hypothetical for ordinary oral Turkey Tail powder.</p><label for="myco-step">Scientific pathway step</label> <select id="myco-step"></select> <button type="button" id="myco-prev">Previous</button> <button type="button" id="myco-next">Next</button> <button type="button" id="myco-speak">🔊 Read</button><p id="myco-detail" aria-live="polite"></p><p id="myco-evidence" class="copy"></p></div><div style="border:1px solid #465e59;border-radius:9px;padding:12px;margin-top:10px"><h3>Phase 12: Neural Atlas research handoff</h3><p class="copy">Structured, versioned cross-atlas references. No shared backend or imported data is claimed.</p><a href="https://neural-systems-atlas.onrender.com/" id="myco-atlas-link" target="_blank" rel="noopener noreferrer">Open Neural Systems Atlas ↗</a> <button type="button" id="myco-mapping-copy">Copy structured handoff</button></div>';
 host.append(panel);
 const steps=[
 ["ingestion","Ingestion","Food matrix and preparation govern what enters the digestive tract.","Established digestive process"],
 ["stomach","Gastric processing","Acidity and mixing modify the food matrix but do not establish complete fungal β-glucan absorption.","General physiological evidence"],
 ["microbiome","Microbial processing","Some complex polysaccharides can interact with intestinal microbial communities.","Variable microbiome evidence"],
 ["exposure","Oral-to-receptor exposure","The route from oral powder to accessible Dectin-1 ligand at relevant human immune cells is not demonstrated here.","HYPOTHETICAL: do not interpret as verified transport"],
 ["dectin1","Dectin-1 and hemITAM","Appropriately accessible β-glucan may engage Dectin-1 and promote hemITAM phosphorylation in experimental cell systems.","Conditional experimental receptor mechanism"],
 ["syk","SYK / CARD9-BCL10-MALT1","SYK recruitment can lead to CARD9-associated downstream signal propagation.","Context-dependent signaling mechanism"],
 ["nfkb","IKK / NF-κB transcription","Downstream signaling may regulate immune-related transcription, but does not predict patient benefits.","Mechanistic cell evidence; no clinical efficacy inference"]
 ];
 const sel=panel.querySelector("#myco-step");
 steps.forEach((step,i)=>{const o=document.createElement("option");o.value=String(i);o.textContent=(i+1)+". "+step[1];sel.append(o);});
 function show(i){const next=Math.max(0,Math.min(i,steps.length-1));sel.value=String(next);panel.querySelector("#myco-detail").textContent=steps[next][2];panel.querySelector("#myco-evidence").textContent="Evidence: "+steps[next][3];}
 sel.onchange=()=>show(Number(sel.value));
 panel.querySelector("#myco-prev").onclick=()=>show(Number(sel.value)-1);
 panel.querySelector("#myco-next").onclick=()=>show(Number(sel.value)+1);
 panel.querySelector("#myco-speak").onclick=()=>{if(!("speechSynthesis" in window))return;speechSynthesis.cancel();const x=steps[Number(sel.value)],u=new SpeechSynthesisUtterance(x[1]+". "+x[2]+". "+x[3]);u.rate=.87;speechSynthesis.speak(u);};
 show(0);
 const handoff={schema:"jha.mycosim.pathway.v1",source:"Jockey Hollow Atlas MycoSim",target:"Neural Systems Atlas",transport:"manual educational cross-reference",entries:steps.map(x=>({id:"jha:tv:"+x[0],name:x[1],evidence:x[3]})),warning:"Neither direct oral-to-receptor exposure nor clinical efficacy is established by this model."};
 let last="Campaign not yet executed.";
 function copy(t){return navigator.clipboard.writeText(t);}
 panel.querySelector("#myco-mapping-copy").onclick=()=>copy(JSON.stringify(handoff,null,2)).catch(e=>{panel.querySelector("#myco-log").textContent="Copy unavailable: "+e.message;});
 panel.querySelector("#myco-report-copy").onclick=()=>copy(last).catch(e=>{panel.querySelector("#myco-log").textContent="Copy unavailable: "+e.message;});
 const gates=panel.querySelector("#myco-gates"),log=panel.querySelector("#myco-log");
 const gateElements=new Map();
 for(const phase of [9,10,11,12]){const el=document.createElement("div");el.style.cssText="background:#0e2526;border:1px solid #4a605a;padding:10px;border-radius:8px;font-size:12px";el.textContent="Phase "+phase+": awaiting checks";gates.append(el);gateElements.set(phase,el);}
 function gate(n,status,detail){const el=gateElements.get(n);el.textContent="Phase "+n+": "+status+" — "+detail;el.style.borderColor=status==="PASS"?"#5c9e6c":status==="FAIL"?"#c16c61":"#b09a65";}
 function append(s){last+="\n"+s;log.textContent=last;}
 function launchTest(sectionId,buttonText,reportId,phase){
  const section=document.getElementById(sectionId);
  if(!section)throw Error("Phase "+phase+" module not mounted");
  const b=[...section.querySelectorAll("button")].find(x=>x.textContent.trim()===buttonText);
  const output=section.querySelector(reportId);
  if(!b||!output)throw Error("Phase "+phase+" QA runner or report missing");
  b.click();
  const match=output.textContent.match(/browser checks:\s*(\d+)\/(\d+)\s*passed/i);
  if(!match)throw Error("Phase "+phase+" QA report missing result: "+output.textContent.slice(0,300));
  const passed=Number(match[1]),total=Number(match[2]);
  if(total<8||passed!==total)throw Error("Phase "+phase+" failed "+passed+"/"+total+" checks. "+output.textContent.slice(0,800));
  return passed+"/"+total;
 }
 let executing=false;
 panel.querySelector("#myco-execute").onclick=()=>{
  if(executing)return;
  executing=true;const btn=panel.querySelector("#myco-execute");btn.disabled=true;
  last="MycoSim local browser campaign report · phases 9–12";
  log.textContent=last;
  for(const n of [9,10,11,12])gate(n,"WAIT","not executed");
  let current=9;
  try{
   gate(9,"RUN","digestion and immune QA");const p9=launchTest("tv-biology","Run Phase 9 browser QA","#bio-qa-report",9);
   gate(9,"PASS",p9);append("Phase 9: "+p9+" checks passed");
   current=10;
   gate(10,"RUN","WebGL 3D anatomy QA");const p10=launchTest("tv-anatomy3d","Run Phase 10 3D QA","pre[role=status]",10);
   gate(10,"PASS",p10);append("Phase 10: "+p10+" checks passed");
   current=11;
   gate(11,"RUN","molecular pathway lesson");const uniq=new Set(steps.map(s=>s[0]));
   if(steps.length!==7||uniq.size!==7||!steps[3][3].includes("HYPOTHETICAL"))throw Error("Phase 11 pathway scientific invariant failed");
   for(let i=0;i<steps.length;i++){show(i);if(sel.value!==String(i)||!panel.querySelector("#myco-detail").textContent)throw Error("Phase 11 lesson step "+(i+1)+" failed");}
   show(0);gate(11,"PASS","7 educational steps rendered");append("Phase 11: 7 educational steps and hypothesis flag verified");
   current=12;
   gate(12,"RUN","structured research handoff");
   const link=panel.querySelector("#myco-atlas-link");
   if(handoff.entries.length!==7||handoff.schema!=="jha.mycosim.pathway.v1"||new URL(link.href).hostname!=="neural-systems-atlas.onrender.com")throw Error("Phase 12 handoff contract failed");
   gate(12,"PASS","schema and destination link");append("Phase 12: structured research handoff validated (NO remote sync test)");
   append("Browser smoke tests passed. Release remains CONDITIONAL pending manual visual, scientific, accessibility, endurance and production deployment QA.");
  }catch(e){gate(current,"FAIL","campaign stopped");append("STOP — Phase "+current+": "+String(e?.message||e));}
  finally{executing=false;btn.disabled=false;}
 };
}
