#include <iostream>
#include <string>

// Try Catch Forest starter. Debug with cerr.
// You (myId) catch the units of player (myId + 1) % 3 and are caught by player (myId + 2) % 3.
int main() {
    int myId, mapRadius, treeCount;
    std::cin >> myId >> mapRadius >> treeCount;
    for (int i = 0; i < treeCount; i++) { int treeId, x, y, r; std::cin >> treeId >> x >> y >> r; }
    int myScore;
    while (std::cin >> myScore) {
        int nets, smokes, decoys, entityCount;
        std::cin >> nets >> smokes >> decoys >> entityCount;
        std::string out;
        for (int i = 0; i < entityCount; i++) {
            int id, owner, x, y, dx, dy, ghost, turnsRemaining, fatigue, immobilizedTurns; std::string type;
            std::cin >> id >> type >> owner >> x >> y >> dx >> dy >> ghost >> turnsRemaining >> fatigue >> immobilizedTurns;
            if (type == "UNIT" && owner == myId) {                 // every unit walks to the centre
                if (!out.empty()) out += ";";
                out += "MOVE " + std::to_string(id) + " 0 0";
            }
        }
        // MOVE | DASH | NET | SMOKE | DECOY <id> <x> <y>, joined by ';', or WAIT
        std::cout << (out.empty() ? "WAIT" : out) << std::endl;
    }
}
