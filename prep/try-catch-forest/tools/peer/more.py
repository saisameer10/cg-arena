# Three questions on the logs: (A) early smoke per unit, (B) what follows an early catch, (C) the prey team's scorers
# and why catching stops after turn 30. Groups: us, teams at 23, teams at 25 (opponents ranked beyond 100).
import json, os, re, collections, statistics as st
P = 'E:/cg-tmp/tcf/peer/'


def parse(g, seat):
    prey = (seat + 1) % 3; pred = (seat + 2) % 3
    t = 0; last = -1; N = 0
    act = collections.defaultdict(dict)        # unit -> turn -> set of orders
    netted = collections.defaultdict(list)     # our unit -> turns it was netted
    lost = {}; mycatch = []; preycatch = []; predcatch = []; mynets = []; dash = collections.Counter()
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1
        last = a
        if a == seat:
            for x in (f.get('stdout') or '').split(';'):
                w = x.split()
                if len(w) > 1 and w[0] in ('MOVE', 'DASH', 'WAIT', 'NET', 'SMOKE', 'DECOY'):
                    act[w[1]].setdefault(t, set()).add(w[0])
                    if w[0] == 'DASH': dash[t] += 1
            if t == 1: N = len(act)
        for s in (f.get('summary') or '').split('\n'):
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m:
                h = int(m.group(1))
                if h == seat: mycatch.append((t, m.group(2), m.group(4)))
                elif h == prey: preycatch.append((t, m.group(2)))
                else: predcatch.append((t, m.group(2), m.group(4))); lost[m.group(4)] = t
            m = re.match(r"\$(\d)'s agent (\d+) at .* throws a net", s)
            if m:
                tail = s.split(' nets ', 1)[1] if ' nets ' in s else ''
                if int(m.group(1)) == seat: mynets.append(t)
                else:
                    for x in re.findall(r"\$%d's agent (\d+)" % seat, tail): netted[x].append(t)
    return {'N': N, 'rank': g['ranking'].index(seat) + 1, 'act': act, 'netted': netted, 'lost': lost, 'my': mycatch, 'preyc': preycatch, 'predc': predcatch, 'nets': mynets, 'dash': dash}


def collect(index):
    out = []
    if index is None:
        for sub in ('41748059', '41749025'):
            for b in json.load(open('E:/cg-tmp/tcf/gold/battles_%s.json' % sub)):
                fn = 'E:/cg-tmp/tcf/gold/games/%s.json' % b['game_id']
                if not b.get('done') or not os.path.exists(fn): continue
                g = json.load(open(fn)); me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
                if not me or any((a.get('rank') or 999) <= 100 for a in g['agents'] if a['index'] != me[0]['index']): continue
                out.append(parse(g, me[0]['index']))
        return out
    for gid, agent in json.load(open(P + index)).items():
        fn = P + 'games/%s.json' % gid
        if not os.path.exists(fn): continue
        g = json.load(open(fn)); s = [a['index'] for a in g['agents'] if a.get('agent_id') == agent]
        if s: out.append(parse(g, s[0]))
    return out


def pc(a, b): return '%2.0f%%' % (100 * a / b) if b else ' - '


def partA(name, rows):
    print('\n[A] %s: units by what they ordered on turn 1' % name)
    G = collections.defaultdict(list)
    for r in rows:
        for u, turns in r['act'].items():
            o = turns.get(1, set())
            k = ('smoke' if 'SMOKE' in o else 'net' if 'NET' in o else 'decoy' if 'DECOY' in o else 'no power') + (', dash' if 'DASH' in o else ', walk')
            G[k].append((r, u))
    tot = sum(len(v) for v in G.values())
    for k in sorted(G, key=lambda k: -len(G[k])):
        v = G[k]
        if len(v) < 15: continue
        net5 = sum(1 for r, u in v if any(x <= 5 for x in r['netted'].get(u, [])))
        l8 = sum(1 for r, u in v if r['lost'].get(u, 99) <= 8); l15 = sum(1 for r, u in v if r['lost'].get(u, 99) <= 15)
        c8 = sum(1 for r, u in v if any(t <= 8 and cu == u for t, cu, _ in r['my'])); c15 = sum(1 for r, u in v if any(t <= 15 and cu == u for t, cu, _ in r['my']))
        print('   %-16s %4d units (%s): netted by turn 5 %s | lost by turn 8 %s, by 15 %s | made a catch by turn 8 %s, by 15 %s' % (k, len(v), pc(len(v), tot), pc(net5, len(v)), pc(l8, len(v)), pc(l15, len(v)), pc(c8, len(v)), pc(c15, len(v))))
    # games by the number of smokes in turns 1-5, within unit counts
    for N in (4, 5, 6):
        z = [r for r in rows if r['N'] == N]
        for lab, f in (('0-1 smokes in turns 1-5', lambda s: s <= 1), ('2 or more', lambda s: s >= 2)):
            q = [r for r in z if f(sum(1 for u in r['act'] for t in range(1, 6) if 'SMOKE' in r['act'][u].get(t, ())))]
            if len(q) >= 8: print('   %d units, %-24s %3d games: mean rank %.2f, catches by 10 %.2f, units lost by 10 %.2f' % (N, lab, len(q), st.mean(r['rank'] for r in q),
                st.mean(sum(1 for t, _, _ in r['my'] if t <= 10) for r in q), st.mean(sum(1 for v in r['lost'].values() if v <= 10) for r in q)))


def partB(name, rows):
    q = [r for r in rows if r['my'] and r['my'][0][0] <= 10]
    if not q: return
    print('\n[B] %s: after our first catch (made by turn 10; %d games, mean rank %.2f)' % (name, len(q), st.mean(r['rank'] for r in q)))
    f = lambda r: r['my'][0][0]
    sec5 = sum(1 for r in q if any(f(r) < t <= f(r) + 5 for t, _, _ in r['my'][1:])); sec10 = sum(1 for r in q if any(f(r) < t <= f(r) + 10 for t, _, _ in r['my'][1:]))
    cl = sum(1 for r in q if r['lost'].get(r['my'][0][1], 99) <= f(r) + 6)
    l10 = st.mean(sum(1 for v in r['lost'].values() if f(r) < v <= f(r) + 10) for r in q)
    n10 = st.mean(sum(1 for t in r['nets'] if f(r) < t <= f(r) + 10) for r in q)
    d10 = sum(sum(r['dash'][t] for t in range(f(r) + 1, f(r) + 11)) for r in q) / max(1, sum(r['N'] for r in q))
    same = sum(1 for r in q if any(f(r) < t <= f(r) + 10 and cu == r['my'][0][1] for t, cu, _ in r['my'][1:]))
    print('   a second catch within 5 turns %s, within 10 turns %s (by the same unit %s) | the catching unit is lost within 6 turns %s | in the next 10 turns: units lost %.2f, nets %.2f, dashes per unit %.2f' % (
        pc(sec5, len(q)), pc(sec10, len(q)), pc(same, len(q)), pc(cl, len(q)), l10, n10, d10))
    a = [r for r in q if any(f(r) < t <= f(r) + 10 for t, _, _ in r['my'][1:])]; b = [r for r in q if r not in a]
    print('   with a second catch within 10 turns: mean rank %.2f (%d games) | without: %.2f (%d games)' % (st.mean(r['rank'] for r in a) if a else 0, len(a), st.mean(r['rank'] for r in b) if b else 0, len(b)))


def partC(name, rows):
    print('\n[C] %s: the prey team\'s scorers, and the game after turn 30' % name)
    pcs = sum(len(r['preyc']) for r in rows)
    caught_before = 0; by_scorer_later = 0; scorers = 0; scorers_caught = 0; ours_on_scorer = 0; allmy = sum(len(r['my']) for r in rows)
    for r in rows:
        ct = {v: t for t, _, v in r['my']}                      # prey unit -> turn we caught it
        su = {}
        for t, u in r['preyc']: su.setdefault(u, []).append(t)
        scorers += len(su); scorers_caught += sum(1 for u in su if u in ct)
        ours_on_scorer += sum(1 for u in su if u in ct)
        for u, ts in su.items():
            first = ts[0]
            by_scorer_later += sum(1 for x in ts if x > first)  # points a scorer added after its first one
    print('   prey team catches %.2f a game, by %.2f different units; we catch %s of those units at some point; %s of our catches are on a unit that scores in that game' % (
        pcs / len(rows), scorers / len(rows), pc(scorers_caught, scorers), pc(ours_on_scorer, allmy)))
    print('   points the prey team\'s scorers add after their first one: %.2f a game (a scorer caught right after its first point would have denied these)' % (by_scorer_later / len(rows)))
    # after turn 30: by whether we still catch
    for lab, f in (('we catch after turn 30', lambda r: any(t > 30 for t, _, _ in r['my'])), ('we catch nothing after turn 30', lambda r: not any(t > 30 for t, _, _ in r['my']))):
        q = [r for r in rows if f(r)]
        if not q: continue
        alive = st.mean(r['N'] - sum(1 for v in r['lost'].values() if v <= 30) for r in q)
        preyleft = st.mean(r['N'] - sum(1 for t, _, _ in r['my'] if t <= 30) for r in q)
        n30 = st.mean(sum(1 for t in r['nets'] if t <= 30) for r in q); nl = st.mean(sum(1 for t in r['nets'] if t > 30) for r in q)
        d = sum(sum(v for t, v in r['dash'].items() if t > 30) for r in q) / max(1e-9, sum((r['N'] - sum(1 for v in r['lost'].values() if v <= 30)) for r in q))
        print('   %-30s %3d games (%s), mean rank %.2f: at turn 30 our units alive %.2f, prey units left %.2f, nets thrown so far %.2f | after 30: nets %.2f, dashes per unit alive %.2f, units lost %.2f, prey team catches %.2f' % (
            lab, len(q), pc(len(q), len(rows)), st.mean(r['rank'] for r in q), alive, preyleft, n30, nl, d, st.mean(sum(1 for v in r['lost'].values() if v > 30) for r in q), st.mean(sum(1 for t, _ in r['preyc'] if t > 30) for r in q)))


if __name__ == '__main__':
    import sys
    groups = (('us', None), ('teams at 23', 'peer_index.json'), ('teams at 25', 'peer25_index.json'))
    data = [(n, collect(i)) for n, i in groups]
    for part in (partA, partB, partC):
        for n, rows in data: part(n, rows)
