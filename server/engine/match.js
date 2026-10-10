'use strict';
// The match engine: drives one referee and N bot processes through a full game,
// emitting a JSON event per turn (start / frame / end). Used by the web server, the arena and the CLI.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { GameError } = require('../../games/base');
const { BotProcess, BotError, prepareBot } = require('../runner/bot');
const { LANGUAGES, PYTHON, pythonArgs, PRELUDE } = require('../runner/languages');

const BOOT_GRACE_MS = Math.max(0, Number(process.env.CG_ARENA_BOOT_GRACE_MS ?? 1500));

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
      const dir = path.join(matchDir, `p${i}`);
      const prep = await prepareBot(p.lang, p.source, dir);
      if (!prep.ok) return { error: { player: i, compileLog: prep.log } };
      bots.push({ name: p.name || `${lang.name} bot`, spec: lang.run(dir), cwd: dir });
    }
  }
  return { bots };
}

function removeDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 }); } catch {}
}

/**
 * runMatch({ gameDef, players, seed, league, timeoutMultiplier, workRoot, emit, signal })
 *   gameDef: entry from games/index.js
 *   players: [{type:'user', lang, source, name} | {type:'boss', id}]
 *   emit(event): called with {type:'start'|'frame'|'end'|'error', ...}
 *   signal: optional AbortSignal; aborting stops the match at once and kills the bots
 * Resolves with the final result ({type:'error'} if a bot did not compile).
 */
async function runMatch({ gameDef, players, seed = 1, league = null, timeoutMultiplier = 1, workRoot, emit, signal = null }) {
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
  const referee = new gameDef.Referee({ seed, playerCount: meta.playerCount, league });
  const procs = built.bots.map(b => new BotProcess(b).start());
  const names = built.bots.map(b => b.name);
  emit({ type: 'start', game: { id: gameDef.id, name: gameDef.name, viewer: meta.viewer }, players: names, seed, league, static: referee.getStaticInfo() });

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
        // The first turn also pays for the interpreter/JVM boot (python ~0.5 s, java ~0.4 s cold on a laptop),
        // which CodinGame's servers do not charge to the bot, so the first turn gets a boot grace on top.
        const first = firstTurn[p];
        const budget = (first ? meta.firstTurnTimeout : meta.turnTimeout) * timeoutMultiplier + (first ? BOOT_GRACE_MS : 0);
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
          if (first && /^timeout/.test(error)) error += ` (first turn: ${meta.firstTurnTimeout} ms limit + ${BOOT_GRACE_MS} ms boot grace)`;
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
      }
      if (aborted) break;
      referee.endTurn();
      emit({ type: 'frame', turn: referee.turn, actors: actorEvents, frame: referee.getFrame(), summary: referee.takeSummary() });
    }
    const result = referee.getResult();
    result.players = names;
    result.dq = referee.dq;
    if (aborted) { result.aborted = true; result.winner = null; }
    emit({ type: 'end', result, summary: referee.takeSummary() });
    return result;
  } finally {
    await Promise.all(procs.map(p => p.kill()));   // wait for the processes to go away, then drop their work dir
    removeDir(matchDir);
  }
}

// Where bot sources are written, compiled and run. Windows CreateProcess rejects working
// directories longer than ~260 chars, so a deeply nested checkout falls back to the temp dir.
function workRoot() {
  if (process.env.CG_ARENA_WORK) return process.env.CG_ARENA_WORK;
  const local = path.join(__dirname, '..', '..', '.runs');
  return local.length < 150 ? local : path.join(require('os').tmpdir(), 'cg-arena');
}

module.exports = { runMatch, workRoot, sweepWorkRoot, offsetSeed, isSeed, BOOT_GRACE_MS };
