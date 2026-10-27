# -*- coding: utf-8 -*-
"""Rendu progressif du dossier Aral : documents lisibles sans JavaScript."""
from html import escape
import json
import re


def _source(doc):
    source = doc.get('source', '')
    if isinstance(source, dict):
        return source.get('url', ''), source.get('title', 'Consulter la source')
    return source, 'Consulter la source originale'


def _media(doc):
    media = doc.get('media', '')
    if isinstance(media, dict):
        return media.get('src', ''), media.get('alt', doc.get('title', ''))
    return media, doc.get('alt', doc.get('title', ''))


def _document(doc):
    e = lambda text: escape(str(text), quote=True)
    source, label = _source(doc)
    media, alt = _media(doc)
    image = '<img src="' + e(media) + '" alt="' + e(alt) + '" loading="lazy" decoding="async">' if media else ''
    visual = doc.get('visual_html', '')
    svg = re.search(r'<svg\b[\s\S]*?</svg>', visual)
    preview = ('<img src="'+e(media)+'" alt="" loading="lazy" decoding="async">') if media else (svg[0] if svg else '<span>DOCUMENT<br>DE LECTURE</span>')
    additional=''.join('<p><a href="'+e(ref['url'])+'">'+e(ref['title'])+'</a></p>' for ref in doc.get('additional_sources',[]))
    if isinstance(doc.get('media'),dict) and doc['media'].get('original_src'):additional+='<p><a href="'+e(doc['media']['original_src'])+'">Fichier institutionnel original, sans conversion</a></p>'
    license_link = '<a href="' + e(doc['license_url']) + '">' + e(doc.get('license', 'Conditions de réutilisation')) + '</a>' if doc.get('license_url') else e(doc.get('license', 'Voir la notice de la source.'))
    return f'''<li class="aral-doc-card" id="document-{e(doc['id'])}" data-doc-card="{e(doc['id'])}">
      <div class="aral-doc-card-head"><span class="aral-piece-id">{e(doc['id']).upper()}</span><span class="aral-seen" data-seen="{e(doc['id'])}">À examiner</span></div>
      <div class="aral-doc-preview" aria-hidden="true">{preview}</div>
      <p class="aral-doc-nature">{e(doc.get('nature', 'Document'))} · {e(doc.get('date', ''))}</p>
      <h3>{e(doc['title'])}</h3>
      <div class="aral-doc-actions" hidden><button type="button" data-open-doc="{e(doc['id'])}">Ouvrir la pièce</button><button type="button" class="aral-icon-button" data-add-doc="{e(doc['id'])}" aria-label="Ajouter la pièce {e(doc['id']).upper()} au tableau">+</button></div>
      <details class="aral-static-doc" data-static-doc><summary>Lire cette pièce et sa notice</summary>
        {image}{visual}<p>{e(doc.get('description', ''))}</p><h4>Ce qu’elle montre</h4><p>{e(doc.get('shows', ''))}</p><h4>Ses limites</h4><p>{e(doc.get('limits', ''))}</p>
        <p class="aral-document-credit">{e(doc.get('author', ''))} · {e(doc.get('credit', ''))} · {license_link}</p><p><a href="{e(source)}">{e(label)}</a></p>{additional}
      </details>
    </li>'''


def render(data):
    """Retourne une expérience complète avec son unique h1 et ses données inline."""
    e = lambda text: escape(str(text), quote=True)
    documents = data.get('documents', [])
    first = documents[0] if documents else {}
    hero, alt = _media(first)
    hypotheses = data.get('hypotheses') or [
        {'id': 'irrigation', 'title': 'Les prélèvements pour l’irrigation jouent un rôle majeur.'},
        {'id': 'climate', 'title': 'Les variations climatiques suffisent à expliquer l’ensemble du recul.'},
        {'id': 'disappearance', 'title': 'Toute la mer d’Aral a définitivement disparu.'},
        {'id': 'uncertain', 'title': 'Je ne dispose pas encore d’assez d’éléments pour conclure.'},
    ]
    hypothesis_html = ''.join('<label class="aral-hypothesis"><input type="radio" name="aral-hypothesis" value="' + e(item['id']) + '"><span>' + e(item['title']) + '</span></label>' for item in hypotheses)
    encoded = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return f'''<div class="aral-experience" data-aral>
      <section class="aral-opening" aria-labelledby="aral-title">
        <div class="aral-opening-image"><img src="{e(hero)}" alt="{e(alt)}" width="1901" height="1268" fetchpriority="high"><p class="aral-opening-credit">{e(first.get('credit', ''))} · {e(first.get('date', ''))} </p></div>
        <div class="aral-opening-copy"><p class="aral-kicker">THOT Explorer / Enquêter</p><p class="aral-chapter-label">Le mystère de la mer d’Aral</p><h1 id="aral-title">Pourquoi ces bateaux sont-ils au milieu du désert&nbsp;?</h1><p>Enquête sur la disparition d’une grande partie de la mer d’Aral. Examine les documents, relie les indices et construis ton explication.</p><p class="aral-time">Onze pièces documentées · Exploration libre · Sans score</p><button type="button" id="aral-start" hidden>Entrer dans le dossier <span aria-hidden="true">→</span></button><noscript><a class="aral-link-button" href="#aral-documents">Lire le dossier documentaire</a></noscript><p class="aral-resume" id="aral-resume" hidden></p></div>
      </section>
      <section class="aral-workspace" id="aral-dossier" data-aral-workspace aria-labelledby="aral-desk-title">
        <header class="aral-desk-heading"><div><p class="aral-kicker">Dossier ouvert</p><h2 id="aral-desk-title" tabindex="-1">Ton bureau d’investigation</h2></div><div class="aral-session-tools" hidden><button type="button" id="aral-hint" aria-controls="aral-help" aria-expanded="false">Un indice, THOT&nbsp;?</button><button type="button" id="aral-reset">Recommencer</button></div></header>
        <ol class="aral-reading-steps" aria-label="Le fil de ton enquête"><li>Examine les pièces.</li><li>Garde les pièces utiles au tableau.</li><li>Relie-les et précise leur rôle.</li><li>Explique, puis révise.</li></ol><p class="aral-storage" id="aral-storage" role="status" aria-live="polite"></p>
        <aside class="aral-help" id="aral-help" hidden aria-labelledby="aral-help-title"><span class="aral-owl" aria-hidden="true">◉ ◉<br> &nbsp;⌄</span><div><h3 id="aral-help-title">Un repère, à ton rythme</h3><p id="aral-hint-text"></p></div></aside>
        <nav class="aral-mobile-tabs" aria-label="Espaces de l’enquête" hidden><button type="button" data-aral-view="documents" aria-pressed="true" aria-controls="aral-documents">01 · Documents <span data-tab-count="documents"></span></button><button type="button" data-aral-view="board" aria-pressed="false" aria-controls="aral-board-panel">02 · Tableau <span data-tab-count="board"></span></button><button type="button" data-aral-view="argument" aria-pressed="false" aria-controls="aral-argument">03 · Hypothèses <span data-tab-count="argument"></span></button></nav>
        <div class="aral-desk" data-current-view="documents">
          <section class="aral-panel aral-documents" id="aral-documents" data-aral-panel="documents" aria-labelledby="aral-documents-title"><header class="aral-panel-heading"><div><span class="aral-step">01</span><h3 id="aral-documents-title">Les pièces</h3></div><p id="aral-seen-count">{len(documents)} documents à examiner</p></header><p class="aral-panel-note">Ouvre les pièces dans l’ordre de ton choix. Une pièce ouverte n’est pas automatiquement une preuve comprise.</p><ol class="aral-doc-catalogue">{''.join(_document(doc) for doc in documents)}</ol></section>
          <section class="aral-panel aral-board-panel" id="aral-board-panel" data-aral-panel="board" aria-labelledby="aral-board-title"><header class="aral-panel-heading"><div><span class="aral-step">02</span><h3 id="aral-board-title">Relier les indices</h3></div><p id="aral-board-count">Tableau personnel</p></header><p class="aral-panel-note">Choisis une pièce dans la liste, puis « Relier cette pièce ». Les liens représentent ton raisonnement, pas des vérités validées automatiquement.</p>
            <div class="aral-board-controls" hidden><label for="aral-board-zoom">Zoom du tableau <output id="aral-board-zoom-value">80 %</output></label><input id="aral-board-zoom" type="range" min="50" max="125" value="80" step="5"><button type="button" id="aral-arrange">Ranger les pièces</button><button type="button" id="aral-fit-board">Vue d’ensemble</button><button type="button" id="aral-wide-board" aria-pressed="false">Tableau en grand</button></div>
            <div class="aral-board-mode" role="group" aria-label="Présentation des preuves" hidden><button type="button" data-board-mode="map" aria-pressed="true">Carte des preuves</button><button type="button" data-board-mode="list" aria-pressed="false">Liste des pièces</button></div><div class="aral-relation-legend" aria-label="Types de relation"><span data-kind="confirm">+ Se confirment</span><span data-kind="contradict">≠ Se contredisent</span><span data-kind="context">i Apportent du contexte</span><span data-kind="inconclusive">? Ne permettent pas de conclure</span></div><div class="aral-board-viewport" tabindex="0" role="region" aria-label="Tableau de preuves défilant" aria-describedby="aral-board-instructions"><div class="aral-board-size"><div class="aral-board-canvas" data-aral-canvas><svg class="aral-threads" viewBox="0 0 1200 1440" aria-hidden="true"></svg><div class="aral-board-empty"><span aria-hidden="true">+</span><p>Ton tableau commence avec une question.</p><p>Ouvre une pièce, puis ajoute-la ici pour la rapprocher des autres.</p></div><div class="aral-board-cards"></div></div></div></div>
            <div id="aral-evidence-list" class="aral-evidence-list" aria-label="Pièces du tableau" hidden></div><div id="aral-board-pan" class="aral-board-pan" role="group" aria-label="Déplacer la vue du tableau" hidden><button type="button" data-board-pan="left" aria-label="Voir la partie gauche du tableau">← Vue</button><button type="button" data-board-pan="up" aria-label="Voir la partie haute du tableau">↑ Vue</button><button type="button" data-board-pan="down" aria-label="Voir la partie basse du tableau">↓ Vue</button><button type="button" data-board-pan="right" aria-label="Voir la partie droite du tableau">Vue →</button></div><p class="aral-board-instructions" id="aral-board-instructions">Sélectionne une pièce, puis utilise les commandes. Le déplacement par la poignée reste facultatif. Sur la carte, fais défiler le fond pour te déplacer ; la liste donne accès à toutes les pièces sans zoomer.</p>
            <div class="aral-position-controls" hidden><p id="aral-active-description" class="aral-active-description" role="status"></p><label for="aral-selected-card">Changer de pièce active</label><select id="aral-selected-card"><option value="">Choisir une pièce</option></select><div class="aral-move-buttons" role="group" aria-label="Déplacer la pièce choisie"><button type="button" data-board-move="left">Gauche</button><button type="button" data-board-move="up">Haut</button><button type="button" data-board-move="down">Bas</button><button type="button" data-board-move="right">Droite</button></div><div class="aral-selected-actions"><button type="button" id="aral-center-selected">Centrer cette pièce</button><button type="button" id="aral-connect-selected">Relier cette pièce</button></div><button type="button" id="aral-remove-selected">Retirer la pièce choisie du tableau</button></div>
            <form class="aral-link-form" id="aral-link-form" hidden><h4>Créer une relation</h4><div class="aral-link-endpoints"><label>De la pièce<output id="aral-link-from-title" class="aral-endpoint-title"></output><select id="aral-link-from" required><option value="">Choisir</option></select></label><label>À la pièce<output id="aral-link-to-title" class="aral-endpoint-title"></output><select id="aral-link-to" required><option value="">Choisir</option></select></label></div><label>Nature de la relation<select id="aral-link-kind"><option value="confirm">Se confirment</option><option value="contradict">Se contredisent</option><option value="context">Apportent du contexte</option><option value="inconclusive">Ne permettent pas de conclure</option></select></label><label id="aral-link-review-label" hidden>État du désaccord<select id="aral-link-review"><option value="unresolved">À examiner</option><option value="scoped">Différence de période ou d’échelle repérée</option><option value="open">Désaccord maintenu, à documenter</option></select></label><label>Pourquoi ce lien&nbsp;? <span>(facultatif)</span><input id="aral-link-note" type="text" maxlength="240" placeholder="Même période, échelles différentes…"></label><div class="aral-form-actions"><button type="submit" id="aral-link-save">Relier ces pièces</button><button type="button" id="aral-link-cancel" hidden>Annuler la modification</button></div><p id="aral-link-error" role="status"></p></form>
            <button type="button" id="aral-more-documents" class="aral-next-step aral-back-step" hidden>Examiner une autre pièce</button><button type="button" id="aral-prepare-conclusion" class="aral-next-step" hidden>Passer aux hypothèses et expliquer →</button><ul class="aral-links-list" aria-label="Relations de ton tableau"></ul>
          </section>
          <section class="aral-panel aral-argument" id="aral-argument" data-aral-panel="argument" aria-labelledby="aral-argument-title"><header class="aral-panel-heading"><div><span class="aral-step">03</span><h3 id="aral-argument-title">Construire ton explication</h3></div></header><div class="aral-argument-interactive" hidden><form id="aral-conclusion-form"><fieldset class="aral-hypotheses"><legend>Quelle hypothèse examines-tu&nbsp;?</legend>{hypothesis_html}<label class="aral-hypothesis"><input type="radio" name="aral-hypothesis" value="custom"><span>Je formule une autre hypothèse.</span></label></fieldset><label class="aral-custom-label" for="aral-custom-hypothesis">Ton hypothèse libre <span>(facultatif)</span></label><input id="aral-custom-hypothesis" type="text" maxlength="300" placeholder="Une proposition que les pièces permettraient de vérifier…"><section class="aral-proof-selection" aria-labelledby="aral-proofs-title"><h4 id="aral-proofs-title">Les preuves que tu retiens</h4><p>Pour chaque pièce de ton tableau, précise son rôle dans ton argument. Ajouter une pièce ne la sélectionne pas automatiquement comme preuve.</p><div id="aral-proof-roles"><p class="aral-empty-note">Ajoute d’abord une pièce au tableau.</p></div></section><label class="aral-conclusion-label" for="aral-conclusion">Ta conclusion, avec tes raisons</label><textarea id="aral-conclusion" rows="5" maxlength="3000" placeholder="Je pense que… Les pièces… montrent… Elles ne permettent pas de…" required></textarea><p class="aral-evaluation-note">Le bilan vérifie des critères documentaires explicites. Il ne prétend pas comprendre ou noter automatiquement ton texte libre.</p><button type="submit" id="aral-submit">Confronter mon explication aux pièces</button><p id="aral-conclusion-error" role="status"></p></form></div><noscript><p>Le tableau et le bilan personnalisé nécessitent JavaScript. Toutes les pièces et leurs limites restent lisibles dans la colonne Documents.</p></noscript></section>
        </div>
        <section class="aral-feedback" id="aral-feedback" hidden role="region" aria-labelledby="aral-feedback-title"><p class="aral-kicker">Bilan de tes choix documentaires</p><h2 id="aral-feedback-title" tabindex="-1">Une conclusion qui s’appuie sur ses preuves</h2><div id="aral-feedback-criteria" class="aral-feedback-criteria"></div><div id="aral-feedback-body"></div><button type="button" id="aral-revise">Retourner au tableau et réviser</button></section>
        <p class="aral-announcement" id="aral-status" role="status" aria-live="polite" aria-atomic="true"></p>
      </section>
      <dialog class="aral-document-dialog" id="aral-document" aria-labelledby="aral-document-title"><header><span class="aral-piece-id" id="aral-document-id"></span><button type="button" id="aral-document-close" autofocus>Fermer la pièce</button></header><div class="aral-document-scroll"><p class="aral-doc-nature" id="aral-document-meta"></p><h2 id="aral-document-title"></h2><div id="aral-document-media"></div><div id="aral-document-body"></div></div><footer><button type="button" id="aral-doc-add">Garder cette pièce au tableau</button><button type="button" id="aral-doc-next" hidden>Relier les pièces du tableau →</button><span id="aral-document-added" hidden>Cette pièce est déjà dans ton tableau.</span></footer></dialog>
      <dialog class="aral-reset-dialog" id="aral-reset-dialog" aria-labelledby="aral-reset-title"><h2 id="aral-reset-title">Ouvrir un nouveau dossier&nbsp;?</h2><p>Les positions, relations et arguments de ce dossier seront effacés sur cet appareil. Les documents resteront accessibles.</p><div class="aral-form-actions"><button type="button" id="aral-reset-cancel" autofocus>Garder mon dossier</button><button type="button" id="aral-reset-confirm">Recommencer le dossier</button></div></dialog>
      <script type="application/json" id="aral-data">{encoded}</script>
    </div>'''
