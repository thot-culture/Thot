#!/usr/bin/env python3
"""Compare le site publié aux fichiers locaux, sans publier ni appeler de source externe.

Usage : python3 scripts/check-published.py --root . --report /tmp/thot-publication.json
Chaque URL, y compris sa version de cache, fait l'objet d'un vrai GET.
Les ancres sont recherchées dans les HTML téléchargés, pas seulement dans le dépôt.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import quote, unquote, urljoin, urlsplit, urlunsplit
from urllib.request import Request, urlopen


DEFAULT_BASE = "https://thot-culture.github.io/Thot/"
HTML_FILES = (
    "index.html", "bibliotheque.html", "notre-methode.html", "quiz.html",
    "quiz-autrices.html", "articles/autrices-pseudonymes.html",
    "articles/autorite.html", "articles/pieuvres-couleur.html",
    "articles/puissance-etats-unis.html", "articles/roubaix-1917.html",
)
MIME_TYPES = {
    ".html": {"text/html", "application/xhtml+xml"},
    ".css": {"text/css"},
    ".js": {"text/javascript", "application/javascript", "application/x-javascript"},
    ".mjs": {"text/javascript", "application/javascript", "application/x-javascript"},
}
WORKERS = 6
TIMEOUT = 20


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.references = []
        self.base_href = None
        self.feed(text)
        self.close()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag == "a" and attrs.get("name"):
            self.ids.add(attrs["name"])
        if tag == "base" and self.base_href is None and attrs.get("href"):
            self.base_href = attrs["href"]
        for name in ("href", "src", "poster", "action", "formaction"):
            if tag != "base" and attrs.get(name):
                self.references.append(attrs[name])

    handle_startendtag = handle_starttag


def validate_base(value):
    parts = urlsplit(value)
    if (parts.scheme not in {"http", "https"} or not parts.netloc
            or parts.username is not None or parts.password is not None
            or parts.query or parts.fragment):
        raise ValueError("--base doit être une URL HTTP(S) sans identifiants, query ni fragment.")
    return urlunsplit((parts.scheme, parts.netloc, parts.path.rstrip("/") + "/", "", ""))


def local_path(url, base, root):
    """Retourne None pour une ressource externe, refuse toute sortie du projet."""
    target, origin = urlsplit(url), urlsplit(base)
    if (target.scheme.lower(), target.netloc.lower()) != (origin.scheme.lower(), origin.netloc.lower()):
        return None
    if not target.path.startswith(origin.path):
        return None
    relative = unquote(target.path[len(origin.path):])
    if not relative or relative.endswith("/"):
        relative += "index.html"
    path = (root / relative).resolve()
    if not path.is_relative_to(root):
        raise ValueError("Une référence locale sort du répertoire du projet.")
    return path


def inventory(root, base):
    assets = root / "assets"
    if not assets.is_dir():
        raise ValueError("Répertoire assets/ absent de --root.")
    files = [root / name for name in HTML_FILES]
    asset_files = sorted(path for path in assets.rglob("*") if path.is_file())
    files += asset_files + [root / "sitemap.xml"]
    jobs, anchors, errors = {}, [], []

    def add(url, path):
        if not path.is_file():
            errors.append("Fichier local attendu absent : " + str(path.relative_to(root)))
            return
        if not path.resolve().is_relative_to(root):
            errors.append("Un fichier attendu pointe hors du projet.")
            return
        jobs[url] = path

    for path in files:
        relative = path.relative_to(root).as_posix()
        add(base if relative == "index.html" else urljoin(base, quote(relative, safe="/")), path)
    for name in HTML_FILES:
        path = root / name
        if not path.is_file():
            continue
        page_url = base if name == "index.html" else urljoin(base, quote(name, safe="/"))
        page = Page(path.read_text(encoding="utf-8"))
        reference_base = urljoin(page_url, page.base_href) if page.base_href else page_url
        for reference in page.references:
            resolved = urljoin(reference_base, reference)
            parts = urlsplit(resolved)
            if parts.scheme not in {"http", "https"}:
                continue
            try:
                target = local_path(resolved, base, root)
            except ValueError as error:
                errors.append(f"{name} : {error}")
                continue
            if target is None:
                continue
            # Retirer seulement le fragment : ?v=… doit atteindre le serveur.
            request_url = urlunsplit(parts._replace(fragment=""))
            add(request_url, target)
            fragment = unquote(parts.fragment).split(":~:text=", 1)[0]
            if fragment:
                anchors.append({"source": name, "reference": reference,
                                "url": request_url, "fragment": fragment})
    return jobs, anchors, sorted(set(errors)), len(asset_files)


def fetch_one(url, path, expected_sha256):
    result = {"url": url, "file": str(path), "status": None,
              "expected_sha256": expected_sha256, "sha256": None,
              "mime": None, "errors": []}
    body = None
    request = Request(url, headers={"User-Agent": "THOT-postdeployment-check/1.0", "Accept": "*/*", "Cache-Control": "no-cache", "Pragma": "no-cache"}, method="GET")
    try:
        with urlopen(request, timeout=TIMEOUT) as response:
            result["status"] = response.status
            result["final_url"] = response.geturl()
            result["mime"] = response.headers.get_content_type().lower()
            body = response.read()
        if result["status"] != 200:
            result["errors"].append(f"HTTP {result['status']} : 200 attendu.")
        result["sha256"] = hashlib.sha256(body).hexdigest()
        if result["sha256"] != expected_sha256:
            result["errors"].append("SHA256 différent du fichier local attendu.")
        accepted = MIME_TYPES.get(path.suffix.lower())
        if accepted and result["mime"] not in accepted:
            result["errors"].append(f"MIME {result['mime']} incorrect ; attendu : {', '.join(sorted(accepted))}.")
    except HTTPError as error:
        result["status"] = error.code
        result["errors"].append(f"HTTP {error.code} : 200 attendu.")
        error.close()
    except (URLError, TimeoutError, OSError) as error:
        reason = getattr(error, "reason", error)
        detail = getattr(reason, "strerror", None) or type(reason).__name__
        result["errors"].append(f"Échec réseau ({detail}), délai maximal par opération : {TIMEOUT} s.")
    result["ok"] = not result["errors"]
    return result, body


def audit(root, base):
    started = time.monotonic()
    jobs, anchors, errors, asset_count = inventory(root, base)
    hashes = {path: hashlib.sha256(path.read_bytes()).hexdigest() for path in set(jobs.values())}
    resources, bodies = {}, {}
    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        pending = {executor.submit(fetch_one, url, path, hashes[path]): url for url, path in jobs.items()}
        for future in as_completed(pending):
            url = pending[future]
            result, body = future.result()
            result["file"] = jobs[url].relative_to(root).as_posix()
            resources[url] = result
            if result["status"] == 200 and body is not None and jobs[url].suffix.lower() in {".html", ".svg"}:
                bodies[url] = body
    ids = {url: Page(body.decode("utf-8-sig", errors="replace")).ids for url, body in bodies.items()}
    anchor_results = []
    seen = set()
    for anchor in anchors:
        key = (anchor["source"], anchor["url"], anchor["fragment"])
        if key in seen:
            continue
        seen.add(key)
        result = dict(anchor)
        if anchor["url"] not in ids:
            result.update(ok=False, error="Cible HTML/SVG indisponible ; ancre non vérifiée.")
        else:
            # #top est une destination spéciale définie par HTML, même sans id.
            exists = anchor["fragment"] in ids[anchor["url"]] or anchor["fragment"].lower() == "top"
            result.update(ok=exists)
            if not exists:
                result["error"] = "Ancre absente du document publié."
        anchor_results.append(result)
    bad_resources = sum(not result["ok"] for result in resources.values())
    bad_anchors = sum(not result["ok"] for result in anchor_results)
    return {
        "ok": not errors and not bad_resources and not bad_anchors,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "base": base, "root": str(root), "workers": WORKERS, "timeout_seconds": TIMEOUT,
        "duration_seconds": round(time.monotonic() - started, 2),
        "summary": {"html_pages": len(HTML_FILES), "asset_files": asset_count,
                    "requests": len(resources), "failed_requests": bad_resources,
                    "anchors": len(anchor_results), "failed_anchors": bad_anchors,
                    "inventory_errors": len(errors)},
        "errors": errors,
        "resources": [resources[url] for url in sorted(resources)],
        "anchors": anchor_results,
        "limitations": ["Sources externes exclues.", "Aucun test de rendu ou d’interaction navigateur.",
                        "Les fichiers HTML doivent être publiés sans transformation de leurs octets."],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default=DEFAULT_BASE, help="URL de base publiée (HTTP(S), sans authentification).")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1], help="Racine locale du projet THOT.")
    parser.add_argument("--report", type=Path, help="Chemin du rapport JSON optionnel.")
    args = parser.parse_args()
    try:
        base = validate_base(args.base)
        root = args.root.resolve()
        if not root.is_dir():
            raise ValueError("Le répertoire --root n’existe pas.")
        report = audit(root, base)
        if args.report:
            args.report.parent.mkdir(parents=True, exist_ok=True)
            args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    except (ValueError, OSError) as error:
        print(f"ERREUR : {error}", file=sys.stderr)
        return 2
    summary = report["summary"]
    print(f"{'PASS' if report['ok'] else 'ÉCHEC'} : {summary['requests']} GET, "
          f"{summary['html_pages']} pages, {summary['asset_files']} assets, "
          f"{summary['anchors']} ancres ; {report['duration_seconds']} s.")
    for error in report["errors"]:
        print("ERREUR : " + error)
    for resource in report["resources"]:
        for error in resource["errors"]:
            print(f"ERREUR : {resource['url']} — {error}")
    for anchor in report["anchors"]:
        if not anchor["ok"]:
            print(f"ERREUR : {anchor['source']} → {anchor['reference']} — {anchor['error']}")
    if args.report:
        print("Rapport JSON : " + str(args.report))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
