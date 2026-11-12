# Challenge: Tron Battle

## Source

- Puzzle URL: <https://www.codingame.com/multiplayer/bot-programming/tron-battle>
- CodinGame type: ARENA (multi). Official referee source: not public.
- Arena kind: multi; bosses wood (random safe moves), bronze (flood fill), silver (Voronoi).

## Rule decisions

- 30 × 20 grid; players move in index order within a turn, so a later player already sees an earlier player's move.
- Driving off the grid, into any trail or into a head eliminates the player; a dead player's trail is removed.
- Input each turn: `N P`, then `X0 Y0 X1 Y1` per player (`-1 -1 -1 -1` when dead); output `UP`, `DOWN`, `LEFT` or `RIGHT`.
- Time: 1000 ms first turn, 100 ms after. The score is the number of turns survived.
