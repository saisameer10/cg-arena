import java.util.*;

// Ultimate Tic-Tac-Toe starter. The class must be named Player. Debug with System.err.println.
// Rows and columns go from 0 to 8 (0 to 2 in the Wood league). Player 0 moves first.
class Player {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        while (in.hasNextInt()) {
            int opponentRow = in.nextInt();   // -1 -1 on your first turn if you start
            int opponentCol = in.nextInt();
            int validActionCount = in.nextInt();
            int[][] actions = new int[validActionCount][2];
            for (int i = 0; i < validActionCount; i++) {
                actions[i][0] = in.nextInt();
                actions[i][1] = in.nextInt();
            }

            // The list is shuffled every turn, so the first action is a random legal move. Replace this with your logic.
            int row = actions[0][0], col = actions[0][1];
            System.err.println("opponent played " + opponentRow + " " + opponentCol + ", " + validActionCount + " valid actions");
            System.out.println(row + " " + col);
        }
    }
}
