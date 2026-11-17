const {chromium,webkit,devices}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 for(const [name,engine,contextOptions] of [
  ['iPhone Safari',webkit,{...devices['iPhone 13'],viewport:{width:390,height:844}}],
  ['iPhone SE Safari',webkit,{...devices['iPhone SE'],viewport:{width:375,height:667}}],
  ['Desktop Chromium',chromium,{viewport:{width:1280,height:900}}]
 ]){
  const browser=await engine.launch({headless:true});
  try{
   const context=await browser.newContext(contextOptions);
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/index.html#JN2-F3',{waitUntil:'domcontentloaded'});
   await page.locator('#specList .spec-btn').first().waitFor({state:'attached'});
   await page.evaluate(()=>window.setCurrent('JN2-F3'));
   const gallery=page.locator('.image-wrap img').first();
   await gallery.scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>{const im=document.querySelector('.image-wrap img');return im&&im.complete&&im.naturalWidth>0;},{timeout:12000});
   assert.equal(await gallery.evaluate(el=>el.naturalWidth>0),true,'source photograph preview must decode');
   if(name.includes('iPhone')){
    assert.equal(await page.locator('.mobileControls').isVisible(),true,'iPhone should have visible search controls');
    assert.equal(await page.locator('.sidebar').isVisible(),false,'sidebar should not occupy iPhone viewport');
    assert.ok(await page.locator('.gallery').first().evaluate(el=>el.getBoundingClientRect().width)>300,'gallery must be wide enough to see photographs');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),'no horizontal overflow');
   }
   await page.locator('.image-wrap').first().click();
   assert.equal(await page.locator('#viewer').evaluate(el=>el.classList.contains('open')),true,'full image viewer must open');
   await page.waitForFunction(()=>{const el=document.querySelector('#viewerImg');return el&&el.complete&&el.naturalWidth>0;},{timeout:12000});
   assert.ok(await page.locator('#viewerImg').evaluate(el=>el.naturalWidth>0),'full image must decode');
   await page.locator('#closeViewer').click();
   assert.ok(!await page.locator('#viewer').evaluate(el=>el.classList.contains('open')),'viewer must close');
   assert.deepEqual(errors,[],'JavaScript errors: '+errors.join('; '));
   console.log('PASS '+name+' 390/375/1280 layout, preview, full image, viewer controls');
   await context.close();
  }finally{await browser.close();}
 }
})().catch(e=>{console.error(e.stack);process.exit(1)});
