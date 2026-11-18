import io, os
src = 'E:/cg-tmp/tcf/sub/vgo/Player.java'
outs = ['E:/cg-tmp/tcf/sub/vgo_b/Player.java', 'E:/New folder/prep/try-catch-forest/versions/vgo_b.java']
s = io.open(src, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)


rep("    static double softK = 1;\n",
    "    static double softK = 1;\n"
    "    // ---- vgo_b: two more switches from watching replays\n"
    "    static final boolean F_SMOKEGOAL = true;   // blind in a cloud with a prey assigned: go where it should be by now, keep the heading, pull harder if no predator is near\n"
    "    static final boolean F_SMOKEBACK = true;   // cloud thrown towards the predator at P_SMOKEBACK of the distance (at most 1800), as the leader does\n"
    "    static final double P_SMOKEBACK = 0.66;\n")
# A1 + A3: goal of a blind unit
rep("                wG = (target.immob > 0 || hyp(target.x - u.x, target.y - u.y) < 1500) ? P_WG_NEAR : P_WG_FAR;",
    "                boolean blindGoal = F_SMOKEGOAL && !target.vis && inSmoke(u.x, u.y, 0);\n"
    "                if (blindGoal) {\n"
    "                    double[] sv = predV(target); int ag = Math.min(turn - target.seen, 4);\n"
    "                    gx = target.x + sv[0] * ag; gy = target.y + sv[1] * ag;\n"
    "                    double gl = hyp(gx, gy); if (gl > R - UR) { gx *= (R - UR) / gl; gy *= (R - UR) / gl; }\n"
    "                }\n"
    "                wG = (target.immob > 0 || hyp(target.x - u.x, target.y - u.y) < 1500) ? P_WG_NEAR : P_WG_FAR;\n"
    "                if (blindGoal) { double nt2 = 1e18; for (Th t : threats) nt2 = Math.min(nt2, hyp(u.x - t.x, u.y - t.y)); if (nt2 > 1500) wG *= 2; }")
# A2: keep the heading inside a cloud
rep("            if (hyp(px - sx, py - sy) < 100) sc -= 1500;\n",
    "            if (hyp(px - sx, py - sy) < 100) sc -= 1500;\n"
    "            if (F_SMOKEGOAL && reward < 300000) { double cvx = px - sx, cvy = py - sy; if (hyp(u.vx, u.vy) > 50 && hyp(cvx, cvy) > 50 && u.vx * cvx + u.vy * cvy < 0) sc -= 2500; }\n")
# B: cloud towards the predator
rep("                if (F_SMOKEMID) { double k = Math.min(dl / 2, 1700); cx = u.ex + (hx - u.ex) / dl * k; cy = u.ey + (hy - u.ey) / dl * k; }\n",
    "                if (F_SMOKEMID) { double k = Math.min(dl / 2, 1700); cx = u.ex + (hx - u.ex) / dl * k; cy = u.ey + (hy - u.ey) / dl * k; }\n"
    "                if (F_SMOKEBACK) { double k = Math.min(dl * P_SMOKEBACK, 1800); cx = u.ex + (hx - u.ex) / dl * k; cy = u.ey + (hy - u.ey) / dl * k; }\n")
for o in outs:
    os.makedirs(os.path.dirname(o), exist_ok=True)
    io.open(o, 'w', encoding='utf-8', newline='\n').write(s)
print('vgo_b written', len(s))
