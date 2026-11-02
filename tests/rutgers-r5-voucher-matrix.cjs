const assert=require('node:assert/strict');const fs=require('node:fs');const crypto=require('node:crypto');
const x=JSON.parse(fs.readFileSync('research/rutgers_r5_voucher_authentication_matrix_20261101.json','utf8'));
const r4=JSON.parse(fs.readFileSync('research/rutgers_r4_verified_originals_sha256_20261101.json','utf8'));
assert.equal(x.accessions.length,3);assert.deepEqual(x.accessions.map(x=>x.id),['AN2-F10','AN2-F12','AN2-F22']);
assert.equal(r4.records.length,26);assert.equal(x.no_merge_or_deploy,true);
const expected={ 'AN2-F10':0,'AN2-F12':23,'AN2-F22':3};
for(const a of x.accessions){assert.equal(a.photographs.matched_originals,expected[a.id]);assert.equal(a.field_voucher.status,'not_authenticated');assert.equal(a.release_gate.startsWith('hold'),true);assert.equal(a.scientific_determination,'unconfirmed');assert.equal(a.rights.publication_permission,'unverified');assert.equal(a.collector.name,null);assert.equal(a.observer.name,null);}
assert.deepEqual(x.publication_readiness.approved_for_new_publication,[]);
assert.equal(x.accessions[1].microscopy.confirmed_mature_basidiospores,false);
assert.equal(x.accessions[2].microscopy.validated_spore_measurements,false);
assert.equal(x.accessions[2].spore_print.status,'unavailable_user_report');
assert.equal(x.accessions[0].source_measurements.source_row_label,'AN2 F10');
assert.equal(x.accessions[1].source_measurements.source_row_label,'AN2 F12');
assert(x.source_register.every(s=>s.url.startsWith('https://')));
const rowcounts={};for(const r of r4.records){rowcounts[r.accession]=(rowcounts[r.accession]||0)+1;}
assert.equal(rowcounts['AN2-F12'],23);assert.equal(rowcounts['AN2-F22'],3);
assert(!fs.existsSync('assets/an2-f22/IMG_6086.jpg'),'F22 remains isolated on its existing draft branch');
console.log('PASS R.5 provenance, voucher uncertainty, 26-source SHA256 manifest and publication holds');