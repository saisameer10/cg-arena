# Observational sizing on real games: mean rank by catches, by "catch by turn 15", by unconverted net hits.
import json, os, collections
from peerprofile import seatstats
def load():
    idx = json.load(open('peer_index.json')); peers = []
    for gid, agent in idx.items():
        fn = 'games/%s.json' % gid
        if not os.path.exists(fn): continue
        g = json.load(open(fn)); s = [a['index'] for a in g['agents'] if a.get('agent_id') == agent]
        if s: peers.append(seatstats(g, s[0]))
    ours = []
    for sub in ('41748059', '41749025'):
        for b in json.load(open('E:/cg-tmp/tcf/gold/battles_%s.json' % sub)):
            fn = 'E:/cg-tmp/tcf/gold/games/%s.json' % b['game_id']
            if not b.get('done') or not os.path.exists(fn): continue
            g = json.load(open(fn)); me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
            if not me or any((a.get('rank') or 999) <= 100 for a in g['agents'] if a['index'] != me[0]['index']): continue
            ours.append(seatstats(g, me[0]['index']))
    return peers, ours
def mr(q): return (sum(r['rank'] for r in q) / len(q)) if q else float('nan')
peers, ours = load()
for name, rows in (('teams at 23', peers), ('us', ours)):
    n = len(rows); print('\n%s: %d games, mean rank %.2f' % (name, n, mr(rows)))
    a = [r for r in rows if r['c15']]; b = [r for r in rows if not r['c15']]
    print('  a catch by turn 15: %d games (%.0f%%), mean rank %.2f | none: %d games, mean rank %.2f' % (len(a), 100 * len(a) / n, mr(a), len(b), mr(b)))
    for k in range(0, 6):
        q = [r for r in rows if (r['catch'] == k if k < 5 else r['catch'] >= 5)]
        if q: print('  catches %s: %3d games, mean rank %.2f' % (k if k < 5 else '5+', len(q), mr(q)))
    # slope of rank on catches (least squares), also with units lost held in the model
    import statistics as st
    x = [r['catch'] for r in rows]; y = [r['rank'] for r in rows]; l = [r['lost'] for r in rows]
    mx, my = st.mean(x), st.mean(y)
    print('  one more catch goes with %.2f of mean rank (simple slope)' % (sum((a - mx) * (b - my) for a, b in zip(x, y)) / sum((a - mx) ** 2 for a in x)))
    un = [r['hit'] - r['cnet'] for r in rows]
    print('  net hits on prey %.2f per game, of which not caught within 5 turns %.2f per game' % (st.mean(r['hit'] for r in rows), st.mean(un)))
    for k in (0, 1, 2):
        q = [r for r in rows if (r['hit'] - r['cnet'] == k if k < 2 else r['hit'] - r['cnet'] >= 2)]
        if q: print('    unconverted hits %s: %3d games, mean rank %.2f, catches %.2f' % (k if k < 2 else '2+', len(q), mr(q), st.mean(r['catch'] for r in q)))
    # games with no catch by 15: how they end
    print('  games with no catch by turn 15: first %.0f%%, last %.0f%%, final catches %.2f' % (100 * sum(r['win'] for r in b) / len(b), 100 * sum(r['lastp'] for r in b) / len(b), st.mean(r['catch'] for r in b)))
