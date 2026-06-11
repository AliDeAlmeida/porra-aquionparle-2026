# LA PORRA AQUÍONPARLE 2026

Plateforme de pronostics communautaire pour la Coupe du Monde 2026, conçue pour la communauté AQUIONPARLE (apprenants de français/espagnol).

## Stack technique

- **Next.js 14** (App Router), React 18
- **Tailwind CSS** — design system "FIFA World Cup" (navy/or/rouge/bleu)
- **Google Sheets** comme unique base de données (via `googleapis` + compte de service)
- Aucune base de données traditionnelle, aucune authentification — identification par email uniquement
- Déploiement cible : **Vercel**

## Architecture du projet

```
porra-aquionparle/
├── app/
│   ├── page.js                    # Landing page
│   ├── rejoindre/                 # Identification (email + prénom)
│   ├── tableau-de-bord/           # Dashboard joueur
│   ├── calendrier/                # Calendrier des matchs + pronostics
│   ├── classement/                # Leaderboard
│   ├── defis/                     # Défis linguistiques
│   ├── historique/                # Historique personnel + graphique
│   ├── ballon-dor/                # Vote Ballon d'Or
│   ├── fin-tournoi/                # Page de fin de tournoi
│   ├── admin/                     # Interface admin (protégée par mot de passe)
│   ├── api/                       # Routes API (voir ci-dessous)
│   ├── layout.js, globals.css, not-found.js, error.js
├── components/                    # Composants UI réutilisables
├── lib/
│   ├── sheets.js                  # Connexion Google Sheets (lecture/écriture)
│   ├── schema.js                  # Définition des onglets/colonnes/constantes
│   ├── points.js                  # Calcul des points (matchs + pronostics initiaux)
│   ├── session.js / useSession.js # Session joueur via cookie (pas d'auth)
│   ├── parametres.js              # Lecture des réglages globaux (onglet Parametres)
│   └── adminAuth.js                # Vérification du mot de passe admin
├── GOOGLE_SHEETS_STRUCTURE.md     # Structure exacte des 11 onglets à créer
├── GUIDE_NON_DEVELOPPEUR.md       # Guide pas-à-pas pour les organisatrices
└── package.json
```

## Routes API

| Route | Méthode | Description |
|---|---|---|
| `/api/join` | POST | Inscription / récupération de profil par email |
| `/api/matches` | GET | Liste des matchs + pronostics du joueur |
| `/api/prognostic` | POST | Soumettre/modifier un pronostic de match |
| `/api/initial-prognostic` | GET/POST | Pronostics initiaux (avant tournoi) |
| `/api/leaderboard` | GET | Classement général |
| `/api/challenges` | GET | Défis linguistiques en cours |
| `/api/history` | GET | Historique personnel d'un joueur |
| `/api/ballondor` | GET/POST | Vote Ballon d'Or |
| `/api/admin/auth` | POST | Vérification mot de passe admin |
| `/api/admin/matches` | GET/POST | Saisie des scores réels (recalcule les points) |
| `/api/admin/bonus` | GET/POST | Attribution des points bonus défis |
| `/api/admin/final-results` | GET/POST | Résultats finaux du tournoi (recalcule pronostics initiaux) |
| `/api/admin/ballondor-toggle` | GET/POST | Ouvrir/fermer le vote Ballon d'Or |
| `/api/admin/ballondor-results` | GET | Résultats du vote Ballon d'Or |
| `/api/admin/participants` | GET | Liste des participants (admin) |

Toutes les routes `/api/admin/*` requièrent l'en-tête `x-admin-password`.

## Variables d'environnement

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Installation locale

```bash
npm install
cp .env.example .env.local   # puis renseigner les 3 variables ci-dessus
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Déploiement sur Vercel

1. Pousser le projet sur un dépôt GitHub.
2. Sur [vercel.com](https://vercel.com), "Add New Project" → importer le dépôt.
3. Next.js est détecté automatiquement, aucun réglage de build à modifier.
4. Renseigner les 3 variables d'environnement (Project Settings → Environment Variables).
5. Déployer.

Pour le détail complet (création du Google Sheet, du compte de service, partage des accès), voir **`GOOGLE_SHEETS_STRUCTURE.md`** et **`GUIDE_NON_DEVELOPPEUR.md`**.

## Règles métier (V1)

1. Saisie manuelle des résultats réels par les organisatrices (Sheets ou admin).
2. Aucune API football externe.
3. Email = identifiant unique du joueur.
4. Reconnaissance automatique d'un joueur revenant avec le même email (multi-appareil).
5. Pas de compte/mot de passe côté joueur.
6. Google Sheets = unique base de données.
7. Points bonus des défis linguistiques attribués manuellement par l'admin.

## Calcul des points

- **Pronostic de match** : score exact = 5 pts, bon résultat (victoire/nul/défaite) sans score exact = 3 pts, sinon 0 pt.
- **Pronostics initiaux** (calculés une fois les résultats officiels saisis) :
  - Champion correct : 20 pts
  - Finaliste correct : 10 pts
  - Chaque demi-finaliste correct : 5 pts (× jusqu'à 4)
  - Meilleur buteur correct : 15 pts (comparaison insensible aux accents/casse)
  - Équipe surprise correcte : 10 pts
- **Défis linguistiques** : points attribués manuellement par l'admin (0-20 par défi).
- **Total joueur** = points pronostics matchs + points pronostics initiaux + points défis.
