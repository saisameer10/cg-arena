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
 *
 * v15 "better ability usage" (v10 + four changes, each behind a switch):
 *  - F_BLIND: when smoke takes our sight (we are in a cloud, or a predator near us just went into or behind one) the unit
 *    plans from memory. Unseen predators are modelled walking to the place where they last saw us and then along our trail;
 *    running away from those positions comes first (4-turn lookahead over 24 bearings, goal weight 2).
 *    A blind unit with no predator near keeps hunting the prey's last known position, extrapolated with its last movement.
 *  - F_SMOKE_PLACE: the cloud covers us and the predator at once: on us when the predator is close, between us and it
 *    when it is far, so both are blind on the same turn and we leave the cloud first (we are on its far edge).
 *  - F_HELD_FIRST: a netted unit answers on its first held turn, before any net at prey: net back a predator it can hit,
 *    else smoke (also with no predator in sight: the thrower is on its way), else an unsure net, else a decoy.
 *  - F_MULTI: two or more predators on our tail: one cloud over the group instead of a net per predator.
 *
 * v16 "early aggression" (v15 + three changes, each behind a switch):
 *  - F_EARLY: until the first catch of the game (ours, one of our units caught, or a predator unit seen vanishing next
 *    to the third team) and at most until turn 30, hunters press harder: stronger pull to the prey, softer keep-away from
 *    predators, up to three hunters per prey, cheaper approach dashes, wider nets when a hunter can follow up.
 *    The hard safety rules (never end a move inside a predator's reach, two-turn margin) are unchanged.
 *  - F_HELDPREY: prey we netted that went out of sight (smoke) is still where the net holds it: the hunter keeps going,
 *    and walking onto its last position scores as a sure catch while the hold lasts.
 *  - fixes found in review: units that may have walked into a cloud stay known (no "lost" on the next turn), hunters
 *    extend the track of prey that went into smoke, a predator and its decoy count as one, the guessed third-team catch
 *    needs a fully visible spot and is undone when the unit shows up again.
 *
 * v17 "smoke changes + early game aggression" = v16 without its two ghost changes (ghosts behave as in v10), and the
 * early aggression scaled by team size (setAggression):
 *    units  early phase  prey pull  keep-away  hunters/prey  approach dash      net follow-up
 *    3      to turn 40   x2.0       x0.6       3             3rd dash, >2500    hunter within 1800
 *    4      to turn 30   x1.6       x0.6       3             3rd dash, >2500    hunter within 1500   (= v16)
 *    5-6    to turn 20   x1.3       x0.8       2             as v10             hunter within 1200
 */
/*
 * v18_final = v18 with F_BL_SHORT3 off (user decision of 18 Nov night). Everything else as v18.
 * 19 Nov morning, net economy (all three off = the v18 of 02:27, versions/v18.java):
 *  - F_NETSAVE: a free unit escapes its hunter with smoke or a decoy and keeps the net for attack; it nets the hunter only
 *    with neither left. A netted unit still nets back first (counter), and a hunter walking at a netted team mate is
 *    still netted (rescue);
 *  - F_DECOY_ESCAPE: against a hunter inside 1800 a new decoy after 5 turns instead of 8;
 *  - F_NET_LATE: from turn 40, prey on dash cooldown within 1800 is the first net target (secure the late kills).
 *
 * v18 "smart abilities" = v17 with the user's decisions of 2026-11-18 evening (after the v17 ablation report):
 *  - early aggression off (F_EARLY = false; its "last net with a follow-up" part was dead code and is removed);
 *  - F_STANCE: a unit that lost sight of a predator (smoke) runs from it at 3000 when we are ahead, 2600 level, 2000 behind;
 *    a predator without dash or held counts less (its reach), so we keep a safe distance and hunt again sooner;
 *  - F_BL_SHORT3: in 3-unit games a unit blind in its own cloud runs only from a predator within 1600;
 *  - F_FIRSTKILL: 3-4 unit games before our first catch: run later while our prey is in sight within 2000, and the last
 *    net may go at prey inside 1600;
 *  - F_COMMIT (with v16's held-prey rules): netted prey we can reach before the net ends, in sight or hidden in smoke, is
 *    chased; predators we only remember weigh 30 % in the soft terms of that hunter (the no-touch rule stays);
 *  - F_HELD_ALWAYS: a netted unit always answers (net back, else smoke, else unsure net, else decoy) unless only prey is near;
 *  - F_NETCLOSE: attack nets at dash-ready prey only within 2000, unsure nets only within 1800;
 *  - P_SMOKE_MODE: where a free unit puts its cloud (0 v10 ahead of the move, 1 v17 on us / half way, 2 on the predator);
 *    netted units keep the v17 placement.
 * Kept from v17: blind flee and blind hunt from last known positions, cloud memory, netted unit answers at once, one cloud
 * against several predators, netted prey in smoke is still where the net holds it.
 */
class Player {
    static final double R = 8000, UR = 220, MOVE = 600, DASH = 1200, CATCH = 440;
    static final double NET_RANGE = 2000, NET_TREE = 250, SMOKE_R = 1900, SMOKE_THROW = 2000, VISION = 2000;
    static final int SMOKE_LIFE = 9;

    static int myId, prey, pred, N = -1, turn = 0, myScore = 0, nets, smokes, decoys;
    static int T; static double[] tx, ty, tr;

    static final class E {
        int id, owner; double x, y, vx, vy; boolean ghost; int cd, fat = 1, immob; E tgt;
        int seen = -99; boolean vis, dead, lost, dup;
        int lastDecoy = -99; double ex, ey; boolean usedPower, netTargeted, caughtNow; String cmd, tag;
        double ox, oy, ovx, ovy; int oturn = -99;              // own units: last position outside any cloud (where enemies last saw us)
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
    static final boolean F_BLIND = true;       // v15: inside a cloud, flee the modelled predators / hunt the last known prey
    static final boolean F_SMOKE_PLACE = true; // v15: cloud on us (predator close) or between us and it (far)
    static final boolean F_HELD_FIRST = true;  // v15: a netted unit uses a power on its first held turn
    static final boolean F_MULTI = true;       // v15: two or more predators on our tail: smoke, not nets
    static boolean planFlee, planHunt;                   // v15, set per unit: blind and running / blind and hunting
    static final boolean F_EARLY = false;      // v16 early aggression: OFF in v18 (neutral in 1,200 paired local games; user decision)
    // ---- v18 "smart abilities" (each a switch; see the header)
    static final boolean F_STANCE = true;      // the score decides how soon a unit that lost sight runs or hunts
    static final boolean F_BL_SHORT3 = false;  // 3-unit short blind-run trigger: OFF in v18_final (3-unit games 0.059 +- 0.036 better without it locally)
    static final boolean F_FIRSTKILL = true;   // 3-4 unit games before our first catch: keep closing on visible prey
    static final boolean F_GANG = true;        // gang: all units that can reach netted prey in time go for it
    static final boolean F_NETMATE = true;     // gang: nets at prey prefer a team mate able to finish
    static final boolean F_FLANK = true;       // gang: the second hunter aims beyond the prey
    static final boolean F_COMMIT = true;      // a hunter that can reach netted prey in time ignores predators it only remembers (soft terms)
    static final boolean F_HELD_ALWAYS = true; // a netted unit always uses a counter power (no "the hold ends soon" exception)
    // attack nets: no dash-ready prey beyond 2000, no unsure net beyond 1800. OFF: 0.022 +- 0.009 worse in 1,200 paired local
    // games (fewer nets = fewer catches), as every net restriction tried on real Gold battles was (kb/log.md)
    static final boolean F_NETCLOSE = false;
    // ---- net economy (user decision of 19 Nov morning): escape with smoke and decoys, keep nets for attack
    static final boolean F_NETSAVE = true;       // a free unit nets its hunter only when it has no smoke and no decoy to use
    static final boolean F_DECOY_ESCAPE = true;  // decoy every 5 turns instead of 8 against a hunter inside 1800
    static final boolean F_NET_LATE = true;      // from turn 40: prey on dash cooldown within 1800 is netted first
    static final int P_SMOKE_MODE = 0;         // free unit's cloud: 0 = v10 (900 ahead of our move), 1 = v17 (on us / half way), 2 = on the predator
    static int stanceNow;                                // +1 ahead, 0 level, -1 behind (set once per turn)
    static boolean commitNow;                            // set per unit: it can reach its netted prey before the net ends
    static final boolean F_HELDPREY = true;    // v16: netted prey hidden in smoke is still there
    // parts of F_BLIND, each on its own (all true = F_BLIND as in v17)
    static final boolean F_BL_IN = true;       // blind in a cloud: run from the predators' modelled positions
    static final boolean F_BL_OUT = true;      // a near predator vanished into smoke: run from its modelled position
    static final boolean F_BL_HUNT = true;     // blind hunting on the prey's extrapolated track
    static final boolean F_CLOUDMEM = true;    // units that may have walked into a cloud are not marked lost
    // v17: early aggression by team size (setAggression). The first catcher wins 61 % with 3 units per team, 55 % with 4,
    // 49 % with 5 or 6 (first catch: median turn 7, 4, 3): small games get the hardest push and the longest early phase.
    static int EARLY_MAX_TURN = 30;            // early aggression ends here even if no catch was noticed
    static double AG_PULL = 1.6, AG_PROX = 0.6, AG_FOLLOW = 1500, AG_NTF = 2500;
    static int AG_CAP = 3, AG_FAT = 3;
    static void setAggression() {
        if (N <= 3) { EARLY_MAX_TURN = 40; AG_PULL = 2.0; AG_PROX = 0.6; AG_CAP = 3; AG_FAT = 3; AG_NTF = 2500; AG_FOLLOW = 1800; }
        else if (N == 4) { EARLY_MAX_TURN = 30; AG_PULL = 1.6; AG_PROX = 0.6; AG_CAP = 3; AG_FAT = 3; AG_NTF = 2500; AG_FOLLOW = 1500; }
        else { EARLY_MAX_TURN = 20; AG_PULL = 1.3; AG_PROX = 0.8; AG_CAP = 2; AG_FAT = 2; AG_NTF = 3000; AG_FOLLOW = 1200; }
    }
    static boolean firstBlood;                           // v16: some team has made a catch (sticky)
    static boolean aggro;                                // v16, set per unit: early game and the unit has a prey to hunt
    static List<E> heldPrey = new ArrayList<>();         // v16: netted prey out of sight whose hold has not run out
    static int preyTeamCatches;                          // v16: guessed catches of the third team (predator units seen vanishing next to it); ends the early phase
    static Set<Integer> caughtGuess = new HashSet<>();   // v16: predator ids counted in preyTeamCatches
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
            double sc = age * 120 - hyp(x - ux, y - uy);
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
                if (caughtGuess.remove(id)) preyTeamCatches--;      // v16: seen again, so it was not caught (ghosts are invisible)
                E t = tracks.get(id);
                if (t == null || !t.dead || true) { E c = s.copy(); tracks.put(id, c); }
            }
        }
        mine.sort((a, b) -> a.id - b.id);
        if (N < 0) {                                            // first turn: the other teams are rotations of mine
            N = mine.size();
            setAggression();
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
            // v16 fix: a unit that could have walked into a cloud since we saw it is in there, not gone. Its last position is
            // outside the cloud and in sight, so v10 marked it lost on the next turn and dropped it (prey from the hunt,
            // predators from the threats).
            int age = turn - t.seen;
            if (F_BLIND && F_CLOUDMEM && age <= 6 && inSmoke(t.x, t.y, -(MOVE * age + 200))) continue;
            if (canSeePoint(t.x, t.y)) {
                t.lost = true;
                // v16: a predator unit in sight last turn that is gone from a spot we see, all around it in sight too (no tree
                // or cloud to hide behind), next to a unit of the third team (its own predator), was most likely caught:
                // ghosts are invisible. Our only estimate of the third team's score; it also ends the early phase.
                if (t.owner == pred && age == 1 && hiddenFrac(t.x, t.y) < 0.01)
                    for (E q : tracks.values()) if (q.owner == prey && !q.dead && turn - q.seen <= 1 && hyp(q.x - t.x, q.y - t.y) < 1300) {
                        if (caughtGuess.add(t.id)) preyTeamCatches++;
                        break;
                    }
            }
        }
        if (score > 0) firstBlood = true;
        for (E u : mine) if (u.ghost) firstBlood = true;           // one of ours was caught
    }
    // a guessed catch between the other two teams is undone when the unit shows up again, so it does not stick in firstBlood
    static boolean early() { return F_EARLY && !firstBlood && preyTeamCatches == 0 && turn <= EARLY_MAX_TURN; }
    /**
     * v18: the score situation. Our predator's score is exact (the number of our own ghosts); the third team's is the
     * estimate preyTeamCatches (catches it makes out of our sight are missed, so "ahead" can be optimistic).
     */
    static int stance() {
        int predScore = 0; for (E u : mine) if (u.ghost) predScore++;
        int lead = myScore - Math.max(predScore, preyTeamCatches);
        return lead > 0 ? 1 : lead < 0 ? -1 : 0;
    }
    /**
     * v18: how near (distance minus its reach) a predator we cannot see must be before a unit that lost sight runs
     * instead of hunting. A predator without its dash has a reach of 600 instead of 1200, so it must be 600 nearer;
     * a held one (more than one turn of hold left) never counts.
     *  - base 2600 (v17); ahead in points 3000 (defend the lead), behind 2000 (hunt sooner);
     *  - 3-unit games, blind in our own cloud: 1600 (one catch decides most of these games);
     *  - 3-4 unit games before our first catch, or behind/level, while our prey is in sight within 2000, or has no dash
     *    and is within 1500: 2000 / 1600 (keep closing in).
     */
    static double fleeTrigger(E u, E target, boolean blind) {
        double trig = 2600;
        if (F_STANCE) trig = stanceNow > 0 ? 3000 : stanceNow < 0 ? 2000 : 2600;
        if (F_BL_SHORT3 && blind && N <= 3) trig = Math.min(trig, 1600);
        if (target != null && target.vis) {
            double d = hyp(target.x - u.x, target.y - u.y);
            if (F_FIRSTKILL && N <= 4 && myScore == 0 && d < 2000) trig = Math.min(trig, 2000);
            if (F_STANCE && stanceNow <= 0 && target.cd > 0 && d < 1500) trig = Math.min(trig, 1600);
        }
        return trig;
    }
    /** Turns of net hold left for an enemy now (its hold counted down since we last saw it). */
    static int holdLeft(E q) { return Math.max(0, q.immob - (turn - q.seen)); }

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
                    else if (d0 + MOVE - mySp < CATCH - 25) reward = Math.max(reward, 25000);     // it must dash to survive
                }
            }
        }
        // v16: netted prey hidden in a cloud cannot have moved: passing over its last position is a catch
        if (!u.ghost && F_HELDPREY) for (E q : heldPrey)
            if (segDist(q.x, q.y, sx, sy, px, py) < CATCH - 40) reward = Math.max(reward, 300000);
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
            // v18: a hunter on its way to netted prey it can reach in time gives the soft terms of predators it only remembers
            // 30 % weight (7 of 18 wasted net hits: the hunter turned away from a predator out of sight). Hard rule unchanged.
            double soft = commitNow && t.e.seen != turn ? 0.3 : 1.0;
            if (t.immob <= 1) {
                double myNext = (!dash && u.cd <= 1) ? DASH : MOVE;
                double m2 = D - t.reach2 + myNext - CATCH - 60;
                if (m2 < 0) sc -= soft * t.w * 25 * Math.min(-m2, 1200);
            }
            boolean hidden = smokeHere || treeBlocks(px, py, t.x, t.y, 0);
            // a hunter that lost us in a cloud still walks to where it saw us last: while running blind, distance counts in full
            // v16: early in the game a hunter keeps less distance from predators (only this soft term; the hard limits stay)
            if (F_PROX && t.immob <= 1) sc -= soft * t.w * (hidden ? (planFlee ? 1.0 : 0.3) : 1.0) * (aggro && !planFlee ? AG_PROX : 1.0) * Math.max(0, 2500 - D);
            if (!hidden && D < 2470 + (t.immob > 0 ? 0 : 600) && !treeBlocks(px, py, t.x, t.y, NET_TREE)) sc -= soft * t.w * 400;
        }
        if (nearestTh < 4000) sc -= 1.5 * Math.max(0, hyp(px, py) - 6300);
        if (nearestTh < 3600) {
            lastNeedF = F_FREE && reward < 300000;
            double rm = F_ROLL ? rollout(px, py, ux, uy) : 2600;
            sc += 1.5 * Math.min(rm, 2600);
            if (rm < CATCH + 60) sc -= deathScale * 30000;
        }
        if (F_SEP && reward < 300000) for (E o : liveNow) if (o != u && !(F_GANG && target != null && o.tgt == target && holdLeft(target) > 0)) sc -= 1.5 * Math.max(0, 700 - hyp(px - o.ex, py - o.ey));   // never stack
        if (startSmoke && u.immob == 0) {                                // blind in a cloud: do not stand, walk out
            if (hyp(px - sx, py - sy) < 100) sc -= 1500;
            if (smokeHere && !planFlee && !planHunt) sc -= 400;          // with a plan the goal decides where to leave the cloud
        }
        sc -= wG * hyp(px - wx, py - wy);
        if (F_HIDDEN && reward < 300000 && !startSmoke) sc -= hiddenFrac(px, py) * (dash ? 2500 : target != null && turn - target.seen <= 2 ? 400 : 800);                            // no blind steps
        if (F_OLDPRED) for (E o : oldPred) sc -= 0.5 * Math.max(0, 1800 - hyp(px - o.x, py - o.y));                                          // a predator was here
        if (dash) {
            sc -= approachDash ? 300 : 700 + 250 * u.fat;
            if (target != null && holdLeft(target) > 0 && (hyp(target.x - sx, target.y - sy) - CATCH) / MOVE > holdLeft(target) - 1) sc += 1500;
        }
        return sc;
    }

    // ---------------------------------------------------------------- one turn
    static String decide() {
        List<E> live = new ArrayList<>(), ghosts = new ArrayList<>();
        for (E u : mine) (u.ghost ? ghosts : live).add(u);
        boolean preyGone = myScore >= N;
        liveNow = live;
        for (E u : live) if (!inSmoke(u.x, u.y, 0)) { u.ox = u.x; u.oy = u.y; u.ovx = u.vx; u.ovy = u.vy; u.oturn = turn; }
        updateGrid();
        List<Integer> claimed = new ArrayList<>();

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
        // v16: netted prey out of sight (in a cloud) whose hold has not run out: it is still exactly where it was
        heldPrey.clear();
        if (F_HELDPREY && !preyGone) for (E t : tracks.values())
            if (t.owner == prey && !t.vis && !t.dead && !t.lost && turn - t.seen <= 5 && holdLeft(t) > 0) heldPrey.add(t);
        boolean early = early();
        stanceNow = stance();
        // hunters: the cheapest pairs first, at most two per prey (three in the early game)
        Map<E, E> targetOf = new IdentityHashMap<>(); Map<E, Integer> load = new IdentityHashMap<>();
        List<E> free = new ArrayList<>(); for (E u : live) if (u.immob == 0) free.add(u);
        for (int cap = early ? AG_CAP : 2; cap <= 6 && !free.isEmpty() && !cand.isEmpty(); cap += 4) {
            while (!free.isEmpty()) {
                E bu = null, bq = null; double bc = 1e18;
                for (E u : free) for (E q : cand) {
                    if (load.getOrDefault(q, 0) >= cap) continue;
                    double c = hyp(u.x - q.x, u.y - q.y) + (turn - q.seen) * 200 - (holdLeft(q) > 0 ? 2500 : 0) + load.getOrDefault(q, 0) * 800;
                    if (c < bc) { bc = c; bu = u; bq = q; }
                }
                if (bu == null) break;
                targetOf.put(bu, bq); load.merge(bq, 1, Integer::sum); free.remove(bu);
            }
        }

        for (E u : live) u.tgt = targetOf.get(u);
        if (F_GANG) for (E u : live) {
            if (u.immob > 0) continue;
            E cur = targetOf.get(u); if (cur != null && holdLeft(cur) > 0) continue;
            E gq = null; double gd = 1e18;
            for (E q : cand) {
                int gh = holdLeft(q); if (gh <= 0) continue;
                double dq0 = hyp(q.x - u.x, q.y - u.y);
                if (dq0 - CATCH > MOVE * gh + (u.cd == 0 ? 600 : 0)) continue;
                if (dq0 < gd) { gd = dq0; gq = q; }
            }
            if (gq == null) continue;
            if (cur != null && cur.vis && hyp(cur.x - u.x, cur.y - u.y) < gd) continue;   // its own prey is nearer and in sight
            targetOf.put(u, gq); u.tgt = gq;
        }
        // moves of the living units
        boolean[] cert = new boolean[1];
        for (E u : live) {
            if (u.immob > 0) { u.tag = "HELD"; continue; }
            if (preyGone && F_HIDE) { double nt0 = 1e18; for (Th t : threats) nt0 = Math.min(nt0, hyp(u.x - t.x, u.y - t.y)); for (E o : oldPred) nt0 = Math.min(nt0, hyp(u.x - o.x, u.y - o.y) + 1200); if (nt0 > 3600 && !inSmoke(u.x, u.y, 0)) { u.tag = "HIDE"; continue; } }
            E target = targetOf.get(u);
            double gx, gy, wG;
            aggro = early && target != null;
            commitNow = F_COMMIT && target != null && holdLeft(target) > 0
                && hyp(target.x - u.x, target.y - u.y) - CATCH <= MOVE * holdLeft(target) + (u.cd == 0 ? 600 : 0) + 300;
            // v15: inside a cloud nothing is in sight. Plan from memory: predators are modelled walking at the place where
            // they last saw us; one of them near means run away from it, otherwise keep after the prey's last known track.
            List<Th> baseThreats = threats; planFlee = false; planHunt = false;
            // Two cases lose sight: we are in a cloud, or a predator near us just went into one (or behind one). Both times the
            // predator is still coming at the place where it last saw us: running from its last known position comes first.
            boolean blind = F_BLIND && inSmoke(u.x, u.y, 0);
            boolean predSmoked = F_BLIND && F_BL_OUT && !blind && smokedPredNear(u);
            double[] fleeTo = null;
            if (blind && !F_BL_IN && F_BL_HUNT && target != null) {      // no blind flee: blind hunt only when no predator is near
                double nd0 = 1e18; for (Th t : threats) if (t.w >= 0.3 && t.immob <= 1) nd0 = Math.min(nd0, hyp(u.x - t.x, u.y - t.y) - t.reach);
                if (nd0 >= 2600) planHunt = true;
            }
            if ((blind && F_BL_IN) || predSmoked) {
                threats = blindThreats(u);
                double nd = 1e18; for (Th t : threats) if (t.w >= 0.3 && t.immob <= 1) nd = Math.min(nd, hyp(u.x - t.x, u.y - t.y) - t.reach);
                // netted prey we can still reach before the hold runs out is worth more than running (v16: not only within 1500)
                double dq = target == null ? 1e18 : hyp(target.x - u.x, target.y - u.y);
                boolean preyHeldNear = target != null && holdLeft(target) > 0 && (dq < 1500 || (F_HELDPREY && dq - CATCH <= MOVE * holdLeft(target) + 600));
                if (nd < fleeTrigger(u, target, blind) && !preyHeldNear) { planFlee = true; fleeTo = fleePoint(u); }
                else if (blind && target != null && F_BL_HUNT) planHunt = true;
            }
            if (fleeTo != null) { gx = fleeTo[0]; gy = fleeTo[1]; wG = 2.0; }
            else if (target != null) {
                // a target out of sight because we are blind or it went into a cloud: follow its last movement (up to 3 turns)
                int age = turn - target.seen;
                // (its last position is outside the cloud it walked into: test with the distance it could have walked since)
                boolean est = F_BL_HUNT && !target.vis && age <= 4 && (blind || inSmoke(target.x, target.y, -(MOVE * age + 200)) || smokeBlocks(u.x, u.y, target.x, target.y));
                boolean held = holdLeft(target) > 0;
                double[] v = target.vis || (est && !held) ? predV(target) : new double[]{0, 0};
                double ext = est && !held ? Math.min(3, age) : 0;
                gx = target.x + v[0] * ext; gy = target.y + v[1] * ext;
                for (int i = 0; i < 3; i++) { double tt = Math.min(4, hyp(gx - u.x, gy - u.y) / MOVE) + ext; gx = target.x + v[0] * tt; gy = target.y + v[1] * tt; }
                if (F_FLANK && !held && target.vis && hyp(target.x - u.x, target.y - u.y) > 1000) {
                    E lead = null; double ldist = hyp(target.x - u.x, target.y - u.y);
                    for (E o : live) if (o != u && o.immob == 0 && o.tgt == target) { double od = hyp(target.x - o.x, target.y - o.y); if (od < ldist) { ldist = od; lead = o; } }
                    if (lead != null && ldist > 1) { gx += (target.x - lead.x) / ldist * 800; gy += (target.y - lead.y) / ldist * 800; }
                }
                double l = hyp(gx, gy); if (l > R - UR) { gx *= (R - UR) / l; gy *= (R - UR) / l; }
                wG = (holdLeft(target) > 0 || hyp(target.x - u.x, target.y - u.y) < 1500) ? 2.0 : 1.0;
                if (aggro) wG *= AG_PULL;                               // v16/v17: early game, the prey pulls harder (more in small games)
            } else {
                int cell = preyGone || !F_MAP ? -1 : searchCell(u.x, u.y, claimed);
                if (cell >= 0) { claimed.add(cell); gx = cellX(cell); gy = cellY(cell); wG = 1.0; }
                else {
                    int idx = u.id - myId * N;
                    double a = idx * 2 * Math.PI / Math.max(1, N) + turn * 0.12;
                    gx = Math.cos(a) * 4500; gy = Math.sin(a) * 4500; wG = preyGone ? 0.05 : 0.5;
                }
            }
            double[] w = steer(u.x, u.y, gx, gy);
            int nc = 0;
            boolean hurry = System.nanoTime() - turnStart > 25_000_000L;   // 50 ms per turn: the last units get a coarser search
            boolean walkUnsafe = true;                      // true until a walk (or standing) is found that no predator can touch
            cS[nc] = eval(u, u.x, u.y, 0, 0, false, w[0], w[1], wG, target, cert); cX[nc] = u.x; cY[nc] = u.y; cC[nc] = null; cF[nc] = lastNeedF; cT[nc] = cert[0]; nc++;
            if (!lastUnsafe) walkUnsafe = false;
            boolean rush = target != null && holdLeft(target) > 0 && (hyp(target.x - u.x, target.y - u.y) - CATCH) / MOVE > holdLeft(target) - 1;
            boolean preyNear = false; for (E q : seenPrey) if (hyp(q.x - u.x, q.y - u.y) < 1700) preyNear = true;
            // early catches decide ties: the first two dashes (1 and 2 turns of cooldown) may be spent to close in on prey
            // we know about, as long as no predator is near
            double ntF = 1e18; for (Th t : threats) if (t.w >= 0.5) ntF = Math.min(ntF, hyp(u.x - t.x, u.y - t.y));
            approachDash = F_APPROACH && target != null && turn - target.seen <= 1 && hyp(target.x - u.x, target.y - u.y) > (aggro ? 1300 : 1500)
                && (aggro ? u.fat <= AG_FAT && ntF > AG_NTF : u.fat <= 2 && ntF > 3000);   // v16/v17: more approach dashes in small games
            for (int sp = 0; sp < 2; sp++) {
                // dashes are a budget (the k-th costs k turns): only for a catch, to reach netted prey in time,
                // or when no walk is safe this turn
                if (sp == 1 && (u.cd > 0 || (F_DASH && !(walkUnsafe || rush || preyNear || approachDash)))) break;
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
                    if (F_DASH && sp == 1 && !(walkUnsafe || rush || approachDash || lastReward >= 300000 || (lastReward >= 25000 && u.fat <= (aggro ? AG_FAT : 2)))) continue;
                    cS[nc] = s; cX[nc] = e[0]; cY[nc] = e[1]; cC[nc] = (sp == 1 ? "DASH " : "MOVE ") + u.id + " " + (long) ax + " " + (long) ay; cF[nc] = lastNeedF; cT[nc] = cert[0]; nc++;
                }
            }
            // ways out (wall, pockets) cost 12 simulated moves each: scored only for the candidates that lead
            int bi = 0;
            for (int it = 0; it < (hurry ? 3 : 14); it++) {
                bi = 0; for (int i = 1; i < nc; i++) if (cS[i] > cS[bi]) bi = i;
                if (!cF[bi]) break;
                cS[bi] -= 500 * Math.max(0, 5 - freedom(cX[bi], cY[bi])); cF[bi] = false;
            }
            String bestCmd = cC[bi]; double bex = cX[bi], bey = cY[bi]; boolean bestCert = cT[bi];
            u.cmd = bestCmd; u.ex = bex; u.ey = bey;
            double nt = 1e18; for (Th t : threats) nt = Math.min(nt, hyp(u.x - t.x, u.y - t.y));
            u.tag = bestCert ? "CATCH" : nt < 2500 ? "FLEE" : target != null ? "HUNT" : "SEEK";
            if (blind) u.tag = planFlee ? "SFLEE" : planHunt ? "SHUNT" : "S" + u.tag;
            else if (planFlee) u.tag = "LFLEE";                          // running from a predator that vanished into smoke
            threats = baseThreats; planFlee = false; planHunt = false; aggro = false; commitNow = false;
            if (bestCert) for (E q : seenPrey) if (segDist(q.x, q.y, u.x, u.y, bex, bey) < CATCH + 300) q.caughtNow = true;
        }

        List<String> out = new ArrayList<>();
        // ---- powers. Decoys leave before the move, nets and smoke after it (from u.ex, u.ey).
        // 0a. v15: a netted unit answers on its first held turn, before it can spend the power on prey
        if (F_HELD_FIRST) for (E u : live) if (u.immob > 0) heldDefense(u, out, live);
        // 0b. v15: two or more predators on our tail: one cloud over all of them, not a net per predator
        if (F_MULTI && !F_NOSMOKE) for (E u : live) {
            if (smokes <= 0) break;
            if (u.usedPower || u.immob > 0 || inSmoke(u.ex, u.ey, 400)) continue;
            List<double[]> tail = tailPreds(u);
            if (tail.size() < 2) continue;
            double dn = 1e18; boolean line = false;
            for (double[] p : tail) { double d = hyp(p[0] - u.ex, p[1] - u.ey); dn = Math.min(dn, d); if (d < 2600 && !treeBlocks(u.ex, u.ey, p[0], p[1], NET_TREE)) line = true; }
            if (dn > 2300 || !(line || dn < 1600)) continue;
            double[] c = smokeCenter(u, tail, false);
            out.add(throwSmoke(u, c[0], c[1])); u.tag = "SMOKE2";
        }
        // 1. nets at prey that cannot dodge
        for (E u : live) {
            if (nets <= 0) break;
            if (u.usedPower) continue;
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
                // v18: closer nets only. Gold hit rates (research W2): target able to dash 73 % under 1400, 63 % at 1400-2000,
                // 48 % beyond 2000. Cut the 48 % band and keep unsure nets inside 1800. Close early nets are untouched: they
                // make the first catches (restricting them doubled our tie-break losses in the arena).
                if (F_NETCLOSE && q.immob == 0 && q.cd == 0 && d > 2000) continue;
                if (F_NETCLOSE && !sure && d > 1800) continue;
                // v18: 3-4 unit games before our first catch, the last net may go at prey inside 1600 (the first catch decides)
                boolean lastNet = F_FIRSTKILL && N <= 4 && myScore == 0 && d <= 1600;
                if (!sure && (nets < 2 || !F_NETWIDE) && !(lastNet && F_NETWIDE)) continue;
                double cost = d + (sure ? 0 : 1500);
                if (F_NETMATE) {
                    boolean mate = false;
                    for (E m : live) if (m != u && m.immob == 0 && hyp(qx - m.ex, qy - m.ey) - CATCH <= MOVE * 3 + (m.cd == 0 ? 600 : 0)) mate = true;
                    if (u.immob > 1 && !mate) continue;
                    if (mate) cost -= 800;
                }
                // F_NET_LATE: from turn 40 a prey on dash cooldown within 1800 goes first: the saved nets secure late kills
                if (F_NET_LATE && turn >= 40 && q.cd > 0 && q.immob == 0 && d <= 1800) cost -= 2000;
                if (cost < bd) { bd = cost; bq = q; bx = qx; by = qy; }
            }
            if (bq != null) { out.add(net(u, bx, by)); bq.netTargeted = true; }
        }
        // 2. nets at the hunter that is about to reach us
        for (E u : live) {
            if (nets <= 0) break; if (u.usedPower) continue;
            // v15: chased by several, the cloud is the getaway; nets at them only when no smoke is left (and we are not hidden)
            boolean multi = F_MULTI && (smokes > 0 || inSmoke(u.ex, u.ey, 400)) && tailPreds(u).size() >= 2;
            E be = null; double bd = 1e18; double bx = 0, by = 0;
            for (E e : seenPred) {
                if (e.immob > 0 || e.netTargeted) continue;
                double[] v = predV(e); double qx = e.x + v[0], qy = e.y + v[1];
                double d = hyp(qx - u.ex, qy - u.ey);
                if (d < 300 || d > 2200) continue;
                if (treeBlocks(u.ex, u.ey, qx, qy, NET_TREE + 20) || friendOnLine(u, qx, qy, live)) continue;
                // v18_final net economy (F_NETSAVE): a FREE unit escapes with smoke or a decoy and keeps its nets for attack;
                // it nets the hunter only when it has neither left. Held units (counter) and rescues are unchanged.
                boolean canSmoke = !F_NOSMOKE && smokes > 0 && !inSmoke(u.ex, u.ey, 400);
                boolean canDecoy = F_DECOY && decoys > 0 && turn - u.lastDecoy > (F_DECOY_ESCAPE ? 5 : 8);
                boolean freeNeed = d <= 1500 && !(F_NETSAVE && u.immob == 0 && (canSmoke || canDecoy));
                boolean need = !multi && ((u.immob > 0 && d <= CATCH + MOVE * u.immob + MOVE) || (u.immob == 0 && freeNeed) || (u.immob > 0 && d <= 1500));
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
            double[] nv = predV(near); double hx = near.x + nv[0], hy = near.y + nv[1];      // where the hunter will be
            if (!F_NOSMOKE && wantSmoke && smokes > 0 && !inSmoke(u.ex, u.ey, F_SMOKE ? 0 : 400) && (!F_SMOKE || !inSmoke(hx, hy, 200))) {
                // the cloud goes 2000 out, past the hunter: it is blind inside (radius 1900), we stay just outside
                // and keep our sight. A cloud on ourselves blinded us: 42 % of our arena losses were inside our own smoke.
                double dl = Math.max(1, hyp(hx - u.ex, hy - u.ey));
                double cx = u.ex + (hx - u.ex) / dl * SMOKE_THROW, cy = u.ey + (hy - u.ey) / dl * SMOKE_THROW;
                // v15: on us when the hunter is close, between us and it when it is far (smokeCenter)
                if (!F_SMOKE) { List<double[]> one = new ArrayList<>(); one.add(new double[]{hx, hy}); double[] c = smokeCenter(u, one, u.immob > 0); cx = c[0]; cy = c[1]; }
                out.add(throwSmoke(u, cx, cy));
            } else if (F_DECOY && decoys > 0 && u.immob == 0 && turn - u.lastDecoy > (F_DECOY_ESCAPE && Dpre < 1800 ? 5 : 8) && Dpre < 2900 && !treeBlocks(u.x, u.y, near.x, near.y, 0) && !inSmoke(u.ex, u.ey, 0)) {
                // (F_DECOY_ESCAPE: a hunter inside 1800 gets a new decoy after 5 turns instead of 8: decoys replace defensive nets)
                out.add("DECOY " + u.id + " " + Math.round(near.x) + " " + Math.round(near.y));
                decoys--; u.usedPower = true; u.lastDecoy = turn;
            }
        }

        // ---- ghosts (v10): sit on prey (then on predators) so the team keeps seeing them
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

    // ---------------------------------------------------------------- v15: better ability usage
    static final double SMOKE_MAX_OFF = 1500;   // cloud centre at most 1500 from us: we stay 400 inside the 1900 radius
    static String throwSmoke(E u, double cx, double cy) {
        double cl = hyp(cx, cy); if (cl > R - 50) { cx *= (R - 50) / cl; cy *= (R - 50) / cl; }
        smokes--; u.usedPower = true; clouds.add(new double[]{cx, cy, turn + SMOKE_LIFE});
        return "SMOKE " + u.id + " " + Math.round(cx) + " " + Math.round(cy);
    }
    /**
     * Cloud centre against predators expected at `ps`, seen from where u stands after its move. The cloud must blind them
     * and us on the same turn, and leave us near its far edge so we walk out first:
     *  - nearest predator within 1200: on us;
     *  - from 1800 on: half way to the (closeness-weighted) centre of the predators, at most 1500 from us;
     *  - a held unit (it cannot walk out) keeps the cloud near itself: at most 700 towards them.
     * Along that line the offset that puts the most predators 250 inside the cloud wins, ties go to the preferred offset.
     */
    static double[] smokeCenter(E u, List<double[]> ps, boolean held) {
        double px = u.ex, py = u.ey;
        // v18: a held unit always uses the v17 placement (it cannot walk out of a cloud); a free unit uses P_SMOKE_MODE
        if (!held && P_SMOKE_MODE == 2 && !ps.isEmpty()) {         // on the predator (nearest), at most 2000 from us
            double[] n = ps.get(0); double nd = 1e18;
            for (double[] p : ps) { double d = hyp(p[0] - px, p[1] - py); if (d < nd) { nd = d; n = p; } }
            double s = Math.min(SMOKE_THROW - 1, nd);
            return nd < 1 ? new double[]{px, py} : new double[]{px + (n[0] - px) / nd * s, py + (n[1] - py) / nd * s};
        }
        if (!F_SMOKE_PLACE || (!held && P_SMOKE_MODE == 0)) {      // v10: 900 ahead of our own move
            double mx = u.ex - u.x, my = u.ey - u.y, ml = hyp(mx, my);
            return ml > 50 ? new double[]{px + mx / ml * 900, py + my / ml * 900} : new double[]{px, py};
        }
        if (ps.isEmpty()) return new double[]{px, py};
        double cx = 0, cy = 0, ws = 0, dn = 1e18;
        for (double[] p : ps) { double d = hyp(p[0] - px, p[1] - py); dn = Math.min(dn, d); double w = 1 / (d + 300); cx += p[0] * w; cy += p[1] * w; ws += w; }
        cx /= ws; cy /= ws;
        double dc = hyp(cx - px, cy - py);
        if (dc < 1) return new double[]{px, py};
        double ux = (cx - px) / dc, uy = (cy - py) / dc;
        double f = Math.max(0, Math.min(1, (dn - 1200) / 600));
        double pref = held ? Math.min(0.4 * dc, 700) : Math.min(SMOKE_MAX_OFF, f * dc / 2);
        double best = -1e18, bs = 0;
        for (double s = 0; s <= SMOKE_MAX_OFF + 1; s += 100) {
            double x = px + ux * s, y = py + uy * s; int in = 0;
            for (double[] p : ps) if (hyp(p[0] - x, p[1] - y) < SMOKE_R - 250) in++;
            double sc = 1000 * in - Math.abs(s - pref);
            if (sc > best) { best = sc; bs = s; }
        }
        return new double[]{px + ux * bs, py + uy * bs};
    }
    /**
     * A predator seen in the last 8 turns, last known within 4000 of u, that we lost because of smoke: its last position is
     * in (or next to) a cloud, or the line from u to it runs through one. It is blind or hidden, and it is still coming.
     */
    static boolean smokedPredNear(E u) {
        for (E t : tracks.values()) {
            if (t.owner != pred || t.vis || t.dead) continue;
            int age = turn - t.seen; if (age < 1 || age > 8) continue;
            if (hyp(t.x - u.x, t.y - u.y) > 4000) continue;
            if (inSmoke(t.x, t.y, -300) || smokeBlocks(u.x, u.y, t.x, t.y)) return true;
        }
        return false;
    }
    /** Predators on u's tail: free (or free next turn), seen this turn or last turn, expected within 2800 of where u will stand. */
    static List<double[]> tailPreds(E u) {
        List<double[]> r = new ArrayList<>(); Set<Integer> ids = new HashSet<>();
        for (Th t : threats) {
            if (t.immob > 1 || turn - t.e.seen > 1) continue;
            if (!ids.add(t.e.id)) continue;                     // v16 fix: a predator and its decoy share one id: one predator
            double[] v = t.immob > 0 ? new double[]{0, 0} : predV(t.e);
            double x = t.x + v[0], y = t.y + v[1];
            if (hyp(x - u.ex, y - u.ey) <= 2800) r.add(new double[]{x, y});
        }
        return r;
    }
    /**
     * A netted unit acts on its first held turn (the hunter that threw is on its way; waiting for it to come close lost us units):
     * 1. net back a predator it can hit (dash on cooldown, close, or coming along the line), unless two or more are coming;
     * 2. else smoke now, also with no predator in sight (whoever threw is out there), unless prey next to us netted us in defence;
     * 3. else a net with an unsure aim; 4. else a decoy walked at the nearest predator to take its net.
     */
    static void heldDefense(E u, List<String> out, List<E> live) {
        if (u.usedPower) return;
        E be = null, ue = null, near = null; double bd = 1e18, ud = 1e18, nd = 1e18, bx = 0, by = 0, ux = 0, uy = 0; int close = 0;
        for (E e : seenPred) {
            if (e.immob > 0) continue;
            double[] v = predV(e); double qx = e.x + v[0], qy = e.y + v[1];
            double d = hyp(qx - u.x, qy - u.y);
            if (d < 2800) close++;
            if (d < nd) { nd = d; near = e; }
            if (e.netTargeted || d < 300 || d > 2200) continue;
            if (treeBlocks(u.x, u.y, qx, qy, NET_TREE + 20) || friendOnLine(u, qx, qy, live)) continue;
            double lateral = Math.abs(v[0] * (qy - u.y) - v[1] * (qx - u.x)) / d;
            boolean sure = e.cd > 0 || d <= 1500 || lateral <= 300;
            if (sure && d < bd) { bd = d; be = e; bx = qx; by = qy; }
            if (!sure && d <= 2000 && d < ud) { ud = d; ue = e; ux = qx; uy = qy; }
        }
        double rem = 1e18; E remE = null;                       // predators out of sight, at the closest they could be now
        for (E t : tracks.values()) {
            if (t.owner != pred || t.vis || t.dead || turn - t.seen > 8) continue;
            double d = hyp(t.x - u.x, t.y - u.y) - MOVE * (turn - t.seen);
            if (d < rem) { rem = d; remE = t; }
        }
        boolean preyClose = false; for (E q : seenPrey) if (hyp(q.x - u.x, q.y - u.y) < 2600) preyClose = true;
        // our prey netted us in defence (only prey near, no predator known): keep the powers. v18 (F_HELD_ALWAYS): otherwise
        // always answer; v17 also kept them when the hold ended before an unseen thrower could arrive.
        if (near == null && rem > 4000 && (preyClose || (!F_HELD_ALWAYS && u.immob <= 2))) return;
        boolean covered = inSmoke(u.x, u.y, 400);
        boolean multi = F_MULTI && close >= 2 && smokes > 0 && !covered;
        if (nets > 0 && be != null && !multi) { out.add(net(u, bx, by)); be.netTargeted = true; u.tag = "HELDNET"; return; }
        if (!F_NOSMOKE && smokes > 0 && !covered) {
            List<double[]> ps = new ArrayList<>();
            for (E e : seenPred) { if (e.immob > 1) continue; double[] v = predV(e); double qx = e.x + v[0], qy = e.y + v[1]; if (hyp(qx - u.x, qy - u.y) < 3500) ps.add(new double[]{qx, qy}); }
            if (ps.isEmpty() && remE != null && rem < 4000) ps.add(new double[]{remE.x, remE.y});
            double[] c = smokeCenter(u, ps, true);
            out.add(throwSmoke(u, c[0], c[1])); u.tag = "HELDSMOKE"; return;
        }
        if (nets > 0 && be != null) { out.add(net(u, bx, by)); be.netTargeted = true; u.tag = "HELDNET"; return; }
        if (nets > 0 && ue != null) { out.add(net(u, ux, uy)); ue.netTargeted = true; u.tag = "HELDNET"; return; }
        if (F_DECOY && decoys > 0 && near != null && nd < 3000 && turn - u.lastDecoy > 8) {
            out.add("DECOY " + u.id + " " + Math.round(near.x) + " " + Math.round(near.y));
            decoys--; u.usedPower = true; u.lastDecoy = turn; u.tag = "HELDDECOY";
        }
    }
    /**
     * Threats for a unit blind in a cloud. Predators a team mate sees stay as they are. The others (seen 1 to 10 turns ago)
     * walk at the place where they last saw one of us (our last position outside any cloud) and then along our heading from
     * there, the way a blind hunter follows a trail; one with nobody of ours near keeps its last movement for up to 3 turns.
     * Their reach grows with the age of the sighting, their weight drops.
     */
    static List<Th> blindThreats(E u) {
        List<Th> r = new ArrayList<>();
        for (Th t : threats) if (t.e.vis) r.add(t);
        for (E t : tracks.values()) {
            if (t.owner != pred || t.vis || t.dead) continue;
            int age = turn - t.seen; if (age < 1 || age > 10) continue;
            if (t.lost && age > 4) continue;
            E chased = null;
            if (u.oturn > 0 && hyp(u.ox - t.x, u.oy - t.y) < 3500) chased = u;
            else { double cdist = 3500; for (E o : liveNow) { if (o.oturn < 0) continue; double d = hyp(o.ox - t.x, o.oy - t.y); if (d < cdist) { cdist = d; chased = o; } } }
            Th h = new Th(); h.e = t; h.immob = Math.max(0, t.immob - age);
            double x = t.x, y = t.y;
            if (h.immob == 0) {
                int steps = Math.max(0, age - t.immob);
                if (chased != null) {
                    double ax = chased.ox, ay = chased.oy, hl = hyp(chased.ovx, chased.ovy), left = steps * MOVE, d = hyp(ax - x, ay - y);
                    if (d <= left) { left -= d; x = ax; y = ay; if (hl > 1) { x += chased.ovx / hl * left; y += chased.ovy / hl * left; } }
                    else if (d > 1e-6) { x += (ax - x) / d * left; y += (ay - y) / d * left; }
                } else { double[] v = predV(t); int k = Math.min(steps, 3); x += v[0] * k; y += v[1] * k; }
                double l = hyp(x, y); if (l > R - UR) { x *= (R - UR) / l; y *= (R - UR) / l; }
            }
            h.x = x; h.y = y;
            int cd = Math.max(0, t.cd - age); double unc = Math.min(450, 150 * age);
            if (h.immob > 0) { h.reach = 0; h.reach2 = h.immob >= 2 ? 0 : (cd <= 1 ? DASH : MOVE); }
            else { h.reach = (cd == 0 ? DASH : MOVE) + unc; h.reach2 = (cd <= 1 ? DASH + MOVE : 2 * MOVE) + unc; }
            h.w = age <= 3 ? 1.0 / (1 + 0.5 * age) : Math.max(0.2, 0.4 - 0.03 * (age - 4));
            if (t.lost) h.w *= 0.6;
            r.add(h);
        }
        return r;
    }
    /**
     * Where a blind unit runs to: of 24 bearings, the one whose four-turn walk (slide rule, wall) keeps the largest distance
     * to the threats while each of them walks straight at us (weak ones count as farther). Returns the end of that walk.
     */
    static double[] fleePoint(E u) {
        int n = threats.size(); double bs = -1e18, bx = u.x, by = u.y;
        double[] qx = new double[n], qy = new double[n];
        for (int k = 0; k < 24; k++) {
            double a = k * Math.PI / 12, dx = Math.cos(a), dy = Math.sin(a), x = u.x, y = u.y, min = 1e18;
            for (int i = 0; i < n; i++) { qx[i] = threats.get(i).x; qy[i] = threats.get(i).y; }
            for (int s = 1; s <= 4; s++) {
                double[] e = simMove(x, y, x + dx * MOVE, y + dy * MOVE, MOVE, false); x = e[0]; y = e[1];
                for (int i = 0; i < n; i++) {
                    Th t = threats.get(i); if (t.w < 0.2) continue;
                    double d = hyp(x - qx[i], y - qy[i]);
                    if (t.immob < s) {
                        double step = Math.min(d, s == 1 ? Math.max(MOVE, t.reach) : MOVE);
                        if (d > 1e-6) { qx[i] += (x - qx[i]) / d * step; qy[i] += (y - qy[i]) / d * step; }
                        d -= step;
                    }
                    min = Math.min(min, d + (1 - t.w) * 1000);
                }
            }
            double sc = Math.min(min, 3000) - 2 * Math.max(0, hyp(x, y) - 6300) + 0.05 * hyp(x - u.x, y - u.y);
            if (sc > bs) { bs = sc; bx = x; by = y; }
        }
        return new double[]{bx, by};
    }
    /**
     * A predator as a threat. One that is out of sight (age 1 to 3 turns: behind a tree, or inside a cloud, where it is
     * invisible but still walks) is assumed to have kept its last movement; its dash comes back as the turns pass.
     */
    static Th threat(E e, int age) {
        Th t = new Th(); t.e = e; t.immob = Math.max(0, e.immob - age);
        double[] v = age > 0 && F_STALE ? predV(e) : new double[]{0, 0};
        t.x = e.x + v[0] * age; t.y = e.y + v[1] * age;
        double l = hyp(t.x, t.y); if (l > R - UR) { t.x *= (R - UR) / l; t.y *= (R - UR) / l; }
        int cd = Math.max(0, e.cd - age);
        if (t.immob > 0) { t.reach = 0; t.reach2 = t.immob >= 2 ? 0 : (cd <= 1 ? DASH : MOVE); }
        else { t.reach = (cd == 0 ? DASH : MOVE) + age * 300; t.reach2 = (cd <= 1 ? DASH + MOVE : 2 * MOVE) + age * 300; }
        t.w = 1.0 / (1 + 0.5 * age);
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
