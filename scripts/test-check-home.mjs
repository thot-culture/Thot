#!/usr/bin/env node
// Régression des chemins publiés, des lectures CSS/JS et du confinement.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { projectPath, siteResource } from './site-resources.mjs';

let base = 'https://thot-culture.github.io/Thot/';
const temporary = await mkdtemp(path.join(tmpdir(), 'THOT home paths '));
const root = path.join(temporary, 'project');
const checker = fileURLToPath(new URL('./check-home.mjs', import.meta.url));
let assertions = 0, symlinkResult = 'vérifié';
async function put(name, text) {
  const target = path.join(root, name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, text, 'utf8');
}
const run = () => spawnSync(process.execPath, [checker, '--root', root, '--base', base],
  { cwd: temporary, encoding: 'utf8' });
try {
  await put('index.html', '<!doctype html><html lang="fr"><head><title>THOT</title>'
    + '<meta name="description" content="Test"><meta name="viewport" content="width=device-width">'
    + '<meta property="og:title" content="THOT"><meta property="og:url" content="' + base + '">'
    + '<link rel="canonical" href="' + base + '"><link rel="stylesheet" href="/Thot/assets/navigation.css?v=1&amp;release=2">'
    + '<link rel="stylesheet" href="assets/nested/test.css?v=2">'
    + '<script src="/Thot/assets/navigation.js?v=1&amp;release=2"></script>'
    + '<script src="https://external.invalid/missing.js"></script></head><body><main id="contenu" tabindex="-1">'
    + '<h1>Accueil</h1><img src="/Thot/assets/images/a.svg?v=2" alt="Test">'
    + Array.from({length: 5}, (_, n) => '<a href="articles/' + n + '.html#contenu" data-discovery-path>Article</a>').join('')
    + '<a href="/Thot/folder/?v=2#contenu">Dossier</a></main></body></html>');
  for (let n = 0; n < 5; n++) await put('articles/' + n + '.html', '<main id="contenu">Article</main>');
  await put('folder/index.html', '<main id="contenu">Dossier</main>');
  await put('assets/navigation.js', 'globalThis.thotTest = true;');
  const css = '.a{background:url("images/a.svg?v=1#shape")}.b{background:url("/Thot/assets/images/a%20b.svg?v=2")}.c{background:url(data:image/png;base64,AAAA)}';
  await put('assets/navigation.css', css);
  await put('assets/nested/test.css', '.a{background:url("../images/a.svg?v=3")}');
  await put('assets/images/a.svg', '<svg xmlns="http://www.w3.org/2000/svg" id="shape"/>');
  await put('assets/images/a b.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>');

  for (const value of ['assets/navigation.css?v=1#x', '/Thot/assets/navigation.css?v=2',
    base + 'assets/navigation.css?v=3&amp;release=4', '//thot-culture.github.io/Thot/assets/navigation.css']) {
    const resource = await siteResource(root, base, value);
    assert.equal(resource.name, 'assets/navigation.css'); assertions++;
  }
  assert.equal((await siteResource(root, base, '../images/a.svg?v=1',
    base + 'assets/nested/test.css?v=2')).name, 'assets/images/a.svg'); assertions++;
  assert.equal((await siteResource(root, base, '/Thot/folder/?v=2#contenu')).name, 'folder/index.html'); assertions++;
  for (const value of ['https://external.invalid/a.css', 'data:text/css,body{}', 'mailto:test@example.invalid']) {
    assert.equal(await siteResource(root, base, value), null); assertions++;
  }
  for (const value of ['/elsewhere.css', '/Thot/../outside.css', '/Thot/%2e%2e%2foutside.css',
    '/Thot/assets/%2e%2e%5coutside.css', '/Thot/%2foutside.css', '/Thot/C%3a/secret',
    '/Thot/assets/file.css%3astream', '/Thot/assets/%00.css', '/Thot/assets/%zz.css']) {
    // Un ENOENT ne prouverait pas le confinement : exiger le refus de validation.
    await assert.rejects(siteResource(root, base, value), value.includes('%zz')
      ? URIError : { code: 'ERR_ASSERTION' }); assertions++;
  }
  for (const paths of [path.win32, path.posix]) {
    const project = paths === path.win32 ? 'C:\\project' : '/project';
    assert.equal(projectPath(project, 'assets/navigation.css', paths),
      paths.join(project, 'assets', 'navigation.css')); assertions++;
    for (const invalid of ['../outside', '/absolute', 'C:/outside', 'assets/../../outside', 'assets\\outside', 'file:stream']) {
      assert.throws(() => projectPath(project, invalid, paths)); assertions++;
    }
  }
  let result = run();
  assert.equal(result.status, 0, result.stdout + result.stderr); assertions++;
  // La même page peut être publiée à la racine ; les URL absolues et relatives
  // doivent conserver la sémantique URL, indépendamment du dossier courant.
  const { readFile } = await import('node:fs/promises');
  const prefixedHTML = await readFile(path.join(root, 'index.html'), 'utf8');
  base = 'https://thot-culture.github.io/';
  await put('index.html', prefixedHTML.replaceAll('/Thot/', '/'));
  await put('assets/navigation.css', css.replaceAll('/Thot/', '/'));
  result = run();
  assert.equal(result.status, 0, result.stdout + result.stderr); assertions++;
  assert.equal((await siteResource(root, base, '/assets/navigation.css?v=2#x')).name,
    'assets/navigation.css'); assertions++;
  base = 'https://thot-culture.github.io/Thot/';
  await put('index.html', prefixedHTML);
  await put('assets/navigation.css', css);
  await put('assets/navigation.js', 'invalid ( javascript');
  result = run();
  assert.notEqual(result.status, 0, 'Le JavaScript préfixé doit être lu et vérifié');
  assert.match(result.stderr, /SyntaxError/); assertions++;
  await put('assets/navigation.js', 'globalThis.thotTest = true;');
  await put('assets/navigation.css', '.a{background:url("/Thot/%2e%2e%2foutside.css?v=1")}');
  result = run();
  assert.notEqual(result.status, 0, 'Une cible CSS hors du projet doit être refusée');
  assert.match(result.stderr, /hors du projet|hors du sous-chemin/); assertions++;
  await put('assets/navigation.css', css);
  await put('assets/navigation.css', '.a{background:url("images/absent.svg")}');
  result = run();
  assert.notEqual(result.status, 0, 'Une ressource CSS absente doit faire échouer le contrôle');
  assert.match(result.stderr, /ENOENT/); assertions++;
  await put('assets/navigation.css', css);
  const outside = path.join(temporary, 'outside');
  await mkdir(outside);
  await writeFile(path.join(outside, 'secret.css'), 'body{}', 'utf8');
  try {
    await symlink(outside, path.join(root, 'assets', 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
    await assert.rejects(siteResource(root, base, '/Thot/assets/escape/secret.css'), /hors du répertoire/); assertions++;
  } catch (error) {
    if (!['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) throw error;
    symlinkResult = 'non disponible (' + error.code + ')';
  }
  console.log('PASS : ' + assertions + ' cas de résolution/confinement ; intégration du contrôleur ; chemins POSIX et Windows ; lien symbolique : ' + symlinkResult + '.');
} finally {
  // Chemin absolu créé par ce test, strictement sous le dossier temporaire choisi.
  assert.ok(path.resolve(temporary).startsWith(path.resolve(tmpdir()) + path.sep));
  await rm(temporary, { recursive: true, force: true });
}
