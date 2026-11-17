'use strict';
// How often do bots (by place, and current top-N against the rest) actually use the openings the rules give them?
const { eachGame, preyOf, predOf, pos, nearest, heading, itemOf, pc, bump, cell, dist, TOPN } = require('./lib/load');
const G = {}; const grp = k => G[k] = G[k] || {};
const smokeNetting = {}, smokeR = {};
const games = eachGame(g => {
  const { N, U, turns, T } = g; const smokes = [];
  for (let t = 1; t <= turns; t++) {
    const o = T[t];
    for (let u = 0; u < U; u++) {
      if (!g.alive(u, t)) continue;
      const me = g.owner(u), p = pos(g, t, u); if (!p) continue;
      const keys = ['PLACE ' + (g.place[me] + 1), g.top[me] ? 'top ' + TOPN : 'others']; if (g.top[me]) keys.push('@' + g.top[me].nickname);
      const th = nearest(g, t, u, predOf(me)), pr = nearest(g, t, u, preyOf(me));
      const dashed = o.dash.has(u), stuck = g.netted(u, t), ready = g.dashReady(u, t);
      const add = (name, yes) => { for (const k of keys) { const c = cell(grp(k), name, 'x'); c.n++; if (yes) c.y++; } };
      if (pr && !stuck && ready) {
        const pv = pr.v, pvNet = g.netted(pv, t), pvReady = g.dashReady(pv, t), toward = heading(g, t, u, pr.p) === 'toward';
        if (!pvNet && pr.d < 950) { add('A1 strike: free prey within 950, my dash ready -> I dash at it', dashed && toward); add('A2 ... and the prey is caught this turn', g.caught[pv] === t); if (!pvReady) add('A3 strike when the prey has NO dash -> I dash at it', dashed && toward); }
        if (pvNet && pr.d < 1600) { add('B1 netted prey within 1600, my dash ready -> I dash at it', dashed && toward); add('B2 ... -> I at least walk at it', toward); }
        if (!pvNet && pr.d >= 800 && pr.d < 1600) { const net = o.nets.some(n => n.u === u) || o.items.some(i => i.u === u && i.c === 'NET'); if (!pvReady) add('C1 prey 800-1600 with dash on cooldown -> I throw a net', net); else add('C2 prey 800-1600 that can dash -> I throw a net', net); }
      }
      if (th && !stuck && !g.netted(th.v, t)) {
        const hd = heading(g, t, u, th.p), thReady = g.dashReady(th.v, t);
        if (th.d < 1050 && thReady && ready) { add('D1 hunter with dash within 1050, my dash ready -> I dash away', dashed && hd === 'away'); add('D2 ... -> caught this turn', g.caught[u] === t); }
        if (th.d < 1050 && !thReady && ready) add('D3 hunter WITHOUT dash within 1050 -> I waste my dash anyway', dashed);
        if (th.d >= 1050 && th.d < 1700 && ready) add('D4 hunter 1050-1700 -> I spend my dash', dashed);
        if (th.d < 1800) { const item = o.items.find(i => i.u === u); add('E1 exposed (<1800) -> smoke ordered', !!item && item.c === 'SMOKE'); add('E2 exposed (<1800) -> walks toward / stands', hd === 'toward' || hd === 'stay'); const r = Math.hypot(p[0], p[1]); add('E3 exposed -> inside the wall ring (>6500)', r > 6500); }
        // getting netted, in smoke or not
        if (th.d < 2200) { const inS = smokes.some(s => t - s.t >= 1 && t - s.t <= 3 && dist(s.p, p) < 700); const c = cell(smokeNetting, inS ? 'inside smoke (<700 from a cloud placed 1-3 turns ago)' : 'in the open', 'x'); c.n++; if (g.netHits[u].includes(t)) c.y++; }
      }
      if (stuck) { const item = o.items.find(i => i.u === u); add('F1 I am netted -> I use an item myself', !!item); if (item) add('F2 ... which one: net', item.c === 'NET'); }
    }
    for (const n of o.nets) for (const v of n.units) { const q = n.land; let d = 1e9; for (const s of smokes) if (t - s.t >= 0 && t - s.t <= 3) d = Math.min(d, dist(s.p, q)); bump(smokeR, d < 400 ? 'a <400' : d < 800 ? 'b 400-800' : d < 1200 ? 'c 800-1200' : d < 2000 ? 'd 1200-2000' : 'e no smoke within 2000'); }
    for (const s of o.smokes) smokes.push({ t, p: s.target });
  }
});
console.log('games', games);
const cols = process.env.BOTS ? process.env.BOTS.split(',').map(x => '@' + x) : ['PLACE 1', 'PLACE 2', 'PLACE 3', 'top ' + TOPN, 'others'];
const names = [...new Set(cols.flatMap(c => Object.keys(G[c] || {})))].sort();
console.log('  ' + 'situation -> reaction'.padEnd(66) + cols.map(c => c.slice(0, 11).padStart(12)).join('') + '   n(all)');
for (const n of names) console.log('  ' + n.padEnd(66) + cols.map(c => { const x = (G[c] || {})[n]; return (x && x.x ? pc(x.x.y, x.x.n) : '-').padStart(12); }).join('') + '   ' + ['PLACE 1', 'PLACE 2', 'PLACE 3'].reduce((a, c) => a + ((G[c][n] || { x: { n: 0 } }).x.n), 0));
console.log('\nchance that an exposed unit (predator <2200) is netted this turn:');
for (const [k, v] of Object.entries(smokeNetting)) console.log('  ' + k.padEnd(60) + pc(v.x.y, v.x.n) + '  (' + v.x.n + ', netted ' + v.x.y + ')');
const tot = Object.values(smokeR).reduce((a, b) => a + b, 0);
console.log('where net hits land relative to the nearest recent smoke cloud: ' + Object.keys(smokeR).sort().map(k => `${k.slice(2)} ${pc(smokeR[k], tot)}`).join(' | '));
