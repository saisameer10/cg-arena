# vlive_combo = vlive_all3 (first turn + pressing dashes + held unit nets back) plus the three opening parts of vlive_first
# that all3 lacks: turn-1 dash and net also at prey known only from the rotation, and early nets without a sure aim
# (turns 2 to 5, capped). One file with every opening and dash lever that has evidence; a bundle, so its parts are
# read from vlive_t1, vlive_press and vlive_first in the same paired test.
import io, os
V = 'E:/New folder/prep/try-catch-forest/versions/'
s = io.open(V + 'vlive_all3.java', encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)
rep("    static final boolean F_T1 = true;",
    "    // ---- vlive_combo additions (tools/gen/mkcombo.py)\n"
    "    static final boolean F_T1UNSEEN = true;    // turn 1: prey placed by the rotation counts for the dash and the net (starts 2,000 to 2,600 away)\n"
    "    static final boolean F_NETEARLY = true;    // turns 2 to P_NETEARLY: a net at prey in reach without a sure aim, at most P_NETEARLY_MAX of them\n"
    "    static final int P_NETEARLY = 5, P_NETEARLY_MAX = 2;\n"
    "    static int earlyNets = 0;\n"
    "    static final boolean F_T1 = true;")
rep("P_T1_DASH = 2100,", "P_T1_DASH = 2700,")
rep("target != null && target.vis && u.cd == 0 && ntF > P_T1_SMOKE", "target != null && (target.vis || (F_T1UNSEEN && target.seen == turn)) && u.cd == 0 && ntF > P_T1_SMOKE")
rep("            for (E q : seenPrey) {\n                if (q.netTargeted || q.caughtNow || q.immob >= 2) continue;",
    "            List<E> netPrey = seenPrey;\n"
    "            if (F_T1UNSEEN && turn == 1) {\n"
    "                netPrey = new ArrayList<>(seenPrey);\n"
    "                for (E t : tracks.values()) {\n"
    "                    if (t.owner != prey || t.vis || t.dead || t.seen != turn) continue;\n"
    "                    int j = t.id - prey * N; boolean gh = false;\n"
    "                    for (E m : mine) if (m.id - myId * N == j && m.ghost) gh = true;\n"
    "                    if (!gh) netPrey.add(t);\n"
    "                }\n"
    "            }\n"
    "            for (E q : netPrey) {\n                if (q.netTargeted || q.caughtNow || q.immob >= 2) continue;")
rep("if (!sure && (nets < 2 || !F_NETWIDE) && !(followUp && F_NETWIDE)) continue;",
    "boolean earlyNet = F_NETEARLY && turn >= 2 && turn <= P_NETEARLY && earlyNets < P_NETEARLY_MAX && nets >= 2;\n"
    "                if (!sure && !earlyNet && (nets < 2 || !F_NETWIDE) && !(followUp && F_NETWIDE)) continue;")
rep("if (turn == 1) t1Nets++; }", "if (turn == 1) t1Nets++; else if (turn <= P_NETEARLY) earlyNets++; }")
for o in ('E:/cg-tmp/tcf/sub/vlive_combo/Player.java', V + 'vlive_combo.java'):
    os.makedirs(os.path.dirname(o), exist_ok=True)
    io.open(o, 'w', encoding='utf-8', newline='\n').write(s)
print('vlive_combo written', len(s))
