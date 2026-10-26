#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère les ajouts éditoriaux statiques THOT ; --check par défaut, --write explicite.

Les références et le texte préexistants restent en place. Les dates sont des
données éditoriales explicites : ce script ne les déduit jamais de Git ou de l’horloge.
"""
import portable_io  # Encodage CLI stable, sans dépendance système.
import argparse
from datetime import date
from html import escape
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
VERSION = "science-partage-1"
MONTHS = ("janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre")


def french_date(value):
    day = date.fromisoformat(value)
    return f"{day.day} {MONTHS[day.month - 1]} {day.year}"


def marker(name, content):
    return f"<!-- THOT:{name}:start -->\n{content}\n<!-- THOT:{name}:end -->"


def remove_generated(html):
    return re.sub(r"<!-- THOT:(dates|share|science|sources-guide):start -->[\s\S]*?<!-- THOT:\1:end -->\n?", "", html)


def set_meta(html, key, value, attribute="property"):
    tag = f'<meta {attribute}="{key}" content="{escape(str(value), quote=True)}">'
    pattern = rf'<meta\b[^>]*(?:property|name)="{re.escape(key)}"[^>]*>'
    if re.search(pattern, html):
        return re.sub(pattern, lambda _: tag, html)
    return html.replace("</head>", f"  {tag}\n</head>", 1)


def render_science(record):
    def points(items):
        rows = []
        for item in items:
            links = "".join(f'<a class="source-num" href="#ref{number}" aria-label="Voir la source {number}">[{number}]</a>' for number in item["refs"])
            rows.append(f'              <li>{escape(item["text"])} {links}</li>')
        return "\n".join(rows)
    return marker("science", f'''        <section class="science-reperes" id="reperes-scientifiques" aria-labelledby="science-reperes-title">
          <p class="science-reperes__kicker">THOT · Les repères scientifiques</p>
          <h2 id="science-reperes-title">Ce qu’on sait, ce qui reste à discuter</h2>
          <div class="science-reperes__columns">
            <section aria-labelledby="science-sait-title">
              <h3 id="science-sait-title">Ce qu’on sait</h3>
              <ul>
{points(record["known"])}
              </ul>
            </section>
            <section aria-labelledby="science-debat-title">
              <h3 id="science-debat-title">{escape(record["discussion_title"])}</h3>
              <p class="science-reperes__limite">{escape(record["discussion_note"])}</p>
              <ul>
{points(record["discussion"])}
              </ul>
            </section>
          </div>
        </section>''')


def update(html, record, config):
    slug = record["slug"]
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError("Identifiant d’article invalide")
    updated = record.get("editorial_updated", config["editorial_updated"])
    scope = record.get("editorial_scope", config["editorial_scope"])
    for document in record.get("open_documents", []):
        url = urlsplit(document["url"])
        if url.scheme != "https" or not url.netloc or url.username or url.password:
            raise ValueError(f"URL documentaire HTTPS attendue : {slug}")
        if document["ref"] not in record["sources"]:
            raise ValueError(f"Document sans référence associée : {slug}")
    canonical = config["base_url"] + "articles/" + slug + ".html"
    if not re.search(r'<link\b[^>]*rel="canonical"[^>]*href="' + re.escape(canonical) + '"', html):
        raise ValueError(f"Canonique inattendue : {slug}")
    html = remove_generated(html)
    html = re.sub(r'<span\b[^>]*class="source-type"[^>]*>[^<]*</span>\s*', '', html)
    refs = set(re.findall(r'<li\b[^>]*id="(ref\d+)"', html))
    if refs != set(record["sources"]):
        raise ValueError(f"Références absentes ou non qualifiées : {slug}")
    for point in record["known"] + record["discussion"]:
        if not point["refs"] or any("ref" + str(number) not in refs for number in point["refs"]):
            raise ValueError(f"Repère sans source valide : {slug}")
    card = record["social"]
    image = config["base_url"] + card["image"]
    values = {
        "og:type": "article", "og:title": record["social"]["title"],
        "og:description": record["social"]["description"], "og:url": canonical,
        "og:image": image, "og:image:alt": card["alt"], "og:image:type": "image/png",
        "og:image:width": "1200", "og:image:height": "630",
        "twitter:card": "summary_large_image", "twitter:title": record["social"]["title"] + " | THOT",
        "twitter:description": record["social"]["description"], "twitter:image": image,
        "twitter:image:alt": card["alt"],
    }
    for key, value in values.items():
        html = set_meta(html, key, value, "name" if key.startswith("twitter:") else "property")
    pattern = r'(<script\b[^>]*type="application/ld\+json"[^>]*>)([\s\S]*?)(</script>)'
    def structured(match):
        data = json.loads(match[2])
        if data.get("@type") != "Article":
            return match[0]
        if data.get("datePublished") != record["published"]:
            raise ValueError(f"Date initiale contradictoire : {slug}")
        data["image"] = [image] if isinstance(data.get("image"), list) else image
        data["dateModified"] = updated
        return match[1] + "\n" + json.dumps(data, ensure_ascii=False, indent=2) + "\n  " + match[3]
    html = re.sub(pattern, structured, html)
    css = f'  <link rel="stylesheet" href="../assets/article-editorial.css?v={VERSION}">'
    if 'href="../assets/article-editorial.css?' not in html:
        html = html.replace("</head>", css + "\n</head>", 1)
    js = f'  <script src="../assets/article-share.js?v={VERSION}" defer></script>'
    if 'src="../assets/article-share.js?' not in html:
        html = html.replace("</body>", js + "\n</body>", 1)

    # Reprendre une date déjà déclarée, sans réécrire sa valeur.
    if record["published"]:
        published = french_date(record["published"])
        html = html.replace(f'<span>Publié le {published}</span>', f'<span>Publié le <time datetime="{record["published"]}">{published}</time></span>')
    if slug == "roubaix-1917":
        old = f'Mis à jour le {french_date(record["previous_modified"])}'
        html = html.replace('<span>' + old + '</span>', '<span><span id="editorial-previous-label">Version antérieure · </span>' + old + '</span>')
    unknown = '<span>Publication initiale : date non renseignée.</span> ' if not record["published"] else ''
    dates = marker("dates", f'      <p class="article-editorial-dates" id="article-editorial-dates">{unknown}Dernière mise à jour éditoriale : <time datetime="{updated}">{french_date(updated)}</time>. {escape(scope)}</p>')
    share = marker("share", f'''      <div class="article-share" id="article-share" data-article-share>
        <a class="article-share__link" data-share-link href="{canonical}">Lien permanent de cet article</a>
        <div class="article-share__actions" data-share-actions hidden>
          <button type="button" data-share-native hidden>Partager cet article</button>
          <button type="button" data-share-copy>Copier le lien</button>
        </div>
        <p class="article-share__status" data-share-status role="status" aria-live="polite" aria-atomic="true"></p>
      </div>''')
    meta = re.search(r'<div class="meta">[\s\S]*?</div>', html)
    if not meta:
        raise ValueError(f"Bandeau éditorial absent : {slug}")
    html = html[:meta.end()] + "\n" + dates + "\n" + share + html[meta.end():]
    section = re.search(r'<section\b[^>]*class="sources"[^>]*>', html)
    if not section:
        raise ValueError(f"Bibliographie absente : {slug}")
    html = html[:section.start()] + render_science(record) + "\n" + html[section.start():]
    section = re.search(r'<section\b[^>]*class="sources"[^>]*>', html)
    title = html.index('</h2>', section.end()) + len('</h2>')
    guide = marker("sources-guide", '''          <p class="sources-guide" id="sources-guide"><strong>Lire nos sources.</strong> Sources primaires : documents, données ou recherches originales. Sources secondaires : analyses et synthèses. Ressources complémentaires : notices, dossiers et presse. Ces catégories décrivent les documents ; elles ne garantissent pas leur fiabilité. Une notice ne remplace pas la lecture du document qu’elle décrit.</p>''')
    if record.get("open_documents"):
        documents = " ".join(f'<a href="{escape(item["url"], quote=True)}" target="_blank" rel="noopener noreferrer">{escape(item["title"])}</a>.' for item in record["open_documents"])
        guide = guide.replace("</p>", '<br><span class="sources-guide__access">' + documents + '</span></p>')
    html = html[:title] + "\n" + guide + "\n" + html[title:].lstrip("\n")
    def qualify(match):
        kind = record["sources"][match[2]]
        return match[1] + f'<span class="source-type" data-source-kind="{escape(kind["kind"])}">{escape(kind["label"])}</span> '
    html = re.sub(r'(<li\b[^>]*id="(ref\d+)"[^>]*>)', qualify, html)
    return html


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--write", action="store_true", help="Écrire les ajouts statiques dans les articles")
    mode.add_argument("--check", action="store_true", help="Vérifier les pages sans les écrire (défaut)")
    args = parser.parse_args()
    config = json.loads((ROOT / "assets/article-editorial.json").read_text(encoding="utf-8"))
    planned = []
    for record in config["articles"]:
        path = ROOT / "articles" / (record["slug"] + ".html")
        before = path.read_text(encoding="utf-8")
        after = update(before, record, config)
        if before != after:
            planned.append((path, after))
    if args.write:
        for path, after in planned:
            path.write_text(after, encoding="utf-8")
        print(f"PASS : {len(planned)} article(s) généré(s), aucune date calculée automatiquement.")
        return 0
    if planned:
        for path, _ in planned:
            print("À régénérer :", path.relative_to(ROOT))
        return 1
    print(f"PASS : {len(config['articles'])} articles conformes aux données éditoriales statiques.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
