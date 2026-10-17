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
 // Glossary remains accessible in every mode. All other content enters exactly one workspace.
 host.append(nav,specimen);
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
