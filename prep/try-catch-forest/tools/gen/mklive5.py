# vlive_dash = live code + dashes spent on prey; vlive_first = vlive_net1 + the same (the "catch first" package).
import io, os
V = 'E:/New folder/prep/try-catch-forest/versions/'
def build(src, name, note):
    s = io.open(V + src, encoding='utf-8').read()
    def rep(a, b):
        nonlocal s
        assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)
    rep("    static final boolean F_NETWIDE = true;",
        "    // ---- " + note + "\n"
        "    //      With a dash ready, prey 1100 to 2100 away and no predator within 2500, the live code dashes at the prey in\n"
        "    //      5 % of turns, teams at 23 and 25 in 15 to 40 %; that dash doubles or triples the catches within three turns\n"
        "    //      and the hunter is lost in 0 to 1 % of those turns either way. A dash unused at turn 100 is worth nothing.\n"
        "    static final boolean F_DASHPREY = true;\n"
        "    static final double P_DP_MIN = 1100, P_DP_MAX = 2700, P_DP_PRED = 2500;   // prey distance band, nearest predator\n"
        "    static final int P_DP_FAT = 4, P_DP_LATE = 60;                           // dashes already made at most; no limit from this turn\n"
        "    static final boolean F_NETWIDE = true;")
    rep("            for (int sp = 0; sp < 2; sp++) {\n                // dashes are a budget",
        "            if (F_DASHPREY && !approachDash && target != null && turn - target.seen <= 1 && target.immob == 0 && ntF > P_DP_PRED\n"
        "                    && (u.fat <= P_DP_FAT || turn >= P_DP_LATE)) {\n"
        "                double dq = hyp(target.x - u.x, target.y - u.y);\n"
        "                if (dq >= P_DP_MIN && dq <= P_DP_MAX) approachDash = true;\n"
        "            }\n"
        "            boolean dashLikely = F_DASHPREY && ntF > P_DP_PRED && (u.fat <= P_DP_FAT || turn >= P_DP_LATE);   // a likely catch is worth a later dash too\n"
        "            for (int sp = 0; sp < 2; sp++) {\n                // dashes are a budget")
    rep("(lastReward >= 25000 && u.fat <= (aggro ? AG_FAT : 2)))) continue;",
        "(lastReward >= 25000 && (dashLikely || u.fat <= (aggro ? AG_FAT : 2))))) continue;")
    if name == 'vlive_first':
        # teams at 23 throw 2.24 nets a game in turns 1 to 5 (33 % hit prey), we 1.04; two or more in one turn 0.44 against 0.10
        rep("    static final boolean F_DASHPREY = true;", "    static final boolean F_NETEARLY = true;   // turns 1 to P_NETEARLY: a net at any prey in reach, no reserve kept\n    static final int P_NETEARLY = 5;\n    static final boolean F_DASHPREY = true;")
        rep("if (!sure && (nets < 2 || !F_NETWIDE) && !(followUp && F_NETWIDE)) continue;", "if (!sure && !(F_NETEARLY && turn <= P_NETEARLY) && (nets < 2 || !F_NETWIDE) && !(followUp && F_NETWIDE)) continue;")
    if name == 'vlive_first':
        # fixes of 2026-11-19 03:00: (1) on turn 1 the net loop also reads prey placed by rotation that is not in sight
        # (starts 2,000 to 2,600 away, 14 % of games); (2) the turn-1 dash at prey needs no predator within 1,000, not 2,500
        rep("    static final boolean F_DASHPREY = true;",
            "    static final boolean F_NET1UNSEEN = true;  // turn 1: prey known from the rotation counts as a net target\n"
            "    static final double P_DP_PRED1 = 1000;     // turn 1: nearest predator allowed for the dash at prey\n"
            "    static final boolean F_DASHPREY = true;")
        rep("    static final double P_NET1 = 1900;", "    static final double P_NET1 = 2000;")
        rep("            for (E q : seenPrey) {\n                if (q.netTargeted || q.caughtNow || q.immob >= 2) continue;",
            "            List<E> netPrey = seenPrey;\n"
            "            if (F_NET1UNSEEN && turn == 1) {\n"
            "                netPrey = new ArrayList<>(seenPrey);\n"
            "                for (E t : tracks.values()) {\n"
            "                    if (t.owner != prey || t.vis || t.dead || t.seen != turn) continue;\n"
            "                    int j = t.id - prey * N; boolean gh = false;\n"
            "                    for (E m : mine) if (m.id - myId * N == j && m.ghost) gh = true;   // its counterpart of ours is a ghost: so is it\n"
            "                    if (!gh) netPrey.add(t);\n"
            "                }\n"
            "            }\n"
            "            for (E q : netPrey) {\n                if (q.netTargeted || q.caughtNow || q.immob >= 2) continue;")
        rep("target.immob == 0 && ntF > P_DP_PRED\n", "target.immob == 0 && ntF > (turn == 1 ? P_DP_PRED1 : P_DP_PRED)\n")
    for o in ('E:/cg-tmp/tcf/sub/%s/Player.java' % name, V + name + '.java'):
        os.makedirs(os.path.dirname(o), exist_ok=True)
        io.open(o, 'w', encoding='utf-8', newline='\n').write(s)
    print(name, 'written', len(s))
build('vlive_41748059.java', 'vlive_dash', 'vlive_dash: the live code plus dashes spent on prey.')
build('vlive_net1.java', 'vlive_first', 'vlive_first: vlive_net1 (nets on turn 1) plus dashes spent on prey: the "catch first" package.')
