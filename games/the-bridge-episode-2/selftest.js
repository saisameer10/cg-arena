'use strict';
// Checks for The Bridge - Episode 2 (node cli.js selftest the-bridge-episode-2). Exit code 0 = all pass.
const path = require('path');
const fs = require('fs');
const { move, solve } = require(path.join(__dirname, 'rules.js'));
const { generate } = require(path.join(__dirname, 'generator.js'));
const { Referee } = require(path.join(__dirname, 'referee.js'));

let fails = 0, n = 0;
const check = (name, ok) => { n++; if (!ok) { fails++; console.log('FAIL ' + name); } };
const road4 = s => [s, s, s, s];

// movement rules, including the UP/DOWN "black zone" of the official diagram
const R = ['..........', '..0.......', '..........', '..........'];
check('straight move: a hole between start and landing kills', move(road4('..0.......'), 0, 2, [0], 'WAIT').dead[0] === true);
check('straight move: the start cell is not checked', move(road4('0.........'), 0, 1, [0], 'WAIT').dead[0] === false);
check('JUMP: only the landing cell counts', move(road4('..0.......'), 0, 3, [0], 'JUMP').dead[0] === false);
check('JUMP onto a hole kills', move(road4('...0......'), 0, 3, [0], 'JUMP').dead[0] === true);
check('UP checks the new lane up to the landing cell', move(R, 0, 2, [2], 'UP').dead[0] === true);
check('UP does not check the landing column on the old lane', move(['..........', '..........', '..0.......', '..........'], 0, 2, [2], 'UP').dead[0] === false);
check('UP checks the old lane before the landing column', move(['..........', '..........', '.0........', '..........'], 0, 2, [2], 'UP').dead[0] === true);
check('guard rail: nobody changes lane', move(road4('..........'), 0, 1, [0, 1], 'UP').dy === 0);
check('SLOW at 0 stays 0', move(road4('..........'), 0, 0, [0], 'SLOW').s === 0);
check('cells past the road are safe', move(road4('.........0'), 8, 5, [0], 'WAIT').dead[0] === true && move(road4('.........'), 8, 5, [0], 'WAIT').dead[0] === false);

// the statement's example: inputs turn by turn
{
  const r = new Referee({ testCase: { V: 1, speed: 1, lanes: [1, 2], road: ['...0......', '...00.....', '...0..0...', '...0......'] } });
  const seen = [];
  for (const cmd of ['SPEED', 'JUMP', 'DOWN', 'WAIT']) { seen.push(r.getTurnInput(0).join('|')); r.applyOutput(0, [cmd]); r.endTurn(); }
  check('statement example inputs', seen.join(' / ') === '1|0 1 1|0 2 1 / 2|2 1 1|2 2 1 / 2|4 1 0|4 2 1 / 2|4 1 0|6 3 1');
}

// every shipped test and 30 generated levels are solvable, and not by repeating one command
const repeat = (t, cmd) => { let x = 0, s = t.speed, l = t.lanes; for (let i = 0; i < 50; i++) { const m = move(t.road, x, s, l, cmd); l = l.filter((_, k) => !m.dead[k]).map(y => y + m.dy); if (l.length < t.V) return false; x = m.x; s = m.s; if (x >= t.road[0].length) return true; } return false; };
const levels = fs.readdirSync(path.join(__dirname, 'tests')).filter(f => f.endsWith('.json')).map(f => ({ id: f, ...JSON.parse(fs.readFileSync(path.join(__dirname, 'tests', f), 'utf8')) }));
for (let s = 1; s <= 30; s++) levels.push({ id: 'random:' + s, ...generate(s) });
for (const t of levels) {
  check(`${t.id} is solvable`, !!solve(t.road, t.V, t.speed, t.lanes));
  check(`${t.id} is not beaten by repeating SPEED, WAIT or JUMP`, !['SPEED', 'WAIT', 'JUMP'].some(c => repeat(t, c)));
}

// the review names the decisive turn of an always-SPEED bot on test 06 (speed 9 into a hole)
{
  const t = levels.find(l => l.id.startsWith('06'));
  const r = new Referee({ testCase: t });
  while (!r.isGameOver()) { r.applyOutput(0, ['SPEED']); r.endTurn(); }
  const rv = r.review();
  check('review: decisive SPEED on turn 1, SLOW would still win', rv[0] && rv[0].turn === 1 && /^decisive-speed/.test(rv[0].code) && /SLOW/.test(rv[0].message));
}

console.log(`${n - fails}/${n} checks passed`);
process.exit(fails ? 1 : 0);
