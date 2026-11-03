#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Exécuter la recette HTTP existante avec un serveur local, sur tout OS."""
import portable_io
from pathlib import Path
import subprocess
import sys
import time
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
server = subprocess.Popen([sys.executable, "scripts/preview.py"], cwd=ROOT,
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
try:
    for attempt in range(100):
        try:
            with urlopen("http://127.0.0.1:8765/Thot/", timeout=1) as response:
                assert response.status == 200
            break
        except OSError:
            time.sleep(.1)
    subprocess.run(["node", "scripts/test-site-browser.cjs"], cwd=ROOT, check=True)
finally:
    server.terminate()
    server.wait(timeout=5)
