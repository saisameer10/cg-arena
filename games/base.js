'use strict';
// Base referee contract. Every game implements this. The engine (server/engine/match.js)
// only talks to referees through these methods, so a new game = one referee + one viewer.

class GameError extends Error {}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Referee {
  constructor({ seed = 1, playerCount = 2, league = null } = {}) {
    this.seed = seed;                    // number or numeric string (CodinGame seeds can exceed 2^53)
    this.league = league;
    this.rng = mulberry32((Number(seed) || 1) >>> 0);
    this.playerCount = playerCount;
    this.turn = 0;             // one engine turn = one call to getActors()
    this.summary = [];
    this.dq = new Array(playerCount).fill(null);
  }
  randInt(n) { return Math.floor(this.rng() * n); }
  log(msg) { this.summary.push(msg); }
  takeSummary() { const s = this.summary; this.summary = []; return s; }
  disqualify(p, reason) {
    if (this.dq[p]) return;
    this.dq[p] = reason;
    this.log(`Player ${p} loses: ${reason}`);
    this.onDisqualify(p, reason);
  }
  // ---- to implement in subclasses ----
  onDisqualify(/* p, reason */) {}
  getStaticInfo() { return {}; }       // sent once to the viewer (map, grid size, ...)
  getInitInput(/* p */) { return []; } // lines sent to a bot before its first turn
  getActors() { return []; }           // player indexes that act in this engine turn, in order
  getTurnInput(/* p */) { return []; } // lines sent to player p for this turn
  outputLines(/* p */) { return 1; }   // how many lines we read back
  applyOutput(/* p, lines */) {}       // throw GameError for an illegal action
  endTurn() { this.turn++; }
  isGameOver() { return false; }
  getFrame() { return {}; }            // JSON state for the viewer
  getResult() { return { scores: [], winner: null }; }
}

module.exports = { Referee, GameError, mulberry32 };
