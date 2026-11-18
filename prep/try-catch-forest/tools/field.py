# usage: python field.py <dir> <battles_X.json> [min-games]
# Every team in our arena games (us included), one line each: results and habits, best mean rank first.
# Shows what the teams that beat us do differently (early catches, nets, dashes, smoke, decoys).
import json, sys, re, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arena

d = sys.argv[1]; minG = int(sys.argv[3]) if len(sys.argv) > 3 else 4
T = collections.defaultdict(lambda: collections.Counter())
for b, g, myseat in arena.load(d, sys.argv[2]):
    names = [a['name'] for a in g['agents']]
    t = 0; last = -1; N = 0
    st = [collections.Counter() for _ in range(3)]
    netted = {}
    for f in g['frames']:
        a = f.get('agent')
        if a is None: continue
        if last == -1 or a <= last: t += 1
        last = a
        o = f.get('stdout') or ''
        cmds = [c.split() for c in o.split(';') if c.split()]
        if t == 1 and a == myseat: N = len(set(c[1] for c in cmds if c[0] in ('MOVE', 'DASH') and len(c) > 1))
        st[a]['dash'] += sum(1 for c in cmds if c[0] == 'DASH')
        if t <= 5: st[a]['dash5'] += sum(1 for c in cmds if c[0] == 'DASH')
        st[a]['wait'] += sum(1 for c in cmds if c[0] == 'WAIT')
        for s in (f.get('summary') or '').split('\n'):
            m = re.match(r"\$(\d)'s agent (\d+) catches \$(\d)'s agent (\d+)", s)
            if m:
                h = int(m.group(1)); v = int(m.group(3))
                st[h]['catch'] += 1; st[v]['lost'] += 1
                if t <= 10: st[h]['c10'] += 1
                if t <= 20: st[h]['c20'] += 1
                if (v, m.group(4)) in netted and t - netted[(v, m.group(4))] <= 5: st[h]['cnet'] += 1
                if any(re.match(r"\$%d's agent %s dashes" % (h, m.group(2)), x) for x in (f.get('summary') or '').split('\n')): st[h]['cdash'] += 1
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
            if m: st[int(m.group(1))]['smoke'] += 1
            m = re.match(r"\$(\d)'s agent \d+ at .* deploys a decoy", s)
            if m: st[int(m.group(1))]['decoy'] += 1
    for s in range(3):
        k = 'US (' + names[s] + ')' if s == myseat else names[s]
        c = T[k]; c['n'] += 1; c['rank'] += g['ranking'].index(s) + 1; c['win'] += g['ranking'][0] == s; c['units'] += N
        for kk, v in st[s].items(): c[kk] += v
print('%-30s %3s %5s %5s | %5s %5s %5s %5s | %5s %6s %6s %7s | %5s %6s | %5s %5s' % ('team', 'n', 'rank', 'win%', 'catch', 'by10', 'by20', 'lost', 'nets', 'by t3', 'hit%', 'conv%', 'dash', 'in t5', 'smoke', 'decoy'))
for k, c in sorted(T.items(), key=lambda kv: kv[1]['rank'] / kv[1]['n']):
    n = c['n']
    if n < minG: continue
    print('%-30s %3d %5.2f %4d%% | %5.2f %5.2f %5.2f %5.2f | %5.1f %6.1f %5d%% %6d%% | %5.1f %6.1f | %5.1f %5.1f' % (
        k[:30], n, c['rank'] / n, round(100 * c['win'] / n), c['catch'] / n, c['c10'] / n, c['c20'] / n, c['lost'] / n,
        c['net'] / n, c['net3'] / n, round(100 * c['netprey'] / max(1, c['net'])), round(100 * c['cnet'] / max(1, c['netprey'])),
        c['dash'] / n, c['dash5'] / n, c['smoke'] / n, c['decoy'] / n))
