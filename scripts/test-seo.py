#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Régressions : publication d'un article, métadonnées et découverte locale."""
import portable_io
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from PIL import Image

HERE = Path(__file__).resolve().parent


def module(name):
    spec = importlib.util.spec_from_file_location(name, HERE / name)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


seo = module('check-seo.py')
editorial = module('update-article-editorial.py')


class SEOTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='THOT SEO ')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for directory in ('assets', 'articles', 'explorer'):
            (self.root / directory).mkdir()
        self.base = 'https://thot-culture.github.io/Thot/'
        self.record = {'slug': 'nouveau-1917', 'layout': 'authored',
                       'published': '2026-10-27', 'editorial_updated': '2026-10-28',
                       'seo': {'title': 'Une question & sa réponse | THOT', 'description': 'Un sujet expliqué.'},
                       'headline': 'Une question pédagogique',
                       'author': {'@type': 'Organization', 'name': 'La rédaction THOT'},
                       'social': {'title': 'Une question', 'description': 'Un éclairage sourcé.',
                                  'image': 'assets/card.png', 'alt': 'Une illustration géométrique.'},
                       'sources': {'ref1': {'kind': 'primary', 'label': 'Document'}}}
        self.config = {'base_url': self.base, 'editorial_updated': '2026-10-28',
                       'editorial_scope': 'Publication de test.', 'articles': [self.record]}
        (self.root / 'assets/article-editorial.json').write_text(json.dumps(self.config), encoding='utf-8')
        Image.new('RGB', (1200, 630), 'white').save(self.root / 'assets/card.png')
        self.article = self.root / 'articles/nouveau-1917.html'
        self.raw = ('<html><head></head><body><main><h1>Une question pédagogique</h1>'
                    '<p>La rédaction THOT</p><p>Publié le <time datetime="2026-10-27">27 octobre 2026</time></p>'
                    '<p>Mis à jour le <time datetime="2026-10-28">28 octobre 2026</time></p>'
                    '<p>Un fait sourcé.<a href="#ref1">[1]</a></p><ol><li id="ref1">Source documentaire</li></ol>'
                    '<a href="../index.html">Accueil</a></main></body></html>')
        self.article.write_text(editorial.update(self.raw, self.record, self.config), encoding='utf-8')
        home = ('<head><title>Accueil | THOT</title><meta name="description" content="Une bibliothèque pédagogique.">'
                '<link rel="canonical" href="' + self.base + '">'
                '<meta property="og:url" content="' + self.base + '">'
                '<meta property="og:type" content="website"><meta property="og:title" content="Accueil">'
                '<meta property="og:description" content="Présentation"><meta property="og:image" content="' + self.base + 'assets/card.png">'
                '<meta property="og:image:alt" content="Illustration THOT">'
                '<script type="application/ld+json">{"@type":"WebSite"}</script></head>'
                '<body><h1>Accueil</h1><a href="articles/nouveau-1917.html">Un nouvel article</a></body>')
        (self.root / 'index.html').write_text(home, encoding='utf-8')
        (self.root / 'sitemap.xml').write_text('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                '<url><loc>' + self.base + '</loc></url><url><loc>' + self.base + 'articles/nouveau-1917.html</loc></url></urlset>', encoding='utf-8')

    def mutate(self, old, new):
        self.article.write_text(self.article.read_text(encoding='utf-8').replace(old, new), encoding='utf-8')

    def test_new_article_needs_no_handwritten_seo_and_is_idempotent(self):
        self.assertEqual(seo.audit(self.root)['errors'], [])
        page = self.article.read_text(encoding='utf-8')
        self.assertEqual(editorial.update(page, self.record, self.config), page)
        self.assertIn('<p>Un fait sourcé.', page)
        parsed = seo.Page(page)
        self.assertEqual(parsed.titles, [self.record['seo']['title']])
        self.assertEqual(parsed.schemas[0]['dateModified'], '2026-10-28')
        self.assertEqual(parsed.schemas[0]['author']['name'], 'La rédaction THOT')

    def test_svg_title_does_not_replace_html_title(self):
        page = seo.Page('<head><title>Le titre HTML</title></head><svg><title>Une carte</title></svg>')
        self.assertEqual(page.titles, ['Le titre HTML'])

    def test_h1_disagreement_is_not_silently_rewritten(self):
        with self.assertRaises(ValueError):
            editorial.update(self.raw.replace('Une question pédagogique', 'Un autre sujet'), self.record, self.config)

    def test_published_noindex_is_rejected(self):
        self.mutate('</head>', '<meta name="robots" content="noindex"></head>')
        self.assertTrue(any('noindex' in e for e in seo.audit(self.root)['errors']))

    def test_canonical_losing_project_prefix_is_rejected(self):
        self.mutate(self.base + 'articles/nouveau-1917.html', 'https://thot-culture.github.io/articles/nouveau-1917.html')
        self.assertTrue(any('canonique' in e for e in seo.audit(self.root)['errors']))

    def test_orphan_article_is_rejected(self):
        home = self.root / 'index.html'
        home.write_text(home.read_text(encoding='utf-8').replace('href="articles/nouveau-1917.html"', 'href="#"'), encoding='utf-8')
        self.assertTrue(any('sans lien entrant' in e for e in seo.audit(self.root)['errors']))

    def test_broken_anchor_and_resource_are_rejected(self):
        self.mutate('href="#ref1"', 'href="#ref2"')
        (self.root / 'assets/card.png').unlink()
        errors = seo.audit(self.root)['errors']
        self.assertTrue(any('ancre interne' in e for e in errors))
        self.assertTrue(any('ressource locale absente' in e for e in errors))

    def test_duplicate_description_is_rejected(self):
        self.mutate('</head>', '<meta name="description" content="Une deuxième description"></head>')
        self.assertTrue(any('description' in e for e in seo.audit(self.root)['errors']))

    def test_missing_visible_date_is_rejected(self):
        self.mutate('<time datetime="2026-10-28">', '<time>')
        self.assertTrue(any('date éditoriale absente' in e for e in seo.audit(self.root)['errors']))

    def test_wrong_social_image_dimensions_are_rejected(self):
        Image.new('RGB', (320, 200), 'white').save(self.root / 'assets/card.png')
        self.assertTrue(any('1200 × 630' in e for e in seo.audit(self.root)['errors']))

    def test_sitemap_omission_is_rejected(self):
        sitemap = self.root / 'sitemap.xml'
        sitemap.write_text('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', encoding='utf-8')
        self.assertTrue(any('sitemap.xml' in e for e in seo.audit(self.root)['errors']))

    def test_json_ld_cannot_close_script(self):
        self.record['social']['description'] = 'Une description </script> littérale.'
        page = editorial.update(self.raw, self.record, self.config)
        self.assertEqual(len(seo.Page(page).schemas), 1)
        self.assertIn('\\u003c/script>', page)


if __name__ == '__main__':
    unittest.main()
