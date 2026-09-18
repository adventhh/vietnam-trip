# Additions research — train street, Hàm Rồng, pumpkin chicken, Pizza 4P's

Four requested additions checked against current sources, Sep 2026. Pins added to `data/plan.js`
as `TRAINST`, `GADONGDUONG`, `TRAINLD`, `HAMRONG`, `P4P_HN`, `P4P_DN`.

---

## 1. Hanoi train street — scheduled Sat 19 Sep 17:10 – 18:30, fallback Tue 22 Sep 21:00

### Access is conditional, not free

Hanoi banned all **guided group tours** to train street in March 2025 after repeated safety
incidents. Barriers and guards sit at the main entrances and turn walk-ups away, especially in the
half-hour before a pass. What survives is entry as a **named café's guest**: a permitted café meets
you at the barrier, walks you in, and the drink (30 – 80k VND) is the entry fee. Message the café
the day before with the date, time and headcount.

Cafés that answer messages for the Trần Phú / Phùng Hưng stretch:

| Café | Contact | Note |
| --- | --- | --- |
| Cà Phê Ga Đông Dương | Facebook message | Address is literally "chắn tàu 5A Trần Phú" — on the crossing, so findable |
| Railway Cafe | WhatsApp +84 917 301 111 | The original train café |
| Coffee 74 / Waitrans 74 | WhatsApp +84 81 212 4488 | |
| Coffee Chill 96 | WhatsApp +84 904 557 373 | |

Sources: https://revitrip.com/blog/is-hanoi-train-street-still-open ·
https://viet-go.com/en/attractions/hanoi-train-street-coffee-guide ·
https://www.yourvietnamtravel.com/best-cafes-on-hanoi-train-street ·
https://joytime.vn/en/blog/9757-best-cafe-on-train-street-hanoi.html

### PLAN-AFFECTING: fewer trains since February 2026

On **27 Feb 2026** the Ministry of Construction and the Hanoi People's Committee agreed to cut
passenger-train frequency and suspend freight on the section through train street and Long Biên
bridge. Reports since put it at 4 – 6 passes a day rather than the old 5 – 8, and the published
timetables have not caught up. **Treat any listed time as a maybe and ask the café for that day's
schedule when booking.**

Sources: https://vietcetera.com/en/hanoi-cuts-train-services-to-famous-train-street-can-it-remain-a-tourist-magnet ·
https://www.railwaypro.com/wp/hanoi-to-stop-trains-on-the-famous-street-where-tourists/

### Why Saturday 19 Sep, 17:10

Weekday evenings are train-heavy but dark; weekends add morning and afternoon passes. Commonly
published pattern (all ±15 – 30 min):

- **Mon – Fri:** ~19:00, 19:45, 20:45, 21:30
- **Sat – Sun:** ~08:30, 09:30, 11:30, 15:20, 17:30, 19:20, 20:45

Sat 19 Sep is the trip's only Hanoi day with usable daylight passes (Fri 18 Sep they land at 19:15;
Tue 22 Sep the bus gets in at 18:00). The 17:00 – 18:30 window is also what the cafés themselves
recommend: best light, and the pass is the most reliable of the day. 17:10 arrival gives a seat
before the 17:30.

Cost to the day: the cathedral stop loses 30 minutes (15:30 – 17:00 instead of 17:30) and the night
market starts at 18:40 instead of 18:00 — no real loss, it only gets good after 19:30.

Sources: https://junglebosstours.com/explorer/tourism-blog/hanoi-train-street ·
https://kampatour.com/train-street-hanoi · https://asiamystika.com/blog/hanoi-train-street ·
https://shippedaway.com/hanoi-train-street/

### Which section

- **Trần Phú / Phùng Hưng** (pin 21.03012, 105.84406 — the level crossing, taken from the OSM rail
  geometry already in `data/map-hanoi-core.json`). Lanterns, murals, the famous frame. Also the most
  policed and the most touristed.
- **Ngõ 224 Lê Duẩn** (pin ~21.0165, 105.8413, between the mapped Ngõ 222 and Ngõ 226 Lê Duẩn).
  South of Hanoi station, 2.5 km from the Old Quarter, so it needs a Grab. Reported as barely
  policed, friendly, unobstructed, no sales pressure. Kept as the alt for when Trần Phú says no.

Both pins fall inside the existing `hanoi-core` map bbox, so no new map area was needed.

Sources: https://themanduls.com/hanoi-train-street/ (via search summary) ·
https://en.wikipedia.org/wiki/Ng%C3%B5_224_L%C3%AA_Du%E1%BA%A9n

---

## 2. "Garden of Eden" in Sapa — NOT FOUND under that name

Searched in English, Vietnamese ("vườn địa đàng Sa Pa") and Chinese ("沙坝 伊甸园"). No Sapa
attraction, café or garden goes by that name. What exists:

- **Moana Sapa's "Cổng Trời" / Gate of Heaven** — the Bali-style gate, infinity deck and sky swings.
  This is the "paradise" set that dominates Xiaohongshu and Instagram for Sapa, and it is **already
  in the plan**, Day 4, 14:45 – 16:15. Most likely what was meant.
- **Hàm Rồng mountain ecological area** — the actual *garden*: a central flower garden, 6,000+
  orchids across ~200 species, a European flower section, and the Thạch Lâm stone garden, all
  starting immediately past the ticket gate. Above them, Cổng Trời and the Sân Mây cloud deck.
  70k VND adult, 06:00 – 18:00 (some listings 07:00), gate on Hàm Rồng street behind the Stone
  Church, ~5 min walk from Ô Quý Hồ.
- Also checked and discounted: Eden Boutique Hotel & Spa and Sapa Eden View Hotel (hotels, not
  attractions); Sapa Green Valley; Swing Sapa.

**Plan-affecting:** the ascent to Cổng Trời is entirely stone steps at roughly 30°, 45 – 60 minutes,
which breaks the trip's no-strenuous rule. The lower gardens do not. Added as an **alt** on the
Monday 13:30 slot (against the Red Dao herbal bath, already flagged as the droppable stop), with the
climb explicitly warned off.

Sources: https://vinwonders.com/vi/wonderpedia/news/nui-ham-rong-sa-pa-lao-cai/ ·
https://www.flysapa.com/post/nui-ham-rong-sapa · https://sinhtour.vn/gia-ve-tham-quan-nui-ham-rong/ ·
https://www.vietfuntravel.com.vn/blog/chi-tiet-gia-ve-vao-tham-quan-nui-ham-rong-sapa.html ·
https://sapanomad.com/ham-rong-mountain-sapa/

---

## 3. Pumpkin chicken — the venue was already in the plan, the dish was not

**Gà đen ủ bí ngô**: a whole H'Mông black chicken (gà đen, the Sapa breed) marinated with goji
berries, jujubes and lotus seeds, then steamed inside a hollowed pumpkin and served in the shell.
It is the **signature dish of Nhà hàng Ô Quý Hồ**, which the plan already visits for Monday lunch
(Day 4, 12:15) and lists as Sunday's fallback.

- Price **315,000 VND**, feeds two with sides.
- Steaming takes 40 – 50 minutes → **phone 0888 029 119 the morning of 21 Sep and pre-order for
  12:15**, otherwise the 75-minute lunch slot is spent waiting. Added to the before-you-go checklist.
- Address on the existing pin is 08 Thạch Sơn; one source lists 01 Thạch Sơn and a different phone
  (070 2022 868). The existing pin was verified earlier, so it was left alone — worth one look on
  arrival.

Sources: https://oquyhorestaurant.com/products/ga-den-u-bi-ngo ·
https://oquyhorestaurant.com/blogs/news/ga-den-u-bi-ngo-mon-an-signature-cua-nha-hang-o-quy-h ·
https://www.tasteatlas.com/ga-den ·
https://www.tripadvisor.com/Restaurant_Review-g311304-d14021237-Reviews-O_Quy_Ho_Restaurant-Sapa_Lao_Cai_Province.html

---

## 4. Pizza 4P's — scheduled Sun 27 Sep, Đà Nẵng

**No Hội An branch exists.** Vietnam branches relevant to this trip:

| Branch | Address | Hours |
| --- | --- | --- |
| Indochina Riverside, Đà Nẵng | Level 2, Indochina Riverside Towers, 74 Bạch Đằng, Hải Châu | 11:00 – 22:00 |
| Hoàng Văn Thụ, Đà Nẵng | 8 Hoàng Văn Thụ, Phước Ninh, Hải Châu | quieter, inland |
| Bảo Khánh, Hanoi | 11B ngõ Bảo Khánh, Hoàn Kiếm | 10:30 – 23:00, last order 22:30 |
| Tràng Tiền, Hanoi | 43 Tràng Tiền, Hoàn Kiếm | 10:30 – 23:00, last order 22:30 |
| Hoàng Thành, Hanoi | 114 Mai Hắc Đế, Hai Bà Trưng | |
| Lotte Center, Hanoi | F1, 54 Liễu Giai, Ba Đình | 10:00 – 22:00 |

Scheduled at **Indochina Riverside on Sunday 27 Sep, 19:45 – 21:15**: it is the free evening (the
plan's own note records that the 7 Bridges riverside taproom in the original plan no longer exists),
it has the Hàn River view, and it is 150 m from the Cộng Cà Phê the plan already uses on Saturday.
The old single 18:30 – 21:00 "sundowners and dinner" stop was split into rooftop drinks at À La
Carte (18:30 – 19:30, walkable from Sala) and the pizza (19:45, 3 km Grab). Bé Mặn kept as the alt.

**Hanoi backup**: Bảo Khánh is 400 m from Hoàn Kiếm Legend and 500 m from Hanoi Marvellous, so it is
listed as a snack-role option on Saturday in case the pizza craving is a Hanoi one.

Sources: https://pizza4ps.com/vn/location/944 · https://pizza4ps.com/vn/location/923 ·
https://pizza4ps.com/vn/location/922/ · https://pizza4ps.com/vn/location/925/ ·
https://www.tripadvisor.com/Restaurant_Review-g298085-d19649328-Reviews-Pizza_4P_s_Indochina-Da_Nang.html ·
https://wnfdiary.com/pizza-4ps-review-the-best-pizza-in-hanoi/

---

## Build note

`data/routes.json` and `img/` were not regenerated (the sandbox this was edited in cannot reach
valhalla1.openstreetmap.de, overpass-api.de or commons.wikimedia.org). The app degrades gracefully —
new legs draw as straight lines labelled "route not downloaded" and new places show no photo. Run
`node tools/build.mjs` on a connected machine to fill both in. No new map area is needed: every new
pin falls inside an existing `AREAS` bbox.
