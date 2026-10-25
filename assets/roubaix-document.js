/* THOT — Lecture détaillée de l’unique affiche explicitement sélectionnée. */
(() => {
  'use strict';
  function mount(root) {
  const viewport = root.querySelector('[data-document-part="viewport"]') || root.querySelector('#laine-viewport');
  const surface = root.querySelector('[data-document-part="surface"]') || root.querySelector('#laine-surface');
  const image = root.querySelector('[data-document-part="image"]') || root.querySelector('#laine-image');
  const marker = root.querySelector('[data-document-part="marker"]') || root.querySelector('#laine-zone');
  const controls = root.querySelector('[data-document-part="controls"]') || root.querySelector('#laine-commandes');
  const status = root.querySelector('[data-document-part="status"]') || root.querySelector('#laine-statut');
  const buttons = [...root.querySelectorAll('[data-document-action]')];
  if (!viewport || !surface || !image || !marker || !controls || !status ||
      !image.dataset.fullSrc || buttons.length !== 4) return;
  let config = null;
  const configNode = root.querySelector('[data-document-config]');
  if (configNode) { try { config = JSON.parse(configNode.textContent); } catch { return; } }
  const width = config ? Number(config.width) : 1238, height = config ? Number(config.height) : 1685;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
  // Coordonnées relues sur le scan, en pixels du fichier original intact.
  const legacyRegions = {
    date: { x: 700, y: 1517, w: 392, h: 48, label: 'La date imprimée : Roubaix, le 30 Octobre 1917.' },
    objet: { x: 48, y: 255, w: 1136, h: 390, label: 'Le titre : prélèvement des laines et mélanges de laines provenant des matelas et coussins.' }
  };
  const regions = config ? config.regions : legacyRegions;
  if (!regions || Object.values(regions).some(r => !r || ![r.x,r.y,r.w,r.h].every(Number.isFinite) || r.x<0 || r.y<0 || r.w<=0 || r.h<=0 || r.x+r.w>width || r.y+r.h>height || typeof r.label!=='string')) return;
  const preview = image.getAttribute('src');
  let loaded = false, loading = false, zoom = 1, region = null, pending = null;
  function fitWidth() { return Math.max(1, Math.min(viewport.clientWidth || 300, (viewport.clientHeight || 420) * width / height)); }
  function maximum() { return Math.max(1, Math.min(5, width / fitWidth())); }
  function announce(message) { status.textContent = message; }
  function updateButtons() {
    for (const button of buttons) {
      const action = button.dataset.documentAction;
      button.disabled = loading || (action === 'in' && zoom >= maximum() - .01) ||
        (action === 'out' && zoom <= 1);
    }
  }
  function render() {
    zoom = Math.max(1, Math.min(maximum(), zoom));
    surface.style.width = Math.round(fitWidth() * zoom) + 'px';
    marker.hidden = !region;
    if (region) {
      marker.style.left = region.x / width * 100 + '%';
      marker.style.top = region.y / height * 100 + '%';
      marker.style.width = region.w / width * 100 + '%';
      marker.style.height = region.h / height * 100 + '%';
    }
    updateButtons();
  }
  function center(target) {
    const displayWidth = fitWidth() * zoom;
    const displayHeight = displayWidth * height / width;
    const x = target ? (target.x + target.w / 2) / width : .5;
    const y = target ? (target.y + target.h / 2) / height : .5;
    viewport.scrollLeft = Math.max(0, x * displayWidth - viewport.clientWidth / 2);
    viewport.scrollTop = Math.max(0, y * displayHeight - viewport.clientHeight / 2);
  }
  function prepare(action) {
    if (loaded) { action(); return; }
    pending = action;
    if (loading) return;
    loading = true;
    announce('Chargement de l’affiche originale. La transcription reste disponible.');
    updateButtons();
    let loadingTimeout;
    const cleanup = () => { clearTimeout(loadingTimeout); image.removeEventListener('load', ready); image.removeEventListener('error', failed); };
    const ready = () => {
      cleanup(); loading = false; loaded = true;
      const action = pending; pending = null;
      render();
      if (action) action();
    };
    const failed = () => {
      cleanup(); loading = false; pending = null; region = null; zoom = 1;
      image.setAttribute('src', preview);
      render();
      announce('L’original n’a pas pu être chargé. L’aperçu, la transcription et les liens restent disponibles. Vous pouvez réessayer.');
    };
    image.addEventListener('load', ready);
    image.addEventListener('error', failed);
    loadingTimeout = setTimeout(failed, 15000);
    image.setAttribute('src', image.dataset.fullSrc);
  }
  function changeZoom(next) {
    region = null;
    zoom = Math.max(1, Math.min(maximum(), next));
    render(); center(null);
    announce('Grossissement de lecture : ' + Math.round(zoom * 100) + ' %. Utilisez les flèches dans l’image pour vous déplacer.');
  }
  for (const button of buttons) button.addEventListener('click', () => {
    if (button.disabled) return;
    const action = button.dataset.documentAction;
    if (action === 'reset') {
      region = null; zoom = 1; render(); viewport.scrollLeft = 0; viewport.scrollTop = 0;
      announce('Vue entière de l’affiche.'); return;
    }
    prepare(() => changeZoom(action === 'open' ? Math.max(2, zoom) : zoom * (action === 'in' ? 1.5 : 1 / 1.5)));
  });
  for (const button of root.querySelectorAll('[data-visual-control]')) button.addEventListener('click', () => {
    const key = button.dataset.visualControl;
    if (!Object.hasOwn(regions, key)) {
      pending = null; region = null; zoom = 1; render();
      viewport.scrollLeft = 0; viewport.scrollTop = 0;
      announce('La limite est un commentaire de THOT, pas une phrase imprimée sur l’affiche. Vue entière.');
      return;
    }
    prepare(() => {
      region = regions[key];
      zoom = Math.min(maximum(), key === 'date' ? maximum() : 2);
      render(); center(region);
      announce(region.label + ' Un contour en pointillés situe le passage.');
      viewport.scrollIntoView?.({ block: 'nearest', behavior: 'instant' });
    });
  });
  viewport.addEventListener('keydown', event => {
    if (event.target !== viewport || event.altKey || event.ctrlKey || event.metaKey) return;
    const moves = { ArrowLeft: [-60, 0], ArrowRight: [60, 0], ArrowUp: [0, -60], ArrowDown: [0, 60] };
    if (!Object.hasOwn(moves, event.key)) return;
    event.preventDefault();
    viewport.scrollLeft = Math.max(0, viewport.scrollLeft + moves[event.key][0]);
    viewport.scrollTop = Math.max(0, viewport.scrollTop + moves[event.key][1]);
  });
  const resize = () => { render(); if (region) center(region); };
  if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(viewport);
  else window.addEventListener('resize', resize);
  render(); controls.hidden = false;
  }
  const roots = [...document.querySelectorAll('[data-document-reader]')];
  const legacy = document.querySelector('#lecture-affiche-laine');
  if (legacy && !roots.includes(legacy)) roots.push(legacy);
  roots.forEach(mount);
})();
