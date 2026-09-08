// Build script: fetches fonts, walking/driving routes and vector map data, then writes the cache list the service worker uses.
// Run from the repo root:  node tools/build.mjs        (add --refresh-maps to refetch map data that already exists)
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const PLAN = require(path.join(ROOT, "data", "plan.js"));
const args = new Set(process.argv.slice(2));
const UA = "vietnam-trip-offline-planner/1.0 (personal offline trip app, small area, one-off download)";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const t0 = Date.now();

/* ---------------- fonts ---------------- */
async function buildFonts() {
  const cssPath = path.join(ROOT, "assets", "fonts", "fonts.css");
  if (!fs.existsSync(cssPath)) { console.log("fonts: assets/fonts/fonts.css missing, skipping"); return; }
  const css = fs.readFileSync(cssPath, "utf8");
  const KEEP = new Set(["Bricolage Grotesque", "Be Vietnam Pro", "IBM Plex Mono"]);
  const SUBSETS = new Set(["latin", "latin-ext", "vietnamese"]);
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
    else if (t.natural === "water" || t.water) { if (area.detail !== "wide" || extent(g) > 0.004) out.water.push(g); }
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
function buildPrecache() {
  const files = ["index.html", "manifest.webmanifest", "data/plan.js", "data/routes.json",
    ...PLAN.AREAS.map(a => `data/map-${a.id}.json`),
    ...walk("assets").filter(f => !f.endsWith("fonts.css")), ...walk("icons")]
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
buildPrecache();
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
