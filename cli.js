#!/usr/bin/env node
'use strict';
// Command line runner (like cg-brutaltester), sharing the engine with the web server.
//   node cli.js <game> <bot1> <bot2> [--games 10] [--seed 1] [--league id] [--timeout-mult 1] [--replay out.json]
//   node cli.js submit <game> <bot-file> [--name "v3 sonar"]        save a version into the arena pool
//   node cli.js pool <game>                                           print the leaderboard
//   node cli.js arena <game> <bot> [--opponents all|bosses|pool|key,key] [--games 4] [--seed 1] [--league id]
//   bot = path to a source file (.py/.js/.java/.cpp), boss:<id>, or pool:<id> (a saved version)
const fs = require('fs');
const path = require('path');
const { loadGames } = require('./games');
const { runMatch, workRoot } = require('./server/engine/match');
const arena = require('./server/arena');

const EXT = { '.py': 'python', '.js': 'javascript', '.java': 'java', '.cpp': 'cpp' };

function parseBot(arg) {
  if (arg.startsWith('boss:') || arg.startsWith('pool:')) return arg;
  const lang = EXT[path.extname(arg)];
  if (!lang) throw new Error(`cannot infer language of ${arg} (expected .py, .js, .java or .cpp, boss:<id> or pool:<id>)`);
  return { type: 'user', lang, source: fs.readFileSync(arg, 'utf8'), name: path.basename(arg) };
}
const label = p => typeof p === 'string' ? p : p.name;

function parseArgs(argv) {
  const opts = { games: null, seed: 1, 'timeout-mult': 1, replay: null, league: null, opponents: 'all', name: '' };
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) opts[argv[i].slice(2)] = argv[++i];
    else pos.push(argv[i]);
  }
  return { opts, pos };
}

function usage(games) {
  console.log('usage:');
  console.log('  node cli.js <game> <bot1> <bot2> [--games N] [--seed S] [--league id] [--timeout-mult X] [--replay file.json]');
  console.log('  node cli.js submit <game> <bot-file> [--name "v3"]');
  console.log('  node cli.js pool <game>');
  console.log('  node cli.js arena <game> <bot> [--opponents all|bosses|pool|key,key] [--games N] [--seed S] [--league id]');
  console.log('  bot = source file (.py/.js/.java/.cpp), boss:<id> or pool:<id>');
  console.log('games:', Object.keys(games).join(', '));
  process.exit(1);
}

function printBoard(rows) {
  const w = Math.max(10, ...rows.map(r => r.name.length));
  console.log('rating  games  W-L-D        ' + 'name'.padEnd(w) + '  key');
  for (const r of rows) console.log(`${String(r.rating).padStart(6)}  ${String(r.games).padStart(5)}  ${`${r.wins}-${r.losses}-${r.draws}`.padEnd(11)}  ${r.name.padEnd(w)}  ${r.key}`);
}

async function main() {
  const { opts, pos } = parseArgs(process.argv.slice(2));
  const games = loadGames();
  if (!pos.length) usage(games);
  const command = games[pos[0]] ? 'match' : pos[0];
  const gameId = command === 'match' ? pos[0] : pos[1];
  const gameDef = games[gameId];
  if (!gameDef) { console.error(`unknown game "${gameId}"`); usage(games); }

  if (command === 'submit') {
    if (!pos[2]) usage(games);
    const bot = parseBot(pos[2]);
    if (typeof bot === 'string') throw new Error('submit needs a source file');
    const entry = arena.submit(gameDef, { lang: bot.lang, source: bot.source, name: opts.name || path.basename(pos[2], path.extname(pos[2])) });
    console.log(`saved ${entry.name} as pool:${entry.id} (${entry.lang})`);
    return;
  }
  if (command === 'pool') { printBoard(arena.leaderboard(gameDef)); return; }
  if (command === 'arena') {
    if (!pos[2]) usage(games);
    const candidate = parseBot(pos[2]);
    const summary = await arena.runArena({
      gameDef, candidate, opponents: opts.opponents, games: Number(opts.games) || 4, seed: Number(opts.seed), league: opts.league,
      timeoutMultiplier: Number(opts['timeout-mult']),
      emit: ev => {
        if (ev.type === 'match') console.log(`  vs ${ev.name}  game ${ev.game + 1}  as P${ev.side}  ${ev.outcome}${ev.scores ? '  scores ' + JSON.stringify(ev.scores) : ''}${ev.dq && ev.dq.length ? '  ' + ev.dq.join(' | ') : ''}${ev.message ? '  ' + ev.message : ''}`);
        else if (ev.type === 'opponent') console.log(`${ev.name}: ${ev.wins}-${ev.losses}-${ev.draws}  (${(100 * ev.winRate).toFixed(0)}% wins)` + (ev.errors.length ? `  errors: ${ev.errors.join('; ')}` : ''));
        else if (ev.type === 'error') { console.error(ev.message); if (ev.compileLog) console.error(ev.compileLog); }
      },
    });
    if (summary.type === 'error') process.exit(2);
    console.log(`\n${summary.candidate}: ${summary.total.wins}-${summary.total.losses}-${summary.total.draws} over ${summary.total.played} games` + (summary.rated ? '' : '  (unsaved code: not rated; use "submit" to rate it)'));
    console.log('\nleaderboard:');
    printBoard(summary.leaderboard);
    return;
  }
  if (command !== 'match') usage(games);

  if (pos.length < 3) usage(games);
  const refs = [parseBot(pos[1]), parseBot(pos[2])];
  const players = refs.map(r => arena.resolvePlayer(gameDef, r));
  const n = Number(opts.games) || 1, seed0 = Number(opts.seed);
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
  console.log(`\n${label(refs[0])} vs ${label(refs[1])}: ${wins[0]} - ${wins[1]} (draws ${draws})  => P0 win rate ${(100 * wins[0] / n).toFixed(1)}%`);
  if (opts.replay) fs.writeFileSync(opts.replay, JSON.stringify(replays));
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
