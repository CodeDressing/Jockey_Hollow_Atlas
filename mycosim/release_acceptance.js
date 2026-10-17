// MycoSim Phase 13: local diagnostics plus independently acknowledged human release gates.
const REQUIREMENTS=["Desktop scrolling and overlap visually reviewed","Mobile scrolling and responsive layout visually reviewed","Keyboard and real screen-reader navigation reviewed","Scientific pathway and oral-exposure claims reviewed by a qualified reviewer","3D anatomical proportions and labels reviewed","Extended rendering and memory use examined","Render deployment commit and asset loading verified","Neural Atlas link verified; synchronization status clearly disclosed"];

const host=document.getElementById("trametes-simulator");
if(host&&!document.getElementById("myco-acceptance")){
const panel=document.createElement("section");panel.id="myco-acceptance";
panel.style.cssText="margin:18px 0;padding:16px;border:1px solid #6a857b;border-radius:12px;background:#0e1d1f;color:#eef4ed";
panel.innerHTML='<h2>Phase 13 — Final Acceptance Station</h2><p class="copy">Run measurable browser diagnostics, then separately record visual, accessibility, scientific, endurance, and deployment review. A smoke-test pass is not a scientific or production certification.</p><button id="accept-run" type="button">Run 20-second acceptance diagnostics</button> <button id="accept-copy" type="button">Copy acceptance report</button><pre id="accept-log" role="status" style="white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.5 monospace;background:#081417;border:1px solid #415b56;border-radius:8px;padding:12px;max-height:400px;overflow:auto">Not run. Release gate: HOLD.</pre><h3>Required human reviews</h3><div id="accept-manual"></div><p id="accept-status" aria-live="polite">Release gate: HOLD</p>';
host.append(panel);
const manual=panel.querySelector("#accept-manual"),boxes=[];
REQUIREMENTS.forEach(item=>{
 const label=document.createElement("label");label.style.cssText="display:flex;align-items:flex-start;gap:9px;margin:8px 0;font-size:12px;line-height:1.5";
 const box=document.createElement("input");box.type="checkbox";box.style.marginTop="3px";boxes.push(box);
 const text=document.createElement("span");text.textContent=item;label.append(box,text);manual.append(label);
});
const log=panel.querySelector("#accept-log"),status=panel.querySelector("#accept-status"),button=panel.querySelector("#accept-run");
let technical=false,executed=false,running=false,report="Not run. Release gate: HOLD.";
function update(){const count=boxes.filter(b=>b.checked).length;status.textContent=(technical&&executed&&count===boxes.length?"Recorded acceptance conditions met; independent release approval still required.":"Release gate: HOLD")+"  Human signoffs: "+count+"/"+boxes.length;}
boxes.forEach(b=>b.addEventListener("change",update));
const measure=async()=>{
 if(running)return;running=true;button.disabled=true;technical=false;executed=false;log.textContent="Testing: please leave the tab visible for 20 seconds.";
 const results=[],test=(title,pass,detail="")=>results.push({title,pass:Boolean(pass),detail});
 try{
 const workspace=document.querySelector(".workspace-row"),stage=document.querySelector(".stage-wrap");
 test("Workspace stage scoped to row",!!workspace&&!!stage&&workspace.contains(stage));
 test("All education modules mounted",["tv-biology","tv-anatomy3d","tv-molecular","myco-campaign","myco-science-terms"].every(id=>!!document.getElementById(id)));
 test("No duplicate main canvas",document.querySelectorAll("#stage").length===1);
 test("No page horizontal overflow",document.documentElement.scrollWidth<=window.innerWidth+12,String(document.documentElement.scrollWidth)+" / "+window.innerWidth+" px");
 const webgl=document.getElementById("tv-anatomy-canvas");
 test("3D anatomy canvas visible dimensions",!!webgl&&webgl.clientWidth>0&&webgl.clientHeight>0);
 const missing=[...document.querySelectorAll("#trametes-simulator button")].filter(b=>!b.textContent.trim()&&!b.getAttribute("aria-label")&&!b.title);
 test("Buttons have accessible names",missing.length===0,String(missing.length)+" missing");
 test("Scientific warnings mounted",!!document.querySelector("#tv-biology .bio-alert")&&!!document.querySelector("#tv-molecular .m-warning"));
 test("Reduced-motion CSS exists",!!document.querySelector("#tv-molecular style")?.textContent.includes("prefers-reduced-motion"));
 let interrupted=false;const frames=[],now=performance.now();
 await new Promise(resolve=>{
  function tick(t){if(document.hidden){interrupted=true;resolve();return;}frames.push(t);if(t-now>=20000){resolve();return;}requestAnimationFrame(tick);}
  requestAnimationFrame(tick);
 });
 const elapsed=(frames.at(-1)||performance.now())-(frames[0]||now);
 const diffs=frames.slice(1).map((n,i)=>n-frames[i]);
 const avg=diffs.length?diffs.reduce((a,b)=>a+b,0)/diffs.length:Infinity;
 test("Foreground session uninterrupted",!interrupted);
 test("20-second observation window",elapsed>=19000,(elapsed/1000).toFixed(1)+" s");
 test("Animation callback frequency >= 20 FPS",1000/avg>=20,(1000/avg).toFixed(1)+" callback FPS, not GPU FPS");
 test("No callback stall above 2 seconds",!diffs.some(d=>d>2000));
 }catch(e){test("Diagnostic runtime exception",false,String(e?.message||e));}
 const passed=results.filter(x=>x.pass).length;technical=passed===results.length;executed=true;
 report="Phase 13 acceptance diagnostics: "+passed+"/"+results.length+" passed\n"+results.map(x=>(x.pass?"PASS ":"FAIL ")+x.title+(x.detail?" — "+x.detail:"")).join("\n")+"\n\nRelease gate: "+(technical&&boxes.every(b=>b.checked)?"Recorded checks complete; independent signoff required":"HOLD")+"\nLimits: 20-second callback test cannot prove GPU FPS, long-term endurance, or scientific validity.";
 log.textContent=report;running=false;button.disabled=false;update();
};
button.addEventListener("click",measure);
panel.querySelector("#accept-copy").onclick=()=>{
 const appendix="\nManual signoffs:\n"+REQUIREMENTS.map((s,i)=>(boxes[i].checked?"[x] ":"[ ] ")+s).join("\n");
 if(navigator.clipboard?.writeText)navigator.clipboard.writeText(report+appendix).catch(()=>{log.textContent="Clipboard unavailable. Copy report manually.";});
 else log.textContent="Clipboard unavailable. Copy report manually.";
};
update();
}
