import java.util.*;

/** Checks the geometry and decision helpers of Player.java. Run: javac Player.java SelfTest.java && java SelfTest */
class SelfTest {
    static int fails = 0, n = 0;
    static void check(String name, boolean ok) { n++; if (!ok) { fails++; System.out.println("FAIL " + name); } }

    public static void main(String[] a) {
        Player.V o = new Player.V(0, 0);
        List<Player.Circle> obs = new ArrayList<>();
        obs.add(new Player.Circle(new Player.V(1000, 0), 400));

        // rock-paper-scissors cycle as seen in the videos: 0 scissors, 1 paper, 2 rock
        check("scissors(0) hunt paper(1)", Player.preyOf(0) == 1 && Player.predatorOf(1) == 0);
        check("paper(1) hunts rock(2)", Player.preyOf(1) == 2 && Player.predatorOf(2) == 1);
        check("rock(2) hunts scissors(0)", Player.preyOf(2) == 0 && Player.predatorOf(0) == 2);

        // line of sight
        check("obstacle blocks sight", !Player.canSee(o, new Player.V(2000, 0), obs, null));
        check("free line is visible", Player.canSee(o, new Player.V(0, 2000), obs, null));
        check("out of range is not visible", !Player.canSee(o, new Player.V(0, Player.VISION + 1), obs, null));
        check("smoke blocks sight", !Player.canSee(o, new Player.V(0, 2000), obs, List.of(new Player.Circle(new Player.V(0, 1000), 300))));

        // steering: straight when free, around the obstacle when blocked, never through it
        Player.V target = new Player.V(2000, 0);
        check("free path goes straight", Player.steer(o, new Player.V(0, 2000), obs) .dist(new Player.V(0, 2000)) < 1e-6);
        Player.V way = Player.steer(o, target, obs);
        check("blocked path picks a waypoint off the line", Math.abs(way.y) > 300);
        check("the leg to the waypoint is free", Player.firstBlocking(o, way, obs, Player.UNIT_R) == null);
        // walk it: repeated steering reaches the target without touching the obstacle
        Player.V p = o; boolean touched = false; int steps = 0;
        while (p.dist(target) > Player.MOVE_SPEED && steps++ < 40) {
            Player.V w = Player.steer(p, target, obs);
            p = p.add(w.sub(p).norm().mul(Math.min(Player.MOVE_SPEED, p.dist(w))));
            if (p.dist(obs.get(0).c) < obs.get(0).r + Player.UNIT_R - 1) touched = true;
        }
        check("walking with steer reaches the target", p.dist(target) <= Player.MOVE_SPEED);
        check("walking with steer never touches the obstacle", !touched);
        check("reaches it in a sensible number of turns (" + steps + ")", steps <= 8);

        // arena clamp
        check("clamp keeps points inside", Player.clampToArena(new Player.V(20000, 0), 200).len() <= Player.ARENA_R - 200 + 1e-6);

        // fleeing: away from the predator, not into the wall, prefers cover
        Player.V me = new Player.V(0, 0);
        Player.V run = Player.flee(me, List.of(new Player.V(-800, 0)), new ArrayList<>(), 1000);
        check("flee moves away from the predator", run.x > 500);
        Player.V edge = new Player.V(Player.ARENA_R - 300, 0);
        Player.V run2 = Player.flee(edge, List.of(new Player.V(Player.ARENA_R - 1500, 0)), new ArrayList<>(), 1000);
        check("flee at the wall slides along it instead of stopping", run2.dist(edge) > 400);
        Player.V run3 = Player.flee(me, List.of(new Player.V(-1500, 0), new Player.V(1500, 0)), new ArrayList<>(), 1000);
        check("flee between two predators goes sideways", Math.abs(run3.y) > Math.abs(run3.x));

        // interception leads a moving prey
        Player.V aim = Player.intercept(o, new Player.V(2000, 0), new Player.V(0, 300), 500);
        check("intercept aims ahead of the prey", aim.y > 600);

        // decide(): a hunter with prey in net range hunts and nets; a unit next to a predator dashes away and smokes
        setup(1, 1);
        add(0, 0, 0, 0); add(1, 0, 5000, 5000);
        add(2, 1, 1900, 0);              // prey of player 0, in net range of unit 0 but outside its kill zone
        add(4, 2, 5000, 4200);           // predator of player 0, next to unit 1
        String out = Player.decide();
        check("unit 0 hunts and nets at full range through the prey: " + out, out.contains("MOVE 0") && out.contains("HUNT") && out.contains("NET 0 2000 0"));
        check("unit 1 dashes away and smokes", out.contains("DASH 1") && out.contains("FLEE") && out.contains("SMOKE 1"));
        check("one line, commands joined by ';'", !out.contains("\n") && out.split(";").length == 4);

        // the dash is kept for the catch, and it is not available on the next turn
        setup(1, 0);
        add(0, 0, 0, 0); add(2, 1, 1500, 0);
        out = Player.decide();
        check("prey inside the kill zone: dash to catch, no net: " + out, out.contains("DASH 0 1500 0 CATCH") && !out.contains("NET"));
        Player.turn++;
        out = Player.decide();
        check("no second dash on the following turn: " + out, out.startsWith("MOVE 0"));
        Player.turn++;
        out = Player.decide();
        check("dash again two turns later", out.startsWith("DASH 0"));

        // nets: not through a tree, not at point-blank range
        setup(1, 0);
        Player.obstacles.add(new Player.Circle(new Player.V(1000, 0), 300));
        add(0, 0, 0, 0); add(2, 1, 1900, 0);
        check("no net through a tree", !Player.decide().contains("NET"));
        setup(1, 0);
        add(0, 0, 0, 0); Player.units.get(0).lastDash = Player.turn; add(2, 1, 600, 0);
        check("no net at point-blank range", !Player.decide().contains("NET"));

        // a predator closing in with no smoke left gets the net
        setup(1, 0);
        add(0, 0, 0, 0); add(4, 2, 1500, 0);
        out = Player.decide();
        check("defensive net on the predator: " + out, out.contains("FLEE") && out.contains("NET 0 2000 0"));

        // two hunters, two prey: one each
        setup(0, 0);
        add(0, 0, 0, 0); add(1, 0, 0, 400); add(2, 1, 2500, 0); add(3, 1, 2500, 3000);
        out = Player.decide();
        String[] parts = out.split(";");
        check("hunters take different prey: " + out, parts.length == 2 && !parts[0].substring(7).equals(parts[1].substring(7)));

        System.out.println((n - fails) + "/" + n + " checks passed");
        System.exit(fails == 0 ? 0 : 1);
    }
    static void setup(int nets, int smokes) {
        Player.myId = 0; Player.unitsPerPlayer = 2; Player.turn = 5; Player.netLeft = nets; Player.smokeLeft = smokes;
        Player.obstacles = new ArrayList<>(); Player.units.clear();
    }
    static void add(int id, int owner, double x, double y) {
        Player.Unit u = new Player.Unit(id, owner, new Player.V(x, y)); u.lastSeen = Player.turn; Player.units.put(id, u);
    }
}
