// Built-in Node test runner: fast, deterministic MycoSim source contracts.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('sandbox.html');
const files=['mycosim/digestion_immune.js','mycosim/human_ingestion.js','mycosim/gut_brain.js','mycosim/absorption_circulation18.js','mycosim/molecular_process.js','mycosim/immune_signaling17.js','mycosim/campaign.js','mycosim/science_glossary.js','mycosim/release_acceptance.js','mycosim/lab_workspace.js'];

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
