/* THOT — Partage progressif des articles à partir de leur lien canonique. */
(() => {
  'use strict';

  const blocks = [...document.querySelectorAll('[data-article-share]')];
  if (!blocks.length) return;
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (!canonical || typeof location === 'undefined' || typeof navigator === 'undefined') return;

  let url;
  try {
    url = new URL(canonical);
    if (url.protocol !== 'https:' || url.origin !== location.origin ||
        !url.pathname.startsWith('/Thot/') || url.username || url.password) return;
    url.search = '';
    url.hash = '';
  } catch {
    return;
  }
  const permanentURL = url.href;
  const title = document.querySelector('h1')?.textContent.trim() || document.title;

  for (const block of blocks) {
    const link = block.querySelector('[data-share-link]');
    const actions = block.querySelector('[data-share-actions]');
    const native = block.querySelector('[data-share-native]');
    const copy = block.querySelector('[data-share-copy]');
    const status = block.querySelector('[data-share-status]');
    if (!link || !actions || !copy || !status) continue;
    let busy = false;
    let manual;
    const setBusy = value => {
      busy = value;
      copy.disabled = value;
      if (native) native.disabled = value;
    };
    const manualCopy = () => {
      if (!manual) {
        manual = document.createElement('input');
        manual.type = 'text';
        manual.readOnly = true;
        manual.className = 'article-share__manual';
        manual.setAttribute('aria-label', 'Lien permanent à copier');
        block.insertBefore(manual, status);
      }
      manual.value = permanentURL;
      manual.hidden = false;
      status.textContent = 'Copie automatique indisponible. Copiez le lien sélectionné avec la commande Copier de votre appareil.';
      manual.focus();
      manual.select();
    };

    link.href = permanentURL;
    copy.addEventListener('click', async () => {
      if (busy) return;
      setBusy(true);
      status.textContent = '';
      try {
        if (typeof navigator.clipboard?.writeText !== 'function') {
          manualCopy();
          return;
        }
        await navigator.clipboard.writeText(permanentURL);
        if (manual) manual.hidden = true;
        status.textContent = 'Lien copié.';
      } catch {
        manualCopy();
      } finally {
        setBusy(false);
      }
    });

    if (native && typeof navigator.share === 'function') {
      native.addEventListener('click', async () => {
        if (busy) return;
        setBusy(true);
        status.textContent = '';
        try {
          await navigator.share({ title, url: permanentURL });
        } catch (error) {
          if (error?.name !== 'AbortError') {
            status.textContent = 'Le partage n’a pas abouti. Vous pouvez copier le lien.';
          }
        } finally {
          setBusy(false);
        }
      });
      native.hidden = false;
    }
    // Les boutons conservent leur activation clavier native ; aucun focus à l’initialisation.
    actions.hidden = false;
  }
})();
