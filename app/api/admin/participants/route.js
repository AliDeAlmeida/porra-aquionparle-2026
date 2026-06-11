// app/api/admin/participants/route.js
//
// Retourne la liste complete des participants pour la vue admin
// "Vue classements" (informations brutes utiles aux organisatrices :
// email, date d'inscription, statut).

import { NextResponse } from 'next/server';
import { readSheetAsObjects } from '../../../../lib/sheets';
import { TABS } from '../../../../lib/schema';
import { verifyAdminPassword } from '../../../../lib/adminAuth';

export async function GET(request) {
  try {
    const password = request.headers.get('x-admin-password') || '';
    const ok = await verifyAdminPassword(password);
    if (!ok) {
      return NextResponse.json({ error: 'Non autorise.' }, { status: 401 });
    }

    const { items } = await readSheetAsObjects(TABS.PARTICIPANTS);

    return NextResponse.json({
      participants: items.map((p) => ({
        idJoueur: p.ID_Joueur,
        prenom: p.Prenom_Pseudo,
        email: p.Email,
        dateInscription: p.Date_Inscription,
        langue: p.Langue_Apprise,
        statut: p.Statut,
      })),
    });
  } catch (err) {
    console.error('Erreur GET /api/admin/participants', err);
    return NextResponse.json(
      { error: 'Impossible de charger les participants.' },
      { status: 500 }
    );
  }
}
