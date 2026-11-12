'use strict';
// The Bridge - Episode 2: movement rules, shared by the referee, the level generator and the solver.
//
// SPOILER WARNING: run directly, this file is also a complete solution bot (breadth-first search over
// every command sequence). It exists so the arena can prove each level is solvable and test itself:
//   node cli.js the-bridge-episode-2 games/the-bridge-episode-2/rules.js --test all
// Don't read solve() if you want to find the approach yourself.

const CMDS = ['SPEED', 'SLOW', 'JUMP', 'WAIT', 'UP', 'DOWN'];
const LANES = 4;
const MAX_SPEED = 49;          // statement: 0 <= S < 50
const MAX_TURNS = 50;

/**
 * One game turn for all bikes.
 *   road: 4 strings ('.' safe, '0' hole); x, s: shared position and speed; ys: lanes of the bikes to move
 * Returns { x, s, dy, dead } where dead[i] tells whether bike ys[i] fell.
 * - SPEED/SLOW change the speed first, then the bikes move S cells.
 * - Straight move: every cell after the start up to and including the landing cell must be safe.
 * - JUMP: only the landing cell matters.
 * - UP/DOWN: cells x+1..x+S-1 on the current lane and x+1..x+S on the new lane must be safe.
 *   If any moving bike would leave the road (guard rail), nobody changes lane that turn.
 * - Cells past the end of the road are safe (that is the far side of the bridge).
 */
function move(road, x, s, ys, cmd) {
  const L = road[0].length;
  if (cmd === 'SPEED') s = Math.min(MAX_SPEED, s + 1);
  else if (cmd === 'SLOW') s = Math.max(0, s - 1);
  let dy = cmd === 'UP' ? -1 : cmd === 'DOWN' ? 1 : 0;
  if (dy && ys.some(y => y + dy < 0 || y + dy >= LANES)) dy = 0;
  const hole = (y, c) => c < L && road[y][c] === '0';
  const x1 = x + s;
  const dead = ys.map(y => {
    if (cmd === 'JUMP') return hole(y, x1);
    if (!dy) { for (let c = x + 1; c <= x1; c++) if (hole(y, c)) return true; return false; }
    for (let c = x + 1; c < x1; c++) if (hole(y, c)) return true;
    for (let c = x + 1; c <= x1; c++) if (hole(y + dy, c)) return true;
    return s === 0 && hole(y + dy, x1);     // changing lane on the spot: the new cell must be safe
  });
  return { x: x1, s, dy, dead };
}

/**
 * Shortest command sequence that gets at least `need` bikes across within `turns` turns, or null.
 * State = (x, speed, set of lanes still occupied); BFS layer by layer, so the answer uses the fewest turns.
 */
function solve(road, need, s0, lanes0, turns = MAX_TURNS, x0 = 0) {
  const L = road[0].length;
  const mask = lanes => lanes.reduce((m, y) => m | (1 << y), 0);
  const key = (x, s, lanes) => (x * 64 + s) * 16 + mask(lanes);
  let frontier = [{ x: x0, s: s0, lanes: lanes0, path: null }];
  const seen = new Set([key(x0, s0, lanes0)]);
  for (let t = 0; t < turns && frontier.length; t++) {
    const next = [];
    for (const st of frontier) {
      for (const cmd of CMDS) {
        const r = move(road, st.x, st.s, st.lanes, cmd);
        const lanes = st.lanes.filter((_, i) => !r.dead[i]).map(y => y + r.dy);
        if (lanes.length < need) continue;
        const path = { cmd, prev: st.path };
        if (r.x >= L) {
          const actions = [];
          for (let p = path; p; p = p.prev) actions.push(p.cmd);
          return { actions: actions.reverse(), survivors: lanes.length };
        }
        const k = key(r.x, r.s, lanes);
        if (seen.has(k)) continue;
        seen.add(k);
        next.push({ x: r.x, s: r.s, lanes, path });
      }
    }
    frontier = next;
  }
  return null;
}

// Most survivors first, then fewest turns.
function solveBest(road, need, s0, lanes0, turns = MAX_TURNS, x0 = 0) {
  for (let k = lanes0.length; k >= need; k--) {
    const r = solve(road, k, s0, lanes0, turns, x0);
    if (r) return r;
  }
  return null;
}

module.exports = { CMDS, LANES, MAX_SPEED, MAX_TURNS, move, solve, solveBest };

// ---- bot mode (spoiler): plan once on the first turn, then replay the plan ----
if (require.main === module) {
  const M = parseInt(readline(), 10);
  const V = parseInt(readline(), 10);
  const road = [];
  for (let i = 0; i < LANES; i++) road.push(readline());
  let plan = null, turn = 0;
  for (;;) {
    const line = readline();
    if (line === null) break;
    const s = parseInt(line, 10);
    const bikes = [];
    for (let i = 0; i < M; i++) { const [x, y, a] = readline().split(' ').map(Number); bikes.push({ x, y, a }); }
    if (!plan) {
      const alive = bikes.filter(b => b.a === 1);
      const t0 = Date.now();
      plan = solveBest(road, V, s, alive.map(b => b.y), MAX_TURNS - turn, alive[0].x) || { actions: [], survivors: 0 };
      printErr(`plan: ${plan.actions.length} turns, ${plan.survivors} bikes, ${Date.now() - t0} ms`);
    }
    print(plan.actions[turn++] || 'SPEED');
  }
}
