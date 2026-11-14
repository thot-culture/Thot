#!/usr/bin/env node
// Fichiers réels sous /Thot/ ; tuiles simulées distinctes des vérifications réseau.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.resolve(process.env.THOT_OUTPUT_DIR || path.join(root, 'work/samaritains-map-browser'));
const url = 'https://thot.local/Thot/articles/bon-samaritain.html';
const checks = [];
const errors = [];
const missing = [];
let audits = 0;
const tile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64');

async function fixture(browser, options={}) {
  const {blocked=false, brokenLibrary=false, ...contextOptions}=options;
  const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block',...contextOptions});
  const requests=[];
  await context.route('**/*', async route=>{
    const u=new URL(route.request().url()); requests.push(u.href);
    if(u.hostname==='tile.openstreetmap.org') return blocked ? route.abort() : route.fulfill({contentType:'image/png',body:tile});
    if(u.hostname!=='thot.local') return route.abort();
    if(brokenLibrary && u.pathname.endsWith('/leaflet.js')) return route.abort();
    const file=path.resolve(root,decodeURIComponent(u.pathname).replace(/^\/Thot\//,''));
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
      missing.push(u.pathname); return route.fulfill({status:404,body:'Absent'});
    }
    const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
    return route.fulfill({contentType:types[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
  });
  const page=await context.newPage(); page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);
  return {context,page,requests};
}
async function audit(page){
  const axe=process.env.THOT_AXE_PATH || require.resolve('axe-core/axe.min.js');
  await page.addScriptTag({path:axe});
  const violations=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations);
  assert.deepEqual(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
  audits++;
}
async function positions(markers){
  return markers.evaluateAll(nodes=>nodes.map(n=>{
    const box=n.getBoundingClientRect(); const map=n.closest('.gerizim-canvas').getBoundingClientRect();
    return [Math.round(box.x-map.x),Math.round(box.y-map.y)];
  }));
}

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const executable=process.env.THOT_CHROMIUM_EXECUTABLE || process.env.THOT_BROWSER_EXECUTABLE;
  const browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
  try{
    const {context,page,requests}=await fixture(browser);
    assert(!requests.some(r=>r.includes('/leaflet.js')),'Leaflet différé hors écran');
    const map=page.locator('[data-map-canvas]');
    await page.locator('#carte-garizim').scrollIntoViewIfNeeded();
    await page.waitForSelector('[data-map-ready="true"]');
    const markers=map.locator('.leaflet-marker-icon');
    assert.equal(await markers.count(),3);
    const locations=JSON.parse(fs.readFileSync(path.join(root,'docs/samaritains-coordonnees.json'),'utf8')).places;
    const initialPositions=await positions(markers);
    for(let i=0;i<3;i++){
      const marker=markers.nth(i);
      await marker.focus(); await page.keyboard.press(i===1?'Space':'Enter');
      assert((await map.locator('.leaflet-popup-content').textContent()).includes(locations[i].text));
      assert.equal(await marker.getAttribute('aria-expanded'),'true');
      if(i===1) await page.keyboard.press('Escape'); else await map.getByRole('button',{name:'Fermer la fiche'}).click();
      await map.locator('.leaflet-popup').waitFor({state:'detached'});
      assert.equal(await map.locator('.leaflet-popup').count(),0);
      assert(await marker.evaluate(n=>n===document.activeElement));
    }
    await markers.first().click(); assert.equal(await map.locator('.leaflet-popup').count(),1);
    await map.getByRole('button',{name:'Fermer la fiche'}).click();
    await map.locator('.leaflet-popup').waitFor({state:'detached'});
    await page.getByRole('button',{name:'Recentrer la carte',exact:true}).click();
    await map.getByRole('button',{name:'Zoom avant',exact:true}).click();
    await page.waitForTimeout(300);
    assert.notDeepEqual(await positions(markers),initialPositions);
    await map.getByRole('button',{name:'Zoom arrière',exact:true}).click();
    await page.waitForTimeout(300);
    const box=await map.boundingBox();
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2); await page.mouse.down();
    await page.mouse.move(box.x+box.width/2+70,box.y+box.height/2+55,{steps:10}); await page.mouse.up();
    await page.waitForTimeout(400);
    assert.notDeepEqual(await positions(markers),initialPositions);
    await page.getByRole('button',{name:'Recentrer la carte',exact:true}).click();
    assert.deepEqual(await positions(markers),initialPositions);
    assert((await map.locator('.leaflet-control-attribution').textContent()).includes('OpenStreetMap'));
    const mapBox=await map.boundingBox();
    for(const marker of await markers.all()){
      const b=await marker.boundingBox(); assert(b.x>=mapBox.x && b.x+b.width<=mapBox.x+mapBox.width && b.y>=mapBox.y && b.y+b.height<=mapBox.y+mapBox.height);
    }
    await audit(page);
    checks.push('Carte : trois repères visibles, clic et clavier, fiches et fermeture, focus restitué, zoom ±, glissement, recentrage et attribution.');
    for(const width of [320,390,768,1024,1440]){
      await page.setViewportSize({width,height:1000});
      await page.waitForTimeout(150);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Débordement à ${width}`);
      for(const marker of await markers.all()) {
        const b=await marker.boundingBox(); const m=await map.boundingBox();
        assert(b.x>=m.x && b.x+b.width<=m.x+m.width && b.y>=m.y && b.y+b.height<=m.y+m.height, `Repère visible à ${width}`);
      }
      await page.screenshot({path:path.join(output,`article-${width}.png`),fullPage:true});
    }
    await audit(page);
    checks.push('Responsive : 320, 390, 768, 1024 et 1440 px, sans défilement horizontal.');
    for(const options of [{blocked:true},{brokenLibrary:true},{javaScriptEnabled:false},{reducedMotion:'reduce',isMobile:true,hasTouch:true,viewport:{width:390,height:844}}]){
      const f=await fixture(browser,options);
      await f.page.locator('#carte-garizim').scrollIntoViewIfNeeded();
      assert.equal(await f.page.locator('[data-place]').count(),3);
      if(options.blocked) await f.page.waitForFunction(()=>document.querySelector('[data-map-status]').textContent.includes('fond de carte est indisponible'));
      if(options.brokenLibrary) await f.page.waitForFunction(()=>document.querySelector('[data-map-status]').textContent.includes('ne peut pas se charger'));
      if(options.javaScriptEnabled===false){
        assert(await f.page.locator('#sources').isVisible());
      }
      if(options.hasTouch){
        await f.page.waitForSelector('[data-map-ready="true"]');
        for(const marker of await f.page.locator('.leaflet-marker-icon').all()) {
          await marker.tap();
          assert.equal(await f.page.locator('.leaflet-popup').count(),1);
          await f.page.getByRole('button',{name:'Fermer la fiche'}).tap();
          await f.page.locator('.leaflet-popup').waitFor({state:'detached'});
          await f.page.getByRole('button',{name:'Recentrer la carte'}).tap();
        }
        await f.page.getByRole('button',{name:'Zoom avant',exact:true}).tap();
        await f.page.getByRole('button',{name:'Recentrer la carte'}).tap();
        await audit(f.page);
      }
      await f.context.close();
    }
    checks.push('Replis : toutes les tuiles bloquées, bibliothèque absente, JavaScript désactivé ; tactile et réduction des animations.');
    assert.deepEqual(errors,[]); assert.deepEqual(missing,[]);
    assert.deepEqual(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length})),{local:0,session:0});
    assert(!requests.some(r=>!r.startsWith('https://thot.local/')&&!r.startsWith('https://tile.openstreetmap.org/')));
    checks.push('Aucune exception JavaScript, ressource locale manquante, stockage ou requête de suivi.');
    await context.close();
    const result={status:'PASS',checks,audits,errors,missing,limits:['Tuiles simulées pour la recette déterministe ; disponibilité du service réel vérifiée séparément.', 'Axe et clavier automatisés ; aucun lecteur d’écran humain utilisé.']};
    fs.writeFileSync(path.join(output,'map-results.json'),JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify(result,null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
