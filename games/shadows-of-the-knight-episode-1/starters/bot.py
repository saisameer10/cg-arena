import sys

# Shadows of the Knight - Episode 1 starter. Debug with print(..., file=sys.stderr).
w, h = [int(i) for i in input().split()]  # width and height of the building, in windows
n = int(input())  # number of jumps before the bombs go off
x0, y0 = [int(i) for i in input().split()]  # Batman's starting window; (0,0) is the top-left window

while True:
    bomb_dir = input()  # where the bombs are from Batman's window: U, UR, R, DR, D, DL, L or UL
    print(f"building {w}x{h}, {n} jumps, batman ({x0},{y0}), bombs {bomb_dir}", file=sys.stderr)

    # the next window Batman jumps to: "X Y"
    print("0 0")
