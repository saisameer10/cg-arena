// Ocean of Code boss. Levels: wood (random patrol), bronze (tracks the opponent, sonar, torpedoes),
// silver (bronze + silence + mines + smarter start).
'use strict';
const level = process.argv[2] || 'bronze';
const [W, H, myId] = readline().split(' ').map(Number);
const map = [];
for (let i = 0; i < H; i++) map.push(readline());
const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const key = (x, y) => x + y * W;
const water = (x, y) => x >= 0 && y >= 0 && x < W && y < H && map[y][x] === '.';
const sector = (x, y) => 1 + Math.floor(x / 5) + 3 * Math.floor(y / 5);
let seed = 7 + myId;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

// --- geometry helpers -------------------------------------------------------
function torpedoReach(x0, y0) {           // cells within 4 water-steps
  const dist = new Map([[key(x0, y0), 0]]); const q = [[x0, y0]];
  for (let i = 0; i < q.length; i++) {
    const [x, y] = q[i], d = dist.get(key(x, y));
    if (d >= 4) continue;
    for (const [dx, dy] of Object.values(DIRS)) {
      const nx = x + dx, ny = y + dy;
      if (!water(nx, ny) || dist.has(key(nx, ny))) continue;
      dist.set(key(nx, ny), d + 1); q.push([nx, ny]);
    }
  }
  return dist;
}
const dmgAt = (cx, cy, tx, ty) => { const dx = Math.abs(cx - tx), dy = Math.abs(cy - ty); return dx === 0 && dy === 0 ? 2 : dx <= 1 && dy <= 1 ? 1 : 0; };
function floodUnvisited(x, y, visited) {
  const seen = new Set([key(x, y)]); const st = [[x, y]];
  while (st.length) {
    const [cx, cy] = st.pop();
    for (const [dx, dy] of Object.values(DIRS)) {
      const nx = cx + dx, ny = cy + dy, k = key(nx, ny);
      if (!water(nx, ny) || visited.has(k) || seen.has(k)) continue;
      seen.add(k); st.push([nx, ny]);
    }
  }
  return seen.size;
}

// --- opponent tracking ------------------------------------------------------
let cand = new Set();
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (water(x, y)) cand.add(key(x, y));
const cx = k => k % W, cy = k => (k / W) | 0;
function trackOrders(orders) {
  if (orders === 'NA') return;
  for (const o of orders.split('|')) {
    const p = o.trim().split(/\s+/); const cmd = p[0];
    if (cmd === 'MOVE') {
      const d = DIRS[p[1]]; const next = new Set();
      for (const k of cand) { const nx = cx(k) + d[0], ny = cy(k) + d[1]; if (water(nx, ny)) next.add(key(nx, ny)); }
      cand = next;
    } else if (cmd === 'SURFACE') {
      const s = +p[1]; cand = new Set([...cand].filter(k => sector(cx(k), cy(k)) === s));
    } else if (cmd === 'SILENCE') {
      const next = new Set(cand);
      for (const k of cand) for (const [dx, dy] of Object.values(DIRS)) {
        let x = cx(k), y = cy(k);
        for (let i = 1; i <= 4; i++) { x += dx; y += dy; if (!water(x, y)) break; next.add(key(x, y)); }
      }
      cand = next;
    } else if (cmd === 'TORPEDO') {
      const reach = torpedoReach(+p[1], +p[2]);
      cand = new Set([...cand].filter(k => reach.has(k)));
    }
  }
  if (cand.size === 0) { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (water(x, y)) cand.add(key(x, y)); }
}

// --- state ------------------------------------------------------------------
let visited = new Set(), mines = [];      // mines: [x, y, roundPlaced]; armed from the next round on
let lastSonar = null, lastShot = null, lastTrigger = false, prevOppLife = 6, round = 0;

// first turn: choose a start position
let sx, sy;
if (level === 'wood') { do { sx = (rnd() * W) | 0; sy = (rnd() * H) | 0; } while (!water(sx, sy)); }
else {
  let best = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!water(x, y)) continue;
    const open = Object.values(DIRS).filter(([dx, dy]) => water(x + dx, y + dy)).length + rnd();
    if (open > best) { best = open; sx = x; sy = y; }
  }
}
let mx = sx, my = sy;
visited.add(key(mx, my));
print(`${sx} ${sy}`);

for (;;) {
  const line = readline();
  if (line === null) break;
  const [x, y, myLife, oppLife, cdTorpedo, cdSonar, cdSilence, cdMine] = line.split(' ').map(Number);
  const sonarResult = readline();
  const oppOrders = readline();
  mx = x; my = y; round++;

  // 1. information from my previous turn (sonar / torpedo), evaluated before the opponent moved
  if (lastSonar && sonarResult !== 'NA') {
    cand = new Set([...cand].filter(k => (sector(cx(k), cy(k)) === lastSonar) === (sonarResult === 'Y')));
  }
  // damage inference is only sound when my torpedo was the sole source of damage this exchange
  if (lastShot && !lastTrigger && !oppOrders.includes('TORPEDO') && !oppOrders.includes('TRIGGER')) {
    let dmg = prevOppLife - oppLife;
    if (oppOrders.includes('SURFACE')) dmg -= 1;
    const [tx, ty] = lastShot;
    const f = [...cand].filter(k => dmgAt(cx(k), cy(k), tx, ty) === Math.max(0, dmg));
    if (f.length) cand = new Set(f);
  }
  lastSonar = null; lastShot = null; lastTrigger = false;
  // 2. opponent's orders since then
  trackOrders(oppOrders);
  prevOppLife = oppLife;

  const orders = [];
  // 3. movement
  let moved = false;
  const options = Object.entries(DIRS).map(([d, [dx, dy]]) => [d, mx + dx, my + dy]).filter(([, nx, ny]) => water(nx, ny) && !visited.has(key(nx, ny)));
  const charge = cdTorpedo > 0 ? 'TORPEDO' : cdSonar > 0 && level !== 'wood' ? 'SONAR' : cdSilence > 0 && level === 'silver' ? 'SILENCE' : cdMine > 0 && level === 'silver' ? 'MINE' : 'TORPEDO';
  if (options.length) {
    let pick;
    if (level === 'wood') pick = options[(rnd() * options.length) | 0];
    else {
      let best = -1;
      for (const o of options) {
        const s = floodUnvisited(o[1], o[2], new Set([...visited, key(o[1], o[2])])) + rnd();
        if (s > best) { best = s; pick = o; }
      }
    }
    mx = pick[1]; my = pick[2]; visited.add(key(mx, my)); moved = true;
    orders.push(`MOVE ${pick[0]} ${charge}`);
  } else {
    orders.push('SURFACE');
    visited = new Set([key(mx, my)]);
  }
  // 4. silence (silver): slip away when charged and hurt, along the longest legal run (never a wasted "SILENCE d 0")
  if (level === 'silver' && cdSilence === 0 && (myLife <= oppLife || rnd() < 0.3)) {
    let best = null;
    for (const [d, [dx, dy]] of Object.entries(DIRS)) {
      let run = 0, tx = mx, ty = my;
      while (run < 4 && water(tx + dx, ty + dy) && !visited.has(key(tx + dx, ty + dy))) { tx += dx; ty += dy; run++; }
      const score = run + rnd() * 0.5;
      if (run >= 1 && (!best || score > best.score)) best = { d, dx, dy, run, score };
    }
    if (best) {
      const dist = 1 + ((rnd() * best.run) | 0);
      for (let i = 1; i <= dist; i++) { mx += best.dx; my += best.dy; visited.add(key(mx, my)); }
      orders.push(`SILENCE ${best.d} ${dist}`);
    }
  }
  // 5. attack
  const threshold = level === 'wood' ? 3 : 15;
  if (cdTorpedo === 0 && cand.size <= threshold) {
    const reach = torpedoReach(mx, my);
    let best = null, bestExp = 0;
    for (const k of reach.keys()) {
      const tx = cx(k), ty = cy(k);
      if (dmgAt(mx, my, tx, ty) > 0) continue;   // never hurt myself
      let exp = 0;
      for (const c of cand) exp += dmgAt(cx(c), cy(c), tx, ty);
      exp /= cand.size;
      if (exp > bestExp) { bestExp = exp; best = [tx, ty]; }
    }
    if (best && bestExp >= (level === 'wood' ? 0.5 : 0.6)) { orders.push(`TORPEDO ${best[0]} ${best[1]}`); lastShot = best; }
  }
  // 6. sonar when the candidate cloud is still wide
  if (level !== 'wood' && cdSonar === 0 && !lastShot && cand.size > 6) {
    const count = new Array(10).fill(0);
    for (const k of cand) count[sector(cx(k), cy(k))]++;
    let s = 1; for (let i = 2; i <= 9; i++) if (count[i] > count[s]) s = i;
    if (count[s] < cand.size) { orders.push(`SONAR ${s}`); lastSonar = s; }
  }
  // 7. mines (silver): drop one behind when charged
  if (level === 'silver' && cdMine === 0 && moved) {
    const spots = Object.entries(DIRS).map(([d, [dx, dy]]) => [d, mx + dx, my + dy]).filter(([, nx, ny]) => water(nx, ny) && !mines.some(m => m[0] === nx && m[1] === ny));
    if (spots.length) { const s = spots[(rnd() * spots.length) | 0]; mines.push([s[1], s[2], round]); orders.push(`MINE ${s[0]}`); }
  }
  // 8. trigger a mine if the opponent is probably on it and I am safe
  if (level === 'silver' && mines.length) {
    for (let i = 0; i < mines.length; i++) {
      const [tx, ty, placed] = mines[i];
      if (placed >= round) continue;                 // not armed until the round after placement
      if (dmgAt(mx, my, tx, ty) > 0) continue;
      let exp = 0; for (const c of cand) exp += dmgAt(cx(c), cy(c), tx, ty);
      if (exp / cand.size >= 0.8) { orders.push(`TRIGGER ${tx} ${ty}`); mines.splice(i, 1); lastTrigger = true; break; }
    }
  }
  printErr(`boss ${level}: candidates=${cand.size} life=${myLife}/${oppLife}`);
  print(orders.join('|') + `|MSG ${cand.size} cells`);
}
