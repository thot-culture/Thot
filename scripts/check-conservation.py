#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Comparer les contenus principaux protégés à une révision Git explicite.
Les interfaces communes restent hors du main. Durées, unique lien réparé et
six niveaux H4→H3 documentés sont normalisés ; le texte intégral reste comparé.
"""
import portable_io
import argparse
import json
from pathlib import Path
import re
import subprocess
import runpy

ROOT = Path(__file__).resolve().parents[1]
amended_structure = runpy.run_path(str(ROOT / 'scripts/editorial-amendments.py'))['amended_structure']


def protected(html, path=None):
    html = amended_structure(html, path)
    for repair in json.loads((ROOT / 'docs/audit-final/liens-repares.json').read_text(encoding='utf-8')):
        if repair['path'] != path:
            continue
        if html.count(repair['old']) + html.count(repair['new']) != 1:
            raise ValueError('Lien documentaire absent ou ambigu : ' + path)
        html = html.replace(repair['old'], repair['new'])
    main = re.search(r"<main\b[^>]*>[\s\S]*?</main>", html, re.I)
    if not main:
        raise ValueError("Contenu principal absent")
    content = re.sub(r"\d+ min de lecture", "DUREE min de lecture", main[0])
    structured = [json.loads(m) for m in re.findall(
        r'<script\b[^>]*type="application/ld\+json"[^>]*>([\s\S]*?)</script>', html)]
    return content, structured


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--revision", required=True)
    args = parser.parse_args()
    # Le commit doit déjà être disponible localement ; aucun accès réseau implicite.
    revision = subprocess.check_output(
        ["git", "rev-parse", "--verify", args.revision + "^{commit}"], cwd=ROOT,
        text=True, encoding="utf-8").strip()
    names = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", revision],
        cwd=ROOT, text=True, encoding="utf-8").splitlines()
    paths = [p for p in names if p.startswith("articles/") and p.endswith(".html")]
    paths.append("quiz-autrices.html")
    for name in paths:
        before = subprocess.check_output(["git", "show", revision + ":" + name],
            cwd=ROOT, text=True, encoding="utf-8")
        after = (ROOT / name).read_text(encoding="utf-8")
        if protected(before, name) != protected(after, name):
            raise SystemExit("ÉCHEC : contenu protégé modifié dans " + name)
    for name in ["assets/illustrations.json", *["assets/questions-" + level + ".js"
                 for level in ("facile", "intermediaire", "expert")]]:
        before = subprocess.check_output(["git", "show", revision + ":" + name], cwd=ROOT)
        if before != (ROOT / name).read_bytes():
            raise SystemExit("ÉCHEC : corpus protégé modifié dans " + name)
    print("PASS : contenus principaux, JSON-LD, catalogue et questions conservés depuis " + revision)


if __name__ == "__main__":
    main()
