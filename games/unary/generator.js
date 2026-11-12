'use strict';
// Random test inputs (hidden-validator style): one message of 1 to 100 printable ASCII characters.
// node cli.js make-tests unary runs the reference solution to get the expected output.
const { mulberry32, seedToUint32 } = require('../base');

const PROFILES = [
  { name: 'single character', len: [1, 1], chars: 'ACDHOPZ%' },
  { name: 'repeated letter', len: [2, 6], repeat: true },
  { name: 'short word', len: [3, 12], chars: 'abcdefghijklmnopqrstuvwxyz' },
  { name: 'sentence', len: [20, 100], chars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?\'%-' },
  { name: 'symbols', len: [5, 40], chars: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~' },
];

function generate(seed) {
  const rng = mulberry32(seedToUint32(seed));
  const int = (a, b) => a + Math.floor(rng() * (b - a + 1));
  const p = PROFILES[int(0, PROFILES.length - 1)];
  const n = int(p.len[0], p.len[1]);
  const all = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('');
  let msg = '';
  if (p.repeat) { const c = all[int(33, 94)]; msg = c.repeat(n); }
  else for (let i = 0; i < n; i++) msg += p.chars[int(0, p.chars.length - 1)];
  msg = msg.replace(/^ +| +$/g, 'x');   // no leading/trailing space (lines are compared after trimming)
  return { name: `${p.name} (seed ${seed})`, input: msg + '\n' };
}

module.exports = { generate };
