# Structure du Google Sheet — LA PORRA AQUÍONPARLE 2026

Ce document décrit **exactement** comment créer le Google Sheet utilisé comme base de données.

⚠️ **RÈGLES IMPORTANTES** :
- Créez **un seul** fichier Google Sheets, avec **11 onglets** (feuilles) portant **exactement** les noms ci-dessous (respectez majuscules, underscores, et l'absence d'accents).
- La **première ligne** de chaque onglet doit contenir les en-têtes de colonnes **exactement** comme indiqué (ordre, orthographe, casse).
- Ne laissez **aucune ligne vide** au-dessus des en-têtes.
- Les onglets `Classement` et `Resultat_Ballon_Or` sont calculés automatiquement par l'application — ils peuvent rester vides (l'app ne les lit pas, ils sont prévus comme archives optionnelles, vous pouvez même les supprimer sans casser l'app).

---

## 1. `Participants`

| ID_Joueur | Prenom_Pseudo | Email | Date_Inscription | Langue_Apprise | Statut |
|---|---|---|---|---|---|

- `ID_Joueur` : généré automatiquement par l'app, format `JO001`, `JO002`, ...
- `Email` : identifiant unique du joueur (insensible à la casse)
- `Date_Inscription` : remplie automatiquement (format `YYYY-MM-DD`)
- `Langue_Apprise` : laissez vide pour l'instant (champ libre, non utilisé en V1)
- `Statut` : `Actif` ou `Inactif`. Mettez `Inactif` pour exclure un joueur du classement.

➡️ **Ne remplissez rien manuellement ici** : cet onglet se remplit tout seul quand un joueur s'inscrit.

---

## 2. `Calendrier_Matchs`

| ID_Match | Phase | Equipe_A | Equipe_B | Date_Match | Heure_Coup_Envoi | Date_Heure_UTC | Statut | Score_A_Reel | Score_B_Reel |
|---|---|---|---|---|---|---|---|---|---|

- `ID_Match` : identifiant unique, ex. `M01`, `M02`... **À remplir vous-même** avant le tournoi.
- `Phase` : une des valeurs suivantes : `Phase de groupes`, `Huitiemes`, `Quarts`, `Demi-finales`, `Finale`
- `Equipe_A` / `Equipe_B` : noms des équipes (sans accents, ex. `Bresil`, `Etats-Unis`)
- `Date_Match` : format `YYYY-MM-DD` (ex. `2026-06-15`)
- `Heure_Coup_Envoi` : heure locale d'affichage, ex. `21:00`
- `Date_Heure_UTC` : ⚠️ **champ le plus important** — date/heure du coup d'envoi en **UTC**, format ISO `YYYY-MM-DDTHH:MM:00Z` (ex. `2026-06-15T19:00:00Z`). C'est ce champ qui détermine quand un pronostic se verrouille automatiquement.
- `Statut` : laissez `A venir` au départ. L'app calcule le statut affiché (A venir / Verrouille / Termine) à partir de `Date_Heure_UTC` et de la présence d'un score réel — vous n'avez normalement pas besoin de le modifier manuellement.
- `Score_A_Reel` / `Score_B_Reel` : **à remplir par les organisatrices** une fois le match terminé (ou via l'interface admin, ce qui est recommandé car cela déclenche le calcul automatique des points).

➡️ **À pré-remplir avant le lancement** : tous les matchs du calendrier (32 équipes × tous les tours), avec `Date_Heure_UTC` correcte.

---

## 3. `Pronostics_Matchs`

| ID_Pronostic | ID_Joueur | Prenom_Pseudo | ID_Match | Equipe_A | Equipe_B | Score_A_Predit | Score_B_Predit | Date_Soumission | Pronostic_Verrouille | Points_Obtenus |
|---|---|---|---|---|---|---|---|---|---|---|

➡️ **Ne remplissez rien manuellement ici.** Rempli automatiquement quand un joueur fait/modifie un pronostic, et mis à jour automatiquement (`Pronostic_Verrouille` = `Oui`, `Points_Obtenus` calculé) quand vous saisissez le score réel d'un match via l'admin.

---

## 4. `Pronostics_Initiaux`

| ID_Joueur | Prenom_Pseudo | Champion_Predit | Finaliste_Predit | Demi_1 | Demi_2 | Demi_3 | Demi_4 | Meilleur_Buteur_Predit | Equipe_Surprise_Predit | Date_Soumission | Points_Champion | Points_Finaliste | Points_Demi | Points_Buteur | Points_Surprise | Total_Initiaux |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

➡️ **Ne remplissez rien manuellement ici.** Rempli automatiquement quand un joueur soumet ses pronostics initiaux (avant le début du tournoi). Les colonnes `Points_*` et `Total_Initiaux` sont calculées automatiquement (valeur `0` au départ) lorsque vous saisissez les résultats officiels du tournoi via l'admin.

---

## 5. `Resultats_Officiels_Tournoi`

| Champion_Officiel | Finaliste_Officiel | Demi_1_Officiel | Demi_2_Officiel | Demi_3_Officiel | Demi_4_Officiel | Meilleur_Buteur_Officiel | Equipe_Surprise_Officielle |
|---|---|---|---|---|---|---|---|

- Une **seule ligne de données** (sous l'en-tête).
- ➡️ **Laissez vide au départ.** À remplir **à la fin du tournoi**, de préférence via l'interface admin (cela déclenche automatiquement le calcul des points de tous les pronostics initiaux).

---

## 6. `Defis_Linguistiques`

| ID_Bonus | ID_Joueur | Prenom_Pseudo | Nom_Defi | Langue | Points | Date_Attribution | Commentaire |
|---|---|---|---|---|---|---|---|

➡️ **Ne remplissez rien manuellement ici** (sauf cas exceptionnel). Rempli via l'interface admin quand les organisatrices attribuent des points bonus à un joueur pour un défi linguistique. `Points` est limité entre 0 et 20 par défi.

---

## 7. `Defis_Actuels`

| ID_Defi | Nom_Defi | Description | Langue | Points_Max | Date_Debut | Date_Fin | Statut |
|---|---|---|---|---|---|---|---|

- `ID_Defi` : identifiant libre, ex. `D01`, `D02`...
- `Langue` : `Francais`, `Espagnol`, ou `Les deux`
- `Points_Max` : points maximum attribuables pour ce défi (recommandé : 20)
- `Date_Debut` / `Date_Fin` : format `YYYY-MM-DD`
- `Statut` : `A venir`, `En cours`, ou `Termine`

➡️ **À remplir vous-même** : créez ici la liste des défis linguistiques proposés à la communauté pendant le tournoi. Mettez à jour le `Statut` au fil du temps (ou laissez-le, ce champ est informatif pour les joueurs).

---

## 8. `Classement`

Onglet d'archive optionnel — **non lu par l'application** (le classement est recalculé en temps réel). Vous pouvez le laisser vide ou l'utiliser pour vos propres notes.

| Rang | ID_Joueur | Prenom_Pseudo | Points_Pronostics | Points_Defis | Total |
|---|---|---|---|---|---|

---

## 9. `Votes_Ballon_Or`

| ID_Vote | ID_Votant | Nom_Votant | ID_Candidat | Nom_Candidat | Motivation | Date_Vote |
|---|---|---|---|---|---|---|

➡️ **Ne remplissez rien manuellement ici.** Rempli automatiquement quand un joueur vote (un seul vote par joueur, pas d'auto-vote).

---

## 10. `Resultat_Ballon_Or`

Onglet d'archive optionnel — **non lu par l'application** (le résultat est calculé en temps réel à partir de `Votes_Ballon_Or`). Peut rester vide.

| Rang | ID_Joueur | Prenom_Pseudo | Nombre_De_Votes |
|---|---|---|---|

---

## 11. `Parametres`

Cet onglet contient les **réglages globaux** de la plateforme, sous forme de paires clé/valeur.

| Cle | Valeur |
|---|---|
| Nom_Evenement | La Porra Aquionparle 2026 |
| Ballon_Or_Ouvert | Non |
| Date_Ouverture_Ballon_Or | 2026-07-10 |
| Date_Fermeture_Ballon_Or | 2026-07-13 |
| Pronostics_Initiaux_Ouverts | Oui |
| Date_Debut_Tournoi | 2026-06-11T17:00:00Z |
| Email_Admin_1 | alicia@example.com |
| Email_Admin_2 | marisa@example.com |
| Mot_De_Passe_Admin | ChangezMoi123 |
| Date_Finale | 2026-07-19 |

⚠️ **Très important** :
- La colonne s'appelle bien `Cle` (sans accent) et `Valeur`.
- Une ligne par paramètre, **pas de colonnes supplémentaires**.
- `Mot_De_Passe_Admin` : choisissez un mot de passe fort, c'est lui qui protège l'interface admin. **Changez-le avant le lancement public.**
- `Ballon_Or_Ouvert` : mettez `Oui` pour ouvrir le vote (l'onglet correspondant apparaît alors dans le menu des joueurs). Vous pouvez aussi piloter ceci depuis l'interface admin.
- `Pronostics_Initiaux_Ouverts` : mettez `Non` (ou laissez le tournoi démarrer, voir `Date_Debut_Tournoi`) pour fermer définitivement les pronostics initiaux.
- `Date_Debut_Tournoi` : format ISO UTC, comme `Date_Heure_UTC`. Une fois cette date dépassée, les pronostics initiaux se ferment automatiquement même si `Pronostics_Initiaux_Ouverts` = `Oui`.
- `Email_Admin_1` / `Email_Admin_2` : informatif uniquement en V1 (l'accès admin est protégé par mot de passe, pas par email).

---

## Récapitulatif — checklist avant lancement

- [ ] 11 onglets créés avec les noms exacts
- [ ] En-têtes de colonnes copiés exactement (ordre + orthographe)
- [ ] `Calendrier_Matchs` rempli avec tous les matchs et leurs `Date_Heure_UTC`
- [ ] `Defis_Actuels` rempli avec les défis linguistiques prévus
- [ ] `Parametres` rempli, mot de passe admin changé
- [ ] Le Google Sheet est partagé avec l'adresse e-mail du compte de service (voir `GUIDE_NON_DEVELOPPEUR.md`), avec le rôle **Éditeur**
