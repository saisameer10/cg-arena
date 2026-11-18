# Rule measurements for the mimic study: everything the rule book (kb/mimic.md) quotes about one team.
#   python mimic_measure.py --name "Les Gens Bons" --agent 6894245 <dir> [<dir> ...]
# All distances and angles come from positions reconstructed by mimic_lib.py (truth, not what the team saw):
# "predator within X" means the nearest living predator unit, visible to the team or not.
import sys, argparse, math, collections
sys.path.insert(0, __import__('os').path.dirname(__file__))
from mimic_lib import *

PB = [0, 800, 1200, 1600, 2000, 2600, 3500, 99999]          # predator distance bands
QB = [0, 1000, 1600, 2200, 3500, 99999]                     # prey distance bands
OB = [0, 1500, 2000, 2500, 3500, 99999]                     # opening bands


def band(d, edges):
    if d is None: return 'unknown'
    for i in range(len(edges) - 1):
        if edges[i] <= d < edges[i + 1]: return ('%d-%d' % (edges[i], edges[i + 1])) if edges[i + 1] < 99999 else ('%d+' % edges[i])
    return 'unknown'


class Tab:
    def __init__(self, title): self.title = title; self.c = collections.OrderedDict(); self.cols = []
    def add(self, row, col, yes):
        if col not in self.cols: self.cols.append(col)
        x = self.c.setdefault(row, {}).setdefault(col, [0, 0]); x[1] += 1; x[0] += 1 if yes else 0
    def show(self, order=None):
        print('\n### ' + self.title)
        rows = list(self.c.keys())
        if order: rows = sorted(rows, key=lambda r: order.index(r) if r in order else 99)
        print('%-34s' % '' + ''.join('%22s' % c for c in self.cols))
        for r in rows:
            print('%-34s' % str(r) + ''.join('%22s' % (pc(*self.c[r][c]) if c in self.c[r] else '-') for c in self.cols))


class Lists:
    def __init__(self): self.d = collections.OrderedDict()
    def push(self, k, v):
        if v is not None: self.d.setdefault(k, []).append(v)
    def show(self, title):
        print('\n### ' + title + '   (q25 / median / q75 (cases))')
        for k, v in self.d.items(): print('%-78s %s' % (k, q3(v)))


def bl(edges): return [band(e, edges) for e in edges[:-1]] + ['unknown']


def measure(games):
    T_open = {t: Tab('Turn %d: free living units by distance of the nearest predator (turn 1: start positions)' % t) for t in range(1, 7)}
    T_openq = {t: Tab('Turn %d: units whose nearest predator is beyond 2500, by distance of the nearest prey' % t) for t in (1, 2, 3)}
    T_mid = Tab('Turns 7+: free living units, rows = nearest predator, share moving AWAY from it (within 60 deg), by nearest prey (columns)')
    T_midq = Tab('Turns 7+: same cells, share moving TOWARD the nearest prey (within 45 deg)')
    T_midd = Tab('Turns 7+: same cells, share DASHING (dash ready only)')
    T_mids = Tab('Turns 7+: share that does not move (order within 60 of the unit, or no order)')
    T_pdr = Tab('Turns 7+: predator within 1600, by the state of its dash and ours')
    T_dash = Tab('Turns 7+: dash share when ready, by situation')
    T_dkind = Tab('Dashes of living units by purpose (turn bands)')
    T_tgt = Tab('Targets: unit heading at a prey (within 30 deg, prey within 4000)')
    T_net = Tab('Nets per 100 free living unit-turns: prey at the given distance (rows) by state of the prey (columns)')
    T_netp = Tab('Nets per 100 unit-turns at a PREDATOR at the given distance, by state')
    T_netm = Tab('Nets: facts by target kind')
    T_smoke = Tab('Smoke per 100 unit-turns by nearest predator distance (columns: turn band)')
    T_smf = Tab('Smoke facts')
    T_decoy = Tab('Decoys per 100 unit-turns by nearest predator distance (columns: turn band)')
    T_dcf = Tab('Decoy facts')
    T_held = Tab('Held units (first turn of the hold)')
    T_after = Tab('After a net of ours hit prey: what our units do on the next turn')
    T_ord = Tab('Order-target convention (distance from the unit to the point it orders)')
    T_seek = Tab('No prey within 2500: where the unit goes')
    T_wall = Tab('Wall: units beyond radius 6500')
    L = Lists(); Ls = Lists(); Ld = Lists(); Lo = Lists(); Ln = Lists()
    ng = 0; hunters = collections.Counter(); dashk = collections.Counter(); dturn = collections.Counter(); dn = 0
    first_net_owner_turn = []
    for G, s in games:
        ng += 1; prey = (s + 1) % 3; pred = (s + 2) % 3; mine = list(units_of(G, s))
        for t in range(1, G.turns + 1):
            o = G.T[t]
            heading_at = collections.Counter()
            for u in mine:
                if not alive(G, u, t): continue
                p = G.S[u] if t == 1 and G.S[u] else pos(G, t, u)
                if not p: continue
                held = netted(G, u, t)
                c = o.cmd.get(u); v = (c[2] - p[0], c[3] - p[1]) if c else (0, 0)
                still = math.hypot(*v) < 60
                dashed = u in o.dash; ready = dash_ready(G, u, t)
                if t == 1:
                    nP = min(((dist(p, G.S[w]), w, G.S[w]) for w in units_of(G, pred) if G.S[w]), default=None)
                    nQ = min(((dist(p, G.S[w]), w, G.S[w]) for w in units_of(G, prey) if G.S[w]), default=None)
                    nP = (nP[1], nP[0], nP[2]) if nP else None; nQ = (nQ[1], nQ[0], nQ[2]) if nQ else None
                else:
                    nP = nearest(G, t, p, pred); nQ = nearest(G, t, p, prey)
                dP = nP[1] if nP else None; dQ = nQ[1] if nQ else None
                aP = ang(v, (p[0] - nP[2][0], p[1] - nP[2][1])) if nP else None          # 0 = straight away from the predator
                aQ = ang(v, (nQ[2][0] - p[0], nQ[2][1] - p[1])) if nQ else None          # 0 = straight at the prey
                aC = ang(v, (-p[0], -p[1]))                                              # 0 = at the centre
                item = 'net' if any(n['u'] == u and n['owner'] == s for n in o.nets) else 'smoke' if any(x['u'] == u for x in o.smokes) else 'decoy' if any(x['u'] == u for x in o.decoys) else ''
                # ---------------- held units
                if held:
                    if not netted(G, u, t - 1):
                        T_held.add('uses a net', 'share', item == 'net'); T_held.add('uses smoke', 'share', item == 'smoke'); T_held.add('sends a decoy', 'share', item == 'decoy')
                        T_held.add('caught within 4 turns', 'share', bool(G.caught[u]) and G.caught[u] <= t + 3)
                        if dP is not None: T_held.add('predator within 1500', 'share', dP < 1500)
                        mates = [(dist(pos(G, t, m), p), m) for m in mine if m != u and alive(G, m, t) and pos(G, t, m)]
                        if mates and nP:
                            md, m = min(mates)
                            if md < 3000:
                                pm = pos(G, t, m); cm = o.cmd.get(m)
                                if cm:
                                    am = ang((cm[2] - pm[0], cm[3] - pm[1]), (p[0] - pm[0], p[1] - pm[1]))
                                    if am is not None: T_held.add('nearest mate (within 3000) moves toward the held unit (45 deg)', 'share', am < 45)
                                T_held.add('a team mate nets a predator this turn or the next', 'share', any(n['owner'] == s and n['u'] != u and any(owner(G, x) == pred for x in n['units'] if x < G.U) for tt in (t, t + 1) if tt <= G.turns for n in G.T[tt].nets))
                    continue
                # ---------------- opening
                if t <= 6:
                    r = band(dP, OB); tb = T_open[t]
                    if ready: tb.add(r, 'dash (if ready)', dashed)
                    if aP is not None:
                        tb.add(r, 'away <60', aP < 60); tb.add(r, 'toward pred >120', aP > 120)
                    if aQ is not None: tb.add(r, 'at prey <45', aQ < 45)
                    tb.add(r, 'still', still); tb.add(r, 'smoke', item == 'smoke'); tb.add(r, 'decoy', item == 'decoy'); tb.add(r, 'net', item == 'net')
                    if t in T_openq and dP is not None and dP >= 2500:
                        r2 = band(dQ, QB)
                        if ready: T_openq[t].add(r2, 'dash (if ready)', dashed)
                        if aQ is not None: T_openq[t].add(r2, 'at prey <45', aQ < 45)
                        if aC is not None: T_openq[t].add(r2, 'at centre <45', aC < 45)
                        T_openq[t].add(r2, 'net', item == 'net'); T_openq[t].add(r2, 'decoy', item == 'decoy')
                    if t == 1 and dP is not None and dP < 2000 and aP is not None:
                        L.push('t1, predator start under 2000: angle off straight-away (deg)', aP)
                        if aQ is not None: L.push('t1, predator start under 2000: angle off nearest prey (deg)', aQ)
                        L.push('t1, predator start under 2000: angle off the centre (deg)', aC)
                # ---------------- middle game
                if t >= 7:
                    rp = band(dP, PB); cq = band(dQ, QB)
                    if aP is not None: T_mid.add(rp, cq, aP < 60)
                    if aQ is not None: T_midq.add(rp, cq, aQ < 45)
                    if ready: T_midd.add(rp, cq, dashed)
                    T_mids.add(rp, cq, still)
                    if dP is not None and dP < 1600 and nP:
                        pr = dash_ready(G, nP[0], t) and not netted(G, nP[0], t)
                        st = ('pred held' if netted(G, nP[0], t) else 'pred dash ready' if pr else 'pred no dash') + (', ours ready' if ready else ', ours not')
                        T_pdr.add(band(dP, PB), st + ': dash', dashed)
                        if aP is not None: T_pdr.add(band(dP, PB), st + ': away', aP < 60)
                    if ready and nQ and dQ < 2200 and aQ is not None:
                        qs = 'prey held' if netted(G, nQ[0], t) else 'prey dash ready' if dash_ready(G, nQ[0], t) else 'prey no dash'
                        if dP is None or dP > 2000: T_dash.add('prey %s, no predator within 2000' % band(dQ, [0, 600, 1000, 1300, 1600, 2200]), qs, dashed)
                    if ready and nP and dP < 2000 and (dQ is None or dQ > 2200):
                        T_dash.add('pred %s, no prey within 2200' % band(dP, PB), 'pred dash ready' if dash_ready(G, nP[0], t) else 'pred no dash', dashed)
                    if ready and (dP is None or dP > 2600) and (dQ is None or dQ > 2200):
                        T_dash.add('nobody near (pred > 2600, prey > 2200)', 'all', dashed)
                    if dQ is None or dQ > 2500:
                        if dP is None or dP > 2500:
                            if aQ is not None: T_seek.add('no predator within 2500', 'at nearest prey <45', aQ < 45)
                            if aC is not None: T_seek.add('no predator within 2500', 'at centre <45', aC < 45)
                            T_seek.add('no predator within 2500', 'still', still)
                            T_seek.add('no predator within 2500', 'radius > 5000', math.hypot(*p) > 5000)
                    if math.hypot(*p) > 6500:
                        if aC is not None:
                            T_wall.add('predator ' + band(dP, [0, 2000, 3500, 99999]), 'heads inward (<60 of centre)', aC < 60)
                            T_wall.add('predator ' + band(dP, [0, 2000, 3500, 99999]), 'along the wall (60-120)', 60 <= aC <= 120)
                # ---------------- dashes by purpose
                if dashed:
                    dn += 1; dturn[t] += 1
                    kind = 'attack (prey within 2000, within 45 deg)' if (dQ is not None and dQ < 2000 and aQ is not None and aQ < 45) else 'flee (predator within 2000, away within 75 deg)' if (dP is not None and dP < 2000 and aP is not None and aP < 75) else 'travel'
                    tbn = 't1-6' if t <= 6 else 't7-30' if t <= 30 else 't31+'
                    for kk in ('attack (prey within 2000, within 45 deg)', 'flee (predator within 2000, away within 75 deg)', 'travel'): T_dkind.add(kk, tbn, kk == kind)
                    if kind.startswith('attack'):
                        Ld.push('attack dash: distance to the prey', dQ)
                    elif kind.startswith('flee'): Ld.push('flee dash: distance to the predator', dP)
                    else:
                        Ld.push('travel dash: distance to nearest prey', dQ); Ld.push('travel dash: distance to nearest predator', dP)
                        if aQ is not None: T_dkind.add('travel dash heads at nearest prey (45 deg)', tbn, aQ < 45)
                    Ld.push('dash: number of this dash for the unit', dashes_before(G, u, t) + 1)
                # ---------------- targets
                if c and not still and t >= 2:
                    best = None
                    cands = [(dist(p, pos(G, t, w)), w) for w in units_of(G, prey) if alive(G, w, t) and pos(G, t, w)]
                    cands.sort()
                    for rank, (d, w) in enumerate(cands):
                        if d > 4000: break
                        a = ang(v, (pos(G, t, w)[0] - p[0], pos(G, t, w)[1] - p[1]))
                        if a is not None and a < 30 and (best is None or a < best[0]): best = (a, w, rank, d)
                    if cands and cands[0][0] < 4000 and (dP is None or dP > 2000):
                        T_tgt.add('unit with prey within 4000 and no predator within 2000', 'heads at some prey', best is not None)
                    if best:
                        heading_at[best[1]] += 1
                        T_tgt.add('unit heading at a prey', 'it is the nearest prey', best[2] == 0)
                        heldq = [w for d, w in cands if d < 3000 and netted(G, w, t)]
                        if heldq and not netted(G, cands[0][1], t): T_tgt.add('a held prey within 3000 that is not the nearest', 'heads at the held one', best[1] in heldq)
                        # order convention when hunting
                        od = math.hypot(*v)
                        Lo.push('hunting (heading at prey within 30 deg): order distance minus prey distance', od - best[3])
                # ---------------- order convention
                if c and not still:
                    od = math.hypot(*v)
                    k = 'DASH' if dashed else 'MOVE'
                    T_ord.add(k, 'under 550', od < 550); T_ord.add(k, '550-650', 550 <= od <= 650); T_ord.add(k, '650-1150', 650 < od < 1150); T_ord.add(k, '1150-1250', 1150 <= od <= 1250); T_ord.add(k, 'over 1250', od > 1250)
                    if t >= 7 and dP is not None and dP < 1600 and aP is not None and aP < 60: Lo.push('fleeing (predator within 1600, away): order distance', od)
                # ---------------- rates of items by situation
                if t >= 2:
                    tb3 = 't2-5' if t <= 5 else 't6-20' if t <= 20 else 't21+'
                    T_smoke.add(band(dP, PB), tb3, item == 'smoke'); T_decoy.add(band(dP, PB), tb3, item == 'decoy')
            for w, k in heading_at.items(): hunters[min(k, 3)] += 1
            # ---------------- nets
            for n in o.nets:
                if n['owner'] != s: continue
                u = n['u']; tg = None
                hits = [x for x in n['units'] if x < G.U and owner(G, x) != s]
                a = n['from']; aim = n['aim']; da = dist(a, aim)
                if hits: tg = hits[0]
                elif da > 1:
                    b = (a[0] + (aim[0] - a[0]) * 2000 / da, a[1] + (aim[1] - a[1]) * 2000 / da); bb = None
                    for x in range(G.U):
                        if owner(G, x) == s or not alive(G, x, t + 1): continue
                        q = pos(G, t + 1, x) or pos(G, t, x)
                        if q:
                            sd = seg_dist(q, a, b)
                            if sd < 700 and (bb is None or sd < bb[0]): bb = (sd, x)
                    tg = bb[1] if bb else None
                if tg is None: T_netm.add('no target found', 'all', True); continue
                T_netm.add('no target found', 'all', False)
                kind = 'prey' if owner(G, tg) == prey else 'pred'
                q0 = pos(G, t, tg); q1 = pos(G, t + 1, tg) or q0; p0 = pos(G, t, u)
                tph = 't1' if t == 1 else 't2-5' if t <= 5 else 't6+'
                T_netm.add('hit an enemy unit', kind + ' ' + tph, bool(hits)); T_netm.add('absorbed by a decoy', kind + ' ' + tph, n['decoys'] > 0 and not hits)
                T_netm.add('target could dash', kind + ' ' + tph, dash_ready(G, tg, t) and not netted(G, tg, t))
                T_netm.add('target dashed this turn', kind + ' ' + tph, tg in o.dash)
                T_netm.add('target already held', kind + ' ' + tph, netted(G, tg, t))
                T_netm.add('thrower held', kind + ' ' + tph, netted(G, u, t)); T_netm.add('thrower dashed this turn', kind + ' ' + tph, u in o.dash)
                T_netm.add('aim point at full range (>1900 from thrower)', kind + ' ' + tph, da > 1900)
                Ln.push('%s %s: thrower (after its move) to target (after its move)' % (kind, tph), dist(a, q1) if q1 else None)
                if p0 and q0: Ln.push('%s %s: thrower to target at the start of the turn' % (kind, tph), dist(p0, q0))
                Ln.push('%s %s: aim distance from the thrower' % (kind, tph), da)
                if q0 and da > 1:
                    far = (a[0] + (aim[0] - a[0]) * 3000 / da, a[1] + (aim[1] - a[1]) * 3000 / da)
                    Ln.push('%s %s: aim line misses the target position at the start of the turn by' % (kind, tph), seg_dist(q0, a, far))
                    if q1: Ln.push('%s %s: aim line misses the target position after its move by' % (kind, tph), seg_dist(q1, a, far))
                    Ln.push('%s %s: aim point to target start position' % (kind, tph), dist(aim, q0))
                    pq = pos(G, t - 1, tg) if t > 1 else None
                    if pq:
                        ex = (2 * q0[0] - pq[0], 2 * q0[1] - pq[1])
                        Ln.push('%s %s: aim point to (target position + its last move)' % (kind, tph), dist(aim, ex))
                if kind == 'prey' and q1:
                    mates = [(dist(pos(G, t + 1, m), q1), m) for m in mine if m != u and alive(G, m, t + 1) and pos(G, t + 1, m) and not netted(G, m, t + 1)]
                    if mates: Ln.push('prey %s: nearest free team mate to target' % tph, min(mates)[0])
                    if hits and t + 1 <= G.turns:
                        o2 = G.T[t + 1]
                        for m in mine:
                            if not alive(G, m, t + 1) or netted(G, m, t + 1): continue
                            pm = pos(G, t + 1, m); cm = o2.cmd.get(m)
                            if not pm or not cm: continue
                            dm = dist(pm, q1)
                            if dm > 3000: continue
                            am = ang((cm[2] - pm[0], cm[3] - pm[1]), (q1[0] - pm[0], q1[1] - pm[1]))
                            r = 'unit %s from the held prey' % band(dm, [0, 1040, 1640, 2240, 3000])
                            if am is not None: T_after.add(r, 'heads at it (30 deg)', am < 30)
                            if dash_ready(G, m, t + 1): T_after.add(r, 'dashes (if ready)', m in o2.dash)
                        T_after.add('the prey', 'caught on the next turn', G.caught[tg] == t + 1); T_after.add('the prey', 'caught within 4 turns', bool(G.caught[tg]) and G.caught[tg] <= t + 4)
            # rates of nets by situation (unit-turns)
            netters = {n['u'] for n in o.nets if n['owner'] == s}
            if t >= 2:
                for u in mine:
                    if not alive(G, u, t): continue
                    p = pos(G, t, u)
                    if not p: continue
                    nQ = nearest(G, t, p, prey); nP = nearest(G, t, p, pred)
                    tph = 't2-5' if t <= 5 else 't6-20' if t <= 20 else 't21+'
                    if nQ and nQ[1] < 2600:
                        qs = 'held' if netted(G, nQ[0], t) else 'dash ready' if dash_ready(G, nQ[0], t) else 'no dash'
                        T_net.add(band(nQ[1], [0, 600, 1000, 1300, 1600, 2000, 2600]), qs + ' ' + tph, u in netters)
                    if nP and nP[1] < 2600:
                        ps = 'held' if netted(G, nP[0], t) else 'dash ready' if dash_ready(G, nP[0], t) else 'no dash'
                        T_netp.add(band(nP[1], [0, 600, 1000, 1300, 1600, 2000, 2600]), ps + (', thrower held' if netted(G, u, t) else ''), u in netters)
            # ---------------- smoke
            for x in o.smokes:
                if x['owner'] != s: continue
                u = x['u']; a = x['at']; tgp = x['target']; p0 = pos(G, t, u)
                tph = 't1' if t == 1 else 't2-5' if t <= 5 else 't6+'
                thr = dist(a, tgp)
                nP1 = nearest(G, t + 1, a, pred) or nearest(G, t, a, pred)
                nP0 = nearest(G, t, p0, pred) if p0 else None
                if t == 1 and G.S[u]:
                    c0 = min(((dist(G.S[u], G.S[w]), w, G.S[w]) for w in units_of(G, pred) if G.S[w]), default=None)
                    nP0 = (c0[1], c0[0], c0[2]) if c0 else None
                    p0 = G.S[u]
                Ls.push('%s: throw distance (unit after its move to the cloud centre)' % tph, thr)
                if nP0: Ls.push('%s: nearest predator at the start of the turn' % tph, nP0[1])
                if nP1:
                    Ls.push('%s: nearest predator after the moves' % tph, nP1[1])
                    Ls.push('%s: cloud centre to that predator (after the moves)' % tph, dist(tgp, nP1[2]))
                    a1 = ang((tgp[0] - a[0], tgp[1] - a[1]), (nP1[2][0] - a[0], nP1[2][1] - a[1]))
                    Ls.push('%s: angle of the throw off the direction to the predator (deg)' % tph, a1)
                    if a1 is not None: T_smf.add('throw within 45 deg of the predator', tph, a1 < 45); T_smf.add('throw more than 135 deg from the predator (away)', tph, a1 > 135)
                if p0:
                    mv = (a[0] - p0[0], a[1] - p0[1])
                    a2 = ang((tgp[0] - a[0], tgp[1] - a[1]), mv)
                    Ls.push('%s: angle of the throw off the unit own move (deg)' % tph, a2)
                T_smf.add('throw under 300 (on itself)', tph, thr < 300); T_smf.add('thrower held', tph, netted(G, u, t)); T_smf.add('thrower dashed this turn', tph, u in o.dash)
                T_smf.add('a team mate is held within 2500', tph, any(netted(G, m, t) and alive(G, m, t) and pos(G, t, m) and dist(pos(G, t, m), a) < 2500 for m in mine if m != u))
                for k in (1, 2, 3):
                    pk = pos(G, t + k, u)
                    if pk and alive(G, u, t + k): T_smf.add('thrower inside the cloud %d turn(s) later' % k, tph, dist(pk, tgp) < 1900)
                T_smf.add('thrower caught within 5 turns', tph, bool(G.caught[u]) and G.caught[u] <= t + 5)
            # ---------------- decoys
            for x in o.decoys:
                if x['owner'] != s: continue
                u = x['u']; a = x['at']; tgp = x['target']
                tph = 't1' if t == 1 else 't2-5' if t <= 5 else 't6+'
                nP = nearest(G, t, a, pred); nQ = nearest(G, t, a, prey)
                if t == 1 and G.S[u]:
                    c0 = min(((dist(a, G.S[w]), w, G.S[w]) for w in units_of(G, pred) if G.S[w]), default=None); nP = (c0[1], c0[0], c0[2]) if c0 else None
                    c0 = min(((dist(a, G.S[w]), w, G.S[w]) for w in units_of(G, prey) if G.S[w]), default=None); nQ = (c0[1], c0[0], c0[2]) if c0 else None
                dv = (tgp[0] - a[0], tgp[1] - a[1])
                Ld2 = Ls
                Ld2.push('DECOY %s: target distance from the unit' % tph, math.hypot(*dv))
                if nP:
                    Ld2.push('DECOY %s: nearest predator' % tph, nP[1])
                    a1 = ang(dv, (nP[2][0] - a[0], nP[2][1] - a[1])); Ld2.push('DECOY %s: angle off the direction to the predator (deg)' % tph, a1)
                    if a1 is not None: T_dcf.add('walks at the predator (<45)', tph, a1 < 45); T_dcf.add('walks away from the predator (>135)', tph, a1 > 135)
                if nQ:
                    Ld2.push('DECOY %s: nearest prey' % tph, nQ[1])
                    a3 = ang(dv, (nQ[2][0] - a[0], nQ[2][1] - a[1]))
                    if a3 is not None: T_dcf.add('walks at the nearest prey (<45)', tph, a3 < 45)
                c = o.cmd.get(u)
                if c:
                    a2 = ang(dv, (c[2] - a[0], c[3] - a[1])); Ld2.push('DECOY %s: angle off the unit own order (deg)' % tph, a2)
                    if a2 is not None: T_dcf.add('same way as the unit (<30)', tph, a2 < 30); T_dcf.add('opposite to the unit (>150)', tph, a2 > 150)
                T_dcf.add('unit held', tph, netted(G, u, t)); T_dcf.add('unit dashes this turn', tph, u in o.dash)
                T_dcf.add('unit also orders a net/smoke (impossible) or nothing else', tph, False)
    print('games: %d' % ng)
    for t in range(1, 7): T_open[t].show(bl(OB))
    for t in (1, 2, 3): T_openq[t].show(bl(QB))
    L.show('Turn 1 directions')
    for tb in (T_mid, T_midq, T_midd, T_mids): tb.show(bl(PB))
    T_pdr.show(bl(PB)); T_dash.show(); T_dkind.show(); Ld.show('Dashes')
    print('\ndashes of living units by turn (first 12 turns): ' + ' '.join('%d:%.2f' % (t, dturn[t] / ng) for t in range(1, 13)))
    T_tgt.show(); tot = sum(hunters.values()) or 1
    print('\nunits heading at one prey on a turn: 1 = %d%%, 2 = %d%%, 3+ = %d%% (%d prey-turns)' % (100 * hunters[1] / tot, 100 * hunters[2] / tot, 100 * hunters[3] / tot, tot))
    T_seek.show(); T_wall.show()
    T_net.show(); T_netp.show(); T_netm.show(); Ln.show('Net geometry'); T_after.show()
    T_smoke.show(bl(PB)); T_smf.show(); T_decoy.show(bl(PB)); T_dcf.show(); Ls.show('Smoke and decoy geometry')
    T_held.show(); T_ord.show(); Lo.show('Order distances')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--name'); ap.add_argument('--agent', type=int, action='append'); ap.add_argument('--limit', type=int)
    ap.add_argument('dirs', nargs='+')
    a = ap.parse_args()
    measure(load_games(a.dirs, a.name, a.agent, a.limit))
