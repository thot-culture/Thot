/* Menu commun ; tous les liens restent visibles sans JavaScript. */
(() => {
  'use strict';
  const menu = document.getElementById('mobile-menu-button');
  const nav = document.getElementById('primary-navigation');
  if (!menu || !nav) return;
  const header = menu.closest('header');
  const mobile = matchMedia('(max-width: 710px)');
  const close = (focus = false) => {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Ouvrir le menu');
    if (focus) menu.focus();
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') close(true); });
  document.addEventListener('click', event => { if (!header.contains(event.target)) close(); });
  header.addEventListener('focusout', event => { if (event.relatedTarget && !header.contains(event.relatedTarget)) close(); });
  mobile.addEventListener('change', () => close(mobile.matches && nav.contains(document.activeElement)));
  header.setAttribute('data-menu-ready', '');
})();
