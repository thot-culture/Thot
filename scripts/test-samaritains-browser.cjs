/* Recette HTTP : jeux samaritains, clavier, mobile et audit axe.
   Outils de test seulement, identiques aux autres recettes du dépôt. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');
const { waitForPreview } = require('./local-preview.cjs');
const root = path.resolve(__dirname, '..');
const output = path.resolve(process.env.THOT_OUTPUT_DIR || path.join(root, 'work/samaritains-browser'));
const base = process.env.THOT_BASE_URL || 'http://127.0.0.1:8876/Thot/';
const url = base + 'articles/bon-samaritain.html';
const correct = [1, 2, 0, 2, 1];
const labels = ['Judaïsme', 'Samaritanisme', 'Les deux traditions'];
// Attendus indépendants du moteur : les six explications du texte de mission.
const identityExplanation = "Les Samaritains constituent une communauté ethnoreligieuse ancienne, partageant un héritage israélite avec le judaïsme. C'est la parabole du Bon Samaritain qui a contribué à associer leur nom à la générosité.";
const questions = [
  'Le mont Garizim est le lieu sacré central de cette tradition.',
  'Moïse occupe une place fondamentale dans la tradition religieuse.',
  'Les Écritures reconnues comprennent la Torah, les Prophètes et les Écrits.',
  'Les cinq livres de Moïse sont considérés comme sacrés.',
  "Le Décalogue contient une prescription concernant la construction d'un autel sur le mont Garizim."
];
const explanations = [
  'Le mont Garizim est au cœur du culte samaritain. Dans le judaïsme antique, Jérusalem et son Temple constituaient le centre cultuel principal.',
  'Les deux traditions reconnaissent Moïse comme une figure majeure et accordent une autorité religieuse aux cinq livres qui lui sont traditionnellement attribués.',
  "Il s'agit du canon juif, appelé Tanakh. Les Samaritains reconnaissent uniquement le Pentateuque comme Écriture faisant autorité.",
  'Ils sont fondamentaux pour les deux traditions, bien que leurs versions présentent certaines différences textuelles.',
  "Cette prescription caractérise le Décalogue samaritain, dont l'organisation diffère de celle des Dix Commandements dans la tradition juive."
];
const results = [];
const errors = [];
const missing = [];
const external = [];
let audits = 0;

async function audit(page) {
  await page.addScriptTag({ path: process.env.THOT_AXE_PATH || require.resolve('axe-core/axe.min.js') });
  const violations = await page.evaluate(async () => (await axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] }
  })).violations);
  assert.deepEqual(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), []);
  audits++;
}
async function noOverflow(page) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
}
async function contextFor(browser, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', ...options });
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin !== new URL(base).origin) {
      external.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error)));
  page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
  await page.goto(url, { waitUntil: 'load' });
  return { context, page };
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const server = process.env.THOT_BASE_URL ? null : spawn(process.env.PYTHON || 'python',
    ['scripts/preview.py', '--port', '8876'], { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    await waitForPreview(server || {}, base, { root });
    const executablePath = process.env.THOT_CHROMIUM_EXECUTABLE || process.env.THOT_BROWSER_EXECUTABLE;
    browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    const { context, page } = await contextFor(browser);
    const identity = page.locator('#qui-est-samaritain');
    const game = page.locator('#judaisme-samaritanisme');
    assert.equal(await page.locator('h1').innerText(), 'Le bon Samaritain : mais qui sont vraiment les Samaritains ?');
    assert.equal(await page.locator('.sources li').count(), 10);
    assert.equal(await page.locator('#duree').innerText(), '7 min de lecture environ');
    await audit(page);
    await page.screenshot({ path: path.join(output, 'article-desktop.webp'), fullPage: true });

    for (let choice = 0; choice < 3; choice++) {
      assert.equal(await identity.locator('input:checked').count(), 0);
      assert(await identity.getByRole('button', { name: 'Vérifier ma réponse' }).isDisabled());
      await identity.locator('form').dispatchEvent('submit');
      assert.equal(await identity.locator('.sophistes-feedback').count(), 0);
      await identity.getByRole('radio').nth(choice).check();
      await identity.getByRole('button', { name: 'Vérifier ma réponse' }).click();
      const feedback = identity.locator('.sophistes-feedback');
      assert.equal(await feedback.locator('h4').innerText(), choice === 1 ? 'Bonne réponse !' : 'La bonne réponse est B.');
      assert.equal(await feedback.locator('p').innerText(), identityExplanation);
      assert(await feedback.evaluate(node => node === document.activeElement));
      assert.equal(await identity.locator('input:disabled').count(), 3);
      await identity.locator('form').dispatchEvent('submit');
      assert.equal(await identity.locator('.sophistes-feedback').count(), 1);
      if (choice === 0) await audit(page);
      await identity.getByRole('button', { name: 'Recommencer' }).click();
      assert.equal(await identity.locator('input:checked').count(), 0);
      assert.equal(await identity.locator('.sophistes-feedback').count(), 0);
      assert.equal(await identity.locator('input:disabled').count(), 0);
      assert(await identity.locator('legend').evaluate(node => node === document.activeElement));
    }
    results.push('Jeu 1 : A, B, C ; correction exacte ; verrouillage ; validation vide/doublée ; réinitialisation complète.');

    // 32 combinaisons vrai/faux, scores de 0 à 5 ; les deux distracteurs sont exercés.
    for (let pattern = 0; pattern < 32; pattern++) {
      const choices = correct.map((answer, i) => pattern & (1 << i) ? answer : (answer + 1 + pattern % 2) % 3);
      for (let i = 0; i < 5; i++) {
        assert.equal(await game.locator('h3').innerText(), `Question ${i + 1} / 5`);
        assert.equal(await game.locator('progress').getAttribute('value'), String(i + 1));
        assert.equal(await game.locator('legend').innerText(), questions[i]);
        assert.deepEqual(await game.locator('label span').allTextContents(), labels);
        assert.equal(await game.locator('input:checked').count(), 0);
        assert(await game.getByRole('button', { name: 'Valider', exact: true }).isDisabled());
        await game.locator('form').dispatchEvent('submit');
        assert.equal(await game.locator('.sophistes-feedback').count(), 0);
        await game.getByRole('radio').nth(choices[i]).check();
        // Deux événements synchrones sur le même bouton : un seul enregistrement.
        await game.getByRole('button', { name: 'Valider', exact: true }).evaluate(node => { node.click(); node.click(); });
        await game.locator('form').dispatchEvent('submit');
        const feedback = game.locator('.sophistes-feedback');
        assert.equal(await feedback.locator('p').last().innerText(), explanations[i]);
        assert((await feedback.innerText()).includes(labels[correct[i]]));
        assert(await feedback.evaluate(node => node === document.activeElement));
        assert.equal(await game.locator('input:disabled').count(), 3);
        if (pattern === 0 && i === 4) await audit(page);
        // L’ancien bouton reçoit un second clic après son retrait du DOM.
        await game.getByRole('button', { name: i === 4 ? 'Voir mon résultat' : 'Question suivante' })
          .evaluate(node => { node.click(); node.click(); });
        assert(await game.locator('h3').evaluate(node => node === document.activeElement));
      }
      const expected = choices.filter((choice, i) => choice === correct[i]).length;
      assert.equal(await game.locator('h3').innerText(), 'Défi terminé !');
      assert.equal(await game.locator('.samaritains-score').innerText(), `${expected} / 5`);
      assert((await game.innerText()).includes(expected === 5
        ? 'Tu as identifié toutes les réponses attendues !'
        : 'Voici les explications pour mieux comprendre les deux traditions.'));
      const rows = game.locator('.samaritains-recap li');
      assert.equal(await rows.count(), 5);
      for (let i = 0; i < 5; i++) {
        assert.equal(await rows.nth(i).locator('h4').innerText(), questions[i]);
        assert.deepEqual(await rows.nth(i).locator('p').allTextContents(),
          [`Votre réponse : ${labels[choices[i]]}.`, `Bonne réponse : ${labels[correct[i]]}.`, explanations[i]]);
      }
      if (pattern === 31) await audit(page);
      await game.getByRole('button', { name: 'Rejouer' }).click();
      assert.equal(await game.locator('h3').innerText(), 'Question 1 / 5');
      assert.equal(await game.locator('input:checked').count(), 0);
      assert.equal(await game.locator('.samaritains-recap').count(), 0);
    }
    results.push('Jeu 2 : 32 parcours, dont 5/5, 0/5 et mixtes ; 160 corrections ; bilans des cinq réponses ; doubles clics ; rejouer.');

    // Jeux indépendants et deuxième chargement du script sans perte de progression.
    await identity.getByRole('radio').nth(1).check();
    await identity.getByRole('button', { name: 'Vérifier ma réponse' }).click();
    await game.getByRole('radio').nth(1).check();
    await page.addScriptTag({ content: fs.readFileSync(path.join(root, 'assets/samaritains.js'), 'utf8') });
    assert.equal(await identity.locator('.sophistes-feedback').count(), 1);
    assert(await game.getByRole('radio').nth(1).isChecked());
    await identity.getByRole('button', { name: 'Recommencer' }).click();
    assert(await game.getByRole('radio').nth(1).isChecked());
    await identity.locator('.sophistes-skip').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'histoire-commune');
    await game.locator('.sophistes-skip').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'religion-vivante');

    await page.goto(url);
    await identity.getByRole('radio').first().focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowDown');
    assert(await identity.getByRole('radio').nth(1).isChecked());
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').innerText(), 'Vérifier ma réponse');
    assert.notEqual(await page.locator(':focus').evaluate(node => getComputedStyle(node).outlineStyle), 'none');
    await page.keyboard.press('Enter');
    assert(await identity.locator('.sophistes-feedback').evaluate(node => node === document.activeElement));
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    assert.equal(await identity.locator('input:checked').count(), 0);
    // Partie complète au clavier, jusqu’au bilan et au redémarrage.
    for (let i = 0; i < 5; i++) {
      await game.getByRole('radio').first().focus();
      await page.keyboard.press('Space');
      for (let step = 0; step < correct[i]; step++) await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').innerText(), 'Valider');
      await page.keyboard.press(i % 2 ? 'Space' : 'Enter');
      assert(await game.locator('.sophistes-feedback').evaluate(node => node === document.activeElement));
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
    }
    assert.equal(await game.locator('.samaritains-score').innerText(), '5 / 5');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    assert.equal(await game.locator('h3').innerText(), 'Question 1 / 5');
    results.push('Clavier : Tab, flèches, Entrée et Espace ; partie complète ; corrections et progression au focus ; liens pour passer les jeux.');

    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(url);
      await noOverflow(page);
      await identity.getByRole('radio').first().check();
      await identity.getByRole('button', { name: 'Vérifier ma réponse' }).click();
      await noOverflow(page);
      if (width === 390) await identity.screenshot({ path: path.join(output, 'jeu-1-mobile.webp') });
      for (let i = 0; i < 5; i++) {
        await game.getByRole('radio').first().check();
        await game.getByRole('button', { name: 'Valider', exact: true }).click();
        await noOverflow(page);
        if (width === 390 && i === 4) await game.screenshot({ path: path.join(output, 'jeu-2-mobile.webp') });
        await game.getByRole('button', { name: i === 4 ? 'Voir mon résultat' : 'Question suivante' }).click();
      }
      await noOverflow(page);
      if (width === 320 || width === 1440) await audit(page);
      if (width === 390) {
        await game.screenshot({ path: path.join(output, 'bilan-mobile.webp') });
        // Le menu mobile existant reste utilisable et restitue le focus.
        await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
        await page.keyboard.press('Escape');
        assert.equal(await page.locator(':focus').getAttribute('id'), 'mobile-menu-button');
      }
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(url);
    await page.evaluate(() => { document.documentElement.style.zoom = '200%'; });
    await noOverflow(page);
    results.push('320, 390, 768, 1024, 1440 px et zoom 200 % : lecture, questions, corrections et bilan sans débordement.');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    assert.equal(await identity.locator('label').first().evaluate(node => getComputedStyle(node).transitionDuration), '0s');
    assert.deepEqual(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) })), { local: [], session: [] });
    await page.goto(base + 'bibliotheque.html');
    await page.locator('#article-search').fill('samaritanisme');
    await page.locator('[data-filter="histoire"]').click();
    assert.equal(await page.locator('.article-card:visible').count(), 1);
    await page.locator('.article-card:visible .discovery-card__link').click();
    assert.equal(page.url(), url);
    await page.goto(base);
    assert(await page.locator('a[href="articles/bon-samaritain.html"]').count() > 0);
    await context.close();

    const fallback = await contextFor(browser, { javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
    assert.equal(await fallback.page.locator('[data-samaritains-fallback]:visible').count(), 2);
    assert.equal(await fallback.page.locator('[data-samaritains-stage]:visible').count(), 0);
    assert.equal(await fallback.page.locator('.sources li').count(), 10);
    await fallback.page.locator('#qui-est-samaritain .sophistes-skip').click();
    assert.equal(new URL(fallback.page.url()).hash, '#histoire-commune');
    await noOverflow(fallback.page);
    await fallback.context.close();
    results.push('Sans JavaScript : texte, sources, navigation et liens de saut ; mouvements réduits ; recherche et filtre Histoire ; aucun stockage.');
    assert.deepEqual(errors, []);
    assert.deepEqual(missing, []);
    assert.deepEqual(external, [], 'Les jeux et l’article ne transmettent aucune réponse ni requête externe');
    results.push(`${audits} audits axe WCAG A/AA sans violation ; aucune exception JS ni ressource absente ; aucune requête externe.`);
    const report = { status: 'PASS', browser: await browser.version(), transport: 'HTTP local /Thot/', results,
      limitations: ['Chromium Linux ; téléphone et clavier simulés ; aucun lecteur d’écran réel ni Safari/Firefox.'] };
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2)+'\n');
    console.log(JSON.stringify(report, null, 2));
  } finally {
    if (browser) await browser.close();
    if (server) server.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
