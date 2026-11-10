# THOT — P1, cartes et couvertures — 10 novembre 2026

Le chantier conserve le site, ses huit articles, leur contenu, leurs références et les interactions. Le socle publié est `6adf4a1669c6750b5076290b74c8b9b6390f724f`, sauvegardé dans `backup/p1-cartes-avant-20261110` et dans le bundle local `/workspace/Thot-avant-P1-20261110.bundle` avant modification.

## Défauts constatés et correction commune

Le navigateur confirme 16:10 pour les cartes de l’accueil, mais 16:9 pour sept cartes de la bibliothèque et 16:10 pour les plantes. À 1440 px, la bibliothèque avait des cadres de 542,5 × 305,16 px, contre 542,5 × 339,06 px pour les plantes. Les marges de l’accueil étaient de 25 px, celles de la bibliothèque de 18/20/14 px ; les titres, résumés et pieds de cartes n’utilisaient pas les mêmes pistes d’alignement. Le titre des sophistes était abrégé dans la notice des cartes. La carte standard Autorité était seule à ajouter la signature après la date.

`assets/decouverte.css` définit maintenant le gabarit standard commun : cadre 16:10, `object-fit:cover` préservant les proportions, marges 18/20/14 px, titres complets, catégories, durées, dates, actions et crédits uniformes. Une sous-grille de sept pistes aligne les éléments de chaque rangée sur ordinateur. Le repli flexible et la colonne unique restent disponibles sur mobile. Les actions peuvent revenir à la ligne. Les règles de survol/focus et les finitions du système visuel THOT sont conservées.

Les surcharges de ratio, de cadrage par nom d’article, de marges et de sous-grille ont été retirées de `assets/bibliotheque.css`, y compris l’exception plantes. Le cadrage éventuel est une donnée de l’image dans le registre, rendue via `--cover-position`, sans sélecteur propre à un article. La une Autorité garde son traitement particulier, sa signature, sa composition et son comportement responsive. Les empreintes de cache des deux feuilles sont actualisées dans les deux pages.

## Décisions sur les huit couvertures

| Article | Décision et motif |
| --- | --- |
| Autorité | Triptyque conservé : famille, manifestation et lycée identifiables. Cadrage standard 50 % / 45 %. Aucun rééchantillonnage de l’image existante. |
| Autrices | Planche de huit portraits remplacée sur les cartes par une évocation illustrée d’une autrice écrivant, d’un livre signé George Sand et d’un feuillet Aurore Dupin. La différence entre identité et nom de plume devient lisible en miniature. Il ne s’agit pas d’un portrait authentique de Sand. Les photographies de Nadar dans l’article sont intactes. |
| Pieuvres | Photo avec plongeur remplacée par une comparaison pédagogique imaginée, pâle sur sable / marbrée sur rochers. Le crédit et l’alternative indiquent explicitement qu’il ne s’agit pas d’une séquence photographique documentaire. |
| États-Unis | Bulldozer remplacé sur les cartes par une composition éditoriale : ressources américaines, obstacles et négociation entre plusieurs acteurs. Le thème général dépasse le seul cas afghan. La photographie authentique reste dans les articles où elle est documentée, avec son crédit d’origine. |
| Roubaix | Carte postale ELD conservée avec son cadre original 1040 × 650 et son crédit « avant 1919 ». Elle n’est pas présentée comme une photographie de 1917. Aucun ajout ni modification du document. |
| Stratégies militaires | Miniature de Homs remplacée sur les cartes par une comparaison illustrée bouclier/lance, canon et drone, avec boussole, approvisionnement et plan. Les périodes et le rôle de la logistique deviennent visibles. Aucun assemblage de documents prétendument issus d’une même source. |
| Sophistes | Scène de débat conservée, créditée comme scène imaginée et illustration originale générée. Le titre exact de l’article remplace l’abréviation de la notice des cartes. |
| Plantes | Illustration botanique conservée, dans le cadre commun 16:10. Entaille, nervures et silhouette restent visibles. |

Les quatre créations partagent une direction de gouache éditoriale sur fond crème, avec bleu nuit, or mat et teintes naturelles. Elles portent chacune leur propre description et un crédit THOT/OpenAI ImageGen. Aucun ancien crédit historique n’a été transféré sur une création. Les documents authentiques et leurs licences restent distincts ; aucune nouvelle licence globale n’est imposée aux contenus THOT. Le registre détaillé est [couvertures.json](couvertures.json).

## Données, fichiers et poids

`assets/article-editorial.json` reste la référence des cartes : titres, catégories, descriptions, images, dimensions, alternatives, crédits, dates et sélection d’accueil. `assets/reading-times.json` reste la référence des durées ; les URL sont dérivées des slugs par le générateur. Dates et durées n’ont pas changé. Les données scientifiques du registre restent intactes. Le mot-clé Nadar reste recherchable puisque ses photographies sont conservées dans l’article.

`scripts/sync-publication.py` rend les variantes `srcset`/`sizes`, les dimensions explicites, le chargement différé et le cadrage de la notice ; il vérifie les fichiers locaux, leurs dimensions, leurs proportions et les positions de cadrage. Deux nouveaux tests couvrent ce contrat, y compris les variantes absentes et les données invalides.

Fichiers modifiés : `assets/article-editorial.json`, `assets/decouverte.css`, `assets/bibliotheque.css`, `index.html`, `bibliotheque.html`, `scripts/sync-publication.py`, `scripts/test-publication.py`, `GUIDE-IMAGES.md`. Ajouts : `scripts/test-p1-cartes-browser.py`, ce dossier de rapport/captures/mesures et huit WebP dans `assets/images/` :

- `autrices-nom-de-plume.webp` et `autrices-nom-de-plume-640.webp` ;
- `pieuvre-camouflage.webp` et `pieuvre-camouflage-640.webp` ;
- `puissance-ressources-resultats.webp` et `puissance-ressources-resultats-640.webp` ;
- `strategies-epoques-logistique.webp` et `strategies-epoques-logistique-640.webp`.

Les créations natives ont été produites en 1586 × 992, puis réduites proportionnellement en 1280 × 801 et 640 × 400, avec arrondis au pixel. Les huit couvertures pesaient ensemble 1 088 684 octets. Avec les variantes standard, elles totalisent 783 216 octets (−28,1 %) ; avec les nouvelles grandes variantes, 1 091 710 octets (+0,28 %), pour une résolution plus élevée que plusieurs images remplacées. Aucun script ni dépendance de production n’est ajouté. Les captures dans `docs/` ne sont pas chargées par l’accueil ou la bibliothèque.

Aucun fichier dans `articles/`, aucun média documentaire existant, aucune référence scientifique, aucun JSON-LD d’article, aucun sitemap ni aucune durée n’est modifié. Les cartes Open Graph, conçues séparément, restent intactes.

## Captures et recette réelle

Les captures avant proviennent du site GitHub Pages publié ; les captures après de l’aperçu HTTP fidèle sous `/Thot/`, avec les images finales. Les PNG intégraux et captures individuelles restent dans `work/p1/`. Les copies WebP ci-dessous conservent les dimensions des captures navigateur. Les fichiers `avant/mesures.json` et `apres/mesures.json` donnent les cadres, positions, styles calculés, images effectivement choisies, dates, crédits et résultats des interactions.

| Largeur | Accueil avant / après | Bibliothèque avant / après |
| --- | --- | --- |
| 320 | [Avant](avant/accueil-320.webp) · [Après](apres/accueil-320.webp) | [Avant](avant/bibliotheque-320.webp) · [Après](apres/bibliotheque-320.webp) |
| 390 | [Avant](avant/accueil-390.webp) · [Après](apres/accueil-390.webp) | [Avant](avant/bibliotheque-390.webp) · [Après](apres/bibliotheque-390.webp) |
| 768 | [Avant](avant/accueil-768.webp) · [Après](apres/accueil-768.webp) | [Avant](avant/bibliotheque-768.webp) · [Après](apres/bibliotheque-768.webp) |
| 1024 | [Avant](avant/accueil-1024.webp) · [Après](apres/accueil-1024.webp) | [Avant](avant/bibliotheque-1024.webp) · [Après](apres/bibliotheque-1024.webp) |
| 1440 | [Avant](avant/accueil-1440.webp) · [Après](apres/accueil-1440.webp) | [Avant](avant/bibliotheque-1440.webp) · [Après](apres/bibliotheque-1440.webp) |

Comparatifs côte à côte, avant à gauche : [mobile](comparatif-bibliotheque-390.webp) · [bureau](comparatif-bibliotheque-1440.webp).

Le script P1 vérifie dix rendus avec JS, dix sans JS, la colonne mobile, les huit cartes de bibliothèque, les sept cartes standard de l’accueil et sa une, les cadres 16:10, les alignements par rangée, l’absence de titre tronqué et de débordement, les titres exacts, images chargées, crédits, dates, durées, cinq catégories, recherche positive/négative, huit liens et H1 de destination, survol et focus clavier. Il vérifie aussi le choix des grandes variantes à DPR 2 en 390/1440 px. Résultat local : **PASS** dans Chromium 151.0.7922.34.

La recette existante `test-site-browser.cjs` passe sur les vingt pages aux cinq largeurs, avec navigation, clavier, Atlas, onze documents Aral, persistance et repli sans JS : [résultats](non-regression.json). `test-publication-integration.py --browser` passe pour deux publications successives en copie temporaire : [résultats](publication-integration.json). Le contrôle de conservation depuis la sauvegarde confirme que les contenus et références des articles sont intacts.

## Publication et limites

La publication passe par une branche de travail et une PR vers `main`, sans écraser l’historique ni toucher à la PR existante #28. GitHub Pages utilise la procédure existante : racine de `main`, build Pages automatique. Les **42/42 commandes** de `node scripts/validate.mjs` passent après le commit de production, sans modification des contrôles d’empreinte : [journal local complet](validation-locale.log). La nouvelle recette P1 rejoint aussi le workflow navigateur existant. Les résultats GitHub Actions et la recette sur le site déployé sont vérifiés à la livraison dans les liens de PR et de déploiement.

Les contrôles mobiles utilisent Chromium avec viewport et densité simulés, pas un téléphone physique. Aucun lecteur d’écran réel ni Safari n’a été utilisé. Les créations sont des illustrations éditoriales, pas des preuves documentaires. Aucun problème bloquant n’a été relevé par la recette P1 locale.
