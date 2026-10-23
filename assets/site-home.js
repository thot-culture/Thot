(() => {
  'use strict';
  const menu = document.getElementById('mobile-menu-button');
  const nav = document.getElementById('primary-navigation');
  if (menu && nav) {
    const header = menu.closest('.top');
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

  // Une image absente ne doit pas laisser une carte vide ou une icône cassée.
  document.querySelectorAll('.discovery-photo img').forEach(img => {
    const showFallback = () => {
      const photo = img.closest('.discovery-photo');
      if (!photo || photo.classList.contains('is-unavailable')) return;
      img.hidden = true;
      photo.classList.add('is-unavailable');
      const fallback = document.createElement('span');
      fallback.className = 'home-image-fallback';
      fallback.textContent = 'Image indisponible — lire l’article';
      fallback.setAttribute('role', 'img');
      fallback.setAttribute('aria-label', 'Image indisponible. ' + img.alt);
      photo.append(fallback);
    };
    img.addEventListener('error', showFallback, { once: true });
    if (img.complete && img.naturalWidth === 0) showFallback();
  });
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
