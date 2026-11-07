// Καταγραφέας TC στο cloud: ανοίγει την κανονική σελίδα παρακολούθησης του Anube σε headless Chrome,
// φορτώνει το rally-tc/tc.js σε λειτουργία καταγραφέα (ανεβάζει στο Firebase) και μένει ανοιχτό.
const puppeteer = require("puppeteer");
const fs = require("fs");
// όλη η ροή του Anube καταγράφεται σε data/raw.jsonl ([ώρα άφιξης, μήνυμα]) για ανάλυση μετά τον αγώνα
fs.mkdirSync("data", { recursive: true });
const RAW = fs.createWriteStream("data/raw.jsonl", { flags: "a" });
const RALLY = process.env.RALLY || "9274";
const MINUTES = +(process.env.MINUTES || 5);
const FB = "https://rally-tc-default-rtdb.europe-west1.firebasedatabase.app";
const RUN = process.env.GITHUB_RUN_ID || "local";
const URL = `https://anubesport.com/tracking/?rally=rally${RALLY}&port=auto`;
const TC = "https://manolisdim.github.io/regularityTimer-/rally-tc/tc.js";

async function beat(o){
  try { await fetch(`${FB}/tc/_rec/${RALLY}.json`, { method: "PUT", body: JSON.stringify({ run: RUN, t: Math.round(Date.now() / 1000), ...o }) }); } catch(e){ console.log("heartbeat failed", e.message); }
}
async function open(browser){
  const page = await browser.newPage();
  page.on("console", m => { const t = m.text(); if (/error|fail/i.test(t)) console.log("page:", t.slice(0, 200)); });
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => { localStorage.setItem("tcRecorder", "1"); });
  await page.evaluate((src) => { const s = document.createElement("script"); s.src = src + "?" + Date.now(); document.body.appendChild(s); }, TC);
  // μετράμε τα μηνύματα του Anube για τον έλεγχο
  await page.evaluate((r) => {
    window.__msgs = 0; window.__setsc = 0;
    const ws = new WebSocket(`wss://ws.anube.es:45${r.slice(-1)}/realtime/rally${r}?rally=rally${r}&port=auto`);
    window.__buf = [];
    ws.onmessage = (e) => { window.__msgs++; if (e.data.includes('"setscoring"')) window.__setsc++; window.__buf.push([Date.now() / 1000, e.data]); };
    ws.onclose = () => { window.__wsClosed = (window.__wsClosed || 0) + 1; };
  }, RALLY);
  return page;
}
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  let page = await open(browser);
  const end = Date.now() + MINUTES * 60000;
  while (Date.now() < end){
    await new Promise(r => setTimeout(r, 60000));
    let st = {};
    try {
      st = await page.evaluate(() => {
        const h = document.getElementById("tc-host"), r = h && h.shadowRoot;
        return { status: r ? r.getElementById("status").textContent : "no-tc", msgs: window.__msgs, setscoring: window.__setsc };
      });
    } catch(e){ st = { error: e.message }; }
    try {
      const buf = await page.evaluate(() => { const b = window.__buf || []; window.__buf = []; return b; });
      for (const x of buf) RAW.write(JSON.stringify(x) + "\n");
      st.saved = (st.saved || 0) + buf.length;
    } catch(e){}
    console.log(new Date().toISOString(), JSON.stringify(st));
    await beat(st);
    // αν χάλασε η σελίδα, την ξανανοίγουμε
    if (st.error || st.status === "no-tc"){ try { await page.close(); } catch(e){} page = await open(browser); }
  }
  // στο τέλος: στιγμιότυπα από το REST (αποτελέσματα, θέσεις TC, κατάταξη, ειδικές, πληρώματα)
  for (const ep of ["total_scoring", "closed_controls", "classification", "sections", "participants"]){
    try { const r = await fetch(`https://rest.anube.es/rallyrest/default/api/${ep}/${RALLY}.json?rally=rally${RALLY}&port=auto`); fs.writeFileSync(`data/${ep}.json`, await r.text()); } catch(e){ console.log("REST", ep, e.message); }
  }
  RAW.end();
  await browser.close();
})();
