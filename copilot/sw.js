const C='codriver-v19';
// fresh copies on install (skip the browser's HTTP cache)
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-180.png'].map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('codriver-')&&x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
// network first, always asking the server (GitHub Pages lets browsers keep pages 10 min otherwise); cache only when offline
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const same=new URL(e.request.url).origin===location.origin;
  e.respondWith(fetch(same?new Request(e.request,{cache:'no-cache'}):e.request).then(r=>{if(r.ok&&same){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));}return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true})));});
