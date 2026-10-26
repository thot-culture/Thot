#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Repère au repos et clavier du schéma qualitatif réel, sans copie de figure tierce."""
import portable_io  # Encodage CLI stable, sans dépendance système.
from pathlib import Path
import argparse
import json
import re
import subprocess
import sys
sys.dont_write_bytecode = True
from browser_fixture import ROOT, chromium, page_for, no_overflow


def static_checks():
    html = (ROOT / 'articles/pieuvres-couleur.html').read_text(encoding="utf-8")
    old = subprocess.check_output(['git', 'show', '917714a:articles/pieuvres-couleur.html'], cwd=ROOT, text=True, encoding="utf-8")
    assert re.findall(r'<script>([\s\S]*?)</script>', html) == re.findall(r'<script>([\s\S]*?)</script>', old), 'Ancien script du curseur modifié'
    assert 'Schéma qualitatif, non à l’échelle' in html
    assert 'le curseur n’indique pas une mesure biologique' in html
    assert 'id="chromato-reperes"' in html
    assert 'id="chromato-etats-statiques"' in html
    reference = re.search(r'<g id="chromato-reference"[\s\S]*?</g>', html)[0]
    assert reference.count('rx="26" ry="22"') == 2
    assert 'aria-hidden="true"' in reference
    print('PASS : script existant identique, repère de repos fixe, limites explicites et deux états statiques.')


def browser_checks(output):
    from playwright.sync_api import sync_playwright
    output.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as p:
        browser = chromium(p)
        for width in (320, 390, 768, 1440):
            context, page, errors = page_for(browser, 'articles/pieuvres-couleur.html', width)
            page.emulate_media(reduced_motion='reduce')
            figure = page.locator('.chromato-interactif')
            figure.scroll_into_view_if_needed()
            slider = page.locator('#chromato-curseur')
            assert not slider.is_disabled()
            assert page.locator('#chromato-modele').is_visible()
            assert page.locator('#chromato-reperes').is_visible()
            reference = page.locator('#chromato-reference').inner_html()
            slider.focus(); page.keyboard.press('Home')
            assert slider.input_value() == '0'
            rest = page.locator('#chromato-fibres').evaluate('(n)=>[...n.children].map(l=>Math.hypot(+l.getAttribute("x2")-l.getAttribute("x1"),+l.getAttribute("y2")-l.getAttribute("y1")))')
            rest_x = float(page.locator('#chromato-sac').get_attribute('rx'))
            page.keyboard.press('End')
            assert slider.input_value() == '100'
            active = page.locator('#chromato-fibres').evaluate('(n)=>[...n.children].map(l=>Math.hypot(+l.getAttribute("x2")-l.getAttribute("x1"),+l.getAttribute("y2")-l.getAttribute("y1")))')
            assert len(rest) == len(active) == 16
            assert all(b < a for a, b in zip(rest, active)), 'Les fibres ne raccourcissent pas'
            assert float(page.locator('#chromato-sac').get_attribute('rx')) > rest_x
            assert page.locator('#chromato-reference').inner_html() == reference, 'Référence de repos déplacée'
            assert slider.get_attribute('aria-valuetext') == 'Très étalé'
            assert page.evaluate('document.activeElement.id') == 'chromato-curseur'
            page.keyboard.press('ArrowLeft')
            assert slider.input_value() == '99'
            assert figure.evaluate('(n)=>n.getAnimations({subtree:true}).length') == 0
            no_overflow(page)
            figure.screenshot(path=str(output / f'pieuvres-{width}.png'))
            assert not errors, errors
            results.append({'width': width, 'ok': True, 'javascript_errors': errors})
            context.close()
        context, page, errors = page_for(browser, 'articles/pieuvres-couleur.html', 320, javascript=False)
        assert page.locator('#chromato-curseur').is_disabled()
        assert page.locator('#chromato-etats-statiques').is_visible()
        assert page.locator('#chromato-etats-statiques svg').count() == 2
        assert page.locator('#chromato-etats-statiques figure figcaption').count() == 2
        no_overflow(page)
        page.locator('.chromato-interactif').screenshot(path=str(output / 'pieuvres-sans-js.png'))
        assert not errors, errors
        context.close(); browser.close()
    report = {'ok': True, 'views': results, 'keyboard': True, 'reference_invariant': True,
              'reduced_motion': True, 'without_javascript': True,
              'method': 'Chromium réel avec fixture locale CSS/JS réels, sans navigation réseau.',
              'limits': ['Photographies externes non chargées.', 'Lecteur d’écran et téléphone physique non testés.']}
    (output / 'pieuvres-tests.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding="utf-8")
    print('PASS : Chromium à 320/390/768/1440 px, Home/End/flèche réels, fibres raccourcies et sac étalé, référence fixe, réduction des animations, sans JS, aucun débordement ni erreur JavaScript.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser', action='store_true')
    parser.add_argument('--output', type=Path, default=ROOT.parent / 'THOT-INTERACTIVITE-TESTS')
    args = parser.parse_args()
    static_checks()
    if args.browser:
        browser_checks(args.output)
