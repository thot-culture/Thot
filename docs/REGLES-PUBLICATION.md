# THOT — Règles de publication convenues

L’utilisateur a explicitement autorisé la publication de l’ensemble des
améliorations de l’audit des dix pages et de la passe navigation/lecture.

Pour les interventions suivantes, il autorise les corrections courantes et leur
publication après les tests nécessaires. **Avant toute modification importante,
demander son accord sur le périmètre proposé.** Cette règle ne demande pas une
nouvelle validation pour la publication déjà autorisée de la version auditée.

Préserver les textes, faits historiques, sources, crédits et fonctionnalités.
Travailler sur une branche et conserver une sauvegarde du commit publié avant
mise à jour. Ne pas écraser de changements concurrents : vérifier le SHA de
`main` au moment de l’intégration.

Avant publication : contrôleurs locaux, neuf suites de tests, comparaison
éditoriale et contrôle du diff. Après publication : attendre le succès du run
GitHub Pages associé au commit, puis vérifier les dix pages et leurs ressources
avec `scripts/check-published.py`. Signaler les tests visuels non réalisés sans
présenter un test de DOM simulé comme un contrôle dans un navigateur.

Une mise à jour Git seule ne confirme pas un déploiement. Le rapport final doit
indiquer le commit, la branche, l’URL publique, la sauvegarde, les vérifications
effectuées et les limites restantes.
