#!/usr/bin/env node
// Module réel dans un DOM simulé. Aucune API externe ni dépendance.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const code = readFileSync(new URL('../assets/article-share.js', import.meta.url), 'utf8');
const canonicalURL = 'https://thot-culture.github.io/Thot/articles/autorite.html';
const origin = 'https://thot-culture.github.io';
const flush = () => new Promise(resolve => setImmediate(resolve));
const pending = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

function fixture({ canonical = canonicalURL, currentOrigin = origin, navigator = {}, run = true, blockCount = 1, missing = '' } = {}) {
  let focused;
  class Node {
    constructor(tag, attrs = {}, text = '') {
      this.tagName = tag; this.attributes = new Map(Object.entries(attrs));
      this.textContent = text; this.children = []; this.events = new Map();
      this.hidden = Object.hasOwn(attrs, 'hidden'); this.disabled = false;
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    set href(value) { this.setAttribute('href', value); }
    get href() { return this.getAttribute('href'); }
    append(...children) { this.children.push(...children); }
    insertBefore(node, reference) {
      const index = this.children.indexOf(reference); assert.notEqual(index, -1);
      this.children.splice(index, 0, node);
    }
    querySelector(selector) {
      const attr = selector.slice(1, -1);
      for (const child of this.children) {
        if (child.attributes.has(attr)) return child;
        const nested = child.querySelector(selector); if (nested) return nested;
      }
      return null;
    }
    addEventListener(type, callback) { this.events.set(type, callback); }
    focus() { if (!this.disabled) focused = this; }
    select() { this.selected = this.value; }
    emit(type, properties = {}) { return this.events.get(type)?.({ type, target: this, ...properties }); }
    click() { if (!this.disabled) return this.emit('click', { detail: 0 }); }
  }
  const blocks = Array.from({ length: blockCount }, () => {
    const block = new Node('div', { 'data-article-share': '' });
    const link = new Node('a', { 'data-share-link': '', href: canonicalURL }, 'Lien permanent de cet article');
    const actions = new Node('div', { 'data-share-actions': '', hidden: '' });
    const native = new Node('button', { type: 'button', 'data-share-native': '', hidden: '' }, 'Partager cet article');
    const copy = new Node('button', { type: 'button', 'data-share-copy': '' }, 'Copier le lien');
    const status = new Node('p', { 'data-share-status': '', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
    actions.append(native, copy); block.append(link, actions, status);
    if (missing) block.querySelector(missing)?.attributes.delete(missing.slice(1, -1));
    return { block, link, actions, native, copy, status, manual: () => block.children.find(node => node.tagName === 'input') };
  });
  const canonicalNode = canonical === null ? null : new Node('link', { href: canonical });
  const document = {
    title: 'THOT — Titre du document',
    querySelectorAll: selector => selector === '[data-article-share]' ? blocks.map(item => item.block) : [],
    querySelector: selector => selector === 'h1' ? { textContent: '  Comprendre l’autorité  ' } : canonicalNode,
    createElement: tag => new Node(tag)
  };
  // La lecture de href provoquerait une erreur : le partage doit lire la canonique,
  // et ne doit jamais reprendre les paramètres ou fragments de l’URL courante.
  const location = { origin: currentOrigin, get href() { throw Error('Ne pas lire location.href'); } };
  if (run) vm.runInNewContext(code, { document, navigator, location, URL });
  return { ...blocks[0], blocks, focused: () => focused, navigator };
}

let cases = 0;
async function test(name, callback) {
  await callback(); cases++;
  console.log('PASS : ' + name);
}

await test('sans JS, lien permanent utile et actions masquées', () => {
  const page = fixture({ run: false });
  assert.equal(page.link.href, canonicalURL); assert.equal(page.actions.hidden, true);
  assert.equal(page.focused(), undefined); assert.equal(page.status.textContent, '');
});
await test('initialisation progressive, statut lecteur d’écran et aucun focus volé', () => {
  const page = fixture();
  assert.equal(page.actions.hidden, false); assert.equal(page.native.hidden, true);
  assert.equal(page.copy.getAttribute('type'), 'button'); assert.equal(page.copy.disabled, false);
  assert.equal(page.status.getAttribute('role'), 'status'); assert.equal(page.status.getAttribute('aria-live'), 'polite');
  assert.equal(page.status.getAttribute('aria-atomic'), 'true'); assert.equal(page.focused(), undefined);
  assert.equal(page.status.textContent, ''); assert.equal(page.manual(), undefined);
  assert.deepEqual([...page.copy.events.keys()], ['click'], 'Activation native Entrée/Espace, sans gestion clavier concurrente');
});
await test('canonique indépendante de location.href, query et fragment retirés', async () => {
  const written = [];
  const page = fixture({ canonical: canonicalURL + '?suivi=prive#source', navigator: { clipboard: { writeText: url => { written.push(url); return Promise.resolve(); } } } });
  await page.copy.click();
  assert.deepEqual(written, [canonicalURL]); assert.equal(page.link.href, canonicalURL);
});
await test('canonique absente, vide, relative, HTTP, externe, hors THOT, mal formée ou avec identifiants : actions masquées', () => {
  for (const canonical of [null, '', 'articles/autorite.html', canonicalURL.replace('https:', 'http:'),
    'https://example.test/Thot/articles/autorite.html', origin + '/autre/autorite.html', 'invalide',
    'https://utilisateur:secret@thot-culture.github.io/Thot/articles/autorite.html']) {
    const page = fixture({ canonical, navigator: { share() {} } });
    assert.equal(page.actions.hidden, true); assert.equal(page.copy.events.size, 0); assert.equal(page.focused(), undefined);
  }
  assert.equal(fixture({ currentOrigin: 'https://preview.example.test' }).actions.hidden, true);
});
await test('copie annoncée seulement après résolution, puis boutons réactivés sans déplacement du focus', async () => {
  const operation = pending(); const written = [];
  const page = fixture({ navigator: { clipboard: { writeText: url => { written.push(url); return operation.promise; } }, share() {} } });
  page.copy.focus(); const click = page.copy.click();
  assert.deepEqual(written, [canonicalURL]); assert.equal(page.status.textContent, '');
  assert.equal(page.copy.disabled, true); assert.equal(page.native.disabled, true);
  operation.resolve(); await click;
  assert.equal(page.status.textContent, 'Lien copié.'); assert.equal(page.copy.disabled, false);
  assert.equal(page.native.disabled, false); assert.equal(page.focused(), page.copy);
});
await test('double clic et actions concurrentes ignorés pendant une copie', async () => {
  const operation = pending(); let copies = 0, shares = 0;
  const page = fixture({ navigator: { clipboard: { writeText() { copies++; return operation.promise; } }, share() { shares++; } } });
  const first = page.copy.click();
  page.copy.emit('click'); page.native.emit('click');
  assert.equal(copies, 1); assert.equal(shares, 0);
  operation.resolve(); await first;
});
await test('clipboard absent : champ readonly nommé, URL sélectionnée et consigne manuelle honnête', async () => {
  const page = fixture(); await page.copy.click(); const manual = page.manual();
  assert.equal(manual.readOnly, true); assert.equal(manual.value, canonicalURL); assert.equal(manual.selected, canonicalURL);
  assert.equal(manual.getAttribute('aria-label'), 'Lien permanent à copier'); assert.equal(page.focused(), manual);
  assert.match(page.status.textContent, /Copie automatique indisponible/); assert.doesNotMatch(page.status.textContent, /Lien copié/);
  assert.equal(page.copy.disabled, false);
});
await test('refus clipboard : aucun faux succès, repli réutilisé sans champ supplémentaire', async () => {
  const page = fixture({ navigator: { clipboard: { writeText: () => Promise.reject(Error('refus')) } } });
  await page.copy.click(); const manual = page.manual(); await page.copy.click();
  assert.equal(page.manual(), manual); assert.equal(page.block.children.filter(node => node.tagName === 'input').length, 1);
  assert.equal(page.focused(), manual); assert.equal(manual.selected, canonicalURL);
  assert.doesNotMatch(page.status.textContent, /Lien copié/); assert.equal(page.copy.disabled, false);
});
await test('exception synchrone clipboard récupérée, puis nouvelle copie réussie', async () => {
  let attempt = 0;
  const page = fixture({ navigator: { clipboard: { writeText() { if (++attempt === 1) throw Error('refus'); return Promise.resolve(); } } } });
  await page.copy.click(); assert.equal(page.manual().hidden, false);
  page.copy.focus(); await page.copy.click();
  assert.equal(page.manual().hidden, true); assert.equal(page.status.textContent, 'Lien copié.');
  assert.equal(page.focused(), page.copy);
});
await test('partage natif disponible : titre exact et canonique, sans prétendre confirmer la publication', async () => {
  const sent = []; const page = fixture({ navigator: { share: data => { sent.push(data); return Promise.resolve(); } } });
  assert.equal(page.native.hidden, false); assert.equal(page.native.getAttribute('type'), 'button');
  assert.deepEqual([...page.native.events.keys()], ['click']);
  page.native.focus(); await page.native.click();
  assert.equal(sent.length, 1); assert.equal(sent[0].title, 'Comprendre l’autorité'); assert.equal(sent[0].url, canonicalURL);
  assert.equal(page.status.textContent, ''); assert.equal(page.focused(), page.native);
  assert.equal(page.native.disabled, false); assert.equal(page.copy.disabled, false);
});
await test('partage natif en cours : un appel et aucune copie concurrente', async () => {
  const operation = pending(); let shares = 0, copies = 0;
  const page = fixture({ navigator: { share() { shares++; return operation.promise; }, clipboard: { writeText() { copies++; } } } });
  const click = page.native.click(); page.native.emit('click'); page.copy.emit('click');
  assert.equal(shares, 1); assert.equal(copies, 0); assert.equal(page.status.textContent, '');
  operation.resolve(); await click; assert.equal(page.native.disabled, false);
});
await test('annulation native silencieuse et sans rejet non géré', async () => {
  const page = fixture({ navigator: { share: () => Promise.reject(Object.assign(Error('annulation'), { name: 'AbortError' })) } });
  await page.native.click(); await flush();
  assert.equal(page.status.textContent, ''); assert.equal(page.native.disabled, false); assert.equal(page.copy.disabled, false);
});
await test('échec natif annoncé, copie toujours disponible et réussie ensuite', async () => {
  const page = fixture({ navigator: { share: () => Promise.reject(Error('indisponible')), clipboard: { writeText: () => Promise.resolve() } } });
  await page.native.click(); assert.match(page.status.textContent, /n’a pas abouti/);
  assert.equal(page.copy.disabled, false); await page.copy.click(); assert.equal(page.status.textContent, 'Lien copié.');
});
await test('exception synchrone native récupérée sans bloquer les boutons', async () => {
  const page = fixture({ navigator: { share() { throw Error('refus'); } } });
  await page.native.click(); assert.match(page.status.textContent, /n’a pas abouti/);
  assert.equal(page.native.disabled, false); assert.equal(page.copy.disabled, false);
});
await test('blocs absents ou incomplets sans erreur, bloc valide indépendant', async () => {
  fixture({ blockCount: 0 });
  for (const missing of ['[data-share-link]', '[data-share-actions]', '[data-share-copy]', '[data-share-status]']) {
    const page = fixture({ missing }); assert.equal(page.actions.hidden, true); assert.equal(page.focused(), undefined);
  }
  const page = fixture({ blockCount: 2 }); await page.blocks[0].copy.click();
  assert.ok(page.blocks[0].manual()); assert.equal(page.blocks[1].manual(), undefined);
  assert.equal(page.blocks[1].status.textContent, ''); assert.equal(page.blocks[1].copy.disabled, false);
});
console.log(`${cases} cas validés. DOM et API simulés : menus système, clipboard réel, clavier natif et lecteurs d’écran non vérifiés dans un navigateur.`);
