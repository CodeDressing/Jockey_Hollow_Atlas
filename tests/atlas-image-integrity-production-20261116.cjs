const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {webkit,chromium,devices}=require('playwright');
const root=path.resolve(__dirname,'..');
const base='https://jockey-hollow-atlas.onrender.com/';
const checks=[
 'assets/originals/JN2-F3SPMV1.png',
 'assets/thumbs/JN2-F3SPMV1.jpg',
 'assets/an2-f12/IMG_6021.jpg',
 'assets/an2-f12/microscopy/AN2-F12 SPORE PRINT MICROSCOPE  (1).png',
 'assets/originals/bn5-f8(b)v2.jpg',
 'assets/JN1-F11  (8)feild .jpg',
 'assets/JN1-F11 (1).png'
];
const mimeOk=(type,filepath)=>/image\/(jpeg|png|webp|gif)/i.test(type)&&
 (/\.png$/i.test(filepath)?/image\/png/.test(type):/image\/jpeg/.test(type));
async function checkHttp(url,filepath) {
 const res=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'Cache-Control':'no-cache'}});
 const bytes=Buffer.from(await res.arrayBuffer());
 const type=res.headers.get('content-type')||'';
 console.log('HTTP',res.status,bytes.length,type,url);
 assert.equal(res.status,200,'HTTP asset failure '+url);
 assert.ok(mimeOk(type,filepath),'invalid image mime '+filepath+': '+type);
 assert.ok(bytes.length>1500,'empty/truncated image '+filepath);
 assert.ok(/\.png$/i.test(filepath)?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes[0]===255&&bytes[1]===216,'invalid binary image magic '+filepath);
}
(async()=>{
 const sandbox={window:{},console};vm.createContext(sandbox);
 vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),sandbox,{timeout:15000});
 const known=sandbox.window.ATLAS_DATA||[];
 const paths=[];
 for(const record of known)for(const im of record.images||[])for(const p of [im.original,im.thumb])if(p)paths.push(p);
 const files=new Set();
 const recursive=(folder)=>{for(const e of fs.readdirSync(folder,{withFileTypes:true})){const p=path.join(folder,e.name);if(e.isDirectory())recursive(p);else files.add(path.relative(root,p).replace(/\\/g,'/'));}};
 recursive(path.join(root,'assets'));
 const missing=[...new Set(paths)].filter(p=>!files.has(decodeURIComponent(p)));
 assert.deepEqual(missing,['assets/thumbs/bn5-f8(b)v2.jpg'],'Only documented historical master-data thumbnail is missing (corrected at runtime)');
 const originals=paths.filter(p=>p.includes('/originals/'));
 assert.ok(originals.length>500,'must scan entire master reference list');
 for(const filepath of checks){
  assert.ok(files.has(filepath),'original must exist in Git tree '+filepath);
  await checkHttp('http://127.0.0.1:8765/'+filepath.split('/').map(encodeURIComponent).join('/'),filepath);
  await checkHttp(base+filepath.split('/').map(encodeURIComponent).join('/'),filepath);
 }
 console.log('PASS Git master media references audited; '+new Set(paths).size+' unique paths, '+missing.length+' historic missing thumbnail, repaired at runtime');
 for(const [name,engine,opts] of [
  ['WebKit iPhone17 402',webkit,{...devices['iPhone 13'],viewport:{width:402,height:874}}],
  ['WebKit iPhone17 wide 440',webkit,{...devices['iPhone 13'],viewport:{width:440,height:956}}],
  ['Chromium desktop',chromium,{viewport:{width:1280,height:900}}]
 ]){
  const browser=await engine.launch({headless:true});
  try{
   const ctx=await browser.newContext(opts),page=await ctx.newPage();
   const errors=[];page.on('pageerror',err=>errors.push(err.message));
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
   await page.locator('#enterAtlas').click();
   for(const id of ['JN2-F3','AN2-F12','BN5-F8(B)','JN1-F11']){
    await page.evaluate(id=>{window.setCurrent(id);},id);
    const thumbs=page.locator('.image-wrap img');
    assert.ok(await thumbs.count()>0,id+' has images');
    const first=thumbs.first();await first.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>{const img=document.querySelector('.image-wrap img');return img&&img.complete&&img.naturalWidth>0;},null,{timeout:20000});
    assert.ok(await first.evaluate(im=>im.naturalWidth>0),id+' thumbnail decoded');
    if(name.startsWith('WebKit')){
     assert.equal(await page.locator('.sidebar').isVisible(),false,'iPhone sidebar hidden');
     assert.ok((await page.locator('.gallery').first().boundingBox()).width>300,'iPhone gallery full-width');
     assert.equal(await first.getAttribute('loading'),'eager','iPhone thumbnails must be eager');
    }
    if(id==='BN5-F8(B)'){
     const p=page.locator('.image-wrap[data-name="bn5-f8(b)v2.jpg"] img');
     assert.equal(await p.count(),1);
     assert.ok((await p.getAttribute('src')).includes('assets/originals/bn5-f8(b)v2.jpg'));
    }
    await first.click();await page.waitForFunction(()=>{const im=document.getElementById('viewerImg');return im&&im.complete&&im.naturalWidth>0;},null,{timeout:20000});
    assert.ok(await page.locator('#viewerImg').evaluate(el=>el.naturalWidth>0),id+' full image decode');
    await page.locator('#closeViewer').click();
   }
   assert.deepEqual(errors,[],'JS errors');
   console.log('PASS '+name+' gallery decode, full image viewer, initial entrance and 4 accession paths');
   await ctx.close();
  }finally{await browser.close();}
 }
})().catch(e=>{console.error(e.stack);process.exit(1)});
