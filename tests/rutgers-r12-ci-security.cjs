'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const cp=require('node:child_process');
const audit=JSON.parse(fs.readFileSync('research/rutgers_r12_ci_security_audit_20261102.json','utf8'));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
assert.equal(pkg.private,true);
assert.equal(pkg.devDependencies.playwright,'1.56.1');
assert.equal(lock.lockfileVersion,3);
assert.equal(lock.packages['node_modules/playwright'].version,'1.56.1');
assert.equal(lock.packages['node_modules/playwright-core'].version,'1.56.1');
for(const name of ['playwright','playwright-core'])assert(/^sha512-[A-Za-z0-9+/]+=*$/.test(lock.packages['node_modules/'+name].integrity));
const workflows=fs.readdirSync('.github/workflows').filter(x=>/^rutgers-r\d+-.*\.yml$/.test(x)).sort();
assert.equal(workflows.length,12,'R1-R12 workflow count drift');
for(const file of workflows){
 const content=fs.readFileSync('.github/workflows/'+file,'utf8');
 assert(content.includes('permissions:\n  contents: read'),'Missing least-privilege token '+file);
 assert(!/pull_request_target\s*:|workflow_run\s*:|secrets\.|permissions:\s*write|contents:\s*write|id-token:\s*write|deploy|render\.com|curl\s+.*\|\s*(?:bash|sh)|npm install --no-save/i.test(content),'Forbidden sensitive/release pattern in '+file);
 for(const line of content.split('\n')){
  if(line.trim().startsWith('- uses:')){
    assert(/^- uses: actions\/(?:checkout@3d3c42e5aac5ba805825da76410c181273ba90b1|setup-node@820762786026740c76f36085b0efc47a31fe5020)/.test(line.trim()),'Unverified action ref '+file+' '+line);
  }
 }
 assert(content.includes('npm ci --ignore-scripts --no-audit --no-fund'),'Unpinned npm install '+file);
 assert(!content.includes('npm install --no-save'),'Unlocked dependency in '+file);
}
const rawChanged=cp.execFileSync('git',['diff','--name-only',audit.base,'HEAD'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const file of rawChanged){
 const allowed=file==='package.json'||file==='package-lock.json'||/^\.github\/workflows\/rutgers-r\d+-.*\.yml$/.test(file)||/^research\/rutgers_r12_/.test(file)||/^tests\/rutgers-r12-/.test(file);
 assert(allowed,'Out-of-scope R12 change '+file);
 assert(!file.startsWith('assets/'),'Original media changed');
}
const original=JSON.parse(fs.readFileSync('research/rutgers_r4_verified_originals_sha256_20261101.json','utf8'));
assert.equal(original.records.length,26);
const prior=JSON.parse(fs.readFileSync('research/rutgers_r11_integration_acceptance_20261102.json','utf8'));
assert.deepEqual([prior.source_provenance.active_master_charts,prior.source_provenance.active_normalized_id_strings,prior.source_provenance.legacy_active_tokens,prior.source_provenance.cross_source_candidate_tokens,prior.source_provenance.research_target_unverified],[422,420,421,423,477]);
assert.equal(audit.gates.production_release,'HOLD');
assert.equal(audit.gates.new_publication,'HOLD');
console.log('PASS Rutgers R12 security/immutable actions and npm lock checks: '+workflows.length+' workflows, '+rawChanged.length+' allowlisted changes, 26 source originals');
