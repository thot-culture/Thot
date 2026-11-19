/* Recette du panneau de recherche pendant et après le chargement du script. */
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');
const { waitForPreview } = require('./local-preview.cjs');

const root = path.resolve(__dirname, '..');
const base = 'http://127.0.0.1:8866/Thot/';
const url = base + 'bibliotheque.html';
const viewports = [[320, 720], [390, 844], [768, 1024], [1024, 768], [1440, 900]];
const scriptURL = url => url.pathname.endsWith('/assets/bibliotheque.js');
const searchLabel = 'Rechercher un sujet, un lieu ou un mot-clé';
const filterLabel = 'Filtrer les articles par discipline';

function layout() {
  return ['#library-search', '.library-discovery', '#results-status', '#article-results', '.article-card']
    .map(selector => document.querySelector(selector).getBoundingClientRect().toJSON());
}

async function checkFallback(page) {
  assert(await page.locator('.search-fallback').isVisible());
  assert.match(await page.locator('.search-fallback').innerText(), /Tous les articles restent accessibles/);
  assert(await page.locator('#article-search').isHidden());
  assert.equal(await page.getByRole('searchbox', { name: searchLabel }).count(), 0);
  assert.equal(await page.getByRole('group', { name: filterLabel }).count(), 0);
  assert(await page.getByRole('link', { name: /Surprends-moi/ }).isVisible());
  const articles = page.locator('.article-card .discovery-card__link');
  assert(await articles.count() > 1);
  assert.equal(await page.locator('.article-card .discovery-card__link:visible').count(), await articles.count());
}

async function checkDelayed(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const pending = Promise.withResolvers();
  try {
    await context.route(scriptURL, async route => {
      await pending.promise;
      await route.continue();
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.searchLayoutShifts = [];
      new PerformanceObserver(list => {
        window.searchLayoutShifts.push(...list.getEntries().filter(entry => !entry.hadRecentInput)
          .map(entry => entry.value));
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(url, { waitUntil: 'commit' });
    await page.waitForFunction(() => performance.getEntriesByName('first-contentful-paint').length &&
      document.querySelector('#article-results'), null, { timeout: 10000 });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await checkFallback(page);
    const before = await page.evaluate(layout);
    assert(before[0].height > 0, 'Le panneau réserve la hauteur de ses commandes dès le premier rendu');
    pending.resolve();
    await page.waitForLoadState('load');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert(await page.getByRole('searchbox', { name: searchLabel }).isVisible());
    assert(await page.getByRole('group', { name: filterLabel }).isVisible());
    assert(await page.locator('.search-fallback').isHidden());
    assert.deepEqual(await page.evaluate(layout), before, 'Le panneau et les résultats restent en place');
    assert.deepEqual(await page.evaluate(() => window.searchLayoutShifts), [], 'Aucun décalage après le premier rendu');
  } finally {
    pending.resolve();
    await context.close();
  }
}

async function checkSearchAndReload(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(url + '?preuve=1#catalogue-title');
    const search = page.getByRole('searchbox', { name: searchLabel });
    const status = page.getByRole('status');
    const count = page.locator('.article-card:visible');
    const total = await count.count();
    const filter = page.getByRole('button', { name: 'Littérature et arts' });

    const menu = page.locator('#mobile-menu-button');
    await menu.focus();
    await page.keyboard.press('Tab');
    assert(await search.evaluate(el => el.matches(':focus-visible')));
    assert.notEqual(await search.evaluate(el => getComputedStyle(el.parentElement).outlineStyle), 'none');
    const cdp = await page.context().newCDPSession(page);
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#article-search' });
    const { nodes: [accessibleSearch] } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
    assert.match(accessibleSearch.description.value, /Vous pouvez combiner plusieurs mots/);
    await cdp.detach();
    await filter.press('Enter');
    assert.equal(await filter.getAttribute('aria-pressed'), 'true');
    assert.equal(new URL(page.url()).searchParams.get('sujet'), 'arts');
    await search.fill('CHARLOTTE BRONTË');
    assert.equal(await count.count(), 1);
    assert.equal(await status.innerText(), '1 article trouvé');
    await page.waitForURL(value => value.searchParams.get('q') === 'CHARLOTTE BRONTË');
    await page.reload();
    assert.equal(await search.inputValue(), 'CHARLOTTE BRONTË');
    assert.equal(await filter.getAttribute('aria-pressed'), 'true');
    assert.equal(await count.count(), 1);
    assert.equal(new URL(page.url()).hash, '#catalogue-title');

    await search.fill('inexistant-zzzz');
    assert.equal(await count.count(), 0);
    assert.equal(await status.innerText(), 'Aucun article trouvé');
    await page.getByRole('button', { name: 'Afficher tous les articles' }).click();
    assert.equal(await count.count(), total);
    assert.equal(await search.inputValue(), '');
    assert(await search.evaluate(el => el === document.activeElement));
    assert.equal(page.url(), url + '?preuve=1#catalogue-title');
  } finally {
    await page.close();
  }
}

async function main() {
  const server = spawn(process.env.PYTHON || 'python', ['scripts/preview.py', '--port', '8866'],
    { cwd: root, stdio: 'ignore' });
  let browser;
  try {
    await waitForPreview(server, base, { root });
    browser = await chromium.launch();
    for (const [width, height] of viewports) {
      const viewport = { width, height };
      await checkDelayed(browser, viewport);
      for (const javaScriptEnabled of [false, true]) {
        const context = await browser.newContext({ viewport, javaScriptEnabled });
        try {
          if (javaScriptEnabled) await context.route(scriptURL, route => route.abort());
          const page = await context.newPage();
          await page.goto(url);
          await checkFallback(page);
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        } finally {
          await context.close();
        }
      }
      console.log(`PASS bibliothèque ${width} × ${height} : panneau stable, articles et replis accessibles`);
    }
    await checkSearchAndReload(browser);
    console.log('PASS recherche, filtre, URL, rechargement, états zéro/un/plusieurs, clavier, focus et libellés ARIA');
  } finally {
    await browser?.close();
    server.kill();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
