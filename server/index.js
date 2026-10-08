'use strict';
// Zero-dependency HTTP server: serves the web IDE and streams match events as NDJSON.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { loadGames } = require('../games');
const { availableLanguages } = require('./runner/languages');
const { runMatch } = require('./engine/match');

const PORT = Number(process.env.PORT || 3000);
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
      res.writeHead(200, { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' });
      const emit = ev => res.write(JSON.stringify(ev) + '\n');
      try {
        const seed = String(body.seed === undefined || body.seed === '' ? 1 : body.seed).trim();
        await runMatch({
          gameDef, players: body.players, seed: /^[+-]?\d{1,15}$/.test(seed) ? Number(seed) : seed,
          league: body.league || null,
          timeoutMultiplier: Math.max(0.1, Number(body.timeoutMultiplier) || 1),
          workRoot: WORK, emit,
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

server.listen(PORT, () => {
  console.log(`cg-arena running on http://localhost:${PORT}`);
  console.log(`games: ${Object.keys(games).join(', ')}`);
  console.log(`languages: ${availableLanguages().map(l => l.id).join(', ')}`);
});
