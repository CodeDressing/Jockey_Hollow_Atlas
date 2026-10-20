import {test,expect} from "@playwright/test";
import {mkdirSync,writeFileSync} from "node:fs";
const widths=[320,390,768,960,1280,1920];
test("Clear View Run 1.2 — scroll ownership and keyboard/trackpad audit",async({page})=>{
  test.setTimeout(240000);
  mkdirSync("test-results/clear-view-r2",{recursive:true});
  const results=[];
  for(const width of widths){
    await page.setViewportSize({width,height:900});
    await page.goto("http://127.0.0.1:8765/sandbox.html");
    await expect(page.locator("#stage")).toBeVisible({timeout:30000});
    const scan=async()=>page.evaluate(()=>{
      const b=document.documentElement;
      const rect=el=>{const r=el.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),right:Math.round(r.right),width:Math.round(r.width),height:Math.round(r.height)}};
      const identify=el=>({tag:el.tagName,id:el.id,cls:typeof el.className==="string"?el.className.slice(0,90):"",parent:el.parentElement?.id||el.parentElement?.className||"",scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,overflowX:getComputedStyle(el).overflowX,overflowY:getComputedStyle(el).overflowY,rect:rect(el)});
      const horizontal=[...document.querySelectorAll("body *")].filter(el=>el.clientWidth>0&&el.scrollWidth>el.clientWidth+3&&["auto","scroll"].includes(getComputedStyle(el).overflowX)).map(identify).slice(0,20);
      const vertical=[...document.querySelectorAll("body *")].filter(el=>el.clientHeight>60&&el.scrollHeight>el.clientHeight+12&&["auto","scroll"].includes(getComputedStyle(el).overflowY)).map(identify).slice(0,20);
      const main=document.querySelector("#stage"),studio=document.querySelector("#myco-visual-builder"),secondary=document.querySelector("#mb-live-canvas"),aside=document.querySelector("aside");
      const inView=el=>{if(!el)return false;const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth};
      return {documentWidth:b.scrollWidth,viewport:innerWidth,scrollX,scrollY,horizontal,vertical,aside:rect(aside),main:rect(main),studio:studio?rect(studio):null,secondary:secondary?rect(secondary):null,mainVisible:inView(main),studioVisible:inView(studio),focus:{id:document.activeElement?.id||"",tag:document.activeElement?.tagName||""}};
    });
    const start=await scan();
    await page.locator("#myco-visual-builder").scrollIntoViewIfNeeded();
    const atStudio=await scan();
    const advanced=page.locator("#mb-region-editor");
    await expect(advanced).toHaveCount(1);
    await advanced.hover();
    const beforeWheel=await page.evaluate(()=>({outer:window.scrollY,inner:document.querySelector("#mb-region-editor").scrollTop}));
    await page.mouse.wheel(0,450);
    await page.waitForTimeout(180);
    const afterWheel=await page.evaluate(()=>({outer:window.scrollY,inner:document.querySelector("#mb-region-editor").scrollTop}));
    const kb=page.locator('#myco-visual-builder [data-mb-region="stipe"]');
    await kb.focus();
    const focus=await page.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect();return {id:e.id||"",text:e.textContent?.trim().slice(0,70),visible:r.width>0&&r.height>0&&r.top>=0&&r.bottom<=innerHeight,outline:getComputedStyle(e).outlineStyle,outlineWidth:getComputedStyle(e).outlineWidth}});
    await page.keyboard.press("Tab");
    const afterTab=await page.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect();return {id:e.id||"",text:e.textContent?.trim().slice(0,70),visible:r.width>0&&r.height>0&&r.top>=0&&r.bottom<=innerHeight,outline:getComputedStyle(e).outlineStyle,outlineWidth:getComputedStyle(e).outlineWidth}});
    const result={width,start,atStudio,trackpadStyleWheel:{beforeWheel,afterWheel},keyboard:{focus,afterTab}};
    results.push(result);
    console.log("CLEAR_VIEW_R2_"+width,JSON.stringify({width,horizontal:start.horizontal,vertical:start.vertical,atStudio:{mainVisible:atStudio.mainVisible,scrollY:atStudio.scrollY},wheel:result.trackpadStyleWheel,keyboard:result.keyboard}));
  }
  writeFileSync("test-results/clear-view-r2/scroll-focus-diagnostic.json",JSON.stringify(results,null,2));
});
