# Mimics of the top three Gold squads (2026-11-18)

Three bots that play the way the first three squads of Gold play, built from their game logs only.
They are sparring partners and a source of rules to copy into our bot; they are not candidates to submit as they are.

| File | Imitates | Agent studied | Games |
|---|---|---|---|
| `versions/vmimic.java` | **ATI x iHot** (player ultimateraman), first at 14:14 IST, rating 27.47 | 6900145 | 110 |
| `versions/vmimic2.java` | **Les Gens Bons** (player MehLef), first at 13:28 (25.71), third at 14:14 | 6894245 | 200 |
| `versions/vmimic3.java` | **FullStuck** (player MatthCrouzet), second at 13:28 (24.47) | 6893977 | 264 |

One engine, three rule books: `vmimic2.java` is the master file, `tools/mimic_teams.py` writes the other two from it
(same code below the block of constants, other values and other evidence in the comments).

## 1. Who is on top, and why these three

A leaderboard row is a squad, shown under one player's name; `agents[].name` in a game log is the squad name. Every
submission gets a new agent id, and the squads resubmit during the play window, so "the current agent" changes
within the hour:

| Time (IST) | 1st | 2nd | 3rd | 4th | 5th |
|---|---|---|---|---|---|
| 13:28 | Les Gens Bons 25.71 | FullStuck 24.47 | SturdySoldiers 24.39 (55 % of placement) | RNG 24.26 | Team Avengers 24.14 (43 %) |
| 14:14 | ATI x iHot 27.47 (55 %) | Chris_Picantos' squad 26.97 (35 %) | Les Gens Bons 26.60 (new agent, 46 %) | Lore 26.17 (new agent, 35 %) | Vaxildan's squad 26.12 (53 %) |

- **ATI x iHot** was not in the first 200 this morning (its 46 games then were placement games of agent 6897069);
  agent 6900145 is first at 14:14. Its two agents differ on 16 of 50 fingerprint lines (more turn-1 smoke, earlier
  nets), so only the 110 games of 6900145 are used.
- **Les Gens Bons** replaced agent 6894245 (200 games) by 6900271 at about 14:00. The new one is the same on 42 of
  50 lines (92 games); new are some turn-1 smoke (21-24 % with a predator start at 1500-2500), later nets (median
  turn 7 instead of 3) and more smoke. The mimic follows the 200-game agent.
- **Third file**: the squads ranked above FullStuck at 14:14 other than these two had under 65 games of their
  current agents (Chris_Picantos' squad 61, Lore 64 after a resubmission, SturdySoldiers 64). FullStuck is the
  highest squad with a finished placement and over 100 games of one agent. Lore (third in the morning study)
  resubmitted and is not imitated; its old habits are in `autopsy/top-gold-teams.md`.
- Tools: `tools/mimic_fetch.js lb | battles <agent> | games <agent>` (read-only requests, one per second).

## 2. Method

- Logs: `E:/cg-tmp/tcf/goldtop/utg/games` (1,300 games after today's downloads) and `E:/cg-tmp/cgskill/utg/games`.
- `tools/mimic_lib.py` rebuilds positions from the referee's text (a position is printed at a dash, a decoy, a net,
  a smoke and a catch; in between the unit's own orders are replayed, trees ignored) and start positions through the
  120-degree symmetry. `tools/mimic_measure.py` and `mimic_measure2.py` print every table quoted below.
- **Distances are to the nearest living enemy, seen by the squad or not.** The logs do not say what a squad saw.
  A share of 60 to 80 % at short range therefore usually means "always, when it sees it"; the mimics apply the rule
  to what they see.
- **Pools are not in the logs.** A squad that uses an item on turn T had it on every earlier turn, so all trigger
  rates are computed over the turns up to the last use of that item ("while it is left").
- Trees are not in the logs: nothing can be said about hiding behind trees or steering around them. The mimics use
  v10's movement model and tree steering.
- `n` is the number of cases. **Weak** = fewer than 30 cases.

## 3. Rule book of the leader: ATI x iHot (agent 6900145, 110 games)

Results in these games: 54.5 % wins, mean rank 1.60, 3.61 catches and 2.79 losses per game, **0.41 units lost by
turn 10** (Les Gens Bons 0.80, FullStuck 0.98).

### Opening (turns 1 to 6)
| Rule | Evidence |
|---|---|
| Turn 1, nearest predator start under 2500: **dash and throw smoke**, both | dash 92 / 97 / 91 % and smoke 81 / 89 / 86 % at under 1500 / 1500-2000 / 2000-2500 (n = 77 / 64 / 66); at 2500-3500 dash 68 %, smoke 12 % (105); beyond 3500 dash 46 %, smoke 0 % (181) |
| It knows the starts through the symmetry | shares above 90 % cannot depend on what a tree hides |
| Direction of that dash: away only under 1500, else at the nearest prey | away (within 60 deg) 66 / 39 / 44 %, at the prey (within 45 deg) 58 / 75 / 65 % for the three bands |
| The smoke goes **at the predator**, at most 1800 from the unit after its dash | 9-11 deg off the predator (median), throw distance 1355 / 1618 / 1800 (quartiles), cloud centre 550 from the predator after the moves (n = 189); the unit is inside the edge of its cloud (98 %) and out of it two turns later (67 %) |
| No net and no decoy on turn 1 | 0 nets by 146 units with a prey start under 2000; 1 decoy in 110 games |
| Predator far: dash at the nearest prey up to about 3000 | dash 83 / 86 / 94 / 57 % with a prey start under 1000 / 1600 / 2200 / 3500 (n = 165), heading at it 82-92 % |
| Second dash on turn 3, as soon as the cooldown ends | dashes per game by turn: 3.16 / 0.13 / 1.27 / 0.48 / 0.45 / 0.77; on turn 3, 33-42 % of the ready units dash in every distance band |
| Powers in turns 1-5 | smokes 2.33 per game, nets 0.90, decoys 0.05 |

### Movement in the middle game (turn 7 on)
| Rule | Evidence |
|---|---|
| Flee from a predator under about 2200 | moving away 65-79 % under 1600, 62-69 % at 1600-2000, 46-52 % at 2000-2600, 23-26 % beyond 3500 (n = 9,000) |
| A prey under 1600 beats the predator | heading at the prey 79-92 % with prey under 1600 whatever the predator distance, even 81-84 % with the predator under 1200 (n = 2,400) |
| Target = the nearest prey; no sharing rule | 88 % of the units heading at a prey head at the nearest one (n = 8,268); one hunter on 74 % of the hunted prey-turns, two on 20 %, three on 5 % |
| Hunters aim one step ahead of the prey | median angle off position + last move 10 deg, off the position 13 deg (n = 5,800) |
| Fleeing is not straight away | median 31 deg off (40 deg beyond radius 5500); with two predators near, 38 deg off the nearest and 41 off their centre (n = 710) |
| At the wall with a predator near: along it | beyond radius 6500: along the wall 59 %, inward 22 % (n = 602) |
| No prey and no predator within 2500: keeps moving | standing 5 % (Les Gens Bons 19 %); 37 % head at the nearest prey, 25 % at the centre (n = 10,900). What it steers by cannot be recovered |
| Order target: always the end point of the step | MOVE target 550-650 from the unit for 89 % of 22,970 orders, DASH target at 1200 for 100 % of 2,647 |

### Dashes
| Situation | Dash share when the dash is ready |
|---|---|
| Prey at 600-1600, no predator within 2000 | 46-66 %, the same for prey with or without dash (n = 1,000); 23 % at 1600-2200 |
| Predator under 1600, its dash on cooldown | 80 / 75 / 52 % under 800 / 1200 / 1600 (n = 471) |
| Predator under 1600, its dash ready | 26 / 50 / 50 % (n = 563) |
| Predator at 1600-2000 | 21-37 % (n = 584) |
| Nobody near | 2 % (n = 9,818) |
| By number of dashes made | fleeing: 23 % with none made, 72-79 % with four or more: late in the game it dashes more, not less |
| Purpose of the dashes | attack 44-52 %, flee 19-33 %, travel 37 % in turns 1-6 and 15 % after turn 30 |

### Nets
| Rule | Evidence |
|---|---|
| Late | median net turn 17; 0.90 / 1.42 / 1.81 per game in turns 1-5 / 6-20 / 21-100 |
| At prey when its own move ends within about 1300, twice as often when the prey's dash is on cooldown | per unit-turn while nets are left: 11 / 16 / 13 / 5 / 0 % at 0-600 / 1000 / 1300 / 1600 / 2000 for prey without dash (n = 1,580), 6 / 9 / 5 / 6 / 0 % for prey with dash (n = 1,970); never at a held prey (0-1 %) |
| The rates are low: a gate we do not see | the mimic waits six turns between two nets at prey (fitted on the median turn) |
| **36 % of the nets go at predators**, close ones | per unit-turn: 19 / 17 / 13 % under 800 / 1200 / 1600 at a predator without dash, 6 / 17 / 5 % at one with dash (n = 994); thrower to target 802 after the moves (median, n = 150) |
| Aim: the target itself with a lead, not 2000 out | aim distance 1076 / 1359 / 1697 (quartiles), 14 % at full range (n = 166); lead 0.42 of the last move (median), 43 % of the aim lines within 60 of position + last move |
| After a hit the near units go in and dash | units within 1640 of the held prey: 89-98 % head at it, 79-82 % dash when ready (n = 146, dash cases weak); the prey is caught on the next turn 35 %, within four turns 70 % (n = 150) |
| No second hunter is waiting | nearest free team mate 4,235 from the target (median) |

### Smoke and decoys
| Rule | Evidence |
|---|---|
| Smoke goes with a dash away from (or past) a predator under 2000 | on a turn with a dash 69 / 75 / 80 / 61 % under 800 / 1200 / 1600 / 2000 while smoke is left (n = 229); walking 7-12 %; 69 % of the smokes after turn 1 are on a dash turn |
| Geometry as on turn 1 | at the predator (9 deg off), 1300 / 1511 / 1798 from the unit, centre 398 from the predator (n = 226) |
| Inside its own cloud the unit keeps going outward | standing 9 %, heading out 58 %, 33 % still inside two turns after a turn-1 smoke |
| Decoys come late: 0.05 / 0.55 / 2.95 per game | assumed: the decoy replaces the smoke once the smoke is used up (smokes 2.33 / 1.27 / 0.82) |
| Decoy geometry | target 2400 from the unit for 390 of 391, 86 degrees off the unit's own order for 360 of 360; no link with the predator's direction (55 / 92 / 121 deg, quartiles) |

### Held units, ghosts
| Rule | Evidence |
|---|---|
| A held unit does little | first held turn: net 10 %, smoke 4 %, decoy 3 % (n = 243); caught within four turns 34 % (Les Gens Bons 45 %, FullStuck 52 %) |
| Team mates do not come | nearest mate moves toward it 42 % (as often as by chance); a mate nets a predator within a turn 8 % (n = 87) |
| Ghosts walk, never dash, mostly after prey | 36 % of ghost orders end within 1000 of a living prey, 11 % of a predator, 21 % of a team mate; 13 % of ghost turns have no order (n = 17,784) |

## 4. Rule book of Les Gens Bons (agent 6894245, 200 games)

Results: 56 % wins, mean rank 1.61, 3.38 catches, 2.72 losses, 1.05 catches by turn 10, 0.80 units lost by turn 10.

### Opening
| Rule | Evidence |
|---|---|
| **Nets from turn 1** | 2.65 nets per game in turns 1-5, median net turn 3. Turn 1 with nets left: prey start under 2000 and no predator near: net 72 % (n = 173); by the distance after its own move: 85 / 75 / 65 / 69 / 42 / 29 % at 0-600 / 1000 / 1300 / 1600 / 2000 / 2300 |
| It reacts to what is in sight, about 2600 on turn 1 | decoy 78-81 % with a predator start at 800-2000, 17 % at 2000-2300, 0 % beyond (n = 480); 14 % of the units whose prey starts beyond 2000 still net on turn 1 (n = 418) |
| Predator in sight: decoy, and dash for about two thirds | prey far, predator under 2000: decoy 69 %, dash 60 % (n = 180); dash 66 / 53 / 50 / 33 / 20 % by predator start band; the flat share has no distance behind it (not recoverable) |
| **No smoke on turn 1** | 0 of 908 units |
| Nobody near: walk, toward the nearest prey | nothing 84 %, dash 18 % (n = 418); 55-61 % head at the nearest prey |

### Movement
| Rule | Evidence |
|---|---|
| Flee from a predator under 2000 | away 78 / 79 / 72 / 65 % under 800 / 1200 / 1600 / 2000, 44 % at 2000-2600, 27 % beyond 3500 (n = 15,000) |
| A prey under 1600 beats the predator | at the prey 59-72 % with prey under 1600 whatever the predator distance (n = 2,900) |
| Target = nearest prey, no sharing | 85 % (n = 9,604); one hunter on 84 % of the hunted prey-turns, two on 15 % |
| Aim at the prey's position, no lead | 15 deg off the position, 17 off position + move (n = 6,850) |
| Fleeing leans to the side | 31 deg off straight away (median), 42 near the wall |
| Idle units often stand | 19 % stand with nobody within 2500, 30 % beyond radius 5500 |
| Order target: the end point of the step | MOVE at 550-650 for 89 % of 33,249, DASH at 1200 for 99 % of 3,602 |

### Dashes
| Situation | Dash share when ready |
|---|---|
| Prey at 600-1600, no predator near | 52-58 % at prey without dash, 39 % at prey with dash, 63-68 % at held prey (n = 1,600); 20 % at 1600-2200 |
| Predator near | 39 / 33 / 20 / 12 % under 800 / 1200 / 1600 / 2000, the same whether it can dash or not; 71 / 68 / 43 % for units that send a decoy on that turn (they have it in sight; n = 219) |
| Travel | 41 % of the units with no dash made and prey at 1600-3000, 9-14 % afterwards |
| Fatigue | no limit: 37-43 % under a predator at any number of dashes made |

### Nets
| Rule | Evidence |
|---|---|
| At free prey as soon as its own move ends near it | while nets are left: 61 / 47 / 21 / 14 / 6 % at 0-600 / 1000 / 1300 / 1600 / 1900; after a dash of its own 81 / 75 / 42 %; never at held prey (2-9 %) |
| Dash and net in one turn | the thrower dashed on 37-66 % of the net turns |
| Aim at the prey's position, 2000 out along the line | lead 0.00 (median over 409 nets); aim point at full range for 654 of 654 |
| Few nets at predators (10 %), by held units | a held unit at a predator without dash at 800-1200: 34 % (n = 29, weak); free units 1-6 % |
| After a hit | units within 1640: 70 % head at it, 59-69 % dash; caught next turn 32 %, within four turns 68 % (n = 394) |

### Smoke, decoys, held units, ghosts
| Rule | Evidence |
|---|---|
| Decoy when fleeing with the predator in sight under 2000 | 68-87 % of the units that dash on that turn, 11-38 % of those that walk, 0-4 % beyond 2000 (n = 1,400); again while its last decoy is alive (40-66 %) |
| Decoy geometry | 59 degrees off the line "straight away from the predator", 3957 long (along 2040, across 3391) for 75 % of 869; on the side the unit does not take (95 % of 595) |
| **Smoke only when the dash is on cooldown**, on itself | 0 smokes on 2,519 threatened unit-turns with the dash ready, 19-25 % on cooldown; cloud centre on the unit for 540 of 540; never on a dash turn |
| Stays in its cloud | inside 1, 2 and 3 turns later: 100 %; standing 7 % |
| Held unit | per held turn with a predator under 2300: decoy 46-51 %, smoke 8-22 %, net 12-16 % |
| Ghosts follow prey, never dash | 43 % of orders within 1000 of a living prey, 4 % of a predator; 9 % of ghost turns without order |

## 5. Rule book of FullStuck (agent 6893977, 264 games)

Results: 45.5 % wins, mean rank 1.75, 3.44 catches, 3.02 losses, 0.89 catches by turn 10, 0.98 units lost by turn 10.

| Topic | Rule | Evidence |
|---|---|---|
| Turn 1, prey | dash straight at a prey start under 1600 (known through the symmetry) | dash 86 / 96 % under 1000 / 1600 with the predator far (n = 111), 27 % at 1600-2200, 0 % beyond (n = 475) |
| Turn 1, predator | decoy when it is in sight under 2000; dash and smoke only when it is close | decoy 54 / 84 / 54 % at 800-1200 / 1600 / 2000; dash 64 % under 1500, 34 % at 1500-2000; smoke 28 % under 1500, 3 % beyond |
| Flee | from about 1800; dash only from a predator that can dash | away 68-82 % under 800, 39-50 % at 1600-2000; dash 70 / 49 / 9 % under 800 / 1200 / 1600 from a predator with dash, 17 / 9 / 10 % from one without (n = 6,200) |
| **Smoke with the flee dash**, where the dash ends | on a dash turn 85 / 76 / 49 / 22 % under 800 / 1200 / 1600 / 2000 (n = 866); 78-100 % of the smokes on a dash turn; centre on the unit for 859 of 859 |
| Decoy | one alive per unit; 60 degrees off straight away, 3000 long, on the side the unit does not take | 4-7 % with its own decoy alive against 21-36 % without (n = 4,600); along 1500, across 2598 for 1,115 of 1,115; other side 93 % of 966 |
| Attack | prey under 1600 beats the predator; dash at it | at the prey 53-66 % with a predator under 1200; dash 42-54 % at 1000-1600 |
| Nets | later and fewer; lead 0.4; 2000 out | median net turn 12; 14-20 % per unit-turn under 1000, 22 / 38 / 15 % after a dash; lead 0.39 (median, 604 nets); held units net a prey beside them (34-38 % under 600) |
| Nets at predators | 7 %, by held units | held, predator with dash at 800-1200: 19 % (n = 58) |
| Held unit | decoy 18-20 % per turn (predator at 1000-2300), no smoke | n = 324 |
| Ghosts | sit on prey; no order when nothing is known | 63 % of orders within 1000 of a living prey; 39 % of ghost turns without order (n = 52,700) |
| Order target | often a far point | MOVE target beyond 1250 for 31 %, DASH beyond 1250 for 34 % (the mimic orders the end point of the step: same movement except where a tree is touched) |

## 6. What cannot be recovered, and the assumption made

| Unknown | Assumption in the mimics |
|---|---|
| What a squad saw (trees, clouds) | rules are applied to what the mimic sees; `F_SYM_...` and `P_T1_SIGHT` say when the symmetry is used |
| Why only about two thirds of Les Gens Bons' threatened units dash on turn 1 | `P_T1_DASH_SHARE = 0.65`: a fixed share of units, chosen by start position |
| The gate behind ATI's and FullStuck's low net rates | a pause between two nets (`P_NET_EVERY` 6 and 5, `P_NETP_EVERY` 4), fitted on the median net turn |
| Why ATI's decoys come late | `F_DECOY_NEEDS_NO_SMOKE`: decoy only when no smoke is left |
| The side of ATI's decoy (86 degrees left or right of the move) | the side nearer to the centre (measured: 51 %, a coin) |
| How long a predator out of sight is feared, how long a prey position is remembered | v10's values: 3 and 25 turns |
| Where idle units go | v10's search map (least recently seen ground) |
| Steering around trees, hiding behind them | v10's steering; no hiding |
| Why fleeing units run 31 degrees off the straight line | a pull toward the nearest known prey (`P_FLEE_PREY_W`), fitted |
| The power pools | see section 8 |

## 7. Leader mimic handed over for replay tests (15:32 IST)

`versions/vmimic.java` (ATI x iHot): compiles alone with JDK 21, class `Player`, 47,975 characters.

**Rules of the leader that are in the file**
- Turn 1: dash and smoke for every unit with a predator start under 2600 (known through the symmetry); the smoke
  goes at the predator, at most 1800 out; the dash goes away only when the predator is under 1500, else at prey.
- Turn 1 without a predator near: dash at a prey up to 2800; again on turn 3 (travel dash while at most one dash made).
- A prey in sight under 1600 is attacked whatever the predator distance; dash at it under 1700.
- Flee from a predator under 2200; dash away under 1700; smoke at the predator on that dash.
- Nets: none on turn 1, none on a turn the unit dashes; at prey when the move ends within 1600 (prey without dash)
  or 1100 (prey with dash); aimed at position + last move, 400 beyond, not 2000 out; from turn 2 at predators
  within 1300 (with dash) or 1600 (without).
- Decoy: 2400 out, 86 degrees off the unit's own move, only once the smoke is used up.
- Held units do nothing special; ghosts walk onto the nearest living prey; orders are the end point of the step.

**Still v10's** (not recoverable from logs, or not measured well enough): input parsing, enemy tracking, movement
model and tree steering; the hard rule that a move never ends where a predator can touch the unit; the catch test
(`catchReward`); the search map for units with nothing in sight; 3 turns of predator memory and 25 of prey memory;
the dash when no walk is safe. Fitted, not recovered: the three-turn pause between two nets at prey, the pull
toward prey while fleeing, the side of the decoy.
**Not in**: "net with a hunter 771 away" from the morning study: the current agent's nearest free team mate is
4,235 from the target (median, n = 156).

**Checks** (`tools/mimic_check.py` on the logs): 120 games against v10 and v5, 10,833 turns answered, 0 crashes,
0 games cut short, 0 DASH during cooldown, 0 powers beyond the pool, 0 orders for a unit of another team, 0
malformed orders. Turn time with one game at a time on the shared machine: mean 1.2 to 2.0 ms, worst later turn 8
to 30 ms, first turn 240 to 504 ms (JVM start included; limit 1000).

**Local table** (120 games, one map per game, every seat order of vmimic / v10 / v5):

| Version | Games | Mean rank | Wins | Last | Catches | Lost | Catches by turn 10 | by turn 20 |
|---|---|---|---|---|---|---|---|---|
| vmimic | 120 | 2.000 | 32.5 % | 32.5 % | 2.64 | 3.18 | 0.49 | 0.96 |
| v10 | 120 | 1.858 | 42.5 % | 28.3 % | 2.97 | 2.58 | 0.64 | 1.36 |
| v5 | 120 | 2.133 | 25.0 % | 38.3 % | 2.69 | 2.55 | 0.49 | 0.98 |

Catches per game, hunter on prey: vmimic on v10 2.78, vmimic on v5 2.50, v10 on vmimic 3.33, v10 on v5 2.60,
v5 on vmimic 3.02, v5 on v10 2.37. **Warning: local results did not transfer to real Gold teams for one candidate
today.** Locally the mimic is level with v10 on rank and loses more units; the real squad wins 54.5 % in Gold.

**Fingerprint, real squad against mimic** (tolerance: shares within 10 points, counts per game and distances
within 25 %; 40 of 50 lines inside):

| Line | ATI x iHot (110 games) | vmimic (120 games) | |
|---|---|---|---|
| win share (context, not matched) | 54.5 (110) | 32.5 (120) |  |
| mean rank (context, not matched) | 1.6 (110) | 2.0 (120) |  |
| t1 dash, predator start under 1500 | 92% (77) | 93% (89) | inside |
| t1 smoke, predator start under 1500 | 80% (77) | 89% (89) | inside |
| t1 dash, predator start 1500-2000 | 97% (64) | 92% (53) | inside |
| t1 smoke, predator start 1500-2000 | 89% (64) | 92% (53) | inside |
| t1 dash, predator start 2000-2500 | 91% (66) | 94% (73) | inside |
| t1 smoke, predator start 2000-2500 | 86% (66) | 90% (73) | inside |
| t1 dash, predator start 2500-3500 | 68% (105) | 66% (86) | inside |
| t1 smoke, predator start 2500-3500 | 12% (105) | 19% (86) | inside |
| t1 dash, predator start over 3500 | 46% (181) | 42% (197) | inside |
| t1 smoke, predator start over 3500 | 0% (181) | 0% (197) | inside |
| t1 dash, all units | 70% (496) | 62% (544) | inside |
| t1 predator start under 2000: order within 60 deg of straight away | 54% (141) | 45% (142) | inside |
| t1 predator start over 3500: order within 60 deg of nearest prey | 80% (181) | 86% (197) | inside |
| t1 net, prey start under 2000 | 0% (146) | 0% (147) | inside |
| nets per game, t1-5 | 0.9 (110) | 0.51 (120) | **outside** |
| nets per game, t6-20 | 1.42 (110) | 1.14 (120) | inside |
| nets per game, t21-100 | 1.81 (110) | 1.95 (120) | inside |
| smokes per game, t1-5 | 2.33 (110) | 2.13 (120) | inside |
| smokes per game, t6-20 | 1.27 (110) | 1.25 (120) | inside |
| smokes per game, t21-100 | 0.82 (110) | 0.82 (120) | inside |
| decoys per game, t1-5 | 0.05 (110) | 0.07 (120) | inside |
| decoys per game, t6-20 | 0.55 (110) | 0.78 (120) | **outside** |
| decoys per game, t21-100 | 2.95 (110) | 2.37 (120) | inside |
| dashes per game, t1-5 | 5.49 (110) | 5.47 (120) | inside |
| dashes per game, t6-20 | 5.65 (110) | 5.83 (120) | inside |
| dashes per game, t21-100 | 12.93 (110) | 10.53 (120) | inside |
| ghost dashes per game, t1-5 | 0.0 (110) | 0.0 (120) | inside |
| ghost dashes per game, t6-20 | 0.0 (110) | 0.0 (120) | inside |
| ghost dashes per game, t21-100 | 0.0 (110) | 0.0 (120) | inside |
| median net turn | 17 (454) | 24 (432) | **outside** |
| nets at predators | 36% (454) | 19% (432) | **outside** |
| nets that hit an enemy unit | 64% (454) | 61% (432) | inside |
| net at prey: target could dash | 36% (231) | 64% (265) | **outside** |
| net at predator: target could dash | 39% (165) | 51% (84) | **outside** |
| net at prey: thrower to target (median) | 984 (231) | 797 (265) | inside |
| net at prey: nearest team mate to target (median) | 3848 (222) | 3022 (227) | inside |
| net at predator: thrower to target (median) | 841 (165) | 1070 (84) | **outside** |
| catches on held prey | 28% (397) | 34% (317) | inside |
| catches with a dash | 35% (397) | 29% (317) | inside |
| lost units that were held | 29% (307) | 36% (381) | inside |
| catches per game | 3.61 (110) | 2.64 (120) | **outside** |
| catches by turn 10 per game | 0.89 (110) | 0.49 (120) | **outside** |
| catches by turn 20 per game | 1.5 (110) | 0.96 (120) | **outside** |
| units lost per game | 2.79 (110) | 3.17 (120) | inside |
| units lost by turn 10 per game | 0.41 (110) | 0.52 (120) | inside |
| ghost order within 1000 of a living prey | 36% (15505) | 41% (19462) | inside |
| ghost order within 1000 of a living predator | 11% (15505) | 6% (19462) | inside |
| ghost order within 1000 of a living team mate | 21% (15505) | 19% (19462) | inside |
| ghost order near nobody | 49% (15505) | 45% (19462) | inside |
| ghost: no order | 13% (17784) | 19% (23983) | inside |

lines compared: 50, inside the tolerance: 40, outside: 10

Lines outside, and why:
- Catches per game and by turn 10 / 20: the local opponents (v10, v5) flee better and are caught later than the
  Gold field; v10 itself makes 0.64 catches by turn 10 in these games.
- Net at prey / predator "target could dash": v10 and v5 keep their dash (v10 dashes 13 times a game), so most
  targets can dash. An opponent effect.
- Nets in turns 1-5, median net turn, share at predators: the real gate behind its nets is not recovered; the
  mimic nets later and less at predators.
- Decoys in turns 6-20: follows from "decoy once the smoke is gone" (an assumption).

## 8. The local referee and what it distorts

`sim/SimLog.java` is `Sim.java` plus a game log in CodinGame's JSON shape. Pools: the sum over the units of a random
0, 1 or 2 per kind (fits the largest number of nets / smokes / decoys used by a team in 564 Gold games: 0 to 2N,
mean N); `Sim.java` uses 2 to 5. `-Dspread=1` gives a new map per game, `-Donly=name` keeps the games with one
version. Distorted lines: everything that depends on the opponents (early catches and losses, dash state of net
targets), on the maps (trees are placed by our generator: sight on turn 1), and on its collision steps.

## 9. vmimic2 and vmimic3: state

Same engine, rule books of Les Gens Bons and FullStuck. After the second joint run (60 games each, before the last
three rounds of engine fixes): 32 and 37 of 50 lines inside. Not re-measured since; no 240-game table yet.

## 10. Leader mimic against our versions (240 local games, one thread)

Pool: vmimic (15:33 copy), v10, v5, v1 and the newest candidate vres; every ordered triple (all seat orders) on 4
shared maps, 144 games per version. **Only four maps: the two halves of the run disagree (vmimic 2.21 on the first
two maps, 1.79 on the last two), so differences under 0.2 of mean rank mean nothing here.**

| Version | Games | Mean rank | Wins | Last | Catches | Lost | Catches by turn 10 | by turn 20 |
|---|---|---|---|---|---|---|---|---|
| vmimic | 144 | 2.000 | 34.0 % | 34.0 % | 2.88 | 3.02 | 0.40 | 0.97 |
| v10 | 144 | 1.826 | 38.9 % | 21.5 % | 3.04 | 2.55 | 0.71 | 1.25 |
| v5 | 144 | 2.069 | 29.2 % | 36.1 % | 2.60 | 2.70 | 0.54 | 1.15 |
| v1 | 144 | 2.097 | 33.3 % | 43.1 % | 2.77 | 3.20 | 0.54 | 1.03 |
| vres | 144 | 2.000 | 31.3 % | 31.3 % | 2.72 | 2.54 | 0.67 | 1.11 |

Catches per game, hunter (row) on prey (column):

| | vmimic | v10 | v5 | v1 | vres |
|---|---|---|---|---|---|
| vmimic | | 2.62 | 3.20 | 3.20 | 2.53 |
| v10 | 3.03 | | 2.92 | 3.45 | 2.78 |
| v5 | 2.47 | 2.45 | | 3.20 | 2.28 |
| v1 | 3.75 | 2.61 | 2.14 | | 2.59 |
| vres | 2.84 | 2.53 | 2.53 | 2.98 | |

0 crashes, 0 invalid orders (`tools/mimic_check.py`). Reading: locally the mimic is in the middle of our versions;
it catches as much as they do but later (0.40 by turn 10 against 0.54 to 0.71) and loses the most units after v1.
**Local results did not transfer to real Gold teams for one candidate today.**

## 11. For the user's decision

**What happened.** At 15:41 IST the 15:08 copy of the mimic was submitted (submission 41746943, by the analysis
session on the user's instruction to it). It **replaced v10 in the arena** (v10 stood at about 85th of 383, later
134th of 407, rating 19.0) and restarted the ranking games. Only the last submission counts for the final ranking.

**The live copy is not the best copy.** It has a fault found at 15:14: on turn 1 a unit next to a predator throws a
net at the predator instead of its smoke in about 40 % of the cases (smoke 53 % with a predator start under 1500;
the real leader 80 %, and no net at all on turn 1). The file in the repository (`versions/vmimic.java`, commit
aa416a6, md5 3675cf452a21) throws the smoke (89 %), uses v10's catch test for attack moves, and no longer nets on
a dash turn.

| | Live copy (15:08) | Current file (15:33) | v10 |
|---|---|---|---|
| Fingerprint lines inside the tolerance (of 50) | 32 | 40 | |
| Local, against v10 and v5, 120 games each on different maps: mean rank | 2.14 | 2.00 | 1.86 |
| Replay of 20 real Gold battles: mean rank / catches / lost | 1.90 / 3.55 / 3.20 | not replayed | 1.75 / 3.55 / 2.55 |
| Head to head, 120 local games on 20 shared maps (15:50): mean rank / wins / catches / lost | 2.05 / 32.5 % / 2.53 / 2.76 | 1.98 / 36.7 % / 2.60 / 2.81 | 1.96 / 30.8 % / 2.76 / 2.32 |

The head to head puts the current file 0.07 of mean rank ahead of the live copy: inside the noise of 120 games.
The fix is real (fingerprint), its effect on results is not shown.

**What the mimic does differently from v10**: dashes and smokes on turn 1 with every unit that has a predator start
under 2600, the smoke thrown at the predator; dashes more (22 a game locally, v10 13.8 in the arena); attacks a prey under 1600
even with a predator near; keeps its nets for later and aims them at the target, not 2000 out; sends decoys
sideways, late.

**Risks.**
- On the only real-opponent evidence (20 replayed battles, live copy) the mimic is level to slightly worse than
  v10 and loses more units (3.20 against 2.55). Nothing shows it is better than v10.
- It imitates what the leader does on average, not when it decides to do it (40 of 50 measures; its catches are
  below the real squad's in every local run).
- A further submission (the current file, or v10 again) restarts the ranking games once more and needs about 40
  minutes; the testing session gives about 17:15 IST as the last sensible moment today.
- Turn time is not a risk (worst 15 ms in the replays, limit 50).

**Options**: (a) leave the live copy; (b) resubmit the current file, best after a 20-battle replay of it;
(c) resubmit v10 if the mimic's rating ends below 19.0. The evidence so far favours (c) over (a); (b) is
untested against real opponents.

## 12. Still to do

- Replay of the current file on real Gold battles (testing session).
- Final fingerprints and 240-game tables of vmimic2 and vmimic3.
- Candidate switches for v10 from the leader: dash and smoke at the predator on turn 1 for every unit with a
  predator start under 2600; smoke thrown at the predator (at most 1800 out) with the flee dash instead of on
  ourselves; no net on a dash turn and none on turn 1, aimed at position + last move and 400 beyond instead of
  2000 out; dashes spent freely (the real squad: 24 a game, v10: 13.8); a prey under 1600 beats a predator under 1200.
