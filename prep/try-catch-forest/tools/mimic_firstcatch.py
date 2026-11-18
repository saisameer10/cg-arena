# How a squad gets its first catch in small games (3 and 4 units per team).
#   python mimic_firstcatch.py --name "Les Gens Bons" --agent 6894245 [--agent ...] [--sizes 3 4] <dir> [<dir> ...]
# Per game: the opening the squad played (what its best-placed unit did, nets, dashes, convergence), whether its
# first catch came by turn 15, and for the catch itself the sequence that led to it. Positions as in mimic_lib.py
# (reconstructed from the referee's text; start positions through the symmetry). "n" = games or catches.
import sys, argparse, math, collections
sys.path.insert(0, __import__('os').path.dirname(__file__))
from mimic_lib import *
from mimic_measure import Tab, Lists, band

EARLY = 15


def measure(games, sizes):
    T = Tab('Opening and outcome: share of games with the feature, by when the first catch came')
    C = Tab('Share of games with a first catch by turn %d, by what the squad did' % EARLY)
    Q = Tab('The first catch itself: how it was made')
    L = Lists()
    ng = collections.Counter(); early_n = collections.Counter()
    for G, s in games:
        if G.N not in sizes: continue
        prey = (s + 1) % 3; pred = (s + 2) % 3; mine = list(units_of(G, s))
        if any(G.S[u] is None for u in mine) or any(G.S[w] is None for w in units_of(G, prey)): ng['start unknown'] += 1; continue
        fc = None
        for t in range(1, G.turns + 1):
            for c in G.T[t].catches:
                if c['byOwner'] == s and c['vOwner'] == prey and fc is None: fc = (t, c['by'], c['v'])
            if fc: break
        key = 'catch by turn %d' % EARLY if fc and fc[0] <= EARLY else 'later or never'
        ng[G.N] += 1; early_n[G.N] += key.startswith('catch')
        sz = '%d units' % G.N
        # ---- the best-placed pair at the start
        pairs = sorted((dist(G.S[u], G.S[w]), u, w) for u in mine for w in units_of(G, prey))
        dmin, ub, wb = pairs[0]
        o1 = G.T[1]

        def heads(u, w, t=1, lim=30):
            c = G.T[t].cmd.get(u); p = G.S[u] if t == 1 else pos(G, t, u); q = G.S[w] if t == 1 else pos(G, t, w)
            if not c or not p or not q: return False
            a = ang((c[2] - p[0], c[3] - p[1]), (q[0] - p[0], q[1] - p[1]))
            return a is not None and a < lim
        dpb = min(dist(G.S[ub], G.S[x]) for x in units_of(G, pred) if G.S[x]) if any(G.S[x] for x in units_of(G, pred)) else 99999
        f = {}
        f['best pair under 1500'] = dmin < 1500
        f['best pair under 2200'] = dmin < 2200
        f['best pair beyond 3000'] = dmin >= 3000
        f['best-placed unit heads at its prey on turn 1 (30 deg)'] = heads(ub, wb)
        f['best-placed unit dashes on turn 1'] = ub in o1.dash
        f['best-placed unit dashes AT its prey on turn 1'] = ub in o1.dash and heads(ub, wb)
        f['best-placed unit has a predator start under 2000'] = dpb < 2000
        nets_by = lambda a, b: [n for t in range(a, min(b, G.turns) + 1) for n in G.T[t].nets if n['owner'] == s]
        hit_prey = lambda ns: any(any(x < G.U and owner(G, x) == prey for x in n['units']) for n in ns)
        f['a net on turn 1'] = len(nets_by(1, 1)) > 0
        f['a net in turns 1-3'] = len(nets_by(1, 3)) > 0
        f['a net HIT prey in turns 1-3'] = hit_prey(nets_by(1, 3))
        f['a net HIT prey in turns 1-6'] = hit_prey(nets_by(1, 6))
        f['two or more units dash on turn 1'] = sum(1 for u in mine if u in o1.dash) >= 2
        f['every unit heads at some prey on turn 1 (45 deg)'] = all(any(heads(u, w, 1, 45) for w in units_of(G, prey)) for u in mine)
        near4 = collections.Counter()
        for u in mine:
            p = pos(G, 4, u)
            if not p or not alive(G, u, 4): continue
            for w in units_of(G, prey):
                q = pos(G, 4, w)
                if q and alive(G, w, 4) and dist(p, q) < 2000: near4[w] += 1
        f['two or more units within 2000 of one prey at turn 4'] = any(v >= 2 for v in near4.values())
        f['a unit within 1200 of a prey at turn 4'] = any(pos(G, 4, u) and alive(G, u, 4) and any(pos(G, 4, w) and alive(G, w, 4) and dist(pos(G, 4, u), pos(G, 4, w)) < 1200 for w in units_of(G, prey)) for u in mine)
        f['lost a unit by turn 10'] = any(G.caught[u] and G.caught[u] <= 10 for u in mine)
        f['smoke on turn 1'] = any(x['owner'] == s for x in o1.smokes)
        f['won the game'] = G.rank[s] == 1
        for k, v in f.items():
            T.add(k, key + ', ' + sz, v); T.add(k, key + ', 3-4 units', v)
        # ---- what raises the chance of an early catch
        e = key.startswith('catch')
        C.add('all games', sz, e); C.add('all games', '3-4 units', e)
        C.add('best pair ' + band(dmin, [0, 1500, 2200, 3000, 99999]), sz, e); C.add('best pair ' + band(dmin, [0, 1500, 2200, 3000, 99999]), '3-4 units', e)
        for k in ('best-placed unit dashes AT its prey on turn 1', 'a net in turns 1-3', 'a net HIT prey in turns 1-3', 'two or more units within 2000 of one prey at turn 4', 'a unit within 1200 of a prey at turn 4', 'lost a unit by turn 10', 'smoke on turn 1'):
            C.add(('yes: ' if f[k] else 'no:  ') + k, sz, e); C.add(('yes: ' if f[k] else 'no:  ') + k, '3-4 units', e)
        if dmin < 2200:
            for k in ('best-placed unit dashes AT its prey on turn 1', 'a net in turns 1-3'):
                C.add('best pair under 2200, ' + ('yes: ' if f[k] else 'no:  ') + k, '3-4 units', e)
        # ---- the first catch itself
        if not fc: Q.add('games with no catch at all', '3-4 units', True); continue
        Q.add('games with no catch at all', '3-4 units', False)
        t, by, v = fc; col = 'by turn %d' % EARLY if t <= EARLY else 'later'
        L.push('turn of the first catch (%d units)' % G.N, t)
        dv = sorted((dist(G.S[u], G.S[v]), u) for u in mine)
        dq = sorted((dist(G.S[by], G.S[w]), w) for w in units_of(G, prey))
        Q.add('the victim is the prey of the best pair at the start', col, v == wb)
        Q.add('the catcher is the unit of the best pair', col, by == ub)
        Q.add('the victim is the prey that started nearest to the catcher', col, dq[0][1] == v)
        Q.add('the catcher is our unit that started nearest to the victim', col, dv[0][1] == by)
        L.push('start distance catcher to victim (%s)' % col, dist(G.S[by], G.S[v]))
        held = netted(G, v, t)
        Q.add('victim held by a net at the catch', col, held)
        Q.add('victim free, its dash on cooldown', col, not held and not dash_ready(G, v, t))
        Q.add('victim free, its dash ready', col, not held and dash_ready(G, v, t))
        Q.add('catcher dashes on the catch turn', col, by in G.T[t].dash)
        nd = sum(1 for d in G.dash_turns[by] if d <= t)
        Q.add('catcher dashed on turn 1', col, 1 in G.dash_turns[by])
        L.push('dashes of the catcher up to the catch (%s)' % col, nd)
        near = sum(1 for u in mine if alive(G, u, t) and pos(G, t, u) and pos(G, t, v) and dist(pos(G, t, u), pos(G, t, v)) < 1500)
        Q.add('two or more of our units within 1500 of the victim at the catch', col, near >= 2)
        Q.add('victim dashed on its own turn 1', col, 1 in G.dash_turns[v])
        if held:
            nt = max(n for n in G.net_hits[v] if n < t)
            thrower = [n for n in G.T[nt].nets if v in n['units']]
            n0 = thrower[0]
            L.push('held victims: turns from the net to the catch (%s)' % col, t - nt)
            L.push('held victims: turn of that net (%s)' % col, nt)
            Q.add('held victims: the net was ours', col, n0['owner'] == s)
            if n0['owner'] == s:
                Q.add('held victims: the catcher threw the net itself', col, n0['u'] == by)
                q1 = pos(G, nt + 1, v) or n0['land']
                L.push('held victims: thrower to victim when the net lands (%s)' % col, dist(n0['from'], n0['land']))
                pb = pos(G, nt + 1, by)
                if pb: L.push('held victims: catcher to victim when the net lands (%s)' % col, dist(pb, n0['land']))
                Q.add('held victims: the victim could dash when netted', col, dash_ready(G, v, nt))
                Q.add('held victims: the thrower dashed on the net turn', col, n0['u'] in G.T[nt].dash)
    print('games used: %s; with a first catch by turn %d: %s; start unknown: %d' % (dict((k, v) for k, v in ng.items() if k != 'start unknown'), EARLY, dict(early_n), ng['start unknown']))
    T.show(); C.show(); Q.show(); L.show('Distributions')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--name'); ap.add_argument('--agent', type=int, action='append'); ap.add_argument('--sizes', type=int, nargs='*', default=[3, 4])
    ap.add_argument('dirs', nargs='+')
    a = ap.parse_args()
    measure(load_games(a.dirs, a.name, a.agent), set(a.sizes))
