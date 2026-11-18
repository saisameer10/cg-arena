# Habits of the teams rated about 23 in their games against lower-half opponents, next to ours (live code, two runs).
import json, os, re, glob, collections


def seatstats(g, seat):
    prey = (seat + 1) % 3; pred = (seat + 2) % 3
    t = 0; last = -1; c = collections.Counter(); netted = {}; N = 0
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1
        last = a
        if a == seat:
            cm = [x.split() for x in (f.get('stdout') or '').split(';') if x.split()]
            if t == 1: N = len(set(x[1] for x in cm if x[0] in ('MOVE', 'DASH', 'WAIT') and len(x) > 1))
            d = sum(1 for x in cm if x[0] == 'DASH'); c['dash'] += d
            if t == 1: c['dash_t1'] += d
            if t <= 5: c['dash_t5'] += d
            if t <= 15: c['dash_t15'] += d
        for s in (f.get('summary') or '').split('\n'):
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m:
                h = int(m.group(1)); v = int(m.group(3))
                if h == seat:
                    c['catch'] += 1
                    if t <= 10: c['c10'] += 1
                    if t <= 15: c['c15'] += 1
                    if t <= 30: c['c30'] += 1
                    if 'first' not in c: c['first'] = t
                    if m.group(4) in netted and t - netted[m.group(4)] <= 5: c['cnet'] += 1
                    if any(re.match(r"\$%d's agent %s dashes" % (seat, m.group(2)), x) for x in (f.get('summary') or '').split('\n')): c['cdash'] += 1
                if v == seat:
                    c['lost'] += 1
                    if t <= 10: c['l10'] += 1
                    if t <= 30: c['l30'] += 1
                    if t > 60: c['l60'] += 1
            m = re.match(r"\$(\d)'s agent (\d+) at .* throws a net", s)
            if m and int(m.group(1)) == seat:
                c['net'] += 1
                if t <= 3: c['net3'] += 1
                if t <= 15: c['net15'] += 1
                tail = s.split(' nets ', 1)[1] if ' nets ' in s else ''
                hp = re.findall(r"\$%d's agent (\d+)" % prey, tail)
                if hp:
                    c['hit'] += 1
                    for x in hp: netted[x] = t
                if re.search(r"\$%d's agent" % pred, tail): c['hitpred'] += 1
            if re.match(r"\$%d's agent \d+ at .* deploys smoke" % seat, s):
                c['smoke'] += 1
                if t <= 5: c['smoke5'] += 1
            if re.match(r"\$%d's agent \d+ at .* deploys a decoy" % seat, s): c['decoy'] += 1
    c['N'] = N; c['rank'] = g['ranking'].index(seat) + 1; c['games'] = 1; c['win'] = c['rank'] == 1; c['lastp'] = c['rank'] == 3
    c['nocatch15'] = 0 if c['c15'] else 1
    return c


def total(rows):
    T = collections.Counter()
    for r in rows:
        for k, v in r.items():
            if k != 'first': T[k] += v
    T['firsts'] = sorted(r['first'] for r in rows if 'first' in r)
    return T


def line(name, T):
    n = T['games']; f = T['firsts']
    return [name, n, T['rank'] / n, 100 * T['win'] / n, 100 * T['lastp'] / n, T['catch'] / n, T['c10'] / n, T['c15'] / n, T['c30'] / n, (f[len(f) // 2] if f else 0), 100 * T['nocatch15'] / n,
            T['lost'] / n, T['l10'] / n, T['l30'] / n, T['l60'] / n, T['net'] / n, T['net3'] / n, T['net15'] / n, 100 * T['hit'] / max(1, T['net']), 100 * T['cnet'] / max(1, T['hit']), 100 * T['hitpred'] / max(1, T['net']),
            T['dash'] / max(1, T['N']), T['dash_t1'] / max(1, T['N']), T['dash_t5'] / max(1, T['N']), T['dash_t15'] / max(1, T['N']), T['smoke'] / n, T['smoke5'] / n, T['decoy'] / n, 100 * T['cdash'] / max(1, T['catch'])]


LABELS = ['', 'games', 'mean rank', 'first %', 'last %', 'catches', 'catches by turn 10', 'by turn 15', 'by turn 30', 'first catch, median turn', 'no catch by turn 15, % of games',
          'units lost', 'lost by turn 10', 'lost by turn 30', 'lost after turn 60', 'nets', 'nets by turn 3', 'nets by turn 15', 'nets that hit prey %', 'prey hits that became a catch %', 'nets that hit a predator %',
          'dashes per unit', 'dashes per unit on turn 1', 'in turns 1-5', 'in turns 1-15', 'smokes', 'smokes in turns 1-5', 'decoys', 'catches made with a dash %']

if __name__ == '__main__':
    idx = json.load(open('E:/cg-tmp/tcf/peer/peer_index.json'))
    peers = []
    for gid, agent in idx.items():
        fn = 'E:/cg-tmp/tcf/peer/games/%s.json' % gid
        if not os.path.exists(fn): continue
        g = json.load(open(fn)); s = [a['index'] for a in g['agents'] if a.get('agent_id') == agent]
        if s: peers.append(seatstats(g, s[0]))
    ours = []
    for sub in ('41748059', '41749025'):
        for b in json.load(open('E:/cg-tmp/tcf/gold/battles_%s.json' % sub)):
            fn = 'E:/cg-tmp/tcf/gold/games/%s.json' % b['game_id']
            if not b.get('done') or not os.path.exists(fn): continue
            g = json.load(open(fn)); me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
            if not me: continue
            if any((a.get('rank') or 999) <= 100 for a in g['agents'] if a['index'] != me[0]['index']): continue
            ours.append(seatstats(g, me[0]['index']))
    A = line('teams rated about 23', total(peers)); B = line('us (live code)', total(ours))
    print('%-34s %22s %16s' % ('against opponents ranked beyond 100', A[0], B[0]))
    for i in range(1, len(LABELS)):
        print('%-34s %22s %16s' % (LABELS[i], ('%.2f' % A[i]) if isinstance(A[i], float) else A[i], ('%.2f' % B[i]) if isinstance(B[i], float) else B[i]))
    for N in (3, 4, 5, 6):
        a = [r for r in peers if r['N'] == N]; b = [r for r in ours if r['N'] == N]
        if a and b: print('%d units: mean rank %.2f (%d games) against ours %.2f (%d); catches by turn 15 %.2f against %.2f; units lost %.2f against %.2f' % (
            N, sum(r['rank'] for r in a) / len(a), len(a), sum(r['rank'] for r in b) / len(b), len(b), sum(r['c15'] for r in a) / len(a), sum(r['c15'] for r in b) / len(b), sum(r['lost'] for r in a) / len(a), sum(r['lost'] for r in b) / len(b)))
