'use strict';
// Does aiming a net past the target (overshoot) hit more often than aiming exactly at it?
const fs = require('fs'), path = require('path');
const DIR = path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg', 'games');
const P = s => (s.match(/\((-?\d+), (-?\d+)\)/g) || []).map(x => x.slice(1, -1).split(', ').map(Number));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const B = {}; const land = []; const byTeam = {};
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.json'))) {
  let g; try { g = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch { continue; }
  if (!g.frames) continue;
  for (const fr of g.frames) for (const line of (fr.summary || '').split('\n')) {
    const m = line.trim().match(/^\$(\d)'s agent (\d+) at .* throws a net at/); if (!m) continue;
    const p = P(line); if (p.length < 2) continue;
    const from = p[0], landed = p[1], aim = p.length >= 3 ? p[2] : p[1];
    const d = dist(from, aim), fl = dist(from, landed);
    const k = d < 750 ? 'a <750' : d < 1500 ? 'b 750-1500' : d < 1950 ? 'c 1500-1950' : d <= 2050 ? 'd 1950-2050' : d <= 3000 ? 'e 2050-3000' : 'f >3000';
    const b = B[k] = B[k] || { n: 0, hit: 0, decoy: 0, aimStop: 0, tree: 0 };
    b.n++; if (/and nets \$\d's agent/.test(line)) b.hit++; else if (/decoy/.test(line)) b.decoy++; else if (/stopped by aim/.test(line)) b.aimStop++; else if (/tree/.test(line)) b.tree++;
    if (/stopped by aim/.test(line)) land.push(fl);
    const name = g.agents[+m[1]].name; const t = byTeam[name] = byTeam[name] || { n: 0, over: 0, hit: 0 };
    t.n++; if (d > 2050) t.over++; if (/and nets \$\d's agent/.test(line)) t.hit++;
  }
}
const pc = (a, b) => Math.round(100 * a / b) + '%';
for (const k of Object.keys(B).sort()) { const b = B[k]; console.log(`aim distance ${k}: n=${b.n} hit ${pc(b.hit, b.n)} decoy ${pc(b.decoy, b.n)} stopped at aim ${pc(b.aimStop, b.n)} tree ${pc(b.tree, b.n)}`); }
land.sort((a, b) => a - b); console.log('flight length of nets "stopped by aim": median', Math.round(land[land.length >> 1]), 'max', Math.round(land[land.length - 1]));
console.log('share of nets aimed past 2050, by team (>=60 nets):');
for (const [n, t] of Object.entries(byTeam).filter(e => e[1].n >= 60).sort((a, b) => b[1].hit / b[1].n - a[1].hit / a[1].n)) console.log(`  ${n.padEnd(22)} nets ${String(t.n).padStart(4)}  overshoot ${pc(t.over, t.n).padStart(4)}  hit ${pc(t.hit, t.n)}`);
