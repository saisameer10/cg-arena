# usage: python rrstats.py <dir> <name-of-A> <name-of-B> [<name-of-C>] -- <order> [<order> ...]
# Totals of a round robin made with mkversus.py and seedbatch.sh: games are <dir>/<order>_N.json and <order>
# says which version sat in seats 0, 1, 2 (e.g. ABC, BCA, CAB). One line per version.
import sys, os, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seatstats import summ

d = sys.argv[1]; sep = sys.argv.index('--'); names = sys.argv[2:sep]; orders = sys.argv[sep + 1:]
rows = {chr(65 + i): [] for i in range(len(names))}
duel = {}
for o in orders:
    for fn in sorted(glob.glob(os.path.join(d, o + '_*.json'))):
        rs = [summ(fn, s) for s in range(len(o))]
        if not rs[0]:
            print('skipped (no log):', fn); continue
        for s, v in enumerate(o):
            rows[v].append(rs[s])
        for s, v in enumerate(o):                      # seat s hunts seat s+1
            w = o[(s + 1) % len(o)] if len(o) == 3 else None
            if w:
                k = (v, w); a = duel.setdefault(k, [0, 0]); a[0] += rs[s]['catches']; a[1] += 1
for i, nm in enumerate(names):
    q = rows[chr(65 + i)]; n = len(q)
    if not n: continue
    by = lambda lim: sum(sum(1 for t in r['turns'] if t <= lim) for r in q) / n
    print('%-6s games %d  wins %d  second %d  last %d  mean rank %.2f  catches %.2f  lost %.2f  catches by turn 10: %.2f, by 20: %.2f' % (
        nm, n, sum(r['rank'] == 1 for r in q), sum(r['rank'] == 2 for r in q), sum(r['rank'] == 3 for r in q),
        sum(r['rank'] for r in q) / n, sum(r['catches'] for r in q) / n, sum(r['lost'] for r in q) / n, by(10), by(20)))
for (v, w), (c, n) in sorted(duel.items()):
    print('   %s hunting %s: %.2f catches per game (%d games)' % (names[ord(v) - 65], names[ord(w) - 65], c / n, n))
