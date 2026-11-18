'use strict';
// Archives everything from the Gold league that the local arena will need after the API closes:
// the full leaderboard (all rows, not only the first 200), the battle lists of the top teams and
// the game logs of their recent battles, plus the statement and the stub generator.
// usage: node archive_fetch.js [TOP=30] [PER=150] [MAX=2500]
// Writes to ARCHIVE (default E:/cg-tmp/tcf/archive, outside the repository, not committed).
// Reads the API token from ~/.config/codingame/token; never prints it. Polite: about one request per second.
const fs = require('fs');
const path = require('path');
const os = require('os');

const API = 'https://www.codingame.com/api/v1';
const ID = 'unleash-the-geek-2026-opp35';
const ARCHIVE = process.env.ARCHIVE || 'E:/cg-tmp/tcf/archive';
const TOP = Number(process.argv[2]) || 30, PER = Number(process.argv[3]) || 150, MAX = Number(process.argv[4]) || 2500;
const token = fs.readFileSync(path.join(os.homedir(), '.config', 'codingame', 'token'), 'utf8').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(p) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const r = await fetch(API + p, { headers: { Authorization: 'Bearer ' + token } });
    if (r.status === 429) { const w = Number(r.headers.get('retry-after')) || 20; console.log('rate limited, waiting', w); await sleep((w + 1) * 1000); continue; }
    return { status: r.status, text: await r.text() };
  }
  return { status: 429, text: '' };
}

(async () => {
  const games = path.join(ARCHIVE, 'games');
  fs.mkdirSync(games, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.mkdirSync(path.join(ARCHIVE, 'snapshots'), { recursive: true });

  // 1. statement, stub, progress, submissions of ours, the whole leaderboard
  for (const [name, p] of [['challenge', `/challenges/${ID}`], ['stub', `/challenges/${ID}/stub-generator`], ['opponents', `/challenges/${ID}/opponents`]]) {
    const r = await api(p);
    if (r.status === 200) fs.writeFileSync(path.join(ARCHIVE, `${name}-${stamp}.json`), r.text);
    await sleep(700);
  }
  const rows = [];
  let total = null, me = null;
  for (let off = 0; off < 1000; off += 100) {
    const r = await api(`/challenges/${ID}/leaderboard?limit=100&offset=${off}`);
    if (r.status !== 200) break;
    const d = JSON.parse(r.text); total = d.total; me = d.me || me;
    if (!d.rows || d.rows.length === 0) break;
    rows.push(...d.rows);
    if (rows.length >= (total || 0)) break;
    await sleep(700);
  }
  fs.writeFileSync(path.join(ARCHIVE, 'snapshots', `leaderboard-${stamp}.json`), JSON.stringify({ total, me, rows }, null, 1));
  console.log('leaderboard rows', rows.length, 'of', total);

  // 2. battle lists of the top teams, then their game logs
  const want = new Map();
  for (const row of rows.slice(0, TOP)) {
    const r = await fetch('https://www.codingame.com/services/gamesPlayersRanking/findLastBattlesByAgentId', { method: 'POST', headers: { 'Content-Type': 'application/json;charset=UTF-8' }, body: JSON.stringify([row.agent_id, null]) });
    const list = r.ok ? await r.json() : [];
    const done = list.filter(g => g.done).slice(0, PER);
    for (const g of done) want.set(g.gameId, (want.get(g.gameId) || 0) + 1);
    fs.writeFileSync(path.join(ARCHIVE, 'snapshots', `battles-${row.rank}-${row.agent_id}.json`), JSON.stringify(list));
    console.log(`#${row.rank} ${row.nickname} (${row.language}, ${row.league}): ${list.length} battles, ${done.length} kept`);
    await sleep(900);
  }
  const ids = [...want.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]).slice(0, MAX).map(e => e[0]);
  console.log('distinct games', want.size, 'to download', ids.length);
  let got = 0, skipped = 0, failed = 0;
  for (const id of ids) {
    const f = path.join(games, id + '.json');
    if (fs.existsSync(f)) { skipped++; continue; }
    const r = await api(`/games/${id}?format=json`);
    if (r.status === 200) { fs.writeFileSync(f, r.text); got++; } else { failed++; if (failed < 4) console.log('game', id, 'status', r.status, r.text.slice(0, 120)); }
    await sleep(650);
  }
  console.log(`games: ${got} downloaded, ${skipped} already archived, ${failed} failed`);
})().catch(e => { console.error(e.message); process.exit(1); });
