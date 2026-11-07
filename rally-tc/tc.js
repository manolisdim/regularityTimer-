// Regularity TC — βλ. index.html για την περιγραφή.
// Τρέχει είτε ως αυτόνομη σελίδα είτε μέσα στη σελίδα παρακολούθησης του Anube (σελιδοδείκτης).
(function(){
if (window.__tcLoaded){ const h = document.getElementById("tc-host"); if (h && h.shadowRoot){ h.shadowRoot.getElementById("app").hidden = false; h.shadowRoot.getElementById("fab").hidden = true; } return; }
window.__tcLoaded = true;
const INJECTED = /anube/.test(location.hostname);
const host = document.createElement("div"); host.id = "tc-host";
(document.body || document.documentElement).appendChild(host);
const root = host.attachShadow({mode:"open"});
root.innerHTML = `<style>
:host{
  --bg:#0e1013; --panel:#171a1f; --line:#272b33; --fg:#eceef2; --muted:#8a919e;
  --accent:#e8322c; --good:#4fd17f; --gold:#f5c451; --blue:#5aa9ff;
  --display:"Barlow Condensed","Arial Narrow",system-ui,sans-serif;
  --body:"Barlow",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  color-scheme:dark;
}
@media (prefers-color-scheme: light){
  :host{--bg:#f2f3f5;--panel:#ffffff;--line:#dde0e6;--fg:#15181d;--muted:#5d6572;--accent:#d0241e;--good:#12884a;--gold:#9a6a06;--blue:#1f6fd1;color-scheme:light}
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.app{position:fixed;inset:0;z-index:2147483000;overflow-y:auto;-webkit-overflow-scrolling:touch;background:var(--bg);color:var(--fg);font:16px/1.4 var(--body);font-variant-numeric:tabular-nums;padding-bottom:env(safe-area-inset-bottom,0);text-align:left}
.app[hidden]{display:none}
.x{height:34px;width:34px;padding:0;margin-left:8px;background:var(--panel);color:var(--fg);border:1px solid var(--line);font-size:18px}
.fab{position:fixed;right:14px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);z-index:2147483000;width:auto;padding:0 16px;box-shadow:0 4px 14px rgba(0,0,0,.4)}
.fab[hidden]{display:none}
.top{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 0}
.brand{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.brand b{font:700 20px/1 var(--display);letter-spacing:.04em;text-transform:uppercase}
.brand b span{color:var(--accent)}
.status{margin-left:auto;font-size:12px;color:var(--muted);text-align:right}
.status.err{color:var(--accent)}
.status.ok::before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--good);margin-right:5px;vertical-align:1px}
form[hidden]{display:none!important}
form{display:grid;grid-template-columns:1fr 48px;gap:6px}
input,select,textarea{width:100%;min-width:0;background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:10px;font:600 18px var(--body)}
input{height:48px;padding:0 12px}
input::placeholder{color:var(--muted);font-weight:400}
button{height:48px;border:0;border-radius:10px;background:var(--accent);color:#fff;font:700 15px var(--display);letter-spacing:.06em;text-transform:uppercase;cursor:pointer;display:grid;place-items:center}
button svg{width:22px;height:22px}
.tabs{display:flex;gap:0;margin-top:10px}
.tabs button{flex:1;height:42px;border-radius:0;background:none;color:var(--muted);border-bottom:3px solid transparent;font-size:16px}
.tabs button.on{color:var(--fg);border-bottom-color:var(--accent)}
main{padding:12px 12px 40px;max-width:720px;margin:0 auto}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}
.chip{flex:none;height:36px;min-width:52px;padding:0 12px;border-radius:99px;background:var(--panel);color:var(--fg);border:1px solid var(--line);font:600 15px var(--display);letter-spacing:.05em;text-transform:uppercase}
.chip.on{background:var(--accent);border-color:var(--accent);color:#fff}
.chip.has::after{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--gold);margin-left:6px;vertical-align:2px}
h2{display:flex;align-items:baseline;gap:8px;margin:6px 2px 10px;font:700 24px/1 var(--display);letter-spacing:.04em;text-transform:uppercase}
h2 small{font:500 13px var(--body);letter-spacing:0;text-transform:none;color:var(--muted)}
.me{margin:0 2px 10px;font-size:13px;color:var(--muted)}
.me b{color:var(--fg)}
.tc{background:var(--panel);border:1px solid var(--line);border-radius:12px;margin-bottom:8px;overflow:hidden}
.tc summary{list-style:none;display:grid;grid-template-columns:62px 1fr auto;align-items:center;gap:10px;padding:12px;cursor:pointer}
.tc summary::-webkit-details-marker{display:none}
.tc .k{font:700 20px/1 var(--display);color:var(--muted);letter-spacing:.04em}
.tc .m{font:700 30px/1 var(--display)}
.tc .m small{display:block;font:500 12px var(--body);color:var(--muted);margin-top:4px}
.tc .d{font:700 26px/1 var(--display);text-align:right;white-space:nowrap}
.tc .d small{display:block;font:600 11px var(--body);letter-spacing:.05em;text-transform:uppercase;margin-top:4px}
.d.late{color:var(--accent)} .d.early{color:var(--blue)} .d.ok{color:var(--good)} .d.none{color:var(--muted);font-size:18px}
.tc.wait .m{color:var(--muted);font-size:22px}
.tc.fresh{animation:fresh 2.5s ease-out}
@keyframes fresh{0%{background:color-mix(in srgb,var(--accent) 35%,var(--panel))}100%{background:var(--panel)}}
@media (prefers-reduced-motion:reduce){.tc.fresh{animation:none}}
.det{padding:0 12px 10px;font-size:14px}
.det table{width:100%;border-collapse:collapse}
.det td{padding:5px 4px;border-top:1px solid var(--line)}
.det td:last-child{text-align:right}
.det tr.out td{color:var(--muted);text-decoration:line-through}
.det tr.mine td{font-weight:700}
.no{display:inline-grid;place-items:center;min-width:32px;height:26px;padding:0 6px;border-radius:7px;background:var(--accent);color:#fff;font:700 16px var(--display)}
.no.me{background:var(--gold);color:#15181d}
.prow{display:flex;align-items:center;gap:10px;padding:10px 2px;border-bottom:1px solid var(--line)}
.prow .who{flex:1;min-width:0;line-height:1.25}
.prow .who small{display:block;color:var(--muted);font-size:12px;overflow-wrap:anywhere}
.mebtn{flex:none;height:30px;padding:0 10px;border-radius:99px;background:none;border:1px solid var(--line);color:var(--muted);font-size:13px}
.mebtn.on{background:var(--gold);border-color:var(--gold);color:#15181d}
.sw{appearance:none;-webkit-appearance:none;flex:none;width:46px;height:28px;padding:0;border-radius:99px;background:var(--line);border:0;position:relative;cursor:pointer}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:transform .15s}
.sw:checked{background:var(--accent)}
.sw:checked::after{transform:translateX(18px)}
.tools{display:flex;gap:6px;margin-bottom:6px}
.tools input{flex:1;height:44px;font-size:16px}
.tools button{height:44px;padding:0 12px;background:var(--panel);color:var(--fg);border:1px solid var(--line)}
.cnt{font-size:13px;color:var(--muted);margin:2px 2px 6px}
.set label{display:block;font-size:13px;color:var(--muted);margin:14px 2px 6px}
.set input{height:44px;font-size:16px;max-width:10em}
.set textarea{min-height:220px;padding:10px;font:500 13px/1.35 ui-monospace,Menlo,monospace}
.set p{font-size:13px;line-height:1.45;color:var(--muted);margin:6px 2px}
.set .row{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.set .row button{height:40px;padding:0 14px;background:var(--panel);color:var(--fg);border:1px solid var(--line)}
.empty{padding:24px 16px;text-align:center;color:var(--muted);border:1px dashed var(--line);border-radius:12px;line-height:1.5}
.gpsbtn{width:100%;height:54px;margin:0 0 12px;background:var(--panel);color:var(--fg);border:1px solid var(--line);font-size:17px}\n.live{background:var(--panel);border:2px solid var(--gold);border-radius:12px;padding:12px;margin:0 0 12px}\n.live .lm{font:600 26px/1.15 var(--display)}\n.live .lm b{font-weight:700;color:var(--gold)}\n.live .ls{font-size:13px;color:var(--muted);margin-top:4px}\n.live a,.det a{color:inherit}\n.note{font-size:12px;line-height:1.45;color:var(--muted);margin:14px 2px 0}
</style><div class="app" id="app"><div class="top">
  <div class="brand"><b>Regularity <span>TC</span></b><span id="status" class="status"></span><button type="button" class="x" id="hide" aria-label="Κλείσιμο" hidden>✕</button></div>
  <form id="f" autocomplete="off">
    <input id="rally" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="Αγώνας στο Anube (π.χ. 9274)" aria-label="Αριθμός αγώνα" enterkeyhint="go">
    <button type="submit" aria-label="Σύνδεση"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
  </form>
  <nav class="tabs" role="tablist">
    <button type="button" data-tab="tc" class="on">TC</button>
    <button type="button" data-tab="crews">Πληρώματα</button>
    <button type="button" data-tab="set">Ρυθμίσεις</button>
  </nav>
</div>
<main id="out"></main></div><button type="button" class="fab" id="fab" hidden>TC</button>`;
const app = root.getElementById("app");
// Η σελίδα του Anube πιάνει αγγίγματα και πλήκτρα (χάρτης): δεν τα αφήνουμε να φτάσουν εκεί
["touchstart","touchmove","touchend","pointerdown","pointerup","mousedown","mouseup","click","keydown","keyup","keypress","wheel"].forEach(t => host.addEventListener(t, e => e.stopPropagation()));

"use strict";
// ---------------------------------------------------------------------------
// Πώς δουλεύει
// Το Anube στέλνει live (websocket) ένα μήνυμα "setscoring" τη στιγμή που ένα
// πλήρωμα περνάει ένα σημείο ελέγχου (είναι το κόκκινο αναβόσβημα στη σελίδα του).
// Το μήνυμα δεν έχει ώρα ούτε δεύτερα, οπότε:
//   ώρα περάσματος = ώρα άφιξης − καθυστέρηση δικτύου του πληρώματος
// Την καθυστέρηση τη μετράμε από τα μηνύματα θέσης του ίδιου πληρώματος
// (ώρα άφιξης − ώρα GPS), μέσος όρος των τελευταίων.
// Σημείο 0 = εκκίνηση → στρογγυλεύουμε στο ακαριαίο λεπτό.
// Σημείο k = TC → χρόνος από την εκκίνηση → μέτρα με βάση τις ΜΩΤ.
// ---------------------------------------------------------------------------
const REST = "https://rest.anube.es/rallyrest/default/api/";
const $ = (s) => root.querySelector(s);
const out = $("#out"), statusEl = $("#status"), rallyEl = $("#rally");
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v == null ? d : v; } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch(e){} },
  json(k, d){ try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch(e){ return d; } }
};
const surname = (s) => String(s || "").split(",")[0].trim();
const median = (a) => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const fmtM = (m) => Math.round(m).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " m";
const fmtS = (s, d = 1) => s.toFixed(d).replace(".", ",");
const fmtClock = (t) => new Date(t * 1000).toLocaleTimeString("el-GR", {hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false});
const fmtEl = (e) => { const m = Math.floor(e / 60), s = e - m * 60; return m + ":" + (s < 10 ? "0" : "") + s.toFixed(1).replace(".", ","); };

// ---------- ΜΩΤ: προεπιλογή 20ο Ράλλυ Δαναών 2026 (Anube T01–T18 = RT1–RT18) ----------
// segs: [μέτρα όπου τελειώνει το τμήμα, ΜΩΤ km/h]
const DANAON = {
 "T01":[[2450,40],[5248,46],[6960,40]],
 "T02":[[1285,40],[5631,45],[6053,30],[7146,45],[7325,30],[12640,47]],
 "T03":[[2530,49],[2864,30],[4742,49],[5489,40],[5676,20],[6192,40],[7779,49],[8109,40],[8658,49],[9116,40],[10580,50]],
 "T04":[[6425,49],[6948,30],[7610,47],[8382,30],[9955,47],[11088,30],[16090,47]],
 "T05":[[2387,45],[5947,43],[6871,25],[8644,45],[9210,42],[10180,25],[19630,42]],
 "T06":[[2595,43],[7266,45],[9943,43],[10590,40]],
 "T07":[[3780,49],[4745,45],[5519,40],[9147,44],[9895,30],[10954,45],[11865,40],[15840,43]],
 "T08":[[5522,45],[6522,41],[6924,25],[9050,43]],
 "T09":[[2454,40],[6541,42],[9675,47],[13200,43]],
 "T10":[[3763,45],[6474,43],[7651,25],[11250,47]],
 "T11":[[12126,45],[12523,20],[19560,48]],
 "T12":[[1299,40],[1865,30],[5646,49],[6579,40],[11030,49]],
 "T13":[[3159,48],[6605,46],[8460,40]],
 "T14":[[3144,40],[6149,49],[6350,40]],
 "T15":[[3709,42],[5980,38],[6561,20],[7550,38]],
 "T16":[[2039,42],[3493,44],[4380,25],[6146,45],[9990,38]],
 "T17":[[2482,48],[4335,43],[5181,40],[6320,49]],
 "T18":[[5700,49],[6581,40],[7877,45],[11380,47],[13300,49]]
};
const DANAON_NAMES = {T01:"Αρχ. Νεμέα",T02:"Πλατάνι",T03:"Κανδήλα",T04:"Καμένιτσα",T05:"Δρακοβούνι",T06:"Πάος",T07:"Κοντοβάζαινα",T08:"Λάδωνας",T09:"Κυράς Γεφύρι",T10:"Βαλτεσινίκο",T11:"Μαίναλο",T12:"Κιβέρι",T13:"Άστρος",T14:"Άγ. Ιωάννης",T15:"Άγ. Πέτρος",T16:"Περδικόβρυση",T17:"Παρθένι",T18:"Αχλαδόκαμπος"};
const DEFAULTS = { "9274": DANAON };

// Μέτρα που έχει διανύσει ο ιδανικός χρόνος e (δευτ.) από την εκκίνηση
function distAt(segs, e){
  let from = 0, acc = 0;
  for (const [to, v] of segs){
    const dur = (to - from) / (v / 3.6);
    if (e <= acc + dur) return from + (e - acc) * v / 3.6;
    acc += dur; from = to;
  }
  return null; // μετά το τέλος της ειδικής
}

// ---------- Κατάσταση ----------
let num = null, parts = {}, byDorsal = {}, sections = [], secById = {};
let ev = {};                 // ev[section][participant][index] = ώρα άφιξης του κοκκινίσματος (unix, δευτ.)
let pos = {};                // pos[participant] = [[ώρα GPS, lat, lon, km/h], ...] σε σειρά χρόνου
let latAll = [];             // καθυστέρηση μηνυμάτων θέσης (για την ένδειξη κατάστασης)
let ws = null, wsOk = false, wsTimer = null, tab = "tc", stageSel = null, fresh = new Set();
const crewsKey = () => "tcCrews_" + num, meKey = () => "tcMe_" + num, evKey = () => "tcEv2_" + num, posKey = () => "tcPos_" + num, motKey = () => "tcMot_" + num;
const enabled = () => new Set(store.json(crewsKey(), []));
const meDorsal = () => store.get(meKey(), "");
const mePid = () => { const p = byDorsal[meDorsal()]; return p ? String(p.participant) : null; };
const tol = () => { const t = parseFloat(String(store.get("tcTol", "1.5")).replace(",", ".")); return isNaN(t) || t <= 0 ? 1.5 : t; };
function motTable(){ return store.json(motKey(), DEFAULTS[num] || {}); }

// Μετρημένο στη T11 Δαναών 2026: το κοκκίνισμα ενός TC έρχεται ~12″ (7–19″) μετά το πέρασμα,
// της εκκίνησης ~28″ μετά το ακαριαίο λεπτό. Ο χρόνος περάσματος βγαίνει από το GPS (±0,3″).
const DELAY = 12;
const R_E = 6371000, RAD = Math.PI / 180;
function hv(a, b){ const p1 = a[0] * RAD, p2 = b[0] * RAD, dp = p2 - p1, dl = (b[1] - a[1]) * RAD; return 2 * R_E * Math.asin(Math.sqrt(Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2)); }
// θέση (και ταχύτητα) ενός πληρώματος σε ώρα t, με παρεμβολή
function posAt(pid, t){
  const a = pos[pid]; if (!a || a.length < 2 || t < a[0][0] || t > a[a.length - 1][0]) return null;
  let lo = 0, hi = a.length - 1;
  while (hi - lo > 1){ const m = (lo + hi) >> 1; if (a[m][0] <= t) lo = m; else hi = m; }
  const A = a[lo], B = a[hi], f = B[0] > A[0] ? (t - A[0]) / (B[0] - A[0]) : 0;
  if (B[0] - A[0] > 30) return null; // κενό στο GPS
  return [A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f, A[3] + (B[3] - A[3]) * f];
}
// πότε πέρασε το πλήρωμα πιο κοντά από το σημείο pt, ανάμεσα σε t0 και t1
function cross(pid, pt, t0, t1){
  const a = pos[pid]; if (!a) return null;
  const kx = Math.cos(pt[0] * RAD) * R_E * RAD, ky = R_E * RAD;
  let best = null;
  for (let j = 1; j < a.length; j++){
    const A = a[j - 1], B = a[j];
    if (B[0] < t0 || A[0] > t1 || B[0] - A[0] > 30) continue;
    const ax = (A[2] - pt[1]) * kx, ay = (A[1] - pt[0]) * ky, bx = (B[2] - pt[1]) * kx, by = (B[1] - pt[0]) * ky;
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    let f = L ? -(ax * dx + ay * dy) / L : 0; f = Math.max(0, Math.min(1, f));
    const d = Math.hypot(ax + dx * f, ay + dy * f);
    if (!best || d < best.d) best = { d, t: A[0] + (B[0] - A[0]) * f };
  }
  return best;
}
const medPt = (pts) => [median(pts.map(p => p[0])), median(pts.map(p => p[1]))];

// Καθαρά περάσματα ανά πλήρωμα (χωρίς τις μαζικές αποστολές) + ακαριαίο λεπτό εκκίνησης
function cleanRows(secId){
  const rows = ev[secId] || {}, outR = {};
  Object.keys(rows).forEach(pid => {
    const r = rows[pid];
    const ks = Object.keys(r).map(Number).sort((a, b) => a - b), bad = new Set();
    for (let i = 1; i < ks.length; i++) if (Math.abs(r[ks[i]] - r[ks[i - 1]]) < 2){ bad.add(ks[i]); bad.add(ks[i - 1]); }
    const ok = {}; ks.forEach(k => { if (!bad.has(k)) ok[k] = r[k]; });
    const start = ok[0] != null ? Math.floor((ok[0] - 15) / 60) * 60 : null;
    outR[pid] = { a: ok, start };
  });
  return outR;
}

// ---------- Υπολογισμός για μία ειδική ----------
function compute(secId){
  const sec = secById[secId]; if (!sec) return null;
  const segs = motTable()[sec.name] || null;
  const en = enabled(), meP = mePid(), T = tol();
  const rows = cleanRows(secId);
  const nTc = sec.controls.length - 1;
  const tcs = [];
  for (let k = 1; k <= nTc; k++){
    // 1) Θέση του TC: πού ήταν κάθε αυτοκίνητο ~12″ πριν το κοκκίνισμα (μόνο αν κινούνταν)
    let pts = [];
    Object.keys(rows).forEach(pid => {
      const a = rows[pid].a[k]; if (a == null) return;
      const p = posAt(pid, a - DELAY);
      if (p && p[2] > 15) pts.push([p[0], p[1]]);
    });
    let loc = null, spread = null;
    if (pts.length){
      loc = medPt(pts);
      for (let i = 0; i < 2; i++){ const near = pts.filter(p => hv(p, loc) < 120); if (near.length >= 2) loc = medPt(near); }
      spread = median(pts.map(p => hv(p, loc)));
    }
    // 2) Χρόνος από το ακαριαίο λεπτό μέχρι το πέρασμα, από το GPS του καθενός
    const all = []; let mine = null;
    if (loc) Object.keys(rows).forEach(pid => {
      const r = rows[pid], a = r.a[k]; if (a == null || r.start == null) return;
      const cr = cross(pid, loc, a - 32, a - 3);
      if (!cr || cr.d > 60) return;
      const p = parts[pid]; if (!p) return;
      const x = { d: String(p.dorsal), e: cr.t - r.start };
      if (pid === meP) mine = x;
      else if (!en.size || en.has(x.d)) all.push(x);
    });
    // 3) Όποιος απέχει > T″ από τους υπόλοιπους βγαίνει εκτός, μέσος όρος των υπολοίπων
    let kept = all;
    for (let i = 0; i < 2 && kept.length >= 2; i++){
      const m = median(kept.map(x => x.e));
      const nk = all.filter(x => Math.abs(x.e - m) <= T);
      if (nk.length) kept = nk;
    }
    const mean = kept.length ? kept.reduce((s, x) => s + x.e, 0) / kept.length : null;
    const dist = mean != null && segs ? distAt(segs, mean) : null;
    tcs.push({ k, loc, n: pts.length, spread, all, kept, out: all.filter(x => !kept.includes(x)), mean, dist, mine, dev: mine && mean != null ? mine.e - mean : null });
  }
  return { sec, segs, tcs, rows, nCrews: Object.values(rows).filter(r => r.start != null).length };
}

// ---------- Μέτρα μέχρι το επόμενο TC με το GPS του κινητού ----------
// Η απόσταση μετριέται πάνω στη διαδρομή ενός αυτοκινήτου που έχει ήδη περάσει (όχι σε ευθεία).
let ref = null; // { key, pts:[[lat,lon,s]] }
function refTrack(secId, r){
  // το πλήρωμα που έχει προχωρήσει πιο πολύ στην ειδική
  let best = null;
  Object.keys(r.rows).forEach(pid => {
    const x = r.rows[pid]; if (x.start == null || !pos[pid]) return;
    const ks = Object.keys(x.a).map(Number); const kmax = Math.max(...ks);
    if (!best || kmax > best.kmax || (kmax === best.kmax && x.a[kmax] > best.t)) best = { pid, kmax, t: x.a[kmax], start: x.start };
  });
  if (!best) return null;
  const key = secId + "/" + best.pid + "/" + pos[best.pid].length;
  if (ref && ref.key === key) return ref;
  const a = pos[best.pid].filter(q => q[0] >= best.start - 5);
  const pts = []; let s = 0;
  a.forEach((q, i) => { if (i) s += hv([a[i - 1][1], a[i - 1][2]], [q[1], q[2]]); pts.push([q[1], q[2], s]); });
  ref = { key, pts };
  return ref;
}
function project(trk, pt, sMin){
  const kx = Math.cos(pt[0] * RAD) * R_E * RAD, ky = R_E * RAD;
  let best = null;
  for (let j = 1; j < trk.length; j++){
    const A = trk[j - 1], B = trk[j];
    if (sMin != null && B[2] < sMin) continue;
    const ax = (A[1] - pt[1]) * kx, ay = (A[0] - pt[0]) * ky, bx = (B[1] - pt[1]) * kx, by = (B[0] - pt[0]) * ky;
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    let f = L ? -(ax * dx + ay * dy) / L : 0; f = Math.max(0, Math.min(1, f));
    const d = Math.hypot(ax + dx * f, ay + dy * f);
    if (!best || d < best.d) best = { d, s: A[2] + (B[2] - A[2]) * f };
  }
  return best;
}
let gpsOn = store.get("tcGps", "0") === "1", gpsWatch = null, myFix = null, mySPrev = null, gpsErr = "";
function setGps(on){
  gpsOn = on; store.set("tcGps", on ? "1" : "0");
  if (gpsWatch != null){ try { navigator.geolocation.clearWatch(gpsWatch); } catch(e){} gpsWatch = null; }
  myFix = null; mySPrev = null; gpsErr = "";
  if (on && navigator.geolocation){
    gpsWatch = navigator.geolocation.watchPosition(
      p => { myFix = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy, t: Date.now() }; gpsErr = ""; updateLive(); },
      e => { gpsErr = e.code === 1 ? "Δεν δόθηκε άδεια τοποθεσίας στο Safari." : "Δεν βρίσκω GPS."; updateLive(); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
  }
}
function liveHtml(){
  if (!gpsOn) return `<button type="button" class="gpsbtn" data-gps="1">📍 Μέτρα μέχρι το TC με το GPS μου</button>`;
  const cur = currentStage(); const r = cur && compute(cur.section);
  let main = "", sub = "";
  if (gpsErr) main = gpsErr;
  else if (!myFix) main = "Περιμένω GPS…";
  else {
    const trk = r && refTrack(cur.section, r);
    if (!trk || trk.pts.length < 2) main = "Δεν έχει περάσει ακόμα κανείς από την ειδική.";
    else {
      const me = [myFix.lat, myFix.lon];
      let pm = project(trk.pts, me, mySPrev != null ? mySPrev - 150 : null);
      if (!pm || pm.d > 150) pm = project(trk.pts, me, null);
      if (!pm || pm.d > 150) main = "Εκτός διαδρομής της ειδικής";
      else {
        mySPrev = pm.s;
        const ahead = r.tcs.filter(t => t.loc).map(t => ({ t, s: project(trk.pts, t.loc, null) })).filter(x => x.s && x.s.d < 80 && x.s.s > pm.s - 5).sort((a, b) => a.s.s - b.s.s);
        if (!ahead.length) main = "Επόμενο TC: δεν το έχει περάσει κανείς ακόμα";
        else {
          const x = ahead[0], last = x.t.k === r.tcs.length;
          main = `<b>${last ? "ΤΕΛΟΣ" : "TC" + x.t.k}</b> σε <b>${fmtM(Math.max(0, x.s.s - pm.s))}</b>`;
          if (ahead[1]) sub = `μετά ${ahead[1].t.k === r.tcs.length ? "ΤΕΛΟΣ" : "TC" + ahead[1].t.k} σε ${fmtM(ahead[1].s.s - pm.s)} · `;
          sub += `θέση TC ±${Math.round(x.t.spread || 0)} m (${x.t.n} αυτ.)`;
        }
      }
    }
  }
  return `<div class="live"><div class="lm">${main}</div>${sub ? `<div class="ls">${sub}</div>` : ""}<div class="ls">GPS ±${myFix ? Math.round(myFix.acc) : "–"} m · <a href="#" data-gps="0">κλείσιμο</a></div></div>`;
}
function updateLive(){ const el = root.getElementById("live"); if (el && tab === "tc") el.innerHTML = liveHtml(); }

// ---------- Δεδομένα ----------
function api(path){
  return fetch(REST + path + "/" + num + ".json?rally=rally" + num + "&port=auto", {cache:"no-store"})
    .then(r => { if (!r.ok) throw new Error(path + " HTTP " + r.status); return r.json(); });
}
const isPlaceholder = (p) => { const pil = String(p.piloto || "").trim(); return !pil || pil === "-" || /reserva|spare/i.test([p.dorsal, p.clase, p.categoria].join(" ")); };

async function connect(n){
  num = n; store.set("tcRally", n);
  ev = store.json(evKey(), {}); pos = store.json(posKey(), {});
  latAll = []; ref = null; stageSel = store.get("tcStage_" + n, null);
  closeWs();
  setStatus("Φόρτωση…");
  const cache = store.json("tcStruct_" + n, null);
  if (cache) applyStruct(cache.P, cache.S);
  try {
    const [P, S] = await Promise.all([api("participants"), api("sections")]);
    applyStruct(P, S);
    store.set("tcStruct_" + n, JSON.stringify({P, S}));
  } catch(e){
    if (!cache){ setStatus("Σφάλμα: " + e.message, true); out.innerHTML = `<div class="empty">Δεν ήρθαν δεδομένα για τον αγώνα ${esc(n)}.</div>`; return; }
  }
  openWs();
  render();
}
function applyStruct(P, S){
  parts = {}; byDorsal = {};
  ((P.event && P.event.data && P.event.data.participants) || []).forEach(p => { if (isPlaceholder(p)) return; parts[p.participant] = p; byDorsal[String(p.dorsal)] = p; });
  sections = ((S.event && S.event.data && S.event.data.sections) || []).map(s => ({
    section: s.section, name: s.name, controls: String(s.controlpoints || "").split(",").filter(Boolean), ut_ini: s.ut_ini, closed: +s.closed === 1
  }));
  secById = {}; sections.forEach(s => secById[s.section] = s);
}

function wsUrl(){
  const last = String(num).slice(-1);
  return `wss://ws.anube.es:45${last}/realtime/rally${num}?rally=rally${num}&port=auto`;
}
function openWs(){
  const n = num;
  try { ws = new WebSocket(wsUrl()); } catch(e){ retryWs(n); return; }
  ws.onopen = () => { wsOk = true; wsFails = 0; setStatus(); keepAwake(true); };
  ws.onclose = () => { wsOk = false; setStatus(); if (num === n) retryWs(n); };
  ws.onerror = () => {};
  ws.onmessage = (m) => {
    const now = Date.now() / 1000;
    let msg; try { msg = JSON.parse(m.data); } catch(e){ return; }
    if (!msg || !msg.event) return;
    onEvent(msg.event.type, msg.event.data, now);
  };
}
let wsFails = 0;
function retryWs(n){ wsFails++; if (!INJECTED && wsFails === 2 && tab === "tc") render(); clearTimeout(wsTimer); wsTimer = setTimeout(() => { if (num === n && (!ws || ws.readyState > 1)) openWs(); }, 4000); }
function closeWs(){ clearTimeout(wsTimer); if (ws){ ws.onclose = null; try { ws.close(); } catch(e){} } ws = null; wsOk = false; }

let saveT = null, posSaveT = null;
function savePos(){
  // κρατάμε την τελευταία 1 ώρα θέσεων (για να αντέξει ανανέωση της σελίδας)
  // στη μνήμη κρατάμε 4 ώρες, στη συσκευή τις τελευταίες 1,5 ώρα (όριο χώρου)
  const now = Date.now() / 1000, o = {};
  Object.keys(pos).forEach(p => { pos[p] = pos[p].filter(q => q[0] >= now - 4 * 3600); const a = pos[p].filter(q => q[0] >= now - 5400); if (a.length) o[p] = a; });
  try { localStorage.setItem(posKey(), JSON.stringify(o)); } catch(e){ try { localStorage.removeItem(posKey()); } catch(e2){} }
}
function onEvent(type, d, now){
  if (type === "participant" && d && d.unixtime_gps && d.latitude){
    const l = now - d.unixtime_gps;
    if (l > -5 && l < 60){ latAll.push(l); if (latAll.length > 300) latAll.shift(); }
    const a = pos[d.participant] = pos[d.participant] || [];
    const q = [d.unixtime_gps, +(+d.latitude).toFixed(6), +(+d.longitude).toFixed(6), +d.speed || 0];
    if (!a.length || q[0] > a[a.length - 1][0]) a.push(q);
    else if (!a.some(x => x[0] === q[0])){ a.push(q); a.sort((x, y) => x[0] - y[0]); }
    if (!posSaveT) posSaveT = setTimeout(() => { posSaveT = null; savePos(); }, 30000);
    return;
  }
  if (type === "closesection" && d){
    // Στο κλείσιμο το Anube στέλνει μαζεμένα «περάσματα» για όσους δεν πέρασαν: τα πετάμε
    const sec = secById[d.section]; if (sec) sec.closed = true;
    const s = ev[d.section] || {};
    Object.keys(s).forEach(pid => Object.keys(s[pid]).forEach(k => { if (now - s[pid][k] < 8) delete s[pid][k]; }));
    store.set(evKey(), JSON.stringify(ev)); savePos();
    if (tab === "tc") render();
    return;
  }
  if (type === "setscoring" && d){
    const sec = secById[d.section]; if (!sec || sec.closed) return;
    const k = sec.controls.indexOf(String(d.control_point)); if (k < 0) return;
    const s = ev[d.section] = ev[d.section] || {};
    const r = s[d.participant] = s[d.participant] || {};
    if (r[k] != null) return;                 // κρατάμε μόνο το πρώτο κοκκίνισμα
    r[k] = +now.toFixed(2);
    fresh.add(d.section + "/" + k);
    if (store.get("tcStage_" + num, "auto") === "auto") autoStage = d.section;
    clearTimeout(saveT); saveT = setTimeout(() => store.set(evKey(), JSON.stringify(ev)), 500);
    if (tab === "tc"){ clearTimeout(rT); rT = setTimeout(render, 13000); render(); } // ξανά μετά από 13″, όταν έχουν έρθει οι θέσεις
  }
}
let rT = null;
let autoStage = null;

function setStatus(msg, err){
  if (msg){ statusEl.className = "status" + (err ? " err" : ""); statusEl.textContent = msg; return; }
  if (!num){ statusEl.textContent = ""; return; }
  if (wsOk){ statusEl.className = "status ok"; statusEl.textContent = (INJECTED ? "#" + num + " · " : "") + "Live · καθυστ. " + (latAll.length ? fmtS(median(latAll)) + "″" : "–"); }
  else { statusEl.className = "status err"; statusEl.textContent = navigator.onLine === false ? "Χωρίς internet" : "Επανασύνδεση…"; }
}
setInterval(() => setStatus(), 5000);

// ---------- Οθόνες ----------
function currentStage(){
  const sel = store.get("tcStage_" + num, "auto");
  if (sel !== "auto" && secById[sel]) return secById[sel];
  if (autoStage && secById[autoStage]) return secById[autoStage];
  // η πιο πρόσφατη ειδική που έχει ξεκινήσει και δεν έχει κλείσει
  const now = Date.now() / 1000;
  const open = sections.filter(s => !s.closed && s.ut_ini && s.ut_ini <= now + 600).sort((a, b) => b.ut_ini - a.ut_ini);
  return open[0] || sections.find(s => !s.closed) || sections[sections.length - 1];
}
const stageLabel = (s) => { const nm = (num === "9274" && DANAON_NAMES[s.name]) ? " · " + DANAON_NAMES[s.name] : ""; return s.name + nm; };

function render(){
  root.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
  if (!num){ out.innerHTML = `<div class="empty">Γράψε τον αριθμό του αγώνα στο Anube<br>(ο αριθμός μετά το «rally» στο link, π.χ. <b>9274</b>).</div>`; return; }
  if (tab === "crews") return renderCrews();
  if (tab === "set") return renderSet();
  renderTc();
}

function renderTc(){
  if (!sections.length){ out.innerHTML = `<div class="empty">Δεν υπάρχουν ειδικές.</div>`; return; }
  const cur = currentStage();
  const sel = store.get("tcStage_" + num, "auto");
  const chip = (val, label, has) => `<button type="button" class="chip ${sel === val ? "on" : ""} ${has ? "has" : ""}" data-stage="${esc(val)}">${label}</button>`;
  let h = `<div class="chips">${chip("auto", "Τρέχουσα")}${sections.map(s => chip(String(s.section), esc(s.name), !!ev[s.section])).join("")}</div>`;
  const r = compute(cur.section);
  const me = meDorsal(), en = enabled();
  h += `<div id="live">${liveHtml()}</div>`;
  h += `<h2>${esc(stageLabel(cur))} <small>${r.nCrews} πληρώματα ξεκίνησαν</small></h2>`;
  h += `<div class="me">${me ? `Εσύ: <span class="no me">${esc(me)}</span>` : `Δεν έχεις διαλέξει ποιο πλήρωμα είσαι (καρτέλα Πληρώματα).`} · χρόνος από ${en.size ? "<b>" + [...en].filter(d => d !== me).length + "</b> επιλεγμένα" : "<b>όλα</b> τα"} πληρώματα · όριο ±${fmtS(tol())}″</div>`;
  if (!r.segs) h += `<div class="empty" style="margin-bottom:10px">Δεν υπάρχουν ΜΩΤ για την ${esc(cur.name)}. Δείχνω χρόνο από την εκκίνηση αντί για μέτρα. Πρόσθεσέ τες στις Ρυθμίσεις.</div>`;
  r.tcs.forEach(t => {
    const key = cur.section + "/" + t.k;
    const isFresh = fresh.has(key); fresh.delete(key);
    const last = t.k === r.tcs.length;
    const info = `${t.kept.length} πληρ.${t.out.length ? " · " + t.out.length + " εκτός" : ""}${t.spread != null ? " · θέση ±" + Math.round(t.spread) + " m" + (t.spread > 80 ? " ⚠︎ αβέβαιο" : "") : ""}`;
    let main;
    if (!t.n) main = `<span class="m">—<small>κανένα πέρασμα ακόμα</small></span>`;
    else if (t.mean == null) main = `<span class="m">…<small>${t.n} πέρασμα(τα) · περιμένω GPS</small></span>`;
    else if (t.dist != null) main = `<span class="m">${fmtM(t.dist)}<small>${info} · ${fmtEl(t.mean)}</small></span>`;
    else main = `<span class="m">${fmtEl(t.mean)}<small>${info}</small></span>`;
    let dev;
    if (t.dev == null) dev = `<span class="d none"></span>`;
    else {
      const a = Math.abs(t.dev), cls = a < 0.3 ? "ok" : t.dev > 0 ? "late" : "early";
      dev = `<span class="d ${cls}">${t.dev > 0 ? "+" : t.dev < 0 ? "−" : ""}${fmtS(a)}″<small>${a < 0.3 ? "στον χρόνο" : t.dev > 0 ? "αργά" : "νωρίς"}</small></span>`;
    }
    const rowsD = [...t.all].sort((a, b) => a.e - b.e).map(x => `<tr class="${t.kept.includes(x) ? "" : "out"}"><td><span class="no">${esc(x.d)}</span></td><td>${fmtEl(x.e)}</td><td>${t.mean != null ? (x.e - t.mean >= 0 ? "+" : "−") + fmtS(Math.abs(x.e - t.mean)) + "″" : ""}</td></tr>`).join("")
      + (t.mine ? `<tr class="mine"><td><span class="no me">${esc(t.mine.d)}</span></td><td>${fmtEl(t.mine.e)}</td><td>${t.dev != null ? (t.dev >= 0 ? "+" : "−") + fmtS(Math.abs(t.dev)) + "″" : ""}</td></tr>` : "");
    const map = t.loc ? `<p><a href="https://maps.google.com/?q=${t.loc[0].toFixed(6)},${t.loc[1].toFixed(6)}" target="_blank" rel="noopener">Θέση στον χάρτη</a></p>` : "";
    h += `<details class="tc ${!t.n ? "wait" : ""} ${isFresh ? "fresh" : ""}"><summary><span class="k">${last ? "ΤΕΛΟΣ" : "TC" + t.k}</span>${main}${dev}</summary>`
      + `<div class="det">${rowsD ? `<table>${rowsD}</table>` : "Κανένα πέρασμα ακόμα."}${map}</div></details>`;
  });
  if (!INJECTED && !wsOk && wsFails >= 2) h = `<div class="empty" style="margin-bottom:12px;text-align:left">Το Anube δέχεται live σύνδεση μόνο από τη δική του σελίδα. Άνοιξε τη σελίδα παρακολούθησης του Anube και πάτα τον σελιδοδείκτη <b>TC</b>. Οδηγίες: <a href="install.html" style="color:inherit">εγκατάσταση σελιδοδείκτη</a>.</div>` + h;
  h += `<p class="note">Πώς: το κοκκίνισμα του Anube έρχεται ~12″ μετά το πέρασμα. Η θέση κάθε TC βγαίνει από το GPS των αυτοκινήτων λίγο πριν το κοκκίνισμα, και ο χρόνος περάσματος από το πότε το GPS του καθενός πέρασε από εκεί. Στη T11 έπεσε ~20 m και ~0,5″ μέσα. Καταγράφει μόνο όσο η σελίδα είναι ανοιχτή.</p>`;
  out.innerHTML = h;
}

function renderCrews(){
  const q = (root.getElementById("pq") || {}).value || "";
  const en = enabled(), me = meDorsal();
  const all = Object.values(byDorsal).sort((a, b) => (parseInt(a.dorsal, 10) || 0) - (parseInt(b.dorsal, 10) || 0));
  const ql = q.trim().toLowerCase();
  const rows = all.filter(p => !ql || String(p.dorsal) === ql || [p.dorsal, p.piloto, p.copiloto, p.vehiculo_modelo].join(" ").toLowerCase().includes(ql));
  out.innerHTML = `<div class="tools"><input id="pq" type="search" placeholder="Αναζήτηση αριθμού ή ονόματος" value="${esc(q)}"><button type="button" id="pnone">Καμία</button></div>
    <div class="cnt">${[...en].length} επιλεγμένα · ${all.length} συνολικά · «Εγώ» = το δικό σου πλήρωμα</div>
    ${rows.map(p => { const d = String(p.dorsal); return `<div class="prow">
      <span class="no ${d === me ? "me" : ""}">${esc(d)}</span>
      <span class="who">${esc(surname(p.piloto))}${p.copiloto ? " / " + esc(surname(p.copiloto)) : ""}<small>${esc(p.vehiculo_modelo || "")}${p.vehiculo_anho ? " · " + esc(p.vehiculo_anho) : ""}</small></span>
      <button type="button" class="mebtn ${d === me ? "on" : ""}" data-me="${esc(d)}">Εγώ</button>
      <input class="sw" type="checkbox" data-d="${esc(d)}" ${en.has(d) ? "checked" : ""} aria-label="Μετράει το ${esc(d)}">
    </div>`; }).join("") || '<div class="empty">Δεν βρέθηκε πλήρωμα.</div>'}`;
  const pq = root.getElementById("pq");
  pq.oninput = () => { const pos = pq.selectionStart; renderCrews(); const n = root.getElementById("pq"); n.focus(); try { n.setSelectionRange(pos, pos); } catch(e){} };
  root.getElementById("pnone").onclick = () => { store.set(crewsKey(), "[]"); renderCrews(); };
}

function renderSet(){
  const mot = motTable();
  out.innerHTML = `<div class="set">
    <label for="tol">Όριο απόκλισης (δευτ.)</label>
    <input id="tol" type="text" inputmode="decimal" value="${esc(fmtS(tol()))}">
    <p>Όποιο πλήρωμα απέχει περισσότερο από αυτό από τα υπόλοιπα σε ένα σημείο βγαίνει εκτός μέτρησης για εκείνο το σημείο.</p>
    <label for="mot">ΜΩΤ ανά ειδική (όνομα στο Anube → [μέτρα τέλους τμήματος, ΜΩΤ])</label>
    <textarea id="mot" spellcheck="false">${esc(JSON.stringify(mot, null, 0).replace(/\],"/g, '],\n"').replace(/^\{/, "{\n").replace(/\}$/, "\n}"))}</textarea>
    <p id="motMsg">${DEFAULTS[num] ? "Προεπιλογή: 20ο Ράλλυ Δαναών 2026 (T01–T18 = RT1–RT18)." : "Π.χ. {\"T01\":[[1500,43],[3780,50]]} = 0–1.500 m στα 43, 1.500–3.780 m στα 50."}</p>
    <div class="row"><button type="button" id="motSave">Αποθήκευση ΜΩΤ</button>${DEFAULTS[num] ? `<button type="button" id="motReset">Επαναφορά προεπιλογής</button>` : ""}</div>
    <label>Καταγεγραμμένα περάσματα</label>
    <p>${Object.keys(ev).map(s => secById[s] ? esc(secById[s].name) + ": " + Object.keys(ev[s]).length + " πληρ." : "").filter(Boolean).join(" · ") || "Κανένα ακόμα."}</p>
    <div class="row"><button type="button" id="exp">Εξαγωγή CSV</button><button type="button" id="clr">Διαγραφή περασμάτων</button></div>
  </div>`;
  $("#tol").onchange = (e) => { store.set("tcTol", String(e.target.value).replace(",", ".")); };
  $("#motSave").onclick = () => {
    try { const v = JSON.parse($("#mot").value); store.set(motKey(), JSON.stringify(v)); $("#motMsg").textContent = "Αποθηκεύτηκε."; }
    catch(e){ $("#motMsg").textContent = "Λάθος μορφή: " + e.message; }
  };
  if ($("#motReset")) $("#motReset").onclick = () => { try { localStorage.removeItem(motKey()); } catch(e){} renderSet(); };
  $("#clr").onclick = () => { if (confirm("Να σβηστούν όλα τα καταγεγραμμένα περάσματα αυτού του αγώνα;")){ ev = {}; store.set(evKey(), "{}"); renderSet(); } };
  $("#exp").onclick = exportCsv;
}

function exportCsv(){
  const lines = ["ειδική;σημείο;αριθμός;πλήρωμα;ώρα_περάσματος;χρόνος_από_εκκίνηση"];
  Object.keys(ev).forEach(s => {
    const sec = secById[s]; if (!sec) return;
    Object.keys(ev[s]).forEach(pid => {
      const r = ev[s][pid], p = parts[pid]; if (!p) return;
      const start = r[0] != null ? Math.floor((r[0] + 20) / 60) * 60 : null;
      Object.keys(r).sort((a, b) => a - b).forEach(k => lines.push([sec.name, k == 0 ? "start" : k, p.dorsal, surname(p.piloto), fmtClock(r[k]) + "," + String(r[k].toFixed(1)).split(".")[1], start != null && k > 0 ? (r[k] - start).toFixed(1).replace(".", ",") : ""].join(";")));
    });
  });
  const blob = new Blob(["﻿" + lines.join("\n")], {type:"text/csv"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "tc-" + num + ".csv"; a.click();
}

// ---------- Συμβάντα ----------
root.querySelector(".tabs").addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (!b) return; tab = b.dataset.tab; render(); app.scrollTop = 0; });
out.addEventListener("click", (e) => {
  const st = e.target.closest("[data-stage]");
  if (st){ store.set("tcStage_" + num, st.dataset.stage); if (st.dataset.stage === "auto") autoStage = null; render(); return; }
  const g = e.target.closest("[data-gps]");
  if (g){ e.preventDefault(); setGps(g.dataset.gps === "1"); updateLive(); return; }
  const m = e.target.closest("[data-me]");
  if (m){ const d = m.dataset.me; store.set(meKey(), meDorsal() === d ? "" : d); renderCrews(); }
});
out.addEventListener("change", (e) => {
  const cb = e.target.closest("input.sw[data-d]"); if (!cb) return;
  const s = enabled(); if (cb.checked) s.add(cb.dataset.d); else s.delete(cb.dataset.d);
  store.set(crewsKey(), JSON.stringify([...s]));
  const c = root.querySelector(".cnt"); if (c) c.textContent = s.size + " επιλεγμένα · " + Object.keys(byDorsal).length + " συνολικά · «Εγώ» = το δικό σου πλήρωμα";
});
$("#f").addEventListener("submit", (e) => {
  e.preventDefault();
  const n = rallyEl.value.replace(/\D/g, ""); rallyEl.value = n;
  if (root.activeElement) root.activeElement.blur();
  if (n) connect(n);
});

// Η οθόνη μένει αναμμένη όσο είμαστε συνδεδεμένοι
let wake = null;
async function keepAwake(on){
  try {
    if (on && !wake && navigator.wakeLock && !document.hidden){ wake = await navigator.wakeLock.request("screen"); wake.addEventListener("release", () => { wake = null; }); }
    if (!on && wake){ await wake.release(); wake = null; }
  } catch(e){ wake = null; }
}
document.addEventListener("visibilitychange", () => { if (!document.hidden && num){ keepAwake(true); if (!ws || ws.readyState > 1) openWs(); } });
if (!INJECTED && "serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});

const qs = new URLSearchParams(location.search);
const pageRally = INJECTED ? ((location.href.match(/rally=?rally(\d+)/) || location.href.match(/rally(\d+)/) || [])[1] || "") : "";
const startNum = (pageRally || qs.get("rally") || store.get("tcRally", "")).replace(/\D/g, "");
if (INJECTED){
  $("#hide").hidden = false;
  if (startNum) $("#f").hidden = true;   // ο αγώνας βγαίνει από τη σελίδα του Anube
  $("#hide").onclick = () => { app.hidden = true; $("#fab").hidden = false; };
  $("#fab").onclick = () => { app.hidden = false; $("#fab").hidden = true; render(); };
}
rallyEl.value = startNum;
if (gpsOn) setGps(true);
setInterval(() => { if (tab === "tc" && gpsOn) updateLive(); }, 3000);
if (startNum) connect(startNum); else render();

// Για δοκιμές: tcReplay([{a, section, participant, control_point}, ...]) ξαναπαίζει καταγραφή
// Για δοκιμές: tcFeed(type, data, arrival) ταΐζει μηνύματα σαν να ήρθαν από το Anube
window.tcFeed = (type, d, a) => onEvent(type, d, a);
window.tcCompute = (sec) => compute(sec);
window.tcFix = (lat, lon) => { gpsOn = true; myFix = { lat, lon, acc: 5 }; tab = "tc"; render(); return root.getElementById("live").innerText; };
window.tcOpen = (id) => { if (secById[id]) secById[id].closed = false; };

})();
