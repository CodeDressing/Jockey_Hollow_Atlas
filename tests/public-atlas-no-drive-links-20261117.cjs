const assert=require('node:assert/strict');
const {webkit,chromium,firefox,devices}=require('playwright');
(async()=>{
 const origin=process.env.ATLAS_ORIGIN||'http://127.0.0.1:8765/';
 for(const [name,engine,settings] of [
  ['iPhone Safari',webkit,{...devices['iPhone 13'],viewport:{width:402,height:874}}],
  ['Android Chromium',chromium,{...devices['Pixel 7'],viewport:{width:412,height:915}}],
  ['Desktop Chromium',chromium,{viewport:{width:1280,height:900}}],
  ['Desktop Firefox',firefox,{viewport:{width:1280,height:900}}],
  ['Desktop WebKit',webkit,{viewport:{width:1280,height:900}}]
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
   const priorities=['AN2-F1','AN2-F41','AN2-F3','AN2-F7','AN2-F9','AN2-F12','AN2-F34','AN2-F17','AN2-F32','AN2-F36','AN2-F38','JN1-F15','JN1-F16','JN1-F32'];
   for(const id of [...priorities,'JN2-F3','JN1-F11','BN5-F8(B)']){
    await page.evaluate(code=>window.setCurrent(code),id);
    const cards=page.locator('#main .image-card');
    const count=await cards.count();
    assert.ok(count>0,id+' images must remain present');
    assert.equal(await page.locator('#main a[href*="drive.google.com"]').count(),0,'No public Drive links in '+id);
    assert.equal(await page.locator('#main iframe[src*="drive.google.com"]').count(),0,'No Drive embeds in '+id);
    assert.ok(!(await page.locator('#main').innerText()).includes('Open source in Google Drive'),'Source button must be absent');
    assert.ok(!(await page.locator('#main').innerText()).includes('Open movie in Drive'),'Movie redirect must be absent');
    const local=page.locator('#main .image-wrap[data-file^="assets/"]');
    assert.equal(await local.count(),count,id+' assets must be locally hosted');
    if(priorities.includes(id)){
      for(const image of await local.locator('img').all()){
        await image.scrollIntoViewIfNeeded();
        assert.ok(await image.evaluate(async element=>{await element.decode();return element.naturalWidth>0;}));
      }
      console.log(name+' '+id+': '+count+' decoded gallery images');
    }
    if(await local.count()){
      const first=local.first();await first.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>{let el=[...document.querySelectorAll('#main .image-wrap[data-file^="assets/"] img')][0];return el&&el.complete&&el.naturalWidth>0;},null,{timeout:15000});
      await first.click();
      assert.equal(await page.locator('#openOriginal').isVisible(),true,'Original control for local photos');
      await page.locator('#closeViewer').click();
    }
    assert.equal(await page.locator('#main img[src*="drive.google.com"]').count(),0,id);
    if(id==='AN2-F1'){
      assert.equal(count,8,'Preserve the original gallery image and display all seven recovered views');
      assert.equal(await page.locator('#main summary').filter({hasText:'Archived photo records'}).count(),0);
      const restored=page.locator('#main .image-wrap[data-file^="assets/an2-f1/"]');
      assert.equal(await restored.count(),7);
      await restored.last().click();
      assert.ok(await page.locator('#viewerImg').evaluate(async image=>{await image.decode();return image.naturalWidth>0;}));
      assert.match(await page.locator('#viewerCap').innerText(),/AN2-F1 label/);
      await page.locator('#closeViewer').click();
    }
    if(id==='AN2-F9'||id==='AN2-F34'){
      assert.equal(await page.locator('#main summary').filter({hasText:'Archived photo records'}).count(),0,id);
      const expectedCount=id==='AN2-F9'?19:13;
      assert.equal(count,expectedCount,id+' visible gallery count');
      if(id==='AN2-F34'){
        assert.equal(await local.filter({has:page.locator('img[alt]')}).count(),expectedCount);
        assert.equal(await page.locator('#main .image-wrap[data-name="AN2-F34SP.JPG"]').count(),1);
      }
      for(const card of await local.all()){
        await card.scrollIntoViewIfNeeded();
        if(settings.hasTouch) await card.tap();
        else await card.click();
        const viewer=page.locator('#viewerImg');
        assert.equal(await viewer.getAttribute('src'),await card.getAttribute('data-file'));
        assert.ok(await viewer.evaluate(async image=>{await image.decode();return image.naturalWidth>0;}));
        await page.locator('#closeViewer').click();
      }
    }
    if(id==='AN2-F12'){
      assert.equal(count,23,'Preserve the existing AN2-F12 gallery');
      const archive=page.locator('#main summary').filter({hasText:'Archived photo records'});
      assert.equal(await archive.count(),1,'Preserve the two held AN2-F12 views');
      assert.match(await archive.innerText(),/2/);
    }
    if(id==='AN2-F36'||id==='AN2-F38'){
      const manifest=require(`../research/${id.toLowerCase().replace('-', '_')}_media_restoration_20261121.json`);
      assert.equal(count,manifest.records.length,id+' should display one card per verified capture');
      assert.equal(await page.locator('#main summary').filter({hasText:'Archived photo records'}).count(),0);
      for(const record of manifest.records){
        const card=local.and(page.locator(`[data-name="${record.filename}"]`));
        assert.equal(await card.count(),1,record.filename);
        assert.equal(await card.getAttribute('data-file'),record.gallery_path);
        if(record.thumbnail_path){
          assert.equal(await card.getAttribute('data-thumb'),record.thumbnail_path);
        }
        await card.scrollIntoViewIfNeeded();
        if(settings.hasTouch) await card.tap();
        else await card.click();
        const viewer=page.locator('#viewerImg');
        assert.ok(await viewer.evaluate(async image=>{await image.decode();return image.naturalWidth>0;}));
        assert.equal(await viewer.getAttribute('src'),record.gallery_path);
        await page.locator('#closeViewer').click();
      }
    }
    if(id==='JN1-F15'){
      assert.equal(await page.locator('#main .image-wrap[data-file^="assets/jn1-f15/microscopy/"]').count(),14);
    }
    if(id==='JN1-F16'){
      const microscopy=page.locator('#main .image-wrap[data-file^="assets/jn1-f16/microscopy/"]');
      assert.equal(await microscopy.count(),10);
      assert.equal(await page.locator('#main .image-wrap[data-file^="assets/jn1-f16/specimen/"]').count(),2);
      assert.equal(await page.locator('#main .image-wrap[data-name="JN1-F16SP.JPG"]').count(),1);
      assert.equal(await page.locator('#main summary').filter({hasText:'Archived photo records'}).count(),0);
      assert.match(await page.locator('#main').innerText(),/9–14 µm longitudinally and 3–5 µm transversely/);
      for(const card of await microscopy.all()){
        const expected=await card.getAttribute('data-file');
        await card.scrollIntoViewIfNeeded();
        if(settings.hasTouch) await card.tap();
        else await card.click();
        const viewer=page.locator('#viewerImg');
        assert.equal(await viewer.getAttribute('src'),expected);
        assert.ok(await viewer.evaluate(async image=>{await image.decode();return image.naturalWidth>0;}));
        if(expected.endsWith('(1).png')){
          await page.locator('#oneToOne').click();
          const transform=await viewer.evaluate(image=>image.style.transform);
          await page.locator('#zoomIn').click();
          assert.notEqual(await viewer.evaluate(image=>image.style.transform),transform);
          await page.locator('#zoomOut').click();
          assert.equal(await viewer.evaluate(image=>image.style.transform),transform);
        }
        await page.locator('#closeViewer').click();
      }
    }
    if(['AN2-F3','AN2-F7','AN2-F32','JN1-F15','JN1-F32'].includes(id)){
      assert.equal(await page.locator('#main summary').filter({hasText:'Archived photo records'}).count(),0,id);
    }
    if(id==='AN2-F17'){
      assert.equal(count,26);
      assert.equal(await page.locator('#main summary').filter({hasText:'Archived photo records'}).count(),0);
    }
    if(id==='AN2-F41'){
      assert.equal(count,25,'Show the 24 recovered views with the already published spore-print view');
      assert.equal(await page.locator('#main summary').filter({hasText:'Archived photo records'}).count(),0);
      assert.equal(await local.filter({has:page.locator('img[alt]')}).count(),25);
      assert.equal(await page.locator('#main .image-wrap[data-file^="assets/an2-f41/microscopy/"]').count(),13);
      assert.equal(await page.locator('#main .image-wrap[data-name="AN2-F41SP.JPG"]').count(),1);
      await page.locator('#main .image-wrap[data-name="AN2-F41 SPM (5).png"]').click();
      assert.ok(await page.locator('#viewerImg').evaluate(async image=>{await image.decode();return image.naturalWidth>0;}));
      assert.match(await page.locator('#viewerCap').innerText(),/Calibration remains unverified/);
      await page.locator('#closeViewer').click();
    }
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
