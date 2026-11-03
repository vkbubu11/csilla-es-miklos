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
  scriptUrl: "",

  /* Visszajelzési határidő – üresen hagyva nem jelenik meg. Pl.: "2027. április 30." */
  rsvpDeadline: "",

  /* Helyszínek */
  venues: [
    { title: "Szertartás", place: "Vitnyédi templom", when: "16:00",
      map: "https://www.google.com/maps/search/?api=1&query=Vitny%C3%A9d+templom" },
    { title: "Ünnepi vacsora", place: "Kantár Fogadó", when: "a szertartás után",
      map: "https://www.google.com/maps/search/?api=1&query=Kant%C3%A1r+Fogad%C3%B3" }
  ],

  /* A nap menete – a 16:00 biztos, a többi időpont még javaslat. */
  /* icon: rings, cheers, dinner, dance, cake, dress, music, camera, car, church, heart */
  program: [
    { time: "16:00", title: "Szertartás",       note: "Vitnyédi templom",        icon: "rings" },
    { time: "17:30", title: "Vendégvárás",      note: "Kantár Fogadó",           icon: "cheers" },
    { time: "19:00", title: "Vacsora",          note: "ünnepi menü",             icon: "dinner" },
    { time: "21:00", title: "Nyitótánc",        note: "az ifjú pár első tánca",  icon: "dance" },
    { time: "22:30", title: "Torta",            note: "édes pillanat",           icon: "cake" },
    { time: "24:00", title: "Menyasszonytánc",  note: "és tánc hajnalig",        icon: "dress" }
  ],

  /* Színvilágok – ugyanaz a 9 kombináció, mint a meghívón.
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
    { id: "terracotta", name: "Terrakotta & olíva",      bg: "#FFF9F4", band: "#C2561F", bandText: "#F6E7D8", accent: "#C2561F", rule: "#7F8B5C", text: "#4A3328", globe: "#EEAB86" }
  ],

  /* Utazások a földgömbön.
     folder: az img/utazasok/ alatti mappa neve – az abban lévő képek
     automatikusan felkerülnek (a js/photos.js fájlt a kepek_frissitese.py írja).
     flag: kétbetűs országkód (it, gr, es, cz, sk, tn, hu, fr, de, at, hr, pt, gb, us…)
     lat/lng: a rajzszög helye fokban. Új ország = új sor + új mappa. */
  travels: [
    { folder: "olaszorszag",   country: "Olaszország",  place: "Velence · Burano",  flag: "it", lat: 45.485, lng: 12.417 },
    { folder: "gorogorszag",   country: "Görögország",  place: "Peloponnészosz",    flag: "gr", lat: 37.04,  lng: 22.11 },
    { folder: "fuerteventura", country: "Fuerteventura", place: "Kanári-szigetek",  flag: "es", lat: 28.36,  lng: -14.05 },
    { folder: "gran-canaria",  country: "Gran Canaria", place: "Kanári-szigetek",   flag: "es", lat: 27.92,  lng: -15.60 },
    { folder: "praga",         country: "Prága",        place: "Csehország",        flag: "cz", lat: 50.075, lng: 14.437 },
    { folder: "szlovakia",     country: "Szlovákia",    place: "",                  flag: "sk", lat: 48.67,  lng: 19.70 },
    { folder: "tunezia",       country: "Tunézia",      place: "",                  flag: "tn", lat: 34.0,   lng: 9.5 }
  ],

  /* Kezdőpozíció a földgömbön (Magyarország fölött). */
  globeStart: { lat: 44, lng: 14, altitude: 1.9 }
};
