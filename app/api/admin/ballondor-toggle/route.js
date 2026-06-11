// app/api/admin/ballondor-toggle/route.js
//
// GET  : retourne le statut actuel et les dates configurees.
// POST : ouvre ou ferme le vote du Ballon d'Or (Onglet Parametres,
//        cle Ballon_Or_Ouvert = "Oui" / "Non").

import { NextResponse } from 'next/server';
import { readSheet, updateRow, appendRow } from '../../../../lib/sheets';
import { TABS, PARAMETRES_KEYS } from '../../../../lib/schema';
import { verifyAdminPassword } from '../../../../lib/adminAuth';
import { getParametres } from '../../../../lib/parametres';

export async function GET(request) {
  try {
    const password = request.headers.get('x-admin-password') || '';
    const ok = await verifyAdminPassword(password);
    if (!ok) {
      return NextResponse.json({ error: 'Non autorise.' }, { status: 401 });
    }

    const params = await getParametres(true);

    return NextResponse.json({
      ouvert:
        (params[PARAMETRES_KEYS.BALLON_OR_OUVERT] || '').trim().toLowerCase() ===
        'oui',
      dateOuverture: params[PARAMETRES_KEYS.DATE_OUVERTURE_BALLON_OR] || '',
      dateFermeture: params[PARAMETRES_KEYS.DATE_FERMETURE_BALLON_OR] || '',
    });
  } catch (err) {
    console.error('Erreur GET /api/admin/ballondor-toggle', err);
    return NextResponse.json(
      { error: 'Impossible de charger le statut.' },
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
    const { ouvert, dateOuverture, dateFermeture } = body;

    await setParametre(
      PARAMETRES_KEYS.BALLON_OR_OUVERT,
      ouvert ? 'Oui' : 'Non'
    );
    if (dateOuverture !== undefined) {
      await setParametre(
        PARAMETRES_KEYS.DATE_OUVERTURE_BALLON_OR,
        dateOuverture
      );
    }
    if (dateFermeture !== undefined) {
      await setParametre(
        PARAMETRES_KEYS.DATE_FERMETURE_BALLON_OR,
        dateFermeture
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur POST /api/admin/ballondor-toggle', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue.' },
      { status: 500 }
    );
  }
}

async function setParametre(key, value) {
  const rows = await readSheet(TABS.PARAMETRES, 'A:B');
  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if ((rows[i][0] || '').trim() === key) {
      rowIndex = i + 1; // 1-based
      break;
    }
  }

  if (rowIndex > -1) {
    await updateRow(TABS.PARAMETRES, rowIndex, [key, value]);
  } else {
    await appendRow(TABS.PARAMETRES, [key, value]);
  }
}
