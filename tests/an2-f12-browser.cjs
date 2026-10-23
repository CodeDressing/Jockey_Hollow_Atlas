const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const BASE='http://127.0.0.1:8765';
const names=['IMG_6021.jpg','IMG_6022.jpg','IMG_6023.jpg','IMG_6024.jpg'];
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try{
    for (const width of [390,1280]) {
      const page=await browser.newPage({viewport:{width,height:900}});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(BASE+'/index.html',{waitUntil:'domcontentloaded',timeout:30000});
      if (await page.locator('#enterAtlas').isVisible()) await page.locator('#enterAtlas').click();
      const search=page.locator('#search');
      await search.fill('AN2-F12');
      const specimen=page.locator('#specList .spec-btn[data-code="AN2-F12"]');
      assert.equal(await specimen.count(),1,'Exact AN2-F12 sidebar accession in filtered list');
      await specimen.click();
      assert.equal(await page.locator('#main h1').innerText(),'AN2-F12');
      for (const name of names) {
        const img=page.locator('#main .image-card img[src="assets/an2-f12/'+name+'"]');
        assert.equal(await img.count(),1,name+' present exactly once in dossier');
        const state=await img.evaluate(el=>({complete:el.complete,width:el.naturalWidth,height:el.naturalHeight}));
        assert(state.complete&&state.width>0&&state.height>0,name+' must load and decode');
      }
      assert.equal(await page.locator('#main .section h2').filter({hasText:'Wild / field context'}).count(),1,'field context group preserved');
      assert.equal(await page.locator('#main .section h2').filter({hasText:'Source macro / specimen'}).count(),1,'specimen group preserved');
      assert((await page.locator('#main').innerText()).includes('7 cm'),'independent cap measurement visible');
      assert((await page.locator('#main').innerText()).includes('8 cm'),'independent stipe measurement visible');
      assert((await page.locator('#main').innerText()).includes('Identification and edibility are unconfirmed'),'identification caveat visible');
      const first=page.locator('#main .image-card .image-wrap[data-file="assets/an2-f12/IMG_6021.jpg"]');
      await first.click();
      assert(await page.locator('#viewer').evaluate(el=>el.classList.contains('open')),'full image viewer opens');
      const viewer=page.locator('#viewerImg');
      await viewer.evaluate(el=>new Promise((resolve,reject)=>{if(el.complete&&el.naturalWidth)return resolve();el.addEventListener('load',resolve,{once:true});el.addEventListener('error',reject,{once:true});}));
      assert((await viewer.evaluate(el=>el.naturalWidth))>0,'full image loads');
      await page.locator('#closeViewer').click();
      assert(!(await page.locator('#viewer').evaluate(el=>el.classList.contains('open'))),'viewer closes');
      assert.deepEqual(errors,[],'no uncaught runtime exceptions');
      console.log('PASS AN2-F12 at '+width+'px: accession, 4 originals, two categories, measurement, uncertainty, lightbox');
      await page.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1)});
