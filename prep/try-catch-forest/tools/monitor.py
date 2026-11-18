# usage: python monitor.py <live_submission_id> <min_games> <max_minutes>
# Waits until the live submission has <min_games> finished arena games (or the time is up), then prints its record
# by team size next to v10's and the mimic's arena records.
import json, os, subprocess, sys, time, collections

sub, need, maxmin = sys.argv[1], int(sys.argv[2]), float(sys.argv[3])
T = os.path.dirname(os.path.abspath(__file__))
tok = open(os.path.expanduser('~/.config/codingame/token')).read().strip()
t0 = time.time()
while True:
    subprocess.run([sys.executable, 'fetch.py', sub], capture_output=True)
    subprocess.run([sys.executable, T + '/arena.py', '.', 'battles_%s.json' % sub], capture_output=True)
    try: rows = json.load(open('rows_%s.json' % sub))
    except Exception: rows = []
    if len(rows) >= need or time.time() - t0 > maxmin * 60: break
    time.sleep(120)
r = subprocess.run(['curl', '-s', '-m', '30', '-H', 'Authorization: Bearer ' + tok, 'https://www.codingame.com/api/v1/challenges/unleash-the-geek-2026-opp35/progress'], capture_output=True)
try:
    p = json.loads(r.stdout.decode('utf-8')); print('arena now:', {k: p.get(k) for k in ('submission_id', 'percentage', 'score', 'rank', 'league_total')})
except Exception: pass

def table(name, fn):
    try: rows = json.load(open(fn))
    except Exception: print(name, 'no data'); return
    n = len(rows)
    if not n: print(name, 'no games'); return
    f = lambda q, k: sum(x[k] for x in q) / len(q)
    c10 = lambda q: sum(sum(1 for t in x['ct'] if t <= 10) for x in q) / len(q)
    print('%-34s games %2d  first %d second %d last %d  mean rank %.2f  catches %.2f (by turn 10 %.2f)  lost %.2f' % (name, n, sum(x['rank'] == 1 for x in rows), sum(x['rank'] == 2 for x in rows), sum(x['rank'] == 3 for x in rows), f(rows, 'rank'), f(rows, 'catches'), c10(rows), f(rows, 'lost')))
    by = collections.defaultdict(list)
    for x in rows: by[x['N']].append(x)
    print('      by team size: ' + ' | '.join('%d units: %d games, rank %.2f, lost %d%%' % (k, len(v), f(v, 'rank'), round(100 * sum(x['lost'] for x in v) / (k * len(v)))) for k, v in sorted(by.items())))

table('HYBRID (live, %s)' % sub, 'rows_%s.json' % sub)
table('v10 (arena, 41743202)', 'rows_41743202.json')
table('mimic (arena, 41746943)', 'rows_41746943.json')
table('v5 (Gold arena, 41742767)', 'rows_41742767.json')
print('minutes waited: %.0f' % ((time.time() - t0) / 60))
