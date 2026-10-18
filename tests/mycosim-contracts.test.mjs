// Built-in Node test runner: fast, deterministic MycoSim source contracts.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const read=(p)=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('sandbox.html');
const files=['mycosim/digestion_immune.js','mycosim/molecular_process.js','mycosim/campaign.js','mycosim/science_glossary.js','mycosim/release_acceptance.js','mycosim/lab_workspace.js'];

test('MycoSim modules are mounted exactly once and in working order',()=>{
 const scripts=[...html.matchAll(/src="(mycosim\\/[^"?]+\\.js)\\?[^\"]*"/g)].map(x=>x[1]);
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
 assert.match(campaign,/handoff\\.entries\\.length!==7/);
 assert.match(campaign,/NO remote sync test/);
 assert.match(campaign,/launchTest\\("tv-biology"/);
 assert.match(campaign,/launchTest\\("tv-anatomy3d"/);
 assert.match(campaign,/launchTest\\("tv-molecular"/);
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
 assert.match(workspace,/element\\.hidden=group!==key/);
 assert.match(workspace,/element\\.inert=group!==key/);
 assert.match(read('mycosim/anatomy3d.js'),/!section\\.hidden/);
 assert.match(read('mycosim/trametes_sim.js'),/myco-specimen-pane/);
});

test('Production approval is not inferred from smoke tests',()=>{
 const release=read('mycosim/release_acceptance.js');
 assert.match(release,/Release gate: HOLD/);
 assert.match(release,/scientific or production certification/);
 assert.match(release,/checkbox/);
});
