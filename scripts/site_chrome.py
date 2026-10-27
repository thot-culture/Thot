# -*- coding: utf-8 -*-
"""Navigation statique commune, également utilisée par le générateur Explorer."""
import re
import json
import hashlib
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://thot-culture.github.io/Thot/'
LINKS = [('index.html', 'Accueil'), ('bibliotheque.html', 'Bibliothèque'), ('explorer.html', 'Explorer'), ('quiz.html#quiz-classique', 'Quiz'), ('quiz.html#daily-title', 'Défi du jour'), ('notre-methode.html', 'Notre méthode'), ('index.html#concept', 'À propos')]
def version(name):
    return '/Thot/assets/' + name + '?v=' + hashlib.sha256((ROOT/'assets'/name).read_bytes()).hexdigest()[:12]
def normalize(page, html):
    current = 'explorer.html' if page.startswith('explorer/') else page
    def links(items):
        return ''.join('<a href="/Thot/'+url+'"'+(' aria-current="page"' if url == current else '')+'>'+label+'</a>' for url,label in items)
    def menu(match):
        attrs = re.sub(r'\s+id="[^"]*"|\s+data-site-navigation', '', match[1])
        return '<nav id="primary-navigation" data-site-navigation'+attrs+'>'+links(LINKS)+'</nav>'
    html = re.sub(r'<nav\b([^>]*aria-label="Navigation principale"[^>]*)>.*?</nav>', menu, html, count=1, flags=re.S)
    if 'id="mobile-menu-button"' not in html:
        html = html.replace('<nav id="primary-navigation"', '<button id="mobile-menu-button" class="mobile-menu-button" type="button" aria-controls="primary-navigation" aria-expanded="false" aria-label="Ouvrir le menu"><span aria-hidden="true">☰</span> Menu</button><nav id="primary-navigation"', 1)
    if page not in ('index.html', 'quiz.html'):
        html = re.sub(r'<script src="/Thot/assets/navigation\.js[^\"]*" defer></script>', '', html)
        html = html.replace('</body>', '<script src="'+version('navigation.js')+'" defer></script></body>')
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
    return html
if __name__ == '__main__':
    import argparse
    parser=argparse.ArgumentParser(); parser.add_argument('--check',action='store_true'); args=parser.parse_args()
    for path in list(ROOT.glob('*.html'))+list((ROOT/'articles').glob('*.html'))+list((ROOT/'explorer').rglob('*.html')):
        before=path.read_text(encoding='utf-8'); after=normalize(path.relative_to(ROOT).as_posix(),before)
        if args.check: assert before==after, 'À harmoniser : '+str(path)
        elif before!=after: path.write_text(after,encoding='utf-8',newline='\n')
    print('PASS : navigation, liens utiles et métadonnées harmonisés.')
