const masterData=window.ATLAS_DATA||[];
const drivePhotos=window.DRIVE_PHOTOS||[];
const movieMedia=window.MOVIE_MEDIA||[];
const measurementData=window.MEASUREMENT_DATA||[];
const masterCount=masterData.length;
const data=masterData;

function driveCollection(folder){
  const m=String(folder||'').toUpperCase().match(/\b([A-Z]{2}\d+|FN)\b/);
  return m?m[1]:'DRIVE';
}
function driveFamily(collection){
  const m=String(collection||'').match(/^([A-Z]{2})/);
  return m?m[1]:'DR';
}
function driveCategory(p){
  const n=String(p.filename||'').toUpperCase();
  if(n.includes('SPMV')||n.includes('MICRO')) return 'Microscopy';
  if(n.includes('SPV')||/SP(?:\D|$)/.test(n)) return 'Spore print / preparation';
  return 'Drive archive / additional photo';
}
function mergeDrivePhotos(){
  const byCode=new Map(data.map(s=>[String(s.code||'').toUpperCase(),s]));
  const archives=new Map();
  for(const p of drivePhotos){
    let target=p.specimen?byCode.get(String(p.specimen).toUpperCase()):null;
    if(!target && p.specimen){
      const collection=p.collection||driveCollection(p.folder);
      const code=String(p.specimen).toUpperCase();
      target={
        code,
        site:collection,
        family:p.family||driveFamily(collection),
        collection,
        status:'Drive-only accession — photographed source preserved; master dossier not yet present',
        archiveIndex:null,
        sourceLine:'Explicit specimen accession recovered from the Google Drive filename/path. This record is kept separate rather than merged by visual similarity.',
        summary:{
          'Record type':'Drive-only explicit accession',
          'Provenance':p.folder?`Rutgers / ${p.folder}`:'Rutgers Google Drive',
          'Assignment rule':'Accession derived from explicit source filename/path only; no visual-similarity assignment.'
        },
        completeness:[
          ['Photo provenance','Yes'],
          ['Explicit specimen accession','Yes'],
          ['Master dossier present','No']
        ],
        images:[]
      };
      data.push(target);
      byCode.set(code,target);
    }
    if(!target){
      const collection=p.collection||driveCollection(p.folder);
      const code=`${collection}-DRIVE-ARCHIVE`;
      target=archives.get(code);
      if(!target){
        target={
          code,
          site:collection,
          family:driveFamily(collection),
          collection,
          status:'Google Drive archive — accession mapping not yet verified',
          archiveIndex:null,
          sourceLine:'Photos in this archive are preserved in the application but are not assigned to a specimen unless the accession is explicit in the source filename.',
          summary:{
            'Archive purpose':'Additional Google Drive photographs retained for workshop inspection and later accession mapping.',
            'Provenance':p.folder?`Rutgers / ${p.folder}`:'Rutgers Google Drive',
            'Assignment rule':'No visual-similarity matching. Only explicit accession-coded filenames are automatically attached to specimen records.'
          },
          completeness:[
            ['Photo provenance','Yes'],
            ['Specimen accession verified','No'],
            ['Diagnostic assignment','No']
          ],
          images:[]
        };
        archives.set(code,target);
        data.push(target);
        byCode.set(code,target);
      }
    }
    const original=p.original;
    if(!original) continue;
    const duplicate=(target.images||[]).some(im=>im.original===original||(
      String(im.filename||'').toLowerCase()===String(p.filename||'').toLowerCase() &&
      String(im.original||'').toLowerCase()===String(original).toLowerCase()
    ));
    if(duplicate) continue;
    target.images=target.images||[];
    target.images.push({
      category:p.category||driveCategory(p),
      filename:p.filename||original.split('/').pop(),
      caption:p.caption||`Google Drive source — ${p.filename||'additional photograph'}`,
      original,
      thumb:p.thumb||original,
      driveSource:p.source_relpath||''
    });
  }
}
mergeDrivePhotos();

function applySpecimenEnrichments(){
  const byCode=new Map(data.map(s=>[String(s.code||'').toUpperCase(),s]));
  const enrichments=window.SPECIMEN_ENRICHMENTS||{};
  for(const [codeRaw,e] of Object.entries(enrichments)){
    const code=String(codeRaw).toUpperCase();
    let target=byCode.get(code);
    if(!target){
      target={code,site:e.collection||code.split('-')[0],family:e.family||code.slice(0,2),collection:e.collection||code.split('-')[0],images:[]};
      data.push(target);byCode.set(code,target);
    }
    if(e.status) target.status=e.status;
    if(e.sourceLine) target.sourceLine=e.sourceLine;
    if(e.summary) target.summary={...(target.summary||{}),...e.summary};
    if(e.completeness){
      const merged=new Map([...(target.completeness||[]),...e.completeness].map(([k,v])=>[k,v]));
      target.completeness=[...merged.entries()];
    }
  }
}
applySpecimenEnrichments();

function measurementCollection(code){
  const m=String(code||'').toUpperCase().match(/^([A-Z]+\d*)-F/);
  return m?m[1]:'MEASUREMENTS';
}
function measurementFamily(collection){
  const m=String(collection||'').match(/^([A-Z]{2})/);
  return m?m[1]:'MS';
}
function mergeMeasurements(){
  const byCode=new Map(data.map(s=>[String(s.code||'').toUpperCase(),s]));
  for(const m of measurementData){
    const code=String(m.code||'').toUpperCase();
    if(!code) continue;
    let target=byCode.get(code);
    if(!target){
      const collection=measurementCollection(code);
      target={
        code,
        site:collection,
        family:measurementFamily(collection),
        collection,
        status:'Measurement-only accession — hand-recorded measurements preserved; master specimen dossier or imagery may not yet be present',
        archiveIndex:null,
        sourceLine:'Measurement accession preserved exactly from the submitted Rutgers measurement sources. No specimen reassignment is inferred for unmatched accessions.',
        summary:{
          'Record type':'Measurement-only explicit accession',
          'Measurement provenance':'Hand-recorded Rutgers measurement data',
          'Assignment rule':'Accession text is preserved; unmatched codes are not silently corrected or reassigned.'
        },
        completeness:[
          ['Measurement data','Yes'],
          ['Master dossier present','No']
        ],
        images:[],
        measurements:[]
      };
      data.push(target);
      byCode.set(code,target);
    }
    target.measurements=target.measurements||[];
    const duplicate=target.measurements.some(x=>
      String(x.source||'')===String(m.source||'') &&
      String(x.source_id||'')===String(m.source_id||'') &&
      JSON.stringify(x.fields||{})===JSON.stringify(m.fields||{})
    );
    if(!duplicate) target.measurements.push(m);
    target.summary=target.summary||{};
    target.summary['Measurement records']=String(target.measurements.length);
    const cm=new Map((target.completeness||[]).map(([k,v])=>[k,v]));
    cm.set('Measurements documented','Yes');
    target.completeness=[...cm.entries()];
  }
}
mergeMeasurements();

function mergeMovies(){
  const byCode=new Map(data.map(s=>[String(s.code||'').toUpperCase(),s]));
  for(const m of movieMedia){
    const code=String(m.code||'JN1-MOVIES').toUpperCase();
    let target=byCode.get(code);
    if(!target){
      target={
        code,
        site:m.collection||'JN1 Movies',
        family:m.family||'JN',
        collection:m.collection||'JN1 Movies',
        status:'Movie collection — verified laboratory video archive',
        archiveIndex:null,
        sourceLine:'Video media retained as a separate movie collection. Source filename and web-playable derivative are both preserved; no specimen assignment is inferred unless explicitly encoded.',
        summary:{
          'Record type':'Movie / video collection',
          'Provenance':'Rutgers laboratory media',
          'Assignment rule':'Separate movie collection; no visual-similarity specimen assignment.'
        },
        completeness:[
          ['Video provenance','Yes'],
          ['Source filename preserved','Yes'],
          ['Specimen accession verified','No']
        ],
        images:[],
        movies:[]
      };
      data.push(target);byCode.set(code,target);
    }
    target.movies=target.movies||[];
    if(target.movies.some(v=>v.filename===m.filename||v.driveView===m.drive_view)) continue;
    target.movies.push({
      category:m.category||'Movie / video',
      filename:m.filename,
      sourceFilename:m.source_filename||m.filename,
      caption:m.caption||m.filename,
      preview:m.preview,
      driveView:m.drive_view,
      poster:m.poster||'',
      sourceRelpath:m.source_relpath||'',
      durationSeconds:m.duration_seconds||null,
      note:m.web_derivative_note||''
    });
  }
}
mergeMovies();

const GLOSSARY=Object.freeze({
  confluent:{definition:"Growing or merging together so adjacent structures become continuous or fused.",pronounce:"confluent"},
  basidioma:{definition:"A fruiting body produced by a basidiomycete fungus; plural: basidiomata.",pronounce:"basidioma"},
  basidiomata:{definition:"Plural of basidioma: fungal fruiting bodies produced by basidiomycetes.",pronounce:"basidiomata"},
  hymenophore:{definition:"The structure that bears or supports the spore-producing hymenium, such as gills, pores, teeth, folds, or a smooth fertile surface.",pronounce:"hymenophore"},
  poroid:{definition:"Having a fertile surface composed of pores rather than gills or teeth; the pores are the openings of tubes or tube-like fertile structures.",pronounce:"PORE-oyd"},
  tubular:{definition:"Composed of or organized into tubes; in a poroid hymenophore, the visible pores are the openings of the underlying tubes.",pronounce:"TOO-byuh-ler"},
  hydnoid:{definition:"Having a tooth- or spine-bearing fertile surface.",pronounce:"hydnoid"},
  pileus:{definition:"The cap or upper expanded portion of many fungal fruiting bodies.",pronounce:"pileus"},
  margin:{definition:"The outer edge of the pileus; its shape, thickness, striation, appendiculation, color, and orientation may be diagnostically important.",pronounce:"margin"},
  umbo:{definition:"A raised central boss or broad protuberance on the pileus.",pronounce:"umbo"},
  umbonate:{definition:"Having a distinct central umbo or raised boss on the pileus.",pronounce:"umbonate"},
  papillate:{definition:"Bearing a small, nipple-like central projection; more sharply localized than a typical umbo.",pronounce:"papillate"},
  infundibuliform:{definition:"Funnel-shaped; describing a pileus with a pronounced central depression that slopes into an elevated or spreading margin.",pronounce:"infundibuliform"},
  conical:{definition:"Cone-shaped, with the pileus rising to a relatively distinct apex.",pronounce:"conical"},
  campanulate:{definition:"Bell-shaped; a pileus with a rounded to convex apex and downward-curving sides.",pronounce:"campanulate"},
  ovate:{definition:"Egg-shaped or broadly ovoid in profile.",pronounce:"ovate"},
  convex:{definition:"Arched outward, with the pileus surface curving upward from the margin toward the center.",pronounce:"convex"},
  plane:{definition:"Flat or nearly flat in profile, especially describing a mature pileus.",pronounce:"plane"},
  depressed:{definition:"Having a center lower than the surrounding pileus surface, but not necessarily deeply funnel-shaped.",pronounce:"depressed"},
  umbilicate:{definition:"Having a small, abrupt, navel-like central depression in the pileus.",pronounce:"umbilicate"},
  stipe:{definition:"The stem-like supporting structure of a fungal fruiting body.",pronounce:"stipe"},
  fibrillose:{definition:"Covered with fine thread-like fibrils or fibers; used for a surface whose texture is visibly fibrous rather than smooth.",pronounce:"FY-brill-ohs"},
  velvety:{definition:"Having a soft, very finely hairy or plush surface appearance resembling velvet.",pronounce:"VEL-vuh-tee"},
  bulbous:{definition:"Abruptly or conspicuously swollen at the base, producing a bulb-like enlargement of the stipe.",pronounce:"BUL-bus"},
  sessile:{definition:"Attached directly to the substrate without a differentiated stalk or stipe.",pronounce:"sessile"},
  lamellae:{definition:"Plate-like gills on the underside of a mushroom cap; singular: lamella.",pronounce:"lamellae"},
  lamella:{definition:"A single plate-like gill of a mushroom.",pronounce:"lamella"},
  adnate:{definition:"Gill attachment in which the lamellae meet the stipe broadly, with most of the gill depth attached directly to it.",pronounce:"adnate"},
  adnexed:{definition:"Gill attachment in which the lamellae meet the stipe narrowly, attaching by only a small portion of the gill edge.",pronounce:"adnexed"},
  decurrent:{definition:"Gill attachment in which the lamellae extend distinctly down the stipe below the point where the pileus meets it.",pronounce:"decurrent"},
  subdecurrent:{definition:"Gill attachment that runs only a short distance down the stipe; less strongly descending than fully decurrent gills.",pronounce:"subdecurrent"},
  sinuate:{definition:"Gill attachment with a smooth notch or inward curve immediately before the lamella meets the stipe.",pronounce:"sinuate"},
  emarginate:{definition:"Notched gill attachment in which the inner gill edge is distinctly indented immediately before reaching the stipe; often closely related in usage to sinuate.",pronounce:"emarginate"},
  seceding:{definition:"Gills that were attached to the stipe but separate from it during development or maturation, leaving a narrow gap.",pronounce:"seceding"},
  free_gills:{definition:"Gill attachment in which the lamellae terminate before reaching the stipe and remain completely unattached to it.",pronounce:"free gills"},
  context:{definition:"The internal flesh or sterile tissue of a fungal fruiting body.",pronounce:"context"},
  volva:{definition:"A cup-, sac-, or sheath-like universal-veil remnant at the base of a stipe.",pronounce:"volva"},
  annulus:{definition:"A ring-like remnant of the partial veil on the stipe.",pronounce:"annulus"},
  cortina:{definition:"A cobweb-like partial veil made of fine fibrils between the pileus margin and stipe.",pronounce:"cortina"},
  hymenium:{definition:"The fertile microscopic tissue layer where spore-producing cells such as basidia or asci occur.",pronounce:"hymenium"},
  basidium:{definition:"A microscopic spore-producing cell of Basidiomycota that typically bears basidiospores externally.",pronounce:"basidium"},
  basidiospore:{definition:"A sexual spore produced externally on a basidium.",pronounce:"basidiospore"},
  resupinate:{definition:"Growing flat against the substrate, with the fertile surface exposed outward.",pronounce:"resupinate"},
  reflexed:{definition:"Bent or turned back away from the substrate, often describing an edge or margin.",pronounce:"reflexed"},
  subglobose:{definition:"Almost spherical, but not perfectly round.",pronounce:"sub-GLOH-bohs"},
  lunate:{definition:"Crescent- or moon-shaped in outline. In microscopy this may describe an observed profile and should be interpreted with specimen orientation in mind.",pronounce:"LOO-nate"},
  crescentic:{definition:"Curved into a crescent-like outline. For spores, this may describe an observed projection rather than a fixed three-dimensional shape.",pronounce:"kreh-SEN-tik"},
  guttule:{definition:"A droplet-like inclusion visible inside a spore or cell.",pronounce:"guttule"},
  guttules:{definition:"Droplet-like inclusions visible inside spores or cells.",pronounce:"guttules"},
  hyaline:{definition:"Transparent, colorless, or nearly so; in mycology, describing spores, hyphae, or other structures that lack conspicuous pigmentation and transmit light readily.",pronounce:"hyaline"},
  provenance:{definition:"Documented origin, custody, and source history of a specimen, image, measurement, or record.",pronounce:"provenance"},
  accession:{definition:"A uniquely tracked specimen or collection record entered into an archive, herbarium, laboratory, or database.",pronounce:"accession"},
  puffball:{definition:"A gasteroid fungus in which spores mature internally and are released later, usually through an opening or by rupture of the outer wall.",pronounce:"PUHF-bawl"},
  gasteroid:{definition:"Describing fungi that produce spores internally rather than on an exposed hymenial surface like gills or pores.",pronounce:"gas-TER-oyd"},
  peridium:{definition:"The outer wall surrounding the spore-bearing interior of a puffball or related gasteroid fungus.",pronounce:"puh-RID-ee-um"},
  exoperidium:{definition:"The outermost layer of the peridium. It may be smooth, spiny, warted, granular, or scurfy.",pronounce:"ek-soh-puh-RID-ee-um"},
  endoperidium:{definition:"The inner layer of the peridium, often remaining after the outer layer wears away.",pronounce:"en-doh-puh-RID-ee-um"},
  gleba:{definition:"The internal spore-bearing tissue of gasteroid fungi. It is usually white when immature and darkens as spores mature.",pronounce:"GLEE-buh"},
  subgleba:{definition:"A non-spore-bearing basal region present in some puffballs, often supporting the fertile gleba above.",pronounce:"sub-GLEE-buh"},
  sterile_base:{definition:"A non-spore-bearing basal region present in some puffballs, often supporting the fertile gleba above.",pronounce:"STAIR-ile base"},
  ostiole:{definition:"A small opening, often at the top of the mature puffball, through which spores are released.",pronounce:"OSS-tee-ohl"},
  apical:{definition:"Located at the top or apex.",pronounce:"AY-pih-kul"},
  dehiscent:{definition:"Opening at maturity to release contents, such as spores.",pronounce:"dih-HISS-ent"},
  "rupture margin":{definition:"The exposed edge of a break or opening in the peridium; it may be clean, torn, ragged, curled, or frayed.",pronounce:"RUP-chur MAR-jin"},
  peridial:{definition:"Relating to the peridium, the enclosing wall of a puffball or other gasteroid fruiting body.",pronounce:"puh-RID-ee-ul"},
  "ostiolar channel":{definition:"A passage through the peridial wall that connects the glebal cavity or spore mass to an external ostiole.",pronounce:"OSS-tee-oh-lar channel"},
  dehiscence:{definition:"The process by which a mature structure opens to release its contents, such as spores.",pronounce:"dih-HISS-ens"},
  echinate:{definition:"Bearing sharp spines or prickles.",pronounce:"EK-in-ate"},
  verrucose:{definition:"Covered with wart-like projections.",pronounce:"veh-ROO-kose"},
  granular:{definition:"Covered with small grain-like particles or a rough granular texture.",pronounce:"GRAN-yuh-ler"},
  furfuraceous:{definition:"Scaly or bran-like, with a fine scurfy coating.",pronounce:"fer-fer-AY-shus"},
  glabrous:{definition:"Smooth; lacking hairs, spines, or ornamentation.",pronounce:"GLAY-brus"},
  globose:{definition:"Nearly spherical in shape.",pronounce:"GLOH-bohs"},
  pyriform:{definition:"Pear-shaped; broader above and narrower below.",pronounce:"PEER-ih-form"},
  turbiniform:{definition:"Spinning-top shaped; broad above and strongly tapered below.",pronounce:"turbiniform"},
});

const glossaryPattern=new RegExp("\\b("+Object.keys(GLOSSARY).sort((x,y)=>y.length-x.length).join("|")+")\\b","gi");

function glossaryText(value){
  const raw=String(value??"");
  let out="",last=0;
  raw.replace(glossaryPattern,(match,...args)=>{
    const offset=args[args.length-2];
    out+=esc(raw.slice(last,offset));
    const key=match.toLowerCase();
    out+='<button type="button" class="glossary-term" data-glossary="'+esc(key)+'" title="Define and pronounce '+esc(match)+'">'+esc(match)+'</button>';
    last=offset+match.length;
    return match;
  });
  out+=esc(raw.slice(last));
  return out;
}

function speakText(text,rate=.92){
  if(!("speechSynthesis" in window))return false;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(String(text||""));
  u.lang="en-US";u.rate=rate;u.pitch=1;
  speechSynthesis.speak(u);
  return true;
}

function sectionReadButton(label="Read back"){
  return '<button type="button" class="readback-btn" aria-label="'+esc(label)+'">🔊 '+esc(label)+'</button>';
}

function openGlossaryTerm(key,anchor){
  const item=GLOSSARY[String(key||"").toLowerCase()];
  if(!item)return;
  let pop=document.getElementById("glossaryPopover");
  if(!pop){pop=document.createElement("div");pop.id="glossaryPopover";pop.className="glossary-popover";document.body.appendChild(pop);}
  const term=String(key);
  pop.innerHTML='<div class="glossary-kicker">MYCOLOGY GLOSSARY</div><strong>'+esc(term)+'</strong><p>'+esc(item.definition)+'</p><div class="glossary-actions"><button type="button" data-glossary-pronounce>Pronounce</button><button type="button" data-glossary-read>Read definition</button><button type="button" data-glossary-close>Close</button></div>';
  const rect=anchor.getBoundingClientRect();
  pop.style.left=Math.min(window.innerWidth-330,Math.max(10,rect.left))+"px";
  pop.style.top=Math.min(window.innerHeight-190,Math.max(10,rect.bottom+8))+"px";
  pop.classList.add("open");
  pop.querySelector("[data-glossary-pronounce]").onclick=()=>speakText(item.pronounce||term,.82);
  pop.querySelector("[data-glossary-read]").onclick=()=>speakText(term+". "+item.definition,.92);
  pop.querySelector("[data-glossary-close]").onclick=()=>pop.classList.remove("open");
}
const $=id=>document.getElementById(id);
const FULL_DATA_SET_CODES=new Set(['AN2-F3','AN2-F7','AN2-F9','AN2-F25','AN2-F34','AN2-F38','AN2-F41','AN2-F36','AN2-F32','AN2-F17']);
let current=data[0]?.code||null,filter='',family='ALL',collection='ALL',imageType='ALL',workflow='ALL';
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const cls=v=>{v=String(v||'').toLowerCase();return v==='yes'?'yes':v==='no'?'no':'partial'};
const families=[...new Set(data.map(x=>x.family).filter(Boolean))];
const collections=[...new Set(data.map(x=>x.collection).filter(Boolean))];

function fullDataSetState(s){return FULL_DATA_SET_CODES.has(String(s.code||'').toUpperCase())?'FULL':'OTHER'}
function fullDataSets(){
  return data
    .filter(s=>FULL_DATA_SET_CODES.has(String(s.code||'').toUpperCase()))
    .sort((a,b)=>{
      const na=parseInt(String(a.code||'').match(/-F(\d+)/i)?.[1]||'999999',10);
      const nb=parseInt(String(b.code||'').match(/-F(\d+)/i)?.[1]||'999999',10);
      return na-nb;
    });
}
function filtered(){
  return data.filter(s=>
    (family==='ALL'||s.family===family)&&
    (collection==='ALL'||s.collection===collection)&&
    (workflow==='ALL'||fullDataSetState(s)===workflow)&&
    (!filter||
      String(s.code||'').toLowerCase().includes(filter)||
      String(s.site||'').toLowerCase().includes(filter)||
      Object.values(s.summary||{}).join(' ').toLowerCase().includes(filter))
  );
}
function fillFilters(){
  for(const id of ['familyFilter','mFamily']){
    $(id).innerHTML='<option value="ALL">All families</option>'+families.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    $(id).value=family;
  }
  for(const id of ['collectionFilter','mCollection']){
    $(id).innerHTML='<option value="ALL">All collections</option>'+collections.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    $(id).value=collection;
  }
  for(const id of ['workflowFilter','mWorkflow']){
    $(id).innerHTML='<option value="ALL">All record states</option><option value="FULL">Full data sets</option><option value="OTHER">Other / in progress</option>';
    $(id).value=workflow;
  }
}
function renderFullSetList(){
  const rows=fullDataSets();
  const html=rows.map(s=>`<button class="fullset-btn ${s.code===current?'active':''}" data-code="${esc(s.code)}"><span><strong>${esc(s.code)}</strong><small>${esc(s.collection)} · curated full-data view</small></span><b>OPEN</b></button>`).join('');
  for(const id of ['fullSetList','mobileFullSetList']){
    const host=$(id);
    if(!host)continue;
    host.innerHTML=html;
    host.querySelectorAll('.fullset-btn').forEach(b=>b.onclick=()=>setCurrent(b.dataset.code));
  }
}
function renderList(){
  const rows=filtered();
  $('specList').innerHTML=rows.map(s=>`<button class="spec-btn ${s.code===current?'active':''}" data-code="${esc(s.code)}"><strong>${esc(s.code)}</strong><small>${esc(s.collection)} · ${(s.images||[]).length} images${(s.movies||[]).length?` · ${(s.movies||[]).length} movies`:''}</small></button>`).join('');
  document.querySelectorAll('.spec-btn').forEach(b=>b.onclick=()=>setCurrent(b.dataset.code));
  $('mSpec').innerHTML=rows.map(s=>`<option value="${esc(s.code)}" ${s.code===current?'selected':''}>${esc(s.code)} — ${(s.images||[]).length} images${(s.movies||[]).length?` · ${(s.movies||[]).length} movies`:''}</option>`).join('');
  const archiveCount=Math.max(0,data.length-masterCount);
  $('resultCount').textContent=`${rows.length} of ${data.length} records · ${masterCount} master + ${archiveCount} Drive archive`;
  renderFullSetList();
}
function setCurrent(code){
  if(!data.some(x=>x.code===code))return;
  current=code;renderList();renderSpec();window.scrollTo({top:0,behavior:'smooth'});
}
function nav(delta){
  const rows=filtered();
  let i=rows.findIndex(x=>x.code===current);
  if(i<0)i=0;
  i=Math.max(0,Math.min(rows.length-1,i+delta));
  if(rows[i])setCurrent(rows[i].code);
}
function renderMeasurements(s){
  const rows=s.measurements||[];
  if(!rows.length)return '';
  const labels={
    cap_diameter_cm:'Cap diameter',
    stem_top_diameter_cm:'Stem top diameter',
    stem_middle_diameter_cm:'Stem middle diameter',
    stem_base_diameter_cm:'Stem base diameter',
    stem_height_cm:'Stem height',
    notes:'Notes',
    size_source_text:'Size — exact source text',
    cap_pileus_source_text:'Cap / pileus — exact source text',
    stem_stipe_source_text:'Stem / stipe — exact source text',
    microscopy_measurement_count:'Microscopy measurement count',
    microscopy_range_um:'Microscopy range',
    microscopy_mean_um:'Microscopy mean',
    microscopy_median_um:'Microscopy median',
    microscopy_sample_sd_um:'Microscopy sample SD',
    measured_fields:'Measured microscopy fields',
    measurement_values_um:'Validated measurement values',
    q_ratio:'Q ratio / paired dimensions'
  };
  return `<section class="section measurement-section"><h2>Measurements <span>${rows.length}</span></h2><div class="summary-grid">${rows.map((m,i)=>{
    const fields=Object.entries(m.fields||{}).map(([k,v])=>`<div class="summary-item readable-section"><div class="section-read-head"><h4>${esc(labels[k]||k)}</h4>${sectionReadButton("Read section")}</div><p>${glossaryText(v)}${k.endsWith('_cm')?' cm':''}</p></div>`).join('');
    return `<article class="card measurement-card"><div class="eyebrow">MEASUREMENT RECORD ${i+1}</div><h3>${esc(m.source_id||s.code)}</h3><p class="status">${esc(m.source||'Measurement source')}</p><div class="summary-grid">${fields}</div></article>`;
  }).join('')}</div></section>`;
}
function renderSpec(){
  const s=data.find(x=>x.code===current);
  if(!s)return;
  const groups={};
  (s.images||[]).filter(im=>imageType==='ALL'||im.category===imageType).forEach(im=>(groups[im.category]??=[]).push(im));
  const sum=Object.entries(s.summary||{}).map(([k,v])=>`<div class="summary-item readable-section"><div class="section-read-head"><h4>${esc(k)}</h4>${sectionReadButton("Read section")}</div><p>${glossaryText(v)}</p></div>`).join('');
  const cats=new Set((s.images||[]).map(im=>im.category));
  const hasWild=cats.has('Wild / field context');
  const hasLab=cats.has('Source macro / specimen');
  const hasSpore=cats.has('Spore print / preparation');
  const hasMicro=cats.has('Microscopy');
  const effectiveCompleteness=(s.completeness||[]).map(([k,v])=>{
    if(k==='Wild / field imagery') return [k,hasWild?'Yes':v];
    if(k==='Embedded/source imagery') return [k,hasLab?'Yes':v];
    if(k==='Spore-print imagery') return [k,hasSpore?'Yes':v];
    if(k==='Microscopy imagery') return [k,hasMicro?'Yes':v];
    return [k,v];
  });
  const mat=effectiveCompleteness.map(([k,v])=>`<div>${esc(k)}</div><div class="${cls(v)}">${esc(v)}</div>`).join('');
  const pairStatus=hasWild&&hasLab?'COMPLETE':(!hasWild&&!hasLab?'MISSING WILD + LAB':(!hasWild?'MISSING WILD':'MISSING LAB'));
  const pairClass=hasWild&&hasLab?'yes':'no';
  const galleries=Object.entries(groups).map(([cat,ims])=>`<section class="section"><h2>${esc(cat)} <span>${ims.length}</span></h2><div class="gallery">${ims.map(im=>`<article class="image-card"><div class="image-wrap" data-file="${esc(im.original)}" data-caption="${esc(im.caption)}" data-name="${esc(im.filename)}"><img loading="lazy" src="${esc(im.thumb)}" alt="${esc(im.caption)}"><span class="zoom-badge">Tap / click to inspect</span></div><div class="caption"><strong>${esc(im.caption)}</strong><code>${esc(im.filename)}</code>${im.driveSource?`<small class="drive-source">${esc(im.driveSource)}</small>`:''}</div></article>`).join('')}</div></section>`).join('');
  const movieRows=(s.movies||[]).filter(m=>imageType==='ALL'||imageType==='Movie / video');
  const movieGallery=movieRows.length?`<section class="section"><h2>Movie / video <span>${movieRows.length}</span></h2><div class="gallery">${movieRows.map(m=>`<article class="image-card movie-card"><div class="movie-wrap">${m.preview?`<iframe src="${esc(m.preview)}" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>`:`<img src="${esc(m.poster)}" alt="${esc(m.caption)}">`}</div><div class="caption"><strong>${esc(m.caption)}</strong><code>${esc(m.sourceFilename||m.filename)}</code>${m.durationSeconds?`<small class="drive-source">Duration: ${Math.round(m.durationSeconds)} seconds</small>`:''}${m.note?`<small class="drive-source">${esc(m.note)}</small>`:''}${m.driveView?`<a class="movie-link" href="${esc(m.driveView)}" target="_blank" rel="noopener">Open movie in Drive</a>`:''}</div></article>`).join('')}</div></section>`:'';
  const fullBadge=FULL_DATA_SET_CODES.has(String(s.code||'').toUpperCase())?'<span class="fullset-badge">FULL DATA SET</span>':'';
  const eyebrow=s.archiveIndex?`MASTER RECORD ${s.archiveIndex} / ${masterCount}`:'DRIVE ARCHIVE';
  $('main').innerHTML=`<div class="spec-head"><div><div class="eyebrow">${eyebrow} ${fullBadge}</div><h1>${esc(s.code)}</h1><div class="record-status readable-section"><p class="status">${glossaryText(s.status)}</p>${sectionReadButton("Read overview")}</div></div><div class="navBtns"><button onclick="nav(-1)">← Previous</button><button onclick="nav(1)">Next →</button></div></div><div class="hero"><div class="summary-grid">${sum}</div><aside class="card readable-section"><div class="section-read-head"><h3>Data completeness</h3>${sectionReadButton("Read section")}</div><div class="matrix"><div>Wild + lab pairing</div><div class="${pairClass}">${pairStatus}</div>${mat}</div>${s.sourceLine?`<div class="sourceLine readable-section"><div class="section-read-head"><strong>Source / provenance</strong>${sectionReadButton("Read section")}</div><p>${glossaryText(s.sourceLine)}</p></div>`:''}</aside></div>${renderMeasurements(s)}${galleries||''}${movieGallery||''}${(!galleries&&!movieGallery)?'<div class="empty">No media match the selected filter.</div>':''}`;
  $('recordCount').textContent=`${(s.images||[]).length} source images${(s.movies||[]).length?` · ${(s.movies||[]).length} movies`:''} · ${esc(s.collection)} · ${esc(s.family)}`;
  document.querySelectorAll('.image-wrap').forEach(el=>el.onclick=()=>openViewer(el.dataset.file,el.dataset.caption,el.dataset.name));
}

$('main').onclick=e=>{
  const glossary=e.target.closest('.glossary-term');
  if(glossary){
    e.preventDefault();e.stopPropagation();
    openGlossaryTerm(glossary.dataset.glossary,glossary);
    return;
  }
  const read=e.target.closest('.readback-btn');
  if(read){
    e.preventDefault();e.stopPropagation();
    const section=read.closest('.readable-section');
    if(!section)return;
    const clone=section.cloneNode(true);
    clone.querySelectorAll('.readback-btn,.glossary-actions').forEach(x=>x.remove());
    speakText(clone.textContent.replace(/\s+/g,' ').trim());
  }
};
function syncSearch(v){
  filter=String(v||'').toLowerCase();$('search').value=v;$('mSearch').value=v;
  const rows=filtered();
  if(rows.length&&!rows.some(x=>x.code===current)){current=rows[0].code;renderSpec()}
  renderList();
}
['familyFilter','mFamily'].forEach(id=>$(id).onchange=e=>{
  family=e.target.value;$('familyFilter').value=family;$('mFamily').value=family;
  const rows=filtered();if(rows[0]&&!rows.some(x=>x.code===current))current=rows[0].code;
  renderList();renderSpec();
});
['collectionFilter','mCollection'].forEach(id=>$(id).onchange=e=>{
  collection=e.target.value;$('collectionFilter').value=collection;$('mCollection').value=collection;
  const rows=filtered();if(rows[0]&&!rows.some(x=>x.code===current))current=rows[0].code;
  renderList();renderSpec();
});
['workflowFilter','mWorkflow'].forEach(id=>$(id).onchange=e=>{
  workflow=e.target.value;$('workflowFilter').value=workflow;$('mWorkflow').value=workflow;
  const rows=filtered();if(rows[0]&&!rows.some(x=>x.code===current))current=rows[0].code;
  renderList();renderSpec();
});
$('imageFilter').onchange=e=>{imageType=e.target.value;renderSpec()};
$('mImage').onchange=e=>{imageType=e.target.value;$('imageFilter').value=imageType;renderSpec()};
$('search').oninput=e=>syncSearch(e.target.value);
$('mSearch').oninput=e=>syncSearch(e.target.value);
$('mSpec').onchange=e=>setCurrent(e.target.value);

let scale=1,tx=0,ty=0,active=new Map(),pinchDist=0,pinchScale=1;
const viewer=$('viewer'),img=$('viewerImg'),stage=$('viewerStage');
function apply(){img.style.transform=`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(${scale})`}
function clamp(v){return Math.max(.05,Math.min(20,v))}
function fit(){tx=ty=0;requestAnimationFrame(()=>{if(!img.naturalWidth)return;scale=Math.min(stage.clientWidth/img.naturalWidth,stage.clientHeight/img.naturalHeight,.98);apply()})}
function openViewer(src,cap,name){
  $('viewerCap').textContent=cap;$('viewerName').textContent=name;$('openOriginal').onclick=()=>window.open(src,'_blank');
  img.onload=fit;img.src=src;viewer.classList.add('open');document.body.style.overflow='hidden';
}
function closeViewer(){viewer.classList.remove('open');img.src='';active.clear();document.body.style.overflow=''}
$('closeViewer').onclick=closeViewer;$('fit').onclick=fit;$('oneToOne').onclick=()=>{scale=1;tx=ty=0;apply()};
$('zoomIn').onclick=()=>{scale=clamp(scale*1.25);apply()};$('zoomOut').onclick=()=>{scale=clamp(scale/1.25);apply()};
stage.onwheel=e=>{e.preventDefault();scale=clamp(scale*(e.deltaY<0?1.12:.89));apply()};
stage.ondblclick=fit;
stage.onpointerdown=e=>{stage.setPointerCapture?.(e.pointerId);active.set(e.pointerId,{x:e.clientX,y:e.clientY});if(active.size===2){const p=[...active.values()];pinchDist=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);pinchScale=scale}};
stage.onpointermove=e=>{if(!active.has(e.pointerId))return;const old=active.get(e.pointerId);active.set(e.pointerId,{x:e.clientX,y:e.clientY});if(active.size===2){const p=[...active.values()];const d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pinchDist)scale=clamp(pinchScale*d/pinchDist)}else{tx+=e.clientX-old.x;ty+=e.clientY-old.y}apply()};
const end=e=>active.delete(e.pointerId);stage.onpointerup=end;stage.onpointercancel=end;
window.onkeydown=e=>{if(e.key==='Escape')closeViewer()};
window.onresize=()=>viewer.classList.contains('open')&&fit();

fillFilters();renderList();renderSpec();


/* Optional MycoScope Hyphae Run entry experience */
(function initEntryExperience(){
  const gate=$('entryGate');
  if(!gate) return;
  const enter=()=>{
    gate.classList.add('hidden');
    document.body.style.overflow=window.matchMedia('(max-width: 900px)').matches?'auto':'hidden';
  };
  $('gateCount').textContent=` · ${data.length} RECORDS`;
  $('enterAtlas').onclick=enter;
  $('skipGame').onclick=enter;

  const game=$('hyphaeGame');
  const canvas=$('hyphaeCanvas');
  const ctx=canvas?.getContext('2d');
  const overlay=$('hyphaeOverlay');
  const scoreEl=$('hyphaeScore'),growthEl=$('hyphaeGrowth'),livesEl=$('hyphaeLives');

  let running=false,raf=0,last=0,score=0,lives=3,growth=0;
  let pointer=null;
  let player={x:canvas.width/2,y:canvas.height/2,r:9,speed:175};
  let trail=[],nutrients=[],hazards=[],water=[],spawnClock=0;

  function rand(min,max){return Math.random()*(max-min)+min}
  function reset(){
    cancelAnimationFrame(raf);
    running=false;last=0;score=0;lives=3;growth=0;spawnClock=0;
    player={x:canvas.width/2,y:canvas.height/2,r:9,speed:175};
    trail=[{x:player.x,y:player.y,w:2,life:1}];
    nutrients=[];hazards=[];water=[];
    for(let i=0;i<7;i++) spawnNutrient();
    for(let i=0;i<4;i++) spawnHazard();
    for(let i=0;i<2;i++) spawnWater();
    updateHud();draw();
    overlay.classList.remove('hidden');
    overlay.innerHTML='<strong>Grow a living mycelial network</strong><span>Collect amber nutrients, chain hyphae, and dodge green contamination.</span><button id="startHyphae" type="button">Start Game</button>';
    $('startHyphae').onclick=start;
  }
  function updateHud(){
    scoreEl.textContent=score;
    growthEl.textContent=Math.min(100,Math.round(growth))+'%';
    livesEl.textContent=lives;
  }
  function spawnNutrient(){nutrients.push({x:rand(24,canvas.width-24),y:rand(24,canvas.height-24),r:rand(5,9),pulse:rand(0,Math.PI*2)})}
  function spawnHazard(){hazards.push({x:rand(28,canvas.width-28),y:rand(28,canvas.height-28),r:rand(10,17),vx:rand(-28,28),vy:rand(-28,28)})}
  function spawnWater(){water.push({x:rand(28,canvas.width-28),y:rand(28,canvas.height-28),r:8})}
  function start(){
    if(running)return;
    overlay.classList.add('hidden');
    running=true;last=performance.now();
    raf=requestAnimationFrame(loop);
  }
  function endGame(){
    running=false;cancelAnimationFrame(raf);
    overlay.classList.remove('hidden');
    overlay.innerHTML=`<strong>Colony collapsed</strong><span>Final score: ${score} · Network growth: ${Math.round(growth)}%</span><button id="startHyphae" type="button">Grow Again</button>`;
    $('startHyphae').onclick=()=>{reset();start()};
  }
  const keys=new Set();
  window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){keys.add(e.key.toLowerCase());if(running)e.preventDefault()}});
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));

  function canvasPoint(e){
    const r=canvas.getBoundingClientRect();
    return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height};
  }
  canvas.addEventListener('pointerdown',e=>{pointer=canvasPoint(e);canvas.setPointerCapture?.(e.pointerId)});
  canvas.addEventListener('pointermove',e=>{if(pointer)pointer=canvasPoint(e)});
  canvas.addEventListener('pointerup',()=>pointer=null);
  canvas.addEventListener('pointercancel',()=>pointer=null);

  function hit(a,b,extra=0){return Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r+extra}
  function update(dt){
    let dx=0,dy=0;
    if(keys.has('arrowleft')||keys.has('a'))dx-=1;
    if(keys.has('arrowright')||keys.has('d'))dx+=1;
    if(keys.has('arrowup')||keys.has('w'))dy-=1;
    if(keys.has('arrowdown')||keys.has('s'))dy+=1;
    if(pointer){dx=pointer.x-player.x;dy=pointer.y-player.y}
    const mag=Math.hypot(dx,dy)||1;
    if(dx||dy){player.x+=dx/mag*player.speed*dt;player.y+=dy/mag*player.speed*dt}
    player.x=Math.max(player.r,Math.min(canvas.width-player.r,player.x));
    player.y=Math.max(player.r,Math.min(canvas.height-player.r,player.y));
    trail.push({x:player.x,y:player.y,w:Math.min(7,2+growth/22),life:1});
    if(trail.length>900)trail.shift();

    for(const h of hazards){
      h.x+=h.vx*dt;h.y+=h.vy*dt;
      if(h.x<h.r||h.x>canvas.width-h.r)h.vx*=-1;
      if(h.y<h.r||h.y>canvas.height-h.r)h.vy*=-1;
    }

    for(let i=nutrients.length-1;i>=0;i--){
      if(hit(player,nutrients[i],2)){
        nutrients.splice(i,1);score+=10;growth=Math.min(100,growth+4);spawnNutrient();
      }
    }
    for(let i=water.length-1;i>=0;i--){
      if(hit(player,water[i],2)){
        water.splice(i,1);score+=5;growth=Math.min(100,growth+2);player.speed=Math.min(245,player.speed+8);spawnWater();
      }
    }
    for(const h of hazards){
      if(hit(player,h,-2)){
        lives--;growth=Math.max(0,growth-10);player.x=canvas.width/2;player.y=canvas.height/2;
        h.x=rand(28,canvas.width-28);h.y=rand(28,canvas.height-28);
        updateHud();
        if(lives<=0){endGame();return}
      }
    }

    spawnClock+=dt;
    if(spawnClock>6){spawnClock=0;if(hazards.length<10)spawnHazard()}
    score+=dt>0?0:0;
    updateHud();
  }
  function branch(x1,y1,x2,y2,alpha,w){
    ctx.strokeStyle=`rgba(226,239,225,${alpha})`;ctx.lineWidth=w;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#07100b';ctx.fillRect(0,0,canvas.width,canvas.height);

    for(let i=1;i<trail.length;i++){
      const a=trail[i-1],b=trail[i];
      const alpha=Math.max(.08,i/trail.length*.42);
      branch(a.x,a.y,b.x,b.y,alpha,b.w||2);
      if(i%17===0){
        const ang=Math.atan2(b.y-a.y,b.x-a.x)+(Math.random()>.5?1:-1)*rand(.5,1.1);
        const len=rand(6,18);
        branch(b.x,b.y,b.x+Math.cos(ang)*len,b.y+Math.sin(ang)*len,alpha*.65,1);
      }
    }

    for(const n of nutrients){
      n.pulse+=.05;const rr=n.r+Math.sin(n.pulse)*1.2;
      ctx.fillStyle='#d7a84a';ctx.beginPath();ctx.arc(n.x,n.y,rr,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(255,226,153,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(n.x,n.y,rr+5,0,Math.PI*2);ctx.stroke();
    }
    for(const w of water){
      ctx.fillStyle='#79b8d3';ctx.beginPath();ctx.arc(w.x,w.y,w.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(170,221,244,.4)';ctx.beginPath();ctx.arc(w.x,w.y,w.r+5,0,Math.PI*2);ctx.stroke();
    }
    for(const h of hazards){
      ctx.fillStyle='#4f7d48';ctx.beginPath();ctx.arc(h.x,h.y,h.r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(127,186,110,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(h.x,h.y,h.r+4,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<5;i++){const a=i*Math.PI*2/5;branch(h.x,h.y,h.x+Math.cos(a)*(h.r+7),h.y+Math.sin(a)*(h.r+7),.28,1)}
    }
    ctx.fillStyle='#f2eee0';ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(242,238,224,.18)';ctx.beginPath();ctx.arc(player.x,player.y,player.r+9,0,Math.PI*2);ctx.fill();
  }
  function loop(t){
    if(!running)return;
    const dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();
    if(running)raf=requestAnimationFrame(loop);
  }

  $('playHyphaeRun').onclick=()=>{
    game.hidden=false;
    $('playHyphaeRun').disabled=true;
    $('playHyphaeRun').textContent='Hyphae Run Active';
    reset();
    game.scrollIntoView({behavior:'smooth',block:'nearest'});
  };
  $('restartHyphae').onclick=()=>{reset();start()};
})();