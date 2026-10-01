const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const median=a=>{
  if(!a.length)return null;
  const s=[...a].sort((x,y)=>x-y),m=Math.floor(s.length/2);
  return s.length%2?s[m]:(s[m-1]+s[m])/2;
};
const sd=a=>{
  if(a.length<2)return null;
  const m=mean(a);
  return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1));
};

export function newSporeMeasurement(){
  return {
    length_um:"",
    width_um:"",
    provenance:"",
    evidence_state:"observed",
    source_image:"",
    source_annotation:"",
    notes:""
  };
}

export function validateSporeMeasurement(m){
  const errors=[];
  const L=Number(m.length_um),W=Number(m.width_um);
  if(m.evidence_state==="observed"){
    if(!Number.isFinite(L)||L<=0)errors.push("valid spore length required");
    if(!Number.isFinite(W)||W<=0)errors.push("valid spore width required");
  }
  if(!["observed","failed","inconclusive","not_examined"].includes(m.evidence_state))errors.push("invalid evidence state");
  return {valid:errors.length===0,errors};
}

export function summarizeSpores(rows=[]){
  const valid=rows.filter(r=>r.evidence_state==="observed" && validateSporeMeasurement(r).valid)
    .map(r=>({L:Number(r.length_um),W:Number(r.width_um),Q:Number(r.length_um)/Number(r.width_um)}));
  const L=valid.map(x=>x.L),W=valid.map(x=>x.W),Q=valid.map(x=>x.Q);
  const stat=a=>a.length?{
    n:a.length,
    min:Math.min(...a),
    max:Math.max(...a),
    mean:mean(a),
    median:median(a),
    sd:sd(a)
  }:null;
  return {
    count_total:rows.length,
    count_observed:valid.length,
    count_failed:rows.filter(r=>r.evidence_state==="failed").length,
    count_inconclusive:rows.filter(r=>r.evidence_state==="inconclusive").length,
    length_um:stat(L),
    width_um:stat(W),
    q_ratio:stat(Q),
    provenance_complete:valid.length?rows.filter(r=>r.evidence_state==="observed").every(r=>String(r.provenance||"").trim().length>0):false
  };
}

export function formatStat(s,digits=2){
  if(!s)return "No observed measurements";
  const f=x=>Number.isFinite(x)?x.toFixed(digits):"—";
  return `n=${s.n}; range ${f(s.min)}–${f(s.max)}; mean ${f(s.mean)}; median ${f(s.median)}; SD ${f(s.sd)}`;
}
