'use strict';
// Team profiles (current top-N bots and every team with enough games), correlation of each habit with the win
// rate, and two probes: sight range (from HUNT/FLEE labels) and what ghosts are used for.
const fs = require('fs'), path = require('path');
const { eachGame, preyOf, predOf, pos, nearest, heading, itemOf, pc, f2, quant, bump, dist, TOPN, ROOT } = require('./lib/load');
const teams = new Map();
const Z = () => new Proxy({}, { get: (o, k) => (k in o ? o[k] : 0) });
const team = k => { if (!teams.has(k)) teams.set(k, Z()); return teams.get(k); };
const huntBy = {}, fleeBy = {}; const ghostNear = { n: 0, prey: 0, pred: 0, any: 0 }, aliveNear = { n: 0, any: 0 };
const died3 = (g, u, t) => g.caught[u] && g.caught[u] >= t && g.caught[u] <= t + 2;

const games = eachGame(g => {
  const { N, U, turns, T } = g;
  let first = null; for (let t = 1; t <= turns && !first; t++) if (T[t].catches.length) first = T[t].catches[0].byOwner;
  for (let a = 0; a < 3; a++) {
    const row = g.top[a];
    const keys = [row ? `#${String(row.rank).padStart(2, '0')} ${row.nickname} [${g.names[a]}] ${row.language}` : `     ${g.names[a]} (older version or lower rank)`, row ? 'ALL current top ' + TOPN : 'ALL others', 'PLACE ' + (g.place[a] + 1)];
    const S = Z(); S.games = 1; S.units = N;
    if (g.place[a] === 0) S.win = 1; if (g.place[a] === 2) S.last = 1; if (first === a) S.firstCatch = 1;
    for (let u = a * N; u < a * N + N; u++) if (g.caught[u]) { S.losses++; if (g.caught[u] <= 10) S.earlyLoss++; if (T[g.caught[u]].items.some(i => i.u === u && i.c !== 'DECOY')) S.lateItem++; }
    for (let u = preyOf(a) * N; u < preyOf(a) * N + N; u++) if (g.caught[u]) { S.catches++; if (g.caught[u] <= 10) S.earlyCatch++; }
    for (let t = 1; t <= turns; t++) {
      const o = T[t];
      if (/^WAIT/.test(o.out[a].trim())) S.waits++;
      for (const n of o.nets) if (n.owner === a) {
        S.nets++; if (t <= 3) S.nets3++; if (t === 1) S.netT1++; if (dist(n.from, n.aim) >= 1950) S.netFull++;
        if (n.units.some(v => g.owner(v) !== a)) S.netHit++;
        for (const v of n.units) { if (g.owner(v) === preyOf(a)) { S.netPrey++; if (g.caught[v] > t && g.caught[v] <= t + 4) S.netConv++; } else if (g.owner(v) === predOf(a)) S.netDef++; else S.netOwn++; }
      } else for (const v of n.units) if (g.owner(v) === a && n.owner === predOf(a)) {
        S.ownNetted++; let saved = false;
        for (let k = t; k <= Math.min(turns, t + 3); k++) if (g.T[k].smokes.some(s => s.owner === a && dist(s.target, n.land) < 900) || g.T[k].nets.some(m => m.owner === a && m.units.some(x => g.owner(x) === predOf(a)))) saved = true;
        if (saved) S.ownNettedHelped++; if (g.caught[v] > t && g.caught[v] <= t + 5) S.ownNettedCaught++;
      }
      for (const s of o.smokes) if (s.owner === a) { S.smokes++; if (t <= 5) S.smokes5++; if (dist(s.at, s.target) < 300) S.smokeSelf++; }
      for (const d of o.decoys) if (d.owner === a) { S.decoys++; if (t <= 3) S.decoys3++; }
      const targets = new Map();
      for (let u = a * N; u < a * N + N; u++) {
        const c = o.cmd.get(u);
        if (!g.alive(u, t)) {
          if (c) { const all = []; for (let v = 0; v < U; v++) if (g.owner(v) !== a && g.alive(v, t) && pos(g, t, v)) all.push(v); if (all.length) { ghostNear.n++; let near = false; for (const v of all) if (dist([c.x, c.y], pos(g, t, v)) < 1000) { near = true; if (g.owner(v) === preyOf(a)) ghostNear.prey++; else ghostNear.pred++; break; } if (near) ghostNear.any++; } }
          continue;
        }
        if (c) { if (c.c === 'DASH') S.dashCmd++; S.moveCmd++; const k = c.x + ',' + c.y; targets.set(k, (targets.get(k) || 0) + 1); }
        if (o.dash.has(u)) { S.dashes++; if (t === 1) S.t1dash++; }
        const p = pos(g, t, u); if (!p) continue;
        S.ut++; const r = Math.hypot(p[0], p[1]); if (r > 6500) S.wall++;
        if (t >= 6 && t <= 50) { let nm = 1e9; for (let v = a * N; v < a * N + N; v++) { const q = pos(g, t, v); if (v !== u && g.alive(v, t) && q) nm = Math.min(nm, dist(p, q)); } if (nm < 1e9) { S.mate += nm; S.mateN++; } }
        const th = nearest(g, t, u, predOf(a)), pr = nearest(g, t, u, preyOf(a)), stuck = g.netted(u, t), ready = g.dashReady(u, t), dashed = o.dash.has(u), item = itemOf(g, t, u);
        if (c) { const all = []; for (let v = 0; v < U; v++) if (g.owner(v) !== a && g.alive(v, t) && pos(g, t, v)) all.push(v); if (all.length) { aliveNear.n++; if (all.some(v => dist([c.x, c.y], pos(g, t, v)) < 1000)) aliveNear.any++; } }
        if (th && !g.netted(th.v, t) && !stuck) {
          const hd = heading(g, t, u, th.p);
          if (th.d < 1800) { S.thr++; if (died3(g, u, t)) S.thrDied++; if (hd === 'toward' || hd === 'stay') S.thrBad++; if (hd === 'away') S.thrAway++; if (item === 'SMOKE') S.thrSmoke++; if (item === 'NET') S.thrNet++; if (item === 'DECOY') S.thrDecoy++; }
          if (th.d < 1200 && ready) { S.close++; if (dashed && hd === 'away') S.closeDash++; }
          if (th.d < 3000 && c && c.msg) { const b = Math.floor(th.d / 300) * 300; const f = fleeBy[b] = fleeBy[b] || { n: 0, y: 0 }; if (/flee|hunt|seek|chase|scout|search|patrol|explore/i.test(c.msg)) { f.n++; if (/flee|escape|run|avoid/i.test(c.msg)) f.y++; } }
        }
        if (pr && !stuck) {
          const hd = heading(g, t, u, pr.p), vn = g.netted(pr.v, t);
          if (pr.d < 1800) { S.opp++; if (died3(g, pr.v, t)) S.oppConv++; if (dashed && hd === 'toward') S.oppDash++; if (item === 'NET') S.oppNet++; if (hd === 'away') S.oppAway++; }
          if (pr.d < 2400 && vn) { S.nopp++; if (dashed && hd === 'toward') S.noppDash++; if (hd === 'toward') S.noppToward++; }
          if (pr.d < 4200 && c && c.msg && /flee|hunt|seek|chase|scout|search|patrol|explore/i.test(c.msg)) { const b = Math.floor(pr.d / 300) * 300; const f = huntBy[b] = huntBy[b] || { n: 0, y: 0 }; f.n++; if (/hunt|chase|catch|kill|intercept|pincer/i.test(c.msg)) f.y++; }
        }
      }
      for (const n of targets.values()) if (n > 1) S.same += n - 1;
      S.turnsPlayed++;
    }
    for (const k of keys) { const tm = team(k); for (const f of Object.keys(S)) tm[f] += S[f]; }
  }
});

const M = {                                              // derived habits, all "per game" or rates
  'win %': s => 100 * s.win / s.games, 'last %': s => 100 * s.last / s.games,
  'catches / unit': s => s.catches / s.units, 'losses / unit': s => s.losses / s.units,
  'first catch %': s => 100 * s.firstCatch / s.games, 'catches by turn 10 / unit': s => s.earlyCatch / s.units, 'losses by turn 10 / unit': s => s.earlyLoss / s.units,
  'nets per game': s => s.nets / s.games, 'net hit %': s => 100 * s.netHit / Math.max(1, s.nets), 'nets in turns 1-3 %': s => 100 * s.nets3 / Math.max(1, s.nets), 'nets on turn 1 / game': s => s.netT1 / s.games,
  'net at full range %': s => 100 * s.netFull / Math.max(1, s.nets), 'net conversion %': s => 100 * s.netConv / Math.max(1, s.netPrey), 'defensive net hits %': s => 100 * s.netDef / Math.max(1, s.netPrey + s.netDef),
  'smokes per game': s => s.smokes / s.games, 'smoke in turns 1-5 %': s => 100 * s.smokes5 / Math.max(1, s.smokes), 'smoke on self %': s => 100 * s.smokeSelf / Math.max(1, s.smokes),
  'decoys per game': s => s.decoys / s.games, 'decoys in turns 1-3 %': s => 100 * s.decoys3 / Math.max(1, s.decoys),
  'dash share of moves %': s => 100 * s.dashes / Math.max(1, s.moveCmd), 'units dashing on turn 1 %': s => 100 * s.t1dash / s.units,
  'exposure % (predator <1800)': s => 100 * s.thr / Math.max(1, s.ut), 'death rate when exposed %': s => 100 * s.thrDied / Math.max(1, s.thr), 'walks toward/stands when exposed %': s => 100 * s.thrBad / Math.max(1, s.thr),
  'dashes away when predator <1200 %': s => 100 * s.closeDash / Math.max(1, s.close), 'smoke when exposed %': s => 100 * s.thrSmoke / Math.max(1, s.thr), 'net when exposed %': s => 100 * s.thrNet / Math.max(1, s.thr), 'decoy when exposed %': s => 100 * s.thrDecoy / Math.max(1, s.thr),
  'pressure % (prey <1800)': s => 100 * s.opp / Math.max(1, s.ut), 'conversion when prey <1800 %': s => 100 * s.oppConv / Math.max(1, s.opp), 'dashes at prey <1800 %': s => 100 * s.oppDash / Math.max(1, s.opp), 'net when prey <1800 %': s => 100 * s.oppNet / Math.max(1, s.opp),
  'dashes at netted prey <2400 %': s => 100 * s.noppDash / Math.max(1, s.nopp), 'own netted units helped %': s => 100 * s.ownNettedHelped / Math.max(1, s.ownNetted), 'own netted units caught %': s => 100 * s.ownNettedCaught / Math.max(1, s.ownNetted), 'own units netted / game': s => s.ownNetted / s.games,
  'nearest team-mate (turns 6-50)': s => s.mate / Math.max(1, s.mateN), 'time at the wall %': s => 100 * s.wall / Math.max(1, s.ut), 'shared targets / 100 turns': s => 100 * s.same / Math.max(1, s.turnsPlayed),
  'net/smoke ordered on death turn %': s => 100 * s.lateItem / Math.max(1, s.losses),
};
const names = Object.keys(M);
const fmt = v => Math.abs(v) >= 100 ? String(Math.round(v)) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2);
const rows = [...teams.entries()].map(([k, s]) => ({ k, s, v: Object.fromEntries(names.map(n => [n, M[n](s)])) }));
console.log('games', games, ' seats', rows.filter(r => r.k.startsWith('PLACE')).reduce((a, r) => a + r.s.games, 0));

const group = ks => rows.filter(r => ks.includes(r.k));
const cmp = group(['PLACE 1', 'PLACE 2', 'PLACE 3', 'ALL current top ' + TOPN, 'ALL others']).sort((a, b) => a.k < b.k ? -1 : 1);
console.log('\n== HABITS: by final place, and current top ' + TOPN + ' bots against everyone else ==');
console.log('  ' + 'habit'.padEnd(38) + cmp.map(r => r.k.replace('ALL ', '').slice(0, 15).padStart(17)).join(''));
for (const n of names) console.log('  ' + n.padEnd(38) + cmp.map(r => fmt(r.v[n]).padStart(17)).join(''));

// Spearman correlation of each habit with the win rate, across teams with enough games
const pool = rows.filter(r => !r.k.startsWith('ALL') && !r.k.startsWith('PLACE') && r.s.games >= 30);
const rank = a => { const idx = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]); const r = new Array(a.length); for (let i = 0; i < idx.length;) { let j = i; while (j < idx.length && idx[j][0] === idx[i][0]) j++; for (let k = i; k < j; k++) r[idx[k][1]] = (i + j - 1) / 2; i = j; } return r; };
const corr = (a, b) => { const ra = rank(a), rb = rank(b), ma = ra.reduce((x, y) => x + y, 0) / ra.length, mb = rb.reduce((x, y) => x + y, 0) / rb.length; let sxy = 0, sx = 0, sy = 0; for (let i = 0; i < ra.length; i++) { sxy += (ra[i] - ma) * (rb[i] - mb); sx += (ra[i] - ma) ** 2; sy += (rb[i] - mb) ** 2; } return sxy / Math.sqrt(sx * sy || 1); };
console.log(`\n== WHICH HABITS GO WITH WINNING (Spearman correlation with win %, ${pool.length} bots with 30+ games) ==`);
const cs = names.filter(n => n !== 'win %').map(n => [n, corr(pool.map(r => r.v[n]), pool.map(r => r.v['win %']))]).sort((a, b) => b[1] - a[1]);
for (const [n, c] of cs) console.log('  ' + (c >= 0 ? '+' : '') + c.toFixed(2) + '  ' + n);

console.log('\n== CURRENT TOP ' + TOPN + ' BOTS (games in the sample; sorted by leaderboard rank) ==');
const cols = [['games', s => s.games, 0], ['win %'], ['last %'], ['catches / unit'], ['losses / unit'], ['first catch %'], ['losses by turn 10 / unit'], ['net hit %'], ['nets in turns 1-3 %'], ['net conversion %'], ['smokes per game'], ['decoys per game'], ['dash share of moves %'], ['death rate when exposed %'], ['conversion when prey <1800 %'], ['own netted units helped %'], ['shared targets / 100 turns'], ['net/smoke ordered on death turn %']];
const short = ['games', 'win', 'last', 'catch/u', 'lost/u', '1st catch', 'lost10/u', 'net hit', 'nets t1-3', 'net conv', 'smoke', 'decoy', 'dash%', 'die exposed', 'conv', 'rescue', 'shared', 'late item'];
console.log('  ' + 'bot'.padEnd(52) + short.map(c => c.padStart(11)).join(''));
const prof = rows.filter(r => r.k.startsWith('#')).sort((a, b) => a.k < b.k ? -1 : 1);
for (const r of prof) console.log('  ' + r.k.slice(0, 51).padEnd(52) + cols.map(c => (c[1] ? String(c[1](r.s)) : fmt(r.v[c[0]])).padStart(11)).join(''));
console.log('\n== OTHER BOTS WITH 40+ GAMES (older versions of top teams and lower ranks), by win % ==');
for (const r of rows.filter(r => r.k.startsWith('     ') && r.s.games >= 40).sort((a, b) => b.v['win %'] - a.v['win %'])) console.log('  ' + r.k.trim().slice(0, 51).padEnd(52) + cols.map(c => (c[1] ? String(c[1](r.s)) : fmt(r.v[c[0]])).padStart(11)).join(''));
fs.writeFileSync(path.join(ROOT, 'teams.json'), JSON.stringify(rows.map(r => ({ key: r.k.trim(), games: r.s.games, ...Object.fromEntries(names.map(n => [n, Math.round(r.v[n] * 100) / 100])) })), null, 1));

console.log('\n== PROBES ==');
console.log('share of labelled units in a HUNT-type state, by distance to the nearest prey (sight range shows as the drop):');
console.log('  ' + Object.keys(huntBy).map(Number).sort((a, b) => a - b).map(b => `${b}: ${pc(huntBy[b].y, huntBy[b].n)}`).join('  '));
console.log('share of labelled units in a FLEE-type state, by distance to the nearest predator:');
console.log('  ' + Object.keys(fleeBy).map(Number).sort((a, b) => a - b).map(b => `${b}: ${pc(fleeBy[b].y, fleeBy[b].n)}`).join('  '));
console.log(`ghost orders aimed within 1000 of an alive enemy: ${pc(ghostNear.any, ghostNear.n)} (prey ${pc(ghostNear.prey, ghostNear.n)}, predator ${pc(ghostNear.pred, ghostNear.n)}); the same for alive units: ${pc(aliveNear.any, aliveNear.n)}`);
