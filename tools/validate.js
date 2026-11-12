'use strict';
// Generic end-to-end validation of any challenge, whatever the puzzle (node cli.js validate <id>).
// Every challenge built on the contract gets the same battery, derived only from its kind and files:
//
//   structure    game.json, statement, viewer, starters for every installed language, challenge notes
//   referee      meta values, construction for every league / test, input lines are strings
//   starters     each installed language runs a full game / every test without crash or invalid output
//   misbehaving  generic bots that never answer, print garbage, or crash: the referee must end the game
//                cleanly with a reason (and the review should explain it)
//   opponents    multi: every boss legal in every league + strength ladder (each level beats the one below)
//                solo/io: the reference solution passes every test and generated levels; generator is
//                deterministic and builds valid levels
//   determinism  the same game with the same seed gives the same frames
//   review       every review item has { turn, kind, code, message } in the right shape
//   selftest     games/<id>/selftest.js, when the challenge has one
//
// Prints PASS / WARN / FAIL lines; FAIL means the challenge is not ready.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { runMatch, workRoot } = require('../server/engine/match');
const { availableLanguages, LANGUAGES } = require('../server/runner/languages');

const ROOT = path.join(__dirname, '..');
const EXT = { '.py': 'python', '.js': 'javascript', '.java': 'java', '.cpp': 'cpp' };

// generic misbehaving bots (JavaScript, with the CodinGame-style readline() prelude)
const BAD_BOTS = {
  silent: { why: 'never answers', source: 'while (readline() !== null) {}\n' },
  garbage: { why: 'prints garbage', source: 'print("@@@ not a valid answer @@@");\nwhile (readline() !== null) {}\n' },
  crash: { why: 'crashes on start', source: 'readline();\nprocess.exit(1);\n' },
};

function solutionFile(g, cfg) {
  if (cfg.solution) { const f = path.join(g.dir, cfg.solution); return fs.existsSync(f) ? f : null; }
  const d = path.join(g.dir, 'solution');
  if (!fs.existsSync(d)) return null;
  const f = fs.readdirSync(d).find(f => EXT[path.extname(f)] && LANGUAGES[EXT[path.extname(f)]].detect());
  return f ? path.join(d, f) : null;
}
const userBot = (file, name) => ({ type: 'user', lang: EXT[path.extname(file)], source: fs.readFileSync(file, 'utf8'), name: name || path.basename(file) });
const frameHash = events => crypto.createHash('sha1').update(JSON.stringify(events.filter(e => e.type === 'frame').map(e => [e.frame, e.actors.map(a => [a.player, a.output, a.error])]))).digest('hex').slice(0, 12);

async function validate(g, opts = {}) {
  const quick = !!opts.quick;
  const results = [];
  const say = (status, area, msg) => { results.push({ status, area, msg }); if (opts.log !== false) console.log(`${status.padEnd(4)}  ${area.padEnd(12)} ${msg}`); };
  const cfg = JSON.parse(fs.readFileSync(path.join(g.dir, 'game.json'), 'utf8'));
  const meta = g.Referee.meta || {};
  const langs = availableLanguages().map(l => l.id);
  const reviews = [];
  const play = async (players, extra = {}) => {
    const events = [];
    const r = await runMatch({ gameDef: g, players, seed: extra.seed || 1, league: extra.league || null, test: extra.test || null, timeoutMultiplier: opts.timeoutMult || 1, workRoot: workRoot(), emit: ev => events.push(ev) });
    if (r && r.review) reviews.push(...r.review);
    return { r, events };
  };

  // ---- structure ----
  say(cfg.name ? 'PASS' : 'FAIL', 'structure', `game.json name: ${cfg.name || 'missing'}; kind ${g.kind}${g.type === 'io' ? ' (io)' : ''}`);
  say(cfg.url ? 'PASS' : 'WARN', 'structure', cfg.url ? `CodinGame link: ${cfg.url}` : 'no "url" in game.json');
  say(g.statement.trim().length > 200 ? 'PASS' : 'FAIL', 'structure', `statement.md: ${g.statement.length} characters`);
  say(fs.existsSync(g.viewerPath) ? 'PASS' : 'FAIL', 'structure', `viewer: ${path.relative(ROOT, g.viewerPath)}`);
  const missingStarters = langs.filter(l => !g.starters[l]);
  say(missingStarters.length ? 'WARN' : 'PASS', 'structure', missingStarters.length ? `no starter for installed language(s): ${missingStarters.join(', ')}` : `starters for every installed language (${langs.join(', ')})`);
  const notes = path.join(ROOT, 'challenges', g.id + '.md');
  say(fs.existsSync(notes) ? 'PASS' : 'WARN', 'structure', fs.existsSync(notes) ? `challenges/${g.id}.md` : `no challenges/${g.id}.md (sources and rule decisions)`);
  say(g.originalStatementPath ? 'PASS' : 'WARN', 'structure', g.originalStatementPath ? 'original statement fetched (challenges/raw)' : `original statement not fetched: node cli.js fetch ${cfg.url || g.id}`);

  // ---- referee contract ----
  const okMeta = meta.playerCount >= 1 && meta.turnTimeout > 0 && meta.firstTurnTimeout > 0 && meta.maxTurns > 0 && typeof meta.viewer === 'string';
  say(okMeta ? 'PASS' : 'FAIL', 'referee', `meta: ${meta.playerCount} player(s), ${meta.firstTurnTimeout}/${meta.turnTimeout} ms, ${meta.maxTurns} turns, viewer "${meta.viewer}"`);
  say(typeof g.Referee.prototype.review === 'function' ? 'PASS' : 'WARN', 'referee', typeof g.Referee.prototype.review === 'function' ? 'review() implemented' : 'no review(): players get no explanation of their mistakes');
  const leagues = (g.leagues || []).map(l => l.id);
  const constructs = [];
  for (const lg of leagues.length ? leagues : [null]) {
    try {
      const testCase = g.kind === 'solo' ? g.resolveTest(null).data : undefined;
      const ref = new g.Referee({ seed: 1, playerCount: meta.playerCount, league: lg, testCase });
      const init = ref.getInitInput(0);
      const inputs = ref.getTurnInput(ref.getActors()[0] || 0);
      const strings = [...init, ...inputs].every(s => typeof s === 'string');
      JSON.stringify(ref.getStaticInfo());
      constructs.push(strings ? null : `league ${lg}: input lines must be strings`);
    } catch (e) { constructs.push(`${lg || 'default'}: ${e.message}`); }
  }
  const cErr = constructs.filter(Boolean);
  say(cErr.length ? 'FAIL' : 'PASS', 'referee', cErr.length ? `construction failed: ${cErr.join('; ')}` : `constructs for ${leagues.length ? 'every league (' + leagues.join(', ') + ')' : 'the default rules'}; inputs are strings`);
  if (g.kind === 'solo') {
    const bad = [];
    for (const t of g.tests) { try { new g.Referee({ seed: 1, playerCount: 1, testCase: t.data }); } catch (e) { bad.push(`${t.id}: ${e.message}`); } }
    say(!g.tests.length ? 'FAIL' : bad.length ? 'FAIL' : 'PASS', 'tests', !g.tests.length ? 'no tests' : bad.length ? bad.join('; ') : `${g.tests.length} test(s) load`);
  }

  // ---- starters ----
  for (const l of langs) {
    if (!g.starters[l]) continue;
    const bot = { type: 'user', lang: l, source: g.starters[l], name: `starter (${l})` };
    if (g.kind === 'multi') {
      const boss = g.bosses[0];
      if (!boss) { say('FAIL', 'starters', 'no boss to play against'); break; }
      for (const lg of leagues.length ? leagues : [null]) {
        const { r } = await play([bot, { type: 'boss', id: boss.id }], { league: lg });
        if (r.type === 'error') { say('FAIL', 'starters', `${l}: ${r.message}\n${r.compileLog || ''}`); continue; }
        const dq = r.dq && r.dq[0];
        say(!dq ? 'PASS' : /^timeout/.test(dq) ? 'WARN' : 'FAIL', 'starters', `${l} vs boss:${boss.id}${lg ? ' [' + lg + ']' : ''}: ${dq ? 'disqualified: ' + dq : 'full game, scores ' + JSON.stringify(r.scores)}`);
        if (quick) break;
      }
    } else {
      const ids = quick ? g.tests.slice(0, 2).map(t => t.id) : g.tests.map(t => t.id);
      let crashes = [];
      for (const id of ids) {
        const { r } = await play([bot], { test: id });
        if (r.type === 'error') { crashes.push(`compile: ${r.message}`); break; }
        if (r.dq && r.dq[0] && !/^timeout/.test(r.dq[0]) && g.type !== 'io') crashes.push(`${id}: ${r.dq[0]}`);
      }
      say(crashes.length ? 'FAIL' : 'PASS', 'starters', `${l} on ${ids.length} test(s): ${crashes.length ? crashes.join('; ') : 'runs cleanly (passing is not required)'}`);
    }
  }

  // ---- misbehaving bots ----
  const opponent = g.kind === 'multi' && g.bosses[0] ? [{ type: 'boss', id: g.bosses[0].id }] : [];
  for (const [name, b] of Object.entries(BAD_BOTS)) {
    const t0 = Date.now();
    try {
      const { r } = await play([{ type: 'user', lang: 'javascript', source: b.source, name: `${name} bot` }, ...opponent], { test: g.kind === 'solo' ? (g.tests[0] || {}).id : null });
      const lost = g.kind === 'multi' ? r.winner !== 0 : r.passed === false;
      const reason = (r.dq && r.dq[0]) || r.message || '';
      const explained = (r.review || []).some(x => x.player === 0 || x.player === null || x.player === undefined);
      say(!lost ? 'FAIL' : explained ? 'PASS' : 'WARN', 'misbehaving', `bot that ${b.why}: ${lost ? 'loses' : 'DOES NOT LOSE'} (${String(reason).slice(0, 90)}) in ${((Date.now() - t0) / 1000).toFixed(1)} s${explained ? '' : '; the review says nothing about it'}`);
    } catch (e) { say('FAIL', 'misbehaving', `bot that ${b.why}: the engine threw ${e.message}`); }
  }

  // ---- opponents ----
  if (g.kind === 'multi') {
    const games = Number(opts.games) || (quick ? 2 : 6);
    const bosses = g.bosses;
    if (bosses.length < 2) say('WARN', 'bosses', `${bosses.length} boss(es): a ladder needs at least 2 (wood, bronze, silver)`);
    for (const lg of leagues.length ? leagues : [null]) {
      for (let i = 0; i + 1 < bosses.length; i++) {
        const lo = bosses[i], hi = bosses[i + 1];
        let hiScore = 0, dqs = [];
        for (let k = 0; k < games; k++) {
          const side = k % 2;
          const players = side === 0 ? [{ type: 'boss', id: hi.id }, { type: 'boss', id: lo.id }] : [{ type: 'boss', id: lo.id }, { type: 'boss', id: hi.id }];
          const { r } = await play(players, { league: lg, seed: 100 + k });
          (r.dq || []).forEach((d, p) => { if (d) dqs.push(`${players[p].id}: ${d}`); });
          hiScore += r.winner === null || r.winner === undefined ? 0.5 : r.winner === side ? 1 : 0;
        }
        const rate = hiScore / games;
        if (dqs.length) say(dqs.some(d => !/timeout/.test(d)) ? 'FAIL' : 'WARN', 'bosses', `${lg ? '[' + lg + '] ' : ''}disqualified boss: ${dqs.slice(0, 3).join('; ')}`);
        say(rate >= 0.6 ? 'PASS' : 'WARN', 'bosses', `${lg ? '[' + lg + '] ' : ''}boss:${hi.id} vs boss:${lo.id}: ${hiScore}/${games} (${Math.round(rate * 100)} %)${rate >= 0.6 ? '' : ': the higher level should win clearly'}`);
      }
      if (quick) break;
    }
  } else {
    const sol = solutionFile(g, cfg);
    if (!sol) say('WARN', 'solution', 'no reference solution (game.json "solution" or games/<id>/solution/): tests cannot be proven passable');
    else {
      const ids = [...g.tests.map(t => t.id)];
      if (g.generator) for (let s = 1; s <= (quick ? 3 : 10); s++) ids.push(`random:${s}`);
      const failed = [];
      for (const id of ids) { const { r } = await play([userBot(sol, 'reference')], { test: id }); if (!r.passed) failed.push(`${id}: ${r.message}`); }
      say(failed.length ? 'FAIL' : 'PASS', 'solution', `${path.relative(ROOT, sol)} passes ${ids.length - failed.length}/${ids.length}${failed.length ? ': ' + failed.slice(0, 3).join('; ') : ''}`);
    }
    if (g.generator) {
      const probs = [];
      const seen = new Set();
      for (let s = 1; s <= (quick ? 5 : 20); s++) {
        const a = JSON.stringify(g.generator.generate(String(s))), b = JSON.stringify(g.generator.generate(String(s)));
        if (a !== b) probs.push(`seed ${s} is not deterministic`);
        seen.add(a);
        try { new g.Referee({ seed: s, playerCount: 1, testCase: JSON.parse(a) }); } catch (e) { probs.push(`seed ${s}: ${e.message}`); }
      }
      if (seen.size < 2) probs.push('every seed gives the same level');
      say(probs.length ? 'FAIL' : 'PASS', 'generator', probs.length ? probs.slice(0, 3).join('; ') : `deterministic, ${seen.size} distinct valid levels from ${quick ? 5 : 20} seeds`);
    } else say('WARN', 'generator', 'no generator.js: no random levels (hidden-validator style)');
  }

  // ---- determinism ----
  {
    const players = g.kind === 'multi' ? (g.bosses.length >= 2 ? [{ type: 'boss', id: g.bosses[g.bosses.length - 1].id }, { type: 'boss', id: g.bosses[0].id }] : null)
      : (solutionFile(g, cfg) ? [userBot(solutionFile(g, cfg))] : null);
    if (players) {
      const extra = { seed: 42, test: g.kind === 'solo' ? (g.tests[0] || {}).id : null };
      const a = await play(players, extra), b = await play(players, extra);
      const ha = frameHash(a.events), hb = frameHash(b.events);
      say(ha === hb ? 'PASS' : 'WARN', 'determinism', ha === hb ? `same seed, same game (${a.events.filter(e => e.type === 'frame').length} frames)` : 'the same seed gave different games (random generator not seeded, or timing-dependent bots)');
    }
  }

  // ---- review shape ----
  {
    const bad = reviews.filter(x => !x || typeof x.message !== 'string' || !x.message || !['mistake', 'warning', 'tip'].includes(x.kind) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(x.code)) || !(x.turn === null || x.turn === undefined || Number.isInteger(x.turn)));
    const codes = [...new Set(reviews.map(x => x.code))];
    say(bad.length ? 'FAIL' : reviews.length ? 'PASS' : 'WARN', 'review', bad.length ? `${bad.length} malformed item(s), e.g. ${JSON.stringify(bad[0]).slice(0, 150)}` : reviews.length ? `${reviews.length} item(s) over all games, ${codes.length} code(s): ${codes.slice(0, 12).join(', ')}` : 'no review items in any game');
  }

  // ---- selftest ----
  const st = path.join(g.dir, 'selftest.js');
  if (fs.existsSync(st)) {
    const r = require('child_process').spawnSync(process.execPath, [st], { cwd: ROOT, encoding: 'utf8' });
    say(r.status === 0 ? 'PASS' : 'FAIL', 'selftest', `${(r.stdout || '').trim().split('\n').pop() || ''}${r.status === 0 ? '' : ' (exit ' + r.status + ')'}`);
  } else say('INFO', 'selftest', 'no selftest.js (optional: rule assertions specific to this challenge)');

  const count = s => results.filter(r => r.status === s).length;
  return { id: g.id, pass: count('PASS'), warn: count('WARN'), fail: count('FAIL'), results };
}

module.exports = { validate };
