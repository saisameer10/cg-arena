// The Bridge - Episode 2 starter. readline(), print() and printErr() are provided, like on CodinGame.
const M = parseInt(readline());      // number of motorbikes
const V = parseInt(readline());      // minimum number of motorbikes that must survive
const lanes = [];                    // '.' safe, '0' hole; lane 0 is the top
for (let i = 0; i < 4; i++) lanes.push(readline());

while (true) {
  const line = readline();
  if (line === null) break;
  const S = parseInt(line);          // speed
  const bikes = [];
  for (let i = 0; i < M; i++) {
    const [X, Y, A] = readline().split(' ').map(Number);   // A = 1 running, 0 lost
    bikes.push({ X, Y, A });
  }
  printErr(`speed=${S} bikes=${JSON.stringify(bikes)}`);
  print('SPEED');                    // SPEED, SLOW, JUMP, WAIT, UP or DOWN
}
