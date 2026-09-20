const masterData=window.ATLAS_DATA||[];
const drivePhotos=window.DRIVE_PHOTOS||[];
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

const $=id=>document.getElementById(id);
let current=data[0]?.code||null,filter='',family='ALL',collection='ALL',imageType='ALL';
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const cls=v=>{v=String(v||'').toLowerCase();return v==='yes'?'yes':v==='no'?'no':'partial'};
const families=[...new Set(data.map(x=>x.family).filter(Boolean))];
const collections=[...new Set(data.map(x=>x.collection).filter(Boolean))];

function filtered(){
  return data.filter(s=>
    (family==='ALL'||s.family===family)&&
    (collection==='ALL'||s.collection===collection)&&
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
}
function renderList(){
  const rows=filtered();
  $('specList').innerHTML=rows.map(s=>`<button class="spec-btn ${s.code===current?'active':''}" data-code="${esc(s.code)}"><strong>${esc(s.code)}</strong><small>${esc(s.collection)} · ${(s.images||[]).length} images</small></button>`).join('');
  document.querySelectorAll('.spec-btn').forEach(b=>b.onclick=()=>setCurrent(b.dataset.code));
  $('mSpec').innerHTML=rows.map(s=>`<option value="${esc(s.code)}" ${s.code===current?'selected':''}>${esc(s.code)} — ${(s.images||[]).length} images</option>`).join('');
  const archiveCount=Math.max(0,data.length-masterCount);
  $('resultCount').textContent=`${rows.length} of ${data.length} records · ${masterCount} master + ${archiveCount} Drive archive`;
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
function renderSpec(){
  const s=data.find(x=>x.code===current);
  if(!s)return;
  const groups={};
  (s.images||[]).filter(im=>imageType==='ALL'||im.category===imageType).forEach(im=>(groups[im.category]??=[]).push(im));
  const sum=Object.entries(s.summary||{}).map(([k,v])=>`<div class="summary-item"><h4>${esc(k)}</h4><p>${esc(v)}</p></div>`).join('');
  const mat=(s.completeness||[]).map(([k,v])=>`<div>${esc(k)}</div><div class="${cls(v)}">${esc(v)}</div>`).join('');
  const galleries=Object.entries(groups).map(([cat,ims])=>`<section class="section"><h2>${esc(cat)} <span>${ims.length}</span></h2><div class="gallery">${ims.map(im=>`<article class="image-card"><div class="image-wrap" data-file="${esc(im.original)}" data-caption="${esc(im.caption)}" data-name="${esc(im.filename)}"><img loading="lazy" src="${esc(im.thumb)}" alt="${esc(im.caption)}"><span class="zoom-badge">Tap / click to inspect</span></div><div class="caption"><strong>${esc(im.caption)}</strong><code>${esc(im.filename)}</code>${im.driveSource?`<small class="drive-source">${esc(im.driveSource)}</small>`:''}</div></article>`).join('')}</div></section>`).join('');
  const eyebrow=s.archiveIndex?`MASTER RECORD ${s.archiveIndex} / ${masterCount}`:'DRIVE ARCHIVE';
  $('main').innerHTML=`<div class="spec-head"><div><div class="eyebrow">${eyebrow}</div><h1>${esc(s.code)}</h1><p class="status">${esc(s.status)}</p></div><div class="navBtns"><button onclick="nav(-1)">← Previous</button><button onclick="nav(1)">Next →</button></div></div><div class="hero"><div class="summary-grid">${sum}</div><aside class="card"><h3>Data completeness</h3><div class="matrix">${mat}</div>${s.sourceLine?`<div class="sourceLine"><strong>Source / provenance</strong><p>${esc(s.sourceLine)}</p></div>`:''}</aside></div>${galleries||'<div class="empty">No images match the selected image filter.</div>'}`;
  $('recordCount').textContent=`${(s.images||[]).length} source images · ${esc(s.collection)} · ${esc(s.family)}`;
  document.querySelectorAll('.image-wrap').forEach(el=>el.onclick=()=>openViewer(el.dataset.file,el.dataset.caption,el.dataset.name));
}
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
