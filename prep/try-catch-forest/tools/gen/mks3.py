import io, os
src = 'E:/cg-tmp/tcf/sub/s1/Player.java'
dst = 'E:/cg-tmp/tcf/sub/s2/Player.java'
s = io.open(src, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)


rep("    static boolean t1Flee;\n",
    "    static boolean t1Flee;\n"
    "    // ---- tempo: what the teams with the most catches by turn 10 do more than v10 (research note tempo_endgame_ghosts.md)\n"
    "    static final boolean F_SPREAD = false;   // up to turn P_SPREAD_T one hunter per prey first (v10 covers 0.59 prey at turn 4, the leaders 0.98)\n"
    "    static final boolean F_NET23 = false;    // turns 2 and 3: net any visible prey in range (a turn-2 net hits 55 %, a turn-1 net 28 %)\n"
    "    static final boolean F_DASH25 = false;   // turns 2 to 5: dash at prey 1000 to 2500 away when no predator is inside 1500 (0.40 dashes per unit against 0.69)\n"
    "    static final boolean F_PRESS = false;    // prey not on the predator's side and predator beyond 1200: keep going, less distance kept\n"
    "    static final double P_SPREAD_T = 6;\n"
    "    static double pressK = 1;\n")
rep("for (int cap = 2; cap <= 6 && !free.isEmpty() && !cand.isEmpty(); cap += 4) {",
    "for (int cap = (F_SPREAD && turn <= P_SPREAD_T ? 1 : 2); cap <= 6 && !free.isEmpty() && !cand.isEmpty(); cap += (cap == 1 ? 1 : 4)) {")
rep("                if (!sure && (nets < P_NET_RES || !F_NETWIDE)) continue;",
    "                if (!sure && !(F_NET23 && turn >= 2 && turn <= 3) && (nets < P_NET_RES || !F_NETWIDE)) continue;")
rep("            t1Flee = F_T1 && turn == 1 && ntF < 2000;",
    "            t1Flee = F_T1 && turn == 1 && ntF < 2000;\n"
    "            if (F_DASH25 && turn >= 2 && turn <= 5 && target != null && turn - target.seen <= 1 && u.fat <= 3 && ntF > 1500) {\n"
    "                double td = hyp(target.x - u.x, target.y - u.y); if (td > 1000 && td < 2500) approachDash = true;\n"
    "            }\n"
    "            pressK = 1;\n"
    "            if (F_PRESS && target != null && hyp(target.x - u.x, target.y - u.y) < 2500) {\n"
    "                Th nt = null; double nd = 1e18; for (Th t : threats) if (t.w >= 0.5) { double dd = hyp(u.x - t.x, u.y - t.y); if (dd < nd) { nd = dd; nt = t; } }\n"
    "                if (nt != null && nd > 1200 && nd < 2500) {\n"
    "                    double ax = target.x - u.x, ay = target.y - u.y, bx = nt.x - u.x, by = nt.y - u.y;\n"
    "                    double cos = (ax * bx + ay * by) / (Math.max(1, hyp(ax, ay)) * Math.max(1, hyp(bx, by)));\n"
    "                    if (cos < 0.5) pressK = 0.3;\n"
    "                }\n"
    "            }")
rep("* P_PROX * (F_EARLYAGG && turn <= P_AGG_T ? 0.4 : 1) * Math.max(0, P_PROX_R - D);",
    "* P_PROX * pressK * (F_EARLYAGG && turn <= P_AGG_T ? 0.4 : 1) * Math.max(0, P_PROX_R - D);")
os.makedirs(os.path.dirname(dst), exist_ok=True)
io.open(dst, 'w', encoding='utf-8', newline='\n').write(s)
print('s2 written', len(s))
