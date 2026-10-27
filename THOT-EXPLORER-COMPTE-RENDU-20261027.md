# COMPTE RENDU POUR CHATGPT — THOT

## Corrections finales avant publication — 27 octobre 2026

Ce rapport concerne la version locale corrigée après l’audit Work du commit `25371839f1f109688e7dd79da672f6d7769d5f0a`. Il remplace les réserves de recette du rapport du 26 octobre pour les points effectivement retestés ici. Les anciens rapports restent conservés comme historique.

Branche : `work/explorer-aral-rome-20261026`. Sauvegarde locale avant intervention : `backup/explorer-avant-recette-25371839`. Aucun push, aucune fusion, aucune publication ni opération GitHub Pages. `main` reste à `0aa6d452be6e5b1add58aa5cc54ee3d88fb307fa`.

Le commit exact et les empreintes des ZIP sont fournis dans le manifeste de livraison associé aux archives ; les ZIP portent un nouveau nom contenant ce commit pour éviter toute confusion avec `d8ac141` ou `25371839`.

## Affichage mobile et Atlas

Les commandes de zoom et de déplacement, ainsi que les deux badges de date, sortent de la superposition sur le plan. Ils occupent des rangées distinctes dans le flux de la page. À 320 et 390 px, les sélecteurs A/B et les dates s’empilent. La valeur du curseur se place sur sa propre ligne. Les commandes restent accessibles au toucher simulé et au clavier.

Le placement des noms vérifie désormais les autres noms, les repères visibles, les limites de la carte, la boussole et la séparation du comparateur. Plusieurs positions proches sont essayées ; faute de place, un nom est masqué. Tous les lieux restent accessibles dans la liste native et leurs fiches. Les étiquettes du lieu sélectionné passent en priorité.

Les repères trop proches adaptent leur taille. Quand un événement et un lieu partagent les mêmes coordonnées, un seul repère est dessiné ; la fiche de l’événement donne aussi accès à celle du lieu. Aucune coordonnée historique n’est déplacée. Les mesures des textes sont mises en cache pour éviter une succession de recalculs de géométrie pendant chaque déplacement de la carte.

Les deux dates du comparateur conservent la même projection et la même vue. Les limites des modèles historiques restent affichées. Aucun nouvel état territorial, lieu, événement ou document historique n’est inventé.

## Enquête Aral

- La navigation entre les espaces est dans le flux : elle ne reste plus collée au-dessus d’un rôle de preuve ou d’un champ de conclusion.
- Les cartes réservent suffisamment de place aux titres. Les onze titres sont contrôlés intégralement. Le tableau est agrandi en hauteur pour conserver les positions valides des dossiers précédents malgré les cartes plus hautes.
- La sélection active et chaque extrémité d’une relation affichent le titre complet sur plusieurs lignes. La compréhension ne dépend plus du texte coupé d’un sélecteur natif.
- En mode liste, les commandes de zoom, rangement géométrique, déplacement et centrage sont masquées. Elles restent disponibles en mode carte. Le choix d’une pièce se fait directement dans la liste ; sélectionner, examiner, relier et retirer restent possibles sans glisser-déposer.
- Le retour du focus après un retrait tient compte du mode liste et ne vise plus un sélecteur masqué.
- Un fil de lecture explique « examiner → garder au tableau → relier et préciser le rôle → expliquer et réviser ». Des boutons permettent d’examiner une autre pièce, de rejoindre les relations depuis une notice et de passer à l’explication.
- Garder une pièce au tableau ne la classe toujours pas automatiquement comme preuve d’une hypothèse.
- Le bilan distingue explicitement les constats du corpus et les choix du lecteur. Son introduction précise qu’il ne valide pas le sens du texte libre. Les critères indiquent ce qui est repéré dans les choix, ce qui reste à discuter et l’absence éventuelle de contradiction déclarée ; ils ne donnent aucun score.

Le corpus, les sources, les crédits, les onze pièces, les hypothèses proposées et les données historiques sont inchangés. Les relations, rôles, notes et textes sauvegardés restent des choix du lecteur, sans transformation automatique en faits scientifiques.

## Correction de fiabilité révélée par la recette

La reprise d’un dossier de l’ancienne version a mis en évidence un mélange possible entre nouveau HTML et ancien JavaScript conservé dans le cache du navigateur. Les CSS et scripts des trois pages Explorer reçoivent maintenant une empreinte de contenu dans leur URL (`?v=…`). Cette empreinte est calculée par le générateur ; aucune dépendance ni requête externe n’est ajoutée.

L’adaptation du contrôle HTTP conserve la vérification des types MIME des scripts malgré ces paramètres d’URL. Les fixtures de rendu résolvent également les chemins versionnés. Les contrôles éditoriaux, les sources et les règles du quiz ne sont pas assouplis.

## Sauvegarde réellement testée

### WebKit : HTTP et stockage natifs — réussi

Le test ouvre le site avec le serveur `scripts/preview.py`, sous `/Thot/`, sans fixture de page, sans remplacement de `localStorage` et sans origine fabriquée.

1. Une vraie partie de cinq questions du quiz est terminée. Le site produit sa sauvegarde native `thot_v2_stats`.
2. Quatre documents Aral sont examinés puis ajoutés, une relation et sa note sont créées, un indice est demandé, des rôles sont choisis, une hypothèse et une conclusion sont saisies.
3. La page est réellement rechargée : état et bilan retrouvés.
4. Le navigateur persistant est entièrement fermé, puis un nouveau processus rouvre le même profil : documents, relations, rôles, hypothèse, conclusion, indice et bilan retrouvés.
5. L’enquête est réinitialisée puis rechargée : sa clé disparaît et le dossier reste vide. La sauvegarde réelle du quiz et les autres clés témoins sont identiques octet pour octet.

Les journaux de lancement montrent les deux processus successifs. Aucun profil réel de l’utilisateur n’est ouvert : les essais utilisent un profil temporaire isolé.

### Reprise d’un dossier créé par `25371839` — réussie

L’archive exacte du commit précédent est réellement servie sur une origine HTTP locale. Son ancien code crée un dossier : pièces, relation déclarée contradictoire, note, rôles, indice, hypothèse libre et conclusion. Une carte est déplacée par le clavier jusqu’à la limite basse de l’ancien plateau (`y = 1064`).

Après fermeture du navigateur, la version courante est servie à la même origine et rechargée avec le même profil. Tous les champs de progression sont comparés, en normalisant seulement les identifiants techniques des relations. Le texte libre, l’hypothèse et la position basse sont conservés. La présence des nouveaux éléments HTML, du nouveau JavaScript et du nouveau CSS est vérifiée pour éviter un faux résultat resté sur l’ancien cache.

Les dates originales des fichiers du ZIP sont restituées dans ce test : extraire l’ancienne version ne doit pas lui donner artificiellement une date plus récente que la version actuelle.

## Recette finale et preuves

| Contrôle | Conditions et résultat |
| --- | --- |
| Chromium 154.0.8037.57 | HTML/CSS/JS du dépôt dans des fixtures incorporées ; parcours à 320, 390, 768 et 1440 px : réussis. |
| WebKit Playwright 26.5 / build 2336 | Navigation HTTP locale réelle aux mêmes quatre largeurs : réussie. |
| Collisions de commandes | Comparateur, sélecteurs, zoom, déplacement, dates et curseur : aucune intersection détectée dans les parcours contrôlés. |
| Noms et repères | Huit dates, couches, quatre événements, comparaison, zoom et déplacement : absence de collision vérifiée sur les éléments effectivement visibles. |
| Aral | Examen et ajout des onze pièces, titres complets, sélection, relations, hypothèses, bilan et révision : réussis. |
| Atlas | Huit états, onze lieux, quatre événements, six chapitres et quatre parcours facultatifs : vérifiés dans les recettes. |
| Clavier | Activation, déplacement facultatif des pièces, curseur, sélecteurs, modales, focus et révision : contrôlés. |
| Stockage | Cycle HTTP natif, arrêt/redémarrage complet, reset et quiz préservé : réussi dans WebKit. Refus de stockage, quota et JSON corrompu : également couverts par les recettes distinctes. |
| Alternatives | Sans JavaScript, image indisponible, textes et sources accessibles, réduction des animations : contrôlés par les recettes existantes relancées. |
| Non-régression | 20 suites statiques et deux suites navigateur du socle relancées : articles, bibliothèque, quiz, défi quotidien, jeux, sommaires, références et retrait des anciennes pages Explorer. |
| Conservation | Comparaison octet pour octet avec `25371839` hors fichiers explicitement concernés ; corpus, sources, cartes, médias et 300 questions inchangés. |
| Ressources | 14 pages et 100 URL/ressources sous `/Thot/`, MIME des scripts versionnés et onze anciennes pages en 404. |
| Génération | Assemblage reproductible et à jour ; syntaxe JS, portabilité et `git diff --check`. |

### Zoom natif à 200 % — réellement réussi

Chromium est lancé avec son interface dans un écran X11 virtuel. Les touches du navigateur, envoyées par X11, passent de 100 à 110, 125, 150, 175 puis 200 %. La fenêtre reste large de 1440 px ; la largeur interne passe de 1440 à 720 et le rapport de pixels de 1 à 2. Aucun zoom CSS ni ratio de pixels forcé n’est utilisé.

Accueil, liste Aral, explication et comparateur sont vérifiés à ce zoom. Les captures sont prises directement sur le viewport natif par CDP, sans recadrage d’élément susceptible de fausser l’image au zoom du navigateur. Les captures ont été inspectées.

La sonde des anciennes recettes sans interface ne modifie pas le zoom ; son résultat reste distinct de ce nouveau test avec interface. Le JSON de référence du test natif est `captures/zoom-natif-200.json`.

## Limites et essais impossibles

- Chromium refuse toujours la navigation HTTP locale avec `net::ERR_ABORTED` dans l’environnement administré. Ses tests de rendu et de zoom natif utilisent des fixtures explicitement identifiées. Le cycle de sauvegarde HTTP a été exécuté dans WebKit, sans contourner la politique Chromium.
- Firefox a été téléchargé et essayé. Le lancement échoue dans ce conteneur : `/proc/self/uid_map` en lecture seule, erreur du compositeur SWGL et expiration du délai. Aucun parcours Firefox n’est présenté comme réussi.
- WebKit Linux ne constitue pas un essai de l’application Safari sur macOS/iOS. Aucun téléphone physique, VoiceOver, NVDA ou autre lecteur d’écran réel n’est disponible.
- Le tactile est simulé avec Playwright. Le zoom natif est réel dans Chromium, mais sur un écran virtuel.
- Aucun audit WCAG complet, mesure Lighthouse ou contrôle de déploiement public n’est revendiqué.

Les bibliothèques manquantes de WebKit et les outils X11 ont été téléchargés depuis les dépôts Debian officiels, avec vérification SHA-256, et installés uniquement dans un dossier de test isolé. Ils ne font pas partie du site ni de ses ZIP de code. Aucun réglage de sécurité réseau ou de politique Chromium n’a été modifié.

## Livraison et reproduction

Le ZIP du site contient les fichiers Git de la version corrigée. Il est contrôlé par CRC et comparaison au commit. Une extraction de contrôle permet de vérifier la génération et les ressources HTTP. L’archive de recette fournit une galerie des captures finales, les résultats JSON et les journaux.

Après extraction du ZIP du site, entrer dans `Thot`, puis :

```sh
python3 scripts/preview.py --port 8767
```

Ouvrir `http://127.0.0.1:8767/Thot/explorer.html`. Utiliser `python` à la place de `python3` si nécessaire. Cet aperçu reste local.

Commandes principales de recette, avec Playwright et les navigateurs requis installés :

```sh
python3 scripts/build-explorer-reconstruction.py --check
python3 scripts/test-explorer-reconstruction.py --browser
python3 scripts/test-explorer-finitions.py
python3 scripts/test-explorer-recette-finale.py
python3 scripts/test-explorer-recette-finale.py --browser webkit --mode http
python3 scripts/test-explorer-stockage-http.py --browser webkit
python3 scripts/test-explorer-migration-http.py --baseline CHEMIN_DU_ZIP_25371839 --out migration.json
python3 scripts/test-explorer-http.py --origin http://127.0.0.1:31460
```

La recette native du zoom est `scripts/test-explorer-zoom-natif.py` et exige Chromium avec interface, X11 et `xdotool` ; le journal de livraison conserve les arguments Xvfb réellement utilisés. Aucun de ces outils n’est nécessaire pour consulter le site.

La liste précise des fichiers modifiés figure dans `docs/EXPLORER-RECETTE-FINALE-FICHIERS.txt`. Les anciennes archives restent disponibles sous leurs anciens noms ; utiliser les nouveaux ZIP et comparer leurs SHA-256 avant de transmettre la version à Work.

## Verdict avant publication

**Avis favorable à la validation finale de cette version avant publication.** Les problèmes remontés sur le mobile, les titres, la navigation et le bilan sont corrigés ; la sauvegarde et la reprise d’un ancien dossier ont maintenant des preuves HTTP natives, et le zoom natif 200 % a été testé. Aucune anomalie bloquante n’est détectée dans les recettes disponibles.

Les réserves portent sur les environnements non essayés : Firefox fonctionnel, Safari sur appareil réel, tactile physique et lecteur d’écran réel. Une dernière vérification sur les appareils du propriétaire reste recommandée. Cette conclusion n’est pas une déclaration de conformité universelle et n’autorise aucune publication automatique.
