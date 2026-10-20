import {test,expect} from "@playwright/test";

test("Release preservation: original anatomical engine, thirteen families, specialized modules",async({page})=>{
  test.setTimeout(90000);
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error.message||error)));
  await page.goto("http://127.0.0.1:8765/sandbox.html");
  await expect.poll(()=>page.evaluate(()=>Boolean(window.MycoSimMorphologyBridge)),{timeout:30000}).toBe(true);
  await expect(page.locator("#stage")).toHaveCount(1);
  await expect(page.locator("#modelGrid [data-model]")).toHaveCount(13);
  await expect(page.locator('a[href="./trametes.html"]').first()).toHaveCount(1);
  await expect(page.locator('a[href="./classified.html"]').first()).toHaveCount(1);
  await expect(page.locator("#tv-start")).toHaveCount(1);
  await expect(page.locator("#mycosim-presenter")).toHaveCount(1);
  await expect(page.locator("#sporeRows")).toHaveCount(1);
  await expect(page.locator("#compareCandidates")).toHaveCount(1);
  await page.locator('[data-learner-mode="explore"]').click();
  const original=await page.evaluate(()=>window.MycoSimMorphologyBridge.getState());
  expect(original.family).toBe("agaricoid");
  for(const [group,value] of [
    ["agaric_pileus_profile","conical"],
    ["agaric_stipe_surface_apex","fibrillose"],
    ["agaric_stipe_surface_mid","reticulate"],
    ["agaric_stipe_surface_base","scaly"],
    ["agaric_gill_attachment","decurrent"]
  ]){
    const button=page.locator('[data-variant="'+group+'"][data-value="'+value+'"]');
    await expect(button).toBeVisible();
    await button.click();
    await expect.poll(()=>page.evaluate(g=>window.MycoSimMorphologyBridge.getState().variants[g],group)).toBe(value);
  }
  await page.locator('[data-obs-value="cap_morphology"]').selectOption("campanulate");
  await expect.poll(()=>page.evaluate(()=>window.MycoSimMorphologyBridge.getState().variants.agaric_pileus_profile)).toBe("campanulate");
  await expect(page.locator('[data-obs-state="cap_morphology"]')).toHaveValue("not_examined");
  await expect(page.locator('[data-obs-provenance="cap_morphology"]')).toHaveValue("");
  expect(errors.filter(x=>!x.includes("ResizeObserver loop"))).toEqual([]);
});

test("Release usability: mobile and desktop specimen viewport and reachable six labs",async({page})=>{
  for(const size of [{width:390,height:844},{width:1280,height:800}]){
    await page.setViewportSize(size);
    await page.goto("http://127.0.0.1:8765/sandbox.html");
    await expect(page.locator("#mycosim-laboratory-nav a")).toHaveCount(6);
    await expect(page.locator("#stage")).toBeVisible();
    const measurement=await page.evaluate(()=>{
      const rect=document.querySelector("#stage").getBoundingClientRect();
      return {viewport:innerWidth,width:rect.width,height:rect.height,overflow:document.documentElement.scrollWidth-innerWidth};
    });
    expect(measurement.width).toBeGreaterThan(200);
    expect(measurement.height).toBeGreaterThan(230);
    expect(measurement.overflow).toBeLessThanOrEqual(2);
    await page.screenshot({path:"test-results/mycosim-release-"+size.width+".png",fullPage:true,animations:"disabled"});
  }
});
