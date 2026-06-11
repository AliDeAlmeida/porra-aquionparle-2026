// app/api/initial-prognostic/route.js
//
// Gere les pronostics initiaux (regle 5) :
// - Champion du monde (20 pts)
// - Finaliste (10 pts)
// - 4 demi-finalistes (5 pts par equipe correcte)
// - Meilleur buteur (15 pts)
// - Equipe surprise (10 pts)
//
// Ces pronostics ne peuvent etre soumis QU'UNE SEULE FOIS et ne peuvent
// plus etre modifies une fois la competition commencee
// (Pronostics_Initiaux_Ouverts passe a "Non", ou Date_Debut_Tournoi atteinte).

import { NextResponse } from 'next/server';
import {
  readSheetAsObjects,
  appendRow,
} from '../../../lib/sheets';
import { TABS, PRONOSTICS_INITIAUX_COLS, PARAMETRES_KEYS } from '../../../lib/schema';
import { getParametres } from '../../../lib/parametres';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idJoueur = searchParams.get('idJoueur');

    const { items } = await readSheetAsObjects(TABS.PRONOSTICS_INITIAUX);
    const existing = items.find((p) => p.ID_Joueur === idJoueur);

    const params = await getParametres();
    const tournamentStarted = isTournamentStarted(params);

    return NextResponse.json({
      hasSubmitted: !!existing,
      tournamentStarted,
      data: existing || null,
    });
  } catch (err) {
    console.error('Erreur GET /api/initial-prognostic', err);
    return NextResponse.json(
      { error: 'Impossible de charger tes pronostics initiaux.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      idJoueur,
      prenom,
      champion,
      finaliste,
      demis, // tableau de 4 codes equipe
      buteur,
      surprise,
    } = body;

    if (
      !idJoueur ||
      !champion ||
      !finaliste ||
      !Array.isArray(demis) ||
      demis.length !== 4 ||
      demis.some((d) => !d) ||
      !buteur ||
      !surprise
    ) {
      return NextResponse.json(
        { error: 'Merci de completer toutes les categories de pronostics.' },
        { status: 400 }
      );
    }

    const params = await getParametres();
    if (isTournamentStarted(params)) {
      return NextResponse.json(
        {
          error:
            'La competition a deja commence. Les pronostics initiaux ne sont plus modifiables.',
        },
        { status: 403 }
      );
    }

    const { items } = await readSheetAsObjects(TABS.PRONOSTICS_INITIAUX);
    const existing = items.find((p) => p.ID_Joueur === idJoueur);

    if (existing) {
      return NextResponse.json(
        {
          error:
            'Tu as deja soumis tes pronostics initiaux. Ils ne peuvent etre soumis qu\'une seule fois.',
        },
        { status: 403 }
      );
    }

    const dateSoumission = new Date().toISOString();

    const row = PRONOSTICS_INITIAUX_COLS.map((col) => {
      switch (col) {
        case 'ID_Joueur':
          return idJoueur;
        case 'Prenom_Pseudo':
          return prenom || '';
        case 'Champion_Predit':
          return champion;
        case 'Finaliste_Predit':
          return finaliste;
        case 'Demi_1':
          return demis[0];
        case 'Demi_2':
          return demis[1];
        case 'Demi_3':
          return demis[2];
        case 'Demi_4':
          return demis[3];
        case 'Meilleur_Buteur_Predit':
          return buteur;
        case 'Equipe_Surprise_Predit':
          return surprise;
        case 'Date_Soumission':
          return dateSoumission;
        case 'Points_Champion':
        case 'Points_Finaliste':
        case 'Points_Demi':
        case 'Points_Buteur':
        case 'Points_Surprise':
        case 'Total_Initiaux':
          return 0; // calcules plus tard, une fois le tournoi termine
        default:
          return '';
      }
    });

    await appendRow(TABS.PRONOSTICS_INITIAUX, row);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur POST /api/initial-prognostic', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue. Tes reponses sont conservees, reessaie.' },
      { status: 500 }
    );
  }
}

function isTournamentStarted(params) {
  if (params[PARAMETRES_KEYS.PRONOSTICS_INITIAUX_OUVERTS] === 'Non') return true;
  const dateDebut = params[PARAMETRES_KEYS.DATE_DEBUT_TOURNOI];
  if (dateDebut) {
    const d = new Date(dateDebut);
    if (!isNaN(d.getTime()) && Date.now() >= d.getTime()) return true;
  }
  return false;
}
