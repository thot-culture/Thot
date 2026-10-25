#!/usr/bin/env node
// Vérifications du site statique, sans dépendance ni accès réseau.
import { readdir, readFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const rootIndex = process.argv.indexOf('--root');
const root = rootIndex < 0 ? resolve(dirname(fileURLToPath(import.meta.url)), '..')
  : resolve(process.argv[rootIndex + 1] || '.');
const failures = [];
const report = (file, message) => failures.push(`${file} : ${message}`);
const decode = value => value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
  const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
  const code = entity[2].toLowerCase() === 'x'
    ? parseInt(entity.slice(3, -1), 16) : parseInt(entity.slice(2, -1), 10);
  return Number.isInteger(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
});

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries
    .filter(entry => !['.git', 'node_modules'].includes(entry.name))
    .map(entry => entry.isDirectory() ? walk(resolve(directory, entry.name)) : resolve(directory, entry.name)));
  return nested.flat();
}

const files = await walk(root);
const paths = new Set(files.map(file => relative(root, file).replaceAll('\\', '/')));
const textFiles = files.filter(file => ['.html', '.css', '.js', '.json', '.xml', '.svg'].includes(extname(file)));
const contents = new Map(await Promise.all(textFiles.map(async file => [
  relative(root, file).replaceAll('\\', '/'), await readFile(file, 'utf8')
])));

function attributes(source) {
  const attrs = new Map();
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    attrs.set(match[1].toLowerCase(), decode(match[2] ?? match[3] ?? match[4] ?? ''));
  }
  return attrs;
}

// Les scripts et commentaires sont retirés avant de lire les balises : leur
// contenu peut inclure des comparaisons ou exemples ressemblant à du HTML.
const pages = new Map();
for (const [file, text] of contents) {
  if (!['.html', '.svg'].includes(extname(file))) continue;
  const tags = [];
  const markup = text.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  const pattern = /<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi;
  const ids = new Set();
  for (const match of markup.matchAll(pattern)) {
    const attrs = attributes(match[2]);
    const id = attrs.get('id');
    if (id) {
      if (ids.has(id)) report(file, `identifiant dupliqué « ${id} »`);
      ids.add(id);
    }
    tags.push({ name: match[1].toLowerCase(), attrs });
  }
  // Les scripts externes ont aussi besoin d'une vérification de leur src.
  for (const match of text.matchAll(/<script\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)) {
    tags.push({ name: 'script', attrs: attributes(match[1]) });
  }
  pages.set(file, { ids, tags });
}

const canonical = pages.get('index.html')?.tags.find(tag => tag.name === 'link' && tag.attrs.get('rel') === 'canonical');
if (!canonical) throw new Error('La page d’accueil doit déclarer son URL canonique.');
const base = new URL(canonical.attrs.get('href'));
const prefix = base.pathname.endsWith('/') ? base.pathname : `${base.pathname}/`;
let links = 0;
function checkURL(file, value) {
  if (!value || /^(?:mailto:|tel:|data:|blob:)/i.test(value)) return;
  let url;
  try { url = new URL(value, new URL(file, base)); }
  catch { report(file, `URL invalide « ${value} »`); return; }
  if (url.origin !== base.origin) return;
  links++;
  if (!url.pathname.startsWith(prefix)) {
    report(file, `la cible sort du chemin de publication ${prefix} : ${value}`);
    return;
  }
  let target;
  try { target = decodeURIComponent(url.pathname.slice(prefix.length)); }
  catch { report(file, `chemin encodé invalide « ${value} »`); return; }
  if (!target || target.endsWith('/')) target += 'index.html';
  if (!paths.has(target)) {
    report(file, `cible locale absente « ${value} » (${target})`);
    return;
  }
  if (url.hash.length > 1 && pages.has(target)) {
    let fragment;
    try { fragment = decodeURIComponent(url.hash.slice(1)); }
    catch { report(file, `ancre encodée invalide « ${value} »`); return; }
    if (!fragment.startsWith(':~:text=') && !pages.get(target).ids.has(fragment)) {
      report(file, `ancre absente « ${value} »`);
    }
  }
}

for (const [file, page] of pages) {
  for (const { name: tag, attrs } of page.tags) {
    for (const name of ['href', 'src', 'poster', 'action', 'formaction']) {
      if (attrs.has(name)) checkURL(file, attrs.get(name));
    }
    for (const name of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
      for (const id of (attrs.get(name) || '').split(/\s+/).filter(Boolean)) {
        if (!page.ids.has(id)) report(file, `${name} référence un identifiant absent « ${id} »`);
      }
    }
    if (tag === 'img' && !attrs.has('alt')) report(file, 'image sans attribut alt');
    if (tag === 'a' && attrs.get('target') === '_blank' && !(attrs.get('rel') || '').split(/\s+/).includes('noopener')) {
      report(file, 'lien nouvel onglet sans noopener');
    }
    if (tag === 'meta' && ['og:image', 'twitter:image'].includes(attrs.get('property') || attrs.get('name'))) {
      checkURL(file, attrs.get('content'));
    }
  }
  if (!file.endsWith('.html')) continue;
  const head = contents.get(file).match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i)?.[1] || '';
  if ([...head.matchAll(/<title\b[^>]*>[^<]+<\/title\s*>/gi)].length !== 1) report(file, 'un seul titre HTML non vide attendu dans head');
  if (page.tags.filter(tag => tag.name === 'h1').length !== 1) report(file, 'un seul H1 attendu');
  if (page.tags.filter(tag => tag.name === 'main').length !== 1) report(file, 'un seul contenu principal attendu');
  if (!page.tags.some(tag => tag.name === 'html' && tag.attrs.get('lang') === 'fr')) report(file, 'langue française absente');
  const meta = new Map(page.tags.filter(tag => tag.name === 'meta').map(tag => [tag.attrs.get('name') || tag.attrs.get('property'), tag.attrs.get('content')]));
  if (!meta.get('description')?.trim()) report(file, 'description SEO absente');
  if (!meta.get('viewport')?.includes('width=device-width')) report(file, 'viewport responsive absent');
  if (file === '404.html') {
    if (meta.get('robots') !== 'noindex') report(file, 'La page d’erreur doit déclarer noindex');
    continue;
  }
  const canonicalLinks = page.tags.filter(tag => tag.name === 'link' && (tag.attrs.get('rel') || '').split(/\s+/).includes('canonical'));
  const expectedCanonical = file === 'index.html' ? base.href : new URL(file, base).href;
  if (canonicalLinks.length !== 1 || canonicalLinks[0].attrs.get('href') !== expectedCanonical) report(file, 'URL canonique absente ou incohérente');
  if (meta.get('og:url') !== expectedCanonical) report(file, 'URL Open Graph incohérente');
}

const scriptOwners = new Map();
for (const [file, page] of pages) {
  if (!file.endsWith('.html')) continue;
  for (const tag of page.tags.filter(tag => tag.name === 'script' && tag.attrs.has('src'))) {
    let url;
    try { url = new URL(tag.attrs.get('src'), new URL(file, base)); }
    catch { continue; } // L’URL invalide a déjà été signalée par checkURL.
    if (url.origin !== base.origin || !url.pathname.startsWith(prefix)) continue;
    let script;
    try { script = decodeURIComponent(url.pathname.slice(prefix.length)); }
    catch { continue; }
    if (!scriptOwners.has(script)) scriptOwners.set(script, new Set());
    scriptOwners.get(script).add(file);
  }
}
let scripts = 0, jsonLD = 0;
for (const [file, text] of contents) {
  if (file.endsWith('.js')) {
    try { new vm.Script(text, { filename: file }); scripts++; }
    catch (error) { report(file, error.message); }
    for (const match of text.matchAll(/\bhref:\s*(['"])(.*?)\1/g)) {
      for (const owner of scriptOwners.get(file) || []) checkURL(owner, match[2]);
    }
  }
  if (file.endsWith('.html')) {
    let position = 0;
    for (const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
      position++;
      const attrs = attributes(match[1]);
      if (attrs.has('src')) continue;
      try {
        if (attrs.get('type') === 'application/ld+json') { JSON.parse(match[2]); jsonLD++; }
        else { new vm.Script(match[2], { filename: `${file}, script ${position}` }); scripts++; }
      } catch (error) { report(file, `script ${position} : ${error.message}`); }
    }
  }
  if (file.endsWith('.css')) {
    for (const match of text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) {
      checkURL(file, match[2]);
    }
  }
  if (file.endsWith('.json')) {
    try { JSON.parse(text); }
    catch (error) { report(file, `JSON invalide : ${error.message}`); }
  }
}

let catalogue = {};
try {
  catalogue = JSON.parse(contents.get('assets/illustrations.json'));
  if (!catalogue || typeof catalogue !== 'object' || Array.isArray(catalogue)) throw new Error('objet attendu');
} catch (error) { catalogue = {}; report('assets/illustrations.json', `catalogue invalide : ${error.message}`); }
for (const [file, page] of pages) {
  for (const { attrs } of page.tags) {
    if (attrs.has('data-thot-image') && !catalogue[attrs.get('data-thot-image')]) {
      report(file, `illustration absente du catalogue « ${attrs.get('data-thot-image')} »`);
    }
  }
}
for (const [key, record] of Object.entries(catalogue)) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    report('assets/illustrations.json', `${key} : notice invalide`);
    continue;
  }
  for (const field of ['url', 'sourceUrl', 'alt', 'caption', 'licence', 'licenceUrl']) {
    if (typeof record[field] !== 'string' || !record[field].trim()) report('assets/illustrations.json', `${key}.${field} absent`);
  }
  checkURL('assets/illustrations.json', record.url);
}

const sitemap = contents.get('sitemap.xml');
if (!sitemap) report('sitemap.xml', 'fichier absent ou vide');
else {
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => decode(match[1]));
  for (const url of listed) checkURL('sitemap.xml', url);
  for (const file of pages.keys()) {
    if (!file.endsWith('.html')) continue;
    const expected = file === 'index.html' ? base.href : new URL(file, base).href;
    if (file === '404.html') {
      if (listed.includes(expected)) report('sitemap.xml', 'La page 404 doit rester hors du sitemap');
      continue;
    }
    if (!listed.includes(expected)) report('sitemap.xml', `page absente : ${file}`);
  }
}

let questions = [];
try {
  const context = vm.createContext({ window: {} });
  for (const level of ['facile', 'intermediaire', 'expert']) {
    vm.runInContext(contents.get(`assets/questions-${level}.js`), context, { timeout: 1000 });
  }
  const source = contents.get('assets/site.js');
  const boundary = source.indexOf("document.getElementById('quiz-total')");
  if (boundary < 0) throw new Error('Point de lecture de la banque de questions introuvable.');
  vm.runInContext(`${source.slice(0, boundary)};globalThis.bank = questions;`, context, { timeout: 1000 });
  questions = context.bank;
  if (!Array.isArray(questions)) throw new Error('La banque doit être un tableau.');
  if (questions.length !== 300) report('Banque de questions', `300 questions attendues, ${questions.length} présentes`);
  const categories = ['histoire', 'geographie', 'sciences', 'arts', 'insolite'];
  const levels = ['facile', 'intermediaire', 'expert'];
  const seen = new Set();
  for (const [index, question] of questions.entries()) {
    const label = `question ${index + 1}`;
    const fail = message => report('Banque de questions', `${label} : ${message}`);
    for (const field of ['q', 'why']) {
      if (typeof question[field] !== 'string' || !question[field].trim()) fail(`${field} absent`);
    }
    if (!categories.includes(question.cat)) fail('catégorie inconnue');
    if (!levels.includes(question.level)) fail('niveau inconnu');
    if (!['single_select', 'true_false', 'multi_select'].includes(question.type || 'single_select')) fail('format inconnu');
    if (!Array.isArray(question.a) || question.a.length < 2 || question.a.length > 4 || question.a.some(a => typeof a !== 'string' || !a.trim())) {
      fail('propositions invalides');
      continue;
    }
    if (new Set(question.a).size !== question.a.length) fail('propositions dupliquées');
    const correct = Array.isArray(question.correct) ? question.correct : [question.correct];
    if (!correct.length || new Set(correct).size !== correct.length || correct.some(i => !Number.isInteger(i) || i < 0 || i >= question.a.length)) {
      fail('index de bonne réponse invalide');
    }
    if (question.type === 'multi_select' && !Array.isArray(question.correct)) fail('réponses multiples attendues');
    if (question.type !== 'multi_select' && correct.length !== 1) fail('une seule bonne réponse attendue');
    if (question.type === 'true_false' && (question.a.length !== 2 || !question.a.includes('Vrai') || !question.a.includes('Faux'))) fail('vrai/faux invalide');
    if (seen.has(question.q)) fail('énoncé dupliqué');
    seen.add(question.q);
  }
  for (const cat of categories) {
    for (const level of levels) {
      if (questions.filter(q => q.cat === cat && q.level === level).length !== 20) {
        report('Banque de questions', `20 questions attendues pour ${cat}/${level}`);
      }
    }
  }
} catch (error) { report('Banque de questions', error.message); }

if (failures.length) {
  console.error(failures.map(message => `✗ ${message}`).join('\n'));
  console.error(`${failures.length} erreur(s).`);
  process.exitCode = 1;
} else {
  console.log(`✓ ${[...pages.keys()].filter(file => file.endsWith('.html')).length} pages, ${links} liens et ressources internes, ${scripts} scripts, ${jsonLD} JSON-LD et ${questions.length} questions vérifiés.`);
  console.log('Contrôles statiques uniquement : rendu, lecteurs d’écran, HTTP externe et performances réelles non vérifiés.');
}
