#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Photographier le site public en lecture seule ; aucune consultation de Search Console.
Vérifie pages HTML et ressources directement référencées (pas les imports CSS/JS).
"""
import portable_io
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
from urllib.error import HTTPError
from urllib.parse import urljoin
from urllib.request import Request, build_opener, HTTPRedirectHandler

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('thot_seo', ROOT / 'scripts/check-seo.py')
seo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seo)


class Redirects(HTTPRedirectHandler):
    def __init__(self):
        self.hops = []

    def redirect_request(self, request, response, code, message, headers, newurl):
        self.hops.append({'status': code, 'from': request.full_url, 'to': newurl})
        return super().redirect_request(request, response, code, message, headers, newurl)


def fetch(url):
    redirects = Redirects()
    result = {'url': url}
    try:
        with build_opener(redirects).open(Request(url, headers={
                'User-Agent': 'THOT-SEO-audit/1.0', 'Accept-Encoding': 'identity'}), timeout=30) as response:
            result.update(status=response.status, final_url=response.url,
                          headers={key: response.headers[key] for key in ('Content-Type', 'Content-Encoding',
                          'Content-Length', 'Cache-Control', 'Last-Modified', 'X-Robots-Tag') if key in response.headers},
                          body=response.read())
    except HTTPError as error:
        result.update(status=error.code, final_url=error.url, headers={}, body=error.read())
    except Exception as error:
        result.update(status=None, error=type(error).__name__ + ': ' + str(error), body=b'')
    result['redirects'] = redirects.hops
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'work/seo-public.json')
    args = parser.parse_args()
    base = json.loads((ROOT / 'assets/article-editorial.json').read_text(encoding='utf-8'))['base_url']
    paths = sorted(p.relative_to(ROOT).as_posix() for p in [*ROOT.glob('*.html'),
                    *(ROOT / 'articles').glob('*.html'), *(ROOT / 'explorer').rglob('*.html')])
    refs = {'main': 'origin/main', 'PR22': 'origin/work/harmonie-visuelle-20261103',
            'PR23': 'origin/work/audit-final-thot-20261103'}
    revisions = {name: subprocess.check_output(['git', 'rev-parse', ref], cwd=ROOT, text=True).strip() for name, ref in refs.items()}
    assets, external, rows = set(), set(), []
    with ThreadPoolExecutor(max_workers=8) as pool:
        responses = list(pool.map(fetch, [base if name == 'index.html' else base + name for name in paths]))
    for name, response in zip(paths, responses):
        body = response.pop('body')
        page = seo.Page(body.decode('utf-8'))
        matches = []
        for label, revision in revisions.items():
            reference = subprocess.run(['git', 'show', revision + ':' + name], cwd=ROOT, capture_output=True)
            if reference.returncode == 0 and reference.stdout == body:
                matches.append(label)
        response.update(path=name, sha256=hashlib.sha256(body).hexdigest(), exact_matches=matches,
                        title=page.titles, description=page.one('description'), canonical=page.canonical,
                        robots=page.meta.get('robots'), googlebot=page.meta.get('googlebot'),
                        og={k: v for k, v in page.meta.items() if k.startswith('og:')},
                        headings=page.headings, schemas=page.schemas, images=page.images, links=page.links,
                        verification_present='google-site-verification' in page.meta)
        # La valeur de la balise de vérification n'est pas copiée dans le rapport.
        references = page.resources + ([page.one('og:image')] if page.one('og:image') else [])
        assets.update(urljoin(response['url'], asset) for asset in references if urljoin(response['url'], asset).startswith('http'))
        external.update(urljoin(response['url'], link) for link in page.links if urljoin(response['url'], link).startswith('http') and not urljoin(response['url'], link).startswith(base))
        rows.append(response)
    with ThreadPoolExecutor(max_workers=8) as pool:
        resources = list(pool.map(fetch, sorted(assets)))
    for resource in resources:
        resource['bytes'] = len(resource.pop('body'))
    extras = []
    for url in [base + 'sitemap.xml', base + 'robots.txt', urljoin(base, '/robots.txt'),
                base + 'seo-page-inexistante-20261104.html', base + 'index.html', base.rstrip('/')]:
        response = fetch(url)
        body = response.pop('body')
        response['bytes'] = len(body)
        if response.get('status') == 200 and url.endswith(('.xml', 'robots.txt')):
            response['text'] = body.decode('utf-8')
        extras.append(response)
    result = {'checked_utc': datetime.now(timezone.utc).isoformat(), 'base_url': base,
              'revisions': revisions, 'pages': rows, 'resources': resources,
              'extras': extras, 'external_urls': sorted(external)}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'pages': len(rows), 'http_200': sum(p.get('status') == 200 for p in rows),
                      'resources': len(resources), 'resource_errors': [r['url'] for r in resources if r.get('status') != 200],
                      'all_match_main': all('main' in p['exact_matches'] for p in rows)}, ensure_ascii=False))
    return any(p.get('status') != 200 for p in rows + resources)


if __name__ == '__main__':
    raise SystemExit(main())
