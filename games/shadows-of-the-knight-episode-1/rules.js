'use strict';
// Shadows of the Knight - Episode 1: shared rules and search theory, used by the referee, the generator
// and the review. No official referee source is public; the rules come from the statement and from
// CodinGame's public replays of this puzzle (see challenges/shadows-of-the-knight-episode-1.md).
//
// The bombs can only be in the windows that every hint so far allows. Each hint compares one coordinate at
// a time (U/D for Y, L/R for X), so that set is always a rectangle [x0..x1] x [y0..y1] ("region").
// The two axes are independent searches with three outcomes per jump (smaller / equal / larger), so the
// fewest jumps that guarantee a find from a region is max(g(width), g(height)) with g(n) = ceil(log2(n + 1)):
// k jumps can tell apart at most 2^k - 1 windows on one axis. (Checked against an exhaustive minimax search
// for all regions up to 12 x 12, see the challenge notes.)

const DIRS = ['U', 'UR', 'R', 'DR', 'D', 'DL', 'L', 'UL'];
const WORDS = {
  U: 'above Batman', D: 'below Batman', L: 'to the left of Batman', R: 'to the right of Batman',
  UL: 'above and to the left of Batman', UR: 'above and to the right of Batman',
  DL: 'below and to the left of Batman', DR: 'below and to the right of Batman',
};
const MAX_SIDE = 10000, MIN_N = 2, MAX_N = 100;

// Direction of the bombs seen from (x, y): vertical letter first (U/D), then horizontal (L/R). '' = found.
function direction(x, y, bx, by) {
  return (by < y ? 'U' : by > y ? 'D' : '') + (bx > x ? 'R' : bx < x ? 'L' : '');
}

// Region left after a hint `dir` received at (x, y). Returns [x0, x1, y0, y1]; empty when x0 > x1 or y0 > y1.
function narrow([x0, x1, y0, y1], x, y, dir) {
  if (dir.includes('U')) y1 = Math.min(y1, y - 1); else if (dir.includes('D')) y0 = Math.max(y0, y + 1); else { y0 = Math.max(y0, y); y1 = Math.min(y1, y); }
  if (dir.includes('L')) x1 = Math.min(x1, x - 1); else if (dir.includes('R')) x0 = Math.max(x0, x + 1); else { x0 = Math.max(x0, x); x1 = Math.min(x1, x); }
  return [x0, x1, y0, y1];
}
const width = r => Math.max(0, r[1] - r[0] + 1);
const height = r => Math.max(0, r[3] - r[2] + 1);
const area = r => width(r) * height(r);
const contains = (r, x, y) => x >= r[0] && x <= r[1] && y >= r[2] && y <= r[3];

// fewest guesses that surely find one of n windows on a line (0 for n = 0)
function guesses(n) { let k = 0; while (2 ** k - 1 < n) k++; return k; }
// fewest jumps that surely land on the bombs from this region (Infinity for an empty region)
function need(r) { return area(r) ? Math.max(guesses(width(r)), guesses(height(r))) : Infinity; }

// The parts of one axis [a..b] that a jump at coordinate c can leave: [lo, hi, isHit].
function axisParts(a, b, c) {
  if (c < a || c > b) return [[a, b, false]];
  const parts = [[c, c, true]];
  if (c > a) parts.push([a, c - 1, false]);
  if (c < b) parts.push([c + 1, b, false]);
  return parts;
}
// Every region a jump to (x, y) can leave (one per possible hint), except "found" ([] when the jump surely wins).
function outcomes(r, x, y) {
  const out = [];
  for (const [ax, bx, hx] of axisParts(r[0], r[1], x)) for (const [ay, by, hy] of axisParts(r[2], r[3], y)) {
    if (hx && hy) continue;    // the bombs are on (x, y): found
    out.push([ax, bx, ay, by]);
  }
  return out;
}
// Worst case after jumping to (x, y): the fewest further jumps needed whatever the next hint is (0 = surely found).
function worstAfter(r, x, y) { return outcomes(r, x, y).reduce((m, o) => Math.max(m, need(o)), 0); }
// The middle of the region: always a best jump (each axis split into two halves of equal size, give or take one).
function middle(r) { return [(r[0] + r[1]) >> 1, (r[2] + r[3]) >> 1]; }

// Hardest first hint for a level whose bombs are not fixed (random or moving): the largest need over the
// directions possible from the start.
function startNeed(W, H, x0, y0, bomb) {
  const all = [0, W - 1, 0, H - 1];
  if (Array.isArray(bomb)) return need(narrow(all, x0, y0, direction(x0, y0, bomb[0], bomb[1])));
  let worst = 0;
  for (const d of DIRS) { const r = narrow(all, x0, y0, d); if (area(r)) worst = Math.max(worst, need(r)); }
  return worst;
}

// Checks a level's data; returns the normalized level or throws with what is wrong.
function checkLevel(t) {
  const int = v => Number.isInteger(v);
  if (!t || typeof t !== 'object') throw new Error('test case: expected an object');
  const { W, H, N } = t;
  if (!int(W) || !int(H) || W < 1 || H < 1 || W > MAX_SIDE || H > MAX_SIDE) throw new Error(`test case: W and H must be integers 1..${MAX_SIDE}`);
  if (W * H < 2) throw new Error('test case: the building needs at least 2 windows');
  if (!int(N) || N < MIN_N || N > MAX_N) throw new Error(`test case: N must be an integer ${MIN_N}..${MAX_N}`);
  const s = t.start;
  if (!Array.isArray(s) || s.length !== 2 || !int(s[0]) || !int(s[1]) || s[0] < 0 || s[0] >= W || s[1] < 0 || s[1] >= H) throw new Error('test case: start must be [X0, Y0] inside the building');
  const b = t.bomb === undefined ? 'random' : t.bomb;
  if (b !== 'random') {
    if (!Array.isArray(b) || b.length !== 2 || !int(b[0]) || !int(b[1]) || b[0] < 0 || b[0] >= W || b[1] < 0 || b[1] >= H) throw new Error('test case: bomb must be [X, Y] inside the building, or "random"');
    if (b[0] === s[0] && b[1] === s[1]) throw new Error('test case: the bombs cannot be on the start window');
  }
  if (t.evasive !== undefined && typeof t.evasive !== 'boolean') throw new Error('test case: evasive must be true or false');
  return { name: t.name, W, H, N, start: [s[0], s[1]], bomb: b, evasive: !!t.evasive, seed: t.seed };
}

module.exports = { DIRS, WORDS, MAX_SIDE, MIN_N, MAX_N, direction, narrow, width, height, area, contains, guesses, need, outcomes, worstAfter, middle, axisParts, startNeed, checkLevel };
