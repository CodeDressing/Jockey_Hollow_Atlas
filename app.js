
const data = window.ATLAS_DATA || [];
const byId=id=>document.getElementById(id);
let current=data[0]?.code || null; let filter='';
function cls(v){v=(v||'').toLowerCase(); if(v==='yes')return'yes'; if(v==='no')return'no'; return'partial'}
function renderSidebar(){const el=byId('specList');el.innerHTML='';data.filter(s=>!filter||s.code.toLowerCase().includes(filter)||s.site.toLowerCase().includes(filter)).forEach(s=>{const b=document.createElement('button');b.className='spec-btn'+(s.code===current?' active':'');b.innerHTML=`<strong>${s.code}</strong><small>${s.site} · ${s.images.length} images</small>`;b.onclick=()=>{current=s.code;renderSidebar();renderSpec();byId('content').scrollTo(0,0)};el.appendChild(b)})}
function renderSpec(){const s=data.find(x=>x.code===current);if(!s)return;let groups={};s.images.forEach(im=>(groups[im.category]??=[]).push(im));
let sum=Object.entries(s.summary).map(([k,v])=>`<div class="summary-item"><h4>${k}</h4><p>${v}</p></div>`).join('');
let mat=s.completeness.map(([k,v])=>`<div>${k}</div><div class="${cls(v)}">${v}</div>`).join('');
let gallery=Object.entries(groups).map(([cat,imgs])=>`<section class="section"><h2>${cat}</h2><div class="gallery">${imgs.map((im,i)=>im.missing?`<div class="empty">Missing source: ${im.filename}</div>`:`<article class="image-card"><div class="image-wrap" data-file="${im.original}" data-caption="${escapeAttr(im.caption)}" data-name="${escapeAttr(im.filename)}"><img loading="lazy" src="${im.thumb}" alt="${escapeAttr(im.caption)}"><span class="zoom-badge">Click to inspect / zoom</span></div><div class="caption"><strong>${im.caption}</strong><code>${im.filename}</code></div></article>`).join('')}</div></section>`).join('');
byId('main').innerHTML=`<div class="hero"><div><h1 class="title">${s.code}</h1><div class="status">${s.status}</div><div class="summary-grid">${sum}</div></div><aside class="card"><h3 style="margin-top:0">Data completeness</h3><div class="matrix">${mat}</div></aside></div>${gallery}`;
byId('recordCount').textContent=`${s.images.length} source images in this dossier`;
document.querySelectorAll('.image-wrap').forEach(el=>el.addEventListener('click',()=>openViewer(el.dataset.file,el.dataset.caption,el.dataset.name)));
}
function escapeAttr(s){return String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
byId('search').addEventListener('input',e=>{filter=e.target.value.toLowerCase();renderSidebar()});

let scale=1,tx=0,ty=0,drag=false,lastX=0,lastY=0;const viewer=byId('viewer'),vimg=byId('viewerImg'),stage=byId('viewerStage');
function apply(){vimg.style.transform=`translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`}
function fit(){scale=1;tx=0;ty=0;requestAnimationFrame(()=>{const sw=stage.clientWidth,sh=stage.clientHeight,iw=vimg.naturalWidth,ih=vimg.naturalHeight;if(!iw||!ih)return;scale=Math.min(sw/iw,sh/ih,.98);apply()})}
function openViewer(src,cap,name){byId('viewerCap').textContent=cap;byId('viewerName').textContent=name;byId('openOriginal').onclick=()=>window.open(src,'_blank');vimg.onload=fit;vimg.src=src;viewer.classList.add('open');document.body.style.overflow='hidden'}
function closeViewer(){viewer.classList.remove('open');vimg.src='';document.body.style.overflow=''}
byId('closeViewer').onclick=closeViewer;byId('zoomIn').onclick=()=>{scale*=1.25;apply()};byId('zoomOut').onclick=()=>{scale/=1.25;apply()};byId('fit').onclick=fit;byId('oneToOne').onclick=()=>{scale=1;tx=0;ty=0;apply()};
stage.addEventListener('wheel',e=>{e.preventDefault();const factor=e.deltaY<0?1.12:.89;scale=Math.max(.05,Math.min(20,scale*factor));apply()},{passive:false});
stage.addEventListener('mousedown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;stage.classList.add('dragging')});window.addEventListener('mousemove',e=>{if(!drag)return;tx+=e.clientX-lastX;ty+=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;apply()});window.addEventListener('mouseup',()=>{drag=false;stage.classList.remove('dragging')});
stage.addEventListener('dblclick',fit);window.addEventListener('keydown',e=>{if(e.key==='Escape')closeViewer();if(!viewer.classList.contains('open'))return;if(e.key==='+'){scale*=1.25;apply()}if(e.key==='-'){scale/=1.25;apply()}if(e.key==='0')fit()});
renderSidebar();renderSpec();
