// usage: node localdeaths.js <out.jsonl> <version> <games> <first seed>
// Plays <version> in seat 0 on the cg-arena referee against two fixed pairs of our bots and writes one line per unit it loses,
// with the true positions: was the unit held, could it dash, did it dash, did the catcher dash, did we SEE the catcher at the
// start of that turn and the turn before, how far it was, how far our unit really moved against what it ordered.
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..', '..');
const { loadGames } = require(path.join(ROOT, 'games'));
const { runMatch, workRoot } = require(path.join(ROOT, 'server', 'engine', 'match'));
const V = path.join(__dirname, '..', 'versions');
const [out, ver, n, seed0] = [process.argv[2], process.argv[3], +process.argv[4], +process.argv[5]];
const OPP = [['vgo_b', 'v10'], ['v10', 'vgo_b'], ['vlive_41748059', 'vgo_b'], ['v16', 'vlive_41748059']];
const spec = name => ({ type: 'user', lang: 'java', source: fs.readFileSync(path.join(V, name + '.java'), 'utf8'), name });
const hyp = Math.hypot;
(async () => {
  const games = loadGames(); const gameDef = (Array.isArray(games) ? games : Object.values(games)).find(g => g.id === 'try-catch-forest');
  for (let k = 0; k < n; k++) {
    const seed = seed0 + k, opp = OPP[k % OPP.length]; let prev = null; const hist = []; let turn = 0;
    const emit = ev => {
      if (ev.type !== 'frame') return;
      turn++;
      const me = (ev.actors || []).find(a => a.player === 0); const fr = ev.frame;
      const input = me ? (Array.isArray(me.input) ? me.input.join('\n') : String(me.input || '')) : '', output = me ? (Array.isArray(me.output) ? me.output.join('\n') : String(me.output || '')) : '';
      const seen = new Set(input.split('\n').map(l => l.trim().split(/\s+/)).filter(p => p[1] === 'UNIT').map(p => +p[0]));
      hist.push(seen);
      if (prev) for (const e of fr.events || []) {
        if (e.type !== 'catch') continue;
        const u0 = prev.units.find(u => u.id === e.unit); if (!u0 || u0.owner !== 0) continue;
        const h0 = prev.units.find(u => u.id === e.by), u1 = fr.units.find(u => u.id === e.unit);
        const cmd = output.split(';').map(c => c.trim().split(/\s+/)).find(p => (p[0] === 'MOVE' || p[0] === 'DASH') && +p[1] === e.unit) || [];
        const pw = output.split(';').map(c => c.trim().split(/\s+/)).filter(p => ['NET', 'SMOKE', 'DECOY'].includes(p[0]) && +p[1] === e.unit).map(p => p[0]);
        const preds = prev.units.filter(u => u.owner === 2 && !u.ghost);
        fs.appendFileSync(out, JSON.stringify({ seed, opp, turn, unit: e.unit, held: u0.immob > 0, cd: u0.cd, cmd: cmd[0] || 'none', tag: cmd[4] || '-', pw,
          hunterDashed: (fr.events || []).some(x => x.type === 'dash' && x.by === e.by), d0: Math.round(hyp(u0.x - h0.x, u0.y - h0.y)),
          seenNow: seen.has(e.by), seenPrev: hist.length > 1 && hist[hist.length - 2].has(e.by), hunterCd: h0.cd,
          ordered: cmd.length > 3 ? Math.round(Math.min(cmd[0] === 'DASH' ? 1200 : 600, hyp(+cmd[2] - u0.x, +cmd[3] - u0.y))) : 0,
          toward: cmd.length > 3 ? Math.round(((+cmd[2] - u0.x) * (h0.x - u0.x) + (+cmd[3] - u0.y) * (h0.y - u0.y)) / Math.max(1, hyp(+cmd[2] - u0.x, +cmd[3] - u0.y) * hyp(h0.x - u0.x, h0.y - u0.y)) * 100) : 0,
          r: Math.round(hyp(u0.x, u0.y)), predsIn1700: preds.filter(p => hyp(p.x - u0.x, p.y - u0.y) < 1700).length,
          predsSeenIn1700: preds.filter(p => hyp(p.x - u0.x, p.y - u0.y) < 1700 && seen.has(p.id)).length,
          bt: (Array.isArray(me && me.stderr) ? me.stderr.join(String.fromCharCode(10)) : String((me && me.stderr) || '')).split(String.fromCharCode(10)).filter(l => l.startsWith('BT ' + e.unit + ' ')).join(' ## '), hx: Math.round(h0.x), hy: Math.round(h0.y), ux: Math.round(u0.x), uy: Math.round(u0.y), cx: cmd[2], cy: cmd[3], inCloud: (prev.clouds || []).some(c => hyp(c.x - u0.x, c.y - u0.y) < 1900), hunterInCloud: (prev.clouds || []).some(c => hyp(c.x - h0.x, c.y - h0.y) < 1900) }) + '\n');
      }
      prev = JSON.parse(JSON.stringify({ units: fr.units, clouds: fr.clouds }));
    };
    try { await runMatch({ gameDef, players: [spec(ver), spec(opp[0]), spec(opp[1])], seed, timeoutMultiplier: 40, workRoot: workRoot(), emit }); }
    catch (e) { fs.appendFileSync(out, JSON.stringify({ seed, error: e.message }) + '\n'); }
    fs.appendFileSync(out, JSON.stringify({ seed, game: 1 }) + '\n');
  }
})();
