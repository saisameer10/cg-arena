// Shadows of the Knight - Episode 1 starter. readline(), print() and printErr() are provided, like on CodinGame.
const [W, H] = readline().split(' ').map(Number);   // width and height of the building, in windows
const N = parseInt(readline());                     // number of jumps before the bombs go off
const [X0, Y0] = readline().split(' ').map(Number); // Batman's starting window; (0,0) is the top-left window

while (true) {
  const bombDir = readline();                       // where the bombs are: U, UR, R, DR, D, DL, L or UL
  if (bombDir === null) break;
  printErr(`building ${W}x${H}, ${N} jumps, batman (${X0},${Y0}), bombs ${bombDir}`);
  print('0 0');                                     // the next window Batman jumps to: "X Y"
}
