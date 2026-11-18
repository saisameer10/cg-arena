# usage: python ppcause.py <folder of debug games>      (run where pp/ holds the compiled instrumented bot)
# Why a unit steps back and forth: re-runs the bot on the input of its own debug games (replay.py) and reads two
# extra stderr lines per unit and turn: 'G turn id target vis age gx gy x y nearestThreat tag order' and
# 'H turn id wx wy bestx besty straightx straighty gain hiddenBest hiddenStraight mateBest mateStraight oldPred
# threatBest threatStraight threats'. Both are printed after the line that sets u.tag in decide(); the time guard
# (nanoTime > 25 ms) is replaced by false so that the run does not depend on the machine.
import json, sys, glob, subprocess, math, collections, os
JAVA = 'D:/tools/jdk-21/bin/java'
def ang(a, b):
    la = math.hypot(*a); lb = math.hypot(*b)
    return 180 if la < 1 or lb < 1 else math.degrees(math.acos(max(-1, min(1, (a[0] * b[0] + a[1] * b[1]) / (la * lb)))))
kinds = collections.Counter(); ex = collections.defaultdict(list); hh = 0; n = 0; steps = 0; allpp = 0; tagpp = collections.Counter(); tagkind = collections.Counter()
for fn in sorted(glob.glob(sys.argv[1] + '/*.json')):
    d = json.load(open(fn, encoding='utf-8'))
    if 'log' not in d: continue
    seat = [a['index'] for a in d['log']['agents'] if a.get('me')][0]
    subprocess.run(['python', 'E:/New folder/prep/try-catch-forest/tools/replay.py', fn, str(seat), 'pp/in.txt'], capture_output=True)
    p = subprocess.run([JAVA, '-cp', 'pp', 'Player'], stdin=open('pp/in.txt'), capture_output=True, timeout=300)
    G = collections.defaultdict(dict)
    for l in p.stderr.decode().split('\n'):
        w = l.split()
        if w and w[0] == 'G': G[int(w[1])][int(w[2])] = dict(tid=int(w[3]), vis=int(w[4]), age=int(w[5]), g=(int(w[6]), int(w[7])), p=(int(w[8]), int(w[9])), nt=int(w[10]), tag=w[11], cmd=' '.join(w[12:]))
        if w and w[0] == 'H':
            x = G[int(w[1])].get(int(w[2]))
            if x: x.update(w=(int(w[3]), int(w[4])), b=(int(w[5]), int(w[6])), dct=(int(w[7]), int(w[8])), gain=int(w[9]), hb=int(w[10]), hd=int(w[11]), sepB=int(w[12]), sepD=int(w[13]), op=int(w[14]), thB=int(w[15]), thD=int(w[16]), nth=int(w[17]))
    n += 1
    for t in sorted(G):
        for u, c in G[t].items():
            a = G.get(t - 1, {}).get(u); b = G.get(t + 1, {}).get(u)
            if not a or not b or 'w' not in a or 'w' not in c: continue
            s1 = math.hypot(c['p'][0] - a['p'][0], c['p'][1] - a['p'][1]); s2 = math.hypot(b['p'][0] - c['p'][0], b['p'][1] - c['p'][1])
            if s1 < 300 or s2 < 300: continue
            steps += 1
            if math.hypot(b['p'][0] - a['p'][0], b['p'][1] - a['p'][1]) >= 300: continue
            allpp += 1
            fam = lambda x: 'hunt' if x in ('HUNT', 'SHUNT', 'CATCH') else 'flee' if 'FLEE' in x else 'seek'
            tg = fam(a['tag']) + '->' + fam(c['tag']); tagpp[tg] += 1
            wa = (a['w'][0] - a['p'][0], a['w'][1] - a['p'][1]); wc = (c['w'][0] - c['p'][0], c['w'][1] - c['p'][1])
            ma = (c['p'][0] - a['p'][0], c['p'][1] - a['p'][1]); mc = (b['p'][0] - c['p'][0], b['p'][1] - c['p'][1])
            ga = (a['g'][0] - a['p'][0], a['g'][1] - a['p'][1]); gc = (c['g'][0] - c['p'][0], c['g'][1] - c['p'][1])
            if ang(wa, wc) > 100:
                if a['tid'] != c['tid']: k = 'waypoint flips: other target'
                elif ang(ga, gc) > 60: k = 'waypoint flips: same target, its goal point moved to the other side'
                else: k = 'waypoint flips: same goal, the way round a tree changes side'
            else:
                x = a if ang(ma, wa) > ang(mc, wc) else c          # the step that went against its waypoint
                if x['nth'] > 0 and x['thD'] < 3700 and x['thB'] > x['thD'] + 150: k = 'step against the goal: a predator within 3700 of the straight step'
                elif x['sepD'] < 700 and x['sepB'] > x['sepD']: k = 'step against the goal: a team mate stands on the straight step'
                elif x['hd'] > x['hb']: k = 'step against the goal: the straight step leads to ground nobody of ours sees'
                elif x['op'] < 2400: k = 'step against the goal: a predator was seen here 4 to 8 turns ago'
                elif ang(wa, ga) > 60 or ang(wc, gc) > 60: k = 'follows a waypoint that leads away from the goal (tree detour)'
                else: k = 'not explained by these'
            kinds[k] += 1; tagkind[(tg, k)] += 1
            if len(ex[k]) < 3: ex[k].append((os.path.basename(fn), t - 1, u, a, c))
print('games', n, 'steps', steps, 'ping-pong', allpp, '(%.1f%%)' % (100 * allpp / steps))
print('by tags:', dict(tagpp.most_common()))
for k, v in kinds.most_common(): print('  %5d (%2d%%)  %s' % (v, round(100 * v / allpp), k))
print('\nhunt->hunt only:')
for (tg, k), v in sorted(tagkind.items(), key=lambda kv: -kv[1]):
    if tg == 'hunt->hunt': print('  %5d  %s' % (v, k))
print('\nseek->seek only:')
for (tg, k), v in sorted(tagkind.items(), key=lambda kv: -kv[1]):
    if tg == 'seek->seek': print('  %5d  %s' % (v, k))
for k in ex:
    print('\n==', k)
    for e in ex[k]:
        a, c = e[3], e[4]
        print('   %s turn %d unit %d %s: at %s goal %s waypoint %s -> went to %s (straight step %s, hidden %d/%d, mate %d/%d, threat %d/%d) | then %s: goal %s waypoint %s -> %s' % (
            e[0], e[1], e[2], a['tag'], a['p'], a['g'], a['w'], c['p'], a['dct'], a['hb'], a['hd'], a['sepB'], a['sepD'], a['thB'], a['thD'], c['tag'], c['g'], c['w'], c['cmd']))
