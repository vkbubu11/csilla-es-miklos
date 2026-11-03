/**
 * Csilla & Miklós – visszajelzések fogadása a Google-táblázatba.
 *
 * Beüzemelés (egyszer kell):
 *  1. Nyisd meg a táblázatot → Bővítmények → Apps Script.
 *  2. Töröld a mintakódot, és másold be ezt a teljes fájlt. Mentés.
 *  3. Telepítés → Új telepítés → Típus: Webalkalmazás
 *       Végrehajtás mint: Én
 *       Hozzáférés: Bárki
 *     → Telepítés → engedélyezd → másold ki a „Webalkalmazás URL”-t.
 *  4. Az URL-t írd be a weboldal js/config.js fájljában az rsvpEndpoint mezőbe.
 *
 * Ha később módosítod ezt a kódot: Telepítés → Telepítések kezelése →
 * ceruza → Verzió: Új verzió → Telepítés (az URL ugyanaz marad).
 */

// Melyik munkalapra írjon? Ha nincs ilyen nevű lap, létrehozza.
const SHEET_NAME = 'Visszajelzések';

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
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const p = (e && e.parameter) || {};
    if (p.weboldal) return json_({ ok: true }); // spamcsapda

    const sheet = getSheet_();
    const row = COLUMNS.map(([key]) => {
      if (key === '_ido') return new Date();
      const v = String(p[key] || '').slice(0, 2000);
      return /^[=+\-@]/.test(v) ? "'" + v : v; // képletbeszúrás ellen
    });
    sheet.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, info: 'Csilla & Miklós RSVP végpont működik.' });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS.map(c => c[1]));
    sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#1F2A44').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('yyyy.mm.dd hh:mm');
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Kézi próba: futtasd egyszer a szerkesztőből – egy tesztsort ír a táblázatba. */
function proba() {
  doPost({ parameter: { nev: 'Teszt Elek', reszvetel: 'Igen, ott leszek', felnottek: '2', gyerekek: '0', szinvilag: 'Sötétkék & arany' } });
}
