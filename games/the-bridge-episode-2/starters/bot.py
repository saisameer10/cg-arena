import sys

# The Bridge - Episode 2 starter. Debug with print(..., file=sys.stderr).
m = int(input())  # number of motorbikes
v = int(input())  # minimum number of motorbikes that must survive
lanes = [input() for _ in range(4)]  # '.' safe, '0' hole; lane 0 is the top

while True:
    s = int(input())  # speed
    bikes = []
    for _ in range(m):
        x, y, a = [int(j) for j in input().split()]  # a = 1 running, 0 lost
        bikes.append((x, y, a))
    print(f"speed={s} bikes={bikes}", file=sys.stderr)
    print("SPEED")  # SPEED, SLOW, JUMP, WAIT, UP or DOWN
