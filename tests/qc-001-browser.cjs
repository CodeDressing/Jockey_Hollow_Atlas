// QC-001 ledger: 01 runner; 02 accession census; 03 responsive viewer; 04 report.
// This diagnostic deliberately FAILS when public Drive images remain embedded.
// SECTION 01 — RUNNER
const {chromium,webkit,devices}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.QC_BASE_URL||'http://127.0.0.1:8765/';
const out=process.env.QC_OUTPUT||'qc-results';
fs.mkdirSync(out,{recursive:true});
const result={base,physical_iPhone17:'NOT TESTED',checks:[],profiles:[]};
function check(id,pass,evidence){result.checks.push({id,status:pass?'PASS':'FAIL',evidence});}
(async()=>{
 for(const [name,engine,options] of [
  ['desktop-chromium',chromium,{viewport:{width:1280,height:900}}],
  ['android-chromium-emulation',chromium,{...devices['Pixel 7']}],
  ['iphone-webkit-emulation',webkit,{...devices['iPhone 13']}]
 ]){
  let browser;
  try{
   browser=await engine.launch({headless:true});
   const context=await browser.newContext(options),page=await context.newPage();
   const errors=[],consoleErrors=[],failedRequests=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
   page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
   await page.route(/https:\/\/(drive\.google\.com|[^/]*googleusercontent\.com)\//,r=>r.abort());
   await page.goto(base+'index.html#%',{waitUntil:'domcontentloaded'});
   const startup=await page.locator('#specList .spec-btn').count();
   check(name+'/malformed-startup',startup>0,{startup,errors:[...errors]});
   if(!startup)await page.goto(base+'index.html',{waitUntil:'domcontentloaded'});
   await page.locator('#enterAtlas').click();
   // SECTION 02 — ACCESSION CENSUS
   const census=await page.evaluate(()=>{
    const rows=[];
    for(const s of data){
     // Render census without generating hundreds of browser history mutations.
     // Individual navigation, hash handling and keyboard actions are tested below.
     current=s.code;renderSpec();
     const host=document.getElementById('main');
     rows.push({code:s.code,state:fullDataSetState(s),images:(s.images||[]).length,
      title:host.querySelector('h1')?.textContent,
      driveActions:host.querySelectorAll('a[href*="drive.google.com"],iframe[src*="drive.google.com"],button[onclick*="drive.google.com"]').length,
      externalDriveImages:host.querySelectorAll('img[src*="drive.google.com"],img[src*="googleusercontent.com"]').length,
      missingAlt:[...host.querySelectorAll('img')].filter(el=>!el.getAttribute('alt')).length,
      keyboardImages:[...host.querySelectorAll('.image-wrap')].filter(el=>el.tabIndex>=0).length,
      hold:host.textContent.includes('Scientific publication HOLD')});
    }
    return rows;
   });
   check(name+'/all-accessions-render',census.every(r=>r.title===r.code),{records:census.length});
   check(name+'/no-drive-actions',census.every(r=>!r.driveActions),{affected:census.filter(r=>r.driveActions)});
   check(name+'/no-drive-embeds',census.every(r=>!r.externalDriveImages),{affected:census.filter(r=>r.externalDriveImages)});
   check(name+'/scientific-holds',['AN2-F10','AN2-F12','AN2-F22'].every(code=>census.find(r=>r.code===code)?.hold),{});
   check(name+'/image-alt',census.every(r=>!r.missingAlt),{});
   check(name+'/gallery-keyboard',census.every(r=>!r.images||r.keyboardImages===r.images),{});
   // SECTION 03 — RESPONSIVE VIEWER AND SAFE TEXT
   await page.evaluate(()=>{window.location.hash='%ZZ';setCurrent('JN2-F3');});
   const wrap=page.locator('#main .image-wrap[data-file^="assets/"]').first();
   await wrap.scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>{const i=document.querySelector('#main .image-wrap[data-file^="assets/"] img');return i?.complete&&i.naturalWidth>0;});
   if(await wrap.evaluate(el=>el.tabIndex>=0)){
    await wrap.focus();await page.keyboard.press('Enter');
   }else{
    // Keep auditing click functionality after recording the production keyboard defect.
    await wrap.click();
   }
   await page.waitForFunction(()=>document.getElementById('viewerImg').naturalWidth>0);
   check(name+'/viewer-decode',true,await page.locator('#viewerImg').evaluate(i=>({width:i.naturalWidth,height:i.naturalHeight})));
   check(name+'/viewer-dialog',await page.locator('#viewer').getAttribute('role')==='dialog',{});
   check(name+'/viewer-focus',await page.locator('#closeViewer').evaluate(el=>el===document.activeElement),{});
   await page.keyboard.press('Tab');
   check(name+'/viewer-focus-cycle',await page.locator('#zoomOut').evaluate(el=>el===document.activeElement),{});
   const before=await page.locator('#viewerImg').evaluate(i=>i.style.transform);
   await page.locator('#zoomIn').click();
   check(name+'/zoom-control',before!==await page.locator('#viewerImg').evaluate(i=>i.style.transform),{});
   result.checks.push({id:name+'/physical-pinch',status:'NOT TESTED',evidence:'No physical device or trusted multitouch evidence available.'});
   await page.keyboard.press('Escape');
   check(name+'/viewer-return-focus',await wrap.evaluate(el=>el===document.activeElement),{});
   const injection=await page.evaluate(()=>{
    const s=data.find(s=>s.code==='JN2-F3'),old=s.status;
    s.status='<img id="qc-injection" src=x onerror="window.qcInjection=1">';renderSpec();
    const escaped=!document.getElementById('qc-injection')&&!window.qcInjection;
    s.status=old;renderSpec();return escaped;
   });
   check(name+'/description-injection',injection,{});
   const widths=name==='desktop-chromium'?[320,390,768,960,1280,1920]:[options.viewport.width];
   for(const width of widths){
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>setCurrent('JN2-F3'));
    const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
     smallTargets:[...document.querySelectorAll('button')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<24||r.height<24);}).length}));
    check(name+'/overflow/'+width,layout.scrollWidth<=width+2,layout);
   }
   await page.screenshot({path:path.join(out,name+'.png'),fullPage:false});
   check(name+'/uncaught-errors',errors.length===0,{errors});
   result.profiles.push({name,browser:browser.version(),census,consoleErrors,failedRequests,
    navigation:await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {domContentLoaded:n.domContentLoadedEventEnd,transferSize:n.transferSize};})});
   await context.close();
  }catch(error){result.checks.push({id:name+'/execution',status:'BLOCKED',evidence:String(error.stack)});}
  finally{if(browser)await browser.close();}
 }
 // SECTION 04 — REPORT
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result.checks,null,2));
 if(result.checks.some(c=>c.status==='FAIL'||c.status==='BLOCKED'))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
