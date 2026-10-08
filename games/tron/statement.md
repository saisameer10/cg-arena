# Tron Battle

Two light cycles race on a **30 × 20** grid. Each turn every player moves one cell and leaves a permanent light wall behind. You lose when you drive off the grid or into any wall (your own trail included). When a player dies their wall is removed from the grid.

## Protocol

**Input, every turn**

- Line 1: `N P` — number of players and your index (0 or 1).
- Next `N` lines: `X0 Y0 X1 Y1` — start and current position of each player (in player order). A dead player is `-1 -1 -1 -1`.

**Output, every turn**

- One line: `UP`, `DOWN`, `LEFT` or `RIGHT`.

## Constraints

- First turn ≤ 1000 ms, then ≤ 100 ms per turn.
- Players move sequentially inside a turn: player 1 already sees player 0's new position.
- Invalid output eliminates you.

## Tips

- Keep a grid of occupied cells; you see every cell because you get every head position each turn.
- Count the area reachable from each move (flood fill). Pick the biggest. That beats Boss Wood.
- Compare who reaches each cell first (Voronoi territory) to beat Boss Bronze and Silver.
