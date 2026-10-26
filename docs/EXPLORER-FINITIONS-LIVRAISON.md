# COMPTE RENDU POUR CHATGPT — THOT

Finitions de THOT Explorer — 26 octobre 2026. Version locale destinée à la validation du propriétaire, sans publication.

## État et périmètre

- Dépôt : `thot-culture/Thot`, branche `work/explorer-aral-rome-20261026`.
- Départ réel : `d8ac141d78ed6014ad7f1edec1d8fc693640a23c`, arborescence initialement propre.
- Sauvegarde : branche `backup/explorer-avant-finitions-d8ac141` et archive de ce commit.
- Pages : `explorer.html`, `explorer/enquetes/mer-aral.html`, `explorer/atlas/rome-expansion.html`.
- Articles, textes historiques des articles, sources, dates, bibliothèque, anciennes interactions, 300 questions, règles et progression du quiz : fichiers inchangés depuis le départ, contrôlés octet pour octet.
- Aucune fusion, aucun push, aucune publication. La branche `main` reste au commit `0aa6d452be6e5b1add58aa5cc54ee3d88fb307fa`.

## Enquête Aral

### Tableau et téléphone

- Disposition sur trois colonnes, cartes agrandies et rangement automatique conservant les pièces, rôles et relations. L’ajout cherche un emplacement libre ; il ne superpose pas systématiquement une carte après un retrait.
- Mode « Tableau en grand » sur ordinateur ; vue d’ensemble, zoom conservant le centre de lecture, centrage sur la pièce active, déplacement de la vue par boutons et défilement au clavier.
- Liste non réduite par le zoom, proposée par défaut sur téléphone. Sélection, examen, association et retrait d’une pièce possibles sans glisser-déposer.
- Relations numérotées, couleurs, symboles et tracés distincts : confirmation, contradiction, contexte, insuffisance. Halo des tracés ; mise en évidence des relations de la pièce active. Liste textuelle équivalente avec modification et suppression.
- Sélection active visible dans les cartes, commandes et liste. Indicateurs de progression dans Documents / Tableau / Hypothèses.
- Déplacement volontaire par la poignée avec seuil, flèches de clavier et boutons. Un toucher sur le reste d’une pièce ne la déplace pas.
- Statut explicite des contradictions : à examiner, écart de période/échelle déclaré, désaccord maintenu. Ce statut exprime le travail du lecteur, sans validation scientifique automatique.
- Réinitialisation supprimant la seule clé Aral ; message de pièce active nettoyé ; limite de 60 relations explicite plutôt qu’une perte silencieuse à la reprise.

### Corpus : onze pièces, sans accumulation

Les dix identifiants initiaux sont conservés. Une seule nouvelle pièce, D11, est ajoutée ; D09 et D10 sont enrichies d’images institutionnelles.

| Pièce | Document directement examinable | Utilité et limite |
| --- | --- | --- |
| D09 | Aqua/MODIS, 13 juin 2006, poussières, NASA | Observer un épisode ; origine du panache qualifiée de probable par la NASA. Ne permet pas de mesurer la composition ou de diagnostiquer une maladie. Le communiqué PNUD 2025 reste distinct. |
| D10 | Mosaïque Landsat 5 de Kok-Aral, juillet–septembre 2006, USGS | Examiner l’aménagement ; fausses couleurs et plusieurs acquisitions annoncées. L’image seule ne date pas la construction et ne mesure pas les débits. |
| D11 | ARGON KH-5, mission 9066A, 22 août 1964, Nord de l’Aral, USGS | Regarder un état ancien du Nord et du détroit de Berg ; ne représente pas l’ensemble de la mer ou son rivage exact en 1960. |

Les synthèses, graphiques sourcés et textes de lecture restent présents. Les trois originaux institutionnels sont conservés sans retouche ; versions WebP pour l’affichage, liens vers les originaux et sources complémentaires dans les notices interactives et statiques. Ces versions pèsent environ 95–104 Ko chacune.

### Bilan documentaire

Quatre critères explicites rendent visibles les choix : pièces retenues, familles hydrologie/prélèvements, nuances climat/Nord, état des désaccords. Aucun score.

Le bilan distingue un mécanisme appuyé, une observation sans preuve de causalité, une généralisation excessive, des pièces essentielles absentes et une contradiction non examinée. Il invite à expliquer un écart de portée sans prétendre vérifier automatiquement une note. La sélection d’un document ne prouve pas sa compréhension. Le texte libre reste conservé, sans analyse sémantique simulée ; deux textes opposés à choix identiques produisent les mêmes critères. Révision possible sans perdre le tableau.

## Atlas de Rome

- Huit états cartographiques et six chapitres conservés. Aucun polygone historique ou littoral source redessiné pendant cette intervention.
- Onze lieux documentés : ajout de Massalia, Tarraco, Cannae, Actium, Éphèse et Antioche aux cinq lieux initiaux. Coordonnées représentatives Pleiades et attributions conservées.
- Quatre repères datés : Cannes en 216 av. J.-C., destruction de Carthage en 146, Actium en 31, titre d’Auguste en 27. Couche facultative et liste accessible, explicitement transchronologiques.
- Les repères de Cannes et Actium ne dessinent pas des champs de bataille ou des positions de flottes : site antique et sanctuaire/mémorial seulement.
- Cadrages Gaule, Hispanie et Orient : déplacements de caméra et fiches explicatives, pas de nouvelles frontières administratives. Chaque cadrage permet de comparer deux états réellement disponibles.
- Quatre parcours facultatifs dans les fiches d’Hannibal, César, Auguste et Trajan. Chaque étape actionne la vraie carte et précise séparément la date de l’événement/document et celle de la carte. Précédent, suivant, document associé et sortie disponibles ; aucun itinéraire inventé.
- Un quatrième objet, le temple de Dendur, élargit la bibliothèque au-delà des trois monnaies. Alexandrie n’est jamais présentée comme son origine. Photographie authentique du Met, Open Access/CC0, avec accès à la photographie originale.
- Discordance de la notice du Met conservée dans les limites : en-tête « completed by 10 CE », récit « about 15 BC ». La datation affichée est le règne d’Auguste, pas une année arbitrairement choisie.
- Correction des transitions : lancer un parcours depuis une modale conserve le focus sur son titre ; comparer une région quitte explicitement le récit guidé. L’image Open Graph de l’Atlas correspond désormais à son contenu romain.
- Comparateur A/B : badges et dates distincts, indication des parts de vue, description du curseur pour les technologies d’assistance. Les deux clips utilisent toujours la même projection et la même vue ; pas de mesure de superficie.
- Étiquettes lisibles à l’écran, limitation de leurs chevauchements, zones de clic qui n’empiètent pas sur les points voisins. La liste native conserve l’accès aux lieux serrés. Sur téléphone, une fiche s’ouvre sous la carte et ne la recouvre plus.
- Sans JavaScript : chapitres, dates, bibliothèque et notices des onze lieux/quatre événements sont lisibles ; les commandes inopérantes restent masquées.

### Richesse volontairement limitée par les sources

Le dépôt AWMC épinglé ne fournit pas un état vérifiable de 27 av. J.-C. : aucun état supplémentaire n’a été inventé autour de César/Auguste. Les nouveaux repères politiques et parcours expliquent ce décalage.

Le jeu AWMC de voies a été effectivement téléchargé et examiné : 3 166 segments, métadonnées de période générales (`R`, `RL`), sans chronologie individuelle suffisante pour les huit états. Aucune couche de voies datées n’est livrée. Le dossier de recherche conserve cet examen. Aucun point Dendur n’est créé sans coordonnées vérifiées.

## Identité et accessibilité

Palette papier, marine, sarcelle et terre cuite conservée. Hiérarchie, boutons et focus renforcés ; crédits et textes secondaires agrandis ; transitions courtes sans son ni animation automatique. Réduction des animations respectée. Les modèles restent locaux, sans dépendance JS, police distante ou API d’évaluation supplémentaire.

Cibles ordinaires de 48 px, sélection native et alternatives au glisser-déposer, focus de retour après fermeture de modale, notices d’échec d’image, annonces utiles. Les petits repères cartographiques serrés ont une alternative dans la liste native. Il s’agit d’une amélioration d’accessibilité de base, pas d’une déclaration de conformité WCAG complète.

## Sources et droits des ajouts

| Ensemble | Source consultée et réutilisation |
| --- | --- |
| Aral ancien | [USGS Earthshots, North Aral Sea](https://eros.usgs.gov/earthshots/north-aral-sea), image ARGON 1964. Domaine public gouvernemental selon les [conditions USGS](https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits), aucun crédit tiers indiqué pour l’image retenue. |
| Barrage | [USGS Earthshots, Kok Aral Dam](https://eros.usgs.gov/earthshots/kok-aral-dam), mosaïque Landsat 2006, mêmes conditions USGS. |
| Poussières | [NASA Earth Observatory, Dust Storm over the Aral Sea](https://science.nasa.gov/earth/earth-observatory/dust-storm-over-the-aral-sea-6654/), Jeff Schmaltz / MODIS Rapid Response Team / NASA-GSFC ; [règles NASA](https://www.nasa.gov/nasa-brand-center/images-and-media/), sans licence CC inventée ni soutien supposé de la NASA. |
| Lieux | Pleiades : [148127](https://pleiades.stoa.org/places/148127), [246349](https://pleiades.stoa.org/places/246349), [442523](https://pleiades.stoa.org/places/442523), [530771](https://pleiades.stoa.org/places/530771), [599612](https://pleiades.stoa.org/places/599612), [658381](https://pleiades.stoa.org/places/658381). JSON canoniques effectivement téléchargés, CC BY 3.0, créateurs et coordonnées dans `pleiades-places.json`. |
| Dendur | [The Met, objet 547802](https://www.metmuseum.org/art/collection/search/547802), 68.154, Gift of Egypt, 1967, photographie DP240337. Public Domain / Open Access, CC0. Conversion proportionnelle WebP ; photographie originale non retouchée. |
| Événements et parcours | Notices Pleiades et essais du Met déjà identifiés dans chaque entrée JSON. Textes explicatifs originaux THOT, pas de copie intégrale des essais. |

Registres : `aral-primary-media.json`, `aral-sources.json`, `rome-media.json`, `rome-sources.json`, `pleiades-places.json`. Les empreintes SHA-256, transformations et consultations sont enregistrées. Les données géographiques et leurs licences GPL/ODbL demeurent séparées et inchangées.

## Tests et preuves

Les résultats machine et captures se trouvent dans le dossier de livraison `THOT-EXPLORER-FINITIONS-20261026`, séparé du site.

- **20 suites statiques du dépôt** : quiz, banque et interactions, accueil, bibliothèque, autorité et mini-jeu, éditorial, sources, sommaires, comparateurs, documents, portabilité, stabilisation et génération Explorer.
- **Deux suites navigateur du socle** : 44 vues / 11 pages ; références après réponse, garde périmée, défi quotidien complet, jeux intégrés, Bagram, comparateur et retrait d’Explorer.
- **Recette Explorer principale** : vrai Chromium exécutant HTML/CSS/JS du dépôt en fixtures locales, médias incorporés ; 320, 390, 768 et 1440 px. Ouverture de onze pièces, ajout/retrait, déplacement clavier et pointeur, relations modifiées/supprimées, hypothèses, révision, modales, huit états, six chapitres, clips 0/50/100 %, couches, images indisponibles, sans JS et réduction des animations.
- **Recette de finition** : six pièces/quatre relations, rangement sans perte, liste et toucher simulé, pan sans déplacement des pièces, état des contradictions ; huit cas documentaires ; onze lieux, quatre événements au clavier, quatre parcours complets, documents associés et retour.
- **Stockage simulé** : reprise de l’ensemble de l’état et clé témoin quiz préservée ; JSON corrompu et quota refusé. Refus natif du stockage en origine opaque aussi exercé. Ne remplace pas le cycle HTTP natif.
- **HTTP local via client Python** : 14 pages et 100 URL/ressources accessibles sous `/Thot/`, MIME des scripts ; onze anciennes pages retirées en 404. Ce contrôle ne constitue pas un déploiement ni une navigation dans un navigateur.
- Conservation exacte des fichiers hors Explorer depuis `d8ac141`, empreintes d’images, archives géographiques, licences séparées, génération à jour et `git diff --check`.

### Limites réellement rencontrées

- **Cycle natif HTTP / localStorage non vérifié** : Chromium refuse `page.goto` vers le serveur local avec `net::ERR_ABORTED`. Aucun contournement de politique navigateur. Un test autonome `scripts/test-explorer-stockage-http.py` exerce ajout, relations, conclusion, vrai rechargement, fermeture/réouverture, réinitialisation de la seule clé Aral et témoin quiz quand le navigateur autorise HTTP.
- **Firefox** : binaire téléchargé, lancement échoué (`/proc/self/uid_map` en lecture seule, échec du compositeur SWGL, timeout). Aucun parcours Firefox revendiqué.
- **WebKit** : binaire téléchargé, bibliothèques système manquantes, dont GTK 4, Graphene et GLES. Aucun parcours WebKit/Safari revendiqué.
- **Zoom natif 200 % non confirmé** : raccourcis Chromium essayés, mais largeur interne et DPR restent inchangés. Repli CSS `zoom:2` vérifié et capturé, explicitement une émulation, pas un test de zoom natif.
- Aucun téléphone physique, VoiceOver/NVDA ou autre lecteur d’écran réel disponible. Toucher simulé Playwright ; contrôle DOM/clavier seulement.
- Aucun test public : rien n’a été déployé. Les liens externes des sources ajoutées ont été consultés pendant la recherche, sans garantie de disponibilité future.

## Voir la version

Décompresser l’archive `thot-explorer-finitions-apercu-local.zip`, entrer dans `Thot`, puis :

```sh
python3 scripts/preview.py --port 8767
```

Sur Windows, utiliser `python` si nécessaire. Ouvrir `http://127.0.0.1:8767/Thot/explorer.html`. Le serveur ne publie rien. L’aperçu de travail tourne également sur le port 31460 dans l’environnement de développement.

Les captures couvrent accueil ordinateur/téléphone, ouverture Aral, tableau six pièces/quatre relations, liste mobile, bilan/révision, carte, fiche, comparaison, six chapitres guidés et parcours d’Auguste. Les captures sont réellement produites ; le compte rendu ne les présente pas comme des essais physiques.

## Maintenance et reproduction

- Modifier les enrichissements dans `assets/explorer-v2/data/explorer-additions.json`. Le générateur conserve les dix notices et identifiants initiaux, puis applique les mises à jour et ajouts.
- Chaque événement possède une source, une date, un `place_id` vérifié et des limites. Chaque étape de parcours désigne un `epoch` réellement présent ; sa date narrative reste explicite et distincte.
- Les cadrages `regions` ne sont que des centres/zooms de caméra. Ils ne doivent pas devenir des frontières sans nouvelles données vérifiées.
- Préparer les nouvelles images depuis des originaux vérifiés ; enregistrer SHA, licence, attribution et transformations avant assemblage.

```sh
python3 scripts/build-explorer-corpus.py
python3 scripts/build-explorer-reconstruction.py
python3 scripts/build-explorer-reconstruction.py --check
python3 scripts/test-explorer-reconstruction.py
python3 scripts/test-explorer-reconstruction.py --browser
python3 scripts/test-explorer-finitions.py
python3 scripts/test-explorer-http.py --origin http://127.0.0.1:8767
python3 scripts/test-explorer-stockage-http.py --origin http://127.0.0.1:8767
```

Le registre documentaire peut être régénéré à partir des deux dossiers de recherche conservés avec `scripts/audit-explorer-sources.py --research DOSSIER_INITIAL --additions-research DOSSIER_FINITIONS`. L’assemblage du site et l’aperçu n’exigent aucun de ces téléchargements ni accès réseau.

## Avis de livraison

La version est prête à être soumise à la validation éditoriale et visuelle du propriétaire, avec les réserves de recette explicites ci-dessus. Avant publication, confirmer en navigateur ordinaire le cycle HTTP natif de sauvegarde et le zoom natif 200 %, puis la compatibilité Safari/Firefox et un lecteur d’écran. La publication nécessite une autorisation distincte.
