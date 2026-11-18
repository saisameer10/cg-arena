# Every version with real arena games, by team size, and what each hybrid would be expected to score.
import json, collections, os

def load(sub):
    fn = 'rows_%s.json' % sub
    return json.load(open(fn)) if os.path.exists(fn) else []
runs = {'v10 (run of 11:36-15:41)': load('41743202'), 'mimic A (15:41-16:02)': load('41746943'), 'hybrid4 (16:02-16:44)': load('41747326'), 'LIVE personal code (16:44-)': load('41748059'), 'v5 (11:03-11:36)': load('41742767')}
def line(name, q):
    n = len(q)
    if not n: print('%-34s no games' % name); return
    f = lambda k: sum(x[k] for x in q) / n
    c15 = sum(1 for x in q if any(t <= 15 for t in x['ct'])) / n
    print('%-34s n %3d  %2d/%2d/%2d  rank %.2f  catches %.2f  catch by t15 in %2d%%  lost %.2f' % (name, n, sum(x['rank'] == 1 for x in q), sum(x['rank'] == 2 for x in q), sum(x['rank'] == 3 for x in q), f('rank'), f('catches'), round(100 * c15), f('lost')))
print('== whole runs')
for k, q in runs.items(): line(k, q)
hyb = runs['hybrid4 (16:02-16:44)']
pools = collections.OrderedDict()
pools['v10 code, morning run'] = runs['v10 (run of 11:36-15:41)']
pools['v10 code, inside the hybrid (afternoon)'] = [r for r in hyb if r['N'] != 4]
pools['mimic A, all its real games'] = runs['mimic A (15:41-16:02)'] + [r for r in hyb if r['N'] == 4]
pools['LIVE personal code'] = runs['LIVE personal code (16:44-)']
print('\n== mean rank by units per team (games)')
tab = {}
for k, q in pools.items():
    by = collections.defaultdict(list)
    for r in q: by[r['N']].append(r['rank'])
    tab[k] = {n: (sum(v) / len(v), len(v)) for n, v in by.items()}
    print('%-42s' % k + ' | '.join('%d: %s' % (n, ('%.2f (%d)' % tab[k][n]) if n in tab[k] else '   -    ') for n in (3, 4, 5, 6)) + ' | all %.2f (%d)' % (sum(r['rank'] for r in q) / max(1, len(q)), len(q)))
# how often each size occurs (all afternoon games)
allg = hyb + runs['LIVE personal code (16:44-)'] + runs['mimic A (15:41-16:02)']
freq = collections.Counter(r['N'] for r in allg); tot = sum(freq.values())
print('\nshare of games by team size (afternoon, %d games): ' % tot + ', '.join('%d units %d%%' % (n, round(100 * freq[n] / tot)) for n in (3, 4, 5, 6)))
V = tab['v10 code, inside the hybrid (afternoon)']; V4 = tab['v10 code, morning run'].get(4, (2.42, 0)); M = tab['mimic A, all its real games']; L = tab['LIVE personal code']
def exp(choice):
    s = 0
    for n in (3, 4, 5, 6):
        src = choice[n]
        val = {'v': V.get(n, V4) if n != 4 else V4, 'm': M.get(n), 'l': L.get(n)}[src]
        if val is None: return None
        s += freq[n] / tot * val[0]
    return s
print('\n== expected mean rank of each choice, from the by-size figures above (v10 at 4 units: its morning 4-unit figure)')
for name, ch in (('v10 everywhere', dict.fromkeys((3, 4, 5, 6), 'v')), ('hybrid4 (mimic at 4)', {3: 'v', 4: 'm', 5: 'v', 6: 'v'}), ('vhybrid45 (mimic at 4, 5)', {3: 'v', 4: 'm', 5: 'm', 6: 'v'}), ('vhybrid345 (mimic at 3, 4, 5)', {3: 'm', 4: 'm', 5: 'm', 6: 'v'}), ('mimic A everywhere', dict.fromkeys((3, 4, 5, 6), 'm')), ('LIVE personal code everywhere', dict.fromkeys((3, 4, 5, 6), 'l')), ('live code + mimic at 4', {3: 'l', 4: 'm', 5: 'l', 6: 'l'})):
    e = exp(ch)
    print('   %-34s %s' % (name, '%.2f' % e if e else 'not enough games'))
