# usage: python arena2.py <dir> <battles_X.json>
# Second look at arena games: why games are not won, how catches are made, what decoys and smoke do.
import json, sys, re, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arena


def pc(a, b):
    return '%d%%' % round(100 * a / b) if b else '-'


d = sys.argv[1]
G = arena.load(d, sys.argv[2])
n = len(G)
why = collections.Counter(); how = collections.Counter(); catchTurns = []; winTurns = []
decoyNet = decoyGone = decoys = 0; netsAtUs = netsHitUs = 0; killerDash = 0; losses = 0; myDash = 0; unitTurns = 0
byTurn = {10: [0, 0], 20: [0, 0], 40: [0, 0], 100: [0, 0]}
preyLeft = []; mineLeft = []
for b, g, seat in G:
    r = arena.study(b, g, seat)
    prey = (seat + 1) % 3; pred = (seat + 2) % 3
    t = 0; last = -1; netted = {}; summ = collections.defaultdict(list)
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1
        last = a
        if a == seat:
            o = f.get('stdout') or ''
            myDash += o.count('DASH '); unitTurns += len(set(c.split()[1] for c in o.split(';') if len(c.split()) > 1 and c.split()[0] in ('MOVE', 'DASH')))
        for s in (f.get('summary') or '').split('\n'):
            if s: summ[t].append(s)
    others = [r['othercatch'][prey], r['othercatch'][pred]]
    for tt in sorted(summ):
        for s in summ[tt]:
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m and int(m.group(1)) == seat:
                v = m.group(4)
                dashed = any(re.match(r"\$%d's agent %s dashes" % (seat, m.group(2)), x) for x in summ[tt])
                wasNet = v in netted and tt - netted[v] <= 5
                how[('netted prey' if wasNet else 'free prey') + (', with a dash' if dashed else ', walking')] += 1
                catchTurns.append(tt)
            if m and int(m.group(3)) == seat:
                losses += 1
                if any(re.match(r"\$%d's agent %s dashes" % (pred, m.group(2)), x) for x in summ[tt]): killerDash += 1
            m = re.match(r"\$(\d)'s agent (\d+) at .* throws a net", s)
            if m:
                tail = s.split(' nets ', 1)[1] if ' nets ' in s else ''
                if int(m.group(1)) == seat:
                    for x in re.findall(r"\$%d's agent (\d+)" % prey, tail): netted[x] = tt
                else:
                    if re.search(r"\$%d's (agent|decoy)" % seat, tail):
                        netsHitUs += 1
                        if re.search(r"\$%d's decoy" % seat, tail): decoyNet += 1
            if re.match(r"\$%d's agent \d+ at .* deploys a decoy" % seat, s): decoys += 1
            if re.search(r"destroys \$%d's decoy" % seat, s): decoyGone += 1
    for lim in byTurn:
        byTurn[lim][0] += sum(1 for x in r['ct'] if x <= lim)
        byTurn[lim][1] += 1
    preyLeft.append(r['N'] - r['catches']); mineLeft.append(r['N'] - r['lost'])
    if r['rank'] > 1:
        best = max(others)
        if r['catches'] == best: why['level on catches, lost the tie-break'] += 1
        elif r['lost'] == r['N'] and r['catches'] < r['N']: why['all our units lost before the prey was finished'] += 1
        elif r['catches'] == r['N']: why['caught every prey, the winner had more units to catch... (cannot happen)'] += 1
        else: why['units left on both sides at the end: hunt too slow (prey left %s)' % ('1' if r['N'] - r['catches'] == 1 else '2+')] += 1
print('games', n)
print('catches made: %d' % sum(how.values()))
for k, v in how.most_common(): print('   %-34s %4d  %s' % (k, v, pc(v, sum(how.values()))))
print('our catches by turn: ' + ', '.join('by %d: %.2f per game' % (lim, byTurn[lim][0] / max(1, byTurn[lim][1])) for lim in sorted(byTurn)))
print('our losses %d: catcher dashed on the catching turn %s' % (losses, pc(killerDash, losses)))
print('our dashes: %.1f per game, %.1f%% of unit turns' % (myDash / n, 100 * myDash / max(1, unitTurns)))
print('decoys deployed %d: destroyed by a touch %s, took a net %s; enemy nets that hit something of ours: %d (%s of them hit a decoy)' % (decoys, pc(decoyGone, decoys), pc(decoyNet, decoys), netsHitUs, pc(decoyNet, netsHitUs)))
print('at the end: prey units left %.2f per game, our units left %.2f per game' % (sum(preyLeft) / n, sum(mineLeft) / n))
print('games not won: %d' % sum(why.values()))
for k, v in why.most_common(): print('   %-70s %3d  %s' % (k, v, pc(v, sum(why.values()))))
