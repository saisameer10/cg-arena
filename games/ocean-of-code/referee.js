'use strict';
// Ocean of Code referee: a port of the official CodinGame referee
// (https://github.com/CodinGameCommunity/ocean-of-code, Java, MIT).
// Same map generator (java.util.Random), same league gating, same action validation order,
// same "skip invalid, fall back to SURFACE" behaviour and the same error messages.
const { Referee, GameError } = require('../base');
const { JavaRandom } = require('../java-random');

const SIZE = 15;
const DIRS = { W: [-1, 0], E: [1, 0], N: [0, -1], S: [0, 1] };
const POWER_MAX = { TORPEDO: 3, SONAR: 4, SILENCE: 6, MINE: 3 };
const MAX_ROUNDS = 598;                 // 299 rounds per player; with the placement turn that is CodinGame's "300 turns"
const LEAGUES = { wood2: 1, wood1: 2, bronze: 3 };
const TILES = ['11.0.111', '.11111.0', '.0.0.111', '11.0.0.1', '.111.0.0', '.0.111.0', '1111.0.1', '.0.11111',
  '11111111', '11111101', '11110111', '11011111', '01111111'].map(t => new RegExp('^' + t + '$'));
const isInt = s => /^[+-]?\d+$/.test(s || '');

class OceanReferee extends Referee {
  static meta = { id: 'ocean-of-code', name: 'Ocean of Code', playerCount: 2, firstTurnTimeout: 1000, turnTimeout: 50, maxTurns: MAX_ROUNDS + 2, viewer: 'ocean' };

  constructor(opts = {}) {
    super(opts);
    this.leagueId = LEAGUES[opts.league] ? opts.league : 'bronze';
    this.level = LEAGUES[this.leagueId];
    this.rand = new JavaRandom(opts.seed === undefined ? 1 : opts.seed);
    this.grid = this.generateMap(this.rand);          // grid[x][y] === true -> island
    this.map = [];
    for (let y = 0; y < SIZE; y++) { let row = ''; for (let x = 0; x < SIZE; x++) row += this.grid[x][y] ? 'x' : '.'; this.map.push(row); }
    this.players = [0, 1].map(index => {
      const powers = ['TORPEDO'];
      if (this.level >= 2) powers.push('SILENCE', 'SONAR');
      if (this.level >= 3) powers.push('MINE');
      const commands = new Set(['MOVE', 'SURFACE', ...powers, ...(this.level >= 3 ? ['TRIGGER'] : [])]);
      return { index, life: 6, x: -1, y: -1, placed: false, visited: this.emptyGrid(), charges: { TORPEDO: 0, SONAR: 0, SILENCE: 0, MINE: 0 },
        powers: new Set(powers), commands, mines: [], message: '', summaries: [], sonarResult: 'NA' };
    });
    this.current = 0;
    this.events = null;
  }

  // ---- map generation (GridModel.initialize) -------------------------------------------
  emptyGrid() { return Array.from({ length: SIZE }, () => new Array(SIZE).fill(false)); }
  generateMap(rand) {
    const seeds = this.emptyGrid();
    for (let i = 0; i < rand.nextInt(26) + 5; i++) {        // the bound is re-drawn every iteration, as in the Java loop
      const x = rand.nextInt(15), y = rand.nextInt(15);
      seeds[x][y] = true;
    }
    const grid = seeds.map(c => c.slice());
    for (let x = 0; x < SIZE; x++) for (let y = 0; y < SIZE; y++) {
      if (!seeds[x][y]) continue;
      if (y - 1 >= 0) grid[x][y - 1] = true;
      if (x + 1 < SIZE) { grid[x + 1][y] = true; if (y - 1 >= 0) grid[x + 1][y - 1] = true; }
    }
    while (!this.fixTiles(grid));
    return grid;
  }
  fixTiles(grid) {   // every island cell must match one of the sprite masks; otherwise grow it and rescan
    const at = (x, y) => (x < 0 || y < 0 || x >= SIZE || y >= SIZE || grid[x][y]) ? '1' : '0';
    const clamp = v => Math.max(0, Math.min(SIZE - 1, v));
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
      if (!grid[x][y]) continue;
      const mask = at(x - 1, y - 1) + at(x, y - 1) + at(x + 1, y - 1) + at(x + 1, y) + at(x + 1, y + 1) + at(x, y + 1) + at(x - 1, y + 1) + at(x - 1, y);
      if (TILES.some(t => t.test(mask))) continue;
      for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]) grid[clamp(x + dx)][clamp(y + dy)] = true;
      return false;
    }
    return true;
  }

  // ---- helpers -----------------------------------------------------------------------
  isEmpty(x, y) { return x >= 0 && x < SIZE && y >= 0 && y < SIZE && !this.grid[x][y]; }
  sector(x, y) { return Math.ceil((x + 1) / 5) + Math.floor(y / 5) * 3; }
  cooldown(p, name) { return p.powers.has(name) ? POWER_MAX[name] - p.charges[name] : -1; }
  pathLength(x0, y0, x1, y1) {   // BFS through water only (visited cells do not block torpedoes), null if unreachable
    if (!this.isEmpty(x1, y1)) return null;
    const seen = this.emptyGrid(); seen[x0][y0] = true;
    const q = [[x0, y0, 0]];
    for (let i = 0; i < q.length; i++) {
      const [x, y, d] = q[i];
      if (x === x1 && y === y1) return d;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (this.isEmpty(nx, ny) && !seen[nx][ny]) { seen[nx][ny] = true; q.push([nx, ny, d + 1]); }
      }
    }
    return null;
  }
  parseDir(token, invalidMsg) {
    if (token === undefined) throw new GameError(invalidMsg);
    if (!DIRS[token]) throw new GameError(`Invalid direction: ${token}. Legal values are: N, S, E or W.`);
    return token;
  }
  move(p, dir) {
    const x = p.x + DIRS[dir][0], y = p.y + DIRS[dir][1];
    if (!this.isEmpty(x, y)) throw new GameError('Invalid move. Tried to move outside map or onto island');
    if (p.visited[x][y]) throw new GameError("Can't visit same location twice. Use surface.");
    p.x = x; p.y = y; p.visited[x][y] = true;
    this.events.path.push([x, y]);
  }
  reduceLife(p, amount) {
    p.life = Math.max(0, p.life - amount);
    this.events.damage[p.index] += amount;
  }
  explode(x, y) {
    this.events.explosions.push([x, y]);
    for (const q of this.players) {
      if (!q.placed) continue;
      if (q.x === x && q.y === y) this.reduceLife(q, 2);
      else if (Math.abs(q.x - x) <= 1 && Math.abs(q.y - y) <= 1) this.reduceLife(q, 1);
    }
  }

  // ---- engine contract ----------------------------------------------------------------
  getStaticInfo() { return { width: SIZE, height: SIZE, map: this.map, league: this.leagueId, level: this.level }; }
  getInitInput(p) { return [`${SIZE} ${SIZE} ${p}`, ...this.map]; }
  getActors() { return [this.current]; }
  getTurnInput(p) {
    const me = this.players[p], opp = this.players[1 - p];
    if (!me.placed) return [];
    return [
      `${me.x} ${me.y} ${me.life} ${opp.life} ${this.cooldown(me, 'TORPEDO')} ${this.cooldown(me, 'SONAR')} ${this.cooldown(me, 'SILENCE')} ${this.cooldown(me, 'MINE')}`,
      me.sonarResult,
      opp.summaries.length ? opp.summaries.join('|') : 'NA',
    ];
  }

  applyOutput(p, lines) {
    const me = this.players[p];
    const raw = lines[0] === undefined ? '' : lines[0];
    this.events = { player: p, orders: raw, explosions: [], damage: [0, 0], surfaced: null, sonar: null, silence: null, path: [], mine: null, trigger: null, skipped: [] };
    if (!me.placed) {
      if (!/^[0-9]{1,2} [0-9]{1,2}$/.test(raw)) throw new GameError("Cannot read initial coordinates. Expected format: 'X Y'");
      const [x, y] = raw.split(' ').map(Number);
      if (!this.isEmpty(x, y)) throw new GameError('Invalid coordinates!');
      me.x = x; me.y = y; me.placed = true; me.visited[x][y] = true;
      this.events.path.push([x, y]);
      this.log(`Player ${p} starts at (${x}, ${y})`);
      return;
    }
    // PlayerModel.handleRoundInput
    me.mines = me.mines.filter(m => !m.blown);
    for (const m of me.mines) m.active = true;
    me.sonarResult = 'NA';
    me.summaries = [];
    const actions = this.cleanActions(raw);
    for (const a of actions) if (a.activator === 'MSG') this.execMsg(me, a);
    if (!this.dropInvalidHead(me, actions)) actions.push({ activator: 'SURFACE', command: 'SURFACE' });
    // performRoundAction, one action per frame; the official referee stops once the game is over
    while (actions.length && !this.isGameOver()) {
      const a = actions.shift();
      this.execute(me, a);
      this.dropInvalidHead(me, actions);
    }
    this.log(`Player ${p}: ${raw}` + (this.events.damage.some(d => d) ? `  (damage P0 ${this.events.damage[0]}, P1 ${this.events.damage[1]})` : ''));
  }

  cleanActions(raw) {
    const keys = new Set(); const actions = [];
    for (let c of raw.split('|')) {
      c = c.trim();
      if (c === '') continue;
      const i = c.indexOf(' ');
      const activator = i < 0 ? c : c.slice(0, i);
      if (keys.has(activator) && activator !== 'MSG') throw new GameError('Two equal commands executed.');
      keys.add(activator);
      actions.push({ activator, command: c });
    }
    return actions;
  }
  execMsg(me, a) { if (a.command.length >= 5) me.message = a.command.slice(4); }

  // PlayerModel.hasValidCommandAndRemoveInvalid: drop soft-invalid actions from the head of the list,
  // throw (player loses) on malformed or unknown ones, return whether a valid action is at the head.
  dropInvalidHead(me, actions) {
    while (actions.length) {
      const a = actions[0];
      if (me.commands.has(a.activator)) {
        if (!this.canExecute(me, a)) { actions.shift(); continue; }
        return true;
      }
      if (a.activator === 'MSG') { this.execMsg(me, a); actions.shift(); continue; }
      throw new GameError('Unknown command: ' + a.command);
    }
    return false;
  }
  skip(me, a, msg) { this.events.skipped.push(`${a.command}: ${msg}`); this.log(`Player ${me.index} ${msg} (${a.command} skipped)`); return false; }

  canExecute(me, a) {
    const parts = a.command.split(' ');
    switch (a.activator) {
      case 'MOVE': {
        if (parts.length > 3) throw new GameError('Invalid amount of parameters to MOVE. Should be MOVE direction power');
        this.parseDir(parts[1], 'Invalid move command: ' + a.command);
        this.getPower(me, parts);
        return true;
      }
      case 'SURFACE': return true;
      case 'TORPEDO': {
        if (me.charges.TORPEDO < POWER_MAX.TORPEDO) return this.skip(me, a, 'Not enough charges of TORPEDO');
        if (parts.length !== 3) throw new GameError('Invalid amount of params for TORPEDO, should be TORPEDO x y');
        const [x, y] = this.target(parts, 'Invalid params to Torpedo. Should be TORPEDO x y');
        const len = this.pathLength(me.x, me.y, x, y);
        if (len === null || len > 4) return this.skip(me, a, 'Tried to fire out of range');
        return true;
      }
      case 'SONAR': {
        if (me.charges.SONAR < POWER_MAX.SONAR) return this.skip(me, a, 'Not enough charges of SONAR');
        if (parts.length !== 2) throw new GameError('Invalid amount of params for SONAR, should be: SONAR sectorId');
        this.sectorArg(parts, a);
        return true;
      }
      case 'SILENCE': {
        if (me.charges.SILENCE < POWER_MAX.SILENCE) return this.skip(me, a, 'Not enough charges of SILENCE');
        if (parts.length !== 3) throw new GameError('Invalid amount of params for Silence, should be: SILENCE direction steps');
        this.parseDir(parts[1], 'Invalid move command: ' + a.command);
        this.distanceArg(parts, a);
        return true;
      }
      case 'MINE': {
        if (me.charges.MINE < POWER_MAX.MINE) return this.skip(me, a, 'Not enough charges of MINE');
        if (parts.length > 2) throw new GameError('Invalid amount of params for MINE, should be MINE direction');
        const [x, y] = this.mineTarget(me, parts, a);
        if (!this.isEmpty(x, y)) return this.skip(me, a, 'Mine target outside map or on obstacle');
        if (me.mines.some(m => !m.blown && m.x === x && m.y === y)) return this.skip(me, a, 'Two mines on the same location is not allowed.');
        return true;
      }
      case 'TRIGGER': {
        if (parts.length > 3) throw new GameError('Invalid amount of params for TRIGGER, should be TRIGGER x y');
        const [x, y] = this.target(parts, 'Invalid params to Trigger. Should be Trigger x y');
        if (me.mines.some(m => !m.blown && m.active && m.x === x && m.y === y)) return true;
        return this.skip(me, a, 'no active mine at that position');
      }
    }
    return false;
  }

  execute(me, a) {
    const parts = a.command.split(' ');
    switch (a.activator) {
      case 'MOVE': {
        const dir = this.parseDir(parts[1], 'Invalid move command: ' + a.command);
        const power = this.getPower(me, parts);
        this.move(me, dir);
        if (power && me.charges[power] < POWER_MAX[power]) me.charges[power]++;
        me.summaries.push(`MOVE ${dir}`);
        break;
      }
      case 'SURFACE': {
        me.visited = this.emptyGrid(); me.visited[me.x][me.y] = true;
        this.reduceLife(me, 1);
        this.events.surfaced = this.sector(me.x, me.y);
        me.summaries.push(`SURFACE ${this.events.surfaced}`);
        break;
      }
      case 'TORPEDO': {
        const [x, y] = this.target(parts, 'Invalid params to Torpedo. Should be TORPEDO x y');
        this.explode(x, y);
        me.summaries.push(`TORPEDO ${x} ${y}`);
        me.charges.TORPEDO = 0;
        break;
      }
      case 'SONAR': {
        const s = this.sectorArg(parts, a), opp = this.players[1 - me.index];
        me.sonarResult = opp.placed && this.sector(opp.x, opp.y) === s ? 'Y' : 'N';
        this.events.sonar = { sector: s, result: me.sonarResult };
        me.summaries.push(`SONAR ${s}`);
        me.charges.SONAR = 0;
        break;
      }
      case 'SILENCE': {
        const dir = this.parseDir(parts[1], 'Invalid move command: ' + a.command);
        const dist = this.distanceArg(parts, a);
        for (let i = 0; i < dist; i++) this.move(me, dir);
        this.events.silence = { dir, dist };
        me.summaries.push('SILENCE');
        me.charges.SILENCE = 0;
        break;
      }
      case 'MINE': {
        const [x, y] = this.mineTarget(me, parts, a);
        me.mines.push({ x, y, active: false, blown: false });   // armed from the next round on
        this.events.mine = [x, y];
        me.summaries.push('MINE');
        me.charges.MINE = 0;
        break;
      }
      case 'TRIGGER': {
        const [x, y] = this.target(parts, 'Invalid params to Trigger. Should be Trigger x y');
        const mine = me.mines.find(m => !m.blown && m.active && m.x === x && m.y === y);
        if (!mine) break;
        mine.blown = true;
        this.events.trigger = [x, y];
        this.explode(x, y);
        me.summaries.push(`TRIGGER ${x} ${y}`);
        break;
      }
      case 'MSG': this.execMsg(me, a); break;
    }
  }

  getPower(me, parts) {
    if (parts.length !== 3) return '';
    const power = parts[2].trim();
    if (!me.powers.has(power)) throw new GameError('Invalid power to charge: ' + power);
    return power;
  }
  target(parts, msg) {
    if (!isInt(parts[1]) || !isInt(parts[2])) throw new GameError(msg);
    return [parseInt(parts[1], 10), parseInt(parts[2], 10)];
  }
  sectorArg(parts, a) {
    const s = isInt(parts[1]) ? parseInt(parts[1], 10) : NaN;
    if (!(s >= 1 && s <= 9)) throw new GameError('Invalid sector on SONAR: ' + a.command);
    return s;
  }
  distanceArg(parts, a) {
    const d = isInt(parts[2]) ? parseInt(parts[2], 10) : NaN;
    if (!(d >= 0 && d <= 4)) throw new GameError('Invalid distance on SILENCE: ' + a.command);
    return d;
  }
  mineTarget(me, parts, a) {
    const dir = this.parseDir(parts[1], 'Invalid mine command: ' + a.command);
    return [me.x + DIRS[dir][0], me.y + DIRS[dir][1]];
  }

  onDisqualify(p) { this.players[p].life = -1; }
  endTurn() { this.turn++; this.current = 1 - this.current; }
  isGameOver() { return this.players.some(p => p.life <= 0) || this.turn >= MAX_ROUNDS + 2; }
  getFrame() {
    return {
      actor: this.events ? this.events.player : null,
      next: this.current,
      league: this.leagueId,
      players: this.players.map(p => {
        const visited = [];
        for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if (p.visited[x][y]) visited.push(x + y * SIZE);
        return { x: p.x, y: p.y, life: p.life, visited, msg: p.message, orders: p.summaries.length ? p.summaries.join('|') : 'NA',
          cd: { TORPEDO: this.cooldown(p, 'TORPEDO'), SONAR: this.cooldown(p, 'SONAR'), SILENCE: this.cooldown(p, 'SILENCE'), MINE: this.cooldown(p, 'MINE') },
          mines: p.mines.filter(m => !m.blown).map(m => [m.x, m.y, m.active]) };
      }),
      events: this.events,
    };
  }
  getResult() {
    const scores = this.players.map(p => p.life);
    let winner = null;
    if (scores[0] !== scores[1]) winner = scores[0] > scores[1] ? 0 : 1;
    return { scores, winner, lives: scores };
  }
}

module.exports = { Referee: OceanReferee, LEAGUES };
