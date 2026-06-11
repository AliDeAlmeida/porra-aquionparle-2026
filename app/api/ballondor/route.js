// app/api/ballondor/route.js
//
// Gere le Ballon d'Or AQUIONPARLE :
// - GET : retourne le statut (ouvert/ferme), la liste des participants
//   votables (tous sauf le joueur connecte), et si le joueur a deja vote.
// - POST : enregistre un vote.
//
// Regles :
// - Le vote est ouvert uniquement si Ballon_Or_Ouvert = "Oui"
// - Un seul vote par participant (verifie via ID_Votant)
// - Interdiction de voter pour soi-meme

import { NextResponse } from 'next/server';
import {
  readSheetAsObjects,
  appendRow,
  generateId,
} from '../../../lib/sheets';
import { TABS, VOTES_BALLON_OR_COLS, PARAMETRES_KEYS } from '../../../lib/schema';
import { getParametres } from '../../../lib/parametres';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idJoueur = searchParams.get('idJoueur');

    const params = await getParametres();
    const isOpen =
      (params[PARAMETRES_KEYS.BALLON_OR_OUVERT] || '').trim().toLowerCase() ===
      'oui';

    if (!isOpen) {
      return NextResponse.json({
        isOpen: false,
        message: "Le vote du Ballon d'Or n'est pas encore ouvert.",
      });
    }

    const { items: participants } = await readSheetAsObjects(
      TABS.PARTICIPANTS
    );
    const { items: votes } = await readSheetAsObjects(TABS.VOTES_BALLON_OR);

    const myVote = votes.find((v) => v.ID_Votant === idJoueur);

    const candidates = participants
      .filter(
        (p) =>
          (p.Statut || '').trim().toLowerCase() === 'actif' &&
          p.ID_Joueur !== idJoueur
      )
      .map((p) => ({ idJoueur: p.ID_Joueur, prenom: p.Prenom_Pseudo }));

    return NextResponse.json({
      isOpen: true,
      hasVoted: !!myVote,
      myVote: myVote
        ? { candidat: myVote.Nom_Candidat, motivation: myVote.Motivation }
        : null,
      candidates,
    });
  } catch (err) {
    console.error('Erreur GET /api/ballondor', err);
    return NextResponse.json(
      { error: 'Impossible de charger le Ballon d\'Or.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { idJoueur, prenom, idCandidat, nomCandidat, motivation } = body;

    if (!idJoueur || !idCandidat) {
      return NextResponse.json(
        { error: 'Selectionne un joueur pour voter.' },
        { status: 400 }
      );
    }

    if (idCandidat === idJoueur) {
      return NextResponse.json(
        { error: 'Tu ne peux pas voter pour toi-meme.' },
        { status: 403 }
      );
    }

    const params = await getParametres();
    const isOpen =
      (params[PARAMETRES_KEYS.BALLON_OR_OUVERT] || '').trim().toLowerCase() ===
      'oui';
    if (!isOpen) {
      return NextResponse.json(
        { error: "Le vote du Ballon d'Or n'est pas ouvert." },
        { status: 403 }
      );
    }

    const { items: votes } = await readSheetAsObjects(TABS.VOTES_BALLON_OR);
    const already = votes.find((v) => v.ID_Votant === idJoueur);
    if (already) {
      return NextResponse.json(
        {
          error:
            'Tu as deja vote. Un seul vote est autorise par participant.',
        },
        { status: 403 }
      );
    }

    const idVote = generateId('VO', votes.length, 4);
    const dateVote = new Date().toISOString();

    const row = VOTES_BALLON_OR_COLS.map((col) => {
      switch (col) {
        case 'ID_Vote':
          return idVote;
        case 'ID_Votant':
          return idJoueur;
        case 'Nom_Votant':
          return prenom || '';
        case 'ID_Candidat':
          return idCandidat;
        case 'Nom_Candidat':
          return nomCandidat || '';
        case 'Motivation':
          return (motivation || '').slice(0, 200);
        case 'Date_Vote':
          return dateVote;
        default:
          return '';
      }
    });

    await appendRow(TABS.VOTES_BALLON_OR, row);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur POST /api/ballondor', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue. Reessaie.' },
      { status: 500 }
    );
  }
}
