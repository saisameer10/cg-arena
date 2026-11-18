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
    static List<E> liveNow = new ArrayList<>();          // my living units (ex, ey = where each one will stand)
    static long turnStart;
    // ---- numbers that tools/variant.sh can change for tuning on the local referee (P_NAME=value)
    static final double P_WG_FAR = 1.0, P_WG_NEAR = 2.0, P_WG_SEEK = 1.0;      // pull towards prey far / near or netted / a search cell
    static final double P_ROLL = 1.5, P_PROX = 1.0, P_PROX_R = 2500;         // chase lookahead weight; soft distance to predators
    static final double P_NETLINE = 400, P_M2 = 25, P_WALL = 1.5;            // clear net line; two-turn margin; wall ring
    static final double P_DASH = 700, P_DASH_FAT = 250, P_APP_COST = 300, P_APP_PRED = 3000, P_APP_MIN = 1500, P_APP_FAT = 2;
    static final double P_NET_SURE = 1400, P_NET_MAX = 2250, P_NET_RES = 2;  // nets at prey
    static final double P_DNET_NEED = 1500, P_DNET_HIT = 1300;               // nets at the hunter
    static final double P_SMOKE_D = 2300, P_DECOY_D = 2900, P_STRIKE = 25000, P_FREE = 500, P_SEP = 1.5, P_MAP_AGE = 120;
    // ---- sub-versions from the autopsy of battle 924177559 and the user's list (all off = v10)
    static final boolean F_CLOUDPLAN = false;   // B1 in our cloud with no predator near: leave it; with one near: stay hidden, keep moving
    static final boolean F_SMOKEMID = false;    // B3 cloud centred between us and the predator (covers both, we are out sooner)
    static final boolean F_NOSMOKE3 = false;    // B4 no smoke on turns 1 to 3 unless the predator is inside 1500
    static final boolean F_NEARNOSMOKE = false; // no smoke when the predator is already inside P_SMOKE_MIN: it arrives anyway
    static final boolean F_HELDNET = false;     // a held unit nets the nearest hunter at once, sure aim or not
    static final boolean F_HELDDECOY = false;   // a held unit without a net sends a decoy before it smokes
    static final boolean F_NETFIRST = false;    // B5 net the hunter that was within P_NETFIRST of us before the move
    static final boolean F_FORGET = false;      // B6 forget a remembered prey position after P_FORGET turns
    static final boolean F_EARLYAGG = false;    // up to turn P_AGG_T: less distance kept, later smoke, bolder approach dash
    static final boolean F_HIDETREE = false;    // nothing left to catch: stand behind a tree, away from the nearest predator
    static final boolean F_GHOSTMAP = false;    // ghosts without a target search the map instead of circling
    static final double P_CLOUD_TH = 1800, P_CLOUD_OUT = 1500, P_SMOKE_AHEAD = 900, P_SMOKE_MIN = 800, P_NETFIRST = 1500, P_FORGET = 8, P_AGG_T = 10;
    static double[] hideGoal;
    // ---- from the Gold autopsy (kb/gold-autopsy.md)
    static final boolean F_FINISHER = true;   // net at free prey only if one of our hunters ends within P_FINISH of it
    static final boolean F_CLOUDMEM = false;  // while a unit of ours is in a cloud, predators seen up to 9 turns ago stay threats
    static final boolean F_T1 = false;        // turn 1: predator start inside 2000 -> dash away; smoke if inside 1500, or inside 2000 with a clear line
    static final double P_FINISH = 1300;
    static boolean t1Flee;
    // ---- switches for ablation tests (tools/ablate.sh turns one off at a time and plays it against the full bot)
    static final boolean F_DASH = true;      // dash only for a catch, netted prey, or when no walk is safe
    static final boolean F_APPROACH = true;  // early dashes to close in on prey
    static final boolean F_SMOKE = false;     // smoke thrown past the hunter instead of ahead of ourselves
    static final boolean F_NOSMOKE = false;  // true: never throw smoke
    static final boolean F_SEP = true;       // keep team mates apart
    static final boolean F_FREE = true;      // ways-out count (wall, pockets)
    static final boolean F_STALE = true;     // predators out of sight keep moving
    static final boolean F_MAP = true;       // search map instead of the ring patrol
    static final boolean F_HIDDEN = false;    // penalty for moves onto ground nobody sees
    static final boolean F_OLDPRED = false;   // avoid places where a predator stood 4 to 8 turns ago
    static final boolean F_ROLL = true;      // five-turn chase lookahead
    static final boolean F_NETWIDE = true;   // nets also at prey that could dodge
    static final boolean F_DECOY = true;     // decoys walked at the predator
    static final boolean F_HIDE = true;      // stand still when no prey is left
    static final boolean F_PROX = true;      // keep 2500 away from predators (soft)
    static boolean approachDash;                         // this unit may spend an early dash to close in on prey
    static boolean lastUnsafe, lastNeedF; static double lastReward; // set by eval: a predator could touch this move / ways out still to be scored / catch value
    static final double[] cS = new double[64], cX = new double[64], cY = new double[64]; static final String[] cC = new String[64];
    static final boolean[] cF = new boolean[64], cT = new boolean[64];

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
        final int slices = hyp(x, y) + len >= R - UR ? 4 : 1;         // the wall is the only reason to cut the move up
        for (int sl = 0; sl < slices; sl++) {
            double rem = 1.0 / slices, sx = x, sy = y;
            for (int it = 0; it < 4 && rem > 1e-7; it++) {
                double rvx = vx * rem, rvy = vy * rem, A = rvx * rvx + rvy * rvy;
                if (A < 1e-9) break;
                double bt = 2; int bi = -1;
                if (!ghost) for (int i = 0; i < T; i++) {
                    double fx = x - tx[i], fy = y - ty[i], rr = tr[i] + UR, far = rr + len;
                    if (fx * fx + fy * fy > far * far) continue;
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

    // ---------------------------------------------------------------- search map
    // The arena cut into 1000 x 1000 cells with the turn each one was last in sight of one of my units. Units without
    // prey walk to the cell that has been out of sight longest (for its distance), each to a different area.
    // The old fixed ring patrol had prey in sight on 17 of 100 turns in a game without a single catch.
    static final int GC = 16; static final double CELL = 1000;
    static final int[] cellSeen = new int[GC * GC]; static final boolean[] cellOk = new boolean[GC * GC]; static boolean gridReady;
    static double cellX(int c) { return -8000 + (c % GC + 0.5) * CELL; }
    static double cellY(int c) { return -8000 + (c / GC + 0.5) * CELL; }
    static void updateGrid() {
        if (!gridReady) {
            for (int c = 0; c < GC * GC; c++) {
                double x = cellX(c), y = cellY(c); boolean ok = hyp(x, y) < R - 500;
                for (int k = 0; k < T && ok; k++) if (hyp(x - tx[k], y - ty[k]) < tr[k] + UR) ok = false;
                cellOk[c] = ok; cellSeen[c] = -20;
            }
            gridReady = true;
        }
        for (int c = 0; c < GC * GC; c++) {
            if (!cellOk[c]) continue;
            double x = cellX(c), y = cellY(c);
            for (E u : mine) if (hyp(u.x - x, u.y - y) < 1900 && !treeBlocks(u.x, u.y, x, y, 0) && !smokeBlocks(u.x, u.y, x, y)) { cellSeen[c] = turn; break; }
        }
    }
    /** Cell to search for a unit at (ux, uy); cells near the ones in `claimed` or near a known predator count less. */
    static int searchCell(double ux, double uy, List<Integer> claimed) {
        int best = -1; double bs = -1e18;
        for (int c = 0; c < GC * GC; c++) {
            if (!cellOk[c]) continue;
            int age = Math.min(turn - cellSeen[c], 40); if (age < 3) continue;
            double x = cellX(c), y = cellY(c);
            double sc = age * P_MAP_AGE - hyp(x - ux, y - uy);
            for (int o : claimed) sc -= Math.max(0, 3000 - hyp(x - cellX(o), y - cellY(o)));
            for (Th t : threats) if (hyp(x - t.x, y - t.y) < 2500) sc -= 3000;
            if (sc > bs) { bs = sc; best = c; }
        }
        return best;
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
    /**
     * Ways out of (px, py): how many of 12 walking directions really move the unit (no tree, no wall, no pocket)
     * without bringing it closer to a predator. The wall halves it, a pocket between a tree and the wall makes it 0.
     */
    static int freedom(double px, double py) {
        int n = 0;
        for (int k = 0; k < 12; k++) {
            double a = k * Math.PI / 6;
            double[] e = simMove(px, py, px + Math.cos(a) * MOVE, py + Math.sin(a) * MOVE, MOVE, false);
            if (hyp(e[0] - px, e[1] - py) < 450) continue;
            boolean ok = true;
            for (Th t : threats) { if (t.w < 0.5 || t.immob > 1) continue; double d0 = hyp(px - t.x, py - t.y); if (d0 < 3000 && hyp(e[0] - t.x, e[1] - t.y) < d0 - 100) { ok = false; break; } }
            if (ok) n++;
        }
        return n;
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
                    else if (d0 + MOVE - mySp < CATCH - 25) reward = Math.max(reward, P_STRIKE);     // it must dash to survive
                }
            }
        }
        if (certain != null) certain[0] = reward >= 300000;
        sc += reward; lastReward = reward; lastUnsafe = false; lastNeedF = false;
        boolean startSmoke = inSmoke(sx, sy, 0);
        double deathScale = reward >= 300000 ? 0.2 : 1;
        boolean smokeHere = inSmoke(px, py, 150);
        double nearestTh = 1e18;
        for (Th t : threats) {
            double m = 1e18;
            for (int i = 1; i <= 10; i++) { double f = i / 10.0; double d = hyp(sx + (px - sx) * f - t.x, sy + (py - sy) * f - t.y) - t.reach * f; if (d < m) m = d; }
            double lim = CATCH + (t.reach > 0 ? 45 : 15);
            if (m < lim) { sc -= t.w * deathScale * (1e6 + (lim - m) * 500); if (t.w >= 0.5) lastUnsafe = true; }
            double D = hyp(px - t.x, py - t.y);
            if (D < nearestTh) nearestTh = D;
            if (t.immob <= 1) {
                double myNext = (!dash && u.cd <= 1) ? DASH : MOVE;
                double m2 = D - t.reach2 + myNext - CATCH - 60;
                if (m2 < 0) sc -= t.w * P_M2 * Math.min(-m2, 1200);
            }
            boolean hidden = smokeHere || treeBlocks(px, py, t.x, t.y, 0);
            if (F_PROX && t.immob <= 1) sc -= t.w * (hidden ? 0.3 : 1.0) * P_PROX * (F_EARLYAGG && turn <= P_AGG_T ? 0.4 : 1) * Math.max(0, P_PROX_R - D);
            if (!hidden && D < 2470 + (t.immob > 0 ? 0 : 600) && !treeBlocks(px, py, t.x, t.y, NET_TREE)) sc -= t.w * P_NETLINE;
        }
        if (nearestTh < 4000) sc -= P_WALL * Math.max(0, hyp(px, py) - 6300);
        if (nearestTh < 3600) {
            lastNeedF = F_FREE && reward < 300000;
            double rm = F_ROLL ? rollout(px, py, ux, uy) : 2600;
            sc += P_ROLL * Math.min(rm, 2600);
            if (rm < CATCH + 60) sc -= deathScale * 30000;
        }
        if (F_SEP && reward < 300000) for (E o : liveNow) if (o != u) sc -= P_SEP * Math.max(0, 700 - hyp(px - o.ex, py - o.ey));   // never stack
        if (startSmoke && u.immob == 0) {                                // blind in a cloud: do not stand, walk out
            if (hyp(px - sx, py - sy) < 100) sc -= 1500;
            if (smokeHere) {
                if (!F_CLOUDPLAN) sc -= 400;
                else { double nth = 1e18; for (Th t : threats) if (t.w >= 0.4) nth = Math.min(nth, hyp(sx - t.x, sy - t.y)); if (nth > P_CLOUD_TH) sc -= P_CLOUD_OUT; }
            }
        }
        sc -= wG * hyp(px - wx, py - wy);
        if (F_HIDDEN && reward < 300000 && !startSmoke) sc -= hiddenFrac(px, py) * (dash ? 2500 : target != null && turn - target.seen <= 2 ? 400 : 800);                            // no blind steps
        if (F_OLDPRED) for (E o : oldPred) sc -= 0.5 * Math.max(0, 1800 - hyp(px - o.x, py - o.y));                                          // a predator was here
        if (dash) {
            sc -= t1Flee ? 0 : approachDash ? P_APP_COST : P_DASH + P_DASH_FAT * u.fat;
            if (target != null && target.immob > 0 && (hyp(target.x - sx, target.y - sy) - CATCH) / MOVE > target.immob - 1) sc += 1500;
        }
        return sc;
    }

    // ---------------------------------------------------------------- one turn
    static String decide() {
        List<E> live = new ArrayList<>(), ghosts = new ArrayList<>();
        for (E u : mine) (u.ghost ? ghosts : live).add(u);
        boolean preyGone = myScore >= N;
        liveNow = live;
        updateGrid();
        List<Integer> claimed = new ArrayList<>();

        // threats: predators in sight, and the ones seen in the last three turns (with a wider reach)
        threats.clear(); oldPred.clear();
        for (E e : seenPred) threats.add(threat(e, 0));
        for (E t : tracks.values()) {
            if (t.owner != pred || t.vis || t.dead || t.lost) continue;
            int age = turn - t.seen;
            if (age > 3) {
                boolean keep = false;
                if (F_CLOUDMEM && age <= 9) for (E o : live) if (inSmoke(o.x, o.y, 0) && hyp(o.x - t.x, o.y - t.y) < 3500) keep = true;
                if (!keep) { if (age <= 8) oldPred.add(t); continue; }
            }
            threats.add(threat(t, age));
        }
        // prey candidates: the ones in sight, then remembered ones
        List<E> cand = new ArrayList<>();
        if (!preyGone) {
            cand.addAll(seenPrey);
            for (E t : tracks.values()) {
                if (t.owner != prey || t.vis || t.dead || t.lost) continue;
                int age = turn - t.seen; if (age > (F_FORGET ? P_FORGET : 25)) continue;
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
            if (preyGone && F_HIDE) { double nt0 = 1e18; for (Th t : threats) nt0 = Math.min(nt0, hyp(u.x - t.x, u.y - t.y)); for (E o : oldPred) nt0 = Math.min(nt0, hyp(u.x - o.x, u.y - o.y) + 1200); hideGoal = null;
                if (nt0 > 3600 && !inSmoke(u.x, u.y, 0)) {
                    u.tag = "HIDE";
                    if (!F_HIDETREE || T == 0) continue;
                    // the spot behind the nearest tree, seen from the last known predator (or from the centre)
                    double fx = 0, fy = 0, fd = 1e18; for (E t : tracks.values()) if (t.owner == pred && !t.dead) { double dd = hyp(t.x - u.x, t.y - u.y) + (turn - t.seen) * 100; if (dd < fd) { fd = dd; fx = t.x; fy = t.y; } }
                    int bt = 0; double btd = 1e18; for (int k = 0; k < T; k++) { double dd = hyp(u.x - tx[k], u.y - ty[k]) - tr[k]; if (dd < btd) { btd = dd; bt = k; } }
                    double ax = tx[bt] - fx, ay = ty[bt] - fy, al = Math.max(1, hyp(ax, ay));
                    double hx0 = tx[bt] + ax / al * (tr[bt] + UR + 40), hy0 = ty[bt] + ay / al * (tr[bt] + UR + 40);
                    double hl = hyp(hx0, hy0); if (hl > R - UR - 300) { hx0 *= (R - UR - 300) / hl; hy0 *= (R - UR - 300) / hl; }
                    if (hyp(hx0 - u.x, hy0 - u.y) < 120) continue;
                    hideGoal = new double[]{hx0, hy0};
                }
            } else hideGoal = null;
            E target = targetOf.get(u);
            double gx, gy, wG;
            if (target != null) {
                double[] v = target.vis ? predV(target) : new double[]{0, 0};
                gx = target.x; gy = target.y;
                for (int i = 0; i < 3; i++) { double tt = Math.min(4, hyp(gx - u.x, gy - u.y) / MOVE); gx = target.x + v[0] * tt; gy = target.y + v[1] * tt; }
                double l = hyp(gx, gy); if (l > R - UR) { gx *= (R - UR) / l; gy *= (R - UR) / l; }
                wG = (target.immob > 0 || hyp(target.x - u.x, target.y - u.y) < 1500) ? P_WG_NEAR : P_WG_FAR;
            } else {
                int cell = preyGone || !F_MAP ? -1 : searchCell(u.x, u.y, claimed);
                if (cell >= 0) { claimed.add(cell); gx = cellX(cell); gy = cellY(cell); wG = P_WG_SEEK; }
                else {
                    int idx = u.id - myId * N;
                    double a = idx * 2 * Math.PI / Math.max(1, N) + turn * 0.12;
                    gx = Math.cos(a) * 4500; gy = Math.sin(a) * 4500; wG = preyGone ? 0.05 : 0.5;
                }
            }
            if (hideGoal != null) { gx = hideGoal[0]; gy = hideGoal[1]; wG = 1.0; }
            double[] w = steer(u.x, u.y, gx, gy);
            int nc = 0;
            boolean hurry = System.nanoTime() - turnStart > 25_000_000L;   // 50 ms per turn: the last units get a coarser search
            boolean walkUnsafe = true;                      // true until a walk (or standing) is found that no predator can touch
            cS[nc] = eval(u, u.x, u.y, 0, 0, false, w[0], w[1], wG, target, cert); cX[nc] = u.x; cY[nc] = u.y; cC[nc] = null; cF[nc] = lastNeedF; cT[nc] = cert[0]; nc++;
            if (!lastUnsafe) walkUnsafe = false;
            boolean rush = target != null && target.immob > 0 && (hyp(target.x - u.x, target.y - u.y) - CATCH) / MOVE > target.immob - 1;
            boolean preyNear = false; for (E q : seenPrey) if (hyp(q.x - u.x, q.y - u.y) < 1700) preyNear = true;
            // early catches decide ties: the first two dashes (1 and 2 turns of cooldown) may be spent to close in on prey
            // we know about, as long as no predator is near
            double ntF = 1e18; for (Th t : threats) if (t.w >= 0.5) ntF = Math.min(ntF, hyp(u.x - t.x, u.y - t.y));
            approachDash = F_APPROACH && target != null && turn - target.seen <= 1 && u.fat <= P_APP_FAT && ntF > (F_EARLYAGG && turn <= P_AGG_T ? 2000 : P_APP_PRED) && hyp(target.x - u.x, target.y - u.y) > P_APP_MIN;
            t1Flee = F_T1 && turn == 1 && ntF < 2000;
            for (int sp = 0; sp < 2; sp++) {
                // dashes are a budget (the k-th costs k turns): only for a catch, to reach netted prey in time,
                // or when no walk is safe this turn
                if (sp == 1 && (u.cd > 0 || (F_DASH && !(walkUnsafe || rush || preyNear || approachDash || t1Flee)))) break;
                double speed = sp == 0 ? MOVE : DASH;
                for (int k = -2; k < 24; k += (hurry && k >= 0 ? 2 : 1)) {
                    double dx, dy;
                    if (k == -2) { dx = w[0] - u.x; dy = w[1] - u.y; } else if (k == -1) { dx = gx - u.x; dy = gy - u.y; } else { dx = Math.cos(k * Math.PI / 12); dy = Math.sin(k * Math.PI / 12); }
                    double l = hyp(dx, dy); if (l < 1) continue;
                    double ax = u.x + dx / l * speed, ay = u.y + dy / l * speed;
                    double al = hyp(ax, ay); if (al > R - 1) { ax *= (R - 1) / al; ay *= (R - 1) / al; }
                    ax = Math.round(ax); ay = Math.round(ay);
                    double[] e = simMove(u.x, u.y, ax, ay, speed, false);
                    double s = eval(u, e[0], e[1], dx / l, dy / l, sp == 1, w[0], w[1], wG, target, cert);
                    if (sp == 0 && !lastUnsafe) walkUnsafe = false;
                    if (F_DASH && sp == 1 && !(walkUnsafe || rush || approachDash || t1Flee || lastReward >= 300000 || (lastReward >= 25000 && u.fat <= 2))) continue;
                    cS[nc] = s; cX[nc] = e[0]; cY[nc] = e[1]; cC[nc] = (sp == 1 ? "DASH " : "MOVE ") + u.id + " " + (long) ax + " " + (long) ay; cF[nc] = lastNeedF; cT[nc] = cert[0]; nc++;
                }
            }
            // ways out (wall, pockets) cost 12 simulated moves each: scored only for the candidates that lead
            int bi = 0;
            for (int it = 0; it < (hurry ? 3 : 14); it++) {
                bi = 0; for (int i = 1; i < nc; i++) if (cS[i] > cS[bi]) bi = i;
                if (!cF[bi]) break;
                cS[bi] -= P_FREE * Math.max(0, 5 - freedom(cX[bi], cY[bi])); cF[bi] = false;
            }
            String bestCmd = cC[bi]; double bex = cX[bi], bey = cY[bi]; boolean bestCert = cT[bi];
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
                if (d < 450 || d > P_NET_MAX) continue;
                if (F_FINISHER && q.immob == 0) { double fd = 1e18; for (E h : live) if (h.immob == 0) fd = Math.min(fd, hyp(h.ex - qx, h.ey - qy)); if (fd > P_FINISH) continue; }
                if (q.dup && d > 1200) continue;
                if (turn == 1 && q.cd == 0) continue;
                if (treeBlocks(u.ex, u.ey, qx, qy, NET_TREE + 20) || friendOnLine(u, qx, qy, live)) continue;
                double lateral = Math.abs(v[0] * (qy - u.ey) - v[1] * (qx - u.ex)) / d;
                // a target that cannot dodge (no dash, close, or not moving across the line) is always worth a net;
                // any other visible prey gets one while a net stays in reserve for defence (63 % of such nets hit in Gold)
                boolean sure = q.immob == 1 || q.cd > 0 || d <= P_NET_SURE || lateral <= 250;
                if (!sure && (nets < P_NET_RES || !F_NETWIDE)) continue;
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
                boolean need = (u.immob > 0 && d <= CATCH + MOVE * u.immob + MOVE) || d <= P_DNET_NEED
                        || (F_NETFIRST && hyp(e.x - u.x, e.y - u.y) <= P_NETFIRST) || (F_HELDNET && u.immob > 0);
                for (E h : live) if (h != u && h.immob > 0 && hyp(e.x - h.x, e.y - h.y) <= CATCH + MOVE * h.immob + MOVE) need = true;   // rescue
                double lateral = Math.abs(v[0] * (qy - u.ey) - v[1] * (qx - u.ex)) / d;
                boolean hit = e.cd > 0 || d <= P_DNET_HIT || lateral <= 250 || (F_HELDNET && u.immob > 0);
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
            boolean wantSmoke = (u.immob > 0 && D < 3500) || (D < (F_EARLYAGG && turn <= P_AGG_T ? 1500 : P_SMOKE_D) && line)
                    || (F_T1 && turn == 1 && (Dpre < 1500 || (Dpre < 2000 && line)));
            if (F_NOSMOKE3 && turn <= 3 && D >= 1500 && u.immob == 0) wantSmoke = false;
            if (F_NEARNOSMOKE && D < P_SMOKE_MIN) wantSmoke = false;
            if (F_HELDDECOY && u.immob > 0 && decoys > 0 && turn - u.lastDecoy > 8 && D < 3500) {
                out.add("DECOY " + u.id + " " + Math.round(near.x) + " " + Math.round(near.y)); decoys--; u.usedPower = true; u.lastDecoy = turn; continue;
            }
            double[] nv = predV(near); double hx = near.x + nv[0], hy = near.y + nv[1];      // where the hunter will be
            if (!F_NOSMOKE && wantSmoke && smokes > 0 && !inSmoke(u.ex, u.ey, F_SMOKE ? 0 : 400) && (!F_SMOKE || !inSmoke(hx, hy, 200))) {
                // the cloud goes 2000 out, past the hunter: it is blind inside (radius 1900), we stay just outside
                // and keep our sight. A cloud on ourselves blinded us: 42 % of our arena losses were inside our own smoke.
                double dl = Math.max(1, hyp(hx - u.ex, hy - u.ey));
                double cx = u.ex + (hx - u.ex) / dl * SMOKE_THROW, cy = u.ey + (hy - u.ey) / dl * SMOKE_THROW;
                if (!F_SMOKE) { double mx = u.ex - u.x, my = u.ey - u.y, ml = hyp(mx, my); cx = u.ex; cy = u.ey; if (ml > 50) { cx += mx / ml * P_SMOKE_AHEAD; cy += my / ml * P_SMOKE_AHEAD; } }
                if (F_SMOKEMID) { double k = Math.min(dl / 2, 1700); cx = u.ex + (hx - u.ex) / dl * k; cy = u.ey + (hy - u.ey) / dl * k; }
                double cl = hyp(cx, cy); if (cl > R - 50) { cx *= (R - 50) / cl; cy *= (R - 50) / cl; }
                out.add("SMOKE " + u.id + " " + Math.round(cx) + " " + Math.round(cy));
                smokes--; u.usedPower = true; clouds.add(new double[]{cx, cy, turn + SMOKE_LIFE});
            } else if (F_DECOY && decoys > 0 && u.immob == 0 && turn - u.lastDecoy > 8 && Dpre < P_DECOY_D && !treeBlocks(u.x, u.y, near.x, near.y, 0) && !inSmoke(u.ex, u.ey, 0)) {
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
            else {
                int cell = F_GHOSTMAP && !preyGone ? searchCell(g.x, g.y, claimed) : -1;
                if (cell >= 0) { claimed.add(cell); gx = cellX(cell); gy = cellY(cell); }
                else { double a = (g.id - myId * N) * 2 * Math.PI / Math.max(1, N) - turn * 0.2; gx = Math.cos(a) * 4000; gy = Math.sin(a) * 4000; }
            }
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
    /**
     * A predator as a threat. One that is out of sight (age 1 to 3 turns: behind a tree, or inside a cloud, where it is
     * invisible but still walks) is assumed to have kept its last movement; its dash comes back as the turns pass.
     */
    static Th threat(E e, int age) {
        Th t = new Th(); t.e = e; t.immob = Math.max(0, e.immob - age);
        double[] v = age > 0 && F_STALE ? predV(e) : new double[]{0, 0};
        t.x = e.x + v[0] * Math.min(age, 3); t.y = e.y + v[1] * Math.min(age, 3);
        double l = hyp(t.x, t.y); if (l > R - UR) { t.x *= (R - UR) / l; t.y *= (R - UR) / l; }
        int cd = Math.max(0, e.cd - age);
        if (t.immob > 0) { t.reach = 0; t.reach2 = t.immob >= 2 ? 0 : (cd <= 1 ? DASH : MOVE); }
        else { t.reach = (cd == 0 ? DASH : MOVE) + Math.min(age, 4) * 300; t.reach2 = (cd <= 1 ? DASH + MOVE : 2 * MOVE) + Math.min(age, 4) * 300; }
        t.w = Math.max(0.4, 1.0 / (1 + 0.5 * age));
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
            turnStart = System.nanoTime();
            readTurn(in, line);
            String cmd;
            try { cmd = decide(); } catch (RuntimeException ex) { System.err.println("ERR " + ex); cmd = "WAIT"; }
            System.out.println(cmd);
            System.out.flush();
        }
    }
}
