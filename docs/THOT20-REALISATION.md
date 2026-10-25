# THOT 2.0 — Réalisation et périmètre du 25 octobre 2026

Mission autorisée par le cahier des charges « THOT 2.0 — Développement complet, espace Explorer et publication » fourni le 25 octobre 2026.
Cette autorisation couvre développement, corrections scientifiques documentées, intégration et publication des fonctionnalités fiables.

## Base et préservation

Base publique : `52bb04c66da3ff1de56b8a9192f28d50f7d22883`.
Branche de réalisation : `work/thot-2-0-explorer`.
Les trois enquêtes déjà réalisées ont d’abord été conservées dans le commit `836a25d731d828304f1e101c306f878632ecfba4`.
Sauvegarde locale avant THOT 2.0 : branche `backup/avant-thot20-20261025-52bb04c` et archive `/workspace/THOT20/thot-public-52bb04c.zip`.
Les branches historiques importées sans ancêtre commun ont été inventoriées ; aucun fichier absent de main n’y a été trouvé.
Elles restent conservées sans fusion automatique de versions anciennes.

Les banques des 300 questions, le moteur du quiz, sa progression, les originaux documentaires,
les huit événements historiques et les trois anciennes fiches géopolitiques restent protégés par les tests.
Les anciens chemins et identifiants restent valides.

## Corrections scientifiques précisément autorisées

Le manifeste `CORRECTIONS-SCIENTIFIQUES-THOT20.json` contient huit substitutions exactes : ancien HTML, nouveau HTML, motif et références.
Les contrôleurs comparent l’intégralité des contenus après ces seules substitutions ; chaque ancien fragment doit être retrouvé exactement une fois.
Les sources, liens, images, crédits et notices restent comparés. Les blocs d’interface exclus du contrôle sont nommément identifiés.

- **Puissance** : définitions séparées des quatre dimensions de souveraineté de Krasner, avec article original de 2001 accessible ; nuances historiographiques existantes préservées.
- **Autorité** : Burger s’arrête à 150 volts simulés, après la demande d’arrêt à ce niveau ; les manifestations antérieures de malaise ne sont pas supprimées du raisonnement.
  Cadre juridique limité aux EPLE publics : R.421-8 et R.421-5 ; distinction avec les établissements relevant de D.422-5.
- **Autrices** : publication de *Northanger Abbey* et *Persuasion* en décembre 1817, malgré 1818 sur les pages de titre, avec musée et édition scientifique.
- **Pieuvres** : complément fonctionnel sur absorption, reflet sélectif et diffusion ; différences entre espèces et limites qualitatives explicites.

Les dates de révision du 25 octobre 2026 décrivent ces seuls périmètres ; elles ne prétendent pas à une nouvelle vérification intégrale des articles.

## Dix ressources indépendantes

| Ressource | Chemin |
|---|---|
| Affiche sur la laine de 1917 | `explorer/archives/roubaix-laine-1917.html` |
| Roubaix, huit événements | `explorer/chronologies/roubaix-1914-1918.html` |
| Roubaix, des adresses aux preuves — sans carte | `explorer/atlas/roubaix-lieux-documentes.html` |
| Anagrammes, huit mots / cinq disciplines | `explorer/defis/anagrammes.html` |
| Pigments, reflets et lumière | `explorer/sciences/couleurs-cephalopodes.html` |
| Manipulation du chromatophore | `explorer/sciences/chromatophore.html` |
| Comparer deux cas historiques | `explorer/geopolitique/comparer-puissance.html` |
| Neuf sur dix… de qui ? | `enquetes/lumo.html` |
| La hausse spectaculaire | `enquetes/hausse.html` |
| Une image, deux histoires | `enquetes/image.html` |

`explorer.html` propose nouveautés, quatre collections, recherche, filtres combinables et dix cartes illustrées.
Les liens article/ressource sont réciproques lorsque pertinents ; aucune lecture préalable n’est nécessaire.
Sans JavaScript, les pièces, explications, sources et solutions restent lisibles et les commandes inactives sont masquées.
Les nouveaux jeux n’utilisent aucun stockage et ne touchent pas la progression du quiz.

## Provenance et limites

- Affiche authentique du 30 octobre 1917 : Landesarchiv Baden-Württemberg, Hauptstaatsarchiv Stuttgart, J 151 Nr 1451, CC BY 4.0.
  Original intact, aperçu allégé, attribution et licence conservés. Manifeste : `DOCUMENT-ROUBAIX-LAINE.json`.
- Earthrise : NASA, William Anders, Apollo 8, 24 décembre 1968. Original intact ; seul le cadrage d’affichage est réversible.
  Conditions de réutilisation NASA vérifiées, attribution et absence d’approbation NASA explicites. Manifeste : `ENQUETES-PHOTO-SOURCE.json`.
  La légende problématique est créée pour l’exercice et présentée comme telle, sans inventer une vraie rumeur.
- Schémas SVG et cartes typographiques de partage : créations THOT, qualitatives, sans valeur documentaire historique.
- Définitions des huit mots : paraphrases vérifiées du Dictionnaire de l’Académie française et du glossaire Inserm ; sources accessibles mot par mot.
- Fond ancien de Roubaix et comparaison actuelle : **reportés**. Le fonds signalé par le CCFr est une piste, pas une image réutilisable vérifiée.
  Aucune carte reconstruite, aucun point GPS, aucune concordance de parcelle actuelle n’est inventé.

## Architecture et tests

Voir `EXPLORER-AJOUTER-UNE-RESSOURCE.md` pour les données, générateurs et composants.
Le lecteur documentaire partagé conserve sa compatibilité avec l’article et accepte des configurations validées pour d’autres scans.
Les frises, anagrammes et schémas séparent données, rendu statique et comportement JavaScript.
Un moteur cartographique n’est pas livré sans données vérifiées.

Recettes de cette intervention conservées hors site dans `/workspace/THOT20/tests/` :
24 commandes de contrôle statique/régression ; Chromium réel sur fixtures à quatre largeurs pour onze pages Explorer,
plus parcours complets des enquêtes, du lecteur historique, du schéma existant et du comparateur existant.
Recherche, vide, indices, erreurs, révision, clavier, replis sans JavaScript, panne d’image et absence de débordement/erreur JavaScript vérifiés.
Les captures mobile/ordinateur sont effectivement produites et examinées.

La navigation réseau de Chromium échoue dans cet environnement (`ERR_ABORTED`), même vers l’aperçu local.
Les vérifications HTTP sont donc distinctes des interactions sur fixtures.
Le zoom navigateur à 200 %, Safari/iOS/Firefox, un vrai téléphone et un lecteur d’écran réel restent à vérifier.
Le test optionnel limitant historiquement toute modification aux cinq articles est inapplicable au périmètre global autorisé et signalé comme ignoré ;
les sept autres tests de ce contrôleur et les comparaisons éditoriales complètes restent actifs.

Le rapport de publication final, après confirmation effective du déploiement, doit donner le commit, le run GitHub Pages,
les contrôles publics et leurs éventuelles limites. Ce document décrit la réalisation ; il ne constitue pas une confirmation de déploiement.
