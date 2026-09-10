// Service worker: caches the whole app (page, fonts, map data, routes) so it works with no connection.
// The build script rewrites VERSION; a new version replaces the old cache on next load.
const VERSION = "20260909T063442";
const CACHE = "trip-" + VERSION;
const LIST = "./data/precache.json";

async function broadcast(msg) {
  const cs = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  cs.forEach(c => c.postMessage(msg));
}

async function readList() {
  try {
    const res = await fetch(LIST + "?v=" + VERSION, { cache: "no-cache" });
    if (res.ok) { const j = await res.json(); const c = await caches.open(CACHE); await c.put(LIST, new Response(JSON.stringify(j), { headers: { "Content-Type": "application/json" } })); return j; }
  } catch (err) {}
  const c = await caches.open(CACHE);
  const hit = await c.match(LIST);
  return hit ? hit.json() : { files: ["./index.html"] };
}

async function cacheAll() {
  const cache = await caches.open(CACHE);
  const list = await readList();
  const files = list.files.filter(f => f !== LIST);
  const total = files.length;
  let done = 0, failed = 0;
  const CHUNK = 8;
  for (let i = 0; i < files.length; i += CHUNK) {
    await Promise.all(files.slice(i, i + CHUNK).map(async (f) => {
      try {
        const existing = await cache.match(f);
        if (!existing) {
          const r = await fetch(f, { cache: "no-cache" });
          if (r.ok) await cache.put(f, r); else failed++;
        }
      } catch (err) { failed++; }
      done++;
    }));
    broadcast({ type: "progress", done, total, failed });
  }
  broadcast({ type: "ready", version: VERSION, total, failed });
  return { total, failed };
}

async function status() {
  const cache = await caches.open(CACHE);
  const keys = await cache.keys();
  const hit = await cache.match(LIST);
  const list = hit ? await hit.json() : null;
  const total = list ? list.files.filter(f => f !== LIST).length : null;
  return { type: "status", cached: keys.filter(r => !r.url.endsWith("precache.json")).length, total, version: VERSION };
}

self.addEventListener("install", (e) => {
  e.waitUntil((async () => { await cacheAll(); await self.skipWaiting(); })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("trip-") && k !== CACHE).map(k => caches.delete(k)));
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
      if (res.ok && !url.pathname.endsWith("precache.json")) cache.put(e.request, res.clone());
      return res;
    } catch (err) {
      if (e.request.mode === "navigate") return (await cache.match("./index.html")) || Response.error();
      return Response.error();
    }
  })());
});

self.addEventListener("message", (e) => {
  if (e.data === "status") status().then(s => e.source.postMessage(s));
  if (e.data === "recache") cacheAll().then(() => status()).then(s => e.source.postMessage(s));
});
