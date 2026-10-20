import {test,expect} from "@playwright/test";
for(const viewport of [{width:390,height:844},{width:1280,height:800}]){
  test("Sprint 2 visual layout "+viewport.width+"px maintains original simulator",async({page})=>{
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await page.goto("http://127.0.0.1:8765/sandbox.html");
    await expect(page.locator("#stage")).toHaveCount(1);
    await expect(page.locator("#mycosim-laboratory-nav a")).toHaveCount(6);
    await expect(page.locator("#variantControls")).toHaveCount(1);
    await expect(page.locator("#observationForm")).toHaveCount(1);
    const ux=await page.evaluate(async()=>{
      const sheet=[...document.styleSheets].find(x=>x.href?.includes("restoration_ux.css"));
      return {sheet:!!sheet,canvas:document.querySelector("#stage").getBoundingClientRect().toJSON(),
        layout:document.querySelector(".workspace-row").getBoundingClientRect().toJSON(),
        bodyWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,
        labCardWidth:document.querySelector("#mycosim-laboratory-nav a").getBoundingClientRect().width};
    });
    expect(ux.sheet).toBe(true);
    expect(ux.canvas.width).toBeGreaterThan(180);
    expect(ux.canvas.height).toBeGreaterThan(230);
    if(ux.bodyWidth>ux.viewportWidth+2){
      const offenders=await page.evaluate(()=>[...document.querySelectorAll("body *")].map(el=>{
        const r=el.getBoundingClientRect();return {tag:el.tagName,id:el.id,cls:String(el.className||"").slice(0,70),right:Math.round(r.right),width:Math.round(r.width),scrollWidth:el.scrollWidth};
      }).filter(o=>o.right>innerWidth+2&&o.width>0).sort((a,b)=>b.right-a.right).slice(0,24));
      console.log("SPRINT5_OVERFLOW_DIAGNOSTIC",JSON.stringify({viewport:ux.viewportWidth,offenders}));
    }
    expect(ux.bodyWidth).toBeLessThanOrEqual(ux.viewportWidth+2);
    expect(ux.labCardWidth).toBeGreaterThan(140);
    await expect(page.locator("#modelGrid")).toBeVisible({timeout:30000});
    await page.screenshot({path:"test-results/mycosim-sprint2-"+viewport.width+".png",fullPage:true,animations:"disabled"});
  });
}
