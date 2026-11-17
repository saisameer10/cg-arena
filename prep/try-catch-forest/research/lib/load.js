'use strict';
// Shared loader and helpers for the deep analysis scripts.
const fs = require('fs'), path = require('path');
const { parse, dist } = require('./parse');
const ROOT = path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg');
const lb = JSON.parse(fs.readFileSync(path.join(ROOT, 'leaderboard.json'), 'utf8'));
const lbById = new Map(lb.map(r => [r.agent_id, r]));
const TOPN = Number(process.env.TOPN) || 25;
const top = new Map(lb.filter(r => r.rank <= TOPN).map(r => [r.agent_id, r]));
const MAXAGE = 30;

function eachGame(fn) {
  let n = 0;
  for (const f of fs.readdirSync(path.join(ROOT, 'games')).filter(f => f.endsWith('.json'))) {
    let g; try { g = parse(JSON.parse(fs.readFileSync(path.join(ROOT, 'games', f), 'utf8'))); } catch { continue; }
    if (!g) continue;
    g.top = g.agentIds.map(id => top.get(id) || null);          // leaderboard row when the seat is a current top-N bot
    n++; fn(g);
  }
  return n;
}
const preyOf = o => (o + 1) % 3, predOf = o => (o + 2) % 3;
const pos = (g, t, u) => { const x = g.P[t] && g.P[t][u]; return x && x.age <= MAXAGE ? x.p : null; };
/** Nearest alive unit of team `team` to unit u at the start of turn t (both positions known). */
function nearest(g, t, u, team) {
  const p = pos(g, t, u); if (!p) return null;
  let best = null;
  for (let v = team * g.N; v < team * g.N + g.N; v++) {
    if (!g.alive(v, t)) continue; const q = pos(g, t, v); if (!q) continue;
    const d = dist(p, q); if (!best || d < best.d) best = { v, d, p: q };
  }
  return best;
}
/** Direction of u's order relative to a reference point: away / toward / side / stay. */
function heading(g, t, u, ref) {
  const p = pos(g, t, u), c = g.T[t].cmd.get(u); if (!p || !c) return 'stay';
  const vx = c.x - p[0], vy = c.y - p[1], l = Math.hypot(vx, vy); if (l < 60) return 'stay';
  const ax = p[0] - ref[0], ay = p[1] - ref[1], al = Math.hypot(ax, ay) || 1;
  const cos = (vx * ax + vy * ay) / (l * al);
  return cos > 0.5 ? 'away' : cos < -0.5 ? 'toward' : 'side';
}
const itemOf = (g, t, u) => { const o = g.T[t]; return o.nets.some(n => n.u === u) ? 'NET' : o.smokes.some(n => n.u === u) ? 'SMOKE' : o.decoys.some(n => n.u === u) ? 'DECOY' : ''; };
const pc = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
const f2 = x => (Math.round(x * 100) / 100).toFixed(2);
const quant = (arr, p) => { if (!arr.length) return NaN; const s = [...arr].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const bump = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; };
const cell = (tab, r, c) => { const row = tab[r] = tab[r] || {}; return row[c] = row[c] || { n: 0, y: 0 }; };
module.exports = { eachGame, preyOf, predOf, pos, nearest, heading, itemOf, pc, f2, quant, bump, cell, dist, lb, lbById, top, TOPN, ROOT };
