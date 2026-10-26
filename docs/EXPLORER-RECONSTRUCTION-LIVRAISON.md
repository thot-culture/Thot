# THOT — COMPTE RENDU DE RECONSTRUCTION D’EXPLORER POUR CHATGPT

Livraison locale du 26 octobre 2026. **Aucune publication, aucun push, aucune intégration à `main`.**

## État du dépôt et périmètre

- Base stabilisée : `0aa6d452be6e5b1add58aa5cc54ee3d88fb307fa`.
- Branche dédiée : `work/explorer-aral-rome-20261026`.
- Premier commit : `89c325cc8a64e74d28b1b272cbef3e2e49d923fe`, corpus et géométries.
- Commit des interfaces et de la recette : consulter `git log -2 --oneline` sur cette branche ; le hash final est aussi fourni dans le message de livraison et le dossier d’artefacts.
- Le `main` local et le `main` distant contrôlé par `git ls-remote` restent à la base stabilisée.
- Sauvegarde initiale : `../THOT-EXPLORER-RECONSTRUCTION-20261026/base-stabilisee-0aa6d45.zip`.
- Aucun code de l’ancien Explorer n’a été restauré depuis la branche de sauvegarde. Les dépendances conservées par la stabilisation ne sont pas modifiées.

## Consulter le résultat

```sh
python scripts/preview.py --port 8767
```

Ouvrir `http://127.0.0.1:8767/Thot/explorer.html`. Ce lien désigne l’aperçu de cet environnement local, **pas le site public**.

| Page | Chemin | État |
| --- | --- | --- |
| Accueil Explorer | `explorer.html` | Réalisée et testée localement |
| Le mystère de la mer d’Aral | `explorer/enquetes/mer-aral.html` | Réalisée et testée localement |
| L’expansion de Rome | `explorer/atlas/rome-expansion.html` | Réalisée et testée localement |

## Direction visuelle et architecture

Papier clair, encre marine, vert sarcelle et accents terre cuite ; titres de magazine et commandes lisibles. Le dossier Aral privilégie la photographie documentaire et un plateau de preuves. L’Atlas privilégie la carte, avec ses notices refermables. Le bureau s’adapte en trois vues sur téléphone, sans exiger le glisser-déposer.

Les données, sources, droits, géométries, vues HTML et contrôleurs JS sont séparés. Aucun framework, service payant, compte, API d’évaluation ou police distante n’a été ajouté. Les médias romains sont optimisés en WebP, à moins de 200 ko chacun. Les archives géographiques sont facultatives et ne sont pas téléchargées par le moteur de carte.

Le guide `EXPLORER-RECONSTRUCTION-GUIDE.md` décrit l’assemblage, l’ajout de documents, les critères du bilan, les licences et la recette.

## COMPTE RENDU POUR CHATGPT — THOT : accueil Explorer

**Création :** une véritable porte d’entrée, avec les deux expériences indépendantes, photographie sourcée d’Aral, carte issue du modèle AWMC, durées indicatives et actions actives. Aucun catalogue fictif ou bouton vers un contenu absent.

**Corrections pendant la recette :** crédit photographique placé hors du sujet, image documentaire entièrement disponible dans le dossier, vérification des liens et des compositions mobiles.

**Fichiers :** `explorer.html`, `assets/explorer-v2/common.css`, générateur commun. Insertion du seul lien Explorer dans les navigations existantes d’`index.html` et `bibliotheque.html` ; leur contenu éditorial est intact. Trois URL nouvelles ajoutées au sitemap sans modifier les dix entrées existantes.

**Tests :** capture et contrôle de débordement à 390/768/1024/1440 px ; liens locaux, titres, canonique et ressources ; conservation du contenu des pages d’intégration après retrait des liens ajoutés.

## COMPTE RENDU POUR CHATGPT — THOT : enquête Aral

**Fonctionnement livré :** ouverture des dix pièces dans l’ordre choisi ; photographie/image satellite agrandissable ; notices et limites ; ajout et retrait de pièces ; positions manipulables à la souris et au clavier ; rangement ; zoom du plateau ; création, modification et suppression de quatre types de relations ; rôles explicites des preuves ; hypothèses proposées ou libres ; texte de conclusion ; indices uniquement à la demande ; bilan et révision ; sauvegarde automatique propre au dossier ; confirmation avant réinitialisation.

**Corpus :**

| Pièce | Nature et provenance |
| --- | --- |
| D01 | Photographie de Moynaq, Sebastian Kluger, 20 mars 2011, CC BY-SA 3.0 ; original local intact |
| D02 | NASA/MODIS Terra, 25 août 2000 ; fichier de la série World of Change |
| D03 | NASA/MODIS Terra, 19 août 2014 ; fichier de la même série |
| D04 | Carte originale THOT de deux fleuves à partir des coordonnées Natural Earth, domaine public ; bilan hydrologique documenté dans Conrad/Kobildjanova |
| D05 | Graphique original et tableau des superficies totales, 1960/1971/1976/1989/2009 ; Conrad/Kobildjanova 2011, tableau 1 p. 6, d’après Micklin 2010 |
| D06 | Graphique original et tableau de prélèvements pour irrigation, 1960–2004 ; SIC ICWC |
| D07 | Fiche de lecture sur l’agriculture irriguée et le coton ; Conrad/Kobildjanova et SIC ICWC |
| D08 | Fiche de lecture sur sécheresses et fluctuations ; NASA |
| D09 | Fiche de lecture des conséquences des poussières ; PNUD, 7 mai 2025 |
| D10 | Fiche de lecture de la restauration partielle du Nord ; Banque mondiale, octobre 2008, recoupée avec NASA |

Les fiches de lecture et graphiques sont identifiés comme productions THOT, pas comme des fac-similés. Les rapports tiers ne sont pas reproduits intégralement. Les nombres ne sont pas interpolés ; prélèvement, consommation, débit arrivant au lac et superficie irriguée ne sont pas confondus. La série ne prétend pas décrire l’état en 2026.

**Sources principales réellement consultées :** NASA World of Change ; Conrad et Kobildjanova, *The Economics of an Environmental Disaster: The Aral Sea* (PDF Cornell, 2011) ; tableau *Basic indicators of water and land use in the Aral Sea basin* du SIC ICWC ; communiqué PNUD du 7 mai 2025 ; Banque mondiale, *Feature Stories* n° 23 (2008). URLs, dates, droits et empreintes dans `assets/explorer-v2/sources/aral-sources.json` et dans la page.

**Bilan :** critères explicites sur les familles de preuves, leur rôle et les relations choisies. Une photo ne prouve pas la cause ; une sécheresse peut aggraver les prélèvements ; la restauration du Nord n’invalide pas leur rôle historique ; la mer n’a pas intégralement et définitivement disparu. Le texte libre n’est pas analysé sémantiquement par une prétendue IA. Aucune note ni mesure de la personne.

**Défauts corrigés pendant le développement :** exception dans le bouton d’entrée ; activation responsive du bureau ; contrôles accessibles de déplacement/retrait ; traitement d’un dossier JSON corrompu ; avertissement si écriture refusée ; retour plus précis lorsqu’une preuve est utilisée dans un rôle contestable ; aperçus documentaires dans la liste.

**Fichiers :** page Aral, `aral.js`, `aral.css`, `data/aral.json`, `data/aral-rivers.svg`, médias Aral, registres et vue `scripts/explorer_aral_view.py`.

**Tests exécutés :** dix ouvertures/ajouts, zoom d’image et retour à l’image entière, déplacement réel à la souris et au clavier, alternatives par commandes, relations modifiées et supprimées, indices, preuves et rôles, hypothèse étayée, conclusions excessives, preuves manquantes, révision, suppression et réinitialisation, aux quatre largeurs. Refus natif du stockage ; erreur de quota simulée ; reprise dans une page neuve avec un stockage simulé : positions, relations, rôles, hypothèse, indice, texte et état du bilan conservés. Une clé sentinelle du quiz reste intacte. Image volontairement invalide : notice/source maintenues.

**Limite de test :** le navigateur de cet environnement bloque les navigations HTTP/fichier. La reprise après un véritable rechargement HTTP avec stockage natif n’a donc pas été vérifiée ; ne pas la présenter comme un test réalisé.

## COMPTE RENDU POUR CHATGPT — THOT : Atlas de Rome

**Fonctionnement livré :** exploration libre ; six chapitres et leurs étapes disponibles ; huit états datés ; zoom, déplacement et alternatives clavier ; sélection par carte ou liste ; fiches refermables et retour de focus ; couches selon disponibilité ; comparaison géographiquement alignée de deux états avec curseur clavier ; quatre personnages ; trois monnaies ; bibliothèque documentaire et références.

**Cartographie :** six états Historical Basemaps (400/300/200/100/1 av. J.-C., 100 apr. J.-C.) et deux états AWMC (60 av. J.-C., 117 apr. J.-C.). Contours très généralisés, sources et versions identifiées, aucune interpolation annuelle. Les dépendances renseignées dans la base sont différenciées. Les fragments AWMC ne deviennent pas des provinces inventées. Le fond Natural Earth est moderne, non un littoral antique reconstitué. Les cinq points Pleiades forment un index transchronologique ; leur présence ou leur position près d’un contour ne permet pas de déduire le contrôle politique local.

**Limites scientifiques affichées :** les bases ne se superposent pas exactement ; leurs écarts ne représentent pas tous une conquête. L’état AWMC de 117 ne détaille pas toutes les occupations orientales éphémères de Trajan. Aucun calcul de superficie ou statut local n’en est déduit. Il n’existe ici ni état exact de 264/44/27 av. J.-C., ni couches de voies, de batailles ou de provinces complètes. Les six chapitres explicitent les sauts de dates, la République, le régime impérial, les violences, les tensions et les populations concernées.

**Sources et droits :**

- Historical Basemaps, A. Ourednik et contributeurs : GPL v3 ; géométries, dérivé et licence disponibles séparément.
- Ancient World Mapping Center : ODbL 1.0 ; source, dérivé et licence séparés, pas de fausse licence CC BY-SA.
- Natural Earth : domaine public ; Pleiades : CC BY 3.0, auteurs et coordonnées conservés.
- Récit : The Met, *The Roman Republic*, *The Roman Empire*, chronologie *Western North Africa, 1000 B.C.–1 A.D.*.
- Hannibal : sculpture moderne de Slodtz (1704), photographie/extraction créditée Alain08 et Jastrow, CC BY-SA 3.0 ; pas un portrait antique.
- César : portrait antique dit de Tusculum, photographie Ángel M. Felicísimo, CC BY 2.0.
- Auguste de Prima Porta : photographie Justin Benttinen, CC BY-SA 4.0.
- Trajan, Glyptothèque inv. 336 : photographie Bibi Saint-Pol, domaine public.
- Trois monnaies Met : objets 248033, 248037, 248042, images Open Access/CC0, notices et datations vérifiées. L’API Met était inaccessible (410) : les notices HTML et leurs images primaires identifiées par IIIF ont servi à la vérification. Ne pas prétendre à une vérification réussie par l’API.

Les originaux ont été téléchargés et leurs empreintes conservées avant optimisation. Les crédits expliquent les changements de format. Les pièces sont rattachées à des lieux avec des précautions explicites : le denier de César émis en Afrique n’est pas présenté comme une découverte faite à Carthage ; l’atelier Rome/Brundisium du denier d’Octavien reste incertain.

**Défauts corrigés pendant le développement :** masquage effectif des groupes SVG ; séparation complète des moitiés du comparateur ; conservation de l’alignement après zoom ; sélection après geste de pointage ; images contenues dans leurs cadres ; limitation des commandes aux couches disponibles ; passage en libre pour une date extérieure au chapitre.

**Fichiers :** page Atlas, `atlas.js`, `atlas.css`, corpus et géographie Rome, médias, registres et archives, vue `scripts/explorer_atlas_view.py`, scripts de préparation.

**Tests exécutés :** huit états, six chapitres, étapes avant/arrière, modes libre/guidé, zoom/déplacement, clavier, sélection par lieu et territoire, ouverture/fermeture et focus, couches dont dépendances disponibles, comparaison 0/50/100 %, portraits et trois monnaies, modales/Échap, absence d’image, sans JavaScript, aux quatre largeurs. Captures réellement produites puis examinées.

## Non-régression et résultats de recette

- 20 commandes de contrôles statiques/DOM : les onze suites `test-*.mjs`, `check-site.mjs`, `check-home.mjs`, tests éditoriaux, repères pieuvres, comparateur, document Roubaix, stabilisation, portabilité et conservation Explorer : réussies.
- Suite éditoriale : huit tests, sept réussis, un contrôle optionnel ignoré faute de paramètre `--head`. La conservation stricte du socle par la nouvelle recette et `check-editorial.py` passent séparément.
- `test-stabilisation-browser.py` : références après réponse, garde contre les références périmées, défi quotidien complet, interactions scientifiques et 404 aux quatre largeurs : réussi.
- `test-experience-browser.py` : 44 vues des onze pages préexistantes, recherche/réinitialisation, quiz complet, clavier et alternatives sans JS : réussi.
- `test-explorer-reconstruction.py --browser` : trois pages aux largeurs 390/768/1024/1440, scénarios détaillés ci-dessus, zéro erreur JavaScript et zéro débordement dans les fixtures normales : réussi.
- `test-explorer-http.py` sur l’aperçu local : quatorze pages et 93 URL/ressources accessibles sous `/Thot/` ; onze anciennes pages toujours en 404 : réussi.
- Portabilité : UTF-8, chemins avec espaces, contrôles depuis un autre répertoire, polices et PNG existants reproductibles sur cette machine Linux : réussi. Aucune exécution Windows nouvelle ni CI distante n’est revendiquée.

Les fichiers préexistants sont comparés au commit stabilisé. Quatre fichiers seulement changent : deux navigations, le sitemap et la partie retrait de `test-stabilisation.py`. Les protections sur les banques, références, crédits, articles et moteurs sont maintenues. Aucun article n’a été réécrit ou supprimé. Les 300 questions et la progression du quiz sont préservées. Les anciens contenus d’Explorer ne sont pas restaurés par simple correspondance de nom.

## Captures et preuves

Dossier : `../THOT-EXPLORER-RECONSTRUCTION-20261026/captures/`.

- `accueil-{largeur}.png`
- `aral-ouverture-{largeur}.png`
- `aral-tableau-{largeur}.png`
- `aral-bilan-{largeur}.png`
- `rome-carte-{largeur}.png`
- `rome-fiche-{largeur}.png`
- `rome-comparateur-{largeur}.png`
- `rome-guide-{largeur}.png`
- `rome-bibliotheque-finale.png` et `inspection-compositions.png` : découpes/montage d’inspection des captures locales, pas des documents historiques retouchés.
- `resultats.json` : résultat complet des parcours.

Les captures définitives, y compris téléphone, plateau rempli, bilan, comparaison et bibliothèque illustrée, ont été ouvertes et examinées. Les premiers clichés de développement ont révélé des défauts et ne constituent pas les preuves de la version finale. Les journaux de non-régression sont dans le sous-dossier `tests/` de la livraison.

## Points non vérifiés et suites recommandées

Safari/iOS, Firefox, un appareil physique, un lecteur d’écran réel, le stockage natif après rechargement HTTP et les performances sur réseau mobile n’ont pas été testés. L’accessibilité de base a été exercée dans Chromium ; aucune certification WCAG complète n’est revendiquée. La cartographie est une initiation documentée, pas un outil d’identification de frontières précises ou de statut local.

Avant une éventuelle publication autorisée : vérifier la reprise native, faire une lecture au lecteur d’écran et un essai tactile sur téléphone. Pour un prochain enrichissement éditorial, privilégier une cartographie régionale mieux détaillée et une relecture spécialisée plutôt que des couches ou dates inventées.

**PRÊT POUR VALIDATION — AUCUNE PUBLICATION EFFECTUÉE**
