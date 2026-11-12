import java.util.*;

// The class must be named Player. Debug with System.err.println.
class Player {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt(); // the number of temperatures to analyse
        int[] temps = new int[n];
        for (int i = 0; i < n; i++) temps[i] = in.nextInt();
        System.err.println("n=" + n);
        System.out.println("result");
    }
}
