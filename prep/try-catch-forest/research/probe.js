'use strict';
// Mechanics measured from the logs: speeds, dash cooldown, net hold time, item ranges, items per game size.
const fs = require('fs');
const path = require('path');
const DIR = path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg', 'games');
const P = s => (s.match(/\((-?\d+), (-?\d+)\)/g) || []).map(x => x.slice(1, -1).split(', ').map(Number));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const hist = (arr, step) => { const h = {}; for (const v of arr) { const k = Math.round(v / step) * step; h[k] = (h[k] || 0) + 1; } return Object.entries(h).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}:${v}`).join(' '); };

const dashGap = [], dashStep = [], twoTurn = [], afterNet = {}, itemsByUnits = {}, catchDist = [], netHitDist = [], decoyLife = [], maxR = [];
let dashCmd = 0, dashDone = 0, dashCmdAfterDash = {};
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.json'))) {
  let g; try { g = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch { continue; }
  if (!g.frames) continue;
  const turnOf = fr => Math.ceil(fr.frame / 3);
  const obs = new Map();      // unit -> [{turn, pos, kind}]
  const dashes = new Map();   // unit -> [turn]
  const cmds = new Map();     // unit -> Map(turn -> cmd)
  const nets = [];            // {turn, unit, land}
  const ghosts = new Map();
  const used = [0, 0, 0].map(() => ({ NET: 0, SMOKE: 0, DECOY: 0 }));
  let units = 0;
  const add = (u, turn, pos, kind) => { if (!obs.has(u)) obs.set(u, []); obs.get(u).push({ turn, pos, kind }); maxR.push(Math.hypot(pos[0], pos[1])); };
  for (const fr of g.frames) {
    const turn = turnOf(fr);
    if (fr.stdout && fr.agent !== undefined) {
      const list = fr.stdout.split(';').map(c => c.trim().match(/^(MOVE|DASH|NET|SMOKE|DECOY)\s+(\d+)\s+(-?\d+)\s+(-?\d+)/)).filter(Boolean);
      if (turn === 1) units = Math.max(units, list.filter(m => m[1] === 'MOVE' || m[1] === 'DASH').length);
      for (const m of list) if (m[1] === 'MOVE' || m[1] === 'DASH') { if (!cmds.has(+m[2])) cmds.set(+m[2], new Map()); cmds.get(+m[2]).set(turn, { c: m[1], t: [+m[3], +m[4]] }); }
    }
    for (const line of (fr.summary || '').split('\n').map(l => l.trim()).filter(Boolean)) {
      let m;
      if ((m = line.match(/^\$(\d)'s agent (\d+) dashes from/))) { const p = P(line); add(+m[2], turn, p[0], 'dashStart'); if (!dashes.has(+m[2])) dashes.set(+m[2], []); dashes.get(+m[2]).push(turn); }
      else if ((m = line.match(/^\$(\d)'s agent (\d+) at .* throws a net at/))) { const p = P(line); used[m[1]].NET++; let h; if ((h = line.match(/and nets \$(\d)'s agent (\d+)/))) { nets.push({ turn, unit: +h[2], land: p[1] }); netHitDist.push(dist(p[0], p[1])); } }
      else if ((m = line.match(/^\$(\d)'s agent (\d+) at .* deploys smoke/))) used[m[1]].SMOKE++;
      else if ((m = line.match(/^\$(\d)'s agent (\d+) at .* deploys a decoy/))) used[m[1]].DECOY++;
      else if ((m = line.match(/^\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+) at/))) { const p = P(line); add(+m[4], turn, p[0], 'caught'); ghosts.set(+m[4], turn); }
    }
  }
  if (!units) continue;
  (itemsByUnits[units] = itemsByUnits[units] || { NET: 0, SMOKE: 0, DECOY: 0, n: 0 });
  for (const u of used) { const o = itemsByUnits[units]; o.NET = Math.max(o.NET, u.NET); o.SMOKE = Math.max(o.SMOKE, u.SMOKE); o.DECOY = Math.max(o.DECOY, u.DECOY); } itemsByUnits[units].n++;
  for (const [u, ts] of dashes) for (let i = 1; i < ts.length; i++) dashGap.push(ts[i] - ts[i - 1]);
  // dash commanded vs executed, by turns since the unit's last executed dash
  for (const [u, byTurn] of cmds) {
    const done = new Set(dashes.get(u) || []); let last = -99;
    for (const [turn, c] of [...byTurn.entries()].sort((a, b) => a[0] - b[0])) {
      if (ghosts.has(u) && turn > ghosts.get(u)) break;
      if (c.c === 'DASH') { const k = Math.min(turn - last, 6); const o = dashCmdAfterDash[k] = dashCmdAfterDash[k] || { cmd: 0, done: 0 }; o.cmd++; if (done.has(turn)) { o.done++; } }
      if (done.has(turn)) last = turn;
    }
  }
  // displacement during a dash turn: dash start at t, next dash start (or caught) position at t+gap
  for (const [u, list] of obs) {
    list.sort((a, b) => a.turn - b.turn);
    for (let i = 0; i + 1 < list.length; i++) {
      const a = list[i], b = list[i + 1]; if (a.kind !== 'dashStart') continue;
      const c = cmds.get(u); if (!c) continue;
      const gap = b.turn - a.turn; const ca = c.get(a.turn);
      if (!ca || dist(a.pos, ca.t) < 1300) continue;                 // only dashes aimed far enough to use the full step
      if (gap === 1 && b.kind === 'dashStart') dashStep.push(dist(a.pos, b.pos));
      if (gap === 2 && b.kind === 'dashStart') { const cb = c.get(a.turn + 1); if (cb && cb.c === 'MOVE') twoTurn.push(dist(a.pos, b.pos)); }
    }
  }
  // net hold: how far from the landing point is the netted unit k turns later?
  for (const n of nets) {
    const list = obs.get(n.unit) || [];
    for (const o of list) { const k = o.turn - n.turn; if (k >= 1 && k <= 6 && o.kind === 'dashStart') (afterNet[k] = afterNet[k] || []).push(dist(o.pos, n.land)); }
  }
}
console.log('dash turn displacement (full-length dashes), histogram by 100:', hist(dashStep, 100));
console.log('dash + next-turn MOVE displacement, histogram by 100:', hist(twoTurn, 100));
console.log('turns between two executed dashes of the same unit:', hist(dashGap, 1));
console.log('DASH commanded k turns after the last executed dash -> executed:', Object.entries(dashCmdAfterDash).map(([k, o]) => `k=${k}: ${o.done}/${o.cmd}`).join('  '));
console.log('net flight distance when it hit a unit, by 250:', hist(netHitDist, 250));
for (const k of Object.keys(afterNet)) { const a = afterNet[k].sort((x, y) => x - y); console.log(`netted unit, ${k} turn(s) later: starts a dash at median ${Math.round(a[a.length >> 1])} from the net (n=${a.length}, min ${Math.round(a[0])})`); }
console.log('max items used by one team, by units per team:', JSON.stringify(itemsByUnits));
const mr = maxR.sort((a, b) => a - b); console.log('largest distance of a unit from the centre:', Math.round(mr[mr.length - 1]), ' 99.9th pct', Math.round(mr[Math.floor(mr.length * 0.999)]));
