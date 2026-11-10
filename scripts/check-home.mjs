#!/usr/bin/env node
// Contrôles statiques de l’accueil et de ses cibles, sans dépendance ni réseau.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { parseArgs } from 'node:util';
import { projectFile, siteResource } from './site-resources.mjs';

const { values } = parseArgs({ options: { root: { type: 'string' }, base: { type: 'string' } } });
const root = values.root ? resolve(values.root) : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const expectedBase = values.base || 'https://thot-culture.github.io/Thot/';
const html = await readFile(await projectFile(root, 'index.html'), 'utf8');
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
assert.equal(base.href, expectedBase);
assert.equal(tags.find(t => t.property === 'og:url').content, base.href);

let internal = 0, scripts = 0;
const externalImages = [];
const pages = new Map([['index.html', html]]);
async function checkURL(value) {
  const resource = await siteResource(root, base, value);
  if (!resource) return;
  const { url, name: target, path } = resource;
  if (url.hash && target.endsWith('.html')) {
    if (!pages.has(target)) pages.set(target, await readFile(path, 'utf8'));
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
    const resource = await siteResource(root, base, tag.src);
    if (!resource) continue;
    const script = await readFile(resource.path, 'utf8');
    new vm.Script(script, { filename: tag.src });
    scripts++;
  }
}
const articleURLs = new Set(tags.filter(t => t.tagName === 'a' && t.href?.startsWith('articles/')).map(t => t.href));
const discoveryURLs = new Set(tags.filter(t => Object.hasOwn(t, 'data-discovery-path')).map(t => t.href));
assert.deepEqual(discoveryURLs, articleURLs, 'Le tirage surprise doit inclure chaque article de l’accueil');
assert.ok(articleURLs.size > 0, 'L’accueil doit présenter au moins un article');
assert.equal(tags.find(t => t.id === 'contenu').tabindex, '-1');
for (const tag of tags.filter(t => t.rel === 'stylesheet')) {
  const resource = await siteResource(root, base, tag.href);
  if (!resource) continue;
  const css = await readFile(resource.path, 'utf8');
  for (const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
    if (!match[1].startsWith('#')) await siteResource(root, base, match[1], resource.url);
  }
}
console.log(`PASS : accueil, ${internal} liens/ressources internes, ${scripts} scripts, ${articleURLs.size} articles dans le tirage surprise.`);
console.log(`NON VÉRIFIÉ : réponse réseau des ${externalImages.length} images externes, rendu visuel et mesures de performance.`);
