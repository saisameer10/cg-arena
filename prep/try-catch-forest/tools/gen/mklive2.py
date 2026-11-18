import io, os
src = 'E:/cg-tmp/tcf/sub/vlive_late/Player.java'
outs = ['E:/cg-tmp/tcf/sub/vlive_3p/Player.java', 'E:/New folder/prep/try-catch-forest/versions/vlive_3p.java']
s = io.open(src, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)
rep("    static boolean commitOn; static double softK = 1;\n",
    "    static boolean commitOn; static double softK = 1;\n"
    "    // ---- vlive_3p: the three-player levers of kb/target23.md. We always know two scores: ours, and the predator team's (= our units lost).\n"
    "    static final boolean F_NOTRADE = true;       // no unit-for-point trade while the predator team has as many points as we have\n"
    "    static final boolean F_HOLDLEAD = true;      // after turn P_HOLD_T with more points than the predator team: soft threat terms x P_HOLD\n"
    "    static final boolean F_HUNTHUNTERS = true;   // prefer the prey unit that is within 2000 of a predator in sight: it is about to score\n"
    "    static final double P_HOLD_T = 65, P_HOLD = 1.6, P_HUNTHUNTERS = 800;\n"
    "    static int myLost;\n")
rep("        double deathScale = reward >= 300000 ? 0.2 : 1;",
    "        double deathScale = reward >= 300000 && !(F_NOTRADE && myLost >= myScore + 1) ? 0.2 : 1;   // +1: the catch itself")
rep("        for (E u : mine) (u.ghost ? ghosts : live).add(u);",
    "        for (E u : mine) (u.ghost ? ghosts : live).add(u);\n        myLost = ghosts.size();")
rep("+ load.getOrDefault(q, 0) * 800;",
    "+ load.getOrDefault(q, 0) * 800 - (F_HUNTHUNTERS && nearPred(q) ? P_HUNTHUNTERS : 0);")
rep("{ softK = turn <= 10 ? P_HUNTFIRST_EARLY : P_HUNTFIRST; break; }",
    "{ softK = turn <= 10 ? P_HUNTFIRST_EARLY : P_HUNTFIRST; break; }\n"
    "            if (F_HOLDLEAD && turn > P_HOLD_T && myScore > myLost) softK = Math.max(softK, 1) * P_HOLD;")
rep("    static double eval(E u, double px, double py,",
    "    static boolean nearPred(E q) { for (E e : seenPred) if (hyp(e.x - q.x, e.y - q.y) < 2000) return true; return false; }\n\n"
    "    static double eval(E u, double px, double py,")
for o in outs:
    os.makedirs(os.path.dirname(o), exist_ok=True)
    io.open(o, 'w', encoding='utf-8', newline='\n').write(s)
print('vlive_3p written', len(s))
