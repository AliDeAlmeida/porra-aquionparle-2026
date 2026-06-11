// lib/points.js
//
// Toute la logique de calcul des points est centralisée ici, en JavaScript,
// côté serveur (API routes Next.js). Google Sheets ne contient AUCUNE
// formule de calcul : il ne stocke que les valeurs déjà calculées par
// l'application. Cela rend le système robuste et indépendant des quirks
// de Google Sheets.

/**
 * Calcule les points d'un pronostic de match selon le règlement :
 * - Score exact : +5
 * - Vainqueur correctement identifié : +3
 * - Match nul correctement identifié : +3
 * - Mauvais pronostic : 0
 *
 * @param {number} predA - score prédit équipe A
 * @param {number} predB - score prédit équipe B
 * @param {number} realA - score réel équipe A
 * @param {number} realB - score réel équipe B
 * @returns {number} points obtenus (0, 3 ou 5)
 */
export function computeMatchPoints(predA, predB, realA, realB) {
  if (
    predA === null ||
    predA === undefined ||
    predB === null ||
    predB === undefined ||
    realA === null ||
    realA === undefined ||
    realB === null ||
    realB === undefined ||
    realA === '' ||
    realB === ''
  ) {
    return null; // résultat pas encore connu
  }

  predA = Number(predA);
  predB = Number(predB);
  realA = Number(realA);
  realB = Number(realB);

  // Score exact
  if (predA === realA && predB === realB) return 5;

  const predResult = sign(predA - predB); // 1 = A gagne, -1 = B gagne, 0 = nul
  const realResult = sign(realA - realB);

  if (predResult === realResult) return 3;

  return 0;
}

function sign(n) {
  if (n > 0) return 1;
  if (n < 0) return -1;
  return 0;
}

/**
 * Calcule les points des pronostics initiaux selon le règlement :
 * - Champion du monde : 20 points
 * - Finaliste : 10 points
 * - Les 4 demi-finalistes : 5 points par équipe correctement pronostiquée
 * - Meilleur buteur : 15 points
 * - Équipe surprise : 10 points
 *
 * @param {object} pred - { champion, finaliste, demis: [d1,d2,d3,d4], buteur, surprise }
 * @param {object} officiel - { champion, finaliste, demis: [d1,d2,d3,d4], buteur, surprise }
 * @returns {object} { pointsChampion, pointsFinaliste, pointsDemi, pointsButeur, pointsSurprise, total }
 */
export function computeInitialPoints(pred, officiel) {
  const pointsChampion =
    officiel.champion && pred.champion === officiel.champion ? 20 : 0;

  const pointsFinaliste =
    officiel.finaliste && pred.finaliste === officiel.finaliste ? 10 : 0;

  let pointsDemi = 0;
  const officielDemis = (officiel.demis || []).filter(Boolean);
  for (const d of pred.demis || []) {
    if (d && officielDemis.includes(d)) {
      pointsDemi += 5;
    }
  }

  const pointsButeur =
    officiel.buteur &&
    pred.buteur &&
    normalizeName(pred.buteur) === normalizeName(officiel.buteur)
      ? 15
      : 0;

  const pointsSurprise =
    officiel.surprise && pred.surprise === officiel.surprise ? 10 : 0;

  const total =
    pointsChampion + pointsFinaliste + pointsDemi + pointsButeur + pointsSurprise;

  return {
    pointsChampion,
    pointsFinaliste,
    pointsDemi,
    pointsButeur,
    pointsSurprise,
    total,
  };
}

function normalizeName(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // retire les accents
}

/**
 * Détermine si un match est verrouillé : la date/heure actuelle a dépassé
 * la date/heure UTC du coup d'envoi.
 */
export function isMatchLocked(dateHeureUTC) {
  if (!dateHeureUTC) return false;
  const kickoff = new Date(dateHeureUTC);
  if (isNaN(kickoff.getTime())) return false;
  return Date.now() >= kickoff.getTime();
}

/**
 * Calcule le statut effectif d'un match en combinant le statut stocké et
 * l'heure actuelle. Le statut "Termine" doit être positionné manuellement
 * par les organisatrices (ou déduit de la présence d'un score réel) ;
 * "Verrouille" est déduit automatiquement de l'heure.
 */
export function effectiveMatchStatus(match) {
  const hasRealScore =
    match.Score_A_Reel !== '' &&
    match.Score_A_Reel !== undefined &&
    match.Score_B_Reel !== '' &&
    match.Score_B_Reel !== undefined;

  if (hasRealScore) return 'Termine';
  if (isMatchLocked(match.Date_Heure_UTC)) return 'Verrouille';
  return 'A venir';
}

/**
 * Formate un compte à rebours lisible jusqu'à une date UTC donnée.
 * Retourne null si la date est dépassée.
 */
export function formatCountdown(dateHeureUTC) {
  if (!dateHeureUTC) return null;
  const target = new Date(dateHeureUTC).getTime();
  const now = Date.now();
  const diffMs = target - now;
  if (diffMs <= 0) return null;

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}
