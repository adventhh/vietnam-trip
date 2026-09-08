// Service worker: caches the whole app (page, fonts, map tiles, routes) so it works with no connection.
// The build script rewrites VERSION; a new version replaces the old cache on next load.
const VERSION = "20260908T145931";
const CACHE = "vn-trip-" + VERSION;

async function broadcast(msg) {
  const cs = await self.clients.matchAll({ includeUncontrolled: true });
  cs.forEach(c => c.postMessage(msg));
}

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    let files = ["./index.html"];
    try {
      const res = await fetch("./data/precache.json?v=" + VERSION, { cache: "no-cache" });
      files = (await res.json()).files;
    } catch (err) {}
    const total = files.length;
    let done = 0;
    const CHUNK = 24;
    for (let i = 0; i < files.length; i += CHUNK) {
      await Promise.all(files.slice(i, i + CHUNK).map(async (f) => {
        try {
          const r = await fetch(f, { cache: "no-cache" });
          if (r.ok) await cache.put(f, r);
        } catch (err) {}
        done++;
      }));
      broadcast({ type: "progress", done, total });
    }
    broadcast({ type: "ready", version: VERSION, total });
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("vn-trip-") && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin || e.request.method !== "GET") return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(e.request);
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    } catch (err) {
      if (e.request.mode === "navigate") return (await cache.match("./index.html")) || Response.error();
      return Response.error();
    }
  })());
});

self.addEventListener("message", (e) => {
  if (e.data === "status") {
    caches.open(CACHE).then(c => c.keys()).then(keys => e.source.postMessage({ type: "status", cached: keys.length, version: VERSION }));
  }
});
