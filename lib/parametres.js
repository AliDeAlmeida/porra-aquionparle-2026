// lib/parametres.js
//
// Helper pour lire l'onglet Parametres (cle/valeur) sous forme d'objet.

import { readSheet } from './sheets';
import { TABS } from './schema';

let cache = null;
let cacheTime = 0;
const CACHE_DURATION_MS = 10 * 1000; // 10 secondes, evite trop d'appels API

export async function getParametres(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cache && now - cacheTime < CACHE_DURATION_MS) {
    return cache;
  }

  const rows = await readSheet(TABS.PARAMETRES, 'A:B');
  const params = {};
  // On ignore la premiere ligne (en-tetes "Cle" / "Valeur")
  for (let i = 1; i < rows.length; i++) {
    const [key, value] = rows[i];
    if (key) params[key.trim()] = value !== undefined ? value : '';
  }

  cache = params;
  cacheTime = now;
  return params;
}
