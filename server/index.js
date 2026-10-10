'use strict';
// Zero-dependency HTTP server: serves the web IDE and streams match events as NDJSON.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { loadGames } = require('../games');
const { availableLanguages } = require('./runner/languages');
const { runMatch } = require('./engine/match');
const arena = require('./arena');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';   // this server runs arbitrary code: localhost only unless HOST=0.0.0.0 is set on purpose
const WEB = path.join(__dirname, '..', 'web');
const { workRoot } = require('./engine/match');
const WORK = workRoot();
const games = loadGames();

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.md': 'text/markdown', '.png': 'image/png', '.svg': 'image/svg+xml' };

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 5e6) req.destroy(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

// NDJSON stream + an AbortSignal that fires when the browser disconnects (Stop button, closed tab),
// so the match/arena loop stops feeding the bots instead of running to the end unseen.
function stream(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' });
  const ctrl = new AbortController();
  req.on('close', () => { if (!res.writableFinished) ctrl.abort(); });
  const emit = ev => { if (!res.writableEnded) res.write(JSON.stringify(ev) + '\n'); };
  return { emit, signal: ctrl.signal };
}

function serveStatic(res, file) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, 'not found', 'text/plain');
  send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/api/games') {
      return send(res, 200, {
        languages: availableLanguages(),
        games: Object.values(games).map(g => ({
          id: g.id, name: g.name, statement: g.statement, starters: g.starters,
          bosses: g.bosses.map(b => ({ id: b.id, name: b.name })),
          leagues: g.leagues,
          meta: g.Referee.meta,
        })),
      });
    }
    if (url.pathname === '/api/match' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req) || '{}');
      const gameDef = games[body.game];
      if (!gameDef) return send(res, 400, { error: 'unknown game' });
      const { emit, signal } = stream(req, res);
      try {
        const seed = String(body.seed === undefined || body.seed === '' ? 1 : body.seed).trim();
        const players = (body.players || []).map(p => arena.resolvePlayer(gameDef, p));
        await runMatch({
          gameDef, players, seed: /^[+-]?\d{1,15}$/.test(seed) ? Number(seed) : seed,
          league: body.league || null,
          timeoutMultiplier: Math.max(0.1, Number(body.timeoutMultiplier) || 1),
          workRoot: WORK, emit, signal,
        });
      } catch (e) {
        emit({ type: 'error', message: e.message });
      }
      return res.end();
    }
    // ---- arena pool: saved versions + bosses with Elo ratings ----
    if (url.pathname === '/api/arena/pool') {
      const gameDef = games[url.searchParams.get('game')];
      if (!gameDef) return send(res, 400, { error: 'unknown game' });
      return send(res, 200, { leaderboard: arena.leaderboard(gameDef) });
    }
    if (url.pathname === '/api/arena/submit' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req) || '{}');
      const gameDef = games[body.game];
      if (!gameDef) return send(res, 400, { error: 'unknown game' });
      try { return send(res, 200, { entry: arena.submit(gameDef, body), leaderboard: arena.leaderboard(gameDef) }); }
      catch (e) { return send(res, 400, { error: e.message }); }
    }
    if (url.pathname === '/api/arena/delete' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req) || '{}');
      const gameDef = games[body.game];
      if (!gameDef) return send(res, 400, { error: 'unknown game' });
      try { arena.remove(gameDef, String(body.id)); return send(res, 200, { leaderboard: arena.leaderboard(gameDef) }); }
      catch (e) { return send(res, 400, { error: e.message }); }
    }
    if (url.pathname === '/api/arena/run' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req) || '{}');
      const gameDef = games[body.game];
      if (!gameDef) return send(res, 400, { error: 'unknown game' });
      const { emit, signal } = stream(req, res);
      try {
        await arena.runArena({
          gameDef, candidate: body.candidate, opponents: body.opponents, games: body.games,
          seed: Number(body.seed) || 1, league: body.league || null,
          timeoutMultiplier: Math.max(0.1, Number(body.timeoutMultiplier) || 1), emit, signal,
        });
      } catch (e) {
        emit({ type: 'error', message: e.message });
      }
      return res.end();
    }
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

server.listen(PORT, HOST, () => {
  console.log(`cg-arena running on http://localhost:${PORT}` + (HOST !== '127.0.0.1' ? ` (bound to ${HOST}: anyone who can reach this port can run code on this machine)` : ''));
  console.log(`games: ${Object.keys(games).join(', ')}`);
  console.log(`languages: ${availableLanguages().map(l => l.id).join(', ')}`);
});
