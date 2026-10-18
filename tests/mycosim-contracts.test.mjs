// Built-in Node test runner: fast, deterministic MycoSim source contracts.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('sandbox.html');
const files=['mycosim/digestion_immune.js','mycosim/human_ingestion.js','mycosim/gut_brain.js','mycosim/absorption_circulation18.js','mycosim/neural_interface19.js','mycosim/neurochemistry20.js','mycosim/evidence21.js','mycosim/molecular_process.js','mycosim/immune_signaling17.js','mycosim/campaign.js','mycosim/science_glossary.js','mycosim/release_acceptance.js','mycosim/lab_workspace.js'];

test('MycoSim modules are mounted exactly once and in working order',()=>{
 const scripts=[...html.matchAll(/src="(mycosim\/[^"?]+\.js)\?[^\"]*"/g)].map(x=>x[1]);
 for(const path of files)assert.equal(scripts.filter(p=>p===path).length,1,path);
 assert.ok(scripts.indexOf('mycosim/lab_workspace.js')>scripts.indexOf('mycosim/release_acceptance.js'));
 assert.equal((html.match(/id="trametes-simulator"/g)||[]).length,1);
 assert.equal((html.match(/id="stage"/g)||[]).length,1);
 assert.equal((html.match(/id="tv-canvas"/g)||[]).length,1);
});

test('All classic educational scripts parse',()=>{
 for(const file of files)assert.doesNotThrow(()=>new Script(read(file),{filename:file}),file);
});

test('Seven Phase 11 research steps and hypothetical handoff remain protected',()=>{
 const campaign=read('mycosim/campaign.js');
 assert.match(campaign,/HYPOTHETICAL/);
 assert.match(campaign,/handoff\.entries\.length!==7/);
 assert.match(campaign,/NO remote sync test/);
 assert.match(campaign,/launchTest\("tv-biology"/);
 assert.match(campaign,/launchTest\("tv-anatomy3d"/);
 assert.match(campaign,/launchTest\("tv-molecular"/);
});

test('Oral consumption uncertainty remains explicitly disclosed',()=>{
 const biology=read('mycosim/digestion_immune.js');
 const molecular=read('mycosim/molecular_process.js');
 assert.match(biology,/not been shown/i);
 assert.match(molecular,/has not been established/i);
 assert.match(molecular,/NO patient benefit inferred/);
});

test('Glossary pronunciation and readback remain integrated',()=>{
 const glossary=read('mycosim/science_glossary.js');
 for(const term of ['Dectin-1','SYK','CARD9','BCL10','MALT1','hemITAM'])assert.ok(glossary.includes('"'+term+'"'),term);
 assert.match(glossary,/SpeechSynthesisUtterance/);
 assert.match(glossary,/MutationObserver/);
});

test('Consolidation hides inactive modules without deleting original models',()=>{
 const workspace=read('mycosim/lab_workspace.js');
 for(const id of ['tv-biology','tv-anatomy3d','tv-molecular','myco-campaign','myco-acceptance'])assert.ok(workspace.includes(id),id);
 assert.match(workspace,/element\.hidden=group!==key/);
 assert.match(workspace,/element\.inert=group!==key/);
 assert.match(read('mycosim/anatomy3d.js'),/!section\.hidden/);
 assert.match(read('mycosim/trametes_sim.js'),/myco-specimen-pane/);
});

test('Production approval is not inferred from smoke tests',()=>{
 const release=read('mycosim/release_acceptance.js');
 assert.match(release,/Release gate: HOLD/);
 assert.match(release,/scientific or production certification/);
 assert.match(release,/checkbox/);
});


test('Phase 15 reuses original digestion and anatomy with explicit absorption uncertainty',()=>{
 const module=read('mycosim/human_ingestion.js');
 assert.match(module,/getElementById\("tv-biology"\)/);
 assert.match(module,/getElementById\("tv-anatomy3d"\)/);
 assert.match(module,/HYPOTHETICAL/);
 assert.match(module,/PSK or PSP/);
 assert.match(module,/SpeechSynthesisUtterance/);
 assert.match(module,/Phase 15 browser checks:/);
 assert.match(module,/const INGESTION_STAGES=/);
 const stages=JSON.parse(module.match(/const INGESTION_STAGES=(\[[^\n]+\]);/)[1]);
 assert.equal(stages.length,7);
 assert.ok(stages.every(stage=>stage.enzyme&&stage.barrier&&stage.fate&&stage.evidence&&stage.definition&&stage.pron));
 const glossary=read('mycosim/science_glossary.js');
 for(const term of ['Amylase','Pepsin','Bioaccessibility','Bioavailability','Enterocyte','SCFA'])assert.ok(glossary.includes('"'+term+'"'));
});

test('Phase 16 extends the ingestion system and protects neural-claim limits',()=>{
 const module=read('mycosim/gut_brain.js');
 assert.match(module,/getElementById\("myco-ingestion-lab"\)/);
 assert.match(module,/getElementById\("tv-anatomy3d"\)/);
 assert.match(module,/HYPOTHETICAL/);
 assert.match(module,/NOT established/);
 assert.match(module,/SpeechSynthesisUtterance/);
 assert.match(module,/Phase 16 browser checks:/);
 const stages=JSON.parse(module.match(/const MICROBIOME_STAGES=(\[[^\n]+\]);/)[1]);
 assert.equal(stages.length,7);
 assert.ok(stages.every(s=>s.name&&s.structure&&s.organism&&s.metabolite&&s.barrier&&s.axis&&s.evidence&&s.definition&&s.pron));
 const glossary=read('mycosim/science_glossary.js');
 for(const term of ['Butyrate','Propionate','Acetate','Enteric nervous system','Vagus nerve','Blood–brain barrier'])assert.ok(glossary.includes('"'+term+'"'),term);
});

test('Phase 17 extends existing molecular lab and preserves mechanistic uncertainty',()=>{
 const module=read('mycosim/immune_signaling17.js');
 assert.match(module,/getElementById\("tv-molecular"\)/);
 assert.match(module,/getElementById\("tv-anatomy3d"\)/);
 assert.match(module,/Dectin-1/);
 assert.match(module,/CARD9/);
 assert.match(module,/BCL10/);
 assert.match(module,/MALT1/);
 assert.match(module,/SYK/);
 assert.match(module,/HYPOTHETICAL/);
 assert.match(module,/SpeechSynthesisUtterance/);
 assert.match(module,/Phase 17 browser checks:/);
 const stages=JSON.parse(module.match(/const IMMUNE_STEPS=(\[[^\n]+\]);/)[1]);
 assert.equal(stages.length,8);
 assert.ok(stages.every(x=>x.mechanism&&x.evidence&&x.term&&x.pron&&x.definition));
 const glossary=read('mycosim/science_glossary.js');
 for(const term of ['Macrophage','Dendritic cell','Phosphorylation','Antigen presentation'])assert.ok(glossary.toLowerCase().includes('"'+term.toLowerCase()+'"'),term);
});

test('Phase 18 preserves earlier models and flags uncertain absorption and brain exposure',()=>{
 const module=read('mycosim/absorption_circulation18.js');
 assert.match(module,/getElementById\("myco-ingestion-lab"\)/);
 for(const term of ['myco-microbiome','myco-immune17','tv-anatomy3d','HYPOTHETICAL','PSK\/PSP','SpeechSynthesisUtterance','Phase 18 browser checks:'])assert.ok(module.includes(term),term);
 const stages=JSON.parse(module.match(/const CIRCULATION_STAGES=(\[[^\n]+\]);/)[1]);
 assert.equal(stages.length,7);
 assert.ok(stages.every(s=>s.where&&s.mechanism&&s.barrier&&s.fate&&s.evidence&&s.term&&s.pron&&s.definition));
 const glossary=read('mycosim/science_glossary.js').toLowerCase();
 for(const term of ['Hepatocyte','Cytochrome P450','Clearance','Elimination','Hepatic portal vein'])assert.ok(glossary.includes('"'+term.toLowerCase()+'"'),term);
});

test('Phase 19 neural interface is integrated and preserves causal uncertainties',()=>{
 const src=read('mycosim/neural_interface19.js');
 for(const item of ['myco-microbiome','myco-ingestion-lab','myco-immune17','myco-circulation18','tv-anatomy3d','HYPOTHETICAL','NOT TESTED','SpeechSynthesisUtterance','Phase 19 browser checks:'])assert.ok(src.includes(item),item);
 const steps=JSON.parse(src.match(/const NEURAL19_STEPS=(\[[^\n]+\]);/)[1]);
 assert.equal(steps.length,8);
 assert.ok(steps.every(s=>s.title&&s.mechanism&&s.barrier&&s.evidence&&s.term&&s.pron&&s.definition));
 const glossary=read('mycosim/science_glossary.js').toLowerCase();
 for(const term of ['Nucleus tractus solitarius','Enteroendocrine cell','Neurovascular unit','Hypothalamus','Pharmacodynamics'])assert.ok(glossary.includes('"'+term.toLowerCase()+'"'),term);
});

test('Phase 20 neurochemistry retains molecular anatomy and grades fungal evidence',()=>{
 const module=read('mycosim/neurochemistry20.js');
 for(const word of ['tv-molecular','myco-neural19','myco-immune17','tv-anatomy3d','SpeechSynthesisUtterance','Phase 20 browser checks:'])assert.ok(module.includes(word),word);
 const steps=JSON.parse(module.match(/const NEURO20_STEPS=(\[[^\n]+\]);/)[1]);
 const compounds=JSON.parse(module.match(/const LION20_EVIDENCE=(\[[^\n]+\]);/)[1]);
 assert.equal(steps.length,8);assert.equal(compounds.length,4);
 assert.ok(steps.every(s=>s.mechanism&&s.role&&s.evidence&&s.term&&s.pron&&s.definition));
 assert.ok(compounds.every(c=>c.preparation&&c.mechanism&&c.evidence));
 assert.ok(compounds.some(c=>c.evidence.includes('Limited, heterogeneous human trials')));
 const glossary=read('mycosim/science_glossary.js').toLowerCase();
 for(const term of ['NMDA','AMPA','GABA','BDNF','Hericenones','Erinacines'])assert.ok(glossary.includes('"'+term.toLowerCase()+'"'),term);
});


test('Phase 21 reference ledger has valid provenance and no false clinical extrapolations',()=>{
 const src=read('mycosim/evidence21.js');
 const references=JSON.parse(src.match(/const EVIDENCE21_SOURCES=(\[[^\n]+\]);/)[1]);
 const claims=JSON.parse(src.match(/const EVIDENCE21_CLAIMS=(\[[^\n]+\]);/)[1]);
 assert.equal(references.length,4);
 assert.ok(claims.length>=6);
 const ids=new Set(references.map(s=>s.id));
 assert.equal(ids.size,references.length);
 for(const s of references){
  assert.match(s.url,/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/[0-9]+\/$/);
  assert.ok(/^\d+$/.test(s.pmid));
  if(s.doi)assert.match(s.doi,/^10\.[0-9]{4,9}\//);
 }
 for(const c of claims){
  assert.ok(c.phase>=15&&c.phase<=20);
  assert.ok(c.grade&&c.limit);
  assert.ok(c.source_ids.every(id=>ids.has(id)));
  if(c.grade==='unverified-hypothesis')assert.equal(c.source_ids.length,0);
 }
 assert.match(src,/remote_sync:false/);
 assert.match(src,/human_signoff:false/);
 assert.match(src,/SHA-256/);
 assert.match(src,/manual-local-JSON-only/);
 assert.match(src,/replaceChildren\(\)/);
});


test('Phase 22 tissue structures reuse the existing anatomy renderer',()=>{
 const src=read('mycosim/anatomy3d.js');
 for(const label of ['villus','junction','vessel','hepatocyte','macrophage','neuron','synapse'])assert.ok(src.includes('["'+label+'"'),label);
 assert.match(src,/function buildTissue\(\)/);
 assert.match(src,/else if\(mode==="tissue"\)buildTissue\(\)/);
 assert.ok(src.includes('data-mode=\\\"tissue\\\"')||src.includes('data-mode="tissue"'));
 assert.match(src,/anatomy22-run/);
 assert.match(src,/Phase 22 browser checks:/);
 assert.match(src,/NOT TO SCALE/);
 assert.match(src,/renderer\.setPixelRatio\(Math\.min\(window\.devicePixelRatio\|\|1,1\.5\)\)/);
 assert.match(src,/releaseGeometry\(\)/);
 assert.match(src,/geometrySet\.size===geo/);
 assert.equal((src.match(/new THREE\.WebGLRenderer\(/g)||[]).length,1);
 assert.match(read('sandbox.html'),/anatomy3d\.js\?v=phase25-fidelity-20261018/);
});


test('Phase 23 microanatomy is selectable within one retained WebGL renderer',()=>{
 const src=read('mycosim/anatomy3d.js');
 const labels=['bilayer','nucleus23','mitochondrion','er','tight23','dectin23','syk23','axon23','synapse23'];
 for(const id of labels)assert.ok(src.includes('["'+id+'"'),id);
 assert.match(src,/function buildMicro\(\)/);
 assert.match(src,/else \{buildMicro\(\);makeDynamics24Particles\(\);\}/);
 assert.match(src,/anatomy23-run/);
 assert.match(src,/Phase 23 browser checks:/);
 assert.match(src,/NOT TO SCALE/);
 for(const mag of ['overview','cell','molecular'])assert.ok(src.includes('data-mag="'+mag+'"'),mag);
 assert.equal((src.match(/new THREE\.WebGLRenderer\(/g)||[]).length,1);
 assert.equal((src.match(/<canvas /g)||[]).length,1);
 assert.match(read('sandbox.html'),/anatomy3d\.js\?v=phase25-fidelity-20261018/);
});


test('Phase 24 controlled signaling uses existing scene loop and preserves scientific limits',()=>{
 const src=read('mycosim/anatomy3d.js');
 const data=JSON.parse(src.match(/const DYNAMICS24=(\[[^\n]+\]);/)[1]);
 assert.equal(data.length,7);
 for(const id of ['dectin','syk','barrier','nmda','ampa','gaba','vesicle'])assert.ok(data.some(p=>p.id===id),id);
 assert.ok(data.every(p=>p.steps.length===3&&p.steps.every(st=>st.length===5&&st.every(Boolean))));
 assert.ok(data.every(p=>p.evidence&&p.target&&p.from.length===3&&p.to.length===3));
 assert.match(src,/function updateDynamics24Particles\(\)/);
 assert.match(src,/function renderDynamics24\(\)/);
 assert.match(src,/dynamics24LastFrame/);
 assert.match(src,/prefers-reduced-motion: reduce/);
 assert.match(src,/dynamics24-progress/);
 assert.match(src,/dynamics24-read/);
 assert.match(src,/SpeechSynthesisUtterance/);
 assert.match(src,/MycoSimMotion24=Object\.freeze/);
 assert.match(src,/NOT molecular dynamics/);
 assert.equal((src.match(/new THREE\.WebGLRenderer\(/g)||[]).length,1);
 assert.equal((src.match(/raf=requestAnimationFrame\(loop\)/g)||[]).length,1);
 assert.match(read('sandbox.html'),/anatomy3d\.js\?v=phase25-fidelity-20261018/);
});


test('Phase 25 fidelity upgrades preserve one existing renderer, measured limits and evidence warnings',()=>{
 const src=read('mycosim/anatomy3d.js');
 assert.equal((src.match(/new THREE\.WebGLRenderer\(/g)||[]).length,1);
 assert.equal((src.match(/raf=requestAnimationFrame\(loop\)/g)||[]).length,1);
 assert.match(src,/ACESFilmicToneMapping/);
 assert.match(src,/FogExp2/);
 assert.match(src,/function updateFidelity25\(\)/);
 assert.match(src,/new THREE\.DirectionalLight\(0x85bdde/);
 assert.match(src,/renderer\.setPixelRatio\(Math\.min\(window\.devicePixelRatio\|\|1,1\.5\)\)/);
 assert.match(src,/anatomy25-qa/);
 assert.match(src,/Phase 25 browser checks:/);
 assert.match(src,/NOT TO SCALE/);
 assert.match(src,/NOT molecular dynamics/);
 assert.match(src,/resource accounting stable/i);
 assert.match(read('sandbox.html'),/anatomy3d\.js\?v=phase25-fidelity-20261018/);
});
