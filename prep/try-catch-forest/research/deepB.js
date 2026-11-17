'use strict';
// Openings, formations, three-way dynamics, item economy, dash purposes, approach history, order of resolution.
const { eachGame, preyOf, predOf, pos, nearest, heading, itemOf, pc, f2, quant, bump, cell, dist } = require('./lib/load');
const PL = ['1st', '2nd', '3rd'];
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const startR = [], startPred = [], startPrey = [];
const open = [0, 1, 2].map(() => ({ seats: 0, units: 0, dash: 0, net: 0, smoke: 0, decoy: 0, wait: 0, netHit: 0 }));
const t1 = {}, firstCatchTurn = [], byN = {};
const form = {}, dyn = { lastIsPreyOfWinner: 0, lastIsPredOfWinner: 0 }, feed = [0, 1, 2].map(() => ({ n: 0, preyLost30: 0, predLost30: 0, predLost10: 0, preyLost10: 0, ownLost30: 0 }));
const econ = [0, 1, 2].map(() => ({})), left = [0, 1, 2].map(() => ({ NET: 0, SMOKE: 0, DECOY: 0, pool: { NET: 0, SMOKE: 0, DECOY: 0 }, n: 0 }));
const dashUse = [0, 1, 2].map(() => ({}));
const approach = {}, approachDist = {};
const order = { victimOrderedItem: 0, itemHappened: { NET: 0, SMOKE: 0, DECOY: 0 }, itemOrdered: { NET: 0, SMOKE: 0, DECOY: 0 } };
const smoke = [0, 1, 2].map(() => ({})), decoyRel = {}, destroyRel = {}, ghost = [0, 1, 2].map(() => ({ cmds: 0, active: 0, errors: 0, seats: 0 }));
const labelDist = [];
const phase = t => t <= 5 ? 'a turns 1-5' : t <= 20 ? 'b turns 6-20' : t <= 50 ? 'c turns 21-50' : 'd turns 51-100';
const elim = { games: 0, n: 0, hunterWins: 0, hunterCatchesAfter: [], thirdCatchesAfter: [] };
const tiePlace = { ties: 0, games: 0 };

const games = eachGame(g => {
  const { N, U, turns, T } = g;
  const nb = byN[N] = byN[N] || { games: 0, catches: 0, first: [], firstWins: 0, firstN: 0, elim: 0, tie: 0, turns: 0 };
  nb.games++; nb.turns += turns;
  // ---- opening ----
  for (let u = 0; u < U; u++) {
    const p = pos(g, 1, u); if (!p) continue;
    const me = g.owner(u); startR.push(Math.hypot(p[0], p[1]));
    const th = nearest(g, 1, u, predOf(me)), pr = nearest(g, 1, u, preyOf(me));
    if (th) startPred.push(th.d); if (pr) startPrey.push(pr.d);
    if (th) {
      const hd = heading(g, 1, u, th.p), dashed = T[1].dash.has(u);
      const k = (th.d < 1200 ? 'a predator <1200' : th.d < 1800 ? 'b predator 1200-1800' : th.d < 2600 ? 'c predator 1800-2600' : 'd predator >2600');
      const c = cell(t1, k, (dashed ? 'DASH ' : 'MOVE ') + hd + (itemOf(g, 1, u) ? ' + ' + itemOf(g, 1, u) : '')); c.n++; if (g.caught[u] && g.caught[u] <= 5) c.y++;
    }
  }
  for (let a = 0; a < 3; a++) {
    const o = open[g.place[a]], x = T[1]; o.seats++; o.units += N;
    o.dash += [...x.dash.keys()].filter(u => g.owner(u) === a).length;
    o.net += x.nets.filter(n => n.owner === a).length; o.netHit += x.nets.filter(n => n.owner === a && n.units.some(v => g.owner(v) !== a)).length;
    o.smoke += x.smokes.filter(n => n.owner === a).length; o.decoy += x.decoys.filter(n => n.owner === a).length;
    if (/^WAIT/.test(x.out[a].trim())) o.wait++;
  }
  // ---- catches timeline ----
  const lostBy = (team, tmax) => { let n = 0; for (let u = team * N; u < team * N + N; u++) if (g.caught[u] && g.caught[u] <= tmax) n++; return n; };
  let first = null, total = 0;
  for (let t = 1; t <= turns; t++) for (const c of T[t].catches) { total++; if (!first) first = { t, by: c.byOwner, v: c.vOwner }; }
  nb.catches += total;
  if (first) { firstCatchTurn.push(first.t); nb.first.push(first.t); nb.firstN++; if (g.place[first.by] === 0) nb.firstWins++; }
  const cat = [0, 1, 2].map(a => lostBy(preyOf(a), 100));
  const s = [...cat].sort((a, b) => b - a); tiePlace.games++; if (s[0] === s[1]) { tiePlace.ties++; nb.tie++; }
  const w = g.place.indexOf(0), l = g.place.indexOf(2);
  if (l === preyOf(w)) dyn.lastIsPreyOfWinner++; else dyn.lastIsPredOfWinner++;
  for (let a = 0; a < 3; a++) { const f = feed[g.place[a]]; f.n++; f.preyLost30 += lostBy(preyOf(a), 30) / N; f.predLost30 += lostBy(predOf(a), 30) / N; f.predLost10 += lostBy(predOf(a), 10) / N; f.preyLost10 += lostBy(preyOf(a), 10) / N; f.ownLost30 += lostBy(a, 30) / N; }
  // elimination
  for (let a = 0; a < 3; a++) if (lostBy(a, 100) >= N) {
    nb.elim++; elim.n++; let te = 0; for (let u = a * N; u < a * N + N; u++) te = Math.max(te, g.caught[u]);
    if (g.place[predOf(a)] === 0) elim.hunterWins++;
    let hunterLost = 0; for (let u = predOf(a) * N; u < predOf(a) * N + N; u++) if (g.caught[u] > te) hunterLost++;
    elim.hunterCatchesAfter.push(hunterLost / N);            // what the freed third team (hunter of the hunter) still catches
  }
  // ---- per turn ----
  const used = [0, 1, 2].map(() => ({ NET: 0, SMOKE: 0, DECOY: 0 }));
  for (let t = 1; t <= turns; t++) {
    const o = T[t];
    for (const n of o.nets) { used[n.owner].NET++; bump(econ[g.place[n.owner]], phase(t) + ' NET'); }
    for (const n of o.smokes) {
      used[n.owner].SMOKE++; bump(econ[g.place[n.owner]], phase(t) + ' SMOKE');
      const sm = smoke[g.place[n.owner]]; bump(sm, 'n'); const d = dist(n.at, n.target); bump(sm, d < 300 ? 'on self' : d < 1200 ? 'near (<1200)' : 'far');
      const th = nearest(g, t, n.u, predOf(n.owner)); bump(sm, th && th.d < 2400 ? 'predator within 2400' : 'no predator near');
      if (g.netted(n.u, t)) bump(sm, 'thrower netted');
      let mateNetted = false; for (let v = n.owner * N; v < n.owner * N + N; v++) { const vp = pos(g, t, v); if (g.alive(v, t) && g.netted(v, t + 1) && vp && dist(vp, n.target) < 900) mateNetted = true; } if (mateNetted) bump(sm, 'covers a netted unit');
    }
    for (const n of o.decoys) { used[n.owner].DECOY++; bump(econ[g.place[n.owner]], phase(t) + ' DECOY'); const th = nearest(g, t, n.u, predOf(n.owner)); bump(decoyRel, th && th.d < 2400 ? (heading(g, t, n.u, th.p) === 'away' ? 'predator near, unit flees' : 'predator near, unit does not flee') : 'no predator within 2400'); }
    for (const d of o.destroys) bump(destroyRel, d.byOwner === predOf(d.owner) ? 'by the owner\'s predator' : d.byOwner === preyOf(d.owner) ? 'by the owner\'s prey' : 'own team');
    for (const i of o.items) { bump(order.itemOrdered, i.c); }
    for (const k of [['nets', 'NET'], ['smokes', 'SMOKE'], ['decoys', 'DECOY']]) order.itemHappened[k[1]] += o[k[0]].length;
    for (const c of o.catches) if (o.items.some(i => i.u === c.v)) { order.victimOrderedItem++; const it = o.items.find(i => i.u === c.v).c; bump(order, 'victim ' + it + ' ordered'); if (itemOf(g, t, c.v)) bump(order, 'victim ' + it + ' executed'); }
    for (let a = 0; a < 3; a++) ghost[g.place[a]].errors += o.ghostItem[a];
    for (let u = 0; u < U; u++) {
      const me = g.owner(u), place = g.place[me], c = o.cmd.get(u);
      if (!g.alive(u, t)) { if (c) { const gp = ghost[place]; gp.cmds++; const pv = T[t - 1] && T[t - 1].cmd.get(u); if (pv && (pv.x !== c.x || pv.y !== c.y)) gp.active++; } continue; }
      const p = pos(g, t, u); if (!p) continue;
      // formation
      let nm = 1e9; for (let v = me * N; v < me * N + N; v++) { const q = pos(g, t, v); if (v !== u && g.alive(v, t) && q) nm = Math.min(nm, dist(p, q)); }
      const f = (form[phase(t)] = form[phase(t)] || [0, 1, 2].map(() => ({ n: 0, r: 0, wall: 0, mate: 0, mateN: 0, centre: 0 })))[place];
      const r = Math.hypot(p[0], p[1]); f.n++; f.r += r; if (r > 6500) f.wall++; if (r < 2500) f.centre++; if (nm < 1e9) { f.mate += nm; f.mateN++; }
      // dash purpose
      if (o.dash.has(u)) {
        const th = nearest(g, t, u, predOf(me)), pr = nearest(g, t, u, preyOf(me)); const du = dashUse[place]; bump(du, 'n');
        if (o.catches.some(x => x.by === u)) bump(du, 'catch this turn');
        else if (th && th.d < 2400 && heading(g, t, u, th.p) === 'away') bump(du, 'flee (predator <2400)');
        else if (pr && pr.d < 2400 && heading(g, t, u, pr.p) === 'toward') bump(du, 'chase (prey <2400)');
        else if (t <= 2) bump(du, 'opening (turn 1-2)');
        else bump(du, 'travel');
      }
      // labels with a distance (vision estimate)
      if (c && c.msg) { const m = c.msg.match(/\bd(\d{3,5})\b/); if (m) labelDist.push(+m[1]); }
    }
    // approach history for free victims
    for (const c of o.catches) {
      if (g.netted(c.v, t)) continue;
      const hist = []; let fleeTurns = 0, seenTurns = 0;
      for (let k = t; k >= Math.max(1, t - 5); k--) { const a = pos(g, k, c.by), b = pos(g, k, c.v); if (!a || !b) break; const d = dist(a, b); hist.push(d); if (d < 2400) { seenTurns++; if (heading(g, k, c.v, a) === 'away') fleeTurns++; } }
      if (hist.length < 4) continue;
      const far = hist[3];                                   // distance 3 turns before the catch turn
      const k = far > 3600 ? 'a hunter was >3600 away 3 turns earlier (fast approach / both closing)' : far > 2400 ? 'b hunter was 2400-3600 away 3 turns earlier' : far > 1500 ? 'c hunter was 1500-2400 away 3 turns earlier' : 'd hunter was already within 1500 for 3 turns (a chase)';
      bump(approach, k);
      const vp = pos(g, t, c.v); const wall = Math.hypot(vp[0], vp[1]) > 6500;
      let second = false; for (let q = predOf(g.owner(c.v)) * N; q < predOf(g.owner(c.v)) * N + N; q++) { const qp = pos(g, t, q); if (q !== c.by && g.alive(q, t) && qp && dist(qp, vp) < 2000) second = true; }
      const fl = seenTurns ? fleeTurns / seenTurns : 0;
      bump(approachDist, fl >= 0.75 ? (wall ? 'fled all the way, caught at the wall' : second ? 'fled all the way, second hunter cut it off' : 'fled all the way, outrun (dash / tree)') : fl >= 0.34 ? 'fled only part of the time' : 'did not flee at all (never reacted)');
      bump(approachDist, 'n');
    }
  }
  const pool = { NET: 0, SMOKE: 0, DECOY: 0 }; for (const u of used) for (const k of Object.keys(pool)) pool[k] = Math.max(pool[k], u[k]);
  for (let a = 0; a < 3; a++) { const L = left[g.place[a]]; L.n++; for (const k of Object.keys(pool)) { L[k] += used[a][k]; L.pool[k] += pool[k]; } ghost[g.place[a]].seats++; }
});

const h = (arr, edges) => edges.map((e, i) => `${i ? edges[i - 1] : 0}-${e}: ${pc(arr.filter(v => v >= (i ? edges[i - 1] : 0) && v < e).length, arr.length)}`).join('  ');
console.log('games', games);
console.log('\n== OPENING ==');
console.log('start distance from the centre:', h(startR, [1500, 3000, 4500, 6000, 9000]), ' median', Math.round(quant(startR, 0.5)));
console.log('start distance to the nearest predator:', h(startPred, [1200, 1800, 2600, 4000, 20000]), ' median', Math.round(quant(startPred, 0.5)));
console.log('start distance to the nearest prey:    ', h(startPrey, [1200, 1800, 2600, 4000, 20000]), ' median', Math.round(quant(startPrey, 0.5)));
PL.forEach((nm, i) => { const o = open[i]; console.log(`  turn 1, ${nm}: units dashing ${pc(o.dash, o.units)}; nets per team ${f2(o.net / o.seats)} (hit ${pc(o.netHit, o.net)}); smokes ${f2(o.smoke / o.seats)}; decoys ${f2(o.decoy / o.seats)}`); });
console.log('turn-1 order by distance of the nearest predator  [caught by turn 5]');
for (const r of Object.keys(t1).sort()) { console.log('  ' + r); for (const [c, v] of Object.entries(t1[r]).filter(e => e[1].n >= 40).sort((a, b) => b[1].n - a[1].n)) console.log('     ' + c.padEnd(26) + String(v.n).padStart(6) + '   ' + pc(v.y, v.n)); }
console.log('first catch of the game, turn: p10', quant(firstCatchTurn, 0.1), 'p25', quant(firstCatchTurn, 0.25), 'median', quant(firstCatchTurn, 0.5), 'p75', quant(firstCatchTurn, 0.75), 'p90', quant(firstCatchTurn, 0.9), ' games with no catch:', games - firstCatchTurn.length);
console.log('\n== BY UNITS PER TEAM ==');
for (const n of Object.keys(byN).sort()) { const b = byN[n]; console.log(`  ${n} units: ${b.games} games; catches per game ${f2(b.catches / b.games)}; first catch median turn ${quant(b.first, 0.5)}; first catcher wins ${pc(b.firstWins, b.firstN)}; a team wiped out ${pc(b.elim, b.games)}; top two tied on catches ${pc(b.tie, b.games)}`); }
console.log('\n== FORMATION (average over alive units) ==');
for (const ph of Object.keys(form).sort()) console.log('  ' + ph + ': ' + PL.map((nm, i) => { const f = form[ph][i]; return `${nm} radius ${Math.round(f.r / f.n)}, at wall ${pc(f.wall, f.n)}, centre ${pc(f.centre, f.n)}, nearest mate ${Math.round(f.mate / Math.max(1, f.mateN))}`; }).join(' | '));
console.log('\n== THREE-WAY DYNAMICS ==');
console.log(`last place is the winner's prey in ${pc(dyn.lastIsPreyOfWinner, games)} of games, the winner's predator in ${pc(dyn.lastIsPredOfWinner, games)}`);
PL.forEach((nm, i) => { const f = feed[i]; console.log(`  ${nm}: own units lost by turn 30: ${pc(f.ownLost30, f.n)}; its prey's units lost by 10/30: ${pc(f.preyLost10, f.n)}/${pc(f.preyLost30, f.n)}; its predator's units lost by 10/30: ${pc(f.predLost10, f.n)}/${pc(f.predLost30, f.n)}`); });
console.log(`teams wiped out: ${elim.n}; their hunter wins ${pc(elim.hunterWins, elim.n)}; after the wipe-out the hunter (now only prey) still loses ${pc(avg(elim.hunterCatchesAfter), 1)} of its units`);
console.log(`games where the top two have the same number of catches: ${pc(tiePlace.ties, tiePlace.games)}`);
console.log('\n== ITEM ECONOMY (per team per game) ==');
for (const k of ['NET', 'SMOKE', 'DECOY']) { console.log('  ' + k + ': ' + PL.map((nm, i) => `${nm} ` + ['a turns 1-5', 'b turns 6-20', 'c turns 21-50', 'd turns 51-100'].map(ph => f2((econ[i][ph + ' ' + k] || 0) / left[i].n)).join('/') + ` used ${pc(left[i][k], left[i].pool[k])} of pool`).join(' | ')); }
console.log('  (pool = the most any team used in that game; phases are turns 1-5 / 6-20 / 21-50 / 51-100)');
console.log('\n== DASH PURPOSE ==');
PL.forEach((nm, i) => { const d = dashUse[i]; console.log(`  ${nm}: ` + Object.keys(d).filter(k => k !== 'n').sort().map(k => `${k} ${pc(d[k], d.n)}`).join('; ') + `  (dashes ${d.n})`); });
console.log('\n== HOW FREE UNITS GET CAUGHT ==');
const an = Object.values(approach).reduce((a, b) => a + b, 0); for (const k of Object.keys(approach).sort()) console.log('  ' + k.slice(2).padEnd(76) + pc(approach[k], an));
for (const k of Object.keys(approachDist).filter(k => k !== 'n').sort((a, b) => approachDist[b] - approachDist[a])) console.log('  ' + k.padEnd(76) + pc(approachDist[k], approachDist.n));
console.log('\n== ORDER OF RESOLUTION ==');
console.log('items ordered vs executed:', JSON.stringify(order.itemOrdered), JSON.stringify(order.itemHappened));
console.log('victims that ordered an item on the turn they were caught:', JSON.stringify(Object.fromEntries(Object.entries(order).filter(e => typeof e[1] === 'number'))));
console.log('\n== SMOKE, DECOY, GHOSTS ==');
PL.forEach((nm, i) => { const s = smoke[i]; console.log(`  smoke ${nm}: on self ${pc(s['on self'], s.n)}, near ${pc(s['near (<1200)'], s.n)}, far ${pc(s.far, s.n)}; predator within 2400 of the thrower ${pc(s['predator within 2400'], s.n)}; covers a netted team-mate or itself ${pc((s['covers a netted unit'] || 0), s.n)}; thrower itself netted ${pc(s['thrower netted'] || 0, s.n)}`); });
const dn = Object.values(decoyRel).reduce((a, b) => a + b, 0); console.log('  decoys deployed when: ' + Object.entries(decoyRel).map(([k, v]) => `${k} ${pc(v, dn)}`).join('; '));
const xn = Object.values(destroyRel).reduce((a, b) => a + b, 0); console.log('  decoys destroyed: ' + Object.entries(destroyRel).map(([k, v]) => `${k} ${pc(v, xn)}`).join('; '));
PL.forEach((nm, i) => { const x = ghost[i]; console.log(`  ghosts ${nm}: orders that change target ${pc(x.active, x.cmds)}; "ghosts cannot use items" errors per game ${f2(x.errors / x.seats)}`); });
if (labelDist.length) console.log('  distances printed in unit labels (dNNNN): p50', quant(labelDist, 0.5), 'p90', quant(labelDist, 0.9), 'p99', quant(labelDist, 0.99), 'max', quant(labelDist, 1), 'n', labelDist.length);
