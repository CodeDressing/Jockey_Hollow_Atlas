const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const manifest=JSON.parse(fs.readFileSync('research/rutgers_r4_verified_originals_sha256_20261101.json','utf8'));
assert.equal(manifest.records.length,26);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const gitBlob=b=>crypto.createHash('sha1').update(Buffer.from('blob '+b.length+String.fromCharCode(0))).update(b).digest('hex');
const seen=new Set();const counts={'AN2-F12':0,'AN2-F22':0};
for(const row of manifest.records){
  const key=row.accession+':'+row.repository_path;
  assert(!seen.has(key),'Duplicate media manifest entry '+key);seen.add(key);
  assert(/^assets\/an2-f(12|22)\//.test(row.repository_path),'Unrecognized scoped asset');
  const bytes=row.accession==='AN2-F12'
    ?fs.readFileSync(row.repository_path)
    :execFileSync('git',['show','origin/'+row.git_branch+':'+row.repository_path],{maxBuffer:8*1024*1024});
  assert.equal(bytes.length,row.bytes,'Size changed for '+key);
  assert.equal(hash(bytes),row.drive_sha256,'SHA-256 MISMATCH '+key);
  assert.equal(gitBlob(bytes),row.drive_calculated_git_blob_sha1,'Git blob identity mismatch '+key);
  counts[row.accession]++;
  console.log('PASS ORIGINAL SHA256 '+row.accession+' '+row.filename+' '+row.drive_sha256);
}
assert.equal(counts['AN2-F12'],23);assert.equal(counts['AN2-F22'],3);
for(const row of manifest.records.filter(x=>x.accession==='AN2-F22'))assert(!fs.existsSync(row.repository_path),'AN2-F22 not authorized in R4 branch');
assert.equal(manifest.no_production_merge,true);
console.log('PASS Rutgers R.4 independently hashed 26 repository-originals against fresh Drive SHA-256');
