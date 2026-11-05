#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Exécuter la recette HTTP existante avec un serveur local, sur tout OS."""
import portable_io
from pathlib import Path
import subprocess
import sys
import time
import os
import socket
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
with socket.socket() as candidate:
    candidate.bind(('127.0.0.1', 0))
    port = candidate.getsockname()[1]
base = f'http://127.0.0.1:{port}/Thot/'
server = subprocess.Popen([sys.executable, "scripts/preview.py", '--port', str(port)], cwd=ROOT,
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for attempt in range(100):
        try:
            if server.poll() is not None:
                raise RuntimeError('Le serveur de recette ne démarre pas')
            with urlopen(base, timeout=1) as response:
                assert response.status == 200
                assert response.read() == (ROOT/'index.html').read_bytes(), 'Mauvaise copie de travail'
            break
        except OSError:
            time.sleep(.1)
    else:
        raise RuntimeError('Le serveur de recette ne répond pas')
    subprocess.run(["node", "scripts/test-site-browser.cjs"], cwd=ROOT,
                   env=dict(os.environ, THOT_BASE_URL=base), check=True)
finally:
    server.terminate()
    server.wait(timeout=5)
