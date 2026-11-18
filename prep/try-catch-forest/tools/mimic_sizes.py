# Results per version from logs of sim/SimLog.java, for pools with a fixed team size (-Dunits=N).
#   python mimic_sizes.py <log-dir> [<log-dir> ...]        one table per folder
# Columns: games, mean rank, wins, last places, share of games with at least one catch by turn 15, mean rank with and
# without such a catch, catches, units lost (and as a share of the team), units lost by turn 10.
import json, glob, re, sys, collections
for d in sys.argv[1:]:
    st = collections.defaultdict(collections.Counter); N = 0
    for fn in glob.glob(d + '/*.json'):
        g = json.load(open(fn, encoding='utf-8'))
        N = int(re.search(r'N=(\d+)', g['game_options']).group(1))
        names = [a['name'] for a in g['agents']]
        t = 0; prev = 99; c15 = [0, 0, 0]; catch = [0, 0, 0]; lost = [0, 0, 0]; lost10 = [0, 0, 0]
        for f in g['frames']:
            a = f.get('agent')
            if a is None: continue
            if a <= prev: t += 1
            prev = a
            for l in (f.get('summary') or '').split('\n'):
                m = re.match(r"\$(\d)'s agent \d+ catches \$(\d)'s agent", l)
                if m:
                    h, v = int(m.group(1)), int(m.group(2)); catch[h] += 1; lost[v] += 1
                    if t <= 15: c15[h] += 1
                    if t <= 10: lost10[v] += 1
        for s in range(3):
            c = st[names[s]]; r = g['ranking'].index(s) + 1
            c['n'] += 1; c['rank'] += r; c['win'] += r == 1; c['last'] += r == 3
            c['e'] += c15[s] > 0; c['catch'] += catch[s]; c['lost'] += lost[s]; c['lost10'] += lost10[s]
            if c15[s] > 0: c['rank_e'] += r
            else: c['rank_n'] += r; c['n_n'] += 1
    print('%s: %d units per team' % (d, N))
    print('%-10s %5s %6s %6s %6s %10s %12s %12s %8s %6s %7s %7s' % ('version', 'games', 'rank', 'wins', 'last', 'catch<=15', 'rank if yes', 'rank if no', 'catches', 'lost', 'lost %', 'lost10'))
    for k, c in sorted(st.items(), key=lambda kv: kv[1]['rank'] / kv[1]['n']):
        n = c['n']; e = c['e']
        print('%-10s %5d %6.3f %5.1f%% %5.1f%% %9.0f%% %12s %12s %8.2f %6.2f %6.0f%% %7.2f' % (k, n, c['rank'] / n, 100 * c['win'] / n, 100 * c['last'] / n, 100 * e / n,
              '%.2f (%d)' % (c['rank_e'] / e, e) if e else '-', '%.2f (%d)' % (c['rank_n'] / c['n_n'], c['n_n']) if c['n_n'] else '-', c['catch'] / n, c['lost'] / n, 100 * c['lost'] / n / max(1, N), c['lost10'] / n))
