# usage: python hybpairs.py <rows_live.json> name=dir [name=dir ...]
# The live hybrid's arena result against replays of the same battles by other bots, split into four-unit battles
# (hybrid = mimic copy A) and the others (hybrid = v10).
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seatstats import summ

rows = {r['id']: r for r in json.load(open(sys.argv[1]))}
def stats(q, key):
    n = len(q)
    r = [key(x) for x in q]
    return 'n %2d  %d/%d/%d  rank %.2f  catches %.2f  lost %.2f' % (n, sum(x['rank'] == 1 for x in r), sum(x['rank'] == 2 for x in r), sum(x['rank'] == 3 for x in r), sum(x['rank'] for x in r) / n, sum(x['catches'] for x in r) / n, sum(x['lost'] for x in r) / n)
for spec in sys.argv[2:]:
    name, d = spec.split('=')
    pairs = []
    for fn in sorted(os.listdir(d)) if os.path.isdir(d) else []:
        if not fn.endswith('.json'): continue
        gid = int(fn.split('.')[0])
        if gid not in rows: continue
        try: g = json.load(open(os.path.join(d, fn), encoding='utf-8'))
        except ValueError: continue
        if 'log' not in g: continue
        seat = [a['index'] for a in g['log']['agents'] if a.get('me')][0]
        pairs.append((rows[gid], summ(os.path.join(d, fn), seat)))
    print('== %s: %d battles replayed' % (name, len(pairs)))
    for lab, cond in (('four-unit battles (live = mimic A)', lambda a: a['N'] == 4), ('other sizes (live = v10)', lambda a: a['N'] != 4), ('all', lambda a: True)):
        q = [p for p in pairs if cond(p[0])]
        if not q: continue
        print('   %-36s live:  %s' % (lab, stats(q, lambda p: p[0])))
        print('   %-36s %-5s: %s   | %s above live in %d, below in %d, same in %d' % ('', name[:5], stats(q, lambda p: p[1]), name, sum(p[1]['rank'] < p[0]['rank'] for p in q), sum(p[1]['rank'] > p[0]['rank'] for p in q), sum(p[1]['rank'] == p[0]['rank'] for p in q)))
