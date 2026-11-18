# Arena analysis (2026-11-18)

What our submissions did against real players, measured on every game log. Tools: `tools/arenafetch.py` (download),
`tools/arena.py` and `tools/arena2.py` (statistics), `tools/rerun.sh` + `tools/deathclass.py` (replay a battle with the
debug build and classify each loss by what the bot could see).

## Timeline

| Time (IST) | Event |
|---|---|
| 09:47 | v1 submitted (first bot from the statement) |
| 09:54 | v5 submitted (replaces v1 in the arena) |
| 10:16 | v5 promoted from Bronze to Silver |
| 10:23 | v5 in Silver: 10th of 65 at 19 % of its games, Silver boss 14th |

Silver has the same statement and the same input as Bronze (checked by diff of the statement and of the stub).

## Results in Bronze

| | v1 | v5 |
|---|---|---|
| Games | 80 | 197 |
| First / second / last | 51 % / 21 % / 28 % | 49 % / 30 % / 21 % |
| Mean rank | 1.76 | 1.73 |
| Catches per game | 3.76 (81 % of the prey) | 3.14 (71 %) |
| Catches by turn 10 / 20 / 40 | 1.14 / 1.90 / 2.91 | 0.75 / 1.35 / 2.21 |
| Units lost per game | 3.04 (65 % of ours) | 1.99 (45 %) |
| Prey units left at the end | 0.90 | 1.31 |
| Errors, timeouts | 0 | 0 |

The two versions are equally strong; they fail in opposite ways.

| Why a game was not won | v1 (39 games) | v5 (101 games) |
|---|---|---|
| All our units lost before the prey was finished | 46 % | 16 % |
| Units left on both sides at the end: hunt too slow | 38 % | 58 % |
| Level on catches with the winner, lost the tie-break | 15 % | 27 % |

- v1 hunts fast and dies. v5 survives and hunts too slowly: the safety terms added between v1 and v5 (no steps
  into unseen ground, avoiding places where a predator was, the chase lookahead) also hold the hunters back.
- Against the Bronze boss this did not show: the boss never dashes and loses its units quickly either way.

## What works (keep)

- **No crash, no timeout, no invalid command** in 277 arena games.
- **Nets.** 4.2 thrown per game, 41 % hit prey, and 68 % of those hits become a catch. 37 % of all our catches are
  on netted prey.
- **Decoys walked at the predator.** 32 % of the enemy nets that hit something of ours hit a decoy; 15 % of our
  decoys took a net that was meant for a unit.
- **Turn 1 knowledge** (start positions by rotation): catches on turn 1 happen.
- **Dash strikes.** 26 % of our catches are free prey caught with a dash.

## What does not work

Losses of v5 in its 12 worst Bronze games, replayed with the debug build (45 units lost; a loss can have several labels):

| Label | Share | Meaning |
|---|---|---|
| Three or more dashes already spent | 67 % | the dash budget was burnt early; late in the game the cooldown is 4 to 8 turns |
| Inside our own smoke | 42 % | we threw the cloud on ourselves, stood blind in it and were walked over |
| No predator seen in the last 3 turns | 42 % | mostly the same units: blind in smoke |
| Standing still by choice | 31 % | in smoke every move looked "unseen" and was penalised, so standing won |
| At the wall (radius over 6800) | 31 % | driven outwards, then no way out |
| Stacked with a team mate | 31 % | units ran to the same spot; one predator took 2 to 4 of them in one turn |
| Catcher dashed, our dash on cooldown | 16 % | consequence of the burnt budget |
| Held by a net | 13 % | |
| Ordered to move but did not | 7 % | pocket between a big tree and the wall: only the way back towards the predator is open |

Over all 197 games: 31 % of our losses happened on a turn where the catcher dashed; only 20 % of the lost units had
been netted first. Real players dash; the Bronze boss never did.

## Changes made from this (v6)

| Finding | Change |
|---|---|
| Dash budget burnt | a dash is allowed only for a catch, to reach netted prey in time, or when no walking move is safe this turn |
| Own smoke blinds us | the cloud is thrown 2000 out, past the hunter: it is blind inside, we stay just outside and keep our sight |
| Frozen in smoke | no unseen-ground penalty for a unit inside a cloud; standing inside a cloud is penalised |
| Stacking | every move is penalised for ending within 700 of a team mate |
| Wall and pockets | "ways out" count: 12 walking directions that really move the unit and do not approach a predator; fewer than 5 is penalised |
| Predators that vanish (behind a tree, or in the cloud we threw) | they keep moving along their last direction for 3 turns in our model, with their dash coming back |
| Turn time (v5 peaked at 23 ms on CodinGame) | cheaper movement simulation, lazy "ways out" scoring, coarser search for the last units of a slow turn |

Same 12 games replayed with v6: units lost 45 -> 25; places from 10 last + 2 second to 4 first + 6 second + 2 last.
These were the worst games, so part of that is regression to the mean.

## Paired test in Silver: v5 against v6

Same 8 seeds, seat 0, against the top Silver player of that moment and the Silver boss:

| | Wins | Second | Last | Catches | Lost |
|---|---|---|---|---|---|
| v5 | 2 | 5 | 1 | 22 | 9 |
| v6 | 1 | 6 | 1 | 22 | 9 |

No difference. Fewer deaths are not enough: the catches have to come sooner. That is what v7 tries (see `log.md`).
