'use strict';
// The Bridge - Episode 2 (CodinGame solo puzzle). Rules re-implemented from the public statement:
// https://www.codingame.com/ide/puzzle/the-bridge-episode-2
// A test case (tests/*.json or a generated level) gives the road, the bikes' start lanes, the start speed and V.
const { Referee, GameError } = require('../base');
const { move, solve, solveBest, CMDS, MAX_TURNS, LANES } = require('./rules');
const { generate } = require('./generator');

class BridgeReferee extends Referee {
  // CodinGame: "Response time for one game turn <= 150ms" (the engine adds a boot grace to the very first turn)
  static meta = { id: 'the-bridge-episode-2', name: 'The Bridge - Episode 2', playerCount: 1, firstTurnTimeout: 150, turnTimeout: 150, maxTurns: MAX_TURNS, viewer: 'bridge' };

  constructor(opts = {}) {
    super({ ...opts, playerCount: 1 });
    const t = opts.testCase || generate(opts.seed === undefined ? 1 : opts.seed);
    if (!Array.isArray(t.road) || t.road.length !== LANES || new Set(t.road.map(r => r.length)).size !== 1) throw new Error('test case: road must be 4 lanes of equal length');
    if (!t.road.every(r => /^[.0]+$/.test(r)) || t.road[0].length >= 500) throw new Error('test case: lanes use only "." and "0" and are shorter than 500 cells');
    if (!Array.isArray(t.lanes) || !t.lanes.length || t.lanes.length > LANES || new Set(t.lanes).size !== t.lanes.length || !t.lanes.every(y => Number.isInteger(y) && y >= 0 && y < LANES)) throw new Error('test case: lanes must be 1 to 4 distinct lane numbers 0..3');
    if (t.lanes.some(y => t.road[y][0] !== '.')) throw new Error('test case: every bike must start on a safe cell (X = 0)');
    if (!Number.isInteger(t.V) || t.V < 1 || t.V > t.lanes.length) throw new Error('test case: V must be between 1 and the number of bikes');
    if (t.speed !== undefined && !(Number.isInteger(t.speed) && t.speed >= 0 && t.speed < 50)) throw new Error('test case: speed must be 0..49');
    this.road = t.road;
    this.L = t.road[0].length;
    this.V = t.V;
    this.speed = t.speed || 0;
    this.bikes = t.lanes.map(y => ({ x: 0, y, alive: true }));
    this.M = this.bikes.length;
    this.outcome = null;      // { passed, message }
    this.lastCmd = null;
    this.prev = null;         // positions before the last move, for the viewer
    this.history = [];        // state before each command, for the review
    this.start = { s: this.speed, lanes: this.bikes.map(b => b.y) };
    this.dqReason = null;
  }

  alive() { return this.bikes.filter(b => b.alive); }

  getStaticInfo() { return { road: this.road, L: this.L, M: this.M, V: this.V }; }
  getInitInput() { return [String(this.M), String(this.V), ...this.road]; }
  getActors() { return [0]; }
  getTurnInput() { return [String(this.speed), ...this.bikes.map(b => `${b.x} ${b.y} ${b.alive ? 1 : 0}`)]; }

  applyOutput(p, lines) {
    const cmd = (lines[0] || '').trim();
    if (!['SPEED', 'SLOW', 'JUMP', 'WAIT', 'UP', 'DOWN'].includes(cmd)) throw new GameError(`Invalid command "${lines[0]}" (expected SPEED, SLOW, JUMP, WAIT, UP or DOWN)`);
    this.lastCmd = cmd;
    this.prev = this.bikes.map(b => ({ x: b.x, y: b.y }));
    const live = this.alive();
    this.history.push({ frame: this.turn + 1, x: live[0].x, s: this.speed, lanes: live.map(b => b.y), cmd });
    const r = move(this.road, live[0].x, this.speed, live.map(b => b.y), cmd);
    this.speed = r.s;
    live.forEach((b, i) => {
      b.x = r.x; b.y += r.dy;               // a destroyed bike stays where it fell
      if (r.dead[i]) { b.alive = false; this.log(`Bike on lane ${b.y - r.dy} fell into a hole (${cmd} at speed ${r.s})`); }
    });
    const n = this.alive().length;
    if (n < this.V) this.outcome = { passed: false, message: `Too many bikes lost: ${n} left, ${this.V} needed` };
    else if (r.x >= this.L) this.outcome = { passed: true, message: `${n} of ${this.M} bikes crossed the bridge (${this.V} needed) in ${this.turn + 1} turns` };
  }

  onDisqualify(p, reason) { this.dqReason = reason; this.dqFrame = this.turn + 1; this.outcome = { passed: false, message: reason }; }
  endTurn() {
    super.endTurn();
    if (!this.outcome && this.turn >= MAX_TURNS) this.outcome = { passed: false, message: `The bikes did not cross the bridge within ${MAX_TURNS} turns` };
  }
  isGameOver() { return !!this.outcome; }
  getFrame() {
    return { speed: this.speed, cmd: this.lastCmd, turn: this.turn, bikes: this.bikes.map(b => ({ ...b })), prev: this.prev, outcome: this.outcome };
  }
  // Coach: the solver replays the game. Winnability only ever goes from "yes" to "no" along the
  // path, so a binary search finds the first command that made the level impossible.
  review() {
    const items = [];
    const o = this.outcome;
    const h = this.history;
    const fmt = st => `X=${st.x}, speed ${st.s}, bikes on lane${st.lanes.length > 1 ? 's' : ''} ${st.lanes.join(',')}`;
    const winnable = (st, turnsLeft) => turnsLeft > 0 && st.lanes.length >= this.V && !!solve(this.road, this.V, st.s, st.lanes, turnsLeft, st.x);
    const after = i => {                 // state after command i
      const st = h[i], r = move(this.road, st.x, st.s, st.lanes, st.cmd);
      return { x: r.x, s: r.s, lanes: st.lanes.filter((_, k) => !r.dead[k]).map(y => y + r.dy), crossed: r.x >= this.L };
    };
    if (!o) return items;
    if (this.dqReason) {
      items.push({ turn: this.dqFrame, player: 0, kind: 'mistake', code: 'disqualified', message: `Turn ${this.dqFrame}: ${this.dqReason}. The game stops at the first invalid answer or timeout.` });
      return items;
    }
    if (o.passed) {
      const best = solveBest(this.road, this.V, this.start.s, this.start.lanes);
      const kept = this.alive().length;
      if (best && best.survivors > kept) items.push({ turn: null, player: 0, kind: 'tip', code: 'fewer-survivors', message: `Passed with ${kept} bike(s); ${best.survivors} could have crossed. Not required here, but CodinGame's hidden validators may use other maps where the margin matters.` });
      if (best && best.actions.length < h.length - 5) items.push({ turn: null, player: 0, kind: 'tip', code: 'slow-plan', message: `You needed ${h.length} turns; ${best.actions.length} are enough. Slow plans run out of the 50 turns on longer roads.` });
      return items;
    }
    if (!h.length) { items.push({ turn: 1, player: 0, kind: 'mistake', code: 'no-move', message: o.message }); return items; }
    if (!winnable(h[0], MAX_TURNS)) { items.push({ turn: null, player: 0, kind: 'warning', code: 'level-unsolvable', message: 'This level could not be won from the start (generator bug?).' }); return items; }
    // first i whose resulting state is no longer winnable
    let lo = 0, hi = h.length - 1, first = h.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1, st = after(mid);
      const ok = st.crossed ? st.lanes.length >= this.V : winnable(st, MAX_TURNS - mid - 1);
      if (ok) lo = mid + 1; else { first = mid; hi = mid - 1; }
    }
    const st = h[first], res = after(first);
    const turnsLeft = MAX_TURNS - first;
    const better = CMDS.filter(c => {
      if (c === st.cmd) return false;
      const r = move(this.road, st.x, st.s, st.lanes, c);
      const lanes = st.lanes.filter((_, k) => !r.dead[k]).map(y => y + r.dy);
      if (lanes.length < this.V) return false;
      return r.x >= this.L || winnable({ x: r.x, s: r.s, lanes }, turnsLeft - 1);
    });
    const lost = st.lanes.length - res.lanes.length;
    const why = lost > 0 && res.lanes.length < this.V ? `it lost ${lost} bike(s), leaving ${res.lanes.length} of the ${this.V} needed`
      : (lost > 0 ? `it lost ${lost} bike(s), and ` : '') + `no command sequence after it gets ${this.V} bike(s) across in the ${turnsLeft - 1} turns left`;
    items.push({ turn: st.frame, player: 0, kind: 'mistake', code: `decisive-${st.cmd.toLowerCase()}${lost > 0 ? '-into-hole' : '-dead-end'}`, message: `Turn ${st.frame}: ${st.cmd} at ${fmt(st)} decided the game: ${why}.` + (better.length ? ` Still winning there: ${better.join(', ')}.` : '') });
    if (first + 1 < h.length) items.push({ turn: h[h.length - 1].frame, player: 0, kind: 'tip', code: 'lost-earlier-than-it-looks', message: `The game ended at turn ${h[h.length - 1].frame} (${o.message}), but it was lost ${h.length - 1 - first} turn(s) earlier at turn ${st.frame}: look ahead further than one move (try a depth-first search over the 6 commands).` });
    return items;
  }

  getResult() {
    const o = this.outcome || { passed: false, message: 'game interrupted' };
    return { scores: [o.passed ? this.alive().length : 0], winner: o.passed ? 0 : null, passed: o.passed, message: o.message };
  }
}

module.exports = { Referee: BridgeReferee };
