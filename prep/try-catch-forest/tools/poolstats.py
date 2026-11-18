# usage: python poolstats.py <logdir> [...]   - what version "X" did in a local pool (logs written by SimLog)
import json, sys, glob, math, re, collections, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wallmove import track
for d in sys.argv[1:]:
    n = 0; rk = 0; ct = 0; lost = 0; late = 0; first = []; nocatch15 = 0; steps = 0; pp = 0; err = 0; byN = collections.defaultdict(lambda: [0, 0]); tb = 0; lostlate = 0; wins = 0
    for fn in glob.glob(d + '/*.json'):
        g = json.load(open(fn)); seat = [a['index'] for a in g['agents'] if a['name'] == 'X']
        if not seat: continue
        seat = seat[0]; k = track(g, seat); N = k['N']; H = k['hist']; dead = k['dead']; n += 1
        r = g['ranking'].index(seat) + 1; rk += r; wins += r == 1; byN[N][0] += 1; byN[N][1] += r
        if g['scores'][seat] < 0: err += 1
        prey = range(((seat + 1) % 3) * N, ((seat + 1) % 3) * N + N); mine = range(seat * N, seat * N + N)
        c = sorted(dead[u] for u in prey if u in dead); ct += len(c); late += sum(1 for x in c if x > 30)
        l = [dead[u] for u in mine if u in dead]; lost += len(l); lostlate += sum(1 for x in l if x > 30)
        if c: first.append(c[0])
        if not c or c[0] > 15: nocatch15 += 1
        for u in mine:
            for t in range(2, k['T'] + 1):
                if u in dead and dead[u] <= t: break
                a, b, cc = H[t - 1].get(u), H[t].get(u), H[t + 1].get(u)
                if not (a and b and cc) or u in k['held'][t] or u in k['held'][t - 1]: continue
                s1 = math.hypot(b[0] - a[0], b[1] - a[1]); s2 = math.hypot(cc[0] - b[0], cc[1] - b[1])
                if s1 < 300 or s2 < 300: continue
                steps += 1; pp += math.hypot(cc[0] - a[0], cc[1] - a[1]) < 300
    first.sort()
    print('%-10s games %d  mean rank %.2f  wins %d%%  catches %.2f (after turn 30: %.2f)  lost %.2f (after 30: %.2f)  first catch median %s  no catch by 15: %d%%  back-and-forth %.1f%%  errors %d  | by units %s' % (
        os.path.basename(d), n, rk / n, round(100 * wins / n), ct / n, late / n, lost / n, lostlate / n, first[len(first) // 2] if first else '-', round(100 * nocatch15 / n), 100 * pp / max(1, steps), err,
        ' '.join('%d: %.2f' % (kk, v[1] / v[0]) for kk, v in sorted(byN.items()))))
