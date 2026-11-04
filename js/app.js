/* Csilla & Miklós – esküvői weboldal logikája */
(() => {
  "use strict";
  const W = window.WEDDING;
  const ENDPOINT = W.scriptUrl || W.rsvpEndpoint || "";
  const P = window.PHOTOS || { gallery: [], travels: {} };
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- Színvilág ---------------- */
  const THEME_KEY = "cm-theme";
  let currentPalette = W.palettes[0];
  let onThemeChange = () => {};

  function applyTheme(id, save = true) {
    const p = W.palettes.find(x => x.id === id) || W.palettes[0];
    currentPalette = p;
    const r = document.documentElement.style;
    r.setProperty("--bg", p.bg); r.setProperty("--band", p.band); r.setProperty("--band-text", p.bandText);
    r.setProperty("--accent", p.accent); r.setProperty("--rule", p.rule); r.setProperty("--text", p.text);
    $('meta[name="theme-color"]').setAttribute("content", p.band);
    document.querySelectorAll(".theme__opt").forEach(b => b.setAttribute("aria-pressed", b.dataset.id === p.id));
    if (save) { try { localStorage.setItem(THEME_KEY, p.id); } catch (e) {} }
    onThemeChange(p);
  }

  function initTheme() {
    const list = $("#themeList");
    list.innerHTML = W.palettes.map(p => `
      <button class="theme__opt" data-id="${p.id}" aria-pressed="false">
        <span class="swatch"><i style="background:${p.band}"></i><i style="background:${p.rule}"></i><i style="background:${p.accent}"></i><i style="background:${p.bg}"></i></span>
        ${esc(p.name)}
      </button>`).join("");
    list.addEventListener("click", e => { const b = e.target.closest(".theme__opt"); if (b) applyTheme(b.dataset.id); });

    const toggle = $("#themeToggle"), panel = $("#themePanel");
    const setOpen = open => { panel.hidden = !open; toggle.setAttribute("aria-expanded", open); };
    toggle.addEventListener("click", () => setOpen(panel.hidden));
    document.addEventListener("click", e => { if (!e.target.closest("#theme")) setOpen(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });

    // URL-ből is választható: ...?szin=sage
    const fromUrl = new URLSearchParams(location.search).get("szin");
    let saved = null; try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    applyTheme(fromUrl || saved || W.palettes[0].id, !!fromUrl);
  }

  /* ---------------- Visszaszámláló ---------------- */
  function initCountdown() {
    const el = $("#countdown"), target = new Date(W.date).getTime();
    const tick = () => {
      let d = Math.max(0, target - Date.now());
      if (d === 0) { el.innerHTML = `<p class="script-sub" style="margin:0">Ma van a nagy nap!</p>`; return; }
      const parts = [["nap", 864e5], ["óra", 36e5], ["perc", 6e4], ["mp", 1e3]].map(([l, ms]) => { const v = Math.floor(d / ms); d -= v * ms; return [v, l]; });
      el.innerHTML = parts.map(([v, l]) => `<div><b>${v}</b><small>${l}</small></div>`).join("");
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------------- Ikonok a programhoz ---------------- */
  const ICONS = {
    rings:  '<circle cx="9" cy="14.5" r="5.5"/><circle cx="15" cy="14.5" r="5.5"/><path d="M13.2 6.2 15 3.6l1.8 2.6L15 8.6z"/><path d="M13.2 6.2h3.6"/>',
    cheers: '<path d="M4.5 3.5h5l-.4 4.6a2.1 2.1 0 0 1-4.2 0z"/><path d="M7 10.2v8.3M5 18.5h4"/><path d="M14.5 3.5h5l-.4 4.6a2.1 2.1 0 0 1-4.2 0z"/><path d="M17 10.2v8.3M15 18.5h4"/><path d="M12 2v2M10.6 5.2 9.9 4.5M13.4 5.2l.7-.7"/>',
    dinner: '<circle cx="12" cy="12" r="5.2"/><circle cx="12" cy="12" r="2.6"/><path d="M3 3.5v5a1.6 1.6 0 0 0 3.2 0v-5M4.6 3.5v17"/><path d="M20.5 3.5c-1.6 1-2.3 3-2.3 6.5h2.3v10.5"/>',
    dance:  '<path d="M9 17.5V6l11-2.2v11.4"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="15.2" r="2.5"/><path d="M9 9.6l11-2.2"/>',
    cake:   '<path d="M3.5 20.5h17"/><path d="M5 20.5v-6.2h14v6.2"/><path d="M7.5 14.3v-3.6h9v3.6"/><path d="M5 16.6c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0"/><path d="M12 10.7V8"/><path d="M12 3.6c.9.9.9 2.1 0 2.8-.9-.7-.9-1.9 0-2.8z"/>',
    dress:  '<path d="M10 2.8v3.4M14 2.8v3.4"/><path d="M10 6.2h4l-.6 3.4 5.1 11H5.5l5.1-11z"/><path d="M10.6 9.6h2.8"/><path d="M8.3 15.2c1.2.8 2.4.8 3.7 0s2.5-.8 3.7 0"/>',
    music:  '<path d="M9 18V5l10-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    camera: '<path d="M3.5 7.5h4l1.5-2.5h6l1.5 2.5h4v12h-17z"/><circle cx="12" cy="13.2" r="3.7"/>',
    car:    '<path d="M3.5 16.5v-4l2-5h13l2 5v4z"/><path d="M3.5 12.5h17"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
    church: '<path d="M12 2v4M10.3 3.7h3.4"/><path d="M7 21V10.5L12 6l5 4.5V21z"/><path d="M3.5 21v-6.5L7 12M20.5 21v-6.5L17 12"/><path d="M10.5 21v-3.5a1.5 1.5 0 0 1 3 0V21M2.5 21h19"/>',
    heart:  '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>'
  };
  const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ICONS.heart}</svg>`;

  /* ---------------- Helyszínek, program ---------------- */
  function initDetails() {
    $("#venues").innerHTML = W.venues.map(v => `
      <article class="card reveal">
        <h3>${esc(v.title)}</h3>
        <p class="place">${esc(v.place)}</p>
        <p class="when">${esc(v.when)}</p>
        <a href="${esc(v.map)}" target="_blank" rel="noopener">Útvonal térképen</a>
      </article>`).join("");
    $("#timeline").innerHTML = W.program.map(p => `
      <li class="reveal"><span class="t">${esc(p.time)}</span><span class="ico">${icon(p.icon)}</span>
      <span class="d"><b>${esc(p.title)}</b><i>${esc(p.note)}</i></span></li>`).join("");
    if (W.rsvpDeadline) $("#rsvpLead").textContent = `Kérjük, ${W.rsvpDeadline}-ig jelezd, hogy számíthatunk-e rád!`;
  }

  /* ---------------- Képnéző ---------------- */
  const lb = { items: [], i: 0 };
  function openLightbox(items, i = 0) {
    if (!items.length) return;
    lb.items = items; lb.i = i;
    $("#lbThumbs").innerHTML = items.length > 1 ? items.map((it, k) => `<button data-k="${k}" aria-label="${k + 1}. kép"><img src="${esc(it.thumb || it.src)}" alt="" loading="lazy"></button>`).join("") : "";
    $("#lightbox").hidden = false; document.body.style.overflow = "hidden";
    showLb(); $("#lbClose").focus();
  }
  function showLb() {
    const it = lb.items[lb.i];
    $("#lbImg").src = it.src; $("#lbImg").alt = it.caption || "";
    $("#lbCap").textContent = it.caption || "";
    const multi = lb.items.length > 1;
    $("#lbPrev").style.visibility = $("#lbNext").style.visibility = multi ? "visible" : "hidden";
    document.querySelectorAll("#lbThumbs button").forEach((b, k) => {
      b.setAttribute("aria-current", k === lb.i);
      if (k === lb.i) b.scrollIntoView({ block: "nearest", inline: "center" });
    });
  }
  const step = d => { lb.i = (lb.i + d + lb.items.length) % lb.items.length; showLb(); };
  function closeLb() { $("#lightbox").hidden = true; document.body.style.overflow = ""; }
  function initLightbox() {
    $("#lbClose").onclick = closeLb;
    $("#lbPrev").onclick = () => step(-1);
    $("#lbNext").onclick = () => step(1);
    $("#lbThumbs").onclick = e => { const b = e.target.closest("button"); if (b) { lb.i = +b.dataset.k; showLb(); } };
    $("#lightbox").addEventListener("click", e => { if (e.target.id === "lightbox") closeLb(); });
    document.addEventListener("keydown", e => {
      if ($("#lightbox").hidden) return;
      if (e.key === "Escape") closeLb(); else if (e.key === "ArrowLeft") step(-1); else if (e.key === "ArrowRight") step(1);
    });
    let x0 = null; // húzás telefonon
    $("#lightbox").addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    $("#lightbox").addEventListener("touchend", e => {
      if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    });
  }

  /* ---------------- Galéria ---------------- */
  function initGallery() {
    const g = $("#gallery"), items = P.gallery || [];
    if (!items.length) { g.hidden = true; return; }
    g.innerHTML = items.map((it, k) => `
      <button class="reveal" data-k="${k}" aria-label="Kép megnyitása${it.caption ? ": " + esc(it.caption) : ""}">
        <img src="${esc(it.thumb || it.src)}" alt="${esc(it.caption || "Közös fotó")}" loading="lazy" ${it.w ? `width="${it.w}" height="${it.h}"` : ""}>
      </button>`).join("");
    g.addEventListener("click", e => { const b = e.target.closest("button"); if (b) openLightbox(items, +b.dataset.k); });
  }

  /* ---------------- Földgömb + utazások ---------------- */
  const PIN = color => `<svg viewBox="0 0 30 40" aria-hidden="true">
      <line x1="15" y1="18" x2="15" y2="39" stroke="#9aa0a6" stroke-width="2.4" stroke-linecap="round"/>
      <circle class="pin__head" cx="15" cy="12" r="10.5" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="11.5" cy="8.5" r="3" fill="#fff" opacity=".55"/></svg>`;
  const flag = c => (window.FLAGS ? window.FLAGS(c) : "");

  const placeName = t => t.place || t.country;
  function tripPhotos(t) {
    return (P.travels[t.folder] || []).map(p => ({ ...p, caption: p.caption || [placeName(t), t.place ? t.country : ""].filter(Boolean).join(" · ") }));
  }

  function initGlobe() {
    const trips = W.travels.map((t, k) => ({ ...t, k }));
    // országonkénti csoportok (a megadás sorrendjében)
    const groups = [];
    trips.forEach(t => {
      let g = groups.find(x => x.country === t.country);
      if (!g) groups.push(g = { country: t.country, flag: t.flag, places: [] });
      g.places.push(t); t.g = groups.indexOf(g);
    });
    const list = $("#tripList"), detail = $("#tripDetail"), el = $("#globe");
    let globe = null;

    list.innerHTML = groups.map((g, i) => `
      <li><button data-g="${i}" aria-pressed="false">${flag(g.flag)}<span>${esc(g.country)}</span>${g.places.length > 1 ? `<small class="chip-n">${g.places.length}</small>` : ""}</button></li>`).join("");

    const tilesHtml = (ph, off) => ph.length
      ? `<div class="tiles tiles--${Math.min(ph.length, 5)}">${ph.map((p, i) => `<button class="tile" data-i="${off + i}" aria-label="${esc(p.caption)} – kép megnyitása"><img src="${esc(p.thumb || p.src)}" alt="${esc(p.caption)}" loading="lazy"></button>`).join("")}</div>`
      : `<div class="tiles"><div class="tile tile--empty">Ide kerülnek majd<br>az itteni közös fotóink</div></div>`;

    function renderDetail(g, focusK) {
      const all = []; let body = "";
      const multi = g.places.length > 1;
      g.places.forEach(t => {
        const ph = tripPhotos(t);
        const block = tilesHtml(ph, all.length);
        all.push(...ph);
        body += multi
          ? `<section class="trip-place${t.k === focusK ? " is-focus" : ""}" data-k="${t.k}"><h4><span class="dot"></span>${esc(placeName(t))}<small>${ph.length ? ph.length + " fotó" : "fotók hamarosan"}</small></h4>${block}</section>`
          : block;
      });
      const sub = multi
        ? `${g.places.length} helyszín: ${g.places.map(placeName).map(esc).join(", ")}`
        : [g.places[0].place, all.length ? all.length + " fotó" : "fotók hamarosan"].filter(Boolean).map(esc).join(" · ");
      detail.innerHTML = `<header class="trip-head">${flag(g.flag)}<div><h3>${esc(g.country)}</h3><small>${sub}</small></div></header>${body}`;
      detail.classList.remove("swap"); void detail.offsetWidth; detail.classList.add("swap");
      detail.querySelectorAll("button.tile").forEach(b => b.addEventListener("click", () => openLightbox(all, +b.dataset.i)));
      const f = detail.querySelector(".trip-place.is-focus");
      if (f && multi) f.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function view(g, focusK) {
      if (focusK != null) { const t = trips[focusK]; return { lat: t.lat - 2, lng: t.lng, altitude: 1.2 }; }
      const lats = g.places.map(t => t.lat), lngs = g.places.map(t => t.lng);
      const span = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));
      return { lat: (Math.max(...lats) + Math.min(...lats)) / 2 - 3, lng: (Math.max(...lngs) + Math.min(...lngs)) / 2, altitude: Math.min(1.6, 1.0 + span / 12) };
    }

    function select(gi, { focusK = null, fly = true, scroll = false } = {}) {
      const g = groups[gi];
      list.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.g === gi));
      el.querySelectorAll(".pin").forEach(p => {
        const k = +p.dataset.k;
        p.classList.toggle("is-active", trips[k].g === gi);
        p.classList.toggle("is-focus", k === focusK);
      });
      renderDetail(g, focusK);
      if (globe && fly) { globe.controls().autoRotate = false; globe.pointOfView(view(g, focusK), 1100); }
      if (scroll && window.matchMedia("(max-width: 820px)").matches) detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    list.addEventListener("click", e => { const b = e.target.closest("button"); if (b) select(+b.dataset.g); });

    // kezdetben az első ország, ahol már van fotó
    const firstT = trips.find(t => tripPhotos(t).length) || trips[0];
    const first = firstT ? firstT.g : 0;

    if (typeof Globe !== "function") { el.innerHTML = `<p class="lead">A földgömb nem tölthető be ebben a böngészőben.</p>`; select(first, { fly: false }); return; }

    const tex = window.GLOBE_TEX || {};
    globe = Globe()(el)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl(tex.earth || "")
      .bumpImageUrl(tex.bump || "")
      .showAtmosphere(true)
      .atmosphereColor(currentPalette.globe)
      .atmosphereAltitude(0.18)
      .htmlElementsData(trips)
      .htmlAltitude(0.01)
      .htmlElement(t => {
        const d = document.createElement("div");
        d.className = "pin"; d.dataset.k = t.k; d.title = [placeName(t), t.place ? t.country : ""].filter(Boolean).join(", ");
        d.innerHTML = `<span class="pin__label">${esc(placeName(t))}</span>${PIN(currentPalette.band)}`;
        d.addEventListener("click", ev => { ev.stopPropagation(); select(t.g, { focusK: t.k, scroll: true }); });
        d.addEventListener("pointerdown", ev => ev.stopPropagation());
        return d;
      })
      .arcsData(trips.map(t => ({ startLat: 47.5, startLng: 19.04, endLat: t.lat, endLng: t.lng })))
      .arcColor(() => [currentPalette.rule, currentPalette.band])
      .arcStroke(0.6)
      .arcDashLength(0.4).arcDashGap(0.2).arcDashAnimateTime(3500)
      .pointOfView(W.globeStart || { lat: 44, lng: 14, altitude: 1.9 });

    const c = globe.controls();
    c.autoRotate = true; c.autoRotateSpeed = 0.35; c.enableZoom = true; c.minDistance = 130; c.maxDistance = 600;
    el.addEventListener("pointerdown", () => { c.autoRotate = false; });
    const size = () => { const w = el.clientWidth; globe.width(w).height(w); };
    size(); new ResizeObserver(size).observe(el);
    setTimeout(() => select(first, { fly: false }), 300);

    onThemeChange = p => {
      globe.atmosphereColor(p.globe).arcColor(() => [p.rule, p.band]);
      el.querySelectorAll(".pin__head").forEach(cc => cc.setAttribute("fill", p.band));
    };
  }

  /* ---------------- Visszajelző űrlap ---------------- */
  function initForm() {
    const f = $("#rsvpForm"), msg = $("#formMsg"), btn = $("#rsvpSubmit"), ifYes = $("#ifYes");
    const syncYes = () => {
      const v = (f.querySelector('input[name="reszvetel"]:checked') || {}).value || "";
      ifYes.classList.toggle("is-hidden", v.startsWith("Sajnos"));
    };
    f.addEventListener("change", syncYes); syncYes();

    f.addEventListener("submit", async e => {
      e.preventDefault();
      msg.className = "form-msg"; msg.textContent = "";
      f.querySelectorAll(".invalid").forEach(x => x.classList.remove("invalid"));

      const name = f.nev.value.trim(), att = f.querySelector('input[name="reszvetel"]:checked');
      const bad = [];
      if (!name) bad.push(f.nev.closest(".field"));
      if (!att) bad.push(f.querySelector('input[name="reszvetel"]').closest(".field"));
      if (bad.length) {
        bad.forEach(x => x.classList.add("invalid"));
        msg.className = "form-msg err"; msg.textContent = "Kérjük, töltsd ki a csillaggal jelölt mezőket.";
        bad[0].scrollIntoView({ behavior: "smooth", block: "center" }); return;
      }
      if (f.weboldal.value) return; // spam

      const yes = !att.value.startsWith("Sajnos");
      const data = {
        nev: name,
        reszvetel: att.value,
        felnottek: yes ? f.felnottek.value : "0",
        gyerekek: yes ? f.gyerekek.value : "0",
        kiserok: yes ? f.kiserok.value.trim() : "",
        szallas: yes ? (f.querySelector('input[name="szallas"]:checked') || {}).value || "" : "",
        zene: yes ? f.zene.value.trim() : "",
        uzenet: f.uzenet.value.trim(),
        szinvilag: currentPalette.name
      };

      btn.disabled = true; btn.textContent = "Küldés…";
      try {
        if (!ENDPOINT) {
          console.info("Próbaüzem – ezt küldené:", data);
          await new Promise(r => setTimeout(r, 600));
        } else {
          // Apps Script: egyszerű (preflight nélküli) POST, a válasz átlátszatlan
          await fetch(ENDPOINT, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });
        }
        msg.className = "form-msg ok";
        msg.textContent = yes ? `Köszönjük, ${name.split(" ").pop()}! Nagyon várunk! 💛` : `Köszönjük, hogy jelezted, ${name.split(" ").pop()}! Hiányozni fogsz.`;
        if (!ENDPOINT) msg.textContent += " (próbaüzem – a táblázat még nincs bekötve)";
        f.reset(); syncYes();
        btn.textContent = "Elküldve ✓";
        setTimeout(() => { btn.disabled = false; btn.textContent = "Visszajelzés elküldése"; }, 4000);
      } catch (err) {
        msg.className = "form-msg err";
        msg.textContent = "Hoppá, nem sikerült elküldeni. Kérjük, próbáld újra, vagy írj nekünk közvetlenül.";
        btn.disabled = false; btn.textContent = "Visszajelzés elküldése";
      }
    });
  }

  /* ---------------- Megjelenés görgetéskor ---------------- */
  function initReveal() {
    const els = document.querySelectorAll(".reveal, .title, .card, .rsvp");
    if (!("IntersectionObserver" in window)) return;
    els.forEach(e => e.classList.add("reveal"));
    const io = new IntersectionObserver(ents => ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme(); initCountdown(); initDetails(); initLightbox(); initGallery(); initForm(); initGlobe(); initReveal();
  });
})();
