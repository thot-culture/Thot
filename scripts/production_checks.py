#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Conserver les fichiers servis par rapport à un socle Git explicite.

Les anciens contrats « aucun fichier du dépôt ne doit changer » incluaient les
tests, workflows et documents. Ce contrôle porte sur tous les fichiers du site,
y compris ajouts/suppressions, et laisse évoluer l'outillage de vérification.
"""
import portable_io
import argparse
import hashlib
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def production_path(name):
    return (name.endswith('.html') or name.startswith(('assets/', 'articles/', 'explorer/', 'tools/', 'requirements-'))
            or name in {'robots.txt', 'sitemap.xml', '.nojekyll'})


def check_production(revision='HEAD', root=ROOT):
    root = Path(root).resolve()
    revision = subprocess.check_output(['git', 'rev-parse', '--verify', revision+'^{commit}'],
                                       cwd=root, text=True, encoding='utf-8').strip()
    tree = subprocess.check_output(['git', 'ls-tree', '-r', '-z', revision], cwd=root)
    expected = {}
    for entry in tree.decode('utf-8').split('\0'):
        if not entry:
            continue
        info, name = entry.split('\t', 1)
        if production_path(name):
            mode, kind, digest = info.split()
            assert kind == 'blob' and mode in ('100644', '100755'), 'Type de fichier inattendu : '+name
            expected[name] = digest
    assert expected, 'Socle de production vide'
    actual = {p.relative_to(root).as_posix() for p in root.iterdir() if p.is_file() and production_path(p.name)}
    for folder in ('assets', 'articles', 'explorer', 'tools'):
        actual.update(p.relative_to(root).as_posix() for p in (root/folder).rglob('*') if p.is_file())
    assert actual == set(expected), 'Inventaire de production divergent : '+str(sorted(actual ^ set(expected)))
    for name, digest in expected.items():
        target = root/name
        assert target.resolve().is_relative_to(root), 'Fichier hors du projet : '+name
        data = target.read_bytes()
        blob = b'blob '+str(len(data)).encode('ascii')+b'\0'+data
        assert hashlib.sha1(blob).hexdigest() == digest, 'Production modifiée : '+name
    return len(expected)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--revision', default='HEAD')
    args = parser.parse_args()
    print(f'PASS : {check_production(args.revision)} fichiers de production identiques à {args.revision}, inventaire compris.')
