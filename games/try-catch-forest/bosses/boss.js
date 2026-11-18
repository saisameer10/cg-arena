// Try Catch Forest bosses: node boss.js wood|bronze|silver. Ordinary bots (stdin/stdout), deterministic.
// wood   = every unit walks at the nearest prey in sight, otherwise patrols a ring;
// bronze = wood + runs from predators (dashing when they are close) and dashes at prey in reach;
// silver = bronze + nets on prey that cannot dodge and on a predator about to arrive, smoke when held.
'use strict';
const level = process.argv[2] || 'wood';
const me = +readline(); readline();
const treeCount = +readline();
for (let i = 0; i < treeCount; i++) readline();
const prey = (me + 1) % 3, pred = (me + 2) % 3;
const hyp = Math.hypot;
let turn = 0;
for (;;) {
  const first = readline();
  if (first === null || first === undefined || first === '') break;
  turn++;
  let [nets, smokes] = readline().split(' ').map(Number);
  const n = +readline();
  const mine = [], preys = [], preds = [];
  for (let i = 0; i < n; i++) {
    const f = readline().split(' ');
    if (f[1] !== 'UNIT') continue;
    const u = { id: +f[0], owner: +f[2], x: +f[3], y: +f[4], dx: +f[5], dy: +f[6], ghost: f[7] === '1', cd: +f[8], immob: +f[10] };
    (u.owner === me ? mine : u.owner === prey ? preys : preds).push(u);
  }
  const out = [], netted = new Set();
  const N = Math.max(1, mine.length);
  mine.sort((a, b) => a.id - b.id).forEach(u => {
    const near = list => { let b = null, bd = 1e18; for (const e of list) { const d = hyp(e.x - u.x, e.y - u.y); if (d < bd) { bd = d; b = e; } } return [b, bd]; };
    const [q, dq] = near(preys), [h, dh] = near(u.ghost ? [] : preds);
    let tx, ty, dash = false;
    if (level !== 'wood' && h && dh < 1800 && !(q && dq < 700)) {             // run straight away from the predator
      const l = Math.max(1, dh); tx = u.x + (u.x - h.x) / l * 2000; ty = u.y + (u.y - h.y) / l * 2000;
      const r = hyp(tx, ty); if (r > 7700) { tx = tx * 7700 / r - (u.y - h.y) / l * 900; ty = ty * 7700 / r + (u.x - h.x) / l * 900; }
      dash = dh < 1300;
    } else if (q && !u.ghost) {
      tx = q.x + q.dx; ty = q.y + q.dy;
      dash = level !== 'wood' && dq > 700 && dq < 1700;
    } else {
      const a = (u.id % N) * 2 * Math.PI / N + turn * 0.1 + me * 2.1;
      tx = Math.cos(a) * 4500; ty = Math.sin(a) * 4500;
    }
    out.push(`${dash && u.cd === 0 ? 'DASH' : 'MOVE'} ${u.id} ${Math.round(tx)} ${Math.round(ty)}`);
    if (level !== 'silver' || u.ghost) return;
    if (nets > 0 && h && dh < 1200 && h.immob === 0) { out.push(`NET ${u.id} ${Math.round(h.x + h.dx)} ${Math.round(h.y + h.dy)}`); nets--; return; }
    if (nets > 0 && q && dq > 500 && dq < 1900 && q.immob === 0 && !netted.has(q.id) && (q.cd > 0 || dq < 1300)) {
      out.push(`NET ${u.id} ${Math.round(q.x + q.dx)} ${Math.round(q.y + q.dy)}`); nets--; netted.add(q.id); return;
    }
    if (smokes > 0 && u.immob > 0 && h && dh < 3000) { out.push(`SMOKE ${u.id} ${u.x} ${u.y}`); smokes--; }
  });
  print(out.length ? out.join(';') : 'WAIT');
}
