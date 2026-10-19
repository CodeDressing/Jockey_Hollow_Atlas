// Phase 14: non-destructive unified MycoSim laboratory workspace.
// Existing modules keep their identities, DOM event handlers, and QA contracts.
const host=document.getElementById("trametes-simulator");
if(host&&!document.getElementById("myco-lab-nav")){
 const categories=[
  {key:"specimen",title:"Forest specimen",ids:[]},
  {key:"digestion",title:"Digestion and microbiome",ids:["tv-biology"]},
  {key:"anatomy",title:"3D human anatomy",ids:["tv-anatomy3d"]},
  {key:"pathways",title:"Molecular signaling",ids:["tv-molecular"]},
  {key:"quality",title:"Testing and integration",ids:["myco-campaign","myco-acceptance"]}
 ];
 const glossary=document.getElementById("myco-science-terms");
 const allModuleIds=new Set(categories.flatMap(c=>c.ids));
 const sourceNodes=[...host.children].filter(el=>el!==glossary&&!allModuleIds.has(el.id));
 const specimen=document.createElement("section");specimen.id="myco-specimen-pane";specimen.setAttribute("aria-label","Forest specimen and species reconstruction");
 sourceNodes.forEach(el=>specimen.append(el));
 const nav=document.createElement("nav");nav.id="myco-lab-nav";nav.setAttribute("aria-label","MycoSim consolidated laboratory sections");nav.setAttribute("role","tablist");
 nav.innerHTML='<style>#myco-lab-nav{display:flex;flex-wrap:wrap;gap:7px;margin:16px 0 12px;padding:9px;border:1px solid #49635f;border-radius:10px;background:#0a191b}#myco-lab-nav button{padding:10px 12px;flex:1 1 145px;min-width:0;border-radius:7px;color:#eaf1ea;background:#14292c;border:1px solid #526965;cursor:pointer;font-size:12px}#myco-lab-nav button[aria-selected="true"]{background:#6a5227;border-color:#f3d28e;color:#fff}#myco-lab-nav button:focus-visible{outline:2px solid #f8df9e;outline-offset:2px}#trametes-simulator [hidden]{display:none!important}</style>';
 const panels=new Map([["specimen",[specimen]]]);
 for(const group of categories.slice(1))panels.set(group.key,group.ids.map(id=>document.getElementById(id)).filter(Boolean));
 for(const group of categories){
  const button=document.createElement("button");button.type="button";button.textContent=group.title;button.dataset.lab=group.key;button.setAttribute("role","tab");button.setAttribute("aria-selected","false");
  button.setAttribute("aria-controls",panels.get(group.key).map(el=>el.id).join(" "));
  button.onclick=()=>activate(group.key);
  nav.append(button);
 }

 const COURSE28=[
  {key:"specimen",step:"Meet the organism",goal:"Begin with a forest mushroom. Compare its shape, habitat and reproductive structures before discussing any health claims."},
  {key:"digestion",step:"Follow what is swallowed",goal:"Examine preparation, digestion, the microbiome and why eating a mushroom does not establish systemic exposure."},
  {key:"anatomy",step:"Explore the human body",goal:"Begin the five-discovery guided 3D lesson: intestinal barriers, immune interfaces and neuronal anatomy."},
  {key:"pathways",step:"Test a molecular explanation",goal:"Follow conditional receptor and signaling mechanisms while distinguishing experimental findings from human outcomes."},
  {key:"quality",step:"Review the evidence",goal:"Compare references, classify uncertainty and use instructor QA only when necessary. Medical effects are not implied."}
 ];
 const course=document.createElement("section");course.id="myco-course-overview";
 course.setAttribute("aria-label","Guided five-part MycoSim science course");
 course.innerHTML='<style>'+
 '#myco-course-overview{border:1px solid #709087;border-radius:13px;padding:18px;margin:18px 0 12px;background:linear-gradient(150deg,#14302e,#102025);color:#edf1e7}'+
 '#myco-course-overview h3{font-size:23px;margin:7px 0;color:#f4dfa8}'+
 '#myco-course-overview p{font-size:14px;line-height:1.55}'+
 '#myco-course-overview .course28-kicker{color:#d8ba7e;font-weight:750;font-size:12px;letter-spacing:.06em}'+
 '#myco-course-overview .course28-bar{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:16px 0}'+
 '#myco-course-overview .course28-bar span{border:1px solid #637c75;border-radius:8px;padding:10px 6px;font-size:12px;text-align:center}'+
 '#myco-course-overview .course28-bar [data-current=true]{background:#745b30;border-color:#f1d28e;font-weight:700}'+
 '#myco-course-overview .course28-actions{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 0}'+
 '#myco-course-overview button{padding:12px 18px;min-height:44px;border-radius:8px;background:#ad8b52;border:1px solid #e7ce9d;color:#101c19;font-size:14px;font-weight:750;cursor:pointer}'+
 '#myco-course-overview button:focus-visible{outline:3px solid #fff1c1;outline-offset:3px}'+
 '@media(max-width:720px){#myco-course-overview .course28-bar{grid-template-columns:repeat(2,minmax(0,1fr))}#myco-course-overview h3{font-size:20px}}'+
 '</style>'+
 '<div class="course28-kicker">BIOLOGY FROM FOREST TO HUMAN · FIVE-PART GUIDED COURSE</div>'+
 '<h3>Explore. Question. Understand.</h3>'+
 '<p>Start with a living fungus, trace what may happen after ingestion, and separate known human biology from experimental mushroom research. Each section builds toward an evidence-based conclusion.</p>'+
 '<div id="course28-progress" class="course28-bar" aria-label="Five course chapters"></div>'+
 '<p id="course28-goal" role="status" aria-live="polite"></p>'+
 '<p style="font-size:12px;color:#dfd09f">For education, not diagnosis or treatment. Scientific diagrams are simplified and do not demonstrate medical efficacy.</p>'+
 '<div class="course28-actions"><button type="button" id="course28-start">▶ Start at the forest</button><button type="button" id="course28-next">Continue to digestion →</button></div>';
 const progress=course.querySelector("#course28-progress");
 for(let i=0;i<COURSE28.length;i++){
  const segment=document.createElement("span");segment.textContent=(i+1)+". "+COURSE28[i].step;segment.dataset.courseStep=COURSE28[i].key;progress.append(segment);
 }
 function refreshCourse28(key){
  const current=Math.max(0,COURSE28.findIndex(c=>c.key===key));
  course.querySelector("#course28-goal").textContent="Chapter "+(current+1)+" of 5 — "+COURSE28[current].step+". "+COURSE28[current].goal;
  for(const segment of progress.children)segment.dataset.current=String(segment.dataset.courseStep===key);
  const next=COURSE28[(current+1)%COURSE28.length];
  course.querySelector("#course28-next").textContent=current===COURSE28.length-1?"Review from the forest ↻":"Continue to "+next.step+" →";
 }
 course.querySelector("#course28-start").onclick=()=>activate("specimen");
 course.querySelector("#course28-next").onclick=()=>{
  const current=Math.max(0,keys.indexOf(host.dataset.activeLab));
  activate(keys[(current+1)%keys.length]);
 };
 // Glossary remains available in all tabs; the course orientation appears before tab navigation.
 host.append(course,nav,specimen);

 const keys=categories.map(c=>c.key);
 function activate(key,{focus=false}={}){
  if(!panels.has(key))return false;
  for(const [group,elements] of panels)for(const element of elements){element.hidden=group!==key;element.inert=group!==key;}
  for(const button of nav.querySelectorAll("button[data-lab]")){
   const selected=button.dataset.lab===key;
   button.setAttribute("aria-selected",String(selected));
   button.tabIndex=selected?0:-1;
   if(selected&&focus)button.focus();
  }
  host.dataset.activeLab=key;
  refreshCourse28(key);
  // Ask WebGL module to update its canvas dimensions once its panel is laid out.
  if(key==="anatomy")requestAnimationFrame(()=>window.dispatchEvent(new Event("resize")));
  return true;
 }
 nav.addEventListener("keydown",event=>{
  if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
  const current=Math.max(0,keys.indexOf(host.dataset.activeLab));
  const next=event.key==="Home"?0:event.key==="End"?keys.length-1:(current+(event.key==="ArrowRight"?1:-1)+keys.length)%keys.length;
  event.preventDefault();activate(keys[next],{focus:true});
 });
 // Opt-in global bridge for the pre-existing full QA campaign.
 window.MycoSimWorkspace=Object.freeze({activate,getActive:()=>host.dataset.activeLab,keys:[...keys]});
 activate("specimen");
}
