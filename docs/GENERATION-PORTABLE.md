# Génération et vérification de THOT sur Linux, macOS et Windows

Les pages HTML et les ressources sont déjà versionnées : GitHub Pages n’a pas besoin de Python pour servir le site.
Les commandes de génération servent à reproduire et vérifier les fichiers.

## Installation

Utiliser Python 3.11 ou ultérieur et Node.js 20 ou ultérieur. Depuis le dossier du dépôt :

```sh
python -m venv .venv
```

Activer l’environnement : `.venv\Scripts\Activate.ps1` sous PowerShell ; `source .venv/bin/activate` sous Linux/macOS.
Installer les dépendances avec `python -m pip install -r requirements-tools.txt`.
Sous un système où l’exécutable Python s’appelle `python3`, utiliser ce nom pour les commandes ci-dessous.

Pillow est fixé à la version utilisée pour cette livraison. Les trois polices DejaVu sont fournies dans
`tools/fonts/dejavu/`, avec leur licence Bitstream Vera et leurs empreintes SHA-256.
Le générateur utilise ces mêmes fichiers sur tous les systèmes, sans rechercher une police système différente.
Le moteur de composition est explicitement `ImageFont.Layout.BASIC` pour ces cartes en français :
Pillow ne choisit plus implicitement RAQM sous Linux et BASIC sous Windows, ce qui changeait les espacements.
Les cinq cartes typographiques ont été régénérées avec ce moteur commun, sans changer leurs titres ni leurs compositions.
Le PNG utilise ensuite un conteneur RGB sans métadonnées variables, un filtre Sub et un profil DEFLATE fixes,
compressés par la bibliothèque zlib standard de Python. Cela évite les variations de l’encodeur Pillow/zlib-ng entre plateformes.
Le contrôle reste strict sur les octets du PNG, en plus des dimensions et des polices ; il n’est pas remplacé par une simple comparaison visuelle.
`--font-directory` permet de sélectionner une copie des mêmes fichiers ; il ne garantit pas des images identiques si les polices diffèrent.
Ne pas remplacer silencieusement une police manquante par Arial ou une autre fonte.

## Générer puis contrôler

```sh
python scripts/generate-social-cards.py --check
python scripts/update-article-editorial.py --check
python scripts/update-reading-times.py --check
python scripts/build-quiz-references.py --check
python scripts/check-editorial.py
python scripts/test-article-editorial.py
python scripts/test-stabilisation.py
python scripts/test-portabilite.py
node scripts/check-site.mjs
node scripts/test-quiz.mjs
git diff --check
```

Pour générer les cartes sociales : exécuter `generate-social-cards.py` sans `--check`.
Pour mettre à jour les données éditoriales : `update-article-editorial.py --write`.
Pour les durées et les références du quiz : exécuter leur script sans `--check`.
Toutes les lectures/écritures textuelles déclarent UTF-8. `portable_io.py` configure également les sorties CLI,
y compris un terminal dont l’encodage par défaut est Windows-1252.
Les originaux d’archives et les images existantes ne sont pas modifiés par ces scripts.

L’ordre de génération n’avance aucune date automatiquement : les dates et les périmètres de révision sont éditoriaux.
Les amendements scientifiques et les dix explications corrigées du quiz sont explicitement consignés dans les manifestes de `docs/`.

## Questions du quiz

`assets/quiz-verification.json` décrit les 300 questions : identifiant stable, statut, date de vérification,
sources, justification et copie de la réponse/explication vérifiée. Les trois statuts initiaux sont
`verified`, `needs_review`, `not_reviewed`. Une date vide ne signifie pas une vérification réussie.

24 questions sont vérifiées dans ce premier lot. Une question sur l’étymologie populaire du café reste à revoir ;
275 autres n’ont pas été examinées sur le fond. Les dix explications décalées ont été corrigées sans modifier
les questions, choix, bonnes réponses, catégories, niveaux, ordre ni clés de progression.

Après une vérification documentaire réelle, mettre à jour le registre puis lancer `build-quiz-references.py`.
Seules les références de statut `verified` sont chargées par le jeu et montrées après la réponse.
Le rendu vérifie aussi que choix, bonne réponse et explication correspondent toujours à la copie vérifiée :
une référence devenue obsolète après modification n’est pas affichée silencieusement.
Les sources proposées pour une question à revoir ne sont pas présentées comme validées aux joueurs.

## Tests visuels facultatifs

```sh
python -m pip install -r requirements-browser.txt
python -m playwright install chromium
python scripts/test-experience-browser.py
python scripts/test-roubaix-document.py --browser
python scripts/test-pieuvres-reperes.py --browser
python scripts/test-puissance-comparaison.py --browser
```

Le navigateur utilise l’exécutable indiqué par `THOT_CHROMIUM_EXECUTABLE`, sinon Chromium du système,
sinon celui installé par Playwright. Les tests utilisent les vrais HTML/CSS/JS incorporés dans des fixtures locales.
Ils ne doivent pas être présentés comme une navigation sur le site public, ni comme un essai sur un téléphone physique.
Les captures sont enregistrées à côté du dépôt ou dans le dossier demandé par `--output`.

## Retrait d’Explorer

Les pages et générateurs autonomes sont retirés de la version publiée. Ne pas les régénérer dans main.
La branche `backup/thot20-complet-20261026-8157d53` permet de retrouver tout THOT 2.0.
Les fichiers de `assets/explorer/` encore présents sont uniquement les dépendances du schéma intégré à l’article sur les pieuvres.
La sauvegarde complète contient les enquêtes, leurs photographies, leurs données et leurs anciens générateurs.

Les essais sous encodage Windows-1252 et depuis un chemin contenant des espaces contrôlent des causes de panne connues.
Le workflow `.github/workflows/verification-portable.yml` exécute les contrôles de génération sur Windows et Ubuntu.
Son résultat doit être consulté pour le commit exact avant de déclarer une vérification native réussie.
`.gitattributes` conserve les fins de ligne LF des sources textuelles sur les deux systèmes ; les images et polices restent binaires.
