/* Attente HTTP bornée, partagée par les recettes navigateur et Lighthouse. */
const {readFileSync}=require('node:fs');
const path=require('node:path');
async function waitForPreview(server,base,{root,timeoutMs=10000,intervalMs=100,fetchImpl=fetch}={}){
 const deadline=Date.now()+timeoutMs;
 const expected=root?readFileSync(path.join(root,'index.html'),'utf8'):null;
 let cause;
 while(Date.now()<deadline){
  if(server.exitCode!==null&&server.exitCode!==undefined)throw new Error('Le serveur d’aperçu s’est arrêté : '+server.exitCode);
  try{
   const response=await fetchImpl(base,{signal:AbortSignal.timeout(Math.max(1,Math.min(1000,deadline-Date.now())))});
   if(response.status!==200)throw new Error('HTTP '+response.status);
   if(expected!==null&&await response.text()!==expected)throw new Error('Le serveur ne sert pas la copie de travail attendue');
   return;
  }catch(error){cause=error;}
  await new Promise(resolve=>setTimeout(resolve,Math.min(intervalMs,Math.max(0,deadline-Date.now()))));
 }
 const error=new Error('HTTP local indisponible après '+timeoutMs+' ms : '+(cause?.cause?.code||cause?.message),{cause});
 error.code='LOCAL_PREVIEW_UNAVAILABLE';throw error;
}
module.exports={waitForPreview};
