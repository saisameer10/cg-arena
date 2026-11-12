#include <iostream>
#include <string>

// Shadows of the Knight - Episode 1 starter. Debug with cerr.
int main() {
    int W, H;  // width and height of the building, in windows
    std::cin >> W >> H;
    int N;  // number of jumps before the bombs go off
    std::cin >> N;
    int X0, Y0;  // Batman's starting window; (0,0) is the top-left window
    std::cin >> X0 >> Y0;
    std::string bombDir;  // where the bombs are: U, UR, R, DR, D, DL, L or UL
    while (std::cin >> bombDir) {
        std::cerr << "building " << W << "x" << H << ", " << N << " jumps, bombs " << bombDir << std::endl;
        std::cout << "0 0" << std::endl;  // the next window Batman jumps to: "X Y"
    }
}
