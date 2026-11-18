# Where the places are lost (v10 in Gold, 46 arena games, 2026-11-18)

Tool: `tools/whylost.py <dir> battles_<submission>.json`. Every game not won gets one main reason (the first rule
that fits). Second place = 1 place lost, last = 2. v10: 22 first, 11 second, 13 last; mean rank 1.80; 37 places lost.

| Main reason of a game not won | Games | Share of games | Share of places lost | Last places |
|---|---|---|---|---|
| Prey team won; we had no catch by turn 15 (slow start) | 8 | 17 % | 38 % | 6 |
| Level on catches with the winner, our catches came later (tie-break) | 5 | 11 % | 16 % | 1 |
| Predator team won with a catch after turn 70, we were level or ahead until then | 3 | 7 % | 14 % | 2 |
| Prey team won; we started on time but the hunt stalled | 4 | 9 % | 14 % | 1 |
| Predator team won: it caught more of ours than we caught | 2 | 4 % | 11 % | 2 |
| Prey team won; we had lost two or more hunters by turn 20 | 1 | 2 % | 5 % | 1 |
| Prey team won; our unfinished net hits would have covered the gap | 1 | 2 % | 3 % | 0 |

With v5's 29 Gold games added (75 games, 61 places): slow start 44 %, tie-break 16 %, predator team 23 %, rest 17 %.

By units per team:

| Units | Games | First / second / last | Mean rank | Share of places lost | No catch by turn 15 | First catch, median turn |
|---|---|---|---|---|---|---|
| 3 | 12 | 9 / 0 / 3 | 1.50 | 16 % | 6 games | 17 |
| 4 | 12 | 2 / 3 / 7 | 2.42 | 46 % | 7 games | 19 |
| 5 | 7 | 4 / 2 / 1 | 1.57 | 11 % | 1 game | 7 |
| 6 | 15 | 7 / 6 / 2 | 1.67 | 27 % | 2 games | 7 |

Single facts, share of games won / of games not won: we made the game's first catch 55 % / 12 %; no catch of ours by
turn 15 18 % / 50 %; the prey team caught every unit of the third team 0 % / 42 %; 4 units per team 9 % / 42 %;
a unit lost by turn 10 32 % / 42 %; two or more units lost by turn 20 27 % / 8 %; a net hit on prey not finished
32 % / 46 %; a unit caught while held 50 % / 50 %.

Games with a catch by turn 15: 30, mean rank 1.57 (18 first, 5 last). Without: 16, mean rank 2.25, although only
0.38 units were lost by then.

In the first 15 turns of 4-unit games v10 does the same things as in its other games (nets 3.3 against 3.2, hits on
prey 0.9 against 1.1, dashes per unit 1.9 against 2.0, HUNT share 77 % against 71 %) and catches less than half as
much (0.67 against 1.47). The cause is not visible in these counts; 12 games is a small sample.
