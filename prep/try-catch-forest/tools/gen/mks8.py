import io, os
src = 'E:/cg-tmp/tcf/sub/s1/Player.java'        # = vs0 = v10 with every switch off
outs = ['E:/cg-tmp/tcf/sub/vchase/Player.java', 'E:/New folder/prep/try-catch-forest/versions/vchase.java']
s = io.open(src, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a))
    s = s.replace(a, b)


SEARCH = r'''    // ---- vchase: two-ply search with the referee's exact movement rule for BOTH sides
    static final boolean F_MM_FLEE = true;     // flight: our move, the predator's best reply (16 directions x walk/dash), our best next move
    static final boolean F_MM_STRIKE = true;   // a catch is certain only if every reply of the prey still ends on our path; forced catch in two
    static final double P_FORCE2 = 120000;     // value of a move after which the prey is caught next turn whatever it does
    static final int MM_DIR = 16;
    static final double[] MMX = new double[MM_DIR], MMY = new double[MM_DIR];
    static { for (int i = 0; i < MM_DIR; i++) { MMX[i] = Math.cos(i * 2 * Math.PI / MM_DIR); MMY[i] = Math.sin(i * 2 * Math.PI / MM_DIR); } }
    static final Map<E, double[][]> replyCache = new IdentityHashMap<>();
    static final Map<E, double[][][]> reply2Cache = new IdentityHashMap<>();
    static List<E> mmPreds = new ArrayList<>();    // for the unit being scored: the nearest two predators in sight within 1800
    static E mmPrey;                               // ... and the nearest prey in sight within 2200 that is not held
    static boolean mmHurry;

    /** End points of everything an enemy unit can do this turn: stay, 16 walks, 16 dashes if its dash is ready. Row: x, y, 1 = dash. */
    static double[][] replies(E e) {
        double[][] r = replyCache.get(e);
        if (r != null) return r;
        if (e.immob > 0) r = new double[][]{{e.x, e.y, 0}};
        else {
            int sp2 = e.cd == 0 ? 2 : 1, k = 1; r = new double[1 + MM_DIR * sp2][]; r[0] = new double[]{e.x, e.y, 0};
            for (int sp = 0; sp < sp2; sp++) { double v = sp == 0 ? MOVE : DASH;
                for (int i = 0; i < MM_DIR; i++) { double[] q = simMove(e.x, e.y, e.x + MMX[i] * v, e.y + MMY[i] * v, v, false); r[k++] = new double[]{q[0], q[1], sp}; } }
        }
        replyCache.put(e, r); return r;
    }
    /** For reply k of an enemy: where it can be one turn later (stay, 8 walks, 8 dashes if it may dash then). */
    static double[][] replies2(E e, int k) {
        double[][] r1 = replies(e); double[][][] c = reply2Cache.get(e);
        if (c == null) { c = new double[r1.length][][]; reply2Cache.put(e, c); }
        if (c[k] != null) return c[k];
        double x = r1[k][0], y = r1[k][1];
        if (e.immob > 1) return c[k] = new double[][]{{x, y}};
        boolean canDash = r1[k][2] == 0 && e.cd <= 1; int sp2 = canDash ? 2 : 1, j = 1;
        double[][] r = new double[1 + 8 * sp2][]; r[0] = new double[]{x, y};
        for (int sp = 0; sp < sp2; sp++) { double v = sp == 0 ? MOVE : DASH;
            for (int i = 0; i < MM_DIR; i += 2) r[j++] = simMove(x, y, x + MMX[i] * v, y + MMY[i] * v, v, false); }
        return c[k] = r;
    }
    /** Smallest distance between two units during one turn, each moving from its start to its end point. */
    static double pathGap(double ax, double ay, double bx, double by, double cx, double cy, double dx, double dy) {
        double m = 1e18;
        for (int i = 1; i <= 8; i++) { double f = i / 8.0; double d = hyp(ax + (bx - ax) * f - cx - (dx - cx) * f, ay + (by - ay) * f - cy - (dy - cy) * f); if (d < m) m = d; }
        return m;
    }
    /** Flight value of ending at (px, py): against the predator's best reply now, the distance we can still have after our best next move. */
    static double mmFlee(E u, double px, double py, boolean dash) {
        boolean myDash = !dash && u.cd <= 1; int sp2 = myDash ? 2 : 1, nm = 1 + MM_DIR * sp2, k = 1;
        double[] nx = new double[nm], ny = new double[nm]; nx[0] = px; ny[0] = py;
        for (int sp = 0; sp < sp2; sp++) { double v = sp == 0 ? MOVE : DASH;
            for (int i = 0; i < MM_DIR; i++) { double[] q = simMove(px, py, px + MMX[i] * v, py + MMY[i] * v, v, false); nx[k] = q[0]; ny[k] = q[1]; k++; } }
        double val = 1e18;
        for (E e : mmPreds) {
            double worst = 1e18;
            for (double[] r : replies(e)) {
                if (pathGap(u.x, u.y, px, py, e.x, e.y, r[0], r[1]) < CATCH + 20) { worst = -1; break; }      // it touches us this turn
                double v2 = e.immob > 1 ? 0 : (r[2] == 0 && e.cd <= 1 ? DASH : MOVE);
                double best = -1e18;
                for (int j = 0; j < nm; j++) { double d = hyp(nx[j] - r[0], ny[j] - r[1]) - v2; if (d > best) best = d; }
                if (best < worst) worst = best;
            }
            if (worst < val) val = worst;
        }
        return val;
    }
    /** True when every reply of the prey this turn still leaves it on our move s -> p. */
    static boolean mmCaught(double sx, double sy, double px, double py, E q) {
        for (double[] r : replies(q)) if (pathGap(sx, sy, px, py, q.x, q.y, r[0], r[1]) >= CATCH - 15) return false;
        return true;
    }
    /** Forced catch in two: whatever the prey does now, one of our moves next turn catches it whatever it does then. */
    static boolean mmForced2(E u, double px, double py, boolean dash, E q) {
        boolean myDash = !dash && u.cd <= 1; double[][] r1 = replies(q);
        for (int k = 0; k < r1.length; k++) {
            double rx = r1[k][0], ry = r1[k][1]; double[][] r2 = replies2(q, k); boolean any = false;
            double base = Math.atan2(ry - py, rx - px);
            for (int sp = 0; sp < (myDash ? 2 : 1) && !any; sp++) { double v = sp == 0 ? MOVE : DASH;
                for (int a = -1; a <= 1 && !any; a++) {
                    double ang = base + a * 0.35;
                    double[] n = simMove(px, py, px + Math.cos(ang) * v, py + Math.sin(ang) * v, v, false);
                    boolean all = true;
                    for (double[] z : r2) if (pathGap(px, py, n[0], n[1], rx, ry, z[0], z[1]) >= CATCH - 15) { all = false; break; }
                    if (all) any = true;
                } }
            if (!any) return false;
        }
        return true;
    }

'''
rep("    static double eval(E u, double px, double py, double ux, double uy, boolean dash,", SEARCH + "    static double eval(E u, double px, double py, double ux, double uy, boolean dash,")
# strike: exact certain-catch test instead of the straight-flight bound, and the forced catch in two
rep("if (d0 + rq - mySp < CATCH - 25) reward = Math.max(reward, 300000);", "if (!F_MM_STRIKE && d0 + rq - mySp < CATCH - 25) reward = Math.max(reward, 300000);")
rep("        if (certain != null) certain[0] = reward >= 300000;",
    "        if (F_MM_STRIKE && !u.ghost && mmPrey != null && reward < 300000) {\n"
    "            double dq0 = hyp(mmPrey.x - sx, mmPrey.y - sy), dq1 = hyp(mmPrey.x - px, mmPrey.y - py);\n"
    "            if (dq0 < mySp + DASH + CATCH && mySp > 1 && mmCaught(sx, sy, px, py, mmPrey)) reward = 300000;\n"
    "            else if (!mmHurry && dq1 < 1500 && dq1 < dq0 && mmForced2(u, px, py, dash, mmPrey)) reward = Math.max(reward, P_FORCE2);\n"
    "        }\n"
    "        if (certain != null) certain[0] = reward >= 300000;")
# flight: two-ply value instead of the straight five-turn chase
rep("            double rm = F_ROLL ? rollout(px, py, ux, uy) : 2600;\n            sc += P_ROLL * Math.min(rm, 2600);",
    "            boolean mm = F_MM_FLEE && !mmPreds.isEmpty() && u.immob == 0;\n"
    "            double rm = mm ? mmFlee(u, px, py, dash) : F_ROLL ? rollout(px, py, ux, uy) : 2600;\n"
    "            sc += P_ROLL * (mm ? Math.max(0, Math.min(rm, 2600)) : Math.min(rm, 2600));")
# per turn and per unit set-up
rep("        boolean preyGone = myScore >= N;\n", "        boolean preyGone = myScore >= N;\n        replyCache.clear(); reply2Cache.clear();\n")
rep("            E target = targetOf.get(u);",
    "            E target = targetOf.get(u);\n"
    "            mmPreds = new ArrayList<>(); mmPrey = null; mmHurry = System.nanoTime() - turnStart > 15_000_000L;\n"
    "            if (F_MM_FLEE) {\n"
    "                E p1 = null, p2 = null; double d1 = 1800, d2 = 1800;\n"
    "                for (E e : seenPred) { if (e.immob > 1) continue; double d = hyp(e.x - u.x, e.y - u.y); if (d < d1) { p2 = p1; d2 = d1; p1 = e; d1 = d; } else if (d < d2) { p2 = e; d2 = d; } }\n"
    "                if (p1 != null) mmPreds.add(p1); if (p2 != null) mmPreds.add(p2);\n"
    "            }\n"
    "            if (F_MM_STRIKE) { double bq = 2200; for (E q : seenPrey) { if (q.immob > 0) continue; double d = hyp(q.x - u.x, q.y - u.y); if (d < bq) { bq = d; mmPrey = q; } } }")
rep("        List<String> out = new ArrayList<>();", "        mmPreds = new ArrayList<>(); mmPrey = null;\n        List<String> out = new ArrayList<>();")
for o in outs:
    os.makedirs(os.path.dirname(o), exist_ok=True)
    io.open(o, 'w', encoding='utf-8', newline='\n').write(s)
print('vchase written', len(s))
