#!/usr/bin/env node
'use strict';
// Command line runner (like cg-brutaltester), sharing the engine with the web server.
//
// Multiplayer games (bosses, arena):
//   node cli.js <game> <bot1> <bot2> [--games 10] [--seed 1] [--league id] [--timeout-mult 1] [--replay out.json]
//   node cli.js submit <game> <bot-file> [--name "v3 sonar"]        save a version into the arena pool
//   node cli.js pool <game>                                           print the leaderboard
//   node cli.js arena <game> <bot> [--opponents all|bosses|pool|key,key] [--games 4] [--seed 1] [--league id]
// Solo puzzles (test cases):
//   node cli.js <game> <bot> [--test all|list|<n>|<id>|random[:seed]] [--random 5]
// New challenges and CodinGame data:
//   node cli.js fetch <codingame url or puzzle id>                    save the original statement locally
//   node cli.js replay <replay url|id> | battles <player> | top [N]   import CodinGame replays (tools/cg-replay.js)
//
//   bot = path to a source file (.py/.js/.java/.cpp), boss:<id>, or pool:<id> (a saved version)
const fs = require('fs');
const path = require('path');
const { loadGames } = require('./games');
const { runMatch, workRoot, sweepWorkRoot, offsetSeed, isSeed, summarizePatterns } = require('./server/engine/match');
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
  const opts = { games: null, seed: 1, 'timeout-mult': 1, replay: null, league: null, opponents: 'all', name: '', test: 'all', random: 0 };
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) opts[argv[i].slice(2)] = argv[++i];
    else pos.push(argv[i]);
  }
  return { opts, pos };
}

function usage(games) {
  console.log('usage:');
  console.log('  multiplayer:  node cli.js <game> <bot1> <bot2> [--games N] [--seed S] [--league id] [--timeout-mult X] [--replay file.json]');
  console.log('                node cli.js submit <game> <bot-file> [--name "v3"]');
  console.log('                node cli.js pool <game>');
  console.log('                node cli.js arena <game> <bot> [--opponents all|bosses|pool|key,key] [--games N] [--seed S] [--league id]');
  console.log('  solo puzzle:  node cli.js <game> <bot> [--test all|list|<n>|<id>|random[:seed]] [--random N]');
  console.log('  new puzzle:   node cli.js fetch <codingame url or puzzle id>');
  console.log('  checks:       node cli.js selftest [<game>|all]          (rule and review assertions of each challenge)');
  console.log('  codingame:    node cli.js replay <replay url|id> [--turns key]  |  replay battles <player> [--losses --fetch N]  |  replay top [N]');
  console.log('  bot = source file (.py/.js/.java/.cpp), boss:<id> or pool:<id>');
  for (const g of Object.values(games)) console.log(`  ${g.kind === 'solo' ? 'solo ' : 'multi'}  ${g.id.padEnd(24)} ${g.name}`);
  process.exit(1);
}

function printBoard(rows, solo = false) {
  const w = Math.max(10, ...rows.map(r => r.name.length));
  if (solo) {
    if (!rows.length) { console.log('no saved versions yet: node cli.js submit <game> <file> --name v1'); return; }
    console.log('tests      ' + 'name'.padEnd(w) + '  lang        saved                 key');
    for (const r of rows) console.log(`${(r.tests ? `${r.tests.passed}/${r.tests.total}` : '-').padEnd(9)}  ${r.name.padEnd(w)}  ${String(r.lang).padEnd(10)}  ${String(r.created).slice(0, 19).replace('T', ' ')}   ${r.key}`);
    return;
  }
  console.log('rating  games  W-L-D        ' + 'name'.padEnd(w) + '  key');
  for (const r of rows) console.log(`${String(r.rating).padStart(6)}  ${String(r.games).padStart(5)}  ${`${r.wins}-${r.losses}-${r.draws}`.padEnd(11)}  ${r.name.padEnd(w)}  ${r.key}`);
}
// recurring mistakes over a batch: only codes seen in at least 2 games (or in the only game)
function printPatterns(list, n, title, unit = 'games') {
  if (n < 2) return;   // a single game's review is already printed
  const shown = (list || []).filter(p => p.games >= 2).slice(0, 8);
  if (!shown.length) return;
  console.log(`\n${title}`);
  for (const p of shown) console.log(`  ${p.kind === 'mistake' ? '✘' : p.kind === 'warning' ? '!' : '·'} ${p.code}: ${p.games}/${n} ${unit}, e.g. ${p.example}`);
}
function printReview(review, indent = '    ') {
  for (const r of review || []) console.log(`${indent}${r.kind === 'mistake' ? '✘' : r.kind === 'warning' ? '!' : '·'} ${r.message}`);
}

// ---- fetch: a CodinGame link -> the original statement, saved locally (git-ignored) ----
async function fetchChallenge(ref) {
  const m = String(ref).match(/codingame\.com\/(?:ide\/puzzle|training\/[^/]+|multiplayer\/[^/]+|contribute\/view|ide)\/([\w-]+)/) || String(ref).match(/^([\w-]+)$/);
  if (!m) throw new Error(`cannot find a puzzle id in "${ref}" (expected e.g. https://www.codingame.com/ide/puzzle/the-bridge-episode-2)`);
  const id = m[1];
  const res = await fetch('https://www.codingame.com/services/Puzzle/findProgressByPrettyId', {
    method: 'POST', headers: { 'Content-Type': 'application/json;charset=UTF-8' }, body: JSON.stringify([id, null]),
  });
  if (!res.ok) throw new Error(`CodinGame answered ${res.status} for "${id}" (is the id right?)`);
  const p = await res.json();
  if (!p || !p.statement) throw new Error(`no statement found for "${id}"`);
  const text = p.statement.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|tr|h\d)>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  // CodinGame's own puzzle types: ARENA = bot programming (level "multi"), SOLO = interactive puzzle
  // with a referee, OPTIM = solo puzzle scored by points, CODE = classic input/output, CODEGOLF = shortest code.
  const interactive = /game turn|infinite loop|for one game turn/i.test(text);
  const kind = p.type === 'ARENA' || p.level === 'multi' ? 'multi (bot programming: referee + bosses + arena)'
    : p.type === 'OPTIM' ? 'solo, scored (optimization: referee + test levels, score instead of pass/fail)'
    : p.type === 'SOLO' || (p.type !== 'CODE' && p.type !== 'CODEGOLF' && interactive) ? 'solo (interactive: referee + test levels + generator)'
    : 'io (classic: test input/output files only)';
  const dir = path.join(__dirname, 'challenges', 'raw');
  fs.mkdirSync(dir, { recursive: true });
  const url = `https://www.codingame.com/ide/puzzle/${id}`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${p.title}</title><base target="_blank">
<style>body{font:14px/1.5 system-ui,sans-serif;background:#0f1420;color:#d9e0ee;margin:12px}a{color:#f2b134}img{max-width:100%}
table{border-collapse:collapse}td,th{border:1px solid #26304a;padding:3px 6px;vertical-align:top}
.statement-section{margin-bottom:14px}code,var,const,.statement-inout{font-family:Consolas,monospace}</style></head>
<body><p style="color:#8a94ab;font-size:12px">Original statement of <a href="${url}">${p.title}</a> (${p.type}, ${p.level}), fetched ${new Date().toISOString().slice(0, 10)} for local practice. Not committed to git.</p>
${p.statement}</body></html>`;
  fs.writeFileSync(path.join(dir, `${id}.html`), html);
  fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify({ id, url, title: p.title, type: p.type, level: p.level, topics: (p.topics || []).map(t => t.handle || t.value || t).slice(0, 12), fetched: new Date().toISOString() }, null, 2));
  console.log(`${p.title}  [${p.type}, ${p.level}]`);
  console.log(`  arena kind: ${kind}`);
  console.log(`  saved: challenges/raw/${id}.html (original statement, shown in the IDE when games/${id}/ exists)`);
  const exists = fs.existsSync(path.join(__dirname, 'games', id, 'game.json'));
  console.log(exists ? `  games/${id}/ already exists: restart the server to show the original statement.`
    : `  next: ask Claude Code in this folder: "add the challenge ${url}" (procedure: .claude/skills/add-challenge/SKILL.md)`);
}

async function runSolo(gameDef, botArg, opts) {
  if (opts.test === 'list') {
    const w = Math.max(10, ...gameDef.tests.map(t => t.id.length));
    gameDef.tests.forEach((t, i) => console.log(`${String(i + 1).padStart(3)}  ${t.id.padEnd(w)}  ${t.name}`));
    if (gameDef.generator) console.log('  random:<seed>  a generated level (any seed)');
    return 0;
  }
  const player = arena.resolvePlayer(gameDef, parseBot(botArg));
  let ids = opts.test === 'all' ? gameDef.tests.map(t => t.id) : String(opts.test).split(',');
  const extra = Number(opts.random) || 0;
  if (extra && !gameDef.generator) throw new Error(`${gameDef.name} has no level generator`);
  for (let i = 0; i < extra; i++) ids.push(`random:${offsetSeed(opts.seed, i)}`);
  if (!ids.length) throw new Error('no tests to run');
  const idW = Math.max(24, ...ids.map(id => String(id).length), ...gameDef.tests.map(t => t.id.length));
  let passed = 0;
  const replays = [];
  const reviews = [];
  for (const id of ids) {
    const t = gameDef.resolveTest(id);
    const events = [];
    const r = await runMatch({ gameDef, players: [player], test: id, seed: opts.seed, timeoutMultiplier: Number(opts['timeout-mult']), workRoot: workRoot(), emit: ev => { if (opts.replay) events.push(ev); } });
    if (opts.replay) replays.push(events);
    if (r.type === 'error') { console.error(r.message); if (r.compileLog) console.error(r.compileLog); return 2; }
    if (r.passed) passed++;
    reviews.push({ review: r.review || [], side: 0, label: t.id });
    console.log(`${r.passed ? 'PASS' : 'FAIL'}  ${t.id.padEnd(idW)} ${t.name.padEnd(36)} ${r.message}`);
    if (!r.passed || (r.review || []).some(x => x.kind !== 'tip')) printReview(r.review);
  }
  console.log(`\n${label(player)}: passed ${passed}/${ids.length}${passed === ids.length ? '' : '  (exit code 3 when a test fails)'}`);
  printPatterns(summarizePatterns(reviews), ids.length, 'patterns across tests (the same mistake in several tests):', 'tests');
  // a saved version run on the full suite keeps its score (shown by: node cli.js pool <game>)
  if (String(botArg).startsWith('pool:') && opts.test === 'all' && !extra) { try { arena.recordTests(gameDef, botArg.slice(5), passed, ids.length); } catch {} }
  if (opts.replay) fs.writeFileSync(opts.replay, JSON.stringify(replays));
  return passed === ids.length ? 0 : 3;
}

async function main() {
  const { opts, pos } = parseArgs(process.argv.slice(2));
  if (pos[0] === 'fetch') { if (!pos[1]) usage(loadGames()); await fetchChallenge(pos[1]); return; }
  // CodinGame replays (yours or top players'): download, re-simulate, statistics, review
  if (pos[0] === 'replay') { await require('./tools/cg-replay.js').main(process.argv.slice(3)); return; }
  // games/<id>/selftest.js: each challenge's own rule and review assertions (exit code 0 = pass)
  if (pos[0] === 'selftest') {
    const { spawnSync } = require('child_process');
    const all = loadGames();
    const ids = !pos[1] || pos[1] === 'all' ? Object.keys(all) : [pos[1]];
    let failed = 0, ran = 0;
    for (const id of ids) {
      const file = path.join(__dirname, 'games', id, 'selftest.js');
      if (!fs.existsSync(file)) { if (pos[1] && pos[1] !== 'all') console.log(`${id}: no selftest.js`); continue; }
      console.log(`=== ${id}`);
      const r = spawnSync(process.execPath, [file], { cwd: __dirname, stdio: 'inherit' });
      ran++;
      if (r.status !== 0) { failed++; console.log(`=== ${id}: FAILED (exit ${r.status})`); } else console.log(`=== ${id}: ok`);
    }
    console.log(`\nselftests: ${ran - failed}/${ran} passed`);
    process.exitCode = failed ? 3 : 0;
    return;
  }
  const games = loadGames();
  if (!pos.length) usage(games);
  if (!isSeed(opts.seed)) { console.error(`--seed must be an integer (got "${opts.seed}")`); process.exit(1); }
  sweepWorkRoot(workRoot());
  const command = games[pos[0]] ? 'match' : pos[0];
  const gameId = command === 'match' ? pos[0] : pos[1];
  const gameDef = games[gameId];
  if (!gameDef) { console.error(`unknown game "${gameId}"`); usage(games); }

  if (gameDef.kind === 'solo') {
    if (command === 'arena') { console.error(`${gameDef.name} is a solo puzzle: it has test cases, not an arena. Run: node cli.js ${gameDef.id} <bot> --test all (save versions with submit, list them with pool)`); process.exit(1); }
    if (command === 'match') {
      if (!pos[1] && opts.test !== 'list') usage(games);
      process.exitCode = await runSolo(gameDef, pos[1], opts);
      return;
    }
  }

  if (command === 'submit') {
    if (!pos[2]) usage(games);
    const bot = parseBot(pos[2]);
    if (typeof bot === 'string') throw new Error('submit needs a source file');
    const entry = arena.submit(gameDef, { lang: bot.lang, source: bot.source, name: opts.name || path.basename(pos[2], path.extname(pos[2])) });
    console.log(`saved ${entry.name} as pool:${entry.id} (${entry.lang})`);
    return;
  }
  if (command === 'pool') { printBoard(arena.leaderboard(gameDef), gameDef.kind === 'solo'); return; }
  if (command === 'arena') {
    if (!pos[2]) usage(games);
    const candidate = parseBot(pos[2]);
    const summary = await arena.runArena({
      gameDef, candidate, opponents: opts.opponents, games: Number(opts.games) || 4, seed: opts.seed, league: opts.league,
      timeoutMultiplier: Number(opts['timeout-mult']),
      emit: ev => {
        if (ev.type === 'match') console.log(`  vs ${ev.name}  game ${ev.game + 1}  as P${ev.side}  ${ev.outcome}${ev.scores ? '  scores ' + JSON.stringify(ev.scores) : ''}${ev.dq && ev.dq.length ? '  ' + ev.dq.join(' | ') : ''}${ev.message ? '  ' + ev.message : ''}`);
        else if (ev.type === 'opponent') console.log(`${ev.name}: ${ev.wins}-${ev.losses}-${ev.draws}  (${(100 * ev.winRate).toFixed(0)}% wins)` + (ev.errors.length ? `  errors: ${ev.errors.join('; ')}` : ''));
        else if (ev.type === 'error') { console.error(ev.message); if (ev.compileLog) console.error(ev.compileLog); }
      },
    });
    if (summary.type === 'error') process.exit(2);
    console.log(`\n${summary.candidate}: ${summary.total.wins}-${summary.total.losses}-${summary.total.draws} over ${summary.total.played} games` + (summary.rated ? '' : '  (unsaved code: not rated; use "submit" to rate it)'));
    printPatterns(summary.lossPatterns, summary.perOpponent.reduce((a, o) => a + o.losses, 0), 'patterns in your losses:');
    printPatterns(summary.patterns, summary.total.played, 'patterns in all your games:');
    console.log('\nleaderboard:');
    printBoard(summary.leaderboard);
    return;
  }
  if (command !== 'match') usage(games);

  if (pos.length < 3) usage(games);
  const refs = [parseBot(pos[1]), parseBot(pos[2])];
  const players = refs.map(r => arena.resolvePlayer(gameDef, r));
  const n = Number(opts.games) || 1;
  const wins = [0, 0]; let draws = 0;
  const replays = [];
  let lastReview = [];
  const reviews = [];
  for (let g = 0; g < n; g++) {
    const events = [];
    const seed = offsetSeed(opts.seed, g);
    const result = await runMatch({
      gameDef, players, seed, league: opts.league, timeoutMultiplier: Number(opts['timeout-mult']),
      workRoot: workRoot(), emit: ev => { if (opts.replay) events.push(ev); },
    });
    if (opts.replay) replays.push(events);
    if (result.type === 'error') { console.error(result.message, result.compileLog || ''); process.exit(2); }
    if (result.winner === null || result.winner === undefined) draws++; else wins[result.winner]++;
    const reasons = (result.dq || []).map((d, i) => d ? ` [P${i}: ${d}]` : '').join('');
    console.log(`game ${g + 1}/${n} seed=${seed} scores=${JSON.stringify(result.scores)} winner=${result.winner === null ? 'draw' : 'P' + result.winner + ' (' + result.players[result.winner] + ')'}${reasons}`);
    lastReview = result.review || [];
    reviews.push({ review: lastReview, side: 0, label: `game ${g + 1}` });
    if (opts.review === 'all') printReview(lastReview);
  }
  console.log(`\n${label(refs[0])} vs ${label(refs[1])}: ${wins[0]} - ${wins[1]} (draws ${draws})  => P0 win rate ${(100 * wins[0] / n).toFixed(1)}%`);
  if (lastReview.length && opts.review !== 'all' && opts.review !== 'none') {
    console.log(`\nreview of the last game (--review all for every game, --review none to hide):`);
    printReview(lastReview.map(r => ({ ...r, message: (r.player === null || r.player === undefined ? '' : `P${r.player}: `) + r.message })), '  ');
  }
  if (n > 1) printPatterns(summarizePatterns(reviews), n, `patterns for P0 (${label(refs[0])}) over ${n} games:`);
  if (opts.replay) fs.writeFileSync(opts.replay, JSON.stringify(replays));
}

main().catch(e => { console.error(process.env.CG_ARENA_DEBUG && e && e.stack ? e.stack : (e && e.message) || e); process.exit(1); });
