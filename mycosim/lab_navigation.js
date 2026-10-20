// Categorized MycoSim navigation. Non-destructive: keeps existing modules and guided lessons intact.
document.getElementById("mycosim-laboratory-nav")?.addEventListener("click",event=>{
  const link=event.target.closest("a[data-lab-target]");
  if(!link)return;
  const id=link.dataset.labTarget;
  const target=document.getElementById(id);
  if(!target)return;
  event.preventDefault();
  // A learner selecting a specific laboratory intends to navigate directly.
  // Switch from progressively locked Guided mode to the existing Explore mode
  // only when that destination is inside a locked learning step.
  const step=target.closest(".learning-step");
  if(step?.classList.contains("learning-locked")){
    const explore=document.querySelector('[data-learner-mode="explore"]');
    if(explore&&!explore.classList.contains("active"))explore.click();
  }
  target.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});
  history.replaceState(null,"","#"+encodeURIComponent(id));
  const status=document.getElementById("mycosim-lab-nav-status");
  if(status)status.textContent="Opened "+link.querySelector("strong")?.textContent+". The original scientific tools remain available.";
});
