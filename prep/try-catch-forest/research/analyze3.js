'use strict';
// Finer patterns: net accuracy by distance and turn, where catches happen, eliminations, dashes into catches, messages.
const fs = require('fs');
const path = require('path');
const DIR = path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg', 'games');
const P = s => (s.match(/\((-?\d+), (-?\d+)\)/g) || []).map(x => x.slice(1, -1).split(', ').map(Number));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const pc = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
const bucket = {}, byTurn = {}, catchR = [], msgs = new Map();
let catches = 0, catcherDashed = 0, victimNetted = 0, victimDashedSameTurn = 0, ownNet = 0, netsAll = 0;
let elimGames = 0, elimPredWins = 0, elimThirdWins = 0, elimSelfWins = 0, elimTurn = [];
let firstBlood = { n: 0, won: 0, last: 0 }, firstLoss = { n: 0, won: 0, last: 0 };
const ghostCmd = { same: 0, moved: 0 };
const decoy = { deployed: 0, netted: 0, destroyed: 0 };
const afterFirstLossPlace = [0, 0, 0];
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.json'))) {
  let g; try { g = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch { continue; }
  if (!g.frames || !g.ranking) continue;
  const turnOf = fr => Math.ceil(fr.frame / 3);
  let units = 0; const dashAt = new Set(), nettedAt = new Map(), lossCount = [0, 0, 0]; let first = null; let elim = null;
  for (const fr of g.frames) {
    const turn = turnOf(fr);
    if (fr.stdout && fr.agent !== undefined) {
      const name = g.agents[fr.agent].name;
      for (const c of fr.stdout.split(';')) { const m = c.trim().match(/^(MOVE|DASH)\s+(\d+)\s+(-?\d+)\s+(-?\d+)\s+(.+)$/); if (m) { const s = msgs.get(name) || new Map(); const k = m[5].replace(/\d+/g, '#').slice(0, 28); s.set(k, (s.get(k) || 0) + 1); msgs.set(name, s); } }
      if (turn === 1) units = Math.max(units, (fr.stdout.match(/(?:MOVE|DASH) \d+/g) || []).length);
    }
    for (const line of (fr.summary || '').split('\n').map(l => l.trim()).filter(Boolean)) {
      let m;
      if ((m = line.match(/^\$(\d)'s agent (\d+) dashes from/))) dashAt.add(m[2] + '@' + turn);
      else if ((m = line.match(/^\$(\d)'s agent (\d+) at .* throws a net at/))) {
        const p = P(line); netsAll++;
        const aim = p.length >= 3 ? p[2] : p[1]; const d = dist(p[0], aim);
        const hit = /and nets \$\d's agent/.test(line); const h = line.match(/and nets \$(\d)'s agent (\d+)/);
        if (h && h[1] === m[1]) ownNet++;
        const k = Math.min(1750, Math.floor(d / 250) * 250); const b = bucket[k] = bucket[k] || { n: 0, hit: 0, decoy: 0, tree: 0 };
        b.n++; if (hit && (!h || h[1] !== m[1])) b.hit++; if (/nets \$\d's decoy/.test(line)) b.decoy++; if (/stopped by tree/.test(line)) b.tree++;
        const tk = turn <= 2 ? '1-2' : turn <= 5 ? '3-5' : turn <= 15 ? '6-15' : turn <= 40 ? '16-40' : '41+'; const t = byTurn[tk] = byTurn[tk] || { n: 0, hit: 0 }; t.n++; if (hit && (!h || h[1] !== m[1])) t.hit++;
        if (h) nettedAt.set(+h[2], turn);
      } else if ((m = line.match(/^\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+) at/))) {
        catches++; const p = P(line)[0]; catchR.push(Math.hypot(p[0], p[1]));
        if (dashAt.has(m[2] + '@' + turn)) catcherDashed++;
        if (dashAt.has(m[4] + '@' + turn)) victimDashedSameTurn++;
        if (nettedAt.has(+m[4]) && turn - nettedAt.get(+m[4]) <= 4) victimNetted++;
        if (!first) { first = { by: +m[1], victim: +m[3] }; }
        lossCount[+m[3]]++;
        if (!elim && units && lossCount[+m[3]] >= units) elim = { seat: +m[3], turn };
      } else if (/deploys a decoy/.test(line)) decoy.deployed++;
      else if (/and nets \$\d's decoy/.test(line)) decoy.netted++;
      if (/destroys \$\d's decoy/.test(line)) decoy.destroyed++;
    }
  }
  if (first) {
    firstBlood.n++; if (g.ranking[0] === first.by) firstBlood.won++; if (g.ranking[2] === first.by) firstBlood.last++;
    firstLoss.n++; if (g.ranking[0] === first.victim) firstLoss.won++; if (g.ranking[2] === first.victim) firstLoss.last++;
    afterFirstLossPlace[g.ranking.indexOf(first.victim)]++;
  }
  if (elim) { elimGames++; elimTurn.push(elim.turn); const pred = (elim.seat + 2) % 3, third = (elim.seat + 1) % 3; if (g.ranking[0] === pred) elimPredWins++; else if (g.ranking[0] === third) elimThirdWins++; else elimSelfWins++; }
}
console.log('net result by aim distance (bucket start): ' + Object.entries(bucket).sort((a, b) => a[0] - b[0]).map(([k, b]) => `${k}: n=${b.n} hit ${pc(b.hit, b.n)} decoy ${pc(b.decoy, b.n)} tree ${pc(b.tree, b.n)}`).join(' | '));
console.log('net hit rate by turn: ' + Object.entries(byTurn).map(([k, b]) => `${k}: ${pc(b.hit, b.n)} of ${b.n}`).join(' | '));
console.log(`nets that caught the thrower's own unit: ${ownNet} of ${netsAll}`);
const rs = catchR.sort((a, b) => a - b); const share = lo => pc(rs.filter(r => r >= lo).length, rs.length);
console.log(`catch position, distance from centre: median ${Math.round(rs[rs.length >> 1])}; beyond 6000: ${share(6000)}; beyond 7000: ${share(7000)}; inside 3000: ${pc(rs.filter(r => r < 3000).length, rs.length)}`);
console.log(`first catch of the game: the catcher wins ${pc(firstBlood.won, firstBlood.n)}, finishes last ${pc(firstBlood.last, firstBlood.n)}; the first victim wins ${pc(firstLoss.won, firstLoss.n)}, finishes last ${pc(firstLoss.last, firstLoss.n)}`);
console.log(`games with a team eliminated: ${elimGames}; median turn ${elimTurn.sort((a, b) => a - b)[elimTurn.length >> 1]}; winner = its hunter ${pc(elimPredWins, elimGames)}, the third team ${pc(elimThirdWins, elimGames)}, the eliminated team itself ${pc(elimSelfWins, elimGames)}`);
console.log('\nunit labels used by teams (most common):');
for (const [name, m] of [...msgs.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, 14)) console.log('  ' + name.padEnd(24) + [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 9).map(([k, v]) => `${k} (${v})`).join(', '));
