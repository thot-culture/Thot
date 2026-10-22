/* THOT · Activation des parcours visuels interactifs. */
(() => {
  'use strict';

  document.querySelectorAll('[data-thot-visual]').forEach((guide) => {
    const controls = guide.querySelector('.thot-visual-controls');
    const buttons = [...guide.querySelectorAll('[data-visual-control]')];
    const panels = [...guide.querySelectorAll('[data-visual-panel]')];
    if (!controls || buttons.length === 0 || panels.length === 0) return;

    const activate = (key) => {
      buttons.forEach((button) => {
        const selected = button.dataset.visualControl === key;
        button.setAttribute('aria-pressed', String(selected));
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.visualPanel !== key;
      });
    };

    const initial = buttons.find((button) => button.getAttribute('aria-pressed') === 'true') || buttons[0];
    activate(initial.dataset.visualControl);
    controls.hidden = false;

    controls.addEventListener('click', (event) => {
      const origin = event.target instanceof Element ? event.target : null;
      const button = origin?.closest('[data-visual-control]');
      if (!button || !controls.contains(button)) return;
      activate(button.dataset.visualControl);
    });
  });
})();
