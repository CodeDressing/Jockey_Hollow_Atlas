const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const BASE='http://127.0.0.1:8765/sandbox.html';
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--disable-web-security']});
  try{
    for(const viewport of [{width:390,height:844},{width:1280,height:900}]){
      const page=await browser.newPage({viewport});
      const errors=[];
      page.on('pageerror',err=>errors.push(String(err)));
      await page.goto(BASE,{waitUntil:'domcontentloaded'});
      const el=page.locator('#tv-anatomy3d');
      await el.waitFor({state:'attached',timeout:45000});
      await page.locator('#anatomy6-begin').waitFor({state:'visible',timeout:10000});
      assert.equal(await page.locator('#tv-anatomy-canvas').count(),1,'exactly one anatomy canvas');
      assert.equal(await page.locator('#myco-guided-anatomy').count(),1,'guided lesson retained');
      await page.locator('#anatomy6-begin').click();
      await page.waitForTimeout(1600);
      const ready=await page.evaluate(()=>window.MycoSimSelection27?.getState().started);
      assert.equal(ready,true,'3D renderer should initialize');
      assert.equal(await page.locator('.anatomy-intro6').isVisible(),false,'overlay dismissed');
      await page.locator('#g28-next').click();
      const state=await page.evaluate(()=>window.MycoSimGuided28?.getState());
      assert.equal(state.chapter,1,'lesson transition');
      assert.equal(state.mode,'cell','chapter changes model');
      await page.locator('.anatomy-controls6 summary').click();
      const mode=page.locator('#tv-anatomy3d [data-mode="micro"]');
      await mode.click();
      assert.equal((await page.evaluate(()=>window.MycoSimSelection27?.getState())).mode,'micro','advanced mode works');
      await page.locator('#g28-stop').click();
      assert.equal(await page.locator('#g28-status').innerText(),'Narration stopped. You can continue the current discovery.');
      assert.equal(errors.length,0,'Uncaught browser exceptions: '+errors.join(' | '));
      console.log('PASS '+viewport.width+'px — WebGL, overlay, controls, lesson, narration');
      await page.close();
    }
  }finally{await browser.close();}
})().catch(err=>{console.error('FAIL browser acceptance: '+err.stack);process.exit(1);});
