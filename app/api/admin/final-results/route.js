// app/api/admin/final-results/route.js
//
// GET  : retourne les resultats officiels actuels (s'ils existent) +
//        la liste des 32 equipes pour les menus deroulants.
// POST : enregistre les resultats officiels finaux du tournoi
//        (Champion, Finaliste, 4 demi-finalistes, Meilleur buteur,
//        Equipe surprise) et RECALCULE les points de TOUS les
//        Pronostics_Initiaux en consequence.
//
// Action irreversible cote metier (mais techniquement re-executable si
// erreur de saisie : on peut re-soumettre, ce qui recalculera a nouveau
// tous les points initiaux avec les nouvelles valeurs).

import { NextResponse } from 'next/server';
import {
  readSheetAsObjects,
  appendRow,
  updateRow,
  updateCells,
} from '../../../../lib/sheets';
import {
  TABS,
  RESULTATS_OFFICIELS_COLS,
  EQUIPES_32,
} from '../../../../lib/schema';
import { verifyAdminPassword } from '../../../../lib/adminAuth';
import { computeInitialPoints } from '../../../../lib/points';

export async function GET(request) {
  try {
    const password = request.headers.get('x-admin-password') || '';
    const ok = await verifyAdminPassword(password);
    if (!ok) {
      return NextResponse.json({ error: 'Non autorise.' }, { status: 401 });
    }

    const { items } = await readSheetAsObjects(TABS.RESULTATS_OFFICIELS);
    const current = items[0] || null;

    return NextResponse.json({
      equipes: EQUIPES_32,
      current: current
        ? {
            champion: current.Champion_Officiel,
            finaliste: current.Finaliste_Officiel,
            demis: [
              current.Demi_1_Officiel,
              current.Demi_2_Officiel,
              current.Demi_3_Officiel,
              current.Demi_4_Officiel,
            ],
            buteur: current.Meilleur_Buteur_Officiel,
            surprise: current.Equipe_Surprise_Officielle,
          }
        : null,
    });
  } catch (err) {
    console.error('Erreur GET /api/admin/final-results', err);
    return NextResponse.json(
      { error: 'Impossible de charger les resultats.' },
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
    const { champion, finaliste, demis, buteur, surprise } = body;

    if (
      !champion ||
      !finaliste ||
      !Array.isArray(demis) ||
      demis.length !== 4 ||
      demis.some((d) => !d) ||
      !buteur ||
      !surprise
    ) {
      return NextResponse.json(
        { error: 'Merci de completer tous les resultats officiels.' },
        { status: 400 }
      );
    }

    // 1. Enregistrer (ou mettre a jour) Resultats_Officiels_Tournoi
    const { items: existingResults } = await readSheetAsObjects(
      TABS.RESULTATS_OFFICIELS
    );

    const row = RESULTATS_OFFICIELS_COLS.map((col) => {
      switch (col) {
        case 'Champion_Officiel':
          return champion;
        case 'Finaliste_Officiel':
          return finaliste;
        case 'Demi_1_Officiel':
          return demis[0];
        case 'Demi_2_Officiel':
          return demis[1];
        case 'Demi_3_Officiel':
          return demis[2];
        case 'Demi_4_Officiel':
          return demis[3];
        case 'Meilleur_Buteur_Officiel':
          return buteur;
        case 'Equipe_Surprise_Officielle':
          return surprise;
        default:
          return '';
      }
    });

    if (existingResults.length > 0) {
      await updateRow(TABS.RESULTATS_OFFICIELS, existingResults[0]._row, row);
    } else {
      await appendRow(TABS.RESULTATS_OFFICIELS, row);
    }

    // 2. Recalculer les points de tous les Pronostics_Initiaux
    const officiel = { champion, finaliste, demis, buteur, surprise };

    const { headers, items: pronosticsInitiaux } = await readSheetAsObjects(
      TABS.PRONOSTICS_INITIAUX
    );

    for (const p of pronosticsInitiaux) {
      const pred = {
        champion: p.Champion_Predit,
        finaliste: p.Finaliste_Predit,
        demis: [p.Demi_1, p.Demi_2, p.Demi_3, p.Demi_4],
        buteur: p.Meilleur_Buteur_Predit,
        surprise: p.Equipe_Surprise_Predit,
      };

      const result = computeInitialPoints(pred, officiel);

      await updateCells(TABS.PRONOSTICS_INITIAUX, p._row, headers, {
        Points_Champion: result.pointsChampion,
        Points_Finaliste: result.pointsFinaliste,
        Points_Demi: result.pointsDemi,
        Points_Buteur: result.pointsButeur,
        Points_Surprise: result.pointsSurprise,
        Total_Initiaux: result.total,
      });
    }

    return NextResponse.json({
      success: true,
      joueursRecalcules: pronosticsInitiaux.length,
    });
  } catch (err) {
    console.error('Erreur POST /api/admin/final-results', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement.' },
      { status: 500 }
    );
  }
}
