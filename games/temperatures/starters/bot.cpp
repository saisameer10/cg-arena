#include <iostream>
#include <vector>

int main() {
    int n;  // the number of temperatures to analyse
    std::cin >> n;
    std::vector<int> temps(n);
    for (int i = 0; i < n; i++) std::cin >> temps[i];
    std::cerr << "n=" << n << std::endl;  // debug goes to stderr
    std::cout << "result" << std::endl;
}
