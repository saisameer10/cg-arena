import java.util.*;

// Try Catch Forest starter. The class must be named Player. Debug with System.err.println.
// You (myId) catch the units of player (myId + 1) % 3 and are caught by player (myId + 2) % 3.
class Player {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int myId = in.nextInt();
        int mapRadius = in.nextInt();
        int treeCount = in.nextInt();
        for (int i = 0; i < treeCount; i++) {
            int treeId = in.nextInt(), treeX = in.nextInt(), treeY = in.nextInt(), treeRadius = in.nextInt();
        }
        while (true) {
            int myScore = in.nextInt();
            int nets = in.nextInt(), smokes = in.nextInt(), decoys = in.nextInt();
            int entityCount = in.nextInt();
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < entityCount; i++) {
                int id = in.nextInt();
                String type = in.next();
                int owner = in.nextInt(), x = in.nextInt(), y = in.nextInt(), dx = in.nextInt(), dy = in.nextInt();
                int ghost = in.nextInt(), turnsRemaining = in.nextInt(), fatigue = in.nextInt(), immobilizedTurns = in.nextInt();
                if (type.equals("UNIT") && owner == myId) {          // every unit walks to the centre
                    if (sb.length() > 0) sb.append(';');
                    sb.append("MOVE ").append(id).append(" 0 0");
                }
            }
            // MOVE | DASH | NET | SMOKE | DECOY <id> <x> <y>, joined by ';', or WAIT
            System.out.println(sb.length() > 0 ? sb.toString() : "WAIT");
        }
    }
}
