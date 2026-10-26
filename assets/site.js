    'use strict';
    const originalQuestions = [
      {level:'expert',cat:'histoire',q:'Quelle cité grecque met fin à la domination militaire spartiate lors de la bataille de Leuctres, en 371 av. J.-C. ?',a:['Athènes','Thèbes','Corinthe','Argos'],correct:1,why:'À Leuctres, l’armée thébaine commandée notamment par Épaminondas bat les Spartiates. Cette victoire bouleverse l’équilibre des puissances grecques.'},
      {level:'intermediaire',cat:'histoire',q:'En quelle année la Magna Carta est-elle scellée en Angleterre ?',a:['1066','1215','1453','1689'],correct:1,why:'La Magna Carta est scellée en 1215 sous Jean sans Terre. Elle devient un texte de référence dans l’histoire des limites imposées au pouvoir royal.'},
      {level:'facile',cat:'histoire',q:'Quel événement parisien du 14 juillet 1789 est devenu un symbole de la Révolution française ?',a:['Le sacre de Napoléon','La prise de la Bastille','La bataille de Waterloo','La Commune de Paris'],correct:1,why:'La prise de la Bastille, le 14 juillet 1789, est l’un des événements emblématiques du début de la Révolution française.'},
      {level:'facile',cat:'histoire',q:'Où l’archiduc François-Ferdinand est-il assassiné en 1914 ?',a:['Vienne','Berlin','Sarajevo','Prague'],correct:2,why:'L’assassinat a lieu à Sarajevo, le 28 juin 1914. Il déclenche une crise diplomatique qui mène à la Première Guerre mondiale.'},
      {level:'intermediaire',cat:'histoire',q:'En quelle année la pierre de Rosette est-elle découverte ?',a:['1799','1822','1889','1922'],correct:0,why:'Des soldats français découvrent la pierre de Rosette en 1799. Elle contribuera au déchiffrement des hiéroglyphes, notamment grâce à Champollion.'},
      {level:'facile',cat:'geographie',q:'Quelle est la capitale de l’Australie ?',a:['Sydney','Melbourne','Canberra','Perth'],correct:2,why:'Canberra est la capitale fédérale de l’Australie. Sydney et Melbourne sont plus peuplées, mais ne sont pas la capitale.'},
      {level:'intermediaire',cat:'geographie',q:'Quels sont les deux pays qui entourent la Mongolie ?',a:['Chine et Russie','Chine et Inde','Russie et Kazakhstan','Inde et Pakistan'],correct:0,why:'La Mongolie est enclavée entre la Russie au nord et la Chine au sud, à l’est et à l’ouest.'},
      {level:'intermediaire',cat:'geographie',q:'Dans quelle mer le Danube se jette-t-il ?',a:['Mer du Nord','Mer Baltique','Mer Adriatique','Mer Noire'],correct:3,why:'Le Danube traverse ou borde plusieurs pays européens avant de former un vaste delta sur la mer Noire.'},
      {level:'intermediaire',cat:'geographie',q:'Quel pays est entièrement enclavé dans l’Afrique du Sud ?',a:['Eswatini','Lesotho','Botswana','Namibie'],correct:1,why:'Le Lesotho est totalement entouré par l’Afrique du Sud. L’Eswatini possède aussi une frontière avec le Mozambique.'},
      {level:'expert',cat:'geographie',q:'Quelle ville est la capitale constitutionnelle de la Bolivie ?',a:['La Paz','Santa Cruz','Sucre','Cochabamba'],correct:2,why:'Sucre est la capitale constitutionnelle de la Bolivie, tandis que La Paz accueille le gouvernement et le parlement.'},
      {level:'facile',cat:'sciences',q:'Quel gaz est le plus abondant dans l’atmosphère terrestre ?',a:['Oxygène','Azote','Dioxyde de carbone','Argon'],correct:1,why:'L’azote représente environ 78 % de l’atmosphère terrestre, contre environ 21 % pour l’oxygène.'},
      {level:'facile',cat:'sciences',q:'Combien de cœurs possède une pieuvre ?',a:['Un','Deux','Trois','Quatre'],correct:2,why:'La pieuvre possède trois cœurs : deux dirigent le sang vers les branchies et un vers le reste du corps.'},
      {level:'facile',cat:'sciences',q:'Pourquoi Mars paraît-elle rouge ?',a:['Ses océans','Le fer oxydé de sa surface','Son atmosphère de méthane','La lumière de Jupiter'],correct:1,why:'La poussière et les roches martiennes contiennent des oxydes de fer, responsables de cette couleur rougeâtre.'},
      {level:'intermediaire',cat:'sciences',q:'Quelle est la vitesse approximative de la lumière dans le vide ?',a:['3 000 km/s','30 000 km/s','300 000 km/s','3 000 000 km/s'],correct:2,why:'La lumière se déplace dans le vide à environ 299 792 km/s. En une seconde, elle ferait plus de sept fois le tour de la Terre.'},
      {level:'facile',cat:'sciences',q:'Que signifie le A dans ADN ?',a:['Aminé','Acide','Atomique','Actif'],correct:1,why:'ADN signifie « acide désoxyribonucléique ». Cette molécule contient l’information génétique des êtres vivants.'},
      {level:'facile',cat:'arts',q:'Qui a peint Guernica ?',a:['Salvador Dalí','Pablo Picasso','Joan Miró','Francisco de Goya'],correct:1,why:'Picasso peint Guernica en 1937, après le bombardement de la ville basque pendant la guerre d’Espagne.'},
      {level:'intermediaire',cat:'arts',q:'Qui a composé La Flûte enchantée ?',a:['Beethoven','Vivaldi','Mozart','Bach'],correct:2,why:'La Flûte enchantée est un opéra de Mozart créé à Vienne en 1791, quelques mois avant sa mort.'},
      {level:'facile',cat:'arts',q:'Quel écrivain est l’auteur des Misérables ?',a:['Émile Zola','Honoré de Balzac','Victor Hugo','Gustave Flaubert'],correct:2,why:'Victor Hugo publie Les Misérables en 1862. Jean Valjean, Cosette et Javert en sont parmi les personnages les plus connus.'},
      {level:'intermediaire',cat:'arts',q:'Quel peintre a réalisé Impression, soleil levant ?',a:['Claude Monet','Auguste Renoir','Edgar Degas','Paul Cézanne'],correct:0,why:'Cette toile de Claude Monet, présentée en 1874, donne son nom au mouvement impressionniste.'},
      {level:'facile',cat:'arts',q:'Qui a peint La Joconde ?',a:['Raphaël','Michel-Ange','Léonard de Vinci','Le Caravage'],correct:2,why:'Léonard de Vinci peint La Joconde au début du XVIe siècle. L’œuvre est aujourd’hui conservée au musée du Louvre.'},
      {level:'facile',cat:'insolite',q:'Quel animal est particulièrement associé au dieu égyptien Thot ?',a:['Le lion','L’ibis','Le scarabée','Le crocodile'],correct:1,why:'Thot, dieu égyptien lié au savoir, à l’écriture et au calcul, est souvent représenté avec une tête d’ibis ; il peut aussi apparaître sous la forme d’un babouin.'},
      {level:'intermediaire',cat:'insolite',q:'En quelle année ont lieu les premiers Jeux olympiques modernes ?',a:['1796','1850','1896','1924'],correct:2,why:'Les premiers Jeux olympiques de l’ère moderne se déroulent à Athènes en 1896, sous l’impulsion notamment de Pierre de Coubertin.'},
      {level:'expert',cat:'insolite',q:'Comment s’appelle le premier timbre-poste adhésif émis au monde ?',a:['Penny Black','Blue Mauritius','Red Dragon','One Cent Magenta'],correct:0,why:'Le Penny Black apparaît au Royaume-Uni en 1840. Il porte le portrait de la reine Victoria et vaut un penny.'},
      {level:'intermediaire',cat:'insolite',q:'Quel animal est un symbole national traditionnel de l’Écosse ?',a:['La licorne','Le panda','Le koala','Le flamant rose'],correct:0,why:'La licorne est l’animal national traditionnel de l’Écosse. Elle apparaît dans son héraldique depuis plusieurs siècles.'},
      {level:'facile',cat:'insolite',q:'De quelles deux lettres grecques vient le mot « alphabet » ?',a:['Gamma et delta','Alpha et bêta','Pi et sigma','Oméga et thêta'],correct:1,why:'Le mot alphabet vient des deux premières lettres de l’alphabet grec : alpha et bêta.'}
    ];

    const nouvellesQuestions = [
  {
    "cat":"histoire",
    "level":"facile",
    "q":"Quel empereur français est vaincu à Waterloo en 1815 ?",
    "a":[
      "Napoléon Ier",
      "Charlemagne",
      "Louis XIV",
      "Napoléon III"
    ],
    "correct":0,
    "why":"Napoléon Ier est défait par les armées alliées en juin 1815. Sa défaite met fin aux Cent-Jours."
  },
  {
    "cat":"histoire",
    "level":"facile",
    "q":"Qui est surnommé « le Roi-Soleil » ?",
    "a":[
      "François Ier",
      "Henri IV",
      "Louis XIV",
      "Louis XVI"
    ],
    "correct":2,
    "why":"Louis XIV règne personnellement de 1661 à 1715 et fait de Versailles le centre du pouvoir royal."
  },
  {
    "cat":"histoire",
    "level":"facile",
    "q":"Quel siècle voit débuter la Première Guerre mondiale ?",
    "a":[
      "XVIIIe",
      "XIXe",
      "XXe",
      "XXIe"
    ],
    "correct":2,
    "why":"La Première Guerre mondiale commence en 1914, au début du XXe siècle."
  },
  {
    "cat":"histoire",
    "level":"facile",
    "q":"Dans quelle civilisation les pyramides de Gizeh ont-elles été construites ?",
    "a":[
      "Romaine",
      "Égyptienne",
      "Maya",
      "Grecque"
    ],
    "correct":1,
    "why":"Les grandes pyramides de Gizeh ont été édifiées durant l'Ancien Empire égyptien."
  },
  {
    "cat":"histoire",
    "level":"facile",
    "q":"Qui a été la première femme à recevoir un prix Nobel ?",
    "a":[
      "Marie Curie",
      "Simone Veil",
      "George Sand",
      "Ada Lovelace"
    ],
    "correct":0,
    "why":"Marie Curie reçoit le prix Nobel de physique en 1903, puis celui de chimie en 1911."
  },
  {
    "cat":"histoire",
    "level":"facile",
    "q":"Quel mur est tombé le 9 novembre 1989 ?",
    "a":[
      "Mur d'Hadrien",
      "Mur de Berlin",
      "Grande Muraille",
      "Mur des Lamentations"
    ],
    "correct":1,
    "why":"L'ouverture du mur de Berlin devient un symbole de la fin de la division de l'Europe durant la guerre froide."
  },
  {
    "cat":"histoire",
    "level":"intermediaire",
    "q":"Quel traité de 1919 impose les principales conditions de paix à l'Allemagne ?",
    "a":[
      "Traité de Versailles",
      "Traité de Maastricht",
      "Traité de Rome",
      "Traité de Tordesillas"
    ],
    "correct":0,
    "why":"Signé en juin 1919, le traité de Versailles fixe les conditions de paix avec l'Allemagne après la Première Guerre mondiale."
  },
  {
    "cat":"histoire",
    "level":"intermediaire",
    "q":"Quel souverain anglais rompt avec Rome au XVIe siècle ?",
    "a":[
      "Henri II",
      "Henri VIII",
      "Édouard Ier",
      "Richard III"
    ],
    "correct":1,
    "why":"Sous Henri VIII, l'Église d'Angleterre rompt avec l'autorité du pape dans les années 1530."
  },
  {
    "cat":"histoire",
    "level":"intermediaire",
    "q":"Quel chef carthaginois franchit les Alpes avec son armée pendant la deuxième guerre punique ?",
    "a":[
      "Hannibal",
      "Scipion",
      "César",
      "Périclès"
    ],
    "correct":0,
    "why":"Hannibal traverse les Alpes en 218 av. J.-C. pour porter la guerre sur le territoire romain."
  },
  {
    "cat":"histoire",
    "level":"intermediaire",
    "q":"Quel texte de 1598 accorde des droits limités aux protestants français ?",
    "a":[
      "Édit de Nantes",
      "Code civil",
      "Déclaration des droits",
      "Édit de Villers-Cotterêts"
    ],
    "correct":0,
    "why":"L'édit de Nantes, promulgué par Henri IV, organise une coexistence religieuse limitée dans le royaume."
  },
  {
    "cat":"histoire",
    "level":"intermediaire",
    "q":"À quelle date Constantinople tombe-t-elle aux mains des Ottomans ?",
    "a":[
      "1204",
      "1348",
      "1453",
      "1517"
    ],
    "correct":2,
    "why":"La prise de Constantinople par Mehmed II en 1453 marque la fin de l'Empire byzantin."
  },
  {
    "cat":"histoire",
    "level":"intermediaire",
    "q":"Quel nom porte la période de gouvernement révolutionnaire française de 1793-1794 associée aux mesures d'exception ?",
    "a":[
      "La Régence",
      "La Terreur",
      "La Restauration",
      "Le Directoire"
    ],
    "correct":1,
    "why":"La Terreur désigne notamment la répression politique liée au gouvernement révolutionnaire en 1793-1794."
  },
  {
    "cat":"histoire",
    "level":"expert",
    "q":"Quel historien antique écrit La Guerre du Péloponnèse ?",
    "a":[
      "Tacite",
      "Hérodote",
      "Thucydide",
      "Polybe"
    ],
    "correct":2,
    "why":"Thucydide analyse le conflit entre Athènes, Sparte et leurs alliés au Ve siècle av. J.-C."
  },
  {
    "cat":"histoire",
    "level":"expert",
    "q":"Qui commande les forces thébaines à Leuctres en 371 av. J.-C. ?",
    "a":[
      "Miltiade",
      "Épaminondas",
      "Alcibiade",
      "Démosthène"
    ],
    "correct":1,
    "why":"Épaminondas est l'un des principaux chefs thébains de cette victoire contre Sparte."
  },
  {
    "cat":"histoire",
    "level":"expert",
    "q":"Quel souverain promulgue l'ordonnance de Villers-Cotterêts en 1539 ?",
    "a":[
      "Louis XI",
      "Charles VII",
      "François Ier",
      "Henri III"
    ],
    "correct":2,
    "why":"François Ier promulgue cette ordonnance, qui renforce notamment l'usage du français dans les actes de justice."
  },
  {
    "cat":"histoire",
    "level":"expert",
    "q":"Quel congrès redessine une grande partie de l'Europe après la chute de Napoléon ?",
    "a":[
      "Congrès de Vienne",
      "Congrès de Berlin",
      "Congrès de Paris de 1856",
      "Congrès de Vérone"
    ],
    "correct":0,
    "why":"Le congrès de Vienne (1814-1815) organise un nouvel équilibre diplomatique européen."
  },
  {
    "cat":"histoire",
    "level":"expert",
    "q":"Quelle dynastie règne sur la France lors du massacre de la Saint-Barthélemy en 1572 ?",
    "a":[
      "Capétiens directs",
      "Valois",
      "Bourbons",
      "Mérovingiens"
    ],
    "correct":1,
    "why":"Charles IX appartient à la dynastie des Valois lors du massacre de 1572."
  },
  {
    "cat":"histoire",
    "level":"expert",
    "q":"Quelle réforme introduit les départements français en 1790 ?",
    "a":[
      "Réforme territoriale de la Constituante",
      "Concordat",
      "Code Napoléon",
      "Loi de séparation"
    ],
    "correct":0,
    "why":"L'Assemblée constituante crée les départements dans une réorganisation du territoire révolutionnaire."
  },
  {
    "cat":"geographie",
    "level":"facile",
    "q":"Quel est le plus grand océan de la planète ?",
    "a":[
      "Atlantique",
      "Indien",
      "Pacifique",
      "Arctique"
    ],
    "correct":2,
    "why":"Le Pacifique couvre une surface plus étendue que tous les autres océans."
  },
  {
    "cat":"geographie",
    "level":"facile",
    "q":"Sur quel continent se trouve le Kenya ?",
    "a":[
      "Asie",
      "Afrique",
      "Europe",
      "Amérique du Sud"
    ],
    "correct":1,
    "why":"Le Kenya se situe en Afrique de l'Est, au bord de l'océan Indien."
  },
  {
    "cat":"geographie",
    "level":"facile",
    "q":"Quelle est la capitale de l'Italie ?",
    "a":[
      "Milan",
      "Naples",
      "Rome",
      "Turin"
    ],
    "correct":2,
    "why":"Rome devient officiellement la capitale du royaume d'Italie en 1871, après la prise de la ville l'année précédente. Avant elle, Turin puis Florence avaient exercé ce rôle."
  },
  {
    "cat":"geographie",
    "level":"facile",
    "q":"Quel fleuve traverse Paris ?",
    "a":[
      "La Loire",
      "Le Rhône",
      "La Seine",
      "La Garonne"
    ],
    "correct":2,
    "why":"La Seine traverse Paris avant de rejoindre la Manche en Normandie."
  },
  {
    "cat":"geographie",
    "level":"facile",
    "q":"Quelle chaîne de montagnes sépare traditionnellement la France et l'Espagne ?",
    "a":[
      "Alpes",
      "Pyrénées",
      "Apennins",
      "Carpates"
    ],
    "correct":1,
    "why":"Les Pyrénées s'étendent entre l'Atlantique et la Méditerranée, le long de la frontière franco-espagnole."
  },
  {
    "cat":"geographie",
    "level":"facile",
    "q":"Dans quel pays se trouve la ville de Kyoto ?",
    "a":[
      "Chine",
      "Japon",
      "Corée du Sud",
      "Thaïlande"
    ],
    "correct":1,
    "why":"Kyoto a été le siège de la cour impériale japonaise pendant plus d'un millénaire, avant le transfert de la capitale à Tokyo au début de l'ère Meiji."
  },
  {
    "cat":"geographie",
    "level":"intermediaire",
    "q":"Quelle est la capitale de la Nouvelle-Zélande ?",
    "a":[
      "Auckland",
      "Christchurch",
      "Wellington",
      "Dunedin"
    ],
    "correct":2,
    "why":"Wellington est la capitale néo-zélandaise, même si Auckland est plus peuplée."
  },
  {
    "cat":"geographie",
    "level":"intermediaire",
    "q":"Quel détroit sépare l'Europe de l'Afrique à l'ouest de la Méditerranée ?",
    "a":[
      "Bosphore",
      "Gibraltar",
      "Béring",
      "Malacca"
    ],
    "correct":1,
    "why":"Le détroit de Gibraltar relie l'Atlantique à la Méditerranée entre l'Espagne et le Maroc."
  },
  {
    "cat":"geographie",
    "level":"intermediaire",
    "q":"Dans quel pays se trouve le lac Titicaca avec la Bolivie ?",
    "a":[
      "Chili",
      "Pérou",
      "Équateur",
      "Argentine"
    ],
    "correct":1,
    "why":"Le lac Titicaca s'étend de part et d'autre de la frontière entre le Pérou et la Bolivie."
  },
  {
    "cat":"geographie",
    "level":"intermediaire",
    "q":"À quelle mer le port jordanien d’Aqaba donne-t-il accès ?",
    "a":[
      "Mer Rouge",
      "Mer Noire",
      "Mer Baltique",
      "Mer Caspienne"
    ],
    "correct":0,
    "why":"La Jordanie possède un court littoral sur le golfe d'Aqaba, partie de la mer Rouge."
  },
  {
    "cat":"geographie",
    "level":"intermediaire",
    "q":"Quel fleuve passe par Budapest ?",
    "a":[
      "Le Rhin",
      "La Vistule",
      "Le Danube",
      "L'Elbe"
    ],
    "correct":2,
    "why":"Budapest s'étend de part et d'autre du Danube, qui traverse aussi Vienne et Bratislava."
  },
  {
    "cat":"geographie",
    "level":"intermediaire",
    "q":"Quel pays d'Amérique du Sud ne possède aucun accès à la mer, comme le Paraguay ?",
    "a":[
      "Uruguay",
      "Bolivie",
      "Pérou",
      "Suriname"
    ],
    "correct":1,
    "why":"La Bolivie et le Paraguay sont les deux États enclavés d'Amérique du Sud."
  },
  {
    "cat":"geographie",
    "level":"expert",
    "q":"Quelle capitale se trouve sur l'île de Honshū ?",
    "a":[
      "Séoul",
      "Taipei",
      "Tokyo",
      "Manille"
    ],
    "correct":2,
    "why":"Tokyo est située sur Honshū, la plus vaste des îles principales du Japon. Elle se trouve dans la région du Kantō, sur la côte orientale de l'île."
  },
  {
    "cat":"geographie",
    "level":"expert",
    "q":"Quel pays possède l'enclave de Cabinda, séparée de son territoire principal ?",
    "a":[
      "Angola",
      "Mozambique",
      "Namibie",
      "Zambie"
    ],
    "correct":0,
    "why":"Cabinda est une province angolaise séparée du reste du pays par une bande territoriale de la République démocratique du Congo."
  },
  {
    "cat":"geographie",
    "level":"expert",
    "q":"Quel détroit relie la mer Noire à la mer de Marmara ?",
    "a":[
      "Gibraltar",
      "Dardanelles",
      "Bosphore",
      "Ormuz"
    ],
    "correct":2,
    "why":"Le Bosphore traverse Istanbul et relie la mer Noire à la mer de Marmara ; les Dardanelles mènent ensuite vers la mer Égée."
  },
  {
    "cat":"geographie",
    "level":"expert",
    "q":"Dans quel État se situe le point culminant de l'Afrique, le Kilimandjaro ?",
    "a":[
      "Kenya",
      "Tanzanie",
      "Ouganda",
      "Éthiopie"
    ],
    "correct":1,
    "why":"Le Kilimandjaro se trouve en Tanzanie, près de la frontière kenyane."
  },
  {
    "cat":"geographie",
    "level":"expert",
    "q":"Quel État insulaire se situe à l'est de Madagascar dans l'océan Indien ?",
    "a":[
      "Maurice",
      "Cap-Vert",
      "Barbade",
      "Malte"
    ],
    "correct":0,
    "why":"L'île Maurice est située à l'est de Madagascar, dans l'archipel des Mascareignes."
  },
  {
    "cat":"geographie",
    "level":"expert",
    "q":"Quel désert occupe une grande partie de la Mongolie méridionale et de la Chine septentrionale ?",
    "a":[
      "Kalahari",
      "Gobi",
      "Atacama",
      "Taklamakan"
    ],
    "correct":1,
    "why":"Le Gobi s'étend sur le sud de la Mongolie et le nord de la Chine."
  },
  {
    "cat":"sciences",
    "level":"facile",
    "q":"Quelle planète est la plus proche du Soleil ?",
    "a":[
      "Terre",
      "Mars",
      "Mercure",
      "Vénus"
    ],
    "correct":2,
    "why":"Mercure est la planète du Système solaire la plus proche du Soleil."
  },
  {
    "cat":"sciences",
    "level":"facile",
    "q":"Quel organe pompe le sang dans le corps humain ?",
    "a":[
      "Le foie",
      "Le cœur",
      "Le rein",
      "Le poumon"
    ],
    "correct":1,
    "why":"Le cœur propulse le sang dans les circulations pulmonaire et générale."
  },
  {
    "cat":"sciences",
    "level":"facile",
    "q":"Quelle est la formule chimique de l'eau ?",
    "a":[
      "CO₂",
      "O₂",
      "H₂O",
      "NaCl"
    ],
    "correct":2,
    "why":"Une molécule d'eau contient deux atomes d'hydrogène et un atome d'oxygène."
  },
  {
    "cat":"sciences",
    "level":"facile",
    "q":"Comment s'appelle le processus par lequel les plantes utilisent la lumière pour produire de la matière organique ?",
    "a":[
      "Photosynthèse",
      "Fermentation",
      "Érosion",
      "Osmose"
    ],
    "correct":0,
    "why":"La photosynthèse utilise notamment l'énergie lumineuse, l'eau et le dioxyde de carbone."
  },
  {
    "cat":"sciences",
    "level":"facile",
    "q":"Combien de pattes possède un insecte adulte ?",
    "a":[
      "Quatre",
      "Six",
      "Huit",
      "Dix"
    ],
    "correct":1,
    "why":"Les insectes adultes ont trois paires de pattes, soit six au total."
  },
  {
    "cat":"sciences",
    "level":"facile",
    "q":"Quel satellite naturel tourne autour de la Terre ?",
    "a":[
      "Titan",
      "Phobos",
      "La Lune",
      "Europe"
    ],
    "correct":2,
    "why":"La Lune est l'unique satellite naturel permanent de la Terre."
  },
  {
    "cat":"sciences",
    "level":"intermediaire",
    "q":"Quel scientifique propose les lois du mouvement et de la gravitation universelle ?",
    "a":[
      "Isaac Newton",
      "Albert Einstein",
      "Charles Darwin",
      "Louis Pasteur"
    ],
    "correct":0,
    "why":"Newton publie ses lois du mouvement et de la gravitation dans les Principia en 1687."
  },
  {
    "cat":"sciences",
    "level":"intermediaire",
    "q":"Quelle unité mesure l'intensité du courant électrique ?",
    "a":[
      "Volt",
      "Ampère",
      "Watt",
      "Ohm"
    ],
    "correct":1,
    "why":"L'ampère mesure l'intensité électrique ; le volt mesure la différence de potentiel."
  },
  {
    "cat":"sciences",
    "level":"intermediaire",
    "q":"Quel élément chimique a pour symbole Fe ?",
    "a":[
      "Fluor",
      "Fer",
      "Francium",
      "Phosphore"
    ],
    "correct":1,
    "why":"Le symbole chimique Fe vient du latin ferrum, qui désigne le fer. C'est pourquoi il ne reprend pas les deux premières lettres de son nom français."
  },
  {
    "cat":"sciences",
    "level":"intermediaire",
    "q":"Quel type d'étoile est le Soleil ?",
    "a":[
      "Naine blanche",
      "Géante rouge",
      "Naine jaune de séquence principale",
      "Étoile à neutrons"
    ],
    "correct":2,
    "why":"Le Soleil est une étoile de type spectral G2V, appartenant à la séquence principale."
  },
  {
    "cat":"sciences",
    "level":"intermediaire",
    "q":"Quel phénomène explique principalement les marées terrestres ?",
    "a":[
      "Le vent",
      "L'attraction gravitationnelle de la Lune et du Soleil",
      "La rotation de Mars",
      "Les courants océaniques seulement"
    ],
    "correct":1,
    "why":"Les marées résultent surtout de l'effet différentiel des attractions gravitationnelles lunaire et solaire."
  },
  {
    "cat":"sciences",
    "level":"intermediaire",
    "q":"Comment nomme-t-on une particule de lumière ?",
    "a":[
      "Proton",
      "Neutron",
      "Photon",
      "Électron"
    ],
    "correct":2,
    "why":"Le photon est le quantum de lumière, autrement dit une excitation élémentaire du champ électromagnétique. Il transporte de l'énergie, même s'il n'a pas de masse au repos."
  },
  {
    "cat":"sciences",
    "level":"expert",
    "q":"Quel organite est le principal lieu de production d'ATP par respiration cellulaire chez les eucaryotes ?",
    "a":[
      "Le noyau",
      "La mitochondrie",
      "Le ribosome",
      "Le lysosome"
    ],
    "correct":1,
    "why":"La mitochondrie réalise notamment la phosphorylation oxydative qui produit une grande part de l'ATP cellulaire."
  },
  {
    "cat":"sciences",
    "level":"intermediaire",
    "q":"Quelle particule subatomique porte une charge électrique négative ?",
    "a":[
      "Proton",
      "Neutron",
      "Électron",
      "Photon"
    ],
    "correct":2,
    "why":"L'électron a une charge négative ; le proton porte une charge positive."
  },
  {
    "cat":"sciences",
    "level":"expert",
    "q":"Quel nom porte la limite au-delà de laquelle la lumière ne peut plus s'échapper d'un trou noir ?",
    "a":[
      "Horizon des événements",
      "Héliopause",
      "Zone habitable",
      "Photosphère"
    ],
    "correct":0,
    "why":"L'horizon des événements est la frontière causale au-delà de laquelle aucun signal ne peut atteindre l'extérieur du trou noir."
  },
  {
    "cat":"sciences",
    "level":"expert",
    "q":"Quel physicien a formulé le principe d'incertitude en mécanique quantique ?",
    "a":[
      "Niels Bohr",
      "Werner Heisenberg",
      "Enrico Fermi",
      "Max Planck"
    ],
    "correct":1,
    "why":"Heisenberg formule en 1927 un principe limitant la précision simultanée de certaines paires d'observables."
  },
  {
    "cat":"sciences",
    "level":"expert",
    "q":"Quel acide nucléique utilise l'uracile à la place de la thymine dans ses bases courantes ?",
    "a":[
      "ADN",
      "ARN",
      "Protéine",
      "Lipide"
    ],
    "correct":1,
    "why":"L'ARN contient en général de l'uracile, alors que l'ADN utilise de la thymine."
  },
  {
    "cat":"sciences",
    "level":"expert",
    "q":"Quel processus produit de l'énergie dans le cœur du Soleil ?",
    "a":[
      "Fission nucléaire",
      "Fusion nucléaire",
      "Combustion chimique",
      "Désintégration du carbone"
    ],
    "correct":1,
    "why":"Le Soleil tire l'essentiel de son énergie de la fusion de l'hydrogène en hélium."
  },
  {
    "cat":"arts",
    "level":"facile",
    "q":"Qui a écrit Le Petit Prince ?",
    "a":[
      "Jules Verne",
      "Antoine de Saint-Exupéry",
      "Albert Camus",
      "Marcel Proust"
    ],
    "correct":1,
    "why":"Le Petit Prince paraît en 1943 sous la plume d'Antoine de Saint-Exupéry."
  },
  {
    "cat":"arts",
    "level":"facile",
    "q":"Quel instrument possède des touches blanches et noires ?",
    "a":[
      "Violon",
      "Trompette",
      "Piano",
      "Flûte"
    ],
    "correct":2,
    "why":"Le piano est un instrument à clavier dont les touches commandent des marteaux frappant des cordes."
  },
  {
    "cat":"arts",
    "level":"facile",
    "q":"Dans quelle ville se trouve le musée du Louvre ?",
    "a":[
      "Londres",
      "Madrid",
      "Paris",
      "Rome"
    ],
    "correct":2,
    "why":"Le musée du Louvre se trouve à Paris, dans un ancien palais royal sur la rive droite de la Seine. Il est devenu un musée ouvert au public à la Révolution française, en 1793."
  },
  {
    "cat":"arts",
    "level":"facile",
    "q":"Quel auteur a créé le personnage de Sherlock Holmes ?",
    "a":[
      "Agatha Christie",
      "Arthur Conan Doyle",
      "J. R. R. Tolkien",
      "Charles Dickens"
    ],
    "correct":1,
    "why":"Arthur Conan Doyle fait apparaître Sherlock Holmes dans Une étude en rouge en 1887."
  },
  {
    "cat":"arts",
    "level":"facile",
    "q":"Quelle couleur obtient-on en mélangeant du bleu et du jaune en peinture ?",
    "a":[
      "Violet",
      "Orange",
      "Vert",
      "Rose"
    ],
    "correct":2,
    "why":"Dans le mélange traditionnel de pigments, le bleu et le jaune donnent généralement du vert."
  },
  {
    "cat":"arts",
    "level":"facile",
    "q":"Quel art pratique principalement un chorégraphe ?",
    "a":[
      "Danse",
      "Sculpture",
      "Architecture",
      "Photographie"
    ],
    "correct":0,
    "why":"Un chorégraphe imagine, compose et organise les mouvements d'une œuvre dansée, qu'elle soit classique, contemporaine ou issue d'autres styles de danse."
  },
  {
    "cat":"arts",
    "level":"intermediaire",
    "q":"À quel mouvement artistique Salvador Dalí est-il particulièrement associé ?",
    "a":[
      "Cubisme",
      "Surréalisme",
      "Impressionnisme",
      "Pointillisme"
    ],
    "correct":1,
    "why":"Dalí est une figure majeure du surréalisme, notamment pour ses images oniriques."
  },
  {
    "cat":"arts",
    "level":"intermediaire",
    "q":"Qui est l'auteur de Madame Bovary ?",
    "a":[
      "Gustave Flaubert",
      "Victor Hugo",
      "Émile Zola",
      "Stendhal"
    ],
    "correct":0,
    "why":"Flaubert publie Madame Bovary en volume en 1857 après sa parution en feuilleton."
  },
  {
    "cat":"arts",
    "level":"intermediaire",
    "q":"Dans quelle ville se trouve la basilique de la Sagrada Família ?",
    "a":[
      "Lisbonne",
      "Barcelone",
      "Florence",
      "Bruxelles"
    ],
    "correct":1,
    "why":"La Sagrada Família est l'œuvre architecturale emblématique d'Antoni Gaudí à Barcelone."
  },
  {
    "cat":"arts",
    "level":"intermediaire",
    "q":"Qui a écrit la pièce En attendant Godot ?",
    "a":[
      "Samuel Beckett",
      "Eugène Ionesco",
      "Jean Racine",
      "Jean Anouilh"
    ],
    "correct":0,
    "why":"Samuel Beckett écrit En attendant Godot à la fin des années 1940 ; sa création parisienne date de 1953."
  },
  {
    "cat":"arts",
    "level":"intermediaire",
    "q":"Quel compositeur a écrit Les Quatre Saisons ?",
    "a":[
      "Bach",
      "Vivaldi",
      "Haydn",
      "Debussy"
    ],
    "correct":1,
    "why":"Les Quatre Saisons sont un ensemble de quatre concertos pour violon d'Antonio Vivaldi."
  },
  {
    "cat":"arts",
    "level":"intermediaire",
    "q":"Quel peintre est associé au plafond de la chapelle Sixtine ?",
    "a":[
      "Raphaël",
      "Titien",
      "Michel-Ange",
      "Botticelli"
    ],
    "correct":2,
    "why":"Michel-Ange peint les fresques de la voûte de la chapelle Sixtine entre 1508 et 1512."
  },
  {
    "cat":"arts",
    "level":"expert",
    "q":"Quel romancier est l'auteur du cycle À la recherche du temps perdu ?",
    "a":[
      "Marcel Proust",
      "André Gide",
      "Louis-Ferdinand Céline",
      "François Mauriac"
    ],
    "correct":0,
    "why":"Proust publie les premiers volumes de sa Recherche à partir de 1913."
  },
  {
    "cat":"arts",
    "level":"expert",
    "q":"Quel mouvement artistique est associé à Piet Mondrian et au groupe De Stijl ?",
    "a":[
      "Expressionnisme abstrait",
      "Néoplasticisme",
      "Rococo",
      "Baroque"
    ],
    "correct":1,
    "why":"Mondrian développe un langage abstrait fondé sur les lignes orthogonales et les couleurs primaires."
  },
  {
    "cat":"arts",
    "level":"expert",
    "q":"Qui réalise le film Rashōmon, sorti en 1950 ?",
    "a":[
      "Yasujirō Ozu",
      "Akira Kurosawa",
      "Kenji Mizoguchi",
      "Hayao Miyazaki"
    ],
    "correct":1,
    "why":"Rashōmon est réalisé par Akira Kurosawa et contribue à la reconnaissance internationale du cinéma japonais."
  },
  {
    "cat":"arts",
    "level":"expert",
    "q":"Quel architecte a conçu la Villa Savoye à Poissy ?",
    "a":[
      "Le Corbusier",
      "Frank Lloyd Wright",
      "Auguste Perret",
      "Jean Nouvel"
    ],
    "correct":0,
    "why":"La Villa Savoye, conçue par Le Corbusier et Pierre Jeanneret, illustre les principes de l'architecture moderne."
  },
  {
    "cat":"arts",
    "level":"expert",
    "q":"Quel auteur latin a écrit les Métamorphoses ?",
    "a":[
      "Horace",
      "Ovide",
      "Virgile",
      "Cicéron"
    ],
    "correct":1,
    "why":"Les Métamorphoses d'Ovide rassemblent des récits mythologiques de transformations."
  },
  {
    "cat":"arts",
    "level":"expert",
    "q":"Dans quel roman apparaît le personnage de Raskolnikov ?",
    "a":[
      "Anna Karénine",
      "Crime et Châtiment",
      "Les Frères Karamazov",
      "Le Joueur"
    ],
    "correct":1,
    "why":"Raskolnikov est le protagoniste de Crime et Châtiment de Fiodor Dostoïevski."
  },
  {
    "cat":"insolite",
    "level":"facile",
    "q":"Quel animal est capable de changer rapidement de couleur grâce à des cellules spécialisées ?",
    "a":[
      "Caméléon",
      "Cheval",
      "Pigeon",
      "Lapin"
    ],
    "correct":0,
    "why":"Les caméléons modifient leur apparence grâce à des structures particulières de leur peau, notamment pour communiquer et réguler leur température."
  },
  {
    "cat":"insolite",
    "level":"facile",
    "q":"Quel objet a été inventé avant le téléphone portable ?",
    "a":[
      "Le fax",
      "Le smartphone",
      "Le GPS automobile",
      "La tablette tactile moderne"
    ],
    "correct":0,
    "why":"Des systèmes de télécopie existent au XIXe siècle, bien avant la téléphonie mobile."
  },
  {
    "cat":"insolite",
    "level":"facile",
    "q":"Quel fruit porte ses petites structures ressemblant à des graines sur l'extérieur ?",
    "a":[
      "Banane",
      "Fraise",
      "Pomme",
      "Cerise"
    ],
    "correct":1,
    "why":"Les petits grains visibles à la surface des fraises sont des akènes ; la partie rouge est un réceptacle charnu."
  },
  {
    "cat":"insolite",
    "level":"facile",
    "q":"Quel animal peut dormir debout grâce à un mécanisme de verrouillage des membres ?",
    "a":[
      "Cheval",
      "Dauphin",
      "Manchot",
      "Poulpe"
    ],
    "correct":0,
    "why":"Le cheval peut se reposer debout grâce à son appareil de soutien, même si le sommeil paradoxal nécessite généralement de se coucher."
  },
  {
    "cat":"insolite",
    "level":"facile",
    "q":"Quel animal produit traditionnellement la soie utilisée en textile ?",
    "a":[
      "Abeille",
      "Ver à soie",
      "Araignée de mer",
      "Fourmi"
    ],
    "correct":1,
    "why":"Le ver à soie, larve du bombyx du mûrier, produit un fil pour former son cocon."
  },
  {
    "cat":"insolite",
    "level":"facile",
    "q":"Quelle boisson doit son nom à une région d'Éthiopie selon une étymologie populaire non certaine ?",
    "a":[
      "Thé",
      "Café",
      "Cacao",
      "Maté"
    ],
    "correct":1,
    "why":"L'origine exacte du mot café est discutée ; le rapprochement avec Kaffa, en Éthiopie, est souvent cité, sans être assuré."
  },
  {
    "cat":"insolite",
    "level":"intermediaire",
    "q":"Pourquoi les flamants roses ont-ils souvent un plumage rose ?",
    "a":[
      "À cause de la lumière solaire",
      "Grâce à des pigments apportés par leur alimentation",
      "À cause du sel marin seul",
      "Grâce à leur sang"
    ],
    "correct":1,
    "why":"Des caroténoïdes issus de leur nourriture contribuent à la couleur de leur plumage."
  },
  {
    "cat":"insolite",
    "level":"intermediaire",
    "q":"Quel aliment a été utilisé comme monnaie par certaines sociétés mésoaméricaines ?",
    "a":[
      "Fèves de cacao",
      "Pommes de terre",
      "Tomates",
      "Grains de riz"
    ],
    "correct":0,
    "why":"Des fèves de cacao ont servi d'unité d'échange dans diverses sociétés mésoaméricaines."
  },
  {
    "cat":"insolite",
    "level":"intermediaire",
    "q":"Quel est le principal composant chimique des perles naturelles ?",
    "a":[
      "Quartz",
      "Carbonate de calcium",
      "Fer",
      "Silicium pur"
    ],
    "correct":1,
    "why":"Les perles sont surtout constituées de carbonate de calcium organisé en nacre."
  },
  {
    "cat":"insolite",
    "level":"intermediaire",
    "q":"Pourquoi les bananes commerciales courantes sont-elles généralement sans graines dures ?",
    "a":[
      "Elles poussent sous l'eau",
      "Elles sont souvent triploïdes et peu fertiles",
      "Elles sont récoltées avant leur floraison",
      "Les graines se dissolvent dans le fruit"
    ],
    "correct":1,
    "why":"De nombreuses bananes cultivées sont triploïdes et se multiplient de manière végétative."
  },
  {
    "cat":"insolite",
    "level":"intermediaire",
    "q":"Quelle ville est connue pour son ancien système de courrier pneumatique urbain ?",
    "a":[
      "Paris",
      "Venise",
      "Athènes",
      "Reykjavík"
    ],
    "correct":0,
    "why":"Paris a utilisé un réseau de tubes pneumatiques pour transporter des messages pendant plus d'un siècle."
  },
  {
    "cat":"insolite",
    "level":"intermediaire",
    "q":"Quel animal est célèbre pour sa « danse » indiquant une source de nourriture ?",
    "a":[
      "Abeille",
      "Loutre",
      "Hérisson",
      "Hibou"
    ],
    "correct":0,
    "why":"Les abeilles mellifères communiquent notamment par des danses fournissant des indications sur les ressources."
  },
  {
    "cat":"insolite",
    "level":"expert",
    "q":"Quel dispositif antique grec découvert dans une épave servait à modéliser des cycles astronomiques ?",
    "a":[
      "Machine d'Anticythère",
      "Sphère armillaire de Tycho",
      "Astrolabe de Prague",
      "Boussole de Delphes"
    ],
    "correct":0,
    "why":"La machine d'Anticythère est un mécanisme à engrenages de l'Antiquité grecque lié aux calculs calendaires et astronomiques."
  },
  {
    "cat":"insolite",
    "level":"expert",
    "q":"Comment s'appelle l'illusion qui donne l'impression que la Lune est plus grande près de l'horizon ?",
    "a":[
      "Parallaxe stellaire",
      "Illusion lunaire",
      "Effet Doppler",
      "Aberration chromatique"
    ],
    "correct":1,
    "why":"L'illusion lunaire est un phénomène perceptif : la taille angulaire de la Lune varie peu entre l'horizon et le zénith."
  },
  {
    "cat":"insolite",
    "level":"expert",
    "q":"Quel matériau préindustriel tiré de peaux animales était fréquemment utilisé pour les manuscrits ?",
    "a":[
      "Papyrus",
      "Parchemin",
      "Béton",
      "Linoléum"
    ],
    "correct":1,
    "why":"Le parchemin est fabriqué à partir de peaux animales préparées, notamment de mouton, de chèvre ou de veau."
  },
  {
    "cat":"insolite",
    "level":"expert",
    "q":"Quel oiseau est connu pour offrir parfois des cailloux lors de la parade nuptiale chez certaines espèces ?",
    "a":[
      "Manchot",
      "Aigle royal",
      "Autruche",
      "Colibri"
    ],
    "correct":0,
    "why":"Certaines espèces de manchots utilisent des cailloux pour construire le nid, ce qui peut faire partie des interactions de couple."
  },
  {
    "cat":"insolite",
    "level":"expert",
    "q":"Quelle civilisation a utilisé des cordelettes nouées appelées quipus pour consigner des informations ?",
    "a":[
      "Inca",
      "Viking",
      "Égyptienne",
      "Phénicienne"
    ],
    "correct":0,
    "why":"Les quipus étaient employés dans l'administration andine, notamment sous l'Empire inca."
  },
  {
    "cat":"insolite",
    "level":"expert",
    "q":"Quel nom donne-t-on au minuscule animal à huit pattes célèbre pour résister à des conditions extrêmes ?",
    "a":[
      "Rotifère",
      "Tardigrade",
      "Plancton",
      "Collembole"
    ],
    "correct":1,
    "why":"Certains tardigrades peuvent survivre à des conditions extrêmes lorsqu'ils entrent dans un état de dormance."
  }
];
    // Questions V2 : formats complémentaires, conservés séparément des 115 QCM historiques.
    const formatsQuestions = [
      {
        "type": "true_false",
        "cat": "histoire",
        "level": "facile",
        "q": "La Première Guerre mondiale commence en 1914.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 0,
        "why": "Le conflit débute à l'été 1914, après la crise provoquée par l'assassinat de François-Ferdinand. Il s'achève en novembre 1918.",
        "hint": "Replace cette guerre parmi les grands conflits du début du XXe siècle."
      },
      {
        "type": "multi_select",
        "cat": "histoire",
        "level": "facile",
        "q": "Quels événements se déroulent au XVIIIe siècle ?",
        "a": [
          "La prise de la Bastille",
          "Le sacre de Napoléon Ier",
          "La Déclaration d'indépendance des États-Unis",
          "La bataille de Waterloo"
        ],
        "correct": [
          0,
          2
        ],
        "why": "La Bastille est prise en 1789 et la Déclaration d'indépendance américaine date de 1776. Le sacre de Napoléon a lieu en 1804 et Waterloo en 1815.",
        "hint": "Le XVIIIe siècle correspond aux années 1701 à 1800."
      },
      {
        "type": "true_false",
        "cat": "histoire",
        "level": "intermediaire",
        "q": "La guerre de Cent Ans oppose principalement les royaumes de France et d'Angleterre.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 0,
        "why": "De 1337 à 1453, les couronnes française et anglaise s'affrontent dans une succession de conflits, avec des alliances variables.",
        "hint": "Souviens-toi des deux grandes monarchies rivales de l'Europe occidentale médiévale."
      },
      {
        "type": "multi_select",
        "cat": "histoire",
        "level": "intermediaire",
        "q": "Quels souverains ont régné sur la France pendant au moins une partie du XVIe siècle ?",
        "a": [
          "François Ier",
          "Henri II",
          "Henri IV",
          "Louis XIII"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "why": "François Ier règne de 1515 à 1547, Henri II de 1547 à 1559 et Henri IV de 1589 à 1610. Louis XIII monte sur le trône en 1610.",
        "hint": "Pour chaque souverain, situe le début ou la fin de son règne par rapport à l'année 1600."
      },
      {
        "type": "true_false",
        "cat": "histoire",
        "level": "expert",
        "q": "La paix d'Augsbourg de 1555 garantit la liberté de religion individuelle à tous les habitants du Saint-Empire.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 1,
        "why": "La paix d'Augsbourg reconnaît le droit de certains princes de choisir entre catholicisme et luthéranisme pour leur territoire ; elle n'établit pas une liberté religieuse individuelle générale.",
        "hint": "Distingue le pouvoir du prince sur la confession de son territoire et les droits personnels des sujets."
      },
      {
        "type": "multi_select",
        "cat": "histoire",
        "level": "expert",
        "q": "Quelles institutions existaient dans la République romaine avant l'établissement du principat d'Auguste ?",
        "a": [
          "Le Sénat",
          "Le consulat",
          "Le tribunat de la plèbe",
          "La préfecture du prétoire sous l'Empire"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "why": "Le Sénat, les consuls et les tribuns de la plèbe appartiennent à la vie politique républicaine. La préfecture du prétoire, dans sa forme impériale, apparaît sous Auguste.",
        "hint": "Distingue les magistratures républicaines des charges créées ou réorganisées sous le principat."
      },
      {
        "type": "true_false",
        "cat": "geographie",
        "level": "facile",
        "q": "L'équateur traverse le continent africain.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 0,
        "why": "L'équateur traverse notamment le Gabon, le Congo, la République démocratique du Congo, l'Ouganda, le Kenya et la Somalie.",
        "hint": "L'équateur traverse plusieurs continents et océans : visualise son parcours sur un globe."
      },
      {
        "type": "multi_select",
        "cat": "geographie",
        "level": "facile",
        "q": "Quels pays se trouvent en Amérique du Sud ?",
        "a": [
          "La Colombie",
          "Le Pérou",
          "Le Portugal",
          "L'Uruguay"
        ],
        "correct": [
          0,
          1,
          3
        ],
        "why": "La Colombie, le Pérou et l'Uruguay sont sud-américains. Le Portugal se trouve en Europe, même s'il partage sa langue avec le Brésil.",
        "hint": "Repère le continent de chaque pays, pas simplement la langue qui y est parlée."
      },
      {
        "type": "true_false",
        "cat": "geographie",
        "level": "intermediaire",
        "q": "Le canal de Suez relie directement la mer Méditerranée à la mer Noire.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 1,
        "why": "Le canal de Suez relie la Méditerranée à la mer Rouge, en Égypte. La mer Noire communique avec la Méditerranée par les détroits turcs.",
        "hint": "Pense aux deux mers qui permettent d'éviter le contournement de l'Afrique."
      },
      {
        "type": "multi_select",
        "cat": "geographie",
        "level": "intermediaire",
        "q": "Quels pays possèdent un littoral sur la mer Baltique ?",
        "a": [
          "L'Estonie",
          "La Finlande",
          "La Pologne",
          "La Norvège"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "why": "L'Estonie, la Finlande et la Pologne bordent la mer Baltique. La Norvège possède un littoral sur les mers du Nord, de Norvège et de Barents, mais pas sur la Baltique.",
        "hint": "Ne confonds pas les États nordiques et les pays réellement riverains de cette mer."
      },
      {
        "type": "true_false",
        "cat": "geographie",
        "level": "expert",
        "q": "Le Lesotho possède un accès direct à l'océan Indien.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 1,
        "why": "Le Lesotho est un État enclavé, entièrement entouré par l'Afrique du Sud : il n'a pas de littoral.",
        "hint": "Vérifie si ses frontières terrestres permettent d'atteindre directement la côte."
      },
      {
        "type": "multi_select",
        "cat": "geographie",
        "level": "expert",
        "q": "Quels États ont une frontière terrestre avec l'Iran ?",
        "a": [
          "L'Azerbaïdjan",
          "L'Afghanistan",
          "Le Turkménistan",
          "Oman"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "why": "L'Iran a des frontières terrestres avec l'Azerbaïdjan, l'Afghanistan et le Turkménistan. Oman en est séparé par les eaux du détroit d'Ormuz et du golfe d'Oman.",
        "hint": "Une proximité maritime ne constitue pas une frontière terrestre."
      },
      {
        "type": "true_false",
        "cat": "sciences",
        "level": "facile",
        "q": "Une araignée possède six pattes.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 1,
        "why": "Les araignées adultes sont des arachnides à huit pattes ; les insectes adultes possèdent six pattes.",
        "hint": "Compare les principaux caractères anatomiques des insectes et des arachnides."
      },
      {
        "type": "multi_select",
        "cat": "sciences",
        "level": "facile",
        "q": "Quels objets appartiennent au Système solaire ?",
        "a": [
          "Mars",
          "Titan",
          "Saturne",
          "Sirius"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "why": "Mars et Saturne sont des planètes du Système solaire ; Titan est une lune de Saturne. Sirius est une étoile extérieure au Système solaire.",
        "hint": "Une lune d'une planète appartient également au système de son étoile."
      },
      {
        "type": "true_false",
        "cat": "sciences",
        "level": "intermediaire",
        "q": "Le numéro atomique de l'oxygène est 8.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 0,
        "why": "Le noyau d'un atome d'oxygène possède huit protons, ce qui définit son numéro atomique 8.",
        "hint": "Le numéro atomique correspond au nombre de protons du noyau."
      },
      {
        "type": "multi_select",
        "cat": "sciences",
        "level": "intermediaire",
        "q": "Quels éléments chimiques sont des gaz nobles dans les conditions ordinaires ?",
        "a": [
          "L'hélium",
          "Le néon",
          "L'argon",
          "L'azote"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "why": "L'hélium, le néon et l'argon appartiennent à la colonne des gaz nobles. L'azote est un gaz majoritaire de l'air, mais ce n'est pas un gaz noble.",
        "hint": "Pense à une même famille du tableau périodique plutôt qu'aux gaz les plus répandus."
      },
      {
        "type": "true_false",
        "cat": "sciences",
        "level": "expert",
        "q": "Dans l'ADN à double brin, l'adénine s'apparie normalement avec la cytosine.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 1,
        "why": "Dans l'ADN, l'adénine s'apparie normalement avec la thymine, tandis que la cytosine s'apparie avec la guanine.",
        "hint": "Rappelle-toi les deux paires complémentaires de bases dans la double hélice."
      },
      {
        "type": "multi_select",
        "cat": "sciences",
        "level": "expert",
        "q": "Quelles affirmations sont compatibles avec la sélection naturelle en biologie évolutive ?",
        "a": [
          "Des variations héréditaires peuvent influencer la reproduction",
          "L'environnement peut modifier les pressions de sélection",
          "Tous les caractères acquis pendant la vie sont hérités",
          "La fréquence de certains caractères peut évoluer entre générations"
        ],
        "correct": [
          0,
          1,
          3
        ],
        "why": "La variation héréditaire, les succès reproducteurs différents et l'évolution des fréquences de caractères sont centraux dans la sélection naturelle. La transmission systématique de tous les caractères acquis n'en découle pas.",
        "hint": "Distingue les variations transmissibles des transformations vécues seulement par un individu."
      },
      {
        "type": "true_false",
        "cat": "arts",
        "level": "facile",
        "q": "Victor Hugo est l'auteur du roman Notre-Dame de Paris.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 0,
        "why": "Victor Hugo publie Notre-Dame de Paris en 1831. Le roman met notamment en scène Esmeralda et Quasimodo.",
        "hint": "Le roman appartient au mouvement romantique français du XIXe siècle."
      },
      {
        "type": "multi_select",
        "cat": "arts",
        "level": "facile",
        "q": "Quels instruments appartiennent à la famille des cordes ?",
        "a": [
          "Le violon",
          "Le violoncelle",
          "La harpe",
          "La trompette"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "why": "Le violon, le violoncelle et la harpe produisent leurs sons grâce à des cordes vibrantes. La trompette est un instrument à vent de la famille des cuivres.",
        "hint": "Identifie la partie de l'instrument qui vibre pour produire le son."
      },
      {
        "type": "true_false",
        "cat": "arts",
        "level": "intermediaire",
        "q": "Le cubisme apparaît avant l'impressionnisme.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 1,
        "why": "L'impressionnisme se développe dans la seconde moitié du XIXe siècle, tandis que le cubisme apparaît au début du XXe siècle, notamment avec Picasso et Braque.",
        "hint": "Classe ces mouvements selon les transformations picturales des XIXe et XXe siècles."
      },
      {
        "type": "multi_select",
        "cat": "arts",
        "level": "intermediaire",
        "q": "Quelles pièces ont été écrites par Molière ?",
        "a": [
          "Le Misanthrope",
          "L'Avare",
          "Tartuffe",
          "Le Cid"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "why": "Le Misanthrope, L'Avare et Tartuffe sont des comédies de Molière. Le Cid est une pièce de Pierre Corneille.",
        "hint": "Distingue les grands dramaturges français du XVIIe siècle."
      },
      {
        "type": "true_false",
        "cat": "arts",
        "level": "expert",
        "q": "L'école du Bauhaus est fondée en France en 1919.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 1,
        "why": "Walter Gropius fonde le Bauhaus à Weimar, en Allemagne, en 1919. Cette école marquera le design, l'architecture et les arts appliqués.",
        "hint": "Souviens-toi des grands foyers européens du modernisme après 1918."
      },
      {
        "type": "multi_select",
        "cat": "arts",
        "level": "expert",
        "q": "Quelles pièces sont des tragédies de Jean Racine ?",
        "a": [
          "Phèdre",
          "Andromaque",
          "Britannicus",
          "Le Cid"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "why": "Phèdre, Andromaque et Britannicus sont des tragédies de Racine. Le Cid est une pièce de Corneille, longtemps qualifiée de tragi-comédie.",
        "hint": "Identifie les auteurs et leurs grands cycles tragiques au XVIIe siècle."
      },
      {
        "type": "true_false",
        "cat": "insolite",
        "level": "facile",
        "q": "Le miel est fabriqué par les abeilles à partir de substances sucrées récoltées, notamment le nectar.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 0,
        "why": "Les abeilles transforment notamment le nectar des fleurs grâce à des enzymes et à une réduction de sa teneur en eau pour produire du miel.",
        "hint": "Pense au travail des insectes pollinisateurs après leur visite des fleurs."
      },
      {
        "type": "multi_select",
        "cat": "insolite",
        "level": "facile",
        "q": "Quels animaux pondent des œufs ?",
        "a": [
          "La tortue",
          "L'autruche",
          "L'ornithorynque",
          "Le dauphin"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "why": "Les tortues, les autruches et les ornithorynques pondent des œufs. Le dauphin est un mammifère vivipare.",
        "hint": "Certains mammifères constituent des exceptions intéressantes."
      },
      {
        "type": "true_false",
        "cat": "insolite",
        "level": "intermediaire",
        "q": "Les poulpes possèdent un squelette interne composé d'os.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 1,
        "why": "Les poulpes ont un corps mou sans squelette osseux interne. Leur bec est une structure dure, mais ce n'est pas un os.",
        "hint": "Ne confonds pas la présence de parties dures avec un squelette osseux."
      },
      {
        "type": "multi_select",
        "cat": "insolite",
        "level": "intermediaire",
        "q": "Quelles techniques ou inventions existaient déjà au XIXe siècle ?",
        "a": [
          "La photographie",
          "Le télégraphe électrique",
          "Le téléphone",
          "Le micro-ordinateur personnel"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "why": "La photographie, le télégraphe électrique et le téléphone se développent au XIXe siècle. Les micro-ordinateurs personnels se diffusent au XXe siècle.",
        "hint": "Plusieurs technologies de communication précèdent largement l'informatique individuelle."
      },
      {
        "type": "true_false",
        "cat": "insolite",
        "level": "expert",
        "q": "La machine d'Anticythère a été découverte dans une épave de la mer Égée au début du XXe siècle.",
        "a": [
          "Vrai",
          "Faux"
        ],
        "correct": 0,
        "why": "Le mécanisme est découvert en 1901 parmi les vestiges d'une épave près de l'île grecque d'Anticythère. Il permettait de calculer des cycles astronomiques.",
        "hint": "Sépare l'époque de fabrication d'un objet antique de la date de sa découverte moderne."
      },
      {
        "type": "multi_select",
        "cat": "insolite",
        "level": "expert",
        "q": "Quels éléments caractérisent l'écriture cunéiforme de la Mésopotamie ancienne ?",
        "a": [
          "Des tablettes d'argile",
          "Un stylet souvent en roseau",
          "Des empreintes en forme de coins",
          "L'alphabet latin comme système principal"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "why": "Les scribes mésopotamiens inscrivaient souvent des signes en forme de coins avec un stylet sur des tablettes d'argile. L'alphabet latin n'est pas le système du cunéiforme.",
        "hint": "Distingue le support matériel, l'outil et la forme des signes de leur langue."
      }
    ];
    if(!['THOT_QUESTIONS_FACILE','THOT_QUESTIONS_INTERMEDIAIRE','THOT_QUESTIONS_EXPERT'].every(name=>Array.isArray(window[name]))){
      document.getElementById('quiz-load-message').textContent='Certaines questions n’ont pas pu être chargées.';
      throw new Error('Chargement incomplet des questions THOT');
    }
    const additionalQuestions=[
      ...window.THOT_QUESTIONS_FACILE,
      ...window.THOT_QUESTIONS_INTERMEDIAIRE,
      ...window.THOT_QUESTIONS_EXPERT
    ];
    const questions=[...originalQuestions,...nouvellesQuestions,...formatsQuestions,...additionalQuestions];
    document.getElementById('quiz-total').textContent = questions.length + ' questions pour jouer';

    const labels = {mix:'✦ Un peu de tout',histoire:'🏛️ Histoire',geographie:'🌍 Géographie',sciences:'🔬 Sciences',arts:'🎨 Arts & culture',insolite:'✨ Insolite'};
    const recommendedReads = {
      histoire:{href:'articles/roubaix-1917.html',title:'Roubaix en 1917 : vivre sous l’occupation allemande'},
      geographie:{href:'articles/puissance-etats-unis.html',title:'Pourquoi les États-Unis ne peuvent-ils pas tout imposer ?'},
      sciences:{href:'articles/pieuvres-couleur.html',title:'Comment les pieuvres changent-elles de couleur ?'},
      arts:{href:'articles/autrices-pseudonymes.html',title:'Pourquoi des autrices ont-elles publié sous un nom d’homme ?'}
    };
    const levels = {
      facile:{label:'🌱 Facile',description:'Pour se lancer et découvrir de nouvelles choses.'},
      intermediaire:{label:'⚡ Moyen',description:'Pour celles et ceux qui aiment déjà se creuser la tête.'},
      expert:{label:'🏆 Expert',description:'Pour les curieux qui veulent un vrai défi.'}
    };
    const $=id=>document.getElementById(id);
    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const screens=['screen-intro','screen-question','screen-result'];
    let selectedCategory='mix',selectedLevel='facile',round=[],index=0,score=0,answered=false,attempts=[],streak=0,bestStreak=0,selectedAnswers=new Set(),gameMode='classic',gameDay='',roundFinished=false;
    const show=id=>screens.forEach(name=>$(name).classList.toggle('hidden',name!==id));
    function shuffle(arr){const copy=[...arr];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
    const storageKey='thot_v2_stats';
    const defaults=()=>({games:0,correct:0,answered:0,bests:{},recent:{},history:{},progression:{xp:0,byCategory:{},bestStreak:0,hasPerfectGame:false},daily:{lastCompleted:'',lastScore:0,streak:0,day:'',games:0,correct:0,claimed:[],completed:{}}});
    let storageDirty=false,storageUnavailable=false;
    function loadStats(fallback=defaults()){
      let saved;
      try{saved=localStorage.getItem(storageKey);storageUnavailable=false;}
      catch{storageUnavailable=true;return fallback;}
      try{
        const raw=JSON.parse(saved||'null');
        if(!raw||typeof raw!=='object'||Array.isArray(raw))return fallback;
        const stats=defaults();
        for(const key of ['games','correct','answered']){
          const n=Number(raw[key]);if(Number.isSafeInteger(n)&&n>=0)stats[key]=n;
        }
        if(raw.bests&&typeof raw.bests==='object'&&!Array.isArray(raw.bests))stats.bests=raw.bests;
        if(raw.recent&&typeof raw.recent==='object'&&!Array.isArray(raw.recent))stats.recent=raw.recent;
        if(raw.history&&typeof raw.history==='object'&&!Array.isArray(raw.history))stats.history=raw.history;
        if(raw.progression&&typeof raw.progression==='object'&&!Array.isArray(raw.progression)){
          const p=raw.progression;
          if(Number.isSafeInteger(p.xp)&&p.xp>=0)stats.progression.xp=p.xp;
          if(Number.isSafeInteger(p.bestStreak)&&p.bestStreak>=0)stats.progression.bestStreak=p.bestStreak;
          stats.progression.hasPerfectGame=p.hasPerfectGame===true;
          if(p.byCategory&&typeof p.byCategory==='object'&&!Array.isArray(p.byCategory)){
            for(const cat of ['histoire','geographie','sciences','arts','insolite']){
              if(Number.isSafeInteger(p.byCategory[cat])&&p.byCategory[cat]>=0)stats.progression.byCategory[cat]=p.byCategory[cat];
            }
          }
        }else{
          // Une seule migration à partir des compteurs déjà sauvegardés.
          // Aucune catégorie historique inconnue n'est devinée.
          stats.progression.xp=stats.correct*10+stats.games*5;
        }
        if(raw.daily&&typeof raw.daily==='object'&&!Array.isArray(raw.daily)){
          const d=raw.daily;
          for(const key of ['lastCompleted','day'])if(typeof d[key]==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d[key]))stats.daily[key]=d[key];
          for(const key of ['lastScore','streak','games','correct'])if(Number.isSafeInteger(d[key])&&d[key]>=0)stats.daily[key]=d[key];
          if(Array.isArray(d.claimed))stats.daily.claimed=d.claimed.filter(v=>['daily','three','two'].includes(v));
          if(d.completed&&typeof d.completed==='object'&&!Array.isArray(d.completed)){
            for(const [day,score] of Object.entries(d.completed)){
              if(/^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isInteger(score)&&score>=0&&score<=5)stats.daily.completed[day]=score;
            }
          }
          if(stats.daily.lastCompleted)stats.daily.completed[stats.daily.lastCompleted]=Math.min(stats.daily.lastScore,5);
        }
        stats.progression.hasPerfectGame=stats.progression.hasPerfectGame||Object.values(stats.bests).some(value=>Number(value)===5)||Object.values(stats.daily.completed).some(value=>value===5);
        // Sauvegarder la migration seulement après avoir restauré le défi quotidien.
        if(!raw.progression||typeof raw.progression!=='object'||Array.isArray(raw.progression))saveProgressMigration(stats);
        return stats;
      }catch{return fallback;}
    }
    function saveProgressMigration(value){
      try{localStorage.setItem(storageKey,JSON.stringify(value));storageDirty=false;storageUnavailable=false;}
      catch{storageDirty=true;storageUnavailable=true;}
    }
    let stats=loadStats();
    function refreshStorageNotice(){
      const unavailable=storageDirty||storageUnavailable;
      $('storage-status').classList.toggle('hidden',!unavailable);
      $('stats-note').classList.toggle('hidden',unavailable);
    }
    function saveStats(){saveProgressMigration(stats);refreshStorageNotice();}
    function reloadStats(){if(!storageDirty)stats=loadStats(stats);}
    function syncStats(){
      reloadStats();
      refreshBest();refreshStats();refreshProgression();refreshDaily();refreshStorageNotice();
    }
    function bestKey(){return selectedCategory+'|'+selectedLevel;}
    function refreshBest(){
      const best=Number(stats.bests[bestKey()]);
      $('best-score').textContent=best>=0&&best<=5&&Number.isInteger(best)&&stats.bests[bestKey()]!==undefined
        ?'Record '+labels[selectedCategory].replace(/^[^ ]+ /,'')+' · '+levels[selectedLevel].label+' : '+best+'/5'
        :'Pas encore de record à ce niveau';
    }
    function refreshStats(){
      $('stat-games').textContent=String(stats.games);
      $('stat-correct').textContent=String(stats.correct);
      $('stat-accuracy').textContent=stats.answered>0?Math.round(stats.correct/stats.answered*100)+' %':'—';
    }
    const xpLevels=[
      {name:'Apprenti',min:0,icon:'✦'},
      {name:'Explorateur',min:150,icon:'◈'},
      {name:'Érudit',min:400,icon:'❖'},
      {name:'Encyclopédiste',min:900,icon:'✳'}
    ];
    const badgeCatalog=[
      {id:'debut',icon:'✦',title:'Premier pas',desc:'Terminer une première partie.',goal:1,get:()=>stats.games},
      {id:'assidu',icon:'◈',title:'Curieux assidu',desc:'Terminer 5 parties.',goal:5,get:()=>stats.games},
      {id:'sansfaute',icon:'★',title:'Sans-faute',desc:'Réussir une partie à 5/5.',goal:1,get:()=>stats.progression.hasPerfectGame?1:0},
      {id:'serie',icon:'⚡',title:'Esprit vif',desc:'Réussir 3 réponses consécutives.',goal:3,get:()=>stats.progression.bestStreak},
      {id:'histoire',icon:'🏛️',title:'Historien',desc:'5 bonnes réponses en histoire.',goal:5,get:()=>stats.progression.byCategory.histoire||0},
      {id:'geographie',icon:'🌍',title:'Cartographe',desc:'5 bonnes réponses en géographie.',goal:5,get:()=>stats.progression.byCategory.geographie||0},
      {id:'sciences',icon:'🔬',title:'Scientifique',desc:'5 bonnes réponses en sciences.',goal:5,get:()=>stats.progression.byCategory.sciences||0},
      {id:'arts',icon:'🎨',title:'Esthète',desc:'5 bonnes réponses en arts.',goal:5,get:()=>stats.progression.byCategory.arts||0},
      {id:'insolite',icon:'✨',title:"Explorateur de l'insolite",desc:'5 bonnes réponses insolites.',goal:5,get:()=>stats.progression.byCategory.insolite||0}
    ];
    function currentLevel(xp){
      let active=xpLevels[0],next=null;
      for(const level of xpLevels){if(xp>=level.min)active=level;else{next=level;break;}}
      return {active,next};
    }
    function unlockedBadgeIds(){return badgeCatalog.filter(b=>b.get()>=b.goal).map(b=>b.id);}
    function refreshProgression(){
      const xp=stats.progression.xp,level=currentLevel(xp);
      $('xp-level').textContent=level.active.icon+' '+level.active.name;
      $('xp-count').textContent=xp.toLocaleString('fr-FR')+' XP';
      $('xp-next').textContent=level.next?'Prochain niveau : '+level.next.min+' XP':'Dernier niveau atteint';
      const from=level.active.min,to=level.next?level.next.min:from+1;
      const ratio=level.next?Math.max(0,Math.min(1,(xp-from)/(to-from))):1;
      $('xp-fill').style.width=(ratio*100).toFixed(1)+'%';
      $('xp-progress').setAttribute('aria-valuemin',String(level.next?from:0));
      $('xp-progress').setAttribute('aria-valuemax',String(level.next?to:Math.max(xp,1)));
      $('xp-progress').setAttribute('aria-valuenow',String(xp));
      $('xp-progress').setAttribute('aria-valuetext',level.next?xp+' XP sur '+to+' pour '+level.next.name:'Dernier niveau atteint');
      const unlocked=unlockedBadgeIds();
      $('badge-count').textContent=unlocked.length+' / '+badgeCatalog.length;
      const grid=$('badges-grid');grid.replaceChildren();
      for(const b of badgeCatalog){
        const current=b.get(),earned=current>=b.goal;
        const item=document.createElement('div');item.className='badge-item '+(earned?'earned':'locked');
        const emblem=document.createElement('span');emblem.className='badge-emblem';emblem.textContent=earned?b.icon:'🔒';emblem.setAttribute('aria-hidden','true');
        const copy=document.createElement('div');copy.className='badge-copy';
        const title=document.createElement('strong');title.textContent=b.title+(earned?' · obtenu':'');
        const desc=document.createElement('span');desc.textContent=b.desc;
        const state=document.createElement('small');state.textContent=earned?'Débloqué':Math.min(current,b.goal)+' / '+b.goal;
        copy.append(title,desc,state);item.append(emblem,copy);grid.append(item);
      }
    }
    function utcDay(){return new Date().toISOString().slice(0,10);}
    function hashDaily(value){
      let h=2166136261;
      for(let i=0;i<value.length;i++)h=Math.imul(h^value.charCodeAt(i),16777619)>>>0;
      return h>>>0;
    }
    function dailyQuestions(day){
      return ['histoire','geographie','sciences','arts','insolite'].map(cat=>{
        const pool=questions.filter(q=>q.cat===cat).sort((a,b)=>a.q.localeCompare(b.q,'fr'));
        return pool[hashDaily(day+'|'+cat)%pool.length];
      }).sort((a,b)=>hashDaily(day+'|order|'+a.cat)-hashDaily(day+'|order|'+b.cat));
    }
    function dailyGoals(day){
      const d=stats.daily;
      return [
        {id:'daily',title:'Défi accompli',desc:'Terminer le défi du jour',value:d.lastCompleted===day?1:0,goal:1},
        {id:'three',title:'Trois découvertes',desc:'Réussir 3 réponses aujourd’hui',value:d.correct,goal:3},
        {id:'two',title:'Esprit persévérant',desc:'Terminer 2 parties aujourd’hui',value:d.games,goal:2}
      ];
    }
    function refreshDaily(){
      const day=utcDay(),d=stats.daily,done=Object.prototype.hasOwnProperty.call(d.completed,day);
      $('daily-date').textContent=new Date(day+'T12:00:00Z').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
      $('daily-start-button').disabled=done;
      $('daily-start-button').textContent=done?'✓ Défi déjà joué':'Relever le défi du jour ↗';
      $('daily-status').textContent=done?'Score du jour : '+d.completed[day]+'/5':'Un essai par jour';
      const yesterday=new Date(Date.parse(day+'T00:00:00Z')-86400000).toISOString().slice(0,10);
      const activeStreak=d.lastCompleted===day||d.lastCompleted===yesterday?d.streak:0;
      $('daily-streak').textContent='✦ Série quotidienne : '+activeStreak+' jour'+(activeStreak>1?'s':'');
      const list=$('daily-goals-list');list.replaceChildren();
      for(const g of dailyGoals(day)){
        const count=d.day===day?g.value:0,earned=d.day===day&&d.claimed.includes(g.id);
        const el=document.createElement('div');el.className='daily-goal'+(earned?' done':'');
        const symbol=document.createElement('span');symbol.className='daily-goal-symbol';symbol.textContent=earned?'✓':'✦';
        const copy=document.createElement('div');copy.className='daily-goal-copy';
        const title=document.createElement('strong');title.textContent=g.title;
        const desc=document.createElement('span');desc.textContent=g.desc;
        const status=document.createElement('small');status.textContent=earned?'+10 XP obtenus':Math.min(count,g.goal)+' / '+g.goal;
        copy.append(title,desc,status);el.append(symbol,copy);list.append(el);
      }
    }
    function startDaily(){
      reloadStats();
      const day=utcDay();
      if(Object.prototype.hasOwnProperty.call(stats.daily.completed,day)){refreshDaily();return;}
      gameMode='daily';gameDay=day;round=dailyQuestions(day);index=0;score=0;answered=false;roundFinished=false;attempts=[];streak=0;bestStreak=0;
      $('review-panel').classList.add('hidden');$('review-button').setAttribute('aria-expanded','false');
      show('screen-question');renderQuestion();
      $('quiz-classique').scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});
    }
    function setCategory(cat){
      selectedCategory=labels[cat]?cat:'mix';
      $('chosen-category').textContent=labels[selectedCategory];
      document.querySelectorAll('[data-quiz-theme]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.quizTheme===selectedCategory)));
      refreshBest();show('screen-intro');
      $('quiz-classique').scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});
    }
    function setLevel(level){
      if(!levels[level])return;
      selectedLevel=level;
      document.querySelectorAll('[data-level]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.level===level)));
      $('level-description').textContent=levels[level].description;
      refreshBest();
    }
    function questionType(q){return q.type==='multi_select'?'multi_select':q.type==='true_false'?'true_false':'single_select';}
    function correctIndexes(q){return Array.isArray(q.correct)?q.correct:[q.correct];}
    function chooseRound(pool,n=5){
      const key=bestKey(),history=stats.history||{};
      const valid=new Set(pool.map(q=>q.q));
      const previous=Array.isArray(history[key])?history[key].filter(q=>valid.has(q)):[];
      const already=new Set(previous);
      const candidates=shuffle(pool.filter(q=>!already.has(q.q)));
      const selected=candidates.slice(0,n);
      if(selected.length<n){
        const recent=new Set(Array.isArray(stats.recent[key])?stats.recent[key]:[]);
        const remaining=pool.filter(q=>!selected.includes(q));
        const older=shuffle(remaining.filter(q=>!recent.has(q.q)));
        const latest=shuffle(remaining.filter(q=>recent.has(q.q)));
        selected.push(...[...older,...latest].slice(0,n-selected.length));
        history[key]=selected.map(q=>q.q);
      }else{
        history[key]=[...new Set([...previous,...selected.map(q=>q.q)])];
      }
      stats.history=history;
      stats.recent[key]=selected.map(q=>q.q);
      saveStats();
      return shuffle(selected);
    }
    function begin(){
      reloadStats();
      const pool=questions.filter(q=>q.level===selectedLevel&&(selectedCategory==='mix'||q.cat===selectedCategory));
      if(pool.length<5){alert('Pas assez de questions dans ce thème.');return;}
      gameMode='classic';gameDay='';round=chooseRound(pool,5);index=0;score=0;answered=false;roundFinished=false;attempts=[];streak=0;bestStreak=0;
      $('review-panel').classList.add('hidden');$('review-button').setAttribute('aria-expanded','false');
      show('screen-question');renderQuestion();
    }
    function renderQuestionTrack(){
      const track=$('quiz-track');track.replaceChildren();
      round.forEach((item,position)=>{
        const step=document.createElement('span');
        const attempt=attempts[position];
        const state=attempt?(attempt.ok?'success':'miss'):(position===index?'active':'future');
        step.className='quiz-track-step '+state;
        step.textContent=attempt?(attempt.ok?'✓':'×'):String(position+1);
        step.setAttribute('aria-label','Question '+(position+1)+' : '+(attempt?(attempt.ok?'bonne réponse':'réponse erronée'):(position===index?'en cours':'à venir')));
        track.append(step);
      });
    }
    function renderQuestion(){
      answered=false;selectedAnswers=new Set();
      const item=round[index],type=questionType(item);
      $('question-counter').textContent='QUESTION '+(index+1)+' / '+round.length;
      $('current-score').textContent=score+' bonne'+(score>1?'s':'')+' réponse'+(score>1?'s':'');
      $('progressbar').setAttribute('aria-valuemax',String(round.length));
      $('progressbar').setAttribute('aria-valuenow',String(index));
      $('progressfill').style.width=(index/round.length*100)+'%';
      const typeLabel=type==='true_false'?' · Vrai ou faux':type==='multi_select'?' · Plusieurs réponses':' · QCM';
      $('question-level').textContent=levels[item.level].label+' · '+labels[item.cat]+typeLabel;
      $('streak-status').textContent='Série : '+streak;
      $('question-text').textContent=item.q;
      $('answer-instruction').textContent=type==='multi_select'?'Sélectionne toutes les bonnes réponses':type==='true_false'?'Vrai ou faux ?':'Choisis une seule réponse';
      renderQuestionTrack();
      $('answer-list').replaceChildren();
      $('feedback').className='feedback hidden';$('feedback').replaceChildren();
      $('quiz-reading').className='quiz-reading hidden';$('quiz-reading').replaceChildren();
      $('next-button').classList.add('hidden');
      $('hint-panel').classList.add('hidden');
      $('hint-panel').textContent='';
      $('hint-button').classList.remove('hidden');
      $('hint-button').setAttribute('aria-expanded','false');
      $('hint-button').textContent='✧ Besoin d’un indice ?';
      $('validate-button').classList.toggle('hidden',type!=='multi_select');
      $('validate-button').disabled=true;
      $('validate-button').textContent='Valider mes réponses';
      const pool=item.a.map((answer,idx)=>({answer,idx}));
      const choices=gameMode==='daily'?pool.sort((a,b)=>hashDaily(gameDay+'|'+item.q+'|'+a.idx)-hashDaily(gameDay+'|'+item.q+'|'+b.idx)):shuffle(pool);
      choices.forEach(({answer,idx},n)=>{
        const button=document.createElement('button');
        button.type='button';button.className='answer';button.dataset.idx=String(idx);
        const letter=document.createElement('span');letter.className='answer-letter';
        letter.textContent=type==='true_false'?(answer==='Vrai'?'V':'F'):'ABCD'[n];
        const answerText=document.createElement('span');answerText.textContent=answer;
        button.append(letter,answerText);
        if(type==='multi_select'){
          button.setAttribute('aria-pressed','false');
          button.addEventListener('click',()=>{
            if(answered)return;
            if(selectedAnswers.has(idx))selectedAnswers.delete(idx);else selectedAnswers.add(idx);
            button.classList.toggle('selected',selectedAnswers.has(idx));
            button.setAttribute('aria-pressed',String(selectedAnswers.has(idx)));
            $('validate-button').disabled=selectedAnswers.size===0;
            $('validate-button').textContent=selectedAnswers.size>0?'Valider '+selectedAnswers.size+' réponse'+(selectedAnswers.size>1?'s':''):'Valider mes réponses';
          });
        }else button.addEventListener('click',()=>submitAnswer(idx));
        $('answer-list').append(button);
      });
      // Annoncer l'énoncé avant les réponses, y compris au clavier.
      $('question-text').setAttribute('tabindex','-1');
      $('question-text').focus({preventScroll:true});
      $('question-text').scrollIntoView({behavior:'auto',block:'nearest'});
    }
    function showHint(){
      if(answered)return;
      const panel=$('hint-panel'),willOpen=panel.classList.contains('hidden');
      panel.classList.toggle('hidden',!willOpen);
      $('hint-button').setAttribute('aria-expanded',String(willOpen));
      $('hint-button').textContent=willOpen?'Masquer l’indice ↑':'✧ Besoin d’un indice ?';
      if(willOpen)panel.textContent=round[index].hint||'Prends le temps de comparer les propositions et de repérer ce que demande exactement la question.';
    }
    function submitAnswer(chosen){
      if(answered||roundFinished)return;
      const item=round[index],type=questionType(item);
      const picks=Array.isArray(chosen)?[...new Set(chosen)].sort((a,b)=>a-b):[chosen];
      if(type==='multi_select'&&picks.length===0)return;
      answered=true;
      const expected=correctIndexes(item).slice().sort((a,b)=>a-b);
      const good=picks.length===expected.length&&picks.every((v,i)=>v===expected[i]);
      if(good){score++;streak++;bestStreak=Math.max(bestStreak,streak);}else streak=0;
      const readable=values=>values.map(i=>item.a[i]).join(' · ');
      attempts.push({question:item.q,category:item.cat,chosen:readable(picks),correct:readable(expected),why:item.why,ok:good});
      $('streak-status').textContent='Série : '+streak;
      renderQuestionTrack();
      document.querySelectorAll('.answer').forEach(b=>{
        const value=Number(b.dataset.idx);b.disabled=true;
        if(expected.includes(value))b.classList.add('correct');
        else if(picks.includes(value))b.classList.add('wrong');
        b.setAttribute('aria-pressed',String(picks.includes(value)));
      });
      $('hint-button').classList.add('hidden');
      $('hint-panel').classList.add('hidden');
      $('validate-button').classList.add('hidden');
      $('current-score').textContent=score+' bonne'+(score>1?'s':'')+' réponse'+(score>1?'s':'');
      const feedback=$('feedback');feedback.className='feedback'+(good?'':' bad');
      const title=document.createElement('strong');title.textContent=good?'✦ Bonne réponse !':'✦ Tu viens d’apprendre quelque chose !';
      const detail=document.createElement('span');
      detail.textContent=(good?'':'Bonne'+(expected.length>1?'s':'')+' réponse'+(expected.length>1?'s':'')+' : '+readable(expected)+'. ')+item.why;
      feedback.append(title,detail);
      window.THOT_QUIZ_REFERENCES?.render(feedback,item);
      const reading=recommendedReads[item.cat];
      const readingBox=$('quiz-reading');
      if(reading){
        const intro=document.createElement('span');intro.textContent='Pour continuer dans cet univers : ';
        const link=document.createElement('a');link.href=reading.href;link.textContent=reading.title;
        readingBox.append(intro,link);readingBox.classList.remove('hidden');
      }
      $('next-button').textContent=index===round.length-1?'Voir mon résultat →':'Question suivante →';
      $('next-button').classList.remove('hidden');
      $('progressbar').setAttribute('aria-valuenow',String(index+1));
      $('progressfill').style.width=((index+1)/round.length*100)+'%';
      $('next-button').focus({preventScroll:true});
    }
    function next(){
      if(!answered||roundFinished)return;
      index++;
      if(index>=round.length){finish();$('result-title').focus({preventScroll:true});}
      else renderQuestion();
    }
    function finish(){
      if(roundFinished)return;
      // Relire avant d'écrire : une autre page a pu terminer une partie entre-temps.
      reloadStats();
      const alreadyCompleted=gameMode==='daily'&&Object.prototype.hasOwnProperty.call(stats.daily.completed,gameDay);
      roundFinished=true;
      const priorBadges=new Set(unlockedBadgeIds());
      const priorLevel=currentLevel(stats.progression.xp).active.name;
      let earnedXP=0,missionXP=0;
      if(!alreadyCompleted){
        stats.games++;
        stats.correct+=score;
        stats.answered+=round.length;
        // Le défi quotidien mélange les univers et les niveaux : il ne doit
        // jamais modifier le record d'un quiz classique choisi auparavant.
        if(gameMode==='classic'){
          const best=stats.bests[bestKey()];
          if(typeof best!=='number'||score>best)stats.bests[bestKey()]=score;
        }
        earnedXP=score*10+5+(score===round.length?10:0);
        if(score===round.length)stats.progression.hasPerfectGame=true;
        if(gameMode==='daily'){
          stats.daily.completed[gameDay]=score;
          // Conserver aussi un défi commencé avant minuit, sans écraser un jour plus récent.
          if(gameDay>stats.daily.lastCompleted){
            const yesterday=new Date(Date.parse(gameDay+'T00:00:00Z')-86400000).toISOString().slice(0,10);
            stats.daily.streak=stats.daily.lastCompleted===yesterday?stats.daily.streak+1:1;
            stats.daily.lastCompleted=gameDay;stats.daily.lastScore=score;
          }
        }
        const today=utcDay();
        if(gameMode!=='daily'||gameDay===today){
          if(stats.daily.day!==today){stats.daily.day=today;stats.daily.games=0;stats.daily.correct=0;stats.daily.claimed=[];}
          stats.daily.games++;stats.daily.correct+=score;
          for(const goal of dailyGoals(today)){
            if(goal.value>=goal.goal&&!stats.daily.claimed.includes(goal.id)){
              stats.daily.claimed.push(goal.id);missionXP+=10;
            }
          }
          earnedXP+=missionXP;
        }
        stats.progression.xp+=earnedXP;
        stats.progression.bestStreak=Math.max(stats.progression.bestStreak,bestStreak);
        attempts.forEach(a=>{
          if(a.ok&&Object.prototype.hasOwnProperty.call(labels,a.category)&&a.category!=='mix')
            stats.progression.byCategory[a.category]=(stats.progression.byCategory[a.category]||0)+1;
        });
        saveStats();
      }
      const newBadges=badgeCatalog.filter(b=>!priorBadges.has(b.id)&&b.get()>=b.goal);
      refreshBest();refreshStats();refreshProgression();refreshDaily();
      const newLevel=currentLevel(stats.progression.xp).active.name;
      $('xp-earned').textContent='✦ +'+earnedXP+' XP'+(missionXP?' dont '+missionXP+' XP de missions':'')+' · Total : '+stats.progression.xp.toLocaleString('fr-FR')+' XP'+(newLevel!==priorLevel?' · Nouveau niveau : '+newLevel+' !':'');
      $('daily-result').classList.toggle('hidden',gameMode!=='daily');
      let dailyMessage='';
      if(gameMode==='daily'){
        const dateLabel=new Date(gameDay+'T12:00:00Z').toLocaleDateString('fr-FR',{day:'numeric',month:'long',timeZone:'UTC'});
        dailyMessage=alreadyCompleted
          ?'Ce défi a déjà été terminé dans un autre onglet : score enregistré '+stats.daily.completed[gameDay]+'/5. Cet essai ne modifie pas ta progression.'
          :'Défi du '+dateLabel+' terminé : '+score+'/5. '+(gameDay===utcDay()?'Reviens demain pour cinq autres questions.':'Un nouveau défi est maintenant disponible.');
      }
      $('daily-result').textContent=dailyMessage;
      $('badges-earned').classList.toggle('hidden',newBadges.length===0);
      $('badges-earned').textContent=newBadges.length?'Badge'+(newBadges.length>1?'s':'')+' débloqué'+(newBadges.length>1?'s':'')+' : '+newBadges.map(b=>b.icon+' '+b.title).join(' · '):'';
      $('final-score').textContent=score+'/'+round.length;
      const msg=score===5?['Un sans-faute !','Tu maîtrises cette partie du savoir. Prêt pour un nouveau défi ?']:
        score>=3?['Très belle partie !','Et surtout, cinq occasions de découvrir quelque chose de nouveau.']:
        ['La curiosité se cultive !','Chaque erreur est une découverte. Retente ta chance avec d’autres questions.'];
      $('result-title').textContent=msg[0];$('result-message').textContent=msg[1];
      $('result-performance').textContent=score+' bonne'+(score>1?'s':'')+' réponse'+(score>1?'s':'')+' sur '+round.length+' · Meilleure série : '+bestStreak;
      $('result-detail').textContent=(gameMode==='daily'?'Défi quotidien · 5 univers':labels[selectedCategory]+' · '+levels[selectedLevel].label)+' · '+stats.games+' partie'+(stats.games>1?'s':'')+' terminée'+(stats.games>1?'s':'')+' sur cet appareil';
      const wrong=attempts.filter(a=>!a.ok);
      const reviewList=$('review-list');reviewList.replaceChildren();
      wrong.forEach((a)=>{
        const item=document.createElement('li');item.className='review-card';
        const question=document.createElement('strong');question.textContent=a.question;
        const given=document.createElement('p');given.className='review-wrong';given.textContent='Ta réponse : '+a.chosen;
        const correct=document.createElement('p');correct.className='review-correct';correct.textContent='À retenir : '+a.correct;
        const why=document.createElement('p');why.className='review-why';why.textContent=a.why;
        item.append(question,given,correct,why);reviewList.append(item);
      });
      $('review-panel').classList.add('hidden');
      $('review-button').classList.toggle('hidden',wrong.length===0);
      $('review-button').setAttribute('aria-expanded','false');
      $('review-button').textContent='Revoir mes '+wrong.length+' erreur'+(wrong.length>1?'s':'')+' ↘';
      show('screen-result');
    }
    document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>setCategory(button.dataset.category)));
    document.querySelectorAll('[data-level]').forEach(button=>button.addEventListener('click',()=>setLevel(button.dataset.level)));
    $('start-button').addEventListener('click',begin);
    document.querySelectorAll('[data-quiz-theme]').forEach(button=>button.addEventListener('click',()=>setCategory(button.dataset.quizTheme)));
    $('daily-start-button').addEventListener('click',startDaily);
    let dailyRefreshTimer;
    function scheduleDailyRefresh(){
      clearTimeout(dailyRefreshTimer);
      const now=Date.now(),nextDay=new Date(now);nextDay.setUTCHours(24,0,0,0);
      dailyRefreshTimer=setTimeout(()=>{syncStats();scheduleDailyRefresh();},nextDay.getTime()-now+100);
    }
    document.addEventListener('visibilitychange',()=>{if(!document.hidden){syncStats();scheduleDailyRefresh();}});
    window.addEventListener('pageshow',()=>{syncStats();scheduleDailyRefresh();});
    window.addEventListener('storage',event=>{
      if(event.key!==storageKey&&event.key!==null)return;
      try{if(event.storageArea!==localStorage)return;}catch{return;}
      if(event.newValue===null){stats=defaults();storageDirty=false;}
      syncStats();
    });
    $('badges-button').addEventListener('click',()=>{
      const panel=$('badges-panel'),open=panel.classList.contains('hidden');
      panel.classList.toggle('hidden',!open);
      $('badges-button').setAttribute('aria-expanded',String(open));
    });
    $('hint-button').addEventListener('click',showHint);
    $('validate-button').addEventListener('click',()=>submitAnswer([...selectedAnswers]));
    $('next-button').addEventListener('click',next);
    $('replay-button').addEventListener('click',begin);
    $('review-button').addEventListener('click',()=>{
      const panel=$('review-panel');
      const willOpen=panel.classList.contains('hidden');
      panel.classList.toggle('hidden',!willOpen);
      $('review-button').setAttribute('aria-expanded',String(willOpen));
      $('review-button').textContent=willOpen?'Masquer les corrections ↑':'Revoir mes erreurs ↘';
      if(willOpen)$('review-heading').focus({preventScroll:true});
    });
    $('change-button').addEventListener('click',()=>setCategory('mix'));
    const mobileMenu=$('mobile-menu-button'),primaryNav=$('primary-navigation');
    const menuHeader=mobileMenu.closest('.top'),mobileViewport=window.matchMedia('(max-width: 710px)');
    function closeMobileMenu(returnFocus=false){
      primaryNav.classList.remove('is-open');
      mobileMenu.setAttribute('aria-expanded','false');
      mobileMenu.setAttribute('aria-label','Ouvrir le menu');
      if(returnFocus)mobileMenu.focus();
    }
    mobileMenu.addEventListener('click',()=>{
      const open=mobileMenu.getAttribute('aria-expanded')!=='true';
      primaryNav.classList.toggle('is-open',open);
      mobileMenu.setAttribute('aria-expanded',String(open));
      mobileMenu.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');
    });
    primaryNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeMobileMenu()));
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&mobileMenu.getAttribute('aria-expanded')==='true')closeMobileMenu(true);
    });
    document.addEventListener('click',event=>{if(!menuHeader.contains(event.target))closeMobileMenu();});
    menuHeader.addEventListener('focusout',event=>{if(event.relatedTarget&&!menuHeader.contains(event.relatedTarget))closeMobileMenu();});
    const syncMenuViewport=()=>closeMobileMenu(mobileViewport.matches&&primaryNav.contains(document.activeElement));
    if(typeof mobileViewport.addEventListener==='function')mobileViewport.addEventListener('change',syncMenuViewport);
    else if(typeof mobileViewport.addListener==='function')mobileViewport.addListener(syncMenuViewport);
    menuHeader.setAttribute('data-menu-ready','');
    $('year').textContent=String(new Date().getFullYear());
    refreshBest();refreshStats();refreshProgression();refreshDaily();refreshStorageNotice();
    document.querySelectorAll('[data-quiz-startup-disabled]').forEach(button=>{
      if(button.id!=='daily-start-button')button.disabled=false;
      button.removeAttribute('data-quiz-startup-disabled');
    });
    $('quiz-load-status').classList.add('hidden');
    scheduleDailyRefresh();
  
