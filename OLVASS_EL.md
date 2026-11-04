# Csilla & Miklós – esküvői weboldal

Statikus weboldal (HTML + CSS + JavaScript), nincs szükség szerverre vagy telepítésre.
Telefonon és számítógépen is jól néz ki.

## Mi hol van

```
index.html                 a weboldal
css/style.css              megjelenés
js/config.js               ← MINDEN SZERKESZTHETŐ TARTALOM (időpontok, helyszínek, program,
                             színvilágok, utazások, a táblázat címe)
js/photos.js               a fotók listája (automatikusan generált, lásd lent)
js/app.js                  működés (színválasztó, visszaszámláló, földgömb, galéria, űrlap)
js/vendor/globe.gl.min.js  a 3D földgömb könyvtára (helyben, CDN nélkül)
js/globe-textures.js       a földgömb textúrái beágyazva
js/flags.js                zászlók (SVG)
img/hero.jpg               nyitókép (a weboldal automatikusan fekete-fehérré teszi)
img/galeria/               a galéria fotói
img/utazasok/<mappa>/      az utazások fotói országonként
apps-script/Code.gs        a Google-táblázatba író szkript
kepek_frissitese.py        fotók átméretezése + a js/photos.js frissítése
```

## 1. Megnézés a saját gépen

Elég duplán kattintani az `index.html` fájlra – a földgömb textúrái a
`js/globe-textures.js` fájlba vannak beágyazva, így helyben is betöltődik.

## 2. Visszajelzések → Google-táblázat, vendégfotók → Drive-mappa

1. Nyisd meg a táblázatot (`1yZPWlrGTgUjzqazCkQXOBufLiN8udm2YCKTDJjeABuM`) → **Bővítmények → Apps Script**.
2. A mintakód helyére másold be az `apps-script/Code.gs` teljes tartalmát, majd ments.
   Futtasd egyszer a `proba` függvényt, és engedélyezd a táblázat és a Drive elérését.
3. **Telepítés → Új telepítés** → típus: **Webalkalmazás**
   - Végrehajtás mint: **Én**
   - Hozzáférés: **Bárki**
4. Engedélyezd a hozzáférést, és másold ki a **Webalkalmazás URL**-t (`https://script.google.com/macros/s/…/exec`).
5. Írd be a `js/config.js` fájlban: `scriptUrl: "https://script.google.com/macros/s/…/exec"`.

A szkript a táblázatban létrehoz egy **Visszajelzések** munkalapot fejléccel, és minden
beküldés egy új sor lesz benne (időpont, név, részvétel, létszám, kísérők, szállás,
zenekérés, elérhetőség, üzenet, választott színvilág).
Próba: az Apps Script szerkesztőben futtasd a `proba` függvényt – egy tesztsor jelenik meg.

Amíg a `scriptUrl` üres, az űrlap és a fotófeltöltő próbaüzemben fut: működik, de nem ment semmit.

**Vendégfotók:** a `foto/` oldal (https://vkbubu11.github.io/csilla-es-miklos/foto/) – erre mutat a
meghívó „Osszátok meg” QR-kódja. A vendég kiválasztja a képeket a telefonja galériájából, a
szkript pedig a `FOTO_MAPPA_ID` Drive-mappába menti őket `dátum_név_fájlnév` formában, és
naplózza a táblázat „Fotófeltöltések” lapján. A nagy képeket a böngésző 3200 px-re kicsinyíti;
videó legfeljebb 30 MB lehet (az Apps Script kérésméret-korlátja miatt). Bejelentkezés nem kell.

## 3. Fotók

1. Másold a képeket:
   - galéria: `img/galeria/` (a sorrend a fájlnév szerinti, pl. `01_...`, `02_...`)
   - utazások: `img/utazasok/olaszorszag/`, `gorogorszag/`, `fuerteventura/`, `gran-canaria/`, `praga/`, `szlovakia/`, `tunezia/`
2. Futtasd: `python kepek_frissitese.py` (egyszer kell hozzá: `pip install pillow`)

A szkript kicsinyíti a nagy képeket, bélyegképeket készít, és frissíti a `js/photos.js` fájlt.
**Új ország:** a `js/config.js` `travels` listájába vegyél fel egy új sort (mappanév, név,
kétbetűs országkód a zászlóhoz, szélesség/hosszúság), hozd létre a mappát, és futtasd újra a szkriptet.

## 4. Színvilágok

A jobb alsó sarokban lévő **Színek** gombbal a meghívó 10 színkombinációja közül lehet választani.
A választás megmarad az adott böngészőben. Linkkel is beállítható, pl.
`…/index.html?szin=sage` (azonosítók: navy, sage, peach, nude, sunflower, raspberry, coral,
lavender, terracotta, emerald). Az alapértelmezett szín a `palettes` lista első eleme.

## 5. Közzététel

Bármilyen statikus tárhely jó, a teljes mappát kell feltölteni:
GitHub Pages, Netlify (a mappát a netlify.com/drop oldalra húzva), vagy a meglévő
WordPress-tárhely egy almappája.
