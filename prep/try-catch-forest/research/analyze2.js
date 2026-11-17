'use strict';
// Winner / loser patterns from utg/records.json (built by analyze.js).
const fs = require('fs');
const path = require('path');
const R = JSON.parse(fs.readFileSync(path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg', 'records.json'), 'utf8'));
const lb = JSON.parse(fs.readFileSync(path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg', 'leaderboard.json'), 'utf8'));
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const f1 = x => (Math.round(x * 10) / 10).toFixed(1), f2 = x => (Math.round(x * 100) / 100).toFixed(2), pc = x => Math.round(100 * x) + '%';
const seats = R.flatMap(r => r.seats.map(s => ({ ...s, units: r.units, game: r.game, r })));
console.log('games', R.length, 'seat records', seats.length);

// ---- scoring check ----
let ok = 0; for (const s of seats) if (s.score === 3 * s.catches.length + (2 - s.place)) ok++;
console.log(`score = 3*catches + (2 - place): ${ok}/${seats.length}`);
let ordOk = 0, ordAll = 0, tieEarly = 0, ties = 0;
for (const r of R) {
  const by = [...r.seats].sort((a, b) => a.place - b.place);
  for (let i = 0; i < 2; i++) { ordAll++; if (by[i].catches.length >= by[i + 1].catches.length) ordOk++;
    if (by[i].catches.length === by[i + 1].catches.length && by[i].catches.length > 0) { ties++; const t = s => Math.min(...s.catches.map(c => c.turn)); if (t(by[i]) <= t(by[i + 1])) tieEarly++; } }
}
console.log(`ranking follows catches: ${ordOk}/${ordAll}; ties ${ties}, won by earlier first catch: ${tieEarly}`);

// ---- correlation of sprites / trees with place ----
for (const k of ['sprites', 'trees']) console.log(`avg ${k} by place: ` + [0, 1, 2].map(p => f2(avg(seats.filter(s => s.place === p).map(s => s[k] || 0)))).join(' / '));

// ---- net effect ----
let nettings = 0, caughtAfter = [0, 0, 0, 0, 0, 0, 0], catchesTotal = 0, catchesWithNet = 0;
for (const r of R) {
  const netted = r.seats.flatMap(s => s.netted);
  const losses = r.seats.flatMap(s => s.losses);
  for (const n of netted) { nettings++; const l = losses.find(l => l.unit === n.unit && l.turn >= n.turn); if (l && l.turn - n.turn <= 6) caughtAfter[l.turn - n.turn]++; }
  for (const l of losses) { catchesTotal++; if (netted.some(n => n.unit === l.unit && l.turn - n.turn >= 0 && l.turn - n.turn <= 3)) catchesWithNet++; }
}
console.log(`nets that hit an enemy unit: ${nettings}; that unit caught 0/1/2/3/4/5/6 turns later: ${caughtAfter.join('/')} => caught within 3 turns: ${pc((caughtAfter[0] + caughtAfter[1] + caughtAfter[2] + caughtAfter[3]) / Math.max(1, nettings))}`);
console.log(`catches total ${catchesTotal}; preceded by a net on the victim within 3 turns: ${pc(catchesWithNet / Math.max(1, catchesTotal))}`);
// who nets whom: prey or predator?
let netPrey = 0, netPred = 0, netOther = 0;
for (const r of R) for (const s of r.seats) for (const n of s.netted) { const by = Math.floor(n.by); if ((by + 1) % 3 === s.index) netPrey++; else if ((by + 2) % 3 === s.index) netPred++; else netOther++; }
console.log(`net hits on: own prey ${netPrey}, own predator ${netPred}`);

// ---- catch timing ----
const hist = new Array(10).fill(0); for (const s of seats) for (const c of s.catches) hist[Math.min(9, Math.floor((c.turn - 1) / 10))]++;
console.log('catches per 10 turns (1-10, 11-20, ...): ' + hist.join(' ') + `   in turns 1-5: ${seats.reduce((a, s) => a + s.catches.filter(c => c.turn <= 5).length, 0)}`);
const byUnits = {}; for (const r of R) { const k = r.units; (byUnits[k] = byUnits[k] || []).push(r.seats.reduce((a, s) => a + s.catches.length, 0)); }
console.log('catches per game by units per team: ' + Object.entries(byUnits).map(([k, v]) => `${k} units: ${f1(avg(v))} (${v.length} games)`).join(', '));
console.log('games where a team was fully eliminated: ' + R.filter(r => r.seats.some(s => s.losses.length >= r.units)).length);

// ---- winners vs losers in the same game ----
const metric = {
  'catches': s => s.catches.length, 'units lost': s => s.losses.length,
  'catches turn<=10': s => s.catches.filter(c => c.turn <= 10).length, 'losses turn<=10': s => s.losses.filter(c => c.turn <= 10).length,
  'nets thrown': s => s.nets.thrown, 'net hit rate (enemy unit)': s => s.nets.thrown ? s.nets.hitAgent / s.nets.thrown : null,
  'nets wasted on decoys': s => s.nets.hitDecoy, 'nets stopped by tree': s => s.nets.missTree, 'nets that hit nothing': s => s.nets.missAim,
  'nets thrown turn<=3': s => s.nets.turns.filter(t => t <= 3).length, 'median net turn': s => s.nets.turns.length ? [...s.nets.turns].sort((a, b) => a - b)[s.nets.turns.length >> 1] : null,
  'smokes used': s => s.smoke.length, 'smokes turn<=10': s => s.smoke.filter(t => t <= 10).length,
  'decoys used': s => s.decoy.length, 'decoys turn<=3': s => s.decoy.filter(t => t <= 3).length,
  'dash share of moves': s => (s.dashes + s.moves) ? s.dashes / (s.dashes + s.moves) : null,
  'own units netted': s => s.netted.length, 'enemy decoys destroyed': s => s.decoysDestroyed,
  'units sent to the same point (per turn)': s => s.cmds ? s.sameTarget / s.cmds : null,
};
console.log('\nmetric: 1st place / 2nd / 3rd (average per game)');
for (const [name, fn] of Object.entries(metric)) console.log('  ' + name.padEnd(42) + [0, 1, 2].map(p => f2(avg(seats.filter(s => s.place === p).map(fn).filter(v => v !== null))).padStart(7)).join(''));

// ---- per player ----
const players = new Map();
for (const s of seats) { const p = players.get(s.name) || { name: s.name, rows: [] }; p.rows.push(s); players.set(s.name, p); }
const table = [...players.values()].filter(p => p.rows.length >= 12).map(p => {
  const r = p.rows, m = fn => avg(r.map(fn).filter(v => v !== null));
  return { name: p.name, lbRank: Math.round(avg(r.map(x => x.rank || 999))), games: r.length, win: avg(r.map(x => x.place === 0 ? 1 : 0)), last: avg(r.map(x => x.place === 2 ? 1 : 0)),
    catches: m(metric['catches']), lost: m(metric['units lost']), early: m(metric['catches turn<=10']), earlyLoss: m(metric['losses turn<=10']), nets: m(metric['nets thrown']), hit: m(metric['net hit rate (enemy unit)']),
    netT3: m(metric['nets thrown turn<=3']), smoke: m(metric['smokes used']), smoke10: m(metric['smokes turn<=10']), decoy: m(metric['decoys used']), decoy3: m(metric['decoys turn<=3']), dash: m(metric['dash share of moves']), same: m(metric['units sent to the same point (per turn)']), netted: m(metric['own units netted']) };
}).sort((a, b) => a.lbRank - b.lbRank);
console.log('\nplayer (leaderboard rank) | games | win% | last% | catches | lost | catch<=10 | lost<=10 | nets | hit% | nets<=3 | smoke | smoke<=10 | decoy | decoy<=3 | dash% | same-pt | netted');
for (const t of table) console.log(`${(t.name + ' (#' + t.lbRank + ')').padEnd(34)} ${String(t.games).padStart(4)} ${pc(t.win).padStart(5)} ${pc(t.last).padStart(5)} ${f2(t.catches).padStart(6)} ${f2(t.lost).padStart(6)} ${f2(t.early).padStart(6)} ${f2(t.earlyLoss).padStart(6)} ${f2(t.nets).padStart(6)} ${pc(t.hit).padStart(5)} ${f2(t.netT3).padStart(6)} ${f2(t.smoke).padStart(6)} ${f2(t.smoke10).padStart(6)} ${f2(t.decoy).padStart(6)} ${f2(t.decoy3).padStart(6)} ${pc(t.dash).padStart(5)} ${f2(t.same).padStart(6)} ${f2(t.netted).padStart(6)}`);
fs.writeFileSync(path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg', 'players.json'), JSON.stringify(table, null, 1));

// ---- first turn of the top players ----
console.log('\nfirst-turn output samples:');
for (const t of table.slice(0, 6)) { const s = players.get(t.name).rows.find(x => x.firstOut); console.log('  ' + t.name + ': ' + (s ? s.firstOut.slice(0, 230) : '')); }
