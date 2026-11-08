#!/usr/bin/env node
// Recette des fichiers réellement publiés, sous /Thot/, sans accès réseau.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const output = path.resolve(process.env.THOT_OUTPUT_DIR || path.join(root, 'work/sophistes-browser'));
const slug = 'les-sophistes-verite-justice';
const url = `https://thot.local/Thot/articles/${slug}.html`;
const js = fs.readFileSync(path.join(root, 'assets/sophistes.js'), 'utf8');
const results = [];
const errors = [];
const missing = [];
const correct = [0, 1, 1];
const explanations = ['confond corrélation et causalité', 'cadrage alarmant', 'ne remplace pas l’examen'];
const personal = [
  ['Vous privilégiez l’expérience individuelle.', 'Vous privilégiez la mesure objective.', 'Vous privilégiez une solution pratique.'],
  ['Vous privilégiez la légalité et la procédure démocratique.', 'Vous accordez une importance particulière aux effets de la loi', 'Vous préférez examiner les circonstances avant de juger.'],
  ['Vous examinez d’abord la légalité de la décision.', 'Vous examinez les rapports entre le pouvoir', 'Vous examinez les conséquences concrètes de la décision.']
];
const limits = [
  ['ne permettent pas nécessairement d’établir tous les faits', 'ne permet pas à elle seule de déterminer le confort', 'ne revient pas nécessairement à établir une vérité objective'],
  ['peut toujours être contestée sur le plan moral', 'ne signifie pas nécessairement qu’une mesure est injustifiée', 'ne constituent pas le seul critère possible de justice'],
  ['n’est pas nécessairement juste', 'Platon attribue à Thrasymaque', 'dépassent les seuls résultats pratiques']
];
const perspectives = ['les perceptions individuelles, les faits mesurables', 'nomos et physis', 'sa légalité, les intérêts qu’elle sert'];
let audits = 0;

async function contextFor(browser, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', ...options });
  await context.route('**/*', async route => {
    const requested = new URL(route.request().url());
    if (requested.origin !== 'https://thot.local') return route.abort();
    const relative = decodeURIComponent(requested.pathname).replace(/^\/Thot\//, '');
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      missing.push(requested.pathname);
      return route.fulfill({ status: 404, body: 'Absent' });
    }
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };
    return route.fulfill({ status: 200, contentType: types[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(url);
  return { context, page };
}

async function noOverflow(page) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Aucun débordement horizontal');
}

async function audit(page) {
  const axePath = process.env.THOT_AXE_PATH || require.resolve('axe-core/axe.min.js');
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations);
  assert.deepEqual(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), []);
  audits++;
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  console.log('Recette sophistes : lancement du navigateur.');
  const executable = process.env.THOT_CHROMIUM_EXECUTABLE || process.env.THOT_BROWSER_EXECUTABLE;
  const browser = await chromium.launch({ headless: true, ...(executable ? { executablePath: executable } : {}) });
  try {
    const { context, page } = await contextFor(browser);
    const gorgias = page.locator('#defi-gorgias');
    const dilemma = page.locator('#qui-a-raison');
    assert.equal(await page.locator('h1').innerText(), 'Les sophistes : qui décide de ce qui est vrai et juste ?');
    assert.equal(await page.locator('.sources li').count(), 15);
    assert.equal(await page.locator('#duree').innerText(), '7 min de lecture environ');
    assert.equal(await page.locator('time[datetime="2026-11-08"]').count(), 1);
    assert.equal(await gorgias.locator('.sophistes-feedback').count(), 0);
    assert.equal(await dilemma.locator('.sophistes-feedback').count(), 0);
    assert(await gorgias.getByRole('button', { name: 'Valider ma réponse' }).isDisabled());
    await audit(page);
    await page.screenshot({ path: path.join(output, 'article-desktop.png'), fullPage: true });

    // Les huit parcours de Gorgias, y compris toutes les bonnes/mauvaises réponses.
    for (let pattern = 0; pattern < 8; pattern++) {
      for (let i = 0; i < 3; i++) {
        assert((await gorgias.locator('h3').innerText()).includes(`${i + 1}/3`));
        assert.equal(await gorgias.locator('.sophistes-feedback').count(), 0);
        const right = Boolean(pattern & (1 << i));
        await gorgias.getByRole('radio').nth(right ? correct[i] : 1 - correct[i]).check();
        assert.equal(await gorgias.locator('.sophistes-feedback').count(), 0, 'Pas de correction avant validation');
        assert(!(await gorgias.ariaSnapshot()).includes(explanations[i]));
        await gorgias.getByRole('button', { name: 'Valider ma réponse' }).click();
        const feedback = gorgias.locator('.sophistes-feedback');
        assert((await feedback.innerText()).includes(explanations[i]));
        assert((await feedback.innerText()).includes(right ? 'Bonne réponse.' : 'La bonne réponse est'));
        assert(await feedback.evaluate(node => node === document.activeElement));
        assert(await gorgias.getByRole('radio').first().isDisabled());
        await gorgias.locator('form').dispatchEvent('submit'); // Une seconde validation ne doit pas ajouter de point.
        if (pattern === 0 && i === 0) await audit(page);
        await gorgias.getByRole('button', { name: i === 2 ? 'Voir mon résultat' : 'Question suivante' }).click();
        assert(await gorgias.locator('h3').evaluate(node => node === document.activeElement));
      }
      const expected = [...pattern.toString(2)].filter(n => n === '1').length;
      assert.equal(await gorgias.locator('h3').innerText(), `Votre résultat : ${expected}/3`);
      const text = await gorgias.innerText();
      assert(text.includes(expected < 2 ? 'quelles preuves' : expected === 2 ? 'plusieurs procédés' : 'même lorsqu’on connaît'));
      if (pattern === 7) await audit(page);
      await gorgias.getByRole('button', { name: 'Recommencer' }).click();
      assert((await gorgias.locator('h3').innerText()).includes('1/3'));
    }
    results.push('8 parcours Gorgias ; scores 0, 1, 2, 3 ; correction différée ; double validation ; reprise');
    console.log('PASS : les huit parcours de Gorgias.');

    // Trois tours avec A, B puis C : les neuf explications et leurs limites.
    for (let choice = 0; choice < 3; choice++) {
      for (let i = 0; i < 3; i++) {
        assert.equal(await dilemma.locator('.sophistes-feedback').count(), 0);
        assert(!(await dilemma.ariaSnapshot()).includes(personal[i][choice]));
        await dilemma.getByRole('radio').nth(choice).check();
        const feedback = dilemma.locator('.sophistes-feedback');
        const text = await feedback.innerText();
        assert(text.includes(personal[i][choice]));
        assert(text.includes(limits[i][choice]));
        assert(text.includes(perspectives[i]));
        assert(!/bonne réponse|mauvaise réponse|score|résultat\s*:/i.test(text));
        assert(await feedback.evaluate(node => node === document.activeElement));
        if (choice === 0 && i === 0) await audit(page);
        await dilemma.getByRole('button', { name: 'Continuer', exact: true }).click();
      }
      const final = await dilemma.locator('[data-sophistes-stage]').innerText();
      assert(final.includes('Philosopher ne consiste pas toujours à trouver immédiatement la bonne réponse.'));
      assert(!/score|classement|\d\/3/.test(final));
      if (choice === 2) await audit(page);
      await dilemma.getByRole('button', { name: 'Recommencer' }).click();
    }
    results.push('9 choix de dilemmes ; explications, limites et perspectives ; aucune note ; reprise');
    console.log('PASS : les neuf choix des dilemmes.');

    // La réinitialisation d’un jeu ne modifie pas l’autre, ni un deuxième chargement.
    await gorgias.getByRole('radio').first().check();
    await gorgias.getByRole('button', { name: 'Valider ma réponse' }).click();
    await page.addScriptTag({ content: js });
    assert.equal(await gorgias.locator('.sophistes-feedback').count(), 1);
    assert.equal(await dilemma.getByRole('radio').count(), 3);
    await gorgias.locator('.sophistes-skip').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'antiphon-hippias');
    await dilemma.locator('.sophistes-skip').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'prodicos');
    assert(await page.locator('#transmission').isVisible());
    results.push('Modules indépendants ; initialisation idempotente ; sauts clavier et focus sur le texte');

    await page.goto(url);
    await gorgias.getByRole('radio').first().focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowDown');
    assert(await gorgias.getByRole('radio').nth(1).isChecked());
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').innerText(), 'Valider ma réponse');
    assert.notEqual(await page.locator(':focus').evaluate(node => getComputedStyle(node).outlineStyle), 'none');
    await page.keyboard.press('Enter');
    assert(await gorgias.locator('.sophistes-feedback').evaluate(node => node === document.activeElement));
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    assert((await gorgias.locator('h3').innerText()).includes('2/3'));
    await dilemma.getByRole('radio').first().focus();
    await page.keyboard.press('Space');
    assert(await dilemma.locator('.sophistes-feedback').evaluate(node => node === document.activeElement));
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    assert((await dilemma.locator('h3').innerText()).includes('2/3'));
    results.push('Navigation par Tab, flèches, Espace et Entrée ; focus visible, validation et progression');

    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(url);
      await noOverflow(page);
      // Rendu des questions et des explications les plus longues à chaque largeur.
      for (let i = 0; i < 3; i++) {
        await gorgias.getByRole('radio').first().check();
        await gorgias.getByRole('button', { name: 'Valider ma réponse' }).click();
        await noOverflow(page);
        if (width === 390 && i === 0) await gorgias.screenshot({ path: path.join(output, 'gorgias-mobile.png') });
        await gorgias.getByRole('button', { name: i === 2 ? 'Voir mon résultat' : 'Question suivante' }).click();
        await dilemma.getByRole('radio').first().check();
        await noOverflow(page);
        if (width === 390 && i === 0) await dilemma.screenshot({ path: path.join(output, 'dilemme-mobile.png') });
        await dilemma.getByRole('button', { name: 'Continuer', exact: true }).click();
      }
      await noOverflow(page);
    }
    results.push('320, 390, 768, 1024, 1440 px : questions, explications et résultats sans débordement');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url);
    assert.equal(await gorgias.locator('label').first().evaluate(node => getComputedStyle(node).transitionDuration), '0s');
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    results.push('Préférence de réduction des mouvements respectée');
    await context.close();

    const fallback = await contextFor(browser, { javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
    assert.equal(await fallback.page.locator('[data-sophistes-fallback]:visible').count(), 2);
    assert.equal(await fallback.page.locator('[data-sophistes-stage]:visible').count(), 0);
    assert.equal(await fallback.page.locator('.sources li').count(), 15);
    await fallback.page.locator('#defi-gorgias .sophistes-skip').click();
    assert.equal(new URL(fallback.page.url()).hash, '#antiphon-hippias');
    await noOverflow(fallback.page);
    await fallback.context.close();
    results.push('Sans JavaScript : lecture et sources accessibles, liens de saut fonctionnels');
    assert.deepEqual(errors, []);
    assert.deepEqual(missing, []);
    results.push(`${audits} audits axe WCAG A/AA sans violation ; aucune exception JavaScript ni ressource locale manquante`);
    console.log(JSON.stringify({ status: 'PASS', browser: await browser.version(), results }, null, 2));
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ status: 'PASS', results }, null, 2)+'\n');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
