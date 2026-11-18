# Try Catch Forest

Three teams chase each other in a round forest. This page is written in our own words; the rules are the ones of
CodinGame's "Unleash the Geek 2026" contest as stated there and as measured on its game logs.

## Goal

Player `i` catches the units of player `(i + 1) % 3` and is caught by player `(i + 2) % 3`. The player with the most
catches after 100 turns wins. With equal catches, the earlier first catch wins, then the earlier second catch, and so on.

## The forest

- A circle of radius 8000 around (0, 0); y grows downwards.
- Circular trees (radius 500 to 2000). Units slide along trees; they block sight and nets.
- Each player has 3 to 6 units (discs of radius 220). The three teams start as copies of each other turned by 120 degrees.

## Each turn, per unit: one movement and one power

| Command | Effect |
|---|---|
| `MOVE id x y` | walk up to 600 towards the point |
| `DASH id x y` | run up to 1200 towards the point. After its k-th dash a unit cannot dash for k turns |
| `NET id x y` | after the moves, a disc of radius 250 flies up to 2000 in a straight line. A tree stops it. A unit it touches cannot move for the next 4 turns (it can still use powers) |
| `SMOKE id x y` | after the moves, a cloud of radius 1900 appears up to 2000 away and lasts 9 turns. Nothing is seen into, out of or through it |
| `DECOY id x y` | before the moves, a copy of the unit appears and walks 600 per turn towards the point and beyond for 10 turns. Other players see it as the unit itself. Touching an enemy unit or a net destroys it |
| `WAIT` | nothing |

Nets, smokes and decoys come from one pool per player (2 to 5 of each, the same for the three players).

## Catching

- When the centres of a hunter and one of its prey units come closer than 440 during the moves, the prey unit is caught
  at once: one point for the hunter's player. Contacts are resolved in time order within the turn.
- A caught unit becomes a ghost: invisible to the others, it can still move (through trees) but cannot catch, be caught,
  be netted or use powers.
- A player whose last unit is caught leaves the game and keeps its points. The game ends when two players have left,
  or after 100 turns.

## Sight

A unit sees 2000 around it (2600 on the turn after it did not move). You only receive what at least one of your units sees.

## Protocol

Initialization input:

```
myId
mapRadius
treeCount
treeId x y radius        (treeCount lines)
```

Input for each turn:

```
myScore
nets smokes decoys
entityCount
id type owner x y dx dy ghost turnsRemaining fatigue immobilizedTurns     (entityCount lines)
```

- `type`: `UNIT`, `DECOY` (your own decoys) or `SMOKE`. `dx dy`: movement of the last turn.
- `turnsRemaining`: dash cooldown of a unit (0 = can dash now), remaining life of a decoy or cloud.
- `fatigue`: the cooldown the unit's next dash will cost. `immobilizedTurns`: turns the unit is still held by a net.
- Fields that do not apply are -1. Unit ids: player `p` owns `p*N` to `p*N + N - 1` with `N` units per player.

Output: one line, commands joined by `;`, for example `MOVE 0 1200 -300;NET 0 2000 500;DASH 1 0 0`. Text after the
coordinates is a free message. If a unit gets several movements or several powers, the last of each counts.

Time: 1000 ms for the first turn, 50 ms for the others. A timeout or an invalid command removes the player.

## In this arena

The game has three seats. With two players chosen, the first also takes the third seat (A, B, A).
