// app/api/admin/bonus/route.js
//
// Permet aux organisatrices d'attribuer manuellement les points bonus
// des defis linguistiques (regle 8 : maximum 20 points par defi,
// attribues librement par les organisatrices).
//
// GET  : retourne la liste des participants + des defis (pour les menus
//        deroulants de l'interface admin).
// POST : enregistre TOUJOURS une NOUVELLE ligne de bonus pour un joueur +
//        un defi. Aucune ligne existante n'est jamais mise a jour ou
//        remplacee : un meme joueur peut recevoir plusieurs bonus pour le
//        meme defi (ex. participations multiples), et le classement
//        additionne toutes les lignes de Defis_Linguistiques pour cet
//        ID_Joueur.

import { NextResponse } from 'next/server';
import {
  readSheetAsObjects,
  appendRow,
  generateId,
} from '../../../../lib/sheets';
import { TABS, DEFIS_LINGUISTIQUES_COLS } from '../../../../lib/schema';
import { verifyAdminPassword } from '../../../../lib/adminAuth';

const MAX_POINTS_PAR_DEFI = 20;

export async function GET(request) {
  try {
    const password = request.headers.get('x-admin-password') || '';
    const ok = await verifyAdminPassword(password);
    if (!ok) {
      return NextResponse.json({ error: 'Non autorise.' }, { status: 401 });
    }

    const [{ items: participants }, { items: defisActuels }, { items: bonus }] =
      await Promise.all([
        readSheetAsObjects(TABS.PARTICIPANTS),
        readSheetAsObjects(TABS.DEFIS_ACTUELS),
        readSheetAsObjects(TABS.DEFIS_LINGUISTIQUES),
      ]);

    return NextResponse.json({
      participants: participants
        .filter((p) => (p.Statut || '').trim().toLowerCase() === 'actif')
        .map((p) => ({ idJoueur: p.ID_Joueur, prenom: p.Prenom_Pseudo })),
      defis: defisActuels.map((d) => ({
        idDefi: d.ID_Defi,
        nom: d.Nom_Defi,
        langue: d.Langue,
        pointsMax: Number(d.Points_Max || MAX_POINTS_PAR_DEFI),
      })),
      bonusExistants: bonus
        .filter((b) => b.ID_Joueur && String(b.ID_Joueur).trim() !== '')
        .map((b) => ({
          idJoueur: b.ID_Joueur,
          nomDefi: b.Nom_Defi,
          points: Number(b.Points || 0),
          commentaire: b.Commentaire || '',
          dateAttribution: b.Date_Attribution || '',
        })),
    });
  } catch (err) {
    console.error('Erreur GET /api/admin/bonus', err);
    return NextResponse.json(
      { error: 'Impossible de charger les donnees.' },
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
    const { idJoueur, prenom, nomDefi, langue, points, commentaire } = body;

    if (!idJoueur || !nomDefi || points === undefined || points === null) {
      return NextResponse.json(
        { error: 'Informations manquantes.' },
        { status: 400 }
      );
    }

    let pointsFinal = Number(points);
    if (isNaN(pointsFinal) || pointsFinal < 0) pointsFinal = 0;
    if (pointsFinal > MAX_POINTS_PAR_DEFI) pointsFinal = MAX_POINTS_PAR_DEFI;

    const { items } = await readSheetAsObjects(TABS.DEFIS_LINGUISTIQUES);

    const dateAttribution = new Date().toISOString();

    // Toujours ajouter une nouvelle ligne, jamais mettre a jour ou
    // remplacer une ligne existante. Cela permet d'attribuer plusieurs
    // bonus au meme joueur pour le meme defi (ex. participations
    // multiples) ; le classement additionnera toutes les lignes.
    const idBonus = generateId('BO', items.length, 4);
    const row = DEFIS_LINGUISTIQUES_COLS.map((col) => {
      switch (col) {
        case 'ID_Bonus':
          return idBonus;
        case 'ID_Joueur':
          return idJoueur;
        case 'Prenom_Pseudo':
          return prenom || '';
        case 'Nom_Defi':
          return nomDefi;
        case 'Langue':
          return langue || '';
        case 'Points':
          return pointsFinal;
        case 'Date_Attribution':
          return dateAttribution;
        case 'Commentaire':
          return commentaire || '';
        default:
          return '';
      }
    });
    await appendRow(TABS.DEFIS_LINGUISTIQUES, row);

    return NextResponse.json({ success: true, pointsAttribues: pointsFinal });
  } catch (err) {
    console.error('Erreur POST /api/admin/bonus', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement.' },
      { status: 500 }
    );
  }
}
