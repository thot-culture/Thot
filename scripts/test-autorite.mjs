#!/usr/bin/env node
// Activité réelle et boutons du HTML ; aucun navigateur, réseau ou dépendance.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const html=readFileSync(new URL('articles/autorite.html',root),'utf8');
const code=readFileSync(new URL('assets/autorite-activity.js',root),'utf8');
const expected={
 parents:{
  suivre:'Suivre la règle peut venir de la confiance, de l’accord avec son objectif ou du souhait d’éviter un conflit. Le geste seul ne dit pas lequel.',
  discuter:'Négocier peut reconnaître le rôle du parent tout en demandant que la règle soit expliquée ou adaptée.',
  refuser:'Le refus peut exprimer un besoin d’autonomie ou un désaccord sur la limite posée. Il ne suffit pas à conclure à un rejet des parents.'
 },
 etat:{
  suivre:'Ne pas rejoindre la manifestation peut venir d’un accord avec la décision, de la prudence ou de la crainte des conséquences. Ces motifs ne sont pas équivalents.',
  discuter:'Chercher des explications peut être une façon de juger la décision et sa légitimité avant d’agir.',
  refuser:'Manifester est une forme de contestation collective ; les personnes présentes peuvent avoir des raisons très différentes.'
 },
 direction:{
  suivre:'Libérer l’accès peut répondre à une inquiétude de sécurité, même si l’on n’est pas convaincu par toutes les décisions de la direction.',
  discuter:'Demander pourquoi permet de confronter une consigne à ses raisons, à son urgence et aux règles de l’établissement.',
  refuser:'Le refus peut signaler un désaccord ou une défiance ; il faut encore examiner le risque, les règles et les autres moyens de contestation.'
 }
};
class Button{
 constructor(reaction,disabled=true){this.dataset={reaction};this.disabled=disabled;this.attrs=new Map([['aria-pressed','false']]);this.events=new Map()}
 setAttribute(name,value){this.attrs.set(name,value)}
 getAttribute(name){return this.attrs.get(name)}
 addEventListener(type,callback){this.events.set(type,callback)}
 click(){if(!this.disabled)this.events.get('click')?.()}
}
function makeCase(situation,reactions=['suivre','discuter','refuser'],feedback=true){
 const buttons=reactions.map(reaction=>new Button(reaction));const retour=feedback?{textContent:''}:null;
 return{dataset:{case:situation},buttons,retour,querySelector:()=>retour,querySelectorAll:()=>buttons};
}
const cases=[...html.matchAll(/<section\b[^>]*class="authorite-case"[^>]*data-case="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)].map(m=>{
 const reactions=[...m[2].matchAll(/<button\b[^>]*data-reaction="([^"]+)"[^>]*>/g)];
 assert.equal(reactions.length,3);
 for(const button of reactions)assert.match(button[0],/\sdisabled(?:\s|>|=)/,'Commande HTML désactivée avant initialisation');
 return makeCase(m[1],reactions.map(button=>button[1]));
});
assert.equal(cases.length,3);
const unknown=makeCase('inconnue');const badReaction=makeCase('parents',['inconnue']);const noFeedback=makeCase('parents',['suivre'],false);
vm.runInNewContext(code,{document:{querySelectorAll:()=>[...cases,unknown,badReaction,noFeedback]}});
for(const cas of cases)assert.ok(cas.buttons.every(button=>!button.disabled),'Commandes valides activées');
for(const cas of [unknown,badReaction,noFeedback])assert.ok(cas.buttons.every(button=>button.disabled&&!button.events.has('click')),'Cas invalides laissés inactifs');
for(const cas of cases){
 for(const button of cas.buttons){
  const other=cases.filter(item=>item!==cas).map(item=>({feedback:item.retour.textContent,pressed:item.buttons.map(b=>b.getAttribute('aria-pressed'))}));
  button.click();
  assert.equal(cas.retour.textContent,expected[cas.dataset.case][button.dataset.reaction],'Texte d’explication original conservé');
  assert.equal(cas.buttons.filter(item=>item.getAttribute('aria-pressed')==='true').length,1);
  assert.equal(button.getAttribute('aria-pressed'),'true');
  assert.deepEqual(cases.filter(item=>item!==cas).map(item=>({feedback:item.retour.textContent,pressed:item.buttons.map(b=>b.getAttribute('aria-pressed'))})),other,'Chaque situation reste indépendante');
 }
}
// Cliquer plusieurs fois sur le même choix ne crée ni score ni autre résultat.
const first=cases[0],last=first.buttons.at(-1);last.click();last.click();
assert.equal(first.retour.textContent,expected.parents.refuser);
assert.equal(first.buttons.filter(button=>button.getAttribute('aria-pressed')==='true').length,1);
console.log('PASS : 3 situations × 3 réactions, textes originaux, exclusivité aria-pressed, indépendance des cas, clics répétés et commandes invalides inactives.');
console.log('DOM simulé : rendu mobile/ordinateur et lecteurs d’écran non vérifiés.');
