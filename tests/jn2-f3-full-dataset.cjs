const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
   const page=await browser.newPage({viewport});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/index.html#JN2-F3',{waitUntil:'domcontentloaded'});
   await page.locator('#specList .spec-btn').first().waitFor({state:'attached'});
   await page.evaluate(()=>window.setCurrent('JN2-F3'));
   const text=await page.locator('#main').innerText();
   assert.match(text,/CURATED FULL DATA SET/,'JN2-F3 should be curated full photographic dataset');
   assert.match(text,/Microscopy has been performed and documented in five original microscope images/,'must not claim microscopy not done');
   assert.match(text,/20 legible single-axis measurements/,'retain original microscopy measurements');
   assert.match(text,/calibration were not supplied/,'retain interpretation limits');
   assert.match(text,/1.8 cm/,'retain cap diameter');
   assert.match(text,/5.4 cm/,'retain stipe height');
   assert.ok(!text.includes('cao 0.2'),'stipe typo must not appear');
   assert.ok(!text.includes('no microscopic identification has been inferred in this atlas'),'obsolete misleading summary must be replaced');
   assert.equal(await page.locator('#main img[src*="JN2-F3SPMV"]').count(),5,'five microscope images present');
   assert.ok(await page.locator('#fullSetList [data-code="JN2-F3"]').count(),'curated full sidebar should list JN2-F3');
   assert.equal(errors.length,0,errors.join('\n'));
   console.log('PASS '+viewport.width+'px JN2-F3 full data, 5 microscopy images, conservative scientific notes and stipe correction');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1)});
