# SPOILER: reference solution, used to compute expected outputs and to prove that tests can be passed.
import sys

data = sys.stdin.read().split()
n = int(data[0])
temps = [int(t) for t in data[1:1 + n]]
print(min(temps, key=lambda t: (abs(t), -t)) if temps else 0)
