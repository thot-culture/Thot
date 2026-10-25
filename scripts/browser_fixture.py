"""Fixture Chromium locale : CSS/JS réels, médias locaux incorporés sans retouche.

Aucune navigation réseau : les ressources externes ne sont pas vérifiées ici.
Ne remplace pas les contrôles HTTP après publication ni un lecteur d’écran réel.
"""
import base64
import mimetypes
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def local_file(article, value):
    if value.startswith(("https:", "http:", "data:", "#")):
        return None
    target = (article.parent / value.split("?")[0]).resolve()
    return target if target.is_relative_to(ROOT) and target.is_file() else None


def markup(relative, javascript=True):
    article = ROOT / relative
    html = article.read_text()

    def css(match):
        target = local_file(article, match[1])
        return '<style>' + target.read_text() + '</style>' if target else ''

    html = re.sub(r'<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>', css, html)

    def script(match):
        target = local_file(article, match[1])
        return '<script>' + target.read_text() + '</script>' if target and javascript else ''

    html = re.sub(r'<script\b[^>]*src="([^"]+)"[^>]*>\s*</script>', script, html)

    def image(match):
        target = local_file(article, match[2])
        if not target:
            return match[0]
        mime = mimetypes.guess_type(target)[0] or 'application/octet-stream'
        return match[1] + '="data:' + mime + ';base64,' + base64.b64encode(target.read_bytes()).decode() + '"'

    return re.sub(r'(src|data-full-src)="([^"]+)"', image, html)


def chromium(playwright):
    return playwright.chromium.launch(
        executable_path='/usr/lib/chromium/chromium', headless=True,
        args=['--no-sandbox', '--disable-crashpad-for-testing', '--disable-dev-shm-usage'],
        timeout=10000)


def page_for(browser, relative, width=390, javascript=True):
    context = browser.new_context(viewport={'width': width, 'height': 900},
                                  java_script_enabled=javascript, offline=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content(markup(relative, javascript), wait_until='domcontentloaded', timeout=10000)
    return context, page, errors


def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'Débordement horizontal de la page'
