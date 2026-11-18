# Second pass of rule measurements for the mimic study: exact triggers.
#   python mimic_measure2.py --name "Les Gens Bons" --agent 6894245 <dir> [<dir> ...]
# The power pools are not in the logs. Trick used here: a team that uses an item on turn T had that item on every
# earlier turn, so rates "while the item is still available" are computed over the turns up to its last use.
import sys, argparse, math, collections
sys.path.insert(0, __import__('os').path.dirname(__file__))
from mimic_lib import *
from mimic_measure import Tab, Lists, band, bl

PB = [0, 800, 1200, 1600, 2000, 2300, 2600, 3500, 99999]
NB = [0, 600, 1000, 1300, 1600, 2000, 2300, 2600, 99999]


def true_end(G, t, u):
    """End position of a unit on turn t from its own order (trees ignored), without the anchor of a net hit."""
    p = pos(G, t, u)
    if not p: return None
    c = G.T[t].cmd.get(u)
    if not c or netted(G, u, t): return p
    return step(p, (c[2], c[3]), DASH if u in G.T[t].dash else MOVE)


def measure(games):
    T_dec = Tab('DECOY rate while decoys are left: rows = nearest predator at the start of the turn')
    T_dec1 = Tab('Turn 1 powers (start positions): rows = situation; while the item is left')
    T_net = Tab('NET at prey while nets are left: rows = distance from our position AFTER the move to the nearest prey (its position at the start of the turn)')
    T_net0 = Tab('NET at prey while nets are left: rows = distance at the START of the turn to the nearest prey')
    T_netp = Tab('NET at a predator while nets are left: rows = nearest predator at the start of the turn')
    T_smk = Tab('SMOKE rate while smoke is left: rows = nearest predator at the start of the turn')
    T_dg = Tab('Decoy geometry')
    T_lead = Tab('Net aim (prey): share of nets whose aim line passes within 60 of ...')
    T_cloud = Tab('Inside a cloud of our own team')
    T_fat = Tab('Dash share when ready, by number of dashes already made by the unit')
    T_idle = Tab('Idle units (no living enemy within 2600), turns 7+')
    T_catch = Tab('Catches')
    T_heldi = Tab('Held unit, per held turn, while the item is left')
    T_second = Tab('Second unit on the same prey')
    T_pool = Tab('Items used per game (pool proxy)')
    L = Lists()
    ng = 0; usedhist = {k: collections.Counter() for k in ('net', 'smoke', 'decoy')}
    for G, s in games:
        ng += 1; prey = (s + 1) % 3; pred = (s + 2) % 3; mine = list(units_of(G, s))
        last = {'net': 0, 'smoke': 0, 'decoy': 0}; used = {'net': 0, 'smoke': 0, 'decoy': 0}
        clouds = []; decoy_turn = {}
        for t in range(1, G.turns + 1):
            o = G.T[t]
            for n in o.nets:
                if n['owner'] == s: last['net'] = t; used['net'] += 1
            for x in o.smokes:
                if x['owner'] == s: last['smoke'] = t; used['smoke'] += 1
            for x in o.decoys:
                if x['owner'] == s: last['decoy'] = t; used['decoy'] += 1
        for k in used:
            usedhist[k][min(used[k], 8)] += 1
            T_pool.add('%d units per team' % G.N, k + ': mean x100', False)
        for k in used:
            x = T_pool.c['%d units per team' % G.N][k + ': mean x100']; x[0] += used[k] * 1.0
        for t in range(1, G.turns + 1):
            o = G.T[t]
            netters = {n['u']: n for n in o.nets if n['owner'] == s}
            smokers = {x['u'] for x in o.smokes if x['owner'] == s}
            decoyers = {x['u']: x for x in o.decoys if x['owner'] == s}
            for u in mine:
                if not alive(G, u, t): continue
                p = G.S[u] if t == 1 and G.S[u] else pos(G, t, u)
                if not p: continue
                held = netted(G, u, t); ready = dash_ready(G, u, t); dashed = u in o.dash
                c = o.cmd.get(u); v = (c[2] - p[0], c[3] - p[1]) if c else (0, 0); still = math.hypot(*v) < 60
                if t == 1:
                    cP = min(((dist(p, G.S[w]), w, G.S[w]) for w in units_of(G, pred) if G.S[w]), default=None)
                    cQ = min(((dist(p, G.S[w]), w, G.S[w]) for w in units_of(G, prey) if G.S[w]), default=None)
                    nP = (cP[1], cP[0], cP[2]) if cP else None; nQ = (cQ[1], cQ[0], cQ[2]) if cQ else None
                else:
                    nP = nearest(G, t, p, pred); nQ = nearest(G, t, p, prey)
                dP = nP[1] if nP else None; dQ = nQ[1] if nQ else None
                e = step(p, (c[2], c[3]), DASH if dashed else MOVE) if (c and not held) else p
                dQe = dist(e, nQ[2]) if nQ else None
                item = 'net' if u in netters else 'smoke' if u in smokers else 'decoy' if u in decoyers else ''
                tb = 't1' if t == 1 else 't2-5' if t <= 5 else 't6-20' if t <= 20 else 't21+'
                has_decoy = u in decoy_turn and t - decoy_turn[u] < 10
                # ---- decoys
                if t <= last['decoy'] and item != 'net':
                    col = ('held' if held else 'own decoy alive' if has_decoy else 'free') + (' t1' if t == 1 else '')
                    T_dec.add(band(dP, PB), col, item == 'decoy')
                    if not held and not has_decoy and dP is not None and dP < 2000:
                        T_dec.add(band(dP, PB), 'free, dashes this turn', item == 'decoy') if dashed else T_dec.add(band(dP, PB), 'free, walks', item == 'decoy')
                        if nP: T_dg.add('free unit, predator within 2000, decoy left', 'decoy when that predator can dash' if dash_ready(G, nP[0], t) else 'decoy when it cannot', item == 'decoy')
                # ---- turn 1 summary
                if t == 1:
                    qn = dQ is not None and dQ < 2000; pn = dP is not None and dP < 2000
                    r = ('prey<2000 ' if qn else 'prey far ') + ('pred<2000' if pn else 'pred far')
                    if last['net'] >= 1: T_dec1.add(r, 'net (nets left)', item == 'net')
                    if last['decoy'] >= 1: T_dec1.add(r, 'decoy (decoys left)', item == 'decoy')
                    if last['decoy'] >= 1 and last['net'] >= 1: T_dec1.add(r, 'nothing (both left)', item == '')
                    T_dec1.add(r, 'dash', dashed)
                    if qn and dQe is not None and last['net'] >= 1:
                        T_dec1.add('prey after own move ' + band(dQe, NB), 'net (nets left)', item == 'net')
                # ---- nets at prey
                if t <= last['net'] and nQ and t >= 2:
                    qs = 'held' if netted(G, nQ[0], t) else 'dash ready' if dash_ready(G, nQ[0], t) else 'no dash'
                    col = qs + (' | thrower held' if held else '')
                    T_net.add(band(dQe, NB), col, u in netters and owner(G, netters[u]['units'][0] if netters[u]['units'] else nQ[0]) != pred)
                    T_net0.add(band(dQ, NB), col, u in netters)
                    if not held and dQe < 2000:
                        T_net.add(band(dQe, NB), 'all, ' + tb, u in netters)
                        if dP is not None: T_net.add(band(dQe, NB), 'predator within 1500' if dP < 1500 else 'no predator within 1500', u in netters)
                # ---- nets at predators
                if t <= last['net'] and nP and t >= 2 and (dQe is None or dQe > 2300):
                    ps = 'held' if netted(G, nP[0], t) else 'dash ready' if dash_ready(G, nP[0], t) else 'no dash'
                    T_netp.add(band(dP, PB), ps + (' | thrower held' if held else ''), u in netters)
                # ---- smoke
                if t <= last['smoke'] and t >= 2 and item not in ('net',):
                    col = 'held' if held else ('dash ready' if ready else 'dash on cooldown')
                    T_smk.add(band(dP, PB), col, item == 'smoke')
                    if not held: T_smk.add(band(dP, PB), 'free, decoys left' if t <= last['decoy'] else 'free, no decoy left', item == 'smoke')
                    inc = any(dist(p, cc[0]) < 1900 and t <= cc[1] for cc in clouds)
                    if not held and dP is not None and dP < 2000: T_smk.add(band(dP, PB), 'free, already in own cloud' if inc else 'free, not in a cloud', item == 'smoke')
                    if not held and nP and dP < 2000 and not inc:
                        T_smk.add(band(dP, PB), 'not in cloud, pred can dash' if dash_ready(G, nP[0], t) else 'not in cloud, pred cannot', item == 'smoke')
                        T_smk.add(band(dP, PB), 'not in cloud, we dash this turn' if dashed else 'not in cloud, we walk', item == 'smoke')
                # ---- held unit items
                if held:
                    if t <= last['net'] and nP: T_heldi.add('predator ' + band(dP, [0, 1000, 1600, 2300, 99999]), 'net (left)', item == 'net')
                    if t <= last['smoke'] and nP: T_heldi.add('predator ' + band(dP, [0, 1000, 1600, 2300, 99999]), 'smoke (left)', item == 'smoke')
                    if t <= last['decoy'] and nP: T_heldi.add('predator ' + band(dP, [0, 1000, 1600, 2300, 99999]), 'decoy (left)', item == 'decoy')
                    continue
                # ---- inside our own cloud
                inc = [cc for cc in clouds if dist(p, cc[0]) < 1900 and t <= cc[1]]
                if inc and t >= 2:
                    T_cloud.add('unit inside', 'still', still)
                    if ready: T_cloud.add('unit inside', 'dash (if ready)', dashed)
                    a = ang(v, (p[0] - inc[0][0][0], p[1] - inc[0][0][1]))
                    if a is not None and dist(p, inc[0][0]) > 300: T_cloud.add('unit inside', 'heads outward (<60)', a < 60)
                    if nP and dP < 2500:
                        a = ang(v, (p[0] - nP[2][0], p[1] - nP[2][1]))
                        if a is not None: T_cloud.add('unit inside', 'away from predator within 2500 (<60)', a < 60)
                    if nQ and dQ < 2500:
                        a = ang(v, (nQ[2][0] - p[0], nQ[2][1] - p[1]))
                        if a is not None: T_cloud.add('unit inside', 'at prey within 2500 (<45)', a < 45)
                # ---- dash by fatigue
                if ready and t >= 2:
                    k = min(dashes_before(G, u, t), 5)
                    aQ = ang(v, (nQ[2][0] - p[0], nQ[2][1] - p[1])) if nQ else None
                    if nQ and dQ < 1600 and (dP is None or dP > 2000): T_fat.add('%d dashes made' % k, 'prey within 1600, no predator within 2000', dashed)
                    if nP and dP < 1200: T_fat.add('%d dashes made' % k, 'predator within 1200', dashed)
                    if nQ and 1600 <= dQ < 3000 and (dP is None or dP > 2000): T_fat.add('%d dashes made' % k, 'prey 1600-3000, no predator within 2000', dashed)
                # ---- idle
                if t >= 7 and (dP is None or dP > 2600) and (dQ is None or dQ > 2600):
                    r = 'radius ' + band(math.hypot(*p), [0, 3000, 5500, 99999])
                    T_idle.add(r, 'still', still)
                    aC = ang(v, (-p[0], -p[1]))
                    if aC is not None:
                        T_idle.add(r, 'inward (<60)', aC < 60); T_idle.add(r, 'outward (>120)', aC > 120)
                    if nQ:
                        a = ang(v, (nQ[2][0] - p[0], nQ[2][1] - p[1]))
                        if a is not None: T_idle.add(r, 'at nearest prey (<45)', a < 45)
                    if ready: T_idle.add(r, 'dash (if ready)', dashed)
                # ---- flee detail
                if t >= 7 and nP and dP < 1600 and (dQ is None or dQ > 2200):
                    a = ang(v, (p[0] - nP[2][0], p[1] - nP[2][1]))
                    L.push('flee (predator within 1600, no prey within 2200): angle off straight-away, radius %s' % band(math.hypot(*p), [0, 5500, 99999]), a)
                    others = [pos(G, t, w) for w in units_of(G, pred) if alive(G, w, t) and pos(G, t, w) and dist(pos(G, t, w), p) < 2500]
                    if len(others) >= 2:
                        cx = sum(q[0] for q in others) / len(others); cy = sum(q[1] for q in others) / len(others)
                        L.push('flee with 2+ predators within 2500: angle off away-from-nearest', a)
                        L.push('flee with 2+ predators within 2500: angle off away-from-their-centre', ang(v, (p[0] - cx, p[1] - cy)))
                # ---- hunt detail: approach direction relative to prey position and prey position + velocity
                if t >= 7 and nQ and dQ < 2200 and (dP is None or dP > 2000) and not still:
                    a0 = ang(v, (nQ[2][0] - p[0], nQ[2][1] - p[1]))
                    L.push('hunt (prey within 2200, no predator within 2000): angle off the prey position', a0)
                    pq = pos(G, t - 1, nQ[0])
                    if pq:
                        ex = (2 * nQ[2][0] - pq[0], 2 * nQ[2][1] - pq[1])
                        L.push('hunt: angle off (prey position + its last move)', ang(v, (ex[0] - p[0], ex[1] - p[1])))
                    te = true_end(G, t, nQ[0])
                    if te: L.push('hunt: angle off the prey position after its move this turn', ang(v, (te[0] - p[0], te[1] - p[1])))
            # second hunter near a prey that a team mate is close to
            # ---- decoy geometry
            for u, x in decoyers.items():
                a = x['at']; tg = x['target']; decoy_turn[u] = t
                nP = nearest(G, t, a, pred)
                if t == 1 and G.S[u]:
                    cP = min(((dist(a, G.S[w]), w, G.S[w]) for w in units_of(G, pred) if G.S[w]), default=None); nP = (cP[1], cP[0], cP[2]) if cP else None
                if not nP: continue
                aw = (a[0] - nP[2][0], a[1] - nP[2][1]); la = math.hypot(*aw) or 1; aw = (aw[0] / la, aw[1] / la)
                dv = (tg[0] - a[0], tg[1] - a[1])
                along = dv[0] * aw[0] + dv[1] * aw[1]; perp = -dv[0] * aw[1] + dv[1] * aw[0]
                L.push('decoy target: component along straight-away from the nearest predator', along)
                L.push('decoy target: |component across|', abs(perp))
                L.push('decoy target: signed angle from straight-away (deg, + = counter-clockwise on screen coords)', math.degrees(math.atan2(perp, along)))
                T_dg.add('decoy', 'turned to the + side', perp > 0)
                # which side: toward the centre? toward own order?
                side = 1 if perp > 0 else -1
                cen = (-a[0], -a[1]); cs = -cen[0] * aw[1] + cen[1] * aw[0]
                if abs(cs) > 200: T_dg.add('decoy', 'turned to the side of the centre', (cs > 0) == (side > 0))
                c = o.cmd.get(u)
                if c:
                    mv = (c[2] - a[0], c[3] - a[1]); ms = -mv[0] * aw[1] + mv[1] * aw[0]
                    if abs(ms) > 100: T_dg.add('decoy', 'turned to the side of its own order', (ms > 0) == (side > 0))
                nQ = nearest(G, t, a, prey)
                if nQ:
                    qv = (nQ[2][0] - a[0], nQ[2][1] - a[1]); qs = -qv[0] * aw[1] + qv[1] * aw[0]
                    if abs(qs) > 200: T_dg.add('decoy', 'turned to the side of the nearest prey', (qs > 0) == (side > 0))
                T_dg.add('decoy', 'target is 4000 +-60 from the unit', abs(math.hypot(*dv) - 3957) < 60 or abs(math.hypot(*dv) - 4000) < 60)
            # ---- net lead (prey)
            for u, n in netters.items():
                a = n['from']; aim = n['aim']; da = dist(a, aim)
                hits = [x for x in n['units'] if x < G.U and owner(G, x) != s]
                tg = hits[0] if hits else None
                if tg is None and da > 1:
                    b = (a[0] + (aim[0] - a[0]) * 2000 / da, a[1] + (aim[1] - a[1]) * 2000 / da); bb = None
                    for x in range(G.U):
                        if owner(G, x) == s or not alive(G, x, t): continue
                        q = true_end(G, t, x)
                        if q:
                            sd = seg_dist(q, a, b)
                            if sd < 700 and (bb is None or sd < bb[0]): bb = (sd, x)
                    tg = bb[1] if bb else None
                if tg is None or da < 1: continue
                q0 = pos(G, t, tg)
                if t == 1 and G.S[tg]: q0 = G.S[tg]
                if not q0: continue
                far = (a[0] + (aim[0] - a[0]) * 3000 / da, a[1] + (aim[1] - a[1]) * 3000 / da)
                kind = ('prey' if owner(G, tg) == prey else 'pred') + (' t1' if t == 1 else ' t2+')
                T_lead.add(kind, 'its position at the start of the turn', seg_dist(q0, a, far) < 60)
                pq = pos(G, t - 1, tg) if t > 1 else None
                if pq:
                    lm = (q0[0] - pq[0], q0[1] - pq[1])
                    T_lead.add(kind, 'position + last move', seg_dist((q0[0] + lm[0], q0[1] + lm[1]), a, far) < 60)
                    ll = math.hypot(*lm)
                    if ll > 1: T_lead.add(kind, 'position + last move capped at 600', seg_dist((q0[0] + lm[0] * min(1, 600 / ll), q0[1] + lm[1] * min(1, 600 / ll)), a, far) < 60)
                p0 = G.S[u] if t == 1 and G.S[u] else pos(G, t, u)
                if p0:
                    aw = (q0[0] - p0[0], q0[1] - p0[1]); la = math.hypot(*aw) or 1
                    for sp in (600, 1200):
                        T_lead.add(kind, 'position moved %d straight away from our start position' % sp, seg_dist((q0[0] + aw[0] / la * sp, q0[1] + aw[1] / la * sp), a, far) < 60)
                te = true_end(G, t, tg)
                if te: T_lead.add(kind, 'its true position after the move (trees ignored)', seg_dist(te, a, far) < 60)
                L.push('net %s: aim line to target start position' % kind, seg_dist(q0, a, far))
                # second unit
            for cch in o.catches:
                if cch['byOwner'] != s: continue
                v_ = cch['v']; by = cch['by']
                st = 'held' if netted(G, v_, t) else 'dash ready' if dash_ready(G, v_, t) else 'no dash'
                for k in ('held', 'dash ready', 'no dash'): T_catch.add('prey state', k, st == k)
                T_catch.add('catcher dashed', st, by in o.dash)
                T_catch.add('prey dashed on that turn', st, v_ in o.dash)
                pb = pos(G, t, by); pv = pos(G, t, v_)
                if pb and pv: L.push('catch: catcher to prey at the start of the turn (%s%s)' % (st, ', dash' if by in o.dash else ', walk'), dist(pb, pv))
                T_catch.add('turn', '1-10', t <= 10); T_catch.add('turn', '11-30', 10 < t <= 30); T_catch.add('turn', '31+', t > 30)
            for x in o.smokes:
                if x['owner'] == s: clouds.append((x['target'], t + 9))
    print('games: %d' % ng)
    for k in T_pool.c:
        for col in T_pool.c[k]:
            x = T_pool.c[k][col]; print('pool proxy: %s, %s = %.2f per game (%d games)' % (k, col.split(':')[0], x[0] / x[1], x[1]))
    for k in usedhist: print('used per game, %s: %s' % (k, ' '.join('%d:%d' % (i, usedhist[k][i]) for i in range(9))))
    T_dec1.show(); T_dec.show(bl(PB)); T_dg.show(); T_net.show(bl(NB)); T_net0.show(bl(NB)); T_netp.show(bl(PB)); T_lead.show()
    T_smk.show(bl(PB)); T_heldi.show(); T_cloud.show(); T_fat.show(); T_idle.show(); T_catch.show(); L.show('Distributions')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--name'); ap.add_argument('--agent', type=int, action='append'); ap.add_argument('--limit', type=int)
    ap.add_argument('dirs', nargs='+')
    a = ap.parse_args()
    measure(load_games(a.dirs, a.name, a.agent, a.limit))
