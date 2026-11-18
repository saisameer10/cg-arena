# The first ten turns: how the early catches are made (net or not, dash or walk), by teams at 23 and by us.
import json, os, re, collections, statistics as st
from behind15 import load  # noqa: only for the file lists; rows are rebuilt here


def row(g, seat):
    prey = (seat + 1) % 3
    t = 0; last = -1; c = collections.Counter(); N = 0; netted = {}; dashed = set(); first = None; gamefirst = None
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1; dashed = set()
        last = a
        if t > 15: break
        if a == seat:
            cm = [x.split() for x in (f.get('stdout') or '').split(';') if x.split()]
            if t == 1:
                N = len(set(x[1] for x in cm if x[0] in ('MOVE', 'DASH', 'WAIT') and len(x) > 1))
                c['t1dash'] = sum(1 for x in cm if x[0] == 'DASH'); c['t1net'] = sum(1 for x in cm if x[0] == 'NET'); c['t1smoke'] = sum(1 for x in cm if x[0] == 'SMOKE')
            if t <= 5: c['d5'] += sum(1 for x in cm if x[0] == 'DASH'); c['n5'] += sum(1 for x in cm if x[0] == 'NET'); c['s5'] += sum(1 for x in cm if x[0] == 'SMOKE')
        lines = (f.get('summary') or '').split('\n')
        for s in lines:
            m = re.match(r"\$%d's agent (\d+) dashes" % seat, s)
            if m: dashed.add(m.group(1))
        for s in lines:
            m = re.match(r"\$(\d)'s agent (\d+) at .* throws a net", s)
            if m:
                tail = s.split(' nets ', 1)[1] if ' nets ' in s else ''
                for o, x in re.findall(r"\$(\d)'s agent (\d+)", tail):
                    if int(o) == prey: netted[x] = (t, int(m.group(1)))
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m:
                if gamefirst is None: gamefirst = int(m.group(1))
                if int(m.group(1)) == seat and t <= 10:
                    if first is None: first = t
                    v = m.group(4); held = v in netted and t - netted[v][0] <= 5
                    how = ('own net' if netted[v][1] == seat else 'other team\'s net') if held else 'free prey'
                    c[how + (', dash' if m.group(2) in dashed else ', walk')] += 1; c['c10'] += 1
                    if t <= 5: c['c5'] += 1
    c['N'] = N; c['rank'] = g['ranking'].index(seat) + 1; c['first'] = first or 99; c['gf'] = gamefirst == seat
    return c


def collect():
    peers = []; ours = []
    idx = json.load(open('E:/cg-tmp/tcf/peer/peer_index.json'))
    for gid, agent in idx.items():
        fn = 'E:/cg-tmp/tcf/peer/games/%s.json' % gid
        if not os.path.exists(fn): continue
        g = json.load(open(fn)); s = [a['index'] for a in g['agents'] if a.get('agent_id') == agent]
        if s: peers.append(row(g, s[0]))
    for sub in ('41748059', '41749025'):
        for b in json.load(open('E:/cg-tmp/tcf/gold/battles_%s.json' % sub)):
            fn = 'E:/cg-tmp/tcf/gold/games/%s.json' % b['game_id']
            if not b.get('done') or not os.path.exists(fn): continue
            g = json.load(open(fn)); me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
            if not me or any((a.get('rank') or 999) <= 100 for a in g['agents'] if a['index'] != me[0]['index']): continue
            ours.append(row(g, me[0]['index']))
    return peers, ours


KEYS = ['own net, dash', 'own net, walk', 'free prey, dash', 'free prey, walk', "other team's net, dash", "other team's net, walk"]
if __name__ == '__main__':
    peers, ours = collect()
    for name, rows in (('teams at 23', peers), ('us', ours)):
        n = len(rows); print('\n== %s (%d games)' % (name, n))
        print(' first catch of ours by turn 3 / 5 / 8 / 10: %.0f%% / %.0f%% / %.0f%% / %.0f%% of games; first catch of the game is ours %.0f%%' % tuple(
            [100 * sum(r['first'] <= k for r in rows) / n for k in (3, 5, 8, 10)] + [100 * sum(r['gf'] for r in rows) / n]))
        print(' catches by turn 10: %.2f a game, made as: ' % (sum(r['c10'] for r in rows) / n) + '; '.join('%s %.2f' % (k, sum(r[k] for r in rows) / n) for k in KEYS))
        U = sum(r['N'] for r in rows)
        print(' turn 1 per unit: dash %.2f, net %.2f, smoke %.2f | turns 1-5 per unit: dash %.2f, net %.2f, smoke %.2f' % (
            sum(r['t1dash'] for r in rows) / U, sum(r['t1net'] for r in rows) / U, sum(r['t1smoke'] for r in rows) / U, sum(r['d5'] for r in rows) / U, sum(r['n5'] for r in rows) / U, sum(r['s5'] for r in rows) / U))
        for N in (3, 4, 5, 6):
            z = [r for r in rows if r['N'] == N]
            if z: print('   %d units (%2d games): catch by turn 5 in %.0f%%, by 10 in %.0f%%; catches by 10: %.2f = %s' % (N, len(z), 100 * sum(r['first'] <= 5 for r in z) / len(z),
                100 * sum(r['first'] <= 10 for r in z) / len(z), sum(r['c10'] for r in z) / len(z), ', '.join('%s %.2f' % (k, sum(r[k] for r in z) / len(z)) for k in KEYS[:4])))
        for lab, f in (('a catch by turn 5', lambda r: r['first'] <= 5), ('first catch in turns 6-10', lambda r: 5 < r['first'] <= 10), ('none by turn 10', lambda r: r['first'] > 10)):
            z = [r for r in rows if f(r)]
            print('   %-26s %3d games (%2.0f%%): first %.0f%%, mean rank %.2f' % (lab, len(z), 100 * len(z) / n, 100 * sum(r['rank'] == 1 for r in z) / len(z), sum(r['rank'] for r in z) / len(z)))
