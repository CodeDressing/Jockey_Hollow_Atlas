// MycoSim Phase 11: visual, conceptual molecular process. No clinical or kinetic predictions.
const host=document.getElementById("trametes-simulator");
if(host&&!document.getElementById("tv-molecular")){
 const section=document.createElement("section");section.id="tv-molecular";
 section.setAttribute("aria-label","Phase 11 animated molecular-signaling education");
 section.style.cssText="margin-top:18px;padding:16px;border:1px solid #6b7664;border-radius:12px;background:#0b1719;color:#eaf1ed";
 section.innerHTML='<style>'+
 '#tv-molecular h3{font-size:19px;color:#f2dda6;margin:6px 0}#tv-molecular p{font-size:12px;line-height:1.55;color:#c9d6d0}'+
 '#tv-molecular svg{display:block;width:100%;height:auto;background:#0a1417;border:1px solid #48605c;border-radius:9px}'+
 '#tv-molecular .m-controls{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}#tv-molecular button{padding:9px 12px;background:#193033;color:#eff3ed;border:1px solid #5f7c74;border-radius:7px;cursor:pointer}'+
 '#tv-molecular button[aria-pressed=true],#tv-molecular button[aria-current=step]{background:#705927;border-color:#f3d48e}#tv-molecular button:focus-visible{outline:2px solid #f4d48c}'+
 '#tv-molecular .m-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}'+
 '#tv-molecular .m-stage{background:#101f21;border:1px solid #425956;border-radius:9px;padding:12px}'+
 '#tv-molecular .m-warning{border-left:4px solid #e9bd75;background:#2a2116;padding:10px;color:#f1dfbd}'+
 '#tv-molecular .m-node{cursor:pointer;outline:none}#tv-molecular .m-node circle{fill:#193136;stroke:#77928b;stroke-width:2;transition:fill .15s}'+
 '#tv-molecular .m-node[aria-current=step] circle{fill:#80602b;stroke:#ffe2a0;stroke-width:4}#tv-molecular .m-node:focus-visible circle{stroke:white}'+
 '#tv-molecular .m-node text{font-size:13px;fill:#f8f7ed;text-anchor:middle;pointer-events:none}'+
 '#tv-molecular .m-link{fill:none;stroke:#87a8a1;stroke-width:4;stroke-dasharray:8 10}'+
 '#tv-molecular[data-playing=true] .m-link{animation:m-flow 3s linear infinite}#tv-molecular .m-unknown{stroke:#f0b970;stroke-dasharray:3 10}'+
 '@keyframes m-flow{to{stroke-dashoffset:-72}}@media(prefers-reduced-motion:reduce){#tv-molecular .m-link{animation:none!important}}'+
 '@media(max-width:720px){#tv-molecular .m-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}'+
 '</style>'+
 '<div class="kicker">MYCOSIM · PHASE 11 · MOLECULAR PROCESS VISUALIZATION</div><h3>From digestion to intracellular signal transmission</h3>'+
 '<p>Choose a structure in the animated diagram or advance the lesson. Animations illustrate teaching order, not molecular speed, transport quantity, or an established clinical response.</p>'+
 '<p class="m-warning">Critical evidence boundary: oral Turkey Tail powder has not been established to deliver a biologically effective Dectin-1 ligand to these cells. The dashed amber connection is hypothetical.</p>'+
 '<svg viewBox="0 0 760 240" role="img" aria-label="Interactive molecular pathway: digestion, gut interface, hypothetical exposure, Dectin-1, hemITAM, SYK, CARD9, NF-kappa-B">'+
 '<path class="m-link" d="M60 105H150H245"/><path class="m-link m-unknown" d="M245 105H340"/><path class="m-link" d="M340 105H430H520H610H700"/>'+
 '<line x1="295" y1="19" x2="295" y2="208" stroke="#e2bd7e" stroke-dasharray="4 6"/><text x="302" y="29" fill="#f1c787" font-size="11">Unverified oral-to-receptor bridge</text>'+
 '<g class="m-nodes"></g></svg>'+
 '<div class="m-steps" role="group" aria-label="Select molecular process stage"></div>'+
 '<div class="m-controls"><button type="button" data-m="prev">← Previous</button><button type="button" data-m="next">Next →</button><button type="button" data-m="play" aria-pressed="false">▶ Play</button><button type="button" data-m="reset">Reset</button><button type="button" data-m="speak">🔊 Read current stage</button></div>'+
 '<div class="m-stage" aria-live="polite"><strong id="m-title"></strong><p id="m-description"></p><p id="m-evidence"></p><p id="m-pronunciation"></p></div>'+
 '<button type="button" id="m-qa">Run Phase 11 QA</button><pre id="m-qa-result" role="status" style="white-space:pre-wrap;font:11px/1.5 monospace;background:#071315;padding:10px;border:1px solid #47605b;border-radius:7px">Not tested in browser.</pre>';
 host.append(section);
 const model=[
  {id:"digestion",short:"Digestion",title:"Digestion and food matrix",detail:"Mushroom material undergoes normal gastrointestinal mixing and processing. Ordinary whole powder and standardized extracts are not chemically interchangeable.",evidence:"Established physiology; preparation-specific fate uncertain",say:"die-JES-chun"},
  {id:"gut",short:"Gut barrier",title:"Intestinal environment",detail:"Fungal polysaccharides and their breakdown products may interact with digestive contents and microbes. Passage through an intestinal barrier is not automatically implied.",evidence:"Physiology established; compound-specific transport unresolved",say:"in-TES-tin-ul"},
  {id:"uncertain",short:"Unverified",title:"Oral exposure uncertainty",detail:"No direct bridge from swallowed ordinary Turkey Tail powder to a proven active Dectin-1 dose in humans is established here. The animation must not represent this as demonstrated.",evidence:"HYPOTHETICAL oral-to-receptor bridge",say:"hy-puh-THET-i-kul"},
  {id:"dectin",short:"Dectin-1",title:"Conditional Dectin-1 ligand recognition",detail:"Under controlled experimental conditions, accessible β-glucan can engage Dectin-1/CLEC7A. Ligand architecture, receptor clustering and cellular context matter.",evidence:"Experimental receptor mechanism; not demonstrated as the result of ingestion",say:"DEK-tin one"},
  {id:"hemitam",short:"hemITAM",title:"hemITAM phosphorylation",detail:"Receptor clustering can permit phosphorylation of the hemITAM tyrosine motif, creating the conditions for downstream SYK recruitment.",evidence:"Mechanistic cell-signaling model, context dependent",say:"hem EYE-tam; fos-for-ih-LAY-shun"},
  {id:"syk",short:"SYK",title:"SYK recruitment and activity",detail:"SYK (spleen tyrosine kinase) is recruited to phosphorylated signaling motifs in the Dectin-1 pathway and relays the intracellular signal.",evidence:"Mechanistic cell-signaling evidence",say:"sick; spleen TYE-ruh-seen KYE-nays"},
  {id:"card9",short:"CARD9",title:"CARD9–BCL10–MALT1 signaling",detail:"In relevant immune cell contexts, downstream adaptors CARD9, BCL10 and MALT1 couple receptor-proximal signals to additional kinase pathways.",evidence:"Mechanistic signaling, dependent on cell context",say:"card nine, bee-see-ell ten, malt one"},
  {id:"nfkb",short:"NF-κB",title:"IKK and NF-κB transcriptional regulation",detail:"IKK-dependent events can influence NF-κB transcriptional activity. A cell pathway diagram does not predict inflammation levels, tumor response or therapeutic benefit.",evidence:"Mechanistic endpoint; NO patient benefit inferred",say:"en-eff kappa bee"}
 ];
 const ns="http://www.w3.org/2000/svg",nodes=section.querySelector(".m-nodes"),steps=section.querySelector(".m-steps");
 const positions=[60,150,245,340,430,520,610,700];
 model.forEach((m,i)=>{
  const group=document.createElementNS(ns,"g");group.setAttribute("class","m-node");group.setAttribute("role","button");group.setAttribute("tabindex","0");group.setAttribute("aria-label",m.title);group.dataset.index=String(i);
  const circle=document.createElementNS(ns,"circle");circle.setAttribute("cx",String(positions[i]));circle.setAttribute("cy","105");circle.setAttribute("r","34");
  const text=document.createElementNS(ns,"text");text.setAttribute("x",String(positions[i]));text.setAttribute("y","109");text.textContent=m.short;group.append(circle,text);nodes.append(group);
  const button=document.createElement("button");button.type="button";button.textContent=(i+1)+". "+m.short;button.onclick=()=>setStep(i);steps.append(button);
  group.addEventListener("click",()=>setStep(i));
  group.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setStep(i);}});
 });
 const diagram=[...nodes.querySelectorAll(".m-node")],buttons=[...steps.children];
 let index=0,playing=false,timer=null;
 function pause(){playing=false;if(timer!==null){clearInterval(timer);timer=null;}}
 function render(){
  const m=model[index];
  section.querySelector("#m-title").textContent=(index+1)+"/8 · "+m.title;
  section.querySelector("#m-description").textContent=m.detail;
  section.querySelector("#m-evidence").textContent="Evidence level: "+m.evidence;
  section.querySelector("#m-pronunciation").textContent="Pronunciation: "+m.say;
  buttons.forEach((b,i)=>{if(i===index)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current");});
  diagram.forEach((b,i)=>{if(i===index)b.setAttribute("aria-current","step");else b.removeAttribute("aria-current");});
  section.dataset.playing=String(playing);section.querySelector('[data-m="play"]').setAttribute("aria-pressed",String(playing));
  section.querySelector('[data-m="play"]').textContent=playing?"⏸ Pause":"▶ Play";
 }
 function setStep(i){pause();if("speechSynthesis" in window)speechSynthesis.cancel();index=Math.max(0,Math.min(model.length-1,i));render();}
 section.querySelector('[data-m="prev"]').onclick=()=>setStep(index-1);
 section.querySelector('[data-m="next"]').onclick=()=>setStep(index+1);
 section.querySelector('[data-m="reset"]').onclick=()=>setStep(0);
 section.querySelector('[data-m="play"]').onclick=()=>{
  if(playing){pause();render();return;}
  if(index===model.length-1)index=0;
  playing=true;render();
  timer=setInterval(()=>{if(index===model.length-1){pause();render();return;}index++;render();},3500);
 };
 section.querySelector('[data-m="speak"]').onclick=()=>{if(!("speechSynthesis" in window))return;speechSynthesis.cancel();const m=model[index];const u=new SpeechSynthesisUtterance(m.title+". "+m.detail+". "+m.evidence);u.rate=.85;speechSynthesis.speak(u);};
 document.addEventListener("visibilitychange",()=>{if(document.hidden&&playing){pause();render();}});
 window.addEventListener("pagehide",()=>{pause();if("speechSynthesis" in window)speechSynthesis.cancel();},{once:true});
 section.querySelector("#m-qa").onclick=()=>{
  const before=index,results=[],check=(n,pass)=>results.push({n,pass:!!pass});
  try{
   check("Eight ordered stages",model.length===8&&buttons.length===8&&diagram.length===8);
   check("Hypothetical boundary flagged",model[2].evidence.includes("HYPOTHETICAL"));
   check("Cell mechanism separate from oral evidence",model[3].evidence.includes("not demonstrated"));
   check("No clinical benefit inferred",model[7].evidence.includes("NO patient benefit"));
   for(let i=0;i<8;i++){setStep(i);check("Stage "+(i+1)+" selection",buttons[i].getAttribute("aria-current")==="step"&&diagram[i].getAttribute("aria-current")==="step");}
   setStep(2);section.querySelector('[data-m="next"]').click();check("Next button",index===3);
   section.querySelector('[data-m="prev"]').click();check("Previous button",index===2);
   section.querySelector('[data-m="reset"]').click();check("Reset button",index===0);
   section.querySelector('[data-m="play"]').click();check("Playback starts",playing&&timer!==null);
   section.querySelector('[data-m="play"]').click();check("Playback stops",!playing&&timer===null);
  }catch(e){results.push({n:"Exception: "+String(e),pass:false});}
  finally{setStep(before);}
  const passed=results.filter(r=>r.pass).length;
  section.querySelector("#m-qa-result").textContent="Phase 11 browser checks: "+passed+"/"+results.length+" passed\n"+results.map(r=>(r.pass?"PASS ":"FAIL ")+r.n).join("\n")+"\nScientific peer review and clinical efficacy are outside this smoke-test scope.";
 };
 render();
}
