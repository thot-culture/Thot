# THOT — Stabilisation et retrait temporaire d’Explorer

Mission du 26 octobre 2026, avec autorisation explicite de sauvegarde, corrections et publication.
Base publique : `8157d53dbbe6fd9852b84079f87d28da8469d8c5`.
Branche : `work/stabilisation-retrait-explorer-20261026`.

## Sauvegarde et retrait

La branche `backup/thot20-complet-20261026-8157d53` conserve tout THOT 2.0.
Une archive ZIP et un bundle Git complet se trouvent dans `/workspace/THOT-STABILISATION-20261026/`.
Le bundle a été vérifié et cloné dans un dossier indépendant ; les fichiers essentiels correspondent à l’archive ZIP testée.
La restauration n’exige pas de reconstruire les ressources depuis leurs seules captures.

Douze pages autonomes sont retirées, ainsi que leurs liens de navigation, encarts, entrées de sitemap et dépendances devenues inutiles.
Le détail est dans `EXPLORER-RETRAIT-TEMPORAIRE-20261026.json`.
Les anciennes URL doivent répondre 404 sur GitHub Pages avec une explication de retrait temporaire,
sans redirection automatique et sans les présenter comme des ressources disponibles.
Un statut HTTP 503 spécifique à chaque ancienne URL ne peut pas être configuré avec cet hébergement statique.

Restent dans les articles : la frise et le lecteur de Roubaix ; le schéma manipulable du chromatophore et les sept repères scientifiques ;
le comparateur ; les jeux d’autorité ; le jeu des autrices ; les quiz et le défi quotidien.
Trois fichiers de `assets/explorer/` restent nécessaires au schéma des pieuvres : ils n’exposent aucun catalogue ni page autonome.
Le lien du schéma rejoint maintenant l’ancre de l’article. Le libellé des sommaires devient « Sommaire ».
Aucune nouvelle version d’Explorer n’est développée.

## Corrections documentées

- Bagram : retrait achevé le **2 juillet 2021**, harmonisé dans les deux présentations de la frise et le panneau détaillé.
  SIGAR 23-16-IP, p. 4 (p. 11 du PDF), et 23-05-IP, p. 3, le confirment.
- Comparateur : acteurs en présence, objectif des États-Unis et de leurs partenaires, moyens, résultat et limites sont distingués.
  Les quatre critères sont conservés, sans score de puissance. Le cas iranien reste hors comparaison historique directe ; son actualité n’est pas réévaluée.
- Roubaix : « un corpus de **972 affiches** » rétabli après lecture de la description de fonds L’Armarium ; glossaire intact.
  Quatre notices individuelles retrouvées dans l’index sont reliées avec un avertissement d’accès direct non confirmé.
  La cinquième, `AFF_001_D_0685`, reste à retrouver. Aucun dépouillement intégral des affiches n’est revendiqué.
- Burger : expérience en **2006**, publication en **2009**, vérifiées dans le texte original. Le protocole partiel à 150 volts simulés est conservé.

Les nouveaux amendements exacts sont dans `CORRECTIONS-AUDIT-20261026.json` et le manifeste cumulatif.
Le reste des articles et des bibliographies reste comparé à la référence protégée ; les dates avancent uniquement pour les trois périmètres corrigés.
Les indisponibilités et accès alternatifs sont décrits dans `REEXAMEN-SOURCES-20261026.json`.
Les copies SIGAR GovInfo et ecoi.net et la version française institutionnelle de la Feuille de route de coalition ont été effectivement ouvertes.

## Quiz et portabilité

Les 300 questions, choix, bonnes réponses, ordre et niveaux sont conservés.
Dix explications décalées ont été corrigées dans la banque intermédiaire, avec manifeste exact.
Le seul ajout au moteur est l’appel facultatif d’affichage de références ; sélection, stockage, scores et règles quotidiennes restent identiques.

Le registre couvre 300 questions : **24 vérifiées**, **1 à revoir** (étymologie populaire du café), **275 non examinées**.
Les sources apparaissent après la réponse uniquement si le statut et la copie de contenu correspondent encore à la question.
Une seule vérification repose sur un extrait institutionnel indexé avec accès direct restreint : origine du symbole Fe.
Les 24 faits ne doivent pas être présentés comme un audit scientifique des 300 questions.

UTF-8 explicite pour tous les outils Python, sorties CLI configurées, polices DejaVu fournies avec licence et empreintes,
dépendances de génération fixées, fins de ligne LF et dossiers d’environnement exclus des inventaires de pages.
Voir `GENERATION-PORTABLE.md` pour les commandes et les tests Windows/Ubuntu.

## Recette et publication

Les preuves détaillées sont conservées dans `/workspace/THOT-STABILISATION-20261026/tests/` :
contrôles statiques, conservation éditoriale, quiz, génération, chemins avec espaces et encodage legacy ;
Chromium réel aux largeurs 320/390/768/1440 px sur fixtures locales ; référence après réponse, garde de contenu périmé,
défi quotidien complet, schémas, comparateur, jeux, navigation, replis sans JavaScript et panne d’image.
Les captures sont examinées ; le navigateur réel sur fixtures n’est pas une navigation publique ni un téléphone physique.

Le workflow de génération Windows/Ubuntu et le déploiement GitHub Pages doivent être contrôlés pour le commit exact.
Après publication, contrôler les dix pages conservées, les ressources et les ancres par empreinte,
ainsi que les douze anciennes URL qui doivent répondre 404. Le rapport final consigne les résultats effectivement obtenus.
Lecteur d’écran audio, Safari/iOS et zoom navigateur à 200 % ne sont pas couverts par cette recette.
