// lib/schema.js
//
// Définition centrale des noms d'onglets et de colonnes du Google Sheet.
// Toute modification de structure doit être répercutée ici ET dans le
// Google Sheet lui-même (les noms doivent correspondre EXACTEMENT, y
// compris les majuscules et accents... pour éviter tout problème, on
// utilise volontairement des noms de colonnes SANS accents).

export const TABS = {
  PARTICIPANTS: 'Participants',
  CALENDRIER: 'Calendrier_Matchs',
  PRONOSTICS_MATCHS: 'Pronostics_Matchs',
  PRONOSTICS_INITIAUX: 'Pronostics_Initiaux',
  RESULTATS_OFFICIELS: 'Resultats_Officiels_Tournoi',
  DEFIS_LINGUISTIQUES: 'Defis_Linguistiques',
  DEFIS_ACTUELS: 'Defis_Actuels',
  CLASSEMENT: 'Classement', // recalculé à la volée par l'app, l'onglet sert d'archive optionnelle
  VOTES_BALLON_OR: 'Votes_Ballon_Or',
  RESULTAT_BALLON_OR: 'Resultat_Ballon_Or', // recalculé à la volée
  PARAMETRES: 'Parametres',
};

export const PARTICIPANTS_COLS = [
  'ID_Joueur',
  'Prenom_Pseudo',
  'Email',
  'Date_Inscription',
  'Langue_Apprise',
  'Statut',
];

export const CALENDRIER_COLS = [
  'ID_Match',
  'Phase',
  'Equipe_A',
  'Equipe_B',
  'Date_Match',
  'Heure_Coup_Envoi',
  'Date_Heure_UTC',
  'Statut',
  'Score_A_Reel',
  'Score_B_Reel',
];

export const PRONOSTICS_MATCHS_COLS = [
  'ID_Pronostic',
  'ID_Joueur',
  'Prenom_Pseudo',
  'ID_Match',
  'Equipe_A',
  'Equipe_B',
  'Score_A_Predit',
  'Score_B_Predit',
  'Date_Soumission',
  'Pronostic_Verrouille',
  'Points_Obtenus',
];

export const PRONOSTICS_INITIAUX_COLS = [
  'ID_Joueur',
  'Prenom_Pseudo',
  'Champion_Predit',
  'Finaliste_Predit',
  'Demi_1',
  'Demi_2',
  'Demi_3',
  'Demi_4',
  'Meilleur_Buteur_Predit',
  'Equipe_Surprise_Predit',
  'Date_Soumission',
  'Points_Champion',
  'Points_Finaliste',
  'Points_Demi',
  'Points_Buteur',
  'Points_Surprise',
  'Total_Initiaux',
];

export const RESULTATS_OFFICIELS_COLS = [
  'Champion_Officiel',
  'Finaliste_Officiel',
  'Demi_1_Officiel',
  'Demi_2_Officiel',
  'Demi_3_Officiel',
  'Demi_4_Officiel',
  'Meilleur_Buteur_Officiel',
  'Equipe_Surprise_Officielle',
];

export const DEFIS_LINGUISTIQUES_COLS = [
  'ID_Bonus',
  'ID_Joueur',
  'Prenom_Pseudo',
  'Nom_Defi',
  'Langue',
  'Points',
  'Date_Attribution',
  'Commentaire',
];

export const DEFIS_ACTUELS_COLS = [
  'ID_Defi',
  'Nom_Defi',
  'Description',
  'Langue',
  'Points_Max',
  'Date_Debut',
  'Date_Fin',
  'Statut',
];

export const VOTES_BALLON_OR_COLS = [
  'ID_Vote',
  'ID_Votant',
  'Nom_Votant',
  'ID_Candidat',
  'Nom_Candidat',
  'Motivation',
  'Date_Vote',
];

export const PARAMETRES_KEYS = {
  NOM_EVENEMENT: 'Nom_Evenement',
  BALLON_OR_OUVERT: 'Ballon_Or_Ouvert',
  DATE_OUVERTURE_BALLON_OR: 'Date_Ouverture_Ballon_Or',
  DATE_FERMETURE_BALLON_OR: 'Date_Fermeture_Ballon_Or',
  PRONOSTICS_INITIAUX_OUVERTS: 'Pronostics_Initiaux_Ouverts',
  DATE_DEBUT_TOURNOI: 'Date_Debut_Tournoi',
  EMAIL_ADMIN_1: 'Email_Admin_1',
  EMAIL_ADMIN_2: 'Email_Admin_2',
  MOT_DE_PASSE_ADMIN: 'Mot_De_Passe_Admin',
  DATE_FINALE: 'Date_Finale',
};

// Liste des 32 équipes qualifiées (à ajuster si besoin avant le tournoi).
// Utilisée pour les grilles de sélection des pronostics initiaux.
export const EQUIPES_32 = [
  { code: 'AR', nom: 'Argentine', drapeau: '🇦🇷' },
  { code: 'BR', nom: 'Bresil', drapeau: '🇧🇷' },
  { code: 'FR', nom: 'France', drapeau: '🇫🇷' },
  { code: 'ES', nom: 'Espagne', drapeau: '🇪🇸' },
  { code: 'DE', nom: 'Allemagne', drapeau: '🇩🇪' },
  { code: 'PT', nom: 'Portugal', drapeau: '🇵🇹' },
  { code: 'NL', nom: 'Pays-Bas', drapeau: '🇳🇱' },
  { code: 'BE', nom: 'Belgique', drapeau: '🇧🇪' },
  { code: 'EN', nom: 'Angleterre', drapeau: '🏴' },
  { code: 'IT', nom: 'Italie', drapeau: '🇮🇹' },
  { code: 'UY', nom: 'Uruguay', drapeau: '🇺🇾' },
  { code: 'CO', nom: 'Colombie', drapeau: '🇨🇴' },
  { code: 'MX', nom: 'Mexique', drapeau: '🇲🇽' },
  { code: 'US', nom: 'Etats-Unis', drapeau: '🇺🇸' },
  { code: 'CA', nom: 'Canada', drapeau: '🇨🇦' },
  { code: 'MA', nom: 'Maroc', drapeau: '🇲🇦' },
  { code: 'JP', nom: 'Japon', drapeau: '🇯🇵' },
  { code: 'KR', nom: 'Coree du Sud', drapeau: '🇰🇷' },
  { code: 'CH', nom: 'Suisse', drapeau: '🇨🇭' },
  { code: 'HR', nom: 'Croatie', drapeau: '🇭🇷' },
  { code: 'DK', nom: 'Danemark', drapeau: '🇩🇰' },
  { code: 'SN', nom: 'Senegal', drapeau: '🇸🇳' },
  { code: 'RS', nom: 'Serbie', drapeau: '🇷🇸' },
  { code: 'PL', nom: 'Pologne', drapeau: '🇵🇱' },
  { code: 'AU', nom: 'Australie', drapeau: '🇦🇺' },
  { code: 'EC', nom: 'Equateur', drapeau: '🇪🇨' },
  { code: 'IR', nom: 'Iran', drapeau: '🇮🇷' },
  { code: 'SA', nom: 'Arabie Saoudite', drapeau: '🇸🇦' },
  { code: 'GH', nom: 'Ghana', drapeau: '🇬🇭' },
  { code: 'CM', nom: 'Cameroun', drapeau: '🇨🇲' },
  { code: 'TN', nom: 'Tunisie', drapeau: '🇹🇳' },
  { code: 'AT', nom: 'Autriche', drapeau: '🇦🇹' },
];
