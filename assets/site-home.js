(() => {
  'use strict';
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
