# usage: python instr.py <Player.java> <out.java>  - live-family bot that prints, per unit and turn, its target, goal,
# tag, order (G line) and the distance of the nearest known predator from the chosen step (H line); no time guard.
# Read by tools/reachcheck.py.
import io, sys
s = io.open(sys.argv[1], encoding='utf-8').read()
a = '            u.tag = bestCert ? "CATCH" : nt < 2500 ? "FLEE" : target != null ? "HUNT" : "SEEK";\n'
assert s.count(a) == 1
b = a + '''            { double thB = 1e9, thD = 1e9; for (Th t : threats) { thB = Math.min(thB, hyp(bex - t.x, bey - t.y)); if (nc > 1) thD = Math.min(thD, hyp(cX[1] - t.x, cY[1] - t.y)); }
              double tq = target == null ? -1 : hyp(target.x - u.x, target.y - u.y), tq2 = target == null ? -1 : hyp(target.x - bex, target.y - bey);
              System.err.println("G " + turn + " " + u.id + " " + (target == null ? -1 : target.id) + " " + (target != null && target.vis ? 1 : 0) + " " + (target == null ? 0 : turn - target.seen) + " " + Math.round(gx) + " " + Math.round(gy) + " " + Math.round(u.x) + " " + Math.round(u.y) + " " + Math.round(nt > 1e9 ? 99999 : nt) + " " + u.tag + " " + bestCmd);
              System.err.println("H " + turn + " " + u.id + " 0 0 " + Math.round(bex) + " " + Math.round(bey) + " 0 0 0 0 0 0 0 0 " + Math.round(Math.min(thB, 99999)) + " " + Math.round(Math.min(thD, 99999)) + " " + threats.size() + " " + Math.round(tq) + " " + Math.round(tq2)); }
'''
s = s.replace(a, b).replace('System.nanoTime() - turnStart > 25_000_000L', 'false')
io.open(sys.argv[2], 'w', encoding='utf-8').write(s)
