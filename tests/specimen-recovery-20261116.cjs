const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const bn=JSON.parse(fs.readFileSync(path.join(root,'research/recovered/bn5_sporeprint_photograph_intake_20261115.json'),'utf8'));
assert.equal(bn.files.length,7,'preserve seven BN5 intake manifest entries');
assert.equal(new Set(bn.files.map(f=>f.planned_path)).size,7,'distinct paths');
for(const f of bn.files){
 assert.match(f.sha256,/^[0-9a-f]{64}$/,'SHA256 reference must be complete');
 assert.ok(!fs.existsSync(path.join(root,f.planned_path)),'manifest source image unexpectedly exists; reconcile before publishing');
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
   const page=await browser.newPage({viewport});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/index.html#AN2-F10',{waitUntil:'domcontentloaded'});
   await page.locator('#specList .spec-btn').first().waitFor({state:'attached'});
   await page.evaluate(()=>window.setCurrent('AN2-F10'));
   let t=await page.locator('#main').innerText();
   assert.match(t,/Fourteen accession-labelled microscope PNGs/);
   assert.match(t,/2.34.*12.57/,'retain source preliminary annotation range');
   assert.match(t,/mature basidiospores remains unverified/);
   assert.match(t,/HOLD/);
   assert.equal(await page.locator('#main img[src*="an2-f10/microscopy"]').count(),0,'never create broken AN2-F10 image links');
   await page.evaluate(()=>window.setCurrent('AN2-F12'));
   t=await page.locator('#main').innerText();
   assert.match(t,/Fourteen original microscopy PNGs/,'AN2-F12 latest microscopy enrichment preserved');
   for(const name of ['IMG_6021.jpg','IMG_6022.jpg','IMG_6023.jpg','IMG_6024.jpg'])
     assert.ok(await page.locator('#main img[src*="'+name+'"]').count(),name+' should remain on AN2-F12');
   await page.evaluate(()=>window.setCurrent('AN2-F18'));
   t=await page.locator('#main').innerText();
   assert.match(t,/Unsuccessful spore-isolation attempt/,'AN2-F18 scientific hold retained');
   assert.equal(await page.locator('#main img[src*="an2-f18/microscopy"]').count(),0,'no unpublished AN2-F18 binaries referenced');
   assert.equal(errors.length,0,'page JS errors: '+errors.join('; '));
   console.log('PASS '+viewport.width+'px AN2-F10 research note; AN2-F12 4 originals + 14 microscopy; AN2-F18 intact; no broken F10/F18 image refs');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1)});
