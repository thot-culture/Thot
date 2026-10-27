#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Assemble les trois pages statiques Explorer sans réseau ni dépendance tierce."""
import portable_io
from pathlib import Path
from html import escape as e
import json
import re
import argparse
import hashlib
from site_chrome import normalize
from explorer_aral_view import render as aral_view
from explorer_atlas_view import render as atlas_view
ROOT=Path(__file__).resolve().parents[1];ASSET=ROOT/'assets/explorer-v2'
BASE='https://thot-culture.github.io/Thot/'

def asset_url(name):
    digest=hashlib.sha256((ASSET/name).read_bytes()).hexdigest()[:12]
    return '/Thot/assets/explorer-v2/'+name+'?v='+digest

def read(name):return json.loads((ASSET/name).read_text(encoding='utf-8'))
def header():
    return '''<a class="xp-skip" href="#contenu">Aller au contenu</a><header class="xp-header"><div class="xp-bar"><a class="xp-brand" href="/Thot/index.html" aria-label="THOT, accueil">THOT<span>La curiosité<br>en mouvement</span></a><nav class="xp-nav" aria-label="Navigation principale"><a href="/Thot/index.html">Accueil</a><a href="/Thot/bibliotheque.html">Bibliothèque</a><a href="/Thot/explorer.html" aria-current="page">Explorer</a><a href="/Thot/quiz.html#quiz-classique">Quiz</a><a href="/Thot/notre-methode.html">Notre méthode</a></nav></div></header>'''
def shell(path,title,description,body,css='',js='',crumb=''):
    share_image='assets/explorer-v2/media/met-248042.webp' if path.endswith('rome-expansion.html') else 'assets/explorer-v2/media/moynaq-original.jpg'
    scripts='<script src="'+asset_url(js)+'" defer></script>' if js else ''
    style='<link rel="stylesheet" href="'+asset_url(css)+'">' if css else ''
    breadcrumb='<nav class="xp-breadcrumb" aria-label="Fil d’Ariane"><a href="/Thot/explorer.html">Explorer</a><span aria-hidden="true">/</span><span>'+e(crumb)+'</span></nav>' if crumb else ''
    return normalize(path, '<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+e(title)+' — THOT</title><meta name="description" content="'+e(description,quote=True)+'"><link rel="canonical" href="'+BASE+path+'"><meta property="og:type" content="website"><meta property="og:title" content="'+e(title,quote=True)+' — THOT"><meta property="og:description" content="'+e(description,quote=True)+'"><meta property="og:url" content="'+BASE+path+'"><meta property="og:image" content="'+BASE+share_image+'"><meta name="theme-color" content="#fffdf7"><link rel="stylesheet" href="'+asset_url('common.css')+'">'+style+scripts+'</head><body>'+header()+'<main class="xp-main" id="contenu" tabindex="-1">'+breadcrumb+body+'</main><footer class="xp-footer"><b>THOT</b><p>Observer. Relier. Comprendre.<br>La connaissance commence par une question.</p><nav aria-label="Liens de pied de page"><a href="/Thot/explorer.html">Retour à Explorer</a><a href="/Thot/bibliotheque.html">Les articles</a><a href="/Thot/notre-methode.html">Notre méthode</a></nav></footer></body></html>\n')

def source_list(items):
    seen=set();rows=[]
    for s in items:
        if not s or s['url'] in seen:continue
        seen.add(s['url']);rows.append('<li><a href="'+e(s['url'],quote=True)+'">'+e(s['title'])+'</a></li>')
    return '<ul>'+''.join(rows)+'</ul>'

def aral_bibliography(data):
    items=[s for d in data['documents'] for s in [d['source'],*d.get('additional_sources',[])]]
    credits=''.join('<li><strong>'+e(d['id'].upper()+' · '+d['title'])+'</strong> — '+e(d['credit'])+' '+('<a href="'+e(d['license_url'],quote=True)+'">'+e(d['license'])+'</a>' if d.get('license_url') else e(d['license']))+'</li>' for d in data['documents'])
    return '<details class="xp-source-section" id="sources"><summary>Sources, crédits et méthode documentaire</summary><h2>Revenir aux documents</h2><p>Les photographies et vues satellites sont des documents authentiques. Les graphiques, la carte de repérage et les fiches de lecture sont des créations THOT explicitement fondées sur les sources ci-dessous. Les textes des rapports ne sont pas reproduits intégralement. Sources consultées le 26 octobre 2026.</p>'+source_list(items)+'<h3>Crédits et réutilisation</h3><ul>'+credits+'</ul><p>Le bilan utilise des critères documentaires : rôle des pièces retenues, familles de preuves et types de relation. Le texte libre n’est pas analysé par un service distant et ne reçoit pas de note. La sauvegarde reste dans ce navigateur, sous une clé propre à cette enquête.</p><p><a href="/Thot/assets/explorer-v2/data/aral.json">Corpus et notices structurées</a> · <a href="/Thot/assets/explorer-v2/sources/aral-sources.json">Registre des sources et droits</a></p></details>'

def rome_bibliography(data):
    items=[*data['bibliography'],*[ep['source'] for ep in data['epochs']],*[p['source'] for p in data['places']],*[p['source'] for p in data['people']],*[d['source'] for d in data['documents']]]
    credits=''.join('<li><strong>'+e(p.get('name',p.get('title')) or '')+'</strong> — '+e(p['credit'])+' <a href="'+e(p['license_url'],quote=True)+'">'+e(p['license'])+'</a></li>' for p in data['people']+data['documents'])
    return '<details class="xp-source-section" id="sources"><summary>Sources, licences et limites de la cartographie</summary><h2>Une carte est un modèle documenté</h2><p>'+e(data['layer_limits'])+'</p><p>Projection équirectangulaire ; contours découpés et simplifiés pour une lecture méditerranéenne. Le littoral Natural Earth est un repère moderne généralisé. Les huit états sont distincts : aucun territoire intermédiaire n’est calculé. Les différences entre bases ne permettent pas de mesurer des superficies conquises.</p>'+source_list(items)+'<h3>Crédits des documents et portraits</h3><ul>'+credits+'</ul><h3>Données géographiques et licences distinctes</h3><p>Historical Basemaps, A. Ourednik et contributeurs : GPL v3. Ancient World Mapping Center : ODbL 1.0, données dérivées du Barrington Atlas et des modifications AWMC d’OpenStreetMap. Les jeux de données et leurs dérivés restent séparés. Coordonnées de onze lieux : Pleiades, CC BY 3.0, attribution détaillée dans le registre. Natural Earth : domaine public.</p><div class="xp-license-links"><a href="/Thot/assets/explorer-v2/sources/historical-basemaps-source.zip">Sources Historical Basemaps + licence GPL</a><a href="/Thot/assets/explorer-v2/sources/awmc-source.zip">Sources AWMC + licence ODbL</a><a href="/Thot/assets/explorer-v2/data/historical-basemaps-derived.geojson">Dérivé Historical Basemaps · GPL</a><a href="/Thot/assets/explorer-v2/data/awmc-derived.geojson">Dérivé AWMC · ODbL</a><a href="/Thot/assets/explorer-v2/sources/natural-earth-source.zip">Source Natural Earth · domaine public</a><a href="/Thot/assets/explorer-v2/sources/pleiades-places.json">Attributions Pleiades</a><a href="/Thot/assets/explorer-v2/sources/geography-sources.json">Méthode et versions géographiques</a><a href="/Thot/assets/explorer-v2/sources/rome-sources.json">Registre documentaire</a></div></details>'

def build():
    aral=read('data/aral.json');geo=read('data/rome-geography.json');rome=read('data/rome-content.json');places=read('sources/pleiades-places.json')
    for p in rome['places']:
        point=next(v['reprPoint'] for v in places if v['id']==p['id']);p['lon'],p['lat']=point
    rome.update(epochs=geo['epochs'],territories=geo['territories'])
    for territory in rome['territories'].values():
        if territory['epoch_id'] in ('bc1','ad100','ad117') and territory.get('document_ids'):
            territory['document_ids']=list(dict.fromkeys([*territory.get('document_ids',[]),'temple-dendur']))
    defs=(ASSET/'data/rome-geography.svg').read_text(encoding='utf-8')
    city_fragments=[]
    for p in rome['places']:
        x=(p['lon']+15)*1200/70;y=(60-p['lat'])*720/42
        city_fragments.append('<g data-place="'+p['id']+'" data-name="'+e(p['name'],quote=True)+'" class="atlas-city"><circle class="atlas-city-hit" cx="'+f'{x:.2f}'+'" cy="'+f'{y:.2f}'+'" r="22"/><circle cx="'+f'{x:.2f}'+'" cy="'+f'{y:.2f}'+'" r="5"/><text x="'+f'{x+9:.2f}'+'" y="'+f'{y-7:.2f}'+'">'+e(p['name'].split(' · ')[0])+'</text></g>')
    event_fragments=[]
    for event in rome.get('events',[]):
        place=next(p for p in rome['places'] if p['id']==event['place_id'])
        x=(place['lon']+15)*1200/70;y=(60-place['lat'])*720/42
        event_fragments.append('<g data-event="'+event['id']+'" data-name="'+e(event['title'],quote=True)+'" transform="translate('+f'{x:.2f} {y:.2f}'+')" class="atlas-event"><circle class="atlas-event-hit" r="22"/><rect x="-8" y="-8" width="16" height="16" transform="rotate(45)"/></g>')
    defs=defs.replace('</defs>','<g id="atlas-events">'+''.join(event_fragments)+'</g></defs>')
    defs=defs.replace('</defs>','<g id="atlas-cities">'+''.join(city_fragments)+'</g></defs>')
    roman117=re.search(r'<g id="epoch-ad117">(.*?)</g>',defs,re.S)[1]
    land=re.search(r'<g id="atlas-land">(.*?)</g>',defs,re.S)[1]
    promo_cities=re.sub(r'<circle class="atlas-city-hit"[^>]*/>', '', ''.join(city_fragments))
    promo='<svg viewBox="0 0 1200 720" role="img" aria-label="Emprise romaine schématique vers 117 après J.-C., modèle Ancient World Mapping Center"><rect width="1200" height="720" fill="#dcebef"/><g fill="#f0eee0" stroke="#9db2a7" stroke-width="1">'+land+'</g><g fill="#d06a45" fill-opacity=".85" stroke="#9d5136" stroke-width="1.5">'+roman117+'</g><g fill="#173c45" stroke="#fffdf7" stroke-width=".8">'+promo_cities+'</g></svg>'
    landing='''<section class="xp-hero"><p class="xp-kicker">THOT · LA CULTURE SE DÉCOUVRE AUSSI EN FAISANT</p><h1>EXPLORER</h1><p class="xp-hook">Ne te contente pas de lire le monde. Explore-le.</p><p class="xp-lead">Un document à examiner. Une carte à manipuler. Une question à poursuivre. Entre dans deux expériences où ta curiosité mène la danse.</p></section>
<section class="xp-experience" aria-labelledby="aral-promo-title"><figure class="xp-cover"><img src="/Thot/assets/explorer-v2/media/moynaq-cover.webp" alt="Deux bateaux sur un sol sec à Moynaq, en mars 2011." width="1901" height="1268" fetchpriority="high"><figcaption>Photographie Sebastian Kluger · 20 mars 2011 · <a href="https://commons.wikimedia.org/wiki/File:Moynaq_Aral-Sea_Ships.jpg">Source</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a> · Cadrage d’affichage.</figcaption></figure><div class="xp-experience-copy"><p class="xp-kicker">01 / ENQUÊTER</p><h2 id="aral-promo-title">Le mystère<br>de la mer <span>d’Aral.</span></h2><p class="xp-question">Pourquoi ces bateaux sont-ils au milieu du désert ?</p><p>Ouvre le dossier, rapproche les pièces et construis ton explication. Tes preuves ont-elles vraiment la portée que tu leur donnes ?</p><div class="xp-meta"><span>Environ 20–30 min</span><span>11 pièces documentées</span><span>À ton rythme</span></div><a class="xp-button" href="/Thot/explorer/enquetes/mer-aral.html">Commencer l’enquête <span aria-hidden="true">→</span></a></div></section>
<section class="xp-experience xp-atlas-promo" aria-labelledby="rome-promo-title"><div class="xp-experience-copy"><p class="xp-kicker">02 / ATLAS</p><h2 id="rome-promo-title">Rome,<br><span>à travers le temps.</span></h2><p class="xp-question">Comment une cité italienne est-elle devenue le centre d’un immense empire ?</p><p>Voyage entre huit états documentés. Compare deux époques, suis six chapitres ou ouvre les notices au gré de tes découvertes.</p><div class="xp-meta"><span>15–25 min ou librement</span><span>Du IVe s. av. J.-C. à Trajan</span></div><a class="xp-button alt" href="/Thot/explorer/atlas/rome-expansion.html">Explorer l’Empire romain <span aria-hidden="true">→</span></a></div><figure class="xp-cover">'''+promo+'''<figcaption>Vers 117 apr. J.-C. · Modèle AWMC, contours simplifiés ; <a href="/Thot/explorer/atlas/rome-expansion.html#sources">sources et limites</a>. Fond moderne Natural Earth. Lieux de repérage Pleiades, CC BY 3.0.</figcaption></figure></section>
<section class="xp-promise" aria-label="Notre manière d’explorer"><div><h2>Manipuler pour comprendre.</h2><p>Chaque geste a un but : comparer des dates, mettre deux preuves en relation ou examiner ce qu’un document laisse dans l’ombre.</p></div><div><h2>Remonter aux sources.</h2><p>Images, données et cartes sont identifiées. Les incertitudes restent visibles : une limite fait aussi partie de la connaissance.</p></div><div><h2>Garder sa liberté.</h2><p>Pas de compte ni de classement. Des indices à la demande, des chemins ouverts et toujours la possibilité de changer d’avis.</p></div></section>'''
    return {'explorer.html':shell('explorer.html','Explorer','Enquêter sur la mer d’Aral et explorer l’expansion de Rome dans deux expériences documentées et interactives.',landing),
    'explorer/enquetes/mer-aral.html':shell('explorer/enquetes/mer-aral.html','Le mystère de la mer d’Aral','Une enquête documentaire sur le recul de la mer d’Aral : onze pièces documentées, un tableau de preuves et une conclusion à construire.',aral_view(aral)+aral_bibliography(aral),'aral.css','aral.js','Enquêter · Mer d’Aral'),
    'explorer/atlas/rome-expansion.html':shell('explorer/atlas/rome-expansion.html','L’expansion de Rome','Un atlas historique documenté : huit états cartographiques, six chapitres, un comparateur temporel et des objets à examiner.',atlas_view(rome,defs)+rome_bibliography(rome),'atlas.css','atlas.js','Atlas · L’expansion de Rome')}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    for name,html in build().items():
        path=ROOT/name
        if args.check:
            assert path.exists() and path.read_text(encoding='utf-8')==html,'Page à reconstruire : '+name
        else:path.parent.mkdir(exist_ok=True,parents=True);path.write_text(html,encoding='utf-8',newline='\n')
    print('PASS : trois pages Explorer '+('à jour.' if args.check else 'assemblées.'))
