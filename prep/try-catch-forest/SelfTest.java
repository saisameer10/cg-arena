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

        // decide(): a hunter next to prey hunts and nets; a unit next to a predator flees and smokes
        Player.myId = 0; Player.unitsPerPlayer = 2; Player.turn = 5; Player.netLeft = 1; Player.smokeLeft = 1;
        Player.obstacles = new ArrayList<>(); Player.units.clear();
        add(0, 0, 0, 0); add(1, 0, 5000, 5000);
        add(2, 1, 1500, 0);              // prey of player 0, near unit 0
        add(4, 2, 5000, 4200);           // predator of player 0, near unit 1
        String out = Player.decide();
        check("unit 0 hunts: " + out, out.contains("MOVE 0") && out.contains("HUNT") && out.contains("NET 0 1500 0"));
        check("unit 1 flees and smokes", out.contains("MOVE 1") && out.contains("FLEE") && out.contains("SMOKE 1"));
        check("one line, commands joined by ';'", !out.contains("\n") && out.split(";").length == 4);

        System.out.println((n - fails) + "/" + n + " checks passed");
        System.exit(fails == 0 ? 0 : 1);
    }
    static void add(int id, int owner, double x, double y) {
        Player.Unit u = new Player.Unit(id, owner, new Player.V(x, y)); u.lastSeen = Player.turn; Player.units.put(id, u);
    }
}
