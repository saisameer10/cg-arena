'use strict';
// Generic test generation for any solo or io challenge (node cli.js make-tests <id> [--count 10] [--seed 1]).
// Needs the challenge's generator.js and its reference solution:
//   io:   generate(seed) -> { name?, input }; the reference solution computes the expected output -> tests/gen-<seed>.in/.out
//   solo: generate(seed) -> level data; a level is kept only if the reference solution passes it (proof that it
//         can be won) -> tests/gen-<seed>.json
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { runMatch, workRoot } = require('../server/engine/match');
const { LANGUAGES } = require('../server/runner/languages');
const { prepareBot } = require('../server/runner/bot');

const EXT = { '.py': 'python', '.js': 'javascript', '.java': 'java', '.cpp': 'cpp' };

function findSolution(g) {
  const cfg = JSON.parse(fs.readFileSync(path.join(g.dir, 'game.json'), 'utf8'));
  if (cfg.solution) { const f = path.join(g.dir, cfg.solution); if (fs.existsSync(f)) return f; }
  const d = path.join(g.dir, 'solution');
  if (fs.existsSync(d)) { const f = fs.readdirSync(d).find(f => EXT[path.extname(f)] && LANGUAGES[EXT[path.extname(f)]].detect()); if (f) return path.join(d, f); }
  return null;
}

// run a program once on a whole input; resolves with its stdout
async function runOnce(file, input, timeoutMs = 20000) {
  const lang = EXT[path.extname(file)];
  const dir = path.join(workRoot(), 'mt-' + process.pid + '-' + Date.now().toString(36));
  const prep = await prepareBot(lang, fs.readFileSync(file, 'utf8'), dir);
  if (!prep.ok) throw new Error('reference solution does not compile:\n' + prep.log);
  const spec = LANGUAGES[lang].run(dir);
  try {
    return await new Promise((resolve, reject) => {
      const p = spawn(spec.cmd, spec.args, { cwd: dir, windowsHide: true });
      let out = '', err = '';
      p.stdout.on('data', d => out += d); p.stderr.on('data', d => err += d);
      const t = setTimeout(() => { p.kill(); reject(new Error(`reference solution took over ${timeoutMs} ms`)); }, timeoutMs);
      p.on('close', code => { clearTimeout(t); code === 0 ? resolve(out) : reject(new Error(`reference solution exited with ${code}: ${err.slice(0, 300)}`)); });
      p.stdin.on('error', () => {}); p.stdin.end(input);
    });
  } finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch {} }
}

async function makeTests(g, { count = 10, seed = 1, log = console.log } = {}) {
  if (g.kind !== 'solo') throw new Error(`${g.name} is a multiplayer game: its opponents are bosses, not test files`);
  if (!g.generator || typeof g.generator.generate !== 'function') throw new Error(`games/${g.id}/generator.js with generate(seed) is needed`);
  const sol = findSolution(g);
  if (!sol) throw new Error(`a reference solution is needed (games/${g.id}/solution/ or "solution" in game.json)`);
  const cfg = JSON.parse(fs.readFileSync(path.join(g.dir, 'game.json'), 'utf8'));
  const dir = path.join(g.dir, cfg.tests || 'tests');
  fs.mkdirSync(dir, { recursive: true });
  let made = 0, skipped = 0;
  for (let i = 0; i < count; i++) {
    const s = String(Number(seed) + i);
    const data = g.generator.generate(s);
    // test id: gen-<zero-padded seed>-<what the generator called it>, so tests sort and read well
    const slug = String(data.name || '').replace(/\(seed[^)]*\)/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24);
    const tid = `gen-${s.padStart(String(Number(seed) + count - 1).length, '0')}${slug ? '-' + slug : ''}`;
    if (g.type === 'io') {
      const input = String(data.input).replace(/\r/g, '');
      const out = (await runOnce(sol, input.endsWith('\n') ? input : input + '\n')).replace(/\r/g, '');
      fs.writeFileSync(path.join(dir, `${tid}.in`), input.endsWith('\n') ? input : input + '\n');
      fs.writeFileSync(path.join(dir, `${tid}.out`), out.endsWith('\n') ? out : out + '\n');
      log(`${tid}: ${input.split('\n').length - 1} input line(s), answer computed by ${path.basename(sol)}`);
      made++;
    } else {
      const sol0 = { type: 'user', lang: EXT[path.extname(sol)], source: fs.readFileSync(sol, 'utf8'), name: 'reference' };
      const r = await runMatch({ gameDef: g, players: [sol0], test: `random:${s}`, seed: s, workRoot: workRoot(), emit: () => {} });
      if (!r.passed) { skipped++; log(`seed ${s}: skipped, the reference solution does not pass it (${r.message})`); continue; }
      fs.writeFileSync(path.join(dir, `${tid}.json`), JSON.stringify({ name: data.name || `Generated level (seed ${s})`, ...data }, null, 1) + '\n');
      log(`${tid}: kept (${r.message})`);
      made++;
    }
  }
  return { made, skipped, dir };
}

module.exports = { makeTests, findSolution, runOnce };
