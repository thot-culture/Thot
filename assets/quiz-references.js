/* Références documentaires facultatives ; aucune incidence sur la sélection ou les scores. */
(() => {
  'use strict';
  const data = window.THOT_QUIZ_REFERENCE_DATA;
  if (!Array.isArray(data)) return;
  const records = new Map(data.map(record => [record.question, record]));
  window.THOT_QUIZ_REFERENCES = {
    render(target, item) {
      const record = records.get(item.q);
      if (!record || record.status !== 'verified' || !record.verified_on || !record.sources.length) return;
      const snapshot = record.answer_snapshot;
      if (JSON.stringify([item.a, item.correct, item.why]) !== JSON.stringify([snapshot.a, snapshot.correct, snapshot.why])) return;
      const sources = record.sources.filter(source => {
        try { return new URL(source.url).protocol === 'https:' && typeof source.title === 'string'; }
        catch { return false; }
      });
      if (!sources.length) return;
      const box = document.createElement('div');
      box.className = 'quiz-references';
      const title = document.createElement('p');
      title.textContent = 'Références vérifiées le ' + new Date(record.verified_on + 'T12:00:00Z').toLocaleDateString('fr-FR', {timeZone: 'UTC'}) + ' :';
      const list = document.createElement('ul');
      for (const source of sources) {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = source.url;
        link.textContent = source.title;
        li.append(link); list.append(li);
      }
      box.append(title, list); target.append(box);
    }
  };
})();
