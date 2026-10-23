#!/usr/bin/env node
// Exécute les trois vrais modules dans un DOM minimal issu des vrais articles.
// Les comportements natifs des boutons sont simulés, sans navigateur ni réseau.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const base = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, base), 'utf8');
const puissanceHTML = read('articles/puissance-etats-unis.html');
const roubaixHTML = read('articles/roubaix-1917.html');
const comparatorCode = read('assets/puissance-comparateur.js');
const chronologyCode = read('assets/puissance-chronologie.js');
const roubaixCode = read('assets/roubaix-frise.js');
const normalize = value => value.replace(/\s+/g, ' ').trim();
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (all, entity) => {
  if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16));
  if (entity.startsWith('#')) return String.fromCodePoint(Number(entity.slice(1)));
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: '\u00a0' }[entity] ?? all;
});

class Element {
  constructor(tag, document) {
    this.tagName = tag; this.ownerDocument = document; this.children = [];
    this.attributes = new Map(); this.dataset = {}; this.listeners = new Map();
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(value);
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  get hidden() { return this.attributes.has('hidden'); }
  set hidden(value) { if (value) this.setAttribute('hidden', ''); else this.attributes.delete('hidden'); }
  get disabled() { return this.attributes.has('disabled'); }
  set disabled(value) { if (value) this.setAttribute('disabled', ''); else this.attributes.delete('disabled'); }
  get href() { return this.getAttribute('href'); }
  set href(value) { this.setAttribute('href', value); }
  get textContent() { return this.children.map(child => typeof child === 'string' ? child : child.textContent).join(''); }
  set textContent(value) { this.children = [String(value)]; }
  matches(selector) {
    if (selector.startsWith('#')) return this.getAttribute('id') === selector.slice(1);
    if (selector.startsWith('.')) return (this.getAttribute('class') || '').split(/\s+/).includes(selector.slice(1));
    const attribute = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
    if (attribute) return attribute[2] === undefined ? this.attributes.has(attribute[1]) : this.getAttribute(attribute[1]) === attribute[2];
    return this.tagName === selector;
  }
  querySelectorAll(selector) {
    return this.children.flatMap(child => typeof child === 'string' ? [] : [
      ...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)
    ]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }
  focus() { if (!this.disabled) this.ownerDocument.activeElement = this; }
  emit(type, properties = {}) {
    const event = { target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...properties };
    for (const callback of this.listeners.get(type) || []) callback(event);
    return event;
  }
  click() { if (!this.disabled) this.emit('click'); }
}

function parseHTML(html) {
  const document = new Element('#document'); document.ownerDocument = document; document.activeElement = null;
  const stack = [document];
  const voids = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  // Le parseur est limité au HTML de ces fixtures ; il n'exécute pas les scripts.
  const markup = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  for (const token of markup.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-z][^>]*>|[^<]+|</gi)) {
    const text = token[0];
    if (text.startsWith('<!')) continue;
    if (text.startsWith('</')) {
      const tag = text.match(/^<\/([^\s>]+)/)[1].toLowerCase();
      const index = stack.findLastIndex(element => element.tagName === tag);
      if (index > 0) stack.length = index;
    } else if (text.startsWith('<') && text !== '<') {
      const tag = text.match(/^<([^\s/>]+)/)[1].toLowerCase();
      const element = new Element(tag, document);
      const attributes = text.slice(tag.length + 1, -1);
      for (const match of attributes.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
        element.setAttribute(match[1].toLowerCase(), decode(match[2] ?? match[3] ?? match[4] ?? ''));
      }
      stack.at(-1).children.push(element);
      if (!voids.has(tag) && !text.endsWith('/>')) stack.push(element);
    } else stack.at(-1).children.push(decode(text));
  }
  return document;
}

const run = (code, document) => vm.runInNewContext(code, { document });
function nativeKey(button, key) {
  // Entrée et Espace déclenchent nativement click sur un vrai bouton.
  // Cette partie modélise ce comportement ; elle ne remplace pas un test navigateur.
  button.focus();
  const down = button.emit('keydown', { key });
  if (key === 'Enter' && !down.defaultPrevented) button.click();
  const up = button.emit('keyup', { key });
  if (key === ' ' && !down.defaultPrevented && !up.defaultPrevented) button.click();
}
function expectSelected(buttons, panels, index) {
  assert.deepEqual(buttons.map(button => button.getAttribute('aria-pressed')), buttons.map((_, i) => String(i === index)));
  assert.deepEqual(panels.map(panel => panel.hidden), panels.map((_, i) => i !== index));
}
function expectSources(document, node) {
  for (const link of node.querySelectorAll('a')) {
    if (link.href?.startsWith('#ref')) assert.ok(document.querySelector(link.href), `Source présente : ${link.href}`);
  }
}

// Les groupes aria-pressed sont des boutons, pas des onglets ARIA : leur
// activation clavier native suffit ; les flèches ne leur sont pas imposées.
for (const kind of ['comparateur', 'chronologie']) {
  const document = parseHTML(puissanceHTML);
  const comparator = kind === 'comparateur';
  const root = document.querySelector(comparator ? '.comparateur-puissance' : '.chronologie-afghanistan');
  const controls = root.querySelector(comparator ? '.comparateur-choix' : '.chronologie-commandes');
  const status = root.querySelector(comparator ? '.comparateur-statut' : '.chronologie-statut');
  const fallback = comparator ? null : root.querySelector('.chronologie-repli');
  const buttons = root.querySelectorAll(comparator ? '[data-cas]' : '[data-etape]');
  const panels = root.querySelectorAll(comparator ? '[data-cas-panel]' : '[data-etape-panel]');
  const code = comparator ? comparatorCode : chronologyCode;
  assert.equal(buttons.length, comparator ? 3 : 6); assert.equal(panels.length, buttons.length);
  assert.equal(controls.getAttribute('role'), 'group');
  assert.equal(controls.hidden, true); assert.equal(status.hidden, true);
  assert.ok(panels.every(panel => panel.hidden === !comparator), 'Repli HTML avant JavaScript');
  if (fallback) {
    assert.equal(fallback.hidden, false); assert.equal(fallback.querySelectorAll('li').length, 6);
    expectSources(document, fallback);
  }
  const originalText = panels.map(panel => panel.textContent);
  const originalLabels = buttons.map(button => button.textContent);
  buttons.forEach((button, index) => {
    assert.equal(button.tagName, 'button'); assert.equal(button.getAttribute('type'), 'button');
    assert.equal(button.disabled, false);
    assert.equal(button.getAttribute('aria-controls'), panels[index].getAttribute('id'));
    assert.equal(button.dataset[comparator ? 'cas' : 'etape'], panels[index].dataset[comparator ? 'casPanel' : 'etapePanel']);
    expectSources(document, panels[index]);
  });
  run(code, document);
  expectSelected(buttons, panels, 0); assert.equal(document.activeElement, null, 'L’initialisation ne vole pas le focus');
  assert.equal(controls.hidden, false); assert.equal(status.hidden, false);
  if (fallback) assert.equal(fallback.hidden, true);
  buttons.forEach((button, index) => {
    for (const key of ['Enter', ' ']) {
      nativeKey(button, key); expectSelected(buttons, panels, index);
      assert.equal(document.activeElement, button, 'Le choix garde le focus clavier visible sur le bouton');
      const title = comparator ? button.textContent.trim() : button.dataset.titre;
      assert.equal(status.textContent, (comparator ? 'Étude affichée : ' : 'Étape affichée : ') + title + '.');
    }
    button.click(); button.click(); expectSelected(buttons, panels, index);
  });
  assert.deepEqual(panels.map(panel => panel.textContent), originalText, 'Les panneaux et références ne sont pas réécrits');
  assert.deepEqual(buttons.map(button => button.textContent), originalLabels, 'Libellés originaux conservés');
  const focus = document.activeElement;
  assert.equal(focus.emit('keydown', { key: 'Escape' }).defaultPrevented, false);
  assert.equal(document.activeElement, focus);
  console.log(`PASS : ${kind}, ${buttons.length} choix réels, repli sans JS, panneaux exclusifs, statut, Entrée/Espace simulés, focus et textes/sources préservés.`);
}

// Les gardes doivent laisser un composant incomplet dans son état HTML lisible.
for (const [code, html, controlsSelector, missingSelector] of [
  [comparatorCode, puissanceHTML, '.comparateur-choix', '.comparateur-statut'],
  [comparatorCode, puissanceHTML, '.comparateur-choix', '[data-cas-panel]'],
  [chronologyCode, puissanceHTML, '.chronologie-commandes', '.chronologie-repli'],
  [chronologyCode, puissanceHTML, '.chronologie-commandes', '[data-etape]']
]) {
  const document = parseHTML(html);
  const controls = document.querySelector(controlsSelector);
  for (const missing of document.querySelectorAll(missingSelector)) missing.matches = () => false;
  const original = controls.hidden;
  run(code, document);
  assert.equal(controls.hidden, original, 'Un composant incomplet ne révèle pas de contrôles inopérants');
}
for (const code of [comparatorCode, chronologyCode, roubaixCode]) run(code, parseHTML(''));

// Événements repris du code, puis épinglés pour détecter toute altération du
// corpus d’origine. L’empreinte protège les textes ; ce n’est pas un audit historique.
const events = JSON.parse(roubaixCode.match(/const events = (\[[\s\S]*?\n\]);/)[1]);
assert.equal(createHash('sha256').update(JSON.stringify(events)).digest('hex'),
  '73ed092ed6438ed56978f7147db7485d58571555b62b7a899ab0398a6bb954b5', 'Conserver les huit événements sourcés d’origine');
assert.equal(events.length, 8);

function roubaixFixture() {
  const document = parseHTML(roubaixHTML), root = document.querySelector('#explorer-roubaix');
  return { document, root, buttons: root.querySelectorAll('[data-date-index]'),
    date: root.querySelector('#timeline-date'), title: root.querySelector('#timeline-title'),
    description: root.querySelector('#timeline-description'), nuance: root.querySelector('#timeline-limitation'),
    source: root.querySelector('#timeline-reference') };
}
function expectEvent(fixture, index) {
  const { buttons, date, title, description, nuance, source } = fixture, item = events[index];
  assert.equal(date.textContent, item.date); assert.equal(title.textContent, item.title);
  assert.equal(description.textContent, item.body); assert.equal(nuance.textContent, item.nuance);
  assert.equal(source.href, '#' + item.ref); assert.equal(source.textContent, 'Retrouver la source [' + item.ref.slice(3) + ']');
  assert.deepEqual(buttons.map(button => button.getAttribute('aria-pressed')), buttons.map((_, i) => String(i === index)));
}
{
  const fixture = roubaixFixture(), { document, root, buttons } = fixture;
  assert.equal(buttons.length, events.length);
  assert.ok(buttons.every(button => button.disabled), 'Les dates HTML restent inactives sans JavaScript');
  assert.equal(normalize(fixture.date.textContent), events[0].date);
  assert.equal(normalize(fixture.title.textContent), events[0].title);
  assert.ok(root.querySelector('noscript'), 'Indication sans JavaScript conservée');
  const labels = buttons.map(button => button.getAttribute('aria-label'));
  buttons.forEach((button, index) => {
    assert.equal(button.dataset.dateIndex, String(index)); assert.equal(button.getAttribute('type'), 'button');
    assert.equal(labels[index], 'Événement : ' + events[index].date);
    assert.ok(document.querySelector('#' + events[index].ref), `Source Roubaix présente : ${events[index].ref}`);
  });
  run(roubaixCode, document);
  assert.ok(buttons.every(button => !button.disabled), 'Les dates deviennent utilisables après initialisation');
  assert.equal(document.activeElement, null); expectEvent(fixture, 0);
  buttons.forEach((button, index) => {
    button.focus(); button.click(); expectEvent(fixture, index); assert.equal(document.activeElement, button);
    nativeKey(button, 'Enter'); expectEvent(fixture, index);
    nativeKey(button, ' '); expectEvent(fixture, index);
    for (const [key, next] of [
      ['ArrowRight', (index + 1) % buttons.length], ['ArrowDown', (index + 1) % buttons.length],
      ['ArrowLeft', (index - 1 + buttons.length) % buttons.length], ['ArrowUp', (index - 1 + buttons.length) % buttons.length],
      ['Home', 0], ['End', buttons.length - 1]
    ]) {
      button.focus();
      assert.equal(button.emit('keydown', { key }).defaultPrevented, true, `Empêcher le défilement : ${key}`);
      expectEvent(fixture, next); assert.equal(document.activeElement, buttons[next], `Focus déplacé : ${key}`);
    }
    button.click(); const active = document.activeElement;
    assert.equal(button.emit('keydown', { key: 'Escape' }).defaultPrevented, false);
    expectEvent(fixture, index); assert.equal(document.activeElement, active);
  });
  assert.deepEqual(buttons.map(button => button.getAttribute('aria-label')), labels);
}
for (const missingSelector of ['[data-date-index]', '#timeline-date', '#timeline-reference']) {
  const fixture = roubaixFixture();
  // Masquer seulement le premier bouton suffit pour provoquer le contrôle de cardinalité.
  const missing = fixture.root.querySelector(missingSelector); missing.matches = () => false;
  const initial = fixture.title.textContent;
  run(roubaixCode, fixture.document);
  assert.ok(fixture.buttons.every(button => button.disabled && !button.listeners.has('click')));
  assert.equal(fixture.title.textContent, initial, 'Le contenu statique reste lisible si l’initialisation échoue');
}
console.log('PASS : Roubaix, huit événements originaux, sources, activation progressive, clics, Entrée/Espace simulés, quatre flèches, Home/End, rebouclage et focus.');
console.log('PASS : composants absents/incomplets, replis et contrôles inactifs conservés.');
console.log('DOM et clavier natif simulés : rendu mobile/ordinateur, lecteurs d’écran et événements réels du navigateur non vérifiés.');
