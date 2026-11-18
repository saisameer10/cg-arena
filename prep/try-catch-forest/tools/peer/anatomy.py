# usage: python anatomy.py [section ...]
# Takes every catch, loss, net, smoke and held unit apart, for four groups of bots against opponents ranked beyond 100:
#   us (live code, two runs), v10 (its own run), teams rated about 23 (ranked 95-130), teams rated about 25 (ranked 30-70).
# Everything comes from the event lines of the game logs (exact positions for dashes, nets, smokes, catches).
import json, os, re, glob, collections, math, sys

R_DASH = re.compile(r"\$(\d)'s agent (\d+) dashes from \((-?\d+), (-?\d+)\) towards \((-?\d+), (-?\d+)\)")
R_NET = re.compile(r"\$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\) throws a net at \((-?\d+), (-?\d+)\)(.*)")
R_SMOKE = re.compile(r"\$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\) deploys smoke at \((-?\d+), (-?\d+)\)")
R_DECOY = re.compile(r"\$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\) deploys a decoy")
R_DESTROY = re.compile(r"\$(\d)'s agent (\d+) destroys \$(\d)'s decoy (\d+)")
R_CATCH = re.compile(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\)")
R_AG = re.compile(r"\$(\d)'s agent (\d+)")
R_DC = re.compile(r"\$(\d)'s decoy (\d+)")


def parse(g):
    """-> dict with per-turn events and commands"""
    t = 0; last = -1
    ev = collections.defaultdict(list); cmd = collections.defaultdict(dict)
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        a = int(a)
        if last == -1 or a <= last: t += 1
        last = a
        cmd[t][a] = [x.split() for x in (f.get('stdout') or '').split(';') if x.split()]
        for s in (f.get('summary') or '').split('\n'):
            m = R_CATCH.match(s)
            if m: ev[t].append(('catch', int(m.group(1)), int(m.group(2)), int(m.group(3)), int(m.group(4)), (int(m.group(5)), int(m.group(6))))); continue
            m = R_DASH.match(s)
            if m: ev[t].append(('dash', int(m.group(1)), int(m.group(2)), (int(m.group(3)), int(m.group(4))), (int(m.group(5)), int(m.group(6))))); continue
            m = R_NET.match(s)
            if m:
                rest = m.group(7)
                tail = rest.split(' nets ', 1)[1] if ' nets ' in rest else ''
                hits = [(int(x), int(y)) for x, y in R_AG.findall(tail)]
                dec = [(int(x), int(y)) for x, y in R_DC.findall(tail)]
                why = 'tree' if 'stopped by tree' in rest else 'aim' if 'stopped by aim' in rest else 'hit'
                ev[t].append(('net', int(m.group(1)), int(m.group(2)), (int(m.group(3)), int(m.group(4))), (int(m.group(5)), int(m.group(6))), hits, dec, why)); continue
            m = R_SMOKE.match(s)
            if m: ev[t].append(('smoke', int(m.group(1)), int(m.group(2)), (int(m.group(3)), int(m.group(4))), (int(m.group(5)), int(m.group(6))))); continue
            m = R_DECOY.match(s)
            if m: ev[t].append(('decoy', int(m.group(1)), int(m.group(2)), (int(m.group(3)), int(m.group(4))))); continue
            m = R_DESTROY.match(s)
            if m: ev[t].append(('destroy', int(m.group(1)), int(m.group(2)), int(m.group(3)))); continue
    ids = [int(c[1]) for tt in cmd for c in cmd[tt].get(0, []) if len(c) > 1 and c[0] in ('MOVE', 'DASH', 'NET', 'SMOKE', 'DECOY') and c[1].lstrip('-').isdigit()]
    N = max(ids) + 1 if ids else 0
    return {'T': t, 'ev': ev, 'cmd': cmd, 'N': N}


def d(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])


def win(t):
    return '1-5' if t <= 5 else '6-15' if t <= 15 else '16-30' if t <= 30 else '31-60' if t <= 60 else '61+'


WINS = ['1-5', '6-15', '16-30', '31-60', '61+']
WLEN = {'1-5': (1, 5), '6-15': (6, 15), '16-30': (16, 30), '31-60': (31, 60), '61+': (61, 100)}


def study(g, seat):
    """one record for the bot in this seat"""
    P = parse(g); ev = P['ev']; N = P['N']; T = P['T']
    prey = (seat + 1) % 3; pred = (seat + 2) % 3
    r = collections.Counter(); r['games'] = 1; r['N'] = N; r['rank'] = g['ranking'].index(seat) + 1
    r['win'] = r['rank'] == 1; r['lastp'] = r['rank'] == 3
    L = {'catch': [], 'loss': [], 'net': [], 'held': [], 'smoke': []}
    dashes = collections.defaultdict(list)      # (team, unit) -> turns of dashes
    netted = collections.defaultdict(list)      # (team, unit) -> [(turn, thrower team)]
    clouds = []                                 # (turn, team, centre)
    dead = {}                                   # (team, unit) -> turn caught
    power = collections.defaultdict(list)       # (team, unit) -> [(turn, kind)]
    # first pass: state tables for every team
    for t in range(1, T + 1):
        for e in ev.get(t, []):
            if e[0] == 'dash': dashes[(e[1], e[2])].append(t)
            elif e[0] == 'net':
                power[(e[1], e[2])].append((t, 'net'))
                for h in e[5]: netted[h].append((t, e[1]))
            elif e[0] == 'smoke': clouds.append((t, e[1], e[4])); power[(e[1], e[2])].append((t, 'smoke'))
            elif e[0] == 'decoy': power[(e[1], e[2])].append((t, 'decoy'))
            elif e[0] == 'catch': dead.setdefault((e[3], e[4]), t)

    def fatigue(u, t): return sum(1 for x in dashes[u] if x < t)

    def cooling(u, t):          # could not dash on turn t (k-th dash at turn x blocks turns x+1 .. x+k)
        ds = [x for x in dashes[u] if x < t]
        return bool(ds) and t - ds[-1] <= len(ds)

    def held(u, t):
        return [(x, by) for x, by in netted[u] if 1 <= t - x <= 5]

    def cloud(pos, t):
        return [tm for (x, tm, c) in clouds if 0 <= t - x <= 9 and d(pos, c) < 1900]

    alive = lambda team, t: sum(1 for u in range(team * N, team * N + N) if dead.get((team, u), 999) >= t)
    for w in WINS:
        a, b = WLEN[w]
        r['ut_' + w] = sum(alive(seat, t) for t in range(a, min(b, T) + 1))
    for t in range(1, T + 1):
        E = ev.get(t, [])
        dd = {(e[1], e[2]): e for e in E if e[0] == 'dash'}
        for e in E:
            if e[0] == 'dash' and e[1] == seat:
                r['dash'] += 1; r['dash_' + win(t)] += 1
            if e[0] == 'catch':
                h, hu, v, vu, pos = e[1], e[2], e[3], e[4], e[5]
                rec = {'t': t, 'N': N}
                hd = held((v, vu), t)
                rec['held'] = bool(hd); rec['held_by'] = ('catcher' if any(by == h for _, by in hd) else 'third') if hd else ''
                rec['cool'] = cooling((v, vu), t); rec['fat'] = fatigue((v, vu), t)
                rec['vdash'] = (v, vu) in dd
                cl = cloud(pos, t)
                rec['cloud'] = 'victim' if v in cl else 'catcher' if h in cl else 'third' if cl else ''
                rec['hdash'] = (h, hu) in dd
                rec['strike'] = d(dd[(h, hu)][3], pos) if (h, hu) in dd else -1
                rec['hfat'] = fatigue((h, hu), t)
                rec['R'] = math.hypot(*pos)
                rec['vpow'] = [k for (x, k) in power[(v, vu)] if t - x in (0, 1)]
                rec['trade'] = 0 <= dead.get((h, hu), 999) - t <= 3
                if h == seat:
                    r['catch'] += 1; r['c_' + win(t)] += 1; L['catch'].append(rec)
                    if 'first' not in r: r['first'] = t
                if v == seat:
                    r['lost'] += 1; r['l_' + win(t)] += 1; L['loss'].append(rec)
            if e[0] == 'net' and e[1] == seat:
                u = (seat, e[2]); hits = e[5]
                hp = [x for x in hits if x[0] == prey]; hq = [x for x in hits if x[0] == pred]
                rec = {'t': t, 'N': N, 'flight': d(e[3], e[4]), 'tdash': u in dd,
                       'res': 'prey' if hp else 'pred' if hq else 'decoy' if e[6] else 'tree' if e[7] == 'tree' else 'miss'}
                if hp:
                    x = hp[0]
                    rec['vcool'] = cooling(x, t); rec['vfat'] = fatigue(x, t); rec['vdash'] = x in dd; rec['vheld'] = bool(held(x, t))
                    rec['conv'] = 0 < dead.get(x, 999) - t <= 5 or dead.get(x, 999) == t
                if hq:
                    x = hq[0]; rec['saved'] = not any(0 <= dead.get((seat, uu), 999) - t <= 5 for uu in range(seat * N, seat * N + N))
                rec['theld'] = bool(held(u, t))
                r['net'] += 1; r['net_' + win(t)] += 1; L['net'].append(rec)
                if t <= 3: r['net3'] += 1
            if e[0] == 'smoke' and e[1] == seat:
                u = (seat, e[2])
                r['smoke'] += 1; r['smoke_' + win(t)] += 1
                L['smoke'].append({'t': t, 'off': d(e[3], e[4]), 'theld': bool(held(u, t)), 'died': 0 <= dead.get(u, 999) - t <= 6})
            if e[0] == 'decoy' and e[1] == seat: r['decoy'] += 1
            if e[0] == 'destroy' and e[1] == seat and e[3] == prey: r['decoy_eaten'] += 1
            if e[0] == 'net' and e[1] == pred:
                for x in e[5]:
                    if x[0] != seat: continue
                    # our unit x is netted on turn t: what does it do on t+1 and t+2, and is it caught?
                    resp = [k for (tt, k) in power[x] if tt in (t + 1,)]
                    resp2 = [k for (tt, k) in power[x] if tt in (t + 1, t + 2, t + 3)]
                    same = [k for (tt, k) in power[x] if tt == t]
                    L['held'].append({'t': t, 'N': N, 'resp': resp[0] if resp else 'none', 'any': resp2[0] if resp2 else 'none', 'same': same[0] if same else '',
                                      'caught': 0 <= dead.get(x, 999) - t <= 6, 'again': len([1 for (tt, by) in netted[x] if tt < t]) > 0})
                    r['netted'] += 1
    r['nocatch15'] = 0 if (r['c_1-5'] + r['c_6-15']) else 1
    return r, L


def groups():
    G = collections.OrderedDict()
    us = []
    for sub in ('41748059', '41749025'):
        fn = 'E:/cg-tmp/tcf/gold/battles_%s.json' % sub
        if not os.path.exists(fn): continue
        for b in json.load(open(fn)):
            f = 'E:/cg-tmp/tcf/gold/games/%s.json' % b['game_id']
            if b.get('done') and os.path.exists(f): us.append((f, None))
    G['us (live)'] = us
    v10 = []
    fn = 'E:/cg-tmp/tcf/gold/battles_41743202.json'
    if os.path.exists(fn):
        for b in json.load(open(fn)):
            f = 'E:/cg-tmp/tcf/gold/games/%s.json' % b['game_id']
            if b.get('done') and os.path.exists(f): v10.append((f, None))
    G['v10'] = v10
    for name, dname in (('at 23', 'E:/cg-tmp/tcf/peer'), ('at 25', 'E:/cg-tmp/tcf/peer25')):
        idx = json.load(open(dname + '/peer_index.json')) if os.path.exists(dname + '/peer_index.json') else {}
        G[name] = [(dname + '/games/%s.json' % gid, ag) for gid, ag in idx.items() if os.path.exists(dname + '/games/%s.json' % gid)]
    return G


def load(G):
    out = collections.OrderedDict()
    for name, lst in G.items():
        rows = []; Ls = collections.defaultdict(list)
        for fn, ag in lst:
            try: g = json.load(open(fn))
            except Exception: continue
            if ag is None:
                me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
                if not me: continue
                seat = me[0]['index']
                if name == 'us (live)' and any((a.get('rank') or 999) <= 100 for a in g['agents'] if a['index'] != seat): continue
            else:
                s = [a['index'] for a in g['agents'] if a.get('agent_id') == ag]
                if not s: continue
                seat = s[0]
            r, L = study(g, seat); r['gid'] = 0
            rows.append(r)
            for k, v in L.items(): Ls[k] += v
        out[name] = (rows, Ls)
    return out


def pc(a, b): return ('%3.0f%%' % (100.0 * a / b)) if b else '   -'
def med(xs): xs = sorted(xs); return xs[len(xs) // 2] if xs else 0


def table(title, names, lines):
    print('\n## ' + title)
    print('%-52s' % '' + ''.join('%14s' % n for n in names))
    for lab, vals in lines:
        print('%-52s' % lab + ''.join('%14s' % v for v in vals))


if __name__ == '__main__':
    D = load(groups()); names = list(D.keys())
    S = lambda name, k: sum(r[k] for r in D[name][0])
    n = {x: max(1, len(D[x][0])) for x in names}
    f2 = lambda v: '%.2f' % v
    table('Result', names, [
        ('games', [len(D[x][0]) for x in names]),
        ('mean rank', [f2(S(x, 'rank') / n[x]) for x in names]),
        ('first', [pc(S(x, 'win'), n[x]) for x in names]),
        ('last', [pc(S(x, 'lastp'), n[x]) for x in names]),
        ('catches per game', [f2(S(x, 'catch') / n[x]) for x in names]),
        ('units lost per game', [f2(S(x, 'lost') / n[x]) for x in names]),
        ('no catch by turn 15', [pc(S(x, 'nocatch15'), n[x]) for x in names]),
        ('first catch, median turn', [med([r['first'] for r in D[x][0] if 'first' in r]) for x in names]),
    ] + [('catches in turns %s' % w, [f2(S(x, 'c_' + w) / n[x]) for x in names]) for w in WINS]
      + [('units lost in turns %s' % w, [f2(S(x, 'l_' + w) / n[x]) for x in names]) for w in WINS])
    table('By units per team: mean rank (games) / catches / lost', names, [
        ('%d units' % N, ['%.2f(%d)' % (sum(r['rank'] for r in q) / max(1, len(q)), len(q)) for q in [[r for r in D[x][0] if r['N'] == N] for x in names]]) for N in (3, 4, 5, 6)]
        + [('%d units: catches / lost' % N, ['%.2f/%.2f' % (sum(r['catch'] for r in q) / max(1, len(q)), sum(r['lost'] for r in q) / max(1, len(q))) for q in [[r for r in D[x][0] if r['N'] == N] for x in names]]) for N in (3, 4, 5, 6)])
    table('Dashes per 100 living unit-turns', names, [('all turns', [f2(100.0 * S(x, 'dash') / max(1, sum(S(x, 'ut_' + w) for w in WINS))) for x in names])]
          + [('turns %s' % w, [f2(100.0 * S(x, 'dash_' + w) / max(1, S(x, 'ut_' + w))) for x in names]) for w in WINS]
          + [('dashes per game', [f2(S(x, 'dash') / n[x]) for x in names])])
    C = {x: D[x][1]['catch'] for x in names}
    cc = lambda x, fn: pc(sum(1 for c in C[x] if fn(c)), len(C[x]))
    table('Our catches: state of the victim', names, [
        ('catches', [len(C[x]) for x in names]),
        ('victim held by a net', [cc(x, lambda c: c['held']) for x in names]),
        ('  ... net thrown by the third team', [cc(x, lambda c: c['held_by'] == 'third') for x in names]),
        ('victim not held, could not dash (cooldown)', [cc(x, lambda c: not c['held'] and c['cool']) for x in names]),
        ('victim not held, could dash, did not', [cc(x, lambda c: not c['held'] and not c['cool'] and not c['vdash']) for x in names]),
        ('victim not held, dashed and was still caught', [cc(x, lambda c: not c['held'] and c['vdash']) for x in names]),
        ('victim fatigue 3 or more (not held)', [cc(x, lambda c: not c['held'] and c['fat'] >= 3) for x in names]),
        ('inside the victim team\'s own cloud', [cc(x, lambda c: c['cloud'] == 'victim') for x in names]),
        ('inside our cloud', [cc(x, lambda c: c['cloud'] == 'catcher') for x in names]),
        ('inside the third team\'s cloud', [cc(x, lambda c: c['cloud'] == 'third') for x in names]),
        ('catcher dashed on the catch turn', [cc(x, lambda c: c['hdash']) for x in names]),
        ('  ... catcher fatigue before it, mean', [f2(sum(c['hfat'] for c in C[x] if c['hdash']) / max(1, sum(1 for c in C[x] if c['hdash']))) for x in names]),
        ('  ... dash start to catch point, median', [int(med([c['strike'] for c in C[x] if c['hdash']])) for x in names]),
        ('at radius over 6500', [cc(x, lambda c: c['R'] > 6500) for x in names]),
        ('victim used a power that turn or the one before', [cc(x, lambda c: bool(c['vpow'])) for x in names]),
        ('catcher lost within 3 turns', [cc(x, lambda c: c['trade']) for x in names]),
    ])
    perg = lambda x, fn: f2(sum(1 for c in C[x] if fn(c)) / n[x])
    table('Our catches per game by kind', names, [
        ('held by our net', [perg(x, lambda c: c['held_by'] == 'catcher') for x in names]),
        ('held by the third team\'s net', [perg(x, lambda c: c['held_by'] == 'third') for x in names]),
        ('not held, in the victim team\'s cloud', [perg(x, lambda c: not c['held'] and c['cloud'] == 'victim') for x in names]),
        ('not held, in our cloud', [perg(x, lambda c: not c['held'] and c['cloud'] == 'catcher') for x in names]),
        ('not held, no cloud, victim on cooldown', [perg(x, lambda c: not c['held'] and c['cloud'] not in ('victim', 'catcher') and c['cool']) for x in names]),
        ('not held, no cloud, victim could dash', [perg(x, lambda c: not c['held'] and c['cloud'] not in ('victim', 'catcher') and not c['cool']) for x in names]),
        ('made with a dash', [perg(x, lambda c: c['hdash']) for x in names]),
        ('made walking', [perg(x, lambda c: not c['hdash']) for x in names]),
    ])
    Lo = {x: D[x][1]['loss'] for x in names}
    lc = lambda x, fn: pc(sum(1 for c in Lo[x] if fn(c)), len(Lo[x]))
    lg = lambda x, fn: f2(sum(1 for c in Lo[x] if fn(c)) / n[x])
    table('Our losses: state of our unit', names, [
        ('losses', [len(Lo[x]) for x in names]),
        ('held by a net', [lc(x, lambda c: c['held']) for x in names]),
        ('not held, could not dash (cooldown)', [lc(x, lambda c: not c['held'] and c['cool']) for x in names]),
        ('not held, could dash, did not', [lc(x, lambda c: not c['held'] and not c['cool'] and not c['vdash']) for x in names]),
        ('not held, dashed and was still caught', [lc(x, lambda c: not c['held'] and c['vdash']) for x in names]),
        ('inside our own cloud', [lc(x, lambda c: c['cloud'] == 'victim') for x in names]),
        ('fatigue of the lost unit, mean', [f2(sum(c['fat'] for c in Lo[x]) / max(1, len(Lo[x]))) for x in names]),
        ('per game: held', [lg(x, lambda c: c['held']) for x in names]),
        ('per game: not held, on cooldown', [lg(x, lambda c: not c['held'] and c['cool']) for x in names]),
        ('per game: not held, could dash', [lg(x, lambda c: not c['held'] and not c['cool']) for x in names]),
        ('per game: in our own cloud', [lg(x, lambda c: c['cloud'] == 'victim') for x in names]),
    ])
    Nt = {x: D[x][1]['net'] for x in names}
    ng = lambda x, fn: f2(sum(1 for c in Nt[x] if fn(c)) / n[x])
    nc = lambda x, fn, base=None: pc(sum(1 for c in Nt[x] if fn(c)), sum(1 for c in Nt[x] if (base(c) if base else True)))
    lines = [('nets per game', [f2(len(Nt[x]) / n[x]) for x in names])]
    for w in ('1', '2-3', '4-10', '11-30', '31+'):
        inw = (lambda c, w=w: c['t'] == 1 if w == '1' else 2 <= c['t'] <= 3 if w == '2-3' else 4 <= c['t'] <= 10 if w == '4-10' else 11 <= c['t'] <= 30 if w == '11-30' else c['t'] > 30)
        lines.append(('turns %s: nets / hit prey / catches after' % w, ['%s/%s/%s' % (ng(x, inw), nc(x, lambda c: inw(c) and c['res'] == 'prey', inw).strip(), ng(x, lambda c: inw(c) and c.get('conv'))) for x in names]))
    lines += [
        ('result: prey', [nc(x, lambda c: c['res'] == 'prey') for x in names]),
        ('result: predator', [nc(x, lambda c: c['res'] == 'pred') for x in names]),
        ('result: decoy', [nc(x, lambda c: c['res'] == 'decoy') for x in names]),
        ('result: tree', [nc(x, lambda c: c['res'] == 'tree') for x in names]),
        ('result: nothing', [nc(x, lambda c: c['res'] == 'miss') for x in names]),
        ('prey hits that became a catch within 5 turns', [nc(x, lambda c: c.get('conv'), lambda c: c['res'] == 'prey') for x in names]),
        ('thrown on a turn the thrower dashed', [nc(x, lambda c: c['tdash']) for x in names]),
        ('  ... of those: hit prey', [nc(x, lambda c: c['tdash'] and c['res'] == 'prey', lambda c: c['tdash']) for x in names]),
        ('  ... not dashing: hit prey', [nc(x, lambda c: not c['tdash'] and c['res'] == 'prey', lambda c: not c['tdash']) for x in names]),
        ('prey hit: target on cooldown', [nc(x, lambda c: c.get('vcool'), lambda c: c['res'] == 'prey') for x in names]),
        ('prey hit: target dashed that turn', [nc(x, lambda c: c.get('vdash'), lambda c: c['res'] == 'prey') for x in names]),
        ('prey hit: target was already held', [nc(x, lambda c: c.get('vheld'), lambda c: c['res'] == 'prey') for x in names]),
        ('prey hit: flight distance, median', [int(med([c['flight'] for c in Nt[x] if c['res'] == 'prey'])) for x in names]),
        ('thrown by a unit that was held', [nc(x, lambda c: c['theld']) for x in names]),
        ('predator hit: no unit of ours lost in 5 turns', [nc(x, lambda c: c.get('saved'), lambda c: c['res'] == 'pred') for x in names]),
    ]
    table('Nets', names, lines)
    Sm = {x: D[x][1]['smoke'] for x in names}
    sc = lambda x, fn: pc(sum(1 for c in Sm[x] if fn(c)), len(Sm[x]))
    table('Smoke', names, [('smokes per game', [f2(len(Sm[x]) / n[x]) for x in names])]
          + [('turns %s per game' % w, [f2(S(x, 'smoke_' + w) / n[x]) for x in names]) for w in WINS]
          + [('centre within 500 of the thrower', [sc(x, lambda c: c['off'] <= 500) for x in names]),
             ('centre 500 to 1500 away', [sc(x, lambda c: 500 < c['off'] <= 1500) for x in names]),
             ('centre over 1500 away', [sc(x, lambda c: c['off'] > 1500) for x in names]),
             ('thrower was held', [sc(x, lambda c: c['theld']) for x in names]),
             ('thrower caught within 6 turns', [sc(x, lambda c: c['died']) for x in names]),
             ('  ... when the centre is within 500', [pc(sum(1 for c in Sm[x] if c['died'] and c['off'] <= 500), sum(1 for c in Sm[x] if c['off'] <= 500)) for x in names]),
             ('  ... when it is over 1500 away', [pc(sum(1 for c in Sm[x] if c['died'] and c['off'] > 1500), sum(1 for c in Sm[x] if c['off'] > 1500)) for x in names]),
             ('decoys per game', [f2(S(x, 'decoy') / n[x]) for x in names]),
             ('prey decoys we walked into, per game', [f2(S(x, 'decoy_eaten') / n[x]) for x in names])])
    H = {x: D[x][1]['held'] for x in names}
    hc = lambda x, fn: pc(sum(1 for c in H[x] if fn(c)), len(H[x]))
    lines = [('our units netted by the predator team, per game', [f2(len(H[x]) / n[x]) for x in names]),
             ('caught within 6 turns', [hc(x, lambda c: c['caught']) for x in names])]
    for k in ('net', 'smoke', 'decoy', 'none'):
        lines.append(('answer on the next turn: %s (share; then caught)' % k, ['%s;%s' % (hc(x, lambda c: c['resp'] == k).strip(), pc(sum(1 for c in H[x] if c['resp'] == k and c['caught']), sum(1 for c in H[x] if c['resp'] == k)).strip()) for x in names]))
    table('When one of our units is netted by the predator team', names, lines)
