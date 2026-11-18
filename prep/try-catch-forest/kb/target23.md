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

## What 23 is, measured (2026-11-18, 18:45 IST, from the leaderboard and battle lists; the window was closed)

Reading battles, the leaderboard and game logs works while the window is paused. Scripts: `E:/cg-tmp/tcf/peer/peers.py`
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
