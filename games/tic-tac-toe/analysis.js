'use strict';
// Ultimate Tic-Tac-Toe position model and bounded search, used ONLY by the post-game review in referee.js
// (the rules themselves are the port of the official referee; nothing here can change a game).
//
// A cell is numbered board * 9 + inner, with board = (row / 3) * 3 + col / 3 and inner = (row % 3) * 3 + col % 3
// in protocol coordinates (row, col 0..8). Wood (level 1, a single 3x3 board) uses board 0 only: cell = row * 3 + col.

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const WIN = new Uint8Array(512);     // WIN[mask] = 1 when the 9-bit mask holds a line
const POP = new Uint8Array(512);
for (let m = 0; m < 512; m++) {
  WIN[m] = LINES.some(l => l.every(i => (m >> i) & 1)) ? 1 : 0;
  let c = 0; for (let i = 0; i < 9; i++) c += (m >> i) & 1;
  POP[m] = c;
}
const ABORT = { aborted: true };     // thrown when a search exceeds its node budget
const BOARD_NAMES = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];

class Pos {
  constructor(level) {
    this.level = level;
    this.m = [new Uint16Array(9), new Uint16Array(9)];   // marks per player per board
    this.status = new Uint8Array(9);                     // 0 open, 1 won by P0, 2 won by P1, 3 full without winner
    this.big = [0, 0];                                   // boards won, as 9-bit masks of the main board
    this.last = -1;                                      // inner index of the last move = board the next player is sent to
    this.toMove = 0;
    this.over = false;
    this.winner = -1;                                    // when over: 0, 1, or -1 for a draw
    this.stack = new Int32Array(6 * 128);           // undo records: mv, last, status[b], big[p], over, winner
    this.sp = 0;
    this.bufs = [];
    this.kinds = [];
    this.nodes = 0;
    this.budget = Infinity;
  }
  cell(r, c) { return this.level === 1 ? r * 3 + c : (((r / 3) | 0) * 3 + ((c / 3) | 0)) * 9 + (r % 3) * 3 + (c % 3); }
  rowCol(mv) {
    if (this.level === 1) return [(mv / 3) | 0, mv % 3];
    const b = (mv / 9) | 0, i = mv % 9;
    return [((b / 3) | 0) * 3 + ((i / 3) | 0), (b % 3) * 3 + (i % 3)];
  }
  txt(mv) { const [r, c] = this.rowCol(mv); return `${r} ${c}`; }
  // the board the side to move must play in, or -1 when it may play in any open board (level 2 only)
  forcedBoard() { return this.level === 2 && this.last >= 0 && this.status[this.last] === 0 ? this.last : -1; }
  moves(out = []) {
    out.length = 0;
    if (this.over) return out;
    if (this.level === 1) {
      const occ = this.m[0][0] | this.m[1][0];
      for (let i = 0; i < 9; i++) if (!((occ >> i) & 1)) out.push(i);
      return out;
    }
    const f = this.forcedBoard();
    for (let b = f >= 0 ? f : 0; b < (f >= 0 ? f + 1 : 9); b++) {
      if (this.status[b] !== 0) continue;
      const occ = this.m[0][b] | this.m[1][b];
      for (let i = 0; i < 9; i++) if (!((occ >> i) & 1)) out.push(b * 9 + i);
    }
    return out;
  }
  winsBoard(mv, p = this.toMove) { const b = (mv / 9) | 0; return !!WIN[this.m[p][b] | (1 << (mv % 9))]; }
  // What playing mv does for the side to move, without playing it: 1 wins the game, -1 ends it lost (every board
  // closed with fewer boards won), 0 ends it drawn, 3 wins a small board and the game goes on, 2 anything else.
  quick(mv) {
    const p = this.toMove, b = (mv / 9) | 0, nm = this.m[p][b] | (1 << (mv % 9));
    if (this.level === 1) return WIN[nm] ? 1 : (nm | this.m[p ^ 1][0]) === 511 ? 0 : 2;
    let won = 0;
    if (WIN[nm]) { if (WIN[this.big[p] | (1 << b)]) return 1; won = 1; }
    else if ((nm | this.m[p ^ 1][b]) !== 511) return 2;
    for (let k = 0; k < 9; k++) if (k !== b && this.status[k] === 0) return won ? 3 : 2;
    const a = POP[this.big[p]] + won, o = POP[this.big[p ^ 1]];
    return a > o ? 1 : a < o ? -1 : 0;
  }
  play(mv) {
    const b = (mv / 9) | 0, i = mv % 9, p = this.toMove, m = this.m[p];
    if (this.sp + 6 > this.stack.length) { const n = new Int32Array(this.stack.length * 2); n.set(this.stack); this.stack = n; }
    const st = this.stack, k0 = this.sp;
    st[k0] = mv; st[k0 + 1] = this.last; st[k0 + 2] = this.status[b]; st[k0 + 3] = this.big[p]; st[k0 + 4] = this.over ? 1 : 0; st[k0 + 5] = this.winner;
    this.sp = k0 + 6;
    m[b] |= 1 << i;
    if (this.level === 1) {
      if (WIN[m[0]]) { this.over = true; this.winner = p; }
      else if ((this.m[0][0] | this.m[1][0]) === 511) { this.over = true; this.winner = -1; }
    } else {
      if (WIN[m[b]]) {
        this.status[b] = p + 1;
        this.big[p] |= 1 << b;
        if (WIN[this.big[p]]) { this.over = true; this.winner = p; }
      } else if ((this.m[0][b] | this.m[1][b]) === 511) this.status[b] = 3;
      if (!this.over && this.status[b] !== 0) {
        let open = false;
        for (let k = 0; k < 9; k++) if (this.status[k] === 0) { open = true; break; }
        if (!open) {   // every board closed: most boards won wins
          const a = POP[this.big[0]], c = POP[this.big[1]];
          this.over = true; this.winner = a > c ? 0 : c > a ? 1 : -1;
        }
      }
    }
    this.last = i;
    this.toMove = p ^ 1;
  }
  undo() {
    const st = this.stack, k0 = this.sp - 6;
    this.sp = k0;
    const mv = st[k0], b = (mv / 9) | 0;
    this.toMove ^= 1;
    const p = this.toMove;
    this.m[p][b] &= ~(1 << (mv % 9));
    this.last = st[k0 + 1]; this.status[b] = st[k0 + 2]; this.big[p] = st[k0 + 3]; this.over = st[k0 + 4] === 1; this.winner = st[k0 + 5];
  }
  get plies() { return this.sp / 6; }
  emptyCount() {
    let n = 0;
    for (let b = 0; b < (this.level === 1 ? 1 : 9); b++) if (this.level === 1 || this.status[b] === 0) n += 9 - POP[this.m[0][b] | this.m[1][b]];
    return n;
  }
  boardsWon(p) { return POP[this.big[p]]; }

  // Value for the side to move: 1 = it can force a win within d plies, -1 = every move loses by force within d plies,
  // 0 = neither within the horizon (or a forced draw). Throws ABORT past the node budget.
  solve(d) {
    if (++this.nodes > this.budget) throw ABORT;
    const moves = this.moves(this.bufs[d] || (this.bufs[d] = []));
    const kinds = this.kinds[d] || (this.kinds[d] = new Int8Array(81));
    let allLose = true, boards = 0;
    for (let k = 0; k < moves.length; k++) {   // immediate results first: cheap, and a win ends the search here
      const q = this.quick(moves[k]);
      if (q === 1) return 1;
      if (q !== -1) allLose = false;
      if (q === 3) boards++;
      kinds[k] = q;
    }
    if (d <= 1) return allLose ? -1 : 0;
    let best = -1;
    for (let pass = boards ? 0 : 1; pass < 2; pass++) {     // moves that win a small board first
      for (let k = 0; k < moves.length; k++) {
        const q = kinds[k];
        if ((q === 3) !== (pass === 0)) continue;
        let v;
        if (q === 0 || q === -1) v = q;
        else { this.play(moves[k]); v = -this.solve(d - 1); this.undo(); }
        if (v > best) { best = v; if (best === 1) return 1; }
      }
    }
    return best;
  }
  // { v, d } with the smallest depth d <= maxD that proves v = +-1, or { v: 0, d: maxD }; null when the budget ran out.
  value(maxD, budget) {
    this.nodes = 0; this.budget = budget;
    try {
      for (let d = 1; d <= maxD; d++) {
        const v = this.solve(d);
        if (v !== 0) return { v, d };
      }
      return { v: 0, d: maxD };
    } catch (e) { if (e === ABORT) return null; throw e; } finally { this.budget = Infinity; }
  }
  // solve(d) for the side to move with a budget; null when it ran out
  bounded(d, budget) {
    this.nodes = 0; this.budget = budget;
    try { return this.solve(d); } catch (e) { if (e === ABORT) return null; throw e; } finally { this.budget = Infinity; }
  }
  // moves of the side to move that win the game at once
  winningMoves() {
    const me = this.toMove, out = [];
    for (const mv of this.moves([])) { this.play(mv); if (this.over && this.winner === me) out.push(mv); this.undo(); }
    return out;
  }
  // after a move: what the opponent gets. { free, boardWins: [moves winning a small board], gameWins: [moves winning the game] }
  exposure() {
    const res = { free: this.level === 2 && !this.over && this.forcedBoard() < 0, boardWins: [], gameWins: [], choices: 0 };
    if (this.over) return res;
    const me = this.toMove, list = this.moves([]);
    res.choices = list.length;
    for (const mv of list) {
      if (this.level === 2 && this.winsBoard(mv)) res.boardWins.push(mv);
      this.play(mv); if (this.over && this.winner === me) res.gameWins.push(mv); this.undo();
    }
    return res;
  }
  // which line of the main board (or of the single board in wood) the given player completed, as board/cell indexes
  winLine(p) {
    const mask = this.level === 1 ? this.m[p][0] : this.big[p];
    return LINES.find(l => l.every(i => (mask >> i) & 1)) || null;
  }
}

module.exports = { Pos, WIN, POP, LINES, BOARD_NAMES, ABORT };
