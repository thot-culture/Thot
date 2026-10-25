/* Socle des enquêtes : aucune mesure de personne, aucun réseau, aucun stockage. */
(() => {
  'use strict';
  const root = document.querySelector('[data-dossier]');
  const payload = document.getElementById('dossier-donnees');
  if (!root || !payload) return;
  let data;
  try { data = JSON.parse(payload.textContent); } catch { return; }
  const form = root.querySelector('form');
  const avis = root.querySelector('#avis'), raison = root.querySelector('#raison');
  const status = root.querySelector('[data-status]');
  const resolution = root.querySelector('.resolution'), result = root.querySelector('[data-result]');
  const proofs = [...root.querySelectorAll('[data-proof]')];
  if (!form || !avis || !raison || !status || !resolution || !result
      || !Array.isArray(data.pieces) || proofs.length !== data.pieces.length) return;
  const names = { etayee: 'étayée', limitee: 'de portée limitée', contredite: 'contredite', insuffisante: 'encore indécidable' };
  const notebook = root.querySelector('[data-notebook]');
  let imageFailed = false;
  function invalidate() {
    if (!resolution.hidden) {
      resolution.hidden = true;
      status.textContent = 'Votre avis ou votre carnet a changé. Confrontez à nouveau votre conclusion aux pièces.';
    }
  }
  function updateNotebook() {
    const retained = proofs.filter(p => p.checked);
    notebook.textContent = retained.length ? 'Retenu dans votre carnet : ' + retained.map(p => data.pieces.find(item => item.id === p.value).proof).join(' ; ') : 'Aucune preuve retenue.';
    invalidate();
  }
  proofs.forEach(p => p.addEventListener('change', updateNotebook));
  avis.addEventListener('change', invalidate);
  raison.addEventListener('input', invalidate);
  function paragraph(text, className) {
    const p = document.createElement('p'); p.textContent = text;
    if (className) p.className = className;
    result.append(p); return p;
  }
  function heading(text) { const h = document.createElement('h3'); h.textContent = text; result.append(h); }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!Object.hasOwn(names, avis.value)) {
      status.textContent = 'Choisissez une conclusion provisoire, même si vous hésitez.'; avis.focus(); return;
    }
    if (!raison.value.trim()) {
      status.textContent = 'Ajoutez une phrase pour expliquer votre avis.'; raison.focus(); return;
    }
    const retained = proofs.filter(p => p.checked).map(p => p.value);
    const supported = data.supports.some(group => group.every(id => retained.includes(id)));
    const missing = supported ? [] : data.required.filter(id => !retained.includes(id));
    result.replaceChildren();
    paragraph('Votre conclusion provisoire : l’affirmation est ' + names[avis.value] + '.');
    paragraph('Votre justification : « ' + raison.value.trim() + ' »', 'your-reason');
    paragraph('Cette phrase vous aide à expliciter votre raisonnement ; elle n’est pas notée automatiquement.');
    if (!retained.length) {
      paragraph('Votre carnet est vide : votre avis reste à étayer. Cela ne signifie pas que les pièces du dossier sont insuffisantes. Retournez choisir les informations qui justifient votre conclusion.', 'review-note');
    } else if (avis.value === data.expected && supported) {
      paragraph('Votre conclusion et les preuves retenues vont ensemble. Regardez aussi les limites de ces preuves : une conclusion proportionnée sait où s’arrêter.', 'supported-note');
    } else if (avis.value === data.expected) {
      paragraph('Votre conclusion correspond à ce que permet le dossier, mais votre carnet ne fait pas encore apparaître tous les appuis utiles. La bonne formule seule ne remplace pas sa justification.', 'review-note');
    } else if (avis.value === 'insuffisante') {
      paragraph('Suspendre son avis peut être raisonnable. Ici, des pièces permettent pourtant d’aller plus loin sur la question précise posée. Cherchez lesquelles, sans étendre la conclusion au-delà.', 'review-note');
    } else {
      paragraph('La conclusion choisie va au-delà de ce que ces pièces permettent, ou ne correspond pas à leur contenu. On peut la réviser sans porter de jugement sur la personne qui l’a formulée.', 'review-note');
    }
    heading('Vos preuves : ce qu’elles établissent, et leurs limites');
    for (const piece of data.pieces.filter(p => retained.includes(p.id))) {
      const p = paragraph(piece.title + ' — ' + piece.feedback);
      const a = document.createElement('a'); a.href = '#piece-' + piece.id; a.textContent = ' Relire cette pièce'; p.append(a);
    }
    if (missing.length) {
      paragraph('À examiner ou à expliciter dans votre carnet : ' + data.pieces.filter(p => missing.includes(p.id)).map(p => p.title).join(' ; ') + '.');
    }
    if (data.kind === 'chart') {
      paragraph(retained.includes('echelle') ? 'Votre carnet distingue bien la présentation des valeurs. Le départ actuel du graphique réglable est ' + root.querySelector('#depart').value + ' €, celui de la référence reste 0 €.' : 'Votre carnet ne traite pas encore la présentation. Essayez deux départs d’axe et retenez ce qui change, en plus d’une observation sur les données.');
    }
    if (data.kind === 'photo' && imageFailed) {
      paragraph('L’image n’a pas chargé : appuyez-vous sur les pièces textuelles de provenance, sans présenter les pixels comme une observation que vous auriez faite.', 'review-note');
    }
    heading('Ce que permet le dossier'); paragraph(data.answer);
    heading('Ce qu’il ne permet pas'); paragraph(data.limits);
    heading('À vérifier ensuite'); paragraph(data.next);
    paragraph('Le réflexe à emporter : « ' + data.reflex + ' »', 'reflex');
    resolution.hidden = false;
    status.textContent = 'Dénouement disponible : votre conclusion et vos pièces ont été mises en regard. Vous pouvez réviser votre avis.';
    resolution.focus({preventScroll:true}); resolution.scrollIntoView({block:'start',behavior:'auto'});
  });
  root.querySelector('[data-revise]').addEventListener('click', () => {
    avis.focus({preventScroll:true}); form.scrollIntoView({block:'start',behavior:'auto'});
    status.textContent = 'Vos preuves et votre phrase sont conservées. Changez ce qui vous semble utile, puis confrontez à nouveau votre conclusion.';
  });
  const range = root.querySelector('#depart');
  function draw(svg, minimum) {
    const y = value => 200 - (value - minimum) / (12 - minimum) * 165;
    svg.querySelectorAll('[data-bar]').forEach(bar => {
      const top = y(Number(bar.dataset.bar)); bar.setAttribute('y', top); bar.setAttribute('height',200-top);
    });
    svg.querySelectorAll('[data-value]').forEach(label => label.setAttribute('y',y(Number(label.dataset.value))-8));
    const ticks = svg.querySelector('[data-ticks]'); ticks.replaceChildren();
    const ns = 'http://www.w3.org/2000/svg';
    const values = [...new Set([minimum,...[4,8,12].filter(v=>v>minimum)])];
    values.forEach(value => {
      const label = document.createElementNS(ns,'text');label.setAttribute('x','42');label.setAttribute('y',y(value)+4);label.setAttribute('text-anchor','end');label.textContent=String(value);ticks.append(label);
    });
    svg.querySelector('.static-ticks').setAttribute('display','none');
    svg.querySelector('[data-bottom]').textContent = 'Départ : ' + minimum + ' € · maximum : 12 €';
    svg.querySelector('desc').textContent = 'Axe vertical de ' + minimum + ' à 12 euros. Prix inchangés : 8 euros au jour 1 et 10 euros au jour 30.';
  }
  function scale() {
    const value = Number(range.value);
    draw(root.querySelector('#graph-reglable'),value);
    root.querySelector('#depart-valeur').textContent = value+' €';
    range.setAttribute('aria-valuetext','Départ à '+value+' euros, maximum à 12 euros. Les prix restent 8 et 10 euros.');
  }
  if (range) {
    range.addEventListener('input',scale);
    root.querySelector('[data-zero]').addEventListener('click',()=>{range.value='0';scale();});
    draw(root.querySelector('#graph-zero'),0);scale();
  }
  const image = root.querySelector('#photo-original');
  function frame(mode) {
    root.querySelector('#photo-cadre').classList.toggle('is-cropped',mode==='crop');
    root.querySelectorAll('[data-photo]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.photo===mode)));
    root.querySelector('#photo-mode').textContent = mode==='crop' ? 'Cadrage partiel d’affichage THOT : une partie du fichier est masquée, les pixels ne sont pas retouchés. Revenez à l’image entière à tout moment.' : 'Image entière du fichier fourni par la NASA, sans retouche de THOT.';
  }
  if (image) {
    const source=image.getAttribute('src');
    image.addEventListener('error',()=>{imageFailed=true;root.querySelector('#photo-erreur').hidden=false;image.hidden=true;});
    image.addEventListener('load',()=>{imageFailed=false;root.querySelector('#photo-erreur').hidden=true;image.hidden=false;});
    root.querySelector('[data-retry]').addEventListener('click',()=>{
      status.textContent='Nouvelle tentative de chargement de la photographie.';image.src=source;
    });
    root.querySelectorAll('[data-photo]').forEach(b=>b.addEventListener('click',()=>frame(b.dataset.photo)));
    frame('crop');
    if (image.complete && image.naturalWidth===0) image.dispatchEvent(new Event('error'));
  }
  root.querySelector('[data-reset]').addEventListener('click',()=>{
    form.reset();proofs.forEach(p=>p.checked=false);resolution.hidden=true;result.replaceChildren();updateNotebook();
    root.querySelectorAll('details').forEach(d=>d.open=false);
    if(range){range.value='0';scale();}
    if(image)frame('crop');
    status.textContent='Enquête recommencée : carnet et conclusion remis à zéro. Aucun autre jeu n’a été modifié.';
    root.querySelector('.pieces summary').focus();
  });
  root.querySelector('.text-solution').hidden=true;
  root.querySelectorAll('[data-interactive]').forEach(n=>n.hidden=false);
  root.dataset.ready='true';
})();
