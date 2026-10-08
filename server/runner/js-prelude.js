// Preloaded into every JavaScript bot: provides the same globals CodinGame offers.
'use strict';
const fs = require('fs');
let buf = '';
let eof = false;
const chunk = Buffer.alloc(1 << 16);
global.readline = function readline() {
  for (;;) {
    const i = buf.indexOf('\n');
    if (i >= 0) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 1);
      return line.endsWith('\r') ? line.slice(0, -1) : line;
    }
    if (eof) {
      if (buf.length) { const l = buf; buf = ''; return l; }
      return null;
    }
    let n = 0;
    try { n = fs.readSync(0, chunk, 0, chunk.length, null); }
    catch (e) {
      if (e.code === 'EAGAIN') continue;
      if (e.code === 'EOF') { eof = true; continue; }
      throw e;
    }
    if (n === 0) { eof = true; continue; }
    buf += chunk.toString('utf8', 0, n);
  }
};
global.print = (...a) => console.log(...a);
global.printErr = (...a) => console.error(...a);
