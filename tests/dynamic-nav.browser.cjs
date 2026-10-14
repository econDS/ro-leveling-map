'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const endpoint='https://econds.github.io/ro_tools_portal/catalog/v1/tools.json';
const base=process.env.RO_QA_URL||'http://127.0.0.1:4173/ro-leveling-map/';
const fallback=JSON.parse(fs.readFileSync('assets/ro-suite/2.0.0/catalog.snapshot.json','utf8'));
(async()=>{const browser=await chromium.launch(process.env.RO_QA_CHROMIUM ? {executablePath:process.env.RO_QA_CHROMIUM} : {});try{
 for(const width of [390,1440]) for(const colorScheme of ['light','dark']){
  const ctx=await browser.newContext({viewport:{width,height:900},colorScheme,serviceWorkers:'block'});
  let catalog=structuredClone(fallback),requests=0;
  const seed=catalog.tools.find(t=>t.id==='leveling-map');
  catalog.tools=Array.from({length:120},(_,i)=>({...seed,id:'new-'+i,title:'Future tool '+i,canonicalUrl:'https://econds.github.io/future-tool-'+i+'/'}));
  await ctx.route(endpoint,r=>{requests++;return r.fulfill({json:catalog});});
  await ctx.route(base,r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8').replace('tool-id="leveling-map"','tool-id="new-119"')}));
  const p=await ctx.newPage();await p.goto(base);await p.waitForFunction(()=>document.querySelector('ro-suite-nav')?.shadowRoot?.querySelector('input[type=search]'));
  await p.waitForFunction(()=>document.querySelector('ro-suite-nav').shadowRoot.querySelector('.current').textContent.includes('Future tool 119'));
  assert.equal(requests,1,'automatic fetch before opening');
  const host=p.locator('ro-suite-nav');await host.locator('.bar button').click();
  const search=host.locator('input[type=search]');await search.fill('Future tool 119');
  assert.equal(await host.locator('#tools a').count(),1);assert.equal(await host.locator('#tools a').getAttribute('href'),'https://econds.github.io/future-tool-119/');
  await p.keyboard.press('Escape');assert.equal(await host.locator('.bar button').getAttribute('aria-expanded'),'false');
  assert(await host.locator('.bar button').evaluate(e=>e===e.getRootNode().activeElement));
  assert(await p.locator('#mapTable tbody .map-row').count()>0);
  // Reload the identical bundle against renamed/reordered/removed central metadata.
  catalog.tools=[{...catalog.tools[119],title:'Renamed future'},catalog.tools[2]];
  await p.reload();await host.locator('.bar button').click();await host.locator('#tools').getByText('Renamed future',{exact:true}).waitFor();
  assert.equal(await host.locator('#tools a').count(),2);
  assert.deepEqual(await host.locator('#tools a').allTextContents(),['Renamed future','Future tool 2']);
  await ctx.close();
 }
 // Each raw hostile candidate reaches validation unchanged; reject the entire catalog.
 for(const candidate of ['http://econds.github.io/new/','https://evil.example/new/','https://econds.github.io:443/new/','https://econds.github.io/new/?q=1','https://econds.github.io/new/#x','https://econds.github.io/a/../new/','https://econds.github.io/%6eew/','javascript:alert(1)']){
  const ctx=await browser.newContext({serviceWorkers:'block'});const catalog=structuredClone(fallback);
  catalog.tools.push({...catalog.tools.find(t=>t.id==='leveling-map'),id:'hostile',title:'HOSTILE CANDIDATE',canonicalUrl:candidate});
  await ctx.route(endpoint,r=>r.fulfill({json:catalog}));const p=await ctx.newPage();await p.goto(base,{waitUntil:'networkidle'});
  const host=p.locator('ro-suite-nav');await host.locator('.bar button').click();assert.equal(await host.getByText('HOSTILE CANDIDATE').count(),0,candidate);
  assert.equal(await host.locator('a[aria-current=page]').getAttribute('href'),'https://econds.github.io/ro-leveling-map/');await ctx.close();
 }
 for(const kind of ['offline','timeout','malformed','schema','duplicate','oversize']){
  const ctx=await browser.newContext({serviceWorkers:'block'});const catalog=structuredClone(fallback);
  if(kind==='schema')catalog.schemaVersion=999;
  if(kind==='duplicate')catalog.tools.push(catalog.tools[0]);
  await ctx.route(endpoint,async r=>{
   if(kind==='offline')return r.abort('failed');
   if(kind==='timeout'){await new Promise(resolve=>setTimeout(resolve,1700));return r.abort('timedout').catch(()=>{});}
   return r.fulfill({contentType:'application/json',body:kind==='malformed'?'{':kind==='oversize'?' '.repeat(262145):JSON.stringify(catalog)});
  });
  const p=await ctx.newPage();await p.goto(base,{waitUntil:'networkidle'});const host=p.locator('ro-suite-nav');
  await host.locator('.bar button').click();assert.equal(await host.locator('a[aria-current=page]').getAttribute('href'),'https://econds.github.io/ro-leveling-map/',kind);
  assert(await p.locator('#mapTable tbody .map-row').count()>0);await ctx.close();
 }
 console.log('PASS dynamic catalog: 120 tools, unchanged bundle refresh, unknown identity, rename/removal/order, keyboard/themes/mobile and raw hostile URLs');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
