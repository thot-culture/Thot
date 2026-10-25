#!/usr/bin/env python3
"""Source intacte et lecture réelle dans Chromium via une fixture locale hors réseau."""
from pathlib import Path
import argparse
import hashlib
import json
import re
import subprocess
import sys
sys.dont_write_bytecode = True
from PIL import Image
from browser_fixture import ROOT, chromium, page_for, no_overflow


def static_checks():
    html = (ROOT / 'articles/roubaix-1917.html').read_text()
    source = json.loads((ROOT / 'docs/DOCUMENT-ROUBAIX-LAINE.json').read_text())
    assert source['sha1'] == '7abb531df5971f90dffb4a47eef23f295beaafb1'
    original = (ROOT / source['original']).read_bytes()
    assert hashlib.sha1(original).hexdigest() == source['sha1']
    assert source['license'] == 'CC BY 4.0'
    with Image.open(ROOT / source['original']) as image:
        assert image.size == (1238, 1685); image.verify()
    with Image.open(ROOT / source['preview']) as image:
        assert image.size == (500, 681); image.verify()
    assert (ROOT / source['preview']).stat().st_size < 160000
    before = subprocess.check_output(['git', 'show', '917714a:articles/roubaix-1917.html'], cwd=ROOT, text=True)
    guide = r'<section class="thot-visual-guide"[\s\S]*?</section>'
    assert re.search(guide, before)[0] == re.search(guide, html)[0], 'Commentaire original modifié'
    assert len(re.findall(r'<li><strong>', html[html.index('id="roubaix-reperes-texte"'):html.index('class="thot-simple-intro"')])) == 8
    assert 'chaque paquets' in html, 'Orthographe originale de la transcription non conservée'
    assert 'Transcription de lecture relue sur le scan' in html
    assert 'id="laine-commandes"' in html and 'data-full-src=' in html
    print('PASS : original intact, licence, aperçu allégé, commentaire conservé, transcription et huit repères statiques.')


def browser_checks(output):
    from playwright.sync_api import sync_playwright
    output.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as p:
        browser = chromium(p)
        for width in (320, 390, 768, 1440):
            context, page, errors = page_for(browser, 'articles/roubaix-1917.html', width)
            root = page.locator('#lecture-affiche-laine')
            root.scroll_into_view_if_needed()
            page.wait_for_function('document.querySelector("#laine-image").naturalWidth === 500')
            assert page.locator('#laine-commandes').is_visible()
            assert page.locator('#laine-image').evaluate('(n)=>n.getAttribute("src")!==n.dataset.fullSrc'), 'Original chargé sans demande'
            no_overflow(page)
            page.locator('[data-visual-control="objet"]').click()
            page.wait_for_function('document.querySelector("#laine-image").naturalWidth === 1238')
            assert page.locator('#laine-zone').is_visible()
            assert 'titre' in page.locator('#laine-statut').inner_text()
            page.locator('[data-visual-control="date"]').click()
            assert 'date imprimée' in page.locator('#laine-statut').inner_text()
            bounds = page.locator('#laine-zone').bounding_box()
            viewport = page.locator('#laine-viewport').bounding_box()
            assert bounds['y'] < viewport['y'] + viewport['height'] and bounds['y'] + bounds['height'] > viewport['y'], 'Repère hors vue'
            page.locator('[data-visual-control="limite"]').click()
            assert page.locator('#laine-zone').is_hidden()
            assert 'commentaire de THOT' in page.locator('#laine-statut').inner_text()
            page.locator('[data-document-action="open"]').focus()
            page.keyboard.press('Enter')
            image = page.locator('#laine-viewport')
            image.focus()
            before = image.evaluate('(n)=>n.scrollTop')
            page.keyboard.press('ArrowDown')
            assert image.evaluate('(n)=>n.scrollTop') > before, 'Déplacement clavier inactif'
            page.locator('[data-document-action="reset"]').click()
            assert page.locator('#laine-zone').is_hidden()
            assert page.locator('#laine-statut').inner_text() == 'Vue entière de l’affiche.'
            if width <= 390:
                gap = page.locator('#laine-viewport').evaluate('(n)=>n.clientHeight-n.querySelector("img").getBoundingClientRect().height')
                assert gap < 4, 'Zone vide disproportionnée sous l’affiche mobile'
            no_overflow(page)
            root.screenshot(path=str(output / f'roubaix-{width}.png'))
            assert not errors, errors
            results.append({'width': width, 'ok': True, 'javascript_errors': errors})
            context.close()
        context, page, errors = page_for(browser, 'articles/roubaix-1917.html', 390)
        page.locator('#lecture-affiche-laine').scroll_into_view_if_needed()
        page.wait_for_function('document.querySelector("#laine-image").naturalWidth === 500')
        page.locator('#laine-image').evaluate('(n)=>n.dataset.fullSrc="data:image/jpeg;base64,AA=="')
        page.locator('[data-document-action="open"]').click()
        page.wait_for_function('document.querySelector("#laine-statut").textContent.includes("n’a pas pu")')
        assert not page.locator('[data-document-action="open"]').is_disabled()
        assert page.locator('#transcription-laine').is_visible()
        assert not errors, errors
        context.close()
        context, page, errors = page_for(browser, 'articles/roubaix-1917.html', 320, javascript=False)
        assert page.locator('#laine-commandes').is_hidden()
        page.locator('#transcription-laine summary').click()
        assert page.locator('#transcription-laine blockquote').is_visible()
        page.locator('#roubaix-reperes-texte summary').click()
        assert page.locator('#roubaix-reperes-texte li').count() == 8
        no_overflow(page)
        assert not errors, errors
        context.close(); browser.close()
    report = {'ok': True, 'views': results, 'keyboard': True, 'load_failure': True, 'without_javascript': True,
              'method': 'Chromium réel, fixture locale avec CSS/JS et images locales réels incorporés ; aucune navigation réseau.',
              'limits': ['Ressources externes non chargées.', 'Lecteur d’écran et téléphone physique non testés.']}
    (output / 'roubaix-tests.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print('PASS : Chromium à 320/390/768/1440 px, zoom, repères, clavier réel, panne image, sans JS, aucun débordement ni erreur JavaScript.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser', action='store_true')
    parser.add_argument('--output', type=Path, default=Path('/workspace/THOT-INTERACTIVITE-TESTS'))
    args = parser.parse_args()
    static_checks()
    if args.browser:
        browser_checks(args.output)
