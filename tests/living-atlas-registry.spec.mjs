import {test,expect} from "@playwright/test";
for(const width of [320,390,768,960,1280,1920]){
  test("Living Atlas search "+width+"px",async({page})=>{
    test.setTimeout(90000);
    await page.setViewportSize({width,height:900});
    await page.goto("http://127.0.0.1:8765/index.html?specimen=AN2-F3");
    await expect.poll(()=>page.evaluate(()=>Boolean(window.LivingAtlasRegistry))).toBe(true);
    expect(await page.evaluate(()=>window.LivingAtlasRegistry.lookup("an2 f3")?.code)).toBe("AN2-F3");
    expect(await page.evaluate(()=>window.LivingAtlasRegistry.modelStatus("AN2-F3"))).toBe("not_modelled");
    expect(await page.evaluate(()=>window.LivingAtlasRegistry.collisions.length)).toBe(0);
    const input=page.locator("#living-atlas-query");
    await expect(input).toHaveValue("AN2-F3");
    await expect(page.locator("#living-atlas-detail")).toContainText("AN2-F3");
    await input.fill("AN2 F3");
    await expect(page.locator("#living-atlas-results button").first()).toContainText("AN2-F3");
    await page.locator("#living-atlas-results button").first().click();
    await expect(page.locator("#living-atlas-detail")).toContainText("Not modeled");
    await expect(page.locator("canvas#stage")).toHaveCount(0);
    await page.screenshot({path:"test-results/living-atlas-"+width+".png",fullPage:false});
  });
}
test("Living Atlas does not claim species or fabricate 3D models",async({page})=>{
  await page.goto("http://127.0.0.1:8765/index.html");
  await expect.poll(()=>page.evaluate(()=>Boolean(window.LivingAtlasRegistry))).toBe(true);
  const input=page.locator("#living-atlas-query");
  await input.fill("AN2-F3");
  await page.locator("#living-atlas-results button").first().click();
  await expect(page.locator("#living-atlas-detail")).toContainText("identification review required");
  await expect(page.locator("#living-atlas-detail")).not.toContainText("photogrammetric model");
  await input.fill("zz-no-such-specimen-999");
  await expect(page.locator("#living-atlas-results")).toContainText("No documented match");
});
