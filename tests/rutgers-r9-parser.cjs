'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {classify,parse}=require('../research/tools/rutgers_accession_boundary_parser.cjs');
const fixture=JSON.parse(fs.readFileSync('research/rutgers_r9_source_heading_ledger_20261101.json','utf8'));
const report=JSON.parse(fs.readFileSync('research/rutgers_r9_parser_validation_report_20261101.json','utf8'));
for(const s of fixture.sources){
 const full=s.entries.map(x=>classify(x.raw,x.line));
 assert(full.every(Boolean),'All accession-bearing lines classified');
 for(let i=0;i<full.length;i++)assert.equal(full[i].kind,s.entries[i].kind,'Line '+s.entries[i].line);
 const charts=full.filter(x=>x.kind==='strict_chart'||x.kind==='decorated_chart');
 assert.equal(charts.length,s.charts);
 assert.equal(charts.filter(x=>x.kind==='strict_chart').length,s.strict);
 assert.equal(charts.filter(x=>x.kind==='decorated_chart').length,s.decorated);
 assert.equal(full.filter(x=>x.kind==='microscopy_subheading').length,s.excluded);
 assert.equal(full.filter(x=>x.kind==='unclassified_accession_line').length,s.unclassified);
 assert.equal(new Set(charts.map(x=>x.accession)).size,s.normalized_unique);
 assert.equal(charts.filter(x=>x.accession==='EN1-F1').length,0);
 console.log('PASS '+s.source+' '+charts.length+' source chart lines / '+s.normalized_unique+' normalized accession IDs');
}
const cases=[
 ['BN5-F8(A)','decorated_chart','BN5-F8','A'],
 ['BN5-F8(B) ( Not tricholomopsis plantyphylla)','decorated_chart','BN5-F8','B'],
 ['BN5-F8(C)','decorated_chart','BN5-F8','C'],
 ['BN5-F25 ( laccaria ohiensis singer)','decorated_chart','BN5-F25',null],
 ['BN5-F8(B) microscopy image 1','microscopy_subheading','BN5-F8',null],
 ['BN5-F25 MICROSCOPY IMAGE PLATE — SPMV1–SPMV3','microscopy_subheading','BN5-F25',null],
 ['EN1-F11','strict_chart','EN1-F11',null],
 ['EN1-F1920','strict_chart','EN1-F1920',null],
 ['CN000-F2','strict_chart','CN000-F2',null],
 ['FN-F3','strict_chart','FN-F3',null]
];
for(const [raw,kind,accession,variant] of cases){const parsed=classify(raw,1);assert.equal(parsed.kind,kind,raw);assert.equal(parsed.accession,accession,raw);assert.equal(parsed.variant,variant,raw);assert.equal(parsed.authenticated_voucher,false);}
for(const raw of ['Some text EN1-F1','EN1-F1x','EN1-F11 stray prose','Other BN5-F8(A)','EN1-F1 microscopy image 2 is not standalone']){
 const candidate=classify(raw,1);assert(!candidate||candidate.kind!=='strict_chart',raw);
}
assert.equal(parse('BN5-F8(A)\nBN5-F8(B)\nBN5-F8(C)\nBN5-F8(B) microscopy image 1').chart_count,3);
assert.deepEqual(fixture.legacy_comparison.legacy_not_active_chart,['EN1-F1']);
assert.deepEqual(fixture.legacy_comparison.active_chart_not_legacy,[]);
assert.deepEqual([report.reconciliation.active_charts,report.reconciliation.active_distinct_normalized,report.reconciliation.legacy_active_candidates,report.reconciliation.historical_charts],[422,420,421,403]);
const sha=JSON.parse(fs.readFileSync('research/rutgers_r4_verified_originals_sha256_20261101.json','utf8'));
assert.equal(sha.records.length,26);
assert.equal(report.safeguards.media_sha256_records_preserved,26);
assert.equal(report.safeguards.public_release_authorized,false);
assert.equal(report.reconciliation.verified_independent_physical_vouchers,null);
console.log('PASS R.9 boundary fixtures, parser exclusions, historical differences and 26 original-media protections');
