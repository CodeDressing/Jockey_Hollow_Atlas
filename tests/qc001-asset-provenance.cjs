// QC-001 — deterministic, read-only audit of master and ancillary image evidence.
// No guessing accessions, no rewriting scientific metadata, no publishing Drive media.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const context=vm.createContext({window:{},console});
const load=file=>vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file,timeout:25000});
load('data.js');
const master=context.window.ATLAS_DATA;
assert.ok(Array.isArray(master)&&master.length>=400,'Expected versioned master specimen register');
const masterCodes=master.map(x=>String(x.code||''));
assert.equal(new Set(masterCodes).size,masterCodes.length,'Master accession codes must be unique');
const sourceFiles=['drive_data.js','bn1_drive_data.js','supplemental_media.js','research/jn1_f11_gallery_20261115.js'];
for(const file of sourceFiles)load(file);
const supplemental=context.window.DRIVE_PHOTOS||[];
const originals=master.flatMap(s=>(s.images||[]).map(im=>({code:s.code,original:im.original,thumb:im.thumb||im.original})));
const extras=supplemental.map(im=>({code:im.specimen||'(unassigned)',original:im.original,thumb:im.thumb||im.original}));
const images=[...originals,...extras];
const paths=new Set();
function recurse(folder){
 for(const entry of fs.readdirSync(folder,{withFileTypes:true})){
  const absolute=path.join(folder,entry.name);
  if(entry.isDirectory())recurse(absolute);
  else paths.add(path.relative(root,absolute).replace(/\\/g,'/'));
 }
}
recurse(path.join(root,'assets'));
const missing=new Set();
const remoteIds=new Set();
let remoteCount=0,localCount=0;
for(const image of images){
 for(const value of [image.original,image.thumb]){
  if(!value)continue;
  if(/^https?:\/\//i.test(value)){
   if(/^https:\/\/drive\.google\.com\//i.test(value)){
    remoteCount++;
    try{const u=new URL(value);const id=u.searchParams.get('id');if(id)remoteIds.add(id);}
    catch(_){}
   }
   continue;
  }
  if(!value.startsWith('assets/'))continue;
  localCount++;
  let decoded=value;
  try{decoded=decodeURIComponent(value)}catch(e){throw Error('Malformed asset URI '+value)}
  if(!paths.has(decoded))missing.add(decoded);
 }
}
const known='assets/thumbs/bn5-f8(b)v2.jpg';
assert.deepEqual([...missing].sort(),[known],'Unexpected missing local binary reference; inspect before release');
const corrected=master.find(s=>s.code==='BN5-F8(B)');
assert.ok(corrected&&corrected.images.some(im=>im.thumb===known&&im.original==='assets/originals/bn5-f8(b)v2.jpg'),
 'Known historical thumbnail must have a verified original fallback');
const inventory=[];
for(const relative of [...paths].filter(p=>/\.(png|jpe?g|webp|gif)$/i.test(p)).sort()){
 const absolute=path.join(root,relative);
 const bytes=fs.readFileSync(absolute);
 assert.ok(bytes.length>0,'Zero-byte image '+relative);
 const extension=path.extname(relative).toLowerCase();
 const jpeg=bytes[0]===0xff&&bytes[1]===0xd8;
 const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 const gif=bytes.subarray(0,3).toString()==='GIF';
 const webp=bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
 assert.ok((extension==='.png'&&png)||(['.jpg','.jpeg'].includes(extension)&&jpeg)||(extension==='.gif'&&gif)||(extension==='.webp'&&webp),'Wrong media signature '+relative);
 inventory.push({path:relative,size_bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
assert.ok(inventory.length>=1250,'Local media count unexpectedly decreased');
assert.ok(remoteCount>0&&remoteIds.size>0,'Expected outstanding Drive migration dependency must be reported, not hidden');
const summary={
 master_records:master.length,
 master_images:originals.length,
 additional_photo_manifest_entries:supplemental.length,
 referenced_local_path_occurrences:localCount,
 external_drive_url_occurrences:remoteCount,
 unique_drive_file_ids:remoteIds.size,
 verified_local_image_binaries:inventory.length,
 local_image_bytes:inventory.reduce((n,x)=>n+x.size_bytes,0),
 missing_local_refs:[...missing],
 external_hosting_migration:'BLOCKED — source byte integrity and public image rights not established'
};
const directory=path.join(root,'qc001-output');
fs.mkdirSync(directory,{recursive:true});
fs.writeFileSync(path.join(directory,'media-sha256.json'),JSON.stringify({created_by:'QC-001 CI on checked-out repository',summary,files:inventory},null,2)+'\n');
fs.writeFileSync(path.join(directory,'summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log('QC001 SOURCE MEDIA AUDIT '+JSON.stringify(summary));
console.log('PASS binary signatures and SHA-256 for '+inventory.length+' original/derivative local media files; known missing thumbnail tracked; remote migration BLOCKED');
