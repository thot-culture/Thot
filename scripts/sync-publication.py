#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Synchroniser bibliothèque et sitemap depuis les articles et leur registre.
Vérification par défaut ; --write applique les ajouts sans supprimer de contenu.
Les cartes existantes conservent leurs textes, illustrations, crédits et ordre.
"""
import portable_io
import argparse
from datetime import date
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urljoin
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = {"histoire", "geographie", "sciences", "arts", "sciences-humaines"}


class Head(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.canonical = []
        self.noindex = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "link" and "canonical" in a.get("rel", "").split():
            self.canonical.append(a.get("href"))
        if tag == "meta" and a.get("name") == "robots":
            self.noindex = "noindex" in a.get("content", "").lower()


def outputs(root=ROOT):
    config = json.loads((root / "assets/article-editorial.json").read_text(encoding="utf-8"))
    base = config["base_url"]
    records = config["articles"]
    slugs = [record["slug"] for record in records]
    if len(slugs) != len(set(slugs)) or any(not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) for slug in slugs):
        raise ValueError("Identifiant d'article invalide ou dupliqué")
    articles = {p.stem for p in (root / "articles").glob("*.html")}
    if articles != set(slugs):
        raise ValueError("Articles et registre différents : " + str(articles ^ set(slugs)))
    for record in records:
        published = date.fromisoformat(record["published"])
        modified = date.fromisoformat(record.get("editorial_updated", config["editorial_updated"]))
        if modified < published:
            raise ValueError("Mise à jour antérieure à la publication : " + record["slug"])

    library_path = root / "bibliotheque.html"
    library = library_path.read_text(encoding="utf-8")
    cards = re.findall(r'<article\b[^>]*class="[^"]*\barticle-card\b[^"]*"[^>]*>[\s\S]*?</article>', library)
    present = []
    for card in cards:
        links = re.findall(r'href="articles/([a-z0-9-]+)\.html"', card)
        if len(set(links)) != 1:
            raise ValueError("Une cible article unique est requise par carte")
        present.append(links[0])
    if len(present) != len(set(present)) or set(present) - articles:
        raise ValueError("Carte dupliquée ou article absent")
    additions = []
    for record in sorted(records, key=lambda row: row["published"], reverse=True):
        slug = record["slug"]
        if slug in present:
            continue
        catalogue = record.get("catalogue", {})
        if catalogue.get("category") not in CATEGORIES:
            raise ValueError("Ajouter catalogue.category pour " + slug)
        for field in ("label", "keywords", "credit"):
            if not isinstance(catalogue.get(field), str) or not catalogue[field].strip():
                raise ValueError("Ajouter catalogue." + field + " pour " + slug)
        social = record["social"]
        image = root / social["image"]
        if not image.is_file() or not image.resolve().is_relative_to(root.resolve()):
            raise ValueError("Image sociale locale absente ou hors du dépôt : " + slug)
        # Aucune durée en dur : update-reading-times.py la renseigne ensuite.
        e = lambda value: escape(str(value), quote=True)
        additions.append(
            '<article class="article-card discovery-card" data-category="' + e(catalogue["category"]) +
            '" data-keywords="' + e(catalogue["keywords"]) + '"><a class="discovery-card__link" href="articles/' +
            slug + '.html" data-discovery-path aria-labelledby="card-' + slug +
            '"><div class="discovery-photo"><img src="' + e(social["image"]) + '" alt="' + e(social["alt"]) +
            '" width="1200" height="630" loading="lazy" decoding="async"></div><div class="discovery-card__copy">' +
            '<div class="discovery-meta"><span>' + e(catalogue["label"]) + '</span><span class="reading-pill">1 min de lecture</span></div>' +
            '<h3 id="card-' + slug + '">' + e(social["title"]) + '</h3><p>' + e(social["description"]) +
            '</p><div class="discovery-card__bottom"><span>' + e(record["published"]) +
            '</span><span>Lire l’article ↗</span></div></div></a><p class="discovery-credit">' +
            e(catalogue["credit"]) + '</p></article>')
    marker = '<div id="article-results" class="article-grid">'
    if library.count(marker) != 1:
        raise ValueError("Conteneur de bibliothèque absent ou dupliqué")
    if additions:
        library = library.replace(marker, marker + "\n" + "\n".join(additions), 1)
    library = re.sub(r'(<strong id="article-total">)\d+', lambda m: m[1] + str(len(articles)), library)
    library = re.sub(r'(<p class="results-status"[^>]*>)\d+ articles disponibles', lambda m: m[1] + str(len(articles)) + " articles disponibles", library)

    sitemap_path = root / "sitemap.xml"
    sitemap = sitemap_path.read_text(encoding="utf-8")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    listed = [node.text for node in ET.fromstring(sitemap).findall("s:url/s:loc", ns)]
    if len(listed) != len(set(listed)):
        raise ValueError("URL dupliquée dans le sitemap")
    expected = set()
    for page in [*root.glob("*.html"), *(root / "articles").glob("*.html"), *(root / "explorer").rglob("*.html")]:
        name = page.relative_to(root).as_posix()
        head = Head(page.read_text(encoding="utf-8"))
        if head.noindex:
            continue
        canonical = base if name == "index.html" else urljoin(base, name)
        if head.canonical != [canonical]:
            raise ValueError("Canonique incohérente : " + name)
        expected.add(canonical)
    if set(listed) - expected:
        raise ValueError("Sitemap : une URL existante est absente ou non indexable ; examiner manuellement, aucune suppression automatique")
    for canonical in sorted(expected - set(listed)):
        sitemap = sitemap.replace("</urlset>", "  <url><loc>" + escape(canonical) + "</loc></url>\n</urlset>")
    # Uniquement les dates éditoriales explicites, jamais l'heure du build.
    article_dates = {urljoin(base, 'articles/' + row['slug'] + '.html'):
                     row.get('editorial_updated', config['editorial_updated']) for row in records}
    def dated(match):
        node = ET.fromstring(match[0])
        location = node.findtext('loc')
        if location not in article_dates:
            return match[0]
        body = re.sub(r'<lastmod>[^<]*</lastmod>', '', match[0])
        return body.replace('</url>', '<lastmod>' + article_dates[location] + '</lastmod></url>')
    sitemap = re.sub(r'<url>[\s\S]*?</url>', dated, sitemap)
    return {library_path: library, sitemap_path: sitemap}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--write", action="store_true")
    modes.add_argument("--check", action="store_true")
    args = parser.parse_args()
    planned = [(path, value) for path, value in outputs().items() if path.read_text(encoding="utf-8") != value]
    if args.write:
        for path, value in planned:
            path.write_text(value, encoding="utf-8", newline="\n")
        print("PASS : bibliothèque et sitemap synchronisés ; aucune suppression automatique.")
        return 0
    for path, _ in planned:
        print("À synchroniser :", path.relative_to(ROOT))
    return 1 if planned else 0


if __name__ == "__main__":
    raise SystemExit(main())
