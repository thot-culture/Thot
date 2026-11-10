#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Synchroniser les cartes de l’accueil, la bibliothèque et le sitemap.
Vérification par défaut ; --write applique les rendus du registre éditorial.
"""
import portable_io
import argparse
from datetime import date
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urljoin, urlsplit
import xml.etree.ElementTree as ET
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = {"histoire", "geographie", "sciences", "arts", "sciences-humaines"}
MONTHS = ("janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc.")


def e(value):
    return escape(str(value), quote=True)


def catalogue_for(record, root):
    slug = record["slug"]
    catalogue = record.get("catalogue", {})
    if catalogue.get("category") not in CATEGORIES:
        raise ValueError("Ajouter catalogue.category pour " + slug)
    for field in ("label", "keywords", "credit"):
        if not isinstance(catalogue.get(field), str) or not catalogue[field].strip():
            raise ValueError("Ajouter catalogue." + field + " pour " + slug)
    image = catalogue.get("image", {})
    src = image.get("src", "")
    path = root / src
    if (not src.startswith("assets/") or not path.is_file() or
            not path.resolve().is_relative_to((root / "assets").resolve())):
        raise ValueError("Illustration locale manquante pour " + slug)
    if (not isinstance(image.get("alt"), str) or not image["alt"].strip() or
            any(type(image.get(key)) is not int or image[key] <= 0 for key in ("width", "height"))):
        raise ValueError("Décrire et dimensionner l’illustration de " + slug)
    try:
        with Image.open(path) as visual:
            if visual.size != (image["width"], image["height"]):
                raise ValueError("Dimensions de l’illustration incohérentes pour " + slug)
            visual.verify()
    except OSError as error:
        raise ValueError("Illustration illisible pour " + slug) from error
    if catalogue.get("credit_url") and urlsplit(catalogue["credit_url"]).scheme != "https":
        raise ValueError("Lien de crédit non HTTPS pour " + slug)
    if image.get('position'):
        position = re.fullmatch(r'(\d{1,3})% (\d{1,3})%', image['position'])
        if not position or any(int(value) > 100 for value in position.groups()):
            raise ValueError('Position de couverture invalide pour ' + slug)
    for variant in image.get('variants', []):
        variant_path = root / variant.get('src', '')
        if (not variant.get('src', '').startswith('assets/') or not variant_path.is_file()
                or not variant_path.resolve().is_relative_to((root / 'assets').resolve())):
            raise ValueError('Variante locale manquante pour ' + slug)
        with Image.open(variant_path) as visual:
            if visual.size != (variant['width'], variant['height']):
                raise ValueError('Dimensions de variante incohérentes pour ' + slug)
            if abs(visual.width / visual.height - image['width'] / image['height']) > .005:
                raise ValueError('Proportions de variante incohérentes pour ' + slug)
            visual.verify()
    return catalogue


def story_fields(record, root, reading_times):
    catalogue = catalogue_for(record, root)
    slug = record["slug"]
    image = catalogue["image"]
    responsive = ''
    if image.get('variants'):
        sources = [*image['variants'], image]
        srcset = ', '.join(f'{variant["src"]} {variant["width"]}w' for variant in sources)
        responsive = f' srcset="{e(srcset)}" sizes="(max-width: 760px) calc(100vw - 42px), (max-width: 1152px) calc((100vw - 63px) / 2), 555px"'
    position = f' style="--cover-position:{e(image["position"])}"' if image.get('position') else ''
    photo = (f'<img src="{e(image["src"])}"{responsive}{position} alt="{e(image["alt"])}" width="{image["width"]}" '
             f'height="{image["height"]}" loading="lazy" decoding="async">')
    if catalogue.get("stamp"):
        photo += f'\n          <span class="discovery-stamp" aria-hidden="true">{e(catalogue["stamp"])}</span>'
    credit = e(catalogue["credit"])
    if url := catalogue.get("credit_url"):
        if label := catalogue.get("credit_link_label"):
            credit += f' <a href="{e(url)}">{e(label)}</a>.'
        else:
            credit = (f'<a href="{e(url)}" target="_blank" rel="noopener noreferrer">{credit}'
                      '<span class="discovery-sr-only"> — consulter la notice de l’image (nouvel onglet)</span></a>')
    day = date.fromisoformat(record["published"])
    published = f'<time datetime="{day}">{day.day} {MONTHS[day.month - 1]} {day.year}</time>'
    minutes = reading_times.get(slug, {}).get("minutes", 1)
    title = catalogue.get("title") or record.get("headline") or record["social"]["title"]
    return {
        "href": f"articles/{slug}.html",
        "title": e(re.sub(r" (?=[?!:])", "\u00a0", title)),
        "description": e(catalogue.get("description") or record["social"]["description"]),
        "invitation": e(catalogue.get("invitation", "")),
        "photo": photo,
        "credit": f'<p class="discovery-credit">{credit}</p>',
        "meta": (f'<div class="discovery-meta"><span>{e(catalogue["label"])}</span>'
                 f'<span class="reading-pill">{minutes} min de lecture</span></div>'),
        "published": published,
        "author": e(record['author']['name']),
    }


def standard_card(record, story, *, library=False):
    slug = record["slug"]
    catalogue = record["catalogue"]
    classes = "article-card discovery-card" if library else "discovery-card"
    search = (f' data-category="{e(catalogue["category"])}" data-keywords="{e(catalogue["keywords"])}"'
              if library else "")
    invitation = (f'\n          <p class="discovery-affordance">{story["invitation"]}</p>'
                  if story["invitation"] else "")
    return f'''        <article class="{classes}"{search}>
      <a class="discovery-card__link" href="{story['href']}" data-discovery-path aria-labelledby="card-{slug}">
        <div class="discovery-photo">
          {story['photo']}
        </div>
        <div class="discovery-card__copy">
          {story['meta']}
          <h3 id="card-{slug}">{story['title']}</h3>
          <p>{story['description']}</p>{invitation}
          <div class="discovery-card__bottom"><span>{story['published']}</span><span>Lire l’article <span aria-hidden="true">↗</span></span></div>
        </div>
      </a>
      {story['credit']}
    </article>'''


def featured_card(story):
    invitation = (f'\n        <p class="latest-story__invitation">{story["invitation"]}</p>'
                  if story["invitation"] else "")
    return f'''      <article class="latest-story" aria-labelledby="latest-title">
      <div class="latest-story__visual"><a href="{story['href']}" data-discovery-path aria-label="Lire l’article à la une : {story['title']}"><div class="discovery-photo discovery-photo--latest">
          {story['photo']}
      </div></a>{story['credit']}</div>
      <div class="latest-story__copy">
        <p class="latest-story__label"><span aria-hidden="true">✦</span> À la une</p>
        {story['meta']}
        <h3 id="latest-title"><a href="{story['href']}">{story['title']}</a></h3>
        <p>{story['description']}</p>{invitation}
        <div class="latest-story__actions"><a class="discovery-primary" href="{story['href']}">Découvrir l’article <span aria-hidden="true">↗</span></a><span>{story['published']} · {story['author']}</span></div>
      </div>
    </article>'''


def render_region(html, name, content):
    start = f"<!-- catalogue:{name}:debut -->"
    end = f"<!-- catalogue:{name}:fin -->"
    if html.count(start) != 1 or html.count(end) != 1 or html.index(start) > html.index(end):
        raise ValueError("Balises de génération incohérentes : " + name)
    return html[:html.index(start) + len(start)] + "\n" + content + "\n      " + html[html.index(end):]


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

    reading_times = json.loads((root / "assets/reading-times.json").read_text(encoding="utf-8"))["articles"]
    by_slug = {record["slug"]: record for record in records}
    selection = config.get("home_articles", [])
    if not selection or len(selection) != len(set(selection)) or set(selection) - articles:
        raise ValueError("Sélection de l’accueil vide, dupliquée ou inconnue")
    stories = {slug: story_fields(record, root, reading_times)
               for slug, record in by_slug.items()}
    home_path = root / "index.html"
    home = render_region(home_path.read_text(encoding="utf-8"), "une", featured_card(stories[selection[0]]))
    home = render_region(home, "selection", "\n\n".join(standard_card(by_slug[slug], stories[slug])
                                                        for slug in selection[1:]))

    library_path = root / "bibliotheque.html"
    library = library_path.read_text(encoding="utf-8")
    order = sorted(records, key=lambda row: (row["published"], row["slug"]), reverse=True)
    library = render_region(library, "bibliotheque", "\n\n".join(
        standard_card(record, stories[record["slug"]], library=True) for record in order))
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
    return {home_path: home, library_path: library, sitemap_path: sitemap}


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
        print("PASS : accueil, bibliothèque et sitemap synchronisés.")
        return 0
    for path, _ in planned:
        print("À synchroniser :", path.relative_to(ROOT))
    return 1 if planned else 0


if __name__ == "__main__":
    raise SystemExit(main())
