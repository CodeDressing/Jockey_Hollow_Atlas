import {test,expect} from "@playwright/test";

test("S3 R3.2: young boletoid pore openings and stage-dependent tube depth",async({page})=>{
  test.setTimeout(90000);
  await page.goto("http://127.0.0.1:8765/sandbox.html");
  await expect.poll(()=>page.evaluate(()=>Boolean(window.MycoSimMorphologyBridge?.getState()))).toBe(true);
  await page.evaluate(()=>window.MycoSimMorphologyBridge.apply({family:"boletoid",stage:"young"}));
  await expect.poll(()=>page.evaluate(()=>window.MycoSimMorphologyBridge.getState().stage)).toBe("young");
  const metrics=await page.evaluate(()=>{
    return {...window.MycoSimCameraBridge.snapshot(),hasStage:!!document.querySelector("#stage"),pad:document.querySelectorAll("#mycosim-camera-pad").length};
  });
  expect(metrics.hasStage).toBe(true);
  expect(metrics.pad).toBe(1);
  expect(metrics.poreGeometry).toBe("planar-pore-openings");
  expect(metrics.tubeScale).toBeLessThan(1);
  await expect(page.locator('[data-obs-state="cap_morphology"]')).toHaveValue("not_examined");
  await expect(page.locator('[data-obs-provenance="cap_morphology"]')).toHaveValue("");
});

for(const width of [320,390,768,960,1280,1920]){
  test("S3 R3.2: camera controls accessible at "+width+"px",async({page})=>{
    test.setTimeout(90000);
    await page.setViewportSize({width,height:900});
    await page.goto("http://127.0.0.1:8765/sandbox.html");
    await expect.poll(()=>page.locator("#mycosim-camera-pad button").count()).toBe(7);
    const pad=page.locator("#mycosim-camera-pad");
    const coords=await pad.evaluate(el=>{
      const r=el.getBoundingClientRect();
      return {left:r.left,right:r.right,top:r.top,buttons:[...el.querySelectorAll("button")].map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height,label:b.getAttribute("aria-label")}))};
    });
    expect(coords.left).toBeGreaterThanOrEqual(0);
    expect(coords.right).toBeLessThanOrEqual(width+2);
    expect(coords.buttons.every(b=>b.width>=42&&b.height>=42&&b.label)).toBe(true);
    await expect.poll(()=>page.evaluate(()=>Boolean(window.MycoSimCameraBridge))).toBe(true);
    const before=await page.evaluate(()=>window.MycoSimCameraBridge.snapshot().position);
    await page.locator('[data-camera-action="right"]').click();
    const afterRight=await page.evaluate(()=>window.MycoSimCameraBridge.snapshot().position);
    expect(afterRight).not.toEqual(before);
    await page.locator('[data-camera-action="up"]').click();
    await page.locator('[data-camera-action="forward"]').click();
    await page.locator('[data-camera-action="back"]').click();
    await page.locator('[data-camera-action="left"]').click();
    await page.locator('[data-camera-action="down"]').click();
    await page.locator('[data-camera-action="base"]').click();
    await expect(page.locator("#stage")).toHaveCount(1);
    await expect(page.locator("#myco-visual-builder")).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
    await page.screenshot({path:"test-results/clear-view-s3-r32-"+width+".png",animations:"disabled"});
  });
}
