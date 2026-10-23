#!/usr/bin/env node
// Contrôles statiques de l’accueil et de ses cibles, sans dépendance ni réseau.
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const attrs = source => Object.fromEntries([...source.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)]
  .map(m => [m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? '']));
const tags = [...html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<([a-z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)]
  .map(m => ({ tagName: m[1].toLowerCase(), ...attrs(m[2]) }));
const ids = tags.filter(t => t.id).map(t => t.id);
assert.equal(new Set(ids).size, ids.length, 'Identifiants HTML dupliqués');
assert.equal(tags.find(t => t.tagName === 'html').lang, 'fr');
assert.equal(tags.filter(t => t.tagName === 'h1').length, 1);
assert.equal(tags.filter(t => t.tagName === 'main').length, 1);
assert.match(html, /<title>[^<]+<\/title>/);
assert.ok(tags.some(t => t.tagName === 'meta' && t.content && t.property === 'og:title'));
assert.ok(tags.some(t => t.tagName === 'meta' && t.name === 'description' && t.content));
assert.ok(tags.some(t => t.tagName === 'meta' && t.name === 'viewport' && t.content.includes('width=device-width')));
const canonical = tags.find(t => t.rel === 'canonical');
const base = new URL(canonical.href);
assert.equal(base.href, 'https://thot-culture.github.io/Thot/');
assert.equal(tags.find(t => t.property === 'og:url').content, base.href);

let internal = 0, scripts = 0;
const externalImages = [];
const pages = new Map([['index.html', html]]);
async function checkURL(value) {
  const url = new URL(value.replaceAll('&amp;', '&'), base);
  if (url.origin !== base.origin) return;
  assert.ok(url.pathname.startsWith(base.pathname), `URL hors du sous-chemin GitHub Pages : ${value}`);
  let target = decodeURIComponent(url.pathname.slice(base.pathname.length));
  if (!target || target.endsWith('/')) target += 'index.html';
  await access(resolve(root, target));
  if (url.hash && target.endsWith('.html')) {
    if (!pages.has(target)) pages.set(target, await readFile(resolve(root, target), 'utf8'));
    const targetIds = [...pages.get(target).matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(m => m[1]);
    assert.ok(targetIds.includes(decodeURIComponent(url.hash.slice(1))), `Ancre absente : ${value}`);
  }
  internal++;
}
for (const tag of tags) {
  for (const key of ['href', 'src', 'action', 'formaction']) if (tag[key]) await checkURL(tag[key]);
  for (const attr of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
    for (const id of (tag[attr] || '').split(/\s+/).filter(Boolean)) {
      assert.ok(ids.includes(id), `${attr} vise un identifiant absent : ${id}`);
    }
  }
  if (tag.tagName === 'img') {
    assert.ok(tag.alt, `Image sans texte alternatif : ${tag.src}`);
    if (new URL(tag.src, base).origin !== base.origin) externalImages.push(tag.src);
  }
  if (tag.tagName === 'script' && tag.src) {
    const script = await readFile(resolve(root, tag.src.split('?')[0]), 'utf8');
    new vm.Script(script, { filename: tag.src });
    scripts++;
  }
}
const articleURLs = new Set(tags.filter(t => t.tagName === 'a' && t.href?.startsWith('articles/')).map(t => t.href));
const discoveryURLs = new Set(tags.filter(t => Object.hasOwn(t, 'data-discovery-path')).map(t => t.href));
assert.deepEqual(discoveryURLs, articleURLs, 'Le tirage surprise doit inclure chaque article de l’accueil');
assert.equal(articleURLs.size, 5);
assert.equal(tags.find(t => t.id === 'contenu').tabindex, '-1');
for (const tag of tags.filter(t => t.rel === 'stylesheet')) {
  const path = tag.href.split('?')[0];
  const css = await readFile(resolve(root, path), 'utf8');
  for (const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
    if (!/^(?:data:|https?:|#)/i.test(match[1])) await access(resolve(root, dirname(path), match[1]));
  }
}
console.log(`PASS : accueil, ${internal} liens/ressources internes, ${scripts} scripts, 5 articles dans le tirage surprise.`);
console.log(`NON VÉRIFIÉ : réponse réseau des ${externalImages.length} images externes, rendu visuel et mesures de performance.`);
