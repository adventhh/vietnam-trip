// Checks data/plan.js before a build: every place reference resolves, stop ids are unique, times parse, days are in order.
// Run: node tools/validate.mjs
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLAN = createRequire(import.meta.url)(path.join(ROOT, "data", "plan.js"));

const bad = [];
const ids = [];
const hm = /^\d\d:\d\d$/;
PLAN.DAYS.forEach((d, di) => {
  if (!/^\d{4}-\d\d-\d\d$/.test(d.date)) bad.push(`${d.id}: date must be YYYY-MM-DD`);
  if (di > 0 && d.date <= PLAN.DAYS[di - 1].date) bad.push(`${d.id}: dates out of order`);
  d.stops.forEach(s => {
    ids.push(s.id);
    if (!hm.test(s.start) || !hm.test(s.end)) bad.push(`${s.id}: start/end must be HH:MM`);
    if ("place" in s && !s.place) bad.push(`${s.id}: place is undefined (typo in P.KEY?)`);
    if ("grabTo" in s && !s.grabTo) bad.push(`${s.id}: grabTo is undefined`);
    if (s.leg && !PLAN.costingFor(s.leg.mode) && !["bus", "fly", "boat", "ferry", "rail", "train", "metro", "tram", "funicular", "cable"].includes(s.leg.mode) && !(PLAN.META.modes || {})[s.leg.mode]) bad.push(`${s.id}: unknown leg mode ${s.leg.mode} (walk, grab, car, taxi route; bus, fly, boat, ferry, rail, train, metro, tram, funicular, cable don't; or add it to META.modes)`);
    (s.options || []).forEach((o, i) => {
      if (!["primary", "alt", "snack"].includes(o.role)) bad.push(`${s.id} option ${i}: role must be primary, alt or snack`);
      if ("place" in o && !o.place) bad.push(`${s.id} option ${i}: place is undefined`);
      if ("from" in o && !o.from) bad.push(`${s.id} option ${i}: from is undefined`);
      if (!o.place && !o.name) bad.push(`${s.id} option ${i}: needs a place or a name`);
    });
  });
});
const B = PLAN.BUDGET || {};
PLAN.DAYS.forEach(d => {
  const b = (B.days || {})[d.id];
  if (!b) { bad.push(`BUDGET.days.${d.id}: missing`); return; }
  ["food", "cash"].forEach(f => {
    if (!Array.isArray(b[f]) || b[f].length !== 2) bad.push(`BUDGET.days.${d.id}.${f}: must be [low, high]`);
    else if (!(b[f][0] <= b[f][1])) bad.push(`BUDGET.days.${d.id}.${f}: low is above high`);
  });
});
(B.seedExchanges || []).forEach(x => { if (!(x.vnd > 0) || !(x.home > 0)) bad.push(`BUDGET.seedExchanges ${x.id}: home and vnd must both be above zero`); });
if (!(B.categories || []).length) bad.push("BUDGET.categories: needs at least one");

const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) bad.push("duplicate stop ids: " + dup.join(", "));
Object.entries(PLAN.P).forEach(([k, p]) => { if (typeof p.lat !== "number" || typeof p.lng !== "number") bad.push(`place ${k}: lat/lng missing`); });
const missingPics = Object.keys(PLAN.P).filter(k => !(PLAN.PICS || {})[k]);

const budLo = PLAN.DAYS.reduce((t, d) => t + ((B.days || {})[d.id] ? B.days[d.id].food[0] + B.days[d.id].cash[0] : 0), 0);
const budHi = PLAN.DAYS.reduce((t, d) => t + ((B.days || {})[d.id] ? B.days[d.id].food[1] + B.days[d.id].cash[1] : 0), 0);
console.log(`days ${PLAN.DAYS.length} · stops ${ids.length} · places ${Object.keys(PLAN.P).length} · route legs ${PLAN.routeRequests().length} · map areas ${PLAN.AREAS.length}`);
console.log(`expected cash ${(budLo / 1e6).toFixed(2)}M – ${(budHi / 1e6).toFixed(2)}M VND · seeded exchange ${((B.seedExchanges || []).reduce((t, x) => t + x.vnd, 0) / 1e6).toFixed(2)}M`);
if (missingPics.length) console.log("places without photo search terms:", missingPics.join(", "));
if (bad.length) { console.log("PROBLEMS:\n" + bad.join("\n")); process.exit(1); }
console.log("plan.js is consistent");
