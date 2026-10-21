import {test,expect} from "@playwright/test";
test("Redundancy audit: one primary mushroom editor, distinct biological laboratories, no default second mushroom canvas",async({page})=>{
  test.setTimeout(90000);
  await page.goto("http://127.0.0.1:8765/sandbox.html");
  await expect.poll(()=>page.evaluate(()=>Boolean(window.MycoSimMorphologyBridge)),{timeout:30000}).toBe(true);
  await expect(page.locator("#stage")).toHaveCount(1);
  await expect(page.locator("#variantControls")).toHaveCount(1);
  await expect(page.locator("#modelGrid")).toHaveCount(1);
  await expect(page.locator("#myco-visual-builder")).toHaveCount(0);
  await expect(page.locator("#mb-live-canvas")).toHaveCount(0);
  await expect(page.locator("#mb-apply")).toHaveCount(0);
  await expect(page.locator("#mycosim-creative-archive")).toHaveCount(1);
  const labs=page.locator("#mycosim-laboratory-nav .lab-nav-grid a");
  await expect(labs).toHaveCount(6);
  const links=await labs.evaluateAll(els=>els.map(e=>e.getAttribute("href")));
  expect(new Set(links).size).toBe(6);
  await expect(page.locator("#observationForm")).toHaveCount(1);
  await expect(page.locator("#sporeRows")).toHaveCount(1);
  await expect(page.locator("#compareCandidates")).toHaveCount(1);
  await expect(page.locator("#trametes-simulator")).toHaveCount(1);
  await expect(page.locator("#tv-start")).toHaveCount(1);
  await expect(page.locator("#myco-family-biology")).toHaveCount(1);
  await expect(page.locator("#mycosim-presenter")).toHaveCount(1);
  await page.locator('[data-learner-mode="explore"]').click();
  const selector=page.locator('#variantControls [data-variant="agaric_pileus_profile"][data-value="conical"]');
  await selector.click();
  await expect.poll(()=>page.evaluate(()=>window.MycoSimMorphologyBridge.getState().variants.agaric_pileus_profile)).toBe("conical");
  await expect(page.locator('[data-obs-state="cap_morphology"]')).toHaveValue("not_examined");
  await expect(page.locator('[data-obs-provenance="cap_morphology"]')).toHaveValue("");
  const survey=await page.evaluate(()=>({primary:document.querySelectorAll("#stage").length,secondary:document.querySelectorAll("#mb-live-canvas").length,studio:document.querySelectorAll("#myco-visual-builder").length,labLinks:document.querySelectorAll("#mycosim-laboratory-nav .lab-nav-grid a").length,biology:document.querySelectorAll("#myco-family-biology").length}));
  console.log("REDUNDANCY_AUDIT_DEFAULT",JSON.stringify(survey));
});
for(const width of [320,390,768,960,1280,1920]){
  test("Edge navigation is accessible without duplicating interfaces at "+width+"px",async({page})=>{
    test.setTimeout(90000);
    await page.setViewportSize({width,height:900});
    await page.goto("http://127.0.0.1:8765/sandbox.html");
    await expect(page.locator("#mycosim-laboratory-nav .lab-nav-grid a")).toHaveCount(6);
    await expect(page.locator("#stage")).toHaveCount(1);
    await expect(page.locator("#myco-visual-builder")).toHaveCount(0);
    const metrics=await page.evaluate(()=>{
      const nav=document.querySelector("#mycosim-laboratory-nav");
      const links=[...nav.querySelectorAll(".lab-nav-grid a")];
      const rect=nav.getBoundingClientRect();
      return {overflow:document.documentElement.scrollWidth-innerWidth,navWidth:rect.width,cols:getComputedStyle(nav.querySelector(".lab-nav-grid")).gridTemplateColumns.split(" ").length,minimumTarget:Math.min(...links.map(e=>e.getBoundingClientRect().height)),focusedNone:document.activeElement===document.body};
    });
    expect(metrics.overflow).toBeLessThanOrEqual(2);
    expect(metrics.navWidth).toBeGreaterThan(220);
    expect(metrics.minimumTarget).toBeGreaterThanOrEqual(42);
    await page.screenshot({path:"test-results/clear-view-edge-"+width+".png",animations:"disabled"});
  });
}
test("Legacy creative preview opt-in creates exactly one secondary renderer without replacing original",async({page})=>{
  test.setTimeout(90000);
  await page.goto("http://127.0.0.1:8765/sandbox.html");
  const archive=page.locator("#mycosim-creative-archive");
  await archive.locator("summary").click();
  await archive.locator("#mycosim-load-creative-studio").click();
  await expect(page.locator("#myco-visual-builder")).toHaveCount(1,{timeout:30000});
  await expect(page.locator("#mb-live-canvas")).toHaveCount(1,{timeout:30000});
  await expect(page.locator("#stage")).toHaveCount(1);
  await expect(page.locator("#variantControls")).toHaveCount(1);
  await expect(page.locator("#mycosim-laboratory-nav .lab-nav-grid a")).toHaveCount(6);
  await expect(page.locator('[data-obs-state="cap_morphology"]')).toHaveValue("not_examined");
  await expect(page.locator("#myco-visual-builder").locator("xpath=..")).toHaveAttribute("id","mycosim-creative-archive");
  await expect(page.locator("#mycosim-creative-archive")).not.toHaveAttribute("open","");
});

for(const width of [320,390,768,960,1280,1920]){
 test("Sprint 7 one primary specimen and optional advanced workshop "+width,async({page})=>{
   await page.setViewportSize({width,height:900});
   await page.goto("http://127.0.0.1:8765/sandbox.html");
   const advanced=page.locator("#mycosim-creative-archive");
   await expect(advanced).not.toHaveAttribute("open","");
   await expect(advanced.locator(":scope > summary")).toContainText("Beginner Mushroom Workshop");
   await expect(page.locator("#myco-visual-builder")).toHaveCount(0);
   await expect(page.locator("#mb-live-canvas")).toHaveCount(0);
   await expect(page.locator("#stage")).toHaveCount(1);
   await expect(page.locator("#mycosim-load-creative-studio")).toBeHidden();
   await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
   await page.screenshot({path:"test-results/sprint7-default-"+width+".png",animations:"disabled"});
 });
}

test("Sprint 9: single advanced disclosure supports keyboard with no duplicate default canvas",async({page})=>{
  await page.setViewportSize({width:640,height:720});
  await page.goto("http://127.0.0.1:8765/sandbox.html");
  const workshop=page.locator("#mycosim-creative-archive");
  const opener=workshop.locator(":scope > summary");
  await expect(workshop).not.toHaveAttribute("open","");
  await opener.focus();
  await page.keyboard.press("Enter");
  await expect(workshop).toHaveAttribute("open","");
  await page.locator("#mycosim-load-creative-studio").click();
  const disclosure=page.locator("#mycosim-creative-archive");
  await expect(disclosure).toHaveCount(1);
  await expect(disclosure).not.toHaveAttribute("open","");
  await expect(page.locator("#myco-visual-builder")).toBeHidden();
  await expect(page.locator("#stage")).toHaveCount(1);
  await expect(page.locator("#mb-live-canvas")).toHaveCount(1);
  const summary=disclosure.locator(":scope > summary");
  await expect(summary).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("open","");
  for(const mode of ["learn","build","identify"])await expect(disclosure.locator('[data-mb-mode="'+mode+'"]')).toBeVisible();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(disclosure).not.toHaveAttribute("open","");
  await expect(page.locator("#myco-visual-builder")).toBeHidden();
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
  await page.screenshot({path:"test-results/sprint9-half-screen-640.png",animations:"disabled"});
});

test("Quiet Workshop stays minimized and does not force a scroll jump",async({page})=>{
  await page.setViewportSize({width:390,height:850});
  await page.goto("http://127.0.0.1:8765/sandbox.html");
  const workshop=page.locator("#mycosim-creative-archive");
  await expect(workshop).not.toHaveAttribute("open","");
  await expect(workshop.locator(":scope > summary")).toContainText("Beginner Mushroom Workshop");
  await expect(page.locator("#myco-visual-builder")).toHaveCount(0);
  await expect(page.locator("#mb-live-canvas")).toHaveCount(0);
  await workshop.locator(":scope > summary").click();
  await page.locator("#mycosim-load-creative-studio").click();
  const nested=page.locator("#mycosim-creative-archive");
  await expect(nested).toHaveCount(1);
  await expect(nested).not.toHaveAttribute("open","");
  await expect(page.locator("#myco-visual-builder")).toBeHidden();
  await workshop.locator(":scope > summary").click();
  await expect(workshop).toHaveAttribute("open","");
  for(const mode of ["learn","build","identify"])await expect(workshop.locator('[data-mb-mode="'+mode+'"]')).toBeVisible();
  await workshop.locator(":scope > summary").click();
  await expect(workshop).not.toHaveAttribute("open","");
  await expect(page.locator("#myco-visual-builder")).toBeHidden();
  await expect(page.locator("#stage")).toHaveCount(1);
});
