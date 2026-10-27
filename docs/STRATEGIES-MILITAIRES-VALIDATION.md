# THOT — Article Stratégies militaires : version locale prête pour validation

Version du 27 octobre 2026. Aucune publication, aucun push, aucune modification de `main`.

## Ouvrir la version locale

Aperçu : http://127.0.0.1:8766/Thot/articles/evolution-strategies-militaires.html

Le serveur est lancé sur cette machine pour cette séance. Pour le relancer depuis la racine du dépôt : `python scripts/preview.py --port 8766`. Le script utilise uniquement la bibliothèque standard Python. La nouvelle page peut aussi être ouverte directement depuis le fichier HTML de l’archive : ses styles, ses images et ses quatre activités sont locaux. Les liens vers les autres pages fonctionnent dans l’archive du site complet ; les sources externes demandent une connexion.

Branche : `work/article-strategies-militaires-20261027`.
Base : `5231c61`, dernier `origin/main` récupéré avant l’intégration, avec la publication Explorer déjà présente. L’ancien état local a été avancé uniquement sur la nouvelle branche dédiée. Aucun autre travail local n’était en attente.

## Contenu livré

Six chapitres développés, introduction, réponse en bref, sommaire, conclusion et question finale demandée. Le texte intégral de la conversation ChatGPT antérieure n’était pas joint : la rédaction a été produite à partir du cahier des charges fourni, comme celui-ci l’autorise.

Le texte principal représente environ 2 444 mots, soit 12 minutes à 210 mots/minute selon la méthode THOT, hors documents, sources et pauses interactives. Avec les explications facultatives, la lecture peut durer davantage.

Exactement quatre activités pédagogiques : frise des six périodes ; comparaison des fortifications ; comparaison des transports ; photographie de char avec trois questions distinguant observation, interprétation et limites. Les trois premiers modules sont améliorés par JavaScript ; tous leurs textes existent déjà dans le HTML. L’activité documentaire utilise des éléments `details` natifs, utilisables sans JavaScript. Aucun score ni minuteur.

L’identité réutilise `assets/article.css` sans modification. Les styles supplémentaires sont limités au corps `.article-strategies`. Aucun ajout de dépendance au site. Les paragraphes et la bibliothèque existants n’ont pas été refondus.

## Vérification historique

| Partie | Contrôle et précautions retenues |
|---|---|
| Antiquité | Cannes en 216 av. J.-C. ; manœuvre présentée selon Polybe, non comme un relevé certain ; distinction entre combat et issue de la guerre ; alliances et ressources romaines appuyées sur la notice de Fronda. |
| Mongols | Organisation décimale vérifiée dans le résumé du chapitre de Timothy May ; édition papier 2023, mise en ligne 2024 ; adoption de spécialistes et techniques, contraintes du milieu et violence des conquêtes. |
| Poudre et fortifications | Wujing zongyao, 1044 sous les Song ; ce repère n’est pas donné comme une date d’invention universelle ; diffusion progressive et réponses mutuelles de l’attaque et de la défense ; schémas sans échelle. |
| Russie et transports | Préparatifs réels en 1812 ; combinaison de problèmes matériels, maladies, combats, décisions et climat ; l’hiver ne résume pas l’échec. En Abyssinie, le rail côtier n’est pas présenté comme desservant Magdala ; rôle des troupes indiennes, des accords de passage et du pillage mentionné. |
| XXe siècle | Premier emploi des chars en 1916 ; Amiens, 8 août 1918, comme coordination de moyens. Atlantique : convois, sous-marins, radar, sonar, aviation et ravitaillement. Vietnam : distinction entre résultat militaire et effets politiques du Têt ; coût civil rappelé. |
| Ukraine | Étapes de 2014 et du 24 février 2022 distinguées ; sources de 2025–2026, dont IHEDN du 19 février 2026 et ministère des Armées du 26 octobre 2026 ; analyses séparées des faits établis ; aucune prédiction catégorique ni procédure opérationnelle. |

22 références sont conservées dans `docs/strategies-sources.json` et dans la page. Les ouvrages payants n’ont pas été présentés comme lus intégralement : notices et résumés de Fronda et May explicitement identifiés. Même précaution pour l’introduction IISS et le résumé CSIS. Les références institutionnelles sans date affichée restent indiquées sans date.

Le contrôle HTTP direct des 22 références a obtenu 17 réponses 200, trois réponses 403 (Historic England, Smithsonian, HRW), une limitation 429 (Met) et un délai dépassé (Polybe). Les contenus de ces références ont néanmoins été consultés dans les résultats ou pages du moteur de recherche documentaire. Le JSON de contrôle distingue ces limites : les liens externes ne sont donc pas déclarés tous accessibles depuis cette machine. Un HTTP 200 ne constitue pas à lui seul une vérification scientifique du contenu.

## Documents et licences

| Document | Attribution, date et collection | Réutilisation |
|---|---|---|
| Hannibal | Sculpture de Sébastien Slodtz, 1704, Louvre MR 2093 ; photo Alain08 d’après Jastrow, source 2008 ; recadrage Commons par Gog the Mild, 2020 | Sculpture dans le domaine public ; photographie et conversion WebP sous CC BY-SA 3.0, crédit et lien de licence conservés. Représentation moderne clairement signalée. |
| Homs (1281) | Miniature anonyme du XIVe siècle, BnF NAF 886, f. 27v, reproduction Commons | Domaine public ; œuvre ancienne et reproduction fidèle. L’image ne prouve pas le déroulement précis de la bataille. |
| Campagne de Russie | Charles-Joseph Minard, carte du 20 novembre 1869, reproduction Commons | Domaine public ; synthèse postérieure aux événements, pas relevé contemporain de toutes les pertes. |
| Mark IV | John Warwick Brooke, Wailly, 21 octobre 1917, IWM Q 6284, Ministry of Information First World War Official Collection | Domaine public selon la notice Commons, Crown Copyright expiré. Notice IWM directe bloquée (403). Le titre de collection relatif à Cambrai ne remplace pas la date propre à la photographie. |

Les notices brutes Commons sont archivées avec les images. Pour Hannibal, le champ API « Public domain » concernait l’œuvre et ne suffisait pas pour la photographie : sa section de licence a été lue séparément. La licence photographique retenue est bien CC BY-SA 3.0.

`docs/strategies-images.json` conserve les notices, changements et empreintes SHA-256. Les trois nouveaux originaux téléchargés sont archivés ; la photographie d’Hannibal reprend le WebP déjà présent et vérifié dans le dépôt. Les documents sont optimisés en WebP sans retouche du sujet. Chaque chapitre dispose d’un document ou d’un schéma pédagogique ; les schémas des fortifications et transports sont originaux, identifiés et sans dimensions inventées. Les chapitres 3 et 6 utilisent des schémas plutôt qu’une photographie supplémentaire. Aucun faux document historique n’a été créé.

## Résultats des contrôles

- Chrome 156, HTTP local réel : largeurs 320, 375, 390, 768 et 1440 px.
- Aucun débordement horizontal dans les états testés des comparateurs et de la frise.
- Tous les choix de la frise et des deux comparateurs testés ; un seul panneau visible à la fois et état `aria-pressed` cohérent.
- Activation au clavier par Entrée et Espace ; trois réponses documentaires ouvertes au clavier ; simulation tactile aux trois petites largeurs.
- Sans JavaScript à 320 et 1440 px : les dix panneaux sont visibles et l’activité documentaire reste utilisable.
- Zones des boutons et résumés d’au moins 44 px ; ancres du sommaire vérifiées ; images chargées et textes alternatifs présents.
- Audit axe-core 4.10.3, règles WCAG 2 A/AA et 2.1 AA : aucune violation détectée dans les états audités aux cinq largeurs. Ce résultat automatisé n’est pas une certification d’accessibilité.
- Mode de réduction des animations vérifié ; aucune animation propre à l’article.
- Aucune erreur JavaScript et aucune erreur HTTP sur les ressources locales de la nouvelle page ; 12 cibles locales vérifiées en HTTP 200.
- Analyse HTML5 avec html5lib : aucune erreur. Analyse syntaxique CSS avec tinycss2 : aucune erreur. JavaScript vérifié avec `node --check`.
- Métadonnées de description, canonique, Open Graph, Twitter et JSON-LD Article présentes. Statut Draft et noindex/nofollow conservés pour cette version de travail ; aucune date de publication inventée.
- Tests existants réussis : quiz et ses 300 questions, sauvegarde et migration simulées ; accueil ; bibliothèque ; quiz des autrices ; activités et frises des articles ; navigation et partage.
- Le contrôleur général `check-site.mjs` signale exactement une erreur attendue : l’article est absent du sitemap. Ce contrôleur suppose que toute page HTML doit être publiée. Le sitemap public est volontairement préservé ; le contrôle n’est pas déclaré intégralement réussi.
- Aucun fichier préexistant du dépôt de référence n’est modifié. Accueil, bibliothèque, méthode, articles, questions, défi, mini-jeux, Roubaix, Explorer, Aral, Atlas et systèmes de sauvegarde sont conservés octet pour octet.

Limites : essais dans Chrome sur ordinateur avec émulation de tailles et du toucher ; pas de téléphone physique, Safari/iOS, Firefox ou lecteur d’écran réel. Les tests de stockage existants utilisent un DOM simulé ; aucune nouvelle recette exhaustive des parcours Explorer n’a été réalisée, puisque leurs fichiers sont inchangés. La vérification HTML/CSS est syntaxique, sans certification W3C. Les captures principales et les huit captures d’activités permettent la revue visuelle.

## Reproduire et préparer une publication ultérieure

Contrôle statique sans dépendance : `python scripts/test-strategies-static.py`.

Tests navigateur : installer Playwright et axe-core dans l’environnement de test, lancer le serveur, puis `node scripts/test-strategies-browser.cjs`. Variables optionnelles : `THOT_BASE_URL`, `THOT_BROWSER_EXECUTABLE`, `THOT_PLAYWRIGHT`, `THOT_AXE_PATH`, `THOT_OUTPUT_DIR`. Les dépendances de test ne sont pas livrées au navigateur des lecteurs.

L’entrée de bibliothèque est préparée dans `docs/strategies-bibliotheque-a-integrer.html.txt`. Elle n’est ni injectée dans le catalogue ni comptée parmi les articles publiés. Après autorisation seulement : intégrer cette carte, mettre à jour les registres éditoriaux et durées, ajouter la page au sitemap, renseigner sa date de publication réelle, retirer le statut local/noindex, puis refaire les contrôles de publication. Aucune de ces actions de publication n’a été effectuée.
