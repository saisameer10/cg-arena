# usage: python fieldtab.py <field_*.jsonl ...>
# Table of fieldrun.js: per version, over the same games (same opponents, seats and seeds for every version):
# mean rank, first place, catches, units lost, and the first catch (ours first in the game, turn, by turn 5 / 15).
import json, sys, glob, collections
rows = []
for pat in sys.argv[1:]:
    for fn in glob.glob(pat):
        for l in open(fn, encoding='utf-8'):
            if l.strip(): rows.append(json.loads(l))
bad = [r for r in rows if r.get('error') or r.get('dq')]
rows = [r for r in rows if not (r.get('error') or r.get('dq'))]
S = collections.defaultdict(lambda: collections.defaultdict(float)); T = collections.defaultdict(list)
for r in rows:
    x, s = r['x'], r['seat']; a = S[x]; fc = r['firstCatch']
    a['n'] += 1; a['rank'] += r['ranks'][s]; a['win'] += r['ranks'][s] == 1; a['c'] += r['scores'][s]; a['l'] += r['lost'][s]
    mine = fc[s]; others = [t for i, t in enumerate(fc) if i != s and t is not None]
    if mine is not None:
        T[x].append(mine); a['by5'] += mine <= 5; a['by15'] += mine <= 15
        a['first'] += (not others) or mine < min(others); a['firsttie'] += bool(others) and mine == min(others)
    else: a['none'] += 1
print('games %d (left out: %d with a timeout or an error)' % (len(rows), len(bad)))
print('%-16s %5s %6s %6s %8s %6s | %11s %7s %7s %8s %6s' % ('version', 'games', 'rank', 'first%', 'catches', 'lost', '1st catch%', 'median', 'by 5', 'by 15', 'none'))
for x in sorted(S, key=lambda k: S[k]['rank'] / S[k]['n']):
    a = S[x]; n = a['n']; t = sorted(T[x])
    print('%-16s %5d %6.2f %5.0f%% %8.2f %6.2f | %10.0f%% %7s %6.0f%% %7.0f%% %5.0f%%' % (x.replace('vlive_41748059', 'live'), n, a['rank'] / n, 100 * a['win'] / n, a['c'] / n, a['l'] / n,
          100 * (a['first'] + 0.5 * a['firsttie']) / n, t[len(t) // 2] if t else '-', 100 * a['by5'] / n, 100 * a['by15'] / n, 100 * a['none'] / n))
