'use strict';
// Checks for Tron Battle (node cli.js selftest tron). Exit code 0 = all pass.
const path = require('path');
const { Referee } = require(path.join(__dirname, 'referee.js'));
const { GameError } = require(path.join(__dirname, '..', 'base.js'));

let fails = 0, n = 0;
const check = (name, ok) => { n++; if (!ok) { fails++; console.log('FAIL ' + name); } };
// a game with both players placed where we want them
function game(p0, p1) {
  const r = new Referee({ seed: 1, playerCount: 2 });
  r.grid.forEach(row => row.fill(-1));
  r.players.forEach((p, i) => { const [x, y] = i ? p1 : p0; Object.assign(p, { x0: x, y0: y, x, y, alive: true, trail: [[x, y]] }); r.grid[y][x] = i; });
  r.aliveCount = 2;
  return r;
}

let r = game([0, 0], [10, 10]);
check('input lists every player as X0 Y0 X1 Y1', r.getTurnInput(0).join('|') === '2 0|0 0 0 0|10 10 10 10');
r.applyOutput(0, ['RIGHT']);
check('a move leaves a wall', r.grid[0][1] === 0 && r.players[0].x === 1);
r = game([0, 0], [10, 10]); r.applyOutput(0, ['UP']);
check('driving off the grid kills', !r.players[0].alive);
check("a dead player's wall disappears", r.grid[0][0] === -1);
r = game([5, 5], [10, 10]); r.applyOutput(0, ['RIGHT']); r.applyOutput(0, ['LEFT']);
check('driving into your own trail kills', !r.players[0].alive);
r = game([5, 5], [6, 5]); r.applyOutput(0, ['RIGHT']);
check("driving into the opponent's head kills", !r.players[0].alive);
r = game([0, 0], [10, 10]);
let threw = false; try { r.applyOutput(0, ['FORWARD']); } catch (e) { threw = e instanceof GameError; }
check('an invalid command is a GameError', threw);
r = game([0, 0], [10, 10]); r.applyOutput(0, ['UP']); r.endTurn();
check('the survivor wins', r.isGameOver() && r.getResult().winner === 1);
check('dead players are sent as -1 -1 -1 -1', r.getTurnInput(1)[1] === '-1 -1 -1 -1');

console.log(`${n - fails}/${n} checks passed`);
process.exit(fails ? 1 : 0);
