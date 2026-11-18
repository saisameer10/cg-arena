# usage (in the folder with games/): python pingpong.py rows_SUB.json [...]
# Steps that undo the step before (ours against the other teams, by tags and by the estimated distance of predators
# and prey), and how our units enter the last 600 before the wall. Uses wallmove.track.
import json, sys, math, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wallmove import track, near, band, BANDS, FLEE, HUNT, pc
def cls(d, cuts):
    for c in cuts:
        if d < c: return '<%d' % c
    return '%d+' % cuts[-1]
ctx = collections.Counter(); ctxT = collections.Counter(); pingO = [0, 0]; stepsO = [0, 0]; enter = collections.Counter(); enterDie = collections.Counter(); enterN = 0
runs = collections.Counter(); games = 0; seqlen = collections.Counter(); hhTurn = collections.Counter(); catchAfter = [0, 0]; hh_noprog = 0
stay = collections.Counter()
for rf in sys.argv[1:]:
    for r in json.load(open(rf)):
        g = json.load(open('games/%s.json' % r['id'])); seat = r['seat']; k = track(g, seat); N = k['N']; H = k['hist']; C = k['C']; dead = k['dead']; games += 1
        mine = list(range(seat * N, seat * N + N)); prey = list(range(((seat + 1) % 3) * N, ((seat + 1) % 3) * N + N)); pred = list(range(((seat + 2) % 3) * N, ((seat + 2) % 3) * N + N))
        for u in range(3 * N):
            o = 0 if u in mine else 1; run = 0
            for t in range(2, k['T'] + 1):
                if u in dead and dead[u] <= t: break
                a, b, c = H[t - 1].get(u), H[t].get(u), H[t + 1].get(u)
                if not (a and b and c) or u in k['held'][t] or u in k['held'][t - 1]: continue
                s1 = math.hypot(b[0] - a[0], b[1] - a[1]); s2 = math.hypot(c[0] - b[0], c[1] - b[1])
                if s1 < 300 or s2 < 300 or s1 > 1300 or s2 > 1300: continue
                stepsO[o] += 1
                isp = math.hypot(c[0] - a[0], c[1] - a[1]) < 300
                if isp: pingO[o] += 1
                if o == 0 and isp:
                    c1 = C[t - 1].get(u); c2 = C[t].get(u)
                    if not c1 or not c2: continue
                    t1 = 'hunt' if c1[3] in HUNT else 'flee' if c1[3] in FLEE else 'seek'; t2 = 'hunt' if c2[3] in HUNT else 'flee' if c2[3] in FLEE else 'seek'
                    dp = near(H[t], u, pred, dead, t); dq = near(H[t], u, prey, dead, t)
                    ctx[(t1 + '->' + t2, 'pred ' + cls(dp, (2500, 3600)), 'prey ' + cls(dq, (2000, 4000)))] += 1
                    if t1 == 'hunt' and t2 == 'hunt': hhTurn[min(9, (t - 1) // 10)] += 1
        # entries into the last 600 before the wall
        for u in mine:
            for t in range(1, k['T'] + 1):
                if u in dead and dead[u] < t: break
                a, b = H[t].get(u), H[t + 1].get(u); c = C[t].get(u)
                if not (a and b and c): continue
                if math.hypot(*a) <= 7200 < math.hypot(*b):
                    dp = near(H[t], u, pred, dead, t); key = (c[3] or '-', 'pred ' + cls(dp, (1500, 2500, 3600)))
                    enter[key] += 1; enterN += 1
                    die = u in dead and dead[u] - t <= 8
                    enterDie[key] += die
                    # how long it stays out there
                    n = 0
                    for tt in range(t + 1, k['T'] + 2):
                        pz = H.get(tt, {}).get(u)
                        if pz is None or math.hypot(*pz) <= 7200 or (u in dead and dead[u] < tt): break
                        n += 1
                    stay[min(n, 10)] += 1
print('games', games)
print('ping-pong (back on the spot of two turns ago), same method for all teams: ours %s of steps (%d of %d), other teams %s (%d of %d)' % (pc(pingO[0], stepsO[0]), pingO[0], stepsO[0], pc(pingO[1], stepsO[1]), pingO[1], stepsO[1]))
print('our ping-pong steps by tags, nearest predator, nearest prey (estimated distances):')
for key, v in ctx.most_common(22): print('   %5d  %s' % (v, ' | '.join(key)))
print('hunt->hunt ping-pong by turn (tens):', dict(sorted(hhTurn.items())))
print('entries of our units into the last 600 before the wall: %d (%.1f per game); caught within 8 turns %s' % (enterN, enterN / games, pc(sum(enterDie.values()), enterN)))
for key, v in enter.most_common(14): print('   %5d  %-6s %-10s caught within 8 turns %s' % (v, key[0], key[1], pc(enterDie[key], v)))
print('turns it then stays beyond 7200:', dict(sorted(stay.items())))
