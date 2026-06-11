// app/api/admin/matches/route.js
//
// GET  : retourne la liste des matchs pour l'interface admin.
// POST : enregistre le score reel d'un match et RECALCULE
//        automatiquement les points de TOUS les pronostics existants
//        pour ce match (Onglet Pronostics_Matchs).
//
// Regle : le score reel ne peut etre saisi que si le match a deja
// commence (statut effectif = "Verrouille" ou "Termine"), conformement
// a la maquette ("Disponible une fois le match commence").

import { NextResponse } from 'next/server';
import {
  readSheetAsObjects,
  updateCells,
} from '../../../../lib/sheets';
import { TABS } from '../../../../lib/schema';
import { verifyAdminPassword } from '../../../../lib/adminAuth';
import { computeMatchPoints, effectiveMatchStatus } from '../../../../lib/points';

export async function GET(request) {
  try {
    const password = request.headers.get('x-admin-password') || '';
    const ok = await verifyAdminPassword(password);
    if (!ok) {
      return NextResponse.json({ error: 'Non autorise.' }, { status: 401 });
    }

    const { items: matches } = await readSheetAsObjects(TABS.CALENDRIER);

    const result = matches.map((m) => ({
      idMatch: m.ID_Match,
      phase: m.Phase,
      equipeA: m.Equipe_A,
      equipeB: m.Equipe_B,
      dateMatch: m.Date_Match,
      heureCoupEnvoi: m.Heure_Coup_Envoi,
      dateHeureUTC: m.Date_Heure_UTC,
      statut: effectiveMatchStatus(m),
      scoreAReel:
        m.Score_A_Reel !== '' && m.Score_A_Reel !== undefined
          ? Number(m.Score_A_Reel)
          : null,
      scoreBReel:
        m.Score_B_Reel !== '' && m.Score_B_Reel !== undefined
          ? Number(m.Score_B_Reel)
          : null,
    }));

    result.sort((a, b) => {
      const dateA = new Date(a.dateHeureUTC || 0).getTime();
      const dateB = new Date(b.dateHeureUTC || 0).getTime();
      return dateA - dateB;
    });

    return NextResponse.json({ matches: result });
  } catch (err) {
    console.error('Erreur GET /api/admin/matches', err);
    return NextResponse.json(
      { error: 'Impossible de charger les matchs.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const password = request.headers.get('x-admin-password') || '';
    const ok = await verifyAdminPassword(password);
    if (!ok) {
      return NextResponse.json({ error: 'Non autorise.' }, { status: 401 });
    }

    const body = await request.json();
    const { idMatch, scoreA, scoreB } = body;

    if (
      !idMatch ||
      scoreA === undefined ||
      scoreB === undefined ||
      scoreA === null ||
      scoreB === null ||
      scoreA < 0 ||
      scoreB < 0
    ) {
      return NextResponse.json(
        { error: 'Score invalide.' },
        { status: 400 }
      );
    }

    // 1. Charger le match et verifier qu'il a bien commence
    const { headers: matchHeaders, items: matches } = await readSheetAsObjects(
      TABS.CALENDRIER
    );
    const match = matches.find((m) => m.ID_Match === idMatch);

    if (!match) {
      return NextResponse.json(
        { error: 'Match introuvable.' },
        { status: 404 }
      );
    }

    const statutEffectif = effectiveMatchStatus(match);
    if (statutEffectif === 'A venir') {
      return NextResponse.json(
        {
          error:
            'Impossible de saisir un score : le match n\'a pas encore commence.',
        },
        { status: 403 }
      );
    }

    // 2. Mettre a jour le score reel + statut "Termine"
    await updateCells(TABS.CALENDRIER, match._row, matchHeaders, {
      Score_A_Reel: scoreA,
      Score_B_Reel: scoreB,
      Statut: 'Termine',
    });

    // 3. Recalculer les points de tous les pronostics existants pour ce match
    const { headers: pronoHeaders, items: pronostics } = await readSheetAsObjects(
      TABS.PRONOSTICS_MATCHS
    );

    const concerned = pronostics.filter((p) => p.ID_Match === idMatch);

    for (const p of concerned) {
      const points = computeMatchPoints(
        p.Score_A_Predit,
        p.Score_B_Predit,
        scoreA,
        scoreB
      );
      await updateCells(TABS.PRONOSTICS_MATCHS, p._row, pronoHeaders, {
        Points_Obtenus: points !== null ? points : 0,
        Pronostic_Verrouille: 'Oui',
      });
    }

    return NextResponse.json({
      success: true,
      pronosticsRecalcules: concerned.length,
    });
  } catch (err) {
    console.error('Erreur POST /api/admin/matches', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement.' },
      { status: 500 }
    );
  }
}
