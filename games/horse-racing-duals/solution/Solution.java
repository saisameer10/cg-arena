// SPOILER: reference solution of Horse-racing Duals, used to validate the tests
// (node cli.js horse-racing-duals games/horse-racing-duals/solution/Solution.java --test all --random 20).
import java.io.*;
import java.util.*;

class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        int[] p = new int[n];
        for (int i = 0; i < n; i++) p[i] = Integer.parseInt(in.readLine().trim());
        Arrays.sort(p);
        int best = Integer.MAX_VALUE;
        for (int i = 1; i < n; i++) best = Math.min(best, p[i] - p[i - 1]);
        System.out.println(best);
    }
}
