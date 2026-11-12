#include <iostream>
#include <vector>

int main() {
    int n;  // the number of horses
    std::cin >> n;
    std::vector<int> strengths(n);
    for (int i = 0; i < n; i++) std::cin >> strengths[i];  // one strength per line
    std::cerr << "n=" << n << std::endl;  // debug goes to stderr
    std::cout << "answer" << std::endl;
}
