# Smoke in the Gold league of Try Catch Forest: what the local game logs show

Data and method (applies to every table; local files only, nothing was run against CodinGame, no Java, repository untouched):

- **All-team logs, 2,347 Gold games = 7,041 team-games**: `top` = 860 games of today's top Gold teams (`E:/cg-tmp/tcf/goldtop/utg/games`; the folder grew from 768 to 1,128 files while this was written, so the list was frozen at the 860 present at 13:36, see `frozen.json`), `y` = 1,408 games from yesterday (`E:/cg-tmp/cgskill/utg/games`), `us` = our 79 Gold arena games (`E:/cg-tmp/tcf/gold/games`, v5 and v10 mixed; a team's bot is treated as a different team in `top` and `y`). 23,725 smoke orders, 21,417 clouds deployed (18,740 by free units, 2,677 by held units).
- **Our debug replays, 65 games**: 39 of v10 (`gold/r10`, `gold/g10`) and 26 of v12 (`gold/g12`, the same battles as `r10` replayed with another version: not independent). Exact positions of our units, what we saw, our pool.
- Positions of other teams come from `research/lib/parse.js` (median error 1 to 3 units, 90th percentile 260 to 470; trees are not modelled). Distances are bucketed 400 wide, so a few per cent of cases sit in the neighbouring bucket.
- **"Predator distance" means the true (reconstructed) distance from the unit to the nearest living predator at the START of the turn**, when the order is given, unless a line says otherwise. The older figure "our smokes are thrown at 1,860 to 2,870" (`kb/battle-924177559.md`) measured from the predator's old position to OUR position AFTER our move; the two measures differ by 600 to 1,200. Both are given for our own throws in section 2.
- "Caught 0-5" = caught on the turn of the order or in the five turns after it. "Caught 1-5" = for a deployed cloud, in the five turns after the throw. "Pursued" = the nearest predator's own order of that same turn points at the unit (cosine above 0.8) and it is not held. That order is given at the same moment as our smoke order, so it is not influenced by the smoke.
- **Limits that apply everywhere**: these are observations, not experiments. A bot smokes when its own code judges the unit in danger (line of sight, corner, net line), and the logs do not contain trees, so "smoke against no smoke at the same distance" still compares more endangered units with less endangered ones. The comparisons bound the effect; they do not prove it. Rank columns on throw tables are weighted by throws and mostly reflect which teams throw that way.
- Scratch scripts and their outputs: `E:/cg-tmp/tcf/research_smoke/` (`s1_rows.js` builds the row files; each table below names its output file).

## 1. Direction: where is the cloud centre relative to the thrower and the predator?

### Takeaway
Placement is a property of the team, not of the situation: 58 of the 63 teams looked at (60+ free throws, plus the top five and us) put at least half of their clouds in one class, and only one team uses both "on the thrower" and "between", so placement can only be compared between teams. On that comparison no placement protects the thrower clearly better; ours ("900 ahead of our own move", unique in the top group) already has one of the lower thrower loss rates (12 % caught in 5 turns against 16 % expected from the distances of our throws). The one placement that is measurably worse is "on or past the predator".

### Cited Findings
Classes (thrower position after its move, predator as seen at the start of the turn): on the thrower = offset under 250; between = towards the predator but short of it; on or past the predator = centre within 600 of it or beyond it; away = opposite side; sideways = the rest.

Free throwers, all 2,347 games, by placement and predator distance (n = throws; "in@4" = thrower still inside its cloud four moves later):

| Predator distance | On the thrower | Away from predator | Between | On or past predator |
|---|---|---|---|---|
| under 1100: caught 1-5 | 20.3 % (n 4,034) | 16.2 % (346) | 17.2 % (986) | 21.4 % (1,355) |
| 1100-1500 | 19.2 % (2,454) | 17.9 % (457) | 14.4 % (1,048) | 18.8 % (1,042) |
| 1500-1900 | 14.4 % (1,324) | 14.8 % (418) | 14.0 % (693) | 15.9 % (705) |
| 1900-2300 | 10.6 % (444) | 14.7 % (191) | 10.1 % (307) | 12.7 % (237) |
| 2300 and beyond | 6.3 % (494) | 8.3 % (446) | 6.3 % (504) | 13.8 % (94) |
| Mean rank of the throwing team (all distances) | 1.85 to 2.08 | 1.85 to 1.98 | 1.85 to 2.05 | 2.01 to 2.20 |
| Thrower netted by a predator on the throw turn | 4.8 % | 5.8 % | 4.0 % | 7.3 % |
| Thrower netted per later turn (+1 to +5) | 0.0 to 0.1 % | 0.0 to 0.6 % | 0.1 to 0.2 % | 0.4 to 0.8 % |
| Thrower still inside after 4 moves (range over the distance rows) | 41 to 58 % | 57 to 73 % | 21 to 34 % | 14 to 18 % |

— [out_place.txt, table P2](E:/cg-tmp/tcf/research_smoke/out_place.txt); net rows from [out_netjoin.txt, table X3](E:/cg-tmp/tcf/research_smoke/out_netjoin.txt)

- "Between" has the lowest catch rate under 1500 (14.4 % against 19.2 % on the thrower at 1100-1500; 17.2 % against 20.3 % under 1100), but inside a team the comparison cannot be made: of the 13 teams with 25+ throws in two classes, 9 mix "between" with "on or past the predator" (the same fixed throw towards the predator, landing short when the predator is farther: mean predator distance 1,157 to 1,934 for "between" against 940 to 1,345 for "past"), and exactly one team (J-BCM) has both "on the thrower" (23 % caught, n 39) and "between" (30 %, n 61). — [out_smoke2.txt, table R2](E:/cg-tmp/tcf/research_smoke/out_smoke2.txt)
- Teams grouped by their main placement (50 %+ of free throws; "ratio" = thrower caught 1-5 divided by the rate expected from the predator distances of the team's own throws; 58 teams, 15,298 throws):

| Main placement | Teams | Throws | Caught 1-5 | Expected | Ratio | Ratio per team, median (min to max) | Mean rank, games-weighted |
|---|---|---|---|---|---|---|---|
| Away from the predator | 6 | 1,689 | 13.1 % | 14.5 % | 0.91 | 0.85 (0.72 to 1.61) | 1.96 |
| Between | 12 | 3,001 | 15.7 % | 17.5 % | 0.90 | 0.97 (0.58 to 1.44) | 1.94 |
| On the thrower | 28 | 7,811 | 17.3 % | 17.6 % | 0.98 | 1.03 (0.12 to 1.89) | 1.91 |
| On or past the predator | 12 | 2,797 | 15.2 % | 16.1 % | 0.95 | 0.93 (0.51 to 1.19) | 1.99 |

— [out_team.txt, "teams grouped by their main placement"](E:/cg-tmp/tcf/research_smoke/out_team.txt)

- The five named top teams and us (set `top`, 860 games; us = 79 arena games; "behind/ahead" = cloud centre behind or ahead of the thrower's own move):

| Team | Games | Mean rank | Smokes per game | Free throws | Main placement | Median offset | Ahead of own move | Behind own move | Standing still | Median predator distance | Inside after 2 moves | Inside after 4 moves | Mates inside the new cloud | Thrower caught 1-5 | Ratio |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ATI x iHot | 57 | 1.54 | 3.89 | 207 | between (82 %) | 1,490 | 0 % | 92 % | 1 % | 1,396 | 23 % | 13 % | 0.12 | 10 % | 0.58 |
| Les Gens Bons | 200 | 1.60 | 2.72 | 460 | on the thrower (100 %) | 0 | 1 % | 1 % | 92 % | 1,363 | 100 % | 63 % | 0.04 | 23 % | 1.38 |
| Lore | 64 | 1.81 | 0.88 | 56 | between (48 %), mixed | 892 | 9 % | 43 % | 7 % | 1,168 | 71 % | 33 % | 0.14 | 16 % | 0.98 |
| RNG | 136 | 1.88 | 3.08 | 380 | between (53 %), past (28 %) | 1,120 | 0 % | 79 % | 7 % | 1,063 | 38 % | 40 % | 0.12 | 20 % | 1.09 |
| SoloLeveling | 89 | 1.96 | 4.08 | 333 | on or past (50 %), between (36 %) | 1,500 | 8 % | 46 % | 0 % | 1,746 | 41 % | 32 % | 0.10 | 18 % | 1.24 |
| **The Final Boss (us)** | 79 | 1.82 | 4.01 | 283 | away (83 %) | 900 | 86 % | 0 % | 10 % | 1,379 | 99 % | 88 % | 0.40 | 12 % | 0.76 |
| All other teams | | | 3.0 | 17,016 | on the thrower | 150 | | | | 1,248 | 74 % | 37 % | 0.19 | 16.7 % | 1.00 |

— [out_team.txt, TEAM TABLE](E:/cg-tmp/tcf/research_smoke/out_team.txt); "all other teams" from [out_place.txt, P7c and team profiles](E:/cg-tmp/tcf/research_smoke/out_place.txt)

- None of the five top teams throws ahead of its own move (0 to 9 % of throws); we do it in 86 % of ours. Three of them (ATI x iHot, RNG, SoloLeveling) move away and drop the cloud behind them, towards the predator, and are out of it after two moves in 59 to 77 % of cases; Les Gens Bons stands still and smokes itself. We are still inside after four moves in 88 % of throws (field 37 %) and cover 0.40 team mates per throw (field 0.19, ATI x iHot 0.12, Les Gens Bons 0.04). — same sources
- The leader's style has the lowest thrower loss of the top five (ATI x iHot 10 %, ratio 0.58, 207 throws), the second-ranked team the highest (Les Gens Bons 23 %, ratio 1.38, 460 throws). Other "between" teams: RemoteException 0.69, Commit Happens 0.62 (y) and 0.90 (top), The Three Little Geeks 0.67, but also Hostile Foragers 0.97 to 1.05, RNG 0.97 to 1.09, J-BCM 1.25, Dot Matrix 1.31. Other "away" teams: Kogaion 0.72 (y) and 0.92 (top), BembelOutOfBoundsException 1.61. — [out_team.txt](E:/cg-tmp/tcf/research_smoke/out_team.txt)
- Across the 51 teams with 40+ games, "thrower still inside after 4 moves" correlates +0.22 with the caught ratio and -0.13 with mean rank; offset correlates -0.08 with the ratio and +0.09 with rank; mates inside correlates +0.16 with rank. All weak. — [out_team.txt](E:/cg-tmp/tcf/research_smoke/out_team.txt)
- Team catches in the 10 turns after a throw: on the thrower 0.37 to 0.54, between 0.34 to 0.52, on or past 0.36 to 0.50, away 0.55 to 0.78 (away throws are thrown from farther and by teams that hunt more; ours 0.67 over all free throws). — [out_place.txt, P2 and P7](E:/cg-tmp/tcf/research_smoke/out_place.txt)
- Natural experiment on the smoke pool. In our 65 debug games no opponent ever ordered more smokes than our pool held, so the pool is the same for the three players and the largest number of smoke orders by one team is a lower bound of it. Rank change per extra smoke in the pool, by the team's main placement (teams with 40+ throws): away -0.028 (463 games, 95 % range -0.061 to +0.006), between -0.013 (1,042 games, -0.044 to +0.011), on the thrower +0.015 (2,939 games, +0.001 to +0.030), on or past the predator +0.002 (875 games, -0.025 to +0.028). Les Gens Bons +0.061 (200 games, +0.006 to +0.108: rank 1.41 to 1.46 with a pool estimate up to 4, 1.76 with 5 or more); ATI x iHot -0.007 (57 games); us +0.028 (79 games, -0.061 to +0.132). — [out_pool.txt](E:/cg-tmp/tcf/research_smoke/out_pool.txt); pool check in [out_own.txt, lines "O5 smoke pool" and "O5 pool check"](E:/cg-tmp/tcf/research_smoke/out_own.txt)

### Inferences
- The Gold data gives no support for moving our centre (hypothesis B3): thrower survival with our placement is already better than expected (0.76) and as good as the "between" group (0.90). The only placement worth avoiding is the one already removed in v10 (past the predator: more nets on the throw turn, 7.3 % against 4.0 to 5.8 %, nets continuing afterwards, worst team ranks).
- Teams that smoke themselves and stay (on the thrower) are the only group whose rank gets worse, slightly, when the game has more smoke (+0.015 per smoke, range just above zero); teams that put the cloud between or away do not lose. The difference between styles is at most about 0.04 rank per smoke, so for a pool of 4 to 5 the whole style effect is under 0.2 rank and not separable from the rest of each bot.
- What does separate us from the top five is not the centre but what follows: we stay inside (88 % after 4 moves) and we blind mates (0.40 per throw). Section 4 looks at whether that costs anything.

### Gaps
- No team throws both "on the thrower" and "between" in numbers, so the untested middle of B3 cannot be judged from logs; it needs the switch and the replay test.
- Trees are not in the all-team logs, so "cloud blocks the line of sight to the predator" cannot be computed; only centre positions.
- ATI x iHot's low loss rate rests on 57 games and may come from its movement (it throws while moving away in 92 % of cases), not from the cloud.

## 2. Timing: predator distance at the throw, very near, beyond 1900, turns 1 to 3

### Takeaway
From turn 4 on, a free unit that orders smoke is never caught less often than a unit at the same distance that does not, in any distance bucket, even when only units with a predator moving straight at them are compared; so the logs show no protective effect of the cloud against being walked or dashed into. What the cloud does stop is nets (0.1 to 0.3 % of throwers netted per turn once the cloud is up, against 5.1 % on the throw turn itself), and the one place where smokers clearly do better is turns 1 to 3 while pursued (22.8 % caught against 35.7 %). Throws at 1500-1900 and at 1900-2300 look the same relative to non-smokers; the logs neither confirm nor contradict the simulation result that later is better.

### Cited Findings
Free units not already inside an own cloud, all 2,347 games, by start-of-turn predator distance:

| Predator distance | Smoke orders (n) | Order lost: thrower caught that turn | Smoke: caught 0-5 | No smoke: caught 0-5 (n unit-turns) | Pursued only, smoke: caught 0-5 (n) | Pursued only, no smoke (n) | Pursued, caught 0-8: smoke / none | Netted by predator in turns 0-2, pursued: smoke / none |
|---|---|---|---|---|---|---|---|---|
| under 700 | 2,079 | 14.8 % | 31.8 % | 31.2 % (30,307) | 33.3 % (1,378) | 32.1 % (21,823) | 36.6 / 39.6 % | 1.5 / 1.6 % |
| 700-1100 | 5,317 | 8.1 % | 26.6 % | 24.2 % (68,335) | 27.9 % (4,288) | 26.1 % (52,347) | 32.0 / 32.8 % | 3.7 / 3.7 % |
| 1100-1500 | 5,171 | 4.5 % | 22.0 % | 17.2 % (95,962) | 23.9 % (3,949) | 19.3 % (66,840) | 28.5 / 25.7 % | 7.8 / 5.5 % |
| 1500-1900 | 3,148 | 1.9 % | 16.8 % | 12.0 % (97,367) | 19.4 % (2,167) | 15.0 % (54,973) | 25.2 / 21.0 % | 9.3 / 6.2 % |
| 1900-2300 | 1,167 | 0.7 % | 12.3 % | 8.1 % (102,806) | 14.2 % (653) | 12.0 % (40,514) | 23.0 / 17.5 % | 8.3 / 4.9 % |
| 2300-3000 | 751 | 0.3 % | 10.0 % | 4.6 % (189,075) | 16.7 % (245) | 7.9 % (55,666) | 21.6 / 12.7 % | 4.1 / 3.0 % |
| 3000 and beyond | 823 | 0.0 % | 6.3 % | 2.7 % (127,015) | 11.8 % (228) | 5.1 % (32,546) | 14.9 / 9.2 % | 3.5 / 1.5 % |

— [out_timing.txt, table "T1 free units, all sets"](E:/cg-tmp/tcf/research_smoke/out_timing.txt); pursued columns from [out_more.txt, table Q1](E:/cg-tmp/tcf/research_smoke/out_more.txt)

- The same pattern holds in each data set separately. Smoke against no smoke, caught 0-5: `top` 28.4 / 24.5 % (700-1100), 23.8 / 17.9 % (1100-1500), 20.4 / 13.1 % (1500-1900), 11.9 / 8.7 % (1900-2300); `y` 25.4 / 24.0 %, 21.3 / 16.8 %, 14.9 / 11.3 %, 12.6 / 7.7 %. — [out_timing.txt, "T1 by set top", "T1 by set y"](E:/cg-tmp/tcf/research_smoke/out_timing.txt)
- It also holds with other controls: only unit-turns whose predator closed by 300+ since the last turn (26.6 / 25.9 %, 21.7 / 20.0 %, 16.3 / 14.8 %, 14.1 / 10.4 % for 700-1100 to 1900-2300); only teams that verifiably still had a smoke; only turns 4+; own dash ready or on cooldown. — [out_timing.txt, T1h, T1b, T1i](E:/cg-tmp/tcf/research_smoke/out_timing.txt); [out_more.txt, Q1d, Q1e, Q1f](E:/cg-tmp/tcf/research_smoke/out_more.txt)
- Exceptions where the smoker does better: (a) the predator dashes at the unit that turn from close range: caught 0-5 37.6 % with smoke (n 965) against 42.2 % without (n 6,519) at 700-1100, 46.8 % (188) against 53.6 % (1,565) under 700; net hits 2.4 % against 9.0 %. Whether the predator will dash is not known when the order is given; with "predator dash ready" as the condition the gain disappears (27.7 / 25.5 % at 700-1100, n 3,081 / 49,559). (b) Turns 1 to 3, below. — [out_more.txt, Q1b](E:/cg-tmp/tcf/research_smoke/out_more.txt); [out_timing.txt, T1c](E:/cg-tmp/tcf/research_smoke/out_timing.txt)

**Nets, the effect that is visible.**
- Free units already inside an own cloud are netted by a predator in the next three turns in 0.7 % (under 700), 0.7 %, 1.2 %, 0.9 %, 0.7 % (1900-2300) of unit-turns; units outside in 3.2 %, 4.0 %, 4.9 %, 4.6 %, 2.9 %. Their catch rate is not lower: 26.2 % against 24.2 % at 700-1100, 19.1 / 17.2 % at 1100-1500, 13.6 / 12.0 % at 1500-1900, 9.3 / 8.1 % at 1900-2300 (n 11,656 to 15,141 inside per bucket). — [out_timing.txt, "T1 free units, all sets", rows "already in own cloud"](E:/cg-tmp/tcf/research_smoke/out_timing.txt)
- Of 18,740 free throws, 5.1 % of throwers are netted by a predator on the throw turn itself (the cloud appears after the moves, together with the net), then 0.1 %, 0.2 %, 0.2 %, 0.2 %, 0.3 % on the five turns after. By distance, on the throw turn: 3.9 % (under 700), 4.2 %, 6.9 % (1100-1500), 7.2 % (1500-1900), 5.4 % (1900-2300), 1.3 % (2300-3000). On turns 1 to 3: 12.4 % on the throw turn (n 3,015), 0.3 to 0.6 % after; from turn 4: 3.8 % (n 15,725), then 0.1 to 0.2 %. Of the 965 throwers netted on the throw turn, 45 % are caught within five turns. — [out_netjoin.txt, X1, X2, X5](E:/cg-tmp/tcf/research_smoke/out_netjoin.txt)

**1500-1900 against 1900-2300 (the question added by the coordinator).**

| Measure (free units, 2,347 games) | 1500-1900 | 1900-2300 |
|---|---|---|
| Smoke orders | 3,148 | 1,167 |
| Thrower caught 0-5: smoke / no smoke at that distance | 16.8 % / 12.0 % (gap +4.8) | 12.3 % / 8.1 % (gap +4.2) |
| Pursued only: smoke / no smoke | 19.4 % (n 2,167) / 15.0 % (gap +4.4) | 14.2 % (n 653) / 12.0 % (gap +2.2) |
| Pursued, turn 4 or later: smoke / no smoke | 19.0 % (1,818) / 14.1 % | 14.4 % (487) / 11.3 % |
| Deployed clouds, thrower caught 1-5, set `top` / set `y` | 18.3 % (n 1,144) / 13.3 % (1,942) | 11.3 % (495) / 11.2 % (722) |
| Order lost with the thrower | 1.9 % | 0.7 % |
| Thrower netted on the throw turn | 7.2 % (n 3,236) | 5.4 % (n 1,248) |
| Team catches in the next 10 turns: smoke / no smoke | 0.47 / 0.35 | 0.52 / 0.38 |
| Same, pursued and turn 4+ | 0.36 / 0.27 | 0.33 / 0.29 |
| Same by set: `top` smoke / none; `y` smoke / none | 0.56 / 0.38; 0.42 / 0.34 | 0.60 / 0.40; 0.46 / 0.36 |

— [out_timing.txt, T1](E:/cg-tmp/tcf/research_smoke/out_timing.txt); [out_more.txt, Q1, Q1e](E:/cg-tmp/tcf/research_smoke/out_more.txt); [out_smoke2.txt, R5c](E:/cg-tmp/tcf/research_smoke/out_smoke2.txt); [out_netjoin.txt, X1](E:/cg-tmp/tcf/research_smoke/out_netjoin.txt)

- A thrower at 1500-1900 is caught more often than one at 1900-2300, but a non-smoker is too, by the same margin; the gap between smokers and non-smokers is +4.8 and +4.2 points (pursued: +4.4 and +2.2). The team's catches in the following 10 turns are not lower after the later throw (0.47 against 0.52; pursued, turn 4+: 0.36 against 0.33). — same sources
- Our own throws, 65 debug games, free throwers (224): by the nearest predator we saw at the start of the turn: under 1100 27 % (12 % caught in 5), 1100-1500 29 % (12 %), 1500-1900 36 % (81 throws, 11 %), 1900-2300 7 % (16 throws, 13 %, weak). By the measure used in the battle note (predator's seen position to our position after the move): 1100-1500 9 %, 1500-1900 38 % (86 throws, 8 % caught in 5), 1900-2300 51 % (114 throws, 13 %), one throw beyond 2300. — [out_own.txt, lines "O6 our throws", block "all"](E:/cg-tmp/tcf/research_smoke/out_own.txt)
- Our 79 arena games, true start-of-turn distance, free throws per game: under 700 0.27, 700-1100 0.68, 1100-1500 0.92, 1500-1900 0.95, 1900-2300 0.19, 2300-3000 0.06, 3000+ 0.16, predator position unknown 0.34 (3.58 per game in total). All teams: 0.26, 0.72, 0.73, 0.46, 0.18, 0.12, 0.13, 0.07 (2.66). Median distance: us 1,379; ATI x iHot 1,396; Les Gens Bons 1,363; RNG 1,063; SoloLeveling 1,746; Lore 1,168; all other teams 1,248. — [out_us.txt](E:/cg-tmp/tcf/research_smoke/out_us.txt); [out_team.txt](E:/cg-tmp/tcf/research_smoke/out_team.txt)

**Very near: is the smoke wasted?**
- Under 700 the order is lost with the thrower in 14.8 % of cases and the thrower is caught 0-5 as often as a non-smoker (31.8 / 31.2 %; pursued 33.3 / 32.1 %). At 700-1100: 8.1 % lost, 26.6 / 24.2 % (pursued 27.9 / 26.1 %). Held throwers lose the order in 56.3 % (under 700), 39.9 % (700-1100), 18.2 % (1100-1500), 7.8 % (1500-1900) of cases. — [out_timing.txt, T1](E:/cg-tmp/tcf/research_smoke/out_timing.txt); [out_smoke2.txt, last two lines](E:/cg-tmp/tcf/research_smoke/out_smoke2.txt)
- Over all teams 9.7 % of smoke orders (2,307 of 23,725) never become a cloud because the thrower is caught that turn: 0.33 per team-game. For us 11 of 328 (3 %), 0.14 per game. — [out_us.txt](E:/cg-tmp/tcf/research_smoke/out_us.txt)
- We throw 0.95 free smokes per game with the predator under 1100 (75 throws, 20 % caught in 5; field 0.98 per game, 20 %). — [out_us.txt](E:/cg-tmp/tcf/research_smoke/out_us.txt)

**Beyond 1900: would nothing have happened?**
- Without smoke, a free unit with the nearest predator at 1900-2300 is caught 0-5 in 8.1 % of unit-turns (pursued 12.0 %), at 2300-3000 in 4.6 % (7.9 %), beyond 3000 in 2.7 % (5.1 %). Units that smoke there are caught in 12.3 %, 10.0 %, 6.3 %. So at 2300 and beyond at least 90 % of the clouds answer no catch in the next five turns. — [out_timing.txt, T1](E:/cg-tmp/tcf/research_smoke/out_timing.txt)
- Beyond 2300 (true distance) the field throws 0.25 free smokes per team-game (1,743 throws, 8 % caught in 5); we throw 0.23 (18 throws in 79 games, none caught, weak). In the debug games 11 of our 224 free throws (5 %) were at a true distance over 3000 although we saw something nearer: an enemy decoy looks like a unit, so some of these are probably smokes against a decoy (not verified one by one). — [out_us.txt](E:/cg-tmp/tcf/research_smoke/out_us.txt); [out_own.txt, "O6 our throws by nearest predator in truth"](E:/cg-tmp/tcf/research_smoke/out_own.txt)

**Turns 1 to 3 against later.**

| Free units, turns 1-3, all games | Smoke: n | Smoke: caught 0-5 | No smoke: caught 0-5 (n) | Netted by predator 0-2: smoke / none | Own catch within 3 turns: smoke / none |
|---|---|---|---|---|---|
| Pursued, predator under 1500 | 1,102 | 22.8 % | 35.7 % (6,741) | 19.1 / 35.4 % | 4.0 / 4.3 % |
| Pursued, 1500-2300 | 515 | 19.2 % | 24.9 % (6,616) | 17.9 / 27.1 % | 3.5 / 5.4 % |
| Pursued, 2300+ | 178 | 10.1 % | 12.5 % (5,342) | 5.6 / 9.9 % | 3.9 / 8.5 % |
| Not pursued, under 1500 | 451 | 16.6 % | 18.1 % (4,609) | 14.4 / 16.3 % | 7.5 / 8.0 % |
| Not pursued, 1500-2300 | 320 | 9.1 % | 8.6 % (7,818) | 5.9 / 6.3 % | 8.8 / 11.0 % |
| Not pursued, 2300+ | 294 | 5.8 % | 4.6 % (13,007) | 2.0 / 2.2 % | 7.5 / 11.7 % |

— [out_more.txt, table E2](E:/cg-tmp/tcf/research_smoke/out_more.txt)

- Deployed free throws by turn: turns 1-3 (n 3,015) thrower caught 1-5 16.1 %, netted by predator in turns 0-2 13.4 %; turns 4-10 (2,600) 18.5 %, 9.4 %; turns 11-30 (5,681) 16.2 %, 4.7 %; turn 31+ (7,444) 17.0 %, 1.4 %. — [out_smoke2.txt, R6](E:/cg-tmp/tcf/research_smoke/out_smoke2.txt)
- Inside one team, games with a smoke on turns 1-3 against games without (31 teams with 15+ of each): rank better with the early smoke in 17 teams, weighted mean difference -0.04 rank, +0.27 catches by turn 10, +0.12 units lost by turn 10. Us: 1.81 (54 games) against 1.84 (25 games). — [out_team.txt, G5](E:/cg-tmp/tcf/research_smoke/out_team.txt)

**How much smoke we have.** In the 65 debug games our pool held 4.51 smokes on average and we ordered 4.03; we used the whole pool in 50 games (77 %), it was empty by turn 30 in 26 games (40 %), the median turn of our last smoke order is 30. Our mean rank by pool size: 0-1 smokes 1.00 (3 games, weak), 2-3: 1.67 (15, weak), 4-5: 1.68 (31), 6+: 1.81 (16, weak); halves 1.66 (mean pool 3.1) against 1.70 (5.9). — [out_own.txt, lines "O5 smoke pool", "O5 pool check", block "all"](E:/cg-tmp/tcf/research_smoke/out_own.txt)

### Inferences
- The cloud is a tool against nets, not against a predator that is already coming: nets on a unit under a cloud drop to about a fifth, catches do not drop. This fits the rules (the cloud hides, it does not block movement) and the opening, where nets are densest (13.4 % of early throwers netted within three turns) and smoke shows its only clear survival gain.
- On "throw later": the logs do not show that a cloud thrown at 1900-2300 protects more, or less, than one thrown at 1500-1900. What they do show is the price of each side. Waiting costs: orders lost with the thrower rise from 0.7 % (1900-2300) to 1.9 %, 4.5 % and 8.1 % as the distance shrinks, and a net on the throw turn is slightly more frequent at 1500-1900 (7.2 %) than at 1900-2300 (5.4 %). Throwing early costs smokes: we empty the pool in 77 % of games, in 40 % by turn 30. Neither cost is large per throw, which is consistent with a small net effect in either direction; the simulation result is not contradicted.
- The units matter: if `P_SMOKE_D` is the distance from the predator to our position after the move (the measure of the battle note), a value of 1500 to 1800 removes or delays about half of our present free throws (51 % are at 1900-2300 in that measure) and means throwing with the predator about 900 to 1200 from where the unit stands at the start of the turn when it walks away, i.e. at the edge of the dash-strike range (1,040), where 8 % of orders are lost with the thrower. In start-of-turn distance we are not early compared with the top five today (median 1,379 against 1,063 to 1,746).
- More smoke in our pool does not lift our rank (1.66 against 1.70, slope +0.028 per smoke on the 79 arena games), so in Gold our edge over opponents does not come from smoke, unlike on the local referee (no-smoke variant 2.35 against 1.97 in `kb/gold.md`). The local opponents are our own bots.

### Gaps
- Causality: a bot's smoke trigger selects the endangered units, so the "+4 points" for smokers is not the effect of smoke. An honest test needs the switch (`P_SMOKE_D`) on replays of real Gold battles, counted as paired games.
- The all-team logs have no trees and no sight information, so "predator with a clear net line" cannot be separated from "predator behind a tree".
- Whether the first-turn smoke that saves pursued units would have been as good one turn earlier or later cannot be seen: turn 1 has no earlier turn.

## 3. Smoke by a held unit against a free unit, and against no smoke at all

### Takeaway
A cloud that is already there when the predator's net lands (thrown before, or on the same turn) goes with 43 % of the held units caught within five turns against 68 % with no smoke; a smoke ordered by the held unit after the hit changes nothing (74 % caught, and 57 % against 53 % among those that survive the first held turn). A held unit that throws a net instead is caught far less often at 1100 to 1900.

### Cited Findings
Net hits by a predator on a free unit, all 2,347 games (8,902 episodes; 1.26 per team-game; 65.9 % caught within five turns), by distance of the nearest predator right after the hit:

| Nearest predator after the hit | Already under an own cloud when the net landed | Held unit orders smoke on its first held turn | No smoke on the first held turn |
|---|---|---|---|
| All | 43.4 % caught in 5 (n 1,087); 14.9 % on the next turn | 73.8 % (n 1,837); 38.5 % | 67.6 % (n 5,910); 30.6 % |
| under 700 | 53.9 % (414) | 84.3 % (604) | 74.4 % (1,880) |
| 700-1100 | 42.9 % (380) | 77.0 % (609) | 73.7 % (1,767) |
| 1100-1500 | 33.0 % (215) | 64.4 % (475) | 62.1 % (1,392) |
| 1500-1900 | 19.2 % (73) | 49.6 % (137) | 51.0 % (749) |
| 1900-2300 | 20 % (5, weak) | 25 % (12, weak) | 41.7 % (115) |

— [out_net.txt, tables N1 and N2](E:/cg-tmp/tcf/research_smoke/out_net.txt)

- Both sets agree: `top` 42.8 % (n 437) / 79.2 % (624) / 69.4 % (2,334); `y` 44.4 % (615) / 71.2 % (1,141) / 66.3 % (3,374). Top five teams: 40.0 % (90) / 78.7 % (141) / 62.7 % (461). Us (79 games, 88 predator net hits = 1.11 per game): 27.8 % (5 of 18, weak) / 88.9 % (16 of 18, weak) / 51.9 % (27 of 52). — [out_net.txt, N7, N8](E:/cg-tmp/tcf/research_smoke/out_net.txt)
- Among units that survive the first held turn, caught on turns 2 to 5: ordered smoke 57.4 %, no smoke 53.3 %, cloud already there 33.5 % (computed from the two columns of N1: (73.8 - 38.5) / (100 - 38.5), (67.6 - 30.6) / 69.4, (43.4 - 14.9) / 85.1). — [out_net.txt, N1](E:/cg-tmp/tcf/research_smoke/out_net.txt)
- What the held unit orders on its first held turn, caught in 5: at 1100-1500 NET 43.1 % (n 534), SMOKE 64.4 % (475), neither 73.3 % (874), covered already 33.0 % (215); at 1500-1900 NET 37.0 % (119), SMOKE 49.6 % (137), neither 53.7 % (633), covered 19.2 % (73); at 700-1100 NET 68.8 % (823), SMOKE 77.0 % (609), neither 77.8 % (961), covered 42.9 % (380); under 700 NET 82.3 % (717), SMOKE 84.3 % (604), neither 69.5 % (1,195), covered 53.9 % (414). — [out_net.txt, N4](E:/cg-tmp/tcf/research_smoke/out_net.txt)
- A mate's net on a predator within 2000 of the held unit (turn of the hit to +3): caught in 5 35.1 % (n 1,686, no smoke) and 41.1 % (192, with smoke) against 80.6 % (4,224) and 64.0 % (2,800) without such a net. This comparison is biased (a unit caught at once leaves no time for a rescue): only 4.9 % of the "rescued" are caught on the next turn against 40.8 %. — [out_net.txt, N6](E:/cg-tmp/tcf/research_smoke/out_net.txt)
- Per unit-turn view (held units, by start-of-turn distance): already in an own cloud 42.3 % caught 0-5 at 700-1100 (n 2,097), 30.7 % at 1100-1500 (1,613), 20.6 % at 1500-1900 (963); no smoke 64.0 %, 53.1 %, 40.3 %; smoke ordered that turn 76.4 %, 64.1 %, 44.1 %. — [out_timing.txt, T4b](E:/cg-tmp/tcf/research_smoke/out_timing.txt)
- Free against held throwers (deployed clouds): free 16.8 % caught 1-5 (n 18,740), held 41.5 % (n 2,677). Smokes by held units: 0.38 per team-game in the field, 0.43 per game for us (34 in 79 games). Our debug games (65): held throwers 34, caught in 5 by seen distance 43 % at 1100-1500 (n 7, weak) and 56 % at 1500-1900 (n 9, weak). — [out_place.txt, P8](E:/cg-tmp/tcf/research_smoke/out_place.txt); [out_us.txt](E:/cg-tmp/tcf/research_smoke/out_us.txt); [out_own.txt, "O6 ... held thrower"](E:/cg-tmp/tcf/research_smoke/out_own.txt)
- Our debug games, held units with a predator (true) within 1500: inside an own cloud 37 % caught within 5 (26 of 70), outside 66 % (77 of 117), z -3.8. — [out_own.txt, O4, block "all"](E:/cg-tmp/tcf/research_smoke/out_own.txt)
- Units netted by their prey (6,078 episodes) are caught in 10.2 % of cases whatever they do (no smoke 9.5 %, n 5,797). — [out_net.txt, N0, N5](E:/cg-tmp/tcf/research_smoke/out_net.txt)

### Inferences
- The order of events decides. A cloud that exists when the net lands hides the fact that the unit is held; the predator must walk into a cloud without knowing. A cloud that appears one turn later hides a unit whose position the predator already knows and which cannot move: it walks to the spot. That reading fits all three columns and both data sets.
- For us the held-unit smoke is 0.43 smokes per game (about a tenth of the pool) with no measurable return. If a net is in the pool, a net at the hunter from the held unit goes with 21 points fewer catches than a smoke at 1100-1500 (43.1 against 64.4 %) and 13 points at 1500-1900. If there is no net, keeping the smoke costs nothing measurable.
- The largest smoke lever in the data is to be under a cloud BEFORE the net: 0.89 predator net hits per game land on units of ours with no cloud (70 of 88), and the field difference is 24 points (43 against 68 %). That is an argument for keeping the net-line trigger early, and against delaying smoke where the predator can net this turn.

### Gaps
- "Already under a cloud" includes clouds thrown on the same turn as the net (the thrower guessed right) and older clouds; the two were not separated.
- Held units that smoke may be those with the predator already committed; the comparison by distance bucket removes most but not all of that.
- Whether the held unit had a net left is not visible in the all-team logs.

## 4. Inside our own cloud (our games, debug replays)

### Takeaway
Our units spend 34 unit-turns per game inside our own clouds (12 % of living unit-turns), 25 of them with no predator within 1500, and inside they loop (a third of three-turn windows cover less than half the distance walked, against a sixth outside). But time inside does not go with fewer catches or a worse rank: units inside a cloud catch more, not less, at the same prey distance, in our games and in all 2,347 games.

### Cited Findings
65 debug games (39 v10 + 26 v12); values for v10 alone in brackets where they differ.

- Volume: 2,227 of 19,271 living unit-turns inside an own cloud (12 %; v10 1,386 of 11,807), 34.3 per game. By true predator distance: under 1500 28 %, 1500-2300 26 %, 2300+ or none 46 %; 24.7 unit-turns per game are inside with no predator within 1500 (v10 26.3). — [out_own.txt, O1, block "all"](E:/cg-tmp/tcf/research_smoke/out_own.txt)
- Episodes (a unit's consecutive turns inside): 442, 6.8 per game.

| Who | Episodes (per game) | Turns inside, mean / median | 6+ turns | Caught inside | Walked out before the cloud ended | Stayed until it ended | Distance walked | Net displacement | Net / walked | Catches made per episode |
|---|---|---|---|---|---|---|---|---|---|---|
| Thrower | 250 (3.85) | 6.1 / 6 | 55 % | 19 % | 56 % | 24 % | 3,851 | 1,892 | 0.58 | 0.12 |
| Mate, cloud thrown over it | 84 (1.29) | 4.6 / 4 | 36 % | 5 % | 79 % | 17 % | 2,853 | 1,626 | 0.70 | 0.08 |
| Mate that walked into a cloud | 108 (1.66) | 2.8 / 2 | 7 % | 6 % | 39 % | 55 % | 1,704 | 1,177 | 0.77 | 0.03 |
| Thrower, predator under 1500 at entry | 159 (2.45) | 5.9 / 6 | 52 % | 23 % | 56 % | 19 % | 3,817 | 1,940 | 0.60 | 0.09 |
| Thrower, predator 2300+ | 31 (0.48) | 6.1 / 5 | 48 % | 3 % | 71 % | 26 % | 3,906 | 1,823 | 0.55 | 0.10 |
| Mate under a new cloud, predator 2300+ | 48 (0.74) | 4.9 / 5 | 40 % | 4 % | 71 % | 25 % | 2,868 | 1,469 | 0.66 | 0.06 |
| Mate under a new cloud, predator under 1500 | 14 (0.22, weak) | 3.9 / 2 | 29 % | 7 % | 93 % | 0 % | 2,753 | 1,510 | 0.72 | 0.00 |

— [out_own.txt, O3, block "all"](E:/cg-tmp/tcf/research_smoke/out_own.txt)

- Movement: free units inside walk every turn (0 % standing, 86 % full walk, 7 to 8 % dash; outside 5 to 8 % standing). Over three consecutive turns inside, net displacement / distance walked is 0.68 on average (median 0.74) against 0.80 (0.93) outside; under 0.5 ("looping") in 32 % of windows inside (n 1,293) against 16 % outside (n 15,150). With a predator within 1500: 0.74 inside (21 % looping, n 346) against 0.93 outside (2 % looping, n 2,005). With no predator within 2500: 0.65 (38 % looping, n 483) against 0.78 (19 %, n 11,098). — [out_own.txt, O2, block "all"](E:/cg-tmp/tcf/research_smoke/out_own.txt)
- Looping with a predator within 1500, inside the cloud: caught in the six turns after the window in 15 % (16 of 110) against 10 % (14 of 143) for windows with net / walked of 0.9 or more; z about 1.1, not significant. — [out_own.txt, O2b, block "all"](E:/cg-tmp/tcf/research_smoke/out_own.txt)
- Sight: when a prey is truly within 1500 of our unit, the team sees a prey near that unit in 27 % of unit-turns if the unit is inside our cloud (53 of 195) against 76 % outside (1,210 of 1,589). Unit-turns inside our cloud with a prey within 2000: 5.9 per game, 4.6 of them with no predator within 1500. — [out_own.txt, O4 "team sees a prey", O7, block "all"](E:/cg-tmp/tcf/research_smoke/out_own.txt)
- Catches made by the unit within three turns, inside our cloud against outside, same true prey distance: prey under 1000: 60 % (45 of 75) against 50 % (202 of 405), z 1.6; 1000-1500: 35 % (38 of 108) against 19 % (198 of 1,044), z 4.0; 1500-2500: 12 % (47 of 394) against 7 % (185 of 2,816), z 3.9. — [out_own.txt, O4](E:/cg-tmp/tcf/research_smoke/out_own.txt)
- The same in all 2,347 games, every team (free units): prey under 1000: 36.4 % inside an own cloud (n 3,001) against 23.2 % outside (n 43,968); 1000-1500: 21.8 % (5,088) against 12.6 % (69,383); 1500-2000: 12.9 % (7,184) against 7.2 % (77,309); 2000-3000: 6.6 % against 3.3 %. Restricted to units with no predator within 1500: 35.5 / 22.8 %, 21.5 / 12.5 %, 12.6 / 7.4 %, 6.7 / 3.4 %. It does not depend on the age of the cloud (prey 1000-1500: 22.0 % at age 1-3, 23.4 % at 4-6, 18.6 % at 7-9). — [out_more.txt, I2, I2b, I2c](E:/cg-tmp/tcf/research_smoke/out_more.txt)
- Being caught, inside against outside, our games: predator under 1100: 29 % (81 of 281) against 17 % (257 of 1,501); 1100-1500: 19 % (51 of 271) against 13 % (105 of 785); 1500-2300: 7 % (39 of 563) against 9 % (152 of 1,673); 2300+ or none: 3 % (31 of 1,008) against 1 % (159 of 12,710). — [out_own.txt, O4](E:/cg-tmp/tcf/research_smoke/out_own.txt)
- All teams, free units, caught 0-5 at 1500-1900 / 1900-2300 / 2300-3000: inside own throw 12.8 / 9.0 / 5.4 %, inside a mate's cloud 16.7 / 10.4 / 6.9 %, outside 12.1 / 8.1 / 4.7 %; netted by a predator in turns 0-2: 0.8 / 0.6 / 0.4 %, 1.4 / 1.0 / 0.8 %, 4.7 / 2.9 / 1.5 %. — [out_more.txt, I1](E:/cg-tmp/tcf/research_smoke/out_more.txt)
- Throwers that leave: free throwers of all teams alive two moves after the throw and not netted: left the cloud: caught in turns +3 to +8 11.6 % (n 4,549), own catches in the next 10 turns 0.10, team catches 0.43; still inside: 13.7 % (n 11,636), 0.13, 0.46. By distance the leavers are caught 0.2 to 4.7 points less and catch 0.02 to 0.08 less. — [out_team.txt, "leaving against staying"](E:/cg-tmp/tcf/research_smoke/out_team.txt)
- Game level (65 games): share of living unit-turns inside our cloud 10 % in wins (n 31), 12 % in non-wins (n 34); low half (7 %) mean rank 1.66 and 3.25 catches, high half (15 %) 1.70 and 3.73. Turns 1 to 30: 19 % in wins, 21 % in non-wins; low half (11 %) rank 1.75, high half (29 %) 1.61. Unit-turns inside with no predator within 1500: 22.1 in wins, 27.1 in non-wins; low half (10.0) rank 1.66 and 2.94 catches, high half (39.0) 1.70 and 4.03. v10 alone, whole game: low half 1.42 (n 19, weak), high half 1.75 (n 20, weak). — [out_own.txt, O5, blocks "all" and "v10"](E:/cg-tmp/tcf/research_smoke/out_own.txt)

### Inferences
- Blindness inside our cloud is real (prey nearby is seen 27 % of the time instead of 76 %) but it does not show up as lost catches. A cloud hides our hunters from prey as much as it hides prey from us; prey that cannot see a hunter does not run from it. Units inside catch 1.6 to 1.8 times as often at the same prey distance, in every data set, also without a predator near.
- So "time inside" is not what lost battle 924177559; that battle (62 % of the first 30 turns inside) is three times our usual share and the game-level comparison is flat (1.66 against 1.70).
- Threatened and unthreatened units behave alike inside: both walk every turn and both loop. Throwers walk 3,850 and end 1,890 from where they started. The loop is a defect (21 % looping with a predator within 1500 against 2 % outside) but its cost is not established (15 against 10 % caught, 253 windows).
- A mate that ends up under a cloud thrown for somebody else (1.3 per game, 57 % of them with no predator within 2300) leaves on its own in 79 % of cases after 4 to 5 turns; it is not safer inside (all teams: 16.7 / 10.4 % caught inside a mate's cloud against 12.1 / 8.1 % outside) but it is netted less (1.0 to 1.4 % against 2.9 to 4.7 %).

### Gaps
- The catch advantage inside a cloud may partly be a position effect (clouds are thrown where the fight is). It is the opposite of the feared effect, so the conclusion "no visible catch cost" stands, but "smoke helps hunting" would need its own test.
- 65 games, 26 of them replays of the same battles with v12: every game-level split has a standard error near 0.2 rank.
- Enemy positions in these games are reconstructed; our own are exact.

## 5. Several predators near: does a second cloud within 2 turns and 1900 change anything?

### Takeaway
No. The thrower of a second or simultaneous overlapping cloud is caught exactly as often as the thrower of a single cloud (19.6 to 20.2 % against 19.9 %), also with two or more predators near (29.6 to 31.5 % against 26.4 %), and the team loses more units in the next five turns, not fewer. The situation is rare: 0.16 overlapping throws per team-game, 0.15 for us.

### Cited Findings
All deployed clouds, 2,347 games (free and held throwers):

| Class | Throws | Thrower caught 1-5 | Team units lost in the next 5 turns | Team catches in the next 10 | Mean rank |
|---|---|---|---|---|---|
| Single cloud | 19,952 | 19.9 % | 0.37 | 0.46 | 1.93 |
| Same-turn pair (another own cloud within 1900 that turn) | 449 | 19.6 % | 0.54 | 0.58 | 2.01 |
| Second cloud (own cloud within 1900 thrown 1-2 turns before) | 684 | 20.2 % | 0.43 | 0.63 | 2.08 |
| Thrower already inside an older own cloud (3-8 turns old) | 332 | 16.6 % | 0.36 | 0.46 | 2.02 |
| 2+ predators within 2500: single | 5,743 | 26.4 % | 0.44 | 0.46 | 1.92 |
| 2+ predators within 2500: same-turn pair | 142 | 29.6 % | 0.75 | 0.59 | 1.99 |
| 2+ predators within 2500: second cloud | 235 | 31.5 % | 0.55 | 0.60 | 2.20 |
| 1 predator within 2500: single / pair / second | 12,292 / 241 / 316 | 18.7 / 17.0 / 18.0 % | 0.35 / 0.47 / 0.40 | 0.44 / 0.53 / 0.57 | 1.93 / 2.04 / 2.07 |

— [out_smoke2.txt, tables R4 and R4b](E:/cg-tmp/tcf/research_smoke/out_smoke2.txt)

- Number of predators within 1500 of a thrower (all throws): one: 22.8 % caught 1-5 (n 12,019); two or more: 28.1 % (n 1,778); none: 13.4 % (n 7,620). — [out_smoke2.txt, R4d](E:/cg-tmp/tcf/research_smoke/out_smoke2.txt)
- Team-games with at least one overlapping pair: field 567 of 6,416 (mean rank 2.05 against 2.02 without); top five 57 of 546 (1.95 against 1.72); us 6 of 79 (2.17 against 1.79, weak). Pairs per team-game: field 0.16, us 0.10; overlapping throws: us 12 in 79 games (0.15 per game). — [out_team.txt, G3 and last two lines](E:/cg-tmp/tcf/research_smoke/out_team.txt); [out_us.txt](E:/cg-tmp/tcf/research_smoke/out_us.txt)

### Inferences
- One cloud of radius 1,900 already covers every unit a second cloud within 1,900 would cover; the logs show no extra safety from the second one. The worse team figures (more losses, worse rank) come with the situation (several units under pressure at once), not from the second cloud.
- The second cloud costs one smoke out of 4.5; at 0.10 to 0.15 per game that is about 3 % of our pool.

### Gaps
- Which predator each cloud was meant for is not in the logs, so "two predators from two sides, two clouds" could not be isolated beyond the count of predators within 2500.

## 6. Hypotheses B1, B2, B3, B4, B7 from `kb/battle-924177559.md`

### Takeaway
B4 (no early smoke unless pursued) and B7 (one cloud per group) are supported but small (0.1 to 0.2 cases per game). B2 (smoke only when the predator can act) is supported at the two ends (beyond 2300 and under 1100, together 1.2 throws per game) and undecided for 1500 to 2300. B1 (leave the cloud when unthreatened) and B3 (centre on or towards the thrower's back) get no support: the data contradict their premise.

### Cited Findings

| # | Situation per game (us) | For | Against | Reading |
|---|---|---|---|---|
| B1: unthreatened unit leaves our cloud at once | 24.7 unit-turns per game inside with no predator within 1500 (65 debug games); mates under a new cloud 1.29 episodes per game, 4.6 turns each; throwers 3.85 episodes, 6.1 turns | Leavers are caught slightly less (11.6 % against 13.7 % in turns +3 to +8, all teams, n 4,549 / 11,636). Prey near a unit of ours is seen 27 % of the time inside against 76 % outside | Units inside an own cloud catch more at the same prey distance (21.8 against 12.6 % at 1000-1500, all teams; ours 35 against 19 %); leavers catch less (0.10 against 0.13 own catches in 10 turns); they are netted 3 to 5 times more often outside (2.9 to 4.7 % against 0.6 to 1.4 % per three turns); game-level rank flat (1.66 against 1.70, 65 games) | Not supported. Large in volume, no measured gain, a measured net risk |
| B2: smoke only against a predator that can act (inside about 1500, or a clear net line) | Free throws per game by true start distance: under 1100 0.95, 1100-1500 0.92, 1500-1900 0.95, 1900-2300 0.19, beyond 2300 0.23 (79 arena games). In the after-move measure 51 % of our free throws are at 1900-2300 (1.75 per game, debug games) | Beyond 2300 a non-smoker is caught 0-5 in 2.7 to 4.6 % (pursued 5.1 to 7.9 %): nine clouds in ten answer nothing. No bucket shows smokers surviving better from turn 4. We empty the pool in 77 % of games, 40 % by turn 30 | The cloud's measurable effect is on nets, and nets land at 1100 to 2300: 5.5 %, 6.2 %, 4.9 % of pursued non-smokers netted within three turns at 1100-1500, 1500-1900, 1900-2300, and 9.0 to 12.9 % when the predator dashes. A cloud that is there when the net lands: 43 % caught against 68 %. Orders lost with the thrower: 0.7 % at 1900-2300, 1.9 % at 1500-1900, 4.5 % at 1100-1500, 8.1 % at 700-1100 | Supported for "beyond 2300 true distance" and "decoy-like targets" (0.23 per game). Undecided between 1500-1900 and 1900-2300 (gap to non-smokers +4.8 and +4.2 points; team catches 0.47 and 0.52). The "clear net line" half of B2 is the part the data backs |
| B3: centre on the thrower or between thrower and predator instead of 900 ahead | Every free throw: 3.58 per game | "Between" has the lowest raw catch rate under 1500 (14.4 against 19.2 % at 1100-1500); the leader throws between and leaves (10 % caught, ratio 0.58) | Our placement already has ratio 0.76 (12 % caught against 16 % expected); "away" teams 0.91, "between" 0.90, "on the thrower" 0.98; only one team uses both classes; "on the thrower" is the only style that loses rank when the pool grows (+0.015 per smoke) and the second-ranked team that uses it has the highest thrower loss of the top five (23 %, ratio 1.38) | Not supported. Centre on the thrower is, if anything, the worse of the two proposals |
| B4: no smoke on turns 1-3 while a prey is nearer than the predator, or while the predator moves away | Early free throws 0.97 per game (77 in 79 games): 44 pursued, 14 not pursued (0.18 per game), 6 with a prey nearer than the predator (0.08 per game), 19 with no predator position. Debug games: 66 early throws, 8 with a prey truly nearer (0.12 per game), 4 with a prey seen nearer | Not pursued, turns 1-3: smoke changes nothing for survival (16.6 / 18.1 %, 9.1 / 8.6 %, 5.8 / 4.6 %) and goes with fewer own catches in three turns (8.8 against 11.0 % at 1500-2300, 7.5 against 11.7 % beyond). Prey nearer than predator: own catch within 3 turns 12.2 % with smoke (n 180) against 18.2 % (n 4,857) at 1500-2300; 8.9 % (n 282) against 16.3 % (n 11,333) beyond 2300; caught 10.0 / 9.9 % and 5.7 / 4.5 % | Pursued on turns 1-3 the smoke is the best-supported use in the whole data: 22.8 against 35.7 % caught, 19.1 against 35.4 % netted (n 1,102 / 6,741). Inside one team, early-smoke games are not worse (-0.04 rank, 31 teams) | Supported as written (the two conditions), but it concerns 0.1 to 0.2 throws per game. The early smoke itself must stay |
| B7: one smoke per group per turn | 0.15 overlapping throws per game (12 in 79 games); field 0.16 | Second or simultaneous cloud: thrower caught 19.6 to 20.2 % against 19.9 % single; with 2+ predators 29.6 to 31.5 % against 26.4 % | Nothing against | Supported, small: saves about 0.1 smoke per game |

— B1: [out_own.txt O1, O3, O4, O5](E:/cg-tmp/tcf/research_smoke/out_own.txt), [out_more.txt I1, I2](E:/cg-tmp/tcf/research_smoke/out_more.txt), [out_team.txt "leaving against staying"](E:/cg-tmp/tcf/research_smoke/out_team.txt). B2: [out_timing.txt T1](E:/cg-tmp/tcf/research_smoke/out_timing.txt), [out_more.txt Q1, Q1b](E:/cg-tmp/tcf/research_smoke/out_more.txt), [out_net.txt N1](E:/cg-tmp/tcf/research_smoke/out_net.txt), [out_us.txt](E:/cg-tmp/tcf/research_smoke/out_us.txt), [out_own.txt O5, O6](E:/cg-tmp/tcf/research_smoke/out_own.txt). B3: [out_team.txt](E:/cg-tmp/tcf/research_smoke/out_team.txt), [out_place.txt P2](E:/cg-tmp/tcf/research_smoke/out_place.txt), [out_pool.txt](E:/cg-tmp/tcf/research_smoke/out_pool.txt). B4: [out_more.txt E1, E2](E:/cg-tmp/tcf/research_smoke/out_more.txt), [out_us.txt](E:/cg-tmp/tcf/research_smoke/out_us.txt), [out_own.txt O6](E:/cg-tmp/tcf/research_smoke/out_own.txt), [out_team.txt G5](E:/cg-tmp/tcf/research_smoke/out_team.txt). B7: [out_smoke2.txt R4, R4b](E:/cg-tmp/tcf/research_smoke/out_smoke2.txt), [out_us.txt](E:/cg-tmp/tcf/research_smoke/out_us.txt).

### Inferences
- By size of the situation: B3 (3.6 throws per game) and B1 (25 unit-turns per game) are the big ones and the data does not back them; B2 touches 0.2 (far end) to 1.75 (if the threshold is in the after-move measure) throws per game and is backed only at the far end; B4 and B7 are backed and tiny.
- A sixth item not in the list comes out stronger than any of the five: smoke by held units (0.43 per game for us, no measured effect) and its mirror, a cloud in place before the net (24 points fewer catches).

### Gaps
- None of the five has been tested with a switch on real battles; every "for" above is an association.

## 7. Ranked list: smoke changes most likely to improve rank in Gold

### Takeaway
The data backs three kinds of change: stop spending smoke where it shows no effect (held units after the hit, beyond 2300, under 700), keep and sharpen the one use that shows an effect (a cloud in place before a net can land, above all on turns 1 to 3 when pursued), and leave placement and time-in-cloud alone. No single item is large: each concerns 0.1 to 1 smokes of a pool of 4.5 per game, and none has been tested as a switch.

### Cited Findings
Ranked by (cases per game for us) x (measured difference), with the evidence class. "Field" = all 2,347 games; sources as in the sections named.

| Rank | Change | Cases per game (us) | Measured difference | Evidence and its weakness |
|---|---|---|---|---|
| 1 | **Held unit: do not smoke after the net has landed; throw a net at the hunter if the pool has one, else keep the smoke** (section 3) | 0.43 smokes by held units per game (34 in 79 games); 1.11 predator net hits on our units per game | Smoke ordered on the first held turn: 73.8 % caught in 5 against 67.6 % with nothing (n 1,837 / 5,910); among survivors of that turn 57 against 53 %. Net instead of smoke: 43.1 against 64.4 % at 1100-1500 (n 534 / 475), 37.0 against 49.6 % at 1500-1900 (n 119 / 137). Ours: 16 of 18 held units that smoked were caught (weak) | Large samples, both sets agree, top five the same (78.7 against 62.7 %). Selection by danger remains. Frees about 10 % of our pool |
| 2 | **Keep the net-line trigger early, and make sure the cloud is up before the net: do not delay smoke when a predator with its dash can reach net range this turn** (sections 2, 3) | 0.89 predator net hits per game land on units of ours with no cloud (70 of 88); 5.1 % of field throws are netted on the throw turn (turns 1-3: 12.4 %) | Cloud in place when the net lands: 43.4 % caught in 5 against 67.6 % (n 1,087 / 5,910; by distance 19 to 54 % against 51 to 74 %); ours 5 of 18 against 27 of 52 (weak). Under a cloud, net hits fall to 0.1 to 0.3 % of throwers per turn; unit-turns inside 0.7 to 1.2 % per three turns against 2.9 to 4.9 % outside | The biggest single difference in the smoke data (24 points). How often an earlier throw is possible is unknown: it needs the predator's net line a turn ahead. This is the item that speaks against a blanket "later" |
| 3 | **Turns 1-3: keep the smoke when a predator moves at the unit; skip it when none does or a prey is nearer** (B4, section 2) | 0.97 early free throws per game; 0.18 not pursued; 0.08 to 0.12 with a prey nearer | Pursued: 22.8 against 35.7 % caught 0-5 (n 1,102 / 6,741), 19.2 against 24.9 % at 1500-2300; netted 19 against 35 %. Not pursued: no survival difference (9.1 / 8.6 %), own catches within 3 turns 8.8 against 11.0 %; prey nearer: 12.2 against 18.2 % (n 180 / 4,857) | The "keep" half is the best-supported smoke use in the data; the "skip" half is small (0.1 to 0.2 per game) |
| 4 | **No smoke with the nearest real predator beyond about 2300 at the start of the turn; treat a lone far "unit" that may be a decoy as no trigger** (B2, far end) | 0.23 free throws per game beyond 2300 (18 in 79 games); 5 % of our debug throws (11 of 224) had the true nearest predator beyond 3000 | Non-smokers there are caught 0-5 in 2.7 to 4.6 % (pursued 5.1 to 7.9 %); smokers 6.3 to 10.0 % (n 751 + 823). Our 18 far throws: none caught (weak) | Clear waste of 0.2 smokes per game; the decoy reading is not verified case by case |
| 5 | **Trigger distance 1500-1800 instead of 2300** (B2 middle, the simulation result) | 1.75 free throws per game are at 1900-2300 in the after-move measure (114 of 224); 0.19 per game at 1900-2300 in start-of-turn distance | Logs: smoke at 1900-2300 against none 12.3 / 8.1 % caught 0-5; at 1500-1900 16.8 / 12.0 %; same gap. Team catches next 10: 0.52 and 0.47. Waiting adds 1.2 points of orders lost with the thrower (0.7 to 1.9 %) and 1.8 points of nets on the throw turn (5.4 to 7.2 %); it saves smokes in a pool we empty in 77 % of games | Neither confirmed nor contradicted by the logs. If tried: define the distance at the start of the turn, keep item 2 as an exception (net line), and judge on paired replays of Gold battles, not only locally |
| 6 | **Free unit with the predator under 700: no smoke** (section 2) | 0.27 free throws per game | 14.8 % of orders are lost with the thrower; the rest: 31.8 against 31.2 % caught 0-5 (pursued 33.3 / 32.1 %), n 2,079 | No measured effect either way; the saving is 0.27 smokes per game. Exception seen in the data: a predator that dashes at the unit (46.8 against 53.6 %, n 188 / 1,565), which cannot be known in advance |
| 7 | **One cloud per group: no throw if an own cloud thrown this turn or in the last two turns has its centre within 1900** (B7, section 5) | 0.15 per game | Thrower caught 19.6 to 20.2 % against 19.9 %: no gain from the second cloud | Supported, saves 0.1 to 0.15 smokes per game |
| 8 | **Inside our own cloud with a predator near: run straight, do not loop** (section 4) | About 1.7 three-turn windows per game (110 in 65 games) | Looping 15 % caught afterwards against 10 % straight (16 of 110 against 14 of 143, z 1.1); 21 % of threatened windows loop inside against 2 % outside | Weak; a movement fix, costs no smoke |
| not recommended | Move the cloud centre (B3) | 3.58 throws per game | Our thrower loss is 0.76 of expected; team styles 0.90 to 0.98; no within-team evidence | Do not spend a test slot on it before items 1 to 4 |
| not recommended | Make unthreatened units leave our cloud (B1) | 24.7 unit-turns per game | Units inside catch more (21.8 against 12.6 % at prey 1000-1500) and are netted less; rank flat (1.66 / 1.70) | Premise contradicted by the data |

### Inferences
- Items 1, 4, 6 and 7 together return about 1.0 smoke per game to a pool of 4.5 that we now exhaust in 77 % of games (40 % by turn 30), without removing any throw that shows an effect. That is the safe part.
- Items 2 and 3 say where the saved smoke should go: to clouds that are up before a net can land. They are the only uses where smokers do measurably better than non-smokers.
- Expected size: at most a few tenths of a unit per game (item 2: 0.89 uncovered net hits x up to 24 points = about 0.2 units per game if every one could be anticipated; item 1: 0.43 x up to 21 points = about 0.1). In rank terms this is small and inside the noise of 37 arena games; it needs paired replays to be seen.
- Our rank does not improve when the pool holds more smoke (1.66 against 1.70; +0.028 per smoke), so smoke is not where our advantage over Gold opponents lies; changes here remove waste rather than add a weapon.

### Gaps
- No change in this list was run; all figures are associations in logs. The selection problem (bots smoke the endangered units) makes "smoke is useless against walkers" a likely overstatement and "smoke before a net works" a likely understatement or overstatement of unknown size.
- The all-team logs contain no trees, no sight and no pools; our debug games contain them but are only 65, of which 26 share battles with others.
- The goldtop folder kept growing during the analysis (1,128 files at the end); the 268 later games are not included.
