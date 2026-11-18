# usage: python geo3.py
# Defence: what one of our units does when a predator unit is within 2500, and what comes of it.
# One line per (turn, our living unit that is not held). Outcome: netted within 2 turns, lost within 3 / 6 turns.
import json, os, math, collections, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import anatomy as A, geo

DB = [(0, 1000), (1000, 1400), (1400, 1800), (1800, 2200), (2200, 2600)]


def study(g, seat):
    P = A.parse(g); N = P['N']; T = P['T']; ev = P['ev']
    if not N: return []
    pos, dead, dashed, netted = geo.track(P)
    prey = (seat + 1) % 3; pred = (seat + 2) % 3
    mine = range(seat * N, seat * N + N); preds = range(pred * N, pred * N + N); preys = range(prey * N, prey * N + N)
    alive = lambda u, t: dead.get(u, 999) >= t
    dashes = collections.defaultdict(list); dto = {}
    for t in ev:
        for e in ev[t]:
            if e[0] == 'dash': dashes[e[2]].append(t); dto[(e[2], t)] = e[4]
    for u in dashes: dashes[u].sort()

    def cooling(u, t):
        ds = [x for x in dashes[u] if x < t]
        return bool(ds) and t - ds[-1] <= len(ds)
    pw = collections.defaultdict(list)
    for t in ev:
        for e in ev[t]:
            if e[0] in ('net', 'smoke', 'decoy') and e[1] == seat: pw[(e[2], t)].append(e)
    out = []; nets_in = []
    for t in range(1, T + 1):
        for u in mine:
            if not alive(u, t) or pos[u][t] is None: continue
            if any(1 <= t - x <= 4 for x in netted[u]): continue
            ds = sorted((geo.dist(pos[u][t], pos[x][t]), x) for x in preds if alive(x, t) and pos[x][t] is not None)
            if not ds or ds[0][0] > 2600: continue
            d0, x = ds[0]
            act = 'walk'
            if (u, t) in dto:
                a = (dto[(u, t)][0] - pos[u][t][0], dto[(u, t)][1] - pos[u][t][1]); b = (pos[x][t][0] - pos[u][t][0], pos[x][t][1] - pos[u][t][1])
                c = (a[0] * b[0] + a[1] * b[1]) / max(1.0, math.hypot(*a) * math.hypot(*b))
                act = 'dashaway' if c < -0.3 else 'dashother'
            p = pw.get((u, t), []); power = p[0][0] if p else ''
            hitpred = bool(p) and p[0][0] == 'net' and any(h[0] == pred for h in p[0][5])
            smoff = geo.dist(p[0][3], p[0][4]) if p and p[0][0] == 'smoke' else -1
            dp = [geo.dist(pos[u][t], pos[q][t]) for q in preys if alive(q, t) and pos[q][t] is not None]
            out.append({'t': t, 'N': N, 'd': d0, 'two': len(ds) > 1 and ds[1][0] <= 2600, 'can': not cooling(u, t), 'fat': len([y for y in dashes[u] if y < t]),
                        'pcan': not cooling(x, t), 'act': act, 'pw': power, 'hitpred': hitpred, 'smoff': smoff, 'prey': min(dp) if dp else 99999,
                        'netted2': any(0 <= y - t <= 1 for y in netted[u]), 'lost3': 0 <= dead.get(u, 999) - t <= 3, 'lost6': 0 <= dead.get(u, 999) - t <= 6})
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
    names = list(D.keys())
    print('games', ng, ' unit-turns with a predator within 2600:', {x: '%.1f/game' % (len(D[x]) / max(1, ng[x])) for x in names})

    def block(title, base):
        print('\n## ' + title)
        print('%-14s' % 'distance' + ''.join('%-56s' % (x + ': n/game dashaway% smoke% net% decoy% | netted2 lost3 lost6') for x in names))
        for a, b in DB:
            line = '%-14s' % ('%d-%d' % (a, b))
            for x in names:
                q = [r for r in D[x] if a <= r['d'] < b and base(r)]; m = len(q)
                line += '%-56s' % ('%5.2f  %4s %4s %4s %4s | %4s %4s %4s' % (m / max(1, ng[x]), pc(sum(r['act'] == 'dashaway' for r in q), m), pc(sum(r['pw'] == 'smoke' for r in q), m),
                                                                          pc(sum(r['pw'] == 'net' for r in q), m), pc(sum(r['pw'] == 'decoy' for r in q), m),
                                                                          pc(sum(r['netted2'] for r in q), m), pc(sum(r['lost3'] for r in q), m), pc(sum(r['lost6'] for r in q), m)))
            print(line)

    def byact(title, base, key='lost6'):
        print('\n## ' + title + ': %s (n) by what our unit did this turn; the three groups together' % key)
        allr = [r for x in names for r in D[x] if base(r)]
        acts = [('dash away, no power', lambda r: r['act'] == 'dashaway' and not r['pw']), ('walk, no power', lambda r: r['act'] == 'walk' and not r['pw']),
                ('smoke on itself', lambda r: r['pw'] == 'smoke' and r['smoff'] <= 600), ('smoke elsewhere', lambda r: r['pw'] == 'smoke' and r['smoff'] > 600),
                ('net, hit the predator', lambda r: r['pw'] == 'net' and r['hitpred']), ('net, other', lambda r: r['pw'] == 'net' and not r['hitpred']), ('decoy', lambda r: r['pw'] == 'decoy')]
        print('%-14s' % 'distance' + ''.join('%-24s' % a[0] for a in acts))
        for a, b in DB:
            q = [r for r in allr if a <= r['d'] < b]; line = '%-14s' % ('%d-%d' % (a, b))
            for _, f in acts:
                s = [r for r in q if f(r)]; line += '%-24s' % ('%s (%d)' % (pc(sum(r[key] for r in s), len(s)), len(s)))
            print(line)

    block('Our unit can dash', lambda r: r['can'])
    block('Our unit is on cooldown', lambda r: not r['can'])
    byact('Our unit can dash, turns 1-10', lambda r: r['can'] and r['t'] <= 10)
    byact('Our unit can dash, after turn 10', lambda r: r['can'] and r['t'] > 10)
    byact('Our unit is on cooldown', lambda r: not r['can'])
    byact('Our unit can dash, turns 1-10', lambda r: r['can'] and r['t'] <= 10, 'netted2')
    byact('Our unit can dash, after turn 10', lambda r: r['can'] and r['t'] > 10, 'netted2')
    for x in names:
        print('\n', x, ': by what our unit did, predator within 1000-2200, unit can dash: share of turns; lost within 6')
        q = [r for r in D[x] if 1000 <= r['d'] < 2200 and r['can']]
        for lab, f in (('dash away, no power', lambda r: r['act'] == 'dashaway' and not r['pw']), ('walk, no power', lambda r: r['act'] == 'walk' and not r['pw']), ('smoke', lambda r: r['pw'] == 'smoke'),
                       ('net', lambda r: r['pw'] == 'net'), ('decoy', lambda r: r['pw'] == 'decoy')):
            s = [r for r in q if f(r)]
            print('   %-22s %5s of turns   lost in 6: %s   netted in 2: %s' % (lab, pc(len(s), len(q)), pc(sum(r['lost6'] for r in s), len(s)), pc(sum(r['netted2'] for r in s), len(s))))
