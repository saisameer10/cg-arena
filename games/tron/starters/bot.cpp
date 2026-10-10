#include <iostream>
#include <string>
#include <vector>

// Tron Battle starter. Debug with cerr; it shows in the console panel.
int main() {
    const int W = 30, H = 20;
    std::vector<std::vector<bool>> grid(H, std::vector<bool>(W, false));   // true = wall
    const char* names[4] = {"UP", "RIGHT", "DOWN", "LEFT"};
    const int dx[4] = {0, 1, 0, -1}, dy[4] = {-1, 0, 1, 0};
    int n, p;
    while (std::cin >> n >> p) {
        int mx = 0, my = 0;
        for (int i = 0; i < n; i++) {
            int x0, y0, x1, y1;
            std::cin >> x0 >> y0 >> x1 >> y1;
            if (x0 != -1) { grid[y0][x0] = true; grid[y1][x1] = true; }
            if (i == p) { mx = x1; my = y1; }
        }
        std::string move = "UP";
        for (int d = 0; d < 4; d++) {
            int nx = mx + dx[d], ny = my + dy[d];
            if (nx >= 0 && nx < W && ny >= 0 && ny < H && !grid[ny][nx]) { move = names[d]; break; }
        }
        std::cerr << "head=(" << mx << "," << my << ") -> " << move << std::endl;
        std::cout << move << std::endl;
    }
}
