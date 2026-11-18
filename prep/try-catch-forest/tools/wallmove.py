# usage: python wallmove.py <dir> rows_SUB.json [...]     (<dir> holds games/<id>.json; rows files come from arena.py)
# The wall and bad movements in our arena games. Positions are rebuilt from the plain logs as in recon.py:
# our own units from their orders (exact unless a tree or the wall deflected the step), the others by dead
# reckoning between the referee's position reports (most exact, one in ten off by a step or more).
import json, sys, re, math, os, collections

R_IN = 7780
BANDS = [(0, 4000), (4000, 5500), (5500, 6500), (6500, 7200), (7200, 9000)]
FLEE = ('FLEE', 'LFLEE', 'SFLEE'); HUNT = ('HUNT', 'SHUNT', 'CATCH')


def band(r):
    for i, (a, b) in enumerate(BANDS):
        if a <= r < b: return i
    return len(BANDS) - 1


def track(g, seat):
    turns = collections.defaultdict(lambda: {'cmd': {}, 'sum': []}); t = 0; last = -1
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1
        last = a
        turns[t]['cmd'][a] = f.get('stdout') or ''
        for s in (f.get('summary') or '').split('\n'):
            if s: turns[t]['sum'].append(s)
    T = t
    N = max(int(c.split()[1]) for c in turns[1]['cmd'][0].split(';') if len(c.split()) > 1 and c.split()[0] in ('MOVE', 'DASH')) + 1
    def rot(p, k):
        a = 2 * math.pi / 3 * k; return (p[0] * math.cos(a) - p[1] * math.sin(a), p[0] * math.sin(a) + p[1] * math.cos(a))
    pos = {u: None for u in range(3 * N)}
    for s in turns[1]['sum']:
        m = re.match(r"\$(\d)'s agent (\d+) dashes from \((-?\d+), (-?\d+)\)", s)
        if m:
            o = int(m.group(1)); u = int(m.group(2)); p = (int(m.group(3)), int(m.group(4)))
            for o2 in range(3):
                if pos[o2 * N + u % N] is None: pos[o2 * N + u % N] = rot(p, o2 - o)
    dead = {}; dpos = {}; frozen = collections.defaultdict(int); hist = {}; C = {}; held = {}; nettedAt = collections.defaultdict(list)
    for t in range(1, T + 1):
        S = turns[t]['sum']
        for s in S:
            m = re.match(r"\$(\d)'s agent (\d+) dashes from \((-?\d+), (-?\d+)\)", s)
            if m: pos[int(m.group(2))] = (int(m.group(3)), int(m.group(4)))
        cmds = {}
        for a in range(3):
            for c in turns[t]['cmd'].get(a, '').split(';'):
                w = c.split()
                if len(w) >= 4 and w[0] in ('MOVE', 'DASH'):
                    try: cmds[int(w[1])] = (w[0], float(w[2]), float(w[3]), w[4] if len(w) > 4 else '')
                    except ValueError: pass
        hist[t] = dict(pos); C[t] = cmds; held[t] = {u for u in frozen if frozen[u] > 0}
        for u in range(3 * N):
            if frozen[u] > 0: frozen[u] -= 1; continue
            if u not in cmds: continue
            k, x, y, _ = cmds[u]
            if pos[u] is None:
                if u // N == seat: pos[u] = (x, y)      # our orders name the end of the step
                continue
            d = math.hypot(x - pos[u][0], y - pos[u][1]); sp = 1200 if k == 'DASH' else 600
            if d > sp: x = pos[u][0] + (x - pos[u][0]) * sp / d; y = pos[u][1] + (y - pos[u][1]) * sp / d
            r = math.hypot(x, y)
            if r > R_IN: x *= R_IN / r; y *= R_IN / r
            pos[u] = (x, y)
        for s in S:
            m = re.match(r"\$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\) (throws a net|deploys smoke|deploys a decoy)", s)
            if m: pos[int(m.group(2))] = (int(m.group(3)), int(m.group(4)))
            m = re.search(r"and nets (.*)$", s)
            if m:
                for x in re.findall(r"agent (\d+)", m.group(1)): frozen[int(x)] = 4; nettedAt[int(x)].append(t)
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\)", s)
            if m and int(m.group(4)) not in dead:
                dead[int(m.group(4))] = t; dpos[int(m.group(4))] = (int(m.group(5)), int(m.group(6)))
    hist[T + 1] = dict(pos)
    return dict(T=T, N=N, hist=hist, C=C, dead=dead, dpos=dpos, held=held, nettedAt=nettedAt)


def near(P, u, grp, dead, t):
    b = 1e9
    for v in grp:
        if P.get(v) is None or (v in dead and dead[v] < t): continue
        d = math.hypot(P[v][0] - P[u][0], P[v][1] - P[u][1])
        if d < b: b = d
    return b


def pc(a, b): return '%d%%' % round(100 * a / b) if b else '-'


def main():
    d = sys.argv[1]
    ut = [[0] * 5 for _ in range(2)]; dth = [[0] * 5 for _ in range(2)]          # 0 = ours, 1 = the other two teams
    utP = [0] * 5; dthP = [0] * 5                                                 # ours, with a predator within 2500
    deaths = []; games = 0; rev = collections.Counter(); pp = collections.Counter(); ppPrey = 0; ppTurns = 0; unitTurns = 0
    giveup = [0, 0, 0]; defl = [0, 0]; deflDeath = 0; idle = 0; fleeOut = collections.defaultdict(lambda: [0, 0]); wallDash = [0, 0]
    perGame = []; huntTurns = [0, 0]; late = collections.Counter()
    for rf in sys.argv[2:]:
        for r in json.load(open(os.path.join(d, rf))):
            g = json.load(open(os.path.join(d, 'games', '%s.json' % r['id']))); seat = r['seat']
            k = track(g, seat); N = k['N']; H = k['hist']; C = k['C']; dead = k['dead']; games += 1
            mine = list(range(seat * N, seat * N + N)); prey = list(range(((seat + 1) % 3) * N, ((seat + 1) % 3) * N + N)); pred = list(range(((seat + 2) % 3) * N, ((seat + 2) % 3) * N + N))
            wd = 0; gpp = 0
            for u in range(3 * N):
                o = 0 if u in mine else 1
                for t in range(1, k['T'] + 1):
                    if u in dead and dead[u] < t: break
                    p = H[t].get(u)
                    if p is None: continue
                    b = band(math.hypot(*p)); ut[o][b] += 1
                    if o == 0:
                        unitTurns += 1
                        if near(H[t], u, pred, dead, t) < 2500: utP[b] += 1
                if u in dead:
                    b = band(math.hypot(*k['dpos'][u])); dth[o][b] += 1
            for u in mine:
                prev = None; hadFlee = False
                for t in range(1, k['T'] + 1):
                    if u in dead and dead[u] < t: break
                    p = H[t].get(u); c = C[t].get(u)
                    if p is None or c is None or u in k['held'][t]: prev = None; continue
                    q = H[t + 1].get(u); mv = (c[1] - p[0], c[2] - p[1]); st = math.hypot(*mv); tag = c[3]
                    r0 = math.hypot(*p); r1 = math.hypot(*q); dp = near(H[t], u, pred, dead, t); dq = near(H[t], u, prey, dead, t)
                    if st < 200: idle += 1
                    # steps deflected by a tree or the wall: the next order starts somewhere else than this order ended
                    c2 = C.get(t + 1, {}).get(u)
                    if c2 and u not in k['held'].get(t + 1, ()) and not (u in dead and dead[u] <= t) and math.hypot(c2[1], c2[2]) < 7900 and math.hypot(c[1], c[2]) < 7700:
                        dd = math.hypot(c2[1] - c[1], c2[2] - c[2]); sp2 = 1200 if c2[0] == 'DASH' else 600
                        defl[1] += 1
                        if abs(dd - sp2) > 80:
                            defl[0] += 1
                            if u in dead and dead[u] - t <= 3: deflDeath += 1
                    if tag in FLEE:
                        key = 'R %d-%d' % BANDS[band(r0)]
                        out = r1 - r0 > 250
                        die = u in dead and dead[u] - t <= 6
                        fo = fleeOut[(key, 'outward' if out else 'inward' if r1 - r0 < -250 else 'along')]; fo[0] += 1; fo[1] += die
                    if c[0] == 'DASH' and r1 > 6500 and r1 - r0 > 400:
                        wallDash[0] += 1; wallDash[1] += (u in dead and dead[u] - t <= 6)
                    if tag in HUNT: huntTurns[0] += 1
                    if prev is not None and st > 300 and prev[1] > 300:
                        cos = (mv[0] * prev[0][0] + mv[1] * prev[0][1]) / (st * prev[1])
                        if cos < -0.7:
                            a = 'hunt' if prev[2] in HUNT else 'flee' if prev[2] in FLEE else 'seek'
                            b2 = 'hunt' if tag in HUNT else 'flee' if tag in FLEE else 'seek'
                            rev[a + ' -> ' + b2] += 1
                            if a == 'hunt' and b2 == 'flee':
                                giveup[0] += 1
                                if dp > 2000: giveup[1] += 1
                                if dp > 2000 and dq < 2200: giveup[2] += 1; late[min(9, (t - 1) // 10)] += 1
                            # back to where it stood two turns ago
                            p0 = H[t - 1].get(u)
                            if p0 and math.hypot(q[0] - p0[0], q[1] - p0[1]) < 300:
                                pp[a + ' -> ' + b2] += 1; gpp += 1
                                if dq < 2500: ppPrey += 1
                    prev = (mv, st, tag)
                if u in dead:
                    t = dead[u]; dp = k['dpos'][u]; R = math.hypot(*dp); p6 = H[max(1, t - 6)].get(u)
                    c = None
                    for kk in (t, t - 1, t - 2):
                        if C.get(kk, {}).get(u): c = C[kk][u]; break
                    wz = 0
                    for tt in range(max(1, t - 12), t + 1):
                        pz = H[tt].get(u)
                        if pz and math.hypot(*pz) > 6300: wz += 1
                    deaths.append(dict(R=R, t=t, netted=any(0 <= t - x <= 5 for x in k['nettedAt'][u]), out=(R - math.hypot(*p6)) if p6 else 0,
                                       tag=c[3] if c else 'none', dash=bool(C.get(t, {}).get(u) and C[t][u][0] == 'DASH'), wz=wz, N=N, rank=r['rank']))
                    if R > 6500: wd += 1
            perGame.append((wd, gpp, r['rank'], N, r['lost']))
    for b in range(5):
        dthP[b] = sum(1 for x in deaths if band(x['R']) == b)
    print('games %d, our unit-turns alive %d, our units lost %d' % (games, unitTurns, len(deaths)))
    print('\nA. Where units stand and where they are caught (radius of the unit centre; the wall is at 7780)')
    print('   %-12s | %-34s | %-34s' % ('radius', 'OURS: time, losses, per 100 turns', 'OTHER TEAMS: time, losses, per 100 turns'))
    for b, (a, z) in enumerate(BANDS):
        row = '   %-12s' % ('%d-%s' % (a, z if z < 9000 else 'wall'))
        for o in (0, 1):
            row += ' | %5s of time, %5s of losses, %5.2f' % (pc(ut[o][b], sum(ut[o])), pc(dth[o][b], sum(dth[o])), 100 * dth[o][b] / max(1, ut[o][b]))
        print(row)
    print('   all          | losses per 100 unit-turns %.2f              | %.2f' % (100 * sum(dth[0]) / sum(ut[0]), 100 * sum(dth[1]) / sum(ut[1])))
    print('\nB. Ours, only the turns with a predator within 2500 (estimated): share of those turns, losses per 100 such turns')
    for b, (a, z) in enumerate(BANDS):
        print('   %-12s %5s of chased time, %.2f losses per 100 turns' % ('%d-%s' % (a, z if z < 9000 else 'wall'), pc(utP[b], sum(utP)), 100 * dthP[b] / max(1, utP[b])))
    D = deaths; W = [x for x in D if x['R'] > 6500]; I = [x for x in D if x['R'] <= 6500]
    print('\nC. Our losses: %d, of which beyond radius 6500: %d (%s)' % (len(D), len(W), pc(len(W), len(D))))
    for nm, q in (('at the wall (> 6500)', W), ('inside (<= 6500)', I)):
        n = len(q)
        print('   %-22s held by a net first %s | on a dash turn %s | by turn 15 %s | moved outward by 800+ in the last 6 turns %s' % (
            nm, pc(sum(x['netted'] for x in q), n), pc(sum(x['dash'] for x in q), n), pc(sum(x['t'] <= 15 for x in q), n), pc(sum(x['out'] > 800 for x in q), n)))
        print('   %-22s last order: %s' % ('', dict(collections.Counter(x['tag'] or '-' for x in q).most_common(7))))
    n = len(W)
    print('   wall losses: turns spent beyond 6300 in the 12 turns before: 1-3: %s, 4-8: %s, 9+: %s' % (pc(sum(x['wz'] <= 3 for x in W), n), pc(sum(3 < x['wz'] <= 8 for x in W), n), pc(sum(x['wz'] > 8 for x in W), n)))
    print('   wall losses not held by a net: %d; of those moving outward by 800+: %d' % (sum(not x['netted'] for x in W), sum((not x['netted']) and x['out'] > 800 for x in W)))
    print('   by units per team (losses at the wall / all losses): ' + ', '.join('%d: %d/%d' % (nn, sum(x['N'] == nn for x in W), sum(x['N'] == nn for x in D)) for nn in (3, 4, 5, 6)))
    print('\nD. Flight steps (tags FLEE, LFLEE, SFLEE) by where they start and where they lead; caught within 6 turns')
    for key in sorted(fleeOut):
        v = fleeOut[key]; print('   %-12s %-8s %5d steps, caught within 6 turns %s' % (key[0], key[1], v[0], pc(v[1], v[0])))
    print('   dashes that end beyond 6500 and go outward: %d, caught within 6 turns %s' % (wallDash[0], pc(wallDash[1], wallDash[0])))
    print('\nE. Bad movements')
    print('   steps deflected by a tree or the wall (the unit did not end where the order pointed): %d of %d (%s); followed by a loss within 3 turns: %d' % (defl[0], defl[1], pc(defl[0], defl[1]), deflDeath))
    print('   steps shorter than 200 while free: %d' % idle)
    tr = sum(rev.values())
    print('   reversals (a step back against the last step): %d = %.1f per game, %.1f per 100 unit-turns' % (tr, tr / games, 100 * tr / unitTurns))
    print('      by tags:', dict(rev.most_common()))
    tp = sum(pp.values())
    print('   of those, back on the spot of two turns ago (ping-pong): %d = %.1f per game; with prey within 2500: %d' % (tp, tp / games, ppPrey))
    print('      by tags:', dict(pp.most_common()))
    print('   hunt given up by turning round: %d; with the nearest predator beyond 2000: %d; and prey within 2200: %d (%.2f per game)' % (giveup[0], giveup[1], giveup[2], giveup[2] / games))
    print('      those by turn (tens):', dict(sorted(late.items())))
    print('\nF. Result against wall losses and ping-pong (games, mean rank)')
    for nm, idx, cuts in (('wall losses', 0, (0, 1, 2)), ('ping-pong steps', 1, (0, 2, 5))):
        for i, cmin in enumerate(cuts):
            cmax = cuts[i + 1] if i + 1 < len(cuts) else 10 ** 9
            q = [x for x in perGame if cmin <= x[idx] < cmax]
            if q: print('   %s %s: %d games, mean rank %.2f, units lost %.2f' % (nm, ('%d' % cmin if cmax == cmin + 1 else '%d+' % cmin if cmax > 10 ** 6 else '%d-%d' % (cmin, cmax - 1)), len(q), sum(x[2] for x in q) / len(q), sum(x[4] for x in q) / len(q)))


if __name__ == '__main__':
    try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception: pass
    main()
