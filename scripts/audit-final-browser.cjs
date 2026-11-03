/* Audit HTTP reproductible, cinq largeurs, WCAG AA et preuves visuelles.
   Dépendances de test seulement : playwright et axe-core, installées par la CI. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require(process.env.THOT_PLAYWRIGHT||'playwright');
const root=path.resolve(process.env.THOT_AUDIT_ROOT||path.join(__dirname,'..'));
const out=path.resolve(process.env.THOT_OUTPUT_DIR||path.join(root,'work/audit-final'));
const axePath=process.env.THOT_AXE_PATH||require.resolve('axe-core/axe.min.js');
const base='http://127.0.0.1:8865/Thot/';
const pages=['index.html','bibliotheque.html','explorer.html','notre-methode.html','quiz.html','quiz-autrices.html',
'mentions-legales.html','confidentialite.html','contact.html','404.html',
...fs.readdirSync(path.join(root,'articles')).filter(n=>n.endsWith('.html')).map(n=>'articles/'+n),
'explorer/atlas/rome-expansion.html','explorer/enquetes/mer-aral.html'];
fs.mkdirSync(out,{recursive:true});
const report={pages:[],interactions:[],limitations:['Linux Chromium, tactile et mobile simulés ; aucun téléphone ou lecteur d’écran réel.',
'Les erreurs de serveurs externes sont consignées séparément et ne prouvent pas une erreur du code local.']};

async function activities(p,name){
 const done=[];
 if(name==='articles/autorite.html'){
  for(const block of await p.locator('.authorite-case').all()){
   for(const choice of await block.locator('.authorite-choice').all()){
    await choice.focus();await p.keyboard.press('Enter');assert.equal(await choice.getAttribute('aria-pressed'),'true');
    assert((await block.locator('.authorite-feedback').innerText()).trim());
   }
  }
  for(let n=0;n<3;n++){
   for(const choice of await p.locator('[data-decode-case]:visible [data-decode-option]').all()){
    await choice.click();assert((await p.locator('#decode-feedback').innerText()).trim());
   }
   if(n<2)await p.locator('#decode-next').click();
  }
  assert((await p.locator('#decode-progress').innerText()).includes('3 sur 3'));
  await p.locator('#decode-reset').click();assert((await p.locator('#decode-progress').innerText()).includes('1 sur 3'));
  done.push('trois situations, toutes réponses, trois scènes Décode et réinitialisation');
 }
 if(['quiz-autrices.html','articles/autrices-pseudonymes.html'].includes(name)){
  const pairs={currer:'charlotte',ellis:'emily',acton:'anne',eliot:'maryanne',sand:'aurore'};
  await p.locator('[data-pen=currer]').focus();await p.keyboard.press('Enter');
  await p.locator('[data-author=emily]').click();assert((await p.locator('#quiz-status').innerText()).includes('pas la bonne'));
  for(const [pen,author] of Object.entries(pairs)){
   await p.locator('[data-pen='+pen+']').focus();await p.keyboard.press('Enter');
   assert(await p.locator(':focus').getAttribute('data-author'));
   await p.locator('[data-author='+author+']').click();assert(await p.locator('[data-pen='+pen+']').isDisabled());
  }
  assert(await p.locator('#quiz-explanations').isVisible());await p.locator('#quiz-reset').click();
  assert.equal(await p.locator('[data-pen]:disabled').count(),0);done.push('jeu autrices complet, erreur, clavier, explications, réinitialisation');
 }
 if(name==='articles/pieuvres-couleur.html'){
  const slider=p.locator('#chromato-curseur');await slider.focus();await p.keyboard.press('End');assert.equal(await slider.inputValue(),'100');
  await p.keyboard.press('Home');assert.equal(await slider.inputValue(),'0');
  for(const id of ['chromatophore','sac','muscles','iridophores','leucophores','lumiere','nerfs']){
   await p.locator('[data-structure='+id+']').click();assert(await p.locator('[data-structure-panel='+id+']').isVisible());
  }
  await p.locator('[data-skin-toggle=iridophores]').uncheck();assert(await p.locator('[data-skin-layer=iridophores]').isHidden());
  await p.locator('[data-skin-toggle=iridophores]').check();done.push('curseur clavier, sept structures, couches activables');
 }
 if(name==='articles/puissance-etats-unis.html'){
  for(const button of await p.locator('[data-cas]').all()){
   await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');
  }
  for(const button of await p.locator('[data-etape]').all()){
   await button.focus();await p.keyboard.press('Space');assert.equal(await button.getAttribute('aria-pressed'),'true');
  }
  await p.locator('#comparateur-direct').click();assert(await p.locator('.comparateur-table').isVisible());
  assert.equal(await p.locator('.comparateur-table tbody tr').count(),4);
  done.push('trois cas, chronologie au clavier, tableau comparatif');
 }
 if(name==='articles/roubaix-1917.html'){
  for(const button of await p.locator('[data-date-index]').all()){
   await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');assert((await p.locator('#timeline-title').innerText()).trim());
  }
  await p.locator('[data-date-index]').first().focus();await p.keyboard.press('End');
  assert.equal(await p.locator('[data-date-index]').last().getAttribute('aria-pressed'),'true');
  await p.locator('[data-document-action=open]').click();await p.waitForFunction(()=>document.getElementById('laine-statut').textContent.includes('Grossissement'));
  for(const button of await p.locator('#lecture-affiche-laine [data-visual-control]').all()){
   await button.click();assert((await p.locator('#laine-statut').innerText()).trim());
  }
  await p.locator('[data-document-action=reset]').click();assert((await p.locator('#laine-statut').innerText()).includes('Vue entière'));
  done.push('huit dates et clavier, original chargé, repères du document, remise à zéro');
 }
 if(name==='articles/evolution-strategies-militaires.html'){
  for(const module of await p.locator('[data-sm-module]').all()){
   for(const button of await module.locator('[data-sm-select]').all()){
    await button.focus();await p.keyboard.press('Enter');assert.equal(await button.getAttribute('aria-pressed'),'true');
    assert.equal(await module.locator('[data-sm-panel]:visible').count(),1);
   }
  }
  for(const detail of await p.locator('[data-sm-module=document] details').all()){
   await detail.locator('summary').focus();await p.keyboard.press('Enter');assert(await detail.locator('p').isVisible());
  }
  done.push('tous les états des trois modules, trois notices documentaires au clavier');
 }

 if(name==='explorer/atlas/rome-expansion.html'){
  for(const person of ['hannibal','caesar','augustus','trajan']){
   const trigger=p.locator('[data-atlas-person='+person+']');
   await trigger.click();assert(await p.locator('#atlas-modal').isVisible());await p.keyboard.press('Escape');
   assert(await trigger.evaluate(e=>e===document.activeElement));
   await trigger.click();await p.getByRole('button',{name:'Suivre le parcours sur la carte'}).click();
   assert.equal(await p.evaluate(()=>document.activeElement.id),'atlas-journey-title');
   let steps=0;while(!await p.locator('#atlas-journey-next').isDisabled()){
    assert(steps++<6);await p.locator('#atlas-journey-next').click();
   }
   await p.locator('#atlas-journey-close').click();
  }
  for(const trigger of await p.locator('[data-atlas-document]').all()){
   await trigger.click();assert(await p.locator('#atlas-modal').isVisible());
   const range=p.locator('#atlas-modal input[type=range]');
   if(await range.count()){await range.focus();await p.keyboard.press('End');assert.equal(await range.inputValue(),'300')}
   await p.keyboard.press('Escape');assert(await trigger.evaluate(e=>e===document.activeElement));
  }
  done.push('quatre personnages, quatre parcours complets, quatre documents, agrandissement, dialogues Échap et focus');
 }
 if(name==='explorer/enquetes/mer-aral.html'){
  await p.locator('#aral-start').click();
  for(let n=1;n<=11;n++){
   if(n>1)await p.locator('#aral-more-documents').click();
   const id='d'+String(n).padStart(2,'0'),trigger=p.locator('[data-open-doc='+id+']');
   await trigger.click();assert(await p.locator('#aral-document').isVisible());
   await p.keyboard.press('Escape');assert(await trigger.evaluate(e=>e===document.activeElement));
   await trigger.click();await p.locator('#aral-doc-add').click();
  }
  await p.locator('[data-board-mode=map]').click();await p.locator('#aral-arrange').click();
  await p.locator('[data-board-mode=list]').click();await p.locator('[data-select-card=d09]').click();
  await p.locator('#aral-connect-selected').click();await p.locator('#aral-link-to').selectOption('d06');
  await p.locator('#aral-link-note').fill('Une conséquence ne suffit pas à établir la cause.');await p.locator('#aral-link-save').click();
  assert.equal(await p.evaluate(()=>THOT_ARAL.getState().links.length),1);
  await p.locator('#aral-prepare-conclusion').click();
  for(const [id,role] of [['d04','support'],['d06','support'],['d08','insufficient'],['d10','counter']]){
   await p.locator('[data-proof-role='+id+']').selectOption(role);
  }
  await p.locator('[name=aral-hypothesis][value=irrigation]').check();
  await p.locator('#aral-conclusion').fill('Les prélèvements diminuent les apports ; le climat peut aggraver certains épisodes. Le Nord diffère du Sud.');
  await p.locator('#aral-submit').click();assert(await p.locator('#aral-feedback').isVisible());
  await p.locator('#aral-revise').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'aral-conclusion');
  await p.locator('#aral-reset').click();await p.keyboard.press('Escape');
  await p.locator('#aral-reset').click();await p.locator('#aral-reset-confirm').click();
  assert.deepEqual(await p.evaluate(()=>THOT_ARAL.getState().cards),{});
  done.push('onze pièces, dialogues Échap et focus, tableau/carte, relation, argument et bilan, révision, remise à zéro');
 }

 for(const term of await p.locator('.thot-terme').all()){
  await term.focus();await p.keyboard.press('Enter');assert.equal(await term.getAttribute('aria-expanded'),'true');
  await p.keyboard.press('Escape');assert.equal(await term.getAttribute('aria-expanded'),'false');
  assert(await term.evaluate(e=>document.activeElement===e));
 }
 if(await p.locator('.thot-terme').count())done.push('glossaire, Échap, restitution du focus');
 for(const copy of await p.locator('[data-share-copy]:visible').all()){
  await copy.click();await p.waitForFunction(()=>[...document.querySelectorAll('[data-share-status]')].some(e=>e.textContent.trim()));
  done.push('copie du lien avec résultat utilisateur explicite');
 }
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Débordement après interactions '+name);
 return done;
}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const server=spawn(process.env.PYTHON||'python',['scripts/preview.py','--port','8865'],{cwd:root,stdio:'ignore'});
let browser;
(async()=>{
try{
 for(let n=0;;n++){try{const r=await fetch(base);assert.equal(r.status,200);break}catch(e){if(n>100)throw e;await sleep(100)}}
 browser=await chromium.launch({headless:true,...(process.env.THOT_BROWSER_EXECUTABLE?{executablePath:process.env.THOT_BROWSER_EXECUTABLE}:{})});
 report.browser=browser.version();report.platform=process.platform;
 for(const width of [320,390,768,1024,1440]){
  for(const name of pages){
   const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<768,reducedMotion:'reduce'});
   const p=await context.newPage();p.setDefaultTimeout(12000);
   const item={name,width,errors:[],localHttpErrors:[],externalHttpErrors:[],requestFailures:[]};
   p.on('pageerror',e=>item.errors.push(e.message));
   p.on('response',r=>{if(r.status()>=400)(r.url().startsWith(base)?item.localHttpErrors:item.externalHttpErrors).push({url:r.url(),status:r.status()})});
   p.on('requestfailed',r=>item.requestFailures.push({url:r.url(),error:r.failure()}));
   try{
    const r=await p.goto(base+name,{waitUntil:'domcontentloaded'});assert.equal(r.status(),200);
    await p.evaluate(()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager')});
    await p.evaluate(()=>Promise.race([Promise.allSettled([...document.images].map(i=>i.decode())),new Promise(r=>setTimeout(r,5000))]));
    item.overflow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert(item.overflow<=1,'Débordement horizontal '+name+' '+width);
    item.brokenImages=await p.locator('img').evaluateAll(es=>es.filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src));
    const nav=p.locator('#primary-navigation'),menu=p.locator('#mobile-menu-button');
    if(width<711){
     await menu.focus();await p.keyboard.press('Enter');assert.equal(await menu.getAttribute('aria-expanded'),'true');
     assert(await nav.isVisible());await nav.locator('a').last().focus();await p.keyboard.press('Escape');
     assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.equal(await p.evaluate(()=>document.activeElement.id),'mobile-menu-button');
     await menu.tap();assert(await nav.isVisible());await menu.tap();
     item.menu='PASS clavier, Échap, focus et toucher simulé';
    }else{assert(await nav.isVisible());item.menu='PASS navigation visible'}
    await p.addScriptTag({path:axePath});
    item.axe=await p.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});
     return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),
      incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.length})),passes:r.passes.length}});
    if([390,1440].includes(width)){
     const id=name.replaceAll('/','-')+'-'+width;
     await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(out,id+'-top.png')});
     await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight/2));await p.screenshot({path:path.join(out,id+'-middle.png')});
     await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await p.screenshot({path:path.join(out,id+'-footer.png')});
     if(name==='articles/roubaix-1917.html')await p.locator('.thot-document-overline').screenshot({path:path.join(out,'roubaix-contrast-'+width+'.png')});
     if(name==='index.html')await p.locator('.latest-story').screenshot({path:path.join(out,'home-feature-'+width+'.png')});
    }
    item.activities=await activities(p,name);
    assert.deepEqual(item.errors,[]);assert.deepEqual(item.localHttpErrors,[]);
    assert.deepEqual(item.axe.violations,[],'Violations axe '+name+' '+width);
    item.result='PASS';
   }catch(e){item.result='FAIL';item.error=e.stack}
   report.pages.push(item);console.log('AUDIT',width,name,item.result,'axe',item.axe?.violations.length);
   fs.writeFileSync(path.join(out,'audit-browser.json'),JSON.stringify(report,null,2));await context.close();
  }
 }
 // Recherche, filtres, URL et navigation réelle ; aucune injection de résultat.
 const c=await browser.newContext({viewport:{width:390,height:900},hasTouch:true});const p=await c.newPage();
 p.on('pageerror',e=>{throw e});
 await p.goto(base);await p.locator('#home-article-search').fill('Roubaix');await p.locator('.home-search button').click();
 assert(p.url().includes('/Thot/bibliotheque.html?q=Roubaix'));
 assert.equal(await p.locator('.article-card:visible').count(),1);
 await p.locator('#clear-search').click();assert.equal(await p.locator('.article-card:visible').count(),fs.readdirSync(path.join(root,'articles')).filter(n=>n.endsWith('.html')).length);
 await p.locator('[data-filter=arts]').click();assert.equal(await p.locator('.article-card:visible').count(),1);
 await p.locator('#article-search').fill('inexistant-zzzz');assert.equal(await p.locator('.article-card:visible').count(),0);
 await p.locator('#reset-filters').click();assert.equal(await p.locator('#article-search').inputValue(),'');
 await p.locator('#article-search').fill('CHARLOTTE BRONTE');assert.equal(await p.locator('.article-card:visible').count(),1);
 report.interactions.push('PASS recherche accueil, URL /Thot/, accents, filtres combinés, vide et réinitialisation');
 for(const start of ['#start-button','#daily-start-button']){
  await p.goto(base+'quiz.html');await p.locator(start).click();
  let count=0;
  while(await p.locator('#screen-result').isHidden()){
   assert(count++<30);
   const expected=await p.evaluate(()=>correctIndexes(round[index]));
   for(const i of expected)await p.locator('#answer-list button[data-idx="'+i+'"]').click();
   if(await p.locator('#validate-button').isVisible())await p.locator('#validate-button').click();
   assert(await p.locator('#feedback').isVisible());await p.locator('#next-button').click();
  }
  assert.equal(await p.evaluate(()=>score),count);assert(await p.evaluate(()=>!!localStorage.getItem('thot_v2_stats')));
  report.interactions.push('PASS '+start+' : partie réelle complète, '+count+' réponses et score correct, sauvegarde native');
 }
 await c.close();

 // Retarder les JS externes reproduit la cause du CLS : le menu doit déjà
 // fonctionner lorsque le main apparaît, avant les contrôleurs des activités.
 for(const name of ['index.html','quiz.html','articles/pieuvres-couleur.html','explorer/enquetes/mer-aral.html','explorer/atlas/rome-expansion.html']){
  const slow=await browser.newContext({viewport:{width:390,height:900}});
  await slow.route('**/*.js*',async route=>{await sleep(1200);await route.continue()});
  const q=await slow.newPage();await q.goto(base+name,{waitUntil:'commit'});await q.locator('main').waitFor({state:'attached'});
  assert(await q.locator('header').getAttribute('data-menu-ready')!==null,'Menu initialisé trop tard '+name);
  assert(await q.locator('#primary-navigation').isHidden());
  const top=await q.locator('main').evaluate(e=>e.getBoundingClientRect().top);
  const mapTop=name.includes('rome-expansion')?await q.locator('.atlas-map-shell').evaluate(e=>e.getBoundingClientRect().top):null;
  await q.waitForLoadState('domcontentloaded');
  const after=await q.locator('main').evaluate(e=>e.getBoundingClientRect().top);
  const trace={name,before:top,after,header:await q.locator('header').first().evaluate(e=>e.getBoundingClientRect().height),scrollY:await q.evaluate(()=>scrollY)};
  report.slowLoading=(report.slowLoading||[]).concat(trace);
  assert(Math.abs(after-top)<=1,'Le main se déplace au chargement des scripts '+JSON.stringify(trace));
  if(mapTop!==null)assert(Math.abs((await q.locator('.atlas-map-shell').evaluate(e=>e.getBoundingClientRect().top))-mapTop)<=1,'La carte se déplace au chargement des commandes');
  await slow.close();
 }
 report.interactions.push('PASS menu prêt avant le main et position stable avec JS externes retardés de 1,2 seconde, cinq gabarits');


 const broken=await browser.newContext({viewport:{width:390,height:900}});
 await broken.route('**/questions-expert.js',r=>r.abort());
 const failure=await broken.newPage(),expectedErrors=[];
 failure.on('pageerror',e=>expectedErrors.push(e.message));
 await failure.goto(base+'quiz.html',{waitUntil:'domcontentloaded'});
 assert(await failure.locator('#quiz-load-status').isVisible());
 assert((await failure.locator('#quiz-load-message').innerText()).includes('pas pu être chargées'));
 assert(await failure.locator('#start-button').isDisabled());
 assert(expectedErrors.every(e=>e.includes('Chargement incomplet')));
 await broken.close();
 report.interactions.push('PASS banque volontairement indisponible : notice réelle visible et démarrage désactivé');

 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:900}});
 for(const name of pages){
  const q=await nojs.newPage();await q.goto(base+name,{waitUntil:'domcontentloaded'});
  assert(await q.locator('#primary-navigation').isVisible());
  assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await q.close();
 }
 await nojs.close();report.interactions.push('PASS navigation et reflow sans JavaScript, 18 pages à 320 px');
 const unknown=await fetch(base+'page-inconnue-audit.html');assert.equal(unknown.status,404);
 report.interactions.push('PASS HTTP 404 pour URL inconnue');
 if(report.pages.some(p=>p.result==='FAIL'))process.exitCode=1;
}catch(e){report.error=e.stack;process.exitCode=1;console.error(e.stack)}
finally{
 if(browser)await browser.close();server.kill();
 fs.writeFileSync(path.join(out,'audit-browser.json'),JSON.stringify(report,null,2));
 console.log('AUDIT_SUMMARY',JSON.stringify({browser:report.browser,pages:report.pages.length,failed:report.pages.filter(p=>p.result==='FAIL').map(p=>({name:p.name,width:p.width,error:p.error})),interactions:report.interactions,error:report.error}));
}
})();
