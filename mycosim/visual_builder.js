// MycoSim visual builder: additive, optional, no changes to evidence records.
const mountPoint = document.getElementById("observationForm");
if (mountPoint && !document.getElementById("myco-visual-builder")) {
  const host = document.createElement("section");
  host.id = "myco-visual-builder";
  host.setAttribute("aria-label", "Interactive mushroom learning and creation studio");
  mountPoint.before(host);
  const style = document.createElement("style");
  style.textContent = `
    #myco-visual-builder{border:1px solid #608279;border-radius:16px;margin:16px 0;padding:16px;background:#0d2022;color:#eaf5ed}
    #myco-visual-builder h3{margin:0 0 7px;color:#f1daa6;font-size:22px}
    #myco-visual-builder .mb-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
    #myco-visual-builder button,#myco-visual-builder select{border:1px solid #67847c;border-radius:8px;background:#183338;color:#f3f7f2;padding:10px;min-height:42px;cursor:pointer}
    #myco-visual-builder button[aria-pressed=true]{background:#8b6d32;color:#fff;border-color:#f0c67d}
    #myco-visual-builder .mb-layout{display:grid;grid-template-columns:minmax(220px,1fr) minmax(220px,1fr);gap:14px}
    #myco-visual-builder .mb-controls{display:grid;gap:10px;align-content:start}
    #myco-visual-builder label{display:grid;gap:5px;font-size:13px;color:#d1e6e1}
    #myco-visual-builder .mb-preview{border:1px solid #526e69;border-radius:10px;background:#101c1b;padding:12px}
    #myco-visual-builder svg{width:100%;max-height:270px;display:block}
    #myco-visual-builder .mb-note{font-size:13px;line-height:1.5;color:#c8d8d5}
    #myco-visual-builder .mb-action{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
    #myco-visual-builder [hidden]{display:none!important}
    @media(max-width:690px){#myco-visual-builder .mb-layout{grid-template-columns:1fr}}
  `;
  document.head.append(style);
  host.innerHTML = `
    <h3>Build / Explore Your Mushroom</h3>
    <p class="mb-note">Choose traits to see a teaching illustration change. Learn their meaning, send supported characters to the existing 3D engine, or invent a custom specimen. Not an identification or edibility assessment.</p>
    <div class="mb-tabs" role="group" aria-label="Mushroom studio mode">
      <button type="button" data-mb-mode="learn" aria-pressed="true">Learn</button>
      <button type="button" data-mb-mode="build" aria-pressed="false">Build</button>
      <button type="button" data-mb-mode="identify" aria-pressed="false">Identify</button>
    </div>
    <div class="mb-layout">
      <div class="mb-controls">
        <label>Growth form<select data-mb-trait="form"><option value="agaric">Cap & stalk</option><option value="bracket">Shelf / bracket</option><option value="cup">Cup</option></select></label>
        <label>Cap or fruitbody shape<select data-mb-trait="cap"><option value="convex">Convex</option><option value="flat">Flat / plane</option><option value="conical">Conical</option><option value="depressed">Depressed</option></select></label>
        <label>Fertile surface<select data-mb-trait="surface"><option value="gills">Gills</option><option value="pores">Pores</option><option value="teeth">Teeth</option><option value="smooth">Smooth</option></select></label>
        <label>Spore shape (micro diagram)<select data-mb-trait="spore"><option value="ellipsoid">Ellipsoid</option><option value="globose">Globose</option><option value="fusiform">Fusiform</option></select></label>
        <label>Growth substrate<select data-mb-trait="substrate"><option value="soil">Soil</option><option value="wood">Decaying wood</option><option value="living_tree">Living tree</option></select></label>
        <div class="mb-action"><button type="button" id="mb-apply">Apply supported traits to 3D</button><button type="button" id="mb-save">Export custom specimen</button><button type="button" id="mb-reset">Reset</button></div>
      </div>
      <div class="mb-preview">
        <svg id="mb-drawing" viewBox="0 0 360 270" role="img" aria-label="Mushroom morphology diagram, updated by chosen traits"></svg>
        <div id="mb-explanation" class="mb-note" role="status" aria-live="polite"></div>
        <p id="mb-3d-status" class="mb-note">3D engine link is opt-in and supports only compatible family variants. Other selections update this illustration.</p>
        <button type="button" id="mb-read">Pronounce / read selected trait</button>
      </div>
    </div>
    <details><summary>Scientific record and provenance (advanced)</summary><p class="mb-note">The original observation and evidence fields remain below. Creative selections are not automatically marked as measured observations.</p></details>
  `;
  const state = {mode:"learn",form:"agaric",cap:"convex",surface:"gills",spore:"ellipsoid",substrate:"soil"};
  const terms = {
    convex:"Convex (KON-veks): cap curves outward.",flat:"Plane: upper cap is mostly level.",conical:"Conical (KON-ih-kul): cap tapers toward an apex.",depressed:"Depressed: center of cap dips inward.",
    gills:"Gills (lamellae): thin, plate-like fertile surfaces.",pores:"Pores: openings of tubes with a fertile lining.",teeth:"Teeth: downward-facing fertile spines.",smooth:"Smooth: fertile surface lacks prominent gills, tubes or teeth.",
    agaric:"Cap and stipe: a stalked mushroom body plan.",bracket:"Bracket: shelf-like body attached laterally, often to wood.",cup:"Cup: bowl-shaped fruitbody, typically without a prominent stalk.",
    ellipsoid:"Ellipsoid spores: elongated ovals.",globose:"Globose spores: roughly spherical.",fusiform:"Fusiform spores: spindle shaped and tapered.",
    soil:"Soil: ground substrate; visible occurrence does not establish ecological role.",wood:"Decaying wood: woody substrate in decomposition.",living_tree:"Living tree: attachment to a living host; relationship cannot be inferred from shape alone."
  };
  const safe = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function draw() {
    const svg=host.querySelector("#mb-drawing");
    const cap = state.cap==="conical" ? "M110 133 L180 40 L250 133 Z" : state.cap==="flat" ? "M93 125 Q175 101 267 125 L267 137 L93 137Z" : state.cap==="depressed" ? "M94 136 Q130 82 180 112 Q229 82 267 136Z" : "M93 138 Q105 45 180 59 Q255 45 267 138Z";
    const shelf="M100 119 Q175 58 290 103 Q256 159 105 147Z";
    const bowl="M110 83 Q130 178 180 183 Q230 178 250 83 Q214 100 180 98 Q143 100 110 83Z";
    const body=state.form==="cup"?bowl:state.form==="bracket"?shelf:cap;
    const stem=state.form==="agaric"?'<path d="M165 133 L161 230 Q180 241 198 230 L195 133Z" fill="#d0ba8e" stroke="#8b7054" stroke-width="3"/>':"";
    const support=state.substrate==="soil"?'<path d="M12 240 Q100 225 180 242 T348 240" stroke="#7c8764" stroke-width="10" fill="none"/>':state.substrate==="wood"?'<rect x="28" y="229" width="302" height="25" rx="9" fill="#75523b" stroke="#a7794d" />':'<rect x="20" y="16" width="35" height="236" rx="16" fill="#73523d" stroke="#aa8560"/>';
    const hym= state.surface==="gills" ? Array.from({length:12},(_,i)=>'<line x1="'+(104+i*13)+'" y1="138" x2="'+(110+i*12)+'" y2="149" stroke="#5e3c27" stroke-width="3"/>').join("") : state.surface==="pores"?Array.from({length:15},(_,i)=>'<circle cx="'+(108+(i%8)*19)+'" cy="'+(141+Math.floor(i/8)*9)+'" r="3" fill="#513d25"/>').join("") : state.surface==="teeth"?Array.from({length:13},(_,i)=>'<path d="M'+(106+i*12)+' 138 l0 15" stroke="#c49a68" stroke-width="3"/>').join("") : "";
    const spore=state.spore==="globose"?'<circle cx="311" cy="37" r="11"/>':state.spore==="fusiform"?'<path d="M291 37 Q311 18 330 37 Q310 55 291 37Z"/>':'<ellipse cx="311" cy="37" rx="17" ry="10"/>';
    svg.innerHTML='<title>Teaching illustration of a '+safe(state.form)+' with '+safe(state.surface)+'</title>'+support+stem+'<path d="'+body+'" fill="#be9959" stroke="#efcf92" stroke-width="3"/>'+hym+'<g fill="#b4a1b9" stroke="#efdbf3" stroke-width="2">'+spore+'</g><text x="270" y="65" fill="#d8e7e1" font-size="11">Spore detail</text>';
    const focus=state.mode==="identify"?"Identify mode: compare the shape you see; this custom illustration is not a real specimen.":state.mode==="build"?"Build mode: make your own fictional teaching specimen.":"Learn mode: each trait has a definition and visual example.";
    host.querySelector("#mb-explanation").textContent=focus+" "+terms[state.form]+" "+terms[state.cap]+" "+terms[state.surface]+" "+terms[state.spore]+" "+terms[state.substrate];
  }
  host.addEventListener("change",e=>{const key=e.target.dataset.mbTrait;if(key&&Object.prototype.hasOwnProperty.call(state,key)){state[key]=e.target.value;draw();}});
  host.addEventListener("click",e=>{
    const mode=e.target.closest("[data-mb-mode]");
    if(mode){state.mode=mode.dataset.mbMode;host.querySelectorAll("[data-mb-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b===mode)));draw();return;}
    if(e.target.id==="mb-reset"){for(const [k,v] of Object.entries({form:"agaric",cap:"convex",surface:"gills",spore:"ellipsoid",substrate:"soil"})){state[k]=v;host.querySelector('[data-mb-trait="'+k+'"]').value=v;}draw();}
    if(e.target.id==="mb-read" && "speechSynthesis" in window){speechSynthesis.cancel();const utter=new SpeechSynthesisUtterance(host.querySelector("#mb-explanation").textContent);utter.rate=.88;speechSynthesis.speak(utter);}
    if(e.target.id==="mb-save"){const payload={schema:"mycosim-custom-visual-v1",created_at:new Date().toISOString(),classification:"creative_educational_not_identified",traits:{...state}};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));a.download="mycosim-custom-specimen.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
    if(e.target.id==="mb-apply"){
      const messages=[];
      // Existing renderer supports user-clickable variants; use its public UI rather than writing engine internals.
      const family=state.form==="bracket"?"polyporoid":state.form==="cup"?"cup":"agaricoid";
      const familyButton=document.querySelector('#modelGrid [data-model="'+family+'"]');
      if(familyButton){familyButton.click();messages.push("3D family changed to "+family);}
      else messages.push("3D family not available in this build");
      const mappings=state.form==="agaric"?[["agaric_pileus_profile",state.cap==="flat"?"flat":state.cap]]:[];
      if(state.form==="agaric"&&state.surface==="gills")mappings.push(["agaric_gill_attachment","adnate"]);
      for(const [group,value] of mappings){
        const button=document.querySelector('#variantControls [data-variant="'+group+'"][data-value="'+value+'"]');
        if(button){button.click();messages.push(group+" updated");}
        else messages.push(group+" remains diagram-only");
      }
      if(state.form!=="agaric"||state.surface!=="gills")messages.push("Fertile surface shown schematically; existing 3D mesh is not claimed to be rebuilt");
      host.querySelector("#mb-3d-status").textContent=messages.join(". ")+".";
    }
  });
  draw();
}
