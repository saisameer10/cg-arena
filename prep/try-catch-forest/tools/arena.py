# usage: python arena.py <dir> <battles_SUB.json> [more...]
# What happened in the arena games of a submission. <dir> holds battles_*.json and games/<game_id>.json
# (written by arenafetch.py). Writes rows_SUB.json (one record per game) next to the battle list.
import json, sys, re, os, collections, math

SQUAD = 'The Final Boss'   # our name in the battle lists (squad contest: players show under the squad name)


def load(d, bfile):
    out = []
    for b in json.load(open(os.path.join(d, bfile))):
        fn = os.path.join(d, 'games', '%s.json' % b['game_id'])
        if not b.get('done') or not os.path.exists(fn):
            continue
        g = json.load(open(fn))
        me = [p['agent_id'] for p in b['players'] if p.get('me')] or [p['agent_id'] for p in b['players'] if p['nickname'] == SQUAD]
        seat = [a['index'] for a in g['agents'] if a['agent_id'] == me[0]][0]
        out.append((b, g, seat))
    return out


def study(b, g, seat):
    r = {'id': b['game_id'], 'seat': seat, 'rank': g['ranking'].index(seat) + 1, 'score': g['scores'][seat]}
    names = [a['name'] for a in g['agents']]
    r['prey'] = names[(seat + 1) % 3]
    r['pred'] = names[(seat + 2) % 3]
    t = 0; last = -1; ct = []; lostT = []; out = {}; summ = collections.defaultdict(list); N = 0; err = []
    for f in g['frames']:
        a = f.get('agent')
        if a is None:
            continue
        if last == -1 or a <= last:
            t += 1
        last = a
        if a == seat:
            out[t] = f.get('stdout') or ''
            if t == 1:
                N = len(set(c.split()[1] for c in out[t].split(';') if len(c.split()) > 1 and c.split()[0] in ('MOVE', 'DASH')))
        for s in (f.get('summary') or '').split('\n'):
            if s:
                summ[t].append(s)
    r['turns'] = t; r['N'] = N
    nets = hitPrey = hitPred = miss = conv = smoke = decoy = 0
    netted = {}; mynetted = collections.defaultdict(list); deaths = []; r['othercatch'] = [0, 0, 0]
    for tt in sorted(summ):
        for s in summ[tt]:
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+) at \((-?\d+), (-?\d+)\)", s)
            if m:
                h = int(m.group(1)); r['othercatch'][h] += 1
                if h == seat:
                    ct.append(tt)
                    if m.group(4) in netted and tt - netted[m.group(4)] <= 5:
                        conv += 1
                if int(m.group(3)) == seat:
                    u = m.group(4); lostT.append(tt); tag = 'none'
                    for k in (tt, tt - 1):
                        cs = [c.split() for c in out.get(k, '').split(';') if len(c.split()) > 4 and c.split()[1] == u and c.split()[0] in ('MOVE', 'DASH')]
                        if cs:
                            tag = cs[0][4]; break
                    deaths.append({'t': tt, 'tag': tag, 'netted': any(tt - k <= 5 for k in mynetted[u]),
                                   'R': math.hypot(int(m.group(5)), int(m.group(6))),
                                   'dash': any(c.startswith('DASH ' + u + ' ') for c in out.get(tt, '').split(';')),
                                   'by': names[h]})
            m = re.match(r"\$(\d)'s agent (\d+) at .* throws a net at .*", s)
            if m:
                tail = s.split(' nets ', 1)[1] if ' nets ' in s else ''
                if int(m.group(1)) == seat:
                    nets += 1
                    hits = re.findall(r"\$(\d)'s agent (\d+)", tail)
                    hp = [x for x in hits if int(x[0]) == (seat + 1) % 3]
                    hd = [x for x in hits if int(x[0]) == (seat + 2) % 3]
                    if hp:
                        hitPrey += 1
                        for x in hp:
                            netted[x[1]] = tt
                    elif hd:
                        hitPred += 1
                    else:
                        miss += 1
                else:
                    for x in re.findall(r"\$%d's agent (\d+)" % seat, tail):
                        mynetted[x].append(tt)
            if re.match(r"\$%d's agent \d+ at .* deploys smoke" % seat, s): smoke += 1
            if re.match(r"\$%d's agent \d+ at .* deploys a decoy" % seat, s): decoy += 1
            if ('$%d' % seat in s) and ('not provided' in s or 'nvalid' in s or 'timeout' in s.lower()):
                err.append((tt, s))
    r.update(catches=len(ct), ct=ct, lost=len(lostT), lostT=lostT, deaths=deaths, nets=nets, netPrey=hitPrey,
             netPred=hitPred, netMiss=miss, netConv=conv, smoke=smoke, decoy=decoy, err=err,
             timesNetted=sum(len(v) for v in mynetted.values()))
    r['preyScore'] = r['othercatch'][(seat + 1) % 3]
    r['predScore'] = r['othercatch'][(seat + 2) % 3]
    return r


def pc(a, b):
    return '%d%%' % round(100 * a / b) if b else '-'


def group(rows, key, label):
    ks = sorted(set(key(r) for r in rows))
    print(' by %s:' % label)
    for x in ks:
        q = [r for r in rows if key(r) == x]
        print('   %s: n %d, mean rank %.2f, wins %s, last %s, catches %.1f, lost %.1f' % (
            x, len(q), sum(r['rank'] for r in q) / len(q), pc(sum(r['rank'] == 1 for r in q), len(q)),
            pc(sum(r['rank'] == 3 for r in q), len(q)), sum(r['catches'] for r in q) / len(q), sum(r['lost'] for r in q) / len(q)))


def report(name, rows):
    n = len(rows)
    print('\n=====', name, 'games', n)
    if not n:
        return
    k = [sum(r['rank'] == i for r in rows) for i in (1, 2, 3)]
    print('rank 1/2/3: %d / %d / %d  (%s / %s / %s)   mean rank %.2f' % (k[0], k[1], k[2], pc(k[0], n), pc(k[1], n), pc(k[2], n), sum(r['rank'] for r in rows) / n))
    print('errors or timeouts: %d   games with score -1: %d' % (sum(len(r['err']) for r in rows), sum(r['score'] < 0 for r in rows)))
    C = sum(r['catches'] for r in rows); U = sum(r['N'] for r in rows); L = sum(r['lost'] for r in rows)
    print('catches per game %.2f (%s of the prey units)   units lost per game %.2f (%s of ours)' % (C / n, pc(C, U), L / n, pc(L, U)))
    print('prey team scored %.2f per game, predator team %.2f per game (= our losses)' % (sum(r['preyScore'] for r in rows) / n, sum(r['predScore'] for r in rows) / n))
    f = sorted(r['ct'][0] for r in rows if r['ct'])
    print('first catch: in %s of games, median turn %s; no catch at all in %d games' % (pc(len(f), n), f[len(f) // 2] if f else '-', n - len(f)))
    group(rows, lambda r: r['seat'], 'seat')
    group(rows, lambda r: r['N'], 'units per team')
    T = sum(r['nets'] for r in rows)
    print('nets thrown %.1f per game: hit prey %s, hit predator %s, missed %s; prey hits turned into a catch %s' % (
        T / n, pc(sum(r['netPrey'] for r in rows), T), pc(sum(r['netPred'] for r in rows), T), pc(sum(r['netMiss'] for r in rows), T),
        pc(sum(r['netConv'] for r in rows), sum(r['netPrey'] for r in rows))))
    print('smokes %.1f, decoys %.1f per game; our units netted %.1f times per game' % (sum(r['smoke'] for r in rows) / n, sum(r['decoy'] for r in rows) / n, sum(r['timesNetted'] for r in rows) / n))
    D = [d for r in rows for d in r['deaths']]
    print('our losses (%d): netted first %s | at radius > 6500: %s | on a turn we dashed: %s | by turn 10: %s' % (
        len(D), pc(sum(d['netted'] for d in D), len(D)), pc(sum(d['R'] > 6500 for d in D), len(D)), pc(sum(d['dash'] for d in D), len(D)), pc(sum(d['t'] <= 10 for d in D), len(D))))
    print('   by tag of the last order:', dict(collections.Counter(d['tag'] for d in D).most_common()))
    print('   free (not netted) losses by tag:', dict(collections.Counter(d['tag'] for d in D if not d['netted']).most_common()))
    tb = [r for r in rows if r['rank'] > 1 and r['catches'] == max(r['othercatch'])]
    print('not first although level on catches with the winner (tie-break): %d games' % len(tb))
    under = [r for r in rows if r['rank'] > 1 and r['catches'] < max(r['othercatch'])]
    print('not first with fewer catches: %d games; of those the winner was our prey team %d, our predator team %d' % (
        len(under), sum(r['preyScore'] > r['predScore'] for r in under), sum(r['predScore'] >= r['preyScore'] for r in under)))
    opp = collections.defaultdict(list)
    for r in rows:
        opp['prey ' + r['prey']].append(r); opp['pred ' + r['pred']].append(r)
    print(' match-ups with 3 or more games, worst first:')
    for kk, q in sorted(opp.items(), key=lambda kv: -sum(r['rank'] for r in kv[1]) / len(kv[1])):
        if len(q) >= 3:
            print('   %-36s n %d mean rank %.2f catches %.1f lost %.1f' % (kk, len(q), sum(r['rank'] for r in q) / len(q), sum(r['catches'] for r in q) / len(q), sum(r['lost'] for r in q) / len(q)))


if __name__ == '__main__':
    d = sys.argv[1]
    for bf in sys.argv[2:]:
        rows = [study(*x) for x in load(d, bf)]
        report(bf, rows)
        json.dump(rows, open(os.path.join(d, bf.replace('battles_', 'rows_')), 'w'))
