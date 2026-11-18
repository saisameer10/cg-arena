# Shared parser for the mimic study (Try Catch Forest). Python port of research/lib/parse.js with an exact dash
# cooldown model. Works on CodinGame game logs and on logs written by sim/SimLog.java (same JSON shape).
#
# Positions are reconstructed from the referee's text: a unit's position is printed when it dashes or sends a decoy
# (before its move), when it throws a net or smoke (after its move) and where it is caught. Between such anchors the
# position is simulated from the unit's own MOVE/DASH orders (600 / 1200 per turn, trees ignored), so it drifts;
# every position carries its age (turns since the last anchor). Start positions use the 120-degree symmetry.
import json, re, math, glob, os

MOVE, DASH, RMAX, NET_HOLD, MAXAGE = 600.0, 1200.0, 7780.0, 4, 30
PT = re.compile(r'\((-?\d+), (-?\d+)\)')
CMD = re.compile(r'^(MOVE|DASH|NET|SMOKE|DECOY)\s+(\d+)\s+(-?\d+)\s+(-?\d+)\s*(.*)$')
R_DASH = re.compile(r"^\$(\d)'s agent (\d+) dashes from")
R_NET = re.compile(r"^\$(\d)'s agent (\d+) at .* throws a net at")
R_SMOKE = re.compile(r"^\$(\d)'s agent (\d+) at .* deploys smoke at")
R_DECOY = re.compile(r"^\$(\d)'s agent (\d+) at .* deploys a decoy towards")
R_CATCH = re.compile(r"^\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+) at")
R_HIT = re.compile(r"\$(\d)'s (agents?|decoys?) ([\d, ]+)")


def dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])


def clamp(p):
    r = math.hypot(p[0], p[1])
    return (p[0] * RMAX / r, p[1] * RMAX / r) if r > RMAX else p


def step(p, t, s):
    d = dist(p, t)
    if d <= s: return (float(t[0]), float(t[1]))
    return clamp((p[0] + (t[0] - p[0]) * s / d, p[1] + (t[1] - p[1]) * s / d))


def rot(p, k):
    a = k * 2 * math.pi / 3; c, s = math.cos(a), math.sin(a)
    return (p[0] * c - p[1] * s, p[0] * s + p[1] * c)


def ang(v, r):
    """Angle in degrees (0..180) between vectors v and r; None if one is (almost) zero."""
    lv, lr = math.hypot(*v), math.hypot(*r)
    if lv < 30 or lr < 1: return None
    c = (v[0] * r[0] + v[1] * r[1]) / (lv * lr)
    return math.degrees(math.acos(max(-1.0, min(1.0, c))))


def seg_dist(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]; l2 = dx * dx + dy * dy
    if l2 < 1e-9: return dist(p, a)
    t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2; t = max(0.0, min(1.0, t))
    return math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dy * t)


class Turn:
    __slots__ = ('cmd', 'items', 'dash', 'at', 'at_post', 'nets', 'smokes', 'decoys', 'catches', 'out')

    def __init__(self):
        self.cmd = {}; self.items = []; self.dash = {}; self.at = {}; self.at_post = {}
        self.nets = []; self.smokes = []; self.decoys = []; self.catches = []; self.out = ['', '', '']


class Game:
    pass


def parse(g):
    if not g or 'frames' not in g or len(g.get('agents', [])) != 3 or 'ranking' not in g: return None
    T = [None]; turn = 0; prev = 99
    for fr in g['frames']:
        a = fr.get('agent')
        if a is None: continue
        if a <= prev: turn += 1; T.append(Turn())
        prev = a; o = T[turn]
        so = fr.get('stdout')
        if so is not None:
            o.out[a] = so
            for c in so.split(';'):
                m = CMD.match(c.strip())
                if not m: continue
                e = (m.group(1), int(m.group(2)), int(m.group(3)), int(m.group(4)), a)
                if e[0] in ('MOVE', 'DASH'): o.cmd[e[1]] = e
                else: o.items.append(e)
        for line in (fr.get('summary') or '').split('\n'):
            line = line.strip()
            if not line: continue
            p = [(int(x), int(y)) for x, y in PT.findall(line)]
            m = R_DASH.match(line)
            if m: o.dash[int(m.group(2))] = (p[0], p[1]); continue
            m = R_NET.match(line)
            if m:
                n = {'u': int(m.group(2)), 'owner': int(m.group(1)), 'from': p[0], 'land': p[1], 'aim': p[2] if len(p) >= 3 else p[1], 'units': [], 'decoys': 0, 'miss': None}
                tail = line.split(' and nets ')
                if len(tail) > 1:
                    for h in R_HIT.finditer(tail[1]):
                        ids = [int(x) for x in re.findall(r'\d+', h.group(3))]
                        if h.group(2)[0] == 'a': n['units'] += ids
                        else: n['decoys'] += len(ids)
                else: n['miss'] = 'tree' if 'stopped by tree' in line else 'aim' if 'stopped by aim' in line else 'other'
                o.nets.append(n); o.at_post[n['u']] = n['from']; continue
            m = R_SMOKE.match(line)
            if m: o.smokes.append({'u': int(m.group(2)), 'owner': int(m.group(1)), 'at': p[0], 'target': p[1]}); o.at_post[int(m.group(2))] = p[0]; continue
            m = R_DECOY.match(line)
            if m: o.decoys.append({'u': int(m.group(2)), 'owner': int(m.group(1)), 'at': p[0], 'target': p[1]}); o.at[int(m.group(2))] = p[0]; continue
            m = R_CATCH.match(line)
            if m: o.catches.append({'by': int(m.group(2)), 'byOwner': int(m.group(1)), 'v': int(m.group(4)), 'vOwner': int(m.group(3)), 'pos': p[0]}); continue
    turns = len(T) - 1
    if turns < 1: return None
    N = 0
    for a in range(3):
        ids = set(e[1] for e in T[1].cmd.values() if e[4] == a) | set(e[1] for e in T[1].items if e[4] == a)
        N = max(N, len(ids))
    if N == 0: return None
    # some bots do not order every unit on turn 1: the highest id seen in the game fixes N
    mx = 0
    for t in range(1, turns + 1):
        for u in T[t].cmd: mx = max(mx, u)
    N = max(N, (mx + 3) // 3)
    U = 3 * N
    G = Game(); G.N = N; G.U = U; G.turns = turns; G.T = T
    G.caught = [0] * U; G.caught_by = [-1] * U; G.net_hits = [[] for _ in range(U)]; G.dash_turns = [[] for _ in range(U)]
    for t in range(1, turns + 1):
        for c in T[t].catches:
            if c['v'] < U and not G.caught[c['v']]: G.caught[c['v']] = t; G.caught_by[c['v']] = c['by']
        for n in T[t].nets:
            for v in n['units']:
                if v < U: G.net_hits[v].append(t)
        for u in T[t].dash:
            if u < U: G.dash_turns[u].append(t)
    # positions at the start of each turn: P[t][u] = (x, y, age) or None; P[turns + 1] = after the last turn
    P = [[None] * U for _ in range(turns + 2)]
    cur = [None] * U; age = [0] * U
    for t in range(1, turns + 1):
        o = T[t]
        for u in range(U):
            a = o.dash[u][0] if u in o.dash else o.at.get(u)
            if a: cur[u] = (float(a[0]), float(a[1])); age[u] = 0
            if cur[u]: P[t][u] = (cur[u][0], cur[u][1], age[u])
        for u in range(U):
            if not cur[u]: continue
            c = o.cmd.get(u)
            if c and not G_netted(G, u, t): cur[u] = step(cur[u], (c[2], c[3]), DASH if u in o.dash else MOVE)
            age[u] += 1
        for u, a in o.at_post.items():
            if u < U: cur[u] = (float(a[0]), float(a[1])); age[u] = 0
        for n in o.nets:
            for v in n['units']:
                if v < U: cur[v] = (float(n['land'][0]), float(n['land'][1])); age[v] = 1
        for c in o.catches:
            if c['v'] < U: cur[c['v']] = (float(c['pos'][0]), float(c['pos'][1])); age[c['v']] = 0
    for u in range(U):
        if cur[u]: P[turns + 1][u] = (cur[u][0], cur[u][1], age[u])
    for u in range(U):                                    # back-fill before the first anchor
        k = 1
        while k <= turns and not P[k][u]: k += 1
        if k > turns or k == 1: continue
        q = (P[k][u][0], P[k][u][1])
        for t in range(k - 1, 0, -1):
            c = T[t].cmd.get(u)
            if not c: break
            d = dist(q, (c[2], c[3]))
            if d < 1: break
            s = DASH if u in T[t].dash else MOVE
            q = clamp((q[0] - (c[2] - q[0]) * s / d, q[1] - (c[3] - q[1]) * s / d))
            P[t][u] = (q[0], q[1], k - t)
    G.P = P
    # start positions through the symmetry (best-known of the three rotated copies)
    S = [None] * U
    for j in range(N):
        best = None; bp = 0; ba = 99
        for p in range(3):
            x = P[1][p * N + j]
            if x and x[2] < ba: ba = x[2]; best = (x[0], x[1]); bp = p
        if best:
            for p in range(3): S[p * N + j] = rot(best, p - bp)
    G.S = S
    G.names = [a.get('name') for a in g['agents']]; G.agent_ids = [a.get('agent_id') for a in g['agents']]
    G.rank = [g['ranking'].index(i) + 1 for i in range(3)]; G.scores = g.get('scores'); G.id = g.get('game_id')
    return G


def G_netted(G, u, t): return any(n < t <= n + NET_HOLD for n in G.net_hits[u])


def owner(G, u): return u // G.N
def alive(G, u, t): return not G.caught[u] or G.caught[u] >= t          # alive at the start of turn t
def netted(G, u, t): return G_netted(G, u, t)                           # cannot move on turn t


def dash_ready(G, u, t):
    """True if the unit may dash on turn t: its k-th dash on turn d blocks turns d+1 .. d+k."""
    k = 0
    for d in G.dash_turns[u]:
        if d >= t: break
        k += 1
        if t <= d + k: return False
    return True


def dashes_before(G, u, t): return sum(1 for d in G.dash_turns[u] if d < t)


def pos(G, t, u):
    if t < 1 or t > G.turns + 1: return None
    x = G.P[t][u]
    return (x[0], x[1]) if x and x[2] <= MAXAGE else None


def units_of(G, team): return range(team * G.N, team * G.N + G.N)


def nearest(G, t, p, team, need_alive=True):
    """Nearest unit of `team` to point p at the start of turn t: (unit, distance, position) or None."""
    best = None
    for v in units_of(G, team):
        if need_alive and not alive(G, v, t): continue
        q = pos(G, t, v)
        if not q: continue
        d = dist(p, q)
        if best is None or d < best[1]: best = (v, d, q)
    return best


INDEX = os.environ.get('MIMIC_INDEX', 'E:/cg-tmp/tcf/mimic/index.json')


def _index(dirs):
    """file -> [[name, agent_id] x 3], cached on disk: opening 2,400 logs takes two minutes, the index two seconds."""
    try:
        with open(INDEX, encoding='utf-8') as fh: idx = json.load(fh)
    except (ValueError, OSError): idx = {}
    changed = False; files = []
    for d in dirs:
        for fn in sorted(glob.glob(os.path.join(d, '*.json'))):
            fn = fn.replace(os.sep, '/'); files.append(fn)
            if fn in idx: continue
            try:
                with open(fn, encoding='utf-8') as fh: raw = json.load(fh)
                idx[fn] = [[a.get('name'), a.get('agent_id')] for a in (raw.get('agents') or [])]
            except (ValueError, OSError): continue
            changed = True
    if changed:
        try:
            with open(INDEX, 'w', encoding='utf-8') as fh: json.dump(idx, fh)
        except OSError: pass
    return idx, files


def load_games(dirs, name=None, agent_ids=None, limit=None):
    """Yields (Game, seat) for every game in the folders where a seat matches the squad name (and agent id)."""
    idx, files = _index(dirs)
    seen = set(); n = 0
    for fn in files:
        b = os.path.basename(fn)
        if b in seen: continue
        seen.add(b)
        ags = idx.get(fn) or []
        if len(ags) != 3: continue
        seats = [i for i, a in enumerate(ags) if (name is None or a[0] == name) and (not agent_ids or a[1] in agent_ids)]
        if not seats: continue
        try:
            with open(fn, encoding='utf-8') as fh: raw = json.load(fh)
        except (ValueError, OSError): continue
        G = parse(raw)
        if not G: continue
        G.file = fn
        for s in seats:
            yield G, s
        n += 1
        if limit and n >= limit: return


def quant(arr, p):
    if not arr: return float('nan')
    s = sorted(arr); return s[min(len(s) - 1, int(p * len(s)))]


def med(arr): return quant(arr, 0.5)
def pc(a, b): return '%3d%% (%d)' % (round(100.0 * a / b), b) if b else '   - (0)'
def q3(arr): return '%s / %s / %s (%d)' % (fmt(quant(arr, .25)), fmt(med(arr)), fmt(quant(arr, .75)), len(arr)) if arr else '- (0)'
def fmt(x): return '-' if x != x else str(int(round(x)))
