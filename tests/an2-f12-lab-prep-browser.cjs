const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const files=['7','23','25','26','27'].map(n=>'AN2-F12 spore print ('+n+').JPG');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
   if(await page.locator('#enterAtlas').isVisible())await page.locator('#enterAtlas').click();
   await page.locator('#search').fill('AN2-F12');
   const row=page.locator('#specList .spec-btn[data-code="AN2-F12"]');
   assert.equal(await row.count(),1,'AN2-F12 must be navigable exactly once');
   await row.click();assert.equal(await page.locator('#main h1').innerText(),'AN2-F12');
   for(const file of files){
    const path='assets/an2-f12/lab-prep/'+file;
    const img=page.locator('#main .image-card img').filter({has:page.locator('bogus-no-element')});
    const exact=page.locator('#main .image-card img[src="'+path+'"]');
    assert.equal(await exact.count(),1,file+' correctly linked once');
    await exact.scrollIntoViewIfNeeded();await exact.evaluate(el=>el.decode());
    assert((await exact.evaluate(el=>el.naturalWidth))>0,file+' decodes');
   }
   assert.equal(await page.locator('#main .section h2').filter({hasText:'Lab preparation / microscopy setup'}).count(),1);
   for(const name of ['IMG_6021.jpg','IMG_6022.jpg','IMG_6023.jpg','IMG_6024.jpg'])
    assert.equal(await page.locator('#main .image-card img[src="assets/an2-f12/'+name+'"]').count(),1,'old '+name+' preserved');
   const description=await page.locator('#main').innerText();
   for(const phrase of ['7 cm','8 cm','Five original photographs','17 instrument annotations'])
    assert(description.includes(phrase),'missing descriptive assertion '+phrase);
   assert.match(description,/not a validated independent basidiospore/i,'microscopy identity remains unvalidated');
   assert.match(description,/Scientific publication HOLD/,'publication hold preserved');
   assert.equal(await page.locator('#main .image-card img[src*="/microscopy/"]').count(),14,'all subsequently authenticated microscopy images preserved');
   const filter=page.locator('#imageFilter');await filter.selectOption({label:'Lab preparation / microscopy setup'});
   assert.equal(await page.locator('#main .image-card').count(),5,'lab-only image filter');
   await page.locator('#main .image-wrap[data-file="assets/an2-f12/lab-prep/AN2-F12 spore print (7).JPG"]').click();
   assert(await page.locator('#viewer').evaluate(el=>el.classList.contains('open')),'viewer opens');
   await page.locator('#viewerImg').evaluate(el=>el.decode());
   await page.locator('#closeViewer').click();
   assert(!(await page.locator('#viewer').evaluate(el=>el.classList.contains('open'))),'viewer closes');
   assert.deepEqual(errors,[],'no browser errors');
   console.log('PASS '+width+'px: five lab images, four field/specimen images, fourteen microscopy images, measurements, scientific holds, viewer');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1)});
