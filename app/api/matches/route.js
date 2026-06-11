// app/api/matches/route.js
//
// Retourne le calendrier complet des matchs, enrichi avec :
// - le statut effectif (A venir / Verrouille / Termine)
// - le pronostic du joueur connecte (si fourni via ?idJoueur=...)
// - les points obtenus si le match est termine

import { NextResponse } from 'next/server';
import { readSheetAsObjects } from '../../../lib/sheets';
import { TABS } from '../../../lib/schema';
import { effectiveMatchStatus } from '../../../lib/points';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idJoueur = searchParams.get('idJoueur');

    const { items: matches } = await readSheetAsObjects(TABS.CALENDRIER);
    const { items: pronostics } = await readSheetAsObjects(
      TABS.PRONOSTICS_MATCHS
    );

    const result = matches.map((m) => {
      const statut = effectiveMatchStatus(m);

      let monPronostic = null;
      if (idJoueur) {
        const p = pronostics.find(
          (pr) => pr.ID_Joueur === idJoueur && pr.ID_Match === m.ID_Match
        );
        if (p) {
          monPronostic = {
            scoreA: p.Score_A_Predit,
            scoreB: p.Score_B_Predit,
            points:
              p.Points_Obtenus !== '' && p.Points_Obtenus !== undefined
                ? Number(p.Points_Obtenus)
                : null,
          };
        }
      }

      return {
        idMatch: m.ID_Match,
        phase: m.Phase,
        equipeA: m.Equipe_A,
        equipeB: m.Equipe_B,
        dateMatch: m.Date_Match,
        heureCoupEnvoi: m.Heure_Coup_Envoi,
        dateHeureUTC: m.Date_Heure_UTC,
        statut,
        scoreAReel:
          m.Score_A_Reel !== '' && m.Score_A_Reel !== undefined
            ? Number(m.Score_A_Reel)
            : null,
        scoreBReel:
          m.Score_B_Reel !== '' && m.Score_B_Reel !== undefined
            ? Number(m.Score_B_Reel)
            : null,
        monPronostic,
      };
    });

    // Tri chronologique par date/heure UTC
    result.sort((a, b) => {
      const dateA = new Date(a.dateHeureUTC || 0).getTime();
      const dateB = new Date(b.dateHeureUTC || 0).getTime();
      return dateA - dateB;
    });

    return NextResponse.json({ matches: result });
  } catch (err) {
    console.error('Erreur /api/matches', err);
    return NextResponse.json(
      { error: 'Impossible de charger le calendrier.' },
      { status: 500 }
    );
  }
}
