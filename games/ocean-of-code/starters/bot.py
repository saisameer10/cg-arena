import sys

# Ocean of Code starter (same protocol as CodinGame). Debug with print(..., file=sys.stderr).
width, height, my_id = [int(i) for i in input().split()]
grid = [input() for _ in range(height)]
DIRS = {"N": (0, -1), "S": (0, 1), "E": (1, 0), "W": (-1, 0)}


def water(x, y):
    return 0 <= x < width and 0 <= y < height and grid[y][x] == "."


# pick the first water cell as a starting position
start = next((x, y) for y in range(height) for x in range(width) if water(x, y))
visited = {start}
print(f"{start[0]} {start[1]}")

while True:
    x, y, my_life, opp_life, torpedo_cd, sonar_cd, silence_cd, mine_cd = [int(i) for i in input().split()]
    sonar_result = input()
    opponent_orders = input()
    print(f"me=({x},{y}) life={my_life} opp={opp_life} torpedo_cd={torpedo_cd} opp_orders={opponent_orders}", file=sys.stderr)

    orders = []
    for d, (dx, dy) in DIRS.items():
        nx, ny = x + dx, y + dy
        if water(nx, ny) and (nx, ny) not in visited:
            visited.add((nx, ny))
            orders.append(f"MOVE {d} TORPEDO")
            break
    else:
        visited = {(x, y)}
        orders.append("SURFACE")
    print("|".join(orders))
