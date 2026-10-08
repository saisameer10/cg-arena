# Challenge: Ocean of Code

Worked example of the hand-off format. This is what was used to build `games/ocean-of-code/`.

## Source

- Puzzle URL: <https://www.codingame.com/ide/puzzle/ocean-of-code>
- Official referee source: <https://github.com/CodinGameCommunity/ocean-of-code> (Java, linked from the statement's "Expert Rules")
- Target league / rule set: all leagues (Wood 2 = level 1, Wood 1 = level 2, Bronze+ = level 3), selectable in the arena
- Players: 2. Turn order: alternating, player 0 first

## Statement (verbatim, Wood 1 version as shown in the IDE on 2026-10-08)

> **Welcome to the Wood1 league!** In Wood 1, you can now use SONAR and SILENCE
>
> **The Goal.** This game is based on the board game Captain Sonar. You pilot a submarine and you know that an enemy is present near you because you are listening to its radio frequency communication. You don't know exactly where it is but you can hear all its orders. You and your opponent have 6 hit points. When a player's hit points reach 0, the player loses.
>
> **Rules — Definitions.** Submarines move on a map constituted of water and islands. They can only move on cells with water. They can share the same cell without colliding. The map is 15 cells in width and 15 cells in height. Coordinates start at (0,0) which is the top left cell of the map. The map is split in 9 sectors, which contain 25 cells each (5x5 blocks of cells). The top left sector is 1. The bottom right sector is 9.
>
> **Beginning of the game.** At the beginning of the game, you'll receive a map (15x15 cells) that indicates the position of islands. Islands are obstacles. You cannot move or fire through islands. Then, you will decide where you want to place your submarine by indicating a coordinate (x,y).
>
> **Each turn.** This is a turn based game which means that each player plays a turn one after the other. The player with the id 0 begins. During your turn, thankfully to your radio frequency analysis, you will receive an indication of what your opponent has done. For example, you can receive that it moved to the north. It's up to you to use this valuable information to detect where it is. Then, you must perform at least one action.
>
> **Actions.** Each turn you must perform at least one action. You can do several actions by chaining them using the pipe |. But you can use each type of action only once per turn (you can move one time per turn, no more). If you fail to output a valid action, you will SURFACE in that turn.
>
> **Move.** A move action moves your submarine 1 cell in a given direction (north, east, south, west) and charges a power of your choice. When you move, you must respect the following rules: You cannot move through islands. You cannot move on a cell you already visited before. You can decide, what to charge. Different devices require a different amount of charges to be ready. In this league you can charge the torpedo, the sonar and the silence mode.
>
> **Surface.** By using surface you will reset your path of visited cells so that you can freely move to a cell that you have previously visited. But surfacing has a major impact: your opponent will know in which sector you are surfacing and you lose 1 hit point.
>
> **Torpedo.** A torpedo requires 3 charge actions to be ready. When fully charged, the torpedo can be fired at an arbitrary water position within a range of 4 cells. This allows the torpedo's path to contain corners and go around islands, but not through them. The damage of the explosion is 2 on the cell itself and 1 on all neighbors (including diagonal ones). You can also damage yourself with a torpedo.
>
> **Sonar.** Sonar requires 4 charge actions to load. It allows you to check, if the opponent's submarine is in a given sector. You will get the response in your next turn. This is in respect to the time of issuing the command, not after the opponent moved.
>
> **Silence.** Silence requires 6 charge actions to load. This allows you to move 0 to 4 cells in a given direction (not visiting already visited cells or islands). Your opponent will not know in which direction or how far you've moved.
>
> | Your action | Shown to opponent | comment |
> |---|---|---|
> | MOVE N TORPEDO | MOVE N | The opponent will see the movement direction (in this case: north), but not which power is charged |
> | SURFACE | SURFACE 3 | The opponent will see, that you surfaced in sector 3 |
> | TORPEDO 3 5 | TORPEDO 3 5 | The opponent will see, that you fired a torpedo at the cell (3,5) |
> | SONAR 4 | SONAR 4 | The opponent will see, that you used a sonar on sector 4. You will receive the sonar result (Y/N for yes/no) in the next turn. |
> | SILENCE N 4 | SILENCE | The opponent will see, that you moved silently - but not where or how far |
>
> **Victory Conditions.** Have more lifes than your enemy at the end of the game. Each player has 300 turns including the initial placement.
>
> **Lose Conditions.** Output an invalid command or don't respond in time. Reach 0 lives. Intersect your own path, move into an island or out of the map.
>
> **Expert Rules.** The source code can be found here: https://github.com/CodinGameCommunity/ocean-of-code.

Bronze league additions (from the referee source, `MinePower.java` / `TriggerCommand.java`): `MINE direction` needs 3 charges and drops a mine on the adjacent water cell (not on an island, not on one of your existing mines); it is armed from your next turn. `TRIGGER x y` explodes one of your armed mines with torpedo damage. Opponent sees `MINE` and `TRIGGER x y`.

## Protocol (exact)

### Initialization input
| Line | Content |
|---|---|
| 1 | `width height myId` — 15 15, and your id (0 or 1). Player 0 begins. |
| 2..16 | map rows, `x` island, `.` water |

### Output for the first turn
| Line | Content |
|---|---|
| 1 | `x y` start position (water; the opponent can choose the same cell). Must match `^[0-9]{1,2} [0-9]{1,2}$` |

### Input for one game turn
| Line | Content |
|---|---|
| 1 | `x y myLife oppLife torpedoCooldown sonarCooldown silenceCooldown mineCooldown` (devices not in your league: -1) |
| 2 | `sonarResult`: `Y`, `N` or `NA` |
| 3 | `opponentOrders`: orders separated by `|`, e.g. `MOVE N|TORPEDO 3 5`; `NA` on the starting player's first turn |

### Output for one game turn
| Line | Content |
|---|---|
| 1 | one or more of `MOVE direction POWER`, `SURFACE`, `TORPEDO X Y`, `SONAR sector`, `SILENCE direction distance`, `MINE direction`, `TRIGGER X Y`, `MSG message`, separated by `|` |

### Limits
- Response time first turn: 1000 ms; per turn: 50 ms
- Max turns: 598 rounds (299 each) after placement; referee constant `maxTurns = 598`
- Victory: more lives at the end; score = lives; disabled player scores -1
- Invalid output: see "Ambiguities" below for the exact rule

## Starter code (from the IDE)

```python
width, height, my_id = [int(i) for i in input().split()]
for i in range(height):
    line = input()
print("7 7")
while True:
    x, y, my_life, opp_life, torpedo_cooldown, sonar_cooldown, silence_cooldown, mine_cooldown = [int(i) for i in input().split()]
    sonar_result = input()
    opponent_orders = input()
    print("MOVE N TORPEDO")
```

## Bosses wanted

| Level | What it should do |
|---|---|
| wood | random legal patrol, charges torpedo, fires only when almost certain |
| bronze | track the enemy's possible cells from its orders and sonar answers, shoot when the cloud is small |
| silver | bronze + silence to escape, mines behind it, smarter start cell |

## Viewer

Map with islands and sector numbers, both subs with trails, mines (dashed until armed), explosions, lives, cooldowns, last orders and sonar result.

## Examples / maps / seeds

Maps come from `java.util.Random(seed)`; the arena ports it, so a seed from a CodinGame replay reproduces the same map.

## Ambiguities (resolved from the referee source)

- **Invalid actions** — two behaviours. *Lose immediately*: unknown command, duplicate command type, wrong parameter count, bad direction, charging an unavailable power, `MOVE`/`SILENCE` onto island/visited/outside, bad start position, timeout. *Silently skipped*: uncharged device, torpedo out of range, mine on island/duplicate, trigger with no armed mine. If nothing valid remains, `SURFACE` is executed instead.
- `MOVE` and `SILENCE` may be used in the same turn (each type once).
- Torpedo range is a BFS through water ignoring visited cells; the target must be water; firing at your own cell is legal.
- Lives are clamped at 0; both at 0 is a draw.
- Mines placed this turn cannot be triggered this turn.
- Commands are case-sensitive (`move n` is an unknown command).
