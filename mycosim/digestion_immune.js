// MycoSim Phase 9: independent conceptual pathway; not a pharmacokinetic or clinical model.
const host=document.getElementById("trametes-simulator");
if(host&&!document.getElementById("tv-biology")){
const stages=[
["Ingestion","Mouth and food matrix","Mushroom material is swallowed. Preparation and matrix affect subsequent access to components.","Established digestive anatomy"],
["Stomach","Gastric mixing","Acid and movement mix the preparation. Complete breakdown or absorption of fungal β-glucan is not assumed.","Established anatomy; compound-specific fate varies"],
["Small intestine","Digestion and transit","Secretions act on food components, but humans do not completely digest all fungal β-glucans. Bioaccessibility varies by molecular structure and processing.","Physiology established; mushroom-specific exposure uncertain"],
["Colon / microbiome","Microbial metabolism","Some resistant polysaccharides can reach the colon. Microorganisms may transform material; actual metabolites and individual responses vary.","Preparation-dependent mechanism"],
["Intestinal immune interface","Conditional exposure","The drawing does not establish that intact oral β-glucans cross gut barriers or reach Dectin-1 at an effective concentration.","Oral-to-receptor bridge NOT demonstrated"],
["Dectin-1 / CLEC7A","Receptor recognition","Accessible fungal β-glucan can engage Dectin-1 in suitable experimental systems, promoting hemITAM phosphorylation and SYK recruitment.","Established cell mechanism; not proof after ingestion"],
["SYK → CARD9","Intracellular signaling","SYK-dependent signaling may recruit the CARD9–BCL10–MALT1 pathway, depending on cell type, ligand and context.","Experimentally supported signaling"],
["IKK → NF-κB","Gene regulation","Downstream pathways can alter NF-κB-dependent transcription; they do not predict patient cytokine levels, tumor outcomes or clinical benefits.","Mechanistic endpoint, not clinical evidence"]
];
const panel=document.createElement("section");panel.id="tv-biology";panel.setAttribute("aria-label","Digestion and immune system interactive simulation");
panel.innerHTML=`
<style>
#tv-biology{margin-top:18px;padding:16px;border:1px solid #49615e;border-radius:12px;background:#0a1518;color:#e8f0ed}
#tv-biology h3{color:#f0dda9;font-size:19px;margin:4px 0}
#tv-biology p{font-size:12px;line-height:1.6;color:#c6d4d1}
#tv-biology .bio-alert{border-left:3px solid #e0bb72;background:#222017;padding:10px;color:#f0ddaf}
#tv-biology .bio-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(230px,1fr);gap:12px;margin:12px 0}
#tv-biology .bio-diagram{border:1px solid #355059;border-radius:9px;background:#0d1b1d;padding:12px;min-width:0}
#tv-biology svg{width:100%;height:auto;display:block}
#tv-biology .bio-item{cursor:pointer;outline:none}
#tv-biology .bio-item circle{fill:#183337;stroke:#87a3a0;stroke-width:2}
#tv-biology .bio-item[aria-current=step] circle{fill:#83632a;stroke:#f9da8a;stroke-width:4}
#tv-biology .bio-item:focus-visible circle{stroke:white}
#tv-biology .bio-item text{font-size:11px;text-anchor:middle;fill:#f4f4eb;pointer-events:none}
#tv-biology .bio-path{fill:none;stroke:#7ca19a;stroke-width:3;stroke-dasharray:7 7;animation:bio-flow 4s linear infinite}
#tv-biology .bio-uncertain{stroke:#e7b36a;stroke-dasharray:3 9}
#tv-biology .bio-card{border:1px solid #39565b;border-radius:9px;background:#102024;padding:12px}
#tv-biology .bio-card h4{color:#f5dea7;font-size:16px;margin:8px 0}
#tv-biology .bio-card small{color:#b6c6c1}
#tv-biology .bio-buttons,#tv-biology .bio-steps{display:flex;flex-wrap:wrap;gap:7px}
#tv-biology button{background:#1b2d31;color:#edf4ed;border:1px solid #536a68;border-radius:7px;cursor:pointer;padding:8px 11px}
#tv-biology button:hover,#tv-biology button:focus-visible{border-color:#f0d08e}
#tv-biology .bio-steps button{flex:1;min-width:35px}
#tv-biology .bio-steps button[aria-current=step]{background:#745927;border-color:#ffdc8e}
@keyframes bio-flow{to{stroke-dashoffset:-56}}
@media(max-width:770px){#tv-biology .bio-grid{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){#tv-biology .bio-path{animation:none}}
</style>
<div class="kicker">MYCOSIM · PHASE 9 · HUMAN BIOCHEMISTRY</div><h3>Turkey Tail: digestion and immune-recognition simulator</h3>
<p>Click any numbered structure or use Next, Previous, Play, and Read Aloud. Movement is illustrative, not a validated rate of absorption or signaling.</p>
<p class="bio-alert">Scientific boundary: eating Turkey Tail powder has not been shown by this diagram to deliver active β-glucan to Dectin-1 or produce a clinical benefit. The intracellular pathway illustrates separate experimental receptor research.</p>
<div class="bio-grid">
<div class="bio-diagram"><svg viewBox="0 0 700 300" role="img" aria-label="Eight selectable steps from ingestion to immune receptor signaling. Dashed amber bridge indicates unverified oral exposure.">
<text x="15" y="20" fill="#b4d2c9" font-size="13">DIGESTION</text><text x="375" y="20" fill="#e8c885" font-size="13">CONDITIONAL CELL MODEL</text>
<path class="bio-path" d="M76 87H200H322V214H200"/>
<path class="bio-path bio-uncertain" d="M200 214H435"/>
<path class="bio-path" d="M435 214H545H651"/>
<line x1="374" y1="28" x2="374" y2="281" stroke="#e8c885" stroke-width="2" stroke-dasharray="4 6"/>
<text x="383" y="46" font-size="10" fill="#e8c885">Exposure unverified</text>
<g class="bio-item" data-step="0" tabindex="0" role="button" aria-label="Ingestion"><circle cx="76" cy="87" r="35"/><text x="76" y="91">Mouth</text></g>
<g class="bio-item" data-step="1" tabindex="0" role="button" aria-label="Stomach"><circle cx="200" cy="87" r="35"/><text x="200" y="91">Stomach</text></g>
<g class="bio-item" data-step="2" tabindex="0" role="button" aria-label="Small intestine"><circle cx="322" cy="87" r="40"/><text x="322" y="84">Small</text><text x="322" y="99">intestine</text></g>
<g class="bio-item" data-step="3" tabindex="0" role="button" aria-label="Colon microbiome"><circle cx="322" cy="214" r="40"/><text x="322" y="210">Colon</text><text x="322" y="225">microbiome</text></g>
<g class="bio-item" data-step="4" tabindex="0" role="button" aria-label="Intestinal immune interface"><circle cx="200" cy="214" r="40"/><text x="200" y="210">Gut</text><text x="200" y="225">barrier</text></g>
<g class="bio-item" data-step="5" tabindex="0" role="button" aria-label="Dectin one receptor"><circle cx="435" cy="214" r="39"/><text x="435" y="210">Dectin-1</text><text x="435" y="225">hemITAM</text></g>
<g class="bio-item" data-step="6" tabindex="0" role="button" aria-label="SYK CARD9"><circle cx="545" cy="214" r="38"/><text x="545" y="210">SYK</text><text x="545" y="225">CARD9</text></g>
<g class="bio-item" data-step="7" tabindex="0" role="button" aria-label="NF kappa B"><circle cx="651" cy="214" r="39"/><text x="651" y="210">NF-κB</text><text x="651" y="225">Nucleus</text></g>
</svg><p>Diagram is a learning schematic, not accurate anatomical positioning. Amber dashed path = a hypothesis, not demonstrated oral transport.</p></div>
<div class="bio-card" aria-live="polite"><small id="bio-progress"></small><h4 id="bio-title"></h4><p id="bio-detail"></p><small id="bio-evidence"></small></div>
</div><div class="bio-steps" aria-label="Choose stage"></div>
<div class="bio-buttons" style="margin-top:10px"><button type="button" data-bio="prev">← Previous</button><button type="button" data-bio="next">Next →</button><button type="button" data-bio="play">▶ Play</button><button type="button" data-bio="read">🔊 Read stage</button><button type="button" data-bio="reset">Reset</button></div>
<details style="margin-top:12px"><summary>Definitions and evidence sources</summary><p>β-glucan: structurally diverse glucose polymers. Dectin-1 / CLEC7A: fungal-pattern recognition receptor. hemITAM: receptor phosphorylation motif. SYK: spleen tyrosine kinase. CARD9–BCL10–MALT1: downstream signaling complex. NF-κB: transcription factor family. PSK, PSP, whole fruiting body and powdered or extracted products are not interchangeable. This simulator does not represent human dosing or efficacy. <a href="https://www.cancer.gov/about-cancer/treatment/cam/hp/mushrooms-pdq" target="_blank" rel="noopener noreferrer">NCI medicinal mushrooms evidence overview</a>.</p></details>`;
host.append(panel);
let index=0,interval=null,playing=false;
const diagram=[...panel.querySelectorAll(".bio-item")],steps=panel.querySelector(".bio-steps");
stages.forEach((stage,i)=>{const b=document.createElement("button");b.textContent=String(i+1);b.type="button";b.setAttribute("aria-label",stage[0]);b.onclick=()=>setStage(i);steps.append(b);});
const buttons=[...steps.querySelectorAll("button")];
function stop(){playing=false;if(interval!==null){clearInterval(interval);interval=null;}}
function render(){const s=stages[index];panel.querySelector("#bio-progress").textContent="STEP "+(index+1)+" OF "+stages.length+" · "+s[1];panel.querySelector("#bio-title").textContent=s[0];panel.querySelector("#bio-detail").textContent=s[2];panel.querySelector("#bio-evidence").textContent="Evidence: "+s[3];diagram.forEach((n,i)=>i===index?n.setAttribute("aria-current","step"):n.removeAttribute("aria-current"));buttons.forEach((n,i)=>i===index?n.setAttribute("aria-current","step"):n.removeAttribute("aria-current"));const playButton=panel.querySelector('[data-bio="play"]');playButton.textContent=playing?"⏸ Pause":"▶ Play";playButton.setAttribute("aria-pressed",String(playing));}
function setStage(i){stop();if("speechSynthesis" in window)speechSynthesis.cancel();index=Math.min(stages.length-1,Math.max(0,i));render();}
diagram.forEach((n,i)=>{n.addEventListener("click",()=>setStage(i));n.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setStage(i);}});});
panel.querySelector('[data-bio="prev"]').onclick=()=>setStage(index-1);
panel.querySelector('[data-bio="next"]').onclick=()=>setStage(index+1);
panel.querySelector('[data-bio="reset"]').onclick=()=>{setStage(0);if("speechSynthesis" in window)speechSynthesis.cancel();};
panel.querySelector('[data-bio="play"]').onclick=()=>{if(playing){stop();render();return;}if(index===stages.length-1)index=0;playing=true;render();interval=setInterval(()=>{if(index===stages.length-1){stop();render();return;}index++;render();},4000);};
panel.querySelector('[data-bio="read"]').onclick=()=>{if(!("speechSynthesis" in window))return;speechSynthesis.cancel();const s=stages[index],utterance=new SpeechSynthesisUtterance(s[0]+". "+s[2]+". Evidence: "+s[3]);utterance.rate=.86;speechSynthesis.speak(utterance);};
document.addEventListener("visibilitychange",()=>{if(document.hidden&&playing){stop();render();}});
window.addEventListener("pagehide",()=>{stop();if("speechSynthesis" in window)speechSynthesis.cancel();},{once:true});
render();
}
