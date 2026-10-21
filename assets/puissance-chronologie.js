(() => {
  'use strict';

  const root = document.querySelector('.chronologie-afghanistan');
  if (!root) return;

  const controls = root.querySelector('.chronologie-commandes');
  const status = root.querySelector('.chronologie-statut');
  const fallback = root.querySelector('.chronologie-repli');
  const buttons = [...root.querySelectorAll('[data-etape]')];
  const panels = [...root.querySelectorAll('[data-etape-panel]')];

  if (!controls || !status || !fallback || !buttons.length || !panels.length) return;

  function afficherEtape(id) {
    const button = buttons.find((item) => item.dataset.etape === id);
    const panel = panels.find((item) => item.dataset.etapePanel === id);
    if (!button || !panel) return;

    buttons.forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    panels.forEach((item) => {
      item.hidden = item !== panel;
    });

    status.textContent = 'Étape affichée : ' + button.dataset.titre + '.';
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => afficherEtape(button.dataset.etape));
  });

  afficherEtape(buttons[0].dataset.etape);
  fallback.hidden = true;
  controls.hidden = false;
  status.hidden = false;
})();
