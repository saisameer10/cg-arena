// Tron boss. Levels: wood (random safe move), bronze (max flood-fill area), silver (Voronoi territory).
'use strict';
const level = process.argv[2] || 'bronze';
const W = 30, H = 20;
const DIRS = [['UP', 0, -1], ['DOWN', 0, 1], ['LEFT', -1, 0], ['RIGHT', 1, 0]];
const grid = new Int8Array(W * H);         // 1 = wall
const cells = [];                          // per player: list of occupied cells
let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

function floodSize(sx, sy, blocked) {
  const seen = new Uint8Array(W * H);
  const stack = [sx + sy * W]; seen[sx + sy * W] = 1; let n = 0;
  while (stack.length) {
    const c = stack.pop(); n++;
    const x = c % W, y = (c / W) | 0;
    for (const [, dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const k = nx + ny * W;
      if (grid[k] || seen[k] || blocked === k) continue;
      seen[k] = 1; stack.push(k);
    }
  }
  return n;
}
function bfsDist(sx, sy) {
  const d = new Int16Array(W * H).fill(-1);
  const q = [sx + sy * W]; d[q[0]] = 0;
  for (let i = 0; i < q.length; i++) {
    const c = q[i], x = c % W, y = (c / W) | 0;
    for (const [, dx, dy] of DIRS) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const k = nx + ny * W;
      if (grid[k] || d[k] >= 0) continue;
      d[k] = d[c] + 1; q.push(k);
    }
  }
  return d;
}
function voronoi(mx, my, ox, oy) {
  const dm = bfsDist(mx, my), dop = bfsDist(ox, oy);
  let s = 0;
  for (let k = 0; k < W * H; k++) {
    if (grid[k]) continue;
    if (dm[k] >= 0 && (dop[k] < 0 || dm[k] < dop[k])) s++;
    else if (dop[k] >= 0 && (dm[k] < 0 || dop[k] < dm[k])) s--;
  }
  return s;
}

for (;;) {
  const line = readline();
  if (line === null) break;
  const [n, me] = line.split(' ').map(Number);
  const heads = [];
  for (let i = 0; i < n; i++) {
    const [x0, y0, x1, y1] = readline().split(' ').map(Number);
    if (!cells[i]) cells[i] = [];
    if (x0 === -1) { for (const k of cells[i]) grid[k] = 0; cells[i] = []; heads.push(null); continue; }
    for (const k of [x0 + y0 * W, x1 + y1 * W]) if (!grid[k]) { grid[k] = 1; cells[i].push(k); }
    heads.push([x1, y1]);
  }
  const [mx, my] = heads[me];
  const opp = heads.find((h, i) => h && i !== me) || [mx, my];
  let best = null, bestScore = -Infinity;
  for (const [name, dx, dy] of DIRS) {
    const nx = mx + dx, ny = my + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H || grid[nx + ny * W]) continue;
    let score;
    if (level === 'wood') score = rnd();
    else {
      grid[nx + ny * W] = 1;
      score = level === 'silver' ? voronoi(nx, ny, opp[0], opp[1]) * 10 + floodSize(nx, ny, -1) : floodSize(nx, ny, -1);
      grid[nx + ny * W] = 0;
      score += rnd() * 0.5;
    }
    if (score > bestScore) { bestScore = score; best = name; }
  }
  printErr(`boss ${level}: ${best} score=${bestScore.toFixed(1)}`);
  print(best || 'UP');
}
