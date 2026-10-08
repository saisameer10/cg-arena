import java.util.*;

// Tron Battle starter. The class must be named Player. Debug with System.err.println.
class Player {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int W = 30, H = 20;
        boolean[][] grid = new boolean[H][W];
        String[] names = {"UP", "RIGHT", "DOWN", "LEFT"};
        int[] dx = {0, 1, 0, -1}, dy = {-1, 0, 1, 0};
        while (in.hasNextInt()) {
            int n = in.nextInt(), p = in.nextInt();
            int mx = 0, my = 0;
            for (int i = 0; i < n; i++) {
                int x0 = in.nextInt(), y0 = in.nextInt(), x1 = in.nextInt(), y1 = in.nextInt();
                if (x0 != -1) { grid[y0][x0] = true; grid[y1][x1] = true; }
                if (i == p) { mx = x1; my = y1; }
            }
            String move = "UP";
            for (int d = 0; d < 4; d++) {
                int nx = mx + dx[d], ny = my + dy[d];
                if (nx >= 0 && nx < W && ny >= 0 && ny < H && !grid[ny][nx]) { move = names[d]; break; }
            }
            System.err.println("head=(" + mx + "," + my + ") -> " + move);
            System.out.println(move);
        }
    }
}
