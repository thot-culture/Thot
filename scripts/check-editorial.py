#!/usr/bin/env python3
"""Compare le contenu protégé des six dernières pages avec la révision auditée.

Nécessite l'historique Git local (fourni dans le bundle de livraison).
Les nouveaux blocs de dates, partage et repères sont exclus de la comparaison,
ainsi que les seuls libellés de type ajoutés dans les références existantes.
Dans l’article Autorité, le module « Décode le pouvoir » reste exclu : son HTML
est conservé par une empreinte dédiée dans scripts/test-autorite-decode.mjs.
Les données JSON-LD sont comparées comme objets ; seuls image et dateModified
peuvent évoluer dans les cinq articles, jamais datePublished.
"""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import runpy


class Editorial(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self, html, ignored_ids=("quiz-load-status",),
                 ignore_source_types=False, ignored_span_ids=()):
        super().__init__()
        self.ignored_ids = set(ignored_ids)
        self.ignore_source_types = ignore_source_types
        self.ignored_span_ids = set(ignored_span_ids)
        self.body = False
        self.stack = []
        self.words = []
        self.links = []
        self.images = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "body":
            self.body = True
        if not self.body:
            return
        reference = tag == "li" and re.fullmatch(r"ref[1-9]\d*", attrs.get("id", ""))
        source_type = (self.ignore_source_types and tag == "span"
                       and "source-type" in attrs.get("class", "").split()
                       and any(entry[2] for entry in self.stack))
        blocked = ((self.stack[-1][1] if self.stack else False)
                   or tag in {"script", "style"}
                   or attrs.get("id") in self.ignored_ids or source_type
                   or (tag == "span" and attrs.get("id") in self.ignored_span_ids))
        if tag not in self.VOID:
            self.stack.append((tag, blocked, bool(reference)))
        if not blocked and tag == "a":
            self.links.append(tuple(attrs.get(k) for k in ("href", "rel", "target")))
        if not blocked and tag == "img":
            self.images.append(attrs.get("alt"))

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                self.stack = self.stack[:index]
                break
        if tag == "body":
            self.body = False

    def handle_data(self, data):
        if self.body and not (self.stack and self.stack[-1][1]):
            self.words.extend(data.split())


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--revision", default="c45c2a193e9a366d95bdfb4ad0612ed1b80cce32", help="Révision GitHub publiée avant l’audit")
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent


def original(path):
    return subprocess.check_output(
        ["git", "show", f"{args.revision}:{path}"], cwd=root)


def require(condition, message):
    if not condition:
        raise SystemExit("ÉCHEC : " + message)


def structured_data(html, mutable_fields=()):
    def unique_object(pairs):
        document = {}
        for key, value in pairs:
            require(key not in document, f"clé JSON-LD dupliquée : {key}")
            document[key] = value
        return document

    scripts = re.findall(
        r'<script\b[^>]*\btype=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html, re.S | re.I)
    try:
        documents = [json.loads(script, object_pairs_hook=unique_object) for script in scripts]
    except json.JSONDecodeError as error:
        raise SystemExit(f"ÉCHEC : JSON-LD invalide ({error})") from error
    # Conserver les clés : supprimer un champ autorisé reste une régression.
    return [{key: None if key in mutable_fields else value
             for key, value in document.items()}
            if isinstance(document, dict) else document for document in documents]


# Résoudre les chemins depuis le dossier du projet, même si lancé ailleurs.
article_pages = {Path("articles") / name for name in (
    "autorite.html", "autrices-pseudonymes.html", "pieuvres-couleur.html",
    "puissance-etats-unis.html", "roubaix-1917.html")}
new_article_ids = {"article-editorial-dates", "article-share",
                   "reperes-scientifiques", "sources-guide"}
pages = [Path("quiz-autrices.html"), *[p.relative_to(root) for p in sorted((root / "articles").glob("*.html"))]]
for path in pages:
    before_html = original(path).decode()
    after_html = (root / path).read_text()
    ignored_ids = {"quiz-load-status"}
    if path in article_pages:
        ignored_ids.update(new_article_ids)
    if path == Path("articles/autorite.html"):
        ignored_ids.add("decode-pouvoir")
    if path == Path("articles/roubaix-1917.html"):
        # Ajouts documentaires validés ; le commentaire historique reste comparé.
        ignored_ids.update({"document-laine", "transcription-laine", "roubaix-reperes-texte", "roubaix-atlas-acces"})
    if path == Path("articles/pieuvres-couleur.html"):
        ignored_ids.update({"chromato-modele", "chromato-reperes", "chromato-etats-statiques", "cephalo-atlas"})
    if path == Path("articles/puissance-etats-unis.html"):
        ignored_ids.update({"comparateur-reference-commandes", "comparateur-simultane"})
    # Seuls les libellés de durée et les ajouts d’interface nommés sont normalisés.
    # Le générateur --check vérifie indépendamment chaque durée.
    def duration_ui(html):
        html = re.sub(r'(<span id="duree">)[^<]*', r'\1Temps de lecture estimé', html)
        return re.sub(r'\d+ min de lecture', 'DUREE min de lecture', html)
    ignored_ids.update({"site-parcours", "site-lecture-nav", "activites-autorite-aide", "comparateur-entree-directe",
                        "toc-interaction-" + path.stem})
    before_html, after_html = duration_ui(before_html), duration_ui(after_html)
    before_html = runpy.run_path(str(root / "scripts/editorial-amendments.py"))["amended_reference"](before_html, path)
    before = Editorial(before_html)
    ignored_span_ids = {"editorial-previous-label"} if path == Path("articles/roubaix-1917.html") else set()
    after = Editorial(after_html, ignored_ids, ignore_source_types=path in article_pages,
                      ignored_span_ids=ignored_span_ids)
    require(before.words == after.words, f"texte éditorial modifié dans {path}")
    require(before.links == after.links, f"lien éditorial modifié dans {path}")
    require(before.images == after.images, f"texte alternatif modifié dans {path}")
    mutable_fields = ("image", "dateModified") if path in article_pages else ()
    require(structured_data(before_html, mutable_fields) == structured_data(after_html, mutable_fields),
            f"données structurées modifiées dans {path}")
    print(f"PASS conservation : {path}, {len(after.words)} mots, {len(after.links)} liens éditoriaux")

before = json.loads(original("assets/illustrations.json"))
after = json.loads((root / "assets/illustrations.json").read_text())
require(before.keys() == after.keys(), "liste des illustrations modifiée")
for key, record in before.items():
    require(record.keys() == after[key].keys(), f"champs modifiés dans {key}")
    for field, value in record.items():
        if key == "roubaix-ville-avant-1919" and field in {"url", "width", "height"}:
            continue  # Copie locale du même document, documentée dans GUIDE-IMAGES.md.
        require(value == after[key][field], f"illustration {key}, champ {field} modifié")
for level in ("facile", "intermediaire", "expert"):
    path = f"assets/questions-{level}.js"
    require(original(path) == (root / path).read_bytes(), f"banque {level} modifiée")
print("PASS catalogue : légendes, crédits, licences et notices conservés ; banques de questions inchangées.")
