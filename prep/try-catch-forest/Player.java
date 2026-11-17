import java.util.*;

/**
 * Try Catch Forest (Unleash the Geek 2026) - preparation kit.
 *
 * Built before the statement was available, from two replay videos and from the referee's text logs of
 * 1100 Gold-league games. Values marked MEASURED come from those logs; values marked CONFIRM are still
 * estimates and must be checked against the statement.
 * Solid: circular arena centred on (0,0), circular trees that block movement, sight and nets,
 * three teams in a rock-paper-scissors cycle, one output line of commands joined by ';':
 *   MOVE id x y [msg] | DASH id x y [msg] | NET id x y | SMOKE id x y | DECOY id x y
 * A unit may move (or dash) and use one item in the same turn.
 *
 * The parts that depend on the input format (readInit / readTurn) are stubs: fill them from the
 * statement's protocol or the API's stub generator. The geometry and decision helpers below are tested
 * by SelfTest.java and do not depend on the protocol.
 */
class Player {
    // ---- parameters (prefer reading them from the input if the statement provides them) ----
    static double ARENA_R = 8000;        // MEASURED: no unit centre was ever further than 7780 from (0,0)
    static double VISION = 2200;         // CONFIRM: sight radius (bots stop reacting between 2000 and 2400)
    static double UNIT_R = 220;          // MEASURED: 8000 - 7780
    static double MOVE_SPEED = 600;      // MEASURED: distance per turn with MOVE
    static double DASH_SPEED = 1200;     // MEASURED: distance per turn with DASH
    static int DASH_EVERY = 2;           // MEASURED: after a dash on turn t the next dash is possible on turn t+2
    static double CATCH_RANGE = 400;     // MEASURED: a dash catches a unit walking away from 900, not from 1050
    static double STRIKE = DASH_SPEED - MOVE_SPEED + CATCH_RANGE - 50;   // 950: dash reach against a unit that walks away
    static double NET_RANGE = 2000;      // MEASURED: a net flies at most 2000, stops at the first tree
    static double NET_MIN = 800;         // nets from closer are rarely needed: walk in instead
    static double NET_GOOD = 1400;       // MEASURED: inside this distance a net hits 72 % even if the target can dash
    static int NET_HOLD = 4;             // MEASURED: a netted unit cannot move for 4 turns (it can still use items)
    static double SMOKE_R = 1200;        // CONFIRM: cloud radius (no net ever landed within 1200 of a fresh cloud)
    static double SMOKE_TRIGGER = 2200;  // smoke when a predator is this close: one turn before its net can come
    static double WALL_RING = 6500;      // MEASURED: threatened units beyond this radius die twice as often
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
        int id, owner; V pos; boolean alive = true; int lastSeen = -1, lastDash = -99, nettedUntil = -1;
        Unit(int id, int owner, V pos) { this.id = id; this.owner = owner; this.pos = pos; }
        boolean netted(int turn) { return turn <= nettedUntil; }
        boolean dashReady(int turn) { return turn - lastDash >= DASH_EVERY && !netted(turn); }
        /** Call from readTurn with the new position: a jump of more than a walk means the unit dashed last turn. */
        void seen(V now, int turn) { if (lastSeen == turn - 1 && pos.dist(now) > MOVE_SPEED + 100) lastDash = turn - 1; pos = now; lastSeen = turn; }
    }

    // ---- rock-paper-scissors cycle. In both videos: player 0 = scissors, 1 = paper, 2 = rock,
    //      so player i catches player (i+1)%3 and is caught by player (i+2)%3 (MEASURED: 2643 catches, no exception). ----
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
            score -= Math.max(0, p.len() - (WALL_RING - 300)) * 2;                               // stay out of the wall ring
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

    /** True when a net thrown from a to b can arrive: in range, not point-blank, no tree on the way. */
    static boolean netLine(V a, V b) {
        double d = a.dist(b);
        return d >= NET_MIN && d <= NET_RANGE && firstBlocking(a, b, obstacles, 0) == null;
    }

    /** Aim point of a net: the full range along the line through the target (a net stops at its aim point). */
    static V netAim(V from, V target) { return from.add(target.sub(from).norm().mul(NET_RANGE)); }

    /** Position after one MOVE or DASH order from `from` towards `to`. */
    static V after(V from, V to, double speed) {
        double d = from.dist(to);
        return d <= speed ? to : from.add(to.sub(from).mul(speed / d));
    }

    /** True when p is inside a smoke cloud (known clouds plus the ones ordered this turn). No net landed within
     *  1200 of a fresh cloud in 1100 games, so a covered unit needs no second smoke and is no net target. */
    static boolean covered(V p, List<Circle> extra) {
        for (Circle c : smokes) if (c.c.dist(p) < c.r) return true;
        for (Circle c : extra) if (c.c.dist(p) < c.r) return true;
        return false;
    }

    static Unit nearestUnit(V me, List<Unit> list) {
        Unit best = null; double bd = Double.MAX_VALUE;
        for (Unit u : list) { double d = me.dist(u.pos); if (d < bd) { bd = d; best = u; } }
        return best;
    }

    /**
     * One turn of decisions: returns the output line. Uses only the state above.
     * The referee resolves a turn as: decoys appear, everybody moves, catches, then nets and smoke of the
     * survivors (from their new positions). Rules, all measured on 1100 Gold games (challenges/try-catch-forest-prep.md):
     *  - FLEE: a walking hunter never catches a unit that walks away; a dashing one does from STRIKE (950) or less.
     *    So dash away exactly when the hunter can dash and is inside that distance, otherwise walk and keep the dash.
     *  - SMOKE is ordered one turn early (it lands after the catches) on the spot we move to: no unit inside smoke
     *    was ever netted. A unit held by a net smokes itself, or nets the hunter back.
     *  - CATCH: dash at free prey within STRIKE, or at netted prey within dash reach.
     *  - NET: thrown from the position after the move, at prey that cannot dodge (dash on cooldown) or is close,
     *    never into smoke and never on the first turn (everybody can still dash: 28 % hits); then the pack walks in. Up to two hunters per prey: pairs convert twice as often.
     */
    static String decide() {
        List<String> moves = new ArrayList<>(), items = new ArrayList<>();
        List<Unit> prey = new ArrayList<>(), predators = new ArrayList<>(), mine = new ArrayList<>();
        List<V> predatorPos = new ArrayList<>();
        for (Unit u : units.values()) {
            if (!u.alive) continue;
            if (u.owner == myId) { mine.add(u); continue; }
            if (turn - u.lastSeen > 3) continue;                    // forget positions older than 3 turns
            if (u.owner == preyOf(myId)) prey.add(u);
            if (u.owner == predatorOf(myId)) { predators.add(u); if (!u.netted(turn)) predatorPos.add(u.pos); }
        }
        // the most threatened units choose first, so they get the smoke when it is scarce
        final Map<Unit, Double> danger = new IdentityHashMap<>();
        for (Unit u : mine) { Unit t = nearestUnit(u.pos, predators); danger.put(u, t == null ? Double.MAX_VALUE : u.pos.dist(t.pos)); }
        mine.sort((a, b) -> danger.get(a).equals(danger.get(b)) ? a.id - b.id : Double.compare(danger.get(a), danger.get(b)));
        Map<Unit, Integer> hunters = new IdentityHashMap<>();
        List<Circle> newSmoke = new ArrayList<>();
        for (Unit u : mine) {
            Unit threat = nearestUnit(u.pos, predators);
            double td = threat == null ? Double.MAX_VALUE : u.pos.dist(threat.pos);
            if (u.netted(turn)) {                                   // held: cannot move, can still use an item
                if (td < DANGER) {
                    if (smokeLeft > 0 && !covered(u.pos, newSmoke)) { items.add("SMOKE " + u.id + " " + u.pos); smokeLeft--; newSmoke.add(new Circle(u.pos, SMOKE_R)); }
                    else if (netLeft > 0 && netLine(u.pos, threat.pos)) { items.add("NET " + u.id + " " + netAim(u.pos, threat.pos)); netLeft--; }
                }
                moves.add("MOVE " + u.id + " " + u.pos + " HELD");
                continue;
            }
            // prey: a netted one within reach first, else the nearest that has fewer than two hunters
            Unit target = null; double best = Double.MAX_VALUE;
            for (Unit p : prey) {
                double d = u.pos.dist(p.pos);
                double score = p.netted(turn) && d < 2400 ? d - 5000 : hunters.getOrDefault(p, 0) >= 2 ? d + 5000 : d;
                if (score < best) { best = score; target = p; }
            }
            boolean canDash = u.dashReady(turn), dash = false;
            String mode; V goal;
            if (threat != null && !threat.netted(turn) && td < DANGER) {
                boolean threatDash = threat.dashReady(turn);
                mode = "FLEE";
                dash = canDash && threatDash && td < STRIKE + 150;      // dash parity: answer its dash, never waste ours
                goal = flee(u.pos, predatorPos, obstacles, dash ? DASH_SPEED : MOVE_SPEED);
                V end = after(u.pos, goal, dash ? DASH_SPEED : MOVE_SPEED);
                if (td < SMOKE_TRIGGER && smokeLeft > 0 && !covered(end, newSmoke)) { items.add("SMOKE " + u.id + " " + end); smokeLeft--; newSmoke.add(new Circle(end, SMOKE_R)); }
                else if (td < 1700 && !threatDash && netLeft > 0 && netLine(end, threat.pos)) { items.add("NET " + u.id + " " + netAim(end, threat.pos)); netLeft--; }
            } else if (target != null) {
                hunters.merge(target, 1, Integer::sum);
                double d = u.pos.dist(target.pos);
                boolean held = target.netted(turn);
                boolean clear = firstBlocking(u.pos, target.pos, obstacles, UNIT_R) == null;
                if (canDash && clear && (d <= STRIKE || (held && d <= DASH_SPEED + CATCH_RANGE))) {
                    mode = "CATCH"; dash = true; goal = target.pos;
                } else {
                    mode = "HUNT"; goal = steer(u.pos, target.pos, obstacles);
                    V end = after(u.pos, goal, MOVE_SPEED);
                    boolean dodges = target.dashReady(turn) && end.dist(target.pos) > NET_GOOD;
                    if (turn > 0 && netLeft > 0 && !held && !dodges && netLine(end, target.pos) && !covered(target.pos, newSmoke)) { items.add("NET " + u.id + " " + netAim(end, target.pos)); netLeft--; }
                }
            } else {
                mode = "SEEK";                                      // patrol a ring, each unit at its own angle
                double a = (u.id % Math.max(1, unitsPerPlayer)) * 2 * Math.PI / Math.max(1, unitsPerPlayer) + turn * 0.15;
                goal = steer(u.pos, V.polar(a, ARENA_R * 0.55), obstacles);
            }
            if (dash) u.lastDash = turn;
            moves.add((dash ? "DASH " : "MOVE ") + u.id + " " + clampToArena(goal, UNIT_R) + " " + mode);
        }
        moves.addAll(items);
        return moves.isEmpty() ? "MOVE 0 0 0" : String.join(";", moves);
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
