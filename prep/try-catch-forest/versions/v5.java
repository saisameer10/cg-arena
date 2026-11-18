import java.io.*;
import java.util.*;

/**
 * Try Catch Forest (Unleash the Geek 2026).
 *
 * Three players in a cycle: player i catches player (i+1)%3 and is caught by player (i+2)%3.
 * Knowledge base: prep/try-catch-forest/kb (rules.md, strategy.md, log.md). Design:
 *  - every unit scores a set of candidate moves (24 walk directions, 24 dash directions, direct lines, stay)
 *    with one function: never end where a predator can touch us this turn, keep a two-turn escape margin,
 *    look five turns ahead in a chase (wall, trees), stay out of net lines and off ground nobody sees,
 *    and inside those limits close in on the assigned prey; moves are simulated with the referee's slide rule;
 *  - a catch that the prey cannot avoid (netted, or no dash left and inside dash reach) outranks everything;
 *  - nets go to prey that cannot dodge (dash on cooldown, close, or moving along the line), thrown from the
 *    position after the move and aimed at full range; a netted unit of ours nets the hunter back;
 *  - smoke is ordered before the net can come (it resolves after the move), decoys walk at the predator and
 *    take the net that was meant for us;
 *  - ghosts are invisible scouts: they sit on prey so the hunters always see their targets;
 *  - on turn 1 every enemy position is known: the three teams start as 120 degree rotations of each other.
 */
class Player {
    static final double R = 8000, UR = 220, MOVE = 600, DASH = 1200, CATCH = 440;
    static final double NET_RANGE = 2000, NET_TREE = 250, SMOKE_R = 1900, SMOKE_THROW = 2000, VISION = 2000;
    static final int SMOKE_LIFE = 9;

    static int myId, prey, pred, N = -1, turn = 0, myScore = 0, nets, smokes, decoys;
    static int T; static double[] tx, ty, tr;

    static final class E {
        int id, owner; double x, y, vx, vy; boolean ghost; int cd, fat = 1, immob;
        int seen = -99; boolean vis, dead, lost, dup;
        int lastDecoy = -99; double ex, ey; boolean usedPower, netTargeted, caughtNow; String cmd, tag;
        E copy() { E e = new E(); e.id = id; e.owner = owner; e.x = x; e.y = y; e.vx = vx; e.vy = vy; e.ghost = ghost; e.cd = cd; e.fat = fat; e.immob = immob; e.seen = seen; e.vis = vis; return e; }
    }
    static final class Th { double x, y, reach, reach2, w; int immob; E e; }

    static Map<Integer, E> own = new HashMap<>();          // my units, kept between turns
    static Map<Integer, E> tracks = new HashMap<>();       // enemy units by id, last known state
    static List<E> mine = new ArrayList<>(), seenPrey = new ArrayList<>(), seenPred = new ArrayList<>();
    static List<double[]> clouds = new ArrayList<>();      // x, y, last turn of life
    static List<Th> threats = new ArrayList<>();
    static List<E> oldPred = new ArrayList<>();          // predators last seen 4 to 8 turns ago

    // ---------------------------------------------------------------- geometry
    static double hyp(double a, double b) { return Math.sqrt(a * a + b * b); }
    static double segDist(double px, double py, double ax, double ay, double bx, double by) {
        double dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
        if (l2 < 1e-9) return hyp(px - ax, py - ay);
        double t = ((px - ax) * dx + (py - ay) * dy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
        return hyp(px - ax - dx * t, py - ay - dy * t);
    }
    static boolean treeBlocks(double ax, double ay, double bx, double by, double margin) {
        for (int i = 0; i < T; i++) if (segDist(tx[i], ty[i], ax, ay, bx, by) < tr[i] + margin) return true;
        return false;
    }
    static boolean inSmoke(double x, double y, double margin) {
        for (double[] c : clouds) if (hyp(x - c[0], y - c[1]) < SMOKE_R - margin) return true;
        return false;
    }
    static boolean smokeBlocks(double ax, double ay, double bx, double by) {
        for (double[] c : clouds) if (segDist(c[0], c[1], ax, ay, bx, by) < SMOKE_R) return true;
        return false;
    }
    /**
     * End point of a MOVE/DASH towards (gx, gy), as the referee does it (fitted on 638 recorded moves, p99 error 3 units):
     * straight line until the unit touches a tree, then the rest of the turn along the tangent with the speed that is
     * left after dropping the component towards the tree. The arena wall keeps the unit inside (radius R - UR).
     */
    static double[] simMove(double x, double y, double gx, double gy, double speed, boolean ghost) {
        double d = hyp(gx - x, gy - y);
        if (d < 1e-6) return new double[]{x, y};
        double len = Math.min(d, speed), vx = (gx - x) / d * len, vy = (gy - y) / d * len;
        final int slices = 4;
        for (int sl = 0; sl < slices; sl++) {
            double rem = 1.0 / slices, sx = x, sy = y;
            for (int it = 0; it < 4 && rem > 1e-7; it++) {
                double rvx = vx * rem, rvy = vy * rem, A = rvx * rvx + rvy * rvy;
                if (A < 1e-9) break;
                double bt = 2; int bi = -1;
                if (!ghost) for (int i = 0; i < T; i++) {
                    double fx = x - tx[i], fy = y - ty[i], rr = tr[i] + UR;
                    double B = 2 * (fx * rvx + fy * rvy), C = fx * fx + fy * fy - rr * rr, t;
                    if (C <= 0) { if (B >= 0) continue; t = 0; }
                    else { double D = B * B - 4 * A * C; if (D < 0) continue; t = (-B - Math.sqrt(D)) / (2 * A); if (t < 0 || t > 1) continue; }
                    if (t < bt) { bt = t; bi = i; }
                }
                if (bi < 0) { x += rvx; y += rvy; break; }
                x += rvx * bt; y += rvy * bt; rem *= 1 - bt;
                double nx = x - tx[bi], ny = y - ty[bi], nl = hyp(nx, ny); nx /= nl; ny /= nl;
                x = tx[bi] + nx * (tr[bi] + UR + 0.01); y = ty[bi] + ny * (tr[bi] + UR + 0.01);
                double dot = vx * nx + vy * ny; vx -= dot * nx; vy -= dot * ny;
            }
            double l = hyp(x, y);
            if (l > R - UR) {
                x *= (R - UR) / l; y *= (R - UR) / l;
                boolean stuck = false;
                if (!ghost) for (int i = 0; i < T; i++) if (hyp(x - tx[i], y - ty[i]) < tr[i] + UR - 1) stuck = true;
                if (stuck) { x = sx; y = sy; break; }           // wedged between the wall and a tree
            }
        }
        return new double[]{x, y};
    }
    /** Local way point towards (gx, gy): the goal itself when the way is free, else the tangent of the first tree. */
    static double[] steer(double sx, double sy, double gx, double gy) {
        double margin = UR + 40; int best = -1; double bd = 1e18;
        for (int i = 0; i < T; i++) if (segDist(tx[i], ty[i], sx, sy, gx, gy) < tr[i] + margin) { double d = hyp(sx - tx[i], sy - ty[i]); if (d < bd) { bd = d; best = i; } }
        if (best < 0) return new double[]{gx, gy};
        double RR = tr[best] + margin, d = bd;
        if (hyp(gx - tx[best], gy - ty[best]) < RR) return new double[]{gx, gy};                 // goal hugs the tree: go straight, slide
        if (d <= RR) { double k = (RR - d + MOVE) / Math.max(1, d); return new double[]{sx + (sx - tx[best]) * k, sy + (sy - ty[best]) * k}; }
        double base = Math.atan2(ty[best] - sy, tx[best] - sx), spread = Math.asin(Math.min(1, RR / d)) + 0.06;
        double want = Math.atan2(gy - sy, gx - sx);
        double a1 = base + spread, a2 = base - spread;
        double pick = angDiff(a1, want) <= angDiff(a2, want) ? a1 : a2;
        double reach = Math.sqrt(Math.max(0, d * d - RR * RR)) + MOVE;
        return new double[]{sx + Math.cos(pick) * reach, sy + Math.sin(pick) * reach};
    }
    static double angDiff(double a, double b) { double d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; }

    /** Movement expected from an enemy this turn (its last movement, capped by what it can do now). */
    static double[] predV(E q) {
        if (q.immob > 0) return new double[]{0, 0};
        double l = hyp(q.vx, q.vy), max = q.cd == 0 ? DASH : MOVE;
        if (l < 1) return new double[]{0, 0};
        double k = l > max ? max / l : 1;
        if (l > MOVE + 50 && q.cd > 0) k = MOVE / l;
        return new double[]{q.vx * k, q.vy * k};
    }
    static boolean canSeePoint(double x, double y) {
        for (E u : mine) { if (hyp(u.x - x, u.y - y) < 1800 && !treeBlocks(u.x, u.y, x, y, 0) && !smokeBlocks(u.x, u.y, x, y)) return true; }
        return false;
    }

    static final double[] RING_X = new double[6], RING_Y = new double[6];
    static { for (int i = 0; i < 6; i++) { RING_X[i] = Math.cos(i * Math.PI / 3) * 650; RING_Y[i] = Math.sin(i * Math.PI / 3) * 650; } }
    /** Share of the ground around (px, py) that none of my units can see right now: a predator may stand there. */
    static double hiddenFrac(double px, double py) {
        int hidden = 0;
        for (int i = -1; i < 6; i++) {
            double x = px + (i < 0 ? 0 : RING_X[i]), y = py + (i < 0 ? 0 : RING_Y[i]);
            if (hyp(x, y) > R - UR) continue;
            boolean inTree = false;
            for (int k = 0; k < T && !inTree; k++) if (hyp(x - tx[k], y - ty[k]) < tr[k] + UR) inTree = true;
            if (inTree) continue;
            boolean seen = false;
            for (E u : mine) if (hyp(u.x - x, u.y - y) < 1950 && !treeBlocks(u.x, u.y, x, y, 0) && !smokeBlocks(u.x, u.y, x, y)) { seen = true; break; }
            if (!seen) hidden++;
        }
        return hidden / 7.0;
    }

    // ---------------------------------------------------------------- input
    static void readTurn(BufferedReader in, String first) throws IOException {
        turn++;
        int score = Integer.parseInt(first.trim());
        StringTokenizer st = new StringTokenizer(in.readLine());
        nets = Integer.parseInt(st.nextToken()); smokes = Integer.parseInt(st.nextToken()); decoys = Integer.parseInt(st.nextToken());
        int n = Integer.parseInt(in.readLine().trim());
        mine.clear(); seenPrey.clear(); seenPred.clear();
        for (E e : tracks.values()) e.vis = false;
        Iterator<double[]> it = clouds.iterator(); while (it.hasNext()) if (it.next()[2] < turn) it.remove();
        Set<Integer> seenIds = new HashSet<>();
        for (int i = 0; i < n; i++) {
            st = new StringTokenizer(in.readLine());
            int id = Integer.parseInt(st.nextToken()); String type = st.nextToken(); int owner = Integer.parseInt(st.nextToken());
            double x = Double.parseDouble(st.nextToken()), y = Double.parseDouble(st.nextToken());
            double dx = Double.parseDouble(st.nextToken()), dy = Double.parseDouble(st.nextToken());
            int ghost = Integer.parseInt(st.nextToken()), rem = Integer.parseInt(st.nextToken()), fat = Integer.parseInt(st.nextToken()), imm = Integer.parseInt(st.nextToken());
            if (type.equals("SMOKE")) {
                boolean known = false;
                for (double[] c : clouds) if (hyp(c[0] - x, c[1] - y) < 5) { c[2] = turn + rem - 1; known = true; }
                if (!known) clouds.add(new double[]{x, y, turn + rem - 1});
                continue;
            }
            if (!type.equals("UNIT")) continue;                 // own decoys and anything unknown
            if (owner == myId) {
                E u = own.get(id); if (u == null) { u = new E(); u.id = id; u.owner = owner; own.put(id, u); }
                u.x = x; u.y = y; u.vx = dx; u.vy = dy; u.ghost = ghost == 1; u.cd = Math.max(0, rem); u.fat = Math.max(1, fat); u.immob = Math.max(0, imm);
                u.seen = turn; u.usedPower = false; u.cmd = null; u.tag = ""; u.ex = x; u.ey = y;
                mine.add(u);
            } else {
                E s = new E(); s.id = id; s.owner = owner; s.x = x; s.y = y; s.vx = dx; s.vy = dy; s.cd = Math.max(0, rem); s.fat = Math.max(1, fat); s.immob = Math.max(0, imm); s.seen = turn; s.vis = true;
                if (!seenIds.add(id)) { s.dup = true; for (E o : seenPrey) if (o.id == id) o.dup = true; for (E o : seenPred) if (o.id == id) o.dup = true; }
                (owner == prey ? seenPrey : seenPred).add(s);
                E t = tracks.get(id);
                if (t == null || !t.dead || true) { E c = s.copy(); tracks.put(id, c); }
            }
        }
        mine.sort((a, b) -> a.id - b.id);
        if (N < 0) {                                            // first turn: the other teams are rotations of mine
            N = mine.size();
            for (int p = 0; p < 3; p++) {
                if (p == myId) continue;
                double a = ((p - myId + 3) % 3) * 2 * Math.PI / 3, c = Math.cos(a), s = Math.sin(a);
                for (int j = 0; j < N; j++) {
                    E u = mine.get(j); int id = p * N + (u.id - myId * N);
                    if (tracks.containsKey(id)) continue;
                    E t = new E(); t.id = id; t.owner = p; t.x = u.x * c - u.y * s; t.y = u.x * s + u.y * c; t.seen = turn; t.cd = 0;
                    tracks.put(id, t);
                }
            }
        }
        // a catch of ours: the prey we lost sight of next to one of our units is gone
        for (int k = myScore; k < score; k++) {
            E best = null; double bd = 1e18;
            for (E t : tracks.values()) {
                if (t.owner != prey || t.dead || t.vis || t.seen < turn - 4) continue;
                for (E u : mine) { double d = hyp(u.x - t.x, u.y - t.y); if (d < bd) { bd = d; best = t; } }
            }
            if (best != null) best.dead = true;
        }
        myScore = score;
        // remembered positions that we can see are empty: the unit has moved on
        for (E t : tracks.values()) {
            if (t.vis || t.dead || t.lost || t.seen == turn) continue;
            if (canSeePoint(t.x, t.y)) t.lost = true;
        }
    }

    // ---------------------------------------------------------------- scoring of one candidate move
    /**
     * Five-turn chase: the unit keeps walking in direction (ux, uy) after this move (sliding along trees and the wall),
     * every predator runs straight at it. Returns the smallest distance reached: a direction that ends in the wall
     * or in a tree shows up here several turns before it kills.
     */
    static double rollout(double px, double py, double ux, double uy) {
        int n = threats.size(); double[] qx = new double[n], qy = new double[n];
        for (int i = 0; i < n; i++) { qx[i] = threats.get(i).x; qy[i] = threats.get(i).y; }
        double x = px, y = py, min = 1e18;
        for (int k = 1; k <= 5; k++) {
            if (k > 1 && (ux != 0 || uy != 0)) { double[] e = simMove(x, y, x + ux * MOVE, y + uy * MOVE, MOVE, false); x = e[0]; y = e[1]; }
            for (int i = 0; i < n; i++) {
                Th t = threats.get(i);
                if (t.w < 0.5) continue;                              // older than one turn: too uncertain to chase with
                double d = hyp(x - qx[i], y - qy[i]);
                if (t.immob < k) {
                    double step = Math.min(d, k == 1 ? t.reach : MOVE);
                    if (d > 1e-6) { qx[i] += (x - qx[i]) / d * step; qy[i] += (y - qy[i]) / d * step; }
                    d -= step;
                }
                if (d < min) min = d;
            }
        }
        return min;
    }
    static double eval(E u, double px, double py, double ux, double uy, boolean dash, double wx, double wy, double wG, E target, boolean[] certain) {
        double sx = u.x, sy = u.y, sc = 0;
        double mySp = hyp(px - sx, py - sy);
        // catches
        double reward = 0;
        if (!u.ghost) for (E q : seenPrey) {
            double[] v = predV(q);
            double md = 1e18;
            for (int i = 1; i <= 10; i++) { double f = i / 10.0; double d = hyp(sx + (px - sx) * f - q.x - v[0] * f, sy + (py - sy) * f - q.y - v[1] * f); if (d < md) md = d; }
            if (q.immob > 0) { if (md < CATCH - 12) reward = Math.max(reward, 300000); continue; }
            if (md < CATCH - 25) reward = Math.max(reward, 30000);
            double d0 = hyp(q.x - sx, q.y - sy);
            if (mySp > 1 && d0 > 1) {
                double cos = ((px - sx) * (q.x + v[0] * 0.5 - sx) + (py - sy) * (q.y + v[1] * 0.5 - sy)) / (mySp * hyp(q.x + v[0] * 0.5 - sx, q.y + v[1] * 0.5 - sy));
                if (cos > 0.96) {
                    double rq = q.cd == 0 ? DASH : MOVE;
                    if (d0 + rq - mySp < CATCH - 25) reward = Math.max(reward, 300000);          // it cannot outrun this
                    else if (d0 + MOVE - mySp < CATCH - 25) reward = Math.max(reward, 25000);     // it must dash to survive
                }
            }
        }
        if (certain != null) certain[0] = reward >= 300000;
        sc += reward;
        double deathScale = reward >= 300000 ? 0.2 : 1;
        boolean smokeHere = inSmoke(px, py, 150);
        double nearestTh = 1e18;
        for (Th t : threats) {
            double m = 1e18;
            for (int i = 1; i <= 10; i++) { double f = i / 10.0; double d = hyp(sx + (px - sx) * f - t.x, sy + (py - sy) * f - t.y) - t.reach * f; if (d < m) m = d; }
            double lim = CATCH + (t.reach > 0 ? 45 : 15);
            if (m < lim) sc -= t.w * deathScale * (1e6 + (lim - m) * 500);
            double D = hyp(px - t.x, py - t.y);
            if (D < nearestTh) nearestTh = D;
            if (t.immob <= 1) {
                double myNext = (!dash && u.cd <= 1) ? DASH : MOVE;
                double m2 = D - t.reach2 + myNext - CATCH - 60;
                if (m2 < 0) sc -= t.w * 25 * Math.min(-m2, 1200);
            }
            boolean hidden = smokeHere || treeBlocks(px, py, t.x, t.y, 0);
            if (t.immob <= 1) sc -= t.w * (hidden ? 0.3 : 1.0) * Math.max(0, 2500 - D);
            if (!hidden && D < 2470 + (t.immob > 0 ? 0 : 600) && !treeBlocks(px, py, t.x, t.y, NET_TREE)) sc -= t.w * 400;
        }
        if (nearestTh < 4000) sc -= 1.5 * Math.max(0, hyp(px, py) - 6300);
        if (nearestTh < 3600) {
            double rm = rollout(px, py, ux, uy);
            sc += 1.5 * Math.min(rm, 2600);
            if (rm < CATCH + 60) sc -= deathScale * 30000;
        }
        sc -= wG * hyp(px - wx, py - wy);
        if (reward < 300000 && (dash || hyp(px - sx, py - sy) > 100)) sc -= hiddenFrac(px, py) * (dash ? 2500 : 1200);   // no blind steps
        for (E o : oldPred) sc -= Math.max(0, 1800 - hyp(px - o.x, py - o.y));                                          // a predator was here
        if (dash) {
            sc -= 700 + 250 * u.fat;
            if (target != null && target.immob > 0 && (hyp(target.x - sx, target.y - sy) - CATCH) / MOVE > target.immob - 1) sc += 1500;
        }
        return sc;
    }

    // ---------------------------------------------------------------- one turn
    static String decide() {
        List<E> live = new ArrayList<>(), ghosts = new ArrayList<>();
        for (E u : mine) (u.ghost ? ghosts : live).add(u);
        boolean preyGone = myScore >= N;

        // threats: predators in sight, and the ones seen in the last three turns (with a wider reach)
        threats.clear(); oldPred.clear();
        for (E e : seenPred) threats.add(threat(e, 0));
        for (E t : tracks.values()) {
            if (t.owner != pred || t.vis || t.dead || t.lost) continue;
            int age = turn - t.seen; if (age > 3) { if (age <= 8) oldPred.add(t); continue; }
            threats.add(threat(t, age));
        }
        // prey candidates: the ones in sight, then remembered ones
        List<E> cand = new ArrayList<>();
        if (!preyGone) {
            cand.addAll(seenPrey);
            for (E t : tracks.values()) {
                if (t.owner != prey || t.vis || t.dead || t.lost) continue;
                int age = turn - t.seen; if (age > 25) continue;
                cand.add(t);
            }
        }
        // hunters: the cheapest pairs first, at most two per prey
        Map<E, E> targetOf = new IdentityHashMap<>(); Map<E, Integer> load = new IdentityHashMap<>();
        List<E> free = new ArrayList<>(); for (E u : live) if (u.immob == 0) free.add(u);
        for (int cap = 2; cap <= 6 && !free.isEmpty() && !cand.isEmpty(); cap += 4) {
            while (!free.isEmpty()) {
                E bu = null, bq = null; double bc = 1e18;
                for (E u : free) for (E q : cand) {
                    if (load.getOrDefault(q, 0) >= cap) continue;
                    double c = hyp(u.x - q.x, u.y - q.y) + (turn - q.seen) * 200 - (q.immob > 0 ? 2500 : 0) + load.getOrDefault(q, 0) * 800;
                    if (c < bc) { bc = c; bu = u; bq = q; }
                }
                if (bu == null) break;
                targetOf.put(bu, bq); load.merge(bq, 1, Integer::sum); free.remove(bu);
            }
        }

        // moves of the living units
        boolean[] cert = new boolean[1];
        for (E u : live) {
            if (u.immob > 0) { u.tag = "HELD"; continue; }
            if (preyGone) { double nt0 = 1e18; for (Th t : threats) nt0 = Math.min(nt0, hyp(u.x - t.x, u.y - t.y)); if (nt0 > 3600) { u.tag = "HIDE"; continue; } }
            E target = targetOf.get(u);
            double gx, gy, wG;
            if (target != null) {
                double[] v = target.vis ? predV(target) : new double[]{0, 0};
                gx = target.x; gy = target.y;
                for (int i = 0; i < 3; i++) { double tt = Math.min(4, hyp(gx - u.x, gy - u.y) / MOVE); gx = target.x + v[0] * tt; gy = target.y + v[1] * tt; }
                double l = hyp(gx, gy); if (l > R - UR) { gx *= (R - UR) / l; gy *= (R - UR) / l; }
                wG = (target.immob > 0 || hyp(target.x - u.x, target.y - u.y) < 1500) ? 2.0 : 1.0;
            } else {
                int idx = u.id - myId * N;
                double a = idx * 2 * Math.PI / Math.max(1, N) + turn * 0.12;
                gx = Math.cos(a) * 4500; gy = Math.sin(a) * 4500; wG = preyGone ? 0.05 : 0.5;
            }
            double[] w = steer(u.x, u.y, gx, gy);
            double best = -1e300; String bestCmd = null; double bex = u.x, bey = u.y; boolean bestCert = false, bestDash = false;
            for (int sp = 0; sp < 2; sp++) {
                if (sp == 1 && u.cd > 0) break;
                double speed = sp == 0 ? MOVE : DASH;
                for (int k = -2; k < 24; k++) {
                    double dx, dy;
                    if (k == -2) { dx = w[0] - u.x; dy = w[1] - u.y; } else if (k == -1) { dx = gx - u.x; dy = gy - u.y; } else { dx = Math.cos(k * Math.PI / 12); dy = Math.sin(k * Math.PI / 12); }
                    double l = hyp(dx, dy); if (l < 1) continue;
                    double ax = u.x + dx / l * speed, ay = u.y + dy / l * speed;
                    double al = hyp(ax, ay); if (al > R - 1) { ax *= (R - 1) / al; ay *= (R - 1) / al; }
                    ax = Math.round(ax); ay = Math.round(ay);
                    double[] e = simMove(u.x, u.y, ax, ay, speed, false);
                    double s = eval(u, e[0], e[1], dx / l, dy / l, sp == 1, w[0], w[1], wG, target, cert);
                    if (s > best) { best = s; bestCmd = (sp == 1 ? "DASH " : "MOVE ") + u.id + " " + (long) ax + " " + (long) ay; bex = e[0]; bey = e[1]; bestCert = cert[0]; bestDash = sp == 1; }
                }
            }
            double s = eval(u, u.x, u.y, 0, 0, false, w[0], w[1], wG, target, cert);
            if (s > best) { best = s; bestCmd = null; bex = u.x; bey = u.y; bestCert = cert[0]; bestDash = false; }
            u.cmd = bestCmd; u.ex = bex; u.ey = bey;
            double nt = 1e18; for (Th t : threats) nt = Math.min(nt, hyp(u.x - t.x, u.y - t.y));
            u.tag = bestCert ? "CATCH" : nt < 2500 ? "FLEE" : target != null ? "HUNT" : "SEEK";
            if (bestCert) for (E q : seenPrey) if (segDist(q.x, q.y, u.x, u.y, bex, bey) < CATCH + 300) q.caughtNow = true;
        }

        List<String> out = new ArrayList<>();
        // ---- powers. Decoys leave before the move, nets and smoke after it (from u.ex, u.ey).
        // 1. nets at prey that cannot dodge
        for (E u : live) {
            if (nets <= 0) break;
            if (u.immob > 0 && hunterInReach(u)) continue;      // a held unit keeps its net for the hunter
            E bq = null; double bd = 1e18; double bx = 0, by = 0;
            for (E q : seenPrey) {
                if (q.netTargeted || q.caughtNow || q.immob >= 2) continue;
                double[] v = predV(q); double qx = q.x + v[0], qy = q.y + v[1];
                double d = hyp(qx - u.ex, qy - u.ey);
                if (d < 450 || d > 2250) continue;
                if (q.dup && d > 1200) continue;
                if (turn == 1 && q.cd == 0) continue;
                if (treeBlocks(u.ex, u.ey, qx, qy, NET_TREE + 20) || friendOnLine(u, qx, qy, live)) continue;
                double lateral = Math.abs(v[0] * (qy - u.ey) - v[1] * (qx - u.ex)) / d;
                // a target that cannot dodge (no dash, close, or not moving across the line) is always worth a net;
                // any other visible prey gets one while a net stays in reserve for defence (63 % of such nets hit in Gold)
                boolean sure = q.immob == 1 || q.cd > 0 || d <= 1400 || lateral <= 250;
                if (!sure && nets < 2) continue;
                double cost = d + (sure ? 0 : 1500);
                if (cost < bd) { bd = cost; bq = q; bx = qx; by = qy; }
            }
            if (bq != null) { out.add(net(u, bx, by)); bq.netTargeted = true; }
        }
        // 2. nets at the hunter that is about to reach us
        for (E u : live) {
            if (nets <= 0) break; if (u.usedPower) continue;
            E be = null; double bd = 1e18; double bx = 0, by = 0;
            for (E e : seenPred) {
                if (e.immob > 0 || e.netTargeted) continue;
                double[] v = predV(e); double qx = e.x + v[0], qy = e.y + v[1];
                double d = hyp(qx - u.ex, qy - u.ey);
                if (d < 300 || d > 2200) continue;
                if (treeBlocks(u.ex, u.ey, qx, qy, NET_TREE + 20) || friendOnLine(u, qx, qy, live)) continue;
                boolean need = (u.immob > 0 && d <= CATCH + MOVE * u.immob + MOVE) || d <= 1500;
                for (E h : live) if (h != u && h.immob > 0 && hyp(e.x - h.x, e.y - h.y) <= CATCH + MOVE * h.immob + MOVE) need = true;   // rescue
                double lateral = Math.abs(v[0] * (qy - u.ey) - v[1] * (qx - u.ex)) / d;
                boolean hit = e.cd > 0 || d <= 1300 || lateral <= 250;
                if (need && hit && d < bd) { bd = d; be = e; bx = qx; by = qy; }
            }
            if (be != null) { out.add(net(u, bx, by)); be.netTargeted = true; }
        }
        // 3. smoke before the net comes, 4. a decoy that walks at the hunter
        for (E u : live) {
            if (u.usedPower) continue;
            double D = 1e18, Dpre = 1e18; E near = null;
            for (Th t : threats) {
                if (t.immob > 0 || (t.e.seen != turn)) continue;
                double d = hyp(t.x - u.ex, t.y - u.ey);
                if (d < D) { D = d; near = t.e; Dpre = hyp(t.x - u.x, t.y - u.y); }
            }
            if (near == null) continue;
            boolean line = !treeBlocks(u.ex, u.ey, near.x, near.y, NET_TREE);
            boolean wantSmoke = (u.immob > 0 && D < 3500) || (D < 2300 && line);
            if (wantSmoke && smokes > 0 && !inSmoke(u.ex, u.ey, 400)) {
                double mx = u.ex - u.x, my = u.ey - u.y, ml = hyp(mx, my);
                double cx = u.ex, cy = u.ey;
                if (ml > 50) { cx += mx / ml * 900; cy += my / ml * 900; }
                double cl = hyp(cx, cy); if (cl > R - 200) { cx *= (R - 200) / cl; cy *= (R - 200) / cl; }
                out.add("SMOKE " + u.id + " " + Math.round(cx) + " " + Math.round(cy));
                smokes--; u.usedPower = true; clouds.add(new double[]{cx, cy, turn + SMOKE_LIFE});
            } else if (decoys > 0 && u.immob == 0 && turn - u.lastDecoy > 8 && Dpre < 2900 && !treeBlocks(u.x, u.y, near.x, near.y, 0) && !inSmoke(u.ex, u.ey, 400)) {
                out.add("DECOY " + u.id + " " + Math.round(near.x) + " " + Math.round(near.y));
                decoys--; u.usedPower = true; u.lastDecoy = turn;
            }
        }

        // ---- ghosts: sit on prey (then on predators) so the team keeps seeing them
        List<E> watch = new ArrayList<>(cand);
        watch.sort((a, b) -> Integer.compare(turn - a.seen, turn - b.seen));
        List<E> predWatch = new ArrayList<>(seenPred);
        for (E t : tracks.values()) if (t.owner == pred && !t.vis && !t.dead && !t.lost && turn - t.seen <= 10) predWatch.add(t);
        Set<Integer> taken = new HashSet<>();
        for (E g : ghosts) {
            E best = null; double bd = 1e18;
            for (E q : watch) { if (taken.contains(q.id)) continue; double d = hyp(q.x - g.x, q.y - g.y) + (turn - q.seen) * 300; if (d < bd) { bd = d; best = q; } }
            if (best == null) for (E q : predWatch) { if (taken.contains(q.id)) continue; double d = hyp(q.x - g.x, q.y - g.y); if (d < bd) { bd = d; best = q; } }
            double gx, gy;
            if (best != null) { taken.add(best.id); double[] v = best.vis ? predV(best) : new double[]{0, 0}; gx = best.x + v[0]; gy = best.y + v[1]; }
            else { double a = (g.id - myId * N) * 2 * Math.PI / Math.max(1, N) - turn * 0.2; gx = Math.cos(a) * 4000; gy = Math.sin(a) * 4000; }
            double d = hyp(gx - g.x, gy - g.y);
            if (d < 60) continue;
            g.cmd = (d > 1500 && g.cd == 0 ? "DASH " : "MOVE ") + g.id + " " + Math.round(gx) + " " + Math.round(gy); g.tag = "GHOST";
        }

        List<String> all = new ArrayList<>();
        for (E u : mine) if (u.cmd != null) all.add(u.cmd + (u.tag.isEmpty() ? "" : " " + u.tag));
        all.addAll(out);
        return all.isEmpty() ? "WAIT" : String.join(";", all);
    }

    static boolean hunterInReach(E u) {
        for (E e : seenPred) if (e.immob == 0 && hyp(e.x - u.x, e.y - u.y) <= CATCH + MOVE * u.immob + MOVE) return true;
        return false;
    }
    static Th threat(E e, int age) {
        Th t = new Th(); t.e = e; t.x = e.x; t.y = e.y; t.immob = age == 0 ? e.immob : 0;
        if (t.immob > 0) { t.reach = 0; t.reach2 = t.immob >= 2 ? 0 : (e.cd <= 1 ? DASH : MOVE); }
        else { t.reach = (e.cd == 0 ? DASH : MOVE) + age * MOVE; t.reach2 = (e.cd <= 1 ? DASH + MOVE : 2 * MOVE) + age * MOVE; }
        t.w = 1.0 / (1 + age);
        return t;
    }
    static boolean friendOnLine(E u, double qx, double qy, List<E> live) {
        for (E f : live) if (f != u && segDist(f.ex, f.ey, u.ex, u.ey, qx, qy) < 500) return true;
        return false;
    }
    static String net(E u, double qx, double qy) {
        double d = hyp(qx - u.ex, qy - u.ey);
        double ax = u.ex + (qx - u.ex) / d * NET_RANGE, ay = u.ey + (qy - u.ey) / d * NET_RANGE;
        nets--; u.usedPower = true;
        return "NET " + u.id + " " + Math.round(ax) + " " + Math.round(ay);
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        myId = Integer.parseInt(in.readLine().trim()); prey = (myId + 1) % 3; pred = (myId + 2) % 3;
        in.readLine();                                          // map radius: always 8000
        T = Integer.parseInt(in.readLine().trim());
        tx = new double[T]; ty = new double[T]; tr = new double[T];
        for (int i = 0; i < T; i++) { StringTokenizer st = new StringTokenizer(in.readLine()); st.nextToken(); tx[i] = Double.parseDouble(st.nextToken()); ty[i] = Double.parseDouble(st.nextToken()); tr[i] = Double.parseDouble(st.nextToken()); }
        String line;
        while ((line = in.readLine()) != null) {
            if (line.trim().isEmpty()) continue;
            readTurn(in, line);
            String cmd;
            try { cmd = decide(); } catch (RuntimeException ex) { System.err.println("ERR " + ex); cmd = "WAIT"; }
            System.out.println(cmd);
            System.out.flush();
        }
    }
}
