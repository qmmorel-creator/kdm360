# Données de démonstration — communes aux 5 maquettes Phase 0

*Ref #1.* Ces données sont fictives, compatibles avec les structures réelles d'OS360
mais ne proviennent d'aucune source réelle. Chaque maquette doit utiliser exactement
ces valeurs (elle peut les mettre en forme différemment) pour que la comparaison entre
directions porte sur le langage visuel, pas sur le contenu.

## Aujourd'hui

- Budget du mois : **+418 €** (solde projeté fin de mois), tendance légèrement positive
  vs mois précédent (+3 %).
- Recovery (Whoop) : **71 %**, en baisse de 12 points vs hier (83 %).
- Charge sport (7 jours glissants) : **élevée** (indice 8,4/10), compétition CrossFit
  hier.
- Social : **4 relances** en attente (contacts ayant dépassé leur seuil de contact).

### Points à regarder (4 items, un par domaine)

1. Budget — Catégorie « Courses » : 83 % du budget consommé à 66 % du mois écoulé
   (écart : +17 points).
2. Santé — HRV stable (58 ms, -2 ms vs moyenne 7 jours) mais strain élevé hier (18,2).
3. Sport — Compétition CrossFit hier (séance « Open 26.3 », durée 24 min, charge 9,1).
4. Social — 1 contact important (cercle « Proche ») dépasse son délai cible de contact
   de 9 jours (seuil : 21 jours, dernier contact : il y a 30 jours).

## Budget

- Revenus du mois : 4 250 €. Dépenses : 3 832 €. Solde : +418 €. Épargne : 600 €
  (automatique, hors calcul dépenses).
- Trajectoire du mois : ligne cumulée dépenses réelles vs moyenne des 6 derniers mois,
  légèrement en dessous jusqu'au 20, puis un pic le 21 (loyer).
- Budgets (5 catégories, format « consommé / alloué / % du mois écoulé ») :
  - Courses : 415 € / 500 € — 83 % (mois à 66 %) → **dérive**
  - Transport : 120 € / 150 € — 80 % (mois à 66 %) → proche limite
  - Loisirs : 180 € / 300 € — 60 % (mois à 66 %) → normal
  - Restaurants : 95 € / 120 € — 79 % (mois à 66 %) → proche limite
  - Abonnements : 68 € / 70 € — 97 % (mois à 66 %) → **dérive**
- Patrimoine : 42 300 €, +2,1 % sur 3 mois. Composition : Épargne 61 %, Investissements
  28 %, Liquidités 11 %.
- Exploration : Sankey (figé, voir `02-sankey-reference.md`), sunburst des catégories de
  dépenses, historique 12 mois, liste des dernières transactions (5 lignes suffisent en
  maquette).

## Santé

- Récupération : Recovery 71 % (hier 83 %), HRV 58 ms (moyenne 7j : 60 ms), RHR 52 bpm,
  strain 18,2/21 hier, SpO2 97 %, température corporelle +0,2 °C vs baseline.
- Sommeil : durée 6h42, besoin 7h50, performance 86 %, efficacité 91 %, REM 22 %,
  sommeil profond (SWS) 18 %.
- Composition corporelle : poids 78,4 kg (-0,3 kg / 30j), masse grasse 15,2 %, masse
  musculaire 61,8 kg — courbe 90 jours en légère baisse de poids.
- Nutrition (hier) : 2 340 kcal, protéines 148 g, glucides 210 g, objectifs
  2 400 kcal / 160 g protéines.

## Sport

- 7 derniers jours : 5 séances, charge cumulée 41,2, durée totale 4h52.
- Répartition disciplines (28 jours) : CrossFit 45 %, Course 30 %, Vélo 15 %, Trail 10 %.
- Régularité : 4,2 séances/semaine en moyenne sur 12 semaines, tendance stable.
- Séance la plus récente : CrossFit « Open 26.3 » — hier, 24 min, charge 9,1,
  fréquence cardiaque moyenne 168 bpm, pic 184 bpm.
- Historique 12 mois : volume mensuel en heures, pic en juillet (22h), creux en février
  (9h).

## Social

- Réseau : 34 contacts actifs, répartis en 4 cercles (Proche : 6, Régulier : 12,
  Occasionnel : 11, Dormant : 5).
- À relancer (4) :
  1. Camille — cercle Proche, dernier contact il y a 30 jours (seuil 21j), initiative :
     à moi de relancer.
  2. Thomas — cercle Régulier, dernier contact il y a 45 jours (seuil 35j), en attente
     de sa réponse depuis 12 jours.
  3. Léa — cercle Proche, dernier contact il y a 25 jours (seuil 21j).
  4. Marc — cercle Régulier, dernier contact il y a 40 jours (seuil 35j).
- Fiche contact exemple (Camille) : cercle Proche, importance haute, dernier contact
  il y a 30 jours (appel), historique : 14 interactions sur 12 mois, heatmap mensuelle
  avec un creux net en juillet-août.

## Filtres de période standard

7 jours · 28 jours · Mois en cours · Année · Historique complet — présents partout où le
prompt les demande (Sport en particulier), même s'ils ne sont pas tous fonctionnels dans
la maquette (statique acceptable en Phase 0).
