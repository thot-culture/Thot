# -*- coding: utf-8 -*-
"""Vue HTML de l’atlas : les données et géométries sont fournies séparément."""
from html import escape
import json
import re


def _e(value):
    return escape(str(value or ''), quote=True)


def _paragraphs(value):
    if isinstance(value, list):
        return ''.join(_paragraphs(part) for part in value)
    return ''.join('<p>'+_e(part)+'</p>' for part in str(value or '').split('\n') if part.strip())


def _source(value):
    if isinstance(value, list):
        return ' · '.join(_source(item) for item in value)
    if isinstance(value, str):
        return '<a href="'+_e(value)+'">Consulter la source</a>' if value.startswith(('https://', 'http://')) else _e(value)
    if isinstance(value, dict):
        url = value.get('url', '')
        label = value.get('title', value.get('label', 'Consulter la source'))
        return '<a href="'+_e(url)+'">'+_e(label)+'</a>' if url else _e(label)
    return ''


def _media(item):
    value = item.get('media', item.get('image', ''))
    if isinstance(value, dict):
        value = value.get('url', value.get('src', value.get('path', '')))
    if isinstance(value, list):
        value = value[0] if value else ''
    if str(value).startswith('assets/'):
        value = '/Thot/'+value
    return str(value or '')


def render(data, map_svg):
    """Construit un fragment de main, sans dépendance réseau d’interaction."""
    epochs = data.get('epochs', [])
    chapters = data.get('chapters', [])
    people = data.get('people', [])
    documents = data.get('documents', [])
    default = next((epoch for epoch in epochs if epoch['id'] == 'ad117'), epochs[-1] if epochs else {'id':'ad117','label':'Vers 117 apr. J.-C.'})
    options = ''.join('<option value="'+_e(epoch['id'])+'"'+(' selected' if epoch['id']==default['id'] else '')+'>'+_e(epoch.get('label', epoch['id']))+'</option>' for epoch in epochs)
    chapter_buttons = ''.join('<button type="button" data-atlas-chapter="'+_e(chapter.get('id', i))+'" aria-pressed="false"><span>'+str(i+1).zfill(2)+'</span>'+_e(chapter['title'])+'</button>' for i, chapter in enumerate(chapters))
    if re.match(r'\s*<svg\b', map_svg):
        map_svg = re.sub(r'^\s*<svg\b[^>]*>', '', map_svg, count=1)
        map_svg = re.sub(r'</svg>\s*$', '', map_svg)
    svg = '''<svg id="atlas-map" viewBox="0 0 1200 720" role="group" aria-labelledby="atlas-map-title atlas-map-description" tabindex="0" preserveAspectRatio="xMidYMid meet"><title id="atlas-map-title">Rome dans l’espace méditerranéen</title><desc id="atlas-map-description">États cartographiques distincts. Les commandes de période et la liste des territoires donnent une alternative aux gestes sur la carte. La couleur n’indique pas une frontière administrative précise.</desc>'''+map_svg+'''<defs><clipPath id="atlas-left-clip"><rect id="atlas-clip-rect" x="0" y="0" width="600" height="720"/></clipPath><clipPath id="atlas-right-clip"><rect id="atlas-right-rect" x="600" y="0" width="600" height="720"/></clipPath></defs><g id="atlas-base" aria-hidden="true"><use href="#atlas-land"/></g><g id="atlas-primary" class="atlas-territories"><use href="#epoch-'''+_e(default['id'])+'''"/></g><g id="atlas-secondary" class="atlas-territories" clip-path="url(#atlas-left-clip)" hidden></g><g id="atlas-city-layer"><use href="#atlas-cities"/></g><g id="atlas-divider" class="atlas-divider" hidden aria-hidden="true"><line x1="600" y1="-10000" x2="600" y2="10000"/><circle cx="600" cy="360" r="22"/><path d="M592 350l-8 10 8 10m16-20 8 10-8 10"/></g></svg>'''
    chapter_static = ''.join('<section><h3>'+str(i+1)+'. '+_e(c['title'])+'</h3>'+_paragraphs(c.get('description', ''))+_paragraphs(c.get('body', c.get('text', '')))+'<p class="atlas-source">'+_source(c.get('sources', c.get('source')))+' </p></section>' for i,c in enumerate(chapters))
    epoch_static = ''.join('<li><strong>'+_e(epoch.get('label', epoch['id']))+'</strong>'+_paragraphs(epoch.get('limits', epoch.get('note','')))+'<span class="atlas-source">'+_source(epoch.get('sources',epoch.get('source')))+'</span></li>' for epoch in epochs)

    def library(items, kind):
        result=[]
        for i,item in enumerate(items):
            key=item.get('id',str(i));title=item.get('name',item.get('title','Document'))
            image=_media(item)
            image_html='<img src="'+_e(image)+'" alt="'+_e(item.get('alt', title))+'" loading="lazy" decoding="async">' if image else '<span class="atlas-document-mark" aria-hidden="true">'+('◈' if kind=='document' else '◇')+'</span>'
            caption=item.get('dates',item.get('date',item.get('nature','')))
            result.append('<article class="atlas-library-card atlas-library-card--'+kind+'"><div class="atlas-library-image">'+image_html+'</div><div class="atlas-library-copy"><p class="atlas-kicker">'+_e(caption)+'</p><h3>'+_e(title)+'</h3>'+_paragraphs(item.get('role',item.get('description','')))+'<button class="atlas-action atlas-interactive" type="button" data-atlas-'+kind+'="'+_e(key)+'" hidden>Ouvrir '+('la fiche' if kind=='person' else 'le document')+'<span aria-hidden="true"> →</span></button><details class="atlas-library-static"><summary>Notice, contexte et références</summary>'+_paragraphs(item.get('text',item.get('body',item.get('description',''))))+_paragraphs(item.get('limits',''))+'<p class="atlas-source">'+_source(item.get('sources',item.get('source')))+'</p><p class="atlas-credit">'+_e(item.get('credit',''))+' '+_e(item.get('license',''))+'</p></details></div></article>')
        return ''.join(result)

    payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
    return '''<div class="rome-atlas" id="rome-atlas" data-mode="free" data-show-cities="true" data-show-territories="true" data-show-neighbors="false" data-show-borders="true">
<header class="atlas-hero"><div><p class="atlas-kicker">ATLAS · UN VOYAGE DANS LES ÉPOQUES</p><h1>L’expansion de Rome<span>Une cité. Un monde en mouvement.</span></h1><p class="atlas-opening">Comment une cité italienne est-elle devenue le centre d’un immense empire ?</p></div><p class="atlas-hero-note">Observez les territoires, confrontez deux époques et découvrez plusieurs points de vue. Les frontières restent des approximations documentées.</p></header>
<div class="atlas-topbar atlas-interactive" hidden><div class="atlas-mode" role="group" aria-label="Mode de découverte"><button type="button" data-atlas-mode="free" aria-pressed="true">Exploration libre</button><button type="button" data-atlas-mode="guided" aria-pressed="false">Le récit en six chapitres</button></div><button type="button" class="atlas-action" data-atlas-library>Documents et personnages <span aria-hidden="true">↓</span></button></div>
<section class="atlas-workspace" aria-label="Carte et récit de l’expansion romaine"><aside id="atlas-story" class="atlas-story" hidden><div class="atlas-story-heading"><p class="atlas-kicker">SUIVRE LE FIL</p><h2>Six chapitres, plusieurs regards</h2><button type="button" data-atlas-mode="free" aria-label="Fermer le récit et explorer librement">Fermer le récit ×</button></div><nav class="atlas-chapters" aria-label="Choisir un chapitre">'''+chapter_buttons+'''</nav><article id="atlas-story-content"><p class="atlas-kicker" data-story-number></p><h3 data-story-title></h3><div data-story-body></div><div class="atlas-story-dates" data-story-dates></div><p class="atlas-source" data-story-source></p></article><div class="atlas-story-navigation"><button type="button" data-atlas-step="previous">← Étape précédente</button><button type="button" data-atlas-step="next">Étape suivante →</button></div></aside>
<div class="atlas-map-column"><div class="atlas-map-heading"><div><p class="atlas-kicker">ÉTAT CARTOGRAPHIQUE</p><h2 id="atlas-current-date">'''+_e(default.get('label',default['id']))+'''</h2></div><label class="atlas-compare-switch atlas-interactive" hidden><input type="checkbox" id="atlas-compare-toggle">Comparer deux époques</label></div>
<div id="atlas-compare-controls" class="atlas-compare-controls" hidden><label>À gauche<select id="atlas-before">'''+options+'''</select></label><span aria-hidden="true">⇆</span><label>À droite<select id="atlas-after">'''+options+'''</select></label></div>
<div class="atlas-map-shell"><div class="atlas-map-stage">'''+svg+'''<div class="atlas-map-compass" aria-hidden="true"><span>N</span>↑</div><div class="atlas-zoom-controls atlas-interactive" hidden role="group" aria-label="Zoom de la carte"><button type="button" data-atlas-zoom="in" aria-label="Agrandir la carte">+</button><button type="button" data-atlas-zoom="out" aria-label="Réduire la carte">−</button><button type="button" data-atlas-zoom="reset">Vue d’ensemble</button><output id="atlas-zoom-value" aria-label="Grossissement">100 %</output></div><div class="atlas-pan-controls atlas-interactive" hidden role="group" aria-label="Déplacer la carte"><button type="button" data-atlas-pan="left" aria-label="Déplacer la vue vers l’ouest">←</button><button type="button" data-atlas-pan="up" aria-label="Déplacer la vue vers le nord">↑</button><button type="button" data-atlas-pan="down" aria-label="Déplacer la vue vers le sud">↓</button><button type="button" data-atlas-pan="right" aria-label="Déplacer la vue vers l’est">→</button></div></div>
<aside id="atlas-card" class="atlas-card" hidden aria-labelledby="atlas-card-title"><button type="button" data-atlas-close-card class="atlas-card-close">Fermer la fiche ×</button><p class="atlas-kicker" id="atlas-card-kind">UNE FICHE, UN CONTEXTE</p><h3 id="atlas-card-title" tabindex="-1"></h3><div id="atlas-card-content"></div></aside></div>
<div id="atlas-reveal-control" class="atlas-reveal-control" hidden><label for="atlas-reveal">Révéler la carte de gauche <output id="atlas-reveal-value">50 %</output></label><input id="atlas-reveal" type="range" min="0" max="100" value="50" aria-describedby="atlas-compare-description"><p id="atlas-compare-description">Les deux états partagent la même projection et la même vue. Le curseur révèle une date, sans calculer de frontières entre les deux.</p></div>
<div class="atlas-legend"><span><i class="atlas-legend-rome" aria-hidden="true"></i>Territoires romains indiqués par la source</span><span><i class="atlas-legend-other" aria-hidden="true"></i>Autres ensembles et dépendances, si affichés</span><span><i class="atlas-legend-client" aria-hidden="true"></i>Dépendances signalées (hachures)</span><span><i class="atlas-legend-city" aria-hidden="true"></i>Lieux documentés</span></div>
<p class="atlas-caution" id="atlas-map-limits">Reconstitutions modernes à l’échelle méditerranéenne : contours approximatifs, états distincts et sources différentes. Le fond géographique sert au repérage ; il ne restitue pas partout le littoral antique.</p>
<p class="atlas-source" id="atlas-state-source">'''+_source(default.get('sources',default.get('source')))+'''</p>
</div></section>
<section class="atlas-controls atlas-interactive" hidden aria-label="Choisir la période et les couches"><div class="atlas-period-selector"><label for="atlas-period">Voyager vers un état documenté</label><select id="atlas-period">'''+options+'''</select><div class="atlas-period-rail" role="group" aria-label="États cartographiques disponibles">'''+''.join('<button type="button" data-atlas-period="'+_e(epoch['id'])+'" aria-pressed="'+('true' if epoch['id']==default['id'] else 'false')+'">'+_e(epoch.get('short_label',epoch.get('label',epoch['id'])))+'</button>' for epoch in epochs)+'''</div></div><fieldset class="atlas-layers"><legend>Ce que la carte montre</legend><label><input type="checkbox" data-atlas-layer="territories" checked>Territoires</label><label><input type="checkbox" data-atlas-layer="cities" checked>Lieux</label><label><input type="checkbox" data-atlas-layer="neighbors">Autres ensembles</label><label><input type="checkbox" data-atlas-layer="borders" checked>Contours</label></fieldset><div class="atlas-selection"><label for="atlas-territory-select">Ouvrir une fiche sans cliquer sur la carte</label><select id="atlas-territory-select"><option value="">Choisir un territoire ou un lieu…</option></select></div><p class="atlas-map-help">La carte se déplace au toucher ou avec les flèches. Zoom : boutons, pincement ou Ctrl + molette. La touche Début retrouve la vue d’ensemble. Les cinq lieux forment un index transchronologique : leur présence ne signifie pas qu’ils existent ou sont romains à chaque date.</p></section>
<p id="atlas-status" class="atlas-status" role="status" aria-live="polite" aria-atomic="true"></p>
<noscript><p class="atlas-caution">La manipulation de l’atlas nécessite JavaScript. La carte finale, les huit états documentés, les six chapitres et toutes les notices restent consultables en lecture ci-dessous.</p></noscript>
<details id="atlas-text-fallback" class="atlas-text-fallback" open><summary>Lire le récit et vérifier les états cartographiques</summary><div class="atlas-readable-chapters">'''+chapter_static+'''</div><section><h3>Dates, provenance et limites des cartes</h3><ol class="atlas-epoch-sources">'''+epoch_static+'''</ol></section></details>
<section class="atlas-library" id="atlas-library"><header><p class="atlas-kicker">LES TRACES QUI NOUS RESTENT</p><h2>Des objets et des visages,<br>pour regarder derrière les frontières.</h2><p>Une représentation raconte aussi le point de vue de son auteur. Les portraits antiques, images modernes et notices sont distingués et crédités.</p></header><h3 class="atlas-library-category">Quatre personnages, des rôles différents</h3><div class="atlas-people-grid">'''+library(people,'person')+'''</div><h3 class="atlas-library-category">La bibliothèque documentaire</h3><div class="atlas-documents-grid">'''+library(documents,'document')+'''</div></section>
<dialog id="atlas-modal" class="atlas-modal" aria-labelledby="atlas-modal-title"><div class="atlas-modal-bar"><p class="atlas-kicker">REGARDER LES TRACES</p><button type="button" data-atlas-close-modal>Fermer ×</button></div><div id="atlas-modal-content"><h2 id="atlas-modal-title">Notice documentaire</h2></div></dialog>
<script id="atlas-data" type="application/json">'''+payload+'''</script></div>'''
