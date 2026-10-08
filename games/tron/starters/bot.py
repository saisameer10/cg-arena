import sys

# Tron Battle starter. Debug with print(..., file=sys.stderr); it shows in the console panel.
W, H = 30, 20
grid = [[False] * W for _ in range(H)]   # True = wall

while True:
    n, p = [int(i) for i in input().split()]
    heads = []
    for i in range(n):
        x0, y0, x1, y1 = [int(j) for j in input().split()]
        heads.append((x1, y1))
        if x0 != -1:
            grid[y0][x0] = True
            grid[y1][x1] = True

    mx, my = heads[p]
    move = "UP"
    for name, dx, dy in (("UP", 0, -1), ("RIGHT", 1, 0), ("DOWN", 0, 1), ("LEFT", -1, 0)):
        nx, ny = mx + dx, my + dy
        if 0 <= nx < W and 0 <= ny < H and not grid[ny][nx]:
            move = name
            break
    print(f"turn head=({mx},{my}) -> {move}", file=sys.stderr)
    print(move)
