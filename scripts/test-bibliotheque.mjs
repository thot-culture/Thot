#!/usr/bin/env node
// Contrôles statiques et tests du JavaScript réel dans un DOM simulé.
// Aucune installation ni connexion réseau. Ce test ne mesure pas le rendu CSS.
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(resolve(root, 'bibliotheque.html'), 'utf8');
const source = await readFile(resolve(root, 'assets/bibliotheque.js'), 'utf8');
// Option : --baseline /chemin/original.html pour vérifier une régression avant correction.
const baselineIndex = process.argv.indexOf('--baseline');
const baseline = baselineIndex !== -1;
const oldHTML = baseline ? await readFile(process.argv[baselineIndex + 1], 'utf8') : '';
const code = baseline ? oldHTML.match(/<script>\s*([\s\S]*?)<\/script>/)[1] : source;
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&nbsp;', ' ')
  .replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const text = value => decode(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const attributes = markup => Object.fromEntries([...markup.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)]
  .map(m => [m[1].toLowerCase(), decode(m[2] ?? m[3] ?? m[4] ?? '')]));
const tags = [...html.matchAll(/<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)]
  .map(m => ({ tag: m[1].toLowerCase(), ...attributes(m[2]) }));

class Node {
  constructor() {
    this.attrs = new Map(); this.listeners = new Map(); this.children = [];
    this.hidden = false; this.textContent = ''; this.value = '';
    const classes = new Set();
    this.classList = {
      contains: name => classes.has(name), add: name => classes.add(name),
      toggle: (name, force) => { if (force) classes.add(name); else classes.delete(name); }
    };
  }
  setAttribute(key, value) { this.attrs.set(key, value); }
  getAttribute(key) { return this.attrs.get(key); }
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }
  emit(type, event = {}) { for (const callback of this.listeners.get(type) || []) callback(event); }
  append(child) { this.children.push(child); }
}

function fixture(initial = '', brokenImage = -1, options = {}) {
  const document = new Node(), window = new Node();
  window.location = { href: options.href ?? 'https://thot-culture.github.io/Thot/bibliotheque.html' };
  const historyCalls = [], historyAttempts = [];
  const history = {
    state: Object.hasOwn(options, 'state') ? options.state : { origine: 'bibliotheque' },
    replaceState(state, title, href) {
      historyAttempts.push({ state, title, href });
      if (options.historyFails) throw new Error('Historique refusé');
      historyCalls.push({ state, title, href });
      this.state = state;
      window.location.href = new URL(href, window.location.href).href;
    },
    pushState() { assert.fail('La recherche ne doit pas ajouter d’entrée d’historique'); }
  };
  if (!options.noHistory) window.history = history;
  if (options.historyGetterFails) Object.defineProperty(window, 'history', { get() { throw new Error('Accès historique refusé'); } });
  if (options.historyStateFails) Object.defineProperty(history, 'state', { get() { throw new Error('État historique refusé'); } });
  if (options.noLocation) delete window.location;
  let clock = 0, timerId = 0;
  const timers = new Map();
  const setTimeout = (callback, delay) => { const id = ++timerId; timers.set(id, { callback, at: clock + delay }); return id; };
  const clearTimeout = id => timers.delete(id);
  const advance = duration => {
    const until = clock + duration;
    while (true) {
      const next = [...timers].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
      if (!next) break;
      const [id, timer] = next; clock = timer.at; timers.delete(id); timer.callback();
    }
    clock = until;
  };
  const nodes = Object.fromEntries(tags.filter(tag => tag.id).map(tag => {
    const node = new Node(); node.hidden = Object.hasOwn(tag, 'hidden');
    node.focus = () => { document.activeElement = node; };
    return [tag.id, node];
  }));
  nodes['article-search'].value = initial;
  const filters = [...html.matchAll(/<button\b([^>]*data-filter[^>]*)>([\s\S]*?)<\/button>/g)].map(m => {
    const node = new Node(); node.dataset = { filter: attributes(m[1])['data-filter'] };
    node.textContent = text(m[2]); return node;
  });
  const cards = [...html.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/g)].map((m, index) => {
    const card = new Node(), attrs = attributes(m[1]), markup = m[2];
    card.dataset = { category: attrs['data-category'], keywords: attrs['data-keywords'] };
    card.textContent = text(markup);
    const findText = pattern => ({ textContent: text(markup.match(pattern)?.[1] || '') });
    const img = new Node(), photo = new Node();
    const imgAttrs = attributes(markup.match(/<img\b([^>]*)>/)[1]);
    img.alt = imgAttrs.alt; img.complete = true; img.naturalWidth = index === brokenImage ? 0 : 1200;
    img.closest = () => photo; photo.append(img);
    const selectors = {
      h3: findText(/<h3\b[^>]*>([\s\S]*?)<\/h3>/),
      '.discovery-meta': findText(/<div class="discovery-meta">([\s\S]*?)<\/div>/),
      '.discovery-card__copy > p': findText(/<p\b[^>]*>([\s\S]*?)<\/p>/),
      '.discovery-credit': findText(/<p class="discovery-credit">([\s\S]*?)<\/p>/),
      '.discovery-card__bottom > span': findText(/<div class="discovery-card__bottom"><span>([\s\S]*?)<\/span>/),
      '.discovery-photo img': img
    };
    card.querySelector = selector => selectors[selector] || null;
    return card;
  });
  document.getElementById = id => nodes[id];
  document.querySelectorAll = selector => selector === '.article-card' ? cards : filters;
  document.createElement = () => new Node();
  vm.runInNewContext(code, { document, window, URL: options.noURL ? undefined : options.URLImplementation ?? URL, setTimeout, clearTimeout });
  const query = value => { nodes['article-search'].value = value; nodes['article-search'].emit('input'); };
  const filter = category => filters.find(button => button.dataset.filter === category).emit('click');
  const visible = () => cards.filter(card => !card.hidden).map(card => card.dataset.category);
  const navigate = href => { window.location.href = new URL(href, window.location.href).href; window.emit('popstate'); };
  return { document, window, nodes, filters, cards, query, filter, visible, history, historyCalls, historyAttempts, timers, advance, navigate };
}

const f = fixture();
assert.equal(f.visible().length, 5);
for (const [query, expected] of [
  ['CHARLOTTE   BRONTE', ['arts']],
  ['Unis États', ['geographie']],
  ["l'autorité", ['sciences-humaines']],
  ['muscles couleur', ['sciences']],
  ['réquisition Roubaix', ['histoire']],
  ['arts', ['arts']],
  ['Nadar', ['arts']],
  ['2026', ['sciences-humaines', 'sciences', 'arts', 'geographie', 'histoire']],
  ['   ', ['sciences-humaines', 'sciences', 'arts', 'geographie', 'histoire']],
  ['zzzintrouvable', []]
]) {
  f.query(query); assert.deepEqual(f.visible(), expected, `Recherche : ${query}`);
}
f.query('');
for (const button of f.filters) {
  const category = button.dataset.filter; f.filter(category);
  const expected = category === 'tous' ? 5 : category === 'insolite' ? 0 : 1;
  assert.equal(f.visible().length, expected, `Filtre : ${category}`);
  assert.equal(f.filters.filter(b => b.getAttribute('aria-pressed') === 'true').length, 1);
  assert.equal(button.getAttribute('aria-pressed'), 'true');
}
f.query('roubaix'); assert.equal(f.visible().length, 0, 'Le filtre reste combiné à la recherche');
f.filter('histoire'); assert.deepEqual(f.visible(), ['histoire']);
f.nodes['clear-search'].emit('click');
assert.deepEqual(f.visible(), ['histoire'], 'Effacer conserve le filtre choisi');
assert.equal(f.nodes['clear-search'].hidden, true);
assert.equal(f.document.activeElement, f.nodes['article-search']);
f.query('pieuvre'); assert.equal(f.visible().length, 0);
assert.equal(f.nodes['results-status'].textContent, 'Aucun article trouvé');
assert.equal(f.nodes['empty-state'].classList.contains('hidden'), false);
f.nodes['reset-filters'].emit('click');
assert.equal(f.visible().length, 5);
assert.equal(f.nodes['article-search'].value, '');
assert.equal(f.nodes['empty-state'].classList.contains('hidden'), true);
assert.equal(f.document.activeElement, f.nodes['article-search']);
assert.equal(f.nodes['article-total'].textContent, '5');
assert.equal(f.nodes['library-search'].hidden, false, 'Commandes révélées après initialisation');
f.nodes['article-search'].value = 'Brontë'; f.window.emit('pageshow');
assert.deepEqual(f.visible(), ['arts'], 'Retour arrière et valeur restaurée sans input');
assert.deepEqual(fixture('Roubaix').visible(), ['histoire'], 'Valeur déjà présente au chargement');
const image = f.cards[0].querySelector('.discovery-photo img');
image.emit('error'); image.emit('error');
assert.equal(image.hidden, true);
assert.equal(image.closest().children.length, 2);
assert.ok(image.closest().children[1].getAttribute('aria-label').includes(image.alt));
const failedBeforeInit = fixture('', 0).cards[0].querySelector('.discovery-photo img');
assert.equal(failedBeforeInit.hidden, true, 'Image déjà en échec au chargement');
failedBeforeInit.emit('error');
assert.equal(failedBeforeInit.closest().children.length, 2, 'Pas de second repli');
console.log('PASS : recherche multi-mots/accents/tirets/apostrophes, 7 filtres, combinaison, remise à zéro, focus, retour arrière et repli image.');

if (!baseline) {
  const baseURL = 'https://thot-culture.github.io/Thot/bibliotheque.html';
  const urlOf = page => new URL(page.window.location.href);
  const pressed = page => page.filters.filter(button => button.getAttribute('aria-pressed') === 'true').map(button => button.dataset.filter);
  const state = { navigation: { page: 4 }, scroll: 210 };
  const restored = fixture('', -1, { href: baseURL + '?q=CHARLOTTE%20%20%20BRONT%C3%8B&sujet=arts&campagne=ete&campagne=automne#catalogue', state });
  assert.equal(restored.nodes['article-search'].value, 'CHARLOTTE   BRONTË');
  assert.deepEqual(restored.visible(), ['arts']);
  assert.deepEqual(pressed(restored), ['arts']);
  assert.equal(restored.historyAttempts.length, 0, 'La lecture initiale ne réécrit pas l’historique');
  assert.equal(restored.timers.size, 0);
  assert.equal(fixture('Roubaix', -1, { href: baseURL + '?q=' }).nodes['article-search'].value, '', 'q vide explicite efface le champ restauré');
  assert.deepEqual(fixture('Roubaix', -1, { href: baseURL + '?autre=1' }).visible(), ['histoire'], 'q absent préserve une valeur initiale restaurée');

  const debounce = fixture('', -1, { href: baseURL + '?campagne=ete&campagne=automne#catalogue', state });
  debounce.query('pie');
  assert.deepEqual(debounce.visible(), ['sciences'], 'Le résultat change avant l’URL');
  debounce.advance(249);
  assert.equal(debounce.historyAttempts.length, 0);
  debounce.query('l’autorité');
  assert.deepEqual(debounce.visible(), ['sciences-humaines']);
  assert.equal(debounce.timers.size, 1, 'Une seule écriture différée reste planifiée');
  debounce.advance(249);
  assert.equal(debounce.historyAttempts.length, 0, 'Chaque frappe relance le délai de 250 ms');
  debounce.advance(1);
  assert.equal(debounce.historyCalls.length, 1);
  assert.equal(urlOf(debounce).searchParams.get('q'), 'l’autorité', 'Accents et apostrophes sont conservés dans l’URL');
  assert.deepEqual(urlOf(debounce).searchParams.getAll('campagne'), ['ete', 'automne']);
  assert.equal(urlOf(debounce).pathname, '/Thot/bibliotheque.html');
  assert.equal(urlOf(debounce).hash, '#catalogue');
  assert.equal(debounce.historyCalls[0].state, state, 'history.state est transmis sans remplacement');
  assert.equal(debounce.history.state, state);
  debounce.query('l’autorité'); debounce.advance(250);
  assert.equal(debounce.historyCalls.length, 1, 'Une valeur inchangée ne réécrit pas l’URL');
  const reloaded = fixture('', -1, { href: debounce.window.location.href });
  assert.equal(reloaded.nodes['article-search'].value, 'l’autorité');
  assert.deepEqual(reloaded.visible(), ['sciences-humaines'], 'Le rechargement restaure la recherche sérialisée');

  for (const subject of ['inconnu', 'HISTOIRE', 'science']) {
    const invalid = fixture('', -1, { href: baseURL + '?q=pieuvre&sujet=' + subject });
    assert.deepEqual(invalid.visible(), ['sciences']);
    assert.deepEqual(pressed(invalid), ['tous'], `Sujet non proposé ignoré : ${subject}`);
  }
  const noArticles = fixture('', -1, { href: baseURL + '?sujet=insolite' });
  assert.deepEqual(noArticles.visible(), [], 'Une catégorie proposée sans article reste valide');
  assert.deepEqual(pressed(noArticles), ['insolite']);
  for (const button of f.filters) {
    const subject = button.dataset.filter;
    const page = fixture('', -1, { href: baseURL + '?sujet=' + subject });
    assert.deepEqual(pressed(page), [subject], `Restauration du filtre réel : ${subject}`);
  }

  const duplicates = fixture('', -1, { href: baseURL + '?q=Roubaix&q=pieuvre&sujet=histoire&sujet=sciences&tag=a&tag=b#sources' });
  assert.equal(duplicates.nodes['article-search'].value, 'Roubaix', 'Le premier q est retenu en présence de doublons');
  assert.deepEqual(duplicates.visible(), ['histoire']);
  duplicates.filter('tous');
  assert.deepEqual(urlOf(duplicates).searchParams.getAll('q'), ['Roubaix'], 'Une seule valeur q est écrite');
  assert.deepEqual(urlOf(duplicates).searchParams.getAll('sujet'), [], 'Le filtre tous est omis');
  assert.deepEqual(urlOf(duplicates).searchParams.getAll('tag'), ['a', 'b'], 'Les paramètres tiers multiples restent présents');
  assert.equal(urlOf(duplicates).hash, '#sources');

  for (const action of ['filter', 'clear', 'reset']) {
    const page = fixture('', -1, { href: baseURL + '?q=Roubaix&sujet=histoire&origine=accueil#catalogue' });
    page.query('Brontë');
    if (action === 'filter') page.filter('arts');
    else page.nodes[action === 'clear' ? 'clear-search' : 'reset-filters'].emit('click');
    assert.equal(page.timers.size, 0, `${action} annule l’écriture différée`);
    assert.equal(page.historyCalls.length, 1, `${action} écrit immédiatement l’URL`);
    assert.equal(urlOf(page).searchParams.get('q'), action === 'filter' ? 'Brontë' : null);
    assert.equal(urlOf(page).searchParams.get('sujet'), action === 'filter' ? 'arts' : action === 'clear' ? 'histoire' : null);
    assert.equal(urlOf(page).searchParams.get('origine'), 'accueil');
    assert.equal(urlOf(page).hash, '#catalogue');
    page.advance(1000);
    assert.equal(page.historyAttempts.length, 1, 'Aucun ancien timer ne réécrit l’URL après l’action immédiate');
  }

  for (const event of ['change', 'pagehide']) {
    const page = fixture('', -1, { href: baseURL + '?origine=accueil#catalogue', state });
    const target = event === 'change' ? page.nodes['article-search'] : page.window;
    target.emit(event);
    assert.equal(page.historyAttempts.length, 0, `${event} sans saisie en attente ne réécrit rien`);
    page.query('Brontë'); page.advance(249);
    target.emit(event);
    assert.equal(page.timers.size, 0, `${event} termine la temporisation en cours`);
    assert.equal(page.historyCalls.length, 1, `${event} conserve la dernière saisie avant les 250 ms`);
    assert.equal(urlOf(page).searchParams.get('q'), 'Brontë');
    assert.equal(urlOf(page).searchParams.get('origine'), 'accueil');
    assert.equal(urlOf(page).hash, '#catalogue');
    assert.equal(page.historyCalls[0].state, state);
    target.emit(event); page.advance(1000);
    assert.equal(page.historyAttempts.length, 1, `${event} répété sans nouvelle saisie ne réécrit rien`);
  }

  const back = fixture('', -1, { href: baseURL + '?q=Roubaix&sujet=histoire' });
  back.query('pieuvre');
  back.navigate(baseURL + '?q=Bront%C3%AB&sujet=arts#catalogue');
  assert.equal(back.timers.size, 0, 'popstate annule une saisie non encore sérialisée');
  assert.equal(back.nodes['article-search'].value, 'Brontë');
  assert.deepEqual(back.visible(), ['arts']);
  assert.deepEqual(pressed(back), ['arts']);
  back.advance(1000);
  assert.equal(back.historyAttempts.length, 0, 'Le retour arrière ne réécrit pas la destination restaurée');
  back.navigate(baseURL + '?origine=menu');
  assert.equal(back.nodes['article-search'].value, '');
  assert.equal(back.visible().length, 5);
  assert.deepEqual(pressed(back), ['tous'], 'Absence de paramètres : remise à zéro après popstate');
  back.navigate(baseURL + '?q=muscles%20couleur&sujet=sciences');
  assert.deepEqual(back.visible(), ['sciences'], 'Le retour avant restaure à nouveau recherche et catégorie');
  assert.equal(back.historyAttempts.length, 0);

  const latest = fixture();
  latest.query('Roubaix');
  latest.window.location.href = baseURL + '?ajout=recent&ajout=encore#section';
  latest.advance(250);
  assert.deepEqual(urlOf(latest).searchParams.getAll('ajout'), ['recent', 'encore'], 'La temporisation part de l’URL courante au moment d’écrire');
  assert.equal(urlOf(latest).hash, '#section');
  const pageShown = fixture('', -1, { href: baseURL + '?q=Roubaix' });
  pageShown.nodes['article-search'].value = 'Brontë';
  pageShown.window.emit('pageshow');
  assert.deepEqual(pageShown.visible(), ['arts'], 'pageshow conserve le champ restauré par le navigateur');
  assert.equal(pageShown.historyAttempts.length, 0);

  class IncompleteURL { constructor(href) { this.href = href; } }
  for (const options of [{ noURL: true }, { URLImplementation: IncompleteURL }, { noLocation: true }, { noHistory: true }, { historyGetterFails: true }, { historyStateFails: true }, { historyFails: true }]) {
    const page = fixture('', -1, options);
    page.query('Roubaix'); page.advance(250);
    assert.deepEqual(page.visible(), ['histoire'], 'La recherche fonctionne malgré une API URL/historique indisponible ou refusée');
    page.filter('histoire');
    page.nodes['clear-search'].emit('click');
    assert.deepEqual(page.visible(), ['histoire']);
    assert.equal(page.document.activeElement, page.nodes['article-search']);
    page.query('pieuvre');
    page.window.emit('popstate');
    assert.equal(page.timers.size, 0);
    page.nodes['reset-filters'].emit('click');
    assert.equal(page.visible().length, 5);
  }
  console.log('PASS : restauration q/sujet, rechargement/retour arrière, délai 250 ms, actions immédiates, flush change/pagehide, doublons, filtres invalides, conservation paramètres/hash/préfixe/history.state et APIs refusées/incomplètes.');
}

// Tests du tirage réel sur les liens de cette page, indépendamment des filtres.
const discoveryCode = await readFile(resolve(root, 'assets/decouverte.js'), 'utf8');
const articleLinks = tags.filter(tag => Object.hasOwn(tag, 'data-discovery-path'));
for (const storageFails of [false, true]) {
  let last; const destinations = []; const surprise = new Node();
  const document = {
    baseURI: 'https://thot-culture.github.io/Thot/bibliotheque.html',
    querySelectorAll: selector => selector === 'a[data-discovery-path]'
      ? articleLinks.map(tag => ({ getAttribute: () => tag.href })) : [surprise]
  };
  const window = { location: { href: document.baseURI, origin: 'https://thot-culture.github.io', assign: path => destinations.push(path) } };
  const sessionStorage = {
    getItem: () => { if (storageFails) throw Error('Refusé'); return last; },
    setItem: (key, value) => { if (storageFails) throw Error('Refusé'); last = value; }
  };
  vm.runInNewContext(discoveryCode, { document, window, sessionStorage, URL, Math: { random: () => 0, floor: Math.floor } });
  const click = changes => surprise.emit('click', { button: 0, preventDefault() {}, ...changes });
  click(); click();
  assert.equal(destinations.length, 2);
  assert.ok(destinations.every(path => articleLinks.some(tag => '/Thot/' + tag.href === path)));
  if (!storageFails) assert.notEqual(destinations[0], destinations[1]);
  for (const changes of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) click(changes);
  assert.equal(destinations.length, 2, 'Les clics natifs sont préservés');
}
assert.equal(new Set(articleLinks.map(tag => tag.href)).size, 5);
console.log('PASS : les 5 articles restent dans le catalogue surprise ; stockage refusé et clics natifs préservés.');

const ids = tags.filter(tag => tag.id).map(tag => tag.id);
assert.equal(new Set(ids).size, ids.length);
assert.equal(tags.find(tag => tag.tag === 'html').lang, 'fr');
assert.equal(tags.filter(tag => tag.tag === 'h1').length, 1);
assert.equal(tags.filter(tag => tag.tag === 'main').length, 1);
assert.equal(tags.find(tag => tag.id === 'contenu').tabindex, '-1');
assert.ok(tags.some(tag => tag.tag === 'meta' && tag.name === 'description' && tag.content));
assert.ok(tags.some(tag => tag.tag === 'meta' && tag.name === 'viewport' && tag.content.includes('width=device-width')));
const base = new URL(tags.find(tag => tag.rel === 'canonical').href);
assert.equal(base.href, 'https://thot-culture.github.io/Thot/bibliotheque.html');
assert.equal(tags.find(tag => tag.property === 'og:url').content, base.href);
const site = new URL('./', base);
let internal = 0, scripts = 0, externalImages = 0;
for (const tag of tags) {
  for (const key of ['href', 'src']) {
    if (!tag[key]) continue;
    const url = new URL(tag[key], base);
    if (url.origin !== site.origin) continue;
    assert.ok(url.pathname.startsWith(site.pathname), `Lien hors /Thot/ : ${tag[key]}`);
    const path = decodeURIComponent(url.pathname.slice(site.pathname.length)) || 'index.html';
    await access(resolve(root, path)); internal++;
    if (url.hash && path.endsWith('.html')) {
      const target = await readFile(resolve(root, path), 'utf8');
      const targetIds = [...target.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
      assert.ok(targetIds.includes(decodeURIComponent(url.hash.slice(1))), `Ancre manquante : ${tag[key]}`);
    }
  }
  for (const key of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
    for (const id of (tag[key] || '').split(/\s+/).filter(Boolean)) assert.ok(ids.includes(id), `${key} : ${id}`);
  }
  if (tag.tag === 'a' && tag.target === '_blank') assert.ok(tag.rel?.includes('noopener'));
  if (tag.tag === 'img') {
    assert.ok(tag.alt && Number(tag.width) > 0 && Number(tag.height) > 0);
    if (new URL(tag.src, base).origin !== site.origin) externalImages++;
  }
  if (tag.tag === 'script' && tag.src) {
    new vm.Script(await readFile(resolve(root, tag.src.split('?')[0]), 'utf8'), { filename: tag.src }); scripts++;
  }
}
assert.ok(Object.hasOwn(tags.find(tag => tag.id === 'library-search'), 'hidden'));
assert.match(html, /<noscript>[\s\S]*Tous les articles restent accessibles/);
assert.equal(tags.filter(tag => tag.role === 'status').length, 1, 'Un seul statut pour annoncer le résultat');
console.log(`PASS : ${internal} liens/ressources internes, ${scripts} scripts, IDs, ARIA, métadonnées, 5 images décrites et dimensionnées ; catalogue statique accessible sans JS.`);
console.log(`NON VÉRIFIÉ : rendu ordinateur/mobile, CSS calculé, lecteur d’écran, HTTP des liens et de l’image externe (${externalImages}), performances réelles.`);
