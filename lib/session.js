// lib/session.js
//
// Le joueur est identifié uniquement par son email (aucun mot de passe).
// On stocke l'email + ID_Joueur dans un cookie simple côté navigateur,
// ce qui permet de retrouver automatiquement le profil sur cet appareil.
// Si le joueur revient depuis un AUTRE appareil, il ressaisit son email
// sur la page d'identification, et l'API /api/join le reconnaît grâce à
// l'email (identifiant unique côté Google Sheets) et lui renvoie son
// profil existant.

export const SESSION_COOKIE = 'porra_session';

/**
 * Sérialise les infos de session en valeur de cookie (JSON encodé).
 */
export function serializeSession({ idJoueur, prenom, email }) {
  return encodeURIComponent(JSON.stringify({ idJoueur, prenom, email }));
}

/**
 * Lit la session depuis l'objet `req.cookies` (API routes) ou depuis
 * `document.cookie` côté client.
 */
export function parseSessionFromCookieHeader(cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
  const raw = cookies[SESSION_COOKIE];
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export function buildSessionCookie(session) {
  const value = serializeSession(session);
  // 180 jours de validité, cookie accessible en JS (pas httpOnly) car on
  // doit pouvoir le lire côté client pour afficher "Bonjour Sophie".
  return `${SESSION_COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
