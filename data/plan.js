/* Vietnam Master Plan — all trip data lives here.
   Edit this file to change the plan, then run `node tools/build.mjs` to refresh routes, tiles and the offline cache list. */
const PLAN = (() => {

  /* ---------- Places. Every pin was checked against OpenStreetMap or the venue's own site. ---------- */
  const P = {
    SIN:      { name: "Changi Airport Terminal 1", addr: "Scoot departs from Terminal 1", lat: 1.3625, lng: 103.9903,
                tip: "Scoot check-in closes 60 min before departure. Automated bag drop is at rows 5–6." },
    HAN:      { name: "Nội Bài International Airport, Terminal 2", addr: "Terminal 2 = international arrivals", lat: 21.2188925, lng: 105.8044596,
                tip: "Grab pick-up is on the arrivals level outside T2, past pillar 14 (follow the ride-hailing signs). Airport surcharge 15–25k VND shows in the app. Ignore anyone on foot holding a Grab sign; only match the plate on the car." },
    HOTEL1:   { name: "Hoàn Kiếm Legend Ha Noi Hotel", addr: "5/64 Cầu Gỗ (64 Hàng Bạc), Old Quarter", lat: 21.0325088, lng: 105.8525423,
                hours: "Check-in 14:00 · check-out 12:00", phone: "+84 2433 115 888", whatsapp: "+84 81 365 6688",
                vi: "Khách sạn Hoàn Kiếm Legend, 5/64 Cầu Gỗ, Hoàn Kiếm",
                tip: "From Friday 19:00 to Sunday midnight the lake ring (Đinh Tiên Hoàng, Lê Thái Tổ, Hàng Khay, Tràng Tiền) is closed to cars. Cầu Gỗ and Hàng Bè usually stay reachable; if the driver stops at the zone edge it's a 2–3 minute walk." },
    LAKE:     { name: "Hoàn Kiếm Lake", lat: 21.0287, lng: 105.8524 },
    PHO10:    { name: "Phở 10 Lý Quốc Sư", addr: "10 Lý Quốc Sư", lat: 21.0304724, lng: 105.8488474,
                hours: "06:00 – 22:00 daily", vi: "Phở 10 Lý Quốc Sư, 10 Lý Quốc Sư",
                tip: "Order at the counter, pay first, then find a seat. Phở tái (rare beef) or tái nạm (rare + brisket); quẩy dough sticks are extra." },
    PHOTHIN:  { name: "Phở Thìn Bờ Hồ, 19 Hàng Vôi", addr: "19 Hàng Vôi", lat: 21.0302317, lng: 105.8566268,
                hours: "06:00 – 13:00 and 17:00 – 22:00 (brand hours; confirm for this branch)", vi: "Phở Thìn Bờ Hồ, 19 Hàng Vôi",
                tip: "The 1955 original at 61 Đinh Tiên Hoàng was demolished in January 2026 for the lakeside boulevard. The owner now serves from this two-storey shop. Other family branches: 1 Hàng Tre, 1 Lê Văn Hưu." },
    KEM:      { name: "Kem Tràng Tiền Heritage store, 18 Hàng Bài", addr: "18 Hàng Bài (opened 1 Aug 2026)", lat: 21.0240, lng: 105.8530, approx: true,
                hours: "07:30 – 23:00 (flagship hours; confirm)", vi: "Kem Tràng Tiền, 18 Hàng Bài",
                tip: "The famous 35 Tràng Tiền shop stops serving on 15 Sep 2026, three days before you arrive. This Heritage store is 260 m away. There's also a counter at 44 Tràng Tiền. Coconut (dừa) and green bean (đậu xanh) sticks, cash, eat standing like the locals." },
    CHE:      { name: "Chè Bốn Mùa", addr: "4 Hàng Cân", lat: 21.0351057, lng: 105.8494131,
                hours: "07:00 – 22:00 (some listings say until 23:00)", phone: "0984 583 333", price: "15–22k VND a bowl", vi: "Chè Bốn Mùa, 4 Hàng Cân",
                tip: "Over 45 years old. Chè sen (lotus seed) or chè thập cẩm (mixed) on ice." },
    GIANG:    { name: "Cà Phê Giảng", addr: "39 Nguyễn Hữu Huân", lat: 21.0336060, lng: 105.8546223,
                hours: "07:00 – 22:00 daily", vi: "Cà Phê Giảng, 39 Nguyễn Hữu Huân",
                tip: "Walk down the narrow corridor to the back and upstairs. Cà phê trứng nóng (hot egg coffee) is the one. Two minutes from the hotel." },
    LOADINGT: { name: "Loading T Café", addr: "8 Chân Cầm, 1st floor", lat: 21.0305278, lng: 105.8485931,
                hours: "09:00 – 22:00 (listings vary, 08:00 start on some)", phone: "+84 903 342 000", vi: "Loading T Café, 8 Chân Cầm",
                tip: "Upstairs in a 1930s French villa with patterned tiles and shuttered windows. Egg coffee and cinnamon coffee." },
    HANGKHAY: { name: "Hàng Khay × Bà Triệu", addr: "south tip of the lake, north end of Bà Triệu", lat: 21.0258, lng: 105.8516,
                tip: "Saturday: the whole lake ring is pedestrian-only, so the walk down Lê Thái Tổ is traffic-free." },
    BHAPPY:   { name: "Le BHappy", addr: "14B Ngô Thì Nhậm, Cửa Nam", lat: 21.0181, lng: 105.8530, approx: true,
                hours: "08:30 – 22:00 daily", phone: "+84 38 668 8363", vi: "Le BHappy, 14B Ngô Thì Nhậm",
                tip: "Pastry and tea room. Croissants (tiramisu, raspberry, salted-butter with cheese) sell out by early afternoon." },
    ALLDAY:   { name: "All Day Coffee (Quang Trung)", addr: "37 Quang Trung", lat: 21.0208035, lng: 105.8483138,
                hours: "Fri – Sun 07:00 – 02:00 · Mon – Thu 07:00 – 23:00", phone: "+84 24 6686 8090", vi: "All Day Coffee, 37 Quang Trung",
                tip: "Brick atrium, specialty espresso, and an egg coffee of its own." },
    HUONGLIEN:{ name: "Bún Chả Hương Liên", addr: "24 Lê Văn Hưu", lat: 21.0180504, lng: 105.8538843,
                hours: "08:00 – 20:00 daily", phone: "+84 24 3943 4106", vi: "Bún Chả Hương Liên, 24 Lê Văn Hưu",
                tip: "Ask for 'Combo Obama': bún chả, one nem hải sản, one Hanoi beer. The Obama table is upstairs under glass. Lunch queue peaks 12:00–13:00." },
    BATRIEU_S:{ name: "Bà Triệu boutique strip", addr: "Bà Triệu between Tuệ Tĩnh and Tô Hiến Thành", lat: 21.0150, lng: 105.8500, approx: true,
                hours: "Most boutiques 09:30 – 21:30",
                tip: "Local labels cluster on the west side of the street. Cards accepted in most shops; small stalls are cash." },
    VINCOM:   { name: "Vincom Center Bà Triệu", addr: "191 Bà Triệu", lat: 21.0111892, lng: 105.8494705,
                hours: "Sat – Sun 09:30 – 22:00 · Mon – Fri 10:00 – 22:00", vi: "Vincom Center Bà Triệu, 191 Bà Triệu",
                tip: "Clean toilets on every floor. Grab pick-up is easiest on the Bà Triệu side." },
    CATHEDRAL:{ name: "St Joseph's Cathedral", addr: "40 Nhà Chung / Ấu Triệu", lat: 21.0286483, lng: 105.8488566,
                hours: "Interior Mon – Sat 08:00 – 11:00 and 14:00 – 20:00 · Saturday Mass 18:00 · courtyard always open", price: "Free", vi: "Nhà thờ Lớn Hà Nội, 40 Nhà Chung",
                tip: "Saturday afternoon the lake ring is car-free, so ask the Grab driver to come in from the west via Lý Quốc Sư or Nhà Chung. Side gate on Ấu Triệu if the front is shut." },
    TAMTHUONG:{ name: "Nem Chua Rán Ngõ Tạm Thương", addr: "Ngõ Tạm Thương, off Hàng Bông (no. 36 and no. 25 are the known ones)", lat: 21.0313702, lng: 105.8478286,
                hours: "No. 36: 08:30 – 23:00 · No. 25: 11:00 – 23:00", vi: "Nem chua rán Bà Già, ngõ Tạm Thương",
                tip: "Six or seven near-identical stalls in one alley. 'Bà Già' is the famous one. Order by the ten; dip in the sweet chili." },
    TRACHANH: { name: "Trà Chanh Nhà Thờ", addr: "Nhà Thờ street, pavement facing the cathedral", lat: 21.0290414, lng: 105.8500781,
                hours: "08:00 – 22:45", price: "15–40k VND a cup", vi: "Trà chanh Nhà Thờ",
                tip: "Pick any stall with free stools. Trà chanh (lemon), trà đào (peach), or trà chanh leo (passion fruit). Sunflower seeds come by the bag." },
    HANGDAO:  { name: "Hanoi Weekend Night Market", addr: "starts at 104 Hàng Đào by the lake, runs north to Đồng Xuân Market", lat: 21.0332114, lng: 105.8510729,
                hours: "Fri – Sun 18:00 – 23:00", vi: "Chợ đêm phố cổ, Hàng Đào",
                tip: "Busiest and best 19:30 – 21:00. Bargain to about 60–70% of the first price. Cash only at stalls." },
    TAHIEN:   { name: "Tạ Hiện beer street", addr: "Phố Tạ Hiện × Lương Ngọc Quyến", lat: 21.0353035, lng: 105.8519855,
                hours: "From about 17:00 until midnight – 01:00", price: "Bia hơi 10–15k VND a glass", vi: "Phố Tạ Hiện",
                tip: "Low stools at the crossroads are the scene; the bars with signs charge more. Craft beer at the corner taprooms." },
    HKOFFICE: { name: "HK Buslines office", addr: "70 Nguyễn Hữu Huân", lat: 21.0328984, lng: 105.8543668,
                tip: "Two minutes from the hotel. If the weekend pedestrian zone blocks the shuttle, this is the obvious meeting point; they'll tell you on WhatsApp the day before." },
  };
  Object.keys(P).forEach(k => { P[k].key = k; });

  /* ---------- Offline map coverage: bbox = [south, west, north, east].
     "full" detail = every street and footpath; "wide" = main roads only, for the long drives. ---------- */
  const AREAS = [
    { id: "hanoi-core", label: "Hanoi Old Quarter to Bà Triệu", bbox: [21.000, 105.833, 21.048, 105.870], detail: "full" },
    { id: "hanoi-wide", label: "Hanoi to Nội Bài", bbox: [20.950, 105.700, 21.260, 105.950], detail: "wide" },
  ];

  const PROVIDER = {
    "Booking.com": "https://secure.booking.com/myreservations.html",
    "trip.com": "https://www.trip.com/mytrips/",
    "Klook": "https://www.klook.com/bookings/",
    "Scoot": "https://makeabooking.flyscoot.com/ManageBooking",
    "VietJet": "https://www.vietjetair.com/en",
  };

  /* ---------- Days ---------- */
  const DAYS = [
    {
      id: "d1", n: 1, date: "2026-09-18", dow: "Friday",
      title: "Singapore → Hanoi: arrival and late-night bites",
      short: "Arrive Hanoi",
      stops: [
        {
          id: "d1-fly", start: "16:50", tzStart: "SGT", end: "19:15", kind: "flight",
          title: "Scoot TR532 to Hanoi",
          place: P.SIN,
          body: ["Depart Changi at 16:50 Singapore time. You land at 19:15 Hanoi time, which is 20:15 back home. Set your watch back one hour on landing."],
          links: [
            { label: "Track TR532", href: "https://www.flightradar24.com/data/flights/tr532" },
            { label: "Scoot booking", href: PROVIDER["Scoot"] },
          ],
        },
        {
          id: "d1-arrive", start: "19:15", end: "20:30", kind: "transit",
          title: "Nội Bài arrival, eSIM, Grab to the Old Quarter",
          leg: { mode: "fly", dur: "2 h 25", dist: "SIN → HAN" },
          place: P.HAN,
          body: ["Immigration, bags, then activate the eSIM before leaving the terminal so Grab works at the kerb. The drive into the Old Quarter is about 27 km and takes 35 to 45 minutes."],
          grabTo: P.HOTEL1,
        },
        {
          id: "d1-hotel", start: "20:30", end: "21:15", kind: "hotel",
          title: "Check in at Hoàn Kiếm Legend",
          leg: { mode: "grab", dur: "35–45 min", dist: "27 km" },
          place: P.HOTEL1,
          body: ["One night. Drop bags, freshen up, head out for supper. This is also where HK Buslines collects you tomorrow night."],
          booking: "trip.com",
        },
        {
          id: "d1-supper", start: "21:30", end: "22:45", kind: "food",
          title: "Late-night beef broth supper walk",
          leg: { mode: "walk", dur: "5–8 min" },
          place: P.HOTEL1,
          body: ["Phở 10 closes at 22:00 and is an 8-minute walk west. Phở Thìn's Hàng Vôi shop is 6 minutes east and serves until 22:00 too. If you're out of the hotel after 21:45, go east: it's closer."],
          warn: "Both phở shops close at 22:00. If check-in runs late, skip the shower and go straight out.",
          options: [
            { role: "primary", place: P.PHO10,
              desc: "The Old Quarter's most-cited beef phở: clear broth, generous rare and well-done brisket, quẩy fried dough sticks on the side. Expect a queue but it moves fast.", xhs: "Pho 10 Ly Quoc Su 河内" },
            { role: "primary", place: P.PHOTHIN,
              desc: "Phở Thìn Bờ Hồ, founded 1955, now in a roomier two-storey shop at 19 Hàng Vôi about 400 m from the lake. Lighter broth than Phở 10.", xhs: "Pho Thin Bo Ho 河内" },
            { role: "snack", place: P.KEM,
              desc: "Fresh toasted-coconut and green-bean popsicles from the 1958 ice cream institution, now at its new Heritage store on Hàng Bài near the south end of the lake.", xhs: "Kem Trang Tien 河内冰淇淋" },
            { role: "snack", place: P.CHE,
              desc: "Traditional sweet dessert soup with lotus seeds and grass jelly. A soothing pre-bed treat inside the Old Quarter grid, 5 minutes north-west of the hotel.", xhs: "Che Bon Mua Hang Can 河内" },
          ],
        },
      ],
    },
    {
      id: "d2", n: 2, date: "2026-09-19", dow: "Saturday",
      title: "Hanoi: lake stroll, Bà Triệu, Le BHappy, Vincom, then the overnight bus",
      short: "Hanoi walk day",
      stops: [
        {
          id: "d2-lake", start: "09:30", end: "10:15", kind: "walk",
          title: "Hoàn Kiếm Lake stroll to north Phố Bà Triệu",
          leg: { mode: "walk", dur: "15 min", dist: "1.1 km" },
          place: P.HANGKHAY,
          body: ["Walk south along the tree-shaded western bank on Lê Thái Tổ. Look across at Turtle Tower, the French-era post office and the willows in the green water. Enter Bà Triệu at the Hàng Khay intersection, then browse the colonial villas, vintage bookshops and quiet lifestyle boutiques on the first stretch."],
          options: [
            { role: "alt", place: P.GIANG, from: P.HOTEL1,
              desc: "The original egg coffee, down a narrow corridor. Take it now if you want cà phê trứng before the walk rather than later.", xhs: "Cafe Giang 河内鸡蛋咖啡" },
            { role: "alt", place: P.LOADINGT, from: P.HOTEL1,
              desc: "Set upstairs in an atmospheric, mossy 1930s French villa near the cathedral. Slow, photogenic.", xhs: "Loading T Cafe 河内" },
          ],
        },
        {
          id: "d2-bhappy", start: "10:15", end: "11:30", kind: "cafe",
          title: "Turn left to Le BHappy",
          leg: { mode: "walk", dur: "12 min", dist: "900 m" },
          place: P.BHAPPY,
          body: ["Walk down Bà Triệu to Lê Văn Hưu, turn left (east) and walk about 250 m to Ngô Thì Nhậm. Le BHappy is at 14B, near the north end of the street."],
          options: [
            { role: "primary", place: P.BHAPPY,
              desc: "Pastry and tea room: croissants baked through the day, iced fruit teas, sourdough, and a stylish, photogenic room.", xhs: "Le BHappy 河内" },
            { role: "alt", place: P.ALLDAY,
              desc: "Modern Vietnamese specialty espresso in a brick-lined, European-style atrium on Quang Trung, a few minutes west.", xhs: "All Day Coffee Hanoi" },
          ],
        },
        {
          id: "d2-buncha", start: "11:30", end: "12:45", kind: "food",
          title: "Lunch at Bún Chả Hương Liên",
          leg: { mode: "walk", dur: "2 min", dist: "100 m" },
          place: P.HUONGLIEN,
          body: ["Back to Lê Văn Hưu and 100 m further east to number 24. Arrive before 12:00 to beat the lunch queue."],
          options: [
            { role: "primary", place: P.HUONGLIEN,
              desc: "The Obama and Bourdain stop. Grilled pork patties steeped in sweet-sour fish sauce broth, fresh rice vermicelli, and the crispy seafood rolls (nem hải sản).", xhs: "Bun Cha Huong Lien 奥巴马" },
            { role: "snack", name: "Nước mía with kumquat", addr: "Right outside the shop",
              desc: "Sugar-cane juice pressed fresh with kumquat from the cart at the door. Ask for 'nước mía tắc'. About 15k VND." },
          ],
        },
        {
          id: "d2-batrieu", start: "12:45", end: "14:15", kind: "shop",
          title: "South Bà Triệu boutique strip",
          leg: { mode: "walk", dur: "6 min", dist: "450 m" },
          place: P.BATRIEU_S,
          body: ["Rejoin Bà Triệu and keep walking south. The trendiest strip sits between Lê Văn Hưu, Tuệ Tĩnh, Tô Hiến Thành and Đoàn Trần Nghiệp: local designer labels, indie womenswear, linen, streetwear."],
          options: [
            { role: "snack", name: "Bánh rán ngọt / mặn", addr: "Bicycle carts along Bà Triệu",
              desc: "Crispy sesame-crusted fried glutinous rice doughnuts. Ngọt is the sweet mung-bean one, mặn is stuffed with minced pork and glass noodles. 5–10k VND each.", xhs: "Banh Ran 河内炸糯米球" },
          ],
        },
        {
          id: "d2-vincom", start: "14:15", end: "15:15", kind: "shop",
          title: "Vincom Center Bà Triệu",
          leg: { mode: "walk", dur: "7 min", dist: "500 m" },
          place: P.VINCOM,
          body: ["End of the walk at 191 Bà Triệu. Air-conditioned lifestyle stores, local beauty and cosmetics brands, and a bubble or fruit tea on the ground floor."],
        },
        {
          id: "d2-grab1", start: "15:15", end: "15:30", kind: "transit",
          title: "GrabCar north to St Joseph's Cathedral",
          place: P.VINCOM,
          body: ["Call the car on the Bà Triệu side of Vincom. About 2.8 km and 10 to 12 minutes, roughly SGD 2.50. Saturday afternoon the lake ring is closed to cars, so the driver will come in from the west."],
          grabTo: P.CATHEDRAL,
        },
        {
          id: "d2-cathedral", start: "15:30", end: "17:30", kind: "shop",
          title: "St Joseph's Cathedral and Old Quarter artisans",
          leg: { mode: "grab", dur: "10–12 min", dist: "2.8 km" },
          place: P.CATHEDRAL,
          body: ["Walk the pedestrian alleys around the neo-Gothic cathedral: Ấu Triệu, Nhà Chung, Lý Quốc Sư. Ceramics, lacquerware, embroidered pouches, custom stationery. The interior reopens at 14:00 and the Saturday evening Mass is at 18:00, so the doors will be open as you leave."],
          options: [
            { role: "snack", place: P.TAMTHUONG,
              desc: "Iconic crispy fried fermented pork rolls (nem chua rán) with sweet chili dip, in a tucked-away alley of low stools. Four minutes north of the cathedral.", xhs: "Nem Chua Ran Tam Thuong 河内" },
            { role: "snack", place: P.TRACHANH,
              desc: "Low plastic stools facing the cathedral, chilled iced lemon tea and roasted sunflower seeds. The quintessential Hanoi youth hangout, best around 17:00 light.", xhs: "Tra Chanh Nha Tho 河内教堂柠檬茶" },
          ],
        },
        {
          id: "d2-market", start: "18:00", end: "21:00", kind: "market",
          title: "Hanoi weekend night market",
          leg: { mode: "walk", dur: "8 min", dist: "600 m" },
          place: P.HANGDAO,
          body: ["Saturday is a market night. Walk onto Hàng Đào and Hàng Ngang for silk scarves, local snacks and souvenirs."],
          options: [
            { role: "snack", name: "Bánh tráng nướng", addr: "Stalls along Hàng Đào / Hàng Ngang",
              desc: "'Vietnamese pizza': rice paper grilled over charcoal with egg, sausage, scallions and mayonnaise. 20–30k VND.", xhs: "Banh Trang Nuong 河内越南披萨" },
            { role: "snack", name: "Bánh cuốn nóng", addr: "Stalls along Hàng Đào / Hàng Ngang",
              desc: "Steamed rice rolls stuffed with minced pork and wood-ear mushroom, topped with crispy shallots.", xhs: "Banh Cuon Nong 河内" },
            { role: "snack", name: "Kem ống", addr: "Stalls along Hàng Đào / Hàng Ngang",
              desc: "Retro frozen ice tubes on sticks: coconut, durian, pandan. About 10k VND.", xhs: "Kem Ong 河内" },
          ],
        },
        {
          id: "d2-tahien", start: "21:00", end: "22:30", kind: "drinks",
          title: "Tạ Hiện beers, then collect stored luggage",
          leg: { mode: "walk", dur: "3 min", dist: "250 m" },
          place: P.TAHIEN,
          body: ["Craft beers around the edge of Tạ Hiện or a quiet iced tea by the lake. The hotel is a 5-minute walk south-east; be back by 22:30 to collect the stored bags."],
        },
        {
          id: "d2-pickup", start: "22:45", end: "23:30", kind: "transit",
          title: "Wait at Hoàn Kiếm Legend for the HK Buslines pick-up",
          leg: { mode: "walk", dur: "5 min", dist: "400 m" },
          place: P.HKOFFICE,
          body: ["HK Buslines collects you at the hotel for free; the Klook order carries the hotel name and your WhatsApp, and they message the exact pick-up time the day before. Old Quarter pick-ups are usually a shared minivan that shuttles you to the big sleeper bus outside the narrow-street zone.", "Be in the lobby with bags by 22:45. Keep the Klook voucher open."],
          links: [{ label: "Klook voucher", href: PROVIDER["Klook"] }],
        },
        {
          id: "d2-bus", start: "23:30", end: "05:30", endDate: "2026-09-20", kind: "bus",
          title: "HK Buslines luxury sleeper to Sapa",
          leg: { mode: "bus", dur: "6 h", dist: "Hanoi → Sapa" },
          place: P.HOTEL1,
          body: ["Private cabin overnight sleeper with two rest stops, dropping you at Pistachio Hotel Sapa between 05:30 and 06:00. Keep a light layer handy, the cabins run cold. Shoes come off at the door; bring socks."],
          booking: "Klook",
        },
      ],
    },
  ];

  const LEDGER = [
    ["Flight", "Singapore (SIN) → Hanoi (HAN), TR532", "18 Sep, 16:50 – 19:15", "Booking.com", 347.59, true, "Depart SIN local, arrive HAN local"],
    ["Hotel", "Hoàn Kiếm Legend Ha Noi Hotel", "18 – 19 Sep, 1 night", "trip.com", 62.71, true, "5/64 Cầu Gỗ · +84 2433 115 888"],
    ["Bus", "Hanoi → Sapa, HK Buslines", "19 Sep, 23:30", "Klook", 39.84, true, "Pick-up at Hoàn Kiếm Legend, drop at Pistachio Hotel"],
    ["Hotel", "Pistachio Hotel Sapa", "20 – 22 Sep, 2 nights", "trip.com", 234.88, true, "Valley view room"],
    ["Bus", "Sapa → Hanoi, HK Buslines", "22 Sep, 12:30", "Klook", 39.84, true, "Pick-up at Pistachio Hotel, drop at Hanoi Marvellous"],
    ["Hotel", "Hanoi Marvellous Hotel & Spa", "22 – 23 Sep, 1 night", "Booking.com", 75.00, true, "Old Quarter"],
    ["Cruise", "Amanda Luxury 2D1N Cruise", "23 – 24 Sep", "Klook", 374.58, true, "Hạ Long Bay cabin, full board"],
    ["Transit", "Hanoi → Hạ Long Bay shuttle", "23 Sep, 07:30 – 08:30", "Included in cruise", 0, true, "Hotel pick-up"],
    ["Transit", "Tuần Châu Marina → Hoàn Kiếm hotel", "24 Sep, 11:30 – 14:15", "trip.com", 32.20, true, "Direct expressway drop-off"],
    ["Flight", "Hanoi (HAN) → Da Nang (DAD), VJ521", "24 Sep, 18:45 – 20:05", "trip.com", 113.40, true, "Domestic Terminal 1"],
    ["Hotel", "Lantana Boutique Hoi An Hotel", "24 – 26 Sep, 2 nights", "Booking.com", 143.00, true, "Riverside, Ancient Town fringe"],
    ["Hotel", "Sala Danang Beach Hotel", "26 – 28 Sep, 2 nights", "Booking.com", 252.00, true, "Mỹ Khê beachfront"],
    ["Service", "Da Nang Airport Fast Track", "28 Sep", "Klook", 41.97, true, "International departure priority"],
    ["Flight", "Da Nang (DAD) → Singapore (SIN), VJ889", "28 Sep, 13:10 – 16:55", "trip.com", 242.40, true, "Depart DAD local, arrive SIN local"],
    ["Ticket", "Rồng Mây Glass Bridge + Coaster & Slide", "21 Sep", "On-site / Klook", 38.00, false, "Replaces closed Fansipan cable car"],
    ["Ticket", "Hoi An lantern boat ride", "25 Sep", "On-site pier", 12.50, false, "Buy at the Hoài River pier, ~$10–15"],
    ["Ticket", "Sun World Bà Nà Hills", "27 Sep", "Optional / Klook", 45.00, false, "Optional leisure day"],
  ];

  /* ---------- Route requests shared by the build script and the page ---------- */
  const costingFor = (mode) => (mode === "walk" ? "pedestrian" : mode === "grab" ? "auto" : null);
  const routeKey = (a, b, costing) => `${a.key}>${b.key}:${costing}`;
  function routeRequests() {
    const out = new Map();
    const add = (a, b, costing) => { if (a && b && a !== b && costing) { const k = routeKey(a, b, costing); if (!out.has(k)) out.set(k, { key: k, from: a, to: b, costing }); } };
    DAYS.forEach(day => day.stops.forEach((s, i) => {
      const prev = day.stops[i - 1];
      if (s.leg && prev && prev.place && s.place) add(prev.place, s.place, costingFor(s.leg.mode));
      if (s.grabTo && s.place) add(s.place, s.grabTo, "auto");
      (s.options || []).forEach(o => { if (o.place) add(o.from || s.place, o.place, "pedestrian"); });
    }));
    return [...out.values()];
  }

  return { P, AREAS, DAYS, LEDGER, PROVIDER, costingFor, routeKey, routeRequests };
})();
if (typeof module !== "undefined") module.exports = PLAN;
