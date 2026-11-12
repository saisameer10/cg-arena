'use strict';
// Ultimate Tic-Tac-Toe referee: a port of the official CodinGame referee
// (https://github.com/CodinGame/game-ultimate-tictactoe, Java: Referee.java, TicTacToe.java, Player.java; SDK 2.7).
//  - leagues: level 1 (Wood) = one 3x3 board, max 9 turns; level 2 (Bronze and above) = nine boards, max 81 turns
//  - player 0 moves first (the SDK's gameTurn starts at 0 and the referee uses turn % 2), one move per turn
//  - output must match Player.PLAYER_ACTION_PATTERN with Java's matches(), else "Invalid output."; a cell that is not
//    one of the valid actions sent this turn is "Invalid action."; both, and a timeout, lose the game (score -1)
//  - the valid actions are listed in the official order and shuffled with Collections.shuffle(list, new Random(seed)),
//    so a CodinGame seed gives the same lists (and the same moves from a bot that picks by index)
//  - scores: 10 for the winner of the main board, otherwise the number of small boards won; higher score wins
const { Referee, GameError } = require('../base');
const { JavaRandom } = require('../java-random');
const { Pos, BOARD_NAMES } = require('./analysis');

const LEAGUES = { wood: 1, bronze: 2 };
// Player.PLAYER_ACTION_PATTERN = (?<row>-?[0-9]{1})\s+(?<col>-?[0-9]{1})?(?:\s+(?<message>.+))?  used with matches():
// anchored at both ends; Java's \s is [ \t\n\x0B\f\r] and its "." excludes \n \r \u0085 \u2028 \u2029.
const ACTION_RE = /^(-?[0-9])[ \t\n\x0B\f\r]+(-?[0-9])?(?:[ \t\n\x0B\f\r]+([^\n\r\u0085\u2028\u2029]+))?$/;
const RV_MAX_ITEMS = 8;
const RV_BUDGET = 150000;          // search nodes per position for the review (exact enough for tactics, ~10 ms)
const RV_TOTAL = 6000000;          // search nodes per game for the review, all positions together
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

// TicTacToe.java
class TicTacToe {
  constructor() { this.grid = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; this.winner = 0; }
  getValidActions() {
    const valid = [];
    if (this.winner === 0) for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (this.grid[x][y] === 0) valid.push([x, y]);
    return valid;
  }
  play(row, col, playerIndex) {
    if (row < 0 || row >= 3 || col < 0 || col >= 3 || this.grid[row][col] !== 0) throw new GameError('Invalid move!');
    this.grid[row][col] = playerIndex + 1;
    this.winner = this.checkWinner();
    return this.winner;
  }
  checkWinner() {
    const g = this.grid;
    for (let i = 0; i < 3; i++) {
      if (g[i][0] > 0 && g[i][0] === g[i][1] && g[i][0] === g[i][2]) return g[i][0];
      if (g[0][i] > 0 && g[0][i] === g[1][i] && g[0][i] === g[2][i]) return g[0][i];
    }
    if (g[0][0] > 0 && g[0][0] === g[1][1] && g[0][0] === g[2][2]) return g[0][0];
    if (g[2][0] > 0 && g[2][0] === g[1][1] && g[2][0] === g[0][2]) return g[2][0];
    return 0;
  }
  isFull() { return this.grid.every(r => r.every(v => v !== 0)); }
}

class TicTacToeReferee extends Referee {
  static meta = { id: 'tic-tac-toe', name: 'Ultimate Tic-Tac-Toe', playerCount: 2, firstTurnTimeout: 1000, turnTimeout: 100, maxTurns: 81, viewer: 'uttt' };

  constructor(opts = {}) {
    super(opts);
    this.leagueId = LEAGUES[opts.league] ? opts.league : 'bronze';
    this.level = LEAGUES[this.leagueId];
    this.random = new JavaRandom(opts.seed === undefined || opts.seed === null ? 1 : opts.seed);
    this.sdkMaxTurns = this.level === 1 ? 9 : 9 * 9;      // gameManager.setMaxTurns
    this.masterGrid = new TicTacToe();
    this.smallGrids = this.level === 2 ? [0, 1, 2].map(() => [0, 1, 2].map(() => new TicTacToe())) : null;
    this.lastAction = null;
    this.scores = [0, 0];
    this.ended = false;
    this.messages = ['', ''];
    this.event = null;
    this.moves = [];          // review bookkeeping: { player, row, col, frame, firstListed }
    this.failure = null;      // review bookkeeping: how a player lost by disqualification
    this.validActions = this.getValidActions();
  }

  // Referee.getValidActions(), including the shuffle with the game's java.util.Random
  getValidActions() {
    let valid;
    if (this.level === 1) valid = this.masterGrid.getValidActions();
    else {
      valid = [];
      if (this.lastAction) {
        const br = this.lastAction.row % 3, bc = this.lastAction.col % 3;
        for (const [r, c] of this.smallGrids[br][bc].getValidActions()) valid.push([br * 3 + r, bc * 3 + c]);
      }
      if (!valid.length) {
        for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
          for (const [r, c] of this.smallGrids[row][col].getValidActions()) valid.push([row * 3 + r, col * 3 + c]);
        }
      }
    }
    for (let i = valid.length; i > 1; i--) {   // Collections.shuffle(list, rnd)
      const j = this.random.nextInt(i);
      const t = valid[i - 1]; valid[i - 1] = valid[j]; valid[j] = t;
    }
    return valid;
  }

  getStaticInfo() { return { level: this.level, league: this.leagueId, size: this.level === 1 ? 3 : 9 }; }
  getActors() { return this.ended ? [] : [this.turn % 2]; }
  getTurnInput(p) {
    const lines = [this.lastAction ? `${this.lastAction.row} ${this.lastAction.col}` : '-1 -1', String(this.validActions.length)];
    for (const [r, c] of this.validActions) lines.push(`${r} ${c}`);
    return lines;
  }

  applyOutput(p, lines) {
    const raw = lines[0] === undefined ? '' : lines[0];
    const frame = this.turn + 1;
    this.event = null;
    const m = ACTION_RE.exec(raw);
    if (!m || m[2] === undefined) {   // no match, or the optional column group is missing (Integer.parseInt(null) throws)
      this.failure = { frame, player: p, type: 'output', raw };
      throw new GameError(`Invalid output. Expected "row col" (two one-digit integers separated by whitespace, optionally followed by a message), got "${raw.slice(0, 60)}"`);
    }
    const row = parseInt(m[1], 10) + 0, col = parseInt(m[2], 10) + 0;   // + 0 turns -0 into 0
    const msg = m[3];
    this.messages[p] = msg === undefined ? '' : msg.length < 20 ? msg : msg.slice(0, 17) + '...';
    this.log(`Player ${p} played (${row} ${col})${this.messages[p] ? ' ' + this.messages[p] : ''}`);
    if (!this.validActions.some(([r, c]) => r === row && c === col)) {
      this.failure = { frame, player: p, type: 'action', row, col, raw, valid: this.validActions.map(a => a.slice()), last: this.lastAction && { ...this.lastAction } };
      throw new GameError(`Invalid action. (${row} ${col}) is not one of the ${this.validActions.length} valid actions of this turn`);
    }
    this.moves.push({ player: p, row, col, frame, firstListed: this.validActions[0][0] === row && this.validActions[0][1] === col, choices: this.validActions.length });
    this.lastAction = { row, col, player: p };
    const ev = { player: p, row, col };
    if (this.level === 1) {
      if (this.masterGrid.play(row, col, p) > 0) this.setWinner(p, ev);
    } else {
      const br = (row / 3) | 0, bc = (col / 3) | 0;
      const grid = this.smallGrids[br][bc];
      if (grid.play(row % 3, col % 3, p) > 0) {
        this.scores[p] += 1;
        ev.board = br * 3 + bc;
        this.log(`Player ${p} has won one cell: the ${BOARD_NAMES[br * 3 + bc]} board`);
        if (this.masterGrid.play(br, bc, p) > 0) this.setWinner(p, ev);
      }
    }
    this.validActions = this.getValidActions();
    if (!this.validActions.length) {
      if (!this.ended) {
        ev.full = true;
        this.log(this.level === 1 ? 'The board is full: draw.' : `Every board is closed: boards won ${this.boardCount(0)} - ${this.boardCount(1)}.`);
      }
      this.ended = true;
    }
    this.event = ev;
  }
  setWinner(p, ev) {
    this.log(`Player ${p} won!`);
    this.scores[p] = 10;
    ev.won = true;
    this.ended = true;
  }
  boardCount(p) {
    if (this.level === 1) return 0;
    let n = 0;
    for (const r of this.masterGrid.grid) for (const v of r) if (v === p + 1) n++;
    return n;
  }
  onDisqualify(p, reason) {
    if (!this.failure || this.failure.player !== p) this.failure = { frame: this.turn + 1, player: p, type: /^timeout/.test(reason) ? 'timeout' : 'crash', reason };
    this.failure.reason = reason;
    if (this.failure.type === 'timeout') this.log(`Player ${p} timeout!`);
    this.scores[p] = -1;
    this.ended = true;
    this.event = { player: p, error: reason };
  }
  isGameOver() { return this.ended || this.turn >= this.sdkMaxTurns; }

  getFrame() {
    const size = this.level === 1 ? 3 : 9;
    let cells = '';
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      const v = this.level === 1 ? this.masterGrid.grid[r][c] : this.smallGrids[(r / 3) | 0][(c / 3) | 0].grid[r % 3][c % 3];
      cells += v === 0 ? '.' : v === 1 ? 'X' : 'O';
    }
    let boards = null, active = [];
    if (this.level === 2) {
      boards = '';
      for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) {
        const w = this.masterGrid.grid[br][bc];
        boards += w === 1 ? 'X' : w === 2 ? 'O' : this.smallGrids[br][bc].isFull() ? '=' : '.';
      }
      if (!this.ended) active = [...new Set(this.validActions.map(([r, c]) => ((r / 3) | 0) * 3 + ((c / 3) | 0)))].sort((a, b) => a - b);
    }
    let line = null;
    if (this.masterGrid.winner) {
      const g = this.masterGrid.grid, w = this.masterGrid.winner;
      const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [6, 4, 2]];
      line = L.find(l => l.every(i => g[(i / 3) | 0][i % 3] === w)) || null;
    }
    return {
      level: this.level, cells, boards, active, line,
      last: this.lastAction ? { ...this.lastAction } : null,
      next: this.ended ? null : this.turn % 2,
      scores: this.scores.slice(),
      boardsWon: [this.boardCount(0), this.boardCount(1)],
      messages: this.messages.slice(),
      validCount: this.ended ? 0 : this.validActions.length,
      event: this.event,
    };
  }
  getResult() {
    const s = this.scores;
    return { scores: s.slice(), winner: s[0] === s[1] ? null : s[0] > s[1] ? 0 : 1, boardsWon: [this.boardCount(0), this.boardCount(1)] };
  }

  // ---- post-game review ------------------------------------------------------------------
  // Replays the moves on a bitboard model (analysis.js) and runs a bounded proof search at every position:
  // "can the side to move force a win within D plies (or does it lose by force)?". D = 5 plies (3 moves of the
  // winner), exact in Wood and in endgames with few empty cells. A move is a blunder when the player was not lost
  // before it, the opponent could force a win right after it, and another move had no such forced loss.
  review() {
    let analysis = null;
    try { analysis = this.rvAnalyse(); } catch (e) { analysis = null; }
    const items = [];
    for (let p = 0; p < 2; p++) {
      try { items.push(...this.rvItems(p, analysis)); } catch (e) { /* skip this player's review rather than fail */ }
    }
    return items;
  }

  rvHorizon(pos) {
    if (this.level === 1) return 9;
    const empty = pos.emptyCount();
    return empty <= 12 ? empty : 5;
  }

  rvAnalyse() {
    const pos = new Pos(this.level);
    const n = this.moves.length;
    const states = [];          // states[t] = value of the position before move t for the side to move: {v, d, maxD} or null
    let spent = 0;
    const valueAt = () => {
      // a finished game, for the side that would move next: lost (-1), drawn (0) or won on the board count (+1)
      if (pos.over) return { v: pos.winner === -1 ? 0 : pos.winner === pos.toMove ? 1 : -1, d: 0, maxD: 0 };
      if (spent > RV_TOTAL) return null;
      const maxD = this.rvHorizon(pos);
      const r = pos.value(maxD, RV_BUDGET);
      spent += pos.nodes;
      return r ? { ...r, maxD } : null;
    };
    const recs = [];
    states[0] = valueAt();
    for (let t = 0; t < n; t++) {
      const mv = this.moves[t], p = mv.player;
      const chosen = pos.cell(mv.row, mv.col);
      const legal = pos.moves([]);
      const rec = { t, frame: mv.frame, player: p, chosen, before: states[t], after: null, imm: [], wonBoard: false,
        exposure: null, altFree: null, altSafeBoard: null, boardWins: [], forcedBoard: pos.forcedBoard(), choices: legal.length };
      rec.imm = pos.winningMoves();
      if (this.level === 2) rec.boardWins = legal.filter(m => pos.winsBoard(m));
      rec.wonBoard = this.level === 2 && pos.winsBoard(chosen);
      pos.play(chosen);
      rec.exposure = pos.exposure();
      states[t + 1] = valueAt();
      rec.after = states[t + 1];     // value for the opponent, who moves next
      pos.undo();
      // cheap 1-ply alternatives: a move that keeps the opponent in a board / gives it no board to win
      if (this.level === 2 && (rec.exposure.free || rec.exposure.boardWins.length) && !rec.exposure.gameWins.length) {
        for (const a of legal) {
          if (a === chosen) continue;
          pos.play(a);
          const ex = pos.over ? null : pos.exposure();
          pos.undo();
          if (!ex || ex.gameWins.length) continue;
          if (rec.exposure.free && !ex.free && rec.altFree === null) rec.altFree = a;
          if (rec.exposure.boardWins.length && !ex.free && !ex.boardWins.length && rec.altSafeBoard === null) rec.altSafeBoard = a;
        }
      }
      // blunder: the opponent can now force a win; look for a move of ours that it could not punish
      const a = rec.after, b = rec.before;
      if (a && a.v === 1 && !(b && b.v === -1)) {
        rec.threat = a.d;
        rec.refutation = this.rvFirstWin(pos, chosen, a.d);
        for (const alt of this.rvOrder(pos, legal, chosen)) {
          pos.play(alt);
          let safe;
          if (pos.over) safe = pos.winner !== (p ^ 1);
          else { const r = spent > RV_TOTAL ? null : pos.bounded(a.maxD || this.rvHorizon(pos), RV_BUDGET); spent += pos.nodes; safe = r === null ? null : r !== 1; }
          pos.undo();
          if (safe === null) { rec.altUnknown = true; break; }
          if (safe) { rec.safeAlt = alt; break; }
        }
      }
      // a forced win of our own that this move let go
      if (b && b.v === 1 && !(a && a.v === -1)) {
        rec.missed = b.d;
        rec.winMove = rec.imm.length ? rec.imm[0] : this.rvWinningMove(pos, legal, b.d);
      }
      recs.push(rec);
      pos.play(chosen);
    }
    return { recs, final: { boards: [pos.boardsWon(0), pos.boardsWon(1)], over: pos.over, winner: pos.winner, line: pos.over && pos.winner >= 0 ? pos.winLine(pos.winner) : null } };
  }
  // alternatives ordered so that a safe one is found early: no free move given, no board handed over
  rvOrder(pos, legal, chosen) {
    const scored = [];
    for (const m of legal) {
      if (m === chosen) continue;
      pos.play(m);
      let s = 0;
      if (pos.over) s = pos.winner === (pos.toMove ^ 1) ? -100 : 50;
      else { const ex = pos.exposure(); s = (ex.gameWins.length ? 100 : 0) + (ex.free ? 10 : 0) + ex.boardWins.length; }
      pos.undo();
      scored.push([s, m]);
    }
    return scored.sort((x, y) => x[0] - y[0]).map(x => x[1]);
  }
  // after `chosen`, the opponent's first move of a forced win within d plies
  rvFirstWin(pos, chosen, d) {
    pos.play(chosen);
    let found = null;
    try {
      const q = pos.toMove;
      for (const m of pos.moves([])) {
        pos.play(m);
        let ok = pos.over && pos.winner === q;
        if (!ok && !pos.over && d > 1) ok = pos.bounded(d - 1, RV_BUDGET) === -1;
        pos.undo();
        if (ok) { found = m; break; }
      }
    } finally { pos.undo(); }
    return found;
  }
  // a move of the side to move that keeps a forced win within d plies
  rvWinningMove(pos, legal, d) {
    const me = pos.toMove;
    for (const m of legal) {
      pos.play(m);
      let ok = pos.over && pos.winner === me;
      if (!ok && !pos.over && d > 1) ok = pos.bounded(d - 1, RV_BUDGET) === -1;
      pos.undo();
      if (ok) return m;
    }
    return null;
  }

  rvItems(p, an) {
    const items = [];
    const add = (prio, turn, kind, code, message) => items.push({ prio, turn, player: p, kind, code, message });
    const res = this.getResult();
    const won = res.winner === p, lost = res.winner === 1 - p;
    const pos = new Pos(this.level);
    const T = m => pos.txt(m);
    const boardOf = m => this.level === 2 ? `the ${BOARD_NAMES[(m / 9) | 0]} board` : 'the board';
    const moves = n => `${n} move${n === 1 ? '' : 's'}`;

    // disqualification
    const f = this.failure;
    if (f && f.player === p) {
      if (f.type === 'output') {
        const ws = /^\s|\s$/.test(f.raw) ? ' It has leading or trailing whitespace: the official pattern must match the whole line, so print exactly "row col" (a message may follow after a space).' : '';
        const two = /\d\d/.test(f.raw) ? ' Rows and columns are single digits (0 to 8).' : '';
        add(100, f.frame, 'mistake', 'invalid-output', `Turn ${f.frame}: your output "${f.raw.slice(0, 40)}" is not "row col", so CodinGame rejects it with "Invalid output." and you lose.${ws}${two}`);
      } else if (f.type === 'action') {
        let why;
        const inGrid = f.row >= 0 && f.col >= 0 && f.row < (this.level === 1 ? 3 : 9) && f.col < (this.level === 1 ? 3 : 9);
        if (!inGrid) why = `(${f.row} ${f.col}) is outside the ${this.level === 1 ? '3x3' : '9x9'} grid`;
        else {
          const v = this.level === 1 ? this.masterGrid.grid[f.row][f.col] : this.smallGrids[(f.row / 3) | 0][(f.col / 3) | 0].grid[f.row % 3][f.col % 3];
          const boardIdx = ((f.row / 3) | 0) * 3 + ((f.col / 3) | 0);
          const target = f.last && this.level === 2 ? (f.last.row % 3) * 3 + (f.last.col % 3) : -1;
          if (v !== 0) why = `cell (${f.row} ${f.col}) is already taken`;
          else if (this.level === 2 && this.masterGrid.grid[(f.row / 3) | 0][(f.col / 3) | 0] !== 0) why = `the ${BOARD_NAMES[boardIdx]} board is already won, so nobody can play in it any more`;
          else if (target >= 0 && target !== boardIdx) why = `the opponent's last move (${f.last.row} ${f.last.col}) sent you to the ${BOARD_NAMES[target]} board (rows ${3 * ((target / 3) | 0)}-${3 * ((target / 3) | 0) + 2}, columns ${3 * (target % 3)}-${3 * (target % 3) + 2}), not the ${BOARD_NAMES[boardIdx]} one`;
          else why = 'it is not in the list of valid actions';
        }
        const sample = f.valid.slice(0, 6).map(a => a.join(' ')).join(', ');
        add(100, f.frame, 'mistake', 'invalid-action', `Turn ${f.frame}: you played ${f.row} ${f.col} but ${why}; CodinGame answers "Invalid action." and you lose. Pick one of the ${f.valid.length} cells given this turn (${sample}${f.valid.length > 6 ? ', ...' : ''}).`);
      } else if (f.type === 'timeout') {
        add(100, f.frame, 'mistake', 'timeout', `Turn ${f.frame}: you did not answer in time (${f.reason}). The limit is ${TicTacToeReferee.meta.turnTimeout} ms per turn after the first (1000 ms); stop your search well before it and always print one move per turn.`);
      } else {
        add(100, f.frame, 'mistake', 'crash', `Turn ${f.frame}: your bot stopped (${f.reason}). Read every input line each turn (validActionCount lines) and keep the main loop running.`);
      }
    }
    if (!an) {
      if (!items.length) add(10, null, 'tip', 'review-skipped', 'The search used by the review ran out of time on this game; only the result is reported.');
      return this.rvFinish(items);
    }

    const mine = an.recs.filter(r => r.player === p);
    // blunders: the opponent could force a win right after, another move avoided it
    const blunders = mine.filter(r => r.safeAlt !== undefined);
    // the decisive one: the last blunder of the loser after which it never got a non-lost position back
    let decisive = null;
    if (lost && !(f && f.player === p)) {
      for (const r of blunders) {
        const later = an.recs.filter(x => x.t > r.t && x.player === p);
        if (later.every(x => x.before && x.before.v === -1)) decisive = r;
      }
    }
    // the decisive blunder first, then the others in game order
    const shown = decisive ? [decisive, ...blunders.filter(r => r !== decisive)] : blunders;
    const describeThreat = r => {
      if (r.threat === 0) return 'the game ended because every board was closed, with the opponent ahead on boards won';
      const k = Math.ceil(r.threat / 2);
      const how = r.refutation !== null && r.refutation !== undefined ? ` (starting with ${T(r.refutation)} in ${boardOf(r.refutation)})` : '';
      return k === 1 ? `the opponent could win the game at once${how}` : `the opponent could force a win in ${moves(k)}${how}`;
    };
    shown.slice(0, 3).forEach((r, i) => {
      const isDecisive = r === decisive;
      const code = r.threat === 0 ? 'closed-last-board' : r.threat === 1 ? 'allowed-win' : 'forced-loss';
      const sent = this.level === 2 && r.exposure && r.exposure.free ? ' It also gave the opponent a free choice of board.' : '';
      // the opponent's next position tells whether it took the win: still lost for us afterwards = exploited
      const next = an.recs.find(x => x.t > r.t && x.player === p);
      const exploited = !next ? lost : !!(next.before && next.before.v === -1);
      const tail = isDecisive ? ' From then on the game was lost.' : exploited ? '' : ' The opponent did not take it.';
      add(isDecisive ? 99 : 90 - i, r.frame, 'mistake', code,
        `Turn ${r.frame}${isDecisive ? ' (decisive)' : ''}: after ${T(r.chosen)} ${describeThreat(r)}.${sent} ${T(r.safeAlt)} avoided that${r.threat > 1 ? ` (no forced win for the opponent within ${moves(Math.ceil(r.after.maxD / 2))})` : ''}.${tail}`);
    });
    if (blunders.length > 3) add(60, null, 'warning', 'many-blunders', `${blunders.length} of your moves allowed a forced win by the opponent this game. Before each move, check every reply that wins a board or the game (a 2-3 move look-ahead finds them).`);

    // missed wins
    const missed = mine.filter(r => r.missed !== undefined && r.winMove !== null && r.winMove !== undefined);
    missed.slice(0, 2).forEach((r, i) => {
      const k = Math.ceil(r.missed / 2);
      if (r.missed === 1) {
        const lineTxt = this.level === 2 ? ` (it wins ${boardOf(r.winMove)} and completes a line of boards)` : '';
        add(won ? 80 - i : 97 - i, r.frame, 'mistake', 'missed-win', `Turn ${r.frame}: ${T(r.winMove)} would have won the game at once${lineTxt}; you played ${T(r.chosen)}. Always check for a winning move first.`);
      } else {
        add(won ? 70 - i : 88 - i, r.frame, won ? 'warning' : 'mistake', 'missed-forced-win', `Turn ${r.frame}: you had a forced win in ${moves(k)} starting with ${T(r.winMove)}; after ${T(r.chosen)} it was gone.`);
      }
    });

    // how the game ended
    const fin = an.final;
    if (this.level === 2 && fin.over && !fin.line && lost && !decisive && !(f && f.player === p)) {
      add(75, null, 'mistake', 'lost-on-boards', `Nobody completed a line of boards; the game ended when every board was closed and the opponent had won more boards (${fin.boards[1 - p]} against your ${fin.boards[p]}). Count boards in the endgame: when no line is possible any more, every board matters.`);
    }
    if (lost && !decisive && !(f && f.player === p) && !missed.length) {
      const h = this.level === 1 ? 'an exact search' : 'a 3-move look-ahead';
      add(65, null, 'tip', 'no-tactical-blunder', `No single move of yours lost the game by force according to ${h}: the opponent built a better position over many moves. Compare boards won, boards still winnable by each side and where your moves send the opponent.`);
    }

    // where your moves sent the opponent (Bronze rules)
    if (this.level === 2) {
      const free = mine.filter(r => r.exposure && r.exposure.free && r.altFree !== null && r.safeAlt === undefined);
      if (free.length) {
        const r = free[0];
        add(50, r.frame, 'warning', 'free-move-given', `Turn ${r.frame}: ${T(r.chosen)} sent the opponent to a board that is already closed, so it could play anywhere (${r.exposure.choices} choices); ${T(r.altFree)} kept it inside one board.${free.length > 1 ? ` You gave a free choice ${free.length} times this game.` : ''}`);
      }
      const gave = mine.filter(r => r.exposure && !r.exposure.free && r.exposure.boardWins.length && !r.wonBoard && r.altSafeBoard !== null && r.safeAlt === undefined);
      if (gave.length) {
        const r = gave[0], w = r.exposure.boardWins[0];
        add(45, r.frame, 'warning', 'gave-board', `Turn ${r.frame}: ${T(r.chosen)} sent the opponent to ${boardOf(w)}, where ${T(w)} won that board for it; ${T(r.altSafeBoard)} sent it somewhere with no board to win.${gave.length > 1 ? ` This happened ${gave.length} times this game.` : ''}`);
      }
      const skipped = mine.filter(r => r.boardWins.length && !r.wonBoard && r.missed === undefined && r.safeAlt === undefined);
      if (skipped.length >= 2) {
        const r = skipped[0];
        add(30, r.frame, 'tip', 'missed-board', `Turn ${r.frame}: ${T(r.boardWins[0])} would have won ${boardOf(r.boardWins[0])}; you played ${T(r.chosen)}. You passed on an available board ${skipped.length} times this game: make sure that is deliberate.`);
      }
    }
    // the starter's default move
    const own = this.moves.filter(m => m.player === p && m.choices > 1);
    const firsts = own.filter(m => m.firstListed).length;
    if (own.length >= 4 && firsts >= 0.8 * own.length) {
      add(40, null, 'tip', 'first-valid-action', `You played the first valid action in ${firsts} of ${own.length} turns. CodinGame shuffles that list every turn, so this is a random move: evaluate the actions instead.`);
    }
    // summary
    const how = fin.over
      ? (fin.winner === -1 ? (this.level === 1 ? 'The board filled up: draw.' : `Every board closed with ${fin.boards[0]} boards each: draw.`)
        : fin.line ? `${fin.winner === p ? 'You' : 'The opponent'} completed a line ${this.level === 2 ? 'of boards' : ''} (${fin.line.map(i => this.level === 2 ? BOARD_NAMES[i] : `${(i / 3) | 0} ${i % 3}`).join(', ')}).`.replace('  ', ' ')
          : `Every board closed; ${fin.winner === p ? 'you' : 'the opponent'} won more boards (${fin.boards[fin.winner]} against ${fin.boards[1 - fin.winner]}).`)
      : (f ? `The game stopped at turn ${f.frame}: player ${f.player} was disqualified.` : 'The game stopped early.');
    add(20, null, 'tip', 'game-summary', `${how}${this.level === 2 ? ` Boards won: you ${fin.boards[p]}, opponent ${fin.boards[1 - p]}.` : ''} ${plural(mine.length, 'move')} played.`);
    return this.rvFinish(items);
  }
  rvFinish(items) {
    return items.sort((x, y) => y.prio - x.prio).slice(0, RV_MAX_ITEMS).map(({ prio, ...it }) => it);
  }
}

module.exports = { Referee: TicTacToeReferee, TicTacToe, ACTION_RE };
