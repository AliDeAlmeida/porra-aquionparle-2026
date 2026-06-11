// app/api/history/route.js
//
// Retourne l'historique personnel d'un joueur :
// - tous ses pronostics de matchs (avec resultats si disponibles)
// - ses pronostics initiaux (avec points si le tournoi est termine)
// - tous ses bonus de defis linguistiques
// Trie par date decroissante pour affichage chronologique.

import { NextResponse } from 'next/server';
import { readSheetAsObjects } from '../../../lib/sheets';
import { TABS } from '../../../lib/schema';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idJoueur = searchParams.get('idJoueur');

    if (!idJoueur) {
      return NextResponse.json({ error: 'idJoueur manquant.' }, { status: 400 });
    }

    const [
      { items: pronosticsMatchs },
      { items: matches },
      { items: pronosticsInitiaux },
      { items: defis },
    ] = await Promise.all([
      readSheetAsObjects(TABS.PRONOSTICS_MATCHS),
      readSheetAsObjects(TABS.CALENDRIER),
      readSheetAsObjects(TABS.PRONOSTICS_INITIAUX),
      readSheetAsObjects(TABS.DEFIS_LINGUISTIQUES),
    ]);

    const events = [];

    // Pronostics de matchs
    pronosticsMatchs
      .filter((p) => p.ID_Joueur === idJoueur)
      .forEach((p) => {
        const match = matches.find((m) => m.ID_Match === p.ID_Match);
        const hasResult =
          match &&
          match.Score_A_Reel !== '' &&
          match.Score_A_Reel !== undefined &&
          match.Score_B_Reel !== '' &&
          match.Score_B_Reel !== undefined;

        events.push({
          type: 'match',
          date: match ? match.Date_Heure_UTC : p.Date_Soumission,
          equipeA: p.Equipe_A,
          equipeB: p.Equipe_B,
          pronostic: `${p.Score_A_Predit}-${p.Score_B_Predit}`,
          resultat: hasResult
            ? `${match.Score_A_Reel}-${match.Score_B_Reel}`
            : null,
          points:
            p.Points_Obtenus !== '' && p.Points_Obtenus !== undefined
              ? Number(p.Points_Obtenus)
              : null,
        });
      });

    // Pronostics initiaux
    const initial = pronosticsInitiaux.find((p) => p.ID_Joueur === idJoueur);
    if (initial) {
      events.push({
        type: 'initial',
        date: initial.Date_Soumission,
        resume: `Champion: ${initial.Champion_Predit}, Finaliste: ${initial.Finaliste_Predit}`,
        points: Number(initial.Total_Initiaux || 0),
        isFinal:
          Number(initial.Total_Initiaux || 0) > 0 ||
          (initial.Points_Champion !== '' &&
            initial.Points_Champion !== undefined),
      });
    }

    // Defis linguistiques
    defis
      .filter((d) => d.ID_Joueur === idJoueur)
      .forEach((d) => {
        events.push({
          type: 'challenge',
          date: d.Date_Attribution,
          nom: d.Nom_Defi,
          langue: d.Langue,
          points: Number(d.Points || 0),
          commentaire: d.Commentaire || '',
        });
      });

    // Tri decroissant par date
    events.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ events });
  } catch (err) {
    console.error('Erreur /api/history', err);
    return NextResponse.json(
      { error: 'Impossible de charger ton historique.' },
      { status: 500 }
    );
  }
}
