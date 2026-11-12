'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Probe with a direct spawn (no shell) so detection matches how bots are actually launched.
function has(cmd, args = ['--version']) {
  const r = spawnSync(cmd, args, { stdio: 'ignore', windowsHide: true });
  return !r.error && r.status === 0;
}

const PRELUDE = path.join(__dirname, 'js-prelude.js');

// Python: "python3" on macOS/Linux, "python" on Windows; the first one that answers wins.
let python;
function PYTHON() {
  if (python === undefined) python = (process.platform === 'win32' ? ['python', 'python3'] : ['python3', 'python']).find(c => has(c)) || null;
  return python;
}
// -u: unbuffered stdout (every print reaches the referee at once); -B: no __pycache__ in the match dir.
// No -I/-E/-s: pip --user packages (numpy, ...) stay importable, as on CodinGame.
const pythonArgs = file => ['-u', '-B', file];

// Find a JDK: JAVA_HOME, then the registry (Windows), then common install folders, newest version first.
function findJdk() {
  const exe = process.platform === 'win32' ? '.exe' : '';
  const expand = s => s.replace(/%([^%]+)%/g, (m, v) => process.env[v] || process.env[v.toUpperCase()] || m);
  const candidates = [];
  if (process.env.JAVA_HOME) candidates.push(process.env.JAVA_HOME);
  if (process.platform === 'win32') {
    // JAVA_HOME set with setx / the registry is not visible to already-running shells; read it directly
    for (const hive of ['HKCU\\Environment', 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment']) {
      const r = spawnSync('reg', ['query', hive, '/v', 'JAVA_HOME'], { encoding: 'utf8', windowsHide: true });
      const m = r.stdout && r.stdout.match(/JAVA_HOME\s+REG_\w+\s+(.+)/);
      if (m) candidates.push(expand(m[1].trim()));
    }
    const scanned = [];
    for (const root of ['C:\\Program Files\\Microsoft', 'C:\\Program Files\\Eclipse Adoptium', 'C:\\Program Files\\Java', 'C:\\Program Files\\Amazon Corretto', 'C:\\Program Files\\Zulu']) {
      try { for (const d of fs.readdirSync(root)) if (/jdk/i.test(d)) scanned.push(path.join(root, d)); } catch {}
    }
    const version = p => { const m = path.basename(p).match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/); return m ? Number(m[1]) * 1e6 + Number(m[2] || 0) * 1e3 + Number(m[3] || 0) : 0; };
    candidates.push(...scanned.sort((a, b) => version(b) - version(a)));
  }
  for (const home of candidates) {
    if (fs.existsSync(path.join(home, 'bin', 'javac' + exe))) return { javac: path.join(home, 'bin', 'javac' + exe), java: path.join(home, 'bin', 'java' + exe), home };
  }
  return has('javac', ['-version']) ? { javac: 'javac', java: 'java', home: '(PATH)' } : null;
}
let jdk;
const JDK = () => (jdk === undefined ? (jdk = findJdk()) : jdk);

const mainClassOf = dir => { try { return fs.readFileSync(path.join(dir, '.mainclass'), 'utf8').trim() || 'Player'; } catch { return 'Player'; } };

// Each language: file name, optional compile step, run command.
// Commands are plain spawn() calls (no shell), so bot code cannot inject shell syntax.
const LANGUAGES = {
  python: {
    id: 'python', name: 'Python 3', monaco: 'python', fileName: 'bot.py',
    detect: () => !!PYTHON(),
    run: (dir) => ({ cmd: PYTHON(), args: pythonArgs(path.join(dir, 'bot.py')) }),
  },
  javascript: {
    id: 'javascript', name: 'JavaScript (Node)', monaco: 'javascript', fileName: 'bot.js',
    detect: () => true,
    // the prelude provides CodinGame-style readline()/print()/printErr() globals
    run: (dir) => ({ cmd: process.execPath, args: ['-r', PRELUDE, path.join(dir, 'bot.js')] }),
  },
  java: {
    // CodinGame uses "class Player" for games and "class Solution" for classic puzzles; both work, and a
    // "public class X" is written to X.java as javac requires. The class to run is stored in .mainclass.
    id: 'java', name: 'Java', monaco: 'java', fileName: 'Player.java',
    fileFor: source => { const m = source.match(/\bpublic\s+(?:final\s+|abstract\s+)*class\s+([A-Za-z_]\w*)/); return (m ? m[1] : 'Player') + '.java'; },
    mainFor: source => {
      const names = [...source.matchAll(/\bclass\s+([A-Za-z_]\w*)/g)].map(m => m[1]);
      const pub = source.match(/\bpublic\s+(?:final\s+)?class\s+([A-Za-z_]\w*)/);
      return names.includes('Player') ? 'Player' : names.includes('Solution') ? 'Solution' : pub ? pub[1] : names[0] || 'Player';
    },
    detect: () => !!JDK(),
    compile: (dir) => ({ cmd: JDK().javac, args: ['-encoding', 'UTF-8', '-d', dir, ...fs.readdirSync(dir).filter(f => f.endsWith('.java')).map(f => path.join(dir, f))] }),
    // serial GC, class-data sharing and no perf-data file: faster JVM start and steadier 50 ms turns
    run: (dir) => ({ cmd: JDK().java, args: ['-Xss64m', '-XX:+UseSerialGC', '-Xshare:auto', '-XX:-UsePerfData', '-cp', dir, mainClassOf(dir)] }),
  },
  cpp: {
    id: 'cpp', name: 'C++ (g++)', monaco: 'cpp', fileName: 'bot.cpp',
    detect: () => has('g++'),
    compile: (dir) => ({ cmd: 'g++', args: ['-O2', '-std=c++17', '-o', path.join(dir, process.platform === 'win32' ? 'bot.exe' : 'bot'), path.join(dir, 'bot.cpp')] }),
    run: (dir) => ({ cmd: path.join(dir, process.platform === 'win32' ? 'bot.exe' : 'bot'), args: [] }),
  },
};

let cache = null;
function availableLanguages() {
  if (!cache) {
    cache = Object.values(LANGUAGES).filter(l => l.detect()).map(l => ({ id: l.id, name: l.name, monaco: l.monaco }));
  }
  return cache;
}
function interpreterInfo() {
  return `python: ${PYTHON() || 'not found'}, java: ${JDK() ? JDK().home : 'not found'}, node: ${process.version}`;
}

module.exports = { LANGUAGES, availableLanguages, interpreterInfo, PYTHON, pythonArgs, PRELUDE };
