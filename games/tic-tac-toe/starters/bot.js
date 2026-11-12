// Ultimate Tic-Tac-Toe starter. readline(), print() and printErr() are provided, like on CodinGame.
// Rows and columns go from 0 to 8 (0 to 2 in the Wood league). Player 0 moves first.

while (true) {
  const line = readline();
  if (line === null) break;
  const [opponentRow, opponentCol] = line.split(' ').map(Number);   // -1 -1 on your first turn if you start
  const validActionCount = parseInt(readline(), 10);
  const actions = [];
  for (let i = 0; i < validActionCount; i++) {
    const [row, col] = readline().split(' ').map(Number);
    actions.push([row, col]);
  }

  // The list is shuffled every turn, so the first action is a random legal move. Replace this with your logic.
  const [row, col] = actions[0];
  printErr(`opponent played ${opponentRow} ${opponentCol}, ${validActionCount} valid actions`);
  print(`${row} ${col}`);
}
