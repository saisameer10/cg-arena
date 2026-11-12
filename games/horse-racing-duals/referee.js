'use strict';
// Horse-racing Duals: a classic input/output puzzle (CodinGame type CODE, easy).
//
// The rules are exactly those of the generic io referee (games/io-referee.js): the program gets the
// whole input once, then end of file, and its first output line is compared with the expected answer.
// This file exists only to add a review() that explains WHY an answer is wrong (unsorted neighbours,
// text sort, skipped pair, missed duplicates, O(N^2) timeout...). game.json has "type": "io"; the
// registry (games/index.js) loads this referee.js instead of the plain generic one when it exists.
// To go back to the generic review ("expected X, found Y"), delete this file.
//
// Stable review codes (all kind "mistake", turn 1):
//   empty-answer, not-a-number, number-format, sorted-as-text, neighbours-in-input-order,
//   horse-not-read, loop-bounds, equal-strengths-ignored, kept-largest-difference, self-comparison,
//   negative-difference, initial-minimum-too-small, not-a-pair-difference, missed-closest-pair,
//   too-slow, no-answer-in-time, ended-without-answer
const path = require('path');
const { makeIoReferee } = require('../io-referee');
const cfg = require('./game.json');

const IoReferee = makeIoReferee({ ...cfg, id: path.basename(__dirname) });
const LIMIT = Number(cfg.timeLimitMs) || 2000;

const clip = s => (s.length > 60 ? s.slice(0, 57) + '...' : s);
const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// smallest difference between neighbours of an already ordered list (abs = absolute values)
function minNeighbour(a, abs = true) {
  let best = Infinity;
  for (let i = 1; i < a.length; i++) { const d = abs ? Math.abs(a[i] - a[i - 1]) : a[i] - a[i - 1]; if (d < best) best = d; }
  return a.length > 1 ? best : null;
}
const closest = vals => minNeighbour([...vals].sort((x, y) => x - y));

// Everything the review needs about one test input, plus the answers that typical wrong programs give.
function analyse(inputLines) {
  const n = parseInt(inputLines[0], 10);
  const vals = inputLines.slice(1, 1 + n).map(s => parseInt(s, 10));
  const order = vals.map((v, i) => ({ v, line: i + 2 })).sort((a, b) => a.v - b.v || a.line - b.line);
  const sorted = order.map(o => o.v);
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) gaps.push(sorted[i] - sorted[i - 1]);
  const best = gaps.length ? gaps.reduce((x, y) => Math.min(x, y), Infinity) : 0;
  const k = gaps.indexOf(best);
  const pair = k >= 0 ? [order[k], order[k + 1]] : null;
  const text = vals.map(String).sort().map(Number);               // JavaScript's default sort, or strings in Python
  const minOf = list => (list.length ? list.reduce((a, b) => Math.min(a, b), Infinity) : null);
  const unique = [...new Set(vals)];
  return {
    n, vals, sorted, gaps, best, pair,
    set: new Set(vals),
    models: [
      // [code, value, detail] in the order they are tried: the first match names the mistake
      ['neighbours-in-input-order', minNeighbour(vals, true), 'abs'],
      ['neighbours-in-input-order', minNeighbour(vals, false), 'signed'],
      ['sorted-as-text', minNeighbour(text, true), 'abs'],
      ['sorted-as-text', minNeighbour(text, false), 'signed'],
      ['horse-not-read', n >= 3 ? closest(vals.slice(0, -1)) : null, 'last'],
      ['horse-not-read', n >= 3 ? closest(vals.slice(1)) : null, 'first'],
      ['loop-bounds', n >= 3 ? minOf(gaps.slice(0, -1)) : null, 'last'],
      ['loop-bounds', n >= 3 ? minOf(gaps.slice(1)) : null, 'first'],
      ['equal-strengths-ignored', unique.length >= 2 && unique.length < vals.length ? closest(unique) : null, ''],
      ['kept-largest-difference', sorted.length ? sorted[sorted.length - 1] - sorted[0] : null, 'range'],
      ['kept-largest-difference', gaps.length ? gaps.reduce((x, y) => Math.max(x, y), -Infinity) : null, 'gap'],
    ],
  };
}

// Is d the difference of two different horses?
function isPairDifference(an, d) {
  if (d < 0) return false;
  if (d === 0) return an.best === 0;
  for (const v of an.vals) if (an.set.has(v + d)) return true;
  return false;
}

function diagnose(an, have) {
  const D = an.best;
  const [a, b] = an.pair || [{ v: '?', line: '?' }, { v: '?', line: '?' }];
  const closestTxt = D === 0
    ? `horses on input lines ${a.line} and ${b.line} both have strength ${a.v}, so the answer is 0`
    : `the closest strengths are ${a.v} (input line ${a.line}) and ${b.v} (input line ${b.line}), difference ${D}`;
  const got = have.trim();
  const R = (code, message) => ({ code, message });
  if (got === '') return R('empty-answer', `Your first output line is empty. Print the difference as a number: ${closestTxt}.`);
  if (!/^[+-]?\d+$/.test(got)) {
    if (Number.isFinite(Number(got)) && Number(got) === D) return R('number-format', `You printed "${clip(got)}": the value is right but it must be printed as a plain integer (${D}). In Python, int division (//) or int(...); in Java, an int, not a double.`);
    if (got === 'answer') return R('not-a-number', `You printed the starter's placeholder "answer". Replace it with the smallest difference (here ${D}): sort the strengths, then compare neighbours.`);
    return R('not-a-number', `Your first output line is "${clip(got)}", not an integer. Print only the answer (here ${D}) on stdout; debug messages go to stderr.`);
  }
  const g = Number(got);
  if (g === D) return R('number-format', `You printed "${clip(got)}": print exactly "${D}" (no sign, no leading zeros).`);
  // the typical wrong programs that print exactly g; the first one names the mistake, the others are
  // mentioned because the same number cannot tell them apart on this test
  const matches = an.models.filter(([, value]) => value !== null && value === g);
  // with equal strengths in the input, removing duplicates (a set) is by far the likeliest cause
  if (D === 0) matches.sort((x, y) => (y[0] === 'equal-strengths-ignored') - (x[0] === 'equal-strengths-ignored'));
  if (matches.length) {
    const [code, , detail] = matches[0];
    const others = [...new Set(matches.slice(1).map(([c, , d]) => SHORT[c](d)))].filter(s => s !== SHORT[code](detail));
    const also = others.length ? ` (The same number also comes from ${others.join(' or ')}.)` : '';
    const msg = {
      'neighbours-in-input-order': () => `You printed ${g}, the smallest ${detail === 'signed' ? 'signed ' : ''}difference between horses that are next to each other in the input. The closest pair is not always adjacent in the input: ${closestTxt}. Sort the strengths first, then compare neighbours${detail === 'signed' ? ' (difference = larger - smaller)' : ''}.`,
      'sorted-as-text': () => `You printed ${g}, which is the answer after sorting the strengths as text ("10" before "9"). ${cap(closestTxt)}. Sort as numbers: in JavaScript sort((x, y) => x - y), in Python convert with int() before sorting.`,
      'horse-not-read': () => `You printed ${g}, the right answer without the ${detail} horse (input line ${detail === 'last' ? an.n + 1 : 2}, strength ${detail === 'last' ? an.vals[an.n - 1] : an.vals[0]}). ${cap(closestTxt)}. Read and use all N = ${an.n} strengths (check the bounds of the reading loop).`,
      'loop-bounds': () => `You printed ${g}: after sorting, your loop skipped the ${detail} pair of neighbours, which is the closest one. ${cap(closestTxt)}. With p sorted, compare p[i] - p[i-1] for every i from 1 to N-1.`,
      'equal-strengths-ignored': () => `You printed ${g}, the answer once duplicate strengths are removed. Equal strengths are a valid pair: ${closestTxt}. Do not deduplicate (no set) and do not skip differences of 0.`,
      'kept-largest-difference': () => `You printed ${g}, the ${detail === 'range' ? 'difference between the strongest and the weakest horse' : 'largest gap between sorted neighbours'}: you kept the largest difference instead of the smallest. ${cap(closestTxt)}.`,
    }[code]();
    return R(code, msg + also);
  }
  if (g === 0 && D > 0) return R('self-comparison', `You printed 0, but all ${fmt(an.n)} strengths are different: ${closestTxt}. A difference of 0 usually means a horse was compared with itself (start the inner loop at j = i + 1).`);
  if (g < 0) return R('negative-difference', `You printed ${g}: a difference must be >= 0. ${cap(closestTxt)}. Subtract the smaller strength from the larger one (or use the absolute value).`);
  if (D === 0) return R('equal-strengths-ignored', `You printed ${g}, but ${closestTxt}. Two equal strengths give difference 0.`);
  if (!isPairDifference(an, g) && g < D) return R('initial-minimum-too-small', `You printed ${g}, which is smaller than the real answer and is not the difference of any two horses: your starting value for the minimum is probably too small. ${cap(closestTxt)}. Start from a value above 10,000,000 (e.g. Integer.MAX_VALUE) or from the first difference.`);
  if (!isPairDifference(an, g)) return R('not-a-pair-difference', `You printed ${g}, but no two horses differ by exactly ${g}. ${cap(closestTxt)}.`);
  return R('missed-closest-pair', `You printed ${g}, the difference of two horses, but a closer pair exists: ${closestTxt}. Sort the strengths and take the smallest difference between neighbours.`);
}
const cap = s => s[0].toUpperCase() + s.slice(1);
const SHORT = {
  'neighbours-in-input-order': () => 'comparing only neighbours in input order',
  'sorted-as-text': () => 'sorting the strengths as text',
  'horse-not-read': d => `ignoring the ${d} horse`,
  'loop-bounds': d => `a loop that skips the ${d} sorted pair`,
  'equal-strengths-ignored': () => 'removing equal strengths',
  'kept-largest-difference': () => 'keeping the largest difference',
};

class Referee extends IoReferee {
  review() {
    const o = this.outcome;
    if (!o || o.passed) return [];
    const an = analyse(this.input);
    const item = (code, message) => [{ turn: 1, player: 0, kind: 'mistake', code, message }];
    const reason = this.dq[0];
    if (reason) {
      if (/^timeout/.test(reason)) {
        if (an.n >= 3000) return item('too-slow', `No answer within the time limit (${LIMIT} ms, plus the arena's start-up grace) for N = ${fmt(an.n)} horses. Comparing every pair is N(N-1)/2 = ${fmt(an.n * (an.n - 1) / 2)} differences; sort the strengths (N log N) and compare only neighbours. Also read the input with a fast reader (BufferedReader in Java, sys.stdin in Python).`);
        return item('no-answer-in-time', `No answer within the time limit although there are only ${an.n} horses: the program is probably waiting for more input than there is (line 1 is N, then exactly N lines with one strength each) or stuck in a loop.`);
      }
      return item('ended-without-answer', `Your program ended before printing an answer (${reason}). Check the parsing: line 1 is N, then N lines with ONE strength each (not all on one line). Look at the Console tab for the error. In Java, keep a main method in class Solution (as on CodinGame) or class Player.`);
    }
    if (!this.mismatch) return [];
    const { code, message } = diagnose(an, this.mismatch.have);
    return item(code, message);
  }
}

module.exports = { Referee, analyse, diagnose };
