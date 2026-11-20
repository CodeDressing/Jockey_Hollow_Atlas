const assert=require('node:assert/strict');
const {webkit,chromium,devices}=require('playwright');
(async()=>{
 const origin=process.env.ATLAS_ORIGIN||'http://127.0.0.1:8765/';
 for(const [name,engine,settings] of [
  ['iPhone Safari',webkit,{...devices['iPhone 13'],viewport:{width:402,height:874}}],
  ['Android Chromium',chromium,{...devices['Pixel 7'],viewport:{width:412,height:915}}],
  ['Desktop Chromium',chromium,{viewport:{width:1280,height:900}}]
 ]){
  const browser=await engine.launch({headless:true});
  try{
   const ctx=await browser.newContext(settings);
   const page=await ctx.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   // Private Drive photographs may be unavailable to public visitors. Never
   // depend on their accessibility or offer a navigation path to Drive.
   const driveRequests=[];
   await page.route('https://drive.google.com/**',route=>{
    driveRequests.push(route.request().url());
    return route.abort();
   });
   await page.goto(origin,{waitUntil:'domcontentloaded'});
   await page.locator('#enterAtlas').click();
   for(const id of ['AN2-F3','AN2-F12','JN2-F3','JN1-F11','BN5-F8(B)','JN1-F32']){
    await page.evaluate(code=>window.setCurrent(code),id);
    const cards=page.locator('#main .image-card');
    assert.ok(await cards.count()>0,id+' images must remain present');
    assert.equal(await page.locator('#main a[href*="drive.google.com"]').count(),0,'No public Drive links in '+id);
    assert.equal(await page.locator('#main iframe[src*="drive.google.com"]').count(),0,'No Drive embeds in '+id);
    assert.ok(!(await page.locator('#main').innerText()).includes('Open source in Google Drive'),'Source button must be absent');
    assert.ok(!(await page.locator('#main').innerText()).includes('Open movie in Drive'),'Movie redirect must be absent');
    const local=page.locator('#main .image-wrap[data-file^="assets/"]');
    if(await local.count()){
      const first=local.first();await first.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>{let el=[...document.querySelectorAll('#main .image-wrap[data-file^="assets/"] img')][0];return el&&el.complete&&el.naturalWidth>0;},null,{timeout:15000});
      await first.click();
      assert.equal(await page.locator('#openOriginal').isVisible(),true,'Original control for local photos');
      await page.locator('#closeViewer').click();
    }
    assert.equal(await page.locator('#main img[src*="drive.google.com"]').count(),0,id);
    if(id==='JN1-F32'){
      const microscopy=page.locator('#main .image-wrap[data-file^="assets/jn1-f32/microscopy/"]');
      assert.equal(await microscopy.count(),12);
      for(const image of await microscopy.locator('img').all()){
        await image.scrollIntoViewIfNeeded();
        assert.ok(await image.evaluate(async element=>{await element.decode();return element.naturalWidth>0;}));
      }
      await microscopy.nth(8).click();
      assert.ok(await page.locator('#viewerImg').evaluate(async image=>{await image.decode();return image.naturalWidth>0;}));
      assert.match(await page.locator('#viewerCap').innerText(),/software length annotations/);
      await page.locator('#closeViewer').click();
      assert.equal(await page.locator('#main .image-wrap[data-name="JN1-F32SP.JPG"]').count(),1);
    }
   }
   assert.deepEqual(driveRequests,[],'Unexpected Drive requests '+name);
   assert.deepEqual(errors,[],'Unexpected JS error '+name);
   console.log('PASS '+name+': public source links removed, original specimen cards preserved, all JN1-F32 images decode, and no Drive requests');
   await ctx.close();
  }finally{await browser.close();}
 }
})().catch(e=>{console.error(e.stack);process.exit(1)});
