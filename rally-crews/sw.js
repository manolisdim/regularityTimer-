// Regularity Crews — κρατάει την εφαρμογή διαθέσιμη χωρίς internet.
// Τα δεδομένα του αγώνα τα αποθηκεύει η ίδια η σελίδα. Εδώ κρατάμε μόνο τα αρχεία της εφαρμογής.
const VERSION = "rc-v8";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("rc-") && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Τα αποτελέσματα του Anube πάνε πάντα στο δίκτυο
  if (url.hostname.endsWith("anube.es")) return;

  // Σελίδα: πρώτα δίκτυο (για ενημερώσεις), αλλιώς η αποθηκευμένη
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put("./index.html", copy)); return res; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Αρχεία εφαρμογής και γραμματοσειρές: από την αποθήκη, ανανέωση στο παρασκήνιο
  if (url.origin === location.origin || url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("gstatic.com")) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req)
          .then((res) => { if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; })
          .catch(() => hit);
        return hit || net;
      })
    );
  }
});
