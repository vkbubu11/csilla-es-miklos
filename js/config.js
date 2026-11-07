/* ==========================================================
   BEÁLLÍTÁSOK – minden szerkeszthető tartalom itt van.
   Kódhoz nem kell nyúlni, csak ezt a fájlt kell átírni.
   ========================================================== */
window.WEDDING = {

  /* Az esküvő kezdete (a visszaszámlálóhoz). */
  date: "2027-06-05T16:00:00+02:00",

  /* A Google Apps Script webalkalmazás URL-je (lásd OLVASS_EL.md).
     Ez fogadja a visszajelzéseket ÉS a vendégek fotóit is.
     Amíg üres, az űrlap és a fotófeltöltő csak próbaüzemben fut. */
  scriptUrl: "https://script.google.com/macros/s/AKfycbzp7QIuhVA2jOf4w1VmISq1ktKBYM_Gkuq7-lw60xtq9M8zy2Da0IapilurtTd2QadDrw/exec",

  /* Visszajelzési határidő – üresen hagyva nem jelenik meg. */
  rsvpDeadline: "2027. február 5-ig",

  /* Helyszínek */
  venues: [
    { title: "Vendégvárás", place: "Vitnyéd", when: "16:00 · Szent István király utca 10.",
      map: "https://www.google.com/maps/search/?api=1&query=Vitny%C3%A9d%2C+Szent+Istv%C3%A1n+kir%C3%A1ly+utca+10" },
    { title: "Szertartás", place: "Vitnyédi templom", when: "17:00",
      map: "https://www.google.com/maps/search/?api=1&query=Vitny%C3%A9d+templom" },
    { title: "Ünnepi vacsora", place: "Halász vendéglő", when: "20:00 · Kisfalud",
      map: "https://www.google.com/maps/search/?api=1&query=Hal%C3%A1sz+vend%C3%A9gl%C5%91+Kisfalud" }
  ],

  /* A nap menete.
     icon: rings, cheers, dinner, dance, cake, dress, music, camera, car, church, heart */
  program: [
    { time: "16:00", title: "Vendégvárás",      note: "Vitnyéd, Szent István király utca 10.", icon: "cheers" },
    { time: "17:00", title: "Szertartás",       note: "Vitnyédi templom",                      icon: "rings" },
    { time: "18:30", title: "Csoportképek",     note: "gratulációk fogadása",                  icon: "camera" },
    { time: "20:00", title: "Vacsora",          note: "Halász vendéglő – Kisfalud",            icon: "dinner" },
    { time: "21:00", title: "Nyitótánc",        note: "az ifjú pár első tánca",                icon: "dance" },
    { time: "22:30", title: "Torta",            note: "édes pillanat",                         icon: "cake" },
    { time: "24:00", title: "Menyasszonytánc",  note: "és tánc hajnalig",                      icon: "dress" }
  ],

  /* Színvilágok – ugyanaz a 10 kombináció, mint a meghívón.
     bg: háttér · band: szalag/gombok · bandText: szalag felirata
     accent: nevek, címek · rule: díszítő vonalak · text: szöveg */
  palettes: [
    { id: "navy",       name: "Sötétkék & arany",        bg: "#FFFFFF", band: "#1F2A44", bandText: "#C9A96E", accent: "#1F2A44", rule: "#C9A96E", text: "#33363D", globe: "#C9A96E" },
    { id: "sage",       name: "Zsályazöld & púder",      bg: "#FBF9F5", band: "#8E9F7E", bandText: "#FFFFFF", accent: "#7C8C6C", rule: "#DDB3AD", text: "#4A4C44", globe: "#A9B89A" },
    { id: "peach",      name: "Citrom, barack & rózsa",  bg: "#FFFBF4", band: "#E9946A", bandText: "#FFFFFF", accent: "#D9824F", rule: "#F2C14E", text: "#5A4A3F", globe: "#FBBB8C" },
    { id: "nude",       name: "Natúr bézs",              bg: "#FAF7F3", band: "#A88B76", bandText: "#FFFFFF", accent: "#8C7462", rule: "#D9CBBE", text: "#4A4038", globe: "#D9CBBE" },
    { id: "sunflower",  name: "Napraforgó",              bg: "#FFFCF5", band: "#4A2C1A", bandText: "#E2A03D", accent: "#72431E", rule: "#E2A03D", text: "#3B2A20", globe: "#E2A03D" },
    { id: "raspberry",  name: "Málna & mályva",          bg: "#FFFAF8", band: "#AE264C", bandText: "#F3E3D6", accent: "#AE264C", rule: "#CF9599", text: "#4A3A3A", globe: "#CF9599" },
    { id: "coral",      name: "Pink, púderkék & korall", bg: "#FFFFFF", band: "#D34273", bandText: "#FFFFFF", accent: "#D34273", rule: "#99B7D1", text: "#3F4650", globe: "#99B7D1" },
    { id: "lavender",   name: "Levendula & magenta",     bg: "#FCFAFD", band: "#9C7DBA", bandText: "#FFFFFF", accent: "#8E6BAF", rule: "#DC93AB", text: "#47404F", globe: "#C9B3D9" },
    { id: "terracotta", name: "Terrakotta & olíva",      bg: "#FFF9F4", band: "#C2561F", bandText: "#F6E7D8", accent: "#C2561F", rule: "#7F8B5C", text: "#4A3328", globe: "#EEAB86" },
    { id: "emerald",    name: "Smaragd & antik arany",   bg: "#FAF7F0", band: "#185844", bandText: "#D2B57A", accent: "#185844", rule: "#B08A4F", text: "#102F27", globe: "#78947F" }
  ],

  /* Utazások a földgömbön – minden meglátogatott HELY egy rajzszög.
     Az azonos "country" nevű helyek egy országként jelennek meg a listában
     (pl. Horvátország → Pula és Rovinj két rajzszöggel).
     folder: az img/utazasok/ alatti mappa – az ott lévő képek automatikusan
       felkerülnek (a js/photos.js fájlt a kepek_frissitese.py írja).
     flag: kétbetűs országkód (it, gr, es, cz, sk, tn, hr, at, hu, fr, de…)
     lat/lng: a rajzszög helye fokban. */
  travels: [
    { folder: "olaszorszag",    country: "Olaszország",   place: "Velence · Burano", flag: "it", lat: 45.485, lng: 12.417 },
    { folder: "gorogorszag",    country: "Görögország",   place: "Kalamata",         flag: "gr", lat: 37.039, lng: 22.114 },
    { folder: "fuerteventura",  country: "Spanyolország", place: "Fuerteventura",    flag: "es", lat: 28.36,  lng: -14.05 },
    { folder: "gran-canaria",   country: "Spanyolország", place: "Gran Canaria",     flag: "es", lat: 27.92,  lng: -15.60 },
    { folder: "praga",          country: "Csehország",    place: "Prága",            flag: "cz", lat: 50.075, lng: 14.437 },
    { folder: "szlovakia",      country: "Szlovákia",     place: "",                 flag: "sk", lat: 48.67,  lng: 19.70 },
    { folder: "tunezia",        country: "Tunézia",       place: "",                 flag: "tn", lat: 34.0,   lng: 9.5 },
    { folder: "pula",           country: "Horvátország",  place: "Pula",             flag: "hr", lat: 44.867, lng: 13.850 },
    { folder: "rovinj",         country: "Horvátország",  place: "Rovinj",           flag: "hr", lat: 45.081, lng: 13.639 },
    { folder: "becs",           country: "Ausztria",      place: "Schönbrunn",       flag: "at", lat: 48.185, lng: 16.312 },
    { folder: "semmering",      country: "Ausztria",      place: "Semmering",        flag: "at", lat: 47.634, lng: 15.830 }
  ],

  /* Kezdőpozíció a földgömbön (Magyarország fölött). */
  globeStart: { lat: 44, lng: 14, altitude: 1.9 }
};
