#!/usr/bin/env node
// Moteur réel et boutons du HTML, dans un DOM simulé sans dépendance.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('quiz-autrices.html', root), 'utf8');
const code = readFileSync(new URL('assets/quiz-autrices.js', root), 'utf8');
const attributes = value => Object.fromEntries([...value.matchAll(/([^\s=/>]+)(?:="([^"]*)")?/g)].map(m=>[m[1],m[2]??'']));
function makePage(run = true, reduced = true, explanation = '', markup = html) {
  let active, nextTimer = 1;
  const timers = new Map();
  class Node {
    constructor(attrs = {}, text = '') {
      this.attrs = new Map(Object.entries(attrs)); this.textContent = text; this.disabled = Object.hasOwn(attrs,'disabled'); this.hidden = Object.hasOwn(attrs,'hidden');
      this.dataset = Object.fromEntries(Object.entries(attrs).filter(([key])=>key.startsWith('data-')).map(([key,value])=>[key.slice(5),value])); this.events = new Map();
      const classes = new Set((attrs.class||'').split(/\s+/));
      this.classList = {add:name=>classes.add(name),remove:(...names)=>names.forEach(name=>classes.delete(name)),contains:name=>classes.has(name)};
    }
    setAttribute(key,value){this.attrs.set(key,value)}
    getAttribute(key){return this.attrs.get(key)}
    removeAttribute(key){this.attrs.delete(key)}
    addEventListener(type,callback){this.events.set(type,callback)}
    focus(){active=this}
    scrollIntoView(options){this.scroll=options}
  }
  const buttons=[...markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(m=>new Node(attributes(m[1]),m[2]));
  const left=buttons.filter(button=>button.dataset.pen),right=buttons.filter(button=>button.dataset.author);
  if(explanation)left.find(button=>button.dataset.pen==='eliot').dataset.explanation=explanation;
  const nodes=new Map([...markup.matchAll(/<[a-z][\w-]*\b([^>]*\bid="[^"]+"[^>]*)>/g)].map(m=>{const a=attributes(m[1]);return[a.id,new Node(a)]}));
  const reset=buttons.find(button=>button.attrs.get('id')==='quiz-reset'); nodes.set('quiz-reset',reset);
  const heading=new Node();nodes.get('quiz-explanations').querySelector=()=>heading;
  const document={querySelectorAll:selector=>selector==='[data-pen]'?left:right,getElementById:id=>nodes.get(id)};
  if(run)vm.runInNewContext(code,{document,matchMedia:()=>({matches:reduced}),setTimeout:callback=>{const id=nextTimer++;timers.set(id,callback);return id},clearTimeout:id=>timers.delete(id)});
  const click=(button,detail=1)=>{if(!button.disabled)button.events.get('click')?.({detail})};
  return{left,right,nodes,reset,heading,timers,active:()=>active,click,pen:key=>left.find(button=>button.dataset.pen===key),author:key=>right.find(button=>button.dataset.author===key)};
}
{
  const page=makePage(false);
  assert.equal([...page.left,...page.right,page.reset].filter(button=>button.disabled).length,11);
  assert.equal(page.nodes.get('quiz-load-status').hidden,false);
}
{
  const page=makePage();
  assert.ok([...page.left,...page.right,page.reset].every(button=>!button.disabled));
  assert.equal(page.nodes.get('quiz-load-status').hidden,true);
  page.click(page.author('anne')); assert.match(page.nodes.get('quiz-status').textContent,/d’abord/);
  page.click(page.pen('currer')); page.click(page.author('anne'));
  assert.equal(page.pen('currer').getAttribute('aria-pressed'),'true','Garder le pseudonyme après erreur');
  assert.match(page.nodes.get('quiz-instruction').textContent,/Currer Bell/);
  assert.equal(page.author('anne').classList.contains('is-wrong'),true);
  page.click(page.author('anne')); assert.equal(page.timers.size,1,'Pas de temporisation concurrente pour une même autrice');
  page.click(page.author('charlotte')); assert.equal(page.pen('currer').disabled,true);assert.equal(page.author('charlotte').disabled,true);
  page.click(page.pen('acton'));page.click(page.author('anne'));
  assert.equal(page.author('anne').classList.contains('is-wrong'),false,'Bonne réponse verte immédiatement');
  assert.equal(page.timers.size,0);
  assert.match(page.nodes.get('quiz-progress').textContent,/2 associations sur 5/);
  page.click(page.pen('ellis'));page.click(page.author('maryanne')); assert.equal(page.timers.size,1);
  page.click(page.reset);assert.equal(page.timers.size,0,'Reset annule toutes les temporisations');
  assert.ok([...page.left,...page.right].every(button=>!button.disabled&&!button.classList.contains('is-wrong')&&!button.classList.contains('is-matched')&&button.getAttribute('aria-pressed')==='false'&&button.dataset.pair===undefined));
  assert.equal(page.active(),page.left[0]);assert.equal(page.nodes.get('quiz-explanations').hidden,true);
  assert.match(page.nodes.get('quiz-progress').textContent,/0 association sur 5/);
}
for(const reduced of [false,true]){
 const page=makePage(true,reduced);
 for(const[pen,author]of Object.entries({sand:'aurore',eliot:'maryanne',acton:'anne',ellis:'emily',currer:'charlotte'})){
  page.click(page.pen(pen));page.click(page.author(author));
 }
 assert.equal(page.nodes.get('quiz-explanations').hidden,false);
 assert.equal(page.active(),page.heading);
 assert.equal(page.nodes.get('quiz-explanations').scroll.behavior,reduced?'auto':'smooth');
 assert.ok([...page.left,...page.right].every(button=>button.disabled));
 assert.match(page.nodes.get('quiz-progress').textContent,/5 associations sur 5/);
 page.click(page.reset);assert.ok([...page.left,...page.right].every(button=>!button.disabled));
}
{
 const original='George Eliot est le pseudonyme de Mary Anne (« Marian ») Evans.';
 const page=makePage(true,true,original);page.click(page.pen('eliot'));page.click(page.author('maryanne'));
 assert.equal(page.nodes.get('quiz-status').textContent,original,'Explication propre à une page conservée mot pour mot');
}
console.log('PASS : 5 associations, mauvaise réponse puis nouvel essai, sélection conservée, temporisations, réinitialisation, focus, fin et réduction des animations.');
for(const [path,eliotExplanation] of [
 ['quiz-autrices.html','George Eliot est le pseudonyme de Mary Anne Evans, qui a utilisé le prénom Marian.'],
 ['articles/autrices-pseudonymes.html','George Eliot est le pseudonyme de Mary Anne (« Marian ») Evans.']
]){
 const markup=readFileSync(new URL(path,root),'utf8');
 const scripts=[...markup.matchAll(/<script\b([^>]*)>/g)].map(match=>attributes(match[1]));
 assert.ok(scripts.some(script=>/^(?:\.\.\/)?assets\/quiz-autrices\.js(?:\?[^\s]*)?$/.test(script.src||'')&&Object.hasOwn(script,'defer')),'Module partagé chargé avec defer dans '+path);
 const section=attributes(markup.match(/<section\b([^>]*class="quiz-pseudonymes"[^>]*)>/)[1]);
 const title=section['aria-labelledby'];
 assert.ok(title);
 const initial=makePage(false,true,'',markup);
 assert.equal(initial.nodes.get(title)?.getAttribute('tabindex'),'-1','Titre du jeu focalisable : '+path);
 assert.equal(initial.left.length,5);assert.equal(initial.right.length,5);
 assert.equal([...initial.left,...initial.right,initial.reset].filter(button=>button.disabled).length,11,'Onze commandes initialement inactives : '+path);
 assert.ok(initial.nodes.has('quiz-instruction')&&initial.nodes.has('quiz-progress')&&initial.nodes.has('quiz-explanations'));
 const page=makePage(true,true,'',markup);
 assert.equal(page.nodes.get('quiz-status').getAttribute('role'),'status');
 for(const [pen,author] of Object.entries({eliot:'maryanne',currer:'charlotte',ellis:'emily',acton:'anne',sand:'aurore'})){
  page.click(page.pen(pen));page.click(page.author(author));
  if(pen==='eliot')assert.equal(page.nodes.get('quiz-status').textContent,eliotExplanation,'Explication originale propre à '+path);
  assert.equal(page.pen(pen).disabled,true);assert.equal(page.author(author).disabled,true);
 }
 assert.equal(page.nodes.get('quiz-explanations').hidden,false);assert.equal(page.active(),page.heading);
 assert.match(page.nodes.get('quiz-progress').textContent,/5 associations sur 5/);
 page.click(page.reset);
 assert.equal(page.nodes.get('quiz-explanations').hidden,true);assert.equal(page.active(),page.left[0]);
 assert.ok([...page.left,...page.right].every(button=>!button.disabled&&button.getAttribute('aria-pressed')==='false'&&button.dataset.pair===undefined));
 assert.match(page.nodes.get('quiz-progress').textContent,/0 association sur 5/);
 console.log('PASS : intégration, cinq associations, explication Eliot préservée et reset dans '+path+'.');
 const keyboard=makePage(true,true,'',markup);
 for(const detail of [1,2]){
  const pen=keyboard.pen('currer');pen.focus();keyboard.click(pen,detail);
  assert.equal(keyboard.active(),pen,'Le clic souris/tactile ne déplace pas le focus vers les autrices : '+path);
 }
 keyboard.pen('currer').focus();keyboard.click(keyboard.pen('currer'),0);
 assert.equal(keyboard.active(),keyboard.right[0],'Le clavier saute les pseudonymes restants vers la première autrice : '+path);
 keyboard.click(keyboard.author('anne'),0);
 assert.equal(keyboard.pen('currer').getAttribute('aria-pressed'),'true','Sélection clavier conservée après erreur : '+path);
 assert.equal(keyboard.active(),keyboard.author('anne'),'Le focus reste sur la tentative incorrecte : '+path);
 keyboard.author('charlotte').focus();keyboard.click(keyboard.author('charlotte'),0);
 assert.equal(keyboard.active(),keyboard.pen('ellis'),'Après réussite, retour au premier pseudonyme disponible : '+path);
 keyboard.pen('acton').focus();keyboard.click(keyboard.pen('acton'),0);
 assert.equal(keyboard.active(),keyboard.author('anne'));
 keyboard.click(keyboard.author('anne'),0);
 assert.equal(keyboard.author('anne').disabled,true);
 keyboard.pen('ellis').focus();keyboard.click(keyboard.pen('ellis'),0);
 assert.equal(keyboard.active(),keyboard.author('aurore'),'Le focus clavier ignore les autrices déjà associées : '+path);
 // Un pointeur peut conserver le focus courant sans recentrage forcé par le jeu.
 const beforePointer=keyboard.active();keyboard.click(keyboard.pen('sand'),1);
 assert.equal(keyboard.active(),beforePointer,'Le gestionnaire pointeur conserve aussi un focus déjà dans la colonne de droite : '+path);
 keyboard.click(keyboard.reset);
 assert.equal(keyboard.active(),keyboard.left[0]);
 keyboard.click(keyboard.pen('eliot'),0);
 assert.equal(keyboard.active(),keyboard.author('anne'),'Le reset restaure la première autrice disponible : '+path);
 keyboard.author('maryanne').focus();keyboard.click(keyboard.author('maryanne'),0);
 assert.equal(keyboard.nodes.get('quiz-status').textContent,eliotExplanation,'La nouvelle navigation conserve la variante Eliot : '+path);
 for(const [pen,author] of Object.entries({currer:'charlotte',ellis:'emily',acton:'anne',sand:'aurore'})){
  keyboard.pen(pen).focus();keyboard.click(keyboard.pen(pen),0);
  assert.equal(keyboard.active(),keyboard.right.find(button=>!button.disabled));
  keyboard.author(author).focus();keyboard.click(keyboard.author(author),0);
 }
 assert.equal(keyboard.active(),keyboard.heading,'La fin du parcours clavier focalise toujours les explications : '+path);
 assert.equal(keyboard.nodes.get('quiz-explanations').hidden,false);
 assert.match(keyboard.nodes.get('quiz-progress').textContent,/5 associations sur 5/);
 console.log('PASS : parcours clavier pseudonyme→première autrice disponible, erreur, réussite, reset et fin ; focus souris/tactile conservé dans '+path+'.');
}
console.log('DOM simulé : le rendu navigateur et le lecteur d’écran restent à vérifier.');
