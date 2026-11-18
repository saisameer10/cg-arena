import io, os
src = 'E:/cg-tmp/tcf/sub/commit/Player.java'          # vs0 + F_COMMIT = true
outs = ['E:/cg-tmp/tcf/sub/vgo/Player.java', 'E:/New folder/prep/try-catch-forest/versions/vgo.java']
s = io.open(src, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)


assert 'static final boolean F_COMMIT = true;' in s
rep("static final boolean F_CLOUDMEM = false;", "static final boolean F_CLOUDMEM = true; ")
rep("    static boolean commitOn;\n",
    "    static boolean commitOn;\n"
    "    // ---- vgo: the five things asked for on 2026-11-18 (each can be switched off on its own)\n"
    "    //      1 F_COMMIT (above)   2 F_CLOUDMEM (above)   3 F_HUNTFIRST   4 F_EARLYDASH   5 F_GHOSTPLAN\n"
    "    static final boolean F_HUNTFIRST = true;   // a prey within 1500 that is held or has no dash: soft threat terms x P_HUNTFIRST\n"
    "    static final boolean F_EARLYDASH = true;   // until turn 10: first dash to close in on prey in sight when no predator is in sight within 2500\n"
    "    static final boolean F_GHOSTPLAN = true;   // ghost 1 on held prey (else the prey nearest our hunters), ghost 2 on the predator nearest our units\n"
    "    static final double P_HUNTFIRST = 0.5, P_HUNTFIRST_EARLY = 0.3;   // the early value applies in turns 1 to 10\n"
    "    static double softK = 1;\n")
# 3: soft threat terms
rep("// remembered or extrapolated: not for a committed unit\n",
    "// remembered or extrapolated: not for a committed unit\n"
    "            double tw = t.w < 1 ? t.w * softK : t.w;           // remembered predators count less for a hunter next to a point\n")
rep("if (m < lim) { sc -= t.w * deathScale * (1e6", "if (m < lim) { sc -= tw * deathScale * (1e6")
rep("if (m2 < 0) sc -= t.w * P_M2 * Math.min(-m2, 1200);", "if (m2 < 0) sc -= tw * P_M2 * Math.min(-m2, 1200);")
rep("sc -= t.w * (hidden ? 0.3 : 1.0) * P_PROX", "sc -= t.w * softK * (hidden ? 0.3 : 1.0) * P_PROX")
rep("sc -= t.w * P_NETLINE;", "sc -= t.w * softK * P_NETLINE;")
rep("            sc += P_ROLL * Math.min(rm, 2600);\n            if (rm < CATCH + 60) sc -= deathScale * 30000;",
    "            sc += softK * P_ROLL * Math.min(rm, 2600);\n            if (rm < CATCH + 60) sc -= softK * deathScale * 30000;")
# 3 and 4: per unit
rep("            t1Flee = F_T1 && turn == 1 && ntF < 2000;",
    "            t1Flee = F_T1 && turn == 1 && ntF < 2000;\n"
    "            softK = 1;\n"
    "            if (F_HUNTFIRST) for (E q : seenPrey) if (hyp(q.x - u.x, q.y - u.y) < 1500 && (q.immob > 0 || q.cd > 0)) { softK = turn <= 10 ? P_HUNTFIRST_EARLY : P_HUNTFIRST; break; }\n"
    "            if (F_EARLYDASH && turn <= 10 && target != null && target.vis && u.fat == 1 && hyp(target.x - u.x, target.y - u.y) > 1000) {\n"
    "                double np = 1e18; for (E e : seenPred) np = Math.min(np, hyp(e.x - u.x, e.y - u.y));\n"
    "                if (np > 2500) approachDash = true;\n"
    "            }")
rep("        commitOn = false;\n        List<String> out = new ArrayList<>();", "        commitOn = false; softK = 1;\n        List<String> out = new ArrayList<>();")
# 5: ghosts
rep("        for (E g : ghosts) {\n            E best = null; double bd = 1e18;\n",
    "        int gi = 0;\n        for (E g : ghosts) {\n            E best = null; double bd = 1e18;\n"
    "            int gk = gi++;\n"
    "            if (F_GHOSTPLAN && gk == 0) {\n"
    "                for (E q : seenPrey) if (q.immob > 0 && !taken.contains(q.id)) { double d = hyp(q.x - g.x, q.y - g.y); if (d < bd) { bd = d; best = q; } }\n"
    "                if (best == null && !live.isEmpty()) for (E q : watch) { if (taken.contains(q.id)) continue; double d = 1e18; for (E o : live) d = Math.min(d, hyp(q.x - o.x, q.y - o.y)); d += (turn - q.seen) * 300; if (d < bd) { bd = d; best = q; } }\n"
    "            } else if (F_GHOSTPLAN && gk == 1 && !live.isEmpty()) {\n"
    "                for (E q : predWatch) { if (taken.contains(q.id)) continue; double d = 1e18; for (E o : live) d = Math.min(d, hyp(q.x - o.x, q.y - o.y)); if (d < bd) { bd = d; best = q; } }\n"
    "            }\n"
    "            if (best == null) bd = 1e18;\n")
rep("            for (E q : watch) { if (taken.contains(q.id)) continue; double d = hyp(q.x - g.x, q.y - g.y) + (turn - q.seen) * 300; if (d < bd) { bd = d; best = q; } }",
    "            if (best == null) for (E q : watch) { if (taken.contains(q.id)) continue; double d = hyp(q.x - g.x, q.y - g.y) + (turn - q.seen) * 300; if (d < bd) { bd = d; best = q; } }")
for o in outs:
    os.makedirs(os.path.dirname(o), exist_ok=True)
    io.open(o, 'w', encoding='utf-8', newline='\n').write(s)
print('vgo written', len(s))
