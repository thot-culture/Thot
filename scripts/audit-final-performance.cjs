/* Mesures Lighthouse locales de laboratoire, sans déploiement. */
const fs=require('node:fs'),path=require('node:path');
const {spawn}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.THOT_PLAYWRIGHT||'playwright');
const chromeLauncher=require('chrome-launcher');
const root=path.resolve(__dirname,'..'),out=process.env.THOT_OUTPUT_DIR||path.join(root,'work/performance');
fs.mkdirSync(out,{recursive:true});
const server=spawn(process.env.PYTHON||'python',['scripts/preview.py','--port','8867'],{cwd:root,stdio:'ignore'});
let chrome;
(async()=>{
 try{
  for(let n=0;;n++){try{if((await fetch('http://127.0.0.1:8867/Thot/')).status===200)break}catch(e){if(n>100)throw e}await new Promise(r=>setTimeout(r,100))}
  const {default:lighthouse}=await import(pathToFileURL(require.resolve('lighthouse')).href);
  chrome=await chromeLauncher.launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage']});
  const summary=[];
  for(const page of ['index.html','articles/autorite.html','articles/pieuvres-couleur.html','explorer/atlas/rome-expansion.html','explorer/enquetes/mer-aral.html','quiz.html']){
   const r=await lighthouse('http://127.0.0.1:8867/Thot/'+page,{port:chrome.port,logLevel:'error',output:'json',onlyCategories:['performance','accessibility','best-practices','seo']});
   const lhr=r.lhr;
   fs.writeFileSync(path.join(out,page.replaceAll('/','-')+'.lighthouse.json'),r.report);
   const keys=['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index'];
   const row={page,fetchTime:lhr.fetchTime,lighthouseVersion:lhr.lighthouseVersion,environment:lhr.environment,
    scores:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,v.score])),
    metrics:Object.fromEntries(keys.map(k=>[k,{value:lhr.audits[k]?.numericValue,unit:lhr.audits[k]?.numericUnit}])),
    warnings:lhr.runWarnings,runtimeError:lhr.runtimeError,
    failedAudits:Object.values(lhr.audits).filter(a=>a.score===0&&a.details?.type!=='opportunity').map(a=>({id:a.id,title:a.title,description:a.description,details:a.details}))};
   summary.push(row);console.log('LIGHTHOUSE',JSON.stringify(row));
  }
  fs.writeFileSync(path.join(out,'lighthouse-summary.json'),JSON.stringify(summary,null,2));
 }catch(e){process.exitCode=1;console.error(e.stack)}
 finally{if(chrome)await chrome.kill();server.kill()}
})();
