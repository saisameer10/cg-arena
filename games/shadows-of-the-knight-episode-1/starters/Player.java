import java.util.*;

// Shadows of the Knight - Episode 1 starter. The class must be named Player. Debug with System.err.println.
class Player {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int W = in.nextInt(); // width of the building, in windows
        int H = in.nextInt(); // height of the building, in windows
        int N = in.nextInt(); // number of jumps before the bombs go off
        int X0 = in.nextInt(); // Batman's starting window; (0,0) is the top-left window
        int Y0 = in.nextInt();
        System.err.println("building " + W + "x" + H + ", " + N + " jumps, batman (" + X0 + "," + Y0 + ")"); // warms up System.err in the first turn

        while (in.hasNext()) {
            String bombDir = in.next(); // where the bombs are: U, UR, R, DR, D, DL, L or UL
            System.err.println("bombs " + bombDir);

            System.out.println("0 0"); // the next window Batman jumps to: "X Y"
        }
    }
}
