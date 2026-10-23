/* THOT — Sommaire mobile partagé par les cinq articles. */
(() => {
  'use strict';
  const sommaire = document.querySelector('.sommaire-details');
  if (!sommaire) return;
  const mobile = window.matchMedia('(max-width: 850px)');
  const syncViewport = () => {
    if (mobile.matches && sommaire.contains(document.activeElement)) {
      sommaire.querySelector('summary')?.focus();
    }
    sommaire.open = !mobile.matches;
  };
  syncViewport();
  if (typeof mobile.addEventListener === 'function') {
    mobile.addEventListener('change', syncViewport);
  } else if (typeof mobile.addListener === 'function') {
    mobile.addListener(syncViewport);
  }
  sommaire.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (event) => {
      if (!mobile.matches || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
      let id;
      try { id = decodeURIComponent(link.getAttribute('href').slice(1)); }
      catch { return; }
      const target = document.getElementById(id);
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      // Déplacer le focus avant de masquer le lien ; l’ancre conserve son défilement natif.
      target.focus({preventScroll: true});
      sommaire.open = false;
    });
  });
})();
