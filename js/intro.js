/* Nyitó animáció: a smaragd meghívó kinyílik, mögötte a weboldal.
   Csak az első látogatáskor jelenik meg (újra: ...?intro=1). */
(() => {
  "use strict";
  const KEY = "cm-intro-v1";
  const force = /[?&]intro=1/.test(location.search);
  let seen = false; try { seen = localStorage.getItem(KEY) === "1"; } catch (e) {}
  if (seen && !force) return;

  const W = window.WEDDING || {};
  const prog = (W.program || []).slice(0, 6);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const deadline = W.rsvpDeadline ? esc(W.rsvpDeadline.replace(/^\d{4}\.\s*/, "")) : "";

  const el = document.createElement("div");
  el.className = "intro";
  el.id = "intro";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", "Meghívó – koppints a kinyitáshoz");
  el.innerHTML = `
    <div class="intro__stage" id="introStage">
      <div class="ic" id="ic" tabindex="0" role="button" aria-label="Meghívó kinyitása">
        <!-- belső középső panel -->
        <div class="ic__center">
          <p class="ic__eyebrow">Sok szeretettel meghívunk Benneteket, hogy velünk ünnepeljetek házasságkötésünk alkalmából!</p>
          <p class="ic__names"><span>Csilla</span><i>&amp;</i><span>Miklós</span></p>
          <div class="ic__date"><span>Szombat</span><b>05</b><span>Június</span></div>
          <p class="ic__small">2027</p>
          <p class="ic__small"><em>16 órakor</em></p>
          <p class="ic__caps">Szertartás · Vitnyédi templom</p>
          <p class="ic__plain">Ünnepi vacsora · Halász vendéglő</p>
          <hr>
          <p class="ic__note">Közös életünk első óráit töltsétek velünk, egy vacsorával egybekötött mulatozáson!</p>
        </div>

        <!-- jobb oldali behajtott panel: kívül nevek, belül a nap menete -->
        <div class="ic__door ic__door--right">
          <div class="ic__face ic__face--front">
            <div class="ic__rout">
              <p class="ic__capsname">Csilla</p><i class="ic__amp">&amp;</i><p class="ic__capsname">Miklós</p>
              <p class="ic__script">nagy<br>szeretettel…</p>
              <p class="ic__tiny">2027 · 06 · 05</p>
            </div>
          </div>
          <div class="ic__face ic__face--back">
            <p class="ic__title">A nap menete</p>
            <ol class="ic__tl">${prog.map(p => `<li><b>${esc(p.time)}</b><span></span><div><strong>${esc(p.title)}</strong><em>${esc(p.note)}</em></div></li>`).join("")}</ol>
          </div>
        </div>

        <!-- bal oldali fotós szárny: kívül fotó, belül visszajelzés -->
        <div class="ic__door ic__door--left">
          <div class="ic__face ic__face--front"><img src="img/hero.jpg?v=20261105b" alt=""></div>
          <div class="ic__face ic__face--back">
            <p class="ic__title">Visszajelzés</p>
            <p class="ic__it">Kérjük, jelezd részvételed${deadline ? `<br>${deadline}, ..` : ""}</p>
            <img class="ic__qr" src="qr/QR_visszajelzes.png" alt="">
            <p class="ic__mini">.. a kód beszkennelése után megjelenő űrlap kitöltésével, üzenetben vagy telefonon.</p>
            <hr>
            <p class="ic__title">Osszátok meg</p>
            <p class="ic__it">Töltsétek fel a nap legszebb pillanatait!</p>
            <img class="ic__qr" src="qr/QR_foto.png" alt="">
          </div>
        </div>

        <!-- papírszalag -->
        <div class="ic__band"><span>Igent mondunk</span></div>
      </div>
      <p class="intro__hint" id="introHint">Koppints a meghívóra a kinyitásához</p>
    </div>
    <button class="intro__skip" id="introSkip" type="button">Kihagyás ›</button>`;

  function size() {
    const vw = innerWidth, vh = innerHeight;
    const w = Math.min(vh * 0.74 * 127 / 178, vw * 0.84, 470);
    el.style.setProperty("--w", w + "px");
    el.style.setProperty("--u", (w / 127) + "px");                 // 1 mm a nyomtatott lapon
    el.style.setProperty("--fit", Math.min(1, (vw * 0.96) / (w * 322 / 127)).toFixed(3)); // kinyitott lap ráfér
  }

  const done = () => {
    try { localStorage.setItem(KEY, "1"); } catch (e) {}
    document.documentElement.classList.remove("intro-lock");
    el.remove();
  };

  let opened = false;
  function open() {
    if (opened) return; opened = true;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.classList.add("is-opening");
    if (reduce) { el.classList.add("is-leaving"); setTimeout(done, 400); return; }
    setTimeout(() => el.classList.add("s-flap"), 800);
    setTimeout(() => el.classList.add("s-door"), 1650);
    setTimeout(() => el.classList.add("is-leaving"), 4100);
    setTimeout(done, 5300);
  }

  function start() {
    document.body.appendChild(el);
    document.documentElement.classList.add("intro-lock");
    size(); addEventListener("resize", size);
    const ic = el.querySelector("#ic");
    ic.addEventListener("click", open);
    ic.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    el.querySelector("#introSkip").addEventListener("click", () => { el.classList.add("is-leaving"); setTimeout(done, 500); });
    requestAnimationFrame(() => el.classList.add("is-in"));
    ic.focus({ preventScroll: true });
  }

  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
