// Build script: fetches fonts, walking/driving routes and vector map data, then writes the cache list the service worker uses.
// Run from the repo root:  node tools/build.mjs        (add --refresh-maps to refetch map data that already exists)
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const PLAN = require(path.join(ROOT, "data", "plan.js"));
const args = new Set(process.argv.slice(2));
const UA = "trip-itinerary-app/1.0 (personal offline trip app; small one-off downloads)";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const t0 = Date.now();

/* ---------------- fonts ---------------- */
async function buildFonts() {
  const cssPath = path.join(ROOT, "assets", "fonts", "fonts.css");
  if (!fs.existsSync(cssPath)) { console.log("fonts: assets/fonts/fonts.css missing, skipping"); return; }
  const css = fs.readFileSync(cssPath, "utf8");
  const F = PLAN.META.fonts || {};
  const KEEP = new Set(F.families || ["Bricolage Grotesque", "Be Vietnam Pro", "IBM Plex Mono"]);
  const SUBSETS = new Set(F.subsets || ["latin", "latin-ext", "vietnamese"]);
  const blocks = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)];
  let out = "", n = 0, bytes = 0;
  for (const [, subset, body] of blocks) {
    const fam = /font-family:\s*'([^']+)'/.exec(body)?.[1];
    if (!KEEP.has(fam) || !SUBSETS.has(subset)) continue;
    const weight = /font-weight:\s*([\d ]+)/.exec(body)?.[1].trim().replace(/\s+/g, "-") || "400";
    const style = /font-style:\s*(\w+)/.exec(body)?.[1] || "normal";
    const url = /url\(([^)]+)\)/.exec(body)?.[1];
    const file = `${fam.toLowerCase().replace(/\s+/g, "-")}-${weight}-${style}-${subset}.woff2`;
    const dest = path.join(ROOT, "assets", "fonts", file);
    if (!fs.existsSync(dest)) {
      const r = await fetch(url);
      if (!r.ok) { console.log("font download failed", url); continue; }
      fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
    }
    bytes += fs.statSync(dest).size; n++;
    out += `/* ${subset} */\n@font-face {${body.replace(/src:[^;]+;/, `src: url(./${file}) format('woff2');`)}}\n`;
  }
  fs.writeFileSync(path.join(ROOT, "assets", "fonts", "fonts.local.css"), out);
  console.log(`fonts: ${n} faces, ${(bytes / 1024).toFixed(0)} KB`);
  if (n === 0) console.log("fonts: WARNING no faces kept. META.fonts.families must match the families in assets/fonts/fonts.css exactly, and the css must be fetched with a browser user agent (new_trip.py does this).");
}

/* ---------------- routes (Valhalla on the OSM demo server) ---------------- */
function decode6(str) {
  let i = 0, lat = 0, lng = 0; const out = [];
  while (i < str.length) {
    let b, shift = 0, res = 0;
    do { b = str.charCodeAt(i++) - 63; res |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (res & 1) ? ~(res >> 1) : (res >> 1); shift = 0; res = 0;
    do { b = str.charCodeAt(i++) - 63; res |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (res & 1) ? ~(res >> 1) : (res >> 1);
    out.push([+(lat / 1e6).toFixed(5), +(lng / 1e6).toFixed(5)]);
  }
  return out;
}
async function buildRoutes() {
  const file = path.join(ROOT, "data", "routes.json");
  const routes = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  const reqs = PLAN.routeRequests();
  let fetched = 0, failed = 0;
  for (const r of reqs) {
    if (routes[r.key]) continue;
    const q = { locations: [{ lat: r.from.lat, lon: r.from.lng }, { lat: r.to.lat, lon: r.to.lng }], costing: r.costing, units: "kilometers" };
    try {
      const res = await fetch("https://valhalla1.openstreetmap.de/route?json=" + encodeURIComponent(JSON.stringify(q)), { headers: { "User-Agent": UA } });
      const j = await res.json();
      if (!j.trip) throw new Error(j.error || "no trip");
      const coords = j.trip.legs.flatMap(l => decode6(l.shape));
      routes[r.key] = { km: +j.trip.summary.length.toFixed(2), min: Math.round(j.trip.summary.time / 60), costing: r.costing, coords };
      fetched++;
    } catch (e) { failed++; console.log("route failed", r.key, e.message); }
    await sleep(400);
  }
  fs.writeFileSync(file, JSON.stringify(routes));
  console.log(`routes: ${reqs.length} needed, ${fetched} fetched now, ${failed} failed, ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}

/* ---------------- vector map data (OpenStreetMap via the Overpass API) ----------------
   One query per area; the page draws streets, water and parks itself, so there are no tile servers involved. */
const ROAD_CLASS = {
  motorway: "a", motorway_link: "a", trunk: "a", trunk_link: "a",
  primary: "b", primary_link: "b", secondary: "b", secondary_link: "b",
  tertiary: "c", tertiary_link: "c", residential: "c", unclassified: "c", living_street: "c",
  service: "d", track: "d",
  pedestrian: "p", footway: "p", path: "p", steps: "p", cycleway: "p",
};
const rnd = (v) => +v.toFixed(5);
function overpassQuery(a) {
  const [s, w, n, e] = a.bbox, bb = `${s},${w},${n},${e}`;
  if (a.detail === "corridor") {
    return `[out:json][timeout:180];(
      way["highway"~"^(motorway|trunk)$"](${bb});
      relation["natural"="water"]["water"="river"](${bb}); way["waterway"="river"](${bb});
      node["place"~"^(city|town)$"](${bb});
    );out geom;`;
  }
  if (a.detail === "wide") {
    return `[out:json][timeout:180];(
      way["highway"~"^(motorway|motorway_link|trunk|trunk_link|primary)$"](${bb});
      way["natural"="water"]["water"!~"^(pond|reservoir|basin)$"](${bb}); relation["natural"="water"]["water"="river"](${bb});
      way["waterway"~"^(river)$"](${bb});
      way["railway"="rail"](${bb});
      way["aeroway"~"^(runway|taxiway|apron|terminal)$"](${bb}); node["place"~"^(city|town|suburb)$"](${bb});
    );out geom;`;
  }
  return `[out:json][timeout:180];(
    way["highway"]["highway"!~"^(proposed|construction|abandoned|raceway|bus_guideway|corridor)$"](${bb});
    way["natural"="water"](${bb}); relation["natural"="water"](${bb}); way["water"](${bb});
    way["waterway"~"^(river|canal)$"](${bb});
    way["leisure"~"^(park|garden)$"](${bb}); way["landuse"~"^(grass|forest|cemetery|recreation_ground)$"](${bb});
    way["railway"="rail"](${bb});
    node["place"~"^(city|town|suburb|quarter|neighbourhood)$"](${bb});
  );out geom;`;
}
function simplifyOverpass(json, area) {
  const out = { area: area.id, bbox: area.bbox, roads: [], water: [], green: [], rail: [], aero: [], places: [] };
  const geom = (el) => (el.geometry || []).map(p => [rnd(p.lat), rnd(p.lon)]);
  for (const el of json.elements || []) {
    const t = el.tags || {};
    if (el.type === "node") { if (t.place && t.name) out.places.push({ n: t.name, k: t.place, p: [rnd(el.lat), rnd(el.lon)] }); continue; }
    if (el.type === "relation") {
      if (t.natural === "water" || t.water) for (const m of el.members || []) if (m.role === "outer" && m.geometry) out.water.push(m.geometry.map(p => [rnd(p.lat), rnd(p.lon)]));
      continue;
    }
    const g = geom(el); if (g.length < 2) continue;
    const extent = (pts) => { let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity; for (const [y, x] of pts) { a = Math.min(a, y); b = Math.max(b, y); c = Math.min(c, x); d = Math.max(d, x); } return Math.max(b - a, d - c); };
    if (t.highway) { const c = ROAD_CLASS[t.highway] || "d"; out.roads.push({ n: t.name || "", c, g, o: t.oneway === "yes" ? 1 : 0 }); }
    else if (t.natural === "water" || t.water) { if (area.detail === "full" || extent(g) > (area.detail === "corridor" ? 0.01 : 0.004)) out.water.push(g); }
    else if (t.waterway) out.rail.push({ k: "river", g });
    else if (t.leisure || t.landuse) out.green.push(g);
    else if (t.railway) out.rail.push({ k: "rail", g });
    else if (t.aeroway) out.aero.push({ k: t.aeroway, g });
  }
  return out;
}
async function buildVector() {
  fs.mkdirSync(path.join(ROOT, "data"), { recursive: true });
  for (const a of PLAN.AREAS) {
    const file = path.join(ROOT, "data", `map-${a.id}.json`);
    if (fs.existsSync(file) && !args.has("--refresh-maps")) { console.log(`map ${a.id}: kept (${(fs.statSync(file).size / 1024).toFixed(0)} KB); --refresh-maps to refetch`); continue; }
    let json = null;
    for (const server of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://overpass-api.de/api/interpreter"]) {
      try {
        const res = await fetch(server, { method: "POST", headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(overpassQuery(a)) });
        if (!res.ok) { console.log(`map ${a.id}: ${server} returned ${res.status}, retrying`); await sleep(5000); continue; }
        json = await res.json(); break;
      } catch (e) { console.log(`map ${a.id}: ${server} failed (${e.message}), retrying`); await sleep(5000); }
    }
    if (!json) { console.log(`map ${a.id}: giving up`); continue; }
    const slim = simplifyOverpass(json, a);
    fs.writeFileSync(file, JSON.stringify(slim));
    console.log(`map ${a.id}: ${slim.roads.length} roads, ${slim.water.length} water, ${slim.green.length} green, ${slim.places.length} place names, ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
    await sleep(2000);
  }
}

/* ---------------- photos (Wikimedia Commons, free licences; your own files img/<KEY>-u*.jpg come first) ---------------- */
const IMG_DIR = path.join(ROOT, "img");
const BAD_TITLE = /map|logo|flag|diagram|icon|screenshot|banner|coat of arms|seal|emblem|plan\b|chart|poster/i;
const stripHtml = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
async function commonsSearch(q) {
  const u = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" + encodeURIComponent(q + " filetype:bitmap") +
    "&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=640&format=json";
  let r = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    r = await fetch(u, { headers: { "User-Agent": UA } });
    if (r.ok) break;
    const wait = r.status === 429 ? 15000 * (attempt + 1) : 4000;
    console.log(`  commons ${r.status} for "${q}", waiting ${wait / 1000}s`);
    await sleep(wait);
  }
  if (!r || !r.ok) return [];
  const j = await r.json();
  return Object.values((j.query || {}).pages || {})
    .map(p => ({ title: p.title, info: (p.imageinfo || [])[0] }))
    .filter(x => x.info && /image\/(jpeg|png)/.test(x.info.mime) && x.info.width >= 500 && x.info.height >= 300 && !BAD_TITLE.test(x.title))
    .filter(x => x.info.width / x.info.height < 2.6 && x.info.height / x.info.width < 1.6);
}
async function buildImages() {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const creditsPath = path.join(ROOT, "data", "credits.json");
  const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, "utf8")) : {};
  const images = {};
  const MAX = 3, PER_QUERY = 2;
  let fetched = 0, kept = 0;
  const seenFiles = new Set();
  for (const [key, queries] of Object.entries(PLAN.PICS)) {
    const own = fs.readdirSync(IMG_DIR).filter(f => new RegExp(`^${key}-u\\d+\\.(jpe?g|png|webp)$`, "i").test(f)).sort();
    const auto = fs.readdirSync(IMG_DIR).filter(f => new RegExp(`^${key}-c\\d+\\.(jpe?g|png)$`, "i").test(f)).sort();
    const list = own.map(f => ({ src: "img/" + f, own: true }));
    if (auto.length && !args.has("--refresh-images")) {
      auto.forEach(f => list.push({ src: "img/" + f, credit: credits["img/" + f] || null }));
    } else if (queries && queries.length) {
      let n = 0;
      for (const q of queries) {
        if (n >= MAX) break;
        let results = [];
        try { results = await commonsSearch(q); } catch (e) { console.log("image search failed", key, q, e.message); }
        let took = 0;
        for (const x of results) {
          if (n >= MAX || took >= PER_QUERY) break;
          if (seenFiles.has(x.title)) continue;
          try {
            const r = await fetch(x.info.thumburl, { headers: { "User-Agent": UA } });
            if (!r.ok) continue;
            const ext = /png/.test(x.info.mime) ? "png" : "jpg";
            const file = `${key}-c${n + 1}.${ext}`;
            fs.writeFileSync(path.join(IMG_DIR, file), Buffer.from(await r.arrayBuffer()));
            const m = x.info.extmetadata || {};
            credits["img/" + file] = { file: x.title, artist: stripHtml(m.Artist && m.Artist.value), license: stripHtml(m.LicenseShortName && m.LicenseShortName.value), url: x.info.descriptionurl };
            list.push({ src: "img/" + file, credit: credits["img/" + file] });
            seenFiles.add(x.title); n++; took++; fetched++;
          } catch (e) {}
          await sleep(400);
        }
        await sleep(700);
      }
    }
    if (list.length) { images[key] = list; kept += list.length; }
  }
  // re-encode to phone-sized JPEGs (max 560 px wide, quality 68) so the offline bundle stays small
  const shrink = spawnSync("python", [path.join(ROOT, "tools", "shrink_images.py")], { encoding: "utf8" });
  if (shrink.stdout) process.stdout.write(shrink.stdout);
  if (shrink.status !== 0) console.log("shrink_images.py failed:", shrink.stderr);
  // png files may have become jpg
  for (const k of Object.keys(images)) images[k] = images[k].map(im => {
    const jpg = im.src.replace(/\.png$/i, ".jpg");
    if (jpg !== im.src && fs.existsSync(path.join(ROOT, jpg))) { if (credits[im.src]) { credits[jpg] = credits[im.src]; delete credits[im.src]; } return { ...im, src: jpg }; }
    return im;
  });
  fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 1));
  fs.writeFileSync(path.join(ROOT, "data", "images.json"), JSON.stringify(images));
  const bytes = fs.readdirSync(IMG_DIR).reduce((a, f) => a + fs.statSync(path.join(IMG_DIR, f)).size, 0);
  console.log(`images: ${kept} in use across ${Object.keys(images).length} places, ${fetched} downloaded now, ${(bytes / 1048576).toFixed(1)} MB in img/`);
}

/* ---------------- slim the big-area files: drop points that don't change the line (Douglas–Peucker) ---------------- */
function rdp(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let maxD = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const [y, x] = pts[i], dx = b[1] - a[1], dy = b[0] - a[0];
    const d = dx === 0 && dy === 0 ? Math.hypot(x - a[1], y - a[0]) : Math.abs(dy * x - dx * y + b[1] * a[0] - b[0] * a[1]) / Math.hypot(dx, dy);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [a, b];
  return rdp(pts.slice(0, idx + 1), tol).slice(0, -1).concat(rdp(pts.slice(idx), tol));
}
function slimMaps() {
  for (const a of PLAN.AREAS) {
    if (a.detail === "full") continue;
    const file = path.join(ROOT, "data", `map-${a.id}.json`);
    if (!fs.existsSync(file)) continue;
    const d = JSON.parse(fs.readFileSync(file, "utf8"));
    if (d.slim) continue;
    const tol = a.detail === "corridor" ? 0.0004 : 0.00015; // degrees: ~40 m on the long corridors, ~15 m on the wide areas
    const before = fs.statSync(file).size;
    d.roads.forEach(r => { r.g = rdp(r.g, tol); });
    d.water = d.water.map(g => rdp(g, tol)).filter(g => g.length >= 3);
    d.rail.forEach(r => { r.g = rdp(r.g, tol); });
    d.aero.forEach(r => { r.g = rdp(r.g, tol); });
    d.slim = true;
    fs.writeFileSync(file, JSON.stringify(d));
    console.log(`map ${a.id}: slimmed ${(before / 1024).toFixed(0)} → ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
  }
}

/* ---------------- precache list + service worker version ---------------- */
function walk(dir, base = "") {
  const out = [];
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}
function buildManifest() {
  const th = (PLAN.META.theme || {}).light || {};
  const m = { name: PLAN.META.title, short_name: PLAN.META.shortName || PLAN.META.title, description: PLAN.META.subtitle, start_url: "./index.html", scope: "./", display: "standalone", orientation: "portrait", background_color: th.ground || "#FAF6F0", theme_color: th.accent || "#DA251D",
    icons: [{ src: "icons/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }] };
  fs.writeFileSync(path.join(ROOT, "manifest.webmanifest"), JSON.stringify(m, null, 2) + "\n");
}
function buildIcons() {
  const th = (PLAN.META.theme || {}).light || {};
  const r = spawnSync("python", [path.join(ROOT, "tools", "make_icons.py"), th.accent || "#DA251D", th.live || "#E8AE00", th.done || "#8A6D2F", th.ground || "#FAF6F0"], { encoding: "utf8" });
  if (r.status !== 0) console.log("make_icons.py failed:", r.stderr); else process.stdout.write(r.stdout);
}
function buildPrecache() {
  buildManifest();
  buildIcons();
  const files = ["index.html", "manifest.webmanifest", "data/plan.js", "data/routes.json", "data/images.json", "data/credits.json",
    ...PLAN.AREAS.map(a => `data/map-${a.id}.json`),
    ...walk("assets").filter(f => !f.endsWith("fonts.css")), ...walk("icons"), ...(fs.existsSync(path.join(ROOT, "img")) ? walk("img") : [])]
    .filter(f => fs.existsSync(path.join(ROOT, f)));
  const version = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
  let bytes = 0; for (const f of files) bytes += fs.statSync(path.join(ROOT, f)).size;
  fs.writeFileSync(path.join(ROOT, "data", "precache.json"), JSON.stringify({ version, count: files.length, bytes, files: files.map(f => "./" + f) }));
  const swPath = path.join(ROOT, "sw.js");
  fs.writeFileSync(swPath, fs.readFileSync(swPath, "utf8").replace(/const VERSION = "[^"]*";/, `const VERSION = "${version}";`));
  const byDir = {};
  for (const f of files) { const d = f.split("/")[0]; byDir[d] = (byDir[d] || 0) + fs.statSync(path.join(ROOT, f)).size; }
  console.log("precache: " + files.length + " files, " + (bytes / 1048576).toFixed(1) + " MB total");
  for (const [d, b] of Object.entries(byDir)) console.log(`  ${d.padEnd(22)} ${(b / 1048576).toFixed(2)} MB`);
  console.log("version " + version);
}

await buildFonts();
await buildRoutes();
await buildVector();
slimMaps();
if (!args.has("--skip-images")) await buildImages();
buildPrecache();
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
