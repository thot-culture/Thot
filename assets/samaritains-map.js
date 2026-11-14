/* THOT — Géographie actuelle. Leaflet local, tuiles OSM, aucune donnée du jeu. */
(() => {
  'use strict';
  const root = document.querySelector('[data-gerizim-map]');
  if (!root) return;
  const canvas = root.querySelector('[data-map-canvas]');
  const message = root.querySelector('[data-map-status]');
  const reset = root.querySelector('[data-map-reset]');
  const places = [...root.querySelectorAll('[data-place]')];
  const scriptURL = new URL('vendor/leaflet/leaflet.js', document.currentScript.src);
  let started = false;
  function initialize() {
    const L = window.L;
    if (!L) throw new Error('Leaflet indisponible');
    canvas.hidden = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const map = L.map(canvas, { scrollWheelZoom: false, zoomControl: false, minZoom: 10, maxZoom: 18, inertia: !reduced,
      fadeAnimation: !reduced, zoomAnimation: !reduced, markerZoomAnimation: !reduced });
    const zoom = L.control.zoom({ zoomInTitle: 'Zoom avant', zoomOutTitle: 'Zoom arrière' }).addTo(map);
    zoom.getContainer().querySelectorAll('a').forEach((a, i) => a.setAttribute('aria-label', i ? 'Zoom arrière' : 'Zoom avant'));
    const bounds = L.latLngBounds(places.map(p => [Number(p.dataset.lat), Number(p.dataset.lon)]));
    const home = () => map.fitBounds(bounds, { paddingTopLeft: [70, 60], paddingBottomRight: [40, 40], maxZoom: 14, animate: false });
    home();
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, noWrap: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    let goodTiles = 0;
    let failedTiles = 0;
    function status() {
      message.textContent = failedTiles ? (goodTiles
        ? 'Certaines tuiles sont indisponibles. Les trois lieux restent consultables ci-dessous.'
        : 'Le fond de carte est indisponible. Consulte les trois lieux dans la liste ci-dessous.')
        : 'Carte centrée sur les environs du mont Garizim. Les trois lieux sont aussi décrits ci-dessous.';
    }
    tiles.on('loading', () => { goodTiles = 0; failedTiles = 0; });
    tiles.on('tileload', () => { goodTiles++; });
    tiles.on('tileerror', () => { failedTiles++; });
    tiles.on('load', status);
    tiles.addTo(map);
    places.forEach((place, i) => {
      const title = place.querySelector('summary').textContent;
      const text = place.querySelector('p').textContent;
      const icon = L.divIcon({ className: `gerizim-marker${i === 0 ? ' gerizim-marker-main' : ''}`,
        html: `<span aria-hidden="true">${i === 0 ? '▲' : '●'}</span>`, iconSize: i === 0 ? [46, 46] : [36, 36], iconAnchor: i === 0 ? [23, 23] : [18, 18] });
      const marker = L.marker([Number(place.dataset.lat), Number(place.dataset.lon)], { icon, keyboard: true, title, alt: title, riseOnHover: true, autoPanOnFocus: false }).addTo(map);
      const content = document.createElement('div');
      const heading = document.createElement('h4'); heading.textContent = title;
      const paragraph = document.createElement('p'); paragraph.textContent = text;
      content.append(heading, paragraph);
      marker.bindPopup(content, { maxWidth: 260, minWidth: 150, autoPan: true, keepInView: true, autoPanPadding: [12, 12] });
      const markerElement = marker.getElement();
      markerElement.setAttribute('role', 'button');
      markerElement.setAttribute('aria-label', `Découvrir : ${title}`);
      markerElement.setAttribute('aria-expanded', 'false');
      markerElement.addEventListener('keydown', event => {
        if (event.key === ' ') { event.preventDefault(); marker.openPopup(); }
      });
      marker.on('popupopen', event => {
        markerElement.setAttribute('aria-expanded', 'true');
        const popup = event.popup.getElement();
        popup.setAttribute('role', 'region'); popup.setAttribute('aria-label', title);
        const close = popup.querySelector('.leaflet-popup-close-button');
        close.setAttribute('aria-label', 'Fermer la fiche');
        close.setAttribute('title', 'Fermer la fiche');
        close.focus({ preventScroll: true });
      });
      marker.on('popupclose', () => {
        markerElement.setAttribute('aria-expanded', 'false');
        markerElement.focus({ preventScroll: true });
      });
    });
    canvas.addEventListener('keydown', event => { if (event.key === 'Escape') map.closePopup(); });
    reset.addEventListener('click', () => { map.closePopup(); home(); reset.focus({ preventScroll: true }); });
    reset.hidden = false;
    status();
    if ('ResizeObserver' in window) new ResizeObserver(() => { map.invalidateSize({ pan: false }); home(); }).observe(canvas);
    root.dataset.mapReady = 'true';
  }
  function start() {
    if (started) return;
    started = true;
    message.textContent = 'Chargement de la carte… Les descriptions restent disponibles ci-dessous.';
    const script = document.createElement('script');
    script.src = scriptURL.href;
    script.onload = () => { try { initialize(); } catch { fallback(); } };
    script.onerror = fallback;
    document.head.append(script);
  }
  function fallback() {
    canvas.hidden = true; reset.hidden = true;
    message.textContent = 'La carte ne peut pas se charger. Consulte les lieux et leurs liens OpenStreetMap ci-dessous.';
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); start(); }
    }, { rootMargin: '350px' });
    observer.observe(root);
  } else start();
})();
