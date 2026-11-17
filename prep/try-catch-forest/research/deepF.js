'use strict';
// Combinations: per team per game, which mix of habits goes with winning.
const { eachGame, preyOf, predOf, pos, nearest, pc, dist } = require('./lib/load');
const combo = {}, single = {}, byN = {};
const add = (tab, k, place) => { const c = tab[k] = tab[k] || { n: 0, win: 0, last: 0 }; c.n++; if (place === 0) c.win++; if (place === 2) c.last++; };
const games = eachGame(g => {
  const { N, turns, T } = g;
  let firstBy = -1; for (let t = 1; t <= turns && firstBy < 0; t++) if (T[t].catches.length) firstBy = T[t].catches[0].byOwner;
  const pool = { net: 0, smoke: 0 }; const st = [0, 1, 2].map(() => ({ net: 0, net3: 0, smoke: 0, netted: 0, helped: 0, loss10: 0, hits: 0, conv: 0, preyHits: 0, lateNet: 0 }));
  for (let t = 1; t <= turns; t++) {
    const o = T[t];
    for (const n of o.nets) {
      const s = st[n.owner]; s.net++; if (t <= 3) s.net3++; if (t > 5) s.lateNet++;
      if (n.units.some(v => g.owner(v) !== n.owner)) s.hits++;
      for (const v of n.units) {
        if (g.owner(v) === preyOf(n.owner)) { s.preyHits++; if (g.caught[v] > t && g.caught[v] <= t + 4) s.conv++; }
        if (g.owner(v) === preyOf(n.owner)) { const vt = st[g.owner(v)]; vt.netted++; let saved = false; for (let k = t; k <= Math.min(turns, t + 3); k++) if (g.T[k].smokes.some(x => x.owner === g.owner(v) && dist(x.target, n.land) < 900) || g.T[k].nets.some(m => m.owner === g.owner(v) && m.units.some(x => g.owner(x) === n.owner))) saved = true; if (saved) vt.helped++; }
      }
    }
    for (const s of o.smokes) st[s.owner].smoke++;
  }
  for (let a = 0; a < 3; a++) { pool.net = Math.max(pool.net, st[a].net); pool.smoke = Math.max(pool.smoke, st[a].smoke); for (let u = a * N; u < a * N + N; u++) if (g.caught[u] && g.caught[u] <= 10) st[a].loss10++; }
  for (let a = 0; a < 3; a++) {
    const s = st[a], place = g.place[a];
    const f = {
      'first catch': firstBy === a,
      'no unit lost by turn 10': s.loss10 === 0,
      'half the nets or more in turns 1-3': s.net > 0 && s.net3 >= s.net / 2,
      'net hit rate 60 % or more': s.net > 0 && s.hits / s.net >= 0.6,
      'every net hit on prey converted': s.preyHits > 0 && s.conv === s.preyHits,
      'used all the smoke of the game': pool.smoke > 0 && s.smoke >= pool.smoke,
      'helped every netted unit': s.netted > 0 && s.helped === s.netted,
      'never got a unit netted': s.netted === 0,
    };
    for (const [k, v] of Object.entries(f)) add(single, (v ? 'YES ' : 'no  ') + k, place);
    const key = (f['no unit lost by turn 10'] ? 'safe opening' : 'lost early') + ' + ' + (f['first catch'] ? 'first catch' : 'no first catch') + ' + ' + (f['net hit rate 60 % or more'] ? 'accurate nets' : 'poor nets');
    add(combo, key, place);
    add(byN, N + ' units: ' + (f['first catch'] ? 'first catch' : 'no first catch') + ', ' + (f['no unit lost by turn 10'] ? 'safe opening' : 'lost early'), place);
  }
});
console.log('games', games);
const show = (title, tab) => { console.log('\n' + title); for (const [k, c] of Object.entries(tab).sort((a, b) => a[0] < b[0] ? -1 : 1)) console.log('  ' + k.padEnd(62) + String(c.n).padStart(6) + '   win ' + pc(c.win, c.n).padStart(4) + '   last ' + pc(c.last, c.n).padStart(4)); };
const sorted = Object.fromEntries(Object.entries(single).sort((a, b) => a[0].slice(4) < b[0].slice(4) ? -1 : a[0].slice(4) > b[0].slice(4) ? 1 : (a[0] < b[0] ? 1 : -1)));
console.log('\n== SINGLE HABITS (per team per game) ==');
for (const [k, c] of Object.entries(sorted)) console.log('  ' + k.padEnd(62) + String(c.n).padStart(6) + '   win ' + pc(c.win, c.n).padStart(4) + '   last ' + pc(c.last, c.n).padStart(4));
show('== COMBINATIONS ==', combo);
show('== BY UNITS PER TEAM ==', byN);
