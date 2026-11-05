/* Mesures Lighthouse locales de laboratoire, sans déploiement. */
const fs=require('node:fs'),path=require('node:path');
const {spawn}=require('node:child_process');
const net=require('node:net');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.THOT_PLAYWRIGHT||'playwright');
const {waitForPreview}=require('./local-preview.cjs');
const root=path.resolve(process.env.THOT_AUDIT_ROOT||path.join(__dirname,'..')),out=process.env.THOT_OUTPUT_DIR||path.join(root,'work/performance');
fs.mkdirSync(out,{recursive:true});
let browser,server;
const freePort=()=>new Promise((resolve,reject)=>{const probe=net.createServer();probe.once('error',reject);probe.listen(0,'127.0.0.1',()=>{const port=probe.address().port;probe.close(error=>error?reject(error):resolve(port))})});
(async()=>{
 try{
  const lighthousePath=require.resolve('lighthouse');
  const {default:lighthouse}=await import(pathToFileURL(lighthousePath).href);
  const httpPort=await freePort(),base=`http://127.0.0.1:${httpPort}/Thot/`;
  server=spawn(process.env.PYTHON||'python',['scripts/preview.py','--port',String(httpPort)],{cwd:root,stdio:'ignore'});
  await waitForPreview(server,base,{root});
  const port=await freePort();
  // Playwright est déjà requis : il lance et ferme le navigateur, Lighthouse
  // se connecte à son port CDP. Aucun import direct de chrome-launcher requis.
  browser=await chromium.launch({headless:true,executablePath:process.env.THOT_BROWSER_EXECUTABLE||chromium.executablePath(),args:[`--remote-debugging-port=${port}`,'--no-sandbox','--disable-dev-shm-usage']});
  const summary=[];
  for(const page of ['index.html','articles/autorite.html','articles/pieuvres-couleur.html','explorer/atlas/rome-expansion.html','explorer/enquetes/mer-aral.html','quiz.html']){
   const r=await lighthouse(base+page,{port,logLevel:'error',output:'json',onlyCategories:['performance','accessibility','best-practices','seo']});
   const lhr=r.lhr;
   fs.writeFileSync(path.join(out,page.replaceAll('/','-')+'.lighthouse.json'),r.report);
   const keys=['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index','total-byte-weight'];
   const row={page,fetchTime:lhr.fetchTime,lighthouseVersion:lhr.lighthouseVersion,environment:lhr.environment,
    scores:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,v.score])),
    metrics:Object.fromEntries(keys.map(k=>[k,{value:lhr.audits[k]?.numericValue,unit:lhr.audits[k]?.numericUnit}])),
    settings:lhr.configSettings,
    inp:{status:'non mesuré',reason:'Navigation Lighthouse ; TBT ne constitue pas une mesure INP terrain.'},
    warnings:lhr.runWarnings,runtimeError:lhr.runtimeError,
    failedAudits:Object.values(lhr.audits).filter(a=>a.score===0&&a.details?.type!=='opportunity').map(a=>({id:a.id,title:a.title,description:a.description,details:a.details}))};
   summary.push(row);console.log('LIGHTHOUSE',JSON.stringify(row));
   if(lhr.runtimeError)process.exitCode=1;
  }
  fs.writeFileSync(path.join(out,'lighthouse-summary.json'),JSON.stringify(summary,null,2));
 }catch(e){process.exitCode=1;console.error(e.stack);fs.writeFileSync(path.join(out,'performance-status.json'),JSON.stringify({status:'non exécuté',code:e.code,error:e.message},null,2))}
 finally{if(browser)await browser.close();if(server)server.kill()}
})();
