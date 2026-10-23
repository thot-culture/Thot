# COMPTE RENDU POUR CHATGPT — THOT

Page examinée : **Roubaix en 1917**, `articles/roubaix-1917.html`.
Audit du 23 octobre 2026, branche `work/audit-final-site`, base `066d580`.
Aucune publication sur le site public.

## Bugs identifiés et corrigés

- Le sommaire mobile masquait son lien actif sans transférer le focus. Son
  script intégré est remplacé par le module partagé corrigé : focus vers la
  section avant fermeture, navigation native et clics modifiés conservés.
- Les définitions du glossaire sont maintenant lisibles sans script, puis
  repliées et activées seulement après initialisation réussie.
- Les huit dates semblaient actives lorsque leur script ne fonctionnait pas.
  Elles sont désactivées jusqu’à l’initialisation complète. L’événement statique,
  les sources et le message sans JavaScript restent disponibles.
- Tous les liens photographiques créés par `article-media.js` portaient le même
  nom accessible générique, qui masquait l’alt de l’image. Leur nom inclut
  désormais cet alt, permettant de distinguer les documents.

## Améliorations et contenu préservé

La couverture utilise la copie locale de la même carte postale ELD documentée
dans `GUIDE-IMAGES.md`, dimensions 1200 × 773, 150 880 octets. Le catalogue garde
la notice Commons, la date prudente, le crédit et la licence d’origine.
Les chemins locaux sont résolus depuis l’URL d’`article-media.js`, y compris sous
le préfixe `/Thot/`. Les autres documents externes restent inchangés.

La cible d’évitement devient focalisable. Le contraste du glossaire dans
l’en-tête, le pied de page et les proportions d’images sont améliorés par les
styles communs. Les huit événements, leurs nuances et leurs références sont
intégralement préservés.

## Fichiers modifiés

- `articles/roubaix-1917.html`
- `assets/roubaix-frise.js`
- `assets/article-media.js`, `assets/illustrations.json`
- `assets/puissance-sommaire.js`, `assets/glossaire-interactif.js`,
  `assets/glossaire-interactif.css`, `assets/article.css` : composants partagés.
- Ajouts : `scripts/test-article-timelines.mjs`,
  `scripts/test-article-components.mjs`, `scripts/test-article-navigation.mjs`
  et présent rapport.

## Tests et résultats

Les trois tests d’articles ci-dessus réussissent : huit événements protégés par
empreinte et comparés aux données d’origine, références existantes, clics,
flèches/Home/End, rebouclage, focus et activation progressive ; glossaire ;
sommaire ; chemins d’images relatifs/absolus, priorités de chargement, noms
accessibles, crédits et replis d’erreur image/réseau/HTTP/JSON/notice incomplète.
Ces échecs réseau sont simulés et ne constituent pas une requête aux serveurs.

Contrôles global, éditorial et espaces Git réussis. Le corps conserve
2 523 mots et 35 liens éditoriaux. Le catalogue conserve tous ses textes, crédits,
licences et notices. Alt, JSON-LD et métadonnées restent identiques et cohérents.

## Limites, conséquences et recommandations

Rendu mobile/ordinateur, décalage de couverture, lecteur d’écran et accès réel
aux documents externes non vérifiés. Chromium ne démarre pas dans cet
environnement ; aucune mesure Lighthouse. Sans JavaScript, seul l’événement
statique de la frise est affiché ; l’article complet reste consultable.
Le parcours visuel a été relu, sans test d’exécution dédié.

Le glossaire et le sommaire affectent également États-Unis. Le moteur médias est
actuellement chargé seulement par Roubaix. Les règles d’illustrations et le pied
de page affectent les autres articles et le jeu dédié. Ces effets ont été annoncés
avant application et les tests de régression passent.

Consulter `/articles/roubaix-1917.html` sur le serveur local décrit dans
[BILAN-FINAL.md](BILAN-FINAL.md). Vérifier la couverture à 320/390/768/1440 px,
le zoom et le parcours clavier. État du code : **Vérifiée et corrigée** ;
validation visuelle réelle en attente.

## Mise à jour supplémentaire

Une passe de recherche, navigation mobile et clavier complète cette version.
Les changements propres à cette page, les fichiers et les tests sont détaillés
dans [AMELIORATIONS-NAVIGATION-LECTURE.md](AMELIORATIONS-NAVIGATION-LECTURE.md).
La livraison courante est `THOT-site-ameliore.zip` ; aucune publication effectuée.
