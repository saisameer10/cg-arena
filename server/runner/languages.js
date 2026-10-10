'use strict';
const { spawnSync } = require('child_process');
const path = require('path');

// Probe with a direct spawn (no shell) so detection matches how bots are actually launched.
function has(cmd) {
  const [exe, ...args] = cmd.split(' ');
  const r = spawnSync(exe, args, { stdio: 'ignore', windowsHide: true });
  return !r.error && r.status === 0;
}

const PRELUDE = path.join(__dirname, 'js-prelude.js');

// Find a JDK even when it is not on PATH: JAVA_HOME first, then common Windows install folders.
function findJdk() {
  const fs = require('fs');
  const exe = process.platform === 'win32' ? '.exe' : '';
  const candidates = [];
  if (process.env.JAVA_HOME) candidates.push(process.env.JAVA_HOME);
  if (process.platform === 'win32') {
    // JAVA_HOME set with setx / the registry is not visible to already-running shells; read it directly
    for (const hive of ['HKCU\\Environment', 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment']) {
      const r = spawnSync('reg', ['query', hive, '/v', 'JAVA_HOME'], { encoding: 'utf8', windowsHide: true });
      const m = r.stdout && r.stdout.match(/JAVA_HOME\s+REG_\w+\s+(.+)/);
      if (m) candidates.push(m[1].trim());
    }
    for (const root of ['C:\\Program Files\\Microsoft', 'C:\\Program Files\\Eclipse Adoptium', 'C:\\Program Files\\Java', 'C:\\Program Files\\Amazon Corretto', 'C:\\Program Files\\Zulu']) {
      try { for (const d of fs.readdirSync(root)) if (/jdk/i.test(d)) candidates.push(path.join(root, d)); } catch {}
    }
  }
  for (const home of candidates.sort().reverse()) {
    if (fs.existsSync(path.join(home, 'bin', 'javac' + exe))) return { javac: path.join(home, 'bin', 'javac' + exe), java: path.join(home, 'bin', 'java' + exe) };
  }
  return has('javac -version') ? { javac: 'javac', java: 'java' } : null;
}
let jdk;
const JDK = () => (jdk === undefined ? (jdk = findJdk()) : jdk);

// Each language: file name, optional compile step, run command.
// Commands are plain spawn() calls (no shell), so bot code cannot inject shell syntax.
const LANGUAGES = {
  python: {
    id: 'python', name: 'Python 3', monaco: 'python', fileName: 'bot.py',
    detect: () => has('python --version'),
    run: (dir) => ({ cmd: 'python', args: ['-u', '-I', path.join(dir, 'bot.py')], env: { PYTHONUNBUFFERED: '1' } }),
  },
  javascript: {
    id: 'javascript', name: 'JavaScript (Node)', monaco: 'javascript', fileName: 'bot.js',
    detect: () => true,
    // the prelude provides CodinGame-style readline()/print()/printErr() globals
    run: (dir) => ({ cmd: process.execPath, args: ['-r', PRELUDE, path.join(dir, 'bot.js')] }),
  },
  java: {
    id: 'java', name: 'Java', monaco: 'java', fileName: 'Player.java',
    detect: () => !!JDK(),
    compile: (dir) => ({ cmd: JDK().javac, args: ['-d', dir, path.join(dir, 'Player.java')] }),
    // serial GC, class-data sharing and no perf-data file: faster JVM start and steadier 50 ms turns
    run: (dir) => ({ cmd: JDK().java, args: ['-Xss64m', '-XX:+UseSerialGC', '-Xshare:auto', '-XX:-UsePerfData', '-cp', dir, 'Player'] }),
  },
  cpp: {
    id: 'cpp', name: 'C++ (g++)', monaco: 'cpp', fileName: 'bot.cpp',
    detect: () => has('g++ --version'),
    compile: (dir) => ({ cmd: 'g++', args: ['-O2', '-std=c++17', '-o', path.join(dir, 'bot.exe'), path.join(dir, 'bot.cpp')] }),
    run: (dir) => ({ cmd: path.join(dir, 'bot.exe'), args: [] }),
  },
};

let cache = null;
function availableLanguages() {
  if (!cache) {
    cache = Object.values(LANGUAGES).filter(l => l.detect()).map(l => ({ id: l.id, name: l.name, monaco: l.monaco }));
  }
  return cache;
}

module.exports = { LANGUAGES, availableLanguages };
