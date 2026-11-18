# Games where we were first or second at turn 30 and finished last: who passed us, and what happened after turn 30.
import json, os, re, sys
P = 'E:/cg-tmp/tcf/peer/'
def row(g, seat):
    t = 0; last = -1; ct = [[], [], []]
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1
        last = a
        for s in (f.get('summary') or '').split('\n'):
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m: ct[int(m.group(1))].append(t)
    key = lambda p, T: (-sum(1 for x in ct[p] if x <= T), [x for x in ct[p] if x <= T] + [999] * 8)
    pl = lambda T: 1 + sum(1 for p in range(3) if key(p, T) < key(seat, T))
    prey = (seat + 1) % 3; pred = (seat + 2) % 3
    c = lambda p, a, b: sum(1 for x in ct[p] if a < x <= b)
    return {'p30': pl(30), 'fin': g['ranking'].index(seat) + 1, 'me': c(seat, 30, 100), 'prey': c(prey, 30, 100), 'pred': c(pred, 30, 100),
            'me30': c(seat, 0, 30), 'prey30': c(prey, 0, 30), 'pred30': c(pred, 0, 30), 'tie': len(ct[seat]) == min(len(ct[prey]), len(ct[pred])) or len(ct[seat]) == max(len(ct[prey]), len(ct[pred]))}
def collect(index):
    out = []
    if index is None:
        for sub in ('41748059', '41749025'):
            for b in json.load(open('E:/cg-tmp/tcf/gold/battles_%s.json' % sub)):
                fn = 'E:/cg-tmp/tcf/gold/games/%s.json' % b['game_id']
                if not b.get('done') or not os.path.exists(fn): continue
                g = json.load(open(fn)); me = [a for a in g['agents'] if a['name'] == 'The Final Boss']
                if not me or any((a.get('rank') or 999) <= 100 for a in g['agents'] if a['index'] != me[0]['index']): continue
                out.append(row(g, me[0]['index']))
        return out
    for gid, agent in json.load(open(P + index)).items():
        fn = P + 'games/%s.json' % gid
        if not os.path.exists(fn): continue
        g = json.load(open(fn)); s = [a['index'] for a in g['agents'] if a.get('agent_id') == agent]
        if s: out.append(row(g, s[0]))
    return out
for name, idx in (('us', None), ('teams at 23', 'peer_index.json'), ('teams at 25', 'peer25_index.json')):
    rows = collect(idx); top = [r for r in rows if r['p30'] <= 2]
    for lab, q in (('fell to last', [r for r in top if r['fin'] == 3]), ('held or rose', [r for r in top if r['fin'] <= r['p30']])):
        m = lambda k: sum(r[k] for r in q) / len(q)
        print('%-11s first or second at turn 30, %-12s %3d games (%2.0f%% of all): at turn 30 we %.2f, prey team %.2f, predator team %.2f | after turn 30 we caught %.2f, prey team %.2f, predator team (our losses) %.2f | we caught nothing after 30 in %.0f%%' % (
            name, lab, len(q), 100 * len(q) / len(rows), m('me30'), m('prey30'), m('pred30'), m('me'), m('prey'), m('pred'), 100 * sum(r['me'] == 0 for r in q) / len(q)))
