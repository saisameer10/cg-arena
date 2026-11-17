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

        // decide(): a hunter nets prey it cannot reach yet, from where it will stand after its move;
        // a unit with a dash-ready predator inside strike distance dashes away and smokes the spot it runs to
        setup(1, 1);
        add(0, 0, 0, 0); add(1, 0, 3000, 3000);
        add(2, 1, 1900, 0);              // prey of player 0: too far to strike, close enough to net
        add(4, 2, 3000, 2200);           // predator of player 0, 800 from unit 1
        String out = Player.decide();
        check("unit 0 walks in and nets from its new position: " + out, out.contains("MOVE 0") && out.contains("HUNT") && out.contains("NET 0 2600 0"));
        check("unit 1 dashes away and smokes where it lands", out.contains("DASH 1") && out.contains("FLEE") && out.contains("SMOKE 1 3000 4200"));
        check("one line, commands joined by ';'", !out.contains("\n") && out.split(";").length == 4);

        // strike distance: a dash catches a walking unit from 950, not from 1500
        setup(0, 0);
        add(0, 0, 0, 0); add(2, 1, 900, 0);
        out = Player.decide();
        check("prey at 900: dash to catch: " + out, out.equals("DASH 0 900 0 CATCH"));
        Player.turn++;
        check("no second dash on the following turn", Player.decide().startsWith("MOVE 0"));
        Player.turn++;
        check("dash again two turns later", Player.decide().startsWith("DASH 0"));
        setup(0, 0);
        add(0, 0, 0, 0); add(2, 1, 1500, 0);
        check("prey at 1500: keep the dash, walk", Player.decide().startsWith("MOVE 0"));
        setup(0, 0);
        add(0, 0, 0, 0); add(2, 1, 1500, 0); Player.units.get(2).nettedUntil = Player.turn + 3;
        check("netted prey at 1500: dash onto it", Player.decide().equals("DASH 0 1500 0 CATCH"));

        // nets: only at prey that cannot dodge or is close, never through a tree, never into smoke
        setup(1, 0);
        add(0, 0, 0, 0); add(2, 1, 2400, 0);
        check("prey at 2400 with its dash ready: no net yet", !Player.decide().contains("NET"));
        setup(1, 0);
        add(0, 0, 0, 0); add(2, 1, 2400, 0); Player.units.get(2).lastDash = Player.turn - 1;
        check("same prey with its dash on cooldown: net", Player.decide().contains("NET 0 2600 0"));
        setup(1, 0);
        Player.obstacles.add(new Player.Circle(new Player.V(1250, 300), 250));
        add(0, 0, 0, 0); add(2, 1, 1900, 600); Player.units.get(2).lastDash = Player.turn - 1;
        out = Player.decide();
        check("no net through a tree: " + out, !out.contains("NET"));
        setup(1, 0);
        Player.smokes.add(new Player.Circle(new Player.V(1900, 0), Player.SMOKE_R));
        add(0, 0, 0, 0); add(2, 1, 1900, 0);
        check("no net into smoke", !Player.decide().contains("NET"));

        setup(1, 0); Player.turn = 0;
        add(0, 0, 0, 0); add(2, 1, 1900, 0);
        check("no net on the first turn", !Player.decide().contains("NET"));

        // fleeing: dash parity
        setup(0, 0);
        add(0, 0, 0, 0); add(4, 2, 900, 0); Player.units.get(4).lastDash = Player.turn - 1;
        out = Player.decide();
        check("hunter without dash at 900: walk away, keep the dash: " + out, out.startsWith("MOVE 0") && out.contains("FLEE"));
        setup(0, 0);
        add(0, 0, 0, 0); add(4, 2, 900, 0);
        check("hunter with dash at 900: dash away", Player.decide().startsWith("DASH 0"));
        setup(0, 0);
        add(0, 0, 0, 0); add(4, 2, 1500, 0);
        check("hunter with dash at 1500: walking away is enough", Player.decide().startsWith("MOVE 0"));
        setup(1, 0);
        add(0, 0, 0, 0); add(4, 2, 1300, 0); Player.units.get(4).lastDash = Player.turn - 1;
        out = Player.decide();
        check("no smoke left, hunter cannot dodge: net it while fleeing: " + out, out.contains("FLEE") && out.contains("NET 0"));
        setup(0, 2);
        Player.smokes.add(new Player.Circle(new Player.V(-600, 0), Player.SMOKE_R));
        add(0, 0, 0, 0); add(4, 2, 1500, 0);
        check("already running into smoke: no second smoke", !Player.decide().contains("SMOKE"));

        // a unit held by a net cannot move but still protects itself
        setup(1, 1);
        add(0, 0, 0, 0); Player.units.get(0).nettedUntil = Player.turn + 2; add(4, 2, 1500, 0);
        out = Player.decide();
        check("held unit smokes itself: " + out, out.contains("MOVE 0 0 0 HELD") && out.contains("SMOKE 0 0 0") && !out.contains("NET"));
        setup(1, 0);
        add(0, 0, 0, 0); Player.units.get(0).nettedUntil = Player.turn + 2; add(4, 2, 1500, 0);
        check("held unit without smoke nets the hunter back", Player.decide().contains("NET 0 2000 0"));

        // hunters: one prey each when there are two, a pair when there is one
        setup(0, 0);
        add(0, 0, 0, 0); add(1, 0, 0, 400); add(2, 1, 2500, 0); add(3, 1, 2500, 3000);
        out = Player.decide();
        check("two prey, both hunted: " + out, out.split(";").length == 2 && out.contains("HUNT"));
        setup(0, 0);
        add(0, 0, 0, 0); add(1, 0, 0, 400); add(5, 0, 400, 0); add(2, 1, 2500, 0); add(3, 1, 2500, 6000);
        out = Player.decide();
        int toFar = 0; for (String c : out.split(";")) { String[] f = c.split(" "); if (Double.parseDouble(f[3]) > 700) toFar++; }
        check("three hunters, two prey: the third goes for the other prey: " + out, toFar == 1);

        // seen(): a jump longer than a walk marks a dash
        setup(0, 0);
        add(4, 2, 0, 0); Player.units.get(4).lastSeen = Player.turn - 1;
        Player.units.get(4).seen(new Player.V(1200, 0), Player.turn);
        check("an enemy that jumped 1200 has its dash on cooldown", !Player.units.get(4).dashReady(Player.turn) && Player.units.get(4).dashReady(Player.turn + 1));

        System.out.println((n - fails) + "/" + n + " checks passed");
        System.exit(fails == 0 ? 0 : 1);
    }
    static void setup(int nets, int smokes) {
        Player.myId = 0; Player.unitsPerPlayer = 2; Player.turn = 5; Player.netLeft = nets; Player.smokeLeft = smokes;
        Player.obstacles = new ArrayList<>(); Player.smokes = new ArrayList<>(); Player.units.clear();
    }
    static void add(int id, int owner, double x, double y) {
        Player.Unit u = new Player.Unit(id, owner, new Player.V(x, y)); u.lastSeen = Player.turn; Player.units.put(id, u);
    }
}
