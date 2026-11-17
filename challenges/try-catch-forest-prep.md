# Try Catch Forest: preparation notes (before the statement)

Built on 2026-11-17 from two replay videos of the game's viewer. The statement arrives later; everything here is **inferred** and each section says how sure it is. When the statement arrives, go through "Questions the statement must answer" first.

## Sources

| Video | Game | Result |
|---|---|---|
| `UTG battle 250(1,2,4).mp4` (85 s, 100 turns) | 5 units per team; items 6 smoke / 3 decoy / 6 net; seed -5129465133391384000; about 19 equal obstacles | Commit Happens (rock) 4, Invalid FOP (paper) 3, GoToVictory (scissors) 1 |
| `Media1.mp4` (72 s, 100 turns) | 3 units per team; items 1 smoke / 2 decoy / 3 net; seed 6709949125715584000; about 25 obstacles of mixed sizes | Invalid FOP (paper) 2 "(earliest catch)", BitingBytes (rock) 2, GoToVictory (scissors) 1 |

The viewer is CodinGame's (frame counter, "Game information", "Standard output stream", seed). The title on the end screen is **Try Catch Forest**; its logo shows a rock, a sheet of paper and scissors. Nothing public exists about the game (web search, CodinGame puzzle list), so it is a private event game. Neither video has sound.

## What is certain (read directly from the screen)

- **Three players, 100 turns.** Player colours: orange, teal, grey.
- **Rock-paper-scissors between teams.** Orange units are scissors, teal units are paper, grey units are rock. Every catch seen follows the cycle: scissors caught paper, paper caught rock, rock caught scissors. Each team is hunter of one team and prey of the other, at the same time.
- **Score = catches made.** One point per caught unit. A tie is broken by "earliest catch" (shown on the end screen).
- **A caught unit becomes a ghost.** The HUD shows two counters per team: units alive, and ghosts. Ghosts stay on the map as faint shapes, and teams keep sending them commands (`MOVE 3 5500 -4500` for a ghost; one team labels them "GHOST").
- **Output: one line, commands separated by `;`**, each naming a unit id:

  ```
  MOVE id x y [message]
  DASH id x y [message]
  NET id x y
  SMOKE id x y
  DECOY id x y
  ```
  Example from turn 1: `DASH 0 1108 -4853;DASH 1 -1151 3775;...;NET 4 -1770 329;DECOY 1 -2297 7015`.
  A unit can move **and** use an item in the same turn. The optional message is shown as a label above the unit.
- **Unit ids are global**: with N units per team, player 0 has 0..N-1, player 1 has N..2N-1, player 2 has 2N..3N-1.
- **Items are a team pool**, shown in the HUD: smoke (bomb icon), decoy (pink figure), net (web). The counts go down as any unit of the team uses one. The pool size changes between games (6/3/6 and 1/2/3), and so does the number of units (5 and 3): **read them from the input, never hard-code them**.
- **Coordinates**: origin at the centre of a circular arena, x to the right, y downwards. Commands with targets outside the arena are accepted (seen up to 7590).
- **Vision**: each unit has a sight circle that obstacles cut into (the viewer draws its outline). A unit inside smoke has no sight outline at all.
- **Obstacles** are circles (tree stumps) that block movement and sight. Their number and sizes change with the seed.

## Estimates (measured on screen; confirm)

| Quantity | Estimate | How |
|---|---|---|
| Arena radius | about 8000 | viewer tooltips `(1173, 7556)` at the bottom edge and `(5928, 3123)`; about 39 units per pixel |
| Sight radius | 2400 to 2700 | sight outlines |
| Obstacle radius | about 700 (game 1); 600 to 1300 (game 2) | pixels |
| Smoke cloud radius | 1500 to 1800, lasting several turns | pixels; clouds from turn 1 are still there at turn 7 |
| DASH | faster than MOVE, not usable every turn | teams alternate DASH and MOVE; one unit dashed on turns 1 and 3 |
| NET | thrown at a point; a netted unit is held in place for some turns and is then easy to catch | web drawn around a rock unit that was caught right after |
| DECOY | a fake copy of the unit that enemies see | two extra scissors appeared after two DECOY commands |
| Start positions | all three teams mixed together near the centre | first frames |

## Questions the statement must answer

1. Exact input per turn: what do I see (only units in sight? ghosts? decoys marked or not? smoke clouds? nets?), and do I get item counts and cooldowns?
2. Catch rule: distance, and what happens when A hunts B while C hunts A at the same spot (order of resolution).
3. MOVE and DASH distances per turn, the DASH cooldown, collisions with obstacles and the arena wall.
4. NET: range, radius, duration, whether it also stops my own units, whether a netted hunter can still catch.
5. SMOKE: radius, duration, whether it blocks sight through it or only inside it.
6. DECOY: lifetime, whether it moves, whether catching a decoy costs anything.
7. Ghosts: can they see (scouts), block, be revived, or score? What does "x/5 sprites collected" on the end screen count?
8. Are the roles fixed by player index (0 scissors, 1 paper, 2 rock), or given in the input?
9. Time limits per turn, and whether the game parameters depend on the league.

## What the two games teach

- **The first 5 turns decide most of the score.** Teams start interleaved in the centre: in game 1, three of the eight catches happened by turn 7. On turn 1 every unit must already know which neighbour is prey and which is a predator.
- **Game 1, scissors (orange) lost two units by turn 4** while standing in the central crowd next to rock units. Its orders show why:
  - It spent nets and decoys at once (all 6 nets and 3 decoys gone by turn 7) but **never used smoke while in danger**; its 6 smokes were first used from turn 14, away from any fight.
  - Later it sent several units to **the same coordinates** (`MOVE 0 4619 135;MOVE 1 4619 135;MOVE 3 4619 135`), so a single rock unit could threaten all of them, and it lost two more between turns 46 and 62.
- **Rock (the winner of game 1) labelled every unit with a state**: HUNT, FLEE, SEEK, GHOST. It switches each unit between chasing prey and running from predators every turn. That per-unit state machine is the baseline to beat.
- **Paper (second in game 1, first in game 2)** kept all 5 units alive until turn 8 and lost only one in each game: it uses smoke early and often (5 of 6 smokes in the first 7 turns), dashes to open distance, and spreads its units to different sectors.
- **Long quiet middle game.** Between turns 15 and 45 of game 1 nobody was caught: once the teams separate, sight range and obstacles make hunting slow. Points after the opening come from cornering a unit near the wall or a net at the right time.
- **Ties are common with few units** (2 vs 2 in game 2), and "earliest catch" decides: an early safe catch is worth more than a late one.

## Plan for the bot

1. **Parse everything, hard-code nothing**: units per team, item counts, obstacle list, any ranges the input gives.
2. **Per-unit state each turn**: FLEE if a predator is within a danger distance (run to the point that gains the most distance, prefer breaking line of sight behind a stump, stay off the wall); else HUNT the best prey (intercept, steer around stumps); else SEEK (spread units over different sectors, never the same target point).
3. **Items by rule**: SMOKE on myself when a predator is close and I am fleeing; NET on a prey that is within range and not yet catchable, or on a predator that is about to catch me; DECOY when fleeing with a predator in sight. Keep one net and one smoke per surviving unit for the late game.
4. **Memory**: remember where enemies were last seen for a few turns (fog of war), and ignore positions that are too old.
5. **Opening book**: turn 1 dash away from adjacent predators, net adjacent prey.
6. **Three-player thinking**: the team that hunts my predator is my own prey. So when I flee, running **towards my prey's units** puts my hunter in danger from them and brings me closer to my food. Running towards empty space only delays the catch.

`prep/try-catch-forest/Player.java` holds this plan as code with tested geometry (sight lines, steering around obstacles, fleeing, interception) and stubs where the input format is needed. `SelfTest.java` checks it (21 checks).

## When the statement arrives

1. Give Claude Code the link or the PDF: "add the challenge ..." builds it locally (`node cli.js new`), with a referee from the statement, three bosses and the review.
2. If the game is on CodinGame, the installed CodinGame skill can read the statement and the input format through the API, run test games against the boss and read their logs.
3. Fill `readInit` / `readTurn`, replace the estimated constants, then iterate with the arena and the review.
