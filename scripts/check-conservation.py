#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Comparer les contenus principaux protégés à une révision Git explicite.
Les interfaces communes restent hors du main ; seules les durées générées sont
normalisées. Texte, liens, médias, activités et JSON-LD restent comparés.
"""
import portable_io
import argparse
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def protected(html):
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
        if protected(before) != protected(after):
            raise SystemExit("ÉCHEC : contenu protégé modifié dans " + name)
    for name in ["assets/illustrations.json", *["assets/questions-" + level + ".js"
                 for level in ("facile", "intermediaire", "expert")]]:
        before = subprocess.check_output(["git", "show", revision + ":" + name], cwd=ROOT)
        if before != (ROOT / name).read_bytes():
            raise SystemExit("ÉCHEC : corpus protégé modifié dans " + name)
    print("PASS : contenus principaux, JSON-LD, catalogue et questions conservés depuis " + revision)


if __name__ == "__main__":
    main()
