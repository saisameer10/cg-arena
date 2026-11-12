# Temperatures (classic puzzle)

Classic input/output puzzle ([CodinGame page](https://www.codingame.com/ide/puzzle/temperatures)), summarised in our own words. It is here as the reference example of the **io** challenge type: the arena needs only test files, no referee code.

Print the temperature closest to 0 from a list. When a positive and a negative value are equally close, print the positive one. When the list is empty, print 0.

## Protocol

**Input**
1. `N`: number of temperatures (0 ≤ N < 10000)
2. `N` integers separated by spaces, each between −273 and 5526 (the line is empty when N = 0)

**Output**: one line, the temperature closest to 0.

## Tests here vs on CodinGame

The test files in `games/temperatures/tests/` are our own. Your program gets the whole input, then end of file, and its output lines are compared with the expected ones. The Review tab shows the first wrong line.
