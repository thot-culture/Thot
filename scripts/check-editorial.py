#!/usr/bin/env python3
"""Compare le contenu protégé des six dernières pages avec la révision auditée.

Nécessite l'historique Git local (fourni dans le bundle de livraison).
Le message technique de chargement ajouté au jeu est exclu de la comparaison.
Dans l’article Autorité, le nouveau module « Décode le pouvoir » est également
exclu : son ajout et la conservation exacte de l’article publié sont contrôlés
séparément par scripts/test-autorite-decode.mjs.
"""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess


class Editorial(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self, html, ignored_ids=("quiz-load-status",)):
        super().__init__()
        self.ignored_ids = set(ignored_ids)
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
        blocked = ((self.stack[-1][1] if self.stack else False)
                   or tag in {"script", "style"}
                   or attrs.get("id") in self.ignored_ids)
        if tag not in self.VOID:
            self.stack.append((tag, blocked))
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


# Résoudre les chemins depuis le dossier du projet, même si lancé ailleurs.
pages = [Path("quiz-autrices.html"), *[p.relative_to(root) for p in sorted((root / "articles").glob("*.html"))]]
for path in pages:
    before_html = original(path).decode()
    after_html = (root / path).read_text()
    ignored_ids = {"quiz-load-status"}
    if path == Path("articles/autorite.html"):
        ignored_ids.add("decode-pouvoir")
    before, after = Editorial(before_html), Editorial(after_html, ignored_ids)
    require(before.words == after.words, f"texte éditorial modifié dans {path}")
    require(before.links == after.links, f"lien éditorial modifié dans {path}")
    require(before.images == after.images, f"texte alternatif modifié dans {path}")
    structured = r'<script\b[^>]*type="application/ld\+json"[^>]*>(.*?)</script>'
    require(re.findall(structured, before_html, re.S) == re.findall(structured, after_html, re.S),
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
