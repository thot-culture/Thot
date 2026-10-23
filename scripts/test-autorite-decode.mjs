#!/usr/bin/env node
// Nouveau jeu réel, HTML réel et DOM simulé : aucun navigateur ni réseau.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('articles/autorite.html', root), 'utf8');
const code = readFileSync(new URL('assets/autorite-decode.js', root), 'utf8');
const decode = value => value.replace(/&(?:amp|quot|apos|nbsp);/g, entity => ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ' })[entity]).replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)));
const attributes = source => Object.fromEntries([...source.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)].map(m => [m[1], decode(m[2] ?? m[3] ?? m[4] ?? '')]));

class Element {
  constructor(tag, attrs = {}) {
    this.localName = tag;
    this.tagName = tag.toUpperCase();
    this.attrs = new Map();
    this.dataset = {};
    this.childNodes = [];
    this.parentElement = null;
    this.listeners = new Map();
    for (const [name, value] of Object.entries(attrs)) this.setAttribute(name, value);
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(' '); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(name => !names.includes(name)).join(' '); },
      toggle: (name, force) => {
        const enabled = force ?? !this.classList.contains(name);
        this.classList[enabled ? 'add' : 'remove'](name);
        return enabled;
      }
    };
  }
  get children() { return this.childNodes.filter(child => child instanceof Element); }
  get textContent() { return this.childNodes.map(child => typeof child === 'string' ? child : child.textContent).join(''); }
  set textContent(value) { this.childNodes = [String(value)]; }
  get hidden() { return this.attrs.has('hidden'); }
  set hidden(value) { if (value) this.attrs.set('hidden', ''); else this.attrs.delete('hidden'); }
  get disabled() { return this.attrs.has('disabled'); }
  set disabled(value) { if (value) this.attrs.set('disabled', ''); else this.attrs.delete('disabled'); }
  get open() { return this.attrs.has('open'); }
  get className() { return this.getAttribute('class') ?? ''; }
  set className(value) { this.setAttribute('class', value); }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  hasAttribute(name) { return this.attrs.has(name); }
  setAttribute(name, value) {
    this.attrs.set(name, String(value));
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = String(value);
  }
  removeAttribute(name) { this.attrs.delete(name); }
  append(...values) {
    for (const value of values) {
      this.childNodes.push(value);
      if (value instanceof Element) value.parentElement = this;
    }
  }
  appendChild(value) { this.append(value); return value; }
  replaceChildren(...values) { this.childNodes = []; this.append(...values); }
  remove() { if (this.parentElement) this.parentElement.childNodes = this.parentElement.childNodes.filter(child => child !== this); }
  contains(node) { return node === this || this.children.some(child => child.contains(node)); }
  matches(selector) {
    const tag = selector.match(/^[a-z][\w-]*/i)?.[0];
    if (tag && tag !== this.localName) return false;
    for (const match of selector.matchAll(/([.#])([\w-]+)|\[([\w-]+)(?:=["']?([^\]"']+)["']?)?\]/g)) {
      if (match[1] === '.' && !this.classList.contains(match[2])) return false;
      if (match[1] === '#' && this.getAttribute('id') !== match[2]) return false;
      if (match[3] && (!this.hasAttribute(match[3]) || (match[4] !== undefined && this.getAttribute(match[3]) !== match[4]))) return false;
    }
    return true;
  }
  querySelectorAll(selector) {
    const selectors = selector.split(',').map(part => part.trim().split(/\s+/));
    const found = [];
    const visit = node => {
      for (const child of node.children) {
        if (selectors.some(parts => {
          if (!child.matches(parts.at(-1))) return false;
          let ancestor = child.parentElement;
          for (let i = parts.length - 2; i >= 0; i--) {
            while (ancestor && !ancestor.matches(parts[i])) ancestor = ancestor.parentElement;
            if (!ancestor) return false;
            ancestor = ancestor.parentElement;
          }
          return true;
        })) found.push(child);
        visit(child);
      }
    };
    visit(this);
    return found;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) ?? null; }
  addEventListener(type, callback) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(callback); this.listeners.set(type, listeners);
  }
  click() {
    if (this.disabled) return;
    const event = { target: this, preventDefault() {} };
    for (let node = this; node; node = node.parentElement) {
      event.currentTarget = node;
      for (const callback of node.listeners.get('click') ?? []) callback.call(node, event);
    }
  }
  focus() {
    let document = this;
    while (document.parentElement) document = document.parentElement;
    document.activeElement = this; document.focusCalls.push(this);
  }
  scrollIntoView() {}
}

function parse(markup) {
  const document = new Element('document');
  document.focusCalls = [];
  document.getElementById = id => document.querySelector('#' + id);
  document.createElement = tag => new Element(tag);
  const stack = [document], voids = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const staticHTML = markup.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  for (const match of staticHTML.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?([a-z][\w:-]*)\b([^>]*?)>|([^<]+)/gi)) {
    if (match[3]) { stack.at(-1).append(decode(match[3])); continue; }
    if (!match[1]) continue;
    const tag = match[1].toLowerCase();
    if (match[0].startsWith('</')) {
      const index = stack.findLastIndex(node => node.localName === tag);
      if (index > 0) stack.length = index;
    } else {
      const node = new Element(tag, attributes(match[2])); stack.at(-1).append(node);
      if (!voids.has(tag) && !match[0].endsWith('/>')) stack.push(node);
    }
  }
  document.activeElement = document.querySelector('h1');
  return document;
}

const options = ['expertise', 'statut', 'legitimite', 'sanction'];
const situations = ['parents', 'etat', 'direction'];
const initial = parse(html);
const gameHTML = initial.getElementById('decode-pouvoir');
assert.ok(gameHTML, 'Section #decode-pouvoir présente');
assert.equal(gameHTML.localName, 'section');
const initialCases = gameHTML.querySelectorAll('[data-decode-case]');
assert.deepEqual(initialCases.map(scene => scene.dataset.decodeCase), situations);
for (const scene of initialCases) {
  assert.ok(scene.classList.contains('decode-case'));
  assert.equal(scene.querySelector('h3')?.getAttribute('tabindex'), '-1');
  const buttons = scene.querySelectorAll('[data-decode-option]');
  assert.deepEqual(buttons.map(button => button.dataset.decodeOption), options);
  for (const button of buttons) {
    assert.equal(button.localName, 'button');
    assert.equal(button.getAttribute('type'), 'button');
    assert.ok(button.classList.contains('decode-option'));
    assert.equal(button.disabled, true, 'Les réponses restent inactives sans JavaScript');
    assert.equal(button.getAttribute('aria-pressed'), 'false');
  }
}
for (const [name, value] of Object.entries({ role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' })) assert.equal(initial.getElementById('decode-feedback')?.getAttribute(name), value);
assert.equal(initial.getElementById('decode-controls')?.hidden, true);
const initialFallback = initial.getElementById('decode-fallback');
assert.equal(initialFallback?.localName, 'details');
assert.equal(initialFallback.hidden, false);
assert.equal(initialFallback.open, false, 'Les pistes statiques ne s’ouvrent que sur demande');
assert.ok(initialFallback.querySelector('summary'));
assert.match(html, /<script\b[^>]*src="\.\.\/assets\/autorite-decode\.js(?:\?[^"<>]*)?"[^>]*\bdefer\b[^>]*><\/script>/);

const snapshot = node => node && { attrs: [...node.attrs], text: node.textContent, listeners: [...node.listeners].map(([type, callbacks]) => [type, callbacks.length]), children: node.children.map(snapshot) };
function fixture(mutate = () => {}) {
  const document = parse(html);
  mutate(document);
  const beforeOld = snapshot(document.getElementById('jeu'));
  assert.ok(beforeOld, 'L’ancienne activité #jeu est conservée');
  const active = document.activeElement;
  vm.runInNewContext(code, { document, window: { matchMedia: () => ({ matches: true }) } }, { filename: 'assets/autorite-decode.js' });
  assert.deepEqual(snapshot(document.getElementById('jeu')), beforeOld, 'L’ancienne activité reste isolée du nouveau jeu');
  assert.equal(document.activeElement, active, 'L’initialisation ne vole pas le focus');
  assert.equal(document.focusCalls.length, 0);
  const game = document.getElementById('decode-pouvoir');
  return {
    document, game,
    cases: game?.querySelectorAll('[data-decode-case]') ?? [],
    feedback: document.getElementById('decode-feedback'),
    progress: document.getElementById('decode-progress'),
    next: document.getElementById('decode-next'),
    reset: document.getElementById('decode-reset'),
    controls: document.getElementById('decode-controls'),
    fallback: document.getElementById('decode-fallback')
  };
}
const buttonsOf = scene => scene.querySelectorAll('[data-decode-option]');
function assertStage(page, index, answered = false) {
  assert.deepEqual(page.cases.map(scene => scene.hidden), page.cases.map((_, i) => i !== index), 'Une seule scène est affichée');
  assert.match(page.progress.textContent, new RegExp(`${index + 1}\\s*(?:/|sur)\\s*3`), 'Progression sur trois étapes');
  assert.equal(page.next.hidden, index === 2);
  if (index < 2) assert.equal(page.next.disabled, !answered, 'Une réponse est nécessaire avant de continuer');
  assert.equal(page.controls.hidden, false);
  assert.equal(page.reset.disabled, false);
  assert.equal(page.fallback.hidden, true);
  assert.equal(page.fallback.open, false);
  assert.ok(page.cases.every(scene => buttonsOf(scene).every(button => !button.disabled)));
}

const page = fixture();
assertStage(page, 0);
page.next.click(); assertStage(page, 0);
const replies = new Set();
const rightAnswers = { parents: 'expertise', etat: 'legitimite', direction: 'sanction' };
const rightWords = { parents: /expertise|expérience|savoir/i, etat: /légitimité|mandat|reconnu/i, direction: /sanction|conséquence|punition/i };
for (let index = 0; index < 3; index++) {
  const scene = page.cases[index];
  for (const button of buttonsOf(scene)) {
    const others = page.cases.filter(item => item !== scene).map(snapshot);
    button.focus(); button.click();
    assertStage(page, index, true);
    assert.deepEqual(buttonsOf(scene).map(item => item.getAttribute('aria-pressed')), buttonsOf(scene).map(item => String(item === button)), 'Réponses révisables avec sélection exclusive');
    const message = page.feedback.textContent.trim();
    assert.equal(message.endsWith('Les trois situations sont explorées. Tu peux poursuivre l’article ou recommencer.'), index === 2, 'La fin des trois situations est annoncée dans le statut live pour chaque réponse finale');
    assert.ok(message.length > 60, 'Chaque réponse reçoit une explication développée');
    assert.ok(!replies.has(message), 'Les douze explications sont distinctes');
    replies.add(message);
    assert.match(message, rightWords[scene.dataset.decodeCase], 'Chaque explication rappelle le ressort central du cas');
    if (button.dataset.decodeOption === rightAnswers[scene.dataset.decodeCase]) assert.match(message, /^Bien vu\b/, 'La bonne piste est identifiée');
    else assert.doesNotMatch(message, /^Bien vu\b/, 'Les autres indices restent des hypothèses secondaires');
    assert.deepEqual(page.cases.filter(item => item !== scene).map(snapshot), others, 'La réponse reste propre à sa scène');
  }
  if (index < 2) {
    page.next.click();
    assertStage(page, index + 1);
    assert.equal(page.document.activeElement, page.cases[index + 1].querySelector('h3'));
  }
}
assert.equal(replies.size, 12);

for (const [stage, answered] of [[0, false], [0, true], [1, false], [1, true], [2, false], [2, true]]) {
  const resetPage = fixture();
  for (let i = 0; i < stage; i++) { buttonsOf(resetPage.cases[i])[0].click(); resetPage.next.click(); }
  if (answered) buttonsOf(resetPage.cases[stage])[3].click();
  resetPage.reset.click();
  assertStage(resetPage, 0);
  assert.ok(resetPage.cases.every(scene => buttonsOf(scene).every(button => button.getAttribute('aria-pressed') === 'false')), 'Toutes les réponses sont effacées');
  assert.match(resetPage.feedback.textContent, /recommenc|début|réinitialis|nouveau|repr/i, 'La remise à zéro est annoncée');
  assert.equal(resetPage.document.activeElement, resetPage.cases[0].querySelector('h3'));
}

const incomplete = [
  document => document.getElementById('decode-pouvoir').remove(),
  ...['decode-progress', 'decode-feedback', 'decode-next', 'decode-reset', 'decode-controls', 'decode-fallback'].map(id => document => document.getElementById(id).remove()),
  document => document.querySelector('[data-decode-case="etat"]').remove(),
  document => document.querySelector('[data-decode-case="etat"]').setAttribute('data-decode-case', 'inconnu'),
  document => document.querySelector('[data-decode-case="etat"]').setAttribute('data-decode-case', 'parents'),
  document => document.querySelector('[data-decode-case="parents"] h3').remove(),
  document => document.querySelector('[data-decode-case="parents"] [data-decode-option="sanction"]').remove(),
  document => document.querySelector('[data-decode-case="parents"] [data-decode-option="sanction"]').setAttribute('data-decode-option', 'inconnu')
];
for (const mutation of incomplete) {
  const partial = fixture(mutation);
  assert.ok(!partial.controls || partial.controls.hidden, 'Une activité incomplète ne révèle pas ses contrôles');
  assert.ok(!partial.fallback || !partial.fallback.hidden, 'Une activité incomplète garde son repli natif');
  assert.ok(partial.cases.every(scene => buttonsOf(scene).every(button => button.disabled)), 'Une activité incomplète garde ses choix désactivés');
}

// Vérifier le contenu existant, hors les trois ajouts autorisés et leur indentation.
function withoutGame(markup) {
  const opening = markup.match(/<section\b[^>]*\bid="decode-pouvoir"[^>]*>/);
  if (opening) {
    let depth = 1, end;
    const rest = markup.slice(opening.index + opening[0].length);
    for (const match of rest.matchAll(/<\/?section\b[^>]*>/g)) {
      depth += match[0].startsWith('</') ? -1 : 1;
      if (!depth) { end = opening.index + opening[0].length + match.index + match[0].length; break; }
    }
    assert.ok(end, 'La nouvelle section est correctement fermée');
    markup = markup.slice(0, opening.index) + markup.slice(end);
  }
  return markup.replace(/<script\b[^>]*src="\.\.\/assets\/autorite-decode\.js(?:\?[^"<>]*)?"[^>]*>\s*<\/script>/g, '')
    .replace(/(href="\.\.\/assets\/autorite\.css)\?[^"<>]*/g, '$1')
    .split('\n').map(line => line.trim()).filter(Boolean).join('\n');
}
// Empreinte du HTML de `git show 039ccd8:articles/autorite.html`, normalisé
// par withoutGame(). Aucun sous-processus ni dépôt Git requis pour lancer le test.
const originalDigest = '282b8400d6efe3c26b964ab01d804cb3cebe8cfe4db1e9fc44c97250bb374851';
assert.equal(createHash('sha256').update(withoutGame(html)).digest('hex'), originalDigest, 'Article, ancien jeu, sources et crédits de 039ccd8 conservés');
console.log('PASS : 12 réponses distinctes, 3 étapes, réponses révisables, progression/focus, reset à chaque étape, garde-fous d’initialisation et isolation de l’ancien jeu.');
console.log('PASS : article conservé depuis 039ccd8 hors section ajoutée, nouveau script et révision CSS autorisés.');
console.log('DOM simulé : rendu mobile/ordinateur, clavier réel et lecteurs d’écran non vérifiés.');
