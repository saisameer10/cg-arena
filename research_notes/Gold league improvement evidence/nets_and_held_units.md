# Nets and held (netted) units in Gold: what the local logs show

Status: complete (sections 1 to 5, ranked list in section 6). Local Gold logs only; nothing was built, run against the API or tested.

Data and method (applies to every table unless stated otherwise):
- **All-team Gold logs, 2,176 games** = 768 games of today's top Gold teams (`E:/cg-tmp/tcf/goldtop/utg/games`, "top set") + 1,408 Gold games of yesterday (`E:/cg-tmp/cgskill/utg/games`, "old set"). No game is in both. 3 teams per game = 6,528 team-games. Every table was computed on both sets; the two columns agree within a few points unless noted.
- The top set was being extended by another session while this ran: sections 1 to 3 rest on the 768 + 1,408 games above; section 4 on 2,300 and 2,497 games; section 5 on 2,354 games. Each section states its count. The percentages of tables computed twice moved by one point at most.
- Positions are reconstructed by `prep/try-catch-forest/research/lib/parse.js` (exact where the referee prints them: net, smoke, decoy, dash, catch; simulated from the unit's own orders in between, trees ignored). Measured drift at the next exact position: median 1 to 3 units, 90th percentile 250 to 470. Distances in the tables are therefore good to about +-300 in nine cases of ten.
- Responses are read from the **orders** (`stdout`), not from the referee text, so that a unit caught on the same turn (its power never fires) is not silently dropped.
- "t" = the turn on which the net hits. A net resolves after the catches of turn t; the unit cannot move on t+1..t+4. "Caught within 5 turns" = caught on t+1..t+5.
- A response ordered on t+1 fires after the moves and catches of t+1, so it cannot prevent a catch on t+1. The fair comparison of first responses is therefore "units still alive after t+1, caught on t+2..t+5". Both are given.
- Samples under 30 are marked weak. Nothing here is a controlled test: these are comparisons inside observed play, and the team that chooses a response differs from the team that does not. Stratifying by hunter distance removes the largest confound, not all of them.
- Scripts and raw outputs: `E:/cg-tmp/tcf/research_nets/` (`held.js` -> `held.out`, `held2.out`; `flee.js` -> `flee.out`; `aim.js` -> `aim.out`, and `aim.js v2` -> `aim2.out`; `pool.js` -> `pool.out`; `ours.js` -> `ours.out`; `decoy.js`; `check.js`; `lib.js`).
- Checks of the data (`check.js`): the dash rule "after the k-th dash no dash for k turns" has 0 violations in 147,481 dashes, so "can dash" in the tables is exact; 127 of 28,186 nets hit a unit of the thrower's own team.

## 1. A unit is netted: what it does next and how that changes the outcome

### Takeaway
The proposed order "net, then decoy, then smoke" is supported for its first step only. A net at the hunter on the very next turn is the only first response that lowers the catch rate (37 % caught on t+2..t+5 against 52 % for no response, n 1,016 and 3,102); a decoy first is the worst response at every hunter distance (68 %, n 385) and smoke after the net has landed is no better than doing nothing while the hunter is within 1,640 (56 to 62 % against 52 to 60 %). Smoke works when it is already there when the net lands (47 % caught against 82 %), not afterwards. The data-supported order is: **net the hunter at once (also on an unsure aim), net again after a miss, smoke only when the nearest hunter is two or more turns away (beyond about 1,640) or no net is left, never a decoy first.**

### Cited Findings

Frequency (2,176 games):
- 8,192 holds by a predator's net = **1.25 per team-game**; 66 % are caught within 5 turns (top set 67 %, old set 65 %). 5,642 holds by a prey's net (their defence) = 0.86 per team-game, 10 % caught within 5 turns. 123 by the own team, 20 %. 1,018 further nets hit a unit that was already held. — [held.out, header and table 0](E:/cg-tmp/tcf/research_nets/held.out)
- 30 % of the units held by a predator are caught on t+1 itself, before any response can act (2,485 of 8,192). 5,707 are alive after t+1 = **0.87 per team-game where the response can matter**. — [held.out, tables 1b, 3b](E:/cg-tmp/tcf/research_nets/held.out)
- By turn of the game: 60 % caught for nets on turns 1 to 3 (2,955), 64 % turns 4 to 10 (1,824), 68 % turns 11 to 30 (2,253), 78 % turn 31 on (1,160). — [held2.out, table 19](E:/cg-tmp/tcf/research_nets/held2.out)

Hunter distance at the moment of netting (nearest free unit of the predator team at the start of t+1; "can arrive" = within 1,040, or within 1,640 with its dash ready):

| Nearest free hunter | Holds | Caught within 5 | Caught on t+1 |
|---|---|---|---|
| can arrive on t+1 | 5,360 (65 %) | 76 % | 46 % |
| can arrive on t+2 | 1,474 (18 %) | 57 % | 2 % |
| farther, within 3,000 | 527 (6 %) | 45 % | 0 % |
| none within 3,000 | 748 (9 %) | 28 % | 0 % |

By plain distance: under 1,040: 79 % (3,947); 1,040 to 1,640: 64 % (2,464); 1,640 to 2,240: 48 % (694); 2,240 to 3,000: 48 % (256); beyond 3,000: 28 % (748). Number of free hunters within 2,000: none 34 % (1,151), one 69 % (5,675), two or more 79 % (1,366). — [held.out, tables 2, 2b, 2c, 13](E:/cg-tmp/tcf/research_nets/held.out)

First response of the held unit on t+1 (the power it orders), all 8,192 holds: none 47 %, net 25 % (at the predator 23 %), smoke 21 %, decoy 7 %.

| First response on t+1 | All holds: n, caught within 5 | Alive after t+1: n, caught on t+2..t+5 |
|---|---|---|
| NET at the predator | 1,884, 66 % | 1,016, **37 %** |
| nothing | 3,874, 61 % | 3,102, 52 % |
| SMOKE | 1,713, 72 % | 1,068, 56 % |
| DECOY | 559, 78 % | 385, **68 %** |
| NET at prey | 111, 51 % | 98, 45 % |

(The left column is misleading on its own: units that order a net are the ones with a hunter next to them, and 46 % of those nets are never thrown because the unit is caught first.) — [held.out, tables 3, 3b](E:/cg-tmp/tcf/research_nets/held.out)

Same comparison inside each distance class, units alive after t+1, caught on t+2..t+5 (n in brackets):

| Nearest free hunter | NET | nothing | SMOKE | DECOY |
|---|---|---|---|---|
| can arrive on t+1 (and did not catch) | **41 %** (726) | 57 % (1,358) | 62 % (634) | 78 % (193) |
| can arrive on t+2 | **37 %** (297) | 60 % (758) | 60 % (278) | 75 % (107) |
| farther, within 3,000 | 41 % (59) | 47 % (375) | **30 %** (57) | 54 % (35) |
| none within 3,000 | **16 %** (63) | 30 % (543) | 21 % (96) | 31 % (45) |

Finer distance (same measure): under 700: NET 44 % (127), nothing 44 % (349), SMOKE 68 % (91). 700 to 1,040: 47 % (353) / 62 % (539) / 64 % (307). 1,040 to 1,340: 36 % (287) / 65 % (449) / 61 % (255). 1,340 to 1,640: 32 % (211) / 63 % (480) / 57 % (220). 1,640 to 2,240: 39 % (77) / 48 % (487) / 40 % (70). 2,240 to 3,000: 48 % (27, weak) / 50 % (187) / 27 % (26, weak). — [held.out, table 4b](E:/cg-tmp/tcf/research_nets/held.out); [held2.out, table 17](E:/cg-tmp/tcf/research_nets/held2.out)

Control for "had no net": restricted to teams that provably still held a net (they threw one on t+1 or later), units alive after t+1: hunter can arrive on t+1: NET 41 % (726), nothing 52 % (809), SMOKE 62 % (261), DECOY 74 % (119). Hunter can arrive on t+2: NET 37 % (297), nothing 53 % (462), SMOKE 60 % (136), DECOY 73 % (70). Teams with no net proven: nothing 65 % (549) and 71 % (296), SMOKE 61 % (373) and 59 % (142), DECOY 84 % (74) and 78 % (37). So even without a net, smoke after the hit gains 4 to 12 points at most and a decoy is worse than nothing. — [held2.out, table 16](E:/cg-tmp/tcf/research_nets/held2.out)

The net of a held unit at its hunter (1,884 ordered on t+1):
- 868 (46 %) are never thrown: the unit is caught on t+1 first. Of the 1,016 thrown, 790 hit a hunter (**78 %**), 198 miss, 28 hit a decoy. — [held.out, table 6](E:/cg-tmp/tcf/research_nets/held.out)
- Caught within 5 turns: hit **32 %** (790), miss 53 % (198), hit a decoy 57 % (28, weak). A miss is no worse than no response at all (52 % for "nothing", alive after t+1). — [held.out, table 6](E:/cg-tmp/tcf/research_nets/held.out)
- Hit rate by hunter distance: under 1,040: 76 % (460); 1,040 to 1,640: 83 % (433); 1,640 to 2,240: 70 % (50); beyond: 58 to 67 % (66). Hunter's dash on cooldown 83 % (632), dash ready 69 % (377). The hunter walks straight at a unit that cannot move, so the aim is rarely unsure. — [held.out, tables 6c, 6d](E:/cg-tmp/tcf/research_nets/held.out)
- Number of hunters: with one free hunter within 2,000, NET 32 % against nothing 58 % (839 and 1,919). With two or more, NET 73 % against nothing 50 % (205 and 349): one net does not stop the second hunter. — [held2.out, table 17b](E:/cg-tmp/tcf/research_nets/held2.out)

Smoke: before the net or after it
- Unit already inside a cloud (any team's, thrown on t or in the 8 turns before) when the net lands: hunter can arrive on t+1: **47 % caught within 5 (949) against 82 % in the open (4,411)**; hunter can arrive on t+2: 24 % (197) against 62 % (1,277); farther within 3,000: 27 % (52) against 47 % (475). — [held2.out, table 15b](E:/cg-tmp/tcf/research_nets/held2.out)
- The unit itself ordered SMOKE on the netting turn (it lands together with the net): hunter can arrive on t+1: 49 % (732) against 82 % for no power that turn (3,288); t+2: 28 % (107) against 62 % (999). — [held2.out, table 15](E:/cg-tmp/tcf/research_nets/held2.out)
- Smoke ordered one turn later (t+1), units alive after t+1: 62 % against 57 % for nothing (hunter can arrive on t+1), 60 % against 60 % (t+2). It only gains when the hunter is farther: 30 % against 47 % (57 and 375), 21 % against 30 % (96 and 543). — [held.out, table 4b](E:/cg-tmp/tcf/research_nets/held.out)
- Where the late cloud is put: on the unit 80 % (129), shifted towards the hunter 62 % (258), shifted away from the hunter 74 % (1,323). — [held.out, table 7b](E:/cg-tmp/tcf/research_nets/held.out)

Decoy by a held unit (559 on t+1): towards the hunter 64 % caught within 5 (69), sideways 82 % (233), away 80 % (252). — [held.out, table 7c](E:/cg-tmp/tcf/research_nets/held.out)

Order of responses
- Response on t+1 then on t+2, units alive after t+1, caught on t+2..t+5: "NET then nothing" 24 % (583), "NET then SMOKE" 46 % (186), "NET then DECOY" 53 % (80), "NET then NET" 58 % (302), "SMOKE then nothing" 58 % (957), "SMOKE then SMOKE" 39 % (83), "DECOY then nothing" 54 % (118), "DECOY then DECOY" 62 % (113), "DECOY then NET" 83 % (75), "DECOY then SMOKE" 85 % (79), "nothing then nothing" 47 % (2,448), "nothing then NET" 67 % (311), "nothing then SMOKE" 72 % (256). — [held.out, table 9b](E:/cg-tmp/tcf/research_nets/held.out)
- Split by the result of the first net (alive after t+2, caught on t+3..t+5): after a **hit**: nothing more 15 % (432), SMOKE 30 % (89), NET again 34 % (117), DECOY 37 % (46). After a **miss**: NET again 20 % (41), SMOKE 26 % (34), nothing 34 % (64), DECOY 40 % (10, weak). — [held2.out, table 18](E:/cg-tmp/tcf/research_nets/held2.out)
- The exact sequence the user proposed, "NET, DECOY, SMOKE" on t+1, t+2, t+3: 19 cases alive after t+2, 42 % caught on t+3..t+5 (weak). "NET, nothing, nothing": 13 % (464). "NET, SMOKE, nothing": 30 % (113). "SMOKE, nothing, nothing": 34 % (600). "nothing x3": 27 % (1,623). "DECOY, nothing, nothing": 33 % (66). — [held.out, table 9c](E:/cg-tmp/tcf/research_nets/held.out)
- Delay costs: a first net on t+2 instead of t+1 ("nothing then NET") ends in 67 % caught (311) against 37 % for a net on t+1. — [held.out, tables 3b, 9b](E:/cg-tmp/tcf/research_nets/held.out)

Teams (40 or more holds by a predator): the best at keeping held units are The PDAIs 44 % caught (122 holds; first response net 25 %, smoke 16 %, decoy 0 %), ClaudeReviewers 48 % (139; 22 / 42 / 5 %), Lore 53 % (104; 39 / 0 / 0 %); typical is 59 to 69 %; the worst are FullStuck 84 % (218; net 41 %, smoke 0 %) and - Team Rocket - 85 % (103). Les Gens Bons, the heaviest decoy user (28 % of first responses), loses 71 % (365). No first-response profile separates the best from the worst: the differences between teams come mostly from where their units stand when netted. — [held.out, per-team table](E:/cg-tmp/tcf/research_nets/held.out)

Our own bot (v10, 39 replayed Gold battles with the debug build, `gold/r10` + `gold/g10`; exact positions of what we saw and the exact pool; every cell is weak):
- 54 of our units were held by a predator's net (1.38 per game), 61 % caught within 5 turns; 40 were held by a prey's net, 3 % caught. — [ours.out, v10 tables H0, H1](E:/cg-tmp/tcf/research_nets/ours.out)
- With a free hunter in sight that could arrive on t+1: 18 holds, 18 caught (the field: 76 %). Could arrive on t+2: 17, 41 %. In sight but farther: 9, 44 %. No free hunter in sight: 10, 40 %. — [ours.out, v10 table H2](E:/cg-tmp/tcf/research_nets/ours.out)
- First response: net 13 (11 thrown, **11 hit**, 2 of the 11 caught = 18 %), nothing 33 (67 % caught), smoke 8 (7 caught), decoy 0. Of the 33 "nothing", 12 had an empty pool (12 caught), 6 had only decoys (4 caught) and **15 still had a net** (6 caught): 9 of those had no free hunter in sight (4 caught on t+2..t+5) and 4 had one farther than two turns (0 caught). — [ours.out, v10 tables H3, H5, H5b, H8](E:/cg-tmp/tcf/research_nets/ours.out)
- On the netting turn itself our unit had ordered smoke in 6 of the 54 holds (2 caught), a net in 5 (0 caught), nothing in 41 (76 % caught). — [ours.out, v10 table H7](E:/cg-tmp/tcf/research_nets/ours.out)
- The turn on which our unit was netted (54 holds): we had the thrower in sight at the start of that turn in 47 (28 within 1,500, 19 farther) and the unit was in FLEE mode in 48. **In 21 of the 54 the smoke pool was already empty: 19 of those units were caught (90 %). With smoke left: 14 of 33 (42 %).** With smoke left and the thrower in sight the unit still used no power on that turn in 15 cases (8 caught); it smoked in 6 (2 caught) and netted in 5 (0 caught). — [ours.out, v10 tables H9, H9b, H9c](E:/cg-tmp/tcf/research_nets/ours.out)
- So v10 already nets the hunter it can see (and hits), never sends a decoy first, and loses its held units in two places the field data also names: the net arrives when the hunter is already one move away (18 of 33 losses), and nothing is done when no hunter is in sight (the field: smoke takes 30 % to 21 % there, 543 and 96 cases).

### Inferences
- The coordinator's two local-simulation results agree with the real logs. (a) Decoy before smoke is worse than smoke: 68 % against 56 % caught (385 and 1,068), and in every distance class (78 / 62, 75 / 60, 54 / 30, 31 / 21 %). Real logs go further: the decoy is worse than doing nothing (68 % against 52 %). (b) A net at once without a sure aim: the real hit rate of these nets is 78 %, a miss leaves the unit where "nothing" leaves it (53 % against 52 %), and a hit takes it to 32 %. Expected value of throwing at 78 % hits is about 37 %, the measured figure. Waiting a turn for a better aim measured 67 %.
- Why smoke after the hit does not work inside 1,640: the hunter has already seen the unit with its "held" flag and the unit will not move for four turns, so the cloud hides nothing the hunter needs. A cloud that is there when the net lands hides both the position and the fact that the net hit (82 % -> 47 %).
- Why the decoy does not work: other teams see a decoy as a unit with the same id that is not held, next to one that is; and a decoy does not block a catch. The only decoy direction that is not worse than nothing is straight at the hunter (64 %, 69 cases), where it can still absorb a second net or body-block the view.
- The share caught is driven first by the hunter's distance (79 % under 1,040, 28 % beyond 3,000), second by pre-existing smoke, third by the net response. No response on t+1 saves the 30 % caught on t+1.
- With two hunters close, a single net is not enough (73 % caught). The data cannot say what is: smoke is at 61 % (131) there, nothing at 50 % (349), all poor.

### Gaps
- The pools of the other teams are not in the logs, so "did nothing" mixes "chose nothing" with "had nothing". The control used (the team threw a net later) proves availability for a subset only.
- Whether the hunter had a clear line (trees) is not known: tree positions are not in the all-team logs.
- The sequence "NET, DECOY, SMOKE" itself occurs 19 times only; its parts are measured, the whole is not.
- Responses are chosen by different bots in different positions. The stratified tables remove the hunter-distance confound; a local A/B test on replays remains the proof.

## 2. Rescue by team mates

### Takeaway
Team mates almost never help (95 % of holds: no mate acts on t+1) and in 69 % of the holds no mate is within 2,500. When a mate does net the hunter and hits, the held unit is caught 47 % of the time against 62 % (45 against 2,145 cases with a mate within 2,500): a real but small and rare gain, about 0.39 chances per team-game.

### Cited Findings
- Mates on t+1, all 8,192 holds, caught within 5 turns: nothing 66 % (7,804); a mate nets a hunter and hits 46 % (52); nets at the hunter and misses 78 % (18, weak); smokes over the held unit 60 % (87); sends a decoy from within 2,000 61 % (231). — [held.out, table 10](E:/cg-tmp/tcf/research_nets/held.out)
- Units alive after t+1, caught on t+2..t+5: nothing 51 % (5,428); mate's net hits a hunter **38 %** (45); mate's smoke 39 % (57); mate's decoy 45 % (166); mate's net misses 64 % (11, weak). — [held.out, table 10b](E:/cg-tmp/tcf/research_nets/held.out)
- A living mate within 2,500 of the held unit exists in 2,519 of 8,192 holds (31 %, **0.39 per team-game**); those are caught 62 %, against 67 % with mates farther away (5,491) and 77 % with no living mate (182). With a mate within 2,500: mate nets a hunter (hit) 47 % (45), smoke 61 % (82), decoy 61 % (231), nothing 62 % (2,145). Mates act in 374 of 2,519 (15 %). — [held.out, tables 10e, 10f](E:/cg-tmp/tcf/research_nets/held.out)
- Hunter can arrive on t+1: a mate's smoke does nothing (78 % against 76 %, 51 and 5,122); a mate's decoy 71 % (153). Hunter can arrive on t+2: mate's decoy 45 % (47) against 58 % (1,393); mate's net hit 38 % (13, weak). — [held.out, table 10c](E:/cg-tmp/tcf/research_nets/held.out)
- Counting any time within t+1..t+3 (the earlier W6 table; biased, because a unit must live long enough to be rescued): hunter netted by the team 35 % (921), hunter netted and smoke 33 % (177), smoke only 55 % (1,492), neither 75 % (5,602). — [held.out, table 14](E:/cg-tmp/tcf/research_nets/held.out)

### Inferences
- The only rescue with a measurable effect is a net that hits the hunter (38 % against 51 %, weak-to-moderate: 45 cases). It is the same mechanism as the held unit's own net, and the held unit is usually the better thrower: it is always in range of its hunter, the mate rarely is.
- v12's "rescue net without a sure aim" could not gain much: the situation (mate within 2,500, unit alive after t+1) occurs about 0.3 times per team-game and the measured difference is 13 points, i.e. about 0.04 units per game at best.

### Gaps
- Mate actions are too rare for a table by hunter distance (most cells under 30).
- Whether the mate had a net left and a clear line is unknown.

## 3. "Net the hunter before fleeing" (hypothesis B5)

### Takeaway
Not supported. A free unit with a free predator inside 1,500 is caught within 5 turns 26 % of the time when it nets that predator and 24 % when it uses no power (2,249 and 39,150 onsets); a hit takes it to 19 %, a miss to 28 %, and the unit is itself netted far more often (32 % against 7 %). The response that goes with the lowest loss is smoke together with a dash (16 %), and the team's catches in the next 10 turns do not differ once the comparison is limited to teams that still hold a net (0.65 for netting the hunter, 0.65 for no power).

### Cited Findings
Situation: a living, free unit with a free unit of its predator team within 1,500 at the start of the turn (positions at most 6 turns from an exact one). 155,591 unit-turns = 23.8 per team-game. **Onsets** (the predator was not within 1,500 on the turn before): 53,015 = **8.1 per team-game**, 2.9 per team-game with a net proven left. Outcome: caught on t..t+5. — [flee.out, header](E:/cg-tmp/tcf/research_nets/flee.out)

| Response on the onset turn | n | Caught t..t+5 | Netted by a predator t..t+4 | Team catches t..t+9 |
|---|---|---|---|---|
| no power | 39,150 | 24 % | 7 % | 0.35 |
| NET at the predator | 2,249 | 26 % | 32 % | 0.65 |
| SMOKE | 4,299 | 23 % | 7 % | 0.47 |
| DECOY | 6,527 | 23 % | 17 % | 0.56 |
| NET at prey | 650 | 20 % | 40 % | 0.98 |

With the movement (onsets; caught t..t+5, n): no power + dash 20 % (16,635), no power + walk 26 % (21,983), no power + stay 43 % (532); **SMOKE + dash 16 %** (2,003), SMOKE + walk 29 % (2,256); DECOY + dash 22 % (2,883), DECOY + walk 24 % (3,611); NET at predator + walk 25 % (1,260), NET at predator + dash 26 % (982). Direction without a power: dash away 18 % (10,858), walk away 21 % (13,404), dash sideways 21 % (5,282), walk sideways 27 % (5,699), walk towards 49 % (2,880), dash towards 56 % (495). — [flee.out, tables B, B2, B3](E:/cg-tmp/tcf/research_nets/flee.out)

By distance and the predator's dash (caught t..t+5):

| Predator | NET at predator | no power | SMOKE | DECOY |
|---|---|---|---|---|
| under 1,040, can dash | 34 % (463) | 37 % (4,108) | 27 % (712) | 32 % (834) |
| under 1,040, dash on cooldown | 22 % (524) | 24 % (9,755) | 24 % (1,104) | 25 % (1,120) |
| 1,040 to 1,500, can dash | 29 % (610) | 25 % (12,166) | 24 % (1,378) | 23 % (2,543) |
| 1,040 to 1,500, dash on cooldown | 19 % (652) | 18 % (13,121) | 20 % (1,105) | 19 % (2,030) |

Under 1,040 with the movement: no power + walk 37 % (5,453), no power + dash 22 % (8,245), NET at predator + walk 29 % (448), NET at predator + dash 26 % (537), SMOKE + dash 17 % (993), SMOKE + walk 34 % (809). 1,040 to 1,500: no power + walk 23 % (16,530), no power + dash 18 % (8,390), NET at predator + walk 23 % (812), NET + dash 26 % (445), SMOKE + dash 15 % (1,010). — [flee.out, tables C2, C3](E:/cg-tmp/tcf/research_nets/flee.out)

- Own dash on cooldown (the case where running is weakest): NET at predator 24 % (793), no power 25 % (14,705), SMOKE 31 % (1,819), DECOY 27 % (1,688). — [flee.out, table C4](E:/cg-tmp/tcf/research_nets/flee.out)
- Result of the net at the closing predator: thrown 2,144, **hit 68 %** (1,462). Hit rate: predator dash on cooldown 80 % under 1,040 (501) and 77 % at 1,040 to 1,500 (645); predator can dash 53 % (407) and 59 % (591). Caught t..t+5 after a hit 19 % (1,462), after a miss 28 % (682). — [flee.out, table G and last table](E:/cg-tmp/tcf/research_nets/flee.out)
- Limited to teams that provably still hold a net: NET at predator 25 % caught, 0.65 team catches in t..t+9 (2,236); no power 28 %, 0.65 (10,422); SMOKE 19 %, 0.73 (1,824); DECOY 25 %, 0.77 (3,573); NET at prey 20 %, 0.98 (649). Under 1,040: NET at predator 27 % (978) against no power 34 % (2,870) and SMOKE 21 % (642). — [flee.out, tables E, E2](E:/cg-tmp/tcf/research_nets/flee.out)
- Predator known to be closing (distance fell by more than 100 over the last turn; 28,326 onsets): NET at predator 23 % (1,409), no power 25 % (21,074), SMOKE 25 % (2,420), DECOY 23 % (3,096); SMOKE + dash 16 % (569), no power + dash 22 % (4,301), NET at predator + walk 23 % (1,061). — [flee.out, tables D, D2](E:/cg-tmp/tcf/research_nets/flee.out)

### Inferences
- Netting the hunter helps a unit that cannot move (section 1: 37 % against 52 %) and does not help one that can: the dash away already brings a free unit to 18 to 22 %, the level a net **hit** reaches (19 %), and a third of these nets miss.
- The one cell where the net is ahead of walking is "predator under 1,040, unit walks": 29 % with a net against 37 % without (448 and 5,453). A dash (22 %) or smoke + dash (17 %) is still better there. If B5 is tried at all, it should be limited to: predator under 1,040, own dash on cooldown, predator's dash on cooldown (hit rate 80 %).
- Units that net a predator are themselves netted in 32 % of the cases (7 % otherwise): being within net range of a predator with a clear line cuts both ways. Smoke is the response that removes that risk (7 %).
- Catches by the team do not rise after a defensive net (0.65 against 0.65 with a net proven left): no evidence that it "buys time to hunt".

### Gaps
- Trees and sight lines are unknown, so "the predator was visible to the unit" is assumed from distance alone.
- "Net proven left" cannot be established for teams that throw their last net on that turn or never again; the no-power row of that table is therefore not the same population as the net row.

## 4. Aim: where the net is pointed and what it hits

### Takeaway
What is aimed at matters three times more than how: a net at a target whose dash is on cooldown hits 65 %, at a held target 73 %, at a target that can dash 35 % (it dashes across or away half the time: 6 % and 22 % hits), and 47 % of all nets go at targets that can dash. For the aim itself the best simple rule is "full range through the position plus **half** the last movement" (76 % on cooldown targets over 105,146 chances, against 69 % for position plus the whole last movement and 60 % for the current position); the literal "position plus last movement" is the worst choice right after the target dashed (30 % real hits against 73 to 75 % with a lead of 300 to 600). Predicting a flight straight away from the hunter does not beat it (72 %). v10's own aim is already at the level of the best rule (64 % against 65 % in the same model); its nets differ from the best throwers' in target choice, not in aim.

### Cited Findings
Data: tables A1 to A9 on 2,300 games (892 + 1,408; the top set was growing): 29,740 nets, 53 % hit an enemy unit; 22,744 nets with an identified target (the enemy unit nearest to the net's line, within 600, whose start position is at most 3 turns from an exact one). Tables A10, A11, the counterfactuals and the lead per team on 2,497 games (1,089 + 1,408, file list frozen in `snapshot_top.txt`): 32,395 nets, 24,698 with a target. "Hit" = that target is in the referee's list of netted units. Distance = thrower after its move to target before its move.

- Target state: can dash 35 % (10,745 nets, 47 % of all), dash on cooldown 65 % (10,853), held 73 % (1,146). Prey: 30 / 61 / 77 % (8,182 / 6,107 / 561). Predators: 52 / 70 / 68 % (2,563 / 4,746 / 585). — [aim.out, tables A1, A1b](E:/cg-tmp/tcf/research_nets/aim.out)
- Distance: dash on cooldown: 67 / 64 / 68 / 68 / 65 % for under 700 / 700-1,000 / 1,000-1,300 / 1,300-1,600 / 1,600-2,000 (1,931 to 2,309 nets each), 41 % beyond 2,000 (811). Can dash: 36 / 33 / 31 / 22 / 45 % and 40 % beyond 2,000 (938 to 3,060 each). Held: 71 to 76 % up to 2,000, 56 % beyond (54). Distance inside 2,000 does not matter for a target without a dash. — [aim.out, table A2](E:/cg-tmp/tcf/research_nets/aim.out)
- What the target does on the turn of the throw (direction relative to the line thrower -> target): a target that can dash: dashes across 6 % hit (3,443), dashes away 22 % (2,079), dashes towards 56 % (1,596), walks across 52 % (1,881), walks away 62 % (1,104), walks towards 84 % (612). Dash on cooldown: walks across 48 % (4,016), away 68 % (3,168), towards 81 % (3,612). — [aim.out, table A3](E:/cg-tmp/tcf/research_nets/aim.out)
- What the thrower can see (the target's last movement): can dash and stood still 25 % (4,884, mostly turn 1), moved across 41 % (2,396), away 40 % (1,488), towards the thrower 49 % (1,977). Dash on cooldown: 63 to 66 % whatever the direction. — [aim.out, table A4](E:/cg-tmp/tcf/research_nets/aim.out)
- Turn: turn 1: 24 % (4,588 nets = 20 % of all); turns 2-3: 57 %; 4-10: 54 %; 11-30: 61 %; 31 on: 67 %. Thrower dashed on the same turn 37 % (6,938), walked or stood 56 % (12,572), was held 64 % (3,234). — [aim.out, tables A7, A8](E:/cg-tmp/tcf/research_nets/aim.out)
- Range style: aimed at full range (1,900+) against aimed at a point near the target: 38 % against 29 % for targets that can dash, 67 % against 64 % on cooldown, 70 % against 79 % held; aimed short of the target 34 / 49 / 41 %. Misses stopped by a tree: 8 to 10 % of the misses. Nets absorbed by a decoy: 1,826 of 22,744 (8 %). — [aim.out, tables A6, A9, V](E:/cg-tmp/tcf/research_nets/aim.out)

Aim rule really used (targets that moved 300 or more across the line on the turn before, so that the rules differ):

| Target | Aim line passes through | Nets | Hit |
|---|---|---|---|
| dash on cooldown, last move a dash | current position | 2,017 | 66 % |
| | position + 0.25 x last movement (300 ahead) | 1,173 | **75 %** |
| | position + 0.5 x last movement (600 ahead) | 1,490 | **73 %** |
| | position + 0.75 x | 238 | 64 % |
| | position + last movement (1,200 ahead) | 867 | **30 %** |
| dash on cooldown, last move a walk | current position | 410 | 64 % |
| | + 0.25 x / + 0.5 x / + 0.75 x | 172 / 366 / 157 | 70 / 72 / 73 % |
| | position + last movement (600 ahead) | 622 | 69 % |
| can dash, last move a walk | current position | 1,032 | 38 % |
| | + 0.5 x | 691 | 41 % |
| | position + last movement | 1,272 | 45 % |
| | + 1.5 x / + 2 x | 134 / 106 | 58 / 66 % |

By lead in distance, dash on cooldown: under 150: 66 % (2,517); about 300: 74 % (1,717); about 600: 72 % (2,193); about 900: 63 % (284); 1,050 or more: 33 % (938). Can dash: 39 % (1,320), 41 % (1,176), 46 % (1,460), 58 % (138), 65 % (106). — [aim2.out, tables A10, A11](E:/cg-tmp/tcf/research_nets/aim2.out)

Counterfactual: the same geometric model (a net hits when the target's end position is within 470 of the net's path; no trees, no blockers; it reproduces the real result of the real aim in 93 % of the nets) applied to **every chance** = a free unit with a unit of its prey team within 2,000 after its own move, 184,994 chances in 2,497 games. Share that the rule would have hit:

| Target state | Chances | Current position, full range | Position + last movement, full range | Position + half the last movement, full range | Last direction x 600, full range | Flight straight away from the nearest hunter, full range | Aimed at the point (current / + last) |
|---|---|---|---|---|---|---|---|
| can dash | 65,297 | 31 % | 40 % | 40 % | 40 % | 37 % | 7 % / 28 % |
| dash on cooldown | 105,146 | 60 % | 69 % | **76 %** | 74 % | 72 % | 8 % / 68 % |
| held | 14,551 | 100 % | 95 % | 99 % | 93 % | 100 % | 100 % / 94 % |

Dash on cooldown by distance, half-lead against whole lead: under 700: 80 / 76 %; 700-1,000: 78 / 72 %; 1,000-1,300: 78 / 70 %; 1,300-1,600: 78 / 69 %; 1,600-2,000: 65 / 54 %. On the nets really thrown (24,698): cooldown targets 76 % (half) / 50 % (whole) / 67 % (current); can dash 37 / 38 / 32 %. Assuming a dash-ready target dashes on in its last direction (lead 1,200) is worse than assuming it walks (35 % against 40 %). — [aim2.out, tables CF1, CF2](E:/cg-tmp/tcf/research_nets/aim2.out)

Teams (150+ nets; hit = any enemy unit):
- Highest hit rates: Lore 76 % (314 nets), JavaPasLaTete 73 % (437), ATI x iHot 70 % (187), Hardcoders 69 % (289), ThePyanist 68 % (1,171), six-seven 65 % (376), J-BCM 65 % (305). Typical 47 to 58 %. Lowest: RemoteException 35 %, BitingBytes 36 %, Dot Matrix 40 %, RoastedTurkishCoffee 40 %. — [aim.out, per-team table](E:/cg-tmp/tcf/research_nets/aim.out)
- What the best share is the target, not the lead. Share of their targets that cannot dash: six-seven 95 %, ATI x iHot 84 %, ThePyanist 80 %, Lore 78 %, JavaPasLaTete 71 %; the field's typical value is 40 to 55 %, the four lowest hitters 35 to 62 %. Their leads differ: JavaPasLaTete aims at the current position (66 % of its nets at moving targets), six-seven about 300 ahead (82 %), J-BCM about 600 ahead (81 %), ATI x iHot 300 to 600 ahead (56 %), Lore and ThePyanist mixed. ATI x iHot is the only one of them that does not aim at full range (12 % of its nets; mean distance 1,134). — [aim.out, per-team table](E:/cg-tmp/tcf/research_nets/aim.out); [aim2.out, per-team lead table](E:/cg-tmp/tcf/research_nets/aim2.out)
- Teams that often aim 1,200 or more ahead (the literal position plus last movement after a dash) are all in the lower half: ThreeLetterAcronym 45 % of such nets (hit rate 55 %), Growth & Intelligence 42 % (45 %), Dot Matrix 38 % (42 %), Feta 37 % (48 %), Bitoven 19 % (47 %), algo-assassins 18 % (44 %), prompt_$$$ 18 % (50 %). — [aim2.out, per-team lead table](E:/cg-tmp/tcf/research_nets/aim2.out)

Our own nets (v10, 39 replayed battles, exact target data from our input; 196 nets, 191 with a visible target near the line):
- Hit the target 57 % (109 of 191). Misses: aim 46, decoy 26, tree 10. All nets that ended in a decoy: 30 of 196 (15 %; the field 8 %); in 21 of the 30 no second entry with that id was in sight when we threw (the decoy was sent on that turn or was hidden), in 9 both were in sight. — [ours.out, v10 tables N0, N5](E:/cg-tmp/tcf/research_nets/ours.out); output of `decoy.js`
- By target: prey that can dash 47 % (74 nets), prey on cooldown 49 % (43), held prey 7 of 7; predator that can dash 61 % (23, weak), predator on cooldown 71 % (42). 51 % of our targets can dash (97 of 191); 60 % of our nets at prey (74 of 124). What a dash-ready target did: dashed 39 % hit (28, weak), walked 57 % (65). — [ours.out, v10 tables N1, N4](E:/cg-tmp/tcf/research_nets/ours.out)
- Same model on our throws: as thrown 64 %, current position 52 %, position + whole last movement 52 %, position + half 65 %, last direction x min(length, 600) 64 %. On cooldown targets whose last move was a dash (50 nets): as thrown 70 %, whole last movement 26 %, half 72 %. So v10 does not use the literal rule and is within one point of the best rule. — [ours.out, v10 counterfactual block](E:/cg-tmp/tcf/research_nets/ours.out)

### Inferences
- The lead should follow what the target can do next turn, not what it did: a unit whose dash is on cooldown can only walk (600), so after a dash "position plus last movement" points 600 too far. Half the last movement is right after a dash (600) and is also slightly better after a walk (300 ahead: the unit turns as often as it goes straight).
- No aim rule rescues a net at a dash-ready target: every rule stays at 31 to 40 % over 65,297 chances. The decision that matters is to throw at a target on cooldown or held, or at a dash-ready one only when it is walking towards the thrower (84 %) or cannot see the thrower.
- "The prey flees straight away from the thrower" is the current-position line at full range (60 % on cooldown targets); "flees from its nearest hunter" 72 %; both below the half-lead (76 %). No evidence that a flight predictor beats a damped continuation.
- v10 loses nothing through its aim rule. Compared with the best throwers it throws at dash-ready prey far more often (60 % of its prey nets; six-seven 5 %, ATI x iHot 16 %, ThePyanist 20 % of all targets). In our own small sample this costs little (47 % against 49 % on prey), so the expected gain for us is smaller than the field gap of 30 points suggests.
- Decoys cannot be dodged by recognising them in most cases (21 of 30 appeared on the turn of the throw). Since pools are equal (section 5), the prey team's decoy count is known at the start; a net thrown after the target's team has shown its last decoy cannot be absorbed. This was not measured.

### Gaps
- Tree positions are not in the all-team logs: "clear line" is not part of any table, and the counterfactual ignores trees and units in the way (the same for all rules).
- The target of a miss is inferred from geometry; nets with no enemy within 600 of the line (about a quarter) are outside the target tables.
- Why v10 hits prey on cooldown less often than the field (49 % of 43 against 61 %) is not explained; the sample is weak.

## 5. Use of the net pool: unused nets, prey against predators, first net turn

### Takeaway
Unused nets are not where rank is lost: 91 % of all team-games throw as many nets as the busiest team of their game, v10 throws 98 % of its pool, and the leader is one of the two top teams that most often leave nets unused. What goes with rank is the number of nets that **hit prey** (win rate 24 % with none, 34 / 37 / 42 / 46 % with 1 / 2 / 3 / 4+); nets at predators and the turn of the first net show no positive association with rank.

### Cited Findings
Data for this section: 2,354 games (the top set had grown to 946 games when the script ran, plus the 1,408 old ones) = 7,062 team-games; our own pool from 89 debug replays (`gold/r10` 18, `gold/g10` 21: v10; `gold/g12` 26: v12; `gold/g15` 24: v15; the last two replay mostly the same battles as r10).

- **New measured rule: the three players start with the same pool.** Our start pool (the `pw` line of turn 1 plus the powers we ordered on turn 1; the line is printed after the orders: 2 to 8 mismatches under that reading against 352 to 499 under the other) was never exceeded by an opponent: 0 of 534 comparisons (2 opponents x 3 powers x 89 replays); the opponent used exactly our start count in 345 (65 %). Net pools seen: 0 to 10 per team, mean 4.8. — [pool.out, DEBUG blocks](E:/cg-tmp/tcf/research_nets/pool.out)
- So "nets thrown by the busiest team of the game minus own nets thrown" is a lower bound of the nets a team left unused, and exact whenever one team emptied its pool.

| Nets fewer than the busiest team of the game | Team-games | First | Last | Mean rank | Catches |
|---|---|---|---|---|---|
| 0 | 6,415 (91 %) | 34 % | 33 % | 1.99 | 2.90 |
| 1 | 249 | 32 % | 32 % | 2.00 | 2.83 |
| 2 | 122 | 33 % | 41 % | 2.08 | 2.63 |
| 3 | 62 | 23 % | 42 % | 2.19 | 2.65 |
| 4 or more | 82 | 20 % | 61 % | 2.41 | 2.35 |

  With 3 units per team: gap 0: 35 % first (1,571); gap 1-2: 25 % (139); gap 3+: 9 % first, 61 % last (33). With 4 to 6 units a gap of 1-2 shows no loss (34 to 39 % first, 70 to 82 team-games each). — [pool.out, tables P2, P2b](E:/cg-tmp/tcf/research_nets/pool.out)
- Our own bot: v10 threw 196 of its 200 nets in 39 replayed Gold battles (0 left in 37 games; the two games with nets left were wins). v12: 115 of 115 in 26. v15: 104 of 110 in 24. — [pool.out, DEBUG blocks](E:/cg-tmp/tcf/research_nets/pool.out)
- By team (30+ games): the mean gap is under 0.1 nets per game for most teams; the largest are FullStuck 0.82 (4th by win rate among teams with 200+ games), **ATI x iHot 0.79** (the leader: 63 % wins in 57 games, 3.28 nets per game against 4.1 to 4.9 for the others), six-seven 0.41, JavaPasLaTete 0.35, Golden Oreo 0.32. — [pool.out, per-team table](E:/cg-tmp/tcf/research_nets/pool.out)

Prey against predators (target = the unit hit, or for a miss the enemy unit nearest to the net's path within 900):

| | Team-games | First | Last | Mean rank |
|---|---|---|---|---|
| Net **hits on prey**: 0 | 2,026 | 24 % | 44 % | 2.20 |
| 1 | 2,319 | 34 % | 34 % | 2.00 |
| 2 | 1,528 | 37 % | 28 % | 1.91 |
| 3 | 758 | 42 % | 22 % | 1.80 |
| 4+ | 431 | 46 % | 21 % | 1.74 |
| Net hits on predators: 0 | 3,340 | 34 % | 32 % | 1.98 |
| 1 | 1,976 | 34 % | 33 % | 1.99 |
| 2 | 1,035 | 33 % | 35 % | 2.02 |
| 3+ | 711 | 29 % | 38 % | 2.09 |
| Share of nets aimed at predators (3+ nets): 0 % | 1,783 | 36 % | 28 % | 1.92 |
| up to 20 % | 739 | 32 % | 33 % | 2.01 |
| 20-40 % | 1,638 | 35 % | 34 % | 1.99 |
| 40-60 % | 808 | 32 % | 36 % | 2.04 |
| over 60 % | 705 | 28 % | 39 % | 2.11 |

  Nets aimed at prey, by count: 0: 25 % first (960); 1: 32 %; 2: 33 %; 3: 36 %; 4: 37 %; 5: 39 %; 6+: 37 % first, 24 % last (244). Nets aimed at predators, by count: 0: 36 % first (2,706); 1: 32 %; 2: 34 %; 3: 29 %; 4+: 29 % (482). — [pool.out, tables P4, P5, P6, P9, P10](E:/cg-tmp/tcf/research_nets/pool.out)
- ATI x iHot puts 38 % of its nets on predators in this larger sample (1.25 per game) and hits with 83 % of them and with 74 % of its nets at prey (the highest prey hit rate of the 50 teams with 30+ games; typical 55 to 65 %). Other high predator shares: JavaPasLaTete 73 % (27 % wins), 405 Force 51 % (30 %), ThreeLetterAcronym 50 % (17 %), Hardcoders 49 % (46 %), Lore 47 % (45 %), ATA 44 % (44 %). Low shares: Golden Oreo 6 % (42 %), Les Gens Bons 11 % (55 %), FullStuck 12 % (43 %), BitingBytes 2 % (28 %). — [pool.out, per-team table](E:/cg-tmp/tcf/research_nets/pool.out)
- Rank correlation with the win rate across the 50 teams with 30+ games: share of nets at predators -0.13, nets at predators per game -0.13, hit rate on prey +0.24, hit rate on predators +0.30, nets per game -0.03, gap 0.00, nets on turns 1-3 +0.14, share of catches made on held prey +0.01 (catches per game, for scale: +0.75). With 50 teams only values beyond about 0.3 mean something. — [pool.out, correlation block](E:/cg-tmp/tcf/research_nets/pool.out)
- v10's nets in the 39 replays: 196 thrown, 110 at prey (70 hit, 64 %), 61 at predators (50 hit, 82 %), 25 with no enemy near the path; 31 % of all its nets go at predators; median first net on turn 3 to 4. — [pool.out, DEBUG r10 and g10 totals](E:/cg-tmp/tcf/research_nets/pool.out)

First net turn (team-games; first / last / mean rank): turn 1: 34 % / 34 % / 2.00 (3,349); turns 2-3: 34 % / 32 % / 1.98 (1,956); turns 4-6: 30 % / 36 % / 2.05 (619); turns 7-10: 31 % / 29 % / 1.99 (377); turns 11-20: 33 % / 33 % / 2.00 (356); turn 21 on: 35 % / 30 % / 1.96 (246); never: 29 % / 39 % / 2.10 (159). Nets on turn 1: none 33 % first (3,713), one 33 % (2,097), two or more 35 % (1,252). The median first net turn is 1 or 2 for 43 of the 50 teams; ATI x iHot 14, NewPhoneWhoDis 9, J-BCM 5, Kogaion 4. — [pool.out, tables P3, P7, P8 and per-team table](E:/cg-tmp/tcf/research_nets/pool.out)

### Inferences
- "Never let a net go unused" is already satisfied by v10 and by the field; it has no rank left in it. A gap of 3 or more goes with bad results, but that is mostly the effect, not the cause: a team that loses its units early cannot throw.
- Nets at predators are not a recipe: the share is unrelated to the win rate across teams (-0.13) and slightly negative inside games (36 % first with none, 28 % with over 60 %), which is what one expects when teams under pressure throw more of them. The leader's 38 % is a feature of a bot that hits with 83 % of them; v10 is already at 31 % and 82 %.
- The quantity to raise is hits on prey per game. Each additional hit goes with +3 to +10 points of win rate (reverse causation inflates this: teams with more living units throw more).
- The turn of the first net carries no information about rank between turn 1 and turn 21+; the leader's late first net is one style among several.

### Gaps
- Pools are known exactly for our team only; for the others the "gap" is a lower bound.
- Whether a net at a predator saved the thrower is covered in sections 1 and 3, not here; here only the association with the final rank is measured.

## 6. Ranked list: the net and held-unit changes most likely to improve rank in Gold

### Takeaway
Ranked by cases per game times the measured difference: (1) have smoke left and in place when the net lands, (2) throw nets at prey that cannot dash, (3) complete the held-unit rule (net at once, smoke only when the hunter is far, no decoy), (4) keep the damped lead, (5) rescue nets by team mates. "Net the hunter before fleeing", more nets at predators, an earlier or later first net and "use every net" have no measured gain.

### Cited Findings

| # | Change | Cases per game | Measured difference | Strength | v10 today |
|---|---|---|---|---|---|
| 1 | **A cloud over the unit before the net lands; keep smoke for that moment.** Smoke on the unit itself on the turn a predator with a net line is within about 1,640 (or can be next turn), and ration the pool so it is not empty then. | Holds by a predator's net: 1.25 per team-game (field), 1.38 (v10); 65 % of them with a hunter that can arrive next turn = 0.82 per team-game. v10: 0.54 holds per game with the smoke pool already empty. | Caught within 5 turns: 47 % in a cloud against 82 % in the open when the hunter can arrive next turn (949 / 4,411); 24 % against 62 % one turn farther (197 / 1,277). v10: 19 of 21 lost with no smoke left, 14 of 33 with smoke left. | Strong in the field (both sets agree); weak but same direction in our games. Observational: units in a cloud are also harder to net at all. | Smoke rule exists (clear line within 2,300) but the pool is empty in 39 % of our holds; with smoke left and the thrower in sight no power was used in 15 of 27. |
| 2 | **Nets at prey whose dash is on cooldown or that is held; none at prey that can dash unless it walks towards us; none on turn 1.** | 4.3 nets per team-game, 47 % of them at targets that can dash = 2.0 per team-game. v10: 5.0 nets per game, 2.5 at targets that can dash; 60 % of its prey nets. | Hit 65 % (cooldown) and 73 % (held) against 35 % (can dash); turn 1: 24 %. Each extra hit on prey goes with +3 to +10 points of win rate (24 / 34 / 37 / 42 / 46 % first for 0 / 1 / 2 / 3 / 4+ hits). | Strong in the field (10,745 / 10,853 nets). In our own games the gap is small: 51 % against 60 % all targets, 47 % against 49 % on prey (weak). | Rule "prey that cannot dodge" exists but half the nets still go at dash-ready targets. |
| 3 | **Held unit: net the nearest hunter at once, also on an unsure aim; after a miss net again; smoke on itself only when no hunter can arrive within two turns (beyond about 1,640, or none in sight) or no net is left; never a decoy first.** | 0.87 per team-game (holds still alive after the next turn). v10: 0.49 holds per game with no hunter within two turns or none in sight. | Caught on t+2..t+5: net 37 % against nothing 52 % (1,016 / 3,102); a miss 53 %, a hit 32 %; net delayed by one turn 67 % (311). Hunter two or more turns away: smoke 30 % against nothing 47 % (57 / 375); none within 3,000: smoke 21 %, net 16 %, nothing 30 % (96 / 63 / 543). Decoy first 68 % (385). Smoke after the hit with the hunter within 1,640: 60 to 62 % against 57 to 60 % for nothing. | Strong for the net and for the decoy; moderate for the far-hunter smoke (57 and 96 cases). | Nets the hunter it sees (11 of 11 hit, 2 caught); does nothing in 16 of the 19 holds where no hunter was within two turns (8 of the 19 caught); smoked after the hit 8 times (7 caught). |
| 4 | **Aim: full range through position + half the last movement; held target: its position. Never the whole last movement after a dash.** | Every net (4.3 per team-game). | Model over 105,146 chances at cooldown targets: 76 % (half) against 69 % (whole) and 60 % (current position). Real nets after a dash: 73 to 75 % with a lead of 300 to 600, 30 % with the whole 1,200 (2,663 / 867). | Strong. | Already there: 64 % as thrown against 65 % for the best rule in the same model. Nothing to gain; do not regress. |
| 5 | **A team mate within range nets the hunter of a held unit.** | A mate within 2,500 of the held unit: 0.39 per team-game; mates act in 15 % of those. | Mate's net hits: 47 % caught against 62 % (45 / 2,145); alive after the next turn: 38 % against 51 %. Mate's smoke over the unit with the hunter one move away: 78 % against 76 % (no effect). | Weak to moderate (45 cases). At most about 0.04 units per game. | v12 tried it: no gain in 26 replays, consistent with the small size. |
| - | **Not supported: net the approaching hunter before fleeing (B5).** | 8.1 onsets per team-game of "free predator within 1,500". | Caught within 5 turns: net at the predator 26 %, no power 24 % (2,249 / 39,150); after a hit 19 %, after a miss 28 %; dash away 18 %, smoke + dash 16 % (2,003). Team catches in the next 10 turns with a net proven left: 0.65 against 0.65. | Strong (negative). | If tried at all: only inside 1,040 with our own dash on cooldown and the predator's dash on cooldown (hit rate 80 %). |
| - | **Not supported: a higher share of nets at predators, an earlier or later first net, "use every net".** | | Share at predators against win rate across 50 teams: -0.13; first net turn: 30 to 35 % first in every bucket; 91 % of team-games already throw as many nets as the busiest team; v10 throws 98 % of its pool. | Strong (no association). | Nothing to change. |

Sources of the rows: 1: [held2.out tables 15, 15b](E:/cg-tmp/tcf/research_nets/held2.out), [ours.out H9](E:/cg-tmp/tcf/research_nets/ours.out). 2: [aim.out A1, A7](E:/cg-tmp/tcf/research_nets/aim.out), [pool.out P9](E:/cg-tmp/tcf/research_nets/pool.out), [ours.out N1](E:/cg-tmp/tcf/research_nets/ours.out). 3: [held.out 3b, 4b, 6, 9b](E:/cg-tmp/tcf/research_nets/held.out), [held2.out 16, 17, 18](E:/cg-tmp/tcf/research_nets/held2.out), [ours.out H2 to H8](E:/cg-tmp/tcf/research_nets/ours.out). 4: [aim2.out A10, CF2](E:/cg-tmp/tcf/research_nets/aim2.out), [ours.out counterfactual](E:/cg-tmp/tcf/research_nets/ours.out). 5: [held.out 10 to 10f](E:/cg-tmp/tcf/research_nets/held.out). B5: [flee.out](E:/cg-tmp/tcf/research_nets/flee.out). Pool: [pool.out](E:/cg-tmp/tcf/research_nets/pool.out).

### Inferences
- Size of the possible effect, units saved or hits gained per game (rough, from cases per game x difference; not additive):
  - 1: v10 has 0.54 holds per game with an empty smoke pool, lost at 90 %, against 42 % with smoke left. If rationing kept smoke for half of them: about 0.13 units per game. In the field figures, covering half of the 0.82 "hunter next to it" holds: about 0.14 units per team-game.
  - 2: moving the 2.0 nets per game that the field throws at dash-ready targets to cooldown targets would add about 0.6 hits per game; for v10 the measured gap gives about 0.2 hits per game (2.5 nets x 9 points), and none if only prey is counted.
  - 3: about 0.07 units per game for the far-hunter smoke (0.49 holds x about 15 points); the net-at-once part is already in v10.
  - 4: 0 for v10. 5: at most 0.04.
- The user's proposal "net, then decoy, then smoke, instantly" should become "net at once; net again after a miss; smoke instead of the net only when the hunter is two or more turns away or the nets are gone; no decoy". The decoy step is the one the data rejects at every distance (68 % against 52 %; 78 / 75 / 54 / 31 % against 57 / 60 / 47 / 30 % for nothing by hunter distance).
- Changes 1 and 3 compete for the same smoke: change 1 has the larger measured difference (35 points against 9 to 17) and more cases, so the pool should be spent there first.
- Everything here is observational. Each change needs a switch and the replay test on 30 or more Gold battles before it is believed; three earlier "improvements" were harmful and only the ablation showed it (`kb/gold.md` section 3).

### Gaps
- How much smoke rationing costs elsewhere (early smokes prevent early nets: 36 % -> 4 % netted on turn 1 to 4 in `kb/gold-autopsy.md` 2.2) is not measured here; the right budget needs the local referee.
- No table says how to avoid being netted in the first place by movement (crossing the line: section 4 shows a dash across is hit 6 %, a walk across 48 to 52 %, a walk along the line 62 to 84 %); that belongs to the dodge rule, change 7 of `kb/gold-autopsy.md`.
- Per-team results depend on which opponents a team met; no adjustment for opponent strength was made anywhere in this note.
