#include <iostream>
#include <utility>
#include <vector>

// Ultimate Tic-Tac-Toe starter. Debug with cerr; it shows in the console panel.
// Rows and columns go from 0 to 8 (0 to 2 in the Wood league). Player 0 moves first.
int main() {
    int opponentRow, opponentCol;
    while (std::cin >> opponentRow >> opponentCol) {   // -1 -1 on your first turn if you start
        int validActionCount;
        std::cin >> validActionCount;
        std::vector<std::pair<int, int>> actions(validActionCount);
        for (int i = 0; i < validActionCount; i++) std::cin >> actions[i].first >> actions[i].second;

        // The list is shuffled every turn, so the first action is a random legal move. Replace this with your logic.
        int row = actions[0].first, col = actions[0].second;
        std::cerr << "opponent played " << opponentRow << " " << opponentCol << ", " << validActionCount << " valid actions" << std::endl;
        std::cout << row << " " << col << std::endl;
    }
}
