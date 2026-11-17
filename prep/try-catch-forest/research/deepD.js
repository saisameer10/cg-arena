'use strict';
// Targeted probes: strike distance, net timing, pincers, wall, smoke cover, third-team effect, sight range.
const { eachGame, preyOf, predOf, pos, nearest, heading, itemOf, pc, quant, bump, cell, dist } = require('./lib/load');
const strike = {}, netT = {}, pin = {}, pack = {}, wall = {}, smokeCover = {}, third = {}, fleeFine = {}, itemFine = {}, netFine = {}, corner = {}, smokeNet = {}, lastStand = {};
const b100 = (d, lo, hi, s) => d < lo || d >= hi ? null : Math.floor(d / s) * s;
const died3 = (g, u, t) => g.caught[u] && g.caught[u] >= t && g.caught[u] <= t + 2;
const count = (g, t, p, team, r) => { let n = 0; for (let v = team * g.N; v < team * g.N + g.N; v++) { const q = pos(g, t, v); if (g.alive(v, t) && !g.netted(v, t) && q && dist(p, q) < r) n++; } return n; };

const games = eachGame(g => {
  const { N, U, turns, T } = g;
  const smokes = [];                                      // {t, p, owner}
  for (let t = 1; t <= turns; t++) {
    const o = T[t];
    for (let u = 0; u < U; u++) {
      if (!g.alive(u, t)) continue;
      const me = g.owner(u), p = pos(g, t, u); if (!p) continue;
      const th = nearest(g, t, u, predOf(me)), pr = nearest(g, t, u, preyOf(me));
      const dashed = o.dash.has(u), stuck = g.netted(u, t), c = o.cmd.get(u);
      // ---- strike distance: hunter heads for free prey; is it caught THIS turn? ----
      if (pr && !stuck && !g.netted(pr.v, t) && pr.d < 2100 && heading(g, t, u, pr.p) === 'toward') {
        const b = Math.floor(pr.d / 150) * 150, ph = heading(g, t, pr.v, p);
        const k = (dashed ? 'hunter DASH' : 'hunter MOVE') + ', prey ' + (o.dash.has(pr.v) ? 'dashes ' : 'walks ') + (ph === 'away' ? 'away' : ph === 'toward' ? 'toward' : 'side/stays');
        const x = cell(strike, k, String(b).padStart(4, '0')); x.n++; if (g.caught[pr.v] === t && g.caughtBy[pr.v] === u) x.y++;
      }
      // ---- exposed unit: pincer, wall, smoke cover, third team ----
      if (th && th.d < 1800 && !g.netted(th.v, t) && !stuck) {
        const np = count(g, t, p, predOf(me), 2400);
        const x1 = cell(pin, np >= 3 ? '3+ hunters within 2400' : np === 2 ? '2 hunters within 2400' : '1 hunter within 2400', 'x'); x1.n++; if (died3(g, u, t)) x1.y++;
        const r = Math.hypot(p[0], p[1]);
        const x2 = cell(wall, r < 3000 ? 'a centre (<3000)' : r < 5000 ? 'b 3000-5000' : r < 6500 ? 'c 5000-6500' : 'd wall ring (>6500)', 'x'); x2.n++; if (died3(g, u, t)) x2.y++;
        // heading relative to the wall when in the outer half
        if (r > 5000 && c) { const out = (c.x - p[0]) * p[0] + (c.y - p[1]) * p[1]; const x5 = cell(corner, out > 0 ? 'outer half, moves further out' : 'outer half, moves back in', 'x'); x5.n++; if (died3(g, u, t)) x5.y++; }
        const inSmoke = smokes.some(s => t - s.t >= 1 && t - s.t <= 3 && dist(s.p, p) < 700);
        const x3 = cell(smokeCover, inSmoke ? 'inside smoke placed 1-3 turns ago' : 'no smoke', th.d < 1200 ? 'predator <1200' : 'predator 1200-1800'); x3.n++; if (died3(g, u, t)) x3.y++;
        // is the hunter itself threatened by the third team (my prey hunts my predator)?
        const hp = th.p, danger = count(g, t, hp, preyOf(me), 1800);
        const x4 = cell(third, danger ? 'my hunter has its own hunter within 1800' : 'my hunter is safe', 'x'); x4.n++; if (died3(g, u, t)) x4.y++;
        const fb = b100(th.d, 0, 1800, 300);
        if (N - [...Array(N).keys()].filter(i => g.caught[me * N + i] && g.caught[me * N + i] < t).length === 1) { const x6 = cell(lastStand, 'last unit of its team', 'x'); x6.n++; if (died3(g, u, t)) x6.y++; }
      }
      // ---- pack hunting: prey within 1800 of this hunter; how many free hunters within 1800 of the prey ----
      if (pr && pr.d < 1800 && !stuck && !g.netted(pr.v, t)) {
        const nh = count(g, t, pr.p, me, 1800);
        const x = cell(pack, nh >= 3 ? '3+ hunters within 1800 of the prey' : nh === 2 ? '2 hunters within 1800 of the prey' : '1 hunter', 'x'); x.n++; if (died3(g, pr.v, t)) x.y++;
      }
      // ---- sight range probes ----
      if (th && c && c.msg && /flee|hunt|seek|chase|scout|search|patrol|explore/i.test(c.msg)) { const b = b100(th.d, 1200, 3600, 150); if (b !== null) { const f = fleeFine[b] = fleeFine[b] || { n: 0, y: 0 }; f.n++; if (/flee|escape|run|avoid/i.test(c.msg)) f.y++; } }
      if (th && (itemOf(g, t, u) === 'SMOKE' || itemOf(g, t, u) === 'DECOY')) { const b = Math.min(4500, Math.floor(th.d / 300) * 300); bump(itemFine, b); }
    }
    // ---- nets: does it matter whether the target can dash, and how far it is ----
    for (const n of o.nets) {
      const me = n.owner; let target = null;
      if (n.units.length && g.owner(n.units[0]) !== me) target = n.units[0];
      else { let best = 1e9; for (let v = 0; v < U; v++) { if (g.owner(v) === me || !g.alive(v, t)) continue; const q = pos(g, t, v); if (!q) continue; const d = dist(q, n.aim) < 700 ? dist(q, n.aim) : 1e9; if (d < best) { best = d; target = v; } } }
      if (target === null) continue;
      const q0 = pos(g, t, target), sp = pos(g, t, n.u); if (!q0) continue;
      const hit = n.units.includes(target);
      const state = g.netted(target, t) ? 'c already netted' : g.dashReady(target, t) ? 'a can dash' : 'b dash on cooldown';
      const x = cell(netT, state, 'x'); x.n++; if (hit) x.y++;
      if (sp) { const d = dist(sp, q0), b = d < 800 ? 'a <800' : d < 1400 ? 'b 800-1400' : d < 2000 ? 'c 1400-2000' : d < 2600 ? 'd 2000-2600' : 'e >2600'; const y = cell(netFine, b, state.slice(2)); y.n++; if (hit) y.y++; }
      const inSmoke = smokes.some(s => t - s.t >= 0 && t - s.t <= 3 && dist(s.p, q0) < 700);
      const z = cell(smokeNet, inSmoke ? 'target inside smoke' : 'target in the open', 'x'); z.n++; if (hit) z.y++;
    }
    for (const s of o.smokes) smokes.push({ t, p: s.target, owner: s.owner });
  }
});
const show = (title, tab, yName, min = 30) => {
  console.log('\n' + title + '  [' + yName + ']');
  for (const r of Object.keys(tab).sort()) {
    const cols = Object.entries(tab[r]).filter(e => e[1].n >= min).sort((a, b) => a[0] < b[0] ? -1 : 1);
    if (!cols.length) continue;
    if (cols.length === 1 && cols[0][0] === 'x') console.log('  ' + r.padEnd(46) + String(cols[0][1].n).padStart(7) + '   ' + pc(cols[0][1].y, cols[0][1].n));
    else console.log('  ' + r.padEnd(40) + cols.map(([c, v]) => `${c}: ${pc(v.y, v.n)} (${v.n})`).join('  '));
  }
};
console.log('games', games);
show('== STRIKE DISTANCE: hunter heads for free prey at start distance d ==', strike, 'caught this very turn', 40);
show('== NETS: target state ==', netT, 'hit');
show('== NETS: distance thrower to target at the start of the turn x target state ==', netFine, 'hit');
show('== NETS: target in smoke? ==', smokeNet, 'hit');
show('== EXPOSED UNIT (predator <1800): number of hunters ==', pin, 'caught within 3 turns');
show('== EXPOSED UNIT: where on the map ==', wall, 'caught within 3 turns');
show('== EXPOSED UNIT in the outer half: direction ==', corner, 'caught within 3 turns');
show('== EXPOSED UNIT: smoke cover ==', smokeCover, 'caught within 3 turns');
show('== EXPOSED UNIT: is its hunter being hunted? ==', third, 'caught within 3 turns');
show('== EXPOSED UNIT: last unit of the team ==', lastStand, 'caught within 3 turns');
show('== PACK: free prey within 1800 of a hunter ==', pack, 'caught within 3 turns');
console.log('\n== SIGHT RANGE PROBES ==');
console.log('share of labelled units in a FLEE state by distance to the nearest predator:\n  ' + Object.keys(fleeFine).map(Number).sort((a, b) => a - b).map(b => `${b}: ${pc(fleeFine[b].y, fleeFine[b].n)}`).join('  '));
const tot = Object.values(itemFine).reduce((a, b) => a + b, 0);
console.log('smoke/decoy deployments by distance of the nearest predator:\n  ' + Object.keys(itemFine).map(Number).sort((a, b) => a - b).map(b => `${b}: ${pc(itemFine[b], tot)}`).join('  '));
