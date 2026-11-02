'use strict';
// Research-only Rutgers heading parser. Chart count does not certify independent physical specimens.
const PREFIX='(?:AN[23]|BN[12456]|CN(?:000|[1246])|EN[13]|FN|IS|JN[125])';
const LEAD=new RegExp('^('+PREFIX+')-F(\\d+)(.*)$','i');
const EXACT=new RegExp('^('+PREFIX+')-F(\\d+)$','i');
const VARIANT=/^\(([A-Z])\)(?:\s+\(([^)]*)\))?$/i;
const PAREN=/^\(([^)]*)\)$/;
function classify(line,lineNumber){
 const raw=line.trim();
 const match=LEAD.exec(raw);
 if(!match)return null;
 const accession=match[1].toUpperCase()+'-F'+Number(match[2]);
 const suffix=match[3].trim();
 if(EXACT.test(raw))return {line:lineNumber,raw,accession,kind:'strict_chart',variant:null,authenticated_voucher:false};
 if(/microscopy image|microscopy image plate|spmv/i.test(suffix))return {line:lineNumber,raw,accession,kind:'microscopy_subheading',variant:null,authenticated_voucher:false};
 const variant=VARIANT.exec(suffix);
 if(variant)return {line:lineNumber,raw,accession,kind:'decorated_chart',variant:variant[1].toUpperCase(),annotation:variant[2]||null,authenticated_voucher:false};
 const note=PAREN.exec(suffix);
 if(note)return {line:lineNumber,raw,accession,kind:'decorated_chart',variant:null,annotation:note[1],authenticated_voucher:false};
 return {line:lineNumber,raw,accession,kind:'unclassified_accession_line',variant:null,authenticated_voucher:false};
}
function parse(text){
 const entries=String(text).split(/\r?\n/).flatMap((line,i)=>{const x=classify(line,i+1);return x?[x]:[]});
 const charts=entries.filter(x=>x.kind==='strict_chart'||x.kind==='decorated_chart');
 return {charts,excluded:entries.filter(x=>x.kind==='microscopy_subheading'),unclassified:entries.filter(x=>x.kind==='unclassified_accession_line'),strict_count:charts.filter(x=>x.kind==='strict_chart').length,decorated_count:charts.filter(x=>x.kind==='decorated_chart').length,chart_count:charts.length,distinct_normalized_accessions:[...new Set(charts.map(x=>x.accession))].sort()};
}
module.exports={classify,parse};
