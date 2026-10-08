'use strict';
// Ocean of Code referee (rules re-implemented from the CodinGame Spring Challenge 2020 statement).
const { Referee, GameError } = require('../base');

const W = 15, H = 15;
const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const COOLDOWN = { TORPEDO: 3, SONAR: 4, SILENCE: 6, MINE: 3 };
const TORPEDO_RANGE = 4, MAX_LIFE = 6, MAX_TURNS_PER_PLAYER = 300;
const key = (x, y) => x + y * W;

class OceanReferee extends Referee {
  static meta = { id: 'ocean-of-code', name: 'Ocean of Code', playerCount: 2, firstTurnTimeout: 1000, turnTimeout: 50, maxTurns: MAX_TURNS_PER_PLAYER * 2, viewer: 'ocean' };

  constructor(opts) {
    super(opts);
    this.map = this.generateMap();
    this.players = [0, 1].map(() => ({
      x: -1, y: -1, life: MAX_LIFE, cd: Object.assign({}, COOLDOWN), visited: new Set(), mines: [],
      sonarResult: 'NA', publicOrders: 'NA', placed: false, msg: '',
    }));
    this.current = 0;
    this.events = null;
  }

  generateMap() {
    for (let attempt = 0; attempt < 200; attempt++) {
      const g = Array.from({ length: H }, () => new Array(W).fill('.'));
      const n = 7 + this.randInt(6);
      for (let i = 0; i < n; i++) {
        const w = 1 + this.randInt(3), h = 1 + this.randInt(3);
        const x0 = this.randInt(W - w + 1), y0 = this.randInt(H - h + 1);
        for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) g[y][x] = 'x';
      }
      // every water cell must be reachable
      let total = 0, start = -1;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === '.') { total++; if (start < 0) start = key(x, y); }
      const seen = new Set([start]); const q = [start];
      for (let i = 0; i < q.length; i++) {
        const x = q[i] % W, y = (q[i] / W) | 0;
        for (const [dx, dy] of Object.values(DIRS)) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H || g[ny][nx] !== '.' || seen.has(key(nx, ny))) continue;
          seen.add(key(nx, ny)); q.push(key(nx, ny));
        }
      }
      if (seen.size === total && total >= 0.72 * W * H) return g.map(r => r.join(''));
    }
    return Array.from({ length: H }, () => '.'.repeat(W));
  }

  isWater(x, y) { return x >= 0 && y >= 0 && x < W && y < H && this.map[y][x] === '.'; }
  sector(x, y) { return 1 + Math.floor(x / 5) + 3 * Math.floor(y / 5); }
  torpedoDist(x0, y0, x1, y1) {
    const dist = new Map([[key(x0, y0), 0]]); const q = [[x0, y0]];
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i], d = dist.get(key(x, y));
      if (x === x1 && y === y1) return d;
      if (d >= TORPEDO_RANGE) continue;
      for (const [dx, dy] of Object.values(DIRS)) {
        const nx = x + dx, ny = y + dy;
        if (!this.isWater(nx, ny) || dist.has(key(nx, ny))) continue;
        dist.set(key(nx, ny), d + 1); q.push([nx, ny]);
      }
    }
    return Infinity;
  }

  getStaticInfo() { return { width: W, height: H, map: this.map }; }
  getInitInput(p) { return [`${W} ${H} ${p}`, ...this.map]; }
  getActors() { return [this.current]; }
  getTurnInput(p) {
    const me = this.players[p], opp = this.players[1 - p];
    if (!me.placed) return [];
    const lines = [
      `${me.x} ${me.y} ${me.life} ${opp.life} ${me.cd.TORPEDO} ${me.cd.SONAR} ${me.cd.SILENCE} ${me.cd.MINE}`,
      me.sonarResult,
      opp.publicOrders,
    ];
    me.sonarResult = 'NA';
    return lines;
  }

  applyOutput(p, lines) {
    const me = this.players[p], opp = this.players[1 - p];
    const raw = (lines[0] || '').trim();
    const ev = this.events = { player: p, orders: raw, explosions: [], damage: [0, 0], surfaced: null, sonar: null, silence: null, path: [], mine: null, trigger: null };
    if (!me.placed) {
      const m = raw.match(/^(-?\d+)\s+(-?\d+)/);
      if (!m) throw new GameError(`expected a start position "x y", got "${raw}"`);
      const x = +m[1], y = +m[2];
      if (!this.isWater(x, y)) throw new GameError(`start position (${x}, ${y}) is not water`);
      me.x = x; me.y = y; me.placed = true; me.visited.add(key(x, y));
      me.publicOrders = 'NA';
      ev.path.push([x, y]);
      this.log(`Player ${p} starts at (${x}, ${y})`);
      return;
    }
    const orders = raw.split('|').map(s => s.trim()).filter(Boolean);
    if (!orders.length) throw new GameError('empty output');
    const used = new Set(); const pub = [];
    for (const o of orders) {
      const parts = o.split(/\s+/); const cmd = parts[0].toUpperCase();
      if (cmd === 'MSG') { me.msg = o.slice(4).slice(0, 40); continue; }
      if (used.has(cmd)) throw new GameError(`${cmd} used twice in the same turn`);
      used.add(cmd);
      switch (cmd) {
        case 'MOVE': {
          const dir = (parts[1] || '').toUpperCase(), d = DIRS[dir];
          if (!d) throw new GameError(`MOVE needs a direction N, S, E or W: "${o}"`);
          const nx = me.x + d[0], ny = me.y + d[1];
          if (!this.isWater(nx, ny)) throw new GameError(`MOVE ${dir}: (${nx}, ${ny}) is an island or outside the map`);
          if (me.visited.has(key(nx, ny))) throw new GameError(`MOVE ${dir}: (${nx}, ${ny}) was already visited (use SURFACE to reset)`);
          me.x = nx; me.y = ny; me.visited.add(key(nx, ny)); ev.path.push([nx, ny]);
          if (parts[2]) {
            const dev = parts[2].toUpperCase();
            if (!(dev in COOLDOWN)) throw new GameError(`unknown device to charge: ${parts[2]}`);
            if (me.cd[dev] > 0) me.cd[dev]--;
          }
          pub.push(`MOVE ${dir}`);
          break;
        }
        case 'SURFACE': {
          me.life--; ev.damage[p]++;
          me.visited = new Set([key(me.x, me.y)]);
          ev.surfaced = this.sector(me.x, me.y);
          pub.push(`SURFACE ${ev.surfaced}`);
          break;
        }
        case 'TORPEDO': {
          const x = parseInt(parts[1]), y = parseInt(parts[2]);
          if (Number.isNaN(x) || Number.isNaN(y)) throw new GameError(`TORPEDO needs x y: "${o}"`);
          if (me.cd.TORPEDO > 0) throw new GameError(`TORPEDO is not charged (${me.cd.TORPEDO} charges missing)`);
          if (!this.isWater(x, y)) throw new GameError(`TORPEDO target (${x}, ${y}) is not water`);
          if (this.torpedoDist(me.x, me.y, x, y) > TORPEDO_RANGE) throw new GameError(`TORPEDO target (${x}, ${y}) is out of range (${TORPEDO_RANGE} cells by water)`);
          me.cd.TORPEDO = COOLDOWN.TORPEDO;
          this.explode(x, y, ev);
          pub.push(`TORPEDO ${x} ${y}`);
          break;
        }
        case 'SONAR': {
          const s = parseInt(parts[1]);
          if (!(s >= 1 && s <= 9)) throw new GameError(`SONAR needs a sector 1-9: "${o}"`);
          if (me.cd.SONAR > 0) throw new GameError(`SONAR is not charged (${me.cd.SONAR} charges missing)`);
          me.cd.SONAR = COOLDOWN.SONAR;
          me.sonarResult = opp.placed && this.sector(opp.x, opp.y) === s ? 'Y' : 'N';
          ev.sonar = { sector: s, result: me.sonarResult };
          pub.push(`SONAR ${s}`);
          break;
        }
        case 'SILENCE': {
          const dir = (parts[1] || '').toUpperCase(), d = DIRS[dir], dist = parseInt(parts[2]);
          if (!d || !(dist >= 0 && dist <= 4)) throw new GameError(`SILENCE needs a direction and a distance 0-4: "${o}"`);
          if (me.cd.SILENCE > 0) throw new GameError(`SILENCE is not charged (${me.cd.SILENCE} charges missing)`);
          for (let i = 0; i < dist; i++) {
            const nx = me.x + d[0], ny = me.y + d[1];
            if (!this.isWater(nx, ny) || me.visited.has(key(nx, ny))) throw new GameError(`SILENCE ${dir} ${dist}: blocked at (${nx}, ${ny})`);
            me.x = nx; me.y = ny; me.visited.add(key(nx, ny)); ev.path.push([nx, ny]);
          }
          me.cd.SILENCE = COOLDOWN.SILENCE;
          ev.silence = { dir, dist };
          pub.push('SILENCE');
          break;
        }
        case 'MINE': {
          const dir = (parts[1] || '').toUpperCase(), d = DIRS[dir];
          if (!d) throw new GameError(`MINE needs a direction: "${o}"`);
          if (me.cd.MINE > 0) throw new GameError(`MINE is not charged (${me.cd.MINE} charges missing)`);
          const mx = me.x + d[0], my = me.y + d[1];
          if (!this.isWater(mx, my)) throw new GameError(`MINE ${dir}: (${mx}, ${my}) is not water`);
          if (me.mines.some(m => m[0] === mx && m[1] === my)) throw new GameError(`MINE ${dir}: you already have a mine at (${mx}, ${my})`);
          me.mines.push([mx, my]);
          me.cd.MINE = COOLDOWN.MINE;
          ev.mine = [mx, my];
          pub.push('MINE');
          break;
        }
        case 'TRIGGER': {
          const x = parseInt(parts[1]), y = parseInt(parts[2]);
          const i = me.mines.findIndex(m => m[0] === x && m[1] === y);
          if (i < 0) throw new GameError(`TRIGGER: you have no mine at (${x}, ${y})`);
          me.mines.splice(i, 1);
          ev.trigger = [x, y];
          this.explode(x, y, ev);
          pub.push(`TRIGGER ${x} ${y}`);
          break;
        }
        default:
          throw new GameError(`unknown order "${o}"`);
      }
    }
    me.publicOrders = pub.length ? pub.join('|') : 'NA';
    this.log(`Player ${p}: ${raw}` + (ev.damage.some(d => d) ? `  (damage P0 ${ev.damage[0]}, P1 ${ev.damage[1]})` : ''));
  }

  explode(x, y, ev) {
    ev.explosions.push([x, y]);
    this.players.forEach((q, i) => {
      if (!q.placed) return;
      const dx = Math.abs(q.x - x), dy = Math.abs(q.y - y);
      const dmg = dx === 0 && dy === 0 ? 2 : dx <= 1 && dy <= 1 ? 1 : 0;
      q.life -= dmg; ev.damage[i] += dmg;
    });
  }

  onDisqualify(p) { this.players[p].life = Math.min(this.players[p].life, 0); }
  endTurn() { this.turn++; this.current = 1 - this.current; }
  isGameOver() { return this.players.some(p => p.life <= 0); }
  getFrame() {
    return {
      actor: this.events ? this.events.player : null,
      next: this.current,
      players: this.players.map(p => ({ x: p.x, y: p.y, life: p.life, cd: Object.assign({}, p.cd), visited: [...p.visited], mines: p.mines.map(m => m.slice()), msg: p.msg, orders: p.publicOrders })),
      events: this.events,
    };
  }
  getResult() {
    const lives = this.players.map(p => p.life);
    const scores = lives.map((l, i) => this.dq[i] ? -1 : l);
    let winner = null;
    if (scores[0] !== scores[1]) winner = scores[0] > scores[1] ? 0 : 1;
    return { scores, winner, lives };
  }
}

module.exports = { Referee: OceanReferee };
