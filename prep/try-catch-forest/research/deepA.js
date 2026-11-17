'use strict';
// Situations: rule probes, what a threatened unit does and whether it survives, what a hunter does and whether
// it converts, how nets are aimed, and the anatomy of every catch.
const { eachGame, preyOf, predOf, pos, nearest, heading, itemOf, pc, quant, bump, cell, dist } = require('./lib/load');
const dB = d => d < 1200 ? 'a <1200' : d < 1800 ? 'b 1200-1800' : d < 2400 ? 'c 1800-2400' : 'd 2400-3000';
const R = { catchEnd: [], catchStartDash: [], catchStartMove: [], nettedItems: {}, nettedCatch: 0, catches: 0, bad: new Map() };
const threat = {}, threatSimple = {}, threatPlace = [{}, {}, {}], attack = {}, attackPlace = [{}, {}, {}];
const netAim = {}, netMotion = {}, netWhy = {}, netConv = {}, netConvPlace = [{}, {}, {}], nettedOwn = {}, netDist = {};
const anat = { all: {}, top: {}, rest: {} }; let anatN = { all: 0, top: 0, rest: 0 };
const expo = [{ n: 0, y: 0 }, { n: 0, y: 0 }, { n: 0, y: 0 }];

function segInfo(a, b, p) {                       // along (distance from a) and perpendicular offset of p for line a->b
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  const along = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l;
  return { along, perp: Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / l, len: l };
}
const died3 = (g, u, t) => g.caught[u] && g.caught[u] >= t && g.caught[u] <= t + 2;

const games = eachGame(g => {
  const { N, U, turns, T } = g;
  for (let t = 1; t <= turns; t++) {
    const o = T[t];
    for (const x of o.other) if (x.startsWith('BADCMD')) { const raw = o.out[+x.split(' ')[1]].split(';').find(c => c.trim() && !/^(MOVE|DASH|NET|SMOKE|DECOY)\s+\d+\s+-?\d+\s+-?\d+/.test(c.trim())); bump(R, 'badCount'); if (raw && R.bad.size < 400) R.bad.set(raw.trim().replace(/-?\d+/g, 'N').slice(0, 40), (R.bad.get(raw.trim().replace(/-?\d+/g, 'N').slice(0, 40)) || 0) + 1); }
    // ---- netted units: can they use items or catch? ----
    for (const k of ['nets', 'smokes', 'decoys']) for (const e of o[k]) if (g.netted(e.u, t)) bump(R.nettedItems, k);
    // ---- per unit situations ----
    for (let u = 0; u < U; u++) {
      if (!g.alive(u, t)) continue;
      const me = g.owner(u), p = pos(g, t, u); if (!p) continue;
      const place = g.place[me];
      const th = nearest(g, t, u, predOf(me)), pr = nearest(g, t, u, preyOf(me));
      const item = itemOf(g, t, u), dashed = o.dash.has(u), ready = g.dashReady(u, t), stuck = g.netted(u, t);
      expo[place].n++;
      if (th && th.d < 3000 && !g.netted(th.v, t)) {
        if (th.d < 1800) expo[place].y++;
        const hd = heading(g, t, u, th.p);
        const mv = stuck ? 'NETTED' : (dashed ? 'DASH-' : 'MOVE-') + hd;
        let it = item; if (item === 'NET') { const n = o.nets.find(n => n.u === u); it = n.units.some(v => g.owner(v) === predOf(me)) ? 'NET(hit predator)' : 'NET(other)'; }
        const c = cell(threat, dB(th.d), mv + (it ? ' + ' + it : '')); c.n++; if (died3(g, u, t)) c.y++;
        if (!stuck) {
          const s1 = cell(threatSimple, dB(th.d) + (g.dashReady(th.v, t) ? ' predator can dash' : ' predator cannot dash'), ready ? (dashed && hd === 'away' ? 'dash away' : dashed ? 'dash elsewhere' : 'keep dash, walk ' + hd) : 'no dash, walk ' + hd);
          s1.n++; if (died3(g, u, t)) s1.y++;
          if (th.d < 1800) { const tp = threatPlace[place]; bump(tp, 'n'); if (ready) bump(tp, 'ready'); if (dashed && hd === 'away') bump(tp, 'dashAway'); if (hd === 'toward') bump(tp, 'toward'); if (hd === 'stay') bump(tp, 'stay'); if (item) bump(tp, item); if (died3(g, u, t)) bump(tp, 'died'); }
        }
      }
      if (pr && pr.d < 3000 && !stuck) {
        const hd = heading(g, t, u, pr.p), vn = g.netted(pr.v, t);
        const mv = (dashed ? 'DASH-' : 'MOVE-') + hd;
        const key = dB(pr.d) + (vn ? ' prey netted' : ' prey free');
        const c = cell(attack, key, mv + (item === 'NET' ? ' + NET' : '')); c.n++; if (died3(g, pr.v, t)) c.y++;
        if (pr.d < 1800) { const ap = attackPlace[place]; bump(ap, 'n'); if (ready) bump(ap, 'ready'); if (dashed && hd === 'toward') bump(ap, 'dashToward'); if (hd === 'away') bump(ap, 'away'); if (item === 'NET') bump(ap, 'net'); if (died3(g, pr.v, t)) bump(ap, 'caught'); }
      }
    }
    // ---- nets: who was the target, how was it aimed, why did it miss ----
    for (const n of o.nets) {
      const me = n.owner; let target = null;
      if (n.units.length) target = n.units[0];
      else { let best = 1e9; for (let v = 0; v < U; v++) { if (g.owner(v) === me || !g.alive(v, t)) continue; const q = pos(g, t, v); if (!q) continue; const s = segInfo(n.from, n.aim, q); const d = s.along < -300 || s.along > 2600 ? 1e9 : s.perp; if (d < best) { best = d; target = v; } } if (best > 900) target = null; }
      const hitUnit = n.units.some(v => g.owner(v) !== me);
      const lenAim = dist(n.from, n.aim);
      bump(netDist, (lenAim < 750 ? 'a <750' : lenAim < 1500 ? 'b 750-1500' : lenAim < 1950 ? 'c 1500-1950' : 'd full range') + (hitUnit ? ' hit' : ' miss'));
      if (target === null) { bump(netWhy, 'no enemy near the line (blind throw)'); continue; }
      const q0 = pos(g, t, target), q1 = pos(g, t + 1, target) || q0; if (!q0) continue;
      const moved = dist(q0, q1), s0 = segInfo(n.from, n.aim, q0), s1 = segInfo(n.from, n.aim, q1);
      const style = dist(n.aim, q0) < 150 ? 'aimed at where the target stood' : lenAim >= 1950 && s0.along < lenAim - 300 ? 'aimed long, through the target' : s0.along >= lenAim - 300 && dist(n.aim, q0) >= 150 ? 'aimed with a lead / offset' : 'other';
      const motion = g.netted(target, t) ? 'target already netted' : moved < 100 ? 'target stood still' : Math.abs(s1.perp - s0.perp) < 250 ? 'target moved along the line' : 'target moved across the line';
      const c1 = cell(netAim, style, 'x'); c1.n++; if (hitUnit) c1.y++;
      const c2 = cell(netMotion, motion, g.T[t].dash.has(target) ? 'dashed' : 'walked'); c2.n++; if (hitUnit) c2.y++;
      if (!hitUnit) bump(netWhy, n.decoys ? 'absorbed by a decoy' : n.miss === 'tree' ? 'stopped by a tree' : s1.along > lenAim + 470 ? 'stopped short of the target' : s1.perp > 470 ? 'target stepped out of the line' : 'other');
      else bump(netWhy, 'HIT');
      // conversion of hits on prey
      for (const v of n.units) {
        if (g.owner(v) !== preyOf(me)) continue;
        let best = 1e9; const vp = n.land;
        for (let h = me * N; h < me * N + N; h++) { if (!g.alive(h, t + 1) || g.netted(h, t + 1)) continue; const hp = pos(g, t + 1, h); if (hp) best = Math.min(best, dist(hp, vp)); }
        const k = best < 1200 ? 'a <1200' : best < 1800 ? 'b 1200-1800' : best < 2400 ? 'c 1800-2400' : best < 3600 ? 'd 2400-3600' : 'e >3600';
        const conv = g.caught[v] > t && g.caught[v] <= t + 4;
        const c = cell(netConv, k, 'x'); c.n++; if (conv) c.y++;
        bump(netConvPlace[g.place[me]], 'n'); if (conv) bump(netConvPlace[g.place[me]], 'y'); if (best < 1800) bump(netConvPlace[g.place[me]], 'near');
      }
      // own units netted by the predator: does the team save them?
      for (const v of n.units) {
        if (g.owner(v) !== preyOf(me)) continue;
        const vt = g.owner(v); let smoke = false, counter = false;
        for (let k = t; k <= Math.min(turns, t + 3); k++) {
          if (g.T[k].smokes.some(s => s.owner === vt && dist(s.target, n.land) < 900)) smoke = true;
          if (g.T[k].nets.some(m => m.owner === vt && m.units.some(x => g.owner(x) === me))) counter = true;
        }
        const c = cell(nettedOwn, (smoke ? 'smoke on it' : 'no smoke') + ', ' + (counter ? 'hunter netted back' : 'no counter-net'), 'x'); c.n++; if (g.caught[v] > t && g.caught[v] <= t + 5) c.y++;
      }
    }
    // ---- catches ----
    for (const c of o.catches) {
      R.catches++;
      if (g.netted(c.by, t)) R.nettedCatch++;
      const cp = pos(g, t, c.by), vp = pos(g, t, c.v); if (!cp || !vp) continue;
      const d0 = dist(cp, vp), dashed = o.dash.has(c.by);
      (dashed ? R.catchStartDash : R.catchStartMove).push(d0);
      const cmd = o.cmd.get(c.by);
      if (cmd && g.P[t][c.by].age <= 2) { const s = dashed ? 1200 : 600, dd = dist(cp, [cmd.x, cmd.y]); const e = dd <= s ? [cmd.x, cmd.y] : [cp[0] + (cmd.x - cp[0]) * s / dd, cp[1] + (cmd.y - cp[1]) * s / dd]; R.catchEnd.push(dist(e, c.pos)); }
      const me = g.owner(c.v), isTop = !!g.top[me];
      const hd = heading(g, t, c.v, cp), vDash = o.dash.has(c.v), ready = g.dashReady(c.v, t), stuck = g.netted(c.v, t);
      const myPrey = nearest(g, t, c.v, preyOf(me));
      let others = 0; for (let q = predOf(me) * N; q < predOf(me) * N + N; q++) { const qp = pos(g, t, q); if (q !== c.by && g.alive(q, t) && qp && dist(qp, vp) < 2500) others++; }
      let mates = 0; for (let q = me * N; q < me * N + N; q++) { const qp = pos(g, t, q); if (q !== c.v && g.alive(q, t) && qp && dist(qp, vp) < 1200) mates++; }
      const tags = [];
      tags.push(stuck ? '1 held by a net' : ready && !vDash ? '2 free, dash available but not used' : vDash ? '3 free, dashed this turn' : '4 free, dash on cooldown');
      if (!stuck) tags.push('move: ' + hd);
      tags.push(d0 < 1100 ? 'start distance <1100' : d0 < 1700 ? 'start distance 1100-1700' : 'start distance >1700');
      if (dashed) tags.push('hunter dashed');
      if (others) tags.push('second hunter within 2500');
      if (mates) tags.push('a team-mate within 1200');
      if (Math.hypot(vp[0], vp[1]) > 6500) tags.push('at the wall (>6500)');
      if (myPrey && myPrey.d < 1800 && heading(g, t, c.v, myPrey.p) === 'toward') tags.push('was chasing its own prey');
      if (itemOf(g, t, c.v) || o.items.some(i => i.u === c.v)) tags.push('ordered an item this turn (lost)');
      for (const grp of ['all', isTop ? 'top' : 'rest']) { anatN[grp]++; for (const tg of tags) bump(anat[grp], tg); }
    }
  }
});

const show = (title, tab, min = 40, yName = 'caught within 3 turns') => {
  console.log('\n' + title + '  [' + yName + ']');
  for (const r of Object.keys(tab).sort()) {
    const cols = Object.entries(tab[r]).filter(e => e[1].n >= min).sort((a, b) => b[1].n - a[1].n);
    if (!cols.length) continue;
    console.log('  ' + r);
    for (const [c, v] of cols) console.log('     ' + (c === 'x' ? '' : c).padEnd(34) + String(v.n).padStart(7) + '   ' + pc(v.y, v.n));
  }
};
console.log('games', games, 'catches', R.catches);
console.log('\n== RULE PROBES ==');
console.log(`catch distance (hunter's end position to the catch point): median ${Math.round(quant(R.catchEnd, 0.5))}, p75 ${Math.round(quant(R.catchEnd, 0.75))}, p90 ${Math.round(quant(R.catchEnd, 0.9))}, p97 ${Math.round(quant(R.catchEnd, 0.97))}  (n=${R.catchEnd.length})`);
console.log(`distance hunter-victim at the START of the catch turn, hunter dashed: median ${Math.round(quant(R.catchStartDash, 0.5))}, p90 ${Math.round(quant(R.catchStartDash, 0.9))}, p98 ${Math.round(quant(R.catchStartDash, 0.98))} (n=${R.catchStartDash.length}); hunter walked: median ${Math.round(quant(R.catchStartMove, 0.5))}, p90 ${Math.round(quant(R.catchStartMove, 0.9))}, p98 ${Math.round(quant(R.catchStartMove, 0.98))} (n=${R.catchStartMove.length})`);
console.log('items used by a unit while it was held by a net:', JSON.stringify(R.nettedItems), '; catches made by a netted hunter:', R.nettedCatch);
console.log('unparsed commands:', R.badCount || 0, [...R.bad].sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0] + ' x' + e[1]).join(' | '));
show('== THREAT: nearest predator at distance d, what the unit did ==', threat, 60);
show('== THREAT, simplified: dash discipline ==', threatSimple, 60);
console.log('\n== THREAT by final place (unit-turns with a free predator within 1800) ==');
['1st', '2nd', '3rd'].forEach((nm, i) => { const x = threatPlace[i]; console.log(`  ${nm}: exposure ${pc(expo[i].y, expo[i].n)} of unit-turns; dash available ${pc(x.ready, x.n)}; dashed away ${pc(x.dashAway, x.n)}; walked toward ${pc(x.toward, x.n)}; stood ${pc(x.stay, x.n)}; SMOKE ${pc(x.SMOKE, x.n)}; NET ${pc(x.NET, x.n)}; DECOY ${pc(x.DECOY, x.n)}; caught within 3 turns ${pc(x.died, x.n)}`); });
show('== ATTACK: nearest prey at distance d, what the hunter did ==', attack, 60, 'prey caught within 3 turns');
console.log('\n== ATTACK by final place (unit-turns with prey within 1800) ==');
['1st', '2nd', '3rd'].forEach((nm, i) => { const x = attackPlace[i]; console.log(`  ${nm}: opportunities ${x.n}; dash available ${pc(x.ready, x.n)}; dashed toward ${pc(x.dashToward, x.n)}; moved away ${pc(x.away, x.n)}; threw a net ${pc(x.net, x.n)}; prey caught within 3 turns ${pc(x.caught, x.n)}`); });
console.log('\n== NETS ==');
console.log('aim length -> result:', Object.keys(netDist).sort().map(k => k + ' ' + netDist[k]).join(' | '));
show('how the net was aimed', netAim, 20, 'hit an enemy unit');
show('what the target did that turn', netMotion, 20, 'hit an enemy unit');
const tot = Object.values(netWhy).reduce((a, b) => a + b, 0); console.log('\nresult of every net: ' + Object.entries(netWhy).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${pc(v, tot)}`).join(' | '));
show('net hit on prey: distance of the nearest free hunter to the netted unit', netConv, 20, 'caught within 4 turns');
['1st', '2nd', '3rd'].forEach((nm, i) => { const x = netConvPlace[i]; console.log(`  ${nm}: net hits on prey ${x.n}, a hunter within 1800 in ${pc(x.near, x.n)}, converted ${pc(x.y, x.n)}`); });
show('own unit netted by its predator: what the team did in the next 3 turns', nettedOwn, 20, 'caught within 5 turns');
console.log('\n== ANATOMY OF A CATCH (share of catches) ==');
const keys = Object.keys(anat.all).sort();
console.log('  ' + 'tag'.padEnd(46) + 'all'.padStart(6) + 'top victims'.padStart(13) + 'other victims'.padStart(15) + `   (n=${anatN.all}/${anatN.top}/${anatN.rest})`);
for (const k of keys) console.log('  ' + k.padEnd(46) + pc(anat.all[k], anatN.all).padStart(6) + pc(anat.top[k] || 0, anatN.top).padStart(13) + pc(anat.rest[k] || 0, anatN.rest).padStart(15));
