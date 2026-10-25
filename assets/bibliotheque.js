/* THOT — Recherche et filtres propres à la bibliothèque. */
(() => {
  'use strict';
  const searchZone = document.getElementById('library-search');
  const search = document.getElementById('article-search');
  if (!searchZone || !search) return;
  const cards = [...document.querySelectorAll('.article-card')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const status = document.getElementById('results-status');
  const empty = document.getElementById('empty-state');
  const clear = document.getElementById('clear-search');
  const normalize = value => value.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr')
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  // Indexer une seule fois le contenu utile, sans les libellés d’action communs.
  const records = cards.map(card => ({
    card,
    category: card.dataset.category,
    text: normalize([
      card.dataset.category || '',
      card.dataset.keywords || '',
      card.querySelector('h3')?.textContent || '',
      card.querySelector('.discovery-meta')?.textContent || '',
      card.querySelector('.discovery-card__copy > p')?.textContent || '',
      card.querySelector('.discovery-credit')?.textContent || '',
      card.querySelector('.discovery-card__bottom > span')?.textContent || ''
    ].join(' '))
  }));
  let category = 'tous';
  const categories = new Set(filters.map(button => button.dataset.filter));
  let pendingURLWrite;

  function currentURL() {
    try {
      const url = new URL(window.location.href);
      return ['get', 'set', 'delete'].every(method => typeof url.searchParams?.[method] === 'function') ? url : null;
    }
    catch { return null; }
  }
  function cancelURLWrite() {
    if (pendingURLWrite !== undefined) clearTimeout(pendingURLWrite);
    pendingURLWrite = undefined;
  }
  function restoreURL(preserveSearch = false) {
    const url = currentURL();
    if (!url) return;
    const query = url.searchParams.get('q');
    if (query !== null || !preserveSearch) search.value = query ?? '';
    const subject = url.searchParams.get('sujet');
    category = categories.has(subject) && records.some(record => record.category === subject) ? subject : 'tous';
  }
  function writeURL() {
    cancelURLWrite();
    const url = currentURL();
    if (!url) return;
    if (search.value) url.searchParams.set('q', search.value);
    else url.searchParams.delete('q');
    if (category !== 'tous') url.searchParams.set('sujet', category);
    else url.searchParams.delete('sujet');
    // La recherche reste utilisable si le navigateur refuse l'accès à l'historique.
    try {
      const history = window.history;
      if (url.href !== window.location.href && typeof history?.replaceState === 'function') {
        history.replaceState(history.state, '', url.href);
      }
    } catch { /* L'URL partageable est facultative, les résultats restent à jour. */ }
  }
  function flushURLWrite() {
    if (pendingURLWrite !== undefined) writeURL();
  }

  function update() {
    const terms = normalize(search.value).split(' ').filter(Boolean);
    let count = 0;
    for (const record of records) {
      const visible = (category === 'tous' || record.category === category)
        && terms.every(term => record.text.includes(term));
      record.card.hidden = !visible;
      if (visible) count++;
    }
    const message = count === 0 ? 'Aucun article trouvé'
      : count + ' article' + (count > 1 ? 's' : '') + ' trouvé' + (count > 1 ? 's' : '');
    if (status.textContent !== message) status.textContent = message;
    empty.classList.toggle('hidden', count !== 0);
    clear.hidden = search.value.length === 0;
    for (const button of filters) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === category));
    }
  }
  search.addEventListener('input', () => {
    update();
    cancelURLWrite();
    pendingURLWrite = setTimeout(writeURL, 250);
  });
  search.addEventListener('change', flushURLWrite);
  for (const button of filters) {
    button.addEventListener('click', () => {
      category = button.dataset.filter; update(); writeURL();
    });
  }
  clear.addEventListener('click', () => {
    search.value = ''; update(); writeURL(); search.focus();
  });
  document.getElementById('reset-filters').addEventListener('click', () => {
    category = 'tous'; search.value = ''; update(); writeURL(); search.focus();
  });
  window.addEventListener('popstate', () => {
    cancelURLWrite(); restoreURL(); update();
  });
  window.addEventListener('pagehide', flushURLWrite);
  // Le retour arrière peut restaurer une valeur du champ sans événement input.
  window.addEventListener('pageshow', update);
  document.getElementById('article-total').textContent = String(cards.length);
  restoreURL(true);
  update();
  searchZone.hidden = false;

  cards.forEach(card => {
    const img = card.querySelector('.discovery-photo img');
    if (!img) return;
    const showFallback = () => {
      const photo = img.closest('.discovery-photo');
      if (!photo || photo.classList.contains('is-unavailable')) return;
      img.hidden = true;
      photo.classList.add('is-unavailable');
      const fallback = document.createElement('span');
      fallback.className = 'library-image-fallback';
      fallback.textContent = 'Image indisponible — lire l’article';
      fallback.setAttribute('role', 'img');
      fallback.setAttribute('aria-label', 'Image indisponible. ' + img.alt);
      photo.append(fallback);
    };
    img.addEventListener('error', showFallback, { once: true });
    if (img.complete && img.naturalWidth === 0) showFallback();
  });
})();
