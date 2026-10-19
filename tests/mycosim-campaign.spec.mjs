import {test, expect} from "@playwright/test";
// Screenshot capture is a Playwright test option, not a playwright test CLI flag.
test.use({screenshot:"only-on-failure"});

const pageUrl="http://127.0.0.1:8765/sandbox.html";
test("Phases 9-12 browser campaign passes in consolidated workspace",async({page})=>{
 test.setTimeout(120000);
 const errors=[];
 page.on("pageerror",err=>errors.push(err.message));
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await expect(page.locator("#myco-science-terms")).toBeVisible();
 const tabs=page.locator("#myco-lab-nav [role=tab]");
 await expect(tabs).toHaveCount(5);
 await page.locator('#myco-lab-nav [data-lab="quality"]').click();
 await expect(page.locator("#myco-execute")).toBeVisible();
 await page.locator("#myco-execute").click();
 await expect(page.locator("#myco-log")).toContainText("Phase 12: structured research handoff validated",{timeout:90000});
 const report=await page.locator("#myco-log").innerText();
 expect(report).toContain("Phase 9: 21/21");
 expect(report).toContain("Phase 10: 20/20");
 expect(report).toContain("Phase 11 visual process: 17/17");
 expect(report).toContain("Phase 11: 7 educational steps");
 expect(report).not.toContain("STOP —");
 await expect(page.locator("#myco-campaign")).toBeVisible();
 await expect(page.locator("#myco-acceptance")).toBeVisible();
 expect(errors).toEqual([]);
});

test("Unified workspace switches once, retains original specimen and mobile layout",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 const tabs=page.locator("#myco-lab-nav [role=tab]");
 await expect(tabs).toHaveCount(5);
 for(const key of ["digestion","anatomy","pathways","quality","specimen"]){
  await page.locator('#myco-lab-nav [data-lab="'+key+'"]').click();
  await expect(page.locator('#myco-lab-nav [data-lab="'+key+'"]')).toHaveAttribute("aria-selected","true");
  await expect(page.locator("#trametes-simulator")).toHaveAttribute("data-active-lab",key);
 }
 await expect(page.locator("#tv-canvas")).toBeHidden();
 await expect(page.locator("#myco-family-biology")).toBeVisible();
 await page.setViewportSize({width:390,height:844});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 expect(overflow).toBeLessThanOrEqual(12);
 await page.locator('#myco-lab-nav [data-lab="digestion"]').click();
 await expect(page.locator("#tv-biology")).toBeVisible();
 await expect(page.locator("#tv-anatomy3d")).toBeHidden();
});

test("Course navigation does not destroy glossary or scientific disclaimers",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await page.locator('#myco-lab-nav [data-lab="pathways"]').click();
 await expect(page.locator("#tv-molecular .m-warning")).toBeVisible();
 await expect(page.locator("#myco-term-search")).toBeVisible();
 await page.locator("#myco-term-search").fill("CARD9");
 await expect(page.locator("#myco-term-list")).toContainText("CARD9");
 await page.locator('#myco-lab-nav [data-lab="digestion"]').click();
 await expect(page.locator("#tv-biology .bio-alert")).toBeVisible();
});


test("Phase 13 technical acceptance runs unattended without false hidden-canvas failures",async({page})=>{
 test.setTimeout(90000);
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="quality"]').click();
 await expect(page.locator("#accept-run")).toBeVisible();
 await page.locator("#accept-run").click();
 await expect(page.locator("#accept-log")).toContainText("Phase 13 acceptance diagnostics:",{timeout:90000});
 const result=await page.locator("#accept-log").innerText();
 const failures=result.split("\n").filter(line=>line.startsWith("FAIL "));
 // Preserve real low-callback-rate diagnostics as an unresolved performance gate.
 expect(failures.every(line=>line.startsWith("FAIL Animation callback frequency"))).toBe(true);
 if(failures.length)console.warn("Phase 13 PERFORMANCE HOLD:",failures.join("; "));
 expect(result).toContain("3D anatomy canvas visible dimensions");
 await expect(page.locator("#accept-status")).toContainText("Release gate: HOLD");
 await expect(page.locator("#trametes-simulator")).toHaveAttribute("data-active-lab","quality");
});


test("Unified laboratory keyboard tabs and module preservation",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 const navigation=page.locator("#myco-lab-nav");
 await expect(navigation).toBeVisible({timeout:45000});
 await expect(navigation.locator('[role="tab"]')).toHaveCount(5);
 await navigation.locator('[data-lab="specimen"]').focus();
 await page.keyboard.press("ArrowRight");
 await expect(navigation.locator('[data-lab="digestion"]')).toHaveAttribute("aria-selected","true");
 await expect(page.locator("#tv-biology")).toBeVisible();
 await expect(page.locator("#myco-specimen-pane")).toBeHidden();
 await page.keyboard.press("End");
 await expect(navigation.locator('[data-lab="quality"]')).toHaveAttribute("aria-selected","true");
 await expect(page.locator("#myco-acceptance")).toBeVisible();
 await page.keyboard.press("Home");
 await expect(navigation.locator('[data-lab="specimen"]')).toHaveAttribute("aria-selected","true");
 await expect(page.locator("#tv-canvas")).toBeHidden();
 await expect(page.locator("#myco-family-biology")).toBeVisible();
 await expect(page.locator("#stage")).toHaveCount(1);
 await expect(page.locator("#tv-biology")).toHaveCount(1);
 await expect(page.locator("#tv-anatomy3d")).toHaveCount(1);
 await expect(page.locator("#tv-molecular")).toHaveCount(1);
});


test("Phase 15 ingestion reuses digestion and anatomy and passes educational QA",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="digestion"]').click();
 const lab=page.locator("#myco-ingestion-lab");
 await expect(lab).toBeVisible();
 await expect(page.locator("#tv-biology #myco-ingestion-lab")).toHaveCount(1);
 await expect(lab.locator("#ingestion-steps button")).toHaveCount(7);
 await lab.locator("#ingestion-material").selectOption("extract");
 await expect(lab.locator("#ingestion-preparation")).toContainText("extraction method");
 await lab.locator("#ingestion-material").selectOption("powder");
 await expect(lab.locator(".ingestion-warning")).toContainText("PSK or PSP");
 await lab.locator("#ingestion-steps button").nth(5).click();
 await expect(lab.locator("#ingestion-evidence")).toContainText("HYPOTHETICAL");
 await expect(lab.locator("#ingestion-definition")).not.toBeEmpty();
 await lab.locator("#ingestion-qa").click();
 await expect(lab.locator("#ingestion-qa-result")).toContainText("Phase 15 browser checks: 17/17 passed");
 await lab.locator("#ingestion-3d").click();
 await expect(page.locator("#trametes-simulator")).toHaveAttribute("data-active-lab","anatomy");
 await expect(page.locator("#tv-anatomy3d")).toBeVisible();
 await expect(page.locator("#tv-biology")).toBeHidden();
});


test("Phase 16 shared microbiome and gut brain lab passes unattended QA",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="digestion"]').click();
 const lab=page.locator("#myco-microbiome");
 await expect(lab).toBeVisible();
 await expect(page.locator("#tv-biology #myco-ingestion-lab #myco-microbiome")).toHaveCount(1);
 await expect(lab.locator("#micro-stage-buttons button")).toHaveCount(7);
 await lab.locator("#micro-substrate").selectOption("unknown");
 await expect(lab.locator("#micro-constraint")).toContainText("Unknown preparation");
 await lab.locator("#micro-substrate").selectOption("fungal");
 await lab.locator("#micro-stage-buttons button").nth(3).click();
 await expect(lab.locator("#micro-evidence")).toContainText("HYPOTHETICAL");
 await lab.locator("#micro-stage-buttons button").nth(6).click();
 await expect(lab.locator("#micro-axis")).toContainText("not a live synchronized");
 await expect(lab.locator("#micro-pron")).not.toBeEmpty();
 await expect(lab.locator("#micro-definition")).not.toBeEmpty();
 await lab.locator("#micro-qa").click();
 await expect(lab.locator("#micro-report")).toContainText("Phase 16 browser checks: 19/19 passed");
 await lab.locator("#micro-3d").click();
 await expect(page.locator("#trametes-simulator")).toHaveAttribute("data-active-lab","anatomy");
 await expect(page.locator("#tv-anatomy3d")).toBeVisible();
 await expect(page.locator("#tv-biology")).toBeHidden();
});


test("Phase 17 immune signaling reuses molecular pathway and existing human anatomy",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="pathways"]').click();
 const lab=page.locator("#myco-immune17");
 await expect(lab).toBeVisible();
 await expect(page.locator("#tv-molecular #myco-immune17")).toHaveCount(1);
 await expect(lab.locator("#immune17-steps button")).toHaveCount(8);
 await lab.locator("#immune17-cell").selectOption("epithelial");
 await expect(lab.locator("#immune17-cell-note")).toContainText("barrier");
 await lab.locator("#immune17-cell").selectOption("macrophage");
 await lab.locator("#immune17-steps button").nth(7).click();
 await expect(lab.locator("#immune17-evidence")).toContainText("HYPOTHETICAL");
 await expect(lab.locator("#immune17-definition")).not.toBeEmpty();
 await lab.locator("#immune17-qa").click();
 await expect(lab.locator("#immune17-report")).toContainText("Phase 17 browser checks: 20/20 passed");
 await lab.locator("#immune17-anatomy").click();
 await expect(page.locator("#trametes-simulator")).toHaveAttribute("data-active-lab","anatomy");
 await expect(page.locator("#tv-anatomy3d")).toBeVisible();
 await expect(page.locator("#tv-molecular")).toBeHidden();
});


test("Phase 18 shares ingestion model and exposes conservative compound disposition",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="digestion"]').click();
 const lab=page.locator("#myco-circulation18");
 await expect(lab).toBeVisible();
 await expect(page.locator("#tv-biology #myco-ingestion-lab #myco-circulation18")).toHaveCount(1);
 await expect(lab.locator("#circulation-steps button")).toHaveCount(7);
 await lab.locator("#circulation-preparation").selectOption("extract");
 await expect(lab.locator("#circulation-prep-note")).toContainText("measured composition");
 await lab.locator("#circulation-preparation").selectOption("powder");
 await lab.locator("#circulation-steps button").nth(5).click();
 await expect(lab.locator("#circulation-fate")).toContainText("HYPOTHETICAL");
 await expect(lab.locator("#circulation-definition")).not.toBeEmpty();
 await lab.locator("#circulation-qa").click();
 await expect(lab.locator("#circulation-report")).toContainText("Phase 18 browser checks: 21/21 passed");
 await lab.locator("#circulation-anatomy").click();
 await expect(page.locator("#trametes-simulator")).toHaveAttribute("data-active-lab","anatomy");
 await expect(page.locator("#tv-anatomy3d")).toBeVisible();
 await expect(page.locator("#tv-biology")).toBeHidden();
});


test("Phase 19 integrated gut-brain neural pathway retains earlier modules",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="digestion"]').click();
 const lab=page.locator("#myco-neural19");
 await expect(lab).toBeVisible();
 await expect(page.locator("#tv-biology #myco-ingestion-lab #myco-microbiome #myco-neural19")).toHaveCount(1);
 await expect(lab.locator("#neural19-steps button")).toHaveCount(8);
 await lab.locator("#neural19-route").selectOption("endocrine");
 await expect(lab.locator("#neural19-route-note")).toContainText("enteroendocrine");
 await lab.locator("#neural19-steps button").nth(2).click();
 await expect(lab.locator("#neural19-evidence")).toContainText("HYPOTHETICAL");
 await lab.locator("#neural19-steps button").nth(7).click();
 await expect(lab.locator("#neural19-evidence")).toContainText("NOT TESTED");
 await lab.locator("#neural19-qa").click();
 const neuralReport=await lab.locator("#neural19-report").innerText();
 const neuralCounts=neuralReport.match(/Phase 19 browser checks: (\d+)\/(\d+) passed/);
 expect(neuralCounts).not.toBeNull();
 expect(Number(neuralCounts[1])).toBeGreaterThan(0);
 expect(Number(neuralCounts[1])).toBe(Number(neuralCounts[2]));
 await lab.locator("#neural19-immune").click();
 await expect(page.locator("#trametes-simulator")).toHaveAttribute("data-active-lab","pathways");
 await expect(page.locator("#myco-immune17")).toBeVisible();
 await page.locator('#myco-lab-nav [data-lab="digestion"]').click();
 await lab.locator("#neural19-3d").click();
 await expect(page.locator("#trametes-simulator")).toHaveAttribute("data-active-lab","anatomy");
 await expect(page.locator("#tv-anatomy3d")).toBeVisible();
});


test("Phase 20 reuses molecular lab and distinguishes human from preclinical Lion's Mane evidence",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="pathways"]').click();
 const lab=page.locator("#myco-neuro20");
 await expect(lab).toBeVisible();
 await expect(page.locator("#tv-molecular #myco-neuro20")).toHaveCount(1);
 await expect(lab.locator("#neuro20-steps button")).toHaveCount(8);
 await lab.locator("#neuro20-compound").selectOption("1");
 await expect(lab.locator("#neuro20-chemistry")).toContainText("mycelium");
 await expect(lab.locator("#neuro20-grade")).toContainText("Preclinical");
 await lab.locator("#neuro20-compound").selectOption("2");
 await expect(lab.locator("#neuro20-grade")).toContainText("Limited, heterogeneous human trials");
 await lab.locator("#neuro20-steps button").nth(7).click();
 await expect(lab.locator("#neuro20-evidence")).toContainText("not clinical proof");
 await lab.locator("#neuro20-qa").click();
 await expect(lab.locator("#neuro20-report")).toContainText("Phase 20 browser checks: 24/24 passed");
 await lab.locator("#neuro20-gut").click();
 await expect(page.locator("#trametes-simulator")).toHaveAttribute("data-active-lab","digestion");
 await expect(page.locator("#myco-neural19")).toBeVisible();
 await page.locator('#myco-lab-nav [data-lab="pathways"]').click();
 await lab.locator("#neuro20-3d").click();
 await expect(page.locator("#trametes-simulator")).toHaveAttribute("data-active-lab","anatomy");
 await expect(page.locator("#tv-anatomy3d")).toBeVisible();
});


test("Phase 21 claim ledger and offline Neural Atlas export preserve evidence boundaries",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="quality"]').click();
 const ledger=page.locator("#myco-evidence21");
 await expect(ledger).toBeVisible();
 await expect(ledger.locator(".evidence21-record")).toHaveCount(7);
 await ledger.locator("#evidence21-filter").selectOption("20");
 await expect(ledger.locator(".evidence21-record")).toHaveCount(2);
 await ledger.locator("#evidence21-filter").selectOption("all");
 const anchors=ledger.locator(".evidence21-record a");
 await expect(anchors).toHaveCount(4);
 await expect(anchors.first()).toHaveAttribute("rel","noopener noreferrer");
 await ledger.locator("#evidence21-build").click();
 await expect(ledger.locator("#evidence21-output")).toHaveValue(/jha\.mycosim\.research\.v2/);
 const exported=await ledger.locator("#evidence21-output").inputValue();
 const envelope=JSON.parse(exported);
 expect(envelope.remote_sync).toBe(false);
 expect(envelope.human_signoff).toBe(false);
 expect(envelope.claims).toHaveLength(7);
 expect(envelope.sources).toHaveLength(4);
 expect(envelope.integrity.algorithm).toBe("SHA-256");
 expect(envelope.integrity.digest).toMatch(/^[a-f0-9]{64}$/);
 expect(envelope.claims.some(c=>c.grade==="unverified-hypothesis"&&c.source_ids.length===0)).toBe(true);
 await expect(ledger.locator("#evidence21-status")).toContainText("No remote transmission");
});

test("Phase 21 keyboard, reduced motion and original model preservation",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav [role=tab]")).toHaveCount(5,{timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="quality"]').click();
 await expect(page.locator("#myco-evidence21")).toBeVisible();
 await page.locator("#evidence21-filter").focus();
 await page.keyboard.press("End");
 await expect(page.locator("#evidence21-filter")).toHaveValue("20");
 await page.locator('#myco-lab-nav [data-lab="digestion"]').click();
 await expect(page.locator("#myco-ingestion-lab")).toHaveCount(1);
 await expect(page.locator("#myco-microbiome")).toHaveCount(1);
 await expect(page.locator("#myco-circulation18")).toHaveCount(1);
 await expect(page.locator("#myco-neural19")).toHaveCount(1);
 await page.locator('#myco-lab-nav [data-lab="pathways"]').click();
 await expect(page.locator("#myco-immune17")).toHaveCount(1);
 await expect(page.locator("#myco-neuro20")).toHaveCount(1);
 await page.locator('#myco-lab-nav [data-lab="anatomy"]').click();
 await expect(page.locator("#tv-anatomy3d")).toBeVisible();
});


test("Phase 21 consolidated workspace switches without duplicate live modules",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 const diagnostic=await page.evaluate(()=>{
  const order=["digestion","pathways","quality","anatomy","specimen"];
  const start=performance.now();
  for(let i=0;i<30;i++)window.MycoSimWorkspace.activate(order[i%order.length]);
  const elapsed=performance.now()-start;
  const ids=["tv-biology","tv-molecular","tv-anatomy3d","myco-ingestion-lab","myco-microbiome","myco-immune17","myco-circulation18","myco-neural19","myco-neuro20","myco-evidence21"];
  const duplicateIds=ids.filter(id=>document.querySelectorAll("#"+id).length!==1);
  return {elapsed,duplicateIds,active:window.MycoSimWorkspace.getActive()};
 });
 expect(diagnostic.duplicateIds).toEqual([]);
 expect(diagnostic.active).toBe("specimen");
 expect(diagnostic.elapsed).toBeLessThan(3000);
 // A DOM-navigation smoke budget, NOT renderer frame-rate or long-term GPU endurance.
});


test("Phase 22 shared 3D tissue mode retains original controls and geometry lifecycle",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="anatomy"]').click();
 const anatomy=page.locator("#tv-anatomy3d");
 await expect(anatomy).toBeVisible();
 await expect(anatomy.locator("canvas")).toHaveCount(1);
 await anatomy.locator('[data-mode="tissue"]').click();
 await expect(anatomy.locator('[data-mode="tissue"]')).toHaveAttribute("aria-pressed","true");
 await expect(anatomy.locator(".anatomy-picker button")).toHaveCount(7);
 for(const name of ["Hepatocytes","Macrophage","Enteric neuron and axon","Synaptic terminals"]){
  await expect(anatomy.locator(".anatomy-picker")).toContainText(name);
 }
 await page.locator("#anatomy-instructor-tools").evaluate(el=>{el.open=true});
 await anatomy.locator("#anatomy22-run").click();
 await expect(anatomy.locator("#anatomy22-report")).toContainText("Phase 22 browser checks: 17/17 passed",{timeout:30000});
 await expect(anatomy.locator("#tv-anatomy-canvas")).toBeVisible();
 await anatomy.locator('[data-mode="gut"]').click();
 await expect(anatomy.locator(".anatomy-picker button")).toHaveCount(4);
 await anatomy.locator('[data-mode="cell"]').click();
 await expect(anatomy.locator(".anatomy-picker button")).toHaveCount(6);
 await anatomy.locator('[data-mode="tissue"]').click();
 await anatomy.locator('[data-part="neuron"]').click();
 await expect(anatomy.locator('[data-part="neuron"]')).toHaveAttribute("aria-pressed","true");
});


test("Phase 23 microanatomy shares human WebGL renderer and supports keyboard selection",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="anatomy"]').click();
 const anatomy=page.locator("#tv-anatomy3d");
 await anatomy.locator('[data-mode="micro"]').click();
 await expect(anatomy.locator('[data-mode="micro"]')).toHaveAttribute("aria-pressed","true");
 await expect(anatomy.locator(".anatomy-picker button")).toHaveCount(9);
 await expect(anatomy.locator("canvas")).toHaveCount(1);
 await anatomy.locator('[data-mag="cell"]').click();
 await expect(anatomy.locator('[data-mag="cell"]')).toHaveAttribute("aria-pressed","true");
 await anatomy.locator('[data-mag="molecular"]').click();
 await expect(anatomy.locator("#anatomy23-scale")).toContainText("NOT TO SCALE");
 await anatomy.locator('[data-part="dectin23"]').focus();
 await page.keyboard.press("Enter");
 await expect(anatomy.locator('[data-part="dectin23"]')).toHaveAttribute("aria-pressed","true");
 await page.locator("#anatomy-instructor-tools").evaluate(el=>{el.open=true});
 await anatomy.locator("#anatomy23-run").click();
 const microReport=await anatomy.locator("#anatomy23-report").innerText();
 const microCounts=microReport.match(/Phase 23 browser checks: (\d+)\/(\d+) passed/);
 expect(microCounts).not.toBeNull();
 expect(Number(microCounts[1])).toBeGreaterThan(0);
 expect(Number(microCounts[1])).toBe(Number(microCounts[2]));
 await anatomy.locator('[data-mode="tissue"]').click();
 await expect(anatomy.locator(".anatomy-picker button")).toHaveCount(7);
 await anatomy.locator('[data-mode="gut"]').click();
 await expect(anatomy.locator(".anatomy-picker button")).toHaveCount(4);
 await anatomy.locator('[data-mode="cell"]').click();
 await expect(anatomy.locator(".anatomy-picker button")).toHaveCount(6);
});


test("Phase 24 molecular motion, scientific caveats and preserved scene controls",async({page})=>{
 test.setTimeout(90000);
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="anatomy"]').click();
 const anatomy=page.locator("#tv-anatomy3d"),lab=anatomy.locator("#myco-dynamics24");
 await expect(lab).toBeVisible();
 await expect(anatomy.locator("canvas")).toHaveCount(1);
 await expect(lab.locator("#dynamics24-process option")).toHaveCount(7);
 await expect(lab.locator(".d24warning")).toContainText("NOT molecular dynamics");
 await lab.locator("#dynamics24-process").selectOption({label:"NMDA receptor gating"});
 await expect(anatomy.locator('[data-mode="micro"]')).toHaveAttribute("aria-pressed","true");
 await expect(lab.locator("#dynamics24-title")).toContainText("Stage 1/3");
 await lab.locator("#dynamics24-next").click();
 await expect(lab.locator("#dynamics24-title")).toContainText("Stage 2/3");
 await lab.locator("#dynamics24-progress").evaluate(el=>{el.value="50";el.dispatchEvent(new Event("input",{bubbles:true}));});
 await expect(lab.locator("#dynamics24-progress")).toHaveValue("50");
 await lab.locator("#dynamics24-qa").click();
 await expect(lab.locator("#dynamics24-report")).toContainText("Phase 24 browser checks: 19/19 passed",{timeout:30000});
 const before=await page.evaluate(()=>window.MycoSimMotion24.getState());
 expect(before.particles).toHaveLength(3);
 await lab.locator("#dynamics24-play").click();
 await expect.poll(async()=>page.evaluate(()=>window.MycoSimMotion24.getState().progress),{timeout:5000}).toBeGreaterThan(before.progress+0.02);
 const during=await page.evaluate(()=>window.MycoSimMotion24.getState());
 expect(during.particles).not.toEqual(before.particles);
 await lab.locator("#dynamics24-play").click();
 await expect(lab.locator("#dynamics24-play")).toHaveAttribute("aria-pressed","false");
 await anatomy.locator('[data-mode="gut"]').click();
 await expect(anatomy.locator(".anatomy-picker button")).toHaveCount(4);
 await anatomy.locator('[data-mode="cell"]').click();
 await expect(anatomy.locator(".anatomy-picker button")).toHaveCount(6);
 await anatomy.locator('[data-mode="tissue"]').click();
 await expect(anatomy.locator(".anatomy-picker button")).toHaveCount(7);
 await anatomy.locator('[data-mode="micro"]').click();
 await expect(anatomy.locator(".anatomy-picker button")).toHaveCount(9);
});

test("Phase 24 honors reduced motion and retains manual accessible scrubbing",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="anatomy"]').click();
 const lab=page.locator("#myco-dynamics24");
 await lab.locator("#dynamics24-process").selectOption({label:"GABA-A inhibitory signaling"});
 await lab.locator("#dynamics24-play").click();
 await expect(lab.locator("#dynamics24-state")).toContainText("Reduced motion");
 expect((await page.evaluate(()=>window.MycoSimMotion24.getState())).playing).toBe(false);
 await lab.locator("#dynamics24-progress").focus();
 await page.keyboard.press("ArrowRight");
 expect((await page.evaluate(()=>window.MycoSimMotion24.getState())).progress).toBeGreaterThan(0);
 await lab.locator("#dynamics24-next").click();
 await expect(lab.locator("#dynamics24-title")).toContainText("Stage 2/3");
});


test("Phase 25 improved anatomy fidelity retains existing rendering engine and visual controls",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="anatomy"]').click();
 const anatomy=page.locator("#tv-anatomy3d");
 await page.locator("#anatomy-instructor-tools").evaluate(el=>{el.open=true});
 await expect(anatomy.locator("#anatomy25-fidelity")).toBeVisible();
 await expect(anatomy.locator("canvas")).toHaveCount(1);
 await anatomy.locator('[data-mode="micro"]').click();
 await anatomy.locator('[data-part="dectin23"]').click();
 await expect(anatomy.locator("#anatomy25-guide")).toContainText("Dectin-1 receptor");
 await page.locator("#anatomy-instructor-tools").evaluate(el=>{el.open=true});
 await anatomy.locator("#anatomy25-qa").click();
 await expect(anatomy.locator("#anatomy25-report")).toContainText("Phase 25 browser checks: 13/13 passed",{timeout:30000});
 for(const [mode,count] of [["gut",4],["cell",6],["tissue",7],["micro",9]]){
  await anatomy.locator('[data-mode="'+mode+'"]').click();
  await expect(anatomy.locator(".anatomy-picker button")).toHaveCount(count);
 }
 await expect(anatomy.locator('[data-action="isolate"]')).toBeVisible();
 await expect(anatomy.locator('[data-action="context"]')).toBeVisible();
 await expect(anatomy.locator('[data-action="reset"]')).toBeVisible();
 await expect(anatomy.locator('[data-action="read"]')).toBeVisible();
 await expect(page.locator("#myco-dynamics24")).toHaveCount(1);
});


test("Phase 26 measures visible browser frames and pauses hidden anatomy rendering",async({page})=>{
 test.setTimeout(90000);
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="anatomy"]').click();
 const anatomy=page.locator("#tv-anatomy3d");
 await anatomy.locator('[data-mode="micro"]').click();
 await anatomy.locator('[data-part="tight23"]').click();
 await expect(anatomy.locator("#anatomy26-references a")).toHaveAttribute("href","https://pubmed.ncbi.nlm.nih.gov/19855405/");
 await anatomy.locator('[data-part="dectin23"]').click();
 await expect(anatomy.locator("#anatomy26-references a")).toHaveAttribute("href","https://pubmed.ncbi.nlm.nih.gov/21267996/");
 await anatomy.locator('[data-part="synapse23"]').click();
 await expect(anatomy.locator("#anatomy26-references a")).toHaveAttribute("href","https://pubmed.ncbi.nlm.nih.gov/24183019/");
 await page.locator("#anatomy-instructor-tools").evaluate(el=>{el.open=true});
 await anatomy.locator("#anatomy26-profile").click();
 await expect.poll(async()=>page.evaluate(()=>window.MycoSimPerf26.getSnapshot()?.sampleCount||0),{timeout:45000}).toBe(90);
 const profile=await page.evaluate(()=>window.MycoSimPerf26.getSnapshot());
 expect(profile.maximumDrawCalls).toBeGreaterThan(0);
 expect(profile.maximumTriangles).toBeGreaterThan(0);
 expect(profile.meanFrameIntervalMs).toBeGreaterThan(0);
 expect(profile.gpuTimingMeasured).toBe(false);
 console.log("Phase 26 REAL CHROMIUM measured visible frame sample",JSON.stringify(profile));
 await page.locator('#myco-lab-nav [data-lab="quality"]').click();
 await page.waitForTimeout(250);
 const hiddenBefore=await page.evaluate(()=>window.MycoSimPerf26.getRenderCount());
 await page.waitForTimeout(350);
 const hiddenAfter=await page.evaluate(()=>window.MycoSimPerf26.getRenderCount());
 expect(hiddenAfter).toBe(hiddenBefore);
 await page.locator('#myco-lab-nav [data-lab="anatomy"]').click();
 await expect.poll(async()=>page.evaluate(()=>window.MycoSimPerf26.getRenderCount()),{timeout:10000}).toBeGreaterThan(hiddenAfter);
});


test("Phase 27 instancing retains semantic selection and beats Phase 26 scene complexity baseline",async({page})=>{
 test.setTimeout(110000);
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="anatomy"]').click();
 const lab=page.locator("#tv-anatomy3d");
 await lab.locator('[data-mode="micro"]').click();
 await lab.locator('[data-part="bilayer"]').click();
 await expect(lab.locator('[data-part="bilayer"]')).toHaveAttribute("aria-pressed","true");
 await lab.locator('[data-action="start"]').click();
 await expect.poll(async()=>page.evaluate(()=>window.MycoSimSelection27.getState().started)).toBe(true);
 await lab.locator('[data-action="reset"]').click();
 await expect(lab.locator('[data-action="isolate"]')).toHaveAttribute("aria-pressed","false");
 await lab.locator('[data-action="isolate"]').focus();
 await expect(lab.locator('[data-action="isolate"]')).toBeFocused();
 const beforeKey=await page.evaluate(()=>({state:window.MycoSimSelection27.getState(),active:document.activeElement?.outerHTML}));
 await page.keyboard.press("Enter");
 const afterKey=await page.evaluate(()=>({state:window.MycoSimSelection27.getState(),active:document.activeElement?.outerHTML}));
 console.log("Phase 27 isolate key diagnostic",JSON.stringify({beforeKey,afterKey}));
 await expect(lab.locator('[data-action="isolate"]')).toHaveAttribute("aria-pressed","true");
 expect((await page.evaluate(()=>window.MycoSimSelection27.getState())).isolated).toBe(true);
 const isolatedParts=(await page.evaluate(()=>window.MycoSimSelection27.getState())).visibleParts;
 expect(isolatedParts.length).toBeGreaterThan(0);
 expect(isolatedParts.every(p=>p==="bilayer")).toBe(true);
 await page.keyboard.press("Enter");
 await expect(lab.locator('[data-action="isolate"]')).toHaveAttribute("aria-pressed","false");
 expect((await page.evaluate(()=>window.MycoSimSelection27.getState())).isolated).toBe(false);
 await lab.locator('[data-action="context"]').click();
 await expect(lab.locator('[data-action="context"]')).toHaveAttribute("aria-pressed","true");
 await lab.locator('[data-action="context"]').click();
 await page.locator("#anatomy-instructor-tools").evaluate(el=>{el.open=true});
 await lab.locator("#anatomy26-profile").click();
 await expect.poll(async()=>page.evaluate(()=>window.MycoSimPerf26.getSnapshot()?.sampleCount||0),{timeout:60000}).toBe(90);
 const micro=await page.evaluate(()=>window.MycoSimPerf26.getSnapshot());
 console.log("Phase 27 ACTUAL CHROMIUM micro profile",JSON.stringify(micro));
 expect(micro.maximumDrawCalls).toBeLessThan(45);
 expect(micro.maximumTriangles).toBeLessThan(42680);
 expect(micro.gpuTimingMeasured).toBe(false);
 await lab.locator('[data-mode="tissue"]').click();
 for(const key of ["villus","junction","hepatocyte","synapse"]){
  await lab.locator('[data-part="'+key+'"]').click();
  await expect(lab.locator('[data-part="'+key+'"]')).toHaveAttribute("aria-pressed","true");
 }
 await lab.locator('[data-mode="cell"]').click();
 await lab.locator('[data-part="epithelium"]').click();
 await expect(lab.locator('[data-part="epithelium"]')).toHaveAttribute("aria-pressed","true");
 await lab.locator('[data-mode="gut"]').click();
 await expect(lab.locator(".anatomy-picker button")).toHaveCount(4);
});


test("Forest specimen routes agaricoid biology and isolates the Turkey Tail log viewer",async({page})=>{
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="specimen"]').click();
 await expect(page.locator("#myco-family-biology")).toBeVisible();
 await expect(page.locator("#tv-species-only")).toBeHidden();
 await expect(page.locator("#bio28-taxon option")).toHaveCount(5);
 await page.locator("#bio28-taxon").selectOption("pleurotus_ostreatus");
 await expect(page.locator("#bio28-ecology")).toContainText("wood decomposer");
 await page.locator("#bio28-next").click();
 await expect(page.locator("#bio28-heading")).toContainText("stage 2/5");
 await page.locator("#bio28-taxon").selectOption("amanita_muscaria");
 await expect(page.locator("#bio28-ecology")).toContainText("living trees");
 await page.locator('#modelGrid [data-model="trametes_versicolor"]').click();
 await expect(page.locator("#tv-species-only")).toBeVisible();
 await expect(page.locator("#myco-family-biology")).toBeHidden();
 await expect(page.locator("#tv-start")).toBeVisible();
 await page.locator('#modelGrid [data-model="agaricoid"]').click();
 await expect(page.locator("#tv-species-only")).toBeHidden();
 await expect(page.locator("#myco-family-biology")).toBeVisible();
 expect(await page.evaluate(()=>window.MycoSimFamilyBiology.getState().family)).toBe("agaricoid");
});


test("Guided anatomy teaches five discoveries with accessible navigation and optional instructor tools",async({page})=>{
 test.setTimeout(90000);
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="anatomy"]').click();
 const guide=page.locator("#myco-guided-anatomy");
 await expect(guide).toBeVisible();
 await expect(guide.locator("#g28-chapters button")).toHaveCount(5);
 await expect(guide.locator("#g28-topic")).toContainText("swallowed material");
 await expect(page.locator("#anatomy-instructor-tools")).not.toHaveAttribute("open","");
 await expect(guide.locator("#g28-evidence")).toContainText("physiology");
 await guide.locator("#g28-start").click();
 await expect(guide.locator("#g28-status")).toContainText("3D is ready",{timeout:30000});
 expect((await page.evaluate(()=>window.MycoSimGuided28.getState())).started).toBe(true);
 await guide.locator("#g28-next").click();
 await expect(guide.locator("#g28-title")).toContainText("intestinal barrier");
 await expect(page.locator('[data-mode="cell"]')).toHaveAttribute("aria-pressed","true");
 await guide.locator("#g28-chapters button").nth(3).focus();
 await page.keyboard.press("Enter");
 await expect(guide.locator("#g28-title")).toContainText("immune receptor");
 await expect(page.locator('[data-part="dectin23"]')).toHaveAttribute("aria-pressed","true");
 await guide.locator("#g28-next").click();
 await expect(guide.locator("#g28-evidence")).toContainText("neuroscience");
 await expect(guide.locator("#g28-back")).toBeEnabled();
 await page.locator("#anatomy-instructor-tools summary").click();
 await expect(page.locator("#anatomy25-fidelity")).toBeVisible();
 await expect(page.locator("#anatomy26-profile")).toBeVisible();
 await expect(guide.locator("#g28-read")).toBeVisible();
});
