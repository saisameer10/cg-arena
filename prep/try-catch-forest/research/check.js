'use strict';
// Checks two suspicious zeros from analyze3: dashes before catches, nets absorbed by decoys.
const fs = require('fs');
const path = require('path');
const DIR = path.join(process.env.TCF_DATA || 'E:/cg-tmp/cgskill', 'utg', 'games');
const P = s => (s.match(/\((-?\d+), (-?\d+)\)/g) || []).map(x => x.slice(1, -1).split(', ').map(Number));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
let catches = 0, dashSame = 0, dashPrev = 0, dashCmdSame = 0, victimDashCmd = 0, victimDashRecent = 0, netDecoy = 0, decoys = 0;
const gapCatcherDash = {}, dashToCatch = [];
let victimNettedNow = 0, victimFree = 0, victimFreeCouldDash = 0;
let shown = 0;
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.json'))) {
  let g; try { g = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); } catch { continue; }
  if (!g.frames) continue;
  const lastDash = new Map(), lastDashPos = new Map(), cmd = new Map(), netted = new Map();
  let idx = 0;
  for (const fr of g.frames) {
    const turn = Math.floor(idx / 3) + 1; if (fr.agent !== undefined) idx++;
    if (fr.stdout) for (const c of fr.stdout.split(';')) { const m = c.trim().match(/^(MOVE|DASH)\s+(\d+)/); if (m) cmd.set(m[2] + '@' + turn, m[1]); }
    const lines = (fr.summary || '').split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      let m;
      if ((m = line.match(/^\$(\d)'s agent (\d+) dashes from/))) { lastDash.set(m[2], turn); lastDashPos.set(m[2], P(line)[0]); }
      if (/deploys a decoy/.test(line)) decoys++;
      if (/and nets .*decoy/.test(line)) netDecoy++;
      const h = line.match(/throws a net .* and nets (.*)$/);
      if (h) for (const u of (h[1].match(/agents? ([\d, ]+)/g) || []).join(' ').match(/\d+/g) || []) netted.set(u, turn);
    }
    for (const line of lines) {
      const m = line.match(/^\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+) at/); if (!m) continue;
      catches++;
      const ld = lastDash.get(m[2]); const k = ld === undefined ? 'never' : Math.min(turn - ld, 5); gapCatcherDash[k] = (gapCatcherDash[k] || 0) + 1;
      if (ld === turn) { dashSame++; dashToCatch.push(dist(lastDashPos.get(m[2]), P(line)[0])); }
      if (ld === turn - 1) dashPrev++;
      if (cmd.get(m[2] + '@' + turn) === 'DASH') dashCmdSame++;
      if (cmd.get(m[4] + '@' + turn) === 'DASH') victimDashCmd++;
      const vd = lastDash.get(m[4]); if (vd !== undefined && turn - vd <= 1) victimDashRecent++;
      const nt = netted.get(m[4]);
      if (nt !== undefined && turn - nt <= 4) victimNettedNow++; else { victimFree++; if (vd === undefined || turn - vd >= 2) victimFreeCouldDash++; }
      if (shown < 2 && ld === turn) { shown++; console.log('example frame', fr.frame, 'turn', turn, '\n  ' + lines.join('\n  ')); }
    }
  }
}
const pc = (a, b) => Math.round(100 * a / b) + '%';
console.log(`catches ${catches}`);
console.log(`catcher: dash executed the same turn ${pc(dashSame, catches)}, the turn before ${pc(dashPrev, catches)}; DASH commanded that turn ${pc(dashCmdSame, catches)}`);
console.log('turns since the catcher last dashed:', JSON.stringify(gapCatcherDash));
const d = dashToCatch.sort((a, b) => a - b); if (d.length) console.log(`distance from the catcher's dash start to the catch point: median ${Math.round(d[d.length >> 1])}, p90 ${Math.round(d[Math.floor(d.length * 0.9)])}, max ${Math.round(d[d.length - 1])}`);
console.log(`victim: commanded DASH on the turn it was caught ${pc(victimDashCmd, catches)}; had dashed that turn or the turn before ${pc(victimDashRecent, catches)}`);
console.log(`victim under a net when caught ${pc(victimNettedNow, catches)}; free ${victimFree}, of which a dash was available (none in the last 2 turns) ${pc(victimFreeCouldDash, victimFree)}`);
console.log(`decoys deployed ${decoys}; nets absorbed by a decoy ${netDecoy} (${pc(netDecoy, decoys)} of decoys)`);
