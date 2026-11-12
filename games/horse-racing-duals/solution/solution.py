# SPOILER: reference solution of Horse-racing Duals, used to validate the tests
# (node cli.js horse-racing-duals games/horse-racing-duals/solution/solution.py --test all --random 20).
import sys

data = sys.stdin.read().split()
n = int(data[0])
p = sorted(map(int, data[1:1 + n]))
print(min(p[i] - p[i - 1] for i in range(1, n)))
