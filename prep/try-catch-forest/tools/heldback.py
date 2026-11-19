# usage (in the folder with games/): python heldback.py <battles_SUB.json> [...]
# Every time one of our units is netted: what that unit does while it is held (the first power it uses in the turn of
# the net and the four turns after it) and whether it is caught within six turns. Also who threw the net.
import json, sys, re, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import arena
for bf in sys.argv[1:]:
    C = collections.Counter(); D = collections.Counter(); E = collections.Counter(); ED = collections.Counter(); n = 0; who = collections.Counter()
    for b, g, seat in arena.load('.', bf):
        n += 1; t = 0; last = -1; ev = collections.defaultdict(list)
        for f in g['frames']:
            a = f.get('agent')
            if a is None: continue
            if last == -1 or a <= last: t += 1
            last = a
            for s in (f.get('summary') or '').split('\n'):
                if s: ev[t].append(s)
        pred = (seat + 2) % 3
        for t0 in sorted(ev):
            for s in ev[t0]:
                m = re.match(r"\$(\d)'s agent (\d+) at .* throws a net .* and nets (.*)$", s)
                if not m: continue
                for u in re.findall(r"\$%d's agent (\d+)" % seat, m.group(3)):
                    thrower = int(m.group(1)); who['predator team' if thrower == pred else 'own team' if thrower == seat else 'prey team'] += 1
                    resp = 'nothing'; caught = False
                    for t1 in range(t0, t0 + 5):
                        for s2 in ev.get(t1, []):
                            if resp == 'nothing' and re.match(r"\$%d's agent %s at " % (seat, u), s2) and not (t1 == t0 and s2 is s):
                                if 'throws a net' in s2:
                                    hit = re.search(r"and nets (.*)$", s2)
                                    resp = 'net, hits a predator' if hit and ("$%d's" % pred) in hit.group(1) else 'net, hits prey' if hit else 'net, misses'
                                elif 'deploys smoke' in s2: resp = 'smoke'
                                elif 'decoy' in s2: resp = 'decoy'
                    for t1 in range(t0, t0 + 7):
                        for s2 in ev.get(t1, []):
                            if re.search(r"catches \$%d's agent %s " % (seat, u), s2): caught = True
                    C[resp] += 1; D[resp] += caught
                    if t0 <= 10: E[resp] += 1; ED[resp] += caught
    tot = sum(C.values()) or 1
    print('\n%s: %d games, our units netted %d times (%.2f a game); thrown by %s' % (bf, n, tot, tot / max(1, n), dict(who)))
    print('  %-22s %5s %6s %18s | turns 1-10: %5s %18s' % ('what the unit does', 'cases', 'share', 'caught in 6 turns', 'cases', 'caught in 6 turns'))
    for k, v in C.most_common():
        print('  %-22s %5d %5.0f%% %17.0f%% | %17d %17s' % (k, v, 100 * v / tot, 100 * D[k] / v, E[k], ('%.0f%%' % (100 * ED[k] / E[k])) if E[k] else '-'))
    print('  %-22s %5d %5s %17.0f%% | %17d %17s' % ('all', tot, '', 100 * sum(D.values()) / tot, sum(E.values()), '%.0f%%' % (100 * sum(ED.values()) / max(1, sum(E.values())))))
