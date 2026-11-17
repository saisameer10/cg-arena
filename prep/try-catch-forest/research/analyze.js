'use strict';
// Parses the downloaded Unleash the Geek 2026 game logs into per-game, per-seat records (utg/records.json)
// and prints the first findings: scoring fit, role balance, event counts.
const fs = require('fs');
const path = require('path');
const DIR = path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg', 'games');
const lb = JSON.parse(fs.readFileSync(path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg', 'leaderboard.json'), 'utf8'));
const rankOf = new Map(lb.map(r => [r.agent_id, r]));
const num = s => Number(s);
const P = s => { const m = s.match(/\((-?\d+), (-?\d+)\)/g) || []; return m.map(x => x.slice(1, -1).split(', ').map(Number)); };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const records = [];
const global = { netRange: [], dashLen: [], decoyAimLen: [], smokeRange: [], unknown: new Map(), messages: new Map() };
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.json'))) {
  let g; try { g = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch { continue; }
  if (!g.agents || g.agents.length !== 3 || !g.scores) continue;
  const seats = g.agents.map(a => ({ index: a.index, name: a.name, agentId: a.agent_id, rank: a.rank, league: (rankOf.get(a.agent_id) || {}).league,
    score: g.scores[a.index], place: g.ranking.indexOf(a.index), catches: [], losses: [], nets: { thrown: 0, hitAgent: 0, hitDecoy: 0, missAim: 0, missTree: 0, hitOwn: 0, other: 0, turns: [] },
    smoke: [], decoy: [], dashes: 0, moves: 0, decoysDestroyed: 0, myDecoysDestroyed: 0, netted: [], cmds: 0, sameTarget: 0, errors: [],
    sprites: (g.metadata || {})['spritesCollected_' + a.index], trees: (g.metadata || {})['treesTouched_' + a.index], firstOut: null }));
  const units = Math.max(...g.frames.filter(fr => fr.stdout).slice(0, 3).map(fr => (fr.stdout.match(/(?:MOVE|DASH) \d+/g) || []).length), 0);
  const owner = id => Math.floor(id / Math.max(1, units));
  const turnOf = fr => Math.ceil(fr.frame / 3);
  const ghostAt = new Map();
  for (const fr of g.frames) {
    const turn = turnOf(fr);
    if (fr.stdout !== undefined && fr.agent !== undefined) {
      const s = seats[fr.agent]; if (!s) continue;
      if (s.firstOut === null) s.firstOut = fr.stdout;
      const cmds = fr.stdout.split(';').map(c => c.trim()).filter(Boolean);
      const targets = new Map();
      for (const c of cmds) {
        const m = c.match(/^(MOVE|DASH|NET|SMOKE|DECOY)\s+(\d+)\s+(-?\d+)\s+(-?\d+)\s*(.*)$/);
        if (!m) { s.errors.push(c.slice(0, 40)); continue; }
        if (m[1] === 'MOVE') s.moves++; if (m[1] === 'DASH') s.dashes++;
        if ((m[1] === 'MOVE' || m[1] === 'DASH') && !ghostAt.has(num(m[2]))) { const k = m[3] + ',' + m[4]; targets.set(k, (targets.get(k) || 0) + 1); }
        if (m[5]) global.messages.set(s.name, (global.messages.get(s.name) || new Set()).add(m[5].replace(/\d+/g, '#').slice(0, 30)));
      }
      for (const n of targets.values()) if (n > 1) s.sameTarget += n - 1;
      s.cmds++;
    }
    for (const line of (fr.summary || '').split('\n').map(l => l.trim()).filter(Boolean)) {
      let m;
      if ((m = line.match(/^\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+) at/))) {
        seats[m[1]].catches.push({ turn, by: num(m[2]), unit: num(m[4]), victim: num(m[3]), pos: P(line)[0] });
        seats[m[3]].losses.push({ turn, unit: num(m[4]), by: num(m[1]) }); ghostAt.set(num(m[4]), turn);
      } else if ((m = line.match(/^\$(\d)'s agent (\d+) at .* throws a net at/))) {
        const s = seats[m[1]]; const pts = P(line); s.nets.thrown++; s.nets.turns.push(turn);
        global.netRange.push(dist(pts[0], pts[1]));
        let h;
        if ((h = line.match(/and nets \$(\d)'s agent (\d+)/))) { if (h[1] === m[1]) s.nets.hitOwn++; else { s.nets.hitAgent++; seats[h[1]].netted.push({ turn, unit: num(h[2]), by: num(m[1]) }); } }
        else if (/and nets \$\d's decoy/.test(line)) s.nets.hitDecoy++;
        else if (/stopped by aim/.test(line)) s.nets.missAim++;
        else if (/stopped by tree/.test(line)) s.nets.missTree++;
        else { s.nets.other++; const k = line.replace(/-?\d+/g, 'N'); global.unknown.set(k, (global.unknown.get(k) || 0) + 1); }
      } else if ((m = line.match(/^\$(\d)'s agent (\d+) at .* deploys smoke at/))) { const pts = P(line); seats[m[1]].smoke.push(turn); global.smokeRange.push(dist(pts[0], pts[1])); }
      else if ((m = line.match(/^\$(\d)'s agent (\d+) at .* deploys a decoy towards/))) { const pts = P(line); seats[m[1]].decoy.push(turn); global.decoyAimLen.push(dist(pts[0], pts[1])); }
      else if ((m = line.match(/^\$(\d)'s agent (\d+) dashes from/))) { const pts = P(line); global.dashLen.push(dist(pts[0], pts[1])); }
      else if ((m = line.match(/^\$(\d)'s agent (\d+) destroys \$(\d)'s decoy/))) { seats[m[1]].decoysDestroyed++; seats[m[3]].myDecoysDestroyed++; }
      else { const k = line.replace(/-?\d+(\.\d+)?/g, 'N'); global.unknown.set(k, (global.unknown.get(k) || 0) + 1); }
    }
  }
  records.push({ game: g.game_id, seed: g.game_options, units, meta: g.metadata || {}, turns: Math.ceil(g.frames.length / 3), seats });
}
fs.writeFileSync(path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg', 'records.json'), JSON.stringify(records));
console.log('games parsed:', records.length);

// ---- game shapes ----
const shapes = {}; for (const r of records) { const k = `units=${r.units} sprites=${r.meta.totalSprites} trees=${r.meta.totalTrees}`; shapes[k] = (shapes[k] || 0) + 1; }
console.log('units per game:', JSON.stringify(records.reduce((a, r) => (a[r.units] = (a[r.units] || 0) + 1, a), {})), ' trees range:', Math.min(...records.map(r => r.meta.totalTrees)), '-', Math.max(...records.map(r => r.meta.totalTrees)), ' totalSprites:', JSON.stringify(records.reduce((a, r) => (a[r.meta.totalSprites] = (a[r.meta.totalSprites] || 0) + 1, a), {})));

// ---- scoring: which formula reproduces every score? ----
const rows = records.flatMap(r => r.seats.map(s => ({ score: s.score, c: s.catches.length, l: s.losses.length, sp: s.sprites, tr: s.trees, units: r.units, trPct: r.meta['treesTouchedPct_' + s.index], s })));
const test = (name, fn) => { const ok = rows.filter(x => fn(x) === x.score).length; console.log(`  ${name}: matches ${ok}/${rows.length}`); };
console.log('scoring formulas:');
test('score = catches', x => x.c);
test('score = 3*catches', x => 3 * x.c);
test('score = 3*catches + sprites', x => 3 * x.c + x.sp);
test('score = catches + sprites', x => x.c + x.sp);
test('score = 2*catches + sprites', x => 2 * x.c + x.sp);
test('score = 3*catches + survivors', x => 3 * x.c + (x.units - x.l));
test('score = 2*catches + 2*sprites', x => 2 * x.c + 2 * x.sp);
test('score = 4*catches - sprites...', x => 4 * x.c - x.sp);
console.log('sample rows (score, catches, losses, sprites, trees):', rows.slice(0, 14).map(x => `${x.score}|${x.c}|${x.l}|${x.sp}|${x.tr}`).join('  '));

// ---- role balance ----
for (let i = 0; i < 3; i++) { const ss = records.map(r => r.seats[i]); console.log(`seat ${i} (${['scissors', 'paper', 'rock'][i]}): wins ${ss.filter(s => s.place === 0).length}, avg score ${(ss.reduce((a, s) => a + s.score, 0) / ss.length).toFixed(2)}, avg catches ${(ss.reduce((a, s) => a + s.catches.length, 0) / ss.length).toFixed(2)}, avg losses ${(ss.reduce((a, s) => a + s.losses.length, 0) / ss.length).toFixed(2)}`); }
// who catches whom
const cw = {}; for (const r of records) for (const s of r.seats) for (const c of s.catches) { const k = s.index + '->' + c.victim; cw[k] = (cw[k] || 0) + 1; }
console.log('catches by seat -> victim seat:', JSON.stringify(cw));

// ---- measured constants ----
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? Math.round(s[Math.min(s.length - 1, Math.floor(p * s.length))]) : null; };
console.log('net flight distance: median', q(global.netRange, 0.5), 'p95', q(global.netRange, 0.95), 'max', q(global.netRange, 1));
console.log('smoke deploy distance: median', q(global.smokeRange, 0.5), 'p95', q(global.smokeRange, 0.95), 'max', q(global.smokeRange, 1));
console.log('decoy aim distance: median', q(global.decoyAimLen, 0.5), 'max', q(global.decoyAimLen, 1));
console.log('dash "from -> towards" distance: median', q(global.dashLen, 0.5), 'p10', q(global.dashLen, 0.1), 'max', q(global.dashLen, 1));
console.log('unrecognised summary lines:'); for (const [k, v] of [...global.unknown.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log('  ', v, k.slice(0, 170));
