const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
   const page=await browser.newPage({viewport});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
   await page.locator('#specList .spec-btn').first().waitFor({state:'attached'});
   for(const query of ['lions mane',"lion's mane",'hericium erinaceus','chet']){
    await page.evaluate(q=>{const e=document.getElementById('search');e.value=q;e.dispatchEvent(new Event('input',{bubbles:true}));},query);
    assert.ok(await page.locator('#specList [data-code="CULT-CHET-LM-01"]').count(), 'missing search result for '+query);
   }
   await page.evaluate(()=>{const e=document.getElementById('search');e.value='';e.dispatchEvent(new Event('input',{bubbles:true}));window.setCurrent('CULT-CHET-LM-01')});
   assert.match(await page.locator('#main').innerText(),/Chet's Lion's Mane/);
   const text=await page.locator('#main').innerText();
   assert.match(text,/seven microscope photographs|Seven original PNGs|seven original PNGs/i);
   assert.match(text,/not conclusively confirmed|not conclusively identified/i);
   assert.match(text,/Pending upload|awaiting GitHub upload/i);
   assert.equal(await page.locator('#main .image-card').count(),0,'no missing image placeholders');
   assert.equal(errors.length,0,errors.join('\n'));
   console.log('PASS Chet cultivated Lion\'s Mane search and careful image-intake status '+viewport.width);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1)});
