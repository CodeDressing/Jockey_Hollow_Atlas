const assert=require('node:assert/strict');const fs=require('node:fs');
const x=JSON.parse(fs.readFileSync('research/rutgers_r6_field_voucher_traceability_20261101.json','utf8'));
const r4=JSON.parse(fs.readFileSync('research/rutgers_r4_verified_originals_sha256_20261101.json','utf8'));
const r5=JSON.parse(fs.readFileSync('research/rutgers_r5_voucher_authentication_matrix_20261101.json','utf8'));
assert.deepEqual(x.accessions.map(a=>a.id),['AN2-F10','AN2-F12','AN2-F22']);
assert.equal(x.sources.length,10);
assert.equal(r4.records.length,26);
assert.equal(x.accessions.reduce((s,a)=>s+a.photo_file_sha256_verified,0),26);
for(const a of x.accessions){
 assert.equal(a.primary_field_record_authenticated,false,'No invented field provenance for '+a.id);
 assert.equal(a.physical_container_label_authenticated,false,'No invented physical voucher for '+a.id);
 assert.equal(a.collector_identity,null);assert.equal(a.observer_identity,null);
 assert.equal(a.collection_date,null);assert.equal(a.collection_site,null);
 assert.equal(a.voucher_chain,'unresolved');assert.equal(a.rights,'unverified');
 assert(a.publication_gate.startsWith('HOLD'));
 for(const e of a.evidence)assert(x.sources.some(s=>s.id===e.source),'Unregistered source '+e.source);
}
assert.equal(x.release_checklist.new_publication_authorized,false);
assert.equal(x.release_checklist.production_merge_authorized,false);
assert.equal(r5.accessions.length,3);
assert.equal(x.accessions[2].microscopy,'not_performed_per_intake');
console.log('PASS R.6 accession evidence citations, chronology/collector uncertainty, release holds and 26-file preservation');
