# Ocean of Code

Two submarines hunt each other on a **15 × 15** map with islands. You never see the enemy directly: you only see the orders they announce, and you must deduce where they are. First to drop the enemy to **0 life** wins. Each sub starts with **6 life**. After **300 turns each**, the sub with more life wins.

Turns alternate: player 0 acts, then player 1, and so on. Your turn's input tells you what the opponent just did.

## Map

- `.` water, `x` island. Sectors are numbered 1–9, left to right then top to bottom, each 5 × 5 cells.
- You may not enter islands or any cell you already visited since your last `SURFACE`.

## Protocol

**Initialization input**

- Line 1: `width height myId`
- Next `height` lines: the map rows.

**First turn output**: `x y` — your starting cell (must be water).

**Input, every following turn**

- Line 1: `x y myLife oppLife torpedoCooldown sonarCooldown silenceCooldown mineCooldown`
- Line 2: `sonarResult` — `Y`, `N` or `NA` (answer to the sonar you fired last turn)
- Line 3: `opponentOrders` — what the opponent announced, orders separated by `|`, or `NA`

**Output, every turn**: one line of orders separated by `|`, executed in the order written. Each order at most once per turn.

| Order | Effect | Cooldown | Opponent sees |
|---|---|---|---|
| `MOVE dir [device]` | Move 1 cell N/S/E/W and charge a device (TORPEDO, SONAR, SILENCE or MINE) by one | – | `MOVE dir` |
| `SURFACE` | Lose 1 life, clear your visited path | – | `SURFACE sector` |
| `TORPEDO x y` | Explode at a water cell within 4 cells (path through water): 2 damage at the cell, 1 on the 8 neighbours. Hits you too. | 3 | `TORPEDO x y` |
| `SONAR sector` | Next turn you learn whether the enemy is in that sector | 4 | `SONAR sector` |
| `SILENCE dir dist` | Move 0–4 cells silently; the cells become visited | 6 | `SILENCE` |
| `MINE dir` | Drop a mine on the adjacent water cell | 3 | `MINE` |
| `TRIGGER x y` | Explode one of your mines (same damage as a torpedo) | – | `TRIGGER x y` |
| `MSG text` | Shown in the viewer | – | nothing |

Cooldown values count down to 0 as you charge: a torpedo is ready when `torpedoCooldown` is `0`.

## Constraints

- First turn ≤ 1000 ms, then ≤ 50 ms per turn.
- An invalid order (into an island, uncharged device, out of range, …) makes you lose immediately. The reason is shown in the console.

## Tips

- Keep the set of cells the enemy could be in. Shrink it on every `MOVE` (shift and drop islands), `SURFACE` (sector), `TORPEDO` (within range of the target), and from your own `SONAR` answers and damage dealt.
- Flood-fill unvisited cells before each move so you don't trap yourself.
- Never torpedo a cell adjacent to yourself.
