'use strict';
// Random levels for Shadows of the Knight - Episode 1, like CodinGame's hidden validators: other buildings,
// other bombs, same rules. Every level gives at least as many jumps as the worst case of a perfect search
// needs (rules.startNeed, proven by exhaustive search), so a correct binary search always passes it.
//   generate(seed)            -> a level from a random profile
//   generate(seed, profile)   -> a level with explicit parameters (used to build tests/*.json)
const { mulberry32, seedToUint32 } = require('../base');
const { startNeed, MAX_N, MIN_N } = require('./rules');

// side: [min, max] of W and H; slack: extra jumps over the worst case; line: one side is 1 (tower / corridor);
// edge: the bombs on the border or in a corner; evasive: the bombs move after every jump (bomb chosen in play).
const PROFILES = {
  small:   { side: [2, 40],       slack: [0, 2] },
  medium:  { side: [30, 1000],    slack: [0, 1] },
  large:   { side: [1000, 10000], slack: [0, 1] },
  line:    { side: [20, 10000],   slack: [0, 1], line: true },
  edge:    { side: [50, 10000],   slack: [0, 0], edge: true },
  evasive: { side: [200, 10000],  slack: [0, 0], evasive: true },
  roomy:   { side: [3, 25],       slack: [15, 40] },
};
const ORDER = ['small', 'medium', 'large', 'line', 'edge', 'evasive', 'roomy'];

function generate(seed, profile = null) {
  const rng = mulberry32(seedToUint32(seed));
  const between = ([a, b]) => a + Math.floor(rng() * (b - a + 1));
  const p = typeof profile === 'string' ? PROFILES[profile] : profile || PROFILES[ORDER[Math.floor(rng() * ORDER.length)]];
  for (let attempt = 0; attempt < 200; attempt++) {
    let W = between(p.side), H = between(p.side);
    if (p.line) { if (rng() < 0.5) W = 1; else H = 1; }
    if (W * H < 2) continue;
    const pick = n => Math.floor(rng() * n);
    // start anywhere; for edge levels in the far half so the bombs on the border are a long way off
    let x0 = pick(W), y0 = pick(H), bomb;
    if (p.edge) {
      const cx = rng() < 0.5 ? 0 : W - 1, cy = rng() < 0.5 ? 0 : H - 1;
      x0 = cx === 0 ? W - 1 - pick(Math.ceil(W / 4)) : pick(Math.ceil(W / 4));
      y0 = cy === 0 ? H - 1 - pick(Math.ceil(H / 4)) : pick(Math.ceil(H / 4));
      bomb = rng() < 0.5 ? [cx, cy] : rng() < 0.5 ? [cx, pick(H)] : [pick(W), cy];
    } else bomb = [pick(W), pick(H)];
    if (bomb[0] === x0 && bomb[1] === y0) continue;
    if (bomb[0] === 0 && bomb[1] === 0 && !p.edge) continue;   // the starter prints "0 0": it must not pass by accident
    const level = { name: `Random level (seed ${seed})`, W, H, start: [x0, y0], bomb: p.evasive ? 'random' : bomb };
    if (p.evasive) { level.evasive = true; level.seed = String(seed); }
    const worst = startNeed(W, H, x0, y0, level.bomb);
    const N = worst + between(p.slack);
    if (N < MIN_N || N > MAX_N) continue;
    // a tight level must not be beaten by walking one window per jump towards the bombs
    if (!p.evasive && p.slack[1] < 10 && Math.max(Math.abs(bomb[0] - x0), Math.abs(bomb[1] - y0)) <= N) continue;
    level.N = N;
    return level;
  }
  // fallback (not reached in practice): a 2 x 1 building, the bombs next to Batman, 2 jumps
  return { name: `Random level (seed ${seed})`, W: 2, H: 1, N: 2, start: [0, 0], bomb: [1, 0] };
}

module.exports = { generate, PROFILES };
