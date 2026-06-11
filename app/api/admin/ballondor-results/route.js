// app/api/admin/ballondor-results/route.js
//
// Calcule le resultat du vote Ballon d'Or (classement par nombre de votes).
// Utilise par la page de fin de tournoi pour afficher le gagnant.
// Accessible publiquement (pas besoin d'etre admin) car affiche sur la
// page finale vue par tous les joueurs.

import { NextResponse } from 'next/server';
import { readSheetAsObjects } from '../../../../lib/sheets';
import { TABS } from '../../../../lib/schema';

export async function GET() {
  try {
    const { items: votes } = await readSheetAsObjects(TABS.VOTES_BALLON_OR);

    if (votes.length === 0) {
      return NextResponse.json({ resultats: [] });
    }

    const counts = {};
    votes.forEach((v) => {
      const id = v.ID_Candidat;
      if (!counts[id]) {
        counts[id] = { idCandidat: id, nomCandidat: v.Nom_Candidat, votes: 0 };
      }
      counts[id].votes += 1;
    });

    const resultats = Object.values(counts).sort((a, b) => b.votes - a.votes);

    let currentRank = 0;
    let previousVotes = null;
    resultats.forEach((r, idx) => {
      if (r.votes !== previousVotes) {
        currentRank = idx + 1;
        previousVotes = r.votes;
      }
      r.rang = currentRank;
    });

    return NextResponse.json({ resultats });
  } catch (err) {
    console.error('Erreur GET /api/admin/ballondor-results', err);
    return NextResponse.json(
      { error: 'Impossible de charger les resultats du Ballon d\'Or.' },
      { status: 500 }
    );
  }
}
