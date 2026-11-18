# Target 23: where the points could come from (2026-11-18, 16:45 IST)

v10 finished its run at 19.48 (132nd of 416). Rank 50 is at about 23, the leaders at 25 to 27.
This note looks for levers outside "one more rule on v10". Each item says what the evidence is and how to test it.

## 1. The strongest evidence we have: in the same field, the leader mimic outranks v10

Real Gold arena games, mean rank by units per team (games in brackets):

| Bot | 3 units | 4 units | 5 units | 6 units | All |
|---|---|---|---|---|---|
| v10, its own run (11:35 to about 15:00) | 1.50 (12) | 2.42 (12) | 1.57 (7) | 1.67 (15) | 1.80 (46) |
| v10 code inside the hybrid (from 16:02) | 2.07 (15) | | 2.24 (29) | 1.76 (17) | 2.07 (61) |
| v10 code, both runs | 1.81 (27) | 2.42 (12) | 2.11 (36) | 1.72 (32) | 1.95 (107) |
| Leader mimic, 15:08 copy, its own run (15:41 to 16:02) | 1.40 (5) | 2.00 (6) | 1.80 (5) | 2.00 (2) | 1.78 (18) |
| Leader mimic inside the hybrid (from 16:02) | | 1.50 (16) | | | 1.50 (16) |
| Leader mimic, both | 1.40 (5) | 1.64 (22) | 1.80 (5) | 2.00 (2) | 1.65 (34) |
| v5 | 2.00 (4) | 2.20 (5) | 1.62 (13) | 1.86 (7) | 1.83 (29) |

Three readings:
1. **The field got harder during the day.** The same v10 code scored 1.80 before 15:00 and 2.07 after 16:00.
   Results from different hours must not be compared; neither must replays of morning battles and afternoon arena
   games. (Other teams resubmit all day; the top changed several times.)
2. **Inside the hybrid's run (same hours, same opposition) the mimic part is at 1.50 over 16 games and the v10 part at
   2.07 over 61.** The difference is about two and a half standard errors. The only confound is the unit count
   (the mimic plays the 4-unit games), and the top teams do not find 4-unit games easier (ATI x iHot 1.62 at 4
   against 1.65 to 1.77; Les Gens Bons 1.68 against 1.67 to 1.77).
3. **v10 is weak with 5 units as well as with 4**: 2.11 over 36 games. Its good counts are 3 and 6.

So the cheapest step with real-arena support is not a new rule: it is to **let the mimic play more of the games**.
- Variant A: mimic for 4 and 5 units, v10 for 3 and 6 (covers v10's two weak counts, about half of all games).
- Variant B: mimic for every count (its record at 3, 5 and 6 units is only 12 games).
- Test: the arena itself, as today. One submission per variant, read by unit count after 40 to 60 games.
  The comparison is valid only inside one run; `E:/cg-tmp/tcf/gold/hybtrack.py <submission>` prints it.
- The replay of the 15:08 copy (level to slightly worse than v10 on 20 of v10's battles) points the other way.
  Those were battles from v10's own, earlier run; the arena record of the afternoon is the larger and later sample.

## 2. A portfolio instead of one bot

The hybrid is the first case of a general idea: at turn 1 the bot knows the unit count, its pool of nets, smokes
and decoys, the trees and every start position. Different bots can be best for different games, and one file can
hold several (two fit in 56,540 characters; the limit is 100,000, and comments can be stripped).
- Already measured: unit count. Not yet looked at: pool size (a game with one net is a different game from one
  with five), start geometry (predator within 1,500 of several units on turn 1), tree density.
- The debug replays hold pools and trees; the arena logs hold unit counts and the opening moves. An hour of
  analysis would show whether any of these splits our results as sharply as the unit count does.

## 3. Play the three-player game, not two duels

- 32 of our 44 Gold non-wins were won by our prey team, and in none of the 18 games where it caught every unit of
  the third team did we win. The winner's points come from the team that hunts us.
- We know two of the three scores at every turn: ours, and the predator team's (it equals our losses).
- Ideas that follow, none tried:
  1. **Hunt the hunters first.** Choose the prey unit that is closest to one of our predators (it is about to
     score) rather than the one closest to us. Each such catch is a point for us and a hunter less for the rival.
  2. **Trade or do not trade by who is ahead.** v10 takes a certain catch even when it costs the unit (the loss
     counts 0.2). That is right when the prey team is the rival, wrong when our losses already equal or exceed our
     catches: then it hands the predator team the lead.
  3. **Hold a late lead.** 14 % of v10's lost places are a single predator catch after turn 70 on a unit that had
     fled for six turns or more with its dashes spent. After about turn 65, with a lead over the predator team:
     no hunting by units inside 3,000 of a predator, dash and one smoke kept in reserve.

## 4. Tune by self-play overnight, now that the pool is worth something

- The local referee plays a game a second. Until today its opponents were our own versions, and its verdicts moved
  with the pool more than with the change. The three mimics are different opponents; in the pool with them and with
  v1 and v5 as fixed members, later smoke lost, as it did on real battles.
- v11 exposes about 25 numbers of v10 (pull towards prey, distance kept, dash costs, net distances, smoke and decoy
  distances). A simple search (change a few numbers, 480 games against the mimics, keep what is better, repeat)
  can run for the 15 hours between the windows: about 50,000 games.
- Risk: fitting the mimics instead of the field. Guard: hold out one mimic and v1/v5 for the final comparison, and
  let the arena decide between the tuned bot and the untuned one.

## 5. The search engine (vchase)

Built today: two-ply flight and forced-catch test with the referee's exact movement rule for both sides
(`versions/vchase.java`). 60 games without a crash; timing could not be measured on the loaded machine; pools
against the mimics are running. This is the route to "deciding better inside a chase". It is one evening old and
untested in the arena, so it is a candidate for tomorrow, not a result.

## 6. Smaller out-of-the-box ideas, untested

- **Decoys as bait.** 77 to 90 % of our decoys are destroyed by a predator walking into them: predators chase them.
  A decoy sent away from a hunter that is busy with prey buys that hunter turns.
- **Phantom second hunter.** Prey flees from a decoy as from a unit. A decoy walked at prey from the side pushes
  its flight line towards the real hunter or the wall.
- **Opening book.** Every start position is known on turn 1. For the common shapes (prey inside 1,040; predator
  inside 1,500; nobody near) the best first three turns can be computed offline with the local referee.

## What 23 would take, honestly

- v10's own figures: 0.80 places lost per game. The mimic's arena record is 0.65. A team at the top loses about 0.5.
- If the mimic's 1.50 to 1.65 held for all the games it plays, widening its share is worth more than everything else
  on this list together, and it can be tested in one arena run tomorrow morning.
- Nothing here is proven. The order of work that the evidence supports: item 1 in the arena first; item 3.3 and
  item 4 overnight on the local referee; vchase to the arena only after a timing run.

## What 23 is, measured (2026-11-18, 18:25 IST, from the leaderboard and battle lists; the window was closed)

Reading battles, the leaderboard and game logs works while the window is paused. Scripts: `tools/peer/peers.py`
(teams ranked 35 to 64), `peers23.py` (95 to 130); opponent ranks are the current leaderboard ranks.

1. **23 is rank 95 to 130 of 440, not the top 50.** Rating by rank now: 5th 28.4, 20th 26.6, 50th 25.1, 100th 23.3,
   150th 22.3, 250th 20.2. We finished the last run at 18.99 (302nd).
2. **We do not lose our rating to the top teams; we hardly meet them.** Live code, both runs, 206 games: 10 games
   had a top-100 opponent. 60 % of our lost places went to winners ranked 100 to 250 and 36 % to winners ranked
   beyond 250.
3. **The gap to 23, on the opponents we actually meet:**

   | Opponents in the game | Teams ranked 95 to 130 (rating about 23) | Teams ranked 35 to 64 (about 25) | Us (live code, two runs) |
   |---|---|---|---|
   | both ranked 100 to 250 | 1.81; first 41 %, last 23 % (246 games) | 1.73; 50 %, 22 % (44) | 2.09; 28 %, 37 % (96) |
   | one ranked beyond 250 | 1.69; first 51 %, last 19 % (96) | 1.41; 70 %, 11 % (27) | 1.95; 35 %, 30 % (100) |
   | one in the top 100 | 1.99; 34 %, 33 % (206) | 1.86 (118) | 1.86 (7 games) |
   | both in the top 100 | 2.23; 20 %, 43 % (116) | 2.02 (572) | 2.00 (3 games) |

   A team at 23 is not better than us against the top (it finishes last 43 % of the time there). It is 0.26 to 0.28
   better in mean rank against the lower half of the field: it wins 41 to 51 % of those games and is last in about
   20 %, where we win 28 to 35 % and are last in 30 to 37 %.
4. **So the target has a measurable form: a mean rank of 1.8 or better against opponents ranked 100 to 400.**
   `tools/pairfield.py` plays exactly those opponents (the live bot's recent ones, mean rank about 240). A candidate
   that holds 1.75 to 1.8 there over 40 or more battles has the profile of a 23-rated team; the live code's 1.95 to
   2.09 has the profile of 19 to 20.5. vgo_b's 1.69 over 13 battles would be enough if it held; 13 battles do not
   show that.
5. **Where the live code's places go** (224 games, 222 places lost; one main reason per game, `tools/whylost.py`):

   | Winner | Share of places | Main reasons |
   |---|---|---|
   | ranked 100 to 250 | 60 % | predator team caught more of ours than we caught 31 %; no catch of ours by turn 15 25 %; hunt stalled 15 %; tie-break 12 % |
   | ranked beyond 250 | 36 % | no catch by turn 15 36 %; predator team caught more 23 %; hunt stalled 17 %; two hunters lost by turn 20 12 % |
   | top 100 | 2 % | |

   Against the weakest third of the field the largest single item is still "no catch by turn 15". With v10 the
   predator team hardly ever won (11 % of places); with the live code's early aggression it is the largest item
   against mid-field teams (31 %): the aggression bought earlier catches and paid in units.

## How teams at 23 play the lower half of the field, next to us (2026-11-18, 18:40 IST)

271 games of teams ranked 95 to 130 and 214 games of the live code (two runs), all against opponents ranked beyond
100. `tools/peer/peerprofile.py`, `tools/peer/earlynets3.py` (they read the downloads in `E:/cg-tmp/tcf/peer/`). The sample is
9 teams, so team habits weigh heavily: a difference in habits is not a proven cause.

| Per game | Teams at about 23 | Us (live code) |
|---|---|---|
| Mean rank; first; last | 1.78; 45 %; 23 % | 2.00; 34 %; 33 % |
| Catches | 3.12 | 2.66 |
| Catches by turn 10 / 15 / 30 | 0.87 / 1.20 / 1.71 | 0.58 / 0.80 / 1.50 |
| First catch, median turn | 8 | 11 |
| Games with no catch by turn 15 | 28 % | 42 % |
| Units lost (by turn 10 / by 30 / after 60) | 2.68 (0.72 / 1.52 / 0.51) | 2.38 (0.44 / 1.32 / 0.42) |
| Nets (by turn 3 / by turn 15) | 4.27 (1.77 / 3.32) | 4.52 (0.69 / 2.42) |
| Nets that hit prey; hits that became a catch | 34 %; 62 % | 31 %; 70 % |
| Nets that hit a predator | 20 % | 28 % |
| Dashes per unit (turns 1 to 15) | 8.36 (2.45) | 6.39 (1.97) |
| Smokes (in turns 1 to 5) | 3.31 (0.77) | 4.32 (1.69) |
| Decoys | 3.84 | 4.36 |

By units per team (mean rank, games): 3: 1.71 (69) against our 1.92 (49); 4: 1.63 (71) against 1.97 (59);
5: 1.99 (71) against 1.98 (53); 6: 1.78 (60) against 2.11 (53).

Readings:
1. **They are not safer than we are; they lose more units (2.68 against 2.38) and still rank higher.** The whole
   difference is on the catching side, and most of it early: +0.29 catches by turn 10, +0.40 by turn 15, +0.46 in all.
2. **Nets: the same number, thrown earlier.** Catches that follow a net within five turns, per game:

   | Net thrown in turns | Teams at 23: nets, hit prey, catches | Us: nets, hit prey, catches |
   |---|---|---|
   | 1 | 0.80, 28 %, 0.13 | none (our rule forbids a turn-1 net at prey that can dash) |
   | 2 to 3 | 0.97, 37 %, 0.22 | 0.69, 24 %, 0.13 |
   | 4 to 10 | 1.13, 35 %, 0.27 | 1.01, 27 %, 0.20 |
   | 11 to 100 | 1.37, 37 %, 0.35 | 2.82, 34 %, 0.67 |
   | all | 4.27, 0.97 | 4.52, 1.00 |

   A net is worth 16 to 26 % of a catch whenever it is thrown, a turn-1 net the least (16 %). Throwing early does
   not add catches from nets (0.97 against 1.00); it moves 0.3 of them from after turn 10 to before it. That is what
   the tie-break (12 % of our lost places) and "no catch by turn 15" are made of.
3. **The catches they have and we have not are made without a net**: 2.15 a game against 1.66. They dash a third more
   (8.4 against 6.4 per unit; the share of catches made with a dash is the same, 40 %), so they chase more, not
   differently.
4. **Less smoke, above all at the start** (0.77 against 1.69 in turns 1 to 5). A unit that smokes cannot net in that
   turn. On real replays "smoke later" lost with v10 (learnings 5c), so this is noted, not acted on.
5. Trap in this analysis: a net stops at the first thing it meets, so nets grouped by flight distance look far better
   at short range (54 to 62 % hits) than they are; the misses all sit in the 1,800 to 2,000 group. Grouped by turn
   only, the figures above are unbiased.

Candidate built from reading 2: `versions/vlive_net1.java` = the live code with one net allowed on turn 1 at prey
within 1,900 after our move (`F_NET1`, `P_NET1`, `P_NET1_MAX`). 60 local games without a crash; locally its catches
by turn 10 are 0.93 against 0.58 for the live code (the local referee shows the mechanism, not the rank). Expected
size, honestly: earlier catches, not more; a few hundredths of mean rank through tie-breaks unless the early catch
also frees hunters. It joins the paired test of the last window.

Checked at 18:42 IST: test games are refused outside the play windows ("your site may only run test games and
submit during its play windows"), so the paired test cannot run overnight. Battle lists, the leaderboard and game
logs stay readable.

## What a difference in mean rank is worth in rating points (2026-11-18, 18:50 IST)

From the tables above, against the opponents we actually meet:

| Group | Rating | Mean rank, both opponents ranked 100 to 250 | Mean rank, one beyond 250 |
|---|---|---|---|
| Us, live code (runs of 20.47 and 18.99) | about 19.7 | 2.09 | 1.95 |
| Teams ranked 95 to 130 | about 23 | 1.81 | 1.69 |
| Teams ranked 35 to 64 | about 25 | 1.73 | 1.41 |

Between us and the teams at 23: 3.3 points for 0.26 to 0.28 of mean rank, so **0.1 of mean rank is worth about 1.2
rating points** in this part of the field (three groups only; from 23 to 25 the two columns give 0.4 and 2.5 points
per 0.1, so the figure is rough). One run of the arena has a spread of about 0.75 points, which is 0.06 of mean rank.

Sized with that rate; none of these is confirmed, and the bands are one standard error:

| Lever | Measured difference | In points if it held |
|---|---|---|
| vgo_b against the live code, 13 paired battles | 0.23 mean rank (1.69 against 1.92), SE 0.2 | about +2.8, band +0.4 to +5 |
| Leader mimic for the 4-unit games (27 % of games): 1.64 over 22 arena games against the live code's 1.97 | 0.09 mean rank over all games | about +1.1; but the portfolio built that way scored 2.15 against 1.92 on 13 paired battles |
| Turn-1 net (`vlive_net1`) | not measured; tie-breaks are 12 % of lost places | about +0.3 to +0.5 at best |
| Best of three runs instead of one | 0.6 points on average | +0.6 |

So 23 needs 0.27 of mean rank. Only vgo_b's unconfirmed lead is of that size; everything else is a third of it or
less. The paired test of the last window settles vgo_b first: after 30 shared battles its standard error is about
0.13 of mean rank (1.6 points).

## Where the gap to 23 sits: games without a catch by turn 15 (2026-11-18, 19:05 IST)

Same games as above (271 of teams at 23, 214 of ours, opponents ranked beyond 100). `tools/peer/sizing.py`.

| | Teams at 23 | Us |
|---|---|---|
| Games with a catch by turn 15: share; mean rank; first; last | 72 %; 1.74; 47 %; 21 % | 58 %; 1.81; 44 %; 25 % |
| Games without one: share; mean rank; first; last | 28 %; 1.88; 38 %; 26 % | 42 %; 2.26; 19 %; 44 % |
| In the games without one: catches; units lost | 2.41; 1.74 | 2.18; 2.18 |

1. **With a catch by turn 15 we play like a team at 23** (1.81 against 1.74). The gap is in the other games.
2. Sized by replacing our figures with theirs (0.1 of mean rank is about 1.2 points):
   - as few slow games as they have (28 % instead of 42 %): 2.00 to 1.94, **about +0.75 points**;
   - and the slow games ending as theirs do (1.88 instead of 2.26): to 1.83, **about +2 points in all**.
   These are observed differences between teams, not effects of a change of ours.
3. **They avoid slow games where there are many units, and they do it with nets in turns 1 to 3:**

   | Units | No catch by turn 15: they / we | Catches by turn 15: they / we | of which after a net: they / we | Their turn-1 nets: number, hit, catches |
   |---|---|---|---|---|
   | 3 | 57 % / 57 % | 0.48 / 0.53 | 0.29 / 0.33 | 0.45, 16 %, 0.01 |
   | 4 | 31 % / 44 % | 1.00 / 0.68 | 0.58 / 0.42 | 0.70, 26 %, 0.07 |
   | 5 | 17 % / 40 % | 1.44 / 0.87 | 0.82 / 0.51 | 0.82, 29 %, 0.15 |
   | 6 | 5 % / 28 % | 1.97 / 1.13 | 1.23 / 0.55 | 1.28, 32 %, 0.28 |

   With 3 units there is no difference and a turn-1 net is wasted. With 6 units they have 1.23 catches after a net
   by turn 15, we have 0.55; more than half of that difference comes from nets thrown in turns 1 to 3
   (0.61 catches against 0.19).
4. **Units lost in slow games: no difference once the unit count is held fixed** (corrected at 19:20; the totals
   1.74 against 2.18 are a mix effect: our slow games are more often 5- and 6-unit games, where more units fall).
   Slow games by units, they / we: lost 1.31 / 1.25 (3 units), 1.82 / 2.00 (4), 2.58 / 2.62 (5); mean rank
   1.87 / 2.14, 1.68 / 2.23, 2.25 / 2.33; catches 1.82 / 1.82, 3.05 / 1.77, 2.67 / 2.48 (12 to 39 games per cell).
   So the data neither supports nor contradicts a press mode. What stands out is the 4-unit slow game: they still
   reach 3.05 catches, we 1.77. The sizing of reading 2 holds within unit counts: 1.995 now, 1.92 with their share
   of slow games at each count, 1.83 with their rank in those games as well (`tools/peer/sizing4.py`).
5. Mean rank by final catches is the same staircase for both groups (1 catch 2.6, 2 catches 2.1 to 2.2, 3 catches
   1.7, 5 or more 1.15): one more catch goes with 0.32 of mean rank.
6. Net hits that are not caught within five turns: 0.42 a game for us, 0.56 for them. We convert better than they
   do (70 % against 62 %), so "convert net hits" has at most 0.4 catches a game in it and is not where they lead.

`versions/vlive_net1.java` now follows reading 3: turn-1 nets at most 0 / 1 / 2 / 2 for 3 / 4 / 5 / 6 units.
60 local games without a crash; the local rank moved from 1.97 to 2.22 between two seed sets with the live code at
2.10 and 1.97, which again shows only that the local referee cannot rank.
