'use strict';
// Read-only fetcher for the mimic study (Try Catch Forest, Unleash the Geek 2026).
//   node mimic_fetch.js lb                      leaderboard -> <MIMIC>/leaderboard.json, prints the top 15
//   node mimic_fetch.js battles <agentId> ...   battle lists -> <MIMIC>/battles_<agentId>.json (one request each)
//   node mimic_fetch.js games <agentId> [max]   downloads the missing game logs of that list into <GAMES>
// Only GET /leaderboard, GET /games/<id> and the public battle list are called: never a test game or a submission.
// About one request per second. The token is read from the token file and never printed.
const fs = require('fs'), path = require('path'), os = require('os');
const API = 'https://www.codingame.com/api/v1';
const ID = 'unleash-the-geek-2026-opp35';
const MIMIC = process.env.MIMIC_DIR || 'E:/cg-tmp/tcf/mimic';
const GAMES = process.env.GAMES_DIR || 'E:/cg-tmp/tcf/goldtop/utg/games';
const OLD = 'E:/cg-tmp/cgskill/utg/games';
const token = fs.readFileSync(path.join(os.homedir(), '.config', 'codingame', 'token'), 'utf8').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(p) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(API + p, { headers: { Authorization: 'Bearer ' + token } });
    if (r.status === 429) { const w = Number(r.headers.get('retry-after')) || 20; console.log('rate limited, waiting', w); await sleep((w + 1) * 1000); continue; }
    return { status: r.status, text: await r.text() };
  }
  return { status: 429, text: '' };
}
async function battles(agentId) {
  const r = await fetch('https://www.codingame.com/services/gamesPlayersRanking/findLastBattlesByAgentId', { method: 'POST', headers: { 'Content-Type': 'application/json;charset=UTF-8' }, body: JSON.stringify([agentId, null]) });
  return r.ok ? await r.json() : [];
}
(async () => {
  fs.mkdirSync(MIMIC, { recursive: true });
  const mode = process.argv[2];
  if (mode === 'lb') {
    const rows = [];
    for (const off of [0, 100, 200, 300]) { const r = await api(`/challenges/${ID}/leaderboard?limit=100&offset=${off}`); const got = (JSON.parse(r.text).rows || []); rows.push(...got); await sleep(1000); if (got.length < 100) break; }
    fs.writeFileSync(path.join(MIMIC, 'leaderboard.json'), JSON.stringify(rows, null, 1));
    console.log('rows', rows.length);
    for (const r of rows.slice(0, 15)) console.log(r.rank, r.nickname, r.agent_id, r.score, r.league, r.language, r.percentage);
  } else if (mode === 'battles') {
    for (const a of process.argv.slice(3).map(Number)) {
      const list = await battles(a);
      fs.writeFileSync(path.join(MIMIC, `battles_${a}.json`), JSON.stringify(list));
      console.log(a, 'battles', list.length, 'done', list.filter(g => g.done).length);
      await sleep(1000);
    }
  } else if (mode === 'games') {
    const a = Number(process.argv[3]), max = Number(process.argv[4]) || 200;
    const list = JSON.parse(fs.readFileSync(path.join(MIMIC, `battles_${a}.json`), 'utf8')).filter(g => g.done).slice(0, max);
    let got = 0, have = 0, failed = 0;
    for (const g of list) {
      const f = path.join(GAMES, g.gameId + '.json');
      if (fs.existsSync(f) || fs.existsSync(path.join(OLD, g.gameId + '.json'))) { have++; continue; }
      const r = await api(`/games/${g.gameId}?format=json`);
      if (r.status === 200) { fs.writeFileSync(f, r.text); got++; } else { failed++; if (failed < 4) console.log('game', g.gameId, 'status', r.status, r.text.slice(0, 120)); }
      await sleep(1000);
    }
    console.log(a, `games: ${got} downloaded, ${have} already there, ${failed} failed`);
  } else console.log('usage: lb | battles <agentId>... | games <agentId> [max]');
})().catch(e => { console.error(e.message); process.exit(1); });
