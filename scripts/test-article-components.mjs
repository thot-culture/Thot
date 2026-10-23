#!/usr/bin/env node
// Tests du glossaire et des médias réels, dans un DOM simulé sans accès réseau.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = name => readFileSync(new URL(name, root), 'utf8');
const catalogue = JSON.parse(read('assets/illustrations.json'));
const glossaryCode = read('assets/glossaire-interactif.js');
const mediaCode = read('assets/article-media.js');

class Element {
  constructor(tag = 'div') {
    this.tag = tag; this.className = ''; this.textContent = ''; this.children = [];
    this.attributes = new Map(); this.events = new Map(); this.dataset = {};
    this.hidden = false; this.disabled = false;
  }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  append(...children) { this.children.push(...children); for (const child of children) child.parent = this; }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  replaceWith(node) { this.replacement = node; }
  addEventListener(type, callback, options = {}) {
    if (!this.events.has(type)) this.events.set(type, []);
    this.events.get(type).push({ callback, once: options.once });
  }
  emit(type, event = {}) {
    for (const entry of [...(this.events.get(type) || [])]) {
      entry.callback(event);
      if (entry.once) this.events.set(type, this.events.get(type).filter(item => item !== entry));
    }
  }
  closest(selector) {
    if (selector === '.thot-cover') return this.cover ? this : null;
    if (selector === '.thot-terme') {
      if (this.className === 'thot-terme') return this;
      return this.parent?.closest(selector) || null;
    }
    return null;
  }
}

// Le HTML sans JS expose les définitions ; seuls les boutons avec cible valide
// doivent devenir actifs et masquer leur définition après initialisation.
{
  const definitions = new Map([['def-alpha', new Element('span')], ['def-beta', new Element('span')]]);
  const terms = ['alpha', 'beta', 'absente'].map(word => {
    const button = new Element('button'); button.className = 'thot-terme'; button.disabled = true;
    button.textContent = word; button.setAttribute('aria-controls', 'def-' + word);
    button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'Afficher la définition : ' + word);
    return button;
  });
  const labels = terms.map(term => term.getAttribute('aria-label'));
  const listeners = new Map(); let focused;
  for (const term of terms) term.focus = () => { focused = term; };
  const document = {
    getElementById: id => definitions.get(id) || null,
    querySelectorAll: selector => selector === '.thot-terme' ? terms : terms.filter(term => term.getAttribute('aria-expanded') === 'true'),
    querySelector: () => terms.find(term => term.getAttribute('aria-expanded') === 'true') || null,
    addEventListener: (type, callback) => listeners.set(type, callback)
  };
  vm.runInNewContext(glossaryCode, { document, Element });
  assert.equal(terms[0].disabled, false); assert.equal(terms[1].disabled, false);
  assert.equal(terms[2].disabled, true, 'Ne pas activer une définition inexistante');
  assert.ok([...definitions.values()].every(definition => definition.hidden));
  const click = target => listeners.get('click')({ target });
  click(terms[0]);
  assert.equal(terms[0].getAttribute('aria-expanded'), 'true'); assert.equal(definitions.get('def-alpha').hidden, false);
  click(terms[1]);
  assert.equal(terms[0].getAttribute('aria-expanded'), 'false'); assert.equal(definitions.get('def-alpha').hidden, true);
  assert.equal(terms[1].getAttribute('aria-expanded'), 'true'); assert.equal(definitions.get('def-beta').hidden, false);
  listeners.get('keydown')({ key: 'Escape' });
  assert.equal(terms[1].getAttribute('aria-expanded'), 'false'); assert.equal(focused, terms[1]);
  const inner = new Element('span'); terms[0].append(inner); click(inner);
  assert.equal(terms[0].getAttribute('aria-expanded'), 'true', 'Le clic sur un enfant ouvre aussi le terme');
  click(terms[0]); assert.equal(terms[0].getAttribute('aria-expanded'), 'false');
  click(terms[0]); click(new Element('p')); assert.equal(terms[0].getAttribute('aria-expanded'), 'false');
  click(terms[2]); assert.equal(terms[2].getAttribute('aria-expanded'), 'false');
  assert.deepEqual(terms.map(term => term.getAttribute('aria-label')), labels, 'Conserver les libellés d’origine');
}
console.log('PASS : glossaire, initialisation progressive, cible absente, ouverture/fermeture, deux termes, enfant cliqué, clic extérieur et Échap/focus.');

const defaultKeys = ['roubaix-ville-avant-1919', 'roubaix-revues-1917'];
const defaultScriptURL = 'https://thot-culture.github.io/Thot/assets/article-media.js';
async function mediaFixture({ keys = defaultKeys, entries = catalogue, fail = '', script = true, scriptURL = defaultScriptURL } = {}) {
  const slots = keys.map((key, index) => {
    const slot = new Element(); slot.dataset.thotImage = key; slot.cover = index === 0;
    const pending = new Element('p'); pending.textContent = 'Description éditoriale existante'; slot.append(pending);
    return slot;
  });
  const requests = [];
  const document = {
    currentScript: script ? { src: scriptURL } : null,
    baseURI: new URL('../articles/roubaix-1917.html', scriptURL).href,
    querySelectorAll: () => slots,
    createElement: tag => new Element(tag),
    createTextNode: value => Object.assign(new Element('#text'), { textContent: value })
  };
  const fetch = (url, options) => {
    requests.push({ url: String(url), options });
    if (fail === 'network') return Promise.reject(Error('Réseau indisponible'));
    return Promise.resolve({
      ok: fail !== 'http',
      json: () => fail === 'json' ? Promise.reject(SyntaxError('JSON invalide')) : Promise.resolve(entries)
    });
  };
  vm.runInNewContext(mediaCode, { document, fetch, URL });
  // Le fetch est simulé ; vider la chaîne de promesses avant les assertions.
  await new Promise(resolve => setImmediate(resolve));
  return { slots, requests };
}

{
  const { slots, requests } = await mediaFixture();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://thot-culture.github.io/Thot/assets/illustrations.json');
  assert.equal(requests[0].options.cache, 'no-cache');
  const names = [];
  for (let index = 0; index < slots.length; index++) {
    const record = catalogue[defaultKeys[index]], figure = slots[index].replacement;
    assert.equal(figure.tag, 'figure');
    const [link, caption] = figure.children, img = link.children[0];
    assert.equal(link.href, record.sourceUrl); assert.equal(link.target, '_blank');
    assert.equal(link.rel, 'noopener noreferrer');
    assert.ok(link.getAttribute('aria-label').includes(record.alt), 'Le nom accessible conserve la description de l’image');
    names.push(link.getAttribute('aria-label'));
    assert.equal(img.src, new URL(record.url, defaultScriptURL).href); assert.equal(img.alt, record.alt);
    assert.equal(img.width, record.width); assert.equal(img.height, record.height);
    assert.equal(img.loading, index === 0 ? 'eager' : 'lazy'); assert.equal(img.decoding, 'async');
    if (index === 0) assert.equal(img.fetchPriority, 'high');
    assert.equal(caption.children[2].textContent, record.caption);
    const credits = caption.children[3];
    assert.ok(credits.textContent.includes(record.credit));
    assert.equal(credits.children[0].href, record.licenceUrl); assert.equal(credits.children[0].textContent, record.licence);
    assert.equal(credits.children[2].href, record.sourceUrl);
    img.emit('error'); img.emit('error');
    assert.equal(link.children.length, 1); assert.equal(link.children[0].className, 'thot-illustration-fallback');
    assert.match(link.children[0].textContent, /Image indisponible/);
    assert.equal(figure.children[1], caption, 'Une erreur d’image conserve la légende et les crédits');
    assert.equal(link.href, record.sourceUrl, 'Le repli conserve un accès à la notice');
  }
  assert.equal(new Set(names).size, slots.length, 'Les liens de documents restent distinguables');
}
{
  const scriptURL = 'https://preview.thot.test/sous-dossier/assets/article-media.js?v=2';
  const entries = {
    relative: { ...catalogue[defaultKeys[0]], url: 'images/roubaix-gambetta.webp' },
    absolute: { ...catalogue[defaultKeys[1]], url: 'https://images.example.test/document.webp?width=1200' }
  };
  const { slots, requests } = await mediaFixture({ keys: ['relative', 'absolute'], entries, scriptURL });
  assert.equal(requests[0].url, 'https://preview.thot.test/sous-dossier/assets/illustrations.json');
  assert.equal(slots[0].replacement.children[0].children[0].src,
    'https://preview.thot.test/sous-dossier/assets/images/roubaix-gambetta.webp',
    'Une image relative se résout depuis le script assets, même depuis un article');
  assert.equal(slots[1].replacement.children[0].children[0].src, entries.absolute.url,
    'Une image absolue conserve son URL et ses paramètres');
}
for (const fail of ['network', 'http', 'json']) {
  const { slots } = await mediaFixture({ fail });
  for (const slot of slots) {
    assert.equal(slot.replacement, undefined);
    assert.equal(slot.children[0].textContent, 'Description éditoriale existante');
    assert.match(slot.children[1].textContent, /n’a pas pu être chargée/);
  }
}
{
  const incomplete = { ...catalogue, incomplete: { ...catalogue[defaultKeys[0]], licence: '' } };
  const { slots } = await mediaFixture({ keys: ['cle-absente', 'incomplete'], entries: incomplete });
  for (const slot of slots) {
    assert.equal(slot.replacement, undefined); assert.match(slot.children[1].textContent, /absente ou incomplète/);
  }
  assert.equal((await mediaFixture({ keys: [] })).requests.length, 0);
  assert.equal((await mediaFixture({ script: false })).requests.length, 0);
}
console.log('PASS : médias, catalogue local, URL relatives au script et absolues, couverture/lazy, noms accessibles distincts, crédits/licences conservés, erreur image, erreurs réseau/HTTP/JSON, clé absente et notice incomplète.');
console.log('DOM et réseau simulés : le rendu visuel et les réponses HTTP externes restent à vérifier.');
