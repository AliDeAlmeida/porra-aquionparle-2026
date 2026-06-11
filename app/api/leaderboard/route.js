// app/api/leaderboard/route.js
//
// Calcule le classement general en temps reel :
// Total = Points matchs + Points pronostics initiaux + Points defis linguistiques
//
// Ce calcul est fait ici, en JavaScript, a partir des donnees brutes des
// onglets Pronostics_Matchs, Pronostics_Initiaux et Defis_Linguistiques.
// Aucune formule Google Sheets requise.

import { NextResponse } from 'next/server';
import { readSheetAsObjects } from '../../../lib/sheets';
import { TABS } from '../../../lib/schema';

// Convertit une valeur de cellule (qui peut etre un nombre, une chaine,
// une chaine avec espaces, une virgule decimale, ou vide/undefined) en
// nombre. Retourne 0 si la valeur est vide, manquante, ou non numerique.
function toNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  const str = String(value).trim();
  if (str === '') return 0;
  // Remplace une eventuelle virgule decimale par un point.
  const normalized = str.replace(',', '.');
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
}

// Normalise un identifiant joueur pour la comparaison (trim + insensible
// a la casse), afin d'eviter les ecarts dus a des espaces ou majuscules
// accidentels dans le Sheet.
function normId(value) {
  return String(value || '').trim().toUpperCase();
}

export async function GET() {
  try {
    const [
      { items: participants },
      { items: pronosticsMatchs },
      { items: pronosticsInitiaux },
      { items: defis },
    ] = await Promise.all([
      readSheetAsObjects(TABS.PARTICIPANTS),
      readSheetAsObjects(TABS.PRONOSTICS_MATCHS),
      readSheetAsObjects(TABS.PRONOSTICS_INITIAUX),
      readSheetAsObjects(TABS.DEFIS_LINGUISTIQUES),
    ]);

    const ranking = participants
      .filter((p) => {
        const statut = (p.Statut || '').trim().toLowerCase();
        return statut === '' || statut === 'actif';
      })
      .map((p) => {
        const idJoueur = p.ID_Joueur;
        const idNorm = normId(idJoueur);

        const pointsMatchs = pronosticsMatchs
          .filter((pr) => {
            // Ignore les lignes vides (sans ID_Joueur ni ID_Pronostic).
            if (!pr.ID_Joueur && !pr.ID_Pronostic) return false;
            return normId(pr.ID_Joueur) === idNorm;
          })
          .reduce((sum, pr) => sum + toNumber(pr.Points_Obtenus), 0);

        const initial = pronosticsInitiaux.find(
          (pi) => normId(pi.ID_Joueur) === idNorm
        );
        const pointsInitiaux = initial
          ? toNumber(initial.Total_Initiaux)
          : 0;

        const pointsDefis = defis
          .filter((d) => {
            if (!d.ID_Joueur && !d.ID_Bonus) return false;
            return normId(d.ID_Joueur) === idNorm;
          })
          .reduce((sum, d) => sum + toNumber(d.Points), 0);

        const total = pointsMatchs + pointsInitiaux + pointsDefis;

        return {
          idJoueur,
          prenom: p.Prenom_Pseudo,
          pointsMatchs,
          pointsInitiaux,
          pointsDefis,
          total,
        };
      });

    // Tri decroissant par total, puis par pointsMatchs en cas d'egalite
    ranking.sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return b.pointsMatchs - a.pointsMatchs;
    });

    // Attribution du rang (les ex-aequo partagent le meme rang)
    let currentRank = 0;
    let previousTotal = null;
    ranking.forEach((r, idx) => {
      if (r.total !== previousTotal) {
        currentRank = idx + 1;
        previousTotal = r.total;
      }
      r.rang = currentRank;
    });

    return NextResponse.json({ ranking });
  } catch (err) {
    console.error('Erreur /api/leaderboard', err);
    return NextResponse.json(
      { error: 'Impossible de charger le classement.' },
      { status: 500 }
    );
  }
}