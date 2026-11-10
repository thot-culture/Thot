#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Vérifier l'ajout d'article, les oublis, les doublons et la conservation."""
import portable_io
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from PIL import Image

HERE = Path(__file__).resolve().parent


def module(filename):
    spec = importlib.util.spec_from_file_location(filename, HERE / filename)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


sync = module("sync-publication.py")
conservation = module("check-conservation.py")


class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="THOT publication ")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "articles").mkdir()
        (self.root / "assets").mkdir()
        self.base = "https://thot-culture.github.io/Thot/"
        self.record = {"slug": "essai-1917", "published": "2026-11-03",
            "author": {"name": "La rédaction THOT"},
            "social": {"image": "assets/card.png", "alt": "Une image", "title": "Un titre",
                       "description": 'Une description <lisible> & sourcée'},
            "catalogue": {"category": "histoire", "label": "Histoire", "keywords": "essai",
                          "credit": "Création THOT, droits vérifiés dans la notice",
                          "image": {"src": "assets/cover.webp", "alt": "Une gravure", "width": 32, "height": 20}}}
        self.config = {"base_url": self.base, "editorial_updated": "2026-11-03",
                       "articles": [self.record], "home_articles": [self.record["slug"]]}
        self.save()
        Image.new("RGB", (32, 20)).save(self.root / "assets/cover.webp")
        (self.root / "assets/reading-times.json").write_text('{"articles":{"essai-1917":{"minutes":3}}}', encoding="utf-8")
        self.page("articles/essai-1917.html")
        self.page("index.html")
        with (self.root / "index.html").open("a", encoding="utf-8") as home:
            home.write('<!-- catalogue:une:debut --><!-- catalogue:une:fin -->'
                       '<!-- catalogue:selection:debut --><!-- catalogue:selection:fin -->')
        (self.root / "bibliotheque.html").write_text(
            '<link rel="canonical" href="' + self.base + 'bibliotheque.html">'
            '<strong id="article-total">0</strong><p class="results-status" id="results-status">0 articles disponibles</p>'
            '<div id="article-results" class="article-grid">'
            '<!-- catalogue:bibliotheque:debut --><!-- catalogue:bibliotheque:fin --></div>', encoding="utf-8")
        (self.root / "sitemap.xml").write_text(
            '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
            encoding="utf-8")

    def save(self):
        (self.root / "assets/article-editorial.json").write_text(json.dumps(self.config), encoding="utf-8")

    def page(self, name):
        url = self.base if name == "index.html" else self.base + name
        (self.root / name).write_text('<link rel="canonical" href="' + url + '"><main><h1>Texte</h1></main>', encoding="utf-8")

    def test_render_both_pages_and_repeat_without_changes(self):
        planned = sync.outputs(self.root)
        library = planned[self.root / "bibliotheque.html"]
        home = planned[self.root / "index.html"]
        for page in (library, home):
            self.assertIn('href="articles/essai-1917.html"', page)
            self.assertIn("&lt;lisible&gt; &amp; sourcée", page)
            self.assertIn('src="assets/cover.webp" alt="Une gravure" width="32" height="20"', page)
            self.assertIn('3 min de lecture', page)
        self.assertIn('id="article-total">1', library)
        self.assertIn(self.base + "articles/essai-1917.html", planned[self.root / "sitemap.xml"])
        self.assertIn('<lastmod>2026-11-03</lastmod>', planned[self.root / 'sitemap.xml'])
        for path, value in planned.items():
            path.write_text(value, encoding="utf-8")
        self.assertEqual(sync.outputs(self.root), planned)

    def test_sitemap_uses_explicit_editorial_date_without_touching_other_pages(self):
        self.record['editorial_updated'] = '2026-11-04'
        self.save()
        planned = sync.outputs(self.root)
        self.assertIn('<lastmod>2026-11-04</lastmod>', planned[self.root / 'sitemap.xml'])
        self.assertNotIn('<loc>' + self.base + '</loc><lastmod>', planned[self.root / 'sitemap.xml'])

    def test_unregistered_article_is_rejected(self):
        self.page("articles/oublie.html")
        with self.assertRaises(ValueError):
            sync.outputs(self.root)

    def test_duplicate_record_is_rejected(self):
        self.config["articles"].append(self.record)
        self.save()
        with self.assertRaises(ValueError):
            sync.outputs(self.root)

    def test_missing_credit_is_rejected(self):
        del self.record["catalogue"]["credit"]
        self.save()
        with self.assertRaises(ValueError):
            sync.outputs(self.root)

    def test_missing_or_broken_illustration_is_rejected(self):
        image = self.root / self.record["catalogue"]["image"]["src"]
        image.unlink()
        with self.assertRaisesRegex(ValueError, "manquante"):
            sync.outputs(self.root)
        image.write_bytes(b"corrompu")
        with self.assertRaisesRegex(ValueError, "illisible"):
            sync.outputs(self.root)

    def test_stale_sitemap_is_never_deleted_silently(self):
        path = self.root / "sitemap.xml"
        value = path.read_text(encoding="utf-8").replace("</urlset>",
            "<url><loc>" + self.base + "ancienne.html</loc></url></urlset>")
        path.write_text(value, encoding="utf-8")
        with self.assertRaises(ValueError):
            sync.outputs(self.root)
        self.assertEqual(path.read_text(encoding="utf-8"), value)

    def test_responsive_cover_keeps_dimensions_credit_and_crop(self):
        image = self.record['catalogue']['image']
        Image.new('RGB', (16, 10)).save(self.root / 'assets/small.webp')
        image['variants'] = [{'src':'assets/small.webp','width':16,'height':10}]
        image['position'] = '50% 45%'
        self.save()
        home = sync.outputs(self.root)[self.root / 'index.html']
        self.assertIn('srcset="assets/small.webp 16w, assets/cover.webp 32w"', home)
        self.assertIn('width="32" height="20"', home)
        self.assertIn('--cover-position:50% 45%', home)
        self.assertIn(self.record['catalogue']['credit'], home)

    def test_invalid_variant_and_crop_are_rejected(self):
        image = self.record['catalogue']['image']
        image['variants'] = [{'src':'assets/absent.webp','width':16,'height':10}]
        self.save()
        with self.assertRaisesRegex(ValueError, 'Variante locale manquante'):
            sync.outputs(self.root)
        Image.new('RGB', (16, 16)).save(self.root / 'assets/absent.webp')
        image['variants'][0]['height'] = 16
        self.save()
        with self.assertRaisesRegex(ValueError, 'Proportions de variante'):
            sync.outputs(self.root)
        del image['variants']
        image['position'] = '50% 150%'
        self.save()
        with self.assertRaisesRegex(ValueError, 'Position de couverture'):
            sync.outputs(self.root)

    def test_content_change_is_detected_but_generated_duration_is_normalized(self):
        before = '<main><p>Un fait sourcé.</p><span>9 min de lecture</span></main>'
        self.assertEqual(conservation.protected(before), conservation.protected(before.replace("9 min", "8 min")))
        self.assertNotEqual(conservation.protected(before), conservation.protected(before.replace("Un fait", "Un autre fait")))
        self.assertNotEqual(conservation.protected(before), conservation.protected(before.replace("<p>", '<p id="nouveau">')))

    def test_only_documented_link_repair_is_accepted(self):
        repair = json.loads((HERE.parent / "docs/audit-final/liens-repares.json").read_text(encoding="utf-8"))[0]
        before = '<main><a href="' + repair["old"] + '">Source</a></main>'
        after = before.replace(repair["old"], repair["new"])
        self.assertEqual(conservation.protected(before, repair["path"]), conservation.protected(after, repair["path"]))
        with self.assertRaises(ValueError):
            conservation.protected(before.replace(repair["old"], "https://example.org/"), repair["path"])

    def test_only_six_documented_heading_levels_can_change(self):
        changes = json.loads((HERE.parent / 'docs/stabilisation/modifications-structurelles.json').read_text(encoding='utf-8'))['changes']
        self.assertEqual(len(changes), 6)
        path = changes[0]['path']
        before = '<main><p>Un fait sourcé.</p>' + ''.join(c['old'] for c in changes) + '</main>'
        after = '<main><p>Un fait sourcé.</p>' + ''.join(c['new'] for c in changes) + '</main>'
        self.assertEqual(conservation.protected(before, path), conservation.protected(after, path))
        self.assertNotEqual(conservation.protected(before, path), conservation.protected(after.replace('Un fait', 'Un autre fait'), path))
        with self.assertRaises(ValueError):
            conservation.protected(after.replace(changes[0]['new'], '<h3>Un titre inventé</h3>'), path)


if __name__ == "__main__":
    unittest.main()
