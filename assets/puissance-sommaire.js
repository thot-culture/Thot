/* THOT — Sommaire mobile repliable de l'article de géopolitique. */
(() => {
  'use strict';
  const sommaire = document.querySelector('.article-geopolitique .sommaire-details');
  if (!sommaire) return;
  const mobile = window.matchMedia('(max-width: 850px)');
  const syncViewport = () => { sommaire.open = !mobile.matches; };
  syncViewport();
  if (typeof mobile.addEventListener === 'function') {
    mobile.addEventListener('change', syncViewport);
  } else if (typeof mobile.addListener === 'function') {
    mobile.addListener(syncViewport);
  }
  sommaire.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      if (mobile.matches) sommaire.open = false;
    });
  });
})();
