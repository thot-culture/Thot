/* Les articles présents dans la page constituent le catalogue de la découverte surprise. */
(() => {
  'use strict';
  const current = new URL(window.location.href).pathname;
  const paths = [...new Set([...document.querySelectorAll('a[data-discovery-path]')]
    .map(link => new URL(link.getAttribute('href'), document.baseURI))
    .filter(url => url.origin === window.location.origin && url.pathname !== current)
    .map(url => url.pathname))];
  if (!paths.length) return;
  for (const link of document.querySelectorAll('[data-surprise]')) {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      let previous;
      try { previous = sessionStorage.getItem('thot-last-discovery'); } catch { /* La découverte fonctionne aussi sans stockage local. */ }
      const alternatives = paths.filter(path => path !== previous);
      const pool = alternatives.length ? alternatives : paths;
      const next = pool[Math.floor(Math.random() * pool.length)];
      try { sessionStorage.setItem('thot-last-discovery', next); } catch { /* Aucun stockage nécessaire à la navigation. */ }
      window.location.assign(next);
    });
  }
})();
