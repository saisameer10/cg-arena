# usage: python netfail.py <debug-replay-dir> [more dirs]
# Every net of ours that hit a prey unit: was the unit caught within 5 turns, and if not, why not.
import json, glob, math, os, re, sys, collections

tot = collections.Counter(); why = collections.Counter(); ex = collections.defaultdict(list)
d0s = {'conv': [], 'fail': []}
for d in sys.argv[1:]:
    for fn in glob.glob(os.path.join(d, '*.json')):
        try: g = json.load(open(fn, encoding='utf-8'))
        except ValueError: continue
        if 'log' not in g: continue
        log = g['log']; me = [a['index'] for a in log['agents'] if a.get('me')][0]; prey = (me + 1) % 3; pred = (me + 2) % 3
        t = 0; last = -1; M = {}; E = {}; out = {}; summ = collections.defaultdict(list)
        for f in log['frames']:
            a = f.get('agent')
            if a is None: continue
            if last == -1 or a <= last: t += 1
            last = a
            if a == me:
                out[t] = f.get('stdout') or ''; M[t] = {}; E[t] = {}
                for l in (f.get('stderr') or '').split('\n'):
                    x = l.split()
                    if l.startswith('M '): M[t][x[1]] = x
                    elif l.startswith('E ') and len(x) > 6 and x[2] == 'UNIT': E[t].setdefault(int(x[3]), []).append(x)
            for s in (f.get('summary') or '').split('\n'):
                if s: summ[t].append(s)
        caught = {}
        for tt in summ:
            for s in summ[tt]:
                m = re.match(r"\$%d's agent (\d+) catches \$%d's agent (\d+)" % (me, prey), s)
                if m: caught[m.group(2)] = tt
        for tt in sorted(summ):
            for s in summ[tt]:
                m = re.match(r"\$%d's agent (\d+) at \((-?\d+), (-?\d+)\) throws a net" % me, s)
                if not m or ' nets ' not in s: continue
                thrower = m.group(1)
                for pl, un in re.findall(r"\$(\d)'s agent (\d+)", s.split(' nets ', 1)[1]):
                    if int(pl) != prey: continue
                    tot['hits on prey'] += 1
                    conv = un in caught and tt < caught[un] <= tt + 5
                    # position of the held unit: where we see it on the next turn
                    pos = None
                    for k in (tt + 1, tt + 2, tt):
                        for e in E.get(k, {}).get(prey, []):
                            if e[1] == un: pos = (float(e[4]), float(e[5])); break
                        if pos: break
                    def hunters(k):
                        res = []
                        for uid, mm in M.get(k, {}).items():
                            if mm[8] != '0' or not pos: continue
                            res.append((math.hypot(float(mm[4]) - pos[0], float(mm[5]) - pos[1]), uid, mm))
                        return sorted(res)
                    h0 = hunters(tt + 1)
                    dist0 = h0[0][0] if h0 else None
                    if conv:
                        tot['converted'] += 1
                        if dist0 is not None: d0s['conv'].append(dist0)
                        continue
                    if dist0 is not None: d0s['fail'].append(dist0)
                    if pos is None:
                        why['held unit never seen again (smoke or out of sight)'] += 1; continue
                    if not h0:
                        why['no living unit of ours'] += 1; continue
                    uid = h0[0][1]; tags = []; held = 0; seen = 0; mind = dist0; pd = []
                    for k in range(tt + 1, tt + 5):
                        mm = M.get(k, {}).get(uid)
                        if not mm or mm[8] != '0': tags.append('DEAD'); continue
                        cs = [c.split() for c in out.get(k, '').split(';') if len(c.split()) > 4 and c.split()[1] == uid and c.split()[0] in ('MOVE', 'DASH')]
                        tags.append(cs[0][4] if cs else ('HELD' if mm[11] != '0' else 'STAY'))
                        if mm[11] != '0': held += 1
                        if any(e[1] == un for e in E.get(k, {}).get(prey, [])): seen += 1
                        mind = min(mind, math.hypot(float(mm[4]) - pos[0], float(mm[5]) - pos[1]))
                        ps = [math.hypot(float(mm[4]) - float(e[4]), float(mm[5]) - float(e[5])) for e in E.get(k, {}).get(pred, [])]
                        if ps: pd.append(min(ps))
                    if 'DEAD' in tags[:3]: r = 'nearest hunter was caught on the way'
                    elif held >= 2: r = 'nearest hunter was held by a net itself'
                    elif dist0 > 2840: r = 'nearest hunter too far to walk in (over 2840)'
                    elif tags.count('FLEE') >= 2: r = 'nearest hunter fled from a predator instead'
                    elif seen <= 1: r = 'lost sight of the held unit'
                    elif mind < 700: r = 'hunter got within 700 and still no catch (freed, or blocked)'
                    else: r = 'hunter walked but did not arrive in time (start %d-%d)' % (int(dist0 // 1000) * 1000, int(dist0 // 1000) * 1000 + 1000)
                    why[r] += 1
                    if len(ex[r]) < 3: ex[r].append('%s t%d unit %s thrower %s nearest %s at %d tags %s predator %s' % (os.path.basename(fn)[:9], tt, un, thrower, uid, dist0, tags, int(min(pd)) if pd else None))
print(dict(tot), 'conversion %d%%' % round(100 * tot['converted'] / max(1, tot['hits on prey'])))
for k in ('conv', 'fail'):
    q = sorted(d0s[k])
    if q: print('distance of our nearest unit to the held prey on the turn after the hit, %s: median %d, quartiles %d / %d (n %d)' % ('converted' if k == 'conv' else 'not converted', q[len(q) // 2], q[len(q) // 4], q[3 * len(q) // 4], len(q)))
n = sum(why.values())
print('not converted: %d' % n)
for k, v in why.most_common():
    print('  %2d  %3d%%  %s' % (v, round(100 * v / max(1, n)), k))
    for e in ex[k][:2]: print('          e.g.', e)
