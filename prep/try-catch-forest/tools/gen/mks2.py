import io
p = 'E:/cg-tmp/tcf/sub/s1/Player.java'
s = io.open(p, encoding='utf-8').read()
assert 'F_FINISHER' not in s, 'already patched'


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)


rep("    static double[] hideGoal;\n",
    "    static double[] hideGoal;\n"
    "    // ---- from the Gold autopsy (kb/gold-autopsy.md)\n"
    "    static final boolean F_FINISHER = false;  // net at free prey only if one of our hunters ends within P_FINISH of it\n"
    "    static final boolean F_CLOUDMEM = false;  // while a unit of ours is in a cloud, predators seen up to 9 turns ago stay threats\n"
    "    static final boolean F_T1 = false;        // turn 1: predator start inside 2000 -> dash away; smoke if inside 1500, or inside 2000 with a clear line\n"
    "    static final double P_FINISH = 1000;\n"
    "    static boolean t1Flee;\n")
# (a) finisher
rep("                if (d < 450 || d > P_NET_MAX) continue;",
    "                if (d < 450 || d > P_NET_MAX) continue;\n"
    "                if (F_FINISHER && q.immob == 0) { double fd = 1e18; for (E h : live) if (h.immob == 0) fd = Math.min(fd, hyp(h.ex - qx, h.ey - qy)); if (fd > P_FINISH) continue; }")
# (b) cloud memory
rep("            int age = turn - t.seen; if (age > 3) { if (age <= 8) oldPred.add(t); continue; }",
    "            int age = turn - t.seen;\n"
    "            if (age > 3) {\n"
    "                boolean keep = false;\n"
    "                if (F_CLOUDMEM && age <= 9) for (E o : live) if (inSmoke(o.x, o.y, 0) && hyp(o.x - t.x, o.y - t.y) < 3500) keep = true;\n"
    "                if (!keep) { if (age <= 8) oldPred.add(t); continue; }\n"
    "            }")
rep("t.x = e.x + v[0] * age; t.y = e.y + v[1] * age;", "t.x = e.x + v[0] * Math.min(age, 3); t.y = e.y + v[1] * Math.min(age, 3);")
rep("t.reach = (cd == 0 ? DASH : MOVE) + age * 300; t.reach2 = (cd <= 1 ? DASH + MOVE : 2 * MOVE) + age * 300;",
    "t.reach = (cd == 0 ? DASH : MOVE) + Math.min(age, 4) * 300; t.reach2 = (cd <= 1 ? DASH + MOVE : 2 * MOVE) + Math.min(age, 4) * 300;")
rep("t.w = 1.0 / (1 + 0.5 * age);", "t.w = Math.max(0.4, 1.0 / (1 + 0.5 * age));")
# (c) turn 1
rep("            boolean wantSmoke = (u.immob > 0 && D < 3500) || (D < (F_EARLYAGG && turn <= P_AGG_T ? 1500 : P_SMOKE_D) && line);",
    "            boolean wantSmoke = (u.immob > 0 && D < 3500) || (D < (F_EARLYAGG && turn <= P_AGG_T ? 1500 : P_SMOKE_D) && line)\n"
    "                    || (F_T1 && turn == 1 && (Dpre < 1500 || (Dpre < 2000 && line)));")
rep("                if (sp == 1 && (u.cd > 0 || (F_DASH && !(walkUnsafe || rush || preyNear || approachDash)))) break;",
    "                if (sp == 1 && (u.cd > 0 || (F_DASH && !(walkUnsafe || rush || preyNear || approachDash || t1Flee)))) break;")
rep("if (F_DASH && sp == 1 && !(walkUnsafe || rush || approachDash || lastReward >= 300000",
    "if (F_DASH && sp == 1 && !(walkUnsafe || rush || approachDash || t1Flee || lastReward >= 300000")
rep("            sc -= approachDash ? P_APP_COST : P_DASH + P_DASH_FAT * u.fat;",
    "            sc -= t1Flee ? 0 : approachDash ? P_APP_COST : P_DASH + P_DASH_FAT * u.fat;")
a = s.index("            approachDash = F_APPROACH && target != null")
b = s.index("\n", a)
s = s[:b] + "\n            t1Flee = F_T1 && turn == 1 && ntF < 2000;" + s[b:]
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('s1 patched', len(s))
