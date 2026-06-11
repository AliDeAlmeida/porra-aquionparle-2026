// app/api/challenges/route.js
//
// Retourne les defis linguistiques (Defis_Actuels) classes en
// Actif / A venir / Termine, avec, pour les defis termines, les points
// deja attribues au joueur connecte (depuis Defis_Linguistiques).

import { NextResponse } from 'next/server';
import { readSheetAsObjects } from '../../../lib/sheets';
import { TABS } from '../../../lib/schema';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idJoueur = searchParams.get('idJoueur');

    const { items: defisActuels } = await readSheetAsObjects(
      TABS.DEFIS_ACTUELS
    );
    const { items: bonus } = await readSheetAsObjects(
      TABS.DEFIS_LINGUISTIQUES
    );

    const result = defisActuels.map((d) => {
      let monBonus = null;
      if (idJoueur) {
        const b = bonus.find(
          (x) => x.ID_Joueur === idJoueur && x.Nom_Defi === d.Nom_Defi
        );
        if (b) {
          monBonus = {
            points: Number(b.Points || 0),
            commentaire: b.Commentaire || '',
          };
        }
      }

      return {
        idDefi: d.ID_Defi,
        nom: d.Nom_Defi,
        description: d.Description,
        langue: d.Langue,
        pointsMax: Number(d.Points_Max || 20),
        dateDebut: d.Date_Debut,
        dateFin: d.Date_Fin,
        statut: (d.Statut || '').trim(),
        monBonus,
      };
    });

    return NextResponse.json({ challenges: result });
  } catch (err) {
    console.error('Erreur /api/challenges', err);
    return NextResponse.json(
      { error: 'Impossible de charger les defis.' },
      { status: 500 }
    );
  }
}