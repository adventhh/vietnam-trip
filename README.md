# Vietnam Master Plan

Offline-capable trip companion for 18–28 September 2026. A single web page with a left-to-right timeline, live "now" tracking in Indochina time, offline street maps with walking and Grab routes, opening hours and phone numbers on every stop, and links that open Google Maps, Grab and the booking apps.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The app. All layout and behaviour. |
| `data/plan.js` | The trip itself: places, days, stops, options, bookings. Edit this to change the plan. |
| `data/routes.json` | Walking and driving route lines, fetched by the build script from the OpenStreetMap routing demo server. |
| `data/precache.json` | List of every file the service worker caches for offline use. Generated. |
| `data/map-*.json` | Streets, water, parks and rail for each area listed in `plan.js`, from OpenStreetMap via the Overpass API. The page draws the map from these, so no tile server is needed. Generated. |
| `assets/fonts/` | Self-hosted fonts (Bricolage Grotesque, Be Vietnam Pro, IBM Plex Mono) with Vietnamese subsets. |
| `assets/leaflet/` | Leaflet 1.9.4 map library, self-hosted. |
| `sw.js` | Service worker. Caches everything on first visit; serves from cache afterwards. |
| `manifest.webmanifest`, `icons/` | Home-screen app metadata and icons. |
| `tools/build.mjs` | Rebuilds fonts, routes, map data and the cache list. |
| `tools/make_icons.py` | Regenerates the icons. |

## Rebuilding after editing the plan

```bash
node tools/build.mjs
```

Only missing routes and map areas are downloaded, so re-runs are fast. Add `--refresh-maps` to refetch map data that already exists. Commit and push; phones pick up the new version the next time they open the app with a connection.

## Deploying to GitHub Pages

1. Create an empty repository on GitHub (any name, e.g. `vietnam-trip`). Public is simplest; private repositories need GitHub Pro for Pages.
2. From this folder:
   ```bash
   git remote add origin https://github.com/<you>/vietnam-trip.git
   git push -u origin main
   ```
3. On GitHub: Settings → Pages → Build and deployment → Source: "Deploy from a branch" → Branch: `main`, folder `/ (root)` → Save.
4. After a minute the app is at `https://<you>.github.io/vietnam-trip/`.

## Installing on an iPhone

Open the URL in Safari, wait for the header to say "Offline ready", then tap Share → **Add to Home Screen**. Open it from the Home Screen icon at least once while online. From then on it works in flight mode, including the maps. Repeat on the second phone.

Picks (the ticks on options) are stored per phone and are not shared.

## Map data

Map data © OpenStreetMap contributors, ODbL, fetched once per area through the Overpass API. Routes from the Valhalla demo server run by FOSSGIS. Both are used here for a single personal trip; keep the build script to small areas and occasional runs. OpenStreetMap's raster tile server is deliberately not used: bulk tile downloads are against its usage policy and get blocked.
