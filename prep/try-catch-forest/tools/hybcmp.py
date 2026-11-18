# usage: python hybcmp.py <rows_of_live_version.json> <dir-with-v10-replays-of-those-battles>
# Per team size: the live version's arena result against v10's replay of the same battle, and the composite
# "hybrid" (live version in the chosen sizes, v10 in the others).
import json, sys, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seatstats import summ

rows = {r['id']: r for r in json.load(open(sys.argv[1]))}
pairs = []
for fn in sorted(os.listdir(sys.argv[2])):
    if not fn.endswith('.json'): continue
    gid = int(fn.split('.')[0])
    if gid not in rows: continue
    try: d = json.load(open(os.path.join(sys.argv[2], fn), encoding='utf-8'))
    except ValueError: continue
    if 'log' not in d: continue
    seat = [a['index'] for a in d['log']['agents'] if a.get('me')][0]
    b = summ(os.path.join(sys.argv[2], fn), seat); a = rows[gid]
    pairs.append((a['N'], a, b))
def line(name, q, key):
    n = len(q)
    if not n: return
    r = [key(x) for x in q]
    print('  %-28s n %2d  first %d second %d last %d  mean rank %.2f  catches %.2f  lost %.2f' % (name, n, sum(x['rank'] == 1 for x in r), sum(x['rank'] == 2 for x in r), sum(x['rank'] == 3 for x in r), sum(x['rank'] for x in r) / n, sum(x['catches'] for x in r) / n, sum(x['lost'] for x in r) / n))
print('battles with both results:', len(pairs), '| all arena games of the live version:', len(rows))
for N in sorted(set(p[0] for p in pairs)):
    q = [p for p in pairs if p[0] == N]
    print('%d units per team:' % N)
    line('live version (arena)', q, lambda p: p[1]); line('v10 (replay)', q, lambda p: p[2])
    print('    live version ranked above v10 in %d, below in %d, same in %d' % (sum(p[1]['rank'] < p[2]['rank'] for p in q), sum(p[1]['rank'] > p[2]['rank'] for p in q), sum(p[1]['rank'] == p[2]['rank'] for p in q)))
print('all sizes:')
line('live version (arena)', pairs, lambda p: p[1]); line('v10 (replay)', pairs, lambda p: p[2])
for sizes in ((4,), (4, 5), (3, 4, 5)):
    line('hybrid: live in %s' % (sizes,), pairs, lambda p: p[1] if p[0] in sizes else p[2])
by = collections.defaultdict(list)
for r in rows.values(): by[r['N']].append(r['rank'])
print('live version, all its arena games by team size:', {k: (len(v), round(sum(v) / len(v), 2)) for k, v in sorted(by.items())})
