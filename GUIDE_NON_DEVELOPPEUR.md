# Guide pas à pas (sans compétences techniques) — LA PORRA AQUÍONPARLE 2026

Ce guide vous accompagne, étape par étape, pour mettre en ligne la plateforme **sans avoir besoin de savoir coder**. Comptez environ 45-60 minutes la première fois.

Vous aurez besoin de :
- Un compte Google (Gmail)
- Un compte GitHub (gratuit) — pour héberger le code
- Un compte Vercel (gratuit) — pour mettre le site en ligne

---

## Étape 1 — Créer le Google Sheet (la base de données)

1. Allez sur [sheets.google.com](https://sheets.google.com) et créez un nouveau classeur.
2. Renommez-le par exemple **"Porra Aquionparle 2026 - Données"**.
3. Ouvrez le fichier `GOOGLE_SHEETS_STRUCTURE.md` fourni avec le projet.
4. Pour **chacun des 11 onglets** listés dans ce document :
   - Créez un nouvel onglet (clic droit sur un onglet existant en bas → "Insérer une feuille")
   - Renommez-le **exactement** comme indiqué (ex. `Participants`, `Calendrier_Matchs`, etc. — attention aux majuscules et aux underscores `_`)
   - Sur la première ligne, recopiez **exactement** les en-têtes de colonnes indiqués
5. Remplissez :
   - L'onglet `Calendrier_Matchs` avec tous les matchs (au minimum les premiers, vous pourrez compléter plus tard)
   - L'onglet `Defis_Actuels` avec vos défis linguistiques
   - L'onglet `Parametres` avec vos réglages (notamment **changez le mot de passe admin**)
6. **Récupérez l'identifiant du fichier** : regardez l'URL de votre Google Sheet, elle ressemble à :
   ```
   https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXXXXXXXXXXXXXX/edit
   ```
   Copiez la partie `XXXXXXXXXXXXXXXXXXXXXXXXXXXX` — c'est votre `GOOGLE_SHEET_ID`. Notez-le de côté.

---

## Étape 2 — Créer un compte de service Google (pour que le site puisse lire/écrire dans le Sheet)

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. En haut, cliquez sur le sélecteur de projet → **"Nouveau projet"**. Nommez-le par exemple `porra-aquionparle`. Validez.
3. Une fois le projet sélectionné, allez dans le menu (☰) → **"API et services"** → **"Bibliothèque"**.
4. Recherchez **"Google Sheets API"** et cliquez sur **"Activer"**.
5. Allez ensuite dans **"API et services"** → **"Identifiants"**.
6. Cliquez sur **"+ Créer des identifiants"** → **"Compte de service"**.
7. Donnez-lui un nom (ex. `porra-sheets-bot`), cliquez sur **"Créer et continuer"**, puis **"OK"** pour passer les étapes optionnelles.
8. Une fois le compte de service créé, cliquez dessus dans la liste.
9. Allez dans l'onglet **"Clés"** → **"Ajouter une clé"** → **"Créer une clé"** → format **JSON** → **"Créer"**.
10. Un fichier `.json` se télécharge automatiquement. **Gardez-le précieusement, ne le partagez jamais publiquement.**
11. Ouvrez ce fichier JSON avec un éditeur de texte. Vous y trouverez deux informations importantes :
    - `"client_email"` : une adresse qui ressemble à `porra-sheets-bot@porra-aquionparle.iam.gserviceaccount.com` → c'est votre `GOOGLE_SERVICE_ACCOUNT_EMAIL`
    - `"private_key"` : un long texte commençant par `-----BEGIN PRIVATE KEY-----` → c'est votre `GOOGLE_PRIVATE_KEY`

---

## Étape 3 — Partager le Google Sheet avec le compte de service

1. Retournez sur votre Google Sheet.
2. Cliquez sur **"Partager"** (en haut à droite).
3. Collez l'adresse `client_email` récupérée à l'étape précédente (ex. `porra-sheets-bot@...iam.gserviceaccount.com`).
4. Donnez-lui le rôle **"Éditeur"**.
5. Décochez "Notifier les personnes" si proposé, puis cliquez sur **"Partager"** / **"Envoyer"**.

⚠️ Sans cette étape, le site ne pourra ni lire ni écrire dans votre tableau.

---

## Étape 4 — Mettre le code sur GitHub

1. Créez un compte sur [github.com](https://github.com) si vous n'en avez pas.
2. Créez un nouveau dépôt (bouton vert **"New"**), nommez-le `porra-aquionparle-2026`, laissez-le **privé** ou public selon votre préférence, ne cochez aucune case d'initialisation.
3. Téléchargez/récupérez le dossier complet du projet fourni (`porra-aquionparle/`).
4. Sur la page de votre nouveau dépôt vide, GitHub propose des instructions "…or push an existing repository". Si vous n'êtes pas à l'aise avec les commandes, vous pouvez aussi :
   - Utiliser **GitHub Desktop** (application gratuite) : ouvrez-le, "Add local repository", sélectionnez le dossier du projet, puis "Publish repository".

---

## Étape 5 — Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com) et créez un compte (vous pouvez vous connecter directement avec votre compte GitHub).
2. Cliquez sur **"Add New..."** → **"Project"**.
3. Sélectionnez le dépôt GitHub `porra-aquionparle-2026` que vous venez de créer → **"Import"**.
4. Vercel détecte automatiquement qu'il s'agit d'un projet Next.js. Ne changez rien dans les réglages de build.
5. **Avant de cliquer sur "Deploy"**, dépliez la section **"Environment Variables"** et ajoutez les 3 variables suivantes :

   | Nom | Valeur |
   |---|---|
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | l'adresse `client_email` de l'étape 2 |
   | `GOOGLE_PRIVATE_KEY` | la valeur `private_key` de l'étape 2 (voir note ci-dessous) |
   | `GOOGLE_SHEET_ID` | l'identifiant noté à l'étape 1 |

   ⚠️ **Pour `GOOGLE_PRIVATE_KEY`** : copiez la valeur **telle quelle**, avec les `\n` (les retours à la ligne sous forme de texte `\n` doivent rester présents, ne les remplacez pas par de vrais sauts de ligne). Collez le tout entre guillemets si Vercel ne le fait pas automatiquement.

6. Cliquez sur **"Deploy"**. Patientez 1 à 3 minutes.
7. Une fois terminé, Vercel vous donne une URL du type `https://porra-aquionparle-2026.vercel.app`. C'est votre site en ligne ! 🎉

---

## Étape 6 — Vérifications après déploiement

1. Ouvrez l'URL fournie par Vercel.
2. Vous devez voir la page d'accueil "LA PORRA AQUÍONPARLE 2026".
3. Cliquez sur "Commencer", inscrivez-vous avec un email de test.
4. Vérifiez dans votre Google Sheet, onglet `Participants` : une nouvelle ligne doit être apparue automatiquement.
5. Si une erreur s'affiche, vérifiez (dans cet ordre) :
   - Le Sheet est bien partagé avec le `client_email` en tant qu'**Éditeur**
   - Les noms d'onglets et d'en-têtes correspondent **exactement** à `GOOGLE_SHEETS_STRUCTURE.md`
   - Les 3 variables d'environnement sont bien renseignées dans Vercel (Project → Settings → Environment Variables), puis **redéployez** (Deployments → ... → Redeploy)

---

## Étape 7 — Accéder à l'interface admin

1. Allez sur `https://votre-site.vercel.app/admin`
2. Entrez le mot de passe défini dans l'onglet `Parametres` (clé `Mot_De_Passe_Admin`).
3. Depuis cet écran, vous pourrez :
   - Saisir les scores réels des matchs (déclenche le calcul automatique des points)
   - Attribuer des points bonus pour les défis linguistiques
   - Saisir les résultats finaux du tournoi (déclenche le calcul des pronostics initiaux)
   - Ouvrir/fermer le vote du Ballon d'Or

---

## Pendant le tournoi — utilisation au quotidien

- **Après chaque match** : allez dans l'admin → "Matchs" → saisissez le score réel → enregistrez. Les points de tous les joueurs ayant pronostiqué ce match sont recalculés automatiquement.
- **Pour les défis linguistiques** : allez dans l'admin → "Bonus" → sélectionnez le joueur et le défi → entrez les points (0 à 20) → enregistrez.
- **Pour le Ballon d'Or** : ouvrez le vote depuis l'admin quand vous le souhaitez (il apparaîtra dans le menu des joueurs), puis fermez-le et consultez les résultats.
- **À la fin du tournoi** : admin → "Résultats finaux" → renseignez champion, finaliste, demi-finalistes, meilleur buteur, équipe surprise → enregistrez. Tous les pronostics initiaux sont recalculés automatiquement.

---

## Besoin de modifier des matchs ou des défis ?

- Pour ajouter/modifier des matchs : éditez directement l'onglet `Calendrier_Matchs` du Google Sheet (les changements apparaissent sur le site en quelques secondes, pas besoin de redéployer).
- Pour ajouter des défis linguistiques : éditez directement l'onglet `Defis_Actuels`.

---

## En cas de problème

- **Le site affiche une erreur générale** : vérifiez les variables d'environnement sur Vercel et que le Sheet est bien partagé.
- **Un joueur ne retrouve pas son profil** : vérifiez que l'email saisi est identique (l'app ignore majuscules/minuscules mais pas les fautes de frappe).
- **Les points ne se calculent pas** : assurez-vous d'avoir saisi le score via l'**interface admin** (pas seulement dans le Sheet), car c'est cette action qui déclenche le calcul.
