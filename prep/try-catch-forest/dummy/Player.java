import java.util.*;

/**
 * Placeholder: reads the input of every turn and answers WAIT, so no agent ever moves or uses a power.
 * It holds none of the real bot's logic and is safe to leave in the IDE or to show on screen.
 */
class Player {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int myId = in.nextInt();
        int mapRadius = in.nextInt();
        int treeCount = in.nextInt();
        for (int i = 0; i < treeCount; i++) {
            int treeId = in.nextInt();
            int treeX = in.nextInt();
            int treeY = in.nextInt();
            int treeRadius = in.nextInt();
        }

        // game loop
        while (true) {
            int myScore = in.nextInt();
            int nets = in.nextInt();
            int smokes = in.nextInt();
            int decoys = in.nextInt();
            int entityCount = in.nextInt();
            for (int i = 0; i < entityCount; i++) {
                int entityId = in.nextInt();
                String entityType = in.next();
                int owner = in.nextInt();
                int x = in.nextInt();
                int y = in.nextInt();
                int dx = in.nextInt();
                int dy = in.nextInt();
                int ghost = in.nextInt();
                int turnsRemaining = in.nextInt();
                int fatigue = in.nextInt();
                int immobilizedTurns = in.nextInt();
            }

            System.out.println("WAIT");
        }
    }
}
