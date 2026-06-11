// app/api/join/route.js
//
// Gère l'identification d'un participant.
// - Si l'email existe déjà dans Participants -> renvoie le profil existant
//   (permet de retrouver son profil depuis un autre appareil).
// - Sinon -> crée une nouvelle ligne dans Participants.
//
// L'EMAIL EST L'IDENTIFIANT UNIQUE DU JOUEUR (decision finale validee).

import { NextResponse } from 'next/server';
import {
  readSheetAsObjects,
  appendRow,
  generateId,
} from '../../../lib/sheets';
import { TABS, PARTICIPANTS_COLS } from '../../../lib/schema';
import { buildSessionCookie } from '../../../lib/session';

export async function POST(request) {
  try {
    const body = await request.json();
    const prenom = (body.prenom || '').trim();
    const email = (body.email || '').trim().toLowerCase();

    if (!prenom) {
      return NextResponse.json(
        { error: 'Indique un prenom ou un pseudo pour continuer.' },
        { status: 400 }
      );
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Cette adresse email ne semble pas valide." },
        { status: 400 }
      );
    }

    const { items } = await readSheetAsObjects(TABS.PARTICIPANTS);

    // Recherche d'un participant existant avec cet email
    const existing = items.find(
      (p) => (p.Email || '').trim().toLowerCase() === email
    );

    if (existing) {
      const session = {
        idJoueur: existing.ID_Joueur,
        prenom: existing.Prenom_Pseudo,
        email: existing.Email,
      };
      const res = NextResponse.json({
        isNew: false,
        idJoueur: existing.ID_Joueur,
        prenom: existing.Prenom_Pseudo,
      });
      res.headers.set('Set-Cookie', buildSessionCookie(session));
      return res;
    }

    // Nouveau participant
    const idJoueur = generateId('JO', items.length, 3);
    const dateInscription = new Date().toISOString().slice(0, 10);

    const row = PARTICIPANTS_COLS.map((col) => {
      switch (col) {
        case 'ID_Joueur':
          return idJoueur;
        case 'Prenom_Pseudo':
          return prenom;
        case 'Email':
          return email;
        case 'Date_Inscription':
          return dateInscription;
        case 'Langue_Apprise':
          return body.langue || '';
        case 'Statut':
          return 'Actif';
        default:
          return '';
      }
    });

    await appendRow(TABS.PARTICIPANTS, row);

    const session = { idJoueur, prenom, email };
    const res = NextResponse.json({ isNew: true, idJoueur, prenom });
    res.headers.set('Set-Cookie', buildSessionCookie(session));
    return res;
  } catch (err) {
    console.error('Erreur /api/join', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue. Reessaie.' },
      { status: 500 }
    );
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
