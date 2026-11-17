'use strict';
// How good are the reconstructed positions? Error at each anchor, by age of the simulated position.
const fs = require('fs'), path = require('path');
const { parse } = require('./lib/parse');
const DIR = path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg', 'games');
const by = {}; let games = 0, known = 0, all = 0, bad = 0; const other = new Map(); const turnsHist = {};
const q = (a, p) => a[Math.min(a.length - 1, Math.floor(p * a.length))];
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.json'))) {
  let g; try { g = parse(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))); } catch (e) { bad++; continue; }
  if (!g) { bad++; continue; }
  games++; const tb = g.turns === 100 ? '100' : g.turns >= 90 ? '90-99' : g.turns >= 60 ? '60-89' : '<60'; turnsHist[tb] = (turnsHist[tb] || 0) + 1;
  for (const [a, e] of g.errs) { const k = a <= 1 ? '1' : a <= 2 ? '2' : a <= 4 ? '3-4' : a <= 8 ? '5-8' : a <= 15 ? '9-15' : '16+'; (by[k] = by[k] || []).push(e); }
  for (let t = 1; t <= g.turns; t++) { for (let u = 0; u < g.U; u++) if (g.alive(u, t)) { all++; if (g.P[t][u] && g.P[t][u].age <= 8) known++; } for (const o of g.T[t].other) other.set(o, (other.get(o) || 0) + 1); }
}
console.log('games parsed', games, 'unusable', bad, 'turns per game', JSON.stringify(turnsHist));
for (const k of ['1', '2', '3-4', '5-8', '9-15', '16+']) { const a = (by[k] || []).sort((x, y) => x - y); if (a.length) console.log(`age ${k.padEnd(5)} n=${String(a.length).padStart(6)}  median error ${Math.round(q(a, 0.5))}  p75 ${Math.round(q(a, 0.75))}  p90 ${Math.round(q(a, 0.9))}`); }
console.log(`alive unit-turns with a position no older than 8 turns: ${Math.round(100 * known / all)}%`);
console.log('other referee lines:'); for (const [k, v] of [...other].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log('  ', v, k.slice(0, 150));
