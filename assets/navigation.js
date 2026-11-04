/* Menu commun installé avant le contenu ; liens visibles sans JavaScript. */
(() => {
  'use strict';
  const menu = document.getElementById('mobile-menu-button');
  const nav = document.getElementById('primary-navigation');
  if (menu && nav) {
    const header = menu.closest('header') || menu.closest('.top');
    const mobile = window.matchMedia('(max-width: 710px)');
    const close = (restoreFocus = false) => {
      nav.classList.remove('is-open');
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Ouvrir le menu');
      if (restoreFocus) menu.focus();
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('is-open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => close()));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') close(true);
    });
    document.addEventListener('click', event => {
      if (header && !header.contains(event.target)) close();
    });
    if (header) {
      header.addEventListener('focusout', event => {
        if (event.relatedTarget && !header.contains(event.relatedTarget)) close();
      });
    }
    const syncViewport = () => close(mobile.matches && nav.contains(document.activeElement));
    if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', syncViewport);
    else if (typeof mobile.addListener === 'function') mobile.addListener(syncViewport);
    close();
    // Replier la navigation uniquement après l’installation de ses interactions.
    if (header) header.setAttribute('data-menu-ready', '');
  }

})();
