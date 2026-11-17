# Try Catch Forest (Unleash the Geek 2026): preparation notes

Written on 2026-11-17, **before the statement was available**. Two sources:

1. Two replay videos of the viewer (first version of these notes).
2. The referee's text logs of **320 finished Gold-league games** between the top 12 teams of the leaderboard, read through the CodinGame API (2643 catches, 4138 nets, 3736 decoys). Everything marked *measured* comes from these logs.

The statement is still the authority: go through "Still unknown" as soon as it opens.

## The contest

| | |
|---|---|
| Contest | Unleash the Geek 2026, id `unleash-the-geek-2026-opp35`, game "Try Catch Forest" (private event game) |
| Account | `leosam10`, registered, squad "The Final Boss" (2 of 3 members) |
| Play windows for this site | 18 Nov 09:00-18:00 IST and 19 Nov 09:00-12:00 IST. Outside them the statement, test games and submissions answer "paused"; leaderboard and finished games stay readable |
| Leaderboard on 17 Nov | 171 players: Gold 143, Silver 23, Bronze 5 |
| API limits | 120 requests/min; test games 10/min and 600/day; submissions 5 per 5 minutes |

Nothing has been tested or submitted for the account yet.

## Rules, as measured

| Rule | Value | Confidence |
|---|---|---|
| Players, length | 3 players, 100 turns | measured |
| Cycle | player 0 scissors, 1 paper, 2 rock. Player i catches player (i+1)%3 and is caught by (i+2)%3 | measured, 2643 catches, no exception |
| **Score** | **number of catches. Ties: the team whose first catch came earlier** | measured: ranking follows it in 640/640 comparisons, 161 ties |
| Units per team | 3, 4, 5 or 6 (about equally often); ids are global, player p owns p*N .. p*N+N-1 | measured |
| Trees | 6 to 33 circles of different sizes; they block movement, sight and nets | measured |
| Item pools | per team, different every game (seen 1 to 10 of a kind) | measured |
| Arena | circle, centre (0,0), radius 8000, y downwards; a unit's centre never goes beyond 7780 (unit radius about 220) | measured |
| MOVE | 600 per turn | measured |
| DASH | 1200 per turn; after a dash on turn t the next one is possible on turn t+2 | measured |
| NET | flies up to 2000 in a straight line and stops at the first tree, at the first unit or decoy on its way, or **at its aim point**. Grabs units within about 470 of its path, several at once, own units too (24 cases) | measured |
| Netted unit | cannot move for 4 turns | measured |
| SMOKE | placed up to 2000 away; most teams drop it on the unit itself | measured |
| DECOY | starts at the unit and walks to the given point; an enemy that walks into it destroys it; it absorbs a net | measured |
| Caught unit | becomes a ghost: still accepts MOVE, cannot use items | measured |
| A unit may | move or dash, and use one item, in the same turn | measured |
| Sight radius | 2400 to 2700 | estimate from the videos |
| Catch distance | about 450 | estimate |
| "Sprites collected", "trees touched" in the end screen | no effect on the score | measured |

Output: one line, commands joined by `;`:

```
MOVE id x y [message]     DASH id x y [message]     NET id x y     SMOKE id x y     DECOY id x y
```

## What decides a game (320 games)

- **The opening.** 25 % of all catches happen in turns 1-10, 12 % in turns 1-5. The team that makes the first catch wins 51 % of the games and is last in 17 %; the team that loses the first unit wins 17 % and is last in 52 %.
- **Seat does not matter**: wins by seat 111 / 111 / 98.
- **Catches per game**: 4.9 with 3 units per team, 7.1 with 4, 9.9 with 5, 12.0 with 6. In 168 games one team was wiped out (median turn 69); its hunter won 98 % of those.
- **How units die**
  - 32 % of the victims were held by a net. A netted unit is caught within 3 turns in 38 % of the cases.
  - 68 % were free. Of these, **80 % still had their dash available** and only 8 % of all victims had ordered a DASH on the turn they died. They walked while the hunter dashed.
  - The hunter dashed on the catch turn in 40 % of the catches, from about 1060 away (median), up to 1800.
  - 28 % of the catches happen beyond 6000 from the centre (against the wall), 26 % inside 3000 (the opening crowd).
- **Nets**
  - Hit rate rises with the aim distance: under 750: 20 %; 750-1500: 46 %; 1500-1950: 55 %; full range: 56 %. The reason is "stopped by aim": 58 % of the short nets stop before reaching anyone, against 26 % at full range. **Aim the net at full range along the line through the target**, never at the target's current position.
  - Nets on turns 1-2 hit 44 %, later ones 51 to 66 %.
  - 13 % of the nets are absorbed by a decoy, 4 % by a tree.
  - 39 % of the net hits are on the team's own predator (defence), 61 % on its prey.
- **Decoys**: half are destroyed by an enemy walking into them, 14 % absorb a net. They buy time and soak nets; they do not score.

### First, second and third place in the same game

| Average per game | 1st | 2nd | 3rd |
|---|---|---|---|
| Catches | 3.85 | 2.82 | 1.59 |
| Units lost | 2.26 | 2.78 | 3.22 |
| Catches by turn 10 | 0.97 | 0.71 | 0.40 |
| Units lost by turn 10 | 0.46 | 0.61 | 1.01 |
| Nets thrown | 4.34 | 4.30 | 4.28 |
| Net hit rate | 54 % | 53 % | 45 % |
| Nets that hit nothing | 1.24 | 1.27 | 1.55 |
| Smokes used | 3.31 | 2.85 | 2.68 |
| Own units netted | 2.08 | 2.10 | 2.43 |
| Enemy decoys destroyed | 2.11 | 1.81 | 1.94 |

Everybody throws the same number of nets and dashes about as often (8-9 % of the moves). Winners differ in **when they lose units** (half as many in the first 10 turns), in **net accuracy**, and in using more smoke.

### Teams

| Team | Games | Win | Last | What stands out |
|---|---|---|---|---|
| Les Gens Bons | 59 | 64 % | 14 % | best in the sample. 2.8 of its 4.4 nets in turns 1-3, 57 % hits, 1.17 catches by turn 10, only 0.41 losses by turn 10, 3.9 smokes, dashes least of all (5 %), never two units to one point |
| Agave | 57 | 51 % | 23 % | 3.0 nets in turns 1-3, 56 % hits, 1.16 catches by turn 10, almost no early smoke, dashes most (11 %) |
| CodePistols (leaderboard #2) | 66 | 41 % | 29 % | most catches overall (3.29) but slow start: 0.47 catches and 0.89 losses by turn 10 |
| INVALID FOP (leaderboard #1) | 60 | 37 % | 28 % | defensive: 4.4 smokes, 2.2 of them by turn 10, 0.43 losses by turn 10; only 49 % net hits |
| ATA | 42 | 38 % | 48 % | all or nothing: 1.17 losses by turn 10, 32 % net hits |
| BitingBytes | 57 | 25 % | - | 38 % net hits, most units sent to a shared point, decoys on almost every unit on turn 1 |
| GoToVictory | 39 | 23 % | 36 % | 2.3 decoys in turns 1-3, units sent to shared points, smoke kept for later |

Turn 1 of the strong teams: almost every unit dashes, one or two throw a net at prey standing next to them, Les Gens Bons and INVALID FOP also drop a smoke on a unit that has a predator next to it.

Most teams run the same per-unit state machine, visible in their labels: `HUNT / FLEE / SEEK / GHOST`, `scout / patrol / chase / flee / lie-low / avoid-net`, `pincer / cornered / dash-flee / dash-chase`, `shadow / hunt / search`.

## Mistakes of the losing teams

1. **Losing units in the opening crowd.** Third place loses 1.0 unit by turn 10, the winner 0.46.
2. **Walking away from a hunter that can dash.** The dash was spent earlier on travelling, or never ordered. A predator with a dash reaches about 1650 (1200 + catch distance) in one turn.
3. **Aiming the net at the target's position.** It stops there and the target has moved. Short-range nets (under 750) are nearly always wasted.
4. **Nets into decoys and trees** (17 % of all nets).
5. **Several units ordered to the same point**: one predator, or one net, threatens all of them.
6. **Items at the wrong time**: decoys on turn 1 with no predator near, smoke kept until the fight is over, every net gone before turn 5.
7. **Fleeing to the wall**: 28 % of the catches happen in the outer ring.

## Plan for the bot

1. **Parse everything, hard-code nothing**: units per team, item pools, trees.
2. **Per unit, every turn**: FLEE if a predator is within the danger distance, else HUNT the best prey, else SEEK in its own sector.
3. **Dash discipline**: travel with MOVE. Dash only (a) to catch: prey within 1650 and a free line, (b) to escape: a predator within 2250, (c) on turn 1.
4. **Kill zone**: never end a turn within 1650 of a predator that may still have its dash; track every enemy's last dash.
5. **Nets**: free line, target 750 to 2000 away, **aimed at full range through the target's predicted position**, at a unit and not at a decoy (a real unit was there last turn; a decoy appears next to a unit and walks straight). Then send the nearest hunter with its dash: a netted unit stands for 4 turns. Use a net on a predator that is about to reach a unit with no dash and no smoke.
6. **Smoke** on the unit itself when a predator is within 2250.
7. **Decoy** when fleeing with a predator in sight, sent across the predator's path.
8. **Spread**: different prey per hunter while more than one is known; no shared destination; stay off the outer ring when fleeing.
9. **Three-player thinking**: my predator's predator is my prey. Fleeing towards my prey's units brings my hunter into danger and me closer to food.
10. **Ties**: with 3 units per team, scores like 2-2 are common and the earlier first catch wins. An early safe catch outweighs a late one.

`prep/try-catch-forest/Player.java` holds rules 2 to 6 and 8 as code with the measured constants; `SelfTest.java` checks it (28 checks). The input parsing (`readInit`, `readTurn`) is still a stub.

## Still unknown (ask the statement)

1. Input per turn: what is visible (ghosts, decoys marked or not, smoke clouds, nets, enemy item counts), and whether dash cooldown and net state are given.
2. Exact catch distance and the order of resolution in a turn (move, net, catch).
3. Sight radius; smoke radius and duration; whether smoke blocks sight through it or only inside it.
4. Whether a netted hunter can still catch, and whether a netted unit can use items.
5. Decoy lifetime and speed.
6. What ghosts are good for (sight? blocking?).
7. Time limit per turn; differences between leagues.

## Sources

| Source | What it gave |
|---|---|
| `UTG battle 250(1,2,4).mp4` | 5 units per team, items 6/3/6: Commit Happens (rock) 4, INVALID FOP (paper) 3, GoToVictory (scissors) 1 |
| `Media1.mp4` | 3 units per team, items 1/2/3: INVALID FOP 2 "(earliest catch)", BitingBytes 2, GoToVictory 1 |
| 320 game logs | everything marked measured. Scripts in `prep/try-catch-forest/research/`; the downloaded logs stay outside the repository |

## When the window opens

1. Read the statement and the stub generator through the API (CodinGame skill), settle the unknowns above.
2. Fill `readInit` / `readTurn`, correct the two estimated constants, play test games against the boss, read the logs.
3. Add the game to cg-arena (`node cli.js new`, add-challenge skill) for local iteration, then submit when asked.
