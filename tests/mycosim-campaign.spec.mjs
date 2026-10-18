import {test, expect} from "@playwright/test";

const pageUrl="http://127.0.0.1:8765/sandbox.html";
test("Phases 9-12 browser campaign passes in consolidated workspace",async({page})=>{
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
 await expect(page.locator("#tv-canvas")).toBeVisible();
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
 await page.goto(pageUrl,{waitUntil:"domcontentloaded"});
 await expect(page.locator("#myco-lab-nav")).toBeVisible({timeout:45000});
 await page.locator('#myco-lab-nav [data-lab="quality"]').click();
 await expect(page.locator("#accept-run")).toBeVisible();
 await page.locator("#accept-run").click();
 await expect(page.locator("#accept-log")).toContainText("Phase 13 acceptance diagnostics:",{timeout:90000});
 const result=await page.locator("#accept-log").innerText();
 expect(result).not.toContain("FAIL ");
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
 await expect(page.locator("#tv-canvas")).toBeVisible();
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
 await expect(lab.locator("#neural19-report")).toContainText("Phase 19 browser checks: 21/21 passed");
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
