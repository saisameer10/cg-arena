# Validity check of one bot's orders in logs written by sim/SimLog.java.
#   python mimic_check.py <log-dir> <version name>
# Counts: orders for a unit that is not ours; DASH orders the referee did not execute (cooldown) although the unit
# was alive and free; powers ordered beyond the pool (ordered but not executed by a unit that was not caught on
# that turn); games that did not reach the end (crash or hang). All must be 0.
import json, glob, re, sys, collections
d, name = sys.argv[1], sys.argv[2]
bad = collections.Counter(); games = 0; turns = 0; orders = collections.Counter(); examples = []
for fn in sorted(glob.glob(d + '/*.json')):
    g = json.load(open(fn, encoding='utf-8'))
    seats = [a['index'] for a in g['agents'] if a['name'] == name]
    if not seats: continue
    s = seats[0]; games += 1
    N = int(re.search(r'N=(\d+)', g['game_options']).group(1))
    mine = set(range(s * N, s * N + N))
    held = {}; caught = set(); t = 0; prev = 99; pend = None; alive_teams = set()
    frames = [f for f in g['frames'] if 'agent' in f]
    i = 0
    while i < len(frames):
        # one turn = consecutive frames with rising agent index
        j = i + 1
        while j < len(frames) and frames[j]['agent'] > frames[j - 1]['agent']: j += 1
        t += 1; turn = frames[i:j]; summ = '\n'.join(f.get('summary') or '' for f in turn)
        out = next((f['stdout'] for f in turn if f['agent'] == s), None)
        caught_now = set(int(m.group(1)) for m in re.finditer(r"catches \$%d's agent (\d+)" % s, summ))
        if out is not None:
            turns += 1
            for c in out.split(';'):
                f = c.split()
                if not f or f[0] == 'WAIT': continue
                if f[0] not in ('MOVE', 'DASH', 'NET', 'SMOKE', 'DECOY') or len(f) < 4: bad['malformed order'] += 1; examples.append((fn, t, c)); continue
                u = int(f[1]); orders[f[0]] += 1
                if u not in mine: bad['order for a unit that is not ours'] += 1; examples.append((fn, t, c)); continue
                if f[0] == 'DASH':
                    done = re.search(r"\$%d's agent %d dashes from" % (s, u), summ)
                    if not done and held.get(u, 0) < t: bad['DASH not executed (cooldown)'] += 1; examples.append((fn, t, c))
                    if not done and held.get(u, 0) >= t: bad['DASH ordered by a held unit'] += 1
                if f[0] in ('NET', 'SMOKE', 'DECOY'):
                    if u in caught: bad['power ordered by a ghost'] += 1; examples.append((fn, t, c)); continue
                    word = {'NET': 'throws a net', 'SMOKE': 'deploys smoke', 'DECOY': 'deploys a decoy'}[f[0]]
                    done = re.search(r"\$%d's agent %d at [^\n]*%s" % (s, u, word), summ)
                    if not done and u not in caught_now: bad['%s ordered with an empty pool' % f[0]] += 1; examples.append((fn, t, c))
        for m in re.finditer(r"and nets ([^\n]*)", summ):
            for h in re.finditer(r"\$(\d)'s agent (\d+)", m.group(1)):
                if int(h.group(1)) == s: held[int(h.group(2))] = t + 4
        caught |= caught_now
        i = j
    over = t >= 100 or len(caught) >= N or sum(1 for p in range(3) if p != s) == 2 and t >= 1 and len(frames[-1].get('summary', '')) >= 0 and (t >= 100 or len(set(f['agent'] for f in frames[-3:])) <= 2)
    if not over: bad['game ended early with the bot alive (crash or hang?)'] += 1; examples.append((fn, t, 'end'))
print('%s: %d games, %d turns answered, orders: %s' % (name, games, turns, dict(orders)))
for k in ('order for a unit that is not ours', 'malformed order', 'DASH not executed (cooldown)', 'DASH ordered by a held unit', 'power ordered by a ghost', 'NET ordered with an empty pool', 'SMOKE ordered with an empty pool', 'DECOY ordered with an empty pool', 'game ended early with the bot alive (crash or hang?)'):
    print('  %-55s %d' % (k, bad[k]))
for e in examples[:8]: print('  example:', e)
