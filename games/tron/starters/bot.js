// Tron Battle starter. readline(), print() and printErr() are provided, like on CodinGame.
const W = 30, H = 20;
const grid = Array.from({ length: H }, () => new Array(W).fill(false)); // true = wall

while (true) {
  const line = readline();
  if (line === null) break;
  const [n, p] = line.split(' ').map(Number);
  const heads = [];
  for (let i = 0; i < n; i++) {
    const [x0, y0, x1, y1] = readline().split(' ').map(Number);
    heads.push([x1, y1]);
    if (x0 !== -1) { grid[y0][x0] = true; grid[y1][x1] = true; }
  }
  const [mx, my] = heads[p];
  let move = 'UP';
  for (const [name, dx, dy] of [['UP', 0, -1], ['RIGHT', 1, 0], ['DOWN', 0, 1], ['LEFT', -1, 0]]) {
    const nx = mx + dx, ny = my + dy;
    if (nx >= 0 && nx < W && ny >= 0 && ny < H && !grid[ny][nx]) { move = name; break; }
  }
  printErr(`head=(${mx},${my}) -> ${move}`);
  print(move);
}
