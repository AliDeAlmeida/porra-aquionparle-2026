// lib/sheets.js
//
// Connexion centrale à Google Sheets.
// Toute la base de données de LA PORRA AQUÍONPARLE 2026 vit dans UN SEUL
// Google Sheet, organisé en 11 onglets (voir GOOGLE_SHEETS_STRUCTURE.md).
//
// Variables d'environnement nécessaires (à définir dans Vercel) :
// - GOOGLE_SERVICE_ACCOUNT_EMAIL
// - GOOGLE_PRIVATE_KEY
// - GOOGLE_SHEET_ID

import { google } from 'googleapis';

let cachedClient = null;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !key) {
    throw new Error(
      "Variables d'environnement Google manquantes : GOOGLE_SERVICE_ACCOUNT_EMAIL et/ou GOOGLE_PRIVATE_KEY."
    );
  }

  // Sur Vercel, les retours à la ligne de la clé privée sont stockés sous
  // forme de "\n" littéral. On les remet en vrais retours à la ligne.
  key = key.replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export function getSheetsClient() {
  if (cachedClient) return cachedClient;
  const auth = getAuth();
  cachedClient = google.sheets({ version: 'v4', auth });
  return cachedClient;
}

export function getSheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) {
    throw new Error("Variable d'environnement manquante : GOOGLE_SHEET_ID.");
  }
  return id;
}

// ---------------------------------------------------------------------------
// Helpers génériques de lecture / écriture
// ---------------------------------------------------------------------------

/**
 * Lit toutes les lignes d'un onglet (y compris l'en-tête).
 * Retourne un tableau de tableaux (valeurs brutes).
 */
export async function readSheet(tabName, range = 'A:Z') {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: `${tabName}!${range}`,
  });
  return res.data.values || [];
}

/**
 * Lit un onglet et retourne un tableau d'objets, en utilisant la première
 * ligne comme noms de colonnes.
 * Chaque objet contient aussi une propriété interne `_row` (numéro de ligne
 * réel dans le sheet, base 1, pour permettre les mises à jour ciblées).
 */
export async function readSheetAsObjects(tabName, range = 'A:Z') {
  const rows = await readSheet(tabName, range);
  if (rows.length === 0) return { headers: [], items: [] };

  const headers = rows[0].map((h) => (h || '').trim());
  const items = rows.slice(1).map((row, idx) => {
    const obj = { _row: idx + 2 }; // +2 car ligne 1 = en-tête, index 0-based
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined ? row[i] : '';
    });
    return obj;
  });

  return { headers, items };
}

/**
 * Ajoute une nouvelle ligne à la fin d'un onglet.
 * `rowArray` doit respecter l'ordre exact des colonnes de l'onglet.
 */
export async function appendRow(tabName, rowArray) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: `${tabName}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [rowArray] },
  });
}

/**
 * Met à jour une ligne complète (toutes les colonnes A->...) à un numéro
 * de ligne donné (1-based, incluant l'en-tête).
 */
export async function updateRow(tabName, rowNumber, rowArray) {
  const sheets = getSheetsClient();
  const lastCol = columnLetter(rowArray.length);
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `${tabName}!A${rowNumber}:${lastCol}${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [rowArray] },
  });
}

/**
 * Met à jour uniquement certaines cellules d'une ligne, en fournissant un
 * objet { nomColonne: valeur }. Nécessite la liste `headers` de l'onglet
 * pour mapper les noms de colonnes vers les lettres de colonnes.
 */
export async function updateCells(tabName, rowNumber, headers, valuesObj) {
  const sheets = getSheetsClient();
  const data = [];

  for (const [key, value] of Object.entries(valuesObj)) {
    const colIndex = headers.indexOf(key);
    if (colIndex === -1) continue;
    const colLetter = columnLetter(colIndex + 1);
    data.push({
      range: `${tabName}!${colLetter}${rowNumber}`,
      values: [[value]],
    });
  }

  if (data.length === 0) return;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: getSheetId(),
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data,
    },
  });
}

/**
 * Convertit un index de colonne 1-based en lettre de colonne Google Sheets
 * (1 -> A, 2 -> B, ..., 27 -> AA, etc.)
 */
export function columnLetter(index) {
  let letter = '';
  let n = index;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

/**
 * Génère un nouvel ID séquentiel de type "JO001", "PR0001", etc.
 * en se basant sur le nombre de lignes existantes + 1.
 */
export function generateId(prefix, count, padding = 3) {
  const num = String(count + 1).padStart(padding, '0');
  return `${prefix}${num}`;
}
