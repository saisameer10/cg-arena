# Early nets by the distance to the AIM point (a net stops at the first thing it meets, so the landing distance is biased).
import json, os, re, math, collections
def nets(g, seat):
    prey = (seat + 1) % 3; pred = (seat + 2) % 3
    t = 0; last = -1; rows = []; catches = []
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1
        last = a
        for s in (f.get('summary') or '').split('\n'):
            m = re.match(r"\$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\) throws a net at \((-?\d+), (-?\d+)\)(?: \(aimed at \((-?\d+), (-?\d+)\)\))?(.*)", s)
            if m and int(m.group(1)) == seat:
                tail = m.group(9)
                ax, ay = (int(m.group(7)), int(m.group(8))) if m.group(7) else (int(m.group(5)), int(m.group(6)))
                rows.append({'t': t, 'd': math.hypot(ax - int(m.group(3)), ay - int(m.group(4))), 'prey': re.findall(r"\$%d's agent (\d+)" % prey, tail),
                             'pred': re.findall(r"\$%d's agent (\d+)" % pred, tail), 'why': re.sub(r"\$\d's agent \d+", 'X', tail).strip()})
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m and int(m.group(1)) == seat: catches.append((t, m.group(4)))
    for r in rows: r['conv'] = any(v in r['prey'] and 0 <= tc - r['t'] <= 5 for tc, v in catches)
    return rows
def show(name, games):
    n = len(games); print('\n%s (%d games)' % (name, n))
    for T in ((1, 1), (2, 3), (4, 10), (11, 100)):
        print(' turns %d-%d' % T)
        for lo, hi in ((0, 700), (700, 1000), (1000, 1300), (1300, 1600), (1600, 2050), (2050, 99999)):
            z = [r for g in games for r in g if T[0] <= r['t'] <= T[1] and lo <= r['d'] < hi]
            if z: print('   aim %4d-%5d: %4d nets (%.2f per game), hit prey %3.0f%%, hit predator %3.0f%%, became a catch %3.0f%% of nets' % (
                lo, hi, len(z), len(z) / n, 100 * sum(1 for r in z if r['prey']) / len(z), 100 * sum(1 for r in z if r['pred'] and not r['prey']) / len(z), 100 * sum(1 for r in z if r['conv']) / len(z)))
    c = collections.Counter(r['why'] for g in games for r in g if r['t'] <= 3)
    print(' outcomes of nets in turns 1-3:', c.most_common(8))
idx = json.load(open('peer_index.json')); peers = []
for gid, agent in idx.items():
    fn = 'games/%s.json' % gid
    if not os.path.exists(fn): continue
    g = json.load(open(fn)); s = [a['index'] for a in g['agents'] if a.get('agent_id') == agent]
    if s: peers.append(nets(g, s[0]))
ours = []
for sub in ('41748059', '41749025'):
    for b in json.load(open('E:/cg-tmp/tcf/gold/battles_%s.json' % sub)):
        fn = 'E:/cg-tmp/tcf/gold/games/%s.json' % b['game_id']
        if not b.get('done') or not os.path.exists(fn): continue
        g = json.load(open(fn)); me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
        if not me or any((a.get('rank') or 999) <= 100 for a in g['agents'] if a['index'] != me[0]['index']): continue
        ours.append(nets(g, me[0]['index']))
show('teams rated about 23', peers); show('us (live code)', ours)
