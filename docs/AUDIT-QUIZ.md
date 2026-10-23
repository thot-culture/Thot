# COMPTE RENDU POUR CHATGPT — THOT

Page examinée : **quiz**, `quiz.html`.
Branche **locale** : `work/audit-quiz`, créée depuis `work/audit-notre-methode`
(`66785ba`). L’accord utilisateur porte uniquement sur cette page.
**Aucune modification envoyée à GitHub, aucune publication publique.**

## Périmètre et contenus conservés

Analyse du HTML, du moteur `assets/site.js`, des trois banques de questions et des
règles pertinentes de `assets/site.css`. Les corrections amorcées avant la demande
d’un audit page par page, conservées dans `work/audit-global-en-attente`, ont été
relues et reprises uniquement maintenant, dans le périmètre du quiz.

Les **300 questions**, propositions, réponses attendues, indices et explications
sont conservés à l’identique. Les trois banques externes sont inchangées octet par
octet, ainsi que la portion du moteur contenant les questions intégrées. Tous les
fragments de texte HTML préexistants restent présents ; seuls des messages
d’assistance sont ajoutés. Aucun fait historique/scientifique ou crédit n’est
modifié ni réinterprété.

## Bugs identifiés et corrigés

1. **Migration destructive du défi quotidien** : l’ancienne migration enregistrait
   les statistiques avant de restaurer `daily`. La sauvegarde de migration est
   désormais effectuée après la lecture complète des champs.
2. **Statistiques écrasées entre onglets** : le moteur relit la sauvegarde avant
   de commencer/enregistrer une partie et se synchronise sur `storage`, le retour
   de visibilité et `pageshow`. Deux parties ouvertes avant la première fin
   conservent leurs deux résultats dans les scénarios testés.
3. **Défi terminé dans un autre onglet** : la seconde fin pouvait doubler les gains
   ou bloquer l’interface. Elle affiche maintenant le résultat de cet essai avec
   un message donnant le score déjà enregistré et **+0 XP** supplémentaire.
4. **Échec d’écriture silencieux** : un stockage lisible mais plein pouvait faire
   perdre la progression non enregistrée lors de sa relecture. Un état mémoire
   garde désormais ces résultats pendant la session et un avertissement indique
   qu’ils ne sont pas sauvegardés. Le texte affirmant la sauvegarde est masqué
   tant que cet avertissement est affiché.
5. **Renouvellement UTC** : une page laissée ouverte après un défi réussi pouvait
   garder le bouton désactivé au-delà de minuit. Un unique minuteur renouvelle
   l’interface à minuit UTC ; les retours sur la page le reprogramment.
6. **Fin après minuit** : les jours de défis terminés sont conservés séparément,
   pour empêcher une seconde récompense du même ancien défi. Une fin tardive ne
   remplace pas le résultat d’un jour plus récent. Le défi du jour courant reste
   disponible ; les missions de ce jour ne sont pas validées par un ancien défi.
7. **Badge « Sans-faute »** : un 5/5 quotidien ne débloquait pas ce badge, car il
   dépendait uniquement des records classiques. Une réussite classique ou
   quotidienne le débloque désormais durablement, sans modifier les records
   classiques avec les scores quotidiens.
8. **Progression accessible au dernier palier** : à exactement 900 XP, la barre
   visuelle était pleine mais ses valeurs ARIA décrivaient une progression nulle
   dans l’intervalle 900–901. Les valeurs accessibles décrivent maintenant une
   barre pleine à ce palier.

Ces corrections n’offrent pas de transaction atomique : `localStorage` reste un
stockage local sans verrou. Une lecture et une écriture exactement simultanées
entre deux onglets peuvent encore entrer en concurrence. Les tests couvrent les
enchaînements usuels, pas toutes les courses possibles du navigateur.

## Accessibilité, ergonomie et disponibilité

- Le focus arrive sur l’énoncé de chaque question ; la question est remise dans
  la zone visible avec une marge prévue pour l’en-tête. Le groupe de réponses est
  associé à cet énoncé et à sa consigne.
- Les annonces globales imbriquées des écrans question/résultat sont supprimées.
  Le retour de réponse conserve son statut ; le titre du résultat décrit son
  score, ses gains et les messages associés via `aria-describedby`.
- Le lien d’évitement vise un contenu principal explicitement focalisable.
- Les défilements explicites vers le quiz respectent la préférence de réduction
  des animations. Les commandes indice/badges/thèmes ont au moins 44 px de hauteur.
- La navigation mobile reste visible tant que son menu n’est pas initialisé.
  Fermeture par Échap, clic extérieur et sortie du focus ; gestion du changement
  de breakpoint et hauteur de menu limitée avec défilement.
- La disposition XP et l’en-tête de partie peuvent se replier sur petit écran.
- **22 commandes** sont désactivées dans le HTML jusqu’à l’initialisation réussie.
  Sans JavaScript, les liens restent utilisables et une explication est affichée.
  Si une banque de questions ne charge pas, le message de chargement devient
  explicite et les commandes restent désactivées ; une erreur est aussi levée
  dans la console. L’utilisateur dispose de liens pour recharger ou lire les articles.
- Le paramètre de version du moteur devient `?v=quiz-audit-2026-10-23`, afin qu’un
  futur déploiement ne combine pas le nouveau HTML avec un ancien moteur en cache.

Les changements de focus, de responsive et d’annonces sont implémentés et testés
en simulation ; leur comportement réel avec navigateur/lecteur d’écran reste à
contrôler.

## Stockage : détails utiles pour reprendre le travail

Clé inchangée : `thot_v2_stats`.

- Champ ajouté : `daily.completed`, objet `date UTC -> score de 0 à 5`. Il conserve
  les défis terminés, y compris après changement de jour. La migration reprend
  uniquement la dernière date et le score déjà connus ; elle ne reconstitue pas
  de scores historiques inconnus.
- Champ ajouté : `progression.hasPerfectGame`, booléen. Il est initialisé à partir
  d’une réussite 5/5 connue dans les records ou les résultats quotidiens.
- `storageDirty` et `storageUnavailable` restent en mémoire uniquement. Quand une
  écriture échoue, une ancienne sauvegarde ne remplace pas les résultats de session.
  La synchronisation avec les autres onglets est donc limitée pendant cet échec.
- Barème préservé : 10 XP/réponse correcte, 5 XP/partie, 10 XP/sans-faute et
  10 XP/mission. Le minuteur n’accorde aucun gain et ne termine aucune partie.

## Fichiers de cette intervention

- `quiz.html` : initialisation progressive, aide, références ARIA et CSS isolé.
- `assets/site.js` : corrections du moteur et de sa persistance.
- `assets/quiz.css` : nouveau fichier, tous les ajustements limités à `.quiz-page`.
- `scripts/test-quiz.mjs` : tests de régression avec DOM et horloge simulés.
- `docs/AUDIT-QUIZ.md` : ce compte rendu.
- `docs/PROGRESSION.md` : progression actualisée.

**Effets sur les autres pages : aucun fichier de page ni ressource partagée n’est
modifié.** `assets/site.js` est chargé uniquement par `quiz.html` ; `site.css`
reste inchangé. Les trois banques de questions sont inchangées. Les corrections
déjà livrées sur les trois pages précédentes sont conservées.

## Tests exécutés et résultats

```sh
node scripts/test-quiz.mjs
node --check assets/site.js
node --check assets/questions-facile.js
node --check assets/questions-intermediaire.js
node --check assets/questions-expert.js
git diff --check
```

Tous passent. Le test exécute le vrai moteur avec les IDs et boutons du vrai HTML,
dans un **DOM simulé**, sans réseau, installation ou temporisation réelle.

- Structure des 300 questions, sans doublons ; **20 questions par couple
  thème/niveau**. Les faits des questions ne sont pas réévalués éditorialement.
- **18 parties** complètes avec les cinq thèmes/mélange et les trois niveaux,
  scores mixtes, corrections, focus et affichage des résultats.
- Trois formats : QCM, vrai/faux, réponses multiples ; indice, validation,
  protection contre une seconde réponse et progression de partie.
- Cycle des 20 questions d’un thème sans répétition, puis évitement des cinq
  dernières au cycle suivant.
- Migration conservant le défi et la série ; sauvegarde invalide ; stockage
  refusé et stockage lisible mais non inscriptible.
- Deux parties classiques ouvertes ensemble ; deux défis identiques ouverts
  ensemble ; seconde fin à +0 XP ; synchronisation et effacement de stockage.
- Minuit UTC, défi précédent achevé après minuit, fin d’un ancien défi après celui
  du jour, conservation du dernier résultat et un seul minuteur.
- Barème : 85 XP après un défi parfait avec deux missions, puis 160 après une
  partie libre parfaite avec la troisième mission ; pas de mission payée deux fois.
  Badge conservé après un défi suivant moins réussi, records et taux de réussite.
- Barre XP à 900, menu, focus, réduction des animations et banque de questions absente.

Contrôles ponctuels supplémentaires avec Python standard et comparaison Git :
**19 liens/ressources internes**, **4 lectures recommandées**, ancres, IDs uniques,
références ARIA, métadonnées, image sociale PNG locale 1200×630 ; conservation des
textes et questions. Les URLs sont contrôlées dans les fichiers, pas par HTTP.

Un contrôle négatif détecte bien la perte du défi avec le moteur initial :

```sh
git show work/audit-notre-methode:assets/site.js > /tmp/thot-quiz-avant-audit.js
node scripts/test-quiz.mjs --engine /tmp/thot-quiz-avant-audit.js
```

Cette comparaison doit échouer sur « Migration quotidienne ». La commande normale
de test doit réussir et ne dépend pas de Git.

## Limites et recommandations

Chromium quitte au lancement dans le sandbox avec `setsockopt: Operation not
permitted`, puis `SIGTRAP`. **Aucun rendu réel ordinateur/mobile, capture, test
avec lecteur d’écran ou contrôle visuel du CSS n’a pu être effectué.** Les tests
simulés ne remplacent pas ces vérifications.

Pas de mesure Lighthouse/Core Web Vitals, de vérification HTTP publique ou de
contrôle d’indexation Google. Les métadonnées SEO existantes sont préservées.
Les textes des questions constituent l’essentiel du JavaScript : environ 172 ko
avant compression pour le moteur et les banques. La nouvelle feuille CSS ajoute
environ 1,8 ko et une requête ; aucun framework ni service externe n’est ajouté.
Les changements répondent à des bugs et à l’accessibilité ; aucun gain de vitesse
mesuré n’est annoncé.

Recommandations : tester à 320/390/768/1440 px et avec zoom 200 % ; vérifier les
trois formats, l’indice et les corrections au clavier/lecteur d’écran ; ouvrir deux
onglets ; simuler un stockage refusé ; tester la transition UTC et le chargement
incomplet dans un navigateur. Mesurer ensuite performances et contrastes rendus.

## Consulter le résultat, progression et arrêt

Archive : `/workspace/THOT-quiz-audit.zip`. L’extraire puis ouvrir `Thot/quiz.html`.
Pour vérifier la persistance et les onglets de façon représentative sur son propre
ordinateur, lancer `python -m http.server 8000` dans `Thot`, puis ouvrir
`http://localhost:8000/quiz.html`. Le comportement du stockage sous `file://` peut
différer entre navigateurs. Aucun serveur de prévisualisation n’a été lancé avec
succès dans cet environnement.

Patch limité à cette intervention : `/workspace/THOT-quiz.patch`.
L’archive conserve les trois pages déjà corrigées ; les six autres pages restent
inchangées.

Progression : accueil, bibliothèque, Notre méthode et quiz sont **Vérifiée et
corrigée** pour le code et les tests locaux décrits. La validation visuelle reste
en attente. Les six autres pages sont **À vérifier**, voir `PROGRESSION.md`.

Arrêt après le quiz. La page suivante envisagée est `quiz-autrices.html`, uniquement
après un nouvel accord explicite. Toute correction supplémentaire demandée sur le
quiz est prioritaire avant la suite.
