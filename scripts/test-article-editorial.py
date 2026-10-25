#!/usr/bin/env python3
"""Contrôles statiques indépendants des cinq articles THOT (Python + Pillow).

Ne lance ni générateur ni navigateur et n'effectue aucun accès réseau.
Comparer aussi une future publication : --head <révision>, avec --revision
pour choisir la sauvegarde de départ. Les tests visuels et le comportement
réel des API de partage doivent faire l'objet de vérifications séparées.
"""
import argparse
from collections import Counter
from datetime import date
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import unittest
from urllib.parse import urlsplit

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SLUGS = {"autorite", "autrices-pseudonymes", "pieuvres-couleur",
         "puissance-etats-unis", "roubaix-1917"}
PUBLIC_BASE = "https://thot-culture.github.io/Thot/"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr"}


class Element:
    def __init__(self, tag, attrs=(), parent=None):
        self.tag, self.attrs, self.parent = tag, dict(attrs), parent
        self.children = []

    def descendants(self, tag=None):
        for child in self.children:
            if isinstance(child, Element):
                if tag is None or child.tag == tag:
                    yield child
                yield from child.descendants(tag)

    def has_class(self, name):
        return name in self.attrs.get("class", "").split()

    def text(self, omit=None):
        if omit and omit(self):
            return ""
        return " ".join(child.text(omit) if isinstance(child, Element) else child
                        for child in self.children)


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Element("document")
        self.stack = [self.root]
        self.feed(source)
        self.close()
        self.elements = list(self.root.descendants())

    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs, self.stack[-1])
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack = self.stack[:index]
                break

    def handle_data(self, value):
        self.stack[-1].children.append(value)

    def select(self, tag=None, **attrs):
        return [node for node in self.elements
                if (tag is None or node.tag == tag)
                and all(node.attrs.get(key) == value for key, value in attrs.items())]


def clean(text):
    return " ".join(text.split())


def readable_date(value):
    parsed = date.fromisoformat(value)
    months = ("janvier", "février", "mars", "avril", "mai", "juin",
              "juillet", "août", "septembre", "octobre", "novembre", "décembre")
    return f"{parsed.day} {months[parsed.month - 1]} {parsed.year}"


def no_duplicate_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Clé JSON dupliquée : {key}")
        result[key] = value
    return result


def read_json(text):
    return json.loads(text, object_pairs_hook=no_duplicate_keys)


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True,
                                   timeout=10)


def article_json(document):
    blocks = [read_json(node.text()) for node in document.select(
        "script", type="application/ld+json")]
    return [block for block in blocks
            if isinstance(block, dict) and block.get("@type") == "Article"]


def references(document):
    return [node for node in document.select("li")
            if re.fullmatch(r"ref[1-9]\d*", node.attrs.get("id", ""))]


def sources_without_labels(node):
    return clean(node.text(lambda item: item.has_class("source-type")))


def external_assets(document, tag, attribute):
    def reference(value):
        # La version de cache de la feuille modifiée peut évoluer, pas son chemin.
        return value.split('?')[0] if value.split('?')[0] in {
            '../assets/pieuvres.css', '../assets/puissance-comparateur.css',
            '../assets/puissance-comparateur.js', '../assets/quiz-autrices.js'} else value
    return [reference(node.attrs[attribute]) for node in document.select(tag)
            if attribute in node.attrs and
            (tag != "link" or "stylesheet" in node.attrs.get("rel", "").split())]


class EditorialTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = read_json((ROOT / "assets/article-editorial.json").read_text())
        cls.records = cls.config["articles"]
        cls.pages, cls.originals = {}, {}
        for record in cls.records:
            slug = record["slug"]
            path = f"articles/{slug}.html"
            cls.pages[slug] = Document((ROOT / path).read_text())
            cls.originals[slug] = Document(git("show", f"{OPTIONS.revision}:{path}"))

    def one(self, nodes, message):
        self.assertEqual(len(nodes), 1, message)
        return nodes[0]

    def visible_without_js(self, node):
        while node:
            self.assertNotIn("hidden", node.attrs)
            self.assertNotEqual(node.attrs.get("aria-hidden"), "true")
            node = node.parent

    def test_inventory_and_publication_urls(self):
        self.assertEqual(len(self.records), 5)
        self.assertEqual({row["slug"] for row in self.records}, SLUGS)
        self.assertEqual(self.config["base_url"], PUBLIC_BASE)
        self.assertEqual({path.stem for path in (ROOT / "articles").glob("*.html")}, SLUGS)
        images = [row["social"]["image"] for row in self.records]
        self.assertEqual(len(images), len(set(images)))
        self.assertEqual(date.fromisoformat(self.config["editorial_updated"]).isoformat(),
                         self.config["editorial_updated"])

    def test_science_is_visible_concise_and_sourced(self):
        for record in self.records:
            with self.subTest(article=record["slug"]):
                doc = self.pages[record["slug"]]
                science = self.one(doc.select("section", id="reperes-scientifiques"),
                                   "Un seul encadré scientifique attendu")
                self.visible_without_js(science)
                heading_id = science.attrs.get("aria-labelledby")
                self.assertTrue(heading_id)
                self.one(doc.select("h2", id=heading_id), "Titre accessible de l’encadré absent")
                self.assertLessEqual(len(clean(science.text()).split()), 350,
                                     "Encadré trop long pour un repère concis")
                headings = list(science.descendants("h3"))
                self.assertEqual([clean(node.text()) for node in headings],
                                 ["Ce qu’on sait", record["discussion_title"]])
                self.assertTrue(record["discussion_note"].strip())
                self.assertIn(record["discussion_note"], clean(science.text()))
                ids = {node.attrs.get("id") for node in doc.elements}
                for heading, configured in zip(headings, [record["known"], record["discussion"]]):
                    section = heading.parent
                    self.assertEqual(section.tag, "section")
                    self.assertTrue(heading.attrs.get("id"))
                    self.assertEqual(section.attrs.get("aria-labelledby"), heading.attrs.get("id"))
                    rows = list(section.descendants("li"))
                    self.assertIn(len(rows), (1, 2))
                    self.assertEqual(len(rows), len(configured))
                    for row, point in zip(rows, configured):
                        self.assertLessEqual(len(point["text"].split()), 75)
                        self.assertEqual(clean(row.text(lambda node: node.tag == "a")),
                                         clean(point["text"]))
                        links = list(row.descendants("a"))
                        self.assertTrue(links, "Chaque point doit citer ses sources")
                        self.assertEqual([link.attrs.get("href") for link in links],
                                         [f"#ref{number}" for number in point["refs"]])
                        for link in links:
                            self.assertIn(link.attrs["href"][1:], ids)
                            self.assertTrue(link.attrs.get("aria-label"))
                for node in science.descendants():
                    self.assertNotIn(node.tag, {"script", "button", "iframe"})
                sources = self.one([node for node in doc.select("section") if node.has_class("sources")],
                                   "Bibliographie absente")
                self.assertLess(doc.elements.index(science), doc.elements.index(sources))

    def test_bibliography_is_qualified_and_preserved(self):
        for record in self.records:
            with self.subTest(article=record["slug"]):
                current = references(self.pages[record["slug"]])
                previous = references(self.originals[record["slug"]])
                ids = [node.attrs["id"] for node in current]
                self.assertEqual(ids, [node.attrs["id"] for node in previous])
                self.assertEqual(ids, [f"ref{i}" for i in range(1, len(ids) + 1)])
                self.assertEqual(set(ids), set(record["sources"]))
                for node, old in zip(current, previous):
                    labels = [child for child in node.descendants("span")
                              if child.has_class("source-type")]
                    label = self.one(labels, f"Qualification unique attendue dans {node.attrs['id']}")
                    expected = record["sources"][node.attrs["id"]]
                    self.assertIn(expected["kind"], {"primary", "secondary", "complement", "mixed"})
                    self.assertEqual(label.attrs.get("data-source-kind"), expected["kind"])
                    self.assertEqual(clean(label.text()), expected["label"])
                    self.assertEqual(sources_without_labels(node), clean(old.text()))
                    self.assertEqual([link.attrs for link in node.descendants("a")],
                                     [link.attrs for link in old.descendants("a")])

    def test_editorial_dates_are_explicit_and_consistent(self):
        scope = self.config["editorial_scope"]
        self.assertIn("Ajout des repères scientifiques", scope)
        self.assertIn("qualification des sources", scope)
        self.assertNotRegex(scope.lower(), r"(?:revue|révision|vérification) (?:complète|intégrale)")
        for record in self.records:
            with self.subTest(article=record["slug"]):
                doc = self.pages[record["slug"]]
                data = self.one(article_json(doc), "Un seul objet Article JSON-LD attendu")
                old = self.one(article_json(self.originals[record["slug"]]), "Article d’origine absent")
                self.assertEqual(record["published"], old["datePublished"])
                self.assertEqual(record["previous_modified"], old["dateModified"])
                self.assertEqual(data["datePublished"], record["published"])
                self.assertEqual(data["dateModified"], record.get("editorial_updated", self.config["editorial_updated"]))
                self.assertLessEqual(date.fromisoformat(record["published"]),
                                     date.fromisoformat(data["dateModified"]))
                banner = self.one([node for node in doc.select("div") if node.has_class("meta")],
                                  "Bandeau de publication absent")
                initial = self.one(list(banner.descendants("time")), "Date initiale visible absente")
                self.assertEqual(initial.attrs.get("datetime"), record["published"])
                self.assertIn("Publié le", clean(banner.text()))
                self.assertEqual(clean(initial.text()), readable_date(record["published"]))
                dates = self.one(doc.select(id="article-editorial-dates"), "Portée éditoriale absente")
                self.visible_without_js(dates)
                updated = self.one(list(dates.descendants("time")), "Date de révision visible absente")
                self.assertEqual(updated.attrs.get("datetime"), data["dateModified"])
                self.assertEqual(clean(updated.text()), readable_date(data["dateModified"]))
                self.assertIn("Dernière mise à jour éditoriale", clean(dates.text()))
                self.assertIn(record.get("editorial_scope", scope), clean(dates.text()))

    def test_social_metadata_and_png_files(self):
        for record in self.records:
            with self.subTest(article=record["slug"]):
                doc, card = self.pages[record["slug"]], record["social"]
                canonical = PUBLIC_BASE + f"articles/{record['slug']}.html"
                link = self.one(doc.select("link", rel="canonical"), "Canonique unique attendue")
                self.assertEqual(link.attrs.get("href"), canonical)
                image_url = PUBLIC_BASE + card["image"]
                expected = {
                    "og:type": "article", "og:url": canonical,
                    "og:title": card["title"], "og:description": card["description"],
                    "og:image": image_url, "og:image:alt": card["alt"],
                    "og:image:type": "image/png", "og:image:width": "1200", "og:image:height": "630",
                    "twitter:card": "summary_large_image", "twitter:title": card["title"] + " | THOT",
                    "twitter:description": card["description"], "twitter:image": image_url,
                    "twitter:image:alt": card["alt"],
                }
                for name, value in expected.items():
                    matching = [node for node in doc.select("meta")
                                if node.attrs.get("name") == name or node.attrs.get("property") == name]
                    meta = self.one(matching, f"Métadonnée manquante ou dupliquée : {name}")
                    self.assertEqual(meta.attrs.get("content"), value, name)
                self.assertTrue(card["alt"].startswith("THOT"))
                self.assertGreater(len(card["alt"]), 25)
                for url in (canonical, image_url):
                    parsed = urlsplit(url)
                    self.assertEqual(parsed.scheme, "https")
                    self.assertEqual(parsed.netloc, "thot-culture.github.io")
                    self.assertTrue(parsed.path.startswith("/Thot/"))
                    self.assertFalse(parsed.query or parsed.fragment or parsed.username or parsed.password)
                path = ROOT / card["image"]
                self.assertEqual(path.resolve().parent, (ROOT / "assets/social-cards").resolve())
                self.assertEqual(path.suffix, ".png")
                self.assertLess(path.stat().st_size, 200_000)
                self.assertEqual(path.read_bytes()[:8], b"\x89PNG\r\n\x1a\n")
                with Image.open(path) as image:
                    self.assertEqual(image.format, "PNG")
                    self.assertEqual(image.size, (1200, 630))
                    self.assertEqual(image.get_format_mimetype(), "image/png")
                    image.verify()
                data = self.one(article_json(doc), "JSON-LD Article absent")
                self.assertIn(data["image"], (image_url, [image_url]))
                entity = data["mainEntityOfPage"]
                self.assertEqual(entity.get("@id") if isinstance(entity, dict) else entity, canonical)

    def test_share_progressive_markup_and_assets(self):
        for record in self.records:
            with self.subTest(article=record["slug"]):
                doc = self.pages[record["slug"]]
                block = self.one([node for node in doc.elements if "data-article-share" in node.attrs],
                                 "Un seul composant de partage attendu")
                parts = list(block.descendants())
                def part(attribute):
                    return self.one([node for node in parts if attribute in node.attrs], attribute)
                link, actions = part("data-share-link"), part("data-share-actions")
                self.assertEqual(link.tag, "a")
                self.assertEqual(link.attrs.get("href"), PUBLIC_BASE + f"articles/{record['slug']}.html")
                self.visible_without_js(link)
                self.assertTrue(clean(link.text()))
                self.assertIn("hidden", actions.attrs)
                native, copy = part("data-share-native"), part("data-share-copy")
                self.assertIn("hidden", native.attrs)
                for button in (native, copy):
                    self.assertEqual(button.tag, "button")
                    self.assertEqual(button.attrs.get("type"), "button")
                    self.assertTrue(clean(button.text()))
                    self.assertIn(button, list(actions.descendants()))
                    self.assertNotIn("tabindex", button.attrs)
                status = part("data-share-status")
                self.assertEqual(status.attrs.get("role"), "status")
                self.assertEqual(status.attrs.get("aria-live"), "polite")
                self.assertEqual(status.attrs.get("aria-atomic"), "true")
                self.assertEqual(clean(status.text()), "")
                for tag, attr, asset in [("script", "src", "../assets/article-share.js"),
                                         ("link", "href", "../assets/article-editorial.css")]:
                    nodes = [node for node in doc.select(tag) if urlsplit(node.attrs.get(attr, "")).path == asset]
                    node = self.one(nodes, f"Asset unique attendu : {asset}")
                    self.assertTrue((ROOT / "articles" / urlsplit(node.attrs[attr]).path).is_file())
                    if tag == "script":
                        self.assertIn("defer", node.attrs)
                        self.assertNotIn("async", node.attrs)
                    else:
                        self.assertIn("stylesheet", node.attrs.get("rel", "").split())

    def test_original_assets_ids_and_inline_scripts_are_preserved(self):
        for record in self.records:
            with self.subTest(article=record["slug"]):
                old, doc = self.originals[record["slug"]], self.pages[record["slug"]]
                for tag, attr in [("script", "src"), ("link", "href")]:
                    before, after = external_assets(old, tag, attr), external_assets(doc, tag, attr)
                    self.assertFalse(Counter(before) - Counter(after), "Asset d’origine supprimé ou modifié")
                    cursor = iter(after)
                    self.assertTrue(all(any(item == wanted for item in cursor) for wanted in before),
                                    "Ordre des assets d’origine modifié")
                    self.assertEqual(len(after), len(set(after)), "Asset chargé plusieurs fois")
                ids = [node.attrs["id"] for node in doc.elements if node.attrs.get("id")]
                self.assertEqual(len(ids), len(set(ids)), "Identifiant HTML dupliqué")
                old_ids = {node.attrs["id"] for node in old.elements if node.attrs.get("id")}
                self.assertFalse(old_ids - set(ids), "Identifiant d’activité ou ancre supprimé")
                def inline(document):
                    return [node.text() for node in document.select("script")
                            if "src" not in node.attrs and node.attrs.get("type") != "application/ld+json"]
                self.assertEqual(inline(old), inline(doc), "Script inline d’origine modifié")

    def test_no_unrelated_html_changed_between_revisions(self):
        if not OPTIONS.head:
            self.skipTest("Contrôle optionnel des révisions activé avec --head")
        changed = git("diff", "--name-only", OPTIONS.revision, OPTIONS.head, "--", "*.html").splitlines()
        expected = {f"articles/{slug}.html" for slug in SLUGS}
        self.assertFalse(set(changed) - expected, "Une page hors des cinq articles a été modifiée")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--revision", default="37f17ee", help="Révision publiée servant de référence")
    parser.add_argument("--head", help="Révision finale à comparer pour contrôler le périmètre HTML")
    OPTIONS, unittest_args = parser.parse_known_args()
    unittest.main(argv=[__file__, *unittest_args], verbosity=2)
