#!/usr/bin/env python3
"""Comparaison historique : références intactes, vrais boutons et repli sans JS."""
from pathlib import Path
import argparse
import json
import re
import subprocess
import sys
sys.dont_write_bytecode = True
from browser_fixture import ROOT, chromium, page_for, no_overflow


def static_checks():
    html = (ROOT / 'articles/puissance-etats-unis.html').read_text()
    old = subprocess.check_output(['git', 'show', '917714a:articles/puissance-etats-unis.html'], cwd=ROOT, text=True)
    pattern = r'<section class="comparateur-cas"[^>]*>([\s\S]*?)</section>'
    assert len(re.findall(pattern, html)) == 3
    assert re.findall(pattern, html) == re.findall(pattern, old), 'Ancienne fiche ou source modifiée'
    assert 'id="comparateur-reference-commandes" hidden' in html
    assert 'id="comparateur-simultane" hidden' in html
    assert 'L’Iran reste consultable seul' in html
    for target in ('ref9', 'ref10', 'ref18', 'ref15'):
        assert f'id="{target}"' in html
    amendments = json.loads((ROOT / 'docs/CORRECTIONS-SCIENTIFIQUES-THOT20.json').read_text())
    revised = [item for item in amendments['changes'] if item['path'] == 'articles/puissance-etats-unis.html']
    if revised:
        # La mission THOT 2.0 autorise une précision de fond, pas une simple UI.
        assert any('exclusion des autorités extérieures' in item['new'] and item['sources'] for item in revised)
        records = json.loads((ROOT / 'assets/article-editorial.json').read_text())['articles']
        record = next(item for item in records if item['slug'] == 'puissance-etats-unis')
        assert re.findall(r'"dateModified":\s*"([^"]+)"', html) == [record['editorial_updated']]
        assert 'Krasner' in record['editorial_scope']
    else:
        assert re.findall(r'"dateModified":\s*"([^"]+)"', html) == re.findall(r'"dateModified":\s*"([^"]+)"', old), 'Date scientifique avancée pour une seule modification d’interface'
    print('PASS : trois fiches strictement intactes, périmètre historique explicite, sources présentes, date cohérente avec le seul amendement scientifique autorisé.')


def check_cells(page, reference, other):
    table = page.locator('.comparateur-table')
    assert table.is_visible()
    assert table.locator('tbody tr').count() == 4
    assert table.locator('caption').bounding_box()['width'] >= table.bounding_box()['width'] - 2, 'Légende comprimée sur mobile'
    assert table.locator('#comparaison-reference').inner_text().startswith('Référence · ' + ('Afghanistan' if reference == 'afghanistan' else 'Daech'))
    assert table.locator('thead a').count() == 4
    for row in range(4):
        for column, key in enumerate((reference, other)):
            original = page.locator(f'[data-cas-panel="{key}"] .comparateur-reperes dd').nth(row)
            cell = table.locator('tbody tr').nth(row).locator('td').nth(column)
            assert cell.locator('div').inner_html() == original.inner_html(), 'Texte ou lien divergent dans la comparaison'
            for header in cell.get_attribute('headers').split():
                assert page.locator('#' + header).count() == 1
    for link in table.locator('a').all():
        assert page.locator(link.get_attribute('href')).count() == 1
    assert page.locator('.comparateur-cas:visible').count() == 0


def browser_checks(output):
    from playwright.sync_api import sync_playwright
    output.mkdir(parents=True, exist_ok=True)
    results = []
    with sync_playwright() as p:
        browser = chromium(p)
        for width in (320, 390, 768, 1440):
            context, page, errors = page_for(browser, 'articles/puissance-etats-unis.html', width)
            page.emulate_media(reduced_motion='reduce')
            root = page.locator('.comparateur-puissance')
            root.scroll_into_view_if_needed()
            status = page.locator('.comparateur-statut')
            pin = page.locator('#comparateur-reference')
            choices = page.locator('.comparateur-choix')
            assert page.locator('#comparateur-afghanistan').is_visible()
            assert not page.locator('#comparateur-simultane').is_visible()
            assert pin.is_enabled()
            pin.focus(); page.keyboard.press('Enter')
            assert pin.get_attribute('aria-pressed') == 'true'
            assert 'Choisissez Daech' in status.inner_text()
            assert page.evaluate('document.activeElement.id') == 'comparateur-reference'
            # Le choix reste volontaire : garder un cas ne sélectionne pas son voisin.
            choices.locator('[data-cas="daech"]').focus(); page.keyboard.press('Space')
            check_cells(page, 'afghanistan', 'daech')
            assert 'Référence conservée : Afghanistan. Cas comparé : Daech.' in status.inner_text()
            assert page.locator(':focus').get_attribute('data-cas') == 'daech'
            assert all(value == 'comparateur-simultane' for value in choices.locator('button').evaluate_all('(ns)=>ns.map(n=>n.getAttribute("aria-controls"))'))
            no_overflow(page)
            root.screenshot(path=str(output / f'puissance-{width}.png'))
            # Source navigable dans le vrai DOM, pas seulement une URL stockée.
            page.locator('.comparateur-table thead a[href="#ref15"]').click()
            assert page.evaluate('location.hash') == '#ref15'
            assert page.locator('#ref15').is_visible()
            pin.focus(); page.keyboard.press('Enter')
            assert pin.get_attribute('aria-pressed') == 'false'
            assert page.locator('#comparateur-daech').is_visible()
            assert not page.locator('#comparateur-simultane').is_visible()
            # Vérifier l’autre orientation de référence et le passage à l’Iran.
            page.keyboard.press('Space')
            choices.locator('[data-cas="afghanistan"]').click()
            check_cells(page, 'daech', 'afghanistan')
            choices.locator('[data-cas="iran"]').click()
            assert page.locator('#comparateur-iran').is_visible()
            assert pin.is_disabled()
            assert pin.get_attribute('aria-pressed') == 'false'
            assert not page.locator('#comparateur-simultane').is_visible()
            assert 'Étude affichée : Iran.' == status.inner_text()
            choices.locator('[data-cas="afghanistan"]').click()
            assert pin.is_enabled()
            assert pin.get_attribute('aria-pressed') == 'false'
            assert root.evaluate('(n)=>n.getAnimations({subtree:true}).length') == 0
            no_overflow(page)
            assert not errors, errors
            results.append({'width': width, 'ok': True, 'javascript_errors': errors})
            context.close()
        context, page, errors = page_for(browser, 'articles/puissance-etats-unis.html', 320, javascript=False)
        assert page.locator('.comparateur-cas:visible').count() == 3
        assert not page.locator('.comparateur-choix').is_visible()
        assert not page.locator('#comparateur-reference-commandes').is_visible()
        assert not page.locator('#comparateur-simultane').is_visible()
        for key in ('afghanistan', 'iran', 'daech'):
            assert page.locator(f'[data-cas-panel="{key}"] dd').count() == 4
        no_overflow(page)
        assert not errors, errors
        context.close()
        # Si le nouveau tableau est incomplet, le choix de fiche d’origine reste utilisable.
        context, page, errors = page_for(browser, 'articles/puissance-etats-unis.html', 390, javascript=False)
        page.evaluate("document.querySelector('#comparateur-simultane').remove()")
        page.evaluate((ROOT / 'assets/puissance-comparateur.js').read_text())
        assert not page.locator('#comparateur-reference-commandes').is_visible()
        assert page.locator('.comparateur-choix').is_visible()
        assert page.locator('#comparateur-afghanistan').is_visible()
        assert not errors, errors
        context.close(); browser.close()
    report = {'ok': True, 'views': results, 'keyboard': True, 'both_reference_orders': True,
              'source_links': True, 'incomplete_component_guard': True,
              'without_javascript': True, 'reduced_motion': True,
              'method': 'Chromium réel avec fixture locale des HTML/CSS/JS, sans navigation réseau.',
              'limits': ['Photographies externes non chargées.', 'Lecteur d’écran et téléphone physique non testés.']}
    (output / 'puissance-tests.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print('PASS : Chromium à 320/390/768/1440 px, référence dans les deux sens, quatre critères et sources exacts, Entrée/Espace natifs, focus, Iran séparé, repli sans JS, garde composant incomplet, aucun débordement ni erreur JavaScript.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser', action='store_true')
    parser.add_argument('--output', type=Path, default=Path('/workspace/THOT-INTERACTIVITE-TESTS'))
    args = parser.parse_args()
    static_checks()
    if args.browser:
        browser_checks(args.output)
