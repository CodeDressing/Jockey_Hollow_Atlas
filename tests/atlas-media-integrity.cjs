// Verify all locally referenced JN1-F11 binaries exist, without reading/changing source bytes.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'research/jn1_f11_gallery_20261115.js'),'utf8');
const context={window:{}};
vm.runInNewContext(source,context,{filename:'research/jn1_f11_gallery_20261115.js',timeout:2000});
const photos=Array.from(context.window.DRIVE_PHOTOS||[]);
assert.equal(photos.length,15,'must preserve 8 field + 7 microscopy uploads');
assert.equal(photos.filter(p=>p.category==='Wild / field context').length,8);
assert.equal(photos.filter(p=>p.category==='Microscopy').length,7);
const seen=new Set();
for(const item of photos){
  assert.equal(item.specimen,'JN1-F11','accession must remain explicit');
  assert.match(item.original,/^assets\//,'original must refer to in-repo file');
  const rel=decodeURIComponent(item.original);
  assert.equal(item.original,item.thumb,'thumbnail must not point to a different source');
  assert.ok(!seen.has(rel),'duplicate original referenced: '+rel);seen.add(rel);
  const file=path.resolve(root,rel);
  assert.ok(file.startsWith(path.join(root,'assets')+path.sep),'must remain inside repo assets');
  assert.ok(fs.existsSync(file),'missing original: '+rel);
  assert.ok(fs.statSync(file).size>100,'empty or invalid original: '+rel);
}
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
assert.match(app,/AN2-F10/,'scientific hold reference must be retained');
assert.match(app,/AN2-F12/,'scientific hold reference must be retained');
assert.match(app,/AN2-F22/,'scientific hold reference must be retained');
assert.match(app,/FULL_DATA_SET_CODES/,'curated set must be preserved');
console.log('PASS 15 linked JN1-F11 binary assets, accession, uniqueness, preservation guards');
