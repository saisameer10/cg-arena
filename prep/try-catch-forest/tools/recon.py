# usage: python recon.py <game.json> <seat> <from> <to>
# Rebuilds unit positions of a plain arena log by dead reckoning (no trees known): every unit walks 600 (dash 1200)
# towards its command target; the referee's position reports (dash from, power at, catch at) re-anchor it.
# Prints, per turn, our units with their order and the prey / predator units around them.
import json, sys, re, math, collections

g = json.load(open(sys.argv[1])); seat = int(sys.argv[2]); a0 = int(sys.argv[3]); a1 = int(sys.argv[4])
turns = collections.defaultdict(lambda: {'cmd': {}, 'sum': []})
t = 0; last = -1
for f in g['frames']:
    a = f.get('agent')
    if a is None: continue
    if last == -1 or a <= last: t += 1
    last = a
    turns[t]['cmd'][a] = f.get('stdout') or ''
    for s in (f.get('summary') or '').split('\n'):
        if s: turns[t]['sum'].append(s)
T = t
ids = [int(c.split()[1]) for c in turns[1]['cmd'][0].split(';') if c.split()[0] in ('MOVE', 'DASH')]
N = max(ids) + 1
def rot(p, k):
    a = 2 * math.pi / 3 * k; return (p[0] * math.cos(a) - p[1] * math.sin(a), p[0] * math.sin(a) + p[1] * math.cos(a))
start = {}
for s in turns[1]['sum']:
    m = re.match(r"\$(\d)'s agent (\d+) dashes from \((-?\d+), (-?\d+)\)", s)
    if m:
        o = int(m.group(1)); u = int(m.group(2)); p = (int(m.group(3)), int(m.group(4)))
        for o2 in range(3): start.setdefault(o2 * N + u % N, rot(p, o2 - o))
pos = {u: start.get(u) for u in range(3 * N)}
dead = {}; frozen = collections.defaultdict(int); err = []; hist = {}; fixn = collections.Counter()
smokes = []   # (x, y, turn deployed)
for t in range(1, T + 1):
    S = turns[t]['sum']
    for s in S:   # position at the start of the turn
        m = re.match(r"\$(\d)'s agent (\d+) dashes from \((-?\d+), (-?\d+)\)", s)
        if m:
            u = int(m.group(2)); p = (int(m.group(3)), int(m.group(4)))
            if pos[u] is not None and u not in dead: err.append((t, u, math.hypot(pos[u][0] - p[0], pos[u][1] - p[1])))
            pos[u] = p; fixn[u] += 1
    hist[t] = dict(pos)
    cmds = {}
    for a in range(3):
        for c in turns[t]['cmd'].get(a, '').split(';'):
            w = c.split()
            if len(w) >= 4 and w[0] in ('MOVE', 'DASH'): cmds[int(w[1])] = (w[0], float(w[2]), float(w[3]), w[4] if len(w) > 4 else '')
    for u in range(3 * N):
        if frozen[u] > 0: frozen[u] -= 1; continue
        if pos[u] is None or u not in cmds: continue
        k, x, y, _ = cmds[u]; d = math.hypot(x - pos[u][0], y - pos[u][1]); sp = 1200 if k == 'DASH' else 600
        if d > sp: x = pos[u][0] + (x - pos[u][0]) * sp / d; y = pos[u][1] + (y - pos[u][1]) * sp / d
        r = math.hypot(x, y)
        if r > 7780: x *= 7780 / r; y *= 7780 / r
        pos[u] = (x, y)
    for s in S:   # positions after the move
        m = re.match(r"\$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\) (throws a net|deploys smoke|deploys a decoy)", s)
        if m:
            u = int(m.group(2)); p = (int(m.group(3)), int(m.group(4)))
            if pos[u] is not None and u not in dead: err.append((t, u, math.hypot(pos[u][0] - p[0], pos[u][1] - p[1])))
            pos[u] = p; fixn[u] += 1
            m2 = re.search(r"deploys smoke at \((-?\d+), (-?\d+)\)", s)
            if m2: smokes.append((int(m2.group(1)), int(m2.group(2)), t))
        m = re.search(r"and nets (.*)$", s)
        if m:
            for x in re.findall(r"agent (\d+)", m.group(1)): frozen[int(x)] = 4
        m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\)", s)
        if m:
            dead[int(m.group(4))] = t
    hist[t + 1] = dict(pos)
    if a0 <= t <= a1:
        P = hist[t]
        print('\n=== turn %d' % t)
        for s in S: print('   ref:', s)
        live = [(x, y, tt) for x, y, tt in smokes if t - tt < 9 and tt < t]
        if live: print('   smoke clouds:', ', '.join('(%d,%d) since %d' % q for q in live))
        mine = range(seat * N, seat * N + N); prey = range(((seat + 1) % 3) * N, ((seat + 1) % 3) * N + N); pred = range(((seat + 2) % 3) * N, ((seat + 2) % 3) * N + N)
        for u in mine:
            if P[u] is None: continue
            c = cmds.get(u); tag = 'GHOST' if u in dead and dead[u] < t else ''
            line = '  me %d at (%d,%d) R %d %s' % (u, P[u][0], P[u][1], math.hypot(*P[u]), tag)
            if c: line += '  -> %s (%d,%d) %s  [step %d, new R %d]' % (c[0], c[1], c[2], c[3], math.hypot(c[1] - P[u][0], c[2] - P[u][1]), math.hypot(hist[t + 1][u][0], hist[t + 1][u][1]))
            print(line)
            if u in dead and dead[u] < t: continue
            for nm, grp in (('prey', prey), ('PRED', pred)):
                q = sorted((math.hypot(P[v][0] - P[u][0], P[v][1] - P[u][1]), v) for v in grp if P[v] is not None and not (v in dead and dead[v] < t))
                print('        %s: ' % nm + ', '.join('%d at (%d,%d) d %d%s' % (v, P[v][0], P[v][1], d, ' NETTED' if frozen[v] > 0 else '') for d, v in q))
        for a in range(3):
            if a != seat: print('   seat %d: %s' % (a, turns[t]['cmd'].get(a, '')))
e = sorted(x[2] for x in err)
print('\nposition reports checked: %d, median error %d, p90 %d, max %d' % (len(e), e[len(e) // 2], e[9 * len(e) // 10], e[-1]))
print('units caught:', dead)
