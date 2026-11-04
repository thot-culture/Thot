#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Captures avant correction depuis le commit exact de la PR #22."""
import portable_io
from pathlib import Path
import os
import subprocess
import tempfile
import time
from urllib.request import urlopen
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ["THOT_OUTPUT_DIR"])
OUT.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix="THOT baseline ") as temp:
    baseline = Path(temp) / "before"
    subprocess.run(["git", "worktree", "add", "--detach", str(baseline),
                    "c7b62ad61c5ddabc63c61560175a55c85ec80200"], cwd=ROOT, check=True)
    process = subprocess.Popen(["python", "scripts/preview.py", "--port", "8866"],
                               cwd=baseline, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for attempt in range(100):
            try:
                with urlopen("http://127.0.0.1:8866/Thot/", timeout=1) as response:
                    assert response.status == 200
                break
            except OSError:
                time.sleep(.1)
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            for width in (390, 1440):
                page = browser.new_page(viewport={"width": width, "height": 900})
                for name, selector, label in [
                    ("index.html", ".latest-story", "home-feature"),
                    ("articles/roubaix-1917.html", ".thot-document-overline", "roubaix-contrast")]:
                    page.goto("http://127.0.0.1:8866/Thot/" + name, wait_until="domcontentloaded")
                    page.locator(selector).screenshot(path=str(OUT / (label + "-" + str(width) + ".png")))
                page.close()
            browser.close()
    finally:
        process.terminate()
        process.wait(timeout=5)
        subprocess.run(["git", "worktree", "remove", "--force", str(baseline)], cwd=ROOT, check=True)
