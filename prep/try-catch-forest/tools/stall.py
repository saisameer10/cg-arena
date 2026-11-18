# Why the live code stops catching: what its living units are doing (the tag on each order) after turn 30,
# in games where it still catches and in games where it does not, while prey is left on the board.
import json, os, re, collections
G = 'E:/cg-tmp/tcf/gold/'
rows = []
for sub in ('41748059', '41749025'):
    for b in json.load(open(G + 'battles_%s.json' % sub)):
        fn = G + 'games/%s.json' % b['game_id']
        if not b.get('done') or not os.path.exists(fn): continue
        g = json.load(open(fn)); me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
        if not me: continue
        seat = me[0]['index']; prey = (seat + 1) % 3; t = 0; last = -1; N = 0; mycatch = []; lostT = []
        tags = collections.defaultdict(collections.Counter); ghosts = collections.Counter()
        for f in g['frames']:
            a = f.get('agent')
            if a is None: continue
            if last == -1 or a <= last: t += 1
            last = a
            if a == seat:
                for x in (f.get('stdout') or '').split(';'):
                    w = x.split()
                    if len(w) >= 5 and w[0] in ('MOVE', 'DASH'):
                        tg = w[4]
                        if t == 1: N += 1
                        if tg == 'GHOST': ghosts[t] += 1
                        else: tags[t][tg] += 1
                    elif len(w) >= 2 and w[0] == 'WAIT': tags[t]['HELD'] += 1
            for s in (f.get('summary') or '').split('\n'):
                m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
                if m:
                    if int(m.group(1)) == seat: mycatch.append(t)
                    if int(m.group(3)) == seat: lostT.append(t)
        rows.append({'N': N, 'my': mycatch, 'lost': lostT, 'tags': tags, 'ghosts': ghosts, 'rank': g['ranking'].index(seat) + 1, 'T': t})


def share(q, lo, hi):
    C = collections.Counter(); gh = 0; tn = 0
    for r in q:
        for t in range(lo, hi + 1):
            if r['N'] - sum(1 for x in r['my'] if x < t) <= 0: continue      # no prey left
            C.update(r['tags'].get(t, {})); gh += r['ghosts'].get(t, 0); tn += 1
    tot = sum(C.values()) or 1
    grp = {'HUNT or CATCH': C['HUNT'] + C['CATCH'], 'SEEK (no prey known)': C['SEEK'], 'FLEE': C['FLEE'] + C['LFLEE'], 'HELD': sum(v for k, v in C.items() if k.startswith('HELD'))}
    return ', '.join('%s %.0f%%' % (k, 100 * v / tot) for k, v in grp.items()) + ' | living units per turn %.1f, ghosts %.1f' % (tot / max(1, tn), gh / max(1, tn))


print('live code, %d arena games' % len(rows))
A = [r for r in rows if any(x > 30 for x in r['my'])]; B = [r for r in rows if not any(x > 30 for x in r['my']) and r['N'] - len(r['my']) > 0]
for lab, q in (('we catch after turn 30', A), ('nothing after turn 30, prey left', B)):
    if not q: continue
    print('\n%s: %d games, mean rank %.2f, prey left at the end %.1f' % (lab, len(q), sum(r['rank'] for r in q) / len(q), sum(r['N'] - len(r['my']) for r in q) / len(q)))
    for lo, hi in ((16, 30), (31, 45), (46, 60), (61, 80), (81, 100)):
        print('   turns %3d-%3d: %s' % (lo, hi, share(q, lo, hi)))
# turns between catches: how long a hunting unit stays on HUNT before the catch comes, and the SEEK share by number of ghosts
C = collections.defaultdict(collections.Counter)
for r in rows:
    for t in range(31, r['T'] + 1):
        if r['N'] - sum(1 for x in r['my'] if x < t) <= 0: continue
        k = min(3, r['ghosts'].get(t, 0)); C[k].update(r['tags'].get(t, {}))
print('\nafter turn 30, by the number of ghosts we have (3 = three or more):')
for k in sorted(C):
    tot = sum(C[k].values())
    print('   %d ghosts: %5d unit-turns: HUNT or CATCH %.0f%%, SEEK %.0f%%, FLEE %.0f%%' % (k, tot, 100 * (C[k]['HUNT'] + C[k]['CATCH']) / tot, 100 * C[k]['SEEK'] / tot, 100 * (C[k]['FLEE'] + C[k]['LFLEE']) / tot))
