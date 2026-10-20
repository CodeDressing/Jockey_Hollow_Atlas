// MycoSim visual builder: additive, optional, no changes to evidence records.
import {MORPHOLOGY_VARIANTS} from "./variants.js";
const mountPoint = document.getElementById("observationForm");
if (mountPoint && !document.getElementById("myco-visual-builder")) {
  const host = document.createElement("section");
  host.id = "myco-visual-builder";
  host.setAttribute("aria-label", "Interactive mushroom learning and creation studio");
  mountPoint.before(host);
  const style = document.createElement("style");
  style.textContent = `
    #myco-visual-builder{border:1px solid #608279;border-radius:16px;margin:16px 0;padding:16px;background:#0d2022;color:#eaf5ed;container-type:inline-size;min-width:0;max-width:100%}
    #myco-visual-builder h3{margin:0 0 7px;color:#f1daa6;font-size:22px}
    #myco-visual-builder .mb-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
    #myco-visual-builder button,#myco-visual-builder select{border:1px solid #67847c;border-radius:8px;background:#183338;color:#f3f7f2;padding:10px;min-height:42px;cursor:pointer}
    #myco-visual-builder button[aria-pressed=true]{background:#8b6d32;color:#fff;border-color:#f0c67d}
    #myco-visual-builder .mb-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}
    @container (min-width:620px){#myco-visual-builder .mb-layout{grid-template-columns:repeat(2,minmax(0,1fr))}}
    #myco-visual-builder .mb-layout>*{min-width:0;max-width:100%}
    #myco-visual-builder .mb-controls{display:grid;gap:10px;align-content:start}
    #myco-visual-builder label{display:grid;gap:5px;font-size:13px;color:#d1e6e1}
    #myco-visual-builder .mb-preview{border:1px solid #526e69;border-radius:10px;background:#101c1b;padding:12px}
    #myco-visual-builder svg{width:100%;max-height:270px;display:block}
    #myco-visual-builder .mb-note{font-size:13px;line-height:1.5;color:#c8d8d5}
    #myco-visual-builder .mb-action{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
    #myco-visual-builder .mb-controls>label{position:absolute!important;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
    #myco-visual-builder .mb-trait-group{border:1px solid #395e57;border-radius:12px;padding:11px;background:#10272a}
    #myco-visual-builder .mb-trait-group h4{color:#f1dda9;font-size:13px;margin:0 0 9px}
    #myco-visual-builder .mb-trait-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:7px}
    #myco-visual-builder .mb-trait-option{text-align:left;display:flex;flex-direction:column;gap:5px;align-items:center;justify-content:center;background:#192c31;min-height:86px!important;padding:8px!important}
    #myco-visual-builder .mb-trait-option svg{width:82px;height:43px;max-height:none}
    #myco-visual-builder .mb-trait-option span{font-size:11px;text-align:center;line-height:1.25}
    #myco-visual-builder .mb-trait-option[aria-pressed=true]{background:#655227!important;border:2px solid #e9c582!important}
    #myco-visual-builder .mb-trait-option:focus-visible{outline:3px solid #f6d597;outline-offset:2px}
    #myco-visual-builder .mb-pending{color:#ffdf96;border-left:3px solid #d9b878;padding:7px 10px;background:#18231d;font-size:12px}
    #myco-visual-builder #mb-apply{font-weight:800;background:#af8e4c;border-color:#e8c77a;color:#111d1b}
    #myco-visual-builder .mb-anatomy-editor{border:1px solid #65897c;border-radius:12px;padding:12px;background:#0b1b1d;margin:12px 0}
    #myco-visual-builder .mb-regions{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}
    #myco-visual-builder .mb-region-editor{max-height:380px;overflow:auto;overscroll-behavior:contain}
    #myco-visual-builder .mb-advanced-row{margin:10px 0;padding:10px;border:1px solid #37554d;border-radius:8px}
    #myco-visual-builder .mb-advanced-row h5{margin:0 0 8px;color:#e0d3a9;font-size:12px}
    #myco-visual-builder .mb-advanced-choices{display:grid;grid-template-columns:repeat(auto-fit,minmax(108px,1fr));gap:6px}
    #myco-visual-builder .mb-advanced-choices button{font-size:12px;min-height:44px}
    #myco-visual-builder .mb-advanced-choices [aria-pressed=true]{outline:2px solid #e8cc84}

    #myco-visual-builder [hidden]{display:none!important}
    @media(max-width:690px){#myco-visual-builder .mb-layout{grid-template-columns:1fr}}
  `;
  document.head.append(style);
  host.innerHTML = `
    <h3>Build / Explore Your Mushroom</h3>
    <p class="mb-note">Choose visual traits, then press Apply to Mushroom to transform the 3D model. Explore combinations, learn anatomy, and export creative specimens. Not an identification or edibility assessment.</p>
    <div class="mb-tabs" role="group" aria-label="Mushroom studio mode">
      <button type="button" data-mb-mode="learn" aria-pressed="true">Learn</button>
      <button type="button" data-mb-mode="build" aria-pressed="false">Build</button>
      <button type="button" data-mb-mode="identify" aria-pressed="false">Identify</button>
    </div>
    <div class="mb-layout">
      <div class="mb-controls">
        <label>Growth form<select data-mb-trait="form"><option value="agaric">Cap & stalk</option><option value="bracket">Shelf / bracket</option><option value="cup">Cup</option></select></label>
        <label>Cap or fruitbody shape<select data-mb-trait="cap"><option value="convex">Convex</option><option value="flat">Flat / plane</option><option value="conical">Conical</option><option value="depressed">Depressed</option></select></label>
        <label>Stipe profile<select data-mb-trait="stipe"><option value="equal">Equal / cylindrical</option><option value="bulbous">Bulbous base</option><option value="tapered">Tapered upward</option></select></label>
        <label>Gill–stipe attachment<select data-mb-trait="attachment"><option value="adnate">Adnate / attached</option><option value="free">Free / detached</option><option value="decurrent">Decurrent / running down stipe</option></select></label>
        <label>Fertile surface<select data-mb-trait="surface"><option value="gills">Gills</option><option value="pores">Pores</option><option value="teeth">Teeth</option><option value="smooth">Smooth</option></select></label>
        <label>Spore shape (micro diagram)<select data-mb-trait="spore"><option value="ellipsoid">Ellipsoid</option><option value="globose">Globose</option><option value="fusiform">Fusiform</option></select></label>
        <label>Growth substrate<select data-mb-trait="substrate"><option value="soil">Soil</option><option value="wood">Decaying wood</option><option value="living_tree">Living tree</option></select></label>
        <p class="mb-pending" id="mb-pending" role="status">Choose visual features, then press Apply to Mushroom.</p><section class="mb-anatomy-editor" aria-labelledby="mb-anatomy-title">
          <h4 id="mb-anatomy-title">Professional 3D anatomy editor</h4>
          <p class="mb-note">These settings drive the existing detailed MycoSim engine. Select a region, choose its characteristics, then Apply to Mushroom.</p>
          <div class="mb-regions" role="group" aria-label="Choose mushroom region">
            <button type="button" data-mb-region="pileus" aria-pressed="true">Pileus + margin</button>
            <button type="button" data-mb-region="stipe" aria-pressed="false">Stipe apex / middle / base</button>
            <button type="button" data-mb-region="hymenophore" aria-pressed="false">Gills + attachment</button>
            <button type="button" data-mb-region="surface" aria-pressed="false">Surface + age</button>
          </div>
          <div id="mb-region-editor" class="mb-region-editor"></div>
        </section>
        <div class="mb-action"><button type="button" id="mb-apply">Apply to Mushroom →</button><button type="button" id="mb-save">Export custom specimen</button><button type="button" id="mb-reset">Reset</button></div>
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
  const state = {mode:"learn",form:"agaric",cap:"convex",surface:"gills",stipe:"equal",attachment:"adnate",spore:"ellipsoid",substrate:"soil"};
  const terms = {
    convex:"Convex (KON-veks): cap curves outward.",flat:"Plane: upper cap is mostly level.",conical:"Conical (KON-ih-kul): cap tapers toward an apex.",depressed:"Depressed: center of cap dips inward.",
    equal:"Equal stipe: near-uniform diameter.",bulbous:"Bulbous: swollen stipe base.",tapered:"Tapered: narrower at the apex.",adnate:"Adnate gills: broad attachment to stipe.",free:"Free gills: separated from stipe.",decurrent:"Decurrent gills: descend down the upper stipe.",
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
    host.querySelector("#mb-explanation").textContent=focus+" "+terms[state.form]+" "+terms[state.cap]+" "+terms[state.surface]+" "+terms[state.stipe]+" "+terms[state.attachment]+" "+terms[state.spore]+" "+terms[state.substrate];
  }
  const advancedGroups={
    pileus:["agaric_pileus_profile","agaric_pileus_center","agaric_margin"],
    stipe:["agaric_stipe_position","agaric_stipe_form","agaric_stipe_context","agaric_stipe_surface_apex","agaric_stipe_surface_mid","agaric_stipe_surface_base","agaric_stipe_taper"],
    hymenophore:["agaric_gill_attachment","agaric_gill_spacing","agaric_gill_thickness","agaric_gill_depth","agaric_lamellulae","agaric_gill_edge"],
    surface:["agaric_surface_primary","agaric_surface_secondary","agaric_surface_distribution","agaric_surface_age","agaric_surface_moisture"]
  };
  const advancedPending={};
  let activeRegion="pileus";
  function renderAnatomyEditor(){
    const editor=host.querySelector("#mb-region-editor");
    editor.replaceChildren();
    const source=window.MycoSimMorphologyBridge?.getState()?.variants||{};
    for(const group of advancedGroups[activeRegion]){
      const definition=MORPHOLOGY_VARIANTS[group];if(!definition)continue;
      const row=document.createElement("div");row.className="mb-advanced-row";row.dataset.mbAdvancedGroup=group;
      const heading=document.createElement("h5");heading.textContent=definition.label;row.append(heading);
      const options=document.createElement("div");options.className="mb-advanced-choices";options.setAttribute("role","group");options.setAttribute("aria-label",definition.label);
      for(const [id,label] of definition.options){
        const button=document.createElement("button");button.type="button";button.dataset.mbAdvanced=group;button.dataset.mbOption=id;
        button.textContent=label;button.setAttribute("aria-pressed",String((advancedPending[group]||source[group]||definition.options[0][0])===id));
        button.addEventListener("click",()=>{
          advancedPending[group]=id;
          options.querySelectorAll("button").forEach(node=>node.setAttribute("aria-pressed",String(node===button)));
          host.querySelector("#mb-pending").textContent="Pending: "+definition.label+" — "+label+". Press Apply to Mushroom to update the detailed 3D specimen.";
        });
        options.append(button);
      }
      row.append(options);editor.append(row);
    }
  }
  host.querySelectorAll("[data-mb-region]").forEach(button=>button.addEventListener("click",()=>{
    activeRegion=button.dataset.mbRegion;
    host.querySelectorAll("[data-mb-region]").forEach(node=>node.setAttribute("aria-pressed",String(node===button)));
    renderAnatomyEditor();
  }));
  const originalApply=host.querySelector("#mb-apply");
  const focus3d=document.createElement("button");focus3d.type="button";focus3d.id="mb-focus-authoritative";focus3d.textContent="View detailed 3D specimen ↑";
  focus3d.addEventListener("click",()=>window.MycoSimMorphologyBridge?.focus());
  originalApply.parentElement.append(focus3d);
  renderAnatomyEditor();

  // Visual selection stage: accessible diagram tiles instead of dropdown-first controls.
  // Original select elements remain as the single committed state for engine compatibility.
  const desired={...state};
  const traitNames={form:"Mushroom body plan",cap:"Pileus shape",stipe:"Stipe shape",attachment:"Gill attachment",surface:"Hymenophore",spore:"Spore morphology",substrate:"Growth substrate"};
  const pictograms={
    agaric:"mushroom",bracket:"shelf",cup:"cup",convex:"dome",flat:"flat",conical:"cone",depressed:"dip",
    equal:"stalk",bulbous:"bulb",tapered:"taper",adnate:"gills",free:"free",decurrent:"decurrent",
    gills:"gills",pores:"pores",teeth:"teeth",smooth:"flat",ellipsoid:"oval",globose:"round",fusiform:"spindle",
    soil:"ground",wood:"log",living_tree:"tree"
  };
  function iconFor(value){
    const k=pictograms[value]||"oval";
    const shapes={
      mushroom:'<path d="M8 27 Q15 5 40 7 Q66 5 73 27Z"/><path d="M34 27 L31 56 Q41 62 49 56 L46 27Z"/>',
      shelf:'<path d="M8 30 Q30 8 74 25 Q68 39 8 39Z"/><path d="M14 40H70"/>',
      cup:'<path d="M8 15 Q16 52 41 53 Q65 52 73 15 Q41 27 8 15Z"/>',
      dome:'<path d="M7 46 Q13 9 40 10 Q67 9 75 46Z"/>',
      flat:'<path d="M7 35 Q41 29 75 35 L75 41 L7 41Z"/>',
      cone:'<path d="M10 48L41 8L72 48Z"/>',
      dip:'<path d="M8 47 Q18 9 41 34 Q60 10 73 47Z"/>',
      stalk:'<path d="M31 6L31 55L51 55L51 6Z"/>',
      bulb:'<path d="M33 6L33 37Q12 59 41 59 Q71 59 49 37L49 6Z"/>',
      taper:'<path d="M37 6L28 56L54 56L45 6Z"/>',
      gills:'<path d="M9 13H73M15 13L20 52M27 13L29 52M40 13V52M53 13L51 52M65 13L61 52"/>',
      free:'<path d="M8 12H74M17 12L21 52M28 12L31 48M54 12L50 48M66 12L62 52M38 35V58M44 35V58"/>',
      decurrent:'<path d="M9 11H73M15 11Q22 44 34 46L34 59M67 11Q60 44 48 46L48 59M40 31V59"/>',
      pores:'<circle cx="22" cy="20" r="7"/><circle cx="43" cy="20" r="7"/><circle cx="64" cy="20" r="7"/><circle cx="32" cy="41" r="7"/><circle cx="54" cy="41" r="7"/>',
      teeth:'<path d="M7 14H75M15 14L15 51L22 14M32 14L32 56L39 14M49 14L49 52L56 14M65 14L65 48L72 14"/>',
      oval:'<ellipse cx="41" cy="32" rx="26" ry="17"/>',round:'<circle cx="41" cy="31" r="19"/>',
      spindle:'<path d="M8 32 Q41 4 74 32Q41 60 8 32Z"/>',
      ground:'<path d="M8 44Q22 39 38 44T74 44M13 51H69"/>',
      log:'<rect x="10" y="22" width="60" height="23" rx="9"/><ellipse cx="17" cy="33" rx="6" ry="10"/>',
      tree:'<path d="M38 56V25M38 35L22 23M38 33L56 17"/><circle cx="42" cy="14" r="12"/>'
    };
    return '<svg viewBox="0 0 82 66" aria-hidden="true" fill="none" stroke="#ecd39c" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">'+shapes[k]+'</svg>';
  }
  const controls=host.querySelector(".mb-controls");
  for(const select of host.querySelectorAll("[data-mb-trait]")){
    const group=select.dataset.mbTrait;
    const section=document.createElement("section");section.className="mb-trait-group";section.dataset.mbChoices=group;
    const title=document.createElement("h4");title.textContent=traitNames[group];section.append(title);
    const choices=document.createElement("div");choices.className="mb-trait-grid";choices.setAttribute("role","group");choices.setAttribute("aria-label",traitNames[group]);
    for(const option of select.options){
      const button=document.createElement("button");button.type="button";button.className="mb-trait-option";
      button.dataset.mbChoice=group;button.dataset.mbValue=option.value;
      button.setAttribute("aria-pressed",String(option.value===desired[group]));
      button.innerHTML=iconFor(option.value)+"<span>"+safe(option.textContent)+"</span>";
      button.addEventListener("click",()=>{
        desired[group]=option.value;
        section.querySelectorAll("[data-mb-choice]").forEach(el=>el.setAttribute("aria-pressed",String(el===button)));
        host.querySelector("#mb-pending").textContent="Pending choice: "+traitNames[group]+" — "+option.textContent+". Select more features or press Apply to Mushroom.";
      });
      choices.append(button);
    }
    section.append(choices);
    controls.insertBefore(section,select.parentElement);
  }
  function applyDesired(){
    for(const select of host.querySelectorAll("[data-mb-trait]")){
      const value=desired[select.dataset.mbTrait];
      if(value!==select.value){select.value=value;select.dispatchEvent(new Event("change",{bubbles:true}));}
    }
    host.querySelector("#mb-pending").textContent="Applied to mushroom. Choose another combination whenever you wish.";
  }
  // Capture phase commits before the legacy engine bridge and 3D change handler process a click.
  host.addEventListener("click",e=>{if(e.target.closest("#mb-apply"))applyDesired();},true);
  host.addEventListener("change",e=>{const key=e.target.dataset.mbTrait;if(key&&Object.prototype.hasOwnProperty.call(state,key)){state[key]=e.target.value;draw();}});
  host.addEventListener("click",e=>{
    const mode=e.target.closest("[data-mb-mode]");
    if(mode){state.mode=mode.dataset.mbMode;host.querySelectorAll("[data-mb-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b===mode)));draw();return;}
    if(e.target.id==="mb-reset"){for(const key of Object.keys(advancedPending))delete advancedPending[key];renderAnatomyEditor();for(const [k,v] of Object.entries({form:"agaric",cap:"convex",stipe:"equal",attachment:"adnate",surface:"gills",spore:"ellipsoid",substrate:"soil"})){desired[k]=v;state[k]=v;const select=host.querySelector('[data-mb-trait="'+k+'"]');select.value=v;select.dispatchEvent(new Event("change",{bubbles:true}));host.querySelectorAll('[data-mb-choice="'+k+'"]').forEach(el=>el.setAttribute("aria-pressed",String(el.dataset.mbValue===v)));}host.querySelector("#mb-pending").textContent="Reset applied to mushroom.";draw();}
    if(e.target.id==="mb-read" && "speechSynthesis" in window){speechSynthesis.cancel();const utter=new SpeechSynthesisUtterance(host.querySelector("#mb-explanation").textContent);utter.rate=.88;speechSynthesis.speak(utter);}
    if(e.target.id==="mb-save"){const payload={schema:"mycosim-custom-visual-v1",created_at:new Date().toISOString(),classification:"creative_educational_not_identified",traits:{...state}};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));a.download="mycosim-custom-specimen.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
    if(e.target.id==="mb-apply"){
      const family=state.form==="bracket"?"polyporoid":state.form==="cup"?"cup":"agaricoid";
      const mapping=state.form==="agaric"?{
        agaric_pileus_profile:state.cap,
        agaric_stipe_form:state.stipe==="bulbous"?"bulbous_base":state.stipe==="tapered"?"tapering":"equal",
        agaric_gill_attachment:state.attachment==="free"?"free_gills":state.attachment
      }:{};
      // Advanced explicit choices take precedence over introductory shape tiles.
      const variants={...mapping,...advancedPending};
      const bridge=window.MycoSimMorphologyBridge;
      const result=bridge?.apply({family,variants});
      host.querySelector("#mb-3d-status").textContent=result
        ?"Original scientific engine: "+result.family+". "+result.applied.length+" anatomical characters changed."+(result.rejected.length?" Unsupported: "+result.rejected.join(", "):"")
        :"Detailed 3D engine has not initialized; creative preview remains available.";
      renderAnatomyEditor();
    }
  });
  draw();
}
