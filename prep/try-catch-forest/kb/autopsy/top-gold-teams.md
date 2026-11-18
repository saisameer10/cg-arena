# Autopsy of the top Gold teams (Try Catch Forest)

Games parsed: 2176. Script: E:/cg-tmp/tcf/gold/agent_top/analysis.js. Positions are reconstructed from the logs (anchors at dashes, nets, smoke, decoys, catches; orders in between; median error 2, 90 % under 300; positions older than 30 turns are not used). Start positions use the 120-degree symmetry.

Columns: **team, all games** (both folders, every bot version) | **team, new folder** (goldtop, current version) | **other seats, new folder** (every other team in the goldtop games) | **team wins** | **team non-wins** (both from all games). Cells are `value (cases)`; `*` = fewer than 30 cases: weak.

Score mismatches between counted catches and the final score: 0 seat-games.

Caveat for the per-unit turn-1 table: a start position is known when one of the three symmetric units dashes or sends a decoy early, so that table over-represents dashers (the same way for every team). The unbiased dash share is in "Turn 1, living units" and in "dashes on turn 1 (per game)".

Old-folder games of a team were played by earlier bot versions (other agent ids); the "team, new folder" column is the current version.

## Summary (written after the tables; every number is in the tables below)

Data: 2,176 games (768 in goldtop, 1,408 older Gold games). Games per team: ATI x iHot 47 (all new, 31 wins), Les Gens Bons 311 (133 new + 178 old, 165 wins), Lore 64 (62 + 2, 28 wins), RNG 206 (130 + 76, 84 wins), SoloLeveling 121 (88 + 33, 37 wins). "Others" = every other seat of the goldtop games (about 2,200 seat-games). `*` and "weak" = fewer than 30 cases.

### The twelve findings

1. **The leader wins in the first ten turns, not in the chase.** ATI x iHot loses a unit by turn 10 in 28 % of its games, other seats in 56 % (47 / 2,257 games); it takes 0.40 net hits per game in turns 1-5 against 0.90; its first loss comes on turn 17 (median) against turn 8. Later it is not safer than anyone: with a free predator under 1000 it is caught within 3 turns in 28 % of the cases, others 23 % (432 / 34,172).
2. **How: dash and smoke on turn 1.** With a predator start within 2000, an ATI unit smokes in 71 % of the cases (35 of 49) against 14 % for others (2,787) and dashes in 94 % against 78 %; caught within 3 turns 6 % (3 of 49, weak) against 12 %. Over every seat of the new folder, a turn-1 unit with a predator within 2000: no smoke: netted within 4 turns 36 %, caught within 5 turns 25 % (2,408 cases); smoke dropped on itself: 4 % and 12 % (198); smoke centred on the predator: 24 % and 20 % (117).
3. **ATI keeps its nets.** 0.30 nets in turns 1-5 against 1.97; median turn of a net 42 against 6; after turn 30 it still throws 1.1 to 1.6 nets per 100 unit-turns, others 0.2 to 0.4. 38 % of its nets are aimed at predators (others 28 %; halves 43 % and 32 %), three quarters of them with the predator within 1500 of the thrower.
4. **What beats ATI is the net.** Of its lost units 18 % were held by a net in its wins and 49 % in its non-wins (74 / 49 units; both halves 18 % against 46-52 %). Nets aimed at its units hit 45 % in its wins, 60 % in its non-wins (101 / 70). Its units dash on the turn of the net in 50 % of the cases (others 29 %) and are then hit 28 %; when they do not dash they are hit 74 % (77 cases). Its dashes come on turns 1, 3 and 6.
5. **ATI finishes better at close range.** Prey at 800-1200: caught within 3 turns 23 % against 18 % (767 / 33,394 unit-turns); at 1200-1600: 19 % against 13 % (both halves agree). It nets prey whose dash is on cooldown (17 % of the unit-turns at 800-1200 against 8 %; 106 cases) and almost never prey that can dash (1 % against 2 %). Held prey is caught on the very next turn in 67 % of the cases against 48 % (48 / 2,162): its hunter is 771 away at the hit (median), others 1,044.
6. **Every team's non-wins start with an early loss.** Win rate when the team loses a unit before making a catch / otherwise: ATI 36 % (11 games, weak) / 75 %; Les Gens Bons 27 % / 68 % (113 / 198); Lore 28 % (25, weak) / 54 %; RNG 20 % / 56 % (89 / 117); SoloLeveling 10 % / 41 % (40 / 81); others 16 % / 47 %. Tie-break defeats are 1 to 13 % of the non-wins. When ATI does not win, its prey team wins 10 times of 16 (weak); for Les Gens Bons its predator team wins 86 of 146 (59 %); others 50 %.
7. **Les Gens Bons nets on turn 1.** 1.21 nets on turn 1 per game against 0.57; with prey within 2000 on turn 1 it throws in 68 % of the unit-turns against 27 % (365 / 2,640; halves 70 % and 66 %). Its early nets hit prey 40 % against 28 %; 46 % in its wins, 35 % in its non-wins (416 / 411 nets). Over every seat: a unit that dashes on the turn of the net is hit 30 %, one that does not 69 % (2,621 / 5,868). It drops smoke on itself every time (856 of 856), its decoys walk away from the predator (82 % against 38 %), and its held units send a decoy (42 % against 20 %).
8. **Lore nets its hunters and dies at the wall.** 48 % of its nets are aimed at predators (others 28 %); when one of its units is netted it nets a hunter back in 62 % of the cases against 25 % (115 / 3,121) and loses the unit 57 % against 67 %. It uses no smoke in the opening (0 in 64 games; 0.84 per game against 3.1). 42 % of its lost units are caught beyond radius 6500 against 19 % (176 / 6,637; halves 38 % and 47 %), 42 % with two or more hunters within 1800 against 30 %.
9. **RNG opens slowly and its ghosts watch the hunters.** 32 % of its units dash on turn 1 against 59 %; 41 % head for the wall against 16 % (883 / 9,311). 24 % of its ghost orders aim within 1000 of a living predator against 11 %. It dashes onto held prey 61 % against 43 % (227 / 2,067). The ghosts of Les Gens Bons and Lore follow prey instead (48 % of the orders within 1000 of a living prey against 25 %); SoloLeveling's go elsewhere (77 % near nobody against 57 %).
10. **SoloLeveling burns its dashes.** 92 % dash on turn 1 and 81 % on turn 3 (others 56 % and 34 %); 7.4 dashes per unit and game against 4.8; 79 % of its lost units had already spent three dashes or more against 59 % (357 / 6,537). In these games it wins 31 % (37 of 121; 27 of 88 in the new folder), 16 % with 3 units (5 of 31).
11. **Units per team.** Everybody's early numbers scale with the size (catches by turn 10: 0.36 with 3 units, 1.23 with 6). Les Gens Bons is best with 3 units (59 % of 79) and weakest with 6 (44 % of 63). ATI won 28 of 41 games with 3 to 5 units and 3 of 6 with 6 units (weak), where it lost 1.17 units by turn 10 against 0.09 to 0.45. RNG is flat (38 to 43 %). Openings differ little by size: the share of units dashing on turn 1 rises with the size for everybody (others 53 % with 3 units, 66 % with 6; Les Gens Bons 35 % and 54 %; RNG 10 % and 50 %).
12. **Nobody has a "protect the lead" mode.** Ahead / level / behind on catches, turns 31-100: median distance to the nearest predator ATI 2875 / 3625 / 4125, others 2875 / 3125 / 3625; dash when available ATI 5 / 7 / 8 %, others 5 / 6 / 7 %. The other four teams follow the field the same way. Fewer nets when ahead (ATI 0.6 per 100 unit-turns ahead, 1.9 level, in turns 6-30; others 1.7 / 2.3) is a pool effect.

### The leader in two paragraphs

**Opening.** Turn 1, per unit, by the distance of the nearest predator start: under 1500: dash (100 %), mostly straight away (median 41 degrees off), smoke 81 %; 1500-2000: dash 86 %, smoke 59 %; 2000-2500: dash 85 %, smoke 19 %; beyond 2500: head for the nearest prey (87 to 94 % within 60 degrees), dash about half the time, no smoke. Almost no net (0.30 per game in turns 1-5, others 1.97) and almost no decoy (0.26, others 1.46) before turn 6. The smoke is thrown toward the predator at two thirds of the distance (median 66 %, at most 1800): the centre lands where the predator will be after one move (median 369 from its next position); the thrower stands inside the cloud's edge and leaves it in one move. Second dash on turn 3 (40 % of the units), third on turn 6.

**Catching.** Walk at the prey, aiming one step ahead of it (order target 600 from its position). Dash when the prey is at 1200-1600 (32 % of the chances against 24 %). Throw the net late and close: from about 1250 (others 1400), when the prey's dash is on cooldown, aimed 600 ahead of the target; then walk in: 67 % of its held prey is caught on the next turn. 70 % of its catches are on free prey, 31 % with a dashing catcher (others 40 %), from a start distance of 715 (median). Decoy: target 2400 away at 86 degrees from the unit's own move, when a predator is within about 2000. Nets also serve as defence: a predator within 1500 gets one.

### What is verified

- **Re-counted independently** (Python, referee text only, see "Verification"): games and wins per team, first catch, unit lost by turn 10, no catch by turn 20, nets per game and in turns 1-5, median net turn, smoke on turn 1, decoys in turns 1-5, catches and losses, share of held prey and held losses, catch one turn after the net, dashing catcher, nets hitting prey and predators. All equal.
- **Same in both halves of the data** (even / odd game ids): findings 1, 3 (net timing), 4 (18 % against 46-52 %), 5 (conversion by distance), 7, 8, 9, 10 and the smoke geometry.
- **Single pass** (positions reconstructed by one parser, one script): turn-1 directions and trigger tables, smoke / decoy / net geometry, ghost targets, hunters within 1800, the turn-1 smoke outcome table, finding 12.
- **Weak** (small samples): every win / non-win split of ATI x iHot (31 / 16 games), its turn-1 cells (49 units), its results by team size, its net conversion (59 % and 79 % in the halves).

## Games per team

| Team | all | new folder | old folder | wins (all) | win % all | win % new | mean rank new | 3 units | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ATI x iHot | 47 | 47 | 0 | 31 | 66% | 66% | 1.49 | 10 | 20 | 11 | 6 |
| Les Gens Bons | 311 | 133 | 178 | 165 | 53% | 53% | 1.67 | 79 | 92 | 77 | 63 |
| Lore | 64 | 62 | 2 | 28 | 44% | 44% | 1.82 | 14 | 15 | 17 | 18 |
| RNG | 206 | 130 | 76 | 84 | 41% | 40% | 1.85 | 39 | 58 | 56 | 53 |
| SoloLeveling | 121 | 88 | 33 | 37 | 31% | 31% | 1.94 | 31 | 39 | 21 | 30 |
| every seat, new folder | | 2304 | | | | 33% | 2.00 | 570 | 594 | 588 | 552 |

---

# ATI x iHot

## 1. Opening (turns 1-5): ATI x iHot

**Turn 1, per unit (direction of the order relative to the nearest predator start / nearest prey start; cos > 0.5 away, < -0.5 toward)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| units | 173 | 173 | 9688 | 115 | 58 |
| dash on turn 1 | 69% (173) | 69% (173) | 60% (9688) | 70% (115) | 66% (58) |
| dash on turn 1, nearest predator under 2000 | 96% (48) | 96% (48) | 79% (2768) | 97% (34) | 93% (14) * |
| dash on turn 1, nearest predator 2000-3500 | 71% (58) | 71% (58) | 55% (3351) | 71% (35) | 70% (23) * |
| dash on turn 1, nearest predator over 3500 | 48% (67) | 48% (67) | 50% (3569) | 50% (46) | 43% (21) * |
| dash on turn 1, nearest prey under 2000 | 98% (49) | 98% (49) | 77% (2738) | 100% (35) | 93% (14) * |
| dash on turn 1, nearest prey 2000-3500 | 66% (58) | 66% (58) | 57% (3358) | 68% (37) | 62% (21) * |
| dash on turn 1, nearest prey over 3500 | 50% (66) | 50% (66) | 49% (3592) | 49% (43) | 52% (23) * |
| vs predator: away | 34% (173) | 34% (173) | 32% (9688) | 36% (115) | 29% (58) |
| vs predator: toward | 23% (173) | 23% (173) | 28% (9688) | 24% (115) | 21% (58) |
| vs predator: sideways | 43% (173) | 43% (173) | 39% (9688) | 40% (115) | 50% (58) |
| vs predator: no move | 0% (173) | 0% (173) | 0% (9688) | 0% (115) | 0% (58) |
| vs prey: toward | 76% (173) | 76% (173) | 72% (9688) | 79% (115) | 71% (58) |
| vs prey: away | 7% (173) | 7% (173) | 11% (9688) | 6% (115) | 9% (58) |
| vs prey: sideways | 17% (173) | 17% (173) | 17% (9688) | 15% (115) | 21% (58) |
| predator under 2000: away from it | 71% (48) | 71% (48) | 55% (2768) | 68% (34) | 79% (14) * |
| predator under 2000: toward nearest prey | 50% (48) | 50% (48) | 57% (2768) | 56% (34) | 36% (14) * |
| predator over 3500: toward nearest prey | 91% (67) | 91% (67) | 82% (3569) | 91% (46) | 90% (21) * |
| prey nearer than predator: toward prey | 90% (93) | 90% (93) | 85% (4715) | 91% (64) | 90% (29) * |
| predator nearer than prey: away from predator | 51% (79) | 51% (79) | 40% (4830) | 54% (50) | 45% (29) * |
| prey under 2000: toward it | 90% (49) | 90% (49) | 84% (2738) | 86% (35) | 100% (14) * |
| prey under 2000: dash toward it | 88% (49) | 88% (49) | 69% (2738) | 86% (35) | 93% (14) * |
| dashers: toward prey | 73% (119) | 73% (119) | 77% (5813) | 78% (81) | 63% (38) |
| dashers: away from predator | 44% (119) | 44% (119) | 36% (5813) | 46% (81) | 39% (38) |
| toward the centre | 54% (173) | 54% (173) | 51% (9688) | 55% (115) | 53% (58) |
| toward the wall | 11% (173) | 11% (173) | 18% (9688) | 13% (115) | 7% (58) |

**Turn 1, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 59% (201) | 59% (201) | 57% (10137) | 62% (130) | 54% (71) |
| toward nearest prey (any distance) | 76% (184) | 76% (184) | 72% (9847) | 79% (120) | 69% (64) |
| away from nearest predator (any distance) | 32% (184) | 32% (184) | 32% (9847) | 35% (120) | 27% (64) |
| toward nearest predator | 26% (184) | 26% (184) | 28% (9847) | 27% (120) | 25% (64) |
| median distance to nearest predator | 2875 (184) | 2875 (184) | 2875 (9876) | 2875 (120) | 2875 (64) |
| median distance to nearest prey | 2875 (184) | 2875 (184) | 2875 (9875) | 2625 (120) | 2875 (64) |
| predator within 1800 | 24% (184) | 24% (184) | 23% (9876) | 25% (120) | 22% (64) |
| prey within 2000 | 27% (184) | 27% (184) | 28% (9875) | 29% (120) | 23% (64) |
| net thrown when prey within 2000 | 0% (50) | 0% (50) | 30% (2756) | 0% (35) | 0% (15) * |
| held by a net | 0% (201) | 0% (201) | 0% (10137) | 0% (130) | 0% (71) |

**Turn 2, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 5% (197) | 5% (197) | 8% (9699) | 3% (127) | 7% (70) |
| toward nearest prey (any distance) | 68% (148) | 68% (148) | 59% (8452) | 71% (98) | 60% (50) |
| away from nearest predator (any distance) | 39% (148) | 39% (148) | 37% (8452) | 46% (98) | 26% (50) |
| toward nearest predator | 32% (148) | 32% (148) | 27% (8452) | 31% (98) | 34% (50) |
| median distance to nearest predator | 2625 (154) | 2625 (154) | 2625 (8933) | 2375 (101) | 2625 (53) |
| median distance to nearest prey | 2375 (152) | 2375 (152) | 2375 (8943) | 2375 (101) | 2875 (51) |
| predator within 1800 | 32% (154) | 32% (154) | 32% (8933) | 30% (101) | 38% (53) |
| prey within 2000 | 43% (152) | 43% (152) | 39% (8943) | 43% (101) | 43% (51) |
| net thrown when prey within 2000 | 14% (65) | 14% (65) | 28% (3532) | 14% (43) | 14% (22) * |
| held by a net | 2% (201) | 2% (201) | 4% (10103) | 2% (130) | 1% (71) |

**Turn 3, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 40% (192) | 40% (192) | 37% (8883) | 41% (123) | 38% (69) |
| toward nearest prey (any distance) | 64% (155) | 64% (155) | 54% (7836) | 64% (101) | 63% (54) |
| away from nearest predator (any distance) | 37% (155) | 37% (155) | 37% (7836) | 41% (101) | 31% (54) |
| toward nearest predator | 28% (155) | 28% (155) | 26% (7836) | 26% (101) | 33% (54) |
| median distance to nearest predator | 2375 (164) | 2375 (164) | 2625 (9073) | 2375 (108) | 2375 (56) |
| median distance to nearest prey | 2125 (164) | 2125 (164) | 2375 (9074) | 2125 (108) | 2125 (56) |
| predator within 1800 | 26% (164) | 26% (164) | 31% (9073) | 23% (108) | 32% (56) |
| prey within 2000 | 47% (164) | 47% (164) | 39% (9074) | 47% (108) | 46% (56) |
| net thrown when prey within 2000 | 3% (77) | 3% (77) | 13% (3548) | 2% (51) | 4% (26) * |
| held by a net | 4% (201) | 4% (201) | 11% (10016) | 5% (130) | 3% (71) |

**Turn 4, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 6% (187) | 6% (187) | 12% (8529) | 8% (120) | 4% (67) |
| toward nearest prey (any distance) | 54% (157) | 54% (157) | 50% (7583) | 55% (104) | 53% (53) |
| away from nearest predator (any distance) | 39% (157) | 39% (157) | 38% (7583) | 41% (104) | 36% (53) |
| toward nearest predator | 29% (157) | 29% (157) | 26% (7583) | 32% (104) | 25% (53) |
| median distance to nearest predator | 2625 (168) | 2625 (168) | 2625 (8868) | 2875 (112) | 2375 (56) |
| median distance to nearest prey | 2625 (168) | 2625 (168) | 2625 (8869) | 2375 (112) | 2875 (56) |
| predator within 1800 | 27% (168) | 27% (168) | 27% (8868) | 26% (112) | 30% (56) |
| prey within 2000 | 35% (168) | 35% (168) | 34% (8869) | 38% (112) | 30% (56) |
| net thrown when prey within 2000 | 3% (59) | 3% (59) | 12% (3050) | 5% (42) | 0% (17) * |
| held by a net | 6% (198) | 6% (198) | 12% (9668) | 6% (128) | 4% (70) |

**Turn 5, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 5% (183) | 5% (183) | 9% (8195) | 3% (117) | 8% (66) |
| toward nearest prey (any distance) | 47% (155) | 47% (155) | 49% (7361) | 44% (102) | 53% (53) |
| away from nearest predator (any distance) | 45% (155) | 45% (155) | 36% (7361) | 48% (102) | 38% (53) |
| toward nearest predator | 25% (155) | 25% (155) | 27% (7361) | 25% (102) | 26% (53) |
| median distance to nearest predator | 2875 (169) | 2875 (169) | 2875 (8728) | 2875 (112) | 2625 (57) |
| median distance to nearest prey | 2625 (169) | 2625 (169) | 2875 (8729) | 2625 (112) | 2625 (57) |
| predator within 1800 | 24% (169) | 24% (169) | 26% (8728) | 23% (112) | 25% (57) |
| prey within 2000 | 34% (169) | 34% (169) | 32% (8729) | 33% (112) | 35% (57) |
| net thrown when prey within 2000 | 2% (57) | 2% (57) | 11% (2783) | 0% (37) | 5% (20) * |
| held by a net | 7% (197) | 7% (197) | 13% (9440) | 8% (127) | 6% (70) |

**Items and dashes per game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets on turn 1 (per game) | 0.00 (47) | 0.00 (47) | 0.63 (2257) | 0.00 (31) | 0.00 (16) * |
| nets on turn 2 (per game) | 0.19 (47) | 0.19 (47) | 0.62 (2257) | 0.19 (31) | 0.19 (16) * |
| nets on turn 3 (per game) | 0.04 (47) | 0.04 (47) | 0.29 (2257) | 0.03 (31) | 0.06 (16) * |
| nets on turn 4 (per game) | 0.04 (47) | 0.04 (47) | 0.24 (2257) | 0.06 (31) | 0.00 (16) * |
| nets on turn 5 (per game) | 0.02 (47) | 0.02 (47) | 0.20 (2257) | 0.00 (31) | 0.06 (16) * |
| nets in turns 1-5 (per game) | 0.30 (47) | 0.30 (47) | 1.97 (2257) | 0.29 (31) | 0.31 (16) * |
| nets whole game (per game) | 3.23 (47) | 3.23 (47) | 4.27 (2257) | 3.32 (31) | 3.06 (16) * |
| games with at least one net in turns 1-5 | 23% (47) | 23% (47) | 79% (2257) | 23% (31) | 25% (16) * |
| smokes on turn 1 (per game) | 0.85 (47) | 0.85 (47) | 0.27 (2257) | 0.90 (31) | 0.75 (16) * |
| smokes on turn 2 (per game) | 0.09 (47) | 0.09 (47) | 0.17 (2257) | 0.03 (31) | 0.19 (16) * |
| smokes on turn 3 (per game) | 0.28 (47) | 0.28 (47) | 0.12 (2257) | 0.23 (31) | 0.38 (16) * |
| smokes on turn 4 (per game) | 0.11 (47) | 0.11 (47) | 0.10 (2257) | 0.13 (31) | 0.06 (16) * |
| smokes on turn 5 (per game) | 0.04 (47) | 0.04 (47) | 0.09 (2257) | 0.03 (31) | 0.06 (16) * |
| smokes in turns 1-5 (per game) | 1.36 (47) | 1.36 (47) | 0.74 (2257) | 1.32 (31) | 1.44 (16) * |
| smokes whole game (per game) | 3.85 (47) | 3.85 (47) | 3.03 (2257) | 4.19 (31) | 3.19 (16) * |
| games with at least one smoke in turns 1-5 | 81% (47) | 81% (47) | 45% (2257) | 84% (31) | 75% (16) * |
| decoys on turn 1 (per game) | 0.06 (47) | 0.06 (47) | 0.48 (2257) | 0.06 (31) | 0.06 (16) * |
| decoys on turn 2 (per game) | 0.04 (47) | 0.04 (47) | 0.40 (2257) | 0.03 (31) | 0.06 (16) * |
| decoys on turn 3 (per game) | 0.04 (47) | 0.04 (47) | 0.25 (2257) | 0.06 (31) | 0.00 (16) * |
| decoys on turn 4 (per game) | 0.06 (47) | 0.06 (47) | 0.20 (2257) | 0.06 (31) | 0.06 (16) * |
| decoys on turn 5 (per game) | 0.04 (47) | 0.04 (47) | 0.14 (2257) | 0.03 (31) | 0.06 (16) * |
| decoys in turns 1-5 (per game) | 0.26 (47) | 0.26 (47) | 1.46 (2257) | 0.26 (31) | 0.25 (16) * |
| decoys whole game (per game) | 4.02 (47) | 4.02 (47) | 3.86 (2257) | 4.19 (31) | 3.69 (16) * |
| games with at least one decoy in turns 1-5 | 19% (47) | 19% (47) | 61% (2257) | 19% (31) | 19% (16) * |
| dashes on turn 1 (per game) | 2.53 (47) | 2.53 (47) | 2.58 (2257) | 2.61 (31) | 2.38 (16) * |
| dashes in turns 1-5 (per game) | 4.79 (47) | 4.79 (47) | 5.16 (2257) | 4.77 (31) | 4.81 (16) * |
| dashes whole game (per game) | 21.81 (47) | 21.81 (47) | 21.59 (2257) | 22.29 (31) | 20.88 (16) * |

**Nets, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 14 | 14 | 4456 | 9 | 5 |
| distance to nearest predator at the order (q25 / median / q75) | 1748 / 2827 / 3275 (14) * | 1748 / 2827 / 3275 (14) * | 1422 / 2309 / 3764 (4445) | 1748 / 2557 / 3977 (9) * | 2275 / 2827 / 3004 (5) * |
| distance to nearest prey at the order (q25 / median / q75) | 1163 / 1447 / 1525 (14) * | 1163 / 1447 / 1525 (14) * | 1245 / 1695 / 2255 (4453) | 1069 / 1266 / 1447 (9) * | 1504 / 1509 / 1525 (5) * |
| predator within 1500 | 21% (14) * | 21% (14) * | 27% (4445) | 22% (9) * | 20% (5) * |
| predator within 2500 | 43% (14) * | 43% (14) * | 53% (4445) | 44% (9) * | 40% (5) * |
| prey within 2000 | 100% (14) * | 100% (14) * | 67% (4453) | 100% (9) * | 100% (5) * |
| thrower held by a net | 14% (14) * | 14% (14) * | 11% (4456) | 22% (9) * | 0% (5) * |
| hit prey | 50% (14) * | 50% (14) * | 29% (4456) | 44% (9) * | 60% (5) * |
| hit predator | 0% (14) * | 0% (14) * | 17% (4456) | 0% (9) * | 0% (5) * |
| aimed at a predator (hit or miss) | 14% (14) * | 14% (14) * | 25% (4456) | 11% (9) * | 20% (5) * |
| aimed at prey (hit or miss) | 86% (14) * | 86% (14) * | 69% (4456) | 89% (9) * | 80% (5) * |
| no enemy near the line | 0% (14) * | 0% (14) * | 6% (4456) | 0% (9) * | 0% (5) * |
| absorbed by a decoy | 0% (14) * | 0% (14) * | 12% (4456) | 0% (9) * | 0% (5) * |
| stopped by a tree | 0% (14) * | 0% (14) * | 4% (4456) | 0% (9) * | 0% (5) * |
| distance thrower-target (q25 / median / q75) | 1185 / 1419 / 1509 (14) * | 1185 / 1419 / 1509 (14) * | 1141 / 1490 / 1862 (4200) | 1185 / 1323 / 1447 (9) * | 1419 / 1504 / 1509 (5) * |
| target could dash | 21% (14) * | 21% (14) * | 64% (4209) | 11% (9) * | 40% (5) * |
| target already held | 0% (14) * | 0% (14) * | 3% (4209) | 0% (9) * | 0% (5) * |
| hit rate when the target could dash | 67% (3) * | 67% (3) * | 37% (2604) | 100% (1) * | 50% (2) * |
| hit rate when the target could not dash | 45% (11) * | 45% (11) * | 68% (1476) | 38% (8) * | 67% (3) * |
| nets at predators: one of our units held within 2000 of it (rescue) | 0% (2) * | 0% (2) * | 2% (1120) | 0% (1) * | 0% (1) * |
| nets at predators: predator within 1500 of the thrower | 100% (2) * | 100% (2) * | 69% (1120) | 100% (1) * | 100% (1) * |
| hit one of our own units | 0% (14) * | 0% (14) * | 0% (4456) | 0% (9) * | 0% (5) * |

**Nets, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 138 | 138 | 5173 | 94 | 44 |
| distance to nearest predator at the order (q25 / median / q75) | 1233 / 2038 / 3935 (127) | 1233 / 2038 / 3935 (127) | 1294 / 2493 / 4136 (5022) | 1192 / 1883 / 3550 (90) | 1542 / 2358 / 5118 (37) |
| distance to nearest prey at the order (q25 / median / q75) | 1131 / 1443 / 2061 (115) | 1131 / 1443 / 2061 (115) | 1250 / 1778 / 2807 (5098) | 1179 / 1730 / 3357 (71) | 1098 / 1303 / 1781 (44) |
| predator within 1500 | 36% (127) | 36% (127) | 31% (5022) | 41% (90) | 24% (37) |
| predator within 2500 | 58% (127) | 58% (127) | 50% (5022) | 60% (90) | 54% (37) |
| prey within 2000 | 75% (115) | 75% (115) | 61% (5098) | 63% (71) | 93% (44) |
| thrower held by a net | 15% (138) | 15% (138) | 14% (5173) | 14% (94) | 18% (44) |
| hit prey | 38% (138) | 38% (138) | 36% (5173) | 33% (94) | 50% (44) |
| hit predator | 30% (138) | 30% (138) | 25% (5173) | 39% (94) | 11% (44) |
| aimed at a predator (hit or miss) | 40% (138) | 40% (138) | 31% (5173) | 49% (94) | 20% (44) |
| aimed at prey (hit or miss) | 58% (138) | 58% (138) | 61% (5173) | 48% (94) | 80% (44) |
| no enemy near the line | 2% (138) | 2% (138) | 8% (5173) | 3% (94) | 0% (44) |
| absorbed by a decoy | 4% (138) | 4% (138) | 11% (5173) | 0% (94) | 11% (44) |
| stopped by a tree | 0% (138) | 0% (138) | 5% (5173) | 0% (94) | 0% (44) |
| distance thrower-target (q25 / median / q75) | 958 / 1234 / 1609 (134) | 958 / 1234 / 1609 (134) | 1009 / 1389 / 1789 (4724) | 936 / 1233 / 1551 (90) | 1068 / 1283 / 1776 (44) |
| target could dash | 61% (135) | 61% (135) | 77% (4762) | 58% (91) | 66% (44) |
| target already held | 4% (135) | 4% (135) | 7% (4762) | 4% (91) | 5% (44) |
| hit rate when the target could dash | 66% (76) | 66% (76) | 61% (3368) | 71% (49) | 56% (27) * |
| hit rate when the target could not dash | 74% (53) | 74% (53) | 76% (1061) | 76% (38) | 67% (15) * |
| nets at predators: one of our units held within 2000 of it (rescue) | 4% (55) | 4% (55) | 2% (1584) | 0% (46) | 22% (9) * |
| nets at predators: predator within 1500 of the thrower | 75% (55) | 75% (55) | 73% (1584) | 80% (46) | 44% (9) * |
| hit one of our own units | 0% (138) | 0% (138) | 0% (5173) | 0% (94) | 0% (44) |

**Smoke, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 64 | 64 | 1669 | 41 | 23 |
| distance to nearest predator at the order (q25 / median / q75) | 1060 / 1441 / 1711 (64) | 1060 / 1441 / 1711 (64) | 1102 / 1502 / 2005 (1668) | 1045 / 1469 / 1718 (41) | 1069 / 1418 / 1619 (23) * |
| distance to nearest prey at the order (q25 / median / q75) | 2227 / 3567 / 4741 (64) | 2227 / 3567 / 4741 (64) | 1847 / 2844 / 4228 (1666) | 2205 / 3567 / 5456 (41) | 2502 / 3547 / 4040 (23) * |
| predator within 1500 | 58% (64) | 58% (64) | 50% (1668) | 51% (41) | 70% (23) * |
| predator within 2500 | 98% (64) | 98% (64) | 87% (1668) | 98% (41) | 100% (23) * |
| prey within 2000 | 16% (64) | 16% (64) | 29% (1666) | 17% (41) | 13% (23) * |
| thrower held by a net | 5% (64) | 5% (64) | 11% (1669) | 7% (41) | 0% (23) * |
| cloud centre along the line unit-predator, 0 = unit, 1 = predator (q25 / median / q75, x100) | 94 / 114 / 131 (64) | 94 / 114 / 131 (64) | 0 / 0 / 54 (1668) | 89 / 105 / 126 (41) | 101 / 118 / 132 (23) * |
| cloud centre off that line (median) | 243 (64) | 243 (64) | 1 (1668) | 219 (41) | 244 (23) * |
| thrower inside its own cloud (centre within 1900) | 100% (64) | 100% (64) | 91% (1669) | 100% (41) | 100% (23) * |
| nearest predator inside the cloud (within 1900 of the centre) | 98% (64) | 98% (64) | 62% (1668) | 98% (41) | 100% (23) * |
| dropped on itself (within 400) | 0% (64) | 0% (64) | 56% (1669) | 0% (41) | 0% (23) * |
| thrown 400-1500 | 41% (64) | 41% (64) | 25% (1669) | 44% (41) | 35% (23) * |
| thrown over 1500 | 59% (64) | 59% (64) | 19% (1669) | 56% (41) | 65% (23) * |
| thrown toward the predator | 94% (64) | 94% (64) | 60% (734) | 93% (41) | 96% (23) * |
| a held team-mate within 1900 of the cloud centre | 0% (64) | 0% (64) | 2% (1669) | 0% (41) | 0% (23) * |
| nearest predator to the cloud centre (median) | 900 (64) | 900 (64) | 1678 (1668) | 900 (41) | 899 (23) * |
| nearest prey to the cloud centre (median) | 3621 (64) | 3621 (64) | 2707 (1666) | 3481 (41) | 3778 (23) * |

**Smoke, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 117 | 117 | 5171 | 89 | 28 |
| distance to nearest predator at the order (q25 / median / q75) | 1034 / 1309 / 1648 (116) | 1034 / 1309 / 1648 (116) | 842 / 1172 / 1631 (5144) | 1095 / 1368 / 1671 (88) | 789 / 1070 / 1478 (28) * |
| distance to nearest prey at the order (q25 / median / q75) | 2744 / 4080 / 6012 (102) | 2744 / 4080 / 6012 (102) | 2220 / 3461 / 5263 (4858) | 2986 / 4094 / 6262 (74) | 2393 / 3959 / 5422 (28) * |
| predator within 1500 | 66% (116) | 66% (116) | 70% (5144) | 63% (88) | 79% (28) * |
| predator within 2500 | 94% (116) | 94% (116) | 93% (5144) | 93% (88) | 96% (28) * |
| prey within 2000 | 7% (102) | 7% (102) | 20% (4858) | 4% (74) | 14% (28) * |
| thrower held by a net | 6% (117) | 6% (117) | 11% (5171) | 7% (89) | 4% (28) * |
| cloud centre along the line unit-predator, 0 = unit, 1 = predator (q25 / median / q75, x100) | 81 / 104 / 126 (116) | 81 / 104 / 126 (116) | 0 / 0 / 70 (5142) | 80 / 99 / 124 (88) | 82 / 112 / 135 (28) * |
| cloud centre off that line (median) | 214 (116) | 214 (116) | 1 (5144) | 188 (88) | 292 (28) * |
| thrower inside its own cloud (centre within 1900) | 100% (117) | 100% (117) | 88% (5171) | 100% (89) | 100% (28) * |
| nearest predator inside the cloud (within 1900 of the centre) | 93% (116) | 93% (116) | 79% (5144) | 93% (88) | 93% (28) * |
| dropped on itself (within 400) | 2% (117) | 2% (117) | 59% (5171) | 2% (89) | 0% (28) * |
| thrown 400-1500 | 56% (117) | 56% (117) | 25% (5171) | 49% (89) | 75% (28) * |
| thrown over 1500 | 43% (117) | 43% (117) | 16% (5171) | 48% (89) | 25% (28) * |
| thrown toward the predator | 86% (114) | 86% (114) | 72% (2111) | 90% (86) | 75% (28) * |
| a held team-mate within 1900 of the cloud centre | 2% (117) | 2% (117) | 1% (5171) | 0% (89) | 7% (28) * |
| nearest predator to the cloud centre (median) | 833 (116) | 833 (116) | 1262 (5144) | 836 (88) | 809 (28) * |
| nearest prey to the cloud centre (median) | 3894 (102) | 3894 (102) | 3466 (4858) | 4055 (74) | 3665 (28) * |

**Decoys, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 12 | 12 | 3295 | 8 | 4 |
| distance to nearest predator at the order (q25 / median / q75) | 1163 / 1681 / 1947 (12) * | 1163 / 1681 / 1947 (12) * | 1178 / 1524 / 1931 (3292) | 1263 / 1681 / 2052 (8) * | 1163 / 1834 / 1947 (4) * |
| distance to nearest prey at the order (q25 / median / q75) | 1633 / 2067 / 2430 (12) * | 1633 / 2067 / 2430 (12) * | 2000 / 2928 / 4286 (3289) | 1969 / 2067 / 2619 (8) * | 1633 / 2120 / 2430 (4) * |
| predator within 1500 | 50% (12) * | 50% (12) * | 49% (3292) | 50% (8) * | 50% (4) * |
| predator within 2500 | 92% (12) * | 92% (12) * | 90% (3292) | 88% (8) * | 100% (4) * |
| prey within 2000 | 42% (12) * | 42% (12) * | 25% (3289) | 38% (8) * | 50% (4) * |
| thrower held by a net | 8% (12) * | 8% (12) * | 7% (3295) | 13% (8) * | 0% (4) * |
| decoy walks toward the nearest predator | 50% (12) * | 50% (12) * | 17% (3292) | 50% (8) * | 50% (4) * |
| decoy walks away from the nearest predator | 17% (12) * | 17% (12) * | 40% (3292) | 25% (8) * | 0% (4) * |
| decoy walks toward the nearest prey | 25% (12) * | 25% (12) * | 30% (3289) | 38% (8) * | 0% (4) * |
| decoy: same point as the unit | 0% (12) * | 0% (12) * | 0% (3295) | 0% (8) * | 0% (4) * |
| decoy: same direction as the unit | 0% (12) * | 0% (12) * | 15% (3295) | 0% (8) * | 0% (4) * |
| decoy: opposite direction | 0% (12) * | 0% (12) * | 30% (3295) | 0% (8) * | 0% (4) * |
| decoy: sideways from the unit | 100% (12) * | 100% (12) * | 50% (3295) | 100% (8) * | 100% (4) * |

**Decoys, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 177 | 177 | 5415 | 122 | 55 |
| distance to nearest predator at the order (q25 / median / q75) | 1252 / 1489 / 1795 (176) | 1252 / 1489 / 1795 (176) | 1025 / 1414 / 1790 (5385) | 1262 / 1480 / 1797 (121) | 1216 / 1489 / 1740 (55) |
| distance to nearest prey at the order (q25 / median / q75) | 2455 / 3987 / 5797 (148) | 2455 / 3987 / 5797 (148) | 2364 / 3511 / 5154 (5188) | 2415 / 4343 / 6203 (95) | 2455 / 3845 / 4921 (53) |
| predator within 1500 | 52% (176) | 52% (176) | 56% (5385) | 53% (121) | 51% (55) |
| predator within 2500 | 95% (176) | 95% (176) | 91% (5385) | 96% (121) | 95% (55) |
| prey within 2000 | 18% (148) | 18% (148) | 17% (5188) | 18% (95) | 17% (53) |
| thrower held by a net | 1% (177) | 1% (177) | 5% (5415) | 0% (122) | 4% (55) |
| decoy walks toward the nearest predator | 24% (176) | 24% (176) | 12% (5385) | 23% (121) | 25% (55) |
| decoy walks away from the nearest predator | 43% (176) | 43% (176) | 39% (5385) | 45% (121) | 38% (55) |
| decoy walks toward the nearest prey | 28% (148) | 28% (148) | 31% (5188) | 28% (95) | 28% (53) |
| decoy: same point as the unit | 0% (177) | 0% (177) | 0% (5415) | 0% (122) | 0% (55) |
| decoy: same direction as the unit | 3% (177) | 3% (177) | 16% (5415) | 2% (122) | 5% (55) |
| decoy: opposite direction | 2% (177) | 2% (177) | 30% (5415) | 0% (122) | 5% (55) |
| decoy: sideways from the unit | 95% (177) | 95% (177) | 50% (5415) | 98% (122) | 89% (55) |

**Trigger table, turn 1: nearest free predator at this distance (start of the turn)**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 12 * | 92% (12) * | 0% (12) * | 0% (12) * | 100% (12) * | 75% (12) * | 0% (12) * | 0% (12) * | 538 | 18% (538) | 29% (538) | 22% (538) | 93% (538) | 72% (538) | 2% (538) | 16% (538) |
| 1000-1500 | 15 * | 73% (15) * | 13% (15) * | 0% (15) * | 100% (15) * | 73% (15) * | 0% (15) * | 7% (15) * | 937 | 14% (937) | 37% (937) | 17% (937) | 83% (937) | 57% (937) | 1% (937) | 14% (937) |
| 1500-2000 | 22 * | 59% (22) * | 0% (22) * | 0% (22) * | 86% (22) * | 64% (22) * | 5% (22) * | 9% (22) * | 1312 | 13% (1312) | 25% (1312) | 19% (1312) | 68% (1312) | 46% (1312) | 3% (1312) | 10% (1312) |
| 2000-2500 | 27 * | 19% (27) * | 4% (27) * | 0% (27) * | 85% (27) * | 44% (27) * | 11% (27) * | 0% (27) * | 1267 | 10% (1267) | 14% (1267) | 16% (1267) | 59% (1267) | 40% (1267) | 10% (1267) | 6% (1267) |
| 2500-3000 | 22 * | 0% (22) * | 0% (22) * | 0% (22) * | 59% (22) * | 14% (22) * | 32% (22) * | 0% (22) * | 1158 | 5% (1158) | 4% (1158) | 12% (1158) | 52% (1158) | 30% (1158) | 25% (1158) | 3% (1158) |

**Trigger table, turns 2+: nearest free predator at this distance**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 420 | 7% (420) | 4% (420) | 4% (420) | 25% (326) | 71% (364) | 12% (364) | 29% (420) | 33634 | 6% (33634) | 4% (33634) | 3% (33634) | 23% (28342) | 71% (30738) | 6% (30738) | 23% (33634) |
| 1000-1500 | 804 | 8% (804) | 9% (804) | 3% (804) | 27% (601) | 67% (761) | 8% (761) | 12% (804) | 42456 | 4% (42456) | 6% (42456) | 3% (42456) | 17% (33059) | 68% (40630) | 7% (40630) | 13% (42456) |
| 1500-2000 | 1012 | 4% (1012) | 7% (1012) | 2% (1012) | 22% (827) | 61% (982) | 11% (982) | 6% (1012) | 40486 | 3% (40486) | 5% (40486) | 2% (40486) | 13% (33439) | 53% (39233) | 11% (39233) | 7% (40486) |
| 2000-2500 | 1069 | 0% (1069) | 1% (1069) | 1% (1069) | 8% (908) | 48% (1046) | 21% (1046) | 3% (1069) | 40976 | 1% (40976) | 1% (40976) | 2% (40976) | 9% (35263) | 39% (40081) | 22% (40081) | 3% (40976) |
| 2500-3000 | 983 | 0% (983) | 0% (983) | 1% (983) | 5% (904) | 40% (964) | 27% (964) | 2% (983) | 40596 | 0% (40596) | 1% (40596) | 2% (40596) | 9% (35566) | 34% (39690) | 27% (39690) | 1% (40596) |

**Trigger table, turn 1: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 2 * | 0% (2) * | - (0) * | - (0) * | 100% (2) * | 50% (2) * | 50% (2) * | 205 | 24% (205) | - (0) * | - (0) * | 66% (205) | 89% (205) | 19% (205) |
| 800-1200 | 14 * | 0% (14) * | - (0) * | - (0) * | 100% (14) * | 100% (14) * | 14% (14) * | 619 | 23% (619) | - (0) * | - (0) * | 81% (619) | 88% (619) | 14% (619) |
| 1200-1600 | 16 * | 0% (16) * | - (0) * | - (0) * | 94% (16) * | 88% (16) * | 19% (16) * | 851 | 26% (851) | - (0) * | - (0) * | 87% (851) | 86% (851) | 12% (851) |
| 1600-2000 | 18 * | 0% (18) * | - (0) * | - (0) * | 94% (18) * | 83% (18) * | 28% (18) * | 1081 | 39% (1081) | - (0) * | - (0) * | 68% (1081) | 79% (1081) | 12% (1081) |
| 2000-2500 | 29 * | 0% (29) * | - (0) * | - (0) * | 79% (29) * | 76% (29) * | 14% (29) * | 1251 | 28% (1251) | - (0) * | - (0) * | 61% (1251) | 79% (1251) | 9% (1251) |

**Trigger table, turns 2+: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 446 | 1% (360) | 3% (29) * | 0% (57) | 14% (330) | 83% (446) | 32% (446) | 19456 | 1% (16367) | 7% (882) | 3% (2207) | 10% (14356) | 81% (19456) | 28% (19456) |
| 800-1200 | 767 | 1% (623) | 17% (106) | 0% (38) | 18% (570) | 87% (767) | 23% (767) | 33394 | 2% (27303) | 8% (4261) | 4% (1830) | 17% (26283) | 80% (33394) | 18% (33394) |
| 1200-1600 | 680 | 3% (517) | 9% (140) | 0% (23) * | 31% (570) | 78% (680) | 19% (680) | 37345 | 3% (28500) | 8% (7092) | 3% (1753) | 22% (32161) | 74% (37345) | 13% (37345) |
| 1600-2000 | 605 | 4% (478) | 8% (109) | 0% (18) * | 23% (550) | 68% (605) | 14% (605) | 35676 | 4% (29027) | 7% (5096) | 4% (1553) | 17% (32170) | 64% (35676) | 9% (35676) |
| 2000-2500 | 677 | 0% (576) | 0% (86) | 0% (15) * | 12% (626) | 55% (677) | 7% (677) | 43457 | 1% (36413) | 3% (5481) | 3% (1563) | 11% (39909) | 52% (43457) | 7% (43457) |

## 2. How its catches were made: ATI x iHot

**Catches by the team (columns: team / team new / catches by other seats / catches in its wins / in its non-wins)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| catches | 160 | 160 | 6646 | 119 | 41 |
| prey held by a net | 30% (160) | 30% (160) | 33% (6646) | 29% (119) | 34% (41) |
| prey held: net of the catching team | 88% (48) | 88% (48) | 92% (2162) | 82% (34) | 100% (14) * |
| prey held: net of the third team | 13% (48) | 13% (48) | 8% (2162) | 18% (34) | 0% (14) * |
| prey held: netted by the catching unit itself | 93% (42) | 93% (42) | 85% (1987) | 93% (28) * | 93% (14) * |
| turns from net to catch = 1 | 67% (48) | 67% (48) | 48% (2162) | 62% (34) | 79% (14) * |
| turns from net to catch = 2 | 25% (48) | 25% (48) | 30% (2162) | 29% (34) | 14% (14) * |
| turns from net to catch = 3 | 6% (48) | 6% (48) | 13% (2162) | 6% (34) | 7% (14) * |
| turns from net to catch = 4 | 2% (48) | 2% (48) | 9% (2162) | 3% (34) | 0% (14) * |
| catcher dashed | 31% (160) | 31% (160) | 40% (6646) | 32% (119) | 27% (41) |
| catcher dashed, prey held | 31% (48) | 31% (48) | 44% (2162) | 32% (34) | 29% (14) * |
| catcher dashed, prey free | 30% (112) | 30% (112) | 38% (4484) | 32% (85) | 26% (27) * |
| free prey: its dash was available and unused | 81% (112) | 81% (112) | 79% (4484) | 80% (85) | 85% (27) * |
| free prey: dashed this turn | 7% (112) | 7% (112) | 12% (4484) | 6% (85) | 11% (27) * |
| free prey: dash on cooldown | 12% (112) | 12% (112) | 9% (4484) | 14% (85) | 4% (27) * |
| free prey: moving toward the catcher | 36% (112) | 36% (112) | 46% (4484) | 39% (85) | 26% (27) * |
| free prey: was chasing its own prey | 5% (112) | 5% (112) | 6% (4484) | 5% (85) | 7% (27) * |
| start distance catcher-prey (q25 / median / q75) | 529 / 715 / 975 (159) | 529 / 715 / 975 (159) | 574 / 811 / 1119 (6587) | 543 / 734 / 976 (118) | 509 / 715 / 914 (41) |
| units of the team within 1800 of the prey: 1 | 71% (160) | 71% (160) | 70% (6646) | 71% (119) | 68% (41) |
| units within 1800: 2 | 28% (160) | 28% (160) | 27% (6646) | 26% (119) | 32% (41) |
| units within 1800: 3 or more | 2% (160) | 2% (160) | 3% (6646) | 3% (119) | 0% (41) |
| units within 1800 (mean) | 1.31 (160) | 1.31 (160) | 1.31 (6646) | 1.31 (119) | 1.32 (41) |
| prey at the wall (radius > 6500) | 21% (160) | 21% (160) | 20% (6646) | 19% (119) | 24% (41) |
| prey distance from the wall (q25 / median / q75) | 1826 / 3329 / 5234 (160) | 1826 / 3329 / 5234 (160) | 1919 / 3556 / 5187 (6646) | 1799 / 3209 / 5234 (119) | 2145 / 3541 / 5100 (41) |
| prey within 2500 of the centre | 21% (160) | 21% (160) | 21% (6646) | 21% (119) | 22% (41) |
| turn of the catch (q25 / median / q75) | 12 / 25 / 48 (160) | 12 / 25 / 48 (160) | 10 / 25 / 50 (6646) | 12 / 25 / 47 (119) | 13 / 24 / 56 (41) |
| catch by turn 10 | 21% (160) | 21% (160) | 27% (6646) | 20% (119) | 24% (41) |
| catch on turns 11-30 | 34% (160) | 34% (160) | 30% (6646) | 35% (119) | 32% (41) |
| catch after turn 60 | 17% (160) | 17% (160) | 18% (6646) | 15% (119) | 22% (41) |
| prey inside smoke of its own team | 29% (160) | 29% (160) | 23% (6646) | 30% (119) | 24% (41) |
| prey had a team-mate within 1500 | 10% (160) | 10% (160) | 14% (6646) | 9% (119) | 12% (41) |

**Net hits of the team on prey: conversion (caught within 5 turns)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| net hits on prey | 60 | 60 | 3171 | 35 | 25 |
| converted | 70% (60) | 70% (60) | 67% (3171) | 80% (35) | 56% (25) * |
| a free hunter within 1200 after the net | 68% (60) | 68% (60) | 57% (3171) | 69% (35) | 68% (25) * |
| a free hunter within 1800 | 85% (60) | 85% (60) | 81% (3171) | 89% (35) | 80% (25) * |
| converted when a hunter within 1800 | 80% (51) | 80% (51) | 73% (2564) | 90% (31) | 65% (20) * |
| converted when no hunter within 1800 | 11% (9) * | 11% (9) * | 39% (607) | 0% (4) * | 20% (5) * |
| distance of the nearest free hunter (q25 / median / q75) | 524 / 771 / 1218 (58) | 524 / 771 / 1218 (58) | 668 / 1044 / 1564 (3141) | 489 / 871 / 1288 (34) | 589 / 771 / 1218 (24) * |
| target was already held (re-net) | 3% (60) | 3% (60) | 6% (3171) | 0% (35) | 8% (25) * |

## 3. How its units were lost: ATI x iHot

**Units lost by the team (other seats: units lost by them)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| units lost | 123 | 123 | 6683 | 74 | 49 |
| held by a net | 30% (123) | 30% (123) | 33% (6683) | 18% (74) | 49% (49) |
| held: net of the predator team | 89% (37) | 89% (37) | 92% (2173) | 92% (13) * | 88% (24) * |
| held: net of the third team (its own prey) | 11% (37) | 11% (37) | 8% (2173) | 8% (13) * | 13% (24) * |
| held: net of its own team | 0% (37) | 0% (37) | 0% (2173) | 0% (13) * | 0% (24) * |
| turn (q25 / median / q75) | 16 / 33 / 62 (123) | 16 / 33 / 62 (123) | 10 / 25 / 50 (6683) | 20 / 43 / 71 (74) | 14 / 22 / 49 (49) |
| by turn 10 | 15% (123) | 15% (123) | 27% (6683) | 12% (74) | 18% (49) |
| turns 11-30 | 30% (123) | 30% (123) | 30% (6683) | 23% (74) | 41% (49) |
| after turn 60 | 28% (123) | 28% (123) | 18% (6683) | 36% (74) | 14% (49) |
| at the wall (radius > 6500) | 16% (123) | 16% (123) | 20% (6683) | 19% (74) | 12% (49) |
| within 2500 of the centre | 19% (123) | 19% (123) | 21% (6683) | 16% (74) | 22% (49) |
| the unit dashed on that turn | 14% (123) | 14% (123) | 8% (6683) | 16% (74) | 10% (49) |
| free unit: dashed on that turn | 20% (86) | 20% (86) | 12% (4510) | 20% (61) | 20% (25) * |
| free unit: dash available, not used | 66% (86) | 66% (86) | 79% (4510) | 67% (61) | 64% (25) * |
| free unit: dash on cooldown | 14% (86) | 14% (86) | 9% (4510) | 13% (61) | 16% (25) * |
| free unit: moving toward the catcher | 47% (86) | 47% (86) | 46% (4510) | 44% (61) | 52% (25) * |
| free unit: was chasing its own prey | 10% (86) | 10% (86) | 5% (4510) | 5% (61) | 24% (25) * |
| three or more dashes already spent | 69% (123) | 69% (123) | 60% (6683) | 70% (74) | 67% (49) |
| team used smoke in the 3 turns before | 18% (123) | 18% (123) | 24% (6683) | 18% (74) | 18% (49) |
| team used a decoy in the 3 turns before | 20% (123) | 20% (123) | 23% (6683) | 16% (74) | 27% (49) |
| team used smoke or decoy in the 3 turns before | 36% (123) | 36% (123) | 40% (6683) | 32% (74) | 41% (49) |
| inside a cloud of its own team (centre within 1900, last 9 turns) | 12% (123) | 12% (123) | 24% (6683) | 14% (74) | 10% (49) |
| the unit itself sent a decoy in the 3 turns before | 15% (123) | 15% (123) | 15% (6683) | 12% (74) | 20% (49) |
| team netted the catcher in the 3 turns before | 1% (123) | 1% (123) | 1% (6683) | 1% (74) | 0% (49) |
| catcher dashed | 49% (123) | 49% (123) | 39% (6683) | 51% (74) | 45% (49) |
| 2 or more hunters within 1800 | 26% (123) | 26% (123) | 30% (6683) | 32% (74) | 16% (49) |
| a team-mate within 1500 | 14% (123) | 14% (123) | 14% (6683) | 11% (74) | 18% (49) |

**Own units netted by the predator: what the team did in the next 3 turns**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| own units netted by the predator | 54 | 54 | 3177 | 27 | 27 |
| caught within 5 turns | 63% (54) | 63% (54) | 67% (3177) | 48% (27) * | 78% (27) * |
| smoke within 1900 of the unit | 41% (54) | 41% (54) | 29% (3177) | 52% (27) * | 30% (27) * |
| net on a unit of the predator team | 13% (54) | 13% (54) | 26% (3177) | 22% (27) * | 4% (27) * |
| the held unit sent a decoy | 15% (54) | 15% (54) | 21% (3177) | 15% (27) * | 15% (27) * |
| caught, with smoke | 50% (22) * | 50% (22) * | 50% (933) | 50% (14) * | 50% (8) * |
| caught, without smoke | 72% (32) | 72% (32) | 74% (2244) | 46% (13) * | 89% (19) * |
| caught, with a counter-net | 29% (7) * | 29% (7) * | 41% (836) | 33% (6) * | 0% (1) * |
| caught, without a counter-net | 68% (47) | 68% (47) | 76% (2341) | 52% (21) * | 81% (26) * |
| a free hunter within 1800 at the net | 91% (54) | 91% (54) | 81% (3177) | 85% (27) * | 96% (27) * |

## 4. Ghosts: ATI x iHot

**Ghost-turns (unit caught earlier, team still has living units)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| ghost-turns with an order | 100% (6517) | 100% (6517) | 96% (361364) | 100% (3724) | 100% (2793) |
| moving (order further than 60) | 79% (3218) | 79% (3218) | 90% (170220) | 80% (1904) | 79% (1314) |
| dashing | 0% (6517) | 0% (6517) | 0% (361364) | 0% (3724) | 0% (2793) |
| order aimed within 1000 of a living prey | 26% (2556) | 26% (2556) | 27% (152896) | 18% (1516) | 38% (1040) |
| order aimed within 1000 of a living predator | 13% (2556) | 13% (2556) | 12% (152896) | 15% (1516) | 10% (1040) |
| order aimed within 1000 of a living team-mate | 5% (2556) | 5% (2556) | 3% (152896) | 3% (1516) | 7% (1040) |
| order aimed at none of these | 56% (2556) | 56% (2556) | 58% (152896) | 63% (1516) | 45% (1040) |
| aimed at prey: that prey is held by a net | 1% (676) | 1% (676) | 4% (40892) | 1% (276) | 2% (400) |
| aimed at prey: a living hunter of ours within 2500 of it | 38% (676) | 38% (676) | 51% (40892) | 32% (276) | 42% (400) |
| aimed at predator: a living team-mate within 2500 of it | 22% (329) | 22% (329) | 36% (17902) | 16% (228) | 34% (101) |
| moving toward the nearest living prey | 46% (2556) | 46% (2556) | 47% (152896) | 37% (1516) | 60% (1040) |
| moving toward the nearest living predator | 36% (2556) | 36% (2556) | 36% (152896) | 35% (1516) | 37% (1040) |
| position within 2000 of a living prey | 33% (3218) | 33% (3218) | 33% (170220) | 24% (1904) | 45% (1314) |
| position within 2000 of a living predator | 35% (3218) | 35% (3218) | 38% (170220) | 36% (1904) | 33% (1314) |
| position within 2000 of a living team-mate | 20% (3218) | 20% (3218) | 24% (170220) | 15% (1904) | 27% (1314) |
| position within 2000 of nobody | 38% (3218) | 38% (3218) | 33% (170220) | 44% (1904) | 29% (1314) |
| median distance to the nearest living prey | 2375 (2527) | 2375 (2527) | 2875 (156052) | 2625 (1235) | 2375 (1292) |
| median distance to the nearest living predator | 2625 (3131) | 2625 (3131) | 2625 (166191) | 2625 (1876) | 2625 (1255) |

## 5. Three units against six: ATI x iHot

| | team, 3 units | team, 4 units | team, 5 units | team, 6 units | others, 3 units | others, 4 units | others, 5 units | others, 6 units |
|---|---|---|---|---|---|---|---|---|
| games | 10 | 20 | 11 | 6 | 560 | 574 | 577 | 546 |
| wins | 60% (10) * | 80% (20) * | 55% (11) * | 50% (6) * | 33% (560) | 32% (574) | 33% (577) | 33% (546) |
| last place | 10% (10) * | 15% (20) * | 0% (11) * | 50% (6) * | 34% (560) | 34% (574) | 34% (577) | 33% (546) |
| mean rank | 1.50 (10) * | 1.35 (20) * | 1.45 (11) * | 2.00 (6) * | 2.01 (560) | 2.02 (574) | 2.01 (577) | 2.00 (546) |
| catches per game | 2.30 (10) * | 3.35 (20) * | 4.09 (11) * | 4.17 (6) * | 1.73 (560) | 2.54 (574) | 3.37 (577) | 4.17 (546) |
| catches per unit of the prey team | 0.77 (10) * | 0.84 (20) * | 0.82 (11) * | 0.69 (6) * | 0.58 (560) | 0.64 (574) | 0.67 (577) | 0.70 (546) |
| units lost per game | 1.90 (10) * | 2.15 (20) * | 3.00 (11) * | 4.67 (6) * | 1.74 (560) | 2.58 (574) | 3.39 (577) | 4.16 (546) |
| share of own units lost | 0.63 (10) * | 0.54 (20) * | 0.60 (11) * | 0.78 (6) * | 0.58 (560) | 0.65 (574) | 0.68 (577) | 0.69 (546) |
| catches by turn 10 | 0.80 (10) * | 0.50 (20) * | 1.00 (11) * | 0.83 (6) * | 0.36 (560) | 0.65 (574) | 0.91 (577) | 1.23 (546) |
| units lost by turn 10 | 0.10 (10) * | 0.45 (20) * | 0.09 (11) * | 1.17 (6) * | 0.38 (560) | 0.65 (574) | 0.92 (577) | 1.22 (546) |
| first catch turn (median) | 4 (10) * | 11 (20) * | 5 (11) * | 21 (6) * | 17 (488) | 10 (548) | 7 (564) | 6 (536) |
| made the first catch of the game | 80% (10) * | 55% (20) * | 36% (11) * | 17% (6) * | 33% (560) | 33% (574) | 33% (577) | 34% (546) |
| nets per game | 2.60 (10) * | 3.00 (20) * | 3.73 (11) * | 4.17 (6) * | 2.54 (560) | 3.79 (574) | 4.89 (577) | 5.87 (546) |
| nets in turns 1-3 | 0.40 (10) * | 0.10 (20) * | 0.45 (11) * | 0.00 (6) * | 0.73 (560) | 1.29 (574) | 1.80 (577) | 2.30 (546) |
| smoke per game | 2.30 (10) * | 3.70 (20) * | 4.91 (11) * | 5.00 (6) * | 1.91 (560) | 2.61 (574) | 3.44 (577) | 4.19 (546) |
| smoke in turns 1-5 | 0.80 (10) * | 1.15 (20) * | 1.91 (11) * | 2.00 (6) * | 0.39 (560) | 0.60 (574) | 0.86 (577) | 1.12 (546) |
| decoys per game | 2.40 (10) * | 4.15 (20) * | 4.36 (11) * | 5.67 (6) * | 2.32 (560) | 3.31 (574) | 4.56 (577) | 5.27 (546) |
| decoys in turns 1-5 | 0.00 (10) * | 0.35 (20) * | 0.18 (11) * | 0.50 (6) * | 0.73 (560) | 1.17 (574) | 1.80 (577) | 2.15 (546) |
| dashes per unit, whole game | 4.23 (10) * | 5.16 (20) * | 5.78 (11) * | 4.64 (6) * | 4.83 (560) | 4.93 (574) | 4.81 (577) | 4.71 (546) |
| turn 1: units dashing | 70% (23) * | 59% (69) | 80% (49) | 72% (32) | 53% (1552) | 60% (2151) | 58% (2783) | 66% (3202) |
| turn 1: toward nearest prey | 87% (23) * | 77% (69) | 73% (49) | 72% (32) | 75% (1552) | 72% (2151) | 71% (2783) | 71% (3202) |
| turn 1: away from nearest predator | 35% (23) * | 29% (69) | 41% (49) | 31% (32) | 26% (1552) | 32% (2151) | 32% (2783) | 36% (3202) |
| net hits prey | 54% (26) * | 37% (60) | 41% (41) | 28% (25) * | 31% (1422) | 34% (2177) | 32% (2824) | 33% (3206) |
| nets aimed at predators | 27% (26) * | 38% (60) | 41% (41) | 40% (25) * | 29% (1422) | 26% (2177) | 27% (2824) | 29% (3206) |
| catches: prey held by a net | 39% (23) * | 34% (67) | 24% (45) | 20% (25) * | 33% (969) | 35% (1458) | 31% (1942) | 32% (2277) |
| catches: catcher dashed | 30% (23) * | 22% (67) | 33% (45) | 48% (25) * | 42% (969) | 40% (1458) | 40% (1942) | 39% (2277) |
| losses: held by a net | 37% (19) * | 26% (43) | 33% (33) | 29% (28) * | 33% (973) | 35% (1482) | 31% (1954) | 32% (2274) |
| tie on catches for first place | 40% (10) * | 25% (20) * | 27% (11) * | 17% (6) * | 21% (560) | 25% (574) | 22% (577) | 18% (546) |

## 6. Ahead, level, behind on catches: ATI x iHot

State at the start of the turn: own catches against the better of the two other teams. Left block: the team (all games). Right block: other seats of the new folder.

**turns 6-30**

| | team ahead | team level | team behind | others ahead | others level | others behind |
|---|---|---|---|---|---|---|
| unit-turns | 1765 | 978 | 1455 | 45931 | 58076 | 86631 |
| dash when available | 8% (1595) | 11% (838) | 11% (1262) | 10% (39639) | 12% (49300) | 12% (73737) |
| nets per 100 unit-turns | 0.6 (1765) | 1.9 (978) | 0.9 (1455) | 1.7 (45931) | 2.3 (58076) | 2.4 (86631) |
| net when prey within 2000 | 2% (318) | 5% (301) | 3% (483) | 5% (8177) | 6% (13838) | 5% (25421) |
| smoke per 100 | 2.0 (1765) | 1.1 (978) | 1.6 (1455) | 1.7 (45931) | 1.6 (58076) | 1.4 (86631) |
| decoys per 100 | 1.9 (1765) | 1.6 (978) | 2.2 (1455) | 1.9 (45931) | 2.0 (58076) | 1.7 (86631) |
| median distance to nearest predator | 3375 (1653) | 3125 (923) | 3625 (1406) | 3125 (44854) | 3375 (55839) | 3375 (82319) |
| predator within 1800 | 17% (1653) | 18% (923) | 15% (1406) | 24% (44854) | 21% (55839) | 19% (82319) |
| median distance to nearest prey | 4125 (1600) | 3125 (923) | 2875 (1406) | 3875 (43313) | 3375 (55868) | 2875 (84079) |
| prey within 3000: moving toward it | 65% (530) | 71% (406) | 61% (677) | 58% (14045) | 58% (22487) | 58% (40535) |
| prey within 3000: dash | 17% (452) | 19% (352) | 18% (573) | 16% (12168) | 18% (19352) | 17% (35089) |
| predator within 3000: moving away | 47% (625) | 42% (373) | 46% (514) | 47% (19955) | 46% (22754) | 46% (31200) |
| predator within 3000: moving toward it | 20% (625) | 23% (373) | 22% (514) | 19% (19955) | 19% (22754) | 19% (31200) |
| predator within 3000: dash | 16% (546) | 15% (330) | 18% (441) | 14% (17433) | 17% (19640) | 17% (27015) |
| standing still | 6% (1719) | 6% (915) | 4% (1399) | 6% (43999) | 5% (55063) | 5% (82123) |

**turns 31-100**

| | team ahead | team level | team behind | others ahead | others level | others behind |
|---|---|---|---|---|---|---|
| unit-turns | 4149 | 1101 | 2174 | 97588 | 68789 | 150169 |
| dash when available | 5% (3911) | 7% (1025) | 8% (1997) | 5% (92054) | 6% (64237) | 7% (139732) |
| nets per 100 unit-turns | 1.1 (4149) | 1.5 (1101) | 1.6 (2174) | 0.2 (97588) | 0.3 (68789) | 0.4 (150169) |
| net when prey within 2000 | 5% (244) | 5% (198) | 4% (817) | 1% (9721) | 1% (14893) | 1% (49108) |
| smoke per 100 | 0.7 (4149) | 0.7 (1101) | 0.4 (2174) | 0.9 (97588) | 0.8 (68789) | 0.6 (150169) |
| decoys per 100 | 1.1 (4149) | 2.0 (1101) | 1.2 (2174) | 0.6 (97588) | 0.7 (68789) | 0.5 (150169) |
| median distance to nearest predator | 2875 (3366) | 3625 (869) | 4125 (1341) | 2875 (78044) | 3125 (57882) | 3625 (99806) |
| predator within 1800 | 24% (3366) | 18% (869) | 13% (1341) | 32% (78044) | 25% (57882) | 20% (99806) |
| median distance to nearest prey | 5125 (1774) | 4125 (909) | 2375 (1837) | 4375 (54718) | 3375 (56790) | 2625 (127162) |
| prey within 3000: moving toward it | 64% (446) | 73% (306) | 81% (1088) | 63% (17129) | 68% (24117) | 73% (71627) |
| prey within 3000: dash | 15% (393) | 15% (268) | 14% (968) | 11% (15516) | 11% (21833) | 11% (64874) |
| predator within 3000: moving away | 65% (1695) | 54% (342) | 49% (435) | 62% (39439) | 56% (26431) | 55% (39575) |
| predator within 3000: moving toward it | 12% (1695) | 14% (342) | 19% (435) | 11% (39439) | 14% (26431) | 15% (39575) |
| predator within 3000: dash | 12% (1512) | 14% (304) | 13% (390) | 11% (35673) | 11% (23898) | 11% (35768) |
| standing still | 2% (4124) | 6% (1095) | 3% (2147) | 10% (97041) | 5% (68250) | 5% (148976) |

## 7. Games it did not win: ATI x iHot

Non-wins: 16 of 47 (second 9, last 7). Winner was its **prey team** in 10 (63%), its **predator team** in 6 (38%). Other seats of the new folder: prey team won 50% of their non-wins.

First thing that went wrong in the non-wins (exclusive, in this order): lost a unit by turn 10: 6 (38%); no catch by turn 20: 3 (19%); level on catches with the winner, lost the tie-break: 2 (13%); fewer catches than the winner, none of the above: 5 (31%).

**The same events in wins and in non-wins**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| games | 47 | 47 | 2257 | 31 | 16 |
| lost a unit by turn 10 | 28% (47) | 28% (47) | 56% (2257) | 23% (31) | 38% (16) * |
| lost a unit by turn 20 | 57% (47) | 57% (47) | 73% (2257) | 48% (31) | 75% (16) * |
| no catch by turn 10 | 45% (47) | 45% (47) | 44% (2257) | 42% (31) | 50% (16) * |
| no catch by turn 20 | 17% (47) | 17% (47) | 27% (2257) | 10% (31) | 31% (16) * |
| made the first catch of the game | 51% (47) | 51% (47) | 33% (2257) | 65% (31) | 25% (16) * |
| its first event: lost a unit before any catch | 23% (47) | 23% (47) | 45% (2257) | 13% (31) | 44% (16) * |
| its first event: caught before losing | 72% (47) | 72% (47) | 50% (2257) | 84% (31) | 50% (16) * |
| level on catches for first place | 28% (47) | 28% (47) | 22% (2257) | 32% (31) | 19% (16) * |
| level on catches for first place: won the tie-break | 77% (13) * | 77% (13) * | 47% (486) | 100% (10) * | 0% (3) * |
| eliminated (all units lost) | 13% (47) | 13% (47) | 25% (2257) | 10% (31) | 19% (16) * |
| catches | 3.40 (47) | 3.40 (47) | 2.94 (2257) | 3.84 (31) | 2.56 (16) * |
| units lost | 2.62 (47) | 2.62 (47) | 2.96 (2257) | 2.39 (31) | 3.06 (16) * |
| catches by turn 10 | 0.72 (47) | 0.72 (47) | 0.78 (2257) | 0.77 (31) | 0.63 (16) * |
| catches by turn 20 | 1.38 (47) | 1.38 (47) | 1.29 (2257) | 1.55 (31) | 1.06 (16) * |
| units lost by turn 10 | 0.38 (47) | 0.38 (47) | 0.79 (2257) | 0.29 (31) | 0.56 (16) * |
| first catch turn (median) | 8 (47) | 8 (47) | 8 (2136) | 8 (31) | 13 (16) * |
| first loss turn (median) | 17 (45) | 17 (45) | 8 (2138) | 22 (30) | 12 (15) * |
| catches of its predator team | 2.62 (47) | 2.62 (47) | 2.96 (2257) | 2.39 (31) | 3.06 (16) * |
| catches of its prey team | 2.55 (47) | 2.55 (47) | 2.96 (2257) | 2.03 (31) | 3.56 (16) * |
| nets in turns 1-3 | 0.23 (47) | 0.23 (47) | 1.53 (2257) | 0.23 (31) | 0.25 (16) * |
| nets whole game | 3.23 (47) | 3.23 (47) | 4.27 (2257) | 3.32 (31) | 3.06 (16) * |
| smoke whole game | 3.85 (47) | 3.85 (47) | 3.03 (2257) | 4.19 (31) | 3.19 (16) * |
| decoys whole game | 4.02 (47) | 4.02 (47) | 3.86 (2257) | 4.19 (31) | 3.69 (16) * |
| dashes on turn 1 | 2.53 (47) | 2.53 (47) | 2.58 (2257) | 2.61 (31) | 2.38 (16) * |
| dashes whole game per unit | 5.04 (47) | 5.04 (47) | 4.82 (2257) | 5.27 (31) | 4.61 (16) * |
| seat 0 | 43% (47) | 43% (47) | 33% (2257) | 48% (31) | 31% (16) * |
| seat 1 | 17% (47) | 17% (47) | 34% (2257) | 13% (31) | 25% (16) * |
| seat 2 | 40% (47) | 40% (47) | 33% (2257) | 39% (31) | 44% (16) * |
| units per team (mean) | 4.28 (47) | 4.28 (47) | 4.49 (2257) | 4.19 (31) | 4.44 (16) * |

**Win rate with and without each event**

| Event | team win % with it | team win % without it | others with it | others without it |
|---|---|---|---|---|
| lost a unit by turn 10 | 54% (13) * | 71% (34) | 24% (1267) | 44% (990) |
| lost a unit by turn 20 | 56% (27) * | 80% (20) * | 26% (1653) | 50% (604) |
| a catch by turn 10 | 69% (26) * | 62% (21) * | 42% (1254) | 21% (1003) |
| a catch by turn 20 | 72% (39) | 38% (8) * | 39% (1641) | 16% (616) |
| made the first catch of the game | 83% (24) * | 48% (23) * | 50% (744) | 24% (1513) |
| lost a unit before any catch | 36% (11) * | 75% (36) | 16% (1014) | 47% (1243) |
| level on catches for first place | 77% (13) * | 62% (34) | 47% (486) | 29% (1771) |
| seat 0 | 75% (20) * | 59% (27) * | 34% (748) | 32% (1509) |
| seat 1 | 50% (8) * | 69% (39) | 31% (760) | 34% (1497) |
| seat 2 | 63% (19) * | 68% (28) * | 34% (749) | 32% (1508) |
| 3 units | 60% (10) * | 68% (37) | 33% (560) | 33% (1697) |
| 4 units | 80% (20) * | 56% (27) * | 32% (574) | 33% (1683) |
| 5 units | 55% (11) * | 69% (36) | 33% (577) | 33% (1680) |
| 6 units | 50% (6) * | 68% (41) | 33% (546) | 32% (1711) |

**By the team that hunts it** (6 games or more)

| Opponent | games | team wins | opponent wins | team catches | team units lost |
|---|---|---|---|---|---|
| FullStuck | 8 * | 50% | 13% | 3.75 | 3.50 |
| Kogaion | 8 * | 75% | 13% | 3.38 | 2.63 |

**By the team it hunts** (6 games or more)

| Opponent | games | team wins | opponent wins | team catches | team units lost |
|---|---|---|---|---|---|
| Les Gens Bons | 9 * | 67% | 22% | 3.89 | 3.33 |
| FullStuck | 7 * | 71% | 14% | 3.71 | 1.71 |

## 8. Other observations: ATI x iHot

**Living unit-turns, whole game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| unit-turns | 12620 | 12620 | 556548 | 9028 | 3592 |
| held by a net | 2% (12620) | 2% (12620) | 3% (556548) | 2% (9028) | 3% (3592) |
| dash when available | 9% (11383) | 9% (11383) | 10% (493711) | 8% (8219) | 11% (3164) |
| standing still (free units) | 4% (12359) | 4% (12359) | 6% (540895) | 3% (8876) | 5% (3483) |
| predator within 1800 | 19% (10397) | 19% (10397) | 24% (464222) | 20% (7637) | 19% (2760) |
| predator within 1200 | 8% (10397) | 8% (10397) | 12% (464222) | 8% (7637) | 8% (2760) |
| median distance to nearest predator | 3375 (10397) | 3375 (10397) | 3125 (464222) | 3125 (7637) | 3375 (2760) |
| median distance to nearest prey | 3375 (9286) | 3375 (9286) | 3125 (467420) | 3625 (6212) | 2875 (3074) |
| prey within 2000 | 29% (9286) | 29% (9286) | 29% (467420) | 25% (6212) | 36% (3074) |
| net when prey within 2000 | 4% (2669) | 4% (2669) | 4% (136827) | 3% (1557) | 4% (1112) |
| predator within 3000: away | 54% (4432) | 54% (4432) | 52% (201676) | 56% (3368) | 47% (1064) |
| predator within 3000: toward | 17% (4432) | 17% (4432) | 15% (201676) | 17% (3368) | 19% (1064) |
| predator within 3000: sideways | 26% (4432) | 26% (4432) | 31% (201676) | 25% (3368) | 30% (1064) |
| predator within 3000: dash when available | 17% (3844) | 17% (3844) | 16% (175568) | 16% (2942) | 20% (902) |
| predator within 3000: smoke | 4% (4432) | 4% (4432) | 3% (201676) | 3% (3368) | 5% (1064) |
| predator within 3000: decoy | 4% (4432) | 4% (4432) | 4% (201676) | 4% (3368) | 5% (1064) |
| predator within 3000: net | 2% (4432) | 2% (4432) | 2% (201676) | 2% (3368) | 2% (1064) |
| prey within 3000: toward | 70% (3913) | 70% (3913) | 65% (213299) | 67% (2434) | 75% (1479) |
| prey within 3000: away | 12% (3913) | 12% (3913) | 14% (213299) | 14% (2434) | 10% (1479) |
| prey within 3000: dash when available | 20% (3316) | 20% (3316) | 16% (185487) | 19% (2072) | 20% (1244) |
| DASH orders that were not executed (cooldown) | 0% (1025) | 0% (1025) | 0% (48789) | 0% (691) | 0% (334) |
| dashes: fleeing (predator within 2000, moving away) | 33% (1025) | 33% (1025) | 24% (48722) | 37% (691) | 25% (334) |
| dashes: attacking (prey within 2500, moving toward) | 45% (1025) | 45% (1025) | 39% (48722) | 40% (691) | 57% (334) |
| dashes: travelling (neither) | 22% (1025) | 22% (1025) | 37% (48722) | 24% (691) | 18% (334) |

**Nets aimed at units of this team (by anyone)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets aimed at its units | 171 | 171 | 8949 | 101 | 70 |
| hit the unit | 51% (171) | 51% (171) | 58% (8949) | 45% (101) | 60% (70) |
| absorbed by a decoy | 8% (171) | 8% (171) | 8% (8949) | 5% (101) | 11% (70) |
| unit could dash | 78% (171) | 78% (171) | 71% (8949) | 79% (101) | 77% (70) |
| hit when the unit could dash | 43% (126) | 43% (126) | 51% (5925) | 37% (75) | 51% (51) |
| hit when its dash was on cooldown | 73% (37) | 73% (37) | 71% (2564) | 62% (21) * | 88% (16) * |
| the unit dashed on that turn | 50% (171) | 50% (171) | 29% (8949) | 57% (101) | 40% (70) |
| hit when it dashed that turn | 28% (86) | 28% (86) | 30% (2621) | 29% (58) | 25% (28) * |
| hit when it did not dash | 74% (77) | 74% (77) | 69% (5868) | 63% (38) | 85% (39) |
| thrown by its predator team | 75% (171) | 75% (171) | 70% (8949) | 77% (101) | 71% (70) |
| thrown by turn 5 | 30% (171) | 30% (171) | 47% (8949) | 37% (101) | 21% (70) |

**Trigger table, all turns: nearest free predator at this distance**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 432 | 9% (432) | 4% (432) | 4% (432) | 28% (338) | 72% (376) | 12% (376) | 28% (432) | 34172 | 6% (34172) | 5% (34172) | 3% (34172) | 24% (28880) | 71% (31276) | 6% (31276) | 23% (34172) |
| 1000-1500 | 819 | 9% (819) | 10% (819) | 3% (819) | 28% (616) | 67% (776) | 8% (776) | 12% (819) | 43393 | 5% (43393) | 6% (43393) | 3% (43393) | 18% (33996) | 67% (41567) | 7% (41567) | 13% (43393) |
| 1500-2000 | 1034 | 5% (1034) | 7% (1034) | 2% (1034) | 23% (849) | 61% (1004) | 11% (1004) | 6% (1034) | 41798 | 3% (41798) | 6% (41798) | 3% (41798) | 15% (34751) | 53% (40545) | 11% (40545) | 7% (41798) |
| 2000-2500 | 1096 | 0% (1096) | 1% (1096) | 1% (1096) | 10% (935) | 48% (1073) | 21% (1073) | 3% (1096) | 42243 | 1% (42243) | 2% (42243) | 2% (42243) | 11% (36530) | 39% (41348) | 22% (41348) | 3% (42243) |
| 2500-3000 | 1005 | 0% (1005) | 0% (1005) | 1% (1005) | 6% (926) | 39% (986) | 27% (986) | 1% (1005) | 41754 | 1% (41754) | 1% (41754) | 2% (41754) | 10% (36724) | 34% (40848) | 27% (40848) | 1% (41754) |

**Trigger table, all turns: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 448 | 1% (362) | 3% (29) * | 0% (57) | 14% (332) | 83% (448) | 32% (448) | 19661 | 2% (16572) | 7% (882) | 3% (2207) | 11% (14561) | 81% (19661) | 28% (19661) |
| 800-1200 | 781 | 1% (637) | 17% (106) | 0% (38) | 20% (584) | 87% (781) | 23% (781) | 34013 | 3% (27922) | 8% (4261) | 4% (1830) | 18% (26902) | 80% (34013) | 18% (34013) |
| 1200-1600 | 696 | 3% (533) | 9% (140) | 0% (23) * | 32% (586) | 78% (696) | 19% (696) | 38196 | 4% (29351) | 8% (7092) | 3% (1753) | 24% (33012) | 75% (38196) | 13% (38196) |
| 1600-2000 | 623 | 4% (496) | 8% (109) | 0% (18) * | 25% (568) | 69% (623) | 14% (623) | 36757 | 5% (30108) | 7% (5096) | 4% (1553) | 19% (33251) | 65% (36757) | 9% (36757) |
| 2000-2500 | 706 | 0% (605) | 0% (86) | 0% (15) * | 15% (655) | 56% (706) | 8% (706) | 44708 | 2% (37664) | 3% (5481) | 3% (1563) | 12% (41160) | 52% (44708) | 7% (44708) |

**All nets of the game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets | 152 | 152 | 9629 | 103 | 49 |
| hit prey | 39% (152) | 39% (152) | 33% (9629) | 34% (103) | 51% (49) |
| hit predator | 28% (152) | 28% (152) | 21% (9629) | 36% (103) | 10% (49) |
| absorbed by a decoy | 3% (152) | 3% (152) | 12% (9629) | 0% (103) | 10% (49) |
| aimed at predators | 38% (152) | 38% (152) | 28% (9629) | 46% (103) | 20% (49) |
| no enemy near the line | 2% (152) | 2% (152) | 7% (9629) | 3% (103) | 0% (49) |
| thrown while held | 15% (152) | 15% (152) | 13% (9629) | 15% (103) | 16% (49) |
| thrown when ahead | 36% (152) | 36% (152) | 12% (9629) | 49% (103) | 10% (49) |
| thrown when behind | 32% (152) | 32% (152) | 33% (9629) | 19% (103) | 57% (49) |
| turn (q25 / median / q75) | 14 / 42 / 63 (152) | 14 / 42 / 63 (152) | 2 / 6 / 17 (9629) | 15 / 44 / 75 (103) | 13 / 40 / 57 (49) |

---

# Les Gens Bons

## 1. Opening (turns 1-5): Les Gens Bons

**Turn 1, per unit (direction of the order relative to the nearest predator start / nearest prey start; cos > 0.5 away, < -0.5 toward)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| units | 1275 | 536 | 9325 | 659 | 616 |
| dash on turn 1 | 49% (1275) | 41% (536) | 61% (9325) | 48% (659) | 50% (616) |
| dash on turn 1, nearest predator under 2000 | 73% (382) | 61% (175) | 80% (2641) | 72% (183) | 74% (199) |
| dash on turn 1, nearest predator 2000-3500 | 50% (400) | 43% (167) | 56% (3242) | 53% (199) | 46% (201) |
| dash on turn 1, nearest predator over 3500 | 29% (493) | 23% (194) | 52% (3442) | 29% (277) | 30% (216) |
| dash on turn 1, nearest prey under 2000 | 71% (363) | 56% (166) | 79% (2621) | 73% (182) | 69% (181) |
| dash on turn 1, nearest prey 2000-3500 | 53% (419) | 41% (174) | 58% (3242) | 52% (207) | 55% (212) |
| dash on turn 1, nearest prey over 3500 | 29% (493) | 30% (196) | 50% (3462) | 29% (270) | 29% (223) |
| vs predator: away | 41% (1275) | 47% (536) | 32% (9325) | 39% (659) | 43% (616) |
| vs predator: toward | 24% (1275) | 23% (536) | 28% (9325) | 24% (659) | 25% (616) |
| vs predator: sideways | 34% (1275) | 29% (536) | 40% (9325) | 37% (659) | 32% (616) |
| vs predator: no move | 0% (1275) | 1% (536) | 0% (9325) | 0% (659) | 0% (616) |
| vs prey: toward | 67% (1275) | 60% (536) | 73% (9325) | 70% (659) | 64% (616) |
| vs prey: away | 13% (1275) | 18% (536) | 10% (9325) | 12% (659) | 15% (616) |
| vs prey: sideways | 19% (1275) | 21% (536) | 16% (9325) | 17% (659) | 21% (616) |
| predator under 2000: away from it | 57% (382) | 60% (175) | 55% (2641) | 55% (183) | 58% (199) |
| predator under 2000: toward nearest prey | 52% (382) | 53% (175) | 57% (2641) | 52% (183) | 51% (199) |
| predator over 3500: toward nearest prey | 83% (493) | 71% (194) | 83% (3442) | 83% (277) | 83% (216) |
| prey nearer than predator: toward prey | 81% (613) | 72% (258) | 85% (4550) | 84% (316) | 78% (297) |
| predator nearer than prey: away from predator | 49% (638) | 57% (268) | 39% (4641) | 45% (333) | 53% (305) |
| prey under 2000: toward it | 79% (363) | 77% (166) | 85% (2621) | 82% (182) | 75% (181) |
| prey under 2000: dash toward it | 60% (363) | 47% (166) | 70% (2621) | 63% (182) | 57% (181) |
| dashers: toward prey | 69% (623) | 66% (222) | 77% (5710) | 70% (318) | 67% (305) |
| dashers: away from predator | 46% (623) | 47% (222) | 36% (5710) | 45% (318) | 47% (305) |
| toward the centre | 44% (1275) | 41% (536) | 52% (9325) | 46% (659) | 41% (616) |
| toward the wall | 22% (1275) | 25% (536) | 18% (9325) | 21% (659) | 24% (616) |

**Turn 1, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 46% (1368) | 37% (597) | 59% (9741) | 45% (714) | 47% (654) |
| toward nearest prey (any distance) | 67% (1293) | 59% (547) | 73% (9484) | 70% (669) | 64% (624) |
| away from nearest predator (any distance) | 41% (1293) | 47% (547) | 31% (9484) | 38% (669) | 43% (624) |
| toward nearest predator | 24% (1293) | 23% (547) | 28% (9484) | 24% (669) | 25% (624) |
| median distance to nearest predator | 2875 (1293) | 2625 (547) | 2875 (9513) | 2875 (669) | 2625 (624) |
| median distance to nearest prey | 2875 (1293) | 2875 (547) | 2875 (9512) | 3125 (669) | 2875 (624) |
| predator within 1800 | 25% (1293) | 27% (547) | 23% (9513) | 22% (669) | 27% (624) |
| prey within 2000 | 28% (1293) | 30% (547) | 28% (9512) | 27% (669) | 29% (624) |
| net thrown when prey within 2000 | 68% (365) | 69% (166) | 27% (2640) | 69% (183) | 66% (182) |
| held by a net | 0% (1368) | 0% (597) | 0% (9741) | 0% (714) | 0% (654) |

**Turn 2, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 14% (1303) | 18% (567) | 7% (9329) | 13% (684) | 14% (619) |
| toward nearest prey (any distance) | 60% (1002) | 60% (410) | 59% (8190) | 64% (517) | 56% (485) |
| away from nearest predator (any distance) | 43% (1002) | 48% (410) | 36% (8190) | 40% (517) | 47% (485) |
| toward nearest predator | 21% (1002) | 20% (410) | 27% (8190) | 23% (517) | 19% (485) |
| median distance to nearest predator | 2375 (1060) | 2375 (433) | 2625 (8654) | 2625 (545) | 2375 (515) |
| median distance to nearest prey | 2375 (1063) | 2375 (431) | 2375 (8664) | 2125 (547) | 2375 (516) |
| predator within 1800 | 33% (1060) | 35% (433) | 32% (8654) | 32% (545) | 36% (515) |
| prey within 2000 | 43% (1063) | 45% (431) | 39% (8664) | 46% (547) | 41% (516) |
| net thrown when prey within 2000 | 45% (461) | 38% (193) | 27% (3404) | 44% (250) | 46% (211) |
| held by a net | 4% (1359) | 4% (588) | 4% (9716) | 4% (712) | 4% (647) |

**Turn 3, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 22% (1180) | 21% (515) | 38% (8560) | 22% (628) | 22% (552) |
| toward nearest prey (any distance) | 58% (916) | 57% (378) | 54% (7613) | 62% (481) | 54% (435) |
| away from nearest predator (any distance) | 43% (916) | 46% (378) | 37% (7613) | 42% (481) | 44% (435) |
| toward nearest predator | 23% (916) | 19% (378) | 27% (7613) | 22% (481) | 24% (435) |
| median distance to nearest predator | 2375 (1083) | 2375 (445) | 2625 (8792) | 2625 (560) | 2375 (523) |
| median distance to nearest prey | 2125 (1085) | 2125 (444) | 2375 (8794) | 2375 (562) | 2125 (523) |
| predator within 1800 | 30% (1083) | 30% (445) | 31% (8792) | 26% (560) | 34% (523) |
| prey within 2000 | 45% (1085) | 45% (444) | 39% (8794) | 46% (562) | 44% (523) |
| net thrown when prey within 2000 | 18% (488) | 15% (201) | 13% (3424) | 17% (256) | 20% (232) |
| held by a net | 12% (1346) | 11% (581) | 11% (9636) | 11% (707) | 14% (639) |

**Turn 4, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 13% (1134) | 15% (494) | 12% (8222) | 14% (602) | 12% (532) |
| toward nearest prey (any distance) | 52% (895) | 51% (374) | 50% (7366) | 53% (470) | 50% (425) |
| away from nearest predator (any distance) | 41% (895) | 42% (374) | 37% (7366) | 44% (470) | 38% (425) |
| toward nearest predator | 22% (895) | 23% (374) | 27% (7366) | 21% (470) | 24% (425) |
| median distance to nearest predator | 2625 (1061) | 2625 (440) | 2625 (8596) | 2625 (558) | 2625 (503) |
| median distance to nearest prey | 2625 (1059) | 2625 (439) | 2625 (8598) | 2625 (560) | 2375 (499) |
| predator within 1800 | 26% (1061) | 26% (440) | 27% (8596) | 23% (558) | 30% (503) |
| prey within 2000 | 38% (1059) | 39% (439) | 34% (8598) | 39% (560) | 37% (499) |
| net thrown when prey within 2000 | 11% (402) | 11% (171) | 11% (2938) | 11% (219) | 13% (183) |
| held by a net | 12% (1294) | 12% (559) | 12% (9307) | 13% (688) | 12% (606) |

**Turn 5, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 7% (1097) | 9% (482) | 9% (7896) | 7% (586) | 7% (511) |
| toward nearest prey (any distance) | 50% (879) | 48% (371) | 49% (7145) | 52% (464) | 48% (415) |
| away from nearest predator (any distance) | 39% (879) | 39% (371) | 36% (7145) | 38% (464) | 40% (415) |
| toward nearest predator | 23% (879) | 25% (371) | 27% (7145) | 22% (464) | 25% (415) |
| median distance to nearest predator | 2875 (1065) | 2875 (438) | 2875 (8459) | 2875 (565) | 2625 (500) |
| median distance to nearest prey | 2625 (1062) | 2875 (438) | 2875 (8460) | 2875 (565) | 2625 (497) |
| predator within 1800 | 25% (1065) | 25% (438) | 26% (8459) | 22% (565) | 28% (500) |
| prey within 2000 | 36% (1062) | 36% (438) | 32% (8460) | 33% (565) | 38% (497) |
| net thrown when prey within 2000 | 7% (378) | 8% (157) | 11% (2683) | 6% (189) | 8% (189) |
| held by a net | 14% (1275) | 12% (549) | 13% (9088) | 14% (682) | 14% (593) |

**Items and dashes per game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets on turn 1 (per game) | 1.21 (311) | 1.35 (133) | 0.57 (2171) | 1.18 (165) | 1.25 (146) |
| nets on turn 2 (per game) | 0.78 (311) | 0.65 (133) | 0.61 (2171) | 0.75 (165) | 0.82 (146) |
| nets on turn 3 (per game) | 0.35 (311) | 0.27 (133) | 0.28 (2171) | 0.29 (165) | 0.41 (146) |
| nets on turn 4 (per game) | 0.19 (311) | 0.17 (133) | 0.24 (2171) | 0.19 (165) | 0.18 (146) |
| nets on turn 5 (per game) | 0.14 (311) | 0.14 (133) | 0.20 (2171) | 0.12 (165) | 0.16 (146) |
| nets in turns 1-5 (per game) | 2.66 (311) | 2.59 (133) | 1.90 (2171) | 2.52 (165) | 2.82 (146) |
| nets whole game (per game) | 4.46 (311) | 4.41 (133) | 4.23 (2171) | 4.30 (165) | 4.63 (146) |
| games with at least one net in turns 1-5 | 89% (311) | 88% (133) | 77% (2171) | 90% (165) | 88% (146) |
| smokes on turn 1 (per game) | 0.11 (311) | 0.00 (133) | 0.30 (2171) | 0.12 (165) | 0.10 (146) |
| smokes on turn 2 (per game) | 0.12 (311) | 0.17 (133) | 0.16 (2171) | 0.13 (165) | 0.10 (146) |
| smokes on turn 3 (per game) | 0.06 (311) | 0.10 (133) | 0.13 (2171) | 0.05 (165) | 0.08 (146) |
| smokes on turn 4 (per game) | 0.08 (311) | 0.06 (133) | 0.10 (2171) | 0.07 (165) | 0.09 (146) |
| smokes on turn 5 (per game) | 0.08 (311) | 0.11 (133) | 0.08 (2171) | 0.08 (165) | 0.09 (146) |
| smokes in turns 1-5 (per game) | 0.45 (311) | 0.44 (133) | 0.77 (2171) | 0.45 (165) | 0.45 (146) |
| smokes whole game (per game) | 2.75 (311) | 2.70 (133) | 3.07 (2171) | 2.83 (165) | 2.66 (146) |
| games with at least one smoke in turns 1-5 | 37% (311) | 38% (133) | 47% (2171) | 39% (165) | 35% (146) |
| decoys on turn 1 (per game) | 0.67 (311) | 0.78 (133) | 0.45 (2171) | 0.61 (165) | 0.73 (146) |
| decoys on turn 2 (per game) | 0.61 (311) | 0.62 (133) | 0.38 (2171) | 0.55 (165) | 0.68 (146) |
| decoys on turn 3 (per game) | 0.49 (311) | 0.44 (133) | 0.23 (2171) | 0.41 (165) | 0.59 (146) |
| decoys on turn 4 (per game) | 0.33 (311) | 0.35 (133) | 0.18 (2171) | 0.33 (165) | 0.32 (146) |
| decoys on turn 5 (per game) | 0.28 (311) | 0.29 (133) | 0.12 (2171) | 0.30 (165) | 0.26 (146) |
| decoys in turns 1-5 (per game) | 2.38 (311) | 2.48 (133) | 1.37 (2171) | 2.20 (165) | 2.58 (146) |
| decoys whole game (per game) | 4.28 (311) | 4.26 (133) | 3.84 (2171) | 4.05 (165) | 4.53 (146) |
| games with at least one decoy in turns 1-5 | 76% (311) | 83% (133) | 59% (2171) | 75% (165) | 78% (146) |
| dashes on turn 1 (per game) | 2.00 (311) | 1.67 (133) | 2.63 (2171) | 1.93 (165) | 2.09 (146) |
| dashes in turns 1-5 (per game) | 4.14 (311) | 4.15 (133) | 5.22 (2171) | 4.08 (165) | 4.21 (146) |
| dashes whole game (per game) | 18.13 (311) | 17.66 (133) | 21.83 (2171) | 19.45 (165) | 16.63 (146) |

**Nets, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 827 | 345 | 4125 | 416 | 411 |
| distance to nearest predator at the order (q25 / median / q75) | 1927 / 2910 / 4323 (827) | 1805 / 2718 / 4443 (345) | 1384 / 2278 / 3722 (4114) | 2086 / 3004 / 4416 (416) | 1828 / 2720 / 4206 (411) |
| distance to nearest prey at the order (q25 / median / q75) | 1186 / 1566 / 1990 (827) | 1201 / 1608 / 2044 (345) | 1249 / 1701 / 2267 (4122) | 1211 / 1569 / 1952 (416) | 1145 / 1566 / 2015 (411) |
| predator within 1500 | 13% (827) | 17% (345) | 28% (4114) | 14% (416) | 12% (411) |
| predator within 2500 | 41% (827) | 43% (345) | 54% (4114) | 38% (416) | 45% (411) |
| prey within 2000 | 76% (827) | 73% (345) | 66% (4122) | 78% (416) | 74% (411) |
| thrower held by a net | 4% (827) | 4% (345) | 12% (4125) | 4% (416) | 5% (411) |
| hit prey | 40% (827) | 40% (345) | 28% (4125) | 46% (416) | 35% (411) |
| hit predator | 4% (827) | 5% (345) | 18% (4125) | 3% (416) | 4% (411) |
| aimed at a predator (hit or miss) | 6% (827) | 8% (345) | 26% (4125) | 5% (416) | 8% (411) |
| aimed at prey (hit or miss) | 89% (827) | 85% (345) | 68% (4125) | 92% (416) | 85% (411) |
| no enemy near the line | 5% (827) | 7% (345) | 5% (4125) | 3% (416) | 8% (411) |
| absorbed by a decoy | 14% (827) | 13% (345) | 12% (4125) | 13% (416) | 14% (411) |
| stopped by a tree | 8% (827) | 9% (345) | 4% (4125) | 7% (416) | 9% (411) |
| distance thrower-target (q25 / median / q75) | 1193 / 1535 / 1938 (782) | 1201 / 1572 / 1956 (319) | 1134 / 1484 / 1857 (3895) | 1211 / 1553 / 1948 (402) | 1184 / 1535 / 1918 (380) |
| target could dash | 72% (785) | 75% (322) | 63% (3901) | 73% (405) | 72% (380) |
| target already held | 8% (785) | 5% (322) | 3% (3901) | 8% (405) | 7% (380) |
| hit rate when the target could dash | 36% (518) | 42% (225) | 37% (2382) | 41% (270) | 29% (248) |
| hit rate when the target could not dash | 66% (206) | 60% (80) | 68% (1407) | 69% (102) | 63% (104) |
| nets at predators: one of our units held within 2000 of it (rescue) | 6% (52) | 7% (29) * | 2% (1093) | 5% (21) * | 6% (31) |
| nets at predators: predator within 1500 of the thrower | 58% (52) | 62% (29) * | 69% (1093) | 81% (21) * | 42% (31) |
| hit one of our own units | 0% (827) | 0% (345) | 0% (4125) | 0% (416) | 0% (411) |

**Nets, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 559 | 242 | 5069 | 294 | 265 |
| distance to nearest predator at the order (q25 / median / q75) | 1715 / 3052 / 4591 (551) | 1564 / 3085 / 4557 (237) | 1281 / 2446 / 4113 (4912) | 1564 / 3082 / 4661 (292) | 1859 / 3043 / 4569 (259) |
| distance to nearest prey at the order (q25 / median / q75) | 1209 / 1667 / 2140 (544) | 1074 / 1632 / 2050 (237) | 1253 / 1782 / 2874 (4976) | 1196 / 1692 / 2164 (280) | 1229 / 1646 / 2098 (264) |
| predator within 1500 | 21% (551) | 24% (237) | 32% (4912) | 24% (292) | 18% (259) |
| predator within 2500 | 38% (551) | 39% (237) | 51% (4912) | 41% (292) | 36% (259) |
| prey within 2000 | 70% (544) | 72% (237) | 61% (4976) | 70% (280) | 70% (264) |
| thrower held by a net | 10% (559) | 12% (242) | 14% (5069) | 9% (294) | 11% (265) |
| hit prey | 47% (559) | 53% (242) | 35% (5069) | 49% (294) | 46% (265) |
| hit predator | 13% (559) | 10% (242) | 26% (5069) | 15% (294) | 11% (265) |
| aimed at a predator (hit or miss) | 15% (559) | 13% (242) | 32% (5069) | 18% (294) | 13% (265) |
| aimed at prey (hit or miss) | 78% (559) | 81% (242) | 60% (5069) | 76% (294) | 79% (265) |
| no enemy near the line | 7% (559) | 6% (242) | 8% (5069) | 6% (294) | 8% (265) |
| absorbed by a decoy | 12% (559) | 10% (242) | 11% (5069) | 10% (294) | 13% (265) |
| stopped by a tree | 7% (559) | 9% (242) | 5% (5069) | 6% (294) | 8% (265) |
| distance thrower-target (q25 / median / q75) | 1081 / 1500 / 1910 (512) | 1037 / 1462 / 1932 (223) | 1006 / 1378 / 1778 (4635) | 1042 / 1512 / 1899 (271) | 1139 / 1487 / 1914 (241) |
| target could dash | 82% (520) | 85% (227) | 77% (4670) | 80% (276) | 84% (244) |
| target already held | 11% (520) | 10% (227) | 7% (4670) | 11% (276) | 11% (244) |
| hit rate when the target could dash | 58% (370) | 64% (170) | 61% (3274) | 61% (192) | 55% (178) |
| hit rate when the target could not dash | 85% (92) | 88% (34) | 75% (1080) | 91% (54) | 76% (38) |
| nets at predators: one of our units held within 2000 of it (rescue) | 5% (86) | 3% (31) | 2% (1608) | 6% (52) | 3% (34) |
| nets at predators: predator within 1500 of the thrower | 78% (86) | 84% (31) | 73% (1608) | 83% (52) | 71% (34) |
| hit one of our own units | 0% (559) | 0% (242) | 0% (5069) | 0% (294) | 0% (265) |

**Smoke, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 140 | 59 | 1674 | 74 | 66 |
| distance to nearest predator at the order (q25 / median / q75) | 1159 / 1345 / 1751 (140) | 1287 / 1449 / 1782 (59) | 1090 / 1502 / 2004 (1673) | 1200 / 1345 / 1760 (74) | 1063 / 1350 / 1732 (66) |
| distance to nearest prey at the order (q25 / median / q75) | 2410 / 3253 / 4911 (140) | 1920 / 3295 / 4928 (59) | 1854 / 2844 / 4228 (1671) | 2598 / 3304 / 5609 (74) | 2345 / 3034 / 4430 (66) |
| predator within 1500 | 62% (140) | 54% (59) | 50% (1673) | 65% (74) | 59% (66) |
| predator within 2500 | 95% (140) | 97% (59) | 87% (1673) | 97% (74) | 92% (66) |
| prey within 2000 | 17% (140) | 25% (59) | 28% (1671) | 18% (74) | 17% (66) |
| thrower held by a net | 7% (140) | 12% (59) | 11% (1674) | 8% (74) | 6% (66) |
| cloud centre along the line unit-predator, 0 = unit, 1 = predator (q25 / median / q75, x100) | 0 / 0 / 0 (140) | 0 / 0 / 0 (59) | 0 / 0 / 65 (1673) | 0 / 0 / 0 (74) | 0 / 0 / 0 (66) |
| cloud centre off that line (median) | 0 (140) | 0 (59) | 1 (1673) | 0 (74) | 0 (66) |
| thrower inside its own cloud (centre within 1900) | 100% (140) | 100% (59) | 91% (1674) | 100% (74) | 100% (66) |
| nearest predator inside the cloud (within 1900 of the centre) | 76% (140) | 56% (59) | 63% (1673) | 77% (74) | 74% (66) |
| dropped on itself (within 400) | 100% (140) | 100% (59) | 52% (1674) | 100% (74) | 100% (66) |
| thrown 400-1500 | 0% (140) | 0% (59) | 27% (1674) | 0% (74) | 0% (66) |
| thrown over 1500 | 0% (140) | 0% (59) | 21% (1674) | 0% (74) | 0% (66) |
| thrown toward the predator | - (0) * | - (0) * | 63% (798) | - (0) * | - (0) * |
| a held team-mate within 1900 of the cloud centre | 1% (140) | 0% (59) | 2% (1674) | 1% (74) | 0% (66) |
| nearest predator to the cloud centre (median) | 1722 (140) | 1857 (59) | 1618 (1673) | 1731 (74) | 1718 (66) |
| nearest prey to the cloud centre (median) | 3198 (140) | 3253 (59) | 2710 (1671) | 3602 (74) | 2926 (66) |

**Smoke, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 716 | 300 | 4988 | 393 | 323 |
| distance to nearest predator at the order (q25 / median / q75) | 921 / 1213 / 1570 (715) | 992 / 1300 / 1606 (299) | 839 / 1168 / 1632 (4961) | 952 / 1201 / 1556 (392) | 892 / 1226 / 1583 (323) |
| distance to nearest prey at the order (q25 / median / q75) | 2389 / 3574 / 5319 (677) | 2543 / 3770 / 5326 (281) | 2220 / 3460 / 5272 (4679) | 2542 / 3914 / 5757 (357) | 2158 / 3421 / 4895 (320) |
| predator within 1500 | 71% (715) | 67% (299) | 70% (4961) | 72% (392) | 69% (323) |
| predator within 2500 | 96% (715) | 97% (299) | 93% (4961) | 96% (392) | 97% (323) |
| prey within 2000 | 21% (677) | 19% (281) | 20% (4679) | 18% (357) | 23% (320) |
| thrower held by a net | 13% (716) | 16% (300) | 10% (4988) | 11% (393) | 16% (323) |
| cloud centre along the line unit-predator, 0 = unit, 1 = predator (q25 / median / q75, x100) | 0 / 0 / 0 (714) | 0 / 0 / 0 (299) | 0 / 0 / 78 (4959) | 0 / 0 / 0 (392) | 0 / 0 / 0 (322) |
| cloud centre off that line (median) | 0 (715) | 0 (299) | 1 (4961) | 0 (392) | 0 (323) |
| thrower inside its own cloud (centre within 1900) | 100% (716) | 100% (300) | 88% (4988) | 100% (393) | 100% (323) |
| nearest predator inside the cloud (within 1900 of the centre) | 81% (715) | 71% (299) | 79% (4961) | 82% (392) | 79% (323) |
| dropped on itself (within 400) | 100% (716) | 100% (300) | 55% (4988) | 99% (393) | 100% (323) |
| thrown 400-1500 | 0% (716) | 0% (300) | 27% (4988) | 1% (393) | 0% (323) |
| thrown over 1500 | 0% (716) | 0% (300) | 18% (4988) | 0% (393) | 0% (323) |
| thrown toward the predator | 50% (2) * | 100% (1) * | 72% (2224) | 50% (2) * | - (0) * |
| a held team-mate within 1900 of the cloud centre | 1% (716) | 0% (300) | 1% (4988) | 1% (393) | 1% (323) |
| nearest predator to the cloud centre (median) | 1664 (715) | 1632 (299) | 1206 (4961) | 1676 (392) | 1657 (323) |
| nearest prey to the cloud centre (median) | 3683 (677) | 3844 (281) | 3461 (4679) | 3932 (357) | 3500 (320) |

**Decoys, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 739 | 330 | 2977 | 363 | 376 |
| distance to nearest predator at the order (q25 / median / q75) | 1012 / 1333 / 1719 (739) | 1058 / 1394 / 1754 (330) | 1189 / 1541 / 1964 (2974) | 1077 / 1433 / 1777 (363) | 957 / 1275 / 1663 (376) |
| distance to nearest prey at the order (q25 / median / q75) | 2261 / 3441 / 4696 (739) | 2288 / 3579 / 4894 (330) | 1970 / 2863 / 4232 (2971) | 2256 / 3513 / 4816 (363) | 2289 / 3407 / 4629 (376) |
| predator within 1500 | 59% (739) | 57% (330) | 48% (2974) | 55% (363) | 63% (376) |
| predator within 2500 | 98% (739) | 96% (330) | 89% (2974) | 96% (363) | 99% (376) |
| prey within 2000 | 20% (739) | 19% (330) | 26% (2971) | 22% (363) | 18% (376) |
| thrower held by a net | 18% (739) | 15% (330) | 6% (2977) | 19% (363) | 17% (376) |
| decoy walks toward the nearest predator | 1% (739) | 2% (330) | 18% (2974) | 1% (363) | 1% (376) |
| decoy walks away from the nearest predator | 82% (739) | 81% (330) | 35% (2974) | 84% (363) | 81% (376) |
| decoy walks toward the nearest prey | 25% (739) | 25% (330) | 30% (2971) | 23% (363) | 28% (376) |
| decoy: same point as the unit | 0% (739) | 0% (330) | 0% (2977) | 0% (363) | 0% (376) |
| decoy: same direction as the unit | 14% (739) | 15% (330) | 15% (2977) | 13% (363) | 14% (376) |
| decoy: opposite direction | 23% (739) | 24% (330) | 30% (2977) | 21% (363) | 24% (376) |
| decoy: sideways from the unit | 59% (739) | 61% (330) | 49% (2977) | 57% (363) | 60% (376) |

**Decoys, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 592 | 237 | 5355 | 306 | 286 |
| distance to nearest predator at the order (q25 / median / q75) | 979 / 1292 / 1736 (592) | 1187 / 1589 / 1820 (237) | 1026 / 1411 / 1789 (5324) | 962 / 1248 / 1714 (306) | 1012 / 1372 / 1747 (286) |
| distance to nearest prey at the order (q25 / median / q75) | 2511 / 3776 / 5582 (582) | 2580 / 3720 / 5275 (237) | 2353 / 3509 / 5187 (5099) | 2617 / 4074 / 5810 (297) | 2357 / 3657 / 4928 (285) |
| predator within 1500 | 60% (592) | 43% (237) | 56% (5324) | 64% (306) | 56% (286) |
| predator within 2500 | 94% (592) | 95% (237) | 91% (5324) | 93% (306) | 96% (286) |
| prey within 2000 | 16% (582) | 14% (237) | 18% (5099) | 16% (297) | 17% (285) |
| thrower held by a net | 21% (592) | 13% (237) | 5% (5355) | 15% (306) | 27% (286) |
| decoy walks toward the nearest predator | 3% (592) | 7% (237) | 13% (5324) | 4% (306) | 2% (286) |
| decoy walks away from the nearest predator | 82% (592) | 72% (237) | 38% (5324) | 80% (306) | 83% (286) |
| decoy walks toward the nearest prey | 25% (582) | 27% (237) | 31% (5099) | 25% (297) | 25% (285) |
| decoy: same point as the unit | 0% (592) | 0% (237) | 0% (5355) | 0% (306) | 0% (286) |
| decoy: same direction as the unit | 7% (592) | 9% (237) | 16% (5355) | 9% (306) | 6% (286) |
| decoy: opposite direction | 19% (592) | 22% (237) | 29% (5355) | 21% (306) | 17% (286) |
| decoy: sideways from the unit | 63% (592) | 68% (237) | 51% (5355) | 60% (306) | 65% (286) |

**Trigger table, turn 1: nearest free predator at this distance (start of the turn)**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 72 | 11% (72) | 63% (72) | 15% (72) | 89% (72) | 72% (72) | 3% (72) | 19% (72) | 517 | 21% (517) | 26% (517) | 21% (517) | 94% (517) | 73% (517) | 2% (517) | 15% (517) |
| 1000-1500 | 129 | 12% (129) | 53% (129) | 19% (129) | 74% (129) | 53% (129) | 3% (129) | 16% (129) | 889 | 16% (889) | 36% (889) | 16% (889) | 85% (889) | 57% (889) | 1% (889) | 14% (889) |
| 1500-2000 | 185 | 4% (185) | 45% (185) | 32% (185) | 65% (185) | 52% (185) | 5% (185) | 13% (185) | 1252 | 14% (1252) | 23% (1252) | 18% (1252) | 70% (1252) | 45% (1252) | 2% (1252) | 9% (1252) |
| 2000-2500 | 173 | 1% (173) | 5% (173) | 34% (173) | 58% (173) | 53% (173) | 12% (173) | 4% (173) | 1218 | 11% (1218) | 14% (1218) | 14% (1218) | 60% (1218) | 39% (1218) | 10% (1218) | 6% (1218) |
| 2500-3000 | 130 | 2% (130) | 0% (130) | 27% (130) | 50% (130) | 52% (130) | 19% (130) | 6% (130) | 1123 | 5% (1123) | 4% (1123) | 11% (1123) | 53% (1123) | 28% (1123) | 25% (1123) | 2% (1123) |

**Trigger table, turns 2+: nearest free predator at this distance**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 6632 | 3% (6632) | 4% (6632) | 1% (6632) | 21% (5717) | 79% (6272) | 5% (6272) | 16% (6632) | 31734 | 6% (31734) | 4% (31734) | 3% (31734) | 23% (26663) | 71% (28932) | 6% (28932) | 24% (31734) |
| 1000-1500 | 6225 | 5% (6225) | 6% (6225) | 2% (6225) | 14% (4915) | 69% (5985) | 6% (5985) | 11% (6225) | 40711 | 4% (40711) | 6% (40711) | 3% (40711) | 17% (31665) | 68% (38952) | 7% (38952) | 13% (40711) |
| 1500-2000 | 5761 | 3% (5761) | 6% (5761) | 2% (5761) | 10% (4846) | 57% (5567) | 10% (5567) | 6% (5761) | 38927 | 3% (38927) | 5% (38927) | 2% (38927) | 14% (32123) | 53% (37712) | 11% (37712) | 7% (38927) |
| 2000-2500 | 5747 | 1% (5747) | 1% (5747) | 2% (5747) | 8% (5057) | 43% (5618) | 20% (5618) | 2% (5747) | 39846 | 1% (39846) | 1% (39846) | 2% (39846) | 9% (34252) | 39% (38977) | 22% (38977) | 3% (39846) |
| 2500-3000 | 5616 | 0% (5616) | 0% (5616) | 2% (5616) | 7% (5025) | 38% (5489) | 25% (5489) | 1% (5616) | 39551 | 0% (39551) | 1% (39551) | 2% (39551) | 9% (34649) | 34% (38661) | 27% (38661) | 1% (39551) |

**Trigger table, turn 1: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 29 * | 66% (29) * | - (0) * | - (0) * | 69% (29) * | 79% (29) * | 28% (29) * | 195 | 21% (195) | - (0) * | - (0) * | 67% (195) | 90% (195) | 20% (195) |
| 800-1200 | 74 | 72% (74) | - (0) * | - (0) * | 76% (74) | 88% (74) | 27% (74) | 604 | 20% (604) | - (0) * | - (0) * | 83% (604) | 89% (604) | 13% (604) |
| 1200-1600 | 128 | 70% (128) | - (0) * | - (0) * | 72% (128) | 80% (128) | 24% (128) | 800 | 22% (800) | - (0) * | - (0) * | 90% (800) | 87% (800) | 11% (800) |
| 1600-2000 | 134 | 65% (134) | - (0) * | - (0) * | 66% (134) | 72% (134) | 19% (134) | 1041 | 37% (1041) | - (0) * | - (0) * | 69% (1041) | 79% (1041) | 11% (1041) |
| 2000-2500 | 164 | 51% (164) | - (0) * | - (0) * | 65% (164) | 72% (164) | 16% (164) | 1212 | 27% (1212) | - (0) * | - (0) * | 63% (1212) | 79% (1212) | 9% (1212) |

**Trigger table, turns 2+: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 2815 | 1% (2238) | 6% (107) | 8% (470) | 10% (2080) | 80% (2815) | 31% (2815) | 18724 | 1% (15822) | 7% (864) | 3% (2038) | 11% (13838) | 81% (18724) | 28% (18724) |
| 800-1200 | 4188 | 2% (3346) | 12% (525) | 9% (317) | 18% (3195) | 84% (4188) | 22% (4188) | 32409 | 2% (26523) | 8% (4161) | 3% (1725) | 17% (25521) | 80% (32409) | 18% (32409) |
| 1200-1600 | 4307 | 4% (3203) | 9% (843) | 7% (261) | 24% (3762) | 77% (4307) | 16% (4307) | 36343 | 3% (27769) | 8% (6899) | 3% (1675) | 22% (31266) | 74% (36343) | 13% (36343) |
| 1600-2000 | 4088 | 4% (3238) | 13% (622) | 7% (228) | 20% (3763) | 66% (4088) | 12% (4088) | 34746 | 4% (28286) | 7% (4976) | 4% (1484) | 17% (31313) | 65% (34746) | 9% (34746) |
| 2000-2500 | 5021 | 2% (4254) | 4% (584) | 3% (183) | 8% (4677) | 52% (5021) | 8% (5021) | 42218 | 1% (35361) | 3% (5339) | 3% (1518) | 11% (38729) | 52% (42218) | 7% (42218) |

## 2. How its catches were made: Les Gens Bons

**Catches by the team (columns: team / team new / catches by other seats / catches in its wins / in its non-wins)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| catches | 992 | 444 | 6362 | 618 | 374 |
| prey held by a net | 39% (992) | 41% (444) | 32% (6362) | 38% (618) | 40% (374) |
| prey held: net of the catching team | 93% (384) | 96% (182) | 91% (2028) | 92% (234) | 94% (150) |
| prey held: net of the third team | 7% (384) | 4% (182) | 8% (2028) | 7% (234) | 6% (150) |
| prey held: netted by the catching unit itself | 84% (357) | 89% (174) | 84% (1855) | 82% (216) | 86% (141) |
| turns from net to catch = 1 | 50% (384) | 50% (182) | 49% (2028) | 48% (234) | 53% (150) |
| turns from net to catch = 2 | 29% (384) | 31% (182) | 29% (2028) | 33% (234) | 24% (150) |
| turns from net to catch = 3 | 12% (384) | 13% (182) | 13% (2028) | 11% (234) | 14% (150) |
| turns from net to catch = 4 | 9% (384) | 6% (182) | 9% (2028) | 9% (234) | 9% (150) |
| catcher dashed | 43% (992) | 36% (444) | 40% (6362) | 42% (618) | 44% (374) |
| catcher dashed, prey held | 42% (384) | 34% (182) | 45% (2028) | 40% (234) | 44% (150) |
| catcher dashed, prey free | 43% (608) | 39% (262) | 37% (4334) | 43% (384) | 43% (224) |
| free prey: its dash was available and unused | 78% (608) | 74% (262) | 79% (4334) | 79% (384) | 76% (224) |
| free prey: dashed this turn | 13% (608) | 18% (262) | 12% (4334) | 13% (384) | 14% (224) |
| free prey: dash on cooldown | 9% (608) | 8% (262) | 9% (4334) | 8% (384) | 10% (224) |
| free prey: moving toward the catcher | 39% (608) | 40% (262) | 46% (4334) | 41% (384) | 36% (224) |
| free prey: was chasing its own prey | 6% (608) | 8% (262) | 5% (4334) | 6% (384) | 6% (224) |
| start distance catcher-prey (q25 / median / q75) | 568 / 814 / 1097 (978) | 526 / 753 / 1050 (440) | 576 / 813 / 1121 (6306) | 567 / 820 / 1100 (609) | 569 / 796 / 1095 (369) |
| units of the team within 1800 of the prey: 1 | 69% (992) | 77% (444) | 69% (6362) | 67% (618) | 72% (374) |
| units within 1800: 2 | 27% (992) | 22% (444) | 27% (6362) | 28% (618) | 25% (374) |
| units within 1800: 3 or more | 4% (992) | 1% (444) | 4% (6362) | 4% (618) | 3% (374) |
| units within 1800 (mean) | 1.33 (992) | 1.22 (444) | 1.32 (6362) | 1.35 (618) | 1.28 (374) |
| prey at the wall (radius > 6500) | 20% (992) | 16% (444) | 20% (6362) | 18% (618) | 24% (374) |
| prey distance from the wall (q25 / median / q75) | 1926 / 3707 / 5245 (992) | 2192 / 3789 / 5295 (444) | 1897 / 3533 / 5173 (6362) | 2045 / 3769 / 5245 (618) | 1633 / 3583 / 5141 (374) |
| prey within 2500 of the centre | 22% (992) | 23% (444) | 21% (6362) | 22% (618) | 21% (374) |
| turn of the catch (q25 / median / q75) | 8 / 24 / 49 (992) | 8 / 23 / 46 (444) | 10 / 25 / 51 (6362) | 7 / 26 / 49 (618) | 8 / 22 / 48 (374) |
| catch by turn 10 | 32% (992) | 32% (444) | 26% (6362) | 31% (618) | 32% (374) |
| catch on turns 11-30 | 25% (992) | 26% (444) | 30% (6362) | 24% (618) | 28% (374) |
| catch after turn 60 | 18% (992) | 16% (444) | 18% (6362) | 18% (618) | 18% (374) |
| prey inside smoke of its own team | 21% (992) | 25% (444) | 23% (6362) | 21% (618) | 21% (374) |
| prey had a team-mate within 1500 | 14% (992) | 12% (444) | 14% (6362) | 13% (618) | 14% (374) |

**Net hits of the team on prey: conversion (caught within 5 turns)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| net hits on prey | 598 | 266 | 2965 | 335 | 263 |
| converted | 68% (598) | 71% (266) | 67% (2965) | 73% (335) | 61% (263) |
| a free hunter within 1200 after the net | 64% (598) | 64% (266) | 57% (2965) | 68% (335) | 59% (263) |
| a free hunter within 1800 | 84% (598) | 86% (266) | 80% (2965) | 86% (335) | 80% (263) |
| converted when a hunter within 1800 | 74% (500) | 76% (229) | 73% (2386) | 78% (289) | 68% (211) |
| converted when no hunter within 1800 | 39% (98) | 43% (37) | 39% (579) | 46% (46) | 33% (52) |
| distance of the nearest free hunter (q25 / median / q75) | 589 / 950 / 1424 (591) | 597 / 959 / 1433 (264) | 670 / 1048 / 1567 (2935) | 576 / 914 / 1307 (333) | 643 / 1030 / 1608 (258) |
| target was already held (re-net) | 12% (598) | 8% (266) | 6% (2965) | 11% (335) | 14% (263) |

## 3. How its units were lost: Les Gens Bons

**Units lost by the team (other seats: units lost by them)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| units lost | 835 | 364 | 6442 | 353 | 482 |
| held by a net | 34% (835) | 34% (364) | 32% (6442) | 35% (353) | 33% (482) |
| held: net of the predator team | 92% (284) | 89% (123) | 92% (2087) | 90% (124) | 93% (160) |
| held: net of the third team (its own prey) | 8% (284) | 11% (123) | 8% (2087) | 10% (124) | 7% (160) |
| held: net of its own team | 0% (284) | 0% (123) | 0% (2087) | 0% (124) | 0% (160) |
| turn (q25 / median / q75) | 10 / 23 / 48 (835) | 9 / 21 / 43 (364) | 10 / 26 / 51 (6442) | 12 / 28 / 56 (353) | 9 / 21 / 42 (482) |
| by turn 10 | 28% (835) | 28% (364) | 26% (6442) | 23% (353) | 31% (482) |
| turns 11-30 | 32% (835) | 36% (364) | 29% (6442) | 30% (353) | 33% (482) |
| after turn 60 | 17% (835) | 14% (364) | 19% (6442) | 21% (353) | 15% (482) |
| at the wall (radius > 6500) | 20% (835) | 13% (364) | 20% (6442) | 22% (353) | 18% (482) |
| within 2500 of the centre | 20% (835) | 22% (364) | 21% (6442) | 18% (353) | 21% (482) |
| the unit dashed on that turn | 5% (835) | 4% (364) | 8% (6442) | 5% (353) | 5% (482) |
| free unit: dashed on that turn | 8% (551) | 6% (241) | 12% (4355) | 8% (229) | 7% (322) |
| free unit: dash available, not used | 85% (551) | 89% (241) | 78% (4355) | 86% (229) | 84% (322) |
| free unit: dash on cooldown | 8% (551) | 5% (241) | 9% (4355) | 6% (229) | 9% (322) |
| free unit: moving toward the catcher | 47% (551) | 55% (241) | 45% (4355) | 43% (229) | 50% (322) |
| free unit: was chasing its own prey | 5% (551) | 7% (241) | 5% (4355) | 5% (229) | 5% (322) |
| three or more dashes already spent | 50% (835) | 49% (364) | 61% (6442) | 53% (353) | 47% (482) |
| team used smoke in the 3 turns before | 29% (835) | 30% (364) | 23% (6442) | 29% (353) | 29% (482) |
| team used a decoy in the 3 turns before | 25% (835) | 22% (364) | 23% (6442) | 21% (353) | 27% (482) |
| team used smoke or decoy in the 3 turns before | 48% (835) | 47% (364) | 39% (6442) | 43% (353) | 52% (482) |
| inside a cloud of its own team (centre within 1900, last 9 turns) | 29% (835) | 34% (364) | 23% (6442) | 29% (353) | 29% (482) |
| the unit itself sent a decoy in the 3 turns before | 18% (835) | 15% (364) | 15% (6442) | 17% (353) | 19% (482) |
| team netted the catcher in the 3 turns before | 0% (835) | 0% (364) | 1% (6442) | 0% (353) | 0% (482) |
| catcher dashed | 41% (835) | 42% (364) | 40% (6442) | 42% (353) | 41% (482) |
| 2 or more hunters within 1800 | 33% (835) | 32% (364) | 30% (6442) | 33% (353) | 33% (482) |
| a team-mate within 1500 | 16% (835) | 9% (364) | 15% (6442) | 14% (353) | 17% (482) |

**Own units netted by the predator: what the team did in the next 3 turns**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| own units netted by the predator | 388 | 161 | 3070 | 175 | 213 |
| caught within 5 turns | 72% (388) | 72% (161) | 67% (3070) | 69% (175) | 74% (213) |
| smoke within 1900 of the unit | 30% (388) | 35% (161) | 29% (3070) | 34% (175) | 26% (213) |
| net on a unit of the predator team | 11% (388) | 14% (161) | 27% (3070) | 12% (175) | 10% (213) |
| the held unit sent a decoy | 42% (388) | 33% (161) | 20% (3070) | 37% (175) | 46% (213) |
| caught, with smoke | 57% (115) | 63% (57) | 49% (898) | 53% (60) | 60% (55) |
| caught, without smoke | 78% (273) | 77% (104) | 74% (2172) | 77% (115) | 79% (158) |
| caught, with a counter-net | 42% (43) | 45% (22) * | 41% (821) | 38% (21) * | 45% (22) * |
| caught, without a counter-net | 75% (345) | 76% (139) | 76% (2249) | 73% (154) | 77% (191) |
| a free hunter within 1800 at the net | 91% (388) | 91% (161) | 80% (3070) | 92% (175) | 90% (213) |

## 4. Ghosts: Les Gens Bons

**Ghost-turns (unit caught earlier, team still has living units)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| ghost-turns with an order | 100% (49276) | 100% (22498) | 96% (345383) | 100% (22315) | 100% (26961) |
| moving (order further than 60) | 89% (22263) | 86% (9944) | 90% (163494) | 87% (9929) | 90% (12334) |
| dashing | 0% (49276) | 0% (22498) | 0% (345383) | 0% (22315) | 0% (26961) |
| order aimed within 1000 of a living prey | 48% (19754) | 56% (8504) | 25% (146948) | 41% (8632) | 53% (11122) |
| order aimed within 1000 of a living predator | 8% (19754) | 1% (8504) | 12% (146948) | 9% (8632) | 7% (11122) |
| order aimed within 1000 of a living team-mate | 5% (19754) | 2% (8504) | 3% (146948) | 5% (8632) | 5% (11122) |
| order aimed at none of these | 40% (19754) | 41% (8504) | 59% (146948) | 45% (8632) | 36% (11122) |
| aimed at prey: that prey is held by a net | 5% (9443) | 5% (4736) | 4% (36832) | 5% (3545) | 5% (5898) |
| aimed at prey: a living hunter of ours within 2500 of it | 51% (9443) | 49% (4736) | 51% (36832) | 56% (3545) | 47% (5898) |
| aimed at predator: a living team-mate within 2500 of it | 76% (1513) | 21% (105) | 36% (18126) | 77% (786) | 75% (727) |
| moving toward the nearest living prey | 58% (19754) | 61% (8504) | 46% (146948) | 53% (8632) | 62% (11122) |
| moving toward the nearest living predator | 35% (19754) | 33% (8504) | 36% (146948) | 34% (8632) | 35% (11122) |
| position within 2000 of a living prey | 37% (22263) | 40% (9944) | 33% (163494) | 31% (9929) | 42% (12334) |
| position within 2000 of a living predator | 38% (22263) | 31% (9944) | 39% (163494) | 38% (9929) | 37% (12334) |
| position within 2000 of a living team-mate | 32% (22263) | 26% (9944) | 24% (163494) | 31% (9929) | 34% (12334) |
| position within 2000 of nobody | 28% (22263) | 34% (9944) | 33% (163494) | 32% (9929) | 25% (12334) |
| median distance to the nearest living prey | 2625 (20316) | 2375 (9015) | 2875 (149564) | 2875 (8328) | 2375 (11988) |
| median distance to the nearest living predator | 2375 (21753) | 2625 (9649) | 2625 (159673) | 2375 (9789) | 2375 (11964) |

## 5. Three units against six: Les Gens Bons

| | team, 3 units | team, 4 units | team, 5 units | team, 6 units | others, 3 units | others, 4 units | others, 5 units | others, 6 units |
|---|---|---|---|---|---|---|---|---|
| games | 79 | 92 | 77 | 63 | 543 | 550 | 556 | 522 |
| wins | 59% (79) | 49% (92) | 58% (77) | 44% (63) | 32% (543) | 32% (550) | 33% (556) | 32% (522) |
| last place | 11% (79) | 21% (92) | 23% (77) | 22% (63) | 34% (543) | 35% (550) | 33% (556) | 34% (522) |
| mean rank | 1.52 (79) | 1.72 (92) | 1.65 (77) | 1.78 (63) | 2.02 (543) | 2.03 (550) | 2.01 (556) | 2.03 (522) |
| catches per game | 2.20 (79) | 2.83 (92) | 3.68 (77) | 4.37 (63) | 1.72 (543) | 2.53 (550) | 3.37 (556) | 4.13 (522) |
| catches per unit of the prey team | 0.73 (79) | 0.71 (92) | 0.74 (77) | 0.73 (63) | 0.57 (543) | 0.63 (550) | 0.67 (556) | 0.69 (522) |
| units lost per game | 1.44 (79) | 2.60 (92) | 2.92 (77) | 4.08 (63) | 1.76 (543) | 2.57 (550) | 3.39 (556) | 4.19 (522) |
| share of own units lost | 0.48 (79) | 0.65 (92) | 0.58 (77) | 0.68 (63) | 0.59 (543) | 0.64 (550) | 0.68 (556) | 0.70 (522) |
| catches by turn 10 | 0.57 (79) | 0.90 (92) | 1.12 (77) | 1.59 (63) | 0.37 (543) | 0.62 (550) | 0.90 (556) | 1.19 (522) |
| units lost by turn 10 | 0.34 (79) | 0.73 (92) | 0.82 (77) | 1.21 (63) | 0.38 (543) | 0.63 (550) | 0.91 (556) | 1.23 (522) |
| first catch turn (median) | 10 (76) | 7 (89) | 5 (77) | 3 (63) | 17 (473) | 10 (524) | 7 (543) | 6 (512) |
| made the first catch of the game | 43% (79) | 48% (92) | 45% (77) | 44% (63) | 33% (543) | 32% (550) | 33% (556) | 32% (522) |
| nets per game | 2.97 (79) | 4.05 (92) | 4.86 (77) | 6.41 (63) | 2.55 (543) | 3.74 (550) | 4.89 (556) | 5.81 (522) |
| nets in turns 1-3 | 1.09 (79) | 1.98 (92) | 3.01 (77) | 3.59 (63) | 0.72 (543) | 1.20 (550) | 1.72 (556) | 2.20 (522) |
| smoke per game | 1.49 (79) | 2.42 (92) | 3.40 (77) | 4.02 (63) | 1.94 (543) | 2.67 (550) | 3.48 (556) | 4.22 (522) |
| smoke in turns 1-5 | 0.23 (79) | 0.46 (92) | 0.47 (77) | 0.70 (63) | 0.40 (543) | 0.63 (550) | 0.91 (556) | 1.16 (522) |
| decoys per game | 2.61 (79) | 4.18 (92) | 4.66 (77) | 6.05 (63) | 2.33 (543) | 3.29 (550) | 4.54 (556) | 5.24 (522) |
| decoys in turns 1-5 | 1.13 (79) | 2.05 (92) | 2.91 (77) | 3.76 (63) | 0.71 (543) | 1.07 (550) | 1.69 (556) | 2.04 (522) |
| dashes per unit, whole game | 3.97 (79) | 4.20 (92) | 4.29 (77) | 3.97 (63) | 4.85 (543) | 5.01 (550) | 4.87 (556) | 4.76 (522) |
| turn 1: units dashing | 35% (210) | 49% (335) | 52% (365) | 54% (365) | 54% (1508) | 61% (2069) | 59% (2684) | 67% (3064) |
| turn 1: toward nearest prey | 72% (210) | 67% (335) | 68% (365) | 63% (365) | 76% (1508) | 73% (2069) | 72% (2684) | 72% (3064) |
| turn 1: away from nearest predator | 31% (210) | 44% (335) | 41% (365) | 44% (365) | 26% (1508) | 31% (2069) | 32% (2684) | 35% (3064) |
| net hits prey | 42% (235) | 48% (373) | 42% (374) | 40% (404) | 31% (1387) | 33% (2058) | 32% (2717) | 32% (3032) |
| nets aimed at predators | 10% (235) | 8% (373) | 9% (374) | 13% (404) | 30% (1387) | 28% (2058) | 29% (2717) | 30% (3032) |
| catches: prey held by a net | 37% (174) | 41% (260) | 36% (283) | 40% (275) | 33% (934) | 34% (1394) | 31% (1876) | 31% (2158) |
| catches: catcher dashed | 50% (174) | 46% (260) | 40% (283) | 38% (275) | 41% (934) | 40% (1394) | 40% (1876) | 39% (2158) |
| losses: held by a net | 37% (114) | 42% (239) | 28% (225) | 30% (257) | 33% (957) | 34% (1414) | 32% (1886) | 32% (2185) |
| tie on catches for first place | 23% (79) | 26% (92) | 25% (77) | 25% (63) | 21% (543) | 25% (550) | 22% (556) | 18% (522) |

## 6. Ahead, level, behind on catches: Les Gens Bons

State at the start of the turn: own catches against the better of the two other teams. Left block: the team (all games). Right block: other seats of the new folder.

**turns 6-30**

| | team ahead | team level | team behind | others ahead | others level | others behind |
|---|---|---|---|---|---|---|
| unit-turns | 8554 | 9494 | 7898 | 44221 | 55034 | 84418 |
| dash when available | 7% (7658) | 9% (8368) | 10% (6879) | 11% (38117) | 12% (46584) | 12% (71777) |
| nets per 100 unit-turns | 1.0 (8554) | 2.2 (9494) | 2.2 (7898) | 1.7 (44221) | 2.3 (55034) | 2.4 (84418) |
| net when prey within 2000 | 4% (1338) | 7% (2026) | 6% (2357) | 5% (8007) | 6% (13300) | 5% (24880) |
| smoke per 100 | 1.9 (8554) | 1.5 (9494) | 1.6 (7898) | 1.7 (44221) | 1.6 (55034) | 1.4 (84418) |
| decoys per 100 | 2.1 (8554) | 2.0 (9494) | 1.5 (7898) | 1.9 (44221) | 2.0 (55034) | 1.7 (84418) |
| median distance to nearest predator | 3125 (7999) | 3375 (8707) | 3375 (7453) | 3125 (43350) | 3375 (53213) | 3375 (80339) |
| predator within 1800 | 23% (7999) | 22% (8707) | 21% (7453) | 23% (43350) | 21% (53213) | 19% (80339) |
| median distance to nearest prey | 4125 (7880) | 3375 (8709) | 2875 (7475) | 3875 (41821) | 3375 (53242) | 2875 (82077) |
| prey within 3000: moving toward it | 57% (2365) | 58% (3333) | 60% (3692) | 58% (13682) | 59% (21531) | 58% (39634) |
| prey within 3000: dash | 14% (2070) | 16% (2935) | 16% (3242) | 16% (11835) | 18% (18497) | 17% (34274) |
| predator within 3000: moving away | 48% (3604) | 49% (3603) | 49% (3078) | 47% (19108) | 46% (21580) | 45% (30434) |
| predator within 3000: moving toward it | 18% (3604) | 17% (3603) | 18% (3078) | 19% (19108) | 19% (21580) | 19% (30434) |
| predator within 3000: dash | 13% (3182) | 14% (3202) | 14% (2735) | 15% (16674) | 17% (18607) | 17% (26319) |
| standing still | 5% (8273) | 5% (9051) | 4% (7498) | 6% (42350) | 5% (52134) | 5% (80028) |

**turns 31-100**

| | team ahead | team level | team behind | others ahead | others level | others behind |
|---|---|---|---|---|---|---|
| unit-turns | 21383 | 11762 | 13434 | 93182 | 65924 | 145316 |
| dash when available | 4% (20321) | 6% (11039) | 7% (12561) | 5% (87803) | 6% (61548) | 7% (135161) |
| nets per 100 unit-turns | 0.1 (21383) | 0.3 (11762) | 0.3 (13434) | 0.2 (93182) | 0.4 (65924) | 0.4 (145316) |
| net when prey within 2000 | 0% (2115) | 0% (2547) | 0% (4430) | 1% (9315) | 1% (14324) | 1% (47795) |
| smoke per 100 | 0.7 (21383) | 0.7 (11762) | 0.4 (13434) | 0.9 (93182) | 0.8 (65924) | 0.6 (145316) |
| decoys per 100 | 0.2 (21383) | 0.3 (11762) | 0.1 (13434) | 0.7 (93182) | 0.8 (65924) | 0.6 (145316) |
| median distance to nearest predator | 2875 (15855) | 3125 (9254) | 3375 (9095) | 2875 (75660) | 3125 (55752) | 3625 (96849) |
| predator within 1800 | 35% (15855) | 28% (9254) | 23% (9095) | 31% (75660) | 25% (55752) | 20% (96849) |
| median distance to nearest prey | 4375 (11596) | 3375 (9197) | 2625 (11108) | 4375 (52355) | 3375 (54742) | 2625 (123390) |
| prey within 3000: moving toward it | 64% (3667) | 71% (3940) | 76% (6297) | 64% (16411) | 68% (23274) | 73% (69711) |
| prey within 3000: dash | 10% (3332) | 12% (3549) | 12% (5683) | 11% (14863) | 11% (21081) | 11% (63156) |
| predator within 3000: moving away | 67% (8472) | 61% (4522) | 58% (4041) | 62% (37969) | 56% (25239) | 55% (38404) |
| predator within 3000: moving toward it | 8% (8472) | 12% (4522) | 14% (4041) | 11% (37969) | 14% (25239) | 15% (38404) |
| predator within 3000: dash | 10% (7704) | 11% (4083) | 11% (3661) | 11% (34314) | 11% (22816) | 11% (34734) |
| standing still | 10% (21286) | 4% (11684) | 4% (13336) | 10% (92637) | 5% (65419) | 5% (144161) |

## 7. Games it did not win: Les Gens Bons

Non-wins: 146 of 311 (second 86, last 60). Winner was its **prey team** in 60 (41%), its **predator team** in 86 (59%). Other seats of the new folder: prey team won 50% of their non-wins.

First thing that went wrong in the non-wins (exclusive, in this order): lost a unit by turn 10: 94 (64%); no catch by turn 20: 17 (12%); level on catches with the winner, lost the tie-break: 6 (4%); fewer catches than the winner, none of the above: 29 (20%).

**The same events in wins and in non-wins**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| games | 311 | 133 | 2171 | 165 | 146 |
| lost a unit by turn 10 | 53% (311) | 54% (133) | 56% (2171) | 43% (165) | 64% (146) |
| lost a unit by turn 20 | 73% (311) | 76% (133) | 73% (2171) | 64% (165) | 84% (146) |
| no catch by turn 10 | 31% (311) | 30% (133) | 45% (2171) | 21% (165) | 42% (146) |
| no catch by turn 20 | 17% (311) | 16% (133) | 28% (2171) | 8% (165) | 27% (146) |
| made the first catch of the game | 45% (311) | 46% (133) | 33% (2171) | 58% (165) | 32% (146) |
| its first event: lost a unit before any catch | 36% (311) | 39% (133) | 45% (2171) | 18% (165) | 57% (146) |
| its first event: caught before losing | 59% (311) | 56% (133) | 50% (2171) | 76% (165) | 39% (146) |
| level on catches for first place | 25% (311) | 23% (133) | 22% (2171) | 25% (165) | 24% (146) |
| level on catches for first place: won the tie-break | 55% (77) | 63% (30) | 47% (469) | 100% (42) | 0% (35) |
| eliminated (all units lost) | 15% (311) | 15% (133) | 25% (2171) | 4% (165) | 29% (146) |
| catches | 3.19 (311) | 3.34 (133) | 2.93 (2171) | 3.75 (165) | 2.56 (146) |
| units lost | 2.68 (311) | 2.74 (133) | 2.97 (2171) | 2.14 (165) | 3.30 (146) |
| catches by turn 10 | 1.01 (311) | 1.05 (133) | 0.77 (2171) | 1.17 (165) | 0.83 (146) |
| catches by turn 20 | 1.50 (311) | 1.60 (133) | 1.27 (2171) | 1.73 (165) | 1.25 (146) |
| units lost by turn 10 | 0.75 (311) | 0.77 (133) | 0.78 (2171) | 0.50 (165) | 1.03 (146) |
| first catch turn (median) | 6 (305) | 5 (131) | 8 (2052) | 5 (165) | 8 (140) |
| first loss turn (median) | 9 (294) | 9 (126) | 8 (2057) | 12 (152) | 8 (142) |
| catches of its predator team | 2.68 (311) | 2.74 (133) | 2.97 (2171) | 2.14 (165) | 3.30 (146) |
| catches of its prey team | 2.50 (311) | 2.67 (133) | 2.97 (2171) | 2.03 (165) | 3.04 (146) |
| nets in turns 1-3 | 2.33 (311) | 2.28 (133) | 1.45 (2171) | 2.21 (165) | 2.47 (146) |
| nets whole game | 4.46 (311) | 4.41 (133) | 4.23 (2171) | 4.30 (165) | 4.63 (146) |
| smoke whole game | 2.75 (311) | 2.70 (133) | 3.07 (2171) | 2.83 (165) | 2.66 (146) |
| decoys whole game | 4.28 (311) | 4.26 (133) | 3.84 (2171) | 4.05 (165) | 4.53 (146) |
| dashes on turn 1 | 2.00 (311) | 1.67 (133) | 2.63 (2171) | 1.93 (165) | 2.09 (146) |
| dashes whole game per unit | 4.12 (311) | 3.97 (133) | 4.88 (2171) | 4.49 (165) | 3.70 (146) |
| seat 0 | 30% (311) | 25% (133) | 34% (2171) | 30% (165) | 30% (146) |
| seat 1 | 36% (311) | 39% (133) | 33% (2171) | 36% (165) | 37% (146) |
| seat 2 | 34% (311) | 36% (133) | 33% (2171) | 35% (165) | 33% (146) |
| units per team (mean) | 4.40 (311) | 4.49 (133) | 4.49 (2171) | 4.33 (165) | 4.48 (146) |

**Win rate with and without each event**

| Event | team win % with it | team win % without it | others with it | others without it |
|---|---|---|---|---|
| lost a unit by turn 10 | 43% (165) | 64% (146) | 23% (1208) | 43% (963) |
| lost a unit by turn 20 | 46% (227) | 71% (84) | 26% (1579) | 50% (592) |
| a catch by turn 10 | 61% (214) | 36% (97) | 41% (1187) | 21% (984) |
| a catch by turn 20 | 59% (258) | 25% (53) | 39% (1568) | 16% (603) |
| made the first catch of the game | 67% (141) | 41% (170) | 50% (707) | 23% (1464) |
| lost a unit before any catch | 27% (113) | 68% (198) | 15% (973) | 46% (1198) |
| level on catches for first place | 55% (77) | 53% (234) | 47% (469) | 28% (1702) |
| seat 0 | 53% (93) | 53% (218) | 34% (735) | 31% (1436) |
| seat 1 | 52% (113) | 54% (198) | 29% (716) | 34% (1455) |
| seat 2 | 54% (105) | 52% (206) | 33% (720) | 32% (1451) |
| 3 units | 59% (79) | 51% (232) | 32% (543) | 32% (1628) |
| 4 units | 49% (92) | 55% (219) | 32% (550) | 32% (1621) |
| 5 units | 58% (77) | 51% (234) | 33% (556) | 32% (1615) |
| 6 units | 44% (63) | 55% (248) | 32% (522) | 32% (1649) |

**By the team that hunts it** (6 games or more)

| Opponent | games | team wins | opponent wins | team catches | team units lost |
|---|---|---|---|---|---|
| ThePyanist | 36 | 47% | 44% | 2.83 | 3.28 |
| RemoteException | 21 * | 29% | 52% | 3.29 | 3.57 |
| ATA | 20 * | 55% | 35% | 3.45 | 3.30 |
| Roman Empire | 17 * | 35% | 41% | 3.29 | 3.12 |
| RNG | 16 * | 38% | 31% | 2.69 | 2.38 |
| BitingBytes | 13 * | 85% | 15% | 3.54 | 2.08 |
| VibeClauder's | 12 * | 67% | 17% | 3.25 | 2.25 |
| Agave | 11 * | 36% | 55% | 3.09 | 3.09 |
| Kogaion | 10 * | 30% | 40% | 2.60 | 2.60 |
| INVALID FOP | 9 * | 67% | 22% | 3.11 | 2.67 |
| ATI x iHot | 9 * | 22% | 67% | 3.11 | 3.89 |
| FullStuck | 8 * | 38% | 38% | 3.00 | 4.13 |
| Vogue Mery | 7 * | 71% | 0% | 3.57 | 1.57 |
| Commit Happens | 7 * | 86% | 0% | 3.57 | 2.00 |

**By the team it hunts** (6 games or more)

| Opponent | games | team wins | opponent wins | team catches | team units lost |
|---|---|---|---|---|---|
| RNG | 26 * | 38% | 15% | 3.12 | 3.23 |
| ThePyanist | 25 * | 40% | 44% | 3.40 | 2.32 |
| VibeClauder's | 19 * | 58% | 11% | 2.74 | 2.79 |
| ATA | 18 * | 39% | 44% | 3.17 | 2.83 |
| RemoteException | 15 * | 67% | 7% | 3.07 | 2.27 |
| INVALID FOP | 14 * | 43% | 14% | 2.93 | 3.07 |
| Dragons Fight Club | 12 * | 50% | 17% | 3.00 | 2.67 |
| Agave | 12 * | 50% | 17% | 3.17 | 2.67 |
| Vogue Mery | 12 * | 58% | 8% | 2.25 | 2.25 |
| BitingBytes | 12 * | 42% | 8% | 3.08 | 3.50 |
| Roman Empire | 10 * | 50% | 10% | 3.20 | 3.40 |
| Kogaion | 9 * | 44% | 33% | 3.56 | 2.11 |
| FullStuck | 9 * | 56% | 22% | 3.67 | 3.44 |
| Bitoven | 7 * | 86% | 14% | 3.57 | 1.14 |

## 8. Other observations: Les Gens Bons

**Living unit-turns, whole game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| unit-turns | 79167 | 33585 | 535583 | 48527 | 30640 |
| held by a net | 2% (79167) | 2% (33585) | 3% (535583) | 2% (48527) | 3% (30640) |
| dash when available | 8% (71755) | 8% (30506) | 10% (474588) | 7% (44434) | 9% (27321) |
| standing still (free units) | 5% (77210) | 7% (32777) | 6% (520477) | 7% (47561) | 4% (29649) |
| predator within 1800 | 27% (63925) | 27% (25442) | 23% (449177) | 27% (39089) | 27% (24836) |
| predator within 1200 | 15% (63925) | 14% (25442) | 12% (449177) | 15% (39089) | 14% (24836) |
| median distance to nearest predator | 3125 (63925) | 3125 (25442) | 3125 (449177) | 3125 (39089) | 2875 (24836) |
| median distance to nearest prey | 3375 (61527) | 3375 (25051) | 3125 (451655) | 3625 (35138) | 3125 (26389) |
| prey within 2000 | 27% (61527) | 27% (25051) | 29% (451655) | 26% (35138) | 30% (26389) |
| net when prey within 2000 | 6% (16907) | 6% (6786) | 4% (132710) | 6% (8965) | 6% (7942) |
| predator within 3000: away | 57% (30206) | 58% (11821) | 52% (194287) | 60% (18191) | 53% (12015) |
| predator within 3000: toward | 13% (30206) | 14% (11821) | 16% (194287) | 12% (18191) | 16% (12015) |
| predator within 3000: sideways | 27% (30206) | 25% (11821) | 31% (194287) | 26% (18191) | 29% (12015) |
| predator within 3000: dash when available | 14% (26717) | 15% (10398) | 16% (169014) | 13% (16170) | 15% (10547) |
| predator within 3000: smoke | 2% (30206) | 3% (11821) | 3% (194287) | 2% (18191) | 3% (12015) |
| predator within 3000: decoy | 3% (30206) | 4% (11821) | 4% (194287) | 3% (18191) | 4% (12015) |
| predator within 3000: net | 2% (30206) | 2% (11821) | 2% (194287) | 2% (18191) | 3% (12015) |
| prey within 3000: toward | 66% (26159) | 63% (10303) | 65% (206909) | 67% (13982) | 66% (12177) |
| prey within 3000: away | 14% (26159) | 15% (10303) | 14% (206909) | 13% (13982) | 14% (12177) |
| prey within 3000: dash when available | 16% (22884) | 16% (8968) | 16% (179835) | 16% (12230) | 16% (10654) |
| DASH orders that were not executed (cooldown) | 0% (5638) | 0% (2349) | 0% (47465) | 0% (3210) | 0% (2428) |
| dashes: fleeing (predator within 2000, moving away) | 30% (5638) | 32% (2349) | 24% (47398) | 32% (3210) | 29% (2428) |
| dashes: attacking (prey within 2500, moving toward) | 44% (5638) | 44% (2349) | 39% (47398) | 42% (3210) | 46% (2428) |
| dashes: travelling (neither) | 25% (5638) | 24% (2349) | 37% (47398) | 26% (3210) | 25% (2428) |

**Nets aimed at units of this team (by anyone)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets aimed at its units | 1238 | 495 | 8625 | 616 | 622 |
| hit the unit | 56% (1238) | 57% (495) | 58% (8625) | 53% (616) | 58% (622) |
| absorbed by a decoy | 12% (1238) | 13% (495) | 8% (8625) | 13% (616) | 10% (622) |
| unit could dash | 69% (1238) | 68% (495) | 71% (8625) | 70% (616) | 69% (622) |
| hit when the unit could dash | 46% (781) | 47% (316) | 51% (5735) | 43% (405) | 49% (376) |
| hit when its dash was on cooldown | 73% (366) | 73% (153) | 71% (2448) | 72% (177) | 75% (189) |
| the unit dashed on that turn | 32% (1238) | 30% (495) | 30% (8625) | 32% (616) | 31% (622) |
| hit when it dashed that turn | 28% (393) | 33% (150) | 30% (2557) | 25% (199) | 32% (194) |
| hit when it did not dash | 68% (754) | 66% (319) | 69% (5626) | 66% (383) | 71% (371) |
| thrown by its predator team | 68% (1238) | 68% (495) | 70% (8625) | 68% (616) | 68% (622) |
| thrown by turn 5 | 49% (1238) | 45% (495) | 46% (8625) | 49% (616) | 48% (622) |

**Trigger table, all turns: nearest free predator at this distance**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 6704 | 3% (6704) | 5% (6704) | 1% (6704) | 22% (5789) | 79% (6344) | 5% (6344) | 16% (6704) | 32251 | 6% (32251) | 5% (32251) | 3% (32251) | 24% (27180) | 71% (29449) | 6% (29449) | 24% (32251) |
| 1000-1500 | 6354 | 5% (6354) | 7% (6354) | 2% (6354) | 15% (5044) | 68% (6114) | 6% (6114) | 11% (6354) | 41600 | 5% (41600) | 6% (41600) | 3% (41600) | 19% (32554) | 67% (39841) | 6% (39841) | 13% (41600) |
| 1500-2000 | 5946 | 3% (5946) | 7% (5946) | 3% (5946) | 12% (5031) | 57% (5752) | 10% (5752) | 6% (5946) | 40179 | 3% (40179) | 6% (40179) | 3% (40179) | 16% (33375) | 52% (38964) | 11% (38964) | 7% (40179) |
| 2000-2500 | 5920 | 1% (5920) | 1% (5920) | 3% (5920) | 10% (5230) | 43% (5791) | 20% (5791) | 2% (5920) | 41064 | 1% (41064) | 2% (41064) | 2% (41064) | 11% (35470) | 39% (40195) | 22% (40195) | 3% (41064) |
| 2500-3000 | 5746 | 0% (5746) | 0% (5746) | 2% (5746) | 8% (5155) | 38% (5619) | 25% (5619) | 1% (5746) | 40674 | 1% (40674) | 1% (40674) | 2% (40674) | 10% (35772) | 34% (39784) | 27% (39784) | 1% (40674) |

**Trigger table, all turns: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 2844 | 2% (2267) | 6% (107) | 8% (470) | 11% (2109) | 80% (2844) | 31% (2844) | 18919 | 2% (16017) | 7% (864) | 3% (2038) | 11% (14033) | 81% (18919) | 28% (18919) |
| 800-1200 | 4262 | 4% (3420) | 12% (525) | 9% (317) | 20% (3269) | 84% (4262) | 22% (4262) | 33013 | 3% (27127) | 8% (4161) | 3% (1725) | 18% (26125) | 80% (33013) | 18% (33013) |
| 1200-1600 | 4435 | 6% (3331) | 9% (843) | 7% (261) | 26% (3890) | 78% (4435) | 16% (4435) | 37143 | 4% (28569) | 8% (6899) | 3% (1675) | 24% (32066) | 75% (37143) | 13% (37143) |
| 1600-2000 | 4222 | 7% (3372) | 13% (622) | 7% (228) | 22% (3897) | 66% (4222) | 12% (4222) | 35787 | 5% (29327) | 7% (4976) | 4% (1484) | 19% (32354) | 65% (35787) | 9% (35787) |
| 2000-2500 | 5185 | 3% (4418) | 4% (584) | 3% (183) | 10% (4841) | 53% (5185) | 9% (5185) | 43430 | 2% (36573) | 3% (5339) | 3% (1518) | 12% (39941) | 52% (43430) | 7% (43430) |

**All nets of the game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets | 1386 | 587 | 9194 | 710 | 676 |
| hit prey | 43% (1386) | 45% (587) | 32% (9194) | 47% (710) | 39% (676) |
| hit predator | 8% (1386) | 7% (587) | 22% (9194) | 8% (710) | 7% (676) |
| absorbed by a decoy | 13% (1386) | 12% (587) | 11% (9194) | 12% (710) | 14% (676) |
| aimed at predators | 10% (1386) | 10% (587) | 29% (9194) | 10% (710) | 10% (676) |
| no enemy near the line | 6% (1386) | 6% (587) | 7% (9194) | 4% (710) | 8% (676) |
| thrown while held | 6% (1386) | 7% (587) | 13% (9194) | 6% (710) | 7% (676) |
| thrown when ahead | 10% (1386) | 10% (587) | 12% (9194) | 13% (710) | 6% (676) |
| thrown when behind | 18% (1386) | 22% (587) | 33% (9194) | 12% (710) | 25% (676) |
| turn (q25 / median / q75) | 1 / 3 / 11 (1386) | 1 / 3 / 12 (587) | 2 / 7 / 17 (9194) | 1 / 3 / 12 (710) | 1 / 3 / 10 (676) |

---

# Lore

## 1. Opening (turns 1-5): Lore

**Turn 1, per unit (direction of the order relative to the nearest predator start / nearest prey start; cos > 0.5 away, < -0.5 toward)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| units | 286 | 277 | 9584 | 125 | 161 |
| dash on turn 1 | 49% (286) | 50% (277) | 60% (9584) | 50% (125) | 48% (161) |
| dash on turn 1, nearest predator under 2000 | 68% (77) | 68% (77) | 79% (2739) | 74% (31) | 63% (46) |
| dash on turn 1, nearest predator 2000-3500 | 38% (110) | 39% (107) | 56% (3302) | 41% (49) | 36% (61) |
| dash on turn 1, nearest predator over 3500 | 46% (99) | 48% (93) | 50% (3543) | 42% (45) | 50% (54) |
| dash on turn 1, nearest prey under 2000 | 91% (66) | 91% (66) | 77% (2721) | 96% (27) * | 87% (39) |
| dash on turn 1, nearest prey 2000-3500 | 57% (114) | 58% (111) | 58% (3305) | 61% (51) | 54% (63) |
| dash on turn 1, nearest prey over 3500 | 14% (106) | 15% (100) | 50% (3558) | 11% (47) | 17% (59) |
| vs predator: away | 36% (286) | 37% (277) | 32% (9584) | 30% (125) | 40% (161) |
| vs predator: toward | 24% (286) | 24% (277) | 28% (9584) | 24% (125) | 25% (161) |
| vs predator: sideways | 40% (286) | 39% (277) | 40% (9584) | 46% (125) | 35% (161) |
| vs predator: no move | 0% (286) | 0% (277) | 1% (9584) | 0% (125) | 0% (161) |
| vs prey: toward | 65% (286) | 64% (277) | 72% (9584) | 63% (125) | 66% (161) |
| vs prey: away | 17% (286) | 17% (277) | 11% (9584) | 16% (125) | 17% (161) |
| vs prey: sideways | 18% (286) | 18% (277) | 17% (9584) | 21% (125) | 16% (161) |
| predator under 2000: away from it | 70% (77) | 70% (77) | 54% (2739) | 65% (31) | 74% (46) |
| predator under 2000: toward nearest prey | 49% (77) | 49% (77) | 57% (2739) | 39% (31) | 57% (46) |
| predator over 3500: toward nearest prey | 79% (99) | 78% (93) | 83% (3543) | 80% (45) | 78% (54) |
| prey nearer than predator: toward prey | 86% (127) | 85% (122) | 85% (4686) | 82% (57) | 89% (70) |
| predator nearer than prey: away from predator | 50% (157) | 51% (153) | 40% (4756) | 40% (68) | 57% (89) |
| prey under 2000: toward it | 91% (66) | 91% (66) | 84% (2721) | 85% (27) * | 95% (39) |
| prey under 2000: dash toward it | 85% (66) | 85% (66) | 68% (2721) | 85% (27) * | 85% (39) |
| dashers: toward prey | 84% (140) | 83% (139) | 77% (5793) | 77% (62) | 88% (78) |
| dashers: away from predator | 39% (140) | 40% (139) | 36% (5793) | 37% (62) | 41% (78) |
| toward the centre | 48% (286) | 47% (277) | 51% (9584) | 48% (125) | 47% (161) |
| toward the wall | 21% (286) | 21% (277) | 18% (9584) | 20% (125) | 21% (161) |

**Turn 1, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 47% (295) | 49% (286) | 58% (10052) | 48% (128) | 47% (167) |
| toward nearest prey (any distance) | 65% (291) | 64% (282) | 72% (9749) | 63% (125) | 66% (166) |
| away from nearest predator (any distance) | 36% (291) | 37% (282) | 32% (9749) | 30% (125) | 40% (166) |
| toward nearest predator | 25% (291) | 24% (282) | 28% (9749) | 24% (125) | 25% (166) |
| median distance to nearest predator | 2875 (291) | 2875 (282) | 2875 (9778) | 2875 (125) | 2875 (166) |
| median distance to nearest prey | 3125 (291) | 2875 (282) | 2875 (9777) | 2875 (125) | 3125 (166) |
| predator within 1800 | 21% (291) | 22% (282) | 23% (9778) | 21% (125) | 21% (166) |
| prey within 2000 | 23% (291) | 23% (282) | 28% (9777) | 22% (125) | 23% (166) |
| net thrown when prey within 2000 | 0% (66) | 0% (66) | 31% (2740) | 0% (27) * | 0% (39) |
| held by a net | 0% (295) | 0% (286) | 0% (10052) | 0% (128) | 0% (167) |

**Turn 2, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 8% (278) | 7% (269) | 8% (9627) | 7% (121) | 8% (157) |
| toward nearest prey (any distance) | 53% (243) | 54% (234) | 59% (8366) | 53% (97) | 54% (146) |
| away from nearest predator (any distance) | 46% (243) | 47% (234) | 37% (8366) | 45% (97) | 47% (146) |
| toward nearest predator | 28% (243) | 27% (234) | 27% (8366) | 28% (97) | 28% (146) |
| median distance to nearest predator | 2625 (261) | 2625 (252) | 2625 (8835) | 2625 (105) | 2625 (156) |
| median distance to nearest prey | 2375 (267) | 2375 (258) | 2375 (8837) | 2375 (111) | 2125 (156) |
| predator within 1800 | 30% (261) | 30% (252) | 32% (8835) | 30% (105) | 29% (156) |
| prey within 2000 | 41% (267) | 43% (258) | 39% (8837) | 38% (111) | 44% (156) |
| net thrown when prey within 2000 | 50% (110) | 50% (110) | 27% (3487) | 48% (42) | 51% (68) |
| held by a net | 6% (295) | 6% (286) | 4% (10018) | 5% (128) | 6% (167) |

**Turn 3, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 21% (255) | 21% (248) | 37% (8827) | 24% (113) | 19% (142) |
| toward nearest prey (any distance) | 53% (221) | 52% (214) | 54% (7777) | 60% (91) | 48% (130) |
| away from nearest predator (any distance) | 36% (221) | 36% (214) | 37% (7777) | 30% (91) | 40% (130) |
| toward nearest predator | 25% (221) | 25% (214) | 27% (7777) | 20% (91) | 28% (130) |
| median distance to nearest predator | 2625 (263) | 2625 (254) | 2625 (8983) | 2625 (107) | 2625 (156) |
| median distance to nearest prey | 2375 (269) | 2375 (260) | 2375 (8978) | 2375 (113) | 2125 (156) |
| predator within 1800 | 28% (263) | 27% (254) | 31% (8983) | 26% (107) | 29% (156) |
| prey within 2000 | 41% (269) | 41% (260) | 39% (8978) | 38% (113) | 42% (156) |
| net thrown when prey within 2000 | 16% (109) | 15% (107) | 13% (3518) | 14% (43) | 17% (66) |
| held by a net | 13% (294) | 13% (285) | 11% (9932) | 12% (128) | 14% (166) |

**Turn 4, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 9% (238) | 10% (231) | 12% (8485) | 8% (106) | 11% (132) |
| toward nearest prey (any distance) | 46% (202) | 45% (195) | 50% (7545) | 59% (82) | 37% (120) |
| away from nearest predator (any distance) | 40% (202) | 39% (195) | 38% (7545) | 40% (82) | 39% (120) |
| toward nearest predator | 25% (202) | 24% (195) | 27% (7545) | 26% (82) | 24% (120) |
| median distance to nearest predator | 2625 (256) | 2625 (247) | 2625 (8789) | 2875 (102) | 2625 (154) |
| median distance to nearest prey | 2375 (265) | 2375 (256) | 2625 (8781) | 2375 (111) | 2625 (154) |
| predator within 1800 | 30% (256) | 30% (247) | 27% (8789) | 25% (102) | 33% (154) |
| prey within 2000 | 39% (265) | 39% (256) | 34% (8781) | 42% (111) | 37% (154) |
| net thrown when prey within 2000 | 13% (104) | 12% (100) | 11% (3009) | 17% (47) | 11% (57) |
| held by a net | 17% (288) | 17% (279) | 11% (9587) | 15% (125) | 19% (163) |

**Turn 5, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 10% (227) | 10% (220) | 9% (8158) | 12% (101) | 9% (126) |
| toward nearest prey (any distance) | 53% (187) | 54% (180) | 49% (7336) | 56% (75) | 52% (112) |
| away from nearest predator (any distance) | 32% (187) | 32% (180) | 37% (7336) | 32% (75) | 31% (112) |
| toward nearest predator | 30% (187) | 29% (180) | 27% (7336) | 29% (75) | 30% (112) |
| median distance to nearest predator | 2875 (251) | 2875 (243) | 2875 (8654) | 2875 (101) | 2625 (150) |
| median distance to nearest prey | 2625 (260) | 2625 (252) | 2875 (8646) | 2375 (110) | 2875 (150) |
| predator within 1800 | 29% (251) | 29% (243) | 25% (8654) | 29% (101) | 29% (150) |
| prey within 2000 | 35% (260) | 35% (252) | 32% (8646) | 38% (110) | 33% (150) |
| net thrown when prey within 2000 | 9% (91) | 8% (87) | 10% (2753) | 12% (42) | 6% (49) |
| held by a net | 20% (282) | 20% (274) | 13% (9363) | 19% (124) | 20% (158) |

**Items and dashes per game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets on turn 1 (per game) | 0.00 (64) | 0.00 (62) | 0.63 (2242) | 0.00 (28) * | 0.00 (36) |
| nets on turn 2 (per game) | 1.25 (64) | 1.29 (62) | 0.59 (2242) | 1.14 (28) * | 1.33 (36) |
| nets on turn 3 (per game) | 0.41 (64) | 0.40 (62) | 0.28 (2242) | 0.29 (28) * | 0.50 (36) |
| nets on turn 4 (per game) | 0.42 (64) | 0.40 (62) | 0.23 (2242) | 0.36 (28) * | 0.47 (36) |
| nets on turn 5 (per game) | 0.20 (64) | 0.19 (62) | 0.20 (2242) | 0.32 (28) * | 0.11 (36) |
| nets in turns 1-5 (per game) | 2.28 (64) | 2.29 (62) | 1.93 (2242) | 2.11 (28) * | 2.42 (36) |
| nets whole game (per game) | 4.63 (64) | 4.65 (62) | 4.23 (2242) | 4.50 (28) * | 4.72 (36) |
| games with at least one net in turns 1-5 | 86% (64) | 85% (62) | 78% (2242) | 82% (28) * | 89% (36) |
| smokes on turn 1 (per game) | 0.00 (64) | 0.00 (62) | 0.29 (2242) | 0.00 (28) * | 0.00 (36) |
| smokes on turn 2 (per game) | 0.00 (64) | 0.00 (62) | 0.17 (2242) | 0.00 (28) * | 0.00 (36) |
| smokes on turn 3 (per game) | 0.00 (64) | 0.00 (62) | 0.13 (2242) | 0.00 (28) * | 0.00 (36) |
| smokes on turn 4 (per game) | 0.00 (64) | 0.00 (62) | 0.10 (2242) | 0.00 (28) * | 0.00 (36) |
| smokes on turn 5 (per game) | 0.00 (64) | 0.00 (62) | 0.09 (2242) | 0.00 (28) * | 0.00 (36) |
| smokes in turns 1-5 (per game) | 0.00 (64) | 0.00 (62) | 0.77 (2242) | 0.00 (28) * | 0.00 (36) |
| smokes whole game (per game) | 0.84 (64) | 0.85 (62) | 3.11 (2242) | 0.96 (28) * | 0.75 (36) |
| games with at least one smoke in turns 1-5 | 0% (64) | 0% (62) | 47% (2242) | 0% (28) * | 0% (36) |
| decoys on turn 1 (per game) | 0.00 (64) | 0.00 (62) | 0.48 (2242) | 0.00 (28) * | 0.00 (36) |
| decoys on turn 2 (per game) | 0.00 (64) | 0.00 (62) | 0.40 (2242) | 0.00 (28) * | 0.00 (36) |
| decoys on turn 3 (per game) | 0.06 (64) | 0.06 (62) | 0.25 (2242) | 0.07 (28) * | 0.06 (36) |
| decoys on turn 4 (per game) | 0.06 (64) | 0.06 (62) | 0.20 (2242) | 0.07 (28) * | 0.06 (36) |
| decoys on turn 5 (per game) | 0.03 (64) | 0.03 (62) | 0.14 (2242) | 0.00 (28) * | 0.06 (36) |
| decoys in turns 1-5 (per game) | 0.16 (64) | 0.16 (62) | 1.47 (2242) | 0.14 (28) * | 0.17 (36) |
| decoys whole game (per game) | 2.89 (64) | 2.92 (62) | 3.89 (2242) | 3.07 (28) * | 2.75 (36) |
| games with at least one decoy in turns 1-5 | 11% (64) | 11% (62) | 61% (2242) | 7% (28) * | 14% (36) |
| dashes on turn 1 (per game) | 2.19 (64) | 2.24 (62) | 2.58 (2242) | 2.21 (28) * | 2.17 (36) |
| dashes in turns 1-5 (per game) | 4.06 (64) | 4.10 (62) | 5.18 (2242) | 4.18 (28) * | 3.97 (36) |
| dashes whole game (per game) | 19.67 (64) | 19.71 (62) | 21.64 (2242) | 20.75 (28) * | 18.83 (36) |

**Nets, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 146 | 142 | 4328 | 59 | 87 |
| distance to nearest predator at the order (q25 / median / q75) | 1026 / 1757 / 3140 (144) | 1007 / 1757 / 3180 (140) | 1438 / 2327 / 3781 (4319) | 1196 / 1747 / 3105 (57) | 1007 / 1757 / 3140 (87) |
| distance to nearest prey at the order (q25 / median / q75) | 1127 / 1548 / 2977 (146) | 1183 / 1620 / 3103 (142) | 1246 / 1695 / 2247 (4325) | 1072 / 1519 / 3132 (59) | 1199 / 1668 / 2875 (87) |
| predator within 1500 | 38% (144) | 39% (140) | 27% (4319) | 39% (57) | 38% (87) |
| predator within 2500 | 63% (144) | 63% (140) | 53% (4319) | 60% (57) | 66% (87) |
| prey within 2000 | 64% (146) | 63% (142) | 67% (4325) | 66% (59) | 63% (87) |
| thrower held by a net | 28% (146) | 29% (142) | 11% (4328) | 25% (59) | 30% (87) |
| hit prey | 38% (146) | 39% (142) | 29% (4328) | 42% (59) | 36% (87) |
| hit predator | 36% (146) | 37% (142) | 16% (4328) | 32% (59) | 38% (87) |
| aimed at a predator (hit or miss) | 42% (146) | 43% (142) | 25% (4328) | 37% (59) | 45% (87) |
| aimed at prey (hit or miss) | 58% (146) | 57% (142) | 70% (4328) | 63% (59) | 55% (87) |
| no enemy near the line | 0% (146) | 0% (142) | 6% (4328) | 0% (59) | 0% (87) |
| absorbed by a decoy | 8% (146) | 8% (142) | 12% (4328) | 8% (59) | 8% (87) |
| stopped by a tree | 2% (146) | 1% (142) | 4% (4328) | 3% (59) | 1% (87) |
| distance thrower-target (q25 / median / q75) | 861 / 1249 / 1545 (146) | 861 / 1268 / 1548 (142) | 1150 / 1497 / 1869 (4072) | 884 / 1234 / 1535 (59) | 838 / 1310 / 1548 (87) |
| target could dash | 29% (146) | 28% (142) | 66% (4081) | 32% (59) | 28% (87) |
| target already held | 2% (146) | 2% (142) | 3% (4081) | 0% (59) | 3% (87) |
| hit rate when the target could dash | 70% (40) | 73% (37) | 37% (2570) | 68% (19) * | 71% (21) * |
| hit rate when the target could not dash | 76% (103) | 76% (102) | 67% (1385) | 78% (40) | 75% (63) |
| nets at predators: one of our units held within 2000 of it (rescue) | 3% (61) | 3% (61) | 2% (1061) | 9% (22) * | 0% (39) |
| nets at predators: predator within 1500 of the thrower | 72% (61) | 72% (61) | 69% (1061) | 77% (22) * | 69% (39) |
| hit one of our own units | 1% (146) | 0% (142) | 0% (4328) | 0% (59) | 1% (87) |

**Nets, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 150 | 146 | 5165 | 67 | 83 |
| distance to nearest predator at the order (q25 / median / q75) | 967 / 1614 / 3336 (143) | 967 / 1614 / 3485 (139) | 1301 / 2514 / 4149 (5010) | 946 / 1380 / 2756 (63) | 1097 / 1654 / 4065 (80) |
| distance to nearest prey at the order (q25 / median / q75) | 1418 / 2473 / 4470 (150) | 1389 / 2526 / 4470 (146) | 1245 / 1769 / 2753 (5067) | 1544 / 2588 / 4452 (67) | 1344 / 2377 / 4472 (83) |
| predator within 1500 | 48% (143) | 47% (139) | 31% (5010) | 51% (63) | 45% (80) |
| predator within 2500 | 68% (143) | 67% (139) | 50% (5010) | 73% (63) | 64% (80) |
| prey within 2000 | 43% (150) | 43% (146) | 62% (5067) | 42% (67) | 45% (83) |
| thrower held by a net | 26% (150) | 27% (146) | 14% (5165) | 30% (67) | 23% (83) |
| hit prey | 27% (150) | 27% (146) | 37% (5165) | 30% (67) | 25% (83) |
| hit predator | 51% (150) | 51% (146) | 24% (5165) | 51% (67) | 51% (83) |
| aimed at a predator (hit or miss) | 54% (150) | 55% (146) | 30% (5165) | 55% (67) | 53% (83) |
| aimed at prey (hit or miss) | 45% (150) | 44% (146) | 62% (5165) | 42% (67) | 47% (83) |
| no enemy near the line | 1% (150) | 1% (146) | 8% (5165) | 3% (67) | 0% (83) |
| absorbed by a decoy | 6% (150) | 5% (146) | 11% (5165) | 3% (67) | 8% (83) |
| stopped by a tree | 3% (150) | 3% (146) | 5% (5165) | 4% (67) | 2% (83) |
| distance thrower-target (q25 / median / q75) | 952 / 1274 / 1667 (148) | 952 / 1260 / 1653 (144) | 1009 / 1387 / 1789 (4714) | 1019 / 1247 / 1630 (65) | 950 / 1312 / 1706 (83) |
| target could dash | 53% (148) | 52% (144) | 78% (4753) | 46% (65) | 58% (83) |
| target already held | 5% (148) | 5% (144) | 7% (4753) | 5% (65) | 5% (83) |
| hit rate when the target could dash | 78% (73) | 79% (70) | 61% (3374) | 78% (27) * | 78% (46) |
| hit rate when the target could not dash | 79% (68) | 79% (67) | 75% (1047) | 86% (35) | 73% (33) |
| nets at predators: one of our units held within 2000 of it (rescue) | 1% (81) | 1% (80) | 2% (1559) | 3% (37) | 0% (44) |
| nets at predators: predator within 1500 of the thrower | 78% (81) | 78% (80) | 73% (1559) | 84% (37) | 73% (44) |
| hit one of our own units | 1% (150) | 1% (146) | 0% (5165) | 1% (67) | 0% (83) |

**Smoke, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 0 | 0 | 1733 | 0 | 0 |
| distance to nearest predator at the order (q25 / median / q75) | - (0) * | - (0) * | 1096 / 1501 / 1990 (1732) | - (0) * | - (0) * |
| distance to nearest prey at the order (q25 / median / q75) | - (0) * | - (0) * | 1855 / 2856 / 4236 (1730) | - (0) * | - (0) * |
| predator within 1500 | - (0) * | - (0) * | 50% (1732) | - (0) * | - (0) * |
| predator within 2500 | - (0) * | - (0) * | 87% (1732) | - (0) * | - (0) * |
| prey within 2000 | - (0) * | - (0) * | 28% (1730) | - (0) * | - (0) * |
| thrower held by a net | - (0) * | - (0) * | 11% (1733) | - (0) * | - (0) * |
| cloud centre along the line unit-predator, 0 = unit, 1 = predator (q25 / median / q75, x100) | - (0) * | - (0) * | 0 / 0 / 62 (1732) | - (0) * | - (0) * |
| cloud centre off that line (median) | - (0) * | - (0) * | 1 (1732) | - (0) * | - (0) * |
| thrower inside its own cloud (centre within 1900) | - (0) * | - (0) * | 91% (1733) | - (0) * | - (0) * |
| nearest predator inside the cloud (within 1900 of the centre) | - (0) * | - (0) * | 63% (1732) | - (0) * | - (0) * |
| dropped on itself (within 400) | - (0) * | - (0) * | 54% (1733) | - (0) * | - (0) * |
| thrown 400-1500 | - (0) * | - (0) * | 26% (1733) | - (0) * | - (0) * |
| thrown over 1500 | - (0) * | - (0) * | 20% (1733) | - (0) * | - (0) * |
| thrown toward the predator | - (0) * | - (0) * | 63% (798) | - (0) * | - (0) * |
| a held team-mate within 1900 of the cloud centre | - (0) * | - (0) * | 2% (1733) | - (0) * | - (0) * |
| nearest predator to the cloud centre (median) | - (0) * | - (0) * | 1651 (1732) | - (0) * | - (0) * |
| nearest prey to the cloud centre (median) | - (0) * | - (0) * | 2722 (1730) | - (0) * | - (0) * |

**Smoke, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 54 | 53 | 5235 | 27 | 27 |
| distance to nearest predator at the order (q25 / median / q75) | 829 / 1220 / 1914 (54) | 829 / 1220 / 1914 (53) | 846 / 1177 / 1631 (5207) | 825 / 1121 / 1431 (27) * | 976 / 1271 / 2434 (27) * |
| distance to nearest prey at the order (q25 / median / q75) | 2338 / 3287 / 5549 (46) | 2338 / 3240 / 5549 (45) | 2229 / 3475 / 5272 (4915) | 2338 / 2977 / 5992 (19) * | 2294 / 3287 / 5241 (27) * |
| predator within 1500 | 69% (54) | 68% (53) | 70% (5207) | 81% (27) * | 56% (27) * |
| predator within 2500 | 87% (54) | 87% (53) | 93% (5207) | 96% (27) * | 78% (27) * |
| prey within 2000 | 17% (46) | 18% (45) | 20% (4915) | 21% (19) * | 15% (27) * |
| thrower held by a net | 0% (54) | 0% (53) | 11% (5235) | 0% (27) * | 0% (27) * |
| cloud centre along the line unit-predator, 0 = unit, 1 = predator (q25 / median / q75, x100) | 17 / 48 / 80 (54) | 17 / 47 / 74 (53) | 0 / 0 / 73 (5205) | 16 / 55 / 84 (27) * | 18 / 33 / 72 (27) * |
| cloud centre off that line (median) | 201 (54) | 201 (53) | 1 (5207) | 201 (27) * | 159 (27) * |
| thrower inside its own cloud (centre within 1900) | 100% (54) | 100% (53) | 88% (5235) | 100% (27) * | 100% (27) * |
| nearest predator inside the cloud (within 1900 of the centre) | 70% (54) | 70% (53) | 79% (5207) | 81% (27) * | 59% (27) * |
| dropped on itself (within 400) | 0% (54) | 0% (53) | 58% (5235) | 0% (27) * | 0% (27) * |
| thrown 400-1500 | 100% (54) | 100% (53) | 25% (5235) | 100% (27) * | 100% (27) * |
| thrown over 1500 | 0% (54) | 0% (53) | 17% (5235) | 0% (27) * | 0% (27) * |
| thrown toward the predator | 56% (54) | 55% (53) | 73% (2172) | 52% (27) * | 59% (27) * |
| a held team-mate within 1900 of the cloud centre | 0% (54) | 0% (53) | 1% (5235) | 0% (27) * | 0% (27) * |
| nearest predator to the cloud centre (median) | 1146 (54) | 1146 (53) | 1243 (5207) | 875 (27) * | 1691 (27) * |
| nearest prey to the cloud centre (median) | 3378 (46) | 3346 (45) | 3479 (4915) | 3378 (19) * | 3346 (27) * |

**Decoys, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 10 | 10 | 3297 | 4 | 6 |
| distance to nearest predator at the order (q25 / median / q75) | 1386 / 1641 / 2116 (10) * | 1386 / 1641 / 2116 (10) * | 1177 / 1524 / 1930 (3294) | 1641 / 2010 / 3199 (4) * | 725 / 1427 / 2116 (6) * |
| distance to nearest prey at the order (q25 / median / q75) | 981 / 1388 / 4623 (10) * | 981 / 1388 / 4623 (10) * | 2000 / 2926 / 4284 (3291) | 2429 / 5316 / 5493 (4) * | 750 / 1304 / 1388 (6) * |
| predator within 1500 | 50% (10) * | 50% (10) * | 49% (3294) | 25% (4) * | 67% (6) * |
| predator within 2500 | 80% (10) * | 80% (10) * | 90% (3294) | 75% (4) * | 83% (6) * |
| prey within 2000 | 60% (10) * | 60% (10) * | 25% (3291) | 25% (4) * | 83% (6) * |
| thrower held by a net | 0% (10) * | 0% (10) * | 7% (3297) | 0% (4) * | 0% (6) * |
| decoy walks toward the nearest predator | 50% (10) * | 50% (10) * | 17% (3294) | 75% (4) * | 33% (6) * |
| decoy walks away from the nearest predator | 20% (10) * | 20% (10) * | 40% (3294) | 0% (4) * | 33% (6) * |
| decoy walks toward the nearest prey | 30% (10) * | 30% (10) * | 30% (3291) | 25% (4) * | 33% (6) * |
| decoy: same point as the unit | 0% (10) * | 0% (10) * | 0% (3297) | 0% (4) * | 0% (6) * |
| decoy: same direction as the unit | 30% (10) * | 30% (10) * | 15% (3297) | 25% (4) * | 33% (6) * |
| decoy: opposite direction | 20% (10) * | 20% (10) * | 30% (3297) | 50% (4) * | 0% (6) * |
| decoy: sideways from the unit | 50% (10) * | 50% (10) * | 50% (3297) | 25% (4) * | 67% (6) * |

**Decoys, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 175 | 171 | 5421 | 82 | 93 |
| distance to nearest predator at the order (q25 / median / q75) | 639 / 888 / 1297 (175) | 637 / 878 / 1282 (171) | 1053 / 1429 / 1797 (5390) | 666 / 862 / 1325 (82) | 637 / 913 / 1239 (93) |
| distance to nearest prey at the order (q25 / median / q75) | 2441 / 4601 / 7378 (149) | 2441 / 4601 / 7308 (145) | 2361 / 3509 / 5124 (5191) | 3355 / 5975 / 7827 (56) | 2261 / 3685 / 7114 (93) |
| predator within 1500 | 83% (175) | 84% (171) | 55% (5390) | 80% (82) | 85% (93) |
| predator within 2500 | 93% (175) | 94% (171) | 91% (5390) | 91% (82) | 94% (93) |
| prey within 2000 | 17% (149) | 17% (145) | 17% (5191) | 13% (56) | 19% (93) |
| thrower held by a net | 0% (175) | 0% (171) | 5% (5421) | 0% (82) | 0% (93) |
| decoy walks toward the nearest predator | 18% (175) | 19% (171) | 13% (5390) | 22% (82) | 15% (93) |
| decoy walks away from the nearest predator | 49% (175) | 48% (171) | 39% (5390) | 51% (82) | 46% (93) |
| decoy walks toward the nearest prey | 27% (149) | 27% (145) | 31% (5191) | 30% (56) | 25% (93) |
| decoy: same point as the unit | 0% (175) | 0% (171) | 0% (5421) | 0% (82) | 0% (93) |
| decoy: same direction as the unit | 21% (175) | 20% (171) | 16% (5421) | 22% (82) | 19% (93) |
| decoy: opposite direction | 32% (175) | 32% (171) | 29% (5421) | 30% (82) | 33% (93) |
| decoy: sideways from the unit | 47% (175) | 47% (171) | 51% (5421) | 48% (82) | 47% (93) |

**Trigger table, turn 1: nearest free predator at this distance (start of the turn)**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 16 * | 0% (16) * | 0% (16) * | 0% (16) * | 94% (16) * | 81% (16) * | 0% (16) * | 6% (16) * | 534 | 20% (534) | 29% (534) | 22% (534) | 93% (534) | 72% (534) | 2% (534) | 16% (534) |
| 1000-1500 | 18 * | 0% (18) * | 0% (18) * | 0% (18) * | 89% (18) * | 72% (18) * | 0% (18) * | 6% (18) * | 934 | 15% (934) | 38% (934) | 17% (934) | 83% (934) | 57% (934) | 1% (934) | 14% (934) |
| 1500-2000 | 44 | 0% (44) | 0% (44) | 0% (44) | 48% (44) | 66% (44) | 0% (44) | 5% (44) | 1290 | 14% (1290) | 26% (1290) | 20% (1290) | 69% (1290) | 45% (1290) | 3% (1290) | 10% (1290) |
| 2000-2500 | 38 | 0% (38) | 0% (38) | 0% (38) | 37% (38) | 47% (38) | 5% (38) | 3% (38) | 1256 | 11% (1256) | 14% (1256) | 16% (1256) | 60% (1256) | 40% (1256) | 11% (1256) | 6% (1256) |
| 2500-3000 | 45 | 0% (45) | 0% (45) | 0% (45) | 38% (45) | 27% (45) | 13% (45) | 2% (45) | 1137 | 5% (1137) | 4% (1137) | 13% (1137) | 53% (1137) | 30% (1137) | 26% (1137) | 3% (1137) |

**Trigger table, turns 2+: nearest free predator at this distance**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 1149 | 2% (1149) | 9% (1149) | 5% (1149) | 27% (1005) | 81% (1082) | 3% (1082) | 17% (1149) | 32919 | 6% (32919) | 4% (32919) | 3% (32919) | 23% (27673) | 71% (30031) | 6% (30031) | 24% (32919) |
| 1000-1500 | 1503 | 1% (1503) | 3% (1503) | 3% (1503) | 14% (1216) | 82% (1469) | 2% (1469) | 9% (1503) | 41802 | 5% (41802) | 6% (41802) | 3% (41802) | 17% (32479) | 67% (39963) | 7% (39963) | 13% (41802) |
| 1500-2000 | 1098 | 0% (1098) | 1% (1098) | 3% (1098) | 8% (903) | 66% (1062) | 8% (1062) | 5% (1098) | 40464 | 3% (40464) | 5% (40464) | 2% (40464) | 14% (33415) | 53% (39216) | 11% (39216) | 7% (40464) |
| 2000-2500 | 1045 | 0% (1045) | 1% (1045) | 2% (1045) | 7% (913) | 48% (1020) | 17% (1020) | 2% (1045) | 41049 | 1% (41049) | 1% (41049) | 2% (41049) | 9% (35301) | 39% (40154) | 22% (40154) | 3% (41049) |
| 2500-3000 | 1034 | 0% (1034) | 1% (1034) | 1% (1034) | 7% (919) | 31% (1009) | 27% (1009) | 1% (1034) | 40593 | 0% (40593) | 1% (40593) | 2% (40593) | 9% (35593) | 34% (39690) | 27% (39690) | 1% (40593) |

**Trigger table, turn 1: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 7 * | 0% (7) * | - (0) * | - (0) * | 86% (7) * | 100% (7) * | 29% (7) * | 200 | 25% (200) | - (0) * | - (0) * | 66% (200) | 88% (200) | 19% (200) |
| 800-1200 | 14 * | 0% (14) * | - (0) * | - (0) * | 86% (14) * | 93% (14) * | 21% (14) * | 619 | 23% (619) | - (0) * | - (0) * | 81% (619) | 88% (619) | 14% (619) |
| 1200-1600 | 21 * | 0% (21) * | - (0) * | - (0) * | 95% (21) * | 95% (21) * | 14% (21) * | 846 | 26% (846) | - (0) * | - (0) * | 87% (846) | 85% (846) | 12% (846) |
| 1600-2000 | 24 * | 0% (24) * | - (0) * | - (0) * | 92% (24) * | 83% (24) * | 13% (24) * | 1075 | 39% (1075) | - (0) * | - (0) * | 68% (1075) | 79% (1075) | 12% (1075) |
| 2000-2500 | 39 | 0% (39) | - (0) * | - (0) * | 74% (39) | 82% (39) | 3% (39) | 1241 | 29% (1241) | - (0) * | - (0) * | 61% (1241) | 79% (1241) | 10% (1241) |

**Trigger table, turns 2+: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 682 | 1% (571) | 12% (43) | 1% (68) | 13% (511) | 85% (682) | 30% (682) | 19256 | 1% (16188) | 7% (869) | 3% (2199) | 10% (14203) | 81% (19256) | 28% (19256) |
| 800-1200 | 877 | 2% (694) | 11% (140) | 0% (43) | 22% (662) | 82% (877) | 23% (877) | 33308 | 2% (27252) | 8% (4231) | 4% (1825) | 17% (26213) | 80% (33308) | 18% (33308) |
| 1200-1600 | 867 | 2% (633) | 18% (187) | 0% (47) | 31% (733) | 75% (867) | 16% (867) | 37184 | 3% (28404) | 8% (7048) | 3% (1732) | 22% (32021) | 74% (37184) | 13% (37184) |
| 1600-2000 | 827 | 3% (659) | 15% (131) | 3% (37) | 15% (742) | 67% (827) | 11% (827) | 35478 | 4% (28861) | 7% (5079) | 4% (1538) | 18% (32000) | 64% (35478) | 9% (35478) |
| 2000-2500 | 975 | 1% (797) | 7% (137) | 0% (41) | 10% (901) | 54% (975) | 6% (975) | 43185 | 1% (36209) | 3% (5434) | 3% (1542) | 11% (39659) | 52% (43185) | 7% (43185) |

## 2. How its catches were made: Lore

**Catches by the team (columns: team / team new / catches by other seats / catches in its wins / in its non-wins)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| catches | 213 | 207 | 6599 | 116 | 97 |
| prey held by a net | 37% (213) | 37% (207) | 32% (6599) | 36% (116) | 37% (97) |
| prey held: net of the catching team | 94% (78) | 93% (76) | 92% (2134) | 90% (42) | 97% (36) |
| prey held: net of the third team | 6% (78) | 7% (76) | 8% (2134) | 10% (42) | 3% (36) |
| prey held: netted by the catching unit itself | 82% (73) | 83% (71) | 85% (1958) | 84% (38) | 80% (35) |
| turns from net to catch = 1 | 49% (78) | 50% (76) | 49% (2134) | 48% (42) | 50% (36) |
| turns from net to catch = 2 | 19% (78) | 17% (76) | 30% (2134) | 24% (42) | 14% (36) |
| turns from net to catch = 3 | 13% (78) | 13% (76) | 13% (2134) | 14% (42) | 11% (36) |
| turns from net to catch = 4 | 19% (78) | 20% (76) | 9% (2134) | 14% (42) | 25% (36) |
| catcher dashed | 45% (213) | 45% (207) | 39% (6599) | 46% (116) | 44% (97) |
| catcher dashed, prey held | 41% (78) | 42% (76) | 44% (2134) | 45% (42) | 36% (36) |
| catcher dashed, prey free | 47% (135) | 47% (131) | 37% (4465) | 46% (74) | 49% (61) |
| free prey: its dash was available and unused | 77% (135) | 77% (131) | 79% (4465) | 81% (74) | 72% (61) |
| free prey: dashed this turn | 8% (135) | 8% (131) | 12% (4465) | 8% (74) | 8% (61) |
| free prey: dash on cooldown | 15% (135) | 15% (131) | 9% (4465) | 11% (74) | 20% (61) |
| free prey: moving toward the catcher | 42% (135) | 42% (131) | 46% (4465) | 46% (74) | 38% (61) |
| free prey: was chasing its own prey | 7% (135) | 8% (131) | 6% (4465) | 8% (74) | 7% (61) |
| start distance catcher-prey (q25 / median / q75) | 582 / 803 / 1035 (213) | 578 / 803 / 1039 (207) | 573 / 810 / 1118 (6539) | 594 / 810 / 1039 (116) | 577 / 787 / 1035 (97) |
| units of the team within 1800 of the prey: 1 | 69% (213) | 70% (207) | 70% (6599) | 72% (116) | 66% (97) |
| units within 1800: 2 | 27% (213) | 27% (207) | 27% (6599) | 25% (116) | 30% (97) |
| units within 1800: 3 or more | 3% (213) | 3% (207) | 3% (6599) | 3% (116) | 4% (97) |
| units within 1800 (mean) | 1.32 (213) | 1.32 (207) | 1.31 (6599) | 1.28 (116) | 1.37 (97) |
| prey at the wall (radius > 6500) | 23% (213) | 24% (207) | 20% (6599) | 19% (116) | 29% (97) |
| prey distance from the wall (q25 / median / q75) | 1687 / 3231 / 5291 (213) | 1647 / 3094 / 5127 (207) | 1929 / 3558 / 5187 (6599) | 1897 / 3886 / 5494 (116) | 1300 / 2725 / 4400 (97) |
| prey within 2500 of the centre | 23% (213) | 22% (207) | 21% (6599) | 24% (116) | 21% (97) |
| turn of the catch (q25 / median / q75) | 9 / 23 / 49 (213) | 9 / 22 / 49 (207) | 10 / 25 / 50 (6599) | 10 / 21 / 50 (116) | 8 / 24 / 49 (97) |
| catch by turn 10 | 28% (213) | 28% (207) | 26% (6599) | 27% (116) | 30% (97) |
| catch on turns 11-30 | 31% (213) | 30% (207) | 30% (6599) | 35% (116) | 25% (97) |
| catch after turn 60 | 16% (213) | 15% (207) | 18% (6599) | 17% (116) | 14% (97) |
| prey inside smoke of its own team | 21% (213) | 22% (207) | 23% (6599) | 23% (116) | 19% (97) |
| prey had a team-mate within 1500 | 15% (213) | 15% (207) | 14% (6599) | 19% (116) | 11% (97) |

**Net hits of the team on prey: conversion (caught within 5 turns)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| net hits on prey | 97 | 94 | 3137 | 45 | 52 |
| converted | 77% (97) | 78% (94) | 67% (3137) | 87% (45) | 69% (52) |
| a free hunter within 1200 after the net | 58% (97) | 59% (94) | 57% (3137) | 71% (45) | 46% (52) |
| a free hunter within 1800 | 73% (97) | 72% (94) | 81% (3137) | 84% (45) | 63% (52) |
| converted when a hunter within 1800 | 89% (71) | 90% (68) | 73% (2547) | 92% (38) | 85% (33) |
| converted when no hunter within 1800 | 46% (26) * | 46% (26) * | 39% (590) | 57% (7) * | 42% (19) * |
| distance of the nearest free hunter (q25 / median / q75) | 658 / 1063 / 1920 (96) | 658 / 1029 / 1920 (93) | 664 / 1043 / 1553 (3106) | 655 / 876 / 1227 (44) | 739 / 1359 / 3319 (52) |
| target was already held (re-net) | 3% (97) | 3% (94) | 6% (3137) | 0% (45) | 6% (52) |

## 3. How its units were lost: Lore

**Units lost by the team (other seats: units lost by them)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| units lost | 176 | 169 | 6637 | 68 | 108 |
| held by a net | 36% (176) | 34% (169) | 32% (6637) | 31% (68) | 39% (108) |
| held: net of the predator team | 90% (63) | 91% (58) | 92% (2152) | 81% (21) * | 95% (42) |
| held: net of the third team (its own prey) | 10% (63) | 9% (58) | 8% (2152) | 19% (21) * | 5% (42) |
| held: net of its own team | 0% (63) | 0% (58) | 0% (2152) | 0% (21) * | 0% (42) |
| turn (q25 / median / q75) | 11 / 24 / 51 (176) | 11 / 23 / 51 (169) | 10 / 25 / 50 (6637) | 15 / 30 / 62 (68) | 10 / 20 / 45 (108) |
| by turn 10 | 24% (176) | 24% (169) | 27% (6637) | 16% (68) | 30% (108) |
| turns 11-30 | 34% (176) | 34% (169) | 30% (6637) | 37% (68) | 31% (108) |
| after turn 60 | 18% (176) | 18% (169) | 18% (6637) | 25% (68) | 14% (108) |
| at the wall (radius > 6500) | 42% (176) | 43% (169) | 19% (6637) | 46% (68) | 40% (108) |
| within 2500 of the centre | 11% (176) | 10% (169) | 21% (6637) | 10% (68) | 12% (108) |
| the unit dashed on that turn | 7% (176) | 7% (169) | 8% (6637) | 9% (68) | 6% (108) |
| free unit: dashed on that turn | 11% (113) | 11% (111) | 12% (4485) | 13% (47) | 9% (66) |
| free unit: dash available, not used | 74% (113) | 75% (111) | 79% (4485) | 77% (47) | 73% (66) |
| free unit: dash on cooldown | 15% (113) | 14% (111) | 9% (4485) | 11% (47) | 18% (66) |
| free unit: moving toward the catcher | 34% (113) | 33% (111) | 46% (4485) | 30% (47) | 36% (66) |
| free unit: was chasing its own prey | 5% (113) | 5% (111) | 6% (4485) | 4% (47) | 6% (66) |
| three or more dashes already spent | 51% (176) | 51% (169) | 60% (6637) | 60% (68) | 45% (108) |
| team used smoke in the 3 turns before | 4% (176) | 4% (169) | 24% (6637) | 1% (68) | 6% (108) |
| team used a decoy in the 3 turns before | 20% (176) | 20% (169) | 23% (6637) | 21% (68) | 19% (108) |
| team used smoke or decoy in the 3 turns before | 22% (176) | 22% (169) | 40% (6637) | 22% (68) | 22% (108) |
| inside a cloud of its own team (centre within 1900, last 9 turns) | 3% (176) | 3% (169) | 24% (6637) | 1% (68) | 4% (108) |
| the unit itself sent a decoy in the 3 turns before | 16% (176) | 17% (169) | 15% (6637) | 18% (68) | 16% (108) |
| team netted the catcher in the 3 turns before | 5% (176) | 5% (169) | 1% (6637) | 1% (68) | 6% (108) |
| catcher dashed | 39% (176) | 38% (169) | 40% (6637) | 37% (68) | 40% (108) |
| 2 or more hunters within 1800 | 42% (176) | 42% (169) | 30% (6637) | 54% (68) | 34% (108) |
| a team-mate within 1500 | 14% (176) | 14% (169) | 14% (6637) | 15% (68) | 13% (108) |

**Own units netted by the predator: what the team did in the next 3 turns**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| own units netted by the predator | 115 | 110 | 3121 | 45 | 70 |
| caught within 5 turns | 57% (115) | 56% (110) | 67% (3121) | 44% (45) | 66% (70) |
| smoke within 1900 of the unit | 0% (115) | 0% (110) | 31% (3121) | 0% (45) | 0% (70) |
| net on a unit of the predator team | 62% (115) | 65% (110) | 25% (3121) | 73% (45) | 54% (70) |
| the held unit sent a decoy | 1% (115) | 0% (110) | 21% (3121) | 2% (45) | 0% (70) |
| caught, with smoke | - (0) * | - (0) * | 50% (955) | - (0) * | - (0) * |
| caught, without smoke | 57% (115) | 56% (110) | 75% (2166) | 44% (45) | 66% (70) |
| caught, with a counter-net | 39% (71) | 39% (71) | 41% (772) | 36% (33) | 42% (38) |
| caught, without a counter-net | 86% (44) | 87% (39) | 76% (2349) | 67% (12) * | 94% (32) |
| a free hunter within 1800 at the net | 63% (115) | 62% (110) | 82% (3121) | 60% (45) | 66% (70) |

## 4. Ghosts: Lore

**Ghost-turns (unit caught earlier, team still has living units)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| ghost-turns with an order | 100% (10284) | 100% (9990) | 96% (357891) | 100% (4049) | 100% (6235) |
| moving (order further than 60) | 79% (4674) | 79% (4502) | 90% (168936) | 80% (1842) | 79% (2832) |
| dashing | 0% (10284) | 0% (9990) | 0% (357891) | 0% (4049) | 0% (6235) |
| order aimed within 1000 of a living prey | 48% (3703) | 47% (3543) | 26% (151909) | 38% (1465) | 54% (2238) |
| order aimed within 1000 of a living predator | 6% (3703) | 6% (3543) | 12% (151909) | 8% (1465) | 6% (2238) |
| order aimed within 1000 of a living team-mate | 2% (3703) | 2% (3543) | 3% (151909) | 3% (1465) | 2% (2238) |
| order aimed at none of these | 44% (3703) | 44% (3543) | 59% (151909) | 52% (1465) | 39% (2238) |
| aimed at prey: that prey is held by a net | 4% (1760) | 4% (1662) | 4% (39906) | 6% (556) | 3% (1204) |
| aimed at prey: a living hunter of ours within 2500 of it | 47% (1760) | 47% (1662) | 51% (39906) | 51% (556) | 45% (1204) |
| aimed at predator: a living team-mate within 2500 of it | 21% (234) | 21% (227) | 36% (18004) | 22% (110) | 21% (124) |
| moving toward the nearest living prey | 59% (3703) | 59% (3543) | 46% (151909) | 51% (1465) | 65% (2238) |
| moving toward the nearest living predator | 35% (3703) | 35% (3543) | 36% (151909) | 34% (1465) | 35% (2238) |
| position within 2000 of a living prey | 41% (4674) | 41% (4502) | 33% (168936) | 33% (1842) | 47% (2832) |
| position within 2000 of a living predator | 35% (4674) | 35% (4502) | 38% (168936) | 36% (1842) | 34% (2832) |
| position within 2000 of a living team-mate | 23% (4674) | 23% (4502) | 24% (168936) | 19% (1842) | 26% (2832) |
| position within 2000 of nobody | 31% (4674) | 31% (4502) | 33% (168936) | 37% (1842) | 27% (2832) |
| median distance to the nearest living prey | 2375 (4264) | 2375 (4092) | 2875 (154487) | 3125 (1454) | 2125 (2810) |
| median distance to the nearest living predator | 2875 (4590) | 2875 (4418) | 2625 (164904) | 2625 (1833) | 2875 (2757) |

## 5. Three units against six: Lore

| | team, 3 units | team, 4 units | team, 5 units | team, 6 units | others, 3 units | others, 4 units | others, 5 units | others, 6 units |
|---|---|---|---|---|---|---|---|---|
| games | 14 | 15 | 17 | 18 | 556 | 580 | 572 | 534 |
| wins | 64% (14) * | 27% (15) * | 29% (17) * | 56% (18) * | 33% (556) | 33% (580) | 34% (572) | 33% (534) |
| last place | 21% (14) * | 40% (15) * | 18% (17) * | 22% (18) * | 34% (556) | 33% (580) | 34% (572) | 34% (534) |
| mean rank | 1.57 (14) * | 2.13 (15) * | 1.88 (17) * | 1.67 (18) * | 2.01 (556) | 2.00 (580) | 2.00 (572) | 2.01 (534) |
| catches per game | 2.14 (14) * | 2.47 (15) * | 3.47 (17) * | 4.83 (18) * | 1.73 (556) | 2.57 (580) | 3.38 (572) | 4.15 (534) |
| catches per unit of the prey team | 0.71 (14) * | 0.62 (15) * | 0.69 (17) * | 0.81 (18) * | 0.58 (556) | 0.64 (580) | 0.68 (572) | 0.69 (534) |
| units lost per game | 1.36 (14) * | 2.67 (15) * | 3.18 (17) * | 3.50 (18) * | 1.75 (556) | 2.57 (580) | 3.38 (572) | 4.19 (534) |
| share of own units lost | 0.45 (14) * | 0.67 (15) * | 0.64 (17) * | 0.58 (18) * | 0.58 (556) | 0.64 (580) | 0.68 (572) | 0.70 (534) |
| catches by turn 10 | 0.43 (14) * | 0.73 (15) * | 1.06 (17) * | 1.39 (18) * | 0.37 (556) | 0.64 (580) | 0.90 (572) | 1.22 (534) |
| units lost by turn 10 | 0.21 (14) * | 0.93 (15) * | 0.82 (17) * | 0.67 (18) * | 0.38 (556) | 0.64 (580) | 0.91 (572) | 1.24 (534) |
| first catch turn (median) | 15 (13) * | 5 (14) * | 7 (17) * | 5 (18) * | 17 (485) | 10 (555) | 7 (559) | 6 (524) |
| made the first catch of the game | 29% (14) * | 33% (15) * | 24% (17) * | 50% (18) * | 33% (556) | 33% (580) | 34% (572) | 33% (534) |
| nets per game | 2.57 (14) * | 4.27 (15) * | 5.12 (17) * | 6.06 (18) * | 2.54 (556) | 3.75 (580) | 4.86 (572) | 5.85 (534) |
| nets in turns 1-3 | 0.71 (14) * | 1.60 (15) * | 2.18 (17) * | 1.94 (18) * | 0.73 (556) | 1.24 (580) | 1.77 (572) | 2.28 (534) |
| smoke per game | 0.00 (14) * | 0.33 (15) * | 0.88 (17) * | 1.89 (18) * | 1.96 (556) | 2.71 (580) | 3.54 (572) | 4.28 (534) |
| smoke in turns 1-5 | 0.00 (14) * | 0.00 (15) * | 0.00 (17) * | 0.00 (18) * | 0.40 (556) | 0.63 (580) | 0.91 (572) | 1.17 (534) |
| decoys per game | 1.29 (14) * | 1.67 (15) * | 3.59 (17) * | 4.50 (18) * | 2.35 (556) | 3.37 (580) | 4.58 (572) | 5.31 (534) |
| decoys in turns 1-5 | 0.00 (14) * | 0.13 (15) * | 0.18 (17) * | 0.28 (18) * | 0.74 (556) | 1.17 (580) | 1.81 (572) | 2.19 (534) |
| dashes per unit, whole game | 4.07 (14) * | 3.52 (15) * | 4.68 (17) * | 4.44 (18) * | 4.84 (556) | 4.97 (580) | 4.83 (572) | 4.72 (534) |
| turn 1: units dashing | 44% (41) | 47% (59) | 51% (81) | 50% (105) | 53% (1534) | 60% (2165) | 58% (2756) | 66% (3129) |
| turn 1: toward nearest prey | 63% (41) | 75% (59) | 65% (81) | 60% (105) | 76% (1534) | 73% (2165) | 71% (2756) | 71% (3129) |
| turn 1: away from nearest predator | 29% (41) | 41% (59) | 38% (81) | 34% (105) | 26% (1534) | 32% (2165) | 32% (2756) | 36% (3129) |
| net hits prey | 25% (36) | 28% (64) | 29% (87) | 41% (109) | 32% (1412) | 35% (2177) | 33% (2782) | 33% (3122) |
| nets aimed at predators | 58% (36) | 45% (64) | 48% (87) | 46% (109) | 29% (1412) | 26% (2177) | 27% (2782) | 29% (3122) |
| catches: prey held by a net | 23% (30) | 32% (37) | 34% (59) | 45% (87) | 33% (962) | 35% (1490) | 31% (1932) | 31% (2215) |
| catches: catcher dashed | 47% (30) | 43% (37) | 41% (59) | 48% (87) | 41% (962) | 40% (1490) | 39% (1932) | 39% (2215) |
| losses: held by a net | 42% (19) * | 35% (40) | 39% (54) | 32% (63) | 33% (973) | 35% (1489) | 31% (1936) | 32% (2239) |
| tie on catches for first place | 29% (14) * | 20% (15) * | 29% (17) * | 28% (18) * | 21% (556) | 25% (580) | 22% (572) | 18% (534) |

## 6. Ahead, level, behind on catches: Lore

State at the start of the turn: own catches against the better of the two other teams. Left block: the team (all games). Right block: other seats of the new folder.

**turns 6-30**

| | team ahead | team level | team behind | others ahead | others level | others behind |
|---|---|---|---|---|---|---|
| unit-turns | 1673 | 1540 | 2484 | 46044 | 57572 | 85682 |
| dash when available | 10% (1421) | 8% (1339) | 11% (2115) | 10% (39830) | 12% (48845) | 12% (72952) |
| nets per 100 unit-turns | 1.6 (1673) | 2.5 (1540) | 2.8 (2484) | 1.6 (46044) | 2.2 (57572) | 2.4 (85682) |
| net when prey within 2000 | 3% (274) | 3% (372) | 5% (796) | 5% (8223) | 6% (13791) | 5% (25122) |
| smoke per 100 | 0.4 (1673) | 0.0 (1540) | 0.0 (2484) | 1.8 (46044) | 1.6 (57572) | 1.4 (85682) |
| decoys per 100 | 1.7 (1673) | 0.5 (1540) | 0.9 (2484) | 1.9 (46044) | 2.0 (57572) | 1.7 (85682) |
| median distance to nearest predator | 2875 (1608) | 3375 (1440) | 3375 (2150) | 3125 (44920) | 3375 (55380) | 3375 (81655) |
| predator within 1800 | 28% (1608) | 23% (1440) | 21% (2150) | 23% (44920) | 21% (55380) | 19% (81655) |
| median distance to nearest prey | 4375 (1498) | 3625 (1458) | 2875 (2337) | 3875 (43436) | 3375 (55391) | 2875 (83228) |
| prey within 3000: moving toward it | 66% (421) | 63% (522) | 70% (1053) | 58% (14160) | 59% (22397) | 58% (40178) |
| prey within 3000: dash | 18% (363) | 19% (448) | 20% (896) | 16% (12263) | 18% (19279) | 17% (34782) |
| predator within 3000: moving away | 64% (706) | 52% (532) | 53% (778) | 47% (19885) | 46% (22631) | 45% (30987) |
| predator within 3000: moving toward it | 12% (706) | 19% (532) | 16% (778) | 19% (19885) | 19% (22631) | 19% (30987) |
| predator within 3000: dash | 14% (619) | 15% (466) | 17% (672) | 15% (17369) | 17% (19534) | 17% (26826) |
| standing still | 9% (1560) | 13% (1455) | 13% (2324) | 6% (44177) | 5% (54575) | 5% (81277) |

**turns 31-100**

| | team ahead | team level | team behind | others ahead | others level | others behind |
|---|---|---|---|---|---|---|
| unit-turns | 3974 | 2508 | 3639 | 97793 | 67520 | 148731 |
| dash when available | 5% (3770) | 5% (2376) | 6% (3402) | 5% (92223) | 6% (63014) | 7% (138351) |
| nets per 100 unit-turns | 0.1 (3974) | 0.1 (2508) | 0.2 (3639) | 0.2 (97793) | 0.4 (67520) | 0.4 (148731) |
| net when prey within 2000 | 0% (229) | 0% (339) | 1% (1081) | 1% (9742) | 1% (14797) | 1% (48856) |
| smoke per 100 | 0.7 (3974) | 0.3 (2508) | 0.3 (3639) | 0.9 (97793) | 0.8 (67520) | 0.6 (148731) |
| decoys per 100 | 1.2 (3974) | 1.5 (2508) | 0.9 (3639) | 0.6 (97793) | 0.7 (67520) | 0.5 (148731) |
| median distance to nearest predator | 2375 (2807) | 2625 (1747) | 3125 (1964) | 2875 (78633) | 3125 (57137) | 3625 (99210) |
| predator within 1800 | 41% (2807) | 33% (1747) | 24% (1964) | 31% (78633) | 25% (57137) | 20% (99210) |
| median distance to nearest prey | 5375 (1841) | 4375 (1783) | 2625 (2721) | 4375 (54681) | 3375 (56049) | 2625 (126305) |
| prey within 3000: moving toward it | 59% (414) | 74% (521) | 79% (1382) | 64% (17173) | 68% (23963) | 73% (71348) |
| prey within 3000: dash | 14% (367) | 14% (461) | 14% (1223) | 11% (15552) | 11% (21695) | 11% (64632) |
| predator within 3000: moving away | 74% (1556) | 72% (908) | 64% (876) | 62% (39602) | 55% (25915) | 54% (39151) |
| predator within 3000: moving toward it | 8% (1556) | 7% (908) | 11% (876) | 11% (39602) | 14% (25915) | 15% (39151) |
| predator within 3000: dash | 11% (1405) | 11% (818) | 13% (779) | 11% (35802) | 11% (23431) | 11% (35394) |
| standing still | 12% (3959) | 16% (2507) | 16% (3612) | 10% (97236) | 5% (66975) | 5% (147538) |

## 7. Games it did not win: Lore

Non-wins: 36 of 64 (second 20, last 16). Winner was its **prey team** in 21 (58%), its **predator team** in 15 (42%). Other seats of the new folder: prey team won 50% of their non-wins.

First thing that went wrong in the non-wins (exclusive, in this order): lost a unit by turn 10: 24 (67%); no catch by turn 20: 5 (14%); level on catches with the winner, lost the tie-break: 2 (6%); fewer catches than the winner, none of the above: 5 (14%).

**The same events in wins and in non-wins**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| games | 64 | 62 | 2242 | 28 | 36 |
| lost a unit by turn 10 | 53% (64) | 52% (62) | 56% (2242) | 36% (28) * | 67% (36) |
| lost a unit by turn 20 | 75% (64) | 74% (62) | 73% (2242) | 57% (28) * | 89% (36) |
| no catch by turn 10 | 39% (64) | 39% (62) | 45% (2242) | 32% (28) * | 44% (36) |
| no catch by turn 20 | 27% (64) | 26% (62) | 27% (2242) | 14% (28) * | 36% (36) |
| made the first catch of the game | 34% (64) | 35% (62) | 33% (2242) | 46% (28) * | 25% (36) |
| its first event: lost a unit before any catch | 39% (64) | 37% (62) | 45% (2242) | 25% (28) * | 50% (36) |
| its first event: caught before losing | 55% (64) | 56% (62) | 50% (2242) | 75% (28) * | 39% (36) |
| level on catches for first place | 27% (64) | 27% (62) | 21% (2242) | 25% (28) * | 28% (36) |
| level on catches for first place: won the tie-break | 41% (17) * | 41% (17) * | 48% (482) | 100% (7) * | 0% (10) * |
| eliminated (all units lost) | 20% (64) | 19% (62) | 25% (2242) | 11% (28) * | 28% (36) |
| catches | 3.33 (64) | 3.34 (62) | 2.94 (2242) | 4.14 (28) * | 2.69 (36) |
| units lost | 2.75 (64) | 2.73 (62) | 2.96 (2242) | 2.43 (28) * | 3.00 (36) |
| catches by turn 10 | 0.94 (64) | 0.94 (62) | 0.78 (2242) | 1.11 (28) * | 0.81 (36) |
| catches by turn 20 | 1.50 (64) | 1.52 (62) | 1.28 (2242) | 2.00 (28) * | 1.11 (36) |
| units lost by turn 10 | 0.67 (64) | 0.66 (62) | 0.79 (2242) | 0.39 (28) * | 0.89 (36) |
| first catch turn (median) | 6 (62) | 6 (60) | 8 (2123) | 6 (28) * | 7 (34) |
| first loss turn (median) | 9 (58) | 9 (56) | 8 (2127) | 12 (24) * | 7 (34) |
| catches of its predator team | 2.75 (64) | 2.73 (62) | 2.96 (2242) | 2.43 (28) * | 3.00 (36) |
| catches of its prey team | 2.86 (64) | 2.92 (62) | 2.95 (2242) | 2.07 (28) * | 3.47 (36) |
| nets in turns 1-3 | 1.66 (64) | 1.69 (62) | 1.50 (2242) | 1.43 (28) * | 1.83 (36) |
| nets whole game | 4.63 (64) | 4.65 (62) | 4.23 (2242) | 4.50 (28) * | 4.72 (36) |
| smoke whole game | 0.84 (64) | 0.85 (62) | 3.11 (2242) | 0.96 (28) * | 0.75 (36) |
| decoys whole game | 2.89 (64) | 2.92 (62) | 3.89 (2242) | 3.07 (28) * | 2.75 (36) |
| dashes on turn 1 | 2.19 (64) | 2.24 (62) | 2.58 (2242) | 2.21 (28) * | 2.17 (36) |
| dashes whole game per unit | 4.21 (64) | 4.22 (62) | 4.84 (2242) | 4.51 (28) * | 3.97 (36) |
| seat 0 | 33% (64) | 32% (62) | 33% (2242) | 39% (28) * | 28% (36) |
| seat 1 | 36% (64) | 37% (62) | 33% (2242) | 32% (28) * | 39% (36) |
| seat 2 | 31% (64) | 31% (62) | 33% (2242) | 29% (28) * | 33% (36) |
| units per team (mean) | 4.61 (64) | 4.61 (62) | 4.48 (2242) | 4.57 (28) * | 4.64 (36) |

**Win rate with and without each event**

| Event | team win % with it | team win % without it | others with it | others without it |
|---|---|---|---|---|
| lost a unit by turn 10 | 29% (34) | 60% (30) | 24% (1248) | 44% (994) |
| lost a unit by turn 20 | 33% (48) | 75% (16) * | 26% (1634) | 51% (608) |
| a catch by turn 10 | 49% (39) | 36% (25) * | 43% (1242) | 21% (1000) |
| a catch by turn 20 | 51% (47) | 24% (17) * | 39% (1634) | 16% (608) |
| made the first catch of the game | 59% (22) * | 36% (42) | 51% (746) | 24% (1496) |
| lost a unit before any catch | 28% (25) * | 54% (39) | 16% (1002) | 47% (1240) |
| level on catches for first place | 41% (17) * | 45% (47) | 48% (482) | 29% (1760) |
| seat 0 | 52% (21) * | 40% (43) | 34% (748) | 32% (1494) |
| seat 1 | 39% (23) * | 46% (41) | 31% (745) | 34% (1497) |
| seat 2 | 40% (20) * | 45% (44) | 34% (749) | 33% (1493) |
| 3 units | 64% (14) * | 38% (50) | 33% (556) | 33% (1686) |
| 4 units | 27% (15) * | 49% (49) | 33% (580) | 33% (1662) |
| 5 units | 29% (17) * | 49% (47) | 34% (572) | 33% (1670) |
| 6 units | 56% (18) * | 39% (46) | 33% (534) | 33% (1708) |

**By the team that hunts it** (6 games or more)

| Opponent | games | team wins | opponent wins | team catches | team units lost |
|---|---|---|---|---|---|
| Agave | 6 * | 17% | 33% | 2.67 | 3.17 |

**By the team it hunts** (6 games or more)

| Opponent | games | team wins | opponent wins | team catches | team units lost |
|---|---|---|---|---|---|
| Agave | 6 * | 50% | 17% | 2.33 | 2.17 |

## 8. Other observations: Lore

**Living unit-turns, whole game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| unit-turns | 17272 | 16874 | 552294 | 8421 | 8851 |
| held by a net | 3% (17272) | 3% (16874) | 3% (552294) | 3% (8421) | 4% (8851) |
| dash when available | 8% (15499) | 8% (15152) | 10% (489942) | 8% (7614) | 9% (7885) |
| standing still (free units) | 13% (16710) | 13% (16327) | 6% (536927) | 12% (8173) | 13% (8537) |
| predator within 1800 | 29% (13038) | 29% (12645) | 23% (461974) | 31% (6318) | 27% (6720) |
| predator within 1200 | 16% (13038) | 17% (12645) | 12% (461974) | 18% (6318) | 15% (6720) |
| median distance to nearest predator | 2875 (13038) | 2875 (12645) | 3125 (461974) | 2875 (6318) | 3125 (6720) |
| median distance to nearest prey | 3375 (12990) | 3375 (12597) | 3125 (464109) | 3625 (5529) | 3375 (7461) |
| prey within 2000 | 27% (12990) | 27% (12597) | 29% (464109) | 24% (5529) | 30% (7461) |
| net when prey within 2000 | 4% (3571) | 4% (3458) | 4% (136038) | 5% (1319) | 4% (2252) |
| predator within 3000: away | 64% (5971) | 64% (5765) | 52% (200343) | 65% (2981) | 62% (2990) |
| predator within 3000: toward | 11% (5971) | 11% (5765) | 16% (200343) | 11% (2981) | 11% (2990) |
| predator within 3000: sideways | 25% (5971) | 25% (5765) | 31% (200343) | 24% (2981) | 26% (2990) |
| predator within 3000: dash when available | 15% (5248) | 15% (5068) | 16% (174344) | 14% (2621) | 15% (2627) |
| predator within 3000: smoke | 1% (5971) | 1% (5765) | 3% (200343) | 1% (2981) | 1% (2990) |
| predator within 3000: decoy | 3% (5971) | 3% (5765) | 4% (200343) | 3% (2981) | 3% (2990) |
| predator within 3000: net | 2% (5971) | 2% (5765) | 2% (200343) | 2% (2981) | 3% (2990) |
| prey within 3000: toward | 71% (4970) | 71% (4810) | 65% (212402) | 70% (1929) | 71% (3041) |
| prey within 3000: away | 12% (4970) | 12% (4810) | 14% (212402) | 13% (1929) | 12% (3041) |
| prey within 3000: dash when available | 19% (4248) | 19% (4107) | 16% (184696) | 20% (1645) | 19% (2603) |
| DASH orders that were not executed (cooldown) | 0% (1259) | 0% (1222) | 0% (48592) | 0% (581) | 0% (678) |
| dashes: fleeing (predator within 2000, moving away) | 34% (1259) | 33% (1222) | 24% (48525) | 36% (581) | 32% (678) |
| dashes: attacking (prey within 2500, moving toward) | 46% (1259) | 47% (1222) | 39% (48525) | 42% (581) | 50% (678) |
| dashes: travelling (neither) | 20% (1259) | 20% (1222) | 37% (48525) | 22% (581) | 18% (678) |

**Nets aimed at units of this team (by anyone)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets aimed at its units | 276 | 268 | 8852 | 104 | 172 |
| hit the unit | 64% (276) | 63% (268) | 58% (8852) | 70% (104) | 60% (172) |
| absorbed by a decoy | 1% (276) | 1% (268) | 8% (8852) | 0% (104) | 2% (172) |
| unit could dash | 75% (276) | 75% (268) | 71% (8852) | 78% (104) | 74% (172) |
| hit when the unit could dash | 56% (188) | 56% (181) | 51% (5870) | 68% (74) | 49% (114) |
| hit when its dash was on cooldown | 76% (66) | 75% (65) | 71% (2536) | 73% (22) * | 77% (44) |
| the unit dashed on that turn | 29% (276) | 29% (268) | 30% (8852) | 29% (104) | 29% (172) |
| hit when it dashed that turn | 36% (80) | 36% (77) | 30% (2630) | 47% (30) | 30% (50) |
| hit when it did not dash | 73% (174) | 72% (169) | 69% (5776) | 79% (66) | 69% (108) |
| thrown by its predator team | 70% (276) | 70% (268) | 70% (8852) | 67% (104) | 72% (172) |
| thrown by turn 5 | 52% (276) | 53% (268) | 46% (8852) | 47% (104) | 55% (172) |

**Trigger table, all turns: nearest free predator at this distance**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 1165 | 2% (1165) | 8% (1165) | 5% (1165) | 28% (1021) | 81% (1098) | 3% (1098) | 17% (1165) | 33453 | 6% (33453) | 4% (33453) | 3% (33453) | 24% (28207) | 71% (30565) | 6% (30565) | 24% (33453) |
| 1000-1500 | 1521 | 1% (1521) | 3% (1521) | 3% (1521) | 15% (1234) | 82% (1487) | 2% (1487) | 9% (1521) | 42736 | 5% (42736) | 7% (42736) | 3% (42736) | 19% (33413) | 67% (40897) | 7% (40897) | 13% (42736) |
| 1500-2000 | 1142 | 0% (1142) | 1% (1142) | 3% (1142) | 10% (947) | 66% (1106) | 7% (1106) | 5% (1142) | 41754 | 3% (41754) | 6% (41754) | 2% (41754) | 16% (34705) | 53% (40506) | 11% (40506) | 7% (41754) |
| 2000-2500 | 1083 | 0% (1083) | 1% (1083) | 2% (1083) | 8% (951) | 48% (1058) | 16% (1058) | 2% (1083) | 42305 | 1% (42305) | 2% (42305) | 2% (42305) | 11% (36557) | 39% (41410) | 22% (41410) | 3% (42305) |
| 2500-3000 | 1079 | 0% (1079) | 1% (1079) | 1% (1079) | 8% (964) | 31% (1054) | 26% (1054) | 1% (1079) | 41730 | 1% (41730) | 1% (41730) | 2% (41730) | 10% (36730) | 34% (40827) | 27% (40827) | 1% (41730) |

**Trigger table, all turns: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 689 | 1% (578) | 12% (43) | 1% (68) | 14% (518) | 86% (689) | 30% (689) | 19456 | 2% (16388) | 7% (869) | 3% (2199) | 11% (14403) | 81% (19456) | 28% (19456) |
| 800-1200 | 891 | 2% (708) | 11% (140) | 0% (43) | 24% (676) | 82% (891) | 23% (891) | 33927 | 3% (27871) | 8% (4231) | 4% (1825) | 18% (26832) | 80% (33927) | 18% (33927) |
| 1200-1600 | 888 | 2% (654) | 18% (187) | 0% (47) | 33% (754) | 75% (888) | 16% (888) | 38030 | 4% (29250) | 8% (7048) | 3% (1732) | 24% (32867) | 75% (38030) | 13% (38030) |
| 1600-2000 | 851 | 2% (683) | 15% (131) | 3% (37) | 17% (766) | 68% (851) | 11% (851) | 36553 | 5% (29936) | 7% (5079) | 4% (1538) | 19% (33075) | 65% (36553) | 10% (36553) |
| 2000-2500 | 1014 | 1% (836) | 7% (137) | 0% (41) | 13% (940) | 55% (1014) | 6% (1014) | 44426 | 2% (37450) | 3% (5434) | 3% (1542) | 12% (40900) | 52% (44426) | 7% (44426) |

**All nets of the game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets | 296 | 288 | 9493 | 126 | 170 |
| hit prey | 33% (296) | 33% (288) | 33% (9493) | 36% (126) | 31% (170) |
| hit predator | 43% (296) | 44% (288) | 21% (9493) | 42% (126) | 44% (170) |
| absorbed by a decoy | 7% (296) | 7% (288) | 12% (9493) | 6% (126) | 8% (170) |
| aimed at predators | 48% (296) | 49% (288) | 28% (9493) | 47% (126) | 49% (170) |
| no enemy near the line | 1% (296) | 1% (288) | 7% (9493) | 2% (126) | 0% (170) |
| thrown while held | 27% (296) | 28% (288) | 12% (9493) | 28% (126) | 26% (170) |
| thrown when ahead | 15% (296) | 15% (288) | 12% (9493) | 29% (126) | 4% (170) |
| thrown when behind | 32% (296) | 31% (288) | 33% (9493) | 22% (126) | 39% (170) |
| turn (q25 / median / q75) | 2 / 6 / 15 (296) | 2 / 6 / 15 (288) | 2 / 7 / 17 (9493) | 2 / 8 / 14 (126) | 2 / 5 / 15 (170) |

---

# RNG

## 1. Opening (turns 1-5): RNG

**Turn 1, per unit (direction of the order relative to the nearest predator start / nearest prey start; cos > 0.5 away, < -0.5 toward)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| units | 883 | 550 | 9311 | 360 | 523 |
| dash on turn 1 | 35% (883) | 39% (550) | 61% (9311) | 35% (360) | 34% (523) |
| dash on turn 1, nearest predator under 2000 | 54% (261) | 58% (178) | 80% (2638) | 59% (106) | 50% (155) |
| dash on turn 1, nearest predator 2000-3500 | 39% (316) | 42% (207) | 56% (3202) | 41% (128) | 37% (188) |
| dash on turn 1, nearest predator over 3500 | 13% (306) | 15% (165) | 52% (3471) | 7% (126) | 18% (180) |
| dash on turn 1, nearest prey under 2000 | 56% (255) | 57% (171) | 79% (2616) | 57% (102) | 56% (153) |
| dash on turn 1, nearest prey 2000-3500 | 31% (321) | 36% (206) | 59% (3210) | 34% (134) | 29% (187) |
| dash on turn 1, nearest prey over 3500 | 21% (307) | 25% (173) | 50% (3485) | 18% (124) | 22% (183) |
| vs predator: away | 44% (883) | 44% (550) | 32% (9311) | 46% (360) | 42% (523) |
| vs predator: toward | 24% (883) | 20% (550) | 28% (9311) | 23% (360) | 25% (523) |
| vs predator: sideways | 32% (883) | 36% (550) | 40% (9311) | 31% (360) | 33% (523) |
| vs predator: no move | 0% (883) | 0% (550) | 1% (9311) | 0% (360) | 0% (523) |
| vs prey: toward | 51% (883) | 49% (550) | 74% (9311) | 50% (360) | 52% (523) |
| vs prey: away | 25% (883) | 28% (550) | 10% (9311) | 25% (360) | 24% (523) |
| vs prey: sideways | 24% (883) | 24% (550) | 16% (9311) | 25% (360) | 23% (523) |
| predator under 2000: away from it | 67% (261) | 63% (178) | 54% (2638) | 76% (106) | 60% (155) |
| predator under 2000: toward nearest prey | 34% (261) | 31% (178) | 59% (2638) | 29% (106) | 37% (155) |
| predator over 3500: toward nearest prey | 79% (306) | 78% (165) | 83% (3471) | 79% (126) | 80% (180) |
| prey nearer than predator: toward prey | 73% (421) | 72% (254) | 85% (4554) | 72% (167) | 73% (254) |
| predator nearer than prey: away from predator | 55% (446) | 52% (284) | 40% (4625) | 60% (186) | 52% (260) |
| prey under 2000: toward it | 68% (255) | 66% (171) | 85% (2616) | 68% (102) | 68% (153) |
| prey under 2000: dash toward it | 47% (255) | 47% (171) | 70% (2616) | 43% (102) | 49% (153) |
| dashers: toward prey | 57% (305) | 54% (215) | 78% (5717) | 51% (125) | 61% (180) |
| dashers: away from predator | 57% (305) | 54% (215) | 35% (5717) | 62% (125) | 53% (180) |
| toward the centre | 30% (883) | 27% (550) | 53% (9311) | 31% (360) | 30% (523) |
| toward the wall | 41% (883) | 44% (550) | 16% (9311) | 43% (360) | 39% (523) |

**Turn 1, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 32% (947) | 36% (600) | 59% (9738) | 32% (388) | 32% (559) |
| toward nearest prey (any distance) | 51% (903) | 49% (566) | 73% (9465) | 51% (370) | 52% (533) |
| away from nearest predator (any distance) | 44% (903) | 44% (566) | 32% (9465) | 46% (370) | 42% (533) |
| toward nearest predator | 24% (903) | 21% (566) | 29% (9465) | 24% (370) | 25% (533) |
| median distance to nearest predator | 2875 (903) | 2625 (566) | 2875 (9494) | 2875 (370) | 2875 (533) |
| median distance to nearest prey | 2875 (903) | 2875 (566) | 2875 (9493) | 2875 (370) | 2875 (533) |
| predator within 1800 | 23% (903) | 25% (566) | 23% (9494) | 22% (370) | 23% (533) |
| prey within 2000 | 28% (903) | 30% (566) | 28% (9493) | 28% (370) | 29% (533) |
| net thrown when prey within 2000 | 31% (255) | 27% (171) | 30% (2635) | 38% (102) | 25% (153) |
| held by a net | 0% (947) | 0% (600) | 0% (9738) | 0% (388) | 0% (559) |

**Turn 2, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 15% (888) | 12% (572) | 8% (9324) | 16% (361) | 15% (527) |
| toward nearest prey (any distance) | 48% (633) | 44% (418) | 60% (8182) | 53% (256) | 44% (377) |
| away from nearest predator (any distance) | 43% (633) | 45% (418) | 37% (8182) | 41% (256) | 44% (377) |
| toward nearest predator | 24% (633) | 23% (418) | 27% (8182) | 26% (256) | 22% (377) |
| median distance to nearest predator | 2375 (693) | 2375 (447) | 2625 (8640) | 2375 (284) | 2375 (409) |
| median distance to nearest prey | 2625 (692) | 2625 (446) | 2375 (8649) | 2625 (283) | 2625 (409) |
| predator within 1800 | 37% (693) | 36% (447) | 32% (8640) | 38% (284) | 37% (409) |
| prey within 2000 | 35% (692) | 36% (446) | 40% (8649) | 34% (283) | 36% (409) |
| net thrown when prey within 2000 | 43% (244) | 39% (160) | 28% (3437) | 43% (96) | 43% (148) |
| held by a net | 6% (947) | 5% (600) | 4% (9704) | 7% (388) | 6% (559) |

**Turn 3, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 23% (835) | 24% (532) | 38% (8543) | 27% (341) | 20% (494) |
| toward nearest prey (any distance) | 46% (637) | 44% (412) | 55% (7579) | 47% (262) | 45% (375) |
| away from nearest predator (any distance) | 49% (637) | 50% (412) | 37% (7579) | 52% (262) | 48% (375) |
| toward nearest predator | 17% (637) | 17% (412) | 27% (7579) | 15% (262) | 19% (375) |
| median distance to nearest predator | 2375 (736) | 2375 (473) | 2625 (8764) | 2375 (308) | 2625 (428) |
| median distance to nearest prey | 2625 (736) | 2625 (473) | 2375 (8765) | 2625 (308) | 2625 (428) |
| predator within 1800 | 35% (736) | 34% (473) | 31% (8764) | 38% (308) | 32% (428) |
| prey within 2000 | 35% (736) | 34% (473) | 40% (8765) | 37% (308) | 34% (428) |
| net thrown when prey within 2000 | 19% (260) | 19% (159) | 12% (3466) | 19% (115) | 19% (145) |
| held by a net | 11% (934) | 10% (593) | 11% (9624) | 12% (387) | 10% (547) |

**Turn 4, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 9% (795) | 8% (508) | 12% (8208) | 7% (328) | 11% (467) |
| toward nearest prey (any distance) | 52% (626) | 57% (405) | 50% (7335) | 50% (257) | 54% (369) |
| away from nearest predator (any distance) | 36% (626) | 34% (405) | 38% (7335) | 37% (257) | 36% (369) |
| toward nearest predator | 29% (626) | 32% (405) | 26% (7335) | 25% (257) | 32% (369) |
| median distance to nearest predator | 2625 (741) | 2875 (475) | 2625 (8561) | 2625 (306) | 2625 (435) |
| median distance to nearest prey | 2875 (741) | 2875 (475) | 2625 (8562) | 2875 (306) | 2875 (435) |
| predator within 1800 | 30% (741) | 31% (475) | 27% (8561) | 31% (306) | 29% (435) |
| prey within 2000 | 32% (741) | 31% (475) | 35% (8562) | 33% (306) | 31% (435) |
| net thrown when prey within 2000 | 19% (236) | 18% (146) | 11% (2963) | 20% (101) | 18% (135) |
| held by a net | 13% (910) | 12% (578) | 12% (9288) | 13% (377) | 12% (533) |

**Turn 5, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 8% (770) | 7% (493) | 10% (7885) | 8% (320) | 7% (450) |
| toward nearest prey (any distance) | 52% (620) | 52% (397) | 49% (7119) | 54% (254) | 52% (366) |
| away from nearest predator (any distance) | 34% (620) | 32% (397) | 37% (7119) | 37% (254) | 31% (366) |
| toward nearest predator | 34% (620) | 37% (397) | 26% (7119) | 32% (254) | 35% (366) |
| median distance to nearest predator | 2875 (741) | 2875 (470) | 2875 (8427) | 2625 (305) | 2875 (436) |
| median distance to nearest prey | 3125 (741) | 3125 (470) | 2625 (8428) | 3125 (305) | 3125 (436) |
| predator within 1800 | 30% (741) | 31% (470) | 25% (8427) | 30% (305) | 30% (436) |
| prey within 2000 | 30% (741) | 28% (470) | 32% (8428) | 32% (305) | 29% (436) |
| net thrown when prey within 2000 | 16% (225) | 15% (133) | 10% (2707) | 11% (97) | 20% (128) |
| held by a net | 14% (891) | 13% (566) | 13% (9071) | 14% (371) | 13% (520) |

**Items and dashes per game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets on turn 1 (per game) | 0.55 (206) | 0.50 (130) | 0.62 (2174) | 0.65 (84) | 0.48 (122) |
| nets on turn 2 (per game) | 0.89 (206) | 0.84 (130) | 0.59 (2174) | 1.01 (84) | 0.80 (122) |
| nets on turn 3 (per game) | 0.36 (206) | 0.35 (130) | 0.28 (2174) | 0.38 (84) | 0.34 (122) |
| nets on turn 4 (per game) | 0.41 (206) | 0.42 (130) | 0.23 (2174) | 0.42 (84) | 0.40 (122) |
| nets on turn 5 (per game) | 0.29 (206) | 0.27 (130) | 0.20 (2174) | 0.19 (84) | 0.35 (122) |
| nets in turns 1-5 (per game) | 2.49 (206) | 2.38 (130) | 1.91 (2174) | 2.65 (84) | 2.38 (122) |
| nets whole game (per game) | 4.70 (206) | 4.69 (130) | 4.22 (2174) | 4.80 (84) | 4.64 (122) |
| games with at least one net in turns 1-5 | 88% (206) | 88% (130) | 77% (2174) | 87% (84) | 89% (122) |
| smokes on turn 1 (per game) | 0.00 (206) | 0.00 (130) | 0.30 (2174) | 0.00 (84) | 0.00 (122) |
| smokes on turn 2 (per game) | 0.08 (206) | 0.07 (130) | 0.17 (2174) | 0.04 (84) | 0.11 (122) |
| smokes on turn 3 (per game) | 0.04 (206) | 0.03 (130) | 0.13 (2174) | 0.04 (84) | 0.04 (122) |
| smokes on turn 4 (per game) | 0.07 (206) | 0.07 (130) | 0.10 (2174) | 0.08 (84) | 0.06 (122) |
| smokes on turn 5 (per game) | 0.03 (206) | 0.04 (130) | 0.09 (2174) | 0.06 (84) | 0.02 (122) |
| smokes in turns 1-5 (per game) | 0.22 (206) | 0.21 (130) | 0.78 (2174) | 0.21 (84) | 0.22 (122) |
| smokes whole game (per game) | 3.14 (206) | 3.14 (130) | 3.04 (2174) | 3.79 (84) | 2.69 (122) |
| games with at least one smoke in turns 1-5 | 20% (206) | 19% (130) | 48% (2174) | 19% (84) | 21% (122) |
| decoys on turn 1 (per game) | 0.41 (206) | 0.45 (130) | 0.47 (2174) | 0.36 (84) | 0.44 (122) |
| decoys on turn 2 (per game) | 0.33 (206) | 0.32 (130) | 0.40 (2174) | 0.29 (84) | 0.35 (122) |
| decoys on turn 3 (per game) | 0.18 (206) | 0.18 (130) | 0.25 (2174) | 0.19 (84) | 0.17 (122) |
| decoys on turn 4 (per game) | 0.16 (206) | 0.09 (130) | 0.20 (2174) | 0.19 (84) | 0.13 (122) |
| decoys on turn 5 (per game) | 0.13 (206) | 0.11 (130) | 0.14 (2174) | 0.12 (84) | 0.14 (122) |
| decoys in turns 1-5 (per game) | 1.20 (206) | 1.15 (130) | 1.45 (2174) | 1.14 (84) | 1.24 (122) |
| decoys whole game (per game) | 4.30 (206) | 4.45 (130) | 3.83 (2174) | 4.58 (84) | 4.11 (122) |
| games with at least one decoy in turns 1-5 | 72% (206) | 72% (130) | 59% (2174) | 68% (84) | 75% (122) |
| dashes on turn 1 (per game) | 1.48 (206) | 1.65 (130) | 2.63 (2174) | 1.49 (84) | 1.48 (122) |
| dashes in turns 1-5 (per game) | 3.69 (206) | 3.76 (130) | 5.24 (2174) | 3.85 (84) | 3.59 (122) |
| dashes whole game (per game) | 18.69 (206) | 18.62 (130) | 21.77 (2174) | 19.77 (84) | 17.95 (122) |

**Nets, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 513 | 309 | 4161 | 223 | 290 |
| distance to nearest predator at the order (q25 / median / q75) | 1285 / 2125 / 3691 (513) | 1242 / 2156 / 3575 (309) | 1445 / 2327 / 3781 (4150) | 1294 / 1951 / 3364 (223) | 1245 / 2280 / 3868 (290) |
| distance to nearest prey at the order (q25 / median / q75) | 1281 / 1747 / 2444 (513) | 1285 / 1744 / 2531 (309) | 1239 / 1689 / 2242 (4158) | 1295 / 1762 / 2458 (223) | 1269 / 1731 / 2408 (290) |
| predator within 1500 | 33% (513) | 35% (309) | 27% (4150) | 33% (223) | 32% (290) |
| predator within 2500 | 57% (513) | 57% (309) | 53% (4150) | 61% (223) | 54% (290) |
| prey within 2000 | 63% (513) | 62% (309) | 67% (4158) | 62% (223) | 64% (290) |
| thrower held by a net | 15% (513) | 13% (309) | 11% (4161) | 14% (223) | 17% (290) |
| hit prey | 32% (513) | 31% (309) | 29% (4161) | 34% (223) | 30% (290) |
| hit predator | 25% (513) | 26% (309) | 16% (4161) | 26% (223) | 24% (290) |
| aimed at a predator (hit or miss) | 27% (513) | 28% (309) | 25% (4161) | 29% (223) | 26% (290) |
| aimed at prey (hit or miss) | 68% (513) | 66% (309) | 70% (4161) | 67% (223) | 68% (290) |
| no enemy near the line | 5% (513) | 6% (309) | 6% (4161) | 4% (223) | 6% (290) |
| absorbed by a decoy | 13% (513) | 13% (309) | 12% (4161) | 11% (223) | 15% (290) |
| stopped by a tree | 2% (513) | 2% (309) | 5% (4161) | 1% (223) | 2% (290) |
| distance thrower-target (q25 / median / q75) | 1100 / 1419 / 1794 (489) | 1115 / 1404 / 1763 (292) | 1145 / 1494 / 1868 (3922) | 1182 / 1472 / 1797 (215) | 1061 / 1357 / 1793 (274) |
| target could dash | 50% (489) | 51% (292) | 65% (3931) | 51% (215) | 49% (274) |
| target already held | 3% (489) | 2% (292) | 3% (3931) | 2% (215) | 3% (274) |
| hit rate when the target could dash | 41% (231) | 42% (142) | 37% (2465) | 43% (105) | 39% (126) |
| hit rate when the target could not dash | 75% (244) | 78% (144) | 67% (1343) | 81% (105) | 71% (139) |
| nets at predators: one of our units held within 2000 of it (rescue) | 1% (141) | 1% (88) | 2% (1034) | 0% (65) | 3% (76) |
| nets at predators: predator within 1500 of the thrower | 76% (141) | 78% (88) | 68% (1034) | 72% (65) | 79% (76) |
| hit one of our own units | 0% (513) | 0% (309) | 0% (4161) | 0% (223) | 0% (290) |

**Nets, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 456 | 301 | 5010 | 180 | 276 |
| distance to nearest predator at the order (q25 / median / q75) | 1211 / 2381 / 4093 (452) | 1211 / 2480 / 3997 (300) | 1295 / 2484 / 4148 (4849) | 1123 / 2368 / 3936 (178) | 1266 / 2427 / 4350 (274) |
| distance to nearest prey at the order (q25 / median / q75) | 1219 / 1759 / 2925 (455) | 1154 / 1709 / 2866 (300) | 1251 / 1777 / 2791 (4913) | 1373 / 1783 / 3113 (179) | 1154 / 1741 / 2876 (276) |
| predator within 1500 | 32% (452) | 31% (300) | 31% (4849) | 33% (178) | 31% (274) |
| predator within 2500 | 52% (452) | 51% (300) | 50% (4849) | 51% (178) | 52% (274) |
| prey within 2000 | 62% (455) | 63% (300) | 61% (4913) | 63% (179) | 61% (276) |
| thrower held by a net | 17% (456) | 18% (301) | 14% (5010) | 13% (180) | 20% (276) |
| hit prey | 41% (456) | 42% (301) | 36% (5010) | 41% (180) | 42% (276) |
| hit predator | 25% (456) | 25% (301) | 25% (5010) | 25% (180) | 25% (276) |
| aimed at a predator (hit or miss) | 28% (456) | 28% (301) | 31% (5010) | 28% (180) | 28% (276) |
| aimed at prey (hit or miss) | 66% (456) | 66% (301) | 61% (5010) | 67% (180) | 66% (276) |
| no enemy near the line | 6% (456) | 6% (301) | 8% (5010) | 4% (180) | 7% (276) |
| absorbed by a decoy | 14% (456) | 14% (301) | 11% (5010) | 16% (180) | 12% (276) |
| stopped by a tree | 3% (456) | 3% (301) | 5% (5010) | 2% (180) | 4% (276) |
| distance thrower-target (q25 / median / q75) | 977 / 1349 / 1765 (429) | 888 / 1294 / 1729 (282) | 1015 / 1387 / 1789 (4576) | 1028 / 1426 / 1779 (171) | 930 / 1294 / 1765 (258) |
| target could dash | 70% (430) | 67% (282) | 78% (4615) | 73% (172) | 67% (258) |
| target already held | 11% (430) | 12% (282) | 7% (4615) | 10% (172) | 12% (258) |
| hit rate when the target could dash | 60% (251) | 59% (155) | 62% (3289) | 59% (108) | 61% (143) |
| hit rate when the target could not dash | 82% (131) | 82% (93) | 75% (1021) | 83% (46) | 81% (85) |
| nets at predators: one of our units held within 2000 of it (rescue) | 0% (127) | 0% (84) | 2% (1555) | 0% (51) | 0% (76) |
| nets at predators: predator within 1500 of the thrower | 86% (127) | 82% (84) | 72% (1555) | 90% (51) | 83% (76) |
| hit one of our own units | 0% (456) | 0% (301) | 0% (5010) | 0% (180) | 0% (276) |

**Smoke, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 45 | 27 | 1706 | 18 | 27 |
| distance to nearest predator at the order (q25 / median / q75) | 984 / 1206 / 1370 (45) | 995 / 1158 / 1370 (27) * | 1102 / 1505 / 2004 (1705) | 995 / 1213 / 1466 (18) * | 937 / 1206 / 1353 (27) * |
| distance to nearest prey at the order (q25 / median / q75) | 2517 / 3637 / 5986 (45) | 2206 / 3407 / 5459 (27) * | 1853 / 2849 / 4229 (1703) | 2982 / 4823 / 8042 (18) * | 2314 / 3193 / 5624 (27) * |
| predator within 1500 | 87% (45) | 89% (27) * | 49% (1705) | 83% (18) * | 89% (27) * |
| predator within 2500 | 100% (45) | 100% (27) * | 87% (1705) | 100% (18) * | 100% (27) * |
| prey within 2000 | 18% (45) | 22% (27) * | 28% (1703) | 17% (18) * | 19% (27) * |
| thrower held by a net | 20% (45) | 19% (27) * | 11% (1706) | 28% (18) * | 15% (27) * |
| cloud centre along the line unit-predator, 0 = unit, 1 = predator (q25 / median / q75, x100) | 36 / 60 / 89 (45) | 37 / 66 / 89 (27) * | 0 / 0 / 61 (1705) | 25 / 50 / 79 (18) * | 40 / 69 / 92 (27) * |
| cloud centre off that line (median) | 369 (45) | 342 (27) * | 1 (1705) | 370 (18) * | 355 (27) * |
| thrower inside its own cloud (centre within 1900) | 100% (45) | 100% (27) * | 91% (1706) | 100% (18) * | 100% (27) * |
| nearest predator inside the cloud (within 1900 of the centre) | 98% (45) | 100% (27) * | 63% (1705) | 100% (18) * | 96% (27) * |
| dropped on itself (within 400) | 9% (45) | 11% (27) * | 55% (1706) | 11% (18) * | 7% (27) * |
| thrown 400-1500 | 91% (45) | 89% (27) * | 25% (1706) | 89% (18) * | 93% (27) * |
| thrown over 1500 | 0% (45) | 0% (27) * | 20% (1706) | 0% (18) * | 0% (27) * |
| thrown toward the predator | 46% (41) | 50% (24) * | 63% (774) | 50% (16) * | 44% (25) * |
| a held team-mate within 1900 of the cloud centre | 4% (45) | 4% (27) * | 2% (1706) | 6% (18) * | 4% (27) * |
| nearest predator to the cloud centre (median) | 1199 (45) | 1199 (27) * | 1667 (1705) | 1200 (18) * | 1199 (27) * |
| nearest prey to the cloud centre (median) | 3493 (45) | 3230 (27) * | 2719 (1703) | 4983 (18) * | 2875 (27) * |

**Smoke, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 601 | 381 | 4907 | 300 | 301 |
| distance to nearest predator at the order (q25 / median / q75) | 844 / 1098 / 1336 (598) | 825 / 1071 / 1333 (378) | 846 / 1191 / 1659 (4882) | 887 / 1120 / 1335 (297) | 779 / 1064 / 1336 (301) |
| distance to nearest prey at the order (q25 / median / q75) | 2494 / 3734 / 5513 (553) | 2463 / 3737 / 5328 (352) | 2206 / 3455 / 5281 (4608) | 2590 / 3927 / 5827 (252) | 2460 / 3528 / 5112 (301) |
| predator within 1500 | 85% (598) | 85% (378) | 68% (4882) | 85% (297) | 86% (301) |
| predator within 2500 | 98% (598) | 98% (378) | 93% (4882) | 99% (297) | 98% (301) |
| prey within 2000 | 12% (553) | 13% (352) | 21% (4608) | 10% (252) | 14% (301) |
| thrower held by a net | 7% (601) | 8% (381) | 11% (4907) | 6% (300) | 9% (301) |
| cloud centre along the line unit-predator, 0 = unit, 1 = predator (q25 / median / q75, x100) | 57 / 81 / 101 (598) | 55 / 81 / 101 (378) | 0 / 0 / 65 (4880) | 61 / 82 / 102 (297) | 53 / 79 / 101 (301) |
| cloud centre off that line (median) | 393 (598) | 401 (378) | 1 (4882) | 415 (297) | 374 (301) |
| thrower inside its own cloud (centre within 1900) | 100% (601) | 100% (381) | 88% (4907) | 100% (300) | 100% (301) |
| nearest predator inside the cloud (within 1900 of the centre) | 98% (598) | 98% (378) | 77% (4882) | 99% (297) | 98% (301) |
| dropped on itself (within 400) | 1% (601) | 1% (381) | 62% (4907) | 1% (300) | 2% (301) |
| thrown 400-1500 | 99% (601) | 99% (381) | 20% (4907) | 99% (300) | 98% (301) |
| thrown over 1500 | 0% (601) | 0% (381) | 18% (4907) | 0% (300) | 0% (301) |
| thrown toward the predator | 58% (589) | 57% (373) | 75% (1852) | 58% (295) | 57% (294) |
| a held team-mate within 1900 of the cloud centre | 0% (601) | 0% (381) | 1% (4907) | 0% (300) | 1% (301) |
| nearest predator to the cloud centre (median) | 686 (598) | 749 (378) | 1310 (4882) | 610 (297) | 856 (301) |
| nearest prey to the cloud centre (median) | 3696 (553) | 3696 (352) | 3458 (4608) | 3935 (252) | 3641 (301) |

**Decoys, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 247 | 150 | 3157 | 96 | 151 |
| distance to nearest predator at the order (q25 / median / q75) | 1225 / 1645 / 1907 (247) | 1174 / 1599 / 1890 (150) | 1177 / 1523 / 1936 (3154) | 1260 / 1656 / 1907 (96) | 1216 / 1640 / 1909 (151) |
| distance to nearest prey at the order (q25 / median / q75) | 2516 / 3300 / 4870 (247) | 2648 / 3419 / 4907 (150) | 1966 / 2898 / 4276 (3151) | 2790 / 3462 / 5315 (96) | 2365 / 3226 / 4754 (151) |
| predator within 1500 | 41% (247) | 46% (150) | 49% (3154) | 38% (96) | 44% (151) |
| predator within 2500 | 93% (247) | 93% (150) | 90% (3154) | 94% (96) | 92% (151) |
| prey within 2000 | 11% (247) | 7% (150) | 26% (3151) | 10% (96) | 12% (151) |
| thrower held by a net | 8% (247) | 4% (150) | 7% (3157) | 10% (96) | 7% (151) |
| decoy walks toward the nearest predator | 11% (247) | 10% (150) | 17% (3154) | 14% (96) | 10% (151) |
| decoy walks away from the nearest predator | 37% (247) | 38% (150) | 40% (3154) | 40% (96) | 36% (151) |
| decoy walks toward the nearest prey | 32% (247) | 33% (150) | 29% (3151) | 31% (96) | 32% (151) |
| decoy: same point as the unit | 0% (247) | 1% (150) | 0% (3157) | 0% (96) | 1% (151) |
| decoy: same direction as the unit | 15% (247) | 14% (150) | 15% (3157) | 14% (96) | 17% (151) |
| decoy: opposite direction | 31% (247) | 32% (150) | 29% (3157) | 33% (96) | 30% (151) |
| decoy: sideways from the unit | 53% (247) | 53% (150) | 50% (3157) | 53% (96) | 53% (151) |

**Decoys, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 639 | 429 | 5163 | 289 | 350 |
| distance to nearest predator at the order (q25 / median / q75) | 1295 / 1665 / 1988 (637) | 1293 / 1659 / 1981 (427) | 1014 / 1395 / 1772 (5134) | 1281 / 1648 / 2014 (288) | 1296 / 1689 / 1982 (349) |
| distance to nearest prey at the order (q25 / median / q75) | 2451 / 3408 / 4907 (620) | 2514 / 3502 / 4930 (415) | 2349 / 3519 / 5228 (4921) | 2523 / 3537 / 5076 (270) | 2292 / 3361 / 4765 (350) |
| predator within 1500 | 36% (637) | 37% (427) | 57% (5134) | 36% (288) | 36% (349) |
| predator within 2500 | 88% (637) | 87% (427) | 92% (5134) | 87% (288) | 89% (349) |
| prey within 2000 | 15% (620) | 15% (415) | 18% (4921) | 12% (270) | 18% (350) |
| thrower held by a net | 5% (639) | 6% (429) | 5% (5163) | 5% (289) | 5% (350) |
| decoy walks toward the nearest predator | 9% (637) | 10% (427) | 13% (5134) | 9% (288) | 10% (349) |
| decoy walks away from the nearest predator | 44% (637) | 44% (427) | 39% (5134) | 45% (288) | 43% (349) |
| decoy walks toward the nearest prey | 25% (620) | 26% (415) | 31% (4921) | 21% (270) | 27% (350) |
| decoy: same point as the unit | 0% (639) | 0% (429) | 0% (5163) | 0% (289) | 0% (350) |
| decoy: same direction as the unit | 17% (639) | 17% (429) | 16% (5163) | 18% (289) | 16% (350) |
| decoy: opposite direction | 31% (639) | 32% (429) | 29% (5163) | 30% (289) | 32% (350) |
| decoy: sideways from the unit | 52% (639) | 51% (429) | 51% (5163) | 52% (289) | 52% (350) |

**Trigger table, turn 1: nearest free predator at this distance (start of the turn)**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 50 | 0% (50) | 40% (50) | 10% (50) | 90% (50) | 76% (50) | 0% (50) | 16% (50) | 509 | 21% (509) | 27% (509) | 22% (509) | 93% (509) | 72% (509) | 2% (509) | 15% (509) |
| 1000-1500 | 83 | 0% (83) | 39% (83) | 19% (83) | 53% (83) | 67% (83) | 0% (83) | 13% (83) | 897 | 15% (897) | 37% (897) | 16% (897) | 85% (897) | 56% (897) | 1% (897) | 14% (897) |
| 1500-2000 | 132 | 0% (132) | 18% (132) | 14% (132) | 39% (132) | 62% (132) | 1% (132) | 6% (132) | 1249 | 14% (1249) | 25% (1249) | 20% (1249) | 71% (1249) | 45% (1249) | 3% (1249) | 10% (1249) |
| 2000-2500 | 126 | 0% (126) | 6% (126) | 12% (126) | 44% (126) | 63% (126) | 7% (126) | 8% (126) | 1216 | 11% (1216) | 14% (1216) | 16% (1216) | 60% (1216) | 39% (1216) | 11% (1216) | 6% (1216) |
| 2500-3000 | 109 | 0% (109) | 1% (109) | 7% (109) | 31% (109) | 56% (109) | 12% (109) | 0% (109) | 1108 | 5% (1108) | 4% (1108) | 12% (1108) | 53% (1108) | 28% (1108) | 26% (1108) | 3% (1108) |

**Trigger table, turns 2+: nearest free predator at this distance**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 2630 | 9% (2630) | 2% (2630) | 4% (2630) | 26% (2198) | 60% (2391) | 9% (2391) | 26% (2630) | 32409 | 6% (32409) | 4% (32409) | 2% (32409) | 23% (27316) | 72% (29614) | 6% (29614) | 23% (32409) |
| 1000-1500 | 3586 | 8% (3586) | 5% (3586) | 4% (3586) | 15% (2805) | 59% (3399) | 9% (3399) | 13% (3586) | 41070 | 4% (41070) | 6% (41070) | 3% (41070) | 17% (31956) | 68% (39315) | 7% (39315) | 13% (41070) |
| 1500-2000 | 3872 | 2% (3872) | 9% (3872) | 2% (3872) | 9% (3346) | 54% (3768) | 14% (3768) | 7% (3872) | 39146 | 3% (39146) | 5% (39146) | 2% (39146) | 14% (32245) | 53% (37923) | 11% (37923) | 7% (39146) |
| 2000-2500 | 3953 | 0% (3953) | 2% (3953) | 2% (3953) | 7% (3522) | 42% (3884) | 23% (3884) | 2% (3953) | 39623 | 1% (39623) | 1% (39623) | 2% (39623) | 10% (33998) | 39% (38741) | 22% (38741) | 3% (39623) |
| 2500-3000 | 4264 | 0% (4264) | 1% (4264) | 1% (4264) | 7% (3853) | 38% (4182) | 28% (4182) | 1% (4264) | 38951 | 0% (38951) | 1% (38951) | 2% (38951) | 9% (34118) | 34% (38089) | 27% (38089) | 1% (38951) |

**Trigger table, turn 1: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 19 * | 21% (19) * | - (0) * | - (0) * | 74% (19) * | 84% (19) * | 21% (19) * | 193 | 24% (193) | - (0) * | - (0) * | 66% (193) | 89% (193) | 19% (193) |
| 800-1200 | 57 | 14% (57) | - (0) * | - (0) * | 81% (57) | 81% (57) | 11% (57) | 590 | 23% (590) | - (0) * | - (0) * | 82% (590) | 89% (590) | 14% (590) |
| 1200-1600 | 77 | 21% (77) | - (0) * | - (0) * | 69% (77) | 73% (77) | 14% (77) | 813 | 26% (813) | - (0) * | - (0) * | 89% (813) | 87% (813) | 13% (813) |
| 1600-2000 | 102 | 49% (102) | - (0) * | - (0) * | 29% (102) | 54% (102) | 14% (102) | 1039 | 38% (1039) | - (0) * | - (0) * | 71% (1039) | 80% (1039) | 12% (1039) |
| 2000-2500 | 117 | 24% (117) | - (0) * | - (0) * | 30% (117) | 56% (117) | 13% (117) | 1212 | 28% (1212) | - (0) * | - (0) * | 63% (1212) | 80% (1212) | 9% (1212) |

**Trigger table, turns 2+: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 2470 | 1% (2152) | 5% (126) | 5% (192) | 13% (1889) | 84% (2470) | 23% (2470) | 18395 | 1% (15415) | 7% (832) | 3% (2148) | 10% (13545) | 81% (18395) | 29% (18395) |
| 800-1200 | 3101 | 2% (2498) | 9% (409) | 7% (194) | 17% (2493) | 78% (3101) | 17% (3101) | 32212 | 2% (26362) | 9% (4100) | 3% (1750) | 17% (25285) | 80% (32212) | 18% (32212) |
| 1200-1600 | 3600 | 2% (2731) | 12% (684) | 4% (185) | 26% (3158) | 72% (3600) | 13% (3600) | 35699 | 3% (27250) | 8% (6793) | 3% (1656) | 22% (30690) | 75% (35699) | 13% (35699) |
| 1600-2000 | 3563 | 3% (3016) | 9% (390) | 8% (157) | 11% (3323) | 68% (3563) | 8% (3563) | 34124 | 4% (27681) | 7% (4970) | 4% (1473) | 18% (30702) | 64% (34124) | 10% (34124) |
| 2000-2500 | 4517 | 1% (3821) | 3% (553) | 6% (143) | 7% (4290) | 56% (4517) | 5% (4517) | 41334 | 1% (34617) | 3% (5230) | 3% (1487) | 11% (37875) | 51% (41334) | 7% (41334) |

## 2. How its catches were made: RNG

**Catches by the team (columns: team / team new / catches by other seats / catches in its wins / in its non-wins)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| catches | 658 | 416 | 6390 | 344 | 314 |
| prey held by a net | 34% (658) | 34% (416) | 32% (6390) | 32% (344) | 37% (314) |
| prey held: net of the catching team | 94% (227) | 94% (143) | 92% (2067) | 93% (110) | 95% (117) |
| prey held: net of the third team | 5% (227) | 6% (143) | 8% (2067) | 6% (110) | 4% (117) |
| prey held: netted by the catching unit itself | 88% (213) | 87% (134) | 85% (1895) | 88% (102) | 88% (111) |
| turns from net to catch = 1 | 46% (227) | 45% (143) | 49% (2067) | 52% (110) | 40% (117) |
| turns from net to catch = 2 | 31% (227) | 31% (143) | 30% (2067) | 26% (110) | 35% (117) |
| turns from net to catch = 3 | 15% (227) | 15% (143) | 12% (2067) | 13% (110) | 16% (117) |
| turns from net to catch = 4 | 9% (227) | 8% (143) | 9% (2067) | 9% (110) | 9% (117) |
| catcher dashed | 47% (658) | 48% (416) | 39% (6390) | 44% (344) | 50% (314) |
| catcher dashed, prey held | 61% (227) | 60% (143) | 43% (2067) | 63% (110) | 59% (117) |
| catcher dashed, prey free | 40% (431) | 42% (273) | 37% (4323) | 36% (234) | 45% (197) |
| free prey: its dash was available and unused | 82% (431) | 80% (273) | 79% (4323) | 82% (234) | 81% (197) |
| free prey: dashed this turn | 11% (431) | 13% (273) | 12% (4323) | 12% (234) | 10% (197) |
| free prey: dash on cooldown | 7% (431) | 7% (273) | 9% (4323) | 6% (234) | 9% (197) |
| free prey: moving toward the catcher | 44% (431) | 43% (273) | 46% (4323) | 45% (234) | 42% (197) |
| free prey: was chasing its own prey | 5% (431) | 4% (273) | 6% (4323) | 6% (234) | 4% (197) |
| start distance catcher-prey (q25 / median / q75) | 585 / 815 / 1138 (651) | 603 / 823 / 1163 (414) | 573 / 810 / 1111 (6332) | 604 / 815 / 1130 (339) | 578 / 816 / 1138 (312) |
| units of the team within 1800 of the prey: 1 | 76% (658) | 76% (416) | 69% (6390) | 74% (344) | 77% (314) |
| units within 1800: 2 | 23% (658) | 22% (416) | 27% (6390) | 24% (344) | 21% (314) |
| units within 1800: 3 or more | 2% (658) | 2% (416) | 3% (6390) | 2% (344) | 2% (314) |
| units within 1800 (mean) | 1.25 (658) | 1.25 (416) | 1.32 (6390) | 1.26 (344) | 1.23 (314) |
| prey at the wall (radius > 6500) | 21% (658) | 19% (416) | 20% (6390) | 19% (344) | 22% (314) |
| prey distance from the wall (q25 / median / q75) | 1840 / 3383 / 5024 (658) | 2008 / 3484 / 5042 (416) | 1915 / 3556 / 5188 (6390) | 2079 / 3615 / 5324 (344) | 1688 / 3127 / 4696 (314) |
| prey within 2500 of the centre | 19% (658) | 21% (416) | 21% (6390) | 21% (344) | 16% (314) |
| turn of the catch (q25 / median / q75) | 10 / 25 / 53 (658) | 11 / 25 / 54 (416) | 10 / 25 / 50 (6390) | 11 / 26 / 53 (344) | 10 / 25 / 55 (314) |
| catch by turn 10 | 25% (658) | 25% (416) | 27% (6390) | 24% (344) | 26% (314) |
| catch on turns 11-30 | 29% (658) | 32% (416) | 30% (6390) | 30% (344) | 29% (314) |
| catch after turn 60 | 22% (658) | 21% (416) | 18% (6390) | 22% (344) | 21% (314) |
| prey inside smoke of its own team | 23% (658) | 20% (416) | 24% (6390) | 22% (344) | 24% (314) |
| prey had a team-mate within 1500 | 16% (658) | 16% (416) | 14% (6390) | 17% (344) | 16% (314) |

**Net hits of the team on prey: conversion (caught within 5 turns)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| net hits on prey | 352 | 222 | 3009 | 149 | 203 |
| converted | 63% (352) | 62% (222) | 67% (3009) | 70% (149) | 58% (203) |
| a free hunter within 1200 after the net | 47% (352) | 45% (222) | 58% (3009) | 48% (149) | 46% (203) |
| a free hunter within 1800 | 74% (352) | 73% (222) | 82% (3009) | 79% (149) | 71% (203) |
| converted when a hunter within 1800 | 75% (261) | 75% (162) | 74% (2453) | 82% (117) | 70% (144) |
| converted when no hunter within 1800 | 26% (91) | 27% (60) | 40% (556) | 25% (32) | 27% (59) |
| distance of the nearest free hunter (q25 / median / q75) | 813 / 1224 / 1806 (349) | 813 / 1264 / 1832 (220) | 649 / 1022 / 1538 (2979) | 799 / 1215 / 1698 (149) | 853 / 1278 / 1905 (200) |
| target was already held (re-net) | 11% (352) | 11% (222) | 6% (3009) | 9% (149) | 12% (203) |

## 3. How its units were lost: RNG

**Units lost by the team (other seats: units lost by them)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| units lost | 584 | 380 | 6426 | 213 | 371 |
| held by a net | 30% (584) | 29% (380) | 33% (6426) | 25% (213) | 33% (371) |
| held: net of the predator team | 91% (176) | 87% (112) | 92% (2098) | 94% (53) | 89% (123) |
| held: net of the third team (its own prey) | 9% (176) | 13% (112) | 8% (2098) | 6% (53) | 11% (123) |
| held: net of its own team | 0% (176) | 0% (112) | 0% (2098) | 0% (53) | 0% (123) |
| turn (q25 / median / q75) | 10 / 25 / 52 (584) | 10 / 25 / 52 (380) | 10 / 25 / 50 (6426) | 13 / 34 / 63 (213) | 9 / 23 / 46 (371) |
| by turn 10 | 28% (584) | 28% (380) | 26% (6426) | 23% (213) | 30% (371) |
| turns 11-30 | 27% (584) | 28% (380) | 30% (6426) | 23% (213) | 29% (371) |
| after turn 60 | 19% (584) | 19% (380) | 18% (6426) | 27% (213) | 14% (371) |
| at the wall (radius > 6500) | 24% (584) | 23% (380) | 20% (6426) | 30% (213) | 21% (371) |
| within 2500 of the centre | 16% (584) | 17% (380) | 21% (6426) | 11% (213) | 18% (371) |
| the unit dashed on that turn | 5% (584) | 5% (380) | 8% (6426) | 5% (213) | 6% (371) |
| free unit: dashed on that turn | 8% (408) | 7% (268) | 12% (4328) | 6% (160) | 8% (248) |
| free unit: dash available, not used | 87% (408) | 87% (268) | 78% (4328) | 88% (160) | 87% (248) |
| free unit: dash on cooldown | 5% (408) | 6% (268) | 9% (4328) | 6% (160) | 4% (248) |
| free unit: moving toward the catcher | 49% (408) | 50% (268) | 45% (4328) | 41% (160) | 53% (248) |
| free unit: was chasing its own prey | 5% (408) | 6% (268) | 6% (4328) | 4% (160) | 6% (248) |
| three or more dashes already spent | 50% (584) | 51% (380) | 60% (6426) | 61% (213) | 43% (371) |
| team used smoke in the 3 turns before | 24% (584) | 25% (380) | 24% (6426) | 24% (213) | 24% (371) |
| team used a decoy in the 3 turns before | 30% (584) | 28% (380) | 23% (6426) | 23% (213) | 33% (371) |
| team used smoke or decoy in the 3 turns before | 46% (584) | 46% (380) | 39% (6426) | 40% (213) | 50% (371) |
| inside a cloud of its own team (centre within 1900, last 9 turns) | 26% (584) | 25% (380) | 23% (6426) | 25% (213) | 26% (371) |
| the unit itself sent a decoy in the 3 turns before | 20% (584) | 20% (380) | 15% (6426) | 16% (213) | 22% (371) |
| team netted the catcher in the 3 turns before | 0% (584) | 0% (380) | 1% (6426) | 0% (213) | 0% (371) |
| catcher dashed | 37% (584) | 36% (380) | 40% (6426) | 37% (213) | 37% (371) |
| 2 or more hunters within 1800 | 29% (584) | 28% (380) | 30% (6426) | 31% (213) | 29% (371) |
| a team-mate within 1500 | 9% (584) | 8% (380) | 15% (6426) | 12% (213) | 8% (371) |

**Own units netted by the predator: what the team did in the next 3 turns**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| own units netted by the predator | 296 | 182 | 3049 | 121 | 175 |
| caught within 5 turns | 58% (296) | 60% (182) | 67% (3049) | 45% (121) | 68% (175) |
| smoke within 1900 of the unit | 23% (296) | 23% (182) | 30% (3049) | 25% (121) | 22% (175) |
| net on a unit of the predator team | 39% (296) | 38% (182) | 25% (3049) | 32% (121) | 43% (175) |
| the held unit sent a decoy | 28% (296) | 28% (182) | 20% (3049) | 26% (121) | 30% (175) |
| caught, with smoke | 55% (69) | 60% (42) | 50% (913) | 40% (30) | 67% (39) |
| caught, without smoke | 59% (227) | 60% (140) | 75% (2136) | 46% (91) | 68% (136) |
| caught, with a counter-net | 39% (114) | 40% (70) | 41% (773) | 18% (39) | 49% (75) |
| caught, without a counter-net | 71% (182) | 72% (112) | 76% (2276) | 57% (82) | 82% (100) |
| a free hunter within 1800 at the net | 80% (296) | 75% (182) | 81% (3049) | 73% (121) | 85% (175) |

## 4. Ghosts: RNG

**Ghost-turns (unit caught earlier, team still has living units)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| ghost-turns with an order | 100% (34676) | 100% (21861) | 96% (346020) | 100% (12183) | 100% (22493) |
| moving (order further than 60) | 96% (15650) | 96% (10001) | 89% (163437) | 96% (5722) | 96% (9928) |
| dashing | 0% (34676) | 0% (21861) | 0% (346020) | 0% (12183) | 0% (22493) |
| order aimed within 1000 of a living prey | 18% (15026) | 18% (9618) | 27% (145834) | 14% (5477) | 20% (9549) |
| order aimed within 1000 of a living predator | 24% (15026) | 22% (9618) | 11% (145834) | 26% (5477) | 22% (9549) |
| order aimed within 1000 of a living team-mate | 5% (15026) | 6% (9618) | 3% (145834) | 5% (5477) | 5% (9549) |
| order aimed at none of these | 53% (15026) | 54% (9618) | 58% (145834) | 54% (5477) | 52% (9549) |
| aimed at prey: that prey is held by a net | 3% (2737) | 3% (1773) | 4% (39795) | 4% (782) | 3% (1955) |
| aimed at prey: a living hunter of ours within 2500 of it | 41% (2737) | 42% (1773) | 51% (39795) | 42% (782) | 41% (1955) |
| aimed at predator: a living team-mate within 2500 of it | 39% (3535) | 41% (2099) | 35% (16132) | 45% (1422) | 35% (2113) |
| moving toward the nearest living prey | 44% (15026) | 45% (9618) | 47% (145834) | 38% (5477) | 48% (9549) |
| moving toward the nearest living predator | 44% (15026) | 44% (9618) | 35% (145834) | 46% (5477) | 44% (9549) |
| position within 2000 of a living prey | 36% (15650) | 36% (10001) | 33% (163437) | 28% (5722) | 41% (9928) |
| position within 2000 of a living predator | 49% (15650) | 46% (10001) | 38% (163437) | 52% (5722) | 47% (9928) |
| position within 2000 of a living team-mate | 23% (15650) | 24% (10001) | 24% (163437) | 24% (5722) | 23% (9928) |
| position within 2000 of nobody | 24% (15650) | 26% (10001) | 33% (163437) | 25% (5722) | 23% (9928) |
| median distance to the nearest living prey | 2625 (14584) | 2625 (9294) | 2875 (149285) | 2875 (4715) | 2375 (9869) |
| median distance to the nearest living predator | 1875 (15069) | 2125 (9586) | 2625 (159736) | 1875 (5575) | 2125 (9494) |

## 5. Three units against six: RNG

| | team, 3 units | team, 4 units | team, 5 units | team, 6 units | others, 3 units | others, 4 units | others, 5 units | others, 6 units |
|---|---|---|---|---|---|---|---|---|
| games | 39 | 58 | 56 | 53 | 546 | 559 | 550 | 519 |
| wins | 41% (39) | 38% (58) | 43% (56) | 42% (53) | 32% (546) | 33% (559) | 32% (550) | 34% (519) |
| last place | 38% (39) | 24% (58) | 25% (56) | 23% (53) | 33% (546) | 34% (559) | 34% (550) | 34% (519) |
| mean rank | 1.97 (39) | 1.86 (58) | 1.82 (56) | 1.81 (53) | 2.01 (546) | 2.00 (559) | 2.02 (550) | 2.00 (519) |
| catches per game | 1.79 (39) | 2.71 (58) | 3.61 (56) | 4.32 (53) | 1.73 (546) | 2.56 (559) | 3.36 (550) | 4.17 (519) |
| catches per unit of the prey team | 0.60 (39) | 0.68 (58) | 0.72 (56) | 0.72 (53) | 0.58 (546) | 0.64 (559) | 0.67 (550) | 0.69 (519) |
| units lost per game | 1.56 (39) | 2.62 (58) | 3.25 (56) | 3.57 (53) | 1.75 (546) | 2.56 (559) | 3.39 (550) | 4.19 (519) |
| share of own units lost | 0.52 (39) | 0.66 (58) | 0.65 (56) | 0.59 (53) | 0.58 (546) | 0.64 (559) | 0.68 (550) | 0.70 (519) |
| catches by turn 10 | 0.41 (39) | 0.64 (58) | 0.84 (56) | 1.26 (53) | 0.37 (546) | 0.65 (559) | 0.91 (550) | 1.22 (519) |
| units lost by turn 10 | 0.41 (39) | 0.64 (58) | 0.82 (56) | 1.19 (53) | 0.37 (546) | 0.64 (559) | 0.91 (550) | 1.23 (519) |
| first catch turn (median) | 14 (36) | 10 (56) | 7 (56) | 5 (53) | 17 (477) | 9 (534) | 7 (537) | 6 (509) |
| made the first catch of the game | 23% (39) | 33% (58) | 36% (56) | 49% (53) | 34% (546) | 34% (559) | 33% (550) | 32% (519) |
| nets per game | 2.74 (39) | 4.00 (58) | 5.13 (56) | 6.47 (53) | 2.54 (546) | 3.75 (559) | 4.85 (550) | 5.82 (519) |
| nets in turns 1-3 | 0.67 (39) | 1.41 (58) | 2.07 (56) | 2.75 (53) | 0.73 (546) | 1.25 (559) | 1.77 (550) | 2.26 (519) |
| smoke per game | 1.82 (39) | 2.69 (58) | 3.61 (56) | 4.09 (53) | 1.91 (546) | 2.66 (559) | 3.47 (550) | 4.19 (519) |
| smoke in turns 1-5 | 0.15 (39) | 0.24 (58) | 0.27 (56) | 0.19 (53) | 0.40 (546) | 0.64 (559) | 0.93 (550) | 1.19 (519) |
| decoys per game | 2.82 (39) | 3.45 (58) | 5.05 (56) | 5.53 (53) | 2.29 (546) | 3.31 (559) | 4.52 (550) | 5.26 (519) |
| decoys in turns 1-5 | 0.49 (39) | 0.83 (58) | 1.80 (56) | 1.49 (53) | 0.73 (546) | 1.16 (559) | 1.77 (550) | 2.19 (519) |
| dashes per unit, whole game | 3.96 (39) | 3.91 (58) | 4.32 (56) | 4.00 (53) | 4.86 (546) | 5.01 (559) | 4.85 (550) | 4.76 (519) |
| turn 1: units dashing | 10% (107) | 23% (202) | 35% (268) | 50% (306) | 55% (1513) | 61% (2103) | 59% (2651) | 66% (3044) |
| turn 1: toward nearest prey | 56% (107) | 55% (202) | 52% (268) | 47% (306) | 76% (1513) | 74% (2103) | 73% (2651) | 73% (3044) |
| turn 1: away from nearest predator | 37% (107) | 42% (202) | 42% (268) | 49% (306) | 26% (1513) | 32% (2103) | 32% (2651) | 35% (3044) |
| net hits prey | 35% (107) | 41% (232) | 36% (287) | 35% (343) | 32% (1387) | 34% (2096) | 32% (2667) | 33% (3021) |
| nets aimed at predators | 25% (107) | 30% (232) | 29% (287) | 26% (343) | 30% (1387) | 26% (2096) | 28% (2667) | 29% (3021) |
| catches: prey held by a net | 34% (70) | 38% (157) | 29% (202) | 38% (229) | 33% (947) | 35% (1432) | 31% (1847) | 31% (2164) |
| catches: catcher dashed | 60% (70) | 47% (157) | 44% (202) | 46% (229) | 41% (947) | 39% (1432) | 39% (1847) | 39% (2164) |
| losses: held by a net | 39% (61) | 29% (152) | 24% (182) | 34% (189) | 33% (955) | 35% (1433) | 31% (1864) | 32% (2174) |
| tie on catches for first place | 26% (39) | 34% (58) | 30% (56) | 23% (53) | 21% (546) | 24% (559) | 22% (550) | 18% (519) |

## 6. Ahead, level, behind on catches: RNG

State at the start of the turn: own catches against the better of the two other teams. Left block: the team (all games). Right block: other seats of the new folder.

**turns 6-30**

| | team ahead | team level | team behind | others ahead | others level | others behind |
|---|---|---|---|---|---|---|
| unit-turns | 4700 | 5810 | 7646 | 44881 | 55369 | 83135 |
| dash when available | 7% (4189) | 9% (5034) | 9% (6702) | 10% (38733) | 12% (46962) | 12% (70665) |
| nets per 100 unit-turns | 1.4 (4700) | 2.9 (5810) | 2.5 (7646) | 1.6 (44881) | 2.2 (55369) | 2.4 (83135) |
| net when prey within 2000 | 4% (802) | 6% (1471) | 6% (2173) | 5% (7967) | 5% (13186) | 5% (24530) |
| smoke per 100 | 2.0 (4700) | 1.7 (5810) | 1.2 (7646) | 1.7 (44881) | 1.5 (55369) | 1.4 (83135) |
| decoys per 100 | 2.4 (4700) | 2.5 (5810) | 2.1 (7646) | 1.9 (44881) | 2.0 (55369) | 1.7 (83135) |
| median distance to nearest predator | 3125 (4449) | 3125 (5350) | 3375 (7059) | 3125 (43860) | 3375 (53361) | 3375 (79144) |
| predator within 1800 | 24% (4449) | 23% (5350) | 17% (7059) | 23% (43860) | 21% (53361) | 19% (79144) |
| median distance to nearest prey | 3875 (4353) | 3125 (5350) | 2875 (7211) | 3875 (42296) | 3375 (53390) | 2875 (80820) |
| prey within 3000: moving toward it | 57% (1414) | 61% (2330) | 59% (3552) | 58% (13703) | 59% (21379) | 58% (38971) |
| prey within 3000: dash | 12% (1264) | 14% (2065) | 13% (3163) | 16% (11840) | 18% (18357) | 17% (33663) |
| predator within 3000: moving away | 45% (2052) | 44% (2341) | 47% (2602) | 47% (19310) | 46% (21656) | 45% (29996) |
| predator within 3000: moving toward it | 22% (2052) | 21% (2341) | 18% (2602) | 19% (19310) | 19% (21656) | 20% (29996) |
| predator within 3000: dash | 11% (1837) | 14% (2077) | 13% (2310) | 15% (16843) | 17% (18675) | 17% (25937) |
| standing still | 5% (4516) | 3% (5477) | 3% (7282) | 6% (43015) | 5% (52518) | 6% (78819) |

**turns 31-100**

| | team ahead | team level | team behind | others ahead | others level | others behind |
|---|---|---|---|---|---|---|
| unit-turns | 10944 | 7991 | 13335 | 95304 | 65441 | 143408 |
| dash when available | 4% (10444) | 6% (7530) | 7% (12450) | 5% (89845) | 6% (61061) | 7% (133395) |
| nets per 100 unit-turns | 0.0 (10944) | 0.1 (7991) | 0.1 (13335) | 0.2 (95304) | 0.4 (65441) | 0.4 (143408) |
| net when prey within 2000 | 0% (1137) | 0% (1998) | 0% (4892) | 1% (9308) | 1% (13946) | 1% (46755) |
| smoke per 100 | 1.2 (10944) | 1.0 (7991) | 0.8 (13335) | 0.8 (95304) | 0.8 (65441) | 0.6 (143408) |
| decoys per 100 | 0.6 (10944) | 0.8 (7991) | 0.7 (13335) | 0.6 (95304) | 0.7 (65441) | 0.5 (143408) |
| median distance to nearest predator | 3125 (8610) | 3625 (6866) | 3625 (8630) | 2875 (76303) | 3125 (54924) | 3625 (95658) |
| predator within 1800 | 26% (8610) | 19% (6866) | 15% (8630) | 32% (76303) | 25% (54924) | 20% (95658) |
| median distance to nearest prey | 3875 (6267) | 3125 (6861) | 2375 (11663) | 4375 (52855) | 3375 (53903) | 2625 (121257) |
| prey within 3000: moving toward it | 60% (2183) | 70% (3249) | 76% (7188) | 64% (16300) | 68% (22578) | 73% (68094) |
| prey within 3000: dash | 10% (2005) | 11% (2950) | 11% (6529) | 11% (14744) | 11% (20428) | 11% (61652) |
| predator within 3000: moving away | 54% (4126) | 51% (2738) | 50% (3207) | 63% (38704) | 56% (25222) | 55% (38004) |
| predator within 3000: moving toward it | 15% (4126) | 16% (2738) | 17% (3207) | 10% (38704) | 14% (25222) | 15% (38004) |
| predator within 3000: dash | 9% (3772) | 9% (2508) | 9% (2945) | 11% (34973) | 11% (22772) | 11% (34320) |
| standing still | 4% (10927) | 3% (7958) | 4% (13253) | 10% (94748) | 6% (64911) | 5% (142263) |

## 7. Games it did not win: RNG

Non-wins: 122 of 206 (second 67, last 55). Winner was its **prey team** in 61 (50%), its **predator team** in 61 (50%). Other seats of the new folder: prey team won 50% of their non-wins.

First thing that went wrong in the non-wins (exclusive, in this order): lost a unit by turn 10: 89 (73%); no catch by turn 20: 11 (9%); level on catches with the winner, lost the tie-break: 1 (1%); fewer catches than the winner, none of the above: 21 (17%).

**The same events in wins and in non-wins**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| games | 206 | 130 | 2174 | 84 | 122 |
| lost a unit by turn 10 | 60% (206) | 62% (130) | 55% (2174) | 42% (84) | 73% (122) |
| lost a unit by turn 20 | 75% (206) | 75% (130) | 73% (2174) | 63% (84) | 84% (122) |
| no catch by turn 10 | 41% (206) | 40% (130) | 45% (2174) | 36% (84) | 45% (122) |
| no catch by turn 20 | 21% (206) | 21% (130) | 27% (2174) | 15% (84) | 25% (122) |
| made the first catch of the game | 36% (206) | 36% (130) | 33% (2174) | 49% (84) | 27% (122) |
| its first event: lost a unit before any catch | 43% (206) | 42% (130) | 45% (2174) | 21% (84) | 58% (122) |
| its first event: caught before losing | 52% (206) | 52% (130) | 50% (2174) | 70% (84) | 39% (122) |
| level on catches for first place | 29% (206) | 25% (130) | 21% (2174) | 42% (84) | 20% (122) |
| level on catches for first place: won the tie-break | 59% (59) | 64% (33) | 47% (466) | 100% (35) | 0% (24) * |
| eliminated (all units lost) | 15% (206) | 20% (130) | 25% (2174) | 8% (84) | 19% (122) |
| catches | 3.19 (206) | 3.20 (130) | 2.94 (2174) | 4.10 (84) | 2.57 (122) |
| units lost | 2.83 (206) | 2.92 (130) | 2.96 (2174) | 2.54 (84) | 3.04 (122) |
| catches by turn 10 | 0.81 (206) | 0.78 (130) | 0.78 (2174) | 1.00 (84) | 0.68 (122) |
| catches by turn 20 | 1.36 (206) | 1.35 (130) | 1.28 (2174) | 1.71 (84) | 1.12 (122) |
| units lost by turn 10 | 0.79 (206) | 0.81 (130) | 0.78 (2174) | 0.58 (84) | 0.93 (122) |
| first catch turn (median) | 8 (201) | 8 (126) | 8 (2057) | 6 (84) | 9 (117) |
| first loss turn (median) | 8 (198) | 8 (124) | 8 (2059) | 14 (79) | 6 (119) |
| catches of its predator team | 2.83 (206) | 2.92 (130) | 2.96 (2174) | 2.54 (84) | 3.04 (122) |
| catches of its prey team | 2.99 (206) | 3.09 (130) | 2.95 (2174) | 2.45 (84) | 3.36 (122) |
| nets in turns 1-3 | 1.80 (206) | 1.69 (130) | 1.49 (2174) | 2.05 (84) | 1.62 (122) |
| nets whole game | 4.70 (206) | 4.69 (130) | 4.22 (2174) | 4.80 (84) | 4.64 (122) |
| smoke whole game | 3.14 (206) | 3.14 (130) | 3.04 (2174) | 3.79 (84) | 2.69 (122) |
| decoys whole game | 4.30 (206) | 4.45 (130) | 3.83 (2174) | 4.58 (84) | 4.11 (122) |
| dashes on turn 1 | 1.48 (206) | 1.65 (130) | 2.63 (2174) | 1.49 (84) | 1.48 (122) |
| dashes whole game per unit | 4.05 (206) | 4.02 (130) | 4.87 (2174) | 4.28 (84) | 3.89 (122) |
| seat 0 | 33% (206) | 33% (130) | 33% (2174) | 42% (84) | 27% (122) |
| seat 1 | 34% (206) | 33% (130) | 33% (2174) | 30% (84) | 38% (122) |
| seat 2 | 33% (206) | 34% (130) | 33% (2174) | 29% (84) | 35% (122) |
| units per team (mean) | 4.60 (206) | 4.62 (130) | 4.48 (2174) | 4.62 (84) | 4.58 (122) |

**Win rate with and without each event**

| Event | team win % with it | team win % without it | others with it | others without it |
|---|---|---|---|---|
| lost a unit by turn 10 | 28% (124) | 60% (82) | 24% (1199) | 44% (975) |
| lost a unit by turn 20 | 34% (155) | 61% (51) | 26% (1582) | 51% (592) |
| a catch by turn 10 | 45% (121) | 35% (85) | 43% (1202) | 21% (972) |
| a catch by turn 20 | 44% (162) | 30% (44) | 40% (1577) | 15% (597) |
| made the first catch of the game | 55% (74) | 33% (132) | 51% (721) | 24% (1453) |
| lost a unit before any catch | 20% (89) | 56% (117) | 16% (970) | 47% (1204) |
| level on catches for first place | 59% (59) | 33% (147) | 47% (466) | 29% (1708) |
| seat 0 | 51% (68) | 36% (138) | 34% (725) | 33% (1449) |
| seat 1 | 35% (71) | 44% (135) | 31% (725) | 34% (1449) |
| seat 2 | 36% (67) | 43% (139) | 34% (724) | 32% (1450) |
| 3 units | 41% (39) | 41% (167) | 32% (546) | 33% (1628) |
| 4 units | 38% (58) | 42% (148) | 33% (559) | 33% (1615) |
| 5 units | 43% (56) | 40% (150) | 32% (550) | 33% (1624) |
| 6 units | 42% (53) | 41% (153) | 34% (519) | 33% (1655) |

**By the team that hunts it** (6 games or more)

| Opponent | games | team wins | opponent wins | team catches | team units lost |
|---|---|---|---|---|---|
| Les Gens Bons | 26 * | 15% | 38% | 2.81 | 3.12 |
| ATA | 23 * | 43% | 39% | 2.70 | 3.09 |
| VibeClauder's | 13 * | 62% | 23% | 3.31 | 2.85 |
| ThePyanist | 13 * | 38% | 46% | 2.92 | 2.54 |
| Kogaion | 10 * | 0% | 40% | 3.00 | 3.80 |
| SoloLeveling | 8 * | 13% | 13% | 3.00 | 2.38 |
| Vogue Mery | 8 * | 75% | 13% | 4.63 | 2.75 |
| Roman Empire | 8 * | 50% | 38% | 2.88 | 2.38 |
| FullStuck | 7 * | 29% | 29% | 2.86 | 3.14 |

**By the team it hunts** (6 games or more)

| Opponent | games | team wins | opponent wins | team catches | team units lost |
|---|---|---|---|---|---|
| ATA | 18 * | 17% | 50% | 2.67 | 2.89 |
| Les Gens Bons | 16 * | 31% | 38% | 2.38 | 2.25 |
| VibeClauder's | 15 * | 13% | 33% | 2.40 | 2.73 |
| FullStuck | 13 * | 62% | 23% | 3.46 | 2.38 |
| Kogaion | 10 * | 60% | 10% | 3.40 | 3.10 |
| Vogue Mery | 10 * | 40% | 20% | 2.40 | 3.00 |
| Dragons Fight Club | 8 * | 25% | 50% | 2.63 | 3.38 |
| RemoteException | 7 * | 29% | 29% | 4.14 | 2.86 |
| Agave | 6 * | 0% | 67% | 1.33 | 2.33 |
| ThePyanist | 6 * | 67% | 17% | 3.50 | 3.33 |
| Roman Empire | 6 * | 17% | 67% | 3.00 | 2.33 |
| BitingBytes | 6 * | 33% | 0% | 2.17 | 3.50 |

## 8. Other observations: RNG

**Living unit-turns, whole game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| unit-turns | 55055 | 34205 | 534963 | 25561 | 29494 |
| held by a net | 3% (55055) | 3% (34205) | 3% (534963) | 2% (25561) | 3% (29494) |
| dash when available | 8% (49907) | 8% (30926) | 10% (474168) | 7% (23387) | 8% (26520) |
| standing still (free units) | 4% (53648) | 3% (33282) | 6% (519972) | 3% (25006) | 4% (28642) |
| predator within 1800 | 21% (44778) | 21% (27483) | 24% (447136) | 21% (21521) | 21% (23257) |
| predator within 1200 | 10% (44778) | 10% (27483) | 12% (447136) | 11% (21521) | 10% (23257) |
| median distance to nearest predator | 3375 (44778) | 3375 (27483) | 3125 (447136) | 3375 (21521) | 3375 (23257) |
| median distance to nearest prey | 3125 (45518) | 2875 (28288) | 3125 (448418) | 3375 (19281) | 2875 (26237) |
| prey within 2000 | 30% (45518) | 30% (28288) | 29% (448418) | 26% (19281) | 33% (26237) |
| net when prey within 2000 | 4% (13693) | 4% (8596) | 4% (130900) | 5% (5047) | 4% (8646) |
| predator within 3000: away | 50% (18961) | 50% (11678) | 52% (194430) | 51% (9197) | 49% (9764) |
| predator within 3000: toward | 17% (18961) | 17% (11678) | 15% (194430) | 16% (9197) | 18% (9764) |
| predator within 3000: sideways | 30% (18961) | 30% (11678) | 31% (194430) | 29% (9197) | 30% (9764) |
| predator within 3000: dash when available | 13% (16904) | 13% (10374) | 16% (169038) | 12% (8231) | 13% (8673) |
| predator within 3000: smoke | 3% (18961) | 3% (11678) | 3% (194430) | 3% (9197) | 3% (9764) |
| predator within 3000: decoy | 4% (18961) | 4% (11678) | 4% (194430) | 4% (9197) | 5% (9764) |
| predator within 3000: net | 2% (18961) | 3% (11678) | 2% (194430) | 2% (9197) | 3% (9764) |
| prey within 3000: toward | 66% (21762) | 65% (13533) | 65% (203679) | 65% (8250) | 67% (13512) |
| prey within 3000: away | 13% (21762) | 14% (13533) | 14% (203679) | 14% (8250) | 13% (13512) |
| prey within 3000: dash when available | 13% (19426) | 14% (12062) | 16% (176741) | 14% (7337) | 13% (12089) |
| DASH orders that were not executed (cooldown) | 0% (3851) | 0% (2420) | 0% (47394) | 0% (1661) | 0% (2190) |
| dashes: fleeing (predator within 2000, moving away) | 23% (3851) | 22% (2420) | 24% (47327) | 26% (1661) | 20% (2190) |
| dashes: attacking (prey within 2500, moving toward) | 48% (3851) | 48% (2420) | 39% (47327) | 43% (1661) | 51% (2190) |
| dashes: travelling (neither) | 30% (3851) | 30% (2420) | 37% (47327) | 31% (1661) | 29% (2190) |

**Nets aimed at units of this team (by anyone)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets aimed at its units | 864 | 549 | 8571 | 333 | 531 |
| hit the unit | 55% (864) | 56% (549) | 58% (8571) | 54% (333) | 55% (531) |
| absorbed by a decoy | 11% (864) | 9% (549) | 8% (8571) | 10% (333) | 11% (531) |
| unit could dash | 77% (864) | 75% (549) | 71% (8571) | 81% (333) | 74% (531) |
| hit when the unit could dash | 48% (614) | 48% (376) | 51% (5675) | 46% (253) | 49% (361) |
| hit when its dash was on cooldown | 72% (194) | 72% (138) | 71% (2463) | 81% (59) | 67% (135) |
| the unit dashed on that turn | 28% (864) | 28% (549) | 30% (8571) | 35% (333) | 24% (531) |
| hit when it dashed that turn | 25% (244) | 24% (154) | 31% (2553) | 21% (117) | 29% (127) |
| hit when it did not dash | 66% (564) | 68% (360) | 69% (5585) | 72% (195) | 63% (369) |
| thrown by its predator team | 70% (864) | 66% (549) | 70% (8571) | 75% (333) | 67% (531) |
| thrown by turn 5 | 52% (864) | 50% (549) | 46% (8571) | 53% (333) | 52% (531) |

**Trigger table, all turns: nearest free predator at this distance**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 2680 | 9% (2680) | 3% (2680) | 4% (2680) | 28% (2248) | 61% (2441) | 9% (2441) | 26% (2680) | 32918 | 6% (32918) | 5% (32918) | 3% (32918) | 24% (27825) | 72% (30123) | 6% (30123) | 23% (32918) |
| 1000-1500 | 3669 | 8% (3669) | 6% (3669) | 4% (3669) | 16% (2888) | 60% (3482) | 9% (3482) | 13% (3669) | 41967 | 5% (41967) | 6% (41967) | 3% (41967) | 19% (32853) | 68% (40212) | 6% (40212) | 13% (41967) |
| 1500-2000 | 4004 | 2% (4004) | 9% (4004) | 2% (4004) | 10% (3478) | 54% (3900) | 13% (3900) | 7% (4004) | 40395 | 3% (40395) | 6% (40395) | 3% (40395) | 16% (33494) | 53% (39172) | 11% (39172) | 7% (40395) |
| 2000-2500 | 4079 | 0% (4079) | 2% (4079) | 2% (4079) | 8% (3648) | 43% (4010) | 23% (4010) | 3% (4079) | 40839 | 1% (40839) | 2% (40839) | 2% (40839) | 11% (35214) | 39% (39957) | 22% (39957) | 3% (40839) |
| 2500-3000 | 4373 | 0% (4373) | 1% (4373) | 2% (4373) | 7% (3962) | 38% (4291) | 28% (4291) | 1% (4373) | 40059 | 1% (40059) | 1% (40059) | 2% (40059) | 10% (35226) | 34% (39197) | 27% (39197) | 1% (40059) |

**Trigger table, all turns: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 2489 | 1% (2171) | 5% (126) | 5% (192) | 14% (1908) | 84% (2489) | 23% (2489) | 18588 | 2% (15608) | 7% (832) | 3% (2148) | 11% (13738) | 81% (18588) | 29% (18588) |
| 800-1200 | 3158 | 2% (2555) | 9% (409) | 7% (194) | 19% (2550) | 78% (3158) | 17% (3158) | 32802 | 3% (26952) | 9% (4100) | 3% (1750) | 18% (25875) | 80% (32802) | 18% (32802) |
| 1200-1600 | 3677 | 3% (2808) | 12% (684) | 4% (185) | 27% (3235) | 72% (3677) | 13% (3677) | 36512 | 4% (28063) | 8% (6793) | 3% (1656) | 24% (31503) | 75% (36512) | 13% (36512) |
| 1600-2000 | 3665 | 5% (3118) | 9% (390) | 8% (157) | 12% (3425) | 67% (3665) | 8% (3665) | 35163 | 5% (28720) | 7% (4970) | 4% (1473) | 20% (31741) | 65% (35163) | 10% (35163) |
| 2000-2500 | 4634 | 1% (3938) | 3% (553) | 6% (143) | 7% (4407) | 56% (4634) | 5% (4634) | 42546 | 2% (35829) | 3% (5230) | 3% (1487) | 13% (39087) | 52% (42546) | 7% (42546) |

**All nets of the game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets | 969 | 610 | 9171 | 403 | 566 |
| hit prey | 36% (969) | 36% (610) | 33% (9171) | 37% (403) | 36% (566) |
| hit predator | 25% (969) | 25% (610) | 21% (9171) | 25% (403) | 24% (566) |
| absorbed by a decoy | 13% (969) | 14% (610) | 11% (9171) | 13% (403) | 14% (566) |
| aimed at predators | 28% (969) | 28% (610) | 28% (9171) | 29% (403) | 27% (566) |
| no enemy near the line | 5% (969) | 6% (610) | 7% (9171) | 4% (403) | 6% (566) |
| thrown while held | 16% (969) | 15% (610) | 13% (9171) | 13% (403) | 18% (566) |
| thrown when ahead | 11% (969) | 13% (610) | 12% (9171) | 15% (403) | 8% (566) |
| thrown when behind | 26% (969) | 27% (610) | 33% (9171) | 18% (403) | 32% (566) |
| turn (q25 / median / q75) | 2 / 5 / 11 (969) | 2 / 5 / 12 (610) | 2 / 7 / 18 (9171) | 2 / 4 / 12 (403) | 2 / 5 / 11 (566) |

---

# SoloLeveling

## 1. Opening (turns 1-5): SoloLeveling

**Turn 1, per unit (direction of the order relative to the nearest predator start / nearest prey start; cos > 0.5 away, < -0.5 toward)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| units | 534 | 391 | 9470 | 169 | 365 |
| dash on turn 1 | 92% (534) | 98% (391) | 59% (9470) | 93% (169) | 92% (365) |
| dash on turn 1, nearest predator under 2000 | 92% (158) | 96% (110) | 78% (2706) | 91% (47) | 93% (111) |
| dash on turn 1, nearest predator 2000-3500 | 92% (175) | 97% (138) | 53% (3271) | 96% (50) | 90% (125) |
| dash on turn 1, nearest predator over 3500 | 93% (201) | 100% (143) | 48% (3493) | 92% (72) | 93% (129) |
| dash on turn 1, nearest prey under 2000 | 94% (157) | 98% (109) | 77% (2678) | 94% (47) | 95% (110) |
| dash on turn 1, nearest prey 2000-3500 | 92% (171) | 97% (132) | 56% (3284) | 92% (53) | 92% (118) |
| dash on turn 1, nearest prey over 3500 | 91% (206) | 99% (150) | 47% (3508) | 93% (69) | 90% (137) |
| vs predator: away | 34% (534) | 32% (391) | 32% (9470) | 36% (169) | 33% (365) |
| vs predator: toward | 25% (534) | 23% (391) | 28% (9470) | 24% (169) | 25% (365) |
| vs predator: sideways | 41% (534) | 45% (391) | 39% (9470) | 40% (169) | 42% (365) |
| vs predator: no move | 0% (534) | 0% (391) | 1% (9470) | 0% (169) | 0% (365) |
| vs prey: toward | 71% (534) | 72% (391) | 72% (9470) | 70% (169) | 72% (365) |
| vs prey: away | 12% (534) | 12% (391) | 11% (9470) | 11% (169) | 12% (365) |
| vs prey: sideways | 17% (534) | 16% (391) | 17% (9470) | 19% (169) | 16% (365) |
| predator under 2000: away from it | 54% (158) | 47% (110) | 55% (2706) | 60% (47) | 52% (111) |
| predator under 2000: toward nearest prey | 57% (158) | 61% (110) | 57% (2706) | 62% (47) | 55% (111) |
| predator over 3500: toward nearest prey | 79% (201) | 78% (143) | 83% (3493) | 72% (72) | 82% (129) |
| prey nearer than predator: toward prey | 84% (258) | 87% (181) | 85% (4627) | 77% (86) | 88% (172) |
| predator nearer than prey: away from predator | 40% (274) | 37% (208) | 41% (4701) | 49% (83) | 36% (191) |
| prey under 2000: toward it | 83% (157) | 86% (109) | 84% (2678) | 81% (47) | 85% (110) |
| prey under 2000: dash toward it | 80% (157) | 84% (109) | 68% (2678) | 77% (47) | 82% (110) |
| dashers: toward prey | 73% (493) | 72% (383) | 77% (5549) | 71% (157) | 74% (336) |
| dashers: away from predator | 34% (493) | 32% (383) | 36% (5549) | 36% (157) | 33% (336) |
| toward the centre | 48% (534) | 48% (391) | 51% (9470) | 52% (169) | 46% (365) |
| toward the wall | 16% (534) | 15% (391) | 18% (9470) | 14% (169) | 17% (365) |

**Turn 1, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 92% (534) | 98% (391) | 56% (9947) | 93% (169) | 92% (365) |
| toward nearest prey (any distance) | 71% (534) | 72% (391) | 72% (9640) | 70% (169) | 72% (365) |
| away from nearest predator (any distance) | 34% (534) | 32% (391) | 32% (9640) | 36% (169) | 33% (365) |
| toward nearest predator | 25% (534) | 23% (391) | 28% (9640) | 24% (169) | 25% (365) |
| median distance to nearest predator | 2875 (534) | 2875 (391) | 2875 (9669) | 2875 (169) | 2625 (365) |
| median distance to nearest prey | 2875 (534) | 2875 (391) | 2875 (9668) | 2875 (169) | 2875 (365) |
| predator within 1800 | 23% (534) | 21% (391) | 23% (9669) | 20% (169) | 24% (365) |
| prey within 2000 | 29% (534) | 28% (391) | 28% (9668) | 28% (169) | 30% (365) |
| net thrown when prey within 2000 | 13% (157) | 0% (109) | 31% (2697) | 15% (47) | 12% (110) |
| held by a net | 0% (534) | 0% (391) | 0% (9947) | 0% (169) | 0% (365) |

**Turn 2, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 3% (512) | 2% (376) | 8% (9520) | 2% (165) | 3% (347) |
| toward nearest prey (any distance) | 66% (493) | 66% (367) | 59% (8233) | 63% (160) | 68% (333) |
| away from nearest predator (any distance) | 37% (493) | 37% (367) | 37% (8233) | 39% (160) | 36% (333) |
| toward nearest predator | 31% (493) | 29% (367) | 27% (8233) | 26% (160) | 33% (333) |
| median distance to nearest predator | 2625 (525) | 2625 (387) | 2625 (8700) | 2875 (166) | 2625 (359) |
| median distance to nearest prey | 2375 (517) | 2375 (384) | 2375 (8711) | 2625 (163) | 2375 (354) |
| predator within 1800 | 30% (525) | 30% (387) | 32% (8700) | 28% (166) | 31% (359) |
| prey within 2000 | 40% (517) | 41% (384) | 39% (8711) | 37% (163) | 42% (354) |
| net thrown when prey within 2000 | 48% (209) | 59% (158) | 27% (3439) | 42% (60) | 50% (149) |
| held by a net | 4% (533) | 4% (390) | 4% (9914) | 2% (168) | 5% (365) |

**Turn 3, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 81% (474) | 96% (345) | 34% (8730) | 79% (155) | 82% (319) |
| toward nearest prey (any distance) | 59% (459) | 59% (336) | 54% (7655) | 62% (151) | 57% (308) |
| away from nearest predator (any distance) | 37% (459) | 36% (336) | 38% (7655) | 36% (151) | 37% (308) |
| toward nearest predator | 31% (459) | 29% (336) | 26% (7655) | 34% (151) | 29% (308) |
| median distance to nearest predator | 2625 (522) | 2625 (381) | 2625 (8856) | 3125 (166) | 2375 (356) |
| median distance to nearest prey | 2125 (513) | 2125 (378) | 2375 (8860) | 2375 (163) | 2125 (350) |
| predator within 1800 | 29% (522) | 29% (381) | 31% (8856) | 25% (166) | 30% (356) |
| prey within 2000 | 43% (513) | 45% (378) | 39% (8860) | 39% (163) | 45% (350) |
| net thrown when prey within 2000 | 23% (219) | 27% (169) | 12% (3456) | 19% (63) | 25% (156) |
| held by a net | 10% (526) | 10% (384) | 11% (9833) | 7% (167) | 11% (359) |

**Turn 4, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 5% (456) | 3% (330) | 12% (8386) | 7% (152) | 5% (304) |
| toward nearest prey (any distance) | 55% (442) | 54% (322) | 50% (7418) | 57% (151) | 54% (291) |
| away from nearest predator (any distance) | 37% (442) | 41% (322) | 38% (7418) | 32% (151) | 40% (291) |
| toward nearest predator | 29% (442) | 24% (322) | 27% (7418) | 30% (151) | 28% (291) |
| median distance to nearest predator | 2875 (505) | 2875 (369) | 2625 (8667) | 3125 (163) | 2625 (342) |
| median distance to nearest prey | 2625 (496) | 2625 (366) | 2625 (8671) | 2875 (163) | 2375 (333) |
| predator within 1800 | 23% (505) | 22% (369) | 28% (8667) | 20% (163) | 25% (342) |
| prey within 2000 | 36% (496) | 38% (366) | 34% (8671) | 31% (163) | 39% (333) |
| net thrown when prey within 2000 | 19% (180) | 22% (138) | 11% (2971) | 25% (51) | 16% (129) |
| held by a net | 10% (509) | 11% (372) | 12% (9494) | 7% (164) | 12% (345) |

**Turn 5, living units**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| dash (share of free units) | 3% (436) | 1% (317) | 10% (8061) | 3% (145) | 3% (291) |
| toward nearest prey (any distance) | 50% (426) | 49% (312) | 49% (7204) | 54% (145) | 47% (281) |
| away from nearest predator (any distance) | 40% (426) | 39% (312) | 36% (7204) | 39% (145) | 40% (281) |
| toward nearest predator | 29% (426) | 25% (312) | 27% (7204) | 28% (145) | 29% (281) |
| median distance to nearest predator | 3125 (503) | 3125 (368) | 2875 (8529) | 3125 (163) | 2875 (340) |
| median distance to nearest prey | 2875 (491) | 2875 (362) | 2875 (8536) | 3125 (163) | 2875 (328) |
| predator within 1800 | 19% (503) | 17% (368) | 26% (8529) | 13% (163) | 21% (340) |
| prey within 2000 | 33% (491) | 35% (362) | 32% (8536) | 31% (163) | 34% (328) |
| net thrown when prey within 2000 | 10% (163) | 12% (128) | 10% (2712) | 18% (51) | 6% (112) |
| held by a net | 13% (503) | 14% (368) | 13% (9269) | 11% (163) | 14% (340) |

**Items and dashes per game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets on turn 1 (per game) | 0.21 (121) | 0.00 (88) | 0.64 (2216) | 0.22 (37) | 0.20 (84) |
| nets on turn 2 (per game) | 1.04 (121) | 1.34 (88) | 0.58 (2216) | 0.92 (37) | 1.10 (84) |
| nets on turn 3 (per game) | 0.54 (121) | 0.63 (88) | 0.27 (2216) | 0.41 (37) | 0.60 (84) |
| nets on turn 4 (per game) | 0.37 (121) | 0.44 (88) | 0.23 (2216) | 0.51 (37) | 0.31 (84) |
| nets on turn 5 (per game) | 0.21 (121) | 0.24 (88) | 0.20 (2216) | 0.35 (37) | 0.15 (84) |
| nets in turns 1-5 (per game) | 2.37 (121) | 2.65 (88) | 1.91 (2216) | 2.41 (37) | 2.36 (84) |
| nets whole game (per game) | 4.29 (121) | 4.23 (88) | 4.25 (2216) | 4.65 (37) | 4.13 (84) |
| games with at least one net in turns 1-5 | 89% (121) | 92% (88) | 77% (2216) | 89% (37) | 89% (84) |
| smokes on turn 1 (per game) | 0.45 (121) | 0.61 (88) | 0.27 (2216) | 0.43 (37) | 0.45 (84) |
| smokes on turn 2 (per game) | 0.33 (121) | 0.45 (88) | 0.15 (2216) | 0.24 (37) | 0.37 (84) |
| smokes on turn 3 (per game) | 0.18 (121) | 0.25 (88) | 0.12 (2216) | 0.30 (37) | 0.13 (84) |
| smokes on turn 4 (per game) | 0.20 (121) | 0.27 (88) | 0.09 (2216) | 0.16 (37) | 0.21 (84) |
| smokes on turn 5 (per game) | 0.09 (121) | 0.13 (88) | 0.08 (2216) | 0.00 (37) | 0.13 (84) |
| smokes in turns 1-5 (per game) | 1.25 (121) | 1.72 (88) | 0.71 (2216) | 1.14 (37) | 1.30 (84) |
| smokes whole game (per game) | 2.98 (121) | 4.09 (88) | 3.01 (2216) | 2.76 (37) | 3.07 (84) |
| games with at least one smoke in turns 1-5 | 60% (121) | 82% (88) | 45% (2216) | 54% (37) | 62% (84) |
| decoys on turn 1 (per game) | 0.74 (121) | 0.77 (88) | 0.46 (2216) | 0.68 (37) | 0.76 (84) |
| decoys on turn 2 (per game) | 0.33 (121) | 0.24 (88) | 0.40 (2216) | 0.41 (37) | 0.30 (84) |
| decoys on turn 3 (per game) | 0.28 (121) | 0.25 (88) | 0.25 (2216) | 0.27 (37) | 0.29 (84) |
| decoys on turn 4 (per game) | 0.21 (121) | 0.17 (88) | 0.20 (2216) | 0.24 (37) | 0.20 (84) |
| decoys on turn 5 (per game) | 0.17 (121) | 0.11 (88) | 0.13 (2216) | 0.19 (37) | 0.17 (84) |
| decoys in turns 1-5 (per game) | 1.74 (121) | 1.55 (88) | 1.43 (2216) | 1.78 (37) | 1.71 (84) |
| decoys whole game (per game) | 4.38 (121) | 4.11 (88) | 3.85 (2216) | 4.54 (37) | 4.31 (84) |
| games with at least one decoy in turns 1-5 | 87% (121) | 84% (88) | 59% (2216) | 78% (37) | 90% (84) |
| dashes on turn 1 (per game) | 4.07 (121) | 4.35 (88) | 2.50 (2216) | 4.24 (37) | 4.00 (84) |
| dashes in turns 1-5 (per game) | 7.69 (121) | 8.33 (88) | 5.03 (2216) | 8.05 (37) | 7.52 (84) |
| dashes whole game (per game) | 32.24 (121) | 35.50 (88) | 21.04 (2216) | 37.51 (37) | 29.92 (84) |

**Nets, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 287 | 233 | 4237 | 89 | 198 |
| distance to nearest predator at the order (q25 / median / q75) | 1710 / 2798 / 4744 (285) | 1697 / 2654 / 4423 (231) | 1398 / 2302 / 3734 (4228) | 1812 / 3099 / 5456 (89) | 1642 / 2654 / 4451 (196) |
| distance to nearest prey at the order (q25 / median / q75) | 1116 / 1494 / 1930 (286) | 1065 / 1444 / 1889 (233) | 1257 / 1711 / 2267 (4234) | 1092 / 1487 / 2051 (89) | 1119 / 1494 / 1906 (197) |
| predator within 1500 | 18% (285) | 17% (231) | 28% (4228) | 13% (89) | 20% (196) |
| predator within 2500 | 44% (285) | 46% (231) | 54% (4228) | 42% (89) | 45% (196) |
| prey within 2000 | 77% (286) | 79% (233) | 66% (4234) | 74% (89) | 79% (197) |
| thrower held by a net | 6% (287) | 6% (233) | 12% (4237) | 2% (89) | 8% (198) |
| hit prey | 38% (287) | 38% (233) | 29% (4237) | 39% (89) | 38% (198) |
| hit predator | 10% (287) | 12% (233) | 17% (4237) | 6% (89) | 13% (198) |
| aimed at a predator (hit or miss) | 16% (287) | 17% (233) | 26% (4237) | 16% (89) | 17% (198) |
| aimed at prey (hit or miss) | 76% (287) | 76% (233) | 69% (4237) | 75% (89) | 77% (198) |
| no enemy near the line | 7% (287) | 7% (233) | 5% (4237) | 9% (89) | 7% (198) |
| absorbed by a decoy | 14% (287) | 15% (233) | 12% (4237) | 13% (89) | 14% (198) |
| stopped by a tree | 7% (287) | 9% (233) | 4% (4237) | 10% (89) | 6% (198) |
| distance thrower-target (q25 / median / q75) | 1141 / 1447 / 1797 (265) | 1140 / 1445 / 1774 (216) | 1143 / 1492 / 1863 (3998) | 1119 / 1484 / 1904 (81) | 1154 / 1439 / 1797 (184) |
| target could dash | 58% (266) | 53% (217) | 65% (4006) | 63% (81) | 56% (185) |
| target already held | 4% (266) | 5% (217) | 3% (4006) | 4% (81) | 4% (185) |
| hit rate when the target could dash | 44% (143) | 46% (106) | 37% (2501) | 42% (48) | 45% (95) |
| hit rate when the target could not dash | 68% (112) | 66% (101) | 68% (1386) | 67% (30) | 68% (82) |
| nets at predators: one of our units held within 2000 of it (rescue) | 0% (47) | 0% (39) | 2% (1083) | 0% (14) * | 0% (33) |
| nets at predators: predator within 1500 of the thrower | 57% (47) | 54% (39) | 70% (1083) | 50% (14) * | 61% (33) |
| hit one of our own units | 0% (287) | 0% (233) | 0% (4237) | 0% (89) | 1% (198) |

**Nets, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 232 | 139 | 5172 | 83 | 149 |
| distance to nearest predator at the order (q25 / median / q75) | 1459 / 2948 / 4535 (230) | 1819 / 3397 / 4933 (139) | 1283 / 2456 / 4108 (5010) | 1336 / 2317 / 4198 (83) | 1659 / 3157 / 4711 (147) |
| distance to nearest prey at the order (q25 / median / q75) | 1227 / 1696 / 2832 (230) | 1145 / 1612 / 2496 (139) | 1250 / 1777 / 2806 (5074) | 1244 / 1789 / 3858 (83) | 1201 / 1661 / 2614 (147) |
| predator within 1500 | 26% (230) | 19% (139) | 32% (5010) | 33% (83) | 22% (147) |
| predator within 2500 | 43% (230) | 35% (139) | 51% (5010) | 53% (83) | 37% (147) |
| prey within 2000 | 60% (230) | 65% (139) | 61% (5074) | 55% (83) | 62% (147) |
| thrower held by a net | 14% (232) | 19% (139) | 14% (5172) | 10% (83) | 16% (149) |
| hit prey | 35% (232) | 40% (139) | 36% (5172) | 29% (83) | 38% (149) |
| hit predator | 20% (232) | 18% (139) | 25% (5172) | 28% (83) | 16% (149) |
| aimed at a predator (hit or miss) | 28% (232) | 24% (139) | 31% (5172) | 36% (83) | 23% (149) |
| aimed at prey (hit or miss) | 56% (232) | 64% (139) | 61% (5172) | 49% (83) | 60% (149) |
| no enemy near the line | 16% (232) | 12% (139) | 8% (5172) | 14% (83) | 17% (149) |
| absorbed by a decoy | 12% (232) | 14% (139) | 11% (5172) | 8% (83) | 13% (149) |
| stopped by a tree | 3% (232) | 4% (139) | 5% (5172) | 5% (83) | 1% (149) |
| distance thrower-target (q25 / median / q75) | 988 / 1362 / 1696 (194) | 1049 / 1400 / 1789 (123) | 1006 / 1382 / 1786 (4735) | 1092 / 1336 / 1631 (71) | 943 / 1372 / 1810 (123) |
| target could dash | 89% (194) | 92% (123) | 77% (4774) | 83% (71) | 93% (123) |
| target already held | 15% (194) | 20% (123) | 7% (4774) | 8% (71) | 19% (123) |
| hit rate when the target could dash | 64% (146) | 65% (89) | 61% (3355) | 63% (54) | 64% (92) |
| hit rate when the target could not dash | 74% (19) * | 67% (9) * | 76% (1105) | 64% (11) * | 88% (8) * |
| nets at predators: one of our units held within 2000 of it (rescue) | 3% (64) | 6% (34) | 2% (1605) | 0% (30) | 6% (34) |
| nets at predators: predator within 1500 of the thrower | 69% (64) | 59% (34) | 73% (1605) | 67% (30) | 71% (34) |
| hit one of our own units | 1% (232) | 1% (139) | 0% (5172) | 0% (83) | 1% (149) |

**Smoke, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 151 | 151 | 1582 | 42 | 109 |
| distance to nearest predator at the order (q25 / median / q75) | 1200 / 1746 / 2249 (151) | 1200 / 1746 / 2249 (151) | 1082 / 1487 / 1955 (1581) | 1165 / 1742 / 2223 (42) | 1249 / 1800 / 2249 (109) |
| distance to nearest prey at the order (q25 / median / q75) | 2162 / 2932 / 4815 (150) | 2162 / 2932 / 4815 (150) | 1833 / 2849 / 4224 (1580) | 2325 / 3262 / 5567 (42) | 2113 / 2849 / 4775 (108) |
| predator within 1500 | 40% (151) | 40% (151) | 51% (1581) | 45% (42) | 39% (109) |
| predator within 2500 | 81% (151) | 81% (151) | 87% (1581) | 81% (42) | 82% (109) |
| prey within 2000 | 21% (150) | 21% (150) | 29% (1580) | 19% (42) | 22% (108) |
| thrower held by a net | 5% (151) | 5% (151) | 11% (1582) | 5% (42) | 5% (109) |
| cloud centre along the line unit-predator, 0 = unit, 1 = predator (q25 / median / q75, x100) | 44 / 79 / 115 (151) | 44 / 79 / 115 (151) | 0 / 0 / 45 (1581) | 48 / 82 / 116 (42) | 44 / 79 / 114 (109) |
| cloud centre off that line (median) | 388 (151) | 388 (151) | 1 (1581) | 388 (42) | 396 (109) |
| thrower inside its own cloud (centre within 1900) | 100% (151) | 100% (151) | 90% (1582) | 100% (42) | 100% (109) |
| nearest predator inside the cloud (within 1900 of the centre) | 86% (151) | 86% (151) | 61% (1581) | 88% (42) | 85% (109) |
| dropped on itself (within 400) | 0% (151) | 0% (151) | 59% (1582) | 0% (42) | 0% (109) |
| thrown 400-1500 | 38% (151) | 38% (151) | 25% (1582) | 48% (42) | 35% (109) |
| thrown over 1500 | 62% (151) | 62% (151) | 16% (1582) | 52% (42) | 65% (109) |
| thrown toward the predator | 80% (151) | 80% (151) | 58% (647) | 79% (42) | 81% (109) |
| a held team-mate within 1900 of the cloud centre | 0% (151) | 0% (151) | 2% (1582) | 0% (42) | 0% (109) |
| nearest predator to the cloud centre (median) | 597 (151) | 597 (151) | 1706 (1581) | 597 (42) | 598 (109) |
| nearest prey to the cloud centre (median) | 2742 (150) | 2742 (150) | 2720 (1580) | 3279 (42) | 2642 (108) |

**Smoke, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 209 | 209 | 5079 | 60 | 149 |
| distance to nearest predator at the order (q25 / median / q75) | 1204 / 1655 / 2121 (206) | 1204 / 1655 / 2121 (206) | 839 / 1160 / 1600 (5054) | 1261 / 1611 / 1956 (60) | 1199 / 1786 / 2266 (146) |
| distance to nearest prey at the order (q25 / median / q75) | 2355 / 3611 / 4980 (201) | 2355 / 3611 / 4980 (201) | 2226 / 3464 / 5307 (4759) | 2682 / 3879 / 5040 (53) | 2189 / 3324 / 4955 (148) |
| predator within 1500 | 43% (206) | 43% (206) | 71% (5054) | 47% (60) | 41% (146) |
| predator within 2500 | 84% (206) | 84% (206) | 94% (5054) | 93% (60) | 81% (146) |
| prey within 2000 | 18% (201) | 18% (201) | 20% (4759) | 13% (53) | 20% (148) |
| thrower held by a net | 11% (209) | 11% (209) | 10% (5079) | 13% (60) | 10% (149) |
| cloud centre along the line unit-predator, 0 = unit, 1 = predator (q25 / median / q75, x100) | 65 / 87 / 119 (206) | 65 / 87 / 119 (206) | 0 / 0 / 68 (5052) | 74 / 92 / 121 (60) | 57 / 81 / 119 (146) |
| cloud centre off that line (median) | 225 (206) | 225 (206) | 1 (5054) | 198 (60) | 244 (146) |
| thrower inside its own cloud (centre within 1900) | 100% (209) | 100% (209) | 88% (5079) | 100% (60) | 100% (149) |
| nearest predator inside the cloud (within 1900 of the centre) | 91% (206) | 91% (206) | 78% (5054) | 98% (60) | 88% (146) |
| dropped on itself (within 400) | 0% (209) | 0% (209) | 60% (5079) | 0% (60) | 0% (149) |
| thrown 400-1500 | 36% (209) | 36% (209) | 25% (5079) | 40% (60) | 35% (149) |
| thrown over 1500 | 64% (209) | 64% (209) | 15% (5079) | 60% (60) | 65% (149) |
| thrown toward the predator | 91% (206) | 91% (206) | 70% (2019) | 97% (60) | 88% (146) |
| a held team-mate within 1900 of the cloud centre | 1% (209) | 1% (209) | 1% (5079) | 0% (60) | 1% (149) |
| nearest predator to the cloud centre (median) | 638 (206) | 638 (206) | 1275 (5054) | 611 (60) | 652 (146) |
| nearest prey to the cloud centre (median) | 3304 (201) | 3304 (201) | 3485 (4759) | 3630 (53) | 3120 (148) |

**Decoys, turns 1-5**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 210 | 136 | 3171 | 66 | 144 |
| distance to nearest predator at the order (q25 / median / q75) | 1199 / 1504 / 1925 (210) | 1102 / 1502 / 1997 (136) | 1180 / 1527 / 1925 (3168) | 1311 / 1614 / 2170 (66) | 1189 / 1448 / 1841 (144) |
| distance to nearest prey at the order (q25 / median / q75) | 2132 / 3012 / 4983 (206) | 1973 / 2800 / 4663 (136) | 1999 / 2927 / 4279 (3165) | 1973 / 3012 / 4828 (66) | 2211 / 3077 / 5083 (140) |
| predator within 1500 | 49% (210) | 50% (136) | 49% (3168) | 41% (66) | 53% (144) |
| predator within 2500 | 94% (210) | 93% (136) | 90% (3168) | 92% (66) | 95% (144) |
| prey within 2000 | 22% (206) | 26% (136) | 25% (3165) | 26% (66) | 20% (140) |
| thrower held by a net | 0% (210) | 0% (136) | 7% (3171) | 0% (66) | 0% (144) |
| decoy walks toward the nearest predator | 8% (210) | 12% (136) | 17% (3168) | 5% (66) | 10% (144) |
| decoy walks away from the nearest predator | 25% (210) | 37% (136) | 40% (3168) | 21% (66) | 27% (144) |
| decoy walks toward the nearest prey | 33% (206) | 33% (136) | 29% (3165) | 36% (66) | 32% (140) |
| decoy: same point as the unit | 0% (210) | 0% (136) | 0% (3171) | 0% (66) | 0% (144) |
| decoy: same direction as the unit | 28% (210) | 32% (136) | 15% (3171) | 26% (66) | 29% (144) |
| decoy: opposite direction | 21% (210) | 18% (136) | 30% (3171) | 26% (66) | 19% (144) |
| decoy: sideways from the unit | 51% (210) | 50% (136) | 50% (3171) | 48% (66) | 52% (144) |

**Decoys, turns 6+**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| count | 320 | 226 | 5366 | 102 | 218 |
| distance to nearest predator at the order (q25 / median / q75) | 1309 / 1651 / 1943 (320) | 1226 / 1586 / 1948 (226) | 1026 / 1411 / 1784 (5335) | 1248 / 1548 / 1850 (102) | 1318 / 1709 / 1990 (218) |
| distance to nearest prey at the order (q25 / median / q75) | 2287 / 3526 / 5297 (312) | 2013 / 3568 / 5538 (220) | 2379 / 3517 / 5170 (5116) | 2987 / 4092 / 6292 (97) | 1963 / 3251 / 5015 (215) |
| predator within 1500 | 39% (320) | 42% (226) | 56% (5335) | 44% (102) | 37% (218) |
| predator within 2500 | 90% (320) | 89% (226) | 92% (5335) | 94% (102) | 88% (218) |
| prey within 2000 | 21% (312) | 25% (220) | 17% (5116) | 8% (97) | 27% (215) |
| thrower held by a net | 1% (320) | 0% (226) | 5% (5366) | 0% (102) | 1% (218) |
| decoy walks toward the nearest predator | 9% (320) | 12% (226) | 13% (5335) | 8% (102) | 10% (218) |
| decoy walks away from the nearest predator | 17% (320) | 23% (226) | 40% (5335) | 14% (102) | 18% (218) |
| decoy walks toward the nearest prey | 32% (312) | 33% (220) | 31% (5116) | 29% (97) | 34% (215) |
| decoy: same point as the unit | 0% (320) | 0% (226) | 0% (5366) | 0% (102) | 0% (218) |
| decoy: same direction as the unit | 29% (320) | 33% (226) | 15% (5366) | 26% (102) | 31% (218) |
| decoy: opposite direction | 13% (320) | 13% (226) | 29% (5366) | 11% (102) | 15% (218) |
| decoy: sideways from the unit | 57% (320) | 54% (226) | 51% (5366) | 63% (102) | 55% (218) |

**Trigger table, turn 1: nearest free predator at this distance (start of the turn)**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 33 | 12% (33) | 45% (33) | 12% (33) | 97% (33) | 76% (33) | 0% (33) | 18% (33) | 528 | 20% (528) | 27% (528) | 22% (528) | 92% (528) | 72% (528) | 2% (528) | 15% (528) |
| 1000-1500 | 56 | 18% (56) | 52% (56) | 0% (56) | 96% (56) | 52% (56) | 0% (56) | 7% (56) | 911 | 14% (911) | 36% (911) | 17% (911) | 83% (911) | 58% (911) | 1% (911) | 14% (911) |
| 1500-2000 | 69 | 23% (69) | 39% (69) | 1% (69) | 87% (69) | 46% (69) | 0% (69) | 9% (69) | 1287 | 13% (1287) | 24% (1287) | 20% (1287) | 68% (1287) | 46% (1287) | 3% (1287) | 10% (1287) |
| 2000-2500 | 71 | 25% (71) | 23% (71) | 6% (71) | 90% (71) | 31% (71) | 8% (71) | 6% (71) | 1241 | 10% (1241) | 13% (1241) | 16% (1241) | 58% (1241) | 41% (1241) | 10% (1241) | 6% (1241) |
| 2500-3000 | 66 | 9% (66) | 3% (66) | 6% (66) | 94% (66) | 29% (66) | 27% (66) | 5% (66) | 1124 | 4% (1124) | 4% (1124) | 13% (1124) | 50% (1124) | 29% (1124) | 25% (1124) | 2% (1124) |

**Trigger table, turns 2+: nearest free predator at this distance**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 1746 | 2% (1746) | 2% (1746) | 2% (1746) | 19% (1479) | 74% (1600) | 7% (1600) | 28% (1746) | 32775 | 6% (32775) | 4% (32775) | 3% (32775) | 23% (27575) | 71% (29921) | 6% (29921) | 23% (32775) |
| 1000-1500 | 2301 | 4% (2301) | 6% (2301) | 2% (2301) | 20% (1774) | 70% (2201) | 8% (2201) | 11% (2301) | 41778 | 4% (41778) | 6% (41778) | 3% (41778) | 17% (32544) | 68% (39979) | 7% (39979) | 13% (41778) |
| 1500-2000 | 2516 | 3% (2516) | 6% (2516) | 2% (2516) | 16% (2046) | 61% (2463) | 9% (2463) | 5% (2516) | 40027 | 3% (40027) | 5% (40027) | 2% (40027) | 13% (33095) | 53% (38782) | 11% (38782) | 7% (40027) |
| 2000-2500 | 2497 | 1% (2497) | 2% (2497) | 2% (2497) | 12% (2049) | 39% (2439) | 26% (2439) | 3% (2497) | 40388 | 1% (40388) | 1% (40388) | 2% (40388) | 9% (34829) | 40% (39516) | 22% (39516) | 3% (40388) |
| 2500-3000 | 2352 | 1% (2352) | 1% (2352) | 2% (2352) | 13% (1950) | 28% (2282) | 31% (2282) | 1% (2352) | 39948 | 0% (39948) | 1% (39948) | 2% (39948) | 8% (35167) | 35% (39073) | 27% (39073) | 1% (39948) |

**Trigger table, turn 1: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 16 * | 19% (16) * | - (0) * | - (0) * | 100% (16) * | 81% (16) * | 25% (16) * | 197 | 25% (197) | - (0) * | - (0) * | 64% (197) | 88% (197) | 19% (197) |
| 800-1200 | 38 | 13% (38) | - (0) * | - (0) * | 89% (38) | 89% (38) | 24% (38) | 605 | 24% (605) | - (0) * | - (0) * | 81% (605) | 88% (605) | 14% (605) |
| 1200-1600 | 49 | 18% (49) | - (0) * | - (0) * | 98% (49) | 84% (49) | 16% (49) | 836 | 27% (836) | - (0) * | - (0) * | 87% (836) | 86% (836) | 12% (836) |
| 1600-2000 | 54 | 6% (54) | - (0) * | - (0) * | 93% (54) | 80% (54) | 19% (54) | 1059 | 40% (1059) | - (0) * | - (0) * | 67% (1059) | 79% (1059) | 12% (1059) |
| 2000-2500 | 64 | 8% (64) | - (0) * | - (0) * | 98% (64) | 89% (64) | 13% (64) | 1232 | 29% (1232) | - (0) * | - (0) * | 60% (1232) | 78% (1232) | 9% (1232) |

**Trigger table, turns 2+: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 1105 | 1% (939) | 10% (39) | 3% (127) | 12% (830) | 86% (1105) | 27% (1105) | 19057 | 1% (15994) | 7% (888) | 3% (2175) | 10% (14034) | 81% (19057) | 28% (19057) |
| 800-1200 | 2236 | 3% (1858) | 11% (275) | 4% (103) | 15% (1828) | 86% (2236) | 17% (2236) | 32370 | 2% (26423) | 8% (4159) | 4% (1788) | 17% (25386) | 79% (32370) | 18% (32370) |
| 1200-1600 | 2421 | 3% (1913) | 9% (422) | 8% (86) | 18% (2114) | 84% (2421) | 12% (2421) | 36137 | 3% (27514) | 8% (6911) | 3% (1712) | 22% (31101) | 74% (36137) | 14% (36137) |
| 1600-2000 | 1988 | 3% (1581) | 8% (314) | 6% (93) | 18% (1728) | 74% (1988) | 9% (1988) | 34824 | 4% (28351) | 7% (4962) | 4% (1511) | 17% (31487) | 64% (34824) | 10% (34824) |
| 2000-2500 | 2189 | 2% (1801) | 4% (280) | 3% (108) | 17% (1879) | 53% (2189) | 7% (2189) | 42615 | 1% (35751) | 3% (5359) | 3% (1505) | 10% (39267) | 51% (42615) | 7% (42615) |

## 2. How its catches were made: SoloLeveling

**Catches by the team (columns: team / team new / catches by other seats / catches in its wins / in its non-wins)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| catches | 349 | 254 | 6552 | 152 | 197 |
| prey held by a net | 35% (349) | 36% (254) | 32% (6552) | 30% (152) | 39% (197) |
| prey held: net of the catching team | 88% (122) | 87% (92) | 92% (2118) | 85% (46) | 89% (76) |
| prey held: net of the third team | 12% (122) | 13% (92) | 8% (2118) | 15% (46) | 11% (76) |
| prey held: netted by the catching unit itself | 81% (107) | 80% (80) | 85% (1949) | 82% (39) | 81% (68) |
| turns from net to catch = 1 | 55% (122) | 51% (92) | 49% (2118) | 48% (46) | 59% (76) |
| turns from net to catch = 2 | 27% (122) | 29% (92) | 30% (2118) | 30% (46) | 25% (76) |
| turns from net to catch = 3 | 9% (122) | 9% (92) | 13% (2118) | 9% (46) | 9% (76) |
| turns from net to catch = 4 | 9% (122) | 11% (92) | 9% (2118) | 13% (46) | 7% (76) |
| catcher dashed | 41% (349) | 44% (254) | 39% (6552) | 39% (152) | 42% (197) |
| catcher dashed, prey held | 40% (122) | 47% (92) | 44% (2118) | 43% (46) | 38% (76) |
| catcher dashed, prey free | 41% (227) | 43% (162) | 37% (4434) | 37% (106) | 45% (121) |
| free prey: its dash was available and unused | 81% (227) | 80% (162) | 79% (4434) | 82% (106) | 81% (121) |
| free prey: dashed this turn | 12% (227) | 14% (162) | 12% (4434) | 10% (106) | 13% (121) |
| free prey: dash on cooldown | 7% (227) | 6% (162) | 9% (4434) | 8% (106) | 6% (121) |
| free prey: moving toward the catcher | 40% (227) | 40% (162) | 46% (4434) | 44% (106) | 36% (121) |
| free prey: was chasing its own prey | 7% (227) | 7% (162) | 6% (4434) | 5% (106) | 8% (121) |
| start distance catcher-prey (q25 / median / q75) | 578 / 790 / 1088 (348) | 584 / 793 / 1088 (254) | 573 / 811 / 1117 (6492) | 596 / 795 / 1088 (151) | 550 / 780 / 1088 (197) |
| units of the team within 1800 of the prey: 1 | 66% (349) | 67% (254) | 70% (6552) | 64% (152) | 68% (197) |
| units within 1800: 2 | 26% (349) | 26% (254) | 27% (6552) | 27% (152) | 25% (197) |
| units within 1800: 3 or more | 8% (349) | 7% (254) | 3% (6552) | 9% (152) | 7% (197) |
| units within 1800 (mean) | 1.40 (349) | 1.38 (254) | 1.31 (6552) | 1.44 (152) | 1.36 (197) |
| prey at the wall (radius > 6500) | 21% (349) | 20% (254) | 20% (6552) | 23% (152) | 20% (197) |
| prey distance from the wall (q25 / median / q75) | 1799 / 3427 / 5250 (349) | 1906 / 3447 / 5231 (254) | 1917 / 3556 / 5187 (6552) | 1654 / 3335 / 5267 (152) | 1972 / 3450 / 5238 (197) |
| prey within 2500 of the centre | 21% (349) | 22% (254) | 21% (6552) | 20% (152) | 22% (197) |
| turn of the catch (q25 / median / q75) | 6 / 21 / 48 (349) | 6 / 15 / 46 (254) | 10 / 26 / 51 (6552) | 6 / 22 / 48 (152) | 6 / 20 / 50 (197) |
| catch by turn 10 | 38% (349) | 43% (254) | 26% (6552) | 36% (152) | 39% (197) |
| catch on turns 11-30 | 24% (349) | 22% (254) | 30% (6552) | 26% (152) | 23% (197) |
| catch after turn 60 | 18% (349) | 15% (254) | 18% (6552) | 16% (152) | 19% (197) |
| prey inside smoke of its own team | 21% (349) | 21% (254) | 23% (6552) | 20% (152) | 21% (197) |
| prey had a team-mate within 1500 | 11% (349) | 11% (254) | 14% (6552) | 11% (152) | 11% (197) |

**Net hits of the team on prey: conversion (caught within 5 turns)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| net hits on prey | 191 | 144 | 3087 | 59 | 132 |
| converted | 66% (191) | 67% (144) | 67% (3087) | 81% (59) | 59% (132) |
| a free hunter within 1200 after the net | 63% (191) | 56% (144) | 57% (3087) | 71% (59) | 59% (132) |
| a free hunter within 1800 | 82% (191) | 81% (144) | 81% (3087) | 90% (59) | 79% (132) |
| converted when a hunter within 1800 | 71% (157) | 72% (116) | 74% (2499) | 81% (53) | 66% (104) |
| converted when no hunter within 1800 | 41% (34) | 50% (28) * | 38% (588) | 83% (6) * | 32% (28) * |
| distance of the nearest free hunter (q25 / median / q75) | 572 / 899 / 1521 (190) | 689 / 1065 / 1592 (144) | 662 / 1043 / 1554 (3055) | 595 / 844 / 1313 (59) | 564 / 923 / 1592 (131) |
| target was already held (re-net) | 9% (191) | 12% (144) | 6% (3087) | 8% (59) | 9% (132) |

## 3. How its units were lost: SoloLeveling

**Units lost by the team (other seats: units lost by them)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| units lost | 357 | 269 | 6537 | 93 | 264 |
| held by a net | 29% (357) | 26% (269) | 33% (6537) | 23% (93) | 31% (264) |
| held: net of the predator team | 92% (104) | 90% (69) | 92% (2141) | 100% (21) * | 90% (83) |
| held: net of the third team (its own prey) | 8% (104) | 10% (69) | 8% (2141) | 0% (21) * | 10% (83) |
| held: net of its own team | 0% (104) | 0% (69) | 0% (2141) | 0% (21) * | 0% (83) |
| turn (q25 / median / q75) | 12 / 28 / 50 (357) | 13 / 29 / 50 (269) | 10 / 25 / 50 (6537) | 18 / 45 / 68 (93) | 11 / 25 / 45 (264) |
| by turn 10 | 21% (357) | 20% (269) | 27% (6537) | 16% (93) | 23% (264) |
| turns 11-30 | 33% (357) | 32% (269) | 30% (6537) | 25% (93) | 36% (264) |
| after turn 60 | 18% (357) | 18% (269) | 18% (6537) | 30% (93) | 14% (264) |
| at the wall (radius > 6500) | 18% (357) | 19% (269) | 20% (6537) | 25% (93) | 16% (264) |
| within 2500 of the centre | 15% (357) | 13% (269) | 21% (6537) | 10% (93) | 17% (264) |
| the unit dashed on that turn | 12% (357) | 14% (269) | 8% (6537) | 11% (93) | 13% (264) |
| free unit: dashed on that turn | 17% (253) | 20% (200) | 12% (4396) | 14% (72) | 18% (181) |
| free unit: dash available, not used | 72% (253) | 70% (200) | 79% (4396) | 71% (72) | 72% (181) |
| free unit: dash on cooldown | 11% (253) | 11% (200) | 9% (4396) | 15% (72) | 9% (181) |
| free unit: moving toward the catcher | 49% (253) | 49% (200) | 45% (4396) | 47% (72) | 50% (181) |
| free unit: was chasing its own prey | 6% (253) | 6% (200) | 6% (4396) | 6% (72) | 6% (181) |
| three or more dashes already spent | 79% (357) | 86% (269) | 59% (6537) | 88% (93) | 76% (264) |
| team used smoke in the 3 turns before | 23% (357) | 30% (269) | 24% (6537) | 17% (93) | 25% (264) |
| team used a decoy in the 3 turns before | 28% (357) | 28% (269) | 23% (6537) | 25% (93) | 29% (264) |
| team used smoke or decoy in the 3 turns before | 36% (357) | 40% (269) | 40% (6537) | 32% (93) | 38% (264) |
| inside a cloud of its own team (centre within 1900, last 9 turns) | 20% (357) | 27% (269) | 23% (6537) | 18% (93) | 21% (264) |
| the unit itself sent a decoy in the 3 turns before | 15% (357) | 15% (269) | 15% (6537) | 16% (93) | 15% (264) |
| team netted the catcher in the 3 turns before | 1% (357) | 0% (269) | 1% (6537) | 0% (93) | 1% (264) |
| catcher dashed | 41% (357) | 40% (269) | 40% (6537) | 45% (93) | 40% (264) |
| 2 or more hunters within 1800 | 33% (357) | 32% (269) | 30% (6537) | 35% (93) | 33% (264) |
| a team-mate within 1500 | 12% (357) | 9% (269) | 15% (6537) | 13% (93) | 11% (264) |

**Own units netted by the predator: what the team did in the next 3 turns**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| own units netted by the predator | 149 | 101 | 3130 | 39 | 110 |
| caught within 5 turns | 69% (149) | 66% (101) | 67% (3130) | 54% (39) | 75% (110) |
| smoke within 1900 of the unit | 30% (149) | 44% (101) | 29% (3130) | 31% (39) | 29% (110) |
| net on a unit of the predator team | 15% (149) | 17% (101) | 26% (3130) | 21% (39) | 14% (110) |
| the held unit sent a decoy | 17% (149) | 13% (101) | 21% (3130) | 13% (39) | 18% (110) |
| caught, with smoke | 41% (44) | 41% (44) | 51% (911) | 17% (12) * | 50% (32) |
| caught, without smoke | 81% (105) | 86% (57) | 74% (2219) | 70% (27) * | 85% (78) |
| caught, with a counter-net | 22% (23) * | 24% (17) * | 41% (826) | 13% (8) * | 27% (15) * |
| caught, without a counter-net | 78% (126) | 75% (84) | 76% (2304) | 65% (31) | 82% (95) |
| a free hunter within 1800 at the net | 87% (149) | 84% (101) | 81% (3130) | 85% (39) | 88% (110) |

## 4. Ghosts: SoloLeveling

**Ghost-turns (unit caught earlier, team still has living units)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| ghost-turns with an order | 100% (18680) | 100% (14228) | 96% (353653) | 100% (5242) | 100% (13438) |
| moving (order further than 60) | 96% (9109) | 96% (6998) | 89% (166440) | 96% (2556) | 96% (6553) |
| dashing | 0% (18680) | 0% (14228) | 0% (353653) | 0% (5242) | 0% (13438) |
| order aimed within 1000 of a living prey | 15% (8756) | 4% (6691) | 28% (148761) | 10% (2461) | 17% (6295) |
| order aimed within 1000 of a living predator | 7% (8756) | 8% (6691) | 12% (148761) | 8% (2461) | 6% (6295) |
| order aimed within 1000 of a living team-mate | 1% (8756) | 1% (6691) | 3% (148761) | 1% (2461) | 1% (6295) |
| order aimed at none of these | 77% (8756) | 87% (6691) | 57% (148761) | 80% (2461) | 75% (6295) |
| aimed at prey: that prey is held by a net | 3% (1342) | 1% (271) | 4% (41297) | 5% (257) | 3% (1085) |
| aimed at prey: a living hunter of ours within 2500 of it | 55% (1342) | 51% (271) | 51% (41297) | 74% (257) | 51% (1085) |
| aimed at predator: a living team-mate within 2500 of it | 47% (591) | 50% (528) | 36% (17703) | 53% (209) | 44% (382) |
| moving toward the nearest living prey | 41% (8756) | 36% (6691) | 47% (148761) | 33% (2461) | 44% (6295) |
| moving toward the nearest living predator | 31% (8756) | 30% (6691) | 36% (148761) | 35% (2461) | 30% (6295) |
| position within 2000 of a living prey | 24% (9109) | 19% (6998) | 34% (166440) | 15% (2556) | 27% (6553) |
| position within 2000 of a living predator | 39% (9109) | 39% (6998) | 38% (166440) | 45% (2556) | 37% (6553) |
| position within 2000 of a living team-mate | 23% (9109) | 21% (6998) | 24% (166440) | 22% (2556) | 24% (6553) |
| position within 2000 of nobody | 36% (9109) | 40% (6998) | 33% (166440) | 36% (2556) | 36% (6553) |
| median distance to the nearest living prey | 3375 (8426) | 3625 (6542) | 2625 (152037) | 3875 (1952) | 3375 (6474) |
| median distance to the nearest living predator | 2375 (8957) | 2375 (6876) | 2625 (162446) | 2125 (2512) | 2375 (6445) |

## 5. Three units against six: SoloLeveling

| | team, 3 units | team, 4 units | team, 5 units | team, 6 units | others, 3 units | others, 4 units | others, 5 units | others, 6 units |
|---|---|---|---|---|---|---|---|---|
| games | 31 | 39 | 21 | 30 | 549 | 565 | 572 | 530 |
| wins | 16% (31) | 41% (39) | 29% (21) * | 33% (30) | 34% (549) | 33% (565) | 33% (572) | 34% (530) |
| last place | 32% (31) | 33% (39) | 14% (21) * | 27% (30) | 34% (549) | 33% (565) | 34% (572) | 34% (530) |
| mean rank | 2.16 (31) | 1.92 (39) | 1.86 (21) * | 1.93 (30) | 2.00 (549) | 2.01 (565) | 2.01 (572) | 2.00 (530) |
| catches per game | 1.58 (31) | 2.62 (39) | 3.38 (21) * | 4.23 (30) | 1.75 (549) | 2.57 (565) | 3.37 (572) | 4.18 (530) |
| catches per unit of the prey team | 0.53 (31) | 0.65 (39) | 0.68 (21) * | 0.71 (30) | 0.58 (549) | 0.64 (565) | 0.67 (572) | 0.70 (530) |
| units lost per game | 1.81 (31) | 2.51 (39) | 3.76 (21) * | 4.13 (30) | 1.73 (549) | 2.57 (565) | 3.37 (572) | 4.16 (530) |
| share of own units lost | 0.60 (31) | 0.63 (39) | 0.75 (21) * | 0.69 (30) | 0.58 (549) | 0.64 (565) | 0.67 (572) | 0.69 (530) |
| catches by turn 10 | 0.52 (31) | 0.95 (39) | 1.57 (21) * | 1.50 (30) | 0.36 (549) | 0.62 (565) | 0.88 (572) | 1.21 (530) |
| units lost by turn 10 | 0.32 (31) | 0.41 (39) | 0.71 (21) * | 1.17 (30) | 0.38 (549) | 0.66 (565) | 0.91 (572) | 1.22 (530) |
| first catch turn (median) | 10 (29) * | 6 (37) | 4 (20) * | 4 (30) | 17 (478) | 10 (541) | 7 (559) | 6 (520) |
| made the first catch of the game | 39% (31) | 46% (39) | 48% (21) * | 40% (30) | 33% (549) | 33% (565) | 33% (572) | 33% (530) |
| nets per game | 2.52 (31) | 4.00 (39) | 4.67 (21) * | 6.23 (30) | 2.54 (549) | 3.75 (565) | 4.89 (572) | 5.85 (530) |
| nets in turns 1-3 | 0.84 (31) | 1.51 (39) | 2.24 (21) * | 2.80 (30) | 0.72 (549) | 1.24 (565) | 1.76 (572) | 2.24 (530) |
| smoke per game | 1.77 (31) | 2.77 (39) | 3.52 (21) * | 4.10 (30) | 1.89 (549) | 2.59 (565) | 3.43 (572) | 4.14 (530) |
| smoke in turns 1-5 | 0.55 (31) | 1.15 (39) | 1.76 (21) * | 1.73 (30) | 0.38 (549) | 0.57 (565) | 0.84 (572) | 1.08 (530) |
| decoys per game | 2.65 (31) | 3.97 (39) | 4.81 (21) * | 6.40 (30) | 2.32 (549) | 3.32 (565) | 4.56 (572) | 5.25 (530) |
| decoys in turns 1-5 | 1.19 (31) | 1.54 (39) | 2.10 (21) * | 2.30 (30) | 0.71 (549) | 1.14 (565) | 1.77 (572) | 2.13 (530) |
| dashes per unit, whole game | 7.37 (31) | 7.87 (39) | 7.27 (21) * | 6.81 (30) | 4.67 (549) | 4.75 (565) | 4.74 (572) | 4.60 (530) |
| turn 1: units dashing | 81% (93) | 98% (156) | 94% (105) | 92% (180) | 51% (1512) | 57% (2104) | 57% (2752) | 65% (3102) |
| turn 1: toward nearest prey | 72% (93) | 69% (156) | 71% (105) | 73% (180) | 76% (1512) | 73% (2104) | 71% (2752) | 71% (3102) |
| turn 1: away from nearest predator | 25% (93) | 34% (156) | 31% (105) | 40% (180) | 27% (1512) | 32% (2104) | 33% (2752) | 35% (3102) |
| net hits prey | 31% (78) | 40% (156) | 36% (98) | 37% (187) | 32% (1392) | 34% (2121) | 32% (2796) | 33% (3100) |
| nets aimed at predators | 14% (78) | 16% (156) | 26% (98) | 27% (187) | 30% (1392) | 27% (2121) | 28% (2796) | 30% (3100) |
| catches: prey held by a net | 35% (49) | 38% (102) | 38% (71) | 31% (127) | 33% (960) | 35% (1450) | 31% (1929) | 32% (2213) |
| catches: catcher dashed | 43% (49) | 38% (102) | 45% (71) | 39% (127) | 41% (960) | 40% (1450) | 39% (1929) | 39% (2213) |
| losses: held by a net | 27% (56) | 28% (98) | 23% (79) | 35% (124) | 34% (952) | 35% (1453) | 32% (1926) | 32% (2206) |
| tie on catches for first place | 19% (31) | 18% (39) | 10% (21) * | 17% (30) | 21% (549) | 25% (565) | 23% (572) | 18% (530) |

## 6. Ahead, level, behind on catches: SoloLeveling

State at the start of the turn: own catches against the better of the two other teams. Left block: the team (all games). Right block: other seats of the new folder.

**turns 6-30**

| | team ahead | team level | team behind | others ahead | others level | others behind |
|---|---|---|---|---|---|---|
| unit-turns | 3617 | 3312 | 3444 | 44741 | 56428 | 85978 |
| dash when available | 21% (2855) | 23% (2547) | 20% (2735) | 9% (38955) | 11% (48171) | 12% (73387) |
| nets per 100 unit-turns | 1.1 (3617) | 2.7 (3312) | 2.2 (3444) | 1.7 (44741) | 2.2 (56428) | 2.4 (85978) |
| net when prey within 2000 | 3% (646) | 7% (811) | 4% (1135) | 5% (7971) | 6% (13444) | 5% (25089) |
| smoke per 100 | 1.3 (3617) | 2.0 (3312) | 1.2 (3444) | 1.7 (44741) | 1.5 (56428) | 1.3 (85978) |
| decoys per 100 | 2.2 (3617) | 2.6 (3312) | 2.4 (3444) | 1.9 (44741) | 2.0 (56428) | 1.7 (85978) |
| median distance to nearest predator | 3625 (3617) | 3875 (3312) | 3625 (3417) | 3125 (43552) | 3125 (54136) | 3375 (81644) |
| predator within 1800 | 15% (3617) | 15% (3312) | 16% (3417) | 24% (43552) | 21% (54136) | 19% (81644) |
| median distance to nearest prey | 4125 (3539) | 3375 (3297) | 2875 (3444) | 3875 (42036) | 3375 (54168) | 2875 (83377) |
| prey within 3000: moving toward it | 67% (1047) | 64% (1252) | 63% (1736) | 57% (13744) | 58% (21859) | 58% (40130) |
| prey within 3000: dash | 24% (846) | 26% (1011) | 21% (1447) | 15% (11961) | 17% (18885) | 17% (34789) |
| predator within 3000: moving away | 41% (1291) | 40% (1080) | 43% (1291) | 48% (19623) | 46% (22335) | 46% (31081) |
| predator within 3000: moving toward it | 22% (1291) | 24% (1080) | 22% (1291) | 19% (19623) | 19% (22335) | 19% (31081) |
| predator within 3000: dash | 23% (1043) | 25% (878) | 20% (1084) | 14% (17223) | 17% (19336) | 16% (26938) |
| standing still | 1% (3476) | 1% (3100) | 1% (3248) | 6% (42882) | 5% (53520) | 5% (81542) |

**turns 31-100**

| | team ahead | team level | team behind | others ahead | others level | others behind |
|---|---|---|---|---|---|---|
| unit-turns | 5992 | 3783 | 6917 | 97817 | 66661 | 147526 |
| dash when available | 7% (5532) | 9% (3434) | 8% (6350) | 5% (92371) | 6% (62329) | 7% (137326) |
| nets per 100 unit-turns | 0.2 (5992) | 0.1 (3783) | 0.2 (6917) | 0.2 (97817) | 0.4 (66661) | 0.4 (147526) |
| net when prey within 2000 | 0% (904) | 0% (1173) | 0% (2836) | 1% (9333) | 1% (14081) | 1% (47804) |
| smoke per 100 | 0.4 (5992) | 0.3 (3783) | 0.3 (6917) | 0.9 (97817) | 0.8 (66661) | 0.6 (147526) |
| decoys per 100 | 0.5 (5992) | 0.5 (3783) | 0.3 (6917) | 0.6 (97817) | 0.8 (66661) | 0.5 (147526) |
| median distance to nearest predator | 2875 (5302) | 3125 (3561) | 3125 (4854) | 2875 (77740) | 3125 (55709) | 3625 (97966) |
| predator within 1800 | 30% (5302) | 25% (3561) | 23% (4854) | 32% (77740) | 25% (55709) | 20% (97966) |
| median distance to nearest prey | 4375 (4173) | 3125 (3498) | 2375 (6388) | 4375 (53440) | 3375 (54640) | 2625 (124430) |
| prey within 3000: moving toward it | 74% (1331) | 74% (1672) | 78% (3854) | 63% (16656) | 67% (22997) | 73% (69955) |
| prey within 3000: dash | 9% (1207) | 10% (1514) | 10% (3522) | 11% (15081) | 11% (20806) | 11% (63330) |
| predator within 3000: moving away | 63% (2725) | 55% (1716) | 58% (2261) | 62% (39428) | 56% (25389) | 55% (38738) |
| predator within 3000: moving toward it | 11% (2725) | 18% (1716) | 13% (2261) | 11% (39428) | 14% (25389) | 15% (38738) |
| predator within 3000: dash | 10% (2466) | 10% (1552) | 11% (2039) | 11% (35642) | 11% (22946) | 11% (35005) |
| standing still | 1% (5940) | 1% (3738) | 1% (6872) | 10% (97285) | 6% (66155) | 5% (146341) |

## 7. Games it did not win: SoloLeveling

Non-wins: 84 of 121 (second 50, last 34). Winner was its **prey team** in 37 (44%), its **predator team** in 47 (56%). Other seats of the new folder: prey team won 50% of their non-wins.

First thing that went wrong in the non-wins (exclusive, in this order): lost a unit by turn 10: 48 (57%); no catch by turn 20: 13 (15%); level on catches with the winner, lost the tie-break: 4 (5%); fewer catches than the winner, none of the above: 19 (23%).

**The same events in wins and in non-wins**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| games | 121 | 88 | 2216 | 37 | 84 |
| lost a unit by turn 10 | 50% (121) | 48% (88) | 56% (2216) | 32% (37) | 57% (84) |
| lost a unit by turn 20 | 73% (121) | 69% (88) | 73% (2216) | 59% (37) | 79% (84) |
| no catch by turn 10 | 29% (121) | 22% (88) | 45% (2216) | 8% (37) | 38% (84) |
| no catch by turn 20 | 21% (121) | 15% (88) | 28% (2216) | 3% (37) | 29% (84) |
| made the first catch of the game | 43% (121) | 48% (88) | 33% (2216) | 62% (37) | 35% (84) |
| its first event: lost a unit before any catch | 33% (121) | 27% (88) | 45% (2216) | 11% (37) | 43% (84) |
| its first event: caught before losing | 63% (121) | 67% (88) | 50% (2216) | 86% (37) | 52% (84) |
| level on catches for first place | 17% (121) | 18% (88) | 22% (2216) | 22% (37) | 14% (84) |
| level on catches for first place: won the tie-break | 40% (20) * | 50% (16) * | 48% (483) | 100% (8) * | 0% (12) * |
| eliminated (all units lost) | 26% (121) | 24% (88) | 25% (2216) | 3% (37) | 36% (84) |
| catches | 2.88 (121) | 2.89 (88) | 2.96 (2216) | 4.11 (37) | 2.35 (84) |
| units lost | 2.95 (121) | 3.06 (88) | 2.95 (2216) | 2.51 (37) | 3.14 (84) |
| catches by turn 10 | 1.08 (121) | 1.23 (88) | 0.76 (2216) | 1.46 (37) | 0.92 (84) |
| catches by turn 20 | 1.42 (121) | 1.55 (88) | 1.28 (2216) | 1.97 (37) | 1.18 (84) |
| units lost by turn 10 | 0.63 (121) | 0.61 (88) | 0.79 (2216) | 0.41 (37) | 0.73 (84) |
| first catch turn (median) | 6 (116) | 5 (85) | 8 (2098) | 5 (37) | 7 (79) |
| first loss turn (median) | 10 (117) | 12 (86) | 8 (2097) | 18 (36) | 8 (81) |
| catches of its predator team | 2.95 (121) | 3.06 (88) | 2.95 (2216) | 2.51 (37) | 3.14 (84) |
| catches of its prey team | 2.64 (121) | 2.51 (88) | 2.97 (2216) | 2.22 (37) | 2.82 (84) |
| nets in turns 1-3 | 1.79 (121) | 1.97 (88) | 1.48 (2216) | 1.54 (37) | 1.89 (84) |
| nets whole game | 4.29 (121) | 4.23 (88) | 4.25 (2216) | 4.65 (37) | 4.13 (84) |
| smoke whole game | 2.98 (121) | 4.09 (88) | 3.01 (2216) | 2.76 (37) | 3.07 (84) |
| decoys whole game | 4.38 (121) | 4.11 (88) | 3.85 (2216) | 4.54 (37) | 4.31 (84) |
| dashes on turn 1 | 4.07 (121) | 4.35 (88) | 2.50 (2216) | 4.24 (37) | 4.00 (84) |
| dashes whole game per unit | 7.37 (121) | 8.14 (88) | 4.69 (2216) | 8.32 (37) | 6.95 (84) |
| seat 0 | 30% (121) | 31% (88) | 33% (2216) | 27% (37) | 31% (84) |
| seat 1 | 32% (121) | 31% (88) | 33% (2216) | 22% (37) | 37% (84) |
| seat 2 | 38% (121) | 39% (88) | 33% (2216) | 51% (37) | 32% (84) |
| units per team (mean) | 4.41 (121) | 4.44 (88) | 4.49 (2216) | 4.57 (37) | 4.35 (84) |

**Win rate with and without each event**

| Event | team win % with it | team win % without it | others with it | others without it |
|---|---|---|---|---|
| lost a unit by turn 10 | 20% (60) | 41% (61) | 25% (1238) | 45% (978) |
| lost a unit by turn 20 | 25% (88) | 45% (33) | 27% (1619) | 52% (597) |
| a catch by turn 10 | 40% (86) | 9% (35) | 43% (1211) | 22% (1005) |
| a catch by turn 20 | 38% (96) | 4% (25) * | 40% (1605) | 16% (611) |
| made the first catch of the game | 44% (52) | 20% (69) | 52% (726) | 24% (1490) |
| lost a unit before any catch | 10% (40) | 41% (81) | 16% (1001) | 48% (1215) |
| level on catches for first place | 40% (20) * | 29% (101) | 48% (483) | 29% (1733) |
| seat 0 | 28% (36) | 32% (85) | 35% (741) | 33% (1475) |
| seat 1 | 21% (39) | 35% (82) | 31% (741) | 35% (1475) |
| seat 2 | 41% (46) | 24% (75) | 34% (734) | 33% (1482) |
| 3 units | 16% (31) | 36% (90) | 34% (549) | 33% (1667) |
| 4 units | 41% (39) | 26% (82) | 33% (565) | 34% (1651) |
| 5 units | 29% (21) * | 31% (100) | 33% (572) | 33% (1644) |
| 6 units | 33% (30) | 30% (91) | 34% (530) | 33% (1686) |

**By the team that hunts it** (6 games or more)

| Opponent | games | team wins | opponent wins | team catches | team units lost |
|---|---|---|---|---|---|
| FullStuck | 10 * | 30% | 40% | 3.50 | 3.30 |
| Commit Happens | 9 * | 33% | 22% | 3.56 | 2.78 |
| Kogaion | 7 * | 14% | 71% | 3.00 | 4.00 |
| ATA | 6 * | 0% | 50% | 1.67 | 2.33 |
| Les Gens Bons | 6 * | 33% | 50% | 2.83 | 2.83 |
| Dragons Fight Club | 6 * | 17% | 67% | 3.50 | 3.83 |

**By the team it hunts** (6 games or more)

| Opponent | games | team wins | opponent wins | team catches | team units lost |
|---|---|---|---|---|---|
| Agave | 11 * | 0% | 64% | 2.36 | 2.64 |
| Kogaion | 10 * | 50% | 40% | 3.50 | 2.30 |
| Dragons Fight Club | 9 * | 11% | 33% | 1.89 | 2.78 |
| RNG | 8 * | 13% | 13% | 2.38 | 4.38 |
| Les Gens Bons | 6 * | 17% | 33% | 3.00 | 2.67 |

## 8. Other observations: SoloLeveling

**Living unit-turns, whole game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| unit-turns | 29670 | 21560 | 547608 | 11614 | 18056 |
| held by a net | 3% (29670) | 3% (21560) | 3% (547608) | 2% (11614) | 3% (18056) |
| dash when available | 16% (24989) | 18% (17847) | 10% (487247) | 14% (9995) | 17% (14994) |
| standing still (free units) | 1% (28786) | 1% (20885) | 6% (532369) | 1% (11358) | 1% (17428) |
| predator within 1800 | 22% (26652) | 20% (19451) | 24% (455168) | 23% (10743) | 21% (15909) |
| predator within 1200 | 10% (26652) | 10% (19451) | 12% (455168) | 11% (10743) | 10% (15909) |
| median distance to nearest predator | 3125 (26652) | 3625 (19451) | 3125 (455168) | 3125 (10743) | 3375 (15909) |
| median distance to nearest prey | 3125 (26890) | 3125 (20169) | 3125 (456537) | 3625 (9631) | 2875 (17259) |
| prey within 2000 | 31% (26890) | 32% (20169) | 29% (456537) | 28% (9631) | 33% (17259) |
| net when prey within 2000 | 4% (8433) | 4% (6499) | 4% (132997) | 4% (2742) | 4% (5691) |
| predator within 3000: away | 52% (11635) | 48% (7667) | 52% (198441) | 56% (5000) | 50% (6635) |
| predator within 3000: toward | 17% (11635) | 19% (7667) | 15% (198441) | 15% (5000) | 18% (6635) |
| predator within 3000: sideways | 30% (11635) | 33% (7667) | 30% (198441) | 29% (5000) | 32% (6635) |
| predator within 3000: dash when available | 18% (9875) | 20% (6418) | 16% (172994) | 16% (4317) | 20% (5558) |
| predator within 3000: smoke | 3% (11635) | 4% (7667) | 3% (198441) | 2% (5000) | 3% (6635) |
| predator within 3000: decoy | 4% (11635) | 5% (7667) | 4% (198441) | 3% (5000) | 5% (6635) |
| predator within 3000: net | 2% (11635) | 2% (7667) | 2% (198441) | 2% (5000) | 2% (6635) |
| prey within 3000: toward | 71% (12212) | 74% (9028) | 65% (208184) | 75% (3962) | 70% (8250) |
| prey within 3000: away | 12% (12212) | 11% (9028) | 14% (208184) | 10% (3962) | 13% (8250) |
| prey within 3000: dash when available | 18% (10368) | 20% (7571) | 16% (181232) | 18% (3373) | 19% (6995) |
| DASH orders that were not executed (cooldown) | 0% (3909) | 0% (3124) | 0% (46690) | 0% (1388) | 0% (2521) |
| dashes: fleeing (predator within 2000, moving away) | 16% (3901) | 11% (3124) | 25% (46623) | 19% (1388) | 15% (2513) |
| dashes: attacking (prey within 2500, moving toward) | 29% (3901) | 28% (3124) | 40% (46623) | 26% (1388) | 30% (2513) |
| dashes: travelling (neither) | 55% (3901) | 61% (3124) | 35% (46623) | 55% (1388) | 55% (2513) |

**Nets aimed at units of this team (by anyone)**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets aimed at its units | 490 | 339 | 8781 | 154 | 336 |
| hit the unit | 58% (490) | 62% (339) | 58% (8781) | 50% (154) | 62% (336) |
| absorbed by a decoy | 13% (490) | 11% (339) | 8% (8781) | 13% (154) | 13% (336) |
| unit could dash | 69% (490) | 67% (339) | 71% (8781) | 70% (154) | 68% (336) |
| hit when the unit could dash | 52% (320) | 55% (216) | 51% (5835) | 44% (104) | 56% (216) |
| hit when its dash was on cooldown | 70% (151) | 75% (109) | 71% (2492) | 67% (45) | 72% (106) |
| the unit dashed on that turn | 32% (490) | 30% (339) | 30% (8781) | 35% (154) | 31% (336) |
| hit when it dashed that turn | 30% (158) | 33% (102) | 30% (2605) | 22% (54) | 34% (104) |
| hit when it did not dash | 72% (313) | 75% (223) | 69% (5722) | 67% (95) | 74% (218) |
| thrown by its predator team | 67% (490) | 64% (339) | 70% (8781) | 69% (154) | 65% (336) |
| thrown by turn 5 | 41% (490) | 43% (339) | 46% (8781) | 37% (154) | 43% (336) |

**Trigger table, all turns: nearest free predator at this distance**

| distance | team: unit-turns | team: smoke | team: decoy | team: net | team: dash when available | team: moving away | team: moving toward it | team: caught within 3 turns | others: unit-turns | others: smoke | others: decoy | others: net | others: dash when available | others: moving away | others: moving toward it | others: caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 1000 | 1779 | 2% (1779) | 3% (1779) | 2% (1779) | 21% (1512) | 74% (1633) | 7% (1633) | 28% (1779) | 33303 | 6% (33303) | 5% (33303) | 3% (33303) | 24% (28103) | 71% (30449) | 6% (30449) | 23% (33303) |
| 1000-1500 | 2357 | 4% (2357) | 7% (2357) | 2% (2357) | 22% (1830) | 70% (2257) | 8% (2257) | 11% (2357) | 42689 | 5% (42689) | 6% (42689) | 3% (42689) | 19% (33455) | 67% (40890) | 6% (40890) | 13% (42689) |
| 1500-2000 | 2585 | 4% (2585) | 7% (2585) | 2% (2585) | 18% (2115) | 61% (2532) | 9% (2532) | 5% (2585) | 41314 | 3% (41314) | 6% (41314) | 2% (41314) | 15% (34382) | 53% (40069) | 11% (40069) | 7% (41314) |
| 2000-2500 | 2568 | 2% (2568) | 2% (2568) | 2% (2568) | 15% (2120) | 38% (2510) | 25% (2510) | 3% (2568) | 41629 | 1% (41629) | 2% (41629) | 2% (41629) | 11% (36070) | 40% (40757) | 22% (40757) | 3% (41629) |
| 2500-3000 | 2418 | 1% (2418) | 1% (2418) | 2% (2418) | 15% (2016) | 28% (2348) | 31% (2348) | 1% (2418) | 41072 | 0% (41072) | 1% (41072) | 2% (41072) | 10% (36291) | 34% (40197) | 27% (40197) | 1% (41072) |

**Trigger table, all turns: nearest prey at this distance (unit not held)**

| distance | team: unit-turns | team: net, prey can dash | team: net, prey dash on cooldown | team: net, prey held | team: dash when available | team: moving toward it | team: prey caught within 3 turns | others: unit-turns | others: net, prey can dash | others: net, prey dash on cooldown | others: net, prey held | others: dash when available | others: moving toward it | others: prey caught within 3 turns |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| under 800 | 1121 | 2% (955) | 10% (39) | 3% (127) | 13% (846) | 86% (1121) | 27% (1121) | 19254 | 2% (16191) | 7% (888) | 3% (2175) | 11% (14231) | 81% (19254) | 28% (19254) |
| 800-1200 | 2274 | 3% (1896) | 11% (275) | 4% (103) | 17% (1866) | 86% (2274) | 17% (2274) | 32975 | 3% (27028) | 8% (4159) | 4% (1788) | 18% (25991) | 79% (32975) | 18% (32975) |
| 1200-1600 | 2470 | 4% (1962) | 9% (422) | 8% (86) | 20% (2163) | 84% (2470) | 12% (2470) | 36973 | 4% (28350) | 8% (6911) | 3% (1712) | 24% (31937) | 74% (36973) | 14% (36973) |
| 1600-2000 | 2042 | 3% (1635) | 8% (314) | 6% (93) | 20% (1782) | 74% (2042) | 9% (2042) | 35883 | 5% (29410) | 7% (4962) | 4% (1511) | 19% (32546) | 64% (35883) | 10% (35883) |
| 2000-2500 | 2253 | 2% (1865) | 4% (280) | 3% (108) | 20% (1943) | 54% (2253) | 7% (2253) | 43847 | 2% (36983) | 3% (5359) | 3% (1505) | 12% (40499) | 52% (43847) | 7% (43847) |

**All nets of the game**

| | team, all games | team, new folder | other seats, new folder | team wins | team non-wins |
|---|---|---|---|---|---|
| nets | 519 | 372 | 9409 | 172 | 347 |
| hit prey | 37% (519) | 39% (372) | 33% (9409) | 34% (172) | 38% (347) |
| hit predator | 15% (519) | 15% (372) | 22% (9409) | 16% (172) | 14% (347) |
| absorbed by a decoy | 13% (519) | 14% (372) | 11% (9409) | 11% (172) | 14% (347) |
| aimed at predators | 21% (519) | 20% (372) | 29% (9409) | 26% (172) | 19% (347) |
| no enemy near the line | 11% (519) | 9% (372) | 7% (9409) | 12% (172) | 11% (347) |
| thrown while held | 9% (519) | 11% (372) | 13% (9409) | 6% (172) | 11% (347) |
| thrown when ahead | 13% (519) | 13% (372) | 12% (9409) | 26% (172) | 7% (347) |
| thrown when behind | 23% (519) | 17% (372) | 33% (9409) | 10% (172) | 29% (347) |
| turn (q25 / median / q75) | 2 / 4 / 11 (519) | 2 / 4 / 8 (372) | 2 / 7 / 18 (9409) | 3 / 5 / 15 (172) | 2 / 4 / 10 (347) |

---

# Cross-team summary (team, all games; last column = every seat of the new folder)

| | ATI x iHot | Les Gens Bons | Lore | RNG | SoloLeveling | every seat, new folder |
|---|---|---|---|---|---|---|
| games | 47 | 311 | 64 | 206 | 121 | 2304 |
| wins | 66% (47) | 53% (311) | 44% (64) | 41% (206) | 31% (121) | 33% (2304) |
| mean rank | 1.49 (47) | 1.66 (311) | 1.81 (64) | 1.86 (206) | 1.98 (121) | 2.00 (2304) |
| catches | 3.40 (47) | 3.19 (311) | 3.33 (64) | 3.19 (206) | 2.88 (121) | 2.95 (2304) |
| units lost | 2.62 (47) | 2.68 (311) | 2.75 (64) | 2.83 (206) | 2.95 (121) | 2.95 (2304) |
| catches by 10 | 0.72 (47) | 1.01 (311) | 0.94 (64) | 0.81 (206) | 1.08 (121) | 0.78 (2304) |
| lost by 10 | 0.38 (47) | 0.75 (311) | 0.67 (64) | 0.79 (206) | 0.63 (121) | 0.78 (2304) |
| made the first catch | 51% (47) | 45% (311) | 34% (64) | 36% (206) | 43% (121) | 33% (2304) |
| level for first: won tie-break | 77% (13) * | 55% (77) | 41% (17) * | 59% (59) | 40% (20) * | 48% (499) |
| turn 1: units dashing | 69% (173) | 49% (1275) | 49% (286) | 35% (883) | 92% (534) | 60% (9861) |
| turn 1: toward prey | 76% (173) | 67% (1275) | 65% (286) | 51% (883) | 71% (534) | 72% (9861) |
| turn 1: away from predator | 34% (173) | 41% (1275) | 36% (286) | 44% (883) | 34% (534) | 32% (9861) |
| turn 1 dashers: toward prey | 73% (119) | 69% (623) | 84% (140) | 57% (305) | 73% (493) | 77% (5932) |
| games with a unit lost by turn 10 | 28% (47) | 53% (311) | 53% (64) | 60% (206) | 50% (121) | 56% (2304) |
| games with no catch by turn 20 | 17% (47) | 17% (311) | 27% (64) | 21% (206) | 21% (121) | 27% (2304) |
| nets: median turn | 42 (152) | 3 (1386) | 6 (296) | 5 (969) | 4 (519) | 7 (9781) |
| nets in turns 1-5 per game | 0.30 (47) | 2.66 (311) | 2.28 (64) | 2.49 (206) | 2.37 (121) | 1.94 (2304) |
| smoke on turn 1 per game | 0.85 (47) | 0.11 (311) | 0.00 (64) | 0.00 (206) | 0.45 (121) | 0.28 (2304) |
| catches, prey held: caught 1 turn after the net | 67% (48) | 50% (384) | 49% (78) | 46% (227) | 55% (122) | 49% (2210) |
| nets aimed at its units: hit | 51% (171) | 56% (1238) | 64% (276) | 55% (864) | 58% (490) | 58% (9120) |
| nets aimed at its units: absorbed by a decoy | 8% (171) | 12% (1238) | 1% (276) | 11% (864) | 13% (490) | 8% (9120) |
| smoke: thrower inside its own cloud | 100% (181) | 100% (856) | 100% (54) | 100% (646) | 100% (360) | 89% (7021) |
| smoke: nearest predator inside the cloud | 95% (180) | 80% (855) | 70% (54) | 98% (643) | 89% (357) | 75% (6992) |
| decoy: sideways from the unit | 96% (189) | 60% (1331) | 48% (185) | 52% (886) | 55% (530) | 51% (8899) |
| decoy: away from the predator | 41% (188) | 82% (1331) | 47% (185) | 42% (884) | 20% (530) | 39% (8865) |
| nets turns 1-3 per game | 0.23 (47) | 2.33 (311) | 1.66 (64) | 1.80 (206) | 1.79 (121) | 1.50 (2304) |
| nets per game | 3.23 (47) | 4.46 (311) | 4.63 (64) | 4.70 (206) | 4.29 (121) | 4.25 (2304) |
| smoke turns 1-5 | 1.36 (47) | 0.45 (311) | 0.00 (64) | 0.22 (206) | 1.25 (121) | 0.75 (2304) |
| smoke per game | 3.85 (47) | 2.75 (311) | 0.84 (64) | 3.14 (206) | 2.98 (121) | 3.05 (2304) |
| decoys turns 1-5 | 0.26 (47) | 2.38 (311) | 0.16 (64) | 1.20 (206) | 1.74 (121) | 1.44 (2304) |
| decoys per game | 4.02 (47) | 4.28 (311) | 2.89 (64) | 4.30 (206) | 4.38 (121) | 3.86 (2304) |
| dashes per unit | 5.04 (47) | 4.12 (311) | 4.21 (64) | 4.05 (206) | 7.37 (121) | 4.82 (2304) |
| nets: hit prey | 39% (152) | 43% (1386) | 33% (296) | 36% (969) | 37% (519) | 33% (9781) |
| nets: aimed at predators | 38% (152) | 10% (1386) | 48% (296) | 28% (969) | 21% (519) | 28% (9781) |
| nets: hit predator | 28% (152) | 8% (1386) | 43% (296) | 25% (969) | 15% (519) | 21% (9781) |
| nets: median distance to target | 1254 (148) | 1529 (1294) | 1258 (294) | 1385 (918) | 1406 (459) | 1435 (9072) |
| nets: target could dash | 57% (149) | 76% (1305) | 41% (294) | 59% (919) | 71% (460) | 71% (9120) |
| net hit on prey converted | 70% (60) | 68% (598) | 77% (97) | 63% (352) | 66% (191) | 67% (3231) |
| hunter within 1800 at the hit | 85% (60) | 84% (598) | 73% (97) | 74% (352) | 82% (191) | 81% (3231) |
| catches: prey held | 30% (160) | 39% (992) | 37% (213) | 34% (658) | 35% (349) | 32% (6806) |
| catches: catcher dashed | 31% (160) | 43% (992) | 45% (213) | 47% (658) | 41% (349) | 40% (6806) |
| catches: free prey, catcher dashed | 30% (112) | 43% (608) | 47% (135) | 40% (431) | 41% (227) | 38% (4596) |
| catches: 2+ units within 1800 | 29% (160) | 31% (992) | 31% (213) | 24% (658) | 34% (349) | 30% (6806) |
| catches: prey at the wall | 21% (160) | 20% (992) | 23% (213) | 21% (658) | 21% (349) | 20% (6806) |
| catches: median turn | 25 (160) | 24 (992) | 23 (213) | 25 (658) | 21 (349) | 25 (6806) |
| losses: held | 30% (123) | 34% (835) | 36% (176) | 30% (584) | 29% (357) | 32% (6806) |
| losses: at the wall | 16% (123) | 20% (835) | 42% (176) | 24% (584) | 18% (357) | 20% (6806) |
| losses: dashed that turn | 14% (123) | 5% (835) | 7% (176) | 5% (584) | 12% (357) | 8% (6806) |
| losses: smoke or decoy in the 3 turns before | 36% (123) | 48% (835) | 22% (176) | 46% (584) | 36% (357) | 40% (6806) |
| losses: 3+ dashes spent | 69% (123) | 50% (835) | 51% (176) | 50% (584) | 79% (357) | 60% (6806) |
| losses: chasing its own prey (free) | 10% (86) | 5% (551) | 5% (113) | 5% (408) | 6% (253) | 6% (4596) |
| losses: median turn | 33 (123) | 23 (835) | 24 (176) | 25 (584) | 28 (357) | 25 (6806) |
| own unit netted: caught within 5 | 63% (54) | 72% (388) | 57% (115) | 58% (296) | 69% (149) | 67% (3231) |
| own unit netted: smoke on it | 41% (54) | 30% (388) | 0% (115) | 23% (296) | 30% (149) | 30% (3231) |
| own unit netted: counter-net | 13% (54) | 11% (388) | 62% (115) | 39% (296) | 15% (149) | 26% (3231) |
| smoke: dropped on itself | 1% (181) | 100% (856) | 0% (54) | 2% (646) | 0% (360) | 57% (7021) |
| smoke: median predator distance | 1352 (180) | 1249 (855) | 1220 (54) | 1099 (643) | 1676 (357) | 1249 (6992) |
| smoke: thrower held | 6% (181) | 12% (856) | 0% (54) | 8% (646) | 8% (360) | 11% (7021) |
| smoke: held mate in the cloud | 1% (181) | 1% (856) | 0% (54) | 1% (646) | 1% (360) | 1% (7021) |
| decoy: median predator distance | 1489 (188) | 1310 (1331) | 914 (185) | 1661 (884) | 1594 (530) | 1454 (8865) |
| decoy: toward the predator | 26% (188) | 2% (1331) | 20% (185) | 10% (884) | 9% (530) | 14% (8865) |
| decoy: sender held | 2% (189) | 19% (1331) | 0% (185) | 6% (886) | 0% (530) | 6% (8899) |

---

# Extra comparisons (script extras.js, 2176 games)

## Smoke placement and survival (new folder, free unit with a free predator within 2000 at the start of the turn)

Outcome for the unit that had the predator close: caught within 5 / 9 turns, hit by a net within 4 turns. "No smoke" = the same situation without a smoke order (one line per unit-turn). Placement is a team habit, so team strength is mixed in: read the "other teams" block too.


**smoke turn 1 | every seat | a predator under 1000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 442 | 32% | 41% | 37% |
| smoke centred on the predator (within 1000 of it) | 40 | 18% | 28% | 25% |
| smoke dropped on itself | 45 | 9% | 20% | 7% |
| smoke elsewhere | 23 * | 17% | 26% | 9% |

**smoke turn 1 | every seat | b predator 1000-1500**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 813 | 27% | 36% | 39% |
| smoke centred on the predator (within 1000 of it) | 38 | 16% | 26% | 24% |
| smoke dropped on itself | 70 | 13% | 16% | 4% |
| smoke elsewhere | 31 | 13% | 26% | 16% |

**smoke turn 1 | every seat | c predator 1500-2000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 1153 | 22% | 29% | 34% |
| smoke centred on the predator (within 1000 of it) | 39 | 26% | 28% | 23% |
| smoke dropped on itself | 83 | 12% | 18% | 1% |
| smoke elsewhere | 59 | 14% | 25% | 19% |

**smoke turn 1 | every seat | d all under 2000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 2408 | 25% | 33% | 36% |
| smoke centred on the predator (within 1000 of it) | 117 | 20% | 27% | 24% |
| smoke dropped on itself | 198 | 12% | 18% | 4% |
| smoke elsewhere | 113 | 14% | 26% | 16% |

**smoke turn 1 | other teams | a predator under 1000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 333 | 34% | 43% | 40% |
| smoke centred on the predator (within 1000 of it) | 25 * | 20% | 28% | 32% |
| smoke dropped on itself | 45 | 9% | 20% | 7% |
| smoke elsewhere | 23 * | 17% | 26% | 9% |

**smoke turn 1 | other teams | b predator 1000-1500**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 642 | 28% | 37% | 40% |
| smoke centred on the predator (within 1000 of it) | 18 * | 22% | 44% | 33% |
| smoke dropped on itself | 70 | 13% | 16% | 4% |
| smoke elsewhere | 30 | 13% | 23% | 13% |

**smoke turn 1 | other teams | c predator 1500-2000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 902 | 22% | 30% | 35% |
| smoke centred on the predator (within 1000 of it) | 17 * | 41% | 41% | 24% |
| smoke dropped on itself | 83 | 12% | 18% | 1% |
| smoke elsewhere | 52 | 13% | 27% | 19% |

**smoke turn 1 | other teams | d all under 2000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 1877 | 26% | 35% | 37% |
| smoke centred on the predator (within 1000 of it) | 60 | 27% | 37% | 30% |
| smoke dropped on itself | 198 | 12% | 18% | 4% |
| smoke elsewhere | 105 | 14% | 26% | 15% |

**smoke turn 1 | the five teams | a predator under 1000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 109 | 28% | 35% | 28% |
| smoke centred on the predator (within 1000 of it) | 15 * | 13% | 27% | 13% |

**smoke turn 1 | the five teams | b predator 1000-1500**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 171 | 24% | 32% | 38% |
| smoke centred on the predator (within 1000 of it) | 20 * | 10% | 10% | 15% |
| smoke elsewhere | 1 * | 0% | 100% | 100% |

**smoke turn 1 | the five teams | c predator 1500-2000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 251 | 18% | 26% | 31% |
| smoke centred on the predator (within 1000 of it) | 22 * | 14% | 18% | 23% |
| smoke elsewhere | 7 * | 14% | 14% | 14% |

**smoke turn 1 | the five teams | d all under 2000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 531 | 22% | 30% | 33% |
| smoke centred on the predator (within 1000 of it) | 57 | 12% | 18% | 18% |
| smoke elsewhere | 8 * | 13% | 25% | 25% |

**smoke | every seat | a predator under 1000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 29734 | 29% | 37% | 4% |
| smoke centred on the predator (within 1000 of it) | 524 | 26% | 31% | 8% |
| smoke dropped on itself | 1220 | 20% | 24% | 3% |
| smoke elsewhere | 174 | 22% | 28% | 5% |

**smoke | every seat | b predator 1000-1500**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 40431 | 20% | 27% | 6% |
| smoke centred on the predator (within 1000 of it) | 711 | 18% | 25% | 10% |
| smoke dropped on itself | 953 | 22% | 28% | 7% |
| smoke elsewhere | 248 | 21% | 27% | 12% |

**smoke | every seat | c predator 1500-2000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 40331 | 13% | 20% | 7% |
| smoke centred on the predator (within 1000 of it) | 347 | 18% | 24% | 15% |
| smoke dropped on itself | 643 | 17% | 24% | 9% |
| smoke elsewhere | 228 | 18% | 26% | 13% |

**smoke | every seat | d all under 2000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 110496 | 20% | 27% | 6% |
| smoke centred on the predator (within 1000 of it) | 1582 | 21% | 27% | 10% |
| smoke dropped on itself | 2816 | 20% | 25% | 6% |
| smoke elsewhere | 650 | 20% | 27% | 11% |

**smoke | other teams | a predator under 1000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 23637 | 29% | 37% | 4% |
| smoke centred on the predator (within 1000 of it) | 369 | 25% | 31% | 9% |
| smoke dropped on itself | 1152 | 19% | 24% | 3% |
| smoke elsewhere | 96 | 23% | 27% | 6% |

**smoke | other teams | b predator 1000-1500**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 32586 | 20% | 27% | 6% |
| smoke centred on the predator (within 1000 of it) | 468 | 20% | 27% | 9% |
| smoke dropped on itself | 824 | 21% | 27% | 7% |
| smoke elsewhere | 157 | 24% | 29% | 15% |

**smoke | other teams | c predator 1500-2000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 32098 | 13% | 20% | 7% |
| smoke centred on the predator (within 1000 of it) | 208 | 21% | 27% | 16% |
| smoke dropped on itself | 560 | 15% | 23% | 9% |
| smoke elsewhere | 194 | 19% | 28% | 14% |

**smoke | other teams | d all under 2000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 88321 | 20% | 27% | 6% |
| smoke centred on the predator (within 1000 of it) | 1045 | 22% | 28% | 11% |
| smoke dropped on itself | 2536 | 19% | 25% | 6% |
| smoke elsewhere | 447 | 22% | 28% | 13% |

**smoke | the five teams | a predator under 1000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 6097 | 29% | 36% | 5% |
| smoke centred on the predator (within 1000 of it) | 155 | 26% | 31% | 6% |
| smoke dropped on itself | 68 | 28% | 29% | 3% |
| smoke elsewhere | 78 | 22% | 28% | 4% |

**smoke | the five teams | b predator 1000-1500**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 7845 | 18% | 26% | 7% |
| smoke centred on the predator (within 1000 of it) | 243 | 16% | 22% | 11% |
| smoke dropped on itself | 129 | 28% | 33% | 7% |
| smoke elsewhere | 91 | 16% | 23% | 8% |

**smoke | the five teams | c predator 1500-2000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 8233 | 12% | 18% | 6% |
| smoke centred on the predator (within 1000 of it) | 139 | 13% | 19% | 12% |
| smoke dropped on itself | 83 | 27% | 34% | 10% |
| smoke elsewhere | 34 | 9% | 12% | 9% |

**smoke | the five teams | d all under 2000**

| What the unit did | cases | caught within 5 | caught within 9 | netted within 4 |
|---|---|---|---|---|
| no smoke | 22175 | 19% | 26% | 6% |
| smoke centred on the predator (within 1000 of it) | 537 | 18% | 24% | 10% |
| smoke dropped on itself | 280 | 28% | 33% | 7% |
| smoke elsewhere | 203 | 17% | 23% | 6% |

## Per team

| | every seat, new folder | seats of other teams, new folder | SoloLeveling | Lore | RNG | Les Gens Bons | ATI x iHot |
|---|---|---|---|---|---|---|---|
| games | 2304 | 1844 | 121 | 64 | 206 | 311 | 47 |
| net hits received per game, turns 1-5 | 0.90 | 0.90 | 0.80 | 1.20 | 1.01 | 0.95 | 0.40 |
| net hits received per game, turns 1-10 | 1.24 | 1.23 | 1.14 | 1.69 | 1.46 | 1.34 | 0.68 |
| net hits received per game, whole game | 2.31 | 2.31 | 2.36 | 2.75 | 2.29 | 2.22 | 1.85 |
| own nets in turns 1-5 that hit prey | 29% (4470) | 27% (3427) | 38% (287) | 38% (146) | 32% (513) | 40% (827) | 50% (14) |
| free unit-turns with a living team-mate within 1500 | 21% (447568) | 22% (357198) | 23% (25961) | 19% (12227) | 15% (43092) | 22% (57260) | 14% (9824) |
| free unit-turns with a living team-mate within 3000 | 44% (447568) | 47% (357198) | 44% (25961) | 38% (12227) | 35% (43092) | 44% (57260) | 34% (9824) |
| mean distance to the nearest living team-mate | 3772 | 3653 | 3845 | 4184 | 4245 | 3773 | 4115 |
| its catches: victim inside a cloud (any team, last 9 turns) | 34% (6806) | 34% (5325) | 29% (349) | 26% (213) | 32% (658) | 29% (992) | 38% (160) |
| its catches: victim inside a cloud of the catching team | 7% | 7% | 6% | 0% | 3% | 4% | 3% |
| its catches: victim inside a cloud of its own team | 23% | 23% | 21% | 21% | 23% | 21% | 29% |
| its losses: unit inside a cloud (any team) | 34% (6806) | 34% (5501) | 29% (357) | 11% (176) | 38% (584) | 40% (835) | 24% (123) |
| its losses: unit inside a cloud of the hunting team | 7% | 7% | 7% | 5% | 8% | 5% | 6% |
| its losses: unit inside a cloud of its own team | 23% | 23% | 20% | 3% | 26% | 29% | 12% |

---

# Leader in detail: opening and item geometry of ATI x iHot (script ati.js)

```
ATI x iHot games 47

TURN 1 by distance of the nearest predator start: units | dash | smoke | decoy | net | heading within 60 deg of straight away | within 60 deg of the nearest prey | order target = a prey start position (within 150)
  pred 1500-2000     22 | 86% | 59% | 0% | 0% | 64% | 68% | 9%
  pred 2000-2500     27 | 85% | 19% | 4% | 0% | 44% | 67% | 0%
  pred 2500-3500     32 | 56% | 0% | 0% | 0% | 16% | 94% | 6%
  pred<1500          27 | 100% | 81% | 7% | 0% | 74% | 37% | 0%
  pred>3500          76 | 42% | 0% | 0% | 0% | 11% | 87% | 1%
quantiles are q10 / q25 / median / q75 / q90
turn-1 order target: distance to the nearest prey start 356 / 954 / 2490 / 4159 / 5777 (n=184)
turn-1 order length 600 / 602 / 1200 / 1200 / 1201 (n=184)
turn 1, predator under 2000: angle between the move and straight away from it (deg) 8 / 24 / 41 / 62 / 86 (n=49)
turns 2+, chasing (prey within 2500, heading within 45 deg): distance order target - prey position now 199 / 354 / 612 / 1108 / 1620 (n=2178)  - prey position next turn 537 / 781 / 1096 / 1505 / 1942 (n=2161)

SMOKE by turn {"t01":40,"t09":8,"t11+":96,"t03":13,"t06":7,"t07":1,"t08":2,"t02":4,"t04":5,"t10":3,"t05":2} no predator known 1 of 181
  predator distance at the order 842 / 1035 / 1352 / 1663 / 1915 (n=180)
  throw length 1022 / 1264 / 1499 / 1771 / 1800 (n=180)
  throw length as % of the distance to the predator 55 / 63 / 66 / 72 / 81 (n=180)
  angle between the throw and the direction of the predator (deg) 2 / 4 / 8 / 17 / 27 (n=180)
  cloud centre to the predator (start of turn) 600 / 677 / 878 / 917 / 1328 (n=180)  (predator next turn) 131 / 267 / 369 / 554 / 1288 (n=179)

DECOY by turn {"t03":2,"t06":1,"t11+":167,"t02":2,"t09":3,"t10":2,"t07":2,"t04":3,"t05":2,"t01":3,"t08":2}
  predator distance at the order 969 / 1238 / 1489 / 1817 / 1995 (n=188)
  decoy target distance from the unit 2400 / 2400 / 2400 / 2400 / 2400 (n=189)
  angle decoy direction vs unit move (deg) 86 / 86 / 86 / 86 / 86 (n=189)
  angle decoy direction vs direction of the predator (deg) 27 / 60 / 105 / 143 / 163 (n=188)

NET by turn {"t11+":124,"t08":7,"t02":9,"t03":2,"t09":3,"t04":2,"t07":4,"t05":1}
  aim length 748 / 1000 / 1250 / 1632 / 1950 (n=152)
  thrower to target 758 / 1016 / 1283 / 1730 / 2027 (n=150)
  aim point to target position at the start of the turn 355 / 535 / 601 / 859 / 900 (n=150)  next turn 249 / 438 / 591 / 825 / 1160 (n=149)

DASH by turn {"t01":119,"t03":76,"t06":27,"t11+":706,"t08":15,"t05":9,"t09":18,"t02":9,"t07":13,"t10":21,"t04":12}
```

Reading: on turn 1 a unit with a predator start within 2000 dashes (86 to 100 %) and throws smoke toward that predator at about two thirds of the distance (median 66 %, at most 1800): the cloud centre lands where the predator will be after its first move (median 369 from its next position). Units with no predator within 2500 go for the nearest prey; about half of them dash. Dashes come on turns 1, 3 and 6 (as soon as the cooldown ends). Decoys: target 2400 away at 86 degrees from the unit's own move, sent when a predator is within about 2000, almost only after turn 10. Nets: almost only after turn 10, from about 1250, aimed about 600 from where the target stands (one step ahead).

---

# Order labels of Les Gens Bons and RNG (script labels.js, new folder)

Les Gens Bons prints a label with every order; the situation in which each label appears gives its meaning: G = ghost (100 % of the orders are for caught units), S = search (nearest prey 4700 away), E = escape (predator at 1700), H<n> = hunting prey unit n (prey at 1400 to 2000, 70 % heading at it), F<n> = following prey n from further away (about 3000), V = no prey known, standing still (order length 0, late in the game), * = danger nearby (predator closer, dash 20 to 30 %). RNG labels: "catch" (prey at 1200, 71 % dash) and "net".

```
label | orders | ghost | dash | held | nearest predator q25/med/q75 | nearest prey q25/med/q75 | toward prey | away from predator | order length median | turn median
RNG | (none) | 54402 | 40% | 3% | 1% | 2098/3360/5127 | 2062/3428/5476 | 49% | 36% | 600 | 46
Les Gens Bons | G | 22498 | 100% | 0% | 0% | -/-/- | -/-/- | - | - | - | 62
Les Gens Bons | S | 17569 | 0% | 1% | 2% | 2142/3642/5603 | 3116/4658/6884 | 31% | 39% | 600 | 44
Les Gens Bons | E* | 2023 | 0% | 31% | 0% | 1174/1664/2362 | 1560/2733/4337 | 53% | 50% | 600 | 12
Les Gens Bons | V | 1659 | 0% | 0% | 0% | 1515/2979/5624 | -/-/- | - | - | 0 | 82
Les Gens Bons | E | 1353 | 0% | 9% | 0% | 1112/1835/2935 | 1829/3109/4948 | 47% | 51% | 600 | 16
RNG | catch | 1044 | 0% | 71% | 0% | 2454/3486/4882 | 837/1209/1591 | 84% | 37% | 1200 | 27
Les Gens Bons | S* | 945 | 0% | 26% | 0% | 951/1533/2669 | 3138/4339/6422 | 27% | 68% | 600 | 47
RNG | net | 620 | 0% | 18% | 20% | 1104/2067/3766 | 1286/1791/2876 | 52% | 47% | 600 | 5
Les Gens Bons | H2 | 532 | 0% | 11% | 9% | 2480/4128/5614 | 1002/1444/2695 | 71% | 31% | 600 | 39
Les Gens Bons | H3 | 519 | 0% | 8% | 7% | 2126/3986/6050 | 1018/1706/3107 | 76% | 37% | 600 | 41
Les Gens Bons | H1 | 451 | 0% | 14% | 8% | 2236/3616/4957 | 1184/1936/3548 | 71% | 32% | 600 | 31
Les Gens Bons | H7 | 450 | 0% | 12% | 7% | 2042/3631/6155 | 1090/1708/3008 | 74% | 36% | 600 | 41
Les Gens Bons | H8 | 443 | 0% | 9% | 10% | 2153/3455/5262 | 1066/1800/3213 | 62% | 33% | 600 | 39
Les Gens Bons | H0 | 434 | 0% | 11% | 9% | 2283/3441/4976 | 1063/1673/3132 | 71% | 33% | 600 | 34
Les Gens Bons | H6 | 391 | 0% | 10% | 7% | 2060/3264/4820 | 1194/1799/3204 | 72% | 37% | 600 | 37
Les Gens Bons | H9 | 304 | 0% | 8% | 7% | 2035/3578/5663 | 1112/1730/3412 | 63% | 38% | 600 | 33
Les Gens Bons | H5 | 302 | 0% | 7% | 4% | 1877/3363/4732 | 1148/2060/3393 | 69% | 32% | 600 | 37
Les Gens Bons | H10 | 291 | 0% | 9% | 4% | 2166/3924/6336 | 1155/2048/4150 | 70% | 43% | 600 | 39
Les Gens Bons | F3 | 257 | 0% | 4% | 4% | 2300/4280/7339 | 1720/2894/4197 | 69% | 28% | 600 | 43
Les Gens Bons | H11 | 250 | 0% | 10% | 12% | 2879/4501/5919 | 1065/1678/3370 | 68% | 38% | 600 | 24
Les Gens Bons | H4 | 227 | 0% | 12% | 8% | 2524/3832/5191 | 988/1479/2417 | 72% | 21% | 600 | 32
Les Gens Bons | F0 | 202 | 0% | 2% | 3% | 2033/3031/5627 | 2013/2925/4123 | 77% | 30% | 600 | 42
Les Gens Bons | F2 | 190 | 0% | 4% | 6% | 1762/3517/5859 | 1875/2691/4037 | 59% | 33% | 600 | 46
Les Gens Bons | F8 | 186 | 0% | 5% | 5% | 1991/3348/4906 | 2063/3024/4322 | 71% | 26% | 600 | 28
Les Gens Bons | F1 | 178 | 0% | 3% | 2% | 2033/3551/5274 | 2296/3283/4828 | 66% | 35% | 600 | 27
Les Gens Bons | H13 | 172 | 0% | 12% | 15% | 2294/3267/4370 | 1178/1927/2853 | 65% | 40% | 600 | 24
Les Gens Bons | V* | 159 | 0% | 29% | 0% | 913/1115/1482 | -/-/- | - | - | 600 | 85
Les Gens Bons | H1* | 155 | 0% | 21% | 0% | 2094/3230/4909 | 1127/2233/3454 | 55% | 49% | 600 | 30
Les Gens Bons | F10 | 153 | 0% | 2% | 3% | 2047/4088/6363 | 2577/3638/5039 | 67% | 46% | 600 | 46
Les Gens Bons | H0* | 144 | 0% | 27% | 0% | 2287/3180/4804 | 915/1394/2671 | 70% | 48% | 600 | 36
Les Gens Bons | H3* | 143 | 0% | 27% | 0% | 1898/3372/4986 | 873/1406/2567 | 70% | 48% | 600 | 43
Les Gens Bons | F7 | 142 | 0% | 2% | 2% | 1644/2573/3586 | 2127/3238/4459 | 61% | 41% | 600 | 34
Les Gens Bons | F6 | 140 | 0% | 4% | 10% | 1128/2658/5151 | 2178/3008/4688 | 72% | 45% | 600 | 33
Les Gens Bons | H12 | 139 | 0% | 13% | 9% | 2044/3623/5071 | 984/1781/2711 | 61% | 30% | 600 | 32
Les Gens Bons | H15 | 133 | 0% | 8% | 5% | 2131/2707/4493 | 802/1403/2106 | 71% | 35% | 600 | 48
Les Gens Bons | H14 | 127 | 0% | 17% | 13% | 2314/3732/6000 | 982/1518/2150 | 71% | 29% | 600 | 21
Les Gens Bons | H2* | 126 | 0% | 24% | 0% | 2608/3692/5051 | 923/1276/2509 | 74% | 38% | 600 | 33
Les Gens Bons | F15 | 117 | 0% | 4% | 1% | 1973/2414/3753 | 1889/2626/3745 | 72% | 25% | 600 | 62
Les Gens Bons | H17 | 116 | 0% | 9% | 16% | 1739/2655/4170 | 1203/1712/2523 | 60% | 35% | 600 | 18
Les Gens Bons | F13 | 116 | 0% | 3% | 6% | 2518/3585/4498 | 2267/3257/4562 | 68% | 30% | 600 | 28
Les Gens Bons | H7* | 114 | 0% | 23% | 0% | 1372/2600/3995 | 1106/1612/2972 | 64% | 59% | 600 | 44
Les Gens Bons | H8* | 112 | 0% | 31% | 0% | 1427/2960/3923 | 1031/1475/2635 | 67% | 46% | 600 | 36
Les Gens Bons | H6* | 108 | 0% | 32% | 0% | 1978/2931/4295 | 899/1416/2378 | 72% | 46% | 600 | 32
Les Gens Bons | F11 | 105 | 0% | 7% | 2% | 2213/3379/5337 | 1823/3064/4428 | 71% | 29% | 600 | 22
Les Gens Bons | H5* | 103 | 0% | 28% | 0% | 1506/2598/4029 | 1089/1786/2908 | 52% | 42% | 600 | 44
Les Gens Bons | F12 | 99 | 0% | 3% | 0% | 2323/3767/5322 | 2204/3810/4755 | 74% | 19% | 600 | 39
Les Gens Bons | F4 | 93 | 0% | 5% | 4% | 2231/2885/4212 | 1348/2162/3196 | 65% | 39% | 600 | 14
Les Gens Bons | F14 | 83 | 0% | 4% | 7% | 1518/3254/7254 | 1833/2818/4031 | 47% | 39% | 600 | 24
Les Gens Bons | F9 | 83 | 0% | 8% | 7% | 2102/2994/6116 | 1694/3344/4838 | 62% | 38% | 600 | 26
Les Gens Bons | H10* | 80 | 0% | 31% | 0% | 1502/2638/5138 | 1055/1712/2730 | 80% | 36% | 600 | 39
Les Gens Bons | H4* | 79 | 0% | 32% | 0% | 2873/3940/6830 | 893/1508/2412 | 76% | 37% | 600 | 23
Les Gens Bons | F3* | 79 | 0% | 16% | 0% | 1932/3316/4550 | 1188/2383/3500 | 65% | 39% | 600 | 45
Les Gens Bons | H16 | 75 | 0% | 8% | 7% | 3409/4363/5356 | 840/1336/2506 | 68% | 21% | 600 | 27
Les Gens Bons | H11* | 71 | 0% | 31% | 0% | 2348/4254/5712 | 924/1493/2511 | 75% | 46% | 600 | 19
Les Gens Bons | F5 | 70 | 0% | 1% | 3% | 2019/3200/4466 | 2053/2990/5037 | 64% | 31% | 600 | 22
Les Gens Bons | H13* | 63 | 0% | 22% | 0% | 2636/3177/3696 | 1057/1671/3623 | 51% | 59% | 600 | 31
Les Gens Bons | H9* | 63 | 0% | 33% | 0% | 1885/2774/4924 | 859/1463/2740 | 75% | 43% | 600 | 39
Les Gens Bons | F0* | 63 | 0% | 19% | 0% | 1751/2528/3527 | 1667/2483/3265 | 54% | 52% | 601 | 31
Les Gens Bons | F8* | 59 | 0% | 7% | 0% | 2177/3380/4136 | 2592/3117/3701 | 40% | 50% | 600 | 13
Les Gens Bons | F2* | 52 | 0% | 35% | 0% | 1699/2666/4414 | 1804/2730/4283 | 49% | 57% | 635 | 41
Les Gens Bons | H15* | 48 | 0% | 19% | 0% | 1489/2356/3068 | 588/959/1588 | 74% | 53% | 600 | 56
Les Gens Bons | F1* | 48 | 0% | 10% | 0% | 2599/2985/4506 | 2189/2990/4291 | 49% | 34% | 600 | 25
Les Gens Bons | F6* | 46 | 0% | 30% | 0% | 1301/1656/3017 | 2441/3112/4126 | 41% | 61% | 600 | 37
Les Gens Bons | F17 | 44 | 0% | 0% | 7% | 1896/3430/4700 | 2335/3558/4754 | 69% | 31% | 600 | 17
Les Gens Bons | F15* | 43 | 0% | 14% | 0% | 1795/2223/3039 | 1487/2445/3777 | 45% | 57% | 600 | 60
```

---

# Verification

## Independent re-count in Python from the referee text only (verify.py; no shared code, no positions)

```
group | games | wins | first catch | game with a unit lost by 10 | no catch by 20 | nets/game | nets t1-5/game | net median turn | smoke t1/game | decoys t1-5/game | catches/game | lost/game | catch: prey held | held: 1 turn after net | catcher dashed | loss: held | loss: dashed that turn | nets hit prey | nets hit predator
ATI x iHot | 47 | 66% | 51% | 28% | 17% | 3.23 | 0.30 | 41 | 0.85 | 0.26 | 3.40 | 2.62 | 30% | 67% | 31% | 30% | 14% | 39% | 28%
Les Gens Bons | 311 | 53% | 45% | 53% | 17% | 4.46 | 2.66 | 3 | 0.11 | 2.38 | 3.19 | 2.68 | 39% | 50% | 43% | 34% | 5% | 43% | 8%
Lore | 64 | 44% | 34% | 53% | 27% | 4.62 | 2.28 | 6 | 0.00 | 0.16 | 3.33 | 2.75 | 37% | 49% | 45% | 36% | 7% | 33% | 43%
RNG | 206 | 41% | 36% | 60% | 21% | 4.70 | 2.49 | 5 | 0.00 | 1.20 | 3.19 | 2.83 | 34% | 46% | 47% | 30% | 5% | 36% | 25%
SoloLeveling | 121 | 31% | 43% | 50% | 21% | 4.29 | 2.37 | 4 | 0.45 | 1.74 | 2.88 | 2.95 | 35% | 55% | 41% | 29% | 12% | 37% | 15%
OTHERS-NEW ATI x iHot | 2257 | 33% | 33% | 56% | 27% | 4.27 | 1.97 | 6 | 0.27 | 1.46 | 2.94 | 2.96 | 33% | 48% | 40% | 33% | 8% | 33% | 21%
OTHERS-NEW Les Gens Bons | 2171 | 32% | 33% | 56% | 28% | 4.23 | 1.90 | 7 | 0.30 | 1.37 | 2.93 | 2.97 | 32% | 49% | 40% | 32% | 8% | 32% | 22%
OTHERS-NEW Lore | 2242 | 33% | 33% | 56% | 27% | 4.23 | 1.93 | 7 | 0.29 | 1.47 | 2.94 | 2.96 | 32% | 49% | 39% | 32% | 8% | 33% | 21%
OTHERS-NEW RNG | 2174 | 33% | 33% | 55% | 27% | 4.22 | 1.91 | 7 | 0.30 | 1.45 | 2.94 | 2.96 | 32% | 49% | 39% | 33% | 8% | 33% | 21%
OTHERS-NEW SoloLeveling | 2216 | 33% | 33% | 56% | 28% | 4.25 | 1.91 | 7 | 0.27 | 1.43 | 2.96 | 2.95 | 32% | 49% | 39% | 33% | 8% | 33% | 22%
ALLNEW | 2304 | 33% | 33% | 56% | 27% | 4.25 | 1.94 | - | 0.28 | 1.44 | 2.95 | 2.95 | 32% | 49% | 40% | 32% | 8% | 33% | 21%
ATI x iHot new-folder games 47 wins 31
Les Gens Bons new-folder games 133 wins 70
Lore new-folder games 62 wins 27
RNG new-folder games 130 wins 52
SoloLeveling new-folder games 88 wins 27
files 2176
```

These agree with the tables above (games, wins, first catch, early losses, nets, smoke, decoys, catches, held prey, turns from net to catch, dashing catchers, held losses, net targets).

## Stability: the same script on the games with even ids and on those with odd ids (halves.js)

Columns per line as chosen in halves.js (usually: team all games ; other seats ; team wins ; team non-wins).

```
ATI x iHot | Smoke, turns 1-5 | nearest predator to the cloud centre (median)
    full: 900 (64) ; 1678 (1668)
    even: 900 (29) * ; 1677 (776)
    odd: 899 (35) ; 1681 (892)
ATI x iHot | Smoke, turns 6+ | nearest predator to the cloud centre (median)
    full: 833 (116) ; 1262 (5144)
    even: 797 (57) ; 1262 (2568)
    odd: 836 (59) ; 1263 (2576)
ATI x iHot | Smoke, turns 6+ | thrower inside its own cloud
    full: 100% (117) ; 88% (5171)
    even: 100% (57) ; 88% (2582)
    odd: 100% (60) ; 88% (2589)
ATI x iHot | Nets, turns 6+ | distance thrower-target
    full: 958 / 1234 / 1609 (134) ; 1009 / 1389 / 1789 (4724)
    even: 887 / 1271 / 1617 (65) ; 999 / 1394 / 1797 (2367)
    odd: 1088 / 1215 / 1535 (69) ; 1026 / 1385 / 1785 (2357)
ATI x iHot | Nets, turns 6+ | target could dash
    full: 61% (135) ; 77% (4762)
    even: 65% (66) ; 78% (2381)
    odd: 57% (69) ; 77% (2381)
ATI x iHot | All nets of the game | aimed at predators
    full: 38% (152) ; 28% (9629) ; 46% (103) ; 20% (49)
    even: 43% (75) ; 28% (4856) ; 54% (52) ; 17% (23) *
    odd: 32% (77) ; 28% (4773) ; 37% (51) ; 23% (26) *
ATI x iHot | Net hits of the team on prey | a free hunter within 1200
    full: 68% (60) ; 57% (3171)
    even: 67% (27) * ; 57% (1597)
    odd: 70% (33) ; 58% (1574)
ATI x iHot | Net hits of the team on prey | converted |
    full: 70% (60) ; 67% (3171) ; 80% (35) ; 56% (25) *
    even: 59% (27) * ; 66% (1597) ; 73% (15) * ; 42% (12) *
    odd: 79% (33) ; 67% (1574) ; 85% (20) * ; 69% (13) *
ATI x iHot | Units lost by the team | held by a net
    full: 30% (123) ; 33% (6683) ; 18% (74) ; 49% (49)
    even: 31% (55) ; 32% (3357) ; 18% (34) ; 52% (21) *
    odd: 29% (68) ; 33% (3326) ; 18% (40) ; 46% (28) *
ATI x iHot | Units lost by the team | by turn 10
    full: 15% (123) ; 27% (6683)
    even: 16% (55) ; 27% (3357)
    odd: 13% (68) ; 26% (3326)
ATI x iHot | Nets aimed at units | hit the unit
    full: 51% (171) ; 58% (8949) ; 45% (101) ; 60% (70)
    even: 51% (83) ; 59% (4512) ; 47% (49) ; 56% (34)
    odd: 51% (88) ; 58% (4437) ; 42% (52) ; 64% (36)
ATI x iHot | Nets aimed at units | the unit dashed on that turn
    full: 50% (171) ; 29% (8949)
    even: 54% (83) ; 29% (4512)
    odd: 47% (88) ; 29% (4437)
ATI x iHot | Nets aimed at units | hit when it did not dash
    full: 74% (77) ; 69% (5868)
    even: 81% (37) ; 69% (2942)
    odd: 68% (40) ; 69% (2926)
ATI x iHot | Trigger table, turns 2+: nearest prey | 800-1200
    full: 23% (767) ; 18% (33394) ; 17% (106) ; 8% (4261)
    even: 23% (355) ; 18% (16784) ; 11% (47) ; 7% (2122)
    odd: 23% (412) ; 18% (16610) ; 22% (59) ; 9% (2139)
ATI x iHot | Trigger table, turns 2+: nearest prey | 1200-1600
    full: 19% (680) ; 13% (37345) ; 9% (140) ; 8% (7092)
    even: 20% (310) ; 14% (18529) ; 8% (74) ; 8% (3566)
    odd: 17% (370) ; 13% (18816) ; 9% (66) ; 9% (3526)
ATI x iHot | Trigger table, turn 1: nearest free predator | under 1000
    full: 92% (12) * ; 18% (538) ; 0% (12) * ; 16% (538)
    even: 100% (2) * ; 17% (288) ; 0% (2) * ; 14% (288)
    odd: 90% (10) * ; 20% (250) ; 0% (10) * ; 17% (250)
ATI x iHot | Trigger table, turn 1: nearest free predator | 1000-1500
    full: 73% (15) * ; 14% (937) ; 7% (15) * ; 14% (937)
    even: 67% (6) * ; 13% (418) ; 0% (6) * ; 12% (418)
    odd: 78% (9) * ; 14% (519) ; 11% (9) * ; 16% (519)
ATI x iHot | Trigger table, turn 1: nearest free predator | 1500-2000
    full: 59% (22) * ; 13% (1312) ; 9% (22) * ; 10% (1312)
    even: 86% (7) * ; 13% (663) ; 0% (7) * ; 11% (663)
    odd: 47% (15) * ; 13% (649) ; 13% (15) * ; 9% (649)
ATI x iHot | The same events in wins | lost a unit by turn 10
    full: 28% (47) ; 56% (2257) ; 23% (31) ; 38% (16) *
    even: 24% (25) * ; 56% (1145) ; 24% (17) * ; 25% (8) *
    odd: 32% (22) * ; 56% (1112) ; 21% (14) * ; 50% (8) *
ATI x iHot | The same events in wins | its first event: lost a unit before any catch
    full: 23% (47) ; 45% (2257) ; 13% (31) ; 44% (16) *
    even: 20% (25) * ; 45% (1145) ; 12% (17) * ; 38% (8) *
    odd: 27% (22) * ; 45% (1112) ; 14% (14) * ; 50% (8) *
Les Gens Bons | Turn 1, living units | net thrown when prey within 2000
    full: 68% (365) ; 69% (166) ; 27% (2640)
    even: 70% (181) ; 72% (74) ; 30% (1286)
    odd: 66% (184) ; 67% (92) ; 25% (1354)
Les Gens Bons | Ghost-turns | order aimed within 1000 of a living prey
    full: 48% (19754) ; 56% (8504) ; 25% (146948)
    even: 46% (9441) ; 54% (4003) ; 24% (73452)
    odd: 49% (10313) ; 57% (4501) ; 26% (73496)
Les Gens Bons | Decoys, turns 6+ | decoy walks away from the nearest predator
    full: 82% (592) ; 72% (237) ; 38% (5324)
    even: 84% (257) ; 77% (95) ; 37% (2568)
    odd: 80% (335) ; 69% (142) ; 38% (2756)
Les Gens Bons | The same events in wins | its first event: lost a unit before any catch
    full: 36% (311) ; 45% (2171) ; 18% (165) ; 57% (146)
    even: 34% (152) ; 45% (1109) ; 12% (81) ; 58% (71)
    odd: 39% (159) ; 45% (1062) ; 24% (84) ; 56% (75)
Les Gens Bons | The same events in wins | lost a unit by turn 10
    full: 53% (311) ; 56% (2171) ; 43% (165) ; 64% (146)
    even: 53% (152) ; 56% (1109) ; 42% (81) ; 65% (71)
    odd: 53% (159) ; 56% (1062) ; 44% (84) ; 64% (75)
Les Gens Bons | Nets aimed at units | hit the unit
    full: 56% (1238) ; 58% (8625) ; 53% (616) ; 58% (622)
    even: 58% (586) ; 58% (4372) ; 56% (286) ; 61% (300)
    odd: 53% (652) ; 58% (4253) ; 51% (330) ; 56% (322)
Les Gens Bons | Units lost by the team | held by a net
    full: 34% (835) ; 32% (6442) ; 35% (353) ; 33% (482)
    even: 33% (399) ; 32% (3241) ; 34% (174) ; 33% (225)
    odd: 35% (436) ; 33% (3201) ; 36% (179) ; 33% (257)
Lore | Units lost by the team | at the wall
    full: 42% (176) ; 19% (6637) ; 46% (68) ; 40% (108)
    even: 38% (95) ; 19% (3324) ; 46% (46) ; 31% (49)
    odd: 47% (81) ; 19% (3313) ; 45% (22) * ; 47% (59)
Lore | Units lost by the team | 2 or more hunters within 1800
    full: 42% (176) ; 30% (6637)
    even: 42% (95) ; 31% (3324)
    odd: 42% (81) ; 29% (3313)
Lore | Own units netted | net on a unit of the predator team
    full: 62% (115) ; 25% (3121)
    even: 60% (63) ; 26% (1566)
    odd: 63% (52) ; 24% (1555)
Lore | All nets of the game | aimed at predators
    full: 48% (296) ; 28% (9493)
    even: 53% (155) ; 27% (4784)
    odd: 43% (141) ; 28% (4709)
Lore | Ghost-turns | order aimed within 1000 of a living prey
    full: 48% (3703) ; 26% (151909)
    even: 50% (1869) ; 25% (75746)
    odd: 45% (1834) ; 28% (76163)
RNG | Turn 1, per unit | toward the wall
    full: 41% (883) ; 44% (550) ; 16% (9311)
    even: 39% (476) ; 42% (304) ; 16% (4643)
    odd: 43% (407) ; 48% (246) ; 17% (4668)
RNG | Ghost-turns | order aimed within 1000 of a living predator
    full: 24% (15026) ; 22% (9618) ; 11% (145834)
    even: 24% (8290) ; 23% (5378) ; 11% (72077)
    odd: 22% (6736) ; 20% (4240) ; 11% (73757)
RNG | Catches by the team | catcher dashed, prey held
    full: 61% (227) ; 60% (143) ; 43% (2067)
    even: 61% (125) ; 59% (81) ; 43% (1010)
    odd: 61% (102) ; 61% (62) ; 43% (1057)
RNG | Own units netted | caught within 5 turns
    full: 58% (296) ; 67% (3049) ; 45% (121) ; 68% (175)
    even: 54% (151) ; 67% (1536) ; 41% (63) ; 63% (88)
    odd: 63% (145) ; 68% (1513) ; 48% (58) ; 74% (87)
SoloLeveling | Units lost by the team | three or more dashes already spent
    full: 79% (357) ; 86% (269) ; 59% (6537)
    even: 82% (185) ; 90% (127) ; 59% (3285)
    odd: 76% (172) ; 82% (142) ; 59% (3252)
SoloLeveling | Turn 3, living units | dash (share of free units)
    full: 81% (474) ; 96% (345) ; 34% (8730)
    even: 79% (244) ; 95% (160) ; 34% (4365)
    odd: 83% (230) ; 97% (185) ; 35% (4365)
SoloLeveling | Ghost-turns | order aimed at none of these
    full: 77% (8756) ; 87% (6691) ; 57% (148761)
    even: 73% (4570) ; 88% (3183) ; 57% (74272)
    odd: 81% (4186) ; 87% (3508) ; 56% (74489)
```
