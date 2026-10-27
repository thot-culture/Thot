/* Recette HTTP réelle : navigation, responsive, clavier, Atlas et stockage Aral. */
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require(process.env.THOT_PLAYWRIGHT||'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.THOT_OUTPUT_DIR||path.resolve(root,'../../outputs/verification');
fs.mkdirSync(out,{recursive:true});
const base=process.env.THOT_BASE_URL||'http://127.0.0.1:8765/Thot/';
const executablePath=process.env.THOT_BROWSER_EXECUTABLE;
const pages=['index.html','bibliotheque.html','explorer.html','notre-methode.html','quiz.html','quiz-autrices.html','mentions-legales.html','confidentialite.html','contact.html',...fs.readdirSync(path.join(root,'articles')).filter(x=>x.endsWith('.html')).map(x=>'articles/'+x),'explorer/atlas/rome-expansion.html','explorer/enquetes/mer-aral.html','404.html'];
const report=process.argv.includes('--storage-only')?JSON.parse(fs.readFileSync(path.join(out,'recette-site.json'),'utf8')):{base,date:'2026-10-27',pages:[],errors:[],limits:['Affichage et tactile simulés dans Chrome Windows ; aucun téléphone physique, Safari, Firefox ou lecteur d’écran réel.']};
const url=p=>new URL(p,base).href;
(async()=>{let browser;
try{
 if(!process.argv.includes('--storage-only')){
 browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});report.browser=browser.version();
 for(const width of [320,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<768,reducedMotion:'reduce'}),p=await context.newPage();
  for(const name of pages){
   const errors=[];p.removeAllListeners('pageerror');p.on('pageerror',e=>errors.push(e.message));
   const res=await p.goto(url(name));assert.equal(res.status(),200,name);
   await p.locator('[data-site-navigation]').waitFor({state:'attached'});
   assert.equal(await p.locator('[data-site-navigation] a').count(),7,name);
   assert.equal(await p.locator('[data-site-utility] a').count(),3,name);
   if(width<711){
    assert.equal(await p.locator('[data-site-navigation]').isVisible(),false,name);
    const b=p.locator('#mobile-menu-button');await b.focus();await p.keyboard.press('Enter');
    assert.equal(await b.getAttribute('aria-expanded'),'true',name);
    assert.equal(await p.locator('[data-site-navigation]').isVisible(),true,name);
    for(const a of await p.locator('[data-site-navigation] a').all())assert((await a.boundingBox()).height>=43);
    await p.locator('[data-site-navigation] a').last().focus();await p.keyboard.press('Escape');
    assert.equal(await b.getAttribute('aria-expanded'),'false',name);
    assert.equal(await p.evaluate(()=>document.activeElement.id),'mobile-menu-button',name);
    if(width===390){await b.tap();assert.equal(await b.getAttribute('aria-expanded'),'true');await b.tap();}
   }else assert.equal(await p.locator('[data-site-navigation]').isVisible(),true,name);
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Débordement '+name+' '+width);
   assert.deepEqual(errors,[],name);report.pages.push({name,width,status:res.status(),overflow:false,keyboard:'PASS',menu:'PASS'});
   if([390,1440].includes(width)&&['index.html','contact.html','explorer/atlas/rome-expansion.html','explorer/enquetes/mer-aral.html'].includes(name))await p.screenshot({path:path.join(out,name.replaceAll('/','-')+'-'+width+'.png'),fullPage:false});
  }
  // Les états, lieux et commandes de l’Atlas restent utilisables.
  await p.goto(url('explorer/atlas/rome-expansion.html'));await p.waitForFunction(()=>!!window.THOT_ATLAS);
  for(const ep of ['bc400','bc300','bc200','bc100','bc60','bc1','ad100','ad117'])await p.locator('#atlas-period').selectOption(ep);
  await p.locator('#atlas-compare-toggle').check();
  await p.locator('#atlas-reveal').focus();await p.keyboard.press('Home');await p.keyboard.press('ArrowRight');assert.equal(await p.evaluate(()=>THOT_ATLAS.getState().reveal),1);
  // Un burst d’événements ne doit produire qu’une géométrie par frame.
  const renders=await p.evaluate(async()=>{let count=0;const svg=document.getElementById('atlas-map'),original=svg.setAttribute.bind(svg);svg.setAttribute=(n,v)=>{if(n==='viewBox')count++;original(n,v)};const slider=document.getElementById('atlas-reveal');for(let i=0;i<100;i++){slider.value=i;slider.dispatchEvent(new Event('input',{bubbles:true}))}await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);svg.setAttribute=original;return count});
  assert(renders<=2,'Recalculs non regroupés '+renders);report['atlasFrames'+width]={inputEvents:100,mapRenders:renders};
  await p.locator('[data-atlas-zoom=in]').click();await p.locator('[data-atlas-pan=right]').click();await p.locator('[data-atlas-zoom=reset]').click();
  const controls=await p.locator('[data-atlas-zoom],[data-atlas-pan],#atlas-zoom-value,#atlas-badge-before,#atlas-badge-after,#atlas-before,#atlas-after,#atlas-reveal').evaluateAll(es=>{const r=es.filter(e=>e.checkVisibility()).map(e=>({id:e.id||e.textContent,box:e.getBoundingClientRect()}));return r.flatMap((a,i)=>r.slice(i+1).filter(b=>Math.min(a.box.right,b.box.right)-Math.max(a.box.left,b.box.left)>1&&Math.min(a.box.bottom,b.box.bottom)-Math.max(a.box.top,b.box.top)>1).map(b=>[a.id,b.id]))});assert.deepEqual(controls,[],'Commandes superposées '+width);
  for(const place of ['roma','carthage','cannae']){await p.locator('#atlas-territory-select').selectOption('place:'+place);assert(await p.locator('#atlas-card').isVisible());await p.locator('[data-atlas-close-card]').click()}
  await context.close();console.log('PASS pages et Atlas',width);
 }
 // Liens et ressources internes réellement servis, ancres comprises.
 const c=await browser.newContext(),p=await c.newPage(),links=new Set();
 for(const name of pages){await p.goto(url(name));for(const link of await p.locator('a[href],link[rel=stylesheet],script[src],img[src]').evaluateAll(es=>es.map(e=>e.href||e.src).filter(u=>u&&u.startsWith(location.origin))))links.add(link)}
 let anchors=0;for(const link of links){const u=new URL(link);const response=await c.request.get(link);assert.equal(response.status(),200,link);if(u.hash&&u.pathname.endsWith('.html')){const body=await response.text(),id=decodeURIComponent(u.hash.slice(1));assert(body.includes('id="'+id+'"')||body.includes("id='"+id+"'"),'Ancre absente '+link);anchors++}}
 report.internalHttp={urls:links.size,anchors,result:'PASS'};
 await c.close();await browser.close();browser=null;
 }
 report.errors=[];
 // Sauvegarde native, fermeture et réouverture de processus avec profil isolé.
 const profile=path.resolve(root,'../../work/test-profile-'+Date.now());
 let ctx=await chromium.launchPersistentContext(profile,{headless:true,viewport:{width:390,height:900},...(executablePath?{executablePath}:{})});let q=ctx.pages()[0];
 await q.goto(url('quiz.html'));await q.locator('#start-button').click();for(let i=0;i<5;i++){await q.locator('#answer-list button').first().click();if(await q.locator('#validate-button').isVisible())await q.locator('#validate-button').click();await q.locator('#next-button').click()}
 assert(await q.locator('#screen-result').isVisible());const quiz=await q.evaluate(()=>localStorage.getItem('thot_v2_stats'));assert(quiz);
 await q.goto(url('explorer/enquetes/mer-aral.html'));await q.waitForFunction(()=>!!window.THOT_ARAL);await q.locator('#aral-start').click();
 for(let i=1;i<=11;i++){if(i>1)await q.locator('#aral-more-documents').click();await q.locator('[data-open-doc=d'+String(i).padStart(2,'0')+']').click();await q.locator('#aral-doc-add').click()}
 assert(await q.locator('.aral-board-controls').isHidden());
 await q.locator('[data-select-card=d09]').click();await q.locator('#aral-connect-selected').click();await q.locator('#aral-link-to').selectOption('d06');await q.locator('#aral-link-note').fill('Un constat doit être interprété avec ses limites.');await q.locator('#aral-link-save').click();
 await q.locator('#aral-prepare-conclusion').click();await q.locator('[name=aral-hypothesis][value=irrigation]').check();await q.locator('#aral-conclusion').fill('Les prélèvements diminuent les apports, avec des situations différentes au Nord et au Sud.');await q.locator('#aral-submit').click();
 await q.waitForFunction(()=>JSON.parse(localStorage.getItem(THOT_ARAL.storageKey)||'{}').lastFeedback);const saved=await q.evaluate(()=>localStorage.getItem(THOT_ARAL.storageKey));
 await q.reload();await q.waitForFunction(()=>!!window.THOT_ARAL);assert.equal(await q.evaluate(()=>localStorage.getItem(THOT_ARAL.storageKey)),saved);
 await ctx.close();ctx=await chromium.launchPersistentContext(profile,{headless:true,viewport:{width:390,height:900},...(executablePath?{executablePath}:{})});q=ctx.pages()[0];await q.goto(url('explorer/enquetes/mer-aral.html'));await q.waitForFunction(()=>!!window.THOT_ARAL);
 assert.equal(await q.evaluate(()=>localStorage.getItem(THOT_ARAL.storageKey)),saved);assert.equal(await q.evaluate(()=>localStorage.getItem('thot_v2_stats')),quiz);
 await q.locator('#aral-reset').click();await q.locator('#aral-reset-confirm').click();await q.reload();await q.waitForFunction(()=>!!window.THOT_ARAL);assert.equal(await q.evaluate(()=>localStorage.getItem(THOT_ARAL.storageKey)),null);assert.equal(await q.evaluate(()=>localStorage.getItem('thot_v2_stats')),quiz);
 report.storage={native:true,reload:'PASS',browserRestart:'PASS',aralReset:'PASS',quizPreserved:'PASS',documents:11};await ctx.close();
 // Sans JS : les liens de menu restent accessibles.
 browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:900}});const n=await nojs.newPage();for(const name of ['index.html','articles/autorite.html','explorer.html','contact.html']){await n.goto(url(name));assert(await n.locator('[data-site-navigation]').isVisible(),name);assert(await n.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name)}report.noJavascript='PASS at 320 px';await nojs.close();
}catch(e){report.errors.push(e.stack);process.exitCode=1;console.error(e.stack)}finally{if(browser)await browser.close();fs.writeFileSync(path.join(out,'recette-site.json'),JSON.stringify(report,null,2));console.log('Rapport',path.join(out,'recette-site.json'))}
})();

