'use strict';
// Random test inputs (hidden-validator style); node cli.js make-tests temperatures computes the answers
// with the reference solution.
const { mulberry32, seedToUint32 } = require('../base');

const PROFILES = [
  { name: 'few values', n: [1, 5] },
  { name: 'many values', n: [100, 2000] },
  { name: 'only negative', n: [2, 30], neg: true },
  { name: 'with a tie', n: [2, 30], tie: true },
  { name: 'no temperature', n: [0, 0] },
];

function generate(seed) {
  const rng = mulberry32(seedToUint32(seed));
  const int = (a, b) => a + Math.floor(rng() * (b - a + 1));
  const p = PROFILES[int(0, PROFILES.length - 1)];
  const n = int(p.n[0], p.n[1]);
  const t = [];
  for (let i = 0; i < n; i++) t.push(p.neg ? -int(1, 273) : int(-273, 5526));
  if (p.tie && n >= 2) { const v = int(1, 50); t[int(0, n - 1)] = -v; t[int(0, n - 1)] = v; for (let i = 0; i < n; i++) if (Math.abs(t[i]) < v) t[i] = v + int(1, 100); }
  return { name: `${p.name} (seed ${seed})`, input: `${n}\n${t.join(' ')}\n` };
}

module.exports = { generate };
