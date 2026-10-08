'use strict';
// The match engine: drives one referee and N bot processes through a full game,
// emitting a JSON event per turn (start / frame / end). Used by the web server and the CLI.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { GameError } = require('../../games/base');
const { BotProcess, BotError, prepareBot } = require('../runner/bot');
const { LANGUAGES } = require('../runner/languages');

const PRELUDE = path.join(__dirname, '..', 'runner', 'js-prelude.js');

function bossSpec(gameDef, boss) {
  const file = path.join(gameDef.dir, boss.file);
  const ext = path.extname(file);
  if (ext === '.js') return { cmd: process.execPath, args: ['-r', PRELUDE, file, ...(boss.args || [])] };
  if (ext === '.py') return { cmd: 'python', args: ['-u', '-I', file, ...(boss.args || [])], env: { PYTHONUNBUFFERED: '1' } };
  throw new Error(`Unsupported boss file ${boss.file}`);
}

async function buildPlayers(gameDef, players, workRoot) {
  // short id: Windows CreateProcess rejects working directories longer than ~260 chars
  const matchDir = path.join(workRoot, crypto.randomBytes(4).toString('hex'));
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
      if (!prep.ok) return { error: { player: i, compileLog: prep.log }, matchDir };
      bots.push({ name: p.name || `${lang.name} bot`, spec: lang.run(dir), cwd: dir });
    }
  }
  return { bots, matchDir };
}

/**
 * runMatch({ gameDef, players, seed, timeoutMultiplier, workRoot, emit })
 *   gameDef: entry from games/index.js
 *   players: [{type:'user', lang, source, name} | {type:'boss', id}]
 *   emit(event): called with {type:'start'|'frame'|'end'|'error', ...}
 * Resolves with the final result.
 */
async function runMatch({ gameDef, players, seed = 1, timeoutMultiplier = 1, workRoot, emit }) {
  const meta = gameDef.Referee.meta;
  if (players.length !== meta.playerCount) throw new Error(`${gameDef.name} needs ${meta.playerCount} players`);
  const built = await buildPlayers(gameDef, players, workRoot);
  if (built.error) {
    const ev = { type: 'error', message: `Player ${built.error.player} failed to compile`, compileLog: built.error.compileLog };
    emit(ev);
    return ev;
  }
  const referee = new gameDef.Referee({ seed, playerCount: meta.playerCount });
  const procs = built.bots.map(b => new BotProcess(b).start());
  const names = built.bots.map(b => b.name);
  emit({ type: 'start', game: { id: gameDef.id, name: gameDef.name, viewer: meta.viewer }, players: names, seed, static: referee.getStaticInfo() });

  const firstTurn = procs.map(() => true);
  try {
    for (let p = 0; p < procs.length; p++) {
      const init = referee.getInitInput(p);
      if (init.length) procs[p].write(init.join('\n') + '\n');
    }
    while (!referee.isGameOver() && referee.turn < meta.maxTurns) {
      const actors = referee.getActors();
      if (!actors.length) break;
      const actorEvents = [];
      for (const p of actors) {
        if (referee.dq[p]) continue;
        const input = referee.getTurnInput(p);
        if (input.length) procs[p].write(input.join('\n') + '\n');
        const budget = (firstTurn[p] ? meta.firstTurnTimeout : meta.turnTimeout) * timeoutMultiplier;
        firstTurn[p] = false;
        const t0 = Date.now();
        let output = [], error = null;
        try {
          output = await procs[p].readLines(referee.outputLines(p), budget);
        } catch (e) {
          error = e instanceof BotError ? e.message : String(e);
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
        actorEvents.push({ player: p, input, output, stderr: procs[p].takeStderr(), ms, error });
      }
      referee.endTurn();
      emit({ type: 'frame', turn: referee.turn, actors: actorEvents, frame: referee.getFrame(), summary: referee.takeSummary() });
    }
    const result = referee.getResult();
    result.players = names;
    result.dq = referee.dq;
    emit({ type: 'end', result, summary: referee.takeSummary() });
    return result;
  } finally {
    procs.forEach(p => p.kill());
    setTimeout(() => { try { fs.rmSync(built.matchDir, { recursive: true, force: true }); } catch {} }, 2000);
  }
}

// Where bot sources are written, compiled and run. Windows CreateProcess rejects working
// directories longer than ~260 chars, so a deeply nested checkout falls back to the temp dir.
function workRoot() {
  if (process.env.CG_ARENA_WORK) return process.env.CG_ARENA_WORK;
  const local = path.join(__dirname, '..', '..', '.runs');
  return local.length < 150 ? local : path.join(require('os').tmpdir(), 'cg-arena');
}

module.exports = { runMatch, workRoot };
