'use strict';
// One bot = one OS process speaking the CodinGame stdin/stdout protocol.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { LANGUAGES } = require('./languages');

class BotError extends Error {}

function runToCompletion(spec, cwd, timeoutMs = 60000) {
  return new Promise((resolve) => {
    const child = spawn(spec.cmd, spec.args, { cwd, windowsHide: true });
    let out = '', err = '';
    child.stdout.on('data', d => out += d);
    child.stderr.on('data', d => err += d);
    const t = setTimeout(() => child.kill(), timeoutMs);
    child.on('error', e => { clearTimeout(t); resolve({ code: -1, out, err: err + e.message }); });
    child.on('close', code => { clearTimeout(t); resolve({ code, out, err }); });
  });
}

// Writes source into dir and compiles it if the language needs it. Returns {ok, log}.
async function prepareBot(langId, source, dir) {
  const lang = LANGUAGES[langId];
  if (!lang) throw new BotError(`Unknown language ${langId}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, lang.fileName), source, 'utf8');
  if (lang.compile) {
    const r = await runToCompletion(lang.compile(dir), dir);
    if (r.code !== 0) return { ok: false, log: (r.out + '\n' + r.err).trim() || `compiler exited with ${r.code}` };
  }
  return { ok: true, log: '' };
}

class BotProcess {
  constructor({ name, spec, cwd }) {
    this.name = name;
    this.spec = spec;
    this.cwd = cwd;
    this.lines = [];
    this.waiters = [];
    this.stderr = '';
    this.exited = null;
    this.buf = '';
  }
  start() {
    const env = Object.assign({}, process.env, this.spec.env || {});
    this.proc = spawn(this.spec.cmd, this.spec.args, { cwd: this.cwd, env, windowsHide: true });
    this.proc.stdout.setEncoding('utf8');
    this.proc.stderr.setEncoding('utf8');
    this.proc.stdout.on('data', d => {
      this.buf += d;
      let i;
      while ((i = this.buf.indexOf('\n')) >= 0) {
        let line = this.buf.slice(0, i);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        this.buf = this.buf.slice(i + 1);
        this.lines.push(line);
        this._flush();
      }
    });
    this.proc.stderr.on('data', d => { if (this.stderr.length < 200000) this.stderr += d; });
    this.proc.on('error', e => { this.exited = `failed to start (${e.code || e.message}): ${this.spec.cmd}`; this._flush(); });
    this.proc.on('close', code => { if (!this.exited) this.exited = `process exited with code ${code}`; this._flush(); });
    // stdio sockets can emit errors on their own (e.g. ENOTCONN on Windows when the child dies early)
    for (const s of [this.proc.stdin, this.proc.stdout, this.proc.stderr]) s.on('error', () => {});
    return this;
  }
  _flush() {
    while (this.waiters.length && this.lines.length) this.waiters.shift().resolve(this.lines.shift());
    if (this.exited) while (this.waiters.length) this.waiters.shift().reject(new BotError(this.exited));
  }
  write(text) {
    if (this.exited || !this.proc.stdin.writable) return;
    this.proc.stdin.write(text);
  }
  readLine(timeoutMs) {
    if (this.lines.length) return Promise.resolve(this.lines.shift());
    if (this.exited) return Promise.reject(new BotError(this.exited));
    return new Promise((resolve, reject) => {
      const w = { resolve: null, reject: null };
      const timer = setTimeout(() => {
        const i = this.waiters.indexOf(w);
        if (i >= 0) this.waiters.splice(i, 1);
        reject(new BotError(`timeout: no output within ${timeoutMs} ms`));
      }, timeoutMs);
      w.resolve = v => { clearTimeout(timer); resolve(v); };
      w.reject = e => { clearTimeout(timer); reject(e); };
      this.waiters.push(w);
    });
  }
  async readLines(n, timeoutMs) {
    const out = [];
    const deadline = Date.now() + timeoutMs;
    for (let i = 0; i < n; i++) out.push(await this.readLine(Math.max(1, deadline - Date.now())));
    return out;
  }
  takeStderr() { const s = this.stderr; this.stderr = ''; return s; }
  // Lines received but not consumed by readLines (a bot that printed more than one answer).
  drain() { const extra = this.lines; this.lines = []; return extra; }
  // Kill the bot and resolve once the OS has reaped it (or after `timeoutMs`), so its files can be deleted.
  kill(timeoutMs = 1000) {
    if (!this.proc || this.exited) return Promise.resolve();
    return new Promise(resolve => {
      const t = setTimeout(resolve, timeoutMs);
      this.proc.once('close', () => { clearTimeout(t); resolve(); });
      try { this.proc.kill(); } catch { clearTimeout(t); resolve(); }
    });
  }
}

module.exports = { BotProcess, BotError, prepareBot, runToCompletion };
