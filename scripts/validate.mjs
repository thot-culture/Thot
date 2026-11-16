#!/usr/bin/env node
// Contrôles locaux courants, sans installation, réseau, commit ni publication.
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { values } = parseArgs({ options: { python: { type: 'string', default: 'python' },
  revision: { type: 'string', default: 'HEAD' } } });
const py = (script, ...args) => [values.python, ['scripts/'+script, ...args]];
const commands = [
  [process.execPath, ['scripts/check-home.mjs']],
  [process.execPath, ['scripts/check-site.mjs']],
  ...readdirSync(resolve(root, 'scripts')).filter(n => /^test-.*\.mjs$/.test(n)).sort()
    .map(n => [process.execPath, ['scripts/'+n]]),
  ...['build-explorer-reconstruction.py', 'site_chrome.py', 'sync-publication.py',
    'build-quiz-references.py', 'update-article-editorial.py', 'update-reading-times.py',
    'generate-social-cards.py'].map(n => py(n, '--check')),
  ...['test-documentary-links.py', 'test-atlas-performance.py', 'test-stabilisation.py', 'test-explorer-reconstruction.py', 'test-current-checks.py',
    'test-publication.py', 'test-publication-integration.py', 'test-portabilite.py',
    'test-seo.py', 'check-seo.py', 'test-article-editorial.py', 'test-roubaix-document.py',
    'test-pieuvres-reperes.py', 'test-puissance-comparaison.py', 'check-editorial.py'].map(n => py(n)),
  py('test-strategies-static.py'),
  py('test-sophistes.py'),
  py('test-explorer-finitions.py', '--static-only'),
  py('test-explorer-recette-finale.py', '--static-only'),
  py('production_checks.py', '--revision', values.revision),
  py('check-conservation.py', '--revision', values.revision)
];
let failed = 0;
for (const [command, args] of commands) {
  console.log('\n> '+[command, ...args].join(' '));
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) failed++;
}
console.log(`\n${commands.length-failed}/${commands.length} commandes réussies ; ${failed} échec(s).`);
process.exitCode = failed ? 1 : 0;
