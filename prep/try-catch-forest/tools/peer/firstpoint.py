# How the first point is made: the chain from the first net on prey to the catch, and the first ten turns around it.
# usage: python firstpoint.py   (teams at 23, teams at 25 if peer25_index.json exists, us)
import json, os, re, math, collections, statistics as st
P = 'E:/cg-tmp/tcf/peer/'


def row(g, seat):
    prey = (seat + 1) % 3; pred = (seat + 2) % 3
    t = 0; last = -1; c = collections.Counter(); N = 0; hits = []; catches = []; nets = []; lostfirst = None
    dashT = collections.defaultdict(set); pos = {}; ordersT = {}
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1
        last = a
        if t > 12: break
        if a == seat:
            cm = [x.split() for x in (f.get('stdout') or '').split(';') if x.split()]
            ordersT[t] = cm
            if t == 1: N = len(set(x[1] for x in cm if x[0] in ('MOVE', 'DASH', 'WAIT') and len(x) > 1))
        lines = (f.get('summary') or '').split('\n')
        for s in lines:      # dashes are listed after the nets of the same turn: read them first
            m = re.match(r"\$%d's agent (\d+) dashes from \((-?\d+), (-?\d+)\) towards \((-?\d+), (-?\d+)\)" % seat, s)
            if m: dashT[t].add(m.group(1))
        for s in lines:
            m = re.match(r"\$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\) throws a net at \((-?\d+), (-?\d+)\)(.*)", s)
            if m and int(m.group(1)) == seat:
                d = math.hypot(int(m.group(5)) - int(m.group(3)), int(m.group(6)) - int(m.group(4)))
                hp = re.findall(r"\$%d's agent (\d+)" % prey, m.group(7))
                nets.append({'t': t, 'u': m.group(2), 'd': d, 'hit': bool(hp), 'dash': m.group(2) in dashT[t], 'x': int(m.group(5)), 'y': int(m.group(6))})
                for v in hp: hits.append({'t': t, 'v': v, 'u': m.group(2), 'd': d, 'dash': m.group(2) in dashT[t]})
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m:
                if int(m.group(1)) == seat: catches.append({'t': t, 'u': m.group(2), 'v': m.group(4), 'dash': m.group(2) in dashT[t]})
                if int(m.group(3)) == seat and lostfirst is None: lostfirst = t
    c['N'] = N; c['rank'] = g['ranking'].index(seat) + 1
    return {'N': N, 'rank': c['rank'], 'hits': hits, 'catches': catches, 'nets': nets, 'lostfirst': lostfirst or 99, 'dashT': dashT, 'orders': ordersT}


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


def pct(a, b): return '%.0f%%' % (100 * a / b) if b else '-'


def show(name, rows):
    n = len(rows)
    if not n: return
    print('\n== %s (%d games)' % (name, n))
    # first net hit on prey in turns 1-8 and what follows
    H = [h for r in rows for h in r['hits'] if h['t'] <= 8]
    def conv(h, r, k): return any(c['v'] == h['v'] and 0 < c['t'] - h['t'] <= k or (c['v'] == h['v'] and c['t'] == h['t']) for c in r['catches'])
    pairs = [(h, r) for r in rows for h in r['hits'] if h['t'] <= 8]
    print(' net hits on prey in turns 1-8: %.2f a game; caught on the same or next turn %s, within 2 turns %s, within 4 turns %s' % (
        len(pairs) / n, pct(sum(conv(h, r, 1) for h, r in pairs), len(pairs)), pct(sum(conv(h, r, 2) for h, r in pairs), len(pairs)), pct(sum(conv(h, r, 4) for h, r in pairs), len(pairs))))
    for lo, hi in ((0, 700), (700, 1000), (1000, 1400), (1400, 2100)):
        z = [(h, r) for h, r in pairs if lo <= h['d'] < hi]
        if z: print('   thrower %4d-%4d from the held prey: %3d hits (%2.0f%%), caught within 2 turns %s, within 4 %s' % (lo, hi, len(z), 100 * len(z) / len(pairs),
            pct(sum(conv(h, r, 2) for h, r in z), len(z)), pct(sum(conv(h, r, 4) for h, r in z), len(z))))
    z = [(h, r) for h, r in pairs if h['dash']]; y = [(h, r) for h, r in pairs if not h['dash']]
    print('   thrower dashed that turn: %s of hits, caught within 2 turns %s | thrower walked: caught within 2 turns %s' % (pct(len(z), len(pairs)), pct(sum(conv(h, r, 2) for h, r in z), len(z)), pct(sum(conv(h, r, 2) for h, r in y), len(y))))
    # who finishes: the thrower or a team mate; with a dash or not
    fin = [(h, c) for r in rows for h in r['hits'] if h['t'] <= 8 for c in r['catches'] if c['v'] == h['v'] and 0 <= c['t'] - h['t'] <= 4]
    if fin: print('   the catch is made by the thrower %s, by a team mate %s; with a dash on the catch turn %s; delay hit to catch: mean %.1f turns' % (
        pct(sum(h['u'] == c['u'] for h, c in fin), len(fin)), pct(sum(h['u'] != c['u'] for h, c in fin), len(fin)), pct(sum(c['dash'] for h, c in fin), len(fin)), st.mean(c['t'] - h['t'] for h, c in fin)))
    # the turn after a hit: does anyone of ours dash?
    k = 0; tot = 0
    for r in rows:
        for h in r['hits']:
            if h['t'] > 8: continue
            tot += 1; k += bool(r['dashT'].get(h['t'] + 1)) or bool(r['dashT'].get(h['t']))
    print('   a unit of ours dashes on the hit turn or the turn after: %s of hits' % pct(k, tot))
    # nets in turns 1-5: all, by whether the thrower dashed
    NT = [x for r in rows for x in r['nets'] if x['t'] <= 5]
    a = [x for x in NT if x['dash']]; b = [x for x in NT if not x['dash']]
    print(' nets in turns 1-5: %.2f a game; thrown on a dash turn %s (hit %s), on a walk turn hit %s' % (len(NT) / n, pct(len(a), len(NT)), pct(sum(x['hit'] for x in a), len(a)), pct(sum(x['hit'] for x in b), len(b))))
    # two nets at once / several units on the first victim
    multi = sum(1 for r in rows for t in range(1, 6) if sum(1 for x in r['nets'] if x['t'] == t) >= 2)
    print(' turns (1-5) with two or more nets of ours: %.2f a game' % (multi / n))
    # units dashing on turn 1 and 2, share of the team
    U = sum(r['N'] for r in rows)
    print(' units dashing on turn 1: %s of units; on turn 2: %s; on turn 3: %s; a unit dashing on both of turns 1 and 3: %s' % (
        pct(sum(len(r['dashT'].get(1, ())) for r in rows), U), pct(sum(len(r['dashT'].get(2, ())) for r in rows), U), pct(sum(len(r['dashT'].get(3, ())) for r in rows), U),
        pct(sum(len(r['dashT'].get(1, set()) & r['dashT'].get(3, set())) for r in rows), U)))
    # first catch against first loss
    fc = [min([c['t'] for c in r['catches']] or [99]) for r in rows]
    both = [(f, r['lostfirst'], r['rank']) for f, r in zip(fc, rows)]
    for lab, sel in (('catch by 10, no loss by 10', lambda f, l: f <= 10 and l > 10), ('catch by 10 and a loss by 10', lambda f, l: f <= 10 and l <= 10),
                     ('no catch by 10, no loss by 10', lambda f, l: f > 10 and l > 10), ('no catch by 10, a loss by 10', lambda f, l: f > 10 and l <= 10)):
        z = [x for x in both if sel(x[0], x[1])]
        if z: print('   %-30s %3d games (%2.0f%%): first %s, mean rank %.2f' % (lab, len(z), 100 * len(z) / n, pct(sum(x[2] == 1 for x in z), len(z)), st.mean(x[2] for x in z)))


if __name__ == '__main__':
    show('teams at 23', collect('peer_index.json'))
    show('teams at 25', collect('peer25_index.json'))
    show('us', collect(None, ours=True))
