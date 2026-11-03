'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const p='research/rutgers_r11_integration_acceptance_20261102.json';
const report=JSON.parse(fs.readFileSync(p,'utf8'));
const git=(...args)=>cp.execFileSync('git',args,{encoding:'utf8',maxBuffer:10*1024*1024}).trim();
const isAncestor=(ancestor,descendant)=>{try{cp.execFileSync('git',['merge-base','--is-ancestor',ancestor,descendant]);return true;}catch{return false;}};
assert.equal(report.pr_chain.length,10);
const chain=report.pr_chain;
for(let i=0;i<chain.length;i++){
 const stage=chain[i];
 assert.equal(stage.pr_number,i+34);
 assert.equal(stage.base_sha,i===0?report.main_verified_sha:chain[i-1].head_sha);
 assert.equal(git('rev-parse',stage.head_sha),stage.head_sha);
 assert(isAncestor(stage.base_sha,stage.head_sha),'Non-ancestor PR stack base R.'+(i+1));
 assert.equal(stage.pr_draft_verified,true);
 assert.equal(stage.pr_merged_verified,false);
}
assert(isAncestor(chain[0].base_sha,chain.at(-1).head_sha));
const changed=git('diff','--name-only',report.main_verified_sha,chain.at(-1).head_sha).split('\n').filter(Boolean);
const allowed=path=>path==='app.js'||path==='index.html'||path.startsWith('research/')||path.startsWith('tests/')||/^\.github\/workflows\/rutgers-r\d+-/.test(path);
for(const path of changed){assert(allowed(path),'Unexpected file in R1-R10 stack: '+path);assert(!path.startsWith('assets/'),'Media modified '+path);}
const verified=JSON.parse(fs.readFileSync('research/rutgers_r4_verified_originals_sha256_20261101.json','utf8'));
assert.equal(verified.records.length,26);
const ledger=JSON.parse(fs.readFileSync('research/rutgers_r9_source_heading_ledger_20261101.json','utf8'));
assert.deepEqual(ledger.sources.map(x=>[x.charts,x.normalized_unique]),[[422,420],[403,401]]);
const r10=JSON.parse(fs.readFileSync('research/rutgers_r10_reversible_registry_diff_20261101.json','utf8'));
assert.equal(r10.reversal.historical_records_changed,0);
assert.equal(report.decision.merge_authorized,false);assert.equal(report.decision.deployment_authorized,false);
assert.equal(report.decision.new_publication_authorized,false);
assert.equal(report.source_provenance.research_target_unverified,477);
assert.equal(report.source_provenance.physical_authenticated_voucher_count,null);
assert.equal(report.source_provenance.legacy_unsupported_id,'EN1-F1');
assert.deepEqual(report.source_provenance.bn5_chart_variants,['BN5-F8(A)','BN5-F8(B)','BN5-F8(C)']);
// Audit the immutable R11 checkpoint, not future stacked research-hardening commits.\nconst r11Paths=git('diff','--name-only',chain.at(-1).head_sha,'6850ab3c920a4264334af1876529eff8df407d19').split('\n').filter(Boolean);
for(const path of r11Paths)assert(path.startsWith('research/rutgers_r11_')||path.startsWith('tests/rutgers-r11-')||path==='.github/workflows/rutgers-r11-integration-acceptance.yml','R11 touched out-of-scope: '+path);
console.log('PASS R11 PR ancestry '+chain.length+', change allowlist '+changed.length+', rollback-safe new files '+r11Paths.length+', 26 original media, provenance publication HOLD');