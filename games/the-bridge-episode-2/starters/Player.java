import java.util.*;

// The Bridge - Episode 2 starter. The class must be named Player. Debug with System.err.println.
class Player {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int M = in.nextInt(); // number of motorbikes
        int V = in.nextInt(); // minimum number of motorbikes that must survive
        String[] lanes = new String[4]; // '.' safe, '0' hole; lane 0 is the top
        for (int i = 0; i < 4; i++) lanes[i] = in.next();
        System.err.println("M=" + M + " V=" + V + " length=" + lanes[0].length()); // warms up System.err in the first turn

        while (in.hasNextInt()) {
            int S = in.nextInt(); // speed
            for (int i = 0; i < M; i++) {
                int X = in.nextInt(), Y = in.nextInt(), A = in.nextInt(); // A = 1 running, 0 lost
                System.err.println("bike " + i + ": x=" + X + " y=" + Y + " a=" + A + " speed=" + S);
            }
            System.out.println("SPEED"); // SPEED, SLOW, JUMP, WAIT, UP or DOWN
        }
    }
}
