# usage: python geo2.py
# What a hunter does when it is the nearest of its team to a prey unit within 2500, and what comes of it.
# One line per (turn, prey unit): state = distance, prey held / on cooldown / able to dash, hunter able to dash;
# action = dash at it / net / walk; outcome = caught this turn, caught within 3 turns, hunter lost within 4.
# Groups: us (live code), teams rated about 23, teams rated about 25 (all against opponents ranked beyond 100).
import json, os, math, collections, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import anatomy as A, geo

DB = [(0, 800), (800, 1100), (1100, 1400), (1400, 1700), (1700, 2100), (2100, 2500)]


def study(g, seat):
    P = A.parse(g); N = P['N']; T = P['T']; ev = P['ev']
    if not N: return []
    pos, dead, dashed, netted = geo.track(P)
    prey = (seat + 1) % 3; pred = (seat + 2) % 3
    mine = range(seat * N, seat * N + N); preys = range(prey * N, prey * N + N); preds = range(pred * N, pred * N + N)
    alive = lambda u, t: dead.get(u, 999) >= t
    dashes = collections.defaultdict(list); dto = {}
    for t in ev:
        for e in ev[t]:
            if e[0] == 'dash': dashes[e[2]].append(t); dto[(e[2], t)] = e[4]
    for u in dashes: dashes[u].sort()

    def cooling(u, t):
        ds = [x for x in dashes[u] if x < t]
        return bool(ds) and t - ds[-1] <= len(ds)

    def cdleft(u, t):
        ds = [x for x in dashes[u] if x < t]
        return max(0, len(ds) - (t - ds[-1]) + 1) if ds else 0
    mycatch = {}; nets = collections.defaultdict(list)
    for t in ev:
        for e in ev[t]:
            if e[0] == 'catch' and e[1] == seat: mycatch[e[4]] = t
            if e[0] == 'net' and e[1] == seat: nets[(e[2], t)].append(e)
    out = []
    for t in range(1, T + 1):
        for q in preys:
            if not alive(q, t) or pos[q][t] is None: continue
            ds = sorted((geo.dist(pos[u][t], pos[q][t]), u) for u in mine if alive(u, t) and pos[u][t] is not None)
            if not ds or ds[0][0] > 2500: continue
            d0, h = ds[0]
            if any(1 <= t - x <= 4 for x in netted[h]): continue      # our unit is held: no choice to study
            dq = [geo.dist(pos[h][t], pos[x][t]) for x in preds if alive(x, t) and pos[x][t] is not None]
            act = 'walk'
            if (h, t) in dto:
                a = (dto[(h, t)][0] - pos[h][t][0], dto[(h, t)][1] - pos[h][t][1]); b = (pos[q][t][0] - pos[h][t][0], pos[q][t][1] - pos[h][t][1])
                c = (a[0] * b[0] + a[1] * b[1]) / max(1.0, math.hypot(*a) * math.hypot(*b))
                act = 'dash' if c > 0.6 else 'dashaway'
            nt = nets.get((h, t), [])
            hit = any(x == (prey, q) for e in nt for x in e[5])
            anynet = any(e[0] == 'net' and e[1] == seat and (prey, q) in e[5] for e in ev.get(t, []))
            ct = mycatch.get(q, 999)
            out.append({'t': t, 'N': N, 'd': d0, 'second': ds[1][0] if len(ds) > 1 else 99999,
                        'pstate': 'held' if any(1 <= t - x <= 4 for x in netted[q]) else 'cool' if cooling(q, t) else 'free',
                        'pcd': cdleft(q, t), 'pfat': len([x for x in dashes[q] if x < t]), 'pdash': (q, t) in dto,
                        'hcan': not cooling(h, t), 'hfat': len([x for x in dashes[h] if x < t]),
                        'danger': min(dq) if dq else 99999, 'act': act, 'net': bool(nt), 'hit': hit, 'teamhit': anynet,
                        'c0': ct == t, 'c3': 0 <= ct - t <= 3, 'c6': 0 <= ct - t <= 6, 'hlost': 0 <= dead.get(h, 999) - t <= 4})
    return out


def pc(a, b): return ('%.0f%%' % (100.0 * a / b)) if b else '-'


if __name__ == '__main__':
    G = A.groups(); D = collections.OrderedDict(); ng = {}
    for name, lst in G.items():
        if name == 'v10': continue
        rows = []; k = 0
        for fn, ag in lst:
            try: g = json.load(open(fn))
            except Exception: continue
            if ag is None:
                me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
                if not me: continue
                seat = me[0]['index']
                if any((a.get('rank') or 999) <= 100 for a in g['agents'] if a['index'] != seat): continue
            else:
                s = [a['index'] for a in g['agents'] if a.get('agent_id') == ag]
                if not s: continue
                seat = s[0]
            rows += study(g, seat); k += 1
        D[name] = rows; ng[name] = k
    json.dump(D, open('E:/cg-tmp/tcf/peer25/contacts.json', 'w'))
    names = list(D.keys())
    print('games', ng, ' hunter-prey turns', {x: len(D[x]) for x in names})

    def block(title, base):
        print('\n## ' + title)
        print('%-22s' % 'distance' + ''.join('%-44s' % x for x in names))
        print('%-22s' % '' + ''.join('%-44s' % 'n/game  dash% net%  catch now / in 3 / lost' for x in names))
        for a, b in DB:
            line = '%-22s' % ('%d to %d' % (a, b))
            for x in names:
                q = [r for r in D[x] if a <= r['d'] < b and base(r)]
                m = len(q)
                line += '%-44s' % ('%5.2f   %4s %4s   %4s / %4s / %4s' % (m / max(1, ng[x]), pc(sum(r['act'] == 'dash' for r in q), m), pc(sum(r['net'] for r in q), m),
                                                                     pc(sum(r['c0'] for r in q), m), pc(sum(r['c3'] for r in q), m), pc(sum(r['hlost'] for r in q), m)))
            print(line)

    def byact(title, base):
        print('\n## ' + title + ': caught within 3 turns (n) by what the hunter did this turn')
        print('%-22s' % 'distance' + ''.join('%-46s' % (x + ': dash | net, no dash | walk') for x in names))
        for a, b in DB:
            line = '%-22s' % ('%d to %d' % (a, b))
            for x in names:
                q = [r for r in D[x] if a <= r['d'] < b and base(r)]
                cell = []
                for f in (lambda r: r['act'] == 'dash', lambda r: r['net'] and r['act'] != 'dash', lambda r: r['act'] == 'walk' and not r['net']):
                    s = [r for r in q if f(r)]
                    cell.append('%s(%d)' % (pc(sum(r['c3'] for r in s), len(s)), len(s)))
                line += '%-46s' % ' | '.join(cell)
            print(line)

    safe = lambda r: r['danger'] > 2500
    block('Prey can dash, hunter can dash, no predator within 2500', lambda r: r['pstate'] == 'free' and r['hcan'] and safe(r))
    byact('Prey can dash, hunter can dash, no predator within 2500', lambda r: r['pstate'] == 'free' and r['hcan'] and safe(r))
    block('Prey on cooldown, hunter can dash, no predator within 2500', lambda r: r['pstate'] == 'cool' and r['hcan'] and safe(r))
    byact('Prey on cooldown, hunter can dash, no predator within 2500', lambda r: r['pstate'] == 'cool' and r['hcan'] and safe(r))
    block('Prey on cooldown, hunter can dash, a predator within 2500', lambda r: r['pstate'] == 'cool' and r['hcan'] and not safe(r))
    block('Prey can dash, hunter can dash, a predator within 2500', lambda r: r['pstate'] == 'free' and r['hcan'] and not safe(r))
    block('Prey held by a net, hunter can dash', lambda r: r['pstate'] == 'held' and r['hcan'])
    block('Prey held by a net, hunter on cooldown', lambda r: r['pstate'] == 'held' and not r['hcan'])
    block('Hunter on cooldown, prey not held', lambda r: r['pstate'] != 'held' and not r['hcan'])
    # dash strikes: how often does a dash at prey catch on that very turn?
    print('\n## A dash at prey: caught on that turn (n), all three groups together')
    allr = [r for x in names for r in D[x] if r['act'] == 'dash']
    print('%-14s %-16s %-16s %-16s %-16s' % ('distance', 'prey held', 'cooldown, walked', 'could dash, walked', 'prey dashed'))
    for a, b in DB:
        q = [r for r in allr if a <= r['d'] < b]
        cells = []
        for f in (lambda r: r['pstate'] == 'held', lambda r: r['pstate'] == 'cool' and not r['pdash'], lambda r: r['pstate'] == 'free' and not r['pdash'], lambda r: r['pdash']):
            s = [r for r in q if f(r)]; cells.append('%s(%d)' % (pc(sum(r['c0'] for r in s), len(s)), len(s)))
        print('%-14s %-16s %-16s %-16s %-16s' % ('%d-%d' % (a, b), cells[0], cells[1], cells[2], cells[3]))
    print('\n## A net at the nearest prey: hit (n), all three groups together')
    allr = [r for x in names for r in D[x] if r['net']]
    print('%-14s %-16s %-16s %-16s %-16s' % ('distance', 'prey on cooldown', 'prey could dash', '... and dashed', 'thrower dashed'))
    for a, b in DB:
        q = [r for r in allr if a <= r['d'] < b]
        cells = []
        for f in (lambda r: r['pstate'] == 'cool', lambda r: r['pstate'] == 'free', lambda r: r['pstate'] == 'free' and r['pdash'], lambda r: r['act'] == 'dash'):
            s = [r for r in q if f(r)]; cells.append('%s(%d)' % (pc(sum(r['hit'] for r in s), len(s)), len(s)))
        print('%-14s %-16s %-16s %-16s %-16s' % ('%d-%d' % (a, b), cells[0], cells[1], cells[2], cells[3]))
    print('\n## Does the prey dash when the hunter is near? share of turns the prey dashes, by distance (prey can dash)')
    for x in names:
        print(x, ' '.join('%d-%d: %s' % (a, b, pc(sum(r['pdash'] for r in D[x] if a <= r['d'] < b and r['pstate'] == 'free'), sum(1 for r in D[x] if a <= r['d'] < b and r['pstate'] == 'free'))) for a, b in DB))
    print('\n## Hunter fatigue when it dashes at prey (share of those dashes)')
    for x in names:
        q = [r for r in D[x] if r['act'] == 'dash']; c = collections.Counter(min(r['hfat'], 6) for r in q)
        print(x, 'dashes at prey per game %.2f:' % (len(q) / max(1, ng[x])), ' '.join('fat %d: %s' % (k, pc(c[k], len(q))) for k in range(7)), ' caught now: %s, in 3: %s' % (pc(sum(r['c0'] for r in q), len(q)), pc(sum(r['c3'] for r in q), len(q))))
        for lo, hi in ((0, 2), (3, 9)):
            s = [r for r in q if lo <= r['hfat'] <= hi]
            print('    hunter fatigue %d-%d: per game %.2f, caught now %s, in 3 %s, hunter lost in 4 %s' % (lo, hi, len(s) / max(1, ng[x]), pc(sum(r['c0'] for r in s), len(s)), pc(sum(r['c3'] for r in s), len(s)), pc(sum(r['hlost'] for r in s), len(s))))
