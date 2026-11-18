# usage: python multicmp.py <rows_SUB.json> <arena-label> <label=replay-dir> [<label=replay-dir> ...]
# Several versions on the same arena battles: the arena result of the live submission (rows_SUB.json from arena.py)
# and one replay folder per other version (rerun.sh). Prints one table over the battles that every version has,
# who ranked above whom, the same split by units per team, and composites "A in sizes S, B elsewhere".
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seatstats import summ

rows = {r['id']: r for r in json.load(open(sys.argv[1]))}
base = sys.argv[2]
ver = [a.split('=', 1) for a in sys.argv[3:]]
data = {base: {}}
for gid, r in rows.items():
    data[base][gid] = {'rank': r['rank'], 'catches': r['catches'], 'lost': r['lost'], 'turns': r['ct'], 'N': r['N']}
for lab, d in ver:
    data[lab] = {}
    for fn in os.listdir(d):
        if not fn.endswith('.json'): continue
        try: gid = int(fn.split('.')[0]); g = json.load(open(os.path.join(d, fn), encoding='utf-8'))
        except ValueError: continue
        if 'log' not in g or gid not in rows: continue
        seat = [a['index'] for a in g['log']['agents'] if a.get('me')][0]
        s = summ(os.path.join(d, fn), seat)
        data[lab][gid] = {'rank': s['rank'], 'catches': s['catches'], 'lost': s['lost'], 'turns': s['turns'], 'N': rows[gid]['N']}
labs = [base] + [l for l, _ in ver]
common = sorted(set.intersection(*[set(data[l]) for l in labs]))


def line(name, q):
    n = len(q)
    if not n: return
    print('  %-26s %2d  %2d / %2d / %2d   %.2f   %.2f   %.2f   %.2f' % (
        name, n, sum(x['rank'] == 1 for x in q), sum(x['rank'] == 2 for x in q), sum(x['rank'] == 3 for x in q),
        sum(x['rank'] for x in q) / n, sum(x['catches'] for x in q) / n,
        sum(sum(1 for t in x['turns'] if t <= 10) for x in q) / n, sum(x['lost'] for x in q) / n))


print('battles that every version played:', len(common))
print('  %-26s %2s  %-13s %-6s %-6s %-6s %-6s' % ('version', 'n', '1st/2nd/3rd', 'rank', 'catch', 'by10', 'lost'))
for l in labs: line(l + (' (arena)' if l == base else ''), [data[l][g] for g in common])
print('who ranked above whom (row above column, on those battles):')
for a in labs:
    print('  %-12s' % a + ''.join('  %s %d-%d' % (b, sum(data[a][g]['rank'] < data[b][g]['rank'] for g in common), sum(data[a][g]['rank'] > data[b][g]['rank'] for g in common)) for b in labs if b != a))
print('by units per team:')
for N in sorted(set(rows[g]['N'] for g in common)):
    gs = [g for g in common if rows[g]['N'] == N]
    print(' %d units, %d battles:' % (N, len(gs)) + ''.join('  %s %.2f (lost %.1f)' % (l, sum(data[l][g]['rank'] for g in gs) / len(gs), sum(data[l][g]['lost'] for g in gs) / len(gs)) for l in labs))
if len(labs) >= 2:
    other = labs[1]
    print('composites (%s in the listed sizes, %s elsewhere):' % (base, other))
    for sizes in ([4], [4, 5], [3, 4, 5]):
        q = [data[base][g] if rows[g]['N'] in sizes else data[other][g] for g in common]
        line('%s in %s' % (base, sizes), q)
