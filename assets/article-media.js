/* THOT — Médias éditoriaux. Chaque entrée du catalogue a une notice de droits et une légende. */
(() => {
  'use strict';
  const slots = [...document.querySelectorAll('[data-thot-image]')];
  if (!slots.length) return;
  const script = document.currentScript;
  if (!script || !script.src) return;

  function el(tag, css, content) {
    const node = document.createElement(tag);
    if (css) node.className = css;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function render(slot, record) {
    if (!record || !record.url || !record.sourceUrl || !record.alt ||
        !record.caption || !record.licence || !record.licenceUrl) return;

    const figure = el('figure', 'thot-illustration');
    const link = el('a', 'thot-illustration-photo');
    link.href = record.sourceUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Ouvrir la notice de cette image dans un nouvel onglet');
    const img = el('img');
    img.src = record.url;
    img.alt = record.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
      const fallback = el('span', 'thot-illustration-fallback', 'Image indisponible — ouvrir la notice originale ↗');
      link.replaceChildren(fallback);
    }, { once: true });
    link.append(img);
    figure.append(link);

    const figcaption = el('figcaption', 'thot-illustration-caption');
    figcaption.append(el('span', 'thot-illustration-type', (record.kind || 'DOCUMENT') + ' · ' + (record.date || 'Date inconnue')));
    figcaption.append(el('strong', 'thot-illustration-title', record.title || 'Document historique'));
    figcaption.append(el('p', 'thot-illustration-description', record.caption));
    const credits = el('small', 'thot-illustration-credits', record.credit ? record.credit + ' · ' : '');
    const licenseLink = el('a', '', record.licence);
    licenseLink.href = record.licenceUrl;
    licenseLink.target = '_blank';
    licenseLink.rel = 'noopener noreferrer';
    const sourceLink = el('a', '', 'Notice de l’image ↗');
    sourceLink.href = record.sourceUrl;
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener noreferrer';
    credits.append(licenseLink, document.createTextNode(' · '), sourceLink);
    figcaption.append(credits);
    figure.append(figcaption);
    slot.replaceWith(figure);
  }

  fetch(new URL('illustrations.json', script.src), { cache: 'force-cache' })
    .then(response => {
      if (!response.ok) throw new Error('Catalogue des images indisponible');
      return response.json();
    })
    .then(catalogue => {
      for (const slot of slots) render(slot, catalogue[slot.dataset.thotImage]);
    })
    .catch(() => {
      for (const slot of slots) {
        const fallback = el('p', 'thot-illustration-error', 'Les illustrations n’ont pas pu être chargées.');
        slot.replaceWith(fallback);
      }
    });
})();
