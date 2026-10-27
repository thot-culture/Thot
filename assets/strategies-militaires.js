'use strict';
// Amélioration progressive : tous les textes sont déjà disponibles dans le HTML.
document.querySelectorAll('[data-sm-module]').forEach(module => {
  const controls = module.querySelector(':scope > .sm-controls');
  if (!controls) return;
  const buttons = [...controls.querySelectorAll('[data-sm-select]')];
  const panels = [...module.querySelectorAll(':scope > .sm-panels > [data-sm-panel]')];
  const select = index => {
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
  };
  buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
  controls.hidden = false;
  select(0);
});
