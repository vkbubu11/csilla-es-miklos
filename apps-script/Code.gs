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
  ['allergia',   'Ételallergia / étkezési igény'],
  ['zene',       'Zenekérés'],
  ['uzenet',     'Üzenet']
];

const VERZIO = 'v4 (fejléc szerinti oszlopok, ételallergia)';

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
  return json_({ ok: true, info: 'Csilla & Miklós végpont működik.', verzio: VERZIO });
}

/* ---------- Visszajelzés ---------- */
function visszajelzes_(p) {
  if (p.weboldal) return { ok: true }; // spamcsapda
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_(SHEET_NAME, COLUMNS.map(c => c[1]));
    // Oszlopok a FEJLÉC NEVE alapján: ha valaki átrendezi/törli az oszlopokat a táblázatban,
    // vagy új mező jön, akkor sem csúsznak el az adatok. A hiányzó fejlécet a végére teszi.
    let headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(String);
    COLUMNS.forEach(([, title]) => {
      if (headers.indexOf(title) < 0) {
        sheet.getRange(1, headers.length + 1).setValue(title)
          .setFontWeight('bold').setBackground('#1F2A44').setFontColor('#FFFFFF');
        headers.push(title);
      }
    });
    const row = headers.map(h => {
      const col = COLUMNS.find(c => c[1] === h);
      if (!col) return '';
      return col[0] === '_ido' ? new Date() : safe_(p[col[0]]);
    });
    sheet.appendRow(row);
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

/**
 * EGYSZERI RENDEZÉS – futtasd egyszer a szerkesztőből.
 * A korábbi szkriptverziók pozíció szerint írtak, ezért a régi sorokban az adatok
 * elcsúsztak (pl. az üzenet az „E-mail” oszlopba került). Ez a függvény a régi
 * sorokat a helyükre teszi, és a fejlécet az új oszlopokra cseréli
 * (E-mail, Telefon, Választott színvilág nélkül; Ételallergia oszloppal).
 */
function tablazatRendezese() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sh) return Logger.log('Nincs „' + SHEET_NAME + '” lap.');
  const header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  if (header.indexOf('E-mail') < 0 && header.indexOf('Választott színvilág') < 0) return Logger.log('Már rendezve van.');
  // a régi (pozíció szerinti) szkript sorrendje:
  const regi = ['_ido', 'nev', 'reszvetel', 'felnottek', 'gyerekek', 'kiserok', 'szallas', 'zene', 'uzenet', 'szinvilag'];
  const n = sh.getLastRow() - 1;
  const adatok = n > 0 ? sh.getRange(2, 1, n, Math.max(regi.length, sh.getLastColumn())).getValues() : [];
  const ujSorok = adatok.map(r => {
    const o = {}; regi.forEach((k, i) => o[k] = r[i]);
    return COLUMNS.map(([k]) => o[k] !== undefined ? o[k] : '');
  });
  sh.clear();
  sh.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS.map(c => c[1])])
    .setFontWeight('bold').setBackground('#1F2A44').setFontColor('#FFFFFF');
  if (ujSorok.length) sh.getRange(2, 1, ujSorok.length, COLUMNS.length).setValues(ujSorok);
  if (sh.getMaxColumns() > COLUMNS.length) sh.deleteColumns(COLUMNS.length + 1, sh.getMaxColumns() - COLUMNS.length);
  sh.setFrozenRows(1);
  sh.getRange('A:A').setNumberFormat('yyyy.mm.dd hh:mm');
  Logger.log(ujSorok.length + ' sor rendezve.');
}

/** Kézi próba: futtasd egyszer a szerkesztőből – egy tesztsort és egy próbaképet ír. */
function proba() {
  visszajelzes_({ nev: 'Teszt Elek', reszvetel: 'Igen, ott leszek', felnottek: '2', gyerekek: '0', allergia: 'teszt' });
  const png = Utilities.base64Encode(Utilities.newBlob('proba').getBytes());
  Logger.log(DriveApp.getFolderById(FOTO_MAPPA_ID).getName() + ' mappa elérhető.');
  Logger.log(JSON.stringify(feltoltes_({ type: 'image/png', data: png, filename: 'proba.png', name: 'Teszt' })));
}
