'use strict';
// Shadows of the Knight - Episode 1 (CodinGame solo puzzle): https://www.codingame.com/ide/puzzle/shadows-of-the-knight-episode-1
// No official referee source is public. Rules come from the statement; the game-log wording, the jump count,
// the region shown by the viewer and the moving bombs of the last test come from CodinGame's public replays
// of this puzzle (decisions in challenges/shadows-of-the-knight-episode-1.md).
//
// A test case (tests/*.json or a generated level): { W, H, N, start: [X0, Y0], bomb: [X, Y] | "random",
// evasive?: true (the bombs move after every jump, staying where the hints allow), seed?: extra RNG seed }.
const { Referee, GameError, mulberry32, seedToUint32 } = require('../base');
const R = require('./rules');
const { generate } = require('./generator');

const fmt = (x, y) => `(${x},${y})`;
const span = (a, b) => (a === b ? `${a}` : `${a}..${b}`);
const fmtRegion = r => `X ${span(r[0], r[1])}, Y ${span(r[2], r[3])}`;
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

class ShadowsKnightReferee extends Referee {
  // CodinGame: "Response time per turn <= 150ms" (the engine adds a boot grace to the very first turn).
  // The game lasts N jumps (N <= 100); the referee ends it itself, maxTurns is only the engine's safety cap.
  static meta = { id: 'shadows-of-the-knight-episode-1', name: 'Shadows of the Knight - Episode 1', playerCount: 1, firstTurnTimeout: 150, turnTimeout: 150, maxTurns: R.MAX_N, viewer: 'shadows-knight-1' };

  constructor(opts = {}) {
    super({ ...opts, playerCount: 1 });
    const t = R.checkLevel(opts.testCase || generate(opts.seed === undefined ? 1 : opts.seed));
    Object.assign(this, { W: t.W, H: t.H, N: t.N, evasive: t.evasive, levelName: t.name || '' });
    // Random parts (a "random" bomb, the moves of evasive bombs) depend on the run seed and the level,
    // so a new seed gives new bomb positions, like CodinGame's "the bombs' location may change".
    this.brng = mulberry32(seedToUint32(`${t.seed !== undefined ? t.seed : t.name || ''}|${opts.seed === undefined ? 1 : opts.seed}`));
    [this.x, this.y] = t.start;
    this.start = [...t.start];
    this.randomBomb = t.bomb === 'random';
    this.bomb = this.randomBomb ? this.randomWindow([0, this.W - 1, 0, this.H - 1], this.x, this.y) : [...t.bomb];
    this.dir = R.direction(this.x, this.y, this.bomb[0], this.bomb[1]);
    this.region = R.narrow([0, this.W - 1, 0, this.H - 1], this.x, this.y, this.dir);
    this.region0 = [...this.region];
    this.need0 = R.need(this.region0);
    this.worstStart = R.startNeed(this.W, this.H, this.x, this.y, this.randomBomb || this.evasive ? 'random' : this.bomb);
    this.used = 0;
    this.path = [[this.x, this.y]];
    this.prev = null;
    this.history = [];         // one entry per jump, for the review
    this.outcome = null;       // { passed, message }
    this.dqReason = null;
    this.log('Locate the bombs, save the hostages!');
    this.log(`Batman is on window ${fmt(this.x, this.y)}`);
    this.log(`The bombs are located ${R.WORDS[this.dir]}`);
  }

  // a uniformly random window of region r other than (ex, ey); (ex, ey) itself only if it is the only one
  randomWindow(r, ex, ey) {
    const w = R.width(r), n = R.area(r);
    const skip = R.contains(r, ex, ey) ? (ey - r[2]) * w + (ex - r[0]) : -1;
    if (skip >= 0 && n === 1) return [ex, ey];
    let i = Math.floor(this.brng() * (skip >= 0 ? n - 1 : n));
    if (skip >= 0 && i >= skip) i++;
    return [r[0] + (i % w), r[2] + Math.floor(i / w)];
  }

  getStaticInfo() {
    return { W: this.W, H: this.H, N: this.N, start: this.start, bomb: [...this.bomb], evasive: this.evasive, randomBomb: this.randomBomb, region: this.region0, dir: this.dir, need: this.need0 };
  }
  getInitInput() { return [`${this.W} ${this.H}`, String(this.N), `${this.x} ${this.y}`]; }
  getActors() { return [0]; }
  getTurnInput() { return [this.dir]; }

  applyOutput(p, lines) {
    const line = lines[0] === undefined ? '' : String(lines[0]);
    const parts = line.trim().split(' ');
    if (parts.length !== 2) throw new GameError(`Failure: invalid input. Expected 'x y' but found '${line}'`);
    for (const s of parts) if (!/^[+-]?\d{1,10}$/.test(s) || Math.abs(Number(s)) > 2147483647) throw new GameError(`Failure: invalid input. Expected 'Integer' but found '${s}'`);
    const [x, y] = parts.map(Number);
    if (x < 0 || x >= this.W || y < 0 || y >= this.H) throw new GameError(`Failure: window ${fmt(x, y)} is outside the building (X 0..${this.W - 1}, Y 0..${this.H - 1}). Batman fell. You lose :(`);
    const before = this.region, L = this.N - this.used;     // L = jumps left before this one
    const from = [this.x, this.y], prevDir = this.dir;
    this.prev = from;
    this.x = x; this.y = y; this.used++;
    this.path.push([x, y]);
    // evasive bombs move before the device reads them, to any window every hint so far allows except Batman's
    if (this.evasive) this.bomb = this.randomWindow(before, x, y);
    this.dir = R.direction(x, y, this.bomb[0], this.bomb[1]);
    this.log(`Batman moved from window ${fmt(from[0], from[1])} to window ${fmt(x, y)}`);
    const entry = { turn: this.turn + 1, from, to: [x, y], prevDir, before, L, needBefore: R.need(before), worst: R.worstAfter(before, x, y), dir: this.dir, bomb: [...this.bomb] };
    if (!this.dir) {
      entry.after = [x, x, y, y]; entry.needAfter = 0;
      this.region = entry.after;
      this.outcome = { passed: true, message: `you defused the bombs in time, the hostages are safe (window ${fmt(x, y)}, jump ${this.used} of ${this.N}).` };
      this.log('Success: you defused the bombs in time. The hostages are safe. You win :)');
    } else {
      this.region = R.narrow(before, x, y, this.dir);
      entry.after = this.region; entry.needAfter = R.need(this.region);
      this.log(`The bombs are located ${R.WORDS[this.dir]}`);
      if (this.used >= this.N) {
        this.outcome = { passed: false, message: `you are too late, all ${this.N} jumps used: Batman is on ${fmt(x, y)}, the bombs were on ${fmt(this.bomb[0], this.bomb[1])}.` };
        this.log("Failure: you are too late. Joker's bombs exploded. The hostages are dead. You lose :(");
      }
    }
    this.history.push(entry);
  }

  onDisqualify(p, reason) { this.dqReason = reason; this.dqFrame = this.turn + 1; this.outcome = { passed: false, message: String(reason).replace(/^Failure: /, '') }; }   // the UI adds its own 'Failure:'
  isGameOver() { return !!this.outcome; }
  getFrame() {
    return {
      turn: this.turn, used: this.used, jumpsLeft: this.N - this.used, batman: [this.x, this.y], prev: this.prev, dir: this.dir,
      region: [...this.region], need: this.dir ? R.need(this.region) : 0, bomb: [...this.bomb], path: this.path.map(q => [...q]), outcome: this.outcome,
    };
  }

  // Coach. From any region, a perfect search needs exactly need(region) more jumps in the worst case, so the
  // game is lost at the first jump whose hint left a region that needs more jumps than remain. That jump is
  // named, with the axis it mishandled and the middle jump that would have kept the win.
  review() {
    const items = [];
    const o = this.outcome, h = this.history;
    if (!o) return items;
    const N = this.N;
    const unsolvable = this.worstStart > N && (this.randomBomb || this.evasive) || this.need0 > N;
    if (this.dqReason) {
      const r = this.dqReason;
      const code = /^timeout/.test(r) ? 'timeout' : /outside the building/.test(r) ? 'jumped-outside-building' : /invalid input/.test(r) ? 'invalid-output' : 'disqualified';
      let msg = `Turn ${this.dqFrame}: ${r}${/[.:()]$/.test(r) ? '' : '.'}`;
      if (code === 'jumped-outside-building') msg += ` The hints allowed ${fmtRegion(this.region)}: clamp every jump into the building (and into that region).`;
      else if (code === 'invalid-output') msg += ' Print exactly two integers separated by one space, e.g. "4 7", and send debug text to stderr.';
      else if (code === 'timeout') msg += ` The limit is 150 ms per jump${this.dqFrame === 1 ? ' (the first turn includes reading the 3 initialization lines: read them before the loop)' : ''}; read exactly one line per turn.`;
      else msg += ' The game stops at the first invalid answer, timeout or crash.';
      items.push({ turn: this.dqFrame, player: 0, kind: 'mistake', code, message: msg });
      return items;
    }
    if (unsolvable) items.push({ turn: null, player: 0, kind: 'warning', code: 'level-unsolvable', message: `This level is not always winnable: from the start a perfect search needs up to ${Math.max(this.need0, this.worstStart)} jumps, and there are ${N}: only some bomb positions make it passable. Jumps are only blamed once the hints had made the win sure again.` });

    // Only jumps made while the win was still sure (needBefore <= jumps left) can be blamed; on a level that is
    // not always winnable that may be none of them.
    const decisive = h.findIndex(e => e.needBefore <= e.L && e.needAfter > e.L - 1);   // first jump after which no search surely wins
    const risky = h.findIndex(e => e.needBefore <= e.L && e.worst > e.L - 1);         // first jump that could have lost, depending on the hint
    if (!o.passed && decisive < 0) {
      const wasted = h.filter(q => q.worst >= q.needBefore);
      if (wasted.length) items.push({ turn: wasted[0].turn, player: 0, kind: 'tip', code: 'wasted-jumps', message: `${plural(wasted.length, 'jump')} did not reduce the worst case (turn${wasted.length > 1 ? 's' : ''} ${wasted.slice(0, 6).map(q => q.turn).join(', ')}): ${this.explain(wasted[0]).text}` });
      return items;
    }
    if (!o.passed) {
      const e = h[decisive];
      const { code, text } = this.explain(e);
      const [mx, my] = R.middle(e.before);
      items.push({ turn: e.turn, player: 0, kind: 'mistake', code: `decisive-${code}`, message: `Turn ${e.turn}: the jump to ${fmt(e.to[0], e.to[1])} decided the game. Before it the hints allowed ${fmtRegion(e.before)} (${plural(e.needBefore, 'jump')} enough in the worst case, ${e.L} left). ${text} The bombs turned out ${R.WORDS[e.dir].replace(' Batman', '')} it: ${fmtRegion(e.after)} needs ${plural(e.needAfter, 'more jump')}, only ${e.L - 1} left. Jumping to the middle ${fmt(mx, my)} would have kept a sure win.` });
      const last = h[h.length - 1];
      if (decisive < h.length - 1) items.push({ turn: last.turn, player: 0, kind: 'tip', code: 'lost-earlier-than-it-looks', message: `The game ended at turn ${last.turn} (all ${N} jumps used), but it was lost ${plural(h.length - 1 - decisive, 'jump')} earlier, at turn ${e.turn}. Keep the allowed region [xmin..xmax] x [ymin..ymax], shrink it with every hint (exclusive: the window you are on is never the bomb) and always jump to its middle.` });
      const wasted = h.slice(0, decisive).filter(q => q.worst >= q.needBefore);
      if (wasted.length) items.push({ turn: wasted[0].turn, player: 0, kind: 'tip', code: 'wasted-jumps', message: `${plural(wasted.length, 'earlier jump')} did not reduce the worst case (turn${wasted.length > 1 ? 's' : ''} ${wasted.slice(0, 6).map(q => q.turn).join(', ')}): ${this.explain(wasted[0]).text}` });
      this.stuck(items);
      return items;
    }
    if (o.passed && risky >= 0) {
      const e = h[risky];
      const { code, text, axis } = this.explain(e), side = r => (axis ? R.height(r) : R.width(r));
      // an example of a hint that would have lost, on the axis the explanation is about
      const bad = R.outcomes(e.before, e.to[0], e.to[1]).filter(r => R.need(r) > e.L - 1).sort((a, b) => side(b) - side(a) || R.need(b) - R.need(a))[0];
      items.push({ turn: e.turn, player: 0, kind: 'warning', code: 'lucky-pass', message: `Passed, but only because of where the bombs were. Turn ${e.turn}: the jump to ${fmt(e.to[0], e.to[1])} (${code.replace(/-/g, ' ')}) could have lost: ${text} Had the bombs been in ${fmtRegion(bad)}, ${plural(R.need(bad), 'more jump')} would have been needed with ${e.L - 1} left. ${this.evasive || this.randomBomb ? 'The bombs move with the seed here: try other seeds.' : "CodinGame's validators put the bombs elsewhere."} The middle ${fmt(...R.middle(e.before))} was always safe.` });
      return items;
    }
    if (o.passed) {
      const wasted = h.filter(q => q.worst >= q.needBefore);
      if (wasted.length) items.push({ turn: wasted[0].turn, player: 0, kind: 'tip', code: 'wasted-jumps', message: `Passed with ${plural(h.length, 'jump')} of ${N}, but ${plural(wasted.length, 'jump')} did not reduce the worst case (turn${wasted.length > 1 ? 's' : ''} ${wasted.slice(0, 6).map(q => q.turn).join(', ')}). ${this.explain(wasted[0]).text} On a level with fewer jumps this fails.` });
    }
    return items;
  }

  // The longest run of jumps to the window Batman was already on (3 or more): the classic rounding loop.
  stuck(items) {
    let best = null;
    for (let i = 0, run = 0; i < this.history.length; i++) {
      const e = this.history[i];
      run = e.to[0] === e.from[0] && e.to[1] === e.from[1] ? run + 1 : 0;
      if (run >= 3 && (!best || run > best.run)) best = { run, end: i };
    }
    if (!best) return;
    const first = this.history[best.end - best.run + 1], e = this.history[best.end];
    const r = first.before, [sx, sy] = e.to;
    // the rounding loop leaves Batman right next to a one- or two-window range on some axis
    const nextTo = (c, lo, hi) => hi - lo <= 1 && (lo === c + 1 || hi === c - 1);
    const cause = nextTo(sx, r[0], r[1]) || nextTo(sy, r[2], r[3])
      ? "Likely cause: bounds that still include Batman's window (hi = y instead of y - 1) with (lo + hi) / 2 rounding down, so the middle stops moving once hi = lo + 1. Exclude the window Batman is on when you shrink the bounds."
      : 'The hints are not being used: update the bounds from every hint and recompute the jump each turn.';
    items.push({ turn: first.turn, player: 0, kind: 'tip', code: 'stuck-same-window', message: `From turn ${first.turn} to ${e.turn} Batman jumped to ${fmt(sx, sy)}, the window he was already on, ${best.run} times while the hints allowed ${fmtRegion(r)}. ${cause}` });
  }

  // What was wrong with jump e, on the axis that cost the most: { code, text }.
  explain(e) {
    const b = e.before, [x, y] = e.to, [px, py] = e.from, d = e.prevDir;
    const axes = [
      { name: 'X', c: x, p: px, lo: b[0], hi: b[1], neg: 'L', pos: 'R', negW: 'left', posW: 'right' },
      { name: 'Y', c: y, p: py, lo: b[2], hi: b[3], neg: 'U', pos: 'D', negW: 'up', posW: 'down' },
    ];
    for (const a of axes) {
      const n = a.hi - a.lo + 1, parts = R.axisParts(a.lo, a.hi, a.c), worst = Math.max(...parts.map(([l, h, hit]) => (hit ? 0 : R.guesses(h - l + 1))));
      a.n = n; a.parts = parts; a.cost = worst - (R.guesses(n) - 1);     // > 0: this axis lost jumps
    }
    const ax = axes.slice().sort((u, v) => v.cost - u.cost)[0];
    const mk = (code, text) => ({ code, text, axis: ax.name === 'X' ? 0 : 1 });   // axis: 0 = X, 1 = Y
    const mid = (ax.lo + ax.hi) >> 1;
    const hasNeg = d.includes(ax.neg), hasPos = d.includes(ax.pos);
    if (ax.lo === ax.hi && ax.c !== ax.lo) return mk('left-known-axis', `${ax.name} was already known to be ${ax.lo} (a hint without ${ax.name === 'X' ? 'L/R' : 'U/D'}, or narrowed down to one value), yet the jump went to ${ax.name}=${ax.c}: keep ${ax.name}=${ax.lo} and only search the other axis.`);
    if (x === px && y === py) return mk('same-window', `Batman jumped to the window he was already on: the device can only repeat "${d}", so the jump is lost.`);
    if ((hasNeg && ax.c >= ax.p) || (hasPos && ax.c <= ax.p)) {
      const way = hasNeg ? ax.negW : ax.posW;
      return mk('against-hint', `The device said "${d}" (bombs ${R.WORDS[d]}), but on ${ax.name} Batman went ${ax.c === ax.p ? 'nowhere' : `the other way (${ax.p} -> ${ax.c})`} instead of ${way}: ${ax.name} had to stay in ${span(ax.lo, ax.hi)}.`);
    }
    if (ax.c < ax.lo || ax.c > ax.hi) return mk('ruled-out-window', `Earlier hints had already put ${ax.name} in ${span(ax.lo, ax.hi)}, so ${ax.name}=${ax.c} told nothing new on that axis (a classic sign of bounds that are not updated with every hint).`);
    const sides = ax.parts.filter(q => !q[2]).map(([l, h]) => `${span(l, h)} (${h - l + 1})`);
    const cut = sides.length === 2 ? `cut at ${ax.c} into ${sides.join(' and ')}` : `cut at its edge (${ax.c}), leaving ${sides[0]} on one side`;
    return mk('unbalanced-split', `On ${ax.name} the range ${span(ax.lo, ax.hi)} (${ax.n} windows) was ${cut}: an uneven cut. The middle, ${ax.name}=${mid}, halves it.`);
  }

  getResult() {
    const o = this.outcome || { passed: false, message: 'game interrupted' };
    return { scores: [o.passed ? 1 : 0], winner: o.passed ? 0 : null, passed: o.passed, message: o.message, jumps: this.used };
  }
}

module.exports = { Referee: ShadowsKnightReferee };
