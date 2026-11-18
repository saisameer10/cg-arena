# usage: python topfield.py <dir-with-game-json-files> [min-games] [name-filter-file]
# Every team in a set of game logs (e.g. the games of the top players fetched with research/fetch.js), one line
# each: results and habits, best mean rank first. Same columns as field.py plus survival and first-catch figures.
import json, sys, re, os, glob, collections

d = sys.argv[1]; minG = int(sys.argv[2]) if len(sys.argv) > 2 else 15
T = collections.defaultdict(collections.Counter)
games = 0
for fn in glob.glob(os.path.join(d, '*.json')):
    try: g = json.load(open(fn, encoding='utf-8'))
    except ValueError: continue
    if 'frames' not in g or len(g.get('agents', [])) != 3: continue
    games += 1
    names = [a['name'] for a in g['agents']]
    t = 0; last = -1; N = 0
    st = [collections.Counter() for _ in range(3)]
    netted = {}; first = None
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1
        last = a
        o = f.get('stdout') or ''
        cmds = [c.split() for c in o.split(';') if c.split()]
        if t == 1: N = max(N, len(set(c[1] for c in cmds if c[0] in ('MOVE', 'DASH', 'WAIT', 'NET', 'SMOKE', 'DECOY') and len(c) > 1)))
        st[a]['dash'] += sum(1 for c in cmds if c[0] == 'DASH')
        if t <= 5: st[a]['dash5'] += sum(1 for c in cmds if c[0] == 'DASH')
        if t == 1:
            st[a]['t1dash'] += sum(1 for c in cmds if c[0] == 'DASH'); st[a]['t1net'] += sum(1 for c in cmds if c[0] == 'NET')
            st[a]['t1smoke'] += sum(1 for c in cmds if c[0] == 'SMOKE'); st[a]['t1decoy'] += sum(1 for c in cmds if c[0] == 'DECOY')
        summ = (f.get('summary') or '').split('\n')
        for s in summ:
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m:
                h = int(m.group(1)); v = int(m.group(3))
                st[h]['catch'] += 1; st[v]['lost'] += 1
                if first is None: first = h
                if t <= 10: st[h]['c10'] += 1; st[v]['l10'] += 1
                if t <= 20: st[h]['c20'] += 1
                if (v, m.group(4)) in netted and t - netted[(v, m.group(4))] <= 5: st[h]['cnet'] += 1; st[v]['lnet'] += 1
                if any(re.match(r"\$%d's agent %s dashes" % (h, m.group(2)), x) for x in summ): st[h]['cdash'] += 1
            m = re.match(r"\$(\d)'s agent (\d+) at .* throws a net", s)
            if m:
                h = int(m.group(1)); st[h]['net'] += 1
                if t <= 3: st[h]['net3'] += 1
                tail = s.split(' nets ', 1)[1] if ' nets ' in s else ''
                hit = False
                for pl, un in re.findall(r"\$(\d)'s agent (\d+)", tail):
                    if int(pl) == (h + 1) % 3: hit = True; netted[(int(pl), un)] = t
                    if int(pl) == (h + 2) % 3: st[h]['netpred'] += 1
                if hit: st[h]['netprey'] += 1
            m = re.match(r"\$(\d)'s agent \d+ at .* deploys smoke", s)
            if m:
                st[int(m.group(1))]['smoke'] += 1
                if t <= 5: st[int(m.group(1))]['smoke5'] += 1
            m = re.match(r"\$(\d)'s agent \d+ at .* deploys a decoy", s)
            if m: st[int(m.group(1))]['decoy'] += 1
    for s in range(3):
        c = T[names[s]]; c['n'] += 1; c['rank'] += g['ranking'].index(s) + 1; c['win'] += g['ranking'][0] == s; c['last'] += g['ranking'][2] == s; c['units'] += N
        c['first'] += first == s
        for kk, v in st[s].items(): c[kk] += v
print('games', games)
print('%-24s %4s %5s %4s %5s | %5s %5s %5s %5s %5s %6s | %5s %5s %5s %6s %6s | %5s %5s %5s | %5s %5s %5s' % (
    'team', 'n', 'rank', 'win%', 'last%', 'catch', 'by10', 'by20', 'lost', 'l<=10', '1st%', 'nets', 'by t3', 'hit%', 'conv%', 'pred%', 'dash', 'in t5', 't1', 'smoke', 'in t5', 'decoy'))
for k, c in sorted(T.items(), key=lambda kv: kv[1]['rank'] / kv[1]['n']):
    n = c['n']
    if n < minG: continue
    print('%-24s %4d %5.2f %3d%% %4d%% | %5.2f %5.2f %5.2f %5.2f %5.2f %5d%% | %5.1f %5.1f %4d%% %5d%% %5d%% | %5.1f %5.1f %5.1f | %5.1f %5.1f %5.1f' % (
        k[:24], n, c['rank'] / n, round(100 * c['win'] / n), round(100 * c['last'] / n), c['catch'] / n, c['c10'] / n, c['c20'] / n, c['lost'] / n, c['l10'] / n, round(100 * c['first'] / n),
        c['net'] / n, c['net3'] / n, round(100 * c['netprey'] / max(1, c['net'])), round(100 * c['cnet'] / max(1, c['netprey'])), round(100 * c['netpred'] / max(1, c['net'])),
        c['dash'] / n, c['dash5'] / n, c['t1dash'] / n, c['smoke'] / n, c['smoke5'] / n, c['decoy'] / n))
