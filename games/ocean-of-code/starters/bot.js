// Ocean of Code starter. readline(), print() and printErr() are provided, like on CodinGame.
const [width, height, myId] = readline().split(' ').map(Number);
const grid = [];
for (let i = 0; i < height; i++) grid.push(readline());
const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const water = (x, y) => x >= 0 && y >= 0 && x < width && y < height && grid[y][x] === '.';

let start = null;
for (let y = 0; y < height && !start; y++) for (let x = 0; x < width && !start; x++) if (water(x, y)) start = [x, y];
let visited = new Set([start.join(',')]);
print(`${start[0]} ${start[1]}`);

while (true) {
  const line = readline();
  if (line === null) break;
  const [x, y, myLife, oppLife, torpedoCd, sonarCd, silenceCd, mineCd] = line.split(' ').map(Number);
  const sonarResult = readline();
  const opponentOrders = readline();
  printErr(`me=(${x},${y}) life=${myLife} opp=${oppLife} torpedoCd=${torpedoCd} oppOrders=${opponentOrders}`);

  let order = null;
  for (const [d, [dx, dy]] of Object.entries(DIRS)) {
    const nx = x + dx, ny = y + dy;
    if (water(nx, ny) && !visited.has(`${nx},${ny}`)) { visited.add(`${nx},${ny}`); order = `MOVE ${d} TORPEDO`; break; }
  }
  if (!order) { visited = new Set([`${x},${y}`]); order = 'SURFACE'; }
  print(order);
}
