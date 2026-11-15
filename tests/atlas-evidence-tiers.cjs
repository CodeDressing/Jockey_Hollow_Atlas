// Run with a localhost static server on 8765; no external network or paid dependencies.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
      const page=await browser.newPage({viewport});
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto('http://127.0.0.1:8765/index.html#JN1-F11',{waitUntil:'domcontentloaded'});
      await page.locator('#specList .spec-btn').first().waitFor({state:'attached'});
      assert.ok(await page.locator('#partialSetList .partialset-btn').count()>0,'partial specimen list must be populated');
      assert.ok(await page.locator('#mobilePartialSetList .partialset-btn').count()>0,'mobile partial list must be populated');
      await page.locator('#workflowFilter').selectOption('PARTIAL');
      assert.ok(await page.locator('#specList .spec-btn').count()>0,'partial filter must return results');
      const selection=await page.locator('#specList .spec-btn').first().getAttribute('data-code');
      await page.evaluate(code=>window.setCurrent(code),selection);
      assert.ok((await page.locator('#main').innerText()).includes('PARTIAL DATA SET'),'partial record badge required: '+selection);
      const evidence=await page.locator('#main .evidence-state-note').innerText();
      assert.match(evidence,/does not confirm identification/,'must distinguish media coverage from scientific clearance');
      await page.locator('#workflowFilter').selectOption('FULL');
      assert.ok(await page.locator('#specList .spec-btn').count()>0,'curated full sets retained');
      await page.locator('#workflowFilter').selectOption('OTHER');
      assert.ok(await page.locator('#specList .spec-btn').count()>0,'limited records retained');
      await page.locator('#workflowFilter').selectOption('ALL');
      assert.equal(errors.length,0,'browser runtime errors: '+errors.join(' | '));
      console.log('PASS '+viewport.width+'px partial/full/limited classification and scientific hold disclaimer');
      await page.close();
    }
  }finally{await browser.close()}
})().catch(e=>{console.error('FAIL evidence tier browser test: '+e.stack);process.exit(1)});
