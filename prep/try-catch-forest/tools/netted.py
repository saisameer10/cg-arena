# usage: python netted.py <debug-game.json>...
# Every time one of our units is netted: what was the situation, what did we do, did it survive.
import json, sys, re, math, collections

ev = []
for fn in sys.argv[1:]:
    try: d = json.load(open(fn, encoding='utf-8'))
    except ValueError: continue
    if 'log' not in d: continue
    log = d['log']; me = [a['index'] for a in log['agents'] if a.get('me')][0]; pred = (me + 2) % 3
    t = 0; last = -1; out = {}; summ = collections.defaultdict(list); M = {}; E = {}
    for f in log['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1
        last = a
        if a == me:
            out[t] = f.get('stdout') or ''; M[t] = {}; E[t] = []
            for l in (f.get('stderr') or '').split('\n'):
                x = l.split()
                if l.startswith('M '): M[t][x[1]] = x
                elif l.startswith('E ') and x[2] == 'UNIT' and int(x[3]) == pred: E[t].append(x)
        for l in (f.get('summary') or '').split('\n'):
            if l: summ[t].append(l)
    caught = {}
    for tt in summ:
        for l in summ[tt]:
            m = re.match(r"\$\d's agent \d+ catches \$%d's agent (\d+)" % me, l)
            if m: caught[m.group(1)] = tt
    for tt in sorted(summ):
        for l in summ[tt]:
            m = re.match(r"\$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\) throws a net", l)
            if not m or int(m.group(1)) == me or ' nets ' not in l: continue
            for u in re.findall(r"\$%d's agent (\d+)" % me, l.split(' nets ', 1)[1]):
                mu = M.get(tt, {}).get(u)
                if not mu or mu[8] != '0': continue
                x, y = float(mu[4]), float(mu[5])
                thrower = int(m.group(1)); dist = math.hypot(int(m.group(3)) - x, int(m.group(4)) - y)
                seen = [math.hypot(float(e[4]) - x, float(e[5]) - y) for e in E.get(tt, [])]
                r = {'by': 'predator' if thrower == pred else 'prey', 'dist': dist, 'sawPred': min(seen) if seen else None,
                     'died': u in caught and tt <= caught[u] <= tt + 5, 'alreadyHeld': mu[11] != '0'}
                # our orders on the turn of the net (before it landed) and on the 4 turns after
                def did(k, kind, unit=None):
                    return any(c.startswith(kind + ' ' + (unit + ' ' if unit else '')) for c in out.get(k, '').split(';'))
                r['smokeSameTurn'] = did(tt, 'SMOKE', u); r['decoySameTurn'] = did(tt, 'DECOY', u)
                r['ownSmokeAfter'] = any(did(k, 'SMOKE', u) for k in range(tt + 1, tt + 5))
                r['ownNetAfter'] = any(did(k, 'NET', u) for k in range(tt + 1, tt + 5))
                r['mateNetAfter'] = any(c.startswith('NET ') and c.split()[1] != u for k in range(tt + 1, tt + 5) for c in out.get(k, '').split(';'))
                near = [math.hypot(float(v[4]) - x, float(v[5]) - y) for kk, v in M[tt].items() if kk != u and v[8] == '0']
                r['mateNear'] = min(near) if near else 9e9
                ev.append(r)


def pc(a, b): return '%d%%' % round(100 * a / b) if b else '-'


n = len(ev); print('our units netted: %d times; caught within 5 turns: %s' % (n, pc(sum(e['died'] for e in ev), n)))
for name, f in (('thrown by our predator', lambda e: e['by'] == 'predator'), ('thrown by our prey', lambda e: e['by'] == 'prey'),
                ('thrower within 1400', lambda e: e['dist'] < 1400), ('thrower 1400 to 2000', lambda e: 1400 <= e['dist'] < 2000), ('thrower beyond 2000', lambda e: e['dist'] >= 2000),
                ('no predator in sight that turn', lambda e: e['sawPred'] is None), ('a predator in sight within 2500', lambda e: e['sawPred'] is not None and e['sawPred'] < 2500),
                ('we ordered smoke that same turn', lambda e: e['smokeSameTurn']), ('we ordered a decoy that same turn', lambda e: e['decoySameTurn']),
                ('held unit smoked afterwards', lambda e: e['ownSmokeAfter']), ('held unit threw a net afterwards', lambda e: e['ownNetAfter']),
                ('a team mate threw a net afterwards', lambda e: e['mateNetAfter']), ('held unit did nothing afterwards', lambda e: not e['ownSmokeAfter'] and not e['ownNetAfter']),
                ('team mate within 2000', lambda e: e['mateNear'] < 2000), ('no team mate within 2000', lambda e: e['mateNear'] >= 2000)):
    q = [e for e in ev if f(e)]
    print('   %-36s %3d (%s of all)   caught %s' % (name, len(q), pc(len(q), n), pc(sum(e['died'] for e in q), len(q))))
