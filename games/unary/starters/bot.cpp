#include <iostream>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> lines;
    for (std::string l; std::getline(std::cin, l);) lines.push_back(l);
    std::cerr << "read " << lines.size() << " lines" << std::endl;
    std::cout << "answer" << std::endl;  // TODO
}
