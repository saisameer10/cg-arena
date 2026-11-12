'use strict';
const { Referee, GameError } = require('../base');

const W = 30, H = 20;
const DIRS = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0] };
// Post-game review: a move is a flood-fill mistake when its region is under 60 % of the best one and 10+ cells smaller.
const CELLS = W * H, RV_RATIO = 0.6, RV_GAP = 10, RV_MAX_ITEMS = 8;
const cells = n => `${n} free cell${n === 1 ? '' : 's'}`;

class TronReferee extends Referee {
  static meta = { id: 'tron', name: 'Tron Battle', playerCount: 2, firstTurnTimeout: 1000, turnTimeout: 100, maxTurns: 600, viewer: 'tron' };

  constructor(opts) {
    super(opts);
    this.grid = Array.from({ length: H }, () => new Array(W).fill(-1));
    this.players = [];
    for (let p = 0; p < this.playerCount; p++) {
      let x, y;
      do { x = this.randInt(W); y = this.randInt(H); } while (this.grid[y][x] !== -1);
      this.grid[y][x] = p;
      this.players.push({ x0: x, y0: y, x, y, alive: true, trail: [[x, y]], lastMove: null, deathTurn: null });
    }
    this.aliveCount = this.playerCount;
    // review bookkeeping only (read by review(), never by the rules)
    this.rv = {
      lab: new Int32Array(CELLS), q: new Int32Array(CELLS), dA: new Int32Array(CELLS), dB: new Int32Array(CELLS), sizes: [],
      players: this.players.map(() => ({ last: null, prev: null, flagged: [], flaggedCount: 0, death: null })),
      split: null, lastMove: null,
    };
  }
  getStaticInfo() { return { width: W, height: H }; }
  getActors() { return this.players.map((p, i) => p.alive ? i : -1).filter(i => i >= 0); }
  getTurnInput(p) {
    const lines = [`${this.playerCount} ${p}`];
    for (const q of this.players) lines.push(q.alive ? `${q.x0} ${q.y0} ${q.x} ${q.y}` : '-1 -1 -1 -1');
    return lines;
  }
  applyOutput(p, lines) {
    try { this.rvBeforeMove(p, lines); } catch (e) { /* the review must never affect the game */ }
    const cmd = (lines[0] || '').trim().toUpperCase().split(/\s+/)[0];
    const d = DIRS[cmd];
    if (!d) throw new GameError(`invalid output "${lines[0]}" (expected UP, DOWN, LEFT or RIGHT)`);
    const pl = this.players[p];
    pl.lastMove = cmd;
    const nx = pl.x + d[0], ny = pl.y + d[1];
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) return this.kill(p, `drove off the grid (${cmd})`);
    if (this.grid[ny][nx] !== -1) return this.kill(p, `crashed into a light wall at (${nx}, ${ny})`);
    pl.x = nx; pl.y = ny;
    this.grid[ny][nx] = p;
    pl.trail.push([nx, ny]);
    this.rv.lastMove = { frame: this.turn + 1, player: p, dir: cmd };
  }
  kill(p, reason) {
    const pl = this.players[p];
    if (!pl.alive) return;
    try { this.rvDeath(p, reason); } catch (e) { /* review only */ }
    pl.alive = false;
    pl.deathTurn = this.turn;
    for (const [x, y] of pl.trail) this.grid[y][x] = -1;   // a dead player's wall disappears
    this.aliveCount--;
    this.log(`Player ${p} ${reason}`);
  }
  onDisqualify(p, reason) { this.kill(p, `eliminated: ${reason}`); }
  isGameOver() { return this.aliveCount <= 1; }
  getFrame() {
    return { players: this.players.map(p => ({ x: p.x, y: p.y, x0: p.x0, y0: p.y0, alive: p.alive, lastMove: p.lastMove, trail: p.alive ? p.trail.slice() : [] })) };
  }
  getResult() {
    const scores = this.players.map(p => p.alive ? this.turn + 1 : p.deathTurn);
    const best = Math.max(...scores);
    const winners = scores.map((s, i) => s === best ? i : -1).filter(i => i >= 0);
    return { scores, winner: winners.length === 1 ? winners[0] : null };
  }

  // ---- post-game review --------------------------------------------------------------
  // Before every move: label the free regions once (O(cells)), note the region each legal move leads into,
  // whether the two players still share a region, and how the move ends. review() turns that into advice.

  rvLabel() {   // lab[cell] = region id of a free cell (-1 for walls), sizes[id] = cells in that region
    const { lab, q, sizes } = this.rv, g = this.grid;
    lab.fill(-1); sizes.length = 0;
    for (let s = 0; s < CELLS; s++) {
      if (lab[s] !== -1 || g[(s / W) | 0][s % W] !== -1) continue;
      const k = sizes.length;
      let head = 0, tail = 0;
      lab[s] = k; q[tail++] = s;
      while (head < tail) {
        const c = q[head++], x = c % W, y = (c - x) / W;
        if (x > 0 && lab[c - 1] === -1 && g[y][x - 1] === -1) { lab[c - 1] = k; q[tail++] = c - 1; }
        if (x < W - 1 && lab[c + 1] === -1 && g[y][x + 1] === -1) { lab[c + 1] = k; q[tail++] = c + 1; }
        if (y > 0 && lab[c - W] === -1 && g[y - 1][x] === -1) { lab[c - W] = k; q[tail++] = c - W; }
        if (y < H - 1 && lab[c + W] === -1 && g[y + 1][x] === -1) { lab[c + W] = k; q[tail++] = c + W; }
      }
      sizes.push(tail);
    }
  }
  rvMoves(pl) {   // legal moves with the size of the region each leads into (needs rvLabel)
    const out = [];
    for (const dir in DIRS) {
      const x = pl.x + DIRS[dir][0], y = pl.y + DIRS[dir][1];
      if (x < 0 || y < 0 || x >= W || y >= H || this.grid[y][x] !== -1) continue;
      const idx = x + y * W, label = this.rv.lab[idx];
      out.push({ dir, idx, label, area: this.rv.sizes[label] });
    }
    return out;
  }
  rvReach(moves) {   // free cells reachable from a head = the distinct regions around it
    const seen = new Set();
    let n = 0;
    for (const m of moves) if (!seen.has(m.label)) { seen.add(m.label); n += m.area; }
    return n;
  }
  rvDist(start, dist, blocked) {   // BFS over free cells from start (which may be a head); the visited cells end up in rv.q
    const q = this.rv.q, g = this.grid;
    dist.fill(-1); dist[start] = 0;
    let head = 0, tail = 0;
    q[tail++] = start;
    while (head < tail) {
      const c = q[head++], x = c % W, y = (c - x) / W, d = dist[c] + 1;
      if (x > 0 && dist[c - 1] === -1 && c - 1 !== blocked && g[y][x - 1] === -1) { dist[c - 1] = d; q[tail++] = c - 1; }
      if (x < W - 1 && dist[c + 1] === -1 && c + 1 !== blocked && g[y][x + 1] === -1) { dist[c + 1] = d; q[tail++] = c + 1; }
      if (y > 0 && dist[c - W] === -1 && c - W !== blocked && g[y - 1][x] === -1) { dist[c - W] = d; q[tail++] = c - W; }
      if (y < H - 1 && dist[c + W] === -1 && c + W !== blocked && g[y + 1][x] === -1) { dist[c + W] = d; q[tail++] = c + W; }
    }
    return tail;
  }
  // Cells of the region behind `start` that this player reaches strictly before the opponent (who moves next).
  rvTerritory(start, oppHead) {
    const { dA, dB, q } = this.rv;
    this.rvDist(oppHead, dB, start);
    const n = this.rvDist(start, dA, -1);
    let own = 0;
    for (let i = 0; i < n; i++) { const c = q[i]; if (dB[c] === -1 || dA[c] < dB[c]) own++; }
    return own;
  }

  rvBeforeMove(p, lines) {
    const rv = this.rv, r = rv.players[p], me = this.players[p], frame = this.turn + 1;
    const oi = this.playerCount === 2 ? 1 - p : -1;
    const opp = oi >= 0 && this.players[oi].alive ? this.players[oi] : null;
    this.rvLabel();
    const moves = this.rvMoves(me), oppMoves = opp ? this.rvMoves(opp) : [];
    const oppLabels = new Set(oppMoves.map(m => m.label));
    // the first time the two heads no longer share a region, the last move played cut the board in two
    if (opp && !rv.split && moves.length && oppMoves.length && !moves.some(m => oppLabels.has(m.label))) {
      const lm = rv.lastMove, area = [], from = [];
      area[p] = this.rvReach(moves); from[p] = frame;
      area[oi] = this.rvReach(oppMoves); from[oi] = oi < p ? frame + 1 : frame;   // first frame each one moves inside its side
      // the player who notices is the one who did not cut: remember its last move and where the cutter went
      rv.split = { frame: lm ? lm.frame : frame, cutter: lm ? lm.player : null, dir: lm ? lm.dir : null, area, from,
        victim: p, victimPrev: r.last, cutterAt: [opp.x, opp.y] };
    }
    const cmd = (lines[0] || '').trim().toUpperCase().split(/\s+/)[0];
    const rec = { frame, x: me.x, y: me.y, cmd, best: null, chosen: null, outcome: 'ok', cell: null, head: false };
    for (const m of moves) if (!rec.best || m.area > rec.best.area) rec.best = m;
    rec.chosen = moves.find(m => m.dir === cmd) || null;
    const d = DIRS[cmd];
    if (!d) rec.outcome = 'invalid';
    else if (!rec.chosen) {
      const nx = me.x + d[0], ny = me.y + d[1];
      rec.cell = [nx, ny];
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) rec.outcome = 'off';
      else {
        const owner = this.grid[ny][nx], o = this.players[owner];
        rec.outcome = owner === p ? 'own' : 'opp';
        rec.head = owner !== p && !!o && o.x === nx && o.y === ny;
      }
    }
    r.prev = r.last; r.last = rec;
    const c = rec.chosen;
    if (!c) return;
    const better = moves.filter(m => m.area - c.area >= RV_GAP && c.area < RV_RATIO * m.area);
    if (!better.length) return;
    // a region the opponent can also enter only counts the cells we reach first (Voronoi), so a smaller but
    // safe region chosen over a bigger contested one is not a mistake
    const oppHead = opp ? opp.x + opp.y * W : -1;
    const value = m => oppLabels.has(m.label) ? this.rvTerritory(m.idx, oppHead) : m.area;
    const cv = value(c);
    let best = null, bv = -1;
    for (const m of better) { const v = value(m); if (v > bv) { bv = v; best = m; } }
    if (bv - cv < RV_GAP || cv >= RV_RATIO * bv) return;
    r.flaggedCount++;
    if (r.flagged.length < 2) {
      r.flagged.push({ frame, x: me.x, y: me.y, dir: cmd, area: c.area, value: cv, shared: oppLabels.has(c.label),
        bestDir: best.dir, bestArea: best.area, bestValue: bv, bestShared: oppLabels.has(best.label) });
    }
  }

  rvDeath(p, reason) {
    const r = this.rv.players[p], frame = this.turn + 1;
    const rec = r.last && r.last.frame === frame ? r.last : null;
    const o = this.playerCount === 2 ? this.players[1 - p] : null;
    const death = { frame, reason, dq: this.dq[p] || null, rec, reach: null, opp: o && o.alive ? [o.x, o.y] : null };
    if (!rec) { this.rvLabel(); death.reach = this.rvReach(this.rvMoves(this.players[p])); }   // timeout: no move analysed this turn
    r.death = death;
  }

  review() {
    const items = [];
    for (let p = 0; p < this.playerCount; p++) {
      try { items.push(...this.rvItems(p)); } catch (e) { /* skip this player's review rather than fail */ }
    }
    return items;
  }

  rvItems(p) {
    const rv = this.rv, r = rv.players[p], items = [];
    const add = (prio, turn, kind, code, message) => items.push({ prio, turn, player: p, kind, code, message });
    const { scores } = this.getResult();
    const lost = scores[p] < Math.max(...scores);
    const oi = 1 - p;
    const sealedMsg = (prev, at, left) => `Turn ${prev.frame}: ${prev.cmd} from (${prev.x}, ${prev.y}) still led to ${cells(prev.chosen.area)}, but the opponent then moved to (${at[0]}, ${at[1]}) and ${left ? `left you only ${cells(left)}` : 'closed your only way out'}. Avoid cells whose exit the opponent can reach first (compare your distance and its distance to the exit).`;

    // how the player died
    const d = r.death;
    if (d) {
      const rec = d.rec, prev = rec ? r.prev : r.last;
      let msg, code = 'death-invalid';
      if (d.dq) {
        if (/^timeout/.test(d.dq)) code = 'death-timeout';
        msg = `Turn ${d.frame}: you were eliminated (${d.dq}).`;
        if (/^timeout/.test(d.dq)) msg += ` Keep every turn well under the ${TronReferee.meta.turnTimeout} ms limit${d.reach !== null ? `; you still had ${cells(d.reach)} within reach` : ''}.`;
        else if (rec && rec.outcome === 'invalid') msg += ' Print exactly one of UP, DOWN, LEFT or RIGHT per turn.';
      } else if (rec) {
        const from = `${rec.cmd} from (${rec.x}, ${rec.y})`, at = rec.cell ? `(${rec.cell[0]}, ${rec.cell[1]})` : '';
        code = rec.outcome === 'off' ? 'death-wall' : rec.outcome === 'own' ? 'death-own-trail' : 'death-opponent-trail';
        if (rec.outcome === 'off') msg = `Turn ${d.frame}: you drove off the grid (${from}).`;
        else if (rec.outcome === 'own') msg = `Turn ${d.frame}: you crashed into your own trail at ${at} (${from}).`;
        else msg = `Turn ${d.frame}: you crashed into the opponent's ${rec.head ? 'head' : 'light wall'} at ${at} (${from}).`;
        msg += rec.best ? ` ${rec.best.dir} was still free (${cells(rec.best.area)} behind it): check every neighbour against the walls and both trails before moving.`
          : ' No neighbour was free any more: you were boxed in.';
      } else msg = `Turn ${d.frame}: you were eliminated (${d.reason}).`;
      // boxed in although the previous move still led somewhere: only the opponent's move in between can have closed it
      const sealed = rec && !rec.best && !d.dq && prev && prev.chosen && prev.chosen.area >= RV_GAP && d.opp;
      if (sealed) {
        add(95, prev.frame, 'mistake', 'cut-off', sealedMsg(prev, d.opp, 0));
      } else if (prev && prev.best) {
        msg += ` One turn earlier (turn ${prev.frame}) you could still reach ${cells(prev.best.area)}`
          + (prev.chosen && prev.chosen.area < prev.best.area && !r.flagged.some(f => f.frame === prev.frame) ? `, but ${prev.cmd} kept only ${prev.chosen.area} of them (${prev.best.dir} kept ${prev.best.area})` : '') + '.';
      }
      add(100, d.frame, 'mistake', code, msg);
    }

    // moves into a clearly smaller region (first two)
    r.flagged.forEach((f, i) => {
      let msg = `Turn ${f.frame}: at (${f.x}, ${f.y}) you went ${f.dir} into a region of ${cells(f.area)}`
        + (f.shared ? ` (only ${f.value} of them closer to you than to the opponent)` : '')
        + `, while ${f.bestDir} led to ${f.bestArea}` + (f.bestShared ? ` (${f.bestValue} closer to you)` : '') + '.';
      if (i === 0) msg += ' Flood-fill each possible move and take the biggest region.';
      if (i === r.flagged.length - 1 && r.flaggedCount > r.flagged.length) msg += ` You made ${r.flaggedCount} such moves in this game.`;
      add(90 - i, f.frame, 'mistake', 'smaller-region', msg);
    });

    // territory: who got the bigger side when the board split
    const s = rv.split;
    if (s && this.playerCount === 2) {
      const a = s.area[p], b = s.area[oi];
      const vp = s.victim === p ? s.victimPrev : null;
      if (lost && b - a >= RV_GAP) {
        if (s.cutter === p) {   // not repeated when the same move is already reported as a smaller-region mistake
          if (!r.flagged.some(f => f.frame === s.frame)) add(80, s.frame, 'mistake', 'cut-off', `Turn ${s.frame}: your move ${s.dir} split the board and left you the smaller side (${cells(a)} against the opponent's ${b}). Before closing a gap, check that you reach more cells first than the opponent does (Voronoi).`);
        } else if (a < RV_GAP && vp && vp.chosen && vp.chosen.area >= RV_GAP) {   // walked into a pocket the opponent could close
          add(95, vp.frame, 'mistake', 'cut-off', sealedMsg(vp, s.cutterAt, a));
        } else {
          add(80, s.frame, 'tip', 'cut-off', `Turn ${s.frame}: the opponent cut the board in two and kept the bigger side (${b} free cells against your ${a}). Compare who reaches each cell first (Voronoi territory) and race for the gap between you before it closes.`);
        }
      }
      // space filling once walled off
      if (d && !d.dq && s.from[p] <= d.frame) {
        const used = d.frame - s.from[p];
        if (a - used >= RV_GAP && used < 0.75 * a) {
          const avoidable = lost && a > b;
          add(avoidable ? 85 : 70, d.frame, avoidable ? 'mistake' : 'tip', 'poor-fill', `After the board split at turn ${s.frame} you had ${cells(a)} to yourself${avoidable ? ` (the opponent only ${b})` : ''} but crashed after ${used} moves. Once you are walled off, fill your region tightly: hug the walls and do not leave pockets behind.`);
        }
      }
    }
    return items.sort((x, y) => y.prio - x.prio).slice(0, RV_MAX_ITEMS).map(({ prio, ...it }) => it);
  }
}

module.exports = { Referee: TronReferee };
