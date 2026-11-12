#!/usr/bin/env node
'use strict';
// Import CodinGame replays: learn from your own losses and from top players' games.
//
//   node tools/cg-replay.js <replay url | game id | file.json> [...more] [--turns all|key|none|A-B] [--player <name|0|1>]
//                           [--league wood2|wood1|bronze] [--refresh] [--json]
//   node tools/cg-replay.js battles <codingamer> [--puzzle ocean-of-code] [--last 20] [--losses] [--fetch N]
//   node tools/cg-replay.js top [N] [--puzzle ocean-of-code]
//
// Uses only CodinGame's public read-only services (no login, no cookies):
//   gameResult/findInformationById [gameId, null]   -> puzzle title + the replay (frames, agents, scores, tooltips)
//   gameResult/findByGameId [gameId, null]          -> the replay only (fallback)
//   Leaderboards/getFilteredPuzzleLeaderboard        -> agent ids (top 1000, or one player via the keyword filter)
//   gamesPlayersRanking/findLastBattlesByAgentId     -> the latest games of an agent's current submission
// Replays are saved to challenges/raw/replays/<id>.json (git-ignored) and re-read from there next time.
//
// A replay holds, per frame: the acting agent, its raw stdout (the orders), the viewer's draw commands and the
// timeline tooltips; plus the referee seed, final scores and ranks. No stderr for other people's games.
// Ocean of Code games are replayed through our own port of the official referee (games/ocean-of-code), seeded with
// the replay's seed, which recovers what the replay does not spell out: true positions, SILENCE direction and length,
// sonar answers, damage per order, skipped orders, the same post-game review codes as local games, and a simple
// tracker of how well each submarine was hidden from its opponent. The re-simulation is checked against the replay
// (map, frames per turn, sub positions drawn by the viewer, life losses, final scores) and the checks are printed.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'challenges', 'raw', 'replays');
const API = 'https://www.codingame.com/services/';
const SIZE = 15;
const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };

// ---------------------------------------------------------------- CodinGame services
async function cg(service, body) {
  const res = await fetch(API + service, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=UTF-8', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  // CodinGame answers errors with HTTP 422 and { id, message }, e.g. { id: 548, message: "Game not found" }
  if (!res.ok || json === null || (!Array.isArray(json) && json.id !== undefined && json.message !== undefined)) {
    const msg = json && json.message ? json.message : text.slice(0, 200);
    throw new Error(`${service}: HTTP ${res.status} ${msg}`);
  }
  return json;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

function parseRef(ref) {
  const s = String(ref).trim();
  if (fs.existsSync(s) && fs.statSync(s).isFile()) return { file: path.resolve(s) };
  const m = s.match(/codingame\.com\/(?:replay|share-replay)\/(\d+)/) || s.match(/[?&#]game(?:Id)?=(\d+)/) || s.match(/^(\d{3,})$/);
  if (!m) throw new Error(`"${s}" is not a replay link (https://www.codingame.com/replay/<id>), a game id or a JSON file`);
  return { id: m[1] };
}

async function loadReplay(ref, { refresh = false } = {}) {
  const r = parseRef(ref);
  if (r.file) return normalize(JSON.parse(fs.readFileSync(r.file, 'utf8')), { file: r.file });
  const cached = path.join(OUT_DIR, `${r.id}.json`);
  if (!refresh && fs.existsSync(cached)) return normalize(JSON.parse(fs.readFileSync(cached, 'utf8')), { file: cached, cached: true });
  let info;
  try { info = await cg('gameResult/findInformationById', [Number(r.id), null]); }
  catch (e) {
    if (/not found/i.test(e.message)) throw new Error(`game ${r.id} not found on CodinGame (wrong id?)`);
    if (/not authori[sz]ed/i.test(e.message)) throw new Error(`game ${r.id} is a private replay (${e.message.replace(/^.*HTTP \d+ /, '')}). `
      + 'Open it on codingame.com while logged in: a Share link of it may work here; otherwise save the findInformationById / findByGameId answer from the browser\'s network tab and pass that file');
    info = { gameResult: await cg('gameResult/findByGameId', [Number(r.id), null]) };
  }
  const gr = info.gameResult || info;
  if (!gr || !Array.isArray(gr.frames)) throw new Error(`game ${r.id}: the answer holds no frames`);
  const saved = {
    source: `https://www.codingame.com/replay/${r.id}`,
    gameId: gr.gameId || Number(r.id),
    puzzleTitle: Array.isArray(info.puzzleTitle) ? info.puzzleTitle[0] : (info.puzzleTitle || info.questionTitle || null),
    puzzleId: info.puzzleId || null,
    fetched: new Date().toISOString(),
    note: 'CodinGame replay saved for local study (git-ignored). The viewer script CodinGame also sends is not kept.',
    gameResult: gr,
  };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(cached, JSON.stringify(saved));
  return normalize(saved, { file: cached, cached: false });
}

// accepts our saved format, a findInformationById answer, or a bare findByGameId answer
function normalize(data, where) {
  const gr = data.gameResult || data;
  if (!gr || !Array.isArray(gr.frames)) throw new Error(`${where.file}: not a CodinGame replay (no frames)`);
  const title = data.puzzleTitle ? (Array.isArray(data.puzzleTitle) ? data.puzzleTitle[0] : data.puzzleTitle) : (data.questionTitle || null);
  const agents = (gr.agents || []).slice().sort((a, b) => a.index - b.index);
  const names = agents.map((a, i) => (a.codingamer && a.codingamer.pseudo) || (a.arenaboss && a.arenaboss.nickname) || a.nickname || `player ${i}`);
  return { gameId: gr.gameId || data.gameId || null, title, puzzleId: data.puzzleId || null, gr, agents, names, file: where.file, cached: !!where.cached };
}

const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const firstLine = s => String(s === undefined || s === null ? '' : s).split('\n')[0].replace(/\r$/, '');
const hasOutput = f => typeof f.stdout === 'string' && f.stdout.trim() !== '';
const tooltipsOf = gr => (gr.tooltips || []).map(t => { try { return typeof t === 'string' ? JSON.parse(t) : t; } catch { return null; } }).filter(Boolean);

// ---------------------------------------------------------------- viewer data (CodinGame entity module)
function splitOutside(s, sep) {     // split on sep outside single-quoted strings (texts drawn by the viewer)
  const out = []; let cur = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && q && i + 1 < s.length) { cur += c + s[++i]; continue; }
    if (c === "'") q = !q;
    if (c === sep && !q) { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out;
}
function viewJson(frame) {
  const v = frame && frame.view;
  if (typeof v !== 'string') return null;
  const nl = v.indexOf('\n'), rest = nl < 0 ? '' : v.slice(nl + 1).trim();
  if (!rest) return null;
  try { const j = JSON.parse(rest); return j.frame ? j.frame : j; } catch { return null; }
}
function entityUpdates(em) {        // "U<id> <time> key value key value;<id> ..." -> [{ id, t, props }]
  const out = [];
  if (typeof em !== 'string') return out;
  for (const line of em.split('\n')) {
    if (line[0] !== 'U') continue;
    for (const upd of splitOutside(line.slice(1), ';')) {
      const tok = splitOutside(upd.trim(), ' ').filter(Boolean);
      if (tok.length < 2) continue;
      const props = {};
      for (let i = 2; i + 1 < tok.length;) {
        const k = tok[i++], v = tok[i++];
        if (i < tok.length && /^[^A-Za-z0-9'.-]$/.test(tok[i])) i++;    // interpolation curve marker (~, _, !)
        props[k] = v;
      }
      out.push({ id: Number(tok[0]), t: Number(tok[1]), props });
    }
  }
  return out.sort((a, b) => a.t - b.t);
}
// Ocean of Code draws the 15x15 grid with 60 px cells from (510, 90); islands are sprites "island/<mask>.png"
// anchored top-left, each submarine is a group (x, y = cell centre) holding a "sub.png" sprite tinted with
// the player colour (-1 = player 0, -2 = player 1). Returns the island grid and the sub cells after every frame.
function oceanView(frames) {
  const ents = new Map();
  const cellOf = (x, y, ox, oy) => {
    const cx = (Number(x) - ox) / 60, cy = (Number(y) - oy) / 60;
    return Number.isInteger(cx) && Number.isInteger(cy) && cx >= 0 && cy >= 0 && cx < SIZE && cy < SIZE ? [cx, cy] : null;
  };
  let islands = null;
  const subs = [];
  for (let f = 0; f < frames.length; f++) {
    const vj = viewJson(frames[f]);
    if (vj) {
      for (const u of entityUpdates(vj.entitymodule)) {
        const e = ents.get(u.id) || {};
        Object.assign(e, u.props);
        ents.set(u.id, e);
      }
      if (f === 0) {
        islands = [];
        let ok = true;
        for (const e of ents.values()) {
          if (!e.i || !String(e.i).startsWith('island/')) continue;
          const c = cellOf(e.x, e.y, 510, 90);
          if (!c) { ok = false; break; }
          islands.push(c);
        }
        if (!ok || !islands.length) islands = null;
      }
    }
    const pos = [null, null];
    for (const [id, e] of ents) {
      if (e.i !== 'sub.png' || (e.t !== '-1' && e.t !== '-2')) continue;
      const p = e.t === '-1' ? 0 : 1;
      for (const g of ents.values()) {
        if (g.ch === undefined || !String(g.ch).split(',').map(Number).includes(id)) continue;
        if (g.x !== undefined && g.y !== undefined) pos[p] = cellOf(g.x, g.y, 540, 120);
      }
    }
    subs.push(pos);
  }
  return { islands, subs };
}

// ---------------------------------------------------------------- Ocean of Code: re-simulation
function loadOcean() {
  const { Referee } = require(path.join(ROOT, 'games', 'ocean-of-code', 'referee.js'));
  const { GameError } = require(path.join(ROOT, 'games', 'base.js'));
  return { Referee, GameError };
}
const sectorOf = (x, y) => Math.ceil((x + 1) / 5) + Math.floor(y / 5) * 3;

function simulateOcean(rep, opts) {
  const { Referee, GameError } = loadOcean();
  const gr = rep.gr, F = gr.frames;
  const seed = (String(gr.refereeInput || '').match(/seed=(-?\d+)/) || [])[1];
  const league = opts.league || 'bronze';
  const ref = new Referee({ seed: seed === undefined ? 1 : seed, playerCount: 2, league });
  const checks = [];
  const view = oceanView(F);

  // map: generated from the seed, checked against the islands the viewer drew
  if (view.islands) {
    const viewGrid = Array.from({ length: SIZE }, () => new Array(SIZE).fill(false));
    for (const [x, y] of view.islands) viewGrid[x][y] = true;
    let diff = 0;
    for (let x = 0; x < SIZE; x++) for (let y = 0; y < SIZE; y++) if (viewGrid[x][y] !== ref.grid[x][y]) diff++;
    if (diff) {
      ref.grid = viewGrid;
      ref.map = [];
      for (let y = 0; y < SIZE; y++) { let row = ''; for (let x = 0; x < SIZE; x++) row += viewGrid[x][y] ? 'x' : '.'; ref.map.push(row); }
      checks.push({ ok: false, what: 'map', text: `map from seed ${seed} differs from the replay's islands in ${diff} cells: used the replay's map instead` });
    } else checks.push({ ok: true, what: 'map', text: `map regenerated from seed ${seed} matches the replay (${view.islands.length} island cells)` });
  } else checks.push({ ok: null, what: 'map', text: 'could not read the islands from the replay view; map taken from the seed unchecked' });

  // per-order log: wrap this instance's execute() (the referee file is not changed)
  let acts = [];
  const exec = ref.execute;
  ref.execute = function (me, a) {
    const d0 = this.events.damage.slice(), from = [me.x, me.y];
    exec.call(this, me, a);
    const ev = this.events, parts = a.command.split(' ');
    const act = { player: me.index, activator: a.activator, command: a.command, from, to: [me.x, me.y], dmg: [ev.damage[0] - d0[0], ev.damage[1] - d0[1]] };
    if (a.activator === 'MOVE') { act.dir = parts[1]; act.power = parts[2] ? parts[2].trim() : ''; }
    if (a.activator === 'SILENCE' && ev.silence) { act.dir = ev.silence.dir; act.dist = ev.silence.dist; }
    if (a.activator === 'SURFACE') act.sector = ev.surfaced;
    if (a.activator === 'SONAR' && ev.sonar) { act.sector = ev.sonar.sector; act.result = ev.sonar.result; }
    if (a.activator === 'MINE' && ev.mine) act.at = ev.mine;
    if (a.activator === 'TORPEDO' || (a.activator === 'TRIGGER' && ev.trigger)) act.at = [Number(parts[1]), Number(parts[2])];
    acts.push(act);
  };

  const tips = tooltipsOf(gr);
  const tipAt = f => tips.filter(t => t.turn === f);
  const failReason = (f, p) => {
    const t = tipAt(f).find(t => t.event === p && !/lost/.test(t.text));
    return t ? t.text.trim() : 'no output (timeout or crash)';
  };
  // the same event stream the match engine emits (start / frame / end), so the web viewer can replay it
  const meta = Referee.meta || {};
  const events = [{ type: 'start', game: { id: 'ocean-of-code', name: 'Ocean of Code', viewer: meta.viewer || 'ocean', kind: 'multi' }, players: rep.names.slice(0, 2),
    seed, league, test: null, static: ref.getStaticInfo(), source: { site: 'codingame', gameId: rep.gameId, url: `https://www.codingame.com/replay/${rep.gameId}` } }];
  let actorEvents = [];
  const emitFrame = () => { events.push({ type: 'frame', turn: ref.turn, actors: actorEvents, frame: ref.getFrame(), summary: ref.takeSummary() }); actorEvents = []; };
  const turns = [];
  let frameMismatch = 0, posChecked = 0, posBad = 0, firstPosBad = null;
  const record = (p, f, used, raw) => {
    const ev = ref.events || {};
    const lastFrame = f + used - 1;
    const t = { turn: ref.turn + 1, frame: f, lastFrame, player: p, raw, acts, input: lastInput, skipped: (ev.skipped || []).slice(), error: ref.dq[p] || null,
      pos: ref.players.map(q => [q.x, q.y]), lives: ref.players.map(q => q.life), stderr: F.slice(f, f + used).map(x => x.stderr).filter(Boolean).join('\n') || null };
    actorEvents.push({ player: p, input: t.input || [], output: raw ? [raw] : [], stderr: t.stderr || '', ms: '-', error: t.error, frame: f });
    // the viewer's sub positions at the end of this turn
    const vp = view.subs[lastFrame];
    if (vp && !t.error) for (const q of [0, 1]) {
      if (!vp[q] || !ref.players[q].placed) continue;
      posChecked++;
      if (vp[q][0] !== t.pos[q][0] || vp[q][1] !== t.pos[q][1]) { posBad++; if (!firstPosBad) firstPosBad = { turn: t.turn, frame: lastFrame, player: q, sim: t.pos[q], view: vp[q] }; }
    }
    turns.push(t);
  };
  let lastInput = [];
  const play = (p, f) => {
    acts = [];
    lastInput = ref.getTurnInput(p);
    const fr = F[f], raw = hasOutput(fr) ? firstLine(fr.stdout) : '';
    const before = ref.frames;
    if (raw) {
      try { ref.applyOutput(p, [raw]); }
      catch (e) { if (e instanceof GameError) ref.disqualify(p, e.message); else throw e; }
    } else ref.disqualify(p, failReason(f, p));
    return { raw, executed: ref.frames - before };
  };

  let fi = 1;
  for (const p of [0, 1]) {                                   // engine turn 0: both placements, one frame each
    if (fi >= F.length) break;
    const { raw } = play(p, fi);
    record(p, fi, 1, raw);
    fi++;
  }
  ref.endTurn();
  emitFrame();
  while (fi < F.length && !ref.isGameOver()) {                 // then one round per engine turn
    const p = ref.getActors()[0];
    if (F[fi].agentId !== undefined && F[fi].agentId !== p && hasOutput(F[fi])) frameMismatch++;
    const { raw, executed } = play(p, fi);
    const used = Math.max(1, executed);                       // the SDK spends one frame per executed order
    for (let k = 1; k < used; k++) if (!F[fi + k] || hasOutput(F[fi + k])) frameMismatch++;
    record(p, fi, used, raw);
    fi += used;
    ref.endTurn();
    emitFrame();
  }
  const leftover = F.length - fi;
  const res = ref.getResult();
  const scoresOk = Array.isArray(gr.scores) && gr.scores.length === 2 && gr.scores[0] === res.scores[0] && gr.scores[1] === res.scores[1];
  checks.push({ ok: frameMismatch === 0 && leftover === 0, what: 'frames',
    text: frameMismatch === 0 && leftover === 0 ? `all ${F.length - 1} frames consumed, one per executed order` : `${frameMismatch} frame(s) did not line up with the executed orders, ${leftover} frame(s) left over` });
  checks.push({ ok: posChecked ? posBad === 0 : null, what: 'positions',
    text: posChecked ? (posBad ? `${posBad} of ${posChecked} sub positions differ from the viewer (first: turn ${firstPosBad.turn}, frame ${firstPosBad.frame}, P${firstPosBad.player} sim ${firstPosBad.sim} view ${firstPosBad.view})` : `${posChecked} sub positions match the viewer`) : 'no sub positions found in the viewer data' });
  // life losses announced by the timeline tooltips vs the simulated damage, per turn
  let lossBad = 0, lossChecked = 0;
  for (const t of turns) {
    const announced = [0, 0];
    for (let f = t.frame; f <= t.lastFrame; f++) for (const tip of tipAt(f)) {
      const m = /lost (\d+|a) li/.exec(tip.text);
      if (m && (tip.event === 0 || tip.event === 1)) announced[tip.event] += m[1] === 'a' ? 1 : Number(m[1]);
    }
    const sim = [0, 1].map(q => t.acts.reduce((n, a) => n + a.dmg[q], 0));
    if (announced[0] || announced[1] || sim[0] || sim[1]) { lossChecked++; if (announced[0] !== sim[0] || announced[1] !== sim[1]) lossBad++; }
  }
  checks.push({ ok: lossBad === 0, what: 'damage', text: lossBad ? `${lossBad} of ${lossChecked} turns with life losses disagree with the replay's tooltips` : `${lossChecked} turns with life losses match the replay's tooltips` });
  checks.push({ ok: scoresOk, what: 'scores', text: `final lives ${res.scores.join('-')} (replay: ${(gr.scores || []).join('-')})` });

  const exposure = trackExposure(ref, turns);
  let review = [];
  try { review = ref.review() || []; } catch (e) { review = [{ turn: null, player: null, kind: 'warning', code: 'review-failed', message: e.message }]; }
  events.push({ type: 'end', result: { ...res, players: rep.names.slice(0, 2), dq: ref.dq.slice(), review }, summary: ref.takeSummary(), review });
  return { seed, league, ref, turns, checks, result: res, review, exposure, events };
}

// ---------------------------------------------------------------- how well each sub was hidden
// Cells where the opponent could still place a submarine, from public information only: the map, MOVE
// directions, SURFACE sectors, TORPEDO range from the shooter, SILENCE (0-4 straight), sonar answers and life
// losses after explosions. Visited-path constraints are ignored, so the counts are an upper bound: a strong
// tracker narrows things down at least this far.
function trackExposure(ref, turns) {
  const water = (x, y) => x >= 0 && y >= 0 && x < SIZE && y < SIZE && !ref.grid[x][y];
  const all = () => { const s = new Uint8Array(SIZE * SIZE); for (let x = 0; x < SIZE; x++) for (let y = 0; y < SIZE; y++) if (water(x, y)) s[x + y * SIZE] = 1; return s; };
  const count = s => s.reduce((n, v) => n + v, 0);
  const filter = (s, fn) => { const o = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) if (s[i] && fn(i % SIZE, (i / SIZE) | 0)) o[i] = 1; return o; };
  const blast = (x, y, ex, ey) => (x === ex && y === ey) ? 2 : (Math.abs(x - ex) <= 1 && Math.abs(y - ey) <= 1 ? 1 : 0);
  const within4 = (tx, ty) => {        // water cells with a water path of length <= 4 to the target
    const d = new Int8Array(SIZE * SIZE).fill(-1), q = [[tx, ty]];
    if (!water(tx, ty)) return d;
    d[tx + ty * SIZE] = 0;
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i], k = d[x + y * SIZE];
      if (k === 4) continue;
      for (const [dx, dy] of Object.values(DIRS)) { const nx = x + dx, ny = y + dy; if (water(nx, ny) && d[nx + ny * SIZE] < 0) { d[nx + ny * SIZE] = k + 1; q.push([nx, ny]); } }
    }
    return d;
  };
  const cand = [all(), all()];
  const series = [[], []];
  let lost = 0;
  for (const t of turns) {
    if (t.turn === 1) continue;                    // placements reveal nothing
    const P = t.player, O = 1 - P;
    const blasts = t.acts.filter(a => a.at && (a.activator === 'TORPEDO' || a.activator === 'TRIGGER'));
    for (const a of t.acts) {
      if (a.activator === 'MOVE') {
        const [dx, dy] = DIRS[a.dir]; const o = new Uint8Array(SIZE * SIZE);
        for (let i = 0; i < o.length; i++) if (cand[P][i]) { const x = i % SIZE + dx, y = ((i / SIZE) | 0) + dy; if (water(x, y)) o[x + y * SIZE] = 1; }
        cand[P] = o;
      } else if (a.activator === 'SILENCE') {
        const o = cand[P].slice();
        for (let i = 0; i < o.length; i++) if (cand[P][i]) for (const [dx, dy] of Object.values(DIRS)) {
          let x = i % SIZE, y = (i / SIZE) | 0;
          for (let k = 0; k < 4; k++) { x += dx; y += dy; if (!water(x, y)) break; o[x + y * SIZE] = 1; }
        }
        cand[P] = o;
      } else if (a.activator === 'SURFACE') cand[P] = filter(cand[P], (x, y) => sectorOf(x, y) === a.sector);
      else if (a.activator === 'TORPEDO') { const d = within4(a.at[0], a.at[1]); cand[P] = filter(cand[P], (x, y) => d[x + y * SIZE] >= 0); }
      else if (a.activator === 'SONAR') cand[O] = filter(cand[O], (x, y) => (sectorOf(x, y) === a.sector) === (a.result === 'Y'));
      // the actor's own life loss pins it only when this turn had a single explosion (lives are seen per turn)
      if (blasts.length === 1 && a === blasts[0]) { const [ex, ey] = a.at; cand[P] = filter(cand[P], (x, y) => blast(x, y, ex, ey) === a.dmg[P]); }
    }
    if (blasts.length) {                           // the other sub did not move during this turn: all blasts together
      const total = blasts.reduce((n, a) => n + a.dmg[O], 0);
      cand[O] = filter(cand[O], (x, y) => blasts.reduce((n, a) => n + blast(x, y, a.at[0], a.at[1]), 0) === total);
    }
    for (const q of [0, 1]) {
      const [x, y] = t.pos[q];
      if (x >= 0 && !cand[q][x + y * SIZE]) { lost++; cand[q] = all(); }      // safety net: never drop the true cell
    }
    t.hidden = [count(cand[0]), count(cand[1])];
    series[0].push(t.hidden[0]); series[1].push(t.hidden[1]);
  }
  return { series, lost };
}

// ---------------------------------------------------------------- Ocean of Code: statistics
function oceanStats(sim) {
  const stats = [0, 1].map(() => ({
    rounds: 0, orders: 0, moves: 0, charge: { TORPEDO: 0, SONAR: 0, SILENCE: 0, MINE: 0, none: 0 },
    torp: { fired: 0, hit: 0, direct: 0, dealt: 0, selfDmg: 0, selfHits: 0, missed: 0, dist: [] },
    mine: { dropped: 0, triggered: 0, hit: 0, dealt: 0, selfDmg: 0 },
    sonar: { used: 0, yes: 0 }, silence: { used: 0, dist: [0, 0, 0, 0, 0] }, surface: { count: 0, sectors: [] },
    taken: { torpedo: 0, mine: 0, own: 0, surface: 0 }, skipped: 0, firstHit: null, damageTurns: [], hitsTaken: [], dq: null,
  }));
  for (let i = 0; i < sim.turns.length; i++) {
    const t = sim.turns[i];
    if (t.turn === 1) { if (t.error) stats[t.player].dq = { turn: t.turn, reason: t.error }; continue; }
    const s = stats[t.player], o = stats[1 - t.player], P = t.player, O = 1 - P;
    s.rounds++; s.skipped += t.skipped.length;
    if (t.error) s.dq = { turn: t.turn, reason: t.error };
    let dealt = 0;
    for (const a of t.acts) {
      s.orders++;
      switch (a.activator) {
        case 'MOVE': s.moves++; s.charge[a.power && s.charge[a.power] !== undefined ? a.power : 'none']++; break;
        case 'SILENCE': s.silence.used++; s.silence.dist[a.dist]++; s.moves += a.dist; break;
        case 'SURFACE': s.surface.count++; s.surface.sectors.push(a.sector); s.taken.surface += a.dmg[P]; break;
        case 'SONAR': s.sonar.used++; if (a.result === 'Y') s.sonar.yes++; break;
        case 'MINE': s.mine.dropped++; break;
        case 'TORPEDO': {
          s.torp.fired++;
          if (a.dmg[O] > 0) s.torp.hit++;
          if (a.dmg[O] >= 2) s.torp.direct++;
          if (a.dmg[O] === 0 && a.dmg[P] === 0) s.torp.missed++;
          if (a.dmg[P] > 0) s.torp.selfHits++;
          s.torp.dealt += a.dmg[O]; s.torp.selfDmg += a.dmg[P];
          o.taken.torpedo += a.dmg[O]; s.taken.own += a.dmg[P];
          s.torp.dist.push(Math.abs(a.from[0] - t.pos[O][0]) + Math.abs(a.from[1] - t.pos[O][1]));
          break;
        }
        case 'TRIGGER': {
          s.mine.triggered++;
          if (a.dmg[O] > 0) s.mine.hit++;
          s.mine.dealt += a.dmg[O]; s.mine.selfDmg += a.dmg[P];
          o.taken.mine += a.dmg[O]; s.taken.own += a.dmg[P];
          break;
        }
      }
      if (a.activator === 'TORPEDO' || a.activator === 'TRIGGER') dealt += a.dmg[O];
    }
    if (dealt) {
      // how many cells the victim could still be in, from the shooter's public information, before this turn
      const prev = sim.turns[i - 1], hid = prev && prev.hidden ? prev.hidden[O] : null;
      const hit = { turn: t.turn, frame: t.frame, amount: dealt, victimHidIn: hid, by: t.acts.filter(a => a.at && (a.activator === 'TORPEDO' || a.activator === 'TRIGGER')).map(a => `${a.activator} ${a.at}`) };
      s.damageTurns.push(hit); o.hitsTaken.push(hit);
      if (s.firstHit === null) s.firstHit = t.turn;
    }
  }
  return stats;
}

// ---------------------------------------------------------------- printing
const pad = (s, n) => { s = String(s); return s.length > n ? s.slice(0, n - 2) + '..' : s.padEnd(n); };
const pct = (a, b) => b ? `${Math.round(100 * a / b)}%` : '-';
const median = list => { if (!list.length) return null; const s = list.slice().sort((a, b) => a - b); return s[(s.length - 1) >> 1]; };

function turnEvents(t, names) {
  const ev = [], P = t.player, O = 1 - P;
  for (const a of t.acts) {
    const hurt = [0, 1].filter(q => a.dmg[q]).map(q => `${q === P ? 'self' : 'P' + q} -${a.dmg[q]}`).join(', ');
    if (a.activator === 'SILENCE') ev.push(`silence ${a.dir}${a.dist}`);
    else if (a.activator === 'SURFACE') ev.push(`SURFACE sector ${a.sector} (-1)`);
    else if (a.activator === 'SONAR') ev.push(`sonar ${a.sector}=${a.result}`);
    else if (a.activator === 'MINE') ev.push(`mine@${a.at}`);
    else if (a.activator === 'TORPEDO') ev.push(`TORPEDO ${a.at} ${hurt ? 'HIT ' + hurt : 'miss'}`);
    else if (a.activator === 'TRIGGER') ev.push(`TRIGGER ${a.at} ${hurt ? 'HIT ' + hurt : 'miss'}`);
  }
  if (t.raw && !t.raw.split('|').some(c => c.trim().startsWith('SURFACE')) && t.acts.some(a => a.activator === 'SURFACE')) ev.push('(no order could run: referee surfaced)');
  for (const s of t.skipped) ev.push(`skipped "${s}"`);
  if (t.error) ev.push(`DISQUALIFIED: ${t.error}`);
  return ev.join('; ');
}

const livesText = scores => (scores || []).map(s => s < 0 ? 'DQ' : String(s)).join('-');
function sourceLine(rep) {
  const inRepo = path.resolve(rep.file).startsWith(path.resolve(OUT_DIR));
  if (!inRepo) return `read from: ${rep.file}`;
  return `saved: ${path.relative(ROOT, rep.file)}${rep.cached ? ' (cached copy; --refresh downloads it again)' : ''}`;
}
// the best score wins (Ocean: lives, Tron: survival); a shared best score is a draw. The replay's "ranks" is
// the list of agent indices in finishing order (checked on a 3-player Tron game), used only without scores.
function winnerOf(gr, fallback) {
  const sc = gr.scores;
  if (Array.isArray(sc) && sc.length) {
    const best = Math.max(...sc);
    return sc.filter(s => s === best).length > 1 ? null : sc.indexOf(best);
  }
  return Array.isArray(gr.ranks) && gr.ranks.length ? gr.ranks[0] : fallback;
}

function printOcean(rep, sim, opts) {
  const { names } = rep;
  const gr = rep.gr;
  const winner = winnerOf(gr, sim.result.winner);
  console.log(`Ocean of Code, game ${rep.gameId}  https://www.codingame.com/replay/${rep.gameId}`);
  console.log(`P0 ${names[0]} vs P1 ${names[1]}: ${winner === null ? 'draw' : `${names[winner]} won`}, lives ${livesText(gr.scores || sim.result.scores)}, ${gr.frames.length} frames, seed ${sim.seed}`);
  console.log(sourceLine(rep));
  console.log('re-simulated with games/ocean-of-code (rules: ' + sim.league + '):');
  for (const c of sim.checks) console.log(`  ${c.ok === true ? 'ok  ' : c.ok === false ? 'DIFF' : '??  '} ${c.what.padEnd(9)} ${c.text}`);
  if (sim.exposure.lost) console.log(`  note      the hidden-cells tracker lost the true cell ${sim.exposure.lost} time(s) and was reset`);

  const mode = opts.turns || 'all';
  if (mode !== 'none') {
    let [lo, hi] = [0, Infinity];
    const m = /^(\d+)-(\d+)$/.exec(mode);
    if (m) [lo, hi] = [Number(m[1]), Number(m[2])];
    console.log('\nturn = cg-arena turn (1 = placement, then one per player turn), f = frame in the CodinGame replay,');
    console.log('at = true cell after the turn, hid = cells the opponent could still place this sub in (public info only)');
    console.log(`${'turn'.padStart(4)} ${'f'.padStart(4)}  ${pad('player', 16)} ${pad('orders', 36)} ${pad('at', 6)} lives  hid  events`);
    for (const t of sim.turns) {
      if (t.turn < lo || t.turn > hi) continue;
      const ev = turnEvents(t, names);
      if (mode === 'key' && !ev && t.turn !== 1) continue;
      const at = t.pos[t.player][0] >= 0 ? `${t.pos[t.player][0]},${t.pos[t.player][1]}` : '-';
      const hid = t.hidden ? String(t.hidden[t.player]) : '';
      console.log(`${String(t.turn).padStart(4)} ${String(t.frame).padStart(4)}  ${pad(`P${t.player} ${names[t.player]}`, 16)} ${pad(t.raw || '(none)', 36)} ${pad(at, 6)} ${`${Math.max(t.lives[0], 0)}-${Math.max(t.lives[1], 0)}`.padEnd(5)} ${hid.padStart(4)}  ${ev}`);
      if (t.stderr && opts.stderr) for (const l of t.stderr.split('\n').slice(0, 8)) console.log(`${''.padStart(12)}stderr: ${l}`);
    }
  }

  const st = oceanStats(sim);
  const col = 22;
  const row = (label, f) => console.log(`  ${label.padEnd(38)}${[0, 1].map(p => pad(f(st[p], p), col)).join('')}`);
  console.log('\nstatistics');
  row('', (s, p) => `P${p} ${names[p]}`);
  row('result', (s, p) => `${winner === null ? 'draw' : winner === p ? 'won' : 'lost'} (${Math.max(sim.result.scores[p], 0)} lives)`);
  row('turns played / orders per turn', s => `${s.rounds} / ${(s.orders / Math.max(1, s.rounds)).toFixed(2)}`);
  row('cells moved (MOVE + SILENCE)', s => s.moves);
  row('charged T/So/Si/M/none', s => `${s.charge.TORPEDO}/${s.charge.SONAR}/${s.charge.SILENCE}/${s.charge.MINE}/${s.charge.none}`);
  row('torpedoes fired', s => s.torp.fired);
  row('  hit / direct / missed', s => `${s.torp.hit} / ${s.torp.direct} / ${s.torp.missed} (${pct(s.torp.hit, s.torp.fired)} hit)`);
  row('  damage dealt / to self', s => `${s.torp.dealt} / ${s.torp.selfDmg}`);
  row('  median distance to target', s => { const m = median(s.torp.dist); return m === null ? '-' : `${m} cells`; });
  row('mines dropped / triggered', s => `${s.mine.dropped} / ${s.mine.triggered}`);
  row('  trigger hits / damage dealt', s => `${s.mine.hit} / ${s.mine.dealt}${s.mine.selfDmg ? ` (self ${s.mine.selfDmg})` : ''}`);
  row('sonar used / found', s => `${s.sonar.used} / ${s.sonar.yes}`);
  row('silence used (lengths 0-4)', s => `${s.silence.used} (${s.silence.dist.join(' ')})`);
  row('surfaces (sectors)', s => `${s.surface.count}${s.surface.count ? ` (${s.surface.sectors.join(',')})` : ''}`);
  row('damage dealt total', s => s.torp.dealt + s.mine.dealt);
  row('damage taken: torp/mine/own/surf', s => `${s.taken.torpedo}/${s.taken.mine}/${s.taken.own}/${s.taken.surface}`);
  row('first damage dealt at turn', s => s.firstHit === null ? '-' : s.firstHit);
  row('orders skipped by the referee', s => s.skipped);
  row('hidden: median cells (all turns)', (s, p) => { const m = median(sim.exposure.series[p]); return m === null ? '-' : m; });
  row('hidden: turns in <=9 / in 1 cell', (s, p) => { const se = sim.exposure.series[p]; return `${se.filter(n => n <= 9).length} / ${se.filter(n => n <= 1).length} of ${se.length}`; });
  row('hits taken while hidden in <=2 cells', s => { const h = s.hitsTaken.filter(x => x.victimHidIn !== null); return h.length ? `${h.filter(x => x.victimHidIn <= 2).length} of ${h.length}` : '-'; });
  row('disqualified', s => s.dq ? `turn ${s.dq.turn}: ${s.dq.reason}` : '-');
  const dmg = [];
  for (const p of [0, 1]) for (const d of st[p].damageTurns) dmg.push({ ...d, p });
  dmg.sort((a, b) => a.turn - b.turn);
  if (dmg.length) {
    console.log('\ndamage dealt per turn (who, amount, orders that hit, cells the victim could be in before the shot)');
    for (const d of dmg) console.log(`  turn ${String(d.turn).padStart(3)} f${String(d.frame).padEnd(4)} P${d.p} ${pad(names[d.p], 14)} -${d.amount}  [${d.by.join(', ')}]  victim hid in ${d.victimHidIn === null ? '?' : d.victimHidIn} cell${d.victimHidIn === 1 ? '' : 's'}`);
  }
  if (sim.review.length) {
    const toFrame = (turn, p) => { const t = sim.turns.find(x => x.turn === turn && x.player === p) || sim.turns.find(x => x.turn === turn); return t ? t.frame : null; };
    console.log('\nreview (same codes as local cg-arena games; "Turn N" = cg-arena turn, f = CodinGame frame)');
    for (const p of [0, 1]) {
      for (const it of sim.review.filter(r => r.player === p)) {
        const f = it.turn ? toFrame(it.turn, p) : null;
        console.log(`  P${p} ${pad(names[p], 14)} ${pad(it.kind, 8)} ${pad(it.code, 18)} ${f !== null ? `[f${f}] ` : ''}${it.message}`);
      }
    }
  }
  return st;
}

// any other game: what each player printed, frame by frame
function printGeneric(rep, opts) {
  const { gr, names } = rep;
  const winner = winnerOf(gr, null);
  console.log(`${rep.title || 'unknown game'}, game ${rep.gameId}  https://www.codingame.com/replay/${rep.gameId}`);
  console.log(`${names.map((n, i) => `P${i} ${n}`).join(' vs ')}: ${winner === null ? 'draw' : `${names[winner]} won`}, scores ${(gr.scores || []).join(' / ')}, ${gr.frames.length} frames, ${String(gr.refereeInput || '').trim() || 'no referee input'}`);
  console.log(sourceLine(rep));
  console.log('(no cg-arena referee for this game: showing the raw orders; frames without output belong to the previous order)');
  const tips = tooltipsOf(gr);
  const per = names.map(() => ({ outputs: 0, cmds: {} }));
  const mode = opts.turns || 'all';
  for (let f = 1; f < gr.frames.length; f++) {
    const fr = gr.frames[f];
    const tip = tips.filter(t => t.turn === f).map(t => `[${t.event !== undefined ? 'P' + t.event + ' ' : ''}${t.text.trim()}]`).join(' ');
    if (!hasOutput(fr) && !tip) continue;
    if (hasOutput(fr) && per[fr.agentId]) {
      per[fr.agentId].outputs++;
      for (const line of fr.stdout.trim().split('\n')) for (const c of line.split(/[;|]/)) { const k = c.trim().split(' ')[0]; if (k) per[fr.agentId].cmds[k] = (per[fr.agentId].cmds[k] || 0) + 1; }
    }
    if (mode !== 'none') console.log(`f${String(f).padEnd(4)} ${hasOutput(fr) ? pad(`P${fr.agentId} ${names[fr.agentId] || ''}`, 16) : ''.padEnd(16)} ${hasOutput(fr) ? fr.stdout.trim().replace(/\n/g, ' / ').slice(0, 100) : ''} ${tip}`);
  }
  console.log('\nstatistics');
  per.forEach((s, i) => console.log(`  P${i} ${pad(names[i], 16)} ${s.outputs} outputs; commands: ${Object.entries(s.cmds).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => `${k} ${n}`).join(', ')}`));
}

// ---------------------------------------------------------------- leaderboard and battles
async function findAgent(puzzle, who) {
  const lb = await cg('Leaderboards/getFilteredPuzzleLeaderboard', [puzzle, null, 'global', { active: true, column: 'keyword', filter: who }]);
  const users = lb.users || [];
  return users.find(u => (u.pseudo || '').toLowerCase() === who.toLowerCase()) || users[0] || null;
}
async function cmdTop(n, puzzle) {
  const lb = await cg('Leaderboards/getFilteredPuzzleLeaderboard', [puzzle, null, 'global', { active: false, column: '', filter: '' }]);
  console.log(`${puzzle}: ${lb.count} players (top ${Math.min(n, lb.users.length)} shown)`);
  console.log(' rank  score   league  language     agentId   player');
  for (const u of lb.users.slice(0, n)) {
    const div = u.league ? `${u.league.divisionIndex + 1}/${u.league.divisionCount}` : '-';
    console.log(`${String(u.rank).padStart(5)}  ${String(u.score).padStart(5)}   ${div.padEnd(6)}  ${pad(u.programmingLanguage || '-', 11)}  ${String(u.agentId).padStart(8)}  ${u.pseudo}`);
  }
  console.log('league x/6 = division index (6/6 = Legend). Next: node tools/cg-replay.js battles <player>');
}
async function cmdBattles(who, opts) {
  const puzzle = opts.puzzle || 'ocean-of-code';
  const u = await findAgent(puzzle, who);
  if (!u) throw new Error(`no player "${who}" on the ${puzzle} leaderboard`);
  const battles = await cg('gamesPlayersRanking/findLastBattlesByAgentId', [u.agentId, null]);
  console.log(`${u.pseudo}: rank ${u.rank} on ${puzzle} (score ${u.score}, ${u.programmingLanguage}, agent ${u.agentId}); ${battles.length} recent games of the current submission`);
  const rows = [];
  for (const b of battles) {
    const me = b.players.find(p => p.playerAgentId === u.agentId), opp = b.players.filter(p => p !== me);
    if (!me) continue;
    // "position" is the finishing place (0 = first)
    const res = !b.done ? 'running' : opp.every(o => o.position === me.position) ? 'draw' : opp.every(o => me.position < o.position) ? 'win' : 'loss';
    const place = b.players.length > 2 && b.done ? ` ${me.position + 1}/${b.players.length}` : '';
    rows.push({ id: b.gameId, res, place, opp: opp.map(o => o.nickname).join(', ') });
  }
  const shown = rows.filter(r => !opts.losses || r.res === 'loss').slice(0, Number(opts.last) || 20);
  for (const r of shown) console.log(`  ${String(r.id).padEnd(10)} ${(r.res + r.place).padEnd(9)} vs ${pad(r.opp, 24)} https://www.codingame.com/replay/${r.id}`);
  const w = rows.filter(r => r.res === 'win').length, l = rows.filter(r => r.res === 'loss').length;
  console.log(`  record in this list: ${w} wins, ${l} losses, ${rows.length - w - l} other`);
  return { agent: u, rows: shown };
}

// ---------------------------------------------------------------- main
function parseArgs(argv) {
  const opts = {}, pos = [];
  const flags = new Set(['refresh', 'json', 'losses', 'stderr']);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { const k = argv[i].slice(2); opts[k] = flags.has(k) ? true : argv[++i]; }
    else pos.push(argv[i]);
  }
  return { opts, pos };
}
function usage() {
  console.log('usage:');
  console.log('  node tools/cg-replay.js <replay url | game id | file.json> [...] [--turns all|key|none|A-B] [--player <name|0|1>]');
  console.log('                          [--league wood2|wood1|bronze] [--refresh] [--stderr] [--json] [--events out-{id}.json]');
  console.log('  node tools/cg-replay.js battles <codingamer> [--puzzle ocean-of-code] [--last 20] [--losses] [--fetch N]');
  console.log('  node tools/cg-replay.js top [N] [--puzzle ocean-of-code]');
  console.log('  --turns key   only turns with a shot, sonar, silence, surface, skipped order or damage');
  console.log('  --player      whose patterns to sum up over several replays (name or index)');
  console.log('  --fetch N     battles: import the N listed games and print the statistics and patterns');
  console.log('  --events F    also write the re-simulated game as cg-arena engine events (the format of cli.js --replay)');
  process.exit(1);
}

async function analyse(ref, opts) {
  const rep = await loadReplay(ref, { refresh: !!opts.refresh });
  const isOcean = slug(rep.title) === 'ocean-of-code' || opts.game === 'ocean-of-code'
    || (!rep.title && /island\//.test((rep.gr.frames[0] || {}).view || '') && /sub\.png/.test(JSON.stringify(rep.gr.frames.slice(0, 3).map(f => f.view))));
  if (!isOcean) {
    if (opts.json) console.log(JSON.stringify({ gameId: rep.gameId, title: rep.title, players: rep.names, scores: rep.gr.scores, ranks: rep.gr.ranks }));
    else printGeneric(rep, opts);
    return { rep };
  }
  const sim = simulateOcean(rep, opts);
  if (opts.events) {      // same shape as "node cli.js ... --replay": an array of games, each an array of engine events
    const file = path.resolve(opts.events.replace(/\{id\}/g, rep.gameId));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify([sim.events]));
    if (!opts.json) console.log(`engine events (start/frame/end, ${sim.events.length} events) written to ${file}`);
  }
  if (opts.json) {
    const st = oceanStats(sim);
    console.log(JSON.stringify({ gameId: rep.gameId, players: rep.names, scores: rep.gr.scores, ranks: rep.gr.ranks, seed: sim.seed, checks: sim.checks, stats: st,
      review: sim.review, turns: sim.turns.map(t => ({ turn: t.turn, frame: t.frame, player: t.player, orders: t.raw, pos: t.pos, lives: t.lives, hidden: t.hidden, skipped: t.skipped, error: t.error,
        acts: t.acts.map(a => ({ order: a.command, dmg: a.dmg, sector: a.sector, result: a.result, dir: a.dir, dist: a.dist, at: a.at })) })) }, null, 1));
  } else printOcean(rep, sim, opts);
  return { rep, sim };
}

// one player over several imported Ocean of Code games: summed statistics, then recurring review codes
function printPatterns(done, who) {
  const games = [];
  for (const { rep, sim } of done) {
    if (!sim) continue;
    const side = /^[01]$/.test(String(who)) ? Number(who) : rep.names.findIndex(n => n.toLowerCase() === String(who).toLowerCase());
    if (side < 0) continue;
    const w = winnerOf(rep.gr, sim.result.winner);
    games.push({ rep, sim, side, res: w === null ? 'draw' : w === side ? 'win' : 'loss', st: oceanStats(sim)[side], opp: rep.names[1 - side] });
  }
  if (games.length < 2) return;
  const name = /^[01]$/.test(String(who)) ? `P${who}` : who;
  const sum = f => games.reduce((n, g) => n + f(g), 0);
  const hits = games.flatMap(g => g.st.hitsTaken.filter(h => h.victimHidIn !== null));
  const hid = games.flatMap(g => g.sim.exposure.series[g.side]);
  console.log(`\n${name} over ${games.length} imported games: ${games.filter(g => g.res === 'win').length} wins, ${games.filter(g => g.res === 'loss').length} losses`);
  for (const g of games) console.log(`  ${String(g.rep.gameId).padEnd(10)} ${g.res.padEnd(5)} vs ${pad(g.opp, 16)} lives ${livesText(g.rep.gr.scores)}  turns ${g.st.rounds}  dealt ${g.st.torp.dealt + g.st.mine.dealt}  taken ${g.st.taken.torpedo + g.st.taken.mine + g.st.taken.own + g.st.taken.surface}`);
  const line = (label, text) => console.log(`  ${label.padEnd(38)}${text}`);
  line('torpedoes fired / hit / direct', `${sum(g => g.st.torp.fired)} / ${sum(g => g.st.torp.hit)} / ${sum(g => g.st.torp.direct)} (${pct(sum(g => g.st.torp.hit), sum(g => g.st.torp.fired))} hit)`);
  line('mines dropped / triggered / hit', `${sum(g => g.st.mine.dropped)} / ${sum(g => g.st.mine.triggered)} / ${sum(g => g.st.mine.hit)}`);
  line('sonar / silence / surface per game', [g => g.st.sonar.used, g => g.st.silence.used, g => g.st.surface.count].map(f => (sum(f) / games.length).toFixed(1)).join(' / '));
  line('damage taken: torp/mine/own/surf', ['torpedo', 'mine', 'own', 'surface'].map(k => sum(g => g.st.taken[k])).join('/'));
  line('hidden: median cells (all turns)', median(hid) === null ? '-' : String(median(hid)));
  line('turns located to 1 cell', `${hid.filter(n => n <= 1).length} of ${hid.length} (${pct(hid.filter(n => n <= 1).length, hid.length)})`);
  line('hits taken while hidden in <=2 cells', hits.length ? `${hits.filter(h => h.victimHidIn <= 2).length} of ${hits.length}` : '-');
  let summarize = null;
  try { ({ summarizePatterns: summarize } = require(path.join(ROOT, 'server', 'engine', 'match.js'))); } catch { /* engine not loadable: skip */ }
  if (!summarize) return;
  const list = summarize(games.map(g => ({ review: g.sim.review, side: g.side, label: `${g.rep.gameId}${g.res === 'loss' ? ' (lost)' : ''}` }))).filter(p => p.games >= 2).slice(0, 10);
  console.log(`patterns (review codes seen in 2+ of these games)`);
  if (!list.length) console.log('  none');
  for (const p of list) console.log(`  ${pad(p.kind, 8)} ${pad(p.code, 18)} ${p.games}/${games.length} games  e.g. ${p.labels.slice(0, 4).join(', ')}\n           ${p.example}`);
}

async function main(argv = process.argv.slice(2)) {
  const { opts, pos } = parseArgs(argv);
  if (!pos.length) usage();
  if (pos[0] === 'top') return cmdTop(Number(pos[1]) || 20, opts.puzzle || 'ocean-of-code');
  if (pos[0] === 'battles') {
    if (!pos[1]) usage();
    const { agent, rows } = await cmdBattles(pos[1], opts);
    const n = Number(opts.fetch) || 0;
    if (!n) return;
    const done = [];
    for (const r of rows.slice(0, n)) {
      console.log('\n' + '='.repeat(100));
      try { done.push(await analyse(String(r.id), { ...opts, turns: opts.turns || 'none' })); } catch (e) { console.log(`game ${r.id}: ${e.message}`); }
      await sleep(500);
    }
    printPatterns(done, agent.pseudo);
    return;
  }
  const done = [];
  for (let i = 0; i < pos.length; i++) {
    if (i) { console.log('\n' + '='.repeat(100)); await sleep(300); }
    try { done.push(await analyse(pos[i], opts)); } catch (e) { console.error(`${pos[i]}: ${e.message}`); process.exitCode = 1; }
  }
  if (opts.player !== undefined) printPatterns(done, opts.player);
}

// For the server: a CodinGame replay as cg-arena engine events, ready for the web viewer's loadReplay().
// Local files are refused unless opts.allowFiles, so a web request can only name a game id or a replay link.
async function importEvents(ref, opts = {}) {
  if (!opts.allowFiles && parseRef(ref).file) throw new Error('expected a CodinGame replay link or game id');
  const rep = await loadReplay(ref, opts);
  if (slug(rep.title) !== 'ocean-of-code' && opts.game !== 'ocean-of-code') throw new Error(`${rep.title || 'this game'}: only Ocean of Code replays can be re-simulated so far`);
  const sim = simulateOcean(rep, opts);
  return { gameId: rep.gameId, players: rep.names, checks: sim.checks, events: sim.events, stats: oceanStats(sim) };
}

if (require.main === module) main().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { main, loadReplay, simulateOcean, oceanStats, trackExposure, oceanView, importEvents };
