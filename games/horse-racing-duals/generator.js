'use strict';
// Random levels for Horse-racing Duals, like CodinGame's hidden validators: same rules, other numbers.
//   generate(seed) -> { name, input, expected }   (the data of one io test: whole input + expected output)
// Every level respects the constraints (1 < N < 100000, 0 < Pi <= 10000000). The expected answer is
// computed below by sorting (SPOILER: that is the reference solution of the puzzle).
const { mulberry32, seedToUint32 } = require('../base');

const MAX_P = 10000000;

function generate(seed) {
  const rng = mulberry32(seedToUint32(seed));
  const between = (a, b) => a + Math.floor(rng() * (b - a + 1));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // n distinct strengths whose sorted gaps are all > answer except exactly one gap == answer
  // (all within 1..top)
  const spaced = (n, answer, top = MAX_P) => {
    const start = between(1, 1000);
    let maxGap = Math.max(answer + 2, Math.floor(2 * (top - start) / n) - answer - 2);
    for (;;) {
      const v = [start];
      const special = between(1, n - 1);
      for (let i = 1; i < n; i++) v.push(v[i - 1] + (i === special ? answer : between(answer + 1, maxGap)));
      if (v[n - 1] <= top) return v;
      maxGap = Math.max(answer + 1, Math.floor(maxGap * 0.9));
    }
  };
  const answerFor = n => between(1, Math.max(1, Math.min(5000, Math.floor(MAX_P / n / 3))));

  const profiles = {
    'a few horses': () => { const n = between(2, 12), top = rng() < 0.5 ? 100 : MAX_P; return Array.from({ length: n }, () => between(1, top)); },
    'horses in any order': () => shuffle(spaced(between(10, 400), answerFor(400))),
    'twins far apart': () => {
      const n = between(10, 5000);
      const v = shuffle(spaced(n, answerFor(n)));
      v[v.length - 1] = v[0];                                    // same strength on the first and last line
      return v;
    },
    'closest pair at an end': () => {
      const n = between(5, 2000);
      const v = spaced(n, answerFor(n));
      // move the single closest gap to the bottom or the top of the sorted order
      const gaps = v.slice(1).map((x, i) => x - v[i]);
      const k = gaps.indexOf(Math.min(...gaps)), atTop = rng() < 0.5;
      const g = gaps.splice(k, 1)[0];
      if (atTop) gaps.push(g); else gaps.unshift(g);
      const w = [v[0]];
      for (const d of gaps) w.push(w[w.length - 1] + d);
      // the closest pair on the first or the last input lines, the others shuffled
      const pair = atTop ? w.slice(-2) : w.slice(0, 2), rest = shuffle(atTop ? w.slice(0, -2) : w.slice(2));
      return rng() < 0.5 ? [...pair, ...rest] : [...rest, ...pair];
    },
    'mixed digit counts': () => {
      const small = spaced(between(50, 400), between(1, 10), 99999);             // 1 to 5 digits
      const big = spaced(between(500, 3000), between(1, 200), MAX_P - 1000000).map(x => x + 1000000);   // 7 digits
      return shuffle([...small, ...big]);
    },
    'many horses': () => { const n = between(50000, 99999); return shuffle(spaced(n, answerFor(n))); },
  };
  const names = Object.keys(profiles);
  const profile = names[Math.floor(rng() * names.length)];
  let p = profiles[profile]();
  if (p.length < 2) p = [between(1, MAX_P), between(1, MAX_P)];
  const n = p.length;

  // --- SPOILER: reference answer -------------------------------------------------------------------
  const s = [...p].sort((a, b) => a - b);
  let best = Infinity;
  for (let i = 1; i < n; i++) best = Math.min(best, s[i] - s[i - 1]);
  // -------------------------------------------------------------------------------------------------

  return { name: `Random: ${profile}, N = ${n} (seed ${seed})`, input: `${n}\n${p.join('\n')}\n`, expected: `${best}\n` };
}

module.exports = { generate };
