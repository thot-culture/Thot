/* THOT · Comportement commun du glossaire interactif. */
(() => {
  'use strict';

  const close = (button) => {
    if (!button) return;
    button.setAttribute('aria-expanded', 'false');
    const definition = document.getElementById(button.getAttribute('aria-controls'));
    if (definition) definition.hidden = true;
  };

  // Sans JavaScript, le HTML laisse les définitions lisibles et les termes inactifs.
  // N’activer un bouton qu’après avoir trouvé la définition qu’il contrôle.
  const activeTerms = new Set();
  document.querySelectorAll('.thot-terme').forEach((button) => {
    const definition = document.getElementById(button.getAttribute('aria-controls'));
    button.setAttribute('aria-expanded', 'false');
    button.disabled = !definition;
    if (!definition) return;
    definition.hidden = true;
    activeTerms.add(button);
  });

  document.addEventListener('click', (event) => {
    const origin = event.target instanceof Element ? event.target : null;
    const button = origin?.closest('.thot-terme') || null;

    document.querySelectorAll('.thot-terme[aria-expanded="true"]').forEach((openButton) => {
      if (openButton !== button) close(openButton);
    });

    if (!button || !activeTerms.has(button)) return;
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    const definition = document.getElementById(button.getAttribute('aria-controls'));
    if (definition) definition.hidden = isOpen;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const button = document.querySelector('.thot-terme[aria-expanded="true"]');
    if (button) {
      close(button);
      button.focus();
    }
  });
})();
