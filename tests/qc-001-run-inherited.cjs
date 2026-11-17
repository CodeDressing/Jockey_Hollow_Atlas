// QC-001 ledger: 01 discovery; 02 independent execution; 03 durable results.
// SECTION 01 — DISCOVERY
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
fs.mkdirSync('qc-results',{recursive:true});
const selected=fs.readdirSync('tests').filter(p=>p.endsWith('.cjs')&&!p.startsWith('qc-001-'));
const results=[];
// SECTION 02 — INDEPENDENT EXECUTION
for(const file of selected){
 const start=Date.now();
 const run=spawnSync(process.execPath,['tests/'+file],{encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024});
 const log=(run.stdout||'')+'\n'+(run.stderr||'')+'\n'+(run.error?.message||'');
 fs.writeFileSync('qc-results/'+file+'.log',log);
 const row={file,status:run.status===0?'PASS':'FAIL',exit:run.status,seconds:(Date.now()-start)/1000,error:run.error?.message};
 results.push(row);console.log(JSON.stringify(row));
}
// SECTION 03 — DURABLE RESULTS
fs.writeFileSync('qc-results/inherited.json',JSON.stringify(results,null,2));
if(results.some(r=>r.status!=='PASS'))process.exitCode=1;
