'use strict';
// Zero-dependency HTTP server: serves the web IDE and streams match events as NDJSON.
// Runs arbitrary bot code on purpose, so it binds to localhost and refuses cross-site requests.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { loadGames } = require('../games');
const { availableLanguages, interpreterInfo } = require('./runner/languages');
const { runMatch, workRoot, sweepWorkRoot, isSeed } = require('./engine/match');
const arena = require('./arena');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';   // set HOST=0.0.0.0 only on purpose: anyone reaching the port can run code here
const MAX_ACTIVE = Math.max(1, Number(process.env.CG_ARENA_MAX_ACTIVE || 2));   // concurrent matches/arena runs
const WEB = path.join(__dirname, '..', 'web');
const WORK = workRoot();
const games = loadGames();
let active = 0;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.md': 'text/markdown', '.png': 'image/png', '.svg': 'image/svg+xml' };

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

// Collect the whole body as bytes and decode once (a multibyte character can straddle two chunks).
function readBody(req, limit = 5e6) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => { chunks.push(c); size += c.length; if (size > limit) { reject(new Error('request body too large')); req.destroy(); } });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// Same-site guard: every API POST must be JSON (which forces a CORS preflight that we do not answer)
// and, when the browser sends an Origin, it must be this server. Otherwise a page on any website
// could POST a bot as text/plain and have it executed here.
function sameSite(req) {
  const ct = String(req.headers['content-type'] || '');
  if (!/^application\/json/i.test(ct)) return 'POST requests must use Content-Type: application/json';
  const origin = req.headers.origin;
  if (origin) {
    let ok = false;
    try { const u = new URL(origin); ok = ['localhost', '127.0.0.1', '[::1]', HOST].includes(u.hostname) && Number(u.port || 80) === PORT; } catch {}
    if (!ok) return `cross-site request refused (origin ${origin})`;
  }
  const site = req.headers['sec-fetch-site'];
  if (site && site !== 'same-origin' && site !== 'none') return `cross-site request refused (${site})`;
  return null;
}

async function jsonBody(req, res) {
  const refuse = sameSite(req);
  if (refuse) { send(res, 403, { error: refuse }); return null; }
  try { return JSON.parse(await readBody(req) || '{}'); }
  catch (e) { send(res, e.message.includes('too large') ? 413 : 400, { error: e.message }); return null; }
}

// NDJSON stream + an AbortSignal that fires when the browser disconnects (Stop button, closed tab).
// Note: on Node >= 16 the *request* emits 'close' once its body is consumed, so we watch the response.
function stream(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' });
  const ctrl = new AbortController();
  res.on('close', () => { if (!res.writableFinished) ctrl.abort(); });
  const emit = ev => { if (!res.writableEnded) res.write(JSON.stringify(ev) + '\n'); };
  return { emit, signal: ctrl.signal };
}

function serveStatic(res, file) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'not found', 'text/plain');
  send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
}

const gameOr400 = (res, id) => { const g = games[id]; if (!g) send(res, 400, { error: `unknown game "${id}"` }); return g; };

async function withSlot(res, fn) {
  if (active >= MAX_ACTIVE) return send(res, 429, { error: `${MAX_ACTIVE} matches are already running; stop one or wait` });
  active++;
  try { await fn(); } finally { active--; }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/api/games') {
      return send(res, 200, {
        languages: availableLanguages(),
        games: Object.values(games).map(g => ({
          id: g.id, name: g.name, url: g.url, kind: g.kind, type: g.type, statement: g.statement, starters: g.starters,
          bosses: g.bosses.map(b => ({ id: b.id, name: b.name })),
          leagues: g.leagues,
          tests: g.tests.map(t => ({ id: t.id, name: t.name })),
          hasGenerator: !!g.generator,
          hasOriginal: !!g.originalStatementPath,
          meta: g.Referee.meta,
        })),
      });
    }
    if (url.pathname === '/api/match' && req.method === 'POST') {
      const body = await jsonBody(req, res); if (!body) return;
      const gameDef = gameOr400(res, body.game); if (!gameDef) return;
      const seed = String(body.seed === undefined || body.seed === '' ? 1 : body.seed).trim();
      if (!isSeed(seed)) return send(res, 400, { error: 'seed must be an integer (up to 20 digits)' });
      let players;
      try {
        players = (body.players || []).map(p => arena.resolvePlayer(gameDef, p));
        if (gameDef.kind === 'solo') gameDef.resolveTest(body.test || null);
      } catch (e) { return send(res, 400, { error: e.message }); }
      return withSlot(res, async () => {
        const { emit, signal } = stream(req, res);
        try {
          await runMatch({ gameDef, players, seed, league: body.league || null, test: body.test || null, timeoutMultiplier: clampMult(body.timeoutMultiplier), workRoot: WORK, emit, signal });
        } catch (e) {
          console.error('[match]', e);
          emit({ type: 'error', message: e.message });
        }
        res.end();
      });
    }
    // original statement saved by "node cli.js fetch" (local copy, shown in a sandboxed iframe)
    if (url.pathname === '/api/statement') {
      const gameDef = gameOr400(res, url.searchParams.get('game')); if (!gameDef) return;
      if (!gameDef.originalStatementPath) return send(res, 404, { error: 'no local copy; run: node cli.js fetch ' + gameDef.id });
      return send(res, 200, fs.readFileSync(gameDef.originalStatementPath), 'text/html; charset=utf-8');
    }
    // ---- saved versions (all kinds) + bosses with Elo ratings and arena runs (multiplayer) ----
    if (url.pathname === '/api/arena/tests' && req.method === 'POST') {   // solo: remember a version's test score
      const body = await jsonBody(req, res); if (!body) return;
      const gameDef = gameOr400(res, body.game); if (!gameDef) return;
      try { arena.recordTests(gameDef, String(body.id), Number(body.passed), Number(body.total)); return send(res, 200, { leaderboard: arena.leaderboard(gameDef) }); }
      catch (e) { return send(res, 400, { error: e.message }); }
    }
    // CodinGame replay -> engine events (re-simulated with our referee), statistics and review
    if (url.pathname === '/api/replay/import' && req.method === 'POST') {
      const body = await jsonBody(req, res); if (!body) return;
      try {
        const { importEvents } = require('../tools/cg-replay');
        const r = await importEvents(String(body.ref || '').trim(), { refresh: !!body.refresh });
        return send(res, 200, r);
      } catch (e) { return send(res, 400, { error: e.message }); }
    }
    if (url.pathname === '/api/arena/source') {
      const gameDef = gameOr400(res, url.searchParams.get('game')); if (!gameDef) return;
      try { return send(res, 200, arena.getSource(gameDef, String(url.searchParams.get('id')))); }
      catch (e) { return send(res, 404, { error: e.message }); }
    }
    if (url.pathname === '/api/arena/pool') {
      const gameDef = gameOr400(res, url.searchParams.get('game')); if (!gameDef) return;
      return send(res, 200, { leaderboard: arena.leaderboard(gameDef) });
    }
    if (url.pathname === '/api/arena/submit' && req.method === 'POST') {
      const body = await jsonBody(req, res); if (!body) return;
      const gameDef = gameOr400(res, body.game); if (!gameDef) return;
      try { return send(res, 200, { entry: arena.submit(gameDef, body), leaderboard: arena.leaderboard(gameDef) }); }
      catch (e) { return send(res, 400, { error: e.message }); }
    }
    if (url.pathname === '/api/arena/delete' && req.method === 'POST') {
      const body = await jsonBody(req, res); if (!body) return;
      const gameDef = gameOr400(res, body.game); if (!gameDef) return;
      try { arena.remove(gameDef, String(body.id)); return send(res, 200, { leaderboard: arena.leaderboard(gameDef) }); }
      catch (e) { return send(res, 400, { error: e.message }); }
    }
    if (url.pathname === '/api/arena/run' && req.method === 'POST') {
      const body = await jsonBody(req, res); if (!body) return;
      const gameDef = gameOr400(res, body.game); if (!gameDef) return;
      if (gameDef.kind === 'solo') return send(res, 400, { error: `${gameDef.name} is a solo puzzle: run its test cases instead of the arena` });
      const seed = String(body.seed === undefined || body.seed === '' ? 1 : body.seed).trim();
      if (!isSeed(seed)) return send(res, 400, { error: 'seed must be an integer (up to 20 digits)' });
      return withSlot(res, async () => {
        const { emit, signal } = stream(req, res);
        try {
          await arena.runArena({ gameDef, candidate: body.candidate, opponents: body.opponents, games: body.games, seed, league: body.league || null, timeoutMultiplier: clampMult(body.timeoutMultiplier), emit, signal });
        } catch (e) {
          console.error('[arena]', e);
          emit({ type: 'error', message: e.message });
        }
        res.end();
      });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 404, { error: 'not found' });
    const m = url.pathname.match(/^\/games\/([\w-]+)\/viewer\.js$/);
    if (m && games[m[1]]) return serveStatic(res, games[m[1]].viewerPath);
    const file = path.join(WEB, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!file.startsWith(WEB)) return send(res, 403, 'forbidden', 'text/plain');
    return serveStatic(res, file);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: e.message });
    else res.end();
  }
});
const clampMult = v => Math.min(100, Math.max(0.1, Number(v) || 1));

sweepWorkRoot(WORK);
server.on('error', e => {
  if (e.code === 'EADDRINUSE') console.error(`port ${PORT} is already in use (another cg-arena running?). Start with PORT=3001 to use a different one.`);
  else console.error(e);
  process.exit(1);
});
server.listen(PORT, HOST, () => {
  console.log(`cg-arena running on http://localhost:${PORT}` + (HOST !== '127.0.0.1' ? ` (bound to ${HOST}: anyone who can reach this port can run code on this machine)` : ''));
  console.log(`games: ${Object.keys(games).join(', ')}`);
  console.log(`languages: ${availableLanguages().map(l => l.id).join(', ')}  (${interpreterInfo()})`);
});
