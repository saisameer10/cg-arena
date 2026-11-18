# Rules

Written in our own words. The original statements are in `challenges/raw/try-catch-forest/` (git-ignored).
"Statement" = stated by CodinGame. "Measured" = found in test games or game logs, with the evidence.

## Bronze (statement read 2026-11-18 through the API and as PDF: same text)

### Game
- Three players. Player i catches the units of player (i+1)%3 and is caught by player (i+2)%3.
- Arena: circle of radius 8000 around (0,0); y grows downwards. Up to 48 circular trees, radius 500 to 2000.
- 3 to 6 units per player, each a disc of radius 220.
- 100 turns at most. A player whose last living unit is caught is removed with all its units (ghosts too) but keeps
  its points. The game stops when two players are out.
- Winner: most catches. Tie: compare the turn of the 1st catch, then of the 2nd, and so on; earlier wins.
- A timeout or an invalid command removes the player and voids its score.
- Time: 1000 ms for the first turn, 50 ms for the others.

### Movement
- `MOVE`: up to 600 towards the point. `DASH`: up to 1200.
- After its k-th dash a unit cannot dash for k turns (first dash: 1 turn, second: 2 turns ...).
- Units slide along trees. Units of one team pass through each other.
- Units of different teams that overlap (centres closer than 440) collide at once, during the move: the hunter scores
  1 point, the prey becomes a ghost. Collisions happen in time order, so a predator can take a hunter before it arrives.

### Ghosts
- Invisible to the other players, cannot catch, cannot be caught or netted, cannot use powers.
- Still move and dash, and walk through trees.

### Sight
- 2000 around each unit; 2600 on the turn after a turn without moving. Trees and smoke block it.
- The input lists only what at least one of our units sees.

### Powers (one shared pool per player, random counts at the start)
- `NET x y`: a disc of radius 250 flies up to 2000 in a straight line. A tree it touches destroys it. A unit it touches
  is immobilised for 5 turns. It can hit several units. It resolves after the moves; a unit caught this turn throws nothing.
- `SMOKE x y`: thrown up to 2000, over trees and units; a cloud of radius 1900 for 9 turns. It blocks sight, also for
  units inside (blind and invisible). We see a cloud only if its centre is in sight. Resolves after the moves.
- `DECOY x y`: a copy of the unit appears at its position before the moves and walks 600 per turn towards the point,
  and on past it, for 10 turns, sliding along trees. Touching a unit of another player destroys it. A net that hits
  it is used up. Other players see it as a normal unit with the id of the original.

### Side quest
- Separate ranking: share of the trees touched by our units (ghosts count) per game, averaged.

### Protocol
- Start: `myId`, `mapRadius`, `treeCount`, then `treeId x y radius` per tree.
- Turn: `myScore`; `nets smokes decoys`; `entityCount`; then per entity
  `id type owner x y dx dy ghost turnsRemaining fatigue immobilizedTurns`.
  - `type`: `UNIT`, `DECOY` (our own), `SMOKE`. `dx dy`: last turn's movement.
  - `turnsRemaining`: dash cooldown for a unit, lifetime for a decoy or cloud. `fatigue`: cooldown the next dash will cost.
  - -1 where a field does not apply.
- Output: one line, commands joined by `;`: `MOVE|DASH|NET|SMOKE|DECOY id x y [message]` or `WAIT`.
  One movement and one power per unit and turn; the last one of each kind counts.

## Measured (not in the statement)

| Fact | Evidence |
|---|---|
| The three teams start as 120 degree rotations: unit j of player p = our unit j turned by (p - myId) x 120 degrees (x' = x cos a - y sin a, y' = x sin a + y cos a) | probe game: both visible enemies matched to the unit |
| Ids: units 0..3N-1 (player p owns p*N .. p*N+N-1), then trees, then decoys, clouds, sprites | probe game |
| Enemy units show their real `turnsRemaining` and `fatigue` | probe game |
| `turnsRemaining` 0 = can dash this turn | probe: dash on turn 1, field 1 on turn 2, 0 on turn 3 |
| `immobilizedTurns` k = cannot move this turn and the k-1 after it. A net thrown on turn t shows 4 on turn t+1: four turns to walk in | debug games |
| A held unit can still use powers | 5,000 cases in Gold logs; our bot does it |
| Slide rule: straight until the unit touches a tree (distance radius + 220), then the rest of the turn along the tangent at reduced speed (the component towards the tree is dropped, the speed is not restored) | 638 recorded moves: 99 % within 3.4 units (`tools/slidefit.py`) |
| A unit pushed along the wall into a tree that touches the wall stops dead (moved 0 in a turn) | 5 recorded moves |
| Final score shown = 3 x catches + 0/1/2 for the tie-break order | 400 Gold games |
| An enemy decoy looks exactly like a unit (same id, ghost 0, cooldown 0, fatigue 1, immobilised 0). Two entries with one id = one of them is a decoy | mirror game, turn 7 |
| Entity type `SECRET_FOREST_SPRITE` (owner -1, 5 per game; the game's metadata counts `spritesCollected` per player) | every game; effect unknown, no score effect seen |
| The Bronze boss never dashes, throws nets, labels its moves "Seeking" | test games |
| Our turn time: 17 to 46 ms on the first turn, about 1 ms afterwards | debug games |

From 1,408 Gold games (see `challenges/try-catch-forest-prep.md`), still valid under the statement:
- A walking hunter never catches a unit that walks straight away. A dashing hunter catches a walking unit from about
  1000 or less (dash 1200 - walk 600 + contact 440 = 1040). A unit that dashes away is not caught that turn.
- Nets hit 83 % when the target's dash is on cooldown, 63 % when it can dash, 28 % on turn 1.
- A netted unit with a hunter within 1200 is caught 76 % of the time; left alone by its team 82 %; with smoke and a net
  on the hunter 33 %.
- First catch: that team wins 54 %. A third of the games are level on catches and go to the tie-break.

## Open questions
- What the sprites do.
- Whether `DASH` during cooldown or `NET` with an empty pool is an invalid command (the bot never sends either).
- Whether enemies have the same number of powers as we do (the bot assumes they always have nets).
- Rules of the leagues above Bronze. The Gold games studied before the statement used the same five commands.

## Local referee (`sim/Sim.java`)

A referee of our own, for testing versions against each other over thousands of games. It is built from the
statement and the measurements above; it is not CodinGame's code. Where the statement leaves a choice, this is what
it does:

| Topic | Choice | Basis |
|---|---|---|
| Movement | the fitted slide rule, same code as in the bot | 638 real moves |
| Collisions | the turn is cut into 24 steps; at each step, units of different teams closer than 440 collide | statement: "as soon as they overlap", in time order |
| Order inside a step | units in id order (seat 0 first) | unknown; the bias is at most 1/24 of a turn |
| Map | 12 to 33 trees placed with 3-fold symmetry, radius 500 to 1000 (one in four up to 2000); units of player p are the units of player 0 turned by p x 120 degrees; no unit closer than 500 to another | probe games (27 trees, 505 to 717; rotation of the starts) |
| Units per team | 3 to 6, uniform | statement |
| Powers | 2 to 5 of each kind, the same for the three players | pools seen: 4 5 3, 4 0 2, 2 3 1; equality between players is assumed |
| Net | stops at the first tree, unit or decoy on its path; holds every unit within 470 of that point; hits any team except ghosts and the thrower; 4 turns shown on the next turn | statement + debug games |
| Smoke | appears after the moves, 9 turns | statement |
| Sight | 2000, 2600 after a turn without moving; a unit in a cloud sees nothing and is not seen; a line through a cloud or a tree is blocked | statement |
| Decoy as seen by others | a UNIT with the id of the original, ghost 0, cooldown 0, fatigue 1, not held | mirror game |
| Time limits | none | |

Check against reality: in 120 local games between v1, v5 and v8 the teams made 2.5 to 2.9 catches per game, 0.4 to 0.5
of them by turn 10; in the Bronze and Silver arena v1 and v5 made 3.1 to 3.8 and 0.6 to 1.1. Same order of
magnitude, a little slower. The local opponents are our own bots, which flee better than most Silver teams.
