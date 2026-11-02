'use strict';
// Read-only research reconciliation. No changes to historical masters, public Atlas, or vouchers.
const fs=require('node:fs');
const crypto=require('node:crypto');
const {classify}=require('./rutgers_accession_boundary_parser.cjs');
const sha=x=>crypto.createHash('sha256').update(Buffer.from(JSON.stringify(x),'utf8')).digest('hex');
const sorted=a=>[...a].sort((x,y)=>x.localeCompare(y,'en'));
function reconcile(ledger,legacy){
 const main=ledger.sources.find(x=>x.source==='ACTIVE'),historical=ledger.sources.find(x=>x.source==='REV403');
 if(!main||!historical||!legacy||!Array.isArray(legacy.records))throw Error('Missing original source evidence');
 function chartSet(source){
  const classified=source.entries.map(e=>{
   const v=classify(e.raw,e.line);
   if(!v||v.accession!==e.accession||v.kind!==e.kind)throw Error('Source ledger/parser disagreement at '+source.source+':'+e.line);
   return v;
  });
  const charts=classified.filter(e=>e.kind==='strict_chart'||e.kind==='decorated_chart');
  const exclusions=classified.filter(e=>e.kind==='microscopy_subheading');
  if(classified.some(e=>e.kind==='unclassified_accession_line'))throw Error('Unclassified accession line: '+source.source);
  return {charts,exclusions,ids:sorted(new Set(charts.map(c=>c.accession)))};
 }
 const active=chartSet(main),old=chartSet(historical);
 const candidates=sorted(new Set(legacy.records.map(x=>x.canonical_candidate_id)));
 const legacyActive=sorted(new Set(legacy.records.filter(x=>x.present_in_active).map(x=>x.canonical_candidate_id)));
 if(candidates.length!==423||legacyActive.length!==421)throw Error('Unanticipated historical matrix counts');
 if(active.charts.length!==422||active.ids.length!==420||old.charts.length!==403||old.ids.length!==401)throw Error('Unexpected source chart count');
 const activeIDs=new Set(active.ids),candidateIDs=new Set(candidates);
 const missingFromCurrent=legacyActive.filter(id=>!activeIDs.has(id));
 const missingFromHistory=active.ids.filter(id=>!legacyActive.includes(id));
 const variant=active.charts.filter(e=>e.variant);
 const manifest={
  schema:'rutgers-r10-reversible-registry-diff-v1',
  read_only:true,
  inputs:{active_source_url:main.url,historical_source_url:historical.url,fieldmaster_source:'feature/fieldmaster-477-evidence-20261022:research/fieldmaster_deo_2_1_canonical_reconciliation_20261023.json',ledger_sha256:sha(ledger),legacy_records_sha256:sha(legacy.records)},
  before:{legacy_active_ids:421,legacy_candidate_ids:423,verified_unique_biological_vouchers:null},
  after:{active_document_charts:active.charts.length,normalized_active_accession_strings:active.ids.length,historical_document_charts:old.charts.length,historical_normalized_strings:old.ids.length,verified_unique_biological_vouchers:null},
  differences:{unsupported_legacy_active_ids:missingFromCurrent,new_canonical_active_ids:missingFromHistory,external_candidate_ids:candidates.filter(id=>!candidateIDs.has(id)||!activeIDs.has(id)&&!legacyActive.includes(id)),chart_variants:variant.map(x=>({line:x.line,raw:x.raw,accession:x.accession,variant:x.variant})),microscopy_subheadings:active.exclusions.map(x=>({line:x.line,raw:x.raw}))},
  proposed_actions:[{op:'mark_unsupported',id:'EN1-F1',condition:'Original contemporary accession record independently verified before any change to historic register'},{op:'retain_chart_variant',accession:'BN5-F8',variants:['A','B','C'],condition:'Chart boundaries do not represent independently authenticated specimens'}],
  rollback:{strategy:'remove only R10 generated files and isolated branch; R1-R9/history/pr19 remain untouched',mutations_applied:0},
  gates:{target_477_verified:false,original_26_sha256_preserved:true,original_media_modified:false,historic_matrix_mutated:false,species_or_voucher_promoted:false,publication_authorized:false,merge_or_deploy_authorized:false}
 };
 if(missingFromCurrent.join(',')!=='EN1-F1'||missingFromHistory.length)throw Error('Unexpected candidate mismatch');
 if(variant.length!==3||active.exclusions.length!==5)throw Error('Variants or image subheadings changed');
 return manifest;
}
if(require.main===module){
 const ledger=JSON.parse(fs.readFileSync('research/rutgers_r9_source_heading_ledger_20261101.json','utf8'));
 const legacy=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 process.stdout.write(JSON.stringify(reconcile(ledger,legacy),null,2)+'\n');
}
module.exports={reconcile};
