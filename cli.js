#!/usr/bin/env node
'use strict';
// Batch runner (like cg-brutaltester): play N games between two bots and print the win rate.
//   node cli.js <game> <bot1> <bot2> [--games 10] [--seed 1] [--timeout-mult 1] [--replay out.json]
//   bot = path to a source file (.py/.js/.java/.cpp) or boss:<id>
const fs = require('fs');
const path = require('path');
const { loadGames } = require('./games');
const { runMatch, workRoot } = require('./server/engine/match');

const EXT = { '.py': 'python', '.js': 'javascript', '.java': 'java', '.cpp': 'cpp' };

function parseBot(arg) {
  if (arg.startsWith('boss:')) return { type: 'boss', id: arg.slice(5) };
  const lang = EXT[path.extname(arg)];
  if (!lang) throw new Error(`cannot infer language of ${arg}`);
  return { type: 'user', lang, source: fs.readFileSync(arg, 'utf8'), name: path.basename(arg) };
}

async function main() {
  const argv = process.argv.slice(2);
  const opts = { games: 1, seed: 1, 'timeout-mult': 1, replay: null, league: null };
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) opts[argv[i].slice(2)] = argv[++i];
    else pos.push(argv[i]);
  }
  if (pos.length < 3) {
    console.log('usage: node cli.js <game> <bot1> <bot2> [--games N] [--seed S] [--league id] [--timeout-mult X] [--replay file.json]');
    console.log('games:', Object.keys(loadGames()).join(', '));
    process.exit(1);
  }
  const games = loadGames();
  const gameDef = games[pos[0]];
  if (!gameDef) throw new Error(`unknown game ${pos[0]}; available: ${Object.keys(games).join(', ')}`);
  const players = [parseBot(pos[1]), parseBot(pos[2])];
  const n = Number(opts.games), seed0 = Number(opts.seed);
  const wins = [0, 0]; let draws = 0;
  const replays = [];
  for (let g = 0; g < n; g++) {
    const events = [];
    const result = await runMatch({
      gameDef, players, seed: seed0 + g, league: opts.league, timeoutMultiplier: Number(opts['timeout-mult']),
      workRoot: workRoot(), emit: ev => { if (opts.replay) events.push(ev); },
    });
    if (opts.replay) replays.push(events);
    if (result.type === 'error') { console.error(result.message, result.compileLog || ''); process.exit(2); }
    if (result.winner === null || result.winner === undefined) draws++; else wins[result.winner]++;
    const reasons = (result.dq || []).map((d, i) => d ? ` [P${i}: ${d}]` : '').join('');
    console.log(`game ${g + 1}/${n} seed=${seed0 + g} scores=${JSON.stringify(result.scores)} winner=${result.winner === null ? 'draw' : 'P' + result.winner + ' (' + result.players[result.winner] + ')'}${reasons}`);
  }
  console.log(`\n${result0(players[0])} vs ${result0(players[1])}: ${wins[0]} - ${wins[1]} (draws ${draws})  => P0 win rate ${(100 * wins[0] / n).toFixed(1)}%`);
  if (opts.replay) fs.writeFileSync(opts.replay, JSON.stringify(replays));
}
function result0(p) { return p.type === 'boss' ? 'boss:' + p.id : p.name; }

main().catch(e => { console.error(e); process.exit(1); });
