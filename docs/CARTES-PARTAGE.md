# Cartes de partage THOT

Les cinq articles disposent chacun d’une image PNG Open Graph de **1200 × 630 pixels** dans `assets/social-cards/`. Le modèle associe un titre court, le logo texte THOT, la signature « La curiosité n’a pas de limites » et une composition géométrique propre au sujet. Palette : bleu nuit `#17243A`, crème `#F8F6F1`, or `#B89558`.

Ces compositions sont originales et produites par le générateur. Elles ne comportent aucune photographie, image externe, portrait inventé ou imitation de document d’archive. Les ornements servent d’évocation graphique ; le motif des pieuvres n’est pas une planche scientifique à l’échelle.

## Fichiers et textes alternatifs

| Fichier dans `assets/social-cards/` | Titre dessiné | Texte alternatif conseillé | Poids |
| --- | --- | --- | ---: |
| `autorite.png` | Face à l’autorité, pourquoi réagit-on différemment ? | THOT — Face à l’autorité, pourquoi réagit-on différemment ? Trois trajectoires géométriques sous un même cercle. | 45 187 octets |
| `autrices-pseudonymes.png` | Autrices, pourquoi un nom d’homme ? | THOT — Autrices, pourquoi un nom d’homme ? Deux lettres A sur des feuillets géométriques superposés. | 35 875 octets |
| `pieuvres-couleur.png` | Comment les pieuvres changent de couleur | THOT — Comment les pieuvres changent de couleur. Un motif circulaire évoque les cellules colorées de leur peau. | 45 557 octets |
| `puissance-etats-unis.png` | Les limites de la puissance américaine | THOT — Les limites de la puissance américaine. Un globe géométrique relié à plusieurs points. | 44 256 octets |
| `roubaix-1917.png` | Roubaix, 1917 / Vivre sous l’occupation | THOT — Roubaix, 1917 : vivre sous l’occupation. La date 1917 se détache sur une trame urbaine abstraite. | 39 296 octets |

Les titres courts reprennent le sujet des H1 existants et ne remplacent pas les titres éditoriaux des pages. Le `/` dans la ligne Roubaix indique un saut de ligne. Les données du générateur peuvent être exportées avec `--list` pour renseigner les métadonnées du site. Les chemins d’images sont relatifs au dépôt ; les métadonnées Open Graph des pages doivent utiliser leurs URL publiques absolues.

## Dépendances de développement

La génération demande **Python 3.10 ou supérieur**, **Pillow 12.3.0** et les fichiers TTF **DejaVu 2.37**. Aucune dépendance Python n’est nécessaire au fonctionnement du site publié : les PNG sont servis comme des fichiers statiques. Le générateur ne télécharge rien.

Dans un environnement de développement Python :

```sh
python3 -m pip install 'Pillow==12.3.0'
```

Sur Debian/Ubuntu, les trois polices proviennent du paquet `fonts-dejavu-core` (version utilisée : `2.37-8`) et sont attendues à ces chemins explicites :

```text
/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf
/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf
/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
```

Le script n’utilise pas de substitution de police silencieuse. Pour un autre système, installer les mêmes fichiers DejaVu dans un dossier disponible et le transmettre avec `--font-directory /chemin/vers/dejavu`. Les glyphes français, accents et apostrophes typographiques sont conservés. Empreintes SHA-256 des fichiers utilisés :

| Police | SHA-256 |
| --- | --- |
| DejaVuSerif.ttf | `8cb29f7db250ebb2551a6ce2c1e0bfd5a0eb520e9e233370db0493e82e1f36f7` |
| DejaVuSans.ttf | `57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e` |
| DejaVuSans-Bold.ttf | `a4c5bc453ca281d90ea079e596da7ae0dfeb5777497c29ec254e76d97ff6f890` |

DejaVu reprend les polices Bitstream Vera sous leur licence libre **Bitstream Vera** ; les modifications DejaVu sont dans le domaine public. La notice locale consultée est `/usr/share/doc/fonts-dejavu-core/copyright`, et le projet est documenté sur <https://dejavu-fonts.github.io/License.html>. Les fichiers de polices restent une dépendance système et ne sont pas redistribués dans ce dépôt. Les PNG contiennent leur rendu, sans embarquer de fichier de police.

## Régénérer et vérifier

Depuis la racine du dépôt :

```sh
# Régénérer les cinq PNG.
python3 scripts/generate-social-cards.py

# Régénérer un seul sujet.
python3 scripts/generate-social-cards.py autorite

# Vérifier format, dimensions, poids et correspondance exacte avec le générateur.
python3 scripts/generate-social-cards.py --check

# Afficher les titres, textes alternatifs et chemins en JSON sans créer de fichier.
python3 scripts/generate-social-cards.py --list
```

Le modèle dessine à deux fois la résolution finale, puis réduit avec Lanczos et quantifie sur 256 couleurs. Il mesure les glyphes réels, limite les titres à trois lignes, ajuste leur taille et refuse un débordement dans la zone du titre. Le contrôle refuse également toute carte de 200 000 octets ou plus. Les fichiers actuels sont tous sous 46 Ko.

Avec les mêmes fichiers de polices et la même version de Pillow, deux générations donnent les mêmes octets. `--check` compare ce rendu attendu aux PNG suivis par Git sans les réécrire. Une mise à jour volontaire des outils de rendu peut modifier les octets : régénérer, examiner les images et actualiser les indications de version/poids après validation.

Les cinq fichiers finaux ont été ouverts et examinés visuellement : accents et ponctuation corrects, titres lisibles, aucun débordement, compositions distinctes et dimensions conformes. Cette vérification porte sur les PNG ; elle ne remplace pas un aperçu du partage fourni par une plateforme sociale.

## Ajouter un article

1. Lire le H1 et choisir un titre court fidèle, réparti sur une à trois lignes. Ajouter une entrée `Card` dans le dictionnaire `CARDS` du générateur, avec la catégorie et le texte alternatif décrivant le contenu visible.
2. Ajouter au même script une branche de composition originale dans `draw_artwork()`, en conservant le cadre, les marges et la palette. Utiliser uniquement typographie, lignes, courbes et formes géométriques.
3. Générer la carte puis exécuter `--check`. Examiner le PNG à sa taille finale et en réduction pour vérifier la lisibilité ; raccourcir le titre si nécessaire.
4. Déclarer la nouvelle image et son texte alternatif dans les données et métadonnées de l’article, avec une URL absolue publique. Ne pas remplacer les photographies et crédits éditoriaux de l’article par cette carte de partage.
5. Mettre à jour le tableau de ce document et lancer les contrôles habituels du site avant publication.
