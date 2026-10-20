import {test,expect} from "@playwright/test";
test("Clear View S2: one primary 3D renderer on default load and optional workshop lazy load",async({page})=>{
  test.setTimeout(90000);
  await page.goto("http://127.0.0.1:8765/sandbox.html");
  await expect.poll(()=>page.evaluate(()=>Boolean(window.MycoSimMorphologyBridge)),{timeout:30000}).toBe(true);
  await expect(page.locator("#stage")).toHaveCount(1);
  await expect(page.locator("#myco-visual-builder")).toHaveCount(0);
  await expect(page.locator("#mb-live-canvas")).toHaveCount(0);
  await expect(page.locator("#observationForm")).toHaveCount(1);
  const details=page.locator("#mycosim-creative-archive");
  await expect(details).toHaveCount(1);
  await expect(details).not.toHaveAttribute("open","");
  await details.locator("summary").click();
  await details.locator("#mycosim-load-creative-studio").click();
  await expect(page.locator("#myco-visual-builder")).toHaveCount(1,{timeout:30000});
  await expect(page.locator("#mb-live-canvas")).toHaveCount(1,{timeout:30000});
  await expect.poll(()=>page.evaluate(()=>window.MycoSimCreative3D?.getState()?.meshCount||0),{timeout:30000}).toBeGreaterThan(10);
  await expect(page.locator("#stage")).toHaveCount(1);
  await expect(page.locator('[data-obs-state="cap_morphology"]')).toHaveValue("not_examined");
  await expect(page.locator("#myco-visual-builder").locator("xpath=../..")).toHaveAttribute("id","mycosim-creative-archive");
  await expect(page.locator("#mycosim-builder-disclosure")).not.toHaveAttribute("open","");
});
for(const width of [320,390,768,960,1280,1920]){
  test("Clear View S2: primary specimen accessible while editing at "+width+"px",async({page})=>{
    test.setTimeout(90000);
    await page.setViewportSize({width,height:900});
    await page.goto("http://127.0.0.1:8765/sandbox.html");
    await expect.poll(()=>page.evaluate(()=>Boolean(window.MycoSimMorphologyBridge)),{timeout:30000}).toBe(true);
    await page.locator('[data-learner-mode="explore"]').click();
    const control=page.locator('#variantControls [data-variant="agaric_pileus_profile"][data-value="conical"]');
    await expect(control).toBeVisible({timeout:30000});
    await control.scrollIntoViewIfNeeded();
    const before=await page.evaluate(()=>{
      const s=document.querySelector("#stage").getBoundingClientRect();
      return {mainVisible:s.bottom>64&&s.top<innerHeight,width:s.width,height:s.height,overflow:document.documentElement.scrollWidth-innerWidth};
    });
    expect(before.overflow).toBeLessThanOrEqual(2);
    expect(before.mainVisible).toBe(true);
    expect(before.height).toBeGreaterThan(155);
    await control.click();
    await expect.poll(()=>page.evaluate(()=>window.MycoSimMorphologyBridge.getState().variants.agaric_pileus_profile)).toBe("conical");
    const after=await page.evaluate(()=>{
      const r=document.querySelector("#stage").getBoundingClientRect();
      return {mainVisible:r.bottom>64&&r.top<innerHeight,overflow:document.documentElement.scrollWidth-innerWidth};
    });
    expect(after.mainVisible).toBe(true);
    expect(after.overflow).toBeLessThanOrEqual(2);
    await expect(page.locator("#myco-visual-builder")).toHaveCount(0);
    await page.screenshot({path:"test-results/clear-view-sprint2-"+width+".png",animations:"disabled"});
  });
}
