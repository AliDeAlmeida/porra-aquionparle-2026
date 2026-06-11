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
      .filter((p) => (p.Statut || '').trim().toLowerCase() === 'actif')
      .map((p) => {
        const idJoueur = p.ID_Joueur;

        const pointsMatchs = pronosticsMatchs
          .filter((pr) => pr.ID_Joueur === idJoueur)
          .reduce((sum, pr) => {
            const pts = pr.Points_Obtenus;
            return sum + (pts !== '' && pts !== undefined ? Number(pts) : 0);
          }, 0);

        const initial = pronosticsInitiaux.find(
          (pi) => pi.ID_Joueur === idJoueur
        );
        const pointsInitiaux = initial
          ? Number(initial.Total_Initiaux || 0)
          : 0;

        const pointsDefis = defis
          .filter((d) => d.ID_Joueur === idJoueur)
          .reduce((sum, d) => {
            const pts = d.Points;
            return sum + (pts !== '' && pts !== undefined ? Number(pts) : 0);
          }, 0);

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
