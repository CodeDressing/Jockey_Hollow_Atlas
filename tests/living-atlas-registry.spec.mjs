import {test,expect} from "@playwright/test";
for(const width of [320,390,768,960,1280,1920]){
  test("Living Atlas search "+width+"px",async({page})=>{
    test.setTimeout(90000);
    await page.setViewportSize({width,height:900});
    await page.goto("http://127.0.0.1:8765/index.html?specimen=AN2-F3");
    await page.locator("#enterAtlas").click();
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
  await page.locator("#enterAtlas").click();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.LivingAtlasRegistry))).toBe(true);
  const input=page.locator("#living-atlas-query");
  await input.fill("AN2-F3");
  await page.locator("#living-atlas-results button").first().click();
  await expect(page.locator("#living-atlas-detail")).toContainText("identification review required");
  await expect(page.locator("#living-atlas-detail")).not.toContainText("photogrammetric model");
  await input.fill("zz-no-such-specimen-999");
  await expect(page.locator("#living-atlas-results")).toContainText("No documented match");
});

test("Living Atlas generic view identifies itself as non-specimen reconstruction",async({page})=>{
  await page.goto("http://127.0.0.1:8765/index.html?specimen=AN2-F3");
    await page.locator("#enterAtlas").click();
  await expect(page.locator("#living-atlas-detail a[href*='atlas_reference=AN2-F3']")).toHaveCount(1);
  await page.locator("#living-atlas-detail a[href*='atlas_reference=AN2-F3']").click();
  await expect(page).toHaveURL(/sandbox\.html\?atlas_reference=AN2-F3/);
  await expect(page.locator("#living-atlas-reference-warning")).toContainText("NOT a verified 3D reconstruction");
  await expect(page.locator("canvas#stage")).toHaveCount(1);
});
test("Optional builder stays collapsed while Learn Build Identify remain accessible",async({page})=>{
  test.setTimeout(90000);
  await page.goto("http://127.0.0.1:8765/sandbox.html");
  const archive=page.locator("#mycosim-creative-archive");
  await archive.locator("summary").click();
  await page.locator("#mycosim-load-creative-studio").click();
  const details=page.locator("#mycosim-builder-disclosure");
  await expect(details).toHaveCount(1);
  await expect(details).not.toHaveAttribute("open","");
  await expect(page.locator("#myco-visual-builder")).toBeHidden();
  await details.locator(":scope > summary").click();
  await expect(details).toHaveAttribute("open","");
  for(const mode of ["learn","build","identify"])
    await expect(page.locator('[data-mb-mode="'+mode+'"]')).toBeVisible();
});

test("Living Atlas name search cannot fabricate AN2-F3 taxonomic confirmation",async({page})=>{
  await page.goto("http://127.0.0.1:8765/index.html?specimen=AN2-F3");
    await page.locator("#enterAtlas").click();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.LivingAtlasRegistry))).toBe(true);
  const names=await page.evaluate(()=>window.LivingAtlasRegistry.verifiedNames("AN2-F3"));
  expect(Array.isArray(names)).toBe(true);
  await expect(page.locator("#living-atlas-detail")).toContainText("identification review required");
  expect(await page.evaluate(()=>window.LivingAtlasRegistry.modelStatus("AN2-F3"))).toBe("not_modelled");
});

test("AN2-F3 evidence matrix preserves accession and blocks speculative models",async({page})=>{
  await page.goto("http://127.0.0.1:8765/index.html?specimen=AN2-F3");
  await page.locator("#enterAtlas").click();
  const evidence=await page.evaluate(()=>window.LivingAtlasRegistry.evidenceMatrix("AN2 F3"));
  expect(evidence.specimen_id).toBe("AN2-F3");
  expect(evidence.photos.length).toBeGreaterThan(0);
  expect(evidence.measurements.length).toBeGreaterThan(1);
  expect(evidence.model_profile).toBeNull();
  expect(evidence.model_lifecycle).toBe("unmodeled");
  expect(await page.evaluate(()=>window.LivingAtlasRegistry.modelLifecycleOptions)).toEqual(
    ["unmodeled","provisional_reconstruction","scientifically_reviewed","validated"]);
  await expect(page.locator("#living-atlas-detail")).toContainText("Evidence matrix");
  await expect(page.locator("#living-atlas-detail")).toContainText("Original accession photo references");
  await expect(page.locator("#living-atlas-detail")).toContainText("Anatomical reconstruction not authorized");
});

test("AN2-F3 directly observed characters do not promote unverified reconstruction",async({page})=>{
 await page.goto("http://127.0.0.1:8765/index.html?specimen=AN2-F3");
 await page.locator("#enterAtlas").click();
 const matrix=await page.evaluate(()=>window.LivingAtlasRegistry.evidenceMatrix("AN2-F3"));
 expect(matrix.reviewed_character_matrix.map(x=>x.character)).toEqual(
 ["pileus_surface","stipe","spore_print","hymenophore","measurements","species"]);
 expect(matrix.reviewed_character_matrix.filter(x=>x.confidence==="observed").length).toBe(3);
 expect(matrix.reviewed_character_matrix.find(x=>x.character==="species").confidence).toBe("unresolved");
 expect(matrix.model_lifecycle).toBe("unmodeled");
 expect(matrix.model_profile).toBeNull();
 await expect(page.locator("#living-atlas-detail")).toContainText("Visual character evidence");
});
