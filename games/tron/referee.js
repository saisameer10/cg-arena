'use strict';
const { Referee, GameError } = require('../base');

const W = 30, H = 20;
const DIRS = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0] };

class TronReferee extends Referee {
  static meta = { id: 'tron', name: 'Tron Battle', playerCount: 2, firstTurnTimeout: 1000, turnTimeout: 100, maxTurns: 600, viewer: 'tron' };

  constructor(opts) {
    super(opts);
    this.grid = Array.from({ length: H }, () => new Array(W).fill(-1));
    this.players = [];
    for (let p = 0; p < this.playerCount; p++) {
      let x, y;
      do { x = this.randInt(W); y = this.randInt(H); } while (this.grid[y][x] !== -1);
      this.grid[y][x] = p;
      this.players.push({ x0: x, y0: y, x, y, alive: true, trail: [[x, y]], lastMove: null, deathTurn: null });
    }
    this.aliveCount = this.playerCount;
  }
  getStaticInfo() { return { width: W, height: H }; }
  getActors() { return this.players.map((p, i) => p.alive ? i : -1).filter(i => i >= 0); }
  getTurnInput(p) {
    const lines = [`${this.playerCount} ${p}`];
    for (const q of this.players) lines.push(q.alive ? `${q.x0} ${q.y0} ${q.x} ${q.y}` : '-1 -1 -1 -1');
    return lines;
  }
  applyOutput(p, lines) {
    const cmd = (lines[0] || '').trim().toUpperCase().split(/\s+/)[0];
    const d = DIRS[cmd];
    if (!d) throw new GameError(`invalid output "${lines[0]}" (expected UP, DOWN, LEFT or RIGHT)`);
    const pl = this.players[p];
    pl.lastMove = cmd;
    const nx = pl.x + d[0], ny = pl.y + d[1];
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) return this.kill(p, `drove off the grid (${cmd})`);
    if (this.grid[ny][nx] !== -1) return this.kill(p, `crashed into a light wall at (${nx}, ${ny})`);
    pl.x = nx; pl.y = ny;
    this.grid[ny][nx] = p;
    pl.trail.push([nx, ny]);
  }
  kill(p, reason) {
    const pl = this.players[p];
    if (!pl.alive) return;
    pl.alive = false;
    pl.deathTurn = this.turn;
    for (const [x, y] of pl.trail) this.grid[y][x] = -1;   // a dead player's wall disappears
    this.aliveCount--;
    this.log(`Player ${p} ${reason}`);
  }
  onDisqualify(p, reason) { this.kill(p, `eliminated: ${reason}`); }
  isGameOver() { return this.aliveCount <= 1; }
  getFrame() {
    return { players: this.players.map(p => ({ x: p.x, y: p.y, x0: p.x0, y0: p.y0, alive: p.alive, lastMove: p.lastMove, trail: p.alive ? p.trail.slice() : [] })) };
  }
  getResult() {
    const scores = this.players.map(p => p.alive ? this.turn + 1 : p.deathTurn);
    const best = Math.max(...scores);
    const winners = scores.map((s, i) => s === best ? i : -1).filter(i => i >= 0);
    return { scores, winner: winners.length === 1 ? winners[0] : null };
  }
}

module.exports = { Referee: TronReferee };
