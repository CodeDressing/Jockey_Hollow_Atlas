import {test,expect} from "@playwright/test";
import {mkdirSync,writeFileSync} from "node:fs";
test("Clear View R1.3: identify exact scroll owners, boundary behavior, and content access",async({page})=>{
  test.setTimeout(150000);
  mkdirSync("test-results/clear-view-r3",{recursive:true});
  const findings=[];
  for(const width of [320,390,768,960]){
    await page.setViewportSize({width,height:900});
    await page.goto("http://127.0.0.1:8765/sandbox.html");
    await expect(page.locator("#stage")).toBeVisible({timeout:30000});
    await page.locator("#myco-visual-builder").scrollIntoViewIfNeeded();
    const anatomy=page.locator("#mb-region-editor");
    await expect(anatomy).toHaveCount(1);
    const data=await page.evaluate(()=>{
      const el=document.querySelector("#sciencePanel");
      const candidates=[...el.querySelectorAll("*")].filter(e=>e.clientWidth>0&&e.scrollWidth>e.clientWidth+3&&["auto","scroll"].includes(getComputedStyle(e).overflowX));
      return {width:innerWidth,innerOverflows:candidates.map(e=>({tag:e.tagName,id:e.id,classes:typeof e.className==="string"?e.className:"",parent:e.parentElement?.outerHTML.slice(0,400),outer:e.outerHTML.slice(0,1800),scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,scrollDiff:e.scrollWidth-e.clientWidth})),
        pageScrollRange:document.documentElement.scrollHeight-innerHeight,studioOffset:Math.round(document.querySelector("#myco-visual-builder").getBoundingClientRect().top+scrollY)};
    });
    // Probe scroll behavior at each boundary. This is diagnostic only and does not change the app.
    await anatomy.scrollIntoViewIfNeeded();
    const atBottom=await page.evaluate(()=>{
      const e=document.querySelector("#mb-region-editor");e.scrollTop=e.scrollHeight;return {inner:e.scrollTop,outer:window.scrollY,range:e.scrollHeight-e.clientHeight};
    });
    await anatomy.hover();
    await page.mouse.wheel(0,450);
    await page.waitForTimeout(120);
    const afterBottom=await page.evaluate(()=>({inner:document.querySelector("#mb-region-editor").scrollTop,outer:scrollY}));
    const atTop=await page.evaluate(()=>{
      const e=document.querySelector("#mb-region-editor");e.scrollTop=0;return {inner:e.scrollTop,outer:window.scrollY};
    });
    await page.mouse.wheel(0,-450);
    await page.waitForTimeout(120);
    const afterTop=await page.evaluate(()=>({inner:document.querySelector("#mb-region-editor").scrollTop,outer:scrollY}));
    // Exercise keyboard focus into and through the advanced choices.
    const firstButton=page.locator("#mb-region-editor button").first();
    const keyboard=await firstButton.count()?await (async()=>{
      await firstButton.focus();
      const before=await page.evaluate(()=>{const e=document.activeElement,b=e.getBoundingClientRect();return {text:e.textContent.trim().slice(0,60),inViewport:b.top>=0&&b.bottom<=innerHeight,top:Math.round(b.top),outline:getComputedStyle(e).outlineStyle}});
      await page.keyboard.press("Tab");
      const after=await page.evaluate(()=>{const e=document.activeElement,b=e.getBoundingClientRect();return {text:e.textContent.trim().slice(0,60),inViewport:b.top>=0&&b.bottom<=innerHeight,top:Math.round(b.top),outline:getComputedStyle(e).outlineStyle}});
      return {before,after};
    })():null;
    const finding={...data,atBottom,afterBottom,atTop,afterTop,keyboard};
    findings.push(finding);
    console.log("CLEAR_VIEW_R3_"+width,JSON.stringify(finding));
  }
  writeFileSync("test-results/clear-view-r3/root-causes.json",JSON.stringify(findings,null,2));
});
