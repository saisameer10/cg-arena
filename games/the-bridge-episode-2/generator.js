'use strict';
// Random levels for The Bridge - Episode 2, like CodinGame's hidden validators: different maps,
// same rules. Every level is checked with the solver, so it is always possible to pass it.
//   generate(seed)            -> a level from a random profile
//   generate(seed, profile)   -> a level with explicit parameters (used to build tests/*.json)
const { mulberry32, seedToUint32 } = require('../base');
const { move, solve, solveBest, LANES } = require('./rules');

const PROFILES = {
  easy:   { L: [25, 60],   bikes: [1, 2], density: [0.04, 0.08], run: [1, 3], column: 0.5, speed: [0, 3], keep: 'max' },
  medium: { L: [50, 120],  bikes: [2, 4], density: [0.07, 0.13], run: [1, 4], column: 0.3, speed: [0, 5], keep: 'random' },
  hard:   { L: [100, 250], bikes: [3, 4], density: [0.10, 0.18], run: [1, 6], column: 0.2, speed: [0, 8], keep: 'max' },
};

function generate(seed, profile = null) {
  const rng = mulberry32(seedToUint32(seed));
  const between = ([a, b]) => a + Math.floor(rng() * (b - a + 1));
  const real = ([a, b]) => a + rng() * (b - a);
  const p = profile || PROFILES[['easy', 'medium', 'hard'][Math.floor(rng() * 3)]];
  for (let attempt = 0; attempt < 400; attempt++) {
    const L = between(p.L);
    const M = between(p.bikes);
    const lanes = [0, 1, 2, 3].sort(() => rng() - 0.5).slice(0, M).sort((a, b) => a - b);
    const speed = between(p.speed);
    const rows = Array.from({ length: LANES }, () => new Array(L).fill('.'));
    const density = real(p.density);
    for (let x = 3; x < L - 1; x++) {
      if (rng() >= density) continue;
      const run = between(p.run);
      const all = rng() < p.column;
      const lane = Math.floor(rng() * LANES);
      for (let k = 0; k < run && x + k < L; k++) for (let y = 0; y < LANES; y++) if (all || y === lane) rows[y][x + k] = '0';
      x += run;
    }
    const road = rows.map(r => r.join(''));
    const best = solveBest(road, 1, speed, lanes);
    if (!best) continue;
    const V = p.keep === 'max' ? best.survivors : 1 + Math.floor(rng() * best.survivors);
    // must not be beatable by repeating one command (holding SPEED, WAIT or JUMP)
    if (['SPEED', 'WAIT', 'JUMP'].some(c => passesWith(road, V, speed, lanes, c))) continue;
    if (!solve(road, V, speed, lanes)) continue;   // cannot happen, but keep the guarantee explicit
    return { name: `Random level (seed ${seed})`, V, speed, lanes, road };
  }
  // fallback: a single gap, always solvable
  return { name: `Random level (seed ${seed})`, V: 1, speed: 1, lanes: [1], road: Array.from({ length: LANES }, () => '.....000..........') };
}

function passesWith(road, need, s, lanes, cmd) {
  let x = 0;
  for (let t = 0; t < 50; t++) {
    const r = move(road, x, s, lanes, cmd);
    lanes = lanes.filter((_, i) => !r.dead[i]).map(y => y + r.dy);
    if (lanes.length < need) return false;
    x = r.x; s = r.s;
    if (x >= road[0].length) return true;
  }
  return false;
}

module.exports = { generate, PROFILES };
