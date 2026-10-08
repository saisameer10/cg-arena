'use strict';
// Port of java.util.Random (48-bit LCG). CodinGame referees draw their maps from it, so a
// game seeded here with a CodinGame seed produces the same map as on codingame.com.

const MULT = 0x5DEECE66Dn, ADD = 0xBn, MASK = (1n << 48n) - 1n;

function toBigInt(seed) {
  if (typeof seed === 'bigint') return seed;
  if (typeof seed === 'number' && Number.isFinite(seed)) return BigInt(Math.trunc(seed));
  const s = String(seed).trim();
  if (/^[+-]?\d+$/.test(s)) return BigInt(s);
  let h = 0n;                                   // non-numeric seed: cheap string hash
  for (const ch of s) h = (h * 31n + BigInt(ch.charCodeAt(0))) & ((1n << 63n) - 1n);
  return h;
}

class JavaRandom {
  constructor(seed) {
    this.seed = (toBigInt(seed) ^ MULT) & MASK;
  }
  next(bits) {
    this.seed = (this.seed * MULT + ADD) & MASK;
    return Number(this.seed >> (48n - BigInt(bits)));   // bits <= 31 keeps it a positive int
  }
  nextInt(bound) {
    if (!(bound > 0)) throw new Error('bound must be positive');
    let r = this.next(31);
    const m = bound - 1;
    if ((bound & m) === 0) return Number((BigInt(bound) * BigInt(r)) >> 31n);
    for (let u = r; u - (r = u % bound) + m > 0x7fffffff; u = this.next(31));   // Java's int-overflow test
    return r;
  }
  nextDouble() {
    return (this.next(26) * 134217728 + this.next(27)) / 9007199254740992;
  }
}

module.exports = { JavaRandom, toBigInt };
