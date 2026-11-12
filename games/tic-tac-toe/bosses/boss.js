'use strict';
// Ultimate Tic-Tac-Toe bosses. Level = first argument: wood | bronze | silver. They are ordinary bots: they read
// nothing but stdin, play only cells from the valid-action list (so they are legal in every league) and are
// deterministic (seeded random numbers, fixed number of playouts).
//
//  wood   = the official CodinGame boss (config/Boss.java in https://github.com/CodinGame/game-ultimate-tictactoe):
//           new Random(0), then actions.get(random.nextInt(validActionCount)) every turn. Our referee lists the
//           actions in CodinGame's shuffled order, so with a CodinGame seed this plays the same moves as their boss.
//  bronze = one clear idea: win small boards and never hand a board (or a free choice of board) to the opponent,
//           judged one move ahead. On the Wood 3x3 board: win if possible, else block, else random.
//  silver = Monte Carlo tree search over every rule (sent-to board, free choice, the board-count tie-break) with a
//           fixed number of playouts. On the Wood 3x3 board: perfect play (minimax) that prefers moves setting traps.
const level = process.argv[2] || 'bronze';
const SILVER_PLAYOUTS = 3000;      // fixed for determinism; a time guard stops early only on a very slow machine
const SILVER_GUARD_MS = 300;       // safety net only (first turn: 900 ms): bosses get 4x the 100 ms limit here, so the fixed playout count decides and the boss stays deterministic

// ---- java.util.Random (what Boss.java uses: the constructor and nextInt(bound))
class JavaRandom {
  constructor(seed) { this.seed = (BigInt(seed) ^ 0x5DEECE66Dn) & ((1n << 48n) - 1n); }
  next(bits) { this.seed = (this.seed * 0x5DEECE66Dn + 0xBn) & ((1n << 48n) - 1n); return Number(this.seed >> BigInt(48 - bits)); }
  nextInt(bound) {
    let r = this.next(31);
    const m = bound - 1;
    if ((bound & m) === 0) return Number((BigInt(bound) * BigInt(r)) >> 31n);
    for (let u = r; u - (r = u % bound) + m > 0x7fffffff; u = this.next(31));
    return r;
  }
}
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---- position model. cell = board * 9 + inner (board = row/3*3 + col/3, inner = row%3*3 + col%3); Wood: board 0 only
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const WIN = new Uint8Array(512), POP = new Uint8Array(512);
const NTH = new Int8Array(512 * 9);     // NTH[mask * 9 + k] = index of the k-th set bit of mask
for (let m = 0; m < 512; m++) {
  WIN[m] = LINES.some(l => l.every(i => (m >> i) & 1)) ? 1 : 0;
  for (let i = 0; i < 9; i++) if ((m >> i) & 1) NTH[m * 9 + POP[m]++] = i;
}
class Pos {
  constructor(lv) {
    this.level = lv;
    this.m = new Int32Array(18);         // m[p * 9 + board]
    this.status = new Uint8Array(9);     // 0 open, 1/2 won by P0/P1, 3 full
    this.big = new Int32Array(2);
    this.last = -1; this.toMove = 0; this.over = false; this.winner = -1;
    this.stack = [];
  }
  copyFrom(o) {
    this.m.set(o.m); this.status.set(o.status); this.big.set(o.big);
    this.last = o.last; this.toMove = o.toMove; this.over = o.over; this.winner = o.winner;
  }
  cell(r, c) { return this.level === 1 ? r * 3 + c : (((r / 3) | 0) * 3 + ((c / 3) | 0)) * 9 + (r % 3) * 3 + (c % 3); }
  rowCol(mv) {
    if (this.level === 1) return [(mv / 3) | 0, mv % 3];
    const b = (mv / 9) | 0, i = mv % 9;
    return [((b / 3) | 0) * 3 + ((i / 3) | 0), (b % 3) * 3 + (i % 3)];
  }
  moves(out) {
    out.length = 0;
    if (this.over) return out;
    if (this.level === 1) {
      const occ = this.m[0] | this.m[9];
      for (let i = 0; i < 9; i++) if (!((occ >> i) & 1)) out.push(i);
      return out;
    }
    const f = this.last >= 0 && this.status[this.last] === 0 ? this.last : -1;
    const lo = f >= 0 ? f : 0, hi = f >= 0 ? f + 1 : 9;
    for (let b = lo; b < hi; b++) {
      if (this.status[b] !== 0) continue;
      const occ = this.m[b] | this.m[9 + b];
      for (let i = 0; i < 9; i++) if (!((occ >> i) & 1)) out.push(b * 9 + i);
    }
    return out;
  }
  // uniformly random legal move without building a list (playouts; nine boards only)
  randomMove(rnd) {
    const f = this.last >= 0 && this.status[this.last] === 0 ? this.last : -1;
    if (f >= 0) { const e = ~(this.m[f] | this.m[9 + f]) & 511; return f * 9 + NTH[e * 9 + ((rnd() * POP[e]) | 0)]; }
    let total = 0;
    for (let b = 0; b < 9; b++) if (this.status[b] === 0) total += POP[~(this.m[b] | this.m[9 + b]) & 511];
    let k = (rnd() * total) | 0;
    for (let b = 0; b < 9; b++) {
      if (this.status[b] !== 0) continue;
      const e = ~(this.m[b] | this.m[9 + b]) & 511, c = POP[e];
      if (k < c) return b * 9 + NTH[e * 9 + k];
      k -= c;
    }
    return -1;
  }
  winsBoard(mv, p) { const b = (mv / 9) | 0; return WIN[this.m[p * 9 + b] | (1 << (mv % 9))] === 1; }
  apply(mv) {   // no undo information (playouts)
    const b = (mv / 9) | 0, i = mv % 9, p = this.toMove, k = p * 9 + b;
    this.m[k] |= 1 << i;
    if (this.level === 1) {
      if (WIN[this.m[k]]) { this.over = true; this.winner = p; } else if ((this.m[0] | this.m[9]) === 511) { this.over = true; this.winner = -1; }
    } else {
      if (WIN[this.m[k]]) {
        this.status[b] = p + 1; this.big[p] |= 1 << b;
        if (WIN[this.big[p]]) { this.over = true; this.winner = p; }
      } else if ((this.m[b] | this.m[9 + b]) === 511) this.status[b] = 3;
      if (!this.over && this.status[b] !== 0) {
        let open = false;
        for (let x = 0; x < 9; x++) if (this.status[x] === 0) { open = true; break; }
        if (!open) { const a = POP[this.big[0]], c = POP[this.big[1]]; this.over = true; this.winner = a > c ? 0 : c > a ? 1 : -1; }
      }
    }
    this.last = i; this.toMove = p ^ 1;
  }
  play(mv) {
    const b = (mv / 9) | 0;
    this.stack.push(mv, this.last, this.status[b], this.big[this.toMove], this.over ? 1 : 0, this.winner);
    this.apply(mv);
  }
  undo() {
    const s = this.stack;
    const winner = s.pop(), over = s.pop(), big = s.pop(), st = s.pop(), last = s.pop(), mv = s.pop();
    const b = (mv / 9) | 0;
    this.toMove ^= 1;
    this.m[this.toMove * 9 + b] &= ~(1 << (mv % 9));
    this.status[b] = st; this.big[this.toMove] = big; this.over = !!over; this.winner = winner; this.last = last;
  }
}

// ---- bronze: one move ahead
function bronze(pos, legal, rnd) {
  const me = pos.toMove, opp = me ^ 1;
  if (pos.level === 1) {
    for (const mv of legal) { pos.play(mv); const w = pos.over && pos.winner === me; pos.undo(); if (w) return mv; }
    for (const mv of legal) if (WIN[pos.m[opp * 9] | (1 << mv)]) return mv;      // block
    return legal[(rnd() * legal.length) | 0];
  }
  let best = legal[0], bestScore = -Infinity;
  const buf = [];
  for (const mv of legal) {
    const wins = pos.winsBoard(mv, me), blocks = pos.winsBoard(mv, opp), inner = mv % 9;
    pos.play(mv);
    let s;
    if (pos.over) s = pos.winner === me ? 1e6 : pos.winner === -1 ? 0 : -1e6;
    else {
      s = 0;
      if (wins) s += 100;
      if (blocks) s += 30;
      const replies = pos.moves(buf);
      const free = pos.status[pos.last] !== 0;
      let gameWin = false, boardWin = false;
      for (const r of replies) {
        if (pos.winsBoard(r, opp)) {
          boardWin = true;
          pos.play(r); if (pos.over && pos.winner === opp) gameWin = true; pos.undo();
          if (gameWin) break;
        }
      }
      if (gameWin) s -= 10000;
      if (boardWin) s -= 80;
      if (free) s -= 40;
      s += inner === 4 ? 3 : (inner === 0 || inner === 2 || inner === 6 || inner === 8) ? 2 : 0;
    }
    pos.undo();
    s += rnd() * 0.5;
    if (s > bestScore) { bestScore = s; best = mv; }
  }
  return best;
}

// ---- silver on 3x3: exact minimax, prefers the move that leaves the opponent the most losing replies
const memo3 = new Map();
function solve3(pos) {   // value for the side to move: 1 win, 0 draw, -1 loss
  const key = pos.m[0] | (pos.m[9] << 9) | (pos.toMove << 18);
  if (memo3.has(key)) return memo3.get(key);
  let best = -1;
  const list = pos.moves([]);
  for (const mv of list) {
    pos.play(mv);
    const v = pos.over ? (pos.winner === -1 ? 0 : 1) : -solve3(pos);
    pos.undo();
    if (v > best) best = v;
    if (best === 1) break;
  }
  memo3.set(key, best);
  return best;
}
function silver3(pos, legal) {
  const ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  let best = null, bestKey = -Infinity;
  for (const mv of [...legal].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))) {
    pos.play(mv);
    let v, traps = 0;
    if (pos.over) v = pos.winner === -1 ? 0 : 1;
    else {
      v = -solve3(pos);
      for (const r of pos.moves([])) { pos.play(r); if (!pos.over && solve3(pos) === 1) traps++; pos.undo(); }   // replies that lose for the opponent
    }
    pos.undo();
    const key = v * 100 + traps;
    if (key > bestKey) { bestKey = key; best = mv; }
  }
  return best;
}

// ---- silver on nine boards: UCT Monte Carlo tree search
const CAP = 1 << 19;
const nMove = new Int16Array(CAP), nFirst = new Int32Array(CAP), nCount = new Int16Array(CAP), nMover = new Int8Array(CAP);
const nVisits = new Float64Array(CAP), nWins = new Float64Array(CAP);
function mcts(root, legal, playouts, deadline, rnd) {
  const me = root.toMove;
  for (const mv of legal) { root.play(mv); const w = root.over && root.winner === me; root.undo(); if (w) return { mv, n: 0, rate: 1 }; }
  const s = new Pos(root.level), buf = [], path = new Int32Array(100);
  let size = 1;
  nCount[0] = 0; nVisits[0] = 0; nWins[0] = 0; nMover[0] = me ^ 1;
  let it = 0;
  for (; it < playouts; it++) {
    if ((it & 63) === 63 && Date.now() > deadline) break;
    s.copyFrom(root);
    let node = 0, depth = 0;
    path[depth++] = 0;
    while (nCount[node] > 0) {        // selection
      const lnN = Math.log(nVisits[node]);
      let bestC = -1, bestV = -Infinity;
      for (let c = nFirst[node], e = c + nCount[node]; c < e; c++) {
        if (nVisits[c] === 0) { bestC = c; break; }
        const v = nWins[c] / nVisits[c] + Math.sqrt(lnN / nVisits[c]);
        if (v > bestV) { bestV = v; bestC = c; }
      }
      node = bestC;
      s.apply(nMove[node]);
      path[depth++] = node;
    }
    if (!s.over && (node === 0 || nVisits[node] > 0) && size + 81 < CAP) {   // expansion: all children at once
      const list = s.moves(buf);
      for (let k = list.length - 1; k > 0; k--) { const j = (rnd() * (k + 1)) | 0; const t = list[k]; list[k] = list[j]; list[j] = t; }
      nFirst[node] = size; nCount[node] = list.length;
      for (const mv of list) { nMove[size] = mv; nCount[size] = 0; nVisits[size] = 0; nWins[size] = 0; nMover[size] = s.toMove; size++; }
      node = nFirst[node];
      s.apply(nMove[node]);
      path[depth++] = node;
    }
    while (!s.over) s.apply(s.randomMove(rnd));   // playout
    const w = s.winner;
    for (let k = 0; k < depth; k++) {
      const n = path[k];
      nVisits[n]++;
      nWins[n] += w === -1 ? 0.5 : w === nMover[n] ? 1 : 0;
    }
  }
  let best = nFirst[0], bv = -1;
  for (let c = nFirst[0], e = c + nCount[0]; c < e; c++) if (nVisits[c] > bv) { bv = nVisits[c]; best = c; }
  return { mv: nMove[best], n: it, rate: nVisits[best] ? nWins[best] / nVisits[best] : 0 };
}

// ---- main loop
const javaRandom = new JavaRandom(0);
// Random tie-breaks are seeded from the first input: the referee shuffles the valid actions with the game seed, so the
// same seed replays the same game while different seeds give different games (stdin is all a boss may read).
let rnd = null;
const history = [];      // [row, col] of every move, in order (player 0 moved first)
let lv = 0;              // 0 unknown, 1 Wood (3x3), 2 nine boards
let turn = 0;
for (;;) {
  const line = readline();
  if (line === null) break;
  const t0 = Date.now();
  const [oppRow, oppCol] = line.trim().split(/\s+/).map(Number);
  const count = parseInt(readline(), 10);
  const actions = [];
  for (let i = 0; i < count; i++) actions.push(readline().trim().split(/\s+/).map(Number));
  if (!rnd) {
    let h = level === 'silver' ? 0x51173 : 0xB607;
    for (const v of [oppRow, oppCol, ...actions.flat()]) h = Math.imul(h ^ (v + 2), 0x9E3779B1) >>> 0;
    rnd = mulberry32(h);
  }
  if (oppRow >= 0) history.push([oppRow, oppCol]);
  // league: nine boards as soon as a coordinate >= 3 or more than 9 actions show up; Wood when it cannot be nine
  // boards. The only undecidable input is the second player's first turn after "0 0" with 8 actions (both leagues).
  if (!lv && (count > 9 || oppRow >= 3 || oppCol >= 3 || actions.some(([r, c]) => r >= 3 || c >= 3))) lv = 2;
  const ambiguous = !lv && history.length === 1 && oppRow === 0 && oppCol === 0 && count === 8;
  if (!lv && !ambiguous) lv = 1;

  let pick = null, note = '';
  if (level === 'wood') {
    pick = actions[javaRandom.nextInt(actions.length)];
  } else if (ambiguous) {
    pick = actions.find(([r, c]) => r === 1 && c === 1) || actions[0];
    note = 'league not known yet: center';
  } else {
    const pos = new Pos(lv);
    for (const [r, c] of history) pos.play(pos.cell(r, c));
    const legal = pos.moves([]);
    const given = new Set(actions.map(([r, c]) => pos.cell(r, c)));
    if (legal.length !== given.size || legal.some(m => !given.has(m))) {
      note = 'model out of sync: first listed action';
      pick = actions[0];
    } else {
      let mv;
      if (level === 'bronze') mv = bronze(pos, legal, rnd);
      else if (lv === 1) mv = silver3(pos, legal);
      else {
        const r = mcts(pos, legal, SILVER_PLAYOUTS, t0 + (turn === 0 ? 900 : SILVER_GUARD_MS), rnd);
        mv = r.mv;
        note = `${r.n} playouts, win rate ${r.rate.toFixed(2)}`;
      }
      pick = pos.rowCol(mv);
    }
  }
  history.push(pick);
  turn++;
  printErr(`boss ${level}: ${pick[0]} ${pick[1]}${note ? ' (' + note + ')' : ''} ${Date.now() - t0} ms`);
  print(`${pick[0]} ${pick[1]}`);
}
