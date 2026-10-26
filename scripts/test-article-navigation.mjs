#!/usr/bin/env node
// Tests du vrai module de sommaire, avec DOM et viewport simulés.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const code = readFileSync(new URL('assets/puissance-sommaire.js', root), 'utf8');

function makePage({ mobile = false, legacy = false, absent = false, initialTargetTabindex } = {}) {
  const calls = [], nodes = new Map();
  const document = { activeElement: null };
  let details;
  class Node {
    constructor(id = '') { this.id = id; this.attrs = new Map(); this.events = new Map(); this.children = []; }
    setAttribute(key, value) { this.attrs.set(key, String(value)); }
    getAttribute(key) { return this.attrs.get(key) ?? null; }
    hasAttribute(key) { return this.attrs.has(key); }
    addEventListener(type, callback) { this.events.set(type, callback); }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    focus(options) {
      calls.push({ action: 'focus', id: this.id, options, menuOpen: details.open });
      document.activeElement = this;
    }
  }
  const target = new Node('été'), outside = new Node('outside'), summary = new Node('summary');
  if (initialTargetTabindex !== undefined) target.setAttribute('tabindex', initialTargetTabindex);
  nodes.set(target.id, target);
  const links = ['#%C3%A9t%C3%A9', '#absente', '#%E0%A4%A'].map((href, index) => {
    const link = new Node('link-' + index); link.setAttribute('href', href); return link;
  });
  details = new Node('details'); details.children = [summary, ...links];
  let isOpen = true;
  Object.defineProperty(details, 'open', {
    get: () => isOpen,
    set(value) { isOpen = value; calls.push({ action: 'open', value }); }
  });
  details.querySelector = selector => selector === 'summary' ? summary : null;
  details.querySelectorAll = selector => selector === 'a[href^="#"]' ? links : [];
  document.querySelector = selector => selector === '.sommaire-details' && !absent ? details : null;
  document.getElementById = id => nodes.get(id) || null;
  let change;
  const media = { matches: mobile };
  if (legacy) media.addListener = callback => { change = callback; };
  else media.addEventListener = (type, callback) => { assert.equal(type, 'change'); change = callback; };
  vm.runInNewContext(code, { document, window: { matchMedia: query => { assert.equal(query, '(max-width: 850px)'); return media; } } });
  const click = (index = 0, options = {}) => {
    const event = {
      button: 0, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; calls.push({ action: 'preventDefault' }); },
      ...options
    };
    links[index].events.get('click')?.(event);
    return event;
  };
  const resize = value => { media.matches = value; change?.(); };
  const openAndFocus = (node = links[0]) => { details.open = true; node.focus(); calls.length = 0; };
  return { document, details, links, target, outside, summary, click, resize, openAndFocus, calls };
}

// Sur ordinateur, les liens gardent leur navigation native et le sommaire reste ouvert.
{
  const page = makePage();
  assert.equal(page.details.open, true);
  page.openAndFocus(); const event = page.click();
  assert.equal(page.details.open, true);
  assert.equal(page.document.activeElement, page.links[0]);
  assert.equal(event.defaultPrevented, false);
  assert.deepEqual(page.calls, []);
}

// Sur mobile, l’ancre valide reçoit le focus avant la fermeture du menu.
for (const legacy of [false, true]) {
  const page = makePage({ mobile: true, legacy });
  assert.equal(page.details.open, false, 'Menu mobile initialement replié');
  page.openAndFocus(); const event = page.click();
  assert.equal(page.target.getAttribute('tabindex'), '-1');
  assert.equal(page.document.activeElement, page.target);
  assert.equal(page.details.open, false);
  assert.equal(event.defaultPrevented, false, 'Le navigateur doit encore traiter le lien natif');
  assert.equal(page.calls.length, 2);
  assert.equal(page.calls[0].action, 'focus');
  assert.equal(page.calls[0].menuOpen, true, 'Le lien ne doit pas être caché avant le transfert de focus');
  assert.equal(page.calls[0].options.preventScroll, true);
  assert.deepEqual(page.calls[1], { action: 'open', value: false });
}

// Une cible déjà focalisable conserve son tabindex d’origine.
{
  const page = makePage({ mobile: true, initialTargetTabindex: '0' });
  page.openAndFocus(); page.click();
  assert.equal(page.target.getAttribute('tabindex'), '0');
}

// Liens invalides et clics modifiés : aucun focus perdu, aucune fermeture forcée.
for (const index of [1, 2]) {
  const page = makePage({ mobile: true }); page.openAndFocus(page.links[index]);
  const event = page.click(index);
  assert.equal(page.details.open, true);
  assert.equal(page.document.activeElement, page.links[index]);
  assert.equal(event.defaultPrevented, false);
  assert.deepEqual(page.calls, []);
}
for (const options of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { button: 2 }, { defaultPrevented: true }]) {
  const page = makePage({ mobile: true }); page.openAndFocus(); page.click(0, options);
  assert.equal(page.details.open, true);
  assert.equal(page.document.activeElement, page.links[0]);
  assert.deepEqual(page.calls, []);
}

// Un changement de breakpoint ne doit pas conserver le focus dans un menu masqué.
for (const legacy of [false, true]) {
  const page = makePage({ legacy }); page.openAndFocus(); page.resize(true);
  assert.equal(page.document.activeElement, page.summary);
  assert.equal(page.details.open, false);
  assert.equal(page.calls[0].action, 'focus');
  assert.equal(page.calls[0].menuOpen, true);
  assert.equal(page.calls[1].action, 'open');
  page.document.activeElement = page.outside; page.calls.length = 0;
  page.resize(false);
  assert.equal(page.details.open, true);
  assert.equal(page.document.activeElement, page.outside, 'Retour ordinateur sans vol de focus');
  page.resize(true);
  assert.equal(page.document.activeElement, page.outside, 'Focus extérieur conservé au retour mobile');
}

// Le module doit pouvoir être inclus sur une page dépourvue de sommaire.
assert.doesNotThrow(() => vm.runInNewContext(code, { document: { querySelector: () => null } }));

// Contrat de contenu : conserver les ancres et libellés des cinq sommaires.
const articleMenus = [
  ['articles/puissance-etats-unis.html', 'Dans cet article', [
    ['comparateur-puissance-titre', 'Comparer les cas historiques'],
    ['puissance', "Qu'est-ce que la puissance ?"],
    ['souverainete', 'La souveraineté westphalienne'],
    ['afghanistan', "Le cas de l'Afghanistan"],
    ['iran', "Le cas de l'Iran"],
    ['daech', 'La défaite territoriale de Daech'],
    ['retenir-titre', "Ce qu'il faut retenir"],
    ['sources', 'Sources et références']
  ]],
  ['articles/roubaix-1917.html', 'Dans cet article', [
    ['lecture-affiche-laine', 'Explorer l’affiche sur la laine'],
    ['contexte', 'Une ville occupée'],
    ['explorer-roubaix', 'Frise interactive 1914–1918'],
    ['controle', 'Contrôler les habitants'],
    ['travail', "Le travail sous l'occupation"],
    ['ravitaillement', 'Le ravitaillement'],
    ['departs', 'Les départs'],
    ['historiens', 'Lire les documents historiques'],
    ['retenir-titre', "Ce qu'il faut retenir"],
    ['sources', 'Sources et références']
  ]],
  ['articles/autorite.html', 'Explorer', [
    ['decode-pouvoir', 'Décode le pouvoir'],
    ['reactions', 'Obéir ou être d’accord ?'],
    ['parents', 'Les parents'],
    ['etat', 'L’État'],
    ['direction', 'La direction scolaire'],
    ['jeu', 'Mise en situation'],
    ['facteurs', 'Pourquoi les réactions varient'],
    ['retenir-title', 'À retenir'],
    ['sources-title', 'Sources']
  ]],
  ['articles/autrices-pseudonymes.html', 'Explorer', [
    ['brontes', 'Les sœurs Brontë'],
    ['eliot', 'George Eliot'],
    ['sand', 'George Sand'],
    ['pas-une-regle', 'L’anonymat comme autre stratégie'],
    ['jeu', 'Petit jeu'],
    ['retenir-title', 'À retenir'],
    ['sources-title', 'Sources']
  ]],
  ['articles/pieuvres-couleur.html', 'Explorer', [
    ['chromato-interactif-titre', 'Manipuler le chromatophore'],
    ['cellules', 'Sous la peau'],
    ['commande', 'Qui commande ?'],
    ['motifs', 'Motifs et camouflage'],
    ['nuance', 'La lumière aussi'],
    ['retenir-title', 'À retenir'],
    ['sources-title', 'Sources']
  ]]
];

function attributes(tag) {
  const attrs = new Map();
  const body = tag.replace(/^<\/?[\w:-]+\b/, '').replace(/\/?>$/, '');
  for (const match of body.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    const name = match[1].toLowerCase();
    assert.ok(!attrs.has(name), 'Attribut dupliqué : ' + name);
    attrs.set(name, match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attrs;
}
function textContent(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&(#x[\da-f]+|#\d+|nbsp|amp|quot|apos|lt|gt);/gi, (entity, name) => {
    if (name.startsWith('#')) return String.fromCodePoint(name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1)));
    return { nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[name.toLowerCase()];
  }).replace(/\s+/g, ' ').trim();
}
function assertVisibleMarkup(tag, file) {
  const attrs = attributes(tag);
  assert.ok(!attrs.has('hidden') && !attrs.has('inert') && attrs.get('aria-hidden') !== 'true', file + ' : élément du sommaire masqué');
}

for (const [file, expectedSummary, expectedLinks] of articleMenus) {
  const html = readFileSync(new URL(file, root), 'utf8');
  const markup = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].map(match => attributes(match[0]));
  const modules = scripts.filter(attrs => /^\.\.\/assets\/puissance-sommaire\.js(?:\?[^\s]*)?$/.test(attrs.get('src') || ''));
  assert.equal(modules.length, 1, file + ' : module partagé absent ou dupliqué');
  assert.ok(modules[0].has('defer'), file + ' : module partagé non différé');

  const tags = [...markup.matchAll(/<[a-z][\w:-]*\b[^>]*>/gi)];
  const ids = new Map();
  for (const [tag] of tags) {
    const id = attributes(tag).get('id');
    if (id !== undefined) {
      assert.ok(id.length && !/\s/.test(id), file + ' : ID vide ou contenant un espace');
      assert.ok(!ids.has(id), file + ' : ID dupliqué ' + id);
      ids.set(id, tag);
    }
  }
  const article = ids.get('texte-article');
  assert.ok(article && /^<article\b/i.test(article), file + ' : contenu principal absent');
  assert.equal(attributes(article).get('tabindex'), '-1', file + ' : cible du lien d’évitement non focalisable');

  const menus = [...markup.matchAll(/<details\b[^>]*>[\s\S]*?<\/details\s*>/gi)]
    .filter(([details]) => (attributes(details.match(/^<details\b[^>]*>/i)[0]).get('class') || '').split(/\s+/).includes('sommaire-details'));
  assert.equal(menus.length, 1, file + ' : un vrai sommaire details est requis');
  const menu = menus[0][0], opening = menu.match(/^<details\b[^>]*>/i)[0];
  assert.ok(attributes(opening).has('open'), file + ' : sommaire fermé sans JavaScript');
  assertVisibleMarkup(opening, file);
  const summary = menu.slice(opening.length).match(/^\s*(<summary\b[^>]*>)([\s\S]*?)<\/summary\s*>/i);
  assert.ok(summary, file + ' : summary doit être le premier élément du sommaire');
  assertVisibleMarkup(summary[1], file);
  const summaryLabel = summary[2].replace(/<span\b[^>]*aria-hidden=["']true["'][^>]*>[\s\S]*?<\/span\s*>/gi, '');
  assert.equal(textContent(summaryLabel), expectedSummary === 'Explorer' ? 'Sommaire' : expectedSummary, file + ' : titre du sommaire modifié hors du renommage autorisé');
  const nav = menu.match(/<nav\b[^>]*>/i)?.[0];
  assert.ok(nav, file + ' : navigation du sommaire absente');
  assertVisibleMarkup(nav, file);

  const links = [...menu.matchAll(/(<a\b[^>]*>)([\s\S]*?)<\/a\s*>/gi)].map(([, tag, label]) => {
    assertVisibleMarkup(tag, file);
    const attrs = attributes(tag), href = attrs.get('href');
    assert.ok(href?.startsWith('#') && href.length > 1, file + ' : lien du sommaire sans ancre locale');
    const id = decodeURIComponent(href.slice(1));
    assert.ok(ids.has(id), file + ' : cible du sommaire absente ' + href);
    assert.ok(!attrs.has('tabindex') || Number(attrs.get('tabindex')) >= 0, file + ' : lien exclu du clavier ' + href);
    const labelWithoutMarker = label.replace(/<span\b[^>]*class=["'][^"']*\bsommaire-num\b[^"']*["'][^>]*>[\s\S]*?<\/span\s*>/gi, '');
    return [id, textContent(labelWithoutMarker)];
  });
  assert.deepEqual(links, expectedLinks, file + ' : liens, ordre ou libellés du sommaire modifiés');
}

console.log('PASS : sommaire desktop/mobile, transfert de focus avant fermeture, navigation native, ancres invalides, clics modifiés, breakpoint et listeners moderne/legacy.');
console.log('PASS : les cinq articles ont un sommaire details ouvert sans JavaScript, un summary accessible, le module partagé différé et un contenu principal focalisable ; ancres, IDs, ordre et libellés des liens conservés.');
console.log('Limite : DOM et viewport simulés ; défilement réel, rendu, interactions tactiles et lecteurs d’écran non vérifiés.');
