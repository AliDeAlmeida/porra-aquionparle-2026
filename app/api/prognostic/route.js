// app/api/prognostic/route.js
//
// Permet a un joueur de soumettre OU de modifier son pronostic pour un
// match donne, tant que celui-ci n'est pas verrouille (coup d'envoi non
// atteint).
//
// Verrouillage des pronostics (regle 7) :
// - automatiquement ferme au coup d'envoi officiel
// - aucune modification, suppression ou nouveau pronostic possible apres

import { NextResponse } from 'next/server';
import {
  readSheetAsObjects,
  appendRow,
  updateCells,
  generateId,
} from '../../../lib/sheets';
import { TABS, PRONOSTICS_MATCHS_COLS } from '../../../lib/schema';
import { isMatchLocked, computeMatchPoints } from '../../../lib/points';

export async function POST(request) {
  try {
    const body = await request.json();
    const { idJoueur, prenom, idMatch, scoreA, scoreB } = body;

    if (!idJoueur || !idMatch) {
      return NextResponse.json(
        { error: 'Informations manquantes.' },
        { status: 400 }
      );
    }

    if (
      scoreA === undefined ||
      scoreB === undefined ||
      scoreA === null ||
      scoreB === null ||
      scoreA < 0 ||
      scoreB < 0 ||
      !Number.isInteger(Number(scoreA)) ||
      !Number.isInteger(Number(scoreB))
    ) {
      return NextResponse.json(
        { error: 'Le score doit etre un nombre entier positif.' },
        { status: 400 }
      );
    }

    // 1. Verifier que le match existe et n'est pas verrouille
    const { items: matches } = await readSheetAsObjects(TABS.CALENDRIER);
    const match = matches.find((m) => m.ID_Match === idMatch);

    if (!match) {
      return NextResponse.json(
        { error: 'Ce match est introuvable.' },
        { status: 404 }
      );
    }

    if (isMatchLocked(match.Date_Heure_UTC)) {
      return NextResponse.json(
        {
          error:
            'Ce match a deja commence. Ton pronostic ne peut plus etre enregistre.',
          locked: true,
        },
        { status: 403 }
      );
    }

    // 2. Verifier si un pronostic existe deja pour ce joueur + ce match
    const { headers, items: pronostics } = await readSheetAsObjects(
      TABS.PRONOSTICS_MATCHS
    );
    const existing = pronostics.find(
      (p) => p.ID_Joueur === idJoueur && p.ID_Match === idMatch
    );

    const dateSoumission = new Date().toISOString();

    // Calcul des points si le resultat reel est deja connu (cas rare mais
    // possible si l'admin a deja saisi un score avant le coup d'envoi
    // officiel - peu probable mais on reste robuste)
    const points = computeMatchPoints(
      scoreA,
      scoreB,
      match.Score_A_Reel,
      match.Score_B_Reel
    );

    if (existing) {
      // Mise a jour du pronostic existant
      await updateCells(TABS.PRONOSTICS_MATCHS, existing._row, headers, {
        Score_A_Predit: scoreA,
        Score_B_Predit: scoreB,
        Date_Soumission: dateSoumission,
        Pronostic_Verrouille: 'Non',
        Points_Obtenus: points !== null ? points : '',
      });
    } else {
      // Creation d'un nouveau pronostic
      const idPronostic = generateId('PR', pronostics.length, 5);
      const row = PRONOSTICS_MATCHS_COLS.map((col) => {
        switch (col) {
          case 'ID_Pronostic':
            return idPronostic;
          case 'ID_Joueur':
            return idJoueur;
          case 'Prenom_Pseudo':
            return prenom || '';
          case 'ID_Match':
            return idMatch;
          case 'Equipe_A':
            return match.Equipe_A;
          case 'Equipe_B':
            return match.Equipe_B;
          case 'Score_A_Predit':
            return scoreA;
          case 'Score_B_Predit':
            return scoreB;
          case 'Date_Soumission':
            return dateSoumission;
          case 'Pronostic_Verrouille':
            return 'Non';
          case 'Points_Obtenus':
            return points !== null ? points : '';
          default:
            return '';
        }
      });
      await appendRow(TABS.PRONOSTICS_MATCHS, row);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur /api/prognostic', err);
    return NextResponse.json(
      {
        error:
          "Impossible d'enregistrer ton pronostic. Verifie ta connexion et reessaie.",
      },
      { status: 500 }
    );
  }
}
