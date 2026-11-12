'use strict';
// Game registry. Every sub-folder with a game.json is a playable challenge of one of three kinds:
//
//  multi  (CodinGame "bot programming", e.g. Ocean of Code): referee.js + bosses + leagues
//  solo   (interactive solo puzzles, e.g. The Bridge): referee.js with meta.playerCount 1 + tests/*.json
//         + optional generator.js (random "validator" levels: generate(seed) -> test data)
//  io     (classic puzzles / clash of code: read all input, print the answer): "type": "io" in game.json,
//         tests/NN-name.in + tests/NN-name.out; referee.js optional (subclass of makeIoReferee for a
//         puzzle-specific review); generator.js optional (generate(seed) -> { name, input, expected })
//
//   game.json : { name, type?, url?, bosses?:[{id,name,file,args?}], starters:{python:"starters/bot.py",...},
//                 leagues?:[{id,name,default?}], tests?: "tests", timeLimitMs? (io) }
//   statement.md, viewer.js : shown / run in the browser (io games share games/io-viewer.js)
//   challenges/raw/<id>.html : the original statement saved by "node cli.js fetch" (local only, git-ignored)
const fs = require('fs');
const path = require('path');
const { makeIoReferee } = require('./io-referee');

const read = f => fs.readFileSync(f, 'utf8');
const prettyName = id => { const s = id.replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ').trim() || id; return s[0].toUpperCase() + s.slice(1); };

function loadTests(dir, cfg) {
  const tdir = path.join(dir, cfg.tests || 'tests');
  if (!fs.existsSync(tdir)) return [];
  const tests = [];
  for (const f of fs.readdirSync(tdir).sort()) {
    const full = path.join(tdir, f);
    if (f.endsWith('.json')) {
      const data = JSON.parse(read(full));
      const id = f.slice(0, -5);
      tests.push({ id, name: data.name || prettyName(id), data });
    } else if (f.endsWith('.in')) {
      const id = f.slice(0, -3);
      const out = path.join(tdir, id + '.out');
      tests.push({ id, name: prettyName(id), data: { input: read(full), expected: fs.existsSync(out) ? read(out) : '' } });
    }
  }
  return tests;
}

function loadGames() {
  const root = __dirname;
  const rawDir = path.join(root, '..', 'challenges', 'raw');
  const games = {};
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(root, entry.name);
    const cfgPath = path.join(dir, 'game.json');
    if (!fs.existsSync(cfgPath)) continue;
    try {
      const cfg = JSON.parse(read(cfgPath));
      const isIo = cfg.type === 'io';
      // io games use the generic referee unless they ship a referee.js (typically a subclass of
      // makeIoReferee that only adds a puzzle-specific review())
      const ownReferee = path.join(dir, 'referee.js');
      const Referee = isIo && !fs.existsSync(ownReferee) ? makeIoReferee({ ...cfg, id: entry.name }) : require(ownReferee).Referee;
      const starters = {};
      for (const [lang, rel] of Object.entries(cfg.starters || {})) starters[lang] = read(path.join(dir, rel));
      const tests = loadTests(dir, cfg);
      const genPath = path.join(dir, 'generator.js');
      const generator = fs.existsSync(genPath) ? require(genPath) : null;
      const kind = isIo || Referee.meta.playerCount === 1 ? 'solo' : 'multi';
      const ownViewer = path.join(dir, 'viewer.js');
      const raw = path.join(rawDir, entry.name + '.html');
      games[entry.name] = {
        id: entry.name,
        name: cfg.name || entry.name,
        url: cfg.url || null,
        type: isIo ? 'io' : kind,
        kind,
        dir,
        Referee,
        bosses: cfg.bosses || [],
        leagues: cfg.leagues || null,     // optional rule sets, e.g. CodinGame leagues
        tests,
        generator,
        starters,
        statement: fs.existsSync(path.join(dir, 'statement.md')) ? read(path.join(dir, 'statement.md')) : '',
        originalStatementPath: fs.existsSync(raw) ? raw : null,
        viewerPath: fs.existsSync(ownViewer) ? ownViewer : path.join(root, 'io-viewer.js'),
        resolveTest(id) { return resolveTest(this, id); },
      };
    } catch (e) {
      console.error(`[games] skipping ${entry.name}: ${e.message}`);
    }
  }
  return games;
}

// A test id from tests/, its 1-based number, its name, or "random[:seed]" for a generated level.
function resolveTest(game, id) {
  if (id === null || id === undefined || id === '') {
    if (game.tests.length) return game.tests[0];
    id = 'random:1';
  }
  id = String(id);
  const m = id.match(/^random(?::(.*))?$/);
  if (m) {
    if (!game.generator) throw new Error(`${game.name} has no level generator`);
    const seed = m[1] || '1';
    const data = game.generator.generate(seed);
    return { id, name: data.name || `Random level (seed ${seed})`, data };
  }
  const t = game.tests.find(t => t.id === id) || (/^\d+$/.test(id) ? game.tests[Number(id) - 1] : null)
    || game.tests.find(t => t.name.toLowerCase() === id.toLowerCase());
  if (!t) throw new Error(`unknown test "${id}" for ${game.name} (${game.tests.map((t, i) => `${i + 1}=${t.id}`).join(', ')}${game.generator ? ', random:<seed>' : ''})`);
  return t;
}

module.exports = { loadGames, resolveTest };
