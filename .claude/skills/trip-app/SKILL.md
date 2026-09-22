---
name: trip-app
description: Working on the Vietnam Master Plan trip app — editing the itinerary, places, bookings ledger and the VND cash tracker in data/plan.js, plus the validator, the offline build and the service-worker cache. Use whenever a change touches data/plan.js, index.html, sw.js or tools/.
---

# Vietnam Master Plan — working on this app

A single-page offline trip companion. Everything about the trip lives in one file,
`data/plan.js`; `index.html` is the whole app; `tools/build.mjs` downloads the offline
assets. No framework, no build step for the page itself.

## The golden rule

**Edit `data/plan.js`, then run `node tools/validate.mjs` before anything else.** It
catches undefined `P.KEY` references, duplicate stop ids, malformed times, out-of-order
dates, unknown leg modes, bad option roles and missing budget lines. It is fast and it
has caught every mistake worth catching.

## What is in `data/plan.js`

One IIFE exporting `{ META, P, AREAS, DAYS, LEDGER, BUDGET, PROVIDER, ESSENTIALS, PICS,
costingFor, routeKey, routeRequests }`.

| Export | What it holds |
| --- | --- |
| `META` | Title, timezones, currency, theme colours, time presets, end card |
| `P` | Every place: name, addr, lat/lng, hours, price, phone, `vi` (the line to show a driver), tip. `approx: true` when the pin is an estimate; `offmap: true` suppresses the map button |
| `AREAS` | Offline map bounding boxes. A pin outside every bbox loses its Map button |
| `DAYS` | The itinerary. Each day has `stops`; each stop has `start`/`end` (HH:MM), `kind`, `title`, `place`, optional `leg`, `body`, `warn`, `options`, `booking`, `links` |
| `LEDGER` | Bookings in SGD: `[type, description, when, provider, cost, isBooked, note]` |
| `BUDGET` | The cash tracker — see below |
| `ESSENTIALS` | Cash notes, emergency numbers, phrases, weather, packing, the before-you-go checklist, scams |
| `PICS` | Wikimedia search terms per place key, used by the build to fetch photos |

### Stop conventions worth knowing

- `leg` describes **how you got to this stop**, and its duration is normally absorbed
  inside the previous stop's block or the gap. Do not assume the gap must exceed the leg.
- `options` have `role: "primary" | "alt" | "snack"`. Every option needs a `place` or a
  `name`. `from:` overrides which place the walking route is drawn from.
- `xhs:` on an option adds a Xiaohongshu search deep link.
- Stop `kind` is a free-form CSS class, not an enum — but reuse the existing set
  (`food cafe drinks market shop view walk hotel transit flight bus boat spa`).

## The cash tracker

Two halves: static expectations in `plan.js`, live spending on the phone.

### `BUDGET` in `data/plan.js`

```js
const BUDGET = {
  seedExchanges: [{ id: "x1", label: "First exchange", home: 700, vnd: 14000000 }],
  categories: ["Food", "Transport", "Tickets", "Shopping", "Other"],
  cardNote: "…which places take card, so the big lines never touch cash",
  days: {
    d1: { food: [180000, 280000], cash: [350000, 450000], note: "…" },
    // one entry per day id, in the same order as DAYS
  },
};
```

- `food` is meals, snacks, coffee and drinks. `cash` is everything else you hand over
  notes for — Grabs, taxis, gate tickets. Both are `[low, high]` **in VND for two people**,
  read off the prices already on the cards.
- Anything prepaid in SGD belongs in `LEDGER`, not here. Keeping them separate is what
  stops the totals double-counting.
- The validator enforces that every day in `DAYS` has a budget with `low <= high`.

### The wallet in `index.html`

Opened from the **Cash** tab (bottom bar on a phone, toolbar on desktop) or from the
"Open the cash tracker" button in Essentials. `openWallet()` renders it.

State lives in `localStorage` under `LS("wallet")`, where `LS(k)` is
`` `${SLUG}.${k}` `` and `SLUG` derives from `META.shortName`:

```js
{ exchanges: [{ id, label, home, vnd }],
  spends:    [{ id, day, amt, cat, note, ts }] }
```

- **`seedExchanges` is a seed, not a source of truth.** The first time a phone opens the
  tab it copies those rows into that phone's storage and the local copy wins from then
  on. Editing `seedExchanges` later changes nothing on a phone that has already been in.
- Exchanges are editable rows; the implied rate is derived as `sum(vnd) / sum(home)`, so
  changing the đồng without changing the SGD moves the displayed rate. That is intended.
- The balance bar turns amber under 20% remaining and red once spending passes what was
  changed.
- Spends and exchanges are **per phone** and never sync, exactly like the picks.
- `fmtK()` shortens amounts for the per-day table (980000 → `980k`, 1500000 → `1.5M`).

Other `localStorage` keys, same prefix: `picks`, `checks`, `rate`, `view`, `simOffset`,
`installHint`.

## Recording what actually happened

Past days get rewritten from plan to record — real stops, real times, options pruned to
what was used. Keep the writing in the same voice; do not leave stale warns about
booking things that have already happened.

## Rebuilding

```bash
node tools/validate.mjs     # always
node tools/build.mjs        # routes, map areas, photos, precache, sw VERSION
node tools/build.mjs --skip-images   # maps and routes only
```

`build.mjs` is resumable: it skips routes already in `routes.json`, map areas whose file
exists (unless `--refresh-maps`) and images already downloaded.

It reaches `valhalla1.openstreetmap.de`, `overpass-api.de` and `commons.wikimedia.org`.
**These are blocked by the egress proxy in Claude Code sessions** — every host returns
403 — so the build has to be run on the user's own machine. Do not try to route around
it; report the blocked host instead.

## The service worker will bite you

`sw.js` is **cache-first with no revalidation**, and its cache key is `VERSION`. A phone
that already installed the app keeps serving the old `data/plan.js` forever unless
`VERSION` changes — the in-app "recache" button does not help, because `cacheAll()`
skips anything already cached.

`build.mjs` rewrites `VERSION` automatically. If you change `plan.js` without running the
build, **bump `const VERSION` in `sw.js` by hand** or the work never reaches the phones.

## Deploying

GitHub Pages serves `main` at adventhh.github.io/vietnam-trip. There is no CI — whatever
is committed to `main` is what ships. Work happens on a feature branch and is
fast-forwarded into `main`.

## Local notes that cost us time

- **Grab is unreliable in Sapa.** Xanh SM is the app that actually works up there, with
  best coverage in the town core. Taxis and electric carts also run the Moana road all
  day at about 50k a hop.
- Verify hours against a current source before writing them into `P` — several venues in
  this plan moved, renamed or changed their closing times during planning.
