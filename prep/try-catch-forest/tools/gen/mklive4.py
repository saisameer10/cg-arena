import io, os
src = 'E:/New folder/prep/try-catch-forest/versions/vlive_41748059.java'
outs = ['E:/cg-tmp/tcf/sub/vlive_net1/Player.java', 'E:/New folder/prep/try-catch-forest/versions/vlive_net1.java']
s = io.open(src, encoding='utf-8').read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)
rep("    static final boolean F_NETWIDE = true;",
    "    // ---- vlive_net1: the live code plus a net on turn 1. Teams rated about 23 throw 0.80 nets a game on turn 1\n"
    "    //      (28 % hit prey, 16 % become a catch by turn 6); the live code throws none (rule below: no net on turn 1 at\n"
    "    //      prey that can still dash). A net yields about the same whenever it is thrown (16 to 26 %), so this moves\n"
    "    //      catches earlier, it does not add any: of use for the tie-break and for 'no catch by turn 15'.\n"
    "    static final boolean F_NET1 = true;\n"
    "    static final double P_NET1 = 1900;        // farthest target of a turn-1 net (distance after our move)\n"
    "    // by units per team: teams at 23 get 0.01 catches from turn-1 nets with 3 units, 0.07 with 4, 0.15 with 5, 0.28 with 6\n"
    "    static final int[] P_NET1_MAX = {0, 0, 0, 0, 1, 2, 2};   // nets spent on turn 1 at most, index = units per team\n"
    "    static int net1Thrown = 0;\n"
    "    static final boolean F_NETWIDE = true;")
rep("                if (turn == 1 && q.cd == 0) continue;",
    "                if (turn == 1 && q.cd == 0 && !(F_NET1 && d <= P_NET1 && net1Thrown < P_NET1_MAX[Math.min(6, N)])) continue;")
rep("            if (bq != null) { out.add(net(u, bx, by)); bq.netTargeted = true; }\n        }\n        // 2. nets at the hunter",
    "            if (bq != null) { out.add(net(u, bx, by)); bq.netTargeted = true; if (turn == 1) net1Thrown++; }\n        }\n        // 2. nets at the hunter")
for o in outs:
    os.makedirs(os.path.dirname(o), exist_ok=True)
    io.open(o, 'w', encoding='utf-8', newline='\n').write(s)
print('vlive_net1 written', len(s))
