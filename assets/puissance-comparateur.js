(() => {
  'use strict';

  const controls = document.querySelector('.comparateur-choix');
  const status = document.querySelector('.comparateur-statut');
  const buttons = [...document.querySelectorAll('[data-cas]')];
  const panels = [...document.querySelectorAll('[data-cas-panel]')];

  if (!controls || !status || !buttons.length || !panels.length) return;

  const referenceControls = document.querySelector('#comparateur-reference-commandes');
  const referenceButton = document.querySelector('#comparateur-reference');
  const comparison = document.querySelector('#comparateur-simultane');
  const historical = ['afghanistan', 'daech'];
  const table = comparison && comparison.querySelector('table');
  const comparisonReady = referenceControls && referenceButton && table
    && table.querySelector('tbody') && table.querySelector('#comparaison-reference')
    && table.querySelector('#comparaison-cas')
    && historical.every((id) => {
      const panel = panels.find((item) => item.dataset.casPanel === id);
      return panel && panel.dataset.periode && panel.dataset.comparaisonSources
        && panel.querySelectorAll('.comparateur-reperes > div').length === 4;
    });
  let current = 'afghanistan';
  let reference = null;

  const label = (id) => buttons.find((item) => item.dataset.cas === id).textContent.trim();
  const findPanel = (id) => panels.find((item) => item.dataset.casPanel === id);

  function remplirComparaison(id) {
    const table = comparison.querySelector('table');
    const body = table.querySelector('tbody');
    const selected = [reference, id];
    const headers = ['comparaison-reference', 'comparaison-cas'];

    selected.forEach((key, column) => {
      const panel = findPanel(key);
      const heading = table.querySelector('#' + headers[column]);
      const title = document.createElement('span');
      title.textContent = (column === 0 ? 'Référence · ' : 'Cas comparé · ') + label(key);
      const period = document.createElement('small');
      period.textContent = panel.dataset.periode;
      const sources = document.createElement('small');
      panel.dataset.comparaisonSources.split(' ').forEach((target, index) => {
        if (index) sources.append(' · ');
        const link = document.createElement('a');
        link.setAttribute('href', '#' + target);
        link.textContent = 'Source [' + target.slice(3) + ']';
        sources.append(link);
      });
      heading.replaceChildren(title, period, sources);
    });

    const fields = selected.map((key) => [...findPanel(key).querySelectorAll('.comparateur-reperes > div')]);
    const rows = fields[0].map((field, index) => {
      const row = document.createElement('tr');
      row.setAttribute('role', 'row');
      const criterion = document.createElement('th');
      criterion.id = 'comparaison-critere-' + index;
      criterion.setAttribute('scope', 'row');
      criterion.setAttribute('role', 'rowheader');
      criterion.textContent = field.querySelector('dt').textContent;
      row.append(criterion);
      selected.forEach((key, column) => {
        const cell = document.createElement('td');
        cell.setAttribute('role', 'cell');
        cell.setAttribute('headers', criterion.id + ' ' + headers[column]);
        const mobileLabel = document.createElement('span');
        mobileLabel.className = 'comparateur-cellule-cas';
        mobileLabel.setAttribute('aria-hidden', 'true');
        mobileLabel.textContent = (column === 0 ? 'Référence · ' : 'Cas comparé · ') + label(key);
        // Réutiliser les contenus et liens de la fiche, sans nouvelle série de données.
        const content = document.createElement('div');
        for (const node of fields[column][index].querySelector('dd').childNodes) {
          content.append(node.cloneNode(true));
        }
        cell.append(mobileLabel, content);
        row.append(cell);
      });
      return row;
    });
    body.replaceChildren(...rows);
  }

  function afficherCas(id) {
    const button = buttons.find((item) => item.dataset.cas === id);
    const panel = panels.find((item) => item.dataset.casPanel === id);
    if (!button || !panel) return;

    current = id;
    if (!historical.includes(id)) reference = null;
    const paired = Boolean(comparisonReady && reference && reference !== id);
    if (paired) remplirComparaison(id);
    buttons.forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
      item.setAttribute('aria-controls', paired ? 'comparateur-simultane' : 'comparateur-' + item.dataset.cas);
    });
    panels.forEach((item) => {
      item.hidden = paired || item !== panel;
    });
    if (comparisonReady) {
      comparison.hidden = !paired;
      const direct = document.querySelector('#comparateur-direct');
      if (direct) direct.hidden = paired;
      referenceButton.disabled = !historical.includes(id);
      referenceButton.setAttribute('aria-pressed', String(Boolean(reference)));
      referenceButton.textContent = reference ? 'Quitter la comparaison'
        : id === 'iran' ? 'Iran : consultation séparée'
        : 'Garder ' + (id === 'afghanistan' ? 'l’Afghanistan' : label(id)) + ' comme référence';
    }
    status.textContent = paired
      ? 'Référence conservée : ' + label(reference) + '. Cas comparé : ' + label(id) + '. Quatre critères présentés ensemble.'
      : reference ? 'Référence conservée : ' + label(reference) + '. Choisissez ' + label(historical.find((key) => key !== reference)) + ' pour comparer.'
      : 'Étude affichée : ' + label(id) + '.';
  }

  if (comparisonReady) {
    referenceButton.addEventListener('click', () => {
      if (!historical.includes(current)) return;
      reference = reference ? null : current;
      afficherCas(current);
    });
    const direct = document.querySelector('#comparateur-direct');
    if (direct) direct.addEventListener('click', () => { reference = 'afghanistan'; afficherCas('daech'); });
    referenceControls.hidden = false;
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => afficherCas(button.dataset.cas));
  });

  controls.hidden = false;
  status.hidden = false;
  afficherCas('afghanistan');
})();
