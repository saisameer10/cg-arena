# usage: python pfall.py <reference bot> <dir> [<dir> ...]
# Pools every paired game of pairfield.py over several folders (the same battle id = the same map and the same two real
# opponents, we are in seat 0). Per bot: all its games, and its games on the battles it shares with the reference bot
# (mean rank of both there, the difference, and in how many battles it placed better / equal / worse).
import json, glob, os, sys, re, collections
ref = sys.argv[1]; R = collections.defaultdict(dict)
ALIAS = {'live': 'vlive (old live)', 'ring': 'vlive_ring', 'combo': 'vlive_combo', 'combo_ring': 'vlive_combo_ring'}
for d in sys.argv[2:]:
    for fn in glob.glob(d + '/*.json'):
        name, gid = os.path.basename(fn)[:-5].rsplit('_', 1)
        try: j = json.load(open(fn))
        except ValueError: continue
        if 'log' not in j: continue
        lg = j['log']; c = l = 0
        for f in lg['frames']:
            for s in (f.get('summary') or '').split('\n'):
                if re.match(r"\$0's agent \d+ catches", s): c += 1
                if re.search(r"catches \$0's agent", s): l += 1
        R[gid][ALIAS.get(name, name)] = (lg['ranking'].index(0) + 1, c, l)
ref = ALIAS.get(ref, ref)
names = sorted({n for g in R.values() for n in g})
rows = []
for n in names:
    q = [R[g][n] for g in R if n in R[g]]; k = len(q)
    sh = [g for g in R if n in R[g] and ref in R[g]]
    a = sum(R[g][n][0] for g in sh) / max(1, len(sh)); b = sum(R[g][ref][0] for g in sh) / max(1, len(sh))
    w = sum(R[g][n][0] < R[g][ref][0] for g in sh); e = sum(R[g][n][0] == R[g][ref][0] for g in sh)
    rows.append((sum(x[0] for x in q) / k, n, k, sum(x[0] == 1 for x in q), sum(x[0] == 2 for x in q), sum(x[0] == 3 for x in q),
                 sum(x[1] for x in q) / k, sum(x[2] for x in q) / k, len(sh), a, b, w, e, len(sh) - w - e))
print('battles:', len(R), '| reference:', ref)
print('%-18s %5s %9s %-10s %7s %5s | %6s %5s %5s %6s %s' % ('bot', 'games', 'mean rank', '1st/2nd/3rd', 'catches', 'lost', 'shared', 'bot', 'ref', 'diff', 'better/equal/worse'))
for r in sorted(rows):
    print('%-18s %5d %9.2f %-10s %7.2f %5.2f | %6d %5.2f %5.2f %+6.2f %d/%d/%d' % (r[1], r[2], r[0], '%d/%d/%d' % r[3:6], r[6], r[7], r[8], r[9], r[10], r[9] - r[10], r[11], r[12], r[13]))
