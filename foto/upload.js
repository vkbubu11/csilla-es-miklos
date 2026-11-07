/* Vendégfotók feltöltése a Google Drive-mappába (Apps Scripten keresztül) */
(() => {
  "use strict";
  const W = window.WEDDING || { palettes: [] };
  const ENDPOINT = W.scriptUrl || W.rsvpEndpoint || "";
  const MAX_SIDE = 3200;             // ennél nagyobb képeket kicsinyítünk
  const MAX_VIDEO_MB = 30;           // Apps Script kérésméret-korlát miatt
  const PARALLEL = 2;
  const $ = s => document.querySelector(s);

  /* ---------- színvilág (közös a főoldallal) ---------- */
  const KEY = "cm-theme";
  function applyTheme(id, save) {
    const p = W.palettes.find(x => x.id === id) || W.palettes[0]; if (!p) return;
    const r = document.documentElement.style;
    [["--bg", p.bg], ["--band", p.band], ["--band-text", p.bandText], ["--accent", p.accent], ["--rule", p.rule], ["--text", p.text]].forEach(([k, v]) => r.setProperty(k, v));
    document.querySelector('meta[name="theme-color"]').content = p.band;
    document.querySelectorAll(".theme__opt").forEach(b => b.setAttribute("aria-pressed", b.dataset.id === p.id));
    if (save) { try { localStorage.setItem(KEY, p.id); } catch (e) {} }
  }
  applyTheme("emerald", false); // végleges színvilág
  try { const n = localStorage.getItem("cm-name"); if (n) $("#who").value = n; } catch (e) {}

  /* ---------- fájlok kiválasztása ---------- */
  const items = []; // { file, el, state: 'new'|'busy'|'done'|'err' }
  const grid = $("#grid"), send = $("#send"), summary = $("#summary");

  function addFiles(list) {
    $("#thanks").hidden = true;
    [...list].forEach(file => {
      if (!/^(image|video)\//.test(file.type) && !/\.(heic|heif)$/i.test(file.name)) return;
      const el = document.createElement("div");
      el.className = "thumb";
      const url = URL.createObjectURL(file);
      el.innerHTML = (file.type.startsWith("video/")
        ? `<video src="${url}#t=0.1" muted playsinline preload="metadata"></video><span class="vid">videó</span>`
        : `<img src="${url}" alt="">`) +
        `<button class="x" aria-label="Eltávolítás">×</button><span class="st"></span><span class="bar"></span>`;
      const item = { file, el, state: "new" };
      el.querySelector(".x").onclick = () => {
        if (item.state === "busy") return;
        items.splice(items.indexOf(item), 1); el.remove(); URL.revokeObjectURL(url); refresh();
      };
      if (file.type.startsWith("video/") && file.size > MAX_VIDEO_MB * 1048576) {
        item.state = "err"; el.classList.add("err"); el.querySelector(".st").textContent = "!";
        el.title = `Túl nagy videó (max. ${MAX_VIDEO_MB} MB)`;
      }
      items.push(item); grid.appendChild(el);
    });
    refresh();
    if (items.length) grid.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  $("#files").addEventListener("change", e => { addFiles(e.target.files); e.target.value = ""; });
  const picker = $("#picker");
  ["dragenter", "dragover"].forEach(t => picker.addEventListener(t, e => { e.preventDefault(); picker.classList.add("drag"); }));
  ["dragleave", "drop"].forEach(t => picker.addEventListener(t, e => { e.preventDefault(); picker.classList.remove("drag"); }));
  picker.addEventListener("drop", e => addFiles(e.dataTransfer.files));

  function refresh() {
    const todo = items.filter(i => i.state === "new").length;
    const done = items.filter(i => i.state === "done").length;
    const bad = items.filter(i => i.state === "err").length;
    const busy = items.some(i => i.state === "busy");
    send.disabled = busy || !todo;
    send.textContent = busy ? "Feltöltés folyamatban…" : todo ? `${todo} fájl feltöltése` : "Válassz képeket";
    summary.textContent = [done && `${done} feltöltve`, bad && `${bad} nem sikerült (koppints rá a részletekért)`].filter(Boolean).join(" · ");
  }

  /* ---------- előkészítés: kicsinyítés, base64 ---------- */
  async function prepare(file) {
    const isImg = file.type.startsWith("image/") && !/gif|heic|heif/i.test(file.type);
    if (isImg) {
      try {
        const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
        const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
        if (scale < 1 || file.size > 8 * 1048576) {
          const c = document.createElement("canvas");
          c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
          c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
          const blob = await new Promise(r => c.toBlob(r, "image/jpeg", 0.9));
          if (blob) return { blob, type: "image/jpeg", filename: file.name.replace(/\.[^.]+$/, "") + ".jpg" };
        }
      } catch (e) { /* ha nem dekódolható (pl. HEIC), az eredetit küldjük */ }
    }
    return { blob: file, type: file.type || "image/heic", filename: file.name };
  }
  const toBase64 = blob => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result).split(",")[1] || "");
    fr.onerror = rej; fr.readAsDataURL(blob);
  });

  function post(payload, onProgress) {
    // FONTOS: egyszerű (preflight nélküli) kérés kell, mert az Apps Script nem válaszol OPTIONS-re.
    // Ezért nincs feltöltési progress-figyelő (az preflightot váltana ki) – a csíkot becsüljük.
    let p = 0;
    const tick = setInterval(() => { p += (0.9 - p) * 0.08; onProgress(p); }, 250);
    const done = () => clearInterval(tick);
    if (!ENDPOINT) { // próbaüzem
      return new Promise(r => setTimeout(r, 1200)).then(() => { done(); return { ok: true, test: true }; });
    }
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    }).then(async res => {
      done();
      let r = null; try { r = await res.json(); } catch (e) {}
      if (res.ok && r && r.ok && r.id) return r;
      if (r && r.ok && !r.id) throw new Error("A szerveren még a régi szkriptverzió fut (nincs fotómentés).");
      throw new Error((r && r.error) || "HTTP " + res.status);
    }, err => { done(); throw new Error("Hálózati hiba – ellenőrizd az internetkapcsolatot, és próbáld újra."); });
  }

  async function uploadOne(item, who) {
    item.state = "busy"; item.el.classList.add("busy"); refresh();
    const bar = item.el.querySelector(".bar");
    try {
      const { blob, type, filename } = await prepare(item.file);
      const data = await toBase64(blob);
      const payload = { action: "upload", name: who, filename, type, data, weboldal: "" };
      try { await post(payload, p => { bar.style.width = (p * 100) + "%"; }); }
      catch (e) { bar.style.width = "0"; await post(payload, p => { bar.style.width = (p * 100) + "%"; }); } // egy újrapróbálás
      bar.style.width = "100%";
      item.state = "done"; item.el.className = "thumb done"; item.el.querySelector(".st").textContent = "✓";
    } catch (e) {
      item.state = "err"; item.el.className = "thumb err"; item.el.querySelector(".st").textContent = "!";
      item.el.title = "Nem sikerült: " + e.message;
    }
    refresh(); updateTotal();
  }

  function updateTotal() {
    const all = items.length || 1;
    $("#total").style.width = (items.filter(i => i.state === "done" || i.state === "err").length / all * 100) + "%";
  }

  send.addEventListener("click", async () => {
    const who = $("#who").value.trim();
    try { localStorage.setItem("cm-name", who); } catch (e) {}
    const queue = items.filter(i => i.state === "new");
    const workers = Array.from({ length: PARALLEL }, async () => { while (queue.length) await uploadOne(queue.shift(), who); });
    await Promise.all(workers);
    if (items.some(i => i.state === "done")) {
      $("#thanks").hidden = false;
      $("#thanks").scrollIntoView({ behavior: "smooth", block: "center" });
      if (!ENDPOINT) $("#thanks").lastElementChild.textContent = "Próbaüzem: a feltöltő még nincs bekötve, a képek nem lettek elmentve.";
    }
  });

  grid.addEventListener("click", e => {
    const t = e.target.closest(".thumb.err"); if (t && t.title) alert(t.title);
  });
  refresh();
})();
