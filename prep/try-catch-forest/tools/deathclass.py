# usage: python deathclass.py <debug-game.json>...
# Classifies every loss of ours in debug games (replays of arena battles or test games) by what led to it.
# A loss can carry several labels.
import json, sys, re, math, collections

tot = collections.Counter(); n = 0; games = 0; examples = collections.defaultdict(list)
for fn in sys.argv[1:]:
    d = json.load(open(fn, encoding='utf-8'))
    if 'log' not in d:
        continue
    games += 1
    log = d['log']; me = [a['index'] for a in log['agents'] if a.get('me')][0]; pred = (me + 2) % 3
    t = 0; last = -1; out = {}; summ = collections.defaultdict(list); M = {}; E = {}; smokes = []
    for f in log['frames']:
        a = f.get('agent')
        if a is None:
            continue
        if last == -1 or a <= last:
            t += 1
        last = a
        if a == me:
            out[t] = f.get('stdout') or ''; M[t] = {}; E[t] = []
            for l in (f.get('stderr') or '').split('\n'):
                x = l.split()
                if l.startswith('M '): M[t][x[1]] = x
                elif l.startswith('E ') and x[2] == 'UNIT' and int(x[3]) == pred: E[t].append(x)
        for l in (f.get('summary') or '').split('\n'):
            if l:
                summ[t].append(l)
                m = re.match(r"\$%d's agent \d+ at .* deploys smoke at \((-?\d+), (-?\d+)\)" % me, l)
                if m: smokes.append((t, int(m.group(1)), int(m.group(2))))
    for tt in sorted(summ):
        for l in summ[tt]:
            m = re.match(r"\$(\d)'s agent (\d+) catches \$%d's agent (\d+) at \((-?\d+), (-?\d+)\)" % me, l)
            if not m:
                continue
            n += 1; u = m.group(3); killer = m.group(2); labels = []
            mu = M.get(tt, {}).get(u)
            if not mu:
                tot['no data'] += 1; continue
            x, y = float(mu[4]), float(mu[5])
            def seen(k):
                mk = M.get(k, {}).get(u)
                if not mk: return []
                return [math.hypot(float(e[4]) - float(mk[4]), float(e[5]) - float(mk[5])) for e in E.get(k, [])]
            near3 = [min(seen(k) or [9e9]) for k in (tt - 2, tt - 1, tt)]
            if mu[11] != '0': labels.append('held by a net')
            if all(v > 2600 for v in near3): labels.append('no predator seen in the last 3 turns')
            elif min(seen(tt) or [9e9]) > 2600: labels.append('predator out of sight on the last turn')
            if any(tt - st >= 1 and tt - st <= 9 and math.hypot(x - sx, y - sy) < 1900 for (st, sx, sy) in smokes): labels.append('inside our own smoke')
            # stuck: ordered to move on the previous turn, did not move
            mp = M.get(tt - 1, {}).get(u)
            prevcmd = [c for c in out.get(tt - 1, '').split(';') if len(c.split()) > 1 and c.split()[1] == u and c.split()[0] in ('MOVE', 'DASH')]
            if mp and prevcmd and mu[11] == '0' and mp[11] == '0' and math.hypot(x - float(mp[4]), y - float(mp[5])) < 30: labels.append('ordered to move but did not (wedged)')
            cmd = [c for c in out.get(tt, '').split(';') if len(c.split()) > 1 and c.split()[1] == u and c.split()[0] in ('MOVE', 'DASH')]
            if not cmd and mu[11] == '0': labels.append('standing still by choice')
            if any(v != mu and v[8] == '0' and math.hypot(float(v[4]) - x, float(v[5]) - y) < 300 for v in M[tt].values()): labels.append('stacked with a team mate')
            if math.hypot(x, y) > 6800: labels.append('at the wall (radius > 6800)')
            if sum(1 for v in seen(tt) if v < 1500) >= 2: labels.append('two or more predators within 1500')
            kd = any(re.match(r"\$%d's agent %s dashes" % (pred, killer), s) for s in summ[tt])
            if kd: labels.append('catcher dashed' + (' and our dash was on cooldown' if mu[9] != '0' else ' and our dash was ready'))
            if int(mu[10]) >= 4: labels.append('three or more dashes already spent')
            if not labels: labels.append('other')
            for lb in labels:
                tot[lb] += 1
                if len(examples[lb]) < 4: examples[lb].append('%s t%d u%s' % (fn.split('/')[-1].split('.')[0], tt, u))
print('games', games, 'losses', n)
for k, v in tot.most_common():
    print('  %3d  %3d%%  %-52s e.g. %s' % (v, round(100 * v / max(1, n)), k, ', '.join(examples[k][:3])))
