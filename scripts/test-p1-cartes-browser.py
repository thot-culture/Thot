#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Recette P1 réelle, sous /Thot/ ou sur Pages ; captures et mesures JSON."""
import portable_io
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base', default='http://127.0.0.1:8765/Thot/')
parser.add_argument('--output', default='work/p1/after')
parser.add_argument('--before', action='store_true', help='Mesurer le socle sans exiger les corrections P1')
args = parser.parse_args()
out = ROOT / args.output
out.mkdir(parents=True, exist_ok=True)
config = json.loads((ROOT / 'assets/article-editorial.json').read_text(encoding='utf-8'))
records = {a['slug']: a for a in config['articles']}
reading = json.loads((ROOT/'assets/reading-times.json').read_text(encoding='utf-8'))['articles']
report = {'base': args.base, 'before': args.before, 'pages': [], 'interactions': []}

MEASURE = """cards => cards.map(c => {
 const box = e => { const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; };
 const style = e => {const s=getComputedStyle(e);return {padding:s.padding,font:s.font,border:s.border,borderRadius:s.borderRadius,boxShadow:s.boxShadow};};
 const image=c.querySelector('img'), frame=c.querySelector('.discovery-photo');
 const title=c.querySelector('h3'), credit=c.querySelector('.discovery-credit');
 return {href:c.querySelector('a').getAttribute('href'),title:title.textContent,
 box:box(c),frame:box(frame),heading:box(title),bottom:box(c.querySelector('.discovery-card__bottom')),credit:box(credit),
 image:{src:image.getAttribute('src'),currentSrc:image.currentSrc,natural:[image.naturalWidth,image.naturalHeight],declared:[+image.getAttribute('width'),+image.getAttribute('height')],alt:image.alt,loaded:image.complete&&image.naturalWidth>0,fit:getComputedStyle(image).objectFit,position:getComputedStyle(image).objectPosition},
 styles:{card:style(c),copy:style(c.querySelector('.discovery-card__copy')),title:style(title),meta:style(c.querySelector('.discovery-meta')),bottom:style(c.querySelector('.discovery-card__bottom')),credit:style(credit)},
 creditText:credit.textContent.trim(),clamped:getComputedStyle(title).webkitLineClamp,
 date:c.querySelector('time').dateTime,reading:c.querySelector('.reading-pill').textContent};
})"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    report['browser'] = browser.version
    for width in (320, 390, 768, 1024, 1440):
        styles = []
        for filename, name, region in [('index.html', 'accueil', '.editorial'), ('bibliotheque.html', 'bibliotheque', '.article-grid')]:
            page = browser.new_page(viewport={'width': width, 'height': 900}, device_scale_factor=1)
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            response = page.goto(args.base + filename, wait_until='networkidle')
            assert response.status == 200
            page.locator('.discovery-photo img').evaluate_all('imgs => Promise.all(imgs.map(i=>{i.loading="eager";return i.decode()}))')
            page.evaluate('document.fonts.ready')
            cards = page.locator('.discovery-card').evaluate_all(MEASURE)
            overflow = page.evaluate('document.documentElement.scrollWidth > innerWidth')
            page.screenshot(path=str(out / f'{name}-{width}.png'), full_page=True)
            # Une capture isolée par carte permet de juger le cadrage en miniature.
            if name == 'bibliotheque' and width in (390, 1440):
                for card in page.locator('.discovery-card').all():
                    slug = card.locator('a').first.get_attribute('href').split('/')[-1].removesuffix('.html')
                    card.screenshot(path=str(out / f'carte-{slug}-{width}.png'))
            assert len(cards) == (7 if name == 'accueil' else 8)
            assert not overflow, (name, width, 'débordement')
            assert not errors, errors
            for c in cards:
                assert c['image']['loaded'] and c['creditText'] and c['image']['alt']
                assert c['clamped'] in ('none', '0'), c
                if not args.before:
                    slug = c['href'].split('/')[-1].removesuffix('.html')
                    a = records[slug]
                    assert ' '.join(c['title'].split()) == a['headline']
                    assert c['image']['src'] == a['catalogue']['image']['src']
                    assert c['image']['declared'] == [a['catalogue']['image']['width'], a['catalogue']['image']['height']]
                    assert c['date'] == a['published']
                    assert c['reading'] == f"{reading[slug]['minutes']} min de lecture"
                    assert a['catalogue']['credit'] in c['creditText']
                    assert abs(c['frame']['w']/c['frame']['h']-1.6) < .005, c
                    assert c['image']['fit'] in ('cover', 'contain')
                    assert c['styles'] == cards[0]['styles'], (name,width,'styles divergents')
            if width < 761:
                assert len({round(c['box']['x']) for c in cards}) == 1
            elif not args.before:
                for i in range(0, len(cards)-1, 2):
                    for part in ('box', 'frame', 'heading', 'bottom', 'credit'):
                        assert abs(cards[i][part]['y']-cards[i+1][part]['y']) < 1, (name,width,part)
                        if part in ('box','frame','credit'):
                            assert abs(cards[i][part]['h']-cards[i+1][part]['h']) < 1, (name,width,part)
            if name == 'accueil':
                featured = page.locator('.latest-story')
                assert featured.count() == 1 and featured.locator('img').evaluate('(i)=>i.complete&&i.naturalWidth>0')
                if width in (390,1440): featured.screenshot(path=str(out/f'une-{width}.png'))
                featured_measure = featured.evaluate('(e)=>({width:e.clientWidth,height:e.clientHeight,columns:getComputedStyle(e).gridTemplateColumns,credit:e.querySelector(".discovery-credit").textContent})')
            else:
                featured_measure = None
            link = page.locator('.discovery-card__link').first
            link.hover()
            assert link.locator('h3').evaluate('(e)=>getComputedStyle(e).textDecorationLine').find('underline') >= 0
            link.focus()
            page.keyboard.press('Tab')
            page.keyboard.press('Shift+Tab')
            assert link.evaluate('(e)=>e.matches(":focus-visible") && getComputedStyle(e).outlineStyle!=="none"')
            if width == 390: page.screenshot(path=str(out/f'{name}-focus-390.png'))
            styles.append(cards[0]['styles'])
            report['pages'].append({'page':name,'width':width,'overflow':overflow,'cards':cards,'featured':featured_measure,'errors':errors})
            page.close()
        if not args.before: assert styles[0] == styles[1], (width,'accueil et bibliothèque différents')

    page = browser.new_page(viewport={'width':390,'height':900})
    for category in ('histoire','geographie','sciences','arts','sciences-humaines'):
        page.goto(args.base+'bibliotheque.html', wait_until='networkidle')
        page.locator(f'[data-filter="{category}"]').click()
        expected = sum(a['catalogue']['category']==category for a in records.values())
        assert page.locator('.article-card:visible').count() == expected
        report['interactions'].append({'filter':category,'count':expected})
    page.goto(args.base+'bibliotheque.html', wait_until='networkidle')
    for query, expected in [('pieuvres',1),('Milgram',1),('zzzzintrouvable',0)]:
        page.locator('#article-search').fill(query)
        page.wait_for_timeout(350)
        assert page.locator('.article-card:visible').count()==expected, query
        report['interactions'].append({'query':query,'count':expected})
    page.locator('#article-search').fill('')
    page.wait_for_timeout(350)
    assert page.locator('.article-card:visible').count()==8
    # Chaque destination est ouverte, avec le vrai H1 et un statut HTTP valide.
    for slug,a in records.items():
        response=page.goto(args.base+'articles/'+slug+'.html')
        assert response.status==200
        assert ' '.join(page.locator('h1').inner_text().split())==' '.join(a['headline'].split())
    for width in (320,390,768,1024,1440):
        context=browser.new_context(java_script_enabled=False,viewport={'width':width,'height':900})
        plain=context.new_page()
        for filename,count in [('index.html',7),('bibliotheque.html',8)]:
            plain.goto(args.base+filename)
            assert plain.locator('.discovery-card:visible').count()==count
            plain.locator('.discovery-photo img').evaluate_all('imgs=>Promise.all(imgs.map(i=>{i.loading="eager";return i.decode()}))')
            assert not plain.evaluate('document.documentElement.scrollWidth>innerWidth')
        context.close()
    report['interactions'].append({'article_links':8,'without_javascript':'5 largeurs × 2 pages','hover_focus':'10 pages'})
    if not args.before:
        for width in (390,1440):
            context=browser.new_context(device_scale_factor=2,viewport={'width':width,'height':900})
            dense=context.new_page()
            for filename in ('index.html','bibliotheque.html'):
                dense.goto(args.base+filename)
                dense.locator('img[srcset]').evaluate_all('imgs=>Promise.all(imgs.map(i=>{i.loading="eager";return i.decode()}))')
                chosen=dense.locator('img[srcset]').evaluate_all('imgs=>imgs.map(i=>i.currentSrc)')
                assert len(chosen)==4 and all('-640.webp' not in src for src in chosen)
            context.close()
        report['interactions'].append({'high_density':'DPR 2, 390 et 1440 px, 4 couvertures × 2 pages'})
    browser.close()
(out/'mesures.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'PASS : 10 rendus, 8 liens, filtres, recherche, survol/focus, 10 rendus sans JS ; {out}')
