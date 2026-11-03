# Cohérence visuelle THOT — 3 novembre 2026

Périmètre demandé : vérifier puis harmoniser le visuel de tout le site.
Base : `86ee7cbb27172262eca3648afe51cb7d2a81eab8` (`main`).
Branche : `work/harmonie-visuelle-20261103`. Livraison préparée pour revue ; aucune modification de `main` ni publication GitHub Pages pendant cette intervention.

## Constats et priorités

| Élément | État initial observé dans le navigateur | Correction |
| --- | --- | --- |
| Marque | Ibis sur l’accueil et le quiz, étoile dans la bibliothèque, texte seul ailleurs. Corps de 27 à 34 px, lettres blanches ou dorées. | Même ibis, même nom blanc, même accent doré ; 30 px sur ordinateur, 27 px sur mobile. |
| Navigation | Bandeaux de 76 à 89 px ; Explorer clair, autres pages bleu nuit ; liens de graisse 400, 650 ou 750. | Barre principale commune, bleu nuit, largeur de 1160 px au maximum, liens de 14 px et graisse 650, état actif doré et souligné. Les retours contextuels des articles restent dans une ligne secondaire. |
| Pieds de page | Clairs sur les pages d’information, sombres sur les articles, fond transparent dans Explorer. | Même fond bleu nuit, texte clair, liens dorés, tailles et espacements communs ; liens d’information sur une ligne séparée. |
| Cartes | Rayons et ombres différents entre catalogue, accueil et méthode. | Finition commune : fond papier, bordure douce, rayon de 16 px et ombre légère. Espacement entre les sections des pages d’information. |
| Actions de lecture | Gabarits et couleurs différents entre découverte, recherche et Explorer. | Boutons éditoriaux de 48 px minimum, rayon de 10 px, police commune et accent bleu nuit. |
| Lisibilité | Crédits de cartes à 10 ou 10,5 px sur certaines pages. | Crédits à 12 px, en conservant intégralement notices et liens de droits. |

La police d’interface est commune. Les titres conservent la famille Georgia et la hiérarchie adaptée à chaque parcours. Les grandes cartes, documents et outils gardent leur place : leur largeur et leurs couleurs portent aussi des informations utiles.

Autre point repéré, hors de cette passe visuelle : l’accueil présente encore Autorité comme « Dernière publication », alors que l’article sur les stratégies militaires a été publié le 27 octobre. Ce libellé et la sélection de l’accueil méritent une passe éditoriale distincte.

## Mise en œuvre et conservation

- `assets/visual-system.css` centralise les règles communes avec des variables `--thot-*`, sans modifier les couleurs de données ou les états de réponse des jeux.
- `scripts/site_chrome.py` produit le même logo sur les 18 pages et charge la feuille commune en dernier, avec une empreinte de contenu. Le générateur Explorer utilise déjà ce normaliseur : une reconstruction conserve donc l’harmonisation.
- Les marqueurs des en-têtes et pieds de page ciblent la coque du site. Le pied de page interne de l’outil Aral reste distinct.
- `scripts/check-home.mjs` résout désormais les feuilles `/Thot/assets/...` depuis l’URL canonique ; le contrôle fonctionne aussi sur Windows, où l’ancien calcul cherchait `C:\Thot\assets`.
- Le HTML complet du contenu principal (`<main>…</main>`) et les données structurées sont identiques à la base sur les 18 pages. Aucun fichier JavaScript d’activité, corpus, source, crédit ou média n’est modifié.

## Vérifications réalisées

Dans le navigateur réel :

- 18 pages × 4 largeurs (1440, 768, 390 et 320 px), soit 72 contrôles : feuille commune chargée, couleurs de l’en-tête et du pied de page, police de marque et de navigation, visibilité du menu, absence de débordement horizontal.
- 18 menus mobiles : ouverture, visibilité des liens, fermeture par Échap et restitution du focus au bouton.
- Captures des 18 pages comparées visuellement ; contrôle supplémentaire du pied de page et du focus sur la page Méthode et dans Explorer.
- Recherche « Roubaix » : un article trouvé. Démarrage du quiz et retour d’une réponse : fonctionnement confirmé.

Contrôles locaux réussis :

```text
node scripts/check-site.mjs
node scripts/check-home.mjs
python scripts/site_chrome.py --check
python scripts/build-explorer-reconstruction.py --check
python scripts/test-portabilite.py
git diff --check
```

Le contrôle global valide 18 pages, 891 liens et ressources internes, 33 scripts, 17 blocs JSON-LD et 300 questions. Le contrôle de portabilité valide les cartes sociales, les durées de lecture, les données éditoriales et les références générées.

Les neuf suites existantes suivantes passent : `test-home.mjs`, `test-bibliotheque.mjs`, `test-quiz.mjs`, `test-quiz-autrices.mjs`, `test-article-components.mjs`, `test-article-activities.mjs`, `test-article-timelines.mjs`, `test-article-share.mjs` et `test-article-navigation.mjs`. Ces suites utilisent un DOM simulé ; les vérifications navigateur ci-dessus sont distinctes.

Le contrôleur éditorial historique `check-editorial.py` échoue avec le gabarit actuel : il exclut `site-parcours` du côté « après » seulement. Sur le fichier de départ `quiz-autrices.html` comparé à lui-même, ses listes comptent 368 et 362 mots. Il n’est donc pas présenté comme réussi. La conservation de cette intervention a été contrôlée directement en comparant, pour les 18 pages, le HTML principal intégral et les données structurées au commit de base : identiques.

Limites : pas de mesure Lighthouse ou Core Web Vitals, pas de lecteur d’écran réel ni de contrôle de disponibilité des images et liens externes. La livraison est une proposition sur branche ; aucun déploiement de cette version n’est revendiqué.
