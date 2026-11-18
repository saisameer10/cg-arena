import java.io.*;
import java.util.*;

/**
 * Try Catch Forest (Unleash the Geek 2026): MIMIC of the squad "FullStuck" (player MatthCrouzet, agent 6893977).
 * Rank and sample: second of Gold on 2026-11-18 at 13:28 IST (rating 24.47, all placement games played); 264 games of agent 6893977 studied.
 *
 * This is not our bot. It plays the way that squad plays, rule by rule, as measured from its game logs
 * (kb/mimic.md holds the rule books, the evidence and the fingerprint comparison). Input parsing, enemy tracking and
 * the movement model are copied from versions/v10.java, and so is its hard safety rule: a move never ends where a
 * predator can touch the unit this turn. Everything else is the rule book: every rule is a named switch (F_) or
 * number (P_) below, with the measured value as default and the evidence in the comment.
 * vmimic.java, vmimic2.java and vmimic3.java are ONE engine with three rule books; tools/mimic_teams.py writes
 * vmimic.java and vmimic3.java from vmimic2.java, so change the engine in vmimic2.java only.
 *
 * Shape of a turn, per living unit:
 *   mode ATTACK (a prey in sight within P_ATTACK), else FLEE (a predator in sight within P_THREAT), else HUNT (walk at
 *   the nearest prey we know of), else IDLE (search); the mode fixes the direction, distance tables fix the dash, and
 *   the powers follow fixed triggers. Ghosts walk onto the nearest living prey.
 */
class Player {
    static final double R = 8000, UR = 220, MOVE = 600, DASH = 1200, CATCH = 440;
    static final double NET_RANGE = 2000, NET_TREE = 250, SMOKE_R = 1900, SMOKE_THROW = 2000;
    static final int SMOKE_LIFE = 9;

    // =====================================================================================================
    // RULE BOOK: FullStuck, agent 6893977, 264 games. "n =" is the number of cases.
    // Distances in the evidence are to the nearest living enemy, seen by the team or not (the logs do not say what
    // a team saw), so a share of 60-80 % usually means "always, when it sees it".
    // =====================================================================================================
    static final String TEAM = "FullStuck";
    // ---- modes
    static final double P_THREAT = 1800;          // flee from a predator in sight nearer than this. Turn 7+: moving away (within 60 deg) 68-82 % under 800, 60-76 % at 800-1200, 54-63 % at 1200-1600, 39-50 % at 1600-2000, 34-36 % at 2000-2600 (n = 14,000)
    static final double P_THREAT_T1 = 2000;       // turn 1: decoy 54 / 84 / 54 % with a predator start at 800-1200 / 1600 / 2000, 0-1 % beyond 2000 (n = 500)
    static final double P_FLEE_MOVE_T1 = 1500;    // turn 1: a threatened unit moves away only if the predator is nearer than this, else it heads at prey: away 73 % under 1500, 37 % at 1500-2000 where 60 % head at the nearest prey (n = 341)
    static final double P_FLEE_PREY_W = 0.35;     // a fleeing unit leans towards the nearest prey it knows: median angle off "straight away" 54 deg on turn 1 (n = 341), 32 deg later (n = 5,071). The weight is fitted
    static final double P_ATTACK = 1600;          // a prey in sight nearer than this is attacked even with a predator near: heading at the prey 53-66 % with prey under 1600 and a predator under 1200, 27-37 % with prey beyond 2200 (n = 3,500)
    static final int P_PRED_MEMORY = 3;           // turns a predator out of sight keeps counting. ASSUMPTION (cannot be read from logs); v10's value
    static final int P_ATTACK_MEMORY = 0;         // prey out of sight is not attacked (no evidence either way)
    static final int P_PREY_MEMORY = 25;          // turns a prey position is kept as a place to walk to. ASSUMPTION; v10's value
    static final boolean F_SYM_THREAT = false;    // turn 1: react to predators known only through the symmetry. No: decoy 0-1 % with a predator start beyond 2000 (n = 750)
    static final boolean F_SYM_ATTACK = true;     // turn 1: dash at prey known only through the symmetry. Yes: predator far, dash 86 / 96 % with a prey start under 1000 / 1600 (n = 111): trees would hide a part of them
    static final double P_T1_SIGHT = 2000;        // turn 1: enemies within this distance and not behind a tree count as in sight
    static final boolean F_SYM_SEEK = true;       // walk at prey start positions known through the symmetry: 72-80 % of the units with no predator near head at the nearest prey on turn 1 (n = 817)
    static final double P_HUNT_LEAD = 0.0;        // hunters aim at prey position + this x its last move. Median angle off the position 16 deg, off position + move 17 deg (n = 9,897)
    static final double P_WALL_R = 6900;          // fleeing units are pushed off the wall beyond this radius: 57 % of the units beyond 6500 with a predator near run along the wall, 28 % inward (n = 1,562). ASSUMPTION for the number
    static final double P_WALL_W = 1.5;           // ... with this weight per unit of distance. ASSUMPTION
    // ---- dashes (a dash is only possible when the cooldown is 0)
    static final double P_ADASH = 1600;           // ATTACK: dash at a free prey nearer than this. Turn 1: 86 / 96 % under 1000 / 1600, 27 % at 1600-2200, 0 % beyond (n = 668); later 42-54 % at 1000-1600 when ready (n = 2,100)
    static final double P_ADASH_MIN = 0;          // ... and farther than this (28-60 % under 600, n = 84: no lower limit)
    static final double P_ADASH_HELD = 1700;      // ATTACK: dash at a held prey between walking reach (1040) and this: 38 % at 1300-1600 (n = 85); 75 % of the units under 1040 of a prey just netted dash (n = 56)
    static final double P_FDASH = 1200;           // FLEE: dash when the predator in sight is nearer than this and can dash: 70 / 49 / 9 % under 800 / 1200 / 1600 (n = 2,508)
    static final double P_FDASH_T1 = 1500;        // FLEE on turn 1: 64 % with a predator start under 1500, 34 % at 1500-2000, 18 % at 2000-2500 (n = 490)
    static final double P_T1_DASH_SHARE = 1.0;    // no share rule: the turn-1 dash follows the distances (96 % at prey under 1600)
    static final boolean F_FDASH_NEEDS_PRED_DASH = true;// FLEE dash only from a predator whose dash is ready: 70 / 49 % against 17 / 9 % from one without (n = 6,200)
    static final double P_TDASH = 1800;           // HUNT: the first dash of a unit is spent to travel to a prey in sight nearer than this: 24 % with no dash made at 1600-3000, 8-10 % afterwards (n = 7,200); turn 1: 27 % at 1600-2200, 0 % beyond
    static final int P_TDASH_MAX_MADE = 0;        // ... while the unit has made at most this many dashes
    static final boolean F_TDASH_UNSEEN = false;  // ... also at a prey that is not in sight. No: 0 % on turn 1 with prey beyond 2200 (n = 475)
    // ---- nets
    static final double P_NET_D_NODASH = 1300;    // net at a free prey in sight whose dash is on cooldown when OUR move ends nearer than this to it: thrown on 14 / 20 / 9 / 5 / 3 % of the unit-turns at 0-600 / 1000 / 1300 / 1600 / 2000 while nets are left (n = 2,446)
    static final double P_NET_D_READY = 1300;     // same for a prey that can dash: 14 / 17 / 10 / 7 / 2 % (n = 3,510); 22 / 38 / 15 % after a dash of ours
    static final double P_NET_MIN_D = 0;          // no lower limit after turn 1 (turn 1: 21 % under 600 against 67 % at 600-1000)
    static final int P_NET_EVERY = 4;             // turns the team waits between two nets at prey. FITTED, not recovered: median net turn 12, 1.19 / 1.08 / 1.34 nets per game in turns 1-5 / 6-20 / 21-100
    static final double P_NET_D_T1 = 1100;        // same on turn 1: 67 / 60 / 40 / 9 % at 600-1000 / 1300 / 1600 / 2000 (n = 129)
    static final boolean F_NET_ONE_PER_PREY = true;// only one unit nets a given prey on a turn. ASSUMPTION (1.19 nets in turns 1-5)
    static final boolean F_NET_HELD_PREY = false; // net at a prey that is already held. No: 1-4 % (n = 848)
    static final double P_NET_LEAD = 0.4;         // aim at prey position + this x its last move. Median 0.39, least squares 0.35 over 604 nets
    static final boolean F_NET_FULL_RANGE = true; // the aim point is 2000 from the thrower along the line: 86-88 % of 656 nets at prey
    static final double P_NET_OVER = 0;           // not used with full range
    static final double P_NETP_HELD_NODASH = 800; // a HELD unit nets a predator without dash nearer than this: 10 % under 800 (n = 105)
    static final double P_NETP_HELD_READY = 1200; // a held unit nets a predator that can dash nearer than this: 19 % at 800-1200, 6 % under 800 (n = 112)
    static final double P_NETP_NODASH = 0;        // a free unit does not net predators: 0-1 % (n = 2,274)
    static final double P_NETP_READY = 0;         // a free unit does not net predators: 0-1 % (n = 1,855). 6.8 % of all nets go at predators
    static final int P_NETP_EVERY = 0;            // no pause
    // ---- decoys
    static final double P_DECOY_D = 2000;         // a FLEEING unit sends a decoy when the predator in sight is nearer than this: 21-36 % of the unit-turns under 2000 while decoys are left, 0-2 % beyond; turn 1: 54 / 84 / 54 % at 800-1200 / 1600 / 2000 (n = 2,600)
    static final int P_DECOY_GAP = 0;             // no gap of its own: see F_DECOY_ONE_ALIVE
    static final boolean F_DECOY_IN_ATTACK = true;// also from a unit that attacks prey with the predator near: prey and predator both under 2000 on turn 1: decoy 30 %, net 39 % (n = 141)
    static final boolean F_DECOY_ONE_ALIVE = true;// wait until the last decoy of the unit is gone (10 turns): 4-7 % with a decoy of its own alive against 21-36 % without (n = 4,600)
    static final double P_DECOY_ANGLE = 60;       // the decoy target is this many degrees off the line "straight away from the predator" ...
    static final double P_DECOY_LEN = 3000;       // ... and this far from the unit: along 1500, across 2598 for 1,115 of 1,115 decoys (angle to the predator 120)
    static final boolean F_DECOY_REL_MOVE = false;// the angle is measured from the escape line
    static final boolean F_DECOY_NEEDS_NO_SMOKE = false;// decoys from the start: 1.52 per game in turns 1-5
    static final boolean F_DECOY_OPPOSITE_SIDE = true;// of the two sides the decoy takes the one the unit does not take: 93 % of 966
    static final double P_DECOY_HELD_D = 2300;    // a held unit sends one when a predator is nearer than this: 18-20 % per held turn at 1000-2300 while decoys are left (n = 324), 1 % under 1000
    // ---- smoke
    static final double P_SMOKE_D = 1300;         // a fleeing unit that DASHES drops smoke when the predator in sight is nearer than this: 85 / 76 / 49 / 22 % under 800 / 1200 / 1600 / 2000 while smoke is left (n = 866), 2-3 % when it walks
    static final double P_SMOKE_D_T1 = 1300;      // same on turn 1: 28 % with a predator start under 1500, 3 % at 1500-2000 (n = 341)
    static final boolean F_SMOKE_IN_ATTACK = false;// only when fleeing (ASSUMPTION: 0-1 % with the predator beyond 2000)
    static final boolean F_SMOKE_ONLY_ON_COOLDOWN = false;// not this team: 17-26 % with the dash ready under 1200, 7-9 % on cooldown
    static final boolean F_SMOKE_WITH_FLEE_DASH = true;// smoke goes with the dash: 100 / 92 / 78 % of the smokes of turn 1 / 2-5 / 6+ on a turn with a dash (n = 859)
    static final double P_SMOKE_FRAC = 0;         // where the cloud goes: on the unit itself, where its dash ends: 859 of 859 within 1 of it
    static final double P_SMOKE_MAX = 1800;       // not used
    static final double P_SMOKE_HELD_D = 0;       // held units drop no smoke: 0-1 % (n = 1,456)
    static final boolean F_SMOKE_AFTER_DECOY = false;// smoke first when both apply: decoy 11 % with the predator under 800 on turn 1 against 54-84 % farther out, smoke 28 %
    // ---- ghosts
    static final int P_GHOST = 1;                 // 1 = walk onto the nearest living prey: 63 % of ghost orders end within 1000 of one, 6 % of a predator (n = 32,071)
    static final boolean F_GHOST_DASH = false;    // ghosts never dash: 0 in 264 games
    static final double P_GHOST_STOP = 300;       // a ghost nearer than this to its prey gives no order: 39 % of ghost turns without order while 63 % of the orders end within 1000 of a prey
    static final boolean F_GHOST_EXPLORE = false; // a ghost with no prey to go to stands: 39 % of ghost turns have no order (n = 52,700)
    // =====================================================================================================

    static int myId, prey, pred, N = -1, turn = 0, myScore = 0, nets, smokes, decoys;
    static int T; static double[] tx, ty, tr;

    static final class E {
        int id, owner; double x, y, vx, vy; boolean ghost; int cd, fat = 1, immob;
        int seen = -99; boolean vis, dead, lost, dup, sym;
        int lastDecoy = -99; double ex, ey; boolean usedPower, netTargeted, dashes; String cmd, tag; int mode; E thr, tgt;
        E copy() { E e = new E(); e.id = id; e.owner = owner; e.x = x; e.y = y; e.vx = vx; e.vy = vy; e.ghost = ghost; e.cd = cd; e.fat = fat; e.immob = immob; e.seen = seen; e.vis = vis; return e; }
    }
    static final class Th { double x, y, reach, w; int immob; E e; }

    static Map<Integer, E> own = new HashMap<>();          // my units, kept between turns
    static Map<Integer, E> tracks = new HashMap<>();       // enemy units by id, last known state
    static List<E> mine = new ArrayList<>(), seenPrey = new ArrayList<>(), seenPred = new ArrayList<>();
    static List<double[]> clouds = new ArrayList<>();      // x, y, last turn of life, 1 if ours
    static List<Th> threats = new ArrayList<>();
    static final int IDLE = 0, HUNT = 1, FLEE = 2, ATTACK = 3;

    // ---------------------------------------------------------------- geometry (copied from v10)
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
    /** End point of a MOVE/DASH towards (gx, gy), as the referee does it (v10: fitted on 638 recorded moves). */
    static double[] simMove(double x, double y, double gx, double gy, double speed, boolean ghost) {
        double d = hyp(gx - x, gy - y);
        if (d < 1e-6) return new double[]{x, y};
        double len = Math.min(d, speed), vx = (gx - x) / d * len, vy = (gy - y) / d * len;
        final int slices = hyp(x, y) + len >= R - UR ? 4 : 1;
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
                if (stuck) { x = sx; y = sy; break; }
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
        if (hyp(gx - tx[best], gy - ty[best]) < RR) return new double[]{gx, gy};
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
        for (E u : mine) { if (hyp(u.x - x, u.y - y) < 1800 && !inSmoke(u.x, u.y, 0) && !treeBlocks(u.x, u.y, x, y, 0) && !smokeBlocks(u.x, u.y, x, y)) return true; }
        return false;
    }

    // ---------------------------------------------------------------- search map (copied from v10; used by IDLE units)
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
    static int searchCell(double ux, double uy, List<Integer> claimed) {
        int best = -1; double bs = -1e18;
        for (int c = 0; c < GC * GC; c++) {
            if (!cellOk[c]) continue;
            int age = Math.min(turn - cellSeen[c], 40); if (age < 3) continue;
            double x = cellX(c), y = cellY(c);
            double sc = age * 120 - hyp(x - ux, y - uy);
            for (int o : claimed) sc -= Math.max(0, 3000 - hyp(x - cellX(o), y - cellY(o)));
            if (sc > bs) { bs = sc; best = c; }
        }
        return best;
    }

    // ---------------------------------------------------------------- input (copied from v10)
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
                if (!known) clouds.add(new double[]{x, y, turn + rem - 1, owner == myId ? 1 : 0});
                continue;
            }
            if (!type.equals("UNIT")) continue;                 // own decoys and anything unknown
            if (owner == myId) {
                E u = own.get(id); if (u == null) { u = new E(); u.id = id; u.owner = owner; own.put(id, u); }
                u.x = x; u.y = y; u.vx = dx; u.vy = dy; u.ghost = ghost == 1; u.cd = Math.max(0, rem); u.fat = Math.max(1, fat); u.immob = Math.max(0, imm);
                u.seen = turn; u.usedPower = false; u.cmd = null; u.tag = ""; u.ex = x; u.ey = y; u.dashes = false; u.mode = IDLE; u.thr = null; u.tgt = null;
                mine.add(u);
            } else {
                E s = new E(); s.id = id; s.owner = owner; s.x = x; s.y = y; s.vx = dx; s.vy = dy; s.cd = Math.max(0, rem); s.fat = Math.max(1, fat); s.immob = Math.max(0, imm); s.seen = turn; s.vis = true;
                if (!seenIds.add(id)) { s.dup = true; for (E o : seenPrey) if (o.id == id) o.dup = true; for (E o : seenPred) if (o.id == id) o.dup = true; }
                (owner == prey ? seenPrey : seenPred).add(s);
                tracks.put(id, s.copy());
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
                    E t = new E(); t.id = id; t.owner = p; t.x = u.x * c - u.y * s; t.y = u.x * s + u.y * c; t.seen = turn; t.cd = 0; t.sym = true;
                    tracks.put(id, t);
                    boolean sight = false;
                    for (E m : mine) if (hyp(m.x - t.x, m.y - t.y) <= P_T1_SIGHT && !treeBlocks(m.x, m.y, t.x, t.y, 0)) sight = true;
                    if (sight) { t.sym = false; t.vis = true; (p == prey ? seenPrey : seenPred).add(t.copy()); }
                }
            }
        }
        for (int k = myScore; k < score; k++) {                 // a catch of ours: the prey we lost sight of next to a unit is gone
            E best = null; double bd = 1e18;
            for (E t : tracks.values()) {
                if (t.owner != prey || t.dead || t.vis || t.seen < turn - 4) continue;
                for (E u : mine) { double d = hyp(u.x - t.x, u.y - t.y); if (d < bd) { bd = d; best = t; } }
            }
            if (best != null) best.dead = true;
        }
        myScore = score;
        for (E t : tracks.values()) {                           // remembered positions that we can see are empty
            if (t.vis || t.dead || t.lost || t.seen == turn) continue;
            if (canSeePoint(t.x, t.y)) t.lost = true;
        }
    }

    /** A predator as a threat for the safety rule (v10): out of sight for 1 to 3 turns it keeps its last movement. */
    static Th threat(E e, int age) {
        Th t = new Th(); t.e = e; t.immob = Math.max(0, e.immob - age);
        double[] v = age > 0 ? predV(e) : new double[]{0, 0};
        t.x = e.x + v[0] * age; t.y = e.y + v[1] * age;
        double l = hyp(t.x, t.y); if (l > R - UR) { t.x *= (R - UR) / l; t.y *= (R - UR) / l; }
        int cd = Math.max(0, e.cd - age);
        t.reach = t.immob > 0 ? 0 : (cd == 0 ? DASH : MOVE) + age * 300;
        t.w = 1.0 / (1 + 0.5 * age);
        return t;
    }
    /** Hard safety rule of v10: can a predator touch the unit on its way from (sx, sy) to (px, py) this turn? */
    static boolean unsafe(double sx, double sy, double px, double py) {
        for (Th t : threats) {
            if (t.w < 0.5) continue;
            double m = 1e18;
            for (int i = 1; i <= 10; i++) { double f = i / 10.0; double d = hyp(sx + (px - sx) * f - t.x, sy + (py - sy) * f - t.y) - t.reach * f; if (d < m) m = d; }
            if (m < CATCH + (t.reach > 0 ? 45 : 15)) return true;
        }
        return false;
    }
    /** How far the nearest predator stays from the end point after its own best move (larger is safer). */
    static double clearance(double px, double py) {
        double m = 1e18;
        for (Th t : threats) m = Math.min(m, hyp(px - t.x, py - t.y) - t.reach);
        return m;
    }

    // ---------------------------------------------------------------- one turn
    static String decide() {
        List<E> live = new ArrayList<>(), ghosts = new ArrayList<>();
        for (E u : mine) (u.ghost ? ghosts : live).add(u);
        boolean preyGone = myScore >= N;
        updateGrid();
        // predators that count for safety: in sight, or seen in the last three turns
        threats.clear();
        for (E e : seenPred) threats.add(threat(e, 0));
        for (E t : tracks.values()) {
            if (t.owner != pred || t.vis || t.dead || t.lost) continue;
            int age = turn - t.seen; if (age > 3) continue;
            threats.add(threat(t, age));
        }
        // predators that make a unit flee: in sight (or remembered for P_PRED_MEMORY turns); the symmetry only if the team uses it
        List<E> fleeFrom = new ArrayList<>();
        for (E e : seenPred) if (e.immob <= 1) fleeFrom.add(e);
        for (E t : tracks.values()) {
            if (t.owner != pred || t.vis || t.dead || t.lost || t.immob > 1) continue;
            int age = turn - t.seen;
            if (t.sym ? (F_SYM_THREAT && age <= P_PRED_MEMORY) : (age >= 1 && age <= P_PRED_MEMORY)) fleeFrom.add(t);
        }
        // prey to attack: in sight (or known by symmetry on turn 1 if the team uses it); prey to walk to: also remembered
        List<E> attackable = new ArrayList<>(seenPrey), known = new ArrayList<>();
        if (!preyGone) for (E t : tracks.values()) {
            if (t.owner != prey || t.vis || t.dead || t.lost) continue;
            int age = turn - t.seen;
            if (t.sym && age == 0 && F_SYM_ATTACK) attackable.add(t);
            else if (!t.sym && age >= 1 && age <= P_ATTACK_MEMORY) attackable.add(t);
            if (age <= P_PREY_MEMORY && (!t.sym || F_SYM_SEEK)) known.add(t);
        }
        List<Integer> claimed = new ArrayList<>();
        List<String> out = new ArrayList<>();

        for (E u : live) {
            // ---- nearest predator that counts, nearest prey in sight, nearest prey known
            E thr = null; double dT = 1e18; boolean thrSeen = false;
            for (E e : fleeFrom) { double d = hyp(e.x - u.x, e.y - u.y); if (d < dT) { dT = d; thr = e; } }
            if (thr != null) thrSeen = thr.seen == turn;
            E q = null; double dQ = 1e18;
            for (E e : attackable) { double d = hyp(e.x - u.x, e.y - u.y); if (d < dQ) { dQ = d; q = e; } }
            E far = null; double dF = 1e18;
            if (q == null) for (E e : known) { double d = hyp(e.x - u.x, e.y - u.y) + (turn - e.seen) * 100; if (d < dF) { dF = d; far = e; } }
            u.thr = thr != null && dT <= (turn == 1 ? P_THREAT_T1 : P_THREAT) ? thr : null;
            if (u.immob > 0) { u.tag = "HELD"; u.mode = FLEE; u.tgt = q; continue; }
            int mode = q != null && dQ <= P_ATTACK ? ATTACK : u.thr != null ? FLEE : (q != null || far != null) ? HUNT : IDLE;
            if (q == null) q = far;
            double bestS = -1e18, bx = u.x, by = u.y; String bestCmd = null; boolean bestDash = false, found = false;
            double fbS = -1e18, fbx = u.x, fby = u.y; String fbCmd = null; boolean fbDash = false;     // least bad when nothing is safe
            for (int attempt = 0; attempt < 2 && !found; attempt++) {
            if (attempt == 1) { if (mode != ATTACK || u.thr == null) break; mode = FLEE; }          // the attack is not safe and a predator is near: flee instead
            u.mode = mode; u.tgt = mode == ATTACK || mode == HUNT ? q : null;
            // ---- dash rule
            boolean wantDash = false;
            if (u.cd == 0) {
                if (mode == ATTACK) wantDash = q.immob > 0 ? (dQ - CATCH > MOVE - 20 && dQ <= P_ADASH_HELD) : (dQ <= P_ADASH && dQ >= P_ADASH_MIN);
                else if (mode == FLEE) wantDash = thrSeen && dT <= (turn == 1 ? P_FDASH_T1 : P_FDASH) && (!F_FDASH_NEEDS_PRED_DASH || thr.cd == 0);
                else if (mode == HUNT) wantDash = P_TDASH > 0 && u.fat - 1 <= P_TDASH_MAX_MADE && (q.vis || (F_SYM_ATTACK && q.seen == turn) || F_TDASH_UNSEEN) && hyp(q.x - u.x, q.y - u.y) <= P_TDASH && hyp(q.x - u.x, q.y - u.y) > P_ATTACK;
            }
            if (turn == 1 && wantDash && share(u) >= P_T1_DASH_SHARE) wantDash = false;
            // a threatened unit that is told to keep heading at prey (turn 1, predator not close)
            boolean fleeMove = mode == FLEE && !(turn == 1 && dT > P_FLEE_MOVE_T1 && q != null);
            // ---- goal of the move
            double gx = u.x, gy = u.y; boolean hasGoal = false;
            if (mode == ATTACK || mode == HUNT || (mode == FLEE && !fleeMove)) {
                double[] v = q.vis ? predV(q) : new double[]{0, 0};
                gx = q.x + v[0] * P_HUNT_LEAD; gy = q.y + v[1] * P_HUNT_LEAD; hasGoal = true;
                if (mode == HUNT) { double[] w = steer(u.x, u.y, gx, gy); gx = w[0]; gy = w[1]; }
            } else if (mode == IDLE && !preyGone) {
                int cell = searchCell(u.x, u.y, claimed);
                if (cell >= 0) { claimed.add(cell); double[] w = steer(u.x, u.y, cellX(cell), cellY(cell)); gx = w[0]; gy = w[1]; hasGoal = true; }
            }
            // ---- candidates: 36 directions and the straight line to the goal, walking or dashing; the best safe one
            for (int pass = 0; pass < (attempt == 0 && mode == ATTACK && u.thr != null ? 1 : 2) && !found; pass++) {
                // pass 0: the speed the rule asks for (and standing still); pass 1: the other speed, only because nothing was safe
                for (int sp = 0; sp < 2; sp++) {
                    boolean dash = sp == 1;
                    if (dash && u.cd > 0) continue;
                    if (pass == 0 && dash != wantDash) continue;
                    if (pass == 1 && dash == wantDash) continue;
                    double speed = dash ? DASH : MOVE;
                    for (int k = -2; k < 36; k++) {
                        double dx, dy;
                        if (k == -2) { if (dash || pass == 1) continue; dx = 0; dy = 0; }
                        else if (k == -1) { if (!hasGoal) continue; dx = gx - u.x; dy = gy - u.y; }
                        else { dx = Math.cos(k * Math.PI / 18); dy = Math.sin(k * Math.PI / 18); }
                        double l = hyp(dx, dy);
                        double ax = u.x, ay = u.y;
                        if (k != -2) {
                            if (l < 1) continue;
                            ax = u.x + dx / l * speed; ay = u.y + dy / l * speed;
                            double al = hyp(ax, ay); if (al > R - 1) { ax *= (R - 1) / al; ay *= (R - 1) / al; }
                            ax = Math.round(ax); ay = Math.round(ay);
                        }
                        double[] e = k == -2 ? new double[]{u.x, u.y} : simMove(u.x, u.y, ax, ay, speed, false);
                        double s;
                        if (mode == ATTACK || mode == HUNT || (mode == FLEE && !fleeMove)) {
                            s = -hyp(e[0] - gx, e[1] - gy);
                            if (mode == ATTACK) {                               // a move that touches the prey on the way is taken first
                                double[] v = predV(q); double md = 1e18;
                                for (int i = 1; i <= 10; i++) { double f = i / 10.0; double d = hyp(u.x + (e[0] - u.x) * f - q.x - v[0] * f, u.y + (e[1] - u.y) * f - q.y - v[1] * f); if (d < md) md = d; }
                                if (md < CATCH - 15) s += 50000;
                            }
                        } else if (mode == FLEE) {
                            double d1 = 1e18, d2 = 1e18;
                            for (E p : fleeFrom) { double d = hyp(e[0] - p.x, e[1] - p.y); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
                            s = Math.min(d1, 4000) + 0.4 * Math.min(d2, 4000) - P_WALL_W * Math.max(0, hyp(e[0], e[1]) - P_WALL_R);
                            if (q != null && P_FLEE_PREY_W > 0) s -= P_FLEE_PREY_W * Math.min(4000, hyp(e[0] - q.x, e[1] - q.y));
                        } else {
                            s = hasGoal ? -hyp(e[0] - gx, e[1] - gy) : (k == -2 ? 1 : 0);
                        }
                        String cmd = k == -2 ? null : (dash ? "DASH " : "MOVE ") + u.id + " " + (long) ax + " " + (long) ay;
                        if (unsafe(u.x, u.y, e[0], e[1])) {
                            double c = clearance(e[0], e[1]);
                            if (c > fbS) { fbS = c; fbx = e[0]; fby = e[1]; fbCmd = cmd; fbDash = dash; }
                            continue;
                        }
                        if (s > bestS) { bestS = s; bx = e[0]; by = e[1]; bestCmd = cmd; bestDash = dash; found = true; }
                    }
                }
            }
            }
            if (!found) { bx = fbx; by = fby; bestCmd = fbCmd; bestDash = fbDash; }
            u.cmd = bestCmd; u.ex = bx; u.ey = by; u.dashes = bestDash;
            u.tag = mode == ATTACK ? "ATT" : mode == FLEE ? "FLEE" : mode == HUNT ? "HUNT" : "IDLE";
        }

        // ---- powers: one per unit and turn. Decoys leave before the move (from u.x, u.y), nets and smoke after it (from u.ex, u.ey).
        for (E u : live) {
            // 1. net at prey next to the end of our move
            if (nets > 0 && turn - lastPreyNet >= P_NET_EVERY) {
                E bq = null; double bd = 1e18, bxq = 0, byq = 0;
                for (E qq : seenPrey) {
                    if ((qq.netTargeted && F_NET_ONE_PER_PREY) || (qq.immob > 0 && !F_NET_HELD_PREY)) continue;
                    double[] v = predV(qq); double qx = qq.x + v[0] * P_NET_LEAD, qy = qq.y + v[1] * P_NET_LEAD;
                    double d = hyp(qq.x - u.ex, qq.y - u.ey);
                    if (d > (turn == 1 ? P_NET_D_T1 : qq.cd > 0 ? P_NET_D_NODASH : P_NET_D_READY) || d < P_NET_MIN_D || hyp(qx - u.ex, qy - u.ey) < 30) continue;
                    if (treeBlocks(u.ex, u.ey, qx, qy, NET_TREE + 20) || friendOnLine(u, qx, qy, live)) continue;
                    if (d < bd) { bd = d; bq = qq; bxq = qx; byq = qy; }
                }
                if (bq != null) { out.add(net(u, bxq, byq)); bq.netTargeted = true; lastPreyNet = turn; continue; }
            }
            // 2. net at a predator next to us
            if (nets > 0 && turn - lastPredNet >= P_NETP_EVERY) {
                E be = null; double bd = 1e18;
                for (E e : seenPred) {
                    if (e.immob > 0 || e.netTargeted) continue;
                    double d = hyp(e.x - u.x, e.y - u.y);
                    if (d > (u.immob > 0 ? (e.cd > 0 ? P_NETP_HELD_NODASH : P_NETP_HELD_READY) : (e.cd > 0 ? P_NETP_NODASH : P_NETP_READY)) || hyp(e.x - u.ex, e.y - u.ey) < 30) continue;
                    if (treeBlocks(u.ex, u.ey, e.x, e.y, NET_TREE + 20) || friendOnLine(u, e.x, e.y, live)) continue;
                    if (d < bd) { bd = d; be = e; }
                }
                if (be != null) { out.add(net(u, be.x, be.y)); be.netTargeted = true; lastPredNet = turn; continue; }
            }
            E thr = u.thr; if (thr == null || thr.seen != turn) {
                // a held unit looks a little farther for its decoy
                if (u.immob > 0) { thr = null; double bd = 1e18; for (E e : seenPred) { double d = hyp(e.x - u.x, e.y - u.y); if (d < bd && e.immob == 0) { bd = d; thr = e; } } }
                else thr = null;
            }
            if (thr == null) continue;
            double dT = hyp(thr.x - u.x, thr.y - u.y);
            boolean fleeing = u.mode == FLEE, fleeS = fleeing || F_SMOKE_IN_ATTACK;
            // 3. decoy: off to the side the unit does not take
            boolean decoyNow = decoys > 0 && (fleeing || F_DECOY_IN_ATTACK) && (!F_DECOY_NEEDS_NO_SMOKE || smokes == 0) && dT <= (u.immob > 0 ? P_DECOY_HELD_D : P_DECOY_D) && (!F_DECOY_ONE_ALIVE || turn - u.lastDecoy >= 10) && (u.dashes || u.immob > 0 || turn - u.lastDecoy >= P_DECOY_GAP);
            // 4. smoke
            double smokeD = turn == 1 ? P_SMOKE_D_T1 : P_SMOKE_D;
            boolean smokeNow = smokes > 0 && fleeS && !inOwnSmoke(u.ex, u.ey)
                    && (u.immob > 0 ? dT <= P_SMOKE_HELD_D
                        : F_SMOKE_WITH_FLEE_DASH ? (u.dashes && dT <= smokeD)
                        : (dT <= smokeD && (!F_SMOKE_ONLY_ON_COOLDOWN || (u.cd > 0 && !u.dashes))));
            if (decoyNow && smokeNow && !F_SMOKE_AFTER_DECOY) decoyNow = false;
            if (decoyNow) {
                double ax = u.x - thr.x, ay = u.y - thr.y, al = Math.max(1, hyp(ax, ay)); ax /= al; ay /= al;
                double mx = u.ex - u.x, my = u.ey - u.y, ml = hyp(mx, my);
                double side = ax * my - ay * mx;            // > 0: the unit goes to the left of the escape line
                if (Math.abs(side) < 1) side = -(ax * (-u.y) - ay * (-u.x));   // no move (held): the decoy goes to the side of the centre
                double a = Math.toRadians(P_DECOY_ANGLE) * ((side > 0) == F_DECOY_OPPOSITE_SIDE ? -1 : 1);
                if (F_DECOY_REL_MOVE && ml > 1) {            // angle measured from the unit's own move; of the two sides the one nearer to the centre (ASSUMPTION)
                    ax = mx / ml; ay = my / ml;
                    a = Math.toRadians(P_DECOY_ANGLE) * ((ax * (-u.y) - ay * (-u.x)) > 0 ? 1 : -1);
                }
                double cx = ax * Math.cos(a) - ay * Math.sin(a), cy = ax * Math.sin(a) + ay * Math.cos(a);
                out.add("DECOY " + u.id + " " + Math.round(u.x + cx * P_DECOY_LEN) + " " + Math.round(u.y + cy * P_DECOY_LEN));
                decoys--; u.usedPower = true; u.lastDecoy = turn;
            } else if (smokeNow) {
                double cx = u.ex, cy = u.ey;
                if (P_SMOKE_FRAC > 0) { double dl = Math.max(1, hyp(thr.x - u.ex, thr.y - u.ey)), k = Math.min(P_SMOKE_FRAC, Math.min(P_SMOKE_MAX, SMOKE_THROW) / dl); cx += (thr.x - u.ex) * k; cy += (thr.y - u.ey) * k; }
                out.add("SMOKE " + u.id + " " + Math.round(cx) + " " + Math.round(cy));
                smokes--; u.usedPower = true; clouds.add(new double[]{cx, cy, turn + SMOKE_LIFE, 1});
            }
        }

        // ---- ghosts walk onto the nearest living enemy of the chosen kind and stay on it
        for (E g : ghosts) {
            if (P_GHOST == 0) continue;
            int kind = P_GHOST == 1 ? prey : pred;
            E best = null; double bd = 1e18;
            for (E t : tracks.values()) {
                if (t.owner != kind || t.dead || t.lost || (t.sym && !F_SYM_SEEK) || turn - t.seen > P_PREY_MEMORY) continue;
                double d = hyp(t.x - g.x, t.y - g.y) + (turn - t.seen) * 300; if (d < bd) { bd = d; best = t; }
            }
            double tgx, tgy;
            if (best != null) { tgx = best.x; tgy = best.y; }
            else { int cell = F_GHOST_EXPLORE ? searchCell(g.x, g.y, claimed) : -1; if (cell < 0) continue; claimed.add(cell); tgx = cellX(cell); tgy = cellY(cell); }   // nothing known: look for prey like a living unit
            double d = hyp(tgx - g.x, tgy - g.y);
            if (best != null && d < P_GHOST_STOP) continue;
            if (d < 1) { g.cmd = "MOVE " + g.id + " " + Math.round(tgx) + " " + Math.round(tgy); g.tag = "G"; continue; }
            boolean dash = F_GHOST_DASH && g.cd == 0 && d > 1500;
            double sp = Math.min(d, dash ? DASH : MOVE);
            g.cmd = (dash ? "DASH " : "MOVE ") + g.id + " " + Math.round(g.x + (tgx - g.x) / d * sp) + " " + Math.round(g.y + (tgy - g.y) / d * sp); g.tag = "G";
        }

        List<String> all = new ArrayList<>();
        for (E u : mine) if (u.cmd != null) all.add(u.cmd + (u.tag.isEmpty() ? "" : " " + u.tag));
        all.addAll(out);
        return all.isEmpty() ? "WAIT" : String.join(";", all);
    }

    static int lastPreyNet = -99, lastPredNet = -99;
    /** A fixed number in [0, 1) per unit and game (from its position on turn 1): which units fall under a "share" rule. */
    static double share(E u) { double h = Math.sin(u.x * 12.9898 + u.y * 78.233 + u.id * 37.719) * 43758.5453; return h - Math.floor(h); }
    static boolean inOwnSmoke(double x, double y) {
        for (double[] c : clouds) if (c[3] > 0 && c[2] < turn + SMOKE_LIFE && hyp(x - c[0], y - c[1]) < SMOKE_R - 100) return true;
        return false;
    }
    static boolean friendOnLine(E u, double qx, double qy, List<E> live) {
        for (E f : live) if (f != u && segDist(f.ex, f.ey, u.ex, u.ey, qx, qy) < 500 && hyp(f.ex - u.ex, f.ey - u.ey) < hyp(qx - u.ex, qy - u.ey)) return true;
        return false;
    }
    static String net(E u, double qx, double qy) {
        double d = hyp(qx - u.ex, qy - u.ey), len = F_NET_FULL_RANGE ? NET_RANGE : Math.min(d + P_NET_OVER, NET_RANGE);
        double ax = u.ex + (qx - u.ex) / d * len, ay = u.ey + (qy - u.ey) / d * len;
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
