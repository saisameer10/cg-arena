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
const MAX_FRAMES = 1000;                // CodinGame SDK cap: gameTurn 1 = placements, then one executed action per frame
// Java semantics for the bits of parsing bots can hit: Integer.parseInt range, String.trim() (chars <= U+0020)
const javaInt = s => (/^[+-]?\d+$/.test(s || '') && Number(s) >= -2147483648 && Number(s) <= 2147483647) ? Number(s) : null;
const jtrim = s => s.replace(/^[\x00-\x20]+|[\x00-\x20]+$/g, '');
// post-game review: a MOVE is a trap when the unvisited water behind it is under 60 % of the best move's and 10+ cells smaller
const RV_RATIO = 0.6, RV_GAP = 10, RV_MAX_ITEMS = 8, RV_NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

class OceanReferee extends Referee {
  // engine turn 0 = both placements (as Game.initialize does), then 598 rounds alternating players
  static meta = { id: 'ocean-of-code', name: 'Ocean of Code', playerCount: 2, firstTurnTimeout: 1000, turnTimeout: 50, maxTurns: MAX_ROUNDS + 1, viewer: 'ocean' };

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
    this.frames = 1;          // SDK gameTurns consumed so far (turn 1 = placements); the game ends at MAX_FRAMES
    this.events = null;
    this.rv = this.rvInit();  // review bookkeeping only: read by review(), never by the rules
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
    this.rvTurn(p, raw);
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
      this.frames++;                       // each executed action is one SDK frame
      const rvPre = this.rvBefore(me, a);
      this.execute(me, a);
      this.rvAfter(me, a, rvPre);
      this.dropInvalidHead(me, actions);
    }
    this.rvEndTurn(me);
    this.log(`Player ${p}: ${raw}` + (this.events.damage.some(d => d) ? `  (damage P0 ${this.events.damage[0]}, P1 ${this.events.damage[1]})` : ''));
  }

  cleanActions(raw) {
    const keys = new Set(); const actions = [];
    for (let c of raw.split('|')) {
      c = jtrim(c);
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
    const x = javaInt(parts[1]), y = javaInt(parts[2]);
    if (x === null || y === null) throw new GameError(msg);
    return [x, y];
  }
  sectorArg(parts, a) {
    const s = javaInt(parts[1]);
    if (s === null || s < 1 || s > 9) throw new GameError('Invalid sector on SONAR: ' + a.command);
    return s;
  }
  distanceArg(parts, a) {
    const d = javaInt(parts[2]);
    if (d === null || d < 0 || d > 4) throw new GameError('Invalid distance on SILENCE: ' + a.command);
    return d;
  }
  mineTarget(me, parts, a) {
    const dir = this.parseDir(parts[1], 'Invalid mine command: ' + a.command);
    return [me.x + DIRS[dir][0], me.y + DIRS[dir][1]];
  }

  onDisqualify(p, reason) {
    this.rvDisqualified(p, reason);
    this.players[p].life = -1;
    // the frame must describe this player's failure, not the opponent's previous orders
    this.events = { player: p, orders: '', explosions: [], damage: [0, 0], surfaced: null, sonar: null, silence: null, path: [], mine: null, trigger: null, skipped: [], error: reason };
  }
  // engine turn 0: both players place (Game.initialize places both even if the first one fails);
  // engine turns 1..598: rounds, player 0 first
  getActors() { return this.turn === 0 ? [0, 1] : [(this.turn - 1) % 2]; }
  endTurn() { this.turn++; }
  isGameOver() { return this.players.some(p => p.life <= 0) || this.turn > MAX_ROUNDS || this.frames >= MAX_FRAMES; }
  getFrame() {
    return {
      actor: this.events ? this.events.player : null,
      next: this.isGameOver() ? null : this.getActors()[0],
      frames: this.frames,
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
  // ---- post-game review ------------------------------------------------------------------
  // Cheap bookkeeping around each executed action (a flood fill of at most 225 cells for MOVE and SURFACE,
  // the damage each action dealt), turned into ranked advice by review(). Nothing here is read by the rules
  // or written into frames, and every hook swallows its own errors, so the review can never change a game.

  rvInit() {
    const counts = () => ({ TORPEDO: 0, SONAR: 0, SILENCE: 0, MINE: 0 });
    const player = () => ({ dq: null, surfaces: [], seg: { moves: 0, trap: null }, shots: [], hitsTaken: [], skipped: {}, skippedTotal: 0,
      charged: counts(), full: counts(), noPower: 0, used: counts(), orders: 0, rounds: 0 });
    return { frame: 0, raw: ['', ''], rawFrame: [0, 0], hadSurface: false, cur: null, mineFrames: new Map(),
      lab: new Int32Array(SIZE * SIZE), q: new Int32Array(SIZE * SIZE), players: [player(), player()] };
  }
  rvTurn(p, raw) {
    try {
      const rv = this.rv, frame = this.turn + 1;
      rv.frame = frame; rv.raw[p] = raw; rv.rawFrame[p] = frame; rv.cur = null;
      // SURFACE is always valid, so an executed SURFACE that was not ordered is the referee's fallback
      rv.hadSurface = raw.split('|').some(c => { c = jtrim(c); const i = c.indexOf(' '); return (i < 0 ? c : c.slice(0, i)) === 'SURFACE'; });
    } catch (e) { /* review only */ }
  }
  // unvisited water reachable through each neighbour: { N, E, S, W: cells, free: open neighbours, reach: all reachable cells }
  rvAreas(me) {
    const { lab, q } = this.rv, sizes = [], out = { free: 0, reach: 0 };
    lab.fill(-1);
    for (const d of ['N', 'E', 'S', 'W']) {
      const x = me.x + DIRS[d][0], y = me.y + DIRS[d][1];
      out[d] = 0;
      if (!this.isEmpty(x, y) || me.visited[x][y]) continue;
      out.free++;
      const s = x + y * SIZE;
      if (lab[s] === -1) {
        const k = sizes.length;
        let head = 0, tail = 0;
        lab[s] = k; q[tail++] = s;
        while (head < tail) {
          const c = q[head++], cx = c % SIZE, cy = (c - cx) / SIZE;
          for (const [dx, dy] of RV_NB) {
            const nx = cx + dx, ny = cy + dy;
            if (this.isEmpty(nx, ny) && !me.visited[nx][ny] && lab[nx + ny * SIZE] === -1) { lab[nx + ny * SIZE] = k; q[tail++] = nx + ny * SIZE; }
          }
        }
        sizes.push(tail); out.reach += tail;
      }
      out[d] = sizes[lab[s]];
    }
    return out;
  }
  rvBefore(me, a) {
    try {
      this.rv.cur = a.command;
      const pre = { dmg: this.events.damage.slice(), x: me.x, y: me.y, areas: null, power: null, charge: 0, dir: null };
      if (a.activator === 'MOVE') {
        const parts = a.command.split(' ');
        pre.dir = parts[1];
        if (parts.length === 3) { pre.power = parts[2].trim(); pre.charge = me.charges[pre.power]; }
        pre.areas = this.rvAreas(me);
      } else if (a.activator === 'SURFACE') pre.areas = this.rvAreas(me);
      return pre;
    } catch (e) { return null; }
  }
  rvAfter(me, a, pre) {
    try {
      const rv = this.rv;
      rv.cur = null;
      if (!pre) return;
      const r = rv.players[me.index], o = this.players[1 - me.index], ro = rv.players[1 - me.index], frame = rv.frame;
      const selfD = this.events.damage[me.index] - pre.dmg[me.index], oppD = this.events.damage[o.index] - pre.dmg[o.index];
      const parts = a.command.split(' ');
      r.orders++;
      switch (a.activator) {
        case 'MOVE': {
          r.seg.moves++;
          if (pre.power && r.charged[pre.power] !== undefined) { r.charged[pre.power]++; if (pre.charge >= POWER_MAX[pre.power]) r.full[pre.power]++; }
          else r.noPower++;
          const ar = pre.areas, chosen = ar ? ar[pre.dir] : 0;
          if (chosen > 0) {   // keep the move that cut the path off the most since the last SURFACE
            let bestDir = null;
            for (const d of ['N', 'E', 'S', 'W']) if (!bestDir || ar[d] > ar[bestDir]) bestDir = d;
            const best = ar[bestDir], loss = best - chosen;
            if (loss >= RV_GAP && chosen < RV_RATIO * best && (!r.seg.trap || loss > r.seg.trap.loss)) {
              r.seg.trap = { frame, x: pre.x, y: pre.y, dir: pre.dir, area: chosen, bestDir, best, loss };
            }
          }
          break;
        }
        case 'SURFACE': {
          const ar = pre.areas;
          const kind = !rv.hadSurface ? 'fallback' : ar && ar.free === 0 ? 'forced' : 'voluntary';
          r.surfaces.push({ frame, kind, boxed: !!ar && ar.free === 0, reach: ar ? ar.reach : 0, moves: r.seg.moves, trap: r.seg.trap, sector: this.events.surfaced,
            skipped: kind === 'fallback' ? this.events.skipped.slice() : null, orders: rv.raw[me.index] });
          r.seg = { moves: 0, trap: null };
          break;
        }
        case 'TORPEDO': case 'TRIGGER': {
          const x = javaInt(parts[1]), y = javaInt(parts[2]);
          if (a.activator === 'TORPEDO') r.used.TORPEDO++;
          const laid = a.activator === 'TRIGGER' ? rv.mineFrames.get(`${me.index}:${x},${y}`) || null : null;
          r.shots.push({ frame, src: a.activator, x, y, fromX: me.x, fromY: me.y, self: selfD, opp: oppD, kill: o.life <= 0 });
          if (oppD > 0) ro.hitsTaken.push({ frame, src: a.activator, x, y, amount: oppD, laid });
          break;
        }
        case 'SONAR': r.used.SONAR++; break;
        case 'SILENCE': r.used.SILENCE++; r.seg.moves += javaInt(parts[2]) || 0; break;
        case 'MINE': r.used.MINE++; if (this.events.mine) rv.mineFrames.set(`${me.index}:${this.events.mine[0]},${this.events.mine[1]}`, frame); break;
      }
    } catch (e) { /* review only */ }
  }
  rvEndTurn(me) {
    try {
      const rv = this.rv, r = rv.players[me.index];
      r.rounds++;
      for (const s of this.events.skipped) {   // "<order>: <reason>"; the reasons contain no ": "
        const i = s.lastIndexOf(': '), cmd = s.slice(0, i), msg = s.slice(i + 2);
        const e = r.skipped[msg] || (r.skipped[msg] = { count: 0, frame: rv.frame, cmd });
        e.count++; r.skippedTotal++;
      }
    } catch (e) { /* review only */ }
  }
  rvDisqualified(p, reason) {
    try {
      const rv = this.rv, frame = this.turn + 1, now = rv.rawFrame[p] === frame;
      rv.players[p].dq = { frame, reason: String(reason), orders: now ? rv.raw[p] : null, cmd: now ? rv.cur : null };
    } catch (e) { /* review only */ }
  }

  review() {
    const out = [];
    for (let p = 0; p < 2; p++) {
      try { out.push(...this.rvItems(p)); } catch (e) { /* skip this player's review rather than fail */ }
    }
    return out;
  }

  rvItems(p) {
    const rv = this.rv, r = rv.players[p], me = this.players[p], o = this.players[1 - p], ro = rv.players[1 - p];
    const items = [];
    const add = (prio, turn, kind, code, message) => items.push({ prio, turn, player: p, kind, code, message });
    const at = (x, y) => `(${x}, ${y})`;
    const sum = list => list.reduce((n, v) => n + v, 0);

    // disqualification: the exact reason and turn
    if (r.dq) {
      const d = r.dq, reason = /[.!?]$/.test(d.reason) ? d.reason : d.reason + '.';
      let hint = ' Print the orders exactly in the documented format.';
      if (/^timeout/i.test(d.reason)) {
        const limit = d.frame <= 1 ? OceanReferee.meta.firstTurnTimeout : OceanReferee.meta.turnTimeout;   // frame 1 = placement
        hint = ` Aim well under the ${limit} ms limit (about ${Math.round(limit * 0.6)} ms): CodinGame's servers can be slower than this PC.`;
      }
      else if (/visit same location/.test(d.reason)) hint = ' Keep your own set of visited cells (SILENCE steps count too) and SURFACE when no unvisited neighbour is left.';
      else if (/outside map or onto island/.test(d.reason)) hint = ' Check the map bounds and islands before every MOVE and SILENCE step.';
      else if (/Unknown command|Invalid power/.test(d.reason)) hint = ` Your league allows ${[...me.commands].join(', ')} (and MSG).`;
      const shown = d.orders !== null ? ` Your output was "${d.orders}"${d.cmd && d.cmd !== jtrim(d.orders) ? ` and the failing order was "${d.cmd}"` : ''}.` : '';
      add(100, d.frame, 'mistake', 'disqualified', `Turn ${d.frame}: you were disqualified: ${reason}${shown}${hint}`);
    }

    // a life lost because no order could run
    // (when boxed in anyway the life was lost to the trap, so that case is only a warning)
    const why = f => f.skipped && f.skipped.length ? `skipped ${f.skipped.slice(0, 2).join('; ')}` : `your output was "${f.orders}"`;
    const fbFree = r.surfaces.filter(s => s.kind === 'fallback' && !s.boxed), fbBoxed = r.surfaces.filter(s => s.kind === 'fallback' && s.boxed);
    if (fbFree.length) {
      const f = fbFree[0];
      add(80, f.frame, 'mistake', 'surface-fallback', `Turn ${f.frame}: none of your orders could run (${why(f)}), so the referee surfaced you and you lost a life${fbFree.length > 1 ? `; this happened ${fbFree.length} times` : ''}. Always include a MOVE: devices that are not ready are skipped.`);
    }
    if (fbBoxed.length) {
      const f = fbBoxed[0];
      add(42, f.frame, 'warning', 'surface-fallback', `Turn ${f.frame}: you were boxed in and none of your orders could run (${why(f)}), so the referee surfaced you${fbBoxed.length > 1 ? ` (${fbBoxed.length} times)` : ''}. Print SURFACE yourself when no unvisited neighbour is left, so your bot knows its path was reset.`);
    }

    // own explosions
    const selfShots = r.shots.filter(s => s.self > 0 && !s.kill);
    if (selfShots.length) {
      const w = selfShots.reduce((a, b) => (b.self - b.opp > a.self - a.opp ? b : a));
      const total = sum(selfShots.map(s => s.self));
      const what = w.src === 'TORPEDO' ? `TORPEDO ${w.x} ${w.y}` : `TRIGGER ${w.x} ${w.y} (your own mine)`;
      const where = w.x === w.fromX && w.y === w.fromY ? 'on your own cell' : 'next to you';
      add(70 + Math.min(9, total), w.frame, w.self >= w.opp ? 'mistake' : 'warning', 'self-damage', `Turn ${w.frame}: your ${what} exploded ${where} at ${at(w.fromX, w.fromY)}: you took ${w.self} damage, the opponent ${w.opp}.${selfShots.length > 1 ? ` Your own explosions cost you ${total} damage over ${selfShots.length} shots.` : ''} Never aim within one cell of yourself unless the trade wins the game.`);
    }

    // SURFACE forced by a path that boxed itself in
    const forced = r.surfaces.filter(s => s.boxed && s.kind !== 'voluntary');
    const trapped = forced.filter(s => s.trap);
    if (trapped.length) {
      const s = trapped[0], t = s.trap;
      add(65, t.frame, 'mistake', 'forced-surface', `Turn ${t.frame}: MOVE ${t.dir} from ${at(t.x, t.y)} entered a region of ${plural(t.area, 'unvisited cell')} while ${t.bestDir} still led to ${t.best}; at turn ${s.frame} you were boxed in and had to SURFACE (-1 life).${trapped.length > 1 ? ` ${trapped.length === forced.length ? (forced.length === 2 ? 'Both' : `All ${forced.length}`) : `${trapped.length} of your ${forced.length}`} forced surfaces started like this.` : ''} Flood-fill the unvisited water before each move and keep the biggest region.`);
    }
    const short = forced.filter(s => !s.trap && s.moves < 20);
    if (short.length) {
      const s = short[0];
      add(45, s.frame, 'warning', 'forced-surface', `Turn ${s.frame}: you were boxed in and had to SURFACE after only ${plural(s.moves, 'move')} on that path${short.length > 1 ? ` (${short.length} such surfaces)` : ''}. Prefer moves that keep many unvisited cells reachable.`);
    }
    const vol = r.surfaces.filter(s => s.kind === 'voluntary' && s.reach >= 15);
    if (vol.length) {
      const s = vol[0];
      add(40, s.frame, 'warning', 'voluntary-surface', `Turn ${s.frame}: you chose to SURFACE while ${s.reach} unvisited cells were still reachable; it cost a life and told the opponent you were in sector ${s.sector}${vol.length > 1 ? ` (${vol.length} such surfaces)` : ''}. Surface only when you run out of moves.`);
    }

    // the opponent's hardest hit
    const torpTaken = sum(r.hitsTaken.filter(h => h.src === 'TORPEDO').map(h => h.amount));
    const mineTaken = sum(r.hitsTaken.filter(h => h.src === 'TRIGGER').map(h => h.amount));
    if (torpTaken + mineTaken >= 2) {
      const byFrame = new Map();
      for (const h of r.hitsTaken) {
        const e = byFrame.get(h.frame) || { frame: h.frame, amount: 0, hits: [] };
        e.amount += h.amount; e.hits.push(h); byFrame.set(h.frame, e);
      }
      let worst = null;
      for (const e of byFrame.values()) if (!worst || e.amount > worst.amount) worst = e;
      const desc = worst.hits.map(h => h.src === 'TORPEDO' ? `TORPEDO at ${at(h.x, h.y)}` : `mine at ${at(h.x, h.y)}${h.laid ? ` (dropped at turn ${h.laid})` : ''}`).join(' and ');
      const lastSurf = r.surfaces.filter(s => s.frame < worst.frame).pop();
      let ctx = '';
      if (lastSurf && worst.frame - lastSurf.frame <= 3) ctx = ` You had surfaced at turn ${lastSurf.frame}, which told it your sector (${lastSurf.sector}).`;
      else if (me.powers.has('SILENCE') && r.used.SILENCE === 0) ctx = ' You never used SILENCE to shake off its tracking.';
      const totals = `In total its torpedoes did ${torpTaken} damage to you` + (mineTaken ? ` and its mines ${mineTaken}` : '') + '.';
      add(50, worst.frame, 'warning', 'big-damage-taken', `Turn ${worst.frame}: the opponent's ${desc} hit you for ${worst.amount}.${ctx} ${totals}`);
    }

    // orders skipped silently
    if (r.skippedTotal) {
      const list = Object.entries(r.skipped).sort((a, b) => b[1].count - a[1].count);
      const txt = list.slice(0, 2).map(([msg, e]) => `${e.count} x "${msg}" (first at turn ${e.frame}: ${e.cmd})`).join(', ');
      const top = list[0][0];
      const hint = /^Not enough charges/.test(top) ? 'Use a device only when its cooldown in your input is 0.'
        : /out of range/.test(top) ? 'A torpedo reaches at most 4 cells along a water path.'
          : /no active mine/.test(top) ? 'A mine is armed from your next turn on, and TRIGGER needs its exact cell.'
            : 'Drop a mine only on free water next to you that holds no mine of yours yet.';
      add(35, list[0][1].frame, 'warning', 'skipped-order', `${plural(r.skippedTotal, 'order')} did nothing and ${r.skippedTotal === 1 ? 'was' : 'were'} skipped: ${txt}. ${hint}`);
    }

    // torpedo accuracy and mines
    const torps = r.shots.filter(s => s.src === 'TORPEDO');
    if (torps.length) {
      const hits = torps.filter(s => s.opp > 0).length, direct = torps.filter(s => s.opp >= 2).length;
      const nobody = torps.filter(s => s.opp === 0 && s.self === 0).length, selfOnly = torps.filter(s => s.opp === 0 && s.self > 0).length;
      const bad = torps.length >= 4 && hits < 0.25 * torps.length;
      add(bad ? 30 : 20, null, bad ? 'warning' : 'tip', bad ? 'torpedo-misses' : 'torpedo-summary', `You fired ${torps.length} torpedo${torps.length === 1 ? '' : 'es'}: ${hits} hit the opponent (${direct} direct), ${nobody} hit nobody${selfOnly ? `, ${selfOnly} hurt only you` : ''}.${bad ? ' Fire when the cells the opponent can be in fit inside the 3x3 blast, not on a guess.' : ''}`);
    }
    if (me.powers.has('MINE') && r.used.MINE) {
      const trig = r.shots.filter(s => s.src === 'TRIGGER'), th = trig.filter(s => s.opp > 0).length;
      if (r.used.MINE >= 3 && !trig.length) add(27, null, 'warning', 'mines-unused', `You dropped ${r.used.MINE} mines but never triggered one. Trigger a mine when the opponent's possible cells are within one cell of it.`);
      else add(18, null, 'tip', 'mine-summary', `You dropped ${plural(r.used.MINE, 'mine')} and triggered ${trig.length} (${th} hit the opponent).`);
    }

    // charges that never turned into anything
    const unused = [...me.powers].filter(pw => r.charged[pw] >= POWER_MAX[pw] && r.used[pw] === 0);
    if (unused.length) {
      add(28, null, 'warning', 'unused-charges', `You charged ${unused.map(pw => `${pw} ${plural(r.charged[pw], 'time')}`).join(' and ')} but never used ${unused.length > 1 ? 'them' : 'it'}. Use what you charge, or put those charges into a device you do use.`);
    }
    const fullList = Object.entries(r.full).filter(([k, n]) => n && !unused.includes(k)), fullTotal = sum(fullList.map(([, n]) => n));
    if (fullTotal >= 10 || r.noPower >= 10) {
      const parts = [];
      if (fullTotal >= 10) parts.push(`${fullTotal} MOVE orders charged a device that was already full (${fullList.map(([k, n]) => `${k} ${n}`).join(', ')})`);
      if (r.noPower >= 10) parts.push(`${r.noPower} MOVE orders charged nothing`);
      add(15, null, 'tip', 'wasted-charges', `${parts.join(' and ')}. Every MOVE can add a charge: pick a device that is not full yet${me.powers.size === 1 ? ', or fire the torpedo more often' : ''}.`);
    }

    // how it ended and where the lives went
    if (!r.dq && !ro.dq) {
      const res = me.life === o.life ? 'drew' : me.life > o.life ? 'won' : 'lost';
      const lives = `${me.life}-${o.life}`;
      let how;
      if (me.life <= 0 || o.life <= 0) how = `You ${res} ${lives} on lives at turn ${this.turn}.`;
      else if (this.frames >= MAX_FRAMES) how = `The game hit CodinGame's 999-action cap at turn ${this.turn} and you ${res} ${lives} on lives; you executed ${(r.orders / Math.max(1, r.rounds)).toFixed(1)} orders per turn (each one counts toward the cap).`;
      else how = `The game reached the turn limit and you ${res} ${lives} on lives.`;
      const surf = r.surfaces.length, kinds = ['forced', 'voluntary', 'fallback'].map(k => [k, r.surfaces.filter(s => s.kind === k).length]).filter(([, n]) => n);
      const parts = [];
      if (torpTaken) parts.push(`${torpTaken} from enemy torpedoes`);
      if (mineTaken) parts.push(`${mineTaken} from enemy mines`);
      const own = sum(r.shots.map(s => s.self));
      if (own) parts.push(`${own} from your own explosions`);
      if (surf) parts.push(`${surf} from SURFACE (${kinds.map(([k, n]) => `${n} ${k}`).join(', ')})`);
      add(60, null, 'tip', 'game-summary', `${how} Damage you took: ${parts.length ? parts.join(', ') : 'none'}.`);
    }
    return items.sort((x, y) => y.prio - x.prio).slice(0, RV_MAX_ITEMS).map(({ prio, ...it }) => it);
  }
}

module.exports = { Referee: OceanReferee, LEAGUES };
