# Fingerprint of one team from a set of game logs (CodinGame logs or logs of sim/SimLog.java).
#
#   python mimic_fingerprint.py --name "Les Gens Bons" [--agent 6894245] [--json out.json] <dir> [<dir> ...]
#   python mimic_fingerprint.py --compare real.json mimic.json      side by side with the tolerance verdict
#
# Lines (kb/mimic.md, "Fingerprint"): turn-1 dash and smoke share by distance band of the nearest predator start;
# nets, smokes, decoys and dashes per game in turns 1-5, 6-20, 21-100; median net turn; share of nets at predators;
# distance of the thrower and of the nearest team mate to the target of a net; share of catches on held prey and with
# a dash; units lost by turn 10; catches by turn 10 and 20; where ghosts are sent.
# Tolerance used by --compare: shares within 10 percentage points; counts per game and distances within 25 %
# (or within 0.15 per game when both are small).
import sys, json, argparse
sys.path.insert(0, __import__('os').path.dirname(__file__))
from mimic_lib import *

BANDS = [(0, 1500, 'under 1500'), (1500, 2000, '1500-2000'), (2000, 2500, '2000-2500'), (2500, 3500, '2500-3500'), (3500, 99999, 'over 3500')]
PHASES = [(1, 5, 't1-5'), (6, 20, 't6-20'), (21, 100, 't21-100')]


def net_target(G, t, n, seat):
    """Unit a net was meant for: the unit it hit, else the living enemy nearest to its line (within 700)."""
    hits = [v for v in n['units'] if v < G.U and owner(G, v) != seat]
    if hits: return hits[0]
    a = n['from']; aim = n['aim']; d = dist(a, aim)
    if d < 1: return None
    b = (a[0] + (aim[0] - a[0]) * 2000 / d, a[1] + (aim[1] - a[1]) * 2000 / d)
    best = None
    for v in range(G.U):
        if owner(G, v) == seat or not alive(G, v, t + 1): continue
        q = pos(G, t + 1, v) or pos(G, t, v)
        if not q: continue
        sd = seg_dist(q, a, b)
        if sd < 700 and (best is None or sd < best[0]): best = (sd, v)
    return best[1] if best else None


def fingerprint(games):
    F = {}; cnt = {}

    def add(k, v=1.0): F[k] = F.get(k, 0.0) + v
    def share(k, yes): cnt.setdefault(k, [0, 0]); cnt[k][1] += 1; cnt[k][0] += 1 if yes else 0
    lists = {}
    def push(k, v): lists.setdefault(k, []).append(v)
    ng = 0; wins = 0; ranks = 0
    for G, s in games:
        ng += 1; prey = (s + 1) % 3; pred = (s + 2) % 3
        wins += G.rank[s] == 1; ranks += G.rank[s]
        mine = list(units_of(G, s))
        # ---- turn 1 by distance of the nearest predator start
        o = G.T[1]
        for u in mine:
            share('t1 dash, all units', u in o.dash)
            if not G.S[u]: continue
            dp = min(dist(G.S[u], G.S[v]) for v in units_of(G, pred) if G.S[v]) if any(G.S[v] for v in units_of(G, pred)) else None
            dq = min(dist(G.S[u], G.S[v]) for v in units_of(G, prey) if G.S[v]) if any(G.S[v] for v in units_of(G, prey)) else None
            if dp is None: continue
            for lo, hi, lab in BANDS:
                if lo <= dp < hi:
                    share('t1 dash, predator start ' + lab, u in o.dash)
                    share('t1 smoke, predator start ' + lab, any(x['u'] == u for x in o.smokes))
            c = o.cmd.get(u)
            if c:
                v = (c[2] - G.S[u][0], c[3] - G.S[u][1])
                pv = min((dist(G.S[u], G.S[w]), w) for w in units_of(G, pred) if G.S[w])[1]
                a = ang(v, (G.S[u][0] - G.S[pv][0], G.S[u][1] - G.S[pv][1]))
                if a is not None and dp < 2000: share('t1 predator start under 2000: order within 60 deg of straight away', a < 60)
                if dq is not None and dp > 3500:
                    qv = min((dist(G.S[u], G.S[w]), w) for w in units_of(G, prey) if G.S[w])[1]
                    a2 = ang(v, (G.S[qv][0] - G.S[u][0], G.S[qv][1] - G.S[u][1]))
                    if a2 is not None: share('t1 predator start over 3500: order within 60 deg of nearest prey', a2 < 60)
            if dq is not None and dq < 2000: share('t1 net, prey start under 2000', any(x['u'] == u for x in o.nets))
        # ---- items and dashes per phase
        for t in range(1, G.turns + 1):
            o = G.T[t]
            ph = next(lab for lo, hi, lab in PHASES if lo <= t <= hi)
            for n in o.nets:
                if n['owner'] != s: continue
                add('nets ' + ph); push('net turn', t)
                tg = net_target(G, t, n, s)
                hit_enemy = any(owner(G, v) != s for v in n['units'] if v < G.U)
                share('nets that hit an enemy unit', hit_enemy)
                if tg is None: share('nets at predators', False); continue
                share('nets at predators', owner(G, tg) == pred)
                tp = pos(G, t + 1, tg) or pos(G, t, tg)
                if tp:
                    kind = 'prey' if owner(G, tg) == prey else 'predator'
                    push('net at %s: thrower to target' % kind, dist(n['from'], tp))
                    mates = [dist(pos(G, t + 1, m), tp) for m in mine if m != n['u'] and alive(G, m, t + 1) and pos(G, t + 1, m)]
                    if mates and kind == 'prey': push('net at prey: nearest team mate to target', min(mates))
                    share('net at %s: target could dash' % kind, dash_ready(G, tg, t) and not netted(G, tg, t))
            for x in o.smokes:
                if x['owner'] == s: add('smokes ' + ph)
            for x in o.decoys:
                if x['owner'] == s: add('decoys ' + ph)
            for u in o.dash:
                if u < G.U and owner(G, u) == s:
                    add(('dashes ' if alive(G, u, t) else 'ghost dashes ') + ph)
            for c in o.catches:
                if c['byOwner'] == s and c['vOwner'] == prey:
                    add('catches'); add('catches by turn 10', t <= 10); add('catches by turn 20', t <= 20)
                    share('catches on held prey', netted(G, c['v'], t)); share('catches with a dash', c['by'] in o.dash)
                if c['vOwner'] == s:
                    add('units lost'); add('units lost by turn 10', t <= 10)
                    share('lost units that were held', netted(G, c['v'], t))
            # ---- ghosts
            for u in mine:
                if alive(G, u, t): continue
                c = o.cmd.get(u)
                if not c: share('ghost: no order', True); continue
                share('ghost: no order', False)
                q = (c[2], c[3])
                np_ = nearest(G, t, q, prey); nd = nearest(G, t, q, pred); nm = nearest(G, t, q, s)
                a = np_ is not None and np_[1] < 1000; b = nd is not None and nd[1] < 1000; m = nm is not None and nm[1] < 1000
                share('ghost order within 1000 of a living prey', a); share('ghost order within 1000 of a living predator', b)
                share('ghost order within 1000 of a living team mate', m); share('ghost order near nobody', not (a or b or m))
        for k in ('nets', 'smokes', 'decoys', 'dashes', 'ghost dashes'):
            for _, _, lab in PHASES: add(k + ' ' + lab, 0)
        for k in ('catches', 'catches by turn 10', 'catches by turn 20', 'units lost', 'units lost by turn 10'): add(k, 0)
    out = {'games': ng, 'lines': []}
    if ng == 0: return out
    L = out['lines']
    L.append(['win share (context, not matched)', 'info', round(100.0 * wins / ng, 1), ng])
    L.append(['mean rank (context, not matched)', 'info', round(ranks / ng, 2), ng])
    for _, _, lab in BANDS:
        for w in ('dash', 'smoke'):
            k = 't1 %s, predator start %s' % (w, lab)
            if k in cnt: L.append([k, 'share', round(100.0 * cnt[k][0] / cnt[k][1], 1), cnt[k][1]])
    for k in ('t1 dash, all units', 't1 predator start under 2000: order within 60 deg of straight away', 't1 predator start over 3500: order within 60 deg of nearest prey', 't1 net, prey start under 2000'):
        if k in cnt: L.append([k, 'share', round(100.0 * cnt[k][0] / cnt[k][1], 1), cnt[k][1]])
    for k in ('nets', 'smokes', 'decoys', 'dashes', 'ghost dashes'):
        for _, _, lab in PHASES: L.append(['%s per game, %s' % (k, lab), 'count', round(F[k + ' ' + lab] / ng, 2), ng])
    nt = lists.get('net turn', [])
    L.append(['median net turn', 'turn', med(nt) if nt else None, len(nt)])
    for k in ('nets at predators', 'nets that hit an enemy unit', 'net at prey: target could dash', 'net at predator: target could dash'):
        if k in cnt: L.append([k, 'share', round(100.0 * cnt[k][0] / cnt[k][1], 1), cnt[k][1]])
    for k in ('net at prey: thrower to target', 'net at prey: nearest team mate to target', 'net at predator: thrower to target'):
        v = lists.get(k, [])
        L.append([k + ' (median)', 'dist', round(med(v)) if v else None, len(v)])
    for k in ('catches on held prey', 'catches with a dash', 'lost units that were held'):
        if k in cnt: L.append([k, 'share', round(100.0 * cnt[k][0] / cnt[k][1], 1), cnt[k][1]])
    for k in ('catches', 'catches by turn 10', 'catches by turn 20', 'units lost', 'units lost by turn 10'):
        L.append([k + ' per game', 'count', round(F[k] / ng, 2), ng])
    for k in ('ghost order within 1000 of a living prey', 'ghost order within 1000 of a living predator', 'ghost order within 1000 of a living team mate', 'ghost order near nobody', 'ghost: no order'):
        if k in cnt: L.append([k, 'share', round(100.0 * cnt[k][0] / cnt[k][1], 1), cnt[k][1]])
    return out


def verdict(kind, a, b):
    if a is None or b is None: return 'n/a'
    if kind == 'info': return ''
    if kind == 'share': return 'ok' if abs(a - b) <= 10 else 'OFF'
    if kind == 'turn': return 'ok' if abs(a - b) <= max(3, 0.25 * a) else 'OFF'
    if kind == 'count': return 'ok' if abs(a - b) <= max(0.15, 0.25 * a) else 'OFF'
    return 'ok' if abs(a - b) <= 0.25 * a else 'OFF'


def show(fp):
    print('games: %d' % fp['games'])
    for k, kind, v, n in fp['lines']:
        print('%-72s %8s  (%d)' % (k, '-' if v is None else ('%.1f%%' % v if kind == 'share' else v), n))


def compare(a, b, la='real', lb='mimic', md=False):
    da = {l[0]: l for l in a['lines']}; db = {l[0]: l for l in b['lines']}
    off = 0; tot = 0
    if md: print('| Line | %s (%d games) | %s (%d games) | |\n|---|---|---|---|' % (la, a['games'], lb, b['games']))
    else: print('%-72s %16s %16s  %s' % ('line', '%s (%d)' % (la, a['games']), '%s (%d)' % (lb, b['games']), ''))
    for k, kind, v, n in a['lines']:
        w = db.get(k); v2 = w[2] if w else None; n2 = w[3] if w else 0
        vd = verdict(kind, v, v2)
        if vd in ('ok', 'OFF'): tot += 1; off += vd == 'OFF'
        f = lambda x, m: '-' if x is None else ('%.0f%% (%d)' % (x, m) if kind == 'share' else '%s (%d)' % (x, m))
        weak = ' weak' if (kind in ('share', 'dist', 'turn') and min(n, n2) < 30 and vd in ('ok', 'OFF')) else ''
        if md: print('| %s | %s | %s | %s%s |' % (k, f(v, n), f(v2, n2), vd, weak))
        else: print('%-72s %16s %16s  %s%s' % (k, f(v, n), f(v2, n2), vd, weak))
    print('\nlines compared: %d, inside the tolerance: %d, outside: %d' % (tot, tot - off, off))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--name'); ap.add_argument('--agent', type=int, action='append'); ap.add_argument('--json'); ap.add_argument('--limit', type=int)
    ap.add_argument('--compare', nargs=2); ap.add_argument('--labels', nargs=2, default=['real', 'mimic']); ap.add_argument('--md', action='store_true')
    ap.add_argument('dirs', nargs='*')
    a = ap.parse_args()
    if a.compare:
        compare(json.load(open(a.compare[0])), json.load(open(a.compare[1])), a.labels[0], a.labels[1], a.md)
    else:
        fp = fingerprint(load_games(a.dirs, a.name, a.agent, a.limit))
        fp['name'] = a.name
        if a.json: json.dump(fp, open(a.json, 'w'), indent=1)
        show(fp)
