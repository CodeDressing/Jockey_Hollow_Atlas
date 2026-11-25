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
      assert.match(evidence,/Documentation coverage is separate from identification/,'must separate media coverage from science');
      assert.match(evidence,/Publication rights:/,'must explicitly display rights uncertainty');
      assert.equal(await page.locator('#main .evidence-coverage > div').count(),5,'five evidence categories shown');
      await page.locator('#workflowFilter').selectOption('ALL');
      await page.evaluate(()=>window.setCurrent('JN1-F11'));
      const jn=await page.locator('#main .evidence-state-note').innerText();
      assert.match(jn,/Extensive documentation/,'JN1-F11 evidence must not be treated as sparse');
      assert.match(jn,/Microscopy:.*Images recorded/,'images are distinct from validated spores');
      await page.evaluate(()=>window.setCurrent('AN2-F12'));
      assert.match(await page.locator('#main .evidence-state-note').innerText(),/Scientific publication HOLD/,'AN2-F12 hold preserved');
      await page.locator('#workflowFilter').selectOption('FULL');
      assert.ok(await page.locator('#specList .spec-btn').count()>0,'curated full sets retained');
      for(const list of ['fullSetList','mobileFullSetList']){
        assert.equal(await page.locator('#'+list+' [data-code="BN5-F26"]').count(),1);
      }
      for(const list of ['partialSetList','mobilePartialSetList']){
        assert.equal(await page.locator('#'+list+' [data-code="BN5-F26"]').count(),0);
      }
      assert.equal(await page.locator('#specList [data-code="BN5-F26"]').count(),1);
      await page.evaluate(()=>window.setCurrent('BN5-F26'));
      assert.match(await page.locator('#main .fullset-badge').innerText(),/CURATED FULL DATA SET/);
      assert.match(await page.locator('#main .record-status .status').innerText(),/formal taxonomic review.*identification unresolved/i);
      assert.equal(await page.locator('#main .image-card').count(),15);
      const headings=await page.locator('#main .summary-item h4').allTextContents();
      const sections=['Collection documentation','Macroscopic description','Spore-print documentation',
        'Microscopic documentation','Scientific interpretation','Taxonomic review requirements'];
      assert.deepEqual(headings.filter(heading=>sections.includes(heading)),sections);
      await page.locator('#workflowFilter').selectOption('OTHER');
      assert.ok(await page.locator('#specList .spec-btn').count()>0,'limited records retained');
      await page.locator('#workflowFilter').selectOption('ALL');
      assert.equal(errors.length,0,'browser runtime errors: '+errors.join(' | '));
      console.log('PASS '+viewport.width+'px partial/full/limited classification and scientific hold disclaimer');
      await page.close();
    }
  }finally{await browser.close()}
})().catch(e=>{console.error('FAIL evidence tier browser test: '+e.stack);process.exit(1)});
