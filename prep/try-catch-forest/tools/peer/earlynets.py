# Early nets (turn by turn) of the teams rated about 23 against ours: how many, at what range, what they hit, what follows.
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
            m = re.match(r"\$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\) throws a net at \((-?\d+), (-?\d+)\)", s)
            if m and int(m.group(1)) == seat:
                tail = s.split(' nets ', 1)[1] if ' nets ' in s else ''
                hp = re.findall(r"\$%d's agent (\d+)" % prey, tail)
                hd = re.findall(r"\$%d's agent (\d+)" % pred, tail)
                d = math.hypot(int(m.group(5)) - int(m.group(3)), int(m.group(6)) - int(m.group(4)))
                rows.append({'t': t, 'd': d, 'prey': hp, 'pred': hd})
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m and int(m.group(1)) == seat: catches.append((t, m.group(4)))
    for r in rows:
        r['conv'] = any(v in r['prey'] and 0 <= tc - r['t'] <= 5 for tc, v in catches)
    return rows


def show(name, games):
    n = len(games)
    print('\n%s (%d games)' % (name, n))
    print('  turns    nets/game  hit prey  hit predator  missed  prey hits caught  mean range  catches/game from these nets')
    for lo, hi in ((1, 1), (2, 3), (4, 6), (7, 10), (11, 20), (21, 100)):
        q = [r for g in games for r in g if lo <= r['t'] <= hi]
        if not q: continue
        hp = sum(1 for r in q if r['prey']); hd = sum(1 for r in q if r['pred'] and not r['prey'])
        print('  %3d-%-3d  %8.2f  %7.0f%%  %11.0f%%  %5.0f%%  %15.0f%%  %10.0f  %8.2f' % (
            lo, hi, len(q) / n, 100 * hp / len(q), 100 * hd / len(q), 100 * (len(q) - hp - hd) / len(q),
            100 * sum(1 for r in q if r['conv']) / max(1, hp), sum(r['d'] for r in q) / len(q), sum(1 for r in q if r['conv']) / n))
    q = [r for g in games for r in g if r['t'] <= 3]
    for lo, hi in ((0, 1000), (1000, 1500), (1500, 2100)):
        z = [r for r in q if lo <= r['d'] < hi]
        if z: print('  turns 1-3, range %4d-%4d: %.2f per game, hit prey %.0f%%, hit predator %.0f%%' % (lo, hi, len(z) / n, 100 * sum(1 for r in z if r['prey']) / len(z), 100 * sum(1 for r in z if r['pred'] and not r['prey']) / len(z)))


if __name__ == '__main__':
    idx = json.load(open('E:/cg-tmp/tcf/peer/peer_index.json'))
    peers = []
    for gid, agent in idx.items():
        fn = 'E:/cg-tmp/tcf/peer/games/%s.json' % gid
        if not os.path.exists(fn): continue
        g = json.load(open(fn)); s = [a['index'] for a in g['agents'] if a.get('agent_id') == agent]
        if s: peers.append(nets(g, s[0]))
    ours = []
    for sub in ('41748059', '41749025'):
        for b in json.load(open('E:/cg-tmp/tcf/gold/battles_%s.json' % sub)):
            fn = 'E:/cg-tmp/tcf/gold/games/%s.json' % b['game_id']
            if not b.get('done') or not os.path.exists(fn): continue
            g = json.load(open(fn)); me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
            if not me: continue
            if any((a.get('rank') or 999) <= 100 for a in g['agents'] if a['index'] != me[0]['index']): continue
            ours.append(nets(g, me[0]['index']))
    show('teams rated about 23', peers)
    show('us (live code)', ours)
