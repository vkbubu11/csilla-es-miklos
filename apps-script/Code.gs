/**
 * Csilla & Miklós – esküvői weboldal háttere (Google Apps Script)
 *
 *  1) Visszajelzések  → „Visszajelzések” munkalap ebben a táblázatban
 *  2) Vendégfotók     → a FOTO_MAPPA_ID Drive-mappába (+ napló a „Fotófeltöltések” lapon)
 *
 * Beüzemelés (egyszer kell):
 *  1. Nyisd meg a táblázatot → Bővítmények → Apps Script.
 *  2. Töröld a mintakódot, és másold be ezt a teljes fájlt. Mentés.
 *  3. Futtasd egyszer a „proba” függvényt (felül a ▶ Futtatás gomb), és engedélyezd
 *     a hozzáférést a táblázathoz és a Drive-hoz.
 *  4. Telepítés → Új telepítés → Típus: Webalkalmazás
 *       Végrehajtás mint: Én
 *       Hozzáférés: Bárki
 *     → Telepítés → másold ki a „Webalkalmazás URL”-t.
 *  5. Az URL-t írd be a weboldal js/config.js fájljában a scriptUrl mezőbe.
 *
 * Ha később módosítod ezt a kódot: Telepítés → Telepítések kezelése →
 * ceruza → Verzió: Új verzió → Telepítés (az URL ugyanaz marad).
 */

// A vendégfotók Drive-mappája
const FOTO_MAPPA_ID = '12qjLuGA0u1yCL21Nw-NKYb0h8PcYeuZo';
const MAX_FAJL_MB = 45;
const ENGEDETT_TIPUSOK = /^(image|video)\//;

// Visszajelzések munkalapja
const SHEET_NAME = 'Visszajelzések';
const FOTO_NAPLO = 'Fotófeltöltések';

// Oszlopok: [mező neve az űrlapon, fejléc a táblázatban]
const COLUMNS = [
  ['_ido',       'Időpont'],
  ['nev',        'Név'],
  ['reszvetel',  'Részvétel'],
  ['felnottek',  'Felnőttek'],
  ['gyerekek',   'Gyerekek'],
  ['kiserok',    'Kísérők'],
  ['szallas',    'Szállás'],
  ['zene',       'Zenekérés'],
  ['uzenet',     'Üzenet'],
  ['szinvilag',  'Választott színvilág']
];

function doPost(e) {
  try {
    // Fotófeltöltés: JSON törzs (text/plain), action = "upload"
    if (e && e.postData && e.postData.contents && e.postData.contents.charAt(0) === '{') {
      const body = JSON.parse(e.postData.contents);
      if (body.action === 'upload') return json_(feltoltes_(body));
    }
    return json_(visszajelzes_((e && e.parameter) || {}));
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, info: 'Csilla & Miklós végpont működik.' });
}

/* ---------- Visszajelzés ---------- */
function visszajelzes_(p) {
  if (p.weboldal) return { ok: true }; // spamcsapda
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_(SHEET_NAME, COLUMNS.map(c => c[1]));
    sheet.appendRow(COLUMNS.map(([key]) => key === '_ido' ? new Date() : safe_(p[key])));
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Fotófeltöltés ---------- */
function feltoltes_(b) {
  if (b.weboldal) return { ok: true }; // spamcsapda
  const type = String(b.type || '');
  if (!ENGEDETT_TIPUSOK.test(type)) return { ok: false, error: 'Csak kép vagy videó tölthető fel.' };
  const bytes = Utilities.base64Decode(String(b.data || ''));
  if (!bytes.length) return { ok: false, error: 'Üres fájl.' };
  if (bytes.length > MAX_FAJL_MB * 1024 * 1024) return { ok: false, error: 'Túl nagy fájl.' };

  const ki = String(b.name || '').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 60) || 'Vendég';
  const eredeti = String(b.filename || 'foto').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 120);
  const ido = Utilities.formatDate(new Date(), 'Europe/Budapest', 'yyyy-MM-dd_HH-mm-ss');
  const nev = `${ido}_${ki}_${eredeti}`;

  const file = DriveApp.getFolderById(FOTO_MAPPA_ID).createFile(Utilities.newBlob(bytes, type, nev));
  file.setDescription(`Feltöltötte: ${ki}`);

  try {
    getSheet_(FOTO_NAPLO, ['Időpont', 'Feltöltő', 'Fájl', 'Méret (MB)', 'Link'])
      .appendRow([new Date(), safe_(ki), nev, Math.round(bytes.length / 1048576 * 10) / 10, file.getUrl()]);
  } catch (err) { /* a napló nem kritikus */ }

  return { ok: true, id: file.getId() };
}

/* ---------- Segédfüggvények ---------- */
function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1F2A44').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('yyyy.mm.dd hh:mm');
  }
  return sh;
}

function safe_(v) {
  v = String(v || '').slice(0, 2000);
  return /^[=+\-@]/.test(v) ? "'" + v : v; // képletbeszúrás ellen
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Kézi próba: futtasd egyszer a szerkesztőből – egy tesztsort és egy próbaképet ír. */
function proba() {
  visszajelzes_({ nev: 'Teszt Elek', reszvetel: 'Igen, ott leszek', felnottek: '2', gyerekek: '0', szinvilag: 'Sötétkék & arany' });
  const png = Utilities.base64Encode(Utilities.newBlob('proba').getBytes());
  Logger.log(DriveApp.getFolderById(FOTO_MAPPA_ID).getName() + ' mappa elérhető.');
  Logger.log(JSON.stringify(feltoltes_({ type: 'image/png', data: png, filename: 'proba.png', name: 'Teszt' })));
}
