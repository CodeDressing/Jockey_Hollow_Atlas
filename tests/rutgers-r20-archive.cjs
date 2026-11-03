'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const d=JSON.parse(fs.readFileSync('research/rutgers_r20_archival_view_reconciliation_20261103.json','utf8'));
const prior=JSON.parse(fs.readFileSync('research/rutgers_r19_primary_gap_resolution_20261103.json','utf8'));
const r17=JSON.parse(fs.readFileSync('research/rutgers_r17_photo_voucher_crosswalk_20261102.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('research/rutgers_r4_verified_originals_sha256_20261101.json','utf8'));
assert.equal(d.schema,'rutgers-r20-archival-view-reconciliation-v1');
assert.equal(d.baseline.commit,'b29cc9c85443720cf18a78aeb5b40e0dadd32b31');
const p=d.preservation;
assert.deepEqual([p.active_chart_sections,p.normalized_active_ids,p.historical_active_tokens,p.cross_source_candidate_tokens],[422,420,421,423]);
assert.equal(p.historical_477_verified,false);
assert.deepEqual(p.bn5_f8_chart_variants,['BN5-F8(A)','BN5-F8(B)','BN5-F8(C)']);
assert.equal(p.en1_f1_active_voucher_authenticated,false);
assert.equal(manifest.records.length,26);
assert.equal(d.reconciliation.prior_original_media_manifest_count,26);
assert.equal(d.reconciliation.prior_original_manifest_unique_hashes,26);
assert.equal(d.reconciliation.unique_archival_sha256,6);
assert.equal(d.reconciliation.archival_shas_matching_prior_manifest,0);
assert.equal(d.reconciliation.media_added_to_repo,0);
assert.equal(d.reconciliation.prior_original_files_modified,0);
assert.equal(d.reconciliation.drive_object_ids,10);
assert.equal(d.archive.length,6);
const checks=new Set(manifest.records.map(x=>x.drive_sha256));
assert.equal(checks.size,26);
const allIds=d.archive.flatMap(x=>x.drive_ids);
assert.equal(allIds.length,10);
assert.equal(new Set(allIds).size,10);
assert.equal(new Set(d.archive.map(x=>x.sha256)).size,6);
for(const a of d.archive){
 assert.match(a.sha256,/^[0-9a-f]{64}$/);
 assert.equal(a.manifest_sha256_match,false);
 assert(!checks.has(a.sha256));
 assert.deepEqual(a.drive_ids.length,a.accession==='AN2-F22'?1:2);
 if(a.view==='V2'){
  const prev=prior.new_evidence.find(x=>x.accession===a.accession);
  assert(prev);
  assert.equal(a.sha256,prev.local_sha256);
  assert.deepEqual(a.drive_ids,prev.drive_object_ids);
  assert.deepEqual(a.jpeg_px,[2048,1536]);
  assert.equal(a.exif_tags,0);
  if(a.drive_ids.length===2){assert.equal(a.independent_pair_sha256,'verified_r20');assert.equal(a.byte_comparison_exit,0);}
 } else {
  const v=r17.binary_checks.find(x=>x.accession===a.accession);
  assert(v);
  assert.equal(a.sha256,v.sha256_each);
  assert.deepEqual(a.drive_ids,v.ids);
 }
}
assert.equal(d.reconciliation.biological_specimens_inferred_from_images,null);
for(const k of ['collector','observer','collection_date','physical_custody_chain','photographer','permission_for_publication'])assert.equal(d.primary_evidence[k],null);
for(const k of ['new_primary_vouchers_authenticated','collector_observer_attributions','photo_rights_licenses','new_species_determinations']) assert.equal(d.gates[k],0);
for(const k of ['physical_voucher','collection_chronology','image_rights','public_release'])assert.equal(d.gates[k],'HOLD');
for(const k of ['merge','deploy','paid_services'])assert.equal(d.gates[k],false);
const changes=cp.execFileSync('git',['diff','--name-only',d.baseline.commit,'HEAD'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const path of changes)assert(/^research\/rutgers_r20_/.test(path)||/^tests\/rutgers-r20-/.test(path)||path==='.github/workflows/rutgers-r20-archive.yml','Out-of-scope file: '+path);
console.log('PASS R20: 10 archival Drive IDs, 6 unique digests, duplicate V2 identity, 26 original media, preservation and rights holds');
