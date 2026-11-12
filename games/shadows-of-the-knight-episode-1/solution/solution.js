// ============================================================================================
//  SPOILER: reference solution for Shadows of the Knight - Episode 1. Do not read it before
//  solving the puzzle yourself. It exists to prove that every test and generated level can be
//  passed (node cli.js shadows-of-the-knight-episode-1 games/shadows-of-the-knight-episode-1/solution/solution.js --test all --random 20).
// ============================================================================================
// Keep the rectangle of windows that every hint allows, shrink it with each hint (the window Batman is on
// is never the bombs', so the bounds are exclusive), and always jump to its middle. Each axis is a binary
// search with three outcomes, which is optimal: worst case max(ceil(log2(w + 1)), ceil(log2(h + 1))) jumps.
// Works unchanged when the bombs move, because they always stay inside that rectangle.
const [W, H] = readline().split(' ').map(Number);
readline();                                         // N: jumps available (not needed by this strategy)
let [x, y] = readline().split(' ').map(Number);
let x0 = 0, x1 = W - 1, y0 = 0, y1 = H - 1;
for (;;) {
  const dir = readline();
  if (dir === null) break;
  if (dir.includes('U')) y1 = y - 1; else if (dir.includes('D')) y0 = y + 1; else y0 = y1 = y;
  if (dir.includes('L')) x1 = x - 1; else if (dir.includes('R')) x0 = x + 1; else x0 = x1 = x;
  x = (x0 + x1) >> 1;
  y = (y0 + y1) >> 1;
  print(`${x} ${y}`);
}
