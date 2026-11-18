# Tempo, endgame and ghosts in Gold (Try Catch Forest): what goes with a better rank

Local game logs only; nothing was run against CodinGame, no Java, no test games. Scripts and raw outputs:
`E:/cg-tmp/tcf/research_tempo/` (`*.js` scripts, `*.out` outputs; each finding below names its output file).

Data sets (every table names the one it rests on):

| Tag | Folder | Games | What |
|---|---|---|---|
| TOP | `E:/cg-tmp/tcf/goldtop/utg/games` | 1,128 files, 1,126 without a timeout | games of today's top Gold teams. The folder grew from 768 to 1,128 files while this was written; the list was frozen at 13:45 (`frozen_top.txt`) and every TOP figure below is from that list |
| OLD | `E:/cg-tmp/cgskill/utg/games` | 1,408 files, 1,407 without a timeout | Gold games of 17 Nov |
| US | `E:/cg-tmp/tcf/gold/games` | 80 | our arena games in Gold (v10 and v5), team "The Final Boss" |
| DBG | `E:/cg-tmp/tcf/gold/r10`, `g10`, `g12` | 65 readable games, 47 distinct battles (some battles were replayed by two versions) | our debug replays: exact positions of our units, trees, everything we saw |

How to read the numbers:
- "team-game" = one team in one game (3 per game). "win" = first place. Baseline: win 33 %, mean rank 2.00.
- Positions of other teams are rebuilt from orders and referee text (`research/lib/parse.js`); trees are not in public logs, so distances ignore trees and nobody's sight is known outside DBG.
- Start positions come from the 120-degree rotation (exact for 84 % of the units in TOP, 91 % in OLD; games with a start older than 3 turns are left out of opening tables: 888 TOP and 1,257 OLD games remain).
- Because the three teams of a game are rotations of each other, unit j of each team has **exactly the same start geometry**. "Matched" below = comparison inside such triples of mirrored units (9,710 triples, TOP+OLD), so geometry cannot explain the difference; team strength still can.
- Everything is an association. Where the direction of cause is doubtful it is said. Samples under 30 are marked weak.

## 1. Ties and the first catch: how much is an early catch worth, and how much does an early loss cost?

### Takeaway
30 % of Gold games end with the top two level on catches and 91 % of those are settled by the turn of the first catch; in half of them the loser's first catch was 9 or fewer turns late. One more catch by turn 10 and one unit fewer lost by turn 10 are worth the same in rank today (0.28 of a place each); the catch is worth slightly more in win rate (+14 points against +12).

### Cited Findings
- Top two level on catches: 339 of 1,126 games = 30.1 % (TOP); 453 of 1,407 = 32.2 % (OLD); 21 of 80 = 26 % (US). By units per team 3/4/5/6: 29.9 / 32.9 / 30.3 / 27.0 % (TOP), 36.4 / 34.3 / 29.9 / 28.0 % (OLD). Second and third level with a clear winner: another 20.2 % (TOP). — [a_top.out](E:/cg-tmp/tcf/research_tempo/a_top.out), [a_old.out](E:/cg-tmp/tcf/research_tempo/a_old.out), [a_us.out](E:/cg-tmp/tcf/research_tempo/a_us.out)
- Of the 339 tied TOP games, 310 are decided by catch number 1 and 29 by catch number 2 (same turn for the first). Gap at the deciding catch: median 9 turns; 2 turns or fewer in 19 %, 5 or fewer in 36 %, 10 or fewer in 53 %. US: all 21 decided by the first catch, median gap 9. — [a_top.out](E:/cg-tmp/tcf/research_tempo/a_top.out)
- The final ranking is reproduced exactly from "catches, then earlier catch turns" in 2,533 of 2,533 games, and shown score = 3 x catches + tie-break order in all 3,378 team-games: the rule is as documented. — [d_all.out](E:/cg-tmp/tcf/research_tempo/d_all.out), [a_top.out](E:/cg-tmp/tcf/research_tempo/a_top.out)
- First catch of the game (one team alone on that turn): that team wins 54 % and is last 15 % (n = 1,001, TOP); by units 3/4/5/6: 60 / 51 / 52 / 55 % (n = 251 / 282 / 240 / 228). OLD: 55 % overall; 62 / 56 / 50 / 51 %. When two teams catch on the same first turn: 40 % (n = 258). The first catch of the game falls on turn 4 (median); by turn 5 in 67 % of games, by turn 10 in 89 %. — [a_top.out](E:/cg-tmp/tcf/research_tempo/a_top.out), [a_old.out](E:/cg-tmp/tcf/research_tempo/a_old.out)
- Turn of a team's own first catch against its win rate (TOP, 3,378 team-games): turns 1-3: 48 % (n = 635); 4-5: 44 % (463); 6-10: 37 % (815); 11-20: 29 % (562); 21-40: 26 % (452); 41+: 11 % (279); never: 0 % (172). — [a_top.out](E:/cg-tmp/tcf/research_tempo/a_top.out)
- Catches and losses by turn 10 against the result (TOP, 3,378 team-games; mean 0.80 catches and 0.80 losses by turn 10 per team-game, 57 % of team-games have at least one of each):

| By turn 10 | Team-games | Win | Last | Mean rank |
|---|---|---|---|---|
| 0 catches | 1,465 | 21 % | 46 % | 2.24 |
| 1 catch | 1,295 | 40 % | 28 % | 1.88 |
| 2 catches | 481 | 45 % | 18 % | 1.73 |
| 3 or more | 137 | 62 % | 7 % | 1.45 |
| 0 units lost | 1,465 | 44 % | 21 % | 1.76 |
| 1 lost | 1,295 | 27 % | 38 % | 2.11 |
| 2 lost | 481 | 22 % | 50 % | 2.28 |
| 3 or more lost | 137 | 14 % | 67 % | 2.53 |

| Catches x losses by turn 10 (TOP) | Team-games | Win | Mean rank |
|---|---|---|---|
| 0 catches, 0 lost | 697 | 31 % | 2.00 |
| 0 catches, 1 lost | 542 | 13 % | 2.41 |
| 0 catches, 2+ lost | 226 | 9 % | 2.62 |
| 1 catch, 0 lost | 531 | 54 % | 1.58 |
| 1 catch, 1 lost | 516 | 34 % | 1.98 |
| 1 catch, 2+ lost | 248 | 21 % | 2.33 |
| 2+ catches, 0 lost | 237 | 61 % | 1.49 |
| 2+ catches, 1 lost | 237 | 44 % | 1.71 |
| 2+ catches, 2+ lost | 144 | 37 % | 1.90 |

  — [a_top.out](E:/cg-tmp/tcf/research_tempo/a_top.out)
- Linear fit of the final rank on both counts with the unit count held fixed (TOP, n = 3,378): each catch by turn 10: -0.283 rank (s.e. 0.016); each unit lost by turn 10: +0.275 (0.016). On the win rate: +14.1 points per catch (1.0), -11.7 per loss (1.0). By turn 5: -0.308 / +0.267 rank; +16.6 / -11.7 points. OLD (n = 4,221): -0.311 / +0.283 rank; +16.0 / -13.2 points. — [a_top.out](E:/cg-tmp/tcf/research_tempo/a_top.out), [a_old.out](E:/cg-tmp/tcf/research_tempo/a_old.out)
- The same fit by units per team (TOP): 3 units: -0.470 per catch, +0.403 per loss (n = 792; mean 0.37 catches by turn 10); 4 units: -0.301 / +0.287; 5 units: -0.255 / +0.300; 6 units: -0.237 / +0.216. An early catch or loss weighs about twice as much with 3 units as with 6. — [a_top.out](E:/cg-tmp/tcf/research_tempo/a_top.out)
- Us: v10 in the arena (44 games with known starts): 0.75 catches and 0.50 losses by turn 10, median turn of our first catch 11; v5 (24 games, weak): 0.38 and 0.42, turn 13. TOP field: 0.84 and 0.84, turn 8; TOP winners: 1.13 and 0.59, turn 6; the team that leads its game on catches by turn 10: turn 4. — [i_us.out](E:/cg-tmp/tcf/research_tempo/i_us.out)

### Inferences
- In Gold today neither "catch first" nor "do not lose first" dominates: the two coefficients are equal within one standard error in TOP. Yesterday (OLD) the catch was worth slightly more (0.31 against 0.28). A change that buys one early catch for one early loss is a wash; it has to buy the catch for less than one loss.
- The tie-break makes the *turn* of the first catch a score of its own: 30 % of games, half of them lost by 9 turns or fewer. v10's first catch comes 3 turns after the field's median and 5 after the winners'.
- With 3 units per team the first catch is close to decisive (60 % wins, and one early catch moves rank by 0.47): early risk is best taken in 3-unit games and least in 6-unit games.

### Gaps
- No causal estimate: teams that catch early are also the stronger teams. The matched comparisons in section 2 are the closest to a controlled test that the logs allow.
- "Lost by turn 10" does not separate our own wins from non-wins in 80 games (existing note `kb/gold-autopsy.md`, 31 % against 41 %); with 80 games that cannot contradict the 3,378 team-games above.

## 2. What do the teams with the most catches by turn 10 do in turns 1-10 that the others do not, and what does each action cost in units lost by turn 10?

### Takeaway
"More aggression" is not "closer to predators" and not "smoke later". The early actions that go with more catches **without** more losses are: dashing (not walking) at a prey start on turn 1, a net on turn 2-3 instead of turn 1, a second dash by turn 3, and spreading hunters over several prey units instead of three on one. Turn-1 smoke next to a predator is the largest single effect in the opening and goes the other way from "smoke later": it cuts losses by turn 10 from 40 % to 22 % of those units and comes with a *better* rank.

### Cited Findings
- Leader on catches by turn 10 against the two other teams of the same game, same geometry (TOP, 520 games with a single leader; per team-game): units dashing at a prey start on turn 1: 2.37 against 2.10; walking at one: 1.10 against 1.29; dashing away from a predator: 0.32 against 0.35; dashes in turns 2-5: 3.20 against 2.64; nets at prey on turn 1: 0.59 against 0.54; **nets at prey on turns 2-3: 0.90 against 0.56**; nets at predators by turn 3: 0.44 against 0.52; smokes by turn 3: 0.64 against 0.53; decoys by turn 3: 1.28 against 1.13; largest number of units aimed at one prey on turn 1: 1.91 against 1.90; **prey units with a hunter within 1500 at the start of turn 4: 0.98 against 0.82**. — [b_top.out](E:/cg-tmp/tcf/research_tempo/b_top.out)
- One more of each action inside the same game (game fixed effects, TOP, 2,664 team-games; change in catches by turn 10 / units lost by turn 10 / final rank, standard error in brackets):

| One more ... | Catches by 10 | Lost by 10 | Rank |
|---|---|---|---|
| unit dashing at a prey start on turn 1 | +0.072 (0.023) | -0.081 (0.023) | -0.060 (0.028) |
| unit walking at a prey start on turn 1 | +0.066 (0.025) | -0.056 (0.026) | -0.112 (0.031) |
| unit dashing away from a predator on turn 1 | +0.013 (0.034) | -0.094 (0.036) | +0.045 (0.043) |
| net at prey on turn 1 | +0.118 (0.023) | +0.013 (0.024) | +0.030 (0.028) |
| net at prey on turn 2 or 3 | **+0.230 (0.021)** | -0.066 (0.021) | -0.044 (0.026) |
| net at a predator by turn 3 | +0.002 (0.023) | -0.016 (0.024); by turn 5: -0.103 (0.017) | +0.040 (0.029) |
| smoke by turn 3 | +0.057 (0.019) | -0.067 (0.020) | +0.020 (0.024) |
| decoy by turn 3 | +0.059 (0.013) | +0.008 (0.014) | -0.010 (0.016) |
| dash in turns 2-5 | +0.094 (0.011) | -0.080 (0.011) | -0.025 (0.014) |

  OLD (3,771 team-games) agrees in sign for the catch column: dash at prey +0.042 (0.019), net on turn 1 +0.073 (0.019), net on turns 2-3 +0.158 (0.018), decoy +0.062 (0.010). The "dash in turns 2-5" and "net" rows carry a survivor effect (a unit that is caught or held cannot dash or throw), so their loss column is too favourable. — [b_top.out](E:/cg-tmp/tcf/research_tempo/b_top.out), [b_old.out](E:/cg-tmp/tcf/research_tempo/b_old.out)
- Matched comparison, mirrored units with identical geometry (TOP+OLD; A against B; "catch" = the unit itself catches by turn 10, "lost" = the unit is caught by turn 10, "netted" = held by turn 5):

| Situation | A | B | Triples | Catch A / B | Lost A / B | Netted A / B | Rank A - B |
|---|---|---|---|---|---|---|---|
| any | dash at prey | walk at prey | 3,891 | 18.9 / 14.6 % | 11.6 / 14.1 % | 18.7 / 17.3 % | -0.010 (0.021) |
| predator start beyond 2500 | dash at prey | walk at prey | 3,005 | 18.4 / 13.8 % | 8.8 / 9.4 % | 15.8 / 11.8 % | -0.012 (0.024) |
| predator start 1500-2500 | dash at prey | walk at prey | 786 | 20.9 / 17.8 % | 20.7 / 29.1 % | 27.5 / 35.1 % | +0.022 (0.047) |
| predator start under 1500 | dash at prey | walk at prey | 100 | 17.5 / 13.5 % | 24.5 / 39.0 % | 37.0 / 43.0 % | -0.205 (0.135) |
| predator start beyond 2500 | any move at prey | any other direction | 2,087 | 14.3 / 9.0 % | 11.3 / 11.4 % | 13.5 / 10.7 % | -0.071 (0.027) |
| predator start under 2000 | dash at prey | dash away from the predator | 594 | 16.4 / 8.8 % | 26.3 / 34.8 % | 31.1 / 32.9 % | -0.066 (0.051) |
| predator start under 2000 | any dash on turn 1 | no dash | 1,013 | 13.9 / 11.2 % | 27.2 / 38.9 % | 30.6 / 36.9 % | -0.067 (0.038) |
| predator start 2000-3000 | any dash on turn 1 | no dash | 1,545 | 18.0 / 14.7 % | 19.6 / 24.0 % | 22.8 / 26.3 % | +0.008 (0.032) |
| predator start under 2000 | smoke on turn 1 | no power | 496 | 10.8 / 7.0 % | **21.7 / 39.5 %** | **11.6 / 38.0 %** | **-0.184 (0.063)** |
| predator start under 2000 | smoke on itself (within 1900 of the thrower) | no power | 375 | 10.8 / 6.0 % | 20.5 / 41.9 % | 8.9 / 37.3 % | -0.228 (0.071) |
| predator start under 2000 | decoy on turn 1 | no power | 1,078 | 14.6 / 10.2 % | 27.7 / 38.9 % | 31.8 / 42.1 % | -0.114 (0.039) |
| predator start under 2000 | smoke | decoy | 448 | 13.8 / 12.5 % | 21.1 / 34.0 % | 14.5 / 30.8 % | -0.050 (0.064) |
| predator start under 2000 | dash + smoke | dash + no power | 384 | 11.6 / 7.2 % | 20.1 / 39.6 % | 11.6 / 37.5 % | -0.228 (0.071) |
| predator start under 2000, smoke thrown | dash | no dash | 22 (weak) | 9.1 / 4.5 % | 18.2 / 31.8 %; by turn 5: 4.5 / 31.8 % | 13.6 / 22.7 % | -0.295 (0.269) |
| predator start 2000-3000 | smoke on turn 1 | no power | 290 | 13.4 / 12.4 % | 18.3 / 26.0 % | 9.8 / 22.4 % | -0.067 (0.075) |
| prey start under 2500 | net on turn 1 | no power on turn 1 | 1,945 | 29.5 / 24.9 % | 10.9 / 12.2 % | 25.5 / 25.3 % | -0.017 (0.029) |
| prey start under 2500 | net on turn 2 | net on turn 1 | 914 | **42.5 / 31.1 %** | 11.9 / 12.7 % | 33.0 / 31.3 % | -0.088 (0.044) |
| prey start under 2500, no turn-1 net | net on turn 2 | no net in turns 1-3 | 1,008 | 38.4 / 17.0 % | 12.4 / 12.4 % | 33.8 / 20.0 % | -0.067 (0.041) |
| prey start under 2500, predator beyond 2500, dash at prey on turn 1 | second dash on turn 2-3 | no second dash | 967 | 41.2 / 21.6 % | 5.5 / 7.2 % | 10.2 / 32.6 % | -0.089 (0.041) |

  The last two rows are partly selection: a unit throws on turn 2 because it is in range, and a unit that is netted on turn 1-2 cannot dash again. — [b2_all.out](E:/cg-tmp/tcf/research_tempo/b2_all.out)
- Nets by turn (TOP, 888 games; hit = holds a prey unit; catch = that unit caught within 4 turns, per net thrown): at prey on turn 1: 1,478 thrown, hit 28 %, catch 15 %; **turn 2: 1,167, hit 55 %, catch 33 %**; turn 3: 561, 39 %, 25 %; turn 4: 488, 46 %, 25 %; turn 5: 373, 47 %, 30 %. At a predator: turn 1: 338, hit 47 %; turn 2: 636, hit 69 %; turn 3: 287, 58 %. — [b_top.out](E:/cg-tmp/tcf/research_tempo/b_top.out)
- How many units go for the same prey (game fixed effects; change in catches by 10 / lost by 10 / rank):

| | TOP (2,664 team-games) | OLD (3,771) |
|---|---|---|
| two or more units aimed at one prey on turn 1 | -0.006 (0.041) / -0.031 / -0.031 (0.048) | +0.113 (0.033) / -0.095 / -0.105 (0.042) |
| three or more aimed at one prey | +0.023 (0.050) / +0.068 / **+0.159 (0.059)** | -0.077 (0.037) / +0.138 / **+0.228 (0.047)** |
| two or more hunters within 1500 of one prey at the start of turn 4 | +0.061 (0.061) / +0.078 / +0.018 (0.073) | +0.096 (0.045) / -0.164 / -0.171 (0.057) |
| each further prey unit that has a hunter within 1500 at the start of turn 4 | **+0.132 (0.022) / -0.114 (0.022) / -0.111 (0.026)** | +0.113 (0.018) / -0.071 (0.018) / -0.050 (0.023) |

  — [b_top.out](E:/cg-tmp/tcf/research_tempo/b_top.out), [b_old.out](E:/cg-tmp/tcf/research_tempo/b_old.out)
- Our own opening against the field (per team-game; "/u" per unit; US arena games with known starts, TOP 2,664 team-games):

| | v10 (44) | v5 (24, weak) | TOP all | TOP winners | TOP leader on catches by 10 | ATI x iHot (58) | Les Gens Bons (134) |
|---|---|---|---|---|---|---|---|
| dash at prey on turn 1 /u | 0.43 | 0.17 | 0.47 | 0.46 | 0.51 | 0.52 | 0.29 |
| walk at prey on turn 1 /u | 0.21 | 0.43 | 0.26 | 0.29 | 0.24 | 0.21 | 0.33 |
| dashes in turns 2-5 /u | 0.40 | 0.49 | 0.61 | 0.62 | 0.69 | 0.55 | 0.57 |
| nets at prey on turn 1 | 0.00 | 0.00 | 0.55 | 0.54 | 0.59 | 0.00 | 1.42 |
| nets at prey on turns 2-3 | 0.59 | 0.46 | 0.65 | 0.69 | 0.90 | 0.33 | 0.83 |
| smokes on turn 1 | 0.98 | 0.71 | 0.27 | 0.29 | 0.29 | 1.31 | 0.00 |
| unit with a predator start within 2000: smokes on turn 1 | 74 % of 53 | 52 % of 31 | 14 % | 16 % | 14 % | 81 % | 0 % |
| unit with a predator start within 2000: dashes on turn 1 | **17 % of 53** | 68 % of 31 | 78 % | 78 % | 80 % | **100 %** | 62 % |
| prey within 2500, predator beyond 2500: dashes at the prey | 68 % of 37 | 6 % of 31 | 66 % | 65 % | 70 % | 86 % | 46 % |
| prey units with a hunter within 1500 at turn 4 | **0.59** | 0.46 | 0.84 | 0.90 | 0.98 | 0.95 | 0.93 |
| catches by turn 5 / by turn 10 | 0.32 / 0.75 | 0.21 / 0.38 | 0.40 / 0.84 | 0.58 / 1.13 | 0.91 / 1.89 | 0.47 / 0.90 | 0.73 / 1.15 |
| units lost by turn 5 / by turn 10 | 0.18 / 0.50 | 0.00 / 0.42 | 0.40 / 0.84 | 0.28 / 0.59 | 0.18 / 0.38 | 0.17 / 0.48 | 0.45 / 0.87 |

  — [i_us.out](E:/cg-tmp/tcf/research_tempo/i_us.out)
- Same table, further rows: three or more units aimed at one prey on turn 1: v10 18 % of games, TOP all 18 %, TOP winners 17 %, tempo leaders 19 %, ATI x iHot 16 %, Les Gens Bons 11 %, RNG 3 %. Our opponents in our own 72 arena games (same maps and geometry as ours, 144 team-games): 0.68 prey units covered at turn 4, 0.63 dashes per unit in turns 2-5, 0.70 catches and 0.78 losses by turn 10, 70 % of threatened units dash on turn 1, 12 % smoke. — [i_us.out](E:/cg-tmp/tcf/research_tempo/i_us.out)

### Inferences
- The coordinator's local result (less distance from predators and later smoke in turns 1-10 is worse) agrees with the logs: every opening row that concerns predators says *protect earlier, not later* (smoke on turn 1 with a predator start inside 2000: losses by turn 10 halve and rank improves by 0.18 to 0.23; decoy: -11 points and -0.11; dash: -12 points). The extra catches of the tempo leaders come from what the units that are **not** threatened do.
- Specific early actions that add catches at no cost in losses: (a) dash, not walk, at a prey start (+4.3 points catch per unit, losses -2.5 points; the cost is +4 points of being netted when no predator is near); (b) hold the net for turn 2 (hit 55 % against 28 %, catch per net 33 % against 15 %; matched +11 points catch against a turn-1 net, same losses); (c) dash again by turn 3 at prey inside 2500; (d) put hunters next to more *different* prey units by turn 4 (each further prey unit covered: +0.13 catches by turn 10 and rank -0.11 in TOP).
- Three or more units on one prey on turn 1 goes with a worse rank in both sets (+0.16 and +0.23) although it does not lower early catches much: it leaves the other prey free and the other own units unprotected. Two on one prey is neutral today (it was positive yesterday).
- A turn-1 net at prey adds early catches (+0.12 per net) but no rank in TOP (+0.03, s.e. 0.03): the leader ATI x iHot and v10 throw none; Les Gens Bons throws 1.4 per game. The turn-2 net is the better use of the same net.
- Where v10 differs from the tempo leaders and from ATI x iHot: 0.59 against 0.98 / 0.95 prey units covered at turn 4 (0.68 for our opponents on the same maps, so part of the gap to TOP is the mix of maps), 0.40 against 0.69 dashes per unit in turns 2-5 (0.63 for our opponents on the same maps), 0.59 against 0.90 nets on turns 2-3, and a threatened unit dashes on turn 1 in 17 % of cases against 78 % (field) and 100 % (ATI x iHot). v10 already smokes like ATI x iHot (74 % against 81 %).
- Fleeing direction on turn 1 matters: with a predator start inside 2000, dashing at a prey start loses the unit less often than dashing straight away from the predator (26 % against 35 %, 594 triples) and catches twice as often. A prey unit is the predator's own predator, so its side of the map is the safer side.

### Gaps
- The matched design removes geometry, not team quality; the rank column is the fairest guard against that and is small for most rows.
- "Dash on turn 1 when threatened, with smoke" rests on 22 triples (weak). The 1,013-triple figure is mostly units without smoke.
- Whether a unit aims at a prey start is inferred from the direction of its order (cosine above 0.5 for "at prey", above 0.9 for "aimed at this prey"); bots that path around trees are misread.
- Not measured: smoke placement relative to the predator beyond "within 1900 of the thrower", and the pool sizes (not in public logs).

## 3. Flee or hunt: a unit has a prey unit and a predator within 2500. What do winners do more often, and what follows?

### Takeaway
Winners and non-winners choose almost the same (at the prey 61 % against 57 % of such unit-turns); the difference is the outcome. Going at the prey is not more dangerous than turning away **except** when the prey lies on the predator's side and the predator is inside 1200 (37 % caught within 5 turns against 22 %). In every other geometry the unit is caught as often or less often when it keeps going, and its team catches three times as often. v10 goes at the prey less than the field (46 % against 57-61 %), most of all when the prey is at a right angle to the predator (41 % against 58-64 %).

### Cited Findings
- Frequency (TOP, 1,126 games): 49,343 free living unit-turns with a living prey unit and a living predator within 2500 = 14.6 per team-game in 6.3 episodes; only 4 % of team-games have none. US: 949 unit-turns in 80 games = 11.9 per game for our team. — [c_top.out](E:/cg-tmp/tcf/research_tempo/c_top.out), [c_us.out](E:/cg-tmp/tcf/research_tempo/c_us.out)
- Choice, winners against non-winners (TOP; 17,044 and 32,299 unit-turns): at the prey 61.0 % / 56.7 %; away from the predator 21.2 % / 23.6 %; sideways 11.8 % / 13.0 %; at the predator and not the prey 4.6 % / 5.0 %; standing 1.5 % / 1.6 %. OLD (20,510 and 39,969): at the prey 59.4 % / 57.7 %; away 22.8 % / 23.6 %. — [c_top.out](E:/cg-tmp/tcf/research_tempo/c_top.out), [c_old.out](E:/cg-tmp/tcf/research_tempo/c_old.out)
- Outcome by move, all teams (TOP): at the prey (n = 28,716): unit caught within 5 turns 9.9 %, that prey caught within 5 turns 25.9 %, the team catches something within 5 turns 37.4 %; away from the predator (11,227): 12.4 % / 8.7 % / 23.9 %; sideways (6,223): 13.9 % / 11.1 % / 27.2 %; standing (773): 18.9 % / 14.7 % / 28.8 %; at the predator, not the prey (2,404): 26.2 % / 15.1 % / 34.7 %. — [c_top.out](E:/cg-tmp/tcf/research_tempo/c_top.out)
- By where the prey is relative to the predator, seen from the unit (TOP; unit caught within 5 turns, at the prey / away from the predator; prey caught within 5 turns in brackets):

| Predator distance | Prey on the predator's side | Prey at a right angle | Prey opposite the predator |
|---|---|---|---|
| under 1200 | **37.0 % (n = 888) / 22.0 % (1,985)** [21.7 / 5.3 %] | 16.5 % (1,965) / 20.2 % (1,302) [26.3 / 8.7 %] | 14.8 % (3,310) / 17.4 % (339) [26.5 / 15.9 %] |
| 1200-1800 | 14.5 % (1,735) / 11.1 % (2,047) [22.1 / 5.2 %] | 10.2 % (3,218) / 12.0 % (1,438) [25.4 / 9.5 %] | 8.9 % (4,212) / 10.6 % (416) [27.2 / 14.2 %] |
| 1800-2500 | 6.4 % (4,620) / 4.9 % (1,928) [22.8 / 7.6 %] | 5.8 % (4,394) / 5.4 % (1,383) [27.9 / 13.4 %] | 4.1 % (4,374) / 4.9 % (389) [28.0 / 17.5 %] |

  OLD confirms the one dangerous cell: prey on the predator's side, predator under 1200: 38.1 % (n = 867) at the prey against 20.5 % (2,130) away; right angle 15.0 % against 16.2 %; opposite 11.5 % against 17.3 %. — [c_top.out](E:/cg-tmp/tcf/research_tempo/c_top.out), [c_old.out](E:/cg-tmp/tcf/research_tempo/c_old.out)
- Turns 1-10 only (TOP; unit caught within 5 turns, at the prey / away; unit netted within 3 turns in brackets): prey on the predator's side: predator under 1200: 30.9 % (n = 362) / 25.9 % (455); 1200-1800: 18.6 % (657) / 14.4 % (605); 1800-2500: 9.3 % (1,362) / 6.1 % (723) [all distances: netted 13.5 % / 11.3 %]. Prey at a right angle: 19.3 % (644) / 20.4 % (373); 13.8 % (1,244) / 15.5 % (541); 7.6 % (1,732) / 6.8 % (591) [netted 17.5 % / 13.3 %]. Prey opposite: 15.0 % (846) / 19.3 % (114); 12.0 % (1,346) / 15.7 % (159); 5.4 % (1,562) / 6.4 % (172) [netted 18.1 % / 12.4 %]. That prey is caught within 5 turns in 30-34 % of the cases going at it against 9-19 % turning away. So in the opening the price of going on is +3 to +5 points of losses only when the prey is on the predator's side, and +4 to +6 points of being netted everywhere. — [c_top.out](E:/cg-tmp/tcf/research_tempo/c_top.out)
- Same choice, different result (TOP): "at the prey, no power": winners caught within 5 turns 6.2 %, team catch within 5 turns 45.3 % (n = 8,781); non-winners 11.6 % and 29.7 % (15,277). "Away, no power": winners 8.1 % and 30.1 % (3,051); non-winners 13.2 % and 18.9 % (6,499). — [c_top.out](E:/cg-tmp/tcf/research_tempo/c_top.out)
- Share going at the prey by geometry, winners / non-winners (TOP): prey on the predator's side 44.5 % / 40.2 %; right angle 63.5 % / 58.0 %; opposite 75.9 % / 73.8 %. Ours (US, wins / non-wins, 132 to 206 unit-turns per cell): 27.5 % / 21.2 %; 41.6 % / 41.0 %; 66.7 % / 69.9 %; overall at the prey 45-48 %, away 30 %. — [c_top.out](E:/cg-tmp/tcf/research_tempo/c_top.out), [c_us.out](E:/cg-tmp/tcf/research_tempo/c_us.out)
- Power and dash while going at the prey with the predator under 1200 (TOP; unit caught within 5 turns): walk, no power 20.4 % (n = 3,660); dash, no power 17.1 % (1,273); **dash + smoke 5.7 % (141)**; walk + smoke 14.5 % (214); dash + decoy 12.9 % (201); walk + decoy 22.7 % (225); **dash + net at the predator 7.2 % (69)**; walk + net at the predator 16.4 % (110); dash + net at the prey 12.4 % (153; that prey caught within 5 turns 40.5 %). — [c_top.out](E:/cg-tmp/tcf/research_tempo/c_top.out)
- Power while moving away with the predator under 1200 (TOP): walk, no power 21.7 % (2,279); dash, no power 16.4 % (596); walk + smoke 26.0 % (181); dash + smoke 15.8 % (101); walk + decoy 21.5 % (219); dash + decoy 31.2 % (109); walk + net at the predator 12.9 % (70). — [c_top.out](E:/cg-tmp/tcf/research_tempo/c_top.out)
- Predator at 1200-1800, going at the prey (TOP): walk, no power 10.5 % (5,797); dash, no power 9.2 % (1,595); dash + smoke 4.8 % (147); dash + net at the predator 5.6 % (71); walk + net at the predator 10.9 % (129). Predator at 1800-2500: walk 5.0 % (9,310), dash 5.7 % (2,423), with that prey caught within 5 turns 23.0 % against 32.6 %. — [c_top.out](E:/cg-tmp/tcf/research_tempo/c_top.out)

### Inferences
- The rule the data supports is geometric, not "keep less distance": keep going at the prey when it is at a right angle to or opposite the predator at any predator distance, and when it is on the predator's side only while the predator is beyond about 1800 (in turns 1-10 even that costs 3 points, so in the opening: not at all on the predator's side). Turn away when the prey is on the predator's side and the predator is inside 1200 (there fleeing saves 15 points); between 1200 and 1800 on the predator's side it costs 3.4 points of risk for four times the catches.
- "Use a power and keep going" is visible: dash + smoke (5.7 %) and dash + net at the predator (7.2 %) are the two safest ways to continue inside 1200, safer than fleeing without a power (16-22 %). A decoy does not protect the unit that keeps going at walking speed (22.7 %), and smoke thrown while *walking* away does not either (26.0 %): it is thrown too late.
- v10's lower share at the prey (46 % against 57-61 %) is concentrated where the field's data shows no extra risk (right angle: 41 % against 58-64 %, with 9.5 % caught at the prey against 12.3 % away in TOP). This is the "more aggression" that is consistent with the coordinator's simulation result: it does not shorten the distance to the predator, it only stops giving up prey that is not on the predator's side.

### Gaps
- Selection: units that flee may be the ones whose predator is really coming; the logs do not show sight or intent. The equal risk in 8 of 9 cells is therefore an upper bound on how safe continuing is.
- Unit-turns inside one episode are not independent (2.3 per episode); standard errors would be about 1.5 times larger than the counts suggest.
- Our share is measured on public-log positions for comparability (949 unit-turns); not broken down by v10 and v5.

## 4. Endgame: nothing left to catch

### Takeaway
A team that has caught every prey unit plays on in 53 % of games, still loses a third of its living units (0.93 per endgame), and it almost never matters: it finishes first in 96.2 % of cases, and in 72 % of endgames its tie-break against the hunting team is already won, so it cannot lose first place at all. First place is lost this way in 2.0 % of all games (0.7 % of team-games). The safest behaviour is visible: stand still only while no predator is within about 3000, move straight away as soon as one is, stay off the wall, and throw the left-over nets at the hunter. "Behind a tree" helps only at 1200-2000 and standing next to a tree with a predator inside 1200 is worse than open ground.

### Cited Findings
- Frequency (TOP+OLD, 2,533 games): 1,336 endgames (prey team wiped out by this team, game continues, its own predator alive) = 52.7 % of games = 17.6 % of team-games; TOP alone 682 of 1,126 = 60.6 %. It starts at turn 64 (median; quartiles 46 and 81) with 32 turns left (17 to 49), 2.76 own units alive and 2.29 predators alive. — [d_all.out](E:/cg-tmp/tcf/research_tempo/d_all.out), [d_top.out](E:/cg-tmp/tcf/research_tempo/d_top.out)
- Losses afterwards: 0.93 units per endgame = 33.9 % of the units alive; no loss in 46.6 % of endgames; wiped out in 15.5 %. — [d_all.out](E:/cg-tmp/tcf/research_tempo/d_all.out)
- Effect on rank: first place in 1,285 of 1,336 (96.2 %). Tie-break against the hunting team already won when the endgame starts: 961 (71.9 %): first in 100 %, although 16.2 % of them are wiped out. Not yet won: 375 (28.1 %): wiped out and first place lost in 51 (13.6 %); with 1 unit alive 25.0 % (n = 72), with 2 units 11.0 % (163), with 3 or more 10.7 % (140). In all: 51 first places lost in 2,533 games = 2.0 % of games. — [d_all.out](E:/cg-tmp/tcf/research_tempo/d_all.out)
- The hunting team in those endgames (its own predator is gone, nothing can catch it): adds 0.93 catches and improves its place in 286 of 1,336 (21 %): third to second 235, second to first 40, third to first 11. — [d_all.out](E:/cg-tmp/tcf/research_tempo/d_all.out)
- What the units do and what follows (TOP+OLD, living endgame unit-turns; caught within 5 turns):

| Nearest living predator | Stands still | Walks | Dashes |
|---|---|---|---|
| beyond 3000 | 0.4 % (n = 10,606) | 0.7 % (23,975) | 7.3 % (246) |
| position unknown (no anchor for 12 turns) | 0.9 % (7,770) | 2.4 % (15,003) | 8.9 % (370) |
| 2000-3000 | 5.6 % (1,119) | 4.1 % (6,446) | 5.6 % (126) |
| 1200-2000 | **18.8 % (589)** | 12.1 % (8,853) | 11.5 % (716) |
| under 1200 | **42.5 % (332)** | 22.4 % (12,169) | 17.0 % (2,088) |

  Held by a net with a predator under 1200: 68.9 % (n = 293). — [d_all.out](E:/cg-tmp/tcf/research_tempo/d_all.out)
- Direction of the move (caught within 5 turns; away / sideways / toward the nearest predator): predator under 1200: 19.2 % (12,097) / 30.7 % (1,855) / 60.9 % (302); 1200-2000: 10.0 % (6,985) / 15.1 % (2,141) / 28.9 % (443); 2000-3000: 2.8 % (3,139) / 3.7 % (2,273) / 8.9 % (1,160). — [d_all.out](E:/cg-tmp/tcf/research_tempo/d_all.out)
- The wall: predator under 1200: at the wall (beyond 6800 from the centre) 38.2 % (n = 3,645) against 17.1 % in the centre (1,371), 17.1 % in the middle ring (3,972) and 18.9 % in the outer ring 5000-6800 (5,894). Predator at 1200-2000: wall 26.0 % (2,151) against 8.1 % in the middle ring (3,130). — [d_all.out](E:/cg-tmp/tcf/research_tempo/d_all.out)
- Powers on that turn, free unit, predator under 1200 (caught within 5 turns): net 10.3 % (n = 68); smoke 18.9 % (402); nothing 22.0 % (13,937); decoy 40.1 % (182). Predator at 1200-2000: net 9.5 % (42); decoy 11.8 % (212); nothing 12.4 % (9,683); smoke 14.5 % (221). Only 88 of 1,336 endgame teams throw a net at all after their last catch. — [d_all.out](E:/cg-tmp/tcf/research_tempo/d_all.out)
- Whole endgame per unit: mostly standing still (60 % of its turns or more): 16.4 % lost, 0.45 losses per 100 unit-turns (598 units); mixed: 38.6 %, 1.15 (482); keeps moving: 38.9 %, 1.31 (2,283). Mean distance from the centre above 6000: 42.6 % lost, 1.63 per 100 unit-turns (1,024 units); 4000-6000: 31.7 %, 0.89 (1,670); under 4000: 31.1 %, 1.07 (669). Per team: under 10 % of unit-turns standing: 36.9 % of the living units lost, wiped out 17.4 % (764 endgames); 10-50 %: 32.9 %, 14.9 % (288); 50 % or more: 26.7 %, 10.9 % (284). — [d_all.out](E:/cg-tmp/tcf/research_tempo/d_all.out)
- Trees and line of sight, measured where trees are known (DBG, our living units at exact positions, a living predator within 3000; caught within 5 turns): predator at 1200-2000: a tree on the line between them 6.0 % (n = 134) against open line 12.2 % (2,043); predator at 2000-3000: 3.6 % (722) against 2.8 % (2,475); predator under 1200: 9 cases with a tree between (weak) against 18.3 % open (2,180). Distance to the nearest tree with a predator under 1200: within 300 of a tree 24.5 % (877), 300-1000 16.8 % (875), no tree within 1000 9.4 % (437); with a predator at 1200-2000: 13.9 % (870) / 11.0 % (888) / 9.1 % (419). In our endgame turns alone: tree between 11.9 % (84) against open 10.9 % (516). — [h_own.out](E:/cg-tmp/tcf/research_tempo/h_own.out)
- Our own endgames (DBG): 13 of 65 games, 1,678 living unit-turns, 14 units lost. Standing still with no predator within 3500: 0.4 % caught within 5 turns (n = 838); standing still with a predator at 2000-3500: 5.8 % (120) against 0.4 % (258, SEEK) and 1.1 % (95, FLEE) when moving; standing still with a predator within 2000: 13 of 19 (weak) against 16.5 % when fleeing (260). — [h_own.out](E:/cg-tmp/tcf/research_tempo/h_own.out)

### Inferences
- The endgame is worth little rank: 0.7 % of team-games. It is worth code only as a cheap rule, and only when the tie-break is not already won. That is computable in the bot: the hunting team's catches are exactly our own losses, so we know every catch turn of both teams. If our k-th catch is earlier than our k-th loss at the first difference, first place is safe and nothing the units do can change it.
- When it is not safe: the last unit decides (25 % lost with one unit alive against 11 % with two or more), so the units should not die together: spread, never at the wall, stand still (sight 2600 instead of 2000) only while no predator is within about 3000, then move straight away, never sideways or toward (60.9 % and 30.7 % against 19.2 %).
- "Standing still is safer" is mostly reverse cause (units stand because nobody has found them); the clean part is the table by predator distance: standing is as good as moving beyond 3000 and clearly worse inside 2000.
- Nets have no other use in the endgame and a net at the hunter is the best measured action inside 1200 (10 % against 22 %, n = 68); smoke barely helps there (19 %), a decoy goes with the worst outcome (40 %, probably thrown by units already cornered).
- "Hide behind a tree" is supported only as "put a tree on the line to a predator that is 1200-2000 away" (6 % against 12 %, n = 134). Hugging a tree when the predator is inside 1200 is the worst place measured (24.5 % against 9.4 % in open ground): the tree blocks the escape. In the endgame subset no benefit of a blocked line is visible (84 cases).
- The mirror case is worth more than the endgame itself: when our predator team is gone we cannot be caught, and the free hunt lifts the hunting team's place in 21 % of those endgames (17.6 % of team-games are in that seat). All fleeing, smoke-saving and dash-saving logic should be off there.

### Gaps
- Trees are unknown in public logs, so tree and line-of-sight figures rest on our own 65 debug games and our own units only; the endgame subset (600 unit-turns) is too small to answer "is hiding behind a tree better than standing in the open" for the endgame specifically.
- How many nets teams still hold when the endgame starts is not in public logs.
- Not measured: how v10 does in the hunting seat of an endgame (our predator eliminated).

## 5. Ghosts: where teams send them and whether it pays

### Takeaway
A ghost is a free scout: in our own games a prey unit with one of our ghosts within 2000 is in our sight 85-91 % of the time, against 60-67 % with a living unit within 2000 and 0 % with neither. Across all teams, a ghost next to a prey unit whose nearest hunter is far away raises the chance that the prey is caught within 20 turns from 8.4 % to 11.0 % (hunter beyond 5000) and from 13.7 % to 16.1 % (hunter 3000-5000); next to prey that hunters already follow it changes nothing. Half of all ghost-turns in Gold are spent near nothing. The share of ghost time near living *predators* is the one that goes with winning (26 % wins in the lowest third, 37 % in the highest); the share near prey does not.

### Cited Findings
- Mechanics checked on 9,452 of our own ghost-turns with exact positions (DBG): a ghost moves 600 per MOVE and 1,200 per DASH in a straight line through trees (error under 1.4 units; 932 dashes checked). Ghost dashes are not printed by the referee (0 in 2,533 games), so other teams' ghost positions are rebuilt with that model. 8 % of ghost orders in TOP are DASH. — [g0.out](E:/cg-tmp/tcf/research_tempo/g0.out)
- Frequency (TOP): 93 % of team-games have a ghost; 146 ghost-turns per team-game while prey is still alive (median 135). — [f_top.out](E:/cg-tmp/tcf/research_tempo/f_top.out)
- Where ghosts are (TOP, 543,377 ghost-turns; all / winners / non-winners): within 2000 of living prey only 18.8 % / 14.1 % / 20.9 %; of prey and a predator 7.9 % / 6.2 % / 8.7 %; of a living predator only 11.9 % / 10.9 % / 12.4 %; of an own living unit only 7.1 % / 6.0 % / 7.6 %; **near nothing 45.1 % / 34.0 % / 49.9 %**; no prey left 9.1 % / 28.8 % / 0.6 %. Standing still: 8-9 % of the ghost-turns near something, 19 % of those near nothing, 35 % of those with no prey left. OLD: near prey only 20.0 %, near nothing 45.7 %. Counting only the turns on which prey is still alive, winners and non-winners place their ghosts alike: within 2000 of prey 28.5 % / 29.8 %, of a predator 24.0 % / 21.2 %, near nothing 47.8 % / 50.2 % (the raw shares differ because winners' ghosts spend 29 % of their time after the last prey is caught). — [f_top.out](E:/cg-tmp/tcf/research_tempo/f_top.out), [f_old.out](E:/cg-tmp/tcf/research_tempo/f_old.out)
- Effect on the prey (free living prey unit-turns of a team that has a ghost and a living hunter; prey caught within 10 / 20 turns; "reached" = a living hunter within 1500 of it within 8 turns):

| Nearest living hunter | Ghost within 2000 of the prey | Ghost beyond 4000 |
|---|---|---|
| TOP, beyond 5000 | 3.9 % / **11.0 %**, reached 12.9 % (n = 15,625) | 2.2 % / **8.4 %**, reached 7.9 % (45,758) |
| TOP, 3000-5000 | 7.3 % / 16.1 %, reached 23.8 % (21,989) | 5.1 % / 13.7 %, reached 18.3 % (36,925) |
| TOP, 1500-3000 | 13.4 % / 23.0 %, reached 47.1 % (34,497) | 14.9 % / 24.0 %, reached 45.7 % (32,925) |
| TOP, under 1500 | 28.6 % / 38.5 % (31,297) | 31.0 % / 40.9 % (24,766) |
| OLD, beyond 5000 | 3.6 % / 10.5 %, reached 11.9 % (21,545) | 2.0 % / 6.9 %, reached 7.3 % (61,671) |
| OLD, 3000-5000 | 5.6 % / 13.3 %, reached 21.2 % (30,479) | 4.5 % / 11.6 %, reached 18.0 % (50,702) |
| OLD, 1500-3000 | 11.9 % / 20.7 % (45,965) | 12.8 % / 22.5 % (46,128) |

  — [f_top.out](E:/cg-tmp/tcf/research_tempo/f_top.out), [f_old.out](E:/cg-tmp/tcf/research_tempo/f_old.out)
- Team-games with 10 or more ghost-turns while prey lives, split in thirds (TOP, n = 3,089):

| Split by | Lowest third | Middle | Highest third |
|---|---|---|---|
| share of ghost-turns within 2000 of living prey | 8 %: 2.68 catches per 100 turns after the first ghost, win 34 %, rank 1.97 | 26 %: 3.04, 29 %, 2.09 | 52 %: 3.15, 30 %, 2.09 |
| share within 2000 of a living predator | 10 %: 2.59, win 26 %, rank 2.12 | 20 %: 3.04, 31 %, 2.06 | 41 %: **3.34, 37 %, 1.97** |
| share standing still | 0 %: 2.87, 32 %, 2.05 | 6 %: 3.18, 29 %, 2.05 | 33 %: 2.82, 31 %, 2.04 |

  OLD (n = 3,860): near prey 2.47 / 2.71 / 2.81 catches per 100 turns, win 36 / 29 / 28 %; near a predator 2.38 / 2.72 / 2.97, win 25 / 34 / 34 %. The lowest "near prey" third gets its first ghost later (turn 17.7 against 12.3 and 13.7), i.e. those teams simply lose units later. — [f_top.out](E:/cg-tmp/tcf/research_tempo/f_top.out), [f_old.out](E:/cg-tmp/tcf/research_tempo/f_old.out)
- By team (TOP; ghost-turns while prey lives: near prey / near a predator / near nothing / standing still; wins): ATI x iHot 36 / 21 / 45 / 17 %, wins 64 % (85 team-games); Les Gens Bons 33 / 17 / 49 / 19 %, 54 % (191); FullStuck 41 / 22 / 35 / 17 %, 43 % (253); RNG 32 / 32 / 41 / 4 %, 40 % (187); Agave 32 / 19 / 50 / 6 %, 44 % (132); Kogaion 25 / 17 / 59 / 9 %, 25 % (138). Lowest users: RoastedTurkishCoffee 11 / 15 / 74 / 46 %, wins 22 % (67); Hostile Foragers 16 / 15 / 68 / 4 %, 24 % (83). Us in the arena (US, 75 team-games): 38 / 35 / 35 / 3 %. — [f_top.out](E:/cg-tmp/tcf/research_tempo/f_top.out), [f_us.out](E:/cg-tmp/tcf/research_tempo/f_us.out)
- Our own games, what a ghost lets us see (DBG, 65 games; share of prey unit-turns in which that prey unit is in our input):

| | Prey seen | n |
|---|---|---|
| our ghost within 2000, no living unit within 2600 | **91.3 %** | 2,489 |
| our ghost within 2000 and a living unit within 2000 | 85.5 % | 1,104 |
| no ghost within 2000, a living unit within 2000 (we have ghosts elsewhere) | 60.0 % | 916 |
| we have no ghost, a living unit within 2000 | 66.7 % | 1,189 |
| nothing of ours within 2600 | 0.0-0.3 % | 4,117 |

  Per turn: some prey in sight on 91.6 % of the turns with a ghost within 2000 of a living prey unit (n = 2,768), on 21.0 % of the turns where our ghosts are all elsewhere (1,381), on 44.3 % of the turns before we have a ghost (1,459). — [h_own.out](E:/cg-tmp/tcf/research_tempo/h_own.out)
- Where our ghosts are (DBG, 9,509 ghost-turns while prey lives): near living prey 48.8 %; near a living predator only 31.4 %; near an own unit only 6.5 %; near nothing 13.3 %. — [h_own.out](E:/cg-tmp/tcf/research_tempo/h_own.out)
- Finding and finishing the last prey units (DBG): with 2 prey left: 23.4 turns per game, prey in sight on 62.5 % of them, 41 catches = one per 37 turns (2.96 living hunters); with 1 left: 24.5 turns per game, in sight 52.7 %, 15 catches in 1,591 turns = one per 106 turns (2.67 living hunters). Arena (US, public logs): one catch per 26 / 40 / 69 turns with 3 / 2 / 1 prey left; TOP field: one per 29 / 43 / 70 turns; TOP winners one per 15 / 23 / 47, non-winners one per 40 / 71 / 209. — [h_own.out](E:/cg-tmp/tcf/research_tempo/h_own.out), [j_us.out](E:/cg-tmp/tcf/research_tempo/j_us.out), [j_top.out](E:/cg-tmp/tcf/research_tempo/j_top.out)
- What one more catch would be worth at the end (US, our 80 arena games): we finish with exactly 1 prey unit left in 26 games (33 %; first in 54 % of them) and with 2 left in 21 (26 %; first in 14 %); in 22 of those 47 games (27.5 % of all 80) we were not first and the winner had at most one catch more than we did. TOP field, same definition: 28.5 % of team-games. With no prey left: first in 86 % (US, n = 22; TOP, n = 811). — [j_us.out](E:/cg-tmp/tcf/research_tempo/j_us.out), [j_top.out](E:/cg-tmp/tcf/research_tempo/j_top.out)

### Inferences
- A ghost sees prey better than a living hunter does (91 % against 60-67 % at the same distance): it can stand inside trees and next to the prey without being driven off. Every turn a ghost is not within 2000 of a living enemy is wasted sight; the field wastes 45 % of its ghost-turns, we waste 13 % (debug) to 35 % (public-log estimate).
- Ghosts near prey do not make hunters that are already close catch more (28.6 % against 31.0 %); the gain is in *finding and reaching* far prey (reached within 8 turns 12.9 % against 7.9 %; caught within 20 turns +2.6 points in TOP, +3.6 in OLD). So the best prey for a ghost is the one no living hunter is near, and the last prey units above all: with one prey left we see it only 53 % of the turns although a ghost on it would give about 91 %.
- The stable association with winning is ghost time near living *predators* (win 26 % to 37 % across thirds in TOP, 25 % to 34 % in OLD; in our own 80 arena games, all three teams, 21 % to 44 % with 71-73 team-games per third). A ghost on a predator shows it to our living units; `kb/gold-autopsy.md` found that 79 of our 186 lost units had no known predator within 2500. This is association only; a plausible split is one ghost per approaching predator, the rest on prey that no hunter is near.
- Finishing, not finding, limits the last catch: even with the prey in sight 53-63 % of the time we catch one per 37 to 106 turns, like the field. The last prey units are the ones that flee best.

### Gaps
- Cause and effect for ghost placement cannot be separated in logs: ghosts appear where units die, which is where predators and often prey are. The table by hunter distance is the fairest view; it is not an experiment.
- Whether a ghost sees through smoke, and whether a ghost DASH has a cooldown, was not determined (our own ghost dashes all moved 1,200).
- Not measured: how long a specific far prey unit stays unseen with and without a ghost for other teams (no sight in public logs).

## 6. Stale targets and searching (hypothesis B6)

### Takeaway
Not supported as a cause of losses. 22 % of our HUNT orders are given with no prey in sight; that share, the share of prey in sight and the direction of blind steps are the same in wins and non-wins or slightly *higher* in wins. A prey unit we lose sight of is seen again after 6 turns (median); a third of the gaps last more than 8 turns and a tenth more than 25. B6 (forget after 8 turns) would touch very few orders: only 34 of 1,365 blind HUNT steps came 9 or more turns after the last sighting.

### Cited Findings
- Orders of our living units while prey lives (DBG, 65 games): HUNT 9,362 orders, 22.0 % with no prey unit in sight; SEEK 3,633 (all without prey in sight); FLEE 3,910, 33.8 % without prey in sight; CATCH 146. — [h_own.out](E:/cg-tmp/tcf/research_tempo/h_own.out)
- HUNT and SEEK orders with no prey in sight: 47.4 % in wins (31 games) against 41.3 % in non-wins (34). Split at the median: low half (28 % blind) mean rank 1.84, 41 % wins, 3.69 catches; high half (60 % blind) mean rank 1.52, 55 % wins, 3.30 catches (32 and 33 games). — [h_own.out](E:/cg-tmp/tcf/research_tempo/h_own.out)
- Prey unit-turns in our sight: 37.9 % in wins, 37.8 % in non-wins; low half (23 %) mean rank 1.63, high half (48 %) 1.73. — [h_own.out](E:/cg-tmp/tcf/research_tempo/h_own.out)
- Time between losing sight of a prey unit and seeing it again: 503 gaps = 7.7 per game; median 6 turns, mean 10.1, three quarters within 12, nine tenths within 25; 33.6 % longer than 8 turns, 9.7 % longer than 25. Lost and never seen again before it died or the game ended: 82 = 1.26 per game (median 4 turns to that end). Prey units never seen in a whole game: 0.18 per game. — [h_own.out](E:/cg-tmp/tcf/research_tempo/h_own.out)
- Is a blind HUNT step aimed at where the prey really is? (DBG; the order is our next step, so the test is its direction against the real position of the nearest living prey; a random direction would be "at it" 33 % of the time.) With no prey in sight: at it 51-57 %, away from it 14-19 % (n = 1,365). By turns since any prey was last seen: 1-3 turns: 54.5 % at it (n = 784); 4-8 turns: 49.0 % (449); 9-25 turns: 38 % (n = 34); never seen yet (opening, known starts): 81.6 % (98). With prey in sight and the nearest real prey under 2000: 77.7 % at it (1,456). — [h_own.out](E:/cg-tmp/tcf/research_tempo/h_own.out)
- Blind HUNT steps not heading at the nearest real prey: 45.7 % in wins, 45.8 % in non-wins; low half (20 %) mean rank 1.63 and 3.84 catches, high half (58 %) 1.73 and 3.15 catches (32 and 33 games; one standard error of a mean rank here is about 0.14). — [h_own.out](E:/cg-tmp/tcf/research_tempo/h_own.out)

### Inferences
- Searching is not where rank is lost in Gold: sight of prey is equal in wins and non-wins, and blind hunting is more common in wins (wins contain long late hunts for the last prey). This repeats the 39-game check in `kb/battle-924177559.md` on 65 games.
- The bot already stops hunting blind quickly (only 34 blind HUNT steps later than 8 turns after the last sighting; SEEK takes over), so "forget after 8 turns" changes almost nothing. The measurable weakness is smaller: remembered positions lose value within 4-8 turns (49 % at the prey, from 54.5 %).
- The larger lever for sight is the ghost (section 5): a turn with a ghost on prey has prey in sight 92 % of the time against 21 %.

### Gaps
- 65 games, 47 distinct battles, two bot versions mixed; a difference of 0.2 in mean rank between halves is inside the noise.
- The step direction test needs every prey position known within 10 turns, which leaves out long blind stretches (the cases B6 is about); the count of late blind HUNT steps (34) is therefore a lower bound.

## 7. How often each situation occurs, and the changes ranked by possible effect on rank

### Takeaway
The tempo and finishing items come first because they occur in every game and decide the tie-break (30 % of games) and the last catch (one more catch would have tied or passed the winner in 27.5 % of our games); ghost placement is cheap and second; the endgame comes last (0.7 % of team-games).

### Cited Findings
- Occurrence per team-game: an opening in every game; a unit with a predator start within 2000 on turn 1: 1.3 per team-game in TOP (3,474 units in 2,664 team-games), 1.2 for v10 (53 in 44); flee-or-hunt: 14.6 unit-turns in 6.3 episodes (ours 11.9 unit-turns); ghost-turns while prey lives: 146; turns with one prey left: 16.1 per team-game in TOP, 17.3 for us; endgame as the team with nothing left to catch: 17.6 % of team-games, at risk of losing first place 4.9 %, lost 0.7 %; endgame in the hunting seat: 17.6 %. — [i_us.out](E:/cg-tmp/tcf/research_tempo/i_us.out), [c_top.out](E:/cg-tmp/tcf/research_tempo/c_top.out), [f_top.out](E:/cg-tmp/tcf/research_tempo/f_top.out), [j_us.out](E:/cg-tmp/tcf/research_tempo/j_us.out), [j_top.out](E:/cg-tmp/tcf/research_tempo/j_top.out), [d_all.out](E:/cg-tmp/tcf/research_tempo/d_all.out)
- Value of the outcomes the changes aim at: one catch by turn 10 = -0.28 rank and +14 points of win rate; one unit fewer lost by turn 10 = -0.28 rank and +12 points; top two level on catches in 30 % of games, median gap of the deciding first catch 9 turns. — [a_top.out](E:/cg-tmp/tcf/research_tempo/a_top.out)

### Inferences

Ranked list. "Size" is the measured difference in the logs, not a promise; every item needs a switch and a fair test (local pool and replayed Gold battles), and items 1-4 must be tested one at a time because the coordinator's simulation already showed that a blunt "more aggressive" change is worse.

| # | Change | Cases per game | Measured difference | Caveat |
|---|---|---|---|---|
| 1 | **Hunters that are not threatened spread over different prey units by turn 4** (v10 covers 0.59 prey units with a hunter within 1500 at turn 4; our opponents on the same maps 0.68, TOP field 0.84, tempo leaders 0.98, ATI x iHot 0.95); never three or more units on one prey on turn 1 (v10 does it in 18 % of games, like the field) | every game | each further prey unit covered: +0.13 catches and -0.11 losses by turn 10, rank -0.11 (s.e. 0.026) in TOP, -0.05 (0.023) in OLD; three or more on one prey: rank +0.16 (0.059) and +0.23 (0.047) | within-game association; a unit must be alive and free at turn 4 to count |
| 2 | **Keep going at prey that is not on the predator's side** (prey at a right angle to or opposite the predator, any predator distance; prey on the predator's side only with the predator beyond 1800); turn away when the prey is on the predator's side and the predator is inside 1200 | 11.9 unit-turns per game for us, about 4 of them at a right angle | at a right angle we go at the prey 41 % of the time, the field 58-64 %; there the unit is caught within 5 turns 9.5 % going on against 12.3 % turning away and the prey is caught 26.7 % against 10.6 % (n = 9,577 and 4,123); the one dangerous cell is 37 % against 22 % (n = 888 and 1,985) | selection (fleeing units may be the truly threatened ones); this is not "less distance to predators" |
| 3 | **Use the first net on turn 2-3, at prey that dashed on turn 1 or is inside 1500; walk in at once** (v10: 0.59 such nets per game, tempo leaders 0.90) | about 1 per game | turn-2 net: hit 55 %, catch per net 33 % (turn 1: 28 % and 15 %; turns 3-5: 39-47 % and 25-30 %); matched: +11 points catch against a turn-1 net (914 triples), rank -0.09 (0.044); within game +0.23 catches by turn 10 per net, rank -0.04 (0.026) | part selection (a unit throws because it is in range); `kb/gold.md` shows v10's far nets convert badly, so keep the distance limit |
| 4 | **A unit with a predator start inside 2000 dashes on turn 1 as well as smoking**, toward a prey start when one lies off the predator's line, not straight away (v10 dashes in 17 % of these cases; field 78 %, ATI x iHot 100 %) | 1.2 units per game | any dash against no dash: lost by turn 10 27.2 % against 38.9 % (1,013 triples), rank -0.07 (0.038); dash at prey against dash away: 26.3 % against 34.8 % lost, 16.4 % against 8.8 % catch (594 triples) | with smoke already thrown the dash comparison has 22 triples (weak): lost by turn 5 4.5 % against 31.8 % |
| 5 | **Keep the turn-1 smoke on ourselves next to a predator; do not delay it** (v10 already does: 74 % of threatened units) | 1.2 units per game | lost by turn 10 21.7 % against 39.5 %, netted by turn 5 11.6 % against 38.0 %, rank -0.18 (0.063) (496 triples); still -7.8 points lost with the predator at 2000-3000 (290 triples) | this is the largest opening effect in the data and agrees with the simulation: "smoke later" is the wrong direction |
| 6 | **Dash, not walk, at a prey start when no predator starts within 2500, and dash again by turn 3 when the prey is inside 2500** (v10: 0.40 dashes per unit in turns 2-5; field 0.61, leaders 0.69) | about 1 unit per game with prey inside 2500 and no predator within 2500 | dash against walk: catch by turn 10 18.4 % against 13.8 %, losses equal, netted +4 points (3,005 triples); second dash: 41.2 % against 21.6 % catch (967 triples, partly reverse cause) | v10 already dashes at prey in 68 % of these cases; the gap is the second dash |
| 7 | **Ghosts as eyes: one ghost on each living prey unit that no living hunter is within 3000 of, first of all on the last one or two prey; one ghost on the predator nearest to our living units; none idle** | 146 ghost-turns per game; 17 turns per game with one prey left | our sight of a prey unit: 91 % with a ghost within 2000 against 0 % with nothing and 60-67 % with a living unit; far prey caught within 20 turns 11.0 % against 8.4 % (TOP), 10.5 % against 6.9 % (OLD); ghost time near predators: win 26 % to 37 % across thirds | we already keep 49 % of ghost-turns near prey; the gain is in assignment (far prey, last prey, predators), measured only as association |
| 8 | **With a predator inside 1200 and a net or smoke in the pool, use it and keep moving at dash speed** (net at the predator, or smoke with a dash) instead of fleeing without a power | part of the 11.9 unit-turns; predator under 1200 in about a quarter | caught within 5 turns: dash + net at the predator 7.2 % (n = 69), dash + smoke 5.7 % (141), against 16-22 % without a power; walking smoke away 26 % (181) | small cells; nets spent here are missing for catches |
| 9 | **When our predator team is eliminated: all-out hunt** (no fleeing, no saving of dashes or smoke, every net thrown) | 17.6 % of games | the hunting team adds 0.93 catches and gains a place in 21 % of these endgames (286 of 1,336) | our own behaviour in that seat was not measured |
| 10 | **Endgame rule, only when the tie-break against our hunter is not already won** (we know it: its catches are our losses): spread, stay off the wall, stand still only with no predator within 3000, then straight away; throw left-over nets at the hunter | at risk in 4.9 % of games | first place lost in 13.6 % of at-risk endgames (25 % with one unit alive); wall 38 % against 17-19 % caught; standing still inside 2000: 19-43 % against 12-22 % moving; net at the hunter 10 % against 22 % (n = 68) | worth 0.7 % of team-games at most |
| 11 | Forget remembered prey positions sooner (B6) | 34 blind HUNT steps later than 8 turns in 65 games | no association with rank; blind hunting is more common in wins | lowest priority |

- Items 1, 3, 4 and 6 all pull the first catch forward; v10's first catch is at turn 11 (median) against 8 for the field and 6 for winners, and 30 % of games are settled by that turn.
- Items 2, 7 and 8 serve the last catch: in 27.5 % of our arena games one more catch would have tied or passed the winner.

### Gaps
- None of the listed changes was tested; the sizes are differences between groups of logged games. The fair order of testing is 1, 3, 2, 4, 7.
- An expected rank gain per change cannot be given honestly: the coefficients are associations and overlap (items 1, 3 and 6 produce the same early catches).
- TOP was still being downloaded during the analysis; figures are from the 1,128 files present at 13:45. A first pass on the 768 files present earlier gave the same pattern (ties 31.1 %, first catcher wins 54 %, -0.270 / +0.278 rank per early catch / loss).
