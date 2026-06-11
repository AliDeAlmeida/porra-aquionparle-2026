'use client';

import { useEffect, useState } from 'react';

const COOKIE_NAME = 'porra_session';

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';').map((c) => c.trim());
  const found = cookies.find((c) => c.startsWith(`${name}=`));
  if (!found) return null;
  try {
    return JSON.parse(decodeURIComponent(found.split('=').slice(1).join('=')));
  } catch {
    return null;
  }
}

/**
 * Hook client pour recuperer la session du joueur (idJoueur, prenom, email)
 * stockee dans un cookie. Retourne null pendant le chargement initial,
 * puis l'objet session ou `false` si aucune session n'existe.
 */
export function useSession() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const s = readCookie(COOKIE_NAME);
    setSession(s || false);
  }, []);

  return session;
}
