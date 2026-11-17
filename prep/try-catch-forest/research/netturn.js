'use strict';
const { eachGame, pc, preyOf } = require('./lib/load');
const H = {}, C = {};
eachGame(g => { for (let t = 1; t <= g.turns; t++) for (const n of g.T[t].nets) { const k = t <= 6 ? 'turn ' + t : t <= 15 ? 'turns 7-15' : t <= 40 ? 'turns 16-40' : 'turns 41+'; const h = H[k] = H[k] || { n: 0, y: 0, conv: 0, prey: 0 }; h.n++; if (n.units.some(v => g.owner(v) !== n.owner)) h.y++; for (const v of n.units) if (g.owner(v) === preyOf(n.owner)) { h.prey++; if (g.caught[v] > t && g.caught[v] <= t + 4) h.conv++; } } });
for (const k of Object.keys(H).sort((a, b) => parseInt(a.replace(/\D+/, '')) - parseInt(b.replace(/\D+/, '')))) console.log(k.padEnd(12), 'nets', String(H[k].n).padStart(5), ' hit', pc(H[k].y, H[k].n).padStart(4), ' hits on prey converted', pc(H[k].conv, H[k].prey).padStart(4), ' catches per net', (H[k].conv / H[k].n).toFixed(2));
