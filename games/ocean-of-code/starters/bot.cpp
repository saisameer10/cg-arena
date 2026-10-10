#include <iostream>
#include <set>
#include <string>
#include <vector>

// Ocean of Code starter (same protocol as CodinGame). Debug with cerr.
int width, height, myId;
std::vector<std::string> grid;

bool water(int x, int y) {
    return x >= 0 && x < width && y >= 0 && y < height && grid[y][x] == '.';
}

int main() {
    std::cin >> width >> height >> myId; std::cin.ignore();
    for (int i = 0; i < height; i++) { std::string line; std::getline(std::cin, line); grid.push_back(line); }
    const char dirs[4] = {'N', 'S', 'E', 'W'};
    const int dx[4] = {0, 0, 1, -1}, dy[4] = {-1, 1, 0, 0};
    std::set<int> visited;

    int sx = 0, sy = 0;
    for (int y = 0; y < height && !water(sx, sy); y++)
        for (int x = 0; x < width; x++) if (water(x, y)) { sx = x; sy = y; break; }
    visited.insert(sx + sy * width);
    std::cout << sx << " " << sy << std::endl;

    int x, y, myLife, oppLife, torpedoCd, sonarCd, silenceCd, mineCd;
    while (std::cin >> x >> y >> myLife >> oppLife >> torpedoCd >> sonarCd >> silenceCd >> mineCd) {
        std::cin.ignore();
        std::string sonarResult, opponentOrders;
        std::getline(std::cin, sonarResult);
        std::getline(std::cin, opponentOrders);
        std::cerr << "me=(" << x << "," << y << ") life=" << myLife << " opp=" << oppLife << " oppOrders=" << opponentOrders << std::endl;

        std::string order;
        for (int d = 0; d < 4 && order.empty(); d++) {
            int nx = x + dx[d], ny = y + dy[d];
            if (water(nx, ny) && !visited.count(nx + ny * width)) {
                visited.insert(nx + ny * width);
                order = std::string("MOVE ") + dirs[d] + " TORPEDO";
            }
        }
        if (order.empty()) { visited.clear(); visited.insert(x + y * width); order = "SURFACE"; }
        std::cout << order << std::endl;
    }
}
