/* Egyszerűsített zászlók SVG-ben (a Windows nem jeleníti meg a zászló-emojikat). */
window.FLAGS = (() => {
  const v3 = (a, b, c) => `<rect width="10" height="20" fill="${a}"/><rect x="10" width="10" height="20" fill="${b}"/><rect x="20" width="10" height="20" fill="${c}"/>`;
  const h3 = (a, b, c) => `<rect width="30" height="6.67" fill="${a}"/><rect y="6.67" width="30" height="6.67" fill="${b}"/><rect y="13.33" width="30" height="6.67" fill="${c}"/>`;
  const gr = (() => {
    let s = "";
    for (let i = 0; i < 9; i++) s += `<rect y="${i * 20 / 9}" width="30" height="${20 / 9 + .05}" fill="${i % 2 ? "#fff" : "#0D5EAF"}"/>`;
    return s + `<rect width="11.1" height="11.1" fill="#0D5EAF"/><rect x="4.44" width="2.22" height="11.1" fill="#fff"/><rect y="4.44" width="11.1" height="2.22" fill="#fff"/>`;
  })();
  const F = {
    it: v3("#009246", "#fff", "#CE2B37"),
    fr: v3("#0055A4", "#fff", "#EF4135"),
    be: v3("#000", "#FDDA24", "#EF3340"),
    ro: v3("#002B7F", "#FCD116", "#CE1126"),
    hu: h3("#CD2A3E", "#fff", "#436F4D"),
    at: h3("#C8102E", "#fff", "#C8102E"),
    de: h3("#000", "#DD0000", "#FFCE00"),
    nl: h3("#AE1C28", "#fff", "#21468B"),
    hr: h3("#FF0000", "#fff", "#171796"),
    pl: `<rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#DC143C"/>`,
    cz: `<rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#D7141A"/><path d="M0 0 L15 10 L0 20Z" fill="#11457E"/>`,
    es: `<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/>`,
    sk: h3("#fff", "#0B4EA2", "#EE1C25") +
        `<path d="M7 4.5h8v6.5c0 3-2 4.5-4 5.5c-2-1-4-2.5-4-5.5z" fill="#EE1C25" stroke="#fff" stroke-width=".8"/>` +
        `<path d="M10.5 6.5h1v2h1.6v1h-1.6v1.2h2.2v1h-2.2v2.3h-1v-2.3H8.3v-1h2.2V9.5H8.9v-1h1.6z" fill="#fff"/>`,
    tn: `<rect width="30" height="20" fill="#E70013"/><circle cx="15" cy="10" r="5" fill="#fff"/><circle cx="15" cy="10" r="3.75" fill="#E70013"/><circle cx="16" cy="10" r="3" fill="#fff"/>` +
        `<path d="M14.6 10l2.9-.95-1.8 2.47V8.48l1.8 2.47z" fill="#E70013"/>`,
    gr
  };
  return code => {
    const c = String(code || "").toLowerCase();
    if (!F[c]) return `<span class="flag flag--txt">${c.toUpperCase() || "📍"}</span>`;
    return `<svg class="flag" viewBox="0 0 30 20" aria-hidden="true">${F[c]}</svg>`;
  };
})();
