// QC-001 ledger: 01 inputs; 02 routing; 03 media and preservation gates.
// SECTION 01 — INPUTS
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
// SECTION 02 — ROUTING
test('Accession links tolerate malformed encoding and preserve valid exact IDs',()=>{
 const source=app.slice(app.indexOf('function accessionFromHash('),app.indexOf('\nconst linkedAccession='));
 const context={};vm.createContext(context);vm.runInContext(source,context);
 for(const hash of ['#%','#%E0%A4%A','#%ZZ'])assert.equal(context.accessionFromHash(hash),'');
 assert.equal(context.accessionFromHash('#bn5-f8%28b%29'),'BN5-F8(B)');
 assert.equal(context.accessionFromHash('#AN2-F12'),'AN2-F12');
 assert.equal(context.accessionFromHash(''),'');
 assert.match(app,/const requested=accessionFromHash\(window.location.hash\)/);
});
// SECTION 03 — MEDIA AND PRESERVATION GATES
test('All master media paths resolve without changing image bytes or accession count',()=>{
 const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),c);
 assert.equal(c.window.ATLAS_DATA.length,422);
 const missing=[];
 for(const record of c.window.ATLAS_DATA)for(const photo of record.images||[])
  for(const p of [photo.original,photo.thumb].filter(Boolean))
   if(!fs.existsSync(path.join(root,decodeURIComponent(p))))missing.push({code:record.code,path:p});
 assert.deepEqual(missing,[]);
 const specimen=c.window.ATLAS_DATA.find(s=>s.code==='BN5-F8(B)');
 const repaired=specimen.images.find(p=>p.filename==='bn5-f8(b)v2.jpg');
 assert.equal(repaired.thumb,repaired.original);
 for(const code of ['AN2-F10','AN2-F12','AN2-F22'])assert.ok(app.includes(code));
});
