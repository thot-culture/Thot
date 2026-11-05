// Résolution locale des URL publiées : même principe que check-site.mjs.
import assert from 'node:assert/strict';
import { realpath } from 'node:fs/promises';
import path from 'node:path';

function inside(root, target, paths = path) {
  const relative = paths.relative(root, target);
  assert.ok(relative !== '..' && !relative.startsWith('..' + paths.sep)
    && !paths.isAbsolute(relative), 'Ressource hors du répertoire du projet');
}

// Contrôlé avant tout accès disque, sur Windows comme sur POSIX.
export function projectPath(root, name, paths = path) {
  assert.ok(typeof name === 'string' && name && !/[\\:\0]/.test(name)
    && !name.startsWith('/') && !name.split('/').some(part => part === '..' || part === '.'),
  'Chemin de ressource invalide ou hors du projet');
  const target = paths.resolve(root, ...name.split('/'));
  inside(paths.resolve(root), target, paths);
  return target;
}

export async function projectFile(root, name) {
  const target = projectPath(root, name);
  // Vérifier aussi les liens symboliques et les jonctions Windows.
  const [realRoot, realTarget] = await Promise.all([realpath(root), realpath(target)]);
  inside(realRoot, realTarget);
  return realTarget;
}

export async function siteResource(root, publication, value, owner = publication) {
  const base = new URL(publication);
  assert.ok(['https:', 'http:'].includes(base.protocol) && base.pathname.endsWith('/')
    && !base.search && !base.hash, 'URL de publication invalide');
  const url = new URL(value.replaceAll('&amp;', '&'), owner);
  if (url.origin !== base.origin || !['https:', 'http:'].includes(url.protocol)) return null;
  const prefix = base.pathname.endsWith('/') ? base.pathname : base.pathname + '/';
  assert.ok(url.pathname.startsWith(prefix), 'URL hors du sous-chemin GitHub Pages : ' + value);
  let name = decodeURIComponent(url.pathname.slice(prefix.length));
  if (!name || name.endsWith('/')) name += 'index.html';
  return { url, name, path: await projectFile(root, name) };
}
