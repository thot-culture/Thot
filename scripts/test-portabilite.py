#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Contrôles reproductibles sans navigateur, exécutables sur Windows et Linux."""
import portable_io
from pathlib import Path
import ast
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile

ROOT=Path(__file__).resolve().parents[1]

def check():
    fontdir=ROOT/'tools/fonts/dejavu'
    hashes=json.loads((fontdir/'SHA256.json').read_text(encoding='utf-8'))
    assert all(hashlib.sha256((fontdir/name).read_bytes()).hexdigest()==value for name,value in hashes.items())
    for p in (ROOT/'scripts').glob('*.py'):
        text=p.read_text(encoding='utf-8')
        assert 'coding: utf-8' in text,p
        for n in ast.walk(ast.parse(text)):
            if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.attr in ('read_text','write_text'):
                assert any(k.arg=='encoding' for k in n.keywords),(p,n.lineno)
    env=dict(os.environ,PYTHONUTF8='0',PYTHONIOENCODING='cp1252')
    with tempfile.TemporaryDirectory(prefix='THOT portable ') as folder:
        fonts=Path(folder)/'fonts with spaces'
        shutil.copytree(fontdir,fonts)
        commands=[['generate-social-cards.py','--check'],['generate-social-cards.py','--check','--font-directory',str(fonts)],['update-article-editorial.py','--check'],['update-reading-times.py','--check'],['build-quiz-references.py','--check']]
        for args in commands:
            subprocess.run([sys.executable,str(ROOT/'scripts'/args[0]),*args[1:]],cwd=folder,env=env,check=True)
    print('PASS : polices identiques, cartes PNG reproductibles, UTF-8, chemin avec espaces et génération indépendante du dossier courant. Plateforme : '+sys.platform)

if __name__=='__main__':check()
