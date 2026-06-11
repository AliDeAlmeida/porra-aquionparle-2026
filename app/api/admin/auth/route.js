// app/api/admin/auth/route.js
//
// Verifie le mot de passe administrateur saisi sur la page /admin.

import { NextResponse } from 'next/server';
import { verifyAdminPassword } from '../../../../lib/adminAuth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    const ok = await verifyAdminPassword(password || '');

    if (!ok) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur /api/admin/auth', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue.' },
      { status: 500 }
    );
  }
}
