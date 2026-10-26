/* THOT Explorer — bureau documentaire Aral, sans réseau ni évaluation distante. */
(() => {
  'use strict';
  const root = document.querySelector('[data-aral]');
  if (!root) return;
  let data;
  try { data = JSON.parse(root.querySelector('#aral-data').textContent); } catch { return; }
  const docs = Array.isArray(data.documents) ? data.documents : [];
  if (!docs.length || docs.some(doc => !doc.id || !doc.title)) return;
  const byId = new Map(docs.map(doc => [doc.id, doc]));
  const $ = id => root.querySelector('#' + id);
  const KEY = 'thot.explorer.aral.v1';
  const kinds = {confirm: 'Se confirment', contradict: 'Se contredisent', context: 'Apportent du contexte', inconclusive: 'Ne permettent pas de conclure'};
  const kindColors = {confirm: '#166d71', contradict: '#b24d35', context: '#7661a3', inconclusive: '#646d73'};
  const roleLabels = {none: 'Non retenue', support: 'Appui à mon hypothèse', counter: 'Contre mon hypothèse', insufficient: 'Insuffisante pour conclure'};
  const clamp = (n, min, max) => Math.min(max, Math.max(min, Number.isFinite(Number(n)) ? Number(n) : min));
  const short = (s, max = 3000) => typeof s === 'string' ? s.slice(0, max) : '';
  const has = (doc, tag) => Array.isArray(doc.tags) && doc.tags.includes(tag);
  const el = (tag, text, className) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; };
  const button = (text, attrs = {}) => { const node = el('button', text); node.type = 'button'; for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value); return node; };
  const svg = (tag, attrs) => { const node = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value); return node; };
  const sourceOf = doc => typeof doc.source === 'object' ? doc.source : {url: doc.source, title: 'Consulter la source originale'};
  const mediaOf = doc => typeof doc.media === 'object' ? doc.media : {src: doc.media, alt: doc.alt || doc.title};
  function link(url, text) { const node = el('a', text); try { const parsed = new URL(url, location.href); if (['https:', 'http:'].includes(parsed.protocol)) node.href = parsed.href; } catch {} return node; }
  const fresh = () => ({version: 1, started: false, seen: [], cards: {}, links: [], roles: {}, hypothesis: '', customHypothesis: '', conclusion: '', hintIndex: 0, zoom: 80, view: 'documents', lastFeedback: false});
  function sanitize(raw) {
    const value = fresh();
    if (!raw || raw.version !== 1) return value;
    value.started = raw.started === true;
    value.seen = [...new Set(Array.isArray(raw.seen) ? raw.seen.filter(id => byId.has(id)) : [])];
    for (const doc of docs) {
      const point = raw.cards && raw.cards[doc.id];
      if (point && typeof point === 'object') value.cards[doc.id] = {x: clamp(point.x, 8, 780), y: clamp(point.y, 8, 544)};
      const role = raw.roles && raw.roles[doc.id];
      if (point && Object.hasOwn(roleLabels, role)) value.roles[doc.id] = role;
    }
    value.links = (Array.isArray(raw.links) ? raw.links : []).filter(item => item && item.from !== item.to && value.cards[item.from] && value.cards[item.to] && Object.hasOwn(kinds, item.kind)).slice(0, 60).map((item, index) => ({id: 'l' + index, from: item.from, to: item.to, kind: item.kind, note: short(item.note, 240)}));
    const hypotheses = new Set([...(data.hypotheses || []).map(item => item.id), 'irrigation', 'climate', 'disappearance', 'uncertain', 'custom']);
    value.hypothesis = hypotheses.has(raw.hypothesis) ? raw.hypothesis : '';
    value.customHypothesis = short(raw.customHypothesis, 300);
    value.conclusion = short(raw.conclusion);
    value.hintIndex = clamp(raw.hintIndex, 0, 100);
    value.zoom = clamp(raw.zoom, 50, 125);
    value.view = ['documents', 'board', 'argument'].includes(raw.view) ? raw.view : 'documents';
    value.lastFeedback = raw.lastFeedback === true;
    return value;
  }

  /* Critères explicites : rôle des pièces, portée des observations et liens choisis.
     Le texte libre est conservé mais n'est ni interprété ni noté par une pseudo-IA. */
  function evaluate(input, corpus = docs) {
    const evidence = corpus.filter(doc => input.cards && input.cards[doc.id]);
    const selected = evidence.filter(doc => ['support', 'counter', 'insufficient'].includes(input.roles && input.roles[doc.id]));
    const support = selected.filter(doc => input.roles[doc.id] === 'support');
    const supports = tag => support.some(doc => has(doc, tag));
    const included = tag => selected.some(doc => has(doc, tag));
    const result = {title: 'Une conclusion à ajuster à la portée des pièces', established: [], relevant: [], issues: [], next: [], relations: []};
    result.established.push('Les photographies et images datées montrent un recul et une fragmentation du plan d’eau. Une image seule ne révèle pas la cause de ce changement.');
    if (supports('irrigation') && supports('hydrology')) {
      result.established.push('Tu rapproches des prélèvements d’eau et du fonctionnement hydrologique du bassin : cela documente le mécanisme principal du recul, au-delà de la seule coïncidence entre deux courbes.');
    } else if (supports('irrigation')) {
      result.established.push('Une pièce sur les prélèvements apporte un élément causal. Relie-la au trajet des fleuves et au bilan des entrées et sorties d’eau pour expliciter le mécanisme.');
    }
    for (const doc of selected) result.relevant.push({id: doc.id, title: doc.title, role: roleLabels[input.roles[doc.id]], shows: doc.shows || doc.description || ''});
    if (!selected.length) result.issues.push('Aucune pièce n’est retenue comme preuve. Une proposition plausible devient un argument quand tu précises ce qui l’appuie, ce qui la limite et ce qui pourrait la contredire.');
    if (selected.length && !support.length) result.issues.push('Tu as surtout signalé des limites ou des contre-arguments. C’est utile ; précise aussi ce que les documents permettent effectivement d’affirmer.');
    if (input.hypothesis === 'irrigation') {
      result.title = supports('irrigation') && supports('hydrology') ? 'Un mécanisme étayé, avec des nuances à conserver' : 'Une hypothèse à relier plus précisément aux documents';
      if (selected.some(doc => has(doc, 'restoration') && input.roles[doc.id] === 'counter')) result.issues.push('La restauration partielle du Nord ne réfute pas le rôle historique des prélèvements. Elle montre l’effet d’un aménagement sur un bassin, à une autre période.');
      if (selected.some(doc => has(doc, 'climate') && input.roles[doc.id] === 'counter')) result.issues.push('Une sécheresse peut aggraver les effets des prélèvements : une pièce sur le climat ne contredit pas nécessairement cette cause principale.');
      if (!supports('irrigation')) result.issues.push('L’hypothèse des prélèvements est examinée, mais aucune pièce sur l’irrigation n’est utilisée comme appui. Les vues de la mer ne suffisent pas à établir cette cause.');
      if (!supports('hydrology')) result.next.push('Retrouve la pièce sur les fleuves et le bilan hydrologique : pourquoi une diminution des apports peut-elle faire baisser le niveau d’un lac sans débouché ?');
    } else if (input.hypothesis === 'climate') {
      result.issues.push('Les sécheresses peuvent accentuer le recul certaines années et expliquent une partie des variations. Elles ne suffisent pas, dans ce corpus, à expliquer seules toute la transformation liée aux prélèvements pour l’irrigation.');
      if (supports('climate')) result.established.push('Tu as retenu une pièce pertinente sur la variabilité climatique ; garde sa période et son échelle au lieu de la transformer en cause unique.');
      else result.next.push('Examine une pièce sur les années sèches et compare sa portée à celle des données de prélèvement.');
    } else if (input.hypothesis === 'disappearance') {
      result.issues.push('La disparition totale et définitive est trop générale : les différentes parties n’ont pas la même trajectoire. L’assèchement du bassin oriental à une date donnée ne représente pas toute la mer d’Aral.');
      const restoration = selected.find(doc => has(doc, 'restoration'));
      if (restoration && input.roles[restoration.id] === 'support') result.issues.push('La pièce de restauration est classée comme appui, mais elle montre qu’une partie de la mer subsiste. Elle limite ou contredit donc une disparition totale.');
      if (restoration && input.roles[restoration.id] === 'counter') result.established.push('Tu utilises à juste titre la restauration partielle du Nord comme contre-argument à une disparition de toute la mer.');
      else result.next.push('Ouvre la pièce sur la mer d’Aral du Nord et demande-toi si elle contredit la portée de ton hypothèse.');
    } else if (input.hypothesis === 'uncertain') {
      result.established.push('Suspendre une conclusion trop large est légitime. Il reste possible de distinguer ce que les pièces établissent déjà de ce qu’elles ne permettent pas de mesurer exactement.');
      if (supports('irrigation') && supports('hydrology')) result.next.push('Ton corpus permet déjà une conclusion limitée sur le rôle des prélèvements. Tu peux la formuler sans prétendre expliquer chaque variation annuelle.');
    } else {
      result.issues.push('Ton hypothèse libre n’est pas évaluée automatiquement sur son sens. Compare-la aux faits, aux périodes et aux critères ci-dessous ; aucun jugement sur ton texte n’est simulé.');
    }
    if (!included('restoration')) result.issues.push('Le devenir du Nord manque à ton argumentation : une restauration partielle y a été engagée. « Une grande partie a reculé » et « tout a disparu » ne décrivent pas la même chose.');
    else result.established.push('Tu prends en compte la distinction Nord/Sud et les transformations ultérieures. Une amélioration locale ne signifie pas le retour de l’ensemble du lac à son état passé.');
    if (!included('climate')) result.next.push('Pour nuancer ton explication, examine le rôle des années sèches et humides. Un facteur aggravant peut agir en même temps qu’une cause principale.');
    if (supports('consequences') && !supports('irrigation') && !supports('hydrology')) result.issues.push('Les pertes de pêche ou les poussières documentent des conséquences. Elles ne démontrent pas, à elles seules, le mécanisme initial de baisse des apports.');
    if (support.filter(doc => has(doc, 'evolution')).length >= 2) result.issues.push('Comparer deux images datées est pertinent pour décrire une évolution. Si elles appartiennent à la même série, ce ne sont pas deux sources indépendantes prouvant la cause.');
    const corpusMap = new Map(corpus.map(doc => [doc.id, doc]));
    const links = Array.isArray(input.links) ? input.links : [];
    if (!links.length) result.next.push('Essaie de relier deux pièces avec une relation précise. Explique si elles portent sur la même variable, la même période et la même partie de la mer.');
    for (const item of links) {
      const a = corpusMap.get(item.from), b = corpusMap.get(item.to);
      if (!a || !b || !Object.hasOwn(kinds, item.kind)) continue;
      let comment = 'Cette relation exprime ton interprétation. Vérifie le point commun, la période et les limites des deux pièces.';
      if (item.kind === 'contradict' && ((has(a, 'climate') && has(b, 'irrigation')) || (has(b, 'climate') && has(a, 'irrigation')))) comment = 'Attention : un rôle de la sécheresse et un rôle des prélèvements peuvent coexister. Ces pièces ne se contredisent pas nécessairement.';
      else if (item.kind === 'contradict' && ((has(a, 'restoration') && has(b, 'evolution')) || (has(b, 'restoration') && has(a, 'evolution')))) comment = 'Compare les lieux et les dates : une restauration au Nord et un recul au Sud peuvent être vrais simultanément. Ce n’est pas forcément une contradiction.';
      else if ((has(a, 'irrigation') && has(b, 'hydrology')) || (has(b, 'irrigation') && has(a, 'hydrology'))) comment = 'Ce rapprochement peut expliciter le mécanisme reliant prélèvements et diminution des apports. Garde les périodes et unités des sources ; le simple lien dessiné ne le valide pas à lui seul.';
      else if (has(a, 'evolution') && has(b, 'evolution')) comment = 'Ces pièces se comparent pour observer une évolution datée. Leur rapprochement ne suffit pas à identifier les causes du changement.';
      result.relations.push({from: a.id, to: b.id, kind: kinds[item.kind], note: item.note || '', comment});
    }
    result.next.push('Pour aller plus loin, il faudrait examiner les débits réellement arrivés à chaque partie du lac, les prélèvements, l’évaporation et leurs variations avec des séries comparables.');
    return result;
  }

  let state = fresh(), storageAvailable = true, saveTimer, activeDocument = null, opener = null, editingLink = null;
  try { const stored = localStorage.getItem(KEY); if (stored) { try { state = sanitize(JSON.parse(stored)); } catch { state = fresh(); } } } catch { storageAvailable = false; }
  const announce = text => { $('aral-status').textContent = text; };
  function storageMessage() { $('aral-storage').textContent = storageAvailable ? 'Reprise automatique sur cet appareil uniquement. Aucun compte ni envoi à un serveur.' : 'La reprise locale est indisponible dans ce navigateur. Tu peux poursuivre toute l’enquête ; garde la page ouverte pour conserver ce dossier.'; }
  function saveNow() { clearTimeout(saveTimer); if (!storageAvailable) return; try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { storageAvailable = false; storageMessage(); } }
  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 250); }
  window.addEventListener('pagehide', saveNow);
  window.THOT_ARAL = {evaluate, getState: () => JSON.parse(JSON.stringify(state)), storageKey: KEY};
  function setView(view, focus = false) {
    state.view = view;
    root.querySelector('.aral-desk').dataset.currentView = view;
    root.querySelectorAll('[data-aral-view]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.aralView === view)));
    if (focus && matchMedia('(max-width: 1100px)').matches) {
      const heading = root.querySelector('[data-aral-panel="' + view + '"] h3');
      heading.tabIndex = -1; heading.focus();
    }
    save();
  }
  function start() { state.started = true; $('aral-dossier').hidden = false; $('aral-desk-title').focus(); $('aral-dossier').scrollIntoView({block: 'start', behavior: 'auto'}); save(); }
  function markSeen(id) { if (!state.seen.includes(id)) { state.seen.push(id); updateCatalogue(); save(); } }
  function updateCatalogue() {
    root.querySelectorAll('[data-seen]').forEach(node => { const seen = state.seen.includes(node.dataset.seen); node.textContent = seen ? 'Pièce ouverte' : 'À examiner'; node.classList.toggle('is-seen', seen); });
    root.querySelectorAll('[data-add-doc]').forEach(node => { const included = Boolean(state.cards[node.dataset.addDoc]); node.hidden = included; });
    $('aral-seen-count').textContent = state.seen.length + ' / ' + docs.length + ' pièces ouvertes';
    $('aral-board-count').textContent = Object.keys(state.cards).length + ' pièces · ' + state.links.length + ' relations';
  }
  function docBody(doc) {
    const box = $('aral-document-body'); box.replaceChildren();
    box.append(el('p', doc.description || ''));
    for (const [title, text] of [['Ce que la pièce montre', doc.shows], ['Ce qu’elle ne permet pas d’établir', doc.limits]]) { box.append(el('h3', title), el('p', text || 'Voir les limites précisées dans la source.')); }
    const source = sourceOf(doc);
    box.append(el('p', [doc.author, doc.credit].filter(Boolean).join(' · '), 'aral-document-credit'));
    if (doc.license_url) box.append(link(doc.license_url, doc.license || 'Conditions de réutilisation')); else box.append(el('p', doc.license || 'Voir les conditions dans la source.'));
    const p = el('p'); p.append(link(source.url, source.title || 'Consulter la source originale')); box.append(p);
  }
  function closeDocument() {
    $('aral-document').close();
    if (opener && document.contains(opener)) opener.focus();
  }
  function openDocument(id, trigger) {
    const doc = byId.get(id); if (!doc) return;
    activeDocument = id; opener = trigger || document.activeElement;
    $('aral-document-id').textContent = id.toUpperCase(); $('aral-document-title').textContent = doc.title;
    $('aral-document-meta').textContent = [doc.nature, doc.date, doc.author].filter(Boolean).join(' · ');
    docBody(doc); const mediaBox = $('aral-document-media'); mediaBox.replaceChildren();
    const media = mediaOf(doc);
    if (media.src) {
      const viewport = el('div', undefined, 'aral-image-viewport'); viewport.tabIndex = 0; viewport.setAttribute('role', 'region'); viewport.setAttribute('aria-label', 'Image agrandissable ; flèches pour déplacer la vue');
      const image = el('img'); image.src = media.src; image.alt = media.alt || doc.title; image.draggable = false;
      const failure = el('p', 'L’image n’a pas pu être chargée. La description, les limites et le lien vers la source restent disponibles.', 'aral-image-failure'); failure.hidden = true;
      image.addEventListener('error', () => { image.hidden = true; failure.hidden = false; }); viewport.append(image, failure);
      viewport.addEventListener('keydown', event => { const moves = {ArrowLeft: [-60, 0], ArrowRight: [60, 0], ArrowUp: [0, -60], ArrowDown: [0, 60]}; if (event.target === viewport && moves[event.key]) { event.preventDefault(); viewport.scrollBy(...moves[event.key]); } });
      const controls = el('div', undefined, 'aral-image-controls');
      const label = el('label', 'Agrandissement de l’image'); label.htmlFor = 'aral-doc-zoom';
      const zoom = el('input'); zoom.type = 'range'; zoom.min = '1'; zoom.max = '3'; zoom.step = '.25'; zoom.value = '1'; zoom.id = 'aral-doc-zoom';
      const output = el('output', '100 %'); output.htmlFor = 'aral-doc-zoom';
      function updateZoom() { image.style.width = Number(zoom.value) * 100 + '%'; output.textContent = Math.round(Number(zoom.value) * 100) + ' %'; }
      zoom.addEventListener('input', updateZoom); const reset = button('Vue entière'); reset.addEventListener('click', () => { zoom.value = '1'; updateZoom(); viewport.scrollTop = 0; viewport.scrollLeft = 0; });
      controls.append(label, zoom, output, reset); mediaBox.append(viewport, controls);
    } else if (doc.visual_html) {
      const visual = el('div', undefined, 'aral-trusted-visual'); visual.innerHTML = doc.visual_html; mediaBox.append(visual);
    }
    const present = Boolean(state.cards[id]); $('aral-doc-add').hidden = present; $('aral-document-added').hidden = !present;
    markSeen(id); $('aral-document').showModal();
  }
  function boardZoom() {
    const factor = Number(state.zoom) / 100; const size = root.querySelector('.aral-board-size'), canvas = root.querySelector('[data-aral-canvas]');
    size.style.width = 1000 * factor + 'px'; size.style.height = 780 * factor + 'px'; canvas.style.transform = 'scale(' + factor + ')';
    $('aral-board-zoom').value = state.zoom; $('aral-board-zoom-value').textContent = state.zoom + ' %';
  }
  function drawThreads() {
    const target = root.querySelector('.aral-threads'); target.replaceChildren();
    for (const item of state.links) {
      const a = state.cards[item.from], b = state.cards[item.to]; if (!a || !b) continue;
      const x1 = a.x + 105, y1 = a.y + 110, x2 = b.x + 105, y2 = b.y + 110;
      const path = svg('path', {d: `M ${x1} ${y1} Q ${(x1+x2)/2+35} ${(y1+y2)/2-35} ${x2} ${y2}`, fill: 'none', stroke: kindColors[item.kind], 'stroke-width': '3', 'stroke-dasharray': item.kind === 'inconclusive' ? '7 6' : 'none'});
      const label = svg('text', {x: (x1+x2)/2+17, y: (y1+y2)/2-20, 'text-anchor': 'middle', fill: kindColors[item.kind]}); label.textContent = kinds[item.kind]; target.append(path, label);
    }
  }
  function move(id, dx, dy, speak = true) {
    const point = state.cards[id]; if (!point) return;
    point.x = clamp(point.x + dx, 8, 780); point.y = clamp(point.y + dy, 8, 544);
    const card = root.querySelector('[data-board-card="' + id + '"]'); if (card) { card.style.left = point.x + 'px'; card.style.top = point.y + 'px'; }
    drawThreads(); save(); if (speak) announce('Pièce ' + id.toUpperCase() + ' déplacée. Position ' + Math.round(point.x) + ', ' + Math.round(point.y) + ' dans le tableau.');
  }
  function cardFor(id) {
    const doc = byId.get(id), point = state.cards[id];
    const card = el('article', undefined, 'aral-paper'); card.dataset.boardCard = id; card.style.left = point.x + 'px'; card.style.top = point.y + 'px';
    const handle = button(id.toUpperCase() + ' · Déplacer', {'data-move-card': id, 'aria-describedby': 'aral-board-instructions'}); handle.className = 'aral-paper-handle';
    handle.addEventListener('focus', () => { $('aral-selected-card').value = id; });
    handle.addEventListener('keydown', event => { const step = event.shiftKey ? 5 : 25, moves = {ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step]}; if (moves[event.key]) { event.preventDefault(); move(id, ...moves[event.key]); } });
    let drag;
    handle.addEventListener('pointerdown', event => { if (event.button !== 0) return; event.preventDefault(); handle.focus(); drag = {x: event.clientX, y: event.clientY, left: state.cards[id].x, top: state.cards[id].y}; handle.setPointerCapture(event.pointerId); card.classList.add('is-moving'); });
    handle.addEventListener('pointermove', event => { if (!drag) return; const factor = state.zoom / 100; const point = state.cards[id]; move(id, drag.left + (event.clientX-drag.x)/factor - point.x, drag.top + (event.clientY-drag.y)/factor - point.y, false); });
    function finishDrag() { if (!drag) return; drag = null; card.classList.remove('is-moving'); save(); announce('Position de la pièce ' + id.toUpperCase() + ' conservée.'); }
    handle.addEventListener('pointerup', finishDrag); handle.addEventListener('pointercancel', finishDrag);
    const media = mediaOf(doc); if (media.src) { const image = el('img'); image.src = media.src; image.alt = ''; image.draggable = false; image.addEventListener('error', () => { image.hidden = true; }); card.append(image); } else card.append(el('p', doc.nature || 'Document', 'aral-paper-type'));
    const open = button(doc.title, {'data-board-open': id}); open.className = 'aral-paper-open'; open.addEventListener('click', () => openDocument(id, open));
    const remove = button('Retirer', {'data-remove-doc': id, 'aria-label': 'Retirer la pièce ' + id.toUpperCase() + ' du tableau'}); remove.className = 'aral-paper-remove'; remove.addEventListener('click', () => removeDoc(id));
    card.prepend(handle); card.append(open, remove); return card;
  }
  function fillSelect(select, values, placeholder) {
    const before = select.value; select.replaceChildren(); const empty = el('option', placeholder); empty.value = ''; select.append(empty);
    for (const id of values) { const option = el('option', id.toUpperCase() + ' · ' + byId.get(id).title); option.value = id; select.append(option); }
    if (values.includes(before)) select.value = before;
  }
  function proofRoles() {
    const box = $('aral-proof-roles'); box.replaceChildren(); const ids = Object.keys(state.cards);
    if (!ids.length) { box.append(el('p', 'Ajoute d’abord une pièce au tableau.', 'aral-empty-note')); return; }
    for (const id of ids) {
      const label = el('label', id.toUpperCase() + ' · ' + byId.get(id).title, 'aral-proof-label'); const select = el('select'); select.dataset.proofRole = id;
      for (const [role, text] of Object.entries(roleLabels)) { const option = el('option', text); option.value = role; select.append(option); }
      select.value = state.roles[id] || 'none'; select.addEventListener('change', () => { state.roles[id] = select.value; save(); }); label.append(select); box.append(label);
    }
  }
  function cancelLinkEdit() { editingLink = null; $('aral-link-save').textContent = 'Relier ces pièces'; $('aral-link-cancel').hidden = true; $('aral-link-note').value = ''; }
  function renderLinks() {
    const list = root.querySelector('.aral-links-list'); list.replaceChildren();
    for (const item of state.links) {
      const li = el('li'); li.dataset.linkId = item.id; li.dataset.kind = item.kind;
      const title = el('strong', item.from.toUpperCase() + ' ↔ ' + item.to.toUpperCase()); const kind = el('span', kinds[item.kind], 'aral-link-kind'); li.append(title, kind);
      if (item.note) li.append(el('p', item.note));
      const actions = el('div', undefined, 'aral-link-actions');
      const edit = button('Modifier', {'data-edit-link': item.id, 'aria-label': 'Modifier la relation ' + item.from.toUpperCase() + ' et ' + item.to.toUpperCase()});
      edit.addEventListener('click', () => { editingLink = item.id; $('aral-link-from').value = item.from; $('aral-link-to').value = item.to; $('aral-link-kind').value = item.kind; $('aral-link-note').value = item.note; $('aral-link-save').textContent = 'Enregistrer la relation'; $('aral-link-cancel').hidden = false; $('aral-link-from').focus(); });
      const remove = button('Supprimer', {'data-delete-link': item.id, 'aria-label': 'Supprimer la relation ' + item.from.toUpperCase() + ' et ' + item.to.toUpperCase()});
      remove.addEventListener('click', () => { state.links = state.links.filter(link => link.id !== item.id); if (editingLink === item.id) cancelLinkEdit(); renderLinks(); drawThreads(); updateCatalogue(); save(); $('aral-link-from').focus(); announce('Relation supprimée.'); });
      actions.append(edit, remove); li.append(actions); list.append(li);
    }
  }
  function renderBoard() {
    const ids = Object.keys(state.cards), container = root.querySelector('.aral-board-cards'); container.replaceChildren(...ids.map(cardFor)); root.querySelector('.aral-board-empty').hidden = ids.length > 0;
    fillSelect($('aral-selected-card'), ids, 'Choisir une pièce'); fillSelect($('aral-link-from'), ids, 'Choisir une pièce'); fillSelect($('aral-link-to'), ids, 'Choisir une pièce');
    root.querySelector('.aral-position-controls').hidden = !ids.length; $('aral-link-form').hidden = ids.length < 2;
    proofRoles(); renderLinks(); boardZoom(); drawThreads(); updateCatalogue();
  }
  function addDoc(id) {
    if (!byId.has(id) || state.cards[id]) return;
    const index = Object.keys(state.cards).length; state.cards[id] = {x: 24 + index % 4 * 240, y: 24 + Math.floor(index / 4) * 245}; state.roles[id] = 'none'; state.started = true;
    renderBoard(); $('aral-selected-card').value = id; setView('board'); save(); announce('Pièce ' + id.toUpperCase() + ' ajoutée au tableau, sans sélection automatique comme preuve.');
  }
  function removeDoc(id) {
    delete state.cards[id]; delete state.roles[id]; state.links = state.links.filter(item => item.from !== id && item.to !== id); cancelLinkEdit(); renderBoard(); save(); $('aral-selected-card').focus(); announce('Pièce ' + id.toUpperCase() + ' retirée ; les relations qui en dépendaient sont retirées aussi.');
  }
  function appendList(target, heading, lines) { const section = el('section'); section.append(el('h3', heading)); const list = el('ul'); for (const line of lines) list.append(el('li', line)); section.append(list); target.append(section); }
  function feedback(focus = true) {
    const result = evaluate(state); const box = $('aral-feedback-body'); box.replaceChildren(); $('aral-feedback-title').textContent = result.title;
    const quote = el('blockquote', state.conclusion); box.append(el('p', 'Ton explication proposée :', 'aral-feedback-label'), quote);
    appendList(box, 'Ce qui est établi, et à quelle échelle', result.established);
    const evidence = el('section'); evidence.append(el('h3', 'Les pièces réellement retenues'));
    if (!result.relevant.length) evidence.append(el('p', 'Aucune pièce retenue pour l’instant.'));
    for (const piece of result.relevant) { const p = el('p'); p.append(el('strong', piece.id.toUpperCase() + ' · ' + piece.role + ' — '), el('span', piece.title + '. ' + piece.shows)); evidence.append(p); } box.append(evidence);
    if (result.issues.length) appendList(box, 'Les limites de ton raisonnement', result.issues);
    if (result.relations.length) { const section = el('section'); section.append(el('h3', 'Retour sur tes relations')); for (const item of result.relations) { section.append(el('h4', item.from.toUpperCase() + ' ↔ ' + item.to.toUpperCase() + ' · ' + item.kind), el('p', item.comment)); if (item.note) section.append(el('blockquote', item.note)); } box.append(section); }
    appendList(box, 'À vérifier ou à explorer ensuite', result.next);
    box.append(el('p', 'Ce bilan ne juge ni les personnes ni leur « niveau d’esprit critique ». Il rapproche tes choix de critères documentaires ; ton argumentation libre reste à discuter.', 'aral-evaluation-note'));
    $('aral-feedback').hidden = false; if (focus) { $('aral-feedback-title').focus(); $('aral-feedback').scrollIntoView({block: 'start', behavior: 'auto'}); }
  }

  $('aral-start').hidden = false; $('aral-start').textContent = state.started ? 'Reprendre le dossier →' : 'Entrer dans le dossier →'; $('aral-start').addEventListener('click', start);
  $('aral-dossier').hidden = !state.started; if (state.started) { $('aral-resume').hidden = false; $('aral-resume').textContent = 'Ton dossier est repris avec ' + Object.keys(state.cards).length + ' pièces au tableau. Tu peux toujours le recommencer.'; }
  root.querySelectorAll('.aral-doc-actions, .aral-session-tools, .aral-mobile-tabs, .aral-board-controls, .aral-argument-interactive').forEach(node => { node.hidden = false; });
  root.querySelectorAll('[data-static-doc]').forEach(node => { node.hidden = true; });
  root.querySelectorAll('[data-open-doc]').forEach(node => node.addEventListener('click', () => openDocument(node.dataset.openDoc, node)));
  root.querySelectorAll('[data-add-doc]').forEach(node => node.addEventListener('click', () => { addDoc(node.dataset.addDoc); setView('board', true); }));
  root.querySelectorAll('[data-aral-view]').forEach(node => node.addEventListener('click', () => setView(node.dataset.aralView, true)));
  $('aral-document-close').addEventListener('click', closeDocument);
  $('aral-document').addEventListener('close', () => { if (opener && document.contains(opener) && !matchMedia('(max-width: 1100px)').matches) opener.focus(); });
  $('aral-doc-add').addEventListener('click', () => { addDoc(activeDocument); closeDocument(); setView('board', true); });
  $('aral-board-zoom').addEventListener('input', event => { state.zoom = Number(event.target.value); boardZoom(); save(); });
  $('aral-arrange').addEventListener('click', () => { Object.keys(state.cards).forEach((id, index) => { state.cards[id] = {x: 24 + index % 4 * 240, y: 24 + Math.floor(index / 4) * 245}; }); renderBoard(); save(); announce('Pièces rangées en lignes. Les relations et rôles sont conservés.'); });
  root.querySelectorAll('[data-board-move]').forEach(node => node.addEventListener('click', () => { const id = $('aral-selected-card').value; if (!id) { announce('Choisis d’abord une pièce à déplacer.'); $('aral-selected-card').focus(); return; } const moves = {left: [-25, 0], right: [25, 0], up: [0, -25], down: [0, 25]}; move(id, ...moves[node.dataset.boardMove]); }));
  $('aral-remove-selected').addEventListener('click', () => { const id=$('aral-selected-card').value; if(id)removeDoc(id);else {announce('Choisis d’abord une pièce.');$('aral-selected-card').focus();} });
  $('aral-link-cancel').addEventListener('click', cancelLinkEdit);
  $('aral-link-form').addEventListener('submit', event => {
    event.preventDefault(); const from = $('aral-link-from').value, to = $('aral-link-to').value, kind = $('aral-link-kind').value, note = $('aral-link-note').value.trim();
    if (!state.cards[from] || !state.cards[to] || from === to || !Object.hasOwn(kinds, kind)) { $('aral-link-error').textContent = 'Choisis deux pièces différentes présentes sur ton tableau.'; return; }
    const existing = state.links.find(item => item.id === editingLink) || state.links.find(item => item.from === from && item.to === to && item.kind === kind);
    if (existing) Object.assign(existing, {from, to, kind, note}); else state.links.push({id: 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), from, to, kind, note});
    $('aral-link-error').textContent = 'Relation enregistrée : ' + kinds[kind].toLowerCase() + '.'; cancelLinkEdit(); renderLinks(); drawThreads(); updateCatalogue(); save();
  });
  root.querySelectorAll('[name=aral-hypothesis]').forEach(node => { node.checked = node.value === state.hypothesis; node.addEventListener('change', () => { state.hypothesis = node.value; save(); }); });
  $('aral-conclusion').value = state.conclusion; $('aral-custom-hypothesis').value = state.customHypothesis;
  $('aral-conclusion').addEventListener('input', event => { state.conclusion = event.target.value; save(); });
  $('aral-custom-hypothesis').addEventListener('input', event => { state.customHypothesis = event.target.value; save(); });
  $('aral-conclusion-form').addEventListener('submit', event => { event.preventDefault(); if (!state.hypothesis) { $('aral-conclusion-error').textContent = 'Choisis une hypothèse, y compris « pas encore assez d’éléments », avant d’examiner le bilan.'; return; } if (!state.conclusion.trim()) { $('aral-conclusion-error').textContent = 'Écris une conclusion, même provisoire, pour pouvoir la réviser ensuite.'; return; } $('aral-conclusion-error').textContent = ''; state.lastFeedback = true; feedback(); save(); });
  $('aral-revise').addEventListener('click', () => { $('aral-feedback').hidden = true; state.lastFeedback = false; setView('argument', true); $('aral-conclusion').focus(); save(); announce('Ton tableau et tes choix sont conservés pour réviser ton explication.'); });
  const hints = data.hints && data.hints.length ? data.hints : ['Commence par les dates : quelles pièces montrent une évolution, et lesquelles en proposent une explication ?', 'Une conséquence n’est pas forcément une preuve de la cause. Cherche le trajet de l’eau.', 'La mer d’Aral n’est pas un seul bassin immobile : compare le Nord, le Sud et les dates.'];
  $('aral-hint').addEventListener('click', () => { $('aral-help').hidden = false; $('aral-hint').setAttribute('aria-expanded', 'true'); $('aral-hint-text').textContent = hints[state.hintIndex % hints.length]; state.hintIndex++; $('aral-hint').textContent = 'Un autre repère, THOT ?'; announce('Indice facultatif : ' + $('aral-hint-text').textContent); save(); });
  $('aral-reset').addEventListener('click', () => $('aral-reset-dialog').showModal());
  $('aral-reset-cancel').addEventListener('click', () => { $('aral-reset-dialog').close(); $('aral-reset').focus(); });
  $('aral-reset-confirm').addEventListener('click', () => { state = fresh(); state.started = true; cancelLinkEdit(); renderBoard(); $('aral-conclusion').value = ''; $('aral-custom-hypothesis').value = ''; root.querySelectorAll('[name=aral-hypothesis]').forEach(node => { node.checked = false; }); $('aral-feedback').hidden = true; $('aral-help').hidden = true; $('aral-resume').hidden = true; $('aral-hint').setAttribute('aria-expanded', 'false'); $('aral-hint').textContent = 'Un indice, THOT ?'; $('aral-link-error').textContent = ''; $('aral-conclusion-error').textContent = ''; setView('documents', true); $('aral-reset-dialog').close(); $('aral-desk-title').focus(); saveNow(); announce('Nouveau dossier ouvert. Les documents restent tous accessibles.'); });
  root.classList.add('is-enhanced'); storageMessage(); renderBoard(); setView(state.view); if (state.lastFeedback && state.conclusion && state.hypothesis) feedback(false);
})();
