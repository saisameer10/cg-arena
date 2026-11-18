# usage: python geo.py
# Geometry from the game logs: unit positions are rebuilt from the exact event positions (dashes, powers, catches)
# and the MOVE/DASH orders in between (straight lines; trees are not known, so a slide along a tree is an error
# until the next event; measured error: median 1 unit, 90 % under 600).
# Tables: the first turn by distance to prey and predator; contacts with prey and how they end; time near prey/predators.
import json, os, math, collections, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import anatomy as A

ROT = [(1.0, 0.0), (-0.5, 0.8660254), (-0.5, -0.8660254)]


def track(P):
    """-> pos[u][t] = position of unit u at the START of turn t (t = 1 .. T+1), or None"""
    ev = P['ev']; cmd = P['cmd']; T = P['T']; N = P['N']
    S = collections.defaultdict(dict); dashed = set(); netted = collections.defaultdict(list); dead = {}
    for t in ev:
        for e in ev[t]:
            if e[0] == 'dash': S[e[2]][t] = e[3]; dashed.add((e[2], t))
            elif e[0] in ('net', 'smoke', 'decoy'): S[e[2]][t + 1] = e[3]
            if e[0] == 'net':
                for h in e[5]: netted[h[1]].append(t)
            if e[0] == 'catch': dead.setdefault(e[4], t)
    orders = {}
    for t in cmd:
        for a in cmd[t]:
            for c in cmd[t][a]:
                if c[0] in ('MOVE', 'DASH') and len(c) >= 4:
                    try: orders[(int(c[1]), t)] = (float(c[2]), float(c[3]))
                    except ValueError: pass
    pos = {}
    for u in range(3 * N):
        p = [None] * (T + 3); anc = S.get(u, {})
        if anc:
            t0 = min(anc)
            # forward
            cur = None
            for t in range(t0, T + 2):
                if t in anc: cur = anc[t]
                p[t] = cur
                if cur is None or t > T: continue
                o = orders.get((u, t)); held = any(1 <= t - x <= 4 for x in netted[u])
                if o and not held and dead.get(u, 999) >= t:
                    sp = 1200.0 if (u, t) in dashed else 600.0
                    dx, dy = o[0] - cur[0], o[1] - cur[1]; L = math.hypot(dx, dy)
                    if L > sp: cur = (cur[0] + dx / L * sp, cur[1] + dy / L * sp)
                    elif L > 0: cur = (o[0], o[1])
            # backward from the first anchor
            cur = anc[t0]
            for t in range(t0 - 1, 0, -1):
                o = orders.get((u, t)); held = any(1 <= t - x <= 4 for x in netted[u])
                if o is None or held: p[t] = cur; continue
                sp = 1200.0 if (u, t) in dashed else 600.0
                dx, dy = cur[0] - o[0], cur[1] - o[1]; L = math.hypot(dx, dy)
                if L < 1.5: break                      # it reached its target: where it came from is not known
                cur = (cur[0] + dx / L * sp, cur[1] + dy / L * sp)
                if math.hypot(cur[0], cur[1]) > 8100: break
                p[t] = cur
        pos[u] = p
    # start positions by symmetry (the three teams start as 120 degree rotations of each other)
    for i in range(N):
        known = [(tm, pos[tm * N + i][1]) for tm in range(3) if pos[tm * N + i][1] is not None]
        if not known: continue
        tm0, q = known[0]
        for tm in range(3):
            if pos[tm * N + i][1] is None:
                k = (tm - tm0) % 3; c, s = ROT[k]
                P['sym'] = P.get('sym', 0) + 1
                pos[tm * N + i][1] = (q[0] * c - q[1] * s, q[0] * s + q[1] * c)
    return pos, dead, dashed, netted


def symcheck(G):
    """which way do the teams rotate? prints the error of both conventions"""
    e = {1: [], -1: []}
    for name, lst in G.items():
        for fn, ag in lst[:60]:
            try: g = json.load(open(fn))
            except Exception: continue
            P = A.parse(g); N = P['N']
            if not N: continue
            S = {}
            for ev in P['ev'].get(1, []):
                if ev[0] == 'dash': S[ev[2]] = ev[3]
            for i in range(N):
                for a in range(3):
                    for b in range(3):
                        if a < b and a * N + i in S and b * N + i in S:
                            p, q = S[a * N + i], S[b * N + i]
                            for sg in (1, -1):
                                c, s = ROT[(sg * (b - a)) % 3]
                                e[sg].append(math.hypot(p[0] * c - p[1] * s - q[0], p[0] * s + p[1] * c - q[1]))
    for sg in e:
        xs = sorted(e[sg]); print('rotation sign', sg, 'pairs', len(xs), 'median error', int(xs[len(xs) // 2]) if xs else '-')


def dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])


def study(g, seat):
    P = A.parse(g); N = P['N']; T = P['T']; ev = P['ev']; cmd = P['cmd']
    if not N: return None
    pos, dead, dashed, netted = track(P)
    prey = (seat + 1) % 3; pred = (seat + 2) % 3
    mine = range(seat * N, seat * N + N); preys = range(prey * N, prey * N + N); preds = range(pred * N, pred * N + N)
    alive = lambda u, t: dead.get(u, 999) >= t
    dashes = collections.defaultdict(list)
    for (u, t) in dashed: dashes[u].append(t)
    for u in dashes: dashes[u].sort()

    def cooling(u, t):
        ds = [x for x in dashes[u] if x < t]
        return bool(ds) and t - ds[-1] <= len(ds)
    out = {'N': N, 'open': [], 'epi': [], 'ut': collections.Counter(), 'rank': g['ranking'].index(seat) + 1}
    mycatch = {}  # prey unit -> turn
    for t in ev:
        for e in ev[t]:
            if e[0] == 'catch' and e[1] == seat: mycatch[e[4]] = t
    powers = collections.defaultdict(list)
    for t in ev:
        for e in ev[t]:
            if e[0] in ('net', 'smoke', 'decoy'): powers[(e[2], t)].append(e)
    # ---- the first turn
    for u in mine:
        p = pos[u][1]
        if p is None: continue
        dp = [dist(p, pos[q][1]) for q in preys if pos[q][1] is not None]; dq = [dist(p, pos[q][1]) for q in preds if pos[q][1] is not None]
        if not dp or not dq: continue
        o = None
        for c in cmd[1].get(seat, []):
            if c[0] in ('MOVE', 'DASH') and len(c) >= 4 and c[1] == str(u):
                try: o = (float(c[2]), float(c[3]))
                except ValueError: pass
        np_ = min(preys, key=lambda q: dist(p, pos[q][1]) if pos[q][1] is not None else 1e9)
        nq = min(preds, key=lambda q: dist(p, pos[q][1]) if pos[q][1] is not None else 1e9)
        toward = away = stay = False
        if o:
            mv = (o[0] - p[0], o[1] - p[1]); L = math.hypot(*mv)
            if L < 50: stay = True
            else:
                a = (pos[np_][1][0] - p[0], pos[np_][1][1] - p[1]); b = (pos[nq][1][0] - p[0], pos[nq][1][1] - p[1])
                ca = (mv[0] * a[0] + mv[1] * a[1]) / (L * max(1, math.hypot(*a))); cb = (mv[0] * b[0] + mv[1] * b[1]) / (L * max(1, math.hypot(*b)))
                toward = ca > 0.7; away = cb < -0.5
        pw = [e[0] for e in powers.get((u, 1), [])]
        nethit = any(e[0] == 'net' and any(h[0] == prey for h in e[5]) for e in powers.get((u, 1), []))
        out['open'].append({'dprey': min(dp), 'dpred': min(dq), 'dash': (u, 1) in dashed, 'toward': toward, 'away': away, 'stay': stay,
                            'pw': pw[0] if pw else '', 'nethit': nethit, 'lost10': dead.get(u, 999) <= 10, 'lost5': dead.get(u, 999) <= 5,
                            'netted3': any(x <= 3 for x in netted[u]), 'preycaught5': mycatch.get(np_, 999) <= 5, 'preycaught10': mycatch.get(np_, 999) <= 10})
    # ---- contacts with prey: a prey unit comes within 2000 of one of our living units
    for q in preys:
        inside = False
        for t in range(1, T + 1):
            if not alive(q, t) or pos[q][t] is None: inside = False; continue
            ds = sorted((dist(pos[u][t], pos[q][t]), u) for u in mine if alive(u, t) and pos[u][t] is not None)
            if not ds: continue
            near = ds[0][0] <= 2000
            if near and not inside:
                h = ds[0][1]
                dq = [dist(pos[h][t], pos[x][t]) for x in preds if alive(x, t) and pos[x][t] is not None]
                ct = mycatch.get(q, 999)
                out['epi'].append({'t': t, 'd': ds[0][0], 'second': ds[1][0] if len(ds) > 1 else 99999, 'cool': cooling(q, t), 'held': any(1 <= t - x <= 4 for x in netted[q]),
                                   'hcool': cooling(h, t), 'hfat': len([x for x in dashes[h] if x < t]), 'pfat': len([x for x in dashes[q] if x < t]),
                                   'danger': min(dq) if dq else 99999, 'c3': 0 <= ct - t <= 3, 'c6': 0 <= ct - t <= 6, 'c12': 0 <= ct - t <= 12,
                                   'hdash3': sum(1 for u in mine for x in dashes[u] if t <= x <= t + 3 and pos[u][t] is not None and dist(pos[u][t], pos[q][t]) <= 3000),
                                   'net3': sum(1 for u in mine for tt in range(t, t + 4) for e in powers.get((u, tt), []) if e[0] == 'net'),
                                   'hlost6': 0 <= dead.get(h, 999) - t <= 6})
            inside = near
    # ---- where our living units spend their turns
    for t in range(1, T + 1):
        for u in mine:
            if not alive(u, t) or pos[u][t] is None: continue
            dp = [dist(pos[u][t], pos[q][t]) for q in preys if alive(q, t) and pos[q][t] is not None]
            dq = [dist(pos[u][t], pos[x][t]) for x in preds if alive(x, t) and pos[x][t] is not None]
            w = A.win(t); c = out['ut']
            c['n_' + w] += 1
            if dp:
                m = min(dp); c['p2000_' + w] += m <= 2000; c['p3500_' + w] += m <= 3500; c['pfar_' + w] += m > 5000; c['psum_' + w] += m; c['pn_' + w] += 1
            if dq:
                m = min(dq); c['q2000_' + w] += m <= 2000; c['q3000_' + w] += m <= 3000; c['qsum_' + w] += m; c['qn_' + w] += 1
            c['R_' + w] += math.hypot(*pos[u][t])
    out['cover'] = sum(1 for u in range(3 * N) if pos[u][1] is not None) / (3.0 * N)
    return out


def pc(a, b): return ('%3.0f%%' % (100.0 * a / b)) if b else '   -'


if __name__ == '__main__':
    G = A.groups()
    if 'sym' in sys.argv: symcheck(G); sys.exit()
    D = collections.OrderedDict()
    for name, lst in G.items():
        rows = []
        for fn, ag in lst:
            try: g = json.load(open(fn))
            except Exception: continue
            if ag is None:
                me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
                if not me: continue
                seat = me[0]['index']
                if name == 'us (live)' and any((a.get('rank') or 999) <= 100 for a in g['agents'] if a['index'] != seat): continue
            else:
                s = [a['index'] for a in g['agents'] if a.get('agent_id') == ag]
                if not s: continue
                seat = s[0]
            r = study(g, seat)
            if r: rows.append(r)
        D[name] = rows
    names = list(D.keys()); n = {x: max(1, len(D[x])) for x in names}
    print('games', [len(D[x]) for x in names], ' start positions known: ', ['%.0f%%' % (100 * sum(r['cover'] for r in D[x]) / n[x]) for x in names])
    O = {x: [o for r in D[x] for o in r['open']] for x in names}
    T_ = A.table
    bins = [(0, 2000), (2000, 3200), (3200, 4500), (4500, 99999)]
    lines = []
    for a, b in bins:
        sel = lambda o, a=a, b=b: a <= o['dprey'] < b
        lines += [('nearest prey %d to %d: units' % (a, b), ['%.2f/game' % (sum(1 for o in O[x] if sel(o)) / n[x]) for x in names]),
                  ('   dash towards it', [pc(sum(1 for o in O[x] if sel(o) and o['dash'] and o['toward']), sum(1 for o in O[x] if sel(o))) for x in names]),
                  ('   walk towards it', [pc(sum(1 for o in O[x] if sel(o) and not o['dash'] and o['toward']), sum(1 for o in O[x] if sel(o))) for x in names]),
                  ('   net', [pc(sum(1 for o in O[x] if sel(o) and o['pw'] == 'net'), sum(1 for o in O[x] if sel(o))) for x in names]),
                  ('   net hit prey (of nets)', [pc(sum(1 for o in O[x] if sel(o) and o['nethit']), sum(1 for o in O[x] if sel(o) and o['pw'] == 'net')) for x in names]),
                  ('   smoke', [pc(sum(1 for o in O[x] if sel(o) and o['pw'] == 'smoke'), sum(1 for o in O[x] if sel(o))) for x in names]),
                  ('   that prey caught by turn 5 / 10', ['%s/%s' % (pc(sum(1 for o in O[x] if sel(o) and o['preycaught5']), sum(1 for o in O[x] if sel(o))).strip(), pc(sum(1 for o in O[x] if sel(o) and o['preycaught10']), sum(1 for o in O[x] if sel(o))).strip()) for x in names])]
    T_('Turn 1 by distance to the nearest prey unit', names, lines)
    lines = []
    for a, b in bins:
        sel = lambda o, a=a, b=b: a <= o['dpred'] < b
        lines += [('nearest predator %d to %d: units' % (a, b), ['%.2f/game' % (sum(1 for o in O[x] if sel(o)) / n[x]) for x in names]),
                  ('   dash', [pc(sum(1 for o in O[x] if sel(o) and o['dash']), sum(1 for o in O[x] if sel(o))) for x in names]),
                  ('   dash away from it', [pc(sum(1 for o in O[x] if sel(o) and o['dash'] and o['away']), sum(1 for o in O[x] if sel(o))) for x in names]),
                  ('   smoke', [pc(sum(1 for o in O[x] if sel(o) and o['pw'] == 'smoke'), sum(1 for o in O[x] if sel(o))) for x in names]),
                  ('   net', [pc(sum(1 for o in O[x] if sel(o) and o['pw'] == 'net'), sum(1 for o in O[x] if sel(o))) for x in names]),
                  ('   decoy', [pc(sum(1 for o in O[x] if sel(o) and o['pw'] == 'decoy'), sum(1 for o in O[x] if sel(o))) for x in names]),
                  ('   netted by turn 3', [pc(sum(1 for o in O[x] if sel(o) and o['netted3']), sum(1 for o in O[x] if sel(o))) for x in names]),
                  ('   lost by turn 5 / 10', ['%s/%s' % (pc(sum(1 for o in O[x] if sel(o) and o['lost5']), sum(1 for o in O[x] if sel(o))).strip(), pc(sum(1 for o in O[x] if sel(o) and o['lost10']), sum(1 for o in O[x] if sel(o))).strip()) for x in names])]
        for lab, f in (('smoke', lambda o: o['pw'] == 'smoke'), ('net', lambda o: o['pw'] == 'net'), ('no power, dash', lambda o: not o['pw'] and o['dash']), ('no power, walk', lambda o: not o['pw'] and not o['dash'])):
            lines.append(('      lost by turn 10 after: %s (n)' % lab, ['%s(%d)' % (pc(sum(1 for o in O[x] if sel(o) and f(o) and o['lost10']), sum(1 for o in O[x] if sel(o) and f(o))).strip(), sum(1 for o in O[x] if sel(o) and f(o))) for x in names]))
    T_('Turn 1 by distance to the nearest predator unit', names, lines)
    E = {x: [e for r in D[x] for e in r['epi']] for x in names}
    ec = lambda x, f, k: pc(sum(1 for e in E[x] if f(e) and e[k]), sum(1 for e in E[x] if f(e)))
    en = lambda x, f: '%.2f' % (sum(1 for e in E[x] if f(e)) / n[x])
    lines = [('contacts per game (prey comes within 2000)', [en(x, lambda e: True) for x in names]),
             ('caught within 3 / 6 / 12 turns', ['%s/%s/%s' % (ec(x, lambda e: True, 'c3').strip(), ec(x, lambda e: True, 'c6').strip(), ec(x, lambda e: True, 'c12').strip()) for x in names]),
             ('our nearest unit lost within 6 turns', [ec(x, lambda e: True, 'hlost6') for x in names])]
    cuts = [('prey held by a net', lambda e: e['held']),
            ('prey free, on cooldown', lambda e: not e['held'] and e['cool']),
            ('prey free, can dash', lambda e: not e['held'] and not e['cool']),
            ('prey free, we can dash', lambda e: not e['held'] and not e['hcool']),
            ('prey free, we are on cooldown', lambda e: not e['held'] and e['hcool']),
            ('prey free, second unit of ours within 3000', lambda e: not e['held'] and e['second'] <= 3000),
            ('prey free, no second unit within 3000', lambda e: not e['held'] and e['second'] > 3000),
            ('prey free, a predator within 2500 of our unit', lambda e: not e['held'] and e['danger'] <= 2500),
            ('prey free, no predator within 2500', lambda e: not e['held'] and e['danger'] > 2500),
            ('turns 1-5', lambda e: e['t'] <= 5), ('turns 6-15', lambda e: 5 < e['t'] <= 15), ('turns 16-30', lambda e: 15 < e['t'] <= 30),
            ('turns 31-60', lambda e: 30 < e['t'] <= 60), ('turns 61+', lambda e: e['t'] > 60)]
    for lab, f in cuts:
        lines.append(('%s: per game; caught in 6' % lab, ['%s; %s' % (en(x, f), ec(x, f, 'c6').strip()) for x in names]))
    lines += [('free prey: our dashes in the next 3 turns, mean', ['%.2f' % (sum(e['hdash3'] for e in E[x] if not e['held']) / max(1, sum(1 for e in E[x] if not e['held']))) for x in names]),
              ('free prey: our nets in the next 3 turns, mean', ['%.2f' % (sum(e['net3'] for e in E[x] if not e['held']) / max(1, sum(1 for e in E[x] if not e['held']))) for x in names]),
              ('free prey, we dash in the next 3 turns: caught in 6', [ec(x, lambda e: not e['held'] and e['hdash3'] > 0, 'c6') for x in names]),
              ('free prey, we do not dash: caught in 6', [ec(x, lambda e: not e['held'] and e['hdash3'] == 0, 'c6') for x in names]),
              ('free prey, we net in the next 3 turns: caught in 6', [ec(x, lambda e: not e['held'] and e['net3'] > 0, 'c6') for x in names]),
              ('free prey, no net: caught in 6', [ec(x, lambda e: not e['held'] and e['net3'] == 0, 'c6') for x in names])]
    T_('Contacts with prey', names, lines)
    U = {x: sum((r['ut'] for r in D[x]), collections.Counter()) for x in names}
    lines = []
    for w in A.WINS:
        lines += [('turns %s: within 2000 of prey' % w, [pc(U[x]['p2000_' + w], U[x]['pn_' + w]) for x in names]),
                  ('turns %s: within 3500 of prey' % w, [pc(U[x]['p3500_' + w], U[x]['pn_' + w]) for x in names]),
                  ('turns %s: over 5000 from any prey' % w, [pc(U[x]['pfar_' + w], U[x]['pn_' + w]) for x in names]),
                  ('turns %s: within 2000 / 3000 of a predator' % w, ['%s/%s' % (pc(U[x]['q2000_' + w], U[x]['qn_' + w]).strip(), pc(U[x]['q3000_' + w], U[x]['qn_' + w]).strip()) for x in names]),
                  ('turns %s: mean distance from the centre' % w, [int(U[x]['R_' + w] / max(1, U[x]['n_' + w])) for x in names])]
    T_('Where our living units are (share of unit-turns)', names, lines)
