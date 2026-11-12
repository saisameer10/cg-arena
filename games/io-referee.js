'use strict';
// Generic referee for classic input/output puzzles (CodinGame "classic puzzles", Clash of Code):
// the program gets the whole test input once, stdin is closed, and its output lines are compared
// with the expected output. Built from game.json, so these challenges need no referee code.
const { Referee } = require('./base');

const lines = text => {
  const l = String(text || '').replace(/\r/g, '').split('\n');
  if (l.length && l[l.length - 1] === '') l.pop();
  return l;
};
const clip = s => (s.length > 80 ? s.slice(0, 77) + '...' : s);

function makeIoReferee(cfg) {
  const limit = Number(cfg.timeLimitMs) || 2000;
  return class IoReferee extends Referee {
    static meta = { id: cfg.id, name: cfg.name || cfg.id, playerCount: 1, firstTurnTimeout: limit, turnTimeout: limit, maxTurns: 1, viewer: 'io' };

    constructor(opts = {}) {
      super({ ...opts, playerCount: 1 });
      const t = opts.testCase || { input: '', expected: '' };
      this.input = lines(t.input);
      this.expected = lines(t.expected);
      this.got = null;
      this.outcome = null;
      this.mismatch = null;
      this.closeInputAfterTurn = true;     // programs may read until end of file
    }
    // the viewer shows the first lines only; huge tests are not shipped to the browser in full
    getStaticInfo() { const cut = a => a.length > 400 ? [...a.slice(0, 400), `… ${a.length - 400} more line(s)`] : a; return { input: cut(this.input), expected: cut(this.expected), timeLimitMs: limit }; }
    getActors() { return [0]; }
    getTurnInput() { return this.input; }
    outputLines() { return Math.max(1, this.expected.length); }
    applyOutput(p, out) {
      this.got = out;
      for (let i = 0; i < this.expected.length; i++) {
        const want = this.expected[i].trimEnd(), have = (out[i] === undefined ? '' : out[i]).trimEnd();
        if (want !== have) {
          this.mismatch = { line: i + 1, want, have };
          this.outcome = { passed: false, message: `Line ${i + 1}: expected "${clip(want)}" but found "${clip(have)}"` };
          return;
        }
      }
      this.outcome = { passed: true, message: `${this.expected.length} line(s) correct` };
    }
    onDisqualify(p, reason) {
      const msg = /exited/.test(reason) ? `your program ended before printing ${this.expected.length} line(s) (${reason})`
        : /^timeout/.test(reason) ? `no complete answer within ${limit} ms (expected ${this.expected.length} line(s))`
        : reason;
      this.outcome = { passed: false, message: msg };
    }
    endTurn() { super.endTurn(); if (!this.outcome) this.outcome = { passed: false, message: 'no output' }; }
    isGameOver() { return !!this.outcome || this.turn >= 1; }
    getFrame() { return { got: this.got, outcome: this.outcome, mismatch: this.mismatch }; }
    getResult() {
      const o = this.outcome || { passed: false, message: 'not run' };
      return { scores: [o.passed ? 1 : 0], winner: o.passed ? 0 : null, passed: o.passed, message: o.message };
    }
    review() {
      if (!this.mismatch) return [];
      const { line, want, have } = this.mismatch;
      const tips = [{ turn: 1, player: 0, kind: 'mistake', code: 'wrong-line', message: `First wrong line is ${line}: the test expects "${clip(want)}", your program printed "${clip(have)}".` }];
      if (want.trim() === have.trim()) tips.push({ turn: 1, player: 0, kind: 'tip', code: 'spacing-only', message: 'Only spacing differs: check leading spaces or separators.' });
      else if (want.toLowerCase() === have.toLowerCase()) tips.push({ turn: 1, player: 0, kind: 'tip', code: 'case-only', message: 'Only upper/lower case differs.' });
      return tips;
    }
  };
}

module.exports = { makeIoReferee };
