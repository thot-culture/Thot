(() => {
  'use strict';

  const controls = document.querySelector('.comparateur-choix');
  const status = document.querySelector('.comparateur-statut');
  const buttons = [...document.querySelectorAll('[data-cas]')];
  const panels = [...document.querySelectorAll('[data-cas-panel]')];

  if (!controls || !status || !buttons.length || !panels.length) return;

  function afficherCas(id) {
    const button = buttons.find((item) => item.dataset.cas === id);
    const panel = panels.find((item) => item.dataset.casPanel === id);
    if (!button || !panel) return;

    buttons.forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    panels.forEach((item) => {
      item.hidden = item !== panel;
    });
    status.textContent = 'Étude affichée : ' + button.textContent.trim() + '.';
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => afficherCas(button.dataset.cas));
  });

  controls.hidden = false;
  status.hidden = false;
  afficherCas('afghanistan');
})();