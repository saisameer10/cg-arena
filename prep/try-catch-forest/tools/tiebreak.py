# usage: python tiebreak.py <battles_SUB.json> [...]   (in the folder with games/)
# Places lost on the tie-break: same catches as the team just above us, decided by who caught earlier.
import json, sys, os, re, collections

def med(q): q = sorted(q); return q[len(q) // 2] if q else None
for bf in sys.argv[1:]:
    n = 0; nonfirst = 0; tb = 0; tb_first = 0; gaps = []; ours = []; theirs = []; byN = collections.Counter(); byNall = collections.Counter()
    netT = []; netTwin = []; first_all = []; wins_first = []; tbwon = 0; ties_all = 0
    for b in json.load(open(bf)):
        fn = 'games/%s.json' % b['game_id']
        if not b.get('done') or not os.path.exists(fn): continue
        g = json.load(open(fn)); me = [p['agent_id'] for p in b['players'] if p.get('me')] or [p['agent_id'] for p in b['players'] if p['nickname'] == 'The Final Boss']
        seat = [a['index'] for a in g['agents'] if a['agent_id'] == me[0]][0]
        t = 0; last = -1; ct = [[], [], []]; N = 0; firstnet = None
        for f in g['frames']:
            a = f.get('agent')
            if a is None: continue
            if last == -1 or a <= last: t += 1
            last = a
            if t == 1 and a == seat: N = len(set(c.split()[1] for c in (f.get('stdout') or '').split(';') if len(c.split()) > 1 and c.split()[0] in ('MOVE', 'DASH')))
            for s in (f.get('summary') or '').split('\n'):
                m = re.match(r"\$(\d)'s agent \d+ catches", s)
                if m: ct[int(m.group(1))].append(t)
                if firstnet is None and re.match(r"\$%d's agent \d+ at .* throws a net" % seat, s): firstnet = t
        n += 1; byNall[N] += 1
        rank = g['ranking'].index(seat)
        if ct[seat]: first_all.append(ct[seat][0])
        # every pair level on catches with us (won or lost)
        for o in range(3):
            if o != seat and len(ct[o]) == len(ct[seat]) and ct[seat]:
                ties_all += 1
                if g['ranking'].index(o) > rank: tbwon += 1
        if rank == 0:
            if ct[seat]: wins_first.append(ct[seat][0]); netTwin.append(firstnet if firstnet else 101)
            continue
        nonfirst += 1
        above = g['ranking'][rank - 1]
        if len(ct[above]) == len(ct[seat]) and ct[seat]:
            tb += 1; byN[N] += 1
            if ct[above][0] != ct[seat][0]: tb_first += 1
            gaps.append(ct[seat][0] - ct[above][0]); ours.append(ct[seat][0]); theirs.append(ct[above][0]); netT.append(firstnet if firstnet else 101)
    print('=====', bf, 'games', n)
    print('places below first: %d; lost on the tie-break (same catches as the team just above): %d (%d%%); decided by the FIRST catch: %d of %d' % (nonfirst, tb, round(100 * tb / max(1, nonfirst)), tb_first, tb))
    print('   all ties on catches with another team: %d, we came out on top in %d (%d%%)' % (ties_all, tbwon, round(100 * tbwon / max(1, ties_all))))
    if gaps:
        print('   in the lost tie-breaks: our first catch median turn %s, theirs %s; we were later by median %s turns (quartiles %s / %s)' % (med(ours), med(theirs), med(gaps), sorted(gaps)[len(gaps) // 4], sorted(gaps)[3 * len(gaps) // 4]))
        print('   our first net in those games: median turn %s; in games we won: median turn %s; our first catch in games we won: median turn %s' % (med(netT), med(netTwin), med(wins_first)))
        print('   lost tie-breaks by units per team: ' + ', '.join('%d units: %d of %d games' % (k, byN[k], byNall[k]) for k in sorted(byNall)))
        print('   how many turns earlier would have been enough: 1-3 turns in %d, 4-10 in %d, more than 10 in %d' % (sum(1 for x in gaps if x <= 3), sum(1 for x in gaps if 3 < x <= 10), sum(1 for x in gaps if x > 10)))
