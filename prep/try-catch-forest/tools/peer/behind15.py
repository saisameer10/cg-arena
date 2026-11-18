# What teams rated about 23 and we do after being behind on catches at turn 15 (opponents ranked beyond 100).
# Reads the downloads in E:/cg-tmp/tcf/peer and E:/cg-tmp/tcf/gold.
import json, os, re, collections, statistics as st
B = ((1, 15), (16, 30), (31, 60), (61, 100))


def bi(t):
    for i, (a, b) in enumerate(B):
        if a <= t <= b: return i


def row(g, seat):
    prey = (seat + 1) % 3; pred = (seat + 2) % 3
    t = 0; last = -1; c = collections.Counter(); N = 0; netted = {}; sc = [0, 0, 0]; lead15 = None
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last:
            t += 1
            if t == 16:
                lead15 = sc[seat] - max(sc[o] for o in range(3) if o != seat)
                c['my15'] = sc[seat]; c['prey15'] = sc[prey]; c['pred15'] = sc[pred]
        last = a; k = bi(t)
        if a == seat:
            cm = [x.split() for x in (f.get('stdout') or '').split(';') if x.split()]
            if t == 1: N = len(set(x[1] for x in cm if x[0] in ('MOVE', 'DASH', 'WAIT') and len(x) > 1))
            c['dash%d' % k] += sum(1 for x in cm if x[0] == 'DASH')
            c['orders%d' % k] += sum(1 for x in cm if x[0] in ('MOVE', 'DASH', 'WAIT'))
        for s in (f.get('summary') or '').split('\n'):
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m:
                h = int(m.group(1)); sc[h] += 1
                if h == seat:
                    c['c%d' % k] += 1
                    if m.group(4) in netted and t - netted[m.group(4)] <= 5: c['cn%d' % k] += 1
                if int(m.group(3)) == seat: c['l%d' % k] += 1
            m = re.match(r"\$(\d)'s agent (\d+) at .* throws a net", s)
            if m and int(m.group(1)) == seat:
                c['net%d' % k] += 1; tail = s.split(' nets ', 1)[1] if ' nets ' in s else ''
                hp = re.findall(r"\$%d's agent (\d+)" % prey, tail)
                if hp:
                    c['hit%d' % k] += 1
                    for x in hp: netted[x] = t
                if re.search(r"\$%d's agent" % pred, tail): c['hp%d' % k] += 1
            if re.match(r"\$%d's agent \d+ at .* deploys smoke" % seat, s): c['sm%d' % k] += 1
            if re.match(r"\$%d's agent \d+ at .* deploys a decoy" % seat, s): c['dc%d' % k] += 1
    c['N'] = N; c['rank'] = g['ranking'].index(seat) + 1; c['lead15'] = lead15 if lead15 is not None else 0
    c['fin'] = sc[seat]; c['finprey'] = sc[prey]; c['finpred'] = sc[pred]
    return c


def m(q, k): return st.mean(r[k] for r in q) if q else float('nan')


def after(r, key): return r[key + '1'] + r[key + '2'] + r[key + '3']


def load():
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


if __name__ == '__main__':
    peers, ours = load()
    for name, rows in (('teams at 23', peers), ('us', ours)):
        q = [r for r in rows if r['lead15'] < 0]; n = len(q)
        print('\n== %s: behind at turn 15 in %d of %d games (%.0f%%)' % (name, n, len(rows), 100 * n / len(rows)))
        print(' end: first %.0f%%, second %.0f%%, last %.0f%%, mean rank %.2f | final catches %.2f, prey team %.2f, predator team (= our losses) %.2f' % (
            100 * st.mean(r['rank'] == 1 for r in q), 100 * st.mean(r['rank'] == 2 for r in q), 100 * st.mean(r['rank'] == 3 for r in q),
            m(q, 'rank'), m(q, 'fin'), m(q, 'finprey'), m(q, 'finpred')))
        print(' at turn 15: our catches %.2f, prey team %.2f, predator team %.2f; leader is the prey team %.0f%%, the predator team %.0f%%' % (
            m(q, 'my15'), m(q, 'prey15'), m(q, 'pred15'), 100 * st.mean(r['prey15'] > r['pred15'] for r in q), 100 * st.mean(r['pred15'] > r['prey15'] for r in q)))
        print(' spent by turn 15: nets %.2f, smokes %.2f, decoys %.2f, dashes per unit %.2f' % (
            m(q, 'net0'), m(q, 'sm0'), m(q, 'dc0'), sum(r['dash0'] for r in q) / max(1, sum(r['N'] for r in q))))
        for i in (1, 2, 3):
            nets = max(1, sum(r['net%d' % i] for r in q))
            print(' turns %3d-%3d: catches %.2f (after a net %.2f) | lost %.2f | nets %.2f (hit prey %.0f%%, predator %.0f%%) | dashes per 100 orders %.1f | smokes %.2f | decoys %.2f' % (
                B[i][0], B[i][1], m(q, 'c%d' % i), m(q, 'cn%d' % i), m(q, 'l%d' % i), m(q, 'net%d' % i),
                100 * sum(r['hit%d' % i] for r in q) / nets, 100 * sum(r['hp%d' % i] for r in q) / nets,
                100 * sum(r['dash%d' % i] for r in q) / max(1, sum(r['orders%d' % i] for r in q)), m(q, 'sm%d' % i), m(q, 'dc%d' % i)))
        for N in (3, 4, 5, 6):
            z = [r for r in q if r['N'] == N]
            if z: print('   %d units: %2d games, first %.0f%%, rank %.2f, catches after turn 15 %.2f, lost after turn 15 %.2f' % (
                N, len(z), 100 * st.mean(r['rank'] == 1 for r in z), m(z, 'rank'), st.mean(after(r, 'c') for r in z), st.mean(after(r, 'l') for r in z)))
        for lab, f in (('behind by 1', lambda r: r['lead15'] == -1), ('behind by 2 or more', lambda r: r['lead15'] <= -2),
                       ('we have 0 catches', lambda r: r['my15'] == 0), ('we have 1 or more', lambda r: r['my15'] > 0),
                       ('leader is the prey team', lambda r: r['prey15'] > r['pred15']), ('leader is the predator team', lambda r: r['pred15'] > r['prey15'])):
            z = [r for r in q if f(r)]
            if z: print('   %-28s %3d games, first %.0f%%, rank %.2f, catches after 15: %.2f, lost after 15: %.2f' % (
                lab, len(z), 100 * st.mean(r['rank'] == 1 for r in z), m(z, 'rank'), st.mean(after(r, 'c') for r in z), st.mean(after(r, 'l') for r in z)))
