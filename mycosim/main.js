import {MORPHOLOGY_PROFILES,PROFILE_BY_ID} from "./profiles.js?v=phase6-pileus-v4-20261003";
import {MORPHOLOGY_VARIANTS,variantLabel,variantTeaching,puffballSubtype} from "./variants.js?v=phase6-pileus-v4-20261003";
import {KNOWLEDGE_OBJECTS,getKnowledge,getPathFor,childKnowledge} from "./knowledge.js?v=phase6-pileus-v4-20261003";
import {MycoSimEngine} from "./engine.js?v=phase6-pileus-v4-20261003";
import {OBSERVATION_FIELDS,emptyObservationRecord,compareObservedToCandidates,fieldLabel} from "./identification.js?v=phase6-pileus-v4-20261003";
import {newSporeMeasurement,summarizeSpores,formatStat} from "./sporelab.js?v=phase6-pileus-v4-20261003";
import {developmentalStageOptions} from "./development.js?v=phase6-pileus-v4-20261003";
import {referenceSheet,VALIDATION_SOURCES} from "./validation_protocol.js?v=phase6-pileus-v4-20261003";
import {runMycoSimRegression,formatRegressionSummary} from "./regression.js?v=phase6-pileus-v4-20261003";
import {emptyQaMatrix,matrixFromRegression} from "./support_matrix.js?v=phase6-pileus-v4-20261003";
import {ATLAS_TERMS,AGARICOID_ARCHETYPES,archetypeList,archetypeReferenceSheet,atlasTerm,phase5Validation,PERFORMANCE_MODES} from "./phase5_atlas.js?v=phase6-pileus-v4-20261003";

const $=s=>document.querySelector(s);
const canvas=$("#stage"), status=$("#modelStatus"), info=$("#structureInfo"), stats=$("#engineStats");
const actions=$("#structureActions"), variantControls=$("#variantControls"), anatomyList=$("#anatomyList");
const breadcrumbs=$("#breadcrumbs"), eduTitle=$("#eduTitle"), eduLevel=$("#eduLevel"), eduBody=$("#eduBody");
const eduRelations=$("#eduRelations"), eduChildren=$("#eduChildren"), eduPronounce=$("#eduPronounce");
const eduRead=$("#eduRead"), orientation=$("#orientationLabel"), hoverProbe=$("#hoverProbe"), hoverProbeTitle=$("#hoverProbeTitle"), hoverProbeMeta=$("#hoverProbeMeta"), stageControls=$("#stageControls"), stageCompare=$("#stageCompare");
const qaRun=$("#runRegression"), qaStatus=$("#regressionStatus"), qaResults=$("#regressionResults");
const archetypeControls=$("#archetypeControls"), archetypeInfo=$("#archetypeInfo"), qualityControls=$("#qualityControls"), phase5Status=$("#phase5Status");
let selected=null,currentProfile=MORPHOLOGY_PROFILES[0],knowledgeMode="beginner",currentKnowledge=getKnowledge("basidiome");
let learnerMode="guided",highestLearningStep=1;
let observationRecord=emptyObservationRecord();
let sporeMeasurements=[];

function showError(err){
  status.textContent="3D engine error";
  status.style.color="#ff9b9b";
  info.textContent=err?.message||String(err);
}

function speak(text){
  if(!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.rate=.92;u.pitch=1;u.lang="en-US";
  speechSynthesis.speak(u);
}

function setLearnerMode(mode){
  learnerMode=mode==="explore"?"explore":"guided";
  document.body.dataset.learnerMode=learnerMode;
  document.querySelectorAll("[data-learner-mode]").forEach(btn=>{
    const active=btn.dataset.learnerMode===learnerMode;
    btn.classList.toggle("active",active);
    btn.setAttribute("aria-pressed",active?"true":"false");
  });
  const note=$("#learnerModeNote");
  if(note){
    note.textContent=learnerMode==="guided"
      ?"Guided mode reveals the learning path progressively as you make choices."
      :"Explore mode keeps every learning layer open so you can move anywhere immediately.";
  }
  updateLearningAccess();
}

function updateLearningAccess(){
  document.querySelectorAll("[data-learning-step]").forEach(el=>{
    const n=Number(el.dataset.learningStep);
    const locked=learnerMode==="guided" && n>highestLearningStep;
    el.classList.toggle("learning-locked",locked);
    el.setAttribute("aria-hidden",locked?"true":"false");
  });
  document.querySelectorAll("[data-jump-step]").forEach(el=>{
    const n=Number(el.dataset.jumpStep);
    const locked=learnerMode==="guided" && n>highestLearningStep;
    el.classList.toggle("locked",locked);
    el.disabled=locked;
    el.setAttribute("aria-disabled",locked?"true":"false");
  });
}

function setLearningStep(step,{scroll=false}={}){
  const numeric=Math.max(1,Math.min(5,Number(step)||1));
  if(learnerMode==="guided") highestLearningStep=Math.max(highestLearningStep,numeric);
  const n=String(numeric);
  updateLearningAccess();
  document.querySelectorAll("[data-learning-step]").forEach(el=>el.classList.toggle("active",el.dataset.learningStep===n));
  document.querySelectorAll("[data-jump-step]").forEach(el=>el.classList.toggle("active",el.dataset.jumpStep===n));
  if(scroll){
    document.querySelector('[data-learning-step="'+n+'"]')?.scrollIntoView({behavior:"smooth",block:"start"});
  }
}

function updateMorphologySummary(engine){
  const host=$("#morphologySummary");
  const detail=$("#morphologySummaryDetail");
  if(!host||!detail)return;

  const stage=engine.getDevelopmentalStage()?.label||"Mature";
  const state=engine.getVariantState();
  const supported=new Set(currentProfile.variantGroups||[]);
  const parts=[stage+" "+currentProfile.label];

  const add=(group,suffix="")=>{
    if(!supported.has(group))return;
    const label=variantLabel(group,state[group]);
    if(label)parts.push(label+suffix);
  };

  if(currentProfile.id==="agaricoid"){
    add("agaric_pileus_profile"," pileus");
    add("agaric_pileus_center"," disc");
    add("agaric_margin"," margin");
    add("agaric_stipe_position"," position");
    add("agaric_stipe_form"," stipe form");
    add("agaric_stipe_context"," context");
    add("agaric_stipe_surface_apex"," apex");
    add("agaric_stipe_surface_mid"," mid");
    add("agaric_stipe_surface_base"," base");
    add("agaric_surface_primary"," surface");
    add("agaric_surface_secondary"," secondary");
    add("agaric_surface_distribution"," distribution");
    add("agaric_surface_age"," age");
    add("agaric_surface_moisture"," finish");
    add("agaric_gill_attachment"," gills");
    add("agaric_gill_spacing"," spacing");
    add("agaric_gill_thickness"," thickness");
    add("agaric_gill_depth"," depth");
    add("agaric_lamellulae"," lamellulae");
    add("agaric_gill_edge"," edge");
  }else{
    add("pileus"," pileus");
    add("stipe"," stipe");
  }

  if(supported.has("hymenophore")){
    const h=variantLabel("hymenophore",state.hymenophore);
    if(h)parts.push(h);
  }

  if(supported.has("veil")){
    const veil=variantLabel("veil",state.veil);
    if(veil)parts.push(veil==="None"?"No veil":veil);
  }

  if(currentProfile.id==="agaricoid"){
    const snap=engine.qaSnapshot?.()||{};
    const one=snap.agaricoidPhaseOne;
    const two=snap.agaricoidPhaseTwo;
    const lines=[];
    if(one)lines.push("Phase One body plan · "+[
      one.pileusModel,one.pileusProfile+" profile",one.pileusCenter+" disc",one.pileusMargin+" margin",
      one.stipeModel,one.stipeTaper+" stipe",
      one.supportsGillInsertion?"gill insertion surface ready":"gill insertion surface unavailable"
    ].filter(Boolean).join(" · "));
    if(two)lines.push("Phase Two gill engine · "+[
      two.plateModel,two.attachment+" attachment",two.spacing+" spacing",
      two.fullGillCount+" full gills",two.thickness+" thickness",two.depth+" depth",
      two.lamellulae+" lamellulae ("+two.lamellulaCount+")",two.edge+" edge",
      two.attachmentGeometry?.descendsStipe?"descending attachment":two.attachmentGeometry?.notched?"notched attachment":two.attachmentGeometry?.detached?"detached attachment":"direct attachment"
    ].filter(Boolean).join(" · "));
    const three=snap.agaricoidPhaseThree;
    if(three)lines.push("Phase Three surface engine · "+[
      three.generator,three.primary+" primary",three.secondary+" secondary",
      three.distribution,three.age,three.moisture+" finish",
      "fibrils "+(three.counts?.fibrils||0),"scales "+(three.counts?.scales||0),
      "warts "+(three.counts?.warts||0),"cracks "+(three.counts?.cracks||0),
      "tomentum "+(three.counts?.tomentum||0),
      three.morphologicalDistribution?"morphological distribution":"distribution unavailable",
      three.transferableSurfaceEngine?"shared surface architecture":"agaricoid-only architecture"
    ].filter(Boolean).join(" · "));
    const four=snap.agaricoidPhaseFour;
    if(four)lines.push("Phase Four stipe + development · "+[
      four.stage+" stage",four.stipePosition+" position",four.stipeForm+" form",four.stipeContext+" context",
      "apex "+four.stipeSurfaceApex,"mid "+four.stipeSurfaceMid,"base "+four.stipeSurfaceBase,
      four.stipeModel,
      four.developmentalContinuity?"developmental continuity":"continuity unavailable",
      four.ageTransformsInsteadOfSwaps?"age transforms selected morphology":"stage replacement"
    ].filter(Boolean).join(" · "));
    detail.textContent=lines.join("\n")||"Agaricoid morphology engine active.";
    return;
  }

  if(currentProfile.id==="puffball"){
    const puffGroups=[
      ["puff_subtype","archetype"],["puff_shape","shape"],["puff_surface","surface"],["puff_base","base"],
      ["peridial_condition","peridium"],["ostiole_state","ostiole"],["rupture_pattern","rupture"],
      ["rupture_margin","margin"],["collapse_state","collapse"],["gleba_state","gleba"],
      ["section_view","view"],["texture_realism","detail"]
    ];
    for(const [group,suffix] of puffGroups){
      if(!supported.has(group))continue;
      const label=variantLabel(group,state[group]);
      if(label)parts.push(label+" "+suffix);
    }
  }

  host.textContent=parts.join(" · ");

  if(currentProfile.id==="puffball"){
    const dev=engine.getMorphologyState()?.developmental;
    const p=engine.getDevelopmentalStage()?.parameters||{};
    const subtype=puffballSubtype(state.puff_subtype||"true_puffball");
    const continuity=[
      `archetype ${subtype.label}`,
      `identity ${dev?.identityKey||"generalized"}`,
      `wall ${Math.round((p.peridial_thickness??p.wall_thickness??1)*100)}%`,
      `exo ${Math.round((p.exoperidial_retention??p.ornament_retention??1)*100)}%`,
      `ostiole ${Math.round((p.ostiole_formation??0)*100)}%`,
      `gleba ${Math.round((p.gleba_maturity??0)*100)}%`,
      `water loss ${Math.round((p.water_loss??0)*100)}%`,
      `collapse ${Math.round((p.collapse??0)*100)}%`,
      `rupture ${Math.round((p.wall_rupture??p.rupture_extent??0)*100)}%`,
      `discoloration ${Math.round((p.discoloration??0)*100)}%`,
      `spore depletion ${Math.round((p.spore_depletion??0)*100)}%`
    ];
    const sheet=referenceSheet(state.puff_subtype||"true_puffball",engine.getDevelopmentalStage()?.id||"mature");
    const sourceNames=(sheet?.authoritativeEvidence||[]).map(id=>VALIDATION_SOURCES[id]?.authority||id);
    detail.textContent="Developmental continuity · "+continuity.join(" · ")
      +(sheet?"\nReference target: "+sheet.morphologyTarget
        +"\nGeneralized: "+sheet.generalized.join("; ")
        +"\nVaries by taxon: "+sheet.variesByTaxon.join("; ")
        +"\nDeliberately excluded: "+sheet.deliberatelyExcluded.slice(-3).join("; ")
        +"\nEvidence: "+[...new Set(sourceNames)].join(" + ")
        +"\nImagery: "+sheet.imageryEvidence:"");
    return;
  }

  if(!supported.size){
    detail.textContent="Developmental state is applied to this family-specific body plan; no agaricoid character palette is imposed.";
  }else{
    detail.textContent="This sentence updates live as you change developmental stage or morphology characters.";
  }
}

function updateVisibleState(engine){
  const stage=engine.getDevelopmentalStage()?.label||"Mature";
  const modeLabel={
    macro:"Macro morphology",
    internal:"Internal / dissection",
    micro:"Microscopy bridge",
    spore:"Spore lab"
  }[engine.mode]||engine.mode;
  orientation.textContent=`${currentProfile.label} · ${stage} · ${modeLabel}`;
  const profileName=$("#profileName");
  if(profileName) profileName.textContent=`${currentProfile.label.toUpperCase()} · ${stage.toUpperCase()}`;
  const stateText=$("#stageStateText");
  if(stateText) stateText.textContent=`${currentProfile.label} · ${stage}`;
  updateMorphologySummary(engine);
}

function renderAnatomy(profile){
  anatomyList.innerHTML=(profile.anatomy||[]).map(a=>`<button class="structure anatomy-row" data-anatomy="${a.id}"><strong>${a.label}</strong><span>${a.description}</span><code>${a.id}</code></button>`).join("");
}

function renderVariantTeaching(group,value,engine){
  const card=$("#variantTeachingCard");
  const title=$("#variantTeachingTitle");
  const body=$("#variantTeachingBody");
  const detail=$("#variantTeachingDetail");
  if(!card||!title||!body||!detail)return;

  const teaching=variantTeaching(group,value);
  if(!teaching){
    card.hidden=true;
    return;
  }

  title.textContent=variantLabel(group,value);
  body.textContent=teaching.short;
  detail.textContent=teaching.detail;
  card.hidden=false;

  const anatomyId=teaching.anatomyId;
  const k=getKnowledge(knowledgeForAnatomy(anatomyId));
  if(k){
    renderKnowledge(knowledgeForAnatomy(anatomyId),engine,{moveCamera:false});
  }
  engine.flashStructure(anatomyId,1350,{focus:true});
}

function renderVariantControls(profile,engine){
  const supported=new Set(profile.variantGroups||[]);
  variantControls.innerHTML="";
  if(!supported.size){
    variantControls.innerHTML='<p class="copy compact">This architecture has its own body plan and does not use agaricoid character assumptions.</p>';
    return;
  }
  const state=engine.getVariantState();
  for(const [group,def] of Object.entries(MORPHOLOGY_VARIANTS)){
    if(!supported.has(group)) continue;
    const wrap=document.createElement("section");
    wrap.className="variant-field";
    wrap.dataset.variantGroup=group;
    const subtype=currentProfile.id==="puffball"?puffballSubtype(state.puff_subtype||"true_puffball"):null;
    const allowedForGroup=subtype?.allowed?.[group]||null;
    wrap.innerHTML=`
      <div class="variant-field-head">
        <span>${def.label}</span>
        <strong data-variant-current="${group}">${variantLabel(group,state[group])}</strong>
      </div>
      <div class="variant-choice-grid">
        ${def.options.map(([id,label])=>{
          const disallowed=allowedForGroup&&!allowedForGroup.includes(id);
          return `<button type="button" class="variant-choice ${state[group]===id?"active":""} ${disallowed?"disabled":""}" data-variant="${group}" data-value="${id}" aria-pressed="${state[group]===id?"true":"false"}" ${disallowed?'disabled aria-disabled="true" title="Not supported by the selected teaching archetype"':""}><span>${label}</span>${state[group]===id?'<b aria-hidden="true">✓</b>':""}</button>`;
        }).join("")}
      </div>`;
    variantControls.appendChild(wrap);
  }
  updateMorphologySummary(engine);
}

function renderStageControls(profile,engine){
  const opts=developmentalStageOptions(profile.id);
  const active=engine.getDevelopmentalStage()?.id||"mature";
  stageControls.innerHTML=opts.map(o=>`<button class="stage-pick ${o.id===active?"active":""}" data-stage="${o.id}"><strong>${o.label}</strong><span>${o.notes}</span></button>`).join("");
  stageCompare.innerHTML=opts.map(o=>`<div class="stage-compare-card ${o.id===active?"active":""}"><div class="stage-badge">${o.label}</div><strong>${profile.label}</strong><span>Maturity ${Math.round(o.maturityIndex*100)}%</span></div>`).join("");
}

function knowledgeForAnatomy(id){
  if(KNOWLEDGE_OBJECTS[id]) return id;
  if(id==="veil_structure")return "veil_structure";
  if(id==="tube_layer")return "tube_layer";
  if(id==="context")return "context";
  return id;
}

function renderKnowledge(id,engine,{moveCamera=true}={}){
  currentKnowledge=getKnowledge(id);
  const path=getPathFor(currentProfile.id,id);
  breadcrumbs.innerHTML=path.map((pid,i)=>{
    const k=getKnowledge(pid);
    return `<button data-crumb="${pid}" class="crumb">${k.label}</button>${i<path.length-1?'<span>›</span>':''}`;
  }).join("");
  eduTitle.textContent=currentKnowledge.label;
  eduLevel.textContent=currentKnowledge.level.toUpperCase();
  const definition=knowledgeMode==="expert"?currentKnowledge.expert:currentKnowledge.beginner;
  const p5=phase5Knowledge(id);
  eduBody.textContent=[
    "Definition: "+(p5?.definition||definition),
    "Why it matters: "+(p5?.whyItMatters||currentKnowledge.whyItMatters),
    "Developmental significance: "+(p5?.developmentalSignificance||currentKnowledge.developmentalSignificance),
    p5?.identificationBoundary||currentKnowledge.identificationBoundary
  ].join("\n\n");
  eduPronounce.textContent="Pronunciation: "+(p5?.pronunciation||currentKnowledge.pronunciation||currentKnowledge.label)+" · hear term";
  eduRelations.innerHTML=(currentKnowledge.relationships||[]).length
    ? currentKnowledge.relationships.map(r=>`<button class="relation-chip" data-knowledge="${r}">${getKnowledge(r).label}</button>`).join("")
    : '<span class="muted-mini">No related structures authored.</span>';
  const kids=childKnowledge(currentProfile.id,id);
  eduChildren.innerHTML=kids.length
    ? kids.map(k=>`<button class="knowledge-child" data-knowledge="${k.id}"><strong>${k.label}</strong><span>${k.level}</span></button>`).join("")
    : '<span class="muted-mini">End of this navigation branch.</span>';
  orientation.textContent=`${currentProfile.label} · ${currentKnowledge.label}`;

  if(moveCamera){
    const macroId=id==="lamella"?"hymenophore":id==="pore_surface"?"hymenophore":id;
    if(engine.objects.has(macroId)){
      engine.clearKnowledgeProxy();
      engine.contextualTransparency(macroId,.12);
      engine.flyTo(macroId);
    }else{
      engine.setMode("micro");
      const parentPath=path.slice().reverse().find(x=>engine.objects.has(x));
      if(parentPath)engine.contextualTransparency(parentPath,.1);
      engine.showKnowledgeProxy(id);
    }
  }
}


function humanizeOption(v){
  return String(v||"").replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());
}

function renderSupportMatrix(matrix){
  const host=$("#supportMatrix");
  if(!host)return;
  const stageOrder=["young","mature","old"];
  const badge=(stage)=>{
    const cls=stage.qaStatus==="pass"?"pass":stage.qaStatus==="fail"?"fail":"pending";
    const text=stage.qaStatus==="pass"?"PASS":stage.qaStatus==="fail"?"FAIL":"NOT RUN";
    const canonical=stage.role==="canonical_reference"?' <em>canonical</em>':"";
    return `<span class="matrix-stage ${cls}"><strong>${stage.stageId}</strong><small>${text}${canonical}</small></span>`;
  };
  host.innerHTML=`<div class="support-matrix-grid">${matrix.map(row=>`<div class="support-matrix-row"><div class="matrix-family"><strong>${row.family}</strong><span>${row.profileId}</span></div><div class="matrix-stages">${stageOrder.map(id=>badge(row.stages[id])).join("")}</div></div>`).join("")}</div>`;
}

function renderRegressionReport(report){
  if(!qaStatus||!qaResults)return;
  qaStatus.textContent=formatRegressionSummary(report);
  qaStatus.className="regression-status "+(report.pass?"pass":"fail");
  const rows=report.rows.map(r=>{
    const checks=[
      ["Render",r.render],["Frame",r.framing],["Hover",r.hover],["Focus",r.focus],
      ["Isolate/Hide",r.isolateHide],["Explode",r.exploded],["Section",r.section],
      ["Transparency",r.transparency],["Anatomy nav",r.anatomyNavigation],
      ["Mode",r.modePreserved],["FPS",r.fpsAcceptable]
    ];
    return `<tr class="${r.pass?"pass":"fail"}"><td>${r.family}</td><td>${r.stageId}</td><td>${checks.map(([k,v])=>`<span class="qa-chip ${v?"pass":"fail"}">${k} ${v?"✓":"✕"}</span>`).join("")}</td><td>${r.fps||"—"}</td><td>${r.objects}</td><td>${r.drawCalls}</td></tr>`;
  }).join("");
  renderSupportMatrix(matrixFromRegression(report));
  qaResults.innerHTML=`
    <div class="qa-summary-grid">
      <div><strong>${report.passedCombinations}/${report.totalCombinations}</strong><span>combinations passed</span></div>
      <div><strong>${report.memory.pass?"PASS":"FAIL"}</strong><span>memory Δ geometry ${report.memory.delta.geometries}</span></div>
      <div><strong>${report.mobile.pass?"PASS":"FAIL"}</strong><span>${report.mobile.viewport} canvas ${report.mobile.canvas.width}×${report.mobile.canvas.height}</span></div>
      <div><strong>${report.specimenIsolation.pass?"PASS":"FAIL"}</strong><span>specimen isolation · ${report.specimenIsolation.networkWrites.length} writes</span></div>
      <div><strong>${report.campaign?.pass?"PASS":"FAIL"}</strong><span>realism campaign · ${report.campaign?.stateCount||0}/${report.campaign?.expectedStateCount||0} gasteroid states</span></div>
    </div>
    <div class="qa-table-wrap"><table class="qa-table"><thead><tr><th>Family</th><th>Stage</th><th>Checks</th><th>FPS</th><th>Objects</th><th>Draw calls</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}


function renderArchetypes(engine){
  if(!archetypeControls)return;
  if(currentProfile.id!=="agaricoid"){
    archetypeControls.innerHTML='<span class="muted-mini">Teaching archetypes are currently scoped to the agaricoid engine.</span>';
    if(archetypeInfo)archetypeInfo.textContent="Archetype presets do not alter non-agaricoid body plans.";
    return;
  }
  archetypeControls.innerHTML=archetypeList().map((a,i)=>`<button type="button" class="archetype-choice ${i===0?"active":""}" data-archetype="${a.id}"><strong>${a.label}</strong><span>${a.summary}</span></button>`).join("");
  if(archetypeInfo)archetypeInfo.textContent="Teaching archetypes constrain compatible morphology combinations. They are not genus or species identifications.";
}

function applyArchetype(id,engine){
  const a=AGARICOID_ARCHETYPES[id];
  if(!a||currentProfile.id!=="agaricoid")return;
  for(const [group,value] of Object.entries(a.defaults)){
    if(!(currentProfile.variantGroups||[]).includes(group))continue;
    engine.setVariant(group,value);
  }
  renderVariantControls(currentProfile,engine);
  renderStageControls(currentProfile,engine);
  renderAnatomy(currentProfile);
  updateVisibleState(engine);
  const sheet=archetypeReferenceSheet(id);
  if(archetypeInfo){
    archetypeInfo.textContent=`${a.label} · ${a.boundary}\nAllowed cap forms: ${a.allowed.caps.join(", ")} · Gill logic: ${a.allowed.gills.join(", ")} · Stipe tendencies: ${a.allowed.stipes.join(", ")}\nGeneralized: ${sheet.generalized.join("; ")}\nVaries: ${sheet.varies.join("; ")}\nExcluded: ${sheet.excluded.join("; ")}`;
  }
}

function renderQualityControls(engine){
  if(!qualityControls)return;
  const active=engine.qaSnapshot?.().realismTier||"atlas";
  qualityControls.innerHTML=Object.values(PERFORMANCE_MODES).map(m=>`<button type="button" class="quality-choice ${active===m.id?"active":""}" data-quality="${m.id}"><strong>${m.label}</strong><span>${m.purpose}</span></button>`).join("");
}

function phase5Knowledge(id){
  const direct=atlasTerm(id);
  if(direct)return direct;
  const k=getKnowledge(id);
  const label=(k?.label||"").toLowerCase();
  const aliases=[
    ["pileus","pileus"],["disc","disc"],["margin","pileus_margin"],["lamell","lamella"],["hymenophore","hymenophore"],
    ["stipe apex","stipe_apex"],["stipe base","stipe_base"],["stipe","stipe"],["annulus","annulus"],["volva","volva"],
    ["umbo","umbo"],["umbil","umbilicate"],["infund","infundibuliform"]
  ];
  const hit=aliases.find(([needle])=>label.includes(needle));
  return hit?ATLAS_TERMS[hit[1]]:null;
}

function renderObservationForm(){
  const root=$("#observationForm");
  if(!root)return;
  root.innerHTML=OBSERVATION_FIELDS.map(f=>{
    const rec=observationRecord.fields[f.id]||{value:"",evidence_state:"not_examined",provenance:""};
    const input=f.type==="select"
      ? `<select data-obs-value="${f.id}">${f.options.map(o=>`<option value="${o}" ${rec.value===o?"selected":""}>${humanizeOption(o)}</option>`).join("")}</select>`
      : `<input data-obs-value="${f.id}" value="${String(rec.value||"").replaceAll('"','&quot;')}" placeholder="${f.label}">`;
    return `<label class="obs-field ${f.type==="text"?"full":""}">
      <span>${f.label}</span>
      ${input}
      <div class="evidence-row">
        <select data-obs-state="${f.id}">
          ${["observed","failed","inconclusive","not_examined"].map(s=>`<option value="${s}" ${rec.evidence_state===s?"selected":""}>${humanizeOption(s)}</option>`).join("")}
        </select>
        <input data-obs-provenance="${f.id}" value="${String(rec.provenance||"").replaceAll('"','&quot;')}" placeholder="Provenance / source">
      </div>
    </label>`;
  }).join("");
}

function collectObservationForm(){
  for(const f of OBSERVATION_FIELDS){
    const valueEl=document.querySelector(`[data-obs-value="${f.id}"]`);
    const stateEl=document.querySelector(`[data-obs-state="${f.id}"]`);
    const provEl=document.querySelector(`[data-obs-provenance="${f.id}"]`);
    observationRecord.fields[f.id]={
      value:valueEl?.value||"",
      evidence_state:stateEl?.value||"not_examined",
      provenance:provEl?.value||""
    };
  }
}

function renderCandidateResults(){
  collectObservationForm();
  const results=compareObservedToCandidates(observationRecord);
  const root=$("#candidateResults");
  root.innerHTML=results.map(r=>`
    <div class="candidate-card">
      <div class="candidate-head"><strong>${r.candidate_label}</strong><span class="confidence ${r.confidence}">${r.confidence}</span></div>
      <div class="char-row">
        ${r.matches.map(x=>`<span class="char-chip match">MATCH · ${fieldLabel(x)}${r.diagnostic.includes(x)?" · diagnostic":""}</span>`).join("")}
        ${r.conflicts.map(x=>`<span class="char-chip conflict">CONFLICT · ${fieldLabel(x)}</span>`).join("")}
        ${r.missing.map(x=>`<span class="char-chip missing">MISSING · ${fieldLabel(x)}</span>`).join("")}
      </div>
      <div class="muted-mini" style="margin-top:7px">Compatibility ${Math.round(r.compatibility*100)}% · Evidence coverage ${Math.round(r.evidence_coverage*100)}% · ${r.interpretation}</div>
    </div>`).join("");
}

function sporeRowHtml(m,index){
  return `<tr class="spore-row" data-spore-row="${index}">
    <td><input data-spore-field="length_um" value="${m.length_um||""}" inputmode="decimal"></td>
    <td><input data-spore-field="width_um" value="${m.width_um||""}" inputmode="decimal"></td>
    <td><select data-spore-field="evidence_state">${["observed","failed","inconclusive","not_examined"].map(s=>`<option value="${s}" ${m.evidence_state===s?"selected":""}>${humanizeOption(s)}</option>`).join("")}</select></td>
    <td><input data-spore-field="provenance" value="${String(m.provenance||"").replaceAll('"','&quot;')}" placeholder="slide/image/record"></td>
    <td><input data-spore-field="source_image" value="${String(m.source_image||"").replaceAll('"','&quot;')}" placeholder="source image"></td>
    <td><input data-spore-field="notes" value="${String(m.notes||"").replaceAll('"','&quot;')}" placeholder="notes"></td>
    <td><button data-remove-spore="${index}" type="button">×</button></td>
  </tr>`;
}

function renderSporeRows(){
  const body=$("#sporeRows");
  body.innerHTML=sporeMeasurements.map(sporeRowHtml).join("");
}

function collectSporeRows(){
  const rows=[...document.querySelectorAll("[data-spore-row]")];
  sporeMeasurements=rows.map(row=>{
    const m=newSporeMeasurement();
    row.querySelectorAll("[data-spore-field]").forEach(el=>m[el.dataset.sporeField]=el.value);
    return m;
  });
}

function renderSporeSummary(){
  collectSporeRows();
  const s=summarizeSpores(sporeMeasurements);
  const q=s.q_ratio;
  $("#sporeSummary").innerHTML=`
    <strong>Observed spores:</strong> ${s.count_observed} / ${s.count_total}<br>
    <strong>Length:</strong> ${formatStat(s.length_um)} µm<br>
    <strong>Width:</strong> ${formatStat(s.width_um)} µm<br>
    <strong>Q ratio (L/W):</strong> ${formatStat(q,3)}<br>
    <strong>Failed:</strong> ${s.count_failed} · <strong>Inconclusive:</strong> ${s.count_inconclusive}<br>
    <strong>Measurement provenance complete:</strong> ${s.provenance_complete?"Yes":"No"}
  `;
}

try{
  const engine=new MycoSimEngine({
    canvas,
    onHover:meta=>{
      if(!meta){
        hoverProbe?.classList.remove("visible");
        return;
      }
      const knowledgeId=meta.knowledgeId||knowledgeForAnatomy(meta.id);
      const k=getKnowledge(knowledgeId);
      if(!selected) info.textContent="Hover: "+k.label+" — "+k.beginner;
      if(hoverProbe&&hoverProbeTitle&&hoverProbeMeta){
        hoverProbeTitle.textContent=meta.hoverLabel||k.label;
        const profile=meta.profileLabel||currentProfile.label;
        const category=String(meta.category||k.level||"structure").replaceAll("_"," ");
        const surface=meta.surface||"surface";
        const region=meta.region||k.label;
        const p=meta.point||{x:0,y:0,z:0};
        const why=k.whyItMatters;
        const development=k.developmentalSignificance;
        const related=(k.relationships||[]).map(r=>getKnowledge(r).label).join(" · ")||"None authored";
        hoverProbeMeta.innerHTML=`<strong>${region}</strong><span><b>Observation:</b> ${k.observation}</span><span><b>Term:</b> ${k.label}</span><span><b>Pronunciation:</b> ${k.pronunciation||k.label}</span><span><b>Definition:</b> ${k.beginner}</span><span><b>Why it matters:</b> ${why}</span><span><b>Developmental significance:</b> ${development}</span><span><b>Related structures:</b> ${related}</span><span><b>Interpretation boundary:</b> ${k.identificationBoundary}</span><span>${profile} · ${category}</span><span>${surface}</span><code>id: ${meta.id} · point: ${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}</code>`;
        hoverProbe.style.left=Math.min(window.innerWidth-290,Math.max(8,meta.screen.clientX+16))+"px";
        hoverProbe.style.top=Math.min(window.innerHeight-128,Math.max(54,meta.screen.clientY+16))+"px";
        hoverProbe.classList.add("visible");
      }
    },
    onSelect:meta=>{
      selected=meta; actions.hidden=false;
      const selectedKnowledge=getKnowledge(meta.knowledgeId||knowledgeForAnatomy(meta.id));
      info.textContent="Observed structure selected: "+meta.label+" · terminology: "+selectedKnowledge.label+" · identification remains separate";
      renderKnowledge(meta.knowledgeId||knowledgeForAnatomy(meta.id),engine);
    },
    onStatus:t=>status.textContent=t,
    onStats:s=>{if(stats)stats.textContent=`${s.fps} FPS · ${s.objects} objects · ${s.drawCalls} draw calls · ${Math.round((s.triangles||0)/1000)}k tris · ${s.quality||"atlas"}`;}
  });

  document.addEventListener("click",e=>{
    const modeToggle=e.target.closest("[data-learner-mode]");
    if(modeToggle){
      setLearnerMode(modeToggle.dataset.learnerMode);
      return;
    }
    const jump=e.target.closest("[data-jump-step]");
    if(jump && !jump.disabled){
      setLearningStep(jump.dataset.jumpStep,{scroll:true});
      return;
    }
  });

  const grid=$("#modelGrid");
  grid.innerHTML=MORPHOLOGY_PROFILES.map((p,i)=>`<button class="model-pick ${i===0?"active":""}" data-model="${p.id}"><strong>${p.label}</strong><span>${p.description}</span></button>`).join("");

  function activateProfile(id){
    const p=PROFILE_BY_ID[id]; if(!p)return;
    currentProfile=p; selected=null; actions.hidden=true;
    info.textContent="Loading morphology model…";
    engine.loadProfile(id);
    if(!window.MYCOSIM_BOOT_MS){
      window.MYCOSIM_BOOT_MS=Math.round(performance.now()-(window.MYCOSIM_BOOT_STARTED||performance.now()));
      clearTimeout(window.MYCOSIM_BOOT_WATCHDOG);
    }
    renderVariantControls(p,engine);
    renderStageControls(p,engine);
    renderAnatomy(p);
    $("#profileName").textContent=p.label.toUpperCase();
    if(window.MYCOSIM_BOOT_MS && status) status.textContent=`3D engine online · ${p.label} · ${engine.getDevelopmentalStage()?.label||"Mature"} · boot ${window.MYCOSIM_BOOT_MS} ms`;
    renderKnowledge("basidiome",engine,{moveCamera:false});
    renderArchetypes(engine);
    renderQualityControls(engine);
    updateVisibleState(engine);
  }

  grid.addEventListener("click",e=>{
    const b=e.target.closest("[data-model]"); if(!b)return;
    grid.querySelectorAll(".model-pick").forEach(x=>x.classList.remove("active")); b.classList.add("active");
    activateProfile(b.dataset.model);
    setLearningStep(2);
  });

  archetypeControls?.addEventListener("click",e=>{
    const b=e.target.closest("[data-archetype]");if(!b)return;
    archetypeControls.querySelectorAll(".archetype-choice").forEach(x=>x.classList.toggle("active",x===b));
    applyArchetype(b.dataset.archetype,engine);
    setLearningStep(3);
  });

  qualityControls?.addEventListener("click",e=>{
    const b=e.target.closest("[data-quality]");if(!b)return;
    engine.setRealismMode?.(b.dataset.quality);
    renderQualityControls(engine);
    updateVisibleState(engine);
  });

  stageControls.addEventListener("click",e=>{
    const b=e.target.closest("[data-stage]"); if(!b)return;
    engine.setDevelopmentalStage(b.dataset.stage);
    if(currentProfile.id==="puffball"){
      renderVariantControls(currentProfile,engine);
    }
    renderStageControls(currentProfile,engine);
    const st=engine.getDevelopmentalStage();
    info.textContent=currentProfile.id==="puffball"
      ? `${currentProfile.label} · ${st.label}: ${st.notes}`
      : `${currentProfile.label} · ${st.label} developmental stage`;
    updateVisibleState(engine);
    setLearningStep(3);
  });

  variantControls.addEventListener("click",e=>{
    const button=e.target.closest(".variant-choice[data-variant][data-value]"); if(!button)return;
    const group=button.dataset.variant;
    const value=button.dataset.value;
    selected=null; actions.hidden=true;
    engine.setVariant(group,value);
    info.textContent=`${MORPHOLOGY_VARIANTS[group].label}: ${variantLabel(group,value)}`;
    renderVariantControls(currentProfile,engine);
    renderVariantTeaching(group,value,engine);
    renderAnatomy(currentProfile);
    renderKnowledge("basidiome",engine,{moveCamera:false});
    updateVisibleState(engine);
    setLearningStep(4);
  });

  anatomyList.addEventListener("click",e=>{
    const row=e.target.closest("[data-anatomy]"); if(!row)return;
    const a=currentProfile.anatomy.find(x=>x.id===row.dataset.anatomy);
    if(!a)return;
    selected=a; actions.hidden=false; info.textContent="Selected from anatomy index: "+a.label+" · "+a.id;
    renderKnowledge(knowledgeForAnatomy(a.id),engine);
    setLearningStep(5);
  });

  document.querySelectorAll(".mode").forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
    engine.setMode(btn.dataset.mode);
    updateVisibleState(engine);
  });

  $("#explodedToggle").onclick=()=>{
    const active=$("#explodedToggle").classList.toggle("active");
    engine.setExploded(active);
  };
  $("#sectionToggle").onclick=()=>{
    const active=$("#sectionToggle").classList.toggle("active");
    engine.setSection(active);
  };
  $("#contextToggle").onclick=()=>{
    const active=$("#contextToggle").classList.toggle("active");
    if(active&&currentKnowledge)engine.contextualTransparency(currentKnowledge.id,.12); else engine.applyMode();
  };
  $("#wholeView").onclick=()=>{
    selected=null;actions.hidden=true;engine.resetPresentation();engine.clearKnowledgeProxy();
    renderKnowledge("basidiome",engine,{moveCamera:false});
    engine.frameModel({animate:true});
    updateVisibleState(engine);
  };

  $("#focusStructure").onclick=()=>selected&&engine.focus(selected.id);
  $("#isolateStructure").onclick=()=>selected&&engine.isolate(selected.id);
  $("#hideStructure").onclick=()=>selected&&engine.hide(selected.id);
  $("#transparentStructure").onclick=()=>selected&&engine.setTransparent(selected.id,.22);
  $("#resetStructure").onclick=()=>{engine.resetPresentation();if(selected)engine.show(selected.id);};

  breadcrumbs.addEventListener("click",e=>{
    const b=e.target.closest("[data-crumb]");if(b)renderKnowledge(b.dataset.crumb,engine);
  });
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-knowledge]");if(b)renderKnowledge(b.dataset.knowledge,engine);
  });

  document.querySelectorAll("[data-knowledge-mode]").forEach(btn=>btn.onclick=()=>{
    knowledgeMode=btn.dataset.knowledgeMode;
    document.querySelectorAll("[data-knowledge-mode]").forEach(x=>x.classList.toggle("active",x===btn));
    renderKnowledge(currentKnowledge.id,engine,{moveCamera:false});
  });

  eduPronounce.onclick=()=>speak(currentKnowledge.pronunciation||currentKnowledge.label);
  eduRead.onclick=()=>speak(`${currentKnowledge.label}. ${knowledgeMode==="expert"?currentKnowledge.expert:currentKnowledge.beginner}`);

  if(qaRun){
    qaRun.onclick=async()=>{
      qaRun.disabled=true;
      qaStatus.textContent="Running 36 family × stage regression combinations…";
      qaStatus.className="regression-status";
      qaResults.innerHTML="";
      try{
        const report=await runMycoSimRegression(engine,{
          onProgress:p=>{qaStatus.textContent=`Regression ${p.index}/${p.total} · ${p.profile} · ${p.stageId}`;}
        });
        window.__MYCOSIM_LAST_REGRESSION__=report;
        renderRegressionReport(report);
      }catch(err){
        console.error(err);
        qaStatus.textContent="Regression error · "+(err?.message||String(err));
        qaStatus.className="regression-status fail";
      }finally{
        qaRun.disabled=false;
        updateVisibleState(engine);
      }
    };
  }

  renderObservationForm();
  $("#compareCandidates").onclick=renderCandidateResults;
  $("#clearObservation").onclick=()=>{observationRecord=emptyObservationRecord();renderObservationForm();$("#candidateResults").innerHTML="";};

  $("#addSporeRow").onclick=()=>{collectSporeRows();sporeMeasurements.push(newSporeMeasurement());renderSporeRows();};
  $("#summarizeSpores").onclick=renderSporeSummary;
  $("#sporeRows").addEventListener("click",e=>{
    const b=e.target.closest("[data-remove-spore]");if(!b)return;
    collectSporeRows();sporeMeasurements.splice(Number(b.dataset.removeSpore),1);renderSporeRows();renderSporeSummary();
  });
  sporeMeasurements.push(newSporeMeasurement());
  renderSporeRows();

  renderSupportMatrix(emptyQaMatrix());
  const p5Audit=phase5Validation({variantDefinitions:MORPHOLOGY_VARIANTS});
  if(phase5Status) phase5Status.textContent=`Phase 5 scientific layer · ${p5Audit.pass?"PASS":"FAIL"} · ${p5Audit.terminology.count} standardized terms · ${p5Audit.archetypes.archetypeCount} agaricoid teaching archetypes · LOD + safe instancing + startup instrumentation active`;
  setLearnerMode("guided");
  activateProfile(MORPHOLOGY_PROFILES[0].id);
  setLearningStep(1);
  if(new URLSearchParams(location.search).get("qa")==="1"&&qaRun){
    setTimeout(()=>qaRun.click(),250);
  }
  window.addEventListener("pagehide",()=>engine.dispose(),{once:true});
}catch(err){console.error(err);showError(err);}