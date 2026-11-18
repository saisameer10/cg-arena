# builds three candidates from the live code (vlive_41748059), evidence in kb/target25.md sections 4 and 6:
#   versions/vlive_t1.java    = live + F_T1   (turn 1: dash at prey in sight and net it, no smoke unless a predator is close)
#   versions/vlive_hnet.java  = live + F_HNET (a held unit nets back before it smokes, also with an unsure aim)
#   versions/vlive_all3.java  = vlive_press + F_T1 + F_HNET (the three rules of target25.md together)
import io, os
ROOT = 'E:/New folder/prep/try-catch-forest/versions/'
SUB = 'E:/cg-tmp/tcf/sub/'


def rep(s, a, b):
    assert s.count(a) == 1, (a[:80], s.count(a))
    return s.replace(a, b)


def t1(s):
    s = rep(s, "    static boolean approachDash;",
            "    // ---- F_T1: the first turn. With prey within 2000 on turn 1, teams rated 25 dash at it in 66 % of the cases and net\n"
            "    //      it in 38 % (a third of those nets hit); the live code dashes in 42 %, never nets and smokes in 32 %. That prey\n"
            "    //      is caught by turn 5 in 25 % of their games and 12 % of ours. Rule on turn 1:\n"
            "    //      (a) a hunter with its target in sight within P_T1_DASH dashes at it (as an approach dash),\n"
            "    //      (b) prey that can still dash may be netted from P_T1_NET or less, at most P_T1_NETS nets,\n"
            "    //      (c) no smoke and no decoy unless a predator is within P_T1_SMOKE of the unit.\n"
            "    static final boolean F_T1 = true;\n"
            "    static final double P_T1_DASH = 2100, P_T1_NET = 2000, P_T1_SMOKE = 1000;\n"
            "    static final int[] P_T1_NETS = {0, 1, 1, 1, 1, 2, 2};   // nets spent on turn 1 at most, index = units per team\n"
            "    static int t1Nets = 0;\n"
            "    static boolean approachDash;")
    s = rep(s, "u.fat <= 2 && ntF > 3000);   // v16/v17: more approach dashes in small games\n",
            "u.fat <= 2 && ntF > 3000);   // v16/v17: more approach dashes in small games\n"
            "            if (F_T1 && turn == 1 && target != null && target.vis && u.cd == 0 && ntF > P_T1_SMOKE\n"
            "                    && hyp(target.x - u.x, target.y - u.y) <= P_T1_DASH) approachDash = true;\n")
    s = rep(s, "                if (turn == 1 && q.cd == 0) continue;",
            "                if (turn == 1 && q.cd == 0 && !(F_T1 && d <= P_T1_NET && t1Nets < P_T1_NETS[Math.min(6, N)])) continue;")
    s = rep(s, "            if (bq != null) { out.add(net(u, bx, by)); bq.netTargeted = true; }\n        }\n        // 2. nets at the hunter",
            "            if (bq != null) { out.add(net(u, bx, by)); bq.netTargeted = true; if (turn == 1) t1Nets++; }\n        }\n        // 2. nets at the hunter")
    # (c) the two-predator cloud and the single-predator cloud / decoy
    s = rep(s, "            if (dn > 2300 || !(line || dn < 1600)) continue;\n",
            "            if (dn > 2300 || !(line || dn < 1600)) continue;\n"
            "            if (F_T1 && turn == 1 && dn > P_T1_SMOKE) continue;\n")
    s = rep(s, "            if (near == null) continue;\n            boolean line = !treeBlocks(u.ex, u.ey, near.x, near.y, NET_TREE);\n",
            "            if (near == null) continue;\n"
            "            if (F_T1 && turn == 1 && Math.min(D, Dpre) > P_T1_SMOKE) continue;\n"
            "            boolean line = !treeBlocks(u.ex, u.ey, near.x, near.y, NET_TREE);\n")
    return s


def hnet(s):
    s = rep(s, "    static boolean approachDash;",
            "    // ---- F_HNET: a held unit nets back first. Over 436 games of teams rated 25 (and ours, and teams at 23) a held unit\n"
            "    //      that nets a predator is caught in 31 to 39 % of the cases, one that smokes in 56 to 65 %, one that does\n"
            "    //      nothing in 65 to 70 %: the cloud does not hide a unit that cannot move from a hunter that saw it.\n"
            "    //      Rule: the net comes before the cloud, also with two predators coming and also with an unsure aim\n"
            "    //      (up to P_HNET_FAR); the cloud stays for the case with no predator to aim at.\n"
            "    static final boolean F_HNET = true;\n"
            "    static final double P_HNET_FAR = 2100;\n"
            "    static boolean approachDash;")
    s = rep(s, "            if (!sure && d <= 2000 && d < ud) { ud = d; ue = e; ux = qx; uy = qy; }",
            "            if (!sure && d <= (F_HNET ? P_HNET_FAR : 2000) && d < ud) { ud = d; ue = e; ux = qx; uy = qy; }")
    s = rep(s, "        if (nets > 0 && be != null && !multi) { out.add(net(u, bx, by)); be.netTargeted = true; u.tag = \"HELDNET\"; return; }\n",
            "        if (nets > 0 && be != null && (!multi || F_HNET)) { out.add(net(u, bx, by)); be.netTargeted = true; u.tag = \"HELDNET\"; return; }\n"
            "        if (F_HNET && nets > 0 && ue != null) { out.add(net(u, ux, uy)); ue.netTargeted = true; u.tag = \"HELDNET\"; return; }\n")
    return s


def write(name, s):
    for o in (SUB + name + '/Player.java', ROOT + name + '.java'):
        os.makedirs(os.path.dirname(o), exist_ok=True)
        io.open(o, 'w', encoding='utf-8', newline='\n').write(s)
    print(name, 'written', len(s))


live = io.open(ROOT + 'vlive_41748059.java', encoding='utf-8').read()
press = io.open(ROOT + 'vlive_press.java', encoding='utf-8').read()
write('vlive_t1', t1(live))
write('vlive_hnet', hnet(live))
write('vlive_all3', hnet(t1(press)))
