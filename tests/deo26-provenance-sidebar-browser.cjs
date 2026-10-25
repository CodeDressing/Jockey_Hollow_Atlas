const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [390,768,1280]){
   const page=await browser.newPage({viewport:{width,height:900}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
   if(await page.locator('#enterAtlas').isVisible())await page.locator('#enterAtlas').click();
   const toggle=page.locator('.sidebar-toggle'),rail=page.locator('.sidebar-resize');
   assert.equal(await toggle.count(),1);assert.equal(await rail.count(),1);
   assert.equal(await toggle.getAttribute('aria-expanded'),'true');
   await page.locator('#search').fill('AN2-F12');
   await page.locator('#specList .spec-btn[data-code="AN2-F12"]').click();
   const field=page.locator('#main').innerText();
   for(const term of ['Beige','smooth','Fourteen original microscopy photographs'])assert((await field).toLowerCase().includes(term.toLowerCase()),'missing evidence: '+term);
   assert.equal(await page.locator('#main .image-card img[src*="/microscopy/"]').count(),14);
   assert((await page.locator('.researcher-provenance').innerText()).includes('477'));
   await toggle.click();
   assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   assert(await page.locator('.app').evaluate(el=>el.classList.contains('is-collapsed')));
   assert.equal(await page.locator('#search').inputValue(),'AN2-F12');
   await toggle.click();
   assert.equal(await toggle.getAttribute('aria-expanded'),'true');
   await rail.focus();await page.keyboard.press('ArrowRight');
   const sliderWidth=await rail.getAttribute('aria-valuenow');assert(Number(sliderWidth)>=170);
   const bbox=await rail.boundingBox();if(bbox&&width>550){await page.mouse.move(bbox.x+bbox.width/2,bbox.y+55);await page.mouse.down();await page.mouse.move(bbox.x+bbox.width/2+32,bbox.y+55);await page.mouse.up();}
   const remembered=await rail.getAttribute('aria-valuenow');
   await page.reload({waitUntil:'domcontentloaded'});assert.equal(await page.locator('.sidebar-toggle').getAttribute('aria-expanded'),'true');
   assert.equal(await page.locator('.sidebar-resize').getAttribute('aria-valuenow'),remembered);
   assert.equal(errors.length,0,errors.join('; '));
   console.log('PASS width '+width+' sidebar, persistence and AN2-F12 evidence');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exit(1)});
