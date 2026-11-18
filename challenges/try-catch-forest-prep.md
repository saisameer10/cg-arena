# Try Catch Forest (Unleash the Geek 2026): research and battle plan

Written on 2026-11-17, **before the statement was available**. The statement stays the authority: check "Still unknown" as soon as the play window opens.

## 0. The statement (read 2026-11-18) and the bot built on it

The statement is in `challenges/raw/try-catch-forest/` (git-ignored). What it settles, against sections 2 and 10 below:

| Topic | Statement | Earlier measurement |
|---|---|---|
| Dash | after the k-th dash a unit waits k turns; the input gives `turnsRemaining` and `fatigue` for every visible unit, enemies included | "every second turn" (true for the first dash only) |
| Catch | two discs of radius 220 overlap (centres closer than 440), tested along the whole move, in time order | about 400, end of turn |
| Net | disc of radius 250 flying up to 2000, stopped by a tree within 250 of its line, holds 5 turns | 4 turns |
| Smoke | radius 1900, 9 turns, thrown up to 2000; blocks sight only, units inside are blind and invisible | "immune to nets" (true in practice: nobody can aim) |
| Sight | 2000, 2600 after a turn without moving; blocked by trees and smoke | 2000-2400 |
| Ghosts | invisible, cannot catch or use powers, walk through trees, still move, dash and see for the team | unknown |
| Decoy | walks 600 per turn for 10 turns, shown to others under the unit's own id, takes a net in its place | partly known |
| End | a team with no living unit is removed; the game stops when two teams are out or after 100 turns | known |
| Ties | compared catch by catch: who made the 1st earlier, then the 2nd... | "earlier first catch" |
| Time | 1000 ms first turn, 50 ms afterwards | unknown |

Found in the first test game, not in the statement:
- the three teams start as 120 degree rotations of each other (unit j of player p is my unit j turned by (p - me) x 120 degrees), so every enemy position is known on turn 1;
- ids: units 0..3N-1 (player p owns p*N..p*N+N-1), then trees, then decoys and smoke;
- the final score shown is 3 x catches + 0/1/2 for the tie-break order;
- an undocumented entity type `SECRET_FOREST_SPRITE` (owner -1) appears in the input; the bot ignores unknown types.

`prep/try-catch-forest/Player.java` is the bot (one file, Java). Each living unit scores about 50 candidate moves with one function:
1. never finish a move where a predator could touch it this turn (its reach is 1200 if its dash is ready, else 600);
2. keep a two-turn escape margin, stay out of clear net lines and out of the wall ring;
3. inside those limits, close in on its prey (two hunters per prey at most, netted prey first);
4. a catch the prey cannot avoid (netted, or no dash and inside dash reach) outranks everything, even a possible loss.
Powers: nets at prey that cannot dodge (dash on cooldown, closer than 1400, or moving along the line), thrown from the position after the move at full range; a net at the hunter that is about to reach us; smoke ahead of the unit when a predator has a clear line within 2300; a decoy walked straight at the predator as a net shield. Ghosts sit on prey so the hunters keep seeing them.

First results (test games, Bronze): 7 wins in 7 against the boss, 30 catches for 7 units lost, no error or timeout.
Later versions, the audit of the bot against these patterns and the test tools: `prep/try-catch-forest/kb/`.

## 1. What this is based on

| | |
|---|---|
| Games | **1,408 finished Gold-league games** (11,834 catches, 18,400 nets, 12,900 smokes, 16,900 decoys): the latest battles of the current top 25 of the leaderboard, plus 320 games downloaded earlier |
| Source | referee text logs through the CodinGame API: every bot's output line and every referee event of every turn |
| Positions | rebuilt turn by turn from each unit's own orders, re-anchored on every position the referee prints. Checked against those positions: median error 1 to 3 units, 90 % under 470 |
| Two earlier videos | used for the first version of these notes; everything below is re-measured on the logs |
| Limits | trees and sight are not in the logs. "Distance" figures ignore trees. A statistic says what goes together, not always what causes what; where a number is weak it is said so |

Contest: Unleash the Geek 2026 (`unleash-the-geek-2026-opp35`), account `leosam10`, squad "The Final Boss". Play windows: 18 Nov 09:00-18:00 IST and 19 Nov 09:00-12:00 IST. Leaderboard on 17 Nov evening: 174 players, 153 in Gold. Nothing has been tested or submitted for the account.

## 2. Rules, as measured

| Rule | Value | How sure |
|---|---|---|
| Players, length | 3 players, 100 turns. A wiped-out team stops playing, the game goes on | measured |
| Cycle | player 0 scissors, 1 paper, 2 rock. Player i catches (i+1)%3 and is caught by (i+2)%3 | measured, no exception |
| **Score** | **number of catches; ties: the earlier first catch wins** | measured |
| Units per team | 3, 4, 5 or 6, about equally often. Ids are global: player p owns p*N .. p*N+N-1 | measured |
| Arena | circle, centre (0,0), radius 8000; unit radius about 220 | measured |
| MOVE / DASH | 600 / 1200 per turn; after a dash on turn t the next is possible on turn t+2 | measured |
| **Order inside a turn** | **1. decoys appear, 2. everybody moves, 3. catches, 4. nets and smoke of the survivors, from their new positions** | measured: 2,480 victims ordered a net or smoke on the turn they were caught, none was executed; all 532 decoys were |
| Catch distance | about 400 | measured from the strike table below |
| NET | flies up to 2000 from the thrower's position **after its move**, stops at the first tree, the first unit or decoy, or its aim point. Holds a unit for 4 turns | measured |
| A netted unit | cannot move, **can still use items** (5,000 cases) and still catches prey that walks into it (126 cases) | measured |
| SMOKE | placed up to 2000 away, after the move. **No unit inside fresh smoke was netted: 0 of 12,431 exposures, against 2 % per turn in the open; no net landed within 1200 of a fresh cloud** | measured |
| Smoke and catches | smoke does not stop a hunter that walks in: same death rate inside and outside | measured |
| DECOY | appears at the unit before it moves and walks to the given point. 95 % of destroyed decoys are destroyed by the owner's predator; 8 % of all nets end in a decoy | measured |
| Ghost | a caught unit; still takes MOVE, cannot use items | measured |
| WAIT | accepted as a command (2,094 uses), with an optional message | measured |
| Sight radius | 2000 to 2400 (bots stop reacting to predators between these distances) | estimate |
| Item pools | per team, different every game | measured |
| "Sprites", "trees touched" on the end screen | no effect on the score | measured |

Output: one line, commands joined by `;`: `MOVE id x y [msg]`, `DASH id x y [msg]`, `NET id x y`, `SMOKE id x y`, `DECOY id x y`, `WAIT`.

### The strike table: is the prey caught this very turn?

Start distance hunter to prey, free prey, hunter heading for it.

| Hunter / prey | 450 | 600 | 750 | 900 | 1050 | 1200 | 1350 | 1500 | 1650 |
|---|---|---|---|---|---|---|---|---|---|
| DASH / prey walks away | 85 % | 78 % | 69 % | 51 % | 9 % | 2 % | 2 % | 1 % | 1 % |
| DASH / prey walks sideways or stands | 90 % | 85 % | 61 % | 61 % | 55 % | 29 % | 9 % | 5 % | 2 % |
| DASH / prey walks toward | - | - | - | - | 77 % | 66 % | 60 % | 49 % | 42 % |
| DASH / prey **dashes away** | 3 % | 1 % | 1 % | 1 % | 1 % | 1 % | 0 % | 0 % | 0 % |
| MOVE / prey walks away | 4 % | 1 % | 1 % | 1 % | 0 % | 0 % | 0 % | 0 % | 0 % |
| MOVE / prey walks toward | 89 % | 85 % | 72 % | 64 % | 52 % | 39 % | 21 % | 10 % | 1 % |

Three laws follow, and the whole plan rests on them:

1. **A walking hunter never catches a unit that walks away.**
2. **A dashing hunter catches a walking unit from 900 or less, not from 1050 or more.**
3. **A unit that dashes away is not caught that turn** (1 %).

## 3. What decides a game

- **Catches, and the first one.** The team with the first catch wins 54 % and is last in 17 %. 32 % of all games end with the top two level on catches, so the earlier first catch decides a third of the games.
- **The opening.** First catch: median turn 4 (turn 7 with 3 units per team, turn 3 with 5 or 6). A team that loses no unit by turn 10 wins 43 %; one that does wins 25 %.

| Opening x first catch x net accuracy (per team per game) | Games | Win | Last |
|---|---|---|---|
| no early loss + first catch | 867 | 59 % | 13 % |
| early loss + first catch | 541 | 45 % | 24 % |
| no early loss, no first catch, nets 60 %+ | 428 | 36 % | 25 % |
| no early loss, no first catch, nets under 60 % | 705 | 28 % | 33 % |
| early loss, no first catch | 1,683 | 18 % | 49 % |

- **Units per team change the game.**

| Units | Catches per game | First catch (median turn) | First catcher wins | A team wiped out | Top two level |
|---|---|---|---|---|---|
| 3 | 5.0 | 7 | 61 % | 59 % | 36 % |
| 4 | 7.3 | 4 | 55 % | 56 % | 34 % |
| 5 | 9.6 | 3 | 49 % | 49 % | 30 % |
| 6 | 12.0 | 3 | 49 % | 51 % | 28 % |

- **Wipe-outs.** In 54 % of the games a team loses every unit; its hunter wins 88 % of those.
- **Seats are balanced**, and the last team is as often the winner's prey as its predator.

### First, second, third place in the same game

| Per game | 1st | 2nd | 3rd |
|---|---|---|---|
| Catches per own unit | 0.86 | 0.65 | 0.37 |
| Own units lost | 52 % | 61 % | 74 % |
| Own units lost by turn 10 | 11 % | 15 % | 22 % |
| Got the first catch | 46 % | 35 % | 19 % |
| Time with a predator within 1800 | 21 % | 19 % | 20 % |
| ... caught within 3 turns when that happens | **8 %** | 12 % | **16 %** |
| Time with prey within 1800 | 18 % | 22 % | 25 % |
| ... prey caught within 3 turns when that happens | **22 %** | 16 % | **9 %** |
| Net hit rate | 55 % | 53 % | 47 % |
| Net hits on prey turned into a catch | **70 %** | 61 % | **51 %** |
| Own netted units that are caught | 56 % | 64 % | 72 % |
| Smokes used / share of the pool | 3.4 / 79 % | 2.9 / 69 % | 2.9 / 67 % |
| Dash share of all moves | 8.5 % | 9.2 % | 10.2 % |

Winners are not less exposed and they are not nearer to prey. They **finish** (22 % against 9 %) and they **survive the same danger** (8 % against 16 %).

## 4. Patterns of winners

**W1. Net, then walk in.** A net alone scores nothing; the follow-up does.

| Free hunter's distance to the netted prey | Caught within 4 turns |
|---|---|
| under 1200 | 76 % |
| 1200-1800 | 54 % |
| 1800-2400 | 40 % |
| over 3600 | 19 % |

Prey within 1200: walking at it converts 17 %, dashing 32 %, **netted and walked at 80 %, netted and dashed at 95 %**. Winners have a hunter within 1800 of the netted unit in 85 % of their net hits.

**W2. Net the unit that cannot dodge.**

| Target at the moment of the throw | Net hits |
|---|---|
| can dash | 63 % |
| dash on cooldown | 83 % |
| already netted | 90 % |
| walked along the line of the net | 85 % |
| walked across the line | 50 % |
| dashed across the line | 14 % |

By distance (thrower to target, target able to dash / on cooldown): under 1400: 73 % / 87 %; 1400-2000: 63 % / 81 %; over 2000: 48 % / 62 %.

**W3. Net late, not on turn 1.**

| Net thrown on | Hit | Catches per net |
|---|---|---|
| turn 1 | 28 % | 0.10 |
| turn 2 | 62 % | 0.21 |
| turns 3-15 | 46-54 % | 0.14-0.19 |
| turns 16-40 | 60 % | 0.24 |
| turn 41+ | 67 % | 0.31 |

On turn 1 everybody can dash, so the net misses. On turn 2 the 64 % of units that dashed on turn 1 cannot.

**W4. Hunt in pairs.** Free prey with one hunter within 1800: caught within 3 turns 10 %; two hunters 20 %; three 30 %.

**W5. Strike when the prey has no dash.** The strongest bots do it three times as often as the field: Agave 50 %, Les Gens Bons 45 %, RemoteException 42 %, six-seven 32 %; field average 15 %. It needs the enemy's dash state, which is easy to track: a unit that moved more than 600 dashed.

**W6. Save the netted unit.**

| Own unit netted by its predator, next 3 turns | Caught within 5 turns |
|---|---|
| nothing done | 82 % |
| smoke on it | 50 % |
| the hunter netted back | 47 % |
| both | 33 % |

The netted unit can do it itself: netted with a predator within 1200, it dies in 69 % of the cases; if it nets that predator, 28 %.

**W7. Smoke one turn early, and keep smoking.** Smoke is the only full protection against nets, and 31 % of all victims were held by a net. Winners use 79 % of the smoke pool and still smoke after turn 50 (0.89 per game against 0.43 for third place). A team that never gets a unit netted wins 40 %.

**W8. Turn 1 next to a predator: dash away and smoke.** 25 % of all units start with a predator within 1800.

| Turn-1 order, predator within 1200 at the start | Caught by turn 5 |
|---|---|
| dash away | 33 % |
| dash away + decoy | 22 % |
| dash away + net | 16 % |
| **dash away + smoke** | **9 %** |
| walk away | 37 % |

With the predator at 1200-1800: dash away 26 %, with smoke 8 %.

## 5. Mistakes of the losers

**L1. Not reacting.** Of the free units that were caught, 52 % never moved away while the hunter closed in over the last turns, 29 % only part of the time. On the catch turn 31 % of all victims were walking toward their hunter. Only 19 % fled all the way and were still caught (10 % at the wall, 5 % outrun, 4 % cut off by a second hunter).

**L2. Dash at the wrong time.** 54 % of all victims were free with their dash available and did not use it. With a dash-ready hunter within 1050 only 17 % of the units dash away; when the hunter has no dash, 26 % burn theirs for nothing. Third place spends 10.2 % of its moves on dashes, the winner 8.5 %.

**L3. Item ordered too late.** 21 % of all victims had ordered a net or smoke on the turn they died. It never fires: catches come first.

**L4. Chasing without a finish.** Third place spends more time near prey than the winner (25 % against 18 %) and converts less than half as often. Walking after a unit that walks away catches nothing (law 1).

**L5. Nets on turn 1** (17 % of all nets, hit rate 28 %) and **nets across a dash-ready target** (14 % hit). 8 % of the nets are thrown with no enemy near the line at all.

**L6. Netted and abandoned**: 82 % caught. Decoys do not help a netted unit (77 % caught).

**L7. The wall ring.** A threatened unit beyond 6500 from the centre dies twice as often (19 % against 10 %).

**L8. Alone against several hunters**: one hunter within 2400: 9 % caught within 3 turns; two: 16 %; three: 23 %.

**L9. Walking toward a predator inside 1200**: 51 % caught within 3 turns; standing still 42 %; sideways 24 %; away 14 %; dash away 8 %.

## 6. What does not separate winners from losers

Checked and found flat, so not worth code or items:

- how much of the time a unit is near a predator, how spread the team is, how far from the centre it plays;
- the share of units that dash on turn 1;
- whether the net is aimed at the target, long through it or with a lead (50 / 58 / 58 % hits): the target's dash and direction decide;
- two units ordered to the same point (no relation to the result);
- decoys: about four per game for everybody; a decoy delays one hunter and absorbs 8 % of the nets;
- whether the hunter chasing you is itself being chased by the third team (11 % against 12 %).

## 7. The top 25, checked against these patterns

Games of the bot versions that hold the rank on 17 Nov evening. "Win" is against the opponents they met, mostly each other.

| # | Player [squad], language | Games | Win | Last | First catch | Lost by turn 10 | Net hit | Nets in turns 1-3 | Net to catch | Smokes | Dies when exposed | Converts near prey |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 15 | smkd_gab [Agave] C++ | 56 | **68 %** | 9 % | 52 % | 13 % | 62 % | 36 % | 76 % | 2.5 | 9.9 % | 16.8 % |
| 3 | JurassicParkour [RemoteException] Java | 108 | 49 % | 26 % | 33 % | 15 % | 36 % | 53 % | 69 % | 3.4 | 9.4 % | 16.9 % |
| 1 | TanguyM [Les Gens Bons] C++ | 107 | 49 % | 22 % | 33 % | 22 % | 46 % | 46 % | 62 % | 2.1 | 10.5 % | 19.6 % |
| 20 | dlemb [Commit Happens] Go | 58 | 47 % | 26 % | 26 % | 18 % | 50 % | 33 % | 68 % | 2.1 | 8.3 % | 17.1 % |
| 13 | troublesome_ [six-seven] Python | 56 | 46 % | 23 % | 36 % | 18 % | 65 % | 16 % | 72 % | 5.1 | 13.3 % | **25.8 %** |
| 25 | Romadeus [Hardcoders] Rust | 70 | 46 % | 33 % | 26 % | 13 % | 69 % | 42 % | 53 % | 0.7 | 8.9 % | 17.1 % |
| 9 | TON618. [ATA] Python | 76 | 43 % | 33 % | 24 % | 17 % | 55 % | 51 % | 47 % | 3.4 | 10.1 % | 15.5 % |
| 8 | ToonBl [CodePistols] TypeScript | 87 | 43 % | 26 % | 39 % | 17 % | 56 % | 74 % | 52 % | 3.1 | 12.6 % | 16.8 % |
| 5 | Zeibetsu [RNG] Rust | 76 | 42 % | 29 % | 36 % | 16 % | 60 % | 42 % | 64 % | 3.1 | 12.2 % | 16.1 % |
| 4 | ndoens [INVALID FOP] Java | 95 | 40 % | 22 % | 33 % | 17 % | 47 % | 42 % | 64 % | 4.2 | 10.4 % | 15.8 % |
| 6 | seburrito [Roman Empire] Java | 130 | 39 % | 32 % | 35 % | 17 % | 50 % | 42 % | 62 % | 1.9 | 9.7 % | 17.0 % |
| 19 | Anonymous00007 [Kogaion] C++ | 51 | 39 % | 20 % | 45 % | 11 % | 54 % | 15 % | 75 % | 4.5 | 11.3 % | 20.2 % |
| 14 | plengarov [Hostile Foragers] Python | 104 | 38 % | 29 % | 33 % | 22 % | 52 % | 38 % | 56 % | 3.2 | 12.7 % | 15.6 % |
| 2 | Semyg [ThePyanist] C++ | 188 | 37 % | 25 % | 38 % | 12 % | 66 % | 34 % | 63 % | 1.8 | 12.0 % | 16.4 % |
| 22 | UcCeyrek [DonerDrivenDesign] Python | 71 | 35 % | 27 % | 38 % | 10 % | 47 % | 39 % | 60 % | 3.9 | 13.3 % | 17.0 % |
| 24 | prompty [prompt_$$$] Python | 71 | 35 % | 28 % | 44 % | 12 % | 51 % | 37 % | 51 % | 3.0 | 12.4 % | 13.2 % |
| 12 | AstraOpusArgon [The PDAIs] C++ | 116 | 32 % | 32 % | 37 % | 10 % | 64 % | 39 % | 68 % | 4.1 | 12.6 % | 15.5 % |
| 17 | smarrag [Feta] Python | 113 | 30 % | 39 % | 31 % | 22 % | 47 % | 40 % | 71 % | 3.7 | 16.7 % | 16.0 % |
| 23 | zwu [405 Force] C++ | 113 | 30 % | 47 % | 28 % | 22 % | 44 % | 60 % | 63 % | 3.3 | 10.1 % | 17.9 % |
| 11 | Axel-but-Alex-is-fine [Vogue Mery] C++ | 120 | 30 % | 38 % | 41 % | 12 % | 50 % | 50 % | 51 % | 2.3 | 8.3 % | 14.9 % |
| 18 | Loic_RB [The Three Little Geeks] Java | 104 | 30 % | 38 % | 33 % | 15 % | 52 % | 28 % | 65 % | 4.1 | 9.7 % | 13.9 % |
| 16 | ---the-deathpat--- [Bitoven] JS | 176 | 29 % | 36 % | 31 % | 17 % | 48 % | 32 % | 67 % | 3.7 | 11.0 % | 15.1 % |
| 7 | FritzDerKater [BitingBytes] C++ | 160 | 29 % | 34 % | 34 % | 12 % | 36 % | 22 % | 66 % | 3.6 | 12.3 % | 16.7 % |
| 10 | capslow [ClaudeReviewers] Python | 152 | 28 % | 39 % | 24 % | 12 % | 59 % | 38 % | 59 % | 3.3 | 13.1 % | 15.7 % |
| 21 | Letzgo [JavaPasLaTete] Java | 72 | 25 % | 25 % | 36 % | 15 % | **80 %** | 20 % | 70 % | 1.1 | 10.8 % | 15.2 % |

What the table shows:

- **Agave is the bot to beat**: 68 % wins, last in 9 %. It gets the first catch in half its games, turns 76 % of its net hits into catches, strikes prey without a dash in 50 % of the chances and dashes onto netted prey most often (39 %). Its new version sits at rank 15 only because it was submitted recently.
- **Two net styles both work.** Early netters (CodePistols 74 % of nets in turns 1-3, 405 Force 60 %, RemoteException 53 %) and patient netters (Kogaion 15 %, six-seven 16 %, JavaPasLaTete 20 %). The patient ones hit more (54-80 %) and convert more (70-75 %). Accuracy alone is not enough: JavaPasLaTete hits 80 % and wins 25 %, because it uses one smoke per game and orders items on the death turn in 45 % of its losses.
- **Across the 48 bots with 30+ games**, the habits that go with the win rate are: catches per unit (+0.75), conversion near prey (+0.53), catches by turn 10 (+0.45), dashing at close prey (+0.38), netting close prey (+0.31); against it: death rate when exposed (-0.28) and a high dash share (-0.32). With 48 bots only values beyond about 0.3 mean something.
- **Nobody plays the three laws exactly.** Even in the top 25: a dash-ready hunter inside 1050 is answered with a dash in 18 % of the cases, 26 % of the dashes against a hunter without dash are wasted, a net is thrown at a close target without dash in 4 % of the chances, and 0.7 nets per game still go out on turn 1. This is where a new bot can be better than the field.

## 8. Battle plan

Priorities, in this order: (1) lose nothing in the first 10 turns, (2) take the first catch, (3) convert every net, (4) keep units out of nets.

**Every turn, for every enemy seen**: store position, turn seen, and whether it dashed (moved more than 600) or is netted. A unit held by a net is free again 4 turns later.

**Per unit, first rule that applies:**

1. **Held by a net**: smoke on itself if not covered; else net the nearest predator.
2. **Predator (not netted) within 3000: flee.**
   - It can dash and is within 1100: DASH away. This is the only time the dash is spent on defence.
   - Otherwise WALK away (laws 1 and 2). Never sideways, never toward, never stand.
   - Direction: maximum distance from all predators, out of the 6500 ring, behind a tree when possible, away from a second hunter.
   - Predator within 2200 and the landing spot not in smoke: SMOKE on the landing spot (it fires after the move). It must be in place the turn before a net can come.
   - No smoke left, predator within 1700 and without dash: NET it from the landing spot.
3. **Prey known: hunt.**
   - Netted prey within 2400 comes first, for the two nearest hunters.
   - DASH at it when it is within 950, or netted and within 1600. Prefer the turn its dash is on cooldown.
   - Otherwise WALK at it, and NET from the position after the move when the line is free of trees and smoke, and the prey either has its dash on cooldown or is within 1400. Not on turn 1.
   - At most two hunters per prey while other prey is known.
4. **Nothing known: search** in the unit's own sector; ghosts go to the last known prey positions (most teams move their ghosts toward prey; whether ghosts see is unknown).

**Opening**: turn 1: units with a predator within 1800 dash away and smoke, nearest threat first; the others walk or dash toward the nearest prey and keep their nets. Turn 2: net the prey that dashed on turn 1, then walk in.

**Item budget**: nets only with a hunter within 1200-1800 of the target after the throw; smoke for netted units first, then for the most threatened; decoys when fleeing with a predator in sight, sent across its path. Use the whole smoke pool: winners do.

**By game size**: with 3 units per team one catch often decides and the first catcher wins 61 %: play it safe, one sure net-and-catch. With 5 or 6 the first catch comes on turn 3 and matters less (49 %): volume wins, so pairs and conversions count more.

**After a wipe-out**: if our prey is gone we can only lose units: scatter, stay off the wall, smoke, run out the clock. If our predator is gone we are safe: every unit hunts, in pairs.

`prep/try-catch-forest/Player.java` implements rules 1 to 3, the opening rule for nets and the dash tracking, with 41 self-checks. The input parsing is still a stub.

## 9. Corrections to the first version of these notes (320 games)

- "Aim the net at full range through the target" was overstated: aim style changes the hit rate by a few points; the target's dash and direction change it from 14 % to 85 %.
- "Never send two units to one point" is not supported by the larger sample.
- "Flee toward your prey's units" has no measurable effect.
- Catch distance is about 400, not 450; a dash strikes from 950, not 1650.
- "The hunter of a wiped-out team wins 98 %" was 88 %: the first script counted turns wrongly after a team stopped playing.
- New: the order inside a turn, smoke as net protection, items of netted units, the turn-1 net trap.

## 10. Still unknown (ask the statement)

1. The input: what is visible (ghosts, decoys marked or not, smoke, nets), and whether dash cooldown, net state and item counts of enemies are given.
2. Sight radius; smoke radius and duration; whether smoke blocks sight through it.
3. Exact catch distance and whether a catch is tested along the path or at the end of the move.
4. Whether ghosts see, block or can do anything else.
5. Decoy speed and lifetime; whether a decoy looks different from a unit in the input.
6. What happens to a DASH ordered on cooldown, and to a move into a tree.
7. Time limits; differences between leagues.

## 11. Reproduce

Scripts in `prep/try-catch-forest/research/` (the downloaded logs stay outside the repository, in `E:\cg-tmp\cgskill\utg`):

```
node fetch.js 25 150 1100     download the latest battles of the top 25
node simcheck.js              accuracy of the rebuilt positions
node deepA.js                 threat and attack tables, nets, anatomy of a catch
node deepB.js                 openings, formations, three-way dynamics, item economy, order of resolution
node deepC.js                 team profiles, correlations, sight and ghost probes
node deepD.js                 strike distance, net timing, pincers, wall, smoke
node deepE.js                 how often bots use each opening (BOTS=name,name for single bots)
node deepF.js                 combinations of habits and results
node netturn.js               nets by turn
```
