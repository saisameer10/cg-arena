# Ocean of Code

Based on the board game *Captain Sonar*. You pilot a submarine and know an enemy is nearby because you hear all its radio orders. You don't see where it is, but you can deduce it. Both subs have **6 hit points**; a player at **0** loses.

This referee is a port of the official CodinGame referee (<https://github.com/CodinGameCommunity/ocean-of-code>): same map generator for a given seed, same league rules, same validation order and error messages.

## Leagues

| League | Available |
|---|---|
| Wood 2 | `MOVE`, `SURFACE`, `TORPEDO` |
| Wood 1 | + `SONAR`, `SILENCE` |
| Bronze and above | + `MINE`, `TRIGGER` |

Devices not in your league report a cooldown of `-1`. Charging or using one is an invalid command and you lose.

## Rules

- The map is **15 × 15**. `(0,0)` is top left. `x` is an island, `.` is water. Subs move only on water and may share a cell.
- **9 sectors** of 5 × 5 cells, numbered 1 (top left) to 9 (bottom right), row by row.
- Player 0 plays first. Players alternate. On your turn you learn the opponent's orders of its last turn, then you act.
- Each player has **300 turns including the initial placement** (299 rounds each). At the end, more lives wins; equal is a draw.
- CodinGame's engine also stops after **999 executed actions in total** (one frame per action, the placements count as one). A bot that chains 3 orders every turn therefore gets about 166 rounds, not 299. This referee enforces the same cap.

### Actions
Chain several with `|`. Each type at most once per turn, executed in the order written.

| Order | Effect | Charges needed | Opponent sees |
|---|---|---|---|
| `MOVE dir [POWER]` | Move 1 cell N/S/E/W and add one charge to POWER (TORPEDO, SONAR, SILENCE or MINE) | – | `MOVE dir` |
| `SURFACE` | Clear your visited path, lose 1 life | – | `SURFACE sector` |
| `TORPEDO x y` | Explode on a water cell within 4 cells by a water path. 2 damage on the cell, 1 on the 8 neighbours. Can hurt you. | 3 | `TORPEDO x y` |
| `SONAR sector` | Next turn you learn `Y`/`N`: was the enemy in that sector when you fired it | 4 | `SONAR sector` |
| `SILENCE dir dist` | Move 0–4 cells; crossed cells become visited | 6 | `SILENCE` |
| `MINE dir` | Drop a mine on the adjacent water cell. It is armed from your **next** turn on | 3 | `MINE` |
| `TRIGGER x y` | Explode one of your armed mines, same damage as a torpedo | – | `TRIGGER x y` |
| `MSG text` | Shown in the viewer | – | – |

You cannot move through islands, off the map, or onto a cell you already visited since your last `SURFACE` (that includes `SILENCE` steps).

### What happens on a bad order (exactly as on CodinGame)

**You lose immediately** (score -1) on: an unknown command, the same command twice in a turn, wrong parameter count or format, an invalid direction, charging a power you don't have, a `MOVE` or `SILENCE` into an island / off the map / onto a visited cell, an invalid start position, or a timeout.

**The order is silently skipped** (a note appears in the game log) on: a device that is not fully charged, a torpedo out of range or at an island, a mine on an island / off the map / on one of your mines, a `TRIGGER` with no armed mine there. If nothing valid is left in your turn, **you `SURFACE` instead** and lose a life.

## Protocol

**Initialization input**: line 1 `width height myId`; then `height` lines of the map.

**First turn output**: `x y`, your start cell (water; the opponent may pick the same cell).

**Each turn input**
1. `x y myLife oppLife torpedoCooldown sonarCooldown silenceCooldown mineCooldown` (cooldown 0 = ready, -1 = not in your league)
2. `sonarResult`: `Y`, `N` or `NA`
3. `opponentOrders`: e.g. `MOVE N|TORPEDO 3 5`, or `NA`

**Each turn output**: one line, orders separated by `|`.

## Constraints
- Response time first turn ≤ 1000 ms, then ≤ 50 ms.

## Tips
- Keep the set of cells the enemy could be in. Shrink it on every `MOVE` (shift and drop islands), `SURFACE` (sector), `TORPEDO` (within range of its target), your `SONAR` answers, and the damage your shots did or didn't do.
- Flood-fill unvisited cells before moving so you don't trap yourself.
- Never torpedo a cell next to yourself unless the trade is worth it.
