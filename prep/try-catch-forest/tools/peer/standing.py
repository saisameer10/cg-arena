# Place at turn 30 / 40 / 50 (catches, ties by the earlier catches) against the final place.
import json, os, re, collections
P = 'E:/cg-tmp/tcf/peer/'


def row(g, seat):
    t = 0; last = -1; ct = [[], [], []]; lost = {}
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1
        last = a
        for s in (f.get('summary') or '').split('\n'):
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m: ct[int(m.group(1))].append(t)
    def place(T):
        key = lambda p: (-sum(1 for x in ct[p] if x <= T), [x for x in ct[p] if x <= T] + [999] * 8)
        order = sorted(range(3), key=key)
        # shared place when keys are equal
        pl = 1 + sum(1 for p in range(3) if key(p) < key(seat))
        return pl
    return {'fin': g['ranking'].index(seat) + 1, 'p': {T: place(T) for T in (15, 30, 40, 50, 70)},
            'c': {T: sum(1 for x in ct[seat] if x <= T) for T in (30, 40, 50)}, 'late': sum(1 for x in ct[seat] if x > 50),
            'latelost': sum(1 for x in ct[(seat + 2) % 3] if x > 50), 'lateprey': sum(1 for x in ct[(seat + 1) % 3] if x > 50)}


def collect(index, ours=False):
    out = []
    if ours:
        for sub in ('41748059', '41749025'):
            for b in json.load(open('E:/cg-tmp/tcf/gold/battles_%s.json' % sub)):
                fn = 'E:/cg-tmp/tcf/gold/games/%s.json' % b['game_id']
                if not b.get('done') or not os.path.exists(fn): continue
                g = json.load(open(fn)); me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
                if not me or any((a.get('rank') or 999) <= 100 for a in g['agents'] if a['index'] != me[0]['index']): continue
                out.append(row(g, me[0]['index']))
        return out
    if not os.path.exists(P + index): return out
    for gid, agent in json.load(open(P + index)).items():
        fn = P + 'games/%s.json' % gid
        if not os.path.exists(fn): continue
        g = json.load(open(fn)); s = [a['index'] for a in g['agents'] if a.get('agent_id') == agent]
        if s: out.append(row(g, s[0]))
    return out


def show(name, rows):
    n = len(rows)
    if not n: return
    print('\n== %s (%d games); final first / second / last: %.0f%% / %.0f%% / %.0f%%' % (name, n, *[100 * sum(r['fin'] == k for r in rows) / n for k in (1, 2, 3)]))
    for T in (15, 30, 40, 50, 70):
        a = [r for r in rows if r['p'][T] == 1]; b = [r for r in rows if r['p'][T] == 2]; c = [r for r in rows if r['p'][T] == 3]
        f = lambda q, k: (100 * sum(r['fin'] == k for r in q) / len(q)) if q else 0
        print(' turn %2d: first %2.0f%% of games -> ends 1st %2.0f%%, 2nd %2.0f%%, 3rd %2.0f%% | second %2.0f%% -> %2.0f / %2.0f / %2.0f | last %2.0f%% -> %2.0f / %2.0f / %2.0f' % (
            T, 100 * len(a) / n, f(a, 1), f(a, 2), f(a, 3), 100 * len(b) / n, f(b, 1), f(b, 2), f(b, 3), 100 * len(c) / n, f(c, 1), f(c, 2), f(c, 3)))
        drop = sum(1 for r in rows if r['fin'] > r['p'][T]); rise = sum(1 for r in rows if r['fin'] < r['p'][T])
        print('          of all games: place lost after turn %d in %2.0f%%, gained in %2.0f%%; first at turn %d and not first at the end %2.0f%%; first or second and last at the end %2.0f%%' % (
            T, 100 * drop / n, 100 * rise / n, T, 100 * sum(1 for r in a if r['fin'] > 1) / n, 100 * sum(1 for r in rows if r['p'][T] <= 2 and r['fin'] == 3) / n))
    q = [r for r in rows if r['p'][50] == 1 and r['fin'] > 1]
    if q: print(' led at turn 50 and lost the lead (%d games): after turn 50 we caught %.2f, lost %.2f units, our prey team caught %.2f' % (
        len(q), sum(r['late'] for r in q) / len(q), sum(r['latelost'] for r in q) / len(q), sum(r['lateprey'] for r in q) / len(q)))
    q = [r for r in rows if r['p'][50] == 1 and r['fin'] == 1]
    if q: print(' led at turn 50 and kept it (%d games): after turn 50 we caught %.2f, lost %.2f units, our prey team caught %.2f' % (
        len(q), sum(r['late'] for r in q) / len(q), sum(r['latelost'] for r in q) / len(q), sum(r['lateprey'] for r in q) / len(q)))


if __name__ == '__main__':
    show('us', collect(None, ours=True))
    show('teams at 23', collect('peer_index.json'))
    show('teams at 25', collect('peer25_index.json'))
