import java.util.*;
import java.io.*;

// Named Solution, as on CodinGame's classic puzzles (the arena also accepts Player).
// Debug with System.err.println.
class Solution {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt(); // the number of horses
        int[] strengths = new int[n];
        for (int i = 0; i < n; i++) strengths[i] = in.nextInt(); // one strength per line
        System.err.println("n=" + n);
        System.out.println("answer");
    }
}
