import {test,expect} from "@playwright/test";
import {mkdirSync,writeFileSync} from "node:fs";
const sizes=[320,390,768,960,1280,1920];
test("Operation Clear View diagnostic matrix: six widths, no app modifications",async({page})=>{
  test.setTimeout(240000);
  mkdirSync("test-results/clear-view",{recursive:true});
  const report={date:new Date().toISOString(),source:"restoration Sprint 5 branch",scenarios:[]};
  for(const width of sizes){
    await page.setViewportSize({width,height:900});
    const scriptErrors=[];
    const onError=error=>scriptErrors.push(String(error?.message||error));
    page.on("pageerror",onError);
    await page.goto("http://127.0.0.1:8765/sandbox.html");
    await expect(page.locator("#stage")).toBeVisible({timeout:30000});
    await expect(page.locator("#mycosim-laboratory-nav")).toBeVisible({timeout:30000});
    await page.screenshot({path:"test-results/clear-view/"+width+"-entry.png",animations:"disabled"});
    const metrics=await page.evaluate(()=>{
      const round=n=>Math.round(n*10)/10;
      const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:round(r.x),y:round(r.y),width:round(r.width),height:round(r.height),right:round(r.right),bottom:round(r.bottom)}};
      const elInfo=el=>({tag:el.tagName.toLowerCase(),id:el.id||null,classes:typeof el.className==="string"?el.className.slice(0,100):"",rect:rect(el),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,overflowX:getComputedStyle(el).overflowX,overflowY:getComputedStyle(el).overflowY,position:getComputedStyle(el).position,minWidth:getComputedStyle(el).minWidth});
      const body=document.documentElement;
      const all=[...document.querySelectorAll("body *")];
      const exceeding=all.filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.right>innerWidth+3&&getComputedStyle(el).display!=="none"}).map(elInfo).sort((a,b)=>b.rect.right-a.rect.right).slice(0,24);
      const scrollables=all.filter(el=>el.scrollHeight>el.clientHeight+10&&el.clientHeight>70&&["auto","scroll"].includes(getComputedStyle(el).overflowY)).map(elInfo).slice(0,30);
      const horizontalScrollables=all.filter(el=>el.scrollWidth>el.clientWidth+3&&el.clientWidth>0&&["auto","scroll"].includes(getComputedStyle(el).overflowX)).map(elInfo).slice(0,25);
      const overflowChildren=all.filter(el=>{const p=el.parentElement;if(!p)return false;const a=el.getBoundingClientRect(),b=p.getBoundingClientRect();return a.width>0&&a.right>b.right+12&&b.width>0&&!["visible","clip"].includes(getComputedStyle(p).overflowX)}).map(elInfo).slice(0,25);
      const selectors=["header",".workspace-row",".stage-wrap","#stage","aside","#mycosim-laboratory-nav",".learning-path","#myco-visual-builder","#myco-visual-builder .mb-layout","#myco-visual-builder .mb-controls","#myco-visual-builder .mb-preview","#mb-live-canvas","#observationForm","#sciencePanel","#trametes-simulator","#mycosim-teaching-guide"];
      return {width:innerWidth,height:innerHeight,documentScrollWidth:body.scrollWidth,documentClientWidth:body.clientWidth,horizontalOverflow:body.scrollWidth-innerWidth,bodyScrollHeight:body.scrollHeight,
        components:Object.fromEntries(selectors.map(selector=>[selector,rect(document.querySelector(selector))])),
        computed:{workspaceColumns:getComputedStyle(document.querySelector(".workspace-row")).gridTemplateColumns,studioColumns:document.querySelector("#myco-visual-builder .mb-layout")?getComputedStyle(document.querySelector("#myco-visual-builder .mb-layout")).gridTemplateColumns:null,studioContainerWidth:rect(document.querySelector("#myco-visual-builder"))?.width||null},
        exceeding,scrollables,horizontalScrollables,overflowChildren,
        fixedWidths:all.filter(el=>{const v=getComputedStyle(el).width;return /px$/.test(v)&&parseFloat(v)>innerWidth*.8&&el.getBoundingClientRect().width>innerWidth*.8}).slice(0,12).map(elInfo)};
    });
    const studio=page.locator("#myco-visual-builder");
    if(await studio.count()){
      await studio.scrollIntoViewIfNeeded();
      await page.screenshot({path:"test-results/clear-view/"+width+"-studio.png",animations:"disabled"});
      metrics.whileEditing=await page.evaluate(()=>{
        const r=el=>{if(!el)return null;const b=el.getBoundingClientRect();return {x:Math.round(b.x),y:Math.round(b.y),width:Math.round(b.width),height:Math.round(b.height)}};
        return {scrollX,scrollY,primaryViewport:r(document.querySelector("#stage")),secondaryViewport:r(document.querySelector("#mb-live-canvas")),primaryInView:(()=>{const b=document.querySelector("#stage").getBoundingClientRect();return b.bottom>0&&b.top<innerHeight&&b.right>0&&b.left<innerWidth})()};
      });
    }
    metrics.scriptErrors=scriptErrors;
    page.off("pageerror",onError);
    report.scenarios.push(metrics);
    console.log("CLEAR_VIEW_"+width,JSON.stringify({width:metrics.width,overflow:metrics.horizontalOverflow,grid:metrics.computed,exceeding:metrics.exceeding.slice(0,8).map(e=>({id:e.id,classes:e.classes,right:e.rect.right})),nestedVertical:metrics.scrollables.map(e=>({id:e.id,classes:e.classes,scroll:e.scrollHeight,client:e.clientHeight})),horizontalScrollables:metrics.horizontalScrollables.map(e=>({id:e.id,classes:e.classes})),whileEditing:metrics.whileEditing,scriptErrors}));
  }
  writeFileSync("test-results/clear-view/diagnostic.json",JSON.stringify(report,null,2));
});
