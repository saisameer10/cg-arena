# usage: python whylost.py <dir> <battles_SUB.json> [more battle lists]
# Where the places are lost: every game not won gets ONE main reason (first rule that fits), and the report gives
# each reason's share of the games and of the places lost (second = 1 place lost, last = 2).
import json, sys, re, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arena


def facts(b, g, seat):
    prey = (seat + 1) % 3; pred = (seat + 2) % 3
    t = 0; last = -1; ct = {0: [], 1: [], 2: []}; N = 0; netted = {}; hits = conv = 0; nets = 0; heldLoss = 0; mynet = collections.defaultdict(list)
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1
        last = a
        if a == seat and t == 1:
            N = len(set(c.split()[1] for c in (f.get('stdout') or '').split(';') if len(c.split()) > 1 and c.split()[0] in ('MOVE', 'DASH')))
        for s in (f.get('summary') or '').split('\n'):
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m:
                h = int(m.group(1)); ct[h].append(t)
                if h == seat and m.group(4) in netted and t - netted[m.group(4)] <= 5: conv += 1
                if int(m.group(3)) == seat and any(t - k <= 5 for k in mynet[m.group(4)]): heldLoss += 1
            m = re.match(r"\$(\d)'s agent \d+ at .* throws a net", s)
            if m:
                tail = s.split(' nets ', 1)[1] if ' nets ' in s else ''
                if int(m.group(1)) == seat:
                    nets += 1
                    hp = re.findall(r"\$%d's agent (\d+)" % prey, tail)
                    if hp:
                        hits += 1
                        for x in hp: netted[x] = t
                else:
                    for x in re.findall(r"\$%d's agent (\d+)" % seat, tail): mynet[x].append(t)
    rank = g['ranking'].index(seat) + 1
    win = g['ranking'][0]
    return dict(rank=rank, N=N, c=ct[seat], lost=ct[pred], preyc=ct[prey], winner=('us' if win == seat else 'prey' if win == prey else 'pred'),
                wc=ct[win], hits=hits, conv=conv, nets=nets, heldLoss=heldLoss, turns=t)


def reason(r):
    c, L, N = len(r['c']), len(r['lost']), r['N']
    W = len(r['wc'])
    if c == W:
        return 'A. Level on catches with the winner, our catches came later (tie-break)'
    early = sum(1 for x in r['lost'] if x <= 20)
    if r['winner'] == 'pred':
        if L and r['lost'][-1] > 70 and c >= L - 1:
            return 'B. Predator team won with a catch after turn 70 (we were level or ahead until then)'
        return 'C. Predator team won: it caught more of ours than we caught (units lost)'
    # prey team won
    if not r['c'] or r['c'][0] > 15:
        return 'D. Prey team won; we had no catch by turn 15 (slow start)'
    if r['hits'] - r['conv'] >= W - c:
        return 'E. Prey team won; our unfinished net hits would have covered the gap'
    if L >= max(2, (N + 1) // 2) and early >= 2:
        return 'F. Prey team won; we had lost two or more hunters by turn 20'
    return 'G. Prey team won; we started on time but the hunt stalled'


if __name__ == '__main__':
    d = sys.argv[1]
    rows = []
    for bf in sys.argv[2:]:
        rows += [facts(*x) for x in arena.load(d, bf)]
    n = len(rows); nonwin = [r for r in rows if r['rank'] > 1]
    places = sum(r['rank'] - 1 for r in rows)
    print('games %d: first %d, second %d, last %d; mean rank %.2f; places lost %d (%.2f per game)' % (
        n, sum(r['rank'] == 1 for r in rows), sum(r['rank'] == 2 for r in rows), sum(r['rank'] == 3 for r in rows),
        sum(r['rank'] for r in rows) / n, places, places / n))
    tab = collections.defaultdict(lambda: [0, 0, 0])
    for r in nonwin:
        k = reason(r); tab[k][0] += 1; tab[k][1] += r['rank'] - 1; tab[k][2] += r['rank'] == 3
    print('%-88s %5s %7s %7s %5s' % ('main reason of a game not won', 'games', '% games', '% places', 'lasts'))
    for k in sorted(tab):
        v = tab[k]
        print('%-88s %5d %6.0f%% %6.0f%% %5d' % (k, v[0], 100 * v[0] / n, 100 * v[1] / max(1, places), v[2]))
    # single quantities, in games won against games not won
    def share(f, q): return 100 * sum(1 for r in q if f(r)) / max(1, len(q))
    won = [r for r in rows if r['rank'] == 1]
    print('\nsingle facts: share of games won / of games not won')
    for name, f in (
        ('we made the first catch of the game', lambda r: r['c'] and r['c'][0] <= min([x[0] for x in (r['preyc'], r['lost']) if x] or [999])),
        ('no catch of ours by turn 15', lambda r: not r['c'] or r['c'][0] > 15),
        ('a unit of ours lost by turn 10', lambda r: any(x <= 10 for x in r['lost'])),
        ('two or more units lost by turn 20', lambda r: sum(1 for x in r['lost'] if x <= 20) >= 2),
        ('at least one net hit on prey not finished', lambda r: r['hits'] > r['conv']),
        ('a unit of ours caught while held by a net', lambda r: r['heldLoss'] > 0),
        ('the prey team caught every unit of the third team', lambda r: len(r['preyc']) >= r['N']),
        ('4 units per team', lambda r: r['N'] == 4),
        ('3 units per team', lambda r: r['N'] == 3),
    ):
        print('  %-52s %3.0f%% / %3.0f%%' % (name, share(f, won), share(f, nonwin)))
    need = sum(r['rank'] == 3 for r in rows)
    print('\nunits: lost per game %.2f, catches per game %.2f, catches by turn 15 per game %.2f' % (
        sum(len(r['lost']) for r in rows) / n, sum(len(r['c']) for r in rows) / n, sum(sum(1 for x in r['c'] if x <= 15) for r in rows) / n))
