// TC από Anube μέσα στον co-driver (δοκιμαστικό, κλειστό από προεπιλογή: Ρυθμίσεις → «TC από Anube»).
// Διαβάζει από το Firebase τη σύνοψη που ανεβάζει ο καταγραφέας (rally-tc/tc.js): θέσεις TC,
// χρόνους κάθε πληρώματος από το ακαριαίο λεπτό, διαδρομή του πρώτου αυτοκινήτου.
// Δείχνει: επόμενο TC σε μέτρα της ειδικής (με τα μέτρα του co-driver) και με το GPS, και την απόκλισή σου ανά TC.
// Όλα μέσα σε try/catch: αν κάτι πάει στραβά, ο co-driver συνεχίζει κανονικά.
(function(){
'use strict';
const FB = "https://rally-tc-default-rtdb.europe-west1.firebasedatabase.app";
const REST = "https://rest.anube.es/rallyrest/default/api/";
const LS = { get(k, d){ try { const v = localStorage.getItem(k); return v == null ? d : v; } catch(e){ return d; } },
             set(k, v){ try { localStorage.setItem(k, v); } catch(e){} },
             json(k, d){ try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch(e){ return d; } } };
const on = () => LS.get("cpTc", "0") === "1";
const rally = () => String(LS.get("cpTcRally", "9274")).replace(/\D/g, "");
const meDorsal = () => String(LS.get("cpTcMe", "6")).trim();
const manual = () => String(LS.get("cpTcCrews", "")).split(/[^0-9]+/).filter(Boolean);
const TOL = 1.5, UNSURE = 80;
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmtM = (m) => Math.round(m).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " m";
const fmtS = (s) => Math.abs(s).toFixed(1).replace(".", ",");
const median = (a) => { const s = [...a].sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const RAD = Math.PI / 180, RE = 6371000;
const hv = (a, b) => { const p1 = a[0] * RAD, p2 = b[0] * RAD, dp = p2 - p1, dl = (b[1] - a[1]) * RAD; return 2 * RE * Math.asin(Math.sqrt(Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2)); };

let data = null, secs = null, d2p = null, lastFetch = 0, err = "", top = null, off = null;
function cacheKey(k){ return "cpTc_" + k + "_" + rally(); }
function loadCache(){ data = LS.json(cacheKey("fb"), null); secs = LS.json(cacheKey("secs"), null); d2p = LS.json(cacheKey("d2p"), null); top = LS.json(cacheKey("top"), null); }

async function fetchAll(){
  if (!on() || navigator.onLine === false) return;
  const r = rally(); if (!r) return;
  lastFetch = Date.now();
  try {
    if (!secs){
      const S = await fetch(REST + "sections/" + r + ".json?rally=rally" + r + "&port=auto").then(x => x.json());
      secs = {}; ((S.event && S.event.data && S.event.data.sections) || []).forEach(s => { secs[s.name] = String(s.section); });
      LS.set(cacheKey("secs"), JSON.stringify(secs));
    }
    if (!d2p){
      const P = await fetch(REST + "participants/" + r + ".json?rally=rally" + r + "&port=auto").then(x => x.json());
      d2p = {}; ((P.event && P.event.data && P.event.data.participants) || []).forEach(p => { d2p[String(p.dorsal)] = String(p.participant); });
      LS.set(cacheKey("d2p"), JSON.stringify(d2p));
    }
    // οι «καλοί»: οι 10 πρώτοι της γενικής κατάταξης μέχρι τώρα
    try {
      const C = await fetch(REST + "classification/" + r + ".json?rally=rally" + r + "&port=auto").then(x => x.json());
      const cl = ((C.event && C.event.data && C.event.data.classification) || []).filter(c => !c.dnq && c.puesto).sort((a, b) => a.puesto - b.puesto);
      if (cl.length){ top = cl.map(c => String(c.participant)); LS.set(cacheKey("top"), JSON.stringify(top)); }
    } catch(e){}
    // επίσημα δευτερόλεπτα (μόνο σε ειδικές που δεν είναι κρυφές)
    try {
      const T = await fetch(REST + "total_scoring/" + r + ".json?rally=rally" + r + "&port=auto").then(x => x.json());
      const o = {};
      ((T.event && T.event.data && T.event.data.total_scoring) || []).forEach(row => {
        const sv = String(row.seconds || "").split(",");
        sv.forEach((v, i) => { const f = parseFloat(v); if (i > 0 && v.trim() !== "" && !isNaN(f)) ((o[row.section] = o[row.section] || {})[row.participant] = o[row.section][row.participant] || {})[i] = f; });
      });
      off = o;
    } catch(e){}
    const j = await fetch(FB + "/tc/" + r + ".json?t=" + Date.now(), { cache: "no-store" }).then(x => x.json());
    if (j && j.s){ data = j; LS.set(cacheKey("fb"), JSON.stringify(j)); }
    err = "";
  } catch(e){ err = "Χωρίς σύνδεση με τα δεδομένα TC"; }
}

// ειδική του co-driver → ειδική του Anube: «RT12 …» → «T12»
function secFor(st){
  if (!st || !secs) return null;
  const m = String(st.name || "").match(/RT\s*0*(\d+)/i) || String(st.name || "").match(/^T\s*0*(\d+)/i);
  if (!m) return null;
  const nm = "T" + String(m[1]).padStart(2, "0");
  return secs[nm] || secs["T" + m[1]] || null;
}

function project(trk, pt){
  const kx = Math.cos(pt[0] * RAD) * RE * RAD, ky = RE * RAD;
  let best = null, s = 0;
  for (let j = 1; j < trk.length; j++){
    const A = trk[j - 1], B = trk[j];
    const ax = (A[1] - pt[1]) * kx, ay = (A[0] - pt[0]) * ky, bx = (B[1] - pt[1]) * kx, by = (B[0] - pt[0]) * ky;
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy, len = Math.sqrt(L);
    let f = L ? -(ax * dx + ay * dy) / L : 0; f = Math.max(0, Math.min(1, f));
    const d = Math.hypot(ax + dx * f, ay + dy * f);
    if (!best || d < best.d) best = { d, s: s + len * f };
    s += len;
  }
  return best;
}

function compute(){
  const A = window.RegApp; if (!A || !A.act) return null;
  const st = A.act(); const sec = secFor(st);
  if (!sec) return { msg: "Η ειδική «" + esc(st && st.name) + "» δεν αντιστοιχεί σε ειδική του Anube" };
  const x = data && data.s && data.s[sec];
  if (!x) return { msg: "Δεν έχουν έρθει ακόμα δεδομένα TC για αυτή την ειδική" };
  const P = A.pts(st), mePid = d2p ? d2p[meDorsal()] : null;
  const tcArr = x.tc || {}, elArr = x.el || {};
  const keys = Object.keys(tcArr).filter(k => tcArr[k]).map(Number).sort((a, b) => a - b);
  const tcs = keys.map(k => {
    const t = tcArr[k], el = elArr[k] || {};
    // ποιοι μετράνε: όσοι έγραψες στις Ρυθμίσεις, αλλιώς οι 10 πρώτοι της γενικής, αλλιώς όλοι
    const man = manual().map(d => d2p && d2p[d]).filter(Boolean);
    const good = man.length ? new Set(man) : top ? new Set(top.filter(p => p !== mePid).slice(0, 10)) : null;
    let pool = Object.keys(el).filter(p => p !== mePid && (!good || good.has(p)));
    if (pool.length < 2) pool = Object.keys(el).filter(p => p !== mePid);
    // ειδική με φανερά δευτερόλεπτα: ιδανικός χρόνος = χρόνος GPS − επίσημη απόκλιση (σχεδόν ακριβής)
    const so = off && off[sec];
    const exact = so ? Object.keys(el).filter(p => so[p] && so[p][k] != null).map(p => +el[p] - so[p][k]) : [];
    const others = pool.map(p => +el[p]);
    let kept = others;
    for (let i = 0; i < 2 && kept.length >= 2; i++){ const m = median(kept); const nk = others.filter(v => Math.abs(v - m) <= TOL); if (nk.length) kept = nk; }
    let mean = kept.length ? kept.reduce((a, b) => a + b, 0) / kept.length : null;
    if (exact.length >= 2) mean = median(exact);
    const dist = mean != null && P.length > 1 ? A.idealDistAt(P, mean) : null;
    const mine = mePid && el[mePid] != null ? +el[mePid] : null;
    const offMine = so && mePid && so[mePid] ? so[mePid][k] : null;
    return { k, loc: [t[0], t[1]], spread: t[2], n: t[3], mean, dist, exact: exact.length >= 2, dev: offMine != null ? offMine : mine != null && mean != null ? mine - mean : null, official: offMine != null, unsure: t[2] > UNSURE };
  });
  return { st, sec, tcs, trk: x.trk || null, A };
}

let card = null;
function ensureCard(){
  if (card && document.body.contains(card)) return card;
  // μια λωρίδα στην κορυφή της κάρτας με τις τουλίπες (κάθετο: κάτω από τα μέτρα, οριζόντιο: δεξιά πάνω)
  const host = document.getElementById("tulStack");
  if (!host) return null;
  // στη θέση των κουμπιών «Προηγούμενη / Επόμενη» τουλίπα (κρύβονται όσο είναι ενεργό το TC)
  if (!document.getElementById("tcCss")){
    const st = document.createElement("style"); st.id = "tcCss";
    st.textContent = ":root.tcon #tulNav{display:none!important}";
    document.head.appendChild(st);
  }
  card = document.createElement("div");
  card.id = "tcCard";
  card.style.cssText = "flex:none;padding:8px 12px;border:2px solid var(--accent);border-radius:14px;line-height:1.2";
  const nav = document.getElementById("tulNav");
  if (nav && nav.parentNode === host) host.insertBefore(card, nav.nextSibling); else host.appendChild(card);
  return card;
}

function render(){
  try {
    const c = ensureCard(); if (!c) return;
    if (!on()){ c.hidden = true; document.documentElement.classList.remove("tcon"); return; }
    c.hidden = false; document.documentElement.classList.add("tcon");
    const r = compute();
    if (!r){ c.innerHTML = ""; return; }
    if (r.msg){ c.innerHTML = `<div style="font-size:13px;color:var(--muted);letter-spacing:.06em">TC · ANUBE</div><div style="color:var(--muted);font-size:15px">${r.msg}${err ? " · " + err : ""}</div>`; return; }
    const m = r.A.meters();
    // επόμενο TC με τα μέτρα του co-driver
    const sure = r.tcs.filter(t => t.dist != null && !t.unsure);
    const next = sure.find(t => t.dist > m - 15);
    let main = next ? `<b>TC${next.k}</b> σε <b>${fmtM(Math.max(0, next.dist - m))}</b> <span style="color:var(--muted);font-size:15px">στα ${fmtM(next.dist)}</span>` : (r.tcs.length ? "Επόμενο TC: δεν το έχει περάσει κανείς ακόμα" : "Κανένα TC ακόμα");
    // και με το GPS (απόσταση πάνω στη διαδρομή του πρώτου αυτοκινήτου)
    let gpsTxt = "";
    const g = r.A.gps && r.A.gps();
    if (next && r.trk && r.trk.length > 1 && g && g.last && g.age < 5000){
      const me = project(r.trk, [g.last.lat, g.last.lon]), tc = project(r.trk, next.loc);
      if (me && tc && me.d < 150 && tc.d < 80) gpsTxt = `GPS: σε ${fmtM(Math.max(0, tc.s - me.s))}`;
    }
    const unsureAhead = r.tcs.filter(t => t.unsure && (!next || t.k < next.k) && (t.dist == null || t.dist > m - 15)).map(t => "TC" + t.k);
    // απόκλιση στα TC που πέρασες
    const devs = r.tcs.filter(t => t.dev != null);
    const last = devs[devs.length - 1];
    const dv = (t) => `<span style="color:${Math.abs(t.dev) < 0.3 ? "var(--good,#4fd17f)" : t.dev > 0 ? "#e8322c" : "#5aa9ff"}">${t.dev > 0 ? "+" : t.dev < 0 ? "−" : ""}${fmtS(t.dev)}″${t.official ? "✓" : ""}</span>`;
    const land = window.innerWidth > window.innerHeight;
    const head = `<span style="font-size:13px;color:var(--muted);letter-spacing:.06em">TC · ANUBE${data && data.t ? " " + new Date(data.t * 1000).toLocaleTimeString("el-GR", {hour:"2-digit", minute:"2-digit", hour12:false}) : ""}${err ? " ⚠︎" : ""}</span>`;
    const lastTxt = last ? `TC${last.k} ${dv(last)}` : "";
    if (land){ // οριζόντιο: μία γραμμή, για να μη μικραίνει η τουλίπα
      c.style.padding = "4px 10px";
      c.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline;white-space:nowrap;overflow:hidden">`
        + `<span style="font-size:20px">${main.replace(/ <span style="color:var\(--muted\);font-size:15px">στα [^<]*<\/span>/, "")}${gpsTxt ? ` <span style="color:var(--muted);font-size:15px">· ${gpsTxt}</span>` : ""}${next && next.spread > 50 ? ` <span style="color:var(--muted);font-size:15px">±${Math.round(next.spread)} m</span>` : ""}</span>`
        + `<span style="font-size:18px">${lastTxt}</span></div>`;
      return;
    }
    c.style.padding = "8px 12px";
    c.innerHTML = `<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline">${head}<span style="font-size:20px">${lastTxt}</span></div>`
      + `<div style="font-size:${land ? 22 : 24}px;margin-top:2px">${main}</div>`
      + (gpsTxt || next || unsureAhead.length ? `<div style="color:var(--muted);font-size:15px;margin-top:2px">${[gpsTxt, next ? "θέση ±" + Math.round(next.spread) + " m (" + next.n + " αυτ.)" : "", unsureAhead.length ? "⚠︎ " + unsureAhead.join(", ") + " αβέβαιο" : ""].filter(Boolean).join(" · ")}</div>` : "")
      + (devs.length > 1 && !land ? `<div style="color:var(--muted);font-size:14px;margin-top:2px">${devs.slice(-5).map(t => "TC" + t.k + " " + dv(t)).join(" · ")}</div>` : "");
  } catch(e){ try { if (card) card.innerHTML = '<div class="label">TC · Anube</div><div style="color:var(--muted)">σφάλμα: ' + esc(e.message) + "</div>"; } catch(x){} }
}

function settings(){
  try {
    if (document.getElementById("tcSet")) return;
    const v = document.getElementById("v-set"); if (!v) return;
    const stack = v.querySelector(".stack"); if (!stack) return;
    const d = document.createElement("div");
    d.className = "card stack"; d.id = "tcSet";
    d.innerHTML = `<span class="label">TC από Anube (δοκιμαστικό)</span>
      <p class="note">Δείχνει το επόμενο TC και την απόκλισή σου, από τα δεδομένα που ανεβάζει ο καταγραφέας. Χρειάζεται internet για να έρθουν· κρατάει ό,τι έχει έρθει.</p>
      <label style="display:flex;gap:10px;align-items:center;font-size:18px"><input type="checkbox" id="tcOn" ${on() ? "checked" : ""} style="width:28px;height:28px"> Ενεργό</label>
      <div class="btnrow">
        <div class="field" style="width:150px"><label for="tcRally">Αγώνας Anube</label><input id="tcRally" class="num" inputmode="numeric" value="${esc(rally())}"></div>
        <div class="field" style="width:150px"><label for="tcMe">Ο αριθμός μου</label><input id="tcMe" class="num" inputmode="numeric" value="${esc(meDorsal())}"></div>
      </div>
      <div class="field"><label for="tcCrews">Πληρώματα που μετράνε (κενό = οι 10 πρώτοι της γενικής)</label><input id="tcCrews" class="num" inputmode="text" placeholder="π.χ. 1, 2, 4, 9" value="${esc(LS.get("cpTcCrews", ""))}"></div>
      <p class="note">Οι ειδικές RT12, RT13… αντιστοιχούν αυτόματα στις T12, T13… του Anube.</p>`;
    stack.insertBefore(d, stack.children[1] || null);
    document.getElementById("tcOn").onchange = (e) => { LS.set("cpTc", e.target.checked ? "1" : "0"); if (e.target.checked) fetchAll().then(render); render(); };
    document.getElementById("tcRally").onchange = (e) => { LS.set("cpTcRally", e.target.value.replace(/\D/g, "")); secs = null; d2p = null; data = null; top = null; off = null; loadCache(); fetchAll().then(render); };
    document.getElementById("tcMe").onchange = (e) => { LS.set("cpTcMe", e.target.value.trim()); render(); };
    document.getElementById("tcCrews").onchange = (e) => { LS.set("cpTcCrews", e.target.value.trim()); render(); };
  } catch(e){}
}

try {
  loadCache();
  settings();
  setInterval(render, 1000);
  setInterval(() => { if (on()) fetchAll().then(render); }, 30000);
  window.addEventListener("online", () => { if (on()) fetchAll().then(render); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && on()) fetchAll().then(render); });
  if (on()) fetchAll().then(render);
  window.cpTcDebug = { compute, fetchAll, get data(){ return data; }, get top(){ return top; }, get off(){ return off; } };
} catch(e){}
})();
