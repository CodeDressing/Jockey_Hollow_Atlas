/* Self-contained sidebar controls. Existing search/filter/navigation DOM stays mounted. */
(function(){
  'use strict';
  const app=document.querySelector('.app'), sidebar=app?.querySelector('.sidebar');
  if(!app||!sidebar||app.classList.contains('sidebar-ready'))return;
  const key='mycoscope.sidebar.v1';
  const maxWidth=()=>Math.max(170,Math.min(520,window.innerWidth-260));
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){}
  const defaultWidth=()=>Math.min(window.innerWidth<=680?190:window.innerWidth<=900?250:310,maxWidth());
  let width=Number.isFinite(saved.width)?Math.max(170,Math.min(maxWidth(),saved.width)):defaultWidth();
  let collapsed=!!saved.collapsed;
  const toolbar=document.createElement('div');toolbar.className='sidebar-toolbar';
  const toggle=document.createElement('button');toggle.type='button';toggle.className='sidebar-toggle';
  toolbar.appendChild(toggle);sidebar.prepend(toolbar);
  const handle=document.createElement('div');handle.className='sidebar-resize';handle.tabIndex=0;
  handle.setAttribute('role','separator');handle.setAttribute('aria-label','Resize MycoScope sidebar');
  handle.setAttribute('aria-orientation','vertical');handle.setAttribute('aria-valuemin','170');
  handle.setAttribute('aria-valuemax',String(maxWidth()));app.appendChild(handle);
  function save(){try{localStorage.setItem(key,JSON.stringify({width,collapsed}))}catch(_){}}
  function render(){
    app.style.setProperty('--sidebar-width',width+'px');
    app.classList.toggle('is-collapsed',collapsed);
    toggle.textContent=collapsed?'☰':'◀';
    toggle.setAttribute('aria-label',collapsed?'Expand MycoScope sidebar':'Collapse MycoScope sidebar');
    toggle.setAttribute('title',collapsed?'Expand sidebar':'Collapse sidebar');
    toggle.setAttribute('aria-expanded',String(!collapsed));
    handle.setAttribute('aria-valuenow',String(width));
    handle.setAttribute('aria-valuemax',String(maxWidth()));
  }
  toggle.addEventListener('click',()=>{collapsed=!collapsed;render();save()});
  let pointer=null;
  handle.addEventListener('pointerdown',e=>{
    if(collapsed||e.button!==0)return;
    pointer=e.pointerId;handle.setPointerCapture(pointer);
    handle.classList.add('is-dragging');app.classList.add('is-resizing');e.preventDefault();
  });
  handle.addEventListener('pointermove',e=>{
    if(e.pointerId!==pointer)return;
    width=Math.max(170,Math.min(maxWidth(),Math.round(e.clientX-app.getBoundingClientRect().left)));
    render();
  });
  function stop(e){if(e.pointerId!==pointer)return;pointer=null;handle.classList.remove('is-dragging');app.classList.remove('is-resizing');save()}
  handle.addEventListener('pointerup',stop);handle.addEventListener('pointercancel',stop);
  handle.addEventListener('keydown',e=>{
    if(collapsed)return;
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();width=Math.max(170,Math.min(maxWidth(),width+(e.key==='ArrowRight'?20:-20)));render();save()}
    if(e.key==='Home'){e.preventDefault();width=170;render();save()}
    if(e.key==='End'){e.preventDefault();width=maxWidth();render();save()}
  });
  window.addEventListener('resize',()=>{width=Math.min(width,maxWidth());render()});
  app.classList.add('sidebar-ready');render();
})();
