'use strict';
// Try Catch Forest (CodinGame "Unleash the Geek 2026"): referee.
// The official referee is not public. This is a port of our local referee (prep/try-catch-forest/sim/Sim.java), which was
// written from the statement and fitted on real game logs. Every decision is listed in challenges/try-catch-forest.md.
// The map generator draws from java.util.Random exactly like Sim.java, so a seed gives the same map in both.
const { Referee, GameError } = require('../base');
const { JavaRandom } = require('../java-random');

const R = 8000, UR = 220, MOVE = 600, DASH = 1200, CATCH = 440, NET_RANGE = 2000, NET_R = 250, SMOKE_R = 1900, SMOKE_THROW = 2000, VISION = 2000;
const TURNS = 100, STEPS = 24, HOLD = 4, DECOY_LIFE = 10, CLOUD_LIFE = 10;
const VERBS = new Set(['MOVE', 'DASH', 'NET', 'SMOKE', 'DECOY']);
const hyp = Math.hypot, rnd0 = x => Math.round(x);

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  if (l2 < 1e-9) return hyp(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
  return hyp(px - ax - dx * t, py - ay - dy * t);
}
// parameter in [0,1] where the segment a-b first comes within r of (cx, cy); 2 if never
function firstTouch(cx, cy, r, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, fx = ax - cx, fy = ay - cy, A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), C = fx * fx + fy * fy - r * r;
  if (C <= 0) return 0;
  if (A < 1e-9) return 2;
  const D = B * B - 4 * A * C; if (D < 0) return 2;
  const t = (-B - Math.sqrt(D)) / (2 * A);
  return t >= 0 && t <= 1 ? t : 2;
}

class TryCatchForestReferee extends Referee {
  static meta = { id: 'try-catch-forest', name: 'Try Catch Forest', playerCount: 3, firstTurnTimeout: 1000, turnTimeout: 50, maxTurns: TURNS, viewer: 'try-catch-forest' };

  constructor(opts = {}) {
    super({ ...opts, playerCount: 3 });
    this.jr = new JavaRandom(this.seed);
    this.trees = []; this.units = []; this.decoys = []; this.clouds = []; this.newClouds = [];
    this.pool = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];      // nets, smokes, decoys
    this.score = [0, 0, 0]; this.lost = [0, 0, 0]; this.catchTurns = [[], [], []]; this.out = [false, false, false];
    this.cmd = [null, null, null];
    this.events = [];                                   // of the turn just played, for the viewer
    this.rv = { catches: [], dashes: [0, 0, 0], nets: [0, 0, 0], netHits: [0, 0, 0], smokes: [0, 0, 0], ignored: [0, 0, 0], firstIgnored: [null, null, null] };
    this.gen();
    this.start = this.pool.map(p => p.slice());
  }

  // ---- map: trees with three-fold symmetry, units of player p = units of player 0 turned by p x 120 degrees
  gen() {
    const rnd = this.jr, tl = [];
    const per = 4 + rnd.nextInt(8);
    for (let k = 0; k < per * 30 && tl.length < per * 3; k++) {
      const r = 500 + rnd.nextDouble() * (rnd.nextInt(4) === 0 ? 1500 : 500);
      const a = rnd.nextDouble() * 2 * Math.PI / 3, d = 900 + rnd.nextDouble() * 6600;
      const x = Math.cos(a) * d, y = Math.sin(a) * d; let ok = true;
      const cand = [];
      for (let p = 0; p < 3; p++) { const c = Math.cos(p * 2 * Math.PI / 3), s = Math.sin(p * 2 * Math.PI / 3); cand.push([x * c - y * s, x * s + y * c, r]); }
      for (const t of tl) for (const c of cand) if (hyp(t[0] - c[0], t[1] - c[1]) < t[2] + c[2] + 2 * UR + 60) ok = false;
      for (let p = 0; p < 3 && ok; p++) for (let q = p + 1; q < 3; q++) if (hyp(cand[p][0] - cand[q][0], cand[p][1] - cand[q][1]) < 2 * r + 2 * UR + 60) ok = false;
      if (ok) for (const c of cand) tl.push(c);
    }
    this.trees = tl.map(t => ({ x: rnd0(t[0]), y: rnd0(t[1]), r: rnd0(t[2]) }));
    const N = this.N = 3 + rnd.nextInt(4);
    this.units = new Array(3 * N).fill(null);
    for (let j = 0; j < N; j++) {
      let x, y;
      do { const a = rnd.nextDouble() * 2 * Math.PI, d = Math.sqrt(rnd.nextDouble()) * 7400; x = Math.cos(a) * d; y = Math.sin(a) * d; } while (!this.free(x, y, j));
      for (let p = 0; p < 3; p++) {
        const c = Math.cos(p * 2 * Math.PI / 3), s = Math.sin(p * 2 * Math.PI / 3);
        this.units[p * N + j] = { id: p * N + j, owner: p, x: rnd0(x * c - y * s), y: rnd0(x * s + y * c), dx: 0, dy: 0, ghost: false, cd: 0, dashes: 0, immob: 0, still: false, sx: 0, sy: 0, gx: 0, gy: 0, speed: 0, moving: false, lastDash: false };
      }
    }
    const a = 2 + rnd.nextInt(4), b = 2 + rnd.nextInt(4), c = 2 + rnd.nextInt(4);
    for (let p = 0; p < 3; p++) this.pool[p] = [a, b, c];
    this.nextId = 3 * N + this.trees.length;
  }
  free(x, y, upTo) {
    for (const t of this.trees) if (hyp(x - t.x, y - t.y) < t.r + UR + 30) return false;
    for (let p = 0; p < 3; p++) {
      const c = Math.cos(p * 2 * Math.PI / 3), s = Math.sin(p * 2 * Math.PI / 3), px = x * c - y * s, py = x * s + y * c;
      if (p > 0 && hyp(px - x, py - y) < 700) return false;
      for (let j = 0; j < upTo; j++) for (let q = 0; q < 3; q++) { const o = this.units[q * this.N + j]; if (o && hyp(o.x - px, o.y - py) < 500) return false; }
    }
    return true;
  }

  // ---- movement as fitted on the real referee: straight to the tree, then along its tangent with the projected speed
  move(x, y, gx, gy, len, ghost) {
    const d = hyp(gx - x, gy - y);
    if (d < 1e-6 || len < 1e-6) return [x, y];
    len = Math.min(d, len); let vx = (gx - x) / d * len, vy = (gy - y) / d * len;
    const T = this.trees, slices = hyp(x, y) + len >= R - UR ? 4 : 1;
    for (let sl = 0; sl < slices; sl++) {
      let rem = 1 / slices; const sx = x, sy = y;
      for (let it = 0; it < 4 && rem > 1e-7; it++) {
        const rvx = vx * rem, rvy = vy * rem, A = rvx * rvx + rvy * rvy; if (A < 1e-9) break;
        let bt = 2, bi = -1;
        if (!ghost) for (let i = 0; i < T.length; i++) {
          const fx = x - T[i].x, fy = y - T[i].y, rr = T[i].r + UR, far = rr + len;
          if (fx * fx + fy * fy > far * far) continue;
          const B = 2 * (fx * rvx + fy * rvy), C = fx * fx + fy * fy - rr * rr; let t;
          if (C <= 0) { if (B >= 0) continue; t = 0; } else { const D = B * B - 4 * A * C; if (D < 0) continue; t = (-B - Math.sqrt(D)) / (2 * A); if (t < 0 || t > 1) continue; }
          if (t < bt) { bt = t; bi = i; }
        }
        if (bi < 0) { x += rvx; y += rvy; break; }
        x += rvx * bt; y += rvy * bt; rem *= 1 - bt;
        let nx = x - T[bi].x, ny = y - T[bi].y; const nl = hyp(nx, ny); nx /= nl; ny /= nl;
        x = T[bi].x + nx * (T[bi].r + UR + 0.01); y = T[bi].y + ny * (T[bi].r + UR + 0.01);
        const dot = vx * nx + vy * ny; vx -= dot * nx; vy -= dot * ny;
      }
      const l = hyp(x, y);
      if (l > R - UR) {
        x *= (R - UR) / l; y *= (R - UR) / l; let stuck = false;
        if (!ghost) for (const t of T) if (hyp(x - t.x, y - t.y) < t.r + UR - 1) stuck = true;
        if (stuck) { x = sx; y = sy; break; }
      }
    }
    return [x, y];
  }
  inCloud(x, y) { for (const c of this.clouds) if (hyp(x - c.x, y - c.y) < SMOKE_R) return true; return false; }
  sees(u, x, y) {
    if (this.inCloud(u.x, u.y) || this.inCloud(x, y)) return false;
    if (hyp(u.x - x, u.y - y) > (u.still ? VISION * 1.3 : VISION)) return false;
    for (const t of this.trees) if (segDist(t.x, t.y, u.x, u.y, x, y) < t.r) return false;
    for (const c of this.clouds) if (segDist(c.x, c.y, u.x, u.y, x, y) < SMOKE_R) return false;
    return true;
  }
  visibleTo(p, x, y) { if (this.out[p]) return false; for (const u of this.units) if (u.owner === p && this.sees(u, x, y)) return true; return false; }

  // ---- engine contract
  getStaticInfo() { return { radius: R, unitRadius: UR, unitsPerPlayer: this.N, trees: this.trees, pools: this.start, smokeRadius: SMOKE_R, vision: VISION }; }
  getInitInput(p) {
    const lines = [String(p), String(R), String(this.trees.length)];
    this.trees.forEach((t, i) => lines.push(`${3 * this.N + i} ${t.x} ${t.y} ${t.r}`));
    return lines;
  }
  getActors() { return [0, 1, 2].filter(p => !this.out[p]); }
  getTurnInput(p) {
    const e = [];
    for (const u of this.units) {
      if (this.out[u.owner]) continue;
      if (u.owner !== p && (u.ghost || !this.visibleTo(p, u.x, u.y))) continue;
      e.push(`${u.id} UNIT ${u.owner} ${rnd0(u.x)} ${rnd0(u.y)} ${rnd0(u.dx)} ${rnd0(u.dy)} ${u.ghost ? 1 : 0} ${u.cd} ${u.dashes + 1} ${u.immob}`);
    }
    for (const d of this.decoys) {
      if (d.dead || this.out[d.owner]) continue;
      if (d.owner === p) e.push(`${d.id} DECOY ${p} ${rnd0(d.x)} ${rnd0(d.y)} ${rnd0(d.dx)} ${rnd0(d.dy)} -1 ${d.life} -1 -1`);
      else if (this.visibleTo(p, d.x, d.y)) e.push(`${d.orig} UNIT ${d.owner} ${rnd0(d.x)} ${rnd0(d.y)} ${rnd0(d.dx)} ${rnd0(d.dy)} 0 0 1 0`);
    }
    for (const c of this.clouds) {
      let vis = false;
      if (!this.out[p]) for (const u of this.units) if (u.owner === p && !this.inCloud(u.x, u.y) && hyp(u.x - c.x, u.y - c.y) <= (u.still ? VISION * 1.3 : VISION)) vis = true;
      if (vis) e.push(`${c.id} SMOKE ${c.owner} ${rnd0(c.x)} ${rnd0(c.y)} -1 -1 -1 ${c.life} -1 -1`);
    }
    return [String(this.score[p]), this.pool[p].join(' '), String(e.length), ...e];
  }
  applyOutput(p, lines) {
    const line = (lines[0] || '').trim();
    if (!line) throw new GameError('Invalid output: empty line (expected commands joined by ";" or WAIT)');
    const mv = {}, pw = {};
    for (const part of line.split(';')) {
      const f = part.trim().split(/\s+/);
      if (!f[0]) continue;
      const verb = f[0].toUpperCase();
      if (verb === 'WAIT') continue;
      if (!VERBS.has(verb)) throw new GameError(`Invalid command "${part.trim().slice(0, 60)}" (expected MOVE, DASH, NET, SMOKE, DECOY or WAIT)`);
      const id = Number(f[1]), x = Number(f[2]), y = Number(f[3]);
      if (f.length < 4 || !Number.isInteger(id) || !Number.isFinite(x) || !Number.isFinite(y)) throw new GameError(`Invalid command "${part.trim().slice(0, 60)}" (expected ${verb} <id> <x> <y>)`);
      const u = this.units[id];
      if (!u || u.owner !== p) {             // not one of this player's units: ignored (noted for the review)
        this.rv.ignored[p]++; if (!this.rv.firstIgnored[p]) this.rv.firstIgnored[p] = { turn: this.turn + 1, text: part.trim().slice(0, 60) };
        continue;
      }
      const c = { verb, x, y };
      if (verb === 'MOVE' || verb === 'DASH') mv[id] = c; else pw[id] = c;
    }
    this.cmd[p] = { mv, pw };
  }
  onDisqualify(p) { this.out[p] = true; this.dqd = this.dqd || [false, false, false]; this.dqd[p] = true; this.cmd[p] = null; }

  catchUnit(h, q) {
    q.ghost = true; q.moving = false; const held = q.immob > 0; q.immob = 0;
    this.score[h.owner]++; this.catchTurns[h.owner].push(this.turn + 1); this.lost[q.owner]++;
    this.events.push({ type: 'catch', by: h.id, unit: q.id, x: rnd0(q.x), y: rnd0(q.y) });
    this.log(`Unit ${h.id} (player ${h.owner}) catches unit ${q.id} (player ${q.owner})`);
    this.rv.catches.push({ turn: this.turn + 1, hunter: h.owner, prey: q.owner, unit: q.id, held, inCloud: this.inCloud(q.x, q.y), couldDash: q.cdStart === 0 && !held, dashed: q.lastDash, hunterDashed: h.lastDash });
  }

  endTurn() {
    const units = this.units, T = this.trees;
    this.events = [];
    const mv = new Array(units.length).fill(null), pw = new Array(units.length).fill(null);
    for (let p = 0; p < 3; p++) {
      const c = this.cmd[p]; this.cmd[p] = null;
      if (this.out[p] || !c) continue;
      for (const id in c.mv) mv[id] = c.mv[id];
      for (const id in c.pw) pw[id] = c.pw[id];
    }
    // decoys appear before the moves
    for (const u of units) {
      const f = pw[u.id]; if (!f || f.verb !== 'DECOY' || u.ghost || this.pool[u.owner][2] <= 0) continue;
      const d = hyp(f.x - u.x, f.y - u.y); if (d < 1) continue;
      this.decoys.push({ id: this.nextId++, owner: u.owner, orig: u.id, life: DECOY_LIFE, x: u.x, y: u.y, ux: (f.x - u.x) / d, uy: (f.y - u.y) / d, dx: 0, dy: 0, dead: false });
      this.pool[u.owner][2]--;
      this.events.push({ type: 'decoy', by: u.id, x: u.x, y: u.y });
    }
    // moves, in STEPS slices, collisions in time order
    for (const u of units) {
      u.sx = u.x; u.sy = u.y; u.moving = false; u.lastDash = false; u.cdStart = u.cd;
      const f = mv[u.id];
      if (!f || u.immob > 0 || this.out[u.owner]) continue;
      const dash = f.verb === 'DASH' && u.cd === 0;
      u.gx = f.x; u.gy = f.y; u.speed = dash ? DASH : MOVE; u.moving = hyp(u.gx - u.x, u.gy - u.y) > 0.5;
      if (dash && u.moving) { u.dashes++; u.cd = u.dashes + 1; u.lastDash = true; this.rv.dashes[u.owner]++; this.events.push({ type: 'dash', by: u.id }); }
    }
    const dstart = this.decoys.map(d => { d.dx = d.x; d.dy = d.y; return [d.x, d.y]; });
    for (let s = 1; s <= STEPS; s++) {
      const f = s / STEPS;
      for (const u of units) if (u.moving) { const e = this.move(u.sx, u.sy, u.gx, u.gy, u.speed * f, u.ghost); u.x = e[0]; u.y = e[1]; }
      this.decoys.forEach((d, i) => { if (d.dead) return; const e = this.move(dstart[i][0], dstart[i][1], dstart[i][0] + d.ux * 5000, dstart[i][1] + d.uy * 5000, MOVE * f, false); d.x = e[0]; d.y = e[1]; });
      for (const a of units) {
        if (a.ghost || this.out[a.owner]) continue;
        for (const b of units) {
          if (b.ghost || this.out[b.owner] || a.ghost || b.owner !== (a.owner + 1) % 3) continue;
          if (hyp(a.x - b.x, a.y - b.y) < CATCH) this.catchUnit(a, b);
        }
        for (const d of this.decoys) if (!d.dead && d.owner !== a.owner && hyp(a.x - d.x, a.y - d.y) < CATCH) { d.dead = true; this.events.push({ type: 'decoy-destroyed', by: a.id, x: rnd0(d.x), y: rnd0(d.y) }); }
      }
    }
    for (const u of units) { u.dx = u.x - u.sx; u.dy = u.y - u.sy; u.still = hyp(u.dx, u.dy) < 1; u.x = rnd0(u.x); u.y = rnd0(u.y); }
    for (const d of this.decoys) { const ox = d.dx, oy = d.dy; d.dx = d.x - ox; d.dy = d.y - oy; }
    // nets and smoke of the survivors, from where they stand now
    const newImmob = new Array(units.length).fill(0);
    for (const u of units) {
      const f = pw[u.id]; if (!f || u.ghost || this.out[u.owner]) continue;
      const gx = f.x, gy = f.y, d = hyp(gx - u.x, gy - u.y);
      if (f.verb === 'SMOKE' && this.pool[u.owner][1] > 0) {
        const k = d > SMOKE_THROW ? SMOKE_THROW / d : 1;
        const c = { id: this.nextId++, owner: u.owner, life: CLOUD_LIFE, x: u.x + (gx - u.x) * k, y: u.y + (gy - u.y) * k, fresh: true };
        this.newClouds.push(c); this.pool[u.owner][1]--; this.rv.smokes[u.owner]++;
        this.events.push({ type: 'smoke', by: u.id, x: rnd0(c.x), y: rnd0(c.y) });
      } else if (f.verb === 'NET' && this.pool[u.owner][0] > 0 && d > 1) {
        this.pool[u.owner][0]--; this.rv.nets[u.owner]++;
        const k = d > NET_RANGE ? NET_RANGE / d : 1, ex = u.x + (gx - u.x) * k, ey = u.y + (gy - u.y) * k; let best = 2;
        for (const t of T) if (segDist(t.x, t.y, u.x, u.y, ex, ey) < t.r + NET_R) best = Math.min(best, firstTouch(t.x, t.y, t.r + NET_R, u.x, u.y, ex, ey));
        for (const o of units) if (o !== u && !o.ghost && !this.out[o.owner] && segDist(o.x, o.y, u.x, u.y, ex, ey) < UR + NET_R) best = Math.min(best, firstTouch(o.x, o.y, UR + NET_R, u.x, u.y, ex, ey));
        for (const o of this.decoys) if (!o.dead && segDist(o.x, o.y, u.x, u.y, ex, ey) < UR + NET_R) best = Math.min(best, firstTouch(o.x, o.y, UR + NET_R, u.x, u.y, ex, ey));
        const ev = { type: 'net', by: u.id, x1: u.x, y1: u.y, x2: rnd0(ex), y2: rnd0(ey), hits: [] };
        this.events.push(ev);
        if (best > 1) continue;
        const hx = u.x + (ex - u.x) * best, hy = u.y + (ey - u.y) * best; ev.x2 = rnd0(hx); ev.y2 = rnd0(hy);
        let tree = false;
        for (const t of T) if (hyp(hx - t.x, hy - t.y) < t.r + NET_R + 1) tree = true;
        if (tree) { ev.tree = true; continue; }
        for (const o of units) if (o !== u && !o.ghost && !this.out[o.owner] && hyp(o.x - hx, o.y - hy) < UR + NET_R + 1) { newImmob[o.id] = HOLD; ev.hits.push(o.id); if (o.owner === (u.owner + 1) % 3) this.rv.netHits[u.owner]++; }
        for (const o of this.decoys) if (!o.dead && hyp(o.x - hx, o.y - hy) < UR + NET_R + 1) { o.dead = true; ev.decoy = true; }
      }
    }
    // end of turn: timers
    for (const u of units) { if (u.cd > 0) u.cd--; if (u.immob > 0) u.immob--; if (newImmob[u.id] > 0) u.immob = newImmob[u.id]; }
    this.decoys = this.decoys.filter(d => { d.life--; return !d.dead && d.life > 0; });
    this.clouds = this.clouds.filter(c => { c.life--; return c.life > 0; });
    for (const c of this.newClouds) { c.life = CLOUD_LIFE - 1; this.clouds.push(c); }
    this.newClouds = [];
    for (let p = 0; p < 3; p++) {
      if (this.out[p]) continue;
      if (!units.some(u => u.owner === p && !u.ghost)) { this.out[p] = true; this.log(`Player ${p} has no unit left and leaves the game (it keeps its ${this.score[p]} point(s))`); }
    }
    this.turn++;
  }
  isGameOver() { return this.out.filter(Boolean).length >= 2 || this.turn >= TURNS; }
  getFrame() {
    return {
      units: this.units.map(u => ({ id: u.id, owner: u.owner, x: u.x, y: u.y, ghost: u.ghost, cd: u.cd, immob: u.immob, gone: this.out[u.owner] })),
      decoys: this.decoys.map(d => ({ owner: d.owner, x: rnd0(d.x), y: rnd0(d.y) })),
      clouds: this.clouds.map(c => ({ owner: c.owner, x: rnd0(c.x), y: rnd0(c.y), life: c.life })),
      scores: this.score.slice(), pools: this.pool.map(p => p.slice()), out: this.out.slice(), events: this.events,
    };
  }
  // order: more catches first, then the earlier 1st catch, 2nd catch, ...; a disqualified player is last with no score
  order() {
    const dq = this.dqd || [false, false, false];
    const cmp = (a, b) => {
      if (dq[a] !== dq[b]) return dq[a] ? 1 : -1;
      if (this.score[a] !== this.score[b]) return this.score[b] - this.score[a];
      const x = this.catchTurns[a], y = this.catchTurns[b];
      for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i];
      return 0;
    };
    return { idx: [0, 1, 2].sort(cmp), cmp };
  }
  getResult() {
    const dq = this.dqd || [false, false, false];
    const { idx, cmp } = this.order();
    const ranks = [0, 0, 0];
    idx.forEach((p, i) => { ranks[p] = i > 0 && cmp(idx[i - 1], p) === 0 ? ranks[idx[i - 1]] : i + 1; });
    const scores = this.score.map((s, p) => dq[p] ? -1 : s);
    return { scores, ranks, winner: cmp(idx[0], idx[1]) === 0 ? null : idx[0], unitsLost: this.lost.slice(), firstCatch: this.catchTurns.map(c => c.length ? c[0] : null) };
  }

  // ---- review: what decided the game for each player, with stable codes
  review() {
    const out = [], rv = this.rv, res = this.getResult();
    for (let p = 0; p < 3; p++) {
      if (this.dqd && this.dqd[p]) continue;
      const prey = (p + 1) % 3;
      // every unit lost, by what the unit could still have done (at most 6 shown, the rest counted)
      const losses = rv.catches.filter(c => c.prey === p);
      losses.slice(0, 6).forEach(c => {
        if (c.held) out.push({ turn: c.turn, player: p, kind: 'mistake', code: 'caught-in-net', message: `Unit ${c.unit} was caught while a net held it. A held unit cannot run: net the hunter that is coming, or keep units out of net range (2000) of predators.` });
        else if (c.couldDash && !c.dashed) out.push({ turn: c.turn, player: p, kind: 'mistake', code: 'caught-with-dash-ready', message: `Unit ${c.unit} was caught with its dash ready and unused. A dash (1200) away from a predator that comes within about 1700 outruns its walk.` });
        else if (c.inCloud) out.push({ turn: c.turn, player: p, kind: 'warning', code: 'caught-in-smoke', message: `Unit ${c.unit} was caught inside a cloud, where it sees nothing. Leave the cloud on the side away from the predator's last position.` });
        else out.push({ turn: c.turn, player: p, kind: 'warning', code: 'caught', message: `Unit ${c.unit} was caught${c.hunterDashed ? ' by a dashing hunter' : ''}${c.dashed ? ' although it dashed' : ' with its dash on cooldown'}.` });
      });
      if (losses.length > 6) out.push({ turn: null, player: p, kind: 'warning', code: 'many-units-lost', message: `${losses.length} units lost in this game (the first 6 are listed).` });
      const rank = res.ranks[p];
      if (this.score[p] === 0) out.push({ turn: null, player: p, kind: 'mistake', code: 'no-catch', message: `No catch in ${this.turn} turns. Units must close in on player ${prey}'s units (within 440); dashes at prey 1100 to 2100 away and nets on prey that cannot dash convert contacts.` });
      if (rank > 1) {
        const above = [0, 1, 2].find(q => res.ranks[q] === rank - 1);
        if (above !== undefined && this.score[above] === this.score[p] && this.score[p] > 0) {
          const i = this.catchTurns[p].findIndex((t, k) => t !== this.catchTurns[above][k]);
          out.push({ turn: this.catchTurns[p][Math.max(0, i)], player: p, kind: 'warning', code: 'tie-lost-on-earlier-catch', message: `Same number of catches as player ${above} (${this.score[p]}), but its catch number ${Math.max(0, i) + 1} came on turn ${this.catchTurns[above][Math.max(0, i)]} and yours on turn ${this.catchTurns[p][Math.max(0, i)]}: earlier catches break ties.` });
        }
        const left = this.pool[p];
        if (left[0] > 0 && this.units.some(u => u.owner === prey && !u.ghost)) out.push({ turn: null, player: p, kind: 'tip', code: 'nets-unused', message: `${left[0]} net(s) left at the end while player ${prey} still had units. A net holds a unit for ${HOLD} turns; unused powers are worth nothing after turn ${TURNS}.` });
      }
      if (rv.nets[p] >= 3 && rv.netHits[p] === 0) out.push({ turn: null, player: p, kind: 'tip', code: 'nets-all-missed', message: `${rv.nets[p]} nets thrown, none held a unit of player ${prey}. Nets hit prey on dash cooldown about half the time and prey that can dash about a third.` });
      if (rv.dashes[p] === 0 && this.turn > 10) out.push({ turn: null, player: p, kind: 'tip', code: 'never-dashed', message: 'No dash in the whole game. DASH moves 1200 instead of 600; the k-th dash of a unit costs k turns of cooldown.' });
      if (rv.ignored[p]) out.push({ turn: rv.firstIgnored[p].turn, player: p, kind: 'warning', code: 'command-for-foreign-unit', message: `${rv.ignored[p]} command(s) named a unit that is not yours and were ignored (first: "${rv.firstIgnored[p].text}").` });
    }
    return out;
  }
}

module.exports = { Referee: TryCatchForestReferee };
