// Try Catch Forest starter. readline(), print() and printErr() are provided, like on CodinGame.
// You (myId) catch the units of player (myId + 1) % 3 and are caught by player (myId + 2) % 3.
const myId = parseInt(readline());
const mapRadius = parseInt(readline());
const treeCount = parseInt(readline());
for (let i = 0; i < treeCount; i++) {
  const [treeId, treeX, treeY, treeRadius] = readline().split(' ').map(Number);
}
while (true) {
  const myScore = parseInt(readline());
  const [nets, smokes, decoys] = readline().split(' ').map(Number);
  const entityCount = parseInt(readline());
  const commands = [];
  for (let i = 0; i < entityCount; i++) {
    const f = readline().split(' ');
    const id = +f[0], type = f[1], owner = +f[2], x = +f[3], y = +f[4], dx = +f[5], dy = +f[6];
    const ghost = +f[7], turnsRemaining = +f[8], fatigue = +f[9], immobilizedTurns = +f[10];
    if (type === 'UNIT' && owner === myId) commands.push(`MOVE ${id} 0 0`);   // every unit walks to the centre
  }
  // MOVE | DASH | NET | SMOKE | DECOY <id> <x> <y>, joined by ';', or WAIT
  print(commands.length ? commands.join(';') : 'WAIT');
}
