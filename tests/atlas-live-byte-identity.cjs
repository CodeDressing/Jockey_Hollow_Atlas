// QC-001 ledger: 01 exact-byte samples; 02 independent HTTP probe; 03 report.
// SECTION 01 — EXACT-BYTE SAMPLES
const fs=require('node:fs');
const crypto=require('node:crypto');
const rows=[];
const files=['assets/originals/JN2-F3SPMV1.png','assets/thumbs/JN2-F3SPMV1.jpg',
 'assets/an2-f12/IMG_6021.jpg','assets/an2-f12/microscopy/AN2-F12 SPORE PRINT MICROSCOPE  (1).png',
 'assets/originals/bn5-f8(b)v2.jpg','assets/JN1-F11  (8)feild .jpg','assets/JN1-F11 (1).png'];
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
// SECTION 02 — INDEPENDENT HTTP PROBE
(async()=>{
 for(const file of files){
  const expected=fs.readFileSync(file),row={file,repository_bytes:expected.length,repository_sha256:hash(expected)};
  try{
   const url='https://jockey-hollow-atlas.onrender.com/'+file.split('/').map(encodeURIComponent).join('/');
   const response=await fetch(url,{signal:AbortSignal.timeout(25000)}),raw=Buffer.from(await response.arrayBuffer());
   row.http_status=response.status;row.http_bytes=raw.length;row.http_sha256=hash(raw);
   row.headers=Object.fromEntries(['content-type','content-encoding','content-length','cf-polished','cache-control','vary'].map(k=>[k,response.headers.get(k)]));
   row.status=response.status===200&&row.http_sha256===row.repository_sha256?'PASS':'FAIL';
  }catch(error){row.status='BLOCKED';row.error=error.message;}
  rows.push(row);console.log(JSON.stringify(row));
 }
 // SECTION 03 — REPORT
 fs.mkdirSync('qc-results',{recursive:true});
 fs.writeFileSync('qc-results/live-byte-identity.json',JSON.stringify(rows,null,2));
 if(rows.some(r=>r.status!=='PASS'))process.exitCode=1;
})().catch(error=>{console.error(error);process.exit(1);});
