#!/usr/bin/env node
// Tests comportementaux du JavaScript réel dans un DOM simulé, pas un navigateur.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const homeCode = await readFile(resolve(root, 'assets/site-home.js'), 'utf8');
const discoveryCode = await readFile(resolve(root, 'assets/decouverte.js'), 'utf8');
class Element {
  constructor() {
    this.attributes = new Map(); this.listeners = new Map(); this.children = [];
    const classes = new Set();
    this.classList = {
      add: name => classes.add(name), remove: name => classes.delete(name),
      contains: name => classes.has(name),
      toggle: (name, value) => { if (value) classes.add(name); else classes.delete(name); }
    };
  }
  setAttribute(key, value) { this.attributes.set(key, value); }
  getAttribute(key) { return this.attributes.get(key); }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }
  emit(type, event = {}) { for (const callback of this.listeners.get(type) || []) callback(event); }
  append(child) { this.children.push(child); }
  contains(target) { return this === target || this.children.some(child => child.contains(target)); }
}
function fixture(legacy = false) {
  const document = new Element();
  const header = new Element(), menu = new Element(), nav = new Element(), link = new Element(), year = new Element();
  nav.append(link); header.append(menu); header.append(nav);
  menu.closest = () => header;
  menu.focus = () => { document.activeElement = menu; };
  nav.querySelectorAll = () => [link];
  const images = [
    { complete: false, naturalWidth: 0 },
    { complete: true, naturalWidth: 1200 },
    { complete: true, naturalWidth: 0 }
  ].map(values => {
    const img = Object.assign(new Element(), values, { alt: 'Crédit et description conservés.' });
    const photo = new Element(); photo.append(img); img.closest = () => photo;
    return img;
  });
  const nodes = { 'mobile-menu-button': menu, 'primary-navigation': nav, year };
  document.getElementById = id => nodes[id];
  document.querySelectorAll = () => images;
  document.createElement = () => new Element();
  const media = new Element(); media.matches = true;
  if (legacy) {
    media.addListener = callback => Element.prototype.addEventListener.call(media, 'change', callback);
    media.addEventListener = undefined;
  }
  vm.runInNewContext(homeCode, { document, window: { matchMedia: () => media }, Date });
  return { document, header, menu, nav, link, year, media, images };
}
for (const legacy of [false, true]) {
  const { document, header, menu, nav, link, year, media, images } = fixture(legacy);
  assert.equal(header.getAttribute('data-menu-ready'), '');
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
  menu.emit('click');
  assert.equal(menu.getAttribute('aria-expanded'), 'true');
  assert.ok(nav.classList.contains('is-open'));
  document.emit('click', { target: link });
  assert.equal(menu.getAttribute('aria-expanded'), 'true', 'Clic interne : menu toujours ouvert');
  document.emit('keydown', { key: 'Escape' });
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
  assert.equal(document.activeElement, menu, 'Échap rend le focus au bouton');
  menu.emit('click'); document.emit('click', { target: new Element() });
  assert.equal(menu.getAttribute('aria-expanded'), 'false', 'Clic extérieur');
  menu.emit('click'); header.emit('focusout', { relatedTarget: new Element() });
  assert.equal(menu.getAttribute('aria-expanded'), 'false', 'Sortie du focus');
  menu.emit('click'); link.emit('click');
  assert.equal(menu.getAttribute('aria-expanded'), 'false', 'Navigation par un lien');
  menu.emit('click'); media.matches = false; document.activeElement = link; media.emit('change');
  assert.equal(menu.getAttribute('aria-expanded'), 'false', 'Passage ordinateur');
  assert.equal(document.activeElement, link, 'Le lien reste focalisé sur ordinateur');
  media.matches = true; media.emit('change');
  assert.equal(document.activeElement, menu, 'Passage mobile : aucun focus dans une zone masquée');
  assert.equal(year.textContent, String(new Date().getFullYear()));
  assert.ok(!images[0].hidden && !images[1].hidden);
  images[0].emit('error');
  assert.ok(images[0].hidden, 'Image en échec remplacée');
  assert.match(images[0].closest().children[1].textContent, /Image indisponible/);
  assert.ok(images[0].closest().children[1].getAttribute('aria-label').includes(images[0].alt), 'Description de l’image conservée pour les aides techniques');
  assert.ok(images[2].hidden, 'Échec survenu avant initialisation pris en charge');
  images[2].emit('error');
  assert.equal(images[2].closest().children.length, 2, 'Pas de repli dupliqué');
}
console.log('PASS : menu, clavier, focus, clic extérieur, changements de viewport simulés, ancien matchMedia, images en échec.');

const articlePaths = [
  'articles/autorite.html', 'articles/pieuvres-couleur.html', 'articles/puissance-etats-unis.html',
  'articles/roubaix-1917.html', 'articles/autrices-pseudonymes.html'
];
function surpriseFixture(storageFails = false, random = 0) {
  const surprise = new Element(); const selected = []; let last;
  const links = articlePaths.map(path => ({ getAttribute: () => path }));
  const document = {
    baseURI: 'https://thot-culture.github.io/Thot/',
    querySelectorAll: selector => selector === 'a[data-discovery-path]' ? links : [surprise]
  };
  const sessionStorage = {
    getItem: () => { if (storageFails) throw Error('Stockage indisponible'); return last; },
    setItem: (key, value) => { if (storageFails) throw Error('Stockage indisponible'); last = value; }
  };
  const window = { location: { href: document.baseURI, origin: new URL(document.baseURI).origin, assign: path => selected.push(path) } };
  vm.runInNewContext(discoveryCode, { document, window, sessionStorage, URL, Math: { random: () => random, floor: Math.floor } });
  const click = changes => {
    const event = { button: 0, preventDefault() { this.defaultPrevented = true; }, ...changes };
    surprise.emit('click', event); return event;
  };
  return { selected, click };
}
for (let index = 0; index < articlePaths.length; index++) {
  const { selected, click } = surpriseFixture(false, (index + 0.1) / articlePaths.length);
  assert.ok(click().defaultPrevented);
  assert.equal(selected[0], '/Thot/' + articlePaths[index], 'Chaque article est accessible au tirage');
  click(); assert.notEqual(selected[0], selected[1], 'Pas de répétition immédiate');
}
const unavailable = surpriseFixture(true); unavailable.click();
assert.equal(unavailable.selected.length, 1, 'Le tirage fonctionne sans stockage');
for (const changes of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }]) {
  const { selected, click } = surpriseFixture();
  click(changes); assert.equal(selected.length, 0, 'Les clics natifs sont préservés');
}
console.log('PASS : tirage des 5 articles, sous-chemin /Thot/, non-répétition, stockage refusé et clics avec modificateurs.');
