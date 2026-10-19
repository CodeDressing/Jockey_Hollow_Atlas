const AGARICOID28=[{"id":"agaricus_bisporus","name":"Agaricus bisporus","common":"Button mushroom","ecology":"Saprotroph on compost-rich substrate","steps":["Mycelium expands in decomposed organic substrates and absorbs available nutrients.","Environmental cues can promote fruiting-body primordia.","Pileus and gills mature with fertile hymenium.","Basidia undergo sexual events and produce spores; many cultivated strains have predominantly two-spored basidia.","Basidiospores discharge and disperse; successful germination depends on conditions."]},{"id":"pleurotus_ostreatus","name":"Pleurotus ostreatus","common":"Oyster mushroom","ecology":"White-rot wood decomposer","steps":["Extracellular enzymes degrade woody lignocellulose.","Environmental conditions support primordia initiation.","Lateral caps expand and decurrent gills develop.","Basidia on gills undergo meiosis and produce basidiospores.","Airborne basidiospores disperse; surviving mycelium can continue wood decomposition."]},{"id":"amanita_muscaria","name":"Amanita muscaria","common":"Fly agaric","ecology":"Ectomycorrhizal partner of living trees","steps":["Hyphae interact with compatible host roots and exchange resources.","Young enclosed basidiomes differentiate.","Cap, gills and stem expand; veil remnants may remain.","Basidia in the gill hymenium produce sexual basidiospores.","Spores spread, but completion of the life cycle depends on compatible symbiotic ecology."]},{"id":"coprinopsis_cinerea","name":"Coprinopsis cinerea","common":"Ink cap","ecology":"Saprotroph on dung or organic-rich material","steps":["Vegetative hyphae colonize suitable organic substrates.","Developmental cues promote primordia.","Cap and gills differentiate and mature relatively rapidly.","Basidia develop spores on gill surfaces.","In many fruiting bodies gill tissue deliquesces as spores mature and disperse."]},{"id":"armillaria_mellea","name":"Armillaria mellea","common":"Honey fungus","ecology":"Plant pathogen and wood decomposer","steps":["Mycelium colonizes appropriate woody substrates and sometimes living host tissues.","Rhizomorphs support vegetative spread through soil.","Cap-and-stipe clusters develop over infected or colonized wood.","Gills produce basidiospores following sexual events.","Spore release and vegetative growth represent different routes of spread."]}];

const host=document.getElementById("trametes-simulator");
const panel=document.getElementById("myco-family-biology");
if(host&&panel){
 const turkeyPane=document.getElementById("tv-species-only"),title=document.getElementById("myco-family-biology-title"),intro=document.getElementById("myco-family-biology-intro"),lesson=document.getElementById("myco-family-biology-lesson");
 let family="agaricoid",taxon=AGARICOID28[0],stage=0;
 const style=document.createElement("style");
 style.textContent="#myco-family-biology button,#myco-family-biology select{background:#1c3435;color:#edf3ec;border:1px solid #6e8982;border-radius:7px;padding:9px}#myco-family-biology .bio28-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:9px 0}#myco-family-biology .bio28-card{border:1px solid #5a746d;border-radius:10px;background:#0a1c1e;padding:14px}#myco-family-biology button:focus-visible,#myco-family-biology select:focus-visible{outline:2px solid #efd58e}";
 panel.append(style);
 const controls=document.createElement("div");controls.className="bio28-controls";
 const label=document.createElement("label");label.htmlFor="bio28-taxon";label.textContent="Select an agaricoid";
 const selector=document.createElement("select");selector.id="bio28-taxon";
 for(const item of AGARICOID28){const opt=document.createElement("option");opt.value=item.id;opt.textContent=item.name+" — "+item.common;selector.append(opt);}
 controls.append(label,selector);lesson.append(controls);
 const card=document.createElement("div");card.className="bio28-card";
 card.innerHTML='<strong id="bio28-heading"></strong><p id="bio28-ecology"></p><svg id="bio28-visual" viewBox="0 0 600 105" role="img" aria-label="Five-step biological cycle" style="display:block;width:100%;max-height:130px"></svg><p id="bio28-description" aria-live="polite"></p><div class="bio28-controls"><button id="bio28-prev" type="button">Previous</button><button id="bio28-next" type="button">Next</button><button id="bio28-read" type="button">🔊 Read explanation</button></div><p style="font-size:12px;color:#e7d39c">Educational biological-process model, not species identification, proof of edibility or a quantitative growth simulation.</p>';
 lesson.append(card);
 const visual=card.querySelector("#bio28-visual"),NS="http://www.w3.org/2000/svg";
 function draw(){
  card.querySelector("#bio28-heading").textContent=taxon.name+" · stage "+(stage+1)+"/5";
  card.querySelector("#bio28-ecology").textContent=taxon.ecology;
  card.querySelector("#bio28-description").textContent=taxon.steps[stage];
  visual.replaceChildren();visual.setAttribute("aria-label",taxon.name+" biological process at stage "+(stage+1));
  for(let i=0;i<5;i++){
   const x=64+117*i;
   if(i){const line=document.createElementNS(NS,"path");line.setAttribute("d","M"+(x-58)+" 39h17");line.setAttribute("stroke","#91aaa5");line.setAttribute("stroke-width","2");visual.append(line);}
   const circle=document.createElementNS(NS,"circle");circle.setAttribute("cx",String(x));circle.setAttribute("cy","39");circle.setAttribute("r","24");circle.setAttribute("fill",i===stage?"#95753b":"#254642");circle.setAttribute("stroke","#b7c4b4");visual.append(circle);
   const text=document.createElementNS(NS,"text");text.setAttribute("x",String(x));text.setAttribute("y","45");text.setAttribute("text-anchor","middle");text.setAttribute("fill","#fff");text.textContent=String(i+1);visual.append(text);
   const sub=document.createElementNS(NS,"text");sub.setAttribute("x",String(x));sub.setAttribute("y","80");sub.setAttribute("text-anchor","middle");sub.setAttribute("font-size","11");sub.setAttribute("fill","#d9e8de");sub.textContent=["Growth","Initiation","Morphology","Reproduction","Dispersal"][i];visual.append(sub);
  }
 }
 selector.onchange=()=>{taxon=AGARICOID28.find(x=>x.id===selector.value)||AGARICOID28[0];stage=0;draw();};
 card.querySelector("#bio28-prev").onclick=()=>{stage=(stage+4)%5;draw();};
 card.querySelector("#bio28-next").onclick=()=>{stage=(stage+1)%5;draw();};
 card.querySelector("#bio28-read").onclick=()=>{if(!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(taxon.name+". "+taxon.ecology+". "+taxon.steps[stage]);u.lang="en-US";u.rate=.85;window.speechSynthesis.speak(u);};
 function setFamily(id){
  family=id||"agaricoid";const isTurkey=family==="trametes_versicolor",isAgar=family==="agaricoid";
  host.dataset.specimenFamily=family;turkeyPane.hidden=!isTurkey;turkeyPane.inert=!isTurkey;
  panel.hidden=isTurkey;panel.inert=isTurkey;lesson.hidden=!isAgar;
  title.textContent=isAgar?"Agaricoid biological-process simulator":"Biological-process overview — "+family.replaceAll("_"," ");
  intro.textContent=isAgar?"Choose a mushroom species to study its ecological and reproductive stages. The 3D morphology above remains available.":"A species-specific biological process model has not yet been validated for this family. Continue using the existing morphology simulator above.";
 }
 document.addEventListener("mycosim:family-change",event=>setFamily(event.detail&&event.detail.id));
 setFamily(document.querySelector("#modelGrid [data-model].active")?.dataset.model||"agaricoid");draw();
 window.MycoSimFamilyBiology=Object.freeze({getState:()=>({family,taxon:taxon.id,stage,turkeyVisible:!turkeyPane.hidden,biologyVisible:!panel.hidden}),taxa:AGARICOID28.map(x=>x.id)});
}
