const CACHE='dmd-v5';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
// Network first: always get the newest files. The cache is only used when offline.
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  const key=new URL(req.url);key.search='';
  e.respondWith(
    fetch(req.url,{cache:'no-store',credentials:'same-origin'})
      .then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(key.href,copy))}return res})
      .catch(()=>caches.match(key.href).then(r=>r||caches.match('./index.html')))
  );
});
