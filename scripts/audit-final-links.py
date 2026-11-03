#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Disponibilité HTTP externe, médias dynamiques et pages publiques ; lecture seule.
Un refus automatique n'est jamais assimilé à une erreur documentaire certaine.
"""
import portable_io
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import time
from urllib.error import HTTPError
from urllib.parse import urldefrag, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get("THOT_OUTPUT_DIR", str(ROOT / "work/links")))
OUT.mkdir(parents=True, exist_ok=True)
urls = {}
pages = [*ROOT.glob("*.html"), *(ROOT / "articles").glob("*.html"), *(ROOT / "explorer").rglob("*.html")]


def add(value, owner, kind):
    if isinstance(value, str) and value.startswith("https://"):
        url = urldefrag(value)[0]
        urls.setdefault(url, []).append({"owner": owner, "kind": kind})


class Links(HTMLParser):
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for name in ("href", "src"):
            u = a.get(name, "")
            if urlsplit(u).hostname != "thot-culture.github.io":
                add(u, owner, tag)
        if tag == "link" and a.get("rel") == "canonical":
            add(a.get("href"), owner, "public-page")


for page in pages:
    owner = page.relative_to(ROOT).as_posix()
    Links().feed(page.read_text(encoding="utf-8"))
for key, value in json.loads((ROOT / "assets/illustrations.json").read_text(encoding="utf-8")).items():
    for field in ("url", "sourceUrl", "licenceUrl"):
        add(value.get(field), "illustrations.json:" + key, field)
quiz = (ROOT / "assets/quiz-reference-data.js").read_text(encoding="utf-8")
for record in json.loads(quiz[quiz.index("=") + 1:].strip().removesuffix(";")):
    for source in record["sources"]:
        add(source["url"], record["id"], "quiz-reference")
for suffix in ("robots.txt", "sitemap.xml", "page-inconnue-audit.html"):
    add("https://thot-culture.github.io/Thot/" + suffix, suffix, "public-infrastructure")
add("https://thot-culture.github.io/robots.txt", "host root", "robots-host-root")


def check(item):
    url, owners = item
    started = time.monotonic()
    result = {"url": url, "owners": owners}
    try:
        with urlopen(Request(url, headers={"User-Agent": "THOT-editorial-link-audit/1.0"}), timeout=15) as response:
            beginning = response.read(1024)
            result.update(status=response.status, final=response.url,
                          content_type=response.headers.get("Content-Type"),
                          content_length=response.headers.get("Content-Length"))
    except HTTPError as error:
        result.update(status=error.code, final=error.url, error=str(error))
    except Exception as error:
        result.update(status=None, error=type(error).__name__ + ": " + str(error))
    result["seconds"] = round(time.monotonic() - started, 2)
    return result


with ThreadPoolExecutor(max_workers=6) as pool:
    results = list(pool.map(check, sorted(urls.items())))
(OUT / "http-links.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
counts = {}
for result in results:
    status = str(result["status"])
    counts[status] = counts.get(status, 0) + 1
print("HTTP_LINKS_SUMMARY " + json.dumps(counts))
print("HTTP_LINKS_RESULT_JSON " + json.dumps(results, ensure_ascii=True))
