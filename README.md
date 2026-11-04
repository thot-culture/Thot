# THOT

La curiosité n’a pas de limites. Articles documentés, quiz et expériences interactives.

[Consulter le site](https://thot-culture.github.io/Thot/) · [Explorer](https://thot-culture.github.io/Thot/explorer.html) · [Signaler une erreur](https://thot-culture.github.io/Thot/contact.html)

## Contenus

- Articles et activités : histoire, géopolitique, sciences et littérature.
- Quiz de 300 questions, défi quotidien et jeu des pseudonymes.
- Explorer : enquête documentaire sur la mer d’Aral et Atlas de l’expansion de Rome.

## Développement

Site statique HTML/CSS/JavaScript, sans service de collecte éditoriale. Python 3.12 et Node.js sont utilisés pour la génération et les contrôles.

```sh
python -m pip install -r requirements-tools.txt
python scripts/preview.py
# http://127.0.0.1:8765/Thot/
python scripts/build-explorer-reconstruction.py
python scripts/site_chrome.py
node scripts/check-site.mjs
python scripts/build-explorer-reconstruction.py --check
python scripts/site_chrome.py --check
python scripts/test-portabilite.py
```

Les pages Explorer sont générées : modifier leurs sources dans `scripts/` et `assets/explorer-v2/`, puis les reconstruire. Les menus et liens d’information sont statiques, y compris sans JavaScript ; `site_chrome.py` les harmonise après toute génération de page.

L’identité commune (marque, navigation, pieds de page, cartes et actions éditoriales) est définie dans `assets/visual-system.css`, chargée en dernier sur les 18 pages. Après une modification, lancer `python scripts/site_chrome.py` pour actualiser l’empreinte de la feuille de style. Les styles propres aux cartes géographiques et aux états des jeux restent dans leurs modules. Voir [le bilan de cohérence visuelle](docs/HARMONISATION-VISUELLE-20261103.md).

Les scripts `test-*.mjs` et `test-*.py` couvrent les activités, les corpus et les navigateurs. Les recettes historiques fixent parfois l’intégrité à un ancien commit : distinguer ces contrôles de conservation des tests de fonctionnement. Les tests navigateur nécessitent les dépendances de `requirements-browser.txt` et les navigateurs Playwright.

## Publication et sauvegarde

Le [guide de publication des articles](GUIDE-PUBLICATION-ARTICLES.md) décrit le travail courant (HTML, notice et médias), la synchronisation de la bibliothèque et du sitemap et les contrôles avant PR. Le [rapport d’audit final](docs/AUDIT-FINAL-THOT.md) distingue les défauts corrigés, les mesures réelles et les réserves.

Préparation du référencement : [audit SEO](docs/AUDIT-SEO-THOT.md), [configuration de Google Search Console](docs/GOOGLE-SEARCH-CONSOLE.md), [stratégie éditoriale et suivi](docs/STRATEGIE-SEO-THOT.md). La propriété prévue est `https://thot-culture.github.io/Thot/` ; aucune connexion Google ni garantie d'indexation n'est implicite.

```sh
python scripts/sync-publication.py --check
python scripts/test-publication.py
python scripts/check-seo.py
python scripts/test-seo.py
# Comparer les anciens contenus au commit choisi avant les modifications :
python scripts/check-conservation.py --revision SHA_DU_SOCLE
```

Les contrôles actuels sont exécutés par `verification-portable.yml` (Linux/Windows) et `audit-final.yml` (navigateurs, sauvegarde, accessibilité et mesures). Les recettes historiques en échec restent documentées ; elles n’ont pas été désactivées.


GitHub Pages publie la racine de `main`. Avant publication, conserver le commit précédent dans une branche `backup/`, tester sous le préfixe `/Thot/`, puis vérifier le déploiement et les pages publiques. Ne pas forcer le push ni réécrire l’historique.

## Sources, droits et confidentialité

Les références, crédits et licences sont indiqués près des documents et dans les registres de sources. Les licences des médias, polices et jeux de données sont distinctes ; aucune licence globale de réutilisation de tous les contenus n’est accordée par ce README.

Les statistiques du quiz et le dossier Aral restent dans le navigateur. Les signalements GitHub sont publics. Voir les pages [Confidentialité](https://thot-culture.github.io/Thot/confidentialite.html) et [Informations légales](https://thot-culture.github.io/Thot/mentions-legales.html), cette dernière explicitement partielle tant que les informations et choix nécessaires ne sont pas validés.
