# Challenge: Try Catch Forest

## Source

- Contest: <https://www.codingame.com/contests/unleash-the-geek-2026-opp35> ("Unleash the Geek 2026"), three players.
- Statement: fetched through the CodinGame API per league and as PDF, kept in `challenges/raw/try-catch-forest/`
  (git-ignored); `challenges/raw/try-catch-forest.html` is the Gold text for the IDE's "Original statement" tab.
- Arena kind: multi, three seats.
- Official referee source: not public. `games/try-catch-forest/referee.js` is a line-by-line port of our local Java
  referee `prep/try-catch-forest/sim/Sim.java`, which was written from the statement and fitted on real game logs
  (`prep/try-catch-forest/kb/rules.md`, sections "Measured" and "Local referee").

## Fidelity

- Port against the Java referee: same seed and the same three Java bots give the same catches for every player
  (4 of 4 seeds checked: 2-5-3, 1-3-2, 3-3-1, 0-2-2). The map generator uses `games/java-random.js`, so a seed is the
  same map in both.
- Against CodinGame: the movement rule (slide along trees) reproduces 99 % of 638 recorded moves within 3.4 units;
  catch distance, dash cooldown, net hold (4 turns to walk in) and ids are measured on real games.
- Not CodinGame's: the map generator (ours: three-fold symmetric trees, 12 to 33 trees; real seeds do not give the
  real maps), the power pools (ours: 2 to 5 of each), and the points below. Results between our own bots here have
  misled us before (versions better here were worse on real battles): use this arena to watch, debug and crash-test,
  not to rank versions.

## Rule decisions (where the statement is silent)

| Point | Choice |
|---|---|
| Collisions | the turn is cut into 24 steps; at each step overlapping hunter / prey pairs collide, in time order |
| Net | stops at the first tree, unit or decoy on its path; holds every unit within reach of that point; hits units of any team except ghosts and the thrower |
| Net hold | 4 following turns (the input shows 4 on the turn after the throw) |
| Sight | 2000, 2600 after a turn without moving; trees and clouds block it; a unit in a cloud sees nothing |
| Cloud | appears after the moves, 9 turns of effect; seen only if its centre is in sight |
| Enemy decoy | shown as a unit with the id of the original, cooldown 0, fatigue 1 |
| Player with no unit left | leaves the game with its points; its ghosts vanish; the game ends when two players have left |
| Commands for a unit that is not ours | ignored, noted in the review (`command-for-foreign-unit`) |
| Unknown command word, missing or non-numeric id / x / y, empty line | the player is removed, score -1, ranked last |
| `SECRET_FOREST_SPRITE` entities and the tree side quest | not implemented (no effect on the score was seen) |
| Final scores | catches per player (CodinGame shows 3 x catches + tie-break order); `ranks` and `firstCatch` are in the result |

## Platform change made for this game (generic)

- `server/engine/match.js`: a game with more seats than players given seats them in turn (A, B, A) and reports the
  winner by its index in the list given (`winnerSeat`, `seats` in the result). The arena, the validator and
  `node cli.js <game> a b` therefore work unchanged for three-seat games.
- `node cli.js <game> a b c` and a third "Player 2" slot in the web page give every seat its own bot.

## Bosses

`bosses/boss.js`: wood (walks at prey in sight, else patrols), bronze (also flees from predators and dashes),
silver (also nets and smoke). Ladder from `validate`: bronze beats wood 5/6, silver beats bronze 4/6.

## Time limit

50 ms per turn as on CodinGame. Three Java programs starting together on this PC can exceed it in the first turns
(cold JVM): use "Time x 2" in the page or `--timeout-mult 2`.
