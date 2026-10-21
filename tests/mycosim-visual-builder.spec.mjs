import {test,expect} from "@playwright/test";
const url="http://127.0.0.1:8765/sandbox.html";
test("CLEAR DECK: authoritative MycoSim remains and redundant studio never mounts",async({page})=>{
  await page.goto(url);
  await expect(page.locator("#stage")).toHaveCount(1);
  await expect(page.locator("#variantControls")).toHaveCount(1);
  await expect(page.locator("#observationForm")).toHaveCount(1);
  await expect(page.locator("#myco-visual-builder")).toHaveCount(0);
  await expect(page.locator("#mb-live-canvas")).toHaveCount(0);
  await expect(page.locator('[data-mb-mode="learn"],[data-mb-mode="build"],[data-mb-mode="identify"]')).toHaveCount(0);
  await expect(page.locator("#mycosim-query")).toBeVisible();
  await page.reload();
  await expect(page.locator("#myco-visual-builder")).toHaveCount(0);
  await expect(page.locator("#mb-live-canvas")).toHaveCount(0);
});
test("CLEAR DECK: search resolves existing scientific and specimen routes",async({page})=>{
  await page.goto(url);
  const search=page.locator("#mycosim-query");
  await search.fill("turkey tail");
  await expect(page.locator('#mycosim-search-results a[href="./trametes.html"]')).toBeVisible();
  await search.fill("anatomy");
  await expect(page.locator('#mycosim-search-results a[href="#variantControls"]')).toBeVisible();
  await search.fill("specimen");
  await expect(page.locator('#mycosim-search-results a[href="./index.html"]')).toBeVisible();
  await search.fill("spore");
  await expect(page.locator('#mycosim-search-results a[href="#sporeRows"]')).toBeVisible();
});
test("CLEAR DECK: keyboard enter navigates and Escape closes results",async({page})=>{
  await page.goto(url);
  const search=page.locator("#mycosim-query");
  await search.fill("anatomy");
  await search.press("Enter");
  await expect(page).toHaveURL(/#variantControls$/);
  await search.fill("spore");
  await search.press("Escape");
  await expect(search).toHaveValue("");
  await expect(page.locator("#mycosim-search-results")).toBeHidden();
});
for(const width of [320,390,768,960,1280,1920]){
  test("CLEAR DECK: compact responsive layout "+width,async({page})=>{
    await page.setViewportSize({width,height:800});
    await page.goto(url);
    await expect(page.locator("#mycosim-query")).toBeVisible();
    await expect(page.locator("#stage")).toHaveCount(1);
    await expect(page.locator("#myco-visual-builder")).toHaveCount(0);
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
  });
}
