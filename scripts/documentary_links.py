# -*- coding: utf-8 -*-
"""Inventaire en lecture seule ; HTTP seul ne valide jamais une source documentaire."""
import portable_io
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import time
from urllib.error import HTTPError
from urllib.parse import urldefrag, urlsplit
from urllib.request import Request, urlopen


class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.words = []; self.title = []; self.in_title = False
        self.hidden = 0

    def handle_starttag(self, tag, attrs):
        if tag == 'title': self.in_title = True
        if tag in ('script', 'style'): self.hidden += 1

    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag in ('script', 'style'): self.hidden = max(0, self.hidden - 1)

    def handle_data(self, data):
        if self.in_title: self.title.append(data)
        if not self.hidden: self.words.append(data)


def inventory(root):
    root = Path(root)
    urls = {}

    def add(value, owner, kind):
        if not isinstance(value, str) or not value.startswith(('https://', 'http://')): return
        url = urldefrag(value)[0]
        record = {'owner': owner, 'kind': kind}
        if record not in urls.setdefault(url, []): urls[url].append(record)

    class Links(HTMLParser):
        def handle_starttag(self, tag, attrs):
            a = dict(attrs)
            for field in ('href', 'src', 'poster'):
                value = a.get(field, '')
                if urlsplit(value).hostname != 'thot-culture.github.io':
                    add(value, owner, tag + ':' + field)
            if tag == 'link' and a.get('rel') == 'canonical':
                add(a.get('href'), owner, 'public-page')

    pages = [*root.glob('*.html'), *(root/'articles').rglob('*.html'), *(root/'explorer').rglob('*.html')]
    for page in pages:
        owner = page.relative_to(root).as_posix()
        Links().feed(page.read_text(encoding='utf-8'))

    def walk(value, owner, trail=''):
        if isinstance(value, dict):
            for k, v in value.items(): walk(v, owner, trail + '/' + k)
        elif isinstance(value, list):
            for i, v in enumerate(value): walk(v, owner, trail + '/' + str(i))
        elif isinstance(value, str): add(value, owner, 'data:' + trail)

    for path in [root/'assets/illustrations.json', *(root/'assets/explorer-v2/data').glob('*.json')]:
        if path.exists(): walk(json.loads(path.read_text(encoding='utf-8')), path.relative_to(root).as_posix())
    path = root/'assets/quiz-reference-data.js'
    if path.exists():
        quiz = path.read_text(encoding='utf-8')
        walk(json.loads(quiz[quiz.index('=')+1:].strip().removesuffix(';')), path.relative_to(root).as_posix())
    for path in [*(root/'assets').rglob('*.js'), *(root/'assets').rglob('*.css')]:
        if path.name == 'quiz-reference-data.js': continue
        for match in re.finditer(r'https?://[^\s<>"\x27`\\]+', path.read_text(encoding='utf-8')):
            if not any(x in match[0] for x in ('www.w3.org/', 'schema.org/')):
                add(match[0], path.relative_to(root).as_posix(), 'literal')
    for suffix in ('robots.txt', 'sitemap.xml', 'page-inconnue-audit.html'):
        add('https://thot-culture.github.io/Thot/' + suffix, suffix, 'public-infrastructure')
    add('https://thot-culture.github.io/robots.txt', 'host root', 'robots-host-root')
    return urls


def inspect_response(url, status, final, content_type, data, encoding='utf-8'):
    """Signaux de relecture, jamais de remplacement automatique de source."""
    result = {'status': status, 'final': final, 'content_type': content_type,
              'signals': [], 'assessment': 'http-response-only'}
    if status in (401, 403, 429): result['signals'].append('automated-access-refused')
    elif status >= 400: result['signals'].append('http-error-review-required')
    if 'html' in content_type.lower():
        try: content = data.decode(encoding, errors='replace')
        except LookupError: content = data.decode('utf-8', errors='replace')
        parsed = Text(); parsed.feed(content)
        title = ' '.join(''.join(parsed.title).split())
        plain = ' '.join(' '.join(parsed.words).split())
        result.update(title=title, text_excerpt=plain[:1200])
        lower = (title + ' ' + plain[:2000]).lower()
        if any(s in lower for s in ('client challenge', 'just a moment', 'vérification de sécurité',
                                   'checking your browser', 'requires js enabled and cookies',
                                   'captcha', 'un instant…')):
            result['signals'].append('browser-check-required')
        if any(s in title.lower() for s in ('omeka a rencontré une erreur', 'page not found',
                                           'page introuvable', 'maintenance', '404 not found')):
            result['signals'].append('html-error-page-review-required')
        if urlsplit(url).path.lower().endswith('.pdf'):
            result['signals'].append('expected-pdf-received-html')
        if not title and len(plain) < 100:
            result['signals'].append('empty-or-script-only-response')
    if final != url and urlsplit(final).path.rstrip('/') in ('', '/fr', '/en'):
        result['signals'].append('redirect-to-home-review-required')
    if result['signals']: result['assessment'] = 'manual-review-required'
    return result


def check(item, timeout=15):
    url, owners = item
    started = time.monotonic()
    result = {'url': url, 'owners': owners, 'checked_at': datetime.now(timezone.utc).isoformat()}
    try:
        with urlopen(Request(url, headers={'User-Agent': 'THOT-editorial-link-audit/2.0'}), timeout=timeout) as response:
            data = response.read(262144)
            result.update(inspect_response(url, response.status, response.url,
                          response.headers.get('Content-Type', ''), data,
                          response.headers.get_content_charset() or 'utf-8'))
            result.update(content_length=response.headers.get('Content-Length'), bytes_read=len(data))
    except HTTPError as error:
        result.update(inspect_response(url, error.code, error.url,
                      error.headers.get('Content-Type', ''), error.read(8192)))
        result['error'] = str(error)
    except Exception as error:
        result.update(status=None, error=type(error).__name__ + ': ' + str(error),
                      signals=['network-or-tls-error-review-required'], assessment='manual-review-required')
    result['seconds'] = round(time.monotonic() - started, 2)
    return result


def run(root, out, inventory_only=False):
    urls = inventory(root)
    out = Path(out); out.mkdir(parents=True, exist_ok=True)
    (out/'inventory.json').write_text(json.dumps(urls, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    if inventory_only: return []
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(check, sorted(urls.items())))
    (out/'http-links.json').write_text(json.dumps(results, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    return results
