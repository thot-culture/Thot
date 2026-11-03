# -*- coding: utf-8 -*-
"""Navigation et identité visuelle communes, utilisées aussi par le générateur Explorer."""
import re
import json
import hashlib
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://thot-culture.github.io/Thot/'
LINKS = [('index.html', 'Accueil'), ('bibliotheque.html', 'Bibliothèque'), ('explorer.html', 'Explorer'), ('quiz.html#quiz-classique', 'Quiz'), ('quiz.html#daily-title', 'Défi du jour'), ('notre-methode.html', 'Notre méthode'), ('index.html#concept', 'À propos')]
BRAND_ICON = '<svg class="site-brand-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="22" stroke="currentColor" stroke-width="1.5"/><path d="M13 33c9-6 10-12 9-21 5 3 7 8 7 13l12 2-11 4c-2 6-7 8-14 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="25" cy="17" r="1.35" fill="currentColor"/></svg>'

def normalize_brand(match):
    attrs = re.sub(r'\s+data-site-brand(?:="[^"]*")?', '', match[1])
    if 'aria-label=' not in attrs:
        attrs += ' aria-label="THOT, accueil"'
    tagline = '<span class="site-brand-tagline">La curiosité<br>en mouvement</span>' if 'xp-brand' in attrs else ''
    return '<a'+attrs+' data-site-brand>'+BRAND_ICON+'<span class="site-brand-name">THOT</span>'+tagline+'</a>'
def version(name):
    return '/Thot/assets/' + name + '?v=' + hashlib.sha256((ROOT/'assets'/name).read_bytes()).hexdigest()[:12]
def normalize(page, html):
    current = 'explorer.html' if page.startswith('explorer/') else page
    html = re.sub(r'<header\b([^>]*)>', lambda m: '<header'+re.sub(r'\s+data-site-header', '', m[1])+' data-site-header>', html, count=1)
    # L’enquête Aral possède aussi un footer dans son outil : seule la coque finale est commune.
    html = re.sub(r'\s+data-site-footer\b', '', html)
    before_footer, footer_tag, after_footer = html.rpartition('<footer')
    if footer_tag:
        html = before_footer+footer_tag+after_footer.replace('>', ' data-site-footer>', 1)
    # Ne normaliser que la marque de l’en-tête, jamais les documents ni activités.
    html = re.sub(r'<a\b([^>]*\bclass="(?:brand|marque|xp-brand)"[^>]*)>.*?</a>', normalize_brand, html, count=1, flags=re.S)
    def links(items):
        return ''.join('<a href="/Thot/'+url+'"'+(' aria-current="page"' if url == current else '')+'>'+label+'</a>' for url,label in items)
    def menu(match):
        attrs = re.sub(r'\s+id="[^"]*"|\s+data-site-navigation', '', match[1])
        return '<nav id="primary-navigation" data-site-navigation'+attrs+'>'+links(LINKS)+'</nav>'
    html = re.sub(r'<nav\b([^>]*aria-label="Navigation principale"[^>]*)>.*?</nav>', menu, html, count=1, flags=re.S)
    if 'id="mobile-menu-button"' not in html:
        html = html.replace('<nav id="primary-navigation"', '<button id="mobile-menu-button" class="mobile-menu-button" type="button" aria-controls="primary-navigation" aria-expanded="false" aria-label="Ouvrir le menu"><span aria-hidden="true">☰</span> Menu</button><nav id="primary-navigation"', 1)
    # Installer le menu avant le premier rendu du main évite son déplacement
    # lorsque les autres scripts différés ou les images prennent du temps.
    html = re.sub(r'\s*<script data-site-menu>[\s\S]*?</script>', '', html)
    html = re.sub(r'<script src="/Thot/assets/navigation\.js[^\"]*" defer></script>', '', html)
    menu_script = (ROOT/'assets/navigation.js').read_text(encoding='utf-8')
    html = re.sub(r'\s*<script data-quiz-startup>[\s\S]*?</script>', '', html)
    startup = ''
    if page == 'quiz.html':
        startup = '<script data-quiz-startup>'+(ROOT/'assets/quiz-startup.js').read_text(encoding='utf-8')+'</script>'
    html = html.replace('</header>', '</header><script data-site-menu>'+menu_script+'</script>'+startup, 1)
    if not re.search(r'<link\b[^>]*rel="(?:shortcut )?icon"', html):
        html = html.replace('</head>', '<link rel="icon" type="image/svg+xml" href="/Thot/assets/favicon.svg"></head>')
    utility = '<nav data-site-utility aria-label="Informations du site">'+links([('contact.html','Contact et corrections'),('mentions-legales.html','Informations légales'),('confidentialite.html','Confidentialité')])+'</nav>'
    html = re.sub(r'<nav data-site-utility.*?</nav>', '', html, flags=re.S)
    if '</footer>' in html:
        start,end = html.rsplit('</footer>',1)
        html = start+utility+'</footer>'+end
    else: html = html.replace('</body>', '<footer class="site-info-footer">'+utility+'</footer></body>')
    html = re.sub(r'(<nav id="site-parcours"[^>]*>).*?(</nav>)', lambda m:m[1]+links(LINKS[:4]+[LINKS[5]])+m[2], html, flags=re.S)
    if page != '404.html':
        title = re.search(r'<title>(.*?)</title>', html, re.S)[1]
        if 'application/ld+json' not in html:
            schema = {'@context':'https://schema.org','@type':'WebSite' if page=='index.html' else 'WebPage','name':title,'url':BASE+('' if page=='index.html' else page),'inLanguage':'fr'}
            html = html.replace('</head>', '<script type="application/ld+json">'+json.dumps(schema,ensure_ascii=False)+'</script></head>')
        for prop, content in [('og:site_name','THOT'), ('og:locale','fr_FR')]:
            if 'property="'+prop+'"' not in html: html = html.replace('</head>', '<meta property="'+prop+'" content="'+content+'"></head>')
    html = re.sub(r'<link rel="stylesheet" href="/Thot/assets/navigation\.css[^\"]*">', '', html)
    html = html.replace('</head>', '<link rel="stylesheet" href="'+version('navigation.css')+'"></head>')
    html = re.sub(r'<link rel="stylesheet" href="/Thot/assets/visual-system\.css[^\"]*">', '', html)
    html = html.replace('</head>', '<link rel="stylesheet" href="'+version('visual-system.css')+'"></head>')
    return html
if __name__ == '__main__':
    import argparse
    parser=argparse.ArgumentParser(); parser.add_argument('--check',action='store_true'); args=parser.parse_args()
    for path in list(ROOT.glob('*.html'))+list((ROOT/'articles').glob('*.html'))+list((ROOT/'explorer').rglob('*.html')):
        before=path.read_text(encoding='utf-8'); after=normalize(path.relative_to(ROOT).as_posix(),before)
        if args.check: assert before==after, 'À harmoniser : '+str(path)
        elif before!=after: path.write_text(after,encoding='utf-8',newline='\n')
    print('PASS : navigation, liens utiles et métadonnées harmonisés.')
