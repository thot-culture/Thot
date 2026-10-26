# -*- coding: utf-8 -*-
"""Fixture Chromium locale : CSS/JS réels, médias locaux incorporés sans retouche.

Aucune navigation réseau : les ressources externes ne sont pas vérifiées ici.
Ne remplace pas les contrôles HTTP après publication ni un lecteur d’écran réel.
"""
import portable_io  # Encodage CLI stable, sans dépendance système.
import base64
import mimetypes
from pathlib import Path
import re
import os
import shutil

ROOT = Path(__file__).resolve().parents[1]


def local_file(article, value):
    if value.startswith(("https:", "http:", "data:", "#")):
        return None
    clean = value.split("?")[0]
    target = ((ROOT / clean[len('/Thot/'):]) if clean.startswith('/Thot/') else (article.parent / clean)).resolve()
    return target if target.is_relative_to(ROOT) and target.is_file() else None


def markup(relative, javascript=True):
    article = ROOT / relative
    html = article.read_text(encoding="utf-8")

    def css(match):
        target = local_file(article, match[1])
        return '<style>' + target.read_text(encoding="utf-8") + '</style>' if target else ''

    html = re.sub(r'<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>', css, html)

    def script(match):
        target = local_file(article, match[1])
        if not target or not javascript:
            return ''
        # Préserver la provenance du script lors de l’inlining pour les modules
        # qui calculent leurs URL de médias à partir de currentScript.src.
        source = 'https://thot.local/Thot/' + target.relative_to(ROOT).as_posix()
        return '<script>Object.defineProperty(document.currentScript,"src",{value:' + repr(source) + '});\n' + target.read_text(encoding="utf-8") + '</script>'

    html = re.sub(r'<script\b[^>]*src="([^"]+)"[^>]*>\s*</script>', script, html)

    def image(match):
        target = local_file(article, match[2])
        if not target:
            return match[0]
        mime = mimetypes.guess_type(target)[0] or 'application/octet-stream'
        return match[1] + '="data:' + mime + ';base64,' + base64.b64encode(target.read_bytes()).decode() + '"'

    return re.sub(r'(src|data-full-src)="([^"]+)"', image, html)


def chromium(playwright):
    configured = os.environ.get('THOT_CHROMIUM_EXECUTABLE')
    executable = configured or shutil.which('chromium') or shutil.which('chromium-browser')
    options = {'executable_path': executable} if executable else {}
    return playwright.chromium.launch(
        **options, headless=True,
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
