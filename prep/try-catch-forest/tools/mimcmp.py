# usage: python mimcmp.py <battles_A.json> <battles_B.json> ...   (run in the folder with games/)
# Side by side from arena logs: why nets miss, how units are lost, what decoys do.
import json, sys, re, os, math, collections

def study(bfile):
    S = collections.Counter(); dist = []; hitd = []; missd = []; lostN = collections.defaultdict(lambda: [0, 0, 0]); multi = 0; games = 0
    netturn = []
    for b in json.load(open(bfile)):
        fn = 'games/%s.json' % b['game_id']
        if not b.get('done') or not os.path.exists(fn): continue
        g = json.load(open(fn)); me = [p['agent_id'] for p in b['players'] if p.get('me')] or [p['agent_id'] for p in b['players'] if p['nickname'] == 'The Final Boss']
        seat = [a['index'] for a in g['agents'] if a['agent_id'] == me[0]][0]; prey = (seat + 1) % 3; pred = (seat + 2) % 3
        games += 1; t = 0; last = -1; N = 0; summ = collections.defaultdict(list); out = {}
        for f in g['frames']:
            a = f.get('agent')
            if a is None: continue
            if last == -1 or a <= last: t += 1
            last = a
            if a == seat:
                out[t] = f.get('stdout') or ''
                if t == 1: N = len(set(c.split()[1] for c in out[t].split(';') if len(c.split()) > 1 and c.split()[0] in ('MOVE', 'DASH')))
            for s in (f.get('summary') or '').split('\n'):
                if s: summ[t].append(s)
        lost = 0
        for tt in sorted(summ):
            deaths = 0
            for s in summ[tt]:
                m = re.match(r"\$%d's agent (\d+) at \((-?\d+), (-?\d+)\) throws a net at \((-?\d+), (-?\d+)\)(.*)" % seat, s)
                if m:
                    x0, y0, x1, y1 = [int(m.group(i)) for i in (2, 3, 4, 5)]; rest = m.group(6)
                    S['nets'] += 1; netturn.append(tt)
                    fl = math.hypot(x1 - x0, y1 - y0)
                    am = re.search(r"aimed at \((-?\d+), (-?\d+)\)", rest)
                    aimd = math.hypot(int(am.group(1)) - x0, int(am.group(2)) - y0) if am else fl
                    dist.append(aimd)
                    hit = ' nets ' in rest
                    tail = rest.split(' nets ', 1)[1] if hit else ''
                    if re.search(r"\$%d's agent" % prey, tail): S['hit prey'] += 1; hitd.append(fl)
                    elif re.search(r"\$%d's agent" % pred, tail): S['hit predator'] += 1
                    elif re.search(r"\$%d's (agent|decoy)" % seat, tail): S['hit our own unit or decoy'] += 1
                    elif 'decoy' in tail: S['hit an enemy decoy'] += 1
                    elif 'stopped by aim' in rest: S['missed: reached its aim point'] += 1; missd.append(fl)
                    elif 'tree' in rest: S['missed: stopped by a tree'] += 1
                    else: S['missed: other (%s)' % rest.strip()[:30]] += 1
                    if aimd < 1990: S['aimed short of full range'] += 1
                if re.search(r"catches \$%d's agent" % seat, s):
                    deaths += 1; lost += 1; S['units lost'] += 1
                    c = re.match(r"\$(\d)'s agent (\d+) catches \$%d's agent (\d+)" % seat, s)
                    if c:
                        u = c.group(3)
                        if any(x.startswith('DASH ' + u + ' ') for x in out.get(tt, '').split(';')): S['lost on a turn our unit dashed'] += 1
                        if any(re.match(r"\$%d's agent %s dashes" % (pred, c.group(2)), x) for x in summ[tt]): S['lost to a dashing catcher'] += 1
                        if any(re.search(r"nets .*\$%d's agent %s\b" % (seat, u), x) for k in range(max(1, tt - 5), tt + 1) for x in summ[k]): S['lost while held by a net'] += 1
                        if tt <= 10: S['lost by turn 10'] += 1
                if re.match(r"\$%d's agent \d+ at .* deploys a decoy" % seat, s): S['decoys'] += 1
                if re.search(r"nets \$%d's decoy" % seat, s): S['decoy took a net'] += 1
                if re.match(r"\$%d's agent \d+ at .* deploys smoke" % seat, s): S['smokes'] += 1
                if re.search(r"nets .*\$%d's agent" % seat, s): S['times a unit of ours was netted'] += 1
            if deaths >= 2: multi += deaths
        S['dashes'] += sum(o.count('DASH ') for o in out.values())
        lostN[N][0] += 1; lostN[N][1] += lost; lostN[N][2] += g['ranking'].index(seat) + 1
    return S, dist, hitd, missd, lostN, multi, games, netturn

def med(q): q = sorted(q); return q[len(q) // 2] if q else 0

for bf in sys.argv[1:]:
    S, dist, hitd, missd, lostN, multi, n, nt = study(bf)
    print('=====', bf, 'games', n)
    T = max(1, S['nets'])
    print('nets %.1f per game, median turn %d, %d%% by turn 5 | aim distance median %d, aimed short of full range %d%%' % (S['nets'] / n, med(nt), round(100 * sum(1 for x in nt if x <= 5) / T), med(dist), round(100 * S['aimed short of full range'] / T)))
    for k in ('hit prey', 'hit predator', 'hit our own unit or decoy', 'hit an enemy decoy', 'missed: reached its aim point', 'missed: stopped by a tree'):
        print('   %-34s %3d%%' % (k, round(100 * S[k] / T)))
    for k in S:
        if k.startswith('missed: other'): print('   %-34s %3d%%' % (k, round(100 * S[k] / T)))
    print('   flight length of hits on prey: median %d | of misses at the aim point: median %d' % (med(hitd), med(missd)))
    L = max(1, S['units lost'])
    print('units lost %.2f per game: held by a net %d%%, to a dashing catcher %d%%, on a turn our unit dashed %d%%, by turn 10 %d%%, in a turn with 2+ losses %d%%' % (S['units lost'] / n, round(100 * S['lost while held by a net'] / L), round(100 * S['lost to a dashing catcher'] / L), round(100 * S['lost on a turn our unit dashed'] / L), round(100 * S['lost by turn 10'] / L), round(100 * multi / L)))
    print('   by units per team: ' + ' | '.join('%d units: %d games, lost %.1f (%d%%), mean rank %.2f' % (k, v[0], v[1] / v[0], round(100 * v[1] / (v[0] * k)), v[2] / v[0]) for k, v in sorted(lostN.items())))
    print('our units netted %.1f times per game | smokes %.1f | decoys %.1f, took a net %d%% | dashes %.1f per game' % (S['times a unit of ours was netted'] / n, S['smokes'] / n, S['decoys'] / n, round(100 * S['decoy took a net'] / max(1, S['decoys'])), S['dashes'] / n))
