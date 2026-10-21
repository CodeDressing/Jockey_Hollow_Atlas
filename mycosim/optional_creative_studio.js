// Operation Clear View Sprint 2: optional legacy creative renderer.
// Only loaded after explicit user action; primary scientific engine stays authoritative.
const button=document.getElementById("mycosim-load-creative-studio");
const status=document.getElementById("mycosim-creative-studio-status");
button?.addEventListener("click",async()=>{
  button.disabled=true;
  status.textContent="Opening optional creative workshop…";
  try{
    await import("./visual_builder.js?v=clear-view-optin-20261020");
    await import("./visual_builder_3d.js?v=clear-view-optin-20261020");
    const host=document.getElementById("myco-visual-builder");
    if(!host)throw new Error("Creative workshop failed to mount");
    button.hidden=true;
    status.textContent="Workshop ready. Reopen this optional section when you want its tools.";
    const disclosure=document.getElementById("mycosim-creative-archive");
    if(disclosure){disclosure.open=false;disclosure.querySelector(":scope > summary")?.focus({preventScroll:true});}
    // Do not force scrolling or move the visitor away from the main specimen.
  }catch(error){
    status.textContent="Creative workshop could not load: "+String(error?.message||error);
    button.disabled=false;
    console.error("Creative workshop failed",error);
  }
});
