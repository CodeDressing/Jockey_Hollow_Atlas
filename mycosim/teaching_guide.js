// Sprint 4: a single contextual teaching guide bound to existing authored descriptions.
// Does not modify the specimen renderer, scientific evidence, or lesson completion.
const panel=document.getElementById("mycosim-teaching-guide");
const explanation=document.getElementById("mycosim-teaching-explanation");
const title=document.getElementById("mycosim-teaching-title");
const source=document.getElementById("mycosim-teaching-source");
const status=document.getElementById("mycosim-teaching-status");
const observe=document.getElementById("variantTeachingCard");
const anatomy=document.getElementById("eduTitle");
const body=document.getElementById("eduBody");
let current={title:"",text:"",origin:""};
const modelName=()=>document.getElementById("profileName")?.textContent?.trim()||"Mushroom";
function refresh(){
  if(!panel||!explanation||!title||!source)return;
  const variantVisible=observe&&!observe.hidden&&document.getElementById("variantTeachingTitle")?.textContent?.trim();
  const variantTitle=document.getElementById("variantTeachingTitle")?.textContent?.trim()||"";
  const variantBody=document.getElementById("variantTeachingBody")?.textContent?.trim()||"";
  const variantDetail=document.getElementById("variantTeachingDetail")?.textContent?.trim()||"";
  const knowledgeTitle=anatomy?.textContent?.trim()||"Whole basidiome";
  const knowledgeText=body?.textContent?.trim()||"";
  current=variantVisible?
    {title:variantTitle,text:[variantBody,variantDetail].filter(Boolean).join(" "),origin:"Visible morphology change"}:
    {title:knowledgeTitle,text:knowledgeText,origin:"Existing anatomy reference"};
  title.textContent=current.title;
  explanation.textContent=current.text||"Choose a morphology character or anatomy structure to begin.";
  source.textContent=current.origin+" · "+modelName()+" · educational reconstruction, not a species identification.";
}
function readAloud(){
  if(!("speechSynthesis" in window)){status.textContent="Audio playback is unavailable in this browser.";return;}
  window.speechSynthesis.cancel();
  const utter=new SpeechSynthesisUtterance(current.title+". "+current.text);
  utter.lang="en-US";utter.rate=.88;
  window.speechSynthesis.speak(utter);
  status.textContent="Reading the existing scientific explanation aloud.";
}
panel?.addEventListener("click",event=>{
  const action=event.target.closest("button[data-teaching-action]")?.dataset.teachingAction;
  if(!action)return;
  if(action==="read")readAloud();
  if(action==="stop"){
    if("speechSynthesis" in window)window.speechSynthesis.cancel();
    status.textContent="Audio stopped.";
  }
  if(action==="beginner"||action==="expert"){
    const btn=document.querySelector('[data-knowledge-mode="'+action+'"]');
    if(btn){btn.click();status.textContent=action==="expert"?"Expert scientific definitions selected.":"Beginner explanations selected.";}
    refresh();
  }
  if(action==="anatomy"){
    const target=document.getElementById("eduTitle");
    const step=target?.closest(".learning-step");
    if(step?.classList.contains("learning-locked"))document.querySelector('[data-learner-mode="explore"]')?.click();
    target?.scrollIntoView({behavior:"smooth",block:"center"});
    status.textContent="Showing original anatomy knowledge and structure relationships.";
  }
});
if(panel){
  const refreshLater=()=>queueMicrotask(refresh);
  // Existing scientific renderer and vocabulary system remain the source of truth.
  for(const id of ["variantTeachingCard","variantTeachingTitle","variantTeachingBody","variantTeachingDetail","eduTitle","eduBody","profileName"]){
    const node=document.getElementById(id);
    if(node)new MutationObserver(refreshLater).observe(node,{subtree:true,childList:true,characterData:true,attributes:id==="variantTeachingCard",attributeFilter:id==="variantTeachingCard"?["hidden"]:undefined});
  }
  refresh();
}
