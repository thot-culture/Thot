#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Deux publications successives dans une copie temporaire du site complet.
Aucune page d'essai ne reste dans le dépôt ; --browser ajoute la recette HTTP.
"""
import portable_io
import argparse
from datetime import datetime, timezone
from html import escape
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
from urllib.request import urlopen
import xml.etree.ElementTree as ET
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://thot-culture.github.io/Thot/'


def run(root, *args):
    result = subprocess.run([sys.executable, *args], cwd=root, capture_output=True,
                            text=True, encoding='utf-8', timeout=90)
    if result.returncode:
        raise AssertionError(' '.join(args) + '\n' + result.stdout + result.stderr)
    return result.stdout.strip()


def load_seo(root):
    spec = importlib.util.spec_from_file_location('publication_seo', root / 'scripts/check-seo.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def record(number):
    slug = 'recette-temporaire-' + str(number)
    title = 'Article temporaire de recette ' + str(number)
    day = '2026-11-04' if number == 1 else '2026-11-06'
    return {'slug': slug, 'layout': 'authored', 'headline': title,
            'seo': {'title': title + ' | THOT', 'description': 'Page technique temporaire pour tester la publication ' + str(number) + '.'},
            'author': {'@type': 'Organization', 'name': 'La rédaction THOT'},
            'published': day, 'editorial_updated': day, 'editorial_scope': 'Recette temporaire, jamais publiée.',
            'social': {'title': title, 'description': 'Simulation technique de publication, sans contenu éditorial réel.',
                       'image': 'assets/' + slug + '.png', 'alt': 'Rectangle de test temporaire.'},
            'catalogue': {'category': 'histoire', 'label': 'Recette technique',
                          'keywords': 'recettetemporaire' + str(number), 'credit': 'Image de test créée localement, non publiée.'},
            'sources': {'ref1': {'kind': 'secondary', 'label': 'Documentation du site'}}}


def page(row):
    # Le texte répétitif sert seulement à exercer le calcul réel à 210 mots/min.
    text = ' '.join(['Texte technique temporaire destiné uniquement à la recette.'] * 90)
    return ('<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
            '<link rel="stylesheet" href="../assets/article.css"></head><body>'
            '<a class="skip-link" href="#texte-article">Aller à l’article</a>'
            '<header class="barre"><div class="largeur"><a class="marque" href="../index.html">THOT</a>'
            '<nav aria-label="Navigation principale"></nav></div></header>'
            '<main><header class="entete"><div class="largeur"><h1>' + escape(row['headline']) + '</h1>'
            '<div class="meta"><span>La rédaction THOT</span><span>Publié le <time datetime="' + row['published'] + '">' + row['published'] + '</time></span>'
            '<span id="duree">0 min de lecture</span></div></div></header>'
            '<div class="largeur"><article id="texte-article" tabindex="-1"><h2 id="explication">Recette de publication</h2>'
            '<p>' + text + '</p><p>Référence : <a href="#ref1">[1]</a>.</p>'
            '<figure class="thot-illustration"><div class="thot-illustration-photo"><img src="../' + row['social']['image'] + '" width="1200" height="630" alt="Rectangle technique temporaire."></div><figcaption class="thot-illustration-caption">Image de recette, jamais publiée.</figcaption></figure>'
            '<section class="sources"><h2>Sources de cette recette</h2><ol><li id="ref1"><a href="../notre-methode.html">Méthode THOT</a></li></ol></section>'
            '</article></div></main><footer><p>Recette temporaire non publiée.</p></footer></body></html>')


def browser_check(root, row, total):
    from playwright.sync_api import sync_playwright
    server = subprocess.Popen([sys.executable, 'scripts/preview.py', '--port', '8879'], cwd=root,
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(100):
            try:
                with urlopen('http://127.0.0.1:8879/Thot/', timeout=1) as response:
                    assert response.status == 200
                break
            except OSError:
                if server.poll() is not None:
                    raise RuntimeError('Le serveur de recette ne démarre pas')
                time.sleep(.1)
        with sync_playwright() as pw:
            options = {'headless': True}
            if os.environ.get('THOT_BROWSER_EXECUTABLE'):
                options['executable_path'] = os.environ['THOT_BROWSER_EXECUTABLE']
            browser = pw.chromium.launch(**options)
            checks = []
            for width in (390, 1440):
                current = browser.new_page(viewport={'width': width, 'height': 900})
                errors = []
                current.on('pageerror', lambda error: errors.append(str(error)))
                response = current.goto('http://127.0.0.1:8879/Thot/bibliotheque.html')
                assert response.status == 200
                assert current.locator('.article-card').count() == total
                current.locator('#article-search').fill(row['catalogue']['keywords'])
                current.wait_for_function("document.querySelectorAll('.article-card:not([hidden])').length === 1")
                assert current.locator('.article-card:visible').count() == 1
                current.locator('a[href="articles/' + row['slug'] + '.html"]').click()
                assert current.url.endswith('/articles/' + row['slug'] + '.html')
                assert current.title() == row['seo']['title']
                assert current.locator('h1').inner_text() == row['headline']
                current.wait_for_function('Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)')
                assert current.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
                assert '0 min' not in current.locator('#duree').inner_text()
                current.locator('a[href="#ref1"]').click()
                assert current.locator('#ref1').is_visible()
                if width == 390:
                    button = current.locator('#mobile-menu-button')
                    button.focus()
                    current.keyboard.press('Enter')
                    assert button.get_attribute('aria-expanded') == 'true'
                    current.keyboard.press('Escape')
                    assert current.evaluate('document.activeElement.id') == 'mobile-menu-button'
                assert not errors, errors
                checks.append({'width': width, 'search_card_article_image_reference_menu': 'PASS'})
                current.close()
            version = browser.version
            browser.close()
            return {'browser': version, 'checks': checks}
    finally:
        server.terminate()
        server.wait(timeout=5)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser', action='store_true')
    parser.add_argument('--output', type=Path, default=ROOT / 'work/publication-integration.json')
    args = parser.parse_args()
    report = {'checked_utc': datetime.now(timezone.utc).isoformat(), 'publications': []}
    with tempfile.TemporaryDirectory(prefix='THOT deux publications ') as folder:
        root = Path(folder) / 'site'
        shutil.copytree(ROOT, root, ignore=shutil.ignore_patterns('.git', 'work', '__pycache__', 'node_modules'))
        config_path = root / 'assets/article-editorial.json'
        config = json.loads(config_path.read_text(encoding='utf-8'))
        original_records = json.loads(config_path.read_text(encoding='utf-8'))['articles']
        originals = {p.relative_to(root): p.read_bytes() for p in (root / 'articles').glob('*.html')}
        ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        original_urls = {n.text for n in ET.parse(root / 'sitemap.xml').findall('s:url/s:loc', ns)}
        new_urls = set()
        for number in (1, 2):
            row = record(number)
            config['articles'].append(row)
            config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            (root / 'articles' / (row['slug'] + '.html')).write_text(page(row), encoding='utf-8')
            Image.new('RGB', (1200, 630), '#e8dfce').save(root / row['social']['image'])
            commands = [('scripts/update-article-editorial.py', '--write'), ('scripts/sync-publication.py', '--write'),
                        ('scripts/update-reading-times.py',), ('scripts/site_chrome.py',),
                        ('scripts/update-article-editorial.py', '--check'), ('scripts/sync-publication.py', '--check'),
                        ('scripts/update-reading-times.py', '--check'), ('scripts/site_chrome.py', '--check'),
                        ('scripts/check-seo.py',)]
            for command in commands:
                run(root, *command)
            static = subprocess.run(['node', 'scripts/check-site.mjs'], cwd=root, capture_output=True,
                                    text=True, encoding='utf-8', timeout=60)
            assert static.returncode == 0, static.stdout + static.stderr
            seo = load_seo(root)
            document = seo.Page((root / 'articles' / (row['slug'] + '.html')).read_text(encoding='utf-8'))
            schema = next(s for s in document.schemas if s.get('@type') == 'Article')
            url = BASE + 'articles/' + row['slug'] + '.html'
            assert document.canonical == [url]
            assert schema['datePublished'] == schema['dateModified'] == row['published']
            library = (root / 'bibliotheque.html').read_text(encoding='utf-8')
            assert library.count('href="articles/' + row['slug'] + '.html"') == 1
            new_urls.add(url)
            entries = ET.parse(root / 'sitemap.xml').findall('s:url', ns)
            assert {entry.findtext('s:loc', namespaces=ns) for entry in entries} == original_urls | new_urls
            assert len(entries) == len(original_urls) + number
            assert next(e.findtext('s:lastmod', namespaces=ns) for e in entries if e.findtext('s:loc', namespaces=ns) == url) == row['published']
            times = json.loads((root / 'assets/reading-times.json').read_text(encoding='utf-8'))['articles'][row['slug']]
            assert times['words'] >= 420 and times['minutes'] >= 2
            assert all((root / name).read_bytes() == body for name, body in originals.items())
            assert config['articles'][:len(original_records)] == original_records
            item = {'number': number, 'articles': len(original_records) + number,
                    'sitemap_urls': len(entries), 'metadata_sources_images_dates': 'PASS',
                    'old_articles_unchanged': True, 'reading': times, 'idempotence': 'PASS'}
            if args.browser:
                item['browser'] = browser_check(root, row, len(original_records) + number)
            report['publications'].append(item)
            originals[Path('articles') / (row['slug'] + '.html')] = (root / 'articles' / (row['slug'] + '.html')).read_bytes()
        temporary = root
    report['temporary_copy_removed'] = not temporary.exists()
    assert report['temporary_copy_removed']
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('PASS : deux publications successives ; métadonnées, bibliothèque, sitemap, durées et conservation ; copie temporaire supprimée.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
