#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Vérifier l'ajout d'article, les oublis, les doublons et la conservation."""
import portable_io
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

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
            "social": {"image": "assets/card.png", "alt": "Une image", "title": "Un titre",
                       "description": 'Une description <lisible> & sourcée'},
            "catalogue": {"category": "histoire", "label": "Histoire", "keywords": "essai",
                          "credit": "Création THOT, droits vérifiés dans la notice"}}
        self.config = {"base_url": self.base, "editorial_updated": "2026-11-03",
                       "articles": [self.record]}
        self.save()
        (self.root / "assets/card.png").write_bytes(b"test")
        self.page("articles/essai-1917.html")
        self.page("index.html")
        (self.root / "bibliotheque.html").write_text(
            '<link rel="canonical" href="' + self.base + 'bibliotheque.html">'
            '<strong id="article-total">0</strong><p class="results-status" id="results-status">0 articles disponibles</p>'
            '<div id="article-results" class="article-grid"></div>', encoding="utf-8")
        (self.root / "sitemap.xml").write_text(
            '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
            encoding="utf-8")

    def save(self):
        (self.root / "assets/article-editorial.json").write_text(json.dumps(self.config), encoding="utf-8")

    def page(self, name):
        url = self.base if name == "index.html" else self.base + name
        (self.root / name).write_text('<link rel="canonical" href="' + url + '"><main><h1>Texte</h1></main>', encoding="utf-8")

    def test_add_and_repeat_without_changing_existing_cards(self):
        planned = sync.outputs(self.root)
        library = planned[self.root / "bibliotheque.html"]
        self.assertIn('href="articles/essai-1917.html"', library)
        self.assertIn("&lt;lisible&gt; &amp; sourcée", library)
        self.assertIn('id="article-total">1', library)
        self.assertIn(self.base + "articles/essai-1917.html", planned[self.root / "sitemap.xml"])
        for path, value in planned.items():
            path.write_text(value, encoding="utf-8")
        self.assertEqual(sync.outputs(self.root), planned)

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

    def test_stale_sitemap_is_never_deleted_silently(self):
        path = self.root / "sitemap.xml"
        value = path.read_text(encoding="utf-8").replace("</urlset>",
            "<url><loc>" + self.base + "ancienne.html</loc></url></urlset>")
        path.write_text(value, encoding="utf-8")
        with self.assertRaises(ValueError):
            sync.outputs(self.root)
        self.assertEqual(path.read_text(encoding="utf-8"), value)

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


if __name__ == "__main__":
    unittest.main()
