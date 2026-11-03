// Prox UI kit — mock catalog, retailers, scenario + pure logic. window.ProxData
(function () {
  const RETAILERS = [
    { id: 'fc', name: 'FreshCo Market', short: 'FC' },
    { id: 'vm', name: 'ValueMart', short: 'VM' },
    { id: 'gg', name: 'Greenleaf Grocer', short: 'GG' },
  ];
  // prices: retailer -> [price, ageInDays] ; missing = not carried
  const P = (id, g, name, brand, organic, size, unit, base, baseUnit, cat, icon, prices, tags) =>
    ({ id, g, name, brand, organic, size, unit, base, baseUnit, cat, icon, prices, tags: tags || [] });
  const CATALOG = [
    P('m1', 'milk', 'Whole Milk', 'Store brand', false, 1, 'gal', 128, 'fl oz', 'dairy', 'milk', { fc: [3.49, 2], vm: [2.98, 1], gg: [3.99, 3] }),
    P('m2', 'milk', '2% Reduced Fat Milk', 'Store brand', false, 0.5, 'gal', 64, 'fl oz', 'dairy', 'milk', { fc: [2.29, 2], vm: [1.98, 1], gg: [2.49, 3] }),
    P('m3', 'milk', 'Organic Whole Milk', 'Meadow Farms', true, 0.5, 'gal', 64, 'fl oz', 'dairy', 'milk', { fc: [4.49, 2], gg: [4.29, 3] }),
    P('m4', 'milk', 'Oat Milk Original', 'Oat Haus', false, 64, 'oz', 64, 'fl oz', 'dairy', 'milk', { fc: [4.79, 2], vm: [4.28, 12], gg: [4.99, 3] }, ['plant-based']),
    P('e1', 'eggs', 'Large White Eggs', 'Store brand', false, 12, 'ct', 12, 'ct', 'dairy', 'egg', { fc: [3.29, 2], vm: [2.87, 1], gg: [3.79, 3] }),
    P('e2', 'eggs', 'Organic Brown Eggs', 'Sunny Acre', true, 12, 'ct', 12, 'ct', 'dairy', 'egg', { fc: [5.49, 2], gg: [5.29, 3] }),
    P('b1', 'bread', 'Whole Wheat Bread', 'Hearth & Co', false, 1, 'loaf', 20, 'oz', 'pantry', 'croissant', { fc: [3.19, 2], vm: [2.48, 1], gg: [3.99, 3] }),
    P('b2', 'bread', 'Sourdough Loaf', 'Greenleaf Bakery', false, 1, 'loaf', 24, 'oz', 'pantry', 'croissant', { fc: [4.99, 9], gg: [5.49, 3] }),
    P('ba1', 'bananas', 'Bananas', 'Loose', false, 1, 'lb', 1, 'lb', 'produce', 'banana', { fc: [0.59, 2], vm: [0.52, 1], gg: [0.69, 3] }),
    P('ba2', 'bananas', 'Organic Bananas', 'Loose', true, 1, 'lb', 1, 'lb', 'produce', 'banana', { fc: [0.79, 2], vm: [0.74, 1], gg: [0.79, 3] }),
    P('sp1', 'spinach', 'Baby Spinach', 'Store brand', false, 1, 'bag', 5, 'oz', 'produce', 'leaf', { fc: [2.99, 2], vm: [2.48, 1] }),
    P('sp2', 'spinach', 'Organic Baby Spinach', 'Leafwell', true, 1, 'bag', 5, 'oz', 'produce', 'leaf', { fc: [3.99, 2], vm: [3.68, 1], gg: [3.79, 3] }),
    P('ap1', 'apples', 'Honeycrisp Apples', 'Loose', false, 1, 'lb', 1, 'lb', 'produce', 'apple', { fc: [2.49, 2], vm: [1.97, 1], gg: [2.99, 3] }),
    P('to1', 'tomatoes', 'Roma Tomatoes', 'Loose', false, 1, 'lb', 1, 'lb', 'produce', 'cherry', { fc: [1.49, 2], vm: [1.12, 1], gg: [1.79, 3] }),
    P('c1', 'chicken', 'Boneless Chicken Breast', 'Store brand', false, 1, 'lb', 1, 'lb', 'meat', 'drumstick', { fc: [4.49, 2], vm: [3.97, 1], gg: [5.99, 3] }),
    P('y1', 'yogurt', 'Plain Greek Yogurt', 'Fage-style', false, 32, 'oz', 32, 'oz', 'dairy', 'milk', { fc: [5.49, 2], vm: [4.98, 1], gg: [5.99, 3] }),
    P('y2', 'yogurt', 'Vanilla Greek Yogurt Cups', 'Store brand', false, 4, 'ct', 21.2, 'oz', 'dairy', 'milk', { fc: [4.29, 2], vm: [3.88, 1] }),
    P('ch1', 'cheese', 'Sharp Cheddar Block', 'Hillside', false, 8, 'oz', 8, 'oz', 'dairy', 'milk', { fc: [3.99, 2], vm: [2.98, 1], gg: [4.49, 3] }),
    P('bu1', 'butter', 'Salted Butter', 'Store brand', false, 16, 'oz', 16, 'oz', 'dairy', 'milk', { fc: [4.79, 2], vm: [3.98, 1], gg: [5.29, 3] }),
    P('co1', 'coffee', 'Medium Roast Ground Coffee', 'Northbean', false, 12, 'oz', 12, 'oz', 'pantry', 'coffee', { fc: [8.99, 2], vm: [7.48, 1], gg: [9.49, 14] }),
    P('r1', 'rice', 'Jasmine Rice', 'Store brand', false, 2, 'lb', 32, 'oz', 'pantry', 'wheat', { fc: [3.49, 2], vm: [2.84, 1], gg: [3.99, 3] }),
    P('pa1', 'pasta', 'Spaghetti', 'Store brand', false, 16, 'oz', 16, 'oz', 'pantry', 'wheat', { fc: [1.39, 2], vm: [0.98, 1], gg: [1.79, 3] }),
    P('pt1', 'paper towels', 'Paper Towels 6-roll', 'Store brand', false, 6, 'ct', 6, 'ct', 'essentials', 'scroll', { fc: [8.99, 2], vm: [7.47, 1] }),
    // Discovery candidates (not in pantry history)
    P('d1', 'tempeh', 'Organic Tempeh', 'Lightlife-style', true, 8, 'oz', 8, 'oz', 'meat', 'bean', { fc: [3.79, 2], gg: [3.49, 3] }, ['plant-based', 'high-protein', 'organic']),
    P('d2', 'tofu', 'Extra-Firm Tofu', 'Store brand', false, 14, 'oz', 14, 'oz', 'meat', 'bean', { fc: [2.49, 2], vm: [1.98, 1], gg: [2.79, 3] }, ['plant-based', 'high-protein']),
    P('d3', 'skyr', 'Icelandic Skyr, Plain', 'Nordbær', false, 24, 'oz', 24, 'oz', 'dairy', 'milk', { fc: [5.99, 2], gg: [6.29, 3] }, ['high-protein']),
    P('d4', 'cottage cheese', 'Small-Curd Cottage Cheese', 'Hillside', false, 16, 'oz', 16, 'oz', 'dairy', 'milk', { fc: [3.69, 2], vm: [2.98, 1] }, ['high-protein']),
    P('d5', 'chickpea pasta', 'Chickpea Rotini', 'Pulse Co', false, 8, 'oz', 8, 'oz', 'pantry', 'wheat', { fc: [3.29, 2], vm: [2.98, 1] }, ['plant-based', 'high-protein']),
    P('d6', 'kimchi', 'Napa Cabbage Kimchi', 'Seoul Jar', false, 16, 'oz', 16, 'oz', 'pantry', 'soup', { gg: [6.99, 3] }, ['plant-based']),
    P('d7', 'persimmons', 'Fuyu Persimmons', 'Loose', true, 1, 'lb', 1, 'lb', 'produce', 'citrus', { fc: [3.49, 2], gg: [2.99, 3] }, ['plant-based', 'organic']),
    P('d8', 'sweet potatoes', 'Purple Sweet Potatoes', 'Loose', false, 1, 'lb', 1, 'lb', 'produce', 'carrot', { vm: [1.68, 1], gg: [1.99, 3] }, ['plant-based']),
    P('d9', 'edamame', 'Shelled Edamame', 'Store brand', false, 12, 'oz', 12, 'oz', 'frozen', 'snowflake', { fc: [2.99, 2], vm: [2.48, 1] }, ['plant-based', 'high-protein']),
    P('d10', 'oat milk', 'Barista Oat Milk', 'Oat Haus', true, 32, 'oz', 32, 'fl oz', 'dairy', 'milk', { fc: [4.99, 2], gg: [5.29, 3] }, ['plant-based', 'organic']),
  ];
  const byId = Object.fromEntries(CATALOG.map(p => [p.id, p]));
  const DISCOVERY = CATALOG.filter(p => p.id[0] === 'd');
  const STALE_DAYS = 7;

  const pantryItem = (g, pid, qty, par, perDay, every, last) => ({ g, pid, qty, par, perDay, every, last });
  function initialState() {
    return {
      v: 2, day: 0, tab: 'home',
      prefs: { organicProduce: true, discoverPref: 'plant-based', discoverCat: 'any', retailers: { fc: true, vm: true, gg: true } },
      pantry: [
        pantryItem('milk', 'm1', 0.25, 0.5, 0.1, 7, -6),
        pantryItem('eggs', 'e1', 3, 4, 1, 7, -6),
        pantryItem('yogurt', 'y1', 10, 8, 4, 7, -6),
        pantryItem('bread', 'b1', 0.5, 0.25, 0.15, 5, -4),
        pantryItem('bananas', 'ba2', 1, 1, 0.3, 5, -4),
        pantryItem('spinach', 'sp2', 0.5, 0.5, 0.2, 7, -5),
        pantryItem('chicken', 'c1', 2, 1, 0.25, 10, -3),
        pantryItem('cheese', 'ch1', 4, 2, 0.5, 14, -4),
        pantryItem('butter', 'bu1', 12, 4, 0.7, 21, -10),
        pantryItem('coffee', 'co1', 6, 3, 0.5, 14, -9),
        pantryItem('rice', 'r1', 1.5, 0.5, 0.1, 30, -20),
        pantryItem('pasta', 'pa1', 32, 16, 1.5, 21, -15),
      ],
      list: [
        { id: 'l1', pid: 'm1', text: 'Milk', qty: 1, unit: 'gal', pinOrganic: false, pinBrand: null },
        { id: 'l2', pid: 'e1', text: 'Eggs', qty: 1, unit: 'ct', pinOrganic: false, pinBrand: null },
        { id: 'l3', pid: 'sp2', text: 'Spinach', qty: 2, unit: 'bag', pinOrganic: true, pinBrand: null },
        { id: 'l4', pid: 'b2', text: 'Sourdough', qty: 1, unit: 'loaf', pinOrganic: false, pinBrand: 'Greenleaf Bakery' },
        { id: 'l5', pid: 'co1', text: 'Coffee', qty: 1, unit: 'bag', pinOrganic: false, pinBrand: null },
        { id: 'l6', pid: null, text: 'Yogurt', qty: 1, unit: 'ct', pinOrganic: false, pinBrand: null, candidates: ['y1', 'y2'] },
      ],
      history: [
        { id: 'h1', day: -13, retailer: 'vm', total: 38.75, saved: 6.10, items: [['m1', 1], ['e1', 1], ['b1', 1], ['c1', 2], ['pa1', 2]] },
        { id: 'h2', day: -6, retailer: 'fc', total: 42.10, saved: 4.85, items: [['m1', 1], ['e1', 1], ['y1', 1], ['ba2', 2], ['sp2', 1], ['ch1', 1]] },
      ],
      dismissed: [], dismissedCats: {}, overrides: {}, reminder: null, nextId: 7,
    };
  }

  const fmt = n => '$' + (Math.round(n * 100) / 100).toFixed(2);
  const fmtQty = (q, u) => { const r = Math.round(q * 100) / 100; const f = { 0.25: '¼', 0.5: '½', 0.75: '¾' }[r]; return (f || r) + ' ' + u; };
  const weekOf = day => Math.floor(day / 7) + 1;
  const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLabel = day => 'Week ' + weekOf(day) + ' · ' + DOW[((day % 7) + 7) % 7];

  function search(q) {
    q = q.trim().toLowerCase(); if (!q) return [];
    return CATALOG.filter(p => (p.name + ' ' + p.g + ' ' + p.brand).toLowerCase().includes(q)).slice(0, 6);
  }
  function genericMatches(q) {
    q = q.trim().toLowerCase();
    const exact = CATALOG.filter(p => p.g === q || p.g === q.replace(/s$/, '') || p.g + 's' === q);
    return exact.length ? exact : search(q);
  }
  const unitPrice = (p, r) => p.prices[r] ? p.prices[r][0] / p.base : null;

  // Pantry signals → restock suggestions with explicit reasons
  function suggestions(s) {
    const onList = new Set(s.list.map(i => i.pid && byId[i.pid].g));
    return s.pantry.map(it => {
      const p = byId[it.pid], reasons = [];
      let score = 0;
      const daysLeft = it.perDay ? it.qty / it.perDay : 99;
      const since = s.day - it.last;
      if (it.qty <= it.par) { score += 3; reasons.push(['low', fmtQty(it.qty, p.unit) + ' left · restock at ' + fmtQty(it.par, p.unit)]); }
      if (daysLeft <= 4) { score += 2.5; reasons.push(['depletion', daysLeft < 1 ? 'Likely out today' : 'Runs out in ~' + Math.round(daysLeft) + ' day' + (Math.round(daysLeft) === 1 ? '' : 's')]); }
      if (since >= it.every - 1) { score += 1.5; reasons.push(['recurrence', 'You buy this every ' + it.every + ' days · last ' + since + 'd ago']); }
      let pid = it.pid;
      if (score > 0 && s.prefs.organicProduce && p.cat === 'produce' && !p.organic) {
        const org = CATALOG.find(x => x.g === p.g && x.organic); if (org) { pid = org.id; }
      }
      if (score > 0 && s.prefs.organicProduce && byId[pid].organic && byId[pid].cat === 'produce') { score += .5; reasons.push(['preference', 'Saved preference: organic produce']); }
      return { g: it.g, pid, score, reasons, daysLeft, onList: onList.has(it.g) };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  }

  // Per-retailer basket with substitutions, coverage, stale flags
  function compare(s) {
    const items = s.list.filter(i => i.pid);
    const unresolved = s.list.filter(i => !i.pid);
    const res = RETAILERS.map(r => {
      const lines = items.map(it => {
        const want = byId[it.pid];
        const ovr = (s.overrides[r.id] || {})[it.id];
        const ok = p => p.prices[r.id] && (!it.pinOrganic || p.organic) && (!it.pinBrand || p.brand === it.pinBrand);
        const alts = CATALOG.filter(p => p.g === want.g && ok(p));
        let pick = ovr && byId[ovr] && ok(byId[ovr]) ? byId[ovr] : (want.prices[r.id] && ok(want) ? want : null);
        let sub = null;
        if (!pick && alts.length) {
          pick = alts.slice().sort((a, b) => unitPrice(a, r.id) - unitPrice(b, r.id))[0];
          const why = [];
          why.push(r.name + ' doesn’t carry ' + want.name + (want.prices[r.id] ? ' with your pins' : ''));
          why.push('closest match: same item type, ' + fmt(unitPrice(pick, r.id) * (pick.baseUnit === 'ct' ? 1 : 1)) + '/' + pick.baseUnit);
          if (it.pinOrganic) why.push('kept organic per your pin');
          sub = why.join(' — ');
        }
        if (!pick) return { it, want, missing: true, alts: [] };
        const [price, age] = pick.prices[r.id];
        const qty = pick.id === want.id ? it.qty : Math.max(1, Math.round(it.qty * want.base / pick.base));
        return { it, want, pick, qty, price, total: price * qty, stale: age > STALE_DAYS, age, sub, unit: price / pick.base, alts: alts.filter(a => a.id !== pick.id) };
      });
      const have = lines.filter(l => !l.missing);
      return { r, lines, total: have.reduce((a, l) => a + l.total, 0), covered: have.length, of: items.length,
        missing: lines.filter(l => l.missing), stale: have.filter(l => l.stale).length };
    });
    const complete = res.filter(x => x.covered === x.of && x.of > 0).sort((a, b) => a.total - b.total);
    const incomplete = res.filter(x => x.covered < x.of).sort((a, b) => b.covered - a.covered || a.total - b.total);
    const best = complete[0] || null;
    const highest = complete.length ? complete[complete.length - 1].total : 0;
    return { rows: [...complete, ...incomplete], best, highest, unresolved, count: items.length };
  }

  function discover(s) {
    const pref = s.prefs.discoverPref, cat = s.prefs.discoverCat, rs = s.prefs.retailers;
    const known = new Set([...s.pantry.map(p => p.g), ...s.list.map(i => i.pid && byId[i.pid].g)]);
    const bought = {}; s.history.forEach(h => h.items.forEach(([pid]) => { const c = byId[pid].cat; bought[c] = (bought[c] || 0) + 1; }));
    const pool = DISCOVERY.filter(p => p.tags.includes(pref) && (cat === 'any' || p.cat === cat) && !s.dismissed.includes(p.id) && !known.has(p.g));
    const scored = pool.map(p => {
      const at = RETAILERS.filter(r => rs[r.id] && p.prices[r.id]);
      const score = (bought[p.cat] || 0) - 3 * (s.dismissedCats[p.cat] || 0) + at.length * .5 + ((weekOf(s.day) * 7 + p.id.length + +p.id.slice(1)) % 3) * .3;
      return { p, at, score, catBuys: bought[p.cat] || 0 };
    }).filter(x => x.at.length);
    scored.sort((a, b) => b.score - a.score);
    return { pick: scored[0] || null, poolSize: scored.length, excluded: pool.length - scored.length };
  }

  // Apply N days of consumption
  function advance(s, days) {
    const pantry = s.pantry.map(p => ({ ...p, qty: Math.max(0, +(p.qty - p.perDay * days).toFixed(2)) }));
    const ns = { ...s, day: s.day + days, pantry };
    const sug = suggestions(ns).filter(x => !x.onList);
    const urgent = sug.find(x => x.daysLeft <= 2) || sug[0];
    ns.reminder = urgent ? { g: urgent.g, pid: urgent.pid, text: byId[urgent.pid].name + (urgent.daysLeft < 1 ? ' is likely out' : ' runs out in ~' + Math.max(1, Math.round(urgent.daysLeft)) + ' days'), why: urgent.reasons[0][1] } : null;
    return ns;
  }

  function completeTrip(s, row) {
    const bought = row.lines.filter(l => !l.missing);
    const pantry = s.pantry.map(p => ({ ...p }));
    bought.forEach(l => {
      const e = pantry.find(p => p.g === l.pick.g);
      const pp = byId[e ? e.pid : l.pick.id];
      const add = l.qty * l.pick.base / (pp.base / pp.size);
      if (e) { e.qty = +(e.qty + add).toFixed(2); e.last = s.day; }
      else pantry.push(pantryItem(l.pick.g, l.pick.id, add, add / 3, add / 7, 7, s.day));
    });
    const boughtIds = new Set(bought.map(l => l.it.id));
    const cmp = compare(s);
    const saved = Math.max(0, cmp.highest - row.total);
    const trip = { id: 'h' + Date.now(), day: s.day, retailer: row.r.id, total: +row.total.toFixed(2), saved: +saved.toFixed(2), items: bought.map(l => [l.pick.id, l.qty]), missing: row.missing.length };
    return { ...s, pantry, list: s.list.filter(i => !boughtIds.has(i.id)), history: [...s.history, trip], overrides: {}, reminder: null };
  }

  function weekly(s) {
    const w = weekOf(s.day);
    const trips = s.history.filter(h => weekOf(h.day) === w);
    const last = s.history.filter(h => weekOf(h.day) === w - 1);
    const spent = trips.reduce((a, h) => a + h.total, 0), saved = trips.reduce((a, h) => a + h.saved, 0);
    const lastSaved = last.reduce((a, h) => a + h.saved, 0);
    return { w, trips: trips.length, spent, saved, lastSaved, restocked: trips.reduce((a, h) => a + h.items.length, 0) };
  }

  window.ProxData = { RETAILERS, CATALOG, byId, DISCOVERY, STALE_DAYS, initialState, fmt, fmtQty, weekOf, dayLabel, search, genericMatches, unitPrice, suggestions, compare, discover, advance, completeTrip, weekly };
})();
