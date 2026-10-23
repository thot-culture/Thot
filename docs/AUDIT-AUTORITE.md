# COMPTE RENDU POUR CHATGPT — THOT

Page examinée : **Autorité**, `articles/autorite.html`.
Audit du 23 octobre 2026, branche `work/audit-final-site`, base `066d580`.
L’utilisateur a autorisé la fin de toutes les pages restantes. Aucune publication.

## Bugs identifiés et corrigés

- Le HTML utilisait `.authorite-game`, mais plusieurs règles CSS visaient
  `.autorite-game` : cadre, espacement, titre et adaptation mobile ne s’appliquaient
  pas. Les sélecteurs correspondent maintenant au HTML.
- Sous 860 px, les trois scènes étaient découpées verticalement alors que le
  fichier source est un triptyque horizontal. Le cadrage utilise désormais les
  positions horizontales 0/50/100 %. L’image source a été inspectée directement ;
  le rendu CSS dans un navigateur reste à confirmer.
- Les neuf boutons paraissaient actifs sans script. Ils restent désactivés jusqu’à
  l’installation des interactions. Les situations ou réactions inconnues ne sont
  pas activées et ne provoquent plus un accès à une explication absente.

## Améliorations

Sur téléphone, chaque carte place l’image au-dessus du texte au lieu de réserver
une colonne de 96 px. Les choix ont une hauteur minimale de 44 px. La cible du
lien d’évitement est focalisable. Les neuf explications, les trois situations,
les développements natifs et l’absence de notation sont préservés.

Le style commun améliore aussi le lien d’évitement, les liens du pied de page,
les cibles de navigation et les proportions des illustrations.

## Fichiers modifiés

- `articles/autorite.html`
- `assets/autorite.css`
- `assets/autorite-activity.js`
- `assets/article.css` : partagé avec les quatre autres articles et le jeu dédié.
- Ajout : `scripts/test-autorite.mjs` et présent rapport.

## Tests et résultats

`node scripts/test-autorite.mjs` réussit : trois situations × trois réactions,
neuf explications d’origine, exclusivité `aria-pressed` dans chaque cas,
indépendance des cas, clics répétés et données invalides laissées inactives.

`node scripts/check-site.mjs`, `python3 scripts/check-editorial.py` et
`git diff --check` réussissent. Le contrôle éditorial retrouve les mêmes
2 277 mots et 39 liens dans le corps de page, hors scripts. Les métadonnées,
le H1, le canonical, le JSON-LD et les références locales sont cohérents.

## Limites, conséquences et recommandations

Le DOM est simulé. Pas de rendu réel ordinateur/mobile, de lecteur d’écran ni de
mesure Lighthouse : Chromium échoue au démarrage dans cet environnement.
L’exactitude scientifique des références n’a pas été réévaluée.

Les changements de `autorite.css` et `autorite-activity.js` sont propres à cette
page ; ceux d’`article.css` affectent les six pages mentionnées ci-dessus.
Contrôler les trois scènes à 320/390/768/1440 px, le zoom 200 % et le clavier.

Consulter `/articles/autorite.html` depuis le serveur local décrit dans
[BILAN-FINAL.md](BILAN-FINAL.md). État du code : **Vérifiée et corrigée** ;
validation visuelle réelle en attente.

## Mise à jour supplémentaire

Une passe de recherche, navigation mobile et clavier complète cette version.
Les changements propres à cette page, les fichiers et les tests sont détaillés
dans [AMELIORATIONS-NAVIGATION-LECTURE.md](AMELIORATIONS-NAVIGATION-LECTURE.md).
La livraison courante est `THOT-site-ameliore.zip` ; aucune publication effectuée.
