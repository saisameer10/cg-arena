# usage: python mkexit.py <base.java> <out.java>
# F_EXIT: a unit that is blind inside a cloud runs straight on through it (the heading it had when it was last outside),
# leaves by the nearest edge on that side, keeps the bearing from turn to turn and may spend a dash on it; the hunter on its
# trail is modelled behind it, never level with or ahead of it.
# Measured reason (tools/localdeaths.js, tools/lossctx.py): blind units stay in the cloud for 4 to 7 turns, turn round and
# walk straight at a hunter they never see (cosine 0.9 and more to the catcher in 24 of 30 local losses in a cloud).
import io, sys
s = io.open(sys.argv[1], encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:70], s.count(a)); s = s.replace(a, b)


rep("    static boolean approachDash;",
    "    // ---- F_EXIT (tools/gen/mkexit.py): blind in a cloud = straight on through it and out\n"
    "    static final boolean F_EXIT = true;\n"
    "    static final int P_EXIT_FAT = 3;           // no exit dash beyond this fatigue\n"
    "    static boolean blindExit;                  // set per unit: it may dash towards its way out of the cloud\n"
    "    static boolean approachDash;")
rep("        double ox, oy, ovx, ovy; int oturn = -99;", "        int exK = -1, exTurn = -99;                // F_EXIT: bearing of the way out chosen last turn\n        double ox, oy, ovx, ovy; int oturn = -99;")
rep("            if (fleeTo != null) { gx = fleeTo[0]; gy = fleeTo[1]; wG = 2.0; }\n",
    "            blindExit = false;\n"
    "            if (F_EXIT && blind && u.immob == 0 && !(target != null && holdLeft(target) > 0)) {\n"
    "                double[] ex = exitPoint(u, target);\n"
    "                if (ex != null) { fleeTo = ex; planFlee = true; planHunt = false; blindExit = ex[2] > 650 && u.fat <= P_EXIT_FAT; }\n"
    "            }\n"
    "            if (fleeTo != null) { gx = fleeTo[0]; gy = fleeTo[1]; wG = blindExit ? 3.0 : 2.0; }\n")
rep("if (sp == 1 && (u.cd > 0 || (F_DASH && !(walkUnsafe || rush || preyNear || approachDash)))) break;",
    "if (sp == 1 && (u.cd > 0 || (F_DASH && !(walkUnsafe || rush || preyNear || approachDash || blindExit)))) break;")
rep("if (F_DASH && sp == 1 && !(walkUnsafe || rush || approachDash || lastReward",
    "if (F_DASH && sp == 1 && !(walkUnsafe || rush || approachDash || blindExit || lastReward")
rep("            sc -= approachDash ? 300 : 700 + 250 * u.fat;", "            sc -= approachDash || blindExit ? 300 : 700 + 250 * u.fat;")
rep("threats = baseThreats; planFlee = false; planHunt = false; aggro = false;", "threats = baseThreats; planFlee = false; planHunt = false; aggro = false; blindExit = false;")
# the hunter on our trail is behind us: the model never puts it level with or ahead of the unit it chases
rep("            h.x = x; h.y = y;\n            int cd = Math.max(0, t.cd - age); double unc",
    "            if (F_EXIT && chased == u && h.immob == 0) {\n"
    "                double[] hd = exitHeading(u);\n"
    "                if (hd != null) { double ahead = (x - u.x) * hd[0] + (y - u.y) * hd[1]; if (ahead > -MOVE) { x -= hd[0] * (ahead + MOVE); y -= hd[1] * (ahead + MOVE); } }\n"
    "            }\n"
    "            h.x = x; h.y = y;\n            int cd = Math.max(0, t.cd - age); double unc")
rep("    static double[] fleePoint(E u) {",
    "    /** F_EXIT: the unit's heading when it was last outside a cloud (unit vector); else away from the nearest remembered predator. */\n"
    "    static double[] exitHeading(E u) {\n"
    "        double l = hyp(u.ovx, u.ovy);\n"
    "        if (u.oturn > 0 && l > 50) return new double[]{u.ovx / l, u.ovy / l};\n"
    "        E n = null; double nd = 1e18;\n"
    "        for (E t : tracks.values()) { if (t.owner != pred || t.dead || turn - t.seen > 10) continue; double d = hyp(t.x - u.x, t.y - u.y); if (d < nd) { nd = d; n = t; } }\n"
    "        if (n == null || nd < 1) return null;\n"
    "        return new double[]{(u.x - n.x) / nd, (u.y - n.y) / nd};\n"
    "    }\n"
    "    /**\n"
    "     * F_EXIT. Of 24 bearings, the way out of every cloud (150 beyond the edge) with the lowest cost: its length, a charge for\n"
    "     * leaving the heading we came in on (turning back costs most), the closeness of the path to predators a team mate sees,\n"
    "     * minus a bonus for last turn's bearing. Returns {x, y, length} or null (no way out within 4200).\n"
    "     */\n"
    "    static double[] exitPoint(E u, E target) {\n"
    "        double best = 1e18, bx = 0, by = 0, bl = 0; int bk = -1; double[] hd = exitHeading(u);\n"
    "        for (int k = 0; k < 24; k++) {\n"
    "            double a = k * Math.PI / 12, dx = Math.cos(a), dy = Math.sin(a), L = -1;\n"
    "            for (double l = 150; l <= 4200; l += 150) {\n"
    "                double x = u.x + dx * l, y = u.y + dy * l;\n"
    "                if (hyp(x, y) > R - 300) break;\n"
    "                if (!inSmoke(x, y, -150)) { L = l; break; }\n"
    "            }\n"
    "            if (L < 0) continue;\n"
    "            double x = u.x + dx * L, y = u.y + dy * L, c = L;\n"
    "            double[] e = simMove(u.x, u.y, u.x + dx * MOVE, u.y + dy * MOVE, MOVE, false);\n"
    "            c += 2 * Math.max(0, MOVE - hyp(e[0] - u.x, e[1] - u.y));                 // a tree in the way\n"
    "            if (hd != null) c += 2500 * (1 - (dx * hd[0] + dy * hd[1]));\n"
    "            for (Th t : threats) if (t.e.vis && t.immob <= 1) c += 2 * Math.max(0, 2200 - segDist(t.x, t.y, u.x, u.y, x, y));\n"
    "            if (u.exTurn == turn - 1 && k == u.exK) c -= 500;\n"
    "            if (c < best) { best = c; bx = x; by = y; bl = L; bk = k; }\n"
    "        }\n"
    "        if (bk < 0) return null;\n"
    "        u.exK = bk; u.exTurn = turn;\n"
    "        return new double[]{bx, by, bl};\n"
    "    }\n"
    "    static double[] fleePoint(E u) {")
io.open(sys.argv[2], 'w', encoding='utf-8').write(s)
