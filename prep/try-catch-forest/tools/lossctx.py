# usage: python lossctx.py <dir> <battles_SUB.json> [more]
# Every unit of ours that was caught in the arena games of a submission, from the plain logs: the unit's own tag
# (HUNT / FLEE / ...) on the turn it died and the turns before, whether it was held by a net (and whose), whether it could
# dash, what powers it used in its last 4 turns, and whether the catcher dashed. Split: all games / games the predator's team won.
import json, sys, re, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arena, whylost

def losses(g, seat):
    pred = (seat + 2) % 3; prey = (seat + 1) % 3
    t = 0; last = -1; out = []
    tag = collections.defaultdict(dict); mv = collections.defaultdict(dict); pw = collections.defaultdict(dict)
    netby = {}; cd = collections.Counter(); nd = collections.Counter(); used = collections.Counter(); pdash = {}
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        a = int(a)
        if last == -1 or a <= last:
            t += 1
            for u in list(cd):
                if cd[u] > 0: cd[u] -= 1
        last = a
        if a == seat:
            for c in (f.get('stdout') or '').split(';'):
                p = c.split()
                if len(p) < 2: continue
                if p[0] in ('MOVE', 'DASH'):
                    mv[p[1]][t] = p[0]; tag[p[1]][t] = p[4] if len(p) > 4 else '-'
                elif p[0] in ('NET', 'SMOKE', 'DECOY'): pw[p[1]][t] = p[0]; used[p[0]] += 1
        for s in (f.get('summary') or '').split('\n'):
            m = re.match(r"\$(\d)'s agent (\d+) dashes", s)
            if m:
                if int(m.group(1)) == seat: nd[m.group(2)] += 1; cd[m.group(2)] = nd[m.group(2)] + 1
                elif int(m.group(1)) == pred: pdash[m.group(2)] = t
            m = re.match(r"\$(\d)'s agent \d+ at .* throws a net", s)
            if m and ' nets ' in s:
                for x in re.findall(r"\$%d's agent (\d+)" % seat, s.split(' nets ', 1)[1]): netby[x] = (t, int(m.group(1)))
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m and int(m.group(3)) == seat:
                u = m.group(4); nb = netby.get(u)
                held = nb is not None and t - nb[0] <= 5
                out.append(dict(t=t, tag=tag[u].get(t, tag[u].get(t - 1, '?')), tags=[tag[u].get(k, '?') for k in range(t - 4, t + 1)],
                                held=held, netter=('pred' if nb[1] == pred else 'prey' if nb[1] == prey else 'own') if held else None,
                                heldfor=(t - nb[0]) if held else None,
                                candash=cd[u] == 0, dashed=mv[u].get(t) == 'DASH' or mv[u].get(t - 1) == 'DASH',
                                pw=[pw[u].get(k) for k in range(t - 4, t + 1) if pw[u].get(k)], teampw=dict(used),
                                cdash=pdash.get(m.group(2), -9) == t, alive_before=None))
    return out

rows = []
for bf in sys.argv[2:]:
    for b, g, seat in arena.load(sys.argv[1], bf):
        r = whylost.facts(b, g, seat); r['reason'] = whylost.reason(r)[0] if r['rank'] > 1 else 'W'
        r['L'] = losses(g, seat); r['id'] = b['game_id']; rows.append(r)

def rep(name, q):
    L = [x for r in q for x in r['L']]; n = len(L)
    if not n: return
    P = lambda f: '%3.0f%%' % (100 * sum(1 for x in L if f(x)) / n)
    print('\n== %s: %d games, %d units lost (%.2f per game)' % (name, len(q), n, n / len(q)))
    print('  when: by turn 10 %s, 11-25 %s, 26-50 %s, after 50 %s' % (P(lambda x: x['t'] <= 10), P(lambda x: 10 < x['t'] <= 25), P(lambda x: 25 < x['t'] <= 50), P(lambda x: x['t'] > 50)))
    print('  tag on the turn of the loss:', ', '.join('%s %d%%' % (k, 100 * v / n) for k, v in collections.Counter(x['tag'] for x in L).most_common(8)))
    print('  held by a net: %s (net of the predator team %s, of the prey team %s)' % (P(lambda x: x['held']), P(lambda x: x['netter'] == 'pred'), P(lambda x: x['netter'] == 'prey')))
    H = [x for x in L if x['held']]; F = [x for x in L if not x['held']]
    if H:
        print('    held units: used a power while held or just before: %d%% (%s); none: %d%%; caught on hold turn 1/2/3/4+: %s' % (
            100 * sum(1 for x in H if x['pw']) / len(H), dict(collections.Counter(p for x in H for p in set(x['pw']))), 100 * sum(1 for x in H if not x['pw']) / len(H),
            dict(sorted(collections.Counter(min(x['heldfor'], 4) for x in H).items()))))
    if F:
        print('    free units (%d): could dash %d%%, dashed in the last two turns %d%%, catcher dashed %d%%, used a power in the last 4 turns %d%% %s' % (
            len(F), 100 * sum(x['candash'] for x in F) / len(F), 100 * sum(x['dashed'] for x in F) / len(F), 100 * sum(x['cdash'] for x in F) / len(F),
            100 * sum(1 for x in F if x['pw']) / len(F), dict(collections.Counter(p for x in F for p in set(x['pw'])))))
        print('    free units by tag: ' + ', '.join('%s %d (could dash %d, catcher dashed %d)' % (k, v, sum(1 for x in F if x['tag'] == k and x['candash']), sum(1 for x in F if x['tag'] == k and x['cdash']))
                                                  for k, v in collections.Counter(x['tag'] for x in F).most_common(6)))
        print('    free units, tags of the 4 turns before: hunting all the time %d%%, switched from HUNT to a flee tag %d%%, fleeing 2+ turns %d%%' % (
            100 * sum(1 for x in F if all('HUNT' in y or y in ('CATCH', '?') for y in x['tags'])) / len(F),
            100 * sum(1 for x in F if 'FLEE' in x['tags'][-1] and 'FLEE' not in x['tags'][-2]) / len(F),
            100 * sum(1 for x in F if 'FLEE' in x['tags'][-1] and 'FLEE' in x['tags'][-2]) / len(F)))

rep('all games', rows)
rep('won', [r for r in rows if r['rank'] == 1])
rep('predator team won, it caught more (C)', [r for r in rows if r['reason'] == 'C'])
rep('other games not won', [r for r in rows if r['reason'] not in 'CW'])
if os.environ.get('V'):
    for r in rows:
        if r['reason'] == 'C': print(r['id'], 'N', r['N'], 'c', r['c'], [(x['t'], x['tag'], 'held' if x['held'] else 'free', 'cd0' if x['candash'] else 'cd', x['pw']) for x in r['L']])
