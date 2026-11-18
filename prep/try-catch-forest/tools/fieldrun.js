// usage: node fieldrun.js <out.jsonl> <worker> <workers> <seeds> <first seed>
// Every version plays the same games: with each "field" (two fixed opponents) in the three seat orders, on the same seeds,
// in both hunting orders, on the cg-arena referee (games/try-catch-forest). One JSON line per game: seats, catches, ranks, first-catch turns.
// The table comes from fieldtab.py. Local referee and our own maps: this compares our versions with each other only.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..', '..');
const { loadGames } = require(path.join(ROOT, 'games'));
const { runMatch, workRoot } = require(path.join(ROOT, 'server', 'engine', 'match'));
const V = path.join(__dirname, '..', 'versions');
const VERSIONS = ['vlive_41748059', 'vlive_press', 'vlive_t1', 'vlive_all3', 'vlive_combo', 'vlive_first', 'vlive_dash', 'vlive_net1', 'vlive_late', 'vlive_3p', 'vlive_engine', 'vlive_hnet', 'vgo_b', 'v10', 'v16'];
const FIELDS = [['vlive_41748059', 'v10'], ['vgo_b', 'v16']];
const [out, worker, workers, seeds, seed0] = [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5], +process.argv[6]];
const src = {}; const spec = n => ({ type: 'user', lang: 'java', source: src[n] || (src[n] = fs.readFileSync(path.join(V, n + '.java'), 'utf8')), name: n });
(async () => {
  const games = loadGames(); const gameDef = (Array.isArray(games) ? games : Object.values(games)).find(g => g.id === 'try-catch-forest');
  const done = new Set(fs.existsSync(out) ? fs.readFileSync(out, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l).key) : []);
  let k = 0;
  for (let s = 0; s < seeds; s++) for (const x of VERSIONS) for (let f = 0; f < FIELDS.length; f++) for (let ord = 0; ord < 2; ord++) for (let rot = 0; rot < 3; rot++) {
    if (k++ % workers !== worker) continue;
    const trio = [x, FIELDS[f][ord], FIELDS[f][1 - ord]];   // ord 0: x hunts the first of the field, ord 1: the second
    const seats = [0, 1, 2].map(i => trio[(i + 3 - rot) % 3]);   // x sits in seat `rot`
    const key = `${x}|${f}|${ord}|${rot}|${seed0 + s}`; if (done.has(key)) continue;
    let r;
    try { r = await runMatch({ gameDef, players: seats.map(spec), seed: seed0 + s, timeoutMultiplier: 40, workRoot: workRoot(), emit: () => {} }); }
    catch (e) { r = { type: 'error', message: e.message }; }
    fs.appendFileSync(out, JSON.stringify({ key, x, field: f, seat: rot, seed: seed0 + s, seats, scores: r.scores, ranks: r.ranks, firstCatch: r.firstCatch, lost: r.unitsLost, dq: (r.dq || []).some(Boolean), error: r.type === 'error' ? r.message : undefined }) + '\n');
  }
})();
