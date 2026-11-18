# usage: python reachcheck.py <folder of debug games> <classpath of an instr.py build> [more classpaths]
# Re-runs each bot on the input of real debug games (replay.py) and counts: steps toward prey in sight with a predator
# 2500 to 3600 away, the same with no predator near, and the share of steps that end 3400 to 3600 from a predator.
import json, sys, glob, subprocess, collections
JAVA = 'D:/tools/jdk-21/bin/java'
for cp in sys.argv[2:]:
    go = [0, 0]; go2 = [0, 0]; ring = [0, 0]; n = 0
    for fn in sorted(glob.glob(sys.argv[1] + '/*.json')):
        d = json.load(open(fn, encoding='utf-8'))
        if 'log' not in d: continue
        seat = [a['index'] for a in d['log']['agents'] if a.get('me')][0]
        subprocess.run(['python', 'E:/New folder/prep/try-catch-forest/tools/replay.py', fn, str(seat), cp + '/in.txt'], capture_output=True)
        p = subprocess.run([JAVA, '-cp', cp, 'Player'], stdin=open(cp + '/in.txt'), capture_output=True, timeout=300)
        G = {}; n += 1
        for l in p.stderr.decode().split('\n'):
            w = l.split()
            if w and w[0] == 'G': G[(w[1], w[2])] = (int(w[4]), int(w[10]), w[11])
            if w and w[0] == 'H' and (w[1], w[2]) in G:
                vis, nt, tag = G[(w[1], w[2])]; thB = int(w[15]); nth = int(w[17]); tq = int(w[18]); tq2 = int(w[19])
                if nth and 2400 <= nt < 4800 and 'FLEE' not in tag: ring[1] += 1; ring[0] += 3400 <= thB < 3600
                if vis and 0 <= tq < 2600 and 2500 <= nt < 3600 and tag in ('HUNT', 'SHUNT', 'CATCH', 'FLEE'):
                    go[1] += 1; go[0] += tq2 < tq - 300
                if vis and 0 <= tq < 2600 and nt >= 3600:
                    go2[1] += 1; go2[0] += tq2 < tq - 300
    print('%-12s games %d | prey in sight within 2600 and a predator 2500-3600 away: steps toward the prey %d of %d (%d%%) | same with no predator within 3600: %d of %d (%d%%) | steps ending 3400-3600 from a predator: %d%%' % (
        cp, n, go[0], go[1], round(100 * go[0] / max(1, go[1])), go2[0], go2[1], round(100 * go2[0] / max(1, go2[1])), round(100 * ring[0] / max(1, ring[1]))))
