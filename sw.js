/* RHS service worker — makes the site installable and gives a graceful offline fallback.
   Strategy: network-first for pages/scripts/styles (so admin edits & updates always show),
   cache fallback when offline. Firebase / Cloudinary / API calls are never touched. */
const CACHE = "rhs-pwa-v1";
const PRECACHE = ["./index.html", "./style.css", "./images/logo.png", "./images/icons/icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // leave Firebase, Cloudinary, fonts etc. alone
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() =>
      caches.match(req).then(hit => hit || (req.mode === "navigate" ? caches.match("./index.html") : Response.error()))
    )
  );
});
