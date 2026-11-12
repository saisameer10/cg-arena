'use strict';
// Rule checks for the Ocean of Code port (node cli.js selftest ocean-of-code). Exit code 0 = all pass.
const path = require('path');
const { Referee } = require(path.join(__dirname, 'referee.js'));
const { GameError } = require(path.join(__dirname, '..', 'base.js'));

let fails = 0, n = 0;
const check = (name, ok) => { n++; if (!ok) { fails++; console.log('FAIL ' + name); } };
const waters = r => { const w = []; for (let y = 0; y < 15; y++) for (let x = 0; x < 15; x++) if (r.isEmpty(x, y)) w.push([x, y]); return w; };
function fresh(league) {
  const r = new Referee({ seed: 1, league });
  const w = waters(r);
  r.applyOutput(0, [w[0].join(' ')]); r.applyOutput(1, [w[w.length - 1].join(' ')]); r.endTurn();
  return r;
}
const throwsWith = (fn, sub) => { try { fn(); return false; } catch (e) { return e instanceof GameError && e.message.includes(sub); } };
const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const freeDir = (r, p) => Object.keys(DIRS).find(d => r.isEmpty(p.x + DIRS[d][0], p.y + DIRS[d][1]) && !p.visited[p.x + DIRS[d][0]][p.y + DIRS[d][1]]);

let r = fresh('wood2');
check('wood2 cooldowns: sonar/silence/mine are -1', r.getTurnInput(0)[0].split(' ').slice(4).join(' ') === '3 -1 -1 -1');
r.applyOutput(0, ['TORPEDO 5 5']);
check('uncharged TORPEDO alone falls back to SURFACE', r.players[0].life === 5 && /^SURFACE \d$/.test(r.players[0].summaries.join('|')));
r = fresh('wood2');
check('same order twice loses', throwsWith(() => r.applyOutput(0, ['SURFACE|SURFACE']), 'Two equal commands'));
r = fresh('wood1');
check('charging MINE in wood1 loses', throwsWith(() => r.applyOutput(0, ['MOVE E MINE']), 'Invalid power to charge'));
r = fresh('wood1');
check('MINE in wood1 is an unknown command', throwsWith(() => r.applyOutput(0, ['MINE N']), 'Unknown command'));
r = fresh('bronze');
check('lowercase is an unknown command', throwsWith(() => r.applyOutput(0, ['move N']), 'Unknown command'));
r = fresh('bronze');
{
  const p = r.players[0], d = freeDir(r, p), back = { N: 'S', S: 'N', E: 'W', W: 'E' }[d];
  r.applyOutput(0, ['MOVE ' + d]); r.endTurn(); r.applyOutput(1, ['SURFACE']); r.endTurn();
  check('moving back onto a visited cell loses', throwsWith(() => r.applyOutput(0, ['MOVE ' + back]), 'visit same location twice'));
}
r = fresh('bronze');
{
  const p = r.players[0]; p.charges.MINE = 3;
  const d = freeDir(r, p), [dx, dy] = DIRS[d];
  r.applyOutput(0, [`MINE ${d}|TRIGGER ${p.x + dx} ${p.y + dy}`]);
  check('a mine cannot be triggered in the turn it is placed', p.mines.length === 1 && !p.mines[0].blown && p.life === 6);
  r.endTurn(); r.applyOutput(1, ['SURFACE']); r.endTurn();
  const m = p.mines[0];
  r.applyOutput(0, [`TRIGGER ${m.x} ${m.y}`]);
  check('the mine is armed on the next turn', !!r.events.trigger && p.life === 5);
}
r = fresh('bronze');
{
  const p = r.players[0]; p.charges.TORPEDO = 3; const far = r.players[1];
  r.applyOutput(0, [`TORPEDO ${far.x} ${far.y}`]);
  check('an out-of-range torpedo is skipped, then SURFACE', r.events.skipped.length === 1 && p.life === 5);
}
r = fresh('bronze'); r.players[0].charges.TORPEDO = 3;
check('a coordinate beyond Java int is fatal', throwsWith(() => r.applyOutput(0, ['TORPEDO 99999999999 1']), 'Invalid params to Torpedo'));
check('bad start position loses', throwsWith(() => new Referee({ seed: 1, league: 'bronze' }).applyOutput(0, ['-1 3']), 'Cannot read initial coordinates'));
check('placement + 598 rounds', Referee.meta.maxTurns === 599);
r = fresh('bronze'); r.frames = 999;
r.applyOutput(0, ['SURFACE|MOVE E TORPEDO']);
check('the 1000-frame cap stops the game mid-turn', r.isGameOver() && !r.players[0].summaries.join('|').includes('MOVE'));
check('the same seed gives the same map', new Referee({ seed: 1 }).map.join() === new Referee({ seed: '1' }).map.join());
check('seed 1 map row 11 (java.util.Random port)', new Referee({ seed: 1 }).map[11] === '.xxxx.........x');

console.log(`${n - fails}/${n} checks passed`);
process.exit(fails ? 1 : 0);
