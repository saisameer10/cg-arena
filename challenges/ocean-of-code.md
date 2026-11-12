# Challenge: Ocean of Code

Worked example of the hand-off format. This is what was used to build `games/ocean-of-code/`.

## Source

- Puzzle URL: <https://www.codingame.com/ide/puzzle/ocean-of-code>
- Official referee source: <https://github.com/CodinGameCommunity/ocean-of-code> (Java, linked from the statement's "Expert Rules")
- Target league / rule set: all leagues (Wood 2 = level 1, Wood 1 = level 2, Bronze+ = level 3), selectable in the arena
- Players: 2. Turn order: alternating, player 0 first

## Statement

The original statement is not stored in the repository. Run `node cli.js fetch ocean-of-code` to save it locally (`challenges/raw/ocean-of-code.html`, git-ignored); the IDE then shows it next to the editor. Rules in short, in our words: two submarines on a 15×15 map with islands and 9 sectors; each turn a player sends one or more orders separated by `|` (MOVE with a power to charge, SURFACE, TORPEDO, SONAR, SILENCE, MINE, TRIGGER, MSG), each type at most once; the opponent sees a summary of your orders; 6 lives; 300 turns per player including the placement; devices unlock by league (Wood 2: torpedo; Wood 1: + sonar, silence; Bronze: + mines). `games/ocean-of-code/statement.md` has the full summary.

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
- Max turns: 598 rounds (299 each) after placement; referee constant `maxTurns = 598`. The SDK additionally caps the game at 1000 frames (`gameManager.setMaxTurns(1000)`): frame 1 is the placements and every executed action is one frame, so at most 999 actions run in a game
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
