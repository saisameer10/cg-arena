'use strict';
// Arena pool: every bot version you save plus the built-in bosses, with Elo ratings,
// so there is always a ladder of opponents to battle. Used by the HTTP API and the CLI.
//   arena/<game>/pool.json        { bots: [{id,name,lang,file,created}], ratings: {key: {rating,games,wins,losses,draws}}, history }
//   arena/<game>/bots/<id>.<ext>  the saved sources
// Keys: "boss:<id>" for built-in bosses, "pool:<id>" for saved versions.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { runMatch, workRoot, offsetSeed, summarizePatterns } = require('./engine/match');
const { LANGUAGES } = require('./runner/languages');

const ROOT = process.env.CG_ARENA_POOL || path.join(__dirname, '..', 'arena');
const K = 32;

const dirFor = gameId => path.join(ROOT, gameId);
const poolPath = gameId => path.join(dirFor(gameId), 'pool.json');
const freshRating = () => ({ rating: 1000, games: 0, wins: 0, losses: 0, draws: 0 });

function loadPool(gameDef) {
  let data = {};
  try { data = JSON.parse(fs.readFileSync(poolPath(gameDef.id), 'utf8')); } catch {}
  const pool = { bots: Array.isArray(data.bots) ? data.bots : [], ratings: data.ratings || {}, history: Array.isArray(data.history) ? data.history : [] };
  for (const b of gameDef.bosses) if (!pool.ratings['boss:' + b.id]) pool.ratings['boss:' + b.id] = freshRating();
  for (const b of pool.bots) if (!pool.ratings['pool:' + b.id]) pool.ratings['pool:' + b.id] = freshRating();
  return pool;
}
function savePool(gameId, pool) {
  fs.mkdirSync(dirFor(gameId), { recursive: true });
  fs.writeFileSync(poolPath(gameId), JSON.stringify(pool, null, 2));
}
function entryName(gameDef, pool, key) {
  if (key.startsWith('boss:')) { const b = gameDef.bosses.find(b => b.id === key.slice(5)); return b ? b.name : key; }
  if (key.startsWith('pool:')) { const b = pool.bots.find(b => b.id === key.slice(5)); return b ? b.name : key; }
  return key;
}
function leaderboard(gameDef, pool = loadPool(gameDef)) {
  const rows = [];
  for (const b of gameDef.bosses) rows.push({ key: 'boss:' + b.id, kind: 'boss', name: b.name, ...pool.ratings['boss:' + b.id] });
  for (const b of pool.bots) rows.push({ key: 'pool:' + b.id, kind: 'version', id: b.id, name: b.name, lang: b.lang, created: b.created, ...pool.ratings['pool:' + b.id] });
  rows.sort((a, b) => b.rating - a.rating || (b.games || 0) - (a.games || 0));
  return rows;
}

// Save the current code as a rated version.
function submit(gameDef, { lang, source, name }) {
  const L = LANGUAGES[lang];
  if (!L) throw new Error(`unknown language ${lang}`);
  if (typeof source !== 'string' || !source.trim()) throw new Error('empty source');
  const pool = loadPool(gameDef);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, '').replace('T', '-');
  const id = `${stamp}-${crypto.randomBytes(2).toString('hex')}`;
  const file = path.join('bots', id + path.extname(L.fileName));
  fs.mkdirSync(path.join(dirFor(gameDef.id), 'bots'), { recursive: true });
  fs.writeFileSync(path.join(dirFor(gameDef.id), file), source, 'utf8');
  const entry = { id, name: String(name || '').trim().slice(0, 60) || `v${pool.bots.length + 1}`, lang, file, created: new Date().toISOString() };
  pool.bots.push(entry);
  pool.ratings['pool:' + id] = freshRating();
  savePool(gameDef.id, pool);
  return entry;
}
function remove(gameDef, id) {
  const pool = loadPool(gameDef);
  const i = pool.bots.findIndex(b => b.id === id);
  if (i < 0) throw new Error(`no version ${id}`);
  const [b] = pool.bots.splice(i, 1);
  delete pool.ratings['pool:' + id];
  try { fs.unlinkSync(path.join(dirFor(gameDef.id), b.file)); } catch {}
  savePool(gameDef.id, pool);
}

// Turn a player reference into a runMatch player spec.
//   'boss:<id>' | 'pool:<id>' | {type:'pool', id} | {type:'user', lang, source, name} | {type:'boss', id}
function resolvePlayer(gameDef, ref, pool) {
  if (ref && typeof ref === 'object') {
    if (ref.type === 'pool') ref = 'pool:' + ref.id;
    else if (ref.type === 'boss' || ref.type === 'user') return ref;
    else throw new Error(`unknown player type ${ref.type}`);
  }
  if (typeof ref !== 'string') throw new Error('bad player reference');
  if (ref.startsWith('boss:')) return { type: 'boss', id: ref.slice(5) };
  if (ref.startsWith('pool:')) {
    pool = pool || loadPool(gameDef);
    const b = pool.bots.find(b => b.id === ref.slice(5));
    if (!b) throw new Error(`unknown arena version ${ref}`);
    return { type: 'user', lang: b.lang, source: fs.readFileSync(path.join(dirFor(gameDef.id), b.file), 'utf8'), name: `${b.name} (${b.lang})` };
  }
  throw new Error(`unknown player reference ${ref}`);
}
function expandOpponents(gameDef, pool, opponents) {
  if (opponents === 'all' || opponents === undefined || opponents === null || opponents === '') {
    return [...gameDef.bosses.map(b => 'boss:' + b.id), ...pool.bots.map(b => 'pool:' + b.id)];
  }
  if (opponents === 'bosses') return gameDef.bosses.map(b => 'boss:' + b.id);
  if (opponents === 'pool') return pool.bots.map(b => 'pool:' + b.id);
  return (Array.isArray(opponents) ? opponents : String(opponents).split(',')).map(s => String(s).trim()).filter(Boolean);
}
function elo(pool, a, b, scoreA) {   // scoreA: 1 win, 0.5 draw, 0 loss, from a's point of view
  const ra = pool.ratings[a], rb = pool.ratings[b];
  if (!ra || !rb) return;
  const ea = 1 / (1 + Math.pow(10, (rb.rating - ra.rating) / 400));
  const da = K * (scoreA - ea);
  ra.rating = Math.round(ra.rating + da);
  rb.rating = Math.round(rb.rating - da);
  for (const [r, s] of [[ra, scoreA], [rb, 1 - scoreA]]) { r.games++; if (s === 1) r.wins++; else if (s === 0) r.losses++; else r.draws++; }
}

/**
 * runArena: the candidate plays `games` games against each opponent, alternating sides
 * (P0 on even games, P1 on odd games) so first-move advantage cancels out.
 *   candidate: 'pool:<id>' | 'boss:<id>' | {type:'user', lang, source, name}
 *   opponents: 'all' | 'bosses' | 'pool' | ['boss:bronze', 'pool:<id>', ...]
 * Elo is updated only between rated entries (saved versions and bosses); unsaved code is measured but not rated.
 * emit() receives {type:'match'} per game, {type:'opponent'} per opponent, and a final {type:'summary'}.
 */
async function runArena({ gameDef, candidate, opponents, games = 2, seed = 1, league = null, timeoutMultiplier = 1, emit = () => {}, signal = null }) {
  const pool = loadPool(gameDef);
  const candKey = typeof candidate === 'string' ? candidate : null;
  const candSpec = resolvePlayer(gameDef, candidate, pool);
  const candName = candKey ? entryName(gameDef, pool, candKey) : (candSpec.name || 'My code');
  const keys = expandOpponents(gameDef, pool, opponents).filter(k => k !== candKey);
  games = Math.max(1, Math.min(200, Number(games) || 1));
  const per = [];
  const reviews = [];          // the candidate's review of every game, for patterns
  const total = { wins: 0, losses: 0, draws: 0 };
  let aborted = false;
  for (const key of keys) {
    if (signal && signal.aborted) { aborted = true; break; }
    let oppSpec;
    try { oppSpec = resolvePlayer(gameDef, key, pool); }
    catch (e) { emit({ type: 'opponent', key, name: key, wins: 0, losses: 0, draws: 0, played: 0, winRate: 0, errors: [e.message] }); continue; }
    const row = { key, name: entryName(gameDef, pool, key), wins: 0, losses: 0, draws: 0, errors: [] };
    for (let g = 0; g < games; g++) {
      if (signal && signal.aborted) { aborted = true; break; }
      const side = g % 2;
      const players = side === 0 ? [candSpec, oppSpec] : [oppSpec, candSpec];
      let result;
      const gameSeed = offsetSeed(seed, g);
      try { result = await runMatch({ gameDef, players, seed: gameSeed, league, timeoutMultiplier, workRoot: workRoot(), emit: () => {}, signal }); }
      catch (e) { result = { type: 'error', message: e.message }; }
      if (result.type === 'error') {
        if (result.compileLog && result.player === side) {   // the candidate itself does not compile: nothing else to run
          emit({ type: 'error', message: `${candName} failed to compile`, compileLog: result.compileLog });
          return { type: 'error', message: result.message, compileLog: result.compileLog };
        }
        row.errors.push(result.message);
        emit({ type: 'match', opponent: key, name: row.name, game: g, side, outcome: 'error', message: result.message });
        if (result.compileLog) break;    // the opponent does not compile: skip it
        continue;
      }
      if (result.aborted) { aborted = true; break; }
      const w = result.winner;
      const outcome = w === null || w === undefined ? 'draw' : w === side ? 'win' : 'loss';
      const field = outcome === 'win' ? 'wins' : outcome === 'loss' ? 'losses' : 'draws';
      row[field]++; total[field]++;
      if (candKey) elo(pool, candKey, key, outcome === 'win' ? 1 : outcome === 'loss' ? 0 : 0.5);
      reviews.push({ review: result.review || [], side, label: `${outcome} vs ${row.name} (game ${g + 1})`, outcome });
      const dq = (result.dq || []).map((d, i) => d ? `P${i}: ${d}` : null).filter(Boolean);
      emit({ type: 'match', opponent: key, name: row.name, game: g, side, seed: gameSeed, outcome, scores: result.scores, dq });
    }
    row.played = row.wins + row.losses + row.draws;
    row.winRate = row.played ? row.wins / row.played : 0;
    per.push(row);
    emit({ type: 'opponent', ...row });
    if (aborted) break;
  }
  if (candKey && per.length) {
    pool.history.push({ at: new Date().toISOString(), candidate: candKey, games, opponents: keys, league });
    if (pool.history.length > 500) pool.history.splice(0, pool.history.length - 500);
    savePool(gameDef.id, pool);
  }
  const summary = {
    type: 'summary', candidate: candName, rated: !!candKey, games, league, aborted,
    perOpponent: per, total: { ...total, played: total.wins + total.losses + total.draws },
    patterns: summarizePatterns(reviews),
    lossPatterns: summarizePatterns(reviews.filter(r => r.outcome === 'loss')),
    leaderboard: leaderboard(gameDef, pool),
  };
  emit(summary);
  return summary;
}

module.exports = { ROOT, loadPool, leaderboard, submit, remove, resolvePlayer, expandOpponents, runArena };
