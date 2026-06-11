// lib/adminAuth.js
//
// Verification simple du mot de passe admin (Onglet Parametres,
// cle Mot_De_Passe_Admin). Pas de gestion de session complexe :
// le mot de passe est envoye avec chaque requete admin (header
// x-admin-password), stocke cote client en sessionStorage apres
// la premiere saisie reussie.

import { getParametres } from './parametres';
import { PARAMETRES_KEYS } from './schema';

export async function verifyAdminPassword(providedPassword) {
  const params = await getParametres();
  const realPassword = params[PARAMETRES_KEYS.MOT_DE_PASSE_ADMIN] || '';
  if (!realPassword) {
    // Si aucun mot de passe n'est defini dans le sheet, on bloque par
    // securite (il faut le configurer avant le lancement).
    return false;
  }
  return providedPassword === realPassword;
}
