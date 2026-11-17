import java.util.*;

/**
 * Try Catch Forest - preparation kit (built from two replay videos, BEFORE the statement was available).
 *
 * Everything marked CONFIRM is an estimate from the videos and must be checked against the statement.
 * What is solid: circular arena centred on (0,0), circular obstacles that block movement and sight,
 * three teams in a rock-paper-scissors cycle, one output line of commands joined by ';':
 *   MOVE id x y [msg] | DASH id x y [msg] | NET id x y | SMOKE id x y | DECOY id x y
 *
 * The parts that depend on the input format (readInit / readTurn) are stubs: fill them from the
 * statement's protocol or the API's stub generator. The geometry and decision helpers below are tested
 * by SelfTest.java and do not depend on the protocol.
 */
class Player {
    // ---- parameters: CONFIRM every value with the statement (prefer reading them from the input) ----
    static double ARENA_R = 8000;        // arena radius (tooltip showed y=7556 near the edge; scale ~39 units/px)
    static double VISION = 2500;         // sight radius of a unit (outlines measured at ~2400-2700)
    static double UNIT_R = 200;          // body radius used for obstacle clearance (guess)
    static double MOVE_SPEED = 500;      // distance per turn with MOVE (guess)
    static double DASH_SPEED = 1000;     // distance per turn with DASH (guess; DASH is not usable every turn)
    static double CATCH_RANGE = 400;     // distance at which a hunter catches its prey (guess)
    static double NET_RANGE = 2000;      // how far a net can be thrown (guess)
    static double DANGER = 3000;         // start fleeing when a predator is this close (tuning value)
    static int TURNS = 100;

    // ---- small vector type ----
    static final class V {
        final double x, y;
        V(double x, double y) { this.x = x; this.y = y; }
        V add(V o) { return new V(x + o.x, y + o.y); }
        V sub(V o) { return new V(x - o.x, y - o.y); }
        V mul(double k) { return new V(x * k, y * k); }
        double len() { return Math.hypot(x, y); }
        double dist(V o) { return Math.hypot(x - o.x, y - o.y); }
        V norm() { double l = len(); return l < 1e-9 ? new V(0, 0) : new V(x / l, y / l); }
        static V polar(double angle, double r) { return new V(Math.cos(angle) * r, Math.sin(angle) * r); }
        @Override public String toString() { return Math.round(x) + " " + Math.round(y); }
    }
    static final class Circle {
        final V c; final double r;
        Circle(V c, double r) { this.c = c; this.r = r; }
    }
    static final class Unit {
        int id, owner; V pos; boolean alive = true; int lastSeen = -1;
        Unit(int id, int owner, V pos) { this.id = id; this.owner = owner; this.pos = pos; }
    }

    // ---- rock-paper-scissors cycle. In both videos: player 0 = scissors, 1 = paper, 2 = rock,
    //      so player i catches player (i+1)%3 and is caught by player (i+2)%3. CONFIRM. ----
    static int preyOf(int player) { return (player + 1) % 3; }
    static int predatorOf(int player) { return (player + 2) % 3; }

    // ---- geometry ----
    /** Distance from point p to segment a-b. */
    static double distToSegment(V p, V a, V b) {
        V ab = b.sub(a);
        double l2 = ab.x * ab.x + ab.y * ab.y;
        if (l2 < 1e-9) return p.dist(a);
        double t = Math.max(0, Math.min(1, ((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / l2));
        return p.dist(a.add(ab.mul(t)));
    }
    /** First obstacle (grown by margin) crossed by the segment a-b, or null. */
    static Circle firstBlocking(V a, V b, List<Circle> obstacles, double margin) {
        Circle best = null; double bestD = Double.MAX_VALUE;
        for (Circle o : obstacles) {
            if (distToSegment(o.c, a, b) < o.r + margin) {
                double d = a.dist(o.c);
                if (d < bestD) { bestD = d; best = o; }
            }
        }
        return best;
    }
    /** Line of sight: within range and no obstacle or smoke cloud between a and b. */
    static boolean canSee(V a, V b, List<Circle> obstacles, List<Circle> smokes) {
        if (a.dist(b) > VISION) return false;
        if (firstBlocking(a, b, obstacles, 0) != null) return false;
        return smokes == null || firstBlocking(a, b, smokes, 0) == null;
    }
    static V clampToArena(V p, double margin) {
        double l = p.len(), max = ARENA_R - margin;
        return l <= max ? p : p.mul(max / l);
    }
    /**
     * Where to aim this turn to reach `to` without walking into an obstacle: the target itself when the
     * way is free, otherwise the tangent point of the first blocking obstacle on the side closer to the target.
     */
    static V steer(V from, V to, List<Circle> obstacles) {
        double margin = UNIT_R + 30;
        Circle o = firstBlocking(from, to, obstacles, margin);
        if (o == null) return to;
        double R = o.r + margin, d = from.dist(o.c);
        if (d <= R) return from.add(from.sub(o.c).norm().mul(R - d + MOVE_SPEED));     // inside the margin: step out
        double base = Math.atan2(o.c.y - from.y, o.c.x - from.x);
        double spread = Math.asin(Math.min(1, R / d)) + 0.08;
        double want = Math.atan2(to.y - from.y, to.x - from.x);
        double a1 = base + spread, a2 = base - spread;
        double pick = angleDiff(a1, want) <= angleDiff(a2, want) ? a1 : a2;
        double reach = Math.sqrt(Math.max(0, d * d - R * R)) + MOVE_SPEED;
        return clampToArena(from.add(V.polar(pick, reach)), UNIT_R);
    }
    static double angleDiff(double a, double b) {
        double d = Math.abs(a - b) % (2 * Math.PI);
        return d > Math.PI ? 2 * Math.PI - d : d;
    }

    // ---- decisions ----
    /**
     * Best point to run to: samples directions and scores the distance gained from the predators, staying
     * off the arena wall and off obstacles, with a bonus when an obstacle hides us from the nearest predator.
     */
    static V flee(V me, List<V> predators, List<Circle> obstacles, double step) {
        V best = me; double bestScore = -Double.MAX_VALUE;
        for (int i = 0; i < 24; i++) {
            V p = clampToArena(me.add(V.polar(i * Math.PI / 12, step)), UNIT_R);
            if (firstBlocking(me, p, obstacles, UNIT_R) != null) continue;
            double nearest = Double.MAX_VALUE; V who = null;
            for (V e : predators) { double d = p.dist(e); if (d < nearest) { nearest = d; who = e; } }
            double score = nearest;
            if (who != null && firstBlocking(p, who, obstacles, 0) != null) score += 800;       // out of its sight
            score -= Math.max(0, p.len() - (ARENA_R - 1200)) * 1.5;                              // do not get cornered
            if (score > bestScore) { bestScore = score; best = p; }
        }
        return best;
    }
    /** Aim ahead of a moving prey: where it will be when we reach it, given its last observed velocity. */
    static V intercept(V me, V prey, V preyVelocity, double mySpeed) {
        V aim = prey;
        for (int i = 0; i < 3; i++) aim = prey.add(preyVelocity.mul(me.dist(aim) / Math.max(1, mySpeed)));
        return clampToArena(aim, UNIT_R);
    }
    /** Nearest element of a list to a point, or null. */
    static V nearest(V me, List<V> pts) {
        V best = null; double bd = Double.MAX_VALUE;
        for (V p : pts) { double d = me.dist(p); if (d < bd) { bd = d; best = p; } }
        return best;
    }

    // ---- state ----
    static int myId, unitsPerPlayer, turn;
    static int smokeLeft, decoyLeft, netLeft;
    static List<Circle> obstacles = new ArrayList<>();
    static List<Circle> smokes = new ArrayList<>();
    static Map<Integer, Unit> units = new HashMap<>();          // every unit ever seen, with lastSeen for fog of war

    /** One turn of decisions: returns the output line. Uses only the state above. */
    static String decide() {
        List<String> out = new ArrayList<>();
        List<V> prey = new ArrayList<>(), predators = new ArrayList<>();
        for (Unit u : units.values()) {
            if (!u.alive || turn - u.lastSeen > 3) continue;      // forget positions older than 3 turns
            if (u.owner == preyOf(myId)) prey.add(u.pos);
            if (u.owner == predatorOf(myId)) predators.add(u.pos);
        }
        for (Unit u : units.values()) {
            if (u.owner != myId || !u.alive) continue;
            V threat = nearest(u.pos, predators), target = nearest(u.pos, prey);
            String mode; V goal;
            if (threat != null && u.pos.dist(threat) < DANGER) {
                mode = "FLEE"; goal = flee(u.pos, predators, obstacles, MOVE_SPEED * 2);
                if (smokeLeft > 0 && u.pos.dist(threat) < 1200) { out.add("SMOKE " + u.id + " " + u.pos); smokeLeft--; }
            } else if (target != null) {
                mode = "HUNT"; goal = steer(u.pos, target, obstacles);
                if (netLeft > 0 && u.pos.dist(target) < NET_RANGE && u.pos.dist(target) > CATCH_RANGE) { out.add("NET " + u.id + " " + target); netLeft--; }
            } else {
                mode = "SEEK";                                      // patrol a ring, each unit at its own angle
                double a = (u.id % Math.max(1, unitsPerPlayer)) * 2 * Math.PI / Math.max(1, unitsPerPlayer) + turn * 0.15;
                goal = steer(u.pos, V.polar(a, ARENA_R * 0.55), obstacles);
            }
            out.add(0, "MOVE " + u.id + " " + clampToArena(goal, UNIT_R) + " " + mode);
        }
        return out.isEmpty() ? "MOVE 0 0 0" : String.join(";", out);
    }

    // ---- protocol: STUBS, to be written from the statement ----
    static void readInit(Scanner in) {
        // TODO from the statement: my player id, units per player, arena radius, obstacles (x y radius), item counts, ranges
    }
    static void readTurn(Scanner in) {
        // TODO from the statement: item counts left, my units, visible enemy units (set lastSeen = turn), smoke clouds, nets, ghosts
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        readInit(in);
        while (in.hasNext()) {
            readTurn(in);
            System.out.println(decide());
            turn++;
        }
    }
}
