import io, os
src = 'E:/cg-tmp/tcf/sub/s1/Player.java'        # = vs0 = v10 with every switch off
outs = ['E:/cg-tmp/tcf/sub/vpress/Player.java', 'E:/New folder/prep/try-catch-forest/versions/vpress.java']
s = io.open(src, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)


rep("    static boolean t1Flee;\n",
    "    static boolean t1Flee;\n"
    "    // ---- press: from turn P_PRESS_T on, while we have no catch at all (35 % of v10's Gold games: intact, no score, mean rank 2.31).\n"
    "    //      Before that turn, and for good after our first catch, the bot is v10 to the last digit.\n"
    "    static final boolean F_PRESS = true;\n"
    "    static final boolean F_PRESS_PACK = true;    // a: every free unit hunts the same prey unit\n"
    "    static final boolean F_PRESS_BOLD = true;    // b: soft threat terms x P_PRESS_SOFT (the hard no-touch rule stays)\n"
    "    static final boolean F_PRESS_NET = true;     // c: nets at prey only from within 1400 after the move, no reserve\n"
    "    static final boolean F_PRESS_SIGHT = true;   // d: smoke only against a predator in sight within 1500; leave a cloud when no predator is known within 1500\n"
    "    static final boolean F_PRESS_DASH = true;    // e: approach dash up to fatigue 3 when no predator in sight is within 2200\n"
    "    static final double P_PRESS_T = 16, P_PRESS_SOFT = 0.5;\n"
    "    static boolean pressOn; static double pressSoft = 1;\n")
# when it is active
rep("        boolean preyGone = myScore >= N;\n",
    "        boolean preyGone = myScore >= N;\n"
    "        pressOn = F_PRESS && turn >= P_PRESS_T && myScore == 0;\n"
    "        pressSoft = pressOn && F_PRESS_BOLD ? P_PRESS_SOFT : 1;\n")
# b: soft terms
rep("        for (Th t : threats) {\n            double m = 1e18;",
    "        for (Th t : threats) {\n            double tw = t.w < 1 ? t.w * pressSoft : t.w;\n            double m = 1e18;")
rep("if (m < lim) { sc -= t.w * deathScale * (1e6", "if (m < lim) { sc -= tw * deathScale * (1e6")
rep("if (m2 < 0) sc -= t.w * P_M2 * Math.min(-m2, 1200);", "if (m2 < 0) sc -= t.w * pressSoft * P_M2 * Math.min(-m2, 1200);")
rep("sc -= t.w * (hidden ? 0.3 : 1.0) * P_PROX", "sc -= t.w * pressSoft * (hidden ? 0.3 : 1.0) * P_PROX")
rep("sc -= t.w * P_NETLINE;", "sc -= t.w * pressSoft * P_NETLINE;")
rep("            sc += P_ROLL * Math.min(rm, 2600);\n            if (rm < CATCH + 60) sc -= deathScale * 30000;",
    "            sc += pressSoft * P_ROLL * Math.min(rm, 2600);\n            if (rm < CATCH + 60) sc -= pressSoft * deathScale * 30000;")
# d: leave a cloud
rep("                if (!F_CLOUDPLAN) sc -= 400;", "                if (!F_CLOUDPLAN && !(pressOn && F_PRESS_SIGHT)) sc -= 400;")
rep("if (nth > P_CLOUD_TH) sc -= P_CLOUD_OUT;", "if (nth > (F_CLOUDPLAN ? P_CLOUD_TH : 1500)) sc -= P_CLOUD_OUT;")
# a: pack
rep("        // moves of the living units\n",
    "        if (pressOn && F_PRESS_PACK && !cand.isEmpty() && !live.isEmpty()) {\n"
    "            double mx = 0, my = 0; for (E o : live) { mx += o.x; my += o.y; } mx /= live.size(); my /= live.size();\n"
    "            E pack = null; double pd = 1e18;\n"
    "            for (E q : seenPrey) { double d = hyp(q.x - mx, q.y - my); if (d < pd) { pd = d; pack = q; } }\n"
    "            if (pack == null) { int ps = -99; for (E q : cand) if (q.seen > ps) { ps = q.seen; pack = q; } }\n"
    "            if (pack != null) for (E o : live) if (o.immob == 0) targetOf.put(o, pack);\n"
    "        }\n"
    "        // moves of the living units\n")
# e: dash
rep("            t1Flee = F_T1 && turn == 1 && ntF < 2000;",
    "            t1Flee = F_T1 && turn == 1 && ntF < 2000;\n"
    "            if (pressOn && F_PRESS_DASH && target != null && u.fat <= 3 && hyp(target.x - u.x, target.y - u.y) > 1000) {\n"
    "                double np = 1e18; for (E e : seenPred) np = Math.min(np, hyp(e.x - u.x, e.y - u.y));\n"
    "                if (np > 2200) approachDash = true;\n"
    "            }")
# c: nets
rep("                if (d < 450 || d > P_NET_MAX) continue;",
    "                if (d < 450 || d > P_NET_MAX) continue;\n                if (pressOn && F_PRESS_NET && d > 1400) continue;")
rep("                if (!sure && (nets < P_NET_RES || !F_NETWIDE)) continue;",
    "                if (!sure && !(pressOn && F_PRESS_NET) && (nets < P_NET_RES || !F_NETWIDE)) continue;")
# d: smoke
rep("? 1500 : P_SMOKE_D) && line)", "? 1500 : pressOn && F_PRESS_SIGHT ? 1500 : P_SMOKE_D) && line)")
for o in outs:
    os.makedirs(os.path.dirname(o), exist_ok=True)
    io.open(o, 'w', encoding='utf-8', newline='\n').write(s)
print('vpress written', len(s))
