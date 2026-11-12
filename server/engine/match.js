'use strict';
// The match engine: drives one referee and N bot processes through a full game,
// emitting a JSON event per turn (start / frame / end). Used by the web server, the arena and the CLI.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { GameError } = require('../../games/base');
const { BotProcess, BotError, prepareBot } = require('../runner/bot');
const { LANGUAGES, PYTHON, pythonArgs, PRELUDE } = require('../runner/languages');

const BOOT_GRACE_MS = Math.max(0, Number(process.env.CG_ARENA_BOOT_GRACE_MS ?? 5000));   // CodinGame does not charge interpreter/JVM start-up; a busy PC can need seconds

// Remove leftover work dirs (crashes, killed processes) older than an hour.
function sweepWorkRoot(root, maxAgeMs = 3600e3) {
  try {
    for (const d of fs.readdirSync(root)) {
      const p = path.join(root, d);
      try { if (Date.now() - fs.statSync(p).mtimeMs > maxAgeMs) fs.rmSync(p, { recursive: true, force: true }); } catch {}
    }
  } catch {}
}

// Seeds stay strings so 64-bit CodinGame seeds survive; game g of a batch uses seed + g.
function offsetSeed(seed, g) {
  const s = String(seed === undefined || seed === null || seed === '' ? 1 : seed).trim();
  return /^[+-]?\d+$/.test(s) ? (BigInt(s) + BigInt(g)).toString() : (g ? `${s}-${g}` : s);
}
const isSeed = s => /^[+-]?\d{1,20}$/.test(String(s).trim());

function bossSpec(gameDef, boss) {
  const file = path.join(gameDef.dir, boss.file);
  const ext = path.extname(file);
  if (ext === '.js') return { cmd: process.execPath, args: ['-r', PRELUDE, file, ...(boss.args || [])] };
  if (ext === '.py') {
    if (!PYTHON()) throw new Error(`Boss ${boss.file} needs Python, which was not found on this machine`);
    return { cmd: PYTHON(), args: [...pythonArgs(file), ...(boss.args || [])] };
  }
  throw new Error(`Unsupported boss file ${boss.file} (bosses must be .js or .py; other languages go through the arena pool)`);
}

async function buildPlayers(gameDef, players, matchDir) {
  const bots = [];
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (p.type === 'boss') {
      const boss = gameDef.bosses.find(b => b.id === p.id);
      if (!boss) throw new Error(`Unknown boss "${p.id}" for ${gameDef.id}`);
      bots.push({ name: boss.name, spec: bossSpec(gameDef, boss), cwd: gameDef.dir });
    } else {
      const lang = LANGUAGES[p.lang];
      if (!lang) throw new Error(`Unknown language ${p.lang}`);
      let dir;
      if (lang.compile) {
        // compiled languages: build once per source and reuse it for every game of a suite or arena run
        const r = await compiledDir(p.lang, p.source, path.dirname(matchDir));
        if (!r.ok) return { error: { player: i, compileLog: r.log } };
        dir = r.dir;
      } else {
        dir = path.join(matchDir, `p${i}`);
        const prep = await prepareBot(p.lang, p.source, dir);
        if (!prep.ok) return { error: { player: i, compileLog: prep.log } };
      }
      bots.push({ name: p.name || `${lang.name} bot`, spec: lang.run(dir), cwd: dir });
    }
  }
  return { bots };
}

// Compile cache: <workRoot>/cache/<sha256 of language + source>/ holds the build output. Built in a
// temporary folder and renamed, so two matches compiling the same source at once cannot clash.
const building = new Map();
async function compiledDir(langId, source, root) {
  const hash = crypto.createHash('sha256').update(langId + '\0' + source).digest('hex').slice(0, 16);
  const dir = path.join(root, 'cache', hash);
  if (fs.existsSync(path.join(dir, '.ok'))) { try { fs.utimesSync(dir, new Date(), new Date()); } catch {} return { ok: true, dir }; }
  if (building.has(dir)) return building.get(dir);
  const job = (async () => {
    const tmp = path.join(root, 'cache', `${hash}-${crypto.randomBytes(3).toString('hex')}`);
    const prep = await prepareBot(langId, source, tmp);
    if (!prep.ok) { removeDir(tmp); return { ok: false, log: prep.log.split(tmp).join('.') }; }
    fs.writeFileSync(path.join(tmp, '.ok'), '');
    try { fs.renameSync(tmp, dir); } catch { removeDir(tmp); }   // another process won the race: use its build
    return { ok: true, dir };
  })();
  building.set(dir, job);
  try { return await job; } finally { building.delete(dir); }
}

function removeDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 }); } catch {}
}

/**
 * runMatch({ gameDef, players, seed, league, test, timeoutMultiplier, workRoot, emit, signal })
 *   test: for solo puzzles, a test id from gameDef.tests or "random:<seed>" (default: the first test)
 *   gameDef: entry from games/index.js
 *   players: [{type:'user', lang, source, name} | {type:'boss', id}]
 *   emit(event): called with {type:'start'|'frame'|'end'|'error', ...}
 *   signal: optional AbortSignal; aborting stops the match at once and kills the bots
 * Resolves with the final result ({type:'error'} if a bot did not compile).
 */
async function runMatch({ gameDef, players, seed = 1, league = null, test = null, timeoutMultiplier = 1, workRoot, emit, signal = null }) {
  const meta = gameDef.Referee.meta;
  if (players.length !== meta.playerCount) throw new Error(`${gameDef.name} needs ${meta.playerCount} players`);
  if (gameDef.leagues && gameDef.leagues.length) {
    if (!league) league = (gameDef.leagues.find(l => l.default) || gameDef.leagues[0]).id;
    if (!gameDef.leagues.some(l => l.id === league)) throw new Error(`Unknown league "${league}" for ${gameDef.name} (${gameDef.leagues.map(l => l.id).join(', ')})`);
  }
  // short id: Windows CreateProcess rejects working directories longer than ~260 chars
  const matchDir = path.join(workRoot, crypto.randomBytes(4).toString('hex'));
  let built;
  try { built = await buildPlayers(gameDef, players, matchDir); }
  catch (e) { removeDir(matchDir); throw e; }
  if (built.error) {
    removeDir(matchDir);
    const ev = { type: 'error', player: built.error.player, message: `Player ${built.error.player} failed to compile`, compileLog: built.error.compileLog };
    emit(ev);
    return ev;
  }
  const testCase = gameDef.kind === 'solo' ? gameDef.resolveTest(test) : null;   // throws for an unknown test id
  const referee = new gameDef.Referee({ seed, playerCount: meta.playerCount, league, testCase: testCase && testCase.data });
  const procs = built.bots.map(b => new BotProcess(b).start());
  const names = built.bots.map(b => b.name);
  emit({ type: 'start', game: { id: gameDef.id, name: gameDef.name, viewer: meta.viewer, kind: gameDef.kind }, players: names, seed, league, test: testCase ? { id: testCase.id, name: testCase.name } : null, static: referee.getStaticInfo() });
  const slow = [];          // turns answered with less than 30 % of the time budget left (timeout risk)
  let extraLines = 0;

  // resolves (never rejects) when the client goes away, so a pending read can be raced against it
  const ABORTED = Symbol('aborted');
  const abortP = new Promise(resolve => {
    if (!signal) return;
    if (signal.aborted) resolve(ABORTED);
    else signal.addEventListener('abort', () => resolve(ABORTED), { once: true });
  });

  const firstTurn = procs.map(() => true);
  let aborted = false;
  try {
    for (let p = 0; p < procs.length; p++) {
      const init = referee.getInitInput(p);
      if (init.length) procs[p].write(init.join('\n') + '\n');
    }
    while (!referee.isGameOver() && referee.turn < meta.maxTurns && !aborted) {
      if (signal && signal.aborted) { aborted = true; break; }
      const actors = referee.getActors();
      if (!actors.length) break;
      const actorEvents = [];
      for (const p of actors) {
        if (referee.dq[p]) continue;
        const input = referee.getTurnInput(p);
        // Lines the bot printed beyond last turn's answer would otherwise be taken as this turn's answer
        // (a one-turn lag that looks like a wrong move). Drop them and flag it in the frame. Only when this
        // turn starts with input: a turn without input (placement) is answered from the init input, possibly
        // before we get here, and that answer must not be thrown away.
        const extra = input.length ? procs[p].drain() : [];
        if (extra.length) referee.log(`Player ${p} printed ${extra.length} extra line(s) last turn (ignored): ${extra.slice(0, 3).join(' | ').slice(0, 120)}`);
        if (input.length) procs[p].write(input.join('\n') + '\n');
        if (referee.closeInputAfterTurn) procs[p].endInput();   // classic puzzles: the input is complete, signal end of file
        // The first turn also pays for the interpreter/JVM boot (python ~0.5 s, java ~0.4 s cold on a laptop),
        // which CodinGame's servers do not charge to the bot, so the first turn gets a boot grace on top.
        const first = firstTurn[p];
        const grace = first ? BOOT_GRACE_MS * Math.max(1, timeoutMultiplier) : 0;
        const budget = (first ? meta.firstTurnTimeout : meta.turnTimeout) * timeoutMultiplier + grace;
        firstTurn[p] = false;
        const t0 = Date.now();
        let output = [], error = null;
        const read = procs[p].readLines(referee.outputLines(p), budget);
        read.catch(() => {});                       // the race below handles rejections; avoid an unhandled one
        try {
          const r = await Promise.race([read, abortP]);
          if (r === ABORTED) { aborted = true; break; }
          output = r;
        } catch (e) {
          error = e instanceof BotError ? e.message : String(e);
          if (first && /^timeout/.test(error)) error += ` (first turn: ${meta.firstTurnTimeout * timeoutMultiplier} ms limit + ${grace} ms allowance for starting the program)`;
          referee.disqualify(p, error);
        }
        const ms = Date.now() - t0;
        if (!error) {
          try { referee.applyOutput(p, output); }
          catch (e) {
            if (e instanceof GameError) { error = e.message; referee.disqualify(p, error); }
            else throw e;
          }
        }
        // give stderr a tick to arrive so the console lines up with the turn
        await new Promise(r => setImmediate(r));
        actorEvents.push({ player: p, input, output, stderr: procs[p].takeStderr(), ms, error, extraOutput: extra.length || undefined });
        if (!first && !error && ms > 0.7 * meta.turnTimeout * timeoutMultiplier) slow.push({ turn: referee.turn + 1, player: p, ms });
        extraLines += extra.length;
      }
      if (aborted) break;
      referee.endTurn();
      emit({ type: 'frame', turn: referee.turn, actors: actorEvents, frame: referee.getFrame(), summary: referee.takeSummary() });
    }
    const result = referee.getResult();
    result.players = names;
    result.dq = referee.dq;
    if (aborted) { result.aborted = true; result.winner = null; }
    result.review = aborted ? [] : buildReview(referee, meta, timeoutMultiplier, slow, extraLines, names);
    emit({ type: 'end', result, summary: referee.takeSummary(), review: result.review });
    return result;
  } finally {
    await Promise.all(procs.map(p => p.kill()));   // wait for the processes to go away, then drop their work dir
    removeDir(matchDir);
  }
}

// Post-game review: the referee's own analysis (optional referee.review(), game-specific mistakes)
// plus engine-level risks every game shares. Items: { turn, player, kind: 'mistake'|'warning'|'tip', message };
// turn is the replay frame number (1-based) so the viewer can jump to it.
function buildReview(referee, meta, mult, slow, extraLines, names) {
  let items = [];
  if (typeof referee.review === 'function') {
    try { items = (referee.review() || []).filter(Boolean); }
    catch (e) { items = [{ turn: null, player: null, kind: 'warning', code: 'review-failed', message: `review failed: ${e.message}` }]; }
  }
  const byPlayer = {};
  for (const s of slow) (byPlayer[s.player] = byPlayer[s.player] || []).push(s);
  for (const [p, list] of Object.entries(byPlayer)) {
    const worst = list.reduce((a, b) => (b.ms > a.ms ? b : a));
    items.push({ turn: worst.turn, player: Number(p), kind: 'warning', code: 'slow-turn', message: `${names[p]}: ${list.length} turn(s) used over 70 % of the ${meta.turnTimeout * mult} ms limit (worst ${worst.ms} ms at turn ${worst.turn}). CodinGame's servers may be slower than this PC: leave a margin.` });
  }
  if (extraLines) items.push({ turn: null, player: null, kind: 'warning', code: 'extra-output', message: `${extraLines} extra stdout line(s) were ignored. On CodinGame they would be read as your next answers: print exactly one answer per turn and send debug to stderr.` });
  return items;
}

// Patterns: the same review code over many games (arena runs, test suites, CLI batches).
//   games: [{ review: [...], side: <player index of the bot being judged>, label }]
// Returns [{ code, kind, games, total, share, example, labels }] sorted by how many games show it.
const RANK = { mistake: 0, warning: 1, tip: 2 };
function summarizePatterns(games) {
  const by = new Map();
  const n = games.length;
  for (const g of games) {
    const seen = new Set();
    for (const it of g.review || []) {
      if (it.player !== null && it.player !== undefined && g.side !== undefined && it.player !== g.side) continue;
      const code = it.code || 'other';
      if (/-summary$/.test(code)) continue;   // per-game summaries are not mistakes
      const p = by.get(code) || { code, kind: it.kind, games: 0, total: 0, example: it.message, labels: [] };
      p.total++;
      if (!seen.has(code)) { seen.add(code); p.games++; if (p.labels.length < 6 && g.label) p.labels.push(g.label); }
      if (it.kind === 'mistake') p.kind = 'mistake';
      by.set(code, p);
    }
  }
  return [...by.values()].map(p => ({ ...p, share: n ? p.games / n : 0 }))
    .sort((a, b) => (RANK[a.kind] ?? 3) - (RANK[b.kind] ?? 3) || b.games - a.games);
}

// Where bot sources are written, compiled and run. Windows CreateProcess rejects working
// directories longer than ~260 chars, so a deeply nested checkout falls back to the temp dir.
function workRoot() {
  if (process.env.CG_ARENA_WORK) return process.env.CG_ARENA_WORK;
  const local = path.join(__dirname, '..', '..', '.runs');
  return local.length < 150 ? local : path.join(require('os').tmpdir(), 'cg-arena');
}

module.exports = { runMatch, workRoot, sweepWorkRoot, offsetSeed, isSeed, summarizePatterns, BOOT_GRACE_MS };
