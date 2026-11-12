# Challenge: The Bridge - Episode 2

## Source

- Puzzle URL: <https://www.codingame.com/ide/puzzle/the-bridge-episode-2>
- Official referee source: not public. Rules implemented from the statement (fetched with `node cli.js fetch the-bridge-episode-2`).
- Kind: solo (CodinGame type `SOLO`, level hard). One player, 1 to 4 bikes, 50 turns, 150 ms per turn.

## Statement

Original saved locally in `challenges/raw/the-bridge-episode-2.html` (not committed). Summary and exact protocol: `games/the-bridge-episode-2/statement.md`.

## Rule decisions

| Topic | Decision | Basis |
|---|---|---|
| UP / DOWN hole check | current lane X+1 .. X+S−1, new lane X+1 .. X+S | the statement's "black zone" diagram (speeds 1 to 4), read from the fetched statement |
| Speed change | SPEED/SLOW change the speed first, then the bikes move | statement example (turn 1: S=1, SPEED, then X=2) |
| SLOW at speed 0 | stays 0 | constraint 0 ≤ S |
| SPEED at 49 | stays 49 | constraint S < 50 |
| Guard rail | only bikes still running can block a lane change | lost bikes no longer move |
| Lost bike | stays at the position after the move in which it fell, reported with A = 0 | statement example (turn 3/4: `4 1 0` stays) |
| Lane change at speed 0 | the new cell itself must be safe | assumption (the diagram starts at speed 1) |
| Cells past the road | safe; crossing = X ≥ road length | "far side of the bridge" |
| End of game | win when the running bikes cross with at least V of them; lose as soon as fewer than V remain, or after 50 turns | statement |
| Invalid output | loses immediately | CodinGame behaviour for solo puzzles |
| Time | 150 ms per turn; the engine adds a boot allowance to the first turn for starting the interpreter/JVM | statement; boot time is not the bot's |

## Tests

`games/the-bridge-episode-2/tests/`: 6 designed levels (gap, lane changes, forced sacrifice, formation, diagonal, braking from speed 9) and 4 generated ones (sparse, mixed, long, gauntlet). Plus `random:<seed>` from `generator.js`. Every level is proven solvable by the solver in `rules.js` and is not beaten by repeating one command. These are our maps, not CodinGame's.

## Review

`referee.review()` replays the game with the solver and reports the first command after which no continuation could still win (binary search over the turns), with the commands that would still have won at that point (`decisive-<command>-into-hole` / `-dead-end`), plus tips when a pass kept fewer bikes or used many more turns than needed.

## Spoiler

`games/the-bridge-episode-2/rules.js` run as a bot is a complete solution (breadth-first search). It exists to prove the tests and power the review.
