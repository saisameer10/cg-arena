#include <iostream>
#include <string>

// The Bridge - Episode 2 starter. Debug with cerr.
int main() {
    int M, V;
    std::cin >> M >> V;  // number of motorbikes, minimum that must survive
    std::string lanes[4];  // '.' safe, '0' hole; lane 0 is the top
    for (int i = 0; i < 4; i++) std::cin >> lanes[i];
    int S;
    while (std::cin >> S) {  // speed
        for (int i = 0; i < M; i++) {
            int X, Y, A;  // A = 1 running, 0 lost
            std::cin >> X >> Y >> A;
            std::cerr << "bike " << i << ": x=" << X << " y=" << Y << " a=" << A << " speed=" << S << std::endl;
        }
        std::cout << "SPEED" << std::endl;  // SPEED, SLOW, JUMP, WAIT, UP or DOWN
    }
}
