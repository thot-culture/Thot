#!/usr/bin/env node
// Scripts réels des deux activités, dans un DOM simulé sans réseau ni navigateur.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const lire = path => readFileSync(new URL(path, root), 'utf8');
const attributs = source => Object.fromEntries([...source.matchAll(/([^\s=/>]+)(?:="([^"]*)")?/g)].map(m => [m[1], m[2] ?? '']));
const texte = source => source.replace(/<[^>]*>/g, '').trim();
const scripts = html => [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);

class Element {
  constructor(tag, attrs = {}, text = '') {
    this.tagName = tag;
    this.attrs = new Map(Object.entries(attrs));
    this.dataset = Object.fromEntries(Object.entries(attrs).filter(([name]) => name.startsWith('data-')).map(([name, value]) => [name.slice(5), value]));
    this._disabled = Object.hasOwn(attrs, 'disabled');
    this.hidden = Object.hasOwn(attrs, 'hidden');
    this.value = attrs.value ?? '';
    this.textContent = text;
    this.children = [];
    this.events = new Map();
  }
  get disabled() { return this._disabled; }
  set disabled(value) { this._disabled = Boolean(value); if (!this._disabled) this.onEnable?.(); }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  addEventListener(type, callback) {
    const listeners = this.events.get(type) ?? [];
    listeners.push(callback);
    this.events.set(type, listeners);
  }
  appendChild(child) { this.children.push(child); return child; }
  emit(type) { if (!this.disabled) for (const callback of this.events.get(type) ?? []) callback({ target: this }); }
}

function elementParId(html, id) {
  const match = html.match(new RegExp(`<([a-z][\\w:-]*)\\b([^>]*\\bid="${id}"[^>]*)>`, 'i'));
  assert.ok(match, `Élément #${id} présent dans le HTML`);
  const reste = html.slice(match.index + match[0].length);
  return new Element(match[1], attributs(match[2]), match[1] === 'input' ? '' : texte(reste.split(`</${match[1]}>`)[0]));
}

// Petite pause des autrices : textes et lien historique gardés à l'identique.
const autrices = lire('articles/autrices-pseudonymes.html');
const pauseCode = scripts(autrices).find(code => code.includes('querySelectorAll(".pause-choice")'));
assert.ok(pauseCode, 'Script inline de la petite pause présent');
const choices = [...autrices.matchAll(/<button\b([^>]*class="pause-choice"[^>]*)>([\s\S]*?)<\/button>/g)].map(m => new Element('button', attributs(m[1]), texte(m[2])));
assert.deepEqual(choices.map(choice => choice.dataset.answer), ['stated', 'interpretation']);
assert.deepEqual(choices.map(choice => choice.textContent), ['Elles l’ont dit', 'C’est une interprétation possible']);
const feedback = elementParId(autrices, 'pause-feedback');
const source = elementParId(autrices, 'pause-source');
assert.ok(choices.every(choice => choice.disabled && choice.getAttribute('aria-pressed') === 'false'), 'Les deux choix restent inactifs sans JavaScript');
assert.equal(feedback.getAttribute('role'), 'status');
assert.equal(feedback.getAttribute('aria-live'), 'polite');
assert.equal(feedback.textContent, '');
assert.equal(source.hidden, true);
assert.equal(source.getAttribute('href'), '#ref1');
assert.equal(source.textContent, 'Voir la source [1]');
assert.match(autrices, /\bid="ref1"/, 'La cible de la source existe');
const pauseGroup = autrices.match(/<div\b[^>]*class="pause-choices"[^>]*>/)?.[0] ?? '';
assert.match(pauseGroup, /role="group"/);
assert.match(pauseGroup, /aria-label="Choisir une réponse"/);
for (const choice of choices) choice.onEnable = () => assert.equal(choice.events.get('click')?.length, 1, 'Le gestionnaire est prêt avant activation');
vm.runInNewContext(pauseCode, {
  document: {
    querySelectorAll: selector => { assert.equal(selector, '.pause-choice'); return choices; },
    getElementById: id => ({ 'pause-feedback': feedback, 'pause-source': source })[id] ?? null
  }
}, { filename: 'autrices-pseudonymes:petite-pause' });
assert.ok(choices.every(choice => !choice.disabled), 'Les deux réponses sont activées après initialisation');
const pauseTextes = {
  stated: 'Pas tout à fait ! Charlotte Brontë parle de leur crainte des préjugés, mais ne dit pas qu’elles voulaient mener une campagne militante. C’est une interprétation possible, pas un motif qu’elles ont explicitement déclaré.',
  interpretation: 'Bien vu ! C’est une interprétation possible. Charlotte Brontë explique qu’elles craignaient les préjugés visant les autrices ; elle ne présente pas leur choix comme une campagne militante.'
};
for (const choice of [choices[0], choices[1], choices[1], choices[0]]) {
  choice.emit('click');
  assert.equal(feedback.textContent, pauseTextes[choice.dataset.answer], 'Explication historique originale conservée');
  assert.deepEqual(choices.map(item => item.getAttribute('aria-pressed')), choices.map(item => String(item === choice)), 'Une seule réponse est sélectionnée');
  assert.equal(source.hidden, false);
  assert.equal(source.getAttribute('href'), '#ref1', 'Le lien de source reste inchangé');
}

// Chromatophore : seule la partie activité du script inline est exécutée.
const pieuvres = lire('articles/pieuvres-couleur.html');
const chromatoScript = scripts(pieuvres).find(code => code.includes('const curseurChromato'));
assert.ok(chromatoScript, 'Script inline du chromatophore présent');
const chromatoCode = chromatoScript.slice(chromatoScript.indexOf('const curseurChromato'));
const slider = elementParId(pieuvres, 'chromato-curseur');
const sac = elementParId(pieuvres, 'chromato-sac');
const fibres = elementParId(pieuvres, 'chromato-fibres');
const etat = elementParId(pieuvres, 'chromato-etat');
assert.equal(slider.disabled, true, 'Curseur inactif sans JavaScript');
assert.equal(slider.getAttribute('type'), 'range');
assert.equal(slider.getAttribute('min'), '0');
assert.equal(slider.getAttribute('max'), '100');
assert.equal(slider.value, '18');
assert.match(pieuvres, /<label\b[^>]*for="chromato-curseur"/, 'Le curseur possède un libellé associé');
assert.equal(slider.getAttribute('aria-describedby'), 'chromato-consigne chromato-etat');
for (const id of slider.getAttribute('aria-describedby').split(' ')) elementParId(pieuvres, id);
assert.equal(etat.getAttribute('aria-live'), 'polite');
const svgTag = pieuvres.match(/<svg\b[^>]*class="chromato-svg"[^>]*>/)?.[0] ?? '';
assert.match(svgTag, /role="img"/);
assert.match(svgTag, /aria-labelledby="chromato-svg-title chromato-svg-desc"/);
for (const id of ['chromato-svg-title', 'chromato-svg-desc']) assert.ok(elementParId(pieuvres, id).textContent);
let activation;
slider.onEnable = () => {
  activation = { rx: sac.getAttribute('rx'), ry: sac.getAttribute('ry'), fibres: fibres.children.length, texte: etat.textContent, aria: slider.getAttribute('aria-valuetext') };
  assert.equal(slider.events.get('input')?.length, 1, 'Gestionnaire input prêt avant activation');
};
const nodes = { 'chromato-curseur': slider, 'chromato-sac': sac, 'chromato-fibres': fibres, 'chromato-etat': etat };
vm.runInNewContext(chromatoCode, {
  document: {
    querySelector: selector => nodes[selector.slice(1)] ?? null,
    createElementNS: (namespace, tag) => {
      assert.equal(namespace, 'http://www.w3.org/2000/svg');
      assert.equal(tag, 'line');
      return new Element(tag);
    }
  }
}, { filename: 'pieuvres-couleur:chromatophore' });
const etats = [
  ['Au repos : le sac est compact et la tache colorée est petite.', 'Peu étalé'],
  ['Les muscles se contractent : le pigment s’étale.', 'En train de s’étaler'],
  ['Muscles contractés : le pigment est très étalé et plus visible.', 'Très étalé']
];
assert.equal(slider.disabled, false);
assert.deepEqual(activation, { rx: '37.16', ry: '26.32', fibres: 16, texte: etats[0][0], aria: etats[0][1] }, 'Calcul initial complet avant activation');
const proche = (actual, expected, message) => assert.ok(Math.abs(Number(actual) - expected) < 1e-9, `${message} : ${actual} ≈ ${expected}`);
function verifierNiveau(niveau, rx, ry, state) {
  proche(sac.getAttribute('rx'), rx, `Rayon horizontal au niveau ${niveau}`);
  proche(sac.getAttribute('ry'), ry, `Rayon vertical au niveau ${niveau}`);
  assert.equal(etat.textContent, etats[state][0], 'Explication originale et seuil corrects');
  assert.equal(slider.getAttribute('aria-valuetext'), etats[state][1]);
  assert.equal(fibres.children.length, 16, 'Exactement 16 fibres, sans duplication lors des mises à jour');
  fibres.children.forEach((fibre, index) => {
    const angle = index * Math.PI / 8;
    const x1 = Number(fibre.getAttribute('x1')) - 300, y1 = Number(fibre.getAttribute('y1')) - 118;
    const x2 = Number(fibre.getAttribute('x2')) - 300, y2 = Number(fibre.getAttribute('y2')) - 118;
    for (const coord of [x1, y1, x2, y2]) assert.ok(Number.isFinite(coord), 'Coordonnées SVG finies');
    proche(x2, Math.cos(angle) * 112, 'Extrémité extérieure horizontale fixe');
    proche(y2, Math.sin(angle) * 112, 'Extrémité extérieure verticale fixe');
    proche((x1 / rx) ** 2 + (y1 / ry) ** 2, 1, 'La fibre rejoint le bord de l’ellipse');
    proche(x1 * Math.sin(angle) - y1 * Math.cos(angle), 0, 'Fibre radiaire');
    assert.ok(x1 * Math.cos(angle) + y1 * Math.sin(angle) > 0, 'Fibre orientée vers son ancrage');
  });
}
verifierNiveau(18, 37.16, 26.32, 0);
for (const [niveau, rx, ry, state] of [[0, 26, 22, 0], [33, 46.46, 29.92, 0], [34, 47.08, 30.16, 1], [71, 70.02, 39.04, 1], [72, 70.64, 39.28, 2], [100, 88, 46, 2]]) {
  slider.value = String(niveau);
  slider.emit('input');
  verifierNiveau(niveau, rx, ry, state);
}

console.log('PASS : petite pause — 2 réponses, sélection exclusive, textes historiques et lien source conservés ; chromatophore — initialisation avant activation, 16 fibres SVG, géométrie et ARIA aux niveaux 0/18/33/34/71/72/100.');
console.log('DOM simulé : rendu ordinateur/mobile et fonctionnement dans un navigateur non vérifiés.');
