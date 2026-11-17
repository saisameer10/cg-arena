'use strict';
// Parses one Try Catch Forest game log (API JSON) into commands, referee events and reconstructed unit positions.
// Positions: the referee prints a unit's position when it dashes or deploys a decoy (before its move), when it
// throws a net or drops smoke (after its move) and where it is caught ("anchors");
// between anchors the position is simulated from the unit's own MOVE/DASH orders (600 / 1200 per turn).
// Trees are not in the log, so simulated positions drift; every position carries its age (turns since an anchor).
const MOVE = 600, DASH = 1200, RMAX = 7780, NET_HOLD = 4;
const pts = s => (s.match(/\((-?\d+), (-?\d+)\)/g) || []).map(x => x.slice(1, -1).split(', ').map(Number));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const clamp = p => { const r = Math.hypot(p[0], p[1]); return r > RMAX ? [p[0] * RMAX / r, p[1] * RMAX / r] : p; };
const step = (p, t, s) => { const d = dist(p, t); return d <= s ? [t[0], t[1]] : clamp([p[0] + (t[0] - p[0]) * s / d, p[1] + (t[1] - p[1]) * s / d]); };

function parse(g) {
  if (!g || !g.frames || !g.agents || g.agents.length !== 3 || !g.ranking || !g.scores) return null;
  const T = [];                                   // T[t] = commands and events of turn t
  const turnObj = t => T[t] || (T[t] = { cmd: new Map(), items: [], out: ['', '', ''], dash: new Map(), at: new Map(), atPost: new Map(), nets: [], smokes: [], decoys: [], catches: [], destroys: [], ghostItem: [0, 0, 0], other: [] });
  let turn = 0, prev = 99;
  for (const fr of g.frames) {
    if (fr.agent === undefined) continue;
    if (fr.agent <= prev) turn++;
    prev = fr.agent;
    const o = turnObj(turn);
    if (fr.stdout !== undefined) {
      o.out[fr.agent] = fr.stdout;
      for (const c of fr.stdout.split(';')) {
        const m = c.trim().match(/^(MOVE|DASH|NET|SMOKE|DECOY)\s+(\d+)\s+(-?\d+)\s+(-?\d+)\s*(.*)$/);
        if (!m) { if (c.trim()) o.other.push('BADCMD ' + fr.agent); continue; }
        const e = { c: m[1], u: +m[2], x: +m[3], y: +m[4], msg: m[5] || '', agent: fr.agent };
        if (e.c === 'MOVE' || e.c === 'DASH') o.cmd.set(e.u, e); else o.items.push(e);
      }
    }
    for (const line of (fr.summary || '').split('\n').map(l => l.trim()).filter(Boolean)) {
      let m; const p = pts(line);
      if ((m = line.match(/^\$(\d)'s agent (\d+) dashes from/))) o.dash.set(+m[2], { from: p[0], to: p[1] });
      else if ((m = line.match(/^\$(\d)'s agent (\d+) at .* throws a net at/))) {
        const n = { u: +m[2], owner: +m[1], from: p[0], land: p[1], aim: p.length >= 3 ? p[2] : p[1], units: [], decoys: 0, miss: null };
        const tail = line.split(' and nets ')[1];
        if (tail) { let h; const re = /\$(\d)'s (agents?|decoys?) ([\d, ]+)/g; while ((h = re.exec(tail))) { if (h[2][0] === 'a') for (const id of h[3].match(/\d+/g)) n.units.push(+id); else n.decoys += h[3].match(/\d+/g).length; } }
        else n.miss = /stopped by tree/.test(line) ? 'tree' : /stopped by aim/.test(line) ? 'aim' : 'other';
        o.nets.push(n); o.atPost.set(n.u, n.from);
      }
      else if ((m = line.match(/^\$(\d)'s agent (\d+) at .* deploys smoke at/))) { o.smokes.push({ u: +m[2], owner: +m[1], at: p[0], target: p[1] }); o.atPost.set(+m[2], p[0]); }
      else if ((m = line.match(/^\$(\d)'s agent (\d+) at .* deploys a decoy towards/))) { o.decoys.push({ u: +m[2], owner: +m[1], at: p[0], target: p[1] }); o.at.set(+m[2], p[0]); }
      else if ((m = line.match(/^\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+) at/))) o.catches.push({ by: +m[2], byOwner: +m[1], v: +m[4], vOwner: +m[3], pos: p[0] });
      else if ((m = line.match(/^\$(\d)'s agent (\d+) destroys \$(\d)'s decoy (\d+)/))) o.destroys.push({ by: +m[2], byOwner: +m[1], owner: +m[3], pos: p[0] });
      else if ((m = line.match(/^\$(\d): Ghosts cannot use items/))) o.ghostItem[+m[1]]++;
      else o.other.push(line.replace(/-?\d+(\.\d+)?/g, 'N'));
    }
  }
  const turns = T.length - 1;
  if (turns < 1) return null;
  let N = 0; for (let a = 0; a < 3; a++) N = Math.max(N, [...T[1].cmd.values()].filter(e => e.agent === a).length);
  if (!N) return null;
  const U = 3 * N, owner = u => Math.floor(u / N);
  for (let t = 1; t <= turns; t++) turnObj(t);
  // ---- facts per unit ----
  const caught = new Array(U).fill(0), caughtBy = new Array(U).fill(-1), netHits = Array.from({ length: U }, () => []), dashTurns = Array.from({ length: U }, () => []);
  for (let t = 1; t <= turns; t++) {
    for (const c of T[t].catches) if (c.v < U && !caught[c.v]) { caught[c.v] = t; caughtBy[c.v] = c.by; }
    for (const n of T[t].nets) for (const v of n.units) if (v < U) netHits[v].push(t);
    for (const u of T[t].dash.keys()) if (u < U) dashTurns[u].push(t);
  }
  const alive = (u, t) => !caught[u] || caught[u] >= t;                 // alive at the start of turn t
  const netted = (u, t) => netHits[u].some(n => t > n && t <= n + NET_HOLD);
  const dashReady = (u, t) => { let last = -9; for (const d of dashTurns[u]) if (d < t) last = d; return t - last >= 2; };
  // ---- positions at the start of each turn ----
  const P = Array.from({ length: turns + 2 }, () => new Array(U).fill(null));
  const errs = [];                                                      // [age, error] measured at each anchor
  const cur = new Array(U).fill(null), age = new Array(U).fill(0);
  for (let t = 1; t <= turns; t++) {
    const o = T[t];
    for (let u = 0; u < U; u++) {
      const a = o.dash.has(u) ? o.dash.get(u).from : o.at.get(u);
      if (a) { if (cur[u] && age[u] > 0 && alive(u, t)) errs.push([age[u], dist(cur[u], a)]); cur[u] = a; age[u] = 0; }
      if (cur[u]) P[t][u] = { p: cur[u], age: age[u] };
    }
    for (let u = 0; u < U; u++) {
      if (!cur[u]) continue;
      const c = o.cmd.get(u);
      if (c && !netted(u, t)) cur[u] = step(cur[u], [c.x, c.y], o.dash.has(u) ? DASH : MOVE);
      age[u]++;
    }
    // nets and smoke are launched after the move: their "at" is the position at the end of this turn
    for (const [u, a] of o.atPost) { if (cur[u] && alive(u, t)) errs.push([age[u], dist(cur[u], a)]); cur[u] = a; age[u] = 0; }
    for (const n of o.nets) for (const v of n.units) if (v < U) { cur[v] = n.land; age[v] = 1; }
    for (const c of o.catches) if (c.v < U) { if (cur[c.v] && age[c.v] > 1) errs.push([age[c.v] - 1, dist(cur[c.v], c.pos)]); cur[c.v] = c.pos; age[c.v] = 0; }
  }
  // back-fill before the first anchor (reverse of a straight step towards the ordered target)
  for (let u = 0; u < U; u++) {
    let k = 1; while (k <= turns && !P[k][u]) k++;
    if (k > turns || k === 1) continue;
    let q = P[k][u].p;
    for (let t = k - 1; t >= 1; t--) {
      const c = T[t].cmd.get(u); if (!c) break;
      const d = dist(q, [c.x, c.y]); if (d < 1) break;
      const s = T[t].dash.has(u) ? DASH : MOVE;
      q = clamp([q[0] - (c.x - q[0]) * s / d, q[1] - (c.y - q[1]) * s / d]);
      P[t][u] = { p: q, age: k - t };
    }
  }
  const place = [0, 1, 2].map(i => g.ranking.indexOf(i));
  return { id: g.game_id, N, U, turns, T, P, owner, caught, caughtBy, netHits, dashTurns, alive, netted, dashReady, errs, place,
    names: g.agents.map(a => a.name), agentIds: g.agents.map(a => a.agent_id), scores: g.scores, meta: g.metadata || {} };
}
module.exports = { parse, dist, MOVE, DASH, RMAX, NET_HOLD };
