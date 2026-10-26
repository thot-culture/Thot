# THOT Explorer — guide de reconstruction et de maintenance

Version locale du 26 octobre 2026. Base stabilisée : `0aa6d452be6e5b1add58aa5cc54ee3d88fb307fa`.
Branche : `work/explorer-aral-rome-20261026`. Aucune publication autorisée pour ce chantier.

## Prévisualiser

Depuis la racine du dépôt, avec Python 3 :

```sh
python scripts/preview.py --port 8767
```

Ouvrir `http://127.0.0.1:8767/Thot/explorer.html`.

- Enquête : `http://127.0.0.1:8767/Thot/explorer/enquetes/mer-aral.html`
- Atlas : `http://127.0.0.1:8767/Thot/explorer/atlas/rome-expansion.html`

Le serveur conserve le préfixe GitHub Pages `/Thot/`. Ouvrir directement les fichiers HTML avec `file://` ne reproduit pas ces chemins. Il n’y a aucun outil de déploiement dans ces commandes.

## Architecture

| Élément | Rôle |
| --- | --- |
| `explorer.html` | Accueil de deux expériences, sans rubrique vide |
| `explorer/enquetes/mer-aral.html` | Bureau d’enquête et alternative documentaire |
| `explorer/atlas/rome-expansion.html` | Atlas et bibliothèque documentaire |
| `assets/explorer-v2/common.css` | Navigation, identité et fondations accessibles |
| `assets/explorer-v2/aral.js`, `aral.css` | État du dossier, manipulation, relations, critères et rendu |
| `assets/explorer-v2/atlas.js`, `atlas.css` | Navigation cartographique, chapitres, comparaison et notices |
| `assets/explorer-v2/data/` | Corpus, données et géométries distincts de la présentation |
| `assets/explorer-v2/media/` | Images documentaires, versions optimisées et originaux Aral |
| `assets/explorer-v2/sources/` | Crédits, droits, empreintes, versions et archives géographiques |
| `scripts/explorer_aral_view.py`, `explorer_atlas_view.py` | Générateurs HTML progressifs |
| `scripts/build-explorer-reconstruction.py` | Assemble les trois pages statiques |
| `scripts/build-explorer-corpus.py` | Préparation éditoriale initiale des notices et graphiques |
| `scripts/prepare-explorer-geography.py` | Traitement des géométries, sans frontières inventées |
| `scripts/prepare-explorer-media.py` | Optimisation des originaux et registre des empreintes |
| `scripts/audit-explorer-sources.py` | Trace des sources effectivement téléchargées et consultées |

Aucune bibliothèque JS, police distante, API d’évaluation ou dépendance réseau n’est nécessaire au fonctionnement des interactions. Les liens vers les institutions servent à approfondir. Une image indisponible conserve sa notice et son lien source.

Les pages HTML sont des sorties générées. Après une modification des vues, du corpus JSON ou des données cartographiques :

```sh
python scripts/build-explorer-reconstruction.py
python scripts/build-explorer-reconstruction.py --check
```

Pour refaire la préparation initiale des textes/graphiques, modifier `scripts/build-explorer-corpus.py`, puis exécuter ce script avant l’assemblage. Il remplace les deux fichiers de corpus JSON : ne pas l’exécuter après une édition manuelle des JSON sans y reporter les modifications. Les JSON restent les entrées de l’assembleur ; ne pas éditer uniquement le HTML généré.

## Ajouter un document à une enquête

1. Vérifier le document original, sa date, sa provenance et ses droits. Conserver l’URL exacte et une empreinte du fichier réellement consulté.
2. Ajouter une notice avec un identifiant stable : `id`, `title`, `nature`, `date`, `author`, `source`, `description`, `shows`, `limits`, `credit`, `license`. Ajouter `license_url` pour une licence ou des conditions explicites.
3. Une image locale utilise `media: {src, alt}`. `visual_html` contient seulement du HTML/SVG rédigé et relu dans le dépôt : aucun contenu fourni par un visiteur n’y est injecté.
4. Relier les preuves aux mécanismes avec les tags documentés (`observation`, `evolution`, `hydrology`, `irrigation`, `climate`, `consequences`, `restoration`). Un tag ne constitue pas une validation automatique d’un raisonnement.
5. Mettre à jour le registre des droits et la recette. Vérifier le document dans la modale et dans l’alternative sans JavaScript.

Une nouvelle enquête doit avoir sa propre clé de stockage et sa version de schéma. Celle d’Aral est `thot.explorer.aral.v1`. Les clés et les règles du quiz n’ont pas été modifiées.

## Principes du bilan d’Aral

Le moteur examine l’hypothèse choisie, les pièces ajoutées, leurs rôles explicites et les relations. Il distingue une observation d’un mécanisme causal, une cause principale d’un facteur aggravant, une conséquence d’une preuve de la cause, et le Nord du Sud. Une restauration locale ne réfute pas le rôle historique des prélèvements ; un assèchement local ne prouve pas la disparition de toute la mer.

Le texte libre est affiché et conservé, mais son sens n’est pas analysé automatiquement. Une hypothèse libre ne reçoit pas de verdict sémantique simulé. Aucun pourcentage de réussite, classement, profil psychologique ou service d’IA n’est utilisé. Consulter un document ne le sélectionne pas automatiquement comme preuve.

Pour un autre sujet, créer ses critères éditoriaux et ses tests avant de réutiliser le moteur. Ne pas appliquer les tags Aral à un corpus sans rapport.

## Cartographie et licences

Huit états : vers 400, 300, 200, 100, 60 et 1 **av.** J.-C., puis 100 et 117 **apr.** J.-C. Aucun état de 264, 27 ou 44 av. J.-C. n’est simulé avec ces données.

- Historical Basemaps, A. Ourednik et contributeurs, commit `da7a4b735ecef70aebdc9c73e409d8a2500d50f3` : **GPL v3**, et non CC BY-SA. États 400/300/200/100/1 av. J.-C. et 100 apr. J.-C. Les dépendances signalées par la base sont distinctes des territoires romains directs.
- Ancient World Mapping Center, commit `7ecf8bccea2efe1e1e9df2daf6001942de73fb87` : **ODbL 1.0**. États 60 av. J.-C. et 117 apr. J.-C. Les fragments de la base ont été réunis en une emprise ; ils ne sont pas présentés comme des provinces.
- Natural Earth, commit `ca96624a56bd078437bca8184e78163e5039ad19` : domaine public, fond moderne généralisé. Il ne restitue pas le littoral antique.
- Cinq lieux Pleiades : coordonnées représentatives sous CC BY 3.0, contributeurs conservés dans `pleiades-places.json`. Leur couche est un index transchronologique, pas une preuve d’existence ou d’intégration à Rome à chaque date.

Les deux bases historiques et leurs dérivés sont distribués séparément avec leurs licences. Les archives contiennent les géométries originales et le script de préparation. Projection équirectangulaire, cadre [-15°, 18°, 55°, 60°], simplification topologique de 0,035°. Les SVG sont des produits cartographiques ; aucun ratio de superficie n’en est tiré.

Les sources diffèrent en généralisation et en couverture. Le modèle AWMC de 117 n’est pas présenté comme une emprise exhaustive des occupations orientales éphémères de Trajan. Ne pas convertir un changement de contour entre les deux bases en conquête certaine. Les découpages provinciaux, voies et champs de bataille ne sont pas inventés pour remplir des couches.

Pour reconstruire la géographie : installer `requirements-explorer-build.txt`, extraire les trois archives de `assets/explorer-v2/sources/` dans un même répertoire, puis :

```sh
python scripts/prepare-explorer-geography.py --sources CHEMIN_DES_SOURCES
python scripts/build-explorer-reconstruction.py
```

Les archives sont des téléchargements documentaires facultatifs ; elles ne sont pas chargées par le moteur de la carte.

## Tests

```sh
node scripts/check-site.mjs
python scripts/test-explorer-reconstruction.py
python scripts/test-stabilisation.py
python scripts/test-portabilite.py
```

Après installation de `requirements-browser.txt` et d’un Chromium utilisable :

```sh
python scripts/test-explorer-reconstruction.py --browser --out DOSSIER_CAPTURES
```

Avec le serveur local lancé :

```sh
python scripts/test-explorer-http.py --origin http://127.0.0.1:8767
```

La recette de reconstruction compare aussi tous les fichiers préexistants au socle stabilisé. Seules les insertions du lien Explorer dans `index.html` / `bibliotheque.html`, les trois entrées du sitemap et l’actualisation ciblée du test de retrait sont autorisées. Aucun article, source, date, crédit, banque ou moteur de quiz n’a été modifié.

Les fixtures Chromium incorporent les mêmes HTML/CSS/JS et médias locaux pour contourner l’absence de navigation HTTP dans le navigateur de cet environnement. Elles ne sont pas des captures du site public. Le refus natif du stockage est exercé ; les écritures et la reprise sont testées avec un stockage explicitement simulé dans deux pages neuves. La reprise après rechargement HTTP natif, Safari/iOS, Firefox, un téléphone physique et un lecteur d’écran restent à vérifier.

## Périmètre Git et publication

Aucun composant de l’ancien Explorer sauvegardé n’a été restauré. Seule l’ancienne URL d’accueil `explorer.html` accueille une page entièrement nouvelle ; les onze autres anciennes pages restent absentes et renvoient 404 dans l’aperçu local. Les protections scientifiques et les 300 questions sont conservées.

Le manifeste `EXPLORER-RECONSTRUCTION.json` décrit cette autorisation locale précise. Aucun workflow, paramètre Pages ou branche publique n’a été modifié. Une future publication doit être demandée explicitement et suivie d’une vérification du déploiement ; la réussite locale n’en tient pas lieu.
