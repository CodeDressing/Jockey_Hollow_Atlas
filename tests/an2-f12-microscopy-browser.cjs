const {chromium}=require('playwright');const assert=require('node:assert/strict');
const archived=[1,2,6,7,8,10,11,13,14];
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});try{
for(const width of [390,1280]){const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
if(await page.locator('#enterAtlas').isVisible())await page.locator('#enterAtlas').click();
await page.locator('#search').fill('AN2-F12');
const entry=page.locator('#specList .spec-btn[data-code="AN2-F12"]');assert.equal(await entry.count(),1);await entry.click();
assert.equal(await page.locator('#main h1').innerText(),'AN2-F12');
for(const n of archived){const path='assets/an2-f12/microscopy/AN2-F12 SPORE PRINT MICROSCOPE  ('+n+').png';const img=page.locator('#main .image-card img[src="'+path+'"]');assert.equal(await img.count(),1,'microscopy '+n);await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());assert((await img.evaluate(el=>el.naturalWidth))>0,'valid microscopy '+n);}
for(const n of [3,4,5,9,12]){const path='assets/an2-f12/microscopy/AN2-F12 SPORE PRINT MICROSCOPE  ('+n+').png';assert.equal(await page.locator('#main .image-card img[src="'+path+'"]').count(),0,'no fabricated archive '+n);}
for(let n=1;n<=4;n++)assert.equal(await page.locator('#main .image-card img[src="assets/an2-f12/IMG_602'+n+'.jpg"]').count(),1,'prior macro '+n);
for(const n of [7,23,25,26,27])assert.equal(await page.locator('#main .image-card img[src="assets/an2-f12/lab-prep/AN2-F12 spore print ('+n+').JPG"]').count(),1,'prior lab '+n);
const text=await page.locator('#main').innerText();for(const v of ['7 cm','8 cm','17 instrument annotations','unconfirmed'])assert(text.includes(v),'missing record '+v);
await page.locator('#imageFilter').selectOption({label:'Microscopy'});
assert.equal(await page.locator('#main .image-card').count(),archived.length,'filtered nine microscopy images');
await page.locator('#main .image-wrap[data-file="assets/an2-f12/microscopy/AN2-F12 SPORE PRINT MICROSCOPE  (1).png"]').click();
assert(await page.locator('#viewer').evaluate(el=>el.classList.contains('open')));await page.locator('#viewerImg').evaluate(el=>el.decode());await page.locator('#closeViewer').click();
assert.deepEqual(errors,[],'no runtime exceptions');
console.log('PASS '+width+'px microscopy: 9 original archived PNGs, nine earlier files, source notes, filter and lightbox');await page.close();}
}finally{await browser.close()}})().catch(e=>{console.error(e.stack);process.exit(1)});
