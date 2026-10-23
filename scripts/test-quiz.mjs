#!/usr/bin/env node
// HTML et moteur réels, exécutés dans un DOM simulé, sans navigateur.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const source = name => readFileSync(new URL(name, root), 'utf8');
const html = source('quiz.html');
const engineIndex = process.argv.indexOf('--engine');
const engine = engineIndex < 0 ? source('assets/site.js') : readFileSync(process.argv[engineIndex + 1], 'utf8');
const storageKey = 'thot_v2_stats';
const attrs = markup => Object.fromEntries([...markup.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)].map(m => [m[1], m[2] ?? m[3] ?? m[4] ?? '']));
const tags = [...html.matchAll(/<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)].map(m => ({ tag: m[1], attrs: attrs(m[2]) }));
function makePage(storage = new Map(), options = {}) {
  const nodes = new Map(), all = [], documentEvents = new Map(), windowEvents = new Map(), timers = new Map();
  let activeElement, clock = Date.parse(options.now || '2026-10-23T12:00:00Z'), nextTimer = 1;
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [clock])); }
    static now() { return clock; }
  }
  class Node {
    constructor(tag = 'div', attributes = {}) {
      this.tag = tag; this.children = []; this.attributes = new Map(Object.entries(attributes));
      this.id = attributes.id; this.className = attributes.class || ''; this.textContent = '';
      this.disabled = Object.hasOwn(attributes, 'disabled'); this.style = {}; this.events = new Map();
      this.dataset = Object.fromEntries(Object.entries(attributes).filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), value]));
      this.classList = {
        contains: name => this.className.split(/\s+/).includes(name),
        add: name => this.classList.toggle(name, true), remove: name => this.classList.toggle(name, false),
        toggle: (name, force) => {
          const set = new Set(this.className.split(/\s+/).filter(Boolean)); const enabled = force ?? !set.has(name);
          if (enabled) set.add(name); else set.delete(name); this.className = [...set].join(' '); return enabled;
        }
      };
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    removeAttribute(name) { this.attributes.delete(name); }
    append(...children) { this.children.push(...children); for (const child of children) child.parent = this; }
    replaceChildren(...children) { this.children = []; this.append(...children); }
    addEventListener(name, callback) { this.events.set(name, callback); }
    querySelectorAll(selector) { return this.children.filter(child => child.tag === selector); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    closest(selector) { return selector === '.top' ? header : null; }
    contains(node) { return this === node || this.children.some(child => child.contains(node)); }
    focus() { activeElement = this; }
    scrollIntoView(options) { this.scrollOptions = options; }
  }
  for (const tag of tags) { const node = new Node(tag.tag, tag.attrs); all.push(node); if (node.id) nodes.set(node.id, node); }
  const get = id => nodes.get(id) || null;
  const header = new Node('header', { class: 'top' }), nav = get('primary-navigation');
  header.append(get('mobile-menu-button'), nav);
  for (let index = 0; index < 5; index++) nav.append(new Node('a'));
  const media = new Node(); media.matches = Boolean(options.mobile);
  const localStorage = {
    getItem(key) { if (options.blocked) throw Error('Storage unavailable'); return storage.get(key) ?? null; },
    setItem(key, value) { if (options.blocked || options.writeBlocked) throw Error('Storage full'); storage.set(key, value); }
  };
  const document = {
    getElementById: get, createElement: tag => new Node(tag), hidden: false,
    get activeElement() { return activeElement; },
    querySelectorAll: selector => selector === '.answer' ? get('answer-list').children : all.filter(node => node.attributes.has(selector.slice(1, -1))),
    addEventListener: (name, callback) => documentEvents.set(name, callback)
  };
  const context = vm.createContext({
    console, Date: ClockDate, localStorage, document,
    window: { addEventListener: (name, callback) => windowEvents.set(name, callback), matchMedia: query => query.includes('reduced-motion') ? { matches: Boolean(options.reducedMotion) } : media },
    setTimeout: (callback, delay) => { const id = nextTimer++; timers.set(id, { callback, at: clock + delay }); return id; },
    clearTimeout: id => timers.delete(id), alert: message => { throw Error(message); }
  });
  for (const name of ['facile', 'intermediaire', 'expert']) if (name !== options.missingBank) vm.runInContext(source(`assets/questions-${name}.js`), context);
  let startupError;
  try { vm.runInContext(engine, context); } catch (error) { if (!options.missingBank) throw error; startupError = error; }
  const run = expression => vm.runInContext(expression, context);
  const json = expression => JSON.parse(run(`JSON.stringify(${expression})`));
  const click = target => { const node = typeof target === 'string' ? get(target) : target; assert.ok(node); if (!node.disabled) node.events.get('click')?.(); };
  const answer = (correct = true) => {
    const expected = json('correctIndexes(round[index])');
    const picks = correct ? expected : [run('round[index].a.findIndex((_, i) => !correctIndexes(round[index]).includes(i))')];
    for (const pick of picks) click(get('answer-list').children.find(button => Number(button.dataset.idx) === pick));
    if (run('questionType(round[index])') === 'multi_select') click('validate-button');
  };
  const complete = (wrong = []) => { for (let index = 0; index < 5; index++) { answer(!wrong.includes(index)); click('next-button'); } };
  const advance = iso => { clock = Date.parse(iso); for (const [id, timer] of [...timers]) if (timer.at <= clock) { timers.delete(id); timer.callback(); } };
  return { run, json, get, all, click, answer, complete, advance, media, header, document, documentEvents, windowEvents, localStorage, startupError, timers, active: () => activeElement };
}
// Migration intégrale : l'historique quotidien ne doit pas être écrasé.
{
  const daily = { lastCompleted: '2026-10-22', lastScore: 4, streak: 3, day: '2026-10-22', games: 2, correct: 8, claimed: ['daily', 'three', 'two'] };
  const storage = new Map([[storageKey, JSON.stringify({ games: 2, correct: 8, answered: 10, daily })]]);
  const page = makePage(storage), migrated = JSON.parse(storage.get(storageKey));
  for (const [key, value] of Object.entries(daily)) assert.deepEqual(migrated.daily[key], value, 'Migration quotidienne : ' + key);
  assert.equal(page.run('stats.progression.xp'), 90);
  assert.equal(makePage(storage).run('stats.daily.streak'), 3);
  assert.equal(page.run("stats.daily.completed['2026-10-22']"), 4);
}
// Intégrité du catalogue et parties sur les 18 combinaisons proposées.
{
  const page = makePage();
  assert.equal(page.run('questions.length'), 300);
  assert.equal(page.run('new Set(questions.map(item => item.q)).size'), 300);
  assert.equal(page.run(`questions.every(item => ['histoire','geographie','sciences','arts','insolite'].includes(item.cat) && ['facile','intermediaire','expert'].includes(item.level) && Array.isArray(item.a) && item.a.length >= 2 && item.a.length <= 4 && item.a.every(value => typeof value === 'string' && value.trim()) && new Set(item.a).size === item.a.length && item.why.trim() && correctIndexes(item).length > 0 && new Set(correctIndexes(item)).size === correctIndexes(item).length && correctIndexes(item).every(index => Number.isInteger(index) && index >= 0 && index < item.a.length))`), true);
  for (const category of ['mix', 'histoire', 'geographie', 'sciences', 'arts', 'insolite']) for (const level of ['facile', 'intermediaire', 'expert']) {
    if (category !== 'mix') assert.equal(page.run(`questions.filter(item => item.cat === '${category}' && item.level === '${level}').length`), 20);
    page.click(page.all.find(node => node.dataset.quizTheme === category)); page.click(page.all.find(node => node.dataset.level === level)); page.click('start-button');
    assert.equal(page.run('round.length'), 5); assert.equal(page.run('new Set(round.map(q => q.q)).size'), 5);
    assert.equal(page.run(`round.every(q => q.level === '${level}' && ('${category}' === 'mix' || q.cat === '${category}'))`), true);
    assert.equal(page.active(), page.get('question-text'));
    page.complete([1, 3]); assert.equal(page.get('final-score').textContent, '3/5'); assert.equal(page.get('review-list').children.length, 2);
    page.click('review-button'); assert.equal(page.get('review-panel').classList.contains('hidden'), false); assert.equal(page.active(), page.get('review-heading'));
    page.click('change-button');
  }
  assert.equal(page.run('stats.games'), 18); assert.equal(page.run('stats.answered'), 90);
}
// Trois formats, indice, validation multiple et protection contre les doubles clics.
{
  const page = makePage(), seen = new Set(); let previous;
  page.click(page.all.find(node => node.dataset.quizTheme === 'histoire'));
  for (let round = 0; round < 5; round++) {
    page.click(round === 0 ? 'start-button' : 'replay-button'); const questions = page.json('round.map(q => q.q)');
    if (round < 4) for (const question of questions) { assert.ok(!seen.has(question)); seen.add(question); }
    else assert.ok(questions.every(question => !previous.includes(question)), 'Pas de répétition immédiate après le cycle');
    previous = questions; page.complete();
  }
  assert.equal(seen.size, 20);
}
{
  const page = makePage();
  for (const type of ['single_select', 'true_false', 'multi_select']) {
    page.run(`round=[questions.find(q => questionType(q) === '${type}')]; index=0; score=0; attempts=[]; roundFinished=false; renderQuestion();`);
    page.click('hint-button'); assert.equal(page.get('hint-panel').classList.contains('hidden'), false);
    if (type === 'multi_select') assert.equal(page.get('validate-button').disabled, true);
    page.answer(); assert.equal(page.run('score'), 1);
    page.run('submitAnswer(correctIndexes(round[index]))'); assert.equal(page.run('score'), 1);
    assert.equal(page.get('hint-panel').classList.contains('hidden'), true); assert.equal(page.active(), page.get('next-button'));
    assert.equal(page.get('progressbar').getAttribute('aria-valuenow'), '1');
  }
}
// Deux parties ouvertes ensemble cumulent leurs résultats.
{
  const page = makePage(); page.run('stats.progression.xp=900;refreshProgression()');
  assert.equal(page.get('xp-fill').style.width, '100.0%');
  assert.equal(page.get('xp-progress').getAttribute('aria-valuemin'), '0');
  assert.equal(page.get('xp-progress').getAttribute('aria-valuemax'), '900');
  assert.equal(page.get('xp-progress').getAttribute('aria-valuenow'), '900');
}
{
  const storage = new Map(), first = makePage(storage), second = makePage(storage);
  first.click('start-button'); second.click('start-button'); first.complete(); second.complete();
  assert.equal(JSON.parse(storage.get(storageKey)).games, 2); assert.equal(JSON.parse(storage.get(storageKey)).answered, 10);
}
// Défi commun, récompense unique, badge et renouvellement à minuit UTC.
{
  const storage = new Map(), first = makePage(storage), second = makePage(storage);
  first.click('daily-start-button'); second.click('daily-start-button');
  assert.deepEqual(first.json('round.map(q => q.q)'), second.json('round.map(q => q.q)')); assert.equal(first.run('new Set(round.map(q => q.cat)).size'), 5);
  first.complete(); const earned = JSON.parse(storage.get(storageKey)); second.complete([0]);
  assert.deepEqual(JSON.parse(storage.get(storageKey)), earned); assert.equal(second.get('screen-result').classList.contains('hidden'), false);
  assert.match(second.get('daily-result').textContent, /autre onglet/); assert.match(second.get('xp-earned').textContent, /\+0 XP/);
  assert.equal(second.run('Object.keys(stats.bests).length'), 0); assert.equal(first.run("unlockedBadgeIds().includes('sansfaute')"), true);
  assert.equal(first.get('daily-start-button').disabled, true);
  first.advance('2026-10-24T00:00:00.200Z'); assert.equal(first.get('daily-start-button').disabled, false, 'Nouveau défi sans rechargement');
  first.click('daily-start-button'); first.complete([0]);
  assert.equal(first.run("unlockedBadgeIds().includes('sansfaute')"), true, 'Badge conservé'); assert.equal(first.run('stats.daily.streak'), 2); assert.equal(first.timers.size, 1);
  second.windowEvents.get('storage')({ storageArea: second.localStorage, key: storageKey, newValue: storage.get(storageKey) }); assert.equal(second.get('stat-games').textContent, '2');
}
// Barème public : XP, missions attribuées une seule fois et records conservés.
{
  const page = makePage(); page.click('daily-start-button'); page.complete();
  assert.equal(page.run('stats.progression.xp'), 85);
  page.click('replay-button'); page.complete(); assert.equal(page.run('stats.progression.xp'), 160);
  assert.match(page.get('xp-level').textContent, /Explorateur/);
  page.click('replay-button'); page.complete([0, 1, 2, 3, 4]);
  assert.equal(page.run('stats.progression.xp'), 165);
  assert.equal(page.run("stats.bests['mix|facile']"), 5);
  assert.equal(page.run('new Set(stats.daily.claimed).size'), 3);
  assert.equal(page.get('stat-accuracy').textContent, '67 %');
}
// Un ancien défi achevé après minuit n'est récompensé qu'une fois.
{
  const storage = new Map(), first = makePage(storage), second = makePage(storage);
  first.click('daily-start-button'); second.click('daily-start-button'); first.advance('2026-10-24T00:00:00.200Z'); second.advance('2026-10-24T00:00:00.200Z');
  first.complete(); const earned = JSON.parse(storage.get(storageKey)); second.complete(); assert.deepEqual(JSON.parse(storage.get(storageKey)), earned);
  assert.equal(first.get('daily-start-button').disabled, false); assert.equal(first.run("stats.daily.completed['2026-10-23']"), 5);
  first.click('daily-start-button'); first.complete(); assert.equal(first.run('stats.daily.streak'), 2);
}
// Fin tardive de l’ancien défi après celui du jour : conserver le résultat le plus récent.
{
  const storage = new Map(), late = makePage(storage), current = makePage(storage);
  late.click('daily-start-button');
  current.advance('2026-10-24T00:00:00.200Z'); current.click('daily-start-button'); current.complete([0]);
  late.advance('2026-10-24T00:00:00.200Z'); late.complete();
  const saved = JSON.parse(storage.get(storageKey));
  assert.equal(saved.daily.lastCompleted, '2026-10-24'); assert.equal(saved.daily.lastScore, 4);
  assert.equal(saved.daily.completed['2026-10-23'], 5); assert.equal(saved.daily.completed['2026-10-24'], 4);
  assert.equal(saved.games, 2);
}
// Stockage bloqué en lecture ou seulement en écriture : garder la session.
for (const options of [{ blocked: true }, { writeBlocked: true }]) {
  const persisted = { games: 2, correct: 3, answered: 10, progression: { xp: 40, byCategory: {}, bestStreak: 1 } };
  const storage = new Map([[storageKey, JSON.stringify(persisted)]]), page = makePage(storage, options);
  page.click('start-button'); page.complete(); const games = page.run('stats.games'); page.click('replay-button'); page.complete();
  assert.equal(page.run('stats.games'), games + 1); assert.equal(page.get('storage-status').classList.contains('hidden'), false); assert.equal(JSON.parse(storage.get(storageKey)).games, 2);
  assert.equal(page.get('stats-note').classList.contains('hidden'), true);
}
{
  const page = makePage(new Map([[storageKey, '{invalid json']])); page.click('start-button'); page.complete(); assert.equal(page.run('stats.games'), 1);
}
{
  const storage = new Map(), page = makePage(storage); page.click('start-button'); page.complete();
  storage.clear(); page.windowEvents.get('storage')({ storageArea: page.localStorage, key: null, newValue: null });
  assert.equal(page.get('stat-games').textContent, '0'); assert.equal(page.run('stats.progression.xp'), 0);
  page.windowEvents.get('pageshow')(); page.documentEvents.get('visibilitychange')(); assert.equal(page.timers.size, 1);
}
// Menu, focus et chargement incomplet : les commandes ne doivent pas être actives.
{
  const page = makePage(new Map(), { mobile: true }); page.click('mobile-menu-button'); assert.equal(page.get('mobile-menu-button').getAttribute('aria-expanded'), 'true');
  page.documentEvents.get('keydown')({ key: 'Escape' }); assert.equal(page.active(), page.get('mobile-menu-button'));
  page.click('mobile-menu-button'); page.documentEvents.get('click')({ target: page.get('question-text') }); assert.equal(page.get('mobile-menu-button').getAttribute('aria-expanded'), 'false');
  page.get('primary-navigation').children[0].focus(); page.media.events.get('change')(); assert.equal(page.active(), page.get('mobile-menu-button'));
  assert.equal(page.get('quiz-load-status').classList.contains('hidden'), true);
  const unavailable = makePage(new Map(), { missingBank: 'expert' }); assert.ok(unavailable.startupError);
  assert.equal(unavailable.get('start-button').disabled, true); assert.equal(unavailable.get('daily-start-button').disabled, true);
  assert.equal(unavailable.get('quiz-load-status').classList.contains('hidden'), false); assert.match(unavailable.get('quiz-load-message').textContent, /chargées/);
}
{
  const page = makePage(new Map(), { reducedMotion: true });
  page.click(page.all.find(node => node.dataset.category === 'sciences'));
  assert.equal(page.get('quiz-classique').scrollOptions.behavior, 'auto');
  page.click('start-button'); assert.equal(page.get('question-text').scrollOptions.block, 'nearest');
}
console.log('PASS : 300 questions, 18 parcours, 3 formats, indice, corrections, sauvegarde, migration, onglets, UTC/minuit, badges, focus/menu et chargement incomplet.');
console.log('DOM et horloge simulés : le rendu dans un navigateur reste à vérifier.');
