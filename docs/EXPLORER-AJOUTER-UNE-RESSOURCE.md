# Ajouter une ressource Explorer

Explorer est un catalogue statique compatible avec GitHub Pages sous `/Thot/`.
Il fonctionne sans compte, sans service d’évaluation et sans bibliothèque JavaScript externe.
Les pages générées restent lisibles sans JavaScript ; les commandes inactives sont masquées.

## Vérifier le projet éditorial avant de développer

Définir ce que l’interaction permet de comprendre et ce qu’elle ne permet pas d’établir.
Vérifier les documents originaux, leurs notices, les conditions de reproduction et les références.
Une notice consultée ne signifie pas que le document entier a été examiné.
Ne pas publier de carte, de coordonnées ou de données supposées pour remplir le catalogue.
Identifier explicitement les cas fictifs, schémas qualitatifs et incertitudes.
Prévoir une lecture continue des informations essentielles et des crédits.

## Déclarer les données

Ajouter une entrée dans `assets/explorer/catalogue.json`, tableau `resources` :

```json
{
  "id": "identifiant-stable",
  "title": "Titre de la ressource",
  "description": "Ce que le visiteur pourra examiner ou comprendre.",
  "discipline": "Histoire",
  "collection": "archives",
  "category": "Document authentique",
  "period": "1917",
  "url": "explorer/archives/identifiant-stable.html",
  "icon": "archive",
  "article": "articles/roubaix-1917.html",
  "references": [{"label": "Notice originale", "url": "https://adresse-reelle-verifiee.example/"}],
  "date_published": "AAAA-MM-JJ",
  "date_modified": null,
  "thumbnail": "assets/explorer/vignette-archive.svg",
  "share_image": "assets/explorer/partage-identifiant-stable.png",
  "available": true
}
```

Cet exemple contient une URL et une date de remplacement : les remplacer par des valeurs vérifiées.
Les collections sont `atlas`, `chronologies`, `archives`, `defis`.
`article` et `period` peuvent être des chaînes vides. Ne déclarer disponibles que des pages terminées.
Les disciplines et catégories alimentent automatiquement les filtres.
Les dessins des vignettes sont contemporains et ne représentent pas des documents historiques.

## Réutiliser les composants

| Type | Données et rendu | Comportement |
|---|---|---|
| Catalogue | `catalogue.json`, `build-explorer.py` | `catalogue.js` : recherche, filtres, URL partageable, résultat vide |
| Chronologie | Pour Roubaix, extraction des huit événements de `assets/roubaix-frise.js` vers `roubaix-evenements.json` et HTML continu | `timeline.js` : sélection native, flèches, Début/Fin, source de chaque événement |
| Archive | HTML sémantique, transcription, notice de droits, configuration JSON | `assets/roubaix-document.js` : chargement de l’original à la demande, zoom, repères, déplacement au clavier, récupération après échec |
| Illustration | `structures-peau.json`, fonction `skin()` de `explorer-components.py` | `illustrations.js` : sélection des explications et visibilité des groupes SVG |
| Anagrammes | `anagrammes.json`, repli HTML avec définitions et sources | `anagrammes.js` : mélange, indice, vérification, explication, nouveau mot |
| Enquête | `assets/enquetes/dossiers.json`, `build-enquetes.py` | Voir `ENQUETES-AJOUTER-UN-DOSSIER.md` |

Les fichiers du tableau sans préfixe se trouvent dans `assets/explorer/`, les générateurs dans `scripts/`.
Le dossier Atlas présente des mentions documentaires : **aucun moteur cartographique ni fond historique n’est livré dans cette version**.
Le futur moteur devra être choisi après vérification des données et des droits, avec alternative textuelle.

Pour un lecteur documentaire supplémentaire, utiliser une racine `data-document-reader` et des descendants
`data-document-part="viewport|surface|image|marker|controls|status"`.
Les anciens identifiants `laine-*` sont conservés pour l’article existant.
Les quatre boutons portent `data-document-action="open|in|out|reset"`.
L’image possède un aperçu dans `src` et l’original intact dans `data-full-src`.
Un script local `type="application/json" data-document-config` fournit :

```json
{"width":1238,"height":1685,"regions":{"date":{"x":700,"y":1517,"w":392,"h":48,"label":"Date imprimée"}}}
```

Les coordonnées sont en pixels de l’original et doivent être relues dessus. Cet exemple appartient à l’affiche de Roubaix : ne pas le reprendre pour une autre image.
Les boutons annotés utilisent `data-visual-control` avec la clé de la région ; conserver une transcription distincte du calque.
Les dimensions et bornes sont validées ; une configuration invalide laisse la version statique accessible.
Les styles du lecteur sont dans `assets/roubaix-document.css`.

Les sources bibliographiques sont extraites des articles par `refs()` ; leur numérotation originale est conservée,
y compris dans un sous-ensemble. Les notices indisponibles restent signalées.
Le comparateur autonome réutilise seulement les deux fiches historiques Afghanistan/Daech ; la fiche Iran reste dans l’article, hors comparaison directe.
Le schéma du chromatophore réutilise le SVG et son contrôleur existants, sans recalcul anatomique ni animation supplémentaire.

## Produire les pages

Ajouter un rendu pour le nouvel identifiant dans `outputs()` de `scripts/build-explorer.py`.
Le wrapper commun `resource()` produit navigation, date, provenance, canonical, Open Graph et données structurées `LearningResource`.
Le générateur crée les images de partage typographiques originales en 1200 × 630, avec Pillow et DejaVu Sans.
Ne pas modifier à la main les sorties générées.

```sh
python3 scripts/build-explorer.py
python3 scripts/build-enquetes.py
python3 scripts/build-explorer.py --check
python3 scripts/build-enquetes.py --check
```

Ajouter l’URL dans `sitemap.xml`. Ajouter des tests utiles à `scripts/test-explorer.py`.
Ce test vérifie actuellement le lot initial de dix ressources et huit mots : actualiser ces tailles explicitement après validation d’un nouveau lot,
sans supprimer les assertions de conservation des originaux, événements et banques du quiz.

## Recette et publication

```sh
python3 scripts/test-explorer.py
python3 scripts/test-explorer.py --browser
node scripts/check-site.mjs
python3 scripts/check-editorial.py
python3 scripts/test-article-editorial.py
python3 scripts/update-article-editorial.py --check
python3 scripts/update-reading-times.py --check
git diff --check
python3 scripts/preview.py
```

L’aperçu est `http://127.0.0.1:8765/Thot/explorer.html`.
Le test navigateur utilise Chromium réel sur des fixtures locales : CSS, scripts et médias du dépôt incorporés.
Ce n’est pas une navigation publique et cela ne vérifie pas un lecteur d’écran réel.
Tester les parcours, erreurs et replis aux quatre largeurs 320, 390, 768 et 1440 px ; regarder les captures produites.
Pour un composant partagé modifié, relancer également ses anciennes suites et les tests du quiz.

Avant publication, sauvegarder la version publique, vérifier les changements concurrents, les droits, le diff et les tests.
Après publication, attendre le déploiement du commit exact puis exécuter `scripts/check-published.py` :
il découvre les pages du dépôt et vérifie HTTP, types MIME, empreintes des fichiers et ancres internes.
Ne pas confondre un push accepté avec un déploiement terminé.

Les objectifs de deux articles par semaine et d’une ressource complémentaire sont une cadence éditoriale souhaitée,
pas une tâche automatique de publication. Une nouvelle ressource exige toujours une vérification scientifique.
