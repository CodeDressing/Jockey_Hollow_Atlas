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
