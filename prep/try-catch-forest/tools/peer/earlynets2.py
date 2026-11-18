import json, os, collections
from earlynets import nets
idx = json.load(open('peer_index.json'))
peers = []
for gid, agent in idx.items():
    fn = 'games/%s.json' % gid
    if not os.path.exists(fn): continue
    g = json.load(open(fn)); s = [a['index'] for a in g['agents'] if a.get('agent_id') == agent]
    if s: peers.append((agent, g['ranking'].index(s[0]) + 1, nets(g, s[0])))
n = len(peers)
for T in ((1, 1), (2, 2), (3, 3)):
    print('turn', T[0])
    for lo, hi in ((0, 700), (700, 1000), (1000, 1250), (1250, 1500), (1500, 1800), (1800, 2100)):
        z = [r for a, rk, g in peers for r in g if T[0] <= r['t'] <= T[1] and lo <= r['d'] < hi]
        if z: print('  range %4d-%4d: %3d nets (%.2f per game), hit prey %3.0f%%, hit predator %3.0f%%, caught within 5 turns %3.0f%% of nets' % (
            lo, hi, len(z), len(z) / n, 100 * sum(1 for r in z if r['prey']) / len(z), 100 * sum(1 for r in z if r['pred'] and not r['prey']) / len(z), 100 * sum(1 for r in z if r['conv']) / len(z)))
# per team: share of games with a turn-1 net, and mean rank
by = collections.defaultdict(list)
for a, rk, g in peers: by[a].append((rk, sum(1 for r in g if r['t'] == 1), sum(1 for r in g if r['t'] <= 3 and r['d'] < 1500)))
print('teams', len(by))
hi = [v for v in by.values() if sum(x[1] for x in v) / len(v) >= 0.8]; lo = [v for v in by.values() if sum(x[1] for x in v) / len(v) < 0.3]
for name, grp in (('teams with 0.8 or more turn-1 nets per game', hi), ('teams with under 0.3', lo)):
    q = [x for v in grp for x in v]
    if q: print('%s: %d teams, %d games, mean rank %.2f' % (name, len(grp), len(q), sum(x[0] for x in q) / len(q)))
g1 = [x for v in by.values() for x in v]
a = [x for x in g1 if x[2] > 0]; b = [x for x in g1 if x[2] == 0]
print('games with a net inside 1500 in turns 1-3: %d, mean rank %.2f; without: %d, mean rank %.2f' % (len(a), sum(x[0] for x in a) / len(a), len(b), sum(x[0] for x in b) / len(b)))
