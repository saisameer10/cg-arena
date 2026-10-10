import java.util.*;

// Ocean of Code starter. The class must be named Player. Debug with System.err.println.
class Player {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int width = in.nextInt(), height = in.nextInt(), myId = in.nextInt();
        in.nextLine();
        String[] grid = new String[height];
        for (int i = 0; i < height; i++) grid[i] = in.nextLine();
        String[] dirs = {"N", "S", "E", "W"};
        int[] dx = {0, 0, 1, -1}, dy = {-1, 1, 0, 0};
        Set<Integer> visited = new HashSet<>();

        int sx = 0, sy = 0;
        outer:
        for (int y = 0; y < height; y++) for (int x = 0; x < width; x++) if (grid[y].charAt(x) == '.') { sx = x; sy = y; break outer; }
        visited.add(sx + sy * width);
        // Warm up string concatenation and System.err inside the 1000 ms first turn, so the first
        // 50 ms round does not pay the JVM's one-time initialisation costs.
        System.err.println("start (" + sx + "," + sy + ") league devices visible next turn; warm=" + ("MOVE " + dirs[0] + " TORPEDO").length());
        System.out.println(sx + " " + sy);

        while (in.hasNextInt()) {
            int x = in.nextInt(), y = in.nextInt(), myLife = in.nextInt(), oppLife = in.nextInt();
            int torpedoCd = in.nextInt(), sonarCd = in.nextInt(), silenceCd = in.nextInt(), mineCd = in.nextInt();
            in.nextLine();
            String sonarResult = in.nextLine();
            String opponentOrders = in.nextLine();
            System.err.println("me=(" + x + "," + y + ") life=" + myLife + " opp=" + oppLife + " oppOrders=" + opponentOrders);

            String order = null;
            for (int d = 0; d < 4; d++) {
                int nx = x + dx[d], ny = y + dy[d];
                boolean water = nx >= 0 && ny >= 0 && nx < width && ny < height && grid[ny].charAt(nx) == '.';
                if (water && !visited.contains(nx + ny * width)) { visited.add(nx + ny * width); order = "MOVE " + dirs[d] + " TORPEDO"; break; }
            }
            if (order == null) { visited.clear(); visited.add(x + y * width); order = "SURFACE"; }
            System.out.println(order);
        }
    }
}
