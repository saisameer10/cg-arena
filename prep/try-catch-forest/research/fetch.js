'use strict';
// Downloads the leaderboard, the battle lists of the top players and a set of game logs (JSON) for
// Unleash the Geek 2026. Reads the API token from the token file; never prints it. Polite: ~1.5 requests/s.
const fs = require('fs');
const path = require('path');
const os = require('os');
const API = 'https://www.codingame.com/api/v1';
const ID = 'unleash-the-geek-2026-opp35';
const OUT = path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg');
const token = fs.readFileSync(path.join(os.homedir(), '.config', 'codingame', 'token'), 'utf8').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TOP = Number(process.argv[2]) || 12, PER = Number(process.argv[3]) || 60, MAX = Number(process.argv[4]) || 320;

async function api(p) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(API + p, { headers: { Authorization: 'Bearer ' + token } });
    if (r.status === 429) { const w = Number(r.headers.get('retry-after')) || 20; console.log('rate limited, waiting', w); await sleep((w + 1) * 1000); continue; }
    return { status: r.status, text: await r.text() };
  }
  return { status: 429, text: '' };
}
(async () => {
  fs.mkdirSync(path.join(OUT, 'games'), { recursive: true });
  const rows = [];
  for (const off of [0, 100]) { const r = await api(`/challenges/${ID}/leaderboard?limit=100&offset=${off}`); rows.push(...(JSON.parse(r.text).rows || [])); await sleep(700); }
  fs.writeFileSync(path.join(OUT, 'leaderboard.json'), JSON.stringify(rows, null, 1));
  console.log('leaderboard rows', rows.length, 'leagues', JSON.stringify(rows.reduce((a, r) => (a[r.league] = (a[r.league] || 0) + 1, a), {})));
  const want = new Map();   // gameId -> number of top players in it
  for (const row of rows.slice(0, TOP)) {
    const r = await fetch('https://www.codingame.com/services/gamesPlayersRanking/findLastBattlesByAgentId', { method: 'POST', headers: { 'Content-Type': 'application/json;charset=UTF-8' }, body: JSON.stringify([row.agent_id, null]) });
    const list = r.ok ? await r.json() : [];
    const done = list.filter(g => g.done).slice(0, PER);
    for (const g of done) want.set(g.gameId, (want.get(g.gameId) || 0) + 1);
    console.log(`#${row.rank} ${row.nickname} (${row.language}, ${row.league}): ${list.length} battles`);
    await sleep(900);
  }
  const ids = [...want.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]).slice(0, MAX).map(e => e[0]);
  console.log('distinct games', want.size, 'downloading', ids.length);
  let got = 0, skipped = 0, failed = 0;
  for (const id of ids) {
    const f = path.join(OUT, 'games', id + '.json');
    if (fs.existsSync(f)) { skipped++; continue; }
    const r = await api(`/games/${id}?format=json`);
    if (r.status === 200) { fs.writeFileSync(f, r.text); got++; } else { failed++; if (failed < 4) console.log('game', id, 'status', r.status, r.text.slice(0, 150)); }
    await sleep(650);
  }
  console.log(`games: ${got} downloaded, ${skipped} already there, ${failed} failed`);
})().catch(e => { console.error(e.message); process.exit(1); });
