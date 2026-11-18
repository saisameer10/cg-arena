import java.util.*;

/**
 * Stand-in for the league boss (Bronze/Silver). Built from what the boss did in 56 real test games (see
 * kb/offline.md, "boss stand-in"): it never dashes, smokes or decoys, it walks on 98 % of its turns, its labels are
 * Fleeing (away from a predator), Attacking (at the nearest prey), Trapping (a net at prey), Seeking (no prey in sight)
 * and Spreading (away from its own units). This is an approximation and is not the official boss code.
 */
class Player {
    static final double R = 8000, MOVE = 600, NET_RANGE = 2000;

    static double hyp(double a, double b) { return Math.sqrt(a * a + b * b); }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int myId = in.nextInt();
        int mapRadius = in.nextInt();
        int treeCount = in.nextInt();
        for (int i = 0; i < treeCount; i++) { in.nextInt(); in.nextInt(); in.nextInt(); in.nextInt(); }
        int turn = 0;
        while (true) {
            turn++;
            in.nextInt();                                        // score
            int nets = in.nextInt(), smokes = in.nextInt(), decoys = in.nextInt();
            int n = in.nextInt();
            List<double[]> mine = new ArrayList<>(), prey = new ArrayList<>(), pred = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                int id = in.nextInt(); String type = in.next(); int owner = in.nextInt();
                double x = in.nextInt(), y = in.nextInt();
                in.nextInt(); in.nextInt();                       // dx dy
                int ghost = in.nextInt(); in.nextInt(); in.nextInt(); in.nextInt();   // turnsRemaining, fatigue, immob
                if (!type.equals("UNIT") || ghost == 1) continue;
                if (owner == myId) mine.add(new double[]{id, x, y});
                else if (owner == (myId + 1) % 3) prey.add(new double[]{id, x, y});
                else if (owner == (myId + 2) % 3) pred.add(new double[]{id, x, y});
            }
            List<String> out = new ArrayList<>();
            int netsLeft = nets;
            for (int k = 0; k < mine.size(); k++) {
                double[] u = mine.get(k);
                double[] np = nearest(u, pred), nq = nearest(u, prey);
                double[] own = nearest(u, mine.subList(0, mine.size()).stream().filter(o -> o[0] != u[0]).toArray(double[][]::new));
                String cmd, label;
                if (np != null && hyp(np[1] - u[1], np[2] - u[2]) < 1400) {
                    double dx = u[1] - np[1], dy = u[2] - np[2], l = Math.max(1, hyp(dx, dy));
                    cmd = target(u, dx / l, dy / l); label = "Fleeing";
                } else if (nq != null && hyp(nq[1] - u[1], nq[2] - u[2]) < 2600) {
                    double dd = hyp(nq[1] - u[1], nq[2] - u[2]);
                    if (netsLeft > 0 && dd < NET_RANGE && dd > 500 && turn % 3 == 0) {
                        double l = Math.max(1, dd);
                        out.add("NET " + (long) u[0] + " " + Math.round(nq[1]) + " " + Math.round(nq[2]) + " Trapping");
                        netsLeft--;
                    }
                    cmd = "MOVE " + (long) u[0] + " " + Math.round(nq[1]) + " " + Math.round(nq[2]); label = "Attacking";
                    out.add(0, cmd + " " + label);
                    continue;
                } else if (own != null && hyp(own[1] - u[1], own[2] - u[2]) < 600) {
                    double dx = u[1] - own[1], dy = u[2] - own[2], l = Math.max(1, hyp(dx, dy));
                    cmd = target(u, dx / l, dy / l); label = "Spreading";
                } else {
                    double a = (k * 2 * Math.PI / Math.max(1, mine.size())) + turn * 0.05;
                    cmd = "MOVE " + (long) u[0] + " " + Math.round(Math.cos(a) * 5000) + " " + Math.round(Math.sin(a) * 5000); label = "Seeking";
                }
                out.add(cmd + " " + label);
            }
            System.out.println(out.isEmpty() ? "WAIT" : String.join(";", out));
            System.out.flush();
        }
    }

    static double[] nearest(double[] u, List<double[]> list) {
        double[] best = null; double bd = 1e18;
        for (double[] q : list) { double d = hyp(q[1] - u[1], q[2] - u[2]); if (d < bd) { bd = d; best = q; } }
        return best;
    }
    static double[] nearest(double[] u, double[][] list) {
        double[] best = null; double bd = 1e18;
        for (double[] q : list) { double d = hyp(q[1] - u[1], q[2] - u[2]); if (d < bd) { bd = d; best = q; } }
        return best;
    }
    /** A MOVE of 600 in direction (ux, uy), kept inside the arena. */
    static String target(double[] u, double ux, double uy) {
        double tx = u[1] + ux * MOVE, ty = u[2] + uy * MOVE, l = hyp(tx, ty);
        if (l > R - 300) { tx *= (R - 300) / l; ty *= (R - 300) / l; }
        return "MOVE " + (long) u[0] + " " + Math.round(tx) + " " + Math.round(ty);
    }
}
