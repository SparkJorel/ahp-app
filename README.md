# AHP — Analytic Hierarchy Process

Application web d'aide à la décision multicritère basée sur la méthode AHP (Saaty, 1970).

> Projet INF4178 Génie Logiciel — Université de Yaoundé 1

---

## Démo en ligne

**Application déployée :** https://sparkjorel.github.io/ahp-app/

**Dépôt source :** https://github.com/SparkJorel/ahp-app

Cas d'étude pré-rempli : **Choix de la meilleure université d'État au Cameroun** parmi UY1, UDouala, UDschang et UNgaoundéré, selon 4 critères : réputation, coût de la vie, diversité des filières et localisation.

## Ce que fait l'application

1. L'utilisateur définit un **objectif**, des **critères** et des **alternatives**.
2. Pour chaque paire (critères, puis alternatives par critère), il indique laquelle est plus importante via l'**échelle de Saaty** (1 = égalité, 9 = extrêmement plus important).
3. L'application :
   - calcule les **poids de priorité** (vecteur propre approximé par moyenne des lignes normalisées),
   - calcule λ<sub>max</sub>, CI (Consistency Index) et CR (Consistency Ratio) pour **chaque** matrice,
   - **vérifie la cohérence** (CR < 0.10),
   - si tout est cohérent : retourne le **classement final** des alternatives,
   - sinon : identifie la **paire la plus problématique** et explique à l'utilisateur l'incohérence (valeur saisie vs valeur attendue).

## Utilisation

### En local

Aucune installation requise — c'est une application 100 % statique.

```
ouvrir index.html dans un navigateur
```

Au chargement, l'exemple "Universités du Cameroun" est pré-rempli. Cliquez sur **Calculer les résultats** pour voir le classement.

### Personnaliser le problème

- Modifier l'objectif dans le champ texte.
- Ajouter / supprimer / renommer des critères et des alternatives.
- Pour chaque paire, choisir la valeur de Saaty dans le menu déroulant. La diagonale (1) et la moitié inférieure (réciproques) sont remplies automatiquement.
- Cliquer sur **Calculer les résultats**.

### Tester l'incohérence

Dans la matrice des critères, mettez une comparaison absurde (par exemple : "Réputation × 9 > Coût" et "Coût × 9 > Filières" mais "Filières × 9 > Réputation"). L'application détectera CR ≥ 0.10 et pointera la cellule à corriger.

## Méthode AHP — étapes implémentées

| Étape | Fichier | Fonction |
|---|---|---|
| Normalisation de la matrice | `ahp.js` | `normalizeMatrix` |
| Vecteur des priorités | `ahp.js` | `priorityVector` |
| Calcul de λ<sub>max</sub> | `ahp.js` | `lambdaMax` |
| Indices CI et CR | `ahp.js` | `consistency` |
| Identification de la paire incohérente | `ahp.js` | `mostInconsistentPair` |
| Synthèse finale | `ahp.js` | `synthesize` |

Table des indices aléatoires (RI) utilisée pour n = 1 à 10, conformément aux notes de cours (RI = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49]).

## Structure du projet

```
ahp-app/
├── index.html      Page unique
├── style.css       Styles
├── ahp.js          Moteur mathématique AHP (pur, sans DOM)
├── preset.js       Données pré-remplies (Universités du Cameroun)
├── app.js          Contrôleur UI (état + rendu + événements)
└── README.md
```

Pas de framework, pas de build, pas de dépendance NPM. Vanilla JS / HTML / CSS.

## Déploiement

L'application est hébergée sur **GitHub Pages**, branche `main`, dossier racine. Tout commit poussé sur `main` redéploie automatiquement le site.

URL publique : https://sparkjorel.github.io/ahp-app/

## Auteur

**TIOMELA ZANGUE Jorel** — Matricule **21U2144**

Projet réalisé dans le cadre du cours **INF4178 — Génie Logiciel**, Master 1 Informatique, Université de Yaoundé 1.
